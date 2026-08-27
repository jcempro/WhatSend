// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT_DIR, "src", "gui-icon-data.js");
const CHECK_ONLY = process.argv.includes("--check");

const SELECTIONS = Object.freeze([
  fa("solid", "paperclip", "faPaperclip", ["editor:attachment"]),
  fa("solid", "bold", "faBold", ["editor:bold"]),
  fa("solid", "code", "faCode", ["editor:monospace"]),
  fa("solid", "face-smile", "faFaceSmile", ["editor:emoji"]),
  fa("solid", "folder-open", "faFolderOpen", ["editor:models"]),
  fa("regular", "folder-open", "faFolderOpen", ["editor:local-open"]),
  fa("solid", "circle-info", "faCircleInfo", ["help:documentation"]),
  fa("solid", "italic", "faItalic", ["editor:italic"]),
  fa("solid", "file", "faFile", ["editor:new"]),
  fa("solid", "paragraph", "faParagraph", ["editor:posting"]),
  fa("solid", "pen", "faPen", ["session:rename"]),
  fa("solid", "plus", "faPlus", ["session:new", "editor:new-tab"]),
  fa("solid", "power-off", "faPowerOff", ["header:shutdown"]),
  fa("solid", "file-arrow-down", "faFileArrowDown", ["editor:save"]),
  fa("solid", "file-arrow-up", "faFileArrowUp", ["editor:open", "csv:open"]),
  fa("solid", "floppy-disk", "faFloppyDisk", ["editor:local-save"]),
  fa("solid", "gear", "faGear", ["header:settings"]),
  fa("solid", "strikethrough", "faStrikethrough", ["editor:strikethrough"]),
  fa("solid", "trash", "faTrash", ["session:remove", "editor:remove-tab"]),
  fa("brands", "youtube", "faYoutube", ["help:video"]),
  lucide("file-spreadsheet", "FileSpreadsheet", ["editor:save-csv", "csv:save"]),
  lucide("package-check", "PackageCheck", ["editor:save-package"]),
  lucide("package-open", "PackageOpen", ["editor:open-package"]),
  lucide("variable", "Variable", ["editor:variable"]),
  lucide("message-circle-more", "MessageCircleMore", ["editor:last-conversation"]),
  lucide("message-circle-check", "MessageCircleCheck", ["editor:in-conversation"]),
  lucide("git-fork", "GitFork", ["editor:if-function"]),
  lucide("split", "Split", ["editor:if-else"]),
  lucide("workflow", "Workflow", ["editor:logic"]),
  lucide("calculator", "Calculator", ["editor:math"]),
  lucide("pause", "Pause", ["editor:pause"]),
  lucide("sun", "Sun", ["editor:day-period"]),
  lucide("layers", "Layers", ["editor:variant"]),
  lucide("table-rows-split", "TableRowsSplit", ["csv:add-row"]),
  lucide("list-x", "ListX", ["csv:delete-rows"]),
  lucide("table-columns-split", "TableColumnsSplit", ["csv:add-column"]),
  lucide("columns-3-cog", "Columns3Cog", ["csv:rename-column"]),
  lucide("panel-right-close", "PanelRightClose", ["csv:remove-column"]),
  lucide("database-x", "DatabaseX", ["csv:clear-storage"]),
  iconify("game-icons", "upgrade", "@iconify-json/game-icons", ["header:update"]),
  iconify("streamline-sharp", "download-box-1-solid", "@iconify-json/streamline-sharp", ["header:offline-download"]),
]);

if (require.main === module) syncGuiIcons({ checkOnly: CHECK_ONLY });

function fa(style, name, exportName, consumers) {
  const packageName = style === "brands"
    ? "@fortawesome/free-brands-svg-icons"
    : style === "regular"
      ? "@fortawesome/free-regular-svg-icons"
      : "@fortawesome/free-solid-svg-icons";
  return { consumers, exportName, key: `fontawesome:${style}:${name}`, name, packageName, provider: "fontawesome", style };
}

function lucide(name, exportName, consumers) {
  return { consumers, exportName, key: `lucide:${name}`, name, packageName: "lucide", provider: "lucide", style: "outline" };
}

function iconify(collection, name, packageName, consumers) {
  return { collection, consumers, key: `iconify:${collection}:${name}`, name, packageName, provider: "iconify", style: "solid" };
}

function syncGuiIcons(options = {}) {
  const entries = Object.fromEntries(SELECTIONS.map(loadSelection));
  assertUniqueGeometryWithinProvider(entries);
  const generated = renderModule(entries);
  if (options.checkOnly) {
    if (!fs.existsSync(OUTPUT_PATH) || fs.readFileSync(OUTPUT_PATH, "utf8") !== generated) {
      throw new Error("Catálogo de ícones divergente; execute npm run icons:sync.");
    }
    console.log(`Catálogo de ícones íntegro: ${Object.keys(entries).length} itens usados.`);
    return entries;
  }
  fs.writeFileSync(OUTPUT_PATH, generated, "utf8");
  console.log(`Catálogo de ícones atualizado: ${path.relative(ROOT_DIR, OUTPUT_PATH)} (${Object.keys(entries).length} itens).`);
  return entries;
}

