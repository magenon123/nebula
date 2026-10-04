# Sirocco's Lamp Bazaar: round format (engine `siroccos-lamp-bazaar`)

Engine: `engines/siroccos-lamp-bazaar.js` (CONTRACT v1, see `engines/ENGINE-API.md`). Rules: `plans/slot5-concept.md` (maya), the engine header comment is the exact rule list.
Meta (paytable, rings, modes) for the client: `engines/siroccos-lamp-bazaar.meta.json` (regenerate with `node tools/sirocco-meta.js`). Everything shown to the player (paytable, gem values, rings, prices) comes from `info()` / the meta, never retyped.
All money below is **x base bet**. The server multiplies by the stake. Nothing else in the response carries money.

## 1. Modes and request

| mode | request | cost (x bet) | notes |
|---|---|---|---|
| base | `{}` | 1 | |
| ante "Djinn's Favour" | `{ ante: true }` | 2 | own symbol/scatter weights (FS about 1 in 63, Astrolabe about 1 in 100), 15% of spins carry a free Wish Gem on stage 1 |
| buy fs "Free Wishes" | `{ buy: 'fs' }` | 66 | 3, 4 or 5 FS dropped (natural mix, ~92 / 7 / 0.5 %); 4+ = SUPER |
| buy astrolabe | `{ buy: 'astrolabe' }` | 43 | 3, 4 or 5 Astrolabes |
| buy super "Three Wishes" | `{ buy: 'super' }` | 105 | 4 or 5 FS (95 / 5 %), always SUPER |

`ante` and `buy` never combine. No MAX LUCK.

## 2. Symbol ids (`grid` cells)

`0 Date Bowl, 1 Coffee Pot, 2 Glass Lantern` (low, pay from a run of 4) | `3 Jambiya, 4 Signet Ring, 5 Hourglass` (mid) | `6 Magic Carpet, 7 Sultan's Turban, 8 Genie's Lamp` (high) | `9 WILD Djinn Seal` (reels 2-4 only, grid columns 1..3) | `10 FS scatter` | `11 Astrolabe scatter` | `12 Wish Gem` (value in `gems[]`, never in a run). `grid[r][c]`: r = row 0..4 top to bottom, c = reel 0..4 left to right.

## 3. Round (top level)

```
{ v:1, cost, ante, bought:null|'fs'|'astrolabe'|'super', bonusType:null|'fs'|'super'|'astrolabe',
  initialGrid,            // = stages[0].grid; for a bought round the visible TRIGGER SPIN
  trigger?,               // bought rounds only: { type, count, cells:[[r,c]...] } the scatters dropped on initialGrid
  stages: [stage...],     // the base chain, [] for a bought round
  chain: { stages, base, gemSum, gemsOnBoard, gems:[{r,c,value}], payout },
  cascadeSteps,           // contract mirror: [{stage, payout}] ([] for a bought round)
  scatters: { fs:{count,cells}, astro:{count,cells} },   // stage 1 of the base chain (non-bought rounds)
  basePayout, bonusTriggered, bonus: null | bonusObject, totalPayout, capped }
```
`basePayout = min(maxWin, chain.payout)`, `totalPayout = min(maxWin, basePayout + bonus.totalPayout)`, `capped` true when the cap truncated the round (gold MAX WIN screen at 8,000x).
A bonus is triggered by the scatters of stage 1 (3+ FS or 3+ Astrolabes, Astrolabe wins a tie, probability about 1e-8). It starts after the whole base chain has been shown. If the chain alone reaches the cap there is no bonus.

## 3b. Money granularity (exact in cents at the $0.10 stake)

Every payout the client shows or sums (`stage.payout`, `chain.base`, `chain.payout`, `spin.totalPayout`, `bonus.totalPayout`, `basePayout`, `totalPayout`) is a **multiple of 0.1x**. Run pays (`run.pay`, table values such as 0.02) are only the exact ingredients; a stage's `payout` is its `exactPayout` rounded to the 0.1 grid: a paid stage below 0.1x shows 0.1x, above that it is rounded up or down with UNBIASED stochastic rounding (expectation kept). `chain.base` is exactly the sum of the stage `payout`s (no hidden remainder), gems multiply by an integer, the cap 8,000 is on the grid. Show `stage.payout`, never `exactPayout` or `run.pay` as money.

