/* node --test tools/engines.test.js   (TEST_ROUNDS=100000 for the full run) -- contract + determinism for every registered engine */
import test from 'node:test';
import assert from 'node:assert/strict';
import { getEngine, listEngines, listModes, modeOpts } from '../engines/index.js';
import { checkRound } from './check-round.js';
import { mulberry, runSeed } from './sim.js';

const ROUNDS = Number(process.env.TEST_ROUNDS || 2000);

for (const id of listEngines()) {
  const eng = getEngine(id);
  test(`${id}: exports and CFG`, () => {
    for (const k of ['CFG', 'playRound', 'cryptoRng']) assert.ok(eng[k], `missing ${k}`);
    const { bets, maxWin, buy } = eng.CFG;
    assert.ok(bets.length > 1 && bets.every((b, i) => b >= 0.1 && b <= 10000 && Math.round(b * 100) / 100 === b && (!i || b > bets[i - 1])), 'bets ascending cents $0.10..$10000');
    assert.ok(maxWin >= 5000 && maxWin <= 10000, 'maxWin 5000..10000');
    assert.ok(buy && Object.values(buy).every(b => b.cost > 0));
    const r = eng.cryptoRng(); assert.ok(r >= 0 && r < 1);
  });
  for (const mode of listModes(eng)) {
    test(`${id}: CONTRACT v1 on ${ROUNDS} random rounds, mode ${mode}`, () => {
      const rng = mulberry(777), o = modeOpts(eng, mode); let trig = 0;
      for (let i = 0; i < ROUNDS; i++) {
        const r = eng.playRound(rng, o), errs = checkRound(r, eng.CFG, { ante: !!o.ante, buy: o.buy || null });
        assert.deepEqual(errs, [], `round ${i}: ${errs.join('; ')}`);
        if (r.bonusTriggered) trig++;
        assert.doesNotThrow(() => JSON.stringify(r));
      }
      if (o.buy) assert.equal(trig, ROUNDS, 'a buy always triggers the bonus');
    });
  }
  test(`${id}: seeded sim is deterministic`, () => {
    const a = runSeed(eng, 'base', 3000, 42), b = runSeed(eng, 'base', 3000, 42), c = runSeed(eng, 'base', 3000, 43);
    assert.deepEqual(a, b);
    assert.notEqual(a.ret, c.ret);
    const t1 = JSON.stringify(eng.playRound(mulberry(9), {})), t2 = JSON.stringify(eng.playRound(mulberry(9), {}));
    assert.equal(t1, t2);
  });
  test(`${id}: checkRound actually rejects broken rounds`, () => {
    const r = eng.playRound(mulberry(5), { buy: Object.keys(eng.CFG.buy)[0] });
    assert.ok(checkRound({ ...r, totalPayout: r.totalPayout + 1 }, eng.CFG, { buy: r.bought }).length);
    assert.ok(checkRound({ ...r, cascadeSteps: [{ payout: 1 }] }, eng.CFG, { buy: r.bought }).length);
    assert.ok(checkRound({ ...r, bonus: null }, eng.CFG, { buy: r.bought }).length);
  });
}