function loadSelection(selection) {
  const packageJson = require(`${selection.packageName}/package.json`);
  let body;
  let symbolAttributes = {};
  let viewBox;

  if (selection.provider === "fontawesome") {
    const definition = require(selection.packageName)[selection.exportName];
    if (!definition || !definition.icon) throw new Error(`Ícone Font Awesome ausente: ${selection.key}`);
    const [width, height, , , pathData] = definition.icon;
    if (typeof pathData !== "string") throw new Error(`Ícone Font Awesome multicamada não suportado: ${selection.key}`);
    body = `<path fill="currentColor" d="${escapeAttribute(pathData)}"/>`;
    viewBox = `0 0 ${width} ${height}`;
  } else if (selection.provider === "lucide") {
    const iconNode = require("lucide")[selection.exportName];
    if (!Array.isArray(iconNode)) throw new Error(`Ícone Lucide ausente: ${selection.key}`);
    body = iconNode.map(([tagName, attributes]) => renderElement(tagName, attributes)).join("");
    symbolAttributes = {
      fill: "none",
      stroke: "currentColor",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
    };
    viewBox = "0 0 24 24";
  } else {
    const iconSet = require(`${selection.packageName}/icons.json`);
    const icon = iconSet.icons && iconSet.icons[selection.name];
    if (!icon || typeof icon.body !== "string") throw new Error(`Ícone Iconify ausente: ${selection.key}`);
    assertSafeIconifyBody(icon.body, selection.key);
    body = icon.body;
    viewBox = `${icon.left || 0} ${icon.top || 0} ${icon.width || iconSet.width || 24} ${icon.height || iconSet.height || 24}`;
  }

  const info = selection.provider === "iconify" ? require(`${selection.packageName}/info.json`) : null;
  return [selection.key, {
    body,
    collection: selection.collection || "",
    consumers: selection.consumers,
    license: info ? info.license.spdx : packageJson.license,
    licenseUrl: info ? info.license.url : licenseUrlFor(selection.provider),
    name: selection.name,
    package: selection.packageName,
    provider: selection.provider,
    sourceUrl: info ? info.author.url : packageJson.homepage,
    style: selection.style,
    symbolAttributes,
    version: packageJson.version,
    viewBox,
  }];
}

function renderElement(tagName, attributes) {
  if (!new Set(["circle", "ellipse", "line", "path", "polygon", "polyline", "rect"]).has(tagName)) {
    throw new Error(`Elemento SVG Lucide não permitido: ${tagName}`);
  }
  const attrs = Object.entries(attributes)
    .map(([name, value]) => `${name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)}="${escapeAttribute(value)}"`)
    .join(" ");
  return `<${tagName}${attrs ? ` ${attrs}` : ""}/>`;
}

function assertSafeIconifyBody(body, key) {
  if (/<(?:script|style|foreignObject|image|use)\b|\bon\w+\s*=|(?:href|src)\s*=|url\s*\(/iu.test(body)) {
    throw new Error(`SVG Iconify inseguro: ${key}`);
  }
  const tags = [...body.matchAll(/<\/?([a-z][\w-]*)\b/giu)].map((match) => match[1].toLowerCase());
  if (tags.some((tag) => !new Set(["circle", "ellipse", "g", "line", "path", "polygon", "polyline", "rect"]).has(tag))) {
    throw new Error(`Elemento SVG Iconify não permitido: ${key}`);
  }
}

function assertUniqueGeometryWithinProvider(definitions) {
  const seen = new Map();
  for (const [key, definition] of Object.entries(definitions)) {
    const identity = `${definition.provider}|${definition.viewBox}|${JSON.stringify(definition.symbolAttributes)}|${definition.body}`;
    if (seen.has(identity)) throw new Error(`Geometria duplicada no provedor: ${seen.get(identity)} e ${key}`);
    seen.set(identity, key);
  }
}

function renderModule(definitions) {
  const serialized = JSON.stringify(definitions, null, 2);
  return `// Autor: JeanCarloEM.com\n// Site do Autor: https://jeancarloem.com\n// Licenca: Mozilla Public License 2.0\n// Site da Licenca: https://www.mozilla.org/MPL/2.0/\n// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.\n// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.\n// Gerado por scripts/sync-gui-icons.js; nao editar manualmente.\n\nconst GUI_ICON_DEFINITIONS = Object.freeze(${serialized});\n\nmodule.exports = { GUI_ICON_DEFINITIONS };\n`;
}

function licenseUrlFor(provider) {
  return provider === "lucide"
    ? "https://github.com/lucide-icons/lucide/blob/main/LICENSE"
    : "https://fontawesome.com/license/free";
}

function escapeAttribute(value) {
  return String(value).replace(/&/gu, "&amp;").replace(/"/gu, "&quot;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;");
}

module.exports = { OUTPUT_PATH, SELECTIONS, loadSelection, renderModule, syncGuiIcons };