## 4. A stage (one landing of tiles inside a chain)

```
{ stage: k,                 // 1..25
  mult,                     // multiplier this stage pays at (base game: min(k,5); Free Wishes: the persistent multiplier)
  grid[5][5],               // the board AFTER the tiles landed this stage (sealed tiles unchanged)
  sealed[5][5],             // 1 = tile was sealed BEFORE this stage (it did not move). Every 0 tile fell in new this stage. Stage 1: all 0
  runs: [ { sym, dir:'h'|'v'|'d'|'a', len:3..5, cells:[[r,c]...], wilds:[[r,c]...], pay } ],   // paid runs, pay = x bet BEFORE mult
  exactPayout,              // = sum(run.pay) * mult (unrounded, for information only)
  payout,                   // what the player is paid for this stage: exactPayout rounded to the 0.1x grid (see below), always a multiple of 0.1, min 0.1 for a paid stage
  newlySealed: [[r,c]...],  // tiles that get the gold seal at the end of this stage: all run cells + gems landed this stage (+ the triggering scatters on stage 1)
  gems: [ {r,c,value,isNew} ],   // ALL gems on the board after this stage (isNew = landed this stage)
  chainTotal }              // running sum of payouts of stages 1..k (before the gem multiplier)
```
Client order for one stage: (1) drop the tiles where `sealed[r][c] === 0` (row by row, staggered; sealed tiles stay), (2) show `runs` (link animation along `cells`, win motion per symbol, wild cells highlighted), (3) show the seal on `newlySealed`, (4) tick `payout` x `mult` into the win counter. The next stage's `sealed` equals this stage's `sealed` + `newlySealed`.
The chain ends on the first stage whose `runs` is empty (a final "no new win" stage that is still shown), or when 25 tiles are sealed (the last stage then has runs).
Rules the client may rely on: a tile never changes while sealed; scatters (10, 11) appear only on stage 1 (a stage-1 scatter is sealed only when it triggers: 3+ of a kind); at most 4 gems per chain (5th and later never land); wild only in columns 1..3; every run contains at least one tile with `sealed === 0`.

**End of chain:** `chain.base` = sum of stage payouts. If `chain.base > 0` and gems are on the board, `chain.gemSum` = sum of their values and `chain.payout = chain.base * gemSum` (gems ADD, then multiply). No win in the chain: `gemSum 0`, gems fizzle, payout 0. (`gemsOnBoard` is the gem sum even when there was no win, for the fizzle animation.)

## 5. Free Wishes bonus (`bonusType 'fs'` or `'super'`)

```
bonus: { kind:'fs'|'super', startSpins, spins:[spin...], totalPayout, scatters:n, super:bool, startMult, multCap }
spin:  { spinIndex, spinsLeft, stages:[stage...], chain:{...as above}, scatters:{count,cells}, multStart, multEnd,
         retrigger?:4|6, uncappedPayout, totalPayout }
```
3 FS = 10 spins, 4 FS = 12 spins SUPER, 5 FS = 15 spins SUPER. Normal: multiplier starts x1, cap x12. SUPER: starts x3, cap x15. The multiplier **never resets**: every winning stage pays at the current multiplier (`stage.mult`) and then raises it by 1 (up to the cap). `multStart/multEnd` per spin. A spin is one full chain (same stage format, `stage.mult` is the persistent multiplier), gems multiply the end of that spin's chain. 3+ FS on stage 1 of a spin retriggers: +4 spins (+6 with 4+ FS), max 40 spins total; `spinsLeft` already includes it. Astrolabes never appear inside Free Wishes. `spin.totalPayout` is the chain payout (truncated on the last spin if the cap is hit; `uncappedPayout` is the real value). Sum of spins = `bonus.totalPayout`.

## 6. Astrolabe of Wishes (`bonusType 'astrolabe'`)

