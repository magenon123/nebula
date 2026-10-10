/* node --test tools/cloudtop.test.js : rule tests for Koji's Cloudtop Tea House + contract on random rounds (base and buy) */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../engines/cloudtop-tea-house.js';
import { mulberry } from './sim.js';
import { checkRound } from './check-round.js';

const W = 8, BUN = 9, TIN = 10, FS = 16, P = T.CFG.pay, S = T.CFG.payScale, near = (a, b) => Math.abs(a - b) < 1e-9;
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
    assert.equal(r.bonusType === 'tin', r.tins.count >= 6); assert.equal(r.bonusTriggered, r.tins.count >= 6 || r.fsScatter.count >= 3);
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
test('bought Tin Rush start: tin count follows the binomial(tinStartP) conditioned on >= 6', () => {
  const rng = mulberry(77), p = T.CFG.tinStartP, N = 60000, buy = new Array(21).fill(0), pr = new Array(21).fill(0); let c = 1, tot = 0;
  for (let k = 0; k <= 20; k++) { pr[k] = k >= 6 ? c * p ** k * (1 - p) ** (20 - k) : 0; tot += pr[k]; c = c * (20 - k) / (k + 1); }
  for (let i = 0; i < N; i++) buy[T.playRound(rng, { buy: 'tin' }).tins.count]++;
  for (const k of [6, 7, 8]) assert.ok(Math.abs(buy[k] / N - pr[k] / tot) < 0.02, `count ${k}: ${buy[k] / N} vs ${pr[k] / tot}`);
});
test('Tin Rush is BUY-ONLY: 300k natural base rounds and 100k FS LUCK rounds never contain a tin or a tin bonus', () => {
  const rng = mulberry(5); let fsNat = 0;
  for (const ante of [false, true]) for (let i = 0; i < (ante ? 100000 : 300000); i++) { const r = T.playRound(rng, { ante }); assert.equal(r.tins.count, 0); assert.notEqual(r.bonusType, 'tin'); if (r.bonusType) fsNat++; }
  assert.ok(fsNat > 1000);
});
test('CONTRACT v1 on random rounds, base and buy; JSON-safe; bounded respins', () => {
  const rng = mulberry(2024);
  for (const mode of ['base', 'buy', 'fs', 'super']) for (let i = 0; i < 6000; i++) {
    const o = mode === 'base' ? {} : { buy: mode === 'buy' ? 'tin' : mode }, r = T.playRound(rng, o);
    assert.deepEqual(checkRound(r, T.CFG, { buy: o.buy || null }), [], `${mode} ${i}`);
    assert.ok(r.bonus === null || r.bonus.spins.length <= 1 + T.CFG.maxRespins);
    assert.doesNotThrow(() => JSON.stringify(r));
  }
});
test('FS Luck (ante 3x), no MAX LUCK; three buys, Tin Rush stays 60x', () => {
  assert.equal(T.CFG.anteCost, 3); assert.ok(!T.CFG.luckCost); assert.deepEqual(Object.keys(T.CFG.buy), ['tin', 'fs', 'super']); assert.equal(T.CFG.buy.tin.cost, 60); assert.equal(T.CFG.maxWin, 5000);
});

test('FS Luck: no tin coins, Tin Rush never triggers, only Free Spins / Super', () => {
  const rng = mulberry(321); let fs = 0;
  for (let i = 0; i < 40000; i++) { const r = T.playRound(rng, { ante: true }); assert.equal(r.cost, 3); assert.equal(r.tins.count, 0); assert.notEqual(r.bonusType, 'tin'); if (r.bonusType === 'fs' || r.bonusType === 'super') fs++; }
  assert.ok(fs > 1500 && fs < 4500, 'FS about 1 in 14: ' + fs);
});

/* ---------------- Free Spins / Super Free Spins (Steeping Drawers) ---------------- */
const withCfg = (patch, fn) => { const save = JSON.parse(JSON.stringify(T.CFG)); for (const [k, v] of Object.entries(patch)) T.CFG[k] = v; try { return fn(); } finally { for (const k of Object.keys(T.CFG)) delete T.CFG[k]; Object.assign(T.CFG, save); } };
const fsRounds = (n, seed, mode) => { const rng = mulberry(seed), out = []; for (let i = 0; i < n; i++) { const r = T.playRound(rng, mode === 'base' ? {} : { buy: mode }); if (r.bonusType === 'fs' || r.bonusType === 'super') out.push(r); } return out; };

