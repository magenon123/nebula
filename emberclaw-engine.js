/* EMBERCLAW: Molten Reforge — server-side game engine.
 * Pure functions: no I/O, RNG injected. The client only animates what this returns. */
import crypto from 'crypto';

export const ROWS = 5, COLS = 6;
export const SYM = { IRON:0, COPPER:1, SILVER:2, HAMMER:3, TONGS:4, BLADE:5, CROWN:6, WILD:7, SCATTER:8 };
export const NAMES = ['Iron Shard','Copper Ingot','Silver Chain','Molten Hammer','Rune-Etched Tongs',
  'Dragonbone Blade','Crown of Cinders','Ember Core Sigil','Forgefire Gem'];
const LOW_MAX = SYM.SILVER;

/* paytable: multiplier of bet per cluster size bucket [5-7, 8-9, 10-12, 13+] */
export const PAYTABLE = [
  [0.10, 0.25, 0.5, 1.5], [0.15, 0.3, 0.6, 1.75], [0.2, 0.4, 0.8, 2],
  [0.4, 1, 2.5, 6], [0.6, 1.5, 3.5, 9],
  [1.5, 4, 10, 25], [3, 8, 20, 50]
];
const bucket = n => (n >= 13 ? 3 : n >= 10 ? 2 : n >= 8 ? 1 : 0);

/* tunable math (see emberclaw-sim.js) */
export const CFG = {
  weights: [11, 14, 13, 17, 18, 26, 29],   // refill + initial symbol weights
  bonusWeights: [10, 10, 10, 14, 18, 22, 22], // leaner table during The Reforging (heat persists, so wilds snowball)
  bonusFlatCap: 8,                        // in The Reforging the flat bonus stacks once per 3 heat, up to this many tiers
  scatterP: 0.01027,                      // per-cell scatter chance on the initial grid (~1 in 280)
  anteScatterP: 0.018557,                // Forge Fever: scatter weight raised so the bonus is ~5x as likely (~1 in 56)
  payScale: 1.055,                        // global payout trim applied to every cluster win (RTP calibration)
  heatFlat: 0.75,                         // heat >= 3: every cluster pays this flat bonus (spec said 0.5x; raised while tuning RTP)
  maxWin: 9500,
  freeSpins: 10, retriggerSpins: 4, retriggerMin: 2, maxBonusSpins: 100, maxSteps: 60,
  bets: [0.1,0.2,0.3,0.4,0.5,0.6,0.8,1,1.5,2,2.5,3,4,5,6,8,10,12,15,20,25,30,40,50,60,80,100,150,200,250,300,400,500,750,1000,1500,2000,3000,4000,5000,7500,10000],
  buy: { standard: { cost: 100, heat: 0 }, preheated: { cost: 500, heat: 6 } },
  bonusStartHeat: 0,                      // heat the Core starts at in a natural / Fever bonus (math tuning knob)
  anteCost: 3,                            // Forge Fever costs 3x the bet
  anteBonusWeights: [7.75, 7.75, 7.75, 14, 18.25, 22.25, 22.25], // Forge Fever bonuses use a richer table so the 3x price still returns ~96%
};

export function cryptoRng() {
  return crypto.randomBytes(6).readUIntBE(0, 6) / 2 ** 48;   // uniform in [0,1), 48 bits
}

const newGrid = fill => Array.from({ length: ROWS }, () => Array(COLS).fill(fill));
const clone = g => g.map(r => r.slice());

function pickSymbol(rng, W = CFG.weights) {
  let t = 0; for (const w of W) t += w;
  let x = rng() * t;
  for (let i = 0; i < W.length; i++) { x -= W[i]; if (x < 0) return i; }
  return W.length - 1;
}

function initialGrid(rng, scatterP, W) {
  const g = newGrid(0);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
    g[r][c] = rng() < scatterP ? SYM.SCATTER : pickSymbol(rng, W);
  return g;
}

