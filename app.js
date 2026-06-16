const STORAGE_KEY = "mtg-online-table-state-v1";
const PANEL_POSITION_KEY = "mtg-online-panel-positions-v2";
const MARKER_TOOLBAR_KEY = "mtg-online-marker-toolbar-v1";
const CLIENT_ID_KEY = "mtg-online-client-id-v1";
const LAST_TABLES_KEY = "mtg-online-last-tables-v1";
const STATE_VERSION = 19;
const SCRYFALL_NAMED_URL = "https://api.scryfall.com/cards/named?exact=";
const SCRYFALL_SEARCH_URL = "https://api.scryfall.com/cards/search?q=";
const CARD_IMAGE_SOURCE = "scryfall";
const TABLES_URL = "/api/tables";
const TABLE_JOIN_URL = "/api/tables/join";
const TABLE_STATE_URL = "/api/table/state";
const TABLE_HEARTBEAT_URL = "/api/table/heartbeat";
const TABLE_LEAVE_URL = "/api/table/leave";
const TABLE_POLL_MS = 1000;
const TABLE_HEARTBEAT_MS = 15000;
const BATTLE_GRID_SIZE = 13;
const BATTLE_CARD_GRID_W = 14;
const BATTLE_CARD_GRID_H = 20;
const SOFT_ZONE_EXTRA_GRID = 2;
const DEFAULT_VISIBLE_SOFT_ZONES = 1;
const PLAYER_PANEL_DEFAULT_GAP = 12;
const LEGACY_DEFAULT_BATTLEFIELD_HALF_HEIGHTS = [525, 528];
const SCRYFALL_SYMBOL_BASE_URL = "https://svgs.scryfall.io/card-symbols/";
const MANA_SYMBOL_URLS = {
  W: `${SCRYFALL_SYMBOL_BASE_URL}W.svg`,
  U: `${SCRYFALL_SYMBOL_BASE_URL}U.svg`,
  B: `${SCRYFALL_SYMBOL_BASE_URL}B.svg`,
  R: `${SCRYFALL_SYMBOL_BASE_URL}R.svg`,
  G: `${SCRYFALL_SYMBOL_BASE_URL}G.svg`,
  C: `${SCRYFALL_SYMBOL_BASE_URL}C.svg`,
};
const MARKER_LIBRARY = [
  { value: "energy", label: "能量", symbol: "E" },
  { value: "tap", label: "横置", symbol: "T" },
  { value: "untap", label: "重置", symbol: "Q" },
  { value: "planeswalker", label: "旅法", symbol: "PW" },
  { value: "chaos", label: "混沌", symbol: "CHAOS" },
  { value: "ticket", label: "票券", symbol: "TK" },
  { value: "plus", label: "+1/+1" },
  { value: "minus", label: "-1/-1" },
];
const LEGACY_MARKER_KIND_MAP = {
  dot: "energy",
  bolt: "energy",
  shield: "planeswalker",
  target: "tap",
  poison: "plus",
  alert: "chaos",
};
const SEAT_ORDER = ["p1", "p2", "spectator"];
const SEAT_LABELS = {
  p1: "P1",
  p2: "P2",
  spectator: "旁观",
};
const SYNC_LABELS = {
  connecting: "正在连接",
  connected: "已连接",
  offline: "离线",
  error: "同步异常",
};
const MECHANIC_LIBRARY = [
  {
    key: "flying",
    nameEn: "Flying",
    nameZh: "飞行",
    category: "关键词异能",
    aliases: ["flying", "飞行"],
    summary: "只能被具有飞行或延势的生物阻挡。",
    examples: ["Serra Angel", "Shivan Dragon"],
  },
  {
    key: "reach",
    nameEn: "Reach",
    nameZh: "延势",
    category: "关键词异能",
    aliases: ["reach", "延势"],
    summary: "可以阻挡具有飞行的生物。",
    examples: ["Giant Spider"],
  },
  {
    key: "trample",
    nameEn: "Trample",
    nameZh: "践踏",
    category: "关键词异能",
    aliases: ["trample", "践踏"],
    summary: "攻击生物被阻挡时，超过致命伤害的伤害可以分配给防御者。",
    examples: ["Colossal Dreadmaw"],
  },
  {
    key: "haste",
    nameEn: "Haste",
    nameZh: "敏捷",
    category: "关键词异能",
    aliases: ["haste", "敏捷"],
    summary: "该生物在刚由你操控的回合也可以攻击，并可以起动需要横置的异能。",
    examples: ["Goblin Guide"],
  },
  {
    key: "vigilance",
    nameEn: "Vigilance",
    nameZh: "警戒",
    category: "关键词异能",
    aliases: ["vigilance", "警戒"],
    summary: "攻击时不会横置。",
    examples: ["Serra Angel"],
  },
  {
    key: "deathtouch",
    nameEn: "Deathtouch",
    nameZh: "死触",
    category: "关键词异能",
    aliases: ["deathtouch", "死触"],
    summary: "由具有死触的来源对生物造成的任意非零伤害都足以消灭该生物。",
    examples: ["Typhoid Rats"],
  },
  {
    key: "lifelink",
    nameEn: "Lifelink",
    nameZh: "系命",
    category: "关键词异能",
    aliases: ["lifelink", "系命"],
    summary: "该来源造成伤害的同时，其操控者获得等量生命。",
    examples: ["Vampire Nighthawk"],
  },
  {
    key: "first-strike",
    nameEn: "First strike",
    nameZh: "先攻",
    category: "关键词异能",
    aliases: ["first strike", "first-strike", "先攻"],
    summary: "在战斗中先于没有先攻或连击的生物造成战斗伤害。",
    examples: ["White Knight"],
  },
  {
    key: "double-strike",
    nameEn: "Double strike",
    nameZh: "连击",
    category: "关键词异能",
    aliases: ["double strike", "double-strike", "连击"],
    summary: "在先攻伤害步骤和普通战斗伤害步骤各造成一次战斗伤害。",
    examples: ["Boros Swiftblade"],
  },
  {
    key: "menace",
    nameEn: "Menace",
    nameZh: "威慑",
    category: "关键词异能",
    aliases: ["menace", "威慑"],
    summary: "不能被少于两个生物阻挡。",
    examples: ["Gurmag Swiftwing"],
  },
  {
    key: "defender",
    nameEn: "Defender",
    nameZh: "守军",
    category: "关键词异能",
    aliases: ["defender", "守军"],
    summary: "具有守军的生物不能攻击。",
    examples: ["Wall of Omens"],
  },
  {
    key: "hexproof",
    nameEn: "Hexproof",
    nameZh: "辟邪",
    category: "关键词异能",
    aliases: ["hexproof", "辟邪"],
    summary: "不能成为对手操控的咒语或异能的目标。",
    examples: ["Gladecover Scout"],
  },
  {
    key: "indestructible",
    nameEn: "Indestructible",
    nameZh: "不灭",
    category: "关键词异能",
    aliases: ["indestructible", "不灭"],
    summary: "不能被消灭；致命伤害和写有“消灭”的效应不会使其进入坟墓场。",
    examples: ["Darksteel Myr"],
  },
  {
    key: "flash",
    nameEn: "Flash",
    nameZh: "闪现",
    category: "关键词异能",
    aliases: ["flash", "闪现"],
    summary: "你可以于你能够施放瞬间的时机施放它。",
    examples: ["Snapcaster Mage"],
  },
  {
    key: "ward",
    nameEn: "Ward",
    nameZh: "守护",
    category: "关键词异能",
    aliases: ["ward", "守护"],
    summary: "当它成为对手操控的咒语或异能的目标时，除非该对手支付守护费用，否则反击该咒语或异能。",
    examples: ["Ledger Shredder"],
  },
  {
    key: "scry",
    nameEn: "Scry",
    nameZh: "占卜",
    category: "关键词动作",
    aliases: ["scry", "占卜"],
    summary: "占卜 N：检视你牌库顶 N 张牌，然后可将任意数量置于牌库底，其余以任意顺序置于牌库顶。",
    examples: ["Opt"],
  },
  {
    key: "surveil",
    nameEn: "Surveil",
    nameZh: "刺探",
    category: "关键词动作",
    aliases: ["surveil", "刺探"],
    summary: "刺探 N：检视你牌库顶 N 张牌，然后可将任意数量置入坟墓场，其余以任意顺序置于牌库顶。",
    examples: ["Consider"],
  },
  {
    key: "proliferate",
    nameEn: "Proliferate",
    nameZh: "增殖",
    category: "关键词动作",
    aliases: ["proliferate", "增殖"],
    summary: "选择任意数量已有指示物的永久物或玩家；为每种已在其上的指示物各额外放一个。",
    examples: ["Contentious Plan"],
  },
  {
    key: "mill",
    nameEn: "Mill",
    nameZh: "磨牌",
    category: "关键词动作",
    aliases: ["mill", "磨牌"],
    summary: "磨 N 张牌：将牌库顶 N 张牌置入坟墓场。",
    examples: ["Maddening Cacophony"],
  },
  {
    key: "landfall",
    nameEn: "Landfall",
    nameZh: "地落",
    category: "能力词",
    aliases: ["landfall", "地落"],
    summary: "能力词本身没有规则含义，通常表示每当一个地在你操控下进战场时触发的异能。",
    examples: ["Lotus Cobra"],
  },
  {
    key: "token",
    nameEn: "Token",
    nameZh: "衍生物",
    category: "规则术语",
    aliases: ["token", "衍生物"],
    summary: "由效应创建的永久物，不是牌；离开战场后会消失。",
    examples: ["Treasure Token"],
  },
  {
    key: "counter",
    nameEn: "Counter",
    nameZh: "指示物 / 反击",
    category: "规则术语",
    aliases: ["counter", "指示物", "反击"],
    summary: "Counter 可指永久物或玩家上的指示物，也可指反击咒语。需要结合牌面语境判断。",
    examples: ["Counterspell"],
  },
];
const TRANSLATION_TERMS = [
  ["creature", "生物"],
  ["artifact", "神器"],
  ["enchantment", "结界"],
  ["instant", "瞬间"],
  ["sorcery", "法术"],
  ["planeswalker", "鹏洛客"],
  ["land", "地"],
  ["battlefield", "战场"],
  ["graveyard", "坟墓场"],
  ["library", "牌库"],
  ["hand", "手牌"],
  ["exile", "放逐"],
  ["permanent", "永久物"],
  ["spell", "咒语"],
  ["ability", "异能"],
  ["target", "目标"],
  ["opponent", "对手"],
  ["player", "牌手"],
  ["controller", "操控者"],
  ["owner", "拥有者"],
  ["damage", "伤害"],
  ["combat damage", "战斗伤害"],
  ["draw a card", "抓一张牌"],
  ["discard", "弃牌"],
  ["sacrifice", "牺牲"],
  ["destroy", "消灭"],
  ["tap", "横置"],
  ["untap", "重置"],
  ["cast", "施放"],
  ["counter target spell", "反击目标咒语"],
  ["create", "派出"],
  ["token", "衍生物"],
  ["counter", "指示物 / 反击"],
  ["until end of turn", "直到回合结束"],
  ["at the beginning", "在开始时"],
  ["end step", "结束步骤"],
  ["upkeep", "维持"],
  ["attack", "攻击"],
  ["block", "阻挡"],
  ["dies", "死去"],
  ["enters the battlefield", "进战场"],
  ["leaves the battlefield", "离开战场"],
  ["return", "移回"],
  ["shuffle", "洗牌"],
  ["reveal", "展示"],
  ["search your library", "搜寻你的牌库"],
];
const channel = "BroadcastChannel" in window ? new BroadcastChannel("mtg-online-table") : null;
const pendingCardFetches = new Set();
let hydrateCatalogRunning = false;
let syncingRemote = false;
let battlefieldResizeObserver = null;
let activeTable = null;
let tablePollTimer = null;
let tableHeartbeatTimer = null;
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
      id: crypto.randomUUID(),
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
  const next = crypto.randomUUID();
  localStorage.setItem(CLIENT_ID_KEY, next);
  return next;
}

function tableStorageKey(tableId = activeTable?.id) {
  return tableId ? `${STORAGE_KEY}:${tableId}` : STORAGE_KEY;
}

function loadState(tableId = activeTable?.id) {
  const raw = localStorage.getItem(tableStorageKey(tableId));
  if (!raw) return makeInitialState();
  try {
    const loaded = JSON.parse(raw);
    return migrateState(loaded);
  } catch {
    return makeInitialState();
  }
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
      id: annotation.id || crypto.randomUUID(),
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

function saveState(message, options = {}) {
  if (options.captureLayout !== false) {
    captureBattlefieldHeights();
  }
  state.updatedAt = Math.max(Date.now(), (Number(state.updatedAt) || 0) + 1);
  if (message) {
    state.log = [message, ...state.log].slice(0, 40);
  }
  persistState();
  render();
}

function persistState() {
  localStorage.setItem(tableStorageKey(), JSON.stringify(state));
  channel?.postMessage({ tableId: activeTable?.id || "", state });
  publishTableState();
}

function persistLocalState() {
  localStorage.setItem(tableStorageKey(), JSON.stringify(state));
}

async function publishTableState() {
  if (syncingRemote || !activeTable) return;
  try {
    const response = await fetch(TABLE_STATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: activeTable.id, clientId, state }),
    });
    if (response.status === 404) {
      handleRemoteTableMissing();
      return;
    }
    if (response.status === 409) {
      setSyncStatus("connected");
      applyIncomingState(await fetchTableState());
      return;
    }
    if (response.ok) {
      setSyncStatus("connected");
    } else {
      setSyncStatus("error");
    }
  } catch {
    setSyncStatus("offline");
    // Network sync is best-effort; local play should keep working offline.
  }
}

async function fetchTableState() {
  if (!activeTable) return null;
  try {
    const params = new URLSearchParams({ tableId: activeTable.id, clientId });
    const response = await fetch(`${TABLE_STATE_URL}?${params}`, { cache: "no-store" });
    if (response.status === 404) {
      handleRemoteTableMissing();
      return null;
    }
    if (response.status === 403) {
      setSyncStatus("error");
      setLobbyMessage("当前牌桌连接已失效，请从大厅重新输入密码进入。");
      return null;
    }
    if (!response.ok) {
      setSyncStatus("error");
      return null;
    }
    const data = await response.json();
    setSyncStatus("connected");
    return data.state || null;
  } catch {
    setSyncStatus("offline");
    return null;
  }
}

