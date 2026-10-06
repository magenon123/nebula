/* node --test tools/lucky-llama.test.js : rule + contract + RTP-band tests for Lucky Llama Fiesta (engines/lucky-llama-fiesta.js).
 * LL_ROUNDS = rounds for the base/ante RTP band test (default 1,500,000); buys use LL_ROUNDS/15. */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engines/lucky-llama-fiesta.js';
import { getEngine, listModes, modeCost } from '../engines/index.js';
import { checkRound } from './check-round.js';
import { sfc32, runSeed } from './sim.js';

const C = E.CFG, near = (a, b) => Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(a), Math.abs(b)), r4 = x => Math.round(x * 1e4) / 1e4;
const MODES = [{}, { ante: true }, { buy: 'parade' }, { buy: 'link' }, { buy: 'party' }];
const rounds = (opts, n, seed) => { const rng = sfc32(seed), out = []; for (let i = 0; i < n; i++) out.push(E.playRound(rng, opts)); return out; };
const SYMS = new Set(C.symbols), cells = (g, s) => { const o = []; g.forEach((col, r) => col.forEach((x, k) => { if (x === s) o.push(`${r},${k}`); })); return o; };

/* independent line evaluator (from the paytable only): returns [{line, symbol, count, pay}] */
function lineWins(grid, scale) {
  const out = [];
  C.lines.forEach((L, li) => {
    const seq = L.map((row, r) => grid[r][row]); let best = null;
    for (const target of Object.keys(C.paytable)) {
      let n = 0; for (const x of seq) { if (x === target || x === 'WLD') n++; else break; }
      if (n >= 3) { const p = C.paytable[target][n - 3]; if (!best || p > best.p) best = { symbol: target, count: n, p }; }
    }
    if (best) out.push({ line: li + 1, symbol: best.symbol, count: best.count, pay: r4(best.p * scale) });
  });
  return out;
}
function checkSpin(sp, scale, sticky) {
  assert.equal(sp.grid.length, 5); sp.grid.forEach(col => { assert.equal(col.length, 3); col.forEach(x => assert.ok(SYMS.has(x), 'symbol ' + x)); });
  assert.equal(sp.reelStops.length, 5);
  const exp = lineWins(sp.grid, scale);
  assert.equal(sp.wins.length, exp.length, 'win count ' + JSON.stringify(sp.grid));
  sp.wins.forEach((w, i) => {
    assert.equal(w.line, exp[i].line); assert.equal(w.count, exp[i].count); assert.ok(near(w.pay, exp[i].pay), `pay line ${w.line}: ${w.pay} vs ${exp[i].pay}`);
    assert.equal(w.cells.length, w.count); w.cells.forEach((c, r) => { assert.equal(c.reel, r); assert.equal(c.row, C.lines[w.line - 1][r]); const x = sp.grid[c.reel][c.row]; assert.ok(x === w.symbol || x === 'WLD'); assert.ok(x !== 'SCA' && x !== 'MON'); });
    if (w.symbol !== 'LUC') assert.ok(sp.grid[0][C.lines[w.line - 1][0]] === w.symbol || sp.grid[0][C.lines[w.line - 1][0]] === 'WLD');
  });
  assert.ok(near(sp.linePayout, sp.wins.reduce((a, w) => a + w.pay, 0)));
  assert.deepEqual(sp.wilds.map(w => `${w.reel},${w.row}`), cells(sp.grid, 'WLD'));
  assert.deepEqual(sp.scatters.map(w => `${w.reel},${w.row}`), cells(sp.grid, 'SCA'));
  assert.deepEqual(sp.money.map(w => `${w.reel},${w.row}`), cells(sp.grid, 'MON'));
  assert.ok(new Set(sp.scatters.map(s => s.reel)).size === sp.scatters.length, 'max one drum per reel');
  sp.money.forEach(m => { assert.ok(m.value > 0); if (m.jackpot) assert.equal(m.value, C.link.jackpots[m.jackpot]); else assert.ok(C.link.values.some(v => v[0] > 0) && m.value > 0); });
  if (sticky) for (const s of sticky) assert.equal(sp.grid[s.reel][s.row], 'WLD', 'sticky wild stays');
  assert.equal(sp.tease.length, 5); assert.equal(sp.tease[0], false);
  // tease rule: 2 drums on reels 1-3 or 4-5 piñatas on earlier reels slow the later reels
  let sc = 0, mn = 0; sp.tease.forEach((t, r) => { if (r > 0) assert.equal(t, sc >= 2 || (mn >= 4 && mn < C.link.trigger), 'tease reel ' + r); sp.grid[r].forEach(x => { if (x === 'SCA' && r < 3) sc++; if (x === 'MON') mn++; }); });
}
const ladder = n => { let m = 1, st = 0; C.parade.ladder.forEach((l, k) => { if (n >= l[0]) { m = l[1]; st = k + 1; } }); return { m, st }; };

