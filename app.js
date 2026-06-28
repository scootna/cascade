const state = {
  cols: 4,
  rows: 4,
  tileShape: "square",
  viewMode: "arrows",
  hideBaseAndMatchedCurrent: true,
  showCurrentValueBadge: false,
  arrowPosition: 40,
  arrowScale: 2.15,
  currentValueScale: 1.4,
  animationSpeed: 220,
  bounceStrength: 2,
  tileDelay: 55,
  rotationDirection: "cw",
  useRotationIcons: false,
  useFlowSound: true,
  colorPalette: "coastal",
  helpOpen: false,
  allowNegativeBaseRunoff: false,
  baseTileAccumulation: 3,
  showRotatableHints: false,
  lastPointerClientX: null,
  lastPointerClientY: null,
  lockedTileSize: null,
  lastCountedTileIndex: null,
  board: [],
  moves: 0,
  solved: false,
};

const boardEl = document.getElementById("board");
const boardStageEl = document.getElementById("boardStage");
const linkOverlayEl = document.getElementById("linkOverlay");
const displaySettingsToggleBtn = document.getElementById("displaySettingsToggleBtn");
const difficultySettingsToggleBtn = document.getElementById("difficultySettingsToggleBtn");
const displaySettingsCloseBtn = document.getElementById("displaySettingsCloseBtn");
const difficultySettingsCloseBtn = document.getElementById("difficultySettingsCloseBtn");
const settingsBackdropEl = document.getElementById("settingsBackdrop");
const displaySettingsModalEl = document.getElementById("displaySettingsModal");
const difficultySettingsModalEl = document.getElementById("difficultySettingsModal");
const statusTextEl = document.getElementById("statusText");
const movesTextEl = document.getElementById("movesText");
const postWinNewGameBtn = document.getElementById("postWinNewGameBtn");
const helpToggleBtn = document.getElementById("helpToggleBtn");
const helpSectionsEl = document.getElementById("helpSections");
const rotationDirectionToggleBtn = document.getElementById("rotationDirectionToggleBtn");
const valueBadgeToggleBtn = document.getElementById("valueBadgeToggleBtn");
const numberModeToggleBtn = document.getElementById("numberModeToggleBtn");
const viewToggleBtn = document.getElementById("viewToggleBtn");
const arrowPositionSliderEl = document.getElementById("arrowPositionSlider");
const arrowPositionValueEl = document.getElementById("arrowPositionValue");
const arrowScaleSliderEl = document.getElementById("arrowScaleSlider");
const arrowScaleValueEl = document.getElementById("arrowScaleValue");
const currentValueScaleSliderEl = document.getElementById("currentValueScaleSlider");
const currentValueScaleValueEl = document.getElementById("currentValueScaleValue");
const paletteSelectEl = document.getElementById("paletteSelect");
const animationSpeedSliderEl = document.getElementById("animationSpeedSlider");
const animationSpeedValueEl = document.getElementById("animationSpeedValue");
const bounceStrengthSliderEl = document.getElementById("bounceStrengthSlider");
const bounceStrengthValueEl = document.getElementById("bounceStrengthValue");
const tileDelaySliderEl = document.getElementById("tileDelaySlider");
const tileDelayValueEl = document.getElementById("tileDelayValue");
const tileShapeToggleBtn = document.getElementById("tileShapeToggleBtn");
const rotationIconsToggleBtn = document.getElementById("rotationIconsToggleBtn");
const flowSoundToggleBtn = document.getElementById("flowSoundToggleBtn");
const negativeBaseToggleBtn = document.getElementById("negativeBaseToggleBtn");
const rotatableHintsToggleBtn = document.getElementById("rotatableHintsToggleBtn");
const sizeSelect = document.getElementById("sizeSelect");
const baseTileAccumulationSliderEl = document.getElementById("baseTileAccumulationSlider");
const baseTileAccumulationValueEl = document.getElementById("baseTileAccumulationValue");
const SQUARE_DIR_DEGREES = [0, -45, -90, -135, 180, 135, 90, 45];
const HEX_DIR_DEGREES = [0, -60, -120, 180, 120, 60];
const rotationCursorEl = document.createElement("div");
rotationCursorEl.className = "rotation-cursor";
document.body.appendChild(rotationCursorEl);
let flowAudioContext = null;
let blockedSoundLastAtMs = 0;

function setSettingsDrawerOpen(drawerName, isOpen) {
  const displayOpen = drawerName === "display" ? isOpen : false;
  const difficultyOpen = drawerName === "difficulty" ? isOpen : false;

  document.body.classList.toggle("display-settings-open", displayOpen);
  document.body.classList.toggle("difficulty-settings-open", difficultyOpen);

  if (displaySettingsModalEl) {
    displaySettingsModalEl.setAttribute("aria-hidden", displayOpen ? "false" : "true");
  }
  if (difficultySettingsModalEl) {
    difficultySettingsModalEl.setAttribute("aria-hidden", difficultyOpen ? "false" : "true");
  }
  if (settingsBackdropEl) {
    settingsBackdropEl.setAttribute("aria-hidden", displayOpen || difficultyOpen ? "false" : "true");
  }
  if (displaySettingsToggleBtn) {
    displaySettingsToggleBtn.setAttribute("aria-expanded", displayOpen ? "true" : "false");
  }
  if (difficultySettingsToggleBtn) {
    difficultySettingsToggleBtn.setAttribute("aria-expanded", difficultyOpen ? "true" : "false");
  }
}

function getDirectionCount() {
  return state.tileShape === "hex" ? 6 : 8;
}

function getDirectionDegrees() {
  return state.tileShape === "hex" ? HEX_DIR_DEGREES : SQUARE_DIR_DEGREES;
}

function getDirectionAngle(dir) {
  if (dir === null) {
    return 0;
  }
  const degrees = getDirectionDegrees();
  return degrees[dir] ?? 0;
}

function getClockwiseAngleDelta(fromAngle, toAngle) {
  let delta = toAngle - fromAngle;
  while (delta < 0) {
    delta += 360;
  }
  while (delta >= 360) {
    delta -= 360;
  }
  return delta;
}

function getCounterclockwiseAngleDelta(fromAngle, toAngle) {
  let delta = toAngle - fromAngle;
  while (delta > 0) {
    delta -= 360;
  }
  while (delta <= -360) {
    delta += 360;
  }
  return delta;
}

