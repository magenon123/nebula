/* LUCKY LLAMA FIESTA: 5x3, 20 paylines, Piñata Link (hold & win) + Poncho Parade (sticky wild ladder).
 * Self-contained pure engine (SlotForge ENGINE-API v1). Round JSON: plans/lucky-llama-fiesta-round-format.md.
 * No imports except 'crypto'. No Math.random, no clock. Money = multiples of the TOTAL bet. ALL randomness comes from the rng passed in
 * (the strip layout below is a fixed deterministic construction at load time, not randomness of a round).
 *
 * Rules (covered by tools/lucky-llama.test.js):
 *  - 20 fixed lines, left to right from reel 1, 3+ adjacent, highest win per line, line wins add. WLD substitutes for everything except SCA/MON; a pure wild line pays as LUC.
 *  - Reels are weighted strips (CFG.reels[profile][reel] = symbol counts, built into explicit circular strips; separate profiles base / ante / parade). A reel stops on a
 *    uniform strip index and shows 3 consecutive symbols. Scatters never sit within 3 places of each other on a strip (max 1 per reel).
 *  - SCA (Fiesta Drum): 3/4/5 = 8/12/20 Parade spins; 3 more drums inside the bonus = +3 spins (cap CFG.parade.maxSpins).
 *  - MON (money piñata): value table x1-x25 plus MINI 20 / MINOR 50 / MAJOR 250 / GRAND 2000. Pays nothing alone in the base game.
 *  - PIÑATA LINK: 6+ MON on one spin (and no drum trigger) freeze; 3 respins; each respin every empty cell lands a piñata with p = CFG.link.p, a landing resets respins to 3;
 *    ends at 0 respins or a full board (15 = GRAND + every value). Cracks left to right pay the total.
 *  - PONCHO PARADE: every WLD sticks; ladder by wild count applies to ALL line wins of every spin; MON in Parade never start Link, the Collector grabs every visible MON (unmultiplied).
 *  - FIESTA LUCK (ante, CFG.anteCost 2): the base spin uses CFG.reels.ante (more drums and piñatas). NO MAX LUCK: `luck` throws.
 *  - BUYS: parade (3/4/5 drums), link (6 piñatas), party (parade with 3 sticky ponchos). The trigger spin pays 0.
 *  - Cap CFG.maxWin: totals are clipped, capped=true when reached; the bonus stops at the spin that reaches the remaining cap.
 *  - Scale knobs (sim --cfg '{"lineScale":1.02}'): lineScale (base/ante line pays), linkScale (ordinary piñata values in the base game and Link), paradeScale (Parade line pays), parade.grabScale (Parade piñata grabs).
 */
import crypto from 'crypto';

export const id = 'lucky-llama-fiesta';
export const name = 'Lucky Llama Fiesta';

const r4 = x => Math.round(x * 1e4) / 1e4;
const SYM = ['MAR', 'MAC', 'CHI', 'GUI', 'TAC', 'SKU', 'SOM', 'MAS', 'TRU', 'LUC', 'WLD', 'SCA', 'MON'];
const LUC = 9, WLD = 10, SCA = 11, MON = 12, NREEL = 5, NROW = 3, NCELL = 15;
// 20 fixed paylines (row per reel, 0 = top)
const LINES = [[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,0,0],[2,2,1,2,2],[1,2,2,2,1],[1,0,0,0,1],[0,1,1,1,0],
  [2,1,1,1,2],[1,0,1,2,1],[1,2,1,0,1],[0,1,0,1,0],[2,1,2,1,2],[1,1,0,1,1],[1,1,2,1,1],[0,0,1,2,2],[2,2,1,0,0],[0,2,0,2,0]];

