# Sirocco's Lamp Bazaar: art notes for kai (leo)
Files (all in `slots/siroccos-lamp-bazaar/`): `symbols.svg`, `scene.html`, `logo.html`, `frame.html`, `character.html`, `side.html`, `astro.html` (extra fragment: the Astrolabe of Wishes bonus scene), `info.html`, `slot.css` (ALL art CSS incl. embedded fonts; append your own after `/* KAI */`). Generators + bakes live in `art/` (not needed by the build). Order in the stage: scene, logo, frame, side, character, astro (astro last: it is a full-stage overlay, z-index 8).
Regenerate (Chromium via Playwright needed): `node art/build.cjs` (symbols + winvars), `node art/seal.cjs`, `node art/scene.cjs && node art/bake.cjs && node art/scene-html.cjs`, `node art/frame.cjs && node art/bake.cjs frame && node art/frame-html.cjs`, `node art/logo.cjs`, `node art/side.cjs`, `node art/char-bake.cjs && node art/char-build.cjs`, `node art/astro.cjs`, then `node art/css.cjs` (re-assembles slot.css from art/*.css parts and KEEPS whatever is after `/* KAI */`). Do not edit slot.css above the marker by hand.

## Stage geometry (1600x900)
| piece | box | notes |
|---|---|---|
| `#scene` | full stage | 2 baked WebP bitmaps (`.day` golden hour, `.night`), 2 light-shaft layers, one swaying hanging lamp (+ lit variant and halo), 18 dust motes. `#scene.bonus` = 1.6 s crossfade to the moonlit bazaar, lamp ignites (use it for Free Wishes and the Astrolabe). |
| `#logo` | 450,-10 660x150 | static, sheen sweeps |
| `#frameArt` | img at 480,144 600x600 | baked WebP frame (carved stone, lapis zellige band, gold bevel, jewels) with a translucent night-glass backing in the board hole |
| `#frame` | **BOARD AREA 520,184 520x520**: **5 cols x 5 rows, 104x104 px cells** (right edge x=1040, bottom y=704). Contains `#grid` (css grid 5x5), `#fxl` (z6 overlay), `#frameFx` (svg 520x520, empty) |
| `#chain` | 366,190 106x510 | chain meter, left of the board |
| `#char` | 1150,127 410x623 (bottom y=750) | Sirocco, right of the board, overflows nothing; his lamp sits at stage (~1215,~700) |
| `#astro` | full stage overlay | Astrolabe of Wishes bonus scene; instrument `.aWrap` 700x700 at (450,96) |
Msg line (shell, y 728) sits under the frame. The tall frame art ends at y=744.

## Symbols (viewBox 128x128, `<svg class="g" viewBox="0 0 128 128"><use href="#sN"/></svg>` inside `.cell`)
| id | name | role |
|---|---|---|
| s0 s1 s2 | Date bowl, Dallah coffee pot, Glass lantern | low (bronze rim) |
| s3 s4 s5 | Jambiya dagger, Signet ring, Hourglass | mid (silver rim) |
| s6 s7 s8 | Rolled magic carpet, Sultan's crown-turban, Genie's lamp | high (gold rim; s8 = top pay, extra glow) |
| **s9** | Djinn Seal: lapis disc, gold crescent+star, `WILD` ribbon, teal glow | WILD (reels 2-4) |
| **s10** | blazing gold sun-disc with ONLY the text `FS` | SCATTER free spins (Free Wishes) |
| **s11** | brass Astrolabe with three rings (no text) | SCATTER of the Astrolabe of Wishes |
| **s12** | Wish Gem, amethyst, empty value chip | generic gem |
| **s12_2 s12_3 s12_5 s12_10 s12_25** | Wish Gem skins with the value baked in the chip (`x2`,`x3`,`x5`,`x10`,`x25`; turquoise, emerald, amethyst, ruby, white-gold) | gem multipliers. If the engine uses other values, tell me (one line in `GEMS` in `art/syms-d.cjs`) or write the number yourself into s12 (chip area is x 32-96, y 93-113 of the 128 box). |
Also `<symbol id="seal" viewBox="0 0 100 100">` (the gold seal frame + wax medallion, for use in `#fxl`), and `sirSplash` / `sirSplashSuper` (see below).
Plates are CSS from the symbol id (`.cell:has(use[href="#sN"])`: bronze / silver / gold tiers, teal glow for the wild, orange for FS, indigo+brass for the astrolabe, violet for gems; the rim colour of s12_N follows the gem).
**Win motions:** inside each `<symbol>`, gated by `--kN_x` vars (set by `.cell.hit` or any container with class `winAnim`, exactly like Arctic/Tea House; `--delay`, `--spd` honoured). The idle board runs ZERO animations. 1.1-1.4 s, one shot: s0 bowl rocks, dates hop in three waves, the fig pops; s1 pot tilts and pours a gold ribbon, steam; s2 lantern swings, panes flash in turn, ignites a glow; s3 dagger flips a full turn, glint sweeps the blade; s4 ring spins on its vertical axis, gem shine; s5 hourglass turns over (sand flows); s6 carpet floats, the flap ripples, tassel swings; s7 turban squashes and hops, feather sways, ruby flares; s8 lamp rocks, lid pops open, smoke column surges; s9 ornament ring turns, star flares, ribbon pulses, teal glow; s10 sun rays turn, disc pulses, FS punches; s11 the three rings and the alidade rotate in different directions; s12* gem pulses, shine sweeps, chip pops.

## SEAL (sealed tiles) and the chain look
Add class `sealed` to a `.cell`: gold bevelled frame + wax-seal medallion (bottom-right) + gold glaze + gold glow (CSS only, one data-URI bitmap, no extra DOM). Add `in` for the stamp-in animation (0.62 s stamp scale-in + 0.9 s flash; remove `in` afterwards if you like, it is one-shot). Add `pulse` (0.7 s, re-trigger by toggling) when the chain grows. Free tiles: add `chain` to `#grid` while a chain is running (unsealed tiles get slightly muted, so the gold ones read at once). `#grid.focus` also works (dims non-hit cells). Sealed Wild/gems keep their symbol, the overlay sits on top (z3). Connection lines are NOT drawn.

## Chain meter `#chain` (side.html)
`#chain.m1..m5` (exactly one) lights the ladder up to that step and pulses the current one. `.cv` = the big text (use the multiplication sign `×`, e.g. `×3`, NOT the letter x). In Free Wishes the multiplier goes up to ×12/×15: keep `m5`, add `fs` (shows the "FREE WISHES NEVER RESETS" note, smaller digits) and write `×8` etc. into `.cv`. Add `pop` for ~0.5 s on every increase (remove it afterwards). Gem tally: write `×7` into `.gsum` and add `hasGems` (otherwise it is dimmed). The ladder labels `×1..×5` are static text.

## Sirocco `#char`
slot.json: `char: {el:'char', states:['spin','win','big','special','tease','bonus','maxwin','exhale','slump'], bonusClass:'bonusmode'}`. Idle = no class. `--spd` on `#char` for turbo.
| class | meaning |
|---|---|
| (idle) | arms crossed, breathing, slow blink, plume sway, tail sway, lamp glow, a finger-tap every 7 s |
| `spin` | uncrosses, hands low and open, right hand sweeps across the belly (.95 s) |
| `win` | arms wide, open hands, laugh, gold sparks, bounce (1.5 s) |
| `big` | floats up, hands raised, golden mandala + rays appear behind him, sparks (3.2 s; stays in the pose) |
| `special` | presents the board with the open right hand, brows up, a "!" pops (0.9 s) |
| `tease` | hold: leans in, right hand raised to the ear, eyes wide, one brow up; add `exhale` (hit: relieved grin, shoulders drop, 1.1 s) or `slump` (miss: hands clasped, eyes roll up, pursed mouth) before removing `tease` (later rules win, so `tease exhale` / `tease slump` just works) |
| `bonus` | 1.4 s intro: snaps/raises the hand, laugh, lamp flares (glow pulses) |
| `bonusmode` | hold: confident crossed arms, mandala ring turns slowly behind him, lamp flaring, head nods at ~84 bpm (0.7 s per half), amber eyes |
| `maxwin` | hold: floats high, both arms up, laughing, mandala + rays + sparks loop |
Layers (separate `<svg>`s so idle motion repaints little): `#sAuraS` (mandala/rays), `#sTailS` (smoke tail + lamp + glow), `#sFigS` (figure rig), `#sFxS` (sparks, "!").
**Splash portraits** (free-spins intro/outro, normal and SUPER with corona + rays): `symbols.svg` holds `<symbol id="sirSplash">` and `sirSplashSuper` (viewBox `-50 20 600 520`, bust with open hands). They reuse the baked images by id, so `character.html` MUST be in the page. `splashArt: kind => \`<svg class="sirSplash" viewBox="-50 20 600 520"><use href="#sirSplash${SUPER ? 'Super' : ''}"/></svg>\`` (`.sirSplash` = 400x347, in slot.css).

## Astrolabe of Wishes `astro.html` (bonus scene)
Add `on` to `#astro` to show it (0.8 s fade; hide the logo/board/char/chain yourself). `#scene.bonus` gives the night background behind its vignette. The instrument: three rotating rings + hub + fixed pointer at 12 o'clock + pedestal; a prize rack (`#aJ`, `.j.grand/.major/.minor/.mini`, add `lit` to flare one) on the right; a tally (`#aTally`: `#aCash`, `#aMult`, `#aWish`, `#aTotal`; add `pop` to animate) on the left; `.aTitle`.
- Labels are live text: `#ro0..#ro11` (outer ring cash, 12 sectors, default 1,2,3,5,8,10,15,20,40,5,3,2 with a trailing `×`), `#rm0..#rm9` (middle ring multiplier, 10 sectors: ×1 ×2 ×3 ×1 ×5 ×2 ×3 ×1 ×10 ×25). Overwrite `textContent` with the engine tables. Core ring: 8 sectors `.ring.r3 .sec`, sectors 0/2/4/6 carry the prizes GRAND/MAJOR/MINOR/MINI (`data-j`), the others are empty (a faint star). Hub text `#aHubT` (big) and `#aHubS` (small line).
- **Ring angle API:** sector `i` of an n-sector ring sits at `i*360/n` degrees clockwise from 12 o'clock when the ring angle is 0. To stop with sector `i` under the pointer: set `ring.style.setProperty('--a', target)` with target = `-(i*360/n) - 360*k` (k full turns, always going further negative than the last angle), and give the ring `class go` and `--t` (seconds, e.g. outer 2.6s, middle 3.4s, core 5.2s). The long ease-out (`cubic-bezier(.08,.72,.14,1)`) makes the last degrees crawl, so a spin looks like a decelerating wheel (use a big negative number so it turns several times). Between spins keep the angle as set (do not reset). Verified: `--a:-1170` ends at -90 deg.
- Stop hooks: add `sec.hit` to the landed sector (flash + label pop), `aPtr.pulse` on `.aPtr` (pointer kick, re-trigger by toggling), `ring.magnet` (golden pulsing glow for the "best third / magnet" streak), `#astro.tense` before the core stops (pulsing gold halo around the core, "held breath"), `#astro.idle` = slow drift of the rings between spins (do not use it while a `go` transition runs; remove `idle` first).
- Hub is `#aHubT`: show "WISH" while waiting, the jackpot name or amount when the core lights.
- `--as` on `.aWrap` scales the instrument (default 1; the rack and tally are fixed).

## Perf / bake notes
Software renderer, 1600x900, rAF counter, 4 s windows (my test page: scene + logo + frame + 25 symbols + chain + character, no shell grain overlay): **idle 51 fps**, bonus scene 56 fps, bonusmode + bonus 45 fps. Scene is two baked WebP bitmaps (+ light shafts); only opacity/transform animate (rays opacity, lamp sway, 18 motes, character layers). No SVG filter anywhere at runtime (all blur/grain is baked). Symbols are plain gradient vectors, no filters. The chain-dim filter on free cells (`#grid.chain`) costs a little while a chain runs. Weights: symbols.svg 176 KB, scene.html 470 KB (2 backgrounds 85+70 KB, shafts ~90 KB each), frame.html 146 KB, **character.html 172 KB**, astro.html 55 KB, slot.css 114 KB (fonts 75 KB: Cinzel 700/900 latin subset + Cinzel Decorative 700/900), total of all fragments about 1.15 MB.
Fonts: Cinzel (UI, `--toon`) and Cinzel Decorative (logo, astrolabe title). Cinzel has no lowercase/old digits: write multipliers with `×` and digits normally.

## Honest weak spots
- Sirocco is exactly the approved look-test design (clean vector illustration, 6/10 against Zeus), now with a rig: hands are simple (five stubby fingers, no knuckle detail), forearms are very long, so some poses fold awkwardly (the shrug is "hands clasped", tease raises the hand beside the ear rather than cupping it). No cloth physics, the smoke tail only sways.
- Date bowl and carpet are the weakest symbols: the carpet reads a bit like a drum until it animates; the dallah spout is thin. Lamp, dagger, ring, hourglass, astrolabe, gems, wild and FS are the strongest.
- Background: approved layout, added bunting/crenels/relief on the arch, but the dune lit slopes still show slight banding and the middle layer is still static (only the lamp and motes move).
- Splash portraits and the Astrolabe scene were checked in my own test pages, NOT in the real shell. Ring labels in the middle ring are rotated sideways like a real wheel (readable only near the top).
- Frame art is a clean jewelled frame, not a hero piece (6.5/10). Seal medallion covers the bottom-right of the tile (it overlaps the end of the WILD ribbon and the right end of the gem chip when sealed).
- Not done: win-line/connection art (none needed), music/sfx spec (leo spec for kai: base 88 bpm D Phrygian dominant, bonus 116 bpm, see plans/slot5-concept.md section 8).
