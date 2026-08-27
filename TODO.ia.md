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

---

- [x] **Normatizar e implementar o bloqueio transacional da GUI durante envios automáticos:** incorporar de forma rigorosa, perene e verificável ao RCF o estado operacional dos envios, tendo o servidor como fonte autoritativa, e adequar GUI e backend para impedir concorrência indevida, perda de estado, comandos duplicados e dependência desnecessária de foco no navegador.
  - [ ] **Estado autoritativo:** o servidor local DEVE registrar e manter, por sessão, identificador, estado, início, progresso, pedido de interrupção, término e resultado de cada processo de envio. A GUI NÃO DEVE inferir esse estado apenas de memória local, componentes montados ou conexão anterior.
  - [ ] **Sincronização inicial e reconexão:** ao iniciar ou recarregar a GUI, restaurar conexão, selecionar sessão ou antes de exibir os painéis abrangidos, consultar obrigatoriamente o servidor e reconstruir o estado visual real. Fechar, recarregar ou reabrir o navegador NÃO PODE desbloquear controles enquanto o envio permanecer ativo. Perda de comunicação DEVE manter estado conservador até a reconciliação autoritativa.
  - [ ] **Bloqueio automático dos painéis:** exclusivamente durante envio ativo, bloquear integralmente formulários, botões e interações dos painéis de edição de modelo, filtros, CSV e demais configurações capazes de afetar o processamento. O painel DEVE ocultar automaticamente seu conteúdo, preservando apenas título e indicação de indisponibilidade, com aparência equivalente à de painel recolhido, mas sem ser manualmente retrátil. Seu estado original DEVE ser restaurado imediatamente após confirmação do servidor de conclusão, interrupção ou falha terminal.
  - [ ] **Preservação do estado:** o bloqueio NÃO PODE apagar valores, desmontar estado necessário, redefinir configurações nem permitir edição por atalhos, teclado, chamadas internas ou manipulação concorrente. Somente controles materialmente relacionados ao envio DEVEM ser bloqueados, salvo dependência técnica que exija escopo maior.
  - [ ] **Ciclo de vida dos processos:** processos, subprocessos, workers ou threads de envio DEVEM ser criados, supervisionados e rastreados pelo servidor. Se ele for encerrado, morto ou falhar irrecuperavelmente, seus descendentes NÃO PODEM permanecer órfãos; DEVEM encerrar-se automaticamente por grupo de processos, sinalização, supervisão ou mecanismo equivalente.
  - [ ] **Exclusividade por sessão:** é absolutamente PROIBIDO existir mais de um processo simultâneo para a mesma sessão. Antes de iniciar qualquer envio, o servidor DEVE validar atomicamente essa condição e impedir corridas, duplicações ou reentrância.
  - [ ] **Compatibilidade com múltiplas sessões:** a existência de envios simultâneos entre sessões distintas NÃO é recomendada e NÃO DEVE ser introduzida caso ainda não exista. Se a arquitetura atual já oferecer essa capacidade, ela NÃO DEVE ser regredida ou removida incidentalmente; DEVE apenas ser preservada sob isolamento rigoroso e limite absoluto de um processo por sessão.
  - [ ] **Troca ou abertura de sessão durante envio:** inspecionar o estado real antes de definir o comportamento:
    - se múltiplos envios simultâneos entre sessões NÃO forem suportados atualmente, a capacidade NÃO DEVE ser implementada nem permitida; qualquer tentativa de trocar, abrir ou iniciar outra sessão durante envio ativo — inclusive por GUI, terminal, URL, parâmetro ou comando — DEVE ser impedida e redirecionar para a sessão em processamento;
    - se a capacidade já existir, a troca ou abertura de outra sessão PODE prosseguir somente após aviso ultrassucinto, enfático e incisivo, exibido na GUI ou no terminal e sujeito a confirmação explícita de leitura, informando o altíssimo risco de bloqueio, suspensão ou perda das contas e números envolvidos e recomendando expressamente não realizar envios simultâneos;
    - a confirmação apenas autoriza prosseguir dentro da capacidade preexistente; NÃO elimina riscos, NÃO permite mais de um envio por sessão e NÃO autoriza ampliar ou reimplementar suporte multiprocesso.
  - [ ] **Mensagem mínima de risco:** adotar texto equivalente a: **“ALTO RISCO: envios simultâneos podem bloquear ou causar a perda das contas e números envolvidos. Não recomendado. Confirme que leu e deseja prosseguir.”** A confirmação DEVE ser inequívoca, registrada para a operação corrente e exigida novamente em nova tentativa materialmente distinta.
  - [ ] **Interrupção controlada:** implementar, caso inexista, botão claramente identificado para interromper o envio da sessão ativa. O acionamento DEVE solicitar interrupção imediata ao servidor, mas a GUI somente PODE declarar o envio interrompido, desbloquear painéis ou restaurar controles após confirmação autoritativa de término.
  - [ ] **Estados de interrupção:** distinguir, no mínimo, `solicitada`, `em interrupção`, `interrompida`, `concluída` e `falhou`. Repetições do comando DEVEM ser idempotentes e NÃO PODEM produzir sinais concorrentes, exceções indevidas ou atualização visual prematura.
  - [ ] **Proteção contra múltiplos acionamentos:** todo botão que inicie operação assíncrona DEVE impedir cliques rápidos, duplicação e reentrância. Após a primeira ação válida, DEVE receber marcador transitório, aparência de processamento e bloqueio funcional até resposta terminal. O servidor também DEVE rejeitar ou tornar idempotentes chamadas duplicadas, inclusive diretas, retransmitidas ou originadas por múltiplas instâncias da GUI.
  - [ ] **Transição ao WhatsApp:** a aba, guia ou janela do WhatsApp DEVE continuar sendo ativada no início do envio como medida prudencial. Isso NÃO DEVE eliminar, reduzir ou enfraquecer a busca permanente e agressiva, eliminar taldependência arquitetural. De igual modo, nao so a transição para, mas a exigilibilidade de manter a aba ou janela do whatsapp ativa, deve ser continuamente e agressivamente, mitigada, revisionada, aprimorada, otimizada para maximizar forca de atuação,l e aderência cross plataform e cross browser.
  - [ ] **Execução em segundo plano:** manter como objetivo contínuo e obrigatório eliminar, tanto quanto permitido pela plataforma e pela arquitetura, dependência de foco, visibilidade, primeiro plano ou navegador ativo. O envio DEVE buscar operar de forma contínua, resiliente e verificável em segundo plano, permitindo uso normal do computador, de outras janelas e aplicações.
  - [ ] **Limites externos:** a solução NÃO PODE burlar contratos, controles de segurança, restrições ou mecanismos antiautomação da plataforma. Dependências inevitáveis de janela ou navegador DEVEM ser detectadas, minimizadas, registradas e tratadas por fallback seguro, sem prometer garantia inexistente.
  - [ ] **Persistência e recuperação:** o servidor DEVE manter informações suficientes para responder corretamente após reinicialização da GUI. Se o próprio servidor reiniciar e os processos anteriores deixarem de existir, DEVE reconciliar registros persistidos com processos reais, marcar estados interrompidos e impedir indicação falsa de execução.
  - [ ] **Validação:** testar início, conclusão, falha, interrupção, cliques e chamadas duplicadas, recarregamento e fechamento da GUI, reconexão, troca ou abertura de sessão por todos os meios disponíveis, tentativa de segundo envio na mesma sessão, comportamento com múltiplas sessões quando preexistente, confirmação do aviso de risco, encerramento forçado do servidor, ausência de órfãos, restauração dos painéis e execução com aba ou navegador sem foco.
  - [ ] **Critério de aceite:** considerar concluído somente quando o RCF definir servidor autoritativo, bloqueio automático, restauração de estado, exclusividade por sessão, preservação sem ampliação da capacidade multiprocessos preexistente, proibição de implementá-la quando ausente, aviso de alto risco com confirmação, interrupção confirmada, proteção contra reentrância, ciclo de vida dos processos, recuperação após reconexão e evolução contínua para envio em segundo plano; e quando GUI e servidor implementarem e validarem integralmente esses contratos.

