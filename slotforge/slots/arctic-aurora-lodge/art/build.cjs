// node build.cjs [parts...] -> writes ../symbols.svg and winvars.css (and ../slot.css winvars block when present)
const fs = require('fs'), path = require('path');
const parts = ['syms-a.cjs', 'syms-b.cjs', 'syms-c.cjs', 'syms-d.cjs'].filter(p => fs.existsSync(path.join(__dirname, p)));
const all = {}; parts.forEach(p => Object.assign(all, require('./' + p)));
const ord = k => (k[0] === 's' ? 0 : 1000) + (+k.replace(/\D/g, '') || 0) + (k[1] === '3' ? 100 : 0);
const ids = Object.keys(all).sort((a, b) => ord(a) - ord(b));
let svg = '', vars = [];
for (const k of ids) { const S = all[k](); svg += `<symbol-wrap/>`.length ? S.out() + '\n' : ''; vars = vars.concat(S.vars()); }
fs.writeFileSync(path.join(__dirname, '../symbols.svg'), `<!-- Arctic Aurora Lodge symbols (leo). Gradient materials, win motions inside each symbol, gated by --win/--delay/--spd -->\n` + svg);
const wv = `.cell.hit,.winAnim{${vars.join(';')}}\n.winAnim{--win:running}`;
fs.writeFileSync(path.join(__dirname, 'winvars.css'), wv);
console.log('symbols', ids.length, (svg.length / 1024) | 0, 'KB');
