# Rattlerock Run client notes (kai)
Files: slot.json (equals engine CFG + client copy, `portrait:{left:0,right:-600}` shows stage x 0..1000 on phones), slot.js, slot.css `/* KAI */` section. Smoke: `node slotforge/shell/smoke-rattlerock.cjs` (~6 min, forces rounds). Build: `python3 build-standalone.py rattlerock-run --server`.
Design: one rAF loop per round advances `dist` per lane (A rail 718 k=1, B twin lane rail 488 k=.72); scenery layers + pickups are placed from dist with translate3d (CSS scroll animations are switched off). 16 pooled pickup nodes. Fork previews are two small pooled nodes. Shell `pop` class is never used. Buy-sign/card icons use alias symbols `#sGem10 #sGem5 #sHat #sLantern #sDoor #sCart` injected by slot.js (shell expects `#s<id>`).
Portrait: KAI css maps #scene with the same transform as the game group (`--gx --gy --g`), hides nothing but moves the logo above the window and widens the HUD.
Test handle: `window.__rr`. No shell changes.
## v2 (owner revision)
- kai styles live in `kai.css`, embedded into slot.js by `python3 embed-css.py` (leo's art build rewrites slot.css; never put client CSS there). Edit kai.css, run embed-css.py, then build.
- Ride: rAF loop advances `dist` per lane; terrain TH(u)/Hc(u) = hills + features derived from the stops (gem = ramp + ballistic arc gap, gold = hump, tnt = dip + tunnel, fork = rail split +-140 px over 1000 px, door = long downhill); the track is 6 svg paths redrawn per 3400 px window; camera follows .62 of the height; layers shift vertically (far .08, farmid .18, mid .4, near/track 1.0). Pace: 330 px/s, 360 px per stop, beats per event, slow-mo before TNT/fork.
- Clarity: callout plates, STOP n/N + dots, LOAD x MULTI = equation, next-stop ring, first-3-rides hint.
- Rig (leo): parts + CSS classes on `.rrRig` (hSmile/hCheer/hWorry/hDizzy/hDetermined, up, glow, f0-f2), wheels/bob/lean in rigMotion().
- Portrait: leo's tall -p layers; #ga forced to zoom 1 with top=(H-1950)/2 so game coords = scene coords (rail 1210, cart x 250); cfg.portrait {0,0}.
- Wide: #frame overflow visible, track svg is 3400 wide, SPAWN_X from window width; lane B (twin) has a flat svg rail.
## RESUME NOTE
Done and passing smoke. Possible polish: callout plates from leo's rrCall* art, ramp lip/land sprites, speed lines/puffs, tune amplitudes, twin lane B in portrait only checked by eye.
