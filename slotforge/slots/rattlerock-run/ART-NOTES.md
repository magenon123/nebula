# Rattlerock Run: art notes for kai (leo)
Files (this folder): `symbols.svg` (114 `<symbol>`), `scene.html`, `logo.html`, `frame.html`, `character.html` (empty `#char`), `side.html` (HUD), `info.html`, `slot.css` (ALL art css + embedded fonts; add your own AFTER `/* KAI */`). Card: `/cards/rattlerock-run.webp` (720x944). Generators in `art/` (not needed by the build): `node art/world.cjs && node art/bake.cjs && node art/sprites.cjs && node art/build.cjs && node art/card.cjs`. Check pages: `node art/stage-test.cjs <1|2|3> ["twin exit go"]` -> `art/bake/stage-lvN.png`, `node art/contact.cjs` -> `art/contact.png` (all sprites).
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

## World layers (REVISION 2: tall art, vertical camera, wide windows)
All world art is now **tall**: 1600 x 1950 px images (tile horizontally), rail at y **1210** of the image. Same bitmaps feed landscape and portrait (CSS custom properties on `#scene` hold each bitmap once; every layer references them with `var()`).
- Landscape (default): layers are `top:-492px`, so the window y 492..1392 of the image shows exactly the old 1600x900 band (rail at stage y 718). There are **492 px of ceiling above and 558 px of depth below** the band => the camera can move **+-350 px** vertically without an edge. Move a layer by setting `--cy` (px, e.g. camY * ratio) on it (the scroll keyframes read it), or set `style.transform = translate3d(x, cy, 0)` yourself (then remove the CSS animation).
- Wide windows: every scrolling layer is **6400 px wide at left:-1600px** (bg tiled 1600) and `#scene` is `overflow:visible`, so up to 21:9 (2560x1080) and beyond is filled; far and farmid now tile at 1600 too (no seams). Page backdrop blur uses the small `img.bdp` (first img in `#scene`).
- Layer classes (each exists 3x: `.L1 .L2 .L3`, shown by `#scene.lvN`, 0.9 s crossfade): `.ly-far` (opaque, drifts 140 s ping-pong 0..-400px, ratio ~0.01), `.ly-farmid` (scroll 44.4 s = 36 px/s, ratio .06), `.ly-mid` (12.1 s, 132 px/s, .22), `.ly-track` (baked 1600x230 strip at top:670, 2.67 s, 600 px/s, 1.0; now OPTIONAL: kai may draw the track as SVG), `.ly-near` (1.78 s, 900 px/s, 1.5), `.ly-track2` (twin lane, `#scene.twin`, scale .72, rail y 488, tile 1152, 432 px/s), `.ly-exit` (daylight burst, `#scene.exit`, centred on the door (1538,650)). Add `go` to `#scene` to run the CSS scroll (paused by default).
- **Portrait** (`body.portrait`): design stage **900 x 1950**, rail at **y 1210 (62%)**. Classes `.ly-far-p .ly-farmid-p .ly-mid-p .ly-near-p .ly-track-p` (+`.ly-exit-p`, CSS radial gradient centred on `--exx/--exy`, default (740,1160)) show the full tall art (same bitmaps, top:0; `.ly-track-p` at top:1162). The landscape layers are hidden by `body.portrait`. I override `#scene` for portrait with `body.portrait #stage>#scene{left:0;top:calc((var(--H) - 1950px)/2);width:900px;height:1950px;transform:none}` (all !important, higher specificity than the shell rule). If the stage height `--H` differs from 1950 the art is centred (cropped or letterboxed by the extra rock at top/bottom).
- Levels as before (`lv1` blue crystal cavern, `lv2` forge/lava, `lv3` violet/gold vault). New in the tall art: a skylight shaft going up from the roof opening, big hanging stalactites, hanging ceiling lanterns/chains, rock the lavafall pours from, deep chasm below the lake (glowing spires, lava cracks / gold glints per level).
- Sizes: scene.html ~1.9 MB (12 tall WebPs + 3 track strips + exit + backdrop).

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

