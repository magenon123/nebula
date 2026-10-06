const fs = require('fs');
const L = require('./lib.cjs');
const { O, defs, grad, rgrad, clip, p, np, ln, el, ci, rc, txt, fluff, flower, rng } = L;
const { SYM } = require('./syms.cjs');
const { lucho } = require('./lucho.cjs');
const R = rng(7);
const W = 1600, H = 900;
let S = '';
const brass = () => grad([[0, '#fff2a8'], [.35, '#f2c04a'], [.7, '#b87a1c'], [1, '#6a3c0c']], 0, 0, 0, 1);
const wood = (a = '#b8662e', b = '#7a3818') => grad([[0, a], [1, b]], 0, 0, 0, 1);
function lighten(h, t) { const n = parseInt(h.slice(1), 16); const f = (c) => Math.round(c + (255 - c) * t); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); }

// ---------- SKY ----------
S += `<rect width="${W}" height="${H}" fill="${grad([[0, '#0c1448'], [.25, '#34378e'], [.45, '#a8488a'], [.62, '#ee7a3c'], [.78, '#ffb852'], [1, '#ffd98a']])}"/>`;
// stars faint at top
for (let i = 0; i < 26; i++) S += `<circle cx="${R() * W}" cy="${R() * 150}" r="${.8 + R() * 1.2}" fill="#fff" opacity="${.35 + R() * .4}"/>`;
S += `<circle cx="150" cy="560" r="700" fill="${rgrad([[0, 'rgba(255,240,170,.95)'], [.18, 'rgba(255,200,100,.65)'], [.5, 'rgba(255,140,70,.25)'], [1, 'rgba(255,120,60,0)']])}"/>`;
S += `<circle cx="150" cy="560" r="62" fill="#fff6c0"/>`;
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
    const lit = R() > .55;
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
var s2;
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
S += strand([-10, 118], [170, 206], [346, 196], 8, 2);
S += strand([1610, 118], [1440, 214], [1180, 178], 10, 4);

// ---------- BIG LUCHO (cameo right) ----------
S += `<circle cx="1390" cy="330" r="330" fill="${rgrad([[0, 'rgba(255,225,140,.55)'], [1, 'rgba(255,190,100,0)']])}"/>`;
S += `<ellipse cx="1400" cy="722" rx="260" ry="20" fill="rgba(40,10,10,.4)"/>`;
S += `<g transform="translate(1110 98) scale(1.4)">${lucho()}</g>`;

