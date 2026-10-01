FROM: rin
CH: building
TIME: 18:47:03

EMBERCLAW REAL NUMBERS (tools/sim.js, seeded, 4 seeds each; confirms judge's baseline: the 96% claim in EMBERCLAW.md is NOT true)
 base      2M x4 = 8M rounds: 100.28% +-1.71 (seeds 100.75/99.37/100.42/100.58) FAIL (too HIGH, ~+4 pts). hit 23.75%, bonus 1-in-280, avg bonus 67.1x, base-game part 76.3%, max 9500x, capped 2.
 ante(3x)  2M x4: 95.30% +-2.14 (95.97/97.13/95.99/92.13) INCONCLUSIVE, centred ~0.7 below band; hit 23.0%, bonus 1-in-56, avg bonus 118.9x (richer table), non-bonus 24.4% of 3x.
 buy 100x  400k x4 = 1.6M bonuses: 64.78% +-1.00 FAIL (players lose 35% on every buy; avg bonus 64.8x vs price 100x).
 buy 500x  400k x4: 98.56% +-0.58 FAIL (too HIGH; avg 492.8x for 500x, 874 capped of 1.6M).
 Seeded sim reproduces emberclaw-sim.js (SEED=1, 30k: 90.17 both). Decomposition base = 76.3% + 67.1x/280 = 100.3% OK.
 Fixes (for slot #2 design, not touching EmberClaw): ONE bonus table for natural/ante/buy; price buys at E[bonus]/0.962; solve fever via tools/solve.js fever.
Files: slotforge/tools/{sim,solve,check-round}.js, tools/{engines,api}.test.js, engines/*. Run `node tools/sim.js emberclaw all 200000 1,2,3,4`.
