/* Engine registry. To add a slot: create engines/<id>.js (see ENGINE-API.md) and add one line below. */
import * as emberclaw from './emberclaw.js';

const ENGINES = { emberclaw };

const REQUIRED = ['CFG', 'playRound', 'cryptoRng'];
for (const [id, e] of Object.entries(ENGINES)) {
  for (const k of REQUIRED) if (!(k in e)) throw new Error(`engine ${id} is missing export ${k}`);
  if (!Array.isArray(e.CFG.bets) || !(e.CFG.maxWin > 0)) throw new Error(`engine ${id}: CFG.bets / CFG.maxWin invalid`);
}

export const getEngine = id => (Object.prototype.hasOwnProperty.call(ENGINES, id) ? ENGINES[id] : null);
export const listEngines = () => Object.keys(ENGINES);
/* Round modes an engine supports: ['base', 'ante'?, 'buy:<key>'...] */
export function listModes(e) {
  const m = ['base'];
  if (e.CFG.anteCost) m.push('ante');
  for (const k of Object.keys(e.CFG.buy || {})) m.push('buy:' + k);
  return m;
}
/* Map a mode string to playRound options. Accepts 'base', 'standard' (alias of base), 'ante', 'buy' (first buy), 'buy:<key>', or a bare buy key. */
export function modeOpts(e, mode = 'base') {
  const buys = Object.keys(e.CFG.buy || {});
  if (mode === 'base' || mode === 'standard') return {};   // 'standard' = legacy emberclaw-sim name for the base game; buy it with 'buy' or 'buy:standard'
  if (mode === 'ante') return { ante: true };
  if (mode === 'buy') return { buy: buys[0] };
  const key = mode.startsWith('buy:') ? mode.slice(4) : mode;
  if (buys.includes(key)) return { buy: key };
  throw new Error(`unknown mode "${mode}"`);
}
export function modeCost(e, mode) {
  const o = modeOpts(e, mode);
  return o.buy ? e.CFG.buy[o.buy].cost : o.ante ? e.CFG.anteCost : 1;
}