```
bonus: { kind:'astrolabe', startSpins, spins:[spin...], totalPayout, scatters:n, rings:{ outer:[12 values], middle:[10 values], core:[8 kinds] } }
spin:  { spinIndex, spinsLeft, outer:{idx,value}, middle:{idx,value}, core:{idx,kind:''|'mini'|'minor'|'major'|'grand',jackpot},
         magnet:{outer,middle}, magnetNext:{outer,middle}, cash, uncappedPayout, totalPayout }
```
3 / 4 / 5 Astrolabes = 4 / 6 / 8 spins. Per spin the three rings stop one after another: outer (cash 1-40x), middle (multiplier x1-x25), core (8 sectors, jackpot MINI 25 / MINOR 100 / MAJOR 500 / GRAND 2,500 when lit). `idx` is the sector index into `rings.<ring>` (the client spins the ring to that sector). Prize = `outer.value * middle.value` (= `cash`) + `core.jackpot`. MAGNET: if `magnet.outer` / `magnet.middle` is true this spin the top third of that ring was twice as likely (glow the ring before it spins); `magnetNext` says whether the NEXT spin has the magnet (the ring stopped on its best third this spin). The bonus ends early only when the cap is reached (`spinsLeft 0`, `capped true`).

## 7. Bought round

`initialGrid` = the trigger spin: plain tiles plus the dropped scatters (`trigger.cells`; FS buys drop 10, the Astrolabe buy drops 11), no run pays anything, `stages: []`, `cascadeSteps: []`, `basePayout: 0`. Then the intro splash and the bonus as above. The scatter count is the natural conditional distribution, not always 3.

## 8. Examples (real engine output, seed `sfc32(20261003)`)

### 8.1 Base round, 3 stages, a wild link and a x2 gem (pays 0.6x)
```json
{
  "v": 1,
  "cost": 1,
  "ante": false,
  "bought": null,
  "bonusType": null,
  "initialGrid": [
    [1, 6, 2, 4, 7],
    [7, 4, 8, 7, 1],
    [7, 3, 4, 7, 2],
    [1, 9, 3, 4, 2],
    [1, 5, 6, 3, 5]
  ],
  "stages": [
    {
      "stage": 1,
      "mult": 1,
      "grid": [
        [1, 6, 2, 4, 7],
        [7, 4, 8, 7, 1],
        [7, 3, 4, 7, 2],
        [1, 9, 3, 4, 2],
        [1, 5, 6, 3, 5]
      ],
      "sealed": [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
      ],
      "runs": [
        {
          "sym": 4,
          "dir": "d",
          "len": 3,
          "cells": [[1, 1], [2, 2], [3, 3]],
          "wilds": [],
          "pay": 0.02
        },
        {
          "sym": 3,
          "dir": "d",
          "len": 3,
          "cells": [[2, 1], [3, 2], [4, 3]],
          "wilds": [],
          "pay": 0.02
        }
      ],
      "exactPayout": 0.04,
      "payout": 0.1,
      "newlySealed": [[1, 1], [2, 2], [3, 3], [2, 1], [3, 2], [4, 3]],
      "gems": [],
      "chainTotal": 0.1
    },
    {
      "stage": 2,
      "mult": 2,
      "grid": [
        [3, 6, 1, 3, 3],
        [6, 4, 3, 2, 3],
        [1, 3, 4, 6, 12],
        [7, 4, 3, 4, 6],
        [4, 9, 3, 3, 1]
      ],
      "sealed": [
        [0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 0, 0, 1, 0]
      ],
      "runs": [
        {
          "sym": 3,
          "dir": "h",
          "len": 3,
          "cells": [[4, 1], [4, 2], [4, 3]],
          "wilds": [[4, 1]],
          "pay": 0.02
        },
        {
          "sym": 3,
          "dir": "a",
          "len": 3,
          "cells": [[0, 3], [1, 2], [2, 1]],
          "wilds": [],
          "pay": 0.02
        },
        {
          "sym": 4,
          "dir": "a",
          "len": 3,
          "cells": [[2, 2], [3, 1], [4, 0]],
          "wilds": [],
          "pay": 0.02
        }
      ],
      "exactPayout": 0.12,
      "payout": 0.2,
      "newlySealed": [[2, 4], [4, 1], [4, 2], [0, 3], [1, 2], [3, 1], [4, 0]],
      "gems": [
        {"r": 2, "c": 4, "value": 2, "isNew": true}
      ],
      "chainTotal": 0.3
    },
    {
      "stage": 3,
      "mult": 3,
      "grid": [
        [6, 5, 0, 3, 3],
        [8, 4, 3, 1, 0],
        [3, 3, 4, 4, 12],
        [1, 4, 3, 4, 3],
        [4, 9, 3, 3, 5]
      ],
      "sealed": [
        [0, 0, 0, 1, 0],
        [0, 1, 1, 0, 0],
        [0, 1, 1, 0, 1],
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 0]
      ],
      "runs": [],
      "exactPayout": 0,
      "payout": 0,
      "newlySealed": [],
      "gems": [
        {"r": 2, "c": 4, "value": 2, "isNew": false}
      ],
      "chainTotal": 0.3
    }
  ],
  "chain": {
    "stages": 3,
    "base": 0.3,
    "gemSum": 2,
    "gemsOnBoard": 2,
    "gems": [
      {"r": 2, "c": 4, "value": 2}
    ],
    "payout": 0.6
  },
  "cascadeSteps": [
    {"stage": 1, "payout": 0.1},
    {"stage": 2, "payout": 0.2},
    {"stage": 3, "payout": 0}
  ],
  "scatters": {"fs": {"count": 0, "cells": []}, "astro": {"count": 0, "cells": []}},
  "basePayout": 0.6,
  "bonusTriggered": false,
  "bonus": null,
  "totalPayout": 0.6,
  "capped": false
}
```

