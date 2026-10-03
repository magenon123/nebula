/* ARCTIC AURORA LODGE: Trapper's Night. Self-contained pure engine (SlotForge ENGINE-API v1). Spec: plans/slot4-pitches.md PITCH C,
 * round JSON: plans/arctic-aurora-lodge-round-format.md. No imports except 'crypto'. No Math.random, no clock. Money = multiples of the base bet.
 *
 * Rules fixed here where the pitch left room (all covered by tools/arctic.test.js):
 *  - Grid 5 rows x 6 reels (grid[r][c]). Per spin: n3 giant 3x3 blocks, then n2 giant 2x2 blocks (counts drawn from CFG tables), each at a uniformly random
 *    free position that fits fully inside the grid (never overlapping, never cut off). Block symbols are pay symbols 0..7 only (weights blockW).
 *    Every other cell is a single: wild / FS scatter / Aurora Gem / pay symbol (weights symW) from ONE uniform draw each, row-major.
 *  - Win = 8+ cells of AREA of the same symbol anywhere (single = 1, 2x2 = 4, 3x3 = 9). Tiers 8-9, 10-11, 12-14, 15-19, 20+. One evaluation per spin, no refill.
 *    Several symbols can win in the same spin and add up. Wilds (singles only, never in blocks) all join the ONE symbol that pays the most with them.
 *  - Free Spins "Aurora Muse": 3 FS = 10 spins, 4 FS = 12, 5+ = 15; 3+ FS inside the bonus = +5 spins (max 40 spins). Each spin the aurora LIGHTS one symbol (weighted
 *    draw litW, announced first): its threshold is 5 cells (tier 5-7 pays CFG.litLow x the 8-9 tier) and its blocks count DOUBLE area (2x2 = 8, 3x3 = 18).
 *    No gems in the bonus. Nothing persists between spins.
 *  - Aurora Sweep: >= 4 Aurora Gems (singles) on the opening grid. A 5x5 sheet of ice hides cells {empty | cash value | cash with a prism}. N = min(8, gems) bands
 *    (distinct, drawn from the 16 bands: 5 rows, 5 columns, 2 long + 4 short diagonals) melt the ice one by one. A cell pays value x (bands that crossed it
 *    + 1 if it holds a prism); cells no band touched pay nothing. One bonus step per band; sum of steps = payout.
 *  - Priority when the opening grid has both: Aurora Sweep wins, FS scatters become ordinary pay symbols (probability ~1e-7).
 *  - Luck mode "Northern Lights" = CFG.anteCost x bet: more blocks, FS/Gem weights up.
 *  - Cap: base capped first; a bonus stops at the first step that reaches the remaining cap and that last step is truncated, so sum(steps) = bonus.totalPayout.
 *  - Bought round: trigger spin = block layout without wins (rejection), scatters/gems placed on random single cells, no wild, payout 0.
 */
import crypto from 'crypto';

export const id = 'arctic-aurora-lodge';
export const name = 'Arctic Aurora Lodge: Trapper\'s Night';

const ROWS = 5, COLS = 6;
const WILD = 9, GEM = 8, FS = 10, NPAY = 8;
export const SYMBOLS = ['Antler Knife', 'Iron Kettle', 'Wool Mittens', 'Snow Goggles', 'Compass', 'Lantern', 'Silver Fox', 'Polar Owl', 'Aurora Gem', 'Aurora Orb (Wild)', 'FS Scatter']
  .map((n, i) => ({ id: i, name: n }));

