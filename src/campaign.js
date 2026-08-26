// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const fs = require("fs");

const {
  PATHS,
  RECENT_CONVERSATION_MINUTES,
  RECIPIENT_INTERLEAVING_ENABLED,
  RECIPIENT_INTERLEAVING_GROUP_SIZE,
  RECIPIENT_INTERLEAVING_MAX_GROUP_SIZE,
  RECIPIENT_MESSAGES_PER_TURN,
  RECIPIENT_MESSAGE_DELAY_ENABLED,
  RECIPIENT_MESSAGE_DELAY_MS,
  ROOT_DIR,
  isTruthyEnv,
  readIntegerEnv,
} = require("./config");
const { loadClientes, loadTemplate } = require("./data");
const { applyTemplate, parseEmbeddedTemplate, splitTemplateVariants } = require("./template");
const {
  createRenderedSendCursor,
  sendNextRenderedItem,
  sendRenderedTemplate,
  validateTemplateMediaReferences,
} = require("./media");
const { initLogFiles, appendLog, loadSentRecords } = require("./logs");
const { registerTemplateInCache, getSendDecision } = require("./tracking");
const { getRecordValue, randomDelay, sanitizePhone, sleep } = require("./utils");
const { createStatusReporter, maskPhone } = require("./status");
const { runRecipientScheduler } = require("./recipient-scheduler");
const { getExistingBrowserConnectionConfig, getWhatsAppClientId, resolveBrowserExecutablePath } = require("./browser");
const {
  TERMINAL_CAMPAIGN_STATES,
  acquireCampaign,
  readCampaignState,
  shouldInterruptCampaign,
  transitionCampaign,
  updateCampaignProgress,
} = require("./campaign-state");

const WHATSAPP_TAB_ATTENTION_NOTICE =
  "Se o envio de anexos ou áudio parecer lento, mantenha a aba do WhatsApp Web visível; alguns navegadores reduzem atividade de abas em segundo plano.";

function validateRuntimeFiles(paths = PATHS, options = {}) {
  const checkBrowser = options.checkBrowser !== false;
  const issues = [];
  let clientes = [];
  let template = "";

  try {
    template = parseEmbeddedTemplate(loadTemplate(paths.template));

    if (template.content.trim().length === 0) {
      issues.push("Template inválido: texto.md está vazio.");
    }

    issues.push(...validateTemplateMediaReferences(template, paths));
  } catch (err) {
    issues.push(err.message);
  }

  try {
    clientes = loadClientes(paths);
  } catch (err) {
    issues.push(err.message);
  }

  try {
    initLogFiles(paths);
  } catch (err) {
    issues.push(`Estrutura de logs inválida: ${err.message}`);
  }

  if (fs.existsSync(paths.auth) && !fs.statSync(paths.auth).isDirectory()) {
    issues.push(`Sessão inválida: ${paths.auth} não é um diretório.`);
  }

  if (checkBrowser) {
    try {
      const existingBrowserConfig = getExistingBrowserConnectionConfig();
      const executablePath = existingBrowserConfig
        ? null
        : resolveBrowserExecutablePath();

      if (!existingBrowserConfig && !executablePath) {
        issues.push("Chrome/Chromium/Edge não encontrado.");
      }

      getWhatsAppClientId();
    } catch (err) {
      issues.push(err.message);
    }
  }

  if (issues.length > 0) {
    throw new Error(`Pré-validação RCF falhou:\n- ${issues.join("\n- ")}`);
  }

  return {
    clientesCount: clientes.length,
    templateVariables: [...template.content.matchAll(/\$\{([^}]+)\}/g)].map((match) =>
      match[1].trim(),
    ),
  };
}

