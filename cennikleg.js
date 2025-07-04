(function () {
  "use strict";

  const interval = setInterval(() => {
    const gameLayer = document.querySelector(".game-layer");
    if (!gameLayer) return;

    clearInterval(interval);

    // GOBLIN BUTTON (Cennik legend)
    const goblinButton = document.createElement("div");
    goblinButton.title = "Cennik legend";
    goblinButton.style.cssText = `
      width: 34px;
      height: 34px;
      position: absolute;
      bottom: 26px; /* niżej niż C */
      left: 1px;
      z-index: 298;
      cursor: pointer;
      pointer-events: initial;
    `;

    const goblinImg = document.createElement("img");
    goblinImg.src =
      "https://micc.garmory-cdn.cloud/obrazki/npc/e2/gobsamurai.gif";
    goblinImg.alt = "Cennik legend";
    goblinImg.style.cssText = `
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
      display: block;
      border-radius: 2px;
    `;

    goblinButton.appendChild(goblinImg);
    goblinButton.addEventListener("click", () => {
      window.open("https://mycekk.github.io/loot/", "_blank");
    });

    gameLayer.appendChild(goblinButton);
  }, 300);
})();
