// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { buildOfflineBundle, OFFLINE_BUNDLE_NAME } = require("../scripts/build-offline-bundle");
const { parseCsv, serializeCsv, validateHeaders, validateRecords } = require("../src/csv-contract");
const { loadCsv } = require("../src/data");
const { renderGuiHtml, validateGuiPayload } = require("../src/gui");
const { analyzeTemplate } = require("../src/template-advisory");
const { applyTemplate } = require("../src/template");
const WhatSendPackage = require("../src/whatsend-package");

function withTempDir(callback) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "whatsend-todo-"));
  return Promise.resolve(callback(directory)).finally(() => fs.rmSync(directory, { force: true, recursive: true }));
}

test("telefone e fone são aliases exclusivos, case-insensitive e interoperáveis", async () => {
  assert.equal(validateHeaders(["Nome", "FONE", "valor"]).phoneHeader, "fone");
  assert.match(validateHeaders(["nome", "telefone", "Fone"]).errors.join(" "), /mutuamente exclusivos/u);
  assert.match(validateHeaders(["nome", "Nome", "fone"]).errors.join(" "), /duplicado/u);
  assert.match(validateHeaders(["nome"]).errors.join(" "), /telefone ou fone/u);
  const parsed = parseCsv("Nome;Fone;Observação\r\nMaria;11999999999;Olá\r\n");
  assert.equal(parsed.records[0].Fone, "11999999999");
  assert.equal(applyTemplate("${telefone}/${fone}", parsed.records[0]), "11999999999/11999999999");
  assert.equal(validateRecords(parsed.headers, parsed.records).ok, true);
  assert.deepEqual(
    validateRecords(["nome", "fone"], [{ nome: "", fone: "" }]).issues.map((issue) => issue.column),
    ["nome", "fone"],
  );
  assert.throws(() => parseCsv("nome;fone\nMaria\n"), /quantidade de colunas/u);

  await withTempDir((directory) => {
    const filePath = path.join(directory, "clientes.csv");
    fs.writeFileSync(filePath, "Nome;FONE\nMaria;11999999999\n", "utf8");
    assert.equal(loadCsv(filePath)[0].FONE, "11999999999");
    fs.writeFileSync(filePath, "nome;telefone;fone\nMaria;1;2\n", "utf8");
    assert.throws(() => loadCsv(filePath), /mutuamente exclusivos/u);
  });
});

test("serialização CSV é canônica, preserva texto e neutraliza fórmula", () => {
  const result = serializeCsv(["nome", "telefone", "nota"], [
    { nome: "Maria", telefone: "1199", nota: '=HYPERLINK("x")' },
  ]);
  assert.ok(result.content.startsWith("\ufeff"));
  assert.match(result.content, /^\ufeff"nome";"telefone";"nota"\r\n/u);
  assert.match(result.content, /"'=HYPERLINK\(""x""\)"/u);
  assert.ok(result.warnings.length > 0);
});

test("pacote unificado valida integridade e preserva campos adicionais", async () => {
  const document = await WhatSendPackage.createPackage({
    csvContent: "nome;fone\nMaria;1199\n",
    csvName: "base.csv",
    preserved: { extensionData: { origem: "teste" } },
    templateContent: "$diatarde$, ${nome}.",
    templateName: "mensagem.md",
  });
  const parsed = await WhatSendPackage.parsePackage(WhatSendPackage.stringifyPackage(document));
  assert.equal(parsed.document.extensionData.origem, "teste");
  assert.equal(parsed.templateContent, "$diatarde$, ${nome}.");
  assert.equal(parsed.csvContent, "nome;fone\nMaria;1199\n");
  const tampered = structuredClone(document);
  tampered.csv.content += "Outra;2\n";
  await assert.rejects(() => WhatSendPackage.parsePackage(tampered), /Integridade SHA-256 divergente/u);
});

test("análise editorial protege sintaxe e diferencia erro de aviso", () => {
  const issues = analyzeTemplate("Olá Maria, BOM DIA. `${Boa Noite}` $diatarde$ ![](https://x/Bom Dia.pdf)");
  assert.deepEqual(issues.map((issue) => issue.code), ["POSSIBLE_LITERAL_NAME", "LITERAL_DAY_GREETING"]);
  assert.deepEqual(issues.map((issue) => issue.severity), ["warning", "error"]);
  assert.equal(issues[1].message, "Saudação dependente do horário detectada. Substitua por $diatarde$.");
});

