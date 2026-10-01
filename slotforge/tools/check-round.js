/* Validate a round against CONTRACT v1 (see engines/ENGINE-API.md).
 *   import { checkRound } from './check-round.js';   checkRound(round, CFG, {ante, buy}) -> string[] of problems ([] = ok)
 *   node tools/check-round.js <round.json> <slot> [ante|buy:<key>]       CLI */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const num = x => typeof x === 'number' && Number.isFinite(x);
const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));

export function checkRound(r, CFG, { ante = false, buy = null } = {}) {
  const e = [], bad = m => e.push(m);
  if (!r || typeof r !== 'object') return ['round is not an object'];
  const expCost = buy ? CFG.buy?.[buy]?.cost : ante ? CFG.anteCost : 1;
  if (!num(r.cost) || r.cost <= 0) bad('cost must be a positive number');
  else if (!near(r.cost, expCost)) bad(`cost ${r.cost} != expected ${expCost}`);
  if (!num(r.totalPayout) || r.totalPayout < 0) bad('totalPayout must be a number >= 0');
  else if (r.totalPayout > CFG.maxWin + 1e-9) bad(`totalPayout ${r.totalPayout} exceeds maxWin ${CFG.maxWin}`);
  if (typeof r.bonusTriggered !== 'boolean') bad('bonusTriggered must be boolean');
  if (typeof r.capped !== 'boolean') bad('capped must be boolean');
  if (!r.initialGrid) bad('initialGrid missing');
  if (!Array.isArray(r.cascadeSteps)) bad('cascadeSteps must be an array');
  else for (const [i, s] of r.cascadeSteps.entries()) if (s && 'payout' in s && !num(s.payout)) bad(`cascadeSteps[${i}].payout not a number`);
  if (!buy && !num(r.basePayout)) bad('basePayout must be a number');
  if (buy && r.basePayout !== undefined && r.basePayout !== 0) bad('bought round must have basePayout 0');

  if (buy) {
    if (r.bought !== buy) bad(`bought must be "${buy}", got ${JSON.stringify(r.bought)}`);
    if (r.bonusTriggered !== true) bad('bought round must have bonusTriggered true');
    if (Array.isArray(r.cascadeSteps) && r.cascadeSteps.length) bad('bought round trigger spin must have no wins (cascadeSteps must be [])');
  } else if (r.bought) bad('bought set on a non-bought round');

  if (r.bonusTriggered === true) {
    const b = r.bonus;
    if (!b || typeof b !== 'object') bad('bonusTriggered but bonus missing');
    else {
      if (!Number.isInteger(b.startSpins) || b.startSpins < 1) bad('bonus.startSpins must be an integer >= 1');
      if (!Array.isArray(b.spins) || b.spins.length < 1) bad('bonus.spins must be a non-empty array');
      else {
        let sum = 0;
        for (const [i, s] of b.spins.entries()) {
          if (!num(s.totalPayout) || s.totalPayout < 0) bad(`bonus.spins[${i}].totalPayout invalid`); else sum += s.totalPayout;
          if (s.spinIndex !== i + 1) bad(`bonus.spins[${i}].spinIndex must be ${i + 1} (1-based, in order)`);
          if (s.retrigger !== undefined && !(Number.isInteger(s.retrigger) && s.retrigger > 0)) bad(`bonus.spins[${i}].retrigger must be a positive integer`);
          if (s.spinsLeft !== undefined && !(Number.isInteger(s.spinsLeft) && s.spinsLeft >= 0)) bad(`bonus.spins[${i}].spinsLeft must be an integer >= 0`);
        }
        if (num(b.totalPayout) && !near(b.totalPayout, Math.min(CFG.maxWin, sum))) bad(`bonus.totalPayout ${b.totalPayout} != min(maxWin, sum spins ${sum})`);
      }
      if (!num(b.totalPayout) || b.totalPayout < 0) bad('bonus.totalPayout must be a number >= 0');
    }
  } else if (r.bonusTriggered === false && r.bonus) bad('bonus must be null when not triggered');

  if (num(r.totalPayout) && num(r.basePayout ?? 0)) {
    const exp = Math.min(CFG.maxWin, (r.basePayout || 0) + (r.bonus && num(r.bonus.totalPayout) ? r.bonus.totalPayout : 0));
    if (!near(r.totalPayout, exp)) bad(`totalPayout ${r.totalPayout} != min(maxWin, basePayout + bonus.totalPayout) = ${exp}`);
  }
  if (r.totalPayout >= CFG.maxWin - 1e-9 && r.capped !== true) bad('payout is at maxWin but capped is not true');
  return e;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [file, slot, mode = 'base'] = process.argv.slice(2);
  if (!file || !slot) { console.error('usage: check-round.js <round.json> <slot> [ante|buy:<key>]'); process.exit(2); }
  const { getEngine } = await import('../engines/index.js');
  const eng = getEngine(slot); let j = JSON.parse(fs.readFileSync(file, 'utf8')); if (j.round) j = j.round;   // accepts a full API response
  const errs = checkRound(j, eng.CFG, { ante: mode === 'ante', buy: mode.startsWith('buy:') ? mode.slice(4) : null });
  console.log(errs.length ? 'INVALID:\n- ' + errs.join('\n- ') : 'OK');
  process.exit(errs.length ? 1 : 0);
}
