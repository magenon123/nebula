# SlotForge front-end shell

One shared shell, one thin module per slot. EmberClaw (`slots/emberclaw/`) is the reference implementation.

```
slotforge/shell/
  template.html      page skeleton (placeholders {{...}}, filled by build-standalone.py)
  slot-shell.css     everything shared (stage, bar, buy sign + screen, bet picker, menu, autoplay, modals, splashes, big win, pops, grain)
  slot-shell.js      shared logic: SlotShell.boot(cfg, factory)
  shell-defs.svg     hand-ink wobble filters (roughS/C/L/U) + hatch patterns (hatchS/C/L, dots)
  regress.cjs        Playwright regression (see below)
  baseline/          emberclaw-standalone.orig.html = the file before the refactor (pixel/behaviour baseline)
slotforge/slots/<slug>/
  slot.json          static data: ids, API path, bets, buys, fever, tiers, copy, intro chips (see "slot.json")
  slot.js            hooks (see "Hooks") - the only logic file
  slot.css           per-slot CSS, loaded AFTER the shell CSS (re-skin via the :root tokens)
  symbols.svg        <symbol id="s0".."sN" viewBox="0 0 64 64"> ... (ink outline, flat fills, hatch)
  scene.html logo.html frame.html character.html side.html   art fragments, dropped into the 1600x900 stage in that order
  info.html          body of the Game Info modal (rules text; paytable table is filled by slot.js)
build-standalone.py  (repo root)
```

## Build

```
python3 build-standalone.py                  # EmberClaw: emberclaw-standalone.html + emberclaw.html
python3 build-standalone.py <slug>           # <slug>-standalone.html: offline demo, engine embedded, play money
python3 build-standalone.py <slug> --server  # + <slug>.html (talks to POST <cfg.api>, needs the Nebula login token)
python3 build-standalone.py <slug> --server-only
```
The build (1) wraps the engine source in a closure (`SLOT_ENGINE`; no name clashes with page code), (2) **asserts slot.json equals the engine
CFG** (bets, maxWin, anteCost, buy costs) and fails otherwise, (3) injects `SLOT_CFG` (= slot.json + `engineData`: the engine's `PAYTABLE`
and `CFG.payScale` so the info screen can show the real pays), (4) substitutes `[[maxWin]]`, `[[anteCost]]`, `[[buy:<key>]]` in `info.html`
from the checked values. Engine source = `engineSource` in slot.json, default `slotforge/engines/<slug>.js`; it must be ONE self-contained
ES file (only `import ... from 'crypto'` is allowed; it is stripped) exporting at least `playRound`, `CFG`.

## CONTRACT v1 (what the shell expects from the server/engine)
Request `POST <cfg.api>` `{stake, ante?: true|false, buy?: key}` with `Authorization: Bearer <stakeToken>` -> `{round, stake, cost, payout, user:{balance}}`.
Money in `round` is in multiples of the base bet; the shell shows dollars only from `cost`/`payout`/`user.balance`.
`round` fields the shell reads: `cost`, `totalPayout` (x bet; used for the big-win tier), `bonusTriggered`, `bonus.startSpins`, `bonus.spins[]`
(each: `spinIndex` 1-based, optional `retrigger` = spins added by that spin; `spinsLeft` required by the contract, not yet displayed),
`bought` (buy key or absent; the shell sends `buy` itself). Everything else (`initialGrid`, `cascadeSteps`, per-spin payload) is slot-defined and
only read by `slot.js`. For a bought round the base payload is the trigger board (scatters, no wins); the shell plays it with `playSpin`, then `showTrigger`, then the intro splash.

## slot.json
| key | meaning |
|---|---|
| `id`, `title`, `logoText`, `infoTitle` | page title, sign-in screen name, info modal heading |
| `api`, `engineSource`, `storage`, `walletKey`, `startBalance` | API path; engine file (relative to repo root); localStorage prefix (`<storage>_snd`, `_turbo`); standalone wallet key and start balance |
| `bets[]`, `defaultBet`, `maxWin`, `anteCost` | **must equal engine CFG** (build asserts). Bets $0.10..$10,000 |
| `scatterSym` | symbol id of the bonus symbol (Bonus Buy sign, intro gems) |
| `char` | `{el:'char', states:[...], bonusClass:'bonusmode'}`: id of the character element, the state classes that `S.char()` toggles, class set during the bonus |
| `tiers[]` | big-win tiers `{min (x bet), name, lv 1..4}`; `autoBigLv`: tier level at which "stop on big win" triggers |
| `text` | `idle`, `win` (`{amt}`), `lose`, `freeSpin` (`{n}`), `freeSpinRetrigger` (`{r}`) |
| `fever` | the bet-up mode card: `name, sym, vol (1-5 flames), text, badge, onMsg, offMsg`. Costs `anteCost` x bet; request field `ante` |
| `buys[]` | `{key, mult, sym, vol, name, text, confirmTitle, confirmText}`; `buys[0]` is the price on the hanging sign |
| `intro` / `outro` | `{unit, ribbon, chips[3]}` / `{ribbon}` for the splash screens |
| `audio.reverb` | `{sec, pow, wet}` |

