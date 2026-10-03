/* node --test tools/arctic.test.js : rule + contract tests for Arctic Aurora Lodge (engines/arctic-aurora-lodge.js) */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as A from '../engines/arctic-aurora-lodge.js';
import { listModes, modeOpts } from '../engines/index.js';
import { checkRound } from './check-round.js';
import { mulberry, sfc32 } from './sim.js';

const ROWS = 5, COLS = 6, P = A.CFG.pay, S = A.CFG.payScale, near = (a, b) => Math.abs(a - b) < 1e-9;
const blank = () => Array.from({ length: ROWS }, () => new Array(COLS).fill(7));   // all Polar Owl: handy filler, we override per test
/* filler that never wins: cycle through 8 symbols so no symbol reaches 5 cells */
const filler = () => { const g = [], f = [0, 1, 2, 3, 4, 5, 6, 7]; let k = 0; for (let r = 0; r < ROWS; r++) { g.push([]); for (let c = 0; c < COLS; c++) g[r].push(f[k++ % 8]); } return g; };
function withBlocks(grid, blocks) { for (const b of blocks) for (let i = 0; i < b.size; i++) for (let j = 0; j < b.size; j++) grid[b.r + i][b.c + j] = b.sym; return grid; }

test('a 3x3 block alone is a win (area 9, tier 8-9)', () => {
  const blocks = [{ id: 0, sym: 5, r: 1, c: 1, size: 3 }], grid = withBlocks(filler(), blocks);
  // remove accidental extra symbol 5 singles
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!(r >= 1 && r < 4 && c >= 1 && c < 4) && grid[r][c] === 5) grid[r][c] = 0;
  const e = A.evaluate(grid, blocks, -1), w = e.wins.find(x => x.sym === 5);
  assert.ok(w); assert.equal(w.count, 9); assert.equal(w.tier, 1); assert.ok(near(w.payout, P[5][0] * S)); assert.equal(w.cells.length, 9);
});
test('two 2x2 of one symbol = 8 cells win; 7 cells do not', () => {
  const blocks = [{ id: 0, sym: 3, r: 0, c: 0, size: 2 }, { id: 1, sym: 3, r: 3, c: 4, size: 2 }];
  const g = withBlocks(filler(), blocks);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const inB = blocks.some(b => r >= b.r && r < b.r + 2 && c >= b.c && c < b.c + 2); if (!inB && g[r][c] === 3) g[r][c] = 0; }
  assert.equal(A.evaluate(g, blocks, -1).wins.find(x => x.sym === 3).count, 8);
  g[0][4] = 3; g[0][5] = 3; g[1][4] = 3;   // 11 now
  assert.equal(A.evaluate(g, blocks, -1).wins.find(x => x.sym === 3).tier, 2);
  const one = [{ id: 0, sym: 3, r: 0, c: 0, size: 2 }], g2 = withBlocks(filler(), one);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!(r < 2 && c < 2) && g2[r][c] === 3) g2[r][c] = 0;
  g2[2][2] = 3; g2[3][3] = 3; g2[4][4] = 3;   // 4 + 3 = 7
  assert.equal(A.evaluate(g2, one, -1).wins.filter(x => x.sym === 3).length, 0);
});
test('area tiers 8-9 / 10-11 / 12-14 / 15-19 / 20+', () => {
  for (const [n, tier] of [[8, 1], [9, 1], [10, 2], [11, 2], [12, 3], [14, 3], [15, 4], [19, 4], [20, 5], [30, 5]]) {
    const g = filler(); for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) g[r][c] = 0;
    let k = 0; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) g[r][c] = k++ < n ? 6 : (k % 7 === 0 ? 1 : k % 7 === 1 ? 2 : k % 7 === 2 ? 3 : k % 7 === 3 ? 4 : k % 7 === 4 ? 5 : 0);
    const w = A.evaluate(g, [], -1).wins.find(x => x.sym === 6);
    assert.ok(w, 'n=' + n); assert.equal(w.count, n); assert.equal(w.tier, tier); assert.ok(near(w.payout, P[6][tier - 1] * S));
  }
});
test('no adjacency needed: scattered singles count', () => {
  const g = filler(); for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) g[r][c] = (r + c) % 2 ? 6 : 0;   // checkerboard, 15 of 6 and 15 of 0
  const e = A.evaluate(g, [], -1);
  assert.equal(e.wins.find(x => x.sym === 6).count, 15); assert.equal(e.wins.find(x => x.sym === 0).count, 15);
  assert.ok(near(e.total, (P[6][3] + P[0][3]) * S));
});
test('wilds join the ONE best symbol; wild alone pays nothing', () => {
  const g = filler(); for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) g[r][c] = [0, 1, 2, 3, 4, 5][(r * 7 + c * 3) % 6];
  for (const [r, c] of [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 0]]) g[r][c] = 9;   // 7 wilds
  const e = A.evaluate(g, [], -1);
  assert.ok(e.wins.length >= 1);
  const withWild = e.wins.filter(w => w.wilds.length);
  assert.equal(withWild.length, 1); assert.equal(withWild[0].wilds.length, 7);
  const none = Array.from({ length: ROWS }, () => new Array(COLS).fill(9)); none[0][0] = 0;
  assert.ok(A.evaluate(none, [], -1).wins.length <= 1);
});
test('lit symbol: threshold 5 and blocks count double', () => {
  const g = filler(); for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) g[r][c] = [1, 2, 3, 4, 5, 6, 7][(r * 5 + c * 2) % 7];
  let k = 0; for (let r = 0; r < ROWS && k < 5; r++) for (let c = 0; c < COLS && k < 5; c++) { g[r][c] = 0; k++; }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (g[r][c] === 0 && !(r === 0 && c < 5)) g[r][c] = 1;
  assert.equal(A.evaluate(g, [], -1).wins.filter(w => w.sym === 0).length, 0, 'unlit 5 cells: no win');
  const lit = A.evaluate(g, [], 0).wins.find(w => w.sym === 0);
  assert.ok(lit && lit.lit && lit.tier === 0 && near(lit.payout, P[0][0] * A.CFG.litLow * S));
  const blocks = [{ id: 0, sym: 2, r: 0, c: 0, size: 3 }], g2 = withBlocks(filler(), blocks);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!(r < 3 && c < 3) && g2[r][c] === 2) g2[r][c] = 0;
  assert.equal(A.evaluate(g2, blocks, -1).wins.find(w => w.sym === 2).count, 9);
  assert.equal(A.evaluate(g2, blocks, 2).wins.find(w => w.sym === 2).count, 18);   // 3x3 lit = 18 -> tier 15-19
  assert.equal(A.evaluate(g2, blocks, 2).wins.find(w => w.sym === 2).tier, 4);
});
test('sweep bands: 16 distinct bands inside the 5x5 sheet', () => {
  assert.equal(A.BANDS.length, 16);
  const keys = new Set(A.BANDS.map(b => JSON.stringify(b.cells)));
  assert.equal(keys.size, 16);
  for (const b of A.BANDS) { assert.ok(b.cells.length >= 4); for (const [r, c] of b.cells) assert.ok(r >= 0 && r < 5 && c >= 0 && c < 5); }
});

