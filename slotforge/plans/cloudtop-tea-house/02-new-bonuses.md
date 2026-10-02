# Cloudtop Tea House: new bonuses FREE SPINS and SUPER FREE SPINS (design addendum, maya)

Design only. Tin Rush, the 60x Tin buy, the paytable's shape and all Tin Rush numbers stay EXACTLY as in `01-round-format.md`. Everything below is additive. All money = multiples of the base bet. Cap 5,000x for the whole round.

## 1. The mechanic I chose: STEEPING DRAWERS (and why)

The 20 cells are Koji's tansu drawers. In both new bonuses **every drawer remembers how strongly it has been steeped**. A drawer that takes part in a win gets steeped one level darker (tea gets stronger with every infusion). A later line win that runs through steeped drawers pays **more**. Levels persist until the bonus ends. Nothing moves, nothing sticks as a wild, no meter.

Why this and not the other ideas:
| idea | verdict |
|---|---|
| Kites that catch and stay as sticky wilds | rejected: sticky/growing wilds are EmberClaw (wild snowball) and G&B (jelly wilds). Same gamble side. |
| Pouring tea-level meter that raises one global multiplier | rejected: one global multiplier that grows is EmberClaw heat / G&B Tide. |
| Drawers open to reveal prizes (pick bonus) | rejected: no board, no lines, needs per-pick round state, and cash values per drawer is Tin Rush. |
| **Per-drawer steeping, boost lives in the cell, paid per line** | **chosen**: new in the family (EmberClaw/G&B multipliers are global), reads in one glance (drawer colour = strength), uses the existing 5x4 / 30-line board and the existing paytable, tied to the theme (tea steeps), and the tail is controlled by a small level table (no compounding product). |

Kite festival link (look only, no rules): a drawer that reaches its top level pops a small paper kite out of the drawer which flies up and joins the anchored kites in the sky (the sky fills with kites as the bonus goes). Smiling Kite wild keeps its normal role.

## 2. Shared rules (FREE SPINS and SUPER)

- Board and pays: same 5x4, same 30 lines, same paytable (`CFG.pay`), same wild (Smiling Kite, reels 2-4), same Furoshiki bundle flip (one flip symbol for all bundles, then lines are evaluated). Tea Tins do NOT appear in these bonuses (no coinP) so Tin Rush can never start inside them. FS scatters DO appear (retrigger).
- **Steep state:** `level[r][c]` for the 20 drawers, start 0 (Super starts with pre-steeped drawers, section 4). Level table `boost[level]` (extra multiplier points, see per-bonus tables).
- **Spin resolution (exact order for rin):**
  1. Land grid (bonus weights, section 6). Bundles flip. FS scatters counted (retrigger check at the end of the spin).
  2. Evaluate lines as in the base game. For each winning line: `boostSum = sum(boost[level[r][c]])` over the cells that formed that win (len cells, wild cells included, levels as they were BEFORE this spin). Line pays `mult * (1 + boostSum)`.
  3. Spin pays the sum of the lines. (One line, 5 top drawers at max level of the FS table: x21.)
  4. AFTER paying: every drawer that took part in at least one win this spin goes up by exactly 1 level (union over all winning lines, once per drawer per spin), capped at the bonus's max level. Report each change as `levelUps`.
  5. Retrigger check (section 3). Then next spin or end.
- Total of the bonus is the sum of its spin pays, clamped by the cap: `bonus.totalPayout = min(5000 - basePayout, sum)`. The first spin that crosses the remaining cap is the last one (remaining spins are not played, `capped:true`).
- No gamble, no pick, no player decision. Pacing: about 2.5s per spin plus 0.8s of pouring when drawers level up; 10-12 spins plus retriggers is 35-60s, turbo about half.

## 3. Trigger, spins and retrigger

| | trigger | spins | max level | retrigger on a bonus board |
|---|---|---|---|---|
| **FREE SPINS** | exactly 3 FS anywhere on the opening grid | **10** | 3 | 3 FS: +4 spins, 4 FS: +7, 5 FS: +10 |
| **SUPER FREE SPINS** | exactly 4 FS | **12** | 4 | 3 FS: +5 spins, 4 FS: +8, 5 FS: +12 |
| 5 FS (optional tier, my recommendation: define it) | exactly 5 FS | SUPER with **16** spins (12 + 4), nothing else changes | 4 | as Super |

