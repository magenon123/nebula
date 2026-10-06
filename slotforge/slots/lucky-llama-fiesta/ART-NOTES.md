# Lucky Llama Fiesta: art notes for kai (leo)
Files: `symbols.svg`, `scene.html`, `logo.html`, `frame.html`, `character.html` (empty `<div id="char">`, NO side character), `side.html`, `info.html`, `slot.css` (ALL art css + embedded fonts LlLuck/LlLil; add yours after `/* KAI */`), card `/cards/lucky-llama-fiesta.webp` (720x944, 112 KB). Generators in `art/` (`node art/build.cjs` rebuilds everything and keeps your KAI css; `node art/bake-blur.cjs` first if symbols change; `node art/card.cjs`). Checks: `art/contact.png` (all symbols), `art/contact-hit.png` (win motion at 420 ms), `art/ui-sheet.png` (all UI art), `node art/stage-test.cjs base|link|parade|dusk` -> `art/stage-*.png`. Old look test in `test/` (ignore).
Order in the stage: scene, logo, frame, character, side. Sizes: symbols.svg ~400 KB, scene.html ~250 KB.

## Stage geometry (1600x900)
| piece | box | notes |
|---|---|---|
| `#scene` | full stage | baked `.day` plaza (golden hour), `.dusk` night variant fades in with `#scene.bonus` (1.6 s; use for Parade/Link), `.banners` = ONE thin layer (papel picado strings, 1600x420) that sways in CSS, `img.bdp` small backdrop copy (opacity 0, for the page backdrop). Composition is cover-friendly (sky/ground extend; nothing important at the edges). |
| `#logo` | (584,2) 432x142 | static svg viewBox 720x236, llama ears above the letters. Loading screen clones it big. Add class `off` to hide it in Link/Parade (the top strip is then free for the plates). |
| `#frameArt` | (365,152) 870x528 | baked WebP (carved painted wood, brass studs, marigold garlands) |
| `#frame` | **(425,190) 750x450: 5 cols x 3 rows, 150x150 cells** | contains `#grid` (css grid) and `#fxl` (z6 overlay). Cells have `margin:2px` (tile 146 + 4 gap). Right edge x=1175, bottom y=640. Shell `#msg` (y 728) sits below. |
| `#ladderW` | (262,150) 88x490 | Poncho ladder |

## Reel symbols (`<svg class="g" viewBox="0 0 128 128"><use href="#sN"/></svg>` inside `.cell`; the tile/plate is INSIDE the symbol, no css plate needed)
Ids follow the engine order (SYM = MAR MAC CHI GUI TAC SKU SOM MAS TRU LUC WLD SCA MON):
| id | symbol | tier rim |
|---|---|---|
| s0 s1 s2 s3 s4 | Marigold, Maracas, Chili, Guitar, Taco | low (teal) |
| s5 s6 s7 s8 | Sugar Skull, Sombrero, Luchador Mask, Trumpet | mid (magenta) |
| s9 | **Don Lucho** (head + shoulders fill the tile) | high (gold) |
| s10 | WILD Poncho (ribbon WILD) | pink |
| s11 | Fiesta Drum (FS plaque) = SCATTER | red |
| **s12** | MONEY piñata with EMPTY belly plate: write the value as centred html/svg text at symbol (64,66), plate radius 21 (cell px: x 50%, y ~52%, font LlLuck ~32/128 of the cell) | green |
| s12_mini s12_minor s12_major s12_grand | jackpot piñatas (name plaque baked, crown on the belly; MINI aqua, MINOR purple, MAJOR orange, GRAND crimson/gold) | own colour |
| s13 | Collector piñata (golden, bonus only, red star belly) | gold |
**Win motion:** like Sirocco: set class `hit` on the `.cell` (or `winAnim` on any container); optional `--delay` and `--spd`. One shot 1.2-1.3 s per symbol, idle board has ZERO animations. Parts: s0 bloom spins/pulses; s1 two maracas shake out of phase; s2 chili wiggles; s3 guitar strums + notes; s4 taco hops and squashes, steam; s5 skull nods, jaw talks, eyes glow; s6 hat jumps and tilts; s7 mask flexes; s8 trumpet toots + sound rays + notes; s9 Lucho head bobs, poncho squashes, double blink (`a-lid`), crown sparkles; s10 poncho sways + sparkles; s11 drum pulses, sticks drum, ring wave; s12/jackpots swing on the rope + sparkles; s13 swings + aura. Every symbol also has `a-rim` (bright rim flash). The css vars are in slot.css (`--ks9_head:sy9_head ...`).
**Spin blur:** `sb0..sb13`, `sb12_mini/minor/major/grand` (same viewBox 128, one pre-rendered 160px WebP each with a vertical smear, no filters). Use `<use href="#sb9">` for cells while the reel spins and swap to `#s9` on stop.
Sticky-wild: add class `sticky` on `.cell` (css glow frame, pulses) or draw `<use href="#llSticky" width=128 height=128>`.

