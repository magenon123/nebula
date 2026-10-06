/* RATTLEROCK RUN: mine-cart ride. Self-contained pure engine (SlotForge ENGINE-API v1). Round JSON: plans/rattlerock-run-round-format.md.
 * No imports except 'crypto'. No Math.random, no clock. Money = multiples of the base bet. ALL randomness comes from the rng passed in.
 *
 * Rules (covered by tools/rattlerock.test.js):
 *  - BASE RUN: up to 12 stops (CFG.base.lenW, the last one is the DOOR). Stop types: gold (load += value), gem 2/3/5/10 (mult += value, gauge starts at 1),
 *    fork (a rich and a safe side, server picks; the taken side acts like a normal stop), shield (cancels the next TNT, they stack), tnt (no shield: crash, run pays
 *    only the load; with shield: shield consumed, harmless), lantern (3 on one run trigger Deep Shaft after the run), door (pay = load*mult + jackpot).
 *  - DEEP SHAFT: 3 carts, 3 levels. A level is a track (CFG.bonus.levels[l]); reaching its door banks load*mult and the cart goes one level deeper. Multiplier and shields
 *    carry between levels and carts, load does not. TNT without shield costs a cart (level pays only the load), the next cart replays the SAME level on a fresh track.
 *    The bonus ends when carts are gone or the bottom door (level 3) is reached (bottom door adds a jackpot step with small chance). Pays the sum.
 *  - TWIN CARTS (ante, CFG.anteCost): two independent base runs, both paid; shield weight x CFG.ante.shieldMult, gold x CFG.ante.goldScale; lantern chance per stop is unchanged.
 *    One bonus at most, even if both carts collect 3 lanterns.
 *  - BUYS: `deep` (level 1) and `motherlode` (level 2, extra shields, start mult). The trigger run is 3 lanterns and pays 0.
 *  - Cap CFG.maxWin: totals are clipped, capped=true when reached; a bonus stops at the segment that reaches the remaining cap.
 */
import crypto from 'crypto';

export const id = 'rattlerock-run';
export const name = 'Rattlerock Run';

const r2 = x => Math.round(x * 100) / 100;
const SPACING = 100;

/* Stop profile = one table set (base / ante / each bonus level). w = stop weights; goldV/gemV = [value, weight]; fork rich/safe tables; jackpot = door jackpot. */
const GOLD = [[0.05, 30], [0.1, 28], [0.2, 22], [0.5, 12], [1, 6], [2.5, 2]];
const GOLDB = [[0.04, 32], [0.08, 28], [0.16, 20], [0.32, 12], [0.8, 6], [1.6, 2]];
const GEM = [[2, 50], [3, 30], [5, 15], [10, 5]];
const FORK = { richP: 0.5, goldMult: { rich: 2.5, safe: 0.5 },
  rich: { gold: 40, gem: 30, shield: 5, tnt: 22, lantern: 3 }, safe: { gold: 55, shield: 20, none: 22, tnt: 3 } };
const BASE = { lenW: [[6, 6], [7, 10], [8, 14], [9, 18], [10, 20], [11, 18], [12, 14]],
  w: { gold: 32, gem: 5, fork: 10, shield: 5, tnt: 23, lantern: 5.2 }, goldV: GOLDB, gemV: GEM, fork: FORK,
  jackpotP: 0.003, jackpot: [[25, 72], [100, 24], [500, 3.8], [1000, 0.2]] };

export const CFG = {
  bets: [0.1,0.2,0.3,0.4,0.5,0.6,0.8,1,1.5,2,2.5,3,4,5,6,8,10,12,15,20,25,30,40,50,60,80,100,150,200,250,300,400,500,750,1000,1500,2000,3000,4000,5000,7500,10000],
  maxWin: 7500,
  anteCost: 2.5,
  buy: {
    deep: { cost: 70, name: 'Deep Shaft', startLevel: 1, startMult: 1, startShields: 0 },
    motherlode: { cost: 140, name: 'Motherlode Run', startLevel: 2, startMult: 10, startShields: 2 }
  },
  spacing: SPACING, carts: 3, levels: 3, lanternsToTrigger: 3,
  goldScale: 1.095, anteScale: 1.043, bonusScale: 1.008, motherScale: 1.065,      // global RTP knobs (sim --cfg '{"goldScale":1.02}')
  base: BASE,
  ante: { shieldMult: 1.6, goldScale: 1.2 },
  bonus: { levels: [
    { len: 6, w: { gold: 44, gem: 7, fork: 10, shield: 6, tnt: 10, lantern: 0 }, goldV: GOLD, gemV: GEM, fork: FORK, goldScale: 1.4, jackpotP: 0, jackpot: [] },
    { len: 7, w: { gold: 42, gem: 9, fork: 10, shield: 6, tnt: 11, lantern: 0 }, goldV: GOLD, gemV: [[2, 30], [3, 30], [5, 25], [10, 15]], fork: FORK, goldScale: 2.2, jackpotP: 0, jackpot: [] },
    { len: 8, w: { gold: 40, gem: 11, fork: 10, shield: 6, tnt: 12, lantern: 0 }, goldV: GOLD, gemV: [[3, 20], [5, 30], [10, 30], [25, 18], [50, 2]], fork: FORK, goldScale: 3.4, jackpotP: 0.06, jackpot: [[50, 60], [250, 28], [1000, 10.5], [2500, 1.35], [7500, 0.15]] }
  ] }
};
CFG.payscale = { gold: GOLD.map(g => g[0]), gem: GEM.map(g => g[0]), forkGoldMult: FORK.goldMult, jackpot: BASE.jackpot.map(j => j[0]) };