## REVISION 2 sprites (all new ids; nothing renamed)
Use pattern unchanged: `<svg class="rrs" style="width:Wpx;height:Hpx"><use href="#rrId"/></svg>`. viewBox sizes in brackets (symbol units = css px at 1:1).
**Gold tiers** [160x200, centre = item, ground shadow inside]: `rrGold1` tiny nugget, `rrGold2` handful, `rrGold3` coin pouch, `rrGold4` gold bar stack, `rrGold5` open glowing treasure chest, `rrGold6` crown-jewel hoard [240x210]. Old `rrNugget`/`rrPile` stay.
**Gems, value on the face, no chip** [140x140]: `rrGemEm` emerald octagon "2", `rrGemSa` round sapphire "3", `rrGemRu` ruby heart "5", `rrGemGo` gold kite diamond "10". Old `rrGem2/3/5/10` (with chip) stay.
**Hazards/others** [160x200]: `rrTntBundle` (3 sticks), `rrTntBarrel` (powder barrel) = cosmetic TNT variants, `rrShield` (glowing hard hat with bubble, no chip). `rrTnt rrLantern rrFork* rrDoor rrHat` unchanged.
**Decor** [160x200 unless noted]: `rrSignPost` (blank board; add html text), `rrSignPost10`, `rrSignPost20` (baked "10m"/"20m"), `rrCrestSign` (hill-crest warning), `rrMinecartWreck` [240x150], `rrBones` (dwarf skull + crossed pickaxes), `rrCrystalB/G/R` (blue/teal/red small clusters), `rrMushroom` (glowing cluster), `rrBat1`/`rrBat2` [100x70, wings up/down: swap the href at ~6 Hz while translating]. No spiders.
**Event callout plates** (text baked, add numbers as html text over/next to them) [300x84]: `rrCallGold`, `rrCallGem`, `rrCallShield` ("SHIELD!"), `rrCallBoom` (red "BOOM!"), `rrCallSaved` (blue "SAVED!"), `rrCallFork`, `rrCallJackpot`, `rrCallLeft`, `rrCallRight`; [380x84]: `rrCallLantern1/2/3` ("LANTERN 1/3".."3/3"), `rrCallDeep` ("DEEP SHAFT"). Icons [80x80]: `rrIconLeft`, `rrIconRight`. **Equation plate** `rrCallEq` [560x130]: empty plate with labels LOAD / MULT / WIN, a baked "x" and "=" between three number slots (viewBox units): LOAD slot x18 y40 w160 h68, MULT slot x232 y40 w120 h68, WIN slot x396 y40 w146 h68 (gold outline). Put numbers as centred html text in the slots (font `--toon`, ~46 px). Pop plates 0.2 s in, hold ~0.9 s, fade; plates are ~300 px wide on the 1600 stage.
**Track pieces** (side view, origin noted): `rrRailTile` [80x60, origin: rail head at y 14, tile every 80 px with no gap: rail + sleeper + bolt], `rrRailBar` [80x28 rail strip only], `rrSleeper` [44x24], `rrTrestleLeg` [70x220, stretch Y freely], `rrRampLip` (kicker, rails curve up to the lip: starts at the rail line y 144 of its 300x200 box, ends 110 px higher at the right edge x 300), `rrRampLand` (landing, rail line at y 14 of its 300x100 box, bumper chevrons right), `rrRailEndR`/`rrRailEndL` (buffer stops, 120x80, rail head at y 40; R closes the right end of a rail, L the left), `rrTunnelMouth` [380x310, origin = ground line y 300, dark arch with timber frame and ember glow, for the TNT approach], hill-crest sign = `rrCrestSign`.
**Speed/impact FX**: `rrSpeedLine1/2/3` [80/160/280 x16] white streaks (fade by gradient, translate left fast, opacity), `rrPuff1/2/3` [120x120] dust puff frames (small dense -> big -> faint: cycle over 0.4 s, centre = origin), `rrImpactRing` [260x100] flat landing ring (scale X from .3 to 1.2 + fade 0.35 s), `rrStarBurst` [200x200] cheer star burst (scale .4 -> 1.3 + rotate 20deg + fade).