// ---------- FRAME + BOARD ----------
const FX = 436, FY = 204, FW = 728, FH = 452, WX = 480, WY = 236, WW = 640, WH = 384;
S += `<ellipse cx="800" cy="664" rx="400" ry="22" fill="rgba(40,10,10,.5)"/>`;
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
// window
S += `<rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" fill="${grad([[0, '#4a2014'], [1, '#2a100a']])}"/>`;
const TIER = { low: '#14a8a0', mid: '#d6347f', high: '#f6b72a', wild: '#e83aa0', scat: '#e03a2c', pin: '#52c43a' };
function tile(c, r, rim, sym, o = {}) {
  const x = WX + c * 128 + 4, y = WY + r * 128 + 4;
  let s = `<g transform="translate(${x} ${y})">`;
  const base = o.fill || grad([[0, '#fffaec'], [.6, '#f9e6bd'], [1, '#e8c98a']], 0, 0, .3, 1);
  s += rc(0, 0, 120, 120, 15, base, 0);
  s += rc(0, 0, 120, 120, 15, 'none', 5.5, `style="stroke:${O}"`);
  s += rc(3, 3, 114, 114, 12, 'none', 5, `style="stroke:${rim}"`);
  s += rc(7, 7, 106, 106, 9, 'none', 1.6, `style="stroke:rgba(60,20,10,.45)"`);
  s += `<path d="M10,22 Q10,10 22,10 L60,10" stroke="rgba(255,255,255,.8)" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M10,112 h100" stroke="rgba(120,60,20,.28)" stroke-width="5"/>`;
  s += o.big ? sym : `<g transform="translate(-4 -4)">${sym}</g>`;
  return s + `</g>`;
}
const wl = (c, r) => ({ win: true });
const board = [
  [['low', 'skull'], ['mid', 'skull'], ['wild', 'wild'], ['mid', 'trumpet'], ['low', 'chili']],
  [['low', 'taco'], ['pin', 'pin5'], ['high', 'LUCHO'], ['low', 'maracas'], ['mid', 'mask']],
  [['low', 'guitar'], ['mid', 'sombrero'], ['scat', 'drum'], ['pin', 'pinMinor'], ['low', 'marigold']]
];
// reel separators
for (let k = 1; k < 5; k++) S += `<rect x="${WX + k * 128 - 4}" y="${WY}" width="8" height="${WH}" fill="${grad([[0, '#8a4420'], [.5, '#c4723a'], [1, '#6a3014']], 0, 0, 1, 0)}" stroke="${O}" stroke-width="1.6"/>`;
for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
  const [tier, name] = board[r][c];
  const rim = TIER[tier];
  if (name === 'LUCHO') {
    const fill = grad([[0, '#fff8d0'], [.5, '#ffe28a'], [1, '#f2b73a']], 0, 0, 0, 1);
    const sym = `<g transform="translate(60 5) scale(.285) translate(-200 -6)">${lucho()}</g>`;
    S += tile(c, r, rim, sym, { fill, big: true });
  } else if (name === 'wild') {
    S += tile(c, r, rim, SYM.wild(), { fill: grad([[0, '#fff0f8'], [1, '#f6b0d8']], 0, 0, 0, 1) });
  } else if (name === 'pin5' || name === 'pinMinor') {
    S += tile(c, r, rim, `<g transform="translate(4 6) scale(.94)">${SYM[name]()}</g>`, { fill: grad([[0, '#f6fff0'], [1, '#bfe8a0']], 0, 0, 0, 1) });
  } else if (name === 'drum') {
    S += tile(c, r, rim, SYM.drum(), { fill: grad([[0, '#fff3ee'], [1, '#f4b8a8']], 0, 0, 0, 1) });
  } else S += tile(c, r, rim, SYM[name]());
}
// window inner shadow top
S += `<rect x="${WX}" y="${WY}" width="${WW}" height="22" fill="${grad([[0, 'rgba(20,6,2,.55)'], [1, 'rgba(20,6,2,0)']])}"/>`;
// win line (row 1, three cells)
const wy = WY + 64;
S += ln(`M${WX + 64},${wy} L${WX + 64 + 256},${wy}`, 'rgba(255,230,120,.45)', 20) + ln(`M${WX + 64},${wy} L${WX + 320},${wy}`, O, 11) + ln(`M${WX + 64},${wy} L${WX + 320},${wy}`, '#ffd23f', 6.5) + ln(`M${WX + 64},${wy - 1.5} L${WX + 320},${wy - 1.5}`, '#fff8c0', 2, 'opacity=".9"');
for (const c of [0, 1, 2]) { const x = WX + c * 128 + 64; S += `<circle cx="${x}" cy="${wy}" r="7" fill="#fff0a0" stroke="${O}" stroke-width="2.4"/>`; S += rc(WX + c * 128 + 4, WY + 4, 120, 120, 15, 'none', 4, `style="stroke:#fff2a0"`); }
// sparkle burst around win
S += [[500, 262, 8], [756, 258, 7], [860, 300, 6]].map(([x, y, r]) => `<path d="M${x},${y - r} l${r * .3},${r * .7} l${r * .7},${r * .3} l${-r * .7},${r * .3} l${-r * .3},${r * .7} l${-r * .3},${-r * .7} l${-r * .7},${-r * .3} l${r * .7},${-r * .3}z" fill="#fff6b0" stroke="${O}" stroke-width="1.4"/>`).join('');

// marigold garlands at the frame top corners
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
S += garland([FX - 8, FY + 120], [FX - 24, FY + 40], [FX + 150, FY + 12], 12, 11);
S += garland([FX + FW + 8, FY + 120], [FX + FW + 24, FY + 40], [FX + FW - 150, FY + 12], 12, 11);
S += garland([FX - 8, FY + 120], [FX + 10, FY + 190], [FX - 6, FY + 250], 6, 10);
S += garland([FX + FW + 8, FY + 120], [FX + FW - 10, FY + 190], [FX + FW + 6, FY + 250], 6, 10);
S += flower(FX + 20, FY + 24, 20, 12, '#f58a1f', '#b8430c', 0, 2, '#ffb347') + flower(FX + FW - 20, FY + 24, 20, 12, '#f58a1f', '#b8430c', 20, 2, '#ffb347');