- FS pays nothing by itself in any mode and is a blank for lines (wild does not substitute for it). Any FS count 1-2 is just a tease.
- Retrigger: counted once per spin by the number of FS on that spin's final grid (>= 3). A retrigger NEVER upgrades FREE SPINS to SUPER (4 FS inside FREE SPINS gives +7 spins, not Super). Levels are kept on retrigger.
- Hard belts: max 40 spins total in FREE SPINS, 50 in SUPER (further retriggers pay nothing); the 5,000x cap ends the round first in practice.

## 4. How SUPER differs (clearly richer, same screen language)

| | FREE SPINS | SUPER FREE SPINS |
|---|---|---|
| spins | 10 | 12 (5 FS: 16) |
| start | all drawers level 0 | **Koji pre-warms 4 random drawers at level 2** (shown in the intro, listed in the JSON) |
| level table `boost[0..max]` (start values, rin tunes) | 0, +1, +2, +4 (max level 3) | 0, +1, +3, +6, +10 (max level 4, **gold** drawers) |
| max single-line mult (5 drawers at top, before symbol pay) | x21 | x51 |
| bonus board | wild weight 2 | wild weight 3 (more kites), same bundles |
| retrigger | +4 / +7 / +10 | +5 / +8 / +12 |
| look | dusk sky, lit lanterns | gold-leaf tansu, all kites in the sky lit, Koji in festival hat, deeper music |

Target feel: FREE SPINS average about 24x with many mid results. SUPER averages about 3.2x the FREE SPINS average (about 77x), more swing, same rules, so players learn once.

## 5. Visuals (hand-off to leo/kai)

- Steep levels on the drawer plate: L0 plain cedar. L1 light tea-stain wash + a small steam wisp every few seconds. L2 amber/brown lacquer, tag "+2" (a small paper tag hung on the pull). L3 deep brown with vermilion rim and a kite emblem on the plate (FREE SPINS top level). Super L4 = gold leaf, glowing rim.
- Win: the cloth string runs through the winning drawers as in base. Each steeped drawer on the line flashes its tag; tags add up into a **"x(1+sum)" chip at the end of the string** (e.g. "x8") that multiplies the line amount. Then Koji pours a ladle: drawers that won get one level darker with a pour animation, a glug sound and a short steam burst; a drawer that reaches top level pops its kite into the sky.
- Counter: bonus-owned counter "SPINS LEFT" (cfg.ownCounter); a retrigger shows the extra spins as +N flying into the counter and Koji clapping.
- Intro splashes: FREE SPINS (peach, 3 FS drawers glowing, "10 SPINS") and SUPER FREE SPINS (gold, 4 FS, "12 SPINS", the 4 pre-warmed drawers get poured on screen). Outro: total count-up, big-win/MAX WIN screens as in the other modes.
- Base game: the FS symbol is a plaque showing only the letters "FS" (leo). 2 FS visible after reel 4 = tease (slow last reel, Koji holds his breath, same logic as the tin tease). When 3 FS land the drawers with FS rattle and pop open; 4 FS in gold.

## 6. Base-game changes (math plan for rin)

### 6.1 Scatter symbol FS (id 11) and cell roll
- New symbol `11 = FS`. It pays nothing, is a blank for lines (like Tin), no wild substitution, can land on all 5 reels, never flips from a bundle.
- **Roll order per cell, draw count unchanged: `u < coinP` -> Tin (as now, so the Tin Rush trigger rate is EXACTLY unchanged, 1 in 148); else `u < coinP + fsP` -> FS; else the existing weighted symbol.** (Same single draw per cell; `coinP` branch first so Tin probabilities never move.) FS takes its probability mass from the pay symbols, so the line RTP drops a little and `payScale` is re-tuned.
- **Start value `fsP = 0.018` per cell** (all reels). With 20 cells: P(exactly 3 FS) about 1 in 210, P(exactly 4) about 1 in 2,600-2,800 (0.018) and about 1 in 2,500 at `fsP = 0.0182`, P(5) about 1 in 47,000. P(>=3) about 1 in 195. Tune `fsP` only to hit these (3 FS ~ 1 in 200, 4 FS ~ 1 in 2,500), not to fix RTP; use `payScale` and the bonus knobs for RTP.
- **Priority rule (same spin as Tin trigger):** if `tins >= 6` and `FS >= 3`, **Tin Rush wins**; the FS cells on that grid are rewritten to ordinary weighted pay symbols BEFORE the grid is output (so the player never sees a dead 3 FS), line wins are evaluated on the rewritten grid. Rewrite uses extra draws only in this rare case. FS counts 1-2 are never rewritten. Report how often this happens (expected about 1 in 1-3M spins). Natural trigger of 3 FS and 4 FS are mutually exclusive by definition (exact count decides the type).
- Bonus boards: no tins (`coinP = 0`), `fsPBonus` start **0.026** (about 1.7% retrigger chance per spin; tune so that about 12-15% of FREE SPINS retrigger at least once; report), bundle weight 3, wild weight 2 (FS) / 3 (Super).

