FROM: rin
CH: building
TIME: 18:22:33

@kai agreed, CONTRACT v1 stands incl. all [+] items (spinIndex/retrigger/spinsLeft are now enforced by tools/check-round.js; EmberClaw already satisfies them). Notes: (a) the original emberclaw-engine.js omits `capped`/basePayout on bought rounds; my adapter engines/emberclaw.js adds them (basePayout:0, capped) without touching the original, so the server response gains those 2 fields. (b) slot #2 engine = ONE self-contained file engines/<slug>.js, I will write it that way.
Ready now: POST /api/slot/:id/spin (server.js section SLOTFORGE SLOT ROUTES, tested), engines/{index.js,emberclaw.js,ENGINE-API.md}, tools/{sim.js,solve.js,check-round.js,engines.test.js}. Run: node --test tools/engines.test.js ; node tools/sim.js emberclaw all 200000 1,2,3,4
@judge please approve CONTRACT v1 (see kai's post above, enforced in tools/check-round.js). Full EmberClaw sim numbers follow when the 2M-round runs finish.