export const CFG = {
  rows: ROWS, reels: COLS,
  bets: [0.1,0.2,0.3,0.4,0.5,0.6,0.8,1,1.5,2,2.5,3,4,5,6,8,10,12,15,20,25,30,40,50,60,80,100,150,200,250,300,400,500,750,1000,1500,2000,3000,4000,5000,7500,10000],
  maxWin: 7500,
  buy: { fs: { cost: 80 }, sweep: { cost: 55 } },
  anteCost: 2,
  // blocks per spin: weights for 0,1,2,... giant blocks
  n3W: [96, 4], n2W: [72, 23, 5],
  anteN3W: [91, 9], anteN2W: [62, 29, 8, 1],
  blockW: [16, 15, 14, 13, 9, 8, 6, 5],       // which pay symbol a block is
  symW: [12, 12, 12, 12, 11, 11, 10, 10],     // single cells
  wildP: 0.008, fsP: 0.00981, gemP: 0.0224,    // per single cell
  anteFsP: 0.0148, anteGemP: 0.0305,
  // pay[s] = multipliers for tiers 8-9, 10-11, 12-14, 15-19, 20+
  pay: [[0.4, 1, 2.5, 8, 28], [0.5, 1.3, 3, 10, 35], [0.6, 1.6, 4, 12, 42], [0.8, 2, 5, 15, 50],
        [1, 2.5, 6, 20, 100], [1.5, 4, 10, 35, 200], [2, 5, 14, 50, 400], [3, 8, 20, 80, 800]],
  payScale: 0.93,
  litLow: 0.5,                                // tier 5-7 (lit symbol only) = litLow x tier 8-9
  // Free Spins (Aurora Muse)
  fs: { spins: [10, 12, 15], retrigSpins: 5, maxSpins: 40, n3W: [50, 42, 8], n2W: [16, 30, 30, 14, 10], wildP: 0.0215, fsP: 0.014,
        litW: [22, 20, 18, 16, 9, 7, 5, 3] },
  // Aurora Sweep
  sweep: { maxBands: 8, pEmpty: 0.225, pPrism: 0.1,
           valueW: [[1, 40], [2, 29], [3, 16], [5, 7.5], [8, 4], [12, 2.6], [20, 1.4], [40, 0.8], [100, 0.14], [250, 0.022], [500, 0.004]] },
  // buy trigger-count weights (measured to match the natural conditional distribution)
  buyFsCount: [[3, 93.8], [4, 5.9], [5, 0.3]],
  buySweepCount: [[4, 89.1], [5, 9.9], [6, 0.97], [7, 0.06], [8, 0.01]]
};

/* The 16 Aurora Sweep bands on the 5x5 sheet. */
export const BANDS = (() => {
  const b = [], mk = (type, index, cells) => b.push({ type, index, cells });
  for (let i = 0; i < 5; i++) mk('row', i, [0, 1, 2, 3, 4].map(c => [i, c]));
  for (let i = 0; i < 5; i++) mk('col', i, [0, 1, 2, 3, 4].map(r => [r, i]));
  mk('diag', 0, [0, 1, 2, 3, 4].map(i => [i, i]));
  mk('anti', 0, [0, 1, 2, 3, 4].map(i => [i, 4 - i]));
  mk('diag', 1, [0, 1, 2, 3].map(i => [i, i + 1]));
  mk('diag', -1, [0, 1, 2, 3].map(i => [i + 1, i]));
  mk('anti', 1, [0, 1, 2, 3].map(i => [i, 3 - i]));
  mk('anti', -1, [1, 2, 3, 4].map(i => [i, 5 - i]));
  return b;
})();

const pickW = (rng, tbl) => { let t = 0; for (const e of tbl) t += e[1]; let u = rng() * t; for (const e of tbl) { u -= e[1]; if (u < 0) return e[0]; } return tbl[tbl.length - 1][0]; };
const drawIdx = (rng, w) => { let t = 0; for (const x of w) t += x; let u = rng() * t; for (let i = 0; i < w.length; i++) { u -= w[i]; if (u < 0) return i; } return w.length - 1; };
const emptyGrid = () => Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

/* ---------- grid generation ---------- */
/* o: { n3W, n2W, wildP, fsP, gemP, noSpecial }. Returns { grid, blocks:[{id,sym,r,c,size}], fsCells, gemCells, wildCells } */
function genGrid(rng, o) {
  const grid = emptyGrid(), used = emptyGrid(), blocks = [];
  const n3 = drawIdx(rng, o.n3W), n2 = drawIdx(rng, o.n2W);
  const place = (size, n) => {
    for (let k = 0; k < n; k++) {
      const spots = [];
      for (let r = 0; r + size <= ROWS; r++) for (let c = 0; c + size <= COLS; c++) {
        let ok = true;
        for (let i = 0; i < size && ok; i++) for (let j = 0; j < size; j++) if (used[r + i][c + j]) { ok = false; break; }
        if (ok) spots.push([r, c]);
      }
      if (!spots.length) return;
      const [r, c] = spots[Math.min(spots.length - 1, Math.floor(rng() * spots.length))], sym = drawIdx(rng, CFG.blockW);
      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) { used[r + i][c + j] = 1; grid[r + i][c + j] = sym; }
      blocks.push({ id: blocks.length, sym, r, c, size });
    }
  };
  place(3, n3); place(2, n2);
  const fsCells = [], gemCells = [], wildCells = [];
  const sTot = CFG.symW.reduce((a, b) => a + b, 0);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (used[r][c]) continue;
    let u = rng();
    if (!o.noSpecial) {
      const gp = o.gemP || 0;
      if (u < o.wildP) { grid[r][c] = WILD; wildCells.push([r, c]); continue; }
      u -= o.wildP;
      if (u < o.fsP) { grid[r][c] = FS; fsCells.push([r, c]); continue; }
      u -= o.fsP;
      if (u < gp) { grid[r][c] = GEM; gemCells.push([r, c]); continue; }
      u -= gp;
      u /= 1 - o.wildP - o.fsP - gp;
    }
    let x = Math.min(0.999999999, Math.max(0, u)) * sTot, s = 0;
    for (; s < NPAY - 1; s++) { x -= CFG.symW[s]; if (x < 0) break; }
    grid[r][c] = s;
  }
  return { grid, blocks, fsCells, gemCells, wildCells };
}

