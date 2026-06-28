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
  sinkTone: 7,
  lessonBand: "3to5",
  lessonId: "trace-values",
  animationSpeed: 220,
  bounceStrength: 2,
  tileDelay: 55,
  rotationDirection: "cw",
  useRotationIcons: false,
  useFlowSound: true,
  colorPalette: "coastal",
  helpOpen: false,
  allowNegativeBaseRunoff: false,
  disallowCrossingFlows: false,
  baseTileAccumulation: 3,
  showRotatableHints: false,
  lastPointerClientX: null,
  lastPointerClientY: null,
  lockedTileSize: null,
  lastCountedTileIndex: null,
  initialBoardSnapshot: null,
  board: [],
  moves: 0,
  solved: false,
  shareIncludeCompletedStats: false,
  loadedBenchmarkStats: null,
  timerActive: false,
  timerStartAtMs: null,
  timerElapsedMs: 0,
};

const boardEl = document.getElementById("board");
const boardStageEl = document.getElementById("boardStage");
const linkOverlayEl = document.getElementById("linkOverlay");
const displaySettingsToggleBtn = document.getElementById("displaySettingsToggleBtn");
const difficultySettingsToggleBtn = document.getElementById("difficultySettingsToggleBtn");
const shareSettingsToggleBtn = document.getElementById("shareSettingsToggleBtn");
const lessonSettingsToggleBtn = document.getElementById("lessonSettingsToggleBtn");
const displaySettingsCloseBtn = document.getElementById("displaySettingsCloseBtn");
const difficultySettingsCloseBtn = document.getElementById("difficultySettingsCloseBtn");
const shareSettingsCloseBtn = document.getElementById("shareSettingsCloseBtn");
const lessonSettingsCloseBtn = document.getElementById("lessonSettingsCloseBtn");
const settingsBackdropEl = document.getElementById("settingsBackdrop");
const displaySettingsModalEl = document.getElementById("displaySettingsModal");
const difficultySettingsModalEl = document.getElementById("difficultySettingsModal");
const shareSettingsModalEl = document.getElementById("shareSettingsModal");
const lessonSettingsModalEl = document.getElementById("lessonSettingsModal");
const statusTextEl = document.getElementById("statusText");
const movesTextEl = document.getElementById("movesText");
const timerTextEl = document.getElementById("timerText");
const benchmarkTextEl = document.getElementById("benchmarkText");
const boardStatusShareBtn = document.getElementById("boardStatusShareBtn");
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
const sinkToneSliderEl = document.getElementById("sinkToneSlider");
const sinkToneValueEl = document.getElementById("sinkToneValue");
const lessonBandSelectEl = document.getElementById("lessonBandSelect");
const lessonSelectEl = document.getElementById("lessonSelect");
const lessonPromptBtn = document.getElementById("lessonPromptBtn");
const lessonFocusTextEl = document.getElementById("lessonFocusText");
const lessonTaskTextEl = document.getElementById("lessonTaskText");
const lessonChallengeTextEl = document.getElementById("lessonChallengeText");
const lessonTeacherPromptTextEl = document.getElementById("lessonTeacherPromptText");
const lessonReflectionTextEl = document.getElementById("lessonReflectionText");
const lessonQuickCheckTextEl = document.getElementById("lessonQuickCheckText");
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
const crossingFlowToggleBtn = document.getElementById("crossingFlowToggleBtn");
const shareBoardBtn = document.getElementById("shareBoardBtn");
const shareBoardStatusEl = document.getElementById("shareBoardStatus");
const shareUrlInputEl = document.getElementById("shareUrlInput");
const shareQrImageEl = document.getElementById("shareQrImage");
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
let lessonQuickCheckCursor = 0;
let gameTimerIntervalId = null;

