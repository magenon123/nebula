# GRUMBLE & BRINE: Deep Salvage. Features & Math (maya)

Slug: `grumble-and-brine`. Companion file: `02-look-sound.md` (leo). Index: `DESIGN.md`.
All money below is in **multiples of the base bet** (the server multiplies by the stake). "bet" = base bet unless it says "total bet".
Numbers in this file were produced by my prototype simulator (`scratchpad/maya/sim.mjs`, seeded, same rules as written here). rin's engine/simulator is the authority; where the engine and this file differ in a rule, tell me and we fix the file, never the other way round silently.

---------------------------------------------------------------------
## 1. Pitch

Captain Barnacle, a grumpy crab in a diving helmet, sifts a seabed junkyard on a **5 x 3, 243-ways** board (no tumbles, no clusters, no meter). Glowing **Lantern Jellies** (wilds) ride the current: whenever a Jelly is on the board it **drifts one reel to the left**, grows **+1** and the rest of the board **respins** for free, again and again until it leaves through reel 1. A Jelly that lands on reel 5 gets four chances to be paid, each time worth more and sitting on a reel that matters more. Three Sonar Buoys start the **Deep Dive** (free dives where the **Tide** rises with every Jelly that leaves the board, so the next Jellies are bigger), with retriggers and a guaranteed Jelly every third dive. High volatility, 96.x% RTP in every mode, max win 7,500x.

What is new compared with EmberClaw: ways instead of clusters, respin chain instead of tumble chain, wild value that grows by *walking* instead of a heat meter, a persistent multiplier (Tide) instead of persistent heat.

---------------------------------------------------------------------
## 2. Grid, symbols, paytable

Board: **5 reels (columns) x 3 rows**. Coordinates in the payload: `r` = row 0..2 (top to bottom), `c` = reel 0..4 (left to right). `grid[r][c]`.

### 2.1 Symbol ids (names/art are leo's; ids are the engine contract)

| id | name | tier | role |
|---|---|---|---|
| 0 | Old Boot | low | pay |
| 1 | Tin Can | low | pay |
| 2 | Message Bottle | low | pay |
| 3 | Rusty Key | low | pay |
| 4 | Brass Compass | mid | pay |
| 5 | Barnacle Anchor | mid | pay |
| 6 | Coin Purse (leo section 14; was Golden Doubloon) | high | pay |
| 7 | Rusty Harpoon | high | pay |
| 8 | Pearl Clam | high (top) | pay |
| 9 | Lantern Jelly | WILD | substitutes for ids 0..8 only; has a value |
| 10 | Sonar Buoy | SCATTER | pays anywhere; never substitutes; blocks ways like any non-matching symbol |

If leo renames a symbol, the **id** stays. Always read names from the engine's `PAYTABLE` export, never retype them.

### 2.2 Paytable (bet multiples **per way**; a win = pay x number of ways, see 3.1)

| id | symbol | 3 of a kind | 4 | 5 |
|---|---|---|---|---|
| 0 | Old Boot | - | 0.12 | 0.35 |
| 1 | Tin Can | - | 0.14 | 0.45 |
| 2 | Message Bottle | 0.04 | 0.14 | 0.41 |
| 3 | Rusty Key | 0.05 | 0.17 | 0.55 |
| 4 | Brass Compass | 0.07 | 0.21 | 0.70 |
| 5 | Barnacle Anchor | 0.10 | 0.35 | 1.10 |
| 6 | Coin Purse | 0.17 | 0.55 | 1.70 |
| 7 | Rusty Harpoon | 0.27 | 1.00 | 3.40 |
| 8 | Pearl Clam | 0.55 | 2.05 | 8.20 |

- The two lowest symbols (Old Boot, Tin Can) pay only from 4 of a kind. This is deliberate: it is what brings the hit frequency from 30% to ~26% (22-28% target) while costing almost no RTP.
- These numbers are final: `payScale` is 1 (no hidden scale; the paytable screen prints exactly these numbers; judge amendment 3). Any RTP tuning is done with the other knobs in section 12, or by editing this table and the paytable screen follows because it is generated from engine data.
- Examples: 5 Pearl Clams with one clam on each reel = 1 way x 8.2 = 8.2x bet. The same with two clams on reel 2 and two on reel 4 = 4 ways x 8.2 = 32.8x.

