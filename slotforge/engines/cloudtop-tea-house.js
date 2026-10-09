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

const ROWS = 4, COLS = 5, CELLS = 20, WILD = 8, BUNDLE = 9, TIN = 10, FS = 16;   // 11..15 are art-only ids (11 = Collector kettle); 16 = FS scatter
export const SYMBOLS = ['Dango', 'Onigiri', 'Paper Fan', 'Paper Lantern', 'Plum Blossom', 'Iron Teapot', 'Lucky Cat', 'Golden Koi', 'Smiling Kite', 'Furoshiki Bundle', 'Tea Tin']
  .map((n, i) => ({ id: i, name: n })).concat([{ id: FS, name: 'FS Scatter' }]);
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
  buy: { tin: { cost: 60 }, fs: { cost: 21 }, super: { cost: 75 } },
  // base game
  coinP: 0.09,
  anteCost: 3,                                // FS LUCK (bet-up): every spin costs 3x, the FS drums land far more often and Tin Rush cannot trigger (Free Spins only)
  anteFsP: 0.04935,                            // FS scatter per cell in FS LUCK (3x, no tin): tuned with tools/sim.js so the mode returns ~96.2%
  fsP: 0.018,                                 // FS scatter, per cell, all reels; rolled AFTER the tin test with the SAME draw (tin odds never move)
  triggerTins: 6,
  symW: [10, 10, 10, 10, 10, 10, 10, 10],     // pay symbols 0..7
  wildW: 1, bundleW: 3,                       // wild only reels 2-4
  flipW: [16, 15, 14, 11, 10, 9, 6, 4],       // what a bundle can flip into (pay symbols only)
  pay: [[0.35, 1.0, 3], [0.35, 1.2, 3.5], [0.45, 1.4, 4.5], [0.7, 2.5, 8], [0.9, 3, 10.5], [1.1, 4, 16], [1.3, 5.3, 22], [2.2, 9, 44]],
  payScale: 0.835,
  // Tin Rush
  startRespins: 3,
  q: 0.0732,
  maxRespins: 60,
  valueW: [[1, 45], [2, 25], [3, 12], [5, 8], [8, 4], [15, 2], [40, 0.6]],
  collectorP: 0.012, collectorBase: 2,
  miniP: 0.004, minorP: 0.0015, majorP: 0.0003,
  jackpots: { mini: 10, minor: 25, major: 250 },
  grandBonus: 500,
  // Free Spins / Super Free Spins (Steeping Drawers). boost[level] = extra multiplier points of a drawer at that level.
  fsPBonus: 0.026,                            // FS scatter per cell inside the bonuses (retrigger); no tins there
  fs:    { spins: 10, maxLevel: 3, boost: [0, 1, 2, 4],     wildW: 1.9, retrig: { 3: 4, 4: 7, 5: 10 },  maxSpins: 40 },
  super: { spins: 12, spins5: 16, maxLevel: 4, boost: [0, 1, 3, 5, 8], wildW: 2.86, retrig: { 3: 5, 4: 8, 5: 12 }, maxSpins: 50, preSteep: 4, preLevel: 2 }
};

const pickW = (rng, tbl) => { let t = 0; for (const e of tbl) t += e[1]; let u = rng() * t; for (const e of tbl) { u -= e[1]; if (u < 0) return e[0]; } return tbl[tbl.length - 1][0]; };
const drawIdx = (rng, w, tot) => { let u = rng() * tot; for (let i = 0; i < w.length; i++) { u -= w[i]; if (u < 0) return i; } return w.length - 1; };
const sum = a => a.reduce((x, y) => x + y, 0);
const emptyGrid = () => Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

