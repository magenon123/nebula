# Koji's Cloudtop Tea House: round JSON (for kai) and measured math

Engine: `engines/cloudtop-tea-house.js` (id `cloudtop-tea-house`). Request: `{stake}` for a normal spin, `{stake, buy:"tin"}` for the Bonus Buy. No ante, no luck.
The server multiplies every money field by the stake. All numbers below are in multiples of the base bet. Grid cells are `grid[row][col]`, rows 0..3 top to bottom, cols 0..4.

Symbol ids: `0` Dango, `1` Onigiri, `2` Paper Fan, `3` Paper Lantern, `4` Plum Blossom, `5` Iron Teapot, `6` Lucky Cat, `7` Golden Koi, `8` Smiling Kite (WILD, only lands on reels 2-4 = cols 1..3), `9` Furoshiki Bundle, `10` Tea Tin.
`GET /api/slot/cloudtop-tea-house/info` (engine `info()`) returns `lines` (30 x 5 row indexes, `lines[l][col]` = row), `paytable` (3/4/5-of-a-kind pays per symbol, already final), jackpots and grand bonus. Never retype pays in the client.

## Top level (CONTRACT v1)
| field | meaning |
|---|---|
| `v` | 1 |
| `cost` | 1 (spin) or 60 (buy) |
| `bought` | `null` or `"tin"` |
| `initialGrid` | 4x5 grid as it LANDS: bundles (9) and tins (10) still shown. For a bought round this is the visible trigger spin |
| `cascadeSteps` | base spin only: exactly ONE step (below). `[]` for a bought round (trigger spin pays nothing) |
| `tins` | `{count, cells:[[r,c],...]}` the tins on the opening grid (>= 6 = bonus) |
| `basePayout` | line wins of the base spin (0 for a bought round) |
| `bonusTriggered` | true if `tins.count >= 6` (always true for a buy) |
| `bonus` | `null` or `{startSpins:3, totalPayout, spins:[...]}` |
| `totalPayout` | `min(5000, basePayout + bonus.totalPayout)` |
| `capped` | true when the 5,000x cap cut the round |

### cascadeSteps[0] (base spin)
`{grid, bundle, wins, payout}`
- `grid`: the grid AFTER the bundle flip (identical to `initialGrid` when there is no bundle). Tins stay tins.
- `bundle`: `null` or `{cells:[[r,c],...], flipTo}`: ALL bundle cells become the single symbol `flipTo` (0..7, never wild or tin). Animate: knot wobbles, unties, reveals `flipTo`.
- `wins`: `[{line, sym, len, mult, payout, cells:[[r,c]...]}]`, `line` = index into `lines`, `len` 3..5, `cells` = the winning cells left to right (render the paper string through them). A wild in `cells` has `grid[r][c] == 8`. `payout == mult`.
- `payout`: sum of `wins[].payout` (= `basePayout` unless capped).
Line evaluation runs on `cascadeSteps[0].grid`. Tea Tins are blanks (they break lines).

### bonus.spins[i] (Tin Rush; one item per step)
`spins[0]` is the LOCK step (`kind:"lock"`): the trigger tins get their values / types (the tins already sit on screen from the trigger spin; reveal the value flipping up one by one in `newTins` order, row-major). `spins[1..]` are the respins (`kind:"respin"`).