async function processCampaign(client, paths = PATHS, options = {}) {
  const rootDir = paths.root || ROOT_DIR;
  const sessionId =
    (paths.activeSession && paths.activeSession.id) ||
    paths.sessionClientId ||
    "default";
  let campaignState = options.campaignState || acquireCampaign(
    rootDir,
    sessionId,
    options.idempotencyKey,
  ).state;
  const originalProgress = options.onProgress;
  const executionOptions = {
    ...options,
    campaignState,
    shouldInterrupt: () => shouldInterruptCampaign(rootDir, campaignState),
    onProgress: (event) => {
      campaignState = updateCampaignProgress(rootDir, campaignState, event);
      if (typeof originalProgress === "function") originalProgress(event);
    },
  };

  try {
    campaignState = transitionCampaign(rootDir, campaignState, "validando");
    campaignState = transitionCampaign(rootDir, campaignState, "executando");
    const result = await processCampaignExecution(client, paths, executionOptions);
    if (result.interrupted) {
      const persisted = shouldInterruptCampaign(rootDir, campaignState);
      if (persisted && campaignState.status === "executando") {
        campaignState = transitionCampaign(rootDir, campaignState, "interrupcao_solicitada", {
          interruptRequested: true,
          interruptRequestedAt: new Date().toISOString(),
        });
      } else {
        const latest = readCampaignState(rootDir, sessionId);
        if (latest) campaignState = latest;
      }
      if (campaignState.status === "interrupcao_solicitada") {
        campaignState = transitionCampaign(rootDir, campaignState, "interrompendo");
      }
      campaignState = transitionCampaign(rootDir, campaignState, "interrompido", {
        result: "interrompida_pelo_operador",
      });
      return { interrupted: true, state: campaignState };
    }
    campaignState = transitionCampaign(rootDir, campaignState, "concluido", {
      progress: { ...campaignState.progress, percent: 100 },
      result: "concluida",
    });
    return { interrupted: false, state: campaignState };
  } catch (error) {
    const latest = readCampaignState(rootDir, sessionId) || campaignState;
    if (!TERMINAL_CAMPAIGN_STATES.has(latest.status)) {
      campaignState = transitionCampaign(rootDir, latest, "falhou", {
        error: error.message || String(error),
        result: "falhou",
      });
    }
    error.campaignState = campaignState;
    throw error;
  }
}

