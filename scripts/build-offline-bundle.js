// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const {
  AUTHOR,
  AUTHOR_URL,
  LICENSE_LOCAL_PATH,
  LICENSE_NAME,
  LICENSE_URL,
  REPOSITORY_URL,
  renderComplianceSummaryHtml,
  renderLegalFooterHtml,
} = require("../src/notice");
const { COMMON_EDITOR_ACTIONS } = require("../src/editor-actions");
const { renderGuiHintRuntime } = require("../src/gui-hints");
const { renderGuiIcon } = require("../src/gui-icons");

const ROOT_DIR = path.resolve(__dirname, "..");
const OFFLINE_BUNDLE_NAME = "WhatSend-Modelo-Offline.html";

function buildOfflineBundle(outputDir) {
  const csvSource = readInlineSource("src/csv-contract.js");
  const packageSource = readInlineSource("src/whatsend-package.js");
  const advisorySource = readInlineSource("src/template-advisory.js");
  const expressionSource = wrapCommonJsSource(readInlineSource("src/expression.js"), "WhatSendExpression");
  const tabulatorSource = readInlineSource("node_modules/tabulator-tables/dist/js/tabulator.min.js");
  const tabulatorCss = fs.readFileSync(path.join(ROOT_DIR, "node_modules/tabulator-tables/dist/css/tabulator.min.css"), "utf8");
  const tabulatorLicense = fs.readFileSync(path.join(ROOT_DIR, "node_modules/tabulator-tables/LICENSE"), "utf8");
  const favicon = toDataUri("src/brand/html-favicon/favicon.svg", "image/svg+xml");
  const parityManifest = buildParityManifest();
  const canonicalEditor = buildCanonicalEditorProjection();
  const html = renderOfflineHtml({ advisorySource, canonicalEditor, csvSource, expressionSource, favicon, packageSource, parityManifest, tabulatorCss, tabulatorLicense, tabulatorSource });
  validateOfflineBundle(html);
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, OFFLINE_BUNDLE_NAME);
  fs.writeFileSync(outputPath, html, "utf8");
  const sha256 = crypto.createHash("sha256").update(html, "utf8").digest("hex");
  fs.writeFileSync(`${outputPath}.sha256`, `${sha256}  ${OFFLINE_BUNDLE_NAME}\n`, "utf8");
  return { outputPath, sha256 };
}

function toDataUri(relativePath, mediaType) {
  const content = fs.readFileSync(path.join(ROOT_DIR, relativePath));
  return `data:${mediaType};base64,${content.toString("base64")}`;
}

function buildParityManifest() {
  const sources = [
    "src/gui.js",
    "src/gui-icon-data.js",
    "src/gui-icons.js",
    "src/gui-hints.js",
    "src/editor-actions.js",
    "src/expression.js",
    "src/notice.js",
    "src/csv-contract.js",
    "src/whatsend-package.js",
    "src/template-advisory.js",
    "src/brand/html-favicon/favicon.svg",
  ];
  return Object.fromEntries(sources.map((relativePath) => {
    const content = fs.readFileSync(path.join(ROOT_DIR, relativePath));
    return [relativePath, crypto.createHash("sha256").update(content).digest("hex")];
  }));
}

