# RCF - Requirements & Control Framework

## Projeto

Disparador Local de Mensagens WhatsApp.

## Objetivo

Realizar envio automatizado de mensagens personalizadas pelo WhatsApp Web,
usando um CSV local de destinatários e um template Markdown local, com operação
local, auditável e assistida por uma interface gráfica leve no navegador.

## Escopo

- Operação local e sob demanda.
- Sem uso da API Oficial da Meta.
- Comunicação externa somente com WhatsApp Web e URLs de anexos declaradas explicitamente no template.
- Sessão persistida localmente.
- Auditoria local em arquivos dentro de `./logs`.
- Compatibilidade com Windows, macOS e Linux quando Node.js, dependências e navegador Chromium compatível estiverem disponíveis.
- Entrada por CLI preservada para automação e entrada por GUI como experiência principal para uso assistido.

## Regras de Negócio

### RN001 - Origem dos Dados

Os destinatários devem ser carregados por padrão de `./clientes.csv`.

Opcionalmente, a execução pode receber um nome de lista sem extensão, fazendo os destinatários serem carregados de `./listas/NOME.csv`.

Se o parâmetro de lista contiver operadores de comparação ou funções lógicas, ele deve ser interpretado como filtro aplicado ao `./clientes.csv` padrão. Exemplos:

```text
coluna=valor
coluna!=valor
valor>=10,5 && status=ativo
($.isnum(valor) && valor>0) || $.istrue(vigente)
```

O nome da coluna do filtro deve ser insensível a maiúsculas e minúsculas. O filtro deve aceitar `=`, `!=`, `<`, `<=`, `>`, `>=`, `&&`, `||`, `^^`, `!`, parênteses, operações `+`, `-`, `*` e `/`, valores numéricos com `.` ou `,` decimal e funções `$.vazio()`, `$.isnum()`, `$.isfloat()`, `$.isint()`, `$.isbool()`, `$.istrue()` e `$.istring()`.

O CSV deve conter obrigatoriamente apenas as colunas `nome` e `telefone`. Colunas adicionais devem ficar disponíveis automaticamente como variáveis no template.

O carregamento do CSV deve aceitar codificações comuns em arquivos salvos por Excel, Bloco de Notas e planilhas, incluindo UTF-8 com ou sem BOM, UTF-16 e ANSI/Windows-1252, preservando acentuação, `ç` e símbolos compatíveis.

O parser deve inferir delimitadores comuns de arquivo e campo, incluindo vírgula, ponto e vírgula, tabulação e `|`, além de texto delimitado por aspas duplas ou simples.

### RN002 - Template de Mensagem

O template padrão deve ser carregado de `./texto.md`.

Opcionalmente, a execução pode receber um nome de modelo sem extensão, fazendo o template ser carregado de `./modelos/NOME.md`.

Quando a GUI fornecer conteúdo via editor textual ou arquivo `.md`, esse conteúdo deve substituir o uso de `texto.md` somente naquela execução.

O conteúdo textual deve ser preservado conforme definido no arquivo, após substituição de variáveis e interpretação dos anexos Markdown.

Quebras de linha de Windows (`CRLF`), Linux/macOS (`LF`), `CR` isolado e separadores Unicode devem ser normalizados para `LF` antes do envio, por ser o formato mais estável para WhatsApp Web. Recuos, espaços e tabulações intencionais do texto devem ser preservados.

Entidades HTML numéricas e nomeadas comuns, como `&#x20;`, `&#32;`, `&nbsp;`, `&amp;`, `&lt;` e `&ccedil;`, devem ser convertidas para caracteres Unicode reais antes do envio e antes da interpretação de anexos. O WhatsApp não deve receber essas entidades cruas.

### RN003 - Variáveis do Template

Variáveis devem usar o padrão `${nome}`, `${telefone}`, `${conta}` ou qualquer outra coluna existente no CSV.

O nome da variável dentro de `${}` deve ser insensível a maiúsculas e minúsculas.

Dentro de `${...}`, também devem ser aceitas expressões matemáticas simples com colunas do CSV, por exemplo `${(valor+taxa)*2}`.

O marcador `$diatarde$` deve ser substituído no momento do envio por `bom dia` ou `boa tarde`. A partir das 12h, usar `boa tarde`; antes disso, `bom dia`. Se o marcador estiver no início da frase ou logo após ponto seguido de espaços, a primeira letra deve ser maiúscula.

Antes do envio efetivo, o sistema deve verificar potenciais erros de sintaxe no modelo, incluindo `${...}` aberto sem fechamento, expressão inválida dentro de `${...}`, `{...}` sem `$` e chave `}` solta. Quando houver aviso, a GUI deve exibir confirmação explícita e a CLI deve perguntar `sim` ou `não`, sem diferenciar maiúsculas/minúsculas ou acentuação. O padrão deve ser abortar.

Caso a coluna não exista:

- Não lançar exceção.
- Substituir por string vazia.
- Registrar aviso em `./logs/avisos.csv`.

### RN004 - Formatação do Nome

Ao aplicar `${nome}`, o valor deve ser formatado para mensagem:

- Capitalizar as palavras.
- Manter no máximo duas palavras.
- Preservar nomes compostos com hífen.

### RN005 - Recursos Markdown Textuais

O template pode conter recursos textuais do Markdown aceitos pelo WhatsApp, como listas, blockquote, itálico, destaque e emojis. O sistema não deve sanitizar ou reescrever esse conteúdo textual além das variáveis previstas e da conversão de entidades HTML para caracteres reais.

### RN006 - Anexos via Markdown

A notação `![](CAMINHO_OU_URL)` deve ser interpretada como anexo.

O caminho pode ser relativo ao diretório do template em uso, absoluto ou URL `http/https`.

