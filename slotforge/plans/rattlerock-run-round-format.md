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
- `gem`:     `{value}` in 2|3|5|10 (colour green/blue/red/gold); deeper bonus levels also use 25 and 50 (level 3). mult += value (gauge starts at 1, so one x5 gem = x6).
- `shield`:  shields += 1.
- `lantern`: lanterns += 1. The 3rd one sets `bonusAt`; the run still finishes normally and pays; the bonus follows.
- `tnt`:     if shields > 0: `{shielded:true, crash:false}`, shields -= 1 (hat pops, stop is harmless). Else `{shielded:false, crash:true}`: run ends, pay = load (NO multiplier), `crashAt = i`.
- `fork`:    `{left:Preview, right:Preview, side:"left"|"right", pick:"rich"|"safe", taken:{type:"gold"|"gem"|"shield"|"tnt"|"lantern"|"none", value?, shielded?, crash?}}`.
  Preview = `{type, value?}` (type may also be `none`: an empty side) shown on each side before the lever flips (what you would get there). The server's side is `side`; `taken` equals the preview of that side and is applied exactly like a normal stop of that type (so a TNT can sit on either side). The rich side holds bigger gold/gems and a higher TNT chance, the safe side small gold/shield/none.
- `door`:    last stop, `{kind:"normal"|"jackpot", jackpot:0|25|100|500|1000 (base) or 50|250|1000|2500|7500 (bottom door), pay}`. pay = load * mult + jackpot. run.pay = door.pay.
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
2. Reaching the level door (`exit:"level"`) banks `pay = load * mult + jackpot` (jackpot only at the bottom), the cart goes on to the NEXT level (next segment, same cart number, `level+1`, `multIn = multOut`, `load` starts at 0). The 3rd-level door is the BOTTOM door (the only door with a real jackpot chance in the bonus) (`exit:"bottom"`, `bottomReached:true`): the bonus ends there.
3. TNT with a shield: shield consumed, nothing else. TNT without shield: the cart is lost (`exit:"crash"`, `cartLost:true`), the level pays `pay = load` only (no multiplier), `spinsLeft` decreases by 1. If carts remain, the NEXT segment is the SAME level again with a freshly generated track, the next cart number, `multIn = multOut` (the multiplier carries, shields carry). If no carts remain the bonus ends.
4. The multiplier gauge never resets inside the bonus (`multOut` of one segment = `multIn` of the next). Gems add exactly as in the base game.
5. Bounds: at most 3 crashes + 3 level exits = 6 segments. If a running total reaches the cap, the segment is truncated and the bonus stops (`capped`).
Buy `deep`: bonus from level 1, mult 1, 0 shields, 3 carts. Buy `motherlode`: startLevel 2, startMult/startShields from `CFG.buy.motherlode` (so only levels 2 and 3 are played, with more shields).
Trigger run of a bought round: `kind:"trigger"`, 3 `lantern` stops, `exit:"bonus"`, `pay:0`, `cascadeSteps:[]`, `basePayout:0`.

## 4. Twin Carts (ante, cost 2.5x)
`runs` has TWO independent base runs (own stops, own lantern count, own shield state), both paid (`basePayout` = pay0 + pay1). Shields appear more often (`CFG.ante` weight table), per-stop lantern chance is the same as in base. If either (or both) run collects 3 lanterns, ONE bonus plays after both runs (`triggeredBy` lists the run indexes). Buys never combine with ante.

