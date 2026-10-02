# Koji's Cloudtop Tea House: Phase 0 concept (slot #3)

SLUG `cloudtop-tea-house`. Two owners: maya writes "Features & Math", leo writes "Look & Sound". Do not edit each other's sections.

## Features & Math (maya)

Slug `cloudtop-tea-house`. Phase 0, no code. Sections below are maya's; terms follow leo's theme (Tea Tin = Cash Coin, furoshiki bundle = mystery symbol, brass kettle = Collector, Kite Launch = row x2, Tin Rush = bonus name). All money = multiples of the base bet. Symbol ids are the engine contract; leo's names win for display.

### 1. Pitch

A sunny, quiet **5 x 4 fixed-payline** slot (30 lines, left to right; no ways, no clusters, no tumble, no respin chain). The base game is calm and readable: classic line wins, plus **Furoshiki bundles** (mystery symbols that all flip to the same symbol). Paper **Tins** with cash values float up on the reels; six or more start **Tin Rush**, a **link-and-lock hold & win**: tins stay lit, you get 3 respins that reset on every new tin, finished rows light a **Kite Launch** that doubles that row, special tins collect or pay Kite jackpots, and a full board is the Grand Dragon Kite. High volatility but with a **different shape**: bonus every ~1 in 150 spins that pays ~58x on average (frequent, mid-size, spiky), cap **5,000x**. One single Bonus Buy and nothing else (no bet-up mode, no MAX LUCK, no meters).

### 2. Grid, symbols, paytable sketch

Board: **5 reels x 4 rows** (`grid[r][c]`, r 0..3 top to bottom, c 0..4). **30 fixed paylines** (all always active; the bet is the total stake and every pay below is already in **multiples of the total bet** per line win, so there is no per-line stake maths). Wins pay left to right from reel 1, 3 to 5 of a kind, highest win per line, all lines added. Wild substitutes for pay symbols only.

| id | role | name (working) | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 0-2 | low | Dango / Onigiri / Paper Fan | 0.03-0.05 | 0.10-0.16 | 0.30-0.50 (low tier is three symbols, 4-5 of a kind pay) |
| 3-5 | mid | Paper Lantern / Plum Blossom / Iron Teapot | 0.07-0.12 | 0.25-0.45 | 0.9-1.8 |
| 6 | high | Lucky Cat | 0.12 | 0.45 | 1.8 |
| 7 | top | Golden Koi | 0.20 | 0.80 | 4.0 |
| 8 | wild | Smiling Kite wild (reels 2-4 only) | substitutes 0-7 | | |
| 9 | mystery | Furoshiki bundle (see 3) | | | |
| 10 | coin | Tea Tin (cash value, see 4) | pays nothing by itself in the base game | | |

Numbers are a first sketch; final values come from `tools/solve.js` + `tools/sim.js` (section 7). Target: hit rate ~24%, base-only return Rb ~0.53, line wins max ~200x in the base game.

### 3. Base mechanics

- **Furoshiki bundle (mystery):** weight on every reel. After the grid lands, all Furoshiki bundles flip together into one symbol drawn from the pay table (weights favour low/mid; top symbol and wild rare). That single flip is the whole base hook: a spin with 3-5 bundles is the "big spin" of the base game (1 bundle can only upgrade the line it sits on). Chests never turn into Tins or Smiling Kites except as a rare "bundle flips to tin" (see 4, optional knob).
- **Tins in the base game:** they land with `coinP` per cell, carry **no payout in the base game** and never block lines (a Tin is a blank for line evaluation). They are only the trigger. On a spin that lands 4 or 5 tins the client plays the tease (slow drop of the last reel), purely cosmetic.
- **Trigger:** **>= 6 Tins** anywhere on the opening grid starts Tin Rush. The number of tins on the grid is the start of the hold board.
- **No bet-up mode, no buy-rate changes** in the base game: one RNG path, easy to verify.

