# RCF — Governança da TO-DO

Esta seção de governança DEVE permanecer no topo do arquivo, NÃO PODE ser removida nem editada e rege todas as TO-DOs posteriores até o marcador explícito de início das TO-DOs operacionais.

O arquivo TODO.ia.md não pode ser removido.

## 1. Estrutura normativa do arquivo

Este arquivo constitui uma lista normativa e operacional de TO-DOs convergentes.

Todo item de topo DEVE:

- iniciar exatamente com `- [ ]` ou `- [x]`;
- começar sem indentação;
- representar uma frente autônoma subordinada às normas deste RCF.

Todo conteúdo imediatamente posterior a um item de topo, enquanto não houver outro item iniciado sem indentação por `- [ ]` ou `- [x]`, DEVE ser interpretado como subordinado ao item de topo imediatamente anterior.

A forma interna dessa subordinação é livre: PODE conter subtítulos, subitens, regras em estilo RCF, ordens, critérios, listas de afazeres, etapas, notas ou estruturas equivalentes. A semântica hierárquica prevalece sobre a forma.

A formatação do arquivo DEVE preservar indentação visual coerente e inequívoca de todo conteúdo subordinado. Títulos, listas, blocos e demais conteúdos pertencentes a um item de topo DEVEM permanecer visualmente aninhados a ele.

## 2. Status, andamento e conclusão

A marcação `[x]` NÃO significa conclusão: indica apenas que o item foi lido, teve sua FT criada e encontra-se em andamento. Itens NÃO iniciados DEVEM permanecer como `[ ]`.

TO-DOs integralmente concluídas DEVEM ser removidas, mantendo o arquivo limpo.

## 3. Regra perene de convergência

- [ ] Equalizar e executar as TO-DOs como frentes convergentes de um único objetivo
  - Este item rege todas as demais TO-DOs. Cada uma DEVE ser tratada como frente complementar de uma única execução, conciliada com as demais e convergente ao objetivo principal do projeto.

  - Contradições aparentes DEVEM ser presumidas como imprecisão redacional e resolvidas por equalização, sem perda de intenção, requisito, restrição ou nuance. Havendo conflito material não solucionável pelas normas e pelo contexto, o desenvolvedor DEVE ser consultado.

  - Considerações, comparações ou solicitações PODEM não ser plenamente aderentes ao projeto, especialmente quando previamente processadas por IA. Salvo dúvida material, a IA DEVE interpretá-las conforme o contexto já normatizado no RCF e no `README.md`; persistindo ambiguidade ou incompatibilidade, DEVE consultar o desenvolvedor antes de prosseguir.

  - O `AGENTS.md` prevalece absolutamente; o RCF vigente prevalece sobre as demais fontes subordinadas. Toda alteração DEVE aprimorar o projeto, ampliar capacidades e recursos, preservar compatibilidade e força normativa e NÃO PODE introduzir regressão.

  - Antes de executar qualquer TO-DO, a IA DEVE:
    1. ler integralmente todas as TO-DOs e normas aplicáveis;
    2. equalizar objetivos, requisitos, dependências, precedências e terminologia;
    3. resolver incompatibilidades, ambiguidades, sobreposições e lacunas;
    4. adaptar, consolidar, desmembrar, reordenar ou eliminar itens somente quando isso aumentar a coerência sem reduzir o objetivo material.

  - Toda TO-DO DEVE ser separada em:
    - **Normatização (RCF):** atualização de RCFs, contratos, precedências e documentação normativa necessária;
    - **Implementação:** código, migrações, testes, validações e alterações funcionais.

  - Após a equalização, a IA DEVE iniciar e concluir imediatamente a **Normatização RCF de todas as TO-DOs**, mantendo rastreabilidade entre cada regra e sua implementação futura.

  - Concluída a normatização, a IA DEVE INTERROMPER antes de qualquer implementação e solicitar autorização expressa do desenvolvedor, informando sucintamente:
    - implementações pendentes;
    - dependências e ordem recomendada;
    - impedimentos materiais identificados.

  - Somente quando aplicável ao contexto do repositório, toda alteração que modifique o modo de codificar Markdown DEVE ser documentada no respectivo modo de uso.

  - Este item e toda a seção `# RCF — Governança da TO-DO` são perenes: NÃO PODEM ser marcados como concluídos, removidos ou alterados. Sua contabilização somente é necessária enquanto existir ao menos uma TO-DO por eles regida.

---

# TO-DOs

Este marcador encerra a seção de governança e inicia exclusivamente as TO-DOs operacionais. Todo item de topo abaixo dele está sujeito integralmente ao RCF acima.

