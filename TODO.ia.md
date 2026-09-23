- [x] **Atualizar dinamicamente o título da página com progresso e estado do envio de mensagens:** o título do documento DEVE comunicar, de forma imediata, inequívoca e continuamente atualizada, o percentual inteiro de progresso e o estado corrente do processo de preparação, processamento e envio de mensagens.
  - Validação explicita humana: aprovado. Concluir e remover artefatos passíveis conforme RCF e agents.md.


* [x] **Adicionar aviso explícito de desenvolvimento ao painel superior `Licença`:** o painel superior identificado como `Licença` DEVE exibir, além do conteúdo já existente, aviso curto, claro e imediatamente visível informando que o produto está em desenvolvimento e pode conter erros.
  - Validação explicita humana: aprovado. Concluir e remover artefatos passíveis conforme RCF e agents.md.

- [x] Issue — Tornar `telefone` e `fone` aliases equivalentes, `case-insensitive` e mutuamente exclusivos
  - Validação explicita humana: aprovado. Concluir e remover artefatos passíveis conforme RCF e agents.md.

- [x] Issue — Novo bundle autônomo e integralmente offline do painel `Modelo de mensagem`
  - Validação explicita humana: aprovado. Concluir e remover artefatos passíveis conforme RCF e agents.md.

* [x] **Criar formato unificado, reversível e interoperável para modelo `.md` e dados `.csv`:** manter integralmente os arquivos separados atualmente utilizados — `.md` para o modelo de mensagem e `.csv` para os dados — e acrescentar formato unificado capaz de encapsular ambos sem perda, alteração semântica ou dependência entre seus conteúdos.
  - Validação explicita humana: aprovado. Concluir e remover artefatos passíveis conforme RCF e agents.md.

* [x] **Detectar saudações literais e nomes próprios no modelo de mensagem:** tanto a página principal quanto o bundle offline DEVEM analisar continuamente o conteúdo do modelo de mensagem e sinalizar, de forma visível e chamativa, usos potencialmente incorretos de saudações literais dependentes do horário e de nomes próprios inseridos diretamente no texto.
  - Validação explicita humana: aprovado. Concluir e remover artefatos passíveis conforme RCF e agents.md.

* [x] **Reestruturar a organização dos diretórios conforme `AGENTS.md`, somente quando materialmente necessário:** inspecionar a estrutura real do repositório e reorganizá-la apenas se houver divergência comprovada em relação ao padrão normatizado para `src/`, `dist/` e `scripts/`. A atuação DEVE ser mínima, cirúrgica, rastreável e isenta de alterações meramente estéticas. A inspeção DEVE abranger especialmente `src/brand/` e o eventual conjunto preconstruído de `src/brand/html-favicon/`, utilizando integralmente os recursos de identidade visual realmente existentes e adaptando ou gerando automaticamente favicons, manifestos e referências somente em tempo de build e quando o destino de publicação exigir. Se a inspeção demonstrar ser técnica, arquitetural e operacionalmente mais inteligente e conveniente, PODE substituir o conjunto preconstruído pelo `RealFaviconGenerator` (`https://github.com/RealFaviconGenerator/realfavicongenerator`), instalado via npm e executado apenas no build, preservando como fontes canônicas somente os logotipos/ícones originais em `src/brand/` e a configuração central aninhada aplicável. A centralização de configurações DEVE ser preservada e, quando houver fragmentação ou duplicação material, otimizada sem criar acoplamento indevido. Nomes de diretórios e arquivos DEVEM identificar claramente sua finalidade quando a alteração for aplicável, válida e não regressiva.
  - Validação explicita humana: aprovado. Concluir e remover artefatos passíveis conforme RCF e agents.md.

- [x] Corrigir erro no `npm install` e `npm update` abaixo.
  - Validação explicita humana: aprovado. Concluir e remover artefatos passíveis conforme RCF e agents.md.
    - Validação explicita humana: aprovado. Concluir e remover artefatos passíveis conforme RCF e agents.md.

📌 Implementar `${remetente}` conforme RCF, com suporte funcional condicional no modo Node e preview semanticamente representativo
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
    - Exemplo meramente ilustrativo: `${nome}` → `Fulano`, e `${remetente}` → `Sicrano` (devidamente formado conforme regras já definidas).
    - Valores ilustrativos DEVEM ser inequivocamente reconhecíveis como exemplos de preview, NÃO como dados reais nem como resultado de processamento efetivo.
    - O preview:
      - PODE usar valores exemplificativos para variáveis presumíveis quando isso melhorar compreensão;
      - NÃO DEVE inventar valores cuja avaliação dependa do Node, de dados indisponíveis ou de contexto não comprovado;
      - NÃO DEVE apresentar como resolvido aquilo que somente pode ser conhecido no processamento/envio real;
      - DEVE preservar literalmente a notação quando não houver resolução/exemplificação segura;
      - DEVE aplicar a formatação visual equivalente ao resultado final sempre que ela puder ser determinada sem processamento Node.
    - Para `${remetente}`, quando houver valor válido disponível na UI, o preview DEVE refletir a mesma normalização e formatação previstas para o envio; quando isso não for possível com segurança, DEVE seguir a precedência acima, de finferência inequivocamente fictícia.

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