Para caminhos relativos, com ou sem `./` ou `.\`, o diretório do template em uso deve ser a referência primária. Se o arquivo não existir nessa referência, o sistema deve tentar a raiz do projeto antes de falhar. Caminhos absolutos devem ser preservados como referência direta.

Arquivos locais inexistentes devem falhar na pré-validação. URLs devem ser baixadas para uma pasta temporária e reutilizadas quando a mesma URL aparecer novamente.

O modelo também aceita `![rótulo](@embed:id)`. As definições embedded devem residir exclusivamente no fim do arquivo, entre `@@embedded` e `@@end`, com blocos `[id=...]`, `name`, `mime`, `encoding=base64` e `data=data:MIME;base64,BASE64`. O MIME declarado e o MIME da Data URI devem coincidir. IDs duplicados, Base64 inválido, MIME/extensão incompatíveis, definição sem referência ou referência sem definição devem bloquear a pré-validação. A sintaxe tradicional de caminhos e URLs permanece inalterada; o conteúdo embedded não participa de variantes `^^^`, postagens `$postagem$`, variáveis ou expressões.

### RN007 - Ordem e Legenda de Anexos

Quando um anexo estiver no início ou no final do template, o texto adjacente deve ser enviado como legenda do próprio anexo sempre que compatível com o WhatsApp Web.

Quando o anexo estiver no meio do texto, o sistema deve preservar a ordem do template enviando as partes separadamente.

Imagens devem ser enviadas como mídia; outros arquivos, como PDF ou ZIP, devem ser enviados como documento.

Arquivos `.ogg` devem ser inspecionados. Se forem contêiner OGG apenas de áudio, devem ser enviados como mensagem de voz separada no ponto exato da notação Markdown, usando recurso de áudio/voz do WhatsApp Web, MIME `audio/ogg` e sem envio como documento. Nesses casos, não devem absorver texto adjacente como legenda.

O envio de anexos deve ler o arquivo local em memória pelo Node.js antes de repassá-lo ao WhatsApp Web, evitando dependência posterior do caminho original, inclusive em diretórios com espaços, OneDrive ou fora do repositório. Falhas transitórias do navegador/WhatsApp Web durante envio de mídia, como erro de protocolo, promessa coletada, contexto destruído, frame destacado, navegação/recarregamento, comunicação ainda não iniciada ou fechamento temporário do alvo, devem aguardar estabilização do contexto do WhatsApp Web e ser retentadas silenciosamente com uma nova instância de mídia. Para `.ogg` de áudio, se o envio como mensagem de voz falhar após as tentativas, o sistema deve tentar enviar o mesmo arquivo como áudio comum, ainda sem documento, antes de registrar erro final.

### RN008 - Tratamento de Telefone

Antes de qualquer validação ou envio:

- Remover todos os caracteres não numéricos.
- Manter apenas dígitos.
- Adicionar o código do Brasil, `55`, quando ausente.

### RN009 - Validação de Existência no WhatsApp

Nenhuma mensagem deve ser enviada sem validação prévia do número via `client.getNumberId()`.

Números inexistentes ou inválidos devem ser registrados em log e não devem interromper o lote.

### RN010 - Prevenção Inteligente de Reenvio

O controle de envio deve usar `./logs/enviados.csv` e `./logs/mensagens.json`.

O sistema deve registrar telefone, hash do template nativo e data/hora.

Se a mensagem nativa atual for menos de 10% diferente de uma mensagem já enviada para o mesmo telefone dentro da janela configurada, o registro deve ser pulado.

Se a mensagem nativa atual diferir 10% ou mais, deve ser considerada nova e pode ser enviada sem força manual.

Se a mensagem similar tiver sido enviada há mais de 48 horas, por padrão, pode ser reenviada.

Os limites devem ser configuráveis via `MESSAGE_DIFF_THRESHOLD_PERCENT` e `RESEND_AFTER_HOURS`.

### RN011 - Forçar ou Limpar Histórico

Deve existir opção para reenviar ignorando o histórico:

```text
--force-resend
--reenviar
```

Deve existir opção para limpar o histórico de enviados:

```text
--clear-sent
--reset-sent
--reset-enviados
```

Essas opções não devem permitir envio para telefones inválidos ou números inexistentes no WhatsApp.

### RN012 - Continuidade Operacional

Em caso de interrupção inesperada, queda do sistema, perda de conexão ou reinicialização, a execução deve poder ser retomada sem reenviar mensagens ainda bloqueadas pelo histórico inteligente.

### RN013 - Isolamento de Falhas

Erros individuais devem ser registrados e não devem interromper o lote.

Erros finais de envio devem incluir identificação legível do destinatário quando houver coluna `nome`, além do telefone registrado na coluna própria do log.

### RN014 - Controle de Velocidade

Deve existir intervalo aleatório entre envios, configurável por `MIN_DELAY_MS` e `MAX_DELAY_MS`.

Valores padrão:

```text
8000 ms
20000 ms
```

### RN015 - Persistência de Sessão

A autenticação do WhatsApp deve permanecer armazenada localmente em `./.wwebjs_auth`.

Deve ser possível isolar uma sessão alternativa por `WA_CLIENT_ID`.

Ao alternar, encerrar ou remover uma sessão em uso, o navegador controlado deve ser encerrado de forma graciosa antes de qualquer reinício ou exclusão do diretório de autenticação, aguardando tempo suficiente para que o perfil local seja gravado. Se o encerramento seguro não puder ser confirmado, a exclusão da sessão ativa deve ser cancelada para evitar corrupção ou perda parcial de autenticação.

### RN016 - Operação Local e Privacidade

Dados de clientes não devem ser transmitidos para sistemas terceiros, exceto para o próprio WhatsApp durante o envio e para URLs de anexos explicitamente declaradas no template.

O projeto deve declarar de forma clara que se destina a comunicação legítima, proporcional e consentida com clientes reais, assinantes, contatos que autorizaram contato ou públicos próprios e legítimos.

O projeto deve se posicionar expressamente contra uso massivo, abusivo, enganoso, invasivo, como spam, scraping, assédio, fraude, envio sem consentimento ou qualquer prática que viole leis, termos de serviço, privacidade ou direitos de terceiros.

### RN017 - Integridade dos Dados de Entrada

O sistema não deve alterar `clientes.csv` nem `texto.md` durante validação ou envio.

### RN018 - Auditoria

Todo resultado deve possuir rastreabilidade local.

Arquivos mínimos:

```text
./logs/enviados.csv
./logs/erros.csv
./logs/pulos.csv
./logs/avisos.csv
./logs/mensagens.json
```

### RN019 - Saída de Console

O console deve exibir status compacto e legível, com progresso, enviados, pulos, erros e avisos. Quando suportado pelo terminal, deve usar cores e atualizar a linha de progresso sem inundar a tela.

Todo pulo deve apresentar motivo claro.

Etapas potencialmente demoradas de anexos, especialmente envio de `.ogg`, retentativas, fallback de áudio de voz para áudio comum e espera por estabilização do WhatsApp Web, devem emitir progresso visual curto no terminal e na GUI para evitar percepção de travamento, sem repetir mensagens em excesso.

### RN020 - Pré-Validação Segura

O comando de checagem deve validar arquivos, estrutura de logs, template, anexos locais, sessão e navegador antes de qualquer envio:

```text
npm run check
```

Para validação automatizada e CI, deve existir modo de checagem com fixtures versionadas, sem depender de `clientes.csv` e `texto.md` reais:

```text
npm run check:test
node main.js --check --check-csv CAMINHO.csv --check-template CAMINHO.md
```

Os parâmetros `--check-csv` e `--check-template` devem aceitar paths relativos ou absolutos somente quando usados junto com `--check`.

Em caso de falha, o processamento deve ser interrompido antes do primeiro envio.

### RN021 - Navegador Compatível

O sistema deve usar navegador Chromium compatível, detectando automaticamente Chrome, Chromium ou Edge em Windows, macOS e Linux, ou aceitando configuração manual por `PUPPETEER_EXECUTABLE_PATH` e `CHROME_EXECUTABLE_PATH`.

Ao iniciar navegador controlado pelo projeto, devem ser aplicadas opções compatíveis para reduzir throttling de abas/janelas em segundo plano quando suportado pelo Chromium, sem depender disso como garantia absoluta de envio.

Quando o navegador já estiver aberto, só deve ser reutilizado se tiver sido iniciado com depuração remota e informado por `BROWSER_URL`, `BROWSER_WS_ENDPOINT` ou `CONNECT_EXISTING_BROWSER`.

### RN022 - Interface Gráfica Local

Deve existir uma camada de UX no navegador para coletar parâmetros antes fornecidos por CLI, preservando compatibilidade funcional com o fluxo atual.

A GUI deve ser servida por servidor HTTP leve local, sem transmitir dados para serviços terceiros.

A interface local deve ser iniciada no começo do fluxo para exibir status de autenticação e carregamento do WhatsApp. O envio só pode ser liberado após o WhatsApp ficar pronto.

Durante o processamento de envio, a GUI deve exibir uma barra de progresso fina, fixa no topo da janela, visível apenas enquanto houver execução ativa. A barra deve avançar conforme destinatários forem concluídos, pulados ou falharem, com transição suave, animação discreta e cores profissionais que contrastem com a página sem prejudicar a leitura dos demais componentes.

A GUI deve oferecer um botão de desligar que encerre o processo local, fechando o client controlado e a interface. O botão deve pedir confirmação antes de encerrar.

Ao iniciar uma execução, a GUI deve exibir aviso não bloqueante de que, se áudio ou anexos parecerem lentos, pode ser necessário manter a aba do WhatsApp Web visível. A CLI deve emitir aviso equivalente no terminal.

Ao executar pela GUI, se houver arquivo CSV selecionado manualmente ou múltiplas sessões disponíveis, deve ser exibida confirmação explícita com sessão, modelo, base de clientes e filtro antes de iniciar o envio, permitindo confirmar ou cancelar.

Quando possível, a GUI deve ser aberta como aba no mesmo navegador controlado pelo WhatsApp Web. Se o navegador controlado ainda não estiver disponível ou não permitir nova aba, a GUI pode ser aberta no navegador padrão, registrando esse fallback de forma clara.

Ao selecionar um arquivo `.md`, a GUI deve carregar seu conteúdo no editor de modelo, separar automaticamente abas visuais por linhas `^^^`, executar pré-análise assíncrona dos anexos locais referenciados, sem iniciar envio e sem bloquear a interface. Se algum anexo não for localizado, a tela deve exibir aviso curto em vermelho próximo ao seletor do arquivo e disponibilizar campo para informar a pasta local de referência dos anexos. Essa pasta deve ser validada como diretório local existente antes da execução.

Se a porta local configurada para a GUI estiver ocupada, o servidor deve tentar automaticamente portas próximas antes de falhar, registrando a porta efetivamente usada.

A GUI deve oferecer:

- Modelo por editor textual especializado, persistindo somente texto cru compatível com WhatsApp/Markdown, sem HTML nem formato rico.
- Modelo por arquivo `.md`.
- Toolbar textual para inserir/remover marcadores crus de negrito, itálico, tachado, monoespaçado, anexo e `$postagem$`, além de menu suspenso de emojis, preservando seleção, cursor, foco, rolagem e composição IME sempre que possível. Ao aplicar marcadores sobre seleção, espaços externos não devem ser envolvidos pelos delimitadores.
- A toolbar deve apresentar, no grupo de persistência, nova edição, salvar conjunto de guias no navegador, abrir conjunto salvo no navegador, selecionar modelo preexistente, baixar todas as abas em `.md` e abrir `.md`. O salvamento local deve ser nomeado, versionado, validar schema e preservar o conjunto completo de guias como unidade lógica. O nome reservado `.autosave` deve armazenar somente recuperação automática de edição sem nome definitivo e não deve ser oferecido como nome real.
- A quantidade máxima de salvamentos locais nomeados deve ser configurável por `LOCAL_TEMPLATE_SAVE_LIMIT`, com padrão `10`, sem contar `.autosave`. Ao atingir o limite, a GUI deve avisar o usuário e impedir novo nome sem apagar salvamentos existentes.
- O botão de anexo deve abrir seletor nativo limitado às capacidades centralizadas do backend, ler o arquivo assíncronamente, informar limite/tamanho e inserir referência embedded no cursor sem substituir a sintaxe manual por caminho. A definição Base64 deve ser acrescida ao rodapé global do modelo, preservando a ordem e o texto existente.
- Abas visuais para blocos separados por `^^^`; ao salvar ou enviar, as abas devem ser recombinadas com o separador normatizado, sem criar blocos vazios automaticamente. A criação de novo modelo deve ficar junto das abas, e a exclusão deve pertencer à própria aba, com confirmação explícita.
- Prévia visual baseada no mesmo parser/plano de envio do backend para texto, postagens, anexos, legendas e áudio, renderizando a marcação textual básica como resultado visual final, sem substituir as validações finais. A prévia deve refletir somente a aba ativa e manter rolagem proporcional sincronizada com o editor.
- Bloqueio quando texto editado na GUI e arquivo `.md` divergente forem usados simultaneamente; quando um `.md` for carregado sem edição, o arquivo pode continuar sendo a fonte do envio para preservar resolução relativa de anexos.
- Campo de filtro.
- Arquivo `.csv` opcional de clientes.
- Opções de reenviar ignorando histórico e limpar histórico.
- Validações locais leves antes do envio.
- Mensagens claras de erro e progresso.
- Tipografia baseada em Noto Sans, com fallbacks sans-serif comuns do sistema.
- Demonstração visual concisa da marcação textual crua e do resultado esperado.
- Menu suspenso equilibrado com exatamente 60 sugestões profissionais de emojis.
- Feedback visual discreto em hover para controles interativos.

Ícones de controles da GUI DEVEM ser resolvidos pelo registro multiprovedor de RN049, com suporte simultâneo a Font Awesome Free, Lucide e coleções Iconify autorizadas. A escolha DEVE priorizar correspondência semântica inequívoca, aparência flat/solid e monocromática quando compatível com o padrão visual, sem forçar equivalência inadequada nem descaracterizar coleção baseada em traço. Somente os SVGs efetivamente usados DEVEM ser incorporados ao código distribuído, sem CDN, API de ícones ou duplicação evitável em múltiplos formatos. Emojis inseridos no conteúdo da mensagem NÃO DEVEM ser substituídos por ícones.

O painel `Modelo de mensagem` da GUI deve oferecer controle identificado por ícone e hint `Baixar versão offline`, que entregue `WhatSend-Modelo-Offline.html` correspondente à versão instalada, produzido e validado pelo pipeline canônico. A transferência deve preservar o nome determinístico, informar preparação, conclusão e falha e nunca entregar silenciosamente artefato ausente, inválido ou de versão divergente. Essa ação pertence somente à GUI executora e constitui a única exceção de controle à projeção literal do painel no próprio bundle offline.

Todos os controles interativos da GUI devem possuir hint visual centralizado por configuração ou atributo equivalente, sem depender de serviços externos. A documentação resumida de marcações deve ser exibida em painel retrátil HTML sem JavaScript, recolhido por padrão, com link discreto por ícone para o Markdown oficial no GitHub e links de ajuda em vídeo quando definidos.

Configurações operacionais antes controladas por ENV podem ser ajustadas pela GUI nos escopos execução atual, global e sessão. Configurações por sessão devem ser persistidas em JSON local e carregadas automaticamente na próxima execução da sessão correspondente.

O controle Atualizar da GUI DEVE usar o ícone Iconify qualificado `iconify:game-icons:upgrade`; o controle `Baixar versão offline` DEVE usar `iconify:streamline-sharp:download-box-1-solid`. Eles DEVEM permanecer funcional e visualmente distintos, sem reutilizar nuvem genérica. Atualizar abre painel visual com as quatro ações centralizadas no backend: atualizar somente `whatsapp-web.js`, todas as dependências, software oficial e reversão da última atualização. A GUI deve verificar de forma assíncrona, cancelável, com cache, timeout, retentativa limitada e estado independente, se há versão remota nova do aplicativo e de `whatsapp-web.js`; falha de consulta deve manter estado inconclusivo ou falha temporária, sem anunciar atualização. Quando houver atualização disponível, o ícone deve mudar de cor e pulsar somente por CSS, respeitando `prefers-reduced-motion`. A seleção e confirmação explícita são obrigatórias; as quatro ações são mutuamente exclusivas e DEVEM usar semântica acessível de rádio com aparência profissional de switch/seletor de aplicativo, claramente distinta do botão de ação `Confirmar atualização`; aparência NÃO PODE converter a escolha em seleção múltipla. O painel deve advertir incompatibilidades, indicar separadamente o estado de cada componente, exibir progresso/resultado no registro e não conter lógica de atualização. Hints dos controles do cabeçalho devem abrir abaixo deles para não serem cortados pela janela.

Arquivos informados na GUI devem ser materializados temporariamente em área controlada pelo projeto ou sistema operacional, sem alterar `clientes.csv`, `texto.md` ou os modelos originais.

### RN023 - Scripts de Inicialização

Devem existir scripts de inicialização compatíveis com os sistemas operacionais suportados.

Os scripts devem detectar ambiente, verificar dependências, instalar apenas o que estiver ausente e iniciar o fluxo da aplicação.

Quando Node.js estiver ausente, o script deve orientar ou tentar instalação automática por gerenciador de pacotes disponível na plataforma. Quando a instalação automática não for compatível com o ambiente, deve falhar com instrução clara.

Os scripts devem verificar navegador compatível. Se Chrome, Edge ou Chromium não forem encontrados, devem tentar instalar automaticamente um Chrome compatível via instalador do Puppeteer.

Durante a instalação automática de dependências pelos scripts de inicialização, o download implícito de navegador pelo postinstall do Puppeteer deve ser desativado. A instalação ou validação de navegador deve ocorrer somente na etapa explícita de verificação de navegador, para evitar falhas por cache parcial, ambiente sem permissão ou divergência entre dependências e navegador local.

Os scripts de inicialização voltados à GUI devem iniciar o processo local em segundo plano após a preparação do ambiente, manter o terminal apenas por breve período informativo e então liberá-lo/fechá-lo, preservando `npm run start:gui` como opção em primeiro plano para depuração.

### RN024 - Sessões de WhatsApp

O sistema deve suportar múltiplas sessões independentes de WhatsApp por `LocalAuth`, com nome amigável, persistência local e seleção por `--session` ou pela GUI.

Quando houver apenas uma sessão, ela deve ser selecionada automaticamente. Quando houver múltiplas sessões e nenhuma for informada na CLI, deve ser exibido menu obrigatório. Identificação por nome deve ser insensível a maiúsculas/minúsculas; identificação por telefone pode usar os últimos dígitos desde que o resultado seja único.

Sessões nomeadas devem usar logs separados em `./logs/sessions/NOME_DA_SESSAO/`. A sessão padrão preserva os logs legados em `./logs/`.

A GUI deve permitir criar, renomear, alternar e remover sessões. A remoção pela GUI deve permitir escolher qualquer sessão existente, inclusive sessão não ativa ou ainda não autenticada, sem exigir alternância prévia para ela. Como a sessão do WhatsApp é definida na inicialização do `LocalAuth`, alternar, criar ou remover a sessão ativa pela GUI pode reiniciar automaticamente o processo, fechar o navegador controlado atual e reabrir a interface na sessão escolhida. Se a última sessão persistida for removida, a próxima abertura deve retornar ao fluxo inicial de autenticação.

### RN025 - Múltiplos Modelos

Um template pode conter múltiplos modelos separados por linha contendo ao menos três caracteres `^`, com espaços ou tabulações opcionais.

O separador só é válido se existir texto antes e depois dele e se todos os blocos, após `trim()`, possuírem tamanho mínimo configurável por `TEMPLATE_VARIANT_MIN_LENGTH`, padrão `96`.

Quando houver múltiplos modelos válidos, a distribuição deve ser circular entre destinatários. Quando houver apenas um modelo válido, o comportamento permanece igual ao fluxo anterior.

### RN026 - Cálculos e Formatação

Resultados numéricos em `${...}` devem usar padrão brasileiro: inteiros sem casas decimais; decimais arredondados para 2 casas e separador `,`.

O mecanismo de expressões deve oferecer as funções `$.round()`, `$.ceil()`, `$.floor()`, `$.int()`, `$.moeda()`, `$.digito1()`, `$.digito2()`, `$.numero()` e `$.decimal()`, aceitando colunas, números formatados, expressões e funções aninhadas.

### RN027 - Atualização

Devem existir scripts de atualização no root para Windows e macOS/Linux.

O backend deve centralizar quatro ações: atualizar somente `whatsapp-web.js`; atualizar todas as dependências, incluindo esse motor; atualizar o software pela origem oficial e sincronizar as dependências declaradas pelo novo `package.json`; e reverter a última atualização válida. GUI e CLI devem apenas selecionar a ação, exigir confirmação explícita e exibir estado, progresso, resultado, erro relevante e recuperação sucinta.

Cada operação deve publicar uma máquina de estados monotônica e observável, no mínimo `preparando`, `salvando snapshot`, `baixando` ou `resolvendo dependências`, `aplicando`, `validando`, `revertendo` quando aplicável e um terminal inequívoco `concluída`, `sem alteração`, `revertida` ou `falhou`. O estado terminal, a ação, o resultado, o erro e a orientação de recuperação devem ser persistidos atomicamente antes de qualquer substituição do processo, continuar consultáveis pela CLI e pela GUI e ser reapresentados pela nova instância até reconhecimento do usuário ou início de outra operação. Perda transitória da conexão da GUI não pode converter execução em sucesso, falha ou estado desconhecido.

Antes de cada atualização ou reversão, o backend deve registrar em `.runtime/updates` o estado do software, `package.json`, lockfile, versões instaladas das dependências afetadas, origem, data, ação e dados suficientes para restaurar a última operação válida. O snapshot não deve conter dados de clientes, sessões, logs, configurações, `.env` ou outros dados operacionais do usuário.

Atualização de software e de dependências deve avisar antes da confirmação que versões novas podem introduzir incompatibilidades e quebrar um ambiente estável. A operação deve validar a instalação e a compatibilidade aplicável, remover dependências órfãs por poda segura e, em falha, interromper sem estado parcial e restaurar automaticamente o snapshot quando possível. Reversão deve restaurar software, dependências e metadados do último snapshot, preservando dados operacionais.

Após uma atualização ou reversão concluída que altere código ou dependências carregados, o atualizador deve reiniciar automaticamente o servidor local e reabrir ou reconectar a GUI na mesma URL efetiva, porta e contexto operacional, sem exigir ação manual. Antes da desconexão, a GUI deve indicar `reiniciando`; durante a troca deve aplicar retentativas limitadas e, após a retomada, exibir o terminal persistido da operação. O protocolo deve usar marcador de retomada de uso único, impedir reinício concorrente, duplicado ou em ciclo por múltiplas abas e preservar sessões, dados e configuração local. Verificação, cancelamento ou resultado `sem alteração` não deve reiniciar processos, salvo necessidade técnica comprovada e registrada.

Falha da atualização deve permanecer apresentada como falha mesmo quando a restauração automática tiver sucesso. Falha ao reiniciar deve ser resultado secundário distinto, não pode apagar nem reclassificar o resultado da atualização ou reversão e deve informar recuperação acionável. Quando uma falha exigir restauração de código ou dependências já carregados, o servidor pode reiniciar apenas depois de o rollback atingir estado terminal persistido. Nenhuma instância deve anunciar conclusão antes de todas as validações mandatórias terminarem.

A atualização não deve depender da existência de `git` nem de diretório local `./.git`.

O atualizador deve consultar `https://github.com/JeanCarloEM/WhatSend` por APIs oficiais do GitHub, priorizando a Release marcada como Latest. Quando a Release possuir asset distribuível `WhatSend-v<versão>[-<canal>].zip`, esse ZIP deve ser preferido ao tarball de código-fonte da release. Somente quando não houver Release válida publicada deve usar a branch `main`.

