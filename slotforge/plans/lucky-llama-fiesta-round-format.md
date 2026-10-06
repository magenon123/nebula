# Lucky Llama Fiesta: round JSON format (engine `lucky-llama-fiesta`, CONTRACT v1)

Audience: kai (client) and leo (art). The server has decided everything; the client only PLAYS BACK the timeline. All money = multiples of the TOTAL bet (server scales by stake). Cells are `{reel,row}` with reel 0..4 (left to right) and row 0..2 (top to bottom). Line numbers are 1-based. The client derives no money.

## 1. Round (top level)
```
{ v:1, game:"lucky-llama-fiesta", mode:"base"|"ante"|"buy", bought:null|"parade"|"link"|"party", ante:bool,
  cost,                       // 1 | CFG.anteCost (2) | CFG.buy[key].cost
  spin: Spin,                 // the BASE spin (or, for a buy, the TRIGGER spin: pays 0, no line win)
  initialGrid: Grid,          // == spin.grid (contract field)
  cascadeSteps:[{payout}],    // base: [{payout: basePayout, lines:n}]; [] for buys
  basePayout,                 // spin.linePayout (0 for buys)
  bonusTriggered:bool, bonus: null | ParadeBonus | LinkBonus,
  totalPayout,                // min(maxWin 7500, basePayout + bonus.totalPayout)
  capped:bool }
```
`Grid` = 5 columns x 3 rows of symbol codes, `grid[reel][row]`. Codes: `MAR` Marigold, `MAC` Maracas, `CHI` Chili, `GUI` Guitar, `TAC` Taco, `SKU` Sugar Skull, `SOM` Sombrero, `MAS` Luchador Mask, `TRU` Trumpet, `LUC` Don Lucho, `WLD` Poncho wild, `SCA` Fiesta Drum, `MON` money piñata (its value is in `spin.money`, never in the grid).

## 2. Spin (base spin, trigger spin, free spin)
```
Spin = { reelStops:[i0..i4],          // stop index on CFG strips (info().strips[profile][reel]); rows shown = strip[i], strip[i+1], strip[i+2] (wraps)
         strip:"base"|"ante"|"parade",
         grid:Grid,                    // final visible 5x3 (in a free spin sticky wilds are already painted in)
         wins:[{line, symbol, count, pay, cells:[{reel,row}..]}],   // 3..5 adjacent from reel 0, highest per line, wild substitutes (not SCA/MON)
         linePayout,                   // sum of wins[].pay (x bet, before the ladder multiplier)
         wilds:[{reel,row,sticky,new}],// every WLD on the grid; base: sticky:false; parade: sticky:true, new = landed this spin
         scatters:[{reel,row}],        // SCA cells (max one per reel)
         money:[{reel,row,value,jackpot}], // every MON cell; value in x bet; jackpot null | "MINI"|"MINOR"|"MAJOR"|"GRAND" (value is then 20|50|250|2000)
         tease:[b,b,b,b,b], teaseKind:null|"scatter"|"money",  // tease[r]=true: reel r stops SLOWLY (2 drums on reels 1-3 -> later reels; 4 or 5 piñatas on earlier reels -> later reels)
         totalPayout }                 // base/trigger spin: == linePayout (piñatas pay nothing outside Link/Parade)
```
Base spin never pays for piñatas by themselves. Piñata values shown in the base game are the values they carry into Link if it starts.