test("GUI integra aviso, título por estado, pacote, aliases e bloqueio editorial", () => {
  const guiSource = fs.readFileSync(path.join(__dirname, "..", "src", "gui.js"), "utf8");
  const html = renderGuiHtml();
  for (const expected of [
    "Em desenvolvimento: este software pode conter erros.",
    "100% Concluído — WhatSend",
    'title = "WhatSend"',
    "savePackageButton",
    "openPackageButton",
    "telefone ou fone",
    "/brand/favicon.svg",
    "/brand/apple-touch-icon.png",
    "WhatSendAdvisory",
  ]) assert.ok(html.includes(expected), expected);
  const manifest = fs.readFileSync(path.join(__dirname, "..", "src", "brand", "html-favicon", "site.webmanifest"), "utf8");
  assert.match(manifest, /\/brand\/web-app-manifest-512x512\.png/u);
  const result = validateGuiPayload({ templateText: "Bom dia, ${nome}." }, {
    csv: path.join(__dirname, "check-clientes.csv"),
    template: path.join(__dirname, "check-texto.md"),
  });
  assert.equal(result.ok, true);
  assert.equal(result.editorialIssues[0].code, "LITERAL_DAY_GREETING");
  const runRoute = guiSource.slice(guiSource.indexOf('url.pathname === "/api/run"'), guiSource.indexOf("function runGuiCampaign"));
  const closeServer = guiSource.slice(guiSource.indexOf("function closeServer"), guiSource.indexOf("function sendText"));
  assert.match(runRoute, /confirmEditorialIssues/u);
  assert.doesNotMatch(closeServer, /confirmEditorialIssues|validation\.editorialIssues/u);
});

test("bundle offline é único, íntegro, licenciado e sem dependência automática externa", async () => {
  await withTempDir((directory) => {
    const result = buildOfflineBundle(directory);
    const html = fs.readFileSync(result.outputPath, "utf8");
    const expectedHash = fs.readFileSync(`${result.outputPath}.sha256`, "utf8").split(/\s+/u)[0];
    assert.equal(path.basename(result.outputPath), OFFLINE_BUNDLE_NAME);
    assert.equal(expectedHash, crypto.createHash("sha256").update(html).digest("hex"));
    assert.match(html, /connect-src 'none'/u);
    assert.match(html, /Tabulator/u);
    assert.match(html, /MIT License/u);
    assert.match(html, /id="sourceParity"/u);
    assert.match(html, /id="templatePreview"/u);
    assert.match(html, /Renomear coluna/u);
    assert.match(html, /id="insertAttachmentButton"/u);
    assert.match(html, /id="insertEmojiButton"/u);
    assert.match(html, /function previewHtml/u);
    assert.match(html, /data:image\/svg\+xml;base64,/u);
    assert.doesNotMatch(html, /<(?:script|link|img)\b[^>]+(?:src|href)=["']https?:/iu);
    assert.doesNotMatch(html, /<script\b[^>]+src=/iu);
    const executableScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gu)]
      .filter((match) => !/application\/json/u.test(match[0]));
    for (const script of executableScripts) assert.doesNotThrow(() => new Function(script[1]));
  });
});

test("instalação usa motor atual, skipDownload oficial e overrides auditáveis", () => {
  const manifest = require("../package.json");
  const lock = require("../package-lock.json");
  const config = require("../.puppeteerrc.cjs");
  assert.equal(config.skipDownload, true);
  assert.equal(manifest.dependencies["puppeteer-core"], undefined);
  assert.equal(manifest.dependencies["whatsapp-web.js"], "^1.34.7");
  assert.equal(manifest.overrides["archiver-utils"].glob, "13.0.6");
  assert.equal(lock.packages["node_modules/whatsapp-web.js"].version, "1.34.7");
  assert.equal(lock.packages["node_modules/puppeteer"].version, "24.38.0");
});