## 5. Worked examples (REAL engine output, seed 5; every stop is one JSON line)
### A. Crash run (base). Two forks: the second one's rich side is a TNT and the cart takes it. Pays the load only.
stops (one per line; `load/mult/shields/lanterns` are AFTER the stop):
{"i":1,"at":100,"type":"gold","value":0.04,"load":0.04,"mult":1,"shields":0,"lanterns":0}
{"i":2,"at":200,"type":"gold","value":0.35,"load":0.39,"mult":1,"shields":0,"lanterns":0}
{"i":3,"at":300,"type":"fork","left":{"type":"none"},"right":{"type":"gold","value":0.11},"side":"left","pick":"safe","taken":{"type":"none"},"load":0.39,"mult":1,"shields":0,"lanterns":0}
{"i":4,"at":400,"type":"fork","left":{"type":"tnt"},"right":{"type":"gold","value":0.02},"side":"left","pick":"rich","taken":{"type":"tnt","shielded":false,"crash":true},"load":0.39,"mult":1,"shields":0,"lanterns":0}
run: {"exit":"crash","crash":true,"crashAt":4,"lanterns":0,"bonusAt":null,"load":0.39,"mult":1,"shields":0,"pay":0.39}
round: {"basePayout":0.39,"bonusTriggered":false,"totalPayout":0.39,"capped":false,"cost":1}
### B. Clean door run (base). Fork takes the rich gold side, two shields, gem x5, the TNT is eaten by a shield, door pays 0.88 x 6.
stops (one per line; `load/mult/shields/lanterns` are AFTER the stop):
{"i":1,"at":100,"type":"fork","left":{"type":"none"},"right":{"type":"gold","value":0.88},"side":"right","pick":"rich","taken":{"type":"gold","value":0.88},"load":0.88,"mult":1,"shields":0,"lanterns":0}
{"i":2,"at":200,"type":"shield","load":0.88,"mult":1,"shields":1,"lanterns":0}
{"i":3,"at":300,"type":"shield","load":0.88,"mult":1,"shields":2,"lanterns":0}
{"i":4,"at":400,"type":"gem","value":5,"load":0.88,"mult":6,"shields":2,"lanterns":0}
{"i":5,"at":500,"type":"tnt","shielded":true,"crash":false,"load":0.88,"mult":6,"shields":1,"lanterns":0}
{"i":6,"at":600,"type":"door","kind":"normal","jackpot":0,"pay":5.28,"load":0.88,"mult":6,"shields":1,"lanterns":0}
run: {"exit":"door","crash":false,"crashAt":null,"lanterns":0,"bonusAt":null,"load":0.88,"mult":6,"shields":1,"pay":5.28}
round: {"basePayout":5.28,"bonusTriggered":false,"totalPayout":5.28,"capped":false,"cost":1}
### C. Bonus-trigger run (base) with its Deep Shaft
base run (3 lanterns at stops 1-3, `bonusAt:3`, the run still finishes and pays 0.13):
{"i":1,"at":100,"type":"lantern","load":0,"mult":1,"shields":0,"lanterns":1}
{"i":2,"at":200,"type":"lantern","load":0,"mult":1,"shields":0,"lanterns":2}
{"i":3,"at":300,"type":"lantern","load":0,"mult":1,"shields":0,"lanterns":3}
{"i":4,"at":400,"type":"gold","value":0.09,"load":0.09,"mult":1,"shields":0,"lanterns":3}
{"i":5,"at":500,"type":"gold","value":0.04,"load":0.13,"mult":1,"shields":0,"lanterns":3}
{"i":6,"at":600,"type":"door","kind":"normal","jackpot":0,"pay":0.13,"load":0.13,"mult":1,"shields":0,"lanterns":3}
bonus header: {"type":"deepShaft","startSpins":3,"carts":3,"levels":3,"startLevel":1,"startMult":1,"startShields":0,"triggeredBy":[0],"bottomReached":false,"cartsLost":3,"totalPayout":3.64}
segment: {"spinIndex":1,"spinsLeft":2,"cart":1,"level":1,"length":6,"spacing":100,"multIn":1,"multOut":1,"shieldsIn":0,"shieldsOut":0,"exit":"crash","load":0.98,"pay":0.98,"totalPayout":0.98,"cartLost":true,"bonusPayoutSoFar":0.98}
  {"i":1,"at":100,"type":"gold","value":0.7,"load":0.7,"mult":1,"shields":0,"lanterns":0}
  {"i":2,"at":200,"type":"gold","value":0.28,"load":0.98,"mult":1,"shields":0,"lanterns":0}
  {"i":3,"at":300,"type":"fork","left":{"type":"shield"},"right":{"type":"tnt"},"side":"right","pick":"rich","taken":{"type":"tnt","shielded":false,"crash":true},"load":0.98,"mult":1,"shields":0,"lanterns":0}