function animateDirectionRotation(directionEl, fromDir, toDir, rotationDirection = state.rotationDirection) {
  if (!directionEl || fromDir === null || toDir === null || fromDir === toDir) {
    return;
  }

  const fromAngle = getDirectionAngle(fromDir);
  const toAngle = getDirectionAngle(toDir);
  const delta = rotationDirection === "cw"
    ? getClockwiseAngleDelta(fromAngle, toAngle)
    : getCounterclockwiseAngleDelta(fromAngle, toAngle);
  const finalAngle = fromAngle + delta;

  directionEl.animate(
    [
      { transform: `translate(-50%, -50%) rotate(${fromAngle}deg)` },
      { transform: `translate(-50%, -50%) rotate(${finalAngle}deg)` },
    ],
    {
      duration: state.animationSpeed,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    }
  );
}

function animateTileBounce(tileEl) {
  if (!tileEl || state.bounceStrength <= 0) {
    return;
  }

  const overshoot = 1 + state.bounceStrength / 100;
  tileEl.animate(
    [
      { transform: "scale(1)" },
      { transform: `scale(${overshoot})`, offset: 0.35 },
      { transform: "scale(0.985)", offset: 0.7 },
      { transform: "scale(1)" },
    ],
    {
      duration: state.animationSpeed,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    }
  );
}

function animateBlockedTap(tileEl) {
  if (!tileEl) {
    return;
  }

  tileEl.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-4px)", offset: 0.2 },
      { transform: "translateX(4px)", offset: 0.4 },
      { transform: "translateX(-3px)", offset: 0.6 },
      { transform: "translateX(3px)", offset: 0.8 },
      { transform: "translateX(0)" },
    ],
    {
      duration: Math.max(130, Math.min(190, state.animationSpeed * 0.7)),
      easing: "ease-out",
    }
  );
}

function animateCurrentValueUpdate(currentEl, delay = 0) {
  if (!currentEl) {
    return;
  }

  const baseScale = state.currentValueScale;
  currentEl.animate(
    [
      {
        transform: `translate(-50%, -50%) scale(${baseScale * 0.96})`,
      },
      {
        transform: `translate(-50%, -50%) scale(${baseScale * 1.04})`,
        offset: 0.5,
      },
      {
        transform: `translate(-50%, -50%) scale(${baseScale})`,
      },
    ],
    {
      duration: Math.max(180, state.animationSpeed + 40),
      delay,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    }
  );
}

function getFlowAudioContext() {
  if (flowAudioContext) {
    return flowAudioContext;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) {
    return null;
  }
  flowAudioContext = new Ctx();
  return flowAudioContext;
}

function playFlowChangeSounds(valueDelayMap) {
  if (!state.useFlowSound || valueDelayMap.size === 0) {
    return;
  }

  const audioCtx = getFlowAudioContext();
  if (!audioCtx) {
    return;
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const sortedDelays = [...valueDelayMap.values()].sort((a, b) => a - b).slice(0, 8);
  const spread = Math.max(1, sortedDelays.length - 1);

  sortedDelays.forEach((delayMs, order) => {
    const startTime = audioCtx.currentTime + Math.max(0, delayMs) / 1000;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filterNode = audioCtx.createBiquadFilter();

    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(2200, startTime);

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(520 + (order / spread) * 160, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.028, startTime + 0.012);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.13);
  });
}

function playBlockedRotationSound() {
  if (!state.useFlowSound) {
    return;
  }

  const nowMs = performance.now();
  if (nowMs - blockedSoundLastAtMs < 65) {
    return;
  }
  blockedSoundLastAtMs = nowMs;

  const audioCtx = getFlowAudioContext();
  if (!audioCtx) {
    return;
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const startTime = audioCtx.currentTime;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const filterNode = audioCtx.createBiquadFilter();

  filterNode.type = "lowpass";
  filterNode.frequency.setValueAtTime(1400, startTime);

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(230, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(180, startTime + 0.08);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.03, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09);

  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + 0.1);
}

function playSolvedSound() {
  if (!state.useFlowSound) {
    return;
  }

  const audioCtx = getFlowAudioContext();
  if (!audioCtx) {
    return;
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const startTime = audioCtx.currentTime;
  const notes = [440, 554.37, 659.25];

  notes.forEach((freq, idx) => {
    const noteStart = startTime + idx * 0.075;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filterNode = audioCtx.createBiquadFilter();

    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(2600, noteStart);

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(freq, noteStart);

    gainNode.gain.setValueAtTime(0.0001, noteStart);
    gainNode.gain.exponentialRampToValueAtTime(0.03, noteStart + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.17);

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.18);
  });
}

function playSolvedAnimation() {
  boardEl.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.04)", offset: 0.35 },
      { transform: "scale(0.995)", offset: 0.72 },
      { transform: "scale(1)" },
    ],
    {
      duration: 620,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    }
  );

  if (boardStageEl) {
    boardStageEl.classList.remove("solved-celebrate");
    // Restart the CSS keyframe animation when solving again in a new puzzle.
    void boardStageEl.offsetWidth;
    boardStageEl.classList.add("solved-celebrate");
    window.setTimeout(() => {
      boardStageEl.classList.remove("solved-celebrate");
    }, 760);
  }
}

function triggerSolvedCelebration() {
  playSolvedAnimation();
  playSolvedSound();
}

function collectDownstreamPath(startIndex) {
  const path = [];
  const visited = new Set([startIndex]);
  let currentIndex = startIndex;

  while (true) {
    const cell = state.board[currentIndex];
    if (!cell || cell.currentDir === null) {
      return path;
    }

    const nextIndex = followDirection(state.cols, state.rows, currentIndex, cell.currentDir);
    if (nextIndex === currentIndex || visited.has(nextIndex)) {
      return path;
    }

    path.push(nextIndex);
    visited.add(nextIndex);
    currentIndex = nextIndex;
  }
}

function buildValueUpdateDelayMap(oldPath, newPath, changedIndexes) {
  const delayMap = new Map();
  const stepDelay = state.tileDelay;
  const assignPathDelays = (path) => {
    path.forEach((index, order) => {
      if (!changedIndexes.has(index)) {
        return;
      }
      const nextDelay = order * stepDelay;
      const existingDelay = delayMap.get(index);
      if (existingDelay === undefined || nextDelay < existingDelay) {
        delayMap.set(index, nextDelay);
      }
    });
  };

  assignPathDelays(newPath);
  assignPathDelays(oldPath);

  let trailingOrder = Math.max(newPath.length, oldPath.length);
  changedIndexes.forEach((index) => {
    if (delayMap.has(index)) {
      return;
    }
    delayMap.set(index, trailingOrder * stepDelay);
    trailingOrder += 1;
  });

  return delayMap;
}

