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

- [ ] Issue — Tornar `telefone` e `fone` aliases equivalentes, `case-insensitive` e mutuamente exclusivos

    ## Problema

    O RCF e as implementações correlatas tratam atualmente `telefone` como nomenclatura obrigatória exclusiva para o campo telefônico. Isso impede o uso da variante semanticamente equivalente `fone`, embora ambas representem o mesmo dado.

    A regra vigente que exige:

    ```text
    nome + telefone
    ```

    DEVE passar a aceitar, alternativamente:

    ```text
    nome + telefone
    ```

    ou:

    ```text
    nome + fone
    ```

    As nomenclaturas `telefone` e `fone` DEVEM referir-se ao mesmo campo lógico, ser reconhecidas sem distinção entre maiúsculas e minúsculas e NÃO PODEM coexistir na mesma estrutura de entrada.

    ## Objetivo

    Alterar integralmente o RCF e todas as implementações aplicáveis para estabelecer que:

    * `nome` permanece obrigatório;
    * o campo telefônico permanece obrigatório;
    * o campo telefônico PODE ser identificado por `telefone` ou `fone`;
    * `telefone` e `fone` são aliases equivalentes;
    * os aliases são mutuamente exclusivos;
    * `nome`, `telefone` e `fone` são identificados de forma `case-insensitive`;
    * a aceitação do alias NÃO altera as regras de validação, normalização, processamento ou saída do campo telefônico.

    ## Regra normativa

    A estrutura mínima válida DEVE conter exatamente:

    ```text
    nome + (telefone XOR fone)
    ```

    Onde `XOR` significa que somente um dos aliases telefônicos PODE existir.

    Exemplos válidos:

    ```text
    nome;telefone
    nome;fone
    Nome;Telefone
    NOME;FONE
    nOmE;FoNe
    ```

    Exemplos inválidos:

    ```text
    nome
    telefone
    fone
    nome;telefone;fone
    nome;Telefone;FONE
    nome;celular
    nome;phone
    ```

    Variações não expressamente normatizadas, como `celular`, `phone`, `tel`, erros ortográficos ou aproximações semânticas, NÃO DEVEM ser aceitas.

    ## 1. Alias semântico único

    `telefone` e `fone` DEVEM representar a mesma função lógica.

    A implementação DEVE:

    * reconhecer ambas as nomenclaturas;
    * normalizar ambas para um único identificador semântico interno;
    * aplicar a ambas as mesmas regras;
    * evitar duplicação de lógica;
    * preservar a nomenclatura original quando necessário à exportação ou rastreabilidade;
    * não alterar o valor do campo apenas por causa do alias utilizado.

    O identificador interno canônico DEVE ser definido conforme a arquitetura existente, sem impor nova nomenclatura desnecessária.

    ## 2. Insensibilidade a caixa

    A identificação dos cabeçalhos DEVE ignorar diferenças entre maiúsculas e minúsculas.

    São equivalentes:

    ```text
    telefone
    Telefone
    TELEFONE
    TeLeFoNe

    fone
    Fone
    FONE
    FoNe
    ```

    O mesmo princípio DEVE permanecer aplicável a `nome`.

    A comparação DEVE ocorrer após normalização segura, sem alterar o conteúdo dos valores.

    ## 3. Presença obrigatória e exclusividade

    A validação estrutural DEVE exigir:

    1. uma coluna correspondente a `nome`;
    2. exatamente uma coluna correspondente ao campo telefônico;
    3. a coluna telefônica DEVE ser identificada por `telefone` ou `fone`;
    4. `telefone` e `fone` NÃO PODEM coexistir, independentemente da caixa utilizada.

    A ausência de ambos os aliases telefônicos DEVE produzir erro impeditivo.

    Mensagem equivalente:

    ```text
    É obrigatória uma coluna denominada `telefone` ou `fone`.
    ```

    A presença simultânea de ambos DEVE produzir erro impeditivo.

    Mensagem equivalente:

    ```text
    As colunas `telefone` e `fone` são alternativas e não podem coexistir.
    ```

    ## 4. Coexistência proibida

    A presença simultânea de `telefone` e `fone` é sempre inválida, ainda que:

    * uma das colunas esteja vazia;
    * ambas contenham os mesmos valores;
    * uma delas tenha sido gerada automaticamente;
    * os cabeçalhos utilizem caixas diferentes;
    * a duplicação resulte de importação, transformação ou mesclagem.

    É PROIBIDO:

    * consolidar automaticamente as colunas;
    * escolher silenciosamente uma delas;
    * comparar valores para decidir qual preservar;
    * remover uma coluna sem ação explícita do usuário;
    * tratar a coexistência como aviso não impeditivo.

    O processamento DEVE ser interrompido até que a estrutura contenha somente um dos aliases.

    ## 5. Duplicidade após normalização

    A validação DEVE ocorrer após normalização `case-insensitive`.

    Portanto, também são inválidos:

    ```text
    telefone;Telefone
    fone;FONE
    Telefone;Fone
    TELEFONE;fone
    ```

    A estrutura NÃO PODE conter:

    * duas ocorrências de `telefone`;
    * duas ocorrências de `fone`;
    * uma ocorrência de cada alias.

    Todo conflito dessa natureza DEVE ser identificado antes do processamento dos registros.

    ## 6. Regras de negócio preservadas

    Todas as regras já aplicáveis a `telefone` DEVEM passar a aplicar-se igualmente a `fone`, incluindo:

    * obrigatoriedade;
    * validação;
    * normalização;
    * máscara;
    * formato;
    * tamanho;
    * DDI;
    * DDD;
    * caracteres aceitos;
    * sanitização;
    * mensagens de erro;
    * uso em variáveis;
    * processamento;
    * geração de mensagens;
    * exportação;
    * persistência;
    * indexação;
    * testes.

    É PROIBIDO criar comportamento distinto entre os aliases.

    ## 7. Atualização do RCF

    Alterar o RCF canônico e os RCFs especializados aplicáveis para substituir exigências exclusivas de:

    ```text
    telefone
    ```

    por contrato equivalente a:

    ```text
    campo telefônico obrigatório: `telefone` ou `fone`, mutuamente exclusivos
    ```

    A normatização DEVE:

    * centralizar o conceito de alias;
    * estabelecer exclusividade obrigatória;
    * evitar repetição em múltiplas seções;
    * preservar exemplos delimitadores;
    * manter `nome` como campo obrigatório independente;
    * distinguir nomenclatura externa de identificador interno;
    * impedir interpretações que aceitem aliases não previstos;
    * impedir qualquer regra de consolidação automática entre `telefone` e `fone`.

    ## 8. Escopo de implementação

    Revisar e atualizar, quando existentes:

    * schemas;
    * tipos;
    * interfaces;
    * parsers;
    * normalizadores;
    * validadores;
    * importadores;
    * exportadores;
    * modelos;
    * geradores;
    * componentes de interface;
    * mensagens de erro;
    * lógica de mapeamento;
    * persistência;
    * CSV;
    * JSON;
    * testes;
    * fixtures;
    * exemplos;
    * documentação;
    * workflows;
    * scripts;
    * builds;
    * RCF global;
    * RCFs especializados.

    É PROIBIDO alterar apenas uma camada e manter comportamento divergente nas demais.

    ## 9. Compatibilidade

    A alteração DEVE ser retrocompatível.

    Entradas que utilizam somente `telefone` DEVEM continuar funcionando sem alteração.

    Entradas que utilizam somente `fone` DEVEM passar a funcionar com comportamento equivalente.

    Entradas que contenham ambos DEVEM ser rejeitadas, ainda que anteriormente fossem toleradas por alguma implementação.

    A implementação NÃO DEVE:

    * renomear compulsoriamente arquivos existentes;
    * alterar dados já persistidos sem necessidade;
    * modificar layouts ou fluxos não relacionados;
    * ampliar a aceitação para aliases não solicitados;
    * alterar a semântica do campo telefônico;
    * corrigir automaticamente estruturas inválidas sem ação explícita.

    ## 10. Importação e exportação

    Na importação:

    * aceitar `telefone` ou `fone`;
    * reconhecer variações de caixa;
    * exigir exclusividade;
    * rejeitar duplicidade após normalização;
    * preservar o cabeçalho original quando aplicável;
    * interromper a importação válida se ambos coexistirem.

    Na exportação:

    * utilizar a nomenclatura canônica definida pelo RCF; ou
    * preservar a nomenclatura original, quando esta for a regra vigente.

    A escolha DEVE ser única, explícita e consistente em todas as saídas.

    A exportação NÃO DEVE gerar simultaneamente `telefone` e `fone`.

    ## 11. Interface e correção pelo usuário

    Quando a coexistência for detectada, a interface DEVE:

    * identificar nominalmente os cabeçalhos conflitantes;
    * explicar que representam o mesmo campo lógico;
    * informar que somente um pode permanecer;
    * impedir processamento, envio ou exportação válida;
    * permitir que o usuário renomeie ou remova explicitamente uma das colunas.

    A aplicação NÃO DEVE decidir pelo usuário qual coluna excluir.

    ## 12. Mensagens de validação

    Mensagens ao usuário DEVEM refletir os dois aliases e sua exclusividade.

    Substituir mensagens exclusivas como:

    ```text
    A coluna `telefone` é obrigatória.
    ```

    por formulação equivalente a:

    ```text
    É obrigatória uma coluna denominada `telefone` ou `fone`.
    ```

    Para coexistência:

    ```text
    As colunas `telefone` e `fone` representam o mesmo campo e não podem coexistir.
    ```

    Mensagens de erro DEVEM permanecer:

    * claras;
    * objetivas;
    * localizadas;
    * acionáveis;
    * coerentes entre interface, logs e testes.

    ## 13. Testes obrigatórios

    Criar ou atualizar testes para, no mínimo:

    * `nome + telefone` é aceito;
    * `nome + fone` é aceito;
    * `Nome + Telefone` é aceito;
    * `NOME + FONE` é aceito;
    * variações mistas de caixa são aceitas;
    * ausência de `nome` é rejeitada;
    * ausência de `telefone` e `fone` é rejeitada;
    * aliases não previstos são rejeitados;
    * `telefone` e `fone` recebem as mesmas validações;
    * valores equivalentes produzem o mesmo resultado quando utilizados separadamente;
    * `telefone + fone` é sempre rejeitado;
    * `Telefone + FONE` é rejeitado;
    * `telefone + Telefone` é rejeitado;
    * `fone + FONE` é rejeitado;
    * coexistência com uma coluna vazia é rejeitada;
    * coexistência com valores idênticos é rejeitada;
    * nenhuma consolidação automática ocorre;
    * mensagens de erro mencionam ambos os aliases e a exclusividade;
    * importação funciona com cada alias isoladamente;
    * exportação nunca produz os dois aliases;
    * comportamento legado com somente `telefone` permanece inalterado;
    * não há regressão em fluxos existentes.

    ## 14. Ordem de execução

    1. Ler o RCF e as implementações aplicáveis.
    2. Localizar todas as exigências exclusivas de `telefone`.
    3. Localizar qualquer tolerância atual à coexistência.
    4. Definir o microconceito normativo do campo telefônico exclusivo.
    5. Atualizar o RCF canônico.
    6. Atualizar RCFs especializados.
    7. Atualizar schemas, tipos e contratos.
    8. Atualizar parsers, normalizadores e validadores.
    9. Atualizar importação, exportação e persistência.
    10. Atualizar interface e mensagens.
    11. Atualizar documentação e exemplos.
    12. Criar ou atualizar testes.
    13. Validar retrocompatibilidade.
    14. Validar rejeição uniforme da coexistência.
    15. Emitir relatório final.

    ## Critérios de aceite

    * [ ] `nome` permanece obrigatório.
    * [ ] O campo telefônico permanece obrigatório.
    * [ ] `telefone` é aceito isoladamente.
    * [ ] `fone` é aceito isoladamente.
    * [ ] Ambos são tratados como aliases equivalentes.
    * [ ] A identificação é `case-insensitive`.
    * [ ] `telefone` e `fone` não podem coexistir.
    * [ ] Duplicidades do mesmo alias após normalização são rejeitadas.
    * [ ] A coexistência é erro impeditivo em todas as camadas.
    * [ ] Nenhuma consolidação automática é executada.
    * [ ] As mesmas regras de negócio são aplicadas aos dois aliases.
    * [ ] Entradas legadas com somente `telefone` permanecem funcionais.
    * [ ] Entradas com somente `fone` passam a funcionar.
    * [ ] Mensagens e documentação refletem ambos os aliases e sua exclusividade.
    * [ ] O RCF foi integralmente atualizado.
    * [ ] Todas as implementações aplicáveis foram atualizadas.
    * [ ] Todos os testes passam sem regressão.

    ## Relatório final

    Registrar objetivamente:

    * normas alteradas;
    * microconceito adotado;
    * arquivos e componentes atualizados;
    * pontos que anteriormente permitiam coexistência;
    * mecanismo de rejeição implementado;
    * comportamento de importação e exportação;
    * mensagens ajustadas;
    * testes executados;
    * retrocompatibilidade validada;
    * rejeição da coexistência validada;
    * pendências ou ambiguidades remanescentes.