function applyIncomingState(incoming) {
  if (!incoming || typeof incoming.updatedAt !== "number") return false;
  if (incoming.updatedAt <= state.updatedAt) return false;
  const incomingVersion = Number(incoming.version) || 0;
  const localBattlefieldHeights = readBattlefieldHeights();
  syncingRemote = true;
  state = migrateState(incoming);
  if (incomingVersion >= 9) {
    applyBattlefieldHeights(localBattlefieldHeights);
  }
  localStorage.setItem(tableStorageKey(), JSON.stringify(state));
  syncingRemote = false;
  render({ captureLayout: false });
  if (incomingVersion < STATE_VERSION) {
    publishTableState();
  }
  return true;
}

async function startOnlineSync() {
  if (!activeTable) return;
  stopOnlineSync();
  const serverState = await fetchTableState();
  if (!activeTable) return;
  if (serverState) {
    const serverVersion = Number(serverState.version) || 0;
    const applied = applyIncomingState(serverState);
    if (!applied && (serverState.updatedAt < state.updatedAt || serverVersion < STATE_VERSION)) {
      publishTableState();
    }
  } else {
    publishTableState();
  }
  tablePollTimer = window.setInterval(async () => {
    const incoming = await fetchTableState();
    applyIncomingState(incoming);
  }, TABLE_POLL_MS);
  tableHeartbeatTimer = window.setInterval(sendTableHeartbeat, TABLE_HEARTBEAT_MS);
  sendTableHeartbeat();
}

function stopOnlineSync() {
  if (tablePollTimer) {
    window.clearInterval(tablePollTimer);
    tablePollTimer = null;
  }
  if (tableHeartbeatTimer) {
    window.clearInterval(tableHeartbeatTimer);
    tableHeartbeatTimer = null;
  }
}

async function sendTableHeartbeat() {
  if (!activeTable) return;
  try {
    const response = await fetch(TABLE_HEARTBEAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: activeTable.id, clientId }),
    });
    if (response.status === 404) {
      handleRemoteTableMissing();
      return;
    }
    if (response.ok) setSyncStatus("connected");
  } catch {
    setSyncStatus("offline");
  }
}

function sendTableLeaveBeacon(tableId = activeTable?.id) {
  if (!tableId) return;
  const payload = JSON.stringify({ tableId, clientId });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(TABLE_LEAVE_URL, new Blob([payload], { type: "application/json" }));
    return;
  }
  fetch(TABLE_LEAVE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

function handleRemoteTableMissing() {
  if (!activeTable) return;
  const missingId = activeTable.id;
  stopOnlineSync();
  activeTable = null;
  setSyncStatus("offline");
  showLobby(`牌桌 ${missingId} 已不存在或已被清理。`);
  refreshLobbyTables();
}

function showLobby(message = "") {
  stopOnlineSync();
  if (battlefieldResizeObserver) battlefieldResizeObserver.disconnect();
  closeOpenDialogs();
  els.app.hidden = true;
  els.lobby.hidden = false;
  if (message) setLobbyMessage(message);
}

function showTable() {
  els.lobby.hidden = true;
  els.app.hidden = false;
  setSyncStatus("connecting");
  updateSeatToggle();
  render({ captureLayout: false });
}

function setLobbyMessage(message, tone = "") {
  if (!els.lobbyMessage) return;
  els.lobbyMessage.textContent = message || "";
  els.lobbyMessage.dataset.tone = tone;
}

function closeOpenDialogs() {
  [els.zoneDialog, els.cardDialog, els.libraryMoveDialog].forEach((dialog) => {
    if (dialog?.open) dialog.close();
  });
}

async function refreshLobbyTables(query = els.tableSearchInput?.value || "") {
  if (!els.tableList) return;
  setLobbyMessage("正在刷新牌桌...");
  try {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    const url = params.toString() ? `${TABLES_URL}?${params}` : TABLES_URL;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("request failed");
    const data = await response.json();
    renderLobbyTables(data.tables || []);
    setLobbyMessage((data.tables || []).length ? "" : "没有找到正在进行的牌桌。");
  } catch {
    renderLobbyTables([]);
    setLobbyMessage("无法连接大厅服务，请确认 server.py 正在运行。", "error");
  }
}

function renderLobbyTables(tables) {
  if (!els.tableList) return;
  if (!tables.length) {
    els.tableList.innerHTML = "";
    return;
  }
  els.tableList.innerHTML = tables.map(renderLobbyTableCard).join("");
  els.tableList.querySelectorAll("[data-join-table]").forEach((button) => {
    button.addEventListener("click", () => {
      const tableId = button.dataset.joinTable;
      const password = button.closest(".table-card")?.querySelector("[data-table-password]")?.value || "";
      joinTable(tableId, password);
    });
  });
}

function renderLobbyTableCard(table) {
  const lastBadge = isLastPlayedTable(table.id) ? '<span class="last-table-badge">上次游玩</span>' : "";
  const names = Array.isArray(table.playerNames) ? table.playerNames.filter(Boolean).join(" vs ") : "P1 vs P2";
  const passwordHint = table.hasPassword ? "需要密码" : "无密码";
  const activeText = Number.isFinite(table.activeClients) ? `${table.activeClients} 个连接` : "";
  return `
    <article class="table-card">
      <div class="table-card-main">
        <div>
          <h3>${escapeHtml(table.id)} ${lastBadge}</h3>
          <p>${escapeHtml(names)} · ${escapeHtml(passwordHint)}${activeText ? ` · ${escapeHtml(activeText)}` : ""}</p>
        </div>
        <time>${escapeHtml(formatLobbyTime(table.updatedAt || table.createdAt))}</time>
      </div>
      <div class="table-join-row">
        <input data-table-password="${escapeHtml(table.id)}" type="password" placeholder="${table.hasPassword ? "输入密码" : "密码可空"}" autocomplete="current-password" />
        <button type="button" data-join-table="${escapeHtml(table.id)}">进入</button>
      </div>
    </article>`;
}

function formatLobbyTime(timestamp) {
  const value = Number(timestamp);
  if (!Number.isFinite(value)) return "";
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

async function createTable(event) {
  event.preventDefault();
  const requestedId = els.createTableId.value.trim();
  const password = els.createTablePassword.value;
  setLobbyMessage("正在创建牌桌...");
  try {
    const response = await fetch(TABLES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: requestedId, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 409) {
      setLobbyMessage("这个牌桌号已经存在，请换一个。", "error");
      return;
    }
    if (response.status === 400) {
      setLobbyMessage("牌桌号只能使用 3-24 位英文字母、数字、下划线或短横线；也可以留空自动生成。", "error");
      return;
    }
    if (!response.ok) {
      setLobbyMessage(data.error || "创建牌桌失败。", "error");
      return;
    }
    els.createTableId.value = "";
    els.createTablePassword.value = "";
    await joinTable(data.table.id, password);
  } catch {
    setLobbyMessage("无法连接大厅服务，请确认 server.py 正在运行。", "error");
  }
}

async function joinTable(tableId, password = "") {
  const id = String(tableId || "").trim();
  if (!id) return;
  setLobbyMessage(`正在进入牌桌 ${id}...`);
  try {
    const response = await fetch(TABLE_JOIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: id, password, clientId }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 403) {
      setLobbyMessage("密码不正确。", "error");
      return;
    }
    if (response.status === 404) {
      setLobbyMessage("牌桌不存在，可能已经被清理。", "error");
      refreshLobbyTables();
      return;
    }
    if (!response.ok) {
      setLobbyMessage(data.error || "进入牌桌失败。", "error");
      return;
    }

    activeTable = data.table;
    state = data.state ? migrateState(data.state) : makeInitialState();
    markLastTable(id);
    persistLocalState();
    showTable();
    await startOnlineSync();
    if (!data.state) publishTableState();
  } catch {
    setLobbyMessage("无法连接大厅服务，请确认 server.py 正在运行。", "error");
  }
}

function leaveCurrentTable() {
  if (activeTable) sendTableLeaveBeacon(activeTable.id);
  stopOnlineSync();
  activeTable = null;
  setSyncStatus("offline");
  showLobby("已离开牌桌。");
  refreshLobbyTables();
}

function shuffle(cards) {
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
}

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

function render(options = {}) {
  if (!activeTable) return;
  if (options.captureLayout !== false) {
    captureBattlefieldHeights();
  }
  const selfId = visibleSeat();
  const opponentId = opponentOf(selfId);
  renderSharedBattlefield(els.battlefieldArea, selfId, opponentId);
  renderPlayerPanel(els.opponentArea, opponentId, "opponent");
  renderPlayerPanel(els.selfArea, selfId, "self");
  renderLog();
  renderTimer();
  renderSyncStatus();
  observeBattlefieldResize();
  syncHandFanLayout();
  hydrateMissingCatalogImages();
}

function renderTimer() {
  state.timer = normalizeTimerState(state.timer);
  if (els.tableTimer) {
    els.tableTimer.textContent = formatTimer(currentTimerMs());
  }
  if (els.timerToggle) {
    els.timerToggle.textContent = state.timer.running ? "暂停" : "开始";
  }
}

function setSyncStatus(status) {
  syncState.status = status;
  if (status === "connected") {
    syncState.lastOkAt = Date.now();
  }
  renderSyncStatus();
}

function renderSyncStatus() {
  if (!els.syncStatus) return;
  const label = SYNC_LABELS[syncState.status] || SYNC_LABELS.connecting;
  const time = syncState.lastOkAt ? ` · ${formatClock(syncState.lastOkAt)}` : "";
  const tableLabel = activeTable ? `牌桌 ${activeTable.id} · ` : "";
  els.syncStatus.dataset.status = syncState.status;
  els.syncStatus.textContent = `${tableLabel}${label}${time}`;
}

function formatClock(timestamp) {
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function renderPlayerNameControl(playerId, player, canControl) {
  if (!canControl) {
    return `
      <span class="panel-name-field">
        <span class="panel-name-label" title="${escapeHtml(player.name)}">${escapeHtml(player.name)}</span>
      </span>`;
  }
  return `
    <span class="panel-name-field">
      <input
        class="panel-name-input"
        data-player-name-input="${playerId}"
        type="text"
        maxlength="24"
        value="${escapeHtml(player.name)}"
        aria-label="编辑玩家名"
        title="编辑玩家名"
      />
      <span class="panel-name-you">你</span>
    </span>`;
}

function renderPlayerPanel(root, playerId, panelRole) {
  const player = state.players[playerId];
  const canControl = seat === playerId;
  const openAttr = playerPanelOpen[playerId] ? " open" : "";
  root.dataset.panelPlayer = playerId;
  root.dataset.panelRole = panelRole;
  root.innerHTML = `
    <details class="player-panel-card" data-panel-player="${playerId}"${openAttr}>
      <summary>
        ${renderPlayerNameControl(playerId, player, canControl)}
        <span class="summary-life">
          ${canControl ? '<button data-action="life" data-delta="-1" aria-label="生命减一">-</button>' : ""}
          <strong>${player.life}</strong>
          ${canControl ? '<button data-action="life" data-delta="1" aria-label="生命加一">+</button>' : ""}
        </span>
      </summary>
      <aside class="player-panel">
        <div class="mana-row">
          ${Object.keys(player.mana)
            .map(
              (color) => `
                <button class="mana" data-action="mana" data-color="${color}">
                  ${manaIcon(color)}<strong>${player.mana[color]}</strong>
                </button>`,
            )
            .join("")}
        </div>
        ${canControl ? "" : renderPanelZones(playerId, player)}
        ${
          canControl
            ? `<div class="deck-import">
                <button data-action="untap-all">全部重置</button>
              </div>`
            : ""
        }
      </aside>
    </details>
  `;
  applyPlayerPanelPosition(root, playerId, panelRole);
  root.querySelector(".player-panel-card")?.addEventListener("toggle", (event) => {
    playerPanelOpen[playerId] = event.currentTarget.open;
  });
  bindPlayerPanelDrag(root, playerId);
  bindPlayerNameInput(root, playerId);
  bindPlayerControls(root, playerId);
}

function bindPlayerNameInput(root, playerId) {
  const input = root.querySelector(`input[data-player-name-input="${playerId}"]`);
  if (!input || input.readOnly || seat !== playerId) return;
  const commit = () => {
    const player = state.players[playerId];
    const previous = player.name;
    const next = sanitizePlayerName(input.value, playerId);
    input.value = next;
    if (next === previous) return;
    player.name = next;
    saveState(`${previous} 改名为 ${next}`);
    updateSeatToggle();
  };
  input.addEventListener("change", commit);
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      input.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      input.value = state.players[playerId].name;
      input.blur();
    }
  });
}

function applyPlayerPanelPosition(root, playerId, panelRole) {
  const position = playerPanelPositions[playerId];
  if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) {
    root.style.left = `${position.x}px`;
    root.style.top = `${position.y}px`;
    root.style.right = "auto";
    return;
  }
  applyDefaultPlayerPanelPosition(root, panelRole);
}

function applyDefaultPlayerPanelPosition(root, panelRole) {
  const table = root.closest(".table");
  const canvas = table?.querySelector(".shared-battlefield");
  if (!table || !canvas) {
    root.style.left = "";
    root.style.top = "";
    root.style.right = `${PLAYER_PANEL_DEFAULT_GAP}px`;
    return;
  }
  const tableRect = table.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const rootWidth = root.offsetWidth || 240;
  const summaryHeight = root.querySelector("summary")?.offsetHeight || 42;
  const halfHeight = canvasRect.height / 2;
  const halfTop = canvasRect.top - tableRect.top + (panelRole === "self" ? halfHeight : 0);
  const canvasLeft = canvasRect.left - tableRect.left;
  const canvasRight = canvasRect.right - tableRect.left;
  const maxX = Math.max(0, table.clientWidth - rootWidth);
  const minX = Math.max(0, canvasLeft + PLAYER_PANEL_DEFAULT_GAP);
  const x = Math.min(maxX, Math.max(minX, canvasRight - rootWidth - PLAYER_PANEL_DEFAULT_GAP));
  const minY = Math.max(0, halfTop + PLAYER_PANEL_DEFAULT_GAP);
  const maxTitleY = halfTop + halfHeight - summaryHeight - PLAYER_PANEL_DEFAULT_GAP;
  const y = maxTitleY >= minY ? minY : Math.max(0, maxTitleY);
  root.style.left = `${Math.round(x)}px`;
  root.style.top = `${Math.round(y)}px`;
  root.style.right = "auto";
}

