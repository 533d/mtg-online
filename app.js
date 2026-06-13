const STORAGE_KEY = "mtg-online-table-state-v1";
const PANEL_POSITION_KEY = "mtg-online-panel-positions-v1";
const MARKER_TOOLBAR_KEY = "mtg-online-marker-toolbar-v1";
const STATE_VERSION = 16;
const SCRYFALL_NAMED_URL = "https://api.scryfall.com/cards/named?exact=";
const CARD_IMAGE_SOURCE = "scryfall";
const TABLE_STATE_URL = "/api/table/state";
const TABLE_POLL_MS = 1000;
const UNDO_STACK_LIMIT = 8;
const BATTLE_GRID_SIZE = 13;
const BATTLE_CARD_GRID_W = 14;
const BATTLE_CARD_GRID_H = 20;
const SOFT_ZONE_EXTRA_GRID = 2;
const DEFAULT_VISIBLE_SOFT_ZONES = 1;
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
  p1: "玩家一",
  p2: "玩家二",
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
  seatToggle: document.querySelector("#seatToggle"),
  tableTimer: document.querySelector("#tableTimer"),
  timerToggle: document.querySelector("#timerToggle"),
  timerReset: document.querySelector("#timerReset"),
  syncStatus: document.querySelector("#syncStatus"),
  undoAction: document.querySelector("#undoAction"),
  flipCoin: document.querySelector("#flipCoin"),
  rollD6: document.querySelector("#rollD6"),
  rollD20: document.querySelector("#rollD20"),
  resetGame: document.querySelector("#resetGame"),
  deckImport: document.querySelector("#deckImport"),
  importDeckTop: document.querySelector("#importDeckTop"),
  lookupInput: document.querySelector("#lookupInput"),
  lookupButton: document.querySelector("#lookupButton"),
  lookupSuggestions: document.querySelector("#lookupSuggestions"),
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
  closeCard: document.querySelector("#closeCard"),
  libraryMoveDialog: document.querySelector("#libraryMoveDialog"),
  libraryMoveTitle: document.querySelector("#libraryMoveTitle"),
  libraryMoveMeta: document.querySelector("#libraryMoveMeta"),
  relationActionPopover: document.querySelector("#relationActionPopover"),
  relationActionMeta: document.querySelector("#relationActionMeta"),
  relationActionSelect: document.querySelector("#relationActionSelect"),
  relationActionCustom: document.querySelector("#relationActionCustom"),
  relationActionConfirm: document.querySelector("#relationActionConfirm"),
  relationActionCancel: document.querySelector("#relationActionCancel"),
};

let state = loadState();
let lastCommittedSnapshot = snapshotStateForUndo(state);
localStorage.removeItem("mtg-online-seat");
let seat = normalizeSeat(sessionStorage.getItem("mtg-online-seat"));
let lookupCardDetail = null;
const expandedZones = { p1: null, p2: null };
const playerPanelOpen = { p1: true, p2: true };
const playerPanelPositions = loadPanelPositions();
const markerToolbarState = loadMarkerToolbarState();
let relationSelection = null;
updateSeatToggle();

function makeInitialState() {
  return {
    version: STATE_VERSION,
    updatedAt: Date.now(),
    timer: makeTimerState(),
    undoStack: [],
    catalog: { ...sampleCatalog },
    log: ["牌桌已创建"],
    players: {
      p1: makePlayer("玩家一"),
      p2: makePlayer("玩家二"),
    },
  };
}

