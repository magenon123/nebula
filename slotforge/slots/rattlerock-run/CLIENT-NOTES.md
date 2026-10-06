# Rattlerock Run client notes (kai)
Files: slot.json (equals engine CFG + client copy, `portrait:{left:0,right:-600}` shows stage x 0..1000 on phones), slot.js, slot.css `/* KAI */` section. Smoke: `node slotforge/shell/smoke-rattlerock.cjs` (~6 min, forces rounds). Build: `python3 build-standalone.py rattlerock-run --server`.
Design: one rAF loop per round advances `dist` per lane (A rail 718 k=1, B twin lane rail 488 k=.72); scenery layers + pickups are placed from dist with translate3d (CSS scroll animations are switched off). 16 pooled pickup nodes. Fork previews are two small pooled nodes. Shell `pop` class is never used. Buy-sign/card icons use alias symbols `#sGem10 #sGem5 #sHat #sLantern #sDoor #sCart` injected by slot.js (shell expects `#s<id>`).
Portrait: KAI css maps #scene with the same transform as the game group (`--gx --gy --g`), hides nothing but moves the logo above the window and widens the HUD.
Test handle: `window.__rr`. No shell changes.
## RESUME NOTE
Done: slot.json, slot.js (base ride, forks, shields, crash, door, Twin Carts, Deep Shaft with 3 levels/carts HUD, buys, music/sfx), css, smoke test, build. Left: only polish if the owner asks (e.g. fork rejoin visual, per-lane HUD in twin).