## Hold & Win (Piñata Link) art, all `<symbol>`s in symbols.svg (size = viewBox)
`llJpMini llJpMinor llJpMajor llJpGrand` 220x84 plaques (name baked, dark value slot at x124 y20 80x44). In `side.html` they exist as `#jpGrand #jpMajor #jpMinor #jpMini` inside `#jps` (right of the board, (1262,190), stacked GRAND on top). Add `on` to show, `lit` = lit state (unlit is dimmed + dark), `hit` = pop; write the value into `.jv` (e.g. `2000x`). `llRespins` 320x92 (`#lkRespins` at (640,96), number slot centre (262,46) -> `#lkRespinsN`), `llTotal` 520x110 (`#lkTotal` at (540,672) scaled .8, value in `#lkTotalV`), `llLock` 128x128 (gold lock ring with padlock, pulses; place over a locked cell: `<svg class="lockRing" viewBox="0 0 128 128" style="left..;top..;width:150px;height:150px"><use href="#llLock"/></svg>`), crack frames `llCrack1` (crack), `llCrack2` (burst, wedges flying), `llCrack3` (confetti/candy/coins) all 220x220 centred on the piñata (show ~120/160/400 ms; size ~220-260 px), `llGrand` 700x300 full-board GRAND plate (`#grandPlate` at (450,290), value `#grandV`, slot x200 y196 300x70). All plates in side.html hidden until class `on`; class `pop` plays a 0.25 s pop-in.
Hide the logo (`#logo.off`) in Link and Parade; `#lkRespins` and the Parade callouts use that strip.

## Poncho Parade UI
`#ladder` (inline svg in `#ladderW`): toggle exactly ONE class `m1..m6` = engine `ladderStep` (ladder is x1/x2/x3/x5/x8/x10 at 1/2/3/5/7/10+ wilds); steps up to it light, the current one pulses; none (`m0`) = all dim. Labels are live text `#ldT1..#ldT6`. `pop` class = 0.5 s kick. Plates (hidden until `on`): `#pdSpins` (llSpinsLeft, (36,150), number `#pdSpinsN`), `#pdCallSpins` "+3 SPINS" (llCallSpins 330x92 at (635,88), write `+3` into `#pdCallSpinsN`), `#pdCallMult` "x3 MULTIPLIER" (llCallMult 440x92 at (580,88), write `x3` into `#pdCallMultN`), `#pdCollector` (llCollector 300x300, Collector Don Lucho with the bat; add `swing` to play the swing) at (1290,300).

## Callouts, splashes, hero
`#coLine` (llPlateLine 520x60 at (540,684), text span `#coLineT`, ready for "LINE 7 - 3x TACO - $2.50"), `#coWin` (llPlateWin 360x96, value `#coWinV`). Titles `llTitleLink` / `llTitleParade` 640x150 (papel picado letters, for the intro splash). Splash art, viewBox given, use like Sirocco: `<svg class="llSplash" viewBox="0 0 600 520"><use href="#llSplashLink"/></svg>` (css 400x347): `llSplashLink`, `llSplashParade`, `llSplashOutro` (600x520), `llHero` 800x640 (loading screen), `llBigWin` 500x420 (big-win overlay art). `llLucho` 400x480 is the big bust (reused by all of them). The big Lucho appears ONLY there, on the card and (ears) in the logo.

## Fonts / palette
`LlLuck` (Luckiest Guy, numbers/plates; shell `--toon`), `LlLil` (Lilita One, small labels). Root tokens set for the shell: ink #2a1209, panels wood browns, accent turquoise, acc1 marigold. No SVG filter anywhere; idle board has no animation; only `.banners` sways.

## Info (`info.html`)
Placeholders `[[maxWin]] [[anteCost]] [[buy:parade]] [[buy:link]] [[buy:party]]`, `#ptab` filled by slot.js.

## RESUME NOTE
All deliverables A-G done and rendered (contact.png, ui-sheet.png, stage-*.png). If something changes: edit `art/syms.cjs` / `ui.cjs` / `scene.cjs` / `frame.cjs` / `logo.cjs` / `side.cjs` / `css.cjs`, run `node art/bake-blur.cjs && node art/build.cjs && node art/card.cjs`. Not done: no symbol-level change for the engine's `Collector` grab motion beyond `llCollector`; side CSS positions are suggestions (move freely after the KAI marker).
