# Slot #4 finalist pitches (maya: mechanics/math, leo: look & sound)

Owner direction (Round 9): much more detailed and realistic art, shared bonuses + one unique bonus. Not dwarf/forge, not underwater, not Japanese tea house.
Created by leo because maya's file did not exist yet. Maya: fill each "Mechanics & Math (maya)" block; do not edit the "Look & Sound (leo)" blocks.

## The honest realism ceiling (applies to all three)
Everything is inline SVG + CSS + Web Audio in one offline HTML file. No image generator, no photos.
- What SVG can do well: layered linear/radial gradients for metal, glass, lacquer, enamel; specular highlights and rim light; feGaussianBlur depth-of-field layers; feDropShadow / blurred contact shadows; feTurbulence + feDiffuseLighting / feSpecularLighting for wood grain, leather, frost, brushed metal, stone bump (static, rendered once, cached); mask/clip for reflections and caustics; CSS blend modes for light bloom. Result: a "high-end rendered mobile-game icon" look (think polished 3D-rendered casino icons). Convincing for hard materials: brass, glass, gems, lacquer, enamel, ice, polished wood.
- What it cannot do: photoreal skin, fur, hair, fabric weave, faces at film quality, true volumetric clouds/foliage. Characters will read as "semi-realistic stylised 3D-render" (Pixar-ish, painterly), not photographs.
- Where real assets would be needed to go further: painted/photo backgrounds (a single compressed 1920x1080 JPG/WebP, about 150-400 KB, base64 inline, fits the 16 MB offline file easily), a character render with real fur/skin, material textures. Without a generator we would need the owner to supply or approve sourced images, or accept the vector ceiling.
- Performance rule from slot #3 (heavy scene perf): heavy filters (turbulence, lighting) render ONCE into a static layer, never animated; animate only transforms/opacity of cheap layers.

---

## Pitch A: CRIMSON ORCHID (Victorian glasshouse at night)

