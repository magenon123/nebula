# Arctic Aurora Lodge: art notes for kai (leo)
Files: `symbols.svg`, `scene.html`, `logo.html`, `frame.html`, `character.html`, `side.html`, `sweep.html` (extra fragment: insert after side), `info.html`, `slot.css` (ALL art CSS incl. embedded Cinzel 700/900 fonts; append your own after `/* KAI */`). Generators + bakes in `art/` (not needed by the build): `node art/build.cjs` (symbols+winvars), `node art/scene.cjs && node art/terrain.cjs && node art/bake.cjs && node art/scene-html.cjs && node art/frame.cjs && node art/frame-html.cjs`, `node art/c2/bake.cjs all && node art/c2/assemble.cjs` (v3 characters; art/char.cjs is the old v1 generator, do not run it, it would overwrite character.html with v1), `node art/side.cjs`, `node art/logo.cjs`, `node art/sweep.cjs`, then `node art/css.cjs` (re-assembles slot.css from art/*.css parts; edit the parts). Order in the stage: scene, logo, frame, character, side, sweep.

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

## Old Kalle Havu `#char` (v4, replaces Aino + Tuuli, which were thrown away on the owner verdict)
Ice-fisher / lodge keeper: wolf-fur hat (one flap tied up, owl feather, brass aurora badge), big white walrus moustache + beard with a braid, pipe (ember + smoke), rust reindeer parka with Sami trim, mittens + antler knife on the belt, fur mukluks, a glowing aurora char on a line in the right hand, ice-spud pole with the hurricane lantern (live `#s5`) beside him. No companion (cost). Variety vs other slots: human old trapper (no dwarf/crab/tanuki/genie).
Pipeline `art/c3/` (do NOT run art/char.cjs, art/c2/*, or art/css.cjs, they would overwrite this or kai's CSS): `parts.cjs` (SVG parts; helpers in `lib.cjs`: outline + flat fill + 2-tone offset-crescent shadows + highlight + cyan aurora rim + warm lodge bounce; fur tufts; face vector in `face.cjs`), `node art/c3/bake.cjs` (WebP bakes to c3/out), `node art/c3/assemble.cjs` (writes character.html, splash-sym.txt and splices ainoSplash/ainoSplashSuper into symbols.svg), `node art/c3/install.cjs` (char4.css -> art/char.css and splices slot.css char section only, KAI part untouched). Test: `node art/c3/test.cjs out.png 1 "idle@300,win@700,big@1100" [clip] [refs]` (needs the built standalone).
Same API: slot.json states unchanged; idle = no class. Layers: `#cBackS` (corona/rays, snow), `#cPropS` (pole+lantern), `.cLG`, `#cAll>#cKalle>#cBodyS #cArmLS #cArmRS(cFish) #cHeadS`, `#cFrontS` (snow, `#cBang`). Pivots in char4.css.
| class | meaning |
|---|---|
| `spin` | looks up, brows up, right hand hoists the char a little, fish swings after |
| `win` | belly laugh (beard jaw bobs, hat/feather lag), right arm throws the glowing char overhead, fish whips |
| `big` | 3 hops, both fists up, corona + rays, fish whirls |
| `special` | LEFT fist shoots up beside the hat (face stays clear), O mouth, "!" pops |
| `tease` | frozen, eyes wide, fists tense; `exhale` (hit) hop + laugh, `slump` (miss) head drops |
| `bonus` | heaves the char overhead, glow x2, lantern flare, corona |
| `bonusmode` / `maxwin` | corona hum + nod on 84 bpm / both fists up, corona full, laughing |
Splash: `ainoSplash`/`ainoSplashSuper` (ids kept) = waist-up portrait via `<use>` of the live images (Super: corona + left fist up + laugh). Size stays in kai's CSS.
Idle cost: only compositor transforms (breath, head/arm sway) + small repaints (fish pendulum, feather, smoke, ember, lantern). character.html ~190 KB.

## Perf / bake notes
Idle (software renderer, 1600x900, rAF counter, 4 s windows): **34-39 fps** on this machine (shell grain overlay not included in my test page; the shell's full-screen grain can cost ~5 fps more). Measured cost: each aurora curtain layer ~7 fps, so there are TWO (`.cu.c1`, `.cu.c2`); remove one (`display:none`) if a device is slow. Window flicker + smoke + flakes ~8 fps together (`#scene .flakes{display:none}` first). Symbol animations are released only on `.hit`. Scene/frame are bitmaps: re-run the art scripts to change them (they need Chromium via Playwright). No SVG filters at runtime anywhere. Standalone page weight: symbols 424 KB, scene 614 KB, frame ~150 KB, fonts 35 KB.

## Honest weak spots
- Aino: reads as a stylised toy/3D-render doll, ~5/10; arms are tube-like (stiff), face is clean/cartoonish; fur is outline tufts + strokes (fine at distance). Silhouette is stable in all states, but the raised-arm paths sweep across the face in `special`.
- Tuuli the husky is the best of the two (6-7/10); legs are simple.
- Silver Fox reads close to a wolf; knife/kettle/compass/lantern/goggles/crystal/gem are strong (7-8/10).
- Frame looks like a plain timber picture frame with iron gussets (6/10). Pines are flat silhouettes (5/10), mountains now natural (7/10).
- Blocks: the symbol sits inside the ice with veil + veins but is not truly refracted. Block win animation is only a shine + the symbol's motion.
- Splash portraits and the Sweep sheet were rendered/checked only partly (sheet CSS reviewed in code, not screenshotted in motion).
- Not done: win-connection art (not needed), bonus-mode scene beyond the violet tint, music/sfx spec.

## Honest critique v4 (Kalle)
Strong readable silhouette, characterful face (moustache, pipe, hat) and story props (catch, lantern pole), distinct from other slots. But it is in the raccoon tier at best (about 6/10), clearly below dwarf/Zeus in painterly depth: shading is offset-crescent cel shading (graphic, a bit sticker-like, cyan rim is uniform), torso is boxy and the sleeves are sausage-like, hands are mitten blobs, the face is small (about 40 px) so expression is limited, raised arms bend stiffly. Next step if wanted: hand-painted fold shapes on torso/sleeves, a narrower waist, bigger face with painted brows, per-edge rim variation.
