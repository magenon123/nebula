# Rattlerock Run: round JSON format (engine `rattlerock-run`, CONTRACT v1)

Audience: kai (client) and leo (art). The server has already decided everything; the client only PLAYS BACK the timeline. All money = multiples of the base bet (the server scales by stake). Nothing is derived client-side except display.

## 1. Round (top level)
```
{ v:1, mode:"base"|"ante"|"buy", bought:null|"deep"|"motherlode", ante:bool,
  cost,                       // 1 | CFG.anteCost (2.5) | CFG.buy[key].cost
  runs:[ Run ],               // base: 1 run; ante (TWIN CARTS): exactly 2 runs (index 0 = left track, 1 = right track); buy: 1 trigger run
  initialGrid:[[type,..],..], // per run, the list of stop types (kept for contract v1; client may ignore)
  cascadeSteps:[{run,payout}],// one per run (payout = run.pay); [] for bought rounds
  basePayout,                 // sum of runs[i].pay (0 for buys)
  bonusTriggered:bool, bonus:null|Bonus,
  totalPayout,                // min(maxWin, basePayout + bonus.totalPayout)
  capped:bool }               // true when the 7,500x cap truncated the round
```
Order of play: all runs (twin runs play side by side, same time), then the bonus if any. `totalPayout` is the only number the win counter ends on.

## 2. Run (base game)
```
Run = { run:0, kind:"ride"|"trigger", length:N,        // N = number of stops incl. the door (6..12)
        spacing:100,                                    // distance units between stops: stop i sits at at = i*spacing
        stops:[Stop..],                                 // played in order, ends at the door or at the crash stop
        exit:"door"|"crash"|"bonus",                    // "bonus" only for the trigger run of a bought round
        crash:bool, crashAt:null|i,
        lanterns:0..3, bonusAt:null|i,                  // i of the 3rd lantern (bonus will follow the run)
        load, mult, shields,                            // final state (shields left unused)
        pay }                                           // exit pay in bet multiples
```
Every Stop carries the state AFTER it: `{ i, at, type, ..., load, mult, shields, lanterns }`.
- `gold`:    `{value}`  load += value.
- `gem`:     `{value}` in 2|3|5|10 (colour green/blue/red/gold). mult += value (gauge starts at 1, so one x5 gem = x6).
- `shield`:  shields += 1.
- `lantern`: lanterns += 1. The 3rd one sets `bonusAt`; the run still finishes normally and pays; the bonus follows.
- `tnt`:     if shields > 0: `{shielded:true, crash:false}`, shields -= 1 (hat pops, stop is harmless). Else `{shielded:false, crash:true}`: run ends, pay = load (NO multiplier), `crashAt = i`.
- `fork`:    `{left:Preview, right:Preview, side:"left"|"right", pick:"rich"|"safe", taken:{type:"gold"|"gem"|"shield"|"tnt"|"lantern"|"none", value?, shielded?, crash?}}`.
  Preview = `{type, value?}` shown on each side before the lever flips (what you would get there). The server's side is `side`; `taken` equals the preview of that side and is applied exactly like a normal stop of that type (so a TNT can sit on either side). The rich side holds bigger gold/gems and a higher TNT chance, the safe side small gold/shield/none.
- `door`:    last stop, `{kind:"normal"|"jackpot", jackpot:0|50|100|250|1000..., pay}`. pay = load * mult + jackpot. run.pay = door.pay.
No stop follows a crash. Money invariants: `pay = exit==="door" ? load*mult + door.jackpot : exit==="crash" ? load : 0`.

## 3. Bonus: DEEP SHAFT (3 carts, 3 levels)
```
Bonus = { type:"deepShaft", startSpins:3 (= carts), carts:3, levels:3,
          startLevel:1|2, startMult:1|n, startShields:0|n,   // motherlode: level 2, extra shields (see CFG.buy.motherlode)
          triggeredBy:[runIndex..],                          // lantern runs, [] for buys
          spins:[Segment..],                                 // one entry per level attempt, in order (contract: "spin" = segment)
          bottomReached:bool, cartsLost:0..3,
          totalPayout }                                      // min(maxWin, sum of segment pays)
Segment = { spinIndex (1-based), spinsLeft (= carts still alive AFTER this segment),
            cart:1..3, level:1..3, length:N, spacing:100, stops:[Stop..],      // same Stop types as the base run (gold/gem/shield/tnt/fork/lantern(no effect)/door)
            multIn, multOut, shieldsIn, shieldsOut,            // gauge and hats CARRY between segments and carts, load does not
            exit:"level"|"bottom"|"crash",
            load, pay, totalPayout:pay,                        // totalPayout == pay (contract field)
            cartLost:bool, bonusPayoutSoFar }
```
Rules:
1. A level is one short track (deeper level = richer gold/gems). Stops are as in the base run, but each stop's `load`/`mult`/`shields` start from the segment's `load=0`, `multIn`, `shieldsIn`. In the bonus a `lantern` stop is not generated.
2. Reaching the level door (`exit:"level"`) banks `pay = load * mult + jackpot` (jackpot only at the bottom), the cart goes on to the NEXT level (next segment, same cart number, `level+1`, `multIn = multOut`, `load` starts at 0). The 3rd-level door is the BOTTOM door (`exit:"bottom"`, `bottomReached:true`): the bonus ends there.
3. TNT with a shield: shield consumed, nothing else. TNT without shield: the cart is lost (`exit:"crash"`, `cartLost:true`), the level pays `pay = load` only (no multiplier), `spinsLeft` decreases by 1. If carts remain, the NEXT segment is the SAME level again with a freshly generated track, the next cart number, `multIn = multOut` (the multiplier carries, shields carry). If no carts remain the bonus ends.
4. The multiplier gauge never resets inside the bonus (`multOut` of one segment = `multIn` of the next). Gems add exactly as in the base game.
5. Bounds: at most 3 crashes + 3 level exits = 6 segments. If a running total reaches the cap, the segment is truncated and the bonus stops (`capped`).
Buy `deep`: bonus from level 1, mult 1, 0 shields, 3 carts. Buy `motherlode`: startLevel 2, startMult/startShields from `CFG.buy.motherlode` (so only levels 2 and 3 are played, with more shields).
Trigger run of a bought round: `kind:"trigger"`, 3 `lantern` stops, `exit:"bonus"`, `pay:0`, `cascadeSteps:[]`, `basePayout:0`.

