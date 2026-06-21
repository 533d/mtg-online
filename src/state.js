const channel = "BroadcastChannel" in window ? new BroadcastChannel("mtg-online-table") : null;
const pendingCardFetches = new Set();
let hydrateCatalogRunning = false;
let syncingRemote = false;
let battlefieldResizeObserver = null;
let activeTable = null;
let activeTablePassword = "";
let tablePollTimer = null;
let tableHeartbeatTimer = null;
let tableEventSource = null;
let publishInFlight = false;
let pendingPublish = false;
const clientId = loadClientId();
const syncState = {
  status: "connecting",
  lastOkAt: null,
};

const sampleCatalog = {
  Island: {
    name: "Island",
    typeLine: "Basic Land - Island",
    image: "",
  },
  Mountain: {
    name: "Mountain",
    typeLine: "Basic Land - Mountain",
    image: "",
  },
  Opt: {
    name: "Opt",
    typeLine: "Instant",
    image: "",
  },
  "Lightning Bolt": {
    name: "Lightning Bolt",
    typeLine: "Instant",
    image: "",
  },
  Counterspell: {
    name: "Counterspell",
    typeLine: "Instant",
    image: "",
  },
  "Snapcaster Mage": {
    name: "Snapcaster Mage",
    typeLine: "Creature - Human Wizard",
    image: "",
  },
  "Delver of Secrets": {
    name: "Delver of Secrets",
    typeLine: "Creature - Human Wizard",
    image: "",
  },
  Ponder: {
    name: "Ponder",
    typeLine: "Sorcery",
    image: "",
  },
  Consider: {
    name: "Consider",
    typeLine: "Instant",
    image: "",
  },
  "Serum Visions": {
    name: "Serum Visions",
    typeLine: "Sorcery",
    image: "",
  },
  "Young Pyromancer": {
    name: "Young Pyromancer",
    typeLine: "Creature - Human Shaman",
    image: "",
  },
  "Sprite Dragon": {
    name: "Sprite Dragon",
    typeLine: "Creature - Faerie Dragon",
    image: "",
  },
  "Steam Vents": {
    name: "Steam Vents",
    typeLine: "Land - Island Mountain",
    image: "",
  },
  "Sulfur Falls": {
    name: "Sulfur Falls",
    typeLine: "Land",
    image: "",
  },
};

const els = {
  lobby: document.querySelector("#lobby"),
  app: document.querySelector("#app"),
  createTableForm: document.querySelector("#createTableForm"),
  createTableId: document.querySelector("#createTableId"),
  createTablePassword: document.querySelector("#createTablePassword"),
  searchTableForm: document.querySelector("#searchTableForm"),
  tableSearchInput: document.querySelector("#tableSearchInput"),
  refreshTables: document.querySelector("#refreshTables"),
  lobbyMessage: document.querySelector("#lobbyMessage"),
  tableList: document.querySelector("#tableList"),
  seatToggle: document.querySelector("#seatToggle"),
  tableTimer: document.querySelector("#tableTimer"),
  timerToggle: document.querySelector("#timerToggle"),
  timerReset: document.querySelector("#timerReset"),
  syncStatus: document.querySelector("#syncStatus"),
  flipCoin: document.querySelector("#flipCoin"),
  rollD6: document.querySelector("#rollD6"),
  rollD20: document.querySelector("#rollD20"),
  resetGame: document.querySelector("#resetGame"),
  leaveTable: document.querySelector("#leaveTable"),
  deckImport: document.querySelector("#deckImport"),
  importDeckTop: document.querySelector("#importDeckTop"),
  lookupInput: document.querySelector("#lookupInput"),
  lookupButton: document.querySelector("#lookupButton"),
  lookupOutput: document.querySelector("#lookupOutput"),
  opponentArea: document.querySelector("#opponentArea"),
  battlefieldArea: document.querySelector("#battlefieldArea"),
  selfArea: document.querySelector("#selfArea"),
  logPanel: document.querySelector("#logPanel"),
  zoneDialog: document.querySelector("#zoneDialog"),
  zoneTitle: document.querySelector("#zoneTitle"),
  zoneMeta: document.querySelector("#zoneMeta"),
  zoneCards: document.querySelector("#zoneCards"),
  closeZone: document.querySelector("#closeZone"),
  cardDialog: document.querySelector("#cardDialog"),
  cardDetail: document.querySelector("#cardDetail"),
  libraryMoveDialog: document.querySelector("#libraryMoveDialog"),
  libraryMoveTitle: document.querySelector("#libraryMoveTitle"),
  libraryMoveMeta: document.querySelector("#libraryMoveMeta"),
};

