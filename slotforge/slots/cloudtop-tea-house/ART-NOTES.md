# Cloudtop Tea House: art notes for kai (leo)

Files in this folder: `symbols.svg`, `scene.html`, `logo.html`, `frame.html`, `side.html`, `character.html`, `info.html`, `slot.css` (ALL art CSS, tokens, tiles, states; append your own slot bits below it).
`art/` holds the generator scripts (node) for the art, not needed by the build. Regenerate: symbols `node art/build.cjs` (paths are absolute to the repo), scene `node art/scene2.cjs`, frame/side/logo `node art/frame.cjs`, Koji `node art/char.cjs`. `art/css.txt` is OLD (slot.css is edited directly now).

## Stage geometry (1600x900)
| piece | box (stage px) | notes |
|---|---|---|
| `#scene` | full stage | static SVG; CSS drift on clouds, sway on kites. `#scene.dusk` fades in dusk + lit eave lanterns (use it for the bonus). |
| `#logo` | 470,6 660x150 | noren sways, kite swings (CSS only) |
| `#frameArt` | 450,160 700x560 | the tansu (drawer chest) |
| `#frame` | **480,188 640x512** | **BOARD AREA: 5 cols x 4 rows, 128x128 px cells.** `#grid` (css grid 5x4), `#fxl` (z6 VFX overlay, inset 0), `#frameFx` (drawer dividers drawn over the cells, pointer-events none). Board right edge x=1120, bottom y=700 (message line y=728 stays free). |
| `#gates` | `.gate.g0..g3` at left 378, top 212/340/468/596 (72x72) | side element = the 4 Kite Launch torii gates, one per row, aligned with the rows |
| `#char` | 1130,300 480x500 | Koji behind his counter; the counter front sits on the deck |
Bonus Buy sign (shell) is at 40,150 over the left sky; nothing important is drawn under it. Order in the stage: scene, logo, frame, character, side (as the shell template).

## Symbols (viewBox 128x128, `<use href="#sN">` inside `<svg class="g">`)
| id | name | role |
|---|---|---|
| s0 s1 s2 | Dango, Onigiri, Paper Fan | low pays |
| s3 s4 s5 | Paper Lantern, Plum Blossom, Iron Teapot | mid pays |
| s6 | Lucky Cat | high |
| s7 | Golden Koi | top |
| **s8** | Smiling Kite, carries a `WILD` tag | **WILD** (reels 2-4) |
| **s9** | Furoshiki Bundle (purple cloth, big `?`) | **MYSTERY** (all flip to one symbol) |
| **s10** | Tea Tin, carries a `TIN` tag (class `fs-tag`, like the FS tag of the other slots) | **SCATTER / CASH (trigger)**: set `scatterSym: 10` |
Extra bonus-board symbols (not in the base pay table): **s11** Collector (brass kettle, tag `COLLECT`), **s12** Mini tin (bronze, `MINI`, 10x), **s13** Minor tin (silver, `MINOR`, 25x), **s14** Major tin (gold, `MAJOR`, 250x), **s15** Grand Dragon Kite (`GRAND`, the full-board prize; also usable for the max-win screen).
Every symbol animates itself in `.a-*` groups gated by `--win` (paused/running), `--delay`, `--spd` (shell contract; `shell.cellWin` sets them on the cell). All wins run **1.1 s x --spd**, one shot. At rest (0%) every symbol shows its final pose; the win motion starts from there.
Tin values: put `<span class="m">5</span>` (or `x5`) in the cell. The chip sits centred at the bottom of the tin and covers the `TIN` tag. Add class `up` for a pop-in. In the base game, show tins WITHOUT a chip (they carry no value there).
Win motions: s0 skewers wobble, balls hop one after another, bite appears. s1 two tanuki paws squeeze, plum blinks. s2 fan snaps shut and open, crane, petals slide off and return. s3 swings like a bell, flame wakes. s4 blossoms burst open one by one. s5 lid rattles, steam, tips and pours into the cup. s6 paw beckons, bell rings, winks. s7 koi leaps out with splashes and dives back, bowl rocks. s8 kite loops, tail whips. s9 knot wobbles, unties, cloth flaps open on a star (then closes; swap the symbol at ~60% = 660 ms if you want the reveal). s10 lid pops, a coin card rises. s11 boils, lid hops, steam. s12-14 same as s10. s15 dragon kite surges.

## Cell classes (all in slot.css)
`.cell` (child `svg.g`), `.wild`, `.scat` (tin pulse during tease), `.hit` (winning cell: rim warms, set `--win/--delay` as the shell does), `.drop` / `.out` (row by row in/out, use `--dl` and `--spd`; squash + overshoot), `.rdrop` / `.rsout` (respin refill), `.land` (a tin lands: scale-in), `.pulse` (ring), `.closed` (bonus board: empty drawer with brass pull; svg.g hidden), `.locked` (bonus: a locked tin glows), `.m` (value chip), `#grid.focus` (dims non-winners). Plate colour comes from the symbol id via `:has(use[href="#sN"])`, so you only add the `<use>`.
Connections (winning paylines) are meant to be a hand-drawn paper string / tea-cloth ribbon threaded through the winning drawers: draw it in `#fxl` (z6) as an SVG path in board coordinates (640x512), cream cloth stroke with ink outline, animate `stroke-dashoffset` so it threads cell by cell. No art was made for it (see weak points).

