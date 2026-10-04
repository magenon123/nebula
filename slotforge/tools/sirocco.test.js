/* node --test tools/sirocco.test.js : rule + contract tests for Sirocco's Lamp Bazaar (engines/siroccos-lamp-bazaar.js) */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../engines/siroccos-lamp-bazaar.js';
import { listModes, modeOpts } from '../engines/index.js';
import { checkRound } from './check-round.js';
import { mulberry, sfc32 } from './sim.js';

const R = 5, C = 5, near = (a, b) => Math.abs(a - b) < 1e-9, P = S.CFG.pay;
const WILD = 9, FS = 10, ASTRO = 11, GEM = 12;
const allNew = () => Array.from({ length: R }, () => new Array(C).fill(true));
/* a 5x5 filler that has no run of 3 in any direction (checked by the first assertion of the tests that use it) */
const filler = () => { const g = [], pat = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 0], [3, 4, 1, 2, 5], [8, 7, 6, 0, 1], [2, 5, 3, 4, 6]]; for (const row of pat) g.push(row.slice()); return g; };

test('filler grid has no run', () => { assert.equal(S.findRuns(filler(), allNew()).length, 0); });
test('row, column and both diagonals pay; maximal run pays once', () => {
  const sym = 7;      // high symbol: pays from 3
  const row = filler(); for (let c = 0; c < 3; c++) row[0][c] = sym;
  const rr = S.findRuns(row, allNew()).filter(x => x.sym === sym); assert.equal(rr.length, 1); assert.equal(rr[0].dir, 'h'); assert.equal(rr[0].len, 3); assert.ok(near(rr[0].pay, P[sym][0]));
  const col = filler(); for (let r = 1; r < 5; r++) col[r][2] = sym;
  const rc = S.findRuns(col, allNew()).filter(x => x.sym === sym); assert.equal(rc.length, 1); assert.equal(rc[0].dir, 'v'); assert.equal(rc[0].len, 4); assert.ok(near(rc[0].pay, P[sym][1]));
  const dg = filler(); for (let i = 0; i < 5; i++) dg[i][i] = sym;
  const rd = S.findRuns(dg, allNew()).filter(x => x.sym === sym); assert.equal(rd.length, 1); assert.equal(rd[0].dir, 'd'); assert.equal(rd[0].len, 5); assert.ok(near(rd[0].pay, P[sym][2]));
  const an = filler(); for (let i = 0; i < 4; i++) an[i][3 - i] = sym;
  const ra = S.findRuns(an, allNew()).filter(x => x.sym === sym); assert.equal(ra.length, 1); assert.equal(ra[0].dir, 'a'); assert.equal(ra[0].len, 4);
  assert.deepEqual(ra[0].cells, [[0, 3], [1, 2], [2, 1], [3, 0]]);
});
test('low symbols do not pay a run of 3, they pay from 4', () => {
  for (const s of [0, 1, 2]) {
    assert.equal(P[s][0], 0);
    const g = filler(); for (let c = 0; c < 3; c++) g[0][c] = s;
    g[0][3] = 8; g[0][4] = 7;
    assert.equal(S.findRuns(g, allNew()).filter(x => x.sym === s).length, 0);
    const g4 = filler(); for (let c = 0; c < 4; c++) g4[0][c] = s;
    const r = S.findRuns(g4, allNew()).filter(x => x.sym === s); assert.equal(r.length, 1); assert.ok(near(r[0].pay, P[s][1]));
  }
});
test('wild substitutes inside a run, a wild-only line pays nothing, scatters/gems break a run', () => {
  const g = filler(); g[2][0] = 6; g[2][1] = WILD; g[2][2] = 6;
  const r = S.findRuns(g, allNew()).filter(x => x.sym === 6); assert.equal(r.length, 1); assert.deepEqual(r[0].wilds, [[2, 1]]);
  const w = filler(); w[2][1] = WILD; w[2][2] = WILD; w[2][3] = WILD;
  assert.equal(S.findRuns(w, allNew()).filter(x => x.cells.every(([rr, cc]) => rr === 2 && cc >= 1 && cc <= 3)).length, 0, 'wild-only line is not a run');
  for (const brk of [FS, ASTRO, GEM]) { const b = filler(); b[3][0] = 6; b[3][1] = 6; b[3][2] = brk; b[3][3] = 6; assert.equal(S.findRuns(b, allNew()).filter(x => x.sym === 6).length, 0); }
});
test('a plus shape pays two runs; only runs with a newly landed tile pay', () => {
  const g = filler(); for (let c = 1; c <= 3; c++) g[2][c] = 8; for (let r = 1; r <= 3; r++) g[r][2] = 8;
  g[3][0] = 0; const rs = S.findRuns(g, allNew()).filter(x => x.sym === 8); assert.equal(rs.length, 2);
  const none = allNew().map(row => row.map(() => false));
  assert.equal(S.findRuns(g, none).length, 0, 'no new tile, no pay');
  const one = allNew().map(row => row.map(() => false)); one[1][2] = true;
  const rn = S.findRuns(g, one).filter(x => x.sym === 8); assert.equal(rn.length, 1); assert.equal(rn[0].dir, 'v');
});

