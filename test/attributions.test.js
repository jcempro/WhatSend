// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  collectAttributions,
  renderAttributionsPage,
  validateAttributionsData,
} = require("../src/attributions");
const { createGuiHttpServer, createGuiState } = require("../src/gui");
const { renderThirdPartyNotices } = require("../scripts/build-dist");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT_DIR, "src", "attributions.json");

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

test("página local é acessível, responsiva, sem impressão específica e sem dependência externa", () => {
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
  assert.match(html, /href="\/brand\/favicon\.svg"/u);
  assert.equal((html.match(/class="notice"/gu) || []).length, data.records.length);
});

test("servidor local atende as duas rotas de atribuições", async () => {
  const server = createGuiHttpServer(null, {}, {}, createGuiState({}));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;

  try {
    for (const route of ["/atribuicoes", "/atribuicoes/"]) {
      const response = await fetch(`http://127.0.0.1:${port}${route}`);
      const html = await response.text();
      assert.equal(response.status, 200);
      assert.match(html, /Atribuições obrigatórias/u);
    }
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
