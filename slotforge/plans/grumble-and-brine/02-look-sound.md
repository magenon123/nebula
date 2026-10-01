# GRUMBLE & BRINE: Deep Salvage — Look & Sound (leo)

SLUG `grumble-and-brine`. Mechanic (maya, `01-features-math.md`): 5x3, 243 ways (3-of-a-kind from the left), no tumbles, Drifting Wilds (Lantern Jelly steps one reel left per Drift respin, multiplier +1). This document is everything kai needs for art, character, shell skin, sound and copy. Everything is inline SVG + CSS + Web Audio; no files. Symbol ids `s0..s10` keep the EmberClaw contract. Viewbox for symbols `0 0 64 64`, character `0 0 480 500`, same as EmberClaw so the shell does not change.

---------------------------------------------------------------------
## 1. Concept & mood

The seabed junkyard of a sunken harbour, where **Captain Barnacle**, a retired, perpetually annoyed crab in a dented brass diving helmet (one eyebrow permanently lowered), runs a salvage business out of a wrecked tugboat. The reels are his salvage table: boots, cans and keys that he complains about, and the odd pearl he pretends not to care about. Lantern jellyfish drift through the water and he mutters at them, but they are what actually pays. Tone: salty, dry-humoured, warm lamplight in cold water, a sulky grandpa who secretly loves the job.

Mood adjectives: **grumpy, murky-cosy, glowing**.

Colour story: cold teal water everywhere, ONE warm thing at a time (his helmet lamp, the amber lanterns, the winning symbols). Warm = money. Anything that glows cyan/magenta = the Jelly (wild).

---------------------------------------------------------------------
## 2. Palette

Define as CSS variables `--ink`, etc. All outlines are `--ink`, never pure black.

| role | name | hex |
|---|---|---|
| outline ink | Wet Ink | `#0b1820` |
| scene 1 | Abyss Navy (sky/top water, bg) | `#071c30` |
| scene 2 | Murk Teal (mid water, hull planks lit) | `#13525c` |
| scene 3 | Kelp Green (seabed, weed, glass) | `#2c7a62` |
| accent 1 | Lantern Amber (money, light, win highlight) | `#ffb938` |
| accent 2 | Coral Pink (danger/flair, pearl shell, UI hot) | `#ff6f7d` |
| accent 3 | Jelly Cyan (wild, magic) | `#5df2e0` (secondary magenta `#c65bff`) |
| UI plaque body | Hull Plate (dark painted iron) | `#1b2d36` |
| UI plaque trim | Rusted Brass | `#b88a3e` (highlight `#e8c46a`, shadow `#6b4a1c`) |
| UI plaque paper | Chart Cream (labels, info screen cards) | `#f2e5c2` |
| UI rust | Rust Orange | `#c4602a` |
| bubble/foam | Foam | `#d9fbff` at 40-70% opacity |

Hatch pattern colour is `--ink` at 35-50% opacity (as EmberClaw `hatchS/C/L`). Paper-grain overlay and halftone dots: reuse EmberClaw's `#grain` and `dots` pattern with ink `#0b1820`.

---------------------------------------------------------------------
## 3. Logo

Two-line plaque, painted-on-wood-and-brass look.
- Line 1 **GRUMBLE & BRINE**, font: the shared cartoon font (Google Fonts "Bangers" or whatever the shell loads; fallback `Impact, sans-serif`), uppercase, letter-spacing +2px. Each letter is rotated individually by a deterministic pseudo-random -3..+3 deg and shifted -3..+3 px vertically (so it reads as hand-lettered). The `&` is bigger (140%), Coral Pink, hanging as if on a hook, with a tiny drip.
- Fill: letters Chart Cream `#f2e5c2` with a 7px Wet Ink stroke (paint-order: stroke), a second offset shadow layer in Rust Orange (+4,+5). Lower half of each letter gets the hatch pattern. `GRUMBLE` has one wonky letter: the `U` is slightly tipped, with a barnacle (3 grey-white bumps) on its top left.
- `BRINE` has small bubbles (3 circles, Foam outline) rising off the final `E`.
- Line 2 (subtitle, small, on a rope banner 70% of the width): **DEEP SALVAGE**, Lantern Amber on Hull Plate, letter-spacing 6px.
- The logo lives top-centre/left above the board like EmberClaw's logo; whole logo bobs 2px / 4.5s (like floating), a tiny bubble spawns off it every 3s.

---------------------------------------------------------------------
## 4. Scene (back to front, 1600x900 stage)

