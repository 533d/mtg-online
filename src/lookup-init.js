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

function renderChat() {
  if (!els.chatMessages) return;
  const messages = normalizeChat(state.chat);
  state.chat = messages;
  els.chatMessages.innerHTML = messages
    .map(
      (message) => `
        <div class="chat-message">
          <span>${escapeHtml(formatClock(message.at))}</span>
          <strong>${escapeHtml(message.author)}</strong>
          <p>${escapeHtml(message.text)}</p>
        </div>`,
    )
    .join("");
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
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
  const previousSeat = seat;
  const previousLabel = seatDisplayName(previousSeat);
  const currentIndex = SEAT_ORDER.indexOf(seat);
  seat = SEAT_ORDER[(currentIndex + 1) % SEAT_ORDER.length];
  resetPanelPositions();
  sessionStorage.setItem("mtg-online-seat", seat);
  localStorage.removeItem("mtg-online-seat");
  updateSeatToggle();
  saveState(`身份切换：${previousLabel} -> ${seatDisplayName(seat)}`, { captureLayout: false });
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

function sendChatMessage(event) {
  event.preventDefault();
  const text = String(els.chatInput?.value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  if (!text) {
    els.chatInput?.focus();
    return;
  }
  state.chat = normalizeChat([
    ...(state.chat || []),
    {
      id: makeId(),
      at: Date.now(),
      author: seatDisplayName(seat),
      seat,
      text,
    },
  ]);
  els.chatInput.value = "";
  saveState(null, { captureLayout: false });
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
els.chatForm.addEventListener("submit", sendChatMessage);

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
initLobbyIdentityControls();
showLobby();
refreshLobbyTables();