function updateDefaultPlayerPanelPositions() {
  document.querySelectorAll(".player-area").forEach((root) => {
    const playerId = root.dataset.panelPlayer;
    if (!playerId || playerPanelPositions[playerId]) return;
    applyDefaultPlayerPanelPosition(root, root.dataset.panelRole);
  });
}

function bindPlayerPanelDrag(root, playerId) {
  const summary = root.querySelector(".player-panel-card summary");
  if (!summary) return;
  summary.querySelectorAll("button, input, select, textarea").forEach((control) => {
    control.addEventListener("pointerdown", (event) => event.stopPropagation());
    control.addEventListener("click", (event) => event.stopPropagation());
  });
  let start = null;
  let suppressClick = false;

  summary.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    },
    true,
  );

  summary.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const table = root.closest(".table");
    if (!table) return;
    const tableRect = table.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    start = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: rootRect.left - tableRect.left,
      y: rootRect.top - tableRect.top,
      moved: false,
    };
    summary.setPointerCapture(event.pointerId);
  });

  summary.addEventListener("pointermove", (event) => {
    if (!start || event.pointerId !== start.pointerId) return;
    const dx = event.clientX - start.clientX;
    const dy = event.clientY - start.clientY;
    if (!start.moved && Math.hypot(dx, dy) < 4) return;
    start.moved = true;
    suppressClick = true;
    root.classList.add("panel-dragging");
    const table = root.closest(".table");
    const maxX = Math.max(0, table.clientWidth - root.offsetWidth);
    const maxY = Math.max(0, table.scrollHeight - summary.offsetHeight);
    const x = clampNumber(start.x + dx, 0, maxX);
    const y = clampNumber(start.y + dy, 0, maxY);
    root.style.left = `${x}px`;
    root.style.top = `${y}px`;
    root.style.right = "auto";
    event.preventDefault();
  });

  const finishDrag = (event) => {
    if (!start || event.pointerId !== start.pointerId) return;
    if (start.moved) {
      playerPanelPositions[playerId] = {
        x: Number.parseInt(root.style.left, 10) || 0,
        y: Number.parseInt(root.style.top, 10) || 0,
      };
      savePanelPositions();
    }
    root.classList.remove("panel-dragging");
    start = null;
  };

  summary.addEventListener("pointerup", finishDrag);
  summary.addEventListener("pointercancel", finishDrag);
}

function renderSharedBattlefield(root, selfId, opponentId) {
  root.innerHTML = `
    <div class="battlefield-wrap">
      ${renderBattlefield(selfId, opponentId)}
      ${renderHandRow(selfId, false)}
      ${renderMarkerToolbar(selfId, opponentId)}
    </div>
  `;
  bindPlayerControls(root, selfId);
}

function bindPlayerControls(root, playerId) {
  bindMarkerToolbar(root);
  root.querySelectorAll("button[data-action]").forEach((button) => {
    const action = button.dataset.action;
    if (button.dataset.player && button.dataset.player !== playerId && action !== "open-zone") return;
    button.addEventListener("click", () => handleAction(button, playerId, root));
    if (action === "mana") {
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        handleAction(button, playerId, root, { manaDelta: -1 });
      });
    }
  });
  root.querySelectorAll(".card[data-card-id]").forEach((cardEl) => {
    cardEl.addEventListener("dblclick", () => openCard(cardEl.dataset.cardId));
    if (cardEl.dataset.player === seat && cardEl.dataset.zone !== "detail") {
      cardEl.addEventListener("contextmenu", (event) => handleCardContextMenu(event, cardEl));
    }
  });
  root.querySelectorAll(".card[draggable='true']").forEach((cardEl) => {
    cardEl.addEventListener("dragstart", (event) => {
      if (!cardEl.classList.contains("dragging")) handleDragStart(event, cardEl);
    });
    cardEl.addEventListener("dragend", () => clearDragState());
  });
  if (!root.dataset.cardDragDelegateBound) {
    root.dataset.cardDragDelegateBound = "true";
    root.addEventListener("dragstart", handleDelegatedCardDragStart, true);
  }
  root.querySelectorAll(".library-block[draggable='true']").forEach((libraryEl) => {
    libraryEl.addEventListener("dragstart", (event) => handleLibraryDragStart(event, libraryEl));
    libraryEl.addEventListener("dragend", () => clearDragState());
  });
  root.querySelectorAll(".extra-block[draggable='true']").forEach((extraEl) => {
    extraEl.addEventListener("dragstart", (event) => handleExtraDragStart(event, extraEl));
    extraEl.addEventListener("dragend", () => clearDragState());
  });
  root.querySelectorAll(".compact-zone-block[draggable='true'][data-zone='graveyard'], .compact-zone-block[draggable='true'][data-zone='exile']").forEach((zoneEl) => {
    zoneEl.addEventListener("dragstart", (event) => handleStackZoneDragStart(event, zoneEl));
    zoneEl.addEventListener("dragend", () => clearDragState());
  });
  root.querySelectorAll(".battlefield-canvas").forEach((canvasEl) => {
    canvasEl.addEventListener("dragover", handleDragOver);
    canvasEl.addEventListener("dragleave", () => canvasEl.classList.remove("drag-over"));
    canvasEl.addEventListener("drop", (event) => handleBattlefieldDrop(event, canvasEl));
  });
  bindBattlefieldMarkers(root);
  root.querySelectorAll("[data-drop-zone]").forEach((dropEl) => {
    dropEl.addEventListener("dragover", handleDragOver);
    dropEl.addEventListener("dragleave", () => dropEl.classList.remove("drag-over"));
    dropEl.addEventListener("drop", (event) => handleZoneDrop(event, dropEl));
  });
}

