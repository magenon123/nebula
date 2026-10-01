/* GRUMBLE & BRINE: Deep Salvage. Self-contained pure engine (SlotForge ENGINE-API v1). Spec: plans/grumble-and-brine/01-features-math.md.
 * No imports except 'crypto'. No Math.random, no clock. All money in multiples of the base bet.
 *
 * Decisions where the spec was silent/ambiguous (also posted in chat):
 *  - Opening grid cell roll: ONE uniform draw per cell: u < scatterP -> Buoy; else u < scatterP + jellyP[c] -> Jelly; else a pay symbol. (Buoy and Jelly are mutually exclusive per cell.)
 *  - Order of rng use per grid: all 15 cells (row-major) first, then the start value of each Jelly, then (dives) the guaranteed Jelly.
 *  - If the BASE spin alone reaches maxWin, the round is capped and bonusTriggered is reported false (the contract needs a playable bonus; unreachable in practice).
 *  - Cap inside a spin: steps after the one that reached the cap are not played; the dive that hit the cap is the last (spinsLeft = dives not played).
 *  - Dive Ticket / Abyss Pass buys share the SAME playDive() and the same CFG.bonus object; the buy only overrides tide/jellyFactor/guaranteeEvery (spec 5, test 13.3).
 *  - Jelly start value + Tide is capped at jellyMax (25); +1 per drift also capped.
 */
import crypto from 'crypto';

export const id = 'grumble-and-brine';
export const name = 'Grumble & Brine: Deep Salvage';

const ROWS = 3, COLS = 5, JELLY = 9, BUOY = 10;
export const SYMBOLS = [
  { id: 0, name: 'Old Boot' }, { id: 1, name: 'Tin Can' }, { id: 2, name: 'Message Bottle' }, { id: 3, name: 'Rusty Key' },
  { id: 4, name: 'Brass Compass' }, { id: 5, name: 'Barnacle Anchor' }, { id: 6, name: 'Coin Purse' }, { id: 7, name: 'Rusty Harpoon' },
  { id: 8, name: 'Pearl Clam' }, { id: 9, name: 'Lantern Jelly' }, { id: 10, name: 'Sonar Buoy' }
];

export const CFG = {
  rows: ROWS, reels: COLS,
  bets: [0.1,0.2,0.3,0.4,0.5,0.6,0.8,1,1.5,2,2.5,3,4,5,6,8,10,12,15,20,25,30,40,50,60,80,100,150,200,250,300,400,500,750,1000,1500,2000,3000,4000,5000,7500,10000],
  maxWin: 7500,
  anteCost: 2,
  anteScatterP: 0.0342,
  buy: {
    dive: { cost: 100, buoys: 3, tide: 0 },
    abyss: { cost: 500, buoys: 5, tide: 2, tideMax: 3, jellyFactor: 1.25, guaranteeEvery: 1 }
  },
  weights: [11, 11, 11, 11, 11, 10, 10, 9, 8],
  pay: [[0, 0.12, 0.35], [0, 0.14, 0.45], [0.04, 0.14, 0.41], [0.05, 0.17, 0.55], [0.07, 0.21, 0.70], [0.10, 0.35, 1.10], [0.17, 0.55, 1.70], [0.27, 1.00, 3.40], [0.55, 2.05, 8.20]],
  payScale: 1,
  scatterP: 0.0222,
  scatterPay: { 3: 2, 4: 10, 5: 50 },
  jellyP: [0, 0.008, 0.009, 0.010, 0.011],     // reels 1..5 are indexes 0..4 (reel 0 never)
  jellyStart: [[1, 60], [2, 25], [3, 15]],
  jellyMax: 25,
  maxDrifts: 15,
  bonus: {
    scatterP: 0.045,
    jellyP: [0, 0.0092, 0.0097, 0.0108, 0.0123],
    jellyFactor: 1,
    dives: { 3: 8, 4: 10, 5: 12 },
    retrigger: { 2: 3, 3: 6 },
    maxDives: 40,
    tideMax: 3, tideStep: 1,
    guaranteeEvery: 3,
    guaranteeReels: [3, 4]
  }
};