### 4. Bonus: LANTERN LIFT (hold & win / link-and-lock)

State: 20 cells, each empty or holding a **Tin** (value or special), `respins` counter (starts 3).

1. **Start:** the trigger tins lock with values. Each tin value is drawn from a weight table (multiples of total bet): 1 (45), 2 (25), 3 (12), 5 (8), 8 (4), 15 (2), 40 (0.6). Specials from the special table can replace a value draw (probabilities small, tuned): **Collector** (Koji's brass kettle; on landing it adds the sum of all tin values currently on the board to its own value; once per Collector), **Mini 10x / Minor 25x / Major 250x (bronze/silver/gold tea tins)** (fixed jackpot tins, worth that many x bet).
2. **Respin:** every empty cell independently becomes a tin with probability `q` (about 0.08). Each respin where **at least one** tin lands resets `respins` to 3, otherwise `respins` drops by 1. The round ends at 0 or when the board is full.
3. **Kite Launch rule (the hook):** the moment a row (5 cells) is complete, that row's **Kite Launch** lights: every tin in that row is multiplied **x2 once** (jackpot tins included). Row-completion order does not matter; a second completion of the same row is impossible (rows are done once). The client plays a gate-lighting sweep.
4. **Grand Dragon Kite:** all 20 cells filled = pay the board total plus a **Grand bonus of 500x** bet (the capped ceiling in the sketch; exact value tuned so the full-board tail stays within cap). Reaching the cap ends the round at **5,000x** (maxWin).
5. **Payout:** sum of all tin values after Kite Launches, plus Grand bonus. No multipliers beyond Kite Launch x2, so the tail is controlled by `q`, the special table and the 20-cell ceiling, not by compounding.
6. **Pacing:** each respin <= ~1.3s (turbo ~0.6s); a bonus is about 8-25 respins. Long tail bonuses (many respins) are rare, so the average screen time stays low.

Feasibility check (throwaway scratch simulation, not engine code): with `coinP=0.09` per cell the trigger is ~1 in 147; with `q=0.08` and the weights above the bonus averages **~58x** (q 0.06: 40x, q 0.1: 83x; the scratch tail already reached ~780x without specials or Grand). So the 96.2% target is reachable by tuning `coinP`, `q`, values and the special table alone.

### 5. Extras (owner menu: 1-2 per slot)

1. **Single Bonus Buy:** ONE price (about **60x**), one card on the buy screen. It plays a visible trigger spin (the 6+ tins land, no line wins, no Furoshiki bundles) and then the normal Tin Rush. The sampled start must be the **natural trigger distribution conditioned on >= 6 tins** (not a fixed 6), otherwise the buy returns less than a natural trigger and RTP drifts. Price is set so E[bonus] = 0.962 x price within +-0.5%.
2. **Furoshiki bundle mystery symbols** (part of the base hook).
Not used, on purpose: **bet-up/chance mode** (E and G&B both have one), **MAX LUCK** (E and G&B both have it; owner rule is ~1 slot in 5, so slot #3 skips it and a later slot, e.g. #5 or #6, can carry it), premium 500x buy, risk-it ladder (needs multi-request round state that engine API v1 does not have; parked, see section 9).

### 6. Comparison table

| | EmberClaw | Grumble & Brine | #3 Koji's Cloudtop Tea House |
|---|---|---|---|
| Grid | 6x5 | 5x3 | **5x4, 30 fixed lines** |
| Win type | cluster 5+ | 243 ways | **paylines** |
| Base mechanic | tumble + heat meter | drifting wilds with growth + respin chain | **Furoshiki bundle mystery flip (all bundles become one symbol)** |
| Bonus | free spins, persistent heat | free dives, Tide multiplier | **hold & win (link-and-lock) with row Kite Launches and jackpot tins** |
| Extras | Forge Fever (bet-up 3x), 2 buys, MAX LUCK | Deep Pressure (bet-up 2x), 2 buys, MAX LUCK | **one buy (~60x), mystery flips; no bet-up, no MAX LUCK** |
| Volatility shape | high, long cluster tail | high, 26% hit, rare deep dive | **hit ~24%, bonus ~1 in 150 paying ~58x avg, ~43% of RTP in bonus** |
| Max win | 9,500x | 7,500x | **5,000x** |
| RTP every mode | 96.0-96.5 | 96.0-96.5 | **96.0-96.5 (base, buy)** |

### 7. Math plan (how RTP is hit and verified)

Modes: `base` (natural play) and `buy` (single buy). Two modes only, so the engine has no ante.

1. **Decomposition first.** RTP = Rb + S, S = P(trigger) x E[bonus]. Target total 0.962: Rb ~0.53 (base line wins incl. bundles), S ~0.43 (F ~ 1 in 147 x E ~58 = 0.395; final F and E are tuned together). Buy price P = E[B]/0.962 (E~58 -> P ~ 60x, rounded; tune E to 0.962 x P).
2. **Knobs (in order):** `payScale` for lines only; `coinP` (trigger frequency); `q` and value weights (E[bonus]); special table; Grand bonus; bundle flip weights. Never edit two of these at once between sim runs.
3. **Tools:** `tools/solve.js` for the exact line-pay part Rb (enumerate 5 reels x symbol weights per line; mystery flip handled by enumerating the single flip symbol). `tools/sim.js cloudtop-tea-house base|buy` for totals. The bonus-only expectation E[B] is measured by running the bonus function alone from the conditioned trigger (20M bonus rounds is cheap, no spin cost), because bonus variance is the problem.
4. **Evidence required (owner rule):** >= 2M rounds per mode, 4 seeds, report mean +- 2 sd per mode; plus 20M bonus-only rounds; report hit rate, P(bonus), E[bonus], P(>=1000x), cap hits per 100M, max observed. Target: every mode lands in 96.0-96.5% with the confidence interval inside or touching the band; if a single seed swings, trust the pooled decomposition.
5. **Buy fairness test:** mode `buy` RTP (no base-game trigger, price 60x) must be 96.0-96.5% on pooled 4 seeds, and bought E[B] must equal natural E[B] to within sim noise (same function, conditioned start).
6. **Unit tests (for rin, to be written from this list):** payline evaluation on hand-built grids, wild only substitutes pay symbols, bundle flips are one symbol, tin is a blank in lines, respin reset logic, row Kite Launch applies once, cap clamps the round, buy trigger spin pays exactly 0 and shows no bundle.

### 8. Edge cases and exploits to guard

- **Buy returns more than it costs:** conditioned start distribution, same bonus function, price tested (section 7.5). A fixed "exactly 6 tins" start would under-pay; "free extra tins" would over-pay. Both are blocking.
- **Kite Launch double-count:** a row doubles once; Jackpot tins in a Kite Launch row double once; Collector counts the board at landing (before later Kite Launches) but Kite Launch multiplies the Collector's value too. The definition must be in code and tests, not just text.
- **Collector + Kite Launch + Grand stacking:** worst case is bounded by cap; the engine clamps at `maxWin = 5000` at every step and reports `capped`.
- **Same-spin Tin and line win:** a spin can win on lines AND trigger; both pay (lines first, bonus separate). The cap applies to the whole round (base win + bonus).
- **Chest flip to wild/tin:** bundles never flip to Tin (would change trigger probability). A bundle flipping to Smiling Kite is excluded unless the base RTP check shows it is intended (default: excluded, wild stays natural only).
- **Respin infinite loop:** each respin resets only on a new tin; board has 20 cells, so at most 20 tins -> bounded. Add a hard max of 60 respins as a belt.
- **Client trust:** the whole tin board sequence (per respin: new cells, values, specials, row Kite Launches) comes in the round JSON; the client only animates (rule 1).
- **Autoplay/turbo timing** with long bonuses: no change in logic, but the long-tail bonus can be 40+ respins; pacing budget in 4.6.
- **Hit rate drift:** with no wins on Tin-only spins, hit% must stay 22-28%; check with `sim` hit counter (`basePayout > 0`).

### 9. Open questions

1. @leo: theme names and the art for Tin (value written on it), Furoshiki bundle, Smiling Kite, Kite Launch (4 rows -> 4 gates), jackpot kites. Does the 5x4 board fit the shared 1600x900 layout frame (680x408 for G&B)? Say the frame size you want.
2. @lead/@rin: confirm engine API v1 can return the tin-bonus board sequence in the round JSON (arrays of respin steps) and that a **single** buy mode is OK for the shell (buy screen with one card); confirm sim modes `base` and `buy` only.
3. Owner: README rule 6 still lists a bet-up mode and two buys for every slot; OWNER-PREFS Round 5 allows 1-2 extras. This concept uses one buy + mystery, no bet-up. Confirm that is the intent.
4. Owner: risk-it ladder (gamble) is parked for a later slot because it needs round state across requests. OK?
5. Volatility feel: hit 24% and bonus 1 in 150 is flatter than E and G&B tails; if the owner wants it wilder, raise the Kite Launch multiplier to x3 and lower `q`.

## Look & Sound (leo)

### 1. Theme pitch
A tea merchant's shop perched on a cliff ABOVE the clouds, at sunrise during the kite festival. The reels are the merchant's **tansu**: a tall wall of 20 little lacquered drawers (5 x 4) that open to show what is inside. Koji, a plump and sleepy tanuki, runs the shop. Everything here is soft, bright and airy: paper, lacquer, steam, cloth, wind. It is the first daylight slot of the family (EmberClaw is a dark forge, Grumble & Brine is a dark seabed lit by one lamp).

Mood: **calm, cosy, quietly festive**. Winning feels like a good morning, not a battle.

How it differs from the other two (look/sound only):
| | EmberClaw | Grumble & Brine | Cloudtop Tea House |
|---|---|---|---|
| world | volcano forge | sunken harbour | cliff above the clouds |
| light | dark, fire glow | dark teal, one lamp | bright morning, pastel |
| hero | dwarf (smith) | crab (grumpy captain) | tanuki (sleepy shopkeeper) |
| palette | red, orange, charcoal | teal, amber, coral | pink, sky blue, matcha, cream, vermilion |
| music | anvil, brass, drums | sonar, brass bell, bubbles | koto, shakuhachi, wood block, taiko |
| tone | boasting | grumbling | gentle, polite, teasing |

### 2. Name and logo
**KOJI'S CLOUDTOP TEA HOUSE**, short form **TEA HOUSE** on tight spaces.
Logo idea: a hand-painted wooden shop sign (the "noren" cloth and a hanging board). Line 1 "CLOUDTOP" in thick brushy cartoon letters, cream fill, thick indigo outline, vermilion offset shadow, each letter slightly rotated; the O is a rising sun disc with a tiny kite tail. Line 2 "TEA HOUSE" on a noren cloth strip (indigo cloth, cream letters, two slits, frayed bottom edge, gently swaying in the wind). A small kite hangs off the end of the last letter on a string. No bubbles, no dots; the only motion is the cloth swaying and the kite tail fluttering.

### 3. Character: Koji the tanuki
Plump raccoon-dog shopkeeper with a straw hat pushed back, a dark-blue apron with a tea-leaf crest, a wooden ladle, a round belly and a big curled tail that he drums like a tsuzumi when happy. Personality: **sleepy, kind, a bit lazy, proud of his tea, secretly a show-off**. Drowsy eyes (half lids) in idle, wide round eyes in wins. Says little, hums.
Animation states (named groups, each hand-keyed with anticipation/overshoot, no generic pulse):
- `idle`: slow breathing, head nods off then jerks up, tail sways, steam from his cup.
- `spin`: slaps the counter bell once (anticipation: lean back, ladle up), then peeks at the drawers.
- `win`: pours a cup with a flourish, ears wiggle, tail thump-thump. Scaled by win size (small nod to big double-pour).
- `big`: jumps with the hat flying off and landing back on, belly drum with both paws, tail spins.
- `special` (tin lands, bundle unties, kite launch): gasps, cheeks puff, points; on KITE LAUNCH he runs holding the string.
- `tease` (2 tins landed, 3rd drops slowly): holds his breath, eyes bulge, paws clasped, then exhales (or slumps) on result.
- `bonus` (Hold & Blast): headband tied on, sleeves rolled, ladle as a baton, bobbing to the taiko; outro bow.
- `maxwin`: gold hat, tail drum solo, Grand dragon kite behind him.

### 4. Symbols (11), each wins with its own hand-made motion
Dark ink outline, flat colour, hatch shading. Each sits on a small drawer-front plate with a tier-coloured rim. Distinct silhouette AND hue.
| id | name | role | look | win motion |
|---|---|---|---|---|
| s0 | Dango | low | three-ball skewer pink/white/green | wobbles on the stick, balls hop one after another from bottom, bite mark appears |
| s1 | Onigiri | low | white triangle, black nori strip, pickled plum | squeezed by two paws (squash), pops back, plum blinks as an eye |
| s2 | Paper Fan | low | indigo fan, white crane, bamboo ribs | snaps open from closed with a flap sound, flutters twice, cherry petals slide off |
| s3 | Paper Lantern | mid | vermilion chochin, black rim, tassel | swings like a bell on its string, flame wakes inside, ribs flex |
| s4 | Plum Blossom | mid | dark twig with pink blossoms | blossoms burst open one by one, twig springs back |
| s5 | Iron Teapot | mid-high | matcha-green teapot, bamboo handle | lid rattles, steam puff, pours a thin stream, spout wiggles |
| s6 | Lucky Cat | high | white maneki-neko, red collar, gold bell | beckoning paw waves with pendulum snap, bell rings, winks |
| s7 | Golden Koi | top | orange-gold koi in a blue bowl | leaps out in an arc with splash, loops, dives back, bowl rocks |
| s8 | Smiling Kite | WILD | diamond kite, happy face, long tail | whips up on wind, loops, tail curls into the shape of the substituted symbol |
| s9 | Furoshiki Bundle | Mystery | patterned cloth knot bundle | knot wobbles, unties, cloth flaps off and reveals the symbol |
| s10 | Tea Tin (Cash) | coin/scatter | round lacquer tin with value stamp | lid pops with a clink, value flips up on a card |
Bonus-only variants of the tin: Collector = big brass kettle (boils, lid hops, steam collects every tin); Mini/Minor/Major = bronze/silver/gold tins; the Grand is the DRAGON KITE. Hue spread: pink, white, indigo, vermilion, magenta-pink twig (dark), green, white+gold, orange, yellow-green kite, patterned cloth, red-brown lacquer. Greyscale check: triangle, fan arc, stick, round lantern, branch, teapot, cat, fish, diamond, bundle, circle: all different.
Connections (winning paylines) are physical: a hand-drawn paper string / ribbon of tea cloth threads through the winning drawers in order.

### 5. Scene / background (detailed, nothing floating)
One light direction: low morning sun from upper left. Back to front:
1. **Sky**: soft peach to pale blue gradient, a big low sun disc partly behind a ridge, hand-painted banded clouds (layered, flat, ink edges lightly broken).
2. **Far mountains**: three misty blue-violet ridges with a pagoda and a rope bridge, a small village lit with morning haze. Sea of clouds below with gaps.
3. **Cliff and shop**: the shop is built on a stone ledge with wooden pillars, a tiled roof (green-grey tiles with hatching), paper sliding doors, bamboo gutters. The tansu wall is the board frame, built into the back wall: dark wood with brass fittings and drawer pulls.
4. **Ground details (all on the ledge, with contact shadows)**: a stone lantern, a bonsai pine on a stand, a wooden bench with a folded blanket, a stack of tea crates, a drying rack with tea leaves, a rope tied to a post that runs up to the kites. Each has a reason: it is the shop yard.
5. **Kites in the sky (anchored)**: 5 to 6 festival kites flying on strings that reach down to posts on the ledge. They sway on their strings; nothing floats loose.
6. **Light**: warm light shafts through the paper doors, a soft sun glow, steam rising from the kettle on the brazier. Wind motion only on cloth (noren, banners, kite tails, hat string). No bubbles, no dots, no particles in the background. Bonus mode: dusk-orange sky, paper lanterns lit along the eaves, the same props.

### 6. Colour palette
| role | name | hex |
|---|---|---|
| outline ink | Indigo Ink | `#1c2340` |
| sky 1 | Morning Peach | `#ffd9b8` |
| sky 2 | Pale Sky | `#9fd3ee` |
| mountains | Mist Violet | `#8d93c9` |
| wood | Cedar Brown | `#7a4a2e` (light `#c18a55`) |
| tiles / matcha | Matcha Green | `#79a85a` |
| accent 1 | Sakura Pink | `#f59db8` |
| accent 2 | Vermilion Lacquer | `#d9432e` |
| accent 3 | Tea Gold | `#e9b43c` |
| paper | Washi Cream | `#fbf1dc` |
| UI plaque | Dark Cedar `#3a2a22`, trim Brass `#c9a24a` |
Hatch is Indigo Ink at 35 to 50%. Paper grain overlay allowed, no halftone.

### 7. Music
Base game: **92 bpm**, light swing, **D Hirajoshi** (D E F A Bb), 8-bar loop. Koto = plucked triangle/saw through a quick low-pass with a pitch dip and a short noise click (karplus-like), playing a slow ostinato; shakuhachi = sine with slow vibrato plus band-passed breath noise, long phrases every 4 bars; wood block (short high sine/square "tok") on the off-beats; soft finger-snap shaker (filtered noise) for texture; a low bowed drone on D. No drums except a very light taiko on bar 1.
Hold & Blast: **128 bpm**, same scale but driving: taiko (sine pitch drop plus noise) on 1 and 3 with ghost notes, koto arpeggios in 16ths, a rising riser whenever respins run low, wood block ticks; the loop adds a layer each time all 3 respins reset.
Stingers: win jingle (3 koto notes up), big win (shakuhachi cry plus taiko roll), bonus intro/outro, Grand (temple bell plus full taiko and koto glissando).
Music has its own on/off and volume.

### 8. Three signature sound moments
1. **Tin lock**: each tin slamming into its drawer is a wooden "clack" plus a small bell "ting" whose pitch climbs one pentatonic step per tin, so a full board plays a rising scale.
2. **KITE LAUNCH** (a row is completed): a windy noise sweep rising with a shakuhachi note, a quick string "twang", a taiko hit as the kite leaves, then the row's tins count up with clinks.
3. **Mystery bundle untie**: cloth rustle (filtered noise flutter), a soft "pop" and a koto glissando that lands on the revealed symbol's note.
Also: temple bell plus taiko roll for the Grand dragon kite, kettle whistle for the Collector.

### 9. UI copy tone
Warm, polite, gently teasing, short. Tea-house manners, never shouting. Examples: spin button "POUR", autoplay "Auto-pour", bonus intro "Kite weather!", "Shall we fill every drawer?", respins left "3 pours left", outro "A fine harvest.", tease "Almost... just one more tin", big wins: Warm Cup 5x / Full Pot 10x / Grand Feast 25x / Dragon Festival 100x, Max win "THE DRAGON FLIES". Buy sign: "BONUS BUY" only (no price). No sarcasm, no gambling pressure copy.