✅ Implementar `${remetente}` conforme RCF, com suporte funcional condicional no modo Node e preview semanticamente representativo
  - Antes de implementar, DEVE-SE inspecionar o estado real, RCFs, arquitetura, contratos, UI, editor, preview e mecanismos existentes. É PROIBIDO presumir APIs, eventos, componentes, fluxos ou semânticas não comprovados, criar lógica paralela ou divergir da definição normativa já existente.

  - ## Semântica e substituição
    - `${remetente}` DEVE reutilizar integralmente a definição já existente no RCF, sem criar semântica paralela.
    - Seu suporte funcional de entrada na UI DEVE existir **exclusivamente no modo Node**.
    - O valor informado DEVE substituir `${remetente}` **somente no momento efetivo do envio**.
    - O campo DEVE aceitar apenas nome próprio válido de **pessoa ou empresa**:
      - letras e espaços permitidos;
      - números e símbolos proibidos.
    - Antes da substituição, o valor DEVE receber `trim()` global equivalente e ser normalizado para **Title Case**: primeira letra de cada palavra maiúscula e demais letras minúsculas.
    - O valor substituído DEVE usar formatação WhatsApp em **negrito + itálico**, incluindo `:`.
      - Ex.: `jean carlo` → `*_Jean Carlo:_*`
    - Se `${remetente}` estiver imediatamente colado a texto textual subsequente, a substituição DEVE garantir **exatamente um espaço** entre ambos.
      - Ex.: `${remetente}que bom...` → `*_Jean Carlo:_* que bom...`
    - Essa inserção automática de espaço NÃO se aplica quando o próximo caractere for pontuação, como `,`, `.`, `;` ou equivalente semanticamente análogo.

  - ## Campo condicional no modo Node
    - A UI do modo Node DEVE exibir o campo de remetente **se e somente se** qualquer modelo atualmente aberto no editor contiver `${remetente}`.
    - Se nenhum modelo aberto contiver `${remetente}`, o campo:
      - NÃO DEVE ser exibido;
      - NÃO DEVE ser obrigatório;
      - NÃO DEVE bloquear envio.
    - Se ao menos um modelo aberto contiver `${remetente}`, o campo:
      - DEVE ser exibido;
      - DEVE tornar-se obrigatório;
      - DEVE impedir o envio enquanto estiver vazio ou inválido.
    - O campo DEVE seguir integralmente o estilo visual já normatizado e possuir posicionamento coerente, contextual e visualmente adequado à função.

  - ## Reatividade ao conteúdo do editor
    - A exibição/ocultação NÃO DEVE depender de clicar em executar/enviar: DEVE reagir continuamente ao conteúdo real dos modelos abertos.
    - Ao surgir a **primeira ocorrência** de `${remetente}` em qualquer modelo aberto, o campo DEVE ser exibido imediatamente.
    - Enquanto existir ao menos uma ocorrência em qualquer modelo aberto, o campo DEVE permanecer visível e obrigatório.
    - Ao desaparecer a **última ocorrência** de todos os modelos abertos, o campo DEVE ser ocultado, deixar de ser obrigatório e deixar de bloquear envio.
    - A detecção DEVE funcionar independentemente da origem da alteração, incluindo:
      - digitação manual;
      - exclusão;
      - colagem;
      - substituição;
      - carregamento/importação de arquivo;
      - troca, abertura ou fechamento de modelo;
      - qualquer outro mecanismo existente que altere o conteúdo efetivamente aberto no editor.
    - A implementação DEVE usar o mecanismo reativo apropriado já existente. NÃO DEVE introduzir polling, duplicação de estado, parsing redundante, observadores paralelos ou lógica equivalente sem necessidade comprovada.

  - ## Barra de ferramentas de comandos
    - A barra de ferramentas destinada à inserção de comandos/notações DEVE incluir um botão próprio para `${remetente}`.
    - O botão DEVE:
      - possuir ícone semanticamente adequado;
      - seguir estilização, dimensões, estados visuais, acessibilidade e comportamento já padronizados;
      - inserir literalmente `${remetente}`;
      - reutilizar o mesmo fluxo/mecanismo de edição dos demais comandos;
      - respeitar cursor, seleção e demais contratos existentes do editor.
    - NÃO DEVE ser criada experiência visual ou mecanismo de inserção paralelo quando a abstração existente já for adequada.

  - ## Preview
    - O preview DEVE, **independentemente de estar ou não na UI do modo Node**, priorizar a representação do **resultado efetivamente exibido ao destinatário**, e NÃO do código-fonte com `$...$`, `${...}` ou outras notações internas.
    - Sempre que uma notação puder ser substituída, inferida ou exemplificada com segurança **sem depender da execução efetiva do Node**, o preview DEVE exibir seu equivalente renderizado.
    - A resolução DEVE obedecer à seguinte precedência:
      1. valor real já disponível na UI/estado atual → usar o valor real;
      2. valor deterministicamente inferível sem processamento Node → usar o valor inferido;
      3. variável cuja finalidade permita exemplificação inequívoca → PODE usar valor ilustrativo claramente fictício;
      4. valor não resolvível nem exemplificável com segurança → preservar literalmente a notação original.
    - Exemplo meramente ilustrativo: `${nome}` → `Fulano`, e `${remetente}` → `Sicrano` (devidamente formado conforme as regras já definidas).
    - Valores ilustrativos DEVEM ser inequivocamente reconhecíveis como exemplos de preview, NÃO como dados reais nem como resultado de processamento efetivo.
    - O preview:
      - PODE usar valores exemplificativos para variáveis presumíveis quando isso melhorar compreensão;
      - NÃO DEVE inventar valores cuja avaliação dependa do Node, de dados indisponíveis ou de contexto não comprovado;
      - NÃO DEVE apresentar como resolvido aquilo que somente pode ser conhecido no processamento/envio real;
      - DEVE preservar literalmente a notação quando não houver resolução/exemplificação segura;
      - DEVE aplicar a formatação visual equivalente ao resultado final sempre que ela puder ser determinada sem processamento Node.
    - Para `${remetente}`, quando houver valor válido disponível na UI, o preview DEVE refletir a mesma normalização e formatação previstas para o envio; quando isso não for possível com segurança, DEVE seguir a precedência acima, com inferência inequivocamente fictícia.

  - ## Sincronização
    - O sistema DEVE manter coerência contínua entre:
      - conteúdo dos modelos abertos;
      - presença/ausência real de `${remetente}`;
      - visibilidade e obrigatoriedade do campo;
      - validade do valor;
      - possibilidade de envio;
      - botão de inserção;
      - preview.
    - A atualização DEVE ocorrer tão logo o estado relevante mude, sem depender de ação posterior do usuário.

  - ## Restrições
    - É PROIBIDO:
      - condicionar a atualização do campo ao fluxo de execução/envio;
      - presumir arquitetura ou APIs inexistentes;
      - duplicar lógica de parsing/detecção já existente;
      - introduzir polling quando houver mecanismo reativo apropriado;
      - exibir valor fictício como se fosse real;
      - executar Node apenas para tornar o preview representativo quando a informação puder ser resolvida localmente;
      - ocultar notação no preview quando não houver forma segura de determinar seu equivalente;
      - alterar comportamento de execução, substituição ou envio além do necessário para esta especificação;
      - permitir envio com `${remetente}` presente e campo vazio/inválido.

  - ## Validação obrigatória
    - Validar, no mínimo:
      - inserção manual da primeira ocorrência de `${remetente}`;
      - remoção manual da última ocorrência;
      - inserção por colagem;
      - inserção pelo novo botão;
      - carregamento/importação de arquivo contendo `${remetente}`;
      - carregamento/troca para arquivo sem `${remetente}`;
      - abertura/fechamento de múltiplos modelos, com ocorrência em apenas um deles;
      - remoção da última ocorrência entre vários modelos;
      - campo oculto e não obrigatório quando não aplicável;
      - campo visível, obrigatório e bloqueando envio quando aplicável e inválido/vazio;
      - validação de nome de pessoa e empresa;
      - rejeição de números e símbolos;
      - `trim()` global;
      - normalização Title Case;
      - `jean carlo` → `*_Jean Carlo:_*`;
      - inserção de exatamente um espaço quando `${remetente}` estiver colado a texto;
      - ausência dessa inserção antes de pontuação;
      - substituição somente no envio efetivo;
      - preview com valor real quando disponível;
      - preview com valor inferível quando aplicável;
      - preview com exemplo fictício somente quando seguro;
      - preservação da notação quando não houver resolução segura;
      - ausência de regressão na UI fora do modo Node;
      - comportamento equivalente independentemente da origem da alteração do conteúdo.

  - ## Critérios de aceite
    - A implementação somente estará concluída quando:
      - `${remetente}` estiver plenamente aderente ao RCF;
      - o campo surgir/desaparecer automaticamente conforme a presença real da notação nos modelos abertos;
      - obrigatoriedade e bloqueio de envio acompanharem exatamente esse estado;
      - validação, `trim()`, Title Case, formatação `*_Nome:_*` e regra de espaçamento funcionarem corretamente;
      - o botão `${remetente}` estiver integrado à barra padronizada;
      - o preview representar, tanto quanto tecnicamente possível e seguro, a mensagem final em vez das notações internas;
      - valores não resolvíveis permaneçam codificados;
      - nenhuma suposição arquitetural, duplicação desnecessária, semântica paralela ou regressão seja introduzida.
