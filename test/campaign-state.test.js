// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  acquireCampaign,
  campaignStatePath,
  readCampaignState,
  requestCampaignInterrupt,
  transitionCampaign,
} = require("../src/campaign-state");

test("campanha persiste transições monotônicas e libera exclusividade no terminal", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "whatsend-campaign-"));
  try {
    const acquired = acquireCampaign(root, "sessao A", "chave-1");
    assert.equal(acquired.created, true);
    assert.equal(acquired.state.status, "preparando");
    assert.equal(fs.existsSync(campaignStatePath(root, "sessao A")), true);

    const validating = transitionCampaign(root, acquired.state, "validando");
    const running = transitionCampaign(root, validating, "executando");
    const requested = requestCampaignInterrupt(root, "sessao A");
    assert.equal(requested.status, "interrupcao_solicitada");
    assert.equal(requested.interruptRequested, true);

    const stopping = transitionCampaign(root, requested, "interrompendo");
    const stopped = transitionCampaign(root, stopping, "interrompido");
    assert.equal(stopped.active, false);
    assert.equal(readCampaignState(root, "sessao A").status, "interrompido");

    const next = acquireCampaign(root, "sessao B", "chave-2");
    assert.equal(next.created, true);
  } finally {
    fs.rmSync(root, { force: true, recursive: true });
  }
});

test("campanha ativa rejeita concorrência e reutiliza chave idempotente", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "whatsend-campaign-"));
  try {
    const first = acquireCampaign(root, "sessao", "mesma-chave");
    const repeated = acquireCampaign(root, "sessao", "mesma-chave");
    assert.equal(repeated.created, false);
    assert.equal(repeated.state.id, first.state.id);
    assert.throws(
      () => acquireCampaign(root, "outra", "outra-chave"),
      /já está ativa/u,
    );
  } finally {
    fs.rmSync(root, { force: true, recursive: true });
  }
});