// ---------- PONCHO LADDER (left) ----------
{
  const lx = 344, ly = 232, lw = 78, lh = 392;
  let s = '';
  s += `<ellipse cx="${lx + lw / 2}" cy="${ly + lh + 8}" rx="48" ry="9" fill="rgba(40,10,10,.5)"/>`;
  s += rc(lx, ly, lw, lh, 12, wood('#c4723a', '#6e3216'), 4.5);
  s += `<rect x="${lx + 7}" y="${ly + 8}" width="${lw - 14}" height="${lh - 16}" rx="7" fill="#2a100a" stroke="${O}" stroke-width="2.4"/>`;
  const cols = ['#f4b82a', '#d92b78', '#0f9ba0', '#f58a2e', '#fff0cf', '#d92b78', '#0f9ba0', '#f4b82a', '#f58a2e', '#d92b78'];
  const sh = (lh - 22) / 10;
  for (let i = 0; i < 10; i++) {
    const y = ly + lh - 11 - (i + 1) * sh, lit = i < 3, cur = i === 2;
    const col = cols[i];
    s += `<g><rect x="${lx + 11}" y="${y + 1.5}" width="${lw - 22}" height="${sh - 3}" rx="5" fill="${col}" stroke="${O}" stroke-width="2.4"/>`;
    s += `<path d="M${lx + 14},${y + 3.5} h${lw - 28}" stroke="rgba(255,255,255,.55)" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<path d="${Array.from({ length: 6 }, (_, k) => `M${lx + 13 + k * 10.5},${y + sh - 3.5} l5,-5 l5,5`).join(' ')}" stroke="rgba(42,18,9,.45)" stroke-width="1.8" fill="none"/>`;
    if (!lit) s += `<rect x="${lx + 11}" y="${y + 1.5}" width="${lw - 22}" height="${sh - 3}" rx="5" fill="rgba(30,10,24,.58)"/>`;
    s += txt('x' + (i + 1), lx + lw / 2, y + sh / 2 + 8, 21, lit ? '#fff' : '#d9c9c0', { stroke: O, sw: 4.4 }) + `</g>`;
    if (cur) s += `<rect x="${lx + 7}" y="${y - .5}" width="${lw - 14}" height="${sh + 2}" rx="7" fill="none" stroke="#fff2a0" stroke-width="4"/><rect x="${lx + 7}" y="${y - .5}" width="${lw - 14}" height="${sh + 2}" rx="7" fill="none" stroke="${O}" stroke-width="1.4"/>`;
  }
  // header plank
  s += rc(lx - 6, ly - 34, lw + 12, 32, 9, wood('#d98a4a', '#8a4420'), 3.6);
  s += txt('PONCHO', lx + lw / 2, ly - 11, 18, '#fff0cf', { font: 'Lil', stroke: O, sw: 4 });
  for (const x of [lx - 1, lx + lw + 1]) s += `<circle cx="${x}" cy="${ly - 18}" r="3.4" fill="${brass()}" stroke="${O}" stroke-width="1.4"/>`;
  // arrow pointing into the board at x3
  const cy = ly + lh - 11 - 2.5 * sh;
  s += `<path d="M${lx + lw + 2},${cy - 9} l12,9 l-12,9z" fill="#ffd23f" stroke="${O}" stroke-width="2.4"/>`;
  for (const y of [ly + 10, ly + lh - 10]) for (const x of [lx + 6, lx + lw - 6]) s += `<circle cx="${x}" cy="${y}" r="3.2" fill="${brass()}" stroke="${O}" stroke-width="1.2"/>`;
  S += s;
}