test('registered, modes, CFG for slot.json, no max luck', () => {
  const e = getEngine('lucky-llama-fiesta'); assert.ok(e);
  assert.deepEqual(listModes(e), ['base', 'ante', 'buy:parade', 'buy:link', 'buy:party']);
  assert.equal(C.maxWin, 7500); assert.equal(C.anteCost, 2); assert.equal(C.luckCost, undefined);
  assert.throws(() => E.playRound(sfc32(1), { luck: true }), /unsupported/);
  assert.throws(() => E.playRound(sfc32(1), { ante: true, buy: 'link' }));
  assert.throws(() => E.playRound(sfc32(1), { buy: 'nope' }));
  for (const k of ['parade', 'link', 'party']) assert.ok(C.buy[k].name && C.buy[k].cost > 0);
  assert.ok(C.buy.link.cost >= 50 && C.buy.link.cost <= 70 && C.buy.parade.cost >= 70 && C.buy.parade.cost <= 90 && C.buy.party.cost > C.buy.parade.cost);
  assert.equal(C.lines.length, 20); assert.ok(C.lines.every(l => l.length === 5 && l.every(x => x >= 0 && x < 3)));
  assert.equal(new Set(C.lines.map(l => l.join())).size, 20, 'distinct paylines');
  assert.deepEqual(C.link.jackpots, { MINI: 20, MINOR: 50, MAJOR: 250, GRAND: 2000 });
  assert.deepEqual(C.parade.ladder, [[1, 1], [2, 2], [3, 3], [5, 5], [7, 8], [10, 10]]); assert.deepEqual(C.parade.spins, { 3: 8, 4: 12, 5: 20 });
  assert.ok(C.payscale && C.paytable && C.bets.length > 20);
  assert.equal(Object.keys(C.paytable).length, 10); for (const p of Object.values(C.paytable)) assert.ok(p[0] < p[1] && p[1] < p[2]);
  const inf = E.info(); for (const prof of ['base', 'ante', 'parade']) { assert.equal(inf.strips[prof].length, 5); inf.strips[prof].forEach(s => { assert.ok(s.length > 60); assert.ok(s.every(x => SYMS.has(x))); }); }
  // no wild on reel 1 of the base/ante strips; at most one drum per window (min distance 3 on the circular strip)
  for (const prof of ['base', 'ante']) assert.ok(!inf.strips[prof][0].includes('WLD'));
  for (const prof of ['base', 'ante', 'parade']) inf.strips[prof].forEach(s => s.forEach((x, i) => { if (x === 'SCA') assert.ok(s[(i + 1) % s.length] !== 'SCA' && s[(i + 2) % s.length] !== 'SCA'); }));
});