/* ---------- evaluation ---------- */
const tierOf = (cnt, lit) => (cnt >= 20 ? 5 : cnt >= 15 ? 4 : cnt >= 12 ? 3 : cnt >= 10 ? 2 : cnt >= 8 ? 1 : lit && cnt >= 5 ? 0 : -1);
function multOf(s, cnt, lit) {
  const t = tierOf(cnt, lit); if (t < 0) return 0;
  return (t === 0 ? CFG.pay[s][0] * CFG.litLow : CFG.pay[s][t - 1]) * CFG.payScale;
}
/* lit = lit symbol id or -1. Returns { total, wins:[{sym,count,tier,mult,payout,lit,cells,blocks,wilds}] } */
export function evaluate(grid, blocks, lit = -1) {
  const cnt = new Array(NPAY).fill(0), cells = Array.from({ length: NPAY }, () => []), blockIds = Array.from({ length: NPAY }, () => []);
  const inBlock = emptyGrid(), wilds = [];
  for (const b of blocks) {
    const area = b.size * b.size * (b.sym === lit ? 2 : 1); cnt[b.sym] += area; blockIds[b.sym].push(b.id);
    for (let i = 0; i < b.size; i++) for (let j = 0; j < b.size; j++) { inBlock[b.r + i][b.c + j] = 1; cells[b.sym].push([b.r + i, b.c + j]); }
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (inBlock[r][c]) continue;
    const s = grid[r][c];
    if (s < NPAY) { cnt[s]++; cells[s].push([r, c]); } else if (s === WILD) wilds.push([r, c]);
  }
  let wildSym = -1;
  if (wilds.length) {
    let best = 0;
    for (let s = 0; s < NPAY; s++) { const m = multOf(s, cnt[s] + wilds.length, s === lit); if (m > best || (m === best && m > 0 && cnt[s] >= cnt[wildSym])) { best = m; wildSym = s; } }
    if (best <= 0) wildSym = -1;
  }
  const wins = []; let total = 0;
  for (let s = 0; s < NPAY; s++) {
    const w = s === wildSym ? wilds.length : 0, count = cnt[s] + w, isLit = s === lit, mult = multOf(s, count, isLit);
    if (!(mult > 0)) continue;
    wins.push({ sym: s, count, tier: tierOf(count, isLit), mult, payout: mult, lit: isLit, cells: cells[s].concat(w ? wilds : []), blocks: blockIds[s], wilds: w ? wilds : [] });
    total += mult;
  }
  return { total, wins };
}

