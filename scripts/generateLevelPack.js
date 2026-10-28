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
 * (keeps existing levels, generates only new ones; add --regenerate to
 * rebuild the whole pack)
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
  // BFS is level-by-level, so the depth at which the first fully-painted
  // state shows up is the fewest swipes any player could possibly win in.
  let depth = 0;

  while (queue.length > 0) {
    const next = [];
    for (const state of queue) {
      statesExplored++;
      if (statesExplored > maxStates) return {solvable: null, statesExplored};
      if (state.mask === fullMask) return {solvable: true, statesExplored, minMoves: depth};
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
    depth++;
  }
  return {solvable: false, statesExplored};
}

function generateSolvableLevel(spec, maxAttempts = 12000) {
  // Larger, more open boards have a combinatorially bigger reachable
  // (position, paintedBitmask) state space — a flat state cap starves the
  // BFS solver on big grids regardless of how many random layouts are
  // tried (it never gets far enough to confirm solvable OR unsolvable).
  // Scale the budget with board area so bigger levels get proportionally
  // more search room.
  const maxStates = Math.max(60000, spec.rows * spec.cols * 4000);
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const tiles = buildRandomTiles(spec);
    const result = verifySolvable(tiles, spec.rows, spec.cols, spec.ballStart, maxStates);
    if (result.solvable === true) {
      return {tiles, attempts: attempt + 1, minMoves: result.minMoves};
    }
  }
  throw new Error(`Failed to generate a solvable layout for ${spec.rows}x${spec.cols} after ${maxAttempts} attempts`);
}

function paintableCount(tiles) {
  return tiles.filter(t => t.paintable || t.type === TileType.Locked).length;
}

// Countdown time limit players race against — failing to finish in time
// ends the level as a loss (see useGameStore.tick). The per-tier value is a
// floor; the real limit is also scaled from the level's true optimal
// solution (see tuneForOptimum) so a level is never shorter than what a
// player needs just to *swipe* the solution, let alone work it out.
const TIME_LIMIT_BY_DIFFICULTY = {easy: 15, medium: 25, hard: 35, expert: 35};

// Stars are awarded by swipe count (WinEngine.rateStars), so thresholds must
// sit relative to the fewest swipes physically possible — otherwise 3 stars
// (or even 1) can be unreachable. These are slack above the optimum.
const STAR_SLACK = {three: 2, two: 6, one: 12};
const SECONDS_PER_OPTIMAL_MOVE = 2.5;
const TIME_PADDING_SECONDS = 10;

function tuneForOptimum(minMoves, difficulty) {
  return {
    starThresholds: [minMoves + STAR_SLACK.one, minMoves + STAR_SLACK.two, minMoves + STAR_SLACK.three],
    parTimeSeconds: Math.max(
      TIME_LIMIT_BY_DIFFICULTY[difficulty],
      Math.ceil(minMoves * SECONDS_PER_OPTIMAL_MOVE + TIME_PADDING_SECONDS),
    ),
  };
}

function makeLevel(spec) {
  const {tiles, attempts, minMoves} = generateSolvableLevel(spec);
  const total = paintableCount(tiles);
  const {starThresholds, parTimeSeconds} = tuneForOptimum(minMoves, spec.difficulty);
  console.log(`${spec.id}: solved in ${attempts} attempt(s), ${total} paintable tiles, optimal ${minMoves} moves`);
  return {
    id: spec.id,
    order: spec.order,
    name: spec.name,
    rows: spec.rows,
    cols: spec.cols,
    ballStart: {row: spec.ballStart[0], col: spec.ballStart[1]},
    tiles,
    starThresholds,
    parTimeSeconds,
    difficulty: spec.difficulty,
    coinsReward: spec.coinsReward,
    ...(spec.unlockCoinCost ? {unlockCoinCost: spec.unlockCoinCost} : {}),
  };
}