- [x] Implementar contexto isolado de conversa, condicionais/funções, alternância de envio, delay e suporte correspondente nos editores — evoluir e adicionar recursos sem reduzir, substituir ou regredir normas, features ou comportamentos válidos existentes.
  - Inspecionar previamente sintaxe, funções, constantes, parser/runtime, fluxo de envio, estado por destinatário, GUI, editores e contratos existentes. Reutilizar/estender o que já existir; NÃO duplicar funcionalidades, inventar arquitetura nem romper a notação/function syntax, diretrizes `TypeScript-like`, isolamento ou demais normas vigentes.

  - **Contexto imutável da conversa**
    - Criar a constante imutável `ultimaconversa`, utilizável em `${}`, contendo o timestamp da última postagem/mensagem preexistente da conversa **de/para o destinatário específico**.
    - DEVE ser determinada **uma única vez no início do fluxo de envio para aquele destinatário**, não a cada mensagem/postagem do mesmo fluxo.
    - Um fluxo com múltiplas mensagens para o mesmo destinatário DEVE conservar o mesmo valor, inclusive quando seu processamento for interrompido/intercalado temporariamente para envio a outros destinatários.
    - Mensagens/postagens automatizadas pertencentes ao próprio fluxo corrente NÃO PODEM alterar nem participar do cálculo.
    - O valor/contexto DEVE ser independente entre destinatários e isolado entre conversas.

  - **Função `emconversa(int?)`**
    - Criar, caso inexistente, a função global `emconversa(int?)`, compatível com a sintaxe de funções vigente e utilizável dentro de `${}`.
    - Retorno: booleano.
    - Objetivo: informar se existe conversa recente **com o destinatário corrente**.
    - DEVE usar `ultimaconversa`, ignorando integralmente mensagens automatizadas do fluxo atual.
    - Sem argumento, considerar os últimos **15 minutos**, cujo valor padrão DEVE ser configurável em ponto central adequado à arquitetura existente.
    - Com argumento inteiro, usar esse valor em minutos como lapso substitutivo apenas daquela avaliação.
    - A avaliação e todos os dados intermediários DEVEM permanecer estritamente vinculados ao destinatário corrente.

  - **Funções condicionais/lógicas**
    - Implementar, somente se inexistentes ou insuficientes, funções compatíveis com a notação funcional já definida:
      - `IF(CONDIÇÃO, VERDADE, FALSO)`;
      - `AND(...)`;
      - `OR(...)`;
      - `XOR(...)`.
    - `AND`, `OR` e `XOR` DEVEM aceitar quantidade ilimitada de parâmetros tecnicamente suportável pelo parser/runtime, sem limite arbitrário.
    - Todas DEVEM admitir aninhamento entre si e múltiplos `IF`.
    - `IF` DEVE aceitar `\r?\n` entre parâmetros, inclusive dentro de funções aninhadas fornecidas como parâmetros.
    - `VERDADE` e `FALSO` PODEM ser valor literal, texto puro, número ou resultado de função.
    - Texto puro multiline DEVE tolerar `\r?\n` sem corromper parsing ou conteúdo.
    - Resultado textual ou numérico de função DEVE ser inserido como valor textual de saída no ponto de avaliação; números literais DEVEM igualmente poder ser emitidos diretamente.
    - Ajustes sintáticos estritamente necessários PODEM ser realizados para manter coerência simultânea com a notação `TypeScript-like` e os contratos vigentes.

  - **Funções matemáticas/utilitárias**
    - Implementar, caso ainda não existam, funções matemáticas básicas e utilitárias pertinentes, incluindo **mas não limitadas a** `min`, `max` e média, respeitando nomenclatura, semântica, validação e sintaxe já estabelecidas no projeto.
    - NÃO recriar funções equivalentes já existentes.

  - **Construção `if/else`**
    - Adicionar, caso inexistente, construção condicional `if/else` compatível simultaneamente com:
      - a notação `TypeScript-like` normatizada;
      - a sintaxe real já definida pelo projeto;
      - codificação independente de linha, inclusive multiline.
    - `if/else` e `IF()` DEVEM coexistir conforme seus respectivos usos, sem conflito semântico ou sintático.

  - **Isolamento obrigatório por destinatário/conversa**
    - Todo estado de execução DEVE ser isolado por destinatário/conversa, inclusive durante alternância, pausa, retomada ou processamento concorrente/intercalado.
    - É PROIBIDO qualquer transbordamento, compartilhamento ou confusão entre chats distintos de:
      - constantes;
      - variáveis;
      - timestamps;
      - argumentos;
      - retornos de funções;
      - resultados intermediários;
      - status;
      - posição/progresso no fluxo;
      - timers/delays;
      - contexto de avaliação;
      - quaisquer outros dados derivados da execução.

  - **Alternância/intercalação de envio entre destinatários**
    - Fluxos contendo múltiplas postagens/mensagens para múltiplos destinatários DEVEM poder, opcionalmente, intercalar o processamento entre destinatários, preservando integralmente contexto, estado, posição, valores e dados de cada conversa.
    - Quando habilitada, a alternância NÃO DEVE concluir necessariamente todo o fluxo de um destinatário antes de iniciar o seguinte: cada destinatário cede temporariamente o processamento após atingir o ponto de alternância aplicável, retomando posteriormente exatamente de onde parou.
    - O ponto preferencial de alternância DEVE poder ser explicitado no conteúdo por marcador apropriado — por exemplo, `$pause$`, caso compatível com a sintaxe/arquitetura vigente.
      - Se já existir mecanismo semanticamente equivalente, reutilizá-lo/adequá-lo em vez de criar duplicação.
      - Se necessário criar o marcador, sua semântica DEVE ser documentada e integrada às regras/sintaxe vigentes.
      - Quando a alternância estiver **desabilitada**, esse marcador DEVE ser automaticamente ignorado para fins de escalonamento e NÃO PODE alterar indevidamente o conteúdo ou comportamento normal do fluxo.
    - Na ausência de marcador aplicável, a alternância DEVE ocorrer após uma quantidade padrão configurável de mensagens/postagens por destinatário.
      - valor padrão inicial: **1**;
      - configurável pela GUI principal;
      - NÃO impor limite arbitrário adicional sem fundamento normativo/técnico.
    - A GUI principal DEVE permitir habilitar/desabilitar a alternância.
    - A GUI principal DEVE permitir definir quantos destinatários participam simultaneamente de cada grupo de alternância:
      - mínimo: **2**;
      - máximo inicial: **25**;
      - o teto máximo DEVE ser configurável em local centralizado apropriado do repositório.
    - O processamento DEVE alternar entre os destinatários do grupo ativo, segundo os marcadores/padrão aplicáveis, até a conclusão de todos os respectivos fluxos; somente então DEVE avançar para o próximo grupo de até o máximo configurado de destinatários.
    - Destinatários cujo fluxo terminar antes dos demais DEVEM sair naturalmente da alternância sem impedir a continuidade dos restantes.
    - Alternância NÃO PODE modificar a ordem interna das mensagens de um mesmo destinatário, salvo comportamento explicitamente previsto por norma existente.

  - **Delay entre mensagens do mesmo destinatário**
    - Adicionar recurso opcional de intervalo entre o envio de uma postagem/mensagem e a seguinte **para o mesmo destinatário**.
    - O delay DEVE ser configurável em milissegundos.
    - Sua medição DEVE ser individual por destinatário/conversa, de forma que o intervalo de um destinatário NÃO seja indevidamente satisfeito, reiniciado ou contaminado pelo estado de outro.
    - O requisito aplica-se tanto a fluxos sequenciais quanto a fluxos com alternância habilitada.
    - A implementação DEVE garantir que duas mensagens consecutivas do mesmo destinatário respeitem o intervalo configurado, ainda que entre elas tenham ocorrido envios para outros destinatários.
    - A GUI principal DEVE permitir:
      - habilitar/desabilitar o delay;
      - configurar seu valor em milissegundos.
    - NÃO definir mecanismo interno específico de contador/timer antes de inspecionar a arquitetura; adotar o meio tecnicamente adequado que garanta determinismo e isolamento.

  - **GUI e experiência de uso**
    - Controles de alternância, quantidade de destinatários, quantidade padrão de mensagens por turno e delay DEVEM integrar-se à GUI principal com o mesmo padrão visual, hierarquia, acabamento e comportamento dos controles existentes.
    - A adição DEVE preservar estética, clareza, organização, responsividade e aparência profissional, sem poluição visual nem regressão de funcionalidades.
    - Estados habilitado/desabilitado e valores configurados DEVEM ser inequívocos ao usuário.

  - **Integração aos editores**
    - Integrar às barras de ferramentas controles de inserção para `${}`, constantes, funções novas **e preexistentes** pertinentes e, quando aplicável, marcador(es) de controle do fluxo.
    - Botões DEVEM:
      - usar somente ícone quando compatível com o padrão vigente;
      - possuir `hint`/ajuda inequívoca;
      - ser agrupados e separados por escopo, categoria e tipo funcional;
      - preservar organização e padrão visual existentes.
    - PODE ser criada barra adicional imediatamente abaixo das atuais somente se isso resultar em organização superior e permanecer aderente ao layout vigente.
    - NÃO adicionar controles redundantes nem misturar funções/recursos de escopos distintos sem separação visual/semântica.
    - Ambos os editores existentes DEVEM permanecer visual e funcionalmente espelhados quanto aos recursos comuns, sendo o editor principal — vinculado/dependente do Node — a fonte primária a ser seguida, sem eliminar especializações legítimas de qualquer deles.

  - **Documentação**
    - Documentar sintaxe, semântica, escopo, isolamento, defaults, multiline, aninhamento, `${}`, `ultimaconversa`, `emconversa`, `IF`, `if/else`, funções lógicas/matemáticas, alternância, marcador aplicável, agrupamento de destinatários, quantidade padrão por turno, delay e controles dos editores/GUI.
    - Preservar mecanismos e precedências documentais/normativas existentes; NÃO criar documentação paralela conflitante.

  - **Validação mínima**
    - Validar:
      - múltiplas mensagens no mesmo fluxo;
      - múltiplos destinatários;
      - fluxos sucessivos;
      - destinatários concorrentes/intercalados;
      - grupos menores, iguais e maiores que o limite simultâneo configurado;
      - término antecipado de um destinatário dentro do grupo;
      - alternância habilitada/desabilitada;
      - presença/ausência do marcador de pausa;
      - fallback para quantidade padrão de mensagens;
      - preservação da ordem por destinatário;
      - pausa e retomada sem perda de contexto;
      - delay habilitado/desabilitado, com e sem alternância;
      - respeito ao delay por destinatário apesar de envios intermediários para outros;
      - ausência de conversa anterior;
      - limiar padrão e customizado de `emconversa`;
      - exclusão das mensagens automatizadas correntes de `ultimaconversa`/`emconversa`;
      - nesting profundo válido;
      - multiline;
      - textos/números/funções nos ramos de `IF`;
      - combinações entre `IF`, `AND`, `OR`, `XOR` e `if/else`;
      - funções matemáticas;
      - inserção via editores;
      - paridade funcional/visual entre os dois editores nos recursos comuns;
      - inexistência de qualquer vazamento, troca ou contaminação de contexto entre destinatários.

