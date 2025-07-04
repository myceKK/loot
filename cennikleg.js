(function () {
  "use strict";

  const ZOOM = 0.85;

  const interval = setInterval(() => {
    const gameLayer = document.querySelector(".game-layer");
    if (!gameLayer) return;
    clearInterval(interval);

    // Stwórz goblinowy guzik
    const goblinButton = document.createElement("div");
    goblinButton.id = "cennik-legend-btn";
    goblinButton.title = "Cennik legend";
    goblinButton.style.cssText = `
      width: 34px;
      height: 34px;
      position: absolute;
      bottom: 1px;
      left: 1px;
      z-index: 296;
      cursor: pointer;
      pointer-events: initial;
      background: linear-gradient(135deg,rgb(139, 192, 159),rgb(168, 60, 118));
      border-radius: 4px;
      padding: 2px;
      box-sizing: border-box;
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

    // Funkcje otwierania / zamykania okna
    const closeWindow = () => {
      const w = document.getElementById("cennik-legend-okno");
      if (w) {
        w.remove();
        document.removeEventListener("keydown", escHandler);
      }
    };
    const escHandler = (e) => {
      if (e.key === "Escape") closeWindow();
    };
    const toggleWindow = () => {
      if (document.getElementById("cennik-legend-okno")) {
        closeWindow();
      } else {
        openWindow();
      }
    };

    goblinButton.addEventListener("click", toggleWindow);
    gameLayer.appendChild(goblinButton);

    // Budowa samego okna
    function openWindow() {
      const win = document.createElement("div");
      win.id = "cennik-legend-okno";
      win.style.cssText = `
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%,-50%);
        width: 90vw; height: 85vh;
        max-width: 1000px; max-height: 750px;
        background: #000;
        border: 2px solid #333;
        border-radius: 8px;
        box-shadow: 0 0 12px rgba(0,0,0,0.7);
        display: flex; flex-direction: column;
        overflow: hidden;
        z-index: 999;
      `;

      // przycisk zamykania
      const x = document.createElement("div");
      x.innerText = "✕";
      x.style.cssText = `
        position: absolute;
        top: 8px;
        right: 32px;    
        cursor: pointer;
        color: #fff;
        font-size: 20px;
        z-index: 1000;
      `;
      x.onclick = closeWindow;
      win.appendChild(x);

      // wrapper do scrolla pionowego
      const wrap = document.createElement("div");
      wrap.style.cssText = `
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        width: 100%; height: 100%;
      `;
      // iframe z zoomem
      const iframe = document.createElement("iframe");
      iframe.src = "https://mycekk.github.io/loot/";
      iframe.style.cssText = `
        width: 100%; height: 100%;
        border: none;
        zoom: ${ZOOM};
        display: block;
      `;
      wrap.appendChild(iframe);
      win.appendChild(wrap);

      document.body.appendChild(win);
      document.addEventListener("keydown", escHandler);
    }
  }, 300);
})();
