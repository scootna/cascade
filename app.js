const state = {
  cols: 6,
  rows: 6,
  viewMode: "arrows",
  hideBaseAndMatchedCurrent: true,
  showCurrentValueBadge: false,
  arrowPosition: 40,
  arrowScale: 3,
  currentValueScale: 2,
  lockedTileSize: null,
  board: [],
  moves: 0,
  solved: false,
};

const boardEl = document.getElementById("board");
const boardStageEl = document.getElementById("boardStage");
const linkOverlayEl = document.getElementById("linkOverlay");
const statusTextEl = document.getElementById("statusText");
const movesTextEl = document.getElementById("movesText");
const newGameBtn = document.getElementById("newGameBtn");
const valueBadgeToggleBtn = document.getElementById("valueBadgeToggleBtn");
const numberModeToggleBtn = document.getElementById("numberModeToggleBtn");
const viewToggleBtn = document.getElementById("viewToggleBtn");
const arrowPositionSliderEl = document.getElementById("arrowPositionSlider");
const arrowPositionValueEl = document.getElementById("arrowPositionValue");
const arrowScaleSliderEl = document.getElementById("arrowScaleSlider");
const arrowScaleValueEl = document.getElementById("arrowScaleValue");
const currentValueScaleSliderEl = document.getElementById("currentValueScaleSlider");
const currentValueScaleValueEl = document.getElementById("currentValueScaleValue");
const sizeSelect = document.getElementById("sizeSelect");
const DIR_DEGREES = [0, -45, -90, -135, 180, 135, 90, 45];

function getDirectionAngle(dir) {
  return dir === null ? 0 : DIR_DEGREES[dir];
}

function getShortestAngleDelta(fromAngle, toAngle) {
  let delta = toAngle - fromAngle;
  while (delta > 180) {
    delta -= 360;
  }
  while (delta < -180) {
    delta += 360;
  }
  return delta;
}

function animateDirectionRotation(directionEl, fromDir, toDir) {
  if (!directionEl || fromDir === null || toDir === null || fromDir === toDir) {
    return;
  }

  const fromAngle = getDirectionAngle(fromDir);
  const toAngle = getDirectionAngle(toDir);
  const delta = getShortestAngleDelta(fromAngle, toAngle);
  const finalAngle = fromAngle + delta;

  directionEl.animate(
    [
      { transform: `translate(-50%, -50%) rotate(${fromAngle}deg)` },
      { transform: `translate(-50%, -50%) rotate(${finalAngle}deg)` },
    ],
    {
      duration: 220,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    }
  );
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
  boardEl.style.setProperty("--triangle-scale", String(state.arrowScale));
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

newGameBtn.addEventListener("click", () => {
  const grid = parseGridValue(sizeSelect.value);
  startNewPuzzle(grid.cols, grid.rows);
});

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
  const candidates = [
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
  const all = [
    { dx: 1, dy: 0 },
    { dx: 1, dy: -1 },
    { dx: 0, dy: -1 },
    { dx: -1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
  ];
  const nx = x + all[dir].dx;
  const ny = y + all[dir].dy;
  if (!inBounds(cols, rows, nx, ny)) {
    return index;
  }
  return indexFromXY(cols, nx, ny);
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
  for (const cell of board) {
    if (cell.solutionDir === null) {
      cell.currentDir = null;
      continue;
    }
    const offset = 1 + Math.floor(Math.random() * 7);
    cell.currentDir = (cell.solutionDir + offset) % 8;
  }
}

function startNewPuzzle(cols, rows) {
  state.cols = cols;
  state.rows = rows;
  state.solved = false;
  state.moves = 0;
  movesTextEl.textContent = "Moves: 0";

  const elev = makeElevation(cols, rows);
  const board = [];

  for (let i = 0; i < cols * rows; i += 1) {
    const baseFlow = 1 + Math.floor(Math.random() * 3);
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
      pivot.currentDir = (pivot.currentDir + 1) % 8;
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

function rotateCell(index) {
  if (state.solved) {
    return;
  }

  const cell = state.board[index];
  if (cell.solutionDir === null) {
    return;
  }

  const previousDir = cell.currentDir;

  let nextDir = (cell.currentDir + 1) % 8;
  let guard = 0;
  while (followDirection(state.cols, state.rows, index, nextDir) === index && guard < 9) {
    nextDir = (nextDir + 1) % 8;
    guard += 1;
  }

  cell.currentDir = nextDir;
  cell.rotationFromDir = previousDir;
  state.moves += 1;
  movesTextEl.textContent = `Moves: ${state.moves}`;

  const current = accumulate(state.board, false);
  for (let i = 0; i < state.board.length; i += 1) {
    state.board[i].currentAccum = current[i];
  }

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
  const solvedNow = isSolved();
  state.solved = solvedNow;

  if (solvedNow) {
    statusTextEl.textContent = `Solved in ${state.moves} moves. New Puzzle for another watershed.`;
  } else {
    const remaining = state.board.filter((c) => c.currentAccum !== c.targetAccum).length;
    statusTextEl.textContent = `${remaining} tiles still mismatched.`;
  }
}

function renderBoard() {
  if (state.lockedTileSize === null) {
    const gapPx = 8;
    const sixBySixCols = 6;
    const hostWidth = boardStageEl ? boardStageEl.clientWidth : 960;
    const computed = Math.floor((hostWidth - (sixBySixCols - 1) * gapPx) / sixBySixCols);
    state.lockedTileSize = Math.max(52, computed);
    boardEl.style.setProperty("--locked-tile-size", `${state.lockedTileSize}px`);
  }

  boardEl.style.gridTemplateColumns = `repeat(${state.cols}, var(--locked-tile-size))`;
  const maxDim = Math.max(state.cols, state.rows);
  boardEl.classList.remove("grid-regular", "grid-compact", "grid-dense");
  if (maxDim >= 7) {
    boardEl.classList.add("grid-dense");
  } else if (maxDim >= 5) {
    boardEl.classList.add("grid-compact");
  } else {
    boardEl.classList.add("grid-regular");
  }

  const frag = document.createDocumentFragment();
  for (const cell of state.board) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.classList.add(cell.currentAccum === cell.targetAccum ? "solved" : "unsolved");
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

    const target = document.createElement("span");
    target.className = "target";
    target.textContent = `t:${cell.targetAccum}`;
    if (state.hideBaseAndMatchedCurrent && cell.currentAccum === cell.targetAccum) {
      target.style.visibility = "hidden";
    }

    const direction = document.createElement("span");
    direction.className = "direction";
    if (cell.currentDir === null) {
      direction.classList.add("sink");
    } else {
      direction.style.setProperty("--dir-angle", `${DIR_DEGREES[cell.currentDir]}deg`);
      if (cell.rotationFromDir !== undefined) {
        animateDirectionRotation(direction, cell.rotationFromDir, cell.currentDir);
        delete cell.rotationFromDir;
      }
    }

    tile.append(base, direction, current, target);
    tile.addEventListener("click", () => rotateCell(cell.index));
    frag.appendChild(tile);
  }

  boardEl.replaceChildren(frag);
  buildLinkOverlay();
}

startNewPuzzle(state.cols, state.rows);
applyArrowPosition();
applyArrowScale();
applyCurrentValueScale();
applyNumberMode();
applyValueBadgeMode();
applyViewMode();
window.addEventListener("resize", buildLinkOverlay);
