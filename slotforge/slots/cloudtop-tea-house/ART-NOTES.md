# Cloudtop Tea House: art notes for kai (leo)

Files in this folder: `symbols.svg`, `scene.html`, `logo.html`, `frame.html`, `side.html`, `character.html`, `info.html`, `slot.css` (ALL art CSS, tokens, tiles, states; append your own slot bits below it).
`art/` holds the generator scripts (node) for the art, not needed by the build. Regenerate: symbols `node art/build.cjs` (paths are absolute to the repo), scene `node art/scene2.cjs`, frame/side/logo `node art/frame.cjs`, Koji `node art/char.cjs`. `art/css.txt` is the source of `slot.css`.

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
Logo, tags, chips use Luckiest Guy / Lilita One from the shell's Google Fonts link; without network they fall back to Impact/Arial Black (looks thinner). Tokens in `:root` re-skin the shell (cedar `--panel1/2`, brass `--rim/--rivet`, vermilion `--accent`, matcha `--btn`, washi `--paper`). Palette: ink `#1c2340`, peach `#ffd9b8`, sky `#9fd3ee`, sakura `#f59db8`, vermilion `#d9432e`, gold `#e9b43c`, matcha `#79a85a`, cedar `#7a4a2e`, washi `#fbf1dc`.

## Weak / unfinished (honest list)
- Winning-line connection (cloth string) and the Kite Launch row VFX are not drawn: kai builds them in `#fxl` from the spec above.
- No splash art (`splashArt`) for intro/outro; Koji portrait can be reused (copy `character.html` svg at larger scale).
- Grand Dragon Kite (s15) face reads a bit like a pig; the max-win screen should use the big kite behind Koji (`cKite`) instead.
- Symbols use `filter:url(#roughS)` per symbol; 20 filtered cells animating at once is fine on desktop but check low-end mobile.
- Scene is a flat-colour doodle backdrop (no photo-real layers, per the owner); right of the shop (pine, post, kites) is mostly hidden behind Koji.
- Tile plates are CSS; tier colour only (low cream, mid pink, high gold, wild green, mystery lilac, tin red).