const specs = [
  // Easy — order 0-5
  {id: 'lvl-001', order: 0, name: 'First Roll', rows: 4, cols: 4, ballStart: [0, 0], obstacleCount: 3, iceCount: 0, difficulty: 'easy', coinsReward: 10},
  {id: 'lvl-002', order: 1, name: 'Corner Turn', rows: 4, cols: 5, ballStart: [0, 0], obstacleCount: 4, iceCount: 0, difficulty: 'easy', coinsReward: 12},
  {id: 'lvl-003', order: 2, name: 'Zig Zag', rows: 5, cols: 5, ballStart: [0, 0], obstacleCount: 5, iceCount: 0, difficulty: 'easy', coinsReward: 14},
  {id: 'lvl-004', order: 3, name: 'Simple Loop', rows: 4, cols: 5, ballStart: [3, 4], obstacleCount: 4, iceCount: 0, difficulty: 'easy', coinsReward: 16},
  {id: 'lvl-005', order: 4, name: 'Quiet Path', rows: 5, cols: 4, ballStart: [0, 3], obstacleCount: 5, iceCount: 0, difficulty: 'easy', coinsReward: 18},
  {id: 'lvl-006', order: 5, name: 'Open Field', rows: 5, cols: 5, ballStart: [4, 0], obstacleCount: 5, iceCount: 0, difficulty: 'easy', coinsReward: 20},

  // Medium — order 6-15
  {id: 'lvl-007', order: 6, name: 'Boxed In', rows: 5, cols: 6, ballStart: [2, 0], obstacleCount: 6, iceCount: 0, difficulty: 'medium', coinsReward: 22},
  {id: 'lvl-008', order: 7, name: 'Diagonal Drift', rows: 6, cols: 6, ballStart: [0, 0], obstacleCount: 7, iceCount: 0, difficulty: 'medium', coinsReward: 25},
  {id: 'lvl-009', order: 8, name: 'Frozen Corner', rows: 6, cols: 6, ballStart: [0, 0], obstacleCount: 7, iceCount: 4, difficulty: 'medium', coinsReward: 28},
  {id: 'lvl-010', order: 9, name: 'Ice Run', rows: 6, cols: 7, ballStart: [0, 6], obstacleCount: 8, iceCount: 5, difficulty: 'medium', coinsReward: 31},
  {id: 'lvl-011', order: 10, name: 'Twin Paths', rows: 6, cols: 7, ballStart: [3, 0], obstacleCount: 8, iceCount: 0, difficulty: 'medium', coinsReward: 34},
  {id: 'lvl-012', order: 11, name: 'Snowy Trail', rows: 7, cols: 6, ballStart: [0, 0], obstacleCount: 8, iceCount: 5, difficulty: 'medium', coinsReward: 37},
  {id: 'lvl-013', order: 12, name: 'Winding Road', rows: 6, cols: 8, ballStart: [0, 4], obstacleCount: 9, iceCount: 0, difficulty: 'medium', coinsReward: 40},
  {id: 'lvl-014', order: 13, name: 'Cross Roads', rows: 7, cols: 7, ballStart: [3, 3], obstacleCount: 9, iceCount: 0, difficulty: 'medium', coinsReward: 43},
  {id: 'lvl-015', order: 14, name: 'Frost Bridge', rows: 6, cols: 7, ballStart: [5, 6], obstacleCount: 7, iceCount: 6, difficulty: 'medium', coinsReward: 46},
  {id: 'lvl-016', order: 15, name: 'Maze Runner', rows: 7, cols: 6, ballStart: [6, 0], obstacleCount: 9, iceCount: 0, difficulty: 'medium', coinsReward: 49},

  // Hard — order 16-24
  {id: 'lvl-017', order: 16, name: 'Split Path', rows: 7, cols: 7, ballStart: [3, 3], obstacleCount: 10, iceCount: 0, difficulty: 'hard', coinsReward: 52},
  {id: 'lvl-018', order: 17, name: 'Portal Jump', rows: 7, cols: 7, ballStart: [0, 0], obstacleCount: 9, iceCount: 0, portal: true, difficulty: 'hard', coinsReward: 56},
  {id: 'lvl-019', order: 18, name: 'Locked Vault', rows: 7, cols: 8, ballStart: [0, 0], obstacleCount: 10, iceCount: 0, locked: {count: 1, cost: 15}, difficulty: 'hard', coinsReward: 60},
  {id: 'lvl-020', order: 19, name: 'Twin Portals', rows: 7, cols: 8, ballStart: [0, 7], obstacleCount: 10, iceCount: 0, portal: true, difficulty: 'hard', coinsReward: 64},
  {id: 'lvl-021', order: 20, name: 'Ice Vault', rows: 8, cols: 7, ballStart: [0, 0], obstacleCount: 10, iceCount: 6, locked: {count: 1, cost: 18}, difficulty: 'hard', coinsReward: 68},
  {id: 'lvl-022', order: 21, name: 'Grand Split', rows: 8, cols: 8, ballStart: [4, 4], obstacleCount: 12, iceCount: 0, difficulty: 'hard', coinsReward: 72},
  {id: 'lvl-023', order: 22, name: 'Frozen Split', rows: 7, cols: 8, ballStart: [6, 7], obstacleCount: 10, iceCount: 6, difficulty: 'hard', coinsReward: 76},
  {id: 'lvl-024', order: 23, name: 'Deep Maze', rows: 8, cols: 7, ballStart: [7, 6], obstacleCount: 11, iceCount: 0, difficulty: 'hard', coinsReward: 80},
  {id: 'lvl-025', order: 24, name: 'Vault Runner', rows: 8, cols: 8, ballStart: [0, 7], obstacleCount: 11, iceCount: 0, locked: {count: 2, cost: 20}, difficulty: 'hard', coinsReward: 84},

  // Expert — order 25-29
  {id: 'lvl-026', order: 25, name: 'Glacier Maze', rows: 8, cols: 8, ballStart: [0, 0], obstacleCount: 12, iceCount: 6, difficulty: 'expert', coinsReward: 90},
  {id: 'lvl-027', order: 26, name: 'Grand Vault', rows: 8, cols: 8, ballStart: [4, 4], obstacleCount: 11, iceCount: 0, portal: true, locked: {count: 2, cost: 25}, difficulty: 'expert', coinsReward: 100},
  {id: 'lvl-028', order: 27, name: 'Portal Glacier', rows: 8, cols: 9, ballStart: [0, 0], obstacleCount: 13, iceCount: 7, portal: true, difficulty: 'expert', coinsReward: 110},
  {id: 'lvl-029', order: 28, name: 'Vault of Ice', rows: 9, cols: 8, ballStart: [8, 7], obstacleCount: 10, iceCount: 5, locked: {count: 1, cost: 22}, difficulty: 'expert', coinsReward: 120},
  {id: 'lvl-030', order: 29, name: "Master's Trial", rows: 9, cols: 9, ballStart: [4, 4], obstacleCount: 12, iceCount: 6, portal: true, difficulty: 'expert', coinsReward: 130},

  // Second half — order 30-59. A fresh ramp (medium → hard → expert) so
  // players finishing "Master's Trial" get a gentle re-entry, then climb.
  // Medium — order 30-32
  {id: 'lvl-031', order: 30, name: 'Fresh Coat', rows: 6, cols: 6, ballStart: [0, 0], obstacleCount: 7, iceCount: 0, difficulty: 'medium', coinsReward: 52},
  {id: 'lvl-032', order: 31, name: 'Side Step', rows: 6, cols: 7, ballStart: [0, 6], obstacleCount: 8, iceCount: 3, difficulty: 'medium', coinsReward: 55},
  {id: 'lvl-033', order: 32, name: 'Slick Alley', rows: 7, cols: 6, ballStart: [6, 0], obstacleCount: 8, iceCount: 5, difficulty: 'medium', coinsReward: 58},

  // Hard — order 33-44
  {id: 'lvl-034', order: 33, name: 'Warp Lane', rows: 7, cols: 7, ballStart: [0, 0], obstacleCount: 8, iceCount: 0, portal: true, difficulty: 'hard', coinsReward: 60},
  {id: 'lvl-035', order: 34, name: 'Ice Lane', rows: 7, cols: 8, ballStart: [0, 0], obstacleCount: 10, iceCount: 7, difficulty: 'hard', coinsReward: 63},
  {id: 'lvl-036', order: 35, name: 'Vault Door', rows: 7, cols: 7, ballStart: [6, 6], obstacleCount: 9, iceCount: 0, locked: {count: 1, cost: 15}, difficulty: 'hard', coinsReward: 66},
  {id: 'lvl-037', order: 36, name: 'Echo Chamber', rows: 8, cols: 7, ballStart: [0, 0], obstacleCount: 11, iceCount: 0, portal: true, difficulty: 'hard', coinsReward: 69},
  {id: 'lvl-038', order: 37, name: 'Slide Show', rows: 8, cols: 8, ballStart: [0, 7], obstacleCount: 11, iceCount: 8, difficulty: 'hard', coinsReward: 72},
  {id: 'lvl-039', order: 38, name: 'Lockdown', rows: 7, cols: 8, ballStart: [3, 0], obstacleCount: 10, iceCount: 0, locked: {count: 2, cost: 18}, difficulty: 'hard', coinsReward: 75},
  {id: 'lvl-040', order: 39, name: 'Mirror Maze', rows: 8, cols: 8, ballStart: [7, 0], obstacleCount: 12, iceCount: 0, difficulty: 'hard', coinsReward: 78},
  {id: 'lvl-041', order: 40, name: 'Warp Frost', rows: 7, cols: 8, ballStart: [0, 0], obstacleCount: 9, iceCount: 6, portal: true, difficulty: 'hard', coinsReward: 81},
  {id: 'lvl-042', order: 41, name: 'Ice Keep', rows: 8, cols: 7, ballStart: [7, 6], obstacleCount: 10, iceCount: 6, locked: {count: 1, cost: 20}, difficulty: 'hard', coinsReward: 84},
  {id: 'lvl-043', order: 42, name: 'Crosswind', rows: 8, cols: 8, ballStart: [4, 4], obstacleCount: 12, iceCount: 5, difficulty: 'hard', coinsReward: 87},
  {id: 'lvl-044', order: 43, name: 'Twin Gate', rows: 8, cols: 8, ballStart: [0, 0], obstacleCount: 10, iceCount: 0, portal: true, locked: {count: 1, cost: 20}, difficulty: 'hard', coinsReward: 90},
  {id: 'lvl-045', order: 44, name: 'Cold Storage', rows: 8, cols: 8, ballStart: [7, 7], obstacleCount: 11, iceCount: 7, locked: {count: 2, cost: 22}, difficulty: 'hard', coinsReward: 93},

  // Expert — order 45-59
  {id: 'lvl-046', order: 45, name: 'Glass Floor', rows: 8, cols: 9, ballStart: [0, 0], obstacleCount: 12, iceCount: 8, difficulty: 'expert', coinsReward: 100},
  {id: 'lvl-047', order: 46, name: 'Portal Plains', rows: 9, cols: 8, ballStart: [8, 0], obstacleCount: 11, iceCount: 0, portal: true, difficulty: 'expert', coinsReward: 104},
  {id: 'lvl-048', order: 47, name: 'Vault Maze', rows: 8, cols: 9, ballStart: [0, 8], obstacleCount: 12, iceCount: 0, locked: {count: 2, cost: 24}, difficulty: 'expert', coinsReward: 108},
  {id: 'lvl-049', order: 48, name: 'Polar Express', rows: 9, cols: 8, ballStart: [4, 0], obstacleCount: 11, iceCount: 8, portal: true, difficulty: 'expert', coinsReward: 112},
  {id: 'lvl-050', order: 49, name: 'Half Century', rows: 9, cols: 9, ballStart: [0, 0], obstacleCount: 12, iceCount: 5, difficulty: 'expert', coinsReward: 116},
  {id: 'lvl-051', order: 50, name: 'Gatekeeper', rows: 9, cols: 8, ballStart: [0, 7], obstacleCount: 12, iceCount: 0, portal: true, locked: {count: 2, cost: 25}, difficulty: 'expert', coinsReward: 120},
  {id: 'lvl-052', order: 51, name: 'Frozen Vault', rows: 8, cols: 9, ballStart: [7, 8], obstacleCount: 11, iceCount: 7, locked: {count: 2, cost: 26}, difficulty: 'expert', coinsReward: 124},
  {id: 'lvl-053', order: 52, name: 'Spiral Out', rows: 9, cols: 9, ballStart: [4, 4], obstacleCount: 13, iceCount: 0, difficulty: 'expert', coinsReward: 128},
  {id: 'lvl-054', order: 53, name: 'Aurora', rows: 9, cols: 9, ballStart: [0, 8], obstacleCount: 11, iceCount: 8, portal: true, difficulty: 'expert', coinsReward: 132},
  {id: 'lvl-055', order: 54, name: 'Deep Freeze', rows: 9, cols: 9, ballStart: [8, 0], obstacleCount: 12, iceCount: 9, difficulty: 'expert', coinsReward: 136},
  {id: 'lvl-056', order: 55, name: 'Double Lock', rows: 9, cols: 8, ballStart: [0, 0], obstacleCount: 11, iceCount: 0, portal: true, locked: {count: 3, cost: 24}, difficulty: 'expert', coinsReward: 140},
  {id: 'lvl-057', order: 56, name: 'Whiteout', rows: 9, cols: 9, ballStart: [4, 4], obstacleCount: 12, iceCount: 8, locked: {count: 2, cost: 28}, difficulty: 'expert', coinsReward: 145},
  {id: 'lvl-058', order: 57, name: 'Warp Core', rows: 9, cols: 9, ballStart: [8, 8], obstacleCount: 12, iceCount: 5, portal: true, difficulty: 'expert', coinsReward: 150},
  {id: 'lvl-059', order: 58, name: 'Final Exam', rows: 9, cols: 9, ballStart: [0, 0], obstacleCount: 13, iceCount: 7, portal: true, locked: {count: 2, cost: 30}, difficulty: 'expert', coinsReward: 160},
  {id: 'lvl-060', order: 59, name: 'Grand Master', rows: 9, cols: 9, ballStart: [4, 4], obstacleCount: 12, iceCount: 8, portal: true, locked: {count: 2, cost: 30}, difficulty: 'expert', coinsReward: 180},
];

