# 01 — Acceptance criteria for slot #2 (grumble-and-brine)

Judge, round 1. Slot #2 ships only when every box is ticked WITH evidence (command + output, or a screenshot path)
in `slots/<slug>/README.md` or `plans/<slug>/`. Ship also needs rubric average >= 4 and no criterion at 0.
"Pooled" = all seeds combined. RTP is always per dollar staked (cost of the mode).

## A. Math (rin runs, maya owns the targets)

Evidence method (lesson from EmberClaw, whose 600k-round seeds missed the true ~100% by 4-6 points):
- A1. **Direct sims**: >= 2,000,000 rounds per mode x >= 4 seeds (`SEED=1..4`), every seed's line reported, plus pooled.
- A2. **Decomposition** for base and bet-up: `RTP = Rb + P(trigger) * E[bonus] / cost`, with `Rb` (base-game part) from the direct sims
  and `E[bonus]` from >= 2,000,000 bonus plays (bonus-only / buy runs). The sim prints a **95% confidence interval** (mean +/- 1.96*sd/sqrt(n)) for every mode.
- A3. **Targets, every mode** (base, bet-up "Deep Pressure", Dive Ticket ~100x, Abyss Pass ~500x):
  point estimate (decomposition or pooled) in **96.0-96.5%**, and the 95% CI upper bound **< 97.0%**. No seed above 100%.
- A4. Base hit frequency (any base win > 0) **22-28%** pooled.
- A5. High volatility: base-mode sd per round >= 13x bet AND P(win >= 1000x) >= 1 in 50,000, pooled over >= 8M base rounds (amended 18:58 by judge DECISION; was 15x). Report P(>= 100x) too.
- A6. Max win cap **5,000-10,000x**, enforced on the whole round (base + bonus, buys too); cap must be reached in sims (report cap hits per 10M rounds), and no round ever exceeds it (`check-round.js`).
- A7. **One bonus**: natural trigger, bet-up and Dive Ticket play the identical bonus definition. Only Abyss Pass may change the start state. No mode-specific symbol tables for the bonus.
- A8. Bet-up: cost N and "bonus M x likelier": measured trigger-rate ratio within +/-5% of the stated M; RTP via `M = 1 + (N-1)*RTP/S` shown in the plan.
- A9. Buy prices: `price ~= E[bonus]/0.962` shown in the plan with the measured E[bonus]; bought trigger spin pays 0 (asserted per round).
- A10. Determinism: same SEED -> byte-identical sim output on two runs. EmberClaw seeded output unchanged by the refactor
  (`SEED=1 node emberclaw-sim.js 300000 standard` must still print RTP 95.33).

## B. Server authority & security (rin)

- B1. All outcomes from `engines/<slug>.js` (pure, rng injected, no Math.random). Client has no RNG/pay logic (grep the client: no `Math.random` outside FX/sound, no paytable math).
- B2. Route tests (scripted against a running server): invalid stake -> 400; `buy:"toString"` / `"__proto__"` -> 400; `ante:"false"` is NOT ante; ante+buy -> 400; unknown slot -> 404; insufficient balance -> 400 with balance unchanged.
- B3. Atomic settlement: one conditional statement (debit+credit) or a transaction. Test: 2 concurrent spins with balance for 1 -> exactly one succeeds; balance delta == payout - cost; one `bets` row per round.
- B4. `tools/check-round.js` passes on >= 100k rounds per mode AND on live API responses.
- B5. EmberClaw `/api/emberclaw/spin` still works (scripted spin + buy + ante).

## C. Shell compliance (kai)

- C1. Shell element boxes (Bonus Buy sign, bottom bar, balance, win, bet panel + chevrons, spin ring, autoplay button) at the same stage coordinates as EmberClaw within +/-2 px (script compares `getBoundingClientRect()/scale` in both slots).
- C2. Bet picker: 42 options $0.10-$10,000 from engine `CFG.bets`; USD format `$1,234.56` everywhere.
- C3. Autoplay: spin button becomes a white square with spins left; click stops it; stop-on-feature/stop-on-big work.
- C4. Turbo, sound toggle, info, fullscreen in the menu. Intro/outro splashes are tap-anywhere; a bought bonus shows the trigger spin first.
- C5. Viewports **1600x900, 1280x720, 844x390, 390x844**: no clipped text, no element off-stage, modals fit (screenshots of base, buy screen, bet picker, info in each).
- C6. EmberClaw from the shared shell is visually unchanged: before/after screenshots at 1600x900 (base, buy screen, intro) attached.

## D. Look (leo specifies, kai builds)

- D1. Hand-inked: displacement wobble on outlines, hatch shading, flat fills; no glossy multi-stop gradients on symbols.
- D2. Symbols: each with a distinct hue AND silhouette; at most 2 share a dominant colour; still distinguishable in a 48 px greyscale screenshot of the board.
- D3. Captain Barnacle: states idle (looping), spin, win, big, special (+wince if specced) and bonusmode, each visibly different (one screenshot per state).
- D4. Drift readable: the jelly's xN and its drift direction visible on every drift step; chain/step counter on screen.
- D5. Big-win tiers Bubble 5x / Barnacle 10x / Salvage 25x / Kraken 100x each have their own screen + sound level.
- D6. No black/empty board between spins.

## E. Sound & feel

- E1. Web Audio only: `grep -iE '\.(mp3|wav|ogg)|data:audio'` finds nothing; all events in leo's recipe list implemented with the agreed names.
- E2. Audio starts on first user gesture; sound toggle persists.
- E3. Timing: a no-win base spin <= 2.5 s (normal) and <= 1.3 s (turbo); count-ups and shake scale with win tier.

## F. Completeness & polish

- F1. Scripted Playwright session: 50 spins, Dive Ticket, Abyss Pass, Deep Pressure on/off, 25 turbo autoplay, info, bet picker: **0 page errors, 0 console errors** (offline font errors excepted).
- F2. Standalone built by script (`python3 build-standalone.py <slug>`), opens from file://, plays all modes with play money; no network requests besides fonts.
- F3. Info screen generated from engine data (paytable incl. any scale factor, max win, buy prices, bet-up cost).
- F4. Docs: plan doc (math + look), `slots/<slug>/README.md` with payload shape and the exact sim commands/outputs, ENGINE-API updated.
- F5. Headless frame rate during a bonus not worse than EmberClaw under the same script (EmberClaw: ~32 fps); standalone <= 400 KB.
- F6. `node --test tools/engines.test.js` passes; EmberClaw still loads and plays (emberclaw.html via server, emberclaw-standalone.html offline).