### 2.3 Scatter pay (Sonar Buoy)

3 Buoys anywhere on the opening grid of a normal base spin = **2x bet**, 4 = **10x**, 5 or more = **50x**. Paid in addition to ways wins and in addition to starting the Deep Dive. Not paid: on the trigger spin of a bought bonus (that spin pays exactly 0), and not paid inside the Deep Dive (Buoys only retrigger there). Buoys never appear during Drift respins.

---------------------------------------------------------------------
## 3. Win evaluation (exact rules)

A **board evaluation** is run on the opening grid and again after every Drift (section 4). All evaluations of a spin are paid and summed.

### 3.1 Ways

For each pay symbol `s` (ids 0..8) independently:
1. For each reel `c = 0..4` compute `count[c] = (number of cells on reel c showing s) + (sum of the values of all Jellies on reel c)`.
2. `n` = the length of the leading run of reels with `count > 0` (`count[0] > 0`, `count[1] > 0`, ... stop at the first reel with 0). A Jelly on reel 0 therefore *can* start a run for every symbol.
3. The symbol pays only if `n >= 3` **and the pay table has a value for that n**, and **at least one real `s` cell exists inside the first `n` reels** (a run made of Jellies only never pays; a Jelly-only run is NOT paid as any symbol).
4. `ways = count[0] x count[1] x ... x count[n-1]` and `payout(s) = pay[s][min(n,5)] x ways` (n is at most 5).

Rules and edge cases:
- **ADD, never multiply, between Jellies.** A Jelly of value v counts as v copies of the symbol on its own reel; two Jellies on the same reel add (values 2 and 3 on one reel = +5 to that reel's count). Counts then multiply across reels exactly like a normal ways game. There is no other multiplier in the game apart from the Tide (which only raises a Jelly's starting value, 5.3).
- Each symbol is evaluated separately and all paying symbols pay in the same evaluation. There is no "highest only". A Jelly counts for every symbol at once (that is its strength).
- Only the **longest** run of a symbol pays (a 5-run pays the 5 value, not 3+4+5).
- A symbol with a run of length 1 or 2 pays nothing. Old Boot / Tin Can with a run of 3 pay nothing (pay table has no 3-value).
- Buoys are plain blockers for ways. A Jelly is never a blocker.
- Jelly value is capped at 25 (`jellyMax`), also after the Tide is added.
- `evaluation payout` = sum of `payout(s)`; the spin total can reach the max-win cap (section 9).

### 3.2 Worked example (hook round, base game)

Opening grid (ids; `J2` = Lantern Jelly value 2), rows top to bottom:

```
 Anchor  Bottle  Compass Boot    Key
 Compass Bottle  Bottle  J2      TinCan
 Bottle  Compass Compass Anchor  Purse
```
Step 0 (opening): Bottle runs over reels 1-4: counts 1,2,1,2 (the Jelly counts 2 on reel 4) = 4 ways x 0.14 = **0.56**. Compass over reels 1-4: counts 1,1,2,2 = 4 ways x 0.21 = **0.84**. Step payout **1.40**. A Jelly is on reel 4 (c=3) so it drifts.

Drift 1: Jelly moves to reel 3 (c=2), value 3. All other 14 cells respin. New board:
```
 Bottle  Compass Anchor  Key     Bottle
 Compass Bottle  J3      Boot    Anchor
 Anchor  Compass Bottle  Purse   Purse
```
Bottle (counts 1,1,4 -> 3 reels): 4 ways x 0.04 = 0.16. Compass (1,2,3): 6 ways x 0.07 = 0.42. Payout **0.58**.

Drift 2: Jelly to reel 2 (c=1), value 4. Respin. Board:
```
 Compass Bottle  Anchor  Anchor  Boot
 Bottle  J4      Compass Bottle  Key
 Anchor  TinCan  Compass Clam    TinCan
```
Compass (1,4,2 -> 3 reels): 8 ways x 0.07 = 0.56. Anchor (1,4,1,1 -> 4 reels): 4 ways x 0.35 = 1.40. Payout **1.96**.