## 3. PIÑATA LINK (6+ piñatas on one spin, or bought)
```
LinkBonus = { type:"link", trigger:"spin"|"buy", startSpins:3,        // respin counter starts at 3
              start:[{reel,row,value,jackpot}],                         // the frozen piñatas of the trigger spin
              spins:[ Respin.. ],                                       // one per respin, in order
              cracks:[{order,reel,row,value,jackpot,running}],          // final crack order = left to right, top to bottom; running = total so far
              fullBoard:bool, jackpots:["MINI",..], grandAwarded:bool,  // fullBoard (15) -> GRAND + all values
              pinatas:n, total,                                         // total = sum(cracks values) + (fullBoard ? 2000 : 0)
              totalPayout }                                             // min(maxWin, total)
Respin = { spinIndex, respinsBefore, landed:[{reel,row,value,jackpot}], filled,   // filled = piñatas on board after this respin
           spinsLeft,                                                   // after this respin: 3 if something landed (RESET), else respinsBefore-1; 0 when full board
           totalPayout }                                                // 0 for all respins except the LAST one, which carries the whole Link total (the cracks pay it)
```
Rules: piñatas freeze; each respin every EMPTY cell lands a piñata with probability `CFG.link.p`; any new piñata resets the counter to 3; Link ends at 0 or at 15 piñatas. Jackpot piñatas pay MINI 20 / MINOR 50 / MAJOR 250 / GRAND 2000 x bet. Full board = GRAND 2000x extra plus all values. If a spin has BOTH 3+ drums and 6+ piñatas, PARADE starts and the piñatas of that spin are just shown (no Link).

## 4. PONCHO PARADE (3/4/5 drums = 8/12/20 spins; bought `parade`, or `party` = 3 sticky ponchos at the start)
```
ParadeBonus = { type:"parade", trigger:"spin"|"buy", drums:3|4|5, startSpins:8|12|20,
                startSticky:[{reel,row}],       // [] normally, 3 cells for the buy `party`
                spins:[ FreeSpin.. ], retriggers:n, capped:bool, totalPayout }
FreeSpin = Spin + { spinIndex, spinsLeft, retrigger?:3,          // 3 drums inside the bonus = +3 spins (retrigger:3)
                    stickyWilds:[{reel,row}], wildCount, ladderStep:0..6, multiplier:1..10,
                    grab:{ values:[{reel,row,value,jackpot}], total },   // Collector Don Lucho
                    totalPayout }                                         // = linePayout * multiplier + grab.total
```
Parade line wins use `CFG.parade.paytable` (smaller than the base `CFG.paytable`, because the ladder multiplies them); show it as a second paytable page in the info screen. Ladder (by wildCount, applied to ALL line wins of the spin, wilds that landed this spin already counted): 0 wild = x1 (step 0), 1 = x1 (step 1), 2 = x2, 3-4 = x3, 5-6 = x5, 7-9 = x8, 10+ = x10 (step 6). Every WLD that lands sticks for the rest of the bonus (painted into `grid` on every later spin). Piñatas inside Parade NEVER start Link: after the line wins, the Collector Don Lucho grabs EVERY piñata visible on that spin (left to right, instant, flying coins), `grab.total` is NOT multiplied by the ladder. Jackpot piñatas count with their value (a GRAND grab pays 2000x). A piñata or drum hidden under a sticky wild does not exist (painted over). The bonus is capped at 60 spins total and stops at the spin that reaches the cap (`capped:true`, `spinsLeft` may be > 0).

## 5. Buys (hanging sign, cards; names/costs in `CFG.buy`, NO price on the sign)
- `parade` (Poncho Parade): trigger spin shows 3 (usually), 4 or 5 drums (`drums`), no line win, no Link; then ParadeBonus.
- `link` (Piñata Link): trigger spin shows exactly 6 piñatas with values, no line win, no drums; then LinkBonus.
- `party` (Party Pack): like `parade`, plus `startSticky` 3 ponchos already on the board (ladder x3 from spin 1).
Bought rounds: `bought:key`, `basePayout:0`, `cascadeSteps:[]`, `spin.totalPayout:0`, `spin.wins:[]`.

## 6. Ante (FIESTA LUCK, cost 2)
`mode:"ante"`, `ante:true`, `spin.strip:"ante"` (strips with more drums and piñatas); the bonuses are identical to base. NO MAX LUCK: `luck` throws "unsupported".

## 7. Worked examples
Real engine output (compact JSON, one object per line), produced with `tools/sim.js`' rng (`sfc32`) from the shipped engine. Money in x total bet. Parade/Link example numbers are exact outputs, nothing is edited.

