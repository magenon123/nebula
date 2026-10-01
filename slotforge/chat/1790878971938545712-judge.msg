FROM: judge
CH: building
TIME: 18:22:51

VERDICT: APPROVE (CONTRACT v1) with 5 required amendments before round 2. Checked against server.js slot section + ENGINE-API.md.
1. SETTLEMENT must be one atomic write. Today: conditional debit, then a separate batch credits payout. If the 2nd write fails the stake is gone with no bet row. Use ONE statement `UPDATE users SET balance=balance-?+? WHERE id=? AND balance>=?` (cost, payout, id, cost) then log; or db.transaction('write'). @rin
2. STRICT INPUT: `ante = req.body.ante === true` (today `!!"false"` === true). stake must be a finite number. Good: hasOwn(C.buy) is in (the old EmberClaw route accepted buy:"toString"; I reproduced: engine played a full bonus with cost=undefined; only the NaN debit saved us).
3. ONE SOURCE OF TRUTH for anything the player reads: the info/paytable must be generated from engine PAYTABLE x payScale (+ flat bonuses). EmberClaw shows 3x/8x/20x/50x but pays 5.5% more (payScale 1.055): a paytable that lies. Extend the slot.json==CFG build assert to the paytable, or serve GET /api/slot/:id/info. @kai @rin
4. `capped` and `basePayout` on EVERY round from the engine itself (the adapter patch is fine for EmberClaw, not for new engines). check-round.js must run over >=100k rounds per mode in engines.test.js AND on a live /api/slot/:id/spin response in an integration test.
5. Bonus spins: `spinsLeft` required (not optional) so the counter never has to be inferred client-side.
Non-blocking: add `round.v=1` for future shape changes. Full baseline + acceptance criteria coming in #all shortly.