### 8.2 Bought Free Wishes (3 FS = 10 spins, trimmed: only spin 1 and spin 2 shown, spin 2 cut to 2 of its 4 stages)
```json
{
  "v": 1,
  "cost": 66,
  "ante": false,
  "bought": "fs",
  "initialGrid": [
    [2, 0, 5, 8, 0],
    [7, 2, 0, 2, 8],
    [6, 10, 5, 7, 6],
    [5, 3, 5, 2, 7],
    [4, 5, 10, 10, 2]
  ],
  "trigger": {"type": "fs", "count": 3, "cells": [[2, 1], [4, 2], [4, 3]]},
  "stages": [],
  "cascadeSteps": [],
  "basePayout": 0,
  "bonusTriggered": true,
  "bonusType": "fs",
  "bonus": {
    "kind": "fs",
    "startSpins": 10,
    "spins": [
      {
        "spinIndex": 1,
        "spinsLeft": 9,
        "stages": [
          {
            "stage": 1,
            "mult": 1,
            "grid": [
              [2, 0, 5, 3, 8],
              [4, 1, 5, 7, 3],
              [2, 5, 8, 7, 0],
              [2, 0, 4, 1, 7],
              [4, 6, 7, 7, 2]
            ],
            "sealed": [
              [0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0]
            ],
            "runs": [],
            "exactPayout": 0,
            "payout": 0,
            "newlySealed": [],
            "gems": [],
            "chainTotal": 0
          }
        ],
        "chain": {
          "stages": 1,
          "base": 0,
          "gemSum": 0,
          "gemsOnBoard": 0,
          "gems": [],
          "payout": 0
        },
        "scatters": {"count": 0, "cells": []},
        "multStart": 1,
        "multEnd": 1,
        "uncappedPayout": 0,
        "totalPayout": 0
      },
      {
        "spinIndex": 2,
        "spinsLeft": 8,
        "stages": [
          {
            "stage": 1,
            "mult": 1,
            "grid": [
              [6, 5, 8, 3, 3],
              [7, 8, 2, 3, 4],
              [1, 4, 3, 2, 0],
              [0, 8, 3, 3, 4],
              [2, 3, 9, 4, 1]
            ],
            "sealed": [
              [0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0]
            ],
            "runs": [
              {
                "sym": 3,
                "dir": "v",
                "len": 3,
                "cells": [[2, 2], [3, 2], [4, 2]],
                "wilds": [[4, 2]],
                "pay": 0.02
              },
              {
                "sym": 3,
                "dir": "a",
                "len": 3,
                "cells": [[0, 4], [1, 3], [2, 2]],
                "wilds": [],
                "pay": 0.02
              }
            ],
            "exactPayout": 0.04,
            "payout": 0.1,
            "newlySealed": [[2, 2], [3, 2], [4, 2], [0, 4], [1, 3]],
            "gems": [],
            "chainTotal": 0.1
          },
          {
            "stage": 2,
            "mult": 2,
            "grid": [
              [4, 6, 1, 5, 3],
              [0, 2, 9, 3, 2],
              [0, 0, 3, 3, 4],
              [12, 3, 3, 7, 3],
              [4, 0, 9, 3, 1]
            ],
            "sealed": [
              [0, 0, 0, 0, 1],
              [0, 0, 0, 1, 0],
              [0, 0, 1, 0, 0],
              [0, 0, 1, 0, 0],
              [0, 0, 1, 0, 0]
            ],
            "runs": [
              {
                "sym": 3,
                "dir": "v",
                "len": 4,
                "cells": [[1, 2], [2, 2], [3, 2], [4, 2]],
                "wilds": [[1, 2], [4, 2]],
                "pay": 0.1
              },
              {
                "sym": 3,
                "dir": "d",
                "len": 3,
                "cells": [[1, 2], [2, 3], [3, 4]],
                "wilds": [[1, 2]],
                "pay": 0.02
              },
              {
                "sym": 3,
                "dir": "a",
                "len": 4,
                "cells": [[0, 4], [1, 3], [2, 2], [3, 1]],
                "wilds": [],
                "pay": 0.1
              }
            ],
            "exactPayout": 0.44,
            "payout": 0.4,
            "newlySealed": [[3, 0], [1, 2], [2, 3], [3, 4], [3, 1]],
            "gems": [
              {"r": 3, "c": 0, "value": 10, "isNew": true}
            ],
            "chainTotal": 0.5
          },
          {"…": "stages 3 and 4 omitted in this document"}
        ],
        "chain": {
          "stages": 4,
          "base": 0.7,
          "gemSum": 10,
          "gemsOnBoard": 10,
          "gems": [
            {"r": 3, "c": 0, "value": 10}
          ],
          "payout": 7
        },
        "scatters": {"count": 0, "cells": []},
        "multStart": 1,
        "multEnd": 4,
        "uncappedPayout": 7,
        "totalPayout": 7
      },
      {"…": "spins 3-10 omitted in this document"}
    ],
    "totalPayout": 31.7,
    "scatters": 3,
    "super": false,
    "startMult": 1,
    "multCap": 12
  },
  "totalPayout": 31.7,
  "capped": false
}
```

