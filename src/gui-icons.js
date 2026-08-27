// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const { GUI_ICON_DEFINITIONS } = require("./gui-icon-data");

const GUI_ICON_ALIASES = Object.freeze({
  attachment: "fontawesome:solid:paperclip",
  bold: "fontawesome:solid:bold",
  "circle-info": "fontawesome:solid:circle-info",
  code: "fontawesome:solid:code",
  emoji: "fontawesome:solid:face-smile",
  "face-smile": "fontawesome:solid:face-smile",
  f032: "fontawesome:solid:bold",
  f033: "fontawesome:solid:italic",
  f07c: "fontawesome:solid:folder-open",
  f0c7: "fontawesome:solid:floppy-disk",
  f0c6: "fontawesome:solid:paperclip",
  f0cc: "fontawesome:solid:strikethrough",
  f011: "fontawesome:solid:power-off",
  f013: "fontawesome:solid:gear",
  f118: "fontawesome:solid:face-smile",
  f121: "fontawesome:solid:code",
  f15b: "fontawesome:solid:file",
  f167: "fontawesome:brands:youtube",
  f1dd: "fontawesome:solid:paragraph",
  f1f8: "fontawesome:solid:trash",
  f304: "fontawesome:solid:pen",
  f56d: "fontawesome:solid:file-arrow-down",
  f574: "fontawesome:solid:file-arrow-up",
  f5fd: "fontawesome:solid:layer-group",
  "file-arrow-down": "fontawesome:solid:file-arrow-down",
  "file-arrow-up": "fontawesome:solid:file-arrow-up",
  "floppy-disk": "fontawesome:solid:floppy-disk",
  folderOpen: "fontawesome:solid:folder-open",
  folderOpenRegular: "fontawesome:regular:folder-open",
  info: "fontawesome:solid:circle-info",
  italic: "fontawesome:solid:italic",
  layerGroup: "fontawesome:solid:layer-group",
  newEdition: "fontawesome:solid:file",
  newPosting: "fontawesome:solid:paragraph",
  open: "fontawesome:solid:file-arrow-up",
  paperclip: "fontawesome:solid:paperclip",
  paragraph: "fontawesome:solid:paragraph",
  pencil: "fontawesome:solid:pen",
  plus: "fontawesome:solid:plus",
  power: "fontawesome:solid:power-off",
  save: "fontawesome:solid:file-arrow-down",
  saveLocal: "fontawesome:solid:floppy-disk",
  settings: "fontawesome:solid:gear",
  strikethrough: "fontawesome:solid:strikethrough",
  trash: "fontawesome:solid:trash",
  youtube: "fontawesome:brands:youtube",
});

function renderGuiIconSprite() {
  const symbols = Object.entries(GUI_ICON_DEFINITIONS)
    .map(([key, definition]) => renderIconSymbol(key, definition))
    .join("");
  return `<svg class="wa-icon-sprite" aria-hidden="true" focusable="false">${symbols}</svg>`;
}

function renderGuiIcon(input, options = {}) {
  const key = resolveGuiIconKey(input);
  const label = options.label ? ` aria-label="${escapeHtml(options.label)}"` : " aria-hidden=\"true\"";
  const className = options.className ? ` ${escapeHtml(options.className)}` : "";
  return `<svg class="wa-icon${className}" data-icon-key="${escapeHtml(key)}"${label} focusable="false"><use href="#wa-icon-${iconDomId(key)}"></use></svg>`;
}

function resolveGuiIconKey(input) {
  const requested = String(input || "").trim();
  if (GUI_ICON_DEFINITIONS[requested]) return requested;
  const normalized = normalizeIconInput(requested);
  const alias = GUI_ICON_ALIASES[requested] || GUI_ICON_ALIASES[normalized];
  if (alias && GUI_ICON_DEFINITIONS[alias]) return alias;
  throw new Error(`Ícone qualificado não configurado: ${requested || "(vazio)"}`);
}

function getGuiIconManifest() {
  return Object.fromEntries(Object.entries(GUI_ICON_DEFINITIONS).map(([key, definition]) => [key, {
    collection: definition.collection,
    consumers: definition.consumers.slice(),
    license: definition.license,
    licenseUrl: definition.licenseUrl,
    package: definition.package,
    provider: definition.provider,
    sourceUrl: definition.sourceUrl,
    style: definition.style,
    version: definition.version,
  }]));
}

function renderIconSymbol(key, definition) {
  const attributes = Object.entries(definition.symbolAttributes || {})
    .map(([name, value]) => ` ${escapeHtml(name)}="${escapeHtml(value)}"`)
    .join("");
  return `<symbol id="wa-icon-${iconDomId(key)}" data-icon-key="${escapeHtml(key)}" viewBox="${escapeHtml(definition.viewBox)}"${attributes}>${definition.body}</symbol>`;
}

function iconDomId(key) {
  return String(key).replace(/[^a-z0-9_-]+/giu, "-");
}

function normalizeIconInput(input) {
  return String(input || "")
    .trim()
    .replace(/^\\u\{/iu, "")
    .replace(/\}$/u, "")
    .replace(/^0x/iu, "")
    .replace(/^&#x/iu, "")
    .replace(/;$/u, "")
    .toLocaleLowerCase("en-US");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = {
  GUI_ICON_ALIASES,
  GUI_ICON_DEFINITIONS,
  getGuiIconManifest,
  renderGuiIcon,
  renderGuiIconSprite,
  resolveGuiIconKey,
};
