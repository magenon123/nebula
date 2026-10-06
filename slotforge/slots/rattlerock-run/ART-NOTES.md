# Rattlerock Run: art notes for kai (leo)
Files (this folder): `symbols.svg` (29 `<symbol>`), `scene.html`, `logo.html`, `frame.html`, `character.html` (empty `#char`), `side.html` (HUD), `info.html`, `slot.css` (ALL art css + embedded fonts; add your own AFTER `/* KAI */`). Card: `/cards/rattlerock-run.webp` (720x944). Generators in `art/` (not needed by the build): `node art/world.cjs && node art/bake.cjs && node art/sprites.cjs && node art/build.cjs && node art/card.cjs`. Check pages: `node art/stage-test.cjs <1|2|3> ["twin exit go"]` -> `art/bake/stage-lvN.png`, `node art/contact.cjs` -> `art/contact.png` (all sprites).
Old look tests are in `test/` (do not use).

## Stage (1600x900), order in the stage: scene, logo, frame, side, character
| piece | box | notes |
|---|---|---|
| `#scene` | full stage, class `lv1`/`lv2`/`lv3` (+ `go`, `twin`, `exit`) | 5 baked WebP layers x 3 palettes, see below |
| `#logo` | (20,16) 380x106 | static SVG (viewBox 680x190). The loading screen clones it big. No animation. |
| `#frame` | (0,0) 1600x820 | clipping window, no art. Contains `#grid` (abs. 1600x820, put cart + pickups here as absolute children in STAGE coordinates) and `#fxl` (z6 overlay for sparks, bursts, pops) |
| `#hud` | (410,12) 1170x84, TOP strip | The shell bottom bar owns y 782-874, so the HUD is on top, right of the logo. Hide `#logo` in the Deep Shaft intro etc. if the shell's `#fsBox` (36,34) collides. |
| `#char` | empty | no side character |
Rail line (cart wheels touch it) = **y 718**. The shell `#msg` (y 728-770) and bar sit over the trestle area, which is only dark void. Cart column x 100-620; pickups come in from x 1640 and go left.

## World layers (all inside `#scene`, absolute at 0,0)
Each layer exists 3 times (`.L1 .L2 .L3`); only the one matching `#scene.lvN` is visible (0.9 s opacity crossfade, hidden ones are `visibility:hidden`, cost nothing). Switch level = change the class `lv1`->`lv2`.
| class | size | scroll | base-speed px/s (V=600) | ratio |
|---|---|---|---|---|
| `.ly-far` (img, opaque, NOT tileable) | 2000x900 | CSS ping-pong drift 0 -> -400px, 140 s alternate, always running (independent of run speed) | ~6 | 0.01 |
| `.ly-farmid` (div, tile) | 3200x900 (bg repeat-x, tile 1600) | `rrScroll` 44.4 s per 1600 px | 36 | 0.06 |
| `.ly-mid` | same | 12.1 s | 132 | 0.22 |
| `.ly-track` | 3200x230 at top:670 (rail at y 718) | 2.67 s | 600 | 1.00 (pickups travel at this speed) |
| `.ly-near` | 3200x900 | 1.78 s | 900 | 1.5 |
| `.ly-track2` | twin lane (below) | 3.7 s | 432 | 0.72 |
| `.ly-exit` | 1600x900 | opacity only | | |
Scroll control, pick one: (a) CSS: add class `go` to `#scene` to run the 5 animations (paused by default; remove `go` to stop); to change speed set `animation-duration` on the layers (duration = 1600 / px_per_s) or `animation-play-state`; (b) JS (recommended for exact sync with pickups): set `style.transform='translate3d(-Xpx,0,0)'` where X = (distance * ratio) % 1600 (track2: % 1152) and remove the CSS animation (`style.animation='none'`). All tiles are seamless at 1600 (checked).
`#scene.twin` shows `.ly-track2`: a second, farther lane (scale .72, rail at y 488, tile 1152). Lane A (near) rail y 718 cart scale 1.0; lane B rail y 488, use scale .72 for cart and pickups.
`#scene.exit`: daylight burst overlay centred on the golden door (1538,650), fades in 0.7 s. Use with `rrDoor` at the end of a run; remove the class afterwards.
Depth palettes: `lv1` blue crystal cavern (teal pool, orange lavafall at left), `lv2` amber/lava forge depths (lava river, lavafall right), `lv3` deep violet + gold vault (molten gold fall, coin heaps on the beams, gilded pillars). Far layer = carved dwarf halls (battered tiers cut into the cliff, grand arched gates, rune bands, warm windows), kept low contrast so pickups pop. Everything animated is cheap; there are no filters/blend modes. `body.lite` pauses the CSS animations (shell rule).
The first `<img>` in `#scene` (far lv1) is what the shell blurs into the page backdrop.