Drift 3: Jelly to reel 1 (c=0), value 5. Respin. Board:
```
 Compass Bottle  Anchor  Anchor  Boot
 J5      Compass Bottle  Bottle  Key
 Anchor  Compass Compass Clam    TinCan
```
Bottle: the Jelly (5) counts on reel 1, reels 2-4 each have one Bottle: counts 5,1,1,1 -> 4 reels: 5 ways x 0.14 = 0.70. Compass: reel 1 = 5 (Jelly) + 0 real... the Compass in row 0 of reel 1 adds 1 = 6, reel 2 has 2, reel 3 has 1: 6 x 2 x 1 = 12 ways x 0.07 = 0.84. Payout **1.54**.
After this evaluation the Jelly is on reel 1: it **leaves the board** (no further respin). Drift chain length 3. Round total = 1.40 + 0.58 + 1.96 + 1.54 = **5.48x**. (The board snippets above are illustrative; payouts were computed with a script using the real pay table.)

---------------------------------------------------------------------
## 4. THE HOOK: Drift

### 4.1 Where Jellies come from
- On the **opening grid** each cell of reels 2-5 independently becomes a Jelly with probability `jellyP[c]` (reel 1 never; see section 11 for numbers). A new Jelly gets a **start value** from `jellyStart`: 1 (60%), 2 (25%), 3 (15%).
- **No Jelly (and no Buoy) ever lands during a Drift respin.** The herd is fixed by the opening grid; this keeps the chain finite and the maths tractable.
- A base spin has a Jelly with probability ~10.8% (1 in 9.2).

### 4.2 The Drift loop (after the opening evaluation, and after each Drift evaluation)
1. If **no Jelly is on the board**, the spin ends.
2. Every Jelly on reel 0 **leaves the board** (they have already been paid on this board). Every other Jelly moves **one reel left** (same row) and its value becomes **+1** (cap `jellyMax` 25).
3. If, after step 2, no Jelly remains (all of them were on reel 0), the spin ends: **no respin**.
4. Otherwise every cell **not** holding a Jelly is **respun** (all 5 reels, including the cell a Jelly just vacated and any cell on reel 5). Jelly cells are held. Respun cells use the normal symbol weights but can only produce pay symbols 0..8 (no Jelly, no Buoy).
5. The new board is evaluated and paid (section 3), even if the payout is 0. Go to step 1.
- A drift does **not** require a win. A Jelly that starts on reel c causes exactly c-1 respins on its own (reel 5: 4 drifts, values v, v+1, v+2, v+3, v+4 on reels 5,4,3,2,1; reel 2: 1 drift). Several Jellies drift together; the chain lasts as long as the Jelly that started furthest right (so at most 4 drifts).
- Safety: `maxDrifts` = 15 (can never be reached, but the loop must be bounded).
- A Jelly that moves onto the same reel as another Jelly simply adds to that reel's count (they never merge, never collide).
- Because values grow as the Jelly moves left, a Jelly is worth most exactly where its reel matters most: a Jelly on reel 1 multiplies the whole way count.

### 4.3 What the player sees
Current Strip above the reels lights the lane of each Jelly; each Drift plays the chevron trail, the `xN` chip grows, the other cells respin, the win is paid, the chain counter `DRIFT x k` bumps. See `02-look-sound.md` section 9.

---------------------------------------------------------------------
## 5. Bonus: DEEP DIVE (free dives)

### 5.1 Trigger and dives
- **3, 4 or 5+ Sonar Buoys** anywhere on a normal base-spin opening grid trigger it: **8 / 10 / 12 dives**. (Scatter pay 2x / 10x / 50x is paid as well.)
- Buoy frequency per cell (base) is `scatterP` = 0.0222: P(3+) = 1 in 245 (E[8-dive trigger]); 4+ = 6.7% of triggers, 5+ = 0.33%.
- Every dive is a normal spin (opening grid + the Drift loop) with the bonus parameters below. Dives do **not** cost a bet. Total dives paid are not limited by the buoy count: retriggers add dives.

### 5.2 Bonus board parameters (same table for natural trigger, Deep Pressure and Dive Ticket)
- Symbol weights: identical to base.
- Buoys: `bonus.scatterP` = 0.045 per cell (denser than base; they only retrigger).
- Jellies: `bonus.jellyP` = [0, 0.0092, 0.0097, 0.0108, 0.0123] (reels 1..5; about 1.6x the base rate); start values as base (1/2/3 at 60/25/15).
- Jelly landing in drifts: none (same as base).
- Buoy pay: none in the dive.

