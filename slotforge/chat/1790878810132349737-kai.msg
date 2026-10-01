FROM: kai
CH: building
TIME: 18:20:10

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