async function processCampaignExecution(client, paths = PATHS, options = {}) {
  const forceResend = Boolean(options.forceResend);
  const sentRecords = loadSentRecords(paths.sent);
  const templateDocument = parseEmbeddedTemplate(loadTemplate(paths.template));
  const templateVariants = splitTemplateVariants(templateDocument.content);
  const messageContexts = templateVariants.map((variant) =>
    registerTemplateInCache(variant, paths),
  );
  const clientes = loadClientes(paths);
  const status = createStatusReporter(clientes.length);

  console.log(`Clientes encontrados: ${clientes.length}`);
  emitProgress(options, {
    message: `Clientes encontrados: ${clientes.length}`,
    total: clientes.length,
    type: "info",
  });
  status.event(WHATSAPP_TAB_ATTENTION_NOTICE, "yellow");
  emitProgress(options, {
    message: WHATSAPP_TAB_ATTENTION_NOTICE,
    total: clientes.length,
    type: "warning",
  });

  const interleavingEnabled = options.interleavingEnabled ?? (
    process.env.RECIPIENT_INTERLEAVING_ENABLED === undefined
      ? RECIPIENT_INTERLEAVING_ENABLED
      : isTruthyEnv(process.env.RECIPIENT_INTERLEAVING_ENABLED)
  );
  if (interleavingEnabled) {
    return processInterleavedRecipients({
      client, clientes, forceResend, messageContexts, options, paths,
      sentRecords, status, templateDocument, templateVariants,
    });
  }

  for (let index = 0; index < clientes.length; index += 1) {
    if (typeof options.shouldInterrupt === "function" && options.shouldInterrupt()) {
      emitProgress(options, {
        current: index,
        message: "Interrupção acolhida; nenhum novo destinatário será iniciado.",
        total: clientes.length,
        type: "warning",
      });
      return { interrupted: true };
    }
    const cliente = clientes[index];
    const telefoneOriginal = getRecordValue(cliente, "telefone");
    const telefone = sanitizePhone(telefoneOriginal);
    status.current(`Validando ${maskPhone(telefone)}`);
    emitProgress(options, {
      current: index + 1,
      message: `Validando ${maskPhone(telefone)}`,
      telefone: maskPhone(telefone),
      total: clientes.length,
      type: "current",
    });

    try {
      const templateIndex = index % templateVariants.length;
      const selectedTemplate = templateVariants[templateIndex];
      const messageContext = messageContexts[templateIndex];

      if (!telefone) {
        const reason = "Telefone vazio ou sem dígitos.";

        appendLog(paths.errors, [
          telefoneOriginal,
          "TELEFONE_INVALIDO",
          reason,
          new Date().toISOString(),
        ]);

        status.event(`Pulando registro: ${reason}`, "red");
        status.error("Telefone inválido");
        emitProgress(options, {
          current: index + 1,
          message: `Pulando registro: ${reason}`,
          total: clientes.length,
          type: "skip",
        });
        continue;
      }

      const sendDecision = getSendDecision(
        telefone,
        sentRecords,
        messageContext,
        options,
      );

      if (!forceResend && !sendDecision.shouldSend) {
        appendLog(paths.skipped, [
          telefone,
          sendDecision.code || "JA_ENVIADO",
          sendDecision.reason,
          new Date().toISOString(),
        ]);

        status.event(
          `Pulando ${maskPhone(telefone)}: ${sendDecision.reason}`,
          "yellow",
        );
        status.skip(`Já enviado ${maskPhone(telefone)}`);
        emitProgress(options, {
          current: index + 1,
          message: `Pulando ${maskPhone(telefone)}: ${sendDecision.reason}`,
          telefone: maskPhone(telefone),
          total: clientes.length,
          type: "skip",
        });
        continue;
      }

      if (forceResend && sentRecords.some((record) => record.telefone === telefone)) {
        status.event(
          `Reenviando ${maskPhone(telefone)}: --force-resend ativo.`,
          "yellow",
        );
      } else if (sendDecision.reason && sendDecision.reason !== "Nenhum envio anterior para este telefone.") {
        status.event(`Enviando ${maskPhone(telefone)}: ${sendDecision.reason}`, "yellow");
      }

      const numberId = await client.getNumberId(telefone);

      if (!numberId) {
        const reason = "Número não encontrado no WhatsApp.";

        appendLog(paths.errors, [
          telefone,
          "NAO_REGISTRADO",
          reason,
          new Date().toISOString(),
        ]);

        status.event(`Pulando ${maskPhone(telefone)}: ${reason}`, "red");
        status.error(`Sem WhatsApp ${maskPhone(telefone)}`);
        emitProgress(options, {
          current: index + 1,
          message: `Pulando ${maskPhone(telefone)}: ${reason}`,
          telefone: maskPhone(telefone),
          total: clientes.length,
          type: "skip",
        });
        continue;
      }

      const conversation = await captureConversationContext(client, numberId._serialized, options);
      const missingVariables = new Set();
      const mensagem = applyTemplate(selectedTemplate, cliente, {
        conversation,
        onMissingVariable: (field) => missingVariables.add(field),
        recentConversationMinutes: options.recentConversationMinutes ?? RECENT_CONVERSATION_MINUTES,
        reserved: {
          ultimaconversa: conversation.lastMessageAt || "",
        },
      });

      for (const field of missingVariables) {
        appendLog(paths.warnings, [
          telefone,
          "VARIAVEL_AUSENTE",
          field,
          new Date().toISOString(),
        ]);

        status.warning(`Variável ausente: ${field}`);
      }

      const sendResult = await sendRenderedTemplate(client, numberId._serialized, mensagem, paths, {
        embeddedAttachments: templateDocument.attachments,
        shouldInterrupt: options.shouldInterrupt,
        onProgress: (event) => {
          const mediaMessage = event.message || "Processando anexo.";

          if (event.type === "warning") {
            status.event(mediaMessage, "yellow");
          } else {
            status.current(mediaMessage);
          }

          emitProgress(options, {
            current: index + 1,
            message: mediaMessage,
            telefone: maskPhone(telefone),
            total: clientes.length,
            type: event.type || "info",
          });
        },
      });
      if (sendResult && sendResult.interrupted) {
        emitProgress(options, {
          current: index,
          message: `Interrupção acolhida após item indivisível de ${maskPhone(telefone)}.`,
          telefone: maskPhone(telefone),
          total: clientes.length,
          type: "warning",
        });
        return { interrupted: true };
      }

      const sentAt = new Date().toISOString();

      appendLog(paths.sent, [telefone, messageContext.hash, sentAt]);
      sentRecords.push({
        dataHora: sentAt,
        mensagemHash: messageContext.hash,
        telefone,
      });

      status.sent(`Enviado ${maskPhone(telefone)}`);
      emitProgress(options, {
        current: index + 1,
        message: `Enviado ${maskPhone(telefone)}`,
        telefone: maskPhone(telefone),
        total: clientes.length,
        type: "sent",
      });

      const delay = randomDelay();
      status.current(`Aguardando ${Math.round(delay / 1000)}s`);
      emitProgress(options, {
        current: index + 1,
        message: `Aguardando ${Math.round(delay / 1000)}s`,
        total: clientes.length,
        type: "wait",
      });
      await sleep(delay);
    } catch (err) {
      const nome = String(getRecordValue(cliente, "nome") || "").trim();
      const detail = nome ? `Cliente ${nome}: ${err.message}` : err.message;

      appendLog(paths.errors, [
        telefone || telefoneOriginal,
        "ERRO_ENVIO",
        detail,
        new Date().toISOString(),
      ]);

      status.error(`Erro ${nome || maskPhone(telefone)}: ${err.message}`);
      emitProgress(options, {
        current: index + 1,
        message: `Erro ${nome || maskPhone(telefone)}: ${err.message}`,
        telefone: maskPhone(telefone),
        total: clientes.length,
        type: "error",
      });
    }
  }

  status.finish();
  emitProgress(options, {
    message: "Processamento concluído.",
    total: clientes.length,
    type: "done",
  });
  return { interrupted: false };
}

