const state = {
  cols: 4,
  rows: 4,
  tileShape: "square",
  viewMode: "arrows",
  hideBaseAndMatchedCurrent: true,
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
  customPaletteAccent: "#2f7d6b",
  customPaletteWarn: "#d96f45",
  customPaletteBg: "#d6e6f2",
  customPaletteTile: "#ffffff",
  customPaletteTileBorder: "#c6d6df",
  customPaletteSolved: "#dbf1e4",
  customPaletteUnsolved: "#fde9de",
  helpOpen: false,
  allowNegativeBaseRunoff: false,
  disallowCrossingFlows: false,
  baseTileAccumulation: 1,
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
  tutorialActive: false,
  tutorialStep: 0,
  tutorialExpectedTileIndex: null,
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
const tutorialStartBtn = document.getElementById("tutorialStartBtn");
const tutorialNextBtn = document.getElementById("tutorialNextBtn");
const tutorialExitBtn = document.getElementById("tutorialExitBtn");
const tutorialStepLabelEl = document.getElementById("tutorialStepLabel");
const tutorialStepTextEl = document.getElementById("tutorialStepText");
const rotationDirectionToggleBtn = document.getElementById("rotationDirectionToggleBtn");
const rotationDirectionSelectEl = document.getElementById("rotationDirectionSelect");
const numberModeSelectEl = document.getElementById("numberModeSelect");
const viewSelectEl = document.getElementById("viewSelect");
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
const customPaletteControlsEl = document.getElementById("customPaletteControls");
const customAccentInputEl = document.getElementById("customAccentInput");
const customWarnInputEl = document.getElementById("customWarnInput");
const customBgInputEl = document.getElementById("customBgInput");
const customTileInputEl = document.getElementById("customTileInput");
const customTileBorderInputEl = document.getElementById("customTileBorderInput");
const customSolvedInputEl = document.getElementById("customSolvedInput");
const customUnsolvedInputEl = document.getElementById("customUnsolvedInput");
const animationSpeedSliderEl = document.getElementById("animationSpeedSlider");
const animationSpeedValueEl = document.getElementById("animationSpeedValue");
const bounceStrengthSliderEl = document.getElementById("bounceStrengthSlider");
const bounceStrengthValueEl = document.getElementById("bounceStrengthValue");
const tileDelaySliderEl = document.getElementById("tileDelaySlider");
const tileDelayValueEl = document.getElementById("tileDelayValue");
const clearSettingsBtn = document.getElementById("clearSettingsBtn");
const tileShapeSelectEl = document.getElementById("tileShapeSelect");
const flowSoundSelectEl = document.getElementById("flowSoundSelect");
const negativeBaseSelectEl = document.getElementById("negativeBaseSelect");
const crossingFlowSelectEl = document.getElementById("crossingFlowSelect");
const shareBoardBtn = document.getElementById("shareBoardBtn");
const shareBoardStatusEl = document.getElementById("shareBoardStatus");
const shareUrlInputEl = document.getElementById("shareUrlInput");
const shareQrImageEl = document.getElementById("shareQrImage");
const sizeSelect = document.getElementById("sizeSelect");
const baseTileAccumulationSliderEl = document.getElementById("baseTileAccumulationSlider");
const baseTileAccumulationValueEl = document.getElementById("baseTileAccumulationValue");
const SQUARE_DIR_DEGREES = [0, -45, -90, -135, 180, 135, 90, 45];
const HEX_DIR_DEGREES = [0, -60, -120, 180, 120, 60];
let flowAudioContext = null;
let blockedSoundLastAtMs = 0;
let lessonQuickCheckCursor = 0;
let gameTimerIntervalId = null;
const UI_SETTINGS_STORAGE_KEY = "taudem.ui-settings.v1";

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

const TUTORIAL_BOARD_PAYLOAD = {
  c: 2,
  r: 2,
  s: "square",
  t: [
    [1, 1, 0],
    [1, 3, null],
    [1, 1, 0],
    [1, 1, null],
  ],
};

const TUTORIAL_STEPS = [
  {
    label: "Step 1 of 4",
    text: "This mini 2x2 board shows the core mechanic. Each tile has a current center value (base value + incoming flow from neighboring tiles), and a target in the corner.",
    status: "Tutorial: Every tile combines its base runoff with incoming upstream flow.",
    focus: [0, 1, 2, 3],
    target: [1],
  },
  {
    label: "Step 2 of 4",
    text: "Observe the top right tile. Its target is 3, so it needs its own base plus two incoming streams.",
    status: "Tutorial: The top right tile should collect 3 by receiving flow from the 2 left tiles.",
    focus: [0, 1, 2, 3],
    target: [1],
  },
  {
    label: "Step 3 of 4",
    text: "Now rotate the bottom left tile until its arrow feeds the top right tile. Notice how the value decreases in the bottom right tile and increases in the top right tile.",
    status: "Tutorial: Rotate the bottom left tile until the top right tile reaches target 3 and the bottom right tile reaches target 1.",
    focus: [1, 2, 3],
    target: [1],
    waitForRotate: true,
    expectedRotateIndex: 2,
  },
  {
    label: "Step 4 of 4",
    text: "Great. That reroute solved the board. You just used one rotation to fix multiple totals.",
    status: "Tutorial complete: one arrow change rerouted flow and solved the board.",
    focus: [1, 2, 3],
    target: [1],
    final: true,
    allowFreePlay: true,
  },
];

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

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, value));
}