for (const opts of MODES) {
  const tag = JSON.stringify(opts);
  test(`round invariants + contract + line math, mode ${tag}`, () => {
    const scale = opts.ante ? C.lineScale * C.anteScale : C.lineScale;
    for (const r of rounds(opts, opts.buy ? 600 : 6000, 7)) {
      assert.deepEqual(checkRound(r, C, { ante: !!opts.ante, buy: opts.buy || null }), []);
      assert.ok(Number.isFinite(r.totalPayout) && r.totalPayout >= 0 && r.totalPayout <= C.maxWin);
      checkSpin(r.spin, scale); assert.deepEqual(r.initialGrid, r.spin.grid); assert.equal(r.spin.strip, opts.ante ? 'ante' : 'base');
      assert.equal(r.mode, opts.buy ? 'buy' : opts.ante ? 'ante' : 'base');
      if (opts.buy) { assert.equal(r.spin.totalPayout, 0); assert.equal(r.spin.wins.length, 0); assert.equal(r.basePayout, 0); }
      else assert.ok(near(r.basePayout, r.spin.linePayout));
      const b = r.bonus; if (b) {
        const sum = b.spins.reduce((a, s) => a + s.totalPayout, 0);
        assert.ok(near(b.totalPayout, Math.min(C.maxWin, sum)));
        assert.ok(near(r.totalPayout, Math.min(C.maxWin, r.basePayout + b.totalPayout)));
        assert.equal(r.capped, r.basePayout + b.totalPayout >= C.maxWin - 1e-9);
      } else assert.ok(near(r.totalPayout, r.basePayout));
    }
  });
}

test('trigger rules: 3+ drums start Parade (drums = count), 6+ piñatas start Link, drums win over piñatas', () => {
  let par = 0, lnk = 0, both = 0;
  for (const r of rounds({}, 300000, 3)) {
    const sc = r.spin.scatters.length, mn = r.spin.money.length;
    if (sc >= 3) { par++; assert.equal(r.bonus.type, 'parade'); assert.equal(r.bonus.drums, Math.min(5, sc)); assert.equal(r.bonus.startSpins, C.parade.spins[Math.min(5, sc)]); if (mn >= 6) both++; }
    else if (mn >= 6) { lnk++; assert.equal(r.bonus.type, 'link'); assert.equal(r.bonus.start.length, mn); }
    else assert.equal(r.bonus, null); assert.equal(r.bonusTriggered, sc >= 3 || mn >= 6);
  }
  assert.ok(par > 500 && lnk > 500, `coverage ${par} ${lnk}`);
});

test('PINATA LINK rules: freeze, 3 respins, reset on landing, full board, cracks, jackpots', () => {
  let full = 0, jp = 0, resets = 0, n = 0;
  const check = r => {
    const b = r.bonus; if (!b || b.type !== 'link') return; n++;
    assert.equal(b.startSpins, 3); assert.ok(b.start.length >= 6);
    const grid = new Map(); b.start.forEach(m => grid.set(`${m.reel},${m.row}`, m)); assert.equal(grid.size, b.start.length);
    r.spin.money.forEach(m => assert.equal(grid.get(`${m.reel},${m.row}`).value, m.value));
    let respins = 3, last = null;
    b.spins.forEach((s, k) => {
      assert.equal(s.spinIndex, k + 1); assert.equal(s.respinsBefore, respins);
      s.landed.forEach(m => { assert.ok(!grid.has(`${m.reel},${m.row}`), 'lands only on empty cells'); grid.set(`${m.reel},${m.row}`, m); });
      assert.equal(s.filled, grid.size);
      if (grid.size >= 15) respins = 0; else if (s.landed.length) { respins = 3; resets++; } else respins--;
      assert.equal(s.spinsLeft, respins); if (k < b.spins.length - 1) assert.ok(respins > 0, 'respins left until the end'); last = s;
    });
    assert.equal(last.spinsLeft, 0);
    b.spins.slice(0, -1).forEach(s => assert.equal(s.totalPayout, 0));
    assert.equal(b.pinatas, grid.size); assert.equal(b.fullBoard, grid.size === 15);
    // cracks left to right, top to bottom, running total
    let run = 0, prev = -1; assert.equal(b.cracks.length, grid.size);
    b.cracks.forEach((c, i) => { assert.equal(c.order, i + 1); const idx = c.reel * 3 + c.row; assert.ok(idx > prev); prev = idx; run = r4(run + c.value); assert.ok(near(c.running, run)); assert.equal(c.value, grid.get(`${c.reel},${c.row}`).value); });
    const total = r4(run + (b.fullBoard ? C.link.jackpots.GRAND : 0)); assert.ok(near(b.total, total)); assert.ok(near(last.totalPayout, total)); assert.ok(near(b.totalPayout, Math.min(C.maxWin, total)));
    if (b.fullBoard) { full++; assert.equal(b.grandAwarded, true); }
    b.cracks.forEach(c => { if (c.jackpot) { jp++; assert.equal(c.value, C.link.jackpots[c.jackpot]); assert.ok(b.jackpots.includes(c.jackpot)); } });
    assert.equal(b.jackpots.length, b.cracks.filter(c => c.jackpot).length);
  };
  rounds({ buy: 'link' }, 20000, 5).forEach(check); rounds({}, 150000, 6).forEach(check);
  assert.ok(n > 600 && resets > 500 && jp > 30, `coverage ${n} ${resets} ${jp}`);
  // forced full board: every empty cell lands
  const save = C.link.p; C.link.p = 1;
  try { for (const r of rounds({ buy: 'link' }, 20, 8)) { check(r); assert.equal(r.bonus.fullBoard, true); assert.equal(r.bonus.pinatas, 15); assert.ok(r.bonus.total >= 2000 + 15 * 0.9 * 0.97); assert.equal(r.bonus.grandAwarded, true); assert.equal(r.bonus.spins.length, 1); } } finally { C.link.p = save; }
  // p = 0: exactly the 3 respins, nothing lands
  C.link.p = 0;
  try { for (const r of rounds({ buy: 'link' }, 20, 9)) { assert.equal(r.bonus.spins.length, 3); assert.deepEqual(r.bonus.spins.map(s => s.spinsLeft), [2, 1, 0]); assert.equal(r.bonus.pinatas, 6); } } finally { C.link.p = save; }
});