function handLayoutVarsToStyle(layout) {
  return [
    ["--hand-overlap", layout.overlap],
    ["--hand-hover-gap", layout.hoverGap],
    ["--hand-hover-scale", layout.hoverScale],
    ["--hand-hover-shift", layout.hoverShift],
  ]
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}:${value}`)
    .join(";");
}

function handLayoutStyle(playerId) {
  const layout = handLayoutVars.get(playerId);
  if (!layout) return "";
  return ` style="${handLayoutVarsToStyle(layout)}"`;
}

function applyHandLayout(strip, playerId, layout) {
  handLayoutVars.set(playerId, layout);
  strip.classList.add("layout-syncing");
  Object.entries({
    "--hand-overlap": layout.overlap,
    "--hand-hover-gap": layout.hoverGap,
    "--hand-hover-scale": layout.hoverScale,
    "--hand-hover-shift": layout.hoverShift,
  }).forEach(([name, value]) => {
    if (value) strip.style.setProperty(name, value);
  });
  window.requestAnimationFrame(() => strip.classList.remove("layout-syncing"));
}

function handleDelegatedCardDragStart(event) {
  const cardEl = event.target.closest?.(".card[draggable='true']");
  if (!cardEl || event.currentTarget.contains(cardEl) === false) return;
  if (cardEl.classList.contains("dragging")) return;
  handleDragStart(event, cardEl);
}

function bindMarkerToolbar(root) {
  const toolbar = root.querySelector(".marker-toolbar");
  if (!toolbar) return;
  const kindInput = toolbar.querySelector("[name='marker-kind']");
  const colorInput = toolbar.querySelector("[name='marker-color']");
  kindInput?.addEventListener("change", () => updateMarkerToolbarState(toolbar));
  colorInput?.addEventListener("input", () => updateMarkerToolbarState(toolbar));
  colorInput?.addEventListener("change", () => updateMarkerToolbarState(toolbar));
}

function updateMarkerToolbarState(toolbar) {
  markerToolbarState.kind = normalizeMarkerKind(toolbar.querySelector("[name='marker-kind']")?.value);
  markerToolbarState.color = sanitizeMarkerColor(toolbar.querySelector("[name='marker-color']")?.value);
  saveMarkerToolbarState();
}

function renderMarkerToolbar(selfId, opponentId) {
  if (!["p1", "p2"].includes(seat)) return "";
  return `
    <div class="marker-toolbar">
      <select name="marker-target" aria-label="标记目标">
        <option value="${selfId}">我方</option>
        <option value="${opponentId}">对手</option>
      </select>
      <select name="marker-kind" aria-label="标记图标">
        ${MARKER_LIBRARY.map((item) => `<option value="${item.value}"${item.value === markerToolbarState.kind ? " selected" : ""}>${escapeHtml(markerOptionLabel(item))}</option>`).join("")}
      </select>
      <input name="marker-text" type="text" maxlength="40" placeholder="标记文本" />
      <input name="marker-color" type="color" value="${escapeHtml(markerToolbarState.color)}" aria-label="标记颜色" />
      <button data-action="add-marker">添加标记</button>
      <div class="token-maker" aria-label="创建衍生物">
        <input name="token-name" type="text" placeholder="衍生物名称" />
        <button data-action="create-token">创建衍生物</button>
      </div>
    </div>`;
}

function compactZoneRow(playerId, player) {
  return `
    <div class="compact-zone-row">
      ${compactZoneButton(playerId, "graveyard", "墓地", player.graveyard, seat === playerId)}
      ${compactZoneButton(playerId, "exile", "放逐", player.exile, seat === playerId)}
    </div>`;
}

function renderPanelZones(playerId, player) {
  return `
    <div class="zone-list panel-zone-list">
      <div class="compact-zone-row">
        ${compactZoneButton(playerId, "hand", "手牌", player.hand, false)}
        ${compactZoneButton(playerId, "library", "牌库", player.library, false)}
      </div>
      ${compactZoneRow(playerId, player)}
    </div>`;
}

function compactZoneButton(playerId, zone, label, cards, canDrop) {
  const dropAttr = canDrop ? ` data-drop-zone="${zone}"` : "";
  const draggable = canDrop && cards.length ? ' draggable="true"' : "";
  return `
    <button class="compact-zone-block" data-action="open-zone" data-zone="${zone}" data-player="${playerId}"${dropAttr}${draggable}>
      <span>${label}</span>
      <strong>${cards.length}</strong>
    </button>`;
}

function libraryZone(playerId, cards, canControl) {
  const draggable = canControl && cards.length ? ' draggable="true"' : "";
  const dropAttr = canControl ? ' data-drop-zone="library"' : "";
  const shuffleButton = canControl ? '<button class="zone-mini-button" data-action="shuffle-library" type="button">洗牌</button>' : "";
  return `
    <div class="library-zone">
      <button class="zone-block library-block" data-action="open-zone" data-zone="library" data-player="${playerId}"${dropAttr}${draggable}>
        <span>牌库</span>
        <strong>${cards.length}</strong>
      </button>
      ${shuffleButton}
    </div>`;
}

function extraZone(playerId, entries, canControl) {
  const draggable = canControl && entries.length ? ' draggable="true"' : "";
  return `
    <button class="zone-block extra-block" data-action="open-zone" data-zone="extra" data-player="${playerId}"${draggable}>
      <span>额外</span>
      <strong>${entries.length}</strong>
    </button>`;
}

function renderHandRow(playerId, isOpponent) {
  const player = state.players[playerId];
  const canControl = seat === playerId;
  const handClass = `${isOpponent ? "opponent-hand" : "self-hand"} ${player.hand.length ? "" : "empty"}`;
  const handStyle = handLayoutStyle(playerId);
  return `
    <div class="hand-row ${isOpponent ? "opponent-hand-row" : "self-hand-row"}">
      <div class="hand-strip ${handClass}" data-player="${playerId}" data-hand-count="${player.hand.length}" data-drop-zone="hand"${handStyle}>
        ${renderHand(playerId, isOpponent, canControl)}
        <span class="hand-count">${player.hand.length}</span>
      </div>
      <aside class="hand-zone-stack" aria-label="${escapeHtml(player.name)}区域">
        ${libraryZone(playerId, player.library, canControl)}
        ${extraZone(playerId, player.extraDeck, canControl)}
        ${compactZoneButton(playerId, "graveyard", "墓地", player.graveyard, canControl)}
        ${compactZoneButton(playerId, "exile", "放逐", player.exile, canControl)}
      </aside>
    </div>`;
}

function renderHand(playerId, isOpponent, canControl) {
  const cards = state.players[playerId].hand;
  if (!cards.length) return "";
  if (isOpponent && !canControl) {
    return cards.map((_, index) => renderCardBack(handCardStyle(index, cards.length))).join("");
  }
  return cards
    .map((card, index) => renderCard(playerId, card, "hand", canControl, { style: handCardStyle(index, cards.length) }))
    .join("");
}

function handCardStyle(index, total) {
  return `--hand-z: ${total - index};`;
}

function syncHandFanLayout() {
  document.querySelectorAll(".hand-strip").forEach((strip) => {
    const cards = [...strip.querySelectorAll(".card")];
    const count = cards.length;
    const playerId = strip.dataset.player || "";
    const fallbackLayout = {
      overlap: "calc(var(--card-w) * -0.22)",
      hoverGap: "clamp(20px, 3vw, 44px)",
      hoverScale: "1.5",
      hoverShift: "18px",
    };
    if (count <= 1) return;

    const cardWidth = cards[0].getBoundingClientRect().width || 0;
    const stripWidth = strip.clientWidth || strip.getBoundingClientRect().width || 0;
    if (!cardWidth || !stripWidth) {
      if (playerId && !handLayoutVars.has(playerId)) applyHandLayout(strip, playerId, fallbackLayout);
      return;
    }

    const style = window.getComputedStyle(strip);
    const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(style.paddingRight) || 0;
    const countReserve = 42;
    const layoutAvailable = Math.max(cardWidth, stripWidth - paddingLeft - paddingRight - countReserve);
    const hoverReserve = Math.min(cardWidth * 0.45, Math.max(22, stripWidth * 0.04));
    const available = Math.max(cardWidth, layoutAvailable - hoverReserve);
    const rawGap = (available - cardWidth * count) / Math.max(1, count - 1);
    const minVisibleStep = clampNumber(cardWidth * 0.16, 16, 24);
    const minGap = minVisibleStep - cardWidth;
    const maxGap = -cardWidth * 0.22;
    const gap = clampNumber(rawGap, minGap, maxGap);
    const hoverMax = Math.max(
      6,
      layoutAvailable - cardWidth * count - gap * Math.max(0, count - 2),
    );
    const hoverGap = clampNumber(hoverMax, 8, count > 14 ? 24 : 42);
    const battleCardWidth = BATTLE_GRID_SIZE * BATTLE_CARD_GRID_W;
    const hoverScale = clampNumber((battleCardWidth / cardWidth) * 100, 110, 240) / 100;
    const hoverShift = clampNumber(((hoverScale - 1) * cardWidth) / 2, 10, 34);
    if (!playerId) return;
    applyHandLayout(strip, playerId, {
      overlap: `${gap.toFixed(2)}px`,
      hoverGap: `${hoverGap.toFixed(2)}px`,
      hoverScale: hoverScale.toFixed(2),
      hoverShift: `${hoverShift.toFixed(2)}px`,
    });
  });
}

function renderCardBack(style = "") {
  const styleAttr = style ? ` style="${style}"` : "";
  return `<div class="card"${styleAttr}><div class="card-back">Magic<br />Card</div></div>`;
}

function createCardBackDragImage() {
  const wrapper = document.createElement("div");
  wrapper.className = "library-drag-image";
  wrapper.innerHTML = renderCardBack();
  document.body.append(wrapper);
  return wrapper;
}

function createHandCardDragImage(cardEl) {
  const wrapper = document.createElement("div");
  wrapper.className = "card-drag-image";
  wrapper.innerHTML = cardEl.outerHTML;
  const clone = wrapper.querySelector(".card");
  if (clone) {
    clone.classList.remove("dragging");
    clone.removeAttribute("style");
  }
  document.body.append(wrapper);
  return wrapper;
}

function manaIcon(color) {
  const label = `{${color}}`;
  return `<span class="mana-symbol" aria-hidden="true"><img src="${MANA_SYMBOL_URLS[color] || MANA_SYMBOL_URLS.C}" alt="${label}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false" /><span hidden>${label}</span></span>`;
}

function renderBattlefield(selfId, opponentId) {
  const self = state.players[selfId];
  const opponent = state.players[opponentId];
  self.battlefield = normalizeBattlefield(self.battlefield);
  opponent.battlefield = normalizeBattlefield(opponent.battlefield);
  const halfHeight = sharedBattlefieldHalfHeight(self, opponent);
  const minHalfHeight = defaultBattlefieldHalfHeight();
  const heightStyle = ` style="height: ${halfHeight * 2}px; --battlefield-min-h: ${minHalfHeight * 2}px;"`;
  return `
    <section class="battlefield-canvas shared-battlefield" data-self="${selfId}" data-opponent="${opponentId}" aria-label="共享战场画布"${heightStyle}>
      <div class="battlefield-half opponent-half">
        <div class="soft-zone soft-zone-creatures"></div>
        <div class="soft-zone soft-zone-other"></div>
        <div class="soft-zone soft-zone-lands"></div>
        ${renderBattlefieldMarkers(opponentId)}
        ${renderBattlefieldCards(opponentId)}
      </div>
      <div class="battlefield-divider"></div>
      <div class="battlefield-half self-half">
        <div class="soft-zone soft-zone-creatures"></div>
        <div class="soft-zone soft-zone-other"></div>
        <div class="soft-zone soft-zone-lands"></div>
        ${renderBattlefieldMarkers(selfId)}
        ${renderBattlefieldCards(selfId)}
      </div>
    </section>`;
}

function sharedBattlefieldHalfHeight(self, opponent) {
  const heights = [self.battlefield.height, opponent.battlefield.height].filter((height) =>
    Number.isFinite(height),
  );
  return Math.max(Math.round(Math.max(...heights, 0)), defaultBattlefieldHalfHeight());
}

function defaultBattlefieldHalfHeight() {
  return (BATTLE_CARD_GRID_H + SOFT_ZONE_EXTRA_GRID) * BATTLE_GRID_SIZE * DEFAULT_VISIBLE_SOFT_ZONES;
}

function renderBattlefieldCards(playerId) {
  const canControl = seat === playerId;
  return battlefieldCards(state.players[playerId])
    .map(
      (card) => `
        <div class="battlefield-piece ${card.tapped ? "tapped" : ""}" data-player="${playerId}" style="--grid-x: ${card.gridX}; --grid-y: ${card.gridY};">
          ${renderCard(playerId, card, "battlefield", canControl)}
        </div>`,
    )
    .join("");
}

function renderBattlefieldMarkers(playerId) {
  return state.players[playerId].battlefield.annotations
    .map((annotation) => {
      const marker = markerDefinition(annotation.kind);
      return `
        <div class="battlefield-marker" data-player="${playerId}" data-marker-id="${annotation.id}" style="--grid-x: ${annotation.gridX}; --grid-y: ${annotation.gridY}; --marker-color: ${annotation.color};">
          ${renderMarkerIcon(marker)}${annotation.text ? `<span>${escapeHtml(annotation.text)}</span>` : ""}
        </div>`;
    })
    .join("");
}

function markerDefinition(kind) {
  return MARKER_LIBRARY.find((item) => item.value === normalizeMarkerKind(kind)) || MARKER_LIBRARY[0];
}

function markerOptionLabel(item) {
  return item.symbol ? `{${item.symbol}} ${item.label}` : item.label;
}

function renderMarkerIcon(marker) {
  if (!marker?.symbol) {
    return `<strong class="marker-text-icon">${escapeHtml(marker?.label || "")}</strong>`;
  }
  const label = `{${marker.symbol}}`;
  return `
    <span class="marker-symbol-box">
      <img class="marker-symbol" src="${SCRYFALL_SYMBOL_BASE_URL}${marker.symbol}.svg" alt="${escapeHtml(label)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false" />
      <strong class="marker-text-icon" hidden>${escapeHtml(label)}</strong>
    </span>`;
}

function captureBattlefieldHeights() {
  applyBattlefieldHeights(readBattlefieldHeights());
}

function readBattlefieldHeights() {
  const heights = {};
  document.querySelectorAll(".shared-battlefield").forEach((canvas) => {
    const height = readBattlefieldHalfHeight(canvas);
    if (canvas.dataset.self) heights[canvas.dataset.self] = height;
    if (canvas.dataset.opponent) heights[canvas.dataset.opponent] = height;
  });
  return heights;
}

function readBattlefieldHalfHeight(canvas) {
  return Math.round(canvas.getBoundingClientRect().height / 2);
}

function applyBattlefieldHeights(heights) {
  Object.entries(heights).forEach(([playerId, height]) => {
    const player = state.players[playerId];
    if (!player) return;
    player.battlefield = normalizeBattlefield(player.battlefield);
    if (Number.isFinite(height) && height > 0) {
      player.battlefield.height = height;
    }
  });
}

function observeBattlefieldResize() {
  if (!("ResizeObserver" in window)) return;
  if (!battlefieldResizeObserver) {
    battlefieldResizeObserver = new ResizeObserver((entries) => {
      let changed = false;
      entries.forEach((entry) => {
        const halfHeight = readBattlefieldHalfHeight(entry.target);
        [entry.target.dataset.self, entry.target.dataset.opponent].forEach((playerId) => {
          const player = state.players[playerId];
          if (!player) return;
          player.battlefield = normalizeBattlefield(player.battlefield);
          if (Number.isFinite(halfHeight) && halfHeight > 0 && player.battlefield.height !== halfHeight) {
            player.battlefield.height = halfHeight;
            changed = true;
          }
          if (Number.isFinite(halfHeight) && halfHeight > 0 && clampBattlefieldToHalfHeight(player, halfHeight)) {
            syncBattlefieldPositionStyles(playerId, player);
            changed = true;
          }
        });
      });
      updateDefaultPlayerPanelPositions();
      if (changed) persistLocalState();
    });
  }
  battlefieldResizeObserver.disconnect();
  document.querySelectorAll(".shared-battlefield").forEach((canvas) => {
    battlefieldResizeObserver.observe(canvas);
  });
}

function clampBattlefieldToHalfHeight(player, halfHeight) {
  let changed = false;
  const halfGridHeight = Math.max(0, Math.floor(halfHeight / BATTLE_GRID_SIZE));
  battlefieldCards(player).forEach((card) => {
    const cardGridHeight = card.tapped ? BATTLE_CARD_GRID_W : BATTLE_CARD_GRID_H;
    const maxGridY = Math.max(0, halfGridHeight - cardGridHeight);
    const nextGridY = clampNumber(card.gridY || 0, 0, maxGridY);
    if (nextGridY !== card.gridY) {
      card.gridY = nextGridY;
      changed = true;
    }
  });
  player.battlefield.annotations.forEach((annotation) => {
    const maxGridY = Math.max(0, halfGridHeight - 3);
    const nextGridY = clampNumber(annotation.gridY || 0, 0, maxGridY);
    if (nextGridY !== annotation.gridY) {
      annotation.gridY = nextGridY;
      changed = true;
    }
  });
  return changed;
}

function syncBattlefieldPositionStyles(playerId, player) {
  document.querySelectorAll(`.battlefield-piece[data-player="${playerId}"]`).forEach((pieceEl) => {
    const cardId = pieceEl.dataset.cardId || pieceEl.querySelector(".card")?.dataset.cardId;
    const card = player.battlefield.cards.find((item) => item.id === cardId);
    if (!card) return;
    pieceEl.style.setProperty("--grid-y", card.gridY);
  });
  document.querySelectorAll(`.battlefield-marker[data-player="${playerId}"]`).forEach((markerEl) => {
    const marker = player.battlefield.annotations.find((item) => item.id === markerEl.dataset.markerId);
    if (!marker) return;
    markerEl.style.setProperty("--grid-y", marker.gridY);
  });
}

function renderCard(playerId, instance, zone, canControl, options = {}) {
  const card = getCardInfo(instance);
  const draggable = canControl && zone !== "detail" && options.draggable !== false ? ' draggable="true"' : "";
  const styleAttr = options.style ? ` style="${options.style}"` : "";
  const extraClass = options.className ? ` ${escapeHtml(options.className)}` : "";
  const cardKeyAttr = instance.cardKey ? ` data-card-key="${escapeHtml(instance.cardKey)}"` : "";
  return `
    <article class="card ${instance.tapped ? "tapped" : ""} ${instance.isToken ? "token-card" : ""} ${instance.faceDown ? "face-down-card" : ""} ${instance.flipAnimation ? "flip-reveal" : ""}${extraClass}" data-card-id="${instance.id}" data-player="${playerId}" data-zone="${zone}"${cardKeyAttr}${styleAttr}${draggable}>
      ${renderCardFace(card, instance)}
    </article>`;
}

function renderCardFace(card, instance = {}) {
  if (instance.flipAnimation && instance.flipFrom) {
    const fromInstance = instance.flipFrom || {};
    const fromCard = fromInstance.cardKey
      ? state.catalog[fromInstance.cardKey] || { name: fromInstance.cardKey, typeLine: "", image: "" }
      : card;
    return renderFlipFaceStack(
      renderCardFaceContent(fromCard, fromInstance),
      renderCardFaceContent(card, instance),
    );
  }
  return renderCardFaceContent(card, instance);
}

function renderCardFaceContent(card, instance = {}) {
  if (instance.faceDown) {
    return '<div class="card-back">Magic<br />Card</div>';
  }
  if (card.image) {
    return `<img src="${escapeHtml(imageSrc(card.image))}" alt="${escapeHtml(card.name)}" loading="lazy" draggable="false" />`;
  }
  return `<div class="fallback-face"><strong>${escapeHtml(card.name)}</strong><small>${escapeHtml(card.typeLine || "")}</small><p>${instance.isToken ? "衍生物" : "卡面图片未加载"}</p></div>`;
}

function renderFlipFaceStack(fromFace, toFace) {
  return `
    <div class="flip-face-stack">
      <div class="flip-face flip-face-front">${fromFace}</div>
      <div class="flip-face flip-face-back">${toFace}</div>
    </div>`;
}

function handleAction(button, playerId, root, options = {}) {
  const player = state.players[playerId];
  const action = button.dataset.action;
  if (seat !== playerId && !["open-zone"].includes(action)) return;

  if (action === "life") {
    player.life += Number(button.dataset.delta);
    saveState(`${player.name} 生命变为 ${player.life}`);
  }
  if (action === "mana") {
    const delta = options.manaDelta ?? 1;
    const color = button.dataset.color;
    player.mana[color] = Math.max(0, player.mana[color] + delta);
    saveState(`${player.name} ${delta > 0 ? "增加" : "减少"} ${color} 法术力`);
  }
  if (action === "untap-all") {
    battlefieldCards(player).forEach((card) => {
      card.tapped = false;
    });
    saveState(`${player.name} 重置全部永久物`);
  }
  if (action === "shuffle-library") {
    shuffle(player.library);
    saveState(`${player.name} 洗牌`);
  }
  if (action === "open-zone") {
    const zone = button.dataset.zone;
    const targetPlayer = button.dataset.player;
    openZone(targetPlayer, zone);
  }
  if (action === "create-token") {
    createToken(playerId, root);
  }
  if (action === "add-marker") {
    createBattlefieldMarker(root);
  }
}

function moveCard(playerId, cardId, from, to, options = {}) {
  const player = state.players[playerId];
  const sourceCard = findCardInZone(player, cardId, from);
  if (!sourceCard) return;
  if (sourceCard.isExtra && from.startsWith("battlefield") && (to === "hand" || to.startsWith("library"))) return;
  const card = removeCardFromZone(player, cardId, from);
  if (!card) return;
  const cardName = getCardInfo(card).name;
  if (card.isToken && from.startsWith("battlefield") && !to.startsWith("battlefield")) {
    saveState(`${player.name} 将衍生物 ${cardName} 移出战场并移除`);
    return;
  }
  card.tapped = to.startsWith("battlefield") ? card.tapped : false;
  if (to === "library" || to === "library-top") {
    player.library.unshift(card);
  } else if (to === "library-bottom") {
    player.library.push(card);
  } else if (to === "library-random") {
    const index = Math.floor(Math.random() * (player.library.length + 1));
    player.library.splice(index, 0, card);
  } else if (to === "battlefield" || to.startsWith("battlefield:")) {
    const position = options.position || nextBattlefieldPosition(player, classifyCard(card));
    card.gridX = position.gridX;
    card.gridY = position.gridY;
    player.battlefield.cards.push(card);
  } else if (to === "hand") {
    player.hand.push(card);
  } else {
    player[to].unshift(card);
  }
  const movedWithinBattlefield = from.startsWith("battlefield") && to.startsWith("battlefield");
  saveState(movedWithinBattlefield ? null : `${player.name} 将 ${cardName} 从${zoneLabel(from)}移到${zoneLabel(to)}`);
}

function createToken(playerId, root) {
  const player = state.players[playerId];
  const form = root.querySelector(".token-maker");
  if (!form) return;

  const input = form.querySelector("[name='token-name']");
  const name = input.value.trim();
  if (!name) {
    input.focus();
    return;
  }
  const typeLine = "Token";
  const cardKey = tokenCatalogKey(name, typeLine);

  state.catalog[cardKey] = {
    ...state.catalog[cardKey],
    name,
    typeLine,
    searchName: tokenSearchName(name),
  };
  rememberExtraDeckEntry(player, cardKey);
  const position = nextBattlefieldPosition(player, "other");
  player.battlefield.cards.push({
    id: crypto.randomUUID(),
    cardKey,
    tapped: false,
    isToken: true,
    gridX: position.gridX,
    gridY: position.gridY,
  });
  saveState(`${player.name} 创建 ${name} 衍生物`);
  refreshCatalogEntries([cardKey]);
}

function rememberExtraDeckEntry(player, cardKey) {
  player.extraDeck = normalizeExtraDeckList([...(player.extraDeck || []), { name: cardKey }]);
}

function tokenCatalogKey(name, typeLine) {
  return `token:${name}:${typeLine}`.toLowerCase();
}

function tokenSearchName(name) {
  return name.replace(/\s+token$/i, "").trim() || name;
}

function createBattlefieldMarker(root) {
  if (!["p1", "p2"].includes(seat)) return;
  const toolbar = root.querySelector(".marker-toolbar");
  if (!toolbar) return;
  const playerId = toolbar.querySelector("[name='marker-target']").value;
  const player = state.players[playerId];
  if (!player) return;
  updateMarkerToolbarState(toolbar);
  player.battlefield = normalizeBattlefield(player.battlefield);
  const marker = {
    id: crypto.randomUUID(),
    kind: markerToolbarState.kind,
    text: toolbar.querySelector("[name='marker-text']").value.trim().slice(0, 40),
    color: markerToolbarState.color,
    ...nextMarkerPosition(player),
  };
  player.battlefield.annotations.push(marker);
  toolbar.querySelector("[name='marker-text']").value = "";
  saveState(`${player.name} 添加标记`);
}

function nextMarkerPosition(player) {
  const count = player.battlefield.annotations.length;
  return {
    gridX: 2 + (count % 8) * 7,
    gridY: 2 + Math.floor(count / 8) * 4,
  };
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function handleDragStart(event, cardEl) {
  cardEl.classList.add("dragging");
  const isHandCard = cardEl.dataset.zone === "hand";
  const rect = cardEl.getBoundingClientRect();
  const sourceWidth = cardEl.offsetWidth || rect.width || 1;
  const sourceHeight = cardEl.offsetHeight || rect.height || 1;
  const offsetX = isHandCard
    ? clampNumber(((event.clientX - rect.left) / Math.max(rect.width, 1)) * sourceWidth, 0, sourceWidth)
    : event.clientX - rect.left;
  const offsetY = isHandCard
    ? clampNumber(((event.clientY - rect.top) / Math.max(rect.height, 1)) * sourceHeight, 0, sourceHeight)
    : event.clientY - rect.top;
  const payload = JSON.stringify({
    playerId: cardEl.dataset.player,
    cardId: cardEl.dataset.cardId,
    from: cardEl.dataset.zone,
    offsetX,
    offsetY,
  });
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/json", payload);
  event.dataTransfer.setData("text/plain", payload);
  if (isHandCard) {
    const dragImage = createHandCardDragImage(cardEl);
    event.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
    window.setTimeout(() => dragImage.remove(), 0);
  }
}

function handleLibraryDragStart(event, libraryEl) {
  const playerId = libraryEl.dataset.player;
  if (seat !== playerId) return;
  const card = state.players[playerId]?.library?.[0];
  if (!card) {
    event.preventDefault();
    return;
  }

  libraryEl.classList.add("dragging");
  const rect = libraryEl.getBoundingClientRect();
  const payload = JSON.stringify({
    playerId,
    cardId: card.id,
    from: "library",
    offsetX: rect.width / 2,
    offsetY: rect.height / 2,
  });
  const dragImage = createCardBackDragImage();
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/json", payload);
  event.dataTransfer.setData("text/plain", payload);
  event.dataTransfer.setDragImage(dragImage, dragImage.offsetWidth / 2, dragImage.offsetHeight / 2);
  window.setTimeout(() => dragImage.remove(), 0);
}

function handleExtraDragStart(event, extraEl) {
  const playerId = extraEl.dataset.player;
  if (seat !== playerId || !state.players[playerId]?.extraDeck?.length) {
    event.preventDefault();
    return;
  }
  extraEl.classList.add("dragging");
  setZoneSelectionDragPayload(event, {
    playerId,
    from: "extra",
  });
}

function handleStackZoneDragStart(event, zoneEl) {
  const playerId = zoneEl.dataset.player;
  const zone = zoneEl.dataset.zone;
  if (seat !== playerId || !["graveyard", "exile"].includes(zone) || !getZoneCards(state.players[playerId], zone).length) {
    event.preventDefault();
    return;
  }
  zoneEl.classList.add("dragging");
  setZoneSelectionDragPayload(event, {
    playerId,
    from: zone,
  });
}

function setZoneSelectionDragPayload(event, payloadData) {
  const rect = event.currentTarget.getBoundingClientRect();
  const payload = JSON.stringify({
    type: "zone-select",
    offsetX: rect.width / 2,
    offsetY: rect.height / 2,
    ...payloadData,
  });
  const dragImage = createCardBackDragImage();
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/json", payload);
  event.dataTransfer.setData("text/plain", payload);
  event.dataTransfer.setDragImage(dragImage, dragImage.offsetWidth / 2, dragImage.offsetHeight / 2);
  window.setTimeout(() => dragImage.remove(), 0);
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
  event.dataTransfer.dropEffect = "move";
}

function clearDragState() {
  document.querySelectorAll(".dragging, .drag-over").forEach((element) => {
    element.classList.remove("dragging", "drag-over");
  });
}

function readDragPayload(event) {
  try {
    const payload = event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

async function handleBattlefieldDrop(event, canvasEl) {
  event.preventDefault();
  canvasEl.classList.remove("drag-over");
  try {
    const payload = readDragPayload(event);
    if (!payload || ![canvasEl.dataset.self, canvasEl.dataset.opponent].includes(payload.playerId) || seat !== payload.playerId) return;
    if (payload.type === "zone-select") {
      await handleZoneSelectionBattlefieldDrop(event, payload, canvasEl);
      return;
    }
    const player = state.players[payload.playerId];
    const card = findCardInZone(player, payload.cardId, payload.from);
    if (!card) return;
    const position = battlefieldDropPosition(event, payload, canvasEl, card);
    moveCard(payload.playerId, payload.cardId, payload.from, "battlefield", { position });
  } finally {
    clearDragState();
  }
}

async function handleZoneDrop(event, dropEl) {
  event.preventDefault();
  dropEl.classList.remove("drag-over");
  try {
    const payload = readDragPayload(event);
    if (!payload || payload.playerId !== dropEl.dataset.player || seat !== payload.playerId) return;
    const to = dropEl.dataset.dropZone;
    if (!to || to === payload.from) return;
    if (payload.type === "zone-select") {
      await handleZoneSelectionZoneDrop(event, payload, to);
      return;
    }
    const player = state.players[payload.playerId];
    const card = findCardInZone(player, payload.cardId, payload.from);
    if (!card) return;
    const destination = to === "library"
      ? await chooseLibraryDestination(payload.playerId, card, pointerAnchor(event))
      : to;
    if (!destination) return;
    moveCard(payload.playerId, payload.cardId, payload.from, destination);
  } finally {
    clearDragState();
  }
}

async function handleZoneSelectionBattlefieldDrop(event, payload, canvasEl) {
  if (!["extra", "graveyard", "exile"].includes(payload.from)) return;
  const player = state.players[payload.playerId];
  const placeholder = makeFaceDownPlaceholder();
  const position = battlefieldDropPosition(event, payload, canvasEl, placeholder);
  placeholder.gridX = position.gridX;
  placeholder.gridY = position.gridY;
  player.battlefield.cards.push(placeholder);
  render({ captureLayout: false });

  const selection = await chooseZoneCard(payload.playerId, payload.from);
  if (!selection) {
    removeCardFromZone(player, placeholder.id, "battlefield");
    render({ captureLayout: false });
    return;
  }
  const livePlaceholder = findCardInZone(player, placeholder.id, "battlefield");
  if (!livePlaceholder) return;
  const selectedCard = payload.from === "extra"
    ? makeExtraDeckCard(selection.cardKey)
    : takeZoneSelectionCard(player, payload.from, selection);
  if (!selectedCard) {
    removeCardFromZone(player, placeholder.id, "battlefield");
    render({ captureLayout: false });
    return;
  }
  revealPlaceholderCard(livePlaceholder, selectedCard);
  saveState(`${player.name} 将 ${getCardInfo(livePlaceholder).name} 移到战场`);
  scheduleFlipCleanup(livePlaceholder.id);
}

async function handleZoneSelectionZoneDrop(event, payload, to) {
  if (!["graveyard", "exile"].includes(payload.from)) return;
  if (!["hand", "library", "graveyard", "exile"].includes(to) || to === payload.from) return;
  const player = state.players[payload.playerId];

  if (to === "hand") {
    const placeholder = makeFaceDownPlaceholder();
    player.hand.push(placeholder);
    render({ captureLayout: false });
    const selection = await chooseZoneCard(payload.playerId, payload.from);
    const candidate = findZoneSelectionCard(player, payload.from, selection);
    if (!candidate || candidate.isExtra) {
      removeCardFromZone(player, placeholder.id, "hand");
      render({ captureLayout: false });
      return;
    }
    const selectedCard = takeZoneSelectionCard(player, payload.from, selection);
    if (!selectedCard) {
      removeCardFromZone(player, placeholder.id, "hand");
      render({ captureLayout: false });
      return;
    }
    revealPlaceholderCard(placeholder, selectedCard);
    saveState(`${player.name} 将 ${getCardInfo(placeholder).name} 从${zoneLabel(payload.from)}移到手牌`);
    scheduleFlipCleanup(placeholder.id);
    return;
  }

  const selection = await chooseZoneCard(payload.playerId, payload.from);
  const candidate = findZoneSelectionCard(player, payload.from, selection);
  if (!candidate) return;
  if (to === "library") {
    if (candidate.isExtra) return;
    const destination = await chooseLibraryDestination(payload.playerId, candidate, pointerAnchor(event));
    if (!destination) return;
    const selectedCard = takeZoneSelectionCard(player, payload.from, selection);
    if (!selectedCard) return;
    putCardInZone(player, selectedCard, destination);
    saveState(`${player.name} 将 ${getCardInfo(selectedCard).name} 从${zoneLabel(payload.from)}移到${zoneLabel(destination)}`);
    return;
  }
  const selectedCard = takeZoneSelectionCard(player, payload.from, selection);
  if (!selectedCard) return;
  putCardInZone(player, selectedCard, to);
  saveState(`${player.name} 将 ${getCardInfo(selectedCard).name} 从${zoneLabel(payload.from)}移到${zoneLabel(to)}`);
}

function chooseLibraryDestination(playerId, card, anchor = null) {
  if (!els.libraryMoveDialog) return Promise.resolve("library-top");
  const player = state.players[playerId];
  const cardName = getCardInfo(card).name;
  const dialog = els.libraryMoveDialog;
  els.libraryMoveTitle.textContent = "移到牌库";
  els.libraryMoveMeta.textContent = `${player.name} - ${cardName}`;
  prepareLibraryMoveDialogPosition(dialog, anchor);

  return new Promise((resolve) => {
    let settled = false;
    const cleanup = () => {
      dialog.removeEventListener("click", handleClick);
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
      resetLibraryMoveDialogPosition(dialog);
    };
    const finish = (destination) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (dialog.open) dialog.close();
      resolve(destination || null);
    };
    const handleClick = (event) => {
      const button = event.target.closest("[data-library-destination]");
      if (!button) return;
      finish(button.dataset.libraryDestination);
    };
    const handleCancel = (event) => {
      event.preventDefault();
      finish(null);
    };
    const handleClose = () => {
      finish(null);
    };

    dialog.addEventListener("click", handleClick);
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    showDialog(dialog);
    positionLibraryMoveDialog(dialog, anchor);
  });
}

function pointerAnchor(event) {
  if (!Number.isFinite(event?.clientX) || !Number.isFinite(event?.clientY)) return null;
  return { x: event.clientX, y: event.clientY };
}

function prepareLibraryMoveDialogPosition(dialog, anchor) {
  if (!anchor) {
    resetLibraryMoveDialogPosition(dialog);
    return;
  }
  dialog.classList.add("pointer-dialog");
  dialog.style.left = `${anchor.x + 12}px`;
  dialog.style.top = `${anchor.y + 12}px`;
}

function positionLibraryMoveDialog(dialog, anchor) {
  if (!anchor) return;
  const margin = 12;
  const offset = 12;
  const rect = dialog.getBoundingClientRect();
  const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxY = Math.max(margin, window.innerHeight - rect.height - margin);
  const x = clampNumber(anchor.x + offset, margin, maxX);
  const y = clampNumber(anchor.y + offset, margin, maxY);
  dialog.style.left = `${x}px`;
  dialog.style.top = `${y}px`;
}

function resetLibraryMoveDialogPosition(dialog) {
  dialog.classList.remove("pointer-dialog");
  dialog.style.left = "";
  dialog.style.top = "";
}

function showDialog(dialog) {
  if (!dialog || dialog.open) return;
  dialog.showModal();
}

function closeDialogOnBackdropClick(dialog) {
  if (!dialog) return;
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const outsideDialog =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (outsideDialog) dialog.close();
  });
}

function battlefieldDropPosition(event, payload, canvasEl, card) {
  const halfEl = payload.playerId === canvasEl.dataset.opponent
    ? canvasEl.querySelector(".opponent-half")
    : canvasEl.querySelector(".self-half");
  const rect = halfEl.getBoundingClientRect();
  const rawX = event.clientX - rect.left + canvasEl.scrollLeft - (payload.offsetX || 0);
  const rawY = event.clientY - rect.top + canvasEl.scrollTop - (payload.offsetY || 0);
  return snapBattlefieldPosition(rawX, rawY, halfEl, card);
}

function snapBattlefieldPosition(x, y, canvasEl, card) {
  const widthGrid = card?.tapped ? BATTLE_CARD_GRID_H : BATTLE_CARD_GRID_W;
  const heightGrid = card?.tapped ? BATTLE_CARD_GRID_W : BATTLE_CARD_GRID_H;
  const maxGridX = Math.max(0, Math.floor((canvasEl.clientWidth - widthGrid * BATTLE_GRID_SIZE) / BATTLE_GRID_SIZE));
  const maxGridY = Math.max(0, Math.floor((canvasEl.clientHeight - heightGrid * BATTLE_GRID_SIZE) / BATTLE_GRID_SIZE));
  return {
    gridX: clampNumber(Math.round(x / BATTLE_GRID_SIZE), 0, maxGridX),
    gridY: clampNumber(Math.round(y / BATTLE_GRID_SIZE), 0, maxGridY),
  };
}

function nextBattlefieldPosition(player, lane = "other", offset = 0) {
  const cards = battlefieldCards(player);
  const baseY = {
    creatures: 2,
    other: 14,
    lands: 26,
  }[lane] ?? 14;
  const sameRowCount = cards.filter((card) => Math.abs((card.gridY ?? 0) - baseY) < 4).length + offset;
  return {
    gridX: 1 + (sameRowCount % 8) * 10,
    gridY: baseY + Math.floor(sameRowCount / 8) * 12,
  };
}

function handleCardContextMenu(event, cardEl) {
  event.preventDefault();
  if (seat !== cardEl.dataset.player) return;
  const player = state.players[cardEl.dataset.player];
  const card = findCardInZone(player, cardEl.dataset.cardId, cardEl.dataset.zone);
  if (!card) return;
  card.tapped = !card.tapped;
  saveState(`${player.name} ${card.tapped ? "横置" : "重置"} ${getCardInfo(card).name}`);
}

function bindBattlefieldMarkers(root) {
  root.querySelectorAll(".battlefield-marker").forEach((markerEl) => {
    markerEl.addEventListener("contextmenu", (event) => deleteBattlefieldMarker(event, markerEl));
    markerEl.addEventListener("pointerdown", (event) => startMarkerDrag(event, markerEl));
  });
}

function deleteBattlefieldMarker(event, markerEl) {
  event.preventDefault();
  if (!["p1", "p2"].includes(seat)) return;
  const player = state.players[markerEl.dataset.player];
  player.battlefield.annotations = player.battlefield.annotations.filter(
    (annotation) => annotation.id !== markerEl.dataset.markerId,
  );
  saveState(`${player.name} 移除标记`);
}

function startMarkerDrag(event, markerEl) {
  if (event.button !== 0 || !["p1", "p2"].includes(seat)) return;
  const player = state.players[markerEl.dataset.player];
  const marker = player.battlefield.annotations.find((annotation) => annotation.id === markerEl.dataset.markerId);
  if (!marker) return;
  const halfEl = markerEl.closest(".battlefield-half");
  const isOpponentHalf = halfEl?.classList.contains("opponent-half");
  markerEl.setPointerCapture(event.pointerId);
  markerEl.classList.add("dragging");

  const moveMarker = (moveEvent) => {
    if (moveEvent.pointerId !== event.pointerId) return;
    const position = markerDropPosition(moveEvent, halfEl, isOpponentHalf);
    marker.gridX = position.gridX;
    marker.gridY = position.gridY;
    markerEl.style.setProperty("--grid-x", marker.gridX);
    markerEl.style.setProperty("--grid-y", marker.gridY);
    moveEvent.preventDefault();
  };

  const finishMarker = (upEvent) => {
    if (upEvent.pointerId !== event.pointerId) return;
    markerEl.classList.remove("dragging");
    markerEl.removeEventListener("pointermove", moveMarker);
    markerEl.removeEventListener("pointerup", finishMarker);
    markerEl.removeEventListener("pointercancel", finishMarker);
    saveState(`${player.name} 移动标记`);
  };

  markerEl.addEventListener("pointermove", moveMarker);
  markerEl.addEventListener("pointerup", finishMarker);
  markerEl.addEventListener("pointercancel", finishMarker);
}

function markerDropPosition(event, halfEl, isOpponentHalf) {
  const rect = halfEl.getBoundingClientRect();
  const x = isOpponentHalf ? rect.right - event.clientX : event.clientX - rect.left;
  const y = isOpponentHalf ? rect.bottom - event.clientY : event.clientY - rect.top;
  const maxGridX = Math.max(0, Math.floor((halfEl.clientWidth - BATTLE_GRID_SIZE * 4) / BATTLE_GRID_SIZE));
  const maxGridY = Math.max(0, Math.floor((halfEl.clientHeight - BATTLE_GRID_SIZE * 3) / BATTLE_GRID_SIZE));
  return {
    gridX: clampNumber(Math.round(x / BATTLE_GRID_SIZE), 0, maxGridX),
    gridY: clampNumber(Math.round(y / BATTLE_GRID_SIZE), 0, maxGridY),
  };
}

function openZone(playerId, zone) {
  const player = state.players[playerId];
  const cards = getZoneCards(player, zone);
  const canControl = seat === playerId;
  els.zoneTitle.textContent = `${player.name} - ${zoneLabel(zone)}`;
  els.zoneMeta.textContent = `${zone === "extra" ? player.extraDeck.length : cards.length} 张`;
  if (zone === "library") {
    els.zoneCards.innerHTML = renderLibraryList(player);
    bindLibraryListCards(els.zoneCards);
    showDialog(els.zoneDialog);
    return;
  }
  if (zone === "extra") {
    els.zoneCards.innerHTML = renderExtraList(player);
    bindLibraryListCards(els.zoneCards);
    showDialog(els.zoneDialog);
    return;
  }
  if (["graveyard", "exile"].includes(zone)) {
    els.zoneCards.innerHTML = renderOrderedZoneList(player, zone);
    bindZoneInstanceListCards(els.zoneCards);
    showDialog(els.zoneDialog);
    return;
  }
  if (zone === "hand" && !canControl) {
    els.zoneCards.innerHTML = cards.map(renderCardBack).join("");
    showDialog(els.zoneDialog);
    return;
  }
  els.zoneCards.innerHTML = cards
    .map((card) => renderCard(playerId, card, zone, canControl))
    .join("");
  els.zoneCards.querySelectorAll(".card").forEach((cardEl) => {
    cardEl.addEventListener("dblclick", () => openCard(cardEl.dataset.cardId));
    if (cardEl.dataset.player === seat) {
      cardEl.addEventListener("contextmenu", (event) => handleCardContextMenu(event, cardEl));
      cardEl.addEventListener("dragstart", (event) => handleDragStart(event, cardEl));
      cardEl.addEventListener("dragend", () => clearDragState());
    }
  });
  showDialog(els.zoneDialog);
}

function openCard(cardId) {
  const instance = findInstance(cardId);
  if (!instance) return;
  openCardDetail({
    englishCard: getCardInfo(instance),
    searchName: catalogSearchName(instance.cardKey, getCardInfo(instance)),
    instance: { ...instance, tapped: false },
  });
}

function openLookupCard() {
  if (!lookupCardDetail) return;
  openCardDetail({
    englishCard: lookupCardDetail,
    searchName: lookupCardDetail.name,
  });
}

function openLibraryCard(cardKey) {
  const card = state.catalog[cardKey] || { name: cardKey, typeLine: "", image: "" };
  openCardDetail({
    englishCard: card,
    searchName: catalogSearchName(cardKey, card),
  });
}

function openCardDetail({ englishCard, searchName, instance = null }) {
  cardDetailRequestId += 1;
  cardDetailState = {
    requestId: cardDetailRequestId,
    language: "en",
    loadingChinese: false,
    chineseFailed: false,
    flipAnimation: false,
    englishCard,
    chineseCard: chineseDetailCache.get(normalizeDetailSearchName(searchName)) || null,
    searchName,
    instance,
  };
  renderCardDetail();
  showDialog(els.cardDialog);
}

function renderCardDetail() {
  if (!cardDetailState) return;
  const card = currentDetailCard();
  els.cardDetail.innerHTML = renderDetailCard(card, cardDetailState.instance);
  els.cardDetail.querySelector(".card")?.addEventListener("click", toggleCardDetailLanguage);
}

function currentDetailCard() {
  if (!cardDetailState) return null;
  return cardDetailState.language === "zh" && cardDetailState.chineseCard
    ? cardDetailState.chineseCard
    : cardDetailState.englishCard;
}

function startCardDetailFlipFromCurrent() {
  if (!cardDetailState) return;
  cardDetailState.flipFromCard = currentDetailCard();
  cardDetailState.flipAnimation = true;
}

async function toggleCardDetailLanguage() {
  if (!cardDetailState) return;
  if (cardDetailState.loadingChinese) return;
  if (cardDetailState.language === "zh" && cardDetailState.chineseCard) {
    startCardDetailFlipFromCurrent();
    cardDetailState.language = "en";
    renderCardDetail();
    return;
  }
  if (cardDetailState.chineseCard) {
    startCardDetailFlipFromCurrent();
    cardDetailState.language = "zh";
    renderCardDetail();
    return;
  }

  const requestId = cardDetailState.requestId;
  const searchName = cardDetailState.searchName;
  cardDetailState.loadingChinese = true;
  cardDetailState.chineseFailed = false;
  renderCardDetail();
  const chineseCard = await fetchChineseDetailCard(searchName);
  if (!cardDetailState || cardDetailState.requestId !== requestId) return;
  cardDetailState.loadingChinese = false;
  if (chineseCard) {
    startCardDetailFlipFromCurrent();
    cardDetailState.chineseCard = chineseCard;
    cardDetailState.language = "zh";
    chineseDetailCache.set(normalizeDetailSearchName(searchName), chineseCard);
  } else {
    cardDetailState.chineseFailed = true;
  }
  renderCardDetail();
}

function findInstance(cardId) {
  for (const player of Object.values(state.players)) {
    for (const zone of ["library", "hand", "battlefield", "graveyard", "exile"]) {
      const card = getZoneCards(player, zone).find((item) => item.id === cardId);
      if (card) return card;
    }
  }
  return null;
}

function getCardInfo(instance) {
  return state.catalog[instance.cardKey] || { name: instance.cardKey, typeLine: "", image: "" };
}

function classifyCard(instance) {
  const typeLine = getCardInfo(instance).typeLine.toLowerCase();
  if (typeLine.includes("land")) return "lands";
  if (typeLine.includes("creature")) return "creatures";
  return "other";
}

function getZoneCards(player, zone) {
  if (zone === "battlefield") return battlefieldCards(player);
  if (zone.startsWith("battlefield:")) return battlefieldCards(player);
  return player[zone] || [];
}

function battlefieldCards(player) {
  player.battlefield = normalizeBattlefield(player.battlefield);
  return player.battlefield.cards;
}

function findCardInZone(player, cardId, zone) {
  return getZoneCards(player, zone).find((card) => card.id === cardId);
}

function findFirstCardByKey(player, zone, cardKey) {
  return getZoneCards(player, zone).find((card) => card.cardKey === cardKey);
}

function removeCardFromZone(player, cardId, zone) {
  const source = getZoneCards(player, zone);
  const index = source.findIndex((card) => card.id === cardId);
  if (index < 0) return null;
  const [card] = source.splice(index, 1);
  return card;
}

function takeFirstCardByKey(player, zone, cardKey) {
  const source = getZoneCards(player, zone);
  const index = source.findIndex((card) => card.cardKey === cardKey);
  if (index < 0) return null;
  const [card] = source.splice(index, 1);
  return card;
}

function findZoneSelectionCard(player, zone, selection) {
  if (!selection) return null;
  if (selection.cardId) return findCardInZone(player, selection.cardId, zone);
  if (selection.cardKey) return findFirstCardByKey(player, zone, selection.cardKey);
  return null;
}

function takeZoneSelectionCard(player, zone, selection) {
  if (!selection) return null;
  if (selection.cardId) return removeCardFromZone(player, selection.cardId, zone);
  if (selection.cardKey) return takeFirstCardByKey(player, zone, selection.cardKey);
  return null;
}

function putCardInZone(player, card, zone) {
  card.faceDown = false;
  card.flipAnimation = false;
  card.tapped = zone.startsWith("battlefield") ? card.tapped : false;
  if (zone === "library" || zone === "library-top") {
    player.library.unshift(card);
  } else if (zone === "library-bottom") {
    player.library.push(card);
  } else if (zone === "library-random") {
    const index = Math.floor(Math.random() * (player.library.length + 1));
    player.library.splice(index, 0, card);
  } else if (zone === "hand") {
    player.hand.push(card);
  } else {
    player[zone].unshift(card);
  }
}

function putCardsInZone(player, cards, zone) {
  if (!cards.length) return;
  if (zone === "library" || zone === "library-top") {
    for (let index = cards.length - 1; index >= 0; index -= 1) {
      player.library.unshift(cards[index]);
    }
    return;
  }
  if (zone === "library-bottom") {
    player.library.push(...cards);
    return;
  }
  if (zone === "library-random") {
    cards.forEach((card) => {
      const index = Math.floor(Math.random() * (player.library.length + 1));
      player.library.splice(index, 0, card);
    });
    return;
  }
  if (zone === "hand") {
    player.hand.push(...cards);
    return;
  }
  player[zone].unshift(...cards);
}

function makeFaceDownPlaceholder() {
  return {
    id: crypto.randomUUID(),
    cardKey: "",
    tapped: false,
    faceDown: true,
  };
}

function makeExtraDeckCard(cardKey) {
  if (cardKey.startsWith("token:")) {
    return {
      id: crypto.randomUUID(),
      cardKey,
      tapped: false,
      isToken: true,
    };
  }
  return {
    id: crypto.randomUUID(),
    cardKey,
    tapped: false,
    isExtra: true,
  };
}

function revealPlaceholderCard(placeholder, selectedCard) {
  const position = {
    gridX: placeholder.gridX,
    gridY: placeholder.gridY,
  };
  const flipFrom = {
    cardKey: placeholder.cardKey || "",
    faceDown: Boolean(placeholder.faceDown),
    isToken: Boolean(placeholder.isToken),
  };
  Object.keys(placeholder).forEach((key) => delete placeholder[key]);
  Object.assign(placeholder, {
    ...selectedCard,
    ...position,
    faceDown: false,
    flipAnimation: true,
    flipFrom,
  });
}

function scheduleFlipCleanup(cardId) {
  window.setTimeout(() => {
    const instance = findInstance(cardId);
    if (!instance?.flipAnimation) return;
    delete instance.flipAnimation;
    delete instance.flipFrom;
    saveState(null, { captureLayout: false });
  }, 700);
}

function imageSrc(url) {
  return url || "";
}

function zoneLabel(zone) {
  return {
    library: "牌库",
    extra: "额外",
    hand: "手牌",
    battlefield: "战场",
    "battlefield:lands": "地牌区",
    "battlefield:creatures": "生物区",
    "battlefield:other": "其他永久物区",
    graveyard: "墓地",
    exile: "放逐",
    "library-top": "牌库顶",
    "library-bottom": "牌库底",
    "library-random": "牌库中",
  }[zone];
}

function renderLibraryList(player) {
  const counts = countCardsByKey(player.library);
  const deckList = player.deckList?.length ? player.deckList : normalizeDeckList(inferDeckList(player));
  const rows = deckList
    .map((entry) => ({ ...entry, remaining: counts.get(entry.name) || 0 }))
    .filter((entry) => entry.remaining > 0);
  if (!rows.length) return "";
  return `
    <div class="library-list">
      ${rows
        .map((entry) => {
          const card = state.catalog[entry.name] || { name: entry.name, typeLine: "", image: "" };
          return `
            <button class="library-card" type="button" data-card-key="${escapeHtml(entry.name)}" data-remaining="${entry.remaining}" aria-label="查看 ${escapeHtml(card.name)} 大图">
              <div class="library-face">
                ${renderLibraryFace(card, entry.remaining)}
              </div>
            </button>`;
        })
        .join("")}
    </div>`;
}

function renderExtraList(player) {
  const rows = normalizeExtraDeckList(player.extraDeck).map((entry) => ({ name: entry.name, remaining: null }));
  return renderCardListRows(rows);
}

function renderOrderedZoneList(player, zone) {
  const cards = getZoneCards(player, zone);
  if (!cards.length) return "";
  return `
    <div class="library-list">
      ${cards
        .map((instance) => {
          const card = getCardInfo(instance);
          return `
            <button class="library-card" type="button" data-card-id="${escapeHtml(instance.id)}" aria-label="查看 ${escapeHtml(card.name)} 大图">
              <div class="library-face">
                ${renderLibraryFace(card, null)}
              </div>
            </button>`;
        })
        .join("")}
    </div>`;
}

function renderCardListRows(rows) {
  if (!rows.length) return "";
  return `
    <div class="library-list">
      ${rows
        .map((entry) => {
          const card = state.catalog[entry.name] || { name: entry.name, typeLine: "", image: "" };
          return `
            <button class="library-card" type="button" data-card-key="${escapeHtml(entry.name)}" data-remaining="${entry.remaining ?? ""}" aria-label="查看 ${escapeHtml(card.name)} 大图">
              <div class="library-face">
                ${renderLibraryFace(card, entry.remaining)}
              </div>
            </button>`;
        })
        .join("")}
    </div>`;
}

function bindLibraryListCards(root) {
  root.querySelectorAll(".library-card[data-card-key]").forEach((button) => {
    button.addEventListener("click", () => openLibraryCard(button.dataset.cardKey));
  });
}

function bindZoneInstanceListCards(root) {
  root.querySelectorAll(".library-card[data-card-id]").forEach((button) => {
    button.addEventListener("click", () => openCard(button.dataset.cardId));
  });
}

function chooseZoneCard(playerId, zone) {
  const player = state.players[playerId];
  const cards = getZoneCards(player, zone);
  const rows = zone === "extra"
    ? normalizeExtraDeckList(player.extraDeck).map((entry) => ({ name: entry.name, remaining: null }))
    : [];
  if (zone === "extra" ? !rows.length : !cards.length) return Promise.resolve(null);

  els.zoneTitle.textContent = `${player.name} - 选择${zoneLabel(zone)}`;
  els.zoneMeta.textContent = zone === "extra" ? `${rows.length} 种` : `${cards.length} 张`;
  els.zoneCards.innerHTML = zone === "extra" ? renderCardListRows(rows) : renderOrderedZoneList(player, zone);

  return new Promise((resolve) => {
    let settled = false;
    const cleanup = () => {
      els.zoneCards.removeEventListener("click", handleClick);
      els.zoneDialog.removeEventListener("close", handleClose);
    };
    const finish = (selection) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (els.zoneDialog.open) els.zoneDialog.close();
      resolve(selection || null);
    };
    const handleClick = (event) => {
      const button = event.target.closest(".library-card[data-card-key], .library-card[data-card-id]");
      if (!button) return;
      finish(button.dataset.cardId ? { cardId: button.dataset.cardId } : { cardKey: button.dataset.cardKey });
    };
    const handleClose = () => {
      finish(null);
    };

    els.zoneCards.addEventListener("click", handleClick);
    els.zoneDialog.addEventListener("close", handleClose);
    showDialog(els.zoneDialog);
  });
}

function renderLibraryFace(card, remaining) {
  const face = card.image
    ? `<img src="${escapeHtml(imageSrc(card.image))}" alt="${escapeHtml(card.name)}" loading="lazy" draggable="false" />`
    : `<div class="card-back">Magic<br />Card</div>`;
  return `${face}${Number.isFinite(remaining) ? `<span class="library-count">x${remaining}</span>` : ""}`;
}

function countCardsByKey(cards) {
  const counts = new Map();
  cards.forEach((card) => {
    counts.set(card.cardKey, (counts.get(card.cardKey) || 0) + 1);
  });
  return counts;
}

function importDeck(playerId, raw) {
  const parsed = parseDeckList(raw);
  const entries = normalizeDeckList(parsed.main).map((entry) => [entry.name, entry.count]);
  const extraEntries = normalizeExtraDeckList(parsed.extra);
  if (!entries.length && !extraEntries.length) return;
  const player = state.players[playerId];
  for (const name of [...entries.map(([entryName]) => entryName), ...extraEntries.map((entry) => entry.name)]) {
    if (!state.catalog[name]) state.catalog[name] = { name, typeLine: "", image: "" };
  }
  player.library = buildDeck(entries);
  player.extraDeck = extraEntries;
  player.deckList = normalizeDeckList(entries);
  shuffle(player.library);
  player.hand = player.library.splice(0, 7);
  player.battlefield = makeBattlefield();
  player.graveyard = [];
  player.exile = [];
  hydrateCatalogRunning = true;
  saveState(`${player.name} 导入牌库并抓起手七张`);
  refreshCatalogEntries([...entries.map(([name]) => name), ...extraEntries.map((entry) => entry.name)]).finally(() => {
    hydrateCatalogRunning = false;
    hydrateMissingCatalogImages();
  });
}

function parseDeckList(raw) {
  const main = [];
  const extra = [];
  let section = "main";
  raw.split("\n").forEach((rawLine) => {
    const line = rawLine.replace(/\s+\/\/.*$/, "").trim();
    if (!line || line.startsWith("//")) return;
    if (/^(extra|extras|extra deck|额外|额外牌组|额外卡组):?$/i.test(line)) {
      section = "extra";
      return;
    }
    if (/^sideboard:?$/i.test(line) || /^sb:?$/i.test(line)) {
      section = "sideboard";
      return;
    }
    if (/^(deck|commander):?$/i.test(line)) return;
    if (/^SB:\s*\d+/i.test(line)) return;
    if (section === "sideboard") return;

    const match = line.match(/^(\d+)x?\s+(.+)$/i);
    if (section === "extra") {
      const name = cleanDeckCardName(match ? match[2] : line);
      if (name) extra.push(name);
      return;
    }
    const count = match ? Number(match[1]) : 1;
    const name = cleanDeckCardName(match ? match[2] : line);
    if (name && count > 0) main.push([name, count]);
  });
  return { main, extra };
}

function cleanDeckCardName(name) {
  return name
    .replace(/\s+\([A-Z0-9]+\)\s+\d+[a-z]?$/i, "")
    .replace(/\s+\*\w+\*$/i, "")
    .trim();
}

async function fetchCard(name) {
  const exactCard = await fetchExactCard(name);
  if (exactCard) return exactCard;
  return { name, typeLine: "", image: "" };
}

async function fetchExactCard(name) {
  try {
    const response = await fetch(`${SCRYFALL_NAMED_URL}${encodeURIComponent(name)}`);
    if (!response.ok) return null;
    const card = await response.json();
    return cardFromScryfall(card, name);
  } catch {
    return null;
  }
}

async function fetchChineseDetailCard(name) {
  const exactName = escapeScryfallQueryString(normalizeDetailSearchName(name));
  if (!exactName) return null;
  for (const language of ["zhs", "zht"]) {
    const card = await fetchFirstScryfallSearchResult(`!"${exactName}" lang:${language}`, name);
    if (card?.image) return card;
  }
  return null;
}

async function fetchFirstScryfallSearchResult(query, fallbackName) {
  try {
    const response = await fetch(`${SCRYFALL_SEARCH_URL}${encodeURIComponent(query)}`);
    if (!response.ok) return null;
    const payload = await response.json();
    const card = payload.data?.[0];
    return card ? cardFromScryfall(card, fallbackName) : null;
  } catch {
    return null;
  }
}

function escapeScryfallQueryString(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function normalizeDetailSearchName(name) {
  return String(name || "")
    .replace(/\s+token$/i, "")
    .trim();
}

function cardFromScryfall(card, fallbackName) {
  const face = chooseScryfallFace(card, fallbackName);
  const faces = card.card_faces || [];
  const oracleText = face?.oracle_text || card.oracle_text || faces.map((item) => item.oracle_text).filter(Boolean).join("\n\n");
  return {
    name: face?.name || card.name || fallbackName,
    manaCost: face?.mana_cost || card.mana_cost || "",
    typeLine:
      face?.type_line ||
      card.type_line ||
      "",
    oracleText,
    power: face?.power || card.power || "",
    toughness: face?.toughness || card.toughness || "",
    loyalty: face?.loyalty || card.loyalty || "",
    colors: card.colors || face?.colors || [],
    colorIdentity: card.color_identity || [],
    rarity: card.rarity || "",
    setName: card.set_name || "",
    collectorNumber: card.collector_number || "",
    releasedAt: card.released_at || "",
    legalities: card.legalities || {},
    image:
      card.image_uris?.border_crop ||
      card.image_uris?.normal ||
      face?.image_uris?.border_crop ||
      face?.image_uris?.normal ||
      "",
  };
}

function chooseScryfallFace(card, fallbackName) {
  const faces = card.card_faces || [];
  if (!faces.length) return null;
  const expected = normalizeSearchName(fallbackName);
  const zhFaces = card.zh?.card_faces || [];
  const faceIndex = faces.findIndex((face) => normalizeSearchName(face.name) === expected);
  if (faceIndex >= 0) return faces[faceIndex];
  const zhFaceIndex = zhFaces.findIndex((face) => normalizeSearchName(face.name) === expected);
  if (zhFaceIndex >= 0 && faces[zhFaceIndex]) return faces[zhFaceIndex];
  return faces[0];
}

function normalizeSearchName(value) {
  return String(value || "")
    .replace(/\s+token$/i, "")
    .trim()
    .toLowerCase();
}

async function hydrateMissingCatalogImages() {
  if (hydrateCatalogRunning) return;
  const names = missingCatalogNames();
  if (!names.length) return;
  hydrateCatalogRunning = true;
  try {
    await refreshCatalogEntries(names.slice(0, 4), { renderEach: false });
  } finally {
    hydrateCatalogRunning = false;
  }
  if (missingCatalogNames().length) hydrateMissingCatalogImages();
}

function missingCatalogNames() {
  return Object.entries(state.catalog)
    .filter(([, card]) => catalogEntryNeedsImage(card))
    .map(([name]) => name)
    .filter((name) => !pendingCardFetches.has(name));
}

function catalogEntryNeedsImage(card) {
  if (!card) return true;
  if (card.lookupFailed && card.lookupFailedSource === CARD_IMAGE_SOURCE) return false;
  if (!card.image) return true;
  return card.imageSource !== CARD_IMAGE_SOURCE;
}

async function refreshCatalogEntries(names, options = {}) {
  const uniqueKeys = [...new Set(names)].filter((key) => key && !pendingCardFetches.has(key));
  for (const key of uniqueKeys) {
    const existing = state.catalog[key];
    const queryName = catalogSearchName(key, existing);
    pendingCardFetches.add(key);
    const card = await fetchCard(queryName);
    pendingCardFetches.delete(key);
    if (card.image || card.typeLine) {
      const nextCard = {
        ...existing,
        ...card,
        imageSource: CARD_IMAGE_SOURCE,
        lookupFailed: false,
        lookupFailedSource: "",
      };
      if (key.startsWith("token:") && existing?.name) nextCard.name = existing.name;
      state.catalog[key] = nextCard;
      persistLocalState();
      refreshRenderedCatalogEntry(key);
      if (options.renderEach === true) render();
    } else {
      state.catalog[key] = { ...existing, lookupFailed: true, lookupFailedSource: CARD_IMAGE_SOURCE };
      persistLocalState();
    }
    await wait(150);
  }
  if (options.renderFinal === true) render();
}

function refreshRenderedCatalogEntry(key) {
  const card = state.catalog[key];
  if (!card) return;
  document.querySelectorAll(".card[data-card-key]").forEach((cardEl) => {
    if (cardEl.dataset.cardKey !== key) return;
    const instance = findInstance(cardEl.dataset.cardId) || { isToken: cardEl.classList.contains("token-card") };
    cardEl.innerHTML = renderCardFace(card, instance);
  });
  document.querySelectorAll(".library-card[data-card-key]").forEach((cardEl) => {
    if (cardEl.dataset.cardKey !== key) return;
    const face = cardEl.querySelector(".library-face");
    if (!face) return;
    const rawRemaining = cardEl.dataset.remaining;
    const remaining = rawRemaining === "" ? null : Number(rawRemaining);
    face.innerHTML = renderLibraryFace(card, Number.isFinite(remaining) ? remaining : null);
  });
}

function catalogSearchName(key, card) {
  if (!key.startsWith("token:")) return key;
  return card?.searchName || tokenSearchName(card?.name || key);
}

async function handleLookup() {
  const query = String(els.lookupInput.value || "").trim();
  if (!query) {
    renderLookupMessage("输入牌名、机制，或 翻译: trample");
    return;
  }

  const translationQuery = parseTranslationLookup(query);
  if (translationQuery) {
    renderTranslationLookup(translationQuery);
    return;
  }

  const mechanic = findMechanic(query, { exact: true });
  if (mechanic) {
    renderMechanicLookup(mechanic);
    return;
  }

  renderLookupMessage("正在查询卡片...");
  const card = await fetchExactCard(query);
  if (card) {
    renderCardLookup(card);
    return;
  }
  renderLookupMessage(`没有找到“${query}”。可以尝试英文牌名或常见机制名。`);
}

function parseTranslationLookup(query) {
  const match = String(query).match(/^(?:translate|translation|trans|翻译)\s*[:：]\s*(.+)$/i);
  return match ? match[1].trim() : "";
}

function lookupMechanicOnly(query) {
  const mechanic = findMechanic(query, { exact: false });
  if (mechanic) {
    renderMechanicLookup(mechanic);
    return;
  }
  renderLookupMessage(`没有找到机制“${query}”。`);
}

function findMechanic(query, options = {}) {
  const normalized = normalizeLookupTerm(query);
  if (!normalized) return null;
  const matches = (mechanic) => mechanicLookupTerms(mechanic).includes(normalized);
  if (options.exact !== false) {
    return MECHANIC_LIBRARY.find(matches) || null;
  }
  return (
    MECHANIC_LIBRARY.find((mechanic) =>
      mechanicLookupTerms(mechanic).some((term) => term.includes(normalized) || normalized.includes(term)),
    ) || null
  );
}

function mechanicLookupTerms(mechanic) {
  return [mechanic.key, mechanic.nameEn, mechanic.nameZh, ...(mechanic.aliases || [])].map(normalizeLookupTerm);
}

function normalizeLookupTerm(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[{}]/g, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");
}

function renderLookupMessage(message) {
  els.lookupOutput.innerHTML = `<p>${escapeHtml(message)}</p>`;
}

function renderCardLookup(card) {
  lookupCardDetail = card;
  const face = card.image
    ? `<img src="${imageSrc(card.image)}" alt="${escapeHtml(card.name)}" loading="lazy" draggable="false" />`
    : `<div class="card-back">Magic<br />Card</div>`;
  els.lookupOutput.innerHTML = `
    <div class="lookup-card">
      <button class="lookup-card-face" type="button" aria-label="查看 ${escapeHtml(card.name)} 大图">${face}</button>
      <div>
        <h3>${escapeHtml(card.name)}</h3>
        <small>${escapeHtml([card.setName, card.rarity ? rarityLabel(card.rarity) : ""].filter(Boolean).join(" · ") || "卡牌")}</small>
        <div class="lookup-fields">
          ${lookupField("费用", formatManaCost(card.manaCost))}
          ${lookupField("类别", card.typeLine)}
          ${lookupField("颜色", formatColors(card.colors))}
          ${lookupField("身材", formatStats(card))}
          ${lookupField("编号", card.collectorNumber)}
        </div>
        ${card.oracleText ? `<p class="lookup-oracle">${renderLinkedOracleText(card.oracleText)}</p>` : ""}
      </div>
    </div>`;
  els.lookupOutput.querySelector(".lookup-card-face")?.addEventListener("click", openLookupCard);
  els.lookupOutput.querySelector(".lookup-card-face")?.addEventListener("dblclick", openLookupCard);
  els.lookupOutput.querySelectorAll("[data-mechanic]").forEach((button) => {
    button.addEventListener("click", () => lookupMechanicFromOracle(button.dataset.mechanic));
  });
}

function lookupMechanicFromOracle(mechanicName) {
  if (!mechanicName) return;
  lookupMechanicOnly(mechanicName);
  updateLookupSuggestions();
}

function renderLinkedOracleText(text) {
  const matches = linkedOracleMatches(text);
  if (!matches.length) return escapeHtml(text);

  let html = "";
  let cursor = 0;
  matches.forEach((match) => {
    html += escapeHtml(text.slice(cursor, match.index));
    html += `<button class="lookup-mechanic-link" type="button" data-mechanic="${escapeHtml(match.mechanic)}">${escapeHtml(match.text)}</button>`;
    cursor = match.end;
  });
  html += escapeHtml(text.slice(cursor));
  return html;
}

function linkedOracleMatches(text) {
  const rawMatches = [];
  mechanicLinkTerms().forEach(({ term, mechanic }) => {
    const pattern = isAsciiTerm(term)
      ? new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi")
      : new RegExp(escapeRegExp(term), "g");
    let match = pattern.exec(text);
    while (match) {
      rawMatches.push({
        index: match.index,
        end: match.index + match[0].length,
        text: match[0],
        mechanic: mechanic.nameEn,
      });
      match = pattern.exec(text);
    }
  });

  const matches = [];
  rawMatches
    .sort((a, b) => a.index - b.index || b.end - b.index - (a.end - a.index))
    .forEach((match) => {
      const last = matches[matches.length - 1];
      if (last && match.index < last.end) return;
      matches.push(match);
    });
  return matches;
}

function mechanicLinkTerms() {
  const seen = new Set();
  const terms = [];
  MECHANIC_LIBRARY.forEach((mechanic) => {
    [mechanic.nameEn, mechanic.nameZh, ...(mechanic.aliases || [])].forEach((term) => {
      const normalized = normalizeLookupTerm(term);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      terms.push({ term, mechanic });
    });
  });
  return terms.sort((a, b) => b.term.length - a.term.length);
}

function lookupField(label, value) {
  if (!value) return "";
  return `<span><strong>${escapeHtml(label)}</strong>${escapeHtml(value)}</span>`;
}

function formatManaCost(value) {
  return value ? value.replace(/[{}]/g, "") : "";
}

function formatColors(colors) {
  if (!Array.isArray(colors) || !colors.length) return "";
  const labels = { W: "白", U: "蓝", B: "黑", R: "红", G: "绿", C: "无色" };
  return colors.map((color) => labels[color] || color).join("/");
}

function formatStats(card) {
  if (card.power || card.toughness) return `${card.power || "?"}/${card.toughness || "?"}`;
  if (card.loyalty) return `忠诚 ${card.loyalty}`;
  return "";
}

function rarityLabel(rarity) {
  return {
    common: "普通",
    uncommon: "非普通",
    rare: "稀有",
    mythic: "秘稀",
    special: "特殊",
    bonus: "奖励",
  }[rarity] || rarity;
}

function renderDetailCard(card, instance = null) {
  const flipClass = cardDetailState?.flipAnimation ? " flip-reveal" : "";
  if (cardDetailState?.flipAnimation) {
    window.setTimeout(() => {
      if (!cardDetailState) return;
      cardDetailState.flipAnimation = false;
      cardDetailState.flipFromCard = null;
    }, 700);
  }
  const face = renderCardFaceContent(card, instance || {});
  const content = cardDetailState?.flipAnimation && cardDetailState.flipFromCard
    ? renderFlipFaceStack(renderCardFaceContent(cardDetailState.flipFromCard, instance || {}), face)
    : face;
  return `
    <article class="card${flipClass}">
      ${content}
    </article>`;
}

function renderMechanicLookup(mechanic) {
  els.lookupOutput.innerHTML = `
    <div class="lookup-mechanic">
      <h3>${escapeHtml(mechanic.nameZh)} / ${escapeHtml(mechanic.nameEn)}</h3>
      <small>${escapeHtml(mechanic.category)}</small>
      <p>${escapeHtml(mechanic.summary)}</p>
      ${
        mechanic.examples?.length
          ? `<div class="lookup-tags">${mechanic.examples.map((example) => `<span>${escapeHtml(example)}</span>`).join("")}</div>`
          : ""
      }
    </div>`;
}

function renderTranslationLookup(query) {
  const translation = translateLookupText(query);
  els.lookupOutput.innerHTML = `
    <div class="lookup-translation">
      <h3>翻译</h3>
      <small>本地术语词典</small>
      <p class="lookup-translation-text">${escapeHtml(translation.text)}</p>
      ${
        translation.matches.length
          ? `<div class="lookup-tags">${translation.matches
              .map((match) => `<span>${escapeHtml(match.from)} -> ${escapeHtml(match.to)}</span>`)
              .join("")}</div>`
          : '<p class="lookup-hint">没有命中本地词条。</p>'
      }
    </div>`;
}

function translateLookupText(query) {
  const exactMechanic = findMechanic(query, { exact: true });
  if (exactMechanic) {
    const normalized = normalizeLookupTerm(query);
    const isChinese = normalizeLookupTerm(exactMechanic.nameZh) === normalized;
    return {
      text: isChinese ? exactMechanic.nameEn : exactMechanic.nameZh,
      matches: [{ from: query, to: isChinese ? exactMechanic.nameEn : exactMechanic.nameZh }],
    };
  }

  const direction = hasChinese(query) ? "zh-en" : "en-zh";
  const entries = translationEntries(direction).sort((a, b) => b.from.length - a.from.length);
  let text = query;
  const matches = [];
  entries.forEach(({ from, to }) => {
    const next = replaceTranslationTerm(text, from, to);
    if (next !== text) {
      matches.push({ from, to });
      text = next;
    }
  });
  return { text, matches };
}

function translationEntries(direction) {
  const entries = [];
  MECHANIC_LIBRARY.forEach((mechanic) => {
    if (direction === "zh-en") {
      entries.push({ from: mechanic.nameZh, to: mechanic.nameEn });
      (mechanic.aliases || []).filter((alias) => !isAsciiTerm(alias)).forEach((alias) => {
        entries.push({ from: alias, to: mechanic.nameEn });
      });
    } else {
      entries.push({ from: mechanic.nameEn, to: mechanic.nameZh });
      (mechanic.aliases || []).filter((alias) => isAsciiTerm(alias)).forEach((alias) => {
        entries.push({ from: alias, to: mechanic.nameZh });
      });
    }
  });
  TRANSLATION_TERMS.forEach(([en, zh]) => {
    entries.push(direction === "zh-en" ? { from: zh, to: en } : { from: en, to: zh });
  });
  return entries;
}

function hasChinese(value) {
  return /[\u3400-\u9fff]/.test(value);
}

function replaceTranslationTerm(text, from, to) {
  const pattern = isAsciiTerm(from)
    ? new RegExp(`\\b${escapeRegExp(from)}\\b`, "gi")
    : new RegExp(escapeRegExp(from), "g");
  return text.replace(pattern, to);
}

function isAsciiTerm(value) {
  return /^[\x00-\x7F]+$/.test(value);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function renderLog() {
  els.logPanel.innerHTML = state.log.map((line) => `<div>${escapeHtml(line)}</div>`).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cycleSeat() {
  const currentIndex = SEAT_ORDER.indexOf(seat);
  seat = SEAT_ORDER[(currentIndex + 1) % SEAT_ORDER.length];
  resetPanelPositions();
  sessionStorage.setItem("mtg-online-seat", seat);
  localStorage.removeItem("mtg-online-seat");
  updateSeatToggle();
  render();
}

function toggleTimer() {
  state.timer = normalizeTimerState(state.timer);
  if (state.timer.running) {
    state.timer = {
      elapsedMs: currentTimerMs(),
      running: false,
      startedAt: null,
    };
  } else {
    state.timer = {
      elapsedMs: state.timer.elapsedMs,
      running: true,
      startedAt: Date.now(),
    };
  }
  saveState(null, { captureLayout: false });
}

function resetTimer() {
  state.timer = makeTimerState();
  saveState(null, { captureLayout: false });
}

function randomActorLabel() {
  return seatDisplayName(seat) || "旁观";
}

function recordRandomResult(label, result) {
  saveState(`${randomActorLabel()} 随机：${label} -> ${result}`, {
    captureLayout: false,
  });
}

function flipCoin() {
  recordRandomResult("硬币", Math.random() < 0.5 ? "正面" : "反面");
}

function rollDie(sides) {
  recordRandomResult(`D${sides}`, Math.floor(Math.random() * sides) + 1);
}

els.createTableForm.addEventListener("submit", createTable);
els.searchTableForm.addEventListener("submit", (event) => {
  event.preventDefault();
  refreshLobbyTables(els.tableSearchInput.value);
});
els.refreshTables.addEventListener("click", () => {
  els.tableSearchInput.value = "";
  refreshLobbyTables();
});
els.seatToggle.addEventListener("click", cycleSeat);
els.timerToggle.addEventListener("click", toggleTimer);
els.timerReset.addEventListener("click", resetTimer);
els.flipCoin.addEventListener("click", flipCoin);
els.rollD6.addEventListener("click", () => rollDie(6));
els.rollD20.addEventListener("click", () => rollDie(20));
els.resetGame.addEventListener("click", () => {
  state = makeInitialState();
  saveState("牌桌已重置", { captureLayout: false });
});
els.leaveTable.addEventListener("click", leaveCurrentTable);
els.importDeckTop.addEventListener("click", () => {
  if (!["p1", "p2"].includes(seat)) {
    saveState("旁观身份不能导入牌表");
    return;
  }
  importDeck(seat, els.deckImport.value);
});
els.lookupButton.addEventListener("click", handleLookup);
els.lookupInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  handleLookup();
});

els.closeZone.addEventListener("click", () => els.zoneDialog.close());
closeDialogOnBackdropClick(els.zoneDialog);
closeDialogOnBackdropClick(els.cardDialog);
closeDialogOnBackdropClick(els.libraryMoveDialog);

channel?.addEventListener("message", (event) => {
  const message = event.data;
  if (message?.tableId) {
    if (activeTable?.id !== message.tableId) return;
    applyIncomingState(message.state);
    return;
  }
  if (activeTable) applyIncomingState(message);
});

window.addEventListener("storage", (event) => {
  if (!activeTable || event.key !== tableStorageKey() || !event.newValue) return;
  try {
    const incoming = JSON.parse(event.newValue);
    applyIncomingState(incoming);
  } catch {
    // Ignore malformed localStorage writes from other tabs.
  }
});

window.addEventListener("resize", syncHandFanLayout);
window.addEventListener("pagehide", () => {
  if (activeTable) sendTableLeaveBeacon(activeTable.id);
});

window.setInterval(renderTimer, 500);
showLobby();
refreshLobbyTables();