const LESSON_LIBRARY = {
  k2: {
    lessons: [
      {
        id: "number-streams",
        title: "Number Streams",
        focus: "Compose and decompose values up to 10 using part-whole relationships.",
        task: "Route two or three small streams to build one target exactly.",
        teacherPrompt: "What parts made this total?",
        reflection: "I made ___ using ___ and ___.",
      },
      {
        id: "make-ten",
        title: "Make Ten Watersheds",
        focus: "Use benchmark ten pairs to build target values.",
        task: "Find one tile where two streams can combine to make 10.",
        teacherPrompt: "What does this number need to become 10?",
        reflection: "I made 10 by combining ___ and ___",
      },
      {
        id: "same-total",
        title: "Same Total, Different Path",
        focus: "Recognize that totals can be made in more than one way.",
        task: "Solve one target, then find a different route that still works.",
        teacherPrompt: "Can this same target be made another way?",
        reflection: "Another way to make this total is ___.",
      },
    ],
    quickChecks: [
      "Choose one target tile. What parts made its total?",
      "Write an equation for one accumulated value.",
      "What happened when you rotated one tile?",
      "Predict what will change before making a move.",
    ],
  },
  "3to5": {
    lessons: [
      {
        id: "trace-values",
        title: "Where Did the Number Come From?",
        focus: "Trace upstream contributions and explain accumulated values.",
        task: "Pick one target tile and trace all streams feeding it.",
        teacherPrompt: "Where did this number come from?",
        reflection: "The target was ___. It was made from ___.",
      },
      {
        id: "fix-flow",
        title: "Fix the Flow",
        focus: "Use missing addends and comparison reasoning.",
        task: "Find a target that is too high or too low and fix its route.",
        teacherPrompt: "Which target is off, and by how much?",
        reflection: "A move I changed was ___. It affected ___ because ___.",
      },
      {
        id: "one-move-many",
        title: "One Move, Many Changes",
        focus: "Predict cause-and-effect downstream from a single rotation.",
        task: "Before each move, predict two tiles that will change.",
        teacherPrompt: "What will change downstream if you rotate this tile?",
        reflection: "I predicted ___. What happened was ___.",
      },
    ],
    quickChecks: [
      "Which move helped the most? Why?",
      "Which target was too high or too low? What needed to change?",
      "Find two different ways to make the same total.",
      "Circle the upstream tiles that contribute to a selected target.",
    ],
  },
  "6plus": {
    lessons: [
      {
        id: "flow-networks",
        title: "Flow Networks",
        focus: "Model the puzzle as a directed network with accumulation.",
        task: "Describe one tile as a node and one arrow as a directed edge.",
        teacherPrompt: "Which tiles are sources, and which are downstream?",
        reflection: "Cascade is like a network because ___.",
      },
      {
        id: "loops-cycles",
        title: "Loops and Invalid Systems",
        focus: "Explain why loops break clean accumulation.",
        task: "Locate one loop and explain why it blocks a stable solution.",
        teacherPrompt: "Why is this cycle a problem?",
        reflection: "This loop fails because ___.",
      },
      {
        id: "sources-sinks-negative",
        title: "Sources, Sinks, and Negative Flow",
        focus: "Interpret positive and negative values in a flow system.",
        task: "Use a level with negative runoff and explain one sink behavior.",
        teacherPrompt: "How does a negative base value change the basin total?",
        reflection: "A negative source changed the total by ___.",
      },
    ],
    quickChecks: [
      "Explain why a loop is a problem.",
      "Describe Cascade as a flow network using source, downstream, and accumulation.",
      "Predict system-wide effects from one rotation.",
      "Compare two strategies and justify which is more efficient.",
    ],
  },
};