export const PAYTABLE = SYMBOLS.slice(0, 9).map(s => ({
  id: s.id, name: s.name,
  get pays() { const p = CFG.pay[s.id]; return { 3: p[0] ? +(p[0] * CFG.payScale).toFixed(4) : null, 4: p[1] ? +(p[1] * CFG.payScale).toFixed(4) : null, 5: p[2] ? +(p[2] * CFG.payScale).toFixed(4) : null }; }
}));
export const SCATTER_PAY = CFG.scatterPay;

export function cryptoRng() { return crypto.randomBytes(6).readUIntBE(0, 6) / 2 ** 48; }

export const info = () => ({
  paytable: PAYTABLE.map(p => ({ id: p.id, name: p.name, pays: p.pays })),
  scatterPay: CFG.scatterPay, payScale: CFG.payScale, maxWin: CFG.maxWin,
  dives: CFG.bonus.dives, retrigger: CFG.bonus.retrigger, maxDives: CFG.bonus.maxDives, tideMax: CFG.bonus.tideMax, jellyMax: CFG.jellyMax,
  anteCost: CFG.anteCost, anteTriggerMultiple: null,
  buy: Object.fromEntries(Object.entries(CFG.buy).map(([k, b]) => [k, { cost: b.cost, buoys: b.buoys, startDives: CFG.bonus.dives[b.buoys], tide: b.tide }]))
});

/* ---------- helpers ---------- */
const emptyGrid = () => [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
const cloneGrid = g => [g[0].slice(), g[1].slice(), g[2].slice()];

function drawSym(rng, w, total) {
  let u = rng() * total;
  for (let i = 0; i < w.length; i++) { u -= w[i]; if (u < 0) return i; }
  return w.length - 1;
}
function rollStart(rng) {
  const js = CFG.jellyStart; let tot = 0; for (const j of js) tot += j[1];
  let u = rng() * tot; for (const j of js) { u -= j[1]; if (u < 0) return j[0]; }
  return js[js.length - 1][0];
}

/* Evaluate a board: ways wins for every pay symbol, jelly values ADD within a reel, counts multiply across reels. */
function evaluate(grid, jellies) {
  const nS = CFG.weights.length, real = [];
  for (let s = 0; s < nS; s++) real.push([0, 0, 0, 0, 0]);
  const jc = [0, 0, 0, 0, 0];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const id = grid[r][c]; if (id < nS) real[id][c]++; }
  for (const j of jellies) jc[j.c] += j.v;
  const wins = []; let payout = 0;
  for (let s = 0; s < nS; s++) {
    const rs = real[s]; let n = 0;
    while (n < COLS && rs[n] + jc[n] > 0) n++;
    if (n < 3) continue;
    const p = CFG.pay[s][n - 3]; if (!(p > 0)) continue;
    let anyReal = false, ways = 1; const counts = [];
    for (let c = 0; c < n; c++) { if (rs[c] > 0) anyReal = true; const k = rs[c] + jc[c]; counts.push(k); ways *= k; }
    if (!anyReal) continue;
    const pay = p * CFG.payScale, po = pay * ways, cells = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < n; c++) if (grid[r][c] === s || grid[r][c] === JELLY) cells.push([r, c]);
    wins.push({ sym: s, len: n, counts, ways, pay, payout: po, cells });
    payout += po;
  }
  return { wins, payout };
}

/* One spin = opening evaluation + Drift loop. `grid` has Jelly cells (id 9) already; `jellies` = [{r,c,v}].
 * `room` = how much more can still be paid before the cap (Infinity = no limit); stops after the step that reaches it. */