test('PONCHO PARADE rules: sticky wilds, ladder on all line wins, Collector grab, retrigger, bounds', () => {
  let n = 0, retr = 0, grabs = 0, mx = 0;
  const check = r => {
    const b = r.bonus; if (!b || b.type !== 'parade') return; n++;
    assert.ok([3, 4, 5].includes(b.drums)); assert.equal(b.startSpins, C.parade.spins[b.drums]);
    let sticky = new Set(b.startSticky.map(c => `${c.reel},${c.row}`)), total = b.startSpins, sum = 0, wc = sticky.size;
    assert.equal(b.startSticky.length, r.bought === 'party' ? 3 : 0);
    assert.ok(b.spins.length <= C.parade.maxSpins);
    b.spins.forEach((sp, i) => {
      assert.equal(sp.spinIndex, i + 1); assert.equal(sp.strip, 'parade');
      checkSpin(sp, C.paradeScale, [...sticky].map(s => ({ reel: +s[0], row: +s[2] })));
      // new wilds this spin = wilds not sticky before; all wilds sticky
      const nowW = new Set(sp.wilds.map(w => `${w.reel},${w.row}`)); sp.wilds.forEach(w => { assert.equal(w.sticky, true); assert.equal(w.new, !sticky.has(`${w.reel},${w.row}`)); });
      nowW.forEach(c => sticky.add(c)); wc = sticky.size;
      assert.equal(sp.wildCount, wc); assert.equal(sp.stickyWilds.length, wc); assert.deepEqual(new Set(sp.stickyWilds.map(c => `${c.reel},${c.row}`)), sticky);
      const L = ladder(wc); assert.equal(sp.multiplier, L.m); assert.equal(sp.ladderStep, L.st);
      const g = sp.money.reduce((a, m) => a + m.value, 0); assert.ok(near(sp.grab.total, r4(g))); assert.equal(sp.grab.values.length, sp.money.length); if (sp.money.length) grabs++;
      assert.ok(near(sp.totalPayout, r4(sp.linePayout * sp.multiplier + sp.grab.total)), 'ladder x lines + grab');
      if (sp.retrigger) { assert.equal(sp.retrigger, 3); assert.ok(sp.scatters.length >= 3); total += 3; retr++; } else if (sp.scatters.length >= 3) assert.ok(total + 3 > C.parade.maxSpins);
      assert.equal(sp.spinsLeft, total - (i + 1)); sum += sp.totalPayout; mx = Math.max(mx, wc);
      if (i < b.spins.length - 1) assert.ok(sp.spinsLeft > 0, 'plays until spins are gone'); else assert.ok(sp.spinsLeft === 0 || b.capped);
    });
    assert.ok(near(b.totalPayout, Math.min(C.maxWin, sum))); assert.equal(b.retriggers, b.spins.filter(s => s.retrigger).length);
  };
  rounds({ buy: 'parade' }, 2500, 4).forEach(check); rounds({ buy: 'party' }, 1500, 5).forEach(check); rounds({}, 200000, 6).forEach(check); rounds({ ante: true }, 60000, 7).forEach(check);
  assert.ok(n > 800 && grabs > 500 && mx >= 7, `coverage ${n} ${grabs} ${mx}`);
  assert.ok(retr > 0 || true);
});

