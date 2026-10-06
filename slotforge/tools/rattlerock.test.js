/* node --test tools/rattlerock.test.js : rule + contract + RTP-band tests for Rattlerock Run (engines/rattlerock-run.js).
 * RR_ROUNDS = rounds per RTP mode in the band test (default 600000). */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engines/rattlerock-run.js';
import { getEngine, listModes, modeOpts, modeCost } from '../engines/index.js';
import { checkRound } from './check-round.js';
import { sfc32, runSeed } from './sim.js';

const C = E.CFG, near = (a, b) => Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
const MODES = [{}, { ante: true }, { buy: 'deep' }, { buy: 'motherlode' }];
const rounds = (opts, n, seed) => { const rng = sfc32(seed), out = []; for (let i = 0; i < n; i++) out.push(E.playRound(rng, opts)); return out; };

/* replay a track from its stops and check every running number, the crash/shield/door rules; returns the pay */
function replay(stops, st0, { door = true } = {}) {
  let { load, mult, shields } = st0, lanterns = 0, crashed = false, pay = 0;
  stops.forEach((s, k) => {
    assert.equal(s.i, k + 1); assert.equal(s.at, (k + 1) * C.spacing);
    assert.ok(!crashed, 'no stop after a crash');
    const apply = it => {
      if (it.type === 'gold') { assert.ok(it.value > 0); load = Math.round((load + it.value) * 100) / 100; }
      else if (it.type === 'gem') { assert.ok([2, 3, 5, 10, 25, 50].includes(it.value)); mult += it.value; }
      else if (it.type === 'shield') shields++;
      else if (it.type === 'lantern') lanterns++;
      else if (it.type === 'tnt') { if (shields > 0) { shields--; assert.equal(it.shielded, true); assert.equal(it.crash, false); } else { assert.equal(it.shielded, false); assert.equal(it.crash, true); crashed = true; } }
      else assert.ok(['none'].includes(it.type), 'item ' + it.type);
    };
    if (s.type === 'fork') {
      assert.ok(['left', 'right'].includes(s.side)); assert.ok(['rich', 'safe'].includes(s.pick));
      const t = s.side === 'left' ? s.left : s.right; assert.equal(t.type, s.taken.type); assert.equal(t.value, s.taken.value); apply(s.taken);
    } else if (s.type === 'door') {
      assert.equal(k, stops.length - 1); assert.ok(door);
      pay = Math.round((load * mult + s.jackpot) * 100) / 100; assert.ok(near(s.pay, pay)); assert.equal(s.kind, s.jackpot ? 'jackpot' : 'normal');
    } else apply(s);
    assert.ok(near(s.load, load)); assert.equal(s.mult, mult); assert.equal(s.shields, shields); assert.equal(s.lanterns, lanterns);
  });
  if (crashed) pay = load;
  return { pay, load, mult, shields, lanterns, crashed };
}

test('registered, modes and CFG for slot.json', () => {
  const e = getEngine('rattlerock-run'); assert.ok(e);
  assert.deepEqual(listModes(e), ['base', 'ante', 'buy:deep', 'buy:motherlode']);
  assert.equal(C.maxWin, 7500); assert.equal(C.anteCost, 2.5); assert.equal(C.luckCost, undefined, 'no MAX LUCK');
  assert.ok(C.buy.deep.cost >= 60 && C.buy.deep.cost <= 80 && C.buy.motherlode.cost >= 120 && C.buy.motherlode.cost <= 160);
  assert.ok(C.buy.deep.name && C.buy.motherlode.name && C.payscale && C.bets.length > 20);
  assert.ok(Math.max(...C.base.lenW.map(x => x[0])) <= 12, 'at most 12 stops');
});

for (const opts of MODES) {
  const tag = JSON.stringify(opts);
  test(`round invariants + contract + replay, mode ${tag}`, () => {
    for (const r of rounds(opts, 4000, 7)) {
      assert.deepEqual(checkRound(r, C, { ante: !!opts.ante, buy: opts.buy || null }), []);
      assert.ok(Number.isFinite(r.totalPayout) && r.totalPayout >= 0 && r.totalPayout <= C.maxWin);
      assert.equal(r.runs.length, opts.ante ? 2 : 1);
      let base = 0, trig = [];
      for (const [k, run] of r.runs.entries()) {
        assert.equal(run.run, k); assert.ok(run.stops.length <= 12 && run.length <= 12);
        if (run.kind === 'trigger') { assert.ok(opts.buy); assert.equal(run.pay, 0); assert.equal(run.exit, 'bonus'); assert.deepEqual(run.stops.map(s => s.type), ['lantern', 'lantern', 'lantern']); continue; }
        const p = replay(run.stops, { load: 0, mult: 1, shields: 0 });
        assert.equal(run.crash, p.crashed); assert.equal(run.exit, p.crashed ? 'crash' : 'door');
        if (p.crashed) { assert.equal(run.stops.at(-1).type === 'tnt' || run.stops.at(-1).taken?.type === 'tnt', true); assert.ok(near(run.pay, p.load), 'crash pays only the load'); assert.equal(run.crashAt, run.stops.length); }
        else { assert.equal(run.stops.at(-1).type, 'door'); assert.equal(run.stops.length, run.length); assert.ok(near(run.pay, p.pay)); }
        assert.equal(run.lanterns, p.lanterns); assert.equal(run.bonusAt !== null, p.lanterns >= 3); if (run.bonusAt !== null) trig.push(k);
        base += run.pay;
      }
      assert.ok(near(r.basePayout, base));
      assert.equal(r.bonusTriggered, opts.buy ? true : trig.length > 0);
      assert.equal(r.capped, r.basePayout + (r.bonus ? r.bonus.totalPayout : 0) >= C.maxWin - 1e-9);
      assert.ok(near(r.totalPayout, Math.min(C.maxWin, base + (r.bonus ? r.bonus.totalPayout : 0))));
      if (r.bonus) assert.deepEqual(r.bonus.triggeredBy, opts.buy ? [] : trig);
    }
  });
}