/* One cell of the opening grid (no tin draw): weighted symbol for reel c. */
function drawCell(rng, c, noSpecial, wildW = CFG.wildW) {
  const w = CFG.symW, wild = !noSpecial && c >= 1 && c <= 3 ? wildW : 0, bun = noSpecial ? 0 : CFG.bundleW;
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

/* bonus-only helper for tools: bonus value with a conditioned start (same as a bought round, uncapped by the base). type: 'tin' | 'fs' | 'super' */
export function bonusOnly(rng, type = 'tin') {
  if (type === 'tin') return Math.min(CFG.maxWin, playRush(rng, startTins(rng), CFG.maxWin).total);
  const n = type === 'fs' ? 3 : superCount(rng);
  return Math.min(CFG.maxWin, playSteep(rng, n === 3 ? 'fs' : 'super', n, CFG.maxWin).total);
}

/* ---------- Free Spins / Super Free Spins: Steeping Drawers ---------- */
/* Line evaluation with drawer levels: each winning line pays mult * (1 + sum of boost[level] of the cells that formed it). Grid has no bundles. */
export function evaluateSteep(grid, levels, boost) {
  const wins = []; let total = 0;
  for (let l = 0; l < LINES.length; l++) {
    const L = LINES[l], s = grid[L[0]][0];
    if (s > 7) continue;
    let len = 1;
    while (len < COLS) { const x = grid[L[len]][len]; if (x === s || x === WILD) len++; else break; }
    if (len < 3) continue;
    const mult = CFG.pay[s][len - 3] * CFG.payScale;
    if (!(mult > 0)) continue;
    const cells = L.slice(0, len).map((r, c) => [r, c]);
    let b = 0; for (const [r, c] of cells) b += boost[levels[r][c]];
    const payout = mult * (1 + b);
    wins.push({ line: l, sym: s, len, mult, boost: b, payout, cells });
    total += payout;
  }
  return { total, wins };
}

/* FS count of a natural SUPER trigger: Binomial(20, fsP) conditioned on >= 4 (inverse CDF, one draw). */
function superCount(rng) {
  const p = CFG.fsP, w = []; let tot = 0, comb = 1;
  for (let k = 1; k <= 4; k++) comb = comb * (CELLS - k + 1) / k;     // C(20,4)
  for (let k = 4; k <= CELLS; k++) { const v = comb * p ** k * (1 - p) ** (CELLS - k); w.push(v); tot += v; comb = comb * (CELLS - k) / (k + 1); }
  let u = rng() * tot;
  for (let i = 0; i < w.length; i++) { u -= w[i]; if (u < 0) return 4 + i; }
  return 4;
}

/* The bonus. type 'fs' | 'super'; n = FS count on the trigger grid (5+ in super = 16 spins). capLeft = remaining cap. Returns { spins, total (uncapped sum), capped, info } */
function playSteep(rng, type, n, capLeft) {
  const T = CFG[type], levels = Array.from({ length: ROWS }, () => new Array(COLS).fill(0)), preSteep = [];
  if (type === 'super') {
    const all = []; for (let i = 0; i < CELLS; i++) all.push(i);
    for (let k = 0; k < T.preSteep; k++) { const j = k + Math.floor(rng() * (CELLS - k)); const t = all[k]; all[k] = all[j]; all[j] = t; }
    for (const i of all.slice(0, T.preSteep).sort((a, b) => a - b)) { const r = Math.floor(i / COLS), c = i % COLS; levels[r][c] = T.preLevel; preSteep.push({ r, c, level: T.preLevel }); }
  }
  const startSpins = type === 'super' && n >= 5 ? T.spins5 : T.spins;
  let left = startSpins, awarded = startSpins, run = 0, capped = false, extra = 0;
  const spins = [];
  while (left > 0) {
    left--;
    const landed = emptyGrid(), fsCells = [], bundleCells = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (rng() < CFG.fsPBonus) { landed[r][c] = FS; fsCells.push([r, c]); }
      else { const s = drawCell(rng, c, false, T.wildW); landed[r][c] = s; if (s === BUNDLE) bundleCells.push([r, c]); }
    }
    const grid = landed.map(r => r.slice()); let bundle = null;
    if (bundleCells.length) { const flipTo = drawIdx(rng, CFG.flipW, sum(CFG.flipW)); for (const [r, c] of bundleCells) grid[r][c] = flipTo; bundle = { cells: bundleCells, flipTo }; }
    const before = levels.map(r => r.slice()), ev = evaluateSteep(grid, levels, T.boost);
    const hit = new Set(); for (const w of ev.wins) for (const [r, c] of w.cells) hit.add(r * COLS + c);
    const levelUps = [];
    for (const i of [...hit].sort((a, b) => a - b)) {
      const r = Math.floor(i / COLS), c = i % COLS;
      if (levels[r][c] < T.maxLevel) { levelUps.push({ r, c, from: levels[r][c], to: levels[r][c] + 1, popKite: levels[r][c] + 1 === T.maxLevel }); levels[r][c]++; }
    }
    let add = 0;
    if (fsCells.length >= 3) add = Math.max(0, Math.min(T.retrig[Math.min(5, fsCells.length)], T.maxSpins - awarded));
    awarded += add; extra += add; left += add;
    const room = capLeft - run, pay = Math.min(ev.total, room); run += pay;
    const hitCap = ev.total >= room - 1e-12;
    if (hitCap) { capped = true; left = 0; }
    const item = { spinIndex: spins.length + 1, spinsLeft: left, landed, grid, bundle, wins: ev.wins, levels: before, levelUps, fsCount: fsCells.length, fsCells };
    if (add) item.retrigger = add;
    item.payout = ev.total; item.totalPayout = pay; item.runningTotal = run;
    spins.push(item);
  }
  return { spins, total: run, capped, info: { type, startSpins, preSteep, extraSpinsTotal: extra, maxLevel: T.maxLevel, boost: T.boost.slice() } };
}

