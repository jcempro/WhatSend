// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const COMMON_EDITOR_ACTIONS = Object.freeze([
  { group: "variaveis", icon: "lucide:variable", id: "insertVariableExpressionButton", insert: "${campo}", label: "Inserir variável", hint: "Inserir marcador ${campo}." },
  { group: "variaveis", icon: "lucide:message-circle-more", id: "insertLastConversationButton", insert: "${ultimaconversa}", label: "Inserir última conversa", hint: "Inserir a constante imutável ultimaconversa." },
  { group: "decisao", icon: "lucide:message-circle-check", id: "insertInConversationButton", insert: "${$.emconversa()}", label: "Inserir em conversa", hint: "Testar a janela de conversa recente." },
  { group: "decisao", icon: "lucide:git-fork", id: "insertIfFunctionButton", insert: "${$.if(condicao, 'sim', 'nao')}", label: "Inserir função condicional", hint: "Inserir $.if com avaliação preguiçosa." },
  { group: "decisao", icon: "lucide:split", id: "insertIfElseButton", insert: "${if (condicao) { 'sim' } else { 'nao' }}", label: "Inserir if/else", hint: "Inserir construção if/else." },
  { group: "logica", icon: "lucide:workflow", id: "insertLogicButton", insert: "${$.and(condicao1, condicao2)}", label: "Inserir função lógica", hint: "Inserir função lógica and; or e xor usam o mesmo formato." },
  { group: "matematica", icon: "lucide:calculator", id: "insertMathButton", insert: "${$.media(valor1, valor2)}", label: "Inserir função matemática", hint: "Inserir média; min e max usam o mesmo formato." },
  { group: "controle", icon: "lucide:pause", id: "insertPauseButton", insert: "\n$pause$\n", label: "Inserir pausa de alternância", hint: "Ceder o turno na próxima fronteira válida." },
  { group: "controle", icon: "lucide:sun", id: "insertDayPeriodButton", insert: "$diatarde$", label: "Inserir saudação por horário", hint: "Inserir $diatarde$, substituído no envio." },
  { group: "controle", icon: "lucide:layers", id: "insertVariantButton", insert: "\n\n^^^\n\n", label: "Inserir separador de modelos", hint: "Criar novo modelo separado por ^^^." },
]);

module.exports = { COMMON_EDITOR_ACTIONS };