Antes de baixar qualquer pacote, o atualizador deve identificar a versão remota por metadados leves da API do GitHub. Para Release, o identificador deve usar o `tag_name` e o commit SHA associado ao tag ou ao `target_commitish` quando este já for um SHA completo. Para `main`, o identificador deve usar o commit SHA retornado pela API da branch.

O atualizador deve manter no root o arquivo `whatsend-version.json`, contendo o repositório, tipo de origem, versão, canal, tag quando aplicável, commit SHA, nome do artefato, `versionId` determinístico e datas relevantes. Esse arquivo é operacional, pequeno, deve ser gerado pelo build distribuível e serve para comparar a instalação local com a versão remota sem depender de Git nem baixar o pacote completo.

Quando `whatsend-version.json` indicar a mesma versão remota disponível, a atualização deve ser encerrada sem download do pacote, sem reinstalação de dependências e sem alteração de arquivos locais.

Quando o arquivo de versão não existir, estiver inválido ou não corresponder à versão remota, o pacote remoto deve ser baixado e aplicado. O arquivo `whatsend-version.json` só deve ser gravado após a cópia dos arquivos, a sincronização das dependências npm e a validação do navegador terminarem com sucesso.

Arquivos operacionais locais devem ser preservados durante a atualização, incluindo `clientes.csv`, `texto.md`, `.env`, logs, sessões do WhatsApp, runtime local e `node_modules`.

Depois de atualizar os arquivos do projeto, o atualizador deve sincronizar dependências npm e revalidar navegador compatível.

### RN028 - Integração Contínua

Quando o projeto estiver hospedado no GitHub, deve existir workflow de CI para push e pull request.

Todos os jobs do workflow devem possuir `timeout-minutes` explícito de no máximo 5 minutos.

O workflow de CI deve executar testes, checagem RCF com fixtures, geração de `./dist`, validação do `./dist` e publicação do diretório `dist/` como artefato da execução.

Deve existir workflow de Release com disparo manual por `workflow_dispatch`, usando campos explícitos para versão, canal e confirmação de publicação oficial. Esse fluxo deve permitir execução integral pela interface web do GitHub, sem prompts interativos.

O workflow de Release deve usar a mesma lógica de versionamento do `build:dist`, criar automaticamente a tag `v<versão>[-<canal>]`, criar ou atualizar a Release correspondente, anexar o ZIP distribuível e `whatsend-version.json`, e marcar a Release como Latest por mecanismo oficial do GitHub. Como Releases marcadas como prerelease não são elegíveis a Latest no fluxo esperado, canais como `beta` e `alpha` devem ser representados no nome/tag/canal, sem marcar a publicação GitHub como prerelease. A execução oficial deve partir de `dev`, publicar a tag no commit validado e, depois da publicação, registrar `release: v<versão>` e convergir `dev` para `main` por fast-forward; qualquer divergência bloqueia a conclusão.

### RN029 - Reutilização de Instância Local

Ao iniciar a GUI, o sistema deve registrar em diretório temporário do sistema operacional a instância ativa por contexto de execução, incluindo PID, porta, URL local, sessão/perfil do WhatsApp, data de início e assinatura dos scripts de execução.

Uma nova abertura da GUI para o mesmo contexto deve verificar se a instância registrada ainda está ativa, responde como a mesma aplicação e usa a mesma sessão. Se os scripts não tiverem mudado desde o registro, a nova execução deve reutilizar a instância existente e apenas reabrir a URL da interface local, preservando a sessão autenticada do WhatsApp.

