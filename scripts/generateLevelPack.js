/**
 * Dev tool: regenerates src/assets/levels/pack-01.json using rejection
 * sampling — each level is randomly laid out with obstacles/ice/portals/
 * locked tiles, then verified with a BFS solver that mirrors the real
 * MovementEngine/CollisionEngine rules, retrying until a genuinely
 * 100%-completable layout is found. Locked tiles are treated as
 * unlock-at-will (paintable, non-blocking) for solvability purposes,
 * matching the real tap-to-unlock mechanic in useGameStore.
 *
 * Run with: node scripts/generateLevelPack.js
 */
const fs = require('fs');
const path = require('path');

const TileType = {
  Empty: 'EMPTY', Wall: 'WALL', Obstacle: 'OBSTACLE', Void: 'VOID',
  Locked: 'LOCKED', Ice: 'ICE', Portal: 'PORTAL', Teleport: 'TELEPORT',
};
const DELTA = {UP: [-1, 0], DOWN: [1, 0], LEFT: [0, -1], RIGHT: [0, 1]};

function rngInt(n) {
  return Math.floor(Math.random() * n);
}

function shuffledCells(rows, cols, exclude) {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (exclude.has(`${r},${c}`)) continue;
      cells.push([r, c]);
    }
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = rngInt(i + 1);
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
}

function buildRandomTiles({rows, cols, ballStart, obstacleCount, iceCount, portal, locked}) {
  const grid = Array.from({length: rows}, (_, r) =>
    Array.from({length: cols}, (_, c) => ({row: r, col: c, type: TileType.Empty, paintable: true, painted: false})),
  );

  const reserved = new Set([`${ballStart[0]},${ballStart[1]}`]);
  const pool = shuffledCells(rows, cols, reserved);
  let cursor = 0;

  for (let i = 0; i < obstacleCount && cursor < pool.length; i++, cursor++) {
    const [r, c] = pool[cursor];
    grid[r][c] = {row: r, col: c, type: TileType.Obstacle, paintable: false, painted: false};
  }
  for (let i = 0; i < iceCount && cursor < pool.length; i++, cursor++) {
    const [r, c] = pool[cursor];
    grid[r][c] = {row: r, col: c, type: TileType.Ice, paintable: true, painted: false};
  }
  if (portal && cursor + 1 < pool.length) {
    const [r1, c1] = pool[cursor++];
    const [r2, c2] = pool[cursor++];
    grid[r1][c1] = {row: r1, col: c1, type: TileType.Portal, paintable: false, painted: false, linkId: 'portal-1'};
    grid[r2][c2] = {row: r2, col: c2, type: TileType.Teleport, paintable: true, painted: false, linkId: 'portal-1'};
  }
  if (locked && cursor < pool.length) {
    for (let i = 0; i < locked.count && cursor < pool.length; i++, cursor++) {
      const [r, c] = pool[cursor];
      grid[r][c] = {row: r, col: c, type: TileType.Locked, paintable: false, painted: false, unlockCost: locked.cost};
    }
  }

  const tiles = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tiles.push(grid[r][c]);
  return tiles;
}

function inBounds(rows, cols, r, c) {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}

// Locked tiles are unlock-at-will in real gameplay, so for solvability
// purposes they behave like ordinary paintable floor, not a blocker.
function isBlocking(tile) {
  return tile.type === TileType.Wall || tile.type === TileType.Obstacle || tile.type === TileType.Void;
}
function isPaintableForSolver(tile) {
  return tile.paintable || tile.type === TileType.Locked;
}

function findLinked(grid, linkId, excludeR, excludeC) {
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++) {
      const t = grid[r][c];
      if (t.linkId === linkId && !(r === excludeR && c === excludeC)) return [r, c];
    }
  return null;
}

function computeMove(grid, rows, cols, startR, startC, dir) {
  const [dr, dc] = DELTA[dir];
  let cr = startR, cc = startC;
  const visited = [];
  let steps = 0;
  while (steps++ < 500) {
    const nr = cr + dr, nc = cc + dc;
    if (!inBounds(rows, cols, nr, nc) || isBlocking(grid[nr][nc])) break;
    const tile = grid[nr][nc];
    if (tile.type === TileType.Portal) {
      const exit = tile.linkId ? findLinked(grid, tile.linkId, nr, nc) : null;
      if (!exit) break;
      cr = exit[0]; cc = exit[1];
      visited.push([cr, cc]);
      continue;
    }
    cr = nr; cc = nc;
    visited.push([cr, cc]);
  }
  return {visited, finalR: cr, finalC: cc, moved: visited.length > 0};
}

function verifySolvable(tiles, rows, cols, ballStart, maxStates) {
  const grid = Array.from({length: rows}, () => new Array(cols));
  for (const t of tiles) grid[t.row][t.col] = t;

  const paintableIdx = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (isPaintableForSolver(grid[r][c])) paintableIdx.push(r * cols + c);
  const bitIndex = new Map(paintableIdx.map((idx, i) => [idx, i]));
  const fullMask = (1n << BigInt(paintableIdx.length)) - 1n;

  function bitFor(r, c) {
    const idx = bitIndex.get(r * cols + c);
    return idx === undefined ? null : 1n << BigInt(idx);
  }

  const startMask = bitFor(ballStart[0], ballStart[1]) || 0n;
  const visited = new Set([`${ballStart[0]},${ballStart[1]},${startMask.toString(16)}`]);
  let queue = [{r: ballStart[0], c: ballStart[1], mask: startMask}];
  let statesExplored = 0;

  while (queue.length > 0) {
    const next = [];
    for (const state of queue) {
      statesExplored++;
      if (statesExplored > maxStates) return {solvable: null, statesExplored};
      if (state.mask === fullMask) return {solvable: true, statesExplored};
      for (const dir of ['UP', 'DOWN', 'LEFT', 'RIGHT']) {
        const {visited: mpath, finalR, finalC, moved} = computeMove(grid, rows, cols, state.r, state.c, dir);
        if (!moved) continue;
        let mask = state.mask;
        for (const [r, c] of mpath) {
          const b = bitFor(r, c);
          if (b) mask |= b;
        }
        const key = `${finalR},${finalC},${mask.toString(16)}`;
        if (!visited.has(key)) {
          visited.add(key);
          next.push({r: finalR, c: finalC, mask});
        }
      }
    }
    queue = next;
  }
  return {solvable: false, statesExplored};
}