function setSettingsDrawerOpen(drawerName, isOpen) {
  const displayOpen = drawerName === "display" ? isOpen : false;
  const difficultyOpen = drawerName === "difficulty" ? isOpen : false;
  const shareOpen = drawerName === "share" ? isOpen : false;
  const lessonOpen = drawerName === "lesson" ? isOpen : false;

  if (!shareOpen) {
    state.shareIncludeCompletedStats = false;
  }

  document.body.classList.toggle("display-settings-open", displayOpen);
  document.body.classList.toggle("difficulty-settings-open", difficultyOpen);
  document.body.classList.toggle("share-settings-open", shareOpen);
  document.body.classList.toggle("lesson-settings-open", lessonOpen);

  if (displaySettingsModalEl) {
    displaySettingsModalEl.setAttribute("aria-hidden", displayOpen ? "false" : "true");
  }
  if (difficultySettingsModalEl) {
    difficultySettingsModalEl.setAttribute("aria-hidden", difficultyOpen ? "false" : "true");
  }
  if (shareSettingsModalEl) {
    shareSettingsModalEl.setAttribute("aria-hidden", shareOpen ? "false" : "true");
  }
  if (lessonSettingsModalEl) {
    lessonSettingsModalEl.setAttribute("aria-hidden", lessonOpen ? "false" : "true");
  }
  if (settingsBackdropEl) {
    settingsBackdropEl.setAttribute("aria-hidden", displayOpen || difficultyOpen || shareOpen || lessonOpen ? "false" : "true");
  }
  if (displaySettingsToggleBtn) {
    displaySettingsToggleBtn.setAttribute("aria-expanded", displayOpen ? "true" : "false");
  }
  if (difficultySettingsToggleBtn) {
    difficultySettingsToggleBtn.setAttribute("aria-expanded", difficultyOpen ? "true" : "false");
  }
  if (shareSettingsToggleBtn) {
    shareSettingsToggleBtn.setAttribute("aria-expanded", shareOpen ? "true" : "false");
  }
  if (lessonSettingsToggleBtn) {
    lessonSettingsToggleBtn.setAttribute("aria-expanded", lessonOpen ? "true" : "false");
  }

  if (shareOpen) {
    const shareUrl = buildShareUrlFromCurrentBoard();
    if (shareUrlInputEl) {
      shareUrlInputEl.value = shareUrl.toString();
    }
    if (shareQrImageEl) {
      const qrUrl = `https://quickchart.io/qr?size=280&text=${encodeURIComponent(shareUrl.toString())}`;
      shareQrImageEl.src = qrUrl;
    }
  }
}

function encodeBase64Url(input) {
  return btoa(input)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  return atob(`${normalized}${"=".repeat(padLength)}`);
}

function getCompletedStatsPayload() {
  return {
    m: state.moves,
    t: Math.max(0, Math.floor(state.timerElapsedMs)),
  };
}

function encodeCompletedStatsPayload(payload) {
  return encodeBase64Url(JSON.stringify(payload));
}

function decodeCompletedStatsPayload(encoded) {
  const rawJson = decodeBase64Url(encoded);
  const parsed = JSON.parse(rawJson);
  const moves = Number(parsed?.m);
  const elapsedMs = Number(parsed?.t);
  if (
    !Number.isInteger(moves)
    || moves < 0
    || !Number.isFinite(elapsedMs)
    || elapsedMs < 0
  ) {
    throw new Error("Invalid completed stats payload");
  }
  return {
    m: moves,
    t: Math.floor(elapsedMs),
  };
}

function formatSignedMoveDelta(delta) {
  if (delta === 0) {
    return "same moves";
  }
  const sign = delta > 0 ? "+" : "-";
  return `${sign}${Math.abs(delta)} moves`;
}

function formatSignedTimeDelta(deltaMs) {
  if (deltaMs === 0) {
    return "same time";
  }
  const sign = deltaMs > 0 ? "+" : "-";
  return `${sign}${formatTimer(Math.abs(deltaMs))}`;
}

function formatBenchmarkComparison() {
  if (!state.loadedBenchmarkStats) {
    return "";
  }

  const moveDelta = state.moves - state.loadedBenchmarkStats.m;
  const timeDelta = state.timerElapsedMs - state.loadedBenchmarkStats.t;
  return ` Benchmark ${state.loadedBenchmarkStats.m} moves, ${formatTimer(state.loadedBenchmarkStats.t)}. Delta ${formatSignedMoveDelta(moveDelta)}, ${formatSignedTimeDelta(timeDelta)}.`;
}