function persistDisplayAndDifficultySettings() {
  const payload = {
    display: {
      hideBaseAndMatchedCurrent: state.hideBaseAndMatchedCurrent,
      arrowPosition: state.arrowPosition,
      arrowScale: state.arrowScale,
      currentValueScale: state.currentValueScale,
      sinkTone: state.sinkTone,
      viewMode: state.viewMode,
      rotationDirection: state.rotationDirection,
      useRotationIcons: state.useRotationIcons,
      useFlowSound: state.useFlowSound,
      colorPalette: state.colorPalette,
      customPaletteAccent: state.customPaletteAccent,
      customPaletteWarn: state.customPaletteWarn,
      customPaletteBg: state.customPaletteBg,
      customPaletteTile: state.customPaletteTile,
      customPaletteTileBorder: state.customPaletteTileBorder,
      customPaletteSolved: state.customPaletteSolved,
      customPaletteUnsolved: state.customPaletteUnsolved,
      animationSpeed: state.animationSpeed,
      bounceStrength: state.bounceStrength,
      tileDelay: state.tileDelay,
      tileShape: state.tileShape,
    },
    difficulty: {
      allowNegativeBaseRunoff: state.allowNegativeBaseRunoff,
      disallowCrossingFlows: state.disallowCrossingFlows,
      baseTileAccumulation: state.baseTileAccumulation,
      gridCols: state.cols,
      gridRows: state.rows,
    },
  };

  try {
    window.localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to save UI settings", error);
  }
}

