# Arctic Aurora Lodge: art notes for kai (leo)
Files: `symbols.svg`, `scene.html`, `logo.html`, `frame.html`, `character.html`, `side.html`, `sweep.html` (extra fragment: insert after side), **`flare.html` (NEW fragment: insert after sweep, last in the stage)**, `info.html`, `slot.css` (ALL art CSS incl. embedded Cinzel 700/900 fonts; append your own after `/* KAI */`). Generators + bakes in `art/` (not needed by the build): `node art/build.cjs` (symbols+winvars), `node art/scene.cjs && node art/terrain.cjs && node art/bake.cjs && node art/scene-html.cjs && node art/frame.cjs && node art/frame-html.cjs`, `node art/char.cjs` (bakes the character bitmaps, ~10 s), `node art/fox-bake.cjs` then `node art/build.cjs` (fox + blocks), `node art/ribbon.cjs`, `node art/side.cjs`, `node art/logo.cjs`, `node art/sweep.cjs`, then `node art/css.cjs` (re-assembles slot.css from art/*.css parts; edit the parts). Order in the stage: scene, logo, frame, character, side, sweep.

## Stage geometry (1600x900)
| piece | box | notes |
|---|---|---|
| `#scene` | full stage | ONE baked WebP bitmap (mountains, lodge, lake) + 2 aurora curtain bitmaps + window flicker + chimney smoke + 12 flakes. `#scene.bonus` = flared violet aurora (1.6 s fade). |
| `#logo` | 450,-10 660x150 | static, sheen sweeps |
| `#frameArt` | img at 430,148 700x596 | baked WebP frame |
| `#frame` | **BOARD AREA 468,184 624x520**: **6 cols x 5 rows, 104x104 px cells** (right edge x=1092, bottom y=704). Contains `#grid` (css grid 6x5), `#fxl` (z6 overlay), `#frameFx` (svg 624x520, empty) |
| `#aura` | 306,190 114x510 | side meter (see below) |
| `#sweep` | 468,194 624x500 | Aurora Sweep ice sheet (5x5 cells of ~94 px at 536,200) |
| `#char` | 1120,340 480x410 | Aino + Tuuli, bottom at y=750 (above the spin ring at 752) |
Msg line (shell, y 728) sits just under the frame. Lodge (right, x 1180+) and mountains are behind the board/characters; nothing important is hidden by shell UI.

## Symbols (viewBox 128x128, `<svg class="g"><use href="#sN"/></svg>` inside `.cell`)
| id | name | role |
|---|---|---|
| s0 s1 s2 | Antler Knife, Iron Kettle, Wool Mittens | low |
| s3 s4 s5 | Snow Goggles, Brass Compass, Hurricane Lantern | mid |
| s6 s7 | Silver Fox, Snowy Owl | high |
| s8 | Aurora Crystal | top |
| **s9** | Aurora Orb with `WILD` banner | WILD (single tile only) |
| **s10** | Ember sphere with ONLY the text `FS` | SCATTER (free spins) |
| **s11** | Aurora Gem (cut gem, no text) | Aurora Sweep trigger (4+) |
| s12 | Prism | Sweep sheet "prism" cell (+1 crossing); also used in `#sweep` |
Plates are CSS from the symbol id (`.cell:has(use[href="#sN"])`, tiers: low blue, mid teal, high violet, s8 aurora, s9 gold, s10 ember orange, s11 mint-violet).
**Giant blocks:** symbols `b2_N` (2x2) and `b3_N` (3x3), N = 0..8 (pay symbols only), viewBox 100x100: one carved ice block (bevel, frost veins) with the symbol frozen inside, win = shine sweep + symbol's own win motion. Use a single `.cell.b2` / `.cell.b3` with inline `style="grid-column:C/span 2;grid-row:R/span 2"` (3 for b3) and `<svg class="g"><use href="#b2_6"/></svg>`. The cells under the block must NOT be rendered. CSS removes the plate for b2/b3 and sizes the svg to the full span.
**Win motions:** inside each `<symbol>`, gated by `--win/--delay/--spd` exactly like the Tea House (released by `.cell.hit` or any container with class `winAnim`; the idle board runs ZERO animations). Length 1.1 s x --spd, one shot. s0 knife flips/glints, s1 lid rattles + steam + tilt, s2 mittens clap + snow puff, s3 lenses flash, s4 needle spins and settles, s5 flame flares + swing, s6 fox head tilt/ears/blink/sniff, s7 owl head tilt/blink/wings spread, s8 crystals ring + beam sweep, s9 ribbons swirl + star flare + banner pulse, s10 flames flare, ball hops, FS pulses, embers rise, s11 gem hops, sheen, sparkle, s12 prism turns.
Cell classes (slot.css): `.cell`, `.hit`, `.focus` on `#grid`. Drop / out / land animations, `.lit` (Aurora Muse highlight), VFX layer (`#fxl`), connection lines are NOT drawn (no lines in this game); for "lit symbol" simply add a CSS class of your own (suggest an animated ring in `#fxl`).

## Side meter `#aura`
`.g1..g8` sockets: add `on` as Aurora Gems (s11) land (4 = Sweep starts, socket 4 is gold-ringed). `#aura.fs` + put `<use href="#sN"/>` into `svg.litSym` to show the LIT symbol (free spins); call `.litBox.pop` for a pop-in. Remove `fs`/`on` between rounds.

## Aurora Sweep `#sweep`
5x5 `.sc[data-r][data-c]`. `#sweep.on` fades the sheet in over the board. Per cell: `.melt` (thaw) + text in `.val` (e.g. `12x`), `.prism` (+ `.melt`) shows s12, `.empty`, `.x2..x5` crossing chip. Bands: append `<div class="band row r2 go">` / `col c1 go` / `dg1 go` (down-right) / `dg2 go` into `#sweepBands`, remove after 1.1 s; melt the cells under it when the band is mid-way (~0.45 s).

## Aino and Tuuli `#char` (REDONE, realistic bake version, round 10)
Same API as before: slot.json `char: {el:'char', states:['spin','win','big','special','tease','bonus','maxwin','exhale','slump'], bonusClass:'bonusmode'}`. Idle = no class (breathing, blink, tail wag, ear twitch, breath fog, lantern-glow flicker, braid sway). Element ids unchanged (`#cAino #cHead #cArmL #cForeL #cArmR #cForeR #cBraid #cMouth .m0/.m1/.m2 #cDog #cDHead #cDTail #cDEarL/R #cDJaw .jc/.jo #cFog #cBang #cCorona`). NEW: `#cLant` (lantern, hangs from the left hand; it counter-rotates when the arm lifts) and `#cFlame`.
| class | meaning |
|---|---|
| `spin` | looks up (head tilts, pupils and brows lift), right arm lifts a little with the forearm lagging, dog lifts its head (.95 s) |
| `win` | smile, right arm swings out to wave (forearm waggles with lag/overshoot), body sways, Tuuli yips (jaw open overlay, head bobs, tail whip) 1.5 s |
| `big` | 3 hops with squash/stretch, both arms up and out (+-150 deg, forearms flap, lantern stays upright, braid swings), aurora corona + rays flare, dog hops, 3.2 s |
| `special` | **arm now points up and OUT to the right (-140 deg) and never crosses the face**, "!" pops, O mouth, 0.9 s |
| `tease` | hold: eyes wide, tiny O mouth, brows up, dog crouches, ears flat; add `exhale` (hit) or `slump` (miss) before removing |
| `bonus` | 1.4 s intro: raises the lantern to her chest (arm + forearm, lantern keeps hanging), glow rises, corona, dog jumps. Then the shell keeps `bonusmode`: corona hums, head nods on 84 bpm, fast tail |
| `maxwin` | hold: arms wide (+-125 deg), lantern raised, corona full + rays, both look up, dog howls |
`--spd` on `#char` for turbo. **What changed in the art (honest summary):** Aino is now ~7.3 heads tall with natural shoulders/limbs, a painted face (iris/pupil/catchlights, lids, lashes, brows made of strokes, nose, lips with 3 baked mouth states, skin gradients, aurora rim + lantern warm bounce), a fur hood built from ~8,000 fine strands in layers, a wool parka with seams, stitching, hem trim, belt, knit mittens, fur-lined boots, a real braid and a hurricane lantern. Tuuli is a sitting husky with a mask, blue eyes, layered fur strands, ruff and bushy tail. All of it is **baked WebP bitmaps** (parts in `<defs>` of `#cBackS`, ids `cp*`, referenced with `<use>`), so there is no filter at runtime. Layers: `#cBackS #cAinoS .cLG #cDogS #cFogS #cFrontS`, idle repaints only the small layers. character.html is now **~650 KB** (was 90 KB). Rebuild: `node art/char.cjs && node art/css.cjs`.
**Splash portraits:** `symbols.svg` holds `<symbol id="ainoSplash">` and `ainoSplashSuper` (corona + rotating rays), viewBox `40 6 420 360` (unchanged size, so kai's `.ainoSplash` CSS keeps working). They are now a **bust portrait** (Aino from the belt up, Tuuli's head) with a bottom fade mask; they `<use>` the baked images of `character.html`, so that fragment must be in the page.

## Giant blocks, Silver Fox, trees, frame (round 10)
- **s6 Silver Fox**: new fox (orange-silver coat, big upright triangular ears with black backs, slit pupils, narrow white muzzle, white-tipped bushy tail). 4 baked bitmaps inside the symbol (head, 2 ears, tail) + vector eyes/nose. Win motion keeps its names (head tilt, ears, blink, sniff, sparkle) and adds a tail wag. symbols.svg grew to ~690 KB. Rebuild: `node art/fox-bake.cjs && node art/build.cjs`.
- **b2_N / b3_N blocks**: the symbol is now truly frozen: a refracted ghost copy (offset, enlarged, dim), a blue `mix-blend-mode:color` tint, caustic lines, rimmed bubbles, hoarfrost corners, glass planes. **Win motion** (same trigger as before: `.cell.hit` or `.winAnim`): the block pulses and wobbles, the tint melts away (the symbol "thaws" to full colour), the ghost snaps into register, glowing cracks run across the ice, four glints pop, the rim glows, then a shine sweeps. No other change for kai.
- **Pines**: replaced by layered spruces (branch limbs, needles, snow lying on the boughs, aurora rim light), baked into `trees.webp` (250 KB).
- **Frame**: carved timber panels (Nordic diamond chains on the posts and top beam, sun-wheel roundels on the bottom beam), hammered iron straps, forged brackets with scrolls and bosses, lumpy snow, varied icicles, hoarfrost in the window corners. Same geometry (board area unchanged).

## FLARE sweep (new, `flare.html` + css in slot.css)
`<div id="flare">` is a full-stage overlay (1600x900, `display:none` when idle, z-index 40). Insert **after `#sweep`**. To play: `flare.classList.add('go')` (optionally `rev` for right-to-left), remove `go` after ~2.4 s x `--spd` (set `--spd` on `#flare`; it defaults to 1). To replay, remove the class, force a reflow (`void flare.offsetWidth`), add it again. It is a wide aurora ribbon (two layers, parallax) crossing the whole stage in 2.2 s, a mint bloom flash at mid-way and a 34-star sparkle trail; pure transform/opacity, nothing runs when idle. Suggested use: when Aurora Sweep starts and for each band that melts the sheet, plus the MAX WIN moment.

## BONUS scene look (`#scene.bonus`, kai already toggles it)
In addition to the violet tint: a third aurora curtain (`.cu.c3`, screen-blended) fades in, the other two go additive, a 44-flake snowfall (`.snowB`, runs only in bonus) and a warm light bloom around the lodge windows plus a green lake glow (`.bGlow`) fade in over 1.6 s, window flicker gets faster. Nothing to wire beyond the class that already exists. `#scene` fragment is now ~1 MB (curtain 3 + snow + new trees).

## Perf / bake notes
Idle (software renderer, 1600x900, rAF counter, 4 s windows): **34-39 fps** on this machine (shell grain overlay not included in my test page; the shell's full-screen grain can cost ~5 fps more). Measured cost: each aurora curtain layer ~7 fps, so there are TWO (`.cu.c1`, `.cu.c2`); remove one (`display:none`) if a device is slow. Window flicker + smoke + flakes ~8 fps together (`#scene .flakes{display:none}` first). Symbol animations are released only on `.hit`. Scene/frame are bitmaps: re-run the art scripts to change them (they need Chromium via Playwright). No SVG filters at runtime anywhere. Standalone page weight: symbols 424 KB, scene 614 KB, frame ~150 KB, fonts 35 KB.

## Honest weak spots
- Aino and Tuuli are now painted semi-realistic characters, but they are still **stylised 3D-render quality, not photographs**: the face is small at game size (about 45 px tall), the skin is smooth airbrushed gradients, sleeves are simple tapered limbs with seams and folds (the elbow bend is slight), fabric is a mottled texture rather than a weave, the fur is strand clumps with a slightly "bristly" look. Tuuli reads as a fluffy husky, somewhat puppy-like.
- Raised arms are rigid rotating bitmaps (no deformation at the elbow beyond the two-segment overlap).
- Silver Fox reads as a fox now; fur is the same strand style. Blocks: the freeze effect is layered vector tricks (no real refraction). Win-state blend modes (`mix-blend-mode:color/screen`) only run while a block is winning.
- Flare and the bonus look were checked in still frames and 3 time steps, not on a real device. fps (software renderer, 4 s windows, test page with scene+frame+char): old character 40-45, new 41-43 (no regression).
- Not done: win-connection art (not needed), music/sfx spec.
