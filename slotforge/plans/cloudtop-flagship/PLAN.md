# CLOUDTOP TEA HOUSE - FLAGSHIP UPGRADE (Nebula Studios)  -- master plan + RESUME GUIDE

Owner brief (summary): make Cloudtop Tea House a polished, casino-ready flagship (serious Stake Engine submission review; acceptance NOT guaranteed).
WORK ONLY ON `cloudtop-tea-house`. Do NOT edit the other five games' folders, engines or built html. Math is FROZEN
(slotforge/engines/cloudtop-tea-house.js and slot.json bets/buys/anteCost/anteFsP). Touch the math only for a proven bug, with evidence, explained first.
Developer brand = **Nebula Studios** (introduce it in this game now; other games later, one by one).

Known-good rollback: git commit `d99fe90` (local tag `cloudtop-known-good`; `git checkout d99fe90 -- <file>` to restore a file; baseline built files = `cloudtop-tea-house-standalone.html` at that commit).

## RESUME PROTOCOL (read this first if you are a new session / the limit just reset)
1. `git pull`; read this file, then `slotforge/STATUS.md` top lines, then the CHECKLIST below. Items marked [x] are DONE and committed. Pick the first [ ] item of the lowest stage.
2. Every finished item: build (`python3 build-standalone.py cloudtop-tea-house` then `--server`), run the check named for the item, tick the box here, commit and push (`git add -A; git commit; git pull --rebase; git push`). Commit after EVERY item; never leave work uncommitted.
3. Owner sees the game as ONE play-money file: send `cloudtop-tea-house-standalone.html` only (not the server build).
4. Never delete work. Keep the usage lean: no repeated full smoke runs; run `node slotforge/shell/smoke-cloudtop.cjs` once per stage, unit tests `node --test slotforge/tools/cloudtop.test.js` when code changes.

