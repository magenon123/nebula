# 00 — Baseline review: EmberClaw: Molten Reforge

Judge, round 1. Everything below was run, not read: Playwright playthrough of `emberclaw-standalone.html`
(4 base spins, a bought 100x bonus with trigger spin / intro / outro, Forge Fever, 10-spin turbo autoplay,
info, bet picker, phone portrait + landscape), engine read, and seeded sims of every mode.
Screenshots: `/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/shots/`.

## Sim evidence (`node emberclaw-sim.js N mode`, SEED as listed)

| mode | rounds x seeds | RTP per seed | notes |
|---|---|---|---|
| base (standard) | 300k x 3 (1,2,3) | 95.33 / 99.07 / 98.04 | base-game part 75.5-76.8, hit 23.6-23.8%, bonus 1 in 274-293 |
| base (standard) | 1M x 2 (11,12) | **102.21 / 99.20** | base-game part 76.4-76.6, bonus 1 in 273 |
| Forge Fever (3x) | 300k x 3 | 93.31 / 89.96 / 95.47 | bonus 1 in 56, avg ante bonus 113-120x |
| Forge Fever (3x) | 1M x 2 | 94.96 / 94.28 | 5 cap hits in 2M |
| Buy 100x | 60k x 3 | **64.32 / 62.50 / 67.27** | the bought bonus IS the natural bonus |
| Pre-Heated 500x | 60k x 3 | 99.76 / 96.18 / **100.00** | |

Decomposition (low-noise estimate, since the bought standard bonus is exactly the natural bonus):
base RTP = base-game part 76.5% + E[bonus] 64.7x / 273 = 76.5 + 23.7 = **~100.2%** (+/-0.4).
EMBERCLAW.md says "93.6-96.2% / overall ~95-96%": that is **wrong**; it came from lucky short seeds.

## Scores (0-5)

| # | criterion | score | evidence |
|---|---|---|---|
| 1 | Novelty & fun | 3 | Heat Core + reforged wilds is a real hook, but 6x5 cluster-tumble is a crowded genre; the bonus can be flat (bought $100 bonus paid $7.12, heat stalled at 4 by spin 5). |
| 2 | Math soundness | **1** | Base ~100% (player-even), Buy 100x ~64%, Pre-Heated ~96-100%, Fever ~94-95%: a 36-point spread between modes; docs claim numbers the sim refutes. Hit rate 23.8% and cap 9,500x are fine. |
| 3 | Server authority & security | 3 | All outcomes server-side, bet list validated, conditional debit. But credit is a second write (non-atomic), the old route accepted `buy:"toString"` (engine played a full bonus with cost=undefined), `!!ante` treats `"false"` as true, rakeback uses a flat 4% edge even for ~99% modes. |
| 4 | Shell compliance | 4 | It is the reference layout and it works at 16:9. At 844x390 the logo is clipped ("EMBE"); modals are not stage-scaled (bet picker overflows on 390x844); the character's anvil sits under the spin button. |
| 5 | Look | 4 | Genuinely hand-inked: wobble filters, hatch, painted volcano, Brann reads well. Weak: 5 of 7 pay symbols are grey/silver (shard, chain, hammer head, tongs, blade); subtitle bottoms are clipped in the offline render ("MOLTFN RFFORGE"; may be the fallback font, check with the real font); Brann barely moves at idle. |
| 6 | Sound & feel | 3 | Rich synthesised SFX + ambience in code (not audible headless, so code-verified only). Shake/embers/count-ups exist. Every spin first empties the board (~1 s of black board), bonus spins feel slow. |
| 7 | Completeness & polish | 3 | Every feature works, no JS errors (only the offline font cert), standalone is byte-identical to a rebuild. But paytable shows unscaled values while the engine pays x1.055 plus flat heat bonuses, info text runs past the panel fold, docs state wrong RTP. |

**Average 3.0. Under our own rubric EmberClaw would NOT ship** (needs >= 4). It is the bar for look and shell, not for math.

## Most important weaknesses (ranked)

1. **Base game RTP ~100%** (1M-round seeds 99.2% and 102.2%; decomposition 100.2%). The house has no edge on the main mode.
2. **Buy modes are inconsistent**: Buy 100x returns ~64% (a bad deal), Pre-Heated 500x returns ~96-100% (reached 100.00% on one seed). Rational players only buy Pre-Heated; with Diamond rakeback (0.8% of stake) Pre-Heated is player-positive.
3. **Ante has its own richer bonus table** (`anteBonusWeights`): the Fever bonus is worth ~117x vs ~65x for the same feature in base. Two bonuses to tune, two to verify, and still 94-95% (under target).
4. **Evidence method was too weak**: 400-600k rounds with stdDev ~22-70x gives +/-2-4 points; the doc reported the lucky seed. A sim must report a confidence interval and use decomposition (base part + trigger rate x E[bonus] from bonus-only runs).
5. **Paytable lies**: info shows 3x/8x/20x/50x etc. but `payScale 1.055` and flat heat bonuses change the paid amounts. Client constants (PT, BETS, ANTE_COST) are duplicated by hand.
6. **Settlement not atomic**: debit and credit are two writes; a failure between them eats the stake without a bet row.
7. **Input validation holes** in the original route (`buy` prototype keys, loose `ante`). Fixed/being fixed in rin's generic route; must stay fixed.
8. **Layout only correct at 16:9 desktop**: clipped logo on wide phones, modals overflow on portrait.
9. **Symbol readability**: too many grey-metal symbols; at a glance shard/chain/tongs/blade blur together on the dark board.
10. **Pacing**: board empties to black before every spin and every free spin; bonus feels long relative to what it pays.

## Lessons slot #2 MUST apply

- ONE bonus definition. Natural trigger, bet-up mode and buys all play the same bonus (buys may only change the start state for the premium buy). Price buys from E[bonus]: `price = E[B]/0.962`.
- Bet-up math by algebra first: `M = 1 + (N-1) * RTP / S` (S = bonus return per base bet). No separate richer tables.
- Evidence = decomposition + CI, several seeds; no single-seed numbers in docs. Docs must quote the sim command and output.
- Paytable/info generated from engine data. No hand-copied numbers in the client.
- Atomic settlement in one statement; strict input types.
- Test the layout at 1600x900, 1280x720, 844x390 and 390x844 (modals included).
- Symbol set needs distinct hue AND silhouette per symbol; max two symbols sharing a dominant colour.
- Keep the board populated between spins (drop old symbols out while new fall in); no black-board gap.