function pickW(rng, entries) {   // entries [[value, weight]]
  let t = 0; for (const e of entries) t += e[1];
  let x = rng() * t;
  for (const e of entries) { x -= e[1]; if (x < 0) return e[0]; }
  return entries[entries.length - 1][0];
}
const pickObj = (rng, o) => pickW(rng, Object.entries(o).filter(e => e[1] > 0));

/* one item (a plain stop content or a fork side) */
function genItem(rng, type, P, scale, goldMult = 1) {
  if (type === 'gold') return { type, value: r2(pickW(rng, P.goldV) * scale * goldMult) };
  if (type === 'gem') return { type, value: pickW(rng, P.gemV) };
  return { type };
}
function applyItem(st, it) {   // mutates run state, returns the extra fields of the stop (shielded/crash)
  const out = {};
  if (it.type === 'gold') st.load = r2(st.load + it.value);
  else if (it.type === 'gem') st.mult += it.value;
  else if (it.type === 'shield') st.shields++;
  else if (it.type === 'lantern') st.lanterns++;
  else if (it.type === 'tnt') { if (st.shields > 0) { st.shields--; out.shielded = true; out.crash = false; } else { out.shielded = false; out.crash = true; st.crashed = true; } }
  return out;
}
function snap(s, st) { s.load = st.load; s.mult = st.mult; s.shields = st.shields; s.lanterns = st.lanterns; return s; }
function genStop(rng, i, st, P, scale) {
  const type = pickObj(rng, P.w), s = { i, at: i * SPACING, type };
  if (type === 'fork') {
    const F = P.fork, richLeft = rng() < 0.5, takeRich = rng() < F.richP;
    const noL = P.w.lantern > 0 ? o => o : o => ({ ...o, lantern: 0 });   // no lanterns inside forks where the track has none (bonus)
    const rich = genItem(rng, pickObj(rng, noL(F.rich)), P, scale, F.goldMult.rich), safe = genItem(rng, pickObj(rng, noL(F.safe)), P, scale, F.goldMult.safe);
    s.left = richLeft ? rich : safe; s.right = richLeft ? safe : rich;
    s.side = takeRich === richLeft ? 'left' : 'right'; s.pick = takeRich ? 'rich' : 'safe';
    s.taken = { ...(takeRich ? rich : safe) }; Object.assign(s.taken, applyItem(st, s.taken));
  } else {
    const it = genItem(rng, type, P, scale); if (it.value !== undefined) s.value = it.value;
    Object.assign(s, applyItem(st, it));
  }
  return snap(s, st);
}
const doorOf = (rng, i, st, P, scale, withJackpot) => {
  let jackpot = 0;
  if (withJackpot && P.jackpotP > 0 && rng() < P.jackpotP) jackpot = pickW(rng, P.jackpot);
  const pay = r2(st.load * st.mult + jackpot);
  return snap({ i, at: i * SPACING, type: 'door', kind: jackpot ? 'jackpot' : 'normal', jackpot, pay }, st);
};

/* Play one track. st = {load,mult,shields,lanterns}; returns {stops, exit:'door'|'crash', crashAt, pay, bonusAt}. */
function playTrack(rng, len, st, P, scale, trigger) {
  const stops = []; let bonusAt = null, crashAt = null, exit = 'door', pay = 0;
  for (let i = 1; i < len; i++) {
    const before = st.lanterns, s = genStop(rng, i, st, P, scale); stops.push(s);
    if (bonusAt === null && trigger && before < trigger && st.lanterns >= trigger) bonusAt = i;
    if (st.crashed) { exit = 'crash'; crashAt = i; pay = st.load; break; }
  }
  if (exit === 'door') { const d = doorOf(rng, len, st, P, scale, true); stops.push(d); pay = d.pay; }
  return { stops, exit, crashAt, pay, bonusAt };
}