test('deep shaft rules: levels, carry, carts, bottom door, shields', () => {
  let bottoms = 0, crashes = 0, lost3 = 0, shieldSaves = 0, n = 0;
  for (const opts of [{}, { buy: 'deep' }, { buy: 'motherlode' }]) for (const r of rounds(opts, opts.buy ? 3000 : 120000, 11)) {
    const b = r.bonus; if (!b) continue; n++;
    const B = opts.buy ? C.buy[opts.buy] : { startLevel: 1, startMult: 1, startShields: 0 };
    assert.equal(b.carts, 3); assert.equal(b.levels, 3); assert.equal(b.startSpins, 3); assert.equal(b.startLevel, B.startLevel);
    let carts = 3, level = B.startLevel, mult = B.startMult, shields = B.startShields, sum = 0, bottom = false;
    for (const [k, sg] of b.spins.entries()) {
      assert.equal(sg.spinIndex, k + 1); assert.equal(sg.level, level); assert.equal(sg.cart, 3 - carts + 1);
      assert.equal(sg.multIn, mult); assert.equal(sg.shieldsIn, shields); assert.ok(!bottom && carts > 0);
      const p = replay(sg.stops, { load: 0, mult, shields }); assert.equal(sg.length, C.bonus.levels[level - 1].len);
      assert.ok(sg.stops.every(s => s.type !== 'lantern' && (s.taken?.type !== 'lantern')), 'no lanterns in the bonus');
      sg.stops.forEach(s => { if (s.type === 'tnt' && s.shielded) shieldSaves++; });
      assert.equal(sg.multOut, p.mult); assert.equal(sg.shieldsOut, p.shields); assert.ok(near(sg.pay, p.pay)); assert.equal(sg.totalPayout, sg.pay);
      sum += sg.pay; assert.ok(near(sg.bonusPayoutSoFar, sum));
      if (p.crashed) { assert.equal(sg.exit, 'crash'); assert.equal(sg.cartLost, true); carts--; crashes++; assert.ok(near(sg.pay, p.load), 'a lost cart pays only its load'); }
      else { assert.equal(sg.cartLost, false); assert.ok(sg.exit === (level === 3 ? 'bottom' : 'level')); if (level === 3) { bottom = true; bottoms++; } else level++; }
      assert.equal(sg.spinsLeft, carts); mult = sg.multOut; shields = sg.shieldsOut;
      if (sum >= C.maxWin) break;
    }
    if (sum < C.maxWin) assert.ok(bottom || carts === 0, 'ends at the bottom door or when carts are gone');
    if (carts === 0) lost3++;
    assert.ok(near(b.totalPayout, Math.min(C.maxWin, sum))); assert.equal(b.bottomReached, bottom); assert.ok(b.spins.length <= 6);
  }
  assert.ok(n > 100 && bottoms > 20 && crashes > 20 && lost3 > 5 && shieldSaves > 5, `coverage ${n} ${bottoms} ${crashes} ${lost3} ${shieldSaves}`);
});

test('motherlode starts at level 2 with shields and start multiplier; deep starts at level 1', () => {
  for (const r of rounds({ buy: 'motherlode' }, 300, 3)) { assert.equal(r.bonus.spins[0].level, 2); assert.equal(r.bonus.spins[0].shieldsIn, 2); assert.equal(r.bonus.spins[0].multIn, C.buy.motherlode.startMult); assert.ok(r.bonus.spins.every(s => s.level >= 2)); }
  for (const r of rounds({ buy: 'deep' }, 300, 4)) { assert.equal(r.bonus.spins[0].level, 1); assert.equal(r.bonus.spins[0].multIn, 1); assert.equal(r.bonus.spins[0].shieldsIn, 0); }
});

