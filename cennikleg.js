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
      width: 34px;
      height: 34px;
      position: absolute;
      bottom: 54px;
      left: 1px;
      z-index: 298;
      background: linear-gradient(135deg, #ff9900, #ffcc00);
      padding: 1px;
      border-radius: 4px;
      cursor: pointer;
      pointer-events: initial;
      box-shadow: 0 0 4px rgba(0,0,0,0.5);
    `;

    const img = document.createElement("img");
    img.src = "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gobsamurai.gif";
    img.alt = "Cennik legend";
    img.style.cssText = `
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
      display: block;
      border-radius: 2px;
    `;

    button.appendChild(img);

    button.addEventListener("click", () => {
      window.open("https://mycekk.github.io/loot/", "_blank");
    });

    gameLayer.appendChild(button);
  }, 300);
})();