Se os scripts tiverem mudado, a nova execução deve encerrar a instância registrada e seus processos filhos quando possível, removendo o registro temporário antes de iniciar uma nova instância.

### RN030 - Release Distribuível

O comando `npm run build:dist` deve gerar `./dist` de forma limpa, reproduzível e funcional, removendo conteúdo anterior antes de recriar a release.

Além da pasta `./dist`, o comando deve gerar automaticamente o pacote ZIP distribuível dentro de `./dist`, pronto para anexação em Release. O nome deve seguir o padrão:

```text
WhatSend-v<versão>[-<canal>].zip
```

O canal `stable` não deve gerar sufixo. Canais como `beta`, `alpha` e `rc` devem gerar sufixo, por exemplo `WhatSend-v1.2.0-beta.zip`.

O build deve aceitar `--version`, `--channel`, `--commit-sha`, `--tag`, `--official-release` e `--no-official-release`. Em execução local interativa, informações ausentes devem ser solicitadas ao operador. Em execução não interativa, os valores devem ser inferidos de forma determinística quando possível, usando `package.json`, `stable`, variáveis do GitHub Actions e Git local apenas como conveniência, sem criar dependência operacional para o atualizador.

Quando `--official-release` for usado, o build deve exigir commit SHA completo e validar que tag, nome do ZIP, canal e `versionId` estejam consistentes.

A release deve incluir somente arquivos necessários à execução e documentação: `LICENSE`, `README*`, `RCF.md`, `docs/`, `main.js`, `src/`, `scripts/`, inicializadores, `package.json`, `package-lock.json`, arquivos `.env.*` não sensíveis e arquivos de configuração/formatação explicitamente permitidos.

O arquivo `whatsend-version.json` deve ser gerado automaticamente em `./dist` antes do empacotamento e deve integrar tanto o ZIP distribuível quanto os assets independentes da Release quando publicados pelo workflow.

Arquivos JavaScript distribuídos devem ser minificados por biblioteca Open Source mantida. Documentação, arquivos de configuração, scripts shell/batch e formatos em que a minificação possa alterar semântica não devem ser minificados.

Quando um arquivo minificado possuir cabeçalho inicial de licença, copyright, autoria, atribuição, disclaimer ou aviso legal equivalente, esse cabeçalho deve ser preservado integralmente no início do arquivo distribuído, sem minificação, reformatação ou alteração. A minificação deve ser aplicada somente ao restante do conteúdo.

A release não deve incluir `node_modules/`, `.git/`, diretórios iniciados por `.`, `AGENTS.md`, testes, caches, logs com conteúdo, sessões, `.wwebjs_sessions.json`, `.env` real ou qualquer arquivo operacional/sensível.

O `package.json` distribuído em `dist` deve conter apenas dependências de runtime e scripts necessários à execução/atualização. Dependências exclusivas de desenvolvimento, testes, documentação, build, minificação, geração de assets ou validação não devem integrar o manifesto de runtime da distribuição nem ser instaladas por validações executadas dentro de `dist`.

Recursos usados apenas para composição visual ou build, como ícones, CSS ou assets de bibliotecas, devem ser incorporados na distribuição somente nos subconjuntos efetivamente utilizados quando isso for tecnicamente viável. A biblioteca completa não deve permanecer como dependência de runtime quando sua função tiver sido absorvida pelo artefato distribuído.

Os arquivos operacionais `clientes.csv` e `texto.md` localizados na raiz do projeto nunca devem ser copiados para a raiz de `./dist`. Essa regra deve proteger os arquivos reais do usuário sem bloquear automaticamente arquivos homônimos em outros diretórios que sejam necessários à documentação, testes internos de empacotamento ou funcionamento distribuível.

Os diretórios operacionais `logs/`, `modelos/` e `listas/` devem existir na release apenas como diretórios vazios de topo, sem copiar arquivos nem subdiretórios do ambiente local.

O comando `npm run build:dist` deve validar ao final da geração que cabeçalhos legais foram preservados e que `clientes.csv` e `texto.md` da raiz não foram incluídos. O comando `npm run validate:dist` deve validar a estrutura final, ausência de arquivos sensíveis, preservação de cabeçalhos legais e funcionamento da aplicação usando uma cópia temporária do conteúdo de `./dist`, com dependências instaladas a partir do próprio `package-lock.json` distribuído.

### RN031 - Release Notes Protegidas

O arquivo `./dist/release-notes.md` é um artefato protegido de criação formal de release.

O arquivo não deve ser alterado automaticamente por build, validação, atualização ou qualquer outro fluxo operacional. Quando já existir, `npm run build:dist` deve preservar seu conteúdo. Alterações somente são permitidas por solicitação explícita do usuário ou pelo comando específico:

```text
npm run release-notes:generate -- HASH_INICIAL HASH_FINAL
```

O arquivo deve ser Markdown e conter obrigatoriamente, nesta ordem, as seções:

```text
# Rastreio
# Melhorias
# Correções
```

A seção `# Rastreio` deve informar o intervalo no formato `commit A → commit B`, com hash inicial e final. As seções de conteúdo devem ser curtas, objetivas, orientadas ao usuário final e devem ignorar alterações triviais que não agreguem valor operacional.

Toda alteração em `./dist/release-notes.md` deve ocorrer em commit exclusivo, sem qualquer outro arquivo modificado no mesmo commit. Esse commit representa apenas a consolidação da release; todas as melhorias, correções e ajustes descritos já devem existir em commits anteriores.

Commits que misturem `./dist/release-notes.md` com código, documentação, configuração ou qualquer outro arquivo são proibidos. A regra deve ser validada em camadas, incluindo hook Git local quando possível, workflow do GitHub e scripts de validação. A mensagem de bloqueio deve explicar o motivo e indicar comandos compatíveis com Windows, Linux e macOS para remover apenas `./dist/release-notes.md` do commit, preservando as demais alterações.

### RN032 - Sequenciamento e Retentativas de Envio

Quando um template renderizado resultar em múltiplas mensagens, anexos, áudios ou legendas para o mesmo destinatário, o sistema deve preservar a ordem original do plano de envio e transmitir somente um item por vez.

A próxima mensagem do mesmo destinatário só pode ser iniciada após a biblioteca/API confirmar o envio bem-sucedido da mensagem anterior. Não é exigida confirmação de entrega ou leitura pelo destinatário.

Chamadas simultâneas para o mesmo destinatário devem ser serializadas por fila local, evitando interleaving, inversão de ordem ou concorrência entre mensagens do mesmo chat.

Falhas transitórias do WhatsApp Web, navegador, contexto de execução, conexão ou transporte devem ser retentadas com quantidade de tentativas e atraso configuráveis, usando backoff entre tentativas. O sistema deve interromper a sequência daquele destinatário quando a mensagem atual falhar definitivamente após esgotar as tentativas, sem transmitir mensagens subsequentes desse mesmo plano.

O lote só deve avançar para o próximo telefone após o destinatário atual ter todos os itens do plano confirmados como enviados ou após falha definitiva registrada para o item corrente. Um telefone só pode ser registrado em `enviados.csv` depois da confirmação de envio bem-sucedido de todos os textos, anexos, áudios e legendas previstos para aquele destinatário.

As retentativas de texto devem ser configuráveis por:

```text
MESSAGE_SEND_RETRIES
MESSAGE_SEND_RETRY_DELAY_MS
MESSAGE_SEND_RETRY_MAX_DELAY_MS
```

As retentativas de mídia devem permanecer configuráveis por:

```text
MEDIA_SEND_RETRIES
MEDIA_SEND_RETRY_DELAY_MS
MEDIA_SEND_RETRY_MAX_DELAY_MS
```

### RN033 - Divisão Explícita de Postagens

O autor do template pode forçar a divisão de uma mensagem em múltiplas postagens consecutivas usando o marcador literal:

```text
$postagem$
```

Esse marcador foi escolhido por ser legível, compatível com o padrão literal já usado por `$diatarde$` e por não conflitar com a gramática de variáveis e expressões `${...}`.

Cada ocorrência de `$postagem$` deve atuar como ponto de divisão do conteúdo renderizado. Segmentos vazios ou compostos somente por espaços e quebras de linha não devem gerar envio.

Quando o marcador estiver sozinho em uma linha, espaços ou tabulações ao redor do marcador e a quebra da própria linha separadora não devem ser enviados ao WhatsApp. Quando usado no meio de uma linha, a divisão deve ocorrer exatamente no ponto do marcador.

Cada segmento resultante deve ser enviado como postagem independente, preservando a ordem original e usando o fluxo sequencial normatizado em RN032, incluindo confirmação de envio, retry, backoff, fila por destinatário e bloqueio do avanço para o próximo telefone até conclusão ou falha definitiva.

A divisão por `$postagem$` é subordinada ao mecanismo de múltiplos modelos `^^^`: primeiro o sistema deve processar e selecionar os modelos válidos separados por `^^^`; somente depois a variante escolhida deve ser renderizada e dividida por `$postagem$`. O marcador `$postagem$` não pode alterar, invalidar ou interferir no comportamento de `^^^`.

Antes da prévia e do envio, cada postagem resultante deve ser normalizada individualmente, removendo espaços e quebras excedentes no início e no fim, caracteres não imprimíveis excedentes e recuos acidentais. Recuos intencionais de pelo menos quatro espaços na própria linha de conteúdo devem ser preservados quando não forem precedidos por linha em branco. Essa normalização não deve recombinar postagens, anexos, áudio ou variantes `^^^`.

### RN034 - Governança por Frentes de Trabalho

Toda implementação relevante deve ser organizada em Frente de Trabalho registrada em `continue.ia`, com identificador permanente, nome, objetivo, prioridade, status, etapas planejadas e microetapas quando aplicável.

`continue.ia` é a memória operacional oficial do projeto. Deve registrar retomada, decisões, comandos relevantes, verificações, falhas objetivas, hipóteses descartadas, pendências e mudanças de planejamento sempre que essas informações forem úteis para evitar retrabalho.

O comando `npm run agents:update` deve verificar e sincronizar a governança operacional remota definida em `.ia.rules/core/update/upstream.json`.

O comando `npm run agent:handoff` deve gerar, a partir do `continue.ia` canônico do projeto, um resumo Markdown de FTs técnicas em andamento no root, sem reproduzir o detalhamento integral da memória operacional. Esse resumo deve ser linkado no README, não deve ser editado manualmente e não deve integrar a distribuição de runtime.

Quando arquitetura, regras, UX, build, distribuição, documentação ou fluxos mudarem, a implementação deve sincronizar código, GUI/CLI quando aplicável, `AGENTS.md`, `RCF.md`, `README.md`, documentação pertinente e `continue.ia`.

### RN035 - Configurações Centralizadas

Restrições de configuração operacional devem ser centralizadas em arquivo JSON dentro de `src`, contendo defaults, mínimos, máximos e relações obrigatórias quando existirem.

A resolução de configuração deve seguir a hierarquia:

```text
Execução
Sessão
Global
Default
```

