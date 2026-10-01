# EmberClaw: Molten Reforge

Server-authoritative cluster-pays slot (6x5, tumbles, Forge Core heat meter).

- `emberclaw-engine.js` – pure game engine (all RNG + payout resolution). `CFG` holds every tunable.
- `POST /api/emberclaw/spin` (auth) `{stake, ante?, buy?: "standard"|"preheated"}` → `{round, cost, payout, user}`.
  `round` = `{initialGrid, cascadeSteps:[{clusters, clearedCells, payout, newCells, coreHeat, reforgeEvents, wilds, grid}], totalPayout, bonusTriggered, freeSpinsAwarded, bonus:{spins:[...same shape...]}}`.
  Payouts are multiples of the base bet; the whole bonus is resolved and settled in a single request.
- `emberclaw.html` – pure renderer (also embedded in the lobby as a slot).
- `node emberclaw-sim.js [rounds] [standard|ante|buy|preheated]` – RTP / hit-rate simulator (`SEED`, `CFG` env overrides).

## Rules as implemented
- Clusters: 5+ orthogonally adjacent; Wilds join every cluster they touch. Multiple wilds in a cluster add their multipliers.
- Wilds are sticky for the spin sequence; cleared non-wild cells are refilled in place.
- Heat: +1 per winning step, +1 extra per cluster containing a Wild. 3 = flat bonus per cluster, 6 = reforge a random low symbol to Wild, 9 = detonation (all Wilds x2 + one more reforge). Reforge and detonation each fire at most once per spin sequence.
- Bonus: 10 spins, heat carries between spins (spins open pre-armed: heat>=6 opens with a reforge, >=9 also a detonation), flat bonus stacks per 3 heat, every 3rd spin opens with a guaranteed detonation, 2+ scatters retrigger +4. Bonus uses its own symbol weights.
- Cap 9,500x. Ante = 1.25x cost with higher scatter weight. Buy 100x / 500x (heat starts at 6).

## Simulated math (seeded, 400k–600k rounds)
| | RTP | hit freq | bonus 1-in |
|---|---|---|---|
| Base | ~91% (base game ~72%, bonus ~21%) | ~23.7% | ~284 |
| Ante (per 1.25x cost) | ~91% | ~23.5% | ~140 |
| Buy 100x | ~63% | – | – |
| Pre-Heated 500x | ~92% | – | – |

Known gaps vs. the design doc: RTP is ~5 points under the 96.2% target and the bonus share is ~21% rather than 29%.
The doc's constraints pull against each other (Pre-Heated is worth ~8x a standard bonus but is priced at 5x, so raising bonus strength to hit 29% makes Pre-Heated player-positive). Also, "doubled scatter weight" gives ~1-in-45, not 1-in-140; ante uses a ~1.3x scatter weight to hit 1-in-140 (the doc also says 1-in-180 in one place).