function opponentOf(playerId) {
  return playerId === "p1" ? "p2" : "p1";
}

function normalizeSeat(value) {
  return SEAT_ORDER.includes(value) ? value : "p1";
}

function seatDisplayName(playerId) {
  if (playerId === "spectator") return SEAT_LABELS.spectator;
  return state.players?.[playerId]?.name || SEAT_LABELS[playerId] || SEAT_LABELS.p1;
}

function updateSeatToggle() {
  if (els.seatToggle) {
    els.seatToggle.textContent = `视角：${seatDisplayName(seat)}`;
  }
}

function visibleSeat() {
  return seat === "p2" ? "p2" : "p1";
}

let state = makeInitialState();
localStorage.removeItem("mtg-online-seat");
let seat = normalizeSeat(sessionStorage.getItem("mtg-online-seat"));
let lookupCardDetail = null;
let cardDetailState = null;
let cardDetailRequestId = 0;
const chineseDetailCache = new Map();
const playerPanelOpen = { p1: true, p2: true };
const playerPanelPositions = loadPanelPositions();
const markerToolbarState = loadMarkerToolbarState();
const handLayoutVars = new Map();
updateSeatToggle();

function makeInitialState() {
  return {
    version: STATE_VERSION,
    updatedAt: Date.now(),
    timer: makeTimerState(),
    catalog: { ...sampleCatalog },
    log: ["牌桌已创建"],
    players: {
      p1: makePlayer("P1"),
      p2: makePlayer("P2"),
    },
  };
}

function makePlayer(name) {
  return {
    name,
    life: 20,
    library: [],
    extraDeck: [],
    hand: [],
    deckList: [],
    battlefield: makeBattlefield(),
    graveyard: [],
    exile: [],
    mana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
  };
}

function buildDeck(list) {
  return list.flatMap(([name, count]) =>
    Array.from({ length: count }, () => ({
      id: makeId(),
      cardKey: name,
      tapped: false,
    })),
  );
}

function makeBattlefield() {
  return { cards: [], annotations: [] };
}

function makeTimerState() {
  return { elapsedMs: 0, running: false, startedAt: null };
}

function loadClientId() {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const next = makeId();
  localStorage.setItem(CLIENT_ID_KEY, next);
  return next;
}

function makeId() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10).join(""),
    ].join("-");
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function tableStorageKey(tableId = activeTable?.id) {
  return tableId ? `${STORAGE_KEY}:${tableId}` : STORAGE_KEY;
}

function loadLastTables() {
  try {
    const value = JSON.parse(localStorage.getItem(LAST_TABLES_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value
      .map((entry) => (typeof entry === "string" ? { id: entry } : entry))
      .filter((entry) => entry?.id)
      .map((entry) => ({ id: String(entry.id), at: Number(entry.at) || 0 }));
  } catch {
    return [];
  }
}

function saveLastTables(entries) {
  localStorage.setItem(LAST_TABLES_KEY, JSON.stringify(entries.slice(0, 12)));
}

function markLastTable(tableId) {
  const id = String(tableId || "").trim();
  if (!id) return;
  const next = [{ id, at: Date.now() }, ...loadLastTables().filter((entry) => entry.id !== id)];
  saveLastTables(next);
}

function isLastPlayedTable(tableId) {
  return loadLastTables().some((entry) => entry.id === tableId);
}

function loadPanelPositions() {
  try {
    sessionStorage.removeItem("mtg-online-panel-positions-v1");
    const positions = JSON.parse(sessionStorage.getItem(PANEL_POSITION_KEY) || "{}");
    return positions && typeof positions === "object" ? positions : {};
  } catch {
    return {};
  }
}

function savePanelPositions() {
  sessionStorage.setItem(PANEL_POSITION_KEY, JSON.stringify(playerPanelPositions));
}

function resetPanelPositions() {
  Object.keys(playerPanelPositions).forEach((playerId) => delete playerPanelPositions[playerId]);
  sessionStorage.removeItem(PANEL_POSITION_KEY);
}

function loadMarkerToolbarState() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(MARKER_TOOLBAR_KEY) || "{}");
    return {
      kind: normalizeMarkerKind(stored.kind),
      color: sanitizeMarkerColor(stored.color),
    };
  } catch {
    return {
      kind: "energy",
      color: "#f0c15a",
    };
  }
}

function saveMarkerToolbarState() {
  sessionStorage.setItem(MARKER_TOOLBAR_KEY, JSON.stringify(markerToolbarState));
}

function normalizeTimerState(timer) {
  if (!timer || typeof timer !== "object") return makeTimerState();
  const elapsedMs = Math.max(0, Number(timer.elapsedMs) || 0);
  const startedAt = Number(timer.startedAt);
  return {
    elapsedMs,
    running: Boolean(timer.running) && Number.isFinite(startedAt),
    startedAt: Number.isFinite(startedAt) ? startedAt : null,
  };
}

