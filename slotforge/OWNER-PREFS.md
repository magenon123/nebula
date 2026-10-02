# Owner preferences (the owner = the human who runs Nebula)

Agents: read this before every design or build decision. The lead keeps it updated whenever the owner says something new. Where this file and anything else disagree, **this file wins**.

## Process
- **One slot at a time**, quality over speed. Longer is fine if it is better.
- **Two gates before a slot counts as done:** (1) the judge approves it (>= 4 on every rubric line, no blocking issues); (2) the **owner approves it** after the lead presents it. **No new slot starts until the owner says so.** At each gate the lead asks the owner what they want next, and records the answer here.
- Everything in English. The owner sees the team chat (exported transcript) and wants to understand who decided what.

## Look & feel (what the owner liked / disliked while EmberClaw was built)
- Wants it to feel **hand-made, not AI-made**. Liked: thick outlines, flat colour, hatching, slight wobble, grain. Disliked: glossy gradients, clean vector perfection, generic "glass" panels, plain white pop-ups, halftone dot textures, floating "lava dots"/bubbles on backgrounds.
- Backgrounds should look **more realistic / painted** (volumetric smoke, lit rock, glow), characters and symbols stay cartoon.
- A **charismatic character per slot** beside the board (like Hacksaw's raccoon) with its own animations that react to spin, wins, big wins, special moments.
- Takes layout cues from **Hacksaw Gaming** but must be **our own style**, never a copy. The bonus-buy screen especially must "look that way" without being the same thing.
- Money is shown in **USD** (`$1,234.56`).
- Pop-ups/screens must match the slot's theme (forged plaques, ribbons, splash screens). Bonus intro/outro are full-screen **splashes**, tap anywhere to continue (no Continue button), and should look great.
- Sounds must be **made to match the theme** (all synthesised). The first, generic sounds were rejected.

## Features the owner asked for (every slot)
- Bonus Buy as a **hanging sign on the left**; opens a screen of option cards with a bet adjuster; BUY asks for confirmation.
- A bought bonus **plays a trigger spin that drops all the scatters**, then the intro splash.
- A **Fever / bet-up mode**: activating it closes the buy screen, the bet bar shows the **total risk** and changes colour, e.g. 3x bet for 5x bonus chance, **more volatile**, and still ~96% RTP.
- **Autoplay**: the spin button becomes a white square with the spins left; click to stop.
- **Many bet sizes** (low stakes to super high stakes) with a quick-pick grid.
- Symbols fall in **row by row** from above. Turbo, paytable/info screen, sound toggle, fullscreen.
- Server-authoritative math. Offline single-file build the owner can download and open in a browser.

## Math (owner decision)
- **Every mode of every slot must return 96.0-96.5% RTP**, proven by seeded simulation with confidence margins (see reviews/01-acceptance.md). An RTP at or above 100% (or a buy that is far from fair) is a blocking bug, never "good enough".
- EmberClaw's math was found to be wrong (base ~100.8%, 100x buy ~65%, 500x buy ~99%). The owner wants it **fixed to 96.0-96.5% in every mode** (it is the same slot, not a new one), before more slots are built.

## Owner notes after reviewing Grumble & Brine (2026-10-02)
- **Backgrounds: not "more realistic", more DETAILED.** The photo-real painted backdrop tried on EmberClaw did not look good. Keep the hand-inked cartoon look and add richness instead: more layers, more props and story details, more depth, more variety of shape and colour, small things to discover; still no floating bubbles/dots, no halftone. Applies to every slot, EmberClaw included.
- **The Bonus Buy sign on the left shows NO price.** One price on it makes players think there is only one bonus option. It is just the sign ("BONUS BUY"); all options and prices live on the Bonus Buy screen.

## Owner notes, round 2 (2026-10-02)
- The **doodle style is accepted** ("completely fine"). Do not move away from it.
- **Side characters (Brann the dwarf, Captain Barnacle the crab) need MORE DETAIL and to look better**: richer costume/props/texture, more expressive faces and poses, better proportions and line quality, within the doodle style.
- **Symbols must be drawn ONE BY ONE** (each symbol on its own: sketch, render large and at game size, critique, refine, then move on), not as a batch. The batch-made symbols "don't look the best".
