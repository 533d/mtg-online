function mountLobbyView() {
  const root = document.querySelector("#lobby");
  if (!root) return;
  root.innerHTML = `
    <div class="lobby-card">
      <div class="lobby-head">
        <span class="mark">MTG</span>
        <div>
          <h1>选择牌桌</h1>
          <p>创建一个牌桌，或输入牌桌号加入正在进行的对局。</p>
        </div>
      </div>

      <div class="lobby-actions" aria-label="牌桌操作">
        <button class="lobby-action" type="button" data-lobby-action="create" aria-expanded="false" aria-controls="createTableForm">
          <span class="lobby-action-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span class="lobby-action-label">创建</span>
        </button>
        <button class="lobby-action" type="button" data-lobby-action="search" aria-expanded="false" aria-controls="searchTableForm">
          <span class="lobby-action-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 4 4" />
            </svg>
          </span>
          <span class="lobby-action-label">查找</span>
        </button>
      </div>

      <div class="lobby-detail-shell">
        <form id="createTableForm" class="lobby-panel lobby-detail-panel" data-lobby-panel="create" hidden>
          <div class="lobby-panel-head">
            <h2>创建牌桌</h2>
            <p>设置牌桌号、密码和加入身份。</p>
          </div>
          <input id="createTableId" type="text" maxlength="24" placeholder="牌桌号，留空自动生成" autocomplete="off" />
          <input id="createTablePassword" type="password" placeholder="密码，可为空" autocomplete="new-password" />
          <div class="lobby-identity-row">
            <select id="createJoinSeat" aria-label="加入身份">
              <option value="p1">以 P1 加入</option>
              <option value="p2">以 P2 加入</option>
              <option value="spectator">以旁观加入</option>
            </select>
            <input id="createJoinName" type="text" maxlength="24" placeholder="显示名，可为空" autocomplete="off" />
          </div>
          <button type="submit">创建并进入</button>
        </form>

        <form id="searchTableForm" class="lobby-panel lobby-detail-panel" data-lobby-panel="search" hidden>
          <div class="lobby-panel-head">
            <h2>查找牌桌</h2>
            <p>输入牌桌号，或刷新当前大厅。</p>
          </div>
          <div class="lobby-search-row">
            <input id="tableSearchInput" type="search" placeholder="输入牌桌号" autocomplete="off" />
            <button type="submit">查询</button>
          </div>
          <button id="refreshTables" type="button">刷新大厅</button>
        </form>
      </div>

      <div id="lobbyMessage" class="lobby-message" role="status"></div>
      <div id="tableList" class="table-list" aria-live="polite"></div>
    </div>`;
  bindLobbyActionButtons(root);
}

function bindLobbyActionButtons(root) {
  const buttons = [...root.querySelectorAll("[data-lobby-action]")];
  const panels = [...root.querySelectorAll("[data-lobby-panel]")];
  const setActive = (mode) => {
    root.dataset.lobbyMode = mode;
    buttons.forEach((button) => {
      const active = button.dataset.lobbyAction === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-expanded", String(active));
    });
    panels.forEach((panel) => {
      const active = panel.dataset.lobbyPanel === mode;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
  };
  buttons.forEach((button) => {
    button.addEventListener("click", () => setActive(button.dataset.lobbyAction));
  });
}

mountLobbyView();