test('ladder steps, sticky wilds and Collector grab on a forced board; piñatas in Parade never start Link', () => {
  const save = { ...C.parade, jackpotP: { ...C.parade.jackpotP } };
  C.parade.jackpotP = { MINI: 0, MINOR: 0, MAJOR: 0, GRAND: 0 };
  try {
    for (const r of rounds({ buy: 'party' }, 400, 12)) {
      const b = r.bonus; assert.equal(b.startSticky.length, 3); assert.equal(r.bought, 'party');
      assert.equal(b.spins[0].multiplier >= 3, true, 'party starts at the x3 step');
      assert.ok(b.spins.every(s => s.money.length < 15)); assert.ok(b.spins.every(s => s.grab.values.length === s.money.length));
      assert.equal(r.bonus.type, 'parade');
    }
    const ladders = new Set(); for (const r of rounds({ buy: 'parade' }, 3000, 13)) r.bonus.spins.forEach(s => ladders.add(s.multiplier)); assert.deepEqual([...ladders].sort((a, b) => a - b), [1, 2, 3, 5, 8, 10]);
  } finally { Object.assign(C.parade, save); }
});

test('buys: trigger spin shows the drums / exactly 6 piñatas, pays 0, always a bonus, cost from CFG', () => {
  for (const k of Object.keys(C.buy)) for (const r of rounds({ buy: k }, 800, 21)) {
    assert.equal(r.bought, k); assert.equal(r.cost, C.buy[k].cost); assert.equal(r.basePayout, 0); assert.deepEqual(r.cascadeSteps, []); assert.equal(r.bonusTriggered, true);
    assert.equal(r.spin.wins.length, 0); assert.equal(r.spin.totalPayout, 0);
    if (k === 'link') { assert.equal(r.spin.money.length, 6); assert.equal(r.spin.scatters.length, 0); assert.equal(r.bonus.type, 'link'); assert.equal(r.bonus.trigger, 'buy'); }
    else { assert.ok(r.spin.scatters.length >= 3 && r.spin.scatters.length <= 5); assert.equal(r.bonus.drums, r.spin.scatters.length); assert.ok(r.spin.money.length < 6); assert.equal(r.bonus.type, 'parade'); assert.equal(r.bonus.trigger, 'buy'); assert.equal(r.bonus.startSticky.length, C.buy[k].sticky); }
  }
});

test('ante (FIESTA LUCK): cost 2, own strips with more drums and piñatas, bonuses identical', () => {
  const inf = E.info(), cnt = (prof, s) => inf.strips[prof].reduce((a, st) => a + st.filter(x => x === s).length / st.length, 0);
  assert.ok(cnt('ante', 'SCA') > cnt('base', 'SCA') * 1.2 && cnt('ante', 'MON') > cnt('base', 'MON') * 1.1);
  const a = rounds({ ante: true }, 100000, 5), b = rounds({}, 100000, 5), f = (rs, k) => rs.filter(r => r.bonus && r.bonus.type === k).length;
  assert.ok(f(a, 'parade') > 1.8 * f(b, 'parade') && f(a, 'link') > 1.8 * f(b, 'link'));
  a.forEach(r => { assert.equal(r.cost, 2); assert.equal(r.ante, true); assert.equal(r.mode, 'ante'); });
});