- [ ] Issue — Novo bundle autônomo e integralmente offline do painel `Modelo de mensagem`

    ## Problema

    O produto e a página atualmente implementados não possuem uma saída adicional, autônoma e integralmente client-side que disponibilize, em artefato único, somente:

    1. o rodapé canônico da página;
    2. o painel superior `Licença`;
    3. o painel `Modelo de mensagem`;
    4. um novo painel de edição, validação e exportação de CSV.

    Esta issue NÃO trata de substituir, refatorar, reduzir, adaptar ou alterar o produto existente, sua página atual, sua saída atual ou seu comportamento operacional. Trata exclusivamente da criação de um novo produto derivado, variação ou saída adicional em formato bundle, mantido em paralelo e sem regressão sobre os artefatos existentes.

    ## Objetivo

    Desenvolver, normatizar, testar e publicar uma saída adicional em formato bundle que implemente o equivalente funcional e visual dos painéis especificados, preservando integralmente seus recursos atuais e futuros aplicáveis.

    O bundle final DEVE ser:

    * 100% offline desde a primeira abertura;
    * 100% client-side;
    * 100% autocontido;
    * integralmente embedded;
    * constituído por um único artefato executável;
    * independente de servidor;
    * independente de Node.js em runtime;
    * independente da aplicação original em runtime;
    * independente de arquivos auxiliares externos;
    * independente de CDN;
    * independente de conexão com a internet;
    * executável diretamente em navegador compatível;
    * funcional, visual e normativamente equivalente às respectivas fontes canônicas;
    * atualizado e validado automaticamente em tempo de build.

    O novo artefato DEVE coexistir com o produto atual. Sua criação NÃO autoriza modificar a página existente, substituir a saída vigente nem transferir recursos da implementação principal para o bundle de maneira que degrade ou altere o produto original.

    ## Natureza estritamente aditiva

    Esta issue é estritamente aditiva.

    A implementação:

    * DEVE criar novo produto derivado, variação ou saída adicional;
    * DEVE preservar integralmente o produto existente;
    * DEVE preservar integralmente a página existente;
    * DEVE preservar integralmente os builds e artefatos existentes;
    * DEVE preservar rotas, interfaces, comportamento, arquitetura e contratos atuais;
    * NÃO DEVE converter a página atual no bundle;
    * NÃO DEVE substituir a saída atual;
    * NÃO DEVE remover componentes da aplicação principal para reutilizá-los exclusivamente no bundle;
    * NÃO DEVE alterar o comportamento da aplicação principal para atender limitações do bundle;
    * NÃO DEVE impor ao produto existente as restrições de execução offline próprias do novo artefato;
    * NÃO DEVE introduzir regressão, acoplamento inverso ou dependência do produto principal em relação ao bundle.

    Código comum PODE ser extraído ou compartilhado apenas quando isso preservar integralmente os contratos e comportamentos vigentes, sem alteração material da aplicação existente. Refatoração compartilhada somente PODE ocorrer quando tecnicamente necessária, coberta por testes e comprovadamente neutra para o produto atual.

    ## Escopo

    O novo bundle DEVE conter exclusivamente os elementos funcionais abaixo e suas dependências indispensáveis:

    1. o mesmo rodapé da página original;
    2. o mesmo painel superior `Licença`;
    3. o painel `Modelo de mensagem`;
    4. um painel adicional de criação, importação, edição, validação e exportação de CSV;
    5. todos os estilos, fontes, ícones, bibliotecas, assets, regras, validadores e comportamentos necessários ao funcionamento autônomo desses elementos;
    6. os mecanismos locais de persistência, processamento e download aplicáveis aos painéis incluídos.

    Elementos externos a esse conjunto NÃO DEVEM ser incorporados apenas para reproduzir a página completa.

    ## Fora de escopo

    NÃO faz parte desta issue:

    * modificar o produto já implementado;
    * modificar a página já implementada;
    * substituir, descontinuar ou alterar a saída já existente;
    * transformar a aplicação principal em aplicação offline;
    * clonar integralmente a página ou o produto;
    * incluir painéis não especificados;
    * criar versão funcionalmente reduzida dos painéis selecionados;
    * exigir servidor local;
    * exigir `npm`, Node.js ou instalação para executar o bundle;
    * depender de CDN, API, fonte, biblioteca, asset ou recurso remoto;
    * carregar dependência após a abertura;
    * depender de cache on-line previamente aquecido;
    * manter cópia manual sem monitoramento de paridade;
    * reimplementar do zero biblioteca tabular madura sem necessidade;
    * alterar regras da aplicação principal apenas para facilitar o empacotamento.

    ## 1. Inspeção obrigatória

    Antes de implementar:

    1. localizar o painel `Modelo de mensagem`, seus componentes, dependências, estilos, assets, validações, estados, hooks, serviços, utilitários, workers, scripts e testes;
    2. identificar o rodapé e o painel `Licença` canônicos;
    3. localizar todas as normas do RCF aplicáveis;
    4. identificar as saídas, páginas e builds atuais que DEVEM permanecer inalterados;
    5. mapear recursos que dependam direta ou indiretamente de:

    * Node.js;
    * servidor;
    * API;
    * filesystem;
    * execução em build;
    * módulos dinâmicos;
    * workers;
    * armazenamento;
    * recursos externos;
    6. identificar regras vigentes relativas a:

    * CSV;
    * `nome`;
    * `telefone`;
    * `fone`;
    * modelo de mensagem;
    * variáveis e substituições;
    * validação;
    * salvamento;
    * nomenclatura de arquivos;
    7. determinar a arquitetura real antes de definir o mecanismo de empacotamento;
    8. estabelecer testes de não regressão do produto, da página e das saídas existentes antes de qualquer refatoração compartilhada.

    É PROIBIDO presumir que o painel seja isolado, estático ou livre de dependências sem inspeção.

    ## 2. Novo artefato independente

    O bundle DEVE constituir nova saída de build, adicional às existentes.

    Formato obrigatório:

    ```text
    <bundle-offline>.html
    ```

    O resultado final DEVE ser um único arquivo HTML autocontido.

    É PROIBIDO distribuir o bundle como diretório composto por HTML, CSS, JavaScript, fontes, workers, imagens ou bibliotecas separados.

    Todos os recursos necessários DEVEM estar incorporados ao próprio arquivo, mediante técnicas compatíveis, como:

    * CSS inline;
    * JavaScript inline;
    * módulos incorporados;
    * assets em `data:` URI, Blob ou representação embedded equivalente;
    * fontes incorporadas;
    * ícones incorporados;
    * workers gerados por Blob ou código embedded;
    * schemas e configurações estáticas incorporados;
    * WebAssembly incorporado quando estritamente necessário.

    A escolha técnica NÃO DEVE comprometer funcionalidade, segurança, acessibilidade, desempenho proporcional ou execução offline.

    ## 3. Proibição absoluta de CDN e dependências remotas

    CDN NÃO PODE ser utilizada em nenhuma hipótese no artefato final.

    É PROIBIDO ao bundle:

    * importar biblioteca por CDN;
    * carregar fonte remota;
    * carregar CSS remoto;
    * carregar JavaScript remoto;
    * carregar imagem ou ícone remoto obrigatório;
    * acessar API para inicialização;
    * obter schema, configuração ou tradução remotamente;
    * depender de `import()` remoto;
    * carregar worker por URL externa;
    * exigir conexão inicial para popular cache;
    * utilizar fallback remoto;
    * degradar silenciosamente quando estiver offline.

    Toda dependência obrigatória DEVE estar incorporada ao arquivo HTML final.

    Links externos meramente referenciais no rodapé ou conteúdo PODEM permanecer clicáveis, desde que:

    * não sejam necessários ao funcionamento;
    * não sejam acessados automaticamente;
    * sua indisponibilidade não afete nenhum recurso do bundle.

    O build DEVE detectar e falhar diante de qualquer dependência remota obrigatória ou URL externa executável.

    ## 4. Equivalência integral

    O bundle DEVE preservar e espelhar, nos elementos incluídos:

    * aparência;
    * layout;
    * tipografia;
    * espaçamento;
    * responsividade;
    * componentes;
    * estados;
    * interações;
    * acessibilidade;
    * validações;
    * mensagens;
    * atalhos;
    * persistência aplicável;
    * geração de conteúdo;
    * download;
    * regras de negócio;
    * tratamento de erros;
    * recursos atuais;
    * futuras extensões materialmente aplicáveis.

    A equivalência NÃO se limita à semelhança visual. O bundle DEVE possuir equivalência funcional, normativa e comportamental.

    Nenhum recurso dos painéis selecionados PODE ser removido, simplificado, simulado ou substituído por placeholder para facilitar a execução offline.

    Recursos da página original que não pertençam aos painéis ou ao rodapé especificados NÃO DEVEM ser copiados apenas para reproduzir a página inteira.

    ## 5. Fonte canônica e paridade futura

    O bundle NÃO DEVE evoluir como cópia manual independente.

    A aplicação e os componentes originais permanecem fontes canônicas de:

    * rodapé;
    * painel `Licença`;
    * painel `Modelo de mensagem`;
    * estilos compartilhados;
    * textos;
    * traduções;
    * regras;
    * validações;
    * recursos;
    * comportamento.

    A cadeia de build do bundle DEVE:

    1. utilizar componentes, estilos, contratos ou fontes canônicas sempre que tecnicamente viável;
    2. detectar alterações relevantes nas fontes canônicas;
    3. propagar automaticamente alterações aplicáveis ao novo bundle;
    4. validar equivalência entre origem e artefato offline;
    5. falhar explicitamente quando recurso aplicável não puder ser incorporado;
    6. impedir publicação silenciosa de bundle defasado, incompleto ou divergente;
    7. não exigir alteração manual simultânea em duas implementações equivalentes.

    Quando compartilhamento direto não for tecnicamente viável, o mecanismo alternativo DEVE permanecer automatizado, rastreável e validado em build.

    A paridade futura NÃO autoriza incluir novos painéis da página original. Somente alterações aplicáveis aos elementos expressamente incluídos DEVEM ser espelhadas.

    ## 6. Preservação do produto atual

    Antes e depois da implementação, validar que:

    * a página atual permanece visualmente inalterada, salvo alterações externas e independentes desta issue;
    * a saída atual permanece disponível;
    * rotas atuais permanecem válidas;
    * recursos atuais permanecem funcionais;
    * builds atuais permanecem equivalentes;
    * o bundle não passa a ser dependência da aplicação principal;
    * a aplicação principal não depende do ambiente ou das restrições do bundle;
    * a geração do bundle não modifica arquivos-fonte produzidos por outros builds;
    * o novo artefato possui nome, destino e ciclo de publicação próprios.

    Qualquer alteração compartilhada DEVE ser tecnicamente neutra para o produto existente e comprovada por testes de regressão.

    ## 7. Execução exclusivamente client-side

    Qualquer recurso atualmente executado em Node.js e necessário ao bundle DEVE ser:

    1. substituído por implementação equivalente compatível com navegador; ou
    2. compilado, adaptado ou incorporado ao bundle para execução client-side.

    A execução PODE utilizar, conforme adequação técnica:

    * JavaScript assíncrono;
    * Web Worker criado por Blob;
    * WebAssembly incorporado;
    * IndexedDB;
    * `localStorage`;
    * File System Access API com fallback;
    * APIs nativas do navegador;
    * mecanismo client-side equivalente.

    Service Worker somente PODE ser utilizado quando:

    * for tecnicamente compatível com o modo real de execução;
    * estiver integralmente embedded;
    * não exigir servidor, origem segura ou instalação incompatível com abertura direta;
    * não for necessário apenas para simular offline após acesso prévio.

    Como o bundle DEVE funcionar diretamente e integralmente offline, Service Worker NÃO DEVE ser adotado como dependência obrigatória se a execução por `file://` ou ambiente equivalente não o suportar.

    ## 8. Independência de Node.js e servidor

    Node.js PODE ser utilizado exclusivamente em tempo de desenvolvimento e build.

    O artefato final NÃO PODE exigir:

    * Node.js;
    * `npm`;
    * gerenciador de pacotes;
    * processo auxiliar;
    * servidor HTTP;
    * `localhost`;
    * backend;
    * terminal;
    * instalação;
    * etapa posterior de build;
    * conexão com a internet.

    O bundle DEVE funcionar diretamente após ser copiado para outro computador compatível.

    Limitações do navegador somente PODEM ser documentadas como inevitáveis depois de demonstrado que não resultam de decisão arquitetural evitável.

    ## 9. Painel `Licença`

    O bundle DEVE reproduzir o painel `Licença` canônico, incluindo:

    * conteúdo;
    * estrutura;
    * aparência;
    * acessibilidade;
    * responsividade;
    * aviso de desenvolvimento;
    * futuras alterações aplicáveis.

    O conteúdo NÃO DEVE ser mantido por cópia manual quando puder ser obtido da fonte canônica durante o build.

    O aviso normatizado equivalente a:

    ```text
    Em desenvolvimento; pode conter erros.
    ```

    DEVE permanecer presente.

    A implementação no bundle NÃO DEVE alterar o painel `Licença` existente na página original.

    ## 10. Rodapé

    O bundle DEVE conter o mesmo rodapé canônico da página original, preservando:

    * conteúdo;
    * links aplicáveis;
    * créditos;
    * licença;
    * aparência;
    * responsividade;
    * acessibilidade;
    * comportamento;
    * atualizações futuras aplicáveis.

    O rodapé do bundle DEVE ser produzido a partir da fonte canônica ou por mecanismo automatizado de sincronização.

    A implementação NÃO DEVE alterar o rodapé da página original.

    ## 11. Painel `Modelo de mensagem`

    O painel offline DEVE preservar integralmente:

    * campos;
    * edição;
    * variáveis;
    * placeholders;
    * validações;
    * pré-visualização;
    * estados;
    * processamento;
    * salvamento;
    * nomenclatura do arquivo;
    * formato de saída;
    * comportamento responsivo;
    * acessibilidade;
    * regras já normatizadas;
    * futuras características aplicáveis.

    A versão offline NÃO DEVE possuir regra própria divergente da versão principal.

    Recursos da aplicação principal não pertencentes ao painel NÃO DEVEM ser incorporados, salvo dependência interna indispensável e invisível ao usuário.

    A implementação do bundle NÃO DEVE alterar a versão existente do painel na página original.

    ## 12. Painel adicional de edição de CSV

    O painel de CSV é recurso exclusivo adicional do novo bundle, salvo quando norma independente determinar futura incorporação ao produto principal.

    Sua implementação nesta issue NÃO autoriza adicioná-lo à página existente.

    O painel DEVE permitir:

    * criar tabela vazia;
    * importar CSV local;
    * editar células;
    * adicionar e remover linhas;
    * adicionar, remover e renomear colunas;
    * copiar e colar células ou intervalos;
    * navegar por teclado;
    * ordenar ou filtrar quando suportado pela biblioteca escolhida;
    * validar estrutura e valores;
    * exibir erros por linha, coluna e célula;
    * exportar o resultado validado;
    * preservar colunas adicionais;
    * integrar os dados ao painel `Modelo de mensagem`.

    ## 13. Biblioteca tabular obrigatoriamente embedded

    A edição de CSV DEVE utilizar biblioteca open source, client-side, estável, mantida e adequada à edição tabular no estilo de planilha.

    A escolha DEVE considerar:

    * licença compatível;
    * manutenção ativa;
    * funcionamento offline;
    * possibilidade de incorporação integral ao bundle;
    * compatibilidade com navegador;
    * acessibilidade;
    * edição de células;
    * navegação por teclado;
    * volume esperado;
    * importação e exportação;
    * tamanho proporcional;
    * ausência de dependência de servidor;
    * ausência de dependência remota;
    * integração com a arquitetura vigente.

    É PROIBIDO implementar do zero editor de planilha quando biblioteca adequada atender aos requisitos.

    A biblioteca e todas as dependências transitivas necessárias DEVEM ser incorporadas ao único arquivo HTML.

    É PROIBIDO:

    * utilizar CDN;
    * carregar a biblioteca por URL;
    * exigir instalação local;
    * depender de asset externo;
    * omitir funcionalidade necessária porque a biblioteca não foi corretamente empacotada.

    A licença da biblioteca DEVE ser verificada, preservada e incorporada ao artefato ou à documentação aplicável conforme suas exigências.

    ## 14. Colunas obrigatórias

    O CSV DEVE possuir, no mínimo:

    ```text
    nome
    telefone
    ```

    A coluna `telefone` PODE ser denominada alternativamente:

    ```text
    fone
    ```

    As identificações DEVEM ser `case-insensitive`.

    Exemplos aceitos:

    ```text
    nome
    Nome
    NOME

    telefone
    Telefone
    TELEFONE

    fone
    Fone
    FONE
    ```

    A normalização DEVE considerar variações de caixa, mas NÃO DEVE aceitar erros ortográficos, abreviações adicionais ou nomes semanticamente aproximados sem norma específica.

    ## 15. Sinonímia normativa entre `telefone` e `fone`

    `telefone` e `fone` DEVEM ser tratados como aliases normativos equivalentes para a mesma função lógica.

    A implementação DEVE:

    * aceitar qualquer um deles;
    * aplicar as mesmas validações;
    * aplicar as mesmas regras de negócio;
    * permitir somente uma coluna canônica efetiva para a função quando houver ambiguidade;
    * detectar a presença simultânea de ambas;
    * impedir seleção silenciosa e arbitrária quando ambas possuírem valores conflitantes;
    * adotar regra determinística de consolidação ou exigir correção do usuário;
    * preservar o cabeçalho original quando isso não comprometer o contrato de saída;
    * expor internamente um identificador semântico comum.

    Exemplo meramente conceitual:

    ```text
    phone
    ```

    O identificador interno NÃO DEVE ser imposto sem aderência à arquitetura real.

    ## 16. Atualização normativa global de `telefone | fone`

    Toda regra de negócio, schema, validação, documentação, teste ou implementação que atualmente exija exclusivamente `telefone` DEVE ser revisada para aceitar:

    ```text
    telefone | fone
    ```

    como aliases equivalentes.

    Essa alteração normativa é transversal e DEVE alcançar, quando existentes:

    * RCF global;
    * RCFs especializados;
    * schemas;
    * parsers;
    * validadores;
    * importadores;
    * exportadores;
    * geradores;
    * interface;
    * mensagens de erro;
    * modelos;
    * testes;
    * exemplos;
    * documentação;
    * workflows;
    * arquivos de configuração.

    Essa atualização NÃO DEVE alterar a experiência, página ou saída existente além da ampliação estritamente necessária para aceitar `fone` como sinônimo de `telefone`.

    É PROIBIDO modificar visual, layout, navegação, composição dos painéis ou artefatos atuais sob justificativa dessa compatibilidade.

    ## 17. Coluna `nome`

    A coluna `nome` permanece obrigatória e `case-insensitive`.

    As regras já normatizadas para:

    * presença;
    * valor;
    * normalização;
    * conteúdo;
    * validação;
    * uso no modelo;
    * mensagens de erro;

    DEVEM ser integralmente reutilizadas, sem duplicação ou divergência.

    ## 18. Colunas adicionais

    O CSV PODE conter qualquer quantidade de colunas adicionais válidas.

    Essas colunas DEVEM:

    * ser preservadas na importação, edição e exportação;
    * poder ser utilizadas como variáveis no modelo quando o recurso vigente permitir;
    * respeitar as regras de nomenclatura existentes;
    * não substituir implicitamente `nome`, `telefone` ou `fone`;
    * não ser descartadas por não serem obrigatórias.

    ## 19. Validação

    Antes do processamento ou salvamento, validar:

    * presença de `nome`;
    * presença de exatamente uma função telefônica válida por `telefone` ou `fone`;
    * cabeçalhos vazios;
    * cabeçalhos duplicados após normalização `case-insensitive`;
    * presença simultânea conflitante de `telefone` e `fone`;
    * valores conforme as regras normatizadas;
    * quantidade e consistência das colunas;
    * linhas vazias ou inválidas;
    * caracteres e codificação;
    * demais contratos aplicáveis.

    Erros DEVEM ser apresentados de forma:

    * clara;
    * localizada;
    * acionável;
    * acessível;
    * não destrutiva.

    O download final NÃO DEVE ser apresentado como válido enquanto houver erro impeditivo.

    ## 20. Importação de CSV

    A importação DEVE:

    * operar exclusivamente no dispositivo;
    * não enviar o arquivo para servidor;
    * não acessar serviço remoto;
    * detectar e tratar UTF-8 com ou sem BOM;
    * interpretar prioritariamente `;` como separador canônico;
    * suportar campos delimitados por `"`;
    * preservar conteúdo textual;
    * tratar quebras de linha internas corretamente;
    * detectar estrutura incompatível;
    * não perder colunas, linhas ou caracteres;
    * informar ambiguidades antes de modificar os dados.

    Formatos alternativos somente PODEM ser aceitos como entrada quando houver detecção segura e normalização explícita para o padrão canônico.

    ## 21. Exportação de CSV

    O arquivo exportado DEVE utilizar:

    * codificação UTF-8;
    * BOM UTF-8;
    * separador `;`;
    * delimitador de campo `"`;
    * escape CSV compatível;
    * conteúdo textual integral;
    * quebra de linha consistente;
    * extensão `.csv`.

    O BOM DEVE corresponder aos bytes:

    ```text
    EF BB BF
    ```

    Campos DEVEM ser serializados conforme a gramática CSV aplicável, incluindo escape de aspas por duplicação.

    Exemplo:

    ```csv
    "nome";"telefone";"observacao"
    "Maria";"5511999999999";"Texto"
    ```

    A regra referente a `"` DEVE ser interpretada como delimitador e mecanismo de escape do conteúdo textual, não como transformação do valor original.

    ## 22. Download local

    O painel DEVE permitir salvamento por download local, sem servidor, de forma equivalente ao recurso já existente no painel `Modelo de mensagem`.

    O nome do arquivo DEVE:

    * ser gerado localmente;
    * seguir a convenção já normatizada;
    * possuir extensão `.csv`;
    * ser seguro para filesystem;
    * evitar sobrescrita involuntária quando o navegador permitir distinção;
    * utilizar fallback determinístico quando os dados necessários ao nome estiverem ausentes.

    Não criar convenção divergente sem necessidade normativa comprovada.

    ## 23. Integração entre CSV e modelo

    O painel de CSV e o painel `Modelo de mensagem` do bundle DEVEM operar de forma integrada.

    A implementação DEVE permitir, conforme os recursos vigentes:

    * selecionar linhas;
    * validar destinatários;
    * utilizar colunas como variáveis;
    * pré-visualizar substituições;
    * processar cada registro;
    * identificar erros por destinatário;
    * preservar a relação entre linha e resultado;
    * exportar ou utilizar os dados sem conversão manual externa.

    A integração NÃO DEVE alterar a semântica atual do modelo de mensagem.

    ## 24. Persistência exclusivamente local

    Quando houver persistência de estado, utilizar mecanismo local compatível com execução offline, como:

    * memória da sessão;
    * `localStorage`;
    * IndexedDB;
    * download explícito;
    * mecanismo browser-side equivalente.

    Dados do usuário NÃO DEVEM:

    * sair do dispositivo;
    * ser enviados a servidor;
    * ser enviados a telemetria;
    * ser incorporados ao bundle;
    * permanecer indefinidamente sem regra de limpeza;
    * ser expostos a outros contextos sem necessidade.

    ## 25. Segurança

    Arquivos CSV importados e valores de células DEVEM ser tratados como dados não confiáveis.

    A implementação DEVE impedir:

    * execução de HTML;
    * execução de JavaScript;
    * injeção no DOM;
    * interpretação insegura de fórmulas;
    * CSV injection em consumidores externos;
    * path traversal;
    * corrupção de download;
    * exposição involuntária de dados.

    Fórmulas ou valores iniciados por caracteres interpretáveis por planilhas DEVEM seguir a política vigente ou, na ausência dela, ser preservados como texto e neutralizados na exportação quando necessário à segurança, sem perda silenciosa.

    ## 26. Build adicional

    A cadeia de build DEVE produzir o bundle como nova saída, sem substituir as existentes.

    O build DEVE:

    1. preservar todos os artefatos atuais;
    2. produzir um único arquivo HTML autocontido;
    3. incorporar todas as dependências e assets necessários;
    4. eliminar qualquer chamada remota obrigatória;
    5. validar ausência de dependência de Node.js em runtime;
    6. validar ausência de servidor em runtime;
    7. validar ausência de CDN;
    8. validar ausência de arquivos auxiliares obrigatórios;
    9. validar equivalência com os componentes canônicos;
    10. validar funcionamento offline desde a primeira abertura;
    11. gerar hash e metadados do novo artefato;
    12. falhar diante de divergência material;
    13. incluir o bundle no release e na publicação aplicável como saída adicional;
    14. manter nome e caminho próprios;
    15. não alterar a página, o produto ou a saída existentes.

    Dependências de desenvolvimento PODEM utilizar Node.js em tempo de build. O arquivo final NÃO PODE exigir Node.js para execução.

    ## 27. Validação de autocontenção

    O build DEVE inspecionar o artefato produzido e falhar se detectar dependência obrigatória externa, incluindo:

    * `script src` remoto ou local externo;
    * `link href` de stylesheet obrigatório;
    * fonte externa;
    * imagem externa obrigatória;
    * worker externo;
    * manifesto externo;
    * módulo externo;
    * `fetch` obrigatório;
    * WebSocket;
    * API remota;
    * CDN;
    * importação dinâmica externa;
    * asset não incorporado.

    A validação DEVE distinguir links referenciais voluntariamente acionados pelo usuário de dependências automáticas de funcionamento.

    ## 28. Monitoramento de paridade

    Criar validação automática que detecte alterações futuras nos elementos espelhados.

    A validação DEVE abranger, conforme aplicabilidade:

    * estrutura;
    * propriedades;
    * estados;
    * eventos;
    * estilos;
    * textos;
    * traduções;
    * assets;
    * validações;
    * recursos;
    * contratos;
    * acessibilidade.

    Quando alteração da origem exigir adaptação não automática, o build DEVE falhar com diagnóstico objetivo, em vez de publicar bundle silenciosamente desatualizado.

    O monitoramento NÃO DEVE considerar como divergência a ausência, no bundle, de elementos da página que estejam fora do escopo definido nesta issue.

    ## 29. Normatização no RCF

    Normatizar integralmente:

    * natureza estritamente aditiva;
    * preservação do produto existente;
    * preservação da página existente;
    * preservação das saídas existentes;
    * criação do novo bundle;
    * conteúdo limitado aos painéis e rodapé especificados;
    * equivalência obrigatória;
    * fonte canônica;
    * sincronização em build;
    * funcionamento integralmente offline;
    * autocontenção em arquivo único;
    * proibição absoluta de CDN;
    * independência de servidor;
    * independência de Node.js em runtime;
    * composição embedded;
    * rodapé;
    * painel `Licença`;
    * painel `Modelo de mensagem`;
    * editor de CSV;
    * biblioteca externa incorporada;
    * colunas obrigatórias;
    * sinonímia entre `telefone` e `fone`;
    * importação;
    * validação;
    * exportação;
    * codificação;
    * separadores;
    * download;
    * persistência;
    * segurança;
    * testes;
    * paridade futura;
    * critérios de não regressão.

    As normas comuns DEVEM ser centralizadas. O bundle NÃO DEVE possuir RCF paralelo, contraditório ou desvinculado do RCF canônico.

    ## 30. Testes obrigatórios

    Criar ou atualizar testes para, no mínimo:

    ### 30.1 Não regressão

    * produto atual permanece funcional;
    * página atual permanece funcional;
    * saída atual permanece disponível;
    * rotas atuais permanecem inalteradas;
    * build atual permanece válido;
    * painel original permanece funcional;
    * rodapé original permanece funcional;
    * painel `Licença` original permanece funcional;
    * nenhum recurso foi transferido exclusivamente para o bundle;
    * aplicação principal não depende do bundle.

    ### 30.2 Autonomia

    * execução sem internet;
    * execução sem servidor;
    * execução sem Node.js;
    * carregamento direto do único arquivo HTML;
    * funcionamento desde a primeira abertura offline;
    * ausência de CDN;
    * ausência de recursos externos obrigatórios;
    * ausência de arquivos auxiliares obrigatórios;
    * inexistência de requisições automáticas de rede;
    * integridade após cópia para outro diretório ou computador compatível.

    ### 30.3 Paridade

    * equivalência visual;
    * equivalência funcional;
    * rodapé correto;
    * painel `Licença` correto;
    * aviso de desenvolvimento presente;
    * painel `Modelo de mensagem` integral;
    * detecção de divergência futura;
    * funcionamento responsivo;
    * acessibilidade.

    ### 30.4 CSV

    * importação de CSV;
    * edição tabular;
    * exigência de `nome`;
    * aceitação de `telefone`;
    * aceitação de `fone`;
    * insensibilidade a caixa;
    * rejeição de ausência de coluna telefônica;
    * conflito entre `telefone` e `fone`;
    * preservação de colunas adicionais;
    * aplicação das validações normatizadas;
    * exportação UTF-8 com BOM;
    * separador `;`;
    * delimitador `"`;
    * escape de aspas;
    * download local;
    * nomenclatura do arquivo;
    * integração entre dados e modelo;
    * segurança do conteúdo;
    * persistência local.

    O teste offline DEVE bloquear efetivamente a rede. Não é suficiente carregar previamente os recursos e desconectar depois.

    ## 31. Ordem de execução

    1. Ler todas as normas e fontes aplicáveis.
    2. Registrar explicitamente as páginas, produtos e saídas que não podem ser alterados.
    3. Inspecionar o painel e suas dependências reais.
    4. Mapear recursos incompatíveis com execução autônoma.
    5. Definir a fonte canônica e a estratégia de paridade.
    6. Normatizar integralmente no RCF.
    7. Criar ou atualizar FTs rastreáveis.
    8. Selecionar e validar a biblioteca tabular.
    9. Validar a possibilidade de incorporação integral da biblioteca e dependências.
    10. Adaptar ou compartilhar componentes sem regressão do produto atual.
    11. Implementar o painel adicional de CSV exclusivamente no bundle.
    12. Atualizar globalmente a sinonímia `telefone | fone`.
    13. Implementar importação, validação e exportação.
    14. Implementar integração com o modelo.
    15. Implementar persistência local.
    16. Produzir o novo arquivo HTML autocontido.
    17. Incorporar todas as dependências e assets.
    18. Implementar validação automática de autocontenção.
    19. Implementar validação de paridade em build.
    20. Executar testes de não regressão.
    21. Executar testes funcionais, visuais, normativos, offline e de segurança.
    22. Integrar o novo artefato ao release e à publicação aplicável sem substituir saídas existentes.
    23. Atualizar documentação.
    24. Emitir relatório final.

    ## Critérios de aceite

    * [ ] Foi criada uma nova saída adicional, sem substituição das existentes.
    * [ ] O produto atual não foi alterado materialmente.
    * [ ] A página atual não foi substituída nem convertida em bundle.
    * [ ] A saída atual permanece disponível e funcional.
    * [ ] O novo artefato contém somente o rodapé e os painéis especificados, além de suas dependências indispensáveis.
    * [ ] Existe um único arquivo HTML autocontido.
    * [ ] O bundle funciona integralmente offline desde a primeira abertura.
    * [ ] Nenhum servidor é necessário.
    * [ ] Node.js não é necessário em runtime.
    * [ ] CDN não é utilizada.
    * [ ] Nenhum recurso obrigatório depende de internet.
    * [ ] Nenhum arquivo auxiliar é necessário em runtime.
    * [ ] O bundle contém o rodapé canônico.
    * [ ] O bundle contém o painel `Licença` canônico.
    * [ ] O aviso de desenvolvimento permanece presente.
    * [ ] O painel `Modelo de mensagem` preserva todos os recursos aplicáveis.
    * [ ] Alterações futuras aplicáveis são detectadas e espelhadas em build.
    * [ ] Divergências materiais fazem o build falhar.
    * [ ] Existe editor client-side de CSV no estilo de planilha.
    * [ ] Foi utilizada biblioteca open source, mantida, compatível e integralmente embedded.
    * [ ] A coluna `nome` é obrigatória e `case-insensitive`.
    * [ ] `telefone` e `fone` são aliases aceitos e `case-insensitive`.
    * [ ] Normas e implementações correspondentes aceitam ambos.
    * [ ] Colunas adicionais são preservadas.
    * [ ] As regras existentes das colunas obrigatórias continuam aplicadas.
    * [ ] O CSV é exportado em UTF-8 com BOM.
    * [ ] O separador é `;`.
    * [ ] O delimitador textual é `"`.
    * [ ] O arquivo é salvo localmente com extensão `.csv`.
    * [ ] O nome segue a convenção vigente.
    * [ ] Dados do usuário não saem do dispositivo.
    * [ ] O artefato está integralmente normatizado no RCF.
    * [ ] Testes de não regressão passam.
    * [ ] Testes de autocontenção passam.
    * [ ] Todos os demais testes passam sem regressão.

    ## Relatório final

    Registrar objetivamente:

    * páginas, produtos e saídas existentes preservados;
    * comprovação de que o trabalho foi estritamente aditivo;
    * arquitetura original inspecionada;
    * fonte canônica definida;
    * estratégia de compartilhamento ou sincronização;
    * componentes reutilizados ou adaptados;
    * comprovação de neutralidade das alterações compartilhadas;
    * recursos convertidos de Node.js para navegador;
    * formato e localização do novo bundle;
    * comprovação de arquivo único;
    * validação de ausência de CDN;
    * validação de ausência de dependências externas;
    * biblioteca tabular adotada, versão e licença;
    * tratamento de `nome`, `telefone` e `fone`;
    * alterações normativas globais;
    * importação e exportação implementadas;
    * codificação e serialização validadas;
    * mecanismos de persistência e segurança;
    * validação de paridade;
    * arquivos e normas alterados;
    * testes executados e resultados;
    * limitações ou incompatibilidades remanescentes.