segment: {"spinIndex":2,"spinsLeft":1,"cart":2,"level":1,"length":6,"spacing":100,"multIn":1,"multOut":1,"shieldsIn":0,"shieldsOut":0,"exit":"crash","load":1.68,"pay":1.68,"totalPayout":1.68,"cartLost":true,"bonusPayoutSoFar":2.66}
  {"i":1,"at":100,"type":"gold","value":0.14,"load":0.14,"mult":1,"shields":0,"lanterns":0}
  {"i":2,"at":200,"type":"gold","value":0.7,"load":0.84,"mult":1,"shields":0,"lanterns":0}
  {"i":3,"at":300,"type":"gold","value":0.14,"load":0.98,"mult":1,"shields":0,"lanterns":0}
  {"i":4,"at":400,"type":"gold","value":0.7,"load":1.68,"mult":1,"shields":0,"lanterns":0}
  {"i":5,"at":500,"type":"tnt","shielded":false,"crash":true,"load":1.68,"mult":1,"shields":0,"lanterns":0}
segment: {"spinIndex":3,"spinsLeft":0,"cart":3,"level":1,"length":6,"spacing":100,"multIn":1,"multOut":1,"shieldsIn":0,"shieldsOut":0,"exit":"crash","load":0.98,"pay":0.98,"totalPayout":0.98,"cartLost":true,"bonusPayoutSoFar":3.64}
  {"i":1,"at":100,"type":"gold","value":0.7,"load":0.7,"mult":1,"shields":0,"lanterns":0}
  {"i":2,"at":200,"type":"gold","value":0.28,"load":0.98,"mult":1,"shields":0,"lanterns":0}
  {"i":3,"at":300,"type":"tnt","shielded":false,"crash":true,"load":0.98,"mult":1,"shields":0,"lanterns":0}
round: basePayout 0.13 + bonus 3.64 = totalPayout 3.77 (this is a poor bonus: all 3 carts crashed on level 1 and paid only their load)

Note: a segment's `stops` end at the crash stop or at the door (`exit:"level"` / `"bottom"`).

## 6. CFG for slot.json (`slot.json` may equal `CFG`)
`bets`, `maxWin:7500`, `anteCost:2.5`, `buy:{deep:{cost,name},motherlode:{cost,name,...}}`, `payscale`, tables; no `luckCost` (no MAX LUCK).

## 7. Measured math (tools/sim.js, 36M rounds per mode = 6 seeds x 6M; sample SE = 95% CI)
| mode | cost | RTP | +-95% | any-win freq | 1 in N hit >=100x | max-win (7,500x) 1 in | notes |
|---|---|---|---|---|---|---|---|
| base | 1 | 96.21% | 0.36 | 62.6% | 915 | 3.6M | Deep Shaft 1 in 207, avg bonus 66.9x, sd 10.2x, p99 11.1x, p99.9 103x |
| ante (Twin Carts) | 2.5 | 96.19% | 0.21 | 86.8% | 438 | 2.4M | Deep Shaft 1 in 101, sd 16.3x, p99 25.5x, p99.9 169x |
| buy deep | 70 | 96.35% | 0.06 | n/a | 5 | 19k | avg bonus 67.4x, sd 134x, p99 514x, p99.9 1220x |
| buy motherlode | 140 | 96.30% | 0.04 | n/a | 2 | 12k | avg bonus 134.8x, sd 171x, p99 788x, p99.9 1629x |
Retune knobs (top level of CFG): `goldScale` (base ride), `anteScale`, `bonusScale`, `motherScale`; tables in `CFG.base`, `CFG.bonus.levels[]`, `CFG.ante`, `CFG.buy.*`. Regenerate meta: `node tools/rattlerock-meta.js`.

## RESUME NOTE
- DONE: format doc, engine `engines/rattlerock-run.js` + meta + registry, `tools/rattlerock.test.js`, every mode tuned into 96.0-96.5% (section 7).
- Left: only if the owner asks for a retune. `slot.json` may equal CFG (+ meta). Client reads everything from `round.runs` / `round.bonus.spins`.