- [x] **Adicionar `Lucide` e `Iconify` e corrigir iconização/UX das ferramentas**, após inspeção do estado real e das evidências em `.ia.rules\state\evidencias`, obedecendo integralmente `RCF.md`, `agends.md` e demais normas vigentes de arquitetura, layout, estilo, exibição, impressão, interação, build/distribuição e modus operandi. NÃO presumir regras ausentes, criar exceções arbitrárias, eliminar recursos nem preencher lacunas quando isso puder desadequar o padrão existente ou produzir regressão direta, indireta ou progressiva.
  - **Fontes de ícones:** adicionar compatibilidade total e simultânea com **`lucide.dev`**, **`Iconify`** (`https://github.com/iconify/iconify`) e **Font Awesome**, submetendo todas exatamente aos mesmos contratos/normas vigentes. O mecanismo DEVE continuar publicando/incorporando em `dist/` **somente os recursos efetivamente utilizados**; recursos comuns NÃO DEVEM ser duplicados quando tecnicamente evitável e DEVEM ser centralizados para reutilização. Consultar e generalizar corretamente as regras já existentes no RCF atualmente formuladas para Font Awesome, sem degradá-las. Garantir isolamento completo entre provedores: utilização de uma coleção NÃO PODE provocar resolução, importação, fallback, identificação ou referência cruzada acidental/incidental a outra. Documentar no `README`/RCF links diretos às páginas de navegação/pesquisa de ícones de cada biblioteca suportada.

  - **`evidencia1.png` — ícones/status superiores:** o editor do **bundle offline**, por não escutar Node, NÃO DEVE exibir estados como `autenticando` ou equivalentes dependentes dessa comunicação. Nos editores principal e offline, eliminar a atual redundância de **dois ícones de nuvem**, distinguindo inequivocamente cada função por iconização semanticamente pertinente, sem alterar suas funcionalidades. Usar obrigatoriamente:
    - atualização: Iconify `game-icons:upgrade`;
    - download do bundle: Iconify `streamline-sharp:download-box-1-solid`.

  - **`evidencia2.png` — opções de atualização:** substituir a aparência atual de botões por controles de seleção **profissionais, estilo switch de aplicativo**, claramente distintos do botão de ação `Confirmar atualização`. A semântica visual/funcional DEVE corresponder ao comportamento real: opções independentes e simultaneamente selecionáveis DEVEM permitir múltipla seleção; alternativas mutuamente exclusivas DEVEM adotar semântica equivalente a radio; quando a natureza real exigir checkbox, preservar essa semântica. NÃO alterar regras de seleção apenas para obter determinada aparência.

  - **`evidencia3.png` — funções dos editores:** a introdução dos novos botões gerou repetição iconográfica e baixa distinção funcional. Revisar **Lucide/Iconify/Font Awesome** e selecionar, quando disponível, ícone semanticamente mais específico para cada ação; evitar repetição sempre que funções distintas puderem ser representadas adequadamente; preferir ícones **flat/solid, monocromáticos**, conforme compatibilidade com as normas vigentes. Reorganizar, **nos dois editores**, os comandos em **duas barras de ferramentas horizontais**, segregadas por escopo/contexto funcional, reutilizando estritamente os mesmos estilos, dimensões, interações, hints e demais diretrizes de toolbar já estabelecidos no RCF; trata-se de reorganização, NÃO de criação de novo padrão visual.

  - **`evidencia4.png` — editor CSV do bundle:** adequar integralmente sua toolbar ao padrão global dos demais editores. O comando **Abrir** DEVE seguir o mecanismo visual normativo de abertura: representação por ícone, sem exposição do `input` nativo do navegador. Os demais comandos NÃO DEVEM aparecer como botões textuais comuns com fundo/borda incompatíveis: DEVEM usar iconização apropriada, estilo de toolbar e **hint** correspondente, conforme RCF. A aderência visual e comportamental das barras de ferramentas DEVE permanecer consistente independentemente do editor/módulo.

  - **Integridade/aceite:** executar alterações de forma localizada, reutilizando mecanismos globais existentes e evitando soluções paralelas/hardcoded. Validar ambos os editores, modos online/offline, toolbars, seleção da atualização, resolução/carregamento das três fontes de ícones e artefatos efetivamente emitidos em `dist/`; somente concluir após confrontar `evidencia1.png`–`evidencia4.png` e confirmar ausência de duplicação indevida, vazamento entre provedores, regressões visuais/funcionais ou efeitos em cascata.

