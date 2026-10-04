/* SIROCCO'S LAMP BAZAAR: Sealed Chain. Self-contained pure engine (SlotForge ENGINE-API v1). Spec: plans/slot5-concept.md (maya),
 * round JSON: plans/siroccos-lamp-bazaar-round-format.md. No imports except 'crypto'. No Math.random, no clock. Money = multiples of the base bet.
 *
 * Rules (all covered by tools/sirocco.test.js):
 *  - 5 rows x 5 reels, grid[r][c]. Win = a RUN of 3-5 identical pay symbols that are neighbours in a straight line (row, column, both diagonals).
 *    Wild (reels 2-4 only) substitutes for pay symbols inside a run (a run needs at least one real symbol). A run is a MAXIMAL segment of one symbol (+wilds)
 *    in a line, so a run of 4 pays the 4-run only. A tile may sit in several runs (all pay).
 *  - SEALED CHAIN: stage 1 = a full 25-tile grid. Every tile of a paid run is SEALED and stays; all other tiles respin (next stage). A later stage pays only
 *    runs that contain at least one tile that landed in THAT stage (a grown run pays in full). Stage k pays at x min(k,5) in the base game.
 *    The chain ends on the first stage with no new run, or when 25 tiles are sealed (hard bound 25 stages).
 *  - Wish Gems (id 12, value x2..x25): land on any stage, are sealed at once, never part of a run. At most 4 per spin. When the chain ends with a win, the SUM
 *    of the gems on the board multiplies the chain total (gems add, then multiply). No win: gems pay nothing.
 *  - Scatters (FS id 10, Astrolabe id 11) are generated on stage 1 only (never on respin stages). 3+ of one kind triggers (they are sealed so they stay on
 *    the board). If both reach 3 (about 1e-8), the FS tiles turn into a plain symbol and the Astrolabe wins.
 *  - Free Wishes: 3 FS = 10 spins, 4 FS = 12 spins SUPER (starts x3, cap x15), 5 FS = 15 spins SUPER; normal start x1 cap x12. In the bonus the chain
 *    multiplier never resets: a winning stage pays at the current multiplier and then raises it by 1 (up to the cap); no-win spins leave it. Gems still
 *    multiply the end of each spin's chain. 3+ FS on a spin's first stage retriggers (+4 spins, +6 with 4+); max 40 spins.
 *  - Astrolabe of Wishes: 3/4/5 Astrolabes = 4/6/8 spins. Each spin stops three rings in turn: outer cash 1-40x (12 sectors), middle multiplier x1-x25
 *    (10 sectors), core (8 sectors: Mini 25 / Minor 100 / Major 500 / Grand 2500 or empty). Prize = outer x middle + jackpot. MAGNET: a ring that stopped on
 *    its best third makes the top third of that ring CFG.astro.magnet x as likely on the NEXT spin.
 *  - Luck mode "Djinn's Favour" = CFG.anteCost x bet: own symbol weights, scatters ~3.4x, 15% free gem on stage 1, lower pays.
 *  - Cap 8,000x: base chain capped first; a bonus stops at the first spin that reaches the remaining cap (that spin is truncated).
 *  - Bought round: trigger spin = scatters dropped on a grid with no win (rejection), cascadeSteps [] and stages [], payout 0. The scatter count is drawn from
 *    the natural distribution conditional on the trigger.
 */
import crypto from 'crypto';

export const id = 'siroccos-lamp-bazaar';
export const name = 'Sirocco\'s Lamp Bazaar';

const ROWS = 5, COLS = 5, NPAY = 9, WILD = 9, FS = 10, ASTRO = 11, GEM = 12, MAXSTAGES = 25;
export const SYMBOLS = ['Date Bowl', 'Coffee Pot', 'Glass Lantern', 'Jambiya', 'Signet Ring', 'Hourglass', 'Magic Carpet', 'Sultan\'s Turban', 'Genie\'s Lamp',
  'Djinn Seal (Wild)', 'FS Scatter', 'Astrolabe', 'Wish Gem'].map((n, i) => ({ id: i, name: n }));
export const DIRS = [['h', 0, 1], ['v', 1, 0], ['d', 1, 1], ['a', 1, -1]];   // row, column, diagonal down-right, diagonal down-left

