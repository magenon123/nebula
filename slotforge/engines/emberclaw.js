/* Adapter: EmberClaw as a registered SlotForge engine.
 * /emberclaw-engine.js stays the single source of truth (not copied, not edited).
 * The wrapper only normalises the round to CONTRACT v1: bought rounds get basePayout:0 and a `capped` flag
 * (the original omits them). It consumes no RNG, so seeded results are identical to the raw engine. */
import * as E from '../../emberclaw-engine.js';

export const id = 'emberclaw';
export const name = 'EmberClaw: Molten Reforge';
export const CFG = E.CFG;                 // same object: sim CFG overrides affect the server too (intended)
export const cryptoRng = E.cryptoRng;
export function playRound(rng, opts) {
  const r = E.playRound(rng, opts);
  if (r.basePayout === undefined) r.basePayout = 0;
  if (r.capped === undefined) r.capped = r.totalPayout >= CFG.maxWin;
  return r;
}
