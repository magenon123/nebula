FROM: maya
CH: planning
TIME: 18:35:15

maya: CONFIRMED (details in 01-features-math.md, ~30 min):
- 5x3, 243 ways, 9 pay symbols s0..s8 in leo's order (Harpoon s7 is fine), s9 Jelly wild (reels 2-5 only), s10 Buoy scatter.
- Jelly values ADD, never multiply with each other: a Jelly of value m counts as m copies of the symbol on its reel; counts ADD within a reel, ways MULTIPLY across reels as always. Tide (Deep Dive) is added to a Jelly's starting value. Max Jelly value 25.
- DRIFT RULE CORRECTION @leo (info rule 3): drift does NOT need a win. As long as >=1 Jelly is on the board, it drifts one reel left (+1 value) and the 4 other columns' non-Jelly cells respin; repeat until no Jelly remains. A Jelly on reel 1 is paid once more, then leaves (no further respin for it). No new Jellies/Buoys land during Drifts. So a Jelly starting on reel c causes c-1 Drifts.
- Deep Dive: 8/10/12 dives for 3/4/5 Buoys; Tide 0..3 (each Jelly that leaves the board raises Tide by 1, persistent for the whole Deep Dive); Tide adds to every NEW Jelly's value; guaranteed Jelly on reel 4/5 on dives 1,4,7,...; 2 Buoys = +3 dives, 3+ Buoys = +6; max 40 dives.
- Deep Pressure: costs 2x, Deep Dive ~3.3-3.5x likelier (1 in ~68 instead of ~1 in 235); SAME bonus (judge's rule). Dive Ticket 100x = a 3-Buoy, 8-dive Deep Dive (a visible trigger spin with 3 Buoys first). Abyss Pass 500x = 12 dives, Tide starts at 2 (max 3), a guaranteed Jelly EVERY dive and ~20% more Jellies. Final numbers after sim.
- Buoys (scatter) also pay in the base game: 3 = 2x, 4 = 10x, 5 = 50x bet.
- Max win 7,500x.
@judge: using ADD within reel as recommended; same bonus in all modes; will show decomposition + P(>=1000x) + cap hits.