## ARTICULATED RIG (`rrRig*`, REVISION 2)
Goal: smooth animation by CSS transforms on separate parts instead of pose swaps. All parts keep the ORIGINAL cart coordinates (cart centre 0,0, rail y 244) and are cropped to a tight viewBox, so the stack at the generated positions equals `rrCartRide` (pixel diff 98 of 66,129 px = anti-aliasing only; `art/rig-test.png` shows it + 4 transform-only demo poses: ride bob, lean forward, cheer, crash tumble; `art/rig-test.html` is live).
Container `.rrRig` = 400x390 css px (cart box -400,-530..400,250 at scale .5). Each part is `<svg class="rg rg-NAME"><use href="#rrRigNAME"/></svg>` and `slot.css` already holds, per part, `left/top/width/height` and `transform-origin` = the pivot (generated into `.rrRig .rg-NAME`, source `art/rig.css`, details `art/rig.json`). Group `.rg-upper` (400x390, origin = hips 175.5px 240px) wraps the upper body so you can lean it. Z order bottom->top: shadow, wheelB, wheelF, body, load, **[upper: beam, scarf(1|2|3), armFar|armFarUp, torso, hatGlow, head*, armPoint|armUpL]**, rim, loadFront, armRim (grip pose only), gloveRim.
| part (symbol `rrRig...`) | class | pivot (cart units -> css px in the part box is in rig.css) |
|---|---|---|
| `Shadow` | rg-shadow | ground shadow; scaleX on bounce |
| `WheelB` / `WheelF` | rg-wheelB / rg-wheelF | wheel centres (-190,188) / (190,188): `rotate()`; rail contact y 244 |
| `Body` | rg-body | (0,176) bottom centre: bob, tilt, shake |
| `Load` / `LoadFront` | rg-load / rg-loadFront | gold heaps behind / in front of the dwarf: bounce, pop |
| `Torso` | rg-torso | (-49,-50) hips: jacket, strap, belt, neck scarf wrap (no head/arms) |
| `HeadSmile` `HeadCheer` `HeadWorry` `HeadDizzy` `HeadDetermined` | rg-headSmile ... | (48,-192) neck. Swap `href` (or show/hide) for expression; helmet, goggles, lamp, beard included (look4 face) |
| `ArmPoint` | rg-armPoint | shoulder (-44,-196): pointing ahead + glove |
| `ArmUpL` / `ArmFarUp` | rg-armUpL / rg-armFarUp | shoulders (-44,-196) / (16,-196): cheer arms (near arm left, far arm right and behind torso) |
| `ArmFar` | rg-armFar | shoulder (16,-196): resting far arm behind the torso (swap for ArmFarUp) |
| `ArmRim` | rg-armRim | shoulder (-44,-196): near arm gripping the rim (use instead of ArmPoint; topmost layer) |
| `GloveRim` | rg-gloveRim | dark far-hand glove on the rim + the rim highlight line (always on) |
| `Rim` | rg-rim | steel rim |
| `Scarf` `Scarf2` `Scarf3` | rg-scarf / rg-scarf2 / rg-scarf3 | knot (-64,-206): 3 wave frames (neutral, tip down, tip up): cycle at ~8 Hz, or rotate +-6deg |
| `Beam` | rg-beam | lamp (141,-345): soft cone, no filter (opacity pulse / rotate +-3deg) |
| `HatGlow` | rg-hatGlow | (68,-366) glow behind the helmet (shield on; pulse opacity) |
| `Dust1` `Dust2` `SparkStreak` | (no fixed class) | origin (0,0) = centre; place at the wheel contact (-190,244)/(190,244) -> css ((x+400)/2,(y+530)/2); scale+fade |
Template (copy): see `art/rig-test.cjs` function `rig()`. Tips: bob = translateY(-3..-4px) on `.rrRig`; wheels rotate at speed/(2*pi*56) rev/s (radius 56 units = 28 px); lean forward = `.rg-upper` rotate(6..8deg) + head rotate(-5deg) + arm rotate(-8deg); cheer = HeadCheer + ArmUpL + ArmFarUp, upper rotate(-3deg), load translateY(-6px) scale(1.03); crash = `.rrRig` rotate(-24deg) about the rear wheel contact (105px 387px), wheelF translate(70px,-90px) rotate(220deg), HeadDizzy, arms up, dust + sparks. Old single-sprite `rrCart*` symbols stay valid (cheap fallback for phones: 1 element instead of ~16).

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

## RESUME NOTE (revision 2 done: A rig, B symbols, C callouts, D portrait, vertical headroom, wide tiling, track pieces, fx)
All deliverables done and committed (world x3 palettes, 29 symbols, logo, frame, hud, info, card, contact sheet `art/contact.png`). If something must be tweaked: edit `art/world.cjs` (layers/palettes), `art/sprites.cjs` (symbols), `art/build.cjs` (fragments/css), rerun the chain above. scene.html is 1.6 MB (15 WebP layers); lower `q` in `art/bake.cjs` for more savings.