function readInlineSource(relativePath) {
  return fs.readFileSync(path.join(ROOT_DIR, relativePath), "utf8")
    .replace(/^\/\/# sourceMappingURL=.*$/gmu, "")
    .replace(/<\/script/giu, "<\\/script");
}

function buildCanonicalEditorProjection() {
  const { renderGuiHtml } = require("../src/gui");
  const guiHtml = renderGuiHtml();
  const css = guiHtml.match(/<style>([\s\S]*?)<\/style>/u);
  const sprite = guiHtml.match(/<body>\s*([\s\S]*?)\s*<div id="topProgress"/u);
  const panel = guiHtml.match(/<section class="full-card template-card">[\s\S]*?<\/section>/u);
  if (!css || !sprite || !panel) {
    throw new Error("Painel canônico da GUI não pôde ser projetado no bundle offline.");
  }
  return {
    css: css[1],
    panel: panel[0]
      .replace('id="templateBaseDir"', 'id="templateBaseDir" disabled value="Indisponível sem backend local" title="Recurso dependente do backend local."')
      .replace('id="templateModelsButton"', 'id="templateModelsButton" disabled title="Modelos do repositório exigem o backend local."'),
    sprite: sprite[1],
  };
}

function wrapCommonJsSource(source, globalName) {
  return `(function(){var module={exports:{}};var exports=module.exports;${source}\nwindow.${globalName}=module.exports;})();`;
}

function renderOfflineHtml(parts) {
  const commonEditorActions = COMMON_EDITOR_ACTIONS.map((action) =>
    `<button type="button" id="${escapeHtml(action.id)}" data-editor-action="${escapeHtml(action.id)}" data-insert="${escapeHtml(action.insert)}" aria-label="${escapeHtml(action.label)}" title="${escapeHtml(action.hint)}">${escapeHtml(action.label)}</button>`,
  ).join("");
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; media-src data: blob:; object-src 'none'; base-uri 'none'; form-action 'none'">
<title>WhatSend — Editor offline</title>
<link rel="icon" href="${parts.favicon}" type="image/svg+xml">
<style>${parts.tabulatorCss}</style>
<style>
:root{color-scheme:light;--green:#075e54;--green2:#128c7e;--paper:#fff;--bg:#eef4f2;--line:#ccd9d5;--danger:#9f1d20;--warning:#8a5100;--text:#17231f}*{box-sizing:border-box}body{margin:0;background:linear-gradient(145deg,#e5f3ef,#f7faf9);color:var(--text);font:15px/1.45 system-ui,sans-serif}header,main,footer{width:min(1180px,calc(100% - 28px));margin:auto}header{padding:24px 0 10px}h1,h2{margin:.2em 0}main{display:grid;gap:16px;padding:8px 0 24px}.panel{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:18px;box-shadow:0 8px 24px #083e3520}.license{border-left:6px solid var(--green)}.development{padding:10px 12px;border:2px solid #b86f00;border-radius:8px;background:#fff5df;font-weight:700}.compliance-notice{border-left:4px solid #d28a00;padding-left:10px}.toolbar,.model-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.toolbar button,.model-tabs button,.file-button{border:1px solid var(--green);border-radius:8px;background:#fff;color:var(--green);padding:8px 11px;font:inherit;font-weight:650;cursor:pointer}.toolbar button:hover,.toolbar button:focus-visible,.model-tabs button:hover,.model-tabs button:focus-visible,.model-tabs button.active,.file-button:hover,.file-button:focus-within{background:var(--green);color:#fff}.toolbar input[type=file]{position:absolute;inline-size:1px;block-size:1px;opacity:0}textarea{width:100%;min-height:250px;resize:vertical;border:1px solid #9cb2aa;border-radius:9px;padding:12px;font:14px/1.5 ui-monospace,monospace}.editor-alert{border-color:var(--danger);background:#fffafa}.layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(260px,.7fr);gap:14px}.preview,.advisories{min-height:120px;border:1px solid var(--line);border-radius:9px;padding:12px;white-space:pre-wrap;overflow:auto}.issue{display:block;width:100%;margin:7px 0;border:1px solid currentColor;border-radius:7px;padding:8px;text-align:left;background:#fff;cursor:pointer}.issue.error{color:var(--danger)}.issue.warning{color:var(--warning)}.status{min-height:1.5em;font-weight:650}.status.error{color:var(--danger)}.status.ok{color:#176b3a}#csvGrid{border:1px solid var(--line);border-radius:9px;min-height:240px}.tabulator-cell.invalid-cell{background:#ffe7e7!important;outline:2px solid var(--danger);outline-offset:-2px}.hint{color:#52635d;font-size:.92em}footer{padding:10px 0 32px;color:#44544f}.license-copy{display:none}@media(max-width:760px){.layout{grid-template-columns:1fr}.panel{padding:14px}header,main,footer{width:min(100% - 18px,1180px)}}
</style>
</head>
<body>
<header><h1>WhatSend — Editor offline</h1><p>Prepare o modelo e os dados localmente. Este arquivo não envia mensagens nem depende de servidor.</p></header>
<main>
<section class="panel license" aria-labelledby="licenseTitle"><h2 id="licenseTitle">Licença</h2><p><strong>Autor:</strong> <a href="${AUTHOR_URL}" target="_blank" rel="noreferrer">${AUTHOR}</a></p><p><strong>Licença:</strong> <a href="${LICENSE_URL}" target="_blank" rel="noreferrer">${LICENSE_NAME}</a> <span class="hint">(${LICENSE_LOCAL_PATH})</span></p><p class="development" role="note">Em desenvolvimento: este software pode conter erros.</p><div class="compliance-notice" role="note" aria-label="Aviso legal resumido">${renderComplianceSummaryHtml()}</div></section>
<section class="panel" aria-labelledby="modelTitle"><h2 id="modelTitle">Modelo de mensagem</h2><div class="toolbar">
<label class="file-button">Abrir .md<input id="openMd" type="file" accept=".md,text/markdown,text/plain"></label><button id="saveMd" type="button">Salvar .md</button>
<label class="file-button">Abrir pacote<input id="openPackage" type="file" accept=".whatsend.json,application/json"></label><button id="savePackage" type="button">Salvar pacote</button><button id="saveLocal" type="button">Salvar no navegador</button><button id="openLocal" type="button">Abrir do navegador</button><button id="deleteLocal" type="button">Excluir do navegador</button><button id="clearAll" type="button">Nova edição</button>
</div><div class="toolbar" aria-label="Ferramentas de edição textual"><button type="button" data-wrap="*" aria-label="Negrito"><strong>B</strong></button><button type="button" data-wrap="_" aria-label="Itálico"><em>I</em></button><button type="button" data-wrap="~" aria-label="Tachado"><s>S</s></button><button type="button" data-wrap="&#96;&#96;&#96;" aria-label="Monoespaçado">Código</button>${commonEditorActions}<button type="button" data-insert="$postagem$">Nova postagem</button><label for="emojiSelect" class="hint">Emoji</label><select id="emojiSelect" aria-label="Inserir emoji profissional"><option value="">Escolher</option><option>✅</option><option>⚠️</option><option>📌</option><option>📎</option><option>📅</option><option>💬</option><option>👍</option><option>🙏</option></select><label class="file-button">Incorporar anexo<input id="embedAttachment" type="file"></label></div><div id="modelTabs" class="model-tabs" aria-label="Blocos do modelo"></div><div class="layout"><div><label for="templateText"><strong>Texto do modelo</strong></label><textarea id="templateText" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="$diatarde$, \${nome}."></textarea><div id="modelStatus" class="status" role="status" aria-live="polite"></div></div><div><strong>Prévia com a linha selecionada</strong><div id="preview" class="preview"></div><strong>Verificações editoriais</strong><div id="advisories" class="advisories" aria-live="polite"></div></div></div></section>
<section class="panel" aria-labelledby="csvTitle"><h2 id="csvTitle">Dados CSV</h2><p class="hint">Obrigatórios: nome e exatamente um alias telefônico (telefone ou fone). A exportação usa UTF-8 com BOM, ponto e vírgula e aspas.</p><input id="openCsv" class="visually-hidden-field" type="file" accept=".csv,text/csv,text/plain" tabindex="-1" aria-hidden="true"><div class="wa-toolbar wa-toolbar-document csv-toolbar" aria-label="Ferramentas do editor CSV">
<button id="openCsvButton" type="button" data-hint="Abrir arquivo CSV" aria-label="Abrir arquivo CSV">${renderGuiIcon("fontawesome:solid:file-arrow-up")}</button><button id="saveCsv" type="button" data-hint="Salvar arquivo CSV" aria-label="Salvar arquivo CSV">${renderGuiIcon("lucide:file-spreadsheet")}</button><span class="toolbar-separator" aria-hidden="true"></span><button id="addRow" type="button" data-hint="Adicionar linha" aria-label="Adicionar linha">${renderGuiIcon("lucide:table-rows-split")}</button><button id="deleteRows" type="button" data-hint="Excluir linhas selecionadas" aria-label="Excluir linhas selecionadas">${renderGuiIcon("lucide:list-x")}</button><span class="toolbar-separator" aria-hidden="true"></span><button id="addColumn" type="button" data-hint="Adicionar coluna" aria-label="Adicionar coluna">${renderGuiIcon("lucide:table-columns-split")}</button><button id="renameColumn" type="button" data-hint="Renomear coluna" aria-label="Renomear coluna">${renderGuiIcon("lucide:columns-3-cog")}</button><button id="removeColumn" type="button" data-hint="Remover coluna" aria-label="Remover coluna">${renderGuiIcon("lucide:panel-right-close")}</button><span class="toolbar-separator" aria-hidden="true"></span><button id="clearStorage" class="danger-tool" type="button" data-hint="Limpar dados locais" aria-label="Limpar dados locais">${renderGuiIcon("lucide:database-x")}</button>
</div><div id="csvGrid" aria-label="Editor tabular de CSV"></div><div id="csvStatus" class="status" role="status" aria-live="polite"></div></section>
</main>
<footer>${renderLegalFooterHtml().replace('href="/license"', 'href="' + LICENSE_URL + '"')}</footer>
<script type="application/json" id="thirdPartyLicenses">${escapeHtml(parts.tabulatorLicense)}</script>
<script type="application/json" id="sourceParity">${JSON.stringify(parts.parityManifest)}</script>
<script>${parts.tabulatorSource}</script>
<script>${parts.csvSource}</script>
<script>${parts.packageSource}</script>
<script>${parts.advisorySource}</script>
<script>${parts.expressionSource}</script>
<script>
(function(){"use strict";
var STORAGE_KEY="whatsend.offline-editor.v1";var NAMED_KEY="whatsend.offline-editor.v1.named.";var headers=["nome","telefone"];var preservedPackage=null;var templateText=document.getElementById("templateEditorInput");var templateTextHidden=document.getElementById("templateText");var templateHighlight=document.getElementById("templateHighlight");var modelStatus=document.getElementById("templateMediaStatus");var csvStatus=document.getElementById("csvStatus");var advisories=document.getElementById("templateAdvisories");var preview=document.getElementById("templatePreview");var modelTabs=document.getElementById("templateTabs");
var guiTooltip=document.getElementById("guiTooltip");
${renderGuiHintRuntime()}
var table=new Tabulator("#csvGrid",{data:[],height:300,layout:"fitColumns",selectableRows:true,clipboard:true,history:true,index:"__rowId",columns:columnsFor(headers)});
function columnsFor(names){return names.map(function(name){return{title:name,field:name,editor:"input",headerFilter:"input",headerSort:true,minWidth:130,sorter:"string"};});}
function setStatus(element,message,type){element.textContent=message||"";var base=element.id==="templateMediaStatus"?"field-message":"status";element.className=base+(type?" "+type:"");}
function readFile(file){return new Promise(function(resolve,reject){var reader=new FileReader();reader.onerror=function(){reject(new Error("Não foi possível ler o arquivo."));};reader.onload=function(){resolve(String(reader.result||""));};reader.readAsText(file);});}
function download(name,content,type){var blob=new Blob([content],{type:type||"application/octet-stream"});var url=URL.createObjectURL(blob);var link=document.createElement("a");link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(function(){URL.revokeObjectURL(url);},0);}
function previewHtml(value){var source=String(value||"").replace(/!\\[([^\\]]*)\\]\\([^)]+\\)/gu,"📎 Anexo: $1");var html=source.replace(/&/gu,"&amp;").replace(/</gu,"&lt;").replace(/>/gu,"&gt;");var fence=String.fromCharCode(96).repeat(3);html=html.split(fence).map(function(part,index){return index%2?"<code>"+part+"</code>":part;}).join("");html=html.replace(/\\*([^*\\n]+)\\*/gu,"<strong>$1</strong>").replace(/_([^_\\n]+)_/gu,"<em>$1</em>").replace(/~([^~\\n]+)~/gu,"<s>$1</s>").replace(/\\n/gu,"<br>");return html;}
function renderExpressions(source,data){var output="";var index=0;while(index<source.length){if(source[index]!=="$"||source[index+1]!=="{"){output+=source[index++]||"";continue;}var start=index;index+=2;var depth=1;var expression="";var quote="";while(index<source.length&&depth>0){var character=source[index];if(quote){expression+=character;if(character==="\\\\"){expression+=source[++index]||"";}else if(character===quote){quote="";}index+=1;continue;}if(character==="'"||character==='"'){quote=character;expression+=character;index+=1;continue;}if(character==="{"){depth+=1;}else if(character==="}"){depth-=1;if(depth===0){index+=1;break;}}if(depth>0)expression+=character;index+=1;}if(depth!==0){output+=source.slice(start);break;}try{var evaluated=WhatSendExpression.evaluateExpression(expression,data,{conversation:{capturedAt:"",lastMessageAt:""},identifierMode:"field",reserved:{ultimaconversa:""}}).value;output+=evaluated==null?"":String(evaluated);}catch(error){output+="[Erro: "+error.message+"]";}}return output;}
function renderPreview(){var selected=table.getSelectedData();var row=selected[0]||table.getData()[0]||{};var byName={};Object.keys(row).forEach(function(key){byName[WhatSendCsv.normalizeHeader(key)]=String(row[key]==null?"":row[key]);});var text=renderExpressions(templateText.value,byName);var hour=new Date().getHours();text=text.replace(/\\$diatarde\\$/giu,hour<12?"bom dia":hour<18?"boa tarde":"boa noite");preview.innerHTML=previewHtml(text||"A prévia aparecerá aqui. Selecione uma linha do CSV para conferir as substituições.");}
function renderModelTabs(){var source=templateText.value;var starts=[0];var pattern=/^\\s*\\^\\^\\^\\s*$/gmu;var match;while((match=pattern.exec(source)))starts.push(match.index+match[0].length);modelTabs.innerHTML="";starts.forEach(function(start,index){var button=document.createElement("button");button.type="button";button.className="wa-tab";button.textContent="M"+(index+1);button.setAttribute("aria-label","Modelo "+(index+1));button.addEventListener("click",function(){var end=index+1<starts.length?starts[index+1]:source.length;templateText.focus();templateText.setSelectionRange(start,end);});modelTabs.append(button);});var create=document.createElement("button");create.id="newTemplateTabButton";create.type="button";create.className="wa-tab wa-tab-create";create.setAttribute("aria-label","Novo modelo");create.textContent="+";create.addEventListener("click",function(){templateText.value+=(templateText.value.trim()?"\\n^^^\\n":"");renderAdvisories();templateText.focus();});modelTabs.append(create);}
function renderAdvisories(){var issues=WhatSendAdvisory.analyzeTemplate(templateText.value);templateTextHidden.value=templateText.value;templateHighlight.textContent=templateText.value+"\\n";document.getElementById("templateSaveState").textContent="Salvo localmente";renderPreview();renderModelTabs();advisories.innerHTML="";templateText.classList.toggle("editor-alert",issues.length>0);if(!issues.length){advisories.textContent="Nenhuma ocorrência ativa.";}issues.forEach(function(issue){var button=document.createElement("button");button.type="button";button.className="issue "+issue.severity;button.textContent=(issue.severity==="error"?"Erro":"Aviso")+" — linha "+issue.line+", coluna "+issue.column+": "+issue.message;button.addEventListener("click",function(){templateText.focus();templateText.setSelectionRange(issue.index,issue.index+issue.length);});advisories.append(button);});saveState();}
function validateGrid(){table.getRows().forEach(function(row){row.getCells().forEach(function(cell){cell.getElement().classList.remove("invalid-cell");});});var validation=WhatSendCsv.validateRecords(headers,table.getData());if(!validation.ok){validation.issues.forEach(function(issue){if(issue.row<2||!issue.column)return;var row=table.getRows()[issue.row-2];var cell=row&&row.getCell(issue.column);if(cell)cell.getElement().classList.add("invalid-cell");});setStatus(csvStatus,validation.issues.map(function(issue){return "Linha "+issue.row+(issue.column?", coluna "+issue.column:"")+": "+issue.message;}).join(" "),"error");return false;}setStatus(csvStatus,"Estrutura válida. Linhas: "+table.getData().length+".","ok");return true;}
function applyCsv(content){var parsed=WhatSendCsv.parseCsv(content);headers=parsed.headers.slice();table.setColumns(columnsFor(headers));return table.setData(parsed.records).then(function(){validateGrid();saveState();});}
function csvContent(){if(!validateGrid())throw new Error("Corrija os erros do CSV antes de salvar.");var result=WhatSendCsv.serializeCsv(headers,table.getData());if(result.warnings.length)setStatus(csvStatus,result.warnings.join(" "),"error");return result.content;}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,template:templateText.value,headers:headers,records:table.getData()}));}catch(error){setStatus(modelStatus,"Persistência local indisponível: "+error.message,"error");}}
function restoreState(){try{var state=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");if(!state||state.version!==1)return;templateText.value=String(state.template||"");if(Array.isArray(state.headers)&&state.headers.length){headers=state.headers.map(String);table.setColumns(columnsFor(headers));table.setData(Array.isArray(state.records)?state.records:[]);} }catch(error){localStorage.removeItem(STORAGE_KEY);setStatus(modelStatus,"Estado local inválido foi descartado.","error");}}
function replaceSelection(before,after,value){var start=templateText.selectionStart;var end=templateText.selectionEnd;var selected=templateText.value.slice(start,end);var text=value!=null?value:before+selected+after;templateText.setRangeText(text,start,end,"end");templateText.focus();renderAdvisories();}
function localSnapshot(){return{version:1,template:templateText.value,headers:headers.slice(),records:table.getData()};}
function applySnapshot(state){if(!state||state.version!==1||!Array.isArray(state.headers)||!Array.isArray(state.records))throw new Error("Salvamento local inválido.");templateText.value=String(state.template||"");headers=state.headers.map(String);var validation=WhatSendCsv.validateHeaders(headers);if(!validation.ok)throw new Error(validation.errors.join(" "));table.setColumns(columnsFor(headers));return table.setData(state.records).then(function(){renderAdvisories();validateGrid();});}
document.getElementById("templateFile").addEventListener("change",async function(event){var file=event.target.files[0];if(!file)return;if((templateText.value||table.getData().length)&&!confirm("Substituir o modelo atual?")){event.target.value="";return;}templateText.value=await readFile(file);preservedPackage=null;document.getElementById("templateActiveName").textContent=file.name;renderAdvisories();setStatus(modelStatus,"Modelo carregado: "+file.name,"ok");event.target.value="";});
document.getElementById("openCsvButton").addEventListener("click",function(){document.getElementById("openCsv").click();});
document.getElementById("openCsv").addEventListener("change",async function(event){var file=event.target.files[0];if(!file)return;try{if(table.getData().length&&!confirm("Substituir os dados CSV atuais?")){event.target.value="";return;}await applyCsv(await readFile(file));preservedPackage=null;setStatus(csvStatus,"CSV carregado: "+file.name,"ok");}catch(error){setStatus(csvStatus,error.message,"error");}event.target.value="";});
document.getElementById("packageFile").addEventListener("change",async function(event){var file=event.target.files[0];if(!file)return;try{var parsed=await WhatSendPackage.parsePackage(await readFile(file));WhatSendCsv.parseCsv(parsed.csvContent);if((templateText.value||table.getData().length)&&!confirm("Substituir atomicamente o modelo e o CSV atuais?")){event.target.value="";return;}await applyCsv(parsed.csvContent);templateText.value=parsed.templateContent;preservedPackage=parsed.document;document.getElementById("templateActiveName").textContent=file.name;renderAdvisories();setStatus(modelStatus,"Pacote íntegro carregado: "+file.name,"ok");}catch(error){setStatus(modelStatus,error.message,"error");}event.target.value="";});
document.getElementById("saveTemplateButton").addEventListener("click",function(){renderAdvisories();download("modelo-whatsend.md",templateText.value,"text/markdown;charset=utf-8");});
document.getElementById("saveCsv").addEventListener("click",function(){try{download("clientes-whatsend.csv",csvContent(),"text/csv;charset=utf-8");setStatus(csvStatus,"CSV salvo localmente.","ok");}catch(error){setStatus(csvStatus,error.message,"error");}});
document.getElementById("savePackage").addEventListener("click",async function(){try{renderAdvisories();var documentValue=await WhatSendPackage.createPackage({templateContent:templateText.value,csvContent:csvContent(),templateName:"modelo-whatsend.md",csvName:"clientes-whatsend.csv",preserved:preservedPackage});download("modelo-whatsend.whatsend.json",WhatSendPackage.stringifyPackage(documentValue),"application/json;charset=utf-8");preservedPackage=documentValue;setStatus(modelStatus,"Pacote íntegro salvo localmente.","ok");}catch(error){setStatus(modelStatus,error.message,"error");}});
document.getElementById("addRow").addEventListener("click",function(){table.addRow({});});document.getElementById("deleteRows").addEventListener("click",function(){table.getSelectedRows().forEach(function(row){row.delete();});saveState();});
document.getElementById("addColumn").addEventListener("click",function(){var name=prompt("Nome da nova coluna:","");if(!name)return;var next=headers.concat([name.trim()]);var validation=WhatSendCsv.validateHeaders(next);if(validation.errors.some(function(error){return /vazio|duplicado|aliases/u.test(error);})){setStatus(csvStatus,validation.errors.join(" "),"error");return;}headers=next;table.setColumns(columnsFor(headers));validateGrid();saveState();});
document.getElementById("renameColumn").addEventListener("click",function(){var current=prompt("Nome exato da coluna a renomear:","");if(!current)return;var index=headers.indexOf(current.trim());if(index<0){setStatus(csvStatus,"Coluna não encontrada.","error");return;}var replacement=prompt("Novo nome da coluna:",current.trim());if(!replacement)return;var next=headers.slice();next[index]=replacement.trim();var validation=WhatSendCsv.validateHeaders(next);if(!validation.ok){setStatus(csvStatus,validation.errors.join(" "),"error");return;}var records=table.getData().map(function(record){var copy=Object.assign({},record);copy[replacement.trim()]=copy[current.trim()];delete copy[current.trim()];return copy;});headers=next;table.setColumns(columnsFor(headers));table.setData(records).then(function(){validateGrid();saveState();});});
document.getElementById("removeColumn").addEventListener("click",function(){var name=prompt("Nome exato da coluna a remover:","");if(!name)return;var index=headers.indexOf(name.trim());if(index<0){setStatus(csvStatus,"Coluna não encontrada.","error");return;}headers.splice(index,1);table.setColumns(columnsFor(headers));validateGrid();saveState();});
document.querySelectorAll("[data-wrap]").forEach(function(button){button.addEventListener("click",function(){var marker=button.getAttribute("data-wrap")||"";replaceSelection(marker,marker);});});document.querySelectorAll("[data-insert]").forEach(function(button){button.addEventListener("click",function(){replaceSelection("","",button.getAttribute("data-insert")||"");});});
var emojiMenu=document.getElementById("emojiMenu");["✅","⚠️","📌","📎","📅","💬","👍","🙏"].forEach(function(emoji){var button=document.createElement("button");button.type="button";button.textContent=emoji;button.setAttribute("aria-label","Inserir "+emoji);button.addEventListener("click",function(){replaceSelection("","",emoji);emojiMenu.classList.remove("open");});emojiMenu.append(button);});document.getElementById("insertEmojiButton").addEventListener("click",function(){emojiMenu.classList.toggle("open");});
document.getElementById("embeddedAttachmentInput").addEventListener("change",function(event){var file=event.target.files[0];if(!file)return;if(file.size>10*1024*1024){setStatus(modelStatus,"Anexo excede o limite offline de 10 MiB.","error");event.target.value="";return;}var reader=new FileReader();reader.onerror=function(){setStatus(modelStatus,"Não foi possível incorporar o anexo.","error");};reader.onload=function(){var safeName=file.name.replace(/[^A-Za-z0-9._ -]/gu,"_");replaceSelection("","","!["+safeName+"]("+String(reader.result||"")+")");setStatus(modelStatus,"Anexo incorporado ao modelo.","ok");};reader.readAsDataURL(file);event.target.value="";});
document.getElementById("insertAttachmentButton").addEventListener("click",function(){document.getElementById("embeddedAttachmentInput").click();});document.getElementById("insertPostingButton").addEventListener("click",function(){replaceSelection("","", "$postagem$");});
document.getElementById("saveTemplateLocalButton").addEventListener("click",function(){var name=prompt("Nome do salvamento local:","modelo");if(!name)return;name=name.trim();if(!/^[\\p{L}\\p{N}._ -]{1,80}$/u.test(name)){setStatus(modelStatus,"Nome de salvamento inválido.","error");return;}localStorage.setItem(NAMED_KEY+name,JSON.stringify(localSnapshot()));document.getElementById("templateActiveName").textContent=name;setStatus(modelStatus,"Salvamento local atualizado: "+name+".","ok");});
document.getElementById("openLocalSavesButton").addEventListener("click",function(){var names=Object.keys(localStorage).filter(function(key){return key.indexOf(NAMED_KEY)===0;}).map(function(key){return key.slice(NAMED_KEY.length);}).sort();if(!names.length){setStatus(modelStatus,"Nenhum salvamento local disponível.","error");return;}var name=prompt("Informe o nome a abrir; prefixe com EXCLUIR: para remover:\\n"+names.join("\\n"),names[0]);if(!name)return;if(name.indexOf("EXCLUIR:")===0){var removeName=name.slice(8).trim();if(localStorage.getItem(NAMED_KEY+removeName)&&confirm("Excluir o salvamento local "+removeName+"?"))localStorage.removeItem(NAMED_KEY+removeName);return;}if((templateText.value||table.getData().length)&&!confirm("Substituir atomicamente a edição atual?"))return;try{var state=JSON.parse(localStorage.getItem(NAMED_KEY+name)||"null");applySnapshot(state).then(function(){document.getElementById("templateActiveName").textContent=name;setStatus(modelStatus,"Salvamento local aberto: "+name+".","ok");});}catch(error){setStatus(modelStatus,error.message,"error");}});
document.getElementById("newEditionButton").addEventListener("click",function(){if(!confirm("Limpar a edição atual?"))return;templateText.value="";preservedPackage=null;document.getElementById("templateActiveName").textContent="Sem nome";renderAdvisories();});document.getElementById("clearStorage").addEventListener("click",function(){if(confirm("Remover o estado salvo neste navegador?")){localStorage.removeItem(STORAGE_KEY);setStatus(csvStatus,"Dados locais removidos.","ok");}});
document.getElementById("openTemplateButton").addEventListener("click",function(){document.getElementById("templateFile").click();});document.getElementById("openPackageButton").addEventListener("click",function(){document.getElementById("packageFile").click();});document.getElementById("savePackageCsvButton").addEventListener("click",function(){try{download("clientes-whatsend.csv",csvContent(),"text/csv;charset=utf-8");}catch(error){setStatus(csvStatus,error.message,"error");}});
templateText.addEventListener("input",renderAdvisories);table.on("dataChanged",function(){validateGrid();renderPreview();saveState();});table.on("rowSelectionChanged",renderPreview);restoreState();renderAdvisories();validateGrid();
})();
</script>
</body></html>\n`;
  return projectCanonicalEditor(html, parts.canonicalEditor);
}

function projectCanonicalEditor(html, canonicalEditor) {
  const offlineCss = `
    header, main, footer { width:min(1180px,calc(100% - 28px)); margin:auto; }
    header { padding:24px 0 10px; }
    main { display:grid; gap:16px; padding:8px 0 24px; }
    .panel { background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:17px; box-shadow:var(--shadow); }
    #csvGrid { border:1px solid var(--line); border-radius:9px; min-height:240px; }
    .csv-toolbar { border:1px solid var(--line); border-radius:8px; margin:10px 0; }
    .tabulator-cell.invalid-cell { background:#ffe7e7!important; outline:2px solid var(--danger); outline-offset:-2px; }
    footer { padding:10px 0 32px; color:var(--muted); }
  `;
  return html
    .replace("<body>", `<body>\n${canonicalEditor.sprite}`)
    .replace(/<style>\s*:root\{[\s\S]*?<\/style>/u, `<style>${canonicalEditor.css}${offlineCss}</style>`)
    .replace(/<section class="panel" aria-labelledby="modelTitle">[\s\S]*?<\/section>\s*(?=<section class="panel" aria-labelledby="csvTitle">)/u, `${canonicalEditor.panel}\n`);
}

function validateOfflineBundle(html) {
  const forbidden = [
    /<(?:script|link|img|iframe|audio|video|source)\b[^>]+(?:src|href)\s*=\s*["'](?!data:|#)/iu,
    /\b(?:WebSocket|EventSource)\s*\(/u,
    /\bimport\s*\(/u,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(html)) throw new Error(`Bundle offline contém dependência externa proibida: ${pattern}`);
  }
  for (const required of [
    "WhatSendCsv",
    "WhatSendPackage",
    "WhatSendAdvisory",
    "WhatSendExpression",
    "Em desenvolvimento: este software pode conter erros.",
    "Content-Security-Policy",
    "connect-src 'none'",
    'id="insertAttachmentButton"',
    'id="templatePreview"',
    "Renomear coluna",
    "sourceParity",
    "data:image/svg+xml;base64,",
  ]) {
    if (!html.includes(required)) throw new Error(`Bundle offline incompleto: ${required}`);
  }
  const parityMatch = html.match(/<script type="application\/json" id="sourceParity">([^<]+)<\/script>/u);
  if (!parityMatch) throw new Error("Bundle offline sem manifesto de paridade.");
  let embeddedParity;
  try {
    embeddedParity = JSON.parse(parityMatch[1]);
  } catch (error) {
    throw new Error(`Manifesto de paridade inválido: ${error.message}`);
  }
  const currentParity = buildParityManifest();
  if (JSON.stringify(embeddedParity) !== JSON.stringify(currentParity)) {
    throw new Error("Bundle offline diverge das fontes canônicas; regenere o artefato.");
  }
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

if (require.main === module) {
  const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT_DIR, "dist");
  const result = buildOfflineBundle(targetDir);
  console.log(`Bundle offline gerado: ${path.relative(ROOT_DIR, result.outputPath)} (${result.sha256})`);
}

module.exports = {
  OFFLINE_BUNDLE_NAME,
  buildCanonicalEditorProjection,
  buildOfflineBundle,
  buildParityManifest,
  validateOfflineBundle,
};
