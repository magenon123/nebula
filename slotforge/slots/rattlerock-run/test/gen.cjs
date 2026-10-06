// RATTLEROCK RUN look-test generator (leo). Output: look.html (self-contained 1600x900 SVG scene)
const fs = require('fs');
const FONT = fs.readFileSync(__dirname + '/../../siroccos-lamp-bazaar/art/fonts/cinzel-decorative-latin-900-normal.woff2').toString('base64');
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const R = (a, b) => a + (b - a) * rnd();
const f = n => +n.toFixed(1);
const lerp = (a, b, t) => a + (b - a) * t;
const OUT = '#1c0f08';

// ---------- track centreline (door -> viewer) ----------
const P0 = [1090, 352], P1 = [1105, 490], P2 = [960, 680], P3 = [230, 800];
const bez = t => { const u = 1 - t; return [0, 1].map(i => u*u*u*P0[i] + 3*u*u*t*P1[i] + 3*u*t*t*P2[i] + t*t*t*P3[i]); };
const sc = t => 0.10 + 0.90 * Math.pow(t, 1.4);
const rw = t => 3 + 62 * Math.pow(t, 1.3);

let defs = '', bg = '', mid = '', fg = '', ui = '';
const grad = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => { defs += `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`; };
const rad = (id, stops, cx = .5, cy = .5, r = .5) => { defs += `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}" stop-opacity="${s[2] != null ? s[2] : 1}"/>`).join('')}</radialGradient>`; };

grad('wood', [[0, '#b4743a'], [.5, '#8a4f24'], [1, '#4e2810']]);
grad('woodD', [[0, '#7a4420'], [1, '#2e170a']]);
grad('steel', [[0, '#c3ccd8'], [.45, '#7b8798'], [1, '#2f3848']]);
grad('steelD', [[0, '#8996a8'], [.5, '#46526a'], [1, '#1c2232']]);
grad('gold', [[0, '#fff3b0'], [.35, '#f6bf3c'], [.7, '#c47a1a'], [1, '#7a3e10']]);
grad('goldH', [[0, '#7a3e10'], [.3, '#e8a830'], [.55, '#fff0a0'], [.8, '#f0a22c'], [1, '#8a4a14']], 0, 0, 1, 0);
grad('beard', [[0, '#ffffff'], [.5, '#dfe6f0'], [1, '#8d9ab2']]);
grad('skin', [[0, '#f7b98a'], [.6, '#e2895a'], [1, '#b85a3a']]);
grad('cloak', [[0, '#e0702a'], [.55, '#a83e16'], [1, '#52180c']]);
grad('leather', [[0, '#6a4a30'], [1, '#2a1a10']]);
grad('floor', [[0, '#5a3b2a'], [.5, '#2c2036'], [1, '#120c1c']]);
rad('doorGlow', [[0, '#fffbe0', 1], [.25, '#ffe27a', .85], [.6, '#ffa830', .3], [1, '#ff8a20', 0]]);
rad('lampGlow', [[0, '#fff2b8', .95], [.3, '#ffc850', .5], [1, '#ff9a20', 0]]);
rad('crysGlow', [[0, '#7ee4ff', .6], [.5, '#3a9aff', .22], [1, '#2060ff', 0]]);
rad('vig', [[0, '#000', 0], [.62, '#000', 0], [1, '#05020c', .78]], .5, .5, .75);
rad('warmWash', [[0, '#ffb040', .38], [1, '#ff8020', 0]]);
rad('shadow', [[0, '#000', .55], [1, '#000', 0]]);
rad('gemGlow', [[0, '#fff', .8], [1, '#fff', 0]]);

// ---------- 1. rock wall (faceted, baked) ----------
bg += `<rect width="1600" height="900" fill="#0d0a1e"/>`;
const DX = 1090, DY = 330;
const rockCol = (x, y, j) => {
  const d = Math.hypot((x - DX) * 0.9, (y - DY) * 1.25);
  const warm = Math.max(0, 1 - d / 720);
  const cx = x < 800 ? Math.max(0, 1 - x / 500) : 0, cy = Math.max(0, 1 - Math.hypot(x - 1470, y - 380) / 380);
  const cool = Math.min(1, cx * .7 + cy * .8);
  let r = 20 + 30 * j, g = 22 + 26 * j, b = 52 + 40 * j;
  r += warm * (120 + 50 * j); g += warm * (58 + 24 * j); b += warm * (14);
  r += cool * 10; g += cool * 40 * j; b += cool * 70 * j;
  return `rgb(${Math.min(255, r | 0)},${Math.min(255, g | 0)},${Math.min(255, b | 0)})`;
};
const S = 56;
for (let gy = -1; gy < 17; gy++) for (let gx = -1; gx < 30; gx++) {
  const pt = (i, j) => [ (gx + i) * S + (((gx + i) * 73 + (gy + j) * 31) % 17 - 8) * 2.2, (gy + j) * S + (((gx + i) * 41 + (gy + j) * 57) % 13 - 6) * 2.2 ];
  const a = pt(0, 0), b = pt(1, 0), c = pt(1, 1), d = pt(0, 1);
  const tris = rnd() < .5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
  for (const t of tris) {
    const mx = (t[0][0] + t[1][0] + t[2][0]) / 3, my = (t[0][1] + t[1][1] + t[2][1]) / 3;
    const col = rockCol(mx, my, rnd() * rnd());
    bg += `<polygon points="${t.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${col}" stroke="${col}" stroke-width=".8"/>`;
  }
}
// a few lighter edge strokes for rock cracks
for (let i = 0; i < 70; i++) {
  const x = R(0, 1600), y = R(0, 620), l = R(20, 70), a = R(0, 6.28);
  const warm = Math.max(0, 1 - Math.hypot(x - DX, y - DY) / 700);
  bg += `<path d="M${f(x)},${f(y)} l${f(Math.cos(a) * l)},${f(Math.sin(a) * l)}" stroke="${warm > .3 ? '#ffc070' : '#6a78c0'}" stroke-opacity=".28" stroke-width="1.6" fill="none"/>`;
}
// tunnel mouth: darker rim around centre, warm bloom from door
bg += `<ellipse cx="${DX}" cy="${DY + 20}" rx="760" ry="470" fill="url(#warmWash)"/>`;

// ---------- 2. floor ----------
bg += `<path d="M${DX - 70},${DY + 18} C${DX - 160},${DY + 90} 600,560 -200,730 L-200,900 L1800,900 L1800,700 C1500,600 1260,480 ${DX + 80},${DY + 18} Z" fill="url(#floor)"/>`;
bg += `<ellipse cx="${DX}" cy="${DY + 40}" rx="330" ry="60" fill="url(#doorGlow)" opacity=".55"/>`;
// gravel
for (let i = 0; i < 260; i++) {
  const t = Math.pow(rnd(), .7), p = bez(t), s = sc(t);
  const x = p[0] + R(-1, 1) * (150 + 900 * s), y = p[1] + R(-.2, 1) * (70 + 180 * s);
  if (y > 900 || x < -50) continue;
  const w = R(3, 13) * s * 1.6, h = w * R(.45, .7);
  const warm = Math.max(0, 1 - Math.hypot(x - DX, y - DY) / 700);
  bg += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(h)}" fill="${warm > .35 ? '#7a4a2a' : '#3a3050'}" opacity=".75"/>`;
}