/* cluster detection: orthogonal adjacency, wilds join every cluster they touch */
function findClusters(g, wm) {
  const out = [];
  for (let s = 0; s <= SYM.CROWN; s++) {
    const seen = newGrid(false);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (seen[r][c] || g[r][c] !== s) continue;       // start only from a real symbol
      const cells = [], st = [[r, c]]; seen[r][c] = true;
      let real = 0;
      while (st.length) {
        const [y, x] = st.pop(); cells.push([y, x]);
        if (g[y][x] === s) real++;
        for (const [dy, dx] of [[1,0],[-1,0],[0,1],[0,-1]]) {
          const ny = y + dy, nx = x + dx;
          if (ny < 0 || nx < 0 || ny >= ROWS || nx >= COLS || seen[ny][nx]) continue;
          const v = g[ny][nx];
          if (v === s || v === SYM.WILD) { seen[ny][nx] = true; st.push([ny, nx]); }
        }
      }
      if (cells.length >= 5 && real > 0) {
        let mult = 0, wilds = 0;   // multiple wilds in a cluster add their multipliers
        for (const [y, x] of cells) if (g[y][x] === SYM.WILD) { mult += wm[y][x]; wilds++; }
        if (!wilds) mult = 1;
        out.push({ symbol: s, size: cells.length, cells, wilds, wildMult: mult });
      }
    }
  }
  return out;
}

function reforge(g, wm, rng, mult = 1) {
  const cand = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (g[r][c] <= LOW_MAX) cand.push([r, c]);
  if (!cand.length) return null;
  const [r, c] = cand[Math.floor(rng() * cand.length)];
  const was = g[r][c]; g[r][c] = SYM.WILD; wm[r][c] = mult;
  return { r, c, was, mult };
}

/* Heat thresholds on the 9-notch Core: 3 = passive flat bonus, 6 = reforge, 9 = detonation.
 * Each of reforge / detonation fires at most once per spin sequence (`fired`), even if bonus heat keeps climbing. */
function heatEvents(from, to, g, wm, rng, fired) {
  const ev = [];
  for (let h = from + 1; h <= to; h++) {
    const k = h % 9;
    if (k === 6 && !fired.reforge) {
      fired.reforge = true;
      const f = reforge(g, wm, rng); if (f) ev.push({ type: 'reforge', heat: h, cells: [f] });
    } else if (k === 0 && !fired.detonate) { fired.detonate = true; ev.push(detonate(g, wm, rng, h)); }
  }
  return ev;
}
function detonate(g, wm, rng, heat, forced = false) {
  const doubled = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
    if (g[r][c] === SYM.WILD) { wm[r][c] *= 2; doubled.push({ r, c, mult: wm[r][c] }); }
  const f = reforge(g, wm, rng);
  return { type: 'detonate', heat, forced, doubled, cells: f ? [f] : [] };
}
const wildList = (g, wm) => {
  const o = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (g[r][c] === SYM.WILD) o.push({ r, c, mult: wm[r][c] });
  return o;
};

/* One spin = initial grid + full cascade chain. heat0 is the Core heat carried in. */
export function playSpin(rng, { heat0 = 0, ante = false, forceDetonate = false, noScatter = false, inBonus = false, weights = CFG.weights } = {}) {
  let g = initialGrid(rng, noScatter ? 0 : ante ? CFG.anteScatterP : CFG.scatterP, weights);
  const wm = newGrid(1);
  const out = { initialGrid: clone(g), startHeat: heat0, openingEvents: [], cascadeSteps: [], totalPayout: 0, scatters: 0 };
  for (const row of g) for (const v of row) if (v === SYM.SCATTER) out.scatters++;

  let heat = heat0;
  // carried-in heat (pre-heated / persisted) already past thresholds on the fresh board
  const fired = { reforge: false, detonate: false };
  if (heat >= 6) out.openingEvents.push(...heatEvents(0, 6, g, wm, rng, fired));
  if (heat >= 9) out.openingEvents.push(...heatEvents(6, 9, g, wm, rng, fired));
  if (forceDetonate) { fired.detonate = true; out.openingEvents.push(detonate(g, wm, rng, heat, true)); }
  out.openingGrid = clone(g); out.openingWilds = wildList(g, wm);

  let total = 0;
  for (let step = 0; step < CFG.maxSteps; step++) {
    const clusters = findClusters(g, wm);
    if (!clusters.length) break;
    const tiers = heat < 3 ? 0 : inBonus ? Math.min(Math.floor(heat / 3), CFG.bonusFlatCap) : 1;
    let payout = 0, wildClusters = 0;
    const cleared = [], cl = [];
    for (const k of clusters) {
      const base = PAYTABLE[k.symbol][bucket(k.size)] + tiers * CFG.heatFlat;
      const pay = base * k.wildMult * CFG.payScale;
      payout += pay; if (k.wilds) wildClusters++;
      cl.push({ symbol: k.symbol, size: k.size, payout: pay, wildMult: k.wildMult, cells: k.cells.map(([r, c]) => ({ r, c })) });
      for (const [r, c] of k.cells) if (g[r][c] !== SYM.WILD && !cleared.some(q => q.r === r && q.c === c))
        cleared.push({ r, c, sym: g[r][c] });
    }
    if (total + payout >= CFG.maxWin) { payout = CFG.maxWin - total; out.capped = true; }
    total += payout;

    for (const q of cleared) g[q.r][q.c] = -1;
    const newCells = [];
    for (const q of cleared) { const s = pickSymbol(rng, weights); g[q.r][q.c] = s; newCells.push({ r: q.r, c: q.c, sym: s }); }

    const prev = heat; heat += 1 + wildClusters;
    const reforgeEvents = out.capped ? [] : heatEvents(prev, heat, g, wm, rng, fired);
    out.cascadeSteps.push({
      clusters: cl, clearedCells: cleared, payout, newCells, coreHeat: heat, reforgeEvents,
      wilds: wildList(g, wm), grid: clone(g)
    });
    if (out.capped) break;
  }
  out.totalPayout = total; out.endHeat = heat;
  return out;
}

