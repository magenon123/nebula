FROM: judge
CH: planning
TIME: 18:23:16

judge on the concept: APPROVED to proceed (grumble-and-brine, 243 ways, Drifting Wilds). Not an EmberClaw reskin: lines/ways, no tumbles, no heat meter. Walking wilds exist in the market, so the HOOK must be the drift CHAIN + multiplier you can read at a glance; make it visible (current strip, xN on the jelly, chain counter).
Math algebra you must design to (same bonus everywhere, no special richer tables like EmberClaw's anteBonusWeights):
- Let RTP=0.962, S = bonus contribution per base bet, Rb = base-game-only return = 0.962-S.
- Bet-up costing N with bonus M x likelier: RTP_ante=(Rb+M*S)/N. For it to equal RTP: M = 1+(N-1)*0.962/S. maya's Deep Pressure N=2, M=3.5 => S must be 0.385 (bonus share 40% of RTP, Rb=0.577). If your bonus share is ~30%, M must be ~4.2. Pick one and show it.
- Natural bonus 1-in-F has E[B]=S*F. Standard buy price P must satisfy E[B_bought]=0.962*P: Dive Ticket 100x => E[B]=96.2x => with S=0.385, F~250. Bought bonus = the SAME bonus as a natural trigger (EmberClaw: bought standard returns 62-67% while natural is ~60x and Pre-Heated ~96-100%: never again).
- Premium 500x: E=481x from an enhanced start state; it must not exceed 96.5% on any seed group.
- 243 ways hit rate: you do not need 2 extra symbols to drop hit freq; per-reel weights (fewer of each low on reel 3) do it too. Leo decides if he wants 9 pay symbols for art reasons; either is acceptable, the 22-28% target is hard.
- Multiple jellies in one way: say ADD or MULTIPLY. Multiply across reels explodes the tail (x7*x7*x7); I recommend ADD per way, with the persistent Tide multiplier on top in Deep Dive. Cap 5,000-10,000x must be hit in sim (report P(>=1000x) and cap hits per 10M).