## Team (5 agents, one lead) and FILE OWNERSHIP (no two agents edit the same file)
| role | agent | owns (only they edit) |
|---|---|---|
| lead / integrator | Tally (main session) | this plan, STATUS.md, slotforge/shell/* opt-in studio hooks, build, regression runs, commits |
| art A (world + symbols) | leo | scene.html, frame.html, side.html, logo.html, character.html, symbols.svg, art/** (generators), slot.css (above the `/* KAI */` marker) |
| art B (brand + bonus skins + UI art) | maya | brand/** (Nebula Studios logo + loading/intro art), splash.html, info.html, slot.json `loading` copy; bonus environment layers `bonus-env.html` |
| client | kai | slot.js, kai.css (spliced after `/* KAI */` by embed-kai.py), audio calls |
| QA / perf | rin | tests only: slotforge/shell/smoke-cloudtop.cjs additions, mobile checks, perf notes (NO math edits) |

## Highest-impact improvements found in the inspection (Stage 1, done)
1. All three bonuses (Tin Rush, Free Spins, Super) play in the same scene/frame: no identity. Give each its own environment (sky, light, frame dressing, music mood, counter plaque).
2. Tin Rush board = flat brown cells with one ring: dull. Make the empty slots physical tin-lid wells with depth and a tension glow; locked tins glow; clearer counter + rules strip.
3. Base game: the board sits flat; add lighting (warm lantern glow on the board, soft vignette, depth shadows, drifting petals/steam), symbol tiles with more finish.
4. No studio branding anywhere. Add Nebula Studios mark: loading screen, features screen footer, info/credits, splash corner. Subtle, intentional.
5. Loading + features screens are generic gradients: theme them (Tea House art, steam, lanterns).
6. Win presentation: scale effects with the win (small line-win, big, mega...), anticipation on scatters/tins (already partially there): polish.
7. Mobile: verify portrait/landscape layout, button sizes, perf (phone mode exists); fix what is found.
8. Audio: check Tin Rush / FS / Super music + stingers have distinct identity.

## CHECKLIST
### Stage 2: core visuals + UI
- [x] 2.1 leo: base scene lighting/depth pass (scene, frame glow, petals/steam), keep stage geometry (ART-NOTES.md).
- [x] 2.2 leo: symbol finish pass (clear silhouettes, consistent shading) without changing ids/roles.
- [x] 2.3 maya: Nebula Studios logo (SVG) + themed loading + features screens (cfg in slot.json, `studio`).
- [x] 2.4 lead (260d13d): shell opt-in `cfg.studio` (loading footer, info credits line); no change for games without it.
### Stage 3: bonuses
- [x] 3.1 maya+kai (kai client part done; env layer = maya): Tin Rush identity (environment layer, tin-well cells, trigger sequence, counter plaque, rules strip).
- [x] 3.2 kai: Free Spins identity (environment, transition in/out, counter/multiplier readability).
- [x] 3.3 kai: Super Free Spins identity (distinct from FS).
### Stage 4: animation, audio, mobile, branding
- [x] 4.1 kai: win presentation scaling + anticipation polish.
- [x] 4.2 kai: audio distinct per bonus (slot-music.js usage via slot.js only).
- [x] 4.3 rin: mobile portrait/landscape + perf review; fix list to owners. (review done; DEFECTS FOUND, see Log; fixes pending with owners)
- [x] 4.4 maya: branding in info/credits + splash corner.
### Stage 5: regression + final review
- [ ] 5.1 rin/lead: unit tests, smoke-cloudtop, bets/payouts/balance/bonus completion/autoplay/console errors, screenshots desktop + phone.
- [ ] 5.2 lead: final quality review, STATUS.md, deliver file to owner, list remaining defects.

## Log (newest first; add a line per finished item with commit hash)
- 4.3 QA done (rin): 390x844/844x390/768x1024/1600x900/2560x1080 layouts, 3 bonuses x portrait+landscape phone, hold-to-repeat, autoplay 10, error recovery, 200 base + 20 tin/fs/super money invariants (0 mismatches), perf (relative, software GL), smoke PASS, unit 26/26. DEFECTS OPEN: landscape-phone intro/outro splash cut off (modal.splash overflow:hidden, quote/chips/tally/tap-hint below fold), portrait outro quote hidden under Koji+ribbon, bet arrows ~24x12 px hit area in portrait (menu 20px, autoplay 36px), portrait scene empty mid band, landscape phone logo clipped at top, buy screen needs scroll on phones. Scripts: slotforge/slots/cloudtop-tea-house/test/qa-*.cjs. Not checked: real devices/GPU, real touch long-press, safe-area notch insets.
- 4.4 done (maya): info.html CREDITS block (Nebula mark + game name + "Developed by Nebula Studios" + v1.0, inline-styled, placeholders untouched). Splash corner mark SKIPPED on purpose: splash.html is only a doc comment, the bonus-intro art is kojiSplash in symbols.svg/slot.css (leo/kai files) and a corner mark would clutter the splash; the studio is already on the loading + features screens. bonus-env.html: portrait bleed fix (body.portrait: each env extends 1100px above/below the stage, edge colours continued by ::before/::after gradients; no blank band at 390x844 for tin/fs/super) + Tin Rush furnace glow raised (bigger, brighter ellipses, pulse .88-1).
- 4.1/4.2 done (9068cce): win size classes (tag, sparkle, Koji+coins), tease hold veil + riser, per-bonus trigger/bonus/outro sfx + stingers (trig, end, bigtin, launch, top), tin/FS/Super music already distinct (128/112/142 bpm).
- 3.2/3.3 done (9f32d6b): FS + Super: trigger sequence (drums beat, veil, riser) + title cards (indigo/gold FS, gold-ray Super), curtain wipe in, end cards out ('STEEPING COMPLETE'), plaque in tag colour, rules plaque + drawer boost legend, LEVEL +N callouts + ring waves on level-up, plaque bump on retrigger, outro stats tally, dataset.bonus='fs'|'super'.
- 3.1 kai part done (ee10058): Tin Rush trigger (veil, rising bells, pulse, TIN RUSH title card), tin-lid wells + warm locked glow + pours plaque with pips + rules strip (kai.css), reset fly-to-plaque, per-value landing wave/sparkle/sfx, Kite/Grand charge-up anticipation, RUSH COMPLETE end card, outro tally rows, dataset.bonus + --envPulse on #bonusEnv. NOTE: slot.css carries the spliced kai.css below /* KAI */ (leo's file, not committed by kai).
- bonus-env.html done (maya) f3b2f08: #bonusEnv[data-bonus=tin|fs|super] layers, --envPulse, lite/reduced-motion off; checked 1600x900 + 390x844.
- 2.2 done (leo): symbol finish in art/lib.cjs shape(): 3-step cel shading + reflected light + auto rim highlight + specular on spheres, stronger shade contrast; symbols.svg regenerated (build.cjs then wobble.cjs symbols.svg; ids/viewBox/win hooks untouched). Restore character.html with git if build.cjs rewrites it raw.
- 2.1 done (leo): scene far ridge+haze, warm board pool, vignette, tansu depth shadows, eave lamp halos, board inner shadow/warm light, CSS petals (body.lite off), bottom-left props tidied, tile plate finish. Generator: art/light.cjs (run AFTER wobble.cjs). Rebuild/ordering note in slot.css ART-LIGHT block.
- 2.3 done (maya): brand/ kit (nebula-studios.svg, nebula-mark.svg, loading-art.html, loading.css, README.md) + slot.json `studio`; loading+features themed, checked at 1600x900 and 390x844 via ?load=1. Gap: portrait crops lantern/cup art (slice).
- 2.4 done 260d13d: shell opt-in studio hook (brand/ folder -> SF_BRAND, #lmArt, .lmStudio). Agents share one working tree: commit only own files, no pull --rebase, never commit built html.
- (start) plan written; known-good = d99fe90.
