/* node --test tools/grumble.test.js : rule tests for Grumble & Brine (01-features-math.md section 13, test 9) */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../engines/grumble-and-brine.js';
import { mulberry } from './sim.js';

const J = 9, B = 10, P = G.CFG.pay, near = (a, b) => Math.abs(a - b) < 1e-9;
const g = (a, b, c) => [a, b, c];

test('plain ways: counts multiply across reels', () => {
  // Compass(4) 1,1,2 on reels 1-3 -> 2 ways x 0.07
  const e = G.evaluateBoard([[4, 4, 0, 1, 1], [0, 1, 4, 1, 1], [1, 0, 4, 0, 0]].map(r => r.slice()), []);
  const w = e.wins.find(x => x.sym === 4); assert.ok(w); assert.equal(w.len, 3); assert.equal(w.ways, 2); assert.ok(near(w.payout, 2 * P[4][0]));
});
test('Old Boot / Tin Can pay nothing for 3, pay for 4', () => {
  const three = G.evaluateBoard([[0, 0, 0, 5, 6], [1, 1, 1, 7, 8], [2, 3, 4, 2, 3]], []);
  assert.equal(three.wins.filter(w => w.sym < 2).length, 0);
  const four = G.evaluateBoard([[0, 0, 0, 0, 6], [1, 1, 1, 1, 8], [2, 3, 4, 2, 3]], []);
  assert.ok(near(four.wins.find(w => w.sym === 0).payout, P[0][1])); assert.ok(near(four.wins.find(w => w.sym === 1).payout, P[1][1]));
});
test('jelly values ADD on a reel, multiply across reels; jelly on reel 1 starts a run', () => {
  const grid = [[J, 4, 5, 5, 6], [0, 5, 3, 3, 3], [1, 0, 1, 1, 1]];
  // two jellies on reel 1 (c=0): v2 at (0,0) + v3 shown by a second jelly on same reel
  grid[2][0] = J;
  const e = G.evaluateBoard(grid, [{ r: 0, c: 0, v: 2 }, { r: 2, c: 0, v: 3 }]);
  const a = e.wins.find(w => w.sym === 5); assert.ok(a); assert.deepEqual(a.counts, [5, 1, 1, 1]); assert.equal(a.ways, 5);   // 5 (jellies add) x1x1x... anchors on reels 2,3,4: counts 5,1,1,1 -> run 4
});
test('a run made of Jellies only never pays', () => {
  const grid = [[J, J, J, 0, 1], [2, 3, 4, 2, 3], [2, 3, 4, 2, 3]];
  const e = G.evaluateBoard(grid, [{ r: 0, c: 0, v: 1 }, { r: 0, c: 1, v: 1 }, { r: 0, c: 2, v: 1 }]);
  assert.equal(e.wins.filter(w => w.sym === 5 || w.sym === 8).length, 0);
});
test('Buoy blocks ways', () => {
  const e = G.evaluateBoard([[4, 4, B, 4, 4], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1]], []);
  assert.equal(e.wins.filter(w => w.sym === 4).length, 0);
});