O usuário pode informar apenas os parâmetros que deseja alterar. Os demais devem ser herdados automaticamente. Após a resolução, o conjunto aplicável deve ser validado contra as restrições centralizadas antes de ser persistido ou aplicado.

### RN036 - Título Dinâmico da Execução

A GUI deve manter o título do documento derivado da mesma estrutura de estado utilizada pelo indicador de progresso e pelo status visível. A composição deve ficar centralizada e não pode manter contador, percentual ou ciclo de vida paralelo.

Durante preparação, validação ou envio ativo, o título deve começar por um percentual inteiro entre `0%` e `100%`, sem conteúdo anterior, seguido imediatamente de um estado curto e do nome-base `WhatSend`. O percentual material do envio é `concluídos / total elegível`; antes de o total ser conhecido, a preparação válida usa `0%`. O título deve representar determinística e exclusivamente a campanha, que é a operação principal e não admite concorrência equivalente.

Os estados mínimos são `Preparando`, `Validando`, `Enviando`, `Concluído`, `Interrompido` e `Erro`. Conclusão válida deve permanecer como `100% Concluído — WhatSend` até alteração material das entradas. Falha ou interrupção deve preservar o último percentual conhecido e nunca se apresentar como conclusão. Sem campanha ou conclusão válida, o título deve retornar a `WhatSend`.

Alteração explícita em modelo, anexos embedded, arquivo ou conteúdo CSV, filtro, sessão, configurações de envio, reenvio ou reset deve invalidar imediatamente a conclusão e representar nova preparação. Foco, seleção, rolagem, expansão, navegação e outros eventos puramente visuais não invalidam o estado. Restauração só pode apresentar progresso persistido depois de validar que ele corresponde à execução real.

### RN037 - Aviso de Desenvolvimento

O painel superior `Licença` da GUI principal e de toda saída que reutilize esse painel deve conservar integralmente o conteúdo legal existente e acrescentar, como texto real, visível sem interação e associado semanticamente ao painel, o aviso: `Em desenvolvimento: este software pode conter erros.`

O aviso deve ser legível, responsivo, acessível a leitores de tela e não pode depender apenas de cor, ícone, tooltip, modal ou rodapé. A interface atual é pt-BR; qualquer idioma adicional deve fornecer mensagem semanticamente equivalente sem suavizar os dois fatos obrigatórios: produto em desenvolvimento e possibilidade de erros.

### RN038 - Identidade das Colunas de Telefone

O CSV deve conter `nome` e exatamente um dos aliases `telefone` ou `fone`. Os três nomes são reconhecidos sem distinção de caixa. `telefone` e `fone` representam uma única função lógica e recebem as mesmas regras de leitura, validação, normalização, filtragem, mensagem, processamento, log e interoperabilidade.

Cabeçalhos devem ser normalizados antes da validação. Cabeçalho vazio, repetição do mesmo nome normalizado, ou coexistência de `telefone` e `fone` constitui erro impeditivo e acionável. Não é permitido escolher uma coluna arbitrariamente, mesclar valores ou consolidar aliases automaticamente. O cabeçalho original deve ser preservado em importações e exportações que não exijam normalização.

Internamente, consumidores devem resolver a função telefônica por utilitário comum e não por acesso direto exclusivo a `telefone`. Entradas legadas que possuam somente `telefone` permanecem válidas; entradas que possuam somente `fone` passam a ser equivalentes. Colunas adicionais continuam preservadas e disponíveis como variáveis. Mensagens e documentação devem indicar `telefone ou fone`, sem tornar `nome` opcional.

### RN039 - Bundle Offline do Editor

O build deve produzir, além de todas as saídas existentes, `dist/WhatSend-Modelo-Offline.html`: um único arquivo HTML autocontido, abrível diretamente por `file://`, sem servidor, Node.js, internet, CDN, telemetria, API, WebSocket, worker, fonte, script, stylesheet, imagem, manifesto ou outro asset externo obrigatório em runtime.

O bundle é exclusivamente um editor prévio local. Não autentica WhatsApp, não inicia campanha e não substitui nem reduz a GUI executora. Estado, badge, texto ou animação dependente da conexão Node.js/WhatsApp, como `autenticando`, `carregando`, `pronto`, `reiniciando` ou equivalente, NÃO DEVE ser exibido nem simulado; estado local do próprio editor DEVE usar descrição específica de edição, validação ou persistência. Deve conter somente o rodapé legal canônico, o painel `Licença` com o aviso da RN037, o painel `Modelo de mensagem` com os recursos aplicáveis ao contexto offline e um painel adicional de CSV em estilo de planilha.

O painel `Modelo de mensagem` da GUI Node.js é o componente visual e comportamental canônico. O build offline deve projetar da mesma fonte sua estrutura DOM, hierarquia de componentes, classes, regras e tokens CSS, tipografia, dimensões, espaçamentos, abas, ordem e ícones da toolbar, hints, editor com realce, prévia, identidade e estado de salvamento, documentação retrátil, estados de interação, acessibilidade, responsividade e comportamentos executáveis no navegador. Não é permitida uma segunda implementação manual de markup, estilo ou lógica equivalente, nem adaptação estética independente. A única omissão permitida é o controle `Baixar versão offline`, exclusivo da GUI executora para evitar autorreferência; nenhuma outra divergência pode reutilizar essa exceção. O painel CSV adicional deve permanecer segregado e não pode deformar, substituir ou reordenar o painel canônico.

O espelhamento deve ser literalmente idêntico em navegadores e viewports equivalentes até o limite técnico verificável do ambiente `file://`. Capacidade dependente de Node.js ou do backend que seja impossível no modo offline deve usar adaptador que preserve o mesmo controle, aparência, posição, estado e contrato client-side; quando a ação não puder ser realizada localmente, o controle deve permanecer reconhecível, ser desabilitado de modo acessível e apresentar a razão objetiva, sem ser trocado por componente visual divergente. Recurso aplicável ao navegador, inclusive edição, abas, marcação, prévia, persistência, importação, download e pacote interoperável, deve manter comportamento equivalente.

A grade CSV deve usar biblioteca open source mantida, incorporada pelo build com sua licença. Deve importar e editar localmente CSV, preservar colunas e texto, validar a RN038, e exportar UTF-8 com BOM, separador `;`, delimitador `"`, escape por duplicação e extensão `.csv`. Valores permanecem dados textuais e nunca são inseridos como HTML. Conteúdo iniciado por `=`, `+`, `-` ou `@` deve ser neutralizado na exportação para planilhas por prefixo textual seguro, sem execução ou perda silenciosa. Sua toolbar DEVE reutilizar integralmente o componente, tokens, dimensões, estados, interação, hints e nomes acessíveis das toolbars canônicas: `Abrir` DEVE ser controle iconizado que aciona `input[type=file]` visualmente oculto, e salvar, adicionar/excluir linha, adicionar/renomear/remover coluna e limpar dados locais DEVEM ser controles iconizados, não botões textuais comuns.

Persistência, quando usada, deve permanecer no dispositivo e ter namespace, versão, limite e ação de limpeza. O build deve incorporar código, estilos, recursos e licenças necessários, gerar hash do artefato, incluí-lo no pacote distribuível e falhar se detectar dependência automática externa, ausência de componente canônico ou divergência de paridade. A validação deve comparar a projeção canônica por estrutura DOM, classes, CSS resolvido, controles, estados e capturas visuais determinísticas nos viewports declarados; diferença deve falhar o build, salvo a ausência exata e rastreável do controle `Baixar versão offline` ou exceção técnica distinta explicitamente autorizada em RCF posterior, justificada e testada no adaptador offline. Links referenciais acionados voluntariamente pelo usuário não são dependências de runtime.

### RN040 - Pacote Interoperável de Modelo e Dados

Os arquivos separados `.md` e `.csv` continuam canônicos, independentes e plenamente suportados. Adicionalmente, GUI principal e bundle offline devem ler, validar, gerar, baixar, desacoplar e reencapsular o contêiner `WhatSend Package`, com extensão determinística `.whatsend.json`, MIME `application/json` e codificação UTF-8.

O contrato de versão `1` é:

```json
{
  "schema": "https://jeancarloem.com/whatsend/package/v1",
  "version": 1,
  "createdAt": "data ISO 8601",
  "template": { "name": "arquivo.md", "content": "conteúdo integral" },
  "csv": { "name": "arquivo.csv", "content": "conteúdo integral" },
  "integrity": { "algorithm": "SHA-256", "template": "hex", "csv": "hex" }
}
```

Campos adicionais são preservados ao reencapsular quando seguros e não conflitantes. `version`, `template.content`, `csv.content` e hashes válidos são obrigatórios na exportação final. O bundle pode manter edição parcial, mas não pode rotulá-la como pacote completo. Tamanho, profundidade, tipos, versão, nomes e integridade devem ser validados antes de alterar o estado da aplicação.

O hash é calculado sobre os bytes UTF-8 exatos de cada conteúdo normalizado somente quanto à remoção do BOM externo; quebras e sintaxe proprietária permanecem intactas. Importação com estado preenchido exige confirmação explícita e aplicação atômica. Falha, versão desconhecida ou integridade divergente não pode produzir estado parcial. O mesmo pacote deve gerar `.md` e `.csv` semanticamente idênticos e o ciclo desacoplar/reencapsular deve ser determinístico, ressalvados `createdAt` e hashes derivados.

Na GUI principal, o CSV do pacote alimenta a mesma validação e execução do CSV separado; o modelo permanece editável. No bundle, ambos são editáveis e nunca são processados como campanha. Parser, serializer, schema, normalização e testes devem derivar de implementação comum apta a ser incorporada ao HTML sem dependência de runtime.

### RN041 - Análise Editorial do Modelo

GUI principal e bundle offline devem analisar continuamente o mesmo conteúdo por mecanismo comum, no carregamento, edição, importação, salvamento, exportação e, na GUI executora, antes do processamento.

As expressões literais `bom dia`, `boa tarde` e `boa noite`, sem distinção de caixa e fora de placeholders, código, URLs, referências de mídia e demais sintaxes proprietárias protegidas, são erro editorial. A orientação obrigatória é `Saudação dependente do horário detectada. Substitua por $diatarde$.` A GUI deve exigir confirmação explícita antes do envio enquanto o erro persistir; salvamento e exportação continuam disponíveis com o alerta visível.

Possível nome próprio literal é aviso não impeditivo e deve recomendar `${nome}` sem afirmar erro absoluto. A heurística deve privilegiar palavras capitalizadas em contexto de vocativo ou saudação e excluir início ordinário de frase, marcadores protegidos, termos técnicos conhecidos e ocorrência que o usuário tenha marcado como intencional para o conteúdo atual.

Cada ocorrência deve informar tipo, severidade, trecho, linha, coluna e orientação. A área de edição deve receber destaque global e uma lista textual navegável; erro e aviso devem ser distinguíveis por texto e sem dependência exclusiva de cor. Atualizações devem ocorrer sem atraso perceptível e produzir resultados semanticamente iguais nas duas aplicações.

### RN042 - Fontes, Marca e Transformações de Build