### 5.3 What persists, what escalates
- **TIDE** (0..3, `tideMax`): starts at 0 (Dive Ticket and natural) or 2 (Abyss Pass). When a dive's Drift chain ends, Tide goes up by the number of Jellies that left the board in that dive (cap 3). It never goes down. Tide applies to the **next** dives: on a dive's opening grid, **every Jelly (natural or guaranteed) gets +Tide on its start value** (then the +1 per drift as usual; cap 25).
- **Guaranteed Jelly (guaranteed beat):** on dive 1 and every 3rd dive after it (dives 1, 4, 7, 10, ...) one extra Jelly is placed on a random cell of reel 4 or reel 5 (50/50 reel, uniform row), replacing whatever was there (even a Buoy or a Jelly), with a normal rolled start value. It is placed before the Tide is added and before Buoys are counted for the retrigger. In Abyss Pass this happens on **every** dive.
- **Retrigger:** a dive whose opening grid (after the guaranteed Jelly) has **2 Buoys adds 3 dives; 3 or more adds 6 dives**. Cap: **40 dives** total. Retrigger is evaluated once per dive on the opening grid. Average Deep Dive length is ~16 dives (8-dive start), 19.7 (10), 23.2 (12); 4.6% of 8-dive starts reach the 40-dive limit.
- Escalation = Tide rises (each leaving Jelly makes future Jellies bigger, up to +3) + the guaranteed Jelly keeps the chain alive + retriggers extend the dive.
- The splash text "free dives n" is `bonus.startSpins` and the counter reads `spinsLeft`.
- A mid-bonus cap hit ends the bonus immediately (section 9).

### 5.4 Outcome shape (8-dive start, 1.2M-round sample)
~ 26% of Dive Tickets return over 100x, ~0.6% over 1,000x, ~0.01% (1 in 10,300) hit the 7,500x cap. See 10.2.

---------------------------------------------------------------------
## 6. Bonus Buy and Deep Pressure

All three use **the same Deep Dive** (same bonus table); only the start state or the trigger probability differs. This is how the price stays honest: `price = E[bonus] / 0.962`.

| name (UI) | key | cost | start state | target E[bonus] |
|---|---|---|---|---|
| **Dive Ticket** (standard buy) | `dive` | **100x** bet | the 3-Buoy start: 8 dives, Tide 0 | ~96 x |
| **Abyss Pass** (premium buy) | `abyss` | **500x** bet | 5-Buoy start: **12 dives**, Tide starts at **2** (max stays 3), a guaranteed Jelly on **every** dive, and Jellies land **1.25x** as often in the dives (`bonus.jellyFactor`, premium only: this is the only second bonus table, as the judge allows) | ~481 x |

- A bought round first plays the **trigger spin**: `initialGrid` shows 3 Buoys (Dive Ticket) or 5 Buoys (Abyss Pass) on random cells, **no Jelly, no winning ways, no scatter pay** (rejection-sample non-Buoy cells until the grid has zero ways wins), `cascadeSteps: []`, `basePayout: 0`; then the intro splash. The trigger spin pays 0, so the maths is unchanged.
- Dive Ticket and Abyss Pass cannot be combined with Deep Pressure.

### 6.1 Deep Pressure ("Fever" mode, bet-up)
- **Cost: 2x bet** (the stake shown as total bet), **Deep Dive about 3.3x as likely** (1 in ~75 instead of 1 in 245): the opening-grid Buoy probability is `anteScatterP` = 0.0342 (instead of 0.0222). Nothing else changes: same Jelly rates, same pay table, same bonus (judge rule: ONE bonus).
- RTP algebra (judge's form). Let `Rb` = base-game-only return per bet (56.6%), `S = E_nat / F` = bonus contribution per bet (97.1 / 245 = 39.6%), so the normal RTP is `Rb + S` = 96.2%. In Deep Pressure the player pays `N = 2` per round and gets `Rb' + M x S'`, where `M` is the bonus likelihood multiplier. Break-even at RTP 0.962: `(Rb' + M S') / N = 0.962`, i.e. `M = (N x 0.962 - Rb') / S'`. Plugging in the first-order values (Rb' = Rb = 56.6%, S' = S) gives `M = (1.924 - 0.566) / 0.396 = 3.43`. Two second-order effects: the extra Buoys raise 4/5-Buoy triggers from 6.7% to 10.6% of triggers (so E[bonus] rises 99.8 vs 97.1) and add scatter pay (Rb' = 59.0 per bet instead of 56.6), which reduce the needed M to `(1.924 - 0.590) / (0.396 x 99.8/97.1) = 3.28`. The simulation agrees: `anteScatterP = 0.0342` gives M = 3.3 (1 in 74.7 vs 1 in 244.7) and RTP 96.1% per total bet, measured over 3M rounds. rin tunes `anteScatterP` to land 96.0-96.5% with the decomposition `Rb' + P_ante x E[bonus]`.