### A. Plain line win (base spin, no bonus): line 14 = 3x MAR pays 0.4, line 17 = 3x TAC pays 0.8; the poncho substitutes (WLD in the TAC line) and is NOT sticky in the base game
round header (everything except `spin`/`initialGrid`/`bonus`):
{"v":1,"game":"lucky-llama-fiesta","mode":"base","bought":null,"ante":false,"cost":1,"initialGrid":"== spin.grid","cascadeSteps":[{"payout":1.2,"lines":2}],"basePayout":1.2,"bonusTriggered":false,"totalPayout":1.2,"capped":false}
spin:
{"reelStops":[99,71,122,74,20],"strip":"base","grid":[["MAR","TAC","CHI"],["TAC","WLD","CHI"],["MAR","MON","TAC"],["WLD","SCA","CHI"],["WLD","GUI","MON"]],"wins":[{"line":14,"symbol":"MAR","count":3,"pay":0.4,"cells":[{"reel":0,"row":0},{"reel":1,"row":1},{"reel":2,"row":0}]},{"line":17,"symbol":"TAC","count":3,"pay":0.8,"cells":[{"reel":0,"row":1},{"reel":1,"row":1},{"reel":2,"row":2}]}],"linePayout":1.2,"wilds":[{"reel":1,"row":1,"sticky":false,"new":false},{"reel":3,"row":0,"sticky":false,"new":false},{"reel":4,"row":0,"sticky":false,"new":false}],"scatters":[{"reel":3,"row":1}],"money":[{"reel":2,"row":1,"value":2,"jackpot":null},{"reel":4,"row":2,"value":5,"jackpot":null}],"tease":[false,false,false,false,false],"teaseKind":null,"totalPayout":1.2}
### B. PINATA LINK round (started by 6 piñatas on a base spin; base spin also paid its lines)
round header:
{"v":1,"game":"lucky-llama-fiesta","mode":"base","bought":null,"ante":false,"cost":1,"initialGrid":"== spin.grid","cascadeSteps":[{"payout":0.8,"lines":1}],"basePayout":0.8,"bonusTriggered":true,"totalPayout":60.8,"capped":false}
spin (trigger spin, piñata values/jackpots in `money`; teaseKind=null):
{"reelStops":[69,103,129,131,0],"strip":"base","grid":[["MAC","TAC","SOM"],["TAC","MAR","MON"],["TAC","MON","MAR"],["MON","GUI","MAR"],["MON","MON","MON"]],"wins":[{"line":9,"symbol":"TAC","count":3,"pay":0.8,"cells":[{"reel":0,"row":1},{"reel":1,"row":0},{"reel":2,"row":0}]}],"linePayout":0.8,"wilds":[],"scatters":[],"money":[{"reel":1,"row":2,"value":2,"jackpot":null},{"reel":2,"row":1,"value":3,"jackpot":null},{"reel":3,"row":0,"value":20,"jackpot":"MINI"},{"reel":4,"row":0,"value":15,"jackpot":null},{"reel":4,"row":1,"value":2,"jackpot":null},{"reel":4,"row":2,"value":5,"jackpot":null}],"tease":[false,false,false,false,false],"teaseKind":null,"totalPayout":0.8}
bonus header:
{"type":"link","trigger":"spin","startSpins":3,"start":[{"reel":1,"row":2,"value":2,"jackpot":null},{"reel":2,"row":1,"value":3,"jackpot":null},{"reel":3,"row":0,"value":20,"jackpot":"MINI"},{"reel":4,"row":0,"value":15,"jackpot":null},{"reel":4,"row":1,"value":2,"jackpot":null},{"reel":4,"row":2,"value":5,"jackpot":null}],"fullBoard":false,"jackpots":["MINI"],"grandAwarded":false,"pinatas":9,"total":60,"totalPayout":60}
respins (one per line; counter shows RESET when `spinsLeft` goes back to 3):
{"spinIndex":1,"respinsBefore":3,"landed":[],"filled":6,"spinsLeft":2,"totalPayout":0}
{"spinIndex":2,"respinsBefore":2,"landed":[{"reel":3,"row":1,"value":2,"jackpot":null}],"filled":7,"spinsLeft":3,"totalPayout":0}
{"spinIndex":3,"respinsBefore":3,"landed":[{"reel":0,"row":1,"value":10,"jackpot":null},{"reel":2,"row":2,"value":1,"jackpot":null}],"filled":9,"spinsLeft":3,"totalPayout":0}
{"spinIndex":4,"respinsBefore":3,"landed":[],"filled":9,"spinsLeft":2,"totalPayout":0}
{"spinIndex":5,"respinsBefore":2,"landed":[],"filled":9,"spinsLeft":1,"totalPayout":0}
{"spinIndex":6,"respinsBefore":1,"landed":[],"filled":9,"spinsLeft":0,"totalPayout":60}
cracks (final crack order, left to right, top to bottom):
{"order":1,"reel":0,"row":1,"value":10,"jackpot":null,"running":10}
{"order":2,"reel":1,"row":2,"value":2,"jackpot":null,"running":12}
{"order":3,"reel":2,"row":1,"value":3,"jackpot":null,"running":15}
{"order":4,"reel":2,"row":2,"value":1,"jackpot":null,"running":16}
{"order":5,"reel":3,"row":0,"value":20,"jackpot":"MINI","running":36}
{"order":6,"reel":3,"row":1,"value":2,"jackpot":null,"running":38}
{"order":7,"reel":4,"row":0,"value":15,"jackpot":null,"running":53}
{"order":8,"reel":4,"row":1,"value":2,"jackpot":null,"running":55}
{"order":9,"reel":4,"row":2,"value":5,"jackpot":null,"running":60}
### C. PONCHO PARADE round (3 drums on a base spin = 8 spins)
round header:
{"v":1,"game":"lucky-llama-fiesta","mode":"base","bought":null,"ante":false,"cost":1,"initialGrid":"== spin.grid","cascadeSteps":[{"payout":0,"lines":0}],"basePayout":0,"bonusTriggered":true,"totalPayout":143.92,"capped":false}
trigger spin (base):
{"reelStops":[123,40,32,75,34],"strip":"base","grid":[["LUC","MON","MAR"],["MAR","MAS","SCA"],["MAR","GUI","MAR"],["SCA","CHI","TAC"],["GUI","TAC","SCA"]],"wins":[],"linePayout":0,"wilds":[],"scatters":[{"reel":1,"row":2},{"reel":3,"row":0},{"reel":4,"row":2}],"money":[{"reel":0,"row":1,"value":8,"jackpot":null}],"tease":[false,false,false,false,false],"teaseKind":null,"totalPayout":0}
bonus header:
{"type":"parade","trigger":"spin","drums":3,"startSpins":8,"startSticky":[],"retriggers":0,"capped":false,"totalPayout":143.92}
free spin 1 in full:
{"reelStops":[53,46,81,7,70],"strip":"parade","grid":[["SCA","MON","TAC"],["GUI","CHI","GUI"],["SKU","WLD","MON"],["TAC","SKU","MAR"],["MAS","MAC","SOM"]],"wins":[],"linePayout":0,"wilds":[{"reel":2,"row":1,"sticky":true,"new":true}],"scatters":[{"reel":0,"row":0}],"money":[{"reel":0,"row":1,"value":3,"jackpot":null},{"reel":2,"row":2,"value":2,"jackpot":null}],"tease":[false,false,false,false,false],"teaseKind":null,"totalPayout":5,"spinIndex":1,"spinsLeft":7,"stickyWilds":[{"reel":2,"row":1}],"wildCount":1,"ladderStep":1,"multiplier":1,"grab":{"values":[{"reel":0,"row":1,"value":3,"jackpot":null},{"reel":2,"row":2,"value":2,"jackpot":null}],"total":5}}
all free spins, key fields (every one is a full FreeSpin object like spin 1):
| # | new wilds | wildCount | step | mult | linePayout | grab | totalPayout | spinsLeft |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | x1 | 0 | 5 (2 piñatas) | 5 | 7 |
| 2 | 2 | 3 | 3 | x3 | 0.75 | 1 (1 piñatas) | 3.25 | 6 |
| 3 | 0 | 3 | 3 | x3 | 0.26 | 3 (2 piñatas) | 3.78 | 5 |
| 4 | 0 | 3 | 3 | x3 | 0.28 | 8 (3 piñatas) | 8.84 | 4 |
| 5 | 2 | 5 | 4 | x5 | 2.31 | 15 (1 piñatas) | 26.55 | 3 |
| 6 | 1 | 6 | 4 | x5 | 2.33 | 6 (2 piñatas) | 17.65 | 2 |
| 7 | 0 | 6 | 4 | x5 | 8.84 | 0 (0 piñatas) | 44.2 | 1 |
| 8 | 0 | 6 | 4 | x5 | 6.93 | 0 (0 piñatas) | 34.65 | 0 |
last free spin in full (sticky list, ladder, grab):
{"reelStops":[99,77,79,48,50],"strip":"parade","grid":[["WLD","MAC","SOM"],["MAS","WLD","WLD"],["GUI","WLD","WLD"],["GUI","TAC","WLD"],["TAC","CHI","MAS"]],"wins":[{"line":1,"symbol":"MAC","count":3,"pay":0.03,"cells":[{"reel":0,"row":1},{"reel":1,"row":1},{"reel":2,"row":1}]},{"line":3,"symbol":"SOM","count":4,"pay":0.54,"cells":[{"reel":0,"row":2},{"reel":1,"row":2},{"reel":2,"row":2},{"reel":3,"row":2}]},{"line":4,"symbol":"TAC","count":5,"pay":0.95,"cells":[{"reel":0,"row":0},{"reel":1,"row":1},{"reel":2,"row":2},{"reel":3,"row":1},{"reel":4,"row":0}]},{"line":6,"symbol":"MAS","count":3,"pay":0.18,"cells":[{"reel":0,"row":0},{"reel":1,"row":0},{"reel":2,"row":1}]},{"line":7,"symbol":"SOM","count":4,"pay":0.54,"cells":[{"reel":0,"row":2},{"reel":1,"row":2},{"reel":2,"row":1},{"reel":3,"row":2}]},{"line":8,"symbol":"MAC","count":4,"pay":0.11,"cells":[{"reel":0,"row":1},{"reel":1,"row":2},{"reel":2,"row":2},{"reel":3,"row":2}]},{"line":10,"symbol":"TAC","count":5,"pay":0.95,"cells":[{"reel":0,"row":0},{"reel":1,"row":1},{"reel":2,"row":1},{"reel":3,"row":1},{"reel":4,"row":0}]},{"line":11,"symbol":"SOM","count":3,"pay":0.12,"cells":[{"reel":0,"row":2},{"reel":1,"row":1},{"reel":2,"row":1}]},{"line":13,"symbol":"MAC","count":3,"pay":0.03,"cells":[{"reel":0,"row":1},{"reel":1,"row":2},{"reel":2,"row":1}]},{"line":14,"symbol":"GUI","count":3,"pay":0.05,"cells":[{"reel":0,"row":0},{"reel":1,"row":1},{"reel":2,"row":0}]},{"line":15,"symbol":"SOM","count":3,"pay":0.12,"cells":[{"reel":0,"row":2},{"reel":1,"row":1},{"reel":2,"row":2}]},{"line":17,"symbol":"MAC","count":3,"pay":0.03,"cells":[{"reel":0,"row":1},{"reel":1,"row":1},{"reel":2,"row":2}]},{"line":18,"symbol":"MAS","count":5,"pay":2.98,"cells":[{"reel":0,"row":0},{"reel":1,"row":0},{"reel":2,"row":1},{"reel":3,"row":2},{"reel":4,"row":2}]},{"line":19,"symbol":"SOM","count":3,"pay":0.12,"cells":[{"reel":0,"row":2},{"reel":1,"row":2},{"reel":2,"row":1}]},{"line":20,"symbol":"GUI","count":4,"pay":0.18,"cells":[{"reel":0,"row":0},{"reel":1,"row":2},{"reel":2,"row":0},{"reel":3,"row":2}]}],"linePayout":6.93,"wilds":[{"reel":0,"row":0,"sticky":true,"new":false},{"reel":1,"row":1,"sticky":true,"new":false},{"reel":1,"row":2,"sticky":true,"new":false},{"reel":2,"row":1,"sticky":true,"new":false},{"reel":2,"row":2,"sticky":true,"new":false},{"reel":3,"row":2,"sticky":true,"new":false}],"scatters":[],"money":[],"tease":[false,false,false,false,false],"teaseKind":null,"totalPayout":34.65,"spinIndex":8,"spinsLeft":0,"stickyWilds":[{"reel":0,"row":0},{"reel":1,"row":1},{"reel":1,"row":2},{"reel":2,"row":1},{"reel":2,"row":2},{"reel":3,"row":2}],"wildCount":6,"ladderStep":4,"multiplier":5,"grab":{"values":[],"total":0}}
### D. Bought round trigger spins
buy link (trigger spin pays 0, exactly 6 piñatas, no wins):
{"v":1,"game":"lucky-llama-fiesta","mode":"buy","bought":"link","ante":false,"cost":60,"initialGrid":"== spin.grid","cascadeSteps":[],"basePayout":0,"bonusTriggered":true,"totalPayout":50,"capped":false}
{"reelStops":[33,52,3,124,73],"strip":"base","grid":[["MON","MAR","CHI"],["MON","GUI","MON"],["MAR","TRU","CHI"],["MAC","MAR","MON"],["CHI","MON","MON"]],"wins":[],"linePayout":0,"wilds":[],"scatters":[],"money":[{"reel":0,"row":0,"value":8,"jackpot":null},{"reel":1,"row":0,"value":10,"jackpot":null},{"reel":1,"row":2,"value":3,"jackpot":null},{"reel":3,"row":2,"value":2,"jackpot":null},{"reel":4,"row":1,"value":15,"jackpot":null},{"reel":4,"row":2,"value":10,"jackpot":null}],"tease":[false,false,false,false,true],"teaseKind":"money","totalPayout":0}
buy party (trigger spin shows the drums; the 3 sticky ponchos are in bonus.startSticky):
{"v":1,"game":"lucky-llama-fiesta","mode":"buy","bought":"party","ante":false,"cost":284,"initialGrid":"== spin.grid","cascadeSteps":[],"basePayout":0,"bonusTriggered":true,"totalPayout":374.44,"capped":false}
{"reelStops":[35,100,8,23,32],"strip":"base","grid":[["CHI","MAS","SKU"],["MAR","SCA","MAR"],["SCA","MAR","MAC"],["SCA","TRU","MAR"],["GUI","CHI","GUI"]],"wins":[],"linePayout":0,"wilds":[],"scatters":[{"reel":1,"row":1},{"reel":2,"row":0},{"reel":3,"row":0}],"money":[],"tease":[false,false,false,true,true],"teaseKind":"scatter","totalPayout":0}
bonus.startSticky: [{"reel":0,"row":0},{"reel":1,"row":2},{"reel":2,"row":1}], drums 3, startSpins 8, first spin multiplier x3


