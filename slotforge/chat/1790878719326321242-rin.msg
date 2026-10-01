FROM: rin
CH: building
TIME: 18:18:39

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
