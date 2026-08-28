// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ATTRIBUTIONS_SCHEMA = "whatsend-attributions/v1";
const EXEMPT_LICENSES = new Set(["0BSD", "CC0-1.0", "Unlicense"]);
const LICENSE_FILE_PATTERN = /^(?:licen[cs]e|copying|notice)(?:[._-].*)?$/iu;
const SIMPLE_SPDX_PATTERN = /^[A-Za-z0-9.-]+$/u;
function collectAttributions({ rootDir }) {
  const lock = readJson(path.join(rootDir, "package-lock.json"));
  const rootPackage = readJson(path.join(rootDir, "package.json"));
  const directDependencies = new Set(Object.keys(rootPackage.dependencies || {}));
  const canonicalLicenseTexts = collectCanonicalLicenseTexts(rootDir, lock);
  const runtimeRecords = [];

  for (const [packagePath, metadata] of Object.entries(lock.packages || {})) {
    if (!packagePath || !metadata || metadata.dev === true) continue;

    const packageDir = path.join(rootDir, packagePath);
    const packageJsonPath = path.join(packageDir, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`Pacote materializado ausente para atribuição: ${packagePath}`);
    }

    const packageJson = readJson(packageJsonPath);
    const license = normalizeLicense(metadata.license || packageJson.license || packageJson.licenses);

    if (!license) {
      throw new Error(`Licença ausente para ${packageJson.name || packagePath}.`);
    }

    if (EXEMPT_LICENSES.has(license)) continue;

    const notice = readPackageNotice({
      author: formatAuthor(packageJson.author),
      canonicalLicenseTexts,
      license,
      packageDir,
      packageName: packageJson.name,
    });
    const packageName = String(packageJson.name || packagePath.replace(/^node_modules[\\/]/u, ""));
    const version = String(packageJson.version || metadata.version || "");

    runtimeRecords.push({
      author: formatAuthor(packageJson.author) || "Não informado pela distribuição oficial",
      id: stableId("npm", packageName, version),
      license,
      licenseUrl: licenseUrlFor(license),
      modified: "Não modificado pelo WhatSend; instalado conforme o pacote oficial.",
      name: packageName,
      notice,
      originUrl: normalizeRepositoryUrl(packageJson.repository) || normalizeUrl(packageJson.homepage) || npmPackageUrl(packageName),
      purpose: metadata.optional === true
        ? "Dependência opcional de execução para plataforma compatível."
        : directDependencies.has(packageName)
          ? "Dependência direta de execução do produto oficial."
          : "Dependência transitiva de execução do produto oficial.",
      scope: "runtime",
      version,
    });
  }

  const records = deduplicateRecords([...runtimeRecords, ...collectEmbeddedResources(rootDir)])
    .sort(compareRecords);
  const fingerprints = sourceFingerprints(rootDir);

  return {
    fingerprints,
    records,
    schema: ATTRIBUTIONS_SCHEMA,
    summary: summarizeRecords(records),
  };
}

