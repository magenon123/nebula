# SlotForge engine API (v1)

A slot's back end is ONE ES module `engines/<id>.js` plus one line in `engines/index.js`. The generic route
`POST /api/slot/:id/spin` and the tools (`tools/sim.js`, `tools/engines.test.js`) need nothing else.
EmberClaw's adapter (`engines/emberclaw.js`) re-exports `/emberclaw-engine.js`, which stays the single source of truth.

## Exports

| export | type | meaning |
|---|---|---|
| `id` | string | registry id, = route `:id` = `game` name in the `bets` table (`[a-z0-9_-]+`) |
| `name` | string | display name |
| `CFG` | object | tunables, see below |
| `playRound(rng, {ante=false, buy=null})` | function | pure; returns a round (CONTRACT v1). `rng()` returns uniform [0,1). No I/O, no clock, no `Math.random` |
| `cryptoRng()` | function | production RNG (`crypto.randomBytes`, 48 bit uniform [0,1)) |

### `CFG` (required fields)
- `bets: number[]` allowed stakes in USD, ascending, each a multiple of $0.01 ($0.10 .. $10,000). The server accepts a stake only if `CFG.bets.includes(stake)`.
- `maxWin: number` cap on `round.totalPayout` in multiples of the base bet (5,000-10,000).
- `buy: { [key]: { cost, ...startState } }` bonus buys. `cost` is in base bets (standard ~100, premium ~500). Other fields (e.g. `heat`) are the engine's own start state. `{}` if none.
- `anteCost: number` cost multiplier of the bet-up ("Fever") mode (e.g. 3). Omit if the slot has none.
- `rakeEdge?: number` house edge used for rakeback (server default 0.04).

Everything else in `CFG` (weights, scatterP, payScale ...) is engine-private; the sim may override it with `--cfg '{"payScale":1.06}'`.

## `playRound(rng, { ante, buy })`
- `buy` is a key of `CFG.buy` or null. `ante` and `buy` never combine (server rejects it).
- Returns a round satisfying CONTRACT v1 (below). All money is **in multiples of the base bet**; the server multiplies by the stake and rounds to cents.

## CONTRACT v1 (round shape)
1. `cost` number > 0: 1 for base, `CFG.anteCost` for ante, `CFG.buy[key].cost` for a buy.
2. `totalPayout` number >= 0 and <= `CFG.maxWin`; includes the bonus.
3. `bonusTriggered` boolean.
4. `bonus` null if not triggered, else `{ startSpins:int>=1, spins:[>=1 items], totalPayout }`; every `spins[i]` has `totalPayout` (number), `spinIndex` (1-based, in order), optional `retrigger` (int, spins added) and `spinsLeft` (int); `bonus.totalPayout == min(maxWin, sum spins)`.
5. `bought` absent/null, or the buy key. If set: `bonusTriggered === true`, `cost === CFG.buy[key].cost`, `basePayout` 0 or absent.
6. `initialGrid` present on every round. For a bought round it is the visible **trigger spin**: scatters land, `cascadeSteps` is `[]` (no wins), then the client shows the intro splash.
7. `cascadeSteps` array (items slot-defined; any `payout` must be a number). `basePayout` number (base spin payout; absent only for bought rounds).
8. `capped` boolean (true when the cap truncated the round).
Invariant: `totalPayout == min(maxWin, (basePayout||0) + (bonus?.totalPayout||0))`.
Per-spin payload (grid, clusters/lines, features) is slot-defined and documented in that slot's plan. The client reads no money from anywhere else.

## Standalone constraint (agreed with kai)
The offline build embeds the engine source, so a slot engine must be ONE self-contained ES file: no imports except `'crypto'`, and no `Buffer`/`process`/`fs` on the play path (`cryptoRng` may use crypto; the browser build ignores it). `slot.json` `engineSource` names the file to embed (EmberClaw: `emberclaw-engine.js`; others default to `engines/<id>.js`). `slot.json` bets/anteCost/buys/maxWin must equal `CFG`.

## Invariants every engine must keep
- Payouts are multiples of the base bet and finite; never negative; never above `maxWin`.
- Determinism: same seeded rng -> same rounds (no hidden state across calls).
- A buy must not return more than it costs (RTP per mode <= ~96.5%; target 96.0-96.5% in every mode).
- Trigger spin of a bought round pays nothing.
- Bonus loops are bounded (max spins / steps) so a round always terminates.

## Adding a slot
1. `engines/<id>.js` exporting the table above. 2. Register in `engines/index.js`. 3. `node tools/sim.js <id> all 2000000 1,2,3,4` and `node --test tools/engines.test.js`.
