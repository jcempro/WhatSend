// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const assert = require("node:assert/strict");
const test = require("node:test");

const { createRenderedSendCursor } = require("../src/media");
const { runRecipientScheduler } = require("../src/recipient-scheduler");

test("cursor remove $pause$ e preserva postagem e ordem de itens", () => {
  const cursor = createRenderedSendCursor("um$postagem$dois\n$pause$\ntres");
  assert.deepEqual(cursor.items.map((item) => item.value), ["um", "dois", "tres"]);
  assert.equal(cursor.items[1].pauseAfter, true);
  assert.equal(cursor.items.some((item) => String(item.value).includes("$pause$")), false);
});

test("escalonador alterna grupos e respeita itens por turno", async () => {
  const order = [];
  const recipients = ["a", "b", "c"].map((id) => ({ id, remaining: 2 }));
  const result = await runRecipientScheduler(recipients, {
    groupSize: 2,
    itemsPerTurn: 1,
    maxGroupSize: 25,
    sendNext: async (recipient) => {
      order.push(recipient.id);
      recipient.remaining -= 1;
      return { done: recipient.remaining === 0 };
    },
  });
  assert.equal(result.interrupted, false);
  assert.deepEqual(order, ["a", "b", "a", "b", "c", "c"]);
});

test("atraso é calculado por conversa e tempo de outros turnos abate o restante", async () => {
  let clock = 0;
  const waits = [];
  const recipients = ["a", "b"].map((id) => ({ id, remaining: 2 }));
  await runRecipientScheduler(recipients, {
    delayEnabled: true,
    delayMs: 100,
    groupSize: 2,
    itemsPerTurn: 1,
    maxGroupSize: 25,
    now: () => clock,
    sleep: async (ms) => { waits.push(ms); clock += ms; },
    sendNext: async (recipient) => {
      recipient.remaining -= 1;
      clock += 30;
      return { done: recipient.remaining === 0 };
    },
  });
  assert.deepEqual(waits, [70]);
});
