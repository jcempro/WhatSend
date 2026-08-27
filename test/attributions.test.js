// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  SITE_FILES,
  buildPages,
  collectAttributions,
  renderAttributionsPage,
  validateAttributionsData,
  validateBuiltPages,
} = require("../src/site/attributions");
const { renderThirdPartyNotices } = require("../scripts/build-dist");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT_DIR, "src", "site", "attributions.json");

test("inventário legal é integral, reprodutível e contém somente obrigações materiais", () => {
  const versioned = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const collected = collectAttributions({ rootDir: ROOT_DIR });

  assert.deepEqual(collected, versioned);
  assert.equal(validateAttributionsData(versioned), true);
  assert.equal(versioned.summary.total, versioned.records.length);
  assert.equal(versioned.summary.runtime + versioned.summary.embedded, versioned.summary.total);
  assert.equal(versioned.summary.embedded, 5);
  assert.ok(versioned.summary.runtime > 0);
  assert.equal(new Set(versioned.records.map((record) => record.id)).size, versioned.records.length);
  assert.equal(versioned.records.some((record) => ["0BSD", "CC0-1.0", "Unlicense"].includes(record.license)), false);

  const embeddedNames = versioned.records
    .filter((record) => record.scope === "embedded")
    .map((record) => record.name)
    .sort();
  assert.deepEqual(embeddedNames, [
    "Font Awesome Free — ícones SVG utilizados",
    "Game Icons — upgrade",
    "Lucide Icons — ícones SVG utilizados",
    "Streamline Sharp — download-box-1-solid",
    "Tabulator",
  ]);
});

test("página estática é acessível, responsiva, sem impressão específica e sem dependência externa", () => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const html = renderAttributionsPage(data);

  assert.match(html, /<html lang="pt-BR">/u);
  assert.match(html, /<main id="conteudo">/u);
  assert.match(html, /<h1 id="titulo">Atribuições obrigatórias<\/h1>/u);
  assert.match(html, /<caption>/u);
  assert.match(html, /@media\(max-width:900px\)/u);
  assert.doesNotMatch(html, /@media\s+print|@page|\bA4\b/iu);
  assert.doesNotMatch(html, /<script\b/iu);
  assert.doesNotMatch(html, /<(?:link|script|img)\b[^>]*(?:src|href)="https?:/iu);
  assert.equal((html.match(/class="notice"/gu) || []).length, data.records.length);
});

test("build do Pages produz somente a allowlist manifestada e com integridade", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "whatsend-pages-"));
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

  try {
    buildPages({ data, outputDir, rootDir: ROOT_DIR });
    assert.equal(validateBuiltPages({ data, outputDir }), true);
    const files = listFiles(outputDir)
      .map((filePath) => path.relative(outputDir, filePath).split(path.sep).join("/"))
      .sort();
    assert.deepEqual(files, SITE_FILES);
    assert.match(fs.readFileSync(path.join(outputDir, "index.html"), "utf8"), /\.\/atribuicoes\//u);
  } finally {
    fs.rmSync(outputDir, { force: true, recursive: true });
  }
});

test("aviso do artefato distribuível deriva integralmente do mesmo inventário", () => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const notice = renderThirdPartyNotices(data);

  assert.match(notice, /^THIRD-PARTY NOTICES — WhatSend/u);
  for (const record of data.records) {
    assert.match(notice, new RegExp(`Identificador: ${escapeRegExp(record.id)}`, "u"));
    assert.ok(notice.includes(record.notice));
  }
});

test("workflow valida o mesmo artefato em PR e implanta exclusivamente main", () => {
  const workflow = fs.readFileSync(path.join(ROOT_DIR, ".github", "workflows", "pages.yml"), "utf8");
  assert.match(workflow, /pull_request:/u);
  assert.match(workflow, /npm run attributions:check/u);
  assert.match(workflow, /npm run build:pages/u);
  assert.match(workflow, /npm run validate:pages/u);
  assert.match(workflow, /actions\/configure-pages@v6/u);
  assert.match(workflow, /actions\/upload-pages-artifact@v5/u);
  assert.match(workflow, /actions\/deploy-pages@v5/u);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/u);
  assert.match(workflow, /pages: write/u);
  assert.match(workflow, /id-token: write/u);
  assert.match(workflow, /name: github-pages/u);
});

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