function applyNumberMode() {
  if (!numberModeToggleBtn) {
    return;
  }
  numberModeToggleBtn.textContent = state.hideBaseAndMatchedCurrent
    ? "Number Mode: Minimal"
    : "Number Mode: Standard";
}

function applyValueBadgeMode() {
  boardEl.classList.toggle("hide-current-badge", !state.showCurrentValueBadge);
  if (!valueBadgeToggleBtn) {
    return;
  }
  valueBadgeToggleBtn.textContent = state.showCurrentValueBadge
    ? "Value Badge: On"
    : "Value Badge: Off";
}

function applyRotationDirection() {
  if (!rotationDirectionToggleBtn) {
    return;
  }
  rotationDirectionToggleBtn.textContent =
    state.rotationDirection === "cw"
      ? "Rotation: Clockwise"
      : "Rotation: Counterclockwise";
}

function applyRotationIconsMode() {
  if (rotationIconsToggleBtn) {
    rotationIconsToggleBtn.textContent = state.useRotationIcons
      ? "Rotation Icons: On"
      : "Rotation Icons: Off";
  }
  if (!state.useRotationIcons) {
    hideRotationCursor();
  }
}

function applyFlowSoundMode() {
  if (!flowSoundToggleBtn) {
    return;
  }
  flowSoundToggleBtn.textContent = state.useFlowSound
    ? "Flow Sound: On"
    : "Flow Sound: Off";
}

function applyHelpVisibility() {
  if (helpSectionsEl) {
    helpSectionsEl.hidden = !state.helpOpen;
  }
  if (helpToggleBtn) {
    helpToggleBtn.textContent = state.helpOpen ? "Hide Help" : "Help";
    helpToggleBtn.setAttribute("aria-expanded", state.helpOpen ? "true" : "false");
  }
}

function applyColorPalette() {
  document.body.dataset.palette = state.colorPalette;
  if (paletteSelectEl) {
    paletteSelectEl.value = state.colorPalette;
  }
}

function applyNegativeBaseMode() {
  if (!negativeBaseToggleBtn) {
    return;
  }
  negativeBaseToggleBtn.textContent = state.allowNegativeBaseRunoff
    ? "Negative Base Runoff: On"
    : "Negative Base Runoff: Off";
}

function applyBaseTileAccumulationMode() {
  if (baseTileAccumulationValueEl) {
    baseTileAccumulationValueEl.textContent = String(state.baseTileAccumulation);
  }
  if (baseTileAccumulationSliderEl) {
    baseTileAccumulationSliderEl.value = String(state.baseTileAccumulation);
  }
}

function applyRotatableHintsMode() {
  if (!rotatableHintsToggleBtn) {
    return;
  }
  rotatableHintsToggleBtn.textContent = state.showRotatableHints
    ? "Rotatable Hints: On"
    : "Rotatable Hints: Off";
}

function applyTileShape() {
  boardEl.classList.toggle("shape-square", state.tileShape === "square");
  boardEl.classList.toggle("shape-hex", state.tileShape === "hex");
  if (!tileShapeToggleBtn) {
    return;
  }
  tileShapeToggleBtn.textContent =
    state.tileShape === "hex" ? "Tiles: Hexagons" : "Tiles: Squares";
}

function applyArrowPosition() {
  boardEl.style.setProperty("--dir-forward", `${state.arrowPosition}%`);
  if (arrowPositionValueEl) {
    arrowPositionValueEl.textContent = `${state.arrowPosition}%`;
  }
  if (arrowPositionSliderEl) {
    arrowPositionSliderEl.value = String(state.arrowPosition);
  }
}

function applyArrowScale() {
  const tileSize = Math.max(1, state.lockedTileSize || 120);
  const arrowBodyScale = Math.max(0.62, Math.min(0.9, 0.76 + (state.arrowScale - 2.15) * 0.11));
  const arrowHeadScale = Math.max(0.55, Math.min(1.2, 0.84 + (state.arrowScale - 2.15) * 0.12));
  const dirSize = Math.round(tileSize * arrowBodyScale);
  const dirForward = Math.round(tileSize * 0.34);
  const headHeight = Math.max(4, Math.round(tileSize * 0.11 * arrowHeadScale));
  const headWidth = Math.max(6, Math.round(tileSize * 0.18 * arrowHeadScale));

  boardEl.style.setProperty("--dir-size", `${dirSize}px`);
  boardEl.style.setProperty("--dir-forward", `${dirForward}px`);
  boardEl.style.setProperty("--dir-head-height", `${headHeight}px`);
  boardEl.style.setProperty("--dir-head-width", `${headWidth}px`);
  if (arrowScaleValueEl) {
    arrowScaleValueEl.textContent = `${state.arrowScale.toFixed(2)}x`;
  }
  if (arrowScaleSliderEl) {
    arrowScaleSliderEl.value = String(state.arrowScale);
  }
}

function applyCurrentValueScale() {
  boardEl.style.setProperty("--current-scale", String(state.currentValueScale));
  if (currentValueScaleValueEl) {
    currentValueScaleValueEl.textContent = `${state.currentValueScale.toFixed(2)}x`;
  }
  if (currentValueScaleSliderEl) {
    currentValueScaleSliderEl.value = String(state.currentValueScale);
  }
}

function applyAnimationSpeed() {
  if (animationSpeedValueEl) {
    animationSpeedValueEl.textContent = `${state.animationSpeed}ms`;
  }
  if (animationSpeedSliderEl) {
    animationSpeedSliderEl.value = String(state.animationSpeed);
  }
}

function applyBounceStrength() {
  if (bounceStrengthValueEl) {
    bounceStrengthValueEl.textContent = `${state.bounceStrength}%`;
  }
  if (bounceStrengthSliderEl) {
    bounceStrengthSliderEl.value = String(state.bounceStrength);
  }
}

function applyTileDelay() {
  if (tileDelayValueEl) {
    tileDelayValueEl.textContent = `${state.tileDelay}ms`;
  }
  if (tileDelaySliderEl) {
    tileDelaySliderEl.value = String(state.tileDelay);
  }
}