test('FS scatter id 16 pays nothing, is a blank for lines, wild never substitutes it', () => {
  const g = blank(); g[0][0] = 7; g[0][1] = 7; g[0][2] = FS; g[0][3] = 7; g[0][4] = 7;
  assert.equal(T.evaluateLines(g).wins.filter(x => x.line === 0).length, 0);
  const g2 = blank(); g2[0][0] = 7; g2[0][1] = 7; g2[0][2] = W; g2[0][3] = FS; g2[0][4] = FS;
  assert.equal(T.evaluateLines(g2).wins.find(x => x.line === 0).len, 3, 'wild counts, FS stops the line');
  const g3 = blank(); g3[0][0] = FS; g3[0][1] = W; g3[0][2] = W; g3[0][3] = W;
  assert.equal(T.evaluateLines(g3).wins.filter(x => x.line === 0).length, 0);
  assert.equal(T.info().fsScatter, 16);
});
test('boost formula: line pays mult * (1 + sum of boost[level] over the cells of the win, wild cells included)', () => {
  const lv = Array.from({ length: 4 }, () => new Array(5).fill(0)), boost = [0, 1, 2, 4];
  const g = blank(); g[1][0] = 5; g[1][1] = W; g[1][2] = 5; g[1][3] = 5; g[1][4] = 2;
  lv[1][0] = 3; lv[1][1] = 2; lv[1][3] = 1; lv[1][4] = 3;   // reel 5 drawer is not part of the win (len 4): must not count
  const w = T.evaluateSteep(g, lv, boost).wins.find(x => x.line === 1);
  assert.equal(w.len, 4); assert.equal(w.boost, 4 + 2 + 0 + 1); assert.ok(near(w.payout, P[5][1] * S * 8)); assert.ok(near(w.mult, P[5][1] * S));
  assert.ok(near(T.evaluateSteep(g, Array.from({ length: 4 }, () => new Array(5).fill(0)), boost).total, P[5][1] * S), 'level 0 = plain pay');
});
test('FS/Super rounds replay exactly from the JSON: pay uses levels BEFORE the spin; level-up once per drawer per spin; capped at max level', () => {
  let nFs = 0, nSup = 0, ups = 0, multi = 0;
  const rs = [...fsRounds(40000, 11, 'base'), ...fsRounds(400, 12, 'fs'), ...fsRounds(300, 13, 'super')];
  for (const r of rs) {
    const b = r.bonus, T_ = T.CFG[b.type]; b.type === 'fs' ? nFs++ : nSup++;
    const lv = Array.from({ length: 4 }, () => new Array(5).fill(0)); for (const p of b.preSteep) lv[p.r][p.c] = p.level;
    assert.equal(b.type === 'fs' ? b.preSteep.length === 0 : b.preSteep.length === T.CFG.super.preSteep, true);
    let left = b.startSpins, run = 0;
    for (const s of b.spins) {
      assert.deepEqual(s.levels, lv, 'levels field = state before the spin');
      const ev = T.evaluateSteep(s.grid, lv, T_.boost);
      assert.equal(s.wins.length, ev.wins.length);
      if (!r.capped) assert.ok(near(s.payout, ev.total) && near(s.totalPayout, ev.total));
      const cnt = new Map(); for (const w of s.wins) for (const [y, x] of w.cells) cnt.set(y * 5 + x, (cnt.get(y * 5 + x) || 0) + 1);
      assert.equal(s.levelUps.length, [...cnt.keys()].filter(k => lv[Math.floor(k / 5)][k % 5] < T_.maxLevel).length);
      for (const u of s.levelUps) { assert.equal(u.to, u.from + 1); assert.equal(lv[u.r][u.c], u.from); assert.ok(u.to <= T_.maxLevel); assert.equal(u.popKite, u.to === T_.maxLevel); lv[u.r][u.c] = u.to; ups++; if (cnt.get(u.r * 5 + u.c) > 1) multi++; }
      for (let y = 0; y < 4; y++) for (let x = 0; x < 5; x++) assert.ok(lv[y][x] <= T_.maxLevel);
      assert.ok(!s.grid.flat().includes(BUN) && !s.grid.flat().includes(TIN), 'no bundle after flip, no tins in the bonus');
      left = left - 1 + (s.retrigger || 0); if (!r.capped || s !== b.spins[b.spins.length - 1]) assert.equal(s.spinsLeft, left);
      run += s.totalPayout; assert.ok(near(s.runningTotal, run));
    }
    assert.ok(near(b.totalPayout, Math.min(T.CFG.maxWin - r.basePayout, run)));
  }
  assert.ok(nFs > 50 && nSup > 20 && ups > 500 && multi > 20, `fs ${nFs} super ${nSup} ups ${ups} drawers on several lines ${multi}`);
});
test('retrigger table: 3/4/5 FS on a bonus board add the table spins, once per spin, never upgrade FS to Super, belt respected', () => {
  const seen = { fs: {}, super: {} };
  withCfg({ fsPBonus: 0.12 }, () => {
    for (const r of [...fsRounds(3000, 21, 'fs'), ...fsRounds(3000, 22, 'super')]) {
      const T_ = T.CFG[r.bonus.type]; let total = r.bonus.startSpins;
      for (const s of r.bonus.spins) {
        if (s.fsCount >= 3) { const want = Math.min(T_.retrig[Math.min(5, s.fsCount)], T_.maxSpins - total); if (want > 0) { assert.equal(s.retrigger, want); seen[r.bonus.type][s.fsCount] = 1; } total += s.retrigger || 0; }
        else assert.equal(s.retrigger, undefined);
        assert.ok(s.fsCells.length === s.fsCount && s.fsCells.every(([y, x]) => s.grid[y][x] === FS));
      }
      assert.ok(total <= T_.maxSpins); assert.equal(r.bonus.spins.length + (r.capped ? 0 : 0) <= T_.maxSpins, true);
      assert.equal(r.bonus.type, r.bought);   // retrigger never changes the type
      if (!r.capped) assert.equal(r.bonus.spins.length, total, 'every awarded spin is played');
    }
  });
  assert.ok(seen.fs[3] && seen.fs[4] && seen.super[3] && seen.super[4], JSON.stringify(seen));
});
test('trigger counts: exactly 3 FS = Free Spins (10), 4 = Super (12), 5+ = Super with 16; FS pays nothing in base; 1-2 FS never trigger', () => {
  const rng = mulberry(31), seen = {};
  withCfg({ fsP: 0.12 }, () => {
    for (let i = 0; i < 20000; i++) {
      const r = T.playRound(rng), n = r.fsScatter.count; assert.equal(r.initialGrid.flat().filter(x => x === FS).length, n);
      assert.ok(near(r.basePayout, r.cascadeSteps[0].payout));
      if (r.tins.count >= 6) { assert.equal(r.bonusType, 'tin'); continue; }
      if (n < 3) { assert.ok(r.bonusType === null && !r.bonusTriggered); continue; }
      assert.equal(r.bonusType, n === 3 ? 'fs' : 'super'); assert.equal(r.bonus.startSpins, n === 3 ? 10 : n === 4 ? 12 : 16); seen[Math.min(n, 5)] = 1;
    }
  });
  assert.ok(seen[3] && seen[4] && seen[5]);
});
test('priority rule: 6+ tins and 3+ FS on one spin = Tin Rush only, FS cells rewritten to pay symbols before output; 5 tins + 3 FS = FS only', () => {
  let tinWins = 0, fsOnly = 0;
  withCfg({ coinP: 0.2, fsP: 0.15 }, () => {
    const rng = mulberry(41);
    for (let i = 0; i < 20000; i++) {
      const r = T.playRound(rng);
      if (r.tins.count >= 6) { assert.equal(r.bonusType, 'tin'); assert.ok(r.fsScatter.count < 3, '1-2 FS stay'); assert.equal(r.initialGrid.flat().filter(x => x === FS).length, r.fsScatter.count);
      if (r.fsScatter.suppressed >= 3) { tinWins++; assert.equal(r.fsScatter.count, 0); assert.ok(!r.initialGrid.flat().includes(FS) && !r.cascadeSteps[0].grid.flat().includes(FS)); } }
      else { assert.equal(r.fsScatter.suppressed, 0); if (r.tins.count === 5 && r.fsScatter.count >= 3) { assert.ok(r.bonusType === 'fs' || r.bonusType === 'super'); fsOnly++; } }
      assert.ok(near(r.cascadeSteps[0].payout, T.evaluateLines(r.cascadeSteps[0].grid).total));
    }
  });
  assert.ok(tinWins > 20 && fsOnly > 5, `${tinWins} ${fsOnly}`);
});
test('FS LUCK: bonuses come about 5x as often as the normal game (trigger 1-in ratio 4.7-5.4), cost 3x', () => {
  const N = 600000; const cnt = ante => { const rng = mulberry(ante ? 61 : 62); let n = 0; for (let i = 0; i < N; i++) { const r = T.playRound(rng, { ante }); if (r.bonusTriggered) n++; } return n; };
  const ratio = cnt(true) / cnt(false); assert.ok(ratio > 4.7 && ratio < 5.4, 'ratio ' + ratio);
});
test('cap: FS bonus with absurd boosts ends on the crossing spin, totals clamp to 5000, running total never decreases', () => {
  let capped = 0;
  withCfg({ fs: { ...T.CFG.fs, boost: [0, 50, 500, 5000] }, super: { ...T.CFG.super, boost: [0, 50, 500, 5000, 50000] } }, () => {
    for (const mode of ['fs', 'super']) for (let i = 0; i < 300; i++) {
      const r = T.playRound(mulberry(900 + i), { buy: mode });
      assert.deepEqual(checkRound(r, T.CFG, { buy: mode }), []);
      let prev = 0; for (const s of r.bonus.spins) { assert.ok(s.runningTotal >= prev - 1e-9 && s.runningTotal <= T.CFG.maxWin + 1e-9); prev = s.runningTotal; }
      if (r.capped) { capped++; assert.equal(r.totalPayout, T.CFG.maxWin); const l = r.bonus.spins[r.bonus.spins.length - 1]; assert.equal(l.spinsLeft, 0); assert.ok(near(l.runningTotal, T.CFG.maxWin)); }
    }
  });
  assert.ok(capped > 100, 'cap reached ' + capped);
});
test('cap is shared with the base spin: totalPayout = min(5000, base + bonus)', () => {
  withCfg({ fs: { ...T.CFG.fs, boost: [0, 50, 500, 5000] }, fsP: 0.1, payScale: 5 }, () => {
    for (const r of fsRounds(3000, 61, 'base')) {
      assert.deepEqual(checkRound(r, T.CFG, {}), []);
      assert.ok(near(r.bonus.totalPayout, Math.min(r.bonus.spins.reduce((a, s) => a + s.totalPayout, 0), T.CFG.maxWin - r.basePayout)));
    }
  });
});
test('FS buys: trigger spin = exactly 3 FS (fs) / 4 or 5 (super), pays 0, no tins/bundles/wilds/lines; super keeps the natural 4:5 mix; pre-warm = 4 distinct drawers at level 2', () => {
  let c4 = 0, c5 = 0;
  for (let i = 0; i < 3000; i++) for (const k of ['fs', 'super']) {
    const r = T.playRound(mulberry(7000 + i), { buy: k }), g = r.initialGrid, n = g.flat().filter(x => x === FS).length;
    assert.equal(r.cost, T.CFG.buy[k].cost); assert.equal(r.bought, k); assert.equal(r.bonusType, k); assert.equal(r.basePayout, 0); assert.deepEqual(r.cascadeSteps, []);
    assert.equal(T.evaluateLines(g).total, 0); assert.ok(!g.flat().some(x => x === BUN || x === W || x === TIN)); assert.equal(r.fsScatter.count, n); assert.equal(r.tins.count, 0);
    if (k === 'fs') { assert.equal(n, 3); assert.equal(r.bonus.startSpins, 10); assert.equal(r.bonus.preSteep.length, 0); assert.deepEqual(r.bonus.spins[0].levels.flat().filter(Boolean), []); }
    else { assert.ok(n >= 4); n === 4 ? c4++ : c5++; assert.equal(r.bonus.startSpins, n === 4 ? 12 : 16);
      assert.equal(new Set(r.bonus.preSteep.map(p => p.r * 5 + p.c)).size, 4); assert.ok(r.bonus.preSteep.every(p => p.level === 2 && r.bonus.spins[0].levels[p.r][p.c] === 2));
      assert.equal(r.bonus.spins[0].levels.flat().filter(Boolean).length, 4); }
  }
  assert.ok(c4 > 2000 && c5 < c4 / 8 && c5 > 0, `4FS ${c4} 5FS ${c5}`);
});
test('info() exposes buy prices, level tables, retrigger tables and FS rates', () => {
  const i = T.info();
  assert.deepEqual(i.buy, T.CFG.buy); assert.deepEqual(i.fsBonus.fs.boost, T.CFG.fs.boost); assert.deepEqual(i.fsBonus.super.boost, T.CFG.super.boost);
  assert.deepEqual(i.fsBonus.fs.retrigger, T.CFG.fs.retrig); assert.equal(i.fsBonus.super.startSpins5, 16); assert.equal(i.fsBonus.fs.maxLineMult, 1 + 5 * T.CFG.fs.boost[3]);
  assert.ok(i.fsRates.oneIn3 > 60 && i.fsRates.oneIn3 < 120 && i.fsRates.oneIn4 > 400 && i.fsRates.oneIn4 < 1100, JSON.stringify(i.fsRates));
});