function renderBenchmarkComparison() {
  if (!benchmarkTextEl) {
    return;
  }
  const hasBenchmarks = !!state.loadedBenchmarkStats
    && (state.loadedBenchmarkStats.m > 0 || state.loadedBenchmarkStats.t > 0);
  if (!hasBenchmarks) {
    benchmarkTextEl.hidden = true;
    benchmarkTextEl.textContent = "";
    return;
  }
  const moveDelta = state.moves - state.loadedBenchmarkStats.m;
  const timeDelta = state.timerElapsedMs - state.loadedBenchmarkStats.t;
  benchmarkTextEl.hidden = false;
  benchmarkTextEl.textContent = `Benchmark: ${state.loadedBenchmarkStats.m} moves, ${formatTimer(state.loadedBenchmarkStats.t)}. Current: ${state.moves} moves, ${formatTimer(state.timerElapsedMs)}. Delta: ${formatSignedMoveDelta(moveDelta)}, ${formatSignedTimeDelta(timeDelta)}.`;
}

function getDirectionCountForShape(shape) {
  return shape === "hex" ? 6 : 8;
}

function getBoardSharePayload() {
  const snapshotTiles = Array.isArray(state.initialBoardSnapshot)
    ? state.initialBoardSnapshot
    : state.board.map((cell) => [cell.baseFlow, cell.targetAccum, cell.currentDir]);
  return {
    v: 1,
    c: state.cols,
    r: state.rows,
    s: state.tileShape,
    t: snapshotTiles,
  };
}

function encodeBoardPayload(payload) {
  return encodeBase64Url(JSON.stringify(payload));
}

function decodeBoardPayload(encoded) {
  const rawJson = decodeBase64Url(encoded);
  return JSON.parse(rawJson);
}

function loadBoardFromPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Missing payload");
  }

  const cols = Number(payload.c);
  const rows = Number(payload.r);
  const shape = payload.s === "hex" ? "hex" : "square";
  const directionCount = getDirectionCountForShape(shape);
  if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 2 || rows < 2) {
    throw new Error("Invalid board dimensions");
  }

  if (!Array.isArray(payload.t) || payload.t.length !== cols * rows) {
    throw new Error("Invalid tile list");
  }

  const board = payload.t.map((tileData, index) => {
    if (!Array.isArray(tileData) || tileData.length < 3) {
      throw new Error(`Invalid tile at index ${index}`);
    }

    const baseFlow = Number(tileData[0]);
    const targetAccum = Number(tileData[1]);
    const rawDir = tileData[2];
    const currentDir = rawDir === null ? null : Number(rawDir);

    if (!Number.isFinite(baseFlow) || !Number.isFinite(targetAccum)) {
      throw new Error(`Invalid tile values at index ${index}`);
    }
    if (
      currentDir !== null
      && (!Number.isInteger(currentDir) || currentDir < 0 || currentDir >= directionCount)
    ) {
      throw new Error(`Invalid tile direction at index ${index}`);
    }

    return {
      index,
      baseFlow,
      targetAccum,
      currentDir,
      solutionDir: currentDir === null ? null : currentDir,
      currentAccum: 0,
    };
  });

  state.cols = cols;
  state.rows = rows;
  state.tileShape = shape;
  state.board = board;
  state.initialBoardSnapshot = board.map((cell) => [cell.baseFlow, cell.targetAccum, cell.currentDir]);
  state.solved = false;
  state.moves = 0;
  state.lastCountedTileIndex = null;
  movesTextEl.textContent = "Moves: 0";
  resetGameTimer();

  const current = accumulate(board, false);
  for (let i = 0; i < board.length; i += 1) {
    board[i].currentAccum = current[i];
  }

  if (sizeSelect) {
    const rectValue = `${cols}x${rows}`;
    const squareValue = String(cols);
    const hasRectOption = Array.from(sizeSelect.options).some((opt) => opt.value === rectValue);
    const hasSquareOption = cols === rows && Array.from(sizeSelect.options).some((opt) => opt.value === squareValue);
    if (hasRectOption) {
      sizeSelect.value = rectValue;
    } else if (hasSquareOption) {
      sizeSelect.value = squareValue;
    }
  }

  applyTileShape();
  renderBoard();
  updateStatus();
}

function tryLoadBoardFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("board");
  if (!encoded) {
    return false;
  }

  try {
    const payload = decodeBoardPayload(encoded);
    loadBoardFromPayload(payload);
    const encodedResult = params.get("result");
    if (encodedResult) {
      try {
        state.loadedBenchmarkStats = decodeCompletedStatsPayload(encodedResult);
      } catch (resultError) {
        console.warn("Invalid result parameter", resultError);
        state.loadedBenchmarkStats = null;
      }
    } else {
      state.loadedBenchmarkStats = null;
    }
    renderBenchmarkComparison();
    if (shareBoardStatusEl) {
      shareBoardStatusEl.textContent = state.loadedBenchmarkStats
        ? "Loaded board and benchmark from URL."
        : "Loaded board from URL.";
    }
    return true;
  } catch (error) {
    console.warn("Failed to load board from URL parameter", error);
    if (shareBoardStatusEl) {
      shareBoardStatusEl.textContent = "Invalid board URL. Generated a new puzzle instead.";
    }
    return false;
  }
}

function buildShareUrlFromCurrentBoard() {
  const payload = getBoardSharePayload();
  const encoded = encodeBoardPayload(payload);
  const shareUrl = new URL(window.location.href);
  shareUrl.searchParams.set("board", encoded);
  if (state.shareIncludeCompletedStats && state.solved) {
    const resultEncoded = encodeCompletedStatsPayload(getCompletedStatsPayload());
    shareUrl.searchParams.set("result", resultEncoded);
  } else {
    shareUrl.searchParams.delete("result");
  }
  return shareUrl;
}

async function copyBoardShareUrl() {
  if (!state.board.length) {
    return;
  }

  const shareUrl = buildShareUrlFromCurrentBoard();
  window.history.replaceState({}, "", shareUrl.toString());
  if (shareUrlInputEl) {
    shareUrlInputEl.value = shareUrl.toString();
  }
  if (shareQrImageEl) {
    const qrUrl = `https://quickchart.io/qr?size=280&text=${encodeURIComponent(shareUrl.toString())}`;
    shareQrImageEl.src = qrUrl;
  }

  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      throw new Error("Clipboard API unavailable");
    }
    await navigator.clipboard.writeText(shareUrl.toString());
    if (shareBoardStatusEl) {
      shareBoardStatusEl.textContent = "Share URL copied to clipboard.";
    }
  } catch (error) {
    if (shareBoardStatusEl) {
      shareBoardStatusEl.textContent = "Share URL added to address bar. Copy it from there.";
    }
  }
}

function formatTimer(elapsedMs) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderTimer() {
  if (!timerTextEl) {
    return;
  }
  timerTextEl.textContent = `Time: ${formatTimer(state.timerElapsedMs)}`;
  renderBenchmarkComparison();
}

function stopGameTimer() {
  if (state.timerActive && state.timerStartAtMs !== null) {
    state.timerElapsedMs = Date.now() - state.timerStartAtMs;
  }
  state.timerActive = false;
  state.timerStartAtMs = null;
  if (gameTimerIntervalId !== null) {
    window.clearInterval(gameTimerIntervalId);
    gameTimerIntervalId = null;
  }
  renderTimer();
}

function startGameTimer() {
  if (state.timerActive || state.solved) {
    return;
  }
  state.timerActive = true;
  state.timerStartAtMs = Date.now() - state.timerElapsedMs;
  if (gameTimerIntervalId !== null) {
    window.clearInterval(gameTimerIntervalId);
  }
  gameTimerIntervalId = window.setInterval(() => {
    if (!state.timerActive || state.timerStartAtMs === null) {
      return;
    }
    state.timerElapsedMs = Date.now() - state.timerStartAtMs;
    renderTimer();
  }, 250);
  renderTimer();
}