---------------------------------------------------------------------
## 7. Modes summary

| mode | request | cost | what changes |
|---|---|---|---|
| Normal | `{}` | 1x | base game |
| Deep Pressure | `{ante:true}` | 2x | `anteScatterP` instead of `scatterP` on the base opening grid |
| Dive Ticket | `{buy:"dive"}` | 100x | trigger spin (3 Buoys) + 8-dive Deep Dive |
| Abyss Pass | `{buy:"abyss"}` | 500x | trigger spin (5 Buoys) + 12-dive Deep Dive, Tide 2, premium jelly table |

---------------------------------------------------------------------
## 8. Volatility and hit-frequency targets

- Hit frequency (round pays > 0, incl. scatter pay): **26% (target band 22-28%)**. Measured split of all rounds: 17.3% win less than the bet (<1x), 6.2% pay 1x-5x, 1.3% pay 5x-10x, 0.84% pay 10x-25x, 0.48% pay 25x-100x, 0.14% pay 100x-999x, 0.003% (1 in ~34,000) pay 1,000x or more.
- Volatility: standard deviation of a round's return ~ 12-16 x bet (heavy tail, 2M-round runs wobble by +-1 RTP point, so the judge's 4 x 2M seed check is required). High volatility.
- Bonus frequency: 1 in 245 natural (1 in ~76 in Deep Pressure).
- Max win: **7,500x** (`CFG.maxWin`). Reached in the simulator about once per 1.3 million normal rounds (see 10.2).

---------------------------------------------------------------------
## 9. Max win and cap behaviour

- `CFG.maxWin = 7500` (x bet). A round's `totalPayout` never exceeds it.
- Accumulate in order: scatter pay, opening evaluation, drifts, then bonus dives in order. As soon as the running total >= `maxWin`, stop: `capped: true`, the current dive is the last played one (its remaining Drift steps are still sent and shown if the cap was reached inside the chain; steps after the cap are not played), `bonus.spins` ends there, `spinsLeft` of the last item is the number of dives that were not played, `bonus.totalPayout = min(maxWin, sum of dive totals)`, `totalPayout = min(maxWin, basePayout + bonus.totalPayout)`.
- The client shows the capped total (`MAX SALVAGE REACHED`), not the raw sum of steps.

---------------------------------------------------------------------
## 10. RTP budget and measured results

### 10.1 Budget (intended split, normal game)

| component | RTP per bet |
|---|---|
| Base-game ways wins incl. Drift chains and Buoy scatter pay | ~56.5% |
| Deep Dive (1 in 245 x E[natural bonus] ~ 98x) | ~40.0% |
| **Total normal** | **96.2-96.5%** |
| Deep Pressure (per 2x total bet): Rb' 29.5 + bonus 66.5 per total bet | ~96% per total bet |
| Dive Ticket: E[8-dive bonus] / 100 | ~96% |
| Abyss Pass: E[12-dive premium bonus] / 500 | ~96% |

The four numbers the judge asked for: **F = 245** (natural trigger 1-in-245), **E8 = 95.7** (Dive Ticket bonus), **E_nat ~ 97-99** (natural average, slightly higher because 4/5-Buoy triggers get 10/12 dives), **M = 3.3** (Deep Pressure at 2x; 1 in 74.7).

### 10.2 Measured (prototype sim, seeded; mean of several 1M-round seeds per mode)