function applyViewMode() {
  if (!boardStageEl) {
    return;
  }
  boardStageEl.classList.toggle("show-arrows", state.viewMode === "arrows");
  boardStageEl.classList.toggle("show-lines", state.viewMode === "lines");
  if (viewToggleBtn) {
    viewToggleBtn.textContent = state.viewMode === "arrows" ? "View: Arrows" : "View: Flow Lines";
  }
}

function parseGridValue(value) {
  const parts = value.split("x");
  if (parts.length === 2) {
    const cols = Number(parts[0]);
    const rows = Number(parts[1]);
    if (Number.isFinite(cols) && Number.isFinite(rows) && cols > 0 && rows > 0) {
      return { cols, rows };
    }
  }

  const n = Number(value);
  if (Number.isFinite(n) && n > 0) {
    return { cols: n, rows: n };
  }

  return { cols: 6, rows: 6 };
}

if (postWinNewGameBtn) {
  postWinNewGameBtn.addEventListener("click", () => {
    const grid = parseGridValue(sizeSelect.value);
    startNewPuzzle(grid.cols, grid.rows);
  });
}

if (helpToggleBtn) {
  helpToggleBtn.addEventListener("click", () => {
    state.helpOpen = !state.helpOpen;
    applyHelpVisibility();
  });
}

sizeSelect.addEventListener("change", () => {
  const grid = parseGridValue(sizeSelect.value);
  startNewPuzzle(grid.cols, grid.rows);
});

if (viewToggleBtn) {
  viewToggleBtn.addEventListener("click", () => {
    state.viewMode = state.viewMode === "arrows" ? "lines" : "arrows";
    applyViewMode();
  });
}

if (rotationDirectionToggleBtn) {
  rotationDirectionToggleBtn.addEventListener("click", () => {
    state.rotationDirection = state.rotationDirection === "cw" ? "ccw" : "cw";
    applyRotationDirection();
  });
}

if (rotationIconsToggleBtn) {
  rotationIconsToggleBtn.addEventListener("click", () => {
    state.useRotationIcons = !state.useRotationIcons;
    applyRotationIconsMode();
    renderBoard();
  });
}

if (flowSoundToggleBtn) {
  flowSoundToggleBtn.addEventListener("click", () => {
    state.useFlowSound = !state.useFlowSound;
    applyFlowSoundMode();
  });
}

if (negativeBaseToggleBtn) {
  negativeBaseToggleBtn.addEventListener("click", () => {
    state.allowNegativeBaseRunoff = !state.allowNegativeBaseRunoff;
    applyNegativeBaseMode();
    startNewPuzzle(state.cols, state.rows);
  });
}

if (rotatableHintsToggleBtn) {
  rotatableHintsToggleBtn.addEventListener("click", () => {
    state.showRotatableHints = !state.showRotatableHints;
    applyRotatableHintsMode();
    renderBoard();
  });
}

if (tileShapeToggleBtn) {
  tileShapeToggleBtn.addEventListener("click", () => {
    state.tileShape = state.tileShape === "square" ? "hex" : "square";
    applyTileShape();
    startNewPuzzle(state.cols, state.rows);
  });
}

if (numberModeToggleBtn) {
  numberModeToggleBtn.addEventListener("click", () => {
    state.hideBaseAndMatchedCurrent = !state.hideBaseAndMatchedCurrent;
    applyNumberMode();
    renderBoard();
  });
}

if (valueBadgeToggleBtn) {
  valueBadgeToggleBtn.addEventListener("click", () => {
    state.showCurrentValueBadge = !state.showCurrentValueBadge;
    applyValueBadgeMode();
  });
}

if (arrowPositionSliderEl) {
  arrowPositionSliderEl.addEventListener("input", () => {
    state.arrowPosition = Number(arrowPositionSliderEl.value);
    applyArrowPosition();
  });
}

if (arrowScaleSliderEl) {
  arrowScaleSliderEl.addEventListener("input", () => {
    state.arrowScale = Number(arrowScaleSliderEl.value);
    applyArrowScale();
  });
}

if (currentValueScaleSliderEl) {
  currentValueScaleSliderEl.addEventListener("input", () => {
    state.currentValueScale = Number(currentValueScaleSliderEl.value);
    applyCurrentValueScale();
  });
}

if (paletteSelectEl) {
  paletteSelectEl.addEventListener("change", () => {
    state.colorPalette = paletteSelectEl.value;
    applyColorPalette();
  });
}

if (animationSpeedSliderEl) {
  animationSpeedSliderEl.addEventListener("input", () => {
    state.animationSpeed = Number(animationSpeedSliderEl.value);
    applyAnimationSpeed();
  });
}

if (bounceStrengthSliderEl) {
  bounceStrengthSliderEl.addEventListener("input", () => {
    state.bounceStrength = Number(bounceStrengthSliderEl.value);
    applyBounceStrength();
  });
}

if (tileDelaySliderEl) {
  tileDelaySliderEl.addEventListener("input", () => {
    state.tileDelay = Number(tileDelaySliderEl.value);
    applyTileDelay();
  });
}

if (baseTileAccumulationSliderEl) {
  baseTileAccumulationSliderEl.addEventListener("input", () => {
    state.baseTileAccumulation = Number(baseTileAccumulationSliderEl.value);
    applyBaseTileAccumulationMode();
    startNewPuzzle(state.cols, state.rows);
  });
}

if (displaySettingsToggleBtn) {
  displaySettingsToggleBtn.addEventListener("click", () => {
    const shouldOpen = !document.body.classList.contains("display-settings-open");
    setSettingsDrawerOpen("display", shouldOpen);
  });
}

if (difficultySettingsToggleBtn) {
  difficultySettingsToggleBtn.addEventListener("click", () => {
    const shouldOpen = !document.body.classList.contains("difficulty-settings-open");
    setSettingsDrawerOpen("difficulty", shouldOpen);
  });
}

if (displaySettingsCloseBtn) {
  displaySettingsCloseBtn.addEventListener("click", () => {
    setSettingsDrawerOpen("display", false);
  });
}

if (difficultySettingsCloseBtn) {
  difficultySettingsCloseBtn.addEventListener("click", () => {
    setSettingsDrawerOpen("difficulty", false);
  });
}

if (settingsBackdropEl) {
  settingsBackdropEl.addEventListener("click", () => {
    setSettingsDrawerOpen("display", false);
    setSettingsDrawerOpen("difficulty", false);
  });
}