async function processInterleavedRecipients(context) {
  const {
    client, clientes, forceResend, messageContexts, options, paths,
    sentRecords, status, templateDocument, templateVariants,
  } = context;
  const recipients = [];
  for (let index = 0; index < clientes.length; index += 1) {
    const cliente = clientes[index];
    const telefoneOriginal = getRecordValue(cliente, "telefone");
    const telefone = sanitizePhone(telefoneOriginal);
    try {
      if (!telefone) throw new Error("Telefone vazio ou sem dígitos.");
      const templateIndex = index % templateVariants.length;
      const messageContext = messageContexts[templateIndex];
      const sendDecision = getSendDecision(telefone, sentRecords, messageContext, options);
      if (!forceResend && !sendDecision.shouldSend) {
        appendLog(paths.skipped, [telefone, sendDecision.code || "JA_ENVIADO", sendDecision.reason, new Date().toISOString()]);
        status.skip(`Já enviado ${maskPhone(telefone)}`);
        emitProgress(options, { current: index + 1, message: `Pulando ${maskPhone(telefone)}: ${sendDecision.reason}`, telefone: maskPhone(telefone), total: clientes.length, type: "skip" });
        continue;
      }
      const numberId = await client.getNumberId(telefone);
      if (!numberId) throw new Error("Número não encontrado no WhatsApp.");
      const conversation = await captureConversationContext(client, numberId._serialized, options);
      const missingVariables = new Set();
      const rendered = applyTemplate(templateVariants[templateIndex], cliente, {
        conversation,
        onMissingVariable: (field) => missingVariables.add(field),
        recentConversationMinutes: options.recentConversationMinutes ?? RECENT_CONVERSATION_MINUTES,
        reserved: { ultimaconversa: conversation.lastMessageAt || "" },
      });
      for (const field of missingVariables) {
        appendLog(paths.warnings, [telefone, "VARIAVEL_AUSENTE", field, new Date().toISOString()]);
        status.warning(`Variável ausente: ${field}`);
      }
      recipients.push({
        chatId: numberId._serialized,
        cursor: createRenderedSendCursor(rendered, templateDocument.attachments),
        index,
        messageContext,
        telefone,
      });
    } catch (error) {
      appendLog(paths.errors, [telefone || telefoneOriginal, "ERRO_PREPARACAO", error.message, new Date().toISOString()]);
      status.error(`Erro ${maskPhone(telefone)}: ${error.message}`);
      emitProgress(options, { current: index + 1, message: error.message, telefone: maskPhone(telefone), total: clientes.length, type: "error" });
    }
  }

  const result = await runRecipientScheduler(recipients, {
    delayEnabled: options.messageDelayEnabled ?? (
      process.env.RECIPIENT_MESSAGE_DELAY_ENABLED === undefined
        ? RECIPIENT_MESSAGE_DELAY_ENABLED
        : isTruthyEnv(process.env.RECIPIENT_MESSAGE_DELAY_ENABLED)
    ),
    delayMs: options.messageDelayMs ?? readIntegerEnv("RECIPIENT_MESSAGE_DELAY_MS", RECIPIENT_MESSAGE_DELAY_MS),
    groupSize: options.interleavingGroupSize ?? readIntegerEnv("RECIPIENT_INTERLEAVING_GROUP_SIZE", RECIPIENT_INTERLEAVING_GROUP_SIZE),
    itemsPerTurn: options.messagesPerTurn ?? readIntegerEnv("RECIPIENT_MESSAGES_PER_TURN", RECIPIENT_MESSAGES_PER_TURN),
    maxGroupSize: readIntegerEnv("RECIPIENT_INTERLEAVING_MAX_GROUP_SIZE", RECIPIENT_INTERLEAVING_MAX_GROUP_SIZE),
    shouldInterrupt: options.shouldInterrupt,
    sleep,
    sendNext: async (recipient) => {
      try {
        const outcome = await sendNextRenderedItem(client, recipient.chatId, recipient.cursor, paths, {
          embeddedAttachments: templateDocument.attachments,
          onProgress: (event) => emitProgress(options, {
            ...event,
            current: recipient.index + 1,
            telefone: maskPhone(recipient.telefone),
            total: clientes.length,
          }),
          shouldInterrupt: options.shouldInterrupt,
        });
        if (outcome.done && !recipient.logged) {
          recipient.logged = true;
          const sentAt = new Date().toISOString();
          appendLog(paths.sent, [recipient.telefone, recipient.messageContext.hash, sentAt]);
          sentRecords.push({ dataHora: sentAt, mensagemHash: recipient.messageContext.hash, telefone: recipient.telefone });
          status.sent(`Enviado ${maskPhone(recipient.telefone)}`);
          emitProgress(options, { current: recipient.index + 1, message: `Enviado ${maskPhone(recipient.telefone)}`, telefone: maskPhone(recipient.telefone), total: clientes.length, type: "sent" });
          // PRESERVADO: o intervalo RN014 entre destinatarios continua valendo na alternancia.
          const delay = randomDelay();
          status.current(`Aguardando ${Math.round(delay / 1000)}s`);
          emitProgress(options, {
            current: recipient.index + 1,
            message: `Aguardando ${Math.round(delay / 1000)}s`,
            total: clientes.length,
            type: "wait",
          });
          await sleep(delay);
        }
        return outcome;
      } catch (error) {
        recipient.logged = true;
        appendLog(paths.errors, [recipient.telefone, "ERRO_ENVIO", error.message, new Date().toISOString()]);
        status.error(`Erro ${maskPhone(recipient.telefone)}: ${error.message}`);
        emitProgress(options, { current: recipient.index + 1, message: error.message, telefone: maskPhone(recipient.telefone), total: clientes.length, type: "error" });
        return { done: true, pauseAfter: false };
      }
    },
  });
  if (result.interrupted) return { interrupted: true };
  status.finish();
  emitProgress(options, { message: "Processamento concluído.", total: clientes.length, type: "done" });
  return { interrupted: false };
}