/* Full round: base spin (+ whole bonus if triggered). Payouts are in multiples of the base bet. */
/* A bought bonus first plays a visible trigger spin: a board that lands n Forgefire Gems and pays nothing. */
function triggerGrid(rng, n) {
  let g;
  for (let tries = 0; tries < 300; tries++) {
    g = initialGrid(rng, 0, CFG.weights);
    const used = [];
    while (used.length < n) { const r = Math.floor(rng() * ROWS), c = Math.floor(rng() * COLS); if (!used.some(q => q[0] === r && q[1] === c)) used.push([r, c]); }
    used.forEach(([r, c]) => { g[r][c] = SYM.SCATTER; });
    if (!findClusters(g, newGrid(1)).length) break;
  }
  return g;
}

export function playRound(rng, { ante = false, buy = null } = {}) {
  const bonusFrom = (startHeat, bw = CFG.bonusWeights) => {
    const spins = []; let heat = startHeat, left = CFG.freeSpins, n = 0, total = 0, awarded = CFG.freeSpins;
    while (left > 0 && n < CFG.maxBonusSpins && total < CFG.maxWin) {
      n++; left--;
      const s = playSpin(rng, { heat0: heat, forceDetonate: n % 3 === 0, weights: bw, inBonus: true });
      s.spinIndex = n; heat = s.endHeat; total += s.totalPayout;
      if (s.scatters >= CFG.retriggerMin) { left += CFG.retriggerSpins; awarded += CFG.retriggerSpins; s.retrigger = CFG.retriggerSpins; }
      s.spinsLeft = left;
      spins.push(s);
    }
    return { spins, totalPayout: Math.min(total, CFG.maxWin), freeSpinsAwarded: awarded, startSpins: CFG.freeSpins, endHeat: heat };
  };

  if (buy) {
    const b = CFG.buy[buy];
    const bonus = bonusFrom(b.heat);
    return { cost: b.cost, initialGrid: triggerGrid(rng, buy === 'preheated' ? 4 : 3), cascadeSteps: [], baseSpin: null, bonus, bonusTriggered: true,
      freeSpinsAwarded: bonus.freeSpinsAwarded, totalPayout: bonus.totalPayout, bought: buy };
  }
  const base = playSpin(rng, { ante });
  const trig = base.scatters >= 3;
  let bonus = null, total = base.totalPayout;
  if (trig) { bonus = bonusFrom(CFG.bonusStartHeat, ante ? CFG.anteBonusWeights : CFG.bonusWeights); total = Math.min(CFG.maxWin, total + bonus.totalPayout); }
  return {
    cost: ante ? CFG.anteCost : 1,
    initialGrid: base.initialGrid, openingEvents: base.openingEvents, openingGrid: base.openingGrid,
    cascadeSteps: base.cascadeSteps, basePayout: base.totalPayout,
    totalPayout: total, bonusTriggered: trig, freeSpinsAwarded: trig ? bonus.freeSpinsAwarded : 0,
    bonus, capped: !!base.capped || total >= CFG.maxWin
  };
}
