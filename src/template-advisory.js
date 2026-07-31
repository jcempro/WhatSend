// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

(function exposeTemplateAdvisory(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.WhatSendAdvisory = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createTemplateAdvisory() {
  "use strict";

  const GREETING_PATTERN = /\b(bom\s+dia|boa\s+tarde|boa\s+noite)\b/giu;
  const VOCATIVE_PATTERN = /(?:^|[^\p{L}])(olá|ola|oi|prezad[oa]|car[oa])\s*,?\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][\p{Ll}áàâãéêíóôõúüç]{2,}(?:[-'][A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]?[\p{Ll}áàâãéêíóôõúüç]+)*)/giu;
  const KNOWN_TERMS = new Set(["Cliente", "Clientes", "Equipe", "WhatSend", "WhatsApp"]);

  function analyzeTemplate(value) {
    const source = String(value == null ? "" : value).replace(/\r\n?/g, "\n");
    const searchable = protectSyntax(source);
    const issues = [];
    collectMatches(searchable, GREETING_PATTERN, (match) => ({
      code: "LITERAL_DAY_GREETING",
      index: match.index,
      length: match[0].length,
      message: "Saudação dependente do horário detectada. Substitua por $diatarde$.",
      severity: "error",
      value: source.slice(match.index, match.index + match[0].length),
    }), issues, source);
    collectMatches(searchable, VOCATIVE_PATTERN, (match) => {
      const name = match[2];
      const index = match.index + match[0].lastIndexOf(name);
      if (!/^\p{Lu}/u.test(name) || KNOWN_TERMS.has(name)) return null;
      return {
        code: "POSSIBLE_LITERAL_NAME",
        index,
        length: name.length,
        message: "Possível nome próprio literal. Considere usar ${nome}; mantenha o texto se for intencional.",
        severity: "warning",
        value: name,
      };
    }, issues, source);
    return issues.sort((left, right) => left.index - right.index || left.code.localeCompare(right.code));
  }

  function protectSyntax(source) {
    const characters = Array.from(source);
    const patterns = [
      /```[\s\S]*?```/gu,
      /`[^`\n]*`/gu,
      /\$\{[^{}]*\}/gu,
      /\$(?:diatarde|postagem)\$/giu,
      /!\[[^\]]*\]\([^)]*\)/gu,
      /https?:\/\/[^\s)]+/giu,
    ];
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(source)) !== null) {
        for (let index = match.index; index < match.index + match[0].length; index += 1) {
          if (characters[index] !== "\n") characters[index] = " ";
        }
      }
    }
    return characters.join("");
  }

  function collectMatches(searchable, pattern, mapper, issues, source) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(searchable)) !== null) {
      const issue = mapper(match);
      if (!issue) continue;
      const location = locate(source, issue.index);
      issues.push({ ...issue, column: location.column, line: location.line });
    }
  }

  function locate(source, index) {
    const lines = source.slice(0, index).split("\n");
    return { column: lines[lines.length - 1].length + 1, line: lines.length };
  }

  return { analyzeTemplate, protectSyntax };
});
