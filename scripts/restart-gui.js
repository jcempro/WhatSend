// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const childProcess = require("child_process");
const path = require("path");
const { failUpdateRestart } = require("../src/update-state");

const ROOT_DIR = path.resolve(__dirname, "..");
const PARENT_WAIT_TIMEOUT_MS = 30000;

function parseArgs(argv) {
  const result = { parentPid: 0, port: 0, sessionId: "", token: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--parent-pid") result.parentPid = Number.parseInt(argv[++index] || "0", 10) || 0;
    else if (value === "--port") result.port = Number.parseInt(argv[++index] || "0", 10) || 0;
    else if (value === "--session") result.sessionId = String(argv[++index] || "");
    else if (value === "--token") result.token = String(argv[++index] || "");
    else throw new Error(`Parâmetro de reinício inválido: ${value}`);
  }
  if (!result.token) throw new Error("Token de retomada ausente.");
  return result;
}

function processExists(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error && error.code === "EPERM";
  }
}

async function waitForParentExit(parentPid, timeoutMs = PARENT_WAIT_TIMEOUT_MS) {
  if (!processExists(parentPid)) return;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!processExists(parentPid)) return;
  }
  throw new Error(`A instância anterior (PID ${parentPid}) não encerrou no prazo.`);
}

function spawnGui(options) {
  const args = [path.join(ROOT_DIR, "main.js"), "--gui"];
  if (options.sessionId) args.push("--session", options.sessionId);
  const child = childProcess.spawn(process.execPath, args, {
    cwd: ROOT_DIR,
    detached: true,
    env: {
      ...process.env,
      GUI_PORT: options.port > 0 ? String(options.port) : process.env.GUI_PORT,
      WHATSEND_UPDATE_RESTART_TOKEN: options.token,
    },
    stdio: "ignore",
    windowsHide: true,
  });
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve(child.pid);
    });
  });
}

async function restartGui(options) {
  await waitForParentExit(options.parentPid);
  return spawnGui(options);
}

if (require.main === module) {
  let parsed = null;
  try {
    parsed = parseArgs(process.argv.slice(2));
    restartGui(parsed).catch((error) => {
      failUpdateRestart(ROOT_DIR, parsed.token, error);
      process.exitCode = 1;
    });
  } catch (error) {
    if (parsed && parsed.token) failUpdateRestart(ROOT_DIR, parsed.token, error);
    console.error(`Reinício da GUI falhou: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { parseArgs, processExists, restartGui, spawnGui, waitForParentExit };
