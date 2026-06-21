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
    id: makeId(),
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
    id: makeId(),
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