```
{ spinIndex,        // 1-based, in order (lock = 1)
  kind,             // "lock" | "respin"
  spinsLeft,        // respins left AFTER this step (3 after the lock; 3 again after a step with new tins; else previous - 1; 0 on the last step; 0 on a full board)
  reset,            // true when new tins landed in this respin (counter back to 3). Always false for the lock
  newTins: [ {r, c, kind, value, collected?} ],   // in row-major order; empty = a blank respin (counter drops)
  kite:    [ {row, before:[5 values], after:[5 values], gain} ],   // rows completed in THIS step, top to bottom: Kite Launch
  grand:   null | {bonus:500, cells:20},          // board full: Grand Dragon Kite
  boardTotal,       // sum of all tin values on the board after this step (after kite doubling), WITHOUT the grand bonus
  totalPayout }     // this step's increase of (boardTotal + grand bonus); the sum over spins is the whole bonus (bonus.totalPayout = min(5000 - base, sum))
```
Tin `kind`: `"value"` (plain cash tin, `value` 1..40), `"collector"` (brass kettle), `"mini"` (10), `"minor"` (25), `"major"` (250). `value` is the value AT LANDING (before this step's Kite Launch).
- **Collector**: `value = 2 + collected`, `collected` = the sum of all tin values that were on the board when it landed (tins of the same step placed earlier in row-major order count, later ones do not; the Kite doubling of the same step is not yet applied). Animate the kettle sucking the shown values in, then its own number.
- **Kite Launch**: when a row is complete at the end of a step, every tin in that row doubles ONCE (`before[c]` -> `after[c]`, columns left to right; includes jackpot tins and collectors). The client replays the step as: new tins land (values), then the row gate sweep and kite, then the numbers double. If two rows complete in the same step they are listed top to bottom.
- **Grand**: `grand != null` only on the last step; `totalPayout` of that step already includes `grand.bonus` (500).
- A step with `newTins: []` is a plain "no tin" respin: counter 3 -> 2 -> 1 -> 0 ends the bonus.
- When the 5,000x cap is reached the step that crosses it is the last step. `bonus.totalPayout` and `totalPayout` are clamped; the displayed running total in the client should clamp to the same value (`capped:true` then gets the MAX WIN screen).
- Max steps: 1 lock + 60 respins.

## Buy
`{stake, buy:"tin"}`: `initialGrid` shows 6 or more tins (count conditioned on the natural trigger distribution, 6 most often), no bundles, no wilds, no line win; `cascadeSteps: []`, `basePayout: 0`, `tins.cells` = the tin cells; then straight to the Tin Rush intro and `bonus.spins`. Price 60x.

## Example (real engine output, seed 108835, shortened only by the cell lists)
```json
{"v":1,"cost":1,"bought":null,
 "initialGrid":[[3,2,10,7,0],[0,4,7,9,10],[4,1,4,1,10],[10,5,10,7,10]],
 "cascadeSteps":[{"grid":[[3,2,10,7,0],[0,4,7,7,10],[4,1,4,1,10],[10,5,10,7,10]],
   "bundle":{"cells":[[1,3]],"flipTo":7},
   "wins":[{"line":24,"sym":4,"len":3,"mult":0.9,"payout":0.9,"cells":[[2,0],[1,1],[2,2]]}],"payout":0.9}],
 "tins":{"count":6,"cells":[[0,2],[1,4],[2,4],[3,0],[3,2],[3,4]]},
 "basePayout":0.9,"bonusTriggered":true,
 "bonus":{"startSpins":3,"totalPayout":46,"spins":[
  {"spinIndex":1,"kind":"lock","spinsLeft":3,"reset":false,
   "newTins":[{"r":0,"c":2,"kind":"minor","value":25},{"r":1,"c":4,"kind":"value","value":1},{"r":2,"c":4,"kind":"value","value":8},
              {"r":3,"c":0,"kind":"value","value":1},{"r":3,"c":2,"kind":"value","value":1},{"r":3,"c":4,"kind":"value","value":1}],
   "kite":[],"grand":null,"boardTotal":37,"totalPayout":37},
  {"spinIndex":2,"kind":"respin","spinsLeft":3,"reset":true,"newTins":[{"r":0,"c":1,"kind":"value","value":1}],"kite":[],"grand":null,"boardTotal":38,"totalPayout":1},
  {"spinIndex":3,"kind":"respin","spinsLeft":2,"reset":false,"newTins":[],"kite":[],"grand":null,"boardTotal":38,"totalPayout":0},
  ...,
  {"spinIndex":6,"kind":"respin","spinsLeft":3,"reset":true,
   "newTins":[{"r":1,"c":0,"kind":"value","value":1},{"r":3,"c":1,"kind":"value","value":1}],
   "kite":[{"row":3,"before":[1,1,1,1,1],"after":[2,2,2,2,2],"gain":5}],"grand":null,"boardTotal":46,"totalPayout":7},
  {"spinIndex":9,"kind":"respin","spinsLeft":0,"reset":false,"newTins":[],"kite":[],"grand":null,"boardTotal":46,"totalPayout":0}]},
 "totalPayout":46.9,"capped":false}
```
(Spins 4, 5, 7, 8 omitted in this printout; the real round has all nine.) Client reading order for a base round: land `initialGrid` -> tease if 4-5 tins -> bundle flip -> line wins (strings) -> `basePayout` count-up -> if `bonusTriggered`: intro splash, `spins[0]` lock reveal, respins.

## Rules in one place (for the info screen; derive numbers from `info()`)
30 fixed lines, 3-5 of a kind left to right, wild on reels 2-4 substitutes pay symbols, highest win per line, lines added. Bundles flip together. 6+ Tea Tins start Tin Rush: 3 respins, each new tin resets to 3; empty cell becomes a tin with probability 7.32% per respin; Collector kettle, Mini 10x / Minor 25x / Major 250x tins; a finished row = Kite Launch (row x2 once); 20 tins = Grand Dragon Kite +500x. Max win 5,000x.

## Measured math
See the section at the end (filled after the final sims).

### Results (engine sim, `node tools/sim.js cloudtop-tea-house <mode> <rounds> 1,2,3,4`, sfc32 RNG)
| mode | rounds | RTP | 95% CI | per seed |
|---|---|---|---|---|
| base (cost 1x) | 4 x 25M = 100M | **96.24%** | +-0.20 | 96.04 / 96.25 / 96.15 / 96.52 |
| buy:tin (cost 60x) | 4 x 4M = 16M | **96.22%** | +-0.07 | 96.13 / 96.19 / 96.29 / 96.28 |

Decomposition (base): line wins incl. bundles (base-game RTP) **57.0%**; trigger (>= 6 tins) **1 in 148**; average bonus **57.9x** (buy start is the same distribution: 57.7x measured in the buy sim; E[buy] / 60 = 96.2%); bonus share of return **40.7%**; hit rate **25.27%**; P(bonus >= 1000x) about **1.8e-4 per bonus** (1 in ~5,500 buys, ~1 in 820k base spins); 5,000x cap reached about once per 1.7M bonuses (4 cap hits in 16M buys, 0 in 100M base spins); largest base-sim win 3,745x; best observed line win 184x.
Pay table: pays were scaled up from the concept sketch (x8.85) because with 30 lines and a 25% hit rate the 3-of-a-kind pays of 0.04 would give only a 6% base RTP. Symbol weights are flat (10 each on 8 pay symbols, wild 1 on reels 2-4, bundle 3, tin 9% per cell) to keep the hit rate at 25%.
Tooling note: `tools/sim.js` now seeds with sfc32 instead of mulberry32. Mulberry has a 2^32 period, and a buy sim uses > 1G draws per seed, so seeds overlapped (identical max wins across seeds, RTP too tight). Older sims of the other slots are statistically unaffected but the exact numbers will differ from their recorded ones.

---

# Round 7 additions: FREE SPINS, SUPER FREE SPINS, three buys (for kai)

Spec: `02-new-bonuses.md` (maya). Everything above (Tin Rush, its JSON, the 60x buy) is UNCHANGED. Differences vs the spec doc, decided by rin: the FS scatter id is **16** (not 11; 11 is the Collector kettle art); FS/Super use the normal `bonus` field (CONTRACT v1 needs it) with `bonus.type`, there is no separate `fsBonus`; `retrigger` on a spin is the plain integer of added spins (contract), not an object. Request: `{stake}` or `{stake, buy:"tin"|"fs"|"super"}`. Prices: **tin 60x, fs 21x, super 75x** (read `CFG.buy` / `info().buy`, never retype).

## New / changed top-level fields (every round)
| field | meaning |
|---|---|
| `bonusType` | `null` (no bonus), `"tin"`, `"fs"` or `"super"`. Use this to choose the intro/bonus screen. `bonusTriggered` is true for all three. |
| `fsScatter` | `{count, cells:[[r,c]...], suppressed}`: FS scatters (id 16) on `initialGrid`. `count` 2 = tease (slow last reel), 3 = FREE SPINS, 4 = SUPER, 5 = SUPER with 16 spins. `suppressed` = 0 normally; if 3+ FS landed together with 6+ tins on the same spin (priority rule: **Tin Rush wins**) the FS cells were already turned into ordinary symbols in `initialGrid`: then `count` 0, `cells []`, `suppressed` = how many FS there would have been (the client just plays Tin Rush; it never sees a dead FS). 1-2 FS next to 6+ tins stay on the grid as a plain tease. |
| `tins` | unchanged (`count 0` on fs/super buys) |
| `cost` | 1 / 60 / 21 / 75 |
| `bought` | `null`, `"tin"`, `"fs"`, `"super"` |

Symbol `16` = FS scatter (plaque with the letters FS). It pays nothing, is a blank for lines, the wild does not substitute it, a bundle never flips into it. It can land on all 5 reels. In `info()`: `fsScatter: 16`.

## Triggers
- Exactly 3 FS on the opening grid: **FREE SPINS**, 10 spins. Exactly 4: **SUPER FREE SPINS**, 12 spins. 5 or more: SUPER with **16** spins.
- Natural rates (fsP 0.018 per cell): 3 FS about 1 in 204 spins, 4 FS about 1 in 2,680, 5+ FS about 1 in 41,000. Base line wins of the trigger spin are paid as usual (`basePayout`), then the bonus.
- Bought rounds: **FS buy** = visible no-win trigger spin with exactly 3 FS, **SUPER buy** = 4 FS (about 94% of buys) or 5 FS (about 6%, then 16 spins). No tins, no bundles, no wilds, no line win on the buy trigger spin, `cascadeSteps: []`, `basePayout 0`, `fsScatter.cells` = the FS cells (other cells are plain symbols).

## `bonus` for fs / super
```
bonus: { type: "fs"|"super", startSpins,          // 10 | 12 | 16
         preSteep: [ {r,c,level} ],               // Super only: 4 drawers Koji pre-warms at level 2 (empty array for fs)
         extraSpinsTotal,                          // sum of all retriggers
         maxLevel, boost: [..],                    // level table of this bonus (copy of info().fsBonus[type]); boost[level] = extra multiplier points
         totalPayout,                              // min(5000 - basePayout, sum of spins)
         spins: [ ... ] }
```
Level tables (read from `info().fsBonus`): FREE SPINS max level 3, `boost [0,1,2,4]`. SUPER max level 4, `boost [0,1,3,5,8]` (level 4 = gold). Retrigger tables: FS `{3:+4, 4:+7, 5:+10}`, Super `{3:+5, 4:+8, 5:+12}`; max total spins 40 / 50.

### `bonus.spins[i]`
```
{ spinIndex,            // 1-based
  spinsLeft,            // spins left AFTER this one, retrigger already added; 0 on the last spin (also 0 on the cap spin)
  landed,               // 4x5 grid as it lands: bundles (9) and FS (16) visible
  grid,                 // after the bundle flip (== landed when bundle is null). Lines are evaluated on this grid. No tins ever.
  bundle,               // null | {cells:[[r,c]..], flipTo}  (same as the base spin)
  wins: [ {line, sym, len, mult, boost, payout, cells:[[r,c]..]} ],
                        // mult = plain pay of the line (paytable x payScale), boost = SUM of boost[level] of the drawers in `cells` (wild cells included, levels as they were BEFORE this spin), payout = mult * (1 + boost). Show the chip "x(1+boost)" at the end of the string.
  levels,               // 4x5 drawer levels BEFORE this spin (use these to draw the tags/colours while the string runs)
  levelUps: [ {r,c,from,to,popKite} ],   // AFTER paying: every drawer that took part in at least one win goes up exactly 1 level (once per spin, capped at maxLevel). popKite true when it reached maxLevel (kite flies into the sky). The next spin's `levels` = levels + levelUps.
  fsCount, fsCells,     // FS scatters on this spin's grid (3+ = retrigger)
  retrigger?,           // present only when added: integer = spins added (contract field). Levels are kept; a retrigger never upgrades FREE SPINS to SUPER
  payout,               // sum of wins[].payout (uncapped)
  totalPayout,          // payout clamped to the remaining cap (== payout unless the cap spin)
  runningTotal }        // bonus total so far (never above 5000 - basePayout)
```
Order for the client: land `landed` -> bundle flip -> win strings with the x chips (`wins`) -> count `totalPayout` -> pour (`levelUps`) -> if `retrigger`: +N flies into the counter -> next spin. FS plaques on a bonus board only count for the retrigger (they never pay). On the 5,000x cap the crossing spin is the last one (`capped:true`, `spinsLeft 0`).

## Real examples (engine output, shortened)
Natural FREE SPINS (seed 671, mulberry): 3 FS landed with 3 tins and 2 bundles; the base line pays 0.37575, bonus 6.26 in 10 spins. Top level (bonus without spins listed):
```json
{"v":1,"cost":1,"bought":null,"bonusType":"fs",
 "initialGrid":[[10,1,10,16,10],[0,1,9,0,5],[2,9,0,16,2],[0,16,5,6,5]],
 "cascadeSteps":[{"grid":[[10,1,10,16,10],[0,1,2,0,5],[2,2,0,16,2],[0,16,5,6,5]],"bundle":{"cells":[[1,2],[2,1]],"flipTo":2},
   "wins":[{"line":12,"sym":2,"len":3,"mult":0.37575,"payout":0.37575,"cells":[[2,0],[2,1],[1,2]]}],"payout":0.37575}],
 "tins":{"count":3,"cells":[[0,0],[0,2],[0,4]]},"fsScatter":{"count":3,"cells":[[0,3],[2,3],[3,1]],"suppressed":0},
 "basePayout":0.37575,"bonusTriggered":true,"totalPayout":6.638249999999999,"capped":false,
 "bonus":{"type":"fs","startSpins":10,"preSteep":[],"extraSpinsTotal":0,"maxLevel":3,"boost":[0,1,2,4],"totalPayout":6.2625,"spins":[ ... 10 items ... ]}}
```
`bonus.spins[0]` and `[1]` of the same round: spin 1 wins 0.7515 on line 13 and three drawers go up; spin 2 has one FS (no retrigger) and no win:
```json
{"spinIndex":1,"spinsLeft":9,"landed":[[3,5,4,1,6],[4,4,1,0,6],[2,1,7,3,3],[3,7,0,0,5]],"grid":[[3,5,4,1,6],[4,4,1,0,6],[2,1,7,3,3],[3,7,0,0,5]],"bundle":null,
 "wins":[{"line":13,"sym":4,"len":3,"mult":0.7515,"boost":0,"payout":0.7515,"cells":[[1,0],[1,1],[0,2]]}],
 "levels":[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
 "levelUps":[{"r":0,"c":2,"from":0,"to":1,"popKite":false},{"r":1,"c":0,"from":0,"to":1,"popKite":false},{"r":1,"c":1,"from":0,"to":1,"popKite":false}],
 "fsCount":0,"fsCells":[],"payout":0.7515,"totalPayout":0.7515,"runningTotal":0.7515}
{"spinIndex":2,"spinsLeft":8,"landed":[[7,4,16,3,7],[2,2,1,6,6],[5,0,4,4,5],[0,6,4,4,6]],"grid":[[7,4,16,3,7],[2,2,1,6,6],[5,0,4,4,5],[0,6,4,4,6]],"bundle":null,"wins":[],
 "levels":[[0,0,1,0,0],[1,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],"levelUps":[],"fsCount":1,"fsCells":[[0,2]],"payout":0,"totalPayout":0,"runningTotal":0.7515}
```
SUPER buy (seed 82, mulberry): trigger spin shows 4 FS and nothing else special, 4 pre-warmed drawers, 17 spins played (12 + 5 retrigger), 231.5x total.
```json
{"v":1,"cost":75,"bought":"super","bonusType":"super",
 "initialGrid":[[2,7,3,2,5],[3,7,4,6,1],[16,16,5,16,3],[6,16,0,1,7]],"cascadeSteps":[],"tins":{"count":0,"cells":[]},
 "fsScatter":{"count":4,"cells":[[2,0],[2,1],[2,3],[3,1]],"suppressed":0},"basePayout":0,"bonusTriggered":true,"totalPayout":231.462,"capped":false,
 "bonus":{"type":"super","startSpins":12,"preSteep":[{"r":1,"c":1,"level":2},{"r":1,"c":2,"level":2},{"r":2,"c":0,"level":2},{"r":3,"c":3,"level":2}],
          "extraSpinsTotal":5,"maxLevel":4,"boost":[0,1,3,5,8],"totalPayout":231.462,"spins":[ ... 17 items ... ]}}
```
Its spin 1 (a drawer at level 2 is on the winning line: boost 3, so the 0.29225 line pays x4) and its spin 8 (two lines through steeped drawers, a drawer reaches gold level 4 and pops its kite, 3 FS retrigger +5 spins):
```json
{"spinIndex":1,"spinsLeft":11,"landed":[[5,5,16,6,5],[2,1,4,5,0],[1,1,5,0,0],[2,7,1,1,0]],"grid":[[5,5,16,6,5],[2,1,4,5,0],[1,1,5,0,0],[2,7,1,1,0]],"bundle":null,
 "wins":[{"line":10,"sym":1,"len":3,"mult":0.29225,"boost":3,"payout":1.169,"cells":[[2,0],[2,1],[3,2]]}],
 "levels":[[0,0,0,0,0],[0,2,2,0,0],[2,0,0,0,0],[0,0,0,2,0]],
 "levelUps":[{"r":2,"c":0,"from":2,"to":3,"popKite":false},{"r":2,"c":1,"from":0,"to":1,"popKite":false},{"r":3,"c":2,"from":0,"to":1,"popKite":false}],
 "fsCount":1,"fsCells":[[0,2]],"payout":1.169,"totalPayout":1.169,"runningTotal":1.169}
{"spinIndex":8,"spinsLeft":9,"landed":[[5,0,9,3,3],[2,16,8,16,4],[16,2,8,7,5],[0,6,0,5,5]],"grid":[[5,0,4,3,3],[2,16,8,16,4],[16,2,8,7,5],[0,6,0,5,5]],"bundle":{"cells":[[0,2]],"flipTo":4},
 "wins":[{"line":15,"sym":2,"len":3,"mult":0.37575,"boost":8,"payout":3.38175,"cells":[[1,0],[2,1],[2,2]]},{"line":21,"sym":2,"len":3,"mult":0.37575,"boost":11,"payout":4.509,"cells":[[1,0],[2,1],[1,2]]}],
 "levels":[[0,3,3,1,0],[3,2,2,0,0],[3,2,0,0,0],[1,0,2,2,0]],
 "levelUps":[{"r":1,"c":0,"from":3,"to":4,"popKite":true},{"r":1,"c":2,"from":2,"to":3,"popKite":false},{"r":2,"c":1,"from":2,"to":3,"popKite":false},{"r":2,"c":2,"from":0,"to":1,"popKite":false}],
 "fsCount":3,"fsCells":[[1,1],[1,3],[2,0]],"retrigger":5,"payout":7.89075,"totalPayout":7.89075,"runningTotal":40.70625}
```
(Note drawer (1,0) sits on both winning lines but rises only one level, 3 -> 4.)

## Rules for the info screen (numbers from `info()`)
FS plaque scatters: 3 = FREE SPINS (10 spins), 4 = SUPER FREE SPINS (12 spins, 4 drawers pre-steeped), 5 = SUPER with 16 spins. In the bonuses every drawer that helps a win gets steeped one level darker; a later win through steeped drawers pays x(1 + sum of the drawers' boosts). 3/4/5 FS inside a bonus add spins. Tea Tins do not appear inside these bonuses. Max win 5,000x.

## Round 7 measured math (engine sims, `node tools/cloudtop-decomp.js <mode> <rounds/seed> 11,12,13,14`, sfc32, 4 seeds)
Final knobs: `payScale 0.835` (was 1; base lines re-balanced), `fsP 0.018`, `fsPBonus 0.026`, FS wild weight 1.9, Super wild weight 2.86 (reels 2-4, bundle weight 3 in both), boosts FS `[0,1,2,4]`, Super `[0,1,3,5,8]` (spec start was `[0,1,3,6,10]`: cut to keep P(>=1000x | Super) under 1e-3), Super pre-warm 4 drawers at level 2, Tin Rush untouched (same coinP, q, weights, functions). Prices: **tin 60x, fs 21x, super 75x**.

| mode | rounds | RTP | 95% CI | per seed |
|---|---|---|---|---|
| base | 4 x 25M = 100M | **96.39%** | +-0.17 | 96.55 / 96.46 / 96.18 / 96.35 |
| buy:tin (60x) | 4 x 4M = 16M | **96.20%** | +-0.06 | 96.23 / 96.18 / 96.21 / 96.17 |
| buy:fs (21x) | 4 x 5M = 20M | **96.19%** | +-0.07 | 96.13 / 96.14 / 96.26 / 96.24 |
| buy:super (75x) | 4 x 5M = 20M | **96.39%** | +-0.07 | 96.37 / 96.45 / 96.44 / 96.30 |
(CI = max of round-level and seed-to-seed estimate. The base CI half-width 0.17 is wider than the band slack: base point estimate is 96.39 and the decomposition below (sum of independently measured parts, tighter) gives 96.37.)

Base decomposition (100M spins; % of bet): line wins incl. bundles **44.48** (was 57.05 before the new bonuses; hit rate **24.06%**, avg line win per hit 1.85x) + Tin Rush **39.10** + FREE SPINS **9.83** + SUPER **2.97** = 96.38. (The old note "57.0 + 40.7 = 97.7" was a unit slip: 40.7 is the bonus share of the RETURN, 39.1 % of the bet.)

| bonus | trigger (spins) | E[bonus] | share of bet RTP | median | P(<1x) | P(<5x) | P(>=100x) | P(>=1000x) | cap hits | max seen |
|---|---|---|---|---|---|---|---|---|---|---|
| Tin Rush | 1 in 147 | 57.64x (buy: 57.72x) | 39.10% | ~42x | 0% | 0% | 8.93% | 0.0200% | 0 / 100M spins, 4 / 16M buys | 5000x |
| FREE SPINS | 1 in 205 (3 FS) | 20.17x (buy: 20.20x) | 9.83% | ~11x | 6.0% | 26.9% | 2.20% | 0.0012% | 0 | 2138x |
| SUPER | 1 in 2,468 (4 FS: 1 in 2,618; 5+ FS: 1 in 42,900) | 73.40x (buy: 72.29x) | 2.97% | ~44x | 1.0% | 5.4% | 21.2% | 0.093-0.11% | 0 / 100M spins, 1 / 20M buys | 5000x (buy) |

- FREE SPINS: avg 10.67 spins played, 13.6% retrigger at least once (avg +0.67 spins), final drawer levels L0 56% / L1 26% / L2 12% / L3 6%, avg boost on a winning line 1.66.
- SUPER: avg 13.24 spins (16-spin 5 FS tier included), 16.1% retrigger, final levels L0 39% / L1 20% / L2 22% / L3 11% / L4 (gold) 8.6%, avg boost per winning line 5.3.
- Whole-game tail: P(round >= 1000x) **1 in 535k spins** (187 in 100M; before: 1 in 820k, limit 1 in ~500k); cap 5,000x reached 0 times in 100M base spins; largest base-sim win 3,642x. Buys: P(>=1000x) tin 1 in 5,500, fs 1 in 93,000, super 1 in 1,080 (cap hit once in 20M super buys).
- Trigger rates: P(3 FS) 1 in 205, P(4 FS) 1 in 2,618, P(5+ FS) 1 in 42,900, 2 FS tease 1 in 23 spins. Tin priority rule fired 1,478 times in 100M spins (1 in 68k; Tin Rush shown, the FS cells were rewritten).
- Buy E / price: fs 20.20 / 21 = 96.2%, super 72.29 / 75 = 96.4%, tin 57.72 / 60 = 96.2%.
- Tools: `tools/cloudtop-decomp.js` (this table), `tools/cloudtop-meta.js` (regenerates `engines/cloudtop-tea-house.meta.json`), tests `tools/cloudtop.test.js` (25 tests).