function runSpin(rng, grid, jellies, room) {
  const w = CFG.weights, wt = w.reduce((a, b) => a + b, 0), steps = [];
  let total = 0, exited = 0, jel = jellies.map(j => ({ r: j.r, c: j.c, v: j.v })), g = grid;
  const open = evaluate(g, jel);
  steps.push({ kind: 'open', chain: 0, grid: cloneGrid(g), jellies: jel.map(j => ({ ...j })), moves: [], respun: [], wins: open.wins, payout: open.payout, exits: jel.filter(j => j.c === 0).map(j => ({ r: j.r, v: j.v })) });
  total += open.payout;
  for (let k = 1; k <= CFG.maxDrifts; k++) {
    if (total >= room || !jel.length) break;
    const leaving = jel.filter(j => j.c === 0); exited += leaving.length;
    const moving = jel.filter(j => j.c > 0);
    if (!moving.length) break;
    const moves = [];
    const next = moving.map(j => { const v = Math.min(CFG.jellyMax, j.v + 1); moves.push({ r: j.r, from: j.c, to: j.c - 1, v }); return { r: j.r, c: j.c - 1, v }; });
    const held = Array.from({ length: ROWS }, () => [false, false, false, false, false]);
    for (const j of next) held[j.r][j.c] = true;
    const respun = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { if (held[r][c]) { g[r][c] = JELLY; } else { g[r][c] = drawSym(rng, w, wt); respun.push([r, c]); } }
    jel = next;
    const ev = evaluate(g, jel);
    steps.push({ kind: 'drift', chain: k, grid: cloneGrid(g), jellies: jel.map(j => ({ ...j })), moves, respun, wins: ev.wins, payout: ev.payout, exits: jel.filter(j => j.c === 0).map(j => ({ r: j.r, v: j.v })) });
    total += ev.payout;
  }
  return { steps, total, exited };
}

/* Roll an opening grid: buoys, jellies (+tide), optional guaranteed jelly. */
function rollGrid(rng, scatterP, jellyP, tide, guaranteed) {
  const w = CFG.weights, wt = w.reduce((a, b) => a + b, 0), grid = emptyGrid(), buoyCells = [], jel = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const u = rng();
    if (u < scatterP) { grid[r][c] = BUOY; }
    else if (u < scatterP + jellyP[c]) { grid[r][c] = JELLY; jel.push({ r, c, v: 0 }); }
    else grid[r][c] = drawSym(rng, w, wt);
  }
  for (const j of jel) j.v = rollStart(rng);
  let g = null;
  if (guaranteed) {
    const reels = guaranteed, c = reels[rng() < 0.5 ? 0 : 1] ?? reels[0], r = Math.min(ROWS - 1, Math.floor(rng() * ROWS));
    const idx = jel.findIndex(j => j.r === r && j.c === c); if (idx >= 0) jel.splice(idx, 1);
    grid[r][c] = JELLY; jel.push({ r, c, v: rollStart(rng) }); g = { r, c };
  }
  for (const j of jel) j.v = Math.min(CFG.jellyMax, j.v + tide);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c] === BUOY) buoyCells.push([r, c]);
  jel.sort((a, b) => a.c - b.c || a.r - b.r);
  return { grid, jel, buoyCells, guaranteed: g };
}

/* The ONE bonus (Deep Dive) used by natural triggers, Deep Pressure and the Dive Ticket; Abyss Pass only overrides start state via `ov`. */
function playBonus(rng, startDives, ov, room) {
  const B = CFG.bonus, tideMax = ov.tideMax ?? B.tideMax, every = ov.guaranteeEvery ?? B.guaranteeEvery, jf = ov.jellyFactor ?? B.jellyFactor;
  const jellyP = B.jellyP.map(p => p * jf), spins = [];
  let tide = ov.tide || 0, left = startDives, played = 0, total = 0, scheduled = startDives, capped = false;
  while (left > 0 && played < B.maxDives) {
    played++; left--;
    const guar = (played - 1) % every === 0;
    const gr = rollGrid(rng, B.scatterP, jellyP, tide, guar ? B.guaranteeReels : null);
    const tideBefore = tide, buoys = gr.buoyCells.length;
    const run = runSpin(rng, gr.grid, gr.jel, room - total);
    // the initialGrid shown for the dive (before drifts) is the opening step grid
    const dive = { spinIndex: played, spinsLeft: 0, buoys, buoyCells: gr.buoyCells, tideBefore, tideAfter: tide, guaranteed: gr.guaranteed, initialGrid: run.steps[0].grid, steps: run.steps, exited: run.exited, totalPayout: run.total };
    total += run.total;
    if (total >= room) { capped = true; left = 0; dive.tideAfter = tide; dive.spinsLeft = 0; spins.push(dive); break; }
    tide = Math.min(tideMax, tide + run.exited * B.tideStep);
    dive.tideAfter = tide;
    const add = buoys >= 3 ? B.retrigger[3] : buoys === 2 ? B.retrigger[2] : 0;
    if (add) {
      const can = Math.max(0, Math.min(add, B.maxDives - scheduled));
      if (can > 0) { dive.retrigger = can; left += can; scheduled += can; }
    }
    dive.spinsLeft = left;
    spins.push(dive);
  }
  return { spins, total, capped, startTide: ov.tide || 0, tideMax };
}