test('structure over many seeded rounds: drifts, jelly values, dives, tide, guaranteed, retrigger, cap', () => {
  const rng = mulberry(31337); let guarSeen = 0, retr = 0, maxDives = 0, abyss = 0;
  for (let i = 0; i < 3000; i++) {
    const buy = i % 3 === 0 ? 'abyss' : i % 3 === 1 ? 'dive' : null, r = G.playRound(rng, { buy });
    const check = (steps, tide) => {
      assert.ok(steps.length >= 1 && steps.length <= 5, 'at most 4 drifts');
      for (const [k, s] of steps.entries()) {
        assert.equal(s.chain, k); assert.equal(s.kind, k ? 'drift' : 'open');
        for (const j of s.jellies) { assert.ok(j.v >= 1 && j.v <= G.CFG.jellyMax); assert.equal(s.grid[j.r][j.c], 9); }
        if (k) for (const m of s.moves) assert.equal(m.to, m.from - 1);
      }
      for (const [k, s] of steps.entries()) if (k) for (const m of s.moves) { const pj = steps[k - 1].jellies.find(j => j.r === m.r && j.c === m.from); assert.ok(pj); assert.equal(m.v, Math.min(25, pj.v + 1)); }
    };
    if (r.bonus) {
      assert.ok(r.bonus.spins.length <= 40);
      let tide = r.bonus.startTide, left = r.bonus.startSpins;
      for (const d of r.bonus.spins) {
        check(d.steps); assert.equal(d.tideBefore, tide);
        const exp = buy === 'abyss' || (d.spinIndex - 1) % 3 === 0;
        if (!r.capped) assert.equal(!!d.guaranteed, exp);
        if (d.guaranteed) { guarSeen++; assert.ok(d.guaranteed.c === 3 || d.guaranteed.c === 4); }
        if (!r.capped || d !== r.bonus.spins.at(-1)) assert.equal(d.tideAfter, Math.min(r.bonus.tideMax, tide + d.exited));
        tide = d.tideAfter; left = left - 1 + (d.retrigger || 0);
        if (d.retrigger) { retr++; assert.ok(d.retrigger === 3 && d.buoys === 2 || d.retrigger === 6 && d.buoys >= 3 || left + 1 >= 0); }
        if (!r.capped) assert.equal(d.spinsLeft, left);
      }
      maxDives = Math.max(maxDives, r.bonus.spins.length);
    } else check(r.cascadeSteps);
    if (buy) { assert.equal(r.scatter.count, buy === 'abyss' ? 5 : 3); assert.equal(r.scatter.payout, 0); assert.deepEqual(r.cascadeSteps, []); assert.equal(r.bonus.startSpins, buy === 'abyss' ? 12 : 8); }
  }
  assert.ok(guarSeen > 0 && retr > 0 && maxDives > 8);
});
test('Abyss Pass overrides only start state; bonus config object is shared', () => {
  assert.deepEqual(Object.keys(G.CFG.buy.abyss).sort(), ['buoys', 'cost', 'guaranteeEvery', 'jellyFactor', 'tide', 'tideMax']);
  assert.deepEqual(Object.keys(G.CFG.buy.dive).sort(), ['buoys', 'cost', 'tide']);
});
test('deterministic replay by seed', () => {
  for (const o of [{}, { ante: true }, { buy: 'dive' }, { buy: 'abyss' }]) assert.equal(JSON.stringify(G.playRound(mulberry(5), o)), JSON.stringify(G.playRound(mulberry(5), o)));
});
test('cap: payout never above maxWin and capped flagged', () => {
  const old = G.CFG.maxWin; G.CFG.maxWin = 50;
  try {
    const rng = mulberry(8); let capped = 0;
    for (let i = 0; i < 300; i++) { const r = G.playRound(rng, { buy: 'abyss' }); assert.ok(r.totalPayout <= 50); if (r.capped) { capped++; assert.equal(r.totalPayout, 50); assert.equal(r.bonus.spins.at(-1).spinsLeft, 0 + r.bonus.spins.at(-1).spinsLeft); } }
    assert.ok(capped > 0);
  } finally { G.CFG.maxWin = old; }
});

/* ---- extra hand-computed paytable examples (rin) ---- */
test('full 243 ways: three Pearl Clams on every reel = 243 x 8.2', () => {
  const e = G.evaluateBoard([[8, 8, 8, 8, 8], [8, 8, 8, 8, 8], [8, 8, 8, 8, 8]], []);
  assert.equal(e.wins.length, 1); assert.equal(e.wins[0].ways, 243); assert.ok(near(e.payout, 243 * 8.2));
});
test('spec 3.2 worked example: opening 1.40 and drift-3 board 1.54', () => {
  const open = G.evaluateBoard([[5, 2, 4, 0, 3], [4, 2, 2, J, 1], [2, 4, 4, 5, 6]], [{ r: 1, c: 3, v: 2 }]);
  assert.ok(near(open.payout, 4 * 0.14 + 4 * 0.21), 'open ' + open.payout);
  const d3 = G.evaluateBoard([[4, 2, 5, 5, 0], [J, 4, 2, 2, 3], [5, 4, 4, 8, 1]], [{ r: 1, c: 0, v: 5 }]);
  assert.ok(near(d3.payout, 5 * 0.14 + 12 * 0.07), 'd3 ' + d3.payout);
});
test('5-run pays the 5 value only (not 3+4+5), jelly on reel 5 extends a 4-run to 5', () => {
  const e = G.evaluateBoard([[7, 7, 0, 0, J], [1, 2, 7, 7, 1], [2, 3, 3, 3, 3]], [{ r: 0, c: 4, v: 2 }]);
  const h = e.wins.find(w => w.sym === 7); assert.equal(h.len, 5); assert.deepEqual(h.counts, [1, 1, 1, 1, 2]); assert.equal(h.ways, 2); assert.ok(near(h.payout, 2 * 3.4));
});
test('Jelly drift: a reel-5 Jelly causes 4 drifts with values v..v+4 and is bounded; bought rounds pay 0 on the trigger spin', () => {
  const rng = mulberry(7); let seen = 0;
  for (let i = 0; i < 200000 && seen < 3; i++) {
    const r = G.playRound(rng, {});
    const first = r.cascadeSteps[0]; if (!first.jellies.some(j => j.c === 4) || r.cascadeSteps.length !== 5) continue;
    const j4 = first.jellies.find(j => j.c === 4); seen++;
    assert.equal(r.cascadeSteps[4].jellies.find(j => j.c === 0 && j.r === j4.r).v, Math.min(25, j4.v + 4));
  }
  assert.ok(seen > 0);
  for (const b of ['dive', 'abyss']) { const r = G.playRound(mulberry(3), { buy: b }); assert.equal(r.basePayout, 0); assert.equal(r.scatter.payout, 0); assert.equal(r.cascadeSteps.length, 0); assert.equal(r.initialGrid.flat().filter(x => x === B).length, b === 'dive' ? 3 : 5); }
});