// ---------- 3. door of daylight ----------
bg += `<ellipse cx="${DX}" cy="${DY - 20}" rx="260" ry="250" fill="url(#doorGlow)" opacity=".75"/>`;
// light rays
for (let i = 0; i < 9; i++) {
  const a = Math.PI * (0.05 + i * 0.1) * -1 + Math.PI * 1.0, l = R(300, 520);
  const a0 = a - .04, a1 = a + .04;
  bg += `<polygon points="${DX},${DY - 10} ${f(DX + Math.cos(a0) * l)},${f(DY - 10 + Math.sin(a0) * l)} ${f(DX + Math.cos(a1) * l)},${f(DY - 10 + Math.sin(a1) * l)}" fill="#ffe28a" opacity=".07"/>`;
}
// rock arch ring
bg += `<path d="M${DX - 62},${DY + 20} L${DX - 62},${DY - 62} C${DX - 62},${DY - 128} ${DX + 62},${DY - 128} ${DX + 62},${DY - 62} L${DX + 62},${DY + 20} Z" fill="#3a2418" stroke="${OUT}" stroke-width="3"/>`;
bg += `<path d="M${DX - 46},${DY + 20} L${DX - 46},${DY - 60} C${DX - 46},${DY - 108} ${DX + 46},${DY - 108} ${DX + 46},${DY - 60} L${DX + 46},${DY + 20} Z" fill="url(#doorFill)"/>`;
grad('doorFill', [[0, '#ffffff'], [.35, '#fff3b0'], [.75, '#ffc858'], [1, '#ff9a30']]);
// distant sunlit hills in door
bg += `<clipPath id="dc"><path d="M${DX - 46},${DY + 20} L${DX - 46},${DY - 60} C${DX - 46},${DY - 108} ${DX + 46},${DY - 108} ${DX + 46},${DY - 60} L${DX + 46},${DY + 20} Z"/></clipPath>`;
bg += `<g clip-path="url(#dc)"><path d="M${DX - 50},${DY - 6} Q${DX - 20},${DY - 30} ${DX + 6},${DY - 8} Q${DX + 30},${DY - 24} ${DX + 50},${DY - 4} L${DX + 50},${DY + 22} L${DX - 50},${DY + 22} Z" fill="#f3b24a" opacity=".8"/><path d="M${DX - 50},${DY + 6} Q${DX},${DY - 8} ${DX + 50},${DY + 8} L${DX + 50},${DY + 22} L${DX - 50},${DY + 22} Z" fill="#c98a30" opacity=".7"/></g>`;
bg += `<path d="M${DX - 46},${DY + 20} L${DX - 46},${DY - 60} C${DX - 46},${DY - 108} ${DX + 46},${DY - 108} ${DX + 46},${DY - 60} L${DX + 46},${DY + 20}" fill="none" stroke="#ffe8a0" stroke-width="3" opacity=".9"/>`;
// wooden door-frame planks (open golden doors) -> iron studs
bg += `<path d="M${DX - 62},${DY + 20} L${DX - 62},${DY - 62} C${DX - 62},${DY - 128} ${DX + 62},${DY - 128} ${DX + 62},${DY - 62} L${DX + 62},${DY + 20}" fill="none" stroke="url(#gold)" stroke-width="5"/>`;

// ---------- 4. timber frames ----------
const frame = (t) => {
  const p = bez(t), s = sc(t), W = 300 * s, H = 330 * s + 20, pw = 30 * s + 5;
  let o = '';
  const x0 = p[0] - W, x1 = p[0] + W, yb = p[1] + 24 * s + rw(t) * .9, yt = p[1] - H;
  const post = x => `<rect x="${f(x - pw / 2)}" y="${f(yt)}" width="${f(pw)}" height="${f(yb - yt)}" fill="url(#woodD)" stroke="${OUT}" stroke-width="${f(Math.max(1.5, 3 * s))}"/><rect x="${f(x - pw / 2 + pw * .15)}" y="${f(yt)}" width="${f(pw * .22)}" height="${f(yb - yt)}" fill="#c98a4a" opacity=".45"/>`;
  o += post(x0) + post(x1);
  o += `<rect x="${f(x0 - pw)}" y="${f(yt - pw * .4)}" width="${f(x1 - x0 + pw * 2)}" height="${f(pw * 1.05)}" fill="url(#wood)" stroke="${OUT}" stroke-width="${f(Math.max(1.5, 3 * s))}"/>`;
  o += `<rect x="${f(x0 - pw)}" y="${f(yt - pw * .4)}" width="${f(x1 - x0 + pw * 2)}" height="${f(pw * .28)}" fill="#e0a560" opacity=".5"/>`;
  // diagonal braces
  const bl = 110 * s;
  o += `<polygon points="${f(x0 + pw / 2)},${f(yt + pw * .6 + bl)} ${f(x0 + pw / 2)},${f(yt + pw * .6 + bl - pw * .9)} ${f(x0 + pw / 2 + bl)},${f(yt + pw * .6 + 1)} ${f(x0 + pw / 2 + bl - pw * .3)},${f(yt + pw * .6 + 1)}" fill="url(#woodD)" stroke="${OUT}" stroke-width="${f(Math.max(1, 2 * s))}"/>`;
  o += `<polygon points="${f(x1 - pw / 2)},${f(yt + pw * .6 + bl)} ${f(x1 - pw / 2)},${f(yt + pw * .6 + bl - pw * .9)} ${f(x1 - pw / 2 - bl)},${f(yt + pw * .6 + 1)} ${f(x1 - pw / 2 - bl + pw * .3)},${f(yt + pw * .6 + 1)}" fill="url(#woodD)" stroke="${OUT}" stroke-width="${f(Math.max(1, 2 * s))}"/>`;
  // iron brackets
  for (const x of [x0, x1]) o += `<rect x="${f(x - pw * .62)}" y="${f(yt + pw * .1)}" width="${f(pw * 1.24)}" height="${f(pw * .55)}" rx="${f(pw * .1)}" fill="url(#steelD)" stroke="${OUT}" stroke-width="${f(Math.max(1, 1.8 * s))}"/>`;
  return { svg: o, p, s, W, yt, x0, x1 };
};
const frameTs = [.06, .14, .24, .36, .50, .64, .78];
const frames = frameTs.map(frame);
const lanternTs = [1, 3, 5];
// darken between frames: shade ellipse per frame to push depth
frames.forEach((fr, i) => { mid += `<g>${fr.svg}</g>`; });

// lanterns hanging from frame beams (both sides alternating)
const lantern = (x, y, s, glowR) => {
  let o = `<circle cx="${f(x)}" cy="${f(y + 34 * s)}" r="${f(glowR)}" fill="url(#lampGlow)"/>`;
  o += `<path d="M${f(x)},${f(y - 40 * s)} L${f(x)},${f(y)}" stroke="${OUT}" stroke-width="${f(3 * s + 1)}"/>`;
  o += `<path d="M${f(x - 12 * s)},${f(y)} L${f(x + 12 * s)},${f(y)} L${f(x + 9 * s)},${f(y - 8 * s)} L${f(x - 9 * s)},${f(y - 8 * s)} Z" fill="url(#steelD)" stroke="${OUT}" stroke-width="${f(1.8 * s + .6)}"/>`;
  o += `<path d="M${f(x - 14 * s)},${f(y + 4 * s)} L${f(x + 14 * s)},${f(y + 4 * s)} L${f(x + 18 * s)},${f(y + 54 * s)} L${f(x - 18 * s)},${f(y + 54 * s)} Z" fill="#ffd864" stroke="${OUT}" stroke-width="${f(2.2 * s + .6)}"/>`;
  o += `<ellipse cx="${f(x)}" cy="${f(y + 32 * s)}" rx="${f(9 * s)}" ry="${f(17 * s)}" fill="#fffbe0"/>`;
  o += `<path d="M${f(x - 14 * s)},${f(y + 4 * s)} V${f(y + 54 * s)} M${f(x + 14 * s)},${f(y + 4 * s)} V${f(y + 54 * s)}" stroke="${OUT}" stroke-width="${f(1.4 * s + .4)}" opacity=".0"/>`;
  o += `<path d="M${f(x - 16 * s)},${f(y + 54 * s)} L${f(x + 16 * s)},${f(y + 54 * s)} L${f(x + 12 * s)},${f(y + 62 * s)} L${f(x - 12 * s)},${f(y + 62 * s)} Z" fill="url(#steelD)" stroke="${OUT}" stroke-width="${f(1.8 * s + .6)}"/>`;
  o += `<path d="M${f(x - 7 * s)},${f(y + 5 * s)} V${f(y + 53 * s)} M${f(x + 7 * s)},${f(y + 5 * s)} V${f(y + 53 * s)}" stroke="#5a3010" stroke-width="${f(1.6 * s + .4)}"/>`;
  return o;
};
const lanternAt = (fi, side, drop, k) => {
  const fr = frames[fi]; const x = side < 0 ? fr.x0 + 6 * fr.s * 5 : fr.x1 - 6 * fr.s * 5;
  return lantern(x + side * -14 * fr.s * k, fr.yt + (28 + drop) * fr.s, fr.s * k, 90 * fr.s * k);
};
mid += lanternAt(1, 1, 80, 1.2) + lanternAt(2, -1, 80, 1.2) + lanternAt(3, 1, 80, 1.15) + lanternAt(4, -1, 80, 1.1) + lanternAt(5, 1, 70, 1.05);

