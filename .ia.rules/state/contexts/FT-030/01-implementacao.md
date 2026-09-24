# FT-030 — Implementação e integração

## Identidade e autorização

- Frente: `FT-030` — Implementar remetente condicional e preview representativo.
- Origem: `.ia.rules/state/TODO.ia.md#Implementar-${remetente}`.
- Dependência: `FT-029` concluída.
- Autorização humana explícita para código: recebida em 2026-09-23.

## Arquitetura comprovada e decisões

- `src/template.js` permanece o renderizador material único; o contrato reutilizável e compatível com navegador foi centralizado em `src/template-contract.js`.
- `src/campaign.js` injeta o reservado nos fluxos sequencial e intercalado imediatamente antes do plano de envio.
- `src/gui.js` usa `templateBlocks`, `syncTemplateHidden`, `setEditorContent`, `handleTemplateInputChanged` e `removeTemplateTab`; não foi criado polling nem segundo estado do editor.
- `src/editor-actions.js` continua sendo o catálogo comum projetado nas superfícies Node e offline.
- O bundle offline reutiliza o contrato comum, projeta a toolbar e remove explicitamente apenas o campo marcado como exclusivo do Node.

## Validações executadas

- Testes focais de remetente, GUI, toolbar, expressões e bundle: aprovados.
- Suíte direta do produto: 169/170 antes da auditoria final; a única falha restante comprova regressão da governança instalada na validação de assets do publicador de release.
- `npm run build:dist`: aprovado.
- `npm run validate:dist`: aprovado, inclusive instalação e pré-validação do pacote gerado.
- `git diff --check`: aprovado.

## Lacuna oficial reproduzida

- Finalidade esperada: a governança instalada deve materializar todos os destinos do manifesto e preservar as validações normativas do publicador de release.
- Ambiente: Windows, Node `v24.16.0`, branch `dev`, release operacional instalada `v0.1.14-rc5`.
- Reprodução:
  1. `npm run update:agents -- --check` declara a governança atualizada.
  2. `npm run update:agents -- --dry-run --force` declara ausência de alterações.
  3. `npm run agent:doctor` retorna `DOCTOR_OK` sem ausências.
  4. `npm run agent:repair` falha com `MANIFESTO_FONTE_AUSENTE`.
  5. `npm test` falha com `GOVERNANCA_INSTALADA_INCOMPLETA:scripts/.agents/autoupdate.ts`.
- Evidência adicional: `.ia.rules/distribution/source-manifest.json` exige `scripts/.agents/autoupdate.ts` e demais bridges condicionais, mas esses destinos não existem; os publicadores instalados também não contêm `ASSETS_RELEASE_INCOMPLETOS`, preservado pelo teste de regressão do produto.
- Impacto: bloqueia a validação global oficial e impede declarar a FT integralmente validada pelo mecanismo oficial.
- Limites: implementação e testes do produto, build e validação do distribuível são independentes e permanecem executáveis.
- Estratégia aderente: manter o núcleo gerenciado intocado, não fabricar bridges nem enfraquecer o teste de assets; aguardar correção upstream/novo pacote oficial e repetir atualização, teste global e rastreabilidade.

## Estado

Implementação material concluída; integração global permanece condicionada à lacuna oficial acima e à sincronização causal da rastreabilidade após commit material.
