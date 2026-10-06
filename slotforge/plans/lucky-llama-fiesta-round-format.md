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
Ladder (by wildCount, applied to ALL line wins of the spin, wilds that landed this spin already counted): 0 wild = x1 (step 0), 1 = x1 (step 1), 2 = x2, 3-4 = x3, 5-6 = x5, 7-9 = x8, 10+ = x10 (step 6). Every WLD that lands sticks for the rest of the bonus (painted into `grid` on every later spin). Piñatas inside Parade NEVER start Link: after the line wins, the Collector Don Lucho grabs EVERY piñata visible on that spin (left to right, instant, flying coins), `grab.total` is NOT multiplied by the ladder. Jackpot piñatas count with their value (a GRAND grab pays 2000x). A piñata or drum hidden under a sticky wild does not exist (painted over). The bonus is capped at 60 spins total and stops at the spin that reaches the cap (`capped:true`, `spinsLeft` may be > 0).

## 5. Buys (hanging sign, cards; names/costs in `CFG.buy`, NO price on the sign)
- `parade` (Poncho Parade): trigger spin shows 3 (usually), 4 or 5 drums (`drums`), no line win, no Link; then ParadeBonus.
- `link` (Piñata Link): trigger spin shows exactly 6 piñatas with values, no line win, no drums; then LinkBonus.
- `party` (Party Pack): like `parade`, plus `startSticky` 3 ponchos already on the board (ladder x3 from spin 1).
Bought rounds: `bought:key`, `basePayout:0`, `cascadeSteps:[]`, `spin.totalPayout:0`, `spin.wins:[]`.

## 6. Ante (FIESTA LUCK, cost 2)
`mode:"ante"`, `ante:true`, `spin.strip:"ante"` (strips with more drums and piñatas); the bonuses are identical to base. NO MAX LUCK: `luck` throws "unsupported".

## 7. Worked examples
(real engine output follows when the engine lands; see RESUME NOTE)

## RESUME NOTE
- STATE: format doc written (section 7 examples, section 8 math table to be filled from the engine). Next: engine `engines/lucky-llama-fiesta.js`, meta, registry line, `tools/lucky-llama.test.js`, sims (6 seeds x 6M per mode), then fill sections 7-8.
