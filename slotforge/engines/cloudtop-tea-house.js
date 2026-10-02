/* KOJI'S CLOUDTOP TEA HOUSE. Self-contained pure engine (SlotForge ENGINE-API v1). Spec: plans/cloudtop-tea-house/00-concept.md (Features & Math),
 * round JSON: plans/cloudtop-tea-house/01-round-format.md. No imports except 'crypto'. No Math.random, no clock. Money = multiples of the base bet.
 *
 * Rules fixed here where the concept left room (all covered by tools/cloudtop.test.js):
 *  - Grid 4 rows x 5 reels, one uniform draw per cell in row-major order: u < coinP -> Tea Tin; else weighted symbol (wild only on reels 2-4).
 *  - Bundles (id 9) flip ALL together into ONE pay symbol 0..7 (CFG.flipW). A Tin is a blank in line evaluation. Wild never starts a line (no wild on reel 1).
 *  - Trigger: >= 6 tins on the opening grid. Base line wins AND the bonus both pay.
 *  - Tin Rush: lock step (spins[0], spinsLeft 3) = the trigger tins get values; then respins. Respin: every empty cell becomes a tin with prob q
 *    (row-major draw order); >=1 new tin resets respins to 3, else -1. Ends at 0 left, a full board, the cap, or maxRespins.
 *  - Tin kinds (one draw per new tin): collector / mini / minor / major / plain value. Collector value = collectorBase + sum of every tin value on the
 *    board when it lands (tins placed earlier in the same step included, later ones not, doubling of this step not yet applied). Once, at landing.
 *  - Kite Launch: at the END of a step (after all new tins are placed) every row that is now complete and was not yet launched doubles all its tins once
 *    (jackpot tins and the collector included). Rows are processed top to bottom.
 *  - Grand Dragon Kite: all 20 cells filled -> board total + grandBonus. The step delta includes the bonus.
 *  - Per-step totalPayout = increase of (board total + grand) caused by this step, so sum(spins) = final payout. Cap: playing stops at the first step that
 *    reaches the remaining cap; bonus.totalPayout = min(cap, sum).
 *  - Bought round: trigger spin = natural tin-count distribution conditioned on >= 6 (rejection on the same Binomial), no bundles, no wilds, no line wins; payout 0.
 */
import crypto from 'crypto';

export const id = 'cloudtop-tea-house';
export const name = "Koji's Cloudtop Tea House";

const ROWS = 4, COLS = 5, CELLS = 20, WILD = 8, BUNDLE = 9, TIN = 10;
export const SYMBOLS = ['Dango', 'Onigiri', 'Paper Fan', 'Paper Lantern', 'Plum Blossom', 'Iron Teapot', 'Lucky Cat', 'Golden Koi', 'Smiling Kite', 'Furoshiki Bundle', 'Tea Tin']
  .map((n, i) => ({ id: i, name: n }));
