// copies char4.css -> ../char.css and splices it into ../../slot.css between the char.css and sweep.css markers (never touches the KAI part)
const fs = require('fs'), path = require('path'); const A = path.join(__dirname, '..'), css = fs.readFileSync(path.join(__dirname, 'char4.css'), 'utf8');
fs.writeFileSync(path.join(A, 'char.css'), css);
const p = path.join(A, '../slot.css'); let s = fs.readFileSync(p, 'utf8'); const a = s.indexOf('/* ===== char.css ===== */'), b = s.indexOf('/* ===== sweep.css ===== */');
if (a < 0 || b < 0) throw new Error('markers missing'); s = s.slice(0, a) + '/* ===== char.css ===== */\n' + css + '\n' + s.slice(b); fs.writeFileSync(p, s); console.log('slot.css', (s.length / 1024) | 0, 'KB');
