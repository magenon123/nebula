# GRUMBLE & BRINE: Deep Salvage. Design index (slug `grumble-and-brine`)

**One-line concept:** 5x3, 243-ways slot. Glowing **Lantern Jellies** (wilds) *drift* one reel left per free respin, growing +1 each step, until they leave through reel 1. Sonar Buoys start the **Deep Dive** (free dives, rising **Tide**). Captain Barnacle, a grumpy crab in a diving helmet, scolds the reels. 96.x% RTP in every mode, high volatility, max win 7,500x.

| doc | owner | contents |
|---|---|---|
| [`01-features-math.md`](01-features-math.md) | maya | rules (ways, Jelly values ADD, Drift loop), paytable, Deep Dive, buys, Deep Pressure, RTP algebra + measured table, round JSON (section 11), config knobs (12), acceptance tests (13) |
| [`02-look-sound.md`](02-look-sound.md) | leo | look, symbols, Captain Barnacle states, scene, shell skin, Current Strip + Tide Gauge, sound recipes, copy (section 14 overrides conflicts; `reviews/02-round1.md` + `OWNER-PREFS.md` override look details) |
| `../../reviews/01-acceptance.md` | judge | the 38 acceptance checks |
| `../../engines/ENGINE-API.md` | rin | engine contract (CONTRACT v1) |

## Names (shared vocabulary)
Game: Grumble & Brine: Deep Salvage. Wild = **Lantern Jelly** (id 9, has a value). Scatter = **Sonar Buoy** (id 10). Free respin = **Drift**. Bonus = **Deep Dive** ("free dives"). Persistent multiplier = **Tide** (0..3). Bet-up = **Deep Pressure** (2x, bonus ~3.3x likelier, 1 in ~75). Buys = **Dive Ticket** (`dive`, 100x) / **Abyss Pass** (`abyss`, 500x). Big-win tiers: Bubble 5x / Barnacle 10x / Salvage 25x / Kraken 100x. Pay symbols s0..s8: Old Boot, Tin Can, Message Bottle, Rusty Key, Brass Compass, Barnacle Anchor, Coin Purse, Rusty Harpoon, Pearl Clam.

## Rules in five lines
1. 243 ways left to right, 3+ of a kind (Old Boot / Tin Can need 4+). A Jelly of value v counts as v copies of the symbol on its reel; counts add inside a reel and multiply across reels.
2. While a Jelly is on the board it drifts one reel left (+1 value), all other cells respin, every board is paid; it leaves after being paid on reel 1. No win needed; max 4 drifts per spin; no new Jellies during drifts.
3. 3/4/5 Buoys: 2x/10x/50x and 8/10/12 dives. Dive: guaranteed Jelly every 3rd dive, Tide +1 per leaving Jelly (max 3, new Jellies start bigger), 2 Buoys +3 dives, 3+ Buoys +6, cap 40 dives.
4. Same Deep Dive in every mode. Abyss Pass only: 12 dives, Tide starts at 2, a Jelly every dive, 1.25x Jellies.
5. Cap 7,500x.

## BUILD ORDER (checklist)

### rin (engine / tools)
- [ ] 1. `engines/grumble-and-brine.js` (one self-contained ES file, `playRound(rng,{ante,buy})`): symbol draw, Jelly draw, ways evaluation (`01` section 3), Drift loop (section 4), scatter pay, Deep Dive (section 5), buys (section 6), cap (section 9). Export `PAYTABLE`, `SCATTER_PAY`, `CFG` (knob table section 12).
- [ ] 2. Emit the round JSON exactly as section 11 (grid[r][c], `jellies`, `moves`, `respun`, `wins`, `exits`; Dive objects; trigger spin for buys). Pass `tools/check-round.js`.
- [ ] 3. Unit tests (section 13 item 9) + seeded determinism.
- [ ] 4. Register in `engines/index.js`; add the sim mode names (`standard`, `ante`, `dive`, `abyss`).
- [ ] 5. Sim: 4 seeds x 2M rounds per mode + decomposition (Rb, F, E8, E_nat, M, P(>=1000x), cap hits per 10M, sd). Tune `anteScatterP`, `bonus.jellyP`, `buy.abyss.jellyFactor`, `scatterP` to 96.0-96.5% per mode.
- [ ] 6. Route/settlement tests (judge B list). Report the real numbers to maya to refresh section 10.2.

### kai (front end)
- [ ] 1. `slots/grumble-and-brine/slot.json` (bets, `anteCost` 2, buys `dive` 100 / `abyss` 500, `maxWin` 7500, copy strings from leo's section 11/13); `build-standalone.py grumble-and-brine` asserts equality with the engine CFG.
- [ ] 2. Board 5x3 (cells, frame, Current Strip, reel spin/stop), static scene layers (per OWNER-PREFS: painted backdrop, no ambient bubbles, no halftone).
- [ ] 3. Symbols s0..s10 as `<symbol>` (leo's art), Jelly value chip overlay (`jellies[].v`).
- [ ] 4. `playSpin` hook: play `cascadeSteps` (open, then each drift: chevron trail, hold Jelly cells, respin the others, highlight `wins[].cells`, count up, `exits` leave). Budget: <= 0.7 s per drift (<= 0.35 s turbo).
- [ ] 5. Deep Dive: splash (`startSpins`), counter "DIVE n OF N" from `spinIndex` + `spinsLeft`, `+N DIVES` from `retrigger`, Tide Gauge from `tideBefore`/`tideAfter`, outro with `bonus.totalPayout`.
- [ ] 6. Bonus Buy screen: Deep Pressure (2x), Dive Ticket, Abyss Pass (confirm popup); bought trigger spin shows 3 / 5 Buoys then the splash; Abyss text says "Tide +2, Jelly every dive".
- [ ] 7. Paytable/info screens generated from `PAYTABLE`, `SCATTER_PAY`, `CFG` (Old Boot / Tin Can: no 3-of-kind value).
- [ ] 8. Character states idle/spin/win/big/special + `bonusmode`; sounds per leo section 10/13; offline build; 4-viewport and scripted playthrough checks.

### leo (look/sound; fixes pending from the judge)
- [ ] Info rule 3 + card texts per `01` section 14; retrigger text (2 Buoys +3, 3+ Buoys +6); Deep Pressure "about 3.3x as likely"; section 13 "retrigger" line.