* [ ] **Criar formato unificado, reversível e interoperável para modelo `.md` e dados `.csv`:** manter integralmente os arquivos separados atualmente utilizados — `.md` para o modelo de mensagem e `.csv` para os dados — e acrescentar formato unificado capaz de encapsular ambos sem perda, alteração semântica ou dependência entre seus conteúdos.

  * [ ] **Preservar os formatos separados:** a criação do formato unificado é estritamente aditiva. A página principal e o futuro bundle 100% offline DEVEM continuar capazes de criar, carregar, editar, salvar e utilizar os formatos separados conforme suas competências atuais ou já normatizadas.

    Regras vigentes:

    * o arquivo `.md` permanece formato autônomo do modelo de mensagem;
    * o arquivo `.csv` permanece formato autônomo dos dados;
    * o bundle PODE criar, importar, editar, validar e exportar `.csv`;
    * a página principal, no estado funcional atualmente previsto, apenas carrega e vincula `.csv`, sem adquirir por esta tarefa capacidade autônoma de edição tabular;
    * tanto a página principal quanto o bundle DEVEM continuar capazes de editar o modelo `.md`, ainda que por implementações diferentes;
    * nenhuma capacidade existente PODE ser removida, substituída ou condicionada ao formato unificado.

  * [ ] **Natureza imperativa do bundle:** o bundle 100% offline é exclusivamente um **editor prévio local**. Ele DEVE preparar, editar, validar, importar, exportar e empacotar os artefatos que serão posteriormente utilizados pela página principal.

    O bundle:

    * NÃO É o produto executor principal;
    * NÃO DEVE executar o processamento final de envio;
    * NÃO DEVE assumir atribuições operacionais exclusivas da página principal;
    * NÃO DEVE transformar-se em variante integral do produto;
    * NÃO DEVE ampliar seu escopo além da preparação local dos dados e do modelo;
    * DEVE permanecer 100% client-side, offline e autocontido;
    * DEVE produzir artefatos integralmente interoperáveis com a página principal.

  * [ ] **Formato unificado:** definir e implementar contêiner estruturado que encapsule, no mínimo:

    * o conteúdo integral do modelo `.md`;
    * o conteúdo integral ou representação canônica do `.csv`;
    * metadados suficientes para identificação, validação, compatibilidade e restauração;
    * versão do formato;
    * codificação;
    * convenções de serialização;
    * hashes ou mecanismos de integridade aplicáveis;
    * informações necessárias para distinguir conteúdo original, normalizado e derivado.

  * [ ] **Escolha técnica do formato:** JSON é a recomendação inicial, mas sua extensão ou representação NÃO é obrigatória.

    A implementação DEVE inspecionar o estado real e selecionar formato adequado considerando:

    * preservação textual sem perda;
    * reversibilidade;
    * legibilidade;
    * interoperabilidade browser-side;
    * serialização determinística;
    * validação por schema;
    * versionamento;
    * extensibilidade;
    * segurança;
    * facilidade de importação e exportação;
    * tamanho proporcional;
    * suporte integral à formatação proprietária existente no `.md`;
    * independência de servidor e Node.js em runtime;
    * possibilidade de distinguir o artefato unificado de JSON genérico.

    O formato PODE utilizar JSON internamente e extensão própria, como contêiner de domínio, se isso reduzir ambiguidades e associações indevidas. A extensão final DEVE ser curta, inequívoca, documentada e não conflitante com formatos existentes.

  * [ ] **Markdown proprietário:** o `.md` atual contém convenções proprietárias que não correspondem necessariamente ao Markdown comum.

    Portanto:

    * o conteúdo DEVE ser tratado como linguagem ou formato de domínio próprio, ainda que utilize extensão `.md`;
    * o formato unificado DEVE preservar integralmente caracteres, marcações, placeholders, comandos, escapes, quebras de linha, espaços significativos e demais convenções proprietárias;
    * É PROIBIDO reinterpretar, renderizar, normalizar ou converter o conteúdo como Markdown genérico durante encapsulamento ou restauração;
    * a serialização DEVE permitir recuperação byte a byte quando nenhuma transformação normativa explícita for necessária;
    * metadados DEVEM identificar a sintaxe ou versão proprietária aplicável.

  * [ ] **Representação do CSV:** o conteúdo CSV encapsulado DEVE preservar integralmente:

    * cabeçalhos;
    * ordem das colunas;
    * ordem das linhas;
    * valores;
    * células vazias;
    * caracteres Unicode;
    * quebras de linha internas;
    * aspas;
    * separadores;
    * aliases válidos;
    * colunas adicionais;
    * demais características semanticamente relevantes.

    A representação interna PODE ser:

    * o texto CSV canônico integral;
    * estrutura tabular tipada;
    * ambas as formas, quando necessário à integridade e à eficiência.

    Se houver representação dupla, uma DEVE ser definida como fonte canônica e a outra como derivada verificável, evitando divergência.

  * [ ] **Padrão CSV preservado:** quando desacoplado ou exportado como `.csv`, o arquivo DEVE continuar utilizando:

    * UTF-8 com BOM;
    * separador `;`;
    * delimitador textual `"`;
    * extensão `.csv`;
    * regras vigentes de escape;
    * obrigatoriedade de `nome`;
    * exatamente um dos aliases `telefone` XOR `fone`, reconhecidos de forma `case-insensitive`;
    * preservação das demais colunas.

  * [ ] **Capacidades comuns:** tanto a página principal quanto o bundle offline DEVEM possuir plena capacidade de:

    * gerar o formato unificado;
    * importar e validar o formato unificado;
    * identificar sua versão;
    * extrair o modelo e os dados;
    * correlacionar cada conteúdo ao campo, painel ou fluxo apropriado;
    * restaurar o estado suportado;
    * salvar novamente o formato unificado;
    * desacoplar e exportar `.md` e `.csv` separadamente;
    * reencapsular os artefatos separados;
    * rejeitar conteúdo inválido, incompatível ou incompleto;
    * preservar campos desconhecidos compatíveis quando exigido pela política de evolução.

  * [ ] **Capacidades específicas do bundle:** como editor prévio, o bundle DEVE:

    * criar um projeto unificado vazio;
    * importar `.md` isolado;
    * importar `.csv` isolado;
    * importar ambos e correlacioná-los;
    * importar o formato unificado;
    * editar o modelo;
    * criar e editar o CSV;
    * validar ambos;
    * gerar o formato unificado;
    * exportar `.md` e `.csv` separadamente;
    * desacoplar um formato unificado em seus dois artefatos;
    * reabrir, editar e salvar novamente o contêiner;
    * operar integralmente no dispositivo, sem envio de dados.

    Essas capacidades NÃO autorizam o bundle a executar o processamento final de mensagens.

  * [ ] **Capacidades específicas da página principal:** a página executora DEVE:

    * carregar `.md`;
    * carregar e vincular `.csv`;
    * carregar o formato unificado;
    * redistribuir automaticamente o modelo e os dados aos fluxos apropriados;
    * permitir edição do modelo conforme sua implementação vigente;
    * preservar o CSV carregado sem exigir editor tabular;
    * gerar e salvar o formato unificado a partir do estado corrente;
    * exportar ou desacoplar `.md` e `.csv` quando o recurso correspondente estiver disponível;
    * utilizar o conteúdo encapsulado no processamento normal.

    Esta tarefa NÃO DEVE adicionar editor de CSV à página principal.

  * [ ] **Redistribuição contextual:** ao importar o formato unificado, cada aplicação DEVE distribuir o conteúdo conforme suas capacidades reais.

    Exemplos:

    * o modelo DEVE preencher o editor `Modelo de mensagem`;
    * os dados DEVEM preencher ou vincular o mecanismo de CSV;
    * o bundle DEVE permitir edição tabular;
    * a página principal DEVE apenas carregar e vincular os dados enquanto não houver norma posterior que autorize edição;
    * metadados DEVEM alimentar os componentes correspondentes quando aplicáveis;
    * campos não suportados NÃO DEVEM ser descartados silenciosamente.

  * [ ] **Desacoplamento reversível:** qualquer formato unificado válido DEVE poder ser convertido novamente em:

    * um arquivo `.md` funcionalmente equivalente ao encapsulado;
    * um arquivo `.csv` funcionalmente equivalente ao encapsulado.

    O ciclo:

    ```text
    .md + .csv → formato unificado → .md + .csv
    ```

    DEVE preservar integralmente a semântica e, quando aplicável, a representação original.

  * [ ] **Reintegração determinística:** os artefatos desacoplados DEVEM poder ser novamente encapsulados sem gerar alterações materiais indevidas.

    O ciclo:

    ```text
    unificado → separados → unificado
    ```

    DEVE produzir resultado semanticamente equivalente e determinístico, desconsiderando apenas metadados voláteis explicitamente normatizados, como data de salvamento.

  * [ ] **Ausência parcial:** o formato unificado completo DEVE conter modelo e CSV. Contudo, durante edição preliminar, o bundle PODE manter estado parcial antes da exportação final.

    A implementação DEVE distinguir:

    * projeto parcial editável;
    * projeto completo válido;
    * artefato apto ao processamento;
    * artefato inválido.

    A página principal NÃO DEVE iniciar processamento que dependa de elemento ausente.

  * [ ] **Versionamento:** o formato unificado DEVE possuir versão explícita e independente da versão da aplicação.

    Alterações futuras DEVEM:

    * preservar leitura de versões anteriores quando tecnicamente possível;
    * utilizar migração determinística;
    * impedir interpretação silenciosa de versão incompatível;
    * registrar transformações aplicadas;
    * não sobrescrever o arquivo original durante migração sem ação explícita;
    * permitir evolução de novos campos sem comprometer os atuais.

  * [ ] **Schema e validação:** definir schema formal ou contrato equivalente para validar:

    * tipo do artefato;
    * versão;
    * presença dos conteúdos obrigatórios;
    * tipos dos campos;
    * encoding;
    * integridade;
    * estrutura do modelo;
    * estrutura do CSV;
    * aliases e exclusividade `telefone` XOR `fone`;
    * metadados;
    * extensões futuras;
    * limites de tamanho;
    * conteúdo malformado.

    A validação DEVE ocorrer antes da redistribuição aos campos.

  * [ ] **Estrutura conceitual mínima:** sem impor prematuramente nomes definitivos, o formato DEVE representar conceito equivalente a:

    ```json
    {
      "format": "<identificador>",
      "version": 1,
      "messageModel": {
        "syntax": "<sintaxe-proprietaria>",
        "content": "<conteudo-integral-do-md>"
      },
      "data": {
        "format": "csv",
        "encoding": "utf-8-bom",
        "delimiter": ";",
        "quote": "\"",
        "content": "<conteudo-integral-ou-canonico>"
      },
      "metadata": {}
    }
    ```

    Esse exemplo é delimitador conceitual, NÃO contrato final obrigatório. A estrutura definitiva DEVE ser normatizada após inspeção.

  * [ ] **Integridade:** o contêiner DEVE permitir detectar:

    * truncamento;
    * corrupção;
    * alteração não intencional;
    * conteúdo incompatível;
    * divergência entre representações duplicadas.

    Utilizar SHA-256 ou mecanismo já normatizado quando aplicável. Hash NÃO DEVE ser tratado como assinatura ou prova de autenticidade.

  * [ ] **Segurança:** o formato unificado e seus conteúdos DEVEM ser tratados como dados não confiáveis.

    A implementação DEVE impedir:

    * execução de HTML ou JavaScript incorporado;
    * prototype pollution;
    * injeção no DOM;
    * fórmulas CSV perigosas;
    * abuso de tamanho ou profundidade;
    * campos inesperados capazes de alterar comportamento;
    * path traversal;
    * carregamento automático de recursos externos;
    * interpretação do modelo proprietário como código não autorizado.

  * [ ] **Privacidade:** todo processamento do formato unificado no bundle DEVE ocorrer localmente. A página principal DEVE seguir as regras vigentes de tratamento de dados.

    O formato NÃO DEVE incluir:

    * credenciais;
    * tokens;
    * cookies;
    * dados de sessão;
    * caminhos locais desnecessários;
    * telemetria;
    * informações externas ao projeto preparado.

  * [ ] **Nome do arquivo:** definir nomenclatura determinística para o contêiner unificado, baseada na convenção atual de salvamento do modelo, sem substituir os nomes independentes de `.md` e `.csv`.

    A extensão própria, se adotada, DEVE:

    * identificar claramente o formato;
    * evitar associação enganosa com JSON genérico;
    * permitir reconhecimento pelo produto;
    * permanecer estável;
    * ser registrada no RCF.

  * [ ] **Interface:** ambas as aplicações DEVEM oferecer ações inequívocas, conforme capacidade:

    * `Abrir modelo`;
    * `Abrir CSV`;
    * `Abrir projeto unificado`;
    * `Salvar modelo`;
    * `Salvar CSV`;
    * `Salvar projeto unificado`;
    * `Exportar arquivos separados`.

    Os nomes PODEM variar conforme o vocabulário canônico, mas NÃO DEVEM confundir:

    * arquivos independentes;
    * projeto unificado;
    * edição;
    * processamento final.

  * [ ] **Conflitos de importação:** ao importar conteúdo unificado sobre estado já preenchido, a aplicação DEVE:

    * detectar substituição potencial;
    * solicitar decisão explícita quando houver perda de alterações;
    * permitir cancelar;
    * não mesclar silenciosamente conteúdos incompatíveis;
    * preservar estado anterior até confirmação;
    * aplicar substituição de forma atômica.

  * [ ] **Compatibilidade entre aplicações:** um contêiner gerado pelo bundle DEVE ser integralmente legível pela página principal, e um contêiner gerado pela página principal DEVE ser integralmente legível pelo bundle, respeitadas as diferenças funcionais.

    Ausência de capacidade de editar CSV na página principal NÃO PODE impedir leitura, preservação, utilização, reexportação ou reencapsulamento dos dados.

  * [ ] **Fonte única de regras:** parser, serializer, schema, versionamento e normalização do formato unificado DEVEM derivar de contrato comum.

    Quando possível, compartilhar implementação compatível com navegador. Quando não for possível, criar implementações equivalentes submetidas aos mesmos vetores de teste.

    É PROIBIDO manter formatos aproximadamente semelhantes, porém incompatíveis, em cada aplicação.

  * [ ] **Autocontenção do bundle:** todos os mecanismos necessários para ler, gerar, validar, desacoplar e salvar o formato unificado DEVEM estar integralmente incorporados ao bundle offline. CDN, servidor, Node.js em runtime, API externa ou recurso remoto são proibidos.

  * [ ] **Não regressão:** a implementação NÃO DEVE:

    * impedir uso separado de `.md`;
    * impedir uso separado de `.csv`;
    * obrigar migração dos arquivos existentes;
    * transformar o formato unificado em requisito exclusivo;
    * adicionar editor CSV à página principal;
    * atribuir processamento final ao bundle;
    * modificar a sintaxe proprietária do modelo;
    * alterar o padrão CSV vigente;
    * remover compatibilidade com arquivos legados válidos.

  * [ ] **Normatização no RCF:** incorporar integralmente:

    * permanência dos formatos separados;
    * caráter aditivo do formato unificado;
    * natureza do bundle como mero editor prévio;
    * competências distintas de cada aplicação;
    * formato e extensão adotados;
    * schema;
    * versionamento;
    * serialização;
    * preservação da sintaxe proprietária;
    * representação do CSV;
    * reversibilidade;
    * interoperabilidade;
    * integridade;
    * segurança;
    * nomenclatura;
    * interface;
    * testes;
    * critérios de aceite.

  * [ ] **Testes obrigatórios:** validar, no mínimo:

    * `.md` separado continua sendo criado, lido, editado e salvo;
    * `.csv` separado continua sendo criado e editado pelo bundle;
    * `.csv` separado continua sendo carregado pela página principal;
    * o bundle permanece apenas editor prévio;
    * a página principal permanece responsável pelo processamento;
    * ambas geram o formato unificado;
    * ambas leem o formato unificado gerado pela outra;
    * modelo e CSV são redistribuídos corretamente;
    * desacoplamento restaura ambos os arquivos;
    * reencapsulamento é semanticamente determinístico;
    * formatação proprietária do `.md` é preservada;
    * UTF-8 BOM, `;` e `"` são preservados no CSV exportado;
    * `nome + telefone` é aceito;
    * `nome + fone` é aceito;
    * `telefone` e `fone` coexistentes são rejeitados;
    * colunas adicionais são preservadas;
    * versões incompatíveis são rejeitadas com diagnóstico;
    * versões antigas suportadas são migradas corretamente;
    * corrupção é detectada;
    * conteúdo malicioso não é executado;
    * importação sobre estado alterado exige decisão;
    * arquivos separados permanecem opcionais e plenamente funcionais;
    * o bundle executa todas essas operações 100% offline.

  * [ ] **Critérios de aceite:**

    * [ ] `.md` e `.csv` continuam existindo e funcionando separadamente.
    * [ ] O formato unificado é adicional, não substitutivo.
    * [ ] O bundle está normativamente limitado a editor prévio local.
    * [ ] O bundle não executa o processamento final.
    * [ ] A página principal continua sendo a aplicação executora.
    * [ ] Ambas as aplicações geram, leem, validam e salvam o formato unificado.
    * [ ] Ambas desacoplam o formato em `.md` e `.csv`.
    * [ ] Ambas reencapsulam os arquivos separados.
    * [ ] O bundle edita modelo e CSV.
    * [ ] A página principal edita o modelo e apenas carrega ou vincula o CSV.
    * [ ] A diferença de capacidades não compromete interoperabilidade.
    * [ ] O conteúdo proprietário do `.md` é preservado integralmente.
    * [ ] O CSV preserva estrutura, dados e padrão normatizado.
    * [ ] O formato possui versão e validação formal.
    * [ ] O ciclo de conversão não causa perda semântica.
    * [ ] Arquivos legados permanecem válidos.
    * [ ] O bundle processa o contêiner integralmente offline e autocontido.
    * [ ] A regra foi incorporada integralmente ao RCF.
    * [ ] Todos os testes passam sem regressão.

  * [ ] **Relatório final:** registrar objetivamente:

    * formato e extensão adotados;
    * justificativa técnica da escolha;
    * schema e versão inicial;
    * representação do modelo proprietário;
    * representação do CSV;
    * regra de serialização determinística;
    * mecanismos de integridade;
    * capacidades implementadas em cada aplicação;
    * comprovação de que o bundle permanece mero editor prévio;
    * mecanismos de desacoplamento e reencapsulamento;
    * interoperabilidade validada;
    * arquivos e normas alterados;
    * testes executados e resultados;
    * limitações ou pendências remanescentes.
