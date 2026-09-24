// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

process.env.MIN_DELAY_MS = "0";
process.env.MAX_DELAY_MS = "0";
process.env.MESSAGE_SEND_RETRIES = "1";
process.env.MESSAGE_SEND_RETRY_DELAY_MS = "0";
process.env.RECIPIENT_MESSAGE_DELAY_ENABLED = "false";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  applyTemplate,
  buildGuiTemplatePreview,
  containsSenderMarker,
  containsSenderMarkerInBlocks,
  processCampaign,
  renderGuiHtml,
  renderTemplatePreview,
  validateGuiPayload,
  validateRuntimeFiles,
  validateSender,
} = require("../main");
const { buildOfflineBundle } = require("../scripts/build-offline-bundle");

function createFixture(template) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "whatsend-sender-"));
  const logsDir = path.join(root, "logs");
  const paths = {
    auth: path.join(root, ".wwebjs_auth"),
    csv: path.join(root, "clientes.csv"),
    errors: path.join(logsDir, "erros.csv"),
    logsDir,
    mediaCacheDir: path.join(root, "media-cache"),
    messageCache: path.join(logsDir, "mensagens.json"),
    root,
    sent: path.join(logsDir, "enviados.csv"),
    sessionsFile: path.join(root, ".wwebjs_sessions.json"),
    skipped: path.join(logsDir, "pulos.csv"),
    template: path.join(root, "texto.md"),
    warnings: path.join(logsDir, "avisos.csv"),
  };
  fs.writeFileSync(paths.csv, "nome,telefone,remetente\nMaria,11999990000,CSV\n", "utf8");
  fs.writeFileSync(paths.template, template, "utf8");
  return paths;
}

function createClient(calls) {
  return {
    async getNumberId(phone) {
      calls.push(["getNumberId", phone]);
      return { _serialized: `${phone}@c.us` };
    },
    async sendMessage(to, message) {
      calls.push(["sendMessage", to, message]);
    },
  };
}

test("remetente valida Unicode, preserva espaços internos e normaliza em pt-BR", () => {
  assert.deepEqual(validateSender("  jOÃO  ação  "), {
    error: "",
    normalized: "João  Ação",
    rendered: "*_João  Ação:_*",
    valid: true,
  });
  for (const value of ["", "   ", "Empresa 2", "Ana-Maria", "Ana\tMaria", "@Empresa"]) {
    assert.equal(validateSender(value).valid, false, value);
  }
});

test("remetente é reservado, case-insensitive e controla adjacência Unicode", () => {
  const data = { remetente: "Valor CSV" };
  const options = { reserved: { remetente: "jEAn carLO" } };
  assert.equal(applyTemplate("${ReMeTeNtE}que bom", data, options), "*_Jean Carlo:_* que bom");
  assert.equal(applyTemplate("${remetente}7 dias", data, options), "*_Jean Carlo:_* 7 dias");
  assert.equal(applyTemplate("${remetente}Ágil", data, options), "*_Jean Carlo:_* Ágil");
  assert.equal(applyTemplate("${remetente}, tudo bem?", data, options), "*_Jean Carlo:_*, tudo bem?");
  assert.equal(applyTemplate("${remetente} já", data, options), "*_Jean Carlo:_* já");
  assert.equal(applyTemplate("${remetente}", data), "");
});

test("preview usa remetente real, exemplo fictício, resultado determinístico e literal seguro", () => {
  assert.equal(
    renderTemplatePreview("${remetente}Olá ${nome}; ${10 / 2}; $diatarde$", {}, {
      now: new Date("2026-09-23T14:00:00-03:00"),
      sender: "empresa exemplo",
    }),
    "*_Empresa Exemplo:_* Olá ${nome}; 5; boa tarde",
  );
  assert.equal(
    renderTemplatePreview("${remetente}Olá ${desconhecido}", {}, { sender: "inválido 2" }),
    "*_Sicrano:_* Olá ${desconhecido}",
  );
});

test("GUI valida condicionalmente e o preview materializa remetente sem alterar o modelo", () => {
  const basePaths = { template: path.join(__dirname, "check-texto.md") };
  assert.equal(validateGuiPayload({ templateText: "Olá ${nome}." }, basePaths).ok, true);
  assert.equal(validateGuiPayload({ templateText: "${remetente}Olá." }, basePaths).ok, false);
  assert.equal(validateGuiPayload({ sender: "Empresa Exemplo", templateText: "${REMETENTE}Olá." }, basePaths).ok, true);

  const source = "${remetente}Olá ${nome}.";
  const preview = buildGuiTemplatePreview({ sender: "jEAn carLO", templateText: source }, basePaths);
  assert.equal(preview.ok, true);
  assert.equal(preview.variants[0].postings[0].items[0].value, "*_Jean Carlo:_* Olá ${nome}.");
  assert.equal(source, "${remetente}Olá ${nome}.");
});

test("CLI bloqueia remetente na pré-validação e a GUI autoriza valor válido", () => {
  const paths = createFixture("${remetente}Olá ${nome}.");
  assert.throws(
    () => validateRuntimeFiles(paths, { checkBrowser: false }),
    /disponível somente pela GUI Node/u,
  );
  assert.doesNotThrow(() => validateRuntimeFiles(paths, {
    checkBrowser: false,
    gui: true,
    sender: "Empresa Exemplo",
  }));
});

for (const interleavingEnabled of [false, true]) {
  test(`campanha ${interleavingEnabled ? "intercalada" : "sequencial"} materializa remetente no envio`, async () => {
    const paths = createFixture("${remetente}Olá ${nome}.");
    const calls = [];
    await processCampaign(createClient(calls), paths, {
      gui: true,
      interleavingEnabled,
      messageDelayEnabled: false,
      sender: "empresa exemplo",
    });
    assert.deepEqual(calls, [
      ["getNumberId", "5511999990000"],
      ["sendMessage", "5511999990000@c.us", "*_Empresa Exemplo:_* Olá Maria."],
    ]);
  });
}

test("GUI reage pelo estado dos blocos e toolbar comum; offline não projeta o campo Node", () => {
  const html = renderGuiHtml();
  assert.match(html, /id="insertSenderButton"[\s\S]*data-insert-marker="\$\{remetente\}"/u);
  assert.match(html, /data-icon-key="lucide:signature"/u);
  assert.match(html, /WhatSendTemplateContract\.containsSenderMarkerInBlocks\(templateBlocks\)/u);
  assert.match(html, /senderInput\.required = required/u);
  assert.match(html, /senderFieldBox\.hidden = !required/u);

  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "whatsend-offline-sender-"));
  const bundle = fs.readFileSync(buildOfflineBundle(outputDir).outputPath, "utf8");
  assert.doesNotMatch(bundle, /id="senderFieldBox"/u);
  assert.match(bundle, /SENDER_PREVIEW_EXAMPLE/u);
  assert.match(bundle, /id="insertSenderButton"/u);
  assert.doesNotMatch(bundle, /\[Erro: /u);
  assert.equal(containsSenderMarker("${REMETENTE}"), true);
  assert.equal(containsSenderMarkerInBlocks(["sem marcador", "${REMETENTE}"]), true);
  assert.equal(containsSenderMarkerInBlocks(["sem marcador", "outro modelo"]), false);
});
