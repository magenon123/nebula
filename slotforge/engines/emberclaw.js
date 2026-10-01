/* Adapter: EmberClaw as a registered SlotForge engine.
 * /emberclaw-engine.js stays the single source of truth (not copied, not edited).
 * The wrapper only normalises the round to CONTRACT v1: `v:1`, bought rounds get basePayout:0 and a `capped` flag
 * (the original omits them). It consumes no RNG, so seeded results are identical to the raw engine. */
import * as E from '../../emberclaw-engine.js';

export const id = 'emberclaw';
export const name = 'EmberClaw: Molten Reforge';
export const CFG = E.CFG;                 // same object: sim CFG overrides affect the server too (intended)
export const cryptoRng = E.cryptoRng;
export function playRound(rng, opts) {
  const r = E.playRound(rng, opts);
  r.v = 1;
  if (r.basePayout === undefined) r.basePayout = 0;
  if (r.capped === undefined) r.capped = r.totalPayout >= CFG.maxWin;
  return r;
}

/* Everything the info/paytable screen may show, derived from the engine data (GET /api/slot/emberclaw/info).
 * Pays are the REAL ones: PAYTABLE x payScale (cluster-size buckets [5-7, 8-9, 10-12, 13+]); the heat flat bonus is added per cluster. */
export const info = () => ({
  paytableBuckets: ['5-7', '8-9', '10-12', '13+'],
  paytable: E.PAYTABLE.map(row => row.map(v => +(v * CFG.payScale).toFixed(4))),
  heatFlatPerCluster: +(CFG.heatFlat * CFG.payScale).toFixed(4), freeSpins: CFG.freeSpins, retriggerSpins: CFG.retriggerSpins
});
