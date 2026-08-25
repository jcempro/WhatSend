// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

(function exposeCsvContract(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.WhatSendCsv = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createCsvContract() {
  "use strict";

  const PHONE_ALIASES = Object.freeze(["telefone", "fone"]);
  const DELIMITERS = Object.freeze([";", ",", "\t", "|"]);

  function normalizeHeader(value) {
    return String(value == null ? "" : value).trim().toLocaleLowerCase("pt-BR");
  }

  function validateHeaders(headers) {
    const original = Array.from(headers || [], (value) => String(value == null ? "" : value).trim());
    const normalized = original.map(normalizeHeader);
    const errors = [];
    const seen = new Set();

    normalized.forEach((name, index) => {
      if (!name) errors.push(`Cabeçalho vazio na coluna ${index + 1}.`);
      if (name && seen.has(name)) errors.push(`Cabeçalho duplicado após normalização: ${original[index]}.`);
      seen.add(name);
    });

    if (!seen.has("nome")) errors.push("colunas obrigatórias ausentes: nome.");
    const phoneHeaders = PHONE_ALIASES.filter((name) => seen.has(name));
    if (phoneHeaders.length === 0) errors.push("colunas obrigatórias ausentes: telefone ou fone.");
    if (phoneHeaders.length > 1) {
      errors.push("As colunas telefone e fone são aliases mutuamente exclusivos; mantenha somente uma.");
    }

    return {
      errors: unique(errors),
      ok: errors.length === 0,
      original,
      phoneHeader: phoneHeaders[0] || "",
    };
  }

  function parseCsv(text, options = {}) {
    const source = String(text == null ? "" : text).replace(/^\ufeff/u, "");
    if (!source.trim()) throw new Error("CSV inválido: arquivo vazio.");
    const candidates = options.delimiter ? [options.delimiter] : DELIMITERS;
    const attempts = candidates.map((delimiter) => {
      try {
        const rows = parseDelimited(source, delimiter);
        const validation = validateHeaders(rows[0] || []);
        const width = (rows[0] || []).length;
        const consistent = rows.filter((row) => row.length === width).length;
        return { delimiter, rows, validation, score: (validation.ok ? 10000 : 0) + width * 20 + consistent };
      } catch (error) {
        return { delimiter, error, rows: [], score: -Infinity };
      }
    }).sort((left, right) => right.score - left.score);
    const selected = attempts[0];
    if (!selected || !selected.rows.length) throw new Error("CSV inválido: formato não reconhecido.");
    if (!selected.validation.ok) throw new Error(`CSV inválido: ${selected.validation.errors.join(" ")}`);
    const headers = selected.validation.original;
    const inconsistentRow = selected.rows.slice(1).findIndex((row) => row.length !== headers.length);
    if (inconsistentRow >= 0) {
      throw new Error(`CSV inválido: linha ${inconsistentRow + 2} possui quantidade de colunas diferente do cabeçalho.`);
    }
    const records = selected.rows.slice(1).filter((row) => row.some((cell) => String(cell).trim())).map((row) => {
      const record = {};
      headers.forEach((header, index) => { record[header] = row[index] == null ? "" : String(row[index]); });
      return record;
    });
    return { delimiter: selected.delimiter, headers, phoneHeader: selected.validation.phoneHeader, records, rows: selected.rows };
  }

  function validateRecords(headers, records) {
    const validation = validateHeaders(headers);
    const issues = validation.errors.map((message) => ({ column: "", message, row: 1 }));
    if (!validation.ok) return { issues, ok: false, phoneHeader: validation.phoneHeader };
    const headerByNormalized = new Map(validation.original.map((header) => [normalizeHeader(header), header]));
    const nameHeader = headerByNormalized.get("nome");
    const phoneHeader = headerByNormalized.get(validation.phoneHeader);
    Array.from(records || []).forEach((record, index) => {
      const row = index + 2;
      if (!String(record && record[nameHeader] != null ? record[nameHeader] : "").trim()) {
        issues.push({ column: nameHeader, message: "Nome obrigatório não informado.", row });
      }
      if (!String(record && record[phoneHeader] != null ? record[phoneHeader] : "").trim()) {
        issues.push({ column: phoneHeader, message: "Telefone obrigatório não informado.", row });
      }
    });
    return { issues, ok: issues.length === 0, phoneHeader };
  }

  function parseDelimited(source, delimiter) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (quoted) {
        if (character === '"' && source[index + 1] === '"') { field += '"'; index += 1; }
        else if (character === '"') quoted = false;
        else field += character;
      } else if (character === '"' && field.length === 0) quoted = true;
      else if (character === delimiter) { row.push(field); field = ""; }
      else if (character === "\n" || character === "\r") {
        if (character === "\r" && source[index + 1] === "\n") index += 1;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += character;
    }
    if (quoted) throw new Error("Campo CSV com aspas não finalizadas.");
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function serializeCsv(headers, records, options = {}) {
    const validation = validateHeaders(headers);
    if (!validation.ok) throw new Error(validation.errors.join(" "));
    const warnings = [];
    const lines = [validation.original.map(quoteField).join(";")];
    for (const record of records || []) {
      lines.push(validation.original.map((header) => {
        let value = String(record && record[header] != null ? record[header] : "");
        if (/^[=+\-@]/u.test(value)) {
          value = `'${value}`;
          warnings.push(`Valor potencialmente executável neutralizado na coluna ${header}.`);
        }
        return quoteField(value);
      }).join(";"));
    }
    return { content: `${options.bom === false ? "" : "\ufeff"}${lines.join("\r\n")}\r\n`, warnings: unique(warnings) };
  }

  function quoteField(value) {
    return `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
  }

  function unique(values) {
    return [...new Set(values)];
  }

  return { PHONE_ALIASES, normalizeHeader, parseCsv, serializeCsv, validateHeaders, validateRecords };
});