| mode | rounds (seeds x rounds) | RTP per unit staked | decomposition / notes |
|---|---|---|---|
| Normal | 4 x 1M | seeds 98.2, 95.7, 97.1, 97.4: **mean 97.1** (single-seed s.d. ~1.4) | Rb = 56.6% (very stable, 56.1-57.2); bonus 1 in 244.7; E[natural bonus] measured 99.2 (+-2.5), derived from the Dive Ticket sample 97.1; decomposition 56.6 + 97.1/245 = **96.2%**. Hit 26.3%. |
| Deep Pressure (per 2x) | 3 x 1M | 96.2, 94.7, 97.2: **mean 96.1** | Rb' = 29.5 per total bet (59 per bet); bonus 1 in 74.7 (M = 3.3 measured vs normal 244.7); E[bonus] 99.8 (higher because 4-5 Buoy triggers are 10% of triggers). Hit 26.5%. |
| Dive Ticket (per 100x) | 2 x 800k | 95.5, 95.9: **mean 95.7** | E[8-dive bonus] = 95.7x; 25.7% return >= 100x; 0.59% >= 1,000x; cap hit in 1 of ~10,300 tickets. |
| Abyss Pass (per 500x) | 4 x 500k | 96.4, 96.4, 96.4, 96.3: **mean 96.4** | E[bonus] = 481.9x; 84.4% return >= 100x (i.e. >= 20% of the price), 8.9% return >= 1,000x, cap hit in 1 of ~930 passes. Very low spread between seeds because the cap clips the tail. |

Honest reading: the normal-game direct estimate (97.1 +-0.7 over 4M rounds) is about 0.9 above the decomposition (96.2); the decomposition is the better estimate because Rb is precise and E[bonus] comes from 1.6M bonus plays. rin's 4 x 2M run settles it; if the true normal RTP is above 96.5, lower `bonus.jellyP` by ~1% (or raise F by lowering `scatterP` to 0.0220); the Dive Ticket and Abyss Pass move with `bonus.jellyP` too, so re-tune `buy.abyss.jellyFactor` afterwards. The prototype simulator is meant to be within ~1 point; the engine's own simulator is the authority.

Tails (normal game, 4M rounds): P(>= 1,000x) = 29.8 per million (1 in 33,600); 7,500x cap hit 3 times in 4M rounds (1 in 1.3M); Deep Pressure cap hits 4 in 3M. Standard deviation per round: 12-18 x bet (seed dependent).

### 10.3 Notes
- A single 1M run swings by about +-1.5 RTP points (bonus tail); do not trust one seed.
- The caps/tails are intentionally rare; `ge1000` is the number of rounds paying >= 1000x.

---------------------------------------------------------------------
## 11. Round JSON (server -> client). Slot-defined part of CONTRACT v1

Server response: `{round, stake, cost, payout, user}` as in CONTRACT v1. The `round` object below. Money is in bet multiples. Grids are `grid[r][c]` (3 rows x 5 reels), values are symbol ids (section 2.1). Jelly cells hold id 9 and their value is in `jellies`.

```jsonc
{
  "v": 1,
  "cost": 1,                    // 1 | 2 (Deep Pressure) | 100 (dive) | 500 (abyss)
  "ante": false,                // true for Deep Pressure rounds
  "bought": null,               // null | "dive" | "abyss"
  "initialGrid": [[..5 ids..],[..],[..]],   // opening grid of the base spin (for bought: the TRIGGER spin grid)
  "cascadeSteps": [ Step, ... ],// base spin steps: [open, drift1, drift2, ...]; [] for a bought round
  "scatter": { "count": 3, "cells": [[r,c],...], "payout": 2 },   // Buoys on initialGrid; payout 0 on bought rounds
  "basePayout": 3.48,           // scatter.payout + sum(cascadeSteps[].payout); 0 for bought rounds
  "bonusTriggered": true,       // count >= 3 (natural) or bought
  "bonus": null | {
    "startSpins": 8,            // dives awarded by the trigger (8|10|12)
    "startTide": 0,             // 0 normal, 2 for abyss
    "tideMax": 3,
    "totalPayout": 41.2,        // = min(maxWin, sum spins[].totalPayout)
    "spins": [ Dive, ... ]
  },
  "totalPayout": 44.68,         // = min(maxWin, basePayout + bonus.totalPayout)
  "capped": false               // true when maxWin truncated the round
}
```

**Step** (one board evaluation; used in `cascadeSteps[]` and `Dive.steps[]`):