function collectEmbeddedResources(rootDir) {
  const { getGuiIconManifest } = require(path.join(rootDir, "src", "gui-icons"));
  const manifest = getGuiIconManifest();
  const definitions = Object.entries(manifest);
  const fontAwesome = definitions.filter(([, value]) => value.provider === "fontawesome");
  const lucide = definitions.filter(([, value]) => value.provider === "lucide");
  const gameIcons = definitions.filter(([key]) => key === "iconify:game-icons:upgrade");
  const streamline = definitions.filter(([key]) => key === "iconify:streamline-sharp:download-box-1-solid");
  const fontAwesomePackage = readJson(path.join(rootDir, "node_modules", "@fortawesome", "free-solid-svg-icons", "package.json"));
  const lucidePackage = readJson(path.join(rootDir, "node_modules", "lucide", "package.json"));
  const tabulatorPackage = readJson(path.join(rootDir, "node_modules", "tabulator-tables", "package.json"));

  assertEmbeddedSet("Font Awesome", fontAwesome);
  assertEmbeddedSet("Lucide", lucide);
  assertEmbeddedSet("Game Icons", gameIcons);
  assertEmbeddedSet("Streamline", streamline);

  return [
    embeddedRecord({
      author: "Fonticons, Inc. e equipe Font Awesome",
      entries: fontAwesome,
      license: fontAwesome[0][1].license,
      licenseUrl: fontAwesome[0][1].licenseUrl,
      modified: "SVGs extraídos dos pacotes oficiais, sanitizados e incorporados ao sprite used-only; geometria preservada e cor herdada da interface.",
      name: "Font Awesome Free — ícones SVG utilizados",
      notice: readExactFile(path.join(rootDir, "node_modules", "@fortawesome", "free-solid-svg-icons", "LICENSE.txt")),
      originUrl: fontAwesomePackage.homepage,
      version: fontAwesome[0][1].version,
    }),
    embeddedRecord({
      author: "Lucide Icons e contribuidores; Cole Bemis nos ícones derivados de Feather",
      entries: lucide,
      license: lucide[0][1].license,
      licenseUrl: lucide[0][1].licenseUrl,
      modified: "SVGs extraídos do pacote oficial, sanitizados e incorporados ao sprite used-only; traços e geometria preservados.",
      name: "Lucide Icons — ícones SVG utilizados",
      notice: readExactFile(path.join(rootDir, "node_modules", "lucide", "LICENSE")),
      originUrl: lucidePackage.homepage,
      version: lucide[0][1].version,
    }),
    embeddedRecord({
      author: "Delapouite",
      entries: gameIcons,
      license: "CC-BY-3.0",
      licenseUrl: gameIcons[0][1].licenseUrl,
      modified: "Ícone convertido do IconifyJSON oficial para SVG sanitizado e incorporado ao sprite; geometria preservada e cor herdada da interface.",
      name: "Game Icons — upgrade",
      notice: [
        "Icon made by Delapouite.",
        "Licensed under Creative Commons Attribution 3.0.",
        "Source: https://game-icons.net/1x1/delapouite/upgrade.html",
        "License: https://creativecommons.org/licenses/by/3.0/",
      ].join("\n"),
      originUrl: "https://game-icons.net/1x1/delapouite/upgrade.html",
      version: gameIcons[0][1].version,
    }),
    embeddedRecord({
      author: "Streamline",
      entries: streamline,
      license: "CC-BY-4.0",
      licenseUrl: streamline[0][1].licenseUrl,
      modified: "Ícone convertido do IconifyJSON oficial para SVG sanitizado e incorporado ao sprite; geometria preservada e cor herdada da interface.",
      name: "Streamline Sharp — download-box-1-solid",
      notice: [
        "Free icon from Streamline (https://streamlinehq.com).",
        "Licensed under Creative Commons Attribution 4.0 International.",
        "Source: https://github.com/webalys-hq/streamline-vectors",
        "License: https://creativecommons.org/licenses/by/4.0/",
      ].join("\n"),
      originUrl: streamline[0][1].sourceUrl,
      version: streamline[0][1].version,
    }),
    {
      author: formatAuthor(tabulatorPackage.author),
      id: stableId("embedded", tabulatorPackage.name, tabulatorPackage.version),
      license: normalizeLicense(tabulatorPackage.license),
      licenseUrl: "https://github.com/tabulator-tables/tabulator/blob/master/LICENSE",
      modified: "JavaScript e CSS oficiais incorporados e minificados no bundle offline; cabeçalho legal preservado.",
      name: "Tabulator",
      notice: readExactFile(path.join(rootDir, "node_modules", "tabulator-tables", "LICENSE")),
      originUrl: normalizeRepositoryUrl(tabulatorPackage.repository) || tabulatorPackage.homepage,
      purpose: "Grade CSV incorporada ao bundle offline do WhatSend.",
      scope: "embedded",
      version: tabulatorPackage.version,
    },
  ];
}

