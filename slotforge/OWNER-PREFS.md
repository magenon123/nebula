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

## Owner notes, round 3 (2026-10-02): "the slots still look AI" (applies to ALL slots)
1. **Animations of the connections** feel AI: transitions between animation phases and the way winning symbols are shown connected. Needs: anticipation before a spin, staggered drops with overshoot and settle (squash and stretch), clearly drawn LINKS/connection highlights between the winning symbols (animated glow travelling along the path, popping in order), symbols that react (not just glow), refills that flow straight out of the clear without dead pauses, character reactions synced to these beats.
2. **Not enough detail** anywhere: symbols, characters, scene.
3. **The UI of the symbols looks too simple**: bare symbols on dark cells. Each symbol needs richer drawing and a proper presentation (tile/plate, rim, tier colour, depth).
4. **Backgrounds contain small things that obviously do not belong** (props that float, ungrounded, wrong scale/perspective, random gags). Everything in a scene must have a reason to be there, sit on a ground plane with a contact shadow, share one light direction and scale logic, and belong to the story.
5. **Sound has no MUSIC.** Real slots have a music loop matching the vibe. Each slot needs a themed base-game track, a bonus track, and stingers, all synthesised, with a separate Music on/off + volume.
6. **The top-left spin/dive counter must never be covered** (fixed: the Bonus Buy sign hides during the bonus).
- **Clarification of note 1:** the problem is not the yellow/gold colour but the generic glow/pulse animation that every winning symbol gets when symbols connect. Each symbol must instead ACT with its own hand-animated win motion (wind-up, snap, squash, overshoot, settle), connections between winners are a thematic physical element, not a glowing line.

## Round 4: MAX or NOTHING buy
Owner wants a max-win-or-nothing feature as an ACTIVATED per-spin mode (like Deep Pressure), not a buy: golden MAX coins, 3 = max win. Slow-mo near-miss drop when 2 scatters/coins have landed. Owner insisted on 5% per spin: MAX LUCK costs 392x per spin and stays on until switched off (96.08% RTP, 16M-round sim) in Grumble & Brine; EmberClaw port after approval. Standalone files have a menu button to add $100,000 play money.

## Grumble & Brine APPROVED by owner (MAX LUCK, near-miss tease, FS tag, gold MAX WIN screen).
EmberClaw now has MAX LUCK x496 (5%/spin, 9,500x), same presentation. Awaiting owner notes on EmberClaw.

## Round 5: variety rule (owner, applies to every future slot)
We will make tens if not hundreds of slots. They must NOT share the same gamble side. Shared: shell/layout, bet bar, autoplay, sound engine, server safety.
Different per slot: main mechanic, bonus, and the set of extras. Extras are picked from a growing menu (bet-up chance mode, single bonus buy, MAX LUCK style 5% jackpot toggle, risk-it ladder, mystery/sticky symbols, shrinking grid, progressive meter...), 1-2 per slot. MAX LUCK is rare (about 1 slot in 5).
Before building a slot: compare its main mechanic and its extras list against all existing slots; reject duplicates. Also vary volatility, hit rate, max win and grid type.
Existing slots (EmberClaw, Grumble & Brine) stay as they are.

## Round 6: slot #3 concept approved (Koji's Cloudtop Tea House)
Owner approved the concept with the notes in STATUS.md. The lead calls itself "Tally".

## Round 7: Tea House revision notes (owner)
1. Fix ALL the listed weak spots (Grand dragon kite face looks like a pig, hat reads like a hard hat, stiff win arms, small symbols, heavy scene perf, no Koji splash portrait, fonts).
2. Need MORE TYPES OF BONUSES. KEEP Tin Rush exactly as it is (owner: "it's fine").
3. Bonus scatters carry ONLY the text "FS". 3 FS = normal free-spins bonus, 4 FS = SUPER bonus. (Tea Tins stay the Tin Rush trigger, 6+.)
4. BUG: in the bonus, every spin the shell counter flashes "n / 14" for a split second before the slot's "POURS LEFT" counter. Fixed by cfg.ownCounter (shell no longer writes the counter or the message when a slot owns its counter). Verify it is gone.

## Round 8 (owner): bet-up "luck" mode in EVERY slot, from now on
Every slot gets a bet-up bonus-chance toggle ("Deep Pressure", "Forge Fever", "FS Luck" for the Tea House: 2x cost, bonus much likelier, RTP 96% in that mode too). Other extras still vary per slot. The Tea House has it as of this round (2x, FS drums ~6x as likely).
Also: Tin Rush slow-drop tease starts at the 5th tin (one short of 6), FS tease stays at the 2nd drum. Tin value chips sit in the top-left of the cell, never over the TIN tag. Tea House max win = 5,000x.
Weekly limit is nearly used up (resets next day 6pm UTC): keep work small and commit/push every step.

## Round 9 (owner): Tea House APPROVED. New direction for ALL future slots
- Slot #3 (Koji's Cloudtop Tea House) is approved.
- STOP the doodle look. From slot #4 on: much more detailed and realistic art (rendered lighting, depth, materials, real-looking symbols and backgrounds, a detailed character), in every slot. Existing slots 1-3 stay as they are unless the owner asks.
- Every slot has SHARED bonuses (the standard set all slots carry: free-spins style bonus with its own twist, bet-up luck mode "FS/bonus luck", bonus buys, mid-spin turbo, big-win tiers, MAX WIN screen; MAX LUCK stays rare) AND its OWN unique bonus. Shared parts are reused from the shell/engine templates; the unique bonus must differ from all existing slots (variety rule still applies).
- Weekly usage limit is tight: lead does small fixes itself; agents only for big builds; always commit/push and keep STATUS.md resume notes current.

## Round 10 (owner): SIDE CHARACTER STYLE for all slots (reference images in slotforge/refs/characters/)
Owner rejected the "realistic" Aino/Tuuli (v2) and reverted slot #4 to v1. He did NOT mean literal realism. Target = the side characters of the top Stake games (zeus.png Gates of Olympus, raccoon.png Hacksaw, dwarf.png): professional, high-quality game-art ILLUSTRATIONS of normal adult characters: strong clear silhouette, correct anatomy and proportions, confident posing, rich painted shading with controlled rim lights, crisp clean detail (armor, cloth, fur, metal), expressive but not goofy faces. NOT children's-cartoon (big heads, tube limbs, simple blobs), NOT airbrushed 3D doll, NOT photoreal. Applies to every new character; apply to Aino and Tuuli next.

## Round 11 (owner): slot #4 Arctic Aurora Lodge APPROVED. Lessons for slot #5 and all after
- It is NOT about realism. It is about VERY HIGH QUALITY illustration (top Stake games). Characters: clean strong silhouette, correct anatomy, painterly shading, crisp detail, expressive faces (refs in slotforge/refs/characters/). No kids-cartoon, no airbrushed 3D doll, no literal photo-realism.
- Do not over-engineer art in one big leap: test the look first (one symbol + one background + the character), the owner approves, then build everything.
- Shared package every slot has: free-spins style bonus with own twist, bet-up luck toggle, bonus buys, mid-spin turbo, MAX WIN screen, own unique bonus. Tails must be credible (a 7,500x cap must be reachable), RTP 96.0-96.5% in every mode.
- Keep scene lightweight (baked static layers, ~35+ fps), keep file size sane, no stray clutter, own win motion per symbol, no counter flashes, themed music.