```jsonc
{
  "kind": "open" | "drift",
  "chain": 0,                          // 0 for open, k for the k-th drift
  "grid": [[..5..],[..5..],[..5..]],   // board shown for this evaluation (after the respin for drifts)
  "jellies": [ { "r":1, "c":3, "v":2 } ],   // every Jelly on this board with its value for this evaluation
  "moves": [ { "r":1, "from":4, "to":3, "v":3 } ],  // drift only: Jellies that moved here from the previous step (v = new value)
  "respun": [ [r,c], ... ],            // drift only: the cells that were re-rolled (= all non-Jelly cells)
  "wins": [ { "sym":2, "len":4, "counts":[1,2,1,2], "ways":4, "pay":0.14, "payout":0.56, "cells":[[r,c],...] } ],
  "payout": 1.40,                      // sum of wins[].payout (0 if none)
  "exits": [ { "r":1, "v":5 } ]        // Jellies on reel 0 of this board; they leave after the payout is shown
}
```
`cells` lists every cell that takes part in that win (real symbol cells and Jelly cells inside the first `len` reels) so the client can highlight them; `counts[i]` is reel i's count (real + jelly values).

**Dive** (one bonus spin, in play order):

```jsonc
{
  "spinIndex": 1,                // 1-based
  "spinsLeft": 7,                // dives still to play AFTER this one (includes dives added by this dive's retrigger)
  "retrigger": 3,                // optional: dives added by this dive
  "buoys": 2, "buoyCells": [[r,c],...],   // Buoys on the opening grid (retrigger input)
  "tideBefore": 0, "tideAfter": 1,
  "guaranteed": { "r":2, "c":4 } | null,  // the placed guaranteed Jelly (it is also in the grid as a Jelly)
  "initialGrid": [[..],[..],[..]],        // opening grid after guaranteed Jelly placement
  "steps": [ Step, ... ],        // steps[0] is the opening evaluation (jelly values already include Tide)
  "exited": 1,                   // number of Jellies that left this dive (Tide gain, before the cap)
  "totalPayout": 5.48            // sum of steps[].payout of this dive
}
```
Rules for the client: it plays `cascadeSteps` / `steps` in order and never computes a win. The Tide gauge shows `tideBefore` at the start of the dive and `tideAfter` at its end. A cell's value chip comes from `jellies[].v`.
The bought trigger spin: `initialGrid` with 3 or 5 Buoys, `cascadeSteps: []`, `scatter.count` = 3 or 5, `scatter.payout` = 0, then the splash with `bonus.startSpins`.
`info()`/paytable export: the engine exports `PAYTABLE` = `[{id,name,pays:{"3":x,"4":x,"5":x}}...]` (symbols 0..8, pays `null` where absent), `SCATTER_PAY = {3:2,4:10,5:50}`, `CFG.payScale = 1`.

---------------------------------------------------------------------
## 12. Config knobs (all in `CFG`; defaults are the tuned values)

| knob | default | meaning |
|---|---|---|
| `rows`, `reels` | 3, 5 | fixed |
| `bets` | shell list | allowed stakes |
| `maxWin` | 7500 | cap, x bet |
| `weights` | [11,11,11,11,11,10,10,9,8] | pay symbol weights ids 0..8, base and bonus and drift refills |
| `pay` | table 2.2 | `pay[id] = [p3,p4,p5]` (0 where absent) |
| `payScale` | 1 | must stay 1 (paytable honesty); keep only as a tuning escape hatch, printed by the paytable if it ever differs |
| `scatterP` | 0.0222 | per-cell Buoy probability on the base opening grid |
| `anteScatterP` | 0.0342 | same, Deep Pressure |
| `anteCost` | 2 | Deep Pressure cost |
| `scatterPay` | {3:2,4:10,5:50} | base Buoy pay, bet multiples |
| `jellyP` | [0,0.008,0.009,0.010,0.011] | per-cell Jelly probability by reel, base opening grid |
| `jellyStart` | [[1,60],[2,25],[3,15]] | start value / weight |
| `jellyMax` | 25 | value cap |
| `maxDrifts` | 15 | loop bound |
| `bonus.scatterP` | 0.045 | Buoys per cell in dives |
| `bonus.jellyP` | [0,0.0092,0.0097,0.0108,0.0123] | per-cell Jelly probability by reel in dives |
| `bonus.dives` | {3:8,4:10,5:12} | start dives by Buoy count (5+ = 12) |
| `bonus.retrigger` | {2:3,3:6} | dives added (3 means 3 or more) |
| `bonus.maxDives` | 40 | cap |
| `bonus.tideMax`, `bonus.tideStep` | 3, 1 | Tide cap, Tide per leaving Jelly |
| `bonus.guaranteeEvery` | 3 | guaranteed Jelly on dives 1, 4, 7, ... |
| `bonus.guaranteeReels` | [3,4] | 0-based reels the guaranteed Jelly may land on |
| `buy.dive` | {cost:100, buoys:3, tide:0} | standard buy |
| `buy.abyss` | {cost:500, buoys:5, tide:2, tideMax:3, jellyFactor:1.25, guaranteeEvery:1} | premium buy; `jellyFactor` multiplies `bonus.jellyP` for this buy only |

