#!/usr/bin/env node
/* SlotForge math helpers.
 *   node tools/solve.js scatter <rows> <cols> <k> <oneInN>   per-cell scatter probability p so that P(>=k scatters on rows*cols cells) = 1/oneInN
 *   node tools/solve.js trigger <rows> <cols> <k> <p>        trigger frequency (1-in-N) for a given per-cell p
 *   node tools/solve.js fever <baseRtp%> <bonusRtp%> <m> <c> [targetRtp%=96.25]
 *
 * Fever algebra (all returns in % of ONE base bet). Normal play: RTP = B + R, B = non-bonus return, R = bonus return = T*S
 * (T trigger frequency, S average bonus value in bets). Fever costs c bets per spin and triggers m*T. Per Fever spin
 * the player must get back target*c:   B' + m*T*S' = target*c   =>   m*T*S' = target*c - B'.
 * Assuming B' = B (the ante does not change base wins; the real engine's does a little, so verify by sim):
 *   needed bonus return per Fever spin  R' = target*c - B
 *   per-trigger value factor S'/S       = R' / (m * R)       (>1 means the Fever bonus must be richer than the normal one)
 */
import { fileURLToPath } from 'node:url';

export function pAtLeast(n, k, p) {   // P(X>=k), X~Bin(n,p)
  let below = 0, c = 1;
  for (let i = 0; i < k; i++) { below += c * p ** i * (1 - p) ** (n - i); c = c * (n - i) / (i + 1); }
  return 1 - below;
}
export function solveScatterP(rows, cols, k, oneInN) {   // bisection; P is monotone in p
  const n = rows * cols, target = 1 / oneInN; let lo = 0, hi = 1;
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (pAtLeast(n, k, mid) < target) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
/* All inputs in % of one base bet except m (multiplier of trigger frequency) and c (cost multiple). */
export function fever({ baseRtp, bonusRtp, m, c, target = 96.25 }) {
  const B = baseRtp / 100, Rb = bonusRtp / 100, T = null;
  // choose S = bonus avg value in bets from a trigger frequency supplied separately by caller; here we return the needed
  // bonus RETURN per spin in Fever (R'b = target*c - B) and its ratio to the normal bonus return Rb.
  const needReturn = target / 100 * c - B, ratio = needReturn / Rb;
  // since Fever triggers m times as often, per-trigger value must be scaled by ratio / m.
  return { needBonusReturnPerSpin: needReturn * 100, ratioToNormalBonusReturn: ratio, perTriggerValueFactor: ratio / m,
    note: perTriggerNote(ratio / m) };
}
const perTriggerNote = f => f > 1.001 ? 'Fever bonus must be RICHER per trigger than the normal bonus (' + f.toFixed(2) + 'x)'
  : f < 0.999 ? 'Fever bonus can be LEANER per trigger (' + f.toFixed(2) + 'x of normal)' : 'same bonus table works';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, ...a] = process.argv.slice(2), n = a.map(Number);
  if (cmd === 'scatter') {
    const p = solveScatterP(n[0], n[1], n[2], n[3]);
    console.log(`grid ${n[0]}x${n[1]}, >=${n[2]} scatters, target 1-in-${n[3]}: per-cell p = ${p.toFixed(6)} (check: 1-in-${(1 / pAtLeast(n[0] * n[1], n[2], p)).toFixed(1)})`);
  } else if (cmd === 'trigger') {
    const f = pAtLeast(n[0] * n[1], n[2], n[3]); console.log(`P(>=${n[2]} on ${n[0]}x${n[1]}, p=${n[3]}) = ${f.toExponential(4)} = 1-in-${(1 / f).toFixed(1)}`);
  } else if (cmd === 'fever') {
    const r = fever({ baseRtp: n[0], bonusRtp: n[1], m: n[2], c: n[3], target: n[4] ?? 96.25 });
    console.log(`Fever (cost ${n[3]}x, trigger ${n[2]}x as likely, target ${n[4] ?? 96.25}%):\n  bonus return needed per Fever spin: ${r.needBonusReturnPerSpin.toFixed(2)}% of one bet (normal mode has ${n[1]}%)\n  = ${r.ratioToNormalBonusReturn.toFixed(3)}x the normal bonus return\n  per-trigger bonus value factor vs normal: ${r.perTriggerValueFactor.toFixed(3)}\n  -> ${r.note}\n  (assumes base-game return per spin is unchanged by the ante; verify with sim, scatter weight shifts it.)`);
  } else console.log('usage: solve.js scatter|trigger|fever ... (see file header)');
}
