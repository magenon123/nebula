# Arctic Aurora Lodge: round JSON for the client (engine `engines/arctic-aurora-lodge.js`, CONTRACT v1)

Everything is in multiples of the base bet. The client reads NO money from anywhere else. Grid = 5 rows x 6 reels, always `grid[row][col]`, row 0 on top, col 0 on the left.
Symbol ids: 0 Antler Knife, 1 Iron Kettle, 2 Wool Mittens, 3 Snow Goggles, 4 Compass, 5 Lantern, 6 Silver Fox, 7 Polar Owl (low to high), **8 Aurora Gem**, **9 Aurora Orb (wild)**, **10 FS scatter**. `engine.SYMBOLS` has the names. Pay symbols are 0..7 only.

## Giant blocks
`blocks: [{ id, sym, r, c, size }]` : a block is a **2x2 or 3x3** of one pay symbol; `(r,c)` is its TOP-LEFT cell, it covers rows r..r+size-1, cols c..c+size-1. Blocks never overlap and always lie fully inside the grid. The `grid` cells under a block all hold the block's `sym`: the client draws ONE big symbol per block and skips those cells. Blocks never hold wild/scatter/gem. Area: single cell 1, 2x2 = 4, 3x3 = 9 (lit symbol in the Free Spins: x2 = 8 / 18).

## Win (one evaluation per spin, no refill, no cascade)
A symbol wins when its total AREA anywhere on the grid is >= 8 (tiers 8-9, 10-11, 12-14, 15-19, 20+). In Free Spins the **lit** symbol wins from 5 (tier 0 = "5-7").
```
win = { sym, count (area incl. wilds, lit doubling applied), tier (0..5), mult, payout, lit:bool,
        cells:[[r,c]...]   // EVERY cell to highlight: block cells, singles and joined wilds (cells.length == count unless lit doubled blocks)
        blocks:[blockId..], // ids of the blocks that belong to this win (play the block win motion)
        wilds:[[r,c]..] }   // wilds that joined this symbol (all wilds go to the ONE best symbol)
```
Several symbols can win in one spin; `payout` of the step = sum. `mult == payout`.

## Base / ante round
```json
{ "v":1, "cost":1, "ante":false, "bought":null, "bonusType":null,           // bonusType: null | "fs" | "sweep"
  "initialGrid":[[4,1,3,0,5,2],[5,1,5,2,3,9],[0,3,2,2,2,7],[4,5,2,2,2,2],[1,1,2,2,2,6]],
  "initialBlocks":[{"id":0,"sym":2,"r":2,"c":2,"size":3}],
  "cascadeSteps":[{ "grid":[...same as initialGrid], "blocks":[...same as initialBlocks], "payout":3.72,
     "wins":[{"sym":2,"count":13,"tier":3,"mult":3.72,"payout":3.72,"lit":false,
              "cells":[[2,2],[2,3],[2,4],[3,2],[3,3],[3,4],[4,2],[4,3],[4,4],[0,5],[1,3],[3,5],[1,5]],"blocks":[0],"wilds":[[1,5]]}] }],
  "scatters":{ "fs":{"count":0,"cells":[],"suppressed":0}, "gems":{"count":0,"cells":[]} },
  "wilds":[[1,5]], "basePayout":3.72, "bonusTriggered":false, "bonus":null, "totalPayout":3.72, "capped":false }
```
- `cascadeSteps` has exactly ONE step for a normal spin (kept as an array for the contract). `ante:true` -> `cost` = 2 (Northern Lights).
- Trigger: `scatters.gems.count >= 4` -> `bonusType:"sweep"`; else `scatters.fs.count >= 3` -> `"fs"`. If both (never in practice) the sweep wins and `fs.suppressed` > 0 (those cells are already plain symbols in `initialGrid`).
- The base win pays AND the bonus pays; `totalPayout = min(7500, basePayout + bonus.totalPayout)`; `capped:true` when the cap truncated.
- Client order: drop grid (blocks fall in as one piece) -> win highlight (block win motion, links over `cells`) -> if `bonusType`, bonus intro splash.

## Bought round (`bought:"fs"` cost 80, or `"sweep"` cost 55)
`initialGrid` + `initialBlocks` = the visible TRIGGER SPIN (a block layout that pays nothing), `trigger:{type,count,cells}` lists the scatters (fs: id 10, sweep: id 8) that land on it, `cascadeSteps:[]`, `basePayout:0`, then the intro splash.
```json
{ "v":1, "cost":80, "bought":"fs", "bonusType":"fs", "initialGrid":[[2,3,4,3,0,6],[10,0,6,7,3,0],[2,7,10,3,6,3],[6,10,3,4,4,7],[4,7,3,4,4,2]],
  "initialBlocks":[{"id":0,"sym":4,"r":3,"c":3,"size":2}], "trigger":{"type":"fs","count":3,"cells":[[1,0],[2,2],[3,1]]},
  "cascadeSteps":[], "basePayout":0, "bonusTriggered":true, "bonus":{ ... }, "totalPayout":79.794, "capped":false }
```

