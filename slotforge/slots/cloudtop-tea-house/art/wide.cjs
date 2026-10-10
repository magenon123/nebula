/* wide.cjs (leo, R2.1): side bleed for ultrawide / 16:10 / 4:3 / 5:4 windows. Idempotent marker block inserted right after the two sky rects of scene.html
   (and raw/scene.html): wide sky strips + MIRRORED static copies of the far ridge, cloud band and ledge/ground (scaleX -1 around x=0 and x=1600, so the art
   continues seamlessly), plus a few static clouds. Class names and ids are stripped from the copies (no extra animation, no duplicate ids). Also widens
   #sDusk and the .bleed rects. Run order: wobble -> light -> bleed -> wide. */
const fs = require('fs'), path = require('path');
const X0 = -2400, X1 = 4000;
const strip = t => t.replace(/<defs>[\s\S]*?<\/defs>/g, '').replace(/ id="[^"]*"/g, '').replace(/ class="[^"]*"/g, '').replace(/<!--[\s\S]*?-->/g, '');
const cloud = (x, y, s, fl) => `<g transform="translate(${x} ${y}) scale(${s} ${s})"><path fill="${fl}" stroke="#1c2340" stroke-width="${(3 / s).toFixed(1)}" stroke-linejoin="round" d="M0 40 Q-14 38 -12 24 Q-10 10 8 10 Q14 -12 40 -8 Q58 -34 86 -14 Q112 -26 124 -2 Q148 0 148 22 Q150 40 130 40 Z"/><path fill="#f7cdb6" opacity=".85" d="M6 40 Q40 31 76 35 Q110 29 130 40 Z"/></g>`;
for (const f of ['scene.html', 'raw/scene.html']) {
  const p = path.join(__dirname, f.startsWith('raw') ? f : '../' + f); let s = fs.readFileSync(p, 'utf8');
  for (const n of ['', 0, 1, 2]) s = s.replace(new RegExp(`<!--WIDE${n}:begin-->[\\s\\S]*?<!--WIDE${n}:end-->`), '');
  const a0 = s.indexOf('<!--LIGHT:far:begin-->'), a = a0 >= 0 ? a0 : s.indexOf('<g id="sFar"'), b = s.indexOf('<g id="sKites"'), c = s.indexOf('<g id="sLedge"'), d = s.indexOf('<g id="sShop"');
  const at = s.indexOf('<g id="sSun"');
  if (a < 0 || b < a || c < b || d < c || at < 0) { console.log('skip', f); continue; }
  const far = strip(s.slice(a, b)), gr = strip(s.slice(c, d));
  let clouds = '';
  [[-380, 90, 1.3], [-900, 200, 1.5], [-1500, 60, 1.2], [-2000, 250, 1.4], [1760, 130, 1.2], [2300, 40, 1.5], [2800, 220, 1.3], [3400, 90, 1.4], [-640, 330, 1.1], [2060, 360, 1.2]].forEach(q => clouds += cloud(q[0], q[1], q[2], '#fffaf0'));
  const side = t => `<g clip-path="url(#ctWideL)"><g transform="scale(-1 1)">${t}</g></g><g clip-path="url(#ctWideR)"><g transform="translate(3200 0) scale(-1 1)">${t}</g></g>`;
  const clip = `<defs><clipPath id="ctWideL"><rect x="${X0}" y="-1300" width="${-X0}" height="2200"/></clipPath><clipPath id="ctWideR"><rect x="1600" y="-1300" width="${X1 - 1600}" height="2200"/></clipPath></defs>`;
  const blk = (n, t) => `<!--WIDE${n}:begin--><g class="wide" pointer-events="none">${t}</g><!--WIDE${n}:end-->`;
  const b0 = blk(0, `${clip}<rect x="${X0}" y="-1300" width="${-X0}" height="2200" fill="url(#ctSky)"/><rect x="1600" y="-1300" width="${X1 - 1600}" height="2200" fill="url(#ctSky)"/><rect x="-1000" y="0" width="1000" height="900" fill="url(#ctGlow)"/>${clouds}`);
  const b1 = blk(1, side(far)), b2 = blk(2, side(gr));
  const k = s.indexOf('<g id="sKites"'), l = s.indexOf('<g id="sShop"');
  s = s.slice(0, at) + b0 + s.slice(at, k) + b1 + s.slice(k, l) + b2 + s.slice(l);
  s = s.replace(/<rect id="sDusk" width="1600" height="900"/, `<rect id="sDusk" x="${X0}" y="0" width="${X1 - X0}" height="900"`);
  fs.writeFileSync(p, s); console.log('wide ->', f);
}