export const CFG = {
  rows: ROWS, reels: COLS,
  bets: [0.1,0.2,0.3,0.4,0.5,0.6,0.8,1,1.5,2,2.5,3,4,5,6,8,10,12,15,20,25,30,40,50,60,80,100,150,200,250,300,400,500,750,1000,1500,2000,3000,4000,5000,7500,10000],
  maxWin: 8000,
  buy: { fs: { cost: 66 }, astrolabe: { cost: 43 }, super: { cost: 105 } },
  anteCost: 2,
  // pay[s] = x bet for runs of 3 / 4 / 5 (before the stage multiplier); 0 = that run length does not pay (the 3 low symbols pay from 4)
  pay: [[0, 0.03, 0.15], [0, 0.03, 0.15], [0, 0.03, 0.15], [0.02, 0.1, 0.5], [0.02, 0.1, 0.5], [0.02, 0.1, 0.5], [0.03, 0.2, 1.2], [0.03, 0.2, 1.2], [0.05, 0.35, 2]],
  stageMultCap: 5,
  // tile weights per mode (9 pay symbols); wild only on reels 2-4 (index 1..3)
  base: { symW: [11, 11, 11, 10, 10, 10, 9, 9, 8], wildP: 0.008, fsP: 0.01453, astroP: 0.01255, gemP: 0.0031, payScale: 1, gemFree: 0 },
  luck: { symW: [11, 11, 11, 10, 10, 10, 9, 9, 8], wildP: 0.008, fsP: 0.02132, astroP: 0.01802, gemP: 0.0031, payScale: 1, gemFree: 0.15 },
  gemW: [[2, 40], [3, 26], [5, 17], [10, 11], [25, 6]],
  maxGems: 4,
  fs: { spins: { 3: 10, 4: 12, 5: 15 }, superFrom: 4, start: 1, cap: 12, superStart: 3, superCap: 15, retrig: { 3: 4, 4: 6 }, maxSpins: 40,
        symW: [11, 11, 11, 10, 10, 10, 9, 9, 8], wildP: 0.03, fsP: 0.01453, gemP: 0.00577, superGemP: 0.0059, payScale: 1, gemW: [[2, 10], [3, 15], [5, 20], [10, 30], [25, 25]] },
  astro: {
    spins: { 3: 4, 4: 6, 5: 8 },
    outer: { v: [1, 2, 1, 3, 2, 5, 1, 4, 2, 10, 3, 40], w: [16, 13, 16, 10, 12, 6, 16, 8, 12, 2.5, 6, 0.4] },
    middle: { v: [1, 2, 1, 3, 2, 5, 1, 2, 10, 25], w: [18, 14, 18, 10, 14, 5, 18, 9, 1.6, 0.3] },
    core: { kind: ['', 'mini', '', 'minor', '', 'major', '', 'grand'], w: [20, 2.05, 20, 0.9, 20, 0.17, 20, 0.09], jackpot: { mini: 25, minor: 100, major: 500, grand: 2500 } },
    magnet: 2
  },
  // The scatter count of a bought round is drawn from the NATURAL distribution (binomial over the 25 stage-1 tiles with the base-mode scatter
  // probability) conditional on the trigger: fs = 3..5 FS, super = 4..5 FS, astrolabe = 3..5 Astrolabes. See buyCountW().
};

const binom = (n, k, p) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r * Math.pow(p, k) * Math.pow(1 - p, n - k); };
/* [[count, weight]] of scatter counts lo..5 on the 25 stage-1 tiles, each tile a scatter with probability p (natural distribution conditional on count >= lo) */
export const buyCountW = (p, lo) => { const w = []; for (let k = lo; k <= 5; k++) w.push([k, binom(ROWS * COLS, k, p)]); return w; };
const pickW = (rng, tbl) => { let t = 0; for (const e of tbl) t += e[1]; let u = rng() * t; for (const e of tbl) { u -= e[1]; if (u < 0) return e[0]; } return tbl[tbl.length - 1][0]; };
const drawIdx = (rng, w) => { let t = 0; for (const x of w) t += x; let u = rng() * t; for (let i = 0; i < w.length; i++) { u -= w[i]; if (u < 0) return i; } return w.length - 1; };
const rd = x => Math.round(x * 1e6) / 1e6;     // strip float noise from money (all pays are multiples of 0.01)
/* Every payout the player sees is a multiple of 0.1x (exact in cents at the $0.10 minimum stake). A stage's exact pay (runs x multiplier) is rounded to the
 * 0.1 grid with UNBIASED stochastic rounding: pay 0.04 becomes 0.1 with probability 0.4, else 0. The expectation (and so the RTP) is unchanged. */