// ---------- 5. crystals ----------
const crystal = (x, y, h, w, ang, hue) => {
  const pal = {
    blue: ['#e6fbff', '#6fd8ff', '#2a8ae0', '#123a96', '#7ee4ff'],
    cyan: ['#e8fff8', '#6af0d8', '#20a8b8', '#0e4a6a', '#6af0d8'],
    violet: ['#f6e8ff', '#c08aff', '#7a3ad0', '#3a1478', '#b890ff'],
  }[hue];
  const a = ang * Math.PI / 180, ux = Math.sin(a), uy = -Math.cos(a), vx = Math.cos(a), vy = Math.sin(a);
  const pt = (u, v) => `${f(x + ux * u + vx * v)},${f(y + uy * u + vy * v)}`;
  const tip = h, sh = h * .78;
  let o = `<g>`;
  o += `<polygon points="${pt(0, -w)} ${pt(sh, -w * .8)} ${pt(tip, 0)} ${pt(0, 0)}" fill="${pal[1]}"/>`;
  o += `<polygon points="${pt(0, 0)} ${pt(tip, 0)} ${pt(sh, w * .8)} ${pt(0, w)}" fill="${pal[2]}"/>`;
  o += `<polygon points="${pt(sh, -w * .8)} ${pt(tip, 0)} ${pt(sh, w * .8)}" fill="${pal[0]}" opacity=".85"/>`;
  o += `<polygon points="${pt(0, -w)} ${pt(sh, -w * .8)} ${pt(sh * .96, -w * .45)} ${pt(0, -w * .5)}" fill="#fff" opacity=".35"/>`;
  o += `<polygon points="${pt(0, -w)} ${pt(sh, -w * .8)} ${pt(tip, 0)} ${pt(sh, w * .8)} ${pt(0, w)}" fill="none" stroke="${pal[3]}" stroke-width="2.6" stroke-linejoin="round"/>`;
  o += `<path d="M${pt(0, 0)} L${pt(tip, 0)}" stroke="${pal[3]}" stroke-width="1.4" opacity=".7"/>`;
  o += `</g>`;
  return o;
};
const cluster = (cx, cy, scale, hue, glow = true) => {
  let o = glow ? `<ellipse cx="${cx}" cy="${cy - 60 * scale}" rx="${200 * scale}" ry="${170 * scale}" fill="url(#crysGlow)"/>` : '';
  const items = [[-70, 0, 120, 26, -28], [-30, 6, 190, 34, -10], [20, 4, 240, 40, 6], [70, 0, 150, 30, 24], [105, 8, 90, 20, 40], [-100, 8, 80, 18, -44], [0, 10, 110, 28, -2]];
  items.sort((a, b) => a[2] - b[2]);
  for (const it of items) o += crystal(cx + it[0] * scale, cy + it[1] * scale, it[2] * scale, it[3] * scale, it[4], hue);
  return o;
};
mid += cluster(1500, 560, 1.1, 'blue') + cluster(1330, 430, .55, 'cyan');
mid += cluster(90, 470, 1.15, 'blue') + cluster(250, 400, .5, 'violet');
mid += cluster(1180, 395, .26, 'blue') + cluster(870, 395, .22, 'cyan', false) + cluster(1010, 372, .15, 'blue', false);

// ---------- 6. the track ----------
const N = 90;
const railPts = [];
for (let i = 0; i <= N; i++) { const t = i / N; const p = bez(t); railPts.push({ t, x: p[0], y: p[1], w: rw(t), s: sc(t) }); }
let trk = '';
// ballast shadow + bed
trk += `<path d="${railPts.map((p, i) => (i ? 'L' : 'M') + f(p.x) + ',' + f(p.y - p.w * 1.25)).join('')} ${railPts.slice().reverse().map(p => 'L' + f(p.x) + ',' + f(p.y + p.w * 1.6)).join('')} Z" fill="#1b1022" opacity=".65"/>`;
// sleepers
const SL = 46;
for (let i = SL; i >= 1; i--) {
  const t = Math.pow(i / SL, 1.25) * 1.05; if (t > 1.05) continue;
  const p = bez(Math.min(t, 1)), s = sc(t), w = rw(t) * 1.4, th = 12 * s + 2, len = 48 * s + 3;
  trk += `<polygon points="${f(p[0] - len * .35)},${f(p[1] - w)} ${f(p[0] + len * .55)},${f(p[1] - w)} ${f(p[0] + len * .55 - 7 * s)},${f(p[1] + w + th)} ${f(p[0] - len * .35 - 7 * s)},${f(p[1] + w + th)}" fill="url(#wood)" stroke="${OUT}" stroke-width="${f(Math.max(1, 2.4 * s))}"/>`;
  trk += `<polygon points="${f(p[0] - len * .35)},${f(p[1] - w)} ${f(p[0] + len * .55)},${f(p[1] - w)} ${f(p[0] + len * .55)},${f(p[1] - w + th * .4)} ${f(p[0] - len * .35)},${f(p[1] - w + th * .4)}" fill="#d09a58" opacity=".5"/>`;
}
// rails (two strips, top = far rail)
for (const side of [-1, 1]) {
  const off = p => p.y + side * p.w;
  const top = railPts.map((p, i) => (i ? 'L' : 'M') + f(p.x) + ',' + f(off(p) - p.s * 7)).join('');
  const bot = railPts.slice().reverse().map(p => 'L' + f(p.x) + ',' + f(off(p) + p.s * 7)).join('');
  trk += `<path d="${top} ${bot} Z" fill="url(#steel)" stroke="${OUT}" stroke-width="2.4" stroke-linejoin="round"/>`;
  trk += `<path d="${railPts.map((p, i) => (i ? 'L' : 'M') + f(p.x) + ',' + f(off(p) - p.s * 4)).join('')}" fill="none" stroke="#f1f7ff" stroke-opacity=".7" stroke-width="2"/>`;
}
mid += trk;
// warm bounce on track near the door
mid += `<ellipse cx="${DX - 10}" cy="${DY + 60}" rx="150" ry="40" fill="url(#doorGlow)" opacity=".5"/>`;