function embeddedRecord({ author, entries, license, licenseUrl, modified, name, notice, originUrl, version }) {
  const resources = entries.map(([key]) => key).sort((a, b) => a.localeCompare(b, "en"));
  return {
    author,
    id: stableId("embedded", name, version),
    license,
    licenseUrl,
    modified,
    name,
    notice,
    originUrl,
    purpose: `Recurso visual incorporado à GUI e/ou ao bundle offline: ${resources.join(", ")}.`,
    scope: "embedded",
    version,
  };
}

function collectCanonicalLicenseTexts(rootDir, lock) {
  const result = new Map();

  for (const [packagePath, metadata] of Object.entries(lock.packages || {})) {
    if (!packagePath || !metadata || metadata.dev === true) continue;
    const packageDir = path.join(rootDir, packagePath);
    if (!fs.existsSync(packageDir)) continue;
    const packageJsonPath = path.join(packageDir, "package.json");
    if (!fs.existsSync(packageJsonPath)) continue;
    const packageJson = readJson(packageJsonPath);
    const license = normalizeLicense(metadata.license || packageJson.license || packageJson.licenses);
    if (!license || result.has(license)) continue;
    const files = findNoticeFiles(packageDir);
    if (files.length > 0) result.set(license, joinNoticeFiles(packageDir, files));
  }

  return result;
}

function readPackageNotice({ author, canonicalLicenseTexts, license, packageDir, packageName }) {
  const files = findNoticeFiles(packageDir);
  if (files.length > 0) return joinNoticeFiles(packageDir, files);
  const canonical = canonicalLicenseTexts.get(license);

  if (!canonical) {
    throw new Error(`Texto de licença obrigatório ausente para ${packageName} (${license}).`);
  }

  return [
    `Pacote: ${packageName}`,
    `Titular/autor informado: ${author || "não informado"}`,
    `Licença declarada: ${license}`,
    "A distribuição do pacote não contém arquivo de licença próprio; segue o texto canônico da mesma licença presente na árvore oficial:",
    "",
    canonical,
  ].join("\n");
}

function findNoticeFiles(packageDir) {
  return fs.readdirSync(packageDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && LICENSE_FILE_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "en"));
}

function joinNoticeFiles(packageDir, files) {
  return files.map((fileName) => [
    `===== ${fileName} =====`,
    readExactFile(path.join(packageDir, fileName)),
  ].join("\n")).join("\n\n");
}