/* ---------- random rounds in every mode ---------- */
const ROUNDS = Number(process.env.TEST_ROUNDS || 1500);
function checkBlocks(grid, blocks) {
  assert.equal(grid.length, ROWS); for (const row of grid) assert.equal(row.length, COLS);
  const seen = new Set();
  for (const b of blocks) {
    assert.ok(b.size === 2 || b.size === 3); assert.ok(b.sym >= 0 && b.sym < 8);
    assert.ok(b.r >= 0 && b.c >= 0 && b.r + b.size <= ROWS && b.c + b.size <= COLS, 'block inside the grid');
    for (let i = 0; i < b.size; i++) for (let j = 0; j < b.size; j++) { const k = (b.r + i) * 10 + b.c + j; assert.ok(!seen.has(k), 'blocks overlap'); seen.add(k); assert.equal(grid[b.r + i][b.c + j], b.sym); }
  }
}
for (const mode of listModes(A)) {
  test(`random rounds, mode ${mode}: contract + rules`, () => {
    const rng = sfc32(2024), o = modeOpts(A, mode);
    for (let i = 0; i < ROUNDS; i++) {
      const r = A.playRound(rng, o), errs = checkRound(r, A.CFG, { ante: !!o.ante, buy: o.buy || null });
      assert.deepEqual(errs, [], `round ${i}: ${errs.join('; ')}`);
      checkBlocks(r.initialGrid, r.initialBlocks);
      if (o.buy) {
        assert.equal(r.trigger.type, o.buy); assert.equal(r.cascadeSteps.length, 0); assert.equal(r.basePayout, 0);
        assert.equal(A.evaluate(r.initialGrid, r.initialBlocks, -1).total, 0, 'trigger spin pays nothing');
        const mark = o.buy === 'fs' ? 10 : 8; assert.equal(r.trigger.cells.length, r.trigger.count);
        for (const [rr, cc] of r.trigger.cells) assert.equal(r.initialGrid[rr][cc], mark);
        assert.ok(r.trigger.count >= (o.buy === 'fs' ? 3 : 4));
      } else {
        const st = r.cascadeSteps[0]; assert.equal(r.cascadeSteps.length, 1);
        const ev = A.evaluate(st.grid, st.blocks, -1); assert.ok(near(ev.total, st.payout)); assert.equal(ev.wins.length, st.wins.length);
        assert.ok(near(r.basePayout, Math.min(A.CFG.maxWin, st.payout)));
        for (const w of st.wins) { assert.ok(w.count >= 8); assert.equal(w.cells.length, w.count); }
        assert.equal(r.cost, o.ante ? A.CFG.anteCost : 1);
        const gems = r.scatters.gems.count, fs = r.scatters.fs.count;
        assert.equal(r.bonusType, gems >= 4 ? 'sweep' : fs >= 3 ? 'fs' : null);
      }
      if (r.bonusType === 'fs') {
        const b = r.bonus; let left = b.startSpins, total = 0;
        assert.ok(b.startSpins === 10 || b.startSpins === 12 || b.startSpins === 15);
        for (const s of b.spins) {
          checkBlocks(s.grid, s.blocks); assert.ok(s.lit >= 0 && s.lit < 8);
          const ev = A.evaluate(s.grid, s.blocks, s.lit); assert.ok(near(ev.total, s.uncappedPayout));
          for (const w of s.wins) assert.ok(w.count >= (w.sym === s.lit ? 5 : 8));
          left--; if (s.retrigger) { assert.equal(s.scatters.count >= 3, true); left += s.retrigger; }
          assert.equal(s.spinsLeft, r.capped && s === b.spins[b.spins.length - 1] ? 0 : left); total += s.totalPayout;
        }
        assert.ok(b.spins.length <= A.CFG.fs.maxSpins); assert.ok(near(total, b.totalPayout));
      }
      if (r.bonusType === 'sweep') {
        const b = r.bonus, n = Math.min(8, b.gems); assert.ok(b.gems >= 4); assert.equal(b.sheet.length, 5);
        assert.ok(b.spins.length <= n); assert.equal(new Set(b.bands).size, n);
        const hits = Array.from({ length: 5 }, () => new Array(5).fill(0));
        for (const k of b.bands.slice(0, b.spins.length)) for (const [rr, cc] of A.BANDS[k].cells) hits[rr][cc]++;
        let run = 0; for (let rr = 0; rr < 5; rr++) for (let cc = 0; cc < 5; cc++) { const c = b.sheet[rr][cc]; if (c.kind === 'cash' && hits[rr][cc]) run += c.value * (hits[rr][cc] + (c.prism ? 1 : 0)); }
        const sum = b.spins.reduce((a, s) => a + s.totalPayout, 0);
        assert.ok(near(Math.min(run, A.CFG.maxWin), sum) || r.capped, `sweep sum ${sum} vs ${run}`);
      }
    }
  });
}
test('determinism and cap', () => {
  const a = JSON.stringify(A.playRound(mulberry(5), { ante: true })), b = JSON.stringify(A.playRound(mulberry(5), { ante: true }));
  assert.equal(a, b);
  const rng = mulberry(3); let capped = 0;
  const old = A.CFG.sweep.valueW; A.CFG.sweep.valueW = [[5000, 1]];    // force absurd cells: the cap must hold
  try { for (let i = 0; i < 200; i++) { const r = A.playRound(rng, { buy: 'sweep' }); assert.ok(r.totalPayout <= A.CFG.maxWin); assert.deepEqual(checkRound(r, A.CFG, { buy: 'sweep' }), []); if (r.capped) capped++; } }
  finally { A.CFG.sweep.valueW = old; }
  assert.ok(capped > 0);
});
test('info() is derived from CFG', () => {
  const i = A.info(); assert.deepEqual(i.pay[0], P[0].map(x => x * S)); assert.equal(i.maxWin, 7500); assert.equal(i.anteCost, A.CFG.anteCost);
});