## Sprites (`<svg class="rrs" style="width:Wpx;height:Hpx"><use href="#rrId"/></svg>`, no outer viewBox; the symbol viewBox scales into the css size)
Cart family, viewBox 800x780, origin = cart centre. CSS size 400x390 (class `.rrCart`) puts the wheels on the rail when `top = 331`, `left = cartX - 200` (rail contact is at symbol y 244 -> 387 px). All five share the same cart + heaps.
| id | state / use |
|---|---|
| `rrCartRide` | riding, pointing ahead, grin (idle/run) |
| `rrCartCheer` | after a gem/gold: arms up, laughing, extra gold, sparkles (show ~0.6 s then back to Ride) |
| `rrCartShield` | shield active: hat glows, determined smirk, gripping the rim. Overlay `rrShieldDome` (same box, class `.rrDome` pulses) and drop it when the hat pops |
| `rrCartCrash` | crashed after TNT: tilted, scorched, dizzy, arms out, smoke + flames. Pair with `rrBoom1..3` at the TNT |
| `rrCartWin` | victorious at the door: standing, arms up, nugget held high, confetti |
| `rrSparks` | wheel sparks overlay (same box): toggle opacity/scale on a short loop while moving |
| `rrShieldDome` | translucent gold-cyan dome + hat badge (same box) |
Pickups: viewBox 160x200 (use 100x125 .. 130x163 css), origin = item centre, the value chip sits at +74. Ground shadow is inside; `rrPlate` (120x32) is an optional extra glow-shadow on the rail.
`rrNugget` (small, +load), `rrPile` (240x200, large pile), `rrGem2` green x2, `rrGem3` blue x3, `rrGem5` red x5, `rrGem10` gold x10 (values baked in the chip, font RRNum), `rrHat` (hard hat + SHIELD chip), `rrHatIcon` (140x100 no chip, HUD), `rrTnt` (lit fuse, sparkle top-right at (16,-64); animate with `.rrPick.bob` or scale pulse on the whole symbol), `rrLantern`, `rrFork` (neutral lever, both rails dim), `rrForkL` / `rrForkR` (lever pushed left/right, that branch lit; swap the `href` to flip). `rrDoor` viewBox 460x350, origin = door foot centre (use ~230x175..460x350; foot on the rail), `rrGaugeNeedle` (48x190, pivot at symbol (24,170), rotate around it, points up at 0 deg), `rrGaugeGem` (72x80, used in the HUD bar).
Explosion (3 frames, 520x520, origin = blast centre): `rrBoom1` flash (0-80 ms), `rrBoom2` fireball (80-260 ms), `rrBoom3` smoke + embers (260-600 ms, fade out). Show them in turn at the TNT position, size ~300px.
Splash art (viewBox 600x520): `rrSplashDeep` (3 carts descending the shaft, gems) for the Deep Shaft intro, `rrSplashOutro` (cart win, door light, gems) for the outro. Use `<svg class="rrSplash" viewBox="0 0 600 520"><use href="#rrSplashDeep"/></svg>` (css `.rrSplash` is sized like siroccos' `.sirSplash`, 300x260 inside `#introM/#outroM`). Insert it yourself (the shell has no `#introArt`); gems on the intro medal: `rrGem5` etc.
Big win / MAX WIN: the shell's own screens are used, no extra pieces needed. Level-bottom jackpot door: reuse `rrDoor` + `#scene.exit`.
Ids: every gradient in symbols.svg is `rg*`, every symbol `rr*`; fragment ids `rl*` (logo). No clashes with the shell.

## HUD (`side.html`, `#hud`)
Cells (text elements to write): `#hDepthV` ("120 m"), `#hDistV` ("36 m"), `#hMultV` ("x7"), `#hLoadV` ("12.50"). Add class `pop` to the cell (`#hDepth #hDist #hMult #hLoad`) for 0.45 s when a value changes. Multiplier bar: set `--p` (0..1, e.g. (mult-1)/30) on `#hMult`; the gem slides. Gear cell: `#hl1 #hl2 #hl3` add `on` per lantern collected; `#hShield` add `on` + number in `#hShieldN`. Values use the shell font `--toon`.

## Info (`info.html`)
Placeholders: `[[maxWin]]`, `[[anteCost]]`, `[[buy:deep]]`, `[[buy:motherlode]]`. Pickup table is static (no `#ptab`). Gem text says "adds 2/3/5/10 to the multiplier (starts x1)" (matches the engine). Mentions Deep Shaft (3 carts, 3 levels), Twin Carts, buys, 7,500x.

## Palettes of the card
`/cards/rattlerock-run.webp` 720x944, 100 KB: cheering dwarf in the loaded cart, gems x10/x5/x3/x2, big logo, no footer.

## Not done / for kai
- Door jackpot step numbers: draw as html text over `rrDoor`.
- Fork preview chips (what is behind each branch): use the pickup symbols small next to the lever.
- Level-switch cross-fade also fades the `far` image; the shell backdrop blur always shows level 1.

## RESUME NOTE
All deliverables done and committed (world x3 palettes, 29 symbols, logo, frame, hud, info, card, contact sheet `art/contact.png`). If something must be tweaked: edit `art/world.cjs` (layers/palettes), `art/sprites.cjs` (symbols), `art/build.cjs` (fragments/css), rerun the chain above. scene.html is 1.6 MB (15 WebP layers); lower `q` in `art/bake.cjs` for more savings.
