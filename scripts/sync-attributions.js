// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const fs = require("node:fs");
const path = require("node:path");

const {
  collectAttributions,
  validateAttributionsData,
} = require("../src/attributions");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT_DIR, "src", "attributions.json");

function serialize(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function syncAttributions({ check = false } = {}) {
  const expected = serialize(collectAttributions({ rootDir: ROOT_DIR }));
  const current = fs.existsSync(DATA_PATH) ? fs.readFileSync(DATA_PATH, "utf8") : "";

  if (check) {
    if (current !== expected) throw new Error("Inventário de atribuições desatualizado. Execute npm run attributions:sync.");
    console.log("ATTRIBUTIONS_OK");
    return JSON.parse(current);
  }

  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  if (current !== expected) fs.writeFileSync(DATA_PATH, expected, "utf8");
  console.log(`Inventário sincronizado: ${JSON.parse(expected).records.length} registros.`);
  return JSON.parse(expected);
}

function validate() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  validateAttributionsData(data);
  console.log(`ATTRIBUTIONS_VALIDATE_OK ${data.records.length} atribuições.`);
}

function main(argv = process.argv.slice(2)) {
  const command = argv[0] || "check";
  if (command === "sync") return syncAttributions();
  if (command === "check") return syncAttributions({ check: true });
  if (command === "validate") return validate();
  throw new Error(`Comando de atribuições desconhecido: ${command}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Falha no fluxo de atribuições: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  DATA_PATH,
  main,
  serialize,
  syncAttributions,
  validate,
};