## Free Spins "Aurora Muse" (`bonus.kind:"fs"`)
`bonus = { kind:"fs", startSpins:10|12|15, scatters:3|4|5, totalPayout, spins:[...] }` (3 FS = 10 spins, 4 FS = 12, 5 = 15). One entry per spin:
```json
{ "spinIndex":1, "spinsLeft":9, "lit":0,                       // `lit` = symbol the aurora lights THIS spin: announce it BEFORE the grid drops
  "grid":[[0,2,9,2,7,7],[2,2,1,1,1,4],[2,2,1,1,1,5],[2,2,1,1,1,6],[7,7,10,6,1,0]],
  "blocks":[{"id":0,"sym":1,"r":1,"c":2,"size":3},{"id":1,"sym":2,"r":2,"c":0,"size":2}],
  "scatters":{"count":1,"cells":[[4,2]]}, "wilds":[[0,2]],
  "wins":[{"sym":1,"count":11,"tier":2,"mult":1.209,"payout":1.209,"lit":false,"cells":[...],"blocks":[0],"wilds":[[0,2]]}, {"sym":2, ...}],
  "uncappedPayout":1.767, "totalPayout":1.767 }
```
- Lit symbol: wins from **5 cells**, its blocks count **double** (`win.lit:true`, `count` already doubled; tier 0 pays the "5-7" row). Highlight the lit symbol's cells with the aurora glow all spin.
- 3+ FS on a bonus spin: `retrigger:5` on that entry (+5 spins; `spinsLeft` already includes them). Max 40 spins. No gems appear in the bonus.
- `totalPayout` of an entry = the money to add this spin (the last one is trimmed if the cap is reached, then `spinsLeft:0`; `uncappedPayout` is for the tease only).
Retrigger example entry: `{"spinIndex":2,"spinsLeft":13,"lit":7, ..., "scatters":{"count":3,"cells":[[0,5],[1,5],[4,4]]}, "retrigger":5, "totalPayout":4.65}`.

## Aurora Sweep (`bonus.kind:"sweep"`)
`bonus = { kind:"sweep", startSpins:N, gems:G, sheet:[5][5], bands:[bandId..], totalPayout, spins:[...] }`, N = min(8, G) bands (one bonus step per band). Fixed screen: a 5x5 ice sheet.
`sheet[r][c] = { kind:"cash"|"empty", value, prism:bool }` (the full hidden table, shown after the last band as the "missed" reveal; `prism` is a cash cell: +1 to its crossing count).
`bands` = distinct band ids in play order; the 16 bands are `engine.BANDS[id] = {type:"row"|"col"|"diag"|"anti", index, cells:[[r,c]x4-5]}`: rows 0-4, cols 0-4, long diagonal and anti-diagonal, and four short diagonals.
```json
{ "spinIndex":2, "spinsLeft":3,
  "band":{"type":"col","index":1,"id":6,"cells":[[0,1],[1,1],[2,1],[3,1],[4,1]]},
  "newlyMelted":[[0,1],[1,1],[2,1],[4,1]],              // cells whose ice breaks for the first time
  "crossed":[{"r":0,"c":1,"value":1,"prism":false,"crossings":1,"multiplier":1}, ...],   // cash cells under this band, with their count AFTER this band
  "runningTotal":21, "uncappedDelta":8, "totalPayout":8 }   // totalPayout = money added by this band
```
A cell pays `value x multiplier` where `multiplier = crossings + (prism ? 1 : 0)`; a cell reached again by a later band re-prices (the increase is in that band's `totalPayout`). Empty cells show nothing. `crossings >= 2` is the "bands converge" moment (loud chime, number flip). Sum of `totalPayout` = `bonus.totalPayout`.
Example (5 gems, bought): bands [3,6,8,11,0] -> steps 13, 8, 16, 8, 17 = 62x.

## Misc
- Cash values: 1,2,3,5,8,12,20,40,100,250,500. Pays come from `engine.info().pay` (rows per symbol 0..7, columns tiers 8-9..20+; tier 0 = `pay[s][0] * litLow`). Never retype them.
- `capped:true` at 7,500x (gold MAX WIN screen).
- Engine/slot.json must agree: `bets` = CFG.bets, `anteCost` 2, buys `fs` 80 and `sweep` 55, `maxWin` 7500. The luck mode is the standard `ante` flag (`cfg.anteCost`), labelled "Northern Lights" in the slot module; no MAX LUCK.