Tuning order for rin: (1) `anteScatterP` and `buy.abyss.jellyFactor` are the knobs that move Deep Pressure and Abyss Pass without touching the others; (2) `bonus.jellyP` moves E[bonus] (and with it the Dive Ticket, which must stay ~96.2x); (3) `scatterP` moves F; (4) `pay` table for the base share. Re-run the decomposition after every change.

---------------------------------------------------------------------
## 13. Acceptance tests for the maths (what rin's simulator must show)

All with a seeded RNG, >= 2M rounds x 4 seeds per mode, plus the decomposition.
1. **RTP:** normal, Deep Pressure (per total bet), Dive Ticket (per 100x), Abyss Pass (per 500x): each point estimate **96.0-96.5%**, 95% CI upper bound < 97.0%.
2. **Decomposition (normal):** Rb (base game only incl. scatter pay) ~ 56.5% +- 1.5; P(trigger) ~ 1/245; E[natural bonus] from >= 2M bonus plays; Rb + P x E = RTP. Same decomposition for Deep Pressure: M = P_ante / P_normal ~ 3.3.
3. **One bonus:** the dive code path and tables are identical for natural, Deep Pressure and Dive Ticket (assert in the test: same function, same config object); only Abyss Pass overrides `jellyFactor`, `tide`, `guaranteeEvery`.
4. **Dive Ticket:** E[8-dive bonus] in 95.5-97.0x. **Abyss Pass:** E in 475-485x.
5. **Hit frequency (normal):** 22-28% (expect ~26%).
6. **Cap:** observed; no round ever exceeds 7,500x; `capped` true exactly then; report P(>=1000x) (expect ~1 in 34k) and cap hits per 10M rounds (expect ~5-10 normal).
7. **Bounds:** max drifts per spin <= 4; dives <= 40; total steps per round bounded; every number finite.
8. **Round structure:** `tools/check-round.js` on 100k rounds per mode and on live responses; bought rounds have a trigger spin with 3/5 Buoys, no wins, no scatter pay, `cascadeSteps: []`.
9. **Rule tests (unit):** reel-1 Jelly starts runs for every symbol present on reel 2-3 only with a real symbol; Jelly-only run pays 0; two Jellies on one reel add; counts multiply across reels; Old Boot / Tin Can pay nothing for 3; Tide gain = number of Jellies that left; guaranteed Jelly on dives 1,4,7; retrigger 2 -> +3, 3+ -> +6; cap truncation; deterministic replay by seed; a Jelly starting on reel 5 causes 4 drifts and its values are v, v+1, ..., v+4.
10. **Reproducibility:** same seed -> identical rounds.

---------------------------------------------------------------------
## 14. Copy corrections for leo (rules text)
- Info rule 3 must read: "DRIFT: if a Jelly is on the board, every Jelly drifts one reel to the left, grows by 1, and the other symbols respin. Each respin is paid. A Jelly leaves the board after it has been paid on reel 1." (no win required).
- Jelly values ADD within a reel. Tide: "each Jelly that leaves the board raises the Tide (max +3) and new Jellies start bigger".
- Deep Pressure card: "Costs 2x bet. Deep Dives about 3.3x as likely." (numbers from the engine).
- Abyss Pass card: "The premium ticket: 12 dives, the Tide starts at +2, a Jelly on every dive and more Jellies."
- Dive Ticket card: "Skip the sifting: 8 free dives at once."