window.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape"
    && (document.body.classList.contains("display-settings-open") || document.body.classList.contains("difficulty-settings-open"))
  ) {
    setSettingsDrawerOpen("display", false);
    setSettingsDrawerOpen("difficulty", false);
  }
});

function inBounds(cols, rows, x, y) {
  return x >= 0 && y >= 0 && x < cols && y < rows;
}

function indexFromXY(cols, x, y) {
  return y * cols + x;
}

function xyFromIndex(cols, index) {
  return { x: index % cols, y: Math.floor(index / cols) };
}

function neighborsFor(cols, rows, x, y) {
  const candidates = state.tileShape === "hex"
    ? (y % 2 === 0
      ? [
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: -1, dy: -1 },
        { dx: -1, dy: 0 },
        { dx: -1, dy: 1 },
        { dx: 0, dy: 1 },
      ]
      : [
        { dx: 1, dy: 0 },
        { dx: 1, dy: -1 },
        { dx: 0, dy: -1 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 1 },
      ])
    : [
      { dx: 1, dy: 0 },
      { dx: 1, dy: -1 },
      { dx: 0, dy: -1 },
      { dx: -1, dy: -1 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
    ];

  const valid = [];
  for (let dir = 0; dir < candidates.length; dir += 1) {
    const nx = x + candidates[dir].dx;
    const ny = y + candidates[dir].dy;
    if (inBounds(cols, rows, nx, ny)) {
      valid.push({
        dir,
        index: indexFromXY(cols, nx, ny),
      });
    }
  }
  return valid;
}

function makeElevation(cols, rows) {
  const centerX = (cols - 1) / 2;
  const centerY = (rows - 1) / 2;
  const elev = new Array(cols * rows).fill(0);
  for (let i = 0; i < elev.length; i += 1) {
    const { x, y } = xyFromIndex(cols, i);
    const radial = Math.hypot(x - centerX, y - centerY) * 0.28;
    const tilt = y * 0.22 + x * 0.08;
    const noise = (Math.random() - 0.5) * 0.42;
    elev[i] = radial + tilt + noise;
  }
  return elev;
}

function chooseSolutionDirection(cols, rows, elev, index) {
  const { x, y } = xyFromIndex(cols, index);
  const neighbors = neighborsFor(cols, rows, x, y);
  const me = elev[index];

  let bestDrop = -Infinity;
  let best = null;
  for (const n of neighbors) {
    const drop = me - elev[n.index];
    if (drop > bestDrop) {
      bestDrop = drop;
      best = n;
    }
  }

  if (best && bestDrop > 0) {
    return best.dir;
  }

  // Sink tile: keep water at this cell by pointing to itself logically.
  return null;
}

function followDirection(cols, rows, index, dir) {
  if (dir === null) {
    return index;
  }
  const { x, y } = xyFromIndex(cols, index);
  const all = state.tileShape === "hex"
    ? (y % 2 === 0
      ? [
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: -1, dy: -1 },
        { dx: -1, dy: 0 },
        { dx: -1, dy: 1 },
        { dx: 0, dy: 1 },
      ]
      : [
        { dx: 1, dy: 0 },
        { dx: 1, dy: -1 },
        { dx: 0, dy: -1 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 1 },
      ])
    : [
      { dx: 1, dy: 0 },
      { dx: 1, dy: -1 },
      { dx: 0, dy: -1 },
      { dx: -1, dy: -1 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
    ];

  if (dir < 0 || dir >= all.length) {
    return index;
  }

  const nx = x + all[dir].dx;
  const ny = y + all[dir].dy;
  if (!inBounds(cols, rows, nx, ny)) {
    return index;
  }
  return indexFromXY(cols, nx, ny);
}

function wouldCreateCycle(board, startIndex, candidateDir) {
  const nextIndex = followDirection(state.cols, state.rows, startIndex, candidateDir);
  if (nextIndex === startIndex) {
    return true;
  }

  const visited = new Set([startIndex]);
  let currentIndex = nextIndex;

  while (true) {
    if (currentIndex === startIndex) {
      return true;
    }
    if (visited.has(currentIndex)) {
      return false;
    }
    visited.add(currentIndex);

    const cell = board[currentIndex];
    if (!cell || cell.currentDir === null) {
      return false;
    }

    const downstreamIndex = followDirection(state.cols, state.rows, currentIndex, cell.currentDir);
    if (downstreamIndex === currentIndex) {
      return false;
    }
    currentIndex = downstreamIndex;
  }
}

function getLoopTileIndices(board) {
  const n = board.length;
  const nextIndices = new Array(n).fill(null);
  for (let i = 0; i < n; i += 1) {
    const cell = board[i];
    if (!cell || cell.currentDir === null) {
      continue;
    }
    const nextIndex = followDirection(state.cols, state.rows, i, cell.currentDir);
    if (nextIndex !== i) {
      nextIndices[i] = nextIndex;
    }
  }

  const visitState = new Array(n).fill(0);
  const stack = [];
  const loopIndices = new Set();

  function visit(index) {
    if (index === null || index < 0 || index >= n) {
      return;
    }
    if (visitState[index] === 2) {
      return;
    }
    if (visitState[index] === 1) {
      const cycleStart = stack.lastIndexOf(index);
      if (cycleStart !== -1) {
        for (let i = cycleStart; i < stack.length; i += 1) {
          loopIndices.add(stack[i]);
        }
      }
      return;
    }

    visitState[index] = 1;
    stack.push(index);
    const nextIndex = nextIndices[index];
    if (nextIndex !== null) {
      visit(nextIndex);
    }
    stack.pop();
    visitState[index] = 2;
  }

  for (let i = 0; i < n; i += 1) {
    if (visitState[i] === 0) {
      visit(i);
    }
  }

  return loopIndices;
}

function shuffledDirections() {
  const dirs = Array.from({ length: getDirectionCount() }, (_, i) => i);
  for (let i = dirs.length - 1; i > 0; i -= 1) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    [dirs[i], dirs[swapIndex]] = [dirs[swapIndex], dirs[i]];
  }
  return dirs;
}

