# Slot #5 concept

(maya: add "Features & Math (maya)" above or below; leo wrote only "Theme & look (leo)")

## Mechanics & math (maya)

All numbers are design TARGETS (budget sketch), final values from `tools/solve.js` + `tools/sim.js`. Written for leo's theme SIROCCO'S LAMP BAZAAR; the mechanic itself is theme-neutral.

### 1. Pitch in 3 lines
1. **SEALED CHAIN**: a 5x5 board. Make 3+ of a kind in a straight line (across, down, diagonal) and those tiles get a gold seal and STAY; every other tile spins again.
2. Each new link in the chain raises the multiplier (x1, x2, x3 ... x5), so one lucky spin can snowball while the sealed board visibly fills with gold.
3. Wish Gems (x2 to x25) lock where they land and multiply the whole chain at the end; the Astrolabe of Wishes bonus (three rotating rings) is the extra hit, plus Free Wishes with a never-resetting multiplier.

### 2. Grid and win rule
- **5 reels x 5 rows**, no paylines, no ways, no clusters. Win = a run of **3, 4 or 5** identical symbols that are neighbours in a straight line: horizontal, vertical or either diagonal. Wild substitutes for pay symbols. Each (symbol, direction) maximal run pays its table value x total bet. A tile may sit in several runs (a plus-shape pays twice), that is intended and capped by the 5x5 size.
- **Chain (the hook):** after the first stage, every tile that was part of a paid run becomes SEALED and keeps its symbol (a sealed Wild stays Wild). All unsealed tiles re-spin (partial respin, sealed tiles do not move). A new stage pays only runs that contain at least one NEWLY landed tile (no double pay of old runs; a run that grows from 3 to 4 pays the full 4-run, the 3-run is not paid twice at the same stage). Stage k pays at multiplier **m_k = min(k, 5)** in the base game. The chain ends on the first stage with no new win, or when the board is full (25 sealed). One round = the whole chain, one request, server returns `stages[]`.
- **Why it is not a clone:** no removal and no refill (EmberClaw/tumble, Sweet-Bonanza style), no fixed ways, no hold-and-win respin counter with cash (Tea House), no pay-anywhere area blocks (Aurora). The unit of play is the growing sealed constellation of tiles; the multiplier rides the chain depth. Chains get easier as the board seals (fewer free tiles but more anchor symbols), which is exactly the snowball players feel.
- Scatters (FS, Astrolabe) and Wish Gems appear only on the first stage of a round in the base game's scatter count, Gems appear on every stage (see roles), scatters are NOT generated on respin stages (no scatter farming).