Allowed to be a painted look using gradients/filters (EmberClaw's scene is the model: `smoke`/`rock`/`glowB` style filters).

1. **Water column** (full stage): linear gradient top `#0d3a52` (y=0) -> `#071c30` (y=450) -> `#04101c` (y=900). Over it, a faint vertical gradient of lighter teal at top-centre (radial, `#2aa1a8` at 25% opacity, radius 700) = sunlight from the surface. STATIC gradient.
2. **God-rays**: 5 to 6 long skewed trapezoids from the top (x 200..1300), fill white-teal `#8ff5ea` opacity .06-.12, blurred (`glowB`). Animate: each ray's opacity oscillates .05<->.13 with different periods 7-13s, and the group shifts translateX +-18px over 20s. This is the main always-moving thing.
3. **Far silhouette** (y 380-640): wreck skyline in `#0a2a3d` at 70% opacity, softly blurred (haze): a cargo ship hull lying on its side (left, x 60-560, long diagonal, 2 broken masts), a lighthouse stump with a tilted lantern room (x 1250-1350), a crane arm. These are STATIC.
4. **Marine snow / bubbles** (particle layer): 40 small circles (r 1-4, Foam, .3-.7 opacity) rising slowly (translateY -950px over 9-20s, with small x sway, linear infinite, random delay). 3 big bubbles (r 10-16) with a highlight crescent. Use CSS animation, no JS per frame.
5. **Seabed** (y 650-900): painted rock/sand using an feTurbulence + feDiffuseLighting filter (copy EmberClaw `rock` recipe, light colour `#6fb3a8`, surfaceScale 4, azimuth 215) multiplied with sand tone `#2a5a55`. Foreground ridge line in Wet Ink, hatch overlay on shadow side.
6. **Junk pile left foreground** (x 0-380, y 560-900, framing the Bonus Buy side): heap of an anchor chain loop, a stack of 3 tyres (dark ring with hatch), a broken barrel, an old diving suit with empty arms (legs crossed, hanging from a hook: gently sways +-2deg/6s). Coral growth in Coral Pink with dots.
7. **The tugboat wreck** (right, behind the character, x 1080-1600, y 250-900): the character's workshop. Hull plates in rusted red `#8a3a24`/teal-green patina, a round porthole (x~1480, y~380, r 55) with amber light inside (FLICKERS: opacity .75-1, random 2-5s), a dented smokestack with a barnacle ring, hanging rope + a hook with a crooked "OPEN: MOSTLY" wooden sign (cream plank, Coral Pink text, swings +-4deg/4s). A brass pressure gauge on the hull whose needle jumps in bonus.
8. **Kelp** (both sides, x 380-420 and x 1040-1090, bottom to y 420): 3-4 blades each, Kelp Green `#2c7a62`, lighter rim `#6fd1a0`, Wet Ink outline 4px. Animate each blade `rotate(-4deg..4deg)`, transform-origin base, 4-7s, staggered. SWAYS.
9. **Hanging lanterns** (3 along the top of the frame, x 520, 800, 1080): amber glass lamps on thin chains (the same chain look as the Bonus Buy sign). Warm radial glow r 120 amber at 25% opacity; glow flickers .6-.9. These light the board top.
10. **Grain overlay and vignette** on top: `#grain` as EmberClaw, plus a radial vignette (transparent centre, `#02080f` 55% edges).

What glows: lanterns, porthole, Captain's helmet lamp, Jelly wilds, Sonar Buoy lamp, win symbols. What is static: far silhouette, seabed, junk pile (except the hanging suit), tugboat hull. What moves always: god-rays, bubbles, kelp, lantern flicker, logo bob, Bonus Buy sign sway (shell).

---------------------------------------------------------------------
## 5. Board frame

Material: a **salvaged ship-hatch frame**: riveted dark iron (`#1b2d36`) outer border 26px, inner trim of brass (`#b88a3e`, highlight on the top and left edges, shadow bottom-right), the cell window is like a porthole row glass: the reel area has a very dark teal translucent back (`rgba(4,20,32,.72)`) with a 3px Wet Ink inner border. Vertical reel dividers: thin rope-lashed bars (rope = 2 twisted strokes in cream `#d9c79a` and `#a88f5e`, alternating short diagonal ticks).
- Corner rivets: big domed brass rivets (r 9) at the four corners and every ~120px along the top and bottom edges; each has a highlight dot and an ink outline; rotate each slightly.
- Rust: 6-8 orange `#c4602a` streak drips under the rivets, low opacity .5, hatched.
- Barnacle clusters (white-grey bumps) stuck on the bottom-left and top-right corners, asymmetric.
- Hanging from the top rail: 3 small chains with the amber lanterns (scene item 9 can be positioned to hang from here), and a rope with a tiny tag reading "NO REFUNDS" (cream tag, ink text) on the right.
- Seaweed strand draped over the top-left corner, sways.
- Behind the left edge, a corner brace holds the **Drift gauge** (the side mechanic from maya's doc, whatever she wants: a column on the left under the Bonus Buy sign, see section 9) — a brass glass tube like EmberClaw's Forge Core tube but with water and a bubble that rises.
- Reel area: 5 columns x 3 rows. Cell sizes as EmberClaw's shell supplies them.

---------------------------------------------------------------------
## 6. Symbols

Style rules for all: `<symbol viewBox="0 0 64 64">`, wrapped in `<g filter="url(#roughS)">` (displacement ~2.6); outline `#0b1820` 3.5-4px, round joins; flat colours; shade side (lower-right) with a hatch overlay (`hatchS`); one white/cream highlight stroke on the upper-left; one 4-point sparkle on high symbols only. Silhouette fills about 80% of the 64 box. Each symbol has a distinct DOMINANT COLOUR and SILHOUETTE so that all nine are separable at 100px even in greyscale.

| id | name | tier | dominant colour | silhouette |
|---|---|---|---|---|
| s0 | Old Boot | low | Mustard yellow | L shape, vertical |
| s1 | Tin Can | low | Steel blue-grey + red label | upright cylinder |
| s2 | Message Bottle | low | Bottle green | tall diagonal capsule |
| s3 | Rusty Key | low | Rust orange | horizontal-diagonal key |
| s4 | Brass Compass | mid | Brass gold + red needle | circle |
| s5 | Barnacle Anchor | mid | Slate iron + coral pink growth | anchor "T/U" |
| s6 | Golden Doubloon | high | Gold + dark skull emblem | flat round coin, tilted, notched edge |
| s7 | Rusty Harpoon | high | Dark iron + red rope + bone-white barb | long diagonal spear |
| s8 | Pearl Clam | high (top pay) | Lilac/pink shell + white pearl | scallop fan |
| s9 | Lantern Jelly | WILD | Cyan glow + magenta | dome with tentacles |
| s10 | Sonar Buoy | SCATTER | Red + white stripes | tall rounded buoy with lamp |

**s0 Old Boot** (low). Rubber wellington, toe pointing LEFT. Primitives: leg tube = rounded rect `x20 y6 w22 h34` fill `#e3b43a`; foot = path from ankle to toe `M20 36 Q18 52 8 54 Q6 60 14 60 H46 Q54 60 52 50 L42 40Z` fill `#e3b43a`; sole = darker strip `M8 56 H52 V60 H12Z` `#7a5a22`; a patch of tape (2 crossed rects, cream) on the shin; a green weed strand `#2c7a62` hanging out of the top and a tiny orange crab leg? (NO: that is the Captain). Distinguishing detail: a hole in the toe showing a darker patch and a small seaweed strand sprouting from the top. NOT: a stylised shoe, a sock, a bag.

**s1 Tin Can** (low). Cylinder: body rect `x16 y14 w32 h38` rx3 `#8fa3b5`, top ellipse `cx32 cy14 rx16 ry5` lighter `#c3d0dc` with a rim, the lid half-peeled back (a curled flap path rising on the right). Label band `y24-42` `#d8402e` with a cream circle badge showing a tiny white fish silhouette. Dents: two slashed curve lines. Hatch on right third. Distinguishing detail: the red label with a fish and a curled lid. NOT: a barrel, a battery, a soda can with a pull tab.

**s2 Message Bottle** (low). Tilted 25 degrees (top-right). Glass `#3fae7e` with lighter highlight band; round belly path `M24 22 Q10 30 14 48 Q18 58 32 56 Q46 54 46 40 Q46 28 36 22Z`; neck rect to the top-right; cork `#d6a15a` with ink outline; inside a rolled paper scroll `#f2e5c2` with a red wax-seal dot; a few small bubbles (circles) in the corner. Distinguishing detail: paper scroll with a red seal inside the glass. NOT: a potion with a skull, a wine bottle.

**s3 Rusty Key** (low). Diagonal (bow at lower-left, bit toward upper-right). Bow: a ring (circle r12 stroke 8, `#c4602a`, ink outline stroke 12 beneath) with a clover-shaped hole; shaft rect `#a8481f`; two teeth blocks at the end; rust speckles (little darker `#7a2f12` irregular blobs) and a bright edge `#f19a58`. One tiny green weed wrapped around the shaft. Distinguishing detail: ring bow with the clover cut-out and three rust blobs. NOT: a golden key (gold is for Compass), a skeleton key with ornate gold.

**s4 Brass Compass** (mid). Round case seen from above: outer ring circle r26 `#e8b23c` stroke ink 4, inner ring r21 `#8a5a1a`, face r18 cream `#f2e5c2` with 4 tick marks and the letter N in Coral Pink; needle = two triangles (red north `#d8402e`, white south) rotated -35deg; a small loop at the top for the chain (ring) and a crack across the glass (a white zigzag stroke). Hatching lower-right on the ring. Distinguishing detail: red-and-white needle with a cracked glass and an N. NOT: a clock, a sun, a gold coin.

**s5 Barnacle Anchor** (mid). Classic anchor: ring at top (circle r6 stroke 5), shank rect `x29 y8 w6 h40`, stock bar `x18 y16 w28 h6`, curved arms: path `M10 38 Q14 56 32 56 Q50 56 54 38` stroke 7 slate `#58708a` over ink stroke 12; arrow-head flukes (triangles) at both tips. Coral Pink barnacle/coral clumps (5 small circles and 2 coral branches `#ff6f7d`) on the left arm and at the base; a wrap of chain (3 small links) at the ring. Distinguishing detail: pink coral growth hugging the left fluke. NOT: a ship's wheel, a hook, a cross.

**s6 Golden Doubloon** (high). A fat old coin, tilted 18 degrees, seen slightly from the side so its thickness shows (a second offset ellipse). Primitives: edge ellipse `rx25 ry24` darker gold `#b9801f`, face ellipse `rx23 ry22` gold `#ffc83a` with a ring groove (stroke `#b9801f` 2.5, inset 5); emblem: a tiny skull (circle r6 cream, two ink dots, a tooth line) over two crossed bones; a nick bitten out of the rim at upper-left (path cut, background shows) and a green weed smudge. Highlight arc cream upper-left, hatch on the lower right. Gold here is warmer and flatter than the Compass (which has a cream face, a red needle and a ring loop). Distinguishing detail: skull-and-crossbones on a solid gold disc with a bite out of the rim. NOT: a casino chip, a dollar coin, a star.

**s7 Rusty Harpoon** (high). Long spear on the diagonal (tip upper-right). Shaft: wood stroke `#8a5a2e` width 6 over ink 11; a big arrow-head barb `M44 6 L58 6 L52 20 L58 24 L42 24 Z`-like two-barbed head in iron `#6c7d86` with a bone-white `#ece3c8` edge highlight; below the barb a lashed coil of red rope `#d8402e` (4 parallel short strokes crossing the shaft); the tail end has a small iron ring with a loose rope loop curling down-left. Rust spots `#c4602a`. Distinguishing detail: barbed head + red rope coil, the only long diagonal dark object with a red wrap. NOT: a Poseidon trident (no three prongs), a sword, a pencil.

**s8 Pearl Clam** (HIGH, top pay). A big open scallop shell: lower half fan shape with 7 ribs (`M8 46 Q8 20 32 14 Q56 20 56 46 Q32 58 8 46Z`), colours lilac `#b783e0` ribs alternating `#8e5cc0`, rim light `#e6c8fa`. Upper half lid propped open behind (darker). Inside, centre: a big white pearl (circle r11, fill `#fffdf5` with a pale pink shade `#ffd6e0` lower right, highlight dot) resting on a coral-pink cushion `#ff6f7d`. 4-point sparkle top right (white, ink outline). Add 3 tiny rising bubbles. Distinguishing detail: the big shiny pearl with sparkle in an open, ribbed lilac shell. The only symbol with a lilac palette and a white sphere. NOT: a gem, a pink flower, a taco.

**s9 Lantern Jelly** (WILD). Dome bell `M10 30 Q10 6 32 6 Q54 6 54 30 Q32 36 10 30Z` fill gradient (the only gradient allowed in a symbol): `#5df2e0` at top -> `#c65bff` at the bottom edge with ink outline; a bright inner lantern glow: ellipse `cx32 cy22 rx12 ry9` white-cyan `#e8fffb`; 4 frilly oral arms/tentacles `M20 34 q-4 10 2 14 q6 4 0 12` etc. stroke 4 cyan with ink outline beneath, wavy; a small "W" is NOT used. Face: two tiny dot eyes and a sleepy line mouth in ink (this is the Captain's favourite pet, keep it cute). Distinguishing detail: glowing lantern bulb in the dome + wavy tentacles + tiny face. In play, a cyan outer glow `glowS` pulses behind it .5s. Slot cell shows multiplier chip (see below). NOT: an octopus, a ghost, a bell.

**s10 Sonar Buoy** (SCATTER). Fat tapering buoy: body path `M18 54 Q14 30 26 20 H38 Q50 30 46 54Z` with 4 horizontal bands alternating red `#d8402e` and cream `#f2e5c2`; a black rubber base rect (`#2a3a44`); a cage mast (two lines) on top holding a lamp: circle r8 amber `#ffb938` ink outline with a white highlight. Two concentric half-rings (sonar waves, Foam stroke 3, opacity .8) either side of the lamp. Distinguishing detail: red/cream stripes plus amber lamp and sonar arcs; the only red-striped symbol. NOT: a bell, a lighthouse, a candy.

Tiers: low = s0-s3 (small icons, dull colours), mid = s4, s5 (brass/iron), high = s6, s7, s8 (s8 top), special = s9 wild and s10 scatter. Pay order is maya's. Gold is used only by s4 (ring) and s6 (disc); the others are told apart by shape and secondary colour.

**Win/idle effects (CSS):** `wob` idle on winners (scale 1.07, rotate 3deg), `shatter` not used (no tumbles); instead winners "bob" up 6px and cast a Foam ring outline. Landing: symbol drops with a 4px overshoot and a bubble puff (3 small circles). Scatter landing: lamp blinks and two sonar arcs expand (`ring` keyframes).

**Jelly multiplier chip:** a brass round tag r16 at the lower-right of the wild's cell, Chart Cream number in Wet Ink (e.g. `x3`), ink outline 3px. When it grows: scale 1.4 -> 1 with a Foam ring.

---------------------------------------------------------------------
## 7. Character: Captain Barnacle

Personality: an elderly, deeply unimpressed crab who has seen every sunken ship and is tired of it. Complains with every spin ("Again?!"), brightens up when money lands and tries to hide it, panics theatrically when the Jelly drifts. Silhouette: wide, low and symmetrical: a big round brass helmet on a squat orange-red shell, two oversized claws (one huge on his right with a pressure-gauge "bracelet", one small raised on his left), thin legs, stands on a crate. Helmet glass showing a tall bushy white eyebrow (one permanently lower) and a big moustache. One brass hose runs from the helmet to the back. A rusty telescope or a flag pole sits in the small claw. Reads at 100px as: "round helmet, big red claw".

Position and box: same as EmberClaw: `#char` left 1100, top 296, 480x500, svg viewBox `0 0 480 500`. He stands in front of the tugboat wreck. Ground shadow ellipse at cy 488. Crate (wood, `#8a5a2e`) at the foot.

**Body part groups** (each `<g id="cXxx" filter="url(#roughC)">`, `[id^=c]{transform-box:view-box}`):
- `#cBody` shell (orange-red `#d9532f`, hatch on the lower right, 3 little barnacles), legs, belt with brass buckle. origin 260px 488px.
- `#cHead` (the helmet group: helmet dome `#c99a45` with rivet ring, window ellipse `#bfe9ef` at 55% opacity, the hose, the lamp on top). origin 260px 262px.
  - `#cEyes` (two white eyestalk eyes in the window, `#cPupils` black circles in it, `#cLids` the half lids that droop to give the "tired" look: base lids cover top 30%).
  - `#cBrows` (one big white tuft each, left one lowered; transform on win goes up)
  - `#cMouth` (mouth under the moustache: hidden at idle; shown as a wide open red mouth `#7a1f22` with a tongue on win/big/boom)
  - `#cLamp` (the helmet lamp: amber circle + beam cone, `#cLampGlow` opacity 0 by default)
  - `#cBubbles` (3 bubbles that pop from the helmet valve; animated only in win states)
- `#cClawL` (small claw on his left of screen, arm + pincer; this holds the telescope prop `#cScope`). origin at the shoulder (314px 300px).
- `#cClawR` (the big claw, with the brass pressure-gauge on the wrist `#cGauge` whose needle `#cNeedle` is rotated by CSS). origin shoulder (205px 300px). Pincer is two parts `#cPincerTop/#cPincerBot` for the snap.
- `#cSign` (small wooden plank sign on the crate that he flips: "GRR" at idle? NO, text is simpler: not animated, optional). Skip if costly.
- `#cEyeGlow`/`#cHot` equivalents: `#cLampGlow` used for bonus mode.

Animations (idle always on): `breathe` 3.4s on body (scale 1.012,1.022); `hbob` 3.4s head translateY 3px rotate -1.2deg; claw L sway 3deg 3.4s; blink 4.6s on `#cEyes`; extra: every ~9s the left eyebrow twitch (a 0.3s `translateY(-3px)`), the claw R pincers click twice (rotate pincer 10deg, 0.15s) once per 7s. Helmet valve bubble every 5s.

| state | class / trigger | duration | motion |
|---|---|---|---|
| idle | default | loop | breathe/hbob/blink as above; right claw hangs; pincer click every 7s; eyebrow twitch every 9s. Lids half shut, mouth hidden. |
| swing (spin) | `char('swing')` on every spin start | .95s x speed var | Big claw grabs and yanks an imaginary lever: `cClawR` rotate 0 -> -50deg (30%), hold, -> 12deg (62%), settle 0; the head nods (`translateY(9px) rotate(2deg)`); the shell pulses scale 1.02; a small bubble "pop" at the helmet valve at 62%. Eyes squint (`cEyes` scaleY .6 for the duration). |
| win | `char('win')` | 1.5s | Both claws up: `cClawL` rotate -115deg, `cClawR` rotate -95deg; pincers snap 3x (`cPincerTop` rotate 14deg, .1s alternating); `cHead` bounces 3x (`cheerhead` .5s: translateY -10 rotate -3deg); eyes wide (scaleY 1.2), brows up 5px; mouth visible but a "grudging smile" shape (small): then the lids half-close again at the end (he tries to hide it). 3 bubbles rise from the valve. |
| big (Bubble / Barnacle / Salvage / Kraken tier) | `char('big')` | 3.2s | Whole body hops 6x (`hop` .4s -14px), both claws pump (`pumpL` 3.2s), the pincers snap rapidly, the helmet lamp flashes (`cLampGlow` blink 8Hz), he spins his telescope; coins/pearls (6 amber circles) burst from the crate; the head shakes side to side. Mouth wide open. |
| boom / special (a Jelly drift step; a multiplier growth) | `char('boom')` | .9s | Panic flinch: head jumps `translate(8px,-16px) rotate(8deg)`, eyes round and big (scale 1.25), brows up 5px, `cClawL` shoots up, `cClawR` drops the telescope (it rotates away and falls 40px, reappears at end). A "!" appears over his head (cream, ink outline, scale pop). Mouth open. Used on every Drift step and when the Sonar Buoys land (scatter 2+ visible). |
| anticipation (near miss, optional) | `char('wince')` | 1.2s while reels 4-5 stop with 2 buoys | Both claws over the helmet window (cover eyes: `cClawL` rotate -70deg and `cClawR` -60deg, a gap between pincers lets one eye peek), body trembles 2px at 14Hz. Remove when reels stop. |
| bonusmode (Deep Dive) | class `bonusmode` stays on `#char` | while in bonus | Helmet lamp ON (`cLampGlow` opacity 1, amber beam cone pulsing .8-1 at 1.6s), eyes become fierce amber pupils (`#cPupils circle` fill `#ffb938`), brow lowered 3px (focused), the pressure gauge needle shakes at 2Hz, a stream of tiny bubbles constantly from the valve; the crate is replaced by a net full of coins (optional). |
| outro / calm | `char('win')` once at the bonus end | 1.5s | The same as win, ends with a bow. |

Speed var: `--spd` (turbo = .5) multiplies the swing duration, as EmberClaw. `swing` must complete inside the shortest spin duration, so cap at .5s when turbo.

---------------------------------------------------------------------
## 8. Shell skin

- **Bonus Buy sign:** a **brass-and-iron ship's nameplate** hanging by two chains (chain links = EmberClaw's repeating-gradient style but in iron `#6c7d86` and darker `#2b3a42`). Sign body: Hull Plate `#1b2d36` with a brass border 6px (`#b88a3e`), four corner rivets, a cream paint-stencil header `DEEP DIVE` and the price in Lantern Amber under it; a tiny anchor icon top. A wet-look drip stains below. Sways like EmberClaw (`sway` 5.5s).
- **Bottom bar plaque:** Hull Plate steel with brass trim rail along its top and bottom, rivets at both ends, rust streak low-opacity; text (balance/win/bet) in Chart Cream with labels in Brass `#e8c46a`; win in Lantern Amber.
- **Buttons:** spin button ring: brass ring (`#b88a3e`/`#e8c46a`) with a Wet Ink outline, centre disc Kelp Green `#2c7a62` with a cream anchor-wheel arrow icon; a hover glow in Lantern Amber. While spinning, the ring turns like a ship's wheel (rot 1.2s). Autoplay: small round brass porthole button with a cream looped-arrow. Bet chevrons: brass. Autoplay running state: white square (per shared rule) with the remaining spins in Wet Ink.
- **Menu / info / bet picker:** Chart Cream cards with ink 3px border on Hull Plate background; headings in Rust Orange.
- **Bonus Buy screen cards:** white-cream cards (shell standard) with Wet Ink title, a teal icon each (Dive Ticket = a diving helmet icon; Abyss Pass = a skull-and-pearl; Deep Pressure = a pressure gauge in red).
- **Splash screens:** full-screen dark water gradient `#04101c` -> `#0f3b52`, a big rope-bordered brass plaque centred, the Captain's portrait large (reuse the character svg or a cropped head) reacting: intro: he points at the camera with his telescope and the Jelly drifts; outro: bowing with a heap of pearls. Rising bubbles all over. Title in the logo style; "TAP TO CONTINUE" blinks in Lantern Amber at the bottom.
- **Ribbon text (win ribbon):** a torn old sail banner? Cream ribbon `#f2e5c2` with Wet Ink text and a Rust Orange tail, ends with a V notch; big-win tier text in huge logo type with a Foam rim.
- **Medal / badge** (the big win medal): a brass ship's-wheel (8 spokes) with the tier name on a cream disc in the middle; Kraken medal adds tentacles curling around the wheel.
- **Toasts / popups:** water-ripple expanding rings in Foam for win amounts; the popped win number is Lantern Amber with an ink outline, floating up like a bubble (`popup` keyframes).
- **Jelly Drift VFX:** when a Jelly drifts left, a cyan streak trail with 6-8 tiny circle bubbles is left behind, and a ring-pulse is spawned on the destination cell.

---------------------------------------------------------------------
## 9. Side mechanic skin: Tide Gauge and Current Strip (per maya)

**Current Strip (base game and bonus):** a thin brass-framed channel directly ABOVE the reels (full board width, ~46px tall), 5 lanes aligned with the 5 reels. Background dark teal water `#0e4a5a` with 3 moving rows of faint Foam dashes scrolling LEFT forever (6s per loop, CSS background-position) so it always reads as "the current flows to the left". Each lane lights up with a Jelly-cyan arrow `<` when a Jelly is in that reel. On a Drift step: a cyan chevron streak travels from the Jelly's lane to the next lane left (.45s), a cream `xN` chip pops on the destination lane (scale 1.4 -> 1) and the Captain plays `special`. A **chain counter** sits at the strip's right end: brass badge `DRIFT x{k}` that bumps +1 per consecutive drift, resets with the spin.

**Tide Gauge (Deep Dive only; hidden in base game by fading out):** a vertical brass-and-glass tube on the left side where EmberClaw's Forge Core tube sits (x 60-130, y 480-800): water-filled glass `#0e4a5a`, 3 tick levels labelled `1 2 3` in cream, current level filled with cyan `#5df2e0` segments rising with a bubble (EmberClaw `segp` fill keyframes, brightness flash). Label plate on top: `TIDE`, below: `+{n}` (the persistent bonus for new Jellies). Level up: a wave ring, the glass shakes 4px, a deep `special` sound. At level 3: coral-pink flash on the frame. It must be clearly readable from afar: tube 70px wide.

---------------------------------------------------------------------
## 10. Sound design (Web Audio recipes, kai: reuse EmberClaw `makeSfx` helpers `env/osc/noise/metal/st`)

Global: master compressor as EmberClaw. Reverb: convolver impulse 2.4s stereo noise with exponent 2.2 decay and then a lowpass (one-pole at 3500 Hz, apply by multiplying samples with a running average) = dark, watery. Wet .34. Add a very short feedback delay bus for the sonar ping only (delay .32s, feedback .45, lowpass 2500).

Tone language: **sonar sine pings + bubbling, brass bell, rubbery thunks.** Scale: D minor pentatonic-ish for chimes but lifted: use semitone steps [0,2,5,7,9,12,14,17] from 392 Hz (G4) for win ladder.

| event | recipe |
|---|---|
| spin swing | noise bandpass 220->1400 Hz, Q .8, 0.2s, peak .16, attack .04 (water whoosh) + sine 140->80 Hz 0.2s peak .14 + a small bubble ("blup"): sine 300->900 Hz, 0.07s, peak .09 |
| reel spin loop (optional) | low rumble: sine 55 Hz peak .05 + noise lowpass 400 Hz peak .03, fade out on stop |
| row/reel landing `land(r)` | rubbery thunk: sine 130->62 Hz 0.13s peak .24; noise lowpass 500 Hz .06s peak .15; for reel 4 (last): add a short brass tick `metal(300, .3, .04)` |
| symbol win "pop" (no tumble: replace shatter) | for every winning symbol group at the win highlight: bubble-pop = noise highpass 3000->6000 .08s peak .18 + sine 700->1500 Hz .07s peak .1; with several overlapping, stagger 30ms |
| win chime `win(n)` | `metal(f)` partials ratios [1,2.756,5.404], f = 392*st(scale[n]), 1.0s peak .13, + triangle f/2 .5s peak .08 + noise highpass 5000 peak .03 (glass sparkle); rising with n (cascade-less: n = win size step 0..7) |
| Jelly lands | soft glassy glissando: sine 520->1040 Hz .45s peak .1 + sine 780->1560 delayed .06s peak .06 (shimmer), through the reverb wet send |
| **Drift (hook moment)** | each step: a rising sonar-like sweep: sine 400->1200 Hz over .35s peak .12 + a delayed echo copy via the ping delay bus; a wobbling "wub": sine 220 Hz with LFO (5Hz depth 30Hz) .4s peak .1; multiplier tick on arrival: `metal(520*st(mult*2), .5, .12)`. Pitch of the whole step rises 2 semitones per multiplier level |
| scatter (Buoy) lands `scatter(n)` | sonar ping: sine 1318 Hz (E6) .01 attack, 1.4s decay peak .14 through the ping delay; for n=2 a second ping a fifth higher (1976 Hz) |
| bonus trigger | 3 pings escalating (1046, 1318, 1568 Hz, .36s apart) with a deep horn swell (sawtooth stack at 55 Hz, lowpass 200->1000 Hz, .22 s attack... as EmberClaw `horn`) and a big ship-bell strike `metal(220, 2.0)` + sine 50 Hz boom |
| bonus intro | submarine dive: sawtooth 90->40 Hz 1.6s lowpass 400, + rising bubbles (10 random bubbles blup over 1.2s) + horn swell + a major arpeggio of `metal` [0,4,7,12] from 330 Hz, 1.6s each |
| bonus outro | resolving brass chord via `metal` [0,4,7,12,16] from 392 Hz staggered .13s, a horn at 82.5 Hz, and a few pearl "tink" clicks |
| big wins `big(lv)` (Bubble, Barnacle, Salvage, Kraken) | ship's bell hits (`metal(300*pitch,1.2)`) repeated lv times at .28s steps; lv 3-4 add kraken roar: sawtooth 45->32 Hz 1.5s lowpass 300 + noise lowpass 900->120 Hz 1.5s peak .3; ascending `metal` arpeggio n=3+lv notes from 440 Hz; a bubble flurry (20 blups random, 1.5s) |
| count-up tick `tick(k)` | triangle 650+900k Hz .05s peak .12 + noise highpass 6000 .02s (as EmberClaw) |
| ui click | triangle 330->220 Hz .07s peak .16 plus a bubble "blip" sine 600->900 .04s peak .06 |
| error/insufficient funds | two descending clunks: sine 180->100 Hz .15s, twice, .12 apart |
| max win / Kraken 100x | all of big(4) + boom: sine 110->24 Hz 1.5s peak .6 |
| **ambience loop** | looping bed started when sound is on: (1) brown-ish noise lowpass 260 Hz with a slow LFO on the filter freq (.07 Hz, +-120 Hz), gain .05 (deep water hum); (2) every 4-9 s random bubble burst: 3-6 blups (sine 250->800 Hz .06s peak .03) 80 ms apart; (3) every 14-25 s a distant whale-like moan: sine 90->140->100 Hz 3s peak .025 lowpass 400, through the reverb at high wet; (4) very rarely (every 30-50s) a faint ship-bell clank `metal(180, 2, .02)`. In bonus: add a slow heartbeat-like sonar sine 220 Hz pulse every 1.6s peak .03 and lift the hum to .08 |
| turbo | all event durations x0.55; skip ambience events |

---------------------------------------------------------------------
## 11. Copy

Currency/tone: dry, grumbling, short.

**Titles:** GRUMBLE & BRINE · DEEP SALVAGE.
**Splash (intro to Deep Dive):**
- Title: `DEEP DIVE`
- Sub: `{n} FREE DIVES` (8 for 3 buoys, 10 for 4, 12 for 5)
- Line: `"Fine. Hold your breath. Don't touch the Jellies."`
- Footer: `TAP ANYWHERE TO DIVE`
**Splash (outro):**
- Title: `SURFACING`
- Lines: `YOU SALVAGED` + amount, `"Hmph. Not bad. Don't get used to it."`
- Footer: `TAP ANYWHERE TO SURFACE`
**Status lines (under the board / in the ribbon):**
- idle: `PLACE YOUR BET, KID`
- spinning: `SIFTING THE JUNK...`
- win: `SALVAGED $x`
- no win: `JUST JUNK`
- drift: `DRIFT! x{m}` / `THE JELLY DRIFTS`
- 2 buoys: `ONE MORE BUOY...`
- bonus trigger: `SONAR PING! DEEP DIVE`
- buying: `SIGNING THE TICKET...`
- max win: `MAX SALVAGE REACHED`
**Big-win tiers** (5x / 10x / 25x / 100x): `BUBBLE` · `BARNACLE` · `SALVAGE` · `KRAKEN`. Taglines: Bubble `"Meh. Pocket change."`; Barnacle `"Stuck to the hull and paying."`; Salvage `"Now THAT is a haul!"`; Kraken `"RELEASE THE KRAKEN MONEY!"`.
**Feature cards (Bonus Buy screen):**
- `DIVE TICKET` — "Skip the sifting. Go straight to the Deep Dive with {n} free dives. Jellies drift left and grow." Volatility: HIGH. Price: {100}x.
- `ABYSS PASS` — "The premium ticket. Start the dive with a bigger herd of Jellies and a head start on the multiplier." Volatility: VERY HIGH. Price: {500}x. (maya sets exact content)
- `DEEP PRESSURE` — "Bet more, dive deeper. Costs 2x bet. Deep Dives become about 3.5x as likely." Toggle: ON/OFF. (maya's exact multiplier)
**Info-screen rules text:**
1. `5 reels x 3 rows, 243 WAYS. 3 or more matching symbols on adjacent reels from the left pay, any position on each reel.`
2. `LANTERN JELLY (wild) substitutes for all symbols except Sonar Buoy. Each Jelly carries a multiplier.`
3. `DRIFT: after any winning spin, every Jelly drifts one reel left and its multiplier grows by 1. The ways are re-evaluated; the drift continues while a win occurs. A Jelly leaves the board after reel 1.`
4. `SONAR BUOY (scatter): 3 or more anywhere start the DEEP DIVE.`
5. `DEEP DIVE: {n} free dives. Jellies keep drifting and the Tide Gauge raises the bonus for every new Jelly (levels 0 to 3). 2 or more Sonar Buoys during the Deep Dive add 3 more dives. (final numbers from 01-features-math.md)`
6. `DEEP PRESSURE and the Dive Ticket/Abyss Pass are described in the Bonus Buy screen.`
7. `Maximum win is {cap}x your bet. Malfunction voids all pays and plays.` (shell standard)
Paytable rows list the 9 symbols by name; the symbol names are the ones in section 6.
**Hints (loading/idle tips, optional):** `"Jellies drift left. Not my fault."`, `"Buoys ping. Pings pay."`, `"Don't tap the glass."`

---------------------------------------------------------------------
## 12. Hand-made checklist

DO:
1. Wobble: every symbol/frame/char group has an SVG displacement filter (`roughS` scale 2.6 for symbols, `roughC` 5 for the character, `roughL` 9 for big scene shapes). Vary `seed` per group so the wobble is not identical.
2. Hatching: right/bottom side of every shape has a diagonal pen hatch (rotate 35-40deg, spacing 5/8/12 for S/C/L). Add cross-hatching (a second layer at 80deg) only on deepest shadow of the Captain's shell.
3. Off-register colour: for flat fills, duplicate the fill path offset (+1.5, +1.5) in a slightly different hue underneath the ink (like a misaligned print). Do this on the logo and the 3 high symbols.
4. Asymmetry: the left eyebrow is lower, the frame rivets are not evenly spaced, one barnacle cluster per corner but different sizes, every kelp blade different length.
5. Line weight varies: outline 4px on outer silhouette, 2.5px on inner detail, 1.5px on hatch. Use `stroke-linecap: round`.
6. Imperfect shapes: no perfect circles in symbols (use slightly squashed ellipses, e.g. rx 26 ry 25), rivets with an uneven highlight.
7. Texture: paper grain overlay + dot-halftone on the scene's shadows; rust and verdigris speckle on the plaques (feTurbulence mask).
8. Personality details: the "OPEN: MOSTLY" sign, the "NO REFUNDS" tag, the hose, the crack in the compass glass, the patched boot.
9. Animation imperfection: stagger kelp/lantern animation durations (never the same); the Captain's blink 4.6s but twitch is 9s: they should desync.
10. Squash and stretch on all character moves; anticipation before every swing.

AVOID:
- Glossy bevels, drop-shadow glows on UI, perfect vector gradients as fills (exception: the Jelly and the water).
- Symmetric centered compositions, uniform stroke width, Material-design shadows.
- Stock "fish/seahorse/starfish/treasure chest/mermaid/Poseidon" casino ocean clichés, gold coins as filler.
- Pure black (`#000`) and pure white as fills (use Wet Ink and Foam/Cream).
- Cute-kawaii faces on everything: only the Jelly and the Captain have faces.
- Text in a default system font on the plaques (use the cartoon font, uppercase).
- Making any low symbol gold or glowing: warm shine is reserved for pay and for the wild.

---------------------------------------------------------------------
## 13. Builder quick reference (matches CONTRACT v1 names)

**Character state names** (`char(name)` adds class, removes after duration): `idle` (default), `spin` (= section 7 "swing"; css class `.spin`), `win`, `big`, `special` (= "boom": Drift step / buoys landing), `wince` (optional anticipation), and persistent class `bonusmode`. The legacy EmberClaw names `swing`/`boom` are NOT used here.

**Required SFX names** (slot recipe file): `ui`, `tap` (= ui with a higher bubble blip), `hit` (symbols landing on win: bubble pop, section 10 "symbol win pop"), `spin`, `land(r)`, `win(n)`, `special` (= Drift step), `scatter(n)`, `bonus` (trigger), `intro` (= dive; may be folded into `bonus`), `outro`, `big(lv 1..4)`, `tick(k 0..1)`, `feverOn` (Deep Pressure on: a pressure-valve hiss, noise highpass 3000->800 Hz .5s peak .12 + sine 90->140 Hz .5s + one brass `metal(260,.8)` clank), `ambience` start/stop.

**Intro chips (3)** on the Deep Dive splash: `{n} FREE DIVES` · `JELLIES DRIFT LEFT` · `TIDE RISES, JELLIES GROW` (adjust to maya's final rules; retrigger = 2+ buoys give +3 dives).

**Buy cards / confirm popup:**
- Confirm title `SIGN THE TICKET?`, text `DIVE TICKET for $X. The Deep Dive starts right away.` Buttons `BUY` / `NEVER MIND`. Abyss Pass: `ABYSS PASS for $X. Only for the brave (and the broke).`
- Deep Pressure on: toast `DEEP PRESSURE ON. TOTAL BET $X`; off: `PRESSURE RELEASED`.
- Volatility dots: Deep Pressure 3 of 5, Dive Ticket 4 of 5, Abyss Pass 5 of 5.

**Win / lose / drift messages:** `SALVAGED $X` · `JUST JUNK` · `DRIFT! x2`, `DRIFT! x3` ... · `THE JELLY LEAVES THE BOARD` (when it drifts out at reel 1) · `PING! PING! PING!` (3 buoys) · `DEEP DIVE: DIVE n OF N` (bonus spin counter) · `+N DIVES` (retrigger).

**Delivery notes for kai:** keep all multiplier chips as HTML/SVG overlays on the cell (not baked into the symbol) so the Jelly symbol stays one `<use href="#s9">`. A Jelly drift is animated as a CSS transform translateX(-cellWidth) over .45s ease-in-out (in turbo .25s) plus the cyan trail; no tumbles, no gravity drops. Reels spin top-to-bottom with the standard blur, stop left-to-right 120ms apart (turbo 40ms).

**Concept art:** `plans/grumble-and-brine/concept-symbols-captain.svg` (rendered and checked in Chromium) has working `<symbol>` s0, s1, s4, s5, s6, s7, s8, s9, s10 (boot, can, compass, anchor, doubloon, harpoon, clam, jelly, buoy) and the Captain with named groups `cBody cClawL cClawR cHead cEyes cPupils cBrows cScope cLampGlow`. kai may copy paths directly. Known to-dos for the builder: s2 bottle and s3 key (specced in section 6, not drawn); make the harpoon head ~30% bigger and the shaft thicker so it reads at 100px; split pincers, mouth, lids and hose bubbles for the Captain.
