// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const COMMON_EDITOR_ACTIONS = Object.freeze([
  { group: "variaveis", id: "insertVariableExpressionButton", insert: "${campo}", label: "Inserir variável", hint: "Inserir marcador ${campo}." },
  { group: "variaveis", id: "insertLastConversationButton", insert: "${ultimaconversa}", label: "Inserir última conversa", hint: "Inserir a constante imutável ultimaconversa." },
  { group: "decisao", id: "insertInConversationButton", insert: "${$.emconversa()}", label: "Inserir em conversa", hint: "Testar a janela de conversa recente." },
  { group: "decisao", id: "insertIfFunctionButton", insert: "${$.if(condicao, 'sim', 'nao')}", label: "Inserir função condicional", hint: "Inserir $.if com avaliação preguiçosa." },
  { group: "decisao", id: "insertIfElseButton", insert: "${if (condicao) { 'sim' } else { 'nao' }}", label: "Inserir if/else", hint: "Inserir construção if/else." },
  { group: "logica", id: "insertLogicButton", insert: "${$.and(condicao1, condicao2)}", label: "Inserir função lógica", hint: "Inserir função lógica and; or e xor usam o mesmo formato." },
  { group: "matematica", id: "insertMathButton", insert: "${$.media(valor1, valor2)}", label: "Inserir função matemática", hint: "Inserir média; min e max usam o mesmo formato." },
  { group: "controle", id: "insertPauseButton", insert: "\n$pause$\n", label: "Inserir pausa de alternância", hint: "Ceder o turno na próxima fronteira válida." },
  { group: "controle", id: "insertDayPeriodButton", insert: "$diatarde$", label: "Inserir saudação por horário", hint: "Inserir $diatarde$, substituído no envio." },
  { group: "controle", id: "insertVariantButton", insert: "\n\n^^^\n\n", label: "Inserir separador de modelos", hint: "Criar novo modelo separado por ^^^." },
]);

module.exports = { COMMON_EDITOR_ACTIONS };
