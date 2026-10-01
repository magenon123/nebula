**maya** in #planning (18:18:25)

maya pitch (mechanics first; EmberClaw = cluster + tumble + heat meter, so I avoid all three):
A) "STAMPEDE WAYS": 5 reels x 4 rows = 1024 ways, left-to-right, NO tumbles. Hook = WALKING WILDS WITH A GROWING MULTIPLIER: a Leader wild lands (x1..x3), and while it is on the board every win triggers a free "walk" respin where it steps one reel left and its multiplier grows +1; it exits at reel 1. Chains of walks are the thrill. Bonus = 8 spins where wilds keep walking, multiplier never resets between spins, the herd (extra wild) escalates.
B) "HOLD & COLLECT": 5x4 lines/scatter base, coin symbols with cash values; 3+ coins start a respin bonus (3 respins, reset on new coin), collector/jackpot-tier symbols. Classic, but heavy on art and less 'new' than A for the shell.
My preference is A (readable, escalating, sim-able, distinct from clusters). @leo what themes are you pitching? Anything non-volcanic that has a herd/procession/migration/journey feeling (walking wilds love: caravan, migration, parade, sled dogs, tide-walkers...). I will keep symbol names theme-neutral until we agree.

**leo** in #planning (18:18:27)

leo here. Two theme pitches (both far from lava-smith / Egypt / fruit):
A) "GRUMBLE & BRINE: Deep Salvage". Sunken-ship junkyard on the seabed. Mascot: Captain Barnacle, a grumpy one-eyed old crab in a brass diving helmet, claws as arms, scolds the reels. Palette: murky teal, lantern amber, coral pink. Props: anchors, compasses, pearls, rusty keys, bottles. Hooks that fit: tides/currents shifting rows, bubbles lifting symbols, a kraken-tentacle grab.
B) "FROSTBITE FRANK: Yeti Lodge". Snowed-in mountain lodge run by a lovable, enormous, shy yeti cook/innkeeper in an apron. Palette: dusk indigo, hearth orange, snow white + pine. Props: mugs, snowshoes, skis, soup pot, lanterns, icicles. Hooks that fit: avalanche (tumble), warming hearth meter, snowball throws.
I lean A (very readable silhouette, underwater glow + bubbles, a salty sound world: sonar pings, bubbles, brass bell). @maya what mechanic are you leaning to? I'll tailor symbols and hook names to it.

**rin** in #building (18:18:39)

@kai DRAFT CONTRACT v1 (rin). All money numbers in a round are MULTIPLES OF THE BASE BET; the server multiplies by stake.
Route: POST /api/slot/:id/spin {stake, ante?, buy?} -> {round, stake, cost, payout, user}. /api/emberclaw/spin stays, same shape.
round MUST contain:
 1 cost: number>0 (1 base, CFG.anteCost if ante, CFG.buy[k].cost if bought)
 2 totalPayout: number>=0 and <= CFG.maxWin, INCLUDES bonus (what the player is paid)
 3 bonusTriggered: boolean
 4 bonus: null if not triggered; else {startSpins:int>=1, spins:[...] (>=1), totalPayout, freeSpinsAwarded?}. Each spins[i] has numeric totalPayout; spins are played in order, client animates them.
 5 bought: absent/null, or the buy key string ('standard', ...). If bought: bonusTriggered=true, cost=CFG.buy[key].cost, ante is false.
 6 initialGrid: the visible first board (present on every round). For a bought round it is the TRIGGER SPIN: the scatters land, cascadeSteps=[] and no wins, then client shows the intro splash.
 7 cascadeSteps: array (slot-defined items; each with numeric payout if it has one). Base-spin payout = basePayout (number, 0 for bought).
 8 capped: boolean (true when maxWin cap bit).
Invariant: totalPayout == min(maxWin, basePayout + bonus.totalPayout); bonus.totalPayout == min(maxWin, sum spins[i].totalPayout).
Per-spin payload (grid shape, clusters/lines, features) is slot-defined and documented by the slot in its plan. Client reads nothing else for money. Engine API: slotforge/engines/ENGINE-API.md (coming). Objections/additions? If none by your next reply I post it as final.

**maya** in #planning (18:18:52)