function findNextValidDirection(
  board,
  cellIndex,
  currentDir,
  excludedDir = null,
  rotationDirection = state.rotationDirection
) {
  const directionCount = getDirectionCount();
  const directionStep = rotationDirection === "cw" ? -1 : 1;
  for (let offset = 1; offset <= directionCount; offset += 1) {
    const candidateDir =
      (currentDir + directionStep * offset + directionCount * directionCount) % directionCount;
    if (candidateDir === excludedDir) {
      continue;
    }
    if (followDirection(state.cols, state.rows, cellIndex, candidateDir) === cellIndex) {
      continue;
    }
    return candidateDir;
  }
  return currentDir;
}

function getRotationDirectionFromClick(tileEl, event) {
  if (
    window.matchMedia("(hover: none), (pointer: coarse)").matches
    || !tileEl
    || !event
    || typeof event.clientX !== "number"
    || event.clientX <= 0
  ) {
    return "cw";
  }

  const rect = tileEl.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  return clickX < rect.width / 2 ? "ccw" : "cw";
}

function showRotationCursor(direction, clientX, clientY) {
  if (!rotationCursorEl) {
    return;
  }
  rotationCursorEl.style.left = `${clientX}px`;
  rotationCursorEl.style.top = `${clientY}px`;
  rotationCursorEl.classList.remove("cw", "ccw");
  rotationCursorEl.classList.add(direction === "ccw" ? "ccw" : "cw");
  rotationCursorEl.classList.add("active");
}

function hideRotationCursor() {
  if (!rotationCursorEl) {
    return;
  }
  rotationCursorEl.classList.remove("active", "cw", "ccw");
}

function updateTileHoverCursor(tileEl, event, canRotate) {
  if (!tileEl) {
    return;
  }

  tileEl.classList.remove("cursor-cw", "cursor-ccw", "cursor-cw-basic", "cursor-ccw-basic");

  if (!canRotate) {
    tileEl.classList.add("no-rotate");
    hideRotationCursor();
    return;
  }

  tileEl.classList.remove("no-rotate");
  const hoverDirection = getRotationDirectionFromClick(tileEl, event);
  if (state.useRotationIcons) {
    tileEl.classList.add(hoverDirection === "cw" ? "cursor-cw" : "cursor-ccw");
    showRotationCursor(hoverDirection, event.clientX, event.clientY);
  } else {
    tileEl.classList.add(hoverDirection === "cw" ? "cursor-cw-basic" : "cursor-ccw-basic");
    hideRotationCursor();
  }
}

function refreshHoverCursorFromPointer() {
  if (
    state.lastPointerClientX === null
    || state.lastPointerClientY === null
    || !Number.isFinite(state.lastPointerClientX)
    || !Number.isFinite(state.lastPointerClientY)
  ) {
    return;
  }

  const hoveredEl = document.elementFromPoint(state.lastPointerClientX, state.lastPointerClientY);
  const tileEl = hoveredEl?.closest?.(".tile");
  if (!tileEl || !boardEl.contains(tileEl)) {
    hideRotationCursor();
    return;
  }

  const tileIndex = Number(tileEl.dataset.index);
  const cell = Number.isFinite(tileIndex) ? state.board[tileIndex] : null;
  const canRotate = !!cell && cell.solutionDir !== null;
  updateTileHoverCursor(
    tileEl,
    { clientX: state.lastPointerClientX, clientY: state.lastPointerClientY },
    canRotate
  );
}

function buildLinkOverlay() {
  if (!linkOverlayEl || !boardStageEl) {
    return;
  }

  const boardRect = boardEl.getBoundingClientRect();
  const stageRect = boardStageEl.getBoundingClientRect();
  const width = Math.max(1, boardRect.width);
  const height = Math.max(1, boardRect.height);
  const left = Math.max(0, boardRect.left - stageRect.left);
  const top = Math.max(0, boardRect.top - stageRect.top);

  linkOverlayEl.style.left = `${left}px`;
  linkOverlayEl.style.top = `${top}px`;
  linkOverlayEl.style.width = `${width}px`;
  linkOverlayEl.style.height = `${height}px`;

  linkOverlayEl.setAttribute("viewBox", `0 0 ${width} ${height}`);
  linkOverlayEl.setAttribute("width", String(width));
  linkOverlayEl.setAttribute("height", String(height));

  const tileEls = boardEl.querySelectorAll(".tile");
  if (tileEls.length === 0) {
    linkOverlayEl.replaceChildren();
    return;
  }

  const centers = new Map();
  tileEls.forEach((tileEl) => {
    const index = Number(tileEl.dataset.index);
    const rect = tileEl.getBoundingClientRect();
    centers.set(index, {
      x: rect.left - boardRect.left + rect.width / 2,
      y: rect.top - boardRect.top + rect.height / 2,
    });
  });

  const ns = "http://www.w3.org/2000/svg";
  const fragment = document.createDocumentFragment();

  for (const cell of state.board) {
    if (cell.currentDir === null) {
      continue;
    }

    const from = centers.get(cell.index);
    const toIndex = followDirection(state.cols, state.rows, cell.index, cell.currentDir);
    if (toIndex === cell.index) {
      continue;
    }

    const to = centers.get(toIndex);
    if (!from || !to) {
      continue;
    }

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const lineEndX = from.x + dx * 0.78;
    const lineEndY = from.y + dy * 0.78;

    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", String(from.x));
    line.setAttribute("y1", String(from.y));
    line.setAttribute("x2", String(lineEndX));
    line.setAttribute("y2", String(lineEndY));
    line.setAttribute(
      "class",
      `flow-link ${cell.currentAccum === cell.targetAccum ? "solved" : ""}`
    );
    fragment.appendChild(line);
  }

  linkOverlayEl.replaceChildren(fragment);
}

function accumulate(board, useSolution) {
  const n = board.length;
  const incoming = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i += 1) {
    const dir = useSolution ? board[i].solutionDir : board[i].currentDir;
    const to = followDirection(state.cols, state.rows, i, dir);
    if (to !== i) {
      incoming[to].push(i);
    }
  }

  const memo = new Array(n).fill(null);
  const visiting = new Set();

  function dfs(i) {
    if (memo[i] !== null) {
      return memo[i];
    }
    if (visiting.has(i)) {
      return board[i].baseFlow;
    }

    visiting.add(i);
    let sum = board[i].baseFlow;
    for (const up of incoming[i]) {
      sum += dfs(up);
    }
    visiting.delete(i);
    memo[i] = sum;
    return sum;
  }

  const result = new Array(n).fill(0);
  for (let i = 0; i < n; i += 1) {
    result[i] = dfs(i);
  }
  return result;
}

