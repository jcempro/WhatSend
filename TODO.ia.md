- [ ] **Atualizar dinamicamente o título da página com progresso e estado do envio de mensagens:** o título do documento DEVE comunicar, de forma imediata, inequívoca e continuamente atualizada, o percentual inteiro de progresso e o estado corrente do processo de preparação, processamento e envio de mensagens.

  - [ ] **Percentual como primeiro conteúdo:** enquanto existir processo em andamento ou processo concluído ainda representativo do estado atual, o título da página DEVE iniciar obrigatoriamente pelo percentual inteiro de progresso, sem casas decimais, seguido do símbolo `%`, antes de qualquer outro texto.

    Formato canônico:

    ```text
    <percentual>% <status> — <título-base>
    ```

    Exemplos delimitadores:

    ```text
    0% Preparando — <título-base>
    37% Enviando mensagens — <título-base>
    100% Concluído — <título-base>
    ```

  - [ ] **Precedência visual:** o percentual DEVE ser o primeiro texto do título, sem prefixo, ícone, marca, nome do produto, separador ou qualquer outro conteúdo anterior. Essa precedência somente NÃO se aplica quando não existir processo em andamento nem conclusão ainda válida para o estado corrente.

  - [ ] **Inteiro sem decimal:** o percentual exibido DEVE:
    - utilizar valor inteiro entre `00` e `100`;
    - NÃO conter casas decimais;
    - NÃO exceder os limites;
    - derivar do progresso real do processo;
    - ser atualizado sempre que houver avanço material;
    - utilizar regra determinística de arredondamento ou truncamento, centralizada e aplicada de forma consistente.
    - `100%` deve ser exibido apenas e tão somente quando o processo estiver concluído.
    - minimo dois digitos `0`-left-padded;

  - [ ] **Estado explícito:** imediatamente após o percentual (quando aplicável ao contexto), o título DEVE conter descrição curta, inequívoca e correspondente ao estado real, como:
    - `Preparando`;
    - `Processando`;
    - `Enviando mensagens`;
    - `Concluído`;
    - `Interrompido`;
    - `Falhou`;
    - outro estado equivalente já normatizado no projeto.

    Estados NÃO DEVEM ser inventados quando já existir enumeração, máquina de estados ou vocabulário canônico aplicável.

  - [ ] **Progresso do envio:** o percentual DEVE representar o andamento material do processo de envio de mensagens conforme unidade real e verificável, preferencialmente pela relação entre mensagens concluídas e total elegível.

    Quando houver etapas anteriores necessárias ao envio, como preparação, validação, composição ou enfileiramento, sua representação percentual DEVE seguir contrato explícito e determinístico, sem aparentar avanço de mensagens efetivamente enviadas quando isso ainda não ocorreu.

  - [ ] **Conclusão persistente:** após a conclusão válida do processo:
    - o título DEVE permanecer iniciado por `100%`;
    - o estado DEVE indicar conclusão;
    - o percentual NÃO DEVE ser removido imediatamente;
    - o título DEVE continuar refletindo `100% Concluído` enquanto nenhum novo estado material tiver sido iniciado.

  - [ ] **Invalidação da conclusão por alteração:** após a conclusão, qualquer alteração explícita em campo que participe, direta ou indiretamente, da preparação, composição, seleção, destino, conteúdo, configuração ou execução do envio DEVE invalidar imediatamente o estado concluído.

    A alteração DEVE transicionar o processo para novo estado de preparação, reprocessamento ou equivalente canônico, conforme a máquina de estados vigente.

    Exemplo:

    ```text
    100% Concluído — <título-base>
    ```

    após alteração material:

    ```text
    Preparando — <título-base>
    ```

    ou outro percentual e estado real já calculado pelo fluxo.

  - [ ] **Alteração material:** somente alteração explícita que modifique a entrada, configuração ou resultado potencial do processo DEVE invalidar a conclusão. Eventos puramente visuais, foco, seleção de texto, navegação, expansão de painel ou mudança sem efeito material NÃO DEVEM reiniciar o estado.

  - [ ] **Estado sem processo:** quando não houver:
    - processo em preparação;
    - processamento em andamento;
    - envio em andamento;
    - conclusão ainda válida;
    - interrupção ou falha relevante a comunicar;

    o título DEVE retornar ao título-base canônico da página, sem prefixo percentual artificial.

  - [ ] **Atualização imediata:** alterações de progresso, estado, conclusão ou invalidação DEVEM refletir-se no título sem recarregamento da página e sem atraso perceptível indevido.

  - [ ] **Fonte única de estado:** o título DEVE derivar da mesma fonte de verdade utilizada pela interface e pela lógica do processo. É PROIBIDO manter cálculo ou estado paralelo que possa divergir do progresso efetivo.

  - [ ] **Consistência entre interface e título:** percentual e estado exibidos no título DEVEM coincidir com os indicadores equivalentes apresentados na página. Divergências temporárias somente PODEM ocorrer durante atualização atômica e não DEVEM permanecer após o mesmo ciclo de renderização ou evento.

  - [ ] **Falhas e interrupções:** se o processo falhar ou for interrompido:
    - preservar o percentual real alcançado;
    - substituir o estado pelo estado canônico correspondente;
    - NÃO exibir `100%` salvo conclusão material efetiva;
    - permitir que retomada ou nova alteração atualize o título conforme o novo estado.

    Exemplos:

    ```text
    42% Interrompido — <título-base>
    68% Falhou — <título-base>
    ```

  - [ ] **Múltiplos processos:** se tecnicamente puder existir mais de um processo simultâneo, o título DEVE representar o processo principal determinado pela regra de precedência vigente. Na ausência dessa regra, normatizar critério determinístico antes da implementação. NÃO concatenar percentuais concorrentes de forma ambígua.

  - [ ] **Ciclo de vida:** garantir atualização correta do título nos eventos de:
    - inicialização;
    - preparação;
    - início do processamento;
    - avanço;
    - pausa;
    - retomada;
    - interrupção;
    - falha;
    - conclusão;
    - alteração material pós-conclusão;
    - reinicialização;
    - cancelamento;
    - restauração de estado persistido;
    - ausência de processo.

  - [ ] **Restauração:** ao recarregar ou reabrir a página, o título DEVE refletir o estado real restaurado, sem indicar progresso ou conclusão inexistentes. Estado persistido DEVE ser validado antes de ser apresentado.

  - [ ] **Acessibilidade e legibilidade:** o texto DEVE permanecer curto, claro e compreensível em abas estreitas, favorecendo a visibilidade imediata do percentual e do estado. Símbolos, emojis ou ornamentos NÃO DEVEM anteceder nem obscurecer o indicador.

  - [ ] **Implementação centralizada:** centralizar a composição e atualização do título em função, serviço, hook ou componente único, conforme a arquitetura existente, evitando lógica duplicada entre etapas, componentes ou eventos.

  - [ ] **Normatização no RCF:** incorporar integralmente ao RCF aplicável:
    - formato canônico do título;
    - precedência do percentual;
    - cálculo inteiro;
    - estados;
    - persistência de `100%`;
    - invalidação pós-alteração;
    - definição de alteração material;
    - tratamento de falha, interrupção e ausência de processo;
    - fonte única de verdade;
    - testes e critérios de aceite.

  - [ ] **Testes obrigatórios:** validar, no mínimo:
    - percentual aparece no início;
    - nenhum texto antecede o percentual;
    - valores não possuem decimal;
    - `0%`, valores intermediários e `100%` são exibidos corretamente;
    - o título acompanha o progresso real;
    - `100%` permanece após conclusão;
    - alteração material pós-conclusão invalida `Concluído`;
    - alteração não material não reinicia o processo;
    - ausência de processo restaura o título-base;
    - falha e interrupção preservam o percentual real;
    - recarregamento restaura estado válido;
    - interface e título permanecem consistentes;
    - múltiplos eventos rápidos não produzem título obsoleto;
    - não há regressão no título-base ou em outros fluxos.

  - [ ] **Critérios de aceite:**
    - [ ] Durante processo ativo, o título começa por `<inteiro>%`.
    - [ ] O percentual é sempre o primeiro conteúdo textual.
    - [ ] O percentual não contém casas decimais.
    - [ ] O estado aparece imediatamente após o percentual.
    - [ ] O título representa o estado real do envio.
    - [ ] Após conclusão, permanece `100% Concluído`.
    - [ ] Alteração explícita e material pós-conclusão inicia nova preparação ou estado equivalente.
    - [ ] Alterações sem efeito material não invalidam a conclusão.
    - [ ] Sem processo ou conclusão válida, o título retorna ao valor-base.
    - [ ] Falhas e interrupções não são apresentadas como conclusão.
    - [ ] A implementação utiliza fonte única de verdade.
    - [ ] O comportamento está integralmente normatizado no RCF.
    - [ ] Todos os testes passam sem regressão.