/* 30 fixed paylines: LINES[l][c] = row on reel c */
export const LINES = [
  [0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[3,3,3,3,3],
  [0,1,2,1,0],[1,2,3,2,1],[3,2,1,2,3],[2,1,0,1,2],
  [0,0,1,0,0],[1,1,2,1,1],[2,2,3,2,2],[3,3,2,3,3],[2,2,1,2,2],[1,1,0,1,1],
  [0,1,1,1,0],[1,2,2,2,1],[2,3,3,3,2],[3,2,2,2,3],[2,1,1,1,2],[1,0,0,0,1],
  [0,1,0,1,0],[1,2,1,2,1],[2,3,2,3,2],[3,2,3,2,3],[2,1,2,1,2],[1,0,1,0,1],
  [0,0,1,2,3],[3,3,2,1,0],[1,0,0,1,2],[2,3,3,2,1]
];

export const CFG = {
  rows: ROWS, reels: COLS, lines: 30,
  bets: [0.1,0.2,0.3,0.4,0.5,0.6,0.8,1,1.5,2,2.5,3,4,5,6,8,10,12,15,20,25,30,40,50,60,80,100,150,200,250,300,400,500,750,1000,1500,2000,3000,4000,5000,7500,10000],
  maxWin: 5000,
  buy: { tin: { cost: 60 } },
  // base game
  coinP: 0.09,
  triggerTins: 6,
  symW: [10, 10, 10, 10, 10, 10, 10, 10],     // pay symbols 0..7
  wildW: 1, bundleW: 3,                       // wild only reels 2-4
  flipW: [16, 15, 14, 11, 10, 9, 6, 4],       // what a bundle can flip into (pay symbols only)
  pay: [[0.35, 1.0, 3], [0.35, 1.2, 3.5], [0.45, 1.4, 4.5], [0.7, 2.5, 8], [0.9, 3, 10.5], [1.1, 4, 16], [1.3, 5.3, 22], [2.2, 9, 44]],
  payScale: 1,
  // Tin Rush
  startRespins: 3,
  q: 0.0732,
  maxRespins: 60,
  valueW: [[1, 45], [2, 25], [3, 12], [5, 8], [8, 4], [15, 2], [40, 0.6]],
  collectorP: 0.012, collectorBase: 2,
  miniP: 0.004, minorP: 0.0015, majorP: 0.0003,
  jackpots: { mini: 10, minor: 25, major: 250 },
  grandBonus: 500
};

const pickW = (rng, tbl) => { let t = 0; for (const e of tbl) t += e[1]; let u = rng() * t; for (const e of tbl) { u -= e[1]; if (u < 0) return e[0]; } return tbl[tbl.length - 1][0]; };
const drawIdx = (rng, w, tot) => { let u = rng() * tot; for (let i = 0; i < w.length; i++) { u -= w[i]; if (u < 0) return i; } return w.length - 1; };
const sum = a => a.reduce((x, y) => x + y, 0);
const emptyGrid = () => Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

/* One cell of the opening grid (no tin draw): weighted symbol for reel c. */
function drawCell(rng, c, noSpecial) {
  const w = CFG.symW, wild = !noSpecial && c >= 1 && c <= 3 ? CFG.wildW : 0, bun = noSpecial ? 0 : CFG.bundleW;
  const tot = sum(w) + wild + bun; let u = rng() * tot;
  for (let i = 0; i < w.length; i++) { u -= w[i]; if (u < 0) return i; }
  u -= 0; if (wild && (u -= wild) < 0) return WILD;
  return bun ? BUNDLE : w.length - 1;
}

/* Line evaluation on a grid WITHOUT bundles. Tin (10) and bundle (9) are blanks. Returns { total, wins:[{line,sym,len,mult,payout,cells}] }. */
export function evaluateLines(grid) {
  const wins = []; let total = 0;
  for (let l = 0; l < LINES.length; l++) {
    const L = LINES[l], s = grid[L[0]][0];
    if (s > 7) continue;                       // wild cannot be on reel 1; tin/bundle are blanks
    let len = 1;
    while (len < COLS) { const x = grid[L[len]][len]; if (x === s || x === WILD) len++; else break; }
    if (len < 3) continue;
    const mult = CFG.pay[s][len - 3] * CFG.payScale;
    if (!(mult > 0)) continue;
    wins.push({ line: l, sym: s, len, mult, payout: mult, cells: L.slice(0, len).map((r, c) => [r, c]) });
    total += mult;
  }
  return { total, wins };
}

/* ---------- Tin Rush ---------- */
function newTin(rng, r, c, board) {
  const u = rng(), J = CFG.jackpots;
  let t = CFG.collectorP;
  if (u < t) { const collected = sumBoard(board); return { r, c, kind: 'collector', value: CFG.collectorBase + collected, collected }; }
  if (u < (t += CFG.miniP)) return { r, c, kind: 'mini', value: J.mini };
  if (u < (t += CFG.minorP)) return { r, c, kind: 'minor', value: J.minor };
  if (u < (t += CFG.majorP)) return { r, c, kind: 'major', value: J.major };
  return { r, c, kind: 'value', value: pickW(rng, CFG.valueW) };
}
const sumBoard = board => { let s = 0; for (const row of board) for (const t of row) if (t) s += t.value; return s; };

/* Apply one step: place `cells` (row-major list of [r,c]) as new tins, then Kite Launches. Mutates board/done. Returns the step (without index fields). */
function applyStep(rng, board, launched, cells) {
  const newTins = [];
  for (const [r, c] of cells) { const t = newTin(rng, r, c, board); board[r][c] = { ...t }; newTins.push(t); }
  const kite = [];
  for (let r = 0; r < ROWS; r++) {
    if (launched[r] || !board[r].every(Boolean)) continue;
    launched[r] = true;
    const before = board[r].map(t => t.value);
    for (const t of board[r]) t.value *= 2;
    kite.push({ row: r, before, after: board[r].map(t => t.value), gain: sum(before) });
  }
  return { newTins, kite };
}

/* The Tin Rush. startCells = trigger tin positions [[r,c]...]. capLeft = remaining cap for the bonus. Returns { spins, total (uncapped sum), capped }. */
function playRush(rng, startCells, capLeft) {
  const board = Array.from({ length: ROWS }, () => new Array(COLS).fill(null)), launched = [false, false, false, false];
  const spins = []; let prevTotal = 0, spinsLeft = CFG.startRespins, capped = false, full = false, respins = 0;
  const finish = (step, kind) => {
    const bt = sumBoard(board), isFull = board.every(row => row.every(Boolean));
    let grand = null, payTotal = bt;
    if (isFull) { grand = { bonus: CFG.grandBonus, cells: CELLS }; payTotal += CFG.grandBonus; full = true; }
    const delta = payTotal - prevTotal; prevTotal = payTotal;
    const reached = payTotal >= capLeft;
    if (isFull || reached) { capped = reached; if (isFull) spinsLeft = 0; }
    spins.push({ spinIndex: spins.length + 1, kind, spinsLeft, reset: kind === 'respin' ? step.reset : false, newTins: step.newTins, kite: step.kite, grand,
      boardTotal: bt, totalPayout: delta });
    return isFull || reached;
  };
  let st = applyStep(rng, board, launched, startCells);
  if (finish(st, 'lock')) return { spins, total: prevTotal, capped };
  while (spinsLeft > 0 && respins < CFG.maxRespins) {
    respins++;
    const cells = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!board[r][c] && rng() < CFG.q) cells.push([r, c]);
    if (cells.length) { st = applyStep(rng, board, launched, cells); st.reset = true; spinsLeft = CFG.startRespins; }
    else { st = { newTins: [], kite: [], reset: false }; spinsLeft--; }
    if (finish(st, 'respin')) break;
  }
  return { spins, total: prevTotal, capped };
}