function scrambleDirections(board) {
  const order = board.map((cell) => cell.index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    [order[i], order[swapIndex]] = [order[swapIndex], order[i]];
  }

  for (const index of order) {
    const cell = board[index];
    if (cell.solutionDir === null) {
      cell.currentDir = null;
      continue;
    }

    let assignedDir = null;
    for (const candidateDir of shuffledDirections()) {
      if (candidateDir === cell.solutionDir) {
        continue;
      }
      if (followDirection(state.cols, state.rows, index, candidateDir) === index) {
        continue;
      }
      if (wouldCreateCycle(board, index, candidateDir)) {
        continue;
      }
      assignedDir = candidateDir;
      break;
    }

    cell.currentDir = assignedDir ?? cell.solutionDir;
  }
}

function startNewPuzzle(cols, rows) {
  state.cols = cols;
  state.rows = rows;
  state.solved = false;
  state.moves = 0;
  state.lastCountedTileIndex = null;
  movesTextEl.textContent = "Moves: 0";

  const elev = makeElevation(cols, rows);
  const board = [];
  const maxBaseTileAccumulation = Math.max(1, Math.round(state.baseTileAccumulation));
  const positiveBaseValues = Array.from({ length: maxBaseTileAccumulation }, (_, index) => index + 1);
  const signedBaseValues = [];
  for (let value = -maxBaseTileAccumulation; value <= maxBaseTileAccumulation; value += 1) {
    if (value !== 0) {
      signedBaseValues.push(value);
    }
  }

  for (let i = 0; i < cols * rows; i += 1) {
    const pool = state.allowNegativeBaseRunoff ? signedBaseValues : positiveBaseValues;
    const baseFlow = pool[Math.floor(Math.random() * pool.length)];
    const solutionDir = chooseSolutionDirection(cols, rows, elev, i);
    board.push({
      index: i,
      baseFlow,
      solutionDir,
      currentDir: solutionDir,
      targetAccum: 0,
      currentAccum: 0,
    });
  }

  const target = accumulate(board, true);
  for (let i = 0; i < board.length; i += 1) {
    board[i].targetAccum = target[i];
  }

  scrambleDirections(board);
  let current = accumulate(board, false);

  // Avoid generating a board that starts already solved.
  if (current.every((value, idx) => value === board[idx].targetAccum)) {
    const pivot = board.find((cell) => cell.solutionDir !== null);
    if (pivot) {
      pivot.currentDir = findNextValidDirection(board, pivot.index, pivot.currentDir, pivot.solutionDir);
      current = accumulate(board, false);
    }
  }

  for (let i = 0; i < board.length; i += 1) {
    board[i].currentAccum = current[i];
  }

  state.board = board;
  renderBoard();
  updateStatus();
}

function rotateCell(index, tileEl = null, rotationDirection = state.rotationDirection) {
  if (state.solved) {
    return;
  }

  const cell = state.board[index];
  if (cell.solutionDir === null) {
    return;
  }

  if (state.lastCountedTileIndex !== index) {
    state.lastCountedTileIndex = index;
    state.moves += 1;
    movesTextEl.textContent = `Moves: ${state.moves}`;
  }

  const previousDir = cell.currentDir;
  const previousCurrentValues = state.board.map((boardCell) => boardCell.currentAccum);
  const oldDownstreamPath = collectDownstreamPath(index);

  const nextDir = findNextValidDirection(state.board, index, cell.currentDir, null, rotationDirection);

  if (nextDir === cell.currentDir) {
    animateBlockedTap(tileEl ?? boardEl.querySelector(`.tile[data-index="${index}"]`));
    playBlockedRotationSound();
    return;
  }

  cell.currentDir = nextDir;
  cell.rotationFromDir = previousDir;
  cell.rotationDirectionUsed = rotationDirection;

  const current = accumulate(state.board, false);
  for (let i = 0; i < state.board.length; i += 1) {
    state.board[i].currentAccum = current[i];
  }

  const newDownstreamPath = collectDownstreamPath(index);
  const changedIndexes = new Set();
  for (let i = 0; i < state.board.length; i += 1) {
    if (previousCurrentValues[i] !== state.board[i].currentAccum) {
      changedIndexes.add(i);
    }
  }

  const valueDelayMap = buildValueUpdateDelayMap(oldDownstreamPath, newDownstreamPath, changedIndexes);
  for (let i = 0; i < state.board.length; i += 1) {
    if (changedIndexes.has(i)) {
      state.board[i].shouldAnimateValue = true;
      state.board[i].valueUpdateDelay = valueDelayMap.get(i) ?? 0;
    }
  }

  playFlowChangeSounds(valueDelayMap);

  renderBoard();
  updateStatus();
}

function isSolved() {
  for (const cell of state.board) {
    if (cell.currentAccum !== cell.targetAccum) {
      return false;
    }
  }
  return true;
}

function updateStatus() {
  const wasSolved = state.solved;
  const solvedNow = isSolved();
  state.solved = solvedNow;

  if (solvedNow && !wasSolved) {
    triggerSolvedCelebration();
  }

  if (solvedNow) {
    statusTextEl.textContent = `Solved in ${state.moves} moves. New Puzzle for another watershed.`;
  } else {
    const remaining = state.board.filter((c) => c.currentAccum !== c.targetAccum).length;
    statusTextEl.textContent = `${remaining} tiles still mismatched.`;
  }
}

