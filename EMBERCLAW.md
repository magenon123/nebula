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

## Simulated math (seeded, 400k-600k rounds; `CFG.payScale = 1.055` scales every cluster win)
| | RTP | hit freq | bonus 1-in |
|---|---|---|---|
| Base | 93.6-96.2% across two seeds (base game ~76%, bonus ~19-21%) | ~23.7% | ~284 |
| Ante (per 1.25x cost) | ~96.4% | ~23.5% | ~140 |
| Buy 100x | ~66% | - | - |
| Pre-Heated 500x | ~97% | - | - |

The bonus is heavy-tailed, so even 600k-round runs wobble by about +/-2 points; the overall RTP is ~95-96%.
Known gaps vs. the design doc: the bonus share is ~20% rather than 29%, and Buy 100x returns well under the other modes
(Pre-Heated is worth ~8x a standard bonus but priced at 5x, so a richer bonus would make Pre-Heated player-positive).
"Doubled scatter weight" gives ~1-in-45, not 1-in-140; ante uses ~1.3x scatter weight to hit 1-in-140
(the doc also says 1-in-180 in one place).

## Shared slot layout (use for every new slot)
The game lives on a fixed 1600x900 stage that is scaled to fit the window, so positions are identical in every slot.
`emberclaw.html` marks the reusable "SHELL" pieces; keep them exactly here:
- **Bottom bar:** round yellow BUY BONUS button (far left); hamburger menu + balance + win; bet panel with up/down chevrons and a progress bar; big ring-shaped spin button; small autoplay button.
- **Bonus Buy screen:** full-screen row of white cards (title, text, icon, volatility, price, ACTIVATE/BUY) with the bet adjuster on top. Ante / double-chance is a card here. BUY opens a confirm popup.
- **Menu:** sound, turbo, game info (paytable), fullscreen. Bonus intro/outro screens are "tap anywhere to continue".
- **Per-slot art (swap for each new slot):** the scene, logo, frame, symbols (`<symbol id="s0..s8">`), the character on the right, and the side mechanic (here the Forge Core tube on the left).
- **Character:** Brann the dwarf smith. `char('swing' | 'win' | 'big' | 'boom')` plays his reactions; `bonusmode` makes his eyes glow. A new slot gets its own character with the same state names.
- Sounds are synthesised in `makeSfx()` (no audio files). `node build-standalone.py` builds the offline demo.