## Gates (side.html)
`#gates > .gate.gN` (N = row 0..3). Add `.on` when row N is complete (torii turns vermilion with a glow, pops); add `.launch` for ~1.3 s to fly the little kite out of the gate (remove after). Remove both at the start of the next round.

## Koji (`#char`)
slot.json: `char: {el:'char', states:['spin','win','big','special','tease','bonus','maxwin','exhale','slump'], bonusClass:'bonusmode'}`. Idle = no class (breathing, nods off and jerks up, tail sways, steam from his cup, ears twitch).
| class | meaning / duration |
|---|---|
| `spin` | slaps the counter bell with the ladle (anticipation, ding), peeks at the drawers. 0.95 s x `--spd` |
| `win` | raises the cup and pours a thin stream of tea into the tins, ears wiggle, tail thump x3. 1.5 s. Use for small wins; for bigger line wins keep it, then `big` |
| `big` | 8 hops, hat flies off and lands back, belly drum, tail spin. 3.2 s |
| `special` | gasp + "!" (tin lands, bundle unties, kite launch). 0.9 s |
| `tease` | hold: breath held, cheeks puffed, eyes bulge, paws clasped. Remove it when the result is known; to resolve add `exhale` (hit/relief, 0.6 s) or `slump` (miss) before removing `tease` |
| `bonus` | 1.4 s intro: ties on the headband, flexes. Then keep `bonusmode` (set by the shell) for the whole bonus: headband on, ladle as a baton at 128 bpm (0.94 s per beat) |
| `maxwin` | hold: gold hat, tail drum solo, the Grand dragon kite rises behind him |
`--spd` can be set on `#char` (turbo). Child ids (for extra effects): `cAll cTail cBody cHatWrap cHead cEarL cEarR cEyes cPupils cLids cBrows cMouthOpen cCheeks cBand cArmL cCup cSteam cStream cArmR cLadle cCounter cTins cBell cBellTop cDing cKite cBang cSpark`. The `maxwin` kite is drawn above the box (negative y), the svg has `overflow:visible`.

## Scene / dusk
Light comes from the low sun at the upper left; all props have a contact shadow to the right. Only cloth, kites, clouds and steam move; no particles or bubbles. For the bonus add `dusk` to `#scene` (1.6 s fade: orange-violet multiply, lit lanterns under the eave). Remove it afterwards.

## info.html
Placeholders `[[maxWin]]` and `[[buy:rush]]`: **name the buy key `rush` in slot.json** (or change the placeholder). The text says "no bet-up mode" and one buy. `#ptab` is filled by slot.js; symbols there are the same `<use>` ids, the info `svg` background is washi (`.pt svg`).

## Fonts, UI skin
Logo, tags, chips use Luckiest Guy / Lilita One, now embedded (see Revision 2). Tokens in `:root` re-skin the shell (cedar `--panel1/2`, brass `--rim/--rivet`, vermilion `--accent`, matcha `--btn`, washi `--paper`). Palette: ink `#1c2340`, peach `#ffd9b8`, sky `#9fd3ee`, sakura `#f59db8`, vermilion `#d9432e`, gold `#e9b43c`, matcha `#79a85a`, cedar `#7a4a2e`, washi `#fbf1dc`.

