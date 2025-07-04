(function () {
  "use strict";

  const interval = setInterval(() => {
    const gameLayer = document.querySelector(".game-layer");
    if (!gameLayer) return;

    clearInterval(interval);

    const button = document.createElement("div");
    button.id = "LegendButton";
    button.textContent = "C";
    button.title = "Cennik legend";
    button.style.cssText = `
      width: 24px;
      height: 24px;
      padding: 4px;
      position: absolute;
      bottom: 40px;
      left: 1px;
      z-index: 297;
      background: linear-gradient(135deg, red, orange, yellow, green, cyan, blue, violet);
      border: 1px solid #333;
      opacity: 0.95;
      color: white;
      text-align: center;
      cursor: pointer;
      font-family: sans-serif;
      font-size: 14px;
      line-height: 24px;
      font-weight: bold;
      border-radius: 4px;
      pointer-events: initial;
      transition: transform 0.2s ease;
    `;

    button.addEventListener("mouseover", () => {
      button.style.transform = "scale(1.1)";
    });

    button.addEventListener("mouseout", () => {
      button.style.transform = "scale(1)";
    });

    button.addEventListener("click", () => {
      window.open("https://mycekk.github.io/loot/", "_blank");
    });

    gameLayer.appendChild(button);
  }, 300);
})();