const fsBonusObj = (b, total) => ({ type: b.info.type, startSpins: b.info.startSpins, preSteep: b.info.preSteep, extraSpinsTotal: b.info.extraSpinsTotal,
  maxLevel: b.info.maxLevel, boost: b.info.boost, totalPayout: total, spins: b.spins });

function fsStart(rng, n) {   // n FS cells at uniform positions
  const all = []; for (let i = 0; i < CELLS; i++) all.push(i);
  for (let k = 0; k < n; k++) { const j = k + Math.floor(rng() * (CELLS - k)); const t = all[k]; all[k] = all[j]; all[j] = t; }
  return all.slice(0, n).sort((a, b) => a - b).map(i => [Math.floor(i / COLS), i % COLS]);
}

function startTins(rng) {   // natural tin-count distribution conditioned on >= triggerTins, positions uniform
  let n;
  for (;;) { n = 0; for (let i = 0; i < CELLS; i++) if (rng() < CFG.coinP) n++; if (n >= CFG.triggerTins) break; }
  const all = []; for (let i = 0; i < CELLS; i++) all.push(i);
  for (let k = 0; k < n; k++) { const j = k + Math.floor(rng() * (CELLS - k)); const t = all[k]; all[k] = all[j]; all[j] = t; }
  return all.slice(0, n).sort((a, b) => a - b).map(i => [Math.floor(i / COLS), i % COLS]);
}

const bonusObj = (b, total) => ({ startSpins: CFG.startRespins, totalPayout: total, spins: b.spins });

export function playRound(rng, { buy = null, ante = false } = {}) {
  const maxWin = CFG.maxWin, fsPHere = ante ? CFG.anteFsP : CFG.fsP, coinHere = ante ? 0 : CFG.coinP;   // FS LUCK: no tin coins at all
  if (buy) {
    const bc = CFG.buy[buy]; if (!bc) throw new Error('unknown buy ' + buy);
    const fsBuy = buy === 'fs' || buy === 'super', n = buy === 'fs' ? 3 : buy === 'super' ? superCount(rng) : 0;
    const cells = fsBuy ? fsStart(rng, n) : startTins(rng); let grid;
    const isT = new Set(cells.map(([r, c]) => r * COLS + c)), mark = fsBuy ? FS : TIN;
    for (let tries = 0; tries < 1000; tries++) {   // no line wins on the trigger spin (rejection; tins and FS are blanks)
      grid = emptyGrid();
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c] = isT.has(r * COLS + c) ? mark : drawCell(rng, c, true);
      if (evaluateLines(grid).total === 0) break;
    }
    const noTins = { count: 0, cells: [] };
    if (fsBuy) {
      const b = playSteep(rng, buy, n, maxWin), total = Math.min(maxWin, b.total);
      return { v: 1, cost: bc.cost, bought: buy, bonusType: buy, initialGrid: grid, cascadeSteps: [], tins: noTins, fsScatter: { count: n, cells, suppressed: 0 }, basePayout: 0,
        bonusTriggered: true, bonus: fsBonusObj(b, total), totalPayout: total, capped: b.capped || total >= maxWin };
    }
    const b = playRush(rng, cells, maxWin), total = Math.min(maxWin, b.total);
    return { v: 1, cost: bc.cost, bought: buy, bonusType: 'tin', initialGrid: grid, cascadeSteps: [], tins: { count: cells.length, cells }, fsScatter: { count: 0, cells: [], suppressed: 0 }, basePayout: 0,
      bonusTriggered: true, bonus: bonusObj(b, total), totalPayout: total, capped: b.capped || total >= maxWin };
  }
  const grid = emptyGrid(), tinCells = [], bundleCells = []; let fsCells = [], suppressed = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const u = rng();
    if (u < coinHere) { grid[r][c] = TIN; tinCells.push([r, c]); }
    else if (u < coinHere + fsPHere) { grid[r][c] = FS; fsCells.push([r, c]); }
    else grid[r][c] = drawCell(rng, c, false);
  }
  if (tinCells.length >= CFG.triggerTins && fsCells.length >= 3) {   // priority rule: Tin Rush wins, FS cells become ordinary symbols before output
    suppressed = fsCells.length;
    for (const [r, c] of fsCells) grid[r][c] = drawCell(rng, c, false);
    fsCells = [];
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c] === BUNDLE) bundleCells.push([r, c]);
  const initialGrid = grid.map(r => r.slice());
  const step = { grid: grid.map(r => r.slice()), bundle: null, wins: [], payout: 0 };
  if (bundleCells.length) {
    const flipTo = drawIdx(rng, CFG.flipW, sum(CFG.flipW));
    for (const [r, c] of bundleCells) step.grid[r][c] = flipTo;
    step.bundle = { cells: bundleCells, flipTo };
  }
  const ev = evaluateLines(step.grid); step.wins = ev.wins; step.payout = ev.total;
  const base = Math.min(maxWin, ev.total);
  const round = { v: 1, cost: ante ? CFG.anteCost : 1, ante: !!ante, bought: null, bonusType: null, initialGrid, cascadeSteps: [step], tins: { count: tinCells.length, cells: tinCells }, fsScatter: { count: fsCells.length, cells: fsCells, suppressed }, basePayout: base,
    bonusTriggered: false, bonus: null, totalPayout: base, capped: false };
  if (ev.total >= maxWin) { round.capped = true; return round; }
  if (tinCells.length >= CFG.triggerTins) {
    const b = playRush(rng, tinCells, maxWin - base), total = Math.min(maxWin - base, b.total);
    round.bonusTriggered = true; round.bonus = bonusObj(b, total); round.bonusType = 'tin';
    round.totalPayout = Math.min(maxWin, base + total); round.capped = b.capped || round.totalPayout >= maxWin;
  } else if (fsCells.length >= 3) {
    const n = fsCells.length, type = n === 3 ? 'fs' : 'super', b = playSteep(rng, type, n, maxWin - base), total = Math.min(maxWin - base, b.total);
    round.bonusTriggered = true; round.bonus = fsBonusObj(b, total); round.bonusType = type;
    round.totalPayout = Math.min(maxWin, base + total); round.capped = b.capped || round.totalPayout >= maxWin;
  }
  return round;
}

