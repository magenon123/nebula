# Slot #6: RATTLEROCK RUN (working title) — concept for owner approval

Owner picked "Mine Cart Run" from the out-of-the-box ideas: a game about a RIDE, not a grid of symbols (like Aviamasters is about a plane).
Slug: `rattlerock-run`. Status: CONCEPT, awaiting owner APPROVE/REVISE. Next step after approval: ONE look-test picture, then build.

## The game in one minute
- One spin = one cart run down a mine track. The player sees the whole ride; the server has already decided the result (server-authoritative, like every slot).
- The cart carries a LOAD (gold, in bet multiples) and a MULTIPLIER gauge (starts x1).
- The track is a row of up to 12 stops. Each stop is one of:
  - GOLD nugget / nugget pile: adds to the load.
  - GEM (green x2, blue x3, red x5, rare gold x10): adds to the multiplier.
  - LEVER FORK: the cart takes the left or right track. One side is richer, one side safer (decided by the server, shown as a lever flipping).
  - HARD HAT: a shield that saves the cart from the next TNT.
  - TNT: blows the cart up. The run ends and pays only the gold in the load, NO multiplier. (A shield cancels one TNT.)
  - LANTERN: collect 3 on one run to trigger the bonus.
  - GOLDEN DOOR (last stop): the cart bursts out into daylight, the run pays load x multiplier. A rare door pays a fixed jackpot step.
- Pay = load x multiplier at the exit. Crash pays the load only. Many runs pay 0 to a few x; rare gem-heavy runs reach thousands x.

## Why it is different from slots 1 to 5 (variety rule)
- Main mechanic: a ride along a track (not clusters, ways, cascades or chains).
- Bonus: DEEP SHAFT. Triggered by 3 lanterns (or bought). The player has 3 carts and descends 3 levels. Each level is a longer run with richer gems. The multiplier is NOT reset between carts, it carries down. A TNT costs a cart, not the bonus. The deeper the level, the bigger the gems. The bonus ends when all carts are gone or the bottom door is reached. (It is not a free-spins counter.)
- Extras (new, not shared with other slots): bet-up TWIN CARTS (2.5x bet): two carts run side by side on two tracks, both pay, lantern chance is the same per cart, and the shield appears more often. Bonus buys: DEEP SHAFT (about 70x) and MOTHERLODE RUN (about 140x, starts at the second level with extra shields).
- Max win: 7,500x. Every mode targets 96.0 to 96.5% (the sim tool tunes it).

## Fit with the standard pack
Shared shell stays: loading + features screen, glowing sign when a bet-up is on, tap to speed up one run, turbo toggle, big-win ladder (BIG at 20x and up, coin rain), gold MAX WIN screen, 30 display currencies, phone layout and phone mode (the run is a baked track bitmap that slides past the cart, so it is very light on phones).

## Look (to be proven by the look test)
- High-quality game-art illustration, like the Stake top games (refs in `slotforge/refs/characters/`, the dwarf miner is the style reference). Not realistic, not kids-cartoon.
- A glowing mine with crystals and lanterns, wooden tracks, a dwarf driver in the cart (he is part of the ride, not a side character). Track and backdrop are baked bitmaps, only the cart, gems and sparks move.

## Open questions for the owner
1. Name: keep "Rattlerock Run" or suggest another?
2. Driver: a dwarf miner (matches the ref) or an animal (mole, raccoon)?
3. OK with TNT paying only the load (no multiplier)? It keeps the tail credible.
