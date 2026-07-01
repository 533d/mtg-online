function shuffle(cards) {
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
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
  renderChat();
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
  const spectatorView = seat === "spectator";
  root.innerHTML = `
    <div class="battlefield-wrap ${spectatorView ? "spectator-view" : ""}">
      ${spectatorView ? renderHandRow(opponentId, true, { reveal: true }) : ""}
      ${renderBattlefield(selfId, opponentId)}
      ${renderHandRow(selfId, false, { reveal: spectatorView })}
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

function renderHandRow(playerId, isOpponent, options = {}) {
  const player = state.players[playerId];
  const canControl = seat === playerId;
  const canReveal = canControl || options.reveal;
  const handClass = `${isOpponent ? "opponent-hand" : "self-hand"} ${canReveal ? "revealed-hand" : ""} ${player.hand.length ? "" : "empty"}`;
  const handStyle = handLayoutStyle(playerId);
  return `
    <div class="hand-row ${isOpponent ? "opponent-hand-row" : "self-hand-row"}">
      <div class="hand-strip ${handClass}" data-player="${playerId}" data-hand-count="${player.hand.length}" data-drop-zone="hand"${handStyle}>
        ${renderHand(playerId, isOpponent, canControl, canReveal)}
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

function renderHand(playerId, isOpponent, canControl, canReveal = canControl) {
  const cards = state.players[playerId].hand;
  if (!cards.length) return "";
  if (isOpponent && !canReveal) {
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