const tenth = (rng, x) => { if (x > 0 && x < 0.1) return 0.1;     // a paid stage always shows at least 0.1x
   const n = Math.round(x * 1e6) / 1e5, lo = Math.floor(n + 1e-9), f = n - lo; return (lo + (f > 1e-9 && rng() < f ? 1 : 0)) / 10; };
const grid0 = v => Array.from({ length: ROWS }, () => new Array(COLS).fill(v));
const copy = g => g.map(r => r.slice());

/* ---------- tile generation ---------- */
/* P: { symW, wildP, fsP, astroP, gemP }; ctx: { col, scatters (stage 1), gemsLeft } -> {sym, gem?} from ONE uniform */
function drawTile(rng, P, col, scatters, gemsLeft) {
  let u = rng();
  if (col >= 1 && col <= 3) { if (u < P.wildP) return { sym: WILD }; u -= P.wildP; }
  if (scatters) {
    if (u < P.fsP) return { sym: FS }; u -= P.fsP;
    if (u < (P.astroP || 0)) return { sym: ASTRO }; u -= P.astroP || 0;
  }
  if (gemsLeft > 0) { if (u < P.gemP) return { sym: GEM, gem: 1 }; u -= P.gemP; }
  const w = P.symW; let t = 0; for (const x of w) t += x;
  let x = Math.min(0.999999999, Math.max(0, u)) * t / (1 - (col >= 1 && col <= 3 ? P.wildP : 0) - (scatters ? P.fsP + (P.astroP || 0) : 0) - (gemsLeft > 0 ? P.gemP : 0)) ;
  x = Math.min(x, t * 0.999999999);
  let s = 0; for (; s < NPAY - 1; s++) { x -= w[s]; if (x < 0) break; }
  return { sym: s };
}

/* ---------- run evaluation ---------- */
/* grid: ids; isNew[r][c] true when the tile landed in this stage. Returns runs [{sym,dir,len,cells,wilds,pay}] (pay = x bet before the stage multiplier) */
/* every straight line of >= 3 cells, built once: [{dir, cells:[[r,c]...]}] */
const LINES = (() => {
  const L = [];
  for (const [dir, dr, dc] of DIRS) for (let r0 = 0; r0 < ROWS; r0++) for (let c0 = 0; c0 < COLS; c0++) {
    const pr = r0 - dr, pc = c0 - dc;
    if (pr >= 0 && pr < ROWS && pc >= 0 && pc < COLS) continue;           // not the start of a line
    const cells = []; for (let r = r0, c = c0; r >= 0 && r < ROWS && c >= 0 && c < COLS; r += dr, c += dc) cells.push([r, c]);
    if (cells.length >= 3) L.push({ dir, cells });
  }
  return L;
})();
export function findRuns(grid, isNew, payScale = 1) {
  const runs = [];
  for (const { dir, cells: line } of LINES) {
    const n = line.length;
    for (let s = 0; s < NPAY; s++) {
      let i = 0;
      while (i < n) {
        let g = grid[line[i][0]][line[i][1]];
        if (g !== s && g !== WILD) { i++; continue; }
        let j = i + 1;
        while (j < n) { g = grid[line[j][0]][line[j][1]]; if (g !== s && g !== WILD) break; j++; }
        const len = j - i;
        if (len >= 3 && CFG.pay[s][len - 3] > 0) {
          const cells = line.slice(i, j); let real = 0, fresh = false; const wilds = [];
          for (const [r, c] of cells) { if (grid[r][c] === s) real++; else wilds.push([r, c]); if (isNew[r][c]) fresh = true; }
          if (real > 0 && fresh) runs.push({ sym: s, dir, len, cells, wilds, pay: CFG.pay[s][len - 3] * payScale });
        }
        i = j;
      }
    }
  }
  return runs;
}

/* ---------- one chain (one spin) ---------- */
/* o: { P (mode params), scatters (bool, stage 1 may carry scatters), fsOnly (no astro tiles), mult (null = stage k pays min(k,cap); number = persistent multiplier), cap (persistent cap) }
 * returns { stages, base (sum of stage payouts), gemSum, gems, payout, scatters:{fs,astro}, multEnd } */