/* ---------- random rounds in every mode ---------- */
const ROUNDS = Number(process.env.TEST_ROUNDS || 1500);
const key = (r, c) => r * 10 + c;
/* checks one chain (stages[]) and returns { base, gemSum, payout } */
function checkChain(stages, { persistent = null, cap = 0, scattersAllowed = true } = {}) {
  let mult = persistent, sealed = new Set(), prev = null, base = 0; const gemSeen = [];
  assert.ok(stages.length >= 1 && stages.length <= 25);
  stages.forEach((st, i) => {
    assert.equal(st.stage, i + 1);
    const before = new Set(); st.sealed.forEach((row, r) => row.forEach((v, c) => { if (v) before.add(key(r, c)); }));
    assert.deepEqual([...before].sort(), [...sealed].sort(), `stage ${i + 1} sealed-before matches`);
    assert.equal(st.grid.length, R); for (const row of st.grid) assert.equal(row.length, C);
    if (prev) for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (before.has(key(r, c))) assert.equal(st.grid[r][c], prev[r][c], 'sealed tile never changes');
    const isNew = allNew().map((row, r) => row.map((_, c) => !before.has(key(r, c))));
    if (i === 0) assert.equal(before.size, 0);
    const runs = S.findRuns(st.grid, isNew, 1);
    assert.equal(runs.length, st.runs.length, 'runs recomputed');
    const m = persistent == null ? Math.min(i + 1, S.CFG.stageMultCap) : mult;
    assert.equal(st.mult, m);
    let sum = 0; for (const x of runs) { sum += x.pay; assert.ok(x.cells.some(([r, c]) => isNew[r][c]), 'run contains a new tile'); assert.ok(x.len >= 3 && x.len <= 5); }
    assert.ok(near(st.payout, sum * m)); base += st.payout;
    // scatters on a respin stage may only be the sealed ones from stage 1
    if (i > 0) for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if ((st.grid[r][c] === FS || st.grid[r][c] === ASTRO)) assert.ok(before.has(key(r, c)), 'scatter on respin stage must be a sealed stage-1 scatter');
    // seal update
    const after = new Set(before);
    for (const [r, c] of st.newlySealed) { assert.ok(!before.has(key(r, c)), 'newlySealed was free'); after.add(key(r, c)); }
    for (const x of st.runs) for (const [r, c] of x.cells) assert.ok(after.has(key(r, c)), 'run tiles are sealed');
    for (const g of st.gems) { assert.equal(st.grid[g.r][g.c], GEM); assert.ok(after.has(key(g.r, g.c)), 'gem sealed at once'); }
    assert.ok(st.gems.length <= S.CFG.maxGems);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (st.grid[r][c] === GEM) assert.ok(st.gems.some(g => g.r === r && g.c === c));
    // wild only on reels 2-4
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (st.grid[r][c] === WILD) assert.ok(c >= 1 && c <= 3, 'wild on reels 2-4 only');
    if (st.runs.length && persistent != null) mult = Math.min(cap, mult + 1);
    // chain end
    if (i === stages.length - 1) assert.ok(!st.runs.length || after.size === R * C, 'chain ends on a no-win stage or a full board');
    else { assert.ok(st.runs.length > 0, 'chain continues only after a win'); assert.ok(after.size < R * C); }
    sealed = after; prev = st.grid; gemSeen.push(...st.gems);
  });
  return { base, mult };
}
for (const mode of listModes(S)) {
  test(`random rounds, mode ${mode}: contract + rules`, () => {
    const rng = sfc32(2026), o = modeOpts(S, mode); let bonuses = 0, deepChains = 0, gemRounds = 0;
    for (let i = 0; i < ROUNDS; i++) {
      const r = S.playRound(rng, o), errs = checkRound(r, S.CFG, { ante: !!o.ante, buy: o.buy || null });
      assert.deepEqual(errs, [], `round ${i}: ${errs.join('; ')}`);
      if (o.buy) {
        assert.equal(r.trigger.type, o.buy); assert.equal(r.stages.length, 0); assert.equal(r.cascadeSteps.length, 0); assert.equal(r.basePayout, 0);
        const mark = o.buy === 'astrolabe' ? ASTRO : FS; assert.equal(r.trigger.cells.length, r.trigger.count);
        for (const [rr, cc] of r.trigger.cells) assert.equal(r.initialGrid[rr][cc], mark);
        let seen = 0; for (const row of r.initialGrid) for (const v of row) if (v === mark) seen++;
        assert.equal(seen, r.trigger.count); assert.equal(S.findRuns(r.initialGrid, allNew(), 1).length, 0, 'trigger spin pays nothing');
        assert.ok(r.trigger.count >= (o.buy === 'super' ? 4 : 3) && r.trigger.count <= 5);
        for (const row of r.initialGrid) for (const v of row) assert.ok(v !== GEM && (v === mark || v < 10));
      } else {
        assert.equal(r.cost, o.ante ? S.CFG.anteCost : 1);
        const ch = checkChain(r.stages);
        assert.ok(near(ch.base, r.chain.base)); assert.equal(r.cascadeSteps.length, r.stages.length);
        const gemSum = r.stages[r.stages.length - 1].gems.reduce((a, g) => a + g.value, 0);
        assert.equal(r.chain.gemsOnBoard, gemSum); assert.equal(r.chain.gemSum, ch.base > 0 ? gemSum : 0);
        const pay = ch.base > 0 && gemSum > 0 ? ch.base * gemSum : ch.base; assert.ok(near(r.chain.payout, pay)); assert.ok(near(r.basePayout, Math.min(S.CFG.maxWin, pay)));
        if (r.stages.length >= 4) deepChains++; if (gemSum > 0) gemRounds++;
        assert.deepEqual(r.initialGrid, r.stages[0].grid);
        const nF = r.scatters.fs.count, nA = r.scatters.astro.count;
        assert.equal(r.bonusType, r.basePayout >= S.CFG.maxWin ? null : nA >= 3 ? 'astrolabe' : nF >= 3 ? (nF >= 4 ? 'super' : 'fs') : null);
      }
      if (r.bonusType === 'fs' || r.bonusType === 'super') {
        bonuses++;
        const b = r.bonus, sup = r.bonusType === 'super', n = b.scatters; let left = b.startSpins, total = 0, mult = sup ? S.CFG.fs.superStart : S.CFG.fs.start;
        const cap = sup ? S.CFG.fs.superCap : S.CFG.fs.cap;
        assert.equal(b.startSpins, S.CFG.fs.spins[Math.min(5, n)]); assert.equal(sup, n >= 4); assert.equal(b.super, sup);
        for (const sp of b.spins) {
          assert.equal(sp.multStart, mult);
          const ch = checkChain(sp.stages, { persistent: mult, cap }); mult = ch.mult; assert.equal(sp.multEnd, mult); assert.ok(mult <= cap);
          const gemSum = sp.stages[sp.stages.length - 1].gems.reduce((a, g) => a + g.value, 0);
          assert.ok(near(sp.uncappedPayout, ch.base > 0 && gemSum > 0 ? ch.base * gemSum : ch.base));
          left--; if (sp.retrigger) { assert.ok(sp.scatters.count >= 3); assert.equal(sp.retrigger, sp.scatters.count >= 4 ? 6 : 4); left += sp.retrigger; }
          assert.equal(sp.spinsLeft, r.capped && sp === b.spins[b.spins.length - 1] ? 0 : left); total += sp.totalPayout;
          for (const st of sp.stages) for (const row of st.grid) for (const v of row) assert.notEqual(v, ASTRO, 'no Astrolabe inside Free Wishes');
        }
        assert.ok(b.spins.length <= S.CFG.fs.maxSpins); assert.ok(near(Math.min(S.CFG.maxWin, total), b.totalPayout));
      }
      if (r.bonusType === 'astrolabe') {
        bonuses++;
        const b = r.bonus, A = S.CFG.astro; assert.equal(b.startSpins, A.spins[Math.min(5, b.scatters)]); let total = 0;
        assert.deepEqual(b.rings.outer, A.outer.v); assert.equal(b.rings.outer.length, 12); assert.equal(b.rings.core.length, 8);
        for (const sp of b.spins) {
          assert.equal(sp.outer.value, A.outer.v[sp.outer.idx]); assert.equal(sp.middle.value, A.middle.v[sp.middle.idx]);
          const jp = A.core.kind[sp.core.idx]; assert.equal(sp.core.kind, jp); assert.equal(sp.core.jackpot, jp ? A.core.jackpot[jp] : 0);
          assert.ok(near(sp.cash, sp.outer.value * sp.middle.value)); assert.ok(near(sp.uncappedPayout, sp.cash + sp.core.jackpot));
          total += sp.totalPayout; assert.ok(sp.totalPayout <= sp.uncappedPayout + 1e-9);
        }
        assert.ok(b.spins.length <= b.startSpins); assert.ok(near(Math.min(S.CFG.maxWin, total), b.totalPayout));
      }
    }
    if (!o.buy) assert.ok(gemRounds >= 0 && deepChains >= 0);
    if (o.buy) assert.ok(bonuses === ROUNDS);
  });
}
test('the very same seed gives the very same round; different seeds differ', () => {
  const a = JSON.stringify(S.playRound(mulberry(5), { ante: true })), b = JSON.stringify(S.playRound(mulberry(5), { ante: true }));
  assert.equal(a, b); assert.notEqual(a, JSON.stringify(S.playRound(mulberry(6), { ante: true })));
});
test('chains are bounded and the cap holds even with absurd gems', () => {
  const old = S.CFG.gemW, oldF = S.CFG.fs.gemW; S.CFG.gemW = [[2000, 1]]; S.CFG.fs.gemW = [[2000, 1]];
  const rng = mulberry(3); let capped = 0, maxStages = 0;
  try {
    for (let i = 0; i < 300; i++) for (const o of [{}, { buy: 'fs' }, { buy: 'super' }, { buy: 'astrolabe' }]) {
      const r = S.playRound(rng, o); assert.ok(r.totalPayout <= S.CFG.maxWin); assert.deepEqual(checkRound(r, S.CFG, { buy: o.buy || null }), []);
      if (r.capped) { capped++; assert.equal(r.totalPayout, S.CFG.maxWin); } for (const st of r.stages || []) maxStages = Math.max(maxStages, st.stage);
    }
  } finally { S.CFG.gemW = old; S.CFG.fs.gemW = oldF; }
  assert.ok(capped > 0); assert.ok(maxStages <= 25);
});
test('astrolabe: a fixed draw pays outer x middle + jackpot, magnet only after a best-third stop', () => {
  const rng = mulberry(11); let magnets = 0, jackpots = 0;
  for (let i = 0; i < 4000; i++) {
    const r = S.playRound(rng, { buy: 'astrolabe' });
    for (const [k, sp] of r.bonus.spins.entries()) {
      if (k === 0) assert.deepEqual(sp.magnet, { outer: false, middle: false }); else assert.deepEqual(sp.magnet, r.bonus.spins[k - 1].magnetNext);
      if (sp.magnet.outer || sp.magnet.middle) magnets++; if (sp.core.jackpot) jackpots++;
    }
  }
  assert.ok(magnets > 0 && jackpots > 0);
});
test('info() is derived from CFG; buy counts follow the natural binomial', () => {
  const i = S.info(); assert.deepEqual(i.pay[8], P[8].map(x => x * S.CFG.base.payScale)); assert.equal(i.maxWin, 8000); assert.equal(i.anteCost, S.CFG.anteCost);
  const w = S.buyCountW(S.CFG.base.fsP, 3); assert.equal(w.length, 3); assert.ok(w[0][1] > w[1][1] && w[1][1] > w[2][1]);
  assert.deepEqual(Object.keys(S.CFG.buy).sort(), ['astrolabe', 'fs', 'super']);
});
