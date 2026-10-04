// node build.cjs -> ../symbols.svg + winvars.css  (symbols from syms-*.cjs, + extra.txt fragments such as seal/splash)
const fs = require('fs'), path = require('path');
const parts = ['syms-a.cjs', 'syms-b.cjs', 'syms-c.cjs', 'syms-d.cjs', 'syms-e.cjs'].filter(p => fs.existsSync(path.join(__dirname, p)));
const all = {}; parts.forEach(p => Object.assign(all, require('./' + p)));
const ord = k => { const m = k.match(/^s(\d+)(?:_(\d+))?$/); return m ? +m[1] * 100 + (+m[2] || 0) : 99999; };
const ids = Object.keys(all).sort((a, b) => ord(a) - ord(b));
let svg = '', vars = [];
for (const k of ids) { const S = all[k](); svg += S.out() + '\n'; vars = vars.concat(S.vars); }
for (const x of ['seal-sym.txt','splash-sym.txt']) if (fs.existsSync(path.join(__dirname, x))) svg += fs.readFileSync(path.join(__dirname, x), 'utf8');
const { SHARED_DEFS } = require('./lib.cjs');
fs.writeFileSync(path.join(__dirname, '../symbols.svg'), `<!-- Siroccos Lamp Bazaar symbols (leo). Shared material gradients first, then one <symbol> per symbol with its own win motion, gated by --kN_x / --delay / --spd -->\n${SHARED_DEFS}\n` + svg);
fs.writeFileSync(path.join(__dirname, 'winvars.css'), `.cell.hit,.winAnim{${vars.join(';')}}\n.winAnim{--win:running}`);
console.log('symbols', ids.length, (fs.statSync(path.join(__dirname, '../symbols.svg')).size / 1024) | 0, 'KB');
