// Autor: JeanCarloEM.com
// Site do Autor: https://jeancarloem.com
// Licenca: Mozilla Public License 2.0
// Site da Licenca: https://www.mozilla.org/MPL/2.0/
// Resumo da Licenca: uso, copia, modificacao e distribuicao permitidos conforme os termos da MPL-2.0.
// Disclaimer: fornecido "AS IS", sem garantias de qualquer tipo.

const GUI_HINT_RUNTIME = String.raw`
let activeHintTarget = null;

function hideGuiTooltip(target) {
  if (target && activeHintTarget !== target) return;
  activeHintTarget = null;
  guiTooltip.hidden = true;
  guiTooltip.textContent = "";
}

function showGuiTooltip(target) {
  const content = target && target.getAttribute("data-hint");
  if (!content) return;

  activeHintTarget = target;
  guiTooltip.textContent = content;
  guiTooltip.hidden = false;
  guiTooltip.dataset.placement = "top";

  const margin = 8;
  const gap = 10;
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = guiTooltip.getBoundingClientRect();
  const left = Math.max(
    margin,
    Math.min(
      targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
      window.innerWidth - tooltipRect.width - margin,
    ),
  );
  let top = targetRect.top - tooltipRect.height - gap;

  if (top < margin) {
    top = Math.min(
      window.innerHeight - tooltipRect.height - margin,
      targetRect.bottom + gap,
    );
    guiTooltip.dataset.placement = "bottom";
  }

  guiTooltip.style.left = left + "px";
  guiTooltip.style.top = Math.max(margin, top) + "px";
}

document.addEventListener("pointerover", (event) => {
  const target = event.target.closest && event.target.closest("[data-hint]");
  if (target && !target.contains(event.relatedTarget)) showGuiTooltip(target);
});
document.addEventListener("pointerout", (event) => {
  const target = event.target.closest && event.target.closest("[data-hint]");
  if (target && !target.contains(event.relatedTarget)) hideGuiTooltip(target);
});
document.addEventListener("focusin", (event) => {
  const target = event.target.closest && event.target.closest("[data-hint]");
  if (target) showGuiTooltip(target);
});
document.addEventListener("focusout", (event) => {
  const target = event.target.closest && event.target.closest("[data-hint]");
  if (target) hideGuiTooltip(target);
});
window.addEventListener("resize", () => hideGuiTooltip());
window.addEventListener("scroll", () => hideGuiTooltip(), true);
`;

function renderGuiHintRuntime() {
  return GUI_HINT_RUNTIME;
}

module.exports = {
  GUI_HINT_RUNTIME,
  renderGuiHintRuntime,
};