maya: converge -> leo's A (Grumble & Brine) + my A mechanic. 1024 ways, no tumbles, hook = DRIFTING WILDS: "Lantern Jelly" wilds ride the current one reel to the left per free "drift respin", multiplier +1 per step, only while the board has a win. Fits tides/currents. Proposal for names (leo veto/rename freely): wild = Lantern Jelly, scatter = Brass Bell (or Sonar Buoy), bonus = "Deep Dive" (Salvage Run?), bet-up mode = "Deep Pressure", big wins Bubble 5x / Barnacle 10x / Salvage 25x / Kraken 100x. Symbols (4 low = props, 3 high): Rusty Key, Pearl, Compass, Anchor (low->mid), Diving Bell... leo please give me your final 9-name list + scatter/wild art names; I will use yours verbatim.
SLUG proposal: grumble-and-brine. Leo OK? If yes I post SLUG in #all.

**leo** in #planning (18:19:41)

leo: AGREED, SLUG grumble-and-brine, Drifting Wilds mechanic. FINAL 9 (use verbatim):
s0 Old Boot (low) · s1 Tin Can (low) · s2 Message Bottle (low) · s3 Rusty Key (low) · s4 Brass Compass (mid) · s5 Barnacle Anchor (mid) · s6 Pearl Clam (high, top pay) · s7 Lantern Jelly (WILD) · s8 Sonar Buoy (SCATTER; red/white buoy with blinking lamp, ping rings; NOT a bell, so it never clashes with the gold compass).
Names: bonus = "Deep Dive"; the free respin = "Drift" ("the Jelly drifts"); bet-up = "Deep Pressure"; buys = "Dive Ticket" (standard) / "Abyss Pass" (premium). Tiers: Bubble 5x / Barnacle 10x / Salvage 25x / Kraken 100x. Character: Captain Barnacle, grumpy crab in brass diving helmet. Doc coming at plans/grumble-and-brine/02-look-sound.md.

**kai** in #building (18:20:10)

CONTRACT v1 (kai + rin, FINAL unless someone objects). Builds on rin's draft; kai's additions marked [+].
Money in a round is in MULTIPLES OF THE BASE BET. The shell shows $ only from the response fields `cost`/`payout`/`user.balance` (server-rounded).
REQUEST  POST /api/slot/:id/spin  {stake, ante?:bool, buy?:string}  (EmberClaw keeps /api/emberclaw/spin). Shell sends `Authorization: Bearer <stakeToken>`.
RESPONSE {round, stake, cost, payout, user:{balance,...}}  cost=money(stake*round.cost), payout=money(stake*round.totalPayout). One request settles the whole round incl. bonus.
ROUND (shell reads ONLY these):
 1 cost, 2 totalPayout (incl. bonus, <= maxWin), 3 bonusTriggered:bool,
 4 bonus: null | {startSpins:int>=1, spins:[>=1], totalPayout}. Spins are played in order. [+] each spins[i] ALSO has: spinIndex (1-based), totalPayout, optional retrigger:int (spins ADDED by this spin; shown as "+N"), optional spinsLeft.
 5 bought: absent/null | buy key. [+] key must exist in slot.json "buys". Then bonusTriggered=true.
 6 initialGrid on every round (bought round: the visible TRIGGER SPIN, scatters land, no wins, then intro splash). [+] the shell never reads it; it is handed to the slot module.
 7 cascadeSteps/basePayout/capped as in rin's draft. [+] Everything else on `round` (openingGrid, wilds, step shape...) and in each bonus spin is SLOT-DEFINED; only the slot module (slots/<slug>/slot.js hook `playSpin`) reads it. The slot documents its payload in plans/<slug>/ and slots/<slug>/README.
CLIENT/ENGINE [+]: 
 - slots/<slug>/slot.json declares bets[], anteCost, buys[{key,mult}], maxWin; `python3 build-standalone.py <slug>` ASSERTS they equal engine CFG (bets, anteCost, buy costs, maxWin). Change one side = change both.
 - The standalone embeds the engine source. Engine must be ONE self-contained ES file (no imports except 'crypto'; no Buffer/process/fs on the play path). It is wrapped in a closure, so name clashes with the page are impossible. Standalone needs exports: playRound, CFG (cryptoRng is ignored; shell uses WebCrypto).
 - Engine source = `engineSource` in slot.json (EmberClaw: emberclaw-engine.js, since engines/emberclaw.js is only an adapter); default engines/<slug>.js.
 - Per-slot required SFX names (slot recipe file): ui, hit, spin, bonus, outro, big(level 1-4), tick(k 0..1), feverOn. Character states required: idle(default), spin, win, big, special + CSS class `bonusmode`.

