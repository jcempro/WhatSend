# Contexto mestre — FT-029 e FT-030

## Fonte e objetivo

- Fonte canônica: `.ia.rules/state/TODO.ia.md`, frente `Implementar ${remetente} conforme RCF, com suporte funcional condicional no modo Node e preview semanticamente representativo`.
- FT normativa: `FT-029`.
- FT de código dependente: `FT-030`.
- Objetivo global: adicionar uma variável reservada de remetente sem criar parser, estado, evento, toolbar ou preview paralelo.

## Estado arquitetural comprovado

- `src/template.js`: `applyTemplate` é o renderizador material único e já resolve constantes por `options.reserved` antes dos dados CSV.
- `src/campaign.js`: envio sequencial e alternado possuem duas chamadas explícitas de `applyTemplate`; ambas já passam `ultimaconversa` como valor reservado.
- `src/gui.js`: `validateGuiPayload`, `runGuiCampaign` e `buildGuiTemplatePreview` compõem a rota Node; `templateBlocks`, `handleTemplateInputChanged`, `setEditorContent`, `removeTemplateTab` e `syncTemplateHidden` são o ciclo reativo autoritativo do editor.
- `src/editor-actions.js`: `COMMON_EDITOR_ACTIONS` gera os comandos comuns das toolbars Node e offline.
- `scripts/build-offline-bundle.js`: o painel offline projeta o painel canônico da GUI e mantém adaptador client-side local; o preview offline usa a linha CSV selecionada e o avaliador comum de expressões.
- RCF vigente: RN003 define variáveis CSV e constantes reservadas somente para `ultimaconversa`; `${remetente}` ainda não está definido.

## Equalização

- A ocorrência da variável deve ser detectada sem distinção de caixa, coerente com RN003.
- O rodapé `@@embedded` não participa da detecção nem da substituição, coerente com RN006.
- O valor reservado prevalece sobre coluna CSV homônima e nunca é persistido no modelo.
- O campo é exclusivo da GUI executora Node; CLI e bundle offline não inventam entrada equivalente.
- O preview usa, nesta ordem: valor real válido; valor deterministicamente inferível; exemplo inequivocamente fictício; notação literal.
- `${remetente}` sem valor real pode aparecer no preview como remetente de exemplo, mas envio pela GUI Node permanece bloqueado.
- A inserção automática de espaço ocorre somente diante de letra ou número Unicode imediatamente subsequente; pontuação, símbolo, espaço, quebra ou fim não recebem espaço artificial.

## Ordem

1. Concluir e validar FT-029 em commit normativo.
2. Interromper e obter autorização humana posterior.
3. Executar FT-030 em componentes comuns, envio, GUI/editor, preview offline, testes e integração.

## Aceite global

- Uma única semântica de remetente entre validação, preview e envio.
- Campo visível/obrigatório exatamente quando qualquer modelo aberto contém a variável.
- Nenhuma substituição persistida antes do envio.
- Toolbar comum e preview semanticamente representativo nos dois editores.
- Testes funcionais, build, paridade offline e validação de distribuição sem regressão.
