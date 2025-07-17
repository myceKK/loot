function start() {
  if (Engine && Engine.allInit) {
    const herodata = document.querySelector(".top.positioner .hero-data");
    const rightcol = document.querySelector(
      ".right-column.main-column .inner-wrapper"
    );
    const coords = document.querySelector(".top.positioner .map-data .coords");
    const location = document.querySelector(
      ".top.positioner .map-data .location"
    );
    const mapBall = document.querySelector(".top.positioner .map_ball");
    const goldTip = document.querySelector(".top.positioner .gold-tip");
    const herogold = document.querySelector(".top.positioner .herogold");
    const herogolddifference = document.querySelector(
      ".top.positioner .herogold-difference"
    );
    const creditsTip = document.querySelector(".top.positioner .credits-tip");
    const herocredits = document.querySelector(".top.positioner .herocredits");
    const herocreditsdifference = document.querySelector(
      ".top.positioner .herocredits-difference"
    );
    const bottomPanel = document.querySelector(
      ".bottom-panel-of-bottom-positioner.bottom-panel"
    );
    const hpIndicator = bottomPanel.querySelector(".hp-indicator");
    const hpTip = bottomPanel.querySelector(".hp-indicator-wrapper .glass");
    hpIndicator.querySelector(".blood").setAttribute("bar-horizontal", true);
    hpIndicator.querySelector(".hpp").append(hpTip);
    const expBars = bottomPanel.querySelectorAll(".progress");
    const expPercent = bottomPanel.querySelector(".pointer-exp");
    const expTips = bottomPanel.querySelectorAll(
      ".exp-bar-wrapper .exp-progress"
    );
    const usableSlots = bottomPanel.querySelectorAll(".slots");

    let customLocation = document.createElement("div");
    customLocation.classList.add("custom-location");
    customLocation.append(mapBall);
    customLocation.append(location);

    let creditsAndCords = document.createElement("div");
    creditsAndCords.classList.add("custom-credits");

    let goldImage = document.createElement("img");
    goldImage.src = "https://gordion.margonem.pl/img/currency/goldIcon16.gif";
    goldImage.classList.add("gold-image");
    let goldWrapper = document.createElement("div");
    goldWrapper.classList.add("gold-wrapper");

    goldWrapper.append(goldImage);
    goldWrapper.append(herogold);
    goldWrapper.append(goldTip);
    goldWrapper.append(herogolddifference);

    creditsAndCords.append(goldWrapper);
    creditsAndCords.append(coords);

    let draconiteImage = document.createElement("img");
    draconiteImage.src = "https://www.margonem.pl/_i/pl/draconite_small.gif";
    draconiteImage.classList.add("draconite-image");
    let draconiteWrapper = document.createElement("div");
    draconiteWrapper.classList.add("draconite-wrapper");
    draconiteWrapper.append(draconiteImage);
    draconiteWrapper.append(herocredits);
    draconiteWrapper.append(creditsTip);
    draconiteWrapper.append(herocreditsdifference);

    creditsAndCords.append(draconiteWrapper);

    let customHp = document.createElement("div");
    customHp.classList.add("custom-hp");
    let customHpInner = document.createElement("div");
    customHpInner.classList.add("inner");
    customHp.append(customHpInner);
    customHpInner.append(hpIndicator);

    let customExp = document.createElement("div");
    customExp.classList.add("custom-exp");
    let customExpInner = document.createElement("div");
    customExpInner.classList.add("inner");
    customExp.append(customExpInner);
    expBars.forEach((expBar, i) => {
      customExpInner.append(expBar);
      customExpInner.append(expTips[i]);
    });

    let customExpPercent = document.createElement("div");
    customExpPercent.classList.add("custom-exp-percent");
    customExpPercent.append(expPercent);
    customExpInner.append(customExpPercent);

    let customHudContainer = document.createElement("div");
    customHudContainer.classList.add("custom-hud");
    rightcol.prepend(customHudContainer);

    customHudContainer.append(herodata);
    customHudContainer.append(customLocation);
    customHudContainer.append(creditsAndCords);
    customHudContainer.append(customHp);
    customHudContainer.append(customExp);

    document
      .querySelector(".character_wrapper")
      .append(document.querySelector(".pointer-ttl"));

    var buildList = document.querySelectorAll(".one-handheld-build");
    buildList.forEach((item) =>
      document.querySelector(".main-column.right-column").append(item)
    );

    let cBuild = document.createElement("div");
    cBuild.classList.add("cbuild");
    document.querySelector(".character_wrapper").append(cBuild);
    cBuild.innerHTML = Engine.buildsManager
      .getBuildsCommons()
      .getBuildById(document.querySelector(".choose-build").innerHTML)
      .getName();

    for (let i = 0; i < buildList.length; i++) {
      buildList.item(i).addEventListener("click", function () {
        var activeBuildName = Object.values(
          Engine.buildsManager.getBuildsCommons().getBuildsName()
        )[i].name;
        cBuild.innerHTML = activeBuildName;
      });
    }
  } else {
    setTimeout(() => start(), 50);
  }
}

start();
