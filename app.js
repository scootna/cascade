const ARROWS = ["→", "↗", "↑", "↖", "←", "↙", "↓", "↘"];

const state = {
  cols: 6,
  rows: 6,
  board: [],
  moves: 0,
  solved: false,
};

const boardEl = document.getElementById("board");
const statusTextEl = document.getElementById("statusText");
const movesTextEl = document.getElementById("movesText");
const newGameBtn = document.getElementById("newGameBtn");
const sizeSelect = document.getElementById("sizeSelect");

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

  let nextDir = (cell.currentDir + 1) % 8;
  let guard = 0;
  while (followDirection(state.cols, state.rows, index, nextDir) === index && guard < 9) {
    nextDir = (nextDir + 1) % 8;
    guard += 1;
  }

  cell.currentDir = nextDir;
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
  boardEl.style.gridTemplateColumns = `repeat(${state.cols}, minmax(60px, 1fr))`;

  const frag = document.createDocumentFragment();
  for (const cell of state.board) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.classList.add(cell.currentAccum === cell.targetAccum ? "solved" : "unsolved");
    tile.setAttribute("aria-label", `Tile ${cell.index}`);

    const base = document.createElement("span");
    base.className = "base";
    base.textContent = `b:${cell.baseFlow}`;

    const current = document.createElement("span");
    current.className = "current";
    current.textContent = String(cell.currentAccum);

    const target = document.createElement("span");
    target.className = "target";
    target.textContent = `t:${cell.targetAccum}`;

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = cell.currentDir === null ? "•" : ARROWS[cell.currentDir];

    tile.append(base, current, target, arrow);
    tile.addEventListener("click", () => rotateCell(cell.index));
    frag.appendChild(tile);
  }

  boardEl.replaceChildren(frag);
}

startNewPuzzle(state.cols, state.rows);