`src/` contém fontes canônicas, `scripts/` automações e `dist/` somente artefatos gerados ou distribuíveis. Movimentação ou renomeação só ocorre diante de divergência material comprovada e com mapa de origem, destino, referências, rollback e validação; preferência estética não constitui motivo.

`src/brand/` é a origem canônica da identidade visual. O conjunto pequeno e preconstruído de `src/brand/html-favicon/` pode permanecer quando for determinístico, completo e mais simples que adicionar gerador. A adoção de RealFaviconGenerator é opcional, exclusivamente de build, e exige benefício material comprovado, configuração central, licença compatível, cache por hash das entradas e reconstrução limpa. Nenhum gerador remoto ou de runtime é permitido.

Adaptações de favicon, manifesto e referências para local, web, subpath ou bundle devem ocorrer somente no build, sem editar as fontes. Somente campos dependentes do destino podem variar. O build deve validar referências, MIME, paths, base path, hash, idempotência e ausência de fontes canônicas mantidas exclusivamente em `dist/`. Bundle autocontido só incorpora asset de marca com função real.

### RN043 - Instalação Portátil e Dependências

`npm install`, `npm ci` e `npm update` devem funcionar em Windows, Linux e macOS sem depender do download pós-instalação do Chromium feito pelo pacote `puppeteer`. O motor `whatsapp-web.js` fornece a dependência Puppeteer compatível e a aplicação centraliza descoberta/instalação explícita de navegador conforme RN021; portanto, o projeto deve manter configuração oficial versionada com `skipDownload: true`, equivalente a `PUPPETEER_SKIP_DOWNLOAD=true`, preservando o comando explícito `npm run browser:ensure` para provisionamento controlado. Dependência direta redundante de `puppeteer-core` não deve coexistir sem consumidor comprovado.

O lockfile deve ser reproduzível e coerente com o manifesto. Dependência transitiva vulnerável ou obsoleta não pode ser ocultada: deve ser eliminada por atualização compatível, override validado ou substituição controlada. `--force`, `--legacy-peer-deps` e supressão de auditoria não são correções. O fluxo deve testar instalação limpa com cache isolado e confirmar que a execução continua localizando navegador compatível, que `whatsapp-web.js` inicia com `executablePath`/conexão já resolvidos e que dependências de build não entram no manifesto de runtime de `dist`.

### RN044 - Estado Transacional Autoritativo de Campanha

O servidor local DEVE ser a única autoridade sobre cada campanha. Para cada sessão, DEVE manter registro versionado e atomicamente persistido com, no mínimo, identificador imutável da operação, sessão, estado, proprietário/processo, início, última atualização, progresso, pedido de interrupção, término, resultado e erro. A GUI, a CLI e qualquer cliente local DEVEM apenas projetar esse estado; memória de componente, aba aberta, foco, conexão anterior ou estado visual NÃO DEVEM constituir autoridade paralela.

Os estados canônicos DEVEM ser `ocioso`, `preparando`, `validando`, `executando`, `interrupcao_solicitada`, `interrompendo`, `interrompido`, `concluido` e `falhou`. Toda transição DEVE ser validada, idempotente, datada e monotônica até um estado terminal. `concluido`, `interrompido` e `falhou` são terminais; uma nova execução material DEVE receber novo identificador e NÃO DEVE reabrir o registro anterior. O progresso e o título de RN036 DEVEM derivar desse mesmo registro.

A arquitetura vigente possui um único cliente e uma única sessão ativa por instância servidora; portanto, cada instância DEVE admitir no máximo uma campanha ativa, o que também garante o limite absoluto de uma campanha por sessão. A presença de múltiplas sessões persistidas NÃO constitui suporte a campanhas simultâneas. Troca, criação, renomeação, remoção, abertura ou início de outra sessão por GUI, CLI, URL, API ou nova instância local DEVE ser rejeitado enquanto existir campanha ativa ou estado ainda não reconciliado. A implementação NÃO DEVE introduzir multiprocessamento entre sessões.

O início da campanha DEVE adquirir exclusividade atomicamente antes de qualquer envio. Repetição, clique rápido, chamada direta, retransmissão ou corrida DEVE retornar o mesmo resultado idempotente quando possuir a mesma chave de operação ou conflito impeditivo quando representar operação distinta. A validação apenas visual NÃO substitui a rejeição no servidor.

Ao iniciar, recarregar ou reconectar a GUI, restaurar sessão, abrir painel afetado ou antes de habilitar comando material, a interface DEVE consultar o servidor e reconstruir o estado real. Falha de comunicação, timeout, resposta inválida ou autoridade indeterminada DEVE manter conservadoramente bloqueados os controles capazes de alterar a campanha até reconciliação válida. Reinício do servidor DEVE comparar o registro persistido com processo e recursos reais; operação sem proprietário vivo DEVE terminar como `interrompido`, nunca reaparecer como ativa ou concluída.

Durante `preparando`, `validando`, `executando`, `interrupcao_solicitada` ou `interrompendo`, a GUI DEVE bloquear integralmente edição de modelo, filtros, CSV, configuração, sessão e demais entradas capazes de modificar o plano ou seu resultado. Cada painel afetado DEVE ocultar automaticamente o conteúdo, preservar título e exibir indisponibilidade por campanha ativa, sem oferecer retração manual nesse período. O bloqueio DEVE alcançar mouse, toque, teclado, atalho e chamada client-side, manter acessibilidade e NÃO DEVE apagar valor, desmontar estado necessário, redefinir configuração ou impedir leitura de progresso, logs e ação de interrupção. Confirmação autoritativa de estado terminal DEVE restaurar imediatamente a condição anterior dos painéis.

Toda ação assíncrona da GUI DEVE impedir reentrância após o primeiro acionamento válido, expor estado transitório inequívoco e permanecer indisponível até resposta terminal ou reconciliação. A ação `Interromper envio` DEVE permanecer acessível durante campanha ativa e solicitar cancelamento ao servidor. O pedido DEVE transicionar para `interrupcao_solicitada`, tornar-se `interrompendo` quando acolhido e somente liberar controles após `interrompido`, `concluido` ou `falhou`. Repetições DEVEM ser idempotentes. Operação indivisível já entregue à biblioteca externa PODE terminar antes da interrupção, mas nenhum novo item DEVE começar depois que o cancelamento for observado.

Processo, subprocesso, worker, thread, navegador ou recurso descendente adotado por uma campanha DEVE ser registrado sob sua operação e encerrado com ela. Encerramento normal, sinal, falha irrecuperável ou morte do servidor NÃO DEVEM deixar descendente órfão; onde o sistema operacional não oferecer grupo de processos equivalente, DEVE existir supervisão explícita e fallback verificável. Registro persistido NÃO DEVE fingir que recurso morto continua executando.

O navegador controlado DEVE continuar ativando a superfície do WhatsApp no início como proteção compatível, sem transformar foco, visibilidade ou primeiro plano em fonte de correção. A execução DEVE reduzir continuamente dependência de foco por opções suportadas do navegador, estado no servidor e processamento resiliente. Restrição externa inevitável DEVE ser detectada, registrada e tratada por fallback seguro; contrato, segurança ou mecanismo antiautomação da plataforma NÃO DEVE ser burlado e garantia inexistente NÃO DEVE ser anunciada.

Se uma capacidade futura de campanhas simultâneas entre sessões for criada por RCF e autorização humana específicas, cada tentativa material DEVE exigir confirmação inequívoca do texto: **“ALTO RISCO: envios simultâneos podem bloquear ou causar a perda das contas e números envolvidos. Não recomendado. Confirme que leu e deseja prosseguir.”** Essa regra condicional NÃO autoriza, habilita nem simula a capacidade no produto vigente.

A validação DEVE cobrir início, exclusividade, conclusão, falha, pedido e confirmação de interrupção, reentrância, chamadas diretas duplicadas, recarga, fechamento e reconexão da GUI, indisponibilidade do servidor, restauração dos painéis, tentativa de gerir outra sessão, nova instância, encerramento forçado, ausência de órfãos, reconciliação após reinício e operação com aba, janela ou navegador sem foco.

### RN045 - Contexto Isolado de Conversa e Linguagem de Expressões

Cada campanha DEVE manter contexto isolado por conversa, identificado pelo destinatário normalizado. Antes do primeiro item elegível daquela conversa, o servidor DEVE consultar uma única vez a última mensagem preexistente enviada ou recebida, congelar o instante de referência e reutilizá-lo em todo o fluxo, inclusive pausa, alternância, retry e retomada. Mensagem automatizada pertencente à campanha corrente NÃO DEVE participar do cálculo nem alterar o contexto. Conversas distintas NÃO DEVEM compartilhar constante, variável, argumento, retorno, resultado intermediário, status, cursor, timer ou dado derivado.

A constante reservada e imutável `ultimaconversa` DEVE estar disponível em `${ultimaconversa}`. Seu valor textual DEVE ser o instante ISO 8601 UTC da mensagem preexistente; ausência de mensagem DEVE produzir valor vazio. Coluna homônima de entrada NÃO DEVE sobrescrever a constante reservada. O instante interno e o instante de captura DEVEM permanecer disponíveis ao avaliador sem conversão por texto intermediário.

A função global `emconversa(int?)` DEVE ser exposta no namespace funcional canônico como `$.emconversa()` e `$.emconversa(minutos)`, sem distinção de caixa. Ela DEVE comparar `ultimaconversa` ao instante congelado de captura do contexto, retornar booleano e permanecer estável durante o fluxo. Sem argumento, DEVE usar `RECENT_CONVERSATION_MINUTES`, padrão `15`; com argumento, DEVE aceitar inteiro não negativo somente para aquela avaliação. Ausência de conversa retorna `false`; argumento inválido DEVE produzir erro de validação antes do envio.

O namespace `$.` e as funções existentes de RN026 DEVEM ser preservados. O avaliador DEVE acrescentar, sem distinção de caixa:

- `$.if(condicao, verdade, falso)`, com exatamente três argumentos e avaliação preguiçosa somente do ramo escolhido;
- `$.and(...)`, `$.or(...)` e `$.xor(...)`, com um ou mais argumentos e sem limite arbitrário além dos recursos do parser; `xor` DEVE retornar verdadeiro quando a quantidade de argumentos verdadeiros for ímpar, preservando a semântica encadeada de `^^`;
- `$.min(...)`, `$.max(...)` e `$.media(...)`, com um ou mais argumentos numéricos e erro explícito quando nenhum valor numérico válido existir.

Os operadores `&&`, `||`, `^^` e `!` DEVEM continuar disponíveis. Os operadores matemáticos documentados `+`, `-`, `*`, `/`, `%` e `**` DEVEM ser aceitos com precedência determinística; divisão ou módulo por zero e resultado numérico não finito DEVEM falhar antes do envio. Função existente equivalente NÃO DEVE ser recriada sob implementação paralela.

A construção de expressão `if (condicao) { verdade } else { falso }` DEVE coexistir com `$.if(...)` dentro de `${...}`, admitir aninhamento e avaliar somente o ramo selecionado. Ela NÃO DEVE executar declaração, mutação, acesso global ou efeito colateral. Argumentos, funções aninhadas e ramos DEVEM aceitar espaços e quebras `LF` ou `CRLF`; texto ou número resultante DEVE usar a mesma projeção textual de RN026. Texto que contenha delimitador estrutural DEVE usar literal citado ou escape documentado, sem heurística ambígua.