function loadPersistedDisplayAndDifficultySettings() {
  let parsed;
  try {
    const raw = window.localStorage.getItem(UI_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return;
    }
    parsed = JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to read UI settings", error);
    return;
  }

  const display = parsed?.display;
  const difficulty = parsed?.difficulty;
  if (!display && !difficulty) {
    return;
  }

  if (display && typeof display === "object") {
    if (typeof display.hideBaseAndMatchedCurrent === "boolean") {
      state.hideBaseAndMatchedCurrent = display.hideBaseAndMatchedCurrent;
    }
    state.arrowPosition = clampNumber(Number(display.arrowPosition), 0, 100, state.arrowPosition);
    state.arrowScale = clampNumber(Number(display.arrowScale), 0.5, 4, state.arrowScale);
    state.currentValueScale = clampNumber(Number(display.currentValueScale), 0.5, 3, state.currentValueScale);
    state.sinkTone = clampNumber(Number(display.sinkTone), 0, 100, state.sinkTone);
    state.animationSpeed = clampNumber(Number(display.animationSpeed), 80, 1200, state.animationSpeed);
    state.bounceStrength = clampNumber(Number(display.bounceStrength), 0, 100, state.bounceStrength);
    state.tileDelay = clampNumber(Number(display.tileDelay), 0, 800, state.tileDelay);

    if (display.viewMode === "arrows" || display.viewMode === "lines") {
      state.viewMode = display.viewMode;
    }
    if (display.rotationDirection === "cw" || display.rotationDirection === "ccw") {
      state.rotationDirection = display.rotationDirection;
    }
    if (typeof display.useRotationIcons === "boolean") {
      state.useRotationIcons = display.useRotationIcons;
    }
    if (typeof display.useFlowSound === "boolean") {
      state.useFlowSound = display.useFlowSound;
    }
    if (display.tileShape === "square" || display.tileShape === "hex") {
      state.tileShape = display.tileShape;
    }
    if (typeof display.colorPalette === "string") {
      const paletteValues = paletteSelectEl
        ? new Set(Array.from(paletteSelectEl.options).map((option) => option.value))
        : null;
      if (!paletteValues || paletteValues.has(display.colorPalette)) {
        state.colorPalette = display.colorPalette;
      }
    }
    if (typeof display.customPaletteAccent === "string") {
      state.customPaletteAccent = display.customPaletteAccent;
    }
    if (typeof display.customPaletteWarn === "string") {
      state.customPaletteWarn = display.customPaletteWarn;
    }
    if (typeof display.customPaletteBg === "string") {
      state.customPaletteBg = display.customPaletteBg;
    }
    if (typeof display.customPaletteTile === "string") {
      state.customPaletteTile = display.customPaletteTile;
    }
    if (typeof display.customPaletteTileBorder === "string") {
      state.customPaletteTileBorder = display.customPaletteTileBorder;
    }
    if (typeof display.customPaletteSolved === "string") {
      state.customPaletteSolved = display.customPaletteSolved;
    }
    if (typeof display.customPaletteUnsolved === "string") {
      state.customPaletteUnsolved = display.customPaletteUnsolved;
    }
  }

  if (difficulty && typeof difficulty === "object") {
    if (typeof difficulty.allowNegativeBaseRunoff === "boolean") {
      state.allowNegativeBaseRunoff = difficulty.allowNegativeBaseRunoff;
    }
    if (typeof difficulty.disallowCrossingFlows === "boolean") {
      state.disallowCrossingFlows = difficulty.disallowCrossingFlows;
    }
    state.baseTileAccumulation = Math.round(
      clampNumber(Number(difficulty.baseTileAccumulation), 1, 12, state.baseTileAccumulation)
    );
    const savedCols = Number(difficulty.gridCols);
    const savedRows = Number(difficulty.gridRows);
    if (
      Number.isInteger(savedCols)
      && Number.isInteger(savedRows)
      && savedCols >= 2
      && savedRows >= 2
      && savedCols <= 24
      && savedRows <= 24
    ) {
      state.cols = savedCols;
      state.rows = savedRows;
      if (sizeSelect) {
        const rectValue = `${savedCols}x${savedRows}`;
        const squareValue = String(savedCols);
        const hasRectOption = Array.from(sizeSelect.options).some((opt) => opt.value === rectValue);
        const hasSquareOption = savedCols === savedRows
          && Array.from(sizeSelect.options).some((opt) => opt.value === squareValue);
        if (hasRectOption) {
          sizeSelect.value = rectValue;
        } else if (hasSquareOption) {
          sizeSelect.value = squareValue;
        }
      }
    }
  }
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
    benchmarkTextEl.textContent = "";
    return;
  }
  const moveDelta = state.moves - state.loadedBenchmarkStats.m;
  const timeDelta = state.timerElapsedMs - state.loadedBenchmarkStats.t;
  benchmarkTextEl.innerHTML = `(<strong>Moves:</strong> ${state.loadedBenchmarkStats.m}   <strong>Time: </strong> ${formatTimer(state.loadedBenchmarkStats.t)})`;
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

    // Clear one-time import params so they do not linger in the address bar.
    params.delete("board");
    params.delete("result");
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);

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
      shareBoardStatusEl.textContent = "Could not copy automatically. Use the Share URL field.";
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
  if (numberModeSelectEl) {
    numberModeSelectEl.value = state.hideBaseAndMatchedCurrent ? "minimal" : "standard";
  }
}


