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
const TABLE_EVENTS_URL = "/api/table/events";
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