## Hooks (`slots/<slug>/slot.js`)
```js
SlotShell.boot(SLOT_CFG, S => { ...slot state...; return { ...hooks }; });
```
`S` (shell API): `$ cfg store fmt betLbl sleep wait(ms, turbo-scaled) T() tpl sfx say(text, highlight) shake(big) flash() embers(n,x,y,gold) coins(n) char(state, ms) countUp(el,to,ms,from,onTick) pop(screenX,screenY,text) openM closeM tapWait refreshUi bigWin scale() bet() isTurbo() isBusy() local`.
`S.sfx.<name>(...)` plays a recipe (muted when sound is off, never throws).

| hook | required | called when / contract |
|---|---|---|
| `sfx(kit)` | yes | once, lazily, on first sound. Returns the recipe object. `kit = {ctx, out, bus, env, osc, noise, metal, st, T0, bed}`. **Required names:** `ui hit spin bonus outro big(level 1-4) tick(k 0..1) feverOn`; add any others you call yourself |
| `ambience(kit)` | no | return `kit.bed({lowpass, gain, level, loopSec, crack:{...}})` (or your own `{start(), stop()}`) for the bed that starts on first click |
| `init(S)` | yes | after the shell DOM is built: build the grid/side panel/paytable |
| `paintIdle()` | yes | first paint of the board |
| `roundStart()` | yes | at spin start (reset the side mechanic) |
| `clearBoard()` -> Promise | yes | board exit animation; runs in parallel with the API call, and again before every bonus spin |
| `restoreBoard()` | yes | API error: put the last board back |
| `baseSpin(R)` | no | maps the round to the object passed to `playSpin` for the base spin (default: `R` itself) |
| `playSpin(spin, run, ctx)` -> Promise<run> | yes | animate one spin (base, trigger board, or bonus spin). `ctx = {stake, onWin(before, after)}`; call `onWin` as winnings land (updates the WIN field). Returns the running total in dollars |
| `showTrigger(R)` -> Promise | yes | scatters pulse on the board before the intro splash |
| `bonusMode(on)` | no | bonus start/end (the shell also toggles `cfg.char.bonusClass`) |
| `ambientBoost()`, `particleColor(p, a)` | no | extra ambient-spark rate; fillStyle for a particle (`p.c` = gold flag, `p.l` = life left, `a` = alpha) |

### The shell does (do not re-implement)
stage fit; bottom bar state; bet chevrons + picker; menu (sound, turbo, game info, fullscreen); Bonus Buy sign + screen (cards are generated from `fever` + `buys`);
buy confirm (balance check); bet-up ("Fever") mode with TOTAL BET in the bar; autoplay dialog, white-square stop button with spins left, stop-on-bonus/big-win;
tap-anywhere splash waits (first 450 ms ignored); count-ups with click-to-skip; big-win overlay with tier names from `tiers`; shake/flash/particles;
audio engine primitives, reverb, ambience helper; API client (server, or the embedded engine with a play-money wallet); the round lifecycle:
stake -> api -> `clearBoard` + `playSpin(base)` -> `showTrigger` -> bonus intro (tap) -> per bonus spin `clearBoard` + `playSpin` -> outro (count-up, tap) -> big win.

### Fixed placement (do not move)
Stage 1600x900 scaled to fit. Bonus Buy sign `left:40 top:150`; `#barL` (menu, balance, win) `150,782`; `#barR` (bet + chevrons) `880,782`; spin ring `1198,752` 140px;
autoplay `1362,800`; message line `540,728`; free-spin pill `36,34`; badges `1075/1290, 732`. Slot art lives at: scene (full stage), logo `470,6`, board frame `470,150` (660x550 in EmberClaw),
character `1100,296`, side mechanic left of the board. Re-skin colours with the tokens in `:root` (`--ink --accent --gold --panel1/2 --rim --rivet --bevel --btn --txt --muted --acc1/2`) in `slot.css`.

### Gotchas
* The engine runs inside a closure; slot.js and the shell can use any names. Shell globals: only `SlotShell`, `SLOT_CFG`, `SLOT_ENGINE`.
* `@keyframes blink` / `rot` / `flick` / `wob` / `bigin` are shell keyframes (used by splash, spin button, medal fire, buy-sign gem); do not redefine them in slot.css. (EmberClaw's eyes use the shell `blink`: the original file also had two `blink` keyframes and the opacity one won; kept identical.)
* Do not read `round` money fields in slot.js to show dollars: use `ctx.stake * step.payout`, as EmberClaw does, only for per-step pops.

## Regression: `node slotforge/shell/regress.cjs`
Runs the standalone build (default `emberclaw-standalone.html`) through: idle render, menu toggles (sound, turbo, info, fullscreen), bet picker min/max + chevrons,
buy confirm with insufficient balance, plain spin + Space spin, Bonus Buy -> confirm cancel / accept -> trigger spin -> intro tap -> bonus -> outro tap, premium buy,
Fever on/off (TOTAL BET, modal closes), autoplay with the white stop square, Escape, 4 viewports (1600x900, 800x600, 1280x720, 844x390, 390x844) with bet picker + buy screen.
RNG is seeded (same rounds in baseline and new). It then runs the pre-refactor baseline `baseline/emberclaw-standalone.orig.html` the same way and diffs every checkpoint
(balance, win, bet, messages, open modals) and every screenshot (CSS animation frozen on static checkpoints; <= 2.5% differing pixels). Artifacts: scratchpad `regress/{new,base}/*.png` + `results.json`.
Takes ~5 minutes. `node regress.cjs <other-standalone.html>` checks another slot (no baseline); `--compare DIR_A DIR_B` re-diffs two runs. Exit code 1 on any problem.
