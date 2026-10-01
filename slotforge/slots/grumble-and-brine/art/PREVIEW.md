# Grumble & Brine art fragments (leo) - what kai needs

Files in this folder: `symbols.svg`, `scene.html`, `logo.html`, `frame.html`, `character.html`, `side.html`, `info.html`, `art.css`.
**`art.css` holds ALL the CSS for these fragments** (layout positions, scene motion, cells, Current Strip, Tide Gauge, character states, :root tokens). Concatenate it into `slot.css` (or load after the shell CSS). Keyframes are prefixed `gb*`; shell keyframes `wob` is reused for scatter cells.

## symbols.svg
`<symbol id="s0".."s10" viewBox="0 0 64 64">`: s0 Old Boot, s1 Tin Can, s2 Message Bottle, s3 Rusty Key, s4 Brass Compass, s5 Barnacle Anchor, s6 Coin Purse, s7 Rusty Harpoon, s8 Pearl Clam, s9 Lantern Jelly (WILD), s10 Sonar Buoy (SCATTER).
Defs at the top of the file (patterns `gbH gbHC gbHL gbHX`, filter `gbGlow`) must be inside the same `<defs>`/svg as the symbols. Uses shell `roughS`, `hatchL`... Jelly multiplier chip is NOT baked in: `<span class="m">x3</span>` on the cell.

## Stage placement (1600x900)
| id | box | notes |
|---|---|---|
| `#scene` | full stage | static + CSS motion: `#sRays .ray.r1-6` (opacity), `.kelp.k1-6` (sway), `.lamp .lglow` (flicker), `#sPortLight/#sBigGlow` (porthole flicker), `#sSign`, `#sSuitBody`. No bubbles, no dots. |
| `#logo` | 470,6 660x150 | bobs 2px/4.5s |
| `#frameArt` | 438,158 724x520 | board plate; houses the strip trough |
| `#frame` | 460,222 680x408 | contains `#grid` (5 cols x 3 rows, 136px cells, `grid-template-*` in art.css), `#fxl` (z6 overlay for VFX), `#frameFx` (rope reel dividers over the cells, pointer-events none) |
| `#strip` | 460,170 680x46 | Current Strip: 5 `.lane[data-r=0..4]` (add `.on` when a Jelly is on that reel), `#chain` badge (`.on`, `.bump`; text in `#chainN`, e.g. `x2`). Flowing foam dashes are CSS. Chips: put `<span class="chip">x3</span>` in a lane. |
| `#tagArt` | 1020,626 | "NO REFUNDS" tag, swings |
| `#char` | 1130,300 480x500 | Captain Barnacle (viewBox 0 0 480 500) |
| `#tide` | 52,440 90x330 | Tide Gauge, hidden until `.on`; set classes `lv0..lv3`, text in `#tideV` (`+n`), add `.pulse` / `.shake` for level-up (remove after ~.9s) |

## Cell classes (art.css)
`.cell` (svg.g child holds `<use href="#sN">`), `.wild` (Jelly glow), `.scatter`, `.scat` (buoy pulse), `.hit` (winner bob), `.drop` / `.out` (row-by-row in/out, uses `--dl` and `--spd`), `.drifting` (Jelly slides in from the right, 136px), `.pulse` (foam ring on destination), `.m` (multiplier chip), `#grid.focus`. `.win` is used by the focus rule too.

## Character (`#char`, state classes: `idle` (none), `spin`, `win`, `big`, `special`, `wince`, plus persistent `bonusmode`)
Use slot.json `char: {el:'char', states:['spin','win','big','special','wince'], bonusClass:'bonusmode'}`. Durations: spin .95s x `--spd` (set `--spd` on `#char`/stage; turbo .5), win 1.5s, big 3.2s (hop loops 8x .4s), special .9s, wince = hold until you remove the class.
Groups (ids): `cCrate` (static), `cAll` wrapper (hop/tremble), `cBody`, `cLegs`, `cHead` (hose, helmet, `cLamp`, `cLampGlow`, `cValve`, `cBubbles`, window with `cEyes` (stalks + eyeballs, `cPupils`, `cLids`), `cBrows`, `cMouth` = `cMouthOpen`, `cTongue`, `cMandL`, `cMandR`), `cClawR` (big claw, VIEWER LEFT: `cHandR`, `cPincerTop`, `cPincerBot`, `cGauge`, `cNeedle`), `cClawL` (small claw, viewer right: `cHandL`, `cScope`, `cPincerTop2`, `cPincerBot2`), `cBurst` (coins, big), `cBang` ("!", special).
Idle = scowl (brows hard down, lids 35%, frowning mandibles); open mouth/tongue only in win/big/special. Idle loops: breathe, head bob, blink (lids), pincer click 7s, eyebrow twitch 9s, mandible grumble 5s.

## info.html
Placeholders `[[maxWin]] [[anteCost]] [[buy:dive]] [[buy:abyss]]`; `#ptab` filled by slot.js (Old Boot/Tin Can: dash for 3). Shell `.mbox`/`.rules` still use EmberClaw browns; art.css overrides `.rules div`, `.pt td/svg` to teal iron. Retheme `.mbox` background in slot.css if wanted.

## Known weaker points
Offline fallback font replaces Luckiest Guy (logo uses `textLength` so it keeps its shape); wince pose is approximate; far wreck silhouette is faint on purpose; no sprites/bubbles in the scene by owner preference; VFX (Jelly trail, bubbles) are kai's.