## REVISION 2 (leo, owner round 7) - read this, it changes how some things work
**Build pipeline for the art (no SVG filters at runtime any more).** Generators write RAW files that still use the shell wobble filters; `node art/wobble.cjs` then bakes the same kind of wobble into the geometry (resampled + Perlin-displaced + simplified paths) and removes every `filter=`. Raw copies live in `art/raw/`. Order: `node art/build.cjs` (symbols, splash, win-vars) -> `node art/char.cjs` -> `node art/wobble.cjs` (all files; arg = one file). `art/raw/scene.html` and `art/raw/logo.html` are now the SOURCE of the scene/logo (scene2.cjs can no longer regenerate: its input txt is gone; `art/scenefix.py` records the edit). Also `art/fit.cjs` (symbol auto-fit, writes `art/fit.json`), `art/prev.cjs` (symbol preview), `art/arms.css`, `art/fonts/`. slot.css has generated blocks between `/* ART-GEN ... begin/end */` markers (winvars, arms, fonts, splash): do not hand-edit inside them, edit the source and re-run.
**Symbol win animations are now released by CSS vars** (the idle board has ZERO running/paused animations; paused animations cost a compositor layer each and were the main slowdown). Contract is unchanged for the shell (`.hit` + `--win:running`): the rule `.cell.hit,.ctDragon{--kN_x:...}` (ART-GEN winvars) switches the animation names on. If you show a symbol with a win motion anywhere else, give its container class `winAnim` and `--win:running`. At rest a symbol shows its 0% pose as plain CSS.
**Perf (software rendering, Playwright idle rAF counter, 1600x900, 4 s windows, same method before/after):** 3.3 fps before -> about 40 fps after (runs 36-44 on a busy machine; with every animation switched off the page does ~58 here, the rest is the shell's full-screen grain overlay). During the bonus look (dusk + `bonusmode` drum-beat Koji) about 25 fps. What was done: removed all feTurbulence/feDisplacementMap filters from scene, symbols, Koji, logo, frame, side (baked into geometry); removed the CSS drop-shadow filters on cells and logo; kites 5->2 animated nodes (left/right bundle), clouds 6->5, lantern sway removed, noren 3 panels->1 node; symbol win animations gated (above); the shell's buy-sign gem wobble (`#buyOpen svg`, two drop-shadow filters, ~10 fps) is overridden at the end of slot.css (static single shadow). Bigger file: standalone ~1.4 MB (symbols.svg is 0.68 MB of baked outlines).
**Symbol fit:** every symbol is scaled/centred by its painted bounding box into the tile (scale 0.75-1.19; tins are now ~19% bigger, the fan smaller). Re-run `node art/fit.cjs` after drawing changes.
**s15 Grand Dragon Kite redrawn:** indigo diamond kite, a red-gold ryu in PROFILE (long muzzle, fangs, gold slit-pupil eye with brow, swept-back cream horns, teal flame mane, whiskers streaming out of the kite, coiling scaled body, tail out of the bottom). Win motion: whole kite surges, jaw roars, whiskers and mane flutter, tail whips (tail moves with the kite). The big kite behind Koji on `maxwin` (`cKite`) now uses the same `<use href="#s15">`.
**Koji:** the hat is a woven conical kasa (radial + ring weave, bound brim, finial, red chin cord with gold beads and a tassel under the chin; ears poke through slits). The hat now sits ON the head inside `#cHead` (nods with it); the cord is `#cHatStr` in front of the face. Arms are two-bone: `#cArmL > #cForeL (cup, paw, steam)` and `#cArmR > #cForeR (ladle, paw)`; every state (spin, win, big, special, tease, bonus, bonusmode, maxwin) animates shoulder, forearm (delayed 50-90 ms, bigger swing), cup/ladle (delayed again) with overshoot and settle (block ARMS v2 at the end of slot.css). New transform-origins `#cForeL 126px 300px`, `#cForeR 356px 300px`.
**s16 FS scatter (new):** a taiko festival drum (red barrel with rope lacing, gold-studded rim, cream skin) with ONLY the text `FS` on the skin. Own win motion: both sticks drum alternately, skin and letters pulse, gold sound arcs. Plate: automatic from `use[href="#s16"]` (gold to periwinkle, class `.fsplate` also available). Use `scatterFS: 16` on your side; the Tin Rush trigger stays s10 with the TIN tag. Fonts in the symbol: `Lilita One` stack (embedded).
**Splash portrait (task 7):** `symbols.svg` now also holds `<symbol id="kojiSplash">` (cheerful: smile, steaming cup in one paw, waving the other, sparkles, bobbing, ear twitch) and `<symbol id="kojiSplashSuper">` (excited: gold hat, headband, star eyes, both fists pumping, gold glow + slowly rotating rays, sparkles). Hook for kai (shell README: `splashArt(kind)` returns an HTML string for `#introArt` / `#outroArt`): ``splashArt: kind => `<svg class="kojiSplash${SUPER ? ' super' : ''}" viewBox="30 -50 420 390"><use href="#kojiSplash${SUPER ? 'Super' : ''}"/></svg>` ``. `splash.html` is the reference snippet (not a build part). CSS (ART-GEN splash): the art is 300x279 (super 340x316), overlaps the top of the medal (negative margin) and hides the gems row (`.splashArt:not(:empty)~.gems{display:none}`), so the column stays within 900 px. Needs a re-render check in the real splash by kai (I could only test the symbol alone). Normal = Tin Rush / free spins, super = 4 FS bonus.
**Fonts (task 8):** Luckiest Guy and Lilita One (both OFL, latin subset, 26 KB woff2 together) are EMBEDDED in slot.css as base64 @font-face, so logo, tags, chips, the whole shell `--toon` look right offline. `--toon` also has a fallback stack (Impact, Haettenschweiler, Arial Narrow Bold, Arial Black). Side effect for kai: with the real font the idle message "SHALL WE POUR? PLACE YOUR BET (Play-money demo)" wraps to 2 lines in the 520x42 `#msg` box: shorten it or allow 2 lines.
**Still weak:** winning-line cloth string and Kite Launch VFX are still kai's; dusk/bonus mode is ~25 fps in software; the s15 horns read a little like feathers at 64 px; the splash portrait is untested inside the real modal; the shell's grain overlay (`mix-blend-mode:overlay`, full screen) caps software fps near 55.

## Weak / unfinished (honest list)
- Winning-line connection (cloth string) and the Kite Launch row VFX are not drawn: kai builds them in `#fxl` from the spec above.
- Scene is a flat-colour doodle backdrop (no photo-real layers, per the owner); right of the shop (pine, post, kites) is mostly hidden behind Koji.
- Tile plates are CSS; tier colour only (low cream, mid pink, high gold, wild green, mystery lilac, tin red).
