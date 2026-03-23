const state = {
  route: "elite2",
  q: "",
  sort: "level_asc",
  allowEditing: false,
  editPrices: false,
  config: null,
  items: [],
  baseItems: [],
  monsters: [],
  itemsById: new Map(),
  monstersByType: { elite2: [], heros: [] },
  localPriceOverrides: {}
};

const LS_PRICES_KEY = "margo_cennik_price_overrides_v1";

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function getCurrencyMode() {
  const raw = String(state?.config?.currency ?? "").trim().toLowerCase();
  if (!raw) return "fixed";
  if (raw === "auto") return "auto";
  return "fixed";
}

function getCurrencyLabel() {
  const mode = getCurrencyMode();
  const raw = String(state?.config?.currency ?? "").trim();
  if (!raw) return "";
  if (mode === "auto") return "m/g";
  return raw;
}

function getAutoCurrencySuffix(num) {
  // 100/200/300… to `m`, a 1.1/1.2/2.1… to `g`
  if (num === 1) return "g";
  return Number.isInteger(num) ? "m" : "g";
}

function parsePriceNumber(value) {
  if (value === null || value === undefined || value === "") return Number.NaN;
  if (typeof value === "number") return value;
  const raw = String(value).trim().toLowerCase().replaceAll(" ", "");
  const m = raw.match(/^(-?\d+(?:[\.,]\d+)?)([mg])$/);
  if (m) return Number(m[1].replace(",", "."));
  return Number(raw.replace(",", "."));
}

function parsePriceInput(raw) {
  const cleaned = String(raw ?? "").trim();
  if (cleaned === "") return null;

  const compact = cleaned.replaceAll(" ", "").toLowerCase();
  const m = compact.match(/^(-?\d+(?:[\.,]\d+)?)([mg])$/);
  if (m) {
    const num = m[1].replace(",", ".");
    return `${num}${m[2]}`;
  }

  const num = Number(compact.replace(",", "."));
  if (Number.isNaN(num)) return undefined;
  return num;
}
function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "-";

  // Jeśli użytkownik wpisał jawnie `m`/`g`, wyświetl dokładnie w tej walucie.
  if (typeof value === "string") {
    const compact = value.trim().replaceAll(" ", "").toLowerCase();
    const m = compact.match(/^(-?\d+(?:[\.,]\d+)?)([mg])$/);
    if (m) {
      const num = Number(m[1].replace(",", "."));
      if (!Number.isNaN(num)) return `${num.toLocaleString("pl-PL")} ${m[2]}`;
    }
  }

  const num = parsePriceNumber(value);
  if (Number.isNaN(num)) {
    const currencyMode = getCurrencyMode();
    const currency = currencyMode === "auto" ? "" : (state?.config?.currency ?? "");
    return `${escapeHtml(String(value))}${currency ? ` ${currency}` : ""}`;
  }

  const currencyMode = getCurrencyMode();
  const currency = currencyMode === "auto" ? "" : (state?.config?.currency ?? "");
  const suffix = currencyMode === "auto" ? getAutoCurrencySuffix(num) : currency;
  return `${num.toLocaleString("pl-PL")}${suffix ? ` ${suffix}` : ""}`;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function loadLocalPriceOverrides() {
  const raw = localStorage.getItem(LS_PRICES_KEY);
  const parsed = raw ? safeJsonParse(raw) : null;
  if (!parsed || typeof parsed !== "object") return {};
  return parsed;
}

function saveLocalPriceOverrides(overrides) {
  localStorage.setItem(LS_PRICES_KEY, JSON.stringify(overrides));
}

function applyPriceOverridesToItems() {
  const overrides = state.localPriceOverrides || {};
  for (const it of state.items) {
    if (!it?.id) continue;
    if (Object.prototype.hasOwnProperty.call(overrides, it.id)) {
      it.price = overrides[it.id];
    }
  }
}

