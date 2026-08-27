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
  GUI_ICON_DEFINITIONS,
  getGuiIconManifest,
  renderGuiIcon,
  resolveGuiIconKey,
} = require("../src/gui-icons");
const { buildOfflineBundle } = require("../scripts/build-offline-bundle");
const { renderGuiHtml } = require("../src/gui");

test("registro multiprovedor resolve somente namespaces e aliases explícitos", () => {
  assert.equal(resolveGuiIconKey("fontawesome:solid:file-arrow-down"), "fontawesome:solid:file-arrow-down");
  assert.equal(resolveGuiIconKey("lucide:variable"), "lucide:variable");
  assert.equal(resolveGuiIconKey("iconify:game-icons:upgrade"), "iconify:game-icons:upgrade");
  assert.equal(resolveGuiIconKey("f56d"), "fontawesome:solid:file-arrow-down");
  assert.throws(() => resolveGuiIconKey("f0ed"), /não configurado/u);
  assert.throws(() => resolveGuiIconKey("upgrade"), /não configurado/u);
  assert.throws(() => resolveGuiIconKey("iconify:streamline-sharp:upgrade"), /não configurado/u);
});

test("catálogo registra provedores, licenças, consumidores e símbolos qualificados", () => {
  const manifest = getGuiIconManifest();
  assert.equal(Object.keys(manifest).length, Object.keys(GUI_ICON_DEFINITIONS).length);
  assert.equal(manifest["iconify:game-icons:upgrade"].license, "CC-BY-3.0");
  assert.equal(manifest["iconify:streamline-sharp:download-box-1-solid"].license, "CC-BY-4.0");
  assert.equal(manifest["lucide:variable"].license, "ISC");
  assert.equal(manifest["fontawesome:solid:file"].provider, "fontawesome");
  for (const [key, definition] of Object.entries(GUI_ICON_DEFINITIONS)) {
    assert.match(key, /^(?:fontawesome:[a-z]+|lucide|iconify:[a-z0-9-]+):[a-z0-9-]+$/u);
    assert.ok(definition.consumers.length > 0, key);
    assert.ok(definition.license, key);
    assert.ok(definition.version, key);
    assert.doesNotMatch(definition.body, /<(?:script|style|foreignObject|image|use)\b|\bon\w+\s*=|(?:href|src)\s*=/iu, key);
    assert.match(renderGuiIcon(key), new RegExp(`data-icon-key="${key}"`, "u"));
  }
});

test("bundle offline omite estado executor e padroniza a toolbar CSV", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "whatsend-icons-"));
  try {
    const result = buildOfflineBundle(directory);
    const html = fs.readFileSync(result.outputPath, "utf8");
    assert.doesNotMatch(html, /id="statusPill"|id="updateButton"|id="saveOfflineButton"|autenticando/iu);
    assert.match(html, /id="guiIconManifest"/u);
    assert.match(html, /id="guiTooltip" class="gui-tooltip" role="tooltip" hidden/u);
    assert.match(html, /function showGuiTooltip\(target\)/u);
    assert.match(html, /class="wa-toolbar wa-toolbar-document" aria-label="Ferramentas de documento e persistência"/u);
    assert.match(html, /class="wa-toolbar wa-toolbar-composition" aria-label="Ferramentas de composição e expressões"/u);
    assert.match(html, /class="wa-toolbar wa-toolbar-document csv-toolbar" aria-label="Ferramentas do editor CSV"/u);
    assert.match(html, /id="openCsv" class="visually-hidden-field"/u);
    assert.match(html, /id="openCsvButton"[\s\S]*data-icon-key="fontawesome:solid:file-arrow-up"/u);
    assert.match(html, /id="renameColumn"[\s\S]*data-icon-key="lucide:columns-3-cog"/u);
    assert.doesNotMatch(html, /<label class="file-button">Abrir \.csv/u);
    assert.doesNotMatch(html, /<button[^>]*>Salvar \.csv<\/button>/u);
    const usedKeys = new Set([...`${renderGuiHtml()}${html}`.matchAll(/<svg\b[^>]*data-icon-key="([^"]+)"/gu)].map((match) => match[1]));
    assert.deepEqual([...usedKeys].sort(), Object.keys(GUI_ICON_DEFINITIONS).sort());
  } finally {
    fs.rmSync(directory, { force: true, recursive: true });
  }
});