function generateSolvableLevel(spec, maxAttempts = 4000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const tiles = buildRandomTiles(spec);
    const result = verifySolvable(tiles, spec.rows, spec.cols, spec.ballStart, 60000);
    if (result.solvable === true) {
      return {tiles, attempts: attempt + 1};
    }
  }
  throw new Error(`Failed to generate a solvable layout for ${spec.rows}x${spec.cols} after ${maxAttempts} attempts`);
}

function paintableCount(tiles) {
  return tiles.filter(t => t.paintable || t.type === TileType.Locked).length;
}

function makeLevel(spec) {
  const {tiles, attempts} = generateSolvableLevel(spec);
  const total = paintableCount(tiles);
  const base = Math.max(4, Math.round(total / 2.6));
  const starThresholds = [base + 8, base + 4, base];
  console.log(`${spec.id}: solved in ${attempts} attempt(s), ${total} paintable tiles`);
  return {
    id: spec.id,
    order: spec.order,
    name: spec.name,
    rows: spec.rows,
    cols: spec.cols,
    ballStart: {row: spec.ballStart[0], col: spec.ballStart[1]},
    tiles,
    starThresholds,
    parTimeSeconds: 60 + spec.order * 5,
    difficulty: spec.difficulty,
    coinsReward: spec.coinsReward,
    ...(spec.unlockCoinCost ? {unlockCoinCost: spec.unlockCoinCost} : {}),
  };
}

const specs = [
  {id: 'lvl-001', order: 0, name: 'First Roll', rows: 4, cols: 4, ballStart: [0, 0], obstacleCount: 3, iceCount: 0, difficulty: 'easy', coinsReward: 10},
  {id: 'lvl-002', order: 1, name: 'Corner Turn', rows: 4, cols: 5, ballStart: [0, 0], obstacleCount: 4, iceCount: 0, difficulty: 'easy', coinsReward: 12},
  {id: 'lvl-003', order: 2, name: 'Zig Zag', rows: 5, cols: 5, ballStart: [0, 0], obstacleCount: 5, iceCount: 0, difficulty: 'easy', coinsReward: 14},
  {id: 'lvl-004', order: 3, name: 'Boxed In', rows: 5, cols: 6, ballStart: [2, 0], obstacleCount: 6, iceCount: 0, difficulty: 'medium', coinsReward: 16},
  {id: 'lvl-005', order: 4, name: 'Diagonal Drift', rows: 6, cols: 6, ballStart: [0, 0], obstacleCount: 7, iceCount: 0, difficulty: 'medium', coinsReward: 18},
  {id: 'lvl-006', order: 5, name: 'Frozen Corner', rows: 6, cols: 6, ballStart: [0, 0], obstacleCount: 7, iceCount: 4, difficulty: 'medium', coinsReward: 20},
  {id: 'lvl-007', order: 6, name: 'Ice Run', rows: 6, cols: 7, ballStart: [0, 6], obstacleCount: 8, iceCount: 5, difficulty: 'medium', coinsReward: 22},
  {id: 'lvl-008', order: 7, name: 'Split Path', rows: 7, cols: 7, ballStart: [3, 3], obstacleCount: 10, iceCount: 0, difficulty: 'hard', coinsReward: 26},
  {id: 'lvl-009', order: 8, name: 'Portal Jump', rows: 7, cols: 7, ballStart: [0, 0], obstacleCount: 9, iceCount: 0, portal: true, difficulty: 'hard', coinsReward: 30},
  {id: 'lvl-010', order: 9, name: 'Locked Vault', rows: 7, cols: 8, ballStart: [0, 0], obstacleCount: 10, iceCount: 0, locked: {count: 1, cost: 15}, difficulty: 'hard', coinsReward: 34},
  {id: 'lvl-011', order: 10, name: 'Glacier Maze', rows: 8, cols: 8, ballStart: [0, 0], obstacleCount: 12, iceCount: 6, difficulty: 'expert', coinsReward: 40},
  {id: 'lvl-012', order: 11, name: 'Grand Vault', rows: 8, cols: 8, ballStart: [4, 4], obstacleCount: 11, iceCount: 0, portal: true, locked: {count: 2, cost: 25}, difficulty: 'expert', coinsReward: 50},
];

const levels = specs.map(makeLevel);

const pack = {packId: 'pack-01', packName: 'Origins', levels};
const outPath = path.join(__dirname, '..', 'src', 'assets', 'levels', 'pack-01.json');
fs.writeFileSync(outPath, JSON.stringify(pack, null, 2));
console.log('\nWrote', outPath, 'with', levels.length, 'guaranteed-solvable levels');