Parser, prévia, validação, GUI, bundle offline e envio DEVE usar a mesma gramática e o mesmo avaliador. Erro sintático, aridade inválida, função desconhecida, contexto ausente ou valor inválido DEVE ser informado antes do envio, com posição útil e sem executar parcialmente outro destinatário. A validação DEVE cobrir ausência e presença de conversa, limiar padrão e customizado, exclusão das mensagens correntes, estabilidade durante alternância, destinatários distintos, caixa, aridade, avaliação preguiçosa, aninhamento profundo válido, multiline `LF`/`CRLF`, ramos textuais/numéricos/funcionais, operadores, funções matemáticas e ausência de vazamento.

### RN046 - Alternância de Destinatários e Intervalo Intraconversa

A alternância DEVE ser opcional, desabilitada por padrão e cooperativa: somente um item de envio PODE ser entregue à biblioteca por vez, sem concorrência de rede entre destinatários. Quando desabilitada, RN032 permanece integralmente aplicável. Quando habilitada, o planejador PODE suspender um destinatário apenas em fronteira válida de item, preservar ordem e cursor internos e continuar com o próximo destinatário do grupo.

A configuração central de RN035 DEVE declarar:

```text
RECIPIENT_INTERLEAVING_ENABLED=false
RECIPIENT_INTERLEAVING_GROUP_SIZE=2
RECIPIENT_INTERLEAVING_MAX_GROUP_SIZE=25
RECIPIENT_MESSAGES_PER_TURN=1
RECIPIENT_MESSAGE_DELAY_ENABLED=false
RECIPIENT_MESSAGE_DELAY_MS=0
RECENT_CONVERSATION_MINUTES=15
```

O grupo efetivo DEVE conter entre `2` e `RECIPIENT_INTERLEAVING_MAX_GROUP_SIZE` destinatários, respeitar a ordem original dos elegíveis e operar em round-robin determinístico. O teto padrão DEVE ser `25` e permanecer configurável centralmente; quantidade por turno DEVE ser inteiro positivo, padrão `1`, sem limite arbitrário adicional. Somente depois de todos os destinatários do grupo atingirem estado terminal o planejador DEVE criar o próximo grupo. Destinatário concluído, pulado ou definitivamente falho DEVE sair do round-robin sem bloquear os restantes.

O marcador literal `$pause$`, sozinho em linha própria e posicionado em fronteira entre itens do plano, DEVE forçar cessão após o item anterior quando a alternância estiver habilitada. Ele DEVE ser removido como controle e NUNCA ser enviado ao WhatsApp, criar item vazio, substituir `$postagem$` ou alterar `^^^`. Ocorrência fora de fronteira válida DEVE gerar erro de validação. Com alternância desabilitada, o marcador DEVE ser removido sem efeito de escalonamento e sem alterar as postagens ou o conteúdo restante. Na ausência de `$pause$`, a cessão DEVE ocorrer após `RECIPIENT_MESSAGES_PER_TURN` itens confirmados ou falha terminal.

Cada destinatário DEVE possuir estado próprio com plano, cursor, contexto de RN045, quantidade do turno, último envio confirmado e próximo instante elegível. Pausa, retomada, retry, falha ou término de outro destinatário NÃO DEVE alterar esse estado. A alternância NÃO DEVE inverter itens, misturar legenda/anexo, contornar confirmação de RN032, antecipar registro em `enviados.csv` ou permitir mais de uma operação para o mesmo chat.

O intervalo intraconversa DEVE ser distinto do intervalo RN014 entre destinatários e dos backoffs de RN032. Quando habilitado, antes de iniciar cada item posterior ao primeiro da mesma conversa, o planejador DEVE garantir que tenham transcorrido `RECIPIENT_MESSAGE_DELAY_MS` milissegundos desde a confirmação do item anterior. Tempo real consumido por outros destinatários PODE abater o intervalo; se ainda faltar tempo, somente o restante DEVE ser aguardado. Evento de outro destinatário NÃO DEVE satisfazer, reiniciar ou contaminar o relógio. Valor DEVE ser inteiro não negativo; desabilitado, NÃO DEVE introduzir espera adicional.

GUI e CLI DEVEM resolver as mesmas configurações. A CLI DEVE oferecer equivalentes explícitos para habilitar/desabilitar alternância, tamanho do grupo, itens por turno e delay intraconversa; a GUI DEVE expor controles equivalentes nos escopos de RN035, limitar dinamicamente o grupo ao teto vigente e tornar estado/valor inequívocos. Configuração inválida DEVE bloquear antes de persistir ou enviar.

A validação DEVE cobrir grupos menores, iguais e maiores que o teto; último grupo parcial; ordem original; round-robin; término antecipado; falha isolada; alternância ligada/desligada; quantidade por turno; `$pause$` válido, ausente e inválido; `$postagem$`, `^^^`, texto, anexos e áudio; pausa/retomada; delay ligado/desligado; tempo intermediário menor, igual e maior que o intervalo; retry; progresso; logs; histórico inteligente; e inexistência de contaminação entre conversas.

### RN047 - Superfícies de Composição e Paridade dos Editores

A GUI executora DEVE integrar os controles de RN044 e RN046 ao padrão visual existente, preservando hierarquia, responsividade, contraste, teclado, foco, redução de movimento e aparência profissional. Configuração de campanha e ação de interrupção pertencem somente às superfícies executoras e NÃO DEVEM transformar o bundle offline em executor.

A toolbar do editor principal DEVE oferecer inserção agrupada e não redundante de `${}`, `ultimaconversa`, `$.emconversa()`, funções condicionais/lógicas/matemáticas novas e preexistentes, construção `if/else` e `$pause$`. Controle por ícone DEVE usar o registro multiprovedor de RN049, possuir `hint` e nome acessível inequívocos, preservar seleção, cursor, foco, rolagem e IME e manter separadores visuais entre formatação, variáveis, decisão, matemática e controle de fluxo. Os comandos DEVEM ocupar exatamente duas barras de ferramentas horizontais: uma de documento/persistência/importação/exportação e outra de composição/formatação/expressões/fluxo. Funções distintas NÃO DEVEM repetir ícone genérico quando qualquer provedor autorizado oferecer representação semântica compatível; em viewport estreito, cada barra PODE rolar horizontalmente ou adaptar grupos sem criar terceira barra, misturar os dois escopos ou expor botão textual divergente. GUI Node e projeção offline DEVEM conservar a mesma divisão, ordem relativa, estilos, dimensões, interações e hints nos recursos comuns.

O editor da GUI Node DEVE permanecer fonte primária da estrutura, estilos, gramática, controles e comportamentos comuns. A projeção offline de RN039 DEVE receber os mesmos controles de composição aplicáveis, a mesma prévia e o mesmo avaliador, omitindo somente operações que exigem servidor, WhatsApp ou campanha. Especialização legítima de dados do bundle e a exceção de download definida em RN022/RN039 DEVEM ser preservadas.

README, guia avançado, ajuda contextual e exemplos DEVEM documentar sintaxe, caixa, tipos, escopo, defaults, multiline, aninhamento, `ultimaconversa`, `$.emconversa`, funções, `if/else`, `$pause$`, grupos, turnos, delay, CLI e GUI antes de declarar a implementação disponível. Testes DEVEM comparar gramática, botões, hints, ordem, grupos, DOM/CSS e comportamento comum entre os dois editores, além de validar que o bundle permanece autocontido, sem rede e sem capacidade de envio.

### RN048 - Aleatorização Efêmera da Ordem dos Modelos

A configuração central de RN035 DEVE declarar `TEMPLATE_VARIANT_RANDOMIZATION_ENABLED=true`. A opção DEVE ser habilitada por padrão, resolvida pela hierarquia Execução → Sessão → Global → Default e aplicada exclusivamente por superfícies executoras. A GUI DEVE expor controle inequívoco para habilitar ou desabilitar a aleatorização; a CLI DEVE oferecer equivalentes explícitos. O bundle offline de RN039 NÃO DEVE receber configuração nem capacidade de campanha.

Depois de validar e separar os modelos de RN025, o início de cada nova campanha material DEVE criar, somente quando a opção estiver habilitada e houver mais de um modelo válido, uma única permutação temporária da lista. A permutação DEVE conter cada modelo exatamente uma vez, sem perda, duplicação ou alteração de conteúdo; resultado aleatório igual à ordem original permanece válido. A distribuição circular de RN025 e a alternância de RN046 DEVEM usar essa mesma ordem durante toda a campanha.

A ordem temporária DEVE existir somente na memória da operação viva. Ela NÃO DEVE alterar, regravar, reordenar nem ser persistida no editor, arquivo `.md`, configuração, sessão, registro de campanha, pacote, autosave ou qualquer outra fonte permanente. Pausa, continuação, alternância, troca de grupo, destinatário, item, retry ou reconexão da GUI à mesma operação viva DEVEM reutilizar a permutação já definida e NÃO DEVEM consumir novo sorteio. Perda do processo continua sujeita à reconciliação terminal de RN044; nova tentativa após interrupção constitui nova campanha material e PODE criar nova permutação.

Quando a opção estiver desabilitada, a ordem original DEVE ser preservada integralmente. Com zero ou um modelo válido, o sistema NÃO DEVE invocar o mecanismo de aleatorização nem introduzir efeito colateral. A criação da permutação NÃO DEVE alterar isolamento, contexto, cursores, delays, confirmação, histórico, progresso, interrupção ou ordem interna dos itens de cada modelo.

A implementação DEVE permitir injetar uma fonte determinística de aleatoriedade em teste sem transformar seed em configuração pública nem fixá-la em produção. A validação DEVE cobrir default habilitado, opção desabilitada, zero, um e múltiplos modelos, cardinalidade e identidade da permutação, ausência de mutação da entrada, estabilidade durante toda a operação viva, retomada por pausa e reconexão, retry, alternância ligada e desligada, nova campanha, ausência de persistência e paridade de configuração entre GUI e CLI.

### RN049 - Registro Multiprovedor de Ícones e Toolbars

O sistema DEVE manter um único registro autoritativo de ícones com suporte simultâneo a Font Awesome Free, Lucide e Iconify. Toda referência canônica DEVE identificar explicitamente o provedor e, quando aplicável, coleção, estilo e nome, como `fontawesome:solid:download`, `lucide:file-down` ou `iconify:game-icons:upgrade`. Alias legado somente PODE ser preservado por mapeamento explícito e testado para uma chave qualificada; nome não qualificado, ausência ou falha em um provedor NÃO PODE pesquisar, importar, resolver, identificar nem usar fallback de outro provedor. Chaves, caches, IDs de sprite, manifests, logs e erros DEVEM conservar o namespace de origem e impedir colisão entre nomes iguais.

