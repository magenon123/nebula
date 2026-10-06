const L = require('./lib.cjs');
const { O, grad, rgrad, clip, p, np, ln, el, ci, rc, txt, fluff, flower, rng } = L;
const brass = () => grad([[0, '#fff2a8'], [.35, '#f2c04a'], [.7, '#b87a1c'], [1, '#6a3c0c']], 0, 0, 0, 1);
const wood = (a = '#b8662e', b = '#7a3818') => grad([[0, a], [1, b]], 0, 0, 0, 1);
function quad(a, c, b, t) { const u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; }
module.exports = function () {
  L.setPrefix('lF');
  const R = rng(3);
  const FX = 0, FY = 0, FW = 870, FH = 528, WX = 60, WY = 38, WW = 750, WH = 450;
  let S = '';
S += rc(FX, FY, FW, FH, 28, wood('#c4723a', '#6e3216'), 5);
// grain
for (let i = 0; i < 18; i++) S += `<path d="M${FX + 8},${FY + 8 + R() * (FH - 16)} h${FW - 16}" stroke="rgba(40,14,6,.22)" stroke-width="${1 + R() * 1.4}"/>`;
// paint ring
const ringO = `M${FX + 30},${FY + 9} h${FW - 60} a21,21 0 0 1 21,21 v${FH - 60} a21,21 0 0 1 -21,21 h${-(FW - 60)} a21,21 0 0 1 -21,-21 v${-(FH - 60)} a21,21 0 0 1 21,-21z`;
const ringI = `M${FX + 38},${FY + 21} h${FW - 76} a14,14 0 0 1 14,14 v${FH - 76} a14,14 0 0 1 -14,14 h${-(FW - 76)} a14,14 0 0 1 -14,-14 v${-(FH - 76)} a14,14 0 0 1 14,-14z`;
S += `<path fill-rule="evenodd" d="${ringO} ${ringI}" fill="${grad([[0, '#2fd0c8'], [1, '#0f8a96']], 0, 0, 0, 1)}" stroke="${O}" stroke-width="3"/>`;
// folk diamonds in ring
for (let x = FX + 40; x < FX + FW - 30; x += 28) for (const y of [FY + 15, FY + FH - 15]) S += `<path d="M${x},${y - 5} l6,5 l-6,5 l-6,-5z" fill="${(Math.round(x / 28)) % 2 ? '#ffd23f' : '#ee3d8f'}" stroke="${O}" stroke-width="1.2"/>`;
for (let y = FY + 44; y < FY + FH - 40; y += 28) for (const x of [FX + 15, FX + FW - 15]) S += `<path d="M${x},${y - 5} l6,5 l-6,5 l-6,-5z" fill="${(Math.round(y / 28)) % 2 ? '#ffd23f' : '#ee3d8f'}" stroke="${O}" stroke-width="1.2"/>`;
// inner bevel (wood lip around window)
S += `<path fill-rule="evenodd" d="${ringI} M${WX - 4},${WY - 4} h${WW + 8} v${WH + 8} h${-(WW + 8)}z" fill="${wood('#a85a2a', '#5a2810')}"/>`;
S += `<path d="M${WX - 6},${WY - 6} h${WW + 12}" stroke="rgba(255,210,150,.55)" stroke-width="3"/>`;
S += rc(WX - 4, WY - 4, WW + 8, WH + 8, 4, 'none', 3.4);
// brass studs
for (let x = FX + 70; x < FX + FW - 60; x += 56) for (const y of [FY + 15, FY + FH - 15]) S += `<circle cx="${x}" cy="${y + 0.5}" r="5.2" fill="${brass()}" stroke="${O}" stroke-width="1.6"/><circle cx="${x - 1.6}" cy="${y - 1.6}" r="1.6" fill="#fff" opacity=".9"/>`;
for (let y = FY + 60; y < FY + FH - 50; y += 56) for (const x of [FX + 15, FX + FW - 15]) S += `<circle cx="${x}" cy="${y}" r="5.2" fill="${brass()}" stroke="${O}" stroke-width="1.6"/><circle cx="${x - 1.6}" cy="${y - 1.6}" r="1.6" fill="#fff" opacity=".9"/>`;
// corner plates
for (const [cx, cy] of [[FX + 18, FY + 18], [FX + FW - 18, FY + 18], [FX + 18, FY + FH - 18], [FX + FW - 18, FY + FH - 18]]) S += `<rect x="${cx - 19}" y="${cy - 19}" width="38" height="38" rx="9" fill="${brass()}" stroke="${O}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="9" fill="#8a4c10" stroke="${O}" stroke-width="2"/><circle cx="${cx - 2.5}" cy="${cy - 2.5}" r="3" fill="#fff0a8"/>`;

  // window: dark reel well + wooden column strips (cells are 150 px)
  S += `<rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" fill="${grad([[0, '#4a2014'], [1, '#2a100a']])}"/>`;
  for (let k = 1; k < 5; k++) S += `<rect x="${WX + k * 150 - 4}" y="${WY}" width="8" height="${WH}" fill="${grad([[0, '#8a4420'], [.5, '#c4723a'], [1, '#6a3014']], 0, 0, 1, 0)}" stroke="${O}" stroke-width="1.6"/>`;
  for (let k = 1; k < 3; k++) S += `<rect x="${WX}" y="${WY + k * 150 - 3}" width="${WW}" height="6" fill="${grad([[0, '#6a3014'], [1, '#3a1a0c']], 0, 0, 0, 1)}"/>`;
  S += `<rect x="${WX}" y="${WY}" width="${WW}" height="24" fill="${grad([[0, 'rgba(20,6,2,.55)'], [1, 'rgba(20,6,2,0)']])}"/>`;
function garland(a, c, b, n, r0 = 10) {
  let s = ln(`M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`, '#2a5a2a', 5);
  for (let i = 0; i <= n; i++) {
    const t = i / n, [x, y] = quad(a, c, b, t);
    s += p(`M0,0 C6,-9 16,-9 22,0 C16,8 6,8 0,0Z`, '#2f9a48', 1.8, `transform="translate(${(x + (i % 2 ? 4 : -22)).toFixed(1)} ${(y + 4).toFixed(1)}) rotate(${i % 2 ? 70 : 110})"`);
  }
  for (let i = 0; i <= n; i++) {
    const t = i / n, [x, y] = quad(a, c, b, t);
    const orange = i % 3 !== 1;
    s += flower(x, y, r0 + (i % 2) * 2, 9, orange ? '#f58a1f' : '#ffd23f', '#b8430c', i * 17, 1.7, orange ? '#ffb347' : '#ffe98a');
  }
  return s;
}

  S += garland([FX - 8 + 8, FY + 130], [FX - 6, FY + 40], [FX + 150, FY + 14], 11, 12);
  S += garland([FX + FW - 8, FY + 130], [FX + FW + 6, FY + 40], [FX + FW - 150, FY + 14], 11, 12);
  S += garland([FX + 8, FY + 130], [FX + 22, FY + 200], [FX + 8, FY + 262], 5, 11);
  S += garland([FX + FW - 8, FY + 130], [FX + FW - 22, FY + 200], [FX + FW - 8, FY + 262], 5, 11);
  S += flower(FX + 22, FY + 26, 22, 12, '#f58a1f', '#b8430c', 0, 2, '#ffb347') + flower(FX + FW - 22, FY + 26, 22, 12, '#f58a1f', '#b8430c', 20, 2, '#ffb347');
  return { svg: S, defs: L.defs.slice() };
};