## 8. Measured math (tools/sim.js; RTP band 96.0-96.5% in EVERY mode)
| mode | cost | RTP (95% CI) | rounds | any-win freq | bonus rate | avg bonus | volatility sd (x bet) | p99 | p99.9 | max-win 7,500x |
|---|---|---|---|---|---|---|---|---|---|---|
| base | 1 | 96.33% (+-0.16) | 4 x 100M | 27.63% | 1 in 129 (Parade 1 in 258, Link 1 in 256) | 67.6x | 16.5 | 12x | 79x | 1 in 11.8M spins |
| ante (Fiesta Luck) | 2 | 96.13% (+-0.14) | 4 x 100M | 26.20% | 1 in 46 | 69.8x | 29.4 | 41x | 183x | 1 in 1.97M spins |
| buy parade | 80 | 96.27% (+-0.07) | 6 x 6M | n/a | always | 77.0x | 175 | 751x | 2,144x | 1 in 31.7k buys |
| buy link | 60 | 96.36% (+-0.10) | 6 x 6M | n/a | always | 57.8x | 176 | 287x | 2,092x | never (max seen 4,134x; GRAND full board) |
| buy party | 284 | 96.25% (+-0.05) | 6 x 6M | n/a | always | 273.3x | 471 | 2,277x | 4,948x | 1 in 4.2k buys |
Base split: lines 43.8%, Parade 29.7%, Link 22.8%. 6 seeds x 6M (36M) of the base mode also measured 96.57% +-0.54 (consistent, SE is large: sd 16.5 per spin). Ante measured at 5 settings of `anteScale` (0.98: 95.95, 0.99: 96.13, 0.992: 96.41, 1.0: 96.46); shipped 0.99.
Volatility: HIGH (sd 16.5x per base spin; 12.2% of base spins win more than the bet; p99 12x, p99.9 79x).
Concept check: hit freq 27.6% (target ~28), bonus 1 in 129 (target ~130). 7,500x IS reachable: ~1 in 11.8M base spins (Parade with x8/x10 ladder on a nearly sticky board, or Party Pack); the cap is KEPT at 7,500x. Link alone tops out near 4,100x (GRAND 2,000 + jackpots).
Ante note: the concept said drums/piñatas land "5-6x more often"; the RTP maths needs about 2.8x more bonus triggers per spin at cost 2x (drums per reel 3.5 -> 5 of ~134 stops, piñatas 14 -> 17), so that is what ships.
Retune knobs (top of `CFG`, all 1 as shipped except anteScale 0.99): `lineScale` (base line pays), `anteScale` (extra factor on ante line pays), `linkScale` (ordinary piñata values), `paradeScale` (Parade line pays), `parade.grabScale` (Collector grabs); tables: `CFG.paytable`, `CFG.parade.paytable`, `CFG.reels.{base,ante,parade}` (+ `CFG.layout` shuffle seeds, changing counts reshuffles: ALWAYS re-sim), `CFG.link.p`, value tables and `jackpotP`.
Re-run: `node tools/sim.js lucky-llama-fiesta all 6000000 1,2,3,4,5,6` (about 10 min on 4 cores; buys are slow), base/ante alone: `node tools/sim.js lucky-llama-fiesta base,ante 100000000 1,2,3,4` (about 4 min). With a knob: `--cfg '{"lineScale":1.01}'`. Regenerate meta: `node tools/lucky-llama-meta.js`. Tests: `node --test tools/lucky-llama.test.js`.

## 9. CFG for slot.json (kai)
`slot.json` may equal `CFG`: `bets`, `maxWin:7500`, `anteCost:2`, `buy:{parade:{cost:80,name:"Poncho Parade"},link:{cost:60,name:"Piñata Link"},party:{cost:284,name:"Party Pack"}}` (buy objects also carry `drumsW`/`sticky`, ignore them), `lines` (20 x [row per reel]), `symbols`, `paytable`, `parade.paytable`, `payscale` (paytable, paradePaytable, linkValues, jackpots, ladder, drums), no `luckCost`. `GET /api/slot/lucky-llama-fiesta/info` returns the strips too (`info().strips`, symbol codes per reel, for the reel-spin visuals).

## RESUME NOTE
- DONE: engine `engines/lucky-llama-fiesta.js` + meta + registry line, `tools/lucky-llama.test.js` (17 tests), `tools/lucky-llama-meta.js`, this doc with real examples (sections 7) and measured math (section 8). All 5 modes inside 96.0-96.5%.
- LEFT: nothing for the engine unless the owner asks for a retune (see knobs in section 8). kai: client reads `round.spin` / `round.bonus.spins` / `round.bonus.cracks` only. leo: symbol codes in section 1, paylines in `CFG.lines`.