/* ---------- Aurora Sweep ---------- */
function playSweep(rng, gems, capLeft) {
  const S = CFG.sweep, sheet = [];
  for (let r = 0; r < 5; r++) {
    const row = [];
    for (let c = 0; c < 5; c++) {
      if (rng() < S.pEmpty) row.push({ kind: 'empty', value: 0, prism: false });
      else { const value = pickW(rng, S.valueW); row.push({ kind: 'cash', value, prism: rng() < S.pPrism }); }
    }
    sheet.push(row);
  }
  const n = Math.min(S.maxBands, gems), pool = BANDS.map((_, i) => i), bandIdx = [];
  for (let k = 0; k < n; k++) { const j = k + Math.min(pool.length - k - 1, Math.floor(rng() * (pool.length - k))); [pool[k], pool[j]] = [pool[j], pool[k]]; bandIdx.push(pool[k]); }
  const hits = Array.from({ length: 5 }, () => new Array(5).fill(0)), spins = [];
  let prev = 0, capped = false;
  for (let k = 0; k < n; k++) {
    const band = BANDS[bandIdx[k]], newly = [];
    for (const [r, c] of band.cells) { if (hits[r][c] === 0) newly.push([r, c]); hits[r][c]++; }
    let run = 0; const crossed = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (hits[r][c] > 0 && sheet[r][c].kind === 'cash') run += sheet[r][c].value * (hits[r][c] + (sheet[r][c].prism ? 1 : 0));
    for (const [r, c] of band.cells) if (sheet[r][c].kind === 'cash') crossed.push({ r, c, value: sheet[r][c].value, prism: sheet[r][c].prism, crossings: hits[r][c], multiplier: hits[r][c] + (sheet[r][c].prism ? 1 : 0) });
    const uncapped = run - prev; let delta = uncapped;
    prev = run;
    const reached = run >= capLeft;
    if (reached) { delta -= run - capLeft; capped = true; }
    spins.push({ spinIndex: k + 1, spinsLeft: reached ? 0 : n - k - 1, band: { type: band.type, index: band.index, id: bandIdx[k], cells: band.cells }, newlyMelted: newly, crossed,
      runningTotal: Math.min(run, capLeft), uncappedDelta: uncapped, totalPayout: delta });
    if (reached) break;
  }
  const total = spins.reduce((a, s) => a + s.totalPayout, 0);
  return { startSpins: n, sheet, bands: bandIdx, spins, total, capped };
}

/* ---------- Free Spins (Aurora Muse) ---------- */
function playFs(rng, nScatter, capLeft) {
  const F = CFG.fs, start = F.spins[Math.min(F.spins.length - 1, nScatter - 3)], spins = [];
  let left = start, total = 0, capped = false, done = 0;
  while (left > 0 && done < F.maxSpins) {
    const lit = drawIdx(rng, F.litW);
    const g = genGrid(rng, { n3W: F.n3W, n2W: F.n2W, wildP: F.wildP, fsP: F.fsP, gemP: 0 });
    const ev = evaluate(g.grid, g.blocks, lit);
    let pay = ev.total, retrigger = 0;
    left--; done++;
    if (g.fsCells.length >= 3 && done + left + F.retrigSpins <= F.maxSpins) { retrigger = F.retrigSpins; left += retrigger; }
    const uncapped = pay;
    if (total + pay >= capLeft) { pay = capLeft - total; capped = true; left = 0; }
    total += pay;
    const sp = { spinIndex: done, spinsLeft: left, lit, grid: g.grid, blocks: g.blocks, scatters: { count: g.fsCells.length, cells: g.fsCells }, wilds: g.wildCells, wins: ev.wins,
      uncappedPayout: uncapped, totalPayout: pay };
    if (retrigger) sp.retrigger = retrigger;
    spins.push(sp);
  }
  return { startSpins: start, spins, total, capped };
}

const bonusObj = (kind, b, extra, total) => ({ kind, startSpins: b.startSpins, spins: b.spins, totalPayout: total, ...extra });