// ---------- BUY SIGN (hanging, left) ----------
{
  let s = '';
  // bracket from the wall
  s += `<path d="M0,112 H170" stroke="${O}" stroke-width="16"/><path d="M0,112 H170" stroke="#9a5226" stroke-width="10"/><path d="M0,109 H170" stroke="rgba(255,210,150,.7)" stroke-width="2.4"/>`;
  s += `<path d="M20,160 L20,112 L70,112Z" fill="#8a4420" stroke="${O}" stroke-width="3"/>`;
  s += `<circle cx="174" cy="112" r="7" fill="${brass()}" stroke="${O}" stroke-width="2.4"/>`;
  s += `<g transform="rotate(-3 108 200)">`;
  for (const x of [58, 160]) s += `<path d="M${x},114 L${x},172" stroke="${O}" stroke-width="7"/><path d="M${x},114 L${x},172" stroke="#d9b070" stroke-width="3.4" stroke-dasharray="5 3"/>`;
  s += `<ellipse cx="108" cy="276" rx="80" ry="10" fill="rgba(40,10,10,.28)"/>`;
  s += rc(24, 168, 168, 98, 14, wood('#d98a4a', '#8a4420'), 4.5);
  s += `<path d="M30,196 h156 M30,234 h156" stroke="rgba(40,14,6,.4)" stroke-width="2.4"/><path d="M30,176 h156" stroke="rgba(255,225,170,.7)" stroke-width="2.6"/>`;
  s += rc(36, 180, 144, 74, 9, '#fff0cf', 3);
  s += txt('BONUS', 108, 218, 34, '#d92b78', { stroke: O, sw: 6 });
  s += txt('BUY', 108, 246, 30, '#0f9ba0', { stroke: O, sw: 6 });
  for (const [x, y] of [[40, 172], [176, 172], [40, 260], [176, 260]]) s += `<circle cx="${x}" cy="${y}" r="4" fill="${brass()}" stroke="${O}" stroke-width="1.4"/>`;
  s += `<g transform="translate(40 188) scale(.22)">${SYM.pin5().replace(/\$5/g, '')}</g>`;
  s += `</g>`;
  S += s;
}

