(function () {
  "use strict";

  const interval = setInterval(() => {
    const gameLayer = document.querySelector(".game-layer");
    if (!gameLayer) return;

    clearInterval(interval);

    const button = document.createElement("div");
    button.id = "LegendButton";
    button.title = "Cennik legend";
    button.style.cssText = `
      width: 32px;
      height: 32px;
      position: absolute;
      bottom: 40px;
      left: 1px;
      z-index: 297;
      background: transparent;
      cursor: pointer;
      pointer-events: initial;
    `;

    const img = document.createElement("img");
    img.src = "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gobsamurai.gif";
    img.alt = "Cennik legend";
    img.style.cssText = `
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
      display: block;
    `;

    button.appendChild(img);

    button.addEventListener("click", () => {
      window.open("https://mycekk.github.io/loot/", "_blank");
    });

    gameLayer.appendChild(button);
  }, 300);
})();