Dados vetoriais DEVEM ser obtidos de pacote oficial e licença compatível durante desenvolvimento/build, sanitizados e convertidos para a representação SVG comum do projeto. Runtime da GUI e bundle offline NÃO DEVEM consultar CDN, API ou rede para resolver ícones. O manifesto de build DEVE enumerar chave qualificada, provedor, coleção/estilo, versão da fonte, licença, atribuição quando exigida, geometria e consumidores. Somente ícones referenciados por superfícies alcançáveis DEVEM integrar `dist`; pacote completo, componente remoto, fonte de ícones ou dependência usada apenas para extração NÃO DEVE integrar o manifesto de runtime. Geometria byte ou semanticamente idêntica PODE compartilhar um único símbolo emitido apenas quando o manifesto preserva todas as chaves qualificadas e suas licenças, sem transformar compartilhamento físico em resolução cruzada ou fallback. Recurso comum DEVE ser centralizado e emitido uma única vez por artefato quando tecnicamente evitável.

Font Awesome permanece suportado sem exclusividade. Lucide DEVE conservar suas características oficiais de traço quando o ícone escolhido for dessa coleção; a preferência por flat/solid e monocromático orienta a seleção sem autorizar deformação de geometria, preenchimento arbitrário ou troca de provedor. Coleção Iconify DEVE ser tratada como origem independente, inclusive quanto à licença do conjunto: a licença do framework Iconify NÃO substitui a licença do ícone ou da coleção. O projeto DEVE documentar, no RCF e no README antes de declarar a implementação disponível, as páginas diretas de pesquisa [Lucide Icons](https://lucide.dev/icons/), [Iconify Icon Sets](https://icon-sets.iconify.design/) e [Font Awesome Free](https://fontawesome.com/icons?m=free), além das atribuições exigidas pelos ícones efetivamente incorporados.

No cabeçalho da GUI executora, `Atualizar` DEVE usar exatamente `iconify:game-icons:upgrade` e `Baixar versão offline` exatamente `iconify:streamline-sharp:download-box-1-solid`, com funções, hints, nomes acessíveis, estados e eventos existentes preservados. O bundle offline NÃO DEVE projetar controles exclusivos da GUI executora nem qualquer estado de autenticação ou conexão; controles locais equivalentes DEVEM usar semântica própria do editor. Nenhum dos dois ícones obrigatórios PODE ser substituído por nuvem genérica, resolvido por outro provedor ou compartilhado por identidade visual ambígua.

As quatro opções do painel de atualização constituem um único grupo de alternativas mutuamente exclusivas. DEVEM ser implementadas como controles de rádio nativos ou semântica ARIA equivalente completa, operáveis por teclado, com indicador persistente de seleção e aparência de switch/seletor de aplicativo. O botão `Confirmar atualização` permanece ação separada, desabilitada sem seleção válida, e NÃO DEVE compartilhar aparência, papel, foco ou estado de seleção das opções. Controles booleanos independentes em outras superfícies permanecem checkbox/switch e NÃO DEVEM herdar exclusividade artificial.

As duas barras dos editores definidas em RN047 e a barra CSV de RN039 DEVEM derivar de componente e catálogo comuns. Cada ação DEVE receber ícone semanticamente específico quando existir opção autorizada adequada, hint, `aria-label`, foco visível, estado desabilitado e área clicável equivalentes. Repetição de ícone entre funções distintas exige ausência comprovada de alternativa semanticamente melhor nos três provedores e registro no manifesto; texto curto PODE acompanhar ícone somente quando o padrão global ou a compreensão acessível exigir, nunca como botão textual paralelo. Inputs nativos de arquivo permanecem no DOM para acesso programático e tecnologias assistivas, mas DEVEM ser visualmente ocultos e acionados pelo controle `Abrir` padronizado.

A validação DEVE cobrir: resolução positiva e negativa por cada namespace; colisões homônimas; inexistência de fallback ou importação cruzada; licença/atribuição por coleção; conjunto exato de ícones alcançáveis; ausência dos pacotes de build e de rede em runtime; deduplicação sem perda de proveniência; presença exata dos dois ícones obrigatórios; ausência de estado Node/WhatsApp e de controles executores no offline; semântica, teclado e distinção visual do grupo de atualização; exatamente duas barras e seus grupos nos dois editores; toolbar CSV, input de arquivo oculto, hints e acessibilidade; CSS/DOM e capturas determinísticas nos viewports declarados; comparação com `evidencia1.png` a `evidencia4.png`; e ausência de regressão funcional, visual, responsiva, de impressão ou de distribuição.

### RN050 - Página Pública de Atribuições Obrigatórias

O projeto DEVE publicar uma página estática canônica em `/atribuicoes/`, com resposta equivalente para `/atribuicoes`, destinada exclusivamente aos avisos de terceiros juridicamente exigidos pelos componentes e recursos efetivamente incorporados, instalados ou distribuídos pelo produto oficial. A página NÃO DEVE confundir licença do projeto, agradecimento facultativo, dependência somente de desenvolvimento, pacote apenas presente no workspace ou recurso não alcançável com obrigação de atribuição. Sua relação DEVE ser gerada de inventário verificável, e NÃO mantida como lista editorial paralela.

O inventário autoritativo DEVE combinar: a árvore realmente instalada na validação do release com dependências de desenvolvimento omitidas; os manifests de arquivos e recursos do artefato; o registro used-only de RN049; e os componentes de desenvolvimento cujos bytes foram extraídos e incorporados ao produto, como Tabulator e subconjuntos SVG. Pacote opcional não materializado, dependência de build sem bytes distribuídos e recurso não referenciado DEVEM ser excluídos. Cada item materializado DEVE ser confrontado com o texto de licença e os metadados da mesma versão efetiva, obtidos do pacote oficial ou da origem autoritativa. Licença ausente, ambígua, incompatível, sem texto obrigatório disponível ou divergente do manifesto DEVE bloquear build e publicação, nunca produzir atribuição presumida.

Cada obrigação distinta DEVE produzir registro com nome, versão ou identificação do recurso, finalidade no produto, origem ou repositório oficial, link oficial, autor ou titular informado pela própria fonte, identificador e link da licença, aviso de copyright, texto de atribuição ou permissão exigido e indicação objetiva de alteração quando aplicável. Recursos com termos, titular, origem e tratamento idênticos PODEM ser agrupados sem perda dos nomes e versões cobertos; licenças ou autores distintos NÃO PODEM ser fundidos. A ordenação DEVE ser determinística por nome normalizado, versão e origem. Links externos DEVEM ser HTTPS quando a fonte oferecer HTTPS, possuir texto descritivo e NÃO DEVEM sugerir endosso.

Para CC BY 3.0 e CC BY 4.0, o registro DEVE fornecer crédito apropriado, vínculo à obra/origem e à licença e indicação de modificações conforme a versão aplicável. `game-icons:upgrade` DEVE preservar o autor individual comprovado pela fonte do ícone e a forma de crédito requerida pelo conjunto Game Icons; `streamline-sharp:download-box-1-solid` DEVE creditar Streamline e vincular sua origem oficial. Font Awesome Free em SVG DEVE preservar Fonticons, Inc., CC BY 4.0 e os avisos fornecidos pela distribuição oficial. Lucide DEVE preservar integralmente o aviso ISC vigente e, para ícone derivado de Feather segundo a licença oficial da versão usada, também o aviso MIT de Cole Bemis. Tabulator DEVE preservar o aviso MIT de Oli Folkerd. Essa enumeração fixa as famílias atualmente comprovadas, mas NÃO substitui a descoberta integral do inventário nem autoriza omitir outro item obrigatório encontrado. A página pública complementa e NÃO substitui avisos que a licença exija dentro da cópia, arquivo, pacote ou artefato distribuído.

Antes da relação, a página DEVE conter somente introdução sucinta que explique sua finalidade. O documento DEVE usar a identidade pública já versionada do WhatSend — marca, favicon, tipografia de sistema, paleta, espaçamento, bordas, traços e componentes equivalentes à GUI — porque não existe site público anterior a reutilizar; NÃO DEVE criar framework, tema, linguagem visual ou navegação paralelos. A estrutura DEVE usar cabeçalho, conteúdo principal, título único, lista semântica ou tabela com cabeçalhos e rodapé, funcionar sem JavaScript, ser navegável por teclado e leitor de tela, manter foco e contraste perceptíveis e adaptar-se sem rolagem horizontal estrutural a 320 px. A página NÃO possui requisito específico de impressão, A4, monocromia ou folha de estilo para mídia impressa; todos os avisos obrigatórios permanecem integralmente disponíveis no HTML e nos artefatos distribuíveis aplicáveis.

Como o repositório não possui Jekyll, site ou GitHub Pages habilitado, a implementação DEVE construir um artefato allowlisted e isolado a partir de fonte sob `src/`, sem publicar a raiz do repositório nem `docs/`. Jekyll NÃO DEVE ser introduzido sem necessidade técnica posterior comprovada. O workflow oficial DEVE validar e produzir o mesmo artefato em pull request sem publicar; somente `main`, após gates aprovados, PODE implantá-lo com as ações oficiais do GitHub Pages, permissões mínimas `contents: read`, `pages: write` e `id-token: write`, ambiente `github-pages`, concorrência serializada e URL de deployment registrada. A saída DEVE conter `/atribuicoes/index.html`, recursos locais allowlisted e `.nojekyll`, sem segredo, dado operacional, `node_modules`, código da aplicação, artefato de release ou conteúdo não manifestado.

A validação DEVE comprovar: inventário completo e reprodutível a partir do release materializado; diferença vazia entre obrigações detectadas e registros publicados; ausência de dependências e créditos especulativos; textos, autores, versões, links, modificações e licenças exigidos; preservação dos avisos dentro dos artefatos quando aplicável; HTML válido; landmark, título, ordem de headings, contraste, teclado e nome acessível; viewports de 320, 768 e 1280 px; build limpo e determinístico; allowlist do site; rota local `/atribuicoes` e `/atribuicoes/`; execução do workflow; deployment Pages concluído; resposta pública HTTP 200 na URL canônica; e ausência de regressão nas páginas, módulos, release, GUI e bundle offline existentes. Impressão e geração de PDF ficam expressamente fora dos gates desta página.

## Requisitos Não Funcionais

### RNF001 - Plataforma

Compatível com Windows, macOS e Linux, desde que Node.js LTS, dependências e navegador Chromium compatível estejam disponíveis.

### RNF002 - Execução

Compatível com Node.js LTS e CommonJS.

### RNF003 - Offline Parcial

Operação offline para leitura, validação, renderização do template e logs, exceto comunicação com WhatsApp Web e download de anexos remotos.

### RNF004 - Escala

Suportar lotes grandes com processamento independente por destinatário.

### RNF005 - Manutenibilidade

As regras críticas devem possuir cobertura automatizada por `node:test`.

### RNF006 - Extensibilidade

O desenho deve permitir evolução futura para múltiplos templates, campanhas, anexos avançados, agendamento e dry-run.

### RNF007 - UX

A interface deve ser simples, responsiva, minimalista, clara e suficiente para usuários com familiaridade básica com fórmulas, planilhas ou programação leve.

Microajustes visuais devem preservar contraste, espaçamento consistente, leitura clara e visual profissional, sem transformar a GUI em landing page.