function resetGameTimer() {
  if (gameTimerIntervalId !== null) {
    window.clearInterval(gameTimerIntervalId);
    gameTimerIntervalId = null;
  }
  state.timerActive = false;
  state.timerStartAtMs = null;
  state.timerElapsedMs = 0;
  renderTimer();
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

function applyCrossingFlowMode() {
  if (!crossingFlowToggleBtn) {
    return;
  }
  crossingFlowToggleBtn.textContent = state.disallowCrossingFlows
    ? "No Crossing Flows: On"
    : "No Crossing Flows: Off";
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

function applySinkTone() {
  boardEl.style.setProperty("--sink-tone", `${state.sinkTone}%`);
  if (sinkToneValueEl) {
    sinkToneValueEl.textContent = `${state.sinkTone}%`;
  }
  if (sinkToneSliderEl) {
    sinkToneSliderEl.value = String(state.sinkTone);
  }
}

function getLessonBucket() {
  return LESSON_LIBRARY[state.lessonBand] ?? LESSON_LIBRARY["3to5"];
}

function getSelectedLesson() {
  const bucket = getLessonBucket();
  const match = bucket.lessons.find((lesson) => lesson.id === state.lessonId);
  return match ?? bucket.lessons[0];
}

function buildBoardChallengeText() {
  if (state.board.length === 0) {
    return "Start a puzzle to generate a board-specific challenge.";
  }
  const unsolved = state.board.find((cell) => cell.currentAccum !== cell.targetAccum);
  if (!unsolved) {
    return "All targets are matched. Start a new puzzle and compare how quickly you can justify each move.";
  }
  const delta = unsolved.targetAccum - unsolved.currentAccum;
  const needed = delta > 0
    ? `${delta} more`
    : `${Math.abs(delta)} less`;
  return `Tile ${unsolved.index} has current ${unsolved.currentAccum} and target ${unsolved.targetAccum}; route flow so it receives ${needed}.`;
}

function populateLessonSelect() {
  if (!lessonSelectEl) {
    return;
  }
  const bucket = getLessonBucket();
  lessonSelectEl.replaceChildren();
  for (const lesson of bucket.lessons) {
    const option = document.createElement("option");
    option.value = lesson.id;
    option.textContent = lesson.title;
    lessonSelectEl.appendChild(option);
  }
  if (!bucket.lessons.some((lesson) => lesson.id === state.lessonId)) {
    state.lessonId = bucket.lessons[0].id;
  }
  lessonSelectEl.value = state.lessonId;
}

function rotateQuickCheck() {
  const bucket = getLessonBucket();
  const checks = bucket.quickChecks;
  if (!lessonQuickCheckTextEl || checks.length === 0) {
    return;
  }
  const index = lessonQuickCheckCursor % checks.length;
  lessonQuickCheckTextEl.textContent = checks[index];
  lessonQuickCheckCursor += 1;
}

function renderLessonStudio() {
  if (!lessonBandSelectEl || !lessonFocusTextEl) {
    return;
  }
  lessonBandSelectEl.value = state.lessonBand;
  const lesson = getSelectedLesson();
  if (lessonTaskTextEl) {
    lessonTaskTextEl.textContent = lesson.task;
  }
  lessonFocusTextEl.textContent = lesson.focus;
  if (lessonTeacherPromptTextEl) {
    lessonTeacherPromptTextEl.textContent = lesson.teacherPrompt;
  }
  if (lessonReflectionTextEl) {
    lessonReflectionTextEl.textContent = lesson.reflection;
  }
  if (lessonChallengeTextEl) {
    lessonChallengeTextEl.textContent = buildBoardChallengeText();
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

if (crossingFlowToggleBtn) {
  crossingFlowToggleBtn.addEventListener("click", () => {
    state.disallowCrossingFlows = !state.disallowCrossingFlows;
    applyCrossingFlowMode();
    startNewPuzzle(state.cols, state.rows);
  });
}

if (shareBoardBtn) {
  shareBoardBtn.addEventListener("click", () => {
    copyBoardShareUrl();
  });
}

if (boardStatusShareBtn) {
  boardStatusShareBtn.addEventListener("click", () => {
    state.shareIncludeCompletedStats = true;
    setSettingsDrawerOpen("share", true);
    if (shareBoardStatusEl) {
      shareBoardStatusEl.textContent = "Sharing board with your completed run stats.";
    }
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

if (sinkToneSliderEl) {
  sinkToneSliderEl.addEventListener("input", () => {
    state.sinkTone = Number(sinkToneSliderEl.value);
    applySinkTone();
    renderBoard();
  });
}

if (lessonBandSelectEl) {
  lessonBandSelectEl.addEventListener("change", () => {
    state.lessonBand = lessonBandSelectEl.value;
    const firstLesson = getLessonBucket().lessons[0];
    state.lessonId = firstLesson.id;
    lessonQuickCheckCursor = 0;
    populateLessonSelect();
    rotateQuickCheck();
    renderLessonStudio();
  });
}

if (lessonSelectEl) {
  lessonSelectEl.addEventListener("change", () => {
    state.lessonId = lessonSelectEl.value;
    renderLessonStudio();
  });
}

if (lessonPromptBtn) {
  lessonPromptBtn.addEventListener("click", () => {
    rotateQuickCheck();
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

if (shareSettingsToggleBtn) {
  shareSettingsToggleBtn.addEventListener("click", () => {
    state.shareIncludeCompletedStats = false;
    const shouldOpen = !document.body.classList.contains("share-settings-open");
    setSettingsDrawerOpen("share", shouldOpen);
  });
}

if (lessonSettingsToggleBtn) {
  lessonSettingsToggleBtn.addEventListener("click", () => {
    const shouldOpen = !document.body.classList.contains("lesson-settings-open");
    setSettingsDrawerOpen("lesson", shouldOpen);
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

if (shareSettingsCloseBtn) {
  shareSettingsCloseBtn.addEventListener("click", () => {
    setSettingsDrawerOpen("share", false);
  });
}

if (lessonSettingsCloseBtn) {
  lessonSettingsCloseBtn.addEventListener("click", () => {
    setSettingsDrawerOpen("lesson", false);
  });
}

if (settingsBackdropEl) {
  settingsBackdropEl.addEventListener("click", () => {
    setSettingsDrawerOpen("display", false);
    setSettingsDrawerOpen("difficulty", false);
    setSettingsDrawerOpen("share", false);
    setSettingsDrawerOpen("lesson", false);
  });
}

window.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape"
    && (
      document.body.classList.contains("display-settings-open")
      || document.body.classList.contains("difficulty-settings-open")
      || document.body.classList.contains("share-settings-open")
      || document.body.classList.contains("lesson-settings-open")
    )
  ) {
    setSettingsDrawerOpen("display", false);
    setSettingsDrawerOpen("difficulty", false);
    setSettingsDrawerOpen("share", false);
    setSettingsDrawerOpen("lesson", false);
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

function getCrossingTileIndices(board, useSolutionDirections = false) {
  const crossings = new Set();
  if (state.tileShape !== "square") {
    return crossings;
  }

  function hasDiagonalFlow(fromIndex, toIndex) {
    const dir = useSolutionDirections ? board[fromIndex].solutionDir : board[fromIndex].currentDir;
    if (dir === null) {
      return false;
    }
    return followDirection(state.cols, state.rows, fromIndex, dir) === toIndex;
  }

  for (let y = 0; y < state.rows - 1; y += 1) {
    for (let x = 0; x < state.cols - 1; x += 1) {
      const tl = indexFromXY(state.cols, x, y);
      const tr = indexFromXY(state.cols, x + 1, y);
      const bl = indexFromXY(state.cols, x, y + 1);
      const br = indexFromXY(state.cols, x + 1, y + 1);

      const diagA = hasDiagonalFlow(tl, br) || hasDiagonalFlow(br, tl);
      const diagB = hasDiagonalFlow(tr, bl) || hasDiagonalFlow(bl, tr);

      if (diagA && diagB) {
        crossings.add(tl);
        crossings.add(tr);
        crossings.add(bl);
        crossings.add(br);
      }
    }
  }

  return crossings;
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
  state.initialBoardSnapshot = null;
  state.shareIncludeCompletedStats = false;
  state.loadedBenchmarkStats = null;
  state.moves = 0;
  state.lastCountedTileIndex = null;
  movesTextEl.textContent = "Moves: 0";
  if (boardStatusShareBtn) {
    boardStatusShareBtn.hidden = true;
  }
  resetGameTimer();

  const board = [];
  const maxBaseTileAccumulation = Math.max(1, Math.round(state.baseTileAccumulation));
  const positiveBaseValues = Array.from({ length: maxBaseTileAccumulation }, (_, index) => index + 1);
  const signedBaseValues = [];
  for (let value = -maxBaseTileAccumulation; value <= maxBaseTileAccumulation; value += 1) {
    if (value !== 0) {
      signedBaseValues.push(value);
    }
  }

  const maxAttempts = state.disallowCrossingFlows ? 48 : 1;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    board.length = 0;
    const elev = makeElevation(cols, rows);
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

    if (!state.disallowCrossingFlows || getCrossingTileIndices(board, true).size === 0) {
      break;
    }
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
  state.initialBoardSnapshot = board.map((cell) => [cell.baseFlow, cell.targetAccum, cell.currentDir]);
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

  if (state.disallowCrossingFlows && getCrossingTileIndices(state.board).size > 0) {
    return false;
  }

  return true;
}

function updateStatus() {
  const wasSolved = state.solved;
  const solvedNow = isSolved();
  state.solved = solvedNow;

  if (solvedNow && !wasSolved) {
    stopGameTimer();
    triggerSolvedCelebration();
  }

  if (solvedNow) {
    statusTextEl.textContent = `Solved in ${state.moves} moves. New Puzzle for another watershed.${formatBenchmarkComparison()}`;
    if (boardStatusShareBtn) {
      boardStatusShareBtn.hidden = false;
    }
  } else {
    const remaining = state.board.filter((c) => c.currentAccum !== c.targetAccum).length;
    const crossingCount = state.disallowCrossingFlows ? getCrossingTileIndices(state.board).size : 0;
    if (remaining === 0 && crossingCount > 0) {
      statusTextEl.textContent = `Crossing flows detected on ${crossingCount} tiles. Remove crossings to finish.`;
    } else if (crossingCount > 0) {
      statusTextEl.textContent = `${remaining} tiles mismatched and crossing flows detected.`;
    } else {
      statusTextEl.textContent = `${remaining} tiles still mismatched.`;
    }
    if (boardStatusShareBtn) {
      boardStatusShareBtn.hidden = true;
    }
  }

  renderBenchmarkComparison();
  renderLessonStudio();
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

  const highlightedInvalidTiles = getLoopTileIndices(state.board);
  if (state.disallowCrossingFlows) {
    const crossingTiles = getCrossingTileIndices(state.board);
    for (const index of crossingTiles) {
      highlightedInvalidTiles.add(index);
    }
  }

  const frag = document.createDocumentFragment();
  for (const cell of state.board) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.classList.add(cell.currentAccum === cell.targetAccum ? "solved" : "unsolved");
    if (cell.currentDir === null) {
      tile.classList.add("sink");
    }
    if (highlightedInvalidTiles.has(cell.index)) {
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
      startGameTimer();
      const clickRotationDirection = getRotationDirectionFromClick(tile, event);
      rotateCell(cell.index, tile, clickRotationDirection);
    });
    frag.appendChild(tile);
  }

  boardEl.replaceChildren(frag);
  buildLinkOverlay();
  refreshHoverCursorFromPointer();
}

const loadedBoardFromUrl = tryLoadBoardFromUrl();
if (!loadedBoardFromUrl) {
  startNewPuzzle(state.cols, state.rows);
}
applyTileShape();
applyArrowPosition();
applyArrowScale();
applyCurrentValueScale();
applySinkTone();
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
applyCrossingFlowMode();
applyBaseTileAccumulationMode();
applyRotatableHintsMode();
applyValueBadgeMode();
applyViewMode();
populateLessonSelect();
rotateQuickCheck();
renderLessonStudio();
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