### 6.2 RTP budget (all numbers in % of the base bet; rin re-measures the current split first)
Note: `01-round-format.md` says line wins 57.0% and Tin Rush 40.7%, which add to 97.7% not 96.24%; measure the real current split before tuning (I expect lines about 55.5%).

| part | now | target after |
|---|---|---|
| Tin Rush (trigger 1/148, E 57.9x) | ~40.7 | **~40.7 (unchanged, same functions, same coinP/q/weights)** |
| FREE SPINS (1/210 x E ~24x) | 0 | ~11.4 |
| SUPER FREE SPINS (1/2700 x E ~77x, + 5 FS) | 0 | ~2.9 |
| base line wins (incl. bundles) | ~55.5 | **~41.2** (derived: 96.2 - 40.7 - 11.4 - 2.9) |
| total | 96.24 | 96.0-96.5 |

- Base lines drop by about 26%: do it by `payScale` (hit rate is frequency, so it stays about 25%; only the average line win falls). If the base feels too thin, the alternative is lowering the FS bonus E (then bonus buys get cheaper), not touching Tin Rush.
- **Feasibility warning:** FREE SPINS E 24x over 10 spins = 2.4x per spin, which is about 6x the base-game line return per spin. It must come from the steeping multipliers (average boost of 2-4 on winning lines by spin 5-6) plus richer bonus weights. If rin's first sim shows E far below 24x, in this order: raise `boost` for L2/L3, add wild weight, add spins to 12, never raise `fsP`. If E is far above, lower boost for the top level first.
- Hit rate 22-28%: measure `basePayout > 0` per spin (trigger spins still pay their lines). Tin-only and FS-only spins pay no lines.
- Tail not wilder than before (before: P(>=1000x) 1 in 820k spins, cap 0 in 100M spins). Limits for the new total: P(>=1000x per base spin) not worse than about 1 in 500k; P(>=1000x | FREE SPINS) <= 5e-5; P(>=1000x | SUPER) <= 1e-3; cap hits in 100M base spins <= ~40 (Super only). If exceeded, cut the top boost values (3rd/4th level) first, not the base.

### 6.3 Buys (three cards: Tin Rush 60x, Free Spins, Super)
| card | proposed price | what the start is conditioned on | check |
|---|---|---|---|
| TIN RUSH (existing) | 60x | unchanged: natural tin count conditioned on >= 6 | 96.2% as now |
| FREE SPINS | **25x** | trigger spin shows exactly 3 FS (count conditioned = 3 FS, other cells non-special symbols, no tins, no bundles, no wild, no line win, pays 0). Then the normal FREE SPINS function from level 0. | E[buy] = E[natural FREE SPINS] |
| SUPER FREE SPINS | **80x** | trigger spin shows 4 or 5 FS drawn from the natural distribution conditioned on count >= 4 (about 95% 4 FS, 5% 5 FS), then the normal SUPER function including its pre-warm draw. | E[buy] = E[natural SUPER incl. 5 FS] |
- Price rule: `price = round(E_bonus / 0.962)`; the proposals 25x / 80x assume E = 24.0 and 77.0. After tuning, if E/price is outside 96.0-96.5% change either the price (+-1x) or one bonus knob (retrigger spins, wild weight), not both at once. At price 25x the band is +-0.06x of E: expect to nudge the price (24x / 26x) to land inside.
- The conditioned start is the key: a fixed "exactly 3 FS" is correct for FREE SPINS (natural exact-3 is the only way to get it), while Super must keep the 5 FS tail. The buy trigger spin ALSO never contains Tin, bundles or wilds (like the existing Tin buy). Base lines of the trigger spin are 0 on buys.

