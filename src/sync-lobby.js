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
  queueTablePublish();
}

function persistLocalState() {
  localStorage.setItem(tableStorageKey(), JSON.stringify(state));
}

async function publishTableState() {
  if (syncingRemote || !activeTable || publishInFlight || !pendingPublish) return;
  pendingPublish = false;
  publishInFlight = true;
  const tableId = activeTable.id;
  const stateToPublish = state;
  try {
    const response = await fetch(TABLE_STATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId, clientId, state: stateToPublish }),
    });
    if (activeTable?.id !== tableId) return;
    if (response.status === 404) {
      handleRemoteTableMissing();
      return;
    }
    if (response.status === 403) {
      pendingPublish = true;
      const rejoined = await rejoinActiveTable();
      if (!rejoined) setSyncStatus("error");
      return;
    }
    if (response.status === 409) {
      setSyncStatus("connected");
      applyIncomingState(await fetchTableState({ since: false }));
      return;
    }
    if (response.ok) {
      setSyncStatus("connected");
      if (state.updatedAt !== stateToPublish.updatedAt) pendingPublish = true;
    } else {
      pendingPublish = true;
      setSyncStatus("error");
    }
  } catch {
    if (activeTable?.id === tableId) {
      pendingPublish = true;
      setSyncStatus("offline");
    }
  } finally {
    publishInFlight = false;
    if (pendingPublish && activeTable?.id === tableId) {
      window.setTimeout(publishTableState, 1000);
    }
  }
}

function queueTablePublish() {
  pendingPublish = true;
  publishTableState();
}

async function fetchTableState(options = {}) {
  if (!activeTable) return null;
  try {
    const params = new URLSearchParams({ tableId: activeTable.id, clientId });
    if (options.since !== false && Number.isFinite(state.updatedAt)) {
      params.set("since", String(state.updatedAt));
    }
    const response = await fetch(`${TABLE_STATE_URL}?${params}`, { cache: "no-store" });
    if (response.status === 404) {
      handleRemoteTableMissing();
      return null;
    }
    if (response.status === 403) {
      if (options.allowRejoin !== false && (await rejoinActiveTable())) {
        return fetchTableState({ ...options, allowRejoin: false });
      }
      setSyncStatus("error");
      setLobbyMessage("当前牌桌连接已失效，请从大厅重新输入密码进入。", "error");
      return null;
    }
    if (!response.ok) {
      setSyncStatus("error");
      return null;
    }
    const data = await response.json();
    setSyncStatus("connected");
    if (data.table) activeTable = data.table;
    if (data.unchanged) return null;
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
    queueTablePublish();
  }
  return true;
}

function startTableEventStream() {
  if (!("EventSource" in window) || !activeTable) return;
  if (tableEventSource) tableEventSource.close();

  const tableId = activeTable.id;
  const params = new URLSearchParams({ tableId, clientId });
  tableEventSource = new EventSource(`${TABLE_EVENTS_URL}?${params}`);

  tableEventSource.onopen = () => {
    if (activeTable?.id === tableId) setSyncStatus("connected");
  };
  tableEventSource.onerror = () => {
    if (activeTable?.id === tableId) setSyncStatus("offline");
  };
  tableEventSource.addEventListener("hello", (event) => handleTableEventMessage(event, tableId));
  tableEventSource.addEventListener("state", (event) => handleTableEventMessage(event, tableId));
}

function handleTableEventMessage(event, tableId) {
  if (activeTable?.id !== tableId) return;
  try {
    const payload = JSON.parse(event.data || "{}");
    if (payload.table) activeTable = payload.table;
    setSyncStatus("connected");
    applyIncomingState(payload.state);
  } catch {
    setSyncStatus("error");
  }
}

async function startOnlineSync() {
  if (!activeTable) return;
  stopOnlineSync();
  const serverState = await fetchTableState({ since: false });
  if (!activeTable) return;
  if (serverState) {
    const serverVersion = Number(serverState.version) || 0;
    const applied = applyIncomingState(serverState);
    if (!applied && (serverState.updatedAt < state.updatedAt || serverVersion < STATE_VERSION)) {
      queueTablePublish();
    }
  } else {
    queueTablePublish();
  }
  startTableEventStream();
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
  if (tableEventSource) {
    tableEventSource.close();
    tableEventSource = null;
  }
}

async function sendTableHeartbeat() {
  if (!activeTable) return;
  try {
    const tableId = activeTable.id;
    const response = await fetch(TABLE_HEARTBEAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId, clientId }),
    });
    if (activeTable?.id !== tableId) return;
    if (response.status === 404) {
      handleRemoteTableMissing();
      return;
    }
    if (response.status === 403) {
      await rejoinActiveTable();
      return;
    }
    if (response.ok) setSyncStatus("connected");
  } catch {
    setSyncStatus("offline");
  }
}

async function rejoinActiveTable() {
  if (!activeTable?.id) return false;
  const tableId = activeTable.id;
  try {
    const response = await fetch(TABLE_JOIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId, password: activeTablePassword, clientId }),
    });
    if (activeTable?.id !== tableId) return false;
    if (!response.ok) return false;
    const data = await response.json().catch(() => ({}));
    if (data.table) activeTable = data.table;
    setSyncStatus("connected");
    return true;
  } catch {
    setSyncStatus("offline");
    return false;
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
  pendingPublish = false;
  activeTable = null;
  activeTablePassword = "";
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
    activeTablePassword = password;
    state = data.state ? migrateState(data.state) : makeInitialState();
    markLastTable(id);
    persistLocalState();
    showTable();
    await startOnlineSync();
  } catch {
    setLobbyMessage("无法连接大厅服务，请确认 server.py 正在运行。", "error");
  }
}

function leaveCurrentTable() {
  if (activeTable) sendTableLeaveBeacon(activeTable.id);
  stopOnlineSync();
  pendingPublish = false;
  activeTable = null;
  activeTablePassword = "";
  setSyncStatus("offline");
  showLobby("已离开牌桌。");
  refreshLobbyTables();
}
