const DOCKABLE_PANEL_STORAGE_KEY = "mtg-online-dockable-panels-v1";
const DOCK_DETACH_DISTANCE = 12;
const DOCK_SNAP_DISTANCE = 96;
const DOCK_FLOAT_DEFAULT_WIDTH = 420;
const DOCK_PANEL_ORDER = ["lookup", "chat", "log"];

function initDockablePanels() {
  const topControls = document.querySelector(".top-controls");
  const panels = [...document.querySelectorAll(".dockable-panel[data-dock-id]")];
  if (!topControls || !panels.length) return;

  const dockState = loadDockablePanelState();

  const updateLayout = () => {
    panels.forEach((panel) => {
      topControls.dataset[`${panel.dataset.dockId}Docked`] = String(panel.parentElement === topControls);
    });
  };

  const saveState = () => {
    const next = {};
    panels.forEach((panel) => {
      next[panel.dataset.dockId] = {
        floating: panel.parentElement !== topControls,
        left: Number.parseFloat(panel.style.left) || 0,
        top: Number.parseFloat(panel.style.top) || 0,
      };
    });
    sessionStorage.setItem(DOCKABLE_PANEL_STORAGE_KEY, JSON.stringify(next));
  };

  const dockPanel = (panel) => {
    panel.classList.remove("is-floating", "is-dragging", "dock-snap-ready", "dock-resisting");
    panel.style.left = "";
    panel.style.top = "";
    panel.style.width = "";
    panel.style.height = "";
    insertDockedPanel(panel, panels, topControls);

    updateLayout();
    saveState();
  };

  const floatPanel = (panel, rect) => {
    if (panel.parentElement !== document.body) document.body.append(panel);
    panel.classList.add("is-floating");
    panel.style.width = `${Math.round(rect.width || DOCK_FLOAT_DEFAULT_WIDTH)}px`;
    if (rect.height) panel.style.height = `${Math.round(rect.height)}px`;
    setFloatingPanelPosition(panel, rect.left, rect.top);
    updateLayout();
  };

  const restorePanel = (panel) => {
    const saved = dockState[panel.dataset.dockId];
    if (!saved?.floating) return;
    const rect = panel.getBoundingClientRect();
    floatPanel(panel, rect.width ? rect : { left: 24, top: 96, width: DOCK_FLOAT_DEFAULT_WIDTH });
    setFloatingPanelPosition(panel, saved.left || 24, saved.top || 96);
  };

  panels.forEach((panel) => {
    const handle = panel.querySelector("[data-dock-handle]");
    if (!handle) return;
    handle.addEventListener("pointerdown", (event) => startDockablePanelDrag(event, panel, topControls, {
      dockPanel,
      floatPanel,
      saveState,
    }));
    restorePanel(panel);
  });

  updateLayout();
}

function startDockablePanelDrag(event, panel, topControls, actions) {
  if (event.button !== 0) return;

  event.preventDefault();
  const handle = event.currentTarget;
  const startRect = panel.getBoundingClientRect();
  const startPointer = { x: event.clientX, y: event.clientY };
  const startFloating = panel.parentElement !== topControls;
  let dragging = false;
  let snapReady = false;

  handle.setPointerCapture?.(event.pointerId);

  const startDragging = () => {
    dragging = true;
    panel.classList.remove("dock-resisting");
    panel.classList.add("is-dragging");
    document.body.classList.add("dock-panel-dragging");
    actions.floatPanel(panel, startRect);
  };

  const move = (moveEvent) => {
    const dx = moveEvent.clientX - startPointer.x;
    const dy = moveEvent.clientY - startPointer.y;
    const distance = Math.hypot(dx, dy);

    if (!dragging && !startFloating && distance < DOCK_DETACH_DISTANCE) {
      panel.classList.add("dock-resisting");
      return;
    }
    if (!dragging) startDragging();

    let left = startRect.left + dx;
    let top = startRect.top + dy;
    snapReady = isNearDockTarget(moveEvent, topControls);

    if (snapReady) {
      topControls.classList.add("dock-snap-target");
      panel.classList.add("dock-snap-ready");
    } else {
      topControls.classList.remove("dock-snap-target");
      panel.classList.remove("dock-snap-ready");
    }

    setFloatingPanelPosition(panel, left, top);
  };

  const finish = () => {
    handle.releasePointerCapture?.(event.pointerId);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", finish);
    window.removeEventListener("pointercancel", finish);
    topControls.classList.remove("dock-snap-target");
    panel.classList.remove("dock-resisting", "is-dragging", "dock-snap-ready");
    document.body.classList.remove("dock-panel-dragging");

    if (dragging && snapReady) {
      actions.dockPanel(panel);
    } else if (dragging) {
      actions.saveState();
    }
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", finish);
  window.addEventListener("pointercancel", finish);
}

function insertDockedPanel(panel, panels, topControls) {
  const panelOrder = DOCK_PANEL_ORDER.indexOf(panel.dataset.dockId);
  const nextPanel = panels.find((candidate) => {
    if (candidate === panel || candidate.parentElement !== topControls) return false;
    const candidateOrder = DOCK_PANEL_ORDER.indexOf(candidate.dataset.dockId);
    return candidateOrder > panelOrder;
  });
  topControls.insertBefore(panel, nextPanel || null);
}

function setFloatingPanelPosition(panel, left, top) {
  const width = panel.offsetWidth || Number.parseFloat(panel.style.width) || 360;
  const height = panel.offsetHeight || 180;
  const margin = 10;
  const x = clampDockValue(left, margin, Math.max(margin, window.innerWidth - width - margin));
  const y = clampDockValue(top, margin, Math.max(margin, window.innerHeight - height - margin));
  panel.style.left = `${Math.round(x)}px`;
  panel.style.top = `${Math.round(y)}px`;
}

function isNearDockTarget(event, topControls) {
  const rect = topControls.getBoundingClientRect();
  const nearestX = clampDockValue(event.clientX, rect.left, rect.right);
  const nearestY = clampDockValue(event.clientY, rect.top, rect.bottom);
  return Math.hypot(event.clientX - nearestX, event.clientY - nearestY) <= DOCK_SNAP_DISTANCE;
}

function loadDockablePanelState() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(DOCKABLE_PANEL_STORAGE_KEY) || "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function clampDockValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

initDockablePanels();
