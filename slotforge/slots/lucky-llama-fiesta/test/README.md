# Lucky Llama Fiesta - look test (leo)
Key picture of the main screen, 1600x900, per the LOOK TEST BRIEF in slotforge/plans/slot7-concept.md.
- `look.html`: self-contained (inline SVG vector, fonts embedded as base64, no SVG filters, no external files).
- `look.png`: Playwright + Chromium render (`node shot.cjs look.html look.png`).
- Source: `build.cjs` (scene, frame, HUD, logo), `lucho.cjs` (hero), `syms.cjs` (13 symbols), `lib.cjs` (helpers).
- Board: 13 distinct symbols in 15 cells (Lucho, WILD poncho, FS drum, $5 and MINOR pinatas, 2 skulls, sombrero, mask, trumpet, taco, chili, marigold, maracas, guitar) with a 3x skull win on row 1.
- Hero Don Lucho: front bust in the cell plus a large cameo right of the logo; cream fur with left rim light, flower crown, magenta/teal/gold poncho, gold tooth.
- Also shown: Poncho ladder x1..x10 (x3 lit), hanging BONUS BUY sign (no price), WIN plaque, round turquoise SPIN, USD amounts.
- Phone-light: static layers, no filters, no animation; rebuild with `node build.cjs`.