/* ---------- a round ---------- */
export function playRound(rng, { buy = null, ante = false } = {}) {
  const maxWin = CFG.maxWin;
  if (buy) {
    const bc = CFG.buy[buy]; if (!bc) throw new Error('unknown buy ' + buy);
    const n = pickW(rng, buy === 'fs' ? CFG.buyFsCount : CFG.buySweepCount);
    let g, cells;
    for (let tries = 0; tries < 500; tries++) {          // no win on the trigger spin: rejection (scatters/gems are blanks)
      g = genGrid(rng, { n3W: CFG.n3W, n2W: CFG.n2W, noSpecial: true });
      const singles = [], inB = emptyGrid();
      for (const b of g.blocks) for (let i = 0; i < b.size; i++) for (let j = 0; j < b.size; j++) inB[b.r + i][b.c + j] = 1;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!inB[r][c]) singles.push([r, c]);
      if (singles.length < n) continue;
      cells = [];
      for (let k = 0; k < n; k++) { const j = k + Math.min(singles.length - k - 1, Math.floor(rng() * (singles.length - k))); [singles[k], singles[j]] = [singles[j], singles[k]]; cells.push(singles[k]); }
      cells.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const mark = buy === 'fs' ? FS : GEM, g2 = g.grid.map(r => r.slice());
      for (const [r, c] of cells) g2[r][c] = mark;
      // the scatters replace single cells, so the blank-out can only lower counts: re-check wins on the final grid
      if (evaluate(g2, g.blocks, -1).total === 0) { g.grid = g2; break; }
    }
    const trig = { type: buy, count: n, cells };
    if (buy === 'fs') {
      const b = playFs(rng, n, maxWin), total = Math.min(maxWin, b.total);
      return { v: 1, cost: bc.cost, ante: false, bought: buy, bonusType: 'fs', initialGrid: g.grid, initialBlocks: g.blocks, trigger: trig, cascadeSteps: [], basePayout: 0,
        bonusTriggered: true, bonus: bonusObj('fs', b, { scatters: n }, total), totalPayout: total, capped: b.capped || total >= maxWin };
    }
    const b = playSweep(rng, n, maxWin), total = Math.min(maxWin, b.total);
    return { v: 1, cost: bc.cost, ante: false, bought: buy, bonusType: 'sweep', initialGrid: g.grid, initialBlocks: g.blocks, trigger: trig, cascadeSteps: [], basePayout: 0,
      bonusTriggered: true, bonus: bonusObj('sweep', b, { gems: n, sheet: b.sheet, bands: b.bands }, total), totalPayout: total, capped: b.capped || total >= maxWin };
  }
  const g = genGrid(rng, ante
    ? { n3W: CFG.anteN3W, n2W: CFG.anteN2W, wildP: CFG.wildP, fsP: CFG.anteFsP, gemP: CFG.anteGemP }
    : { n3W: CFG.n3W, n2W: CFG.n2W, wildP: CFG.wildP, fsP: CFG.fsP, gemP: CFG.gemP });
  let { fsCells } = g; const { gemCells } = g; let suppressed = 0;
  if (gemCells.length >= 4 && fsCells.length >= 3) {      // priority: Sweep. FS scatters turn into ordinary symbols
    suppressed = fsCells.length;
    for (const [r, c] of fsCells) g.grid[r][c] = 0;
    fsCells = [];
  }
  const initialGrid = g.grid.map(r => r.slice());
  const ev = evaluate(g.grid, g.blocks, -1), base = Math.min(maxWin, ev.total);
  const step = { grid: g.grid.map(r => r.slice()), blocks: g.blocks, wins: ev.wins, payout: ev.total };
  const round = { v: 1, cost: ante ? CFG.anteCost : 1, ante: !!ante, bought: null, bonusType: null, initialGrid, initialBlocks: g.blocks, cascadeSteps: [step],
    scatters: { fs: { count: fsCells.length, cells: fsCells, suppressed }, gems: { count: gemCells.length, cells: gemCells } }, wilds: g.wildCells,
    basePayout: base, bonusTriggered: false, bonus: null, totalPayout: base, capped: false };
  if (ev.total >= maxWin) { round.capped = true; return round; }
  if (gemCells.length >= 4) {
    const b = playSweep(rng, gemCells.length, maxWin - base), total = b.total;
    round.bonusTriggered = true; round.bonusType = 'sweep'; round.bonus = bonusObj('sweep', b, { gems: gemCells.length, sheet: b.sheet, bands: b.bands }, total);
    round.totalPayout = Math.min(maxWin, base + total); round.capped = b.capped || round.totalPayout >= maxWin;
  } else if (fsCells.length >= 3) {
    const b = playFs(rng, fsCells.length, maxWin - base), total = b.total;
    round.bonusTriggered = true; round.bonusType = 'fs'; round.bonus = bonusObj('fs', b, { scatters: fsCells.length }, total);
    round.totalPayout = Math.min(maxWin, base + total); round.capped = b.capped || round.totalPayout >= maxWin;
  }
  return round;
}

/* Paytable for the info screen, derived from CFG. */
export function info() {
  return {
    symbols: SYMBOLS, grid: { rows: ROWS, reels: COLS }, minArea: 8, litMinArea: 5, tiers: ['8-9', '10-11', '12-14', '15-19', '20+'], litTier: '5-7',
    pay: CFG.pay.map(r => r.map(x => x * CFG.payScale)), litLow: CFG.litLow,
    blockAreas: { 2: 4, 3: 9 }, litBlockAreas: { 2: 8, 3: 18 },
    fs: { spins: CFG.fs.spins, retrigSpins: CFG.fs.retrigSpins }, sweep: { bands: BANDS.length, maxBands: CFG.sweep.maxBands, minGems: 4 },
    anteCost: CFG.anteCost, buy: CFG.buy, maxWin: CFG.maxWin
  };
}

export function cryptoRng() { return crypto.randomBytes(6).readUIntBE(0, 6) / 281474976710656; }   // 48-bit uniform [0,1), same as the other engines