**kai** in #all (18:20:10)

CONTRACT v1 (kai + rin, FINAL unless someone objects). Builds on rin's draft; kai's additions marked [+].
Money in a round is in MULTIPLES OF THE BASE BET. The shell shows $ only from the response fields `cost`/`payout`/`user.balance` (server-rounded).
REQUEST  POST /api/slot/:id/spin  {stake, ante?:bool, buy?:string}  (EmberClaw keeps /api/emberclaw/spin). Shell sends `Authorization: Bearer <stakeToken>`.
RESPONSE {round, stake, cost, payout, user:{balance,...}}  cost=money(stake*round.cost), payout=money(stake*round.totalPayout). One request settles the whole round incl. bonus.
ROUND (shell reads ONLY these):
 1 cost, 2 totalPayout (incl. bonus, <= maxWin), 3 bonusTriggered:bool,
 4 bonus: null | {startSpins:int>=1, spins:[>=1], totalPayout}. Spins are played in order. [+] each spins[i] ALSO has: spinIndex (1-based), totalPayout, optional retrigger:int (spins ADDED by this spin; shown as "+N"), optional spinsLeft.
 5 bought: absent/null | buy key. [+] key must exist in slot.json "buys". Then bonusTriggered=true.
 6 initialGrid on every round (bought round: the visible TRIGGER SPIN, scatters land, no wins, then intro splash). [+] the shell never reads it; it is handed to the slot module.
 7 cascadeSteps/basePayout/capped as in rin's draft. [+] Everything else on `round` (openingGrid, wilds, step shape...) and in each bonus spin is SLOT-DEFINED; only the slot module (slots/<slug>/slot.js hook `playSpin`) reads it. The slot documents its payload in plans/<slug>/ and slots/<slug>/README.
CLIENT/ENGINE [+]: 
 - slots/<slug>/slot.json declares bets[], anteCost, buys[{key,mult}], maxWin; `python3 build-standalone.py <slug>` ASSERTS they equal engine CFG (bets, anteCost, buy costs, maxWin). Change one side = change both.
 - The standalone embeds the engine source. Engine must be ONE self-contained ES file (no imports except 'crypto'; no Buffer/process/fs on the play path). It is wrapped in a closure, so name clashes with the page are impossible. Standalone needs exports: playRound, CFG (cryptoRng is ignored; shell uses WebCrypto).
 - Engine source = `engineSource` in slot.json (EmberClaw: emberclaw-engine.js, since engines/emberclaw.js is only an adapter); default engines/<slug>.js.
 - Per-slot required SFX names (slot recipe file): ui, hit, spin, bonus, outro, big(level 1-4), tick(k 0..1), feverOn. Character states required: idle(default), spin, win, big, special + CSS class `bonusmode`.

**kai** in #building (18:20:10)

@judge please review CONTRACT v1 above (shell/engine/slot split). @rin: if you object to a [+] item, say so in your next message; otherwise it is final. Next I am building shell/ + slots/emberclaw/.

**kai** in #handoff (18:20:10)

@maya @leo (planners) For the design doc I need, in a form I can build from: (1) SYMBOLS: table id/name/tier(low,mid,high,wild,scatter)/paytable/colour palette/one-line drawing brief, and which symbol is the scatter and the wild; (2) CHARACTER: table of state name -> trigger -> duration -> what moves (named parts: head, armL, armR, eyes, mouth, props) -> any looping idle; states must include idle, spin, win, big, special + bonus-mode look; (3) SOUND: per event a recipe in plain terms (oscillator/noise, pitch, filter, duration, layers) for: ui, tap, spin, land, win(n steps), special, bonus intro, outro, big(1-4), tick, fever-on, ambience bed; (4) SIDE MECHANIC: panel position/size, states/thresholds and which server payload fields drive it; (5) COPY: game name, logo text, bonus name, intro chips (3), buy-card names/texts/volatility dots (fever + 2 buys), confirm texts, big-win tier names (5x/10x/25x/100x), idle/win/lose messages, info-screen rules. (6) PER-SPIN PAYLOAD you expect from the engine (fields per step). Please put these in clearly numbered sections so I can quote them.

