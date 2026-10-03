# Slot #4: three finalist pitches (maya mechanics & math, leo theme & realistic look)

Owner direction (Round 9): detailed, REALISTIC art (no doodle); every slot has the SHARED bonuses plus its OWN unique bonus. Design only, nothing is built. Every number below is a design TARGET (my budget sketch), not a measurement; final values come from `tools/solve.js` + `tools/sim.js`. Rules for all three: max win 5,000-10,000x, every mode (base, luck, each buy) 96.0-96.5% RTP, all money in multiples of the total bet, cap ends the round.

Themes (agreed with leo in #planning): **A** Crimson Orchid (Victorian glasshouse at night), **B** Gilded Departure (1920s luxury night train, alpine snow), **C** Arctic Aurora Lodge (polar night, aurora as the single light).

Each pitch has two headings: "Mechanics & math (maya)" and "Theme & realistic look (leo)". Do not edit each other's heading.

## What "shared bonuses" means here (same package in all three, themed per pitch)

| shared piece | what is reused | what each pitch re-themes / twists |
|---|---|---|
| Free-spins bonus ("FS", 3 FS scatters) | shell spin counter, retrigger display, splash intro/outro, big-win tiers | each pitch gives it ITS OWN twist (listed per pitch) |
| Bet-up luck toggle (2x cost, bonus much likelier, 96% in that mode too) | shell `cfg.luckCost` | name, sign and FX per pitch |
| Bonus buys | shell buy screen, buy cards, trigger-spin that drops the scatters | one card per bonus (FS + the unique bonus), prices set so each is 96.0-96.5% |
| Turbo (mid-spin), autoplay, bet grid | shell | none |
| Big-win tiers + gold MAX WIN screen | shell | pitch-specific art/sound |
| MAX LUCK | NOT in any of the three (owner: about 1 slot in 5; slots 1-2 have it) | |

## Comparison with slots 1-3 (variety rule, Round 5)

| | #1 EmberClaw | #2 Grumble & Brine | #3 Tea House | **A Crimson Orchid** | **B Gilded Departure** | **C Arctic Aurora** |
|---|---|---|---|---|---|---|
| Grid | 6x5 | 5x3 | 5x4 | **3 growing to 8 reels x 4** | **6 reels, 2-7 rows each spin** | **6x5** |
| Win type | cluster + tumble | 243 ways | 30 lines | **ways, board grows per win** | **variable ways (up to 117,649)** | **pay anywhere with giant blocks** |
| Main mechanic | tumble + heat | drifting jelly wilds | mystery bundles | **growing reels chain** | **reactive carriage heights** | **colossal 2x2 / 3x3 blocks** |
| Unique bonus | wild snowball FS | Deep Dive | Tin Rush hold&win | **Bloom Wheel (3 rings)** | **Station Run (route map)** | **Aurora Sweep (crossing bands)** |
| Max win | 9,500x | 7,500x | 5,000x | 5,000x | 10,000x | 7,500x |
| Volatility / hit rate | high | high, 26% | high, 24% | medium-high, ~40% | very high, ~30% | medium, ~36% |

---

# PITCH A: CRIMSON ORCHID (growing reels)

## Mechanics & math (maya)

**Main mechanic: Growing Vine.** The board starts at 3 reels x 4 rows (64 ways, 3+ of a kind from the left). Every spin that wins grows the vine: one NEW reel is added on the right (up to 8 reels x 4 rows = 65,536 ways) and ALL reels re-spin for free. The chain ends on the first spin with no win. Pays are per way, by length 3..8 of a kind (lengths 6-8 are new, big tiers). Round pays the sum of all chain spins.
- Not a copy: no tumble/removal (EmberClaw), no wilds that move (G&B), no cash/hold board (Tea House). The board geometry itself changes with wins, which none of them do. Win test is always on the first 3 reels, so P(chain continues) = p stays constant (target p ~ 0.40); long boards are reached by streaks, and the tail is geometric, easy to tune and to cap.
- Wild: Dew Orchid, reels 2+ , substitutes for pay symbols. Pay symbols: 4 low (leaf/fern/ivy/snail shell), 3 mid (watering can, brass key, hothouse lamp), 2 high (night orchid, Dr. Ivy's locket).
- Scatters: **FS** (free spins) and **Night Bloom** (unique bonus), both count on any chain spin; neither pays or grows the vine.

**Shared bonus: FREE SPINS "Overgrowth"** (3 FS, 10 spins; 4 FS = 12 spins + vine starts at 5 reels; retrigger +5). Twist: **the vine never resets**. It starts at the opening size, every winning FS spin adds a reel (no free re-spin chain; one spin = one result) and a dead spin does NOT shrink it. Late spins are on 7-8 reels where the 6-8 of a kind tiers live. Tail is controlled by the length pay table and the reel cap of 8, no compounding multipliers.

**Unique bonus: BLOOM WHEEL.** 3+ Night Bloom = the glasshouse's central orchid opens a **wheel of three concentric petal rings**: outer ring = cash (5x to 200x), middle ring = multiplier (x1 to x10), core = jackpot gem (Mini 20x / Minor 100x / Major 1,000x / Grand 5,000x). 3/4/5 blooms = 3/4/5 wheel spins. Each spin: the three rings stop independently; prize = outer cash x middle multiplier; core lights only on a rare alignment and then pays the jackpot ON TOP. Sum of spins is the bonus.
- Why not a copy of Tea House's Tin Rush or Steeping: no board, no cells, no locks, no respin counter; a pure result-reveal with three independent stops. It is the only bonus of the four that is a wheel.
- Server: single draw per wheel spin (3 weighted tables), outcome is the full list, client animates. No multi-request state.

**Luck toggle "Extra Growth"** (2x cost): board starts at 4 reels and FS / Bloom scatter weights about 3x higher; base line pays unchanged. Because the start is 4 reels the first-win pays are bigger, so the pay table for 3-of-a-kind steps is not changed but the luck mode has its own reel strips (rin tunes).
**Buys:** FS ~80x, Bloom Wheel ~55x (each one a trigger spin dropping scatters, sampled from the natural trigger distribution conditioned on the trigger, NOT a fixed 3).

**RTP budget (target, normal game):** base chain 52.0% (chain-weighted: first win 40% of spins, average chain ~1.7 spins), FS (1 in ~150, avg ~42x) 28.0%, Bloom Wheel (1 in ~230, avg ~71x incl. jackpot tail ~4%) 16.3% = ~96.3%. Levers: payScale, p (reel strips of the first 3 reels), FS/Bloom weights, wheel tables, jackpot weights.

**Engine / shell support needed:** engine = easy (ways evaluator already exists in G&B; add per-length pays and the chain loop; round JSON `chain[]` of boards with a growing width). **Shell/slot.js: board width changes during a round** (3 to 8 reels, cell size shrinks or the board scrolls). That is the one non-trivial client item; it lives in the slot module (kai), not the shell. Wheel needs a new renderer (SVG rings), self-contained.

**Risk:** (1) client layout of 8 reels at phone width (cells get small; fallback: cap at 7 reels). (2) "Infinity Reels" (iSoftBet) is a known commercial mechanic of the same family; I am not a lawyer, owner or counsel should check that growing-by-win reels is OK, our version (right-side growth, sums per way, own pay lengths) is a variant but not unrelated. (3) Wheel bonuses can feel generic; mitigated by three rings that stop one by one and the core-gem alignment moment.

## Theme & realistic look (leo)

_leo fills this section._

---

# PITCH B: GILDED DEPARTURE (reactive carriage heights)

## Mechanics & math (maya)

**Main mechanic: Carriage Heights.** 6 reels, each reel is one carriage whose number of compartments changes every spin: 2 to 7 rows (weighted, avg ~4.5). Win = 3+ of a kind on adjacent reels from the left, ways = product of the heights (up to 7^6 = 117,649). Pay per way by length 3..6.
- Not a copy: G&B is a FIXED 243-way 5x3 board with drifting wilds; here the number of ways is itself random every spin and the board is irregular (the board is a train). No wild movement, no tumble, no chain. The pay structure feeds the volatility: most spins are small, a 7-7-7-7-7 spin is the monster.
- Wild: Steam Conductor Whistle on reels 2-5, substitutes. Scatter: **FS**. **Ticket** scatter starts the unique bonus. A few compartments show a **locked trunk** (a symbol that stays blank for the evaluation) to keep the average ways under control.

**Shared bonus: FREE SPINS "Alpine Climb"** (3 FS, 10 spins, retrigger +5, 4 FS = 12 spins). Twist: the **minimum compartments of every carriage rises** by 1 after each winning FS spin (2, 3, 4 ... up to 6). The train literally climbs, windows get taller, ways get larger; a dead spin does not lower it. Cap 10,000x binds the tail.

**Unique bonus: STATION RUN (route map).** 3 Tickets start it. A 10-station line map is drawn at random from a prize table; the train begins with 3 **Coal** (steps) and every step it moves 1-3 stations (server draw). Stations: cash 1-60x (most), +1 coal, x2 multiplier on all later cash, Switch (jump 3 stations), Water Tower (cash x coal left), **Terminus** at station 10 (pays 500x, 1,000x or 2,000x, drawn per round). Ends at Terminus or coal 0. 4/5 Tickets give 4/5 starting coal.
- Why not a copy: the board is a path with a token, no respins/locks (Tin Rush), no per-cell level (Steeping), no wild (Dive). It is the only bonus that is a journey.
- Server: the whole run (map, rolls, prizes) is drawn in one request and replayed; the map is public in the JSON.

**Luck toggle "First Class"** (2x cost): FS and Ticket weights ~3.3x, heights skew taller by one weight step (more ways), pay table unchanged.
**Buys:** FS ~90x, Station Run ~70x.

**RTP budget (target):** base 48.5% , FS (1 in ~180, avg ~55x) 30.5%, Station Run (1 in ~320, avg ~58x with Terminus tail 6%) 17.3% = ~96.3%. Levers: height distribution, payScale, Terminus prize weights and coal count, cash table.

**Engine / shell support needed:** engine ways evaluator with per-reel row counts (small change to G&B's evaluator); route map is new but plain data. **Client: irregular board rendering (reels of different height, cells re-flow each spin)** is the biggest task of the three pitches, in the slot module; shell fixed 5x? assumptions must be checked by kai. Map renderer new.

**Risk:** (1) HIGHEST of the three: the variable-height ways mechanic is the "Megaways" family from Big Time Gaming (patented, licensed to others); we must not use the name and the owner/counsel should decide if we can ship a variant at all. Fallback ready: fixed 6x4 with carriage "extra compartments" added to a few reels (ways 4^6 -> bounded) which loses most of the hook. (2) 117,649 ways inflates the tail: capped at 10,000x; sim must confirm P(>=1000x). (3) Largest client work.

## Theme & realistic look (leo)

_leo fills this section._

---

# PITCH C: ARCTIC AURORA LODGE (colossal ice blocks, pay anywhere)

## Mechanics & math (maya)

**Main mechanic: Colossal Ice Blocks.** 6x5 grid. Symbols land as single cells or as **giant blocks** of 2x2 (area 4) and 3x3 (area 9) frozen into one symbol (blocks never overlap, may sit anywhere inside the grid, cut-off at the edge is not allowed). Win = **8+ cells of area of the same symbol ANYWHERE** (no adjacency, no lines): 8-9, 10-11, 12-14, 15-19, 20+ tiers pay as a multiple of the bet. A 3x3 block of one symbol alone already counts 9, so a lucky block is an instant win. One evaluation per spin; no tumble, no refill.
- Not a copy: EmberClaw is cluster + tumble + heat (adjacent clusters removed, refilled, meter). Here nothing is removed or chained, adjacency does not matter, the unit of win is AREA and the hook is the block size. No Drift, no ways, no lines.
- Wild: Aurora Spirit (single cell only, counts for any symbol, not part of blocks). Scatter: **FS** (free spins). **Aurora Gem** (4+) starts the unique bonus.

**Shared bonus: FREE SPINS "Aurora Muse"** (3 FS = 10 spins, 4 FS = 12, retrigger +5). Twist: every FS spin the aurora **lights ONE symbol** (announced before the reels stop): for that symbol the win threshold drops from 8 to 5 cells and its blocks count double area (a lit 3x3 = 18). Nothing persists between spins and no meter; the lit symbol is a weighted draw, high pays lit rarely. Tail from the tier table + doubled blocks, cap 7,500x.

**Unique bonus: AURORA SWEEP.** 4+ Aurora Gems freeze the screen into a 5x5 sheet of ice hiding values (cash 1-40x, empty, a few "prism" cells). The aurora then makes N sweeps (N = gems, 4 to 8): each sweep is a glowing band over a random row, column or diagonal that melts the ice under it and reveals the cells. **A cell melted by several bands pays its value x the number of bands that crossed it**, prisms add +1 to that count. Payout = sum of revealed values with crossing counts. All draws in one request (band sequence + cell table).
- Why not a copy: Tin Rush is lock + respins + a board that fills; Steeping is a per-cell level over several spins. Here there are no respins, nothing stays, the payoff comes from where the fixed number of bands CROSS. The hook is watching the bands converge on a big cell.
- Server: choose cell table, then bands by weights; payout is deterministic from the two.

**Luck toggle "Northern Lights"** (2x cost): block probability up (more 2x2/3x3 on the opening grid) and Gem/FS weights ~3x; payScale for the lower tiers unchanged, rin tunes the strips so the mode is 96.0-96.5%.
**Buys:** FS ~70x, Aurora Sweep ~55x.

**RTP budget (target):** base 61.0% (hit rate ~36%, frequent medium wins), FS (1 in ~170, avg ~28x) 16.5%, Aurora Sweep (1 in ~220, avg ~42x) 19.0% = ~96.5% before tuning, set to ~96.2%. Levers: block probabilities per size, area tier table, lit-symbol table, sweep value table, number of bands.

**Engine / shell support needed:** the least: grid fixed 6x5 (no shell change), block placement is a generator (no overlap), area counting is a map-reduce over symbols, round JSON `grid` + `blocks[{sym,r,c,size}]`. Client: draw big symbols across several cells (kai in the slot module). Sweep screen is a fixed 5x5 reveal.

**Risk:** (1) pay-anywhere with big symbols is also used by other studios; our difference is area counting and no refill, but it must not feel like "Sweet Bonanza without tumble": the block moments must be visually huge (leo). (2) Aurora Sweep is a reveal-grid, easier to find generic; crossing is the saving hook. (3) Medium volatility is the lowest of the three; max win 7,500x comes from the Sweep and the lit 3x3 FS.

## Theme & realistic look (leo)

_leo fills this section._

---

# Recommendation (maya)

Ranked by: distinctness from slots 1-3, hook strength, build and IP risk, and fit for a realistic look.

1. **C Arctic Aurora Lodge** (build first). Lowest engine and shell risk (fixed 6x5 grid, easy tuning), clearest difference from the owner's family of "gamble sides" (area anywhere + crossing bands), and the best match for realistic art: ice blocks, fur, brass, aurora as one real light source makes big blocks look spectacular. It gives the portfolio a medium-volatility, high-hit-rate slot, which slots 1-3 (all high) lack.
2. **A Crimson Orchid.** The strongest idea for a visible hook (the vine and the board visibly grow, the wheel is a great bonus moment), medium engine risk; costs: a variable-width board in the client, and an IP check on growing-reel mechanics. Take it if the owner prefers drama over safety.
3. **B Gilded Departure.** Highest ceiling (10,000x) and a fantastic realistic setting (mahogany, brass, velvet), but the most expensive client work (irregular reel heights), the largest tail-risk to tune, and the clearest IP flag (variable-height ways). I would only build it with an explicit owner OK on the IP point; otherwise reuse its theme with a different mechanic later.

Open questions for the owner: (1) is one slot of medium volatility welcome, (2) should the unique-bonus buy cards show names only (no multipliers) like the sign, (3) IP comfort on A and B mechanics.