/* bonus-only helper for tools: bonus value with a conditioned start (same as a bought round, uncapped by the base) */
export function bonusOnly(rng) { return Math.min(CFG.maxWin, playRush(rng, startTins(rng), CFG.maxWin).total); }

function startTins(rng) {   // natural tin-count distribution conditioned on >= triggerTins, positions uniform
  let n;
  for (;;) { n = 0; for (let i = 0; i < CELLS; i++) if (rng() < CFG.coinP) n++; if (n >= CFG.triggerTins) break; }
  const all = []; for (let i = 0; i < CELLS; i++) all.push(i);
  for (let k = 0; k < n; k++) { const j = k + Math.floor(rng() * (CELLS - k)); const t = all[k]; all[k] = all[j]; all[j] = t; }
  return all.slice(0, n).sort((a, b) => a - b).map(i => [Math.floor(i / COLS), i % COLS]);
}

const bonusObj = (b, total) => ({ startSpins: CFG.startRespins, totalPayout: total, spins: b.spins });

export function playRound(rng, { buy = null } = {}) {
  const maxWin = CFG.maxWin;
  if (buy) {
    const bc = CFG.buy[buy]; if (!bc) throw new Error('unknown buy ' + buy);
    const cells = startTins(rng); let grid;
    const isT = new Set(cells.map(([r, c]) => r * COLS + c));
    for (let tries = 0; tries < 1000; tries++) {   // no line wins on the trigger spin (rejection; tins are blanks)
      grid = emptyGrid();
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c] = isT.has(r * COLS + c) ? TIN : drawCell(rng, c, true);
      if (evaluateLines(grid).total === 0) break;
    }
    const b = playRush(rng, cells, maxWin), total = Math.min(maxWin, b.total);
    return { v: 1, cost: bc.cost, bought: buy, initialGrid: grid, cascadeSteps: [], tins: { count: cells.length, cells }, basePayout: 0,
      bonusTriggered: true, bonus: bonusObj(b, total), totalPayout: total, capped: b.capped || total >= maxWin };
  }
  const grid = emptyGrid(), tinCells = [], bundleCells = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (rng() < CFG.coinP) { grid[r][c] = TIN; tinCells.push([r, c]); } else { const s = drawCell(rng, c, false); grid[r][c] = s; if (s === BUNDLE) bundleCells.push([r, c]); }
  }
  const initialGrid = grid.map(r => r.slice());
  const step = { grid: grid.map(r => r.slice()), bundle: null, wins: [], payout: 0 };
  if (bundleCells.length) {
    const flipTo = drawIdx(rng, CFG.flipW, sum(CFG.flipW));
    for (const [r, c] of bundleCells) step.grid[r][c] = flipTo;
    step.bundle = { cells: bundleCells, flipTo };
  }
  const ev = evaluateLines(step.grid); step.wins = ev.wins; step.payout = ev.total;
  const base = Math.min(maxWin, ev.total);
  const round = { v: 1, cost: 1, bought: null, initialGrid, cascadeSteps: [step], tins: { count: tinCells.length, cells: tinCells }, basePayout: base,
    bonusTriggered: false, bonus: null, totalPayout: base, capped: false };
  if (ev.total >= maxWin) { round.capped = true; return round; }
  if (tinCells.length >= CFG.triggerTins) {
    const b = playRush(rng, tinCells, maxWin - base), total = Math.min(maxWin - base, b.total);
    round.bonusTriggered = true; round.bonus = bonusObj(b, total);
    round.totalPayout = Math.min(maxWin, base + total); round.capped = b.capped || round.totalPayout >= maxWin;
  }
  return round;
}

export function info() {
  return { lines: LINES, paytable: CFG.pay.map((p, i) => ({ id: i, name: SYMBOLS[i].name, pays: { 3: p[0] * CFG.payScale, 4: p[1] * CFG.payScale, 5: p[2] * CFG.payScale } })),
    symbols: SYMBOLS, wild: WILD, bundle: BUNDLE, tin: TIN, triggerTins: CFG.triggerTins, startRespins: CFG.startRespins, jackpots: CFG.jackpots,
    grandBonus: CFG.grandBonus, maxWin: CFG.maxWin, buy: CFG.buy };
}

export function cryptoRng() { return crypto.randomBytes(6).readUIntBE(0, 6) / 281474976710656; }
