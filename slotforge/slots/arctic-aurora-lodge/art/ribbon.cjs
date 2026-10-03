// Aurora flare ribbon (wide glowing band, 2000x560, transparent) -> bake/ribbon.svg ; baked by bake.cjs to bake/ribbon.webp
const fs = require('fs'), path = require('path'); const { rng } = require('./lib.cjs'); const R = rng(8080); const f = n => +(+n).toFixed(1);
const W = 2000, H = 560;
function band(ph, yc0, amp, thick, palette, op, seed) {
  const Rc = rng(seed); let o = '', core = '', fib = '';
  const yc = x => yc0 + Math.sin(x / 250 + ph) * amp + Math.sin(x / 83 + ph * 2) * amp * .22;
  for (let x = -10; x < W + 10; x += 2.4) {
    const T = thick * (.55 + .45 * Math.abs(Math.sin(x / 390 + ph))) * (.85 + Rc() * .3), y = yc(x), edge = Math.min(1, Math.min(x + 40, W - x + 40) / 260);
    o += `<rect x="${f(x)}" y="${f(y - T * .75)}" width="2.8" height="${f(T)}" fill="url(#${palette})" opacity="${(op * edge * (.5 + .5 * Rc())).toFixed(2)}"/>`;
  }
  let d = '', d2 = ''; for (let x = -10; x < W + 10; x += 12) { d += `${x < 0 ? 'M' : 'L'}${f(x)} ${f(yc(x) + 1)}`; d2 += `${x < 0 ? 'M' : 'L'}${f(x)} ${f(yc(x) - 12 - 8 * Math.sin(x / 110 + ph))}`; }
  core = `<path d="${d}" fill="none" stroke="#fff" stroke-width="3" opacity=".9" filter="url(#cb)"/><path d="${d}" fill="none" stroke="#fff" stroke-width="1.2" opacity=".95"/>`;
  fib = `<path d="${d2}" fill="none" stroke="#fff" stroke-width=".8" opacity=".5"/>`;
  return o + core + fib;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W / 2}" height="${H / 2}" viewBox="0 0 ${W} ${H}"><defs>
 <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4cff" stop-opacity="0"/><stop offset=".3" stop-color="#38ffb0" stop-opacity=".55"/><stop offset=".72" stop-color="#b8fff0" stop-opacity=".95"/><stop offset=".9" stop-color="#ffffff" stop-opacity="1"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
 <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4fa0" stop-opacity="0"/><stop offset=".35" stop-color="#9a5cff" stop-opacity=".65"/><stop offset=".75" stop-color="#8ae8ff" stop-opacity=".95"/><stop offset=".9" stop-color="#ffffff" stop-opacity="1"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
 <filter id="cb" x="-5%" y="-100%" width="110%" height="300%"><feGaussianBlur stdDeviation="5"/></filter><filter id="gl" x="-5%" y="-50%" width="110%" height="200%"><feGaussianBlur stdDeviation="24"/></filter></defs>
 <g filter="url(#gl)" opacity=".75">${band(.4, 300, 70, 240, 'g1', .5, 11)}</g>
 <g>${band(2.3, 250, 62, 200, 'g2', .8, 12)}</g>
 <g>${band(.4, 300, 70, 220, 'g1', 1, 13)}</g>
</svg>`;
fs.writeFileSync(path.join(__dirname, 'bake/ribbon.svg'), svg); console.log('ribbon svg ok');