### 3. Symbol roles (13)
- 9 pay symbols (leo's list): 3 low, 3 mid, 3 high (high = carpet, crown-turban, lamp). Indicative run pays, x bet (3/4/5): low 0.15 / 0.5 / 2; mid 0.3 / 1.2 / 5; high 0.6 / 3 / 15 (lamp 0.8 / 4 / 20). Final from the solver. Run lengths cap at 5 (the grid), so the top single line is 20x before multipliers.
- **Wild "Djinn Seal"**: reels 2-4 only, substitutes for pay symbols, seals like any winning tile. Never substitutes for scatters or gems.
- **Scatter FS** (leo symbol 11): 3+ on the first stage = Free Wishes.
- **NEW symbol 12: Astrolabe** (brass three-ring instrument, it IS the visual of the unique bonus): 3+ on the first stage = Astrolabe of Wishes.
- **NEW symbol 13: Wish Gem** (glowing gem with a number, x2, x3, x5, x10, x25): lands on any stage, is SEALED immediately, does not pay on its own and does not count in runs. When the chain ends and total chain win > 0, the sum of all gems on the board multiplies the chain total (gems ADD, then multiply: gems x2 + x5 = x7). Max 4 gems per spin by the strips (cap on gem count keeps the tail finite). No win in the chain = gems pay nothing (they vanish, visual "fizzle").
  Note: gem multipliers are a market-proven hook (Gates of Olympus orbs, etc.) but here they are STICKY within a chain and join a chain multiplier, different arithmetic and different feel.

### 4. Shared bonus: FREE WISHES (leo name; 3 FS = 10 spins, 4 FS = SUPER "Three Wishes" 12 spins, 5 FS = 15 spins, retrigger +4/+6 with 3+/4+ FS on first stage)
Twist: **THE CHAIN MULTIPLIER NEVER RESETS**. In Free Wishes the chain multiplier m_k does not return to x1 at the start of each spin: it carries over, +1 per winning stage across the entire bonus, up to a cap of **x12** (SUPER starts at x3, cap x15). Spins with no win leave it untouched. Board resets each spin; only the multiplier persists. Wish Gems still multiply the end of each chain. The bonus therefore builds like a rising tension arc and the late spins are where the tail lives; the cap and the 8,000x total cap bound it.
Not a copy: EmberClaw FS = snowballing wild, G&B = Deep Dive depth, Tea House FS = steeping drawers, Aurora FS = lit symbol per spin. This is the only persistent MULTIPLIER-on-the-chain, and only in this slot the multiplier is tied to the chain stage.

### 5. Unique bonus: ASTROLABE OF WISHES (3+ Astrolabes on the first stage)
A giant brass astrolabe fills the screen with **three concentric rings** that spin independently:
- **Outer ring (cash)**: 12 sectors, 1x to 40x.
- **Middle ring (multiplier)**: x1, x2, x3, x5, x10 (x25 rare).
- **Core (the wish)**: a small ring of 8 sectors, mostly empty; a lit sector = jackpot **MINI 25x / MINOR 100x / MAJOR 500x / GRAND 2,500x**.
Spins = astrolabes: 3 = 4 spins, 4 = 6 spins, 5 = 8 spins. Each spin: the rings stop one after another (outer, middle, core, with tension at the core). Spin prize = outer x middle (+ core jackpot ON TOP if lit). Bonus total = sum, then cap 8,000x. Every spin is one weighted draw per ring; the whole outcome list is returned in one response.
- Why different: Tin Rush/Steeping = a cell board with locks and respins; Deep Dive = ordinary spins; Sweep = bands crossing a 5x5 ice sheet; Snowball = wild accumulation. This is a pure instrument-reveal (rings), no board.
- To stop it feeling like a generic wheel: (1) the rings stop one by one with a sound per ring, (2) the core is a separate long-shot moment (a held breath before it stops), (3) between spins any ring that landed on its best third gets a "magnet" glow and gets 2x as likely to land high on the NEXT spin (a cheap, visible streak mechanic, tuned in the tables: it raises variance not RTP; cut if it complicates the engine).
- Server: a single request, no hidden state.

### 6. Extras
- **Bet-up luck toggle "Djinn's Favour"**: cost **2x** bet. In this mode FS + Astrolabe scatter weights are about 3.4x higher (FS roughly 1 in 45, Astrolabe 1 in 75) and the first stage carries a guaranteed free Wish Gem 15% of the time. The base chain pays are lower in the luck strips so the mode still returns 96.0-96.5% of the 2x stake. Own strips and decomposition (rin).
- **Bonus Buy cards** (price x total bet; sign shows no price): **Free Wishes ~85x**, **Astrolabe of Wishes ~58x**, **SUPER Three Wishes (4 FS) ~210x**. Each buy plays a trigger spin that drops the scatters, with the count sampled from the natural distribution conditional on the trigger (not a fixed 3). Every price tuned so the mode is 96.0-96.5%.
- Mid-spin turbo, autoplay, bet grid, big-win tiers, gold MAX WIN screen: shared shell. **No MAX LUCK** (slots 1-2 have it; the 1 in 5 rule says rare).
- Cap **8,000x** (different from 5,000 / 7,500 / 9,500; credible, see tail).

### 7. Volatility, hit rate, tail
High volatility. First-stage win about 27%; any-win round about 30% (chain gives extras); average chain among winning rounds about 1.6 stages. Targets: bonus FS about 1 in 150, Astrolabe about 1 in 260, P(>=100x) about 1 in 450, P(>=1,000x) about 1 in 16k, P(cap) reached in FS with high multiplier + 4 gems about 1 in 3M natural, the buy modes see it far more often (FS buy about 1 in 5k). The cap is reachable by two honest routes: (a) FS late multiplier x12 on a 3-stage chain with a x20 gem total, (b) astrolabe 40x outer x25 middle plus GRAND on top across several spins. If the sim shows the tail is not reachable I lower the cap, not inflate it.

### 8. RTP budget for 96.0-96.5% (normal game, target 96.3%)
| part | share |
|---|---|
| Base game chains (runs x chain multiplier) | 38.5% |
| Wish Gem multiplier contribution inside base | 11.7% |
| Free Wishes (1 in ~150, avg ~48x incl. super 5%) | 30.0% |
| Astrolabe (1 in ~260, avg ~42x incl. jackpot tail) | 16.1% |
Levers: run pay table (payScale), reel strips per column (tile weights decide chain probability), gem weights and values, FS multiplier cap and start, ring tables, jackpot weights, luck-mode strips. Every mode (base, luck, 3 buys) is decomposed separately and checked by seeded sim with confidence margins; buy price = bonus EV / 0.963.

### 9. Engine / shell support needed
- **Engine (rin)**: new, medium. 5x5 run evaluator (4 directions, wild), chain loop with sealed mask, per-stage multiplier, gem sum, FS persistent multiplier, astrolabe draws, caps, 3 buy samplers + luck strips. Round JSON: `stages[{grid, sealed[], wins[{sym,cells,pay}], mult}]`, `gems`, `bonus{...}`.
- **Shell/slot module (kai)**: 5x5 board (check shell grid assumptions, cfg.ownCounter, 3 buy cards as Tea House, luckCost), PARTIAL respin of unsealed tiles (Tea House hold-and-win already does it, reuse), seal overlay with the line link animation, gem collect animation, astrolabe renderer (new, self-contained SVG rings). Perf: keep sealed tile overlays as cheap sprites.
- Art asks to leo: symbols 12 (Astrolabe), 13 (Wish Gem, 5 value skins), seal overlay (gold wax/tile frame), astrolabe bonus scene with three animatable rings.

### 10. Exploits to guard
1. Chain never ends: bounded by 25 tiles and by "pays only runs with a newly landed tile"; hard cap of 25 stages.
2. Scatter farming on respin stages: scatters never generated after stage 1.
3. Double pay of the same run: key = (symbol, direction, start cell, length); only runs with a new tile pay.
4. Gem stacking beyond the tail: max 4 gems per round, gem sum applies only if chain win > 0, total cap 8,000x applied after everything, cap ends the round (client shows MAX WIN).
5. FS multiplier persistence across a retrigger: the cap x12 holds, retrigger does not reset it.
6. Luck-mode / buy mispricing: each mode priced from its own decomposition; no mode >= 100% or far from 96.2%; buy trigger sampled conditionally, not fixed.
7. Client/server desync: stage list is final, client only animates; sealed mask is in the JSON.

### 11. IP check
Nearest commercial: **Jack Hammer 2** (NetEnt, winning symbols stick and the rest respin), **Starburst** (win respins), **Gates of Olympus** (end-of-chain multiplier orbs), **Jammin Jars 2** (sticky multipliers), **Reactoonz/Moon Princess** (cluster/line growth), **Wheel-of-Fortune-style bonuses** (generic wheel). How this differs: 5x5 any-direction runs, seal-everything-that-wins (not just one symbol), chain multiplier tied to stage, gems additive then multiplied, three-ring instrument bonus, persistent FS multiplier. None of these is a clone and none of them is the exact combination; "sticky win respin" is a general idea, not a protected rule as far as I know (I am not a lawyer, owner/counsel should confirm). Theme: a genie/lamp/bazaar is public-domain Arabian Nights; avoid Disney's Aladdin look and avoid names like "Genie Jackpots", "Aladdin's Fortune" etc. Never use the Megaways word.

### 12. Risks
1. Tuning: the chain compounds, so the tail and RTP are sensitive; mitigation: stage multiplier cap x5 and gem count cap, sim early.
2. Players may not see why only the winning tiles stay: needs a clear seal animation and an on-board "CHAIN x3" tag (leo/kai).
3. The Astrolabe bonus can feel like a plain wheel: mitigated by three stops and core moment, but it is the least original part (flag).
4. Sealed tile + partial respin is the heaviest client part, but the Tea House already did partial respins.

---

## Theme & look (leo)

### 1. Theme and name
**SIROCCO'S LAMP BAZAAR** (working slug `siroccos-lamp-bazaar`). A caravan-road bazaar terrace at golden-hour dusk, high above a sea of dunes. Hero side character: **Sirocco**, a lapis-teal djinn who runs the bazaar and grants wishes for a price. Market logic: Arabian Nights is a top Stake/market theme (genie, lamp, carpet, gold) and none of our four slots touches it.

### 2. World and mood
Warm, rich, theatrical, a little mischievous (not scary, not kiddie). The bazaar's top terrace: carved sandstone arch framing the view, hanging brass lamps (unlit), dyed awnings, a minaret-and-dome skyline silhouetted on the far dune ridge, dust haze in the valley. Mood: "the one hour when the market turns magical". Difference from the others: EmberClaw is a dark red forge, Grumble is dark teal sea, Tea House is a pastel morning, Aurora is a cold green-violet night. This is the only HOT, saturated golden-hour world, with a magenta/indigo sky to cool it.

### 3. Palette
Sky top Dusk Indigo `#2a1d5c`, sky mid Plum `#7a2c6e`, horizon Saffron `#ff9a2e`, sun core Hot Cream `#fff0c2`. Sandstone `#c98b55` (lit) / `#5a3a52` (shade, purple not brown). Accent Lapis/Turquoise `#1fa5b8` (Sirocco, tiles, gems), Gold `#f2b53a`, Ruby `#b3203f`. Rule: shadows go cool violet, lights go warm saffron; teal is the only cold accent and is reserved for Sirocco, tiles and the wild.

### 4. ONE light logic
A single low sun, behind-right of the scene, just above the far dunes. Everything is key-lit from the RIGHT and slightly behind (warm saffron rim on right edges, long soft violet shadows falling left and toward the viewer), fill is the indigo sky from upper left. Lamps and lanterns are UNLIT in the base game (no second light source); they only ignite in the bonus, when the sun sets (the bonus background is the same scene one hour later, same light direction logic, moon replaces sun). Every symbol, the character and the plates use the same right-rim / left-violet-shade rule.

### 5. Main side character: SIROCCO
- Personality: a showman-merchant djinn: amused, sly, generous with a price tag. Raised eyebrow, half-smile; theatrical when you win; mock-offended when you lose; truly delighted by big wins.
- Design (reference tier: Zeus.png build + dwarf.png posture): tall adult man, broad shoulders, lean muscled bare torso with gold chest harness and lapis cabochon, teal-blue skin with violet shading and saffron rim light, black pointed beard with a thin gold ring, sharp amber eyes, heavy-lidded; a wrapped silk turban in plum with a gold brooch and a single peacock-style feather; wide gold bracers with engraved patterns, baggy ruby-silk trousers gathered at a gold cuff, the lower body dissolves into a curling smoke tail that spirals back into his brass lamp on the left (hides legs, keeps the silhouette clean). Strong triangular silhouette: wide shoulders, crossed arms, tail spiral at the base. Crisp dark-plum outline-free painted look: shading by value masses, thin 1px darker edge on form turns only, sharp specular on gold, soft on skin.
- Placed in the left/side panel, 3/4 view looking toward the reels.
- States: idle (breathing, smoke tail swirl, slow blink, ring-finger tap on arm), spin (uncrosses arms, hand sweep, smoke puffs), tease (leans in, eyebrow up, one hand cupped to ear), win (arms wide, laugh, gold sparks from bracers), big win (floats up, both hands conjure a gold glyph), bonus (snaps fingers, lamp flares), lose-ish (shrug, eyes roll), plus a splash portrait (bust, hands open, offering).

### 6. Symbols (11, each drawn one by one on a plate with tier rim, contact shadow, right rim light)
Low (bronze rim): 
1. Date bowl: glazed blue-white ceramic with dates and a fig; reads via the pattern glaze + glossy fruit highlights. 
2. Dallah coffee pot: engraved copper with brass spout; reads via engraving + environment reflection stripes. 
3. Glass lantern: faceted coloured glass panes with iron filigree; reads via translucent colour and bright filament-less glow (the pane catches the sun, not an inner light).
Mid (silver rim): 
4. Jambiya dagger: curved blade, jewelled hilt with ruby; reads via steel gradient + engraving line. 
5. Signet ring: gold band, big turquoise cabochon; reads via specular + facet sparkles. 
6. Hourglass: glass vessel with saffron sand stream, carved ebony frame; reads via refraction highlights and fine grain texture.
High (gold rim): 
7. Rolled magic carpet: woven geometric pattern in ruby and indigo with gold tassels; reads via pattern perspective + fringe detail. 
8. Sultan's crown-turban: plum silk with a huge ruby brooch and feather; reads via fabric folds + gem. 
9. Genie's lamp (top pay): ornate gold oil lamp with lapis inlays and a thread of smoke; the hero symbol for the look test.
Specials: 
10. WILD "Djinn Seal": lapis disc, gold crescent and star, glowing teal rim (the only teal glow in the grid). 
11. SCATTER "FS": gold sun-disc with text FS only (owner Round 7), blazing saffron ring.
(maya may add a bonus-specific coin/orb as symbol 12 if her unique bonus needs one; same plate system.)

All symbols: static painted look with gradient masses and hard rim, specular and engraved detail drawn as vector paths; textures (weave, engraving) via small tiled patterns rendered once. Each has its own win motion (lamp tips and pours smoke, carpet unrolls and ripples, dagger flips and sparkles, hourglass flips, coffee pot pours a gold stream, ring spins on its band, etc.).

### 7. Background idea
Looking out from the terrace over a rail: foreground carved sandstone arch with hanging brass lamps and a drape of dyed fabric at the top corners (dark, backlit, soft blur); mid-ground the bazaar rooftops with awnings, domes and a minaret ridge; far a sea of dunes with the huge sun. Layers: sky gradient, sun with bloom, far dune silhouettes (haze), mid skyline, terrace rail and stone floor with tile pattern, foreground arch, dust motes in the sun shaft. Reel window centered and lighter-framed by a carved stone and gold frame so the grid has quiet, mid-value ground behind it. Static layers baked to one bitmap.

### 8. Music and sound (what the synth can do)
Base: 88 bpm, 4/4 with a lilt, **D Phrygian dominant** (D Eb F# G A Bb C), 8-bar loop. Instruments: oud (plucked saw through a quick low-pass, pitch dip, noise click), darbuka (sine pitch-drop "dum" + noise "tek" in a maqsum pattern), ney flute (sine with breath noise and slow vibrato) for the melody, frame drum, finger-cymbal zil taps, low drone on D. Bonus: 116 bpm, same scale, oud 16th arpeggios, riser noise, darbuka fills, extra shimmering pad. 
Signature sounds: (1) **Djinn whoosh**: bandpassed noise sweeping up an octave with a rising 5-note Phrygian bell arpeggio (used on wild landing, bonus trigger, Sirocco conjuring); (2) **Lamp rub**: two detuned glass-harmonic sines (ting) with a zil shimmer, pitch climbing a scale step for each rub or each symbol collected.

### 9. Shared bonuses, themed
Free-spins bonus = "WISHES" (3 FS = Free Wishes; 4 FS = SUPER "Three Wishes"); bet-up luck toggle = "DJINN'S FAVOUR" (2x cost); bonus buy sign = "BONUS BUY" (no price), screen cards on parchment with brass; MAX WIN screen = gold lamp erupting into a gold genie silhouette. Unique bonus: maya's, I theme it (lamp-based assets).

### 10. Honest tech note
Vector/baked bitmap can do hard materials very well (gold, brass, copper, glass, gems, ceramic) and can do a stylised painterly character if shaded in value masses with clipped gradients and noise grain, but not film-quality skin: expect "good 2D game illustration", about 7/10 against Zeus.png and 8/10 on symbols. Weak spots: hands, face micro-expression, fabric folds. Mitigations: crossed arms, hands partly hidden, bold shapes, no tiny detail. Backgrounds: gradients, haze, blurred layers and one baked turbulence texture get a convincing dusk, not a photograph. Perf: static layers rendered once to a canvas; only transforms/opacity animate; dust motes <= 30.
