// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

async function runRecipientScheduler(recipients, options = {}) {
  const groupSize = clampInteger(options.groupSize, 1, options.maxGroupSize || 25, 2);
  const itemsPerTurn = clampInteger(options.itemsPerTurn, 1, 100, 1);
  const delayMs = options.delayEnabled ? Math.max(0, Number(options.delayMs) || 0) : 0;
  const sleep = options.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const now = options.now || Date.now;
  const results = [];

  for (let offset = 0; offset < recipients.length; offset += groupSize) {
    const group = recipients.slice(offset, offset + groupSize).map((recipient) => ({
      ...recipient,
      done: Boolean(recipient.done),
      nextEligibleAt: Number(recipient.nextEligibleAt || 0),
    }));
    while (group.some((recipient) => !recipient.done)) {
      for (const recipient of group) {
        if (recipient.done) continue;
        if (typeof options.shouldInterrupt === "function" && options.shouldInterrupt()) {
          return { interrupted: true, recipients: results.concat(group) };
        }
        const remaining = recipient.nextEligibleAt - now();
        if (remaining > 0) await sleep(remaining);
        for (let item = 0; item < itemsPerTurn && !recipient.done; item += 1) {
          if (typeof options.shouldInterrupt === "function" && options.shouldInterrupt()) {
            return { interrupted: true, recipients: results.concat(group) };
          }
          const outcome = await options.sendNext(recipient);
          recipient.done = Boolean(outcome && outcome.done);
          recipient.nextEligibleAt = delayMs > 0 ? now() + delayMs : 0;
          if (outcome && outcome.pauseAfter) break;
        }
      }
    }
    results.push(...group);
  }
  return { interrupted: false, recipients: results };
}

function clampInteger(value, min, max, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isInteger(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

module.exports = { runRecipientScheduler };