/* reel counts: [MAR,MAC,CHI,GUI,TAC,SKU,SOM,MAS,TRU,LUC,WLD,SCA,MON] per reel */
const R = a => { const o = {}; SYM.forEach((s, i) => { if (a[i]) o[s] = a[i]; }); return o; };
const REELS = {
  base: [
    R([20, 20, 16, 14, 13, 8, 7, 5, 4, 4, 0, 3, 14]),
    R([20, 20, 16, 14, 13, 8, 7, 5, 4, 4, 6, 4, 14]),
    R([20, 20, 16, 14, 13, 8, 7, 5, 4, 4, 6, 3, 14]),
    R([20, 20, 16, 14, 13, 8, 7, 5, 4, 4, 6, 4, 14]),
    R([20, 20, 16, 14, 13, 8, 7, 5, 4, 4, 6, 3, 14])],
  ante: [
    R([20, 20, 16, 14, 13, 8, 7, 5, 4, 4, 0, 3, 14]),
    R([20, 20, 16, 14, 13, 8, 7, 5, 4, 4, 6, 4, 14]),
    R([20, 20, 16, 14, 13, 8, 7, 5, 4, 4, 6, 3, 14]),
    R([20, 20, 16, 14, 13, 8, 7, 5, 4, 4, 6, 4, 14]),
    R([20, 20, 16, 14, 13, 8, 7, 5, 4, 4, 6, 3, 14])],
  parade: [0, 1, 2, 3, 4].map(() => R([12, 12, 11, 10, 9, 8, 7, 6, 6, 6, 2, 1, 10]))
};

export const CFG = {
  bets: [0.1,0.2,0.3,0.4,0.5,0.6,0.8,1,1.5,2,2.5,3,4,5,6,8,10,12,15,20,25,30,40,50,60,80,100,150,200,250,300,400,500,750,1000,1500,2000,3000,4000,5000,7500,10000],
  maxWin: 7500,
  anteCost: 2,
  buy: {
    parade: { cost: 80, name: 'Poncho Parade', drumsW: [[3, 96], [4, 3.9], [5, 0.1]], sticky: 0 },
    link: { cost: 60, name: 'Piñata Link', pinatas: 6 },
    party: { cost: 180, name: 'Party Pack', drumsW: [[3, 96], [4, 3.9], [5, 0.1]], sticky: 3 }
  },
  rows: NROW, reelCount: NREEL, lines: LINES, symbols: SYM,
  /* x TOTAL bet for 3 / 4 / 5 of a kind on a line (WLD pays as LUC) */
  paytable: { MAR: [0.25, 0.75, 3], MAC: [0.25, 0.9, 3.5], CHI: [0.4, 1.2, 4.5], GUI: [0.4, 1.5, 6], TAC: [0.5, 2, 8],
    SKU: [0.75, 3, 12], SOM: [1, 4.5, 18], MAS: [1.5, 6, 25], TRU: [2, 8, 35], LUC: [3, 12, 50] },
  lineScale: 1, linkScale: 1, paradeScale: 0.45,
  reels: REELS,
  layout: { base: 44, ante: 44, parade: 1 },   // shuffle seed of the strip layout per profile (the strips are explicit, see info().strips); ANY change of reel counts reshuffles: re-run the sim
  link: { p: 0.06, respins: 3, trigger: 6,
    values: [[1, 26], [2, 22], [3, 16], [5, 12], [8, 8], [10, 6], [15, 4], [25, 2]],
    jackpots: { MINI: 20, MINOR: 50, MAJOR: 250, GRAND: 2000 },
    jackpotP: { MINI: 0.012, MINOR: 0.004, MAJOR: 0.0006, GRAND: 0.00004 } },
  parade: { spins: { 3: 8, 4: 12, 5: 20 }, retrigger: 3, maxSpins: 60, grabScale: 0.7,
    ladder: [[1, 1], [2, 2], [3, 3], [5, 5], [7, 8], [10, 10]],
    values: [[1, 30], [2, 25], [3, 16], [5, 11], [8, 8], [10, 5], [15, 3], [25, 2]],
    jackpotP: { MINI: 0.01, MINOR: 0.003, MAJOR: 0.0004, GRAND: 0.00002 } }
};
CFG.payscale = { paytable: CFG.paytable, linkValues: CFG.link.values.map(v => v[0]), jackpots: CFG.link.jackpots, ladder: CFG.parade.ladder, drums: CFG.parade.spins };