const outPath = path.join(__dirname, '..', 'src', 'assets', 'levels', 'pack-01.json');
const regenerateAll = process.argv.includes('--regenerate');

// By default, levels already in pack-01.json are kept byte-for-byte: they
// are live in the store and players have stars/progress recorded against
// them, so re-rolling their random layouts would silently change them.
// Only specs missing from the file get generated. Pass --regenerate to
// rebuild every level from scratch (dev use only, before first release).
const existingLevels =
  !regenerateAll && fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')).levels : [];
const existingById = new Map(existingLevels.map(l => [l.id, l]));

// --retune-from=N recomputes star thresholds + time limit (from the true
// optimal solution) for already-generated levels with order >= N, leaving
// their layouts untouched. Levels below N stay exactly as they are.
const retuneArg = process.argv.find(a => a.startsWith('--retune-from='));
const retuneFrom = retuneArg ? Number(retuneArg.split('=')[1]) : null;

function retuneLevel(level) {
  const maxStates = Math.max(60000, level.rows * level.cols * 4000);
  const {solvable, minMoves} = verifySolvable(
    level.tiles, level.rows, level.cols, [level.ballStart.row, level.ballStart.col], maxStates * 20,
  );
  if (solvable !== true) throw new Error(`${level.id}: could not confirm solvable while retuning`);
  const tuned = {...level, ...tuneForOptimum(minMoves, level.difficulty)};
  console.log(`${level.id}: optimal ${minMoves} moves -> stars ${tuned.starThresholds.join('/')}, ${tuned.parTimeSeconds}s`);
  return tuned;
}

const levels = specs.map(spec => {
  const existing = existingById.get(spec.id);
  if (!existing) return makeLevel(spec);
  return retuneFrom !== null && existing.order >= retuneFrom ? retuneLevel(existing) : existing;
});

const pack = {packId: 'pack-01', packName: 'Origins', levels};
fs.writeFileSync(outPath, JSON.stringify(pack, null, 2));
console.log(
  `\nWrote ${outPath} with ${levels.length} guaranteed-solvable levels ` +
    `(${levels.length - existingById.size} new, ${existingById.size} kept)`,
);