function playChain(rng, o) {
  const P = o.P, sealed = grid0(false), grid = grid0(-1), stages = [];
  let gemCount = 0, total = 0, mult = o.mult, scat = { fs: [], astro: [] }, k = 0;
  const gems = [];
  while (k < MAXSTAGES) {
    k++;
    const isNew = grid0(false), sealedBefore = copy(sealed).map(r => r.map(x => (x ? 1 : 0)));
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (sealed[r][c]) continue;
      const t = drawTile(rng, P, c, k === 1 && o.scatters, CFG.maxGems - gemCount);
      grid[r][c] = t.sym; isNew[r][c] = true;
      if (t.gem) { gemCount++; gems.push({ r, c, value: pickW(rng, o.gemW || CFG.gemW), stage: k }); }
    }
    if (k === 1) {
      if (P.gemFree && gemCount < CFG.maxGems && rng() < P.gemFree) {                          // luck mode: a free gem on a random plain tile
        const cand = []; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c] < NPAY) cand.push([r, c]);
        if (cand.length) { const [r, c] = cand[Math.min(cand.length - 1, Math.floor(rng() * cand.length))]; grid[r][c] = GEM; gemCount++; gems.push({ r, c, value: pickW(rng, o.gemW || CFG.gemW), stage: 1 }); }
      }
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { if (grid[r][c] === FS) scat.fs.push([r, c]); else if (grid[r][c] === ASTRO) scat.astro.push([r, c]); }
      if (scat.fs.length >= 3 && scat.astro.length >= 3) { for (const [r, c] of scat.fs) grid[r][c] = 0; scat.fs = []; }
    }
    const runs = findRuns(grid, isNew, P.payScale);
    const m = mult == null ? Math.min(k, CFG.stageMultCap) : mult;
    const newlySealed = [];
    const seal = (r, c) => { if (!sealed[r][c]) { sealed[r][c] = true; newlySealed.push([r, c]); } };
    for (const g of gems) if (g.stage === k) seal(g.r, g.c);
    if (k === 1) {
      if (scat.fs.length >= 3) for (const [r, c] of scat.fs) seal(r, c);
      if (scat.astro.length >= 3) for (const [r, c] of scat.astro) seal(r, c);
    }
    let sum = 0;
    for (const run of runs) { sum += run.pay; for (const [r, c] of run.cells) seal(r, c); }
    const exact = rd(sum * m), payout = tenth(rng, exact); total = rd(total + payout);
    stages.push({ stage: k, mult: m, grid: copy(grid), sealed: sealedBefore, runs, exactPayout: exact, payout, newlySealed,
      gems: gems.filter(g => g.stage <= k).map(g => ({ r: g.r, c: g.c, value: g.value, isNew: g.stage === k })), chainTotal: total });
    if (!runs.length) break;
    if (mult != null) mult = Math.min(o.cap, mult + 1);
    let full = true; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!sealed[r][c]) full = false;
    if (full) break;
  }
  const gemSum = gems.reduce((a, g) => a + g.value, 0);
  const payout = rd(total > 0 && gemSum > 0 ? total * gemSum : total);
  return { stages, base: total, gemSum: total > 0 ? gemSum : 0, gemsOnBoard: gemSum, gems: gems.map(g => ({ r: g.r, c: g.c, value: g.value })), payout, scatters: scat, multEnd: mult };
}

const chainInfo = ch => ({ stages: ch.stages.length, base: ch.base, gemSum: ch.gemSum, gemsOnBoard: ch.gemsOnBoard, gems: ch.gems, payout: ch.payout });
const stageSummary = ch => ch.stages.map(s => ({ stage: s.stage, payout: s.payout }));

