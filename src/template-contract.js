// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

(function exposeTemplateContract(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.WhatSendTemplateContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createTemplateContract() {
  "use strict";

  const SENDER_IDENTIFIER = "remetente";
  const SENDER_PREVIEW_EXAMPLE = "Sicrano";
  const SENDER_MARKER_PATTERN = /\$\{\s*remetente\s*\}/iu;
  const SENDER_VALUE_PATTERN = /^(?=.*\p{L})[\p{L} ]+$/u;

  /** Informa se um texto editável contém o identificador reservado de remetente. */
  function containsSenderMarker(template) {
    return SENDER_MARKER_PATTERN.test(String(template || ""));
  }

  /** Consolida a presença do marcador no estado canônico de vários blocos abertos. */
  function containsSenderMarkerInBlocks(blocks) {
    return Array.from(blocks || []).some(containsSenderMarker);
  }

  /** Reconhece somente a expressão simples reservada, sem capturar colunas homônimas. */
  function isSenderExpression(expression) {
    return String(expression || "").trim().toLocaleLowerCase("pt-BR") === SENDER_IDENTIFIER;
  }

  /** Remove exclusivamente espaços U+0020 das extremidades, preservando o interior. */
  function trimOuterSpaces(value) {
    return String(value == null ? "" : value).replace(/^ +| +$/gu, "");
  }

  /** Normaliza cada sequência de letras como nome próprio em locale pt-BR. */
  function normalizeSender(value) {
    return trimOuterSpaces(value).replace(/\p{L}+/gu, (word) => {
      const lower = word.toLocaleLowerCase("pt-BR");
      return lower.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("pt-BR"));
    });
  }

  /** Aplica a regra histórica de exibição do nome do destinatário no template. */
  function formatNameForMessage(name) {
    return String(name || "")
      .trim()
      .split(/\s+/u)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.split("-").map((piece) => {
        const lower = piece.toLocaleLowerCase("pt-BR");
        return lower.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("pt-BR"));
      }).join("-"))
      .join(" ");
  }

  /** Valida, normaliza e materializa o remetente sem lançar exceção para a UI. */
  function validateSender(value) {
    const trimmed = trimOuterSpaces(value);
    if (!trimmed) {
      return { error: "Informe o remetente.", normalized: "", rendered: "", valid: false };
    }
    if (!SENDER_VALUE_PATTERN.test(trimmed)) {
      return {
        error: "O remetente deve conter somente letras e espaços.",
        normalized: "",
        rendered: "",
        valid: false,
      };
    }
    const normalized = normalizeSender(trimmed);
    return {
      error: "",
      normalized,
      rendered: `*_${normalized}:_*`,
      valid: true,
    };
  }

  /** Materializa um remetente válido ou interrompe o chamador com erro de contrato. */
  function renderSender(value) {
    const validation = validateSender(value);
    if (!validation.valid) throw new Error(validation.error);
    return validation.rendered;
  }

  /** Acrescenta um espaço somente diante de letra ou número Unicode adjacente. */
  function appendSenderSpacing(rendered, followingText) {
    const nextCodePoint = Array.from(String(followingText || ""))[0] || "";
    return nextCodePoint && /[\p{L}\p{N}]/u.test(nextCodePoint)
      ? `${rendered} `
      : rendered;
  }

  return {
    SENDER_IDENTIFIER,
    SENDER_PREVIEW_EXAMPLE,
    appendSenderSpacing,
    containsSenderMarker,
    containsSenderMarkerInBlocks,
    formatNameForMessage,
    isSenderExpression,
    normalizeSender,
    renderSender,
    trimOuterSpaces,
    validateSender,
  };
});