// ---------- HUD ----------
{
  let s = '';
  s += `<rect x="0" y="716" width="${W}" height="34" fill="${grad([[0, 'rgba(30,8,4,0)'], [1, 'rgba(30,8,4,.5)']])}"/>`;
  s += `<rect x="0" y="750" width="${W}" height="150" fill="${wood('#b8662e', '#5a2810')}" stroke="${O}" stroke-width="4"/>`;
  for (const y of [790, 828, 866]) s += `<path d="M0,${y} H${W}" stroke="rgba(30,10,5,.75)" stroke-width="3"/><path d="M0,${y + 2.5} H${W}" stroke="rgba(255,200,130,.22)" stroke-width="2"/>`;
  for (let i = 0; i < 40; i++) s += `<path d="M${R() * W},${756 + R() * 140} h${40 + R() * 120}" stroke="rgba(40,14,6,${.12 + R() * .14})" stroke-width="${1 + R() * 2}"/>`;
  for (const [y, xs] of [[750, [220, 640, 1100]], [790, [90, 520, 980, 1400]], [828, [300, 760, 1240]], [866, [140, 600, 1020, 1500]]]) for (const x of xs) s += `<path d="M${x},${y + 2} v${36}" stroke="rgba(30,10,5,.75)" stroke-width="3"/>`;
  s += `<rect x="0" y="750" width="${W}" height="12" fill="${brass()}" stroke="${O}" stroke-width="3"/>`;
  for (let x = 28; x < W; x += 64) s += `<circle cx="${x}" cy="756" r="3.6" fill="#fff0a8" stroke="${O}" stroke-width="1.4"/>`;
  const slot = (x, w, label, val, vcol) => {
    let t = rc(x, 774, w, 98, 14, wood('#8a4420', '#4a2008'), 4);
    t += rc(x + 8, 782, w - 16, 82, 9, '#26100a', 2.6);
    t += `<path d="M${x + 12},786 h${w - 24}" stroke="rgba(255,255,255,.12)" stroke-width="3"/>`;
    t += txt(label, x + w / 2, 806, 18, '#f2c04a', { font: 'Lil' }) + txt(val, x + w / 2, 848, 36, vcol, { stroke: O, sw: 3 });
    for (const [px, py] of [[x + 6, 780], [x + w - 6, 780], [x + 6, 866], [x + w - 6, 866]]) t += `<circle cx="${px}" cy="${py}" r="3" fill="${brass()}" stroke="${O}" stroke-width="1.2"/>`;
    return t;
  };
  s += slot(56, 280, 'BALANCE', '$1,000.00', '#fff0cf');
  // bet with pills
  s += slot(372, 250, 'BET', '$1.00', '#fff0cf');
  for (const [x, sg] of [[396, '-'], [600, '+']]) s += `<circle cx="${x}" cy="838" r="21" fill="${brass()}" stroke="${O}" stroke-width="3.4"/>` + `<path d="M${x - 9},838 h18${sg === '+' ? `M${x},829 v18` : ''}" stroke="${O}" stroke-width="5.4" stroke-linecap="round"/>`;
  s += slot(978, 280, 'WIN', '$2.50', '#ffd23f');
  // pill buttons right
  const pill = (x, icon) => `<rect x="${x - 40}" y="800" width="80" height="54" rx="27" fill="${brass()}" stroke="${O}" stroke-width="3.6"/><rect x="${x - 34}" y="806" width="68" height="42" rx="21" fill="${grad([[0, '#2fd0c8'], [1, '#0a6a78']])}" stroke="${O}" stroke-width="2"/>${icon}`;
  s += pill(1334, `<path d="M1338,812 l-14,18 h10 l-4,14 l16,-20 h-10z" fill="#fff0a8" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>`);
  s += pill(1430, `<path d="M1414,827 a14,14 0 1 1 6,12" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round"/><path d="M1408,829 l8,-1 l-1,9z" fill="#fff"/>`);
  s += pill(1526, `<path d="M1512,819 h28 M1512,827 h28 M1512,835 h28" stroke="#fff" stroke-width="4.4" stroke-linecap="round"/>`);
  // SPIN button
  s += `<ellipse cx="800" cy="898" rx="90" ry="14" fill="rgba(30,8,4,.5)"/>`;
  s += `<circle cx="800" cy="826" r="84" fill="${brass()}" stroke="${O}" stroke-width="5"/>`;
  s += `<circle cx="800" cy="826" r="74" fill="${rgrad([[0, '#8ff8ee'], [.45, '#1fc8c2'], [1, '#07606e']], .38, .3, .85)}" stroke="${O}" stroke-width="4"/>`;
  s += `<circle cx="800" cy="826" r="62" fill="none" stroke="#f6c22a" stroke-width="4"/><circle cx="800" cy="826" r="62" fill="none" stroke="${O}" stroke-width="1.2" stroke-dasharray="3 6"/>`;
  for (let a = 0; a < 360; a += 30) { const x = 800 + Math.cos(a * Math.PI / 180) * 79, y = 826 + Math.sin(a * Math.PI / 180) * 79; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="#fff6c0" stroke="${O}" stroke-width="1.2"/>`; }
  s += `<path d="M770,818 a32,32 0 0 1 56,-10" fill="none" stroke="${O}" stroke-width="15" stroke-linecap="round"/><path d="M770,818 a32,32 0 0 1 56,-10" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M834,804 l4,22 l-22,-6z" fill="#fff" stroke="${O}" stroke-width="3.4" stroke-linejoin="round"/>`;
  s += `<path d="M830,836 a32,32 0 0 1 -56,10" fill="none" stroke="${O}" stroke-width="15" stroke-linecap="round"/><path d="M830,836 a32,32 0 0 1 -56,10" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M766,848 l-4,-22 l22,6z" fill="#fff" stroke="${O}" stroke-width="3.4" stroke-linejoin="round"/>`;
  s += `<path d="M740,796 a64,64 0 0 1 56,-34" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="5" stroke-linecap="round"/>`;
  S += s;
}

// ---------- WIN CALLOUT PLAQUE ----------
{
  let s = '';
  s += `<ellipse cx="800" cy="736" rx="250" ry="10" fill="rgba(30,8,4,.45)"/>`;
  s += p('M548,676 L1052,676 L1062,704 L1052,732 L548,732 L538,704Z', wood('#d98a4a', '#7a3a18'), 4.4);
  s += `<path d="M556,683 H1044" stroke="rgba(255,225,170,.7)" stroke-width="2.6"/>`;
  s += rc(568, 684, 464, 40, 8, grad([[0, '#fffaec'], [1, '#f3dca4']]), 3);
  // papel picado scallop edge
  for (let x = 576; x < 1030; x += 24) s += `<path d="M${x},724 q12,10 24,0z" fill="${['#ee3d8f', '#1cb8bd', '#ffd23f', '#f58a2e'][Math.round((x - 576) / 24) % 4]}" stroke="${O}" stroke-width="1.6"/>`;
  s += txt('LINE 1  -  3x SKULL', 696, 712, 24, '#5a2810', { font: 'Lil' });
  s += txt('WIN $2.50', 930, 714, 30, '#d92b78', { stroke: O, sw: 5 });
  s += `<path d="M862,688 v32" stroke="${O}" stroke-width="2.4" stroke-dasharray="4 4"/>`;
  for (const [x, y] of [[552, 704], [1048, 704]]) s += `<circle cx="${x}" cy="${y}" r="5" fill="${brass()}" stroke="${O}" stroke-width="1.6"/>`;
  S += s;
}

// ---------- LOGO ----------
{
  let s = '';
  const ear = (flip) => `<g transform="${flip ? 'translate(1600 0) scale(-1 1)' : ''}"><g transform="translate(${flip ? 800 : 800} 0)"></g></g>`;
  const earP = (dx, flip) => `<g transform="translate(${dx} 54) scale(${flip ? -.46 : .46} .46) translate(${flip ? -200 : -164} -134)">${p('M146,134 C114,106 102,58 124,14 C142,48 164,86 184,124Z', grad([[0, '#fffbf1'], [1, '#e4b684']], 0, 0, 1, 1), 5.5)}${np('M152,124 C130,98 120,62 126,38 C142,62 158,92 172,118Z', '#e8998a')}</g>`;
  // paper banner behind
  s += `<path d="M452,98 C560,70 1040,70 1148,98 L1160,134 L1148,170 C1040,198 560,198 452,170 L440,134Z" fill="${grad([[0, '#8a2a7a'], [1, '#4a1450']])}" stroke="${O}" stroke-width="4.4" opacity="0"/>`;
  s += `<g transform="translate(800 0)">${[-1, 1].map(sg => `<g transform="translate(${sg * 40} 58) rotate(${sg * 16}) scale(${sg * .5} .5) translate(${sg > 0 ? -164 : -236} -134)">${p('M146,134 C114,106 102,58 124,14 C142,48 164,86 184,124Z', grad([[0, '#fffbf1'], [1, '#e4b684']], 0, 0, 1, 1), 5.5)}${np('M152,124 C130,98 120,62 126,38 C142,62 158,92 172,118Z', '#e8998a')}</g>`).join('')}</g>`;
  const cl = ['#ee3d8f', '#1cb8bd', '#ffd23f', '#f58a2e', '#7a3fd0'];
  const word = (t, size, y, off, ls) => {
    const tsp = t.split('').map((ch, i) => `<tspan fill="${cl[(i + off) % 5]}">${ch}</tspan>`).join('');
    const base = `x="800" y="${y}" font-family="Luck" font-size="${size}" text-anchor="middle" letter-spacing="${ls}"`;
    return `<text ${base} fill="none" stroke="${O}" stroke-width="${size * .30}" stroke-linejoin="round">${t}</text>` +
      `<text ${base} fill="none" stroke="#ffd23f" stroke-width="${size * .18}" stroke-linejoin="round">${t}</text>` +
      `<text ${base} fill="none" stroke="#a8620c" stroke-width="${size * .04}" stroke-linejoin="round" transform="translate(0 ${size * .035})" opacity=".0">${t}</text>` +
      `<text ${base} stroke="${O}" stroke-width="${size * .035}" stroke-linejoin="round" paint-order="stroke">${tsp}</text>` +
      `<text ${base} fill="${grad([[0, 'rgba(255,255,255,.65)'], [.5, 'rgba(255,255,255,0)'], [1, 'rgba(60,10,40,.35)']])}">${t}</text>` +
      `<text ${base} fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="2 5" stroke-linecap="round" opacity=".8" transform="translate(0 -1)">${t}</text>`;
  };
  s += word('LUCKY LLAMA', 82, 126, 0, 3);
  s += word('FIESTA', 66, 190, 2, 6);
  // marigolds flanking FIESTA
  for (const sg of [-1, 1]) { s += flower(800 + sg * 218, 168, 22, 12, '#f58a1f', '#b8430c', 0, 2, '#ffb347') + flower(800 + sg * 252, 178, 15, 9, '#ffd23f', '#b8430c', 10, 1.8) + flower(800 + sg * 190, 186, 12, 8, '#ee3d8f', '#ffd23f', 0, 1.6); }
  S += s;
}

const fontB64 = (f) => fs.readFileSync(f).toString('base64');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Lucky Llama Fiesta look test</title>
<style>
@font-face{font-family:Luck;src:url(data:font/ttf;base64,${fontB64(__dirname + '/LuckiestGuy.ttf')}) format('truetype')}
@font-face{font-family:Lil;src:url(data:font/ttf;base64,${fontB64(__dirname + '/LilitaOne.ttf')}) format('truetype')}
html,body{margin:0;background:#1a0c08}
svg{display:block;width:1600px;height:900px}
</style></head><body><svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs>${defs.join('')}</defs>${S}</svg></body></html>`;
fs.writeFileSync(__dirname + '/../test/look.html', html);
console.log('look.html', (html.length / 1024).toFixed(0) + ' KB');