/* ---------- Free Wishes ---------- */
function playFs(rng, n, capLeft) {
  const F = CFG.fs, sup = n >= F.superFrom, start = F.spins[Math.min(5, n)], P = { ...F, astroP: 0 };
  const spins = []; let left = start, total = 0, capped = false, done = 0, mult = sup ? F.superStart : F.start, extra = start;
  const cap = sup ? F.superCap : F.cap;
  while (left > 0 && done < F.maxSpins) {
    const multStart = mult;
    const ch = playChain(rng, { P: sup && F.superGemP ? { ...P, gemP: F.superGemP } : P, gemW: F.gemW, scatters: true, mult, cap });
    mult = ch.multEnd; left--; done++;
    let retrigger = 0; const nfs = ch.scatters.fs.length;
    if (nfs >= 3) { const add = nfs >= 4 ? F.retrig[4] : F.retrig[3]; if (done + left + add <= F.maxSpins) { retrigger = add; left += add; extra += add; } }
    const uncapped = ch.payout; let pay = ch.payout;
    if (total + pay >= capLeft) { pay = rd(capLeft - total); capped = true; left = 0; }
    total = rd(total + pay);
    const sp = { spinIndex: done, spinsLeft: left, stages: ch.stages, chain: chainInfo(ch), scatters: { count: nfs, cells: ch.scatters.fs }, multStart, multEnd: mult, uncappedPayout: uncapped, totalPayout: pay };
    if (retrigger) sp.retrigger = retrigger;
    spins.push(sp);
  }
  return { kind: sup ? 'super' : 'fs', startSpins: start, spins, total, capped, sup, startMult: sup ? F.superStart : F.start, cap };
}

/* ---------- Astrolabe of Wishes ---------- */
function ringDraw(rng, ring, magnet) {
  const w = ring.w.slice();
  if (magnet) for (const i of topThird(ring)) w[i] *= CFG.astro.magnet;
  return drawIdx(rng, w);
}
/* indices of the best third of a ring (by value) */
function topThird(ring) {
  const order = ring.v.map((v, i) => i).sort((a, b) => ring.v[b] - ring.v[a] || a - b);
  return order.slice(0, Math.round(ring.v.length / 3));
}
function playAstro(rng, n, capLeft) {
  const A = CFG.astro, start = A.spins[Math.min(5, n)], spins = [];
  let total = 0, capped = false, mo = false, mm = false;
  const topO = topThird(A.outer), topM = topThird(A.middle);
  for (let i = 0; i < start; i++) {
    const oi = ringDraw(rng, A.outer, mo), mi = ringDraw(rng, A.middle, mm), ci = drawIdx(rng, A.core.w);
    const kind = A.core.kind[ci], jackpot = kind ? A.core.jackpot[kind] : 0;
    const cash = A.outer.v[oi] * A.middle.v[mi], uncapped = cash + jackpot;
    const magnet = { outer: mo, middle: mm };
    mo = topO.includes(oi); mm = topM.includes(mi);
    let pay = uncapped, left = start - i - 1;
    if (total + pay >= capLeft) { pay = capLeft - total; capped = true; left = 0; }
    total += pay;
    spins.push({ spinIndex: i + 1, spinsLeft: left, outer: { idx: oi, value: A.outer.v[oi] }, middle: { idx: mi, value: A.middle.v[mi] }, core: { idx: ci, kind, jackpot },
      magnet, cash, uncappedPayout: uncapped, magnetNext: { outer: mo, middle: mm }, totalPayout: pay });
    if (capped) break;
  }
  return { kind: 'astrolabe', startSpins: start, spins, total, capped };
}

const bonusObj = (b, extra) => ({ kind: b.kind, startSpins: b.startSpins, spins: b.spins, totalPayout: Math.min(CFG.maxWin, b.total), ...extra });
const withRings = () => ({ rings: { outer: CFG.astro.outer.v, middle: CFG.astro.middle.v, core: CFG.astro.core.kind } });
const fsExtra = (b, n) => ({ scatters: n, super: b.sup, startMult: b.startMult, multCap: b.cap });