## 4. Twin Carts (ante, cost 2.5x)
`runs` has TWO independent base runs (own stops, own lantern count, own shield state), both paid (`basePayout` = pay0 + pay1). Shields appear more often (`CFG.ante` weight table), per-stop lantern chance is the same as in base. If either (or both) run collects 3 lanterns, ONE bonus plays after both runs (`triggeredBy` lists the run indexes). Buys never combine with ante.

## 5. Worked examples (schematic, same shape as engine output; load/mult after each stop)
### A. Crash run (base): gold 1, gem x2, tnt crash
```
{v:1,mode:"base",bought:null,ante:false,cost:1,initialGrid:[["gold","gem","tnt"]],cascadeSteps:[{run:0,payout:1}],basePayout:1,
 runs:[{run:0,kind:"ride",length:9,spacing:100,exit:"crash",crash:true,crashAt:3,lanterns:0,bonusAt:null,load:1,mult:3,shields:0,pay:1,
  stops:[{i:1,at:100,type:"gold",value:1,load:1,mult:1,shields:0,lanterns:0},
         {i:2,at:200,type:"gem",value:2,load:1,mult:3,shields:0,lanterns:0},
         {i:3,at:300,type:"tnt",shielded:false,crash:true,load:1,mult:3,shields:0,lanterns:0}]}],
 bonusTriggered:false,bonus:null,totalPayout:1,capped:false}
```
Pays 1 (load only), NOT 1 x 3.
### B. Clean door run: gold 2, fork(rich, gem x5), shield, tnt (shielded), door
```
stops:[{i:1,at:100,type:"gold",value:2,load:2,mult:1,shields:0,lanterns:0},
 {i:2,at:200,type:"fork",left:{type:"gold",value:0.5},right:{type:"gem",value:5},side:"right",pick:"rich",taken:{type:"gem",value:5},load:2,mult:6,shields:0,lanterns:0},
 {i:3,at:300,type:"shield",load:2,mult:6,shields:1,lanterns:0},
 {i:4,at:400,type:"tnt",shielded:true,crash:false,load:2,mult:6,shields:0,lanterns:0},
 {i:5,at:500,type:"door",kind:"normal",jackpot:0,pay:12,load:2,mult:6,shields:0,lanterns:0}]
run: exit:"door", crash:false, load:2, mult:6, pay:12 (= 2*6). totalPayout 12.
```
### C. Bonus-trigger run (base, 3 lanterns, then a Deep Shaft of 2 segments)
```
run.stops contain lantern at i=2,4,7 (lanterns 1,2,3), bonusAt:7, run exits at the door with pay 3 -> basePayout 3, bonusTriggered:true
bonus:{type:"deepShaft",startSpins:3,carts:3,levels:3,startLevel:1,startMult:1,startShields:0,triggeredBy:[0],bottomReached:false,cartsLost:3,totalPayout:9,
 spins:[
  {spinIndex:1,spinsLeft:3,cart:1,level:1,exit:"level",multIn:1,multOut:3,shieldsIn:0,shieldsOut:0,load:2,pay:6,totalPayout:6,cartLost:false,bonusPayoutSoFar:6,stops:[..gold 2, gem 2.., door]},
  {spinIndex:2,spinsLeft:2,cart:1,level:2,exit:"crash",multIn:3,multOut:3,shieldsIn:0,shieldsOut:0,load:3,pay:3,totalPayout:3,cartLost:true,bonusPayoutSoFar:9,stops:[..tnt crash]},
  ... (spinsLeft 1 and 0 for the remaining carts, each cart replays level 2)]}
totalPayout = 3 + 9 = 12
```
(Segment 2 "spinsLeft:2": one cart died, 2 carts remain; the engine output continues until carts are gone or the bottom door is reached.)

## 6. CFG for slot.json (`slot.json` may equal `CFG`)
`bets`, `maxWin:7500`, `anteCost:2.5`, `buy:{deep:{cost,name},motherlode:{cost,name,...}}`, `payscale`, tables; no `luckCost` (no MAX LUCK).

## RESUME NOTE
- [start] Format doc written. Next: engines/rattlerock-run.js + meta + registry + tests/rattlerock.test.js, then sim/tune each mode to 96.0-96.5% (5M rounds per mode).