function currentTimerMs(timer = state.timer) {
  const normalized = normalizeTimerState(timer);
  if (!normalized.running) return normalized.elapsedMs;
  return normalized.elapsedMs + Math.max(0, Date.now() - normalized.startedAt);
}

function formatTimer(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function migrateState(loaded) {
  if (!loaded || !loaded.players) return makeInitialState();
  const previousVersion = Number(loaded.version) || 0;
  loaded.players.p1 = normalizePlayerState(loaded.players.p1, "P1");
  loaded.players.p2 = normalizePlayerState(loaded.players.p2, "P2");
  if (previousVersion < 19) {
    if (loaded.players.p1.name === "玩家一") loaded.players.p1.name = "P1";
    if (loaded.players.p2.name === "玩家二") loaded.players.p2.name = "P2";
  }
  loaded.catalog = normalizeCatalog(loaded.catalog);
  if (previousVersion < 16) {
    loaded.catalog = resetCatalogForEnglishImages(loaded.catalog);
  }
  if (previousVersion < 13) {
    loaded.catalog = resetMismatchedCatalogEntries(loaded.catalog);
  }
  loaded.log = Array.isArray(loaded.log) ? loaded.log : [];
  loaded.timer = normalizeTimerState(loaded.timer);
  if (loaded.version !== STATE_VERSION) {
    loaded.version = STATE_VERSION;
  }
  Object.values(loaded.players).forEach((player) => {
    player.battlefield = normalizeBattlefield(player.battlefield);
    if (previousVersion < 9) {
      player.battlefield.height = undefined;
    }
    if (previousVersion < 12 && shouldResetLegacyBattlefieldHeight(player.battlefield)) {
      player.battlefield.height = undefined;
      clampBattlefieldToHalfHeight(player, defaultBattlefieldHalfHeight());
    }
    if (previousVersion < 18) {
      removeLegacyBattlefieldPlaceholders(player);
    }
    player.deckList = normalizeDeckList(player.deckList?.length ? player.deckList : inferDeckList(player));
  });
  return loaded;
}

function removeLegacyBattlefieldPlaceholders(player) {
  player.battlefield.cards = player.battlefield.cards.filter((card) => card.cardKey);
}

function shouldResetLegacyBattlefieldHeight(battlefield) {
  if (!Number.isFinite(battlefield.height)) return false;
  return LEGACY_DEFAULT_BATTLEFIELD_HALF_HEIGHTS.some((height) => Math.abs(battlefield.height - height) <= 6);
}

function normalizeCatalog(catalog) {
  const catalogSource = catalog && typeof catalog === "object" ? catalog : {};
  return Object.fromEntries(
    Object.entries({ ...sampleCatalog, ...catalogSource }).map(([key, card]) => {
      const catalogCard = card && typeof card === "object" ? card : {};
      return [
        key,
        {
          name: catalogCard.name || key,
          typeLine: catalogCard.typeLine || "",
          ...catalogCard,
          image: sanitizeCatalogImage(catalogCard.image),
        },
      ];
    }),
  );
}

function sanitizeCatalogImage(url) {
  if (typeof url !== "string") return "";
  if (url.startsWith("https://cards.scryfall.io/")) return url;
  return "";
}

function resetCatalogForEnglishImages(catalog) {
  return Object.fromEntries(
    Object.entries(catalog).map(([key, card]) => {
      const isToken = key.startsWith("token:");
      const sample = sampleCatalog[key] || {};
      const next = {
        name: isToken ? card.name || key : sample.name || key,
        typeLine: isToken ? card.typeLine || "Token" : sample.typeLine || "",
        image: "",
        lookupFailed: false,
        imageSource: "",
        lookupFailedSource: "",
      };
      if (isToken && card.searchName) next.searchName = card.searchName;
      return [key, next];
    }),
  );
}

function resetMismatchedCatalogEntries(catalog) {
  return Object.fromEntries(
    Object.entries(catalog).map(([key, card]) => {
      if (key.startsWith("token:")) {
        return [key, { ...card, image: sanitizeCatalogImage(card.image), lookupFailed: false }];
      }
      const expected = normalizeSearchName(key);
      const actual = normalizeSearchName(card.name);
      if (actual && actual !== expected) {
        return [key, { name: key, typeLine: "", image: "", lookupFailed: false }];
      }
      return [key, { ...card, image: sanitizeCatalogImage(card.image), lookupFailed: false }];
    }),
  );
}

function normalizePlayerState(player, fallbackName) {
  const base = makePlayer(fallbackName);
  if (!player || typeof player !== "object") return base;
  return {
    ...base,
    ...player,
    name: player.name || fallbackName,
    library: Array.isArray(player.library) ? player.library : [],
    extraDeck: normalizeExtraDeckList(player.extraDeck || []),
    hand: Array.isArray(player.hand) ? player.hand : [],
    deckList: normalizeDeckList(player.deckList || []),
    battlefield: normalizeBattlefield(player.battlefield),
    graveyard: Array.isArray(player.graveyard) ? player.graveyard : [],
    exile: Array.isArray(player.exile) ? player.exile : [],
    mana: { ...base.mana, ...(player.mana || {}) },
  };
}

function normalizeDeckList(entries) {
  const merged = new Map();
  entries.forEach((entry) => {
    const name = Array.isArray(entry) ? entry[0] : entry.name;
    const count = Number(Array.isArray(entry) ? entry[1] : entry.count) || 0;
    if (!name || count <= 0) return;
    if (!merged.has(name)) {
      merged.set(name, { name, count: 0 });
    }
    merged.get(name).count += count;
  });
  return [...merged.values()];
}

function normalizeExtraDeckList(entries) {
  const seen = new Set();
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => (typeof entry === "string" ? entry : entry?.name))
    .filter(Boolean)
    .map((name) => String(name).trim())
    .filter((name) => {
      const key = normalizeSearchName(name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((name) => ({ name }));
}

function inferDeckList(player) {
  const seen = new Map();
  const allCards = [
    ...(player.library || []),
    ...(player.extraDeck || []).map((entry) => ({ cardKey: entry.name })),
    ...(player.hand || []),
    ...battlefieldCards(player),
    ...(player.graveyard || []),
    ...(player.exile || []),
  ];
  allCards.forEach((card) => {
    seen.set(card.cardKey, (seen.get(card.cardKey) || 0) + 1);
  });
  return [...seen.entries()];
}

function normalizeBattlefield(battlefield) {
  if (battlefield?.cards) {
    return {
      cards: battlefield.cards.map((card, index) => normalizeBattlefieldPosition(card, index)),
      annotations: normalizeBattlefieldAnnotations(battlefield.annotations || []),
      height: Number.isFinite(battlefield.height) ? battlefield.height : undefined,
    };
  }
  if (Array.isArray(battlefield)) {
    return {
      cards: battlefield.map((card, index) => normalizeBattlefieldPosition(card, index)),
      annotations: [],
    };
  }
  const lanes = [
    ["creatures", 1],
    ["other", 13],
    ["lands", 25],
  ];
  const cards = lanes.flatMap(([lane, gridY]) =>
    (battlefield?.[lane] || []).map((card, index) =>
      normalizeBattlefieldPosition(card, index, { gridX: 1 + index * 10, gridY }),
    ),
  );
  return {
    cards,
    annotations: normalizeBattlefieldAnnotations(battlefield?.annotations || []),
    height: Number.isFinite(battlefield?.height) ? battlefield.height : undefined,
  };
}

function normalizeBattlefieldPosition(card, index, fallback = null) {
  return {
    ...card,
    gridX: Number.isFinite(card.gridX) ? card.gridX : fallback?.gridX ?? 1 + (index % 8) * 10,
    gridY: Number.isFinite(card.gridY) ? card.gridY : fallback?.gridY ?? 1 + Math.floor(index / 8) * 12,
  };
}

function normalizeBattlefieldAnnotations(annotations) {
  return annotations
    .filter((annotation) => annotation && typeof annotation === "object")
    .map((annotation, index) => ({
      id: annotation.id || makeId(),
      kind: normalizeMarkerKind(annotation.kind),
      text: String(annotation.text || "").slice(0, 40),
      color: sanitizeMarkerColor(annotation.color),
      gridX: Number.isFinite(annotation.gridX) ? annotation.gridX : 2 + (index % 6) * 8,
      gridY: Number.isFinite(annotation.gridY) ? annotation.gridY : 2 + Math.floor(index / 6) * 4,
    }));
}

function sanitizeMarkerColor(color) {
  return /^#[0-9a-f]{6}$/i.test(color || "") ? color : "#f0c15a";
}

function normalizeMarkerKind(kind) {
  const value = LEGACY_MARKER_KIND_MAP[kind] || kind;
  return MARKER_LIBRARY.some((item) => item.value === value) ? value : "energy";
}

function defaultPlayerName(playerId) {
  return playerId === "p2" ? "P2" : "P1";
}

function sanitizePlayerName(value, playerId) {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
  return normalized || defaultPlayerName(playerId);
}