/* ---------- a round ---------- */
export function playRound(rng, { buy = null, ante = false, luck = false } = {}) {
  const maxWin = CFG.maxWin, lucky = ante || luck, P = lucky ? CFG.luck : CFG.base;
  if (buy) {
    const bc = CFG.buy[buy]; if (!bc) throw new Error('unknown buy ' + buy);
    const n = pickW(rng, buy === 'astrolabe' ? buyCountW(CFG.base.astroP, 3) : buyCountW(CFG.base.fsP, buy === 'super' ? CFG.fs.superFrom : 3)), mark = buy === 'astrolabe' ? ASTRO : FS;
    let g = null, cells = null;
    for (let tries = 0; tries < 2000; tries++) {                       // trigger spin pays nothing: rejection on the final grid
      const gr = grid0(0), all = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { gr[r][c] = drawTile(rng, { ...P, fsP: 0, astroP: 0, gemP: 0 }, c, false, 0).sym; all.push([r, c]); }
      for (let k = 0; k < n; k++) { const j = k + Math.min(all.length - k - 1, Math.floor(rng() * (all.length - k))); [all[k], all[j]] = [all[j], all[k]]; gr[all[k][0]][all[k][1]] = mark; }
      cells = all.slice(0, n).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      if (!findRuns(gr, grid0(true), 1).length) { g = gr; break; }
    }
    if (!g) throw new Error('trigger spin generation failed');
    const common = { v: 1, cost: bc.cost, ante: false, bought: buy, initialGrid: g, trigger: { type: buy, count: n, cells }, stages: [], cascadeSteps: [], basePayout: 0, bonusTriggered: true };
    if (buy === 'astrolabe') {
      const b = playAstro(rng, n, maxWin), total = Math.min(maxWin, b.total);
      return { ...common, bonusType: 'astrolabe', bonus: bonusObj(b, { scatters: n, ...withRings() }), totalPayout: total, capped: b.capped || total >= maxWin };
    }
    const b = playFs(rng, n, maxWin), total = Math.min(maxWin, b.total);
    return { ...common, bonusType: b.kind, bonus: bonusObj(b, fsExtra(b, n)), totalPayout: total, capped: b.capped || total >= maxWin };
  }
  const ch = playChain(rng, { P, scatters: true, mult: null });
  const initialGrid = copy(ch.stages[0].grid), base = Math.min(maxWin, ch.payout);
  const round = { v: 1, cost: lucky ? CFG.anteCost : 1, ante: !!lucky, bought: null, bonusType: null, initialGrid, stages: ch.stages, chain: chainInfo(ch), cascadeSteps: stageSummary(ch),
    scatters: { fs: { count: ch.scatters.fs.length, cells: ch.scatters.fs }, astro: { count: ch.scatters.astro.length, cells: ch.scatters.astro } },
    basePayout: base, bonusTriggered: false, bonus: null, totalPayout: base, capped: false };
  if (ch.payout >= maxWin) { round.capped = true; return round; }
  const nA = ch.scatters.astro.length, nF = ch.scatters.fs.length;
  if (nA >= 3) {
    const b = playAstro(rng, nA, maxWin - base);
    round.bonusTriggered = true; round.bonusType = 'astrolabe'; round.bonus = bonusObj(b, { scatters: nA, ...withRings() });
    round.totalPayout = rd(Math.min(maxWin, base + b.total)); round.capped = b.capped || round.totalPayout >= maxWin;
  } else if (nF >= 3) {
    const b = playFs(rng, nF, maxWin - base);
    round.bonusTriggered = true; round.bonusType = b.kind; round.bonus = bonusObj(b, fsExtra(b, nF));
    round.totalPayout = rd(Math.min(maxWin, base + b.total)); round.capped = b.capped || round.totalPayout >= maxWin;
  }
  return round;
}

/* Paytable and rule data for the info screen, derived from CFG. */
export function info() {
  return {
    symbols: SYMBOLS, grid: { rows: ROWS, reels: COLS }, minRun: 3, dirs: DIRS.map(d => d[0]), wildReels: [2, 3, 4],
    pay: CFG.pay.map(r => r.map(x => x * CFG.base.payScale)), stageMultCap: CFG.stageMultCap, gem: { values: CFG.gemW.map(e => e[0]), maxGems: CFG.maxGems },
    fs: { spins: CFG.fs.spins, superFrom: CFG.fs.superFrom, start: CFG.fs.start, cap: CFG.fs.cap, superStart: CFG.fs.superStart, superCap: CFG.fs.superCap, retrig: CFG.fs.retrig },
    astro: { spins: CFG.astro.spins, outer: CFG.astro.outer.v, middle: CFG.astro.middle.v, core: CFG.astro.core.kind, jackpot: CFG.astro.core.jackpot, magnet: CFG.astro.magnet },
    anteCost: CFG.anteCost, buy: CFG.buy, maxWin: CFG.maxWin
  };
}

export function cryptoRng() { return crypto.randomBytes(6).readUIntBE(0, 6) / 281474976710656; }   // 48-bit uniform [0,1)