function renderBoard() {
  const stageWidth = Math.max(1, boardStageEl?.clientWidth ?? 0);
  const stageHeight = Math.max(1, boardStageEl?.clientHeight ?? 0);
  const boardStyles = getComputedStyle(boardEl);
  const tileGap = Number.parseFloat(boardStyles.gap || boardStyles.columnGap || "0") || 0;

  if (state.tileShape === "hex") {
    const hexPadding = (Number.parseFloat(boardStyles.paddingTop || "0") || 0)
      + (Number.parseFloat(boardStyles.paddingBottom || "0") || 0);
    const widthLimit = (2 * stageWidth - (2 * state.cols - 1) * tileGap) / (2 * state.cols + 1);
    const hexRowHeight = 1 / 0.866;
    const rowPitch = 0.866;
    const heightDenominator = (state.rows - 1) * rowPitch + hexRowHeight;
    const heightLimit = (stageHeight - hexPadding - (state.rows - 1) * tileGap) / heightDenominator;
    state.lockedTileSize = Math.max(56, Math.floor(Math.min(widthLimit, heightLimit) - 3));
  } else {
    const widthLimit = (stageWidth - (state.cols - 1) * tileGap) / state.cols;
    const heightLimit = (stageHeight - (state.rows - 1) * tileGap) / state.rows;
    state.lockedTileSize = Math.max(56, Math.floor(Math.min(widthLimit, heightLimit) - 2));
  }

  boardEl.style.setProperty("--locked-tile-size", `${state.lockedTileSize}px`);

  if (state.tileShape === "hex") {
    const hexGap = Number.parseFloat(boardStyles.columnGap) || 0;
    // Each hex spans two tracks plus one internal column gap; subtract that internal gap.
    const halfTile = Math.max(1, (state.lockedTileSize - hexGap) / 2);
    boardEl.style.gridTemplateColumns = `repeat(${state.cols * 2 + 1}, ${halfTile}px)`;
    boardEl.style.gridAutoRows = `${Math.round(state.lockedTileSize * 0.866)}px`;
  } else {
    boardEl.style.gridTemplateColumns = `repeat(${state.cols}, var(--locked-tile-size))`;
    boardEl.style.gridAutoRows = "";
  }

  const maxDim = Math.max(state.cols, state.rows);
  boardEl.classList.remove("grid-regular", "grid-compact", "grid-dense");
  if (maxDim >= 7) {
    boardEl.classList.add("grid-dense");
  } else if (maxDim >= 5) {
    boardEl.classList.add("grid-compact");
  } else {
    boardEl.classList.add("grid-regular");
  }

  applyArrowScale();

  const loopTileIndices = getLoopTileIndices(state.board);

  const frag = document.createDocumentFragment();
  for (const cell of state.board) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.classList.add(cell.currentAccum === cell.targetAccum ? "solved" : "unsolved");
    if (loopTileIndices.has(cell.index)) {
      tile.classList.add("loop");
    }
    if (cell.solutionDir === null) {
      tile.classList.add("no-rotate");
    }

    if (
      state.showRotatableHints
      && !state.solved
      && cell.solutionDir !== null
      && (
        findNextValidDirection(state.board, cell.index, cell.currentDir, null, "cw") !== cell.currentDir
        || findNextValidDirection(state.board, cell.index, cell.currentDir, null, "ccw") !== cell.currentDir
      )
    ) {
      tile.classList.add("rotatable-hint");
    }

    tile.setAttribute("aria-label", `Tile ${cell.index}`);
    tile.dataset.index = String(cell.index);

    const base = document.createElement("span");
    base.className = "base";
    base.textContent = `b:${cell.baseFlow}`;
    if (state.hideBaseAndMatchedCurrent) {
      base.style.display = "none";
    }

    const current = document.createElement("span");
    current.className = "current";
    current.textContent = String(cell.currentAccum);
    if (cell.shouldAnimateValue) {
      animateCurrentValueUpdate(current, cell.valueUpdateDelay ?? 0);
      delete cell.shouldAnimateValue;
      delete cell.valueUpdateDelay;
    }

    const target = document.createElement("span");
    target.className = "target";
    target.textContent = String(cell.targetAccum);
    if (state.hideBaseAndMatchedCurrent && cell.currentAccum === cell.targetAccum) {
      target.style.visibility = "hidden";
    }

    const direction = document.createElement("span");
    direction.className = "direction";
    if (cell.currentDir === null) {
      direction.classList.add("sink");
    } else {
      direction.style.setProperty("--dir-angle", `${getDirectionAngle(cell.currentDir)}deg`);
      if (cell.rotationFromDir !== undefined) {
        animateDirectionRotation(
          direction,
          cell.rotationFromDir,
          cell.currentDir,
          cell.rotationDirectionUsed ?? state.rotationDirection
        );
        delete cell.rotationFromDir;
        delete cell.rotationDirectionUsed;
      }
    }

    if (state.tileShape === "hex") {
      const { x, y } = xyFromIndex(state.cols, cell.index);
      const startCol = x * 2 + 1 + (y % 2);
      tile.style.gridColumn = `${startCol} / span 2`;
      tile.style.gridRow = String(y + 1);
    }

    tile.append(base, direction, current, target);
    tile.addEventListener("mousemove", (event) => {
      state.lastPointerClientX = event.clientX;
      state.lastPointerClientY = event.clientY;
      updateTileHoverCursor(tile, event, cell.solutionDir !== null);
    });
    tile.addEventListener("mouseleave", () => {
      if (cell.solutionDir === null) {
        tile.classList.remove("cursor-cw", "cursor-ccw", "cursor-cw-basic", "cursor-ccw-basic");
        tile.classList.add("no-rotate");
        hideRotationCursor();
        return;
      }
      tile.classList.remove("cursor-cw", "cursor-ccw", "cursor-cw-basic", "cursor-ccw-basic", "no-rotate");
      hideRotationCursor();
    });
    tile.addEventListener("click", (event) => {
      state.lastPointerClientX = event.clientX;
      state.lastPointerClientY = event.clientY;
      const clickRotationDirection = getRotationDirectionFromClick(tile, event);
      rotateCell(cell.index, tile, clickRotationDirection);
    });
    frag.appendChild(tile);
  }

  boardEl.replaceChildren(frag);
  buildLinkOverlay();
  refreshHoverCursorFromPointer();
}

startNewPuzzle(state.cols, state.rows);
applyTileShape();
applyArrowPosition();
applyArrowScale();
applyCurrentValueScale();
applyAnimationSpeed();
applyBounceStrength();
applyTileDelay();
applyNumberMode();
applyRotationDirection();
applyRotationIconsMode();
applyFlowSoundMode();
applyHelpVisibility();
applyColorPalette();
applyNegativeBaseMode();
applyBaseTileAccumulationMode();
applyRotatableHintsMode();
applyValueBadgeMode();
applyViewMode();
window.addEventListener("mousemove", (event) => {
  state.lastPointerClientX = event.clientX;
  state.lastPointerClientY = event.clientY;

  const hoveredEl = document.elementFromPoint(event.clientX, event.clientY);
  const tileEl = hoveredEl?.closest?.(".tile");
  if (!tileEl || !boardEl.contains(tileEl)) {
    hideRotationCursor();
  }
});
window.addEventListener("resize", () => {
  renderBoard();
});
