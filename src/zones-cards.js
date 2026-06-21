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
    id: makeId(),
    cardKey: "",
    tapped: false,
    faceDown: true,
  };
}

function makeExtraDeckCard(cardKey) {
  if (cardKey.startsWith("token:")) {
    return {
      id: makeId(),
      cardKey,
      tapped: false,
      isToken: true,
    };
  }
  return {
    id: makeId(),
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

