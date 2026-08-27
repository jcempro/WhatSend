// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const fs = require("node:fs");
const path = require("node:path");

const {
  buildPages,
  collectAttributions,
  validateAttributionsData,
  validateBuiltPages,
} = require("../src/site/attributions");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT_DIR, "src", "site", "attributions.json");
const OUTPUT_DIR = path.join(ROOT_DIR, "site");

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

function build() {
  const data = syncAttributions({ check: true });
  const manifest = buildPages({ data, outputDir: OUTPUT_DIR, rootDir: ROOT_DIR });
  console.log(`PAGES_BUILD_OK ${manifest.files.length} arquivos manifestados.`);
}

function validate() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  validateAttributionsData(data);
  validateBuiltPages({ data, outputDir: OUTPUT_DIR });
  console.log(`PAGES_VALIDATE_OK ${data.records.length} atribuições.`);
}

function main(argv = process.argv.slice(2)) {
  const command = argv[0] || "build";
  if (command === "sync") return syncAttributions();
  if (command === "check") return syncAttributions({ check: true });
  if (command === "build") return build();
  if (command === "validate") return validate();
  throw new Error(`Comando Pages desconhecido: ${command}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Falha no fluxo Pages: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  DATA_PATH,
  OUTPUT_DIR,
  build,
  main,
  serialize,
  syncAttributions,
  validate,
};
