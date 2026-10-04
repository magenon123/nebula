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

## 4. A stage (one landing of tiles inside a chain)

```
{ stage: k,                 // 1..25
  mult,                     // multiplier this stage pays at (base game: min(k,5); Free Wishes: the persistent multiplier)
  grid[5][5],               // the board AFTER the tiles landed this stage (sealed tiles unchanged)
  sealed[5][5],             // 1 = tile was sealed BEFORE this stage (it did not move). Every 0 tile fell in new this stage. Stage 1: all 0
  runs: [ { sym, dir:'h'|'v'|'d'|'a', len:3..5, cells:[[r,c]...], wilds:[[r,c]...], pay } ],   // paid runs, pay = x bet BEFORE mult
  payout,                   // = sum(run.pay) * mult
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

### 8.1 Base round, 3 stages, a wild link and a x2 gem (pays 0.40x)
```json
{
  "v": 1,
  "cost": 1,
  "ante": false,
  "bought": null,
  "bonusType": null,
  "initialGrid": [
    [7, 6, 1, 3, 4],
    [3, 9, 6, 4, 2],
    [3, 8, 4, 6, 6],
    [6, 8, 8, 2, 8],
    [12, 1, 0, 0, 7]
  ],
  "stages": [
    {
      "stage": 1,
      "mult": 1,
      "grid": [
        [7, 6, 1, 3, 4],
        [3, 9, 6, 4, 2],
        [3, 8, 4, 6, 6],
        [6, 8, 8, 2, 8],
        [12, 1, 0, 0, 7]
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
          "sym": 8,
          "dir": "v",
          "len": 3,
          "cells": [[1, 1], [2, 1], [3, 1]],
          "wilds": [[1, 1]],
          "pay": 0.05
        },
        {
          "sym": 6,
          "dir": "d",
          "len": 3,
          "cells": [[0, 1], [1, 2], [2, 3]],
          "wilds": [],
          "pay": 0.03
        },
        {
          "sym": 4,
          "dir": "a",
          "len": 3,
          "cells": [[0, 4], [1, 3], [2, 2]],
          "wilds": [],
          "pay": 0.02
        }
      ],
      "payout": 0.1,
      "newlySealed": [[4, 0], [1, 1], [2, 1], [3, 1], [0, 1], [1, 2], [2, 3], [0, 4], [1, 3], [2, 2]],
      "gems": [
        {"r": 4, "c": 0, "value": 2, "isNew": true}
      ],
      "chainTotal": 0.1
    },
    {
      "stage": 2,
      "mult": 2,
      "grid": [
        [1, 6, 0, 4, 4],
        [8, 9, 6, 4, 8],
        [2, 8, 4, 6, 2],
        [4, 8, 8, 0, 0],
        [12, 7, 1, 7, 7]
      ],
      "sealed": [
        [0, 1, 0, 0, 1],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0]
      ],
      "runs": [
        {
          "sym": 8,
          "dir": "d",
          "len": 3,
          "cells": [[1, 0], [2, 1], [3, 2]],
          "wilds": [],
          "pay": 0.05
        }
      ],
      "payout": 0.1,
      "newlySealed": [[1, 0], [3, 2]],
      "gems": [
        {"r": 4, "c": 0, "value": 2, "isNew": false}
      ],
      "chainTotal": 0.2
    },
    {
      "stage": 3,
      "mult": 3,
      "grid": [
        [1, 6, 8, 8, 4],
        [8, 9, 6, 4, 0],
        [6, 8, 4, 6, 3],
        [0, 8, 8, 7, 8],
        [12, 0, 2, 1, 2]
      ],
      "sealed": [
        [0, 1, 0, 0, 1],
        [1, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 0, 0],
        [1, 0, 0, 0, 0]
      ],
      "runs": [],
      "payout": 0,
      "newlySealed": [],
      "gems": [
        {"r": 4, "c": 0, "value": 2, "isNew": false}
      ],
      "chainTotal": 0.2
    }
  ],
  "chain": {
    "stages": 3,
    "base": 0.2,
    "gemSum": 2,
    "gemsOnBoard": 2,
    "gems": [
      {"r": 4, "c": 0, "value": 2}
    ],
    "payout": 0.4
  },
  "cascadeSteps": [
    {"stage": 1, "payout": 0.1},
    {"stage": 2, "payout": 0.1},
    {"stage": 3, "payout": 0}
  ],
  "scatters": {"fs": {"count": 0, "cells": []}, "astro": {"count": 0, "cells": []}},
  "basePayout": 0.4,
  "bonusTriggered": false,
  "bonus": null,
  "totalPayout": 0.4,
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
            "payout": 0.04,
            "newlySealed": [[2, 2], [3, 2], [4, 2], [0, 4], [1, 3]],
            "gems": [],
            "chainTotal": 0.04
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
            "payout": 0.44,
            "newlySealed": [[3, 0], [1, 2], [2, 3], [3, 4], [3, 1]],
            "gems": [
              {"r": 3, "c": 0, "value": 10, "isNew": true}
            ],
            "chainTotal": 0.48
          },
          {"…": "stages 3 and 4 omitted in this document"}
        ],
        "chain": {
          "stages": 4,
          "base": 0.54,
          "gemSum": 10,
          "gemsOnBoard": 10,
          "gems": [
            {"r": 3, "c": 0, "value": 10}
          ],
          "payout": 5.4
        },
        "scatters": {"count": 0, "cells": []},
        "multStart": 1,
        "multEnd": 4,
        "uncappedPayout": 5.4,
        "totalPayout": 5.4
      },
      {"…": "spins 3-10 omitted in this document"}
    ],
    "totalPayout": 39.92,
    "scatters": 3,
    "super": false,
    "startMult": 1,
    "multCap": 12
  },
  "totalPayout": 39.92,
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
    [5, 1, 11, 2, 0],
    [6, 5, 6, 2, 5],
    [4, 3, 0, 1, 8],
    [2, 7, 3, 11, 5],
    [6, 4, 8, 5, 11]
  ],
  "trigger": {"type": "astrolabe", "count": 3, "cells": [[0, 2], [3, 3], [4, 4]]},
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
        "outer": {"idx": 10, "value": 3},
        "middle": {"idx": 1, "value": 2},
        "core": {"idx": 1, "kind": "mini", "jackpot": 25},
        "magnet": {"outer": false, "middle": false},
        "cash": 6,
        "uncappedPayout": 31,
        "magnetNext": {"outer": false, "middle": false},
        "totalPayout": 31
      },
      {
        "spinIndex": 2,
        "spinsLeft": 2,
        "outer": {"idx": 9, "value": 10},
        "middle": {"idx": 0, "value": 1},
        "core": {"idx": 4, "kind": "", "jackpot": 0},
        "magnet": {"outer": false, "middle": false},
        "cash": 10,
        "uncappedPayout": 10,
        "magnetNext": {"outer": true, "middle": false},
        "totalPayout": 10
      },
      {
        "spinIndex": 3,
        "spinsLeft": 1,
        "outer": {"idx": 9, "value": 10},
        "middle": {"idx": 5, "value": 5},
        "core": {"idx": 4, "kind": "", "jackpot": 0},
        "magnet": {"outer": true, "middle": false},
        "cash": 50,
        "uncappedPayout": 50,
        "magnetNext": {"outer": true, "middle": true},
        "totalPayout": 50
      },
      {
        "spinIndex": 4,
        "spinsLeft": 0,
        "outer": {"idx": 4, "value": 2},
        "middle": {"idx": 2, "value": 1},
        "core": {"idx": 4, "kind": "", "jackpot": 0},
        "magnet": {"outer": true, "middle": true},
        "cash": 2,
        "uncappedPayout": 2,
        "magnetNext": {"outer": false, "middle": false},
        "totalPayout": 2
      }
    ],
    "totalPayout": 93,
    "scatters": 3,
    "rings": {
      "outer": [1, 2, 1, 3, 2, 5, 1, 4, 2, 10, 3, 40],
      "middle": [1, 2, 1, 3, 2, 5, 1, 2, 10, 25],
      "core": ["", "mini", "", "minor", "", "major", "", "grand"]
    }
  },
  "totalPayout": 93,
  "capped": false
}
```

## 9. Measured math

All numbers are from the engine itself (`node tools/sim.js siroccos-lamp-bazaar <mode> <rounds> <seeds>`, sfc32 seeds, 95% CI = max of round-level and seed-to-seed SE). Shells: the sim figures are x bet per cost.

| mode | cost | rounds (4 seeds each batch) | RTP | 95% CI |
|---|---|---|---|---|
| base | 1 | 2 x 208M (pooled 416M) | 96.16% | +-0.17 |
| ante "Djinn's Favour" | 2 | 2 x 128M (pooled 256M) | 96.10% | +-0.30 |
| buy fs (Free Wishes) | 66 | 8M | 96.32% | +-0.16 |
| buy astrolabe | 43 | 48M | 96.37% | +-0.12 |
| buy super | 105 | 4M | 96.27% | +-0.20 |

Bonus EVs (x bet, natural scatter mix): Free Wishes 63.6x, SUPER 101x, Astrolabe 41.4x. Buy price = EV / 0.963 rounded: 66 / 105 / 43. Base: first-stage hit 29.0%, bonus 1 in 108 (FS 1 in 180, Astrolabe 1 in 270); ante: bonus 1 in 40 (FS 1 in 65, Astrolabe 1 in 100), hit 27.7%.
Base RTP split: chain + gems about 45.6%, Free Wishes about 35.3%, Astrolabe about 15.3%.

Tail (share of rounds paying at least X x bet; 20M rounds base, 2M FS buy, 1.2M super buy, 12M Astrolabe buy, 20M ante):

| >= x bet | base | ante | buy fs | buy super | buy astrolabe |
|---|---|---|---|---|---|
| 10 | 1 in 67 | 1 in 37 | 1 in 2 | 1 in 1 | 1 in 1 |
| 100 | 1 in 629 | 1 in 271 | 1 in 6 | 1 in 4 | 1 in 16 |
| 500 | 1 in 5,470 | 1 in 2,041 | 1 in 46 | 1 in 24 | 1 in 78 |
| 1,000 | 1 in 22,371 | 1 in 8,160 | 1 in 218 | 1 in 97 | 1 in 221 |
| 2,000 | 1 in 51,546 | 1 in 18,939 | 1 in 2,053 | 1 in 780 | 1 in 225 (GRAND 2,500) |
| 4,000 | 1 in 20M | 1 in 2M | 1 in 37k | 1 in 14.8k | 1 in 118k |
| 8,000 (cap) | not seen in 700M | 1 in 128M (seen once) | 1 in 2M | 1 in 600k | not seen in 48M |

The 8,000x cap is reachable (Free Wishes at x12-x15 with 3-4 high gems; SUPER buy hits it about once in 600k). In the base game it is about 1 in 1e8-1e9, which is a real but very rare event. Max seen in base sims: 7,154x.
Rules the bounded loops rely on: 25 stages per chain, 40 spins per Free Wishes, 8 Astrolabe spins; all tested in `tools/sirocco.test.js`.

Known side effects: low symbols pay only from a run of 4 (a run of 3 of a low symbol does not seal; this is what brings the first-stage hit rate to 29%, with 9 symbols and 4 directions the plain rule would be about 43%). Pays are small at the bottom (3 mid symbols 0.02x) because a chain pays several stages; at stakes below $0.50 the server's cent rounding of tiny wins slightly lowers the RTP (wins under 0.05x at $0.10).

