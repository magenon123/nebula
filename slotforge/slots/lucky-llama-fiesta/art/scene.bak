const L = require('./lib.cjs');
const { O, grad, rgrad, clip, p, np, ln, el, ci, rc, txt, fluff, flower, rng } = L;
const { SYM } = require('./syms0.cjs');
const W = 1600, H = 900;
const brass = () => grad([[0, '#fff2a8'], [.35, '#f2c04a'], [.7, '#b87a1c'], [1, '#6a3c0c']], 0, 0, 0, 1);
const wood = (a = '#b8662e', b = '#7a3818') => grad([[0, a], [1, b]], 0, 0, 0, 1);
function lighten(h, t) { const n = parseInt(h.slice(1), 16); const f = (c) => Math.round(c + (255 - c) * t); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); }
function quad(a, c, b, t) { const u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; }
module.exports.bg = function (DUSK) {
  L.setPrefix(DUSK ? 'lD' : 'lB');
  const R = rng(7); let S = '', s2;
// ---------- SKY ----------
S += `<rect width="${W}" height="${H}" fill="${grad(DUSK ? [[0, '#05082a'], [.3, '#161a5a'], [.55, '#4a2a7a'], [.72, '#8a3a6a'], [.86, '#c8603a'], [1, '#e89a50']] : [[0, '#0c1448'], [.25, '#34378e'], [.45, '#a8488a'], [.62, '#ee7a3c'], [.78, '#ffb852'], [1, '#ffd98a']])}"/>`;
// stars faint at top
for (let i = 0; i < 26; i++) S += `<circle cx="${R() * W}" cy="${R() * 150}" r="${.8 + R() * 1.2}" fill="#fff" opacity="${.35 + R() * .4}"/>`;
S += `<circle cx="150" cy="560" r="700" fill="${rgrad([[0, 'rgba(255,240,170,.95)'], [.18, 'rgba(255,200,100,.65)'], [.5, 'rgba(255,140,70,.25)'], [1, 'rgba(255,120,60,0)']])}"/>`;
S += `<circle cx="150" cy="560" r="62" fill="#fff6c0"/>`;
if (DUSK) S += `<circle cx="1230" cy="150" r="46" fill="#f4f0d8"/><circle cx="1216" cy="140" r="42" fill="#161a5a" opacity=".0"/>`;
// clouds: lit on the left/underside
const cloud = (x, y, w, h) => `<g><ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="rgba(110,70,150,.55)"/><ellipse cx="${x - w * .1}" cy="${y + h * .35}" rx="${w * .9}" ry="${h * .5}" fill="rgba(255,150,100,.75)"/><ellipse cx="${x - w * .25}" cy="${y + h * .6}" rx="${w * .6}" ry="${h * .28}" fill="rgba(255,205,130,.8)"/></g>`;
S += cloud(420, 300, 190, 22) + cloud(1060, 270, 230, 26) + cloud(700, 380, 160, 16) + cloud(1400, 340, 150, 18) + cloud(120, 250, 140, 16);
// distant mountains
S += np('M0,470 L90,400 L170,440 L260,380 L350,430 L460,360 L560,420 L680,380 L800,430 L930,370 L1060,420 L1180,360 L1300,410 L1420,350 L1520,400 L1600,380 L1600,620 L0,620Z', 'rgba(110,60,120,.75)');
S += np('M0,520 L120,460 L220,500 L330,450 L450,500 L580,455 L700,505 L840,460 L980,510 L1100,462 L1240,505 L1380,455 L1500,500 L1600,470 L1600,640 L0,640Z', 'rgba(160,80,110,.8)');

// ---------- HOUSES ----------
const PAL = { terra: ['#d9693c', '#8f3a22'], teal: ['#2fa3a0', '#17686e'], ochre: ['#eeb54a', '#a8731e'], pink: ['#e57a96', '#a03d62'], cream: ['#f6e1b4', '#b88a58'], blue: ['#4a86c8', '#285090'] };
function house(x, y, w, h, pal, haze = 0, o = {}) {
  const [c, d] = PAL[pal]; let s = '';
  const side = Math.max(10, w * .1);
  s += np(`M${x + w},${y} l${side},4 l0,${h - 4} l${-side},0z`, d);
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${grad([[0, lighten(c, .35)], [.5, c], [1, lighten(d, .1)]], 0, 0, 1, 0)}"/>`;
  s += `<rect x="${x - 3}" y="${y - 7}" width="${w + 6}" height="9" fill="${lighten(c, .12)}" stroke="${O}" stroke-width="2.4"/><rect x="${x - 3}" y="${y + 2}" width="${w + 6 + side}" height="5" fill="rgba(0,0,0,.28)"/>`;
  s += `<path d="M${x},${y + 8} L${x},${y + h}" stroke="rgba(255,240,190,.7)" stroke-width="3"/>`;
  // wall stucco chips
  for (let i = 0; i < w / 14; i++) s += `<ellipse cx="${x + 6 + R() * (w - 12)}" cy="${y + 12 + R() * (h - 20)}" rx="${3 + R() * 6}" ry="${1.5 + R() * 2}" fill="${R() > .5 ? 'rgba(255,230,170,.22)' : 'rgba(80,30,20,.14)'}"/>`;
  // windows
  const cols = Math.max(1, Math.floor(w / 42)), rows = Math.max(1, Math.floor((h - 30) / 62));
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    if (o.door && r === rows - 1 && k === Math.floor(cols / 2)) continue;
    const wx = x + (k + .5) * (w / cols) - 9, wy = y + 18 + r * 62;
    const lit = R() > (DUSK ? .15 : .55);
    s += `<path d="M${wx},${wy + 30} L${wx},${wy + 8} Q${wx + 9},${wy - 6} ${wx + 18},${wy + 8} L${wx + 18},${wy + 30}Z" fill="${lit ? '#ffcf5a' : '#3a1a2a'}" stroke="${O}" stroke-width="2.4"/>`;
    if (lit) s += `<path d="M${wx + 2},${wy + 28} L${wx + 2},${wy + 10} Q${wx + 9},${wy} ${wx + 16},${wy + 10} L${wx + 16},${wy + 28}Z" fill="#fff0a0" opacity=".7"/>`;
    s += `<rect x="${wx - 8}" y="${wy + 6}" width="7" height="24" fill="${['#1cb8bd', '#ee3d8f', '#7a3fd0', '#f58a2e'][Math.floor(R() * 4)]}" stroke="${O}" stroke-width="1.8"/><rect x="${wx + 19}" y="${wy + 6}" width="7" height="24" fill="${['#1cb8bd', '#ee3d8f', '#7a3fd0', '#f58a2e'][Math.floor(R() * 4)]}" stroke="${O}" stroke-width="1.8"/>`;
    s += `<rect x="${wx - 5}" y="${wy + 30}" width="28" height="5" fill="${lighten(c, .3)}" stroke="${O}" stroke-width="1.8"/>`;
    if (R() > .6) s += `<ellipse cx="${wx + 9}" cy="${wy + 29}" rx="9" ry="4" fill="#2f9a48" stroke="${O}" stroke-width="1.5"/><circle cx="${wx + 4}" cy="${wy + 27}" r="3" fill="#ee3d8f"/><circle cx="${wx + 12}" cy="${wy + 26}" r="3" fill="#ffd23f"/>`;
  }
  if (o.door) { const dx = x + w / 2 - 14, dy = y + h - 48; s += `<path d="M${dx},${y + h} L${dx},${dy + 14} Q${dx + 14},${dy - 8} ${dx + 28},${dy + 14} L${dx + 28},${y + h}Z" fill="#6a3a1c" stroke="${O}" stroke-width="2.6"/><path d="M${dx + 3},${y + h} L${dx + 3},${dy + 15} Q${dx + 14},${dy - 3} ${dx + 25},${dy + 15} L${dx + 25},${y + h}Z" fill="#8a5028"/><circle cx="${dx + 22}" cy="${dy + 28}" r="2" fill="#f2c04a"/>`; }
  s += `<rect x="${x}" y="${y + h - 6}" width="${w}" height="6" fill="rgba(60,20,10,.35)"/>`;
  s += `<rect x="${x - 3}" y="${y - 7}" width="${w + 6 + side}" height="${h + 7}" fill="rgba(255,150,120,${haze})"/>`;
  return s;
}
// back rows (hazy)
const HZ = .32;
S += house(-10, 400, 110, 220, 'terra', HZ) + house(84, 350, 90, 270, 'teal', HZ) + house(164, 420, 100, 200, 'ochre', HZ) + house(250, 372, 96, 250, 'pink', HZ);
S += house(1140, 360, 120, 260, 'ochre', HZ) + house(1250, 300, 100, 320, 'pink', HZ) + house(1340, 390, 120, 230, 'teal', HZ) + house(1450, 330, 160, 290, 'terra', HZ);
// church tower (left)
{
  const x = 262, y = 180;
  let s = '';
  s += np(`M${x + 78},${y + 20} l12,6 l0,${300} l-12,0z`, '#8a6a4a');
  s += `<rect x="${x}" y="${y + 20}" width="78" height="300" fill="${grad([[0, '#fff0cf'], [1, '#e1b983']], 0, 0, 1, 0)}" stroke="${O}" stroke-width="3"/>`;
  s += `<path d="M${x + 14},${y + 90} L${x + 14},${y + 56} Q${x + 39},${y + 24} ${x + 64},${y + 56} L${x + 64},${y + 90}Z" fill="#3a1a2a" stroke="${O}" stroke-width="3"/><circle cx="${x + 39}" cy="${y + 74}" r="9" fill="#f2c04a" stroke="${O}" stroke-width="2.4"/><path d="M${x + 39},${y + 66} v18" stroke="${O}" stroke-width="2"/>`;
  s += p(`M${x - 6},${y + 22} Q${x + 39},${y - 54} ${x + 84},${y + 22}Z`, grad([[0, '#2fb8b0'], [1, '#126a76']], 0, 0, 1, 0), 3.4);
  s += `<path d="M${x + 39},${y - 26} v-26 M${x + 28},${y - 42} h22" stroke="${O}" stroke-width="9"/><path d="M${x + 39},${y - 26} v-26 M${x + 28},${y - 42} h22" stroke="#f6c22a" stroke-width="5"/>`;
  s += `<circle cx="${x + 39}" cy="${y + 160}" r="16" fill="#fff6d8" stroke="${O}" stroke-width="3"/><path d="M${x + 39},${y + 160} v-10 M${x + 39},${y + 160} l8,4" stroke="${O}" stroke-width="2.4"/>`;
  s += `<rect x="${x}" y="${y + 20}" width="${78 + 12}" height="300" fill="rgba(255,150,120,.2)"/>`;
  S += s;
}
// front rows
S += house(-30, 470, 140, 160, 'ochre', .1, { door: true }) + house(104, 440, 112, 200, 'terra', .1, { door: true }) + house(206, 500, 126, 140, 'teal', .1);
S += house(1120, 480, 90, 170, 'cream', .1, { door: true });

