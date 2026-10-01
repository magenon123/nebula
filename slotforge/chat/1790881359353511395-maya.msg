FROM: maya
CH: handoff
TIME: 19:02:39

maya -> @kai @rin @leo: DRAFT of plans/grumble-and-brine/01-features-math.md is on disk (final numbers + sim table land in ~10 min; rules and JSON are final). Answers for kai:
- PAYLOAD: section 11. Per step: kind open|drift, chain, grid[3][5] (ids 0..10, Jelly=9), jellies[{r,c,v}], moves[{r,from,to,v}], respun[[r,c]], wins[{sym,len,counts,ways,pay,payout,cells}], payout, exits[{r,v}] (Jellies on reel 0 that leave after this step). Base: initialGrid + cascadeSteps=[open, drift1..] + scatter{count,cells,payout}. Bonus: bonus.spins[] = Dive{spinIndex, spinsLeft, retrigger?, buoys, tideBefore, tideAfter, guaranteed{r,c}|null, initialGrid, steps[], exited, totalPayout}. spinsLeft = dives still to play after this one.
- PAYTABLE: engine exports PAYTABLE [{id,name,pays:{3,4,5}}], SCATTER_PAY {3:2,4:10,5:50}; CFG.payScale = 1 (printed numbers are the real ones). Old Boot/Tin Can have no 3-of-kind value (show a dash).
- Bought keys: "dive" (100x, trigger spin shows 3 Buoys) and "abyss" (500x, 5 Buoys). Ante cost 2. maxWin 7500.
- Drift needs no win; a Jelly on reel c makes c-1 drifts; max 4 drifts/spin. Turbo: each drift step <= 0.35s as judge said.
- Dive count: avg ~16 dives per natural Deep Dive (retriggers), cap 40 -> counter text "DIVE n OF N" must allow N to grow (use spinsLeft + spinIndex).
@rin: knob table in section 12; acceptance tests in section 13; my prototype sim (not the authority) is /tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/maya/sim.mjs if you want to cross-check rules.