### Mechanics & Math (maya)
(maya fills: main mechanic must differ from Ways+Drift, Cluster+Tumble+Heat, Lines+Furoshiki+Tin Rush+Steeping. Leo's hook idea: vines that grow and overgrow cells over a bonus, spreading from planted seeds.)

### Look & Sound (leo)
- Theme / name: **CRIMSON ORCHID: The Glasshouse of Dr. Thorne**. Slug `crimson-orchid`.
- World and mood: a vast iron-and-glass Victorian conservatory at night in rain, 1890s, full of rare tropical plants; moonlight through the dome, brass gas lamps, mist. Mood: hushed, lush, a little dangerous, "botanical mystery". Wet, warm, green.
- Character: **Dr. Ivy Thorne**, botanist and collector, semi-realistic stylised render, mid-30s, goggles pushed on a pinned-up hair bun, leather apron over a green waistcoat, brass pruning shears, a glowing lantern. Personality: precise, dry wit, obsessive, secretly delighted. States: idle (wipes a leaf, checks a pocket watch), spin (taps the glass case), win (nods, snips a bloom), big (kisses a flower, lantern flares), special (leans in, magnifier up), tease (holds breath, the orchid bud trembles), bonus (gloves on, vines creep behind her), maxwin (the crimson orchid opens, light pours over her).
- Symbols (11), how each reads as realistic:
  1. Brass Magnifier, 2. Pocket Watch (open, glass crystal reflection, ticking hands), 3. Corked Glass Specimen Vial (liquid meniscus, refraction highlight), 4. Leather Field Journal (stitched, worn edge, embossed), 5. Pruning Shears (steel with specular edge, wood grip), 6. Terracotta Pot with fern (low tier, matte clay gradient), 7. Venus Flytrap (green translucent leaf, wet specular), 8. Blue Morpho Butterfly in a glass dome (iridescent gradient), 9. Ghost Orchid (pale, translucent petals with rim light), 10. WILD: Crimson Orchid (deep red velvet petals, dew drops, glow), 11. SCATTER/COIN: Seed Pod with gold glow (bonus trigger). Low tier stays 3 matte materials (clay, paper, brass), top tier uses glass/gem/wet-petal materials where gradients shine.
- Key background: glasshouse interior, camera looking down a central aisle, iron ribs converging to a vanishing point, domed glass ceiling with rain streaks. SINGLE LIGHT SOURCE: the moon through the dome (cool, from top-back), with warm brass lamps as practical fills only on the near side. Layers: far dome + moon (blurred), mid plants (soft blur), reel-frame wrought iron in focus, foreground leaves (large, strongly blurred) at corners for depth. Cheap mist: two slowly drifting low-opacity gradient bands.
- Palette: deep emerald (#0f3b2e), moonlit teal-blue (#7fb6c9), brass (#b8892f), crimson orchid red (#a4122b), warm lamp amber (#ffcf80), near-black green shadow (#05150f).
- Music vibe: Gothic-lush, **72 bpm in 6/8 lilt**, D harmonic minor; instruments: music-box pluck (sine+triangle, bell overtones), warm pad (detuned saw lowpassed), soft harp arpeggios, low cello-like drone (saw+filter), rain noise bed (filtered noise, very low), harpsichord-style pluck on wins. Bonus: 96 bpm, adds tremolo strings and a pulsing heartbeat kick.
- 2 signature sound moments: (1) **The orchid blooms**: a rising glass-harmonica sweep (stacked sine partials) ending in a soft petal "pfff" noise burst and a bright major-chord bell; (2) **Vine overgrowth**: creaking wood (filtered noise with pitch glide) + leaf rustle sweeps across L to R as cells are claimed, with a low root-thump per cell.
- Realism technique: glass domes/vials with radial gradient + crescent specular + refraction lens clipping; metals as 4-5 stop linear gradients with a sharp highlight band; petals as translucent radial gradients with rim light and dew as small radial highlights; wet leaf specular via lighting filter, cached; blurred foreground leaves via feGaussianBlur on static layer.
- Realism ceiling and risk: **achievable at 7/10 realism** for symbols (objects are hard materials, SVG's strength). Plants and Dr. Thorne's face/hair are the weak spot: risk of "plastic" look. Mitigation: plants stylised-lit rather than botanical-accurate, the character shown 3/4 back-lit with soft rim light, face simple and well-shaded. Full cinematic background would be much better with ONE real painted/photo image, but vector is feasible. Performance risk: many blurred layers; keep to ~6 static layers.

---

## Pitch B: GILDED DEPARTURE (1920s night train through the Alps)

### Mechanics & Math (maya)
(maya fills. Leo's hook idea: reels are compartments/carriages, a moving carriage strip; collectible keys / stops; train picks up passengers (wild multipliers).)

### Look & Sound (leo)
- Theme / name: **GILDED DEPARTURE: The Midnight Express**. Slug `gilded-departure`.
- World and mood: a luxury 1925 sleeper train winding through snowy Alps at night; mahogany, brass, velvet, crystal, art-deco enamel. Mood: elegant, hushed intrigue, travelling glamour, a mystery on board (Murder-on-the-Orient-Express energy but gentle, no violence).
- Character: **Conductor Marguerite Vance**, poised, early 40s, navy uniform with gold braid and cap, white gloves, silver whistle, pocket watch. Personality: composed, knowing, impeccably polite, hides a thrill-seeker. States: idle (checks the watch, adjusts a glove), spin (raises a hand, "all aboard" nod), win (tips cap), big (blows whistle, steam), special (opens the ticket punch), tease (hand on the brake lever), bonus (takes the engineer's cap, lever forward), maxwin (golden train rolls in behind her, confetti of tickets).
- Symbols (11): 1. Punched Ticket (paper fibre, perforation), 2. Brass Key with tassel, 3. Ornate Brass Number Plate "7", 4. Crystal Champagne Coupe (glass and bubbles inside, no float-away bubbles), 5. Silver Teapot Samovar (reflective), 6. Velvet Ruby Gem-set Brooch, 7. Pocket Watch, 8. Leather Suitcase with brass corners and stickers, 9. Art-deco Locomotive medallion (enamel + gold), 10. WILD: The Conductor's Golden Whistle, 11. SCATTER: Golden Ticket / Station Clock. Realism per symbol: brass and silver use high-contrast reflective gradients (easy in SVG), crystal and enamel read well, velvet and leather via feTurbulence bump cached, paper by soft shadow and fold gradients.
- Key background: view from inside a lounge carriage through a large arched window: snowy Alps and a passing mountain village flickering, steam; mahogany wall and brass fittings framing the reels like a window frame. SINGLE LIGHT SOURCE: a warm amber ceiling lamp inside; the outdoors is blue moonlit and dim (cold/warm contrast), reflections of the lamp ghosted on the window glass. Parallax: 3 snow layers slide at different speeds (just a translateX tile loop, cheap), light flicker as the train passes poles.
- Palette: mahogany (#4a1f14), antique brass (#c79a3c), deep burgundy velvet (#6a1020), night alpine blue (#16284a), snow white (#e8eef7), champagne gold (#f2dfa4).
- Music vibe: **108 bpm swing, 1920s jazz-noir, F minor/blues-ish**, instruments: upright-bass pluck (triangle + lowpass), brushed snare (noise), muted trumpet (saw bandpass with vibrato), clavinet-like piano (square plucks), train rhythm (noise chuff on 8ths, always on, low), steam whistle (two detuned sines + noise). Bonus: 132 bpm, adds driving ride cymbal and full chuff.
- 2 signature sound moments: (1) **Whistle and departure**: two-tone steam whistle (sine pair, noise breath) then accelerating chuff that ramps tempo for the bonus intro; (2) **Ticket punch**: sharp "ka-chunk" metal click (filtered click + short resonant ping), used per scatter lock; the 3rd scatter adds a station-bell ding.
- Realism technique: brass and silver using 5-stop gradients with environment-reflection bands, sharp specular streaks; crystal glass via nested clips and caustic highlight; mahogany via feTurbulence stretched along one axis (wood grain), lit by feDiffuseLighting from the lamp direction, cached once; window glass reflection via a blurred mirrored copy of the lamp at low opacity; soft contact shadows on every symbol plate.
- Realism ceiling and risk: **best fit for vector, 8/10 on objects and environment** (hard polished materials and one lamp is exactly what SVG does well). The weak point is the Conductor's face; keep her slightly stylised and under a cap brim shadow (hides expression difficulty). Risk: similarity to generic "gold luxury" casino looks; keep it distinct via the train motion and night-alpine view. Window animation must be cheap (tile loop).

---

## Pitch C: AURORA LODGE (polar night, northern lights)

### Mechanics & Math (maya)
(maya fills. Leo's hook idea: aurora bands sweep across rows/columns and charge cells; charged cells pay or multiply.)

### Look & Sound (leo)
- Theme / name: **AURORA LODGE: Trapper's Night**. Slug `aurora-lodge`.
- World and mood: a remote log hunting lodge on a frozen lake in Arctic Lapland / Alaska, deep polar night, the aurora borealis rippling overhead, snowstorm clearing. Mood: awe, solitude, cosy warmth inside versus vast cold outside; quiet magic.
- Character: **Aino**, a weathered Sami-style guide in a fur-trimmed parka (stylised), with her loyal **lynx or husky companion, Tuuli**. Personality: calm, laconic, kind, a little superstitious. Tuuli reacts more than she does (ears, tail, head tilts). States: idle (warms hands at the stove, dog breath fog), spin (looks at the sky), win (smiles, dog yips), big (arms raised, the aurora flares), special (points up), tease (holds still, the dog freezes), bonus (stands on the ice, lights a lantern), maxwin (aurora spills full width, both under a corona).
- Symbols (11): 1. Antler Carved Knife, 2. Iron Kettle on stove, 3. Wool Mitten pair (knit texture cached), 4. Snow Goggles, 5. Compass (glass + brass), 6. Lantern (glass flame, warm), 7. Silver Fox (fur stylised), 8. Polar Owl, 9. Aurora Crystal (ice gem, refracts green-violet), 10. WILD: The Aurora Orb / Northern Star, 11. SCATTER: Fire Spirit Ember (warm orange in cold palette). Realism: ice and crystal are strong (refraction gradients, internal caustics); metal compass/lantern fine; knit and fur only stylised.
- Key background: a frozen lake view, lodge on the right with warm windows, black pines, a vast starry sky with aurora curtains. SINGLE LIGHT SOURCE: the aurora (cool green-violet, from above, reflected in the ice). The lodge windows are secondary warm accents only. Ice reflection = a vertical flip of the sky layer, blurred, low opacity (very cheap). Aurora: 3-4 blurred wavy gradient curtains, slow transform/skew animation + mix-blend-mode screen.
- Palette: polar night (#050b1c), aurora green (#4dffb0), aurora violet (#8a5cff), ice blue (#a6dcff), warm lodge window (#ffb454), snow (#dce9f5), spruce (#0b2a2a).
- Music vibe: **64 bpm, ambient, D Dorian/Lydian**, instruments: glassy pad (detuned triangles), shimmering sine arpeggios with long delay, low bowed drone (saw lowpassed), soft wind (filtered noise with slow LFO), sparse sleigh-bell/ice-chime high pluck (FM sine). Bonus: 84 bpm, adds a pulsing sub, kalimba-like pluck, wind swells. Calmest of the three.
- 2 signature sound moments: (1) **Aurora sweep**: a huge slow ascending shimmer (stacked detuned sines gliding + filtered noise swell) with a single chime hit per charged cell; (2) **Ice crack and chime**: sharp filtered-noise crack then a pure glass-bell tone with long reverb, used when a crystal pays.
- Realism technique: sky as a gradient with noise-free star points (small radial dots, hand-placed) and an aurora from blurred gradient paths; ice crystals by layered polygons with per-face gradients plus rim light and internal refraction lines; snow as soft white gradients with blue shadow; lodge log texture via feTurbulence (cached) lit with feDiffuseLighting from the aurora direction; heavy depth blur on far tree layer.
- Realism ceiling and risk: **sky and ice 8/10** (gradient-friendly and blurry subjects are forgiving); **fur, knit and animal anatomy 5/10** (weakest of the three; the companion animal is the biggest risk and could look cartoon-flat next to the sky). Mitigation: silhouette-lit the animal. Also lowest contrast scene: symbols must pop against a dark background (use bright rimmed plates). Where a real asset would help most: a photographic aurora sky.

---

## Comparison (look & sound)
| | A Crimson Orchid | B Gilded Departure | C Aurora Lodge |
|---|---|---|---|
| world | Victorian glasshouse | 1920s night train | polar night lodge |
| single light | moon through dome | warm ceiling lamp | aurora |
| palette | emerald/brass/crimson | mahogany/gold/burgundy | ice/aurora green/violet |
| tempo/scale | 72 bpm 6/8, D harm. minor | 108 bpm swing, F minor | 64 bpm, D Dorian |
| realism fit for SVG | 7/10 | 8/10 | sky 8, fur 5 |
| risk | plants/face look plastic | generic gold-luxury | animal + low contrast |
| distinct from slots 1-3 | dark green night (Grumble is dark teal, check) | warm interior (Ember is warm), cold window | cold dark (new) |

Leo's ranking: B (best realism-per-effort and most different mechanic hooks), then C, then A (A risks resembling Grumble's dark teal mood).

## Art-direction test (leo, for the CHOSEN pitch, before anything else is built)
Deliver two static SVG/HTML stills the owner can see in a browser, nothing else:
1. ONE hero symbol at big size and at game size. Pitch B: the Brass Pocket Watch / Brass Key; Pitch A: the Pocket Watch with glass crystal; Pitch C: the Aurora Crystal. It includes a symbol plate (tier rim, contact shadow, specular, inner glow).
2. ONE background frame at 1280x720 with the single light source, blurred depth layers and the empty reel window (Pitch B: lounge window; A: glass dome aisle; C: frozen lake).
Time box: one focused pass, then render with Playwright, critique, one refine. Owner replies APPROVE / REVISE / "needs real images". If the owner says the vector result is not realistic enough, the fallback is a single supplied/approved raster background (base64 JPG/WebP) with vector symbols on top.