function baseRun(rng, idx, P, scale) {
  const len = pickW(rng, P.lenW), st = { load: 0, mult: 1, shields: 0, lanterns: 0, crashed: false };
  const t = playTrack(rng, len, st, P, scale, CFG.lanternsToTrigger);
  return { run: idx, kind: 'ride', length: len, spacing: SPACING, stops: t.stops, exit: t.exit, crash: t.exit === 'crash', crashAt: t.crashAt,
    lanterns: st.lanterns, bonusAt: t.bonusAt, load: st.load, mult: st.mult, shields: st.shields, pay: r2(t.pay) };
}
const triggerRun = () => {
  const stops = [1, 2, 3].map(i => ({ i, at: i * SPACING, type: 'lantern', load: 0, mult: 1, shields: 0, lanterns: i }));
  return { run: 0, kind: 'trigger', length: 3, spacing: SPACING, stops, exit: 'bonus', crash: false, crashAt: null, lanterns: 3, bonusAt: 3, load: 0, mult: 1, shields: 0, pay: 0 };
};

function deepShaft(rng, startLevel, startMult, startShields, triggeredBy, scaleMul, capLeft) {
  const L = CFG.bonus.levels, spins = []; let carts = CFG.carts, level = startLevel, mult = startMult, shields = startShields, sum = 0, bottom = false, lost = 0, capped = false;
  while (carts > 0 && !bottom && spins.length < CFG.carts + CFG.levels) {
    const P = L[level - 1], st = { load: 0, mult, shields, lanterns: 0, crashed: false }, multIn = mult, shieldsIn = shields, cartNo = CFG.carts - carts + 1;
    const t = playTrack(rng, P.len, st, P, P.goldScale * CFG.bonusScale * scaleMul, 0);
    const crash = t.exit === 'crash', last = level === CFG.levels;
    if (crash) { carts--; lost++; }
    const pay = r2(t.pay); sum += pay;
    spins.push({ spinIndex: spins.length + 1, spinsLeft: carts, cart: cartNo, level, length: P.len, spacing: SPACING, stops: t.stops, multIn, multOut: st.mult,
      shieldsIn, shieldsOut: st.shields, exit: crash ? 'crash' : last ? 'bottom' : 'level', load: st.load, pay, totalPayout: pay, cartLost: crash, bonusPayoutSoFar: r2(sum) });
    mult = st.mult; shields = st.shields;
    if (!crash) { if (last) bottom = true; else level++; }
    if (sum >= capLeft) { capped = true; break; }
  }
  const total = Math.min(CFG.maxWin, r2(sum));
  return { type: 'deepShaft', startSpins: CFG.carts, carts: CFG.carts, levels: CFG.levels, startLevel, startMult, startShields, triggeredBy, spins,
    bottomReached: bottom, cartsLost: lost, capped, totalPayout: total };
}

export function playRound(rng, { ante = false, buy = null } = {}) {
  const cap = CFG.maxWin;
  let runs, trig = [], bonus = null, bought = null;
  if (buy) {
    const B = CFG.buy[buy]; if (!B) throw new Error('unknown buy ' + buy);
    bought = buy; runs = [triggerRun()];
    bonus = deepShaft(rng, B.startLevel, B.startMult, B.startShields, [], buy === 'motherlode' ? CFG.motherScale : 1, cap);
  } else {
    const prof = ante ? { ...CFG.base, w: { ...CFG.base.w, shield: CFG.base.w.shield * CFG.ante.shieldMult } } : CFG.base;
    const scale = CFG.goldScale * (ante ? CFG.anteScale * CFG.ante.goldScale : 1);
    runs = []; for (let k = 0; k < (ante ? 2 : 1); k++) { const r = baseRun(rng, k, prof, scale); runs.push(r); if (r.bonusAt !== null) trig.push(k); }
    if (trig.length) { const base0 = runs.reduce((a, r) => a + r.pay, 0); bonus = deepShaft(rng, 1, 1, 0, trig, 1, cap - base0); }
  }
  const basePayout = buy ? 0 : r2(runs.reduce((a, r) => a + r.pay, 0));
  const raw = basePayout + (bonus ? bonus.totalPayout : 0), totalPayout = Math.min(cap, r2(raw));
  return { v: 1, mode: buy ? 'buy' : ante ? 'ante' : 'base', bought, ante: !!ante, cost: buy ? CFG.buy[buy].cost : ante ? CFG.anteCost : 1,
    runs, initialGrid: runs.map(r => r.stops.map(s => s.type)), cascadeSteps: buy ? [] : runs.map(r => ({ run: r.run, payout: r.pay })),
    basePayout, bonusTriggered: !!bonus, bonus, totalPayout, capped: raw >= cap - 1e-9 };
}

export function info() {
  return { symbols: ['gold', 'gem', 'fork', 'shield', 'tnt', 'lantern', 'door'], payscale: CFG.payscale, gem: CFG.base.gemV.map(g => g[0]), maxStops: 12,
    carts: CFG.carts, levels: CFG.levels, anteCost: CFG.anteCost, buy: CFG.buy, maxWin: CFG.maxWin };
}
export function cryptoRng() { return crypto.randomBytes(6).readUIntBE(0, 6) / 281474976710656; }   // 48-bit uniform [0,1)
