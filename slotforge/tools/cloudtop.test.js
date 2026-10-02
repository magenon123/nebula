/* node --test tools/cloudtop.test.js : rule tests for Koji's Cloudtop Tea House + contract on random rounds (base and buy) */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../engines/cloudtop-tea-house.js';
import { mulberry } from './sim.js';
import { checkRound } from './check-round.js';

const W = 8, BUN = 9, TIN = 10, P = T.CFG.pay, S = T.CFG.payScale, near = (a, b) => Math.abs(a - b) < 1e-9;
const blank = () => Array.from({ length: 4 }, () => new Array(5).fill(TIN));   // all tins = all blanks
const seq = a => { let i = 0; return () => { const v = a[i % a.length]; i++; return v; }; };

test('30 distinct paylines of 5 rows each', () => {
  assert.equal(T.LINES.length, 30);
  assert.equal(new Set(T.LINES.map(l => l.join())).size, 30);
  assert.ok(T.LINES.every(l => l.length === 5 && l.every(r => r >= 0 && r <= 3)));
});
test('blank board has no wins; 3 of a kind on the top row pays the 3-pay', () => {
  assert.equal(T.evaluateLines(blank()).total, 0);
  const g = blank(); g[0][0] = g[0][1] = g[0][2] = 6;
  const e = T.evaluateLines(g), w = e.wins.find(x => x.line === 0);
  assert.ok(w && w.len === 3 && w.sym === 6 && near(w.payout, P[6][0] * S));
});
test('wild substitutes pay symbols, never starts a line, and a line pays once (highest)', () => {
  const g = blank(); g[1][0] = 5; g[1][1] = W; g[1][2] = 5; g[1][3] = W; g[1][4] = 5;
  const w = T.evaluateLines(g).wins.find(x => x.line === 1); assert.equal(w.len, 5); assert.ok(near(w.payout, P[5][2] * S));
  const g2 = blank(); g2[1][0] = 5; g2[1][1] = 5; g2[1][2] = W; g2[1][3] = 3; g2[1][4] = 3;
  assert.equal(T.evaluateLines(g2).wins.find(x => x.line === 1).len, 3);
  const g3 = blank(); g3[0][0] = TIN; g3[0][1] = W; g3[0][2] = W; g3[0][3] = W; g3[0][4] = W;
  assert.equal(T.evaluateLines(g3).wins.filter(x => x.line === 0).length, 0, 'wild after a blank start never pays');
});
test('a Tea Tin is a blank for lines (it breaks a line)', () => {
  const g = blank(); g[0][0] = 7; g[0][1] = 7; g[0][2] = TIN; g[0][3] = 7; g[0][4] = 7;
  assert.equal(T.evaluateLines(g).wins.filter(x => x.line === 0).length, 0);
});
test('all bundles flip to the SAME pay symbol; flipped grid has no bundles', () => {
  let n = 0;
  for (let i = 0; i < 20000 && n < 50; i++) {
    const r = T.playRound(mulberry(i + 1)); const st = r.cascadeSteps[0];
    if (!st.bundle || st.bundle.cells.length < 2) continue; n++;
    assert.ok(st.bundle.flipTo >= 0 && st.bundle.flipTo <= 7);
    for (const [y, x] of st.bundle.cells) { assert.equal(r.initialGrid[y][x], BUN); assert.equal(st.grid[y][x], st.bundle.flipTo); }
    assert.ok(!st.grid.flat().includes(BUN));
    assert.ok(near(st.payout, T.evaluateLines(st.grid).total));
  }
  assert.ok(n >= 20, 'found multi-bundle spins');
});
test('trigger needs >= 6 tins; tins pay nothing by themselves', () => {
  for (let i = 0; i < 20000; i++) {
    const r = T.playRound(mulberry(100 + i));
    assert.equal(r.bonusTriggered, r.tins.count >= 6);
    assert.equal(r.initialGrid.flat().filter(x => x === TIN).length, r.tins.count);
    assert.ok(near(r.basePayout, r.cascadeSteps[0].payout));
  }
});
test('Tin Rush: step 1 is the lock with spinsLeft 3; respins reset to 3 only on a new tin, else -1; ends at 0', () => {
  let seen = 0;
  for (let i = 0; i < 300; i++) {
    const r = T.playRound(mulberry(i), { buy: 'tin' }), sp = r.bonus.spins;
    assert.equal(sp[0].kind, 'lock'); assert.equal(sp[0].spinsLeft, 3);
    for (let k = 1; k < sp.length; k++) {
      const s = sp[k];
      if (s.newTins.length) { assert.equal(s.spinsLeft, s.grand ? 0 : 3); assert.equal(s.reset, true); }
      else { assert.equal(s.spinsLeft, sp[k - 1].spinsLeft - 1); assert.equal(s.reset, false); seen++; }
    }
    const last = sp[sp.length - 1]; assert.ok(last.spinsLeft === 0 || r.capped);
  }
  assert.ok(seen > 100);
});
test('Kite Launch: each row doubles once, jackpot tins and collector included; payouts reconcile with the board', () => {
  let rows = 0, jack = 0;
  for (let i = 0; i < 3000; i++) {
    const r = T.playRound(mulberry(5000 + i), { buy: 'tin' }); if (r.capped) continue;
    const board = Array.from({ length: 4 }, () => new Array(5).fill(null)), done = new Set(); let total = 0;
    for (const s of r.bonus.spins) {
      for (const t of s.newTins) { assert.equal(board[t.r][t.c], null, 'no tin lands on a filled cell'); board[t.r][t.c] = t.value; if (t.kind !== 'value' && t.kind !== 'collector') jack++; }
      for (const k of s.kite) {
        assert.ok(!done.has(k.row), 'row launches once'); done.add(k.row); rows++;
        for (let c = 0; c < 5; c++) { assert.notEqual(board[k.row][c], null); assert.equal(k.before[c], board[k.row][c]); assert.equal(k.after[c], 2 * board[k.row][c]); board[k.row][c] *= 2; }
      }
      const bt = board.flat().reduce((a, v) => a + (v || 0), 0); assert.ok(near(s.boardTotal, bt));
      const full = board.flat().every(v => v !== null);
      assert.equal(!!s.grand, full); total += s.totalPayout;
      assert.ok(near(total, bt + (full ? T.CFG.grandBonus : 0)), 'running total = board + grand');
    }
    for (let y = 0; y < 4; y++) if (board[y].every(v => v !== null)) assert.ok(done.has(y), 'every complete row launched');
  }
  assert.ok(rows > 50 && jack > 0, `rows ${rows} jackpot tins ${jack}`);
});
test('Collector adds the sum of the tins already on the board; Grand pays board + grandBonus on a full board', () => {
  const save = { ...T.CFG }; Object.assign(T.CFG, { collectorP: 1, miniP: 0, minorP: 0, majorP: 0, q: 1 });
  try {
    const r = T.playRound(mulberry(3), { buy: 'tin' }), sp = r.bonus.spins;
    const first = sp[0].newTins; assert.equal(first[0].kind, 'collector'); assert.equal(first[0].collected, 0); assert.equal(first[0].value, T.CFG.collectorBase);
    assert.equal(first[1].collected, first[0].value);   // second collector collects the first one
    const last = sp[sp.length - 1]; assert.ok(last.grand && last.grand.bonus === 500, 'q=1 fills the board on the first respin');
  } finally { Object.assign(T.CFG, save); }
});
test('cap: totalPayout never above maxWin; capped flag and bonus.totalPayout = min(maxWin, sum)', () => {
  const save = { ...T.CFG }; Object.assign(T.CFG, { grandBonus: 100000 });
  try {
    let capped = 0;
    for (let i = 0; i < 400; i++) {
      const o = i % 2 ? { buy: 'tin' } : {}; const r = T.playRound(mulberry(i), { ...o }); if (!r.bonusTriggered) continue;
      assert.deepEqual(checkRound(r, T.CFG, { buy: o.buy || null }), []);
      if (r.capped) { capped++; assert.equal(r.totalPayout, T.CFG.maxWin); }
    }
    assert.ok(capped > 0, 'a huge Grand hit the cap');
  } finally { Object.assign(T.CFG, save); }
});
test('bought round: trigger spin pays exactly 0, no bundles/wilds, >= 6 tins, cascadeSteps [], tins match grid', () => {
  for (let i = 0; i < 3000; i++) {
    const r = T.playRound(mulberry(i + 9), { buy: 'tin' }), g = r.initialGrid;
    assert.equal(r.cost, 60); assert.equal(r.bought, 'tin'); assert.equal(r.basePayout, 0); assert.deepEqual(r.cascadeSteps, []);
    assert.equal(T.evaluateLines(g).total, 0); assert.ok(!g.flat().includes(BUN) && !g.flat().includes(W));
    const n = g.flat().filter(x => x === TIN).length; assert.ok(n >= 6 && n === r.tins.count);
    assert.equal(r.bonus.spins[0].newTins.length, n);
  }
});
test('buy start distribution = natural trigger distribution (tin count)', () => {
  const rng = mulberry(77), nat = new Array(21).fill(0), buy = new Array(21).fill(0); let nn = 0;
  for (let i = 0; i < 400000; i++) { const r = T.playRound(rng); if (r.bonusTriggered) { nat[r.tins.count]++; nn++; } }
  for (let i = 0; i < nn; i++) buy[T.playRound(rng, { buy: 'tin' }).tins.count]++;
  for (const k of [6, 7, 8]) assert.ok(Math.abs(nat[k] / nn - buy[k] / nn) < 0.05, `count ${k}: ${nat[k] / nn} vs ${buy[k] / nn}`);
});
test('CONTRACT v1 on random rounds, base and buy; JSON-safe; bounded respins', () => {
  const rng = mulberry(2024);
  for (const mode of ['base', 'buy']) for (let i = 0; i < 6000; i++) {
    const o = mode === 'buy' ? { buy: 'tin' } : {}, r = T.playRound(rng, o);
    assert.deepEqual(checkRound(r, T.CFG, { buy: o.buy || null }), [], `${mode} ${i}`);
    assert.ok(r.bonus === null || r.bonus.spins.length <= 1 + T.CFG.maxRespins);
    assert.doesNotThrow(() => JSON.stringify(r));
  }
});
test('no ante/luck in CFG; only the one buy', () => {
  assert.ok(!T.CFG.anteCost && !T.CFG.luckCost); assert.deepEqual(Object.keys(T.CFG.buy), ['tin']); assert.equal(T.CFG.maxWin, 5000);
});