function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getRouteFromHash() {
  const raw = (location.hash || "#elite2").slice(1).trim();
  if (raw === "heros" || raw === "elite2") return raw;
  return "elite2";
}

function setActiveTab(route) {
  for (const id of ["elite2", "heros"]) {
    const el = document.getElementById(`tab-${id}`);
    if (!el) continue;
    el.classList.toggle("active", id === route);
  }
}

function itemLabel(itemId) {
  const item = state.itemsById.get(itemId);
  return item?.name ?? `(brak itemu: ${itemId})`;
}

function itemPrice(itemId) {
  const item = state.itemsById.get(itemId);
  return item?.price ?? null;
}

function isLegendaryItem(itemId) {
  const item = state.itemsById.get(itemId);
  if (!item) return false;
  return item.legendary === true;
}

function isIncludedItem(itemId) {
  const item = state.itemsById.get(itemId);
  if (!item) return false;
  return item.included === true;
}

function isAllowedItem(itemId) {
  const legendaryOnly = state?.config?.legendaryOnly === true;
  if (!legendaryOnly) return true;
  const includeNonLegendary = state?.config?.includeNonLegendary === true;
  return isLegendaryItem(itemId) || (includeNonLegendary && isIncludedItem(itemId));
}

function getEffectiveDrops(monster) {
  const dropsRaw = monster?.drops ?? [];
  return dropsRaw.filter((d) => isAllowedItem(d.itemId));
}

function monsterLegendDropCount(monster) {
  // Liczba legend w dropach, niezależnie od legendaryOnly w configu
  return (monster?.drops ?? []).filter((d) => isLegendaryItem(d.itemId)).length;
}

function monsterValueSum(monster) {
  // Suma cen dropów (effective, czyli wg legendaryOnly).
  const drops = getEffectiveDrops(monster);
  let sum = 0;
  for (const d of drops) {
    const p = itemPrice(d.itemId);
    const n = parsePriceNumber(p);
    if (!Number.isNaN(n)) sum += n;
  }
  return sum;
}

function monsterMatchesQuery(monster, qNorm) {
  if (!qNorm) return true;
  if (normalize(monster.name).includes(qNorm)) return true;
  if (normalize(monster.location).includes(qNorm)) return true;
  for (const drop of getEffectiveDrops(monster)) {
    const name = itemLabel(drop.itemId);
    if (normalize(name).includes(qNorm)) return true;
  }
  return false;
}

function sortMonsters(monsters) {
  const sort = state.sort;
  const copy = [...monsters];
  copy.sort((a, b) => {
    if (sort === "level_desc") return (b.level ?? 0) - (a.level ?? 0) || a.name.localeCompare(b.name, "pl");
    if (sort === "level_asc") return (a.level ?? 0) - (b.level ?? 0) || a.name.localeCompare(b.name, "pl");
    if (sort === "drops_desc") {
      return getEffectiveDrops(b).length - getEffectiveDrops(a).length || a.name.localeCompare(b.name, "pl");
    }
    if (sort === "legend_drops_desc") {
      return monsterLegendDropCount(b) - monsterLegendDropCount(a) || a.name.localeCompare(b.name, "pl");
    }
    if (sort === "value_desc") {
      return monsterValueSum(b) - monsterValueSum(a) || a.name.localeCompare(b.name, "pl");
    }
    if (sort === "value_asc") {
      return monsterValueSum(a) - monsterValueSum(b) || a.name.localeCompare(b.name, "pl");
    }
    return a.name.localeCompare(b.name, "pl");
  });
  return copy;
}

