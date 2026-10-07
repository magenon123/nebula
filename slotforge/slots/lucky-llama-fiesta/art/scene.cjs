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
const ug = (st) => { const id = (DUSK ? 'lDu' : 'lBu') + 'sky'; L.defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">${st.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`); return `url(#${id})`; };
S += `<rect x="-900" y="-400" width="3400" height="1800" fill="${ug(DUSK ? [[0, '#05082a'], [.3, '#161a5a'], [.55, '#4a2a7a'], [.72, '#8a3a6a'], [.86, '#c8603a'], [1, '#e89a50']] : [[0, '#0c1448'], [.25, '#34378e'], [.45, '#a8488a'], [.62, '#ee7a3c'], [.78, '#ffb852'], [1, '#ffd98a']])}"/>`;
// stars faint at top
for (let i = 0; i < 90; i++) S += `<circle cx="${-900 + R() * 3400}" cy="${-400 + R() * 550}" r="${.8 + R() * 1.2}" fill="#fff" opacity="${.35 + R() * .4}"/>`;
S += `<circle cx="150" cy="560" r="700" fill="${rgrad([[0, 'rgba(255,240,170,.95)'], [.18, 'rgba(255,200,100,.65)'], [.5, 'rgba(255,140,70,.25)'], [1, 'rgba(255,120,60,0)']])}"/>`;
S += `<circle cx="150" cy="560" r="62" fill="#fff6c0"/>`;
if (DUSK) S += `<circle cx="1230" cy="150" r="46" fill="#f4f0d8"/><circle cx="1216" cy="140" r="42" fill="#161a5a" opacity=".0"/>`;
// clouds: lit on the left/underside
const cloud = (x, y, w, h) => `<g><ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="rgba(110,70,150,.55)"/><ellipse cx="${x - w * .1}" cy="${y + h * .35}" rx="${w * .9}" ry="${h * .5}" fill="rgba(255,150,100,.75)"/><ellipse cx="${x - w * .25}" cy="${y + h * .6}" rx="${w * .6}" ry="${h * .28}" fill="rgba(255,205,130,.8)"/></g>`;
S += cloud(420, 300, 190, 22) + cloud(1060, 270, 230, 26) + cloud(700, 380, 160, 16) + cloud(1400, 340, 150, 18) + cloud(120, 250, 140, 16);
for (const [x, y, w, h] of [[-600, 250, 200, 20], [-250, 330, 170, 16], [1700, 290, 210, 24], [2050, 240, 170, 18], [2350, 330, 150, 16], [-820, 360, 130, 14], [1900, 380, 160, 16]]) S += cloud(x, y, w, h);
// distant mountains
const mnt = (base, top, amp, step, col, seed) => { const r = rng(seed); let d = `M-900,${base + 200}`; for (let x = -900; x <= 2500; x += step) d += ` L${x},${top + (r() - .5) * amp * 2 + (Math.sin(x / 260) * amp * .5)}`; return np(d + ` L2500,${base + 200}Z`, col); };
S += mnt(620, 400, 50, 95, 'rgba(110,60,120,.75)', 5) + mnt(640, 470, 34, 118, 'rgba(160,80,110,.8)', 6);


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
// ---------- extended world: houses, church towers, trees, lamp posts (stage coordinates; stage = 0..1600 x 0..900) ----------
const HZ = .32;
function tower(dx, dy, k, dome) {
  let s = '';
  const x = 0, y = 180;
  s += np(`M${x + 78},${y + 20} l12,6 l0,${440} l-12,0z`, '#8a6a4a');
  s += `<rect x="${x}" y="${y + 20}" width="78" height="440" fill="${grad([[0, '#fff0cf'], [1, '#e1b983']], 0, 0, 1, 0)}" stroke="${O}" stroke-width="3"/>`;
  s += `<path d="M${x + 14},${y + 90} L${x + 14},${y + 56} Q${x + 39},${y + 24} ${x + 64},${y + 56} L${x + 64},${y + 90}Z" fill="#3a1a2a" stroke="${O}" stroke-width="3"/><circle cx="${x + 39}" cy="${y + 74}" r="9" fill="#f2c04a" stroke="${O}" stroke-width="2.4"/><path d="M${x + 39},${y + 66} v18" stroke="${O}" stroke-width="2"/>`;
  s += p(`M${x - 6},${y + 22} Q${x + 39},${y - 54} ${x + 84},${y + 22}Z`, grad([[0, '#2fb8b0'], [1, '#126a76']], 0, 0, 1, 0), 3.4);
  s += `<path d="M${x + 39},${y - 26} v-26 M${x + 28},${y - 42} h22" stroke="${O}" stroke-width="9"/><path d="M${x + 39},${y - 26} v-26 M${x + 28},${y - 42} h22" stroke="#f6c22a" stroke-width="5"/>`;
  s += `<circle cx="${x + 39}" cy="${y + 160}" r="16" fill="#fff6d8" stroke="${O}" stroke-width="3"/><path d="M${x + 39},${y + 160} v-10 M${x + 39},${y + 160} l8,4" stroke="${O}" stroke-width="2.4"/>`;
  s += `<rect x="${x}" y="${y + 20}" width="${78 + 12}" height="440" fill="rgba(255,150,120,.2)"/>`;
  return s;
}
const towerAt = (dx, dy, k) => `<g transform="translate(${dx} ${(640 - 460 * k).toFixed(0)}) scale(${k})">${tower()}</g>`;
function tree(x, y, k, col) {
  const c = col || ['#2f9a48', '#7a3fd0', '#3aa05a'][Math.floor(R() * 3)];
  return `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="6" cy="2" rx="70" ry="10" fill="rgba(40,10,10,.35)"/><path d="M-9,0 L-6,-110 L6,-110 L9,0Z" fill="${wood('#8a4420', '#4a2008')}" stroke="${O}" stroke-width="3"/>${fluff([[-52, -150, 44], [0, -190, 56], [52, -150, 44], [-24, -128, 38], [30, -128, 38]], grad([[0, lighten(c, .35)], [1, c]], 0, 0, 1, 1), 3.4)}${[[-40, -160], [10, -200], [48, -150], [-10, -135]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="14" ry="7" fill="rgba(255,255,255,.18)"/>`).join('')}</g>`;
}
function lamp(x, y, DUSKL, arm) {
  let s = `<ellipse cx="${x}" cy="${y + 4}" rx="34" ry="7" fill="rgba(40,10,10,.4)"/><rect x="${x - 6}" y="${y - 300}" width="12" height="300" fill="${wood('#8a4420', '#4a2008')}" stroke="${O}" stroke-width="3"/>`;
  const arms = arm === 'l' ? [-1] : arm === 'r' ? [1] : [-1, 1];
  for (const sg of arms) { s += `<path d="M${x},${y - 292} q${sg * 28},-22 ${sg * 52},0" fill="none" stroke="${O}" stroke-width="7"/>`; }
  const pts = [[x, y - 306]].concat(arms.map(sg => [x + sg * 52, y - 280]));
  pts.forEach(([lx, ly], i) => { s += `<circle cx="${lx}" cy="${ly + 16}" r="${DUSK ? 46 : 28}" fill="${rgrad([[0, 'rgba(255,225,130,.8)'], [1, 'rgba(255,200,100,0)']])}"/>` + p(`M${lx - 9},${ly} q-5,14 0,28 h18 q5,-14 0,-28z`, ['#ff5a3a', '#ffd23f', '#1cb8bd'][i % 3], 2.4); });
  return s;
}
function fountain(x, y) {
  return `<ellipse cx="${x}" cy="${y + 6}" rx="110" ry="16" fill="rgba(40,10,10,.4)"/>` + p(`M${x - 100},${y - 24} h200 l-14,34 h-172z`, grad([[0, '#f6e1b4'], [1, '#b88a58']], 0, 0, 1, 0), 3.6) + `<ellipse cx="${x}" cy="${y - 24}" rx="100" ry="14" fill="#2fb8c0" stroke="${O}" stroke-width="3"/><ellipse cx="${x}" cy="${y - 24}" rx="76" ry="9" fill="#7fe8e8" opacity=".7"/>` + p(`M${x - 14},${y - 24} L${x - 8},${y - 90} h16 L${x + 14},${y - 24}z`, grad([[0, '#fff0cf'], [1, '#c8a070']], 0, 0, 1, 0), 3) + `<ellipse cx="${x}" cy="${y - 92}" rx="40" ry="8" fill="#f6e1b4" stroke="${O}" stroke-width="3"/><path d="M${x},${y - 96} q-34,-30 -48,10 M${x},${y - 96} q34,-30 48,10 M${x},${y - 96} q0,-44 0,-8" fill="none" stroke="#bff6ff" stroke-width="4" stroke-linecap="round" opacity=".9"/>`;
}
const SIDES = [[-900, -20], [1620, 2500]];
const NOHOUSE = []; // keep the sign / ladder / board / jackpot zones calm: nothing detailed in 0..1600 except hazy backs at the edges
const rr = rng(21), pals = ['terra', 'teal', 'ochre', 'pink', 'cream', 'blue'];
for (const [x0, x1] of SIDES) {
  for (let x = x0; x < x1;) { const w = 90 + rr() * 60, h = 170 + rr() * 150; S += house(Math.round(x), Math.round(600 - h), Math.round(w), Math.round(h), pals[Math.floor(rr() * 6)], HZ); x += w - 10 + rr() * 16; }
}
// hazy backs inside the stage edges (low contrast: sign zone stays calm)
S += house(-10, 430, 110, 190, 'terra', .5) + house(90, 400, 90, 220, 'teal', .5) + house(172, 440, 90, 180, 'ochre', .5);
S += house(1500, 400, 100, 220, 'ochre', .5) + house(1590, 430, 110, 190, 'pink', .5);
// church towers: far left and far right of the stage (never behind UI)
S += towerAt(-360, 200, 1.35);
S += towerAt(1760, 230, 1.1);
S += towerAt(1522, 210, .78);
// front rows (extended world only), trees, fountain, lamp posts
for (const [x0, x1] of SIDES) {
  for (let x = x0; x < x1;) { const w = 100 + rr() * 60, h = 120 + rr() * 80; const hx = Math.round(x); if (!((hx > -480 && hx < -170) || (hx > 1700 && hx < 1980))) S += house(hx, Math.round(650 - h), Math.round(w), Math.round(h), pals[Math.floor(rr() * 6)], .08, { door: true }); x += w + 8 + rr() * 60; }
}
S += tree(-640, 660, 1.1) + tree(-80, 662, 1.0, '#7a3fd0') + tree(-820, 660, .9) + tree(2060, 660, 1.1, '#7a3fd0') + tree(2380, 662, 1.0) + tree(1650, 662, .95);
S += fountain(-300, 690) + lamp(-520, 676) + lamp(-180, 676, 0, 'r') + lamp(-760, 676) + lamp(1700, 676) + lamp(2250, 676) + lamp(2440, 676, 0, 'l');
S += lamp(1498, 676, 0, 'r');

// ---------- GROUND (plaza) ----------
S += `<rect x="-900" y="640" width="3400" height="760" fill="${grad([[0, '#e4a05a'], [.25, '#c47a46'], [1, '#8a4a2c']])}"/>`;
for (let r = 0; r < 5; r++) {
  const y = 646 + r * 22, hh = 11 + r * 3, sw = 38 + r * 14;
  for (let x = -900 - ((r * 17) % sw); x < 2500; x += sw) {
    S += `<rect x="${x + 2}" y="${y}" width="${sw - 4}" height="${hh}" rx="${hh / 3}" fill="${grad([[0, lighten('#d89a60', .1 + R() * .1)], [1, '#a8643a']], 0, 0, 0, 1)}" stroke="rgba(60,20,10,.55)" stroke-width="1.6"/><path d="M${x + 6},${y + 3} h${sw / 2}" stroke="rgba(255,240,190,.4)" stroke-width="2"/>`;
  }
}
S += `<rect x="-900" y="640" width="3400" height="14" fill="${grad([[0, 'rgba(255,200,120,.0)'], [1, 'rgba(60,20,10,.25)']])}"/>`;

// ---------- MARIACHI STAGE (left) ----------
{
  let s = '';
  const STG = '<g transform="translate(20 223) scale(.66)">';
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
  S += STG + s + '</g>';
}


  if (DUSK) S += `<rect x="-900" y="-400" width="3400" height="1800" fill="rgba(30,20,90,.28)"/>`;
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
S += strand([-950, 30], [800, 150], [2550, 30], 112, 0);
S += strand([-900, 250], [-500, 340], [-130, 300], 22, 2);
S += strand([-130, 300], [-60, 330], [-10, 300], 3, 3);
S += strand([1500, 330], [1900, 250], [2500, 300], 26, 4);
S += strand([-850, 330], [-300, 420], [250, 340], 34, 1);
  return { svg: S, defs: L.defs.slice() };
};

module.exports.counter = function (DUSK) {
  L.setPrefix(DUSK ? 'lCd' : 'lCb');
  const R = rng(11); let S = '';
  const X0 = -900, W3 = 3400;
  S += `<rect x="${X0}" y="716" width="${W3}" height="34" fill="${grad([[0, 'rgba(30,8,4,0)'], [1, 'rgba(30,8,4,.5)']])}"/>`;
  S += `<rect x="${X0}" y="750" width="${W3}" height="660" fill="${wood('#b8662e', '#4a2008')}"/>`;
  for (let y = 790; y < 1400; y += 40) S += `<path d="M${X0},${y} H${X0 + W3}" stroke="rgba(30,10,5,.75)" stroke-width="3"/><path d="M${X0},${y + 2.5} H${X0 + W3}" stroke="rgba(255,200,130,.2)" stroke-width="2"/>`;
  for (let i = 0; i < 340; i++) S += `<path d="M${(X0 + R() * W3).toFixed(0)},${(756 + R() * 640).toFixed(0)} h${(40 + R() * 160).toFixed(0)}" stroke="rgba(40,14,6,${(.12 + R() * .14).toFixed(2)})" stroke-width="${(1 + R() * 2).toFixed(1)}"/>`;
  for (let y = 750; y < 1400; y += 40) { let x = X0 + R() * 300; while (x < X0 + W3) { S += `<path d="M${x.toFixed(0)},${y + 2} v${36}" stroke="rgba(30,10,5,.75)" stroke-width="3"/>`; x += 260 + R() * 360; } }
  S += `<rect x="${X0}" y="750" width="${W3}" height="12" fill="${brass()}" stroke="${O}" stroke-width="3"/>`;
  for (let x = X0 + 28; x < X0 + W3; x += 64) S += `<circle cx="${x}" cy="756" r="3.6" fill="#fff0a8" stroke="${O}" stroke-width="1.4"/>`;
  S += `<rect x="${X0}" y="762" width="${W3}" height="14" fill="${grad([[0, 'rgba(0,0,0,.35)'], [1, 'rgba(0,0,0,0)']])}"/>`;
  S += `<rect x="${X0}" y="880" width="${W3}" height="530" fill="${grad([[0, 'rgba(20,6,2,0)'], [1, 'rgba(20,6,2,.55)']])}"/>`;
  if (DUSK) S += `<rect x="${X0}" y="716" width="${W3}" height="700" fill="rgba(30,20,90,.3)"/>`;
  return { svg: S, defs: L.defs.slice() };
};