### 8.3 Bought Astrolabe (3 Astrolabes, 4 spins, a lit core and a magnet)
```json
{
  "v": 1,
  "cost": 43,
  "ante": false,
  "bought": "astrolabe",
  "initialGrid": [
    [3, 7, 5, 2, 4],
    [5, 8, 3, 7, 7],
    [4, 11, 3, 8, 1],
    [4, 1, 6, 2, 11],
    [5, 3, 11, 7, 3]
  ],
  "trigger": {"type": "astrolabe", "count": 3, "cells": [[2, 1], [3, 4], [4, 2]]},
  "stages": [],
  "cascadeSteps": [],
  "basePayout": 0,
  "bonusTriggered": true,
  "bonusType": "astrolabe",
  "bonus": {
    "kind": "astrolabe",
    "startSpins": 4,
    "spins": [
      {
        "spinIndex": 1,
        "spinsLeft": 3,
        "outer": {"idx": 5, "value": 5},
        "middle": {"idx": 2, "value": 1},
        "core": {"idx": 2, "kind": "", "jackpot": 0},
        "magnet": {"outer": false, "middle": false},
        "cash": 5,
        "uncappedPayout": 5,
        "magnetNext": {"outer": true, "middle": false},
        "totalPayout": 5
      },
      {
        "spinIndex": 2,
        "spinsLeft": 2,
        "outer": {"idx": 4, "value": 2},
        "middle": {"idx": 5, "value": 5},
        "core": {"idx": 4, "kind": "", "jackpot": 0},
        "magnet": {"outer": true, "middle": false},
        "cash": 10,
        "uncappedPayout": 10,
        "magnetNext": {"outer": false, "middle": true},
        "totalPayout": 10
      },
      {
        "spinIndex": 3,
        "spinsLeft": 1,
        "outer": {"idx": 3, "value": 3},
        "middle": {"idx": 5, "value": 5},
        "core": {"idx": 5, "kind": "major", "jackpot": 500},
        "magnet": {"outer": false, "middle": true},
        "cash": 15,
        "uncappedPayout": 515,
        "magnetNext": {"outer": false, "middle": true},
        "totalPayout": 515
      },
      {
        "spinIndex": 4,
        "spinsLeft": 0,
        "outer": {"idx": 0, "value": 1},
        "middle": {"idx": 0, "value": 1},
        "core": {"idx": 4, "kind": "", "jackpot": 0},
        "magnet": {"outer": false, "middle": true},
        "cash": 1,
        "uncappedPayout": 1,
        "magnetNext": {"outer": false, "middle": false},
        "totalPayout": 1
      }
    ],
    "totalPayout": 531,
    "scatters": 3,
    "rings": {
      "outer": [1, 2, 1, 3, 2, 5, 1, 4, 2, 10, 3, 40],
      "middle": [1, 2, 1, 3, 2, 5, 1, 2, 10, 25],
      "core": ["", "mini", "", "minor", "", "major", "", "grand"]
    }
  },
  "totalPayout": 531,
  "capped": false
}
```

