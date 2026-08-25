// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const UPDATE_STATE_SCHEMA = 1;
const UPDATE_STATE_FILE_NAME = "update-state.json";
const UPDATE_STATE_MARKER = "WHAT_SEND_UPDATE_STATE ";
const TERMINAL_UPDATE_STATUSES = new Set(["concluida", "falhou", "revertida", "sem_alteracao"]);

function updateStatePath(rootDir) {
  return path.join(path.resolve(rootDir), ".runtime", "updates", UPDATE_STATE_FILE_NAME);
}

function createUpdateOperation(action) {
  const now = new Date().toISOString();
  return {
    schema: UPDATE_STATE_SCHEMA,
    id: `${now.replace(/[:.]/gu, "-")}-${crypto.randomBytes(6).toString("hex")}`,
    action: String(action || ""),
    active: true,
    completedAt: "",
    error: "",
    phase: "preparando",
    recovery: "",
    restart: {
      attempts: 0,
      completedAt: "",
      error: "",
      required: false,
      startedAt: "",
      status: "nao_requerido",
      token: "",
    },
    result: "",
    rollback: {
      attempted: false,
      error: "",
      succeeded: false,
    },
    startedAt: now,
    status: "preparando",
    updatedAt: now,
  };
}

function normalizeUpdateState(value) {
  if (!value || value.schema !== UPDATE_STATE_SCHEMA || typeof value.id !== "string") {
    return null;
  }
  return {
    ...value,
    active: Boolean(value.active),
    restart: {
      attempts: 0,
      completedAt: "",
      error: "",
      required: false,
      startedAt: "",
      status: "nao_requerido",
      token: "",
      ...(value.restart || {}),
    },
    rollback: {
      attempted: false,
      error: "",
      succeeded: false,
      ...(value.rollback || {}),
    },
  };
}

function readUpdateState(rootDir) {
  const filePath = updateStatePath(rootDir);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  try {
    return normalizeUpdateState(JSON.parse(fs.readFileSync(filePath, "utf8")));
  } catch {
    return null;
  }
}

function writeUpdateState(rootDir, state) {
  const normalized = normalizeUpdateState(state);
  if (!normalized) throw new Error("Estado de atualização inválido.");
  const filePath = updateStatePath(rootDir);
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
  const temporary = path.join(directory, `.${UPDATE_STATE_FILE_NAME}.${process.pid}.${Date.now()}.tmp`);
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
    fs.renameSync(temporary, filePath);
  } finally {
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
  }
  return normalized;
}

function transitionUpdateState(rootDir, state, changes = {}, options = {}) {
  const current = normalizeUpdateState(state);
  if (!current) throw new Error("Transição de atualização sem estado válido.");
  if (TERMINAL_UPDATE_STATUSES.has(current.status) && !options.allowTerminalMetadata) {
    throw new Error(`Atualização ${current.id} já atingiu estado terminal ${current.status}.`);
  }
  const nextStatus = String(changes.status || current.status);
  const terminal = TERMINAL_UPDATE_STATUSES.has(nextStatus);
  const next = {
    ...current,
    ...changes,
    active: terminal ? false : changes.active === undefined ? current.active : Boolean(changes.active),
    completedAt: terminal ? changes.completedAt || current.completedAt || new Date().toISOString() : "",
    restart: { ...current.restart, ...(changes.restart || {}) },
    rollback: { ...current.rollback, ...(changes.rollback || {}) },
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
  writeUpdateState(rootDir, next);
  if (typeof options.onState === "function") options.onState(next);
  return next;
}

function prepareUpdateRestart(rootDir, state) {
  const current = normalizeUpdateState(state);
  if (!current || !TERMINAL_UPDATE_STATUSES.has(current.status)) {
    throw new Error("Reinício exige resultado terminal persistido.");
  }
  if (!current.restart.required) return current;
  if (["reiniciando", "concluido"].includes(current.restart.status)) return current;
  return transitionUpdateState(rootDir, current, {
    restart: {
      attempts: Number(current.restart.attempts || 0) + 1,
      error: "",
      startedAt: new Date().toISOString(),
      status: "reiniciando",
      token: crypto.randomBytes(18).toString("hex"),
    },
  }, { allowTerminalMetadata: true });
}

function completeUpdateRestart(rootDir, token) {
  const current = readUpdateState(rootDir);
  if (!current || !current.restart.required || current.restart.status !== "reiniciando") return current;
  if (!token || token !== current.restart.token) return current;
  return transitionUpdateState(rootDir, current, {
    restart: {
      completedAt: new Date().toISOString(),
      error: "",
      status: "concluido",
      token: "",
    },
  }, { allowTerminalMetadata: true });
}

function failUpdateRestart(rootDir, token, error) {
  const current = readUpdateState(rootDir);
  if (!current || !current.restart.required || current.restart.status === "concluido") return current;
  if (current.restart.token && token && token !== current.restart.token) return current;
  return transitionUpdateState(rootDir, current, {
    restart: {
      error: error && error.message ? error.message : String(error || "Falha desconhecida."),
      status: "falhou",
      token: "",
    },
  }, { allowTerminalMetadata: true });
}

function emitUpdateState(state, stream = process.stdout) {
  stream.write(`${UPDATE_STATE_MARKER}${JSON.stringify(state)}\n`);
}

module.exports = {
  TERMINAL_UPDATE_STATUSES,
  UPDATE_STATE_FILE_NAME,
  UPDATE_STATE_MARKER,
  completeUpdateRestart,
  createUpdateOperation,
  emitUpdateState,
  failUpdateRestart,
  normalizeUpdateState,
  prepareUpdateRestart,
  readUpdateState,
  transitionUpdateState,
  updateStatePath,
  writeUpdateState,
};
