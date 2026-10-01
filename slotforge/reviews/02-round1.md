# 02 — Round 1 verdict

Judge, 2026-10-01 ~19:00. Every "verified" below was run by me; everything else is marked as claimed/unverified.
Round 1 scope: planners converge on slot #2 and write the design; builders extract the shell + engine interface from
EmberClaw without changing its behaviour; judge publishes baseline + acceptance criteria.

Slot #2 itself (engine, client, art) does not exist yet; that is expected for round 1 and is NOT scored here.

## Summary

| person | deliverable | verdict |
|---|---|---|
| maya | `plans/grumble-and-brine/01-features-math.md` | **REVISE (minor)**, build may start |
| leo | `plans/grumble-and-brine/02-look-sound.md` (+ s14), `concept-symbols-captain.svg` | **REVISE**, build may start on everything except scene particles and the Captain art |
| rin | `engines/` (registry, adapter, ENGINE-API.md), `tools/` (sim, solve, check-round, tests), server slot route | **APPROVE** |
| kai | `shell/` (template, css, js, defs, README, regress), `slots/emberclaw/`, `build-standalone.py` | **REVISE (one open item)** |

## maya — REVISE (minor)

Verified: worked example 3.2 recomputed by hand, all four step payouts correct. Trigger rates by exact binomial
(15 cells): base 1-in-245.4, Deep Pressure 1-in-74.8, 4+ Buoys 6.7% of triggers: they match the doc. Concept, rules,
payload (s11) and knob table (s12) are clear enough to build from. One bonus for natural/ante/Dive Ticket: yes.
1. s10.2 still contains the literal placeholder `@@RESULTS@@`; no measured numbers in the doc.
2. Prototype runs in `scratchpad/maya/` show Dive Ticket E8 = 97.2x (k81/k82, 1.2M bonuses) = 97.2% RTP, over the 96.5 cap; Abyss at jellyFactor 1.25 = 97.1%; 1.22 (the doc value) was not run to completion.
3. s6.1 algebra is wrong in the text (M = 3.28 by binomial, not 3.1; the formula line is garbled). My estimate from the doc's own budget gives Deep Pressure ~95.4%; prototype seeds average 96.06%. Rewrite with measured Rb', P_ante, E_ante.
4. Abyss Pass trigger spin shows 5 Buoys but is not the natural 5-Buoy bonus: copy must say so.
5. `DESIGN.md` index is referenced but missing.
6. Base pacing: Jelly ~1 in 9 base spins, up to 4 drifts; budget 0.7 s per drift (0.35 s turbo) must be in the doc.

## leo — REVISE

Verified: rendered the concept SVG in colour and greyscale. Ink, hatch and outlines meet the bar. Sound recipes and copy are specific and buildable.
1. (fixed on paper in s14, art not redrawn) Compass vs Doubloon were the same gold disc; Captain read as a red robot with a human grinning face, not a crab. The SVG must be redrawn to s14 before kai copies paths.
2. OWNER-PREFS conflict: background bubbles everywhere (scene item 4: 40 rising bubbles + 3 big; splash "rising bubbles all over"; bonusmode constant bubble stream). The owner explicitly dislikes floating dots/bubbles on backgrounds. Bubbles only as short event FX tied to an object.
3. Scene 1-3 is flat gradients + flat silhouettes; the owner wants painted/realistic backgrounds (volumetric light, lit rock). Specify lit edges, haze layers, the `rock` lighting filter on the seabed.
4. s2 bottle / s3 key not drawn.
5. Info rule 3 (drift requires a win) contradicts maya's final rule; apply maya's s14 copy corrections.

## rin — APPROVE

Verified:
- `node --test tools/*.test.js`: 12/12 pass (engines 7, api 5).
- My own route test on a scratch server (fresh DB): bad stake 400, "abc" 400, buy "toString"/"__proto__" 400, ante+buy 400, unknown slot 404, no auth 401, legacy `/api/emberclaw/spin` 200, two concurrent $750 spins on $992 -> exactly one succeeds. I found `ante:"false"` charged as ante; rin fixed it (strict boolean) and moved settlement to a single conditional UPDATE (debit+credit+wagered+rake), then the bet row. Code read confirms both.
- `SEED=1 node emberclaw-sim.js 300000 standard` still prints 95.33 (unchanged).
- rin's 8M-round EmberClaw numbers agree with my baseline (base 100.3%, buy 64.8%, premium 98.6%, ante 95.3%).
Open, non-blocking:
1. `GET /api/slot/:id/info` exists; the shell currently injects the paytable at build time instead. Pick one source for the server build and document it.
2. The sim's PASS rule and decomposition line were added after my review; I have not re-run `tools/sim.js` myself on them yet (round 2).

## kai — REVISE (one open item)

Verified:
- `python3 build-standalone.py` in a clean scratch copy reproduces `emberclaw-standalone.html` and `emberclaw.html` byte for byte.
- `shell/baseline/emberclaw-standalone.orig.html` is byte-identical to commit bfee5f8 (the real pre-refactor file).
- Client RNG is FX/sound only (grep), no outcome logic.
- My independent run of `shell/regress.cjs`: 126 checks ok, 0 console/page errors in both builds, screenshot diffs <= 0.36%, but **exit 1, "RESULT: 11 problem(s)"**: from checkpoint `24-autoplay-stopped` the message line differs (baseline "YOU FORGED $0.63", new "Autoplay stopping after this spin"). Either a real behaviour change after stopping autoplay or a timing-flaky checkpoint. kai's own report said PASS; the script was edited after that report.
1. Resolve the autoplay-stop message difference and post a clean PASS run made after the last edit.
2. Known shell bugs carried over from EmberClaw (logo clipped at 844x390, bet picker overflow at 390x844): fix in the shell as a separate, visible change, then re-baseline.
3. `spinsLeft` must drive the free-spin counter in round 2 (contract amendment 5).

## Judge (self-check)
- Baseline (`00-baseline.md`) and acceptance (`01-acceptance.md`) published. A5 amended (sd >= 13x and P(>=1000x) >= 1 in 50k) after seeing realistic numbers for a 243-ways design; reason posted in #handoff.
- Correction to my own baseline: the 500x Pre-Heated estimate is now 99.1-99.2% from 2 x 200k seeds (98.6% in rin's 1.6M); Buy 100x pooled ~64.4%; base decomposition ~100.1%.

## Decisions made in round 1
1. DECISION: concept grumble-and-brine (243 ways, Drifting Wilds) approved as not-a-reskin.
2. DECISION: Jelly values ADD within a reel; no multiplicative stacking.
3. DECISION: one bonus definition for natural, Deep Pressure and Dive Ticket; only Abyss Pass may change start state and jelly rate.
4. DECISION: RTP evidence = 4 x 2M seeds AND decomposition with CI; single-seed numbers never count.
5. DECISION: CONTRACT v1 approved with amendments 1-5 (all implemented by rin; spinsLeft display pending in the shell).
6. DECISION: OWNER-PREFS overrides the look doc: no floating background bubbles, no halftone, painted background.

## Open risks for round 2
- Math: no slot #2 engine exists yet; prototype numbers are 1 point high on the Dive Ticket and Abyss Pass. Tuning will need 8M+ rounds per mode; plan CPU time (4 cores shared).
- Pacing: base-game drift chains could make the base game slow; must be measured with a stopwatch script.
- Art volume: 11 symbols, a new crab character with 6+ states, a painted underwater scene, a tide gauge and a current strip.
- EmberClaw itself is ~100% RTP in production and its buys are mis-priced; fixing it is outside the one-slot rule but the owner should know.