function renderMonsterCard(monster) {
  const metaParts = [
    monster.level ? `Lvl: ${escapeHtml(monster.level)}` : null
  ].filter(Boolean);

  const legendaryOnly = state?.config?.legendaryOnly === true;
  const drops = getEffectiveDrops(monster);
  const dropsHtml =
    drops.length === 0
      ? `<div class="empty">${legendaryOnly ? "Brak legendarnych dropów w danych." : "Brak dropów w danych."}</div>`
      : `<div class="dropList">
          ${drops
            .map((drop) => {
              const item = state.itemsById.get(drop.itemId);
              const name = item?.name ?? `(brak w data/items.json: ${drop.itemId})`;
              const note = drop.note || item?.note || "";
              const priceValue = item?.price ?? "";
              const canEdit = state.allowEditing && state.editPrices;
              return `<div class="dropRow">
                <div class="dropName">
                  ${item?.imageUrl ? `<img class="itemImg" src="${escapeHtml(item.imageUrl)}" alt="" loading="lazy" />` : ""}
                  <strong>${escapeHtml(name)}</strong>
                  ${note ? `<div class="dropNote">${escapeHtml(note)}</div>` : ""}
                </div>
                <div class="price">
                  ${
                    canEdit
                      ? `<input class="priceInput" inputmode="decimal" pattern="[0-9]+([\\.,][0-9]+)?[mMgG]?" data-item-id="${escapeHtml(
                          drop.itemId
                        )}" value="${escapeHtml(priceValue === null ? "" : String(priceValue))}" placeholder="np. 200m albo 1.2g" />`
                      : `${formatPrice(item?.price)}`
                  }
                </div>
              </div>`;
            })
            .join("")}
        </div>`;

  return `<article class="card">
    <div class="cardHeader">
      <div class="cardHeaderLeft">
        ${monster.imageUrl ? `<img class="npcImg" src="${escapeHtml(monster.imageUrl)}" alt="" loading="lazy" />` : ""}
        <h3 class="cardTitle">${escapeHtml(monster.name)}</h3>
        <div class="cardMeta">${metaParts.map((p) => `<span>${p}</span>`).join("")}</div>
      </div>
    </div>
    <div class="cardBody">
      ${dropsHtml}
    </div>
  </article>`;
}

function renderMonsters(route) {
  const qNorm = normalize(state.q);
  const list = state.monstersByType[route] ?? [];
  const filtered = sortMonsters(list.filter((m) => monsterMatchesQuery(m, qNorm)));

  if (filtered.length === 0) {
    return `<div class="empty">Brak wyników dla <code>${escapeHtml(state.q)}</code>.</div>`;
  }

  return `<div class="grid">${filtered.map(renderMonsterCard).join("")}</div>`;
}

function buildItemUsageIndex() {
  const usage = new Map(); // itemId -> Set(monsterId)
  for (const m of state.monsters) {
    for (const d of m.drops ?? []) {
      if (!usage.has(d.itemId)) usage.set(d.itemId, new Set());
      usage.get(d.itemId).add(m.id);
    }
  }
  return usage;
}

function render() {
  state.route = getRouteFromHash();
  setActiveTab(state.route);

  const content = document.getElementById("content");
  if (!content) return;

  content.innerHTML = renderMonsters(state.route);
}