**rin** in #building (18:22:33)

@kai agreed, CONTRACT v1 stands incl. all [+] items (spinIndex/retrigger/spinsLeft are now enforced by tools/check-round.js; EmberClaw already satisfies them). Notes: (a) the original emberclaw-engine.js omits `capped`/basePayout on bought rounds; my adapter engines/emberclaw.js adds them (basePayout:0, capped) without touching the original, so the server response gains those 2 fields. (b) slot #2 engine = ONE self-contained file engines/<slug>.js, I will write it that way.
Ready now: POST /api/slot/:id/spin (server.js section SLOTFORGE SLOT ROUTES, tested), engines/{index.js,emberclaw.js,ENGINE-API.md}, tools/{sim.js,solve.js,check-round.js,engines.test.js}. Run: node --test tools/engines.test.js ; node tools/sim.js emberclaw all 200000 1,2,3,4
@judge please approve CONTRACT v1 (see kai's post above, enforced in tools/check-round.js). Full EmberClaw sim numbers follow when the 2M-round runs finish.

**rin** in #all (18:22:33)

CONTRACT v1 is final between kai and rin (full text: kai's post in #all, 18:20). Enforced by slotforge/tools/check-round.js. @judge approval requested. Engine API: slotforge/engines/ENGINE-API.md; route POST /api/slot/:id/spin is live in server.js.

**leo** in #handoff (18:22:36)

@kai @maya leo: DOC READY: plans/grumble-and-brine/02-look-sound.md (13 numbered sections). Quote: s6 = symbols (9 listed, SVG primitives), s7 = character (parts #cBody #cHead #cEyes #cPupils #cBrows #cMouth #cLamp #cClawL #cClawR #cPincerTop/Bot #cGauge; state table), s8 shell skin, s10 sound recipes, s11 copy, s13 = your contract-name quick ref (states idle/spin/win/big/special/wince + bonusmode; sfx names ui,tap,hit,spin,land,win,special,scatter,bonus,outro,big,tick,feverOn; chips; confirm texts).
Palette: ink #0b1820, Abyss #071c30, Murk #13525c, Kelp #2c7a62, Amber #ffb938, Coral #ff6f7d, Jelly cyan #5df2e0. 
@maya: sections 9 (side mechanic) and the rules text (11) are placeholders until I read 01-features-math.md; please tell me the side-meter (if any), final numbers (free dives, multipliers, buy names, Deep Pressure cost) so I patch copy. Also: I will do a concept SVG of the crab + 4 symbols next.

**maya** in #planning (18:22:48)

maya -> leo: agreed on all your names (SLUG grumble-and-brine, Lantern Jelly wild, Sonar Buoy scatter, Deep Dive, Drift, Deep Pressure, Dive Ticket/Abyss Pass, Bubble/Barnacle/Salvage/Kraken).
ONE CHANGE REQUEST: grid is 5 reels x 3 rows (243 ways, 3-of-a-kind from the left pays), and sims show 7 pay symbols give ~38-40% hit frequency (target 22-28%). 9 pay symbols give ~29%. Please ADD 2 pay symbols => 9 pay + wild + scatter = 11. Suggested (rename freely): s6 Golden Doubloon (high), s7 Trident (high), s8 Pearl Clam (top) ; wild and scatter move to s9 Lantern Jelly, s10 Sonar Buoy. Order low->high: Old Boot, Tin Can, Message Bottle, Rusty Key, Brass Compass, Barnacle Anchor, Golden Doubloon, Trident, Pearl Clam. Tell me if you hate it and want another pair.
Side mechanic: TIDE GAUGE (only in Deep Dive) = a vertical/short gauge showing Tide level 0..3 (persistent multiplier bonus for new Jellies). In base game no side meter; instead show a 5-lane "current" arrow strip above the reels where Jellies drift. Numbers coming in my doc within the hour; core: Deep Dive = 8/10/12 dives for 3/4/5 buoys, 2+ buoys retrigger +3. Deep Pressure = 2x bet, ~3.5x bonus chance.

**judge** in #building (18:22:51)

VERDICT: APPROVE (CONTRACT v1) with 5 required amendments before round 2. Checked against server.js slot section + ENGINE-API.md.
1. SETTLEMENT must be one atomic write. Today: conditional debit, then a separate batch credits payout. If the 2nd write fails the stake is gone with no bet row. Use ONE statement `UPDATE users SET balance=balance-?+? WHERE id=? AND balance>=?` (cost, payout, id, cost) then log; or db.transaction('write'). @rin
2. STRICT INPUT: `ante = req.body.ante === true` (today `!!"false"` === true). stake must be a finite number. Good: hasOwn(C.buy) is in (the old EmberClaw route accepted buy:"toString"; I reproduced: engine played a full bonus with cost=undefined; only the NaN debit saved us).
3. ONE SOURCE OF TRUTH for anything the player reads: the info/paytable must be generated from engine PAYTABLE x payScale (+ flat bonuses). EmberClaw shows 3x/8x/20x/50x but pays 5.5% more (payScale 1.055): a paytable that lies. Extend the slot.json==CFG build assert to the paytable, or serve GET /api/slot/:id/info. @kai @rin
4. `capped` and `basePayout` on EVERY round from the engine itself (the adapter patch is fine for EmberClaw, not for new engines). check-round.js must run over >=100k rounds per mode in engines.test.js AND on a live /api/slot/:id/spin response in an integration test.
5. Bonus spins: `spinsLeft` required (not optional) so the counter never has to be inferred client-side.
Non-blocking: add `round.v=1` for future shape changes. Full baseline + acceptance criteria coming in #all shortly.

**judge** in #planning (18:23:16)

judge on the concept: APPROVED to proceed (grumble-and-brine, 243 ways, Drifting Wilds). Not an EmberClaw reskin: lines/ways, no tumbles, no heat meter. Walking wilds exist in the market, so the HOOK must be the drift CHAIN + multiplier you can read at a glance; make it visible (current strip, xN on the jelly, chain counter).
Math algebra you must design to (same bonus everywhere, no special richer tables like EmberClaw's anteBonusWeights):
- Let RTP=0.962, S = bonus contribution per base bet, Rb = base-game-only return = 0.962-S.
- Bet-up costing N with bonus M x likelier: RTP_ante=(Rb+M*S)/N. For it to equal RTP: M = 1+(N-1)*0.962/S. maya's Deep Pressure N=2, M=3.5 => S must be 0.385 (bonus share 40% of RTP, Rb=0.577). If your bonus share is ~30%, M must be ~4.2. Pick one and show it.
- Natural bonus 1-in-F has E[B]=S*F. Standard buy price P must satisfy E[B_bought]=0.962*P: Dive Ticket 100x => E[B]=96.2x => with S=0.385, F~250. Bought bonus = the SAME bonus as a natural trigger (EmberClaw: bought standard returns 62-67% while natural is ~60x and Pre-Heated ~96-100%: never again).
- Premium 500x: E=481x from an enhanced start state; it must not exceed 96.5% on any seed group.
- 243 ways hit rate: you do not need 2 extra symbols to drop hit freq; per-reel weights (fewer of each low on reel 3) do it too. Leo decides if he wants 9 pay symbols for art reasons; either is acceptable, the 22-28% target is hard.
- Multiple jellies in one way: say ADD or MULTIPLY. Multiply across reels explodes the tail (x7*x7*x7); I recommend ADD per way, with the persistent Tide multiplier on top in Deep Dive. Cap 5,000-10,000x must be hit in sim (report P(>=1000x) and cap hits per 10M).

**leo** in #handoff (18:23:32)

@kai concept art ready: plans/grumble-and-brine/concept-symbols-captain.svg (7 working symbols + Captain with named groups; copy paths freely). Bottle s2 / key s3 are specced in the doc, not drawn yet.

**leo** in #planning (18:24:32)

@maya ACCEPTED: 5x3, 243 ways, 11 symbols. s0 Old Boot, s1 Tin Can, s2 Message Bottle, s3 Rusty Key, s4 Brass Compass, s5 Barnacle Anchor, s6 Golden Doubloon, s7 RUSTY HARPOON (instead of Trident: a trident is Poseidon/Greek cliche; harpoon = salvage + distinct dark/red silhouette), s8 Pearl Clam (top), s9 Lantern Jelly WILD, s10 Sonar Buoy SCATTER. Doc updated (plans/grumble-and-brine/02-look-sound.md): 5x3, ids s0..s10, Tide Gauge (Deep Dive only, left tube) + Current Strip above reels with chain counter, dives 8/10/12, retrigger +3, Deep Pressure 2x. Judge's point about a readable hook is covered by the strip: scrolling left current, cyan chevron per drift, xN chip, DRIFT xk counter. Please confirm in your doc: ADD (not multiply) jellies per way, and give me the final numbers + Abyss Pass start state so I patch card texts.

**judge** in #all (18:24:58)

BASELINE REVIEW: EmberClaw (details + sim table: slotforge/reviews/00-baseline.md). Played it in Playwright + ran 13 seeded sims.
Scores: Novelty 3 · Math 1 · Server/security 3 · Shell 4 · Look 4 · Sound/feel 3 · Completeness 3 = avg 3.0. By our own rubric it would NOT ship. It is the bar for look + shell, NOT for math.
Top findings:
1. Base RTP is ~100%, not 95-96%: 1M-round seeds give 102.2% / 99.2%; decomposition 76.5% base + 64.7x/273 bonus = 100.2%. EMBERCLAW.md numbers come from lucky short seeds.
2. Buy 100x returns ~64%, Pre-Heated 500x ~96-100% (100.00% on one seed). Fever 94-95% using a separate richer bonus table.
3. Paytable shows unscaled pays (engine pays x1.055 + heat flats). Settlement is 2 writes. Old route accepted buy:"toString".
4. Layout breaks off 16:9 (logo clipped at 844x390, bet picker overflows at 390x844); 5 of 7 pay symbols are grey metal.
LESSONS for slot #2: one bonus for natural/ante/buy; price buys = E[bonus]/0.962; bet-up via M = 1+(N-1)*0.962/S; evidence = decomposition + confidence interval over several seeds; paytable generated from engine data; atomic one-statement settlement; test 4 viewports; distinct hue+silhouette per symbol; no black-board gap between spins.

**judge** in #all (18:25:50)

ACCEPTANCE CRITERIA for slot #2: slotforge/reviews/01-acceptance.md (38 checks, A-F). Headlines:
[ ] A math: every mode (base, Deep Pressure, Dive Ticket, Abyss Pass) 96.0-96.5% point estimate, 95% CI upper < 97.0%. Evidence = 2M rounds x 4 seeds per mode AND decomposition Rb + P(trig)*E[bonus] with E[bonus] from >= 2M bonus plays. Hit 22-28%. Cap 5k-10k reached in sim, never exceeded. ONE bonus for natural/bet-up/Dive Ticket. Seeded runs reproducible; EmberClaw SEED=1 300k standard must still print 95.33.
[ ] B server: route tests (bad stake, buy:"toString", ante:"false", ante+buy, unknown slot, broke) + atomic settlement under 2 concurrent spins; check-round.js on 100k/mode and on live responses.
[ ] C shell: shell element boxes match EmberClaw +/-2px stage coords; 4 viewports 1600x900/1280x720/844x390/390x844 incl. modals; EmberClaw before/after screenshots identical.
[ ] D look: distinct hue+silhouette per symbol (greyscale 48px test), every Captain state screenshotted, drift xN readable, no black board between spins.
[ ] E sound: Web Audio only (grep), turbo no-win spin <= 1.3s.
[ ] F polish: scripted 50 spins + both buys + fever + 25 autoplay with 0 console errors; standalone by script; info generated from engine data; README with sim commands+outputs.

**judge** in #planning (18:27:29)

@leo judge on concept-symbols-captain.svg (rendered it, colour + greyscale: scratchpad shots gb-concept*.png). Ink, hatch, outlines: good, matches the bar.
1. MUST FIX: Brass Compass (s4) and Golden Doubloon (s6) are both gold discs; in greyscale they are the same round coin. Fails D2 (distinct hue AND silhouette). Change one silhouette (e.g. doubloon = a small stack/spill of coins or a treasure purse; or compass = open hinged pocket-watch shape) and move one off gold. Also watch the gold count: Boot mustard + Compass + Doubloon = 3 yellows.
2. MUST FIX: Captain does not read as a CRAB. It reads as a red robot/diver with a grinning human face behind the glass. Give him eye stalks inside the helmet, a crab mouth/mandibles, real pincer claws (the left one is a mitten), a visible carapace edge. And the brief says grumpy; the default face grins. Idle should scowl; the grin belongs to `win`.
3. OK: Jelly (wild) and Buoy (scatter) are the most readable symbols on the sheet: keep. Harpoon at 64px is a thin diagonal; thicken shaft ~1.5x so it survives 48px.
4. Tin Can vs Anchor: both blue-grey; the red label/coral saves them in colour; fine if the coral stays big.

**judge** in #building (18:27:59)

@rin judge ran your route on a scratch server (fresh DB, not nebula.db): bad stake 400, "abc" 400, buy:"toString"/"__proto__" 400, ante+buy 400, unknown slot 404, no auth 401, legacy /api/emberclaw/spin 200, 2 concurrent $750 spins on $992 -> exactly one 200: all GOOD.
CONFIRMED BUG: {ante:"false"} is charged as ante (cost=3, balance 1000->997). Fix: `ante = req.body.ante === true`. Amendment #1 (single-statement settlement) still open.
Tests: `node --test tools/engines.test.js` -> 7/7 pass. But `node --test tools/` (the command in the file header and your chat post) FAILS on Node 22 (treats dir as a module). Fix the docs to name the file or use `node --test tools/*.test.js`.
sim.js: PASS needs only CI half-width <= 1.0 pt; acceptance A3 needs point 96.0-96.5 AND CI upper < 97.0. Please add the decomposition line (Rb + P(trig)*E[bonus]) with E[bonus] taken from the buy-mode rows of the same run.

**rin** in #building (18:29:34)

@judge amendments done (server.js SLOTFORGE section): 1) settlement is ONE statement `UPDATE users SET balance=balance-cost+payout, wagered, rake WHERE id=? AND balance>=cost`, then bets-row insert (a failed log can never lose money). 2) strict input: stake must be a finite JSON number, ante must be boolean (`"false"`,1,0 -> 400), buy must be a string and an OWN key of CFG.buy. 3) GET /api/slot/:id/info (public) serves bets/maxWin/anteCost/buy + engine info(); EmberClaw's gives paytable = PAYTABLE x payScale and heat flat x payScale. @kai: use it (or slot.json assert) for the info screen. 4) ENGINE-API now says capped+basePayout must come from the engine itself (EmberClaw adapter patches only because its file is frozen); check-round.js runs on live responses in tools/api.test.js. 5) spinsLeft REQUIRED, round.v=1 required (adapter adds v). sim.js: PASS now = point in 96.0-96.5 AND CI upper < 97.0; prints the decomposition Rb + P(trig)*E[bonus] from buy rows. Docs fixed: run `node --test tools/*.test.js`.
Tests: engines.test.js 7/7; api.test.js 5/5 (starts its own server on a random port + temp DB: auth, 404 unknown slot, bad stake/buy/ante, broke user, public info, 300 live spins on both routes checked with check-round + cents-exact balance, 12 concurrent spins atomicity).
EmberClaw 2M-round sims are running (CPU is shared, slow); numbers next.

**lead** in #all (18:34:30)

ROLL CALL from lead: the owner asks 'can everyone see this and type?'. Everyone please reply in #all with one line: 'HERE <name>' plus your current status (what you are doing / done / blocked). Judge: please also confirm you can see #planning and #building.

**lead** in #dm-leo (18:34:30)

@leo you finished earlier; if you are resumed, please reply 'HERE leo' in #all too.

**leo** in #planning (18:35:08)

@judge thanks, all 5 points accepted, doc section 14 overrides: s6 = Coin Purse (burgundy sack, spilled coins, non-round silhouette; gold only on compass ring + small coins), compass gets ring loop and chain, harpoon shaft 1.5x, Captain gets eye stalks, notched carapace, true two-piece pincers, mandibles, SCOWL idle (grin only on win/big/special). I will redraw the concept SVG when resumed.

**leo** in #all (18:35:08)

HERE leo. Status: Round-1 look/sound doc done (plans/grumble-and-brine/02-look-sound.md, section 14 = judge fixes); concept SVG redraw pending; waiting on maya's 01 doc numbers.

**maya** in #planning (18:35:15)

maya: CONFIRMED (details in 01-features-math.md, ~30 min):
- 5x3, 243 ways, 9 pay symbols s0..s8 in leo's order (Harpoon s7 is fine), s9 Jelly wild (reels 2-5 only), s10 Buoy scatter.
- Jelly values ADD, never multiply with each other: a Jelly of value m counts as m copies of the symbol on its reel; counts ADD within a reel, ways MULTIPLY across reels as always. Tide (Deep Dive) is added to a Jelly's starting value. Max Jelly value 25.
- DRIFT RULE CORRECTION @leo (info rule 3): drift does NOT need a win. As long as >=1 Jelly is on the board, it drifts one reel left (+1 value) and the 4 other columns' non-Jelly cells respin; repeat until no Jelly remains. A Jelly on reel 1 is paid once more, then leaves (no further respin for it). No new Jellies/Buoys land during Drifts. So a Jelly starting on reel c causes c-1 Drifts.
- Deep Dive: 8/10/12 dives for 3/4/5 Buoys; Tide 0..3 (each Jelly that leaves the board raises Tide by 1, persistent for the whole Deep Dive); Tide adds to every NEW Jelly's value; guaranteed Jelly on reel 4/5 on dives 1,4,7,...; 2 Buoys = +3 dives, 3+ Buoys = +6; max 40 dives.
- Deep Pressure: costs 2x, Deep Dive ~3.3-3.5x likelier (1 in ~68 instead of ~1 in 235); SAME bonus (judge's rule). Dive Ticket 100x = a 3-Buoy, 8-dive Deep Dive (a visible trigger spin with 3 Buoys first). Abyss Pass 500x = 12 dives, Tide starts at 2 (max 3), a guaranteed Jelly EVERY dive and ~20% more Jellies. Final numbers after sim.
- Buoys (scatter) also pay in the base game: 3 = 2x, 4 = 10x, 5 = 50x bet.
- Max win 7,500x.
@judge: using ADD within reel as recommended; same bonus in all modes; will show decomposition + P(>=1000x) + cap hits.

**judge** in #all (18:35:16)

HERE judge. I can read and post in #all, #planning, #building, #handoff. Status: baseline review (reviews/00-baseline.md) and acceptance criteria (reviews/01-acceptance.md) are posted, CONTRACT v1 approved with 5 amendments, and I tested rin's route on a scratch server. Waiting on maya's 01-features-math.md; after that I write the round-1 verdict.

**judge** in #planning (18:36:07)

@maya judge on your 18:35 numbers. Direction APPROVED (ADD within reel, same bonus, cap 7,500x). Five things to settle in 01-features-math.md before builders start:
1. ALGEBRA IS COUPLED. Dive Ticket = the 8-dive bonus, so price 100x needs E[8-dive] = 96.2x. Natural triggers also give 10/12 dives, so E[natural] > 96.2x (say ~101x if 4-5 Buoys are ~10% of triggers). With 1-in-235: S = 101/235 = 0.43, Rb = 0.962-0.43 = 0.53, and Deep Pressure M = 1+0.962/0.43 = 3.24 (not 3.5). If you want M=3.5 with N=2 you need S=0.385 => trigger ~1-in-262. Pick F, then M and Rb follow; publish the 4 numbers (F, E8, E_nat, M) with sim output.
2. SCATTER PAY vs TRIGGER SPIN: Buoys pay 2x/10x/50x in base. The bought trigger spin shows 3 (or more) Buoys and must pay 0 (product rule 8 + A9). State explicitly: scatter pay does not apply to bought trigger spins, and the client shows no scatter win there.
3. WILD ON REEL 1 (after a drift): define ways evaluation when reel 1 holds a Jelly: it starts a way for EVERY pay symbol present on reel 2 (via substitution); a way made only of Jellies pays as the highest symbol? Or not at all? Write the rule + one worked example with numbers.
4. "Paid once more on reel 1, then leaves": spell out the drift-sequence payout per step (each drift step's board is evaluated and paid? only steps with wins?) and the respin cell set (all non-Jelly cells on all 5 reels, or 4 columns?). Your text says 'the 4 other columns'; with 5 reels and 1 Jelly reel that is right only for one Jelly.
5. Abyss Pass: 500x needs E = 481x from 12 dives + Tide 2 + Jelly every dive + ~20% more Jellies. "20% more Jellies" changes symbol weights = a second bonus table; allowed ONLY for the premium buy (A7). Keep the Deep Pressure bonus identical to the natural one.
Base pacing note @leo @kai: a Jelly landing on reel 5 forces 4 drift respins in the BASE game every time. Turbo must make each drift <= 0.35s or base spins drag.