* [ ] Criar e publicar no **GitHub Pages** a página `/atribuicoes`, configurando Jekyll/build/roteamento/publicação **somente se necessário** para torná-la acessível e visível segundo os mecanismos já existentes do projeto.
  - DEVE obedecer integralmente `RCF.md`, `agends.md` e demais normas vigentes, reutilizando **template, layout, tipografia, traços, componentes, paleta e estilo visual já adotados nas páginas/posts públicos**, sem criar padrão paralelo, inovar visualmente ou provocar regressões.
  - Inspecionar as dependências/recursos **efetivamente usados no repositório** e listar **somente aqueles cuja licença efetivamente exige atribuição**, sem presumir obrigações. Cada atribuição DEVE cumprir rigorosamente os termos específicos da respectiva licença.
  - Preferencialmente padronizar cada registro com **nome da biblioteca/recurso, repositório/origem, link oficial, autor primário e licença**, acrescentando qualquer informação/texto obrigatório que a licença exigir.
  - Incluir antes da relação apenas um **texto introdutório sucinto**, explicando a finalidade da página.
  - A apresentação PODE adotar composição elegante e legível, inclusive inspiração **ABNT** ou formato tabular, desde que compatível com os padrões existentes; estética alternativa NÃO justifica alterar o design global.
  - Validar `/atribuicoes` no fluxo real do GitHub Pages, inclusive navegação/roteamento, responsividade e impressão quando aplicável, sem alterar indevidamente páginas, posts, módulos ou recursos preexistentes.