function makePlayer(name) {
  return {
    name,
    life: 20,
    library: [],
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

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return makeInitialState();
  try {
    const loaded = JSON.parse(raw);
    return migrateState(loaded);
  } catch {
    return makeInitialState();
  }
}

function loadPanelPositions() {
  try {
    const positions = JSON.parse(sessionStorage.getItem(PANEL_POSITION_KEY) || "{}");
    return positions && typeof positions === "object" ? positions : {};
  } catch {
    return {};
  }
}

function savePanelPositions() {
  sessionStorage.setItem(PANEL_POSITION_KEY, JSON.stringify(playerPanelPositions));
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

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function snapshotStateForUndo(sourceState) {
  const snapshot = cloneJson(sourceState);
  delete snapshot.undoStack;
  return snapshot;
}

function normalizeUndoStack(stack) {
  if (!Array.isArray(stack)) return [];
  return stack
    .filter((item) => item && typeof item === "object" && item.players)
    .slice(0, UNDO_STACK_LIMIT)
    .map((item) => snapshotStateForUndo(item));
}

function migrateState(loaded) {
  if (!loaded || !loaded.players) return makeInitialState();
  const previousVersion = Number(loaded.version) || 0;
  loaded.players.p1 = normalizePlayerState(loaded.players.p1, "玩家一");
  loaded.players.p2 = normalizePlayerState(loaded.players.p2, "玩家二");
  loaded.catalog = normalizeCatalog(loaded.catalog);
  if (previousVersion < 16) {
    loaded.catalog = resetCatalogForEnglishImages(loaded.catalog);
  }
  if (previousVersion < 13) {
    loaded.catalog = resetMismatchedCatalogEntries(loaded.catalog);
  }
  loaded.log = Array.isArray(loaded.log) ? loaded.log : [];
  loaded.timer = normalizeTimerState(loaded.timer);
  loaded.undoStack = normalizeUndoStack(loaded.undoStack);
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
    player.deckList = normalizeDeckList(player.deckList?.length ? player.deckList : inferDeckList(player));
  });
  return loaded;
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

function inferDeckList(player) {
  const seen = new Map();
  const allCards = [
    ...(player.library || []),
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

function saveState(message, options = {}) {
  if (options.captureLayout !== false) {
    captureBattlefieldHeights();
  }
  state.undoStack = normalizeUndoStack(state.undoStack);
  if (options.undo !== false && lastCommittedSnapshot) {
    state.undoStack = [snapshotStateForUndo(lastCommittedSnapshot), ...state.undoStack].slice(0, UNDO_STACK_LIMIT);
  }
  state.updatedAt = Math.max(Date.now(), (Number(state.updatedAt) || 0) + 1);
  if (message) {
    state.log = [message, ...state.log].slice(0, 40);
  }
  persistState();
  render();
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  lastCommittedSnapshot = snapshotStateForUndo(state);
  channel?.postMessage(state);
  publishTableState();
}

function persistLocalState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  lastCommittedSnapshot = snapshotStateForUndo(state);
}

async function publishTableState() {
  if (syncingRemote) return;
  try {
    const response = await fetch(TABLE_STATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
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
  try {
    const response = await fetch(TABLE_STATE_URL, { cache: "no-store" });
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  lastCommittedSnapshot = snapshotStateForUndo(state);
  syncingRemote = false;
  render({ captureLayout: false });
  return true;
}

async function startOnlineSync() {
  const serverState = await fetchTableState();
  if (serverState) {
    const applied = applyIncomingState(serverState);
    if (!applied && serverState.updatedAt < state.updatedAt) {
      publishTableState();
    }
  } else {
    publishTableState();
  }
  window.setInterval(async () => {
    const incoming = await fetchTableState();
    applyIncomingState(incoming);
  }, TABLE_POLL_MS);
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

function updateSeatToggle() {
  if (els.seatToggle) {
    els.seatToggle.textContent = `视角：${SEAT_LABELS[seat] || SEAT_LABELS.p1}`;
  }
}

function visibleSeat() {
  return seat === "p2" ? "p2" : "p1";
}

function render(options = {}) {
  if (options.captureLayout !== false) {
    captureBattlefieldHeights();
  }
  const selfId = visibleSeat();
  const opponentId = opponentOf(selfId);
  renderPlayerPanel(els.opponentArea, opponentId);
  renderSharedBattlefield(els.battlefieldArea, selfId, opponentId);
  renderPlayerPanel(els.selfArea, selfId);
  renderLog();
  renderTimer();
  renderSyncStatus();
  renderUndoButton();
  observeBattlefieldResize();
  updateRelationSelectionUi();
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
  els.syncStatus.dataset.status = syncState.status;
  els.syncStatus.textContent = `${label}${time}`;
}

function formatClock(timestamp) {
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function renderUndoButton() {
  if (!els.undoAction) return;
  els.undoAction.disabled = !normalizeUndoStack(state.undoStack).length;
}

function renderPlayerPanel(root, playerId) {
  const player = state.players[playerId];
  const canControl = seat === playerId;
  const openAttr = playerPanelOpen[playerId] ? " open" : "";
  root.dataset.panelPlayer = playerId;
  applyPlayerPanelPosition(root, playerId);
  root.innerHTML = `
    <details class="player-panel-card" data-panel-player="${playerId}"${openAttr}>
      <summary>
        <span>${escapeHtml(player.name)}${canControl ? "（你）" : ""}</span>
        <strong>${player.life}</strong>
      </summary>
      <aside class="player-panel">
        <div class="player-title">
          <h2>${escapeHtml(player.name)}${canControl ? "（你）" : ""}</h2>
          <div class="life-box">
            ${canControl ? '<button data-action="life" data-delta="-1">-</button>' : ""}
            <strong>${player.life}</strong>
            ${canControl ? '<button data-action="life" data-delta="1">+</button>' : ""}
          </div>
        </div>
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
                <div class="token-maker">
                  <input name="token-name" type="text" placeholder="衍生物名称" value="Treasure Token" />
                  <button data-action="create-token">创建衍生物</button>
                </div>
              </div>`
            : ""
        }
      </aside>
    </details>
  `;
  root.querySelector(".player-panel-card")?.addEventListener("toggle", (event) => {
    playerPanelOpen[playerId] = event.currentTarget.open;
  });
  bindPlayerPanelDrag(root, playerId);
  bindPlayerControls(root, playerId);
}

function applyPlayerPanelPosition(root, playerId) {
  const position = playerPanelPositions[playerId];
  if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) {
    root.style.left = `${position.x}px`;
    root.style.top = `${position.y}px`;
    root.style.right = "auto";
    return;
  }
  root.style.left = "";
  root.style.top = "";
  root.style.right = "";
}

function bindPlayerPanelDrag(root, playerId) {
  const summary = root.querySelector(".player-panel-card summary");
  if (!summary) return;
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
    cardEl.addEventListener("click", (event) => handleRelationCardClick(event, cardEl));
    cardEl.addEventListener("dblclick", (event) => {
      if (relationSelection) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      openCard(cardEl.dataset.cardId);
    });
    if (cardEl.dataset.player === seat && cardEl.dataset.zone !== "detail") {
      cardEl.addEventListener("contextmenu", (event) => handleCardContextMenu(event, cardEl));
    }
  });
  root.querySelectorAll(".card[draggable='true']").forEach((cardEl) => {
    cardEl.addEventListener("dragstart", (event) => handleDragStart(event, cardEl));
    cardEl.addEventListener("dragend", () => clearDragState());
  });
  root.querySelectorAll(".library-block[draggable='true']").forEach((libraryEl) => {
    libraryEl.addEventListener("dragstart", (event) => handleLibraryDragStart(event, libraryEl));
    libraryEl.addEventListener("dragend", () => clearDragState());
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
      <button class="${relationSelection ? "relation-active" : ""}" data-action="start-relation">${relationSelection ? "取消指向" : "记录指向"}</button>
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
  return `
    <button class="compact-zone-block" data-action="open-zone" data-zone="${zone}" data-player="${playerId}"${dropAttr}>
      <span>${label}</span>
      <strong>${cards.length}</strong>
    </button>`;
}

function libraryZone(playerId, cards, canControl) {
  const draggable = canControl && cards.length ? ' draggable="true"' : "";
  const dropAttr = canControl ? ' data-drop-zone="library"' : "";
  return `
    <div class="library-zone">
      <button class="zone-block library-block" data-action="open-zone" data-zone="library" data-player="${playerId}"${dropAttr}${draggable}>
        <span>牌库</span>
        <strong>${cards.length}</strong>
      </button>
    </div>`;
}

function renderHandRow(playerId, isOpponent) {
  const player = state.players[playerId];
  const canControl = seat === playerId;
  const handClass = `${isOpponent ? "opponent-hand" : "self-hand"} ${player.hand.length ? "" : "empty"}`;
  return `
    <div class="hand-row ${isOpponent ? "opponent-hand-row" : "self-hand-row"}">
      <div class="hand-strip ${handClass}" data-player="${playerId}" data-drop-zone="hand">
        ${renderHand(playerId, isOpponent, canControl)}
        <span class="hand-count">${player.hand.length}</span>
      </div>
      <aside class="hand-zone-stack" aria-label="${escapeHtml(player.name)}区域">
        ${libraryZone(playerId, player.library, canControl)}
        ${compactZoneRow(playerId, player)}
        ${renderInlineZone(playerId, canControl)}
      </aside>
    </div>`;
}

function renderInlineZone(playerId, canControl) {
  const zone = expandedZones[playerId];
  if (!["graveyard", "exile"].includes(zone)) return "";
  const player = state.players[playerId];
  const cards = getZoneCards(player, zone);
  return `
    <section class="inline-zone-panel">
      <div class="inline-zone-head">
        <strong>${zoneLabel(zone)}</strong>
        <span>${cards.length} 张</span>
      </div>
      <div class="inline-zone-cards ${cards.length ? "" : "empty"}">
        ${
          cards.length
            ? cards.map((card) => renderCard(playerId, card, zone, canControl)).join("")
            : ""
        }
      </div>
    </section>`;
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
    clone.classList.remove("dragging", "relation-selectable", "relation-source", "relation-target");
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
    const cardId = pieceEl.querySelector(".card")?.dataset.cardId;
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
  const draggable = canControl && zone !== "detail" ? ' draggable="true"' : "";
  const styleAttr = options.style ? ` style="${options.style}"` : "";
  const cardKeyAttr = instance.cardKey ? ` data-card-key="${escapeHtml(instance.cardKey)}"` : "";
  return `
    <article class="card ${instance.tapped ? "tapped" : ""} ${instance.isToken ? "token-card" : ""}" data-card-id="${instance.id}" data-player="${playerId}" data-zone="${zone}"${cardKeyAttr}${styleAttr}${draggable}>
      ${renderCardFace(card, instance)}
    </article>`;
}

function renderCardFace(card, instance = {}) {
  if (card.image) {
    return `<img src="${escapeHtml(imageSrc(card.image))}" alt="${escapeHtml(card.name)}" loading="lazy" draggable="false" />`;
  }
  return `<div class="fallback-face"><strong>${escapeHtml(card.name)}</strong><small>${escapeHtml(card.typeLine || "")}</small><p>${instance.isToken ? "衍生物" : "卡面图片未加载"}</p></div>`;
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
  if (action === "open-zone") {
    const zone = button.dataset.zone;
    const targetPlayer = button.dataset.player;
    if (["graveyard", "exile"].includes(zone) && targetPlayer === seat) {
      expandedZones[targetPlayer] = expandedZones[targetPlayer] === zone ? null : zone;
      render();
    } else {
      openZone(targetPlayer, zone);
    }
  }
  if (action === "create-token") {
    createToken(playerId, root);
  }
  if (action === "add-marker") {
    createBattlefieldMarker(root);
  }
  if (action === "start-relation") {
    toggleRelationSelection();
  }
}

function moveCard(playerId, cardId, from, to, options = {}) {
  const player = state.players[playerId];
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

  const name = form.querySelector("[name='token-name']").value.trim() || "Token";
  const typeLine = "Token";
  const cardKey = tokenCatalogKey(name, typeLine);

  state.catalog[cardKey] = { name, typeLine, image: "", searchName: tokenSearchName(name) };
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

function toggleRelationSelection() {
  if (!["p1", "p2"].includes(seat)) return;
  if (relationSelection) {
    cancelRelationSelection();
    return;
  }
  relationSelection = { source: null, target: null };
  render({ captureLayout: false });
}

function handleRelationCardClick(event, cardEl) {
  if (!relationSelection) return;
  const card = relationCardFromElement(cardEl);
  if (!card) return;
  event.preventDefault();
  event.stopPropagation();

  if (!relationSelection.source) {
    relationSelection.source = card;
    updateRelationSelectionUi();
    return;
  }

  if (relationSelection.source.cardId === card.cardId) return;
  relationSelection.target = card;
  showRelationActionPopover(event.clientX, event.clientY);
  updateRelationSelectionUi();
}

function relationCardFromElement(cardEl) {
  const cardId = cardEl.dataset.cardId;
  const instance = findInstance(cardId);
  if (!instance) return null;
  return {
    playerId: cardEl.dataset.player,
    cardId,
    name: getCardInfo(instance).name,
  };
}

function updateRelationSelectionUi() {
  const active = Boolean(relationSelection);
  document.body.classList.toggle("relation-mode", active);
  document.querySelectorAll("[data-action='start-relation']").forEach((button) => {
    button.classList.toggle("relation-active", active);
    button.textContent = active ? "取消指向" : "记录指向";
  });
  document.querySelectorAll(".card[data-card-id]").forEach((cardEl) => {
    const isSource =
      active &&
      relationSelection.source &&
      cardEl.dataset.cardId === relationSelection.source.cardId &&
      cardEl.dataset.player === relationSelection.source.playerId;
    const isTarget =
      active &&
      relationSelection.target &&
      cardEl.dataset.cardId === relationSelection.target.cardId &&
      cardEl.dataset.player === relationSelection.target.playerId;
    cardEl.classList.toggle("relation-selectable", active);
    cardEl.classList.toggle("relation-source", Boolean(isSource));
    cardEl.classList.toggle("relation-target", Boolean(isTarget));
  });
}

function showRelationActionPopover(clientX, clientY) {
  if (!relationSelection?.source || !relationSelection?.target || !els.relationActionPopover) return;
  const host = els.zoneDialog.open ? els.zoneDialog : document.body;
  if (els.relationActionPopover.parentElement !== host) {
    host.append(els.relationActionPopover);
  }
  els.relationActionMeta.textContent = `${relationSelection.source.name} -> ${relationSelection.target.name}`;
  els.relationActionSelect.value = "指定目标";
  els.relationActionCustom.value = "";
  updateRelationCustomInput();
  els.relationActionPopover.hidden = false;
  positionRelationActionPopover(clientX, clientY);
  els.relationActionSelect.focus();
}

function positionRelationActionPopover(clientX, clientY) {
  const popover = els.relationActionPopover;
  const margin = 12;
  const x = clientX + margin;
  const y = clientY + margin;
  const maxX = Math.max(margin, window.innerWidth - popover.offsetWidth - margin);
  const maxY = Math.max(margin, window.innerHeight - popover.offsetHeight - margin);
  popover.style.left = `${clampNumber(x, margin, maxX)}px`;
  popover.style.top = `${clampNumber(y, margin, maxY)}px`;
}

function updateRelationCustomInput() {
  const isCustom = els.relationActionSelect?.value === "custom";
  if (!els.relationActionCustom) return;
  els.relationActionCustom.hidden = !isCustom;
  if (isCustom) els.relationActionCustom.focus();
}

function confirmRelationAction() {
  if (!relationSelection?.source || !relationSelection?.target) return;
  const selected = els.relationActionSelect.value;
  const custom = els.relationActionCustom.value.trim();
  const action = selected === "custom" ? custom : selected;
  if (!action) return;
  const { source, target } = relationSelection;
  relationSelection = null;
  hideRelationActionPopover();
  saveState(`${source.name} 对 ${target.name}：${action}`);
}

function cancelRelationSelection() {
  relationSelection = null;
  hideRelationActionPopover();
  updateRelationSelectionUi();
}

function hideRelationActionPopover() {
  if (!els.relationActionPopover) return;
  els.relationActionPopover.hidden = true;
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
  const rect = cardEl.getBoundingClientRect();
  const sourceWidth = cardEl.offsetWidth || rect.width || 1;
  const sourceHeight = cardEl.offsetHeight || rect.height || 1;
  const isHandCard = cardEl.dataset.zone === "hand";
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

function handleBattlefieldDrop(event, canvasEl) {
  event.preventDefault();
  canvasEl.classList.remove("drag-over");
  try {
    const payload = readDragPayload(event);
    if (!payload || ![canvasEl.dataset.self, canvasEl.dataset.opponent].includes(payload.playerId) || seat !== payload.playerId) return;
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
    const player = state.players[payload.playerId];
    const card = findCardInZone(player, payload.cardId, payload.from);
    if (!card) return;
    const destination = to === "library" ? await chooseLibraryDestination(payload.playerId, card) : to;
    if (!destination) return;
    moveCard(payload.playerId, payload.cardId, payload.from, destination);
  } finally {
    clearDragState();
  }
}

function chooseLibraryDestination(playerId, card) {
  if (!els.libraryMoveDialog) return Promise.resolve("library-top");
  const player = state.players[playerId];
  const cardName = getCardInfo(card).name;
  els.libraryMoveTitle.textContent = "移到牌库";
  els.libraryMoveMeta.textContent = `${player.name} - ${cardName}`;

  return new Promise((resolve) => {
    let settled = false;
    const dialog = els.libraryMoveDialog;
    const cleanup = () => {
      dialog.removeEventListener("click", handleClick);
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
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
    dialog.showModal();
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
  els.zoneMeta.textContent = `${cards.length} 张`;
  if (zone === "library") {
    els.zoneCards.innerHTML = renderLibraryList(player);
    els.zoneDialog.showModal();
    return;
  }
  if (zone === "hand" && !canControl) {
    els.zoneCards.innerHTML = cards.map(renderCardBack).join("");
    els.zoneDialog.showModal();
    return;
  }
  els.zoneCards.innerHTML = cards
    .map((card) => renderCard(playerId, card, zone, canControl))
    .join("");
  els.zoneCards.querySelectorAll(".card").forEach((cardEl) => {
    cardEl.addEventListener("click", (event) => handleRelationCardClick(event, cardEl));
    cardEl.addEventListener("dblclick", (event) => {
      if (relationSelection) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      openCard(cardEl.dataset.cardId);
    });
    if (cardEl.dataset.player === seat) {
      cardEl.addEventListener("contextmenu", (event) => handleCardContextMenu(event, cardEl));
      cardEl.addEventListener("dragstart", (event) => handleDragStart(event, cardEl));
      cardEl.addEventListener("dragend", () => clearDragState());
    }
  });
  updateRelationSelectionUi();
  els.zoneDialog.showModal();
}

function openCard(cardId) {
  const instance = findInstance(cardId);
  if (!instance) return;
  els.cardDetail.innerHTML = renderCard("", { ...instance, tapped: false }, "detail", false);
  els.cardDialog.showModal();
}

function openLookupCard() {
  if (!lookupCardDetail) return;
  els.cardDetail.innerHTML = renderLookupDetailCard(lookupCardDetail);
  els.cardDialog.showModal();
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

function removeCardFromZone(player, cardId, zone) {
  const source = getZoneCards(player, zone);
  const index = source.findIndex((card) => card.id === cardId);
  if (index < 0) return null;
  const [card] = source.splice(index, 1);
  return card;
}

function imageSrc(url) {
  return url || "";
}

function zoneLabel(zone) {
  return {
    library: "牌库",
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
            <div class="library-card" data-card-key="${escapeHtml(entry.name)}" data-remaining="${entry.remaining}">
              <div class="library-face">
                ${renderLibraryFace(card, entry.remaining)}
              </div>
            </div>`;
        })
        .join("")}
    </div>`;
}

function renderLibraryFace(card, remaining) {
  const face = card.image
    ? `<img src="${escapeHtml(imageSrc(card.image))}" alt="${escapeHtml(card.name)}" loading="lazy" draggable="false" />`
    : `<div class="card-back">Magic<br />Card</div>`;
  return `${face}<span class="library-count">x${remaining}</span>`;
}

function countCardsByKey(cards) {
  const counts = new Map();
  cards.forEach((card) => {
    counts.set(card.cardKey, (counts.get(card.cardKey) || 0) + 1);
  });
  return counts;
}

function importDeck(playerId, raw) {
  const entries = normalizeDeckList(parseDeckList(raw)).map((entry) => [entry.name, entry.count]);
  if (!entries.length) return;
  const player = state.players[playerId];
  for (const [name] of entries) {
    if (!state.catalog[name]) state.catalog[name] = { name, typeLine: "", image: "" };
  }
  player.library = buildDeck(entries);
  player.deckList = normalizeDeckList(entries);
  shuffle(player.library);
  player.hand = player.library.splice(0, 7);
  player.battlefield = makeBattlefield();
  player.graveyard = [];
  player.exile = [];
  hydrateCatalogRunning = true;
  saveState(`${player.name} 导入牌库并抓起手七张`);
  refreshCatalogEntries(entries.map(([name]) => name)).finally(() => {
    hydrateCatalogRunning = false;
    hydrateMissingCatalogImages();
  });
}

function parseDeckList(raw) {
  const entries = [];
  let inSideboard = false;
  raw.split("\n").forEach((rawLine) => {
    const line = rawLine.replace(/\s+\/\/.*$/, "").trim();
    if (!line || line.startsWith("//")) return;
    if (/^sideboard:?$/i.test(line)) {
      inSideboard = true;
      return;
    }
    if (/^(deck|commander):?$/i.test(line)) return;
    if (/^SB:\s*\d+/i.test(line)) return;
    if (inSideboard) return;

    const match = line.match(/^(\d+)x?\s+(.+)$/i);
    const count = match ? Number(match[1]) : 1;
    const name = cleanDeckCardName(match ? match[2] : line);
    if (name && count > 0) entries.push([name, count]);
  });
  return entries;
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
    face.innerHTML = renderLibraryFace(card, Number(cardEl.dataset.remaining) || 0);
  });
}

function catalogSearchName(key, card) {
  if (!key.startsWith("token:")) return key;
  return card?.searchName || tokenSearchName(card?.name || key);
}

async function handleLookup() {
  const parsed = parseLookupInput(els.lookupInput.value);
  if (!parsed.query && !parsed.mode) {
    renderLookupMessage("输入牌名或机制");
    return;
  }
  if (!parsed.query) {
    renderLookupMessage(`${lookupModeLabel(parsed.mode)} 查询：请输入内容`);
    return;
  }
  if (parsed.mode === "cards") {
    await lookupCardByName(parsed.query);
    return;
  }
  if (parsed.mode === "mechanics") {
    lookupMechanicOnly(parsed.query);
    return;
  }
  if (parsed.mode === "translate") {
    renderTranslationLookup(parsed.query);
    return;
  }

  renderLookupMessage("正在查询卡片...");
  const card = await fetchExactCard(parsed.query);
  if (card) {
    renderCardLookup(card);
    return;
  }

  const fuzzyMechanic = findMechanic(parsed.query, { exact: false });
  if (fuzzyMechanic) {
    renderMechanicLookup(fuzzyMechanic);
    return;
  }
  renderLookupMessage(`没有找到“${parsed.query}”。可以尝试英文牌名或常见机制名。`);
}

function parseLookupInput(raw) {
  const text = String(raw || "").trim();
  const match = text.match(/^(cards?|mechanics?|translate|卡片|机制|翻译)\s*[:：]\s*(.*)$/i);
  if (!match) return { mode: null, query: text };
  return {
    mode: normalizeLookupMode(match[1]),
    query: match[2].trim(),
  };
}

function normalizeLookupMode(value) {
  const mode = String(value || "").toLowerCase();
  if (mode === "card" || mode === "cards" || value === "卡片") return "cards";
  if (mode === "mechanic" || mode === "mechanics" || value === "机制") return "mechanics";
  if (mode === "translate" || value === "翻译") return "translate";
  return null;
}

async function lookupCardByName(query) {
  renderLookupMessage("正在查询卡片...");
  const card = await fetchExactCard(query);
  if (card) {
    renderCardLookup(card);
    return;
  }
  renderLookupMessage(`没有找到卡片“${query}”。`);
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

function renderLookupDetailCard(card) {
  return `
    <article class="card">
      ${
        card.image
          ? `<img src="${imageSrc(card.image)}" alt="${escapeHtml(card.name)}" loading="lazy" draggable="false" />`
          : `<div class="fallback-face"><strong>${escapeHtml(card.name)}</strong><small>${escapeHtml(card.typeLine || "")}</small><p>卡面图片未加载</p></div>`
      }
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
  cancelRelationSelection();
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
  saveState(null, { captureLayout: false, undo: false });
}

function resetTimer() {
  state.timer = makeTimerState();
  saveState(null, { captureLayout: false, undo: false });
}

function undoLastAction() {
  const undoStack = normalizeUndoStack(state.undoStack);
  if (!undoStack.length) return;
  const previous = undoStack[0];
  const nextUpdatedAt = Math.max(Date.now(), (Number(state.updatedAt) || 0) + 1);
  state = migrateState({
    ...previous,
    updatedAt: nextUpdatedAt,
    undoStack: undoStack.slice(1),
  });
  state.log = ["撤销上一步", ...state.log].slice(0, 40);
  persistState();
  render();
}

function randomActorLabel() {
  return SEAT_LABELS[seat] || "旁观";
}

function recordRandomResult(label, result) {
  saveState(`${randomActorLabel()} 随机：${label} -> ${result}`, {
    captureLayout: false,
    undo: false,
  });
}

function flipCoin() {
  recordRandomResult("硬币", Math.random() < 0.5 ? "正面" : "反面");
}

function rollDie(sides) {
  recordRandomResult(`D${sides}`, Math.floor(Math.random() * sides) + 1);
}

function lookupModeLabel(mode) {
  return {
    cards: "卡片",
    mechanics: "机制",
    translate: "翻译",
  }[mode] || "自动";
}

function updateLookupSuggestions() {
  const shouldShow = document.activeElement === els.lookupInput && !els.lookupInput.value.trim();
  els.lookupSuggestions.classList.toggle("open", shouldShow);
}

function applyLookupSuggestion(prefix) {
  els.lookupInput.value = prefix;
  els.lookupInput.focus();
  updateLookupSuggestions();
}

els.seatToggle.addEventListener("click", cycleSeat);
els.timerToggle.addEventListener("click", toggleTimer);
els.timerReset.addEventListener("click", resetTimer);
els.undoAction.addEventListener("click", undoLastAction);
els.flipCoin.addEventListener("click", flipCoin);
els.rollD6.addEventListener("click", () => rollDie(6));
els.rollD20.addEventListener("click", () => rollDie(20));
els.resetGame.addEventListener("click", () => {
  state = makeInitialState();
  saveState("牌桌已重置", { captureLayout: false });
});
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
els.lookupInput.addEventListener("focus", updateLookupSuggestions);
els.lookupInput.addEventListener("input", updateLookupSuggestions);
els.lookupInput.addEventListener("blur", () => {
  window.setTimeout(updateLookupSuggestions, 120);
});
els.lookupSuggestions.querySelectorAll("[data-lookup-prefix]").forEach((button) => {
  button.addEventListener("mousedown", (event) => {
    event.preventDefault();
    applyLookupSuggestion(button.dataset.lookupPrefix);
  });
});

els.relationActionSelect.addEventListener("change", updateRelationCustomInput);
els.relationActionConfirm.addEventListener("click", confirmRelationAction);
els.relationActionCancel.addEventListener("click", cancelRelationSelection);
els.relationActionCustom.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  confirmRelationAction();
});

els.closeZone.addEventListener("click", () => els.zoneDialog.close());
els.zoneDialog.addEventListener("close", () => {
  if (relationSelection && els.relationActionPopover.parentElement === els.zoneDialog) {
    cancelRelationSelection();
  }
});
els.closeCard.addEventListener("click", () => els.cardDialog.close());

channel?.addEventListener("message", (event) => {
  applyIncomingState(event.data);
});

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  try {
    const incoming = JSON.parse(event.newValue);
    applyIncomingState(incoming);
  } catch {
    // Ignore malformed localStorage writes from other tabs.
  }
});

render();
window.setInterval(renderTimer, 500);
startOnlineSync();