// ---------- 7. gold pile (right foreground) ----------
const nugget = (x, y, s, rot = 0) => {
  const pts = []; const n = 7;
  for (let i = 0; i < n; i++) { const a = i / n * 6.283 + R(-.2, .2), r = s * R(.7, 1.1); pts.push([Math.cos(a) * r, Math.sin(a) * r * .78]); }
  const d = pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ');
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><polygon points="${d}" fill="url(#gold)" stroke="${OUT}" stroke-width="${f(Math.max(1.6, s * .09))}" stroke-linejoin="round"/><polygon points="${f(pts[0][0] * .6)},${f(pts[0][1] * .6 - s * .1)} ${f(pts[1][0] * .5)},${f(pts[1][1] * .5 - s * .25)} ${f(pts[2][0] * .3)},${f(pts[2][1] * .3 - s * .1)}" fill="#fffbe0" opacity=".75"/></g>`;
};
const coin = (x, y, r) => `<g transform="translate(${f(x)} ${f(y)})"><ellipse rx="${r}" ry="${f(r * .5)}" fill="#a8601a" stroke="${OUT}" stroke-width="2"/><ellipse cy="${f(-r * .12)}" rx="${r}" ry="${f(r * .5)}" fill="url(#gold)" stroke="${OUT}" stroke-width="2"/><ellipse cy="${f(-r * .12)}" rx="${f(r * .62)}" ry="${f(r * .3)}" fill="none" stroke="#a8601a" stroke-width="1.6"/></g>`;
const heap = (cx, cy, wd, ht, n, ns) => {
  let o = `<ellipse cx="${cx}" cy="${cy + 6}" rx="${wd * .62}" ry="${ht * .22}" fill="#000" opacity=".5"/>`;
  const list = [];
  for (let i = 0; i < n; i++) { const u = R(-1, 1), h = (1 - u * u); const y = cy - rnd() * ht * Math.pow(h, 1.1); list.push([cx + u * wd / 2, y, ns * R(.7, 1.15)]); }
  list.sort((a, b) => a[1] - b[1]);
  for (const l of list) o += rnd() < .22 ? coin(l[0], l[1], l[2] * .8) : nugget(l[0], l[1], l[2], R(-40, 40));
  o += `<ellipse cx="${cx}" cy="${cy - ht * .6}" rx="${wd * .5}" ry="${ht * .38}" fill="#ffd060" opacity=".13"/>`;
  return o;
};
mid += `<ellipse cx="1330" cy="800" rx="330" ry="90" fill="url(#warmWash)" opacity=".7"/>`;
mid += heap(1330, 810, 440, 190, 150, 25);
mid += heap(1160, 780, 190, 80, 40, 17);
// sparkles on the pile
const spark = (x, y, r, o = 1) => `<path d="M${x},${y - r} Q${x + r * .12},${y - r * .12} ${x + r},${y} Q${x + r * .12},${y + r * .12} ${x},${y + r} Q${x - r * .12},${y + r * .12} ${x - r},${y} Q${x - r * .12},${y - r * .12} ${x},${y - r} Z" fill="#fff8d0" opacity="${o}"/>`;
mid += [[1210, 690, 16], [1440, 716, 12], [1330, 650, 18], [1090, 740, 10]].map(a => spark(...a)).join('');
// pickaxe leaning on the pile
mid += `<g transform="translate(1520 700) rotate(14)"><rect x="-6" y="-150" width="12" height="260" rx="5" fill="url(#wood)" stroke="${OUT}" stroke-width="3"/><path d="M-62,-150 Q0,-196 62,-150 Q40,-166 8,-166 L-8,-166 Q-40,-166 -62,-150 Z" fill="url(#steel)" stroke="${OUT}" stroke-width="3"/></g>`;

// ---------- 8. floating pickups ----------
const tag = (txt, col, s) => {
  const w = 44 * s, h = 24 * s;
  return `<g><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h / 2)}" fill="#160c24" stroke="${col}" stroke-width="${f(2.2 * s)}"/><text x="0" y="${f(h * .3)}" text-anchor="middle" font-family="RR" font-weight="900" font-size="${f(h * .72)}" fill="#fff6d0">${txt}</text></g>`;
};
const gem = (col, lite, dark, txt, glow) => `
  <circle r="62" fill="${glow}" opacity=".28"/><circle r="38" fill="${glow}" opacity=".3"/>
  <polygon points="-34,-8 -18,-30 18,-30 34,-8 0,36" fill="${col}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
  <polygon points="-34,-8 -18,-30 -6,-8" fill="${lite}"/><polygon points="-18,-30 18,-30 6,-8 -6,-8" fill="#fff" opacity=".7"/><polygon points="18,-30 34,-8 6,-8" fill="${lite}" opacity=".8"/>
  <polygon points="-34,-8 -6,-8 0,36" fill="${lite}" opacity=".55"/><polygon points="34,-8 6,-8 0,36" fill="${dark}" opacity=".7"/><polygon points="-6,-8 6,-8 0,36" fill="${col}"/>
  <path d="M-34,-8 L34,-8" stroke="${OUT}" stroke-width="2" opacity=".55"/><path d="M-26,-20 L-14,-26" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  <g transform="translate(0 52)">${tag(txt, lite, 1)}</g>`;
const items = {
  nugget: () => `<circle r="56" fill="#ffc83a" opacity=".22"/>${nugget(0, 0, 36, -10)}${nugget(-22, 14, 20, 20)}${nugget(22, 16, 22, -30)}<g transform="translate(0 52)">${tag('+LOAD', '#ffd25a', 1.25)}</g>${spark(30, -30, 12)}`,
  green: () => gem('#2fcf5a', '#9bffb0', '#0c6a30', 'x2', '#5dff8a'),
  blue: () => gem('#2f8cf0', '#a8dcff', '#123c9a', 'x3', '#6ac8ff'),
  red: () => gem('#e0283a', '#ff9aa0', '#7a0c1c', 'x5', '#ff6070'),
  hat: () => `<ellipse cx="0" cy="-4" rx="62" ry="50" fill="#ffc83a" opacity=".16"/>
    <path d="M-44,10 C-44,-34 -22,-44 0,-44 C22,-44 44,-34 44,10 Z" fill="#ffc22e" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M-44,10 C-44,-34 -22,-44 0,-44 C-14,-30 -20,-10 -18,10 Z" fill="#fff0a0" opacity=".6"/>
    <path d="M-8,-44 L8,-44 L10,10 L-10,10 Z" fill="#e89a10" stroke="${OUT}" stroke-width="2.5"/>
    <path d="M-60,10 Q0,2 60,10 Q62,24 50,24 L-50,24 Q-62,24 -60,10 Z" fill="#e08a14" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="0" cy="-18" r="9" fill="#fff6c0" stroke="${OUT}" stroke-width="2.5"/><circle cx="0" cy="-18" r="4" fill="#fff"/>
    <g transform="translate(0 52)">${tag('SHIELD', '#7ee4ff', 1.45)}</g>`,
  tnt: () => `<ellipse cx="0" cy="0" rx="66" ry="52" fill="#ff5030" opacity=".18"/>
    <rect x="-40" y="-26" width="80" height="58" rx="4" fill="#c42a1c" stroke="${OUT}" stroke-width="3.5"/>
    <rect x="-40" y="-26" width="80" height="14" fill="#e85a40" opacity=".7"/>
    <g stroke="#6a1008" stroke-width="2.5"><path d="M-14,-26 V32 M14,-26 V32"/></g>
    <rect x="-40" y="-6" width="80" height="22" fill="#f6e2b0" stroke="${OUT}" stroke-width="3"/>
    <text x="0" y="12" text-anchor="middle" font-family="RR" font-weight="900" font-size="20" fill="#2a0a06">TNT</text>
    <path d="M0,-26 C-4,-44 14,-46 16,-60" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M0,-26 C-4,-44 14,-46 16,-60" fill="none" stroke="#d9c08a" stroke-width="2" stroke-linecap="round"/>
    <circle cx="16" cy="-64" r="16" fill="#ff9a20" opacity=".7"/><path d="M16,-82 L20,-68 L33,-64 L20,-60 L16,-46 L12,-60 L-1,-64 L12,-68 Z" fill="#fff2a0" stroke="#ff7a10" stroke-width="2"/>
    <g transform="translate(0 56)">${tag('DANGER', '#ff6a50', 1.4)}</g>`,
};
const places = [['nugget', .70, 0], ['green', .60, -4], ['blue', .50, 6], ['hat', .41, -4], ['red', .33, 4], ['tnt', .255, 0]];
let pick = '';
const picks = [];
for (const [k, t, dy] of places) {
  const p = bez(t), s = 0.40 + 0.78 * t;
  picks.push([k, p[0], p[1] - 78 * s * 1.1 + dy, s, p[1]]);
}
for (const [k, x, y, s, ty] of picks) {
  pick += `<ellipse cx="${f(x)}" cy="${f(ty + 4)}" rx="${f(42 * s)}" ry="${f(10 * s)}" fill="url(#shadow)"/><ellipse cx="${f(x)}" cy="${f(ty + 2)}" rx="${f(38 * s)}" ry="${f(8 * s)}" fill="#ffd060" opacity=".25"/>`;
  pick += `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${items[k]()}</g>`;
}
mid += pick;