/* Natural FS trigger rates from CFG.fsP (Binomial over 20 cells; the Tin-priority suppression is ~1e-6 and ignored here). Shown to the player only as "about 1 in N". */
function fsRates() {
  const p = CFG.fsP, pk = k => { let c = 1; for (let i = 1; i <= k; i++) c = c * (CELLS - i + 1) / i; return c * p ** k * (1 - p) ** (CELLS - k); };
  let p5 = 0; for (let k = 5; k <= CELLS; k++) p5 += pk(k);
  return { p3: pk(3), p4: pk(4), p5plus: p5, oneIn3: 1 / pk(3), oneIn4: 1 / pk(4), oneIn5plus: 1 / p5 };
}

export function info() {
  const bonus = t => { const T = CFG[t]; return { startSpins: T.spins, ...(T.spins5 ? { startSpins5: T.spins5 } : {}), maxLevel: T.maxLevel, boost: T.boost.slice(), retrigger: { ...T.retrig }, maxSpins: T.maxSpins,
    ...(T.preSteep ? { preSteep: T.preSteep, preLevel: T.preLevel } : {}),
    maxLineMult: 1 + 5 * T.boost[T.maxLevel] }; };   // x(1+sum of 5 top drawers) at most
  return { lines: LINES, paytable: CFG.pay.map((p, i) => ({ id: i, name: SYMBOLS[i].name, pays: { 3: p[0] * CFG.payScale, 4: p[1] * CFG.payScale, 5: p[2] * CFG.payScale } })),
    symbols: SYMBOLS, wild: WILD, bundle: BUNDLE, tin: TIN, fsScatter: FS, triggerTins: CFG.triggerTins, startRespins: CFG.startRespins, jackpots: CFG.jackpots,
    grandBonus: CFG.grandBonus, maxWin: CFG.maxWin, buy: CFG.buy,
    fsRates: fsRates(), fsBonus: { fs: bonus('fs'), super: bonus('super'), triggers: { fs: 3, super: 4, super16: 5 }, fsPBonus: CFG.fsPBonus },
    buyNames: { tin: 'Tin Rush', fs: 'Free Spins', super: 'Super Free Spins' } };
}

export function cryptoRng() { return crypto.randomBytes(6).readUIntBE(0, 6) / 281474976710656; }