async function captureConversationContext(client, chatId, options = {}) {
  const capturedAt = new Date().toISOString();
  if (typeof options.captureConversation === "function") {
    const supplied = await options.captureConversation(chatId, capturedAt);
    return Object.freeze({
      capturedAt,
      lastMessageAt: supplied && supplied.lastMessageAt ? String(supplied.lastMessageAt) : "",
    });
  }
  try {
    if (!client || typeof client.getChatById !== "function") {
      return Object.freeze({ capturedAt, lastMessageAt: "" });
    }
    const chat = await client.getChatById(chatId);
    const messages = chat && typeof chat.fetchMessages === "function"
      ? await chat.fetchMessages({ limit: 1 })
      : [];
    const timestamp = messages && messages[0] && Number(messages[0].timestamp);
    return Object.freeze({
      capturedAt,
      lastMessageAt: Number.isFinite(timestamp) && timestamp > 0
        ? new Date(timestamp * 1000).toISOString()
        : "",
    });
  } catch (error) {
    if (typeof options.onProgress === "function") {
      options.onProgress({
        message: `Histórico da conversa indisponível; contexto congelado sem mensagem anterior: ${error.message}`,
        type: "warning",
      });
    }
    return Object.freeze({ capturedAt, lastMessageAt: "" });
  }
}

function emitProgress(options, event) {
  if (typeof options.onProgress !== "function") {
    return;
  }

  try {
    options.onProgress({
      at: new Date().toISOString(),
      ...event,
    });
  } catch (_) {
    // Progresso da interface não pode interferir na regra de envio.
  }
}

module.exports = {
  captureConversationContext,
  processCampaign,
  validateRuntimeFiles,
};