## 9. Measured math

Numbers from the engine itself (`node tools/sim.js siroccos-lamp-bazaar <mode> <rounds> <seeds>`, sfc32 seeds; 95% CI = larger of round-level and seed-to-seed SE). All payouts are on the 0.1x grid (section 3b); the stochastic rounding keeps the expectation.

| mode | cost | rounds | RTP | 95% CI |
|---|---|---|---|---|
| base | 1 | 208M (4 seeds x 52M), final config | 96.28% | +-0.24 |
| ante "Djinn's Favour" | 2 | 256M (2 x 128M, 96.11 and 96.02) | 96.07% | +-0.19 |
| buy fs | 66 | 16M | 96.37% | +-0.12 |
| buy astrolabe | 43 | 48M | 96.38% | +-0.12 |
| buy super | 105 | 6M (+4M earlier 96.27) | 96.45% | +-0.16 |

Prices: Free Wishes 66x, Astrolabe 43x, SUPER 105x (EV 63.6x / 41.4x / 101x, unchanged by the 0.1x grid). Base: first-stage run hit 29.1% (paid hit rate equals it because a paid stage shows at least 0.1x), bonus 1 in 108 (Free Wishes 1 in 180, Astrolabe 1 in 270). Ante: hit 27.8%, bonus 1 in 40.
How the 0.1x grid works: a stage's exact pay (runs x multiplier, e.g. 0.04) is shown as at least 0.1x; above 0.1x it is rounded up or down with unbiased stochastic rounding. The small-pay inflation (+4.5 points on the base chain) was paid for by lowering the base/ante Wish Gem rate (0.0038 to 0.00316 / 0.0031 per tile) and the ante Free Wishes rate (1 in 65.5), and Free Wishes gem rate 0.00586.

Tail (rounds paying at least X x bet; 20M base, 20M ante, 2M FS buy, 1.2M SUPER buy, 12M Astrolabe buy):

| >= x bet | base | ante | buy fs | buy super | buy astrolabe |
|---|---|---|---|---|---|
| 100 | 1 in 665 | 1 in 276 | 1 in 6 | 1 in 4 | 1 in 16 |
| 500 | 1 in 5.6k | 1 in 2.0k | 1 in 46 | 1 in 24 | 1 in 78 |
| 1,000 | 1 in 22.8k | 1 in 8.2k | 1 in 225 | 1 in 97 | 1 in 221 |
| 2,000 | 1 in 51.5k | 1 in 18.2k | 1 in 2.1k | 1 in 770 | 1 in 225 (GRAND 2,500) |
| 4,000 | 1 in 4M | 1 in 1.7M | 1 in 48k | 1 in 12.5k | 1 in 118k |
| 8,000 (cap) | seen once in 208M | seen 2x in 256M | 1 in 2M | about 1 in 600k | not seen in 48M |

The cap is reachable (Free Wishes at x12-x15 with several high gems) but extremely rare in base. Bounded loops: 25 stages per chain, 40 Free Wishes spins, 8 Astrolabe spins (tested in `tools/sirocco.test.js`). Low symbols pay only from a run of 4 (keeps the first-stage hit rate at 29%).