// ---------- 9. the cart + dwarf ----------
const cp = bez(.83), cp2 = bez(.78);
const cartAng = Math.atan2(cp2[1] - cp[1], cp2[0] - cp[0]) * 180 / Math.PI;
const CX = 560, CY = 650; // rim centre of the cart on screen
const dwarf = () => {
  let o = '';
  const ol = (w = 3) => `stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  // helmet lamp glow (behind everything of the head, drawn later too)
  // cloak
  o += `<path d="M-186,-34 C-206,-150 -178,-248 -92,-282 L92,-282 C178,-248 206,-150 186,-34 Z" fill="url(#cloak)" ${ol(3.5)}/>`;
  o += `<path d="M-150,-40 C-166,-120 -150,-200 -110,-250 M150,-40 C166,-120 150,-200 110,-250 M-110,-40 C-120,-110 -110,-190 -80,-250 M110,-40 C120,-110 110,-190 80,-250" fill="none" stroke="#3a0e08" stroke-width="3" opacity=".55"/>`;
  o += `<path d="M-186,-34 C-206,-150 -178,-248 -92,-282" fill="none" stroke="#ff9a50" stroke-width="4" opacity=".6"/>`;
  // torso armour
  o += `<path d="M-104,-250 C-60,-266 60,-266 104,-250 L116,-110 L100,-14 L-100,-14 L-116,-110 Z" fill="url(#steelD)" ${ol(3.5)}/>`;
  o += `<path d="M-84,-246 L-96,-110 L-84,-20" fill="none" stroke="#a9b6c9" stroke-width="4" opacity=".5"/>`;
  o += `<path d="M-30,-250 L-26,-30 L26,-30 L30,-250" fill="url(#gold)" opacity=".92" ${ol(2.5)}/>`;
  for (const y of [-205, -160, -115]) o += `<circle cx="-72" cy="${y}" r="5.5" fill="url(#gold)" ${ol(1.8)}/><circle cx="72" cy="${y}" r="5.5" fill="url(#gold)" ${ol(1.8)}/>`;
  // belt
  o += `<rect x="-112" y="-66" width="224" height="26" fill="url(#leather)" ${ol(3)}/><rect x="-26" y="-72" width="52" height="38" rx="6" fill="url(#gold)" ${ol(3)}/><rect x="-14" y="-62" width="28" height="18" rx="3" fill="#7a3e10" ${ol(2)}/>`;
  // pauldrons
  for (const sx of [-1, 1]) {
    o += `<g transform="scale(${sx} 1)"><path d="M70,-248 C110,-276 176,-262 190,-206 C194,-176 160,-160 126,-176 C96,-190 70,-220 70,-248 Z" fill="url(#steel)" ${ol(3.5)}/><path d="M86,-250 C120,-268 170,-256 182,-216" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/><path d="M76,-244 C96,-218 112,-196 126,-176 M118,-262 C136,-232 150,-200 160,-176" fill="none" stroke="url(#gold)" stroke-width="5" opacity=".95"/><path d="M70,-248 C110,-276 176,-262 190,-206" fill="none" stroke="#f2b640" stroke-width="4"/><circle cx="150" cy="-232" r="7" fill="url(#gold)" ${ol(2)}/></g>`;
  }
  // left arm (viewer left) gripping the cart rim
  const limb = (d, w, col) => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${w + 8}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#e6edf8" stroke-width="${w * .14}" stroke-linecap="round" opacity=".45" transform="translate(-${w * .22} -${w * .2})"/>`;
  const fist = (x, y, rot, flip = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${flip} 1)"><path d="M-30,-8 L30,-8 L34,24 L-34,24 Z" fill="url(#gold)" ${ol(3)}/><rect x="-34" y="-34" width="68" height="42" rx="18" fill="url(#leather)" ${ol(3.5)}/><path d="M-34,-34 Q0,-62 34,-34 L34,-26 Q0,-46 -34,-26 Z" fill="#6a4a30" ${ol(3)}/><path d="M-14,-52 V-32 M3,-54 V-32 M20,-50 V-32" stroke="${OUT}" stroke-width="3"/><rect x="-24" y="-60" width="20" height="30" rx="9" fill="url(#leather)" ${ol(3)}/><rect x="-2" y="-62" width="20" height="30" rx="9" fill="url(#leather)" ${ol(3)}/><rect x="20" y="-56" width="18" height="28" rx="9" fill="url(#leather)" ${ol(3)}/><path d="M-18,-54 q6,-4 12,0 M4,-56 q6,-4 12,0" stroke="#b08860" stroke-width="2.6" fill="none"/></g>`;
  o += limb('M-146,-196 C-196,-170 -226,-110 -196,-40', 54, 'url(#steel)');
  o += `<path d="M-226,-92 L-170,-70" stroke="url(#gold)" stroke-width="16" stroke-linecap="round"/>`;
  o += fist(-196, -14, -8);
  // pickaxe (raised in the right hand)
  o += `<g transform="rotate(10 220 -300)"><rect x="210" y="-470" width="20" height="300" rx="9" fill="url(#wood)" ${ol(3.5)}/><path d="M212,-460 V-180" stroke="#e0a560" stroke-width="3" opacity=".6"/><path d="M110,-420 C160,-480 280,-480 330,-420 C290,-446 250,-448 220,-444 C190,-448 150,-446 110,-420 Z" fill="url(#steel)" ${ol(4)}/><path d="M130,-424 C170,-458 270,-460 316,-428" stroke="#fff" stroke-width="3.5" fill="none" opacity=".7"/><rect x="204" y="-466" width="32" height="30" rx="6" fill="url(#gold)" ${ol(3)}/></g>`;
  // right arm raised
  o += limb('M146,-196 C206,-210 250,-190 246,-130 C244,-100 238,-88 232,-72', 54, 'url(#steel)');
  o += `<path d="M212,-98 L262,-92" stroke="url(#gold)" stroke-width="16" stroke-linecap="round"/>`;
  o += fist(234, -62, 6);
  return o;
};
const dwarfHead = () => {
  let o = '';
  const ol = (w = 3) => `stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const hy = -318; // head centre
  // beard (big, flowing over chest)
  o += `<path d="M-84,${hy + 12} C-128,${hy + 80} -120,${hy + 170} -72,${hy + 240} C-50,${hy + 268} -22,${hy + 278} 0,${hy + 292} C22,${hy + 278} 50,${hy + 268} 72,${hy + 240} C120,${hy + 170} 128,${hy + 80} 84,${hy + 12} Z" fill="url(#beard)" ${ol(3.5)}/>`;
  o += `<g fill="none" stroke="#7a88a4" stroke-width="3" stroke-linecap="round" opacity=".8"><path d="M-20,${hy + 80} C-34,${hy + 150} -30,${hy + 220} -8,${hy + 280}"/><path d="M16,${hy + 80} C30,${hy + 150} 28,${hy + 220} 8,${hy + 280}"/><path d="M-62,${hy + 70} C-84,${hy + 130} -80,${hy + 200} -54,${hy + 244}"/><path d="M62,${hy + 70} C84,${hy + 130} 80,${hy + 200} 54,${hy + 244}"/><path d="M-92,${hy + 60} C-110,${hy + 110} -104,${hy + 160} -92,${hy + 190}"/><path d="M92,${hy + 60} C110,${hy + 110} 104,${hy + 160} 92,${hy + 190}"/></g>`;
  o += `<path d="M-44,${hy + 60} C-52,${hy + 130} -44,${hy + 190} -30,${hy + 250} M30,${hy + 70} C40,${hy + 130} 38,${hy + 180} 24,${hy + 240}" stroke="#fff" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round"/>`;
  // beard rings
  o += `<g transform="translate(0 ${hy + 196})"><ellipse rx="40" ry="12" fill="url(#gold)" ${ol(3)}/><ellipse rx="32" ry="7" fill="#9aa6bc" opacity=".6"/></g><g transform="translate(-64 ${hy + 150}) rotate(-12)"><ellipse rx="18" ry="9" fill="url(#gold)" ${ol(2.5)}/></g><g transform="translate(64 ${hy + 150}) rotate(12)"><ellipse rx="18" ry="9" fill="url(#gold)" ${ol(2.5)}/></g>`;
  // ears
  for (const sx of [-1, 1]) o += `<ellipse cx="${sx * 74}" cy="${hy + 6}" rx="13" ry="20" fill="#d9825a" ${ol(3)}/>`;
  // face
  o += `<path d="M-72,${hy - 14} C-76,${hy - 60} -40,${hy - 70} 0,${hy - 70} C40,${hy - 70} 76,${hy - 60} 72,${hy - 14} C72,${hy + 40} 40,${hy + 62} 0,${hy + 62} C-40,${hy + 62} -72,${hy + 40} -72,${hy - 14} Z" fill="url(#skin)" ${ol(3.5)}/>`;
  o += `<ellipse cx="-44" cy="${hy + 18}" rx="22" ry="14" fill="#ff7a6a" opacity=".42"/><ellipse cx="44" cy="${hy + 18}" rx="22" ry="14" fill="#ff7a6a" opacity=".42"/>`;
  // eyes (wide, excited)
  for (const sx of [-1, 1]) {
    o += `<g transform="translate(${sx * 31} ${hy - 12})"><ellipse rx="19" ry="17" fill="#fffaf0" ${ol(3)}/><circle cx="${-sx * 2}" cy="1" r="10.5" fill="#6a3a14"/><circle cx="${-sx * 2}" cy="1" r="6" fill="#1a0a04"/><circle cx="${-sx * 2 + 4}" cy="-4" r="4" fill="#fff"/><circle cx="${-sx * 2 - 3}" cy="5" r="1.8" fill="#fff" opacity=".8"/></g>`;
    // bushy brow
    o += `<path d="M${sx * 8},${hy - 44} C${sx * 30},${hy - 62} ${sx * 62},${hy - 56} ${sx * 66},${hy - 38} C${sx * 54},${hy - 44} ${sx * 30},${hy - 38} ${sx * 8},${hy - 32} Z" fill="url(#beard)" ${ol(3)}/><path d="M${sx * 26},${hy - 52} C${sx * 40},${hy - 56} ${sx * 54},${hy - 52} ${sx * 60},${hy - 44}" stroke="#7a88a4" stroke-width="2.4" fill="none"/>`;
  }
  // nose
  o += `<path d="M-14,${hy + 4} C-34,${hy + 16} -30,${hy + 40} -10,${hy + 42} C-4,${hy + 46} 4,${hy + 46} 10,${hy + 42} C30,${hy + 40} 34,${hy + 16} 14,${hy + 4} C6,${hy - 4} -6,${hy - 4} -14,${hy + 4} Z" fill="#e8895c" ${ol(3.2)}/><ellipse cx="-4" cy="${hy + 10}" rx="9" ry="6" fill="#ffd0a8" opacity=".7"/><path d="M-12,${hy + 38} q4,4 8,0 M4,${hy + 38} q4,4 8,0" stroke="#8a3a20" stroke-width="2.4" fill="none"/>`;
  // open grin
  o += `<path d="M-30,${hy + 46} C-26,${hy + 86} 26,${hy + 86} 30,${hy + 46} C14,${hy + 54} -14,${hy + 54} -30,${hy + 46} Z" fill="#3a0a10" ${ol(3.2)}/><path d="M-26,${hy + 49} C-12,${hy + 55} 12,${hy + 55} 26,${hy + 49} L24,${hy + 60} C10,${hy + 64} -10,${hy + 64} -24,${hy + 60} Z" fill="#fffdf4"/><path d="M-16,${hy + 76} C-8,${hy + 66} 8,${hy + 66} 16,${hy + 76} C10,${hy + 82} -10,${hy + 82} -16,${hy + 76} Z" fill="#e0505a"/><path d="M0,${hy + 54} V${hy + 62}" stroke="#c8b8a0" stroke-width="2"/>`;
  // moustache
  for (const sx of [-1, 1]) o += `<path d="M0,${hy + 38} C${sx * 22},${hy + 28} ${sx * 54},${hy + 30} ${sx * 82},${hy + 56} C${sx * 100},${hy + 76} ${sx * 82},${hy + 96} ${sx * 62},${hy + 86} C${sx * 46},${hy + 76} ${sx * 36},${hy + 56} ${sx * 18},${hy + 50} C${sx * 8},${hy + 48} 0,${hy + 48} 0,${hy + 44} Z" fill="url(#beard)" ${ol(3.2)}/><path d="M${sx * 20},${hy + 40} C${sx * 44},${hy + 40} ${sx * 66},${hy + 56} ${sx * 78},${hy + 76}" stroke="#7a88a4" stroke-width="2.4" fill="none" opacity=".8"/>`;
  // sideburns
  for (const sx of [-1, 1]) o += `<path d="M${sx * 70},${hy - 26} C${sx * 90},${hy - 6} ${sx * 92},${hy + 30} ${sx * 82},${hy + 56} C${sx * 70},${hy + 30} ${sx * 66},${hy} ${sx * 66},${hy - 26} Z" fill="url(#beard)" ${ol(3)}/>`;
  // helmet
  o += `<ellipse cx="0" cy="${hy - 92}" rx="150" ry="120" fill="url(#lampGlow)" opacity=".55"/>`;
  for (const sx of [-1, 1]) o += `<g transform="scale(${sx} 1)"><path d="M70,${hy - 66} C104,${hy - 78} 140,${hy - 98} 150,${hy - 142} C154,${hy - 164} 150,${hy - 178} 142,${hy - 188} C150,${hy - 150} 134,${hy - 120} 96,${hy - 100} C82,${hy - 94} 70,${hy - 90} 62,${hy - 88} Z" fill="#f1e4c4" ${ol(3.5)}/><path d="M100,${hy - 90} C128,${hy - 104} 144,${hy - 134} 142,${hy - 170}" stroke="#a08a5c" stroke-width="3" fill="none" opacity=".7"/><path d="M80,${hy - 76} C108,${hy - 90} 134,${hy - 110} 144,${hy - 140}" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/><path d="M62,${hy - 94} L96,${hy - 100} L98,${hy - 68} L68,${hy - 62} Z" fill="url(#gold)" ${ol(3)}/></g>`;
  o += `<path d="M-82,${hy - 50} C-92,${hy - 128} -50,${hy - 170} 0,${hy - 172} C50,${hy - 170} 92,${hy - 128} 82,${hy - 50} Z" fill="url(#steel)" ${ol(4)}/>`;
  o += `<path d="M-70,${hy - 84} C-62,${hy - 132} -34,${hy - 156} -6,${hy - 162}" stroke="#fff" stroke-width="5" fill="none" opacity=".65" stroke-linecap="round"/>`;
  o += `<path d="M-20,${hy - 172} L20,${hy - 172} L26,${hy - 52} L-26,${hy - 52} Z" fill="url(#gold)" ${ol(3.2)}/><path d="M-8,${hy - 168} L-10,${hy - 56}" stroke="#fff8c0" stroke-width="3.5" opacity=".7"/>`;
  o += `<path d="M-88,${hy - 56} C-40,${hy - 70} 40,${hy - 70} 88,${hy - 56} L90,${hy - 38} C40,${hy - 50} -40,${hy - 50} -90,${hy - 38} Z" fill="url(#goldH)" ${ol(3.6)}/>`;
  for (const x of [-64, -34, 34, 64]) o += `<circle cx="${x}" cy="${hy - 54}" r="4.2" fill="#fff4b8" ${ol(1.6)}/>`;
  // lamp
  o += `<g transform="translate(0 ${hy - 104})"><circle r="62" fill="url(#lampGlow)"/><circle r="26" fill="url(#steelD)" ${ol(3.6)}/><circle r="19" fill="url(#gold)" ${ol(3)}/><circle r="13" fill="#fffbe6"/>${spark(0, 0, 40, .9)}</g>`;
  return o;
};

// cart
const cart = () => {
  let o = '';
  const ol = (w = 3.5) => `stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  o += `<ellipse cx="0" cy="238" rx="360" ry="22" fill="#000" opacity=".5"/>`;
  // wheels (behind body)
  const wheel = x => `<g transform="translate(${x} 188)"><circle r="56" fill="#1a1420" ${ol(4)}/><circle r="48" fill="url(#steelD)" ${ol(3)}/><circle r="38" fill="none" stroke="#9aa6bc" stroke-width="3" opacity=".6"/>${[0, 45, 90, 135].map(a => `<rect x="-5" y="-40" width="10" height="80" fill="#2a3244" ${ol(2)} transform="rotate(${a})"/>`).join('')}<circle r="17" fill="url(#gold)" ${ol(3)}/><circle r="7" fill="#7a3e10"/><path d="M-36,-26 A44,44 0 0 1 -6,-44" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
  o += wheel(-190) + wheel(190);
  // body
  o += `<path d="M-312,-4 L312,-4 L270,176 L-270,176 Z" fill="url(#wood)" ${ol(4)}/>`;
  for (const y of [40, 80, 120]) o += `<path d="M${-312 + (y + 4) * .233},${y} L${312 - (y + 4) * .233},${y}" stroke="#2e170a" stroke-width="3" opacity=".75"/>`;
  for (let i = 0; i < 9; i++) { const y = 10 + i * 18; o += `<path d="M${-300 + i * 4},${y + 4} q60,-4 120,0 M${-60 + i * 7},${y + 10} q80,-3 160,1" stroke="#e0a560" stroke-width="2" opacity=".28" fill="none"/>`; }
  // iron bands
  for (const x of [-210, 0, 210]) { const k = x * .12; o += `<path d="M${x - 24 - k * .1},-4 L${x + 24 - k * .1},-4 L${x + 20 - k * .35},176 L${x - 20 - k * .35},176 Z" fill="url(#steelD)" ${ol(3.2)}/>`; for (const y of [24, 90, 150]) o += `<circle cx="${x - k * (.1 + y / 500)}" cy="${y}" r="5.5" fill="url(#steel)" ${ol(1.8)}/>`; }
  // gold stripe emblem plate
  o += `<g transform="translate(0 94)"><path d="M-70,-24 L70,-24 L78,0 L70,24 L-70,24 L-78,0 Z" fill="url(#steelD)" ${ol(3.4)}/><path d="M-58,-16 L58,-16 L64,0 L58,16 L-58,16 L-64,0 Z" fill="#2a1630" ${ol(2)}/><text x="0" y="9" text-anchor="middle" font-family="RR" font-weight="900" font-size="23" fill="url(#gold)" stroke="${OUT}" stroke-width="1" letter-spacing="2">RR</text></g>`;
  // base rail
  o += `<rect x="-290" y="166" width="580" height="22" rx="6" fill="url(#steelD)" ${ol(3.5)}/><path d="M-260,168 H260" stroke="#c0cce0" stroke-width="2.4" opacity=".5"/>`;
  // coupling
  o += `<rect x="-350" y="164" width="60" height="14" rx="5" fill="url(#steelD)" ${ol(3)}/><circle cx="-352" cy="171" r="11" fill="none" stroke="#9aa6bc" stroke-width="5"/>`;
  return o;
};
const cartRim = () => {
  const ol = (w = 3.5) => `stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  let o = `<rect x="-322" y="-20" width="644" height="30" rx="12" fill="url(#steel)" ${ol(4)}/><path d="M-306,-13 H306" stroke="#fff" stroke-width="3.2" opacity=".6"/>`;
  for (let x = -290; x <= 290; x += 58) o += `<circle cx="${x}" cy="-5" r="4.6" fill="#2a3244" ${ol(1.6)}/>`;
  return o;
};
// load in the cart: gold piles + gems
let load = '';
load += heap(-200, -4, 250, 96, 62, 25);
load += heap(205, -4, 250, 120, 78, 26);
load += heap(0, -2, 200, 54, 26, 22);
// a couple of gems in the load
const smallGem = (x, y, col, lite, s) => `<g transform="translate(${x} ${y}) scale(${s})"><polygon points="-34,-8 -18,-30 18,-30 34,-8 0,36" fill="${col}" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><polygon points="-18,-30 18,-30 6,-8 -6,-8" fill="#fff" opacity=".6"/><polygon points="-34,-8 -6,-8 0,36" fill="${lite}" opacity=".5"/></g>`;
load += smallGem(150, -92, '#2fcf5a', '#9bffb0', .5) + smallGem(-250, -40, '#e0283a', '#ff9aa0', .42) + smallGem(246, -82, '#2f8cf0', '#a8dcff', .46);
load += spark(-210, -86, 14) + spark(230, -126, 18) + spark(-120, -40, 10);

const rig = `<g transform="translate(${CX} ${CY}) rotate(${f(cartAng * .7)})">
  <g>${cart()}</g>
  <g transform="scale(1.02) translate(0 6)">${dwarf()}</g>
  <g transform="scale(1.02) translate(0 6)">${dwarfHead()}</g>
  <g>${cartRim()}</g>
  <g>${load}</g>
</g>`;
// rim sits on top of dwarf arms; but hands must grip rim -> re-draw left fist after rim
fg += rig;

// speed streaks + dust sparks near cart
for (let i = 0; i < 30; i++) {
  const x = R(60, 1000), y = R(560, 860);
  fg += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R(1, 3))}" fill="#ffe8a0" opacity="${f(R(.25, .7))}"/>`;
}
for (let i = 0; i < 6; i++) { const x = CX - 360 - i * 30, y = CY + 200 - i * 6 + R(-6, 6); fg += `<path d="M${f(x)},${f(y)} l-${f(R(40, 80))},${f(R(-2, 2))}" stroke="#ffe8a0" stroke-width="2.4" opacity="${f(.4 - i * .05)}" stroke-linecap="round"/>`; }

// floating dust motes in the glow
for (let i = 0; i < 40; i++) { const x = R(700, 1400), y = R(180, 560); fg += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R(.8, 2.4))}" fill="#fff0b0" opacity="${f(R(.2, .7))}"/>`; }
// vignette
fg += `<rect width="1600" height="900" fill="url(#vig)"/>`;