export function playRound(rng, { ante = false, buy = null } = {}) {
  const maxWin = CFG.maxWin, B = CFG.bonus;
  if (buy) {
    const bc = CFG.buy[buy]; if (!bc) throw new Error('unknown buy ' + buy);
    // trigger spin: `buoys` Buoys on random cells, no Jelly, zero ways wins (rejection sampling), pays nothing
    const w = CFG.weights, wt = w.reduce((a, b) => a + b, 0);
    let grid, cells;
    for (let tries = 0; tries < 1000; tries++) {
      grid = emptyGrid(); cells = [];
      const all = []; for (let i = 0; i < ROWS * COLS; i++) all.push(i);
      for (let k = 0; k < bc.buoys; k++) { const j = k + Math.floor(rng() * (all.length - k)); const t = all[k]; all[k] = all[j]; all[j] = t; }
      const isB = new Set(all.slice(0, bc.buoys));
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) grid[r][c] = isB.has(r * COLS + c) ? BUOY : drawSym(rng, w, wt);
      if (evaluate(grid, []).payout === 0) break;
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c] === BUOY) cells.push([r, c]);
    const startDives = B.dives[Math.min(5, bc.buoys)];
    const ov = {}; for (const k of ['tide', 'tideMax', 'jellyFactor', 'guaranteeEvery']) if (bc[k] !== undefined) ov[k] = bc[k];
    const b = playBonus(rng, startDives, ov, maxWin);
    const bonusTotal = Math.min(maxWin, b.total);
    return { v: 1, cost: bc.cost, ante: false, bought: buy, initialGrid: grid, cascadeSteps: [], scatter: { count: bc.buoys, cells, payout: 0 }, basePayout: 0,
      bonusTriggered: true, bonus: { startSpins: startDives, startTide: b.startTide, tideMax: b.tideMax, totalPayout: bonusTotal, spins: b.spins },
      totalPayout: bonusTotal, capped: b.capped || bonusTotal >= maxWin };
  }
  const sp = ante ? CFG.anteScatterP : CFG.scatterP;
  const gr = rollGrid(rng, sp, CFG.jellyP, 0, null);
  const count = gr.buoyCells.length, scatterPay = count >= 3 ? CFG.scatterPay[Math.min(5, count)] : 0;
  const run = runSpin(rng, gr.grid, gr.jel, maxWin - scatterPay);
  let base = scatterPay + run.total;
  const round = { v: 1, cost: ante ? CFG.anteCost : 1, ante: !!ante, bought: null, initialGrid: run.steps[0].grid, cascadeSteps: run.steps,
    scatter: { count, cells: gr.buoyCells, payout: scatterPay }, basePayout: base, bonusTriggered: false, bonus: null, totalPayout: 0, capped: false };
  if (base >= maxWin) { round.basePayout = maxWin; round.totalPayout = maxWin; round.capped = true; return round; }
  if (count >= 3) {
    const startDives = B.dives[Math.min(5, count)];
    const b = playBonus(rng, startDives, {}, maxWin - base);
    const bonusTotal = Math.min(maxWin - base, b.total);
    round.bonusTriggered = true;
    round.bonus = { startSpins: startDives, startTide: b.startTide, tideMax: b.tideMax, totalPayout: bonusTotal, spins: b.spins };
    round.totalPayout = Math.min(maxWin, base + bonusTotal);
    round.capped = b.capped || round.totalPayout >= maxWin;
  } else round.totalPayout = base;
  return round;
}

export const evaluateBoard = evaluate;   // exported for the rule unit tests (tools/grumble.test.js)