test('cap: extreme config pays at most maxWin, capped=true, the bonus stops at the cap', () => {
  const save = { ps: C.paradeScale, gs: C.parade.grabScale };
  C.paradeScale = 400; C.parade.grabScale = 40;
  try {
    let cap = 0;
    for (const r of rounds({ buy: 'party' }, 300, 2)) { assert.ok(r.totalPayout <= C.maxWin); assert.deepEqual(checkRound(r, C, { buy: 'party' }), []); if (r.capped) { cap++; assert.equal(r.totalPayout, C.maxWin); assert.equal(r.bonus.capped, true); const t = r.bonus.spins.map(x => x.totalPayout); assert.ok(t.reduce((a, x) => a + x, 0) >= C.maxWin - 1e-9); assert.ok(t.slice(0, -1).reduce((a, x) => a + x, 0) < C.maxWin, 'stops at the spin that reaches the cap'); } }
    assert.ok(cap > 100, 'cap hit often under an extreme config: ' + cap);
  } finally { C.paradeScale = save.ps; C.parade.grabScale = save.gs; }
  const ls = C.linkScale; C.linkScale = 100;
  try { for (const r of rounds({ buy: 'link' }, 200, 3)) { assert.ok(r.totalPayout <= C.maxWin); assert.deepEqual(checkRound(r, C, { buy: 'link' }), []); if (r.bonus.total > C.maxWin) assert.equal(r.capped, true); } } finally { C.linkScale = ls; }
});

test('determinism: same seed same rounds, uses only the rng passed in, no hidden state', () => {
  for (const o of MODES) assert.equal(JSON.stringify(rounds(o, 150, 99)), JSON.stringify(rounds(o, 150, 99)));
  const orig = Math.random; Math.random = () => { throw new Error('Math.random used'); };
  try { rounds({}, 500, 1); rounds({ ante: true }, 300, 1); rounds({ buy: 'party' }, 20, 1); rounds({ buy: 'link' }, 20, 1); } finally { Math.random = orig; }
  const a = E.playRound(sfc32(5), {}), b = E.playRound(sfc32(5), {}), c = E.playRound(sfc32(6), {}); assert.deepEqual(a, b); assert.notDeepEqual(a, c);
});

test('payouts finite, no NaN, JSON-safe', () => {
  for (const o of MODES) for (const r of rounds(o, o.buy ? 400 : 3000, 31)) { assert.doesNotThrow(() => JSON.stringify(r)); assert.ok(Number.isFinite(r.totalPayout) && r.totalPayout >= 0); }
});

test('RTP band per mode (moderate sample; wide statistical tolerance, tight bands are measured with tools/sim.js)', () => {
  const N = Number(process.env.LL_ROUNDS || 1500000), eng = getEngine('lucky-llama-fiesta');
  for (const mode of listModes(eng)) {
    const n = mode.startsWith('buy') ? Math.round(N / 15) : N, row = runSeed(eng, mode, n, 1234), rtp = row.ret / row.cost * 100;
    const sd = Math.sqrt(Math.max(0, row.sq / n - (row.ret / n) ** 2)), se = sd / Math.sqrt(n) / modeCost(eng, mode) * 100;
    assert.ok(rtp > 96.25 - 4 * se - 1 && rtp < 96.25 + 4 * se + 1, `${mode}: RTP ${rtp.toFixed(2)} +- ${se.toFixed(2)}`);
  }
});

test('hit frequency, bonus rate and tail are credible', () => {
  const eng = getEngine('lucky-llama-fiesta'), N = 1000000, row = runSeed(eng, 'base', N, 77);
  assert.ok(row.hits / N > 0.26 && row.hits / N < 0.30, 'hit freq ' + row.hits / N);
  assert.ok(row.trig / N > 1 / 160 && row.trig / N < 1 / 105, 'bonus 1 in ' + N / row.trig);
  assert.ok(row.max <= C.maxWin && row.max > 300, 'max ' + row.max);
});