// ---------- 10. logo ----------
const logo = () => {
  let o = `<g transform="translate(800 0)">`;
  grad('lgFill', [[0, '#fffbe6'], [.28, '#ffe08a'], [.6, '#f0a22c'], [1, '#a8581a']]);
  rad('lgGlow', [[0, '#ffb23a', .5], [1, '#ffb23a', 0]]);
  grad('lgRib', [[0, '#5a0e12'], [.5, '#b0261c'], [1, '#e04a2a']], 0, 0, 1, 0);
  o += `<ellipse cx="0" cy="88" rx="470" ry="86" fill="url(#lgGlow)"/>`;
  // ribbon behind RUN
  o += `<path d="M-250,128 L-206,124 L-206,168 L-250,172 L-232,150Z" fill="#3a0a0c" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/><path d="M250,128 L206,124 L206,168 L250,172 L232,150Z" fill="#3a0a0c" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>`;
  o += `<path d="M-214,118 Q0,106 214,118 L214,162 Q0,152 -214,162 Z" fill="url(#lgRib)" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><path d="M-206,122 Q0,111 206,122" fill="none" stroke="#ffd070" stroke-width="2.4" opacity=".85"/><path d="M-206,158 Q0,148 206,158" fill="none" stroke="#ffd070" stroke-width="2" opacity=".6"/>`;
  const T = (y, size, ls, str) => `<text x="0" y="${y}" font-family="RR" font-weight="900" text-anchor="middle" font-size="${size}" letter-spacing="${ls}"`;
  o += `${T(100, 100, 2)} fill="#1a0408" opacity=".6" transform="translate(3 7)">RATTLEROCK</text>`;
  o += `${T(100, 100, 2)} fill="url(#lgFill)" stroke="#5a1408" stroke-width="9" paint-order="stroke" stroke-linejoin="round">RATTLEROCK</text>`;
  o += `${T(100, 100, 2)} fill="none" stroke="#fff3b0" stroke-width="1.2" opacity=".8" stroke-linejoin="round" transform="translate(0 -1.5)">RATTLEROCK</text>`;
  o += `${T(152, 46, 22)} fill="#1a0408" opacity=".6" transform="translate(2 3)">RUN</text>`;
  o += `${T(152, 46, 22)} fill="url(#lgFill)" stroke="#2a0808" stroke-width="5" paint-order="stroke" stroke-linejoin="round">RUN</text>`;
  // crossed picks left/right of ribbon
  for (const sx of [-1, 1]) o += `<g transform="translate(${sx * 270} 146) scale(${sx} 1)"><rect x="-4" y="-34" width="8" height="70" rx="3" fill="url(#wood)" stroke="${OUT}" stroke-width="2.4" transform="rotate(-30)"/><rect x="-4" y="-34" width="8" height="70" rx="3" fill="url(#wood)" stroke="${OUT}" stroke-width="2.4" transform="rotate(30)"/><path d="M-26,-30 Q0,-44 26,-30 Q10,-34 0,-34 Q-10,-34 -26,-30Z" fill="url(#steel)" stroke="${OUT}" stroke-width="2.4"/></g>`;
  // gems on the ribbon ends
  o += `<g transform="translate(-318 98) scale(.5)">${gem('#2f8cf0', '#a8dcff', '#123c9a', '', '#6ac8ff').replace(/<g transform="translate\(0 52\)">[\s\S]*<\/g>$/, '')}</g><g transform="translate(318 98) scale(.5)">${gem('#e0283a', '#ff9aa0', '#7a0c1c', '', '#ff6070').replace(/<g transform="translate\(0 52\)">[\s\S]*<\/g>$/, '')}</g>`;
  o += spark(-420, 40, 14, .85) + spark(430, 56, 11, .8) + spark(-300, 30, 8, .7) + spark(350, 28, 10, .75);
  o += `</g>`;
  return o;
};
ui += logo();