* [ ] **Adicionar aviso explícito de desenvolvimento ao painel superior `Licença`:** o painel superior identificado como `Licença` DEVE exibir, além do conteúdo já existente, aviso curto, claro e imediatamente visível informando que o produto está em desenvolvimento e pode conter erros.

  * [ ] **Texto mínimo:** utilizar formulação semanticamente equivalente a:

    ```text
    Em desenvolvimento; pode conter erros.
    ```

  * [ ] **Clareza:** o aviso DEVE comunicar simultaneamente:

    * estado ainda não definitivo do produto;
    * possibilidade real de falhas, inconsistências ou comportamentos incorretos;
    * ausência de garantia implícita de estabilidade completa.

  * [ ] **Preservação do painel:** o aviso DEVE ser adicionado sem remover, substituir, ocultar ou enfraquecer o conteúdo atual do painel `Licença`.

  * [ ] **Posicionamento:** o texto DEVE permanecer dentro do próprio painel superior `Licença`, em posição visível e logicamente associada ao restante do conteúdo, sem depender de tooltip, hover, modal, rodapé ou interação adicional.

  * [ ] **Legibilidade:** o aviso DEVE:

    * possuir contraste adequado;
    * permanecer legível em todos os breakpoints suportados;
    * não ser truncado de forma a perder sentido;
    * não competir visualmente com o título principal do painel;
    * manter hierarquia visual secundária, porém inequívoca.

  * [ ] **Consistência linguística:** utilizar o idioma ativo da interface. Em pt-BR, adotar preferencialmente:

    ```text
    Em desenvolvimento; pode conter erros.
    ```

    Em outros idiomas suportados, fornecer tradução semanticamente equivalente, sem alterar a força do aviso.

  * [ ] **Sem suavização indevida:** NÃO substituir o aviso por formulações vagas, promocionais ou excessivamente brandas, como:

    * `versão inicial`;
    * `novidades em breve`;
    * `experiência em evolução`;
    * expressões que omitam a possibilidade de erro.

  * [ ] **Acessibilidade:** o aviso DEVE ser exposto como texto real, acessível a leitores de tela e independente de cor, ícone ou decoração para transmitir seu significado.

  * [ ] **Normatização no RCF:** incorporar ao RCF aplicável:

    * obrigatoriedade do aviso;
    * conteúdo semântico mínimo;
    * localização no painel `Licença`;
    * preservação do conteúdo existente;
    * requisitos de visibilidade, idioma e acessibilidade.

  * [ ] **Testes obrigatórios:** validar, no mínimo:

    * presença do aviso no painel superior `Licença`;
    * preservação do conteúdo anterior;
    * exibição correta em pt-BR;
    * tradução nos idiomas suportados;
    * legibilidade responsiva;
    * acessibilidade por leitor de tela;
    * ausência de truncamento ou ocultação indevida.

  * [ ] **Critérios de aceite:**

    * [ ] O painel superior `Licença` contém aviso explícito de desenvolvimento.
    * [ ] O aviso informa claramente que o produto pode conter erros.
    * [ ] O conteúdo preexistente do painel foi preservado.
    * [ ] O texto permanece visível sem interação adicional.
    * [ ] O aviso é acessível, responsivo e semanticamente equivalente em todos os idiomas suportados.
    * [ ] A regra foi incorporada ao RCF.