function applyRotationDirection() {
  if (rotationDirectionSelectEl) {
    rotationDirectionSelectEl.value = state.rotationDirection;
  }
  if (!rotationDirectionToggleBtn) {
    return;
  }
  rotationDirectionToggleBtn.textContent =
    state.rotationDirection === "cw"
      ? "Rotation: Clockwise"
      : "Rotation: Counterclockwise";
}

function applyFlowSoundMode() {
  if (flowSoundSelectEl) {
    flowSoundSelectEl.value = state.useFlowSound ? "on" : "off";
  }
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

function getActiveTutorialStep() {
  if (!state.tutorialActive) {
    return null;
  }
  const index = Math.max(0, Math.min(TUTORIAL_STEPS.length - 1, state.tutorialStep));
  return TUTORIAL_STEPS[index];
}

function renderTutorialPanel() {
  if (!tutorialStepLabelEl || !tutorialStepTextEl || !tutorialStartBtn || !tutorialNextBtn || !tutorialExitBtn) {
    return;
  }

  const step = getActiveTutorialStep();
  if (!step) {
    tutorialStepLabelEl.textContent = "2x2 Practice";
    tutorialStepTextEl.textContent = "Start a short guided run that highlights flow paths and asks you to fix one mismatch.";
    tutorialStartBtn.hidden = false;
    tutorialNextBtn.hidden = true;
    tutorialExitBtn.hidden = true;
    return;
  }

  tutorialStepLabelEl.textContent = step.label;
  tutorialStepTextEl.textContent = step.text;
  tutorialStartBtn.hidden = true;
  tutorialExitBtn.hidden = false;
  tutorialNextBtn.hidden = false;
  tutorialNextBtn.disabled = !!step.waitForRotate;
  tutorialNextBtn.textContent = step.final ? "Finish Tutorial" : "Next";
}

function applyTutorialStatusMessage() {
  if (!state.tutorialActive || !statusTextEl) {
    return;
  }
  const step = getActiveTutorialStep();
  if (!step) {
    return;
  }
  statusTextEl.textContent = step.status;
}

function setTutorialStep(stepIndex) {
  if (!state.tutorialActive) {
    return;
  }
  const boundedIndex = Math.max(0, Math.min(TUTORIAL_STEPS.length - 1, stepIndex));
  state.tutorialStep = boundedIndex;
  const step = getActiveTutorialStep();
  state.tutorialExpectedTileIndex = Number.isInteger(step?.expectedRotateIndex)
    ? step.expectedRotateIndex
    : null;
  renderTutorialPanel();
  renderBoard();
  applyTutorialStatusMessage();
}

function startGuidedTutorial() {
  state.tutorialActive = true;
  state.tutorialStep = 0;
  state.tutorialExpectedTileIndex = null;
  state.loadedBenchmarkStats = null;
  state.shareIncludeCompletedStats = false;
  state.disallowCrossingFlows = false;
  state.tileShape = "square";
  state.hideBaseAndMatchedCurrent = true;

  applyCrossingFlowMode();
  applyTileShape();
  applyNumberMode();

  state.helpOpen = true;
  applyHelpVisibility();

  loadBoardFromPayload(TUTORIAL_BOARD_PAYLOAD);
  setTutorialStep(0);
}

function endGuidedTutorial(restorePuzzle = true) {
  state.tutorialActive = false;
  state.tutorialStep = 0;
  state.tutorialExpectedTileIndex = null;
  renderTutorialPanel();

  if (restorePuzzle) {
    state.helpOpen = false;
    applyHelpVisibility();
    const selectedGrid = sizeSelect ? sizeSelect.value : "4x4";
    const grid = parseGridValue(selectedGrid);
    startNewPuzzle(grid.cols, grid.rows);
    return;
  }

  renderBoard();
  updateStatus();
}

function advanceTutorialStep() {
  const step = getActiveTutorialStep();
  if (!step || step.waitForRotate) {
    return;
  }
  if (step.final) {
    endGuidedTutorial(true);
    return;
  }
  setTutorialStep(state.tutorialStep + 1);
}

function canRotateTutorialTile(tileIndex, tileEl) {
  const step = getActiveTutorialStep();
  if (!step || step.allowFreePlay) {
    return true;
  }
  if (!step.waitForRotate) {
    animateBlockedTap(tileEl);
    applyTutorialStatusMessage();
    return false;
  }
  if (state.tutorialExpectedTileIndex !== null && tileIndex !== state.tutorialExpectedTileIndex) {
    animateBlockedTap(tileEl);
    statusTextEl.textContent = `Tutorial: rotate Tile ${state.tutorialExpectedTileIndex}.`;
    return false;
  }
  return true;
}

function handleTutorialAfterRotation(rotatedTileIndex) {
  const step = getActiveTutorialStep();
  if (!step || !step.waitForRotate) {
    return;
  }
  if (state.tutorialExpectedTileIndex !== null && rotatedTileIndex !== state.tutorialExpectedTileIndex) {
    return;
  }
  if (isSolved()) {
    setTutorialStep(state.tutorialStep + 1);
  } else {
    applyTutorialStatusMessage();
  }
}

function applyColorPalette() {
  document.body.dataset.palette = state.colorPalette;
  if (paletteSelectEl) {
    paletteSelectEl.value = state.colorPalette;
  }
  const isCustom = state.colorPalette === "custom";
  if (customPaletteControlsEl) {
    customPaletteControlsEl.hidden = !isCustom;
  }
  if (isCustom) {
    if (customAccentInputEl) customAccentInputEl.value = state.customPaletteAccent;
    if (customWarnInputEl) customWarnInputEl.value = state.customPaletteWarn;
    if (customBgInputEl) customBgInputEl.value = state.customPaletteBg;
    if (customTileInputEl) customTileInputEl.value = state.customPaletteTile;
    if (customTileBorderInputEl) customTileBorderInputEl.value = state.customPaletteTileBorder;
    if (customSolvedInputEl) customSolvedInputEl.value = state.customPaletteSolved;
    if (customUnsolvedInputEl) customUnsolvedInputEl.value = state.customPaletteUnsolved;
    document.body.style.setProperty("--accent", state.customPaletteAccent);
    document.body.style.setProperty("--warn", state.customPaletteWarn);
    document.body.style.setProperty("--bg-a", state.customPaletteBg);
    document.body.style.setProperty("--tile", state.customPaletteTile);
    document.body.style.setProperty("--tile-border", state.customPaletteTileBorder);
    document.body.style.setProperty("--solved", state.customPaletteSolved);
    document.body.style.setProperty("--unsolved", state.customPaletteUnsolved);
  } else {
    document.body.style.removeProperty("--accent");
    document.body.style.removeProperty("--warn");
    document.body.style.removeProperty("--bg-a");
    document.body.style.removeProperty("--tile");
    document.body.style.removeProperty("--tile-border");
    document.body.style.removeProperty("--solved");
    document.body.style.removeProperty("--unsolved");
  }
}

function applyNegativeBaseMode() {
  if (!negativeBaseSelectEl) {
    return;
  }
  negativeBaseSelectEl.value = state.allowNegativeBaseRunoff ? "on" : "off";
}

function applyCrossingFlowMode() {
  if (!crossingFlowSelectEl) {
    return;
  }
  crossingFlowSelectEl.value = state.disallowCrossingFlows ? "on" : "off";
}

function applyBaseTileAccumulationMode() {
  if (baseTileAccumulationValueEl) {
    baseTileAccumulationValueEl.textContent = String(state.baseTileAccumulation);
  }
  if (baseTileAccumulationSliderEl) {
    baseTileAccumulationSliderEl.value = String(state.baseTileAccumulation);
  }
}


function applyTileShape() {
  boardEl.classList.toggle("shape-square", state.tileShape === "square");
  boardEl.classList.toggle("shape-hex", state.tileShape === "hex");
  if (!tileShapeSelectEl) {
    return;
  }
  tileShapeSelectEl.value = state.tileShape;
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
  if (viewSelectEl) {
    viewSelectEl.value = state.viewMode;
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

if (tutorialStartBtn) {
  tutorialStartBtn.addEventListener("click", () => {
    startGuidedTutorial();
  });
}

if (tutorialNextBtn) {
  tutorialNextBtn.addEventListener("click", () => {
    advanceTutorialStep();
  });
}

if (tutorialExitBtn) {
  tutorialExitBtn.addEventListener("click", () => {
    endGuidedTutorial(true);
  });
}

sizeSelect.addEventListener("change", () => {
  const grid = parseGridValue(sizeSelect.value);
  state.cols = grid.cols;
  state.rows = grid.rows;
  persistDisplayAndDifficultySettings();
  startNewPuzzle(grid.cols, grid.rows);
});

if (viewSelectEl) {
  viewSelectEl.addEventListener("change", () => {
    state.viewMode = viewSelectEl.value;
    applyViewMode();
    persistDisplayAndDifficultySettings();
  });
}

if (rotationDirectionSelectEl) {
  rotationDirectionSelectEl.addEventListener("change", () => {
    state.rotationDirection = rotationDirectionSelectEl.value;
    applyRotationDirection();
    persistDisplayAndDifficultySettings();
  });
}

if (rotationDirectionToggleBtn) {
  rotationDirectionToggleBtn.addEventListener("click", () => {
    state.rotationDirection = state.rotationDirection === "cw" ? "ccw" : "cw";
    applyRotationDirection();
    persistDisplayAndDifficultySettings();
  });
}

if (flowSoundSelectEl) {
  flowSoundSelectEl.addEventListener("change", () => {
    state.useFlowSound = flowSoundSelectEl.value === "on";
    applyFlowSoundMode();
    persistDisplayAndDifficultySettings();
  });
}

if (negativeBaseSelectEl) {
  negativeBaseSelectEl.addEventListener("change", () => {
    state.allowNegativeBaseRunoff = negativeBaseSelectEl.value === "on";
    applyNegativeBaseMode();
    persistDisplayAndDifficultySettings();
    startNewPuzzle(state.cols, state.rows);
  });
}

if (crossingFlowSelectEl) {
  crossingFlowSelectEl.addEventListener("change", () => {
    state.disallowCrossingFlows = crossingFlowSelectEl.value === "on";
    applyCrossingFlowMode();
    persistDisplayAndDifficultySettings();
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


if (tileShapeSelectEl) {
  tileShapeSelectEl.addEventListener("change", () => {
    state.tileShape = tileShapeSelectEl.value;
    applyTileShape();
    persistDisplayAndDifficultySettings();
    startNewPuzzle(state.cols, state.rows);
  });
}

if (numberModeSelectEl) {
  numberModeSelectEl.addEventListener("change", () => {
    state.hideBaseAndMatchedCurrent = numberModeSelectEl.value === "minimal";
    applyNumberMode();
    renderBoard();
    persistDisplayAndDifficultySettings();
  });
}


if (arrowPositionSliderEl) {
  arrowPositionSliderEl.addEventListener("input", () => {
    state.arrowPosition = Number(arrowPositionSliderEl.value);
    applyArrowPosition();
    persistDisplayAndDifficultySettings();
  });
}

if (arrowScaleSliderEl) {
  arrowScaleSliderEl.addEventListener("input", () => {
    state.arrowScale = Number(arrowScaleSliderEl.value);
    applyArrowScale();
    persistDisplayAndDifficultySettings();
  });
}

if (currentValueScaleSliderEl) {
  currentValueScaleSliderEl.addEventListener("input", () => {
    state.currentValueScale = Number(currentValueScaleSliderEl.value);
    applyCurrentValueScale();
    persistDisplayAndDifficultySettings();
  });
}

if (sinkToneSliderEl) {
  sinkToneSliderEl.addEventListener("input", () => {
    state.sinkTone = Number(sinkToneSliderEl.value);
    applySinkTone();
    renderBoard();
    persistDisplayAndDifficultySettings();
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
    persistDisplayAndDifficultySettings();
  });
}

if (customAccentInputEl) {
  customAccentInputEl.addEventListener("input", () => {
    state.customPaletteAccent = customAccentInputEl.value;
    applyColorPalette();
    persistDisplayAndDifficultySettings();
  });
}

if (customWarnInputEl) {
  customWarnInputEl.addEventListener("input", () => {
    state.customPaletteWarn = customWarnInputEl.value;
    applyColorPalette();
    persistDisplayAndDifficultySettings();
  });
}

if (customBgInputEl) {
  customBgInputEl.addEventListener("input", () => {
    state.customPaletteBg = customBgInputEl.value;
    applyColorPalette();
    persistDisplayAndDifficultySettings();
  });
}

if (customTileInputEl) {
  customTileInputEl.addEventListener("input", () => {
    state.customPaletteTile = customTileInputEl.value;
    applyColorPalette();
    persistDisplayAndDifficultySettings();
  });
}

if (customTileBorderInputEl) {
  customTileBorderInputEl.addEventListener("input", () => {
    state.customPaletteTileBorder = customTileBorderInputEl.value;
    applyColorPalette();
    persistDisplayAndDifficultySettings();
  });
}

if (customSolvedInputEl) {
  customSolvedInputEl.addEventListener("input", () => {
    state.customPaletteSolved = customSolvedInputEl.value;
    applyColorPalette();
    persistDisplayAndDifficultySettings();
  });
}

if (customUnsolvedInputEl) {
  customUnsolvedInputEl.addEventListener("input", () => {
    state.customPaletteUnsolved = customUnsolvedInputEl.value;
    applyColorPalette();
    persistDisplayAndDifficultySettings();
  });
}

if (animationSpeedSliderEl) {
  animationSpeedSliderEl.addEventListener("input", () => {
    state.animationSpeed = Number(animationSpeedSliderEl.value);
    applyAnimationSpeed();
    persistDisplayAndDifficultySettings();
  });
}

if (bounceStrengthSliderEl) {
  bounceStrengthSliderEl.addEventListener("input", () => {
    state.bounceStrength = Number(bounceStrengthSliderEl.value);
    applyBounceStrength();
    persistDisplayAndDifficultySettings();
  });
}

if (tileDelaySliderEl) {
  tileDelaySliderEl.addEventListener("input", () => {
    state.tileDelay = Number(tileDelaySliderEl.value);
    applyTileDelay();
    persistDisplayAndDifficultySettings();
  });
}

if (clearSettingsBtn) {
  clearSettingsBtn.addEventListener("click", () => {
    if (confirm("Clear all settings and reset to defaults?")) {
      window.localStorage.removeItem(UI_SETTINGS_STORAGE_KEY);
      window.location.reload();
    }
  });
}

if (baseTileAccumulationSliderEl) {
  baseTileAccumulationSliderEl.addEventListener("input", () => {
    state.baseTileAccumulation = Number(baseTileAccumulationSliderEl.value);
    applyBaseTileAccumulationMode();
    persistDisplayAndDifficultySettings();
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
  return state.rotationDirection;
}

function updateTileHoverCursor(tileEl, event, canRotate) {
  if (!tileEl) {
    return;
  }

  tileEl.classList.remove("cursor-cw", "cursor-ccw", "cursor-cw-basic", "cursor-ccw-basic");

  if (!canRotate) {
    tileEl.classList.add("no-rotate");
    return;
  }

  tileEl.classList.remove("no-rotate");
  tileEl.classList.add("cursor-cw-basic");
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

function accumulateExcludingLoopContributors(board, loopTileIndices) {
  const n = board.length;
  const incoming = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i += 1) {
    const to = followDirection(state.cols, state.rows, i, board[i].currentDir);
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
      if (loopTileIndices.has(up)) {
        continue;
      }
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
  state.tutorialActive = false;
  state.tutorialStep = 0;
  state.tutorialExpectedTileIndex = null;
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
  if (postWinNewGameBtn) {
    postWinNewGameBtn.hidden = true;
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
  renderTutorialPanel();
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
  handleTutorialAfterRotation(index);
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
    statusTextEl.textContent = `Solved in ${state.moves} moves. New Puzzle for another watershed.`;
    if (boardStatusShareBtn) {
      boardStatusShareBtn.hidden = false;
    }
    if (postWinNewGameBtn) {
      postWinNewGameBtn.hidden = false;
    }
  } else {
    const remaining = state.board.filter((c) => c.currentAccum !== c.targetAccum).length;
    const crossingCount = state.disallowCrossingFlows ? getCrossingTileIndices(state.board).size : 0;
    if (boardStatusShareBtn) {
      boardStatusShareBtn.hidden = true;
    }
    if (postWinNewGameBtn) {
      postWinNewGameBtn.hidden = true;
    }
  }

  if (state.tutorialActive) {
    applyTutorialStatusMessage();
    if (boardStatusShareBtn) {
      boardStatusShareBtn.hidden = true;
    }
    if (postWinNewGameBtn) {
      postWinNewGameBtn.hidden = true;
    }
  }

  renderBenchmarkComparison();
  renderLessonStudio();
}

function renderBoard() {
  const tutorialStep = getActiveTutorialStep();
  boardEl.classList.toggle("tutorial-active", !!tutorialStep && !tutorialStep.allowFreePlay);

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
  const loopDisplayValues = accumulateExcludingLoopContributors(state.board, loopTileIndices);
  const highlightedInvalidTiles = new Set(loopTileIndices);
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

    if (tutorialStep) {
      const focused = Array.isArray(tutorialStep.focus) && tutorialStep.focus.includes(cell.index);
      if (focused) {
        tile.classList.add("tutorial-focus");
      } else if (!tutorialStep.allowFreePlay) {
        tile.classList.add("tutorial-muted");
      }
      if (Array.isArray(tutorialStep.target) && tutorialStep.target.includes(cell.index)) {
        tile.classList.add("tutorial-target");
      }
      if (
        tutorialStep.waitForRotate
        && state.tutorialExpectedTileIndex !== null
        && cell.index === state.tutorialExpectedTileIndex
      ) {
        tile.classList.add("tutorial-action");
      }
    }

    tile.setAttribute("aria-label", `Tile ${cell.index}`);
    tile.dataset.index = String(cell.index);

    const base = document.createElement("span");
    base.className = "base";
    base.textContent = `${cell.baseFlow}`;
    if (state.hideBaseAndMatchedCurrent) {
      base.style.display = "none";
    }

    const current = document.createElement("span");
    current.className = "current";
    const displayedCurrentValue = loopTileIndices.has(cell.index)
      ? loopDisplayValues[cell.index]
      : cell.currentAccum;
    current.textContent = String(displayedCurrentValue);
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
        return;
      }
      tile.classList.remove("cursor-cw", "cursor-ccw", "cursor-cw-basic", "cursor-ccw-basic", "no-rotate");
    });
    tile.addEventListener("click", (event) => {
      state.lastPointerClientX = event.clientX;
      state.lastPointerClientY = event.clientY;
      if (state.tutorialActive && !canRotateTutorialTile(cell.index, tile)) {
        return;
      }
      if (!state.tutorialActive) {
        startGameTimer();
      }
      const clickRotationDirection = getRotationDirectionFromClick(tile, event);
      rotateCell(cell.index, tile, clickRotationDirection);
    });
    frag.appendChild(tile);
  }

  boardEl.replaceChildren(frag);
  buildLinkOverlay();
  refreshHoverCursorFromPointer();
}

loadPersistedDisplayAndDifficultySettings();
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
applyFlowSoundMode();
applyHelpVisibility();
renderTutorialPanel();
applyColorPalette();
applyNegativeBaseMode();
applyCrossingFlowMode();
applyBaseTileAccumulationMode();
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
    // no-op
  }
});
window.addEventListener("resize", () => {
  renderBoard();
});
