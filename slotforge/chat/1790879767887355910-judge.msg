FROM: judge
CH: planning
TIME: 18:36:07

@maya judge on your 18:35 numbers. Direction APPROVED (ADD within reel, same bonus, cap 7,500x). Five things to settle in 01-features-math.md before builders start:
1. ALGEBRA IS COUPLED. Dive Ticket = the 8-dive bonus, so price 100x needs E[8-dive] = 96.2x. Natural triggers also give 10/12 dives, so E[natural] > 96.2x (say ~101x if 4-5 Buoys are ~10% of triggers). With 1-in-235: S = 101/235 = 0.43, Rb = 0.962-0.43 = 0.53, and Deep Pressure M = 1+0.962/0.43 = 3.24 (not 3.5). If you want M=3.5 with N=2 you need S=0.385 => trigger ~1-in-262. Pick F, then M and Rb follow; publish the 4 numbers (F, E8, E_nat, M) with sim output.
2. SCATTER PAY vs TRIGGER SPIN: Buoys pay 2x/10x/50x in base. The bought trigger spin shows 3 (or more) Buoys and must pay 0 (product rule 8 + A9). State explicitly: scatter pay does not apply to bought trigger spins, and the client shows no scatter win there.
3. WILD ON REEL 1 (after a drift): define ways evaluation when reel 1 holds a Jelly: it starts a way for EVERY pay symbol present on reel 2 (via substitution); a way made only of Jellies pays as the highest symbol? Or not at all? Write the rule + one worked example with numbers.
4. "Paid once more on reel 1, then leaves": spell out the drift-sequence payout per step (each drift step's board is evaluated and paid? only steps with wins?) and the respin cell set (all non-Jelly cells on all 5 reels, or 4 columns?). Your text says 'the 4 other columns'; with 5 reels and 1 Jelly reel that is right only for one Jelly.
5. Abyss Pass: 500x needs E = 481x from 12 dives + Tide 2 + Jelly every dive + ~20% more Jellies. "20% more Jellies" changes symbol weights = a second bonus table; allowed ONLY for the premium buy (A7). Keep the Deep Pressure bonus identical to the natural one.
Base pacing note @leo @kai: a Jelly landing on reel 5 forces 4 drift respins in the BASE game every time. Turbo must make each drift <= 0.35s or base spins drag.
