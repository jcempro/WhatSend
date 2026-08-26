// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const assert = require("node:assert/strict");
const test = require("node:test");

const { evaluateExpression } = require("../src/expression");
const { applyTemplate } = require("../src/template");
const { COMMON_EDITOR_ACTIONS } = require("../src/editor-actions");
const { renderGuiHtml } = require("../src/gui");
const { buildCanonicalEditorProjection, buildOfflineBundle } = require("../scripts/build-offline-bundle");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

test("funções condicionais, lógicas e matemáticas preservam caixa e preguiça", () => {
  assert.equal(evaluateExpression("$.IF(true, 7, 1/0)").value, 7);
  assert.equal(evaluateExpression("$.and(true, $.xor(false, true))").value, true);
  assert.equal(evaluateExpression("$.or(false, true)").value, true);
  assert.equal(evaluateExpression("$.min(8,2,5)").value, 2);
  assert.equal(evaluateExpression("$.max(8,2,5)").value, 8);
  assert.equal(evaluateExpression("$.media(2,4,6)").value, 4);
  assert.equal(evaluateExpression("2**3%3").value, 2);
  assert.equal(evaluateExpression("if (1=1) { 'sim' } else { 1/0 }").value, "sim");
});

test("emconversa e ultimaconversa usam contexto imutável reservado", () => {
  const conversation = {
    capturedAt: "2026-08-26T12:00:00.000Z",
    lastMessageAt: "2026-08-26T11:50:00.000Z",
  };
  const rendered = applyTemplate(
    "${ultimaconversa}|${$.emconversa()}|${$.emconversa(5)}",
    { ultimaconversa: "não deve sobrescrever" },
    {
      conversation,
      recentConversationMinutes: 15,
      reserved: { ultimaconversa: conversation.lastMessageAt },
    },
  );
  assert.equal(rendered, "2026-08-26T11:50:00.000Z|true|false");
});

test("aritmética rejeita zero e resultado não finito", () => {
  assert.throws(() => evaluateExpression("1/0"), /Divisão por zero/u);
  assert.throws(() => evaluateExpression("1%0"), /Módulo por zero/u);
  assert.throws(() => evaluateExpression("9999**9999"), /não finito/u);
});

test("GUI e bundle offline projetam as mesmas ações comuns da fonte canônica", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "whatsend-editor-actions-"));
  try {
    const gui = renderGuiHtml();
    const built = buildOfflineBundle(directory);
    const offline = fs.readFileSync(built.outputPath, "utf8");
    for (const action of COMMON_EDITOR_ACTIONS) {
      assert.match(gui, new RegExp(`data-editor-action="${action.id}"`, "u"));
      assert.match(offline, new RegExp(`data-editor-action="${action.id}"`, "u"));
    }
    assert.doesNotMatch(offline, /id="saveOfflineButton"/u);
    assert.match(offline, /WhatSendExpression/u);
  } finally {
    fs.rmSync(directory, { force: true, recursive: true });
  }
});

test("bundle offline projeta literalmente o painel e o CSS canônicos da GUI", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "whatsend-canonical-editor-"));
  try {
    const result = buildOfflineBundle(directory);
    const html = fs.readFileSync(result.outputPath, "utf8");
    const canonical = buildCanonicalEditorProjection();
    assert.ok(html.includes(canonical.panel));
    assert.ok(html.includes(canonical.css));
    assert.equal((html.match(/class="full-card template-card"/gu) || []).length, 1);
  } finally {
    fs.rmSync(directory, { force: true, recursive: true });
  }
});