function renderAttributionsPage(data, { faviconHref = "/brand/favicon.svg" } = {}) {
  validateAttributionsData(data);
  const rows = data.records.map((record) => `
          <tr>
            <th scope="row" data-label="Componente"><strong>${escapeHtml(record.name)}</strong><span>v${escapeHtml(record.version)}</span></th>
            <td data-label="Uso">${escapeHtml(record.purpose)}</td>
            <td data-label="Autor/titular">${escapeHtml(record.author)}</td>
            <td data-label="Origem"><a href="${escapeAttribute(record.originUrl)}" rel="external noreferrer">Fonte oficial</a></td>
            <td data-label="Licença"><a href="${escapeAttribute(record.licenseUrl)}" rel="license external noreferrer">${escapeHtml(record.license)}</a></td>
            <td data-label="Tratamento">${escapeHtml(record.modified)}</td>
            <td data-label="Aviso"><a href="#notice-${escapeAttribute(record.id)}">Aviso integral</a></td>
          </tr>`).join("");
  const notices = data.records.map((record) => `
        <article class="notice" id="notice-${escapeAttribute(record.id)}">
          <h3>${escapeHtml(record.name)} <span>v${escapeHtml(record.version)}</span></h3>
          <p><a href="${escapeAttribute(record.originUrl)}" rel="external noreferrer">Origem oficial</a> · <a href="${escapeAttribute(record.licenseUrl)}" rel="license external noreferrer">${escapeHtml(record.license)}</a></p>
          <pre>${escapeHtml(record.notice)}</pre>
          <p class="back"><a href="#relacao">Voltar à relação</a></p>
        </article>`).join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'">
  <title>Atribuições obrigatórias — WhatSend</title>
  <meta name="description" content="Licenças e atribuições obrigatórias dos componentes efetivamente distribuídos pelo WhatSend.">
  <link rel="icon" href="${escapeAttribute(faviconHref)}" type="image/svg+xml">
  <style>${renderStyles()}</style>
</head>
<body>
  <a class="skip" href="#conteudo">Ir para o conteúdo</a>
  <header class="masthead">
    <div class="brand"><img src="${escapeAttribute(faviconHref)}" width="48" height="48" alt=""><span>WhatSend</span></div>
  </header>
  <main id="conteudo">
    <section class="hero" aria-labelledby="titulo">
      <p class="eyebrow">Transparência de licenças</p>
      <h1 id="titulo">Atribuições obrigatórias</h1>
      <p>Esta página reúne exclusivamente os avisos exigidos pelas licenças dos componentes e recursos de terceiros efetivamente incorporados ou instalados pelo produto oficial.</p>
      <dl class="summary">
        <div><dt>Registros</dt><dd>${data.summary.total}</dd></div>
        <div><dt>Runtime</dt><dd>${data.summary.runtime}</dd></div>
        <div><dt>Incorporados</dt><dd>${data.summary.embedded}</dd></div>
      </dl>
    </section>
    <section class="panel" aria-labelledby="relacao">
      <h2 id="relacao">Relação de componentes e recursos</h2>
      <div class="table-wrap">
        <table>
          <caption>Componentes ordenados alfabeticamente por nome, versão e origem.</caption>
          <thead><tr><th scope="col">Componente</th><th scope="col">Uso</th><th scope="col">Autor/titular</th><th scope="col">Origem</th><th scope="col">Licença</th><th scope="col">Tratamento</th><th scope="col">Aviso</th></tr></thead>
          <tbody>${rows}
          </tbody>
        </table>
      </div>
    </section>
    <section class="panel notices" aria-labelledby="avisos">
      <h2 id="avisos">Textos e avisos integrais</h2>${notices}
    </section>
  </main>
  <footer><p>WhatSend · <a href="https://github.com/jcempro/WhatSend" rel="external noreferrer">Repositório oficial</a> · Projeto sob MPL-2.0.</p></footer>
</body>
</html>`;
}

function renderStyles() {
  return `
    :root{--bg:#f4f7f6;--surface:#fff;--text:#18211f;--muted:#5d6a66;--line:#cfdad6;--brand:#08785f;--brand-strong:#045e4a;--soft:#e5f4ef;--shadow:0 14px 36px rgba(18,52,43,.08);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color-scheme:light}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);line-height:1.55}a{color:var(--brand-strong);text-underline-offset:.18em}a:hover{text-decoration-thickness:2px}a:focus-visible{outline:3px solid #e0a800;outline-offset:3px;border-radius:2px}.skip{position:fixed;left:1rem;top:-5rem;z-index:10;background:#101828;color:#fff;padding:.75rem 1rem;border-radius:.5rem}.skip:focus{top:1rem}.masthead{background:var(--surface);border-bottom:1px solid var(--line);padding:.8rem max(1rem,calc((100% - 1180px)/2));position:relative}.brand{display:flex;align-items:center;gap:.75rem;font-weight:800;font-size:1.2rem;letter-spacing:-.02em}.brand img{border-radius:12px}main{width:min(1180px,calc(100% - 2rem));margin:0 auto;padding:2.5rem 0 4rem}.hero{background:linear-gradient(135deg,var(--surface),var(--soft));border:1px solid var(--line);border-radius:20px;padding:clamp(1.25rem,4vw,3rem);box-shadow:var(--shadow)}.eyebrow{color:var(--brand);font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:.78rem;margin:0 0 .4rem}h1{font-size:clamp(2rem,6vw,3.5rem);letter-spacing:-.045em;line-height:1.05;margin:0 0 1rem;max-width:18ch}h2{font-size:clamp(1.35rem,3vw,2rem);letter-spacing:-.025em;margin:0 0 1rem}h3{font-size:1.05rem;margin:0 0 .35rem}h3 span,th span{color:var(--muted);font-size:.82em;font-weight:600;margin-left:.35rem}.hero>p:not(.eyebrow){max-width:72ch;color:var(--muted);font-size:1.05rem}.summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem;margin:2rem 0 0}.summary div{background:rgba(255,255,255,.72);border:1px solid var(--line);border-radius:12px;padding:1rem}.summary dt{color:var(--muted);font-size:.8rem;font-weight:700;text-transform:uppercase}.summary dd{font-size:1.5rem;font-weight:850;margin:.15rem 0 0}.panel{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:clamp(1rem,2.5vw,1.5rem);margin-top:1.25rem;box-shadow:var(--shadow)}.table-wrap{width:100%}table{border-collapse:collapse;width:100%;font-size:.84rem}caption{text-align:left;color:var(--muted);padding:0 0 .8rem}th,td{border-top:1px solid var(--line);padding:.75rem .6rem;text-align:left;vertical-align:top}thead th{background:var(--soft);color:#25423a;border-top:0}tbody th{min-width:11rem}.notice{border-top:1px solid var(--line);padding:1.5rem 0;scroll-margin-top:1rem}.notice:first-of-type{border-top:0}.notice p{color:var(--muted);margin:.35rem 0}.notice pre{background:#101828;color:#f8fafc;border-radius:10px;padding:1rem;white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}.back{text-align:right}footer{border-top:1px solid var(--line);background:var(--surface);color:var(--muted);padding:1.25rem max(1rem,calc((100% - 1180px)/2))}
    @media(max-width:900px){main{width:min(100% - 1rem,1180px);padding-top:.75rem}.summary{grid-template-columns:1fr}.panel{padding:.85rem}.table-wrap,table,caption,tbody,tr,th,td{display:block;width:100%}thead{position:absolute;clip:rect(0 0 0 0);clip-path:inset(50%);height:1px;width:1px;overflow:hidden}tr{border-top:1px solid var(--line);padding:.75rem 0}tbody tr:first-child{border-top:0}th,td{border:0;padding:.25rem 0}td::before{content:attr(data-label) ": ";font-weight:800;color:#25423a}.notice pre{font-size:11px;padding:.75rem}}
    @media(prefers-color-scheme:dark){:root{--bg:#101513;--surface:#18201d;--text:#edf5f2;--muted:#b6c4bf;--line:#34443e;--brand:#4dd6b1;--brand-strong:#69e2c1;--soft:#183a31;--shadow:none;color-scheme:dark}.summary div{background:rgba(16,21,19,.55)}thead th,td::before{color:#d9f2ea}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
  `;
}

function validateAttributionsData(data) {
  if (!data || data.schema !== ATTRIBUTIONS_SCHEMA || !Array.isArray(data.records) || data.records.length === 0) {
    throw new Error("Inventário de atribuições inválido ou vazio.");
  }
  const ids = new Set();
  let previous = null;
  for (const record of data.records) {
    for (const field of ["author", "id", "license", "licenseUrl", "modified", "name", "notice", "originUrl", "purpose", "scope", "version"]) {
      if (!String(record[field] || "").trim()) throw new Error(`Campo ${field} ausente em atribuição.`);
    }
    if (ids.has(record.id)) throw new Error(`ID de atribuição duplicado: ${record.id}`);
    ids.add(record.id);
    if (!/^https:\/\//u.test(record.originUrl) || !/^https:\/\//u.test(record.licenseUrl)) {
      throw new Error(`Link não HTTPS em ${record.name}.`);
    }
    if (previous && compareRecords(previous, record) > 0) throw new Error("Inventário de atribuições fora da ordem canônica.");
    previous = record;
  }
  const summary = summarizeRecords(data.records);
  if (JSON.stringify(summary) !== JSON.stringify(data.summary)) throw new Error("Resumo de atribuições divergente.");
  return true;
}

function sourceFingerprints(rootDir) {
  const sources = [
    "package-lock.json",
    "src/gui-icon-data.js",
    "node_modules/tabulator-tables/package.json",
    "node_modules/tabulator-tables/LICENSE",
    "node_modules/lucide/LICENSE",
    "node_modules/@fortawesome/free-solid-svg-icons/LICENSE.txt",
  ];
  return Object.fromEntries(sources.map((source) => [
    source,
    sha256(fs.readFileSync(path.join(rootDir, source), "utf8").replace(/\r\n/gu, "\n")),
  ]));
}

function deduplicateRecords(records) {
  const result = new Map();
  for (const record of records) {
    const key = `${record.scope}\u0000${record.name}\u0000${record.version}`;
    const existing = result.get(key);
    if (!existing) {
      result.set(key, record);
      continue;
    }
    const comparable = ["author", "license", "licenseUrl", "notice", "originUrl"];
    if (comparable.some((field) => existing[field] !== record[field])) {
      throw new Error(`Atribuições divergentes para ${record.name}@${record.version}.`);
    }
  }
  return [...result.values()];
}

function summarizeRecords(records) {
  return {
    embedded: records.filter((record) => record.scope === "embedded").length,
    runtime: records.filter((record) => record.scope === "runtime").length,
    total: records.length,
  };
}

function compareRecords(left, right) {
  return left.name.localeCompare(right.name, "pt-BR", { sensitivity: "base" })
    || left.version.localeCompare(right.version, "en", { numeric: true })
    || left.originUrl.localeCompare(right.originUrl, "en");
}

function normalizeLicense(value) {
  if (Array.isArray(value)) return normalizeLicense(value[0]);
  if (value && typeof value === "object") return normalizeLicense(value.type);
  const text = String(value || "").trim();
  if (/^Apache(?: License)? 2(?:\.0)?$/iu.test(text)) return "Apache-2.0";
  return text;
}

function formatAuthor(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return [value.name, value.email, value.url].filter(Boolean).join(" · ");
}

function normalizeRepositoryUrl(repository) {
  const value = typeof repository === "string" ? repository : repository && repository.url;
  return normalizeUrl(value);
}

function normalizeUrl(value) {
  let url = String(value || "").trim();
  url = url.replace(/^git\+/iu, "").replace(/^git:\/\//iu, "https://").replace(/^ssh:\/\/git@github\.com\//iu, "https://github.com/");
  url = url.replace(/^git@github\.com:/iu, "https://github.com/").replace(/\.git(?:#.*)?$/u, "");
  if (/^http:\/\//iu.test(url)) url = `https://${url.slice(7)}`;
  return /^https:\/\//iu.test(url) ? url : "";
}

function licenseUrlFor(license) {
  if (SIMPLE_SPDX_PATTERN.test(license)) return `https://spdx.org/licenses/${encodeURIComponent(license)}.html`;
  return "https://spdx.org/licenses/";
}

function npmPackageUrl(name) {
  return `https://www.npmjs.com/package/${name.split("/").map(encodeURIComponent).join("/")}`;
}

function stableId(...parts) {
  const slug = parts.join("-").toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "").slice(0, 70);
  return `${slug}-${sha256(Buffer.from(parts.join("\u0000"))).slice(0, 10)}`;
}

function assertEmbeddedSet(name, entries) {
  if (!entries.length) throw new Error(`Recurso incorporado ausente do manifesto: ${name}.`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readExactFile(filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) throw new Error(`Arquivo obrigatório ausente: ${filePath}`);
  return fs.readFileSync(filePath, "utf8").replace(/\r\n/gu, "\n").trim();
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function escapeHtml(value) {
  return String(value).replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

module.exports = {
  ATTRIBUTIONS_SCHEMA,
  collectAttributions,
  renderAttributionsPage,
  validateAttributionsData,
};