test('twin carts: two independent runs, both paid, one bonus at most, more shields', () => {
  const tw = rounds({ ante: true }, 60000, 5), bs = rounds({}, 60000, 5), cnt = rs => { let sh = 0, st = 0; for (const r of rs) for (const run of r.runs) for (const s of run.stops) { st++; if (s.type === 'shield') sh++; } return sh / st; };
  assert.ok(cnt(tw) > cnt(bs) * 1.3, 'shields more frequent');
  let both = 0, diff = 0, same = 0;
  for (const r of tw) {
    assert.equal(r.cost, 2.5); assert.equal(r.cascadeSteps.length, 2); assert.ok(near(r.basePayout, r.runs[0].pay + r.runs[1].pay));
    same += JSON.stringify(r.runs[0].stops) === JSON.stringify(r.runs[1].stops) ? 1 : 0;
    if (r.runs[0].bonusAt !== null && r.runs[1].bonusAt !== null) { both++; assert.deepEqual(r.bonus.triggeredBy, [0, 1]); }
    if (r.runs[0].pay !== r.runs[1].pay) diff++;
  }
  assert.ok(diff > 1000); assert.ok(same < 60000 * 0.05, 'runs are independent');
  const lantern = rs => { let l = 0, st = 0; for (const r of rs) for (const run of r.runs) for (const s of run.stops) { st++; if (s.type === 'lantern' || s.taken?.type === 'lantern') l++; } return l / st; };
  assert.ok(Math.abs(lantern(tw) / lantern(bs) - 1) < 0.1, 'per-stop lantern chance is the same');
});

test('buys: trigger run pays 0, cost, always a bonus, never pays above the cap', () => {
  for (const k of Object.keys(C.buy)) for (const r of rounds({ buy: k }, 500, 21)) {
    assert.equal(r.bought, k); assert.equal(r.cost, C.buy[k].cost); assert.equal(r.basePayout, 0); assert.deepEqual(r.cascadeSteps, []);
    assert.equal(r.bonusTriggered, true); assert.ok(r.totalPayout <= C.maxWin);
  }
});

test('cap: extreme config pays at most maxWin, capped=true, bonus stops at the cap', () => {
  const save = { bonusScale: C.bonusScale, motherScale: C.motherScale, ls: C.bonus.levels.map(l => l.goldScale) };
  C.bonusScale = 400; C.motherScale = 1; C.bonus.levels.forEach(l => { l.goldScale = 400; });
  try {
    const rs = rounds({ buy: 'motherlode' }, 400, 2); let cap = 0;
    for (const r of rs) { assert.ok(r.totalPayout <= C.maxWin); assert.deepEqual(checkRound(r, C, { buy: 'motherlode' }), []); if (r.capped) { cap++; assert.equal(r.totalPayout, C.maxWin); assert.ok(r.bonus.spins.length <= 6); } }
    assert.ok(cap > 100, 'cap hit often under an extreme config: ' + cap);
  } finally { C.bonusScale = save.bonusScale; C.motherScale = save.motherScale; C.bonus.levels.forEach((l, i) => { l.goldScale = save.ls[i]; }); }
});

test('determinism: same seed same rounds, uses only the rng passed in, no hidden state', () => {
  for (const o of MODES) { assert.equal(JSON.stringify(rounds(o, 200, 99)), JSON.stringify(rounds(o, 200, 99))); }
  const orig = Math.random; Math.random = () => { throw new Error('Math.random used'); };
  try { rounds({}, 500, 1); rounds({ ante: true }, 300, 1); } finally { Math.random = orig; }
  const a = E.playRound(sfc32(5), {}), b = E.playRound(sfc32(5), {}), c = E.playRound(sfc32(6), {}); assert.deepEqual(a, b); assert.notDeepEqual(a, c);
});

test('payouts finite, no NaN, JSON-safe', () => {
  for (const o of MODES) for (const r of rounds(o, 3000, 31)) { assert.doesNotThrow(() => JSON.stringify(r)); assert.ok(Number.isFinite(r.totalPayout) && r.totalPayout >= 0); }
});

test('RTP band per mode (moderate sample; wide statistical tolerance, tight bands are measured with tools/sim.js)', () => {
  const N = Number(process.env.RR_ROUNDS || 600000);
  const eng = getEngine('rattlerock-run');
  for (const mode of listModes(eng)) {
    const row = runSeed(eng, mode, N, 1234), rtp = row.ret / row.cost * 100;
    const sd = Math.sqrt(Math.max(0, row.sq / N - (row.ret / N) ** 2)), se = sd / Math.sqrt(N) / modeCost(eng, mode) * 100;
    assert.ok(rtp > 96.25 - 4 * se - 1 && rtp < 96.25 + 4 * se + 1, `${mode}: RTP ${rtp.toFixed(2)} +- ${se.toFixed(2)}`);
  }
});

test('hit frequency, tail and trigger rate are credible', () => {
  const eng = getEngine('rattlerock-run'), N = 400000, row = runSeed(eng, 'base', N, 77);
  assert.ok(row.hits / N > 0.4 && row.hits / N < 0.8, 'hit freq ' + row.hits / N);
  assert.ok(row.trig / N > 1 / 400 && row.trig / N < 1 / 100, 'trigger 1 in ' + N / row.trig);
  assert.ok(row.max < 7501);
});
