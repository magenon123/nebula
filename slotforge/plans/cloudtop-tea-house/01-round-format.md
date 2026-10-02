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