/* ---------- strips (explicit, deterministic) ---------- */
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function buildStrip(counts, seed) {
  const arr = []; SYM.forEach((s, i) => { for (let k = 0; k < (counts[s] || 0); k++) arr.push(i); });
  const L = arr.length, rnd = mulberry(seed);
  for (let i = L - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  const viol = () => { let v = 0; for (let i = 0; i < L; i++) { const a = arr[i], b = arr[(i + 1) % L]; if (a === b && a !== MON && a !== WLD) v++; if (a === SCA) for (let d = 1; d <= 2; d++) if (arr[(i + d) % L] === SCA) v += 2; } return v; };
  let v = viol();
  for (let it = 0; it < 20000 && v > 0; it++) {
    const i = Math.floor(rnd() * L), j = Math.floor(rnd() * L); if (i === j) continue;
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t; const nv = viol();
    if (nv <= v) v = nv; else { arr[j] = arr[i]; arr[i] = t; }
  }
  return Int8Array.from(arr);
}
const cache = new Map();
function profile(name) {
  const counts = CFG.reels[name], lay = CFG.layout[name]; let c = cache.get(counts);
  if (c && c.lay !== lay) c = null;
  if (!c) {
    const strips = counts.map((cn, r) => buildStrip(cn, 100003 * lay + 7919 * r + 13));
    // per reel: stop pools by window content (for the bought trigger spins)
    const win = (s, st, k) => s[(st + k) % s.length];
    const pools = strips.map(s => { const o = { sca0: [], sca1: [], mon: [[], [], [], []] }; for (let st = 0; st < s.length; st++) {
      let sc = 0, mn = 0; for (let k = 0; k < 3; k++) { const x = win(s, st, k); if (x === SCA) sc++; else if (x === MON) mn++; }
      if (sc === 0) { o.sca0.push(st); o.mon[mn].push(st); } else if (sc === 1) o.sca1.push(st); } return o; });
    // joint money-count combos summing to the link trigger count (no drums)
    const combos = []; let tot = 0; const T = CFG.link.trigger;
    for (let a = 0; a < 4 ** NREEL; a++) { const m = []; let x = a, sum = 0, w = 1; for (let r = 0; r < NREEL; r++) { const k = x % 4; x = (x - k) / 4; m.push(k); sum += k; w *= pools[r].mon[k].length; } if (sum === T && w > 0) { tot += w; combos.push({ m, cum: tot }); } }
    c = { strips, pools, combos, comboTotal: tot, lay }; cache.set(counts, c);
  }
  return c;
}
export function rebuildStrips() { cache.clear(); }

/* ---------- helpers ---------- */
function pickW(rng, entries) { let t = 0; for (const e of entries) t += e[1]; let x = rng() * t; for (const e of entries) { x -= e[1]; if (x < 0) return e[0]; } return entries[entries.length - 1][0]; }
const cellOf = i => ({ reel: Math.floor(i / NROW), row: i % NROW });

/* one piñata value: {value, jackpot}. table = CFG.link or CFG.parade; scale = linkScale (Link) or paradeScale (grabs) */
function drawValue(rng, T, scale) {
  const x = rng(); let acc = 0;
  for (const k of ['GRAND', 'MAJOR', 'MINOR', 'MINI']) { acc += T.jackpotP[k]; if (x < acc) return { value: CFG.link.jackpots[k], jackpot: k }; }
  return { value: r4(pickW(rng, T.values) * scale), jackpot: null };
}

/* line evaluation on a flat grid g[reel*3+row] */
function evalLines(g, scale) {
  const wins = []; let sum = 0; const P = CFG.paytable;
  for (let li = 0; li < LINES.length; li++) {
    const L = LINES[li]; let sym = -1, n = 0, wp = 0, lead = true;
    for (let r = 0; r < NREEL; r++) {
      const c = g[r * NROW + L[r]];
      if (c === SCA || c === MON) break;
      if (c === WLD) { n++; if (lead) wp++; } else { lead = false; if (sym < 0) { sym = c; n++; } else if (c === sym) n++; else break; }
    }
    let pay = 0, s = -1, cnt = 0;
    if (sym >= 0 && n >= 3) { pay = P[SYM[sym]][n - 3]; s = sym; cnt = n; }
    if (wp >= 3) { const pw = P.LUC[wp - 3]; if (pw > pay) { pay = pw; s = LUC; cnt = wp; } }
    if (sym < 0 && n >= 3) { pay = P.LUC[n - 3]; s = LUC; cnt = n; }
    if (pay > 0) {
      const cells = []; for (let r = 0; r < cnt; r++) cells.push({ reel: r, row: L[r] });
      const p = r4(pay * scale); wins.push({ line: li + 1, symbol: SYM[s], count: cnt, pay: p, cells }); sum += p;
    }
  }
  return { wins, sum: r4(sum) };
}

function draw(rng, prof, sticky) {
  const strips = prof.strips, stops = [], g = new Int8Array(NCELL);
  for (let r = 0; r < NREEL; r++) { const s = strips[r], st = Math.floor(rng() * s.length); stops.push(st); for (let k = 0; k < NROW; k++) g[r * NROW + k] = s[(st + k) % s.length]; }
  if (sticky) for (let i = 0; i < NCELL; i++) if (sticky[i]) g[i] = WLD;
  return { stops, g };
}
function tease(g) {
  const t = [false, false, false, false, false]; let kind = null, sc = 0, mn = 0;
  for (let r = 0; r < NREEL; r++) {
    if (r > 0) { if (sc >= 2) { t[r] = true; kind = 'scatter'; } else if (mn >= 4 && mn < CFG.link.trigger) { t[r] = true; if (!kind) kind = 'money'; } }
    for (let k = 0; k < NROW; k++) { const c = g[r * NROW + k]; if (c === SCA && r < 3) sc++; else if (c === MON) mn++; }
  }
  return { tease: t, teaseKind: kind };
}
const gridOf = g => { const out = []; for (let r = 0; r < NREEL; r++) out.push([SYM[g[r * NROW]], SYM[g[r * NROW + 1]], SYM[g[r * NROW + 2]]]); return out; };

/* a full Spin object from stops/grid. valT/valScale = how piñata values are drawn */
function makeSpin(rng, stopsG, stripName, valT, valScale, prevSticky, lineScale) {
  const { stops, g } = stopsG, ev = evalLines(g, lineScale), wilds = [], scat = [], money = [];
  for (let i = 0; i < NCELL; i++) {
    const c = g[i];
    if (c === WLD) { const o = cellOf(i); o.sticky = !!prevSticky; o.new = prevSticky ? !prevSticky[i] : false; wilds.push(o); }
    else if (c === SCA) scat.push(cellOf(i));
    else if (c === MON) { const o = cellOf(i), v = drawValue(rng, valT, valScale); o.value = v.value; o.jackpot = v.jackpot; money.push(o); }
  }
  const tz = tease(g);
  return { reelStops: stops, strip: stripName, grid: gridOf(g), wins: ev.wins, linePayout: ev.sum, wilds, scatters: scat, money, tease: tz.tease, teaseKind: tz.teaseKind, totalPayout: ev.sum };
}

/* ---------- bought trigger spins ---------- */
function pickIdx(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function triggerParade(rng, nDrums) {
  const prof = profile('base');
  for (let tries = 0; tries < 2000; tries++) {
    const reels = [0, 1, 2, 3, 4]; for (let i = 4; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = reels[i]; reels[i] = reels[j]; reels[j] = t; }
    const has = new Set(reels.slice(0, nDrums)), stops = [], g = new Int8Array(NCELL); let mon = 0;
    for (let r = 0; r < NREEL; r++) {
      const st = pickIdx(rng, has.has(r) ? prof.pools[r].sca1 : prof.pools[r].sca0), s = prof.strips[r]; stops.push(st);
      for (let k = 0; k < NROW; k++) { const c = s[(st + k) % s.length]; g[r * NROW + k] = c; if (c === MON) mon++; }
    }
    if (mon >= CFG.link.trigger || evalLines(g, 1).wins.length) continue;
    return { stops, g };
  }
  throw new Error('trigger spin generation failed (strips too dense?)');
}
function triggerLink(rng) {
  const prof = profile('base');
  for (let tries = 0; tries < 2000; tries++) {
    const x = rng() * prof.comboTotal; let c = prof.combos[prof.combos.length - 1]; for (const e of prof.combos) if (x < e.cum) { c = e; break; }
    const stops = [], g = new Int8Array(NCELL);
    for (let r = 0; r < NREEL; r++) { const st = pickIdx(rng, prof.pools[r].mon[c.m[r]]), s = prof.strips[r]; stops.push(st); for (let k = 0; k < NROW; k++) g[r * NROW + k] = s[(st + k) % s.length]; }
    if (evalLines(g, 1).wins.length) continue;
    return { stops, g };
  }
  throw new Error('link trigger spin generation failed');
}

/* ---------- features ---------- */
function playLink(rng, startMoney, trigger) {
  const L = CFG.link, filled = new Array(NCELL).fill(null);
  for (const m of startMoney) filled[m.reel * NROW + m.row] = { value: m.value, jackpot: m.jackpot };
  let cnt = startMoney.length, respins = L.respins; const spins = [];
  while (respins > 0 && cnt < NCELL) {
    const landed = [];
    for (let i = 0; i < NCELL; i++) if (!filled[i] && rng() < L.p) { const v = drawValue(rng, L, CFG.linkScale), o = cellOf(i); o.value = v.value; o.jackpot = v.jackpot; filled[i] = v; landed.push(o); }
    const before = respins; cnt += landed.length; respins = landed.length ? L.respins : respins - 1; if (cnt >= NCELL) respins = 0;
    spins.push({ spinIndex: spins.length + 1, respinsBefore: before, landed, filled: cnt, spinsLeft: respins, totalPayout: 0 });
  }
  if (!spins.length) spins.push({ spinIndex: 1, respinsBefore: respins, landed: [], filled: cnt, spinsLeft: 0, totalPayout: 0 });
  const cracks = []; let run = 0; const jps = [];
  for (let i = 0; i < NCELL; i++) if (filled[i]) { run = r4(run + filled[i].value); const o = cellOf(i); cracks.push({ order: cracks.length + 1, reel: o.reel, row: o.row, value: filled[i].value, jackpot: filled[i].jackpot, running: run }); if (filled[i].jackpot) jps.push(filled[i].jackpot); }
  const full = cnt >= NCELL, total = r4(run + (full ? L.jackpots.GRAND : 0));
  spins[spins.length - 1].totalPayout = total;
  return { type: 'link', trigger, startSpins: L.respins, start: startMoney.map(m => ({ reel: m.reel, row: m.row, value: m.value, jackpot: m.jackpot })), spins, cracks,
    fullBoard: full, jackpots: jps, grandAwarded: full || jps.includes('GRAND'), pinatas: cnt, total, totalPayout: Math.min(CFG.maxWin, total) };
}

function ladderOf(n) { let step = 0, mult = 1; const lad = CFG.parade.ladder; for (let k = 0; k < lad.length; k++) if (n >= lad[k][0]) { step = k + 1; mult = lad[k][1]; } return { step, mult }; }

function playParade(rng, drums, startStickyN, trigger, capLeft) {
  const P = CFG.parade, prof = profile('parade'), sticky = new Uint8Array(NCELL); let wc = 0; const startSticky = [];
  for (let k = 0; k < startStickyN; k++) { let i; do { i = Math.floor(rng() * NCELL); } while (sticky[i]); sticky[i] = 1; wc++; startSticky.push(cellOf(i)); }
  const startSpins = P.spins[drums]; let total = startSpins, i = 0, sum = 0, retr = 0, capped = false; const spins = [];
  while (i < total && i < P.maxSpins) {
    const prev = sticky.slice(), d = draw(rng, prof, sticky);
    for (let c = 0; c < NCELL; c++) if (d.g[c] === WLD && !sticky[c]) { sticky[c] = 1; wc++; }
    const sp = makeSpin(rng, d, 'parade', P, P.grabScale, prev, CFG.paradeScale), lad = ladderOf(wc);
    const stickyWilds = []; for (let c = 0; c < NCELL; c++) if (sticky[c]) stickyWilds.push(cellOf(c));
    let g = 0; for (const m of sp.money) g += m.value;
    const grab = { values: sp.money.map(m => ({ reel: m.reel, row: m.row, value: m.value, jackpot: m.jackpot })), total: r4(g) };
    i++; let rt = 0;
    if (sp.scatters.length >= 3 && total + P.retrigger <= P.maxSpins) { total += P.retrigger; rt = P.retrigger; retr++; }
    const pay = r4(sp.linePayout * lad.mult + grab.total); sum = r4(sum + pay);
    Object.assign(sp, { spinIndex: i, spinsLeft: total - i, stickyWilds, wildCount: wc, ladderStep: lad.step, multiplier: lad.mult, grab, totalPayout: pay });
    if (rt) sp.retrigger = rt;
    spins.push(sp);
    if (sum >= capLeft) { capped = true; break; }
  }
  return { type: 'parade', trigger, drums, startSpins, startSticky, spins, retriggers: retr, capped, totalPayout: Math.min(CFG.maxWin, sum) };
}

/* ---------- round ---------- */
export function playRound(rng, { ante = false, buy = null, luck = false } = {}) {
  if (luck) throw new Error('unsupported: Lucky Llama Fiesta has no max-luck mode');
  if (ante && buy) throw new Error('ante and buy cannot combine');
  const cap = CFG.maxWin, T = CFG.link.trigger;
  let spin, bonus = null, bought = null, basePayout = 0;
  if (buy) {
    const B = CFG.buy[buy]; if (!B) throw new Error('unknown buy ' + buy); bought = buy;
    if (buy === 'link') {
      const d = triggerLink(rng); spin = makeSpin(rng, d, 'base', CFG.link, CFG.linkScale, null, CFG.lineScale);
      bonus = playLink(rng, spin.money, 'buy');
    } else {
      const drums = pickW(rng, B.drumsW), d = triggerParade(rng, drums); spin = makeSpin(rng, d, 'base', CFG.link, CFG.linkScale, null, CFG.lineScale);
      bonus = playParade(rng, drums, B.sticky, 'buy', cap);
    }
  } else {
    const d = draw(rng, profile(ante ? 'ante' : 'base'), null); spin = makeSpin(rng, d, ante ? 'ante' : 'base', CFG.link, CFG.linkScale, null, CFG.lineScale);
    basePayout = spin.linePayout;
    if (spin.scatters.length >= 3) bonus = playParade(rng, Math.min(5, spin.scatters.length), 0, 'spin', cap - basePayout);
    else if (spin.money.length >= T) bonus = playLink(rng, spin.money, 'spin');
  }
  const raw = basePayout + (bonus ? bonus.totalPayout : 0), totalPayout = Math.min(cap, r4(raw));
  return { v: 1, game: id, mode: buy ? 'buy' : ante ? 'ante' : 'base', bought, ante: !!ante, cost: buy ? CFG.buy[buy].cost : ante ? CFG.anteCost : 1,
    spin, initialGrid: spin.grid, cascadeSteps: buy ? [] : [{ payout: basePayout, lines: spin.wins.length }], basePayout: buy ? 0 : basePayout,
    bonusTriggered: !!bonus, bonus, totalPayout, capped: raw >= cap - 1e-9 };
}

export function info() {
  const strips = {}; for (const k of Object.keys(CFG.reels)) strips[k] = profile(k).strips.map(s => Array.from(s, x => SYM[x]));
  return { symbols: SYM, lines: LINES, paytable: CFG.paytable, lineScale: CFG.lineScale, payscale: CFG.payscale, strips, link: CFG.link, parade: CFG.parade,
    anteCost: CFG.anteCost, buy: CFG.buy, maxWin: CFG.maxWin };
}
export function cryptoRng() { return crypto.randomBytes(6).readUIntBE(0, 6) / 281474976710656; }   // 48-bit uniform [0,1)
