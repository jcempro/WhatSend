// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const CAMPAIGN_STATE_SCHEMA = 1;
const ACTIVE_CAMPAIGN_STATES = new Set([
  "preparando",
  "validando",
  "executando",
  "interrupcao_solicitada",
  "interrompendo",
]);
const TERMINAL_CAMPAIGN_STATES = new Set(["concluido", "interrompido", "falhou"]);
const CAMPAIGN_TRANSITIONS = Object.freeze({
  ocioso: new Set(["preparando"]),
  preparando: new Set(["validando", "interrupcao_solicitada", "falhou"]),
  validando: new Set(["executando", "interrupcao_solicitada", "falhou"]),
  executando: new Set(["interrupcao_solicitada", "concluido", "falhou"]),
  interrupcao_solicitada: new Set(["interrompendo", "interrompido", "concluido", "falhou"]),
  interrompendo: new Set(["interrompido", "concluido", "falhou"]),
  interrompido: new Set(),
  concluido: new Set(),
  falhou: new Set(),
});

function campaignsDirectory(rootDir) {
  return path.join(path.resolve(rootDir), ".runtime", "campaigns");
}

function normalizeSessionId(value) {
  return String(value || "default")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/gu, "-")
    .replace(/^-+|-+$/gu, "") || "default";
}

function campaignStatePath(rootDir, sessionId) {
  return path.join(campaignsDirectory(rootDir), `${normalizeSessionId(sessionId)}.json`);
}

function activeCampaignLockPath(rootDir) {
  return path.join(campaignsDirectory(rootDir), "active.lock.json");
}

function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    fs.renameSync(temporary, filePath);
  } finally {
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
  }
}

function normalizeCampaignState(value) {
  if (!value || value.schema !== CAMPAIGN_STATE_SCHEMA || !value.id || !value.sessionId) return null;
  if (!Object.prototype.hasOwnProperty.call(CAMPAIGN_TRANSITIONS, value.status)) return null;
  return {
    ...value,
    children: Array.isArray(value.children) ? value.children : [],
    interruptRequested: Boolean(value.interruptRequested),
    progress: {
      current: 0,
      percent: 0,
      total: 0,
      ...(value.progress || {}),
    },
  };
}

function readCampaignState(rootDir, sessionId) {
  return normalizeCampaignState(readJsonFile(campaignStatePath(rootDir, sessionId)));
}

function processExists(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return Boolean(error && error.code === "EPERM");
  }
}

function releaseActiveLock(rootDir, operationId) {
  const lockPath = activeCampaignLockPath(rootDir);
  const lock = readJsonFile(lockPath);
  if (!lock || lock.operationId === operationId) {
    fs.rmSync(lockPath, { force: true });
  }
}

function reconcileCampaignState(rootDir, sessionId) {
  const current = readCampaignState(rootDir, sessionId);
  if (!current || !ACTIVE_CAMPAIGN_STATES.has(current.status)) return current;
  if (processExists(Number(current.owner && current.owner.pid))) return current;
  const reconciled = {
    ...current,
    active: false,
    completedAt: new Date().toISOString(),
    error: "Processo proprietário não está ativo; campanha reconciliada como interrompida.",
    result: "interrompida_por_reinicio",
    status: "interrompido",
    updatedAt: new Date().toISOString(),
  };
  writeJsonAtomic(campaignStatePath(rootDir, sessionId), reconciled);
  releaseActiveLock(rootDir, current.id);
  return reconciled;
}

