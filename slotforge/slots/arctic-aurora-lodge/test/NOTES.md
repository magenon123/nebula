# Arctic Aurora Lodge: art-direction test (leo)
Files: symbol.png / background.png (final renders), symbol.svg, symbol.html, background.svg (with reel marker), background-clean.svg, generators gen-symbol.cjs / gen-bg.cjs (seeded, reproducible), shot.cjs (Playwright render). Pure vector, no raster, no external files.

## Technique
- Symbol (Aurora Crystal): plate = vertical gradient + frost noise (feTurbulence, static) + top sheen + bevelled aurora-gradient rim with inner shadow. Crystal = 3 prism faces + 3 termination facets, each with its own gradient; aurora green/violet light inside the glass (screen blend, clipped to the crystal); back edges seen through the glass (refraction lines), fracture plane, inclusions, caustic focus at the base; specular streaks; green rim light on the aurora side; blurred contact shadow; snow mound; sparkle. Two smaller copies via <use>.
- Background: gradient sky, 320 hand-seeded stars, 3 aurora curtains built from ~1,300 thin vertical gradient rays (green base, violet top) plus blurred glow, 2 mountain ridges (midpoint displacement) with lit/shadow facets and green rim line, 2 blurred far-treeline layers, haze bands, frozen lake = flipped+blurred sky/mountain reflection, horizontal glints, cracks, snow drifts, lodge (logs with cylinder gradients and grain, snow roof with icicles, warm windows, lantern, smoke), dark near spruces rim-lit by the aurora, vignette. Light logic: aurora (cool, from above) + warm window glow that spills on bank snow and ice.

## Honest realism rating (vs the doodle slots: clearly a step up, "polished 3D-render mobile icon", not photo)
- Ice crystal / glass: 8/10 (faceting, refraction hints, rim light read well; still clean vector gradients, no true internal depth)
- Aurora + sky: 7/10 (curtain rays look good, stars good; lacks the soft film-grain irregularity of a real photo)
- Snow: 6/10 (gradient + rim light, no sparkle or texture detail)
- Log lodge / wood: 6/10 (reads as cabin, grain subtle, small in frame)
- Mountains: 5/10 (weakest: the vertical facets look like blocky cliffs, a bit AI/vector-generic)
- Pines: 6/10 (good silhouettes, rim light helps; repetitive shape)
- Ice lake: 6/10 (reflection and cracks OK; cracks are straight polylines)
- Fur / animal / character: not tested; stay 5/10 per the pitch.
Weak spots seen: mountains blocky; lodge small and its right window partly hidden by a pine; lower ice a bit empty; plate top sheen slightly generic. Symbol plate is bright and pops on the dark scene (contrast risk of the pitch is handled).

## Performance plan
- Whole scene is STATIC: bake background.svg once to a bitmap layer (offscreen canvas / <img> from the SVG) at load; no feTurbulence or big blur runs per frame. Grain/frost filters only exist in this source; in the game they are rendered once.
- Only cheap layers animate: aurora curtain group (transform/opacity, 2-3 layers split out of the static bake), window glow opacity flicker, smoke drift, snow particles (few, transform only).
- Symbols: each <symbol> rasterised once to a cached canvas/SVG image; wins animate transform/filter-free overlays.
- Note: the SVG is 264 KB; with pre-bake there is no runtime cost beyond one decode.

## What I need from the owner
1. Verdict: APPROVE this level, REVISE (say what), or "needs real images" (then supply/approve one background JPG/WebP and I keep vector symbols).
2. Is the lodge too small / should it be bigger and the reel window shifted left?
3. OK for reel window 600x540 (6x5) as marked, or different size.