// ---------- 11. game UI ----------
const gauge = () => {
  const cx = 150, cy = 775, Rr = 96;
  let o = `<g>`;
  o += `<ellipse cx="${cx}" cy="${cy + 8}" rx="130" ry="118" fill="#000" opacity=".4"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${Rr + 14}" fill="url(#gold)" stroke="${OUT}" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="${Rr + 4}" fill="#4a2410" stroke="${OUT}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${Rr - 4}" fill="#120a24" stroke="${OUT}" stroke-width="3"/>`;
  rad('gFace', [[0, '#2a2060'], [1, '#0a0618']]);
  o += `<circle cx="${cx}" cy="${cy}" r="${Rr - 8}" fill="url(#gFace)"/>`;
  // arc ticks
  const ang = v => (-215 + v * 250) * Math.PI / 180; // 250 deg sweep
  const marks = [['x1', 0, '#ffe9a0'], ['x2', .25, '#5dff8a'], ['x3', .5, '#6ac8ff'], ['x5', .75, '#ff7080'], ['x10', 1, '#ffd040']];
  for (let i = 0; i <= 20; i++) { const a = ang(i / 20), big = i % 5 === 0; o += `<path d="M${f(cx + Math.cos(a) * (Rr - 12))},${f(cy + Math.sin(a) * (Rr - 12))} L${f(cx + Math.cos(a) * (Rr - (big ? 28 : 21)))},${f(cy + Math.sin(a) * (Rr - (big ? 28 : 21)))}" stroke="${big ? '#ffe9a0' : '#8a7aa8'}" stroke-width="${big ? 3.4 : 1.8}" stroke-linecap="round"/>`; }
  for (const [lab, v, col] of marks) { const a = ang(v); o += `<text x="${f(cx + Math.cos(a) * (Rr - 44))}" y="${f(cy + Math.sin(a) * (Rr - 44) + 6)}" text-anchor="middle" font-family="RR" font-weight="900" font-size="${lab.length > 2 ? 14 : 16}" fill="${col}" stroke="${OUT}" stroke-width="2.6" paint-order="stroke">${lab}</text>`; }
  // arc glow zone
  const a0 = ang(0), a1 = ang(.04);
  o += `<path d="M${f(cx + Math.cos(a0) * (Rr - 14))},${f(cy + Math.sin(a0) * (Rr - 14))} A${Rr - 14},${Rr - 14} 0 0 1 ${f(cx + Math.cos(a1) * (Rr - 14))},${f(cy + Math.sin(a1) * (Rr - 14))}" stroke="#ffd25a" stroke-width="6" fill="none"/>`;
  // needle at x1
  const na = ang(.0);
  o += `<g transform="translate(${cx} ${cy}) rotate(${f(na * 180 / Math.PI)})"><path d="M-12,-5 L${Rr - 30},-2 L${Rr - 30},2 L-12,5 Z" fill="#ff4a3a" stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"/></g>`;
  o += `<circle cx="${cx}" cy="${cy}" r="14" fill="url(#gold)" stroke="${OUT}" stroke-width="3"/><circle cx="${cx - 3}" cy="${cy - 3}" r="4" fill="#fff" opacity=".8"/>`;
  // glass shine
  o += `<path d="M${cx - 70},${cy - 40} A80,80 0 0 1 ${cx + 10},${cy - 80}" stroke="#fff" stroke-width="5" opacity=".28" fill="none" stroke-linecap="round"/>`;
  // plaque
  o += `<g transform="translate(${cx} ${cy + 86})"><path d="M-82,-18 L82,-18 L92,0 L82,22 L-82,22 L-92,0 Z" fill="url(#lgRib)" stroke="${OUT}" stroke-width="4" stroke-linejoin="round" fill-opacity=".0"/><path d="M-82,-18 L82,-18 L92,2 L82,22 L-82,22 L-92,2 Z" fill="#1c0e2c" stroke="url(#gold)" stroke-width="4" stroke-linejoin="round"/><text x="-40" y="9" text-anchor="middle" font-family="RR" font-weight="900" font-size="15" fill="#ffd9a0" letter-spacing="1">MULTI</text><text x="40" y="12" text-anchor="middle" font-family="RR" font-weight="900" font-size="30" fill="url(#lgFill)" stroke="${OUT}" stroke-width="4" paint-order="stroke">x1</text></g>`;
  o += `</g>`;
  return o;
};
const loadCounter = () => {
  const x = 1300, y = 780;
  let o = `<g transform="translate(${x} ${y})">`;
  o += `<ellipse cx="130" cy="52" rx="160" ry="30" fill="#000" opacity=".45"/>`;
  o += `<path d="M0,10 L20,-10 L240,-10 L262,10 L262,70 L240,90 L20,90 L0,70 Z" fill="url(#wood)" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>`;
  o += `<path d="M10,16 L24,2 L236,2 L252,16 L252,64 L236,80 L24,80 L10,64 Z" fill="#1a0e22" stroke="url(#gold)" stroke-width="5" stroke-linejoin="round"/>`;
  o += `<text x="132" y="28" text-anchor="middle" font-family="RR" font-weight="900" font-size="16" fill="#ffd9a0" letter-spacing="6">LOAD</text>`;
  o += `<g transform="translate(46 54) scale(.9)">${nugget(0, 0, 20, -10)}${nugget(14, 8, 12, 20)}</g>`;
  o += `<text x="158" y="68" text-anchor="middle" font-family="RR" font-weight="900" font-size="38" fill="url(#lgFill)" stroke="${OUT}" stroke-width="5" paint-order="stroke" stroke-linejoin="round">12.50</text>`;
  o += `<circle cx="-4" cy="40" r="6" fill="url(#steel)" stroke="${OUT}" stroke-width="2"/><circle cx="266" cy="40" r="6" fill="url(#steel)" stroke="${OUT}" stroke-width="2"/>`;
  o += `</g>`;
  return o;
};
ui += gauge() + loadCounter();

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Rattlerock Run - look test</title>
<style>@font-face{font-family:RR;font-weight:900;src:url(data:font/woff2;base64,${FONT}) format('woff2')}
html,body{margin:0;background:#07040f}body{width:1600px;height:900px;overflow:hidden}svg{display:block}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs>${defs}</defs>
<g id="bg">${bg}</g><g id="mid">${mid}</g><g id="fg">${fg}</g><g id="ui">${ui}</g></svg></body></html>`;
fs.writeFileSync(__dirname + '/look.html', html);
console.log('ok', html.length, 'cartAng', cartAng.toFixed(1));