function acquireCampaign(rootDir, sessionId, idempotencyKey = "") {
  const normalizedSessionId = normalizeSessionId(sessionId);
  const lockPath = activeCampaignLockPath(rootDir);
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  const existingLock = readJsonFile(lockPath);
  if (existingLock) {
    const existing = reconcileCampaignState(rootDir, existingLock.sessionId);
    if (existing && ACTIVE_CAMPAIGN_STATES.has(existing.status)) {
      if (idempotencyKey && existing.idempotencyKey === idempotencyKey) {
        return { created: false, state: existing };
      }
      throw new Error(`Campanha ${existing.id} já está ativa na sessão ${existing.sessionId}.`);
    }
    fs.rmSync(lockPath, { force: true });
  }

  const now = new Date().toISOString();
  const state = {
    schema: CAMPAIGN_STATE_SCHEMA,
    id: `${now.replace(/[:.]/gu, "-")}-${crypto.randomBytes(6).toString("hex")}`,
    idempotencyKey: String(idempotencyKey || ""),
    sessionId: normalizedSessionId,
    status: "preparando",
    active: true,
    owner: { pid: process.pid, type: "process" },
    children: [],
    startedAt: now,
    updatedAt: now,
    completedAt: "",
    interruptRequested: false,
    interruptRequestedAt: "",
    progress: { current: 0, percent: 0, total: 0 },
    result: "",
    error: "",
  };
  const lock = { operationId: state.id, ownerPid: process.pid, sessionId: normalizedSessionId };
  let handle;
  try {
    handle = fs.openSync(lockPath, "wx");
    fs.writeFileSync(handle, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
  } catch (error) {
    if (error && error.code === "EEXIST") {
      return acquireCampaign(rootDir, normalizedSessionId, idempotencyKey);
    }
    throw error;
  } finally {
    if (handle !== undefined) fs.closeSync(handle);
  }
  writeJsonAtomic(campaignStatePath(rootDir, normalizedSessionId), state);
  return { created: true, state };
}

function transitionCampaign(rootDir, state, nextStatus, changes = {}) {
  const current = normalizeCampaignState(state);
  if (!current) throw new Error("Estado de campanha inválido.");
  if (current.status === nextStatus) return current;
  if (!CAMPAIGN_TRANSITIONS[current.status].has(nextStatus)) {
    throw new Error(`Transição de campanha inválida: ${current.status} -> ${nextStatus}.`);
  }
  const terminal = TERMINAL_CAMPAIGN_STATES.has(nextStatus);
  const next = {
    ...current,
    ...changes,
    active: !terminal,
    completedAt: terminal ? changes.completedAt || new Date().toISOString() : "",
    owner: { ...current.owner, ...(changes.owner || {}) },
    progress: { ...current.progress, ...(changes.progress || {}) },
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
  writeJsonAtomic(campaignStatePath(rootDir, current.sessionId), next);
  if (terminal) releaseActiveLock(rootDir, current.id);
  return next;
}

function updateCampaignProgress(rootDir, state, progress = {}) {
  const current = normalizeCampaignState(state);
  if (!current || TERMINAL_CAMPAIGN_STATES.has(current.status)) return current;
  const total = Math.max(0, Number(progress.total ?? current.progress.total) || 0);
  const currentValue = Math.max(0, Math.min(Number(progress.current ?? current.progress.current) || 0, total || Infinity));
  const next = {
    ...current,
    progress: {
      current: currentValue,
      percent: total > 0 ? Math.round((currentValue / total) * 1000) / 10 : 0,
      total,
    },
    updatedAt: new Date().toISOString(),
  };
  writeJsonAtomic(campaignStatePath(rootDir, current.sessionId), next);
  return next;
}

function requestCampaignInterrupt(rootDir, sessionId) {
  const current = reconcileCampaignState(rootDir, sessionId);
  if (!current) throw new Error("Nenhuma campanha foi registrada para esta sessão.");
  if (TERMINAL_CAMPAIGN_STATES.has(current.status)) return current;
  if (["interrupcao_solicitada", "interrompendo"].includes(current.status)) return current;
  return transitionCampaign(rootDir, current, "interrupcao_solicitada", {
    interruptRequested: true,
    interruptRequestedAt: new Date().toISOString(),
  });
}

function shouldInterruptCampaign(rootDir, state) {
  const current = readCampaignState(rootDir, state.sessionId);
  return Boolean(current && current.id === state.id && current.interruptRequested);
}

module.exports = {
  ACTIVE_CAMPAIGN_STATES,
  CAMPAIGN_STATE_SCHEMA,
  TERMINAL_CAMPAIGN_STATES,
  acquireCampaign,
  activeCampaignLockPath,
  campaignStatePath,
  normalizeCampaignState,
  readCampaignState,
  reconcileCampaignState,
  requestCampaignInterrupt,
  shouldInterruptCampaign,
  transitionCampaign,
  updateCampaignProgress,
};