async function loadJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Nie udało się pobrać ${path} (HTTP ${res.status})`);
  return res.json();
}

async function loadJsonOptional(path) {
  try {
    return await loadJson(path);
  } catch {
    return null;
  }
}

function indexData() {
  state.itemsById = new Map(state.items.map((it) => [it.id, it]));
  state.monstersByType = { elite2: [], heros: [] };
  for (const m of state.monsters) {
    if (m.type === "elite2") state.monstersByType.elite2.push(m);
    else if (m.type === "heros") state.monstersByType.heros.push(m);
  }
}

function applyConfigToUi() {
  const title = state?.config?.title || "Cennik klanowy";
  const subtitle = state?.config?.subtitle || "";
  document.title = title;

  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) pageTitle.textContent = title;

  const pageSubtitle = document.getElementById("pageSubtitle");
  if (pageSubtitle && !pageSubtitle.hasAttribute("hidden")) pageSubtitle.textContent = subtitle;

  const updatedAt = document.getElementById("updatedAt");
  if (updatedAt && !updatedAt.hasAttribute("hidden")) {
    updatedAt.textContent = `Aktualizacja: ${state?.config?.updatedAt ?? "—"}`;
  }

  const currencyPill = document.getElementById("currencyPill");
  if (currencyPill && !currencyPill.hasAttribute("hidden")) {
    currencyPill.textContent = `Waluta: ${getCurrencyLabel() || "—"}`;
  }
}

function wireUi() {
  const search = document.getElementById("search");
  if (search) {
    search.addEventListener("input", (e) => {
      state.q = e.target.value || "";
      render();
    });
  }

  const sort = document.getElementById("sort");
  if (sort) {
    sort.addEventListener("change", (e) => {
      state.sort = e.target.value || "name";
      render();
    });
  }

  const editPrices = document.getElementById("editPrices");
  if (editPrices) {
    state.allowEditing = true;
    editPrices.addEventListener("change", (e) => {
      state.editPrices = Boolean(e.target.checked);
      render();
    });
  }

  const content = document.getElementById("content");
  if (content) {
    content.addEventListener("input", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement)) return;
      if (!t.classList.contains("priceInput")) return;
      const itemId = t.dataset.itemId || "";
      if (!itemId) return;
      const raw = String(t.value ?? "").trim();
      const parsed = parsePriceInput(raw);
      if (raw !== "" && parsed === undefined) return;

      state.localPriceOverrides[itemId] = parsed;
      saveLocalPriceOverrides(state.localPriceOverrides);

      const item = state.itemsById.get(itemId);
      if (item) item.price = parsed;
    });
  }

  const exportPrices = document.getElementById("exportPrices");
  if (exportPrices) {
    exportPrices.addEventListener("click", () => {
      const prices = {};
      for (const it of state.items) {
        if (!it?.id) continue;
        if (it.price === null || it.price === undefined || it.price === "") continue;
        prices[it.id] = it.price;
      }
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        currency: getCurrencyLabel(),
        prices
      };
      downloadJson("prices.json", payload);
    });
  }

  const exportItems = document.getElementById("exportItems");
  if (exportItems) {
    exportItems.addEventListener("click", () => {
      downloadJson("items.json", { items: state.items });
    });
  }

  const clearLocalPrices = document.getElementById("clearLocalPrices");
  if (clearLocalPrices) {
    clearLocalPrices.addEventListener("click", () => {
      localStorage.removeItem(LS_PRICES_KEY);
      state.localPriceOverrides = {};
      // reset do bazowych itemów z pliku
      state.items = state.baseItems.map((x) => ({ ...x }));
      applyPriceOverridesToItems();
      indexData();
      render();
    });
  }

  window.addEventListener("hashchange", () => render());
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function init() {
  try {
    const [itemsJson, monstersJson, config] = await Promise.all([
      loadJson("data/items.json"),
      loadJson("data/monsters.json"),
      loadJsonOptional("data/config.json")
    ]);

    state.config = config || {};
    state.items = itemsJson.items ?? [];
    state.baseItems = state.items.map((x) => ({ ...x }));
    state.monsters = monstersJson.monsters ?? [];
    state.localPriceOverrides = loadLocalPriceOverrides();
    // Domyślnie brak edycji na publicznej stronie; w edytorze włączy się w wireUi().
    state.allowEditing = false;
    applyPriceOverridesToItems();
    indexData();
    applyConfigToUi();
    wireUi();
    render();
  } catch (err) {
    const content = document.getElementById("content");
    if (content) {
      content.innerHTML = `<div class="empty">
        <div><strong>Nie udało się uruchomić strony.</strong></div>
        <div class="muted" style="margin-top:6px;">${escapeHtml(err?.message || String(err))}</div>
        <div class="muted" style="margin-top:10px;">
          Jeśli otwierasz plik lokalnie (bez serwera), uruchom prosty serwer HTTP (np. VS Code Live Server) albo wrzuć na GitHub Pages.
        </div>
      </div>`;
    }
    console.error(err);
  }
}

init();
