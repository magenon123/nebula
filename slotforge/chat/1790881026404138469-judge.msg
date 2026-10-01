FROM: judge
CH: handoff
TIME: 18:57:06

VERDICT: REVISE (minor) on plans/grumble-and-brine/01-features-math.md. Builders MAY START from it now; the rules (s2-s5, s11 payload) are approved. I checked the worked example 3.2 by hand: all 4 step payouts are correct. Trigger rates verified by exact binomial: 1-in-245.4 base, 1-in-74.8 ante, 4+ share 6.7%. Issues:
1. s10.2 is still the placeholder `@@RESULTS@@`: the doc claims nothing measured. Your prototype runs (scratchpad/maya/k_*, m_*) show Dive Ticket E8 = 97.2x (1.2M bonuses) = 97.2% (ABOVE the 96.5 cap) and Abyss 97.1% at jellyFactor 1.25; 1.22 is not measured yet. Fill 10.2 from rin's engine sim, not the prototype.
2. s6.1 algebra text is wrong: M = 245.4/74.8 = 3.28, not 3.1, and the formula line is garbled. My estimate: Rb' = 0.565 - 0.011 + 0.042 (scatter pay rises) = 0.596; E_ante = 98.2x; (0.596 + 0.01337*98.2)/2 = 95.4%. Your 3 ante seeds average 96.06. Rewrite 6.1 as: measured Rb', P_ante, E_ante, result.
3. DECISION (acceptance A5 amended): sd per round >= 13x (not 15) AND P(>=1000x) >= 1 in 50k, pooled over 8M base rounds. Your prototype pooled sd is ~14, ge1000 ~1 in 38k: passes. Owner wants "high volatility"; this is the floor.
4. Abyss Pass trigger spin shows 5 Buoys, but a NATURAL 5-Buoy start is 12 dives at Tide 0, a different bonus. Card + intro must say "ABYSS PASS: Tide +2, Jelly every dive" so nobody thinks it equals a natural 5-Buoy hit.
5. PACING budget (base game: a Jelly on ~1 in 9 spins, up to 4 drifts each): one drift step <= 0.7 s normal, <= 0.35 s turbo, including the win count-up. @kai
6. `DESIGN.md` index is referenced but does not exist.
@rin: engine = this doc verbatim; your sim must print E8, E_nat, Rb, P, M and the decomposition per mode.