### 6.4 Sim decomposition rin must report (per seed and pooled, 4 seeds)
1. Per mode (base, buy tin, buy fs, buy super): rounds, RTP mean +-95% CI, per-seed RTP. Target 96.0-96.5% each. Rounds: base >= 4 x 25M, each buy >= 4 x 4M; plus 20M bonus-only rounds for each of FREE SPINS and SUPER.
2. Base split: line wins % of bet, FS-triggered %, Super-triggered %, Tin-triggered % (must equal 40.7 +- noise).
3. Trigger rates: P(3 FS), P(4 FS), P(5 FS), P(tin >= 6), P(2 FS tease), joint suppressed cases per 100M.
4. Per bonus: E[x], median, P(<1x), P(<5x), P(>=100x), P(>=1000x), cap hits per 100M, max observed, avg spins played, share that retriggered, avg final steep level mix, avg boost per winning line.
5. Hit rate, avg line win per hit, Tin Rush E[bonus] unchanged (57.9 +-0.3).
6. Unit tests: see section 7.

## 7. Exploits and edge cases to guard (rules in code and tests)

1. **Tin + FS same spin:** priority table above. Tests: grid with 6 tins + 3 FS gives Tin Rush only and the output grid has no FS; 5 tins + 3 FS gives FS only; Tin rate invariance (pooled sim 1 in 148 unchanged within noise; also same RNG stream of the Tin draws: tin cells identical to the old engine for a fixed seed when fsP = 0).
2. **Retrigger loop:** counted once per spin, spin belt 40/50, cap ends the round; retrigger never upgrades or restarts the level state; tests with forced FS-heavy boards.
3. **Cap:** 5,000x applies to base + bonus together; the crossing spin is the last one; `capped` true; a steeped board cannot pay beyond the cap in the JSON (spin pays clamp at the remaining cap, running total never decreases).
4. **Level-up timing:** pay uses levels BEFORE the spin; level-up after pay; each drawer rises at most 1 level per spin even if on 10 winning lines; cap at max level. Test with one drawer on many lines.
5. **Wild/bundle:** wild never substitutes FS or Tin; a bundle never flips to FS or Tin or wild; bundle flip happens before win evaluation and before level-up counting.
6. **Buy fairness:** conditioned starts (6.3), buy trigger spin pays exactly 0 with no bundles/wild/tin, pre-warm for Super is drawn inside the same function as natural Super (same RNG usage), E[buy]/price in band for all three cards.
7. **FS in base pays nothing:** 1-2 FS tease only; 3+ always triggers (no way to suppress except the Tin priority).
8. **Hit rate drift** after FS takes cell mass: re-check 22-28%.
9. **Client trust:** all spin grids, wins with boost sums, level changes and retriggers come in the JSON; the client animates only.
10. **Bonus buy abuse:** the Super buy is not cheaper than the natural expectation; never allow a buy to start a lower tier than priced.

## 8. Round JSON additions for kai (high level; rin documents the exact shape in 01-round-format.md)

- Top level: `bonusType: null | "tin" | "fs" | "super"` (existing `bonus` stays for Tin Rush; FS/Super use a new `fsBonus`, to keep Tin Rush contract untouched); `fsScatter: {count, cells:[[r,c]...]}` on every base spin (cells of FS; also on the bought trigger spin); `cost` 1 / 60 / 25 / 80; `bought: null | "tin" | "fs" | "super"`.
- `fsBonus`: `{type, startSpins, preSteep:[{r,c,level}] (Super only), spins:[...], totalPayout, extraSpinsTotal}`.
- Each spin: `{spinIndex, spinsLeft, grid, bundle, wins:[{line,sym,len,mult,boost,payout,cells}] (boost = sum of the line's drawer boosts, payout = mult*(1+boost)), levels (20 levels before the spin), levelUps:[{r,c,from,to,popKite}], fsCount, fsCells, retrigger: null|{add, spinsLeft}, payout, runningTotal}`.
- `info()` must expose the level tables, spin counts, retrigger table, fsP-independent rules (kai builds the info screen from it), plus buy prices for the 3 buy cards (`CFG.buy` with keys `tin`, `fs`, `super`).
- The client still needs: new symbol id 11 art (leo), a three-card buy screen, bonus-owned counter (cfg.ownCounter), two intro splashes, drawer level skins, kite-pop animation.

## 9. Open points for the owner / lead
1. Names: "FREE SPINS" and "SUPER FREE SPINS" as screen titles, internal bonus names Steep Spins / Golden Steep. OK?
2. 5 FS tier: recommended as Super + 4 spins (extremely rare). Drop it if the owner prefers 4 = max.
3. Bonus prices 25x / 80x are proposals; final prices follow E after tuning.
4. Base lines weaken from ~55% to ~41% of RTP to pay for the two new bonuses (Tin Rush is untouched). That is the cost of more bonus types; the alternative is a lower FS trigger rate (e.g. 1 in 300) which keeps more RTP in the base.