// ---------- GROUND (plaza) ----------
S += `<rect x="0" y="640" width="${W}" height="260" fill="${grad([[0, '#e4a05a'], [.4, '#c47a46'], [1, '#8a4a2c']])}"/>`;
for (let r = 0; r < 4; r++) {
  const y = 646 + r * 26, hh = 12 + r * 4, sw = 38 + r * 16;
  for (let x = -((r * 17) % sw); x < W; x += sw) {
    if (x > 400 && x < 1180) continue;
    s2 = `<rect x="${x + 2}" y="${y}" width="${sw - 4}" height="${hh}" rx="${hh / 3}" fill="${grad([[0, lighten('#d89a60', .1 + R() * .1)], [1, '#a8643a']], 0, 0, 0, 1)}" stroke="rgba(60,20,10,.55)" stroke-width="1.6"/><path d="M${x + 6},${y + 3} h${sw / 2}" stroke="rgba(255,240,190,.55)" stroke-width="2"/>`;
    S += s2;
  }
}
S += `<rect x="0" y="640" width="${W}" height="14" fill="${grad([[0, 'rgba(255,200,120,.0)'], [1, 'rgba(60,20,10,.25)']])}"/>`;

// ---------- MARIACHI STAGE (left) ----------
{
  let s = '';
  // contact shadow right + under
  s += `<ellipse cx="200" cy="716" rx="190" ry="14" fill="rgba(40,10,10,.45)"/>`;
  s += `<rect x="52" y="498" width="262" height="160" fill="${grad([[0, '#3fb8b2'], [1, '#14707c']], 0, 0, 1, 0)}" stroke="${O}" stroke-width="4"/>`;
  // arches with warm glow
  for (let i = 0; i < 3; i++) { const x = 70 + i * 82; s += `<path d="M${x},650 L${x},560 Q${x + 31},516 ${x + 62},560 L${x + 62},650Z" fill="${rgrad([[0, '#ffd27a'], [1, '#b8501e']], .5, .7, .8)}" stroke="${O}" stroke-width="3"/>`; }
  // painted band on wall
  for (let i = 0; i < 12; i++) s += `<path d="M${58 + i * 22},510 l10,-0 l-5,10z" fill="${i % 2 ? '#ffd23f' : '#ee3d8f'}" stroke="${O}" stroke-width="1.4"/>`;
  // instruments on the stage
  s += `<g transform="translate(86 566) scale(.62)">${SYM.guitar()}</g>`;
  s += `<g transform="translate(224 580) scale(.52)">${SYM.drum()}</g>`;
  s += `<g transform="translate(150 592) scale(.5)">${SYM.sombrero()}</g>`;
  // floor
  s += `<rect x="30" y="650" width="304" height="14" fill="${wood('#d98a4a', '#9a5226')}" stroke="${O}" stroke-width="3.4"/>`;
  s += `<rect x="24" y="664" width="316" height="44" fill="${wood('#a85a2a', '#6a3014')}" stroke="${O}" stroke-width="4"/>`;
  for (let i = 1; i < 6; i++) s += `<path d="M${24 + i * 52},664 v44" stroke="rgba(30,10,5,.7)" stroke-width="2.4"/>`;
  s += `<path d="M26,672 h312 M26,690 h312" stroke="rgba(255,200,130,.25)" stroke-width="2"/>`;
  for (let i = 0; i < 7; i++) s += `<circle cx="${40 + i * 48}" cy="686" r="3.4" fill="#f2c04a" stroke="${O}" stroke-width="1.2"/>`;
  // posts
  for (const x of [34, 316]) s += `<rect x="${x}" y="470" width="14" height="190" fill="${grad([[0, '#d98a4a'], [1, '#6a3014']], 0, 0, 1, 0)}" stroke="${O}" stroke-width="3.4"/>`;
  // awning with scallops
  s += p('M22,462 L344,462 L344,520 Q330,540 316,520 Q302,540 288,520 Q274,540 260,520 Q246,540 232,520 Q218,540 204,520 Q190,540 176,520 Q162,540 148,520 Q134,540 120,520 Q106,540 92,520 Q78,540 64,520 Q50,540 36,520 L22,520Z', '#fff0cf', 4);
  const ac = clip('<path d="M22,462 L344,462 L344,520 Q330,540 316,520 Q302,540 288,520 Q274,540 260,520 Q246,540 232,520 Q218,540 204,520 Q190,540 176,520 Q162,540 148,520 Q134,540 120,520 Q106,540 92,520 Q78,540 64,520 Q50,540 36,520 L22,520Z"/>');
  s += `<g clip-path="${ac}">`;
  for (let i = 0; i < 12; i++) s += `<rect x="${22 + i * 28 + 14}" y="460" width="14" height="90" fill="${['#e03a2c', '#d92b78'][i % 2]}"/>`;
  s += `<rect x="22" y="462" width="322" height="80" fill="${grad([[0, 'rgba(255,230,160,.4)'], [.5, 'rgba(0,0,0,0)'], [1, 'rgba(60,10,40,.4)']], 0, 0, 1, 0)}"/></g>`;
  s += ln('M22,466 L344,466', O, 3);
  // lantern string under awning
  s += ln('M40,540 Q183,586 326,540', O, 2.4);
  for (let i = 0; i < 7; i++) {
    const t = (i + .5) / 7; const x = 40 + t * 286; const y = 540 + Math.sin(t * Math.PI) * 38 - 1;
    const c = ['#ff5a3a', '#ffd23f', '#1cb8bd', '#ee3d8f'][i % 4];
    s += `<circle cx="${x}" cy="${y + 12}" r="24" fill="${rgrad([[0, 'rgba(255,220,120,.7)'], [1, 'rgba(255,200,100,0)']])}"/>`;
    s += p(`M${x - 8},${y + 4} q-4,12 0,24 h16 q4,-12 0,-24z`, c, 2.4) + `<path d="M${x - 5},${y + 8} q-2,8 0,14" stroke="#fff" stroke-width="2.4" opacity=".7" fill="none" stroke-linecap="round"/>` + `<rect x="${x - 5}" y="${y}" width="10" height="5" fill="#6a3a1c" stroke="${O}" stroke-width="1.4"/>`;
  }
  S += s;
}


  if (DUSK) S += `<rect width="1600" height="900" fill="rgba(30,20,90,.28)"/>`;
  // lamp post with lanterns (right), lit
  { let s = `<ellipse cx="1330" cy="672" rx="40" ry="8" fill="rgba(40,10,10,.4)"/><rect x="1324" y="330" width="12" height="340" fill="${wood('#8a4420','#4a2008')}" stroke="${O}" stroke-width="3"/><path d="M1330,340 q-60,-30 -110,0 M1330,340 q60,-30 110,0" fill="none" stroke="${O}" stroke-width="7"/>`;
    for (const x of [1220, 1330, 1440]) { s += `<circle cx="${x}" cy="${x === 1330 ? 362 : 352}" r="${DUSK ? 46 : 30}" fill="${rgrad([[0, 'rgba(255,225,130,.8)'], [1, 'rgba(255,200,100,0)']])}"/>` + p(`M${x - 9},${x === 1330 ? 348 : 338} q-5,14 0,28 h18 q5,-14 0,-28z`, ['#ff5a3a', '#ffd23f', '#1cb8bd'][Math.round((x - 1220) / 110)], 2.4); }
    S += s; }
  return { svg: S, defs: L.defs.slice() };
};
module.exports.strands = function () {
  L.setPrefix('lP');
  let S = '';
// ---------- PAPEL PICADO STRINGS ----------
function quad(a, c, b, t) { const u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; }
function strand(a, c, b, n, off = 0) {
  let s = `<path d="M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}" fill="none" stroke="${O}" stroke-width="2.6"/>`;
  const pc = ['#ee3d8f', '#1cb8bd', '#ffd23f', '#f58a2e', '#7a3fd0', '#39c46a'];
  for (let i = 0; i < n; i++) {
    const t = (i + .5) / n, [x, y] = quad(a, c, b, t), [x2, y2] = quad(a, c, b, t + .01);
    const ang = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI;
    const col = pc[(i + off) % 6], w = 30, h = 40;
    s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})"><path fill-rule="evenodd" d="M${-w / 2},0 L${w / 2},0 L${w / 2},${h - 6} q-5,8 -10,0 q-5,8 -10,0 q-5,8 -10,0 L${-w / 2},${h - 6}Z M0,10 l6,7 l-6,7 l-6,-7z M-9,${h - 14} l3,3 l-3,3 l-3,-3z M9,${h - 14} l3,3 l-3,3 l-3,-3z M-9,6 l3,3 l-3,3 l-3,-3z M9,6 l3,3 l-3,3 l-3,-3z" fill="${col}" stroke="${O}" stroke-width="1.8" stroke-linejoin="round"/><path d="M${-w / 2 + 3},2 v${h - 12}" stroke="rgba(255,255,255,.5)" stroke-width="2"/></g>`;
  }
  return s;
}
S += strand([-10, 26], [800, 120], [1610, 40], 34, 0);
S += strand([-10, 300], [150, 360], [330, 330], 8, 2);
S += strand([1610, 118], [1440, 214], [1180, 178], 10, 4);


  return { svg: S, defs: L.defs.slice() };
};
