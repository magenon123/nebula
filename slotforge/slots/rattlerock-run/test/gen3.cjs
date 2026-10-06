// RATTLEROCK RUN look-test generator (leo). Output: look.html (self-contained 1600x900 SVG scene)
const fs = require('fs');
const FONT2 = fs.readFileSync(__dirname + '/../../cloudtop-tea-house/art/fonts/LilitaOne.sub.woff2').toString('base64');
const FONT = fs.readFileSync(__dirname + '/../../siroccos-lamp-bazaar/art/fonts/cinzel-decorative-latin-900-normal.woff2').toString('base64');
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const R = (a, b) => a + (b - a) * rnd();
const f = n => +n.toFixed(1);
const lerp = (a, b, t) => a + (b - a) * t;
const OUT = '#1c0f08';

// ---------- track centreline (door -> viewer) ----------
const P0 = [1090, 352], P1 = [1170, 440], P2 = [830, 560], P3 = [330, 800];
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
mid += heap(1290, 800, 440, 190, 150, 25);
mid += heap(1160, 780, 190, 80, 40, 17);
// sparkles on the pile
const spark = (x, y, r, o = 1) => `<path d="M${x},${y - r} Q${x + r * .12},${y - r * .12} ${x + r},${y} Q${x + r * .12},${y + r * .12} ${x},${y + r} Q${x - r * .12},${y + r * .12} ${x - r},${y} Q${x - r * .12},${y - r * .12} ${x},${y - r} Z" fill="#fff8d0" opacity="${o}"/>`;
const tag = (txt, col, s) => {
  const w = Math.max(44, 15 * String(txt).length + 32) * s, h = 24 * s;
  return `<g><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h / 2)}" fill="#160c24" stroke="${col}" stroke-width="${f(2.2 * s)}"/><text x="0" y="${f(h * .3)}" text-anchor="middle" font-family="RN" font-size="${f(h * .8)}" fill="#fff6d0">${txt}</text></g>`;
};
const gem = (col, lite, dark, txt, glow) => `
  <circle r="48" fill="${glow}" opacity=".26"/><circle r="38" fill="${glow}" opacity=".3"/>
  <polygon points="-34,-8 -18,-30 18,-30 34,-8 0,36" fill="${col}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
  <polygon points="-34,-8 -18,-30 -6,-8" fill="${lite}"/><polygon points="-18,-30 18,-30 6,-8 -6,-8" fill="#fff" opacity=".7"/><polygon points="18,-30 34,-8 6,-8" fill="${lite}" opacity=".8"/>
  <polygon points="-34,-8 -6,-8 0,36" fill="${lite}" opacity=".55"/><polygon points="34,-8 6,-8 0,36" fill="${dark}" opacity=".7"/><polygon points="-6,-8 6,-8 0,36" fill="${col}"/>
  <path d="M-34,-8 L34,-8" stroke="${OUT}" stroke-width="2" opacity=".55"/><path d="M-26,-20 L-14,-26" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  <g transform="translate(0 ${globalThis.TY || 74})">${tag(txt, lite, 1.3)}</g>`;
const items = {
  nugget: () => `<circle r="56" fill="#ffc83a" opacity=".22"/>${nugget(0, 0, 36, -10)}${nugget(-22, 14, 20, 20)}${nugget(22, 16, 22, -30)}<g transform="translate(0 ${globalThis.TY || 74})">${tag('+LOAD', '#ffd25a', 1.4)}</g>${spark(30, -30, 12)}`,
  green: () => gem('#2fcf5a', '#9bffb0', '#0c6a30', 'x2', '#5dff8a'),
  blue: () => gem('#2f8cf0', '#a8dcff', '#123c9a', 'x3', '#6ac8ff'),
  red: () => gem('#e0283a', '#ff9aa0', '#7a0c1c', 'x5', '#ff6070'),
  hat: () => `<ellipse cx="0" cy="-4" rx="62" ry="50" fill="#ffc83a" opacity=".16"/>
    <path d="M-44,10 C-44,-34 -22,-44 0,-44 C22,-44 44,-34 44,10 Z" fill="#ffc22e" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M-44,10 C-44,-34 -22,-44 0,-44 C-14,-30 -20,-10 -18,10 Z" fill="#fff0a0" opacity=".6"/>
    <path d="M-8,-44 L8,-44 L10,10 L-10,10 Z" fill="#e89a10" stroke="${OUT}" stroke-width="2.5"/>
    <path d="M-60,10 Q0,2 60,10 Q62,24 50,24 L-50,24 Q-62,24 -60,10 Z" fill="#e08a14" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="0" cy="-18" r="9" fill="#fff6c0" stroke="${OUT}" stroke-width="2.5"/><circle cx="0" cy="-18" r="4" fill="#fff"/>
    <g transform="translate(0 ${globalThis.TY || 74})">${tag('SHIELD', '#7ee4ff', 1.45)}</g>`,
  tnt: () => `<ellipse cx="0" cy="0" rx="66" ry="52" fill="#ff5030" opacity=".18"/>
    <rect x="-40" y="-26" width="80" height="58" rx="4" fill="#c42a1c" stroke="${OUT}" stroke-width="3.5"/>
    <rect x="-40" y="-26" width="80" height="14" fill="#e85a40" opacity=".7"/>
    <g stroke="#6a1008" stroke-width="2.5"><path d="M-14,-26 V32 M14,-26 V32"/></g>
    <rect x="-40" y="-6" width="80" height="22" fill="#f6e2b0" stroke="${OUT}" stroke-width="3"/>
    <text x="0" y="12" text-anchor="middle" font-family="RN" font-size="21" fill="#2a0a06">TNT</text>
    <path d="M0,-26 C-4,-44 14,-46 16,-60" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M0,-26 C-4,-44 14,-46 16,-60" fill="none" stroke="#d9c08a" stroke-width="2" stroke-linecap="round"/>
    <circle cx="16" cy="-64" r="16" fill="#ff9a20" opacity=".7"/><path d="M16,-82 L20,-68 L33,-64 L20,-60 L16,-46 L12,-60 L-1,-64 L12,-68 Z" fill="#fff2a0" stroke="#ff7a10" stroke-width="2"/>
    <g transform="translate(0 ${globalThis.TY || 76})">${tag('TNT', '#ff6a50', 1.35)}</g>`,
};
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
  globalThis.__fist = fist;
  o += limb('M-146,-196 C-212,-176 -262,-110 -250,-34', 54, 'url(#steel)');
  o += `<path d="M-282,-64 L-226,-48" stroke="url(#gold)" stroke-width="16" stroke-linecap="round"/>`;
  o += limb('M146,-196 C212,-176 262,-110 250,-34', 54, 'url(#steel)');
  o += `<path d="M282,-64 L226,-48" stroke="url(#gold)" stroke-width="16" stroke-linecap="round"/>`;
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
  o += `<g transform="translate(0 ${hy + 196})"><ellipse rx="40" ry="12" fill="url(#gold)" ${ol(3)}/><ellipse rx="32" ry="7" fill="#9aa6bc" opacity=".6"/></g>`;
  // ears
  for (const sx of [-1, 1]) o += `<ellipse cx="${sx * 74}" cy="${hy + 6}" rx="13" ry="20" fill="#d9825a" ${ol(3)}/>`;
  // face
  o += `<path d="M-72,${hy - 14} C-76,${hy - 60} -40,${hy - 70} 0,${hy - 70} C40,${hy - 70} 76,${hy - 60} 72,${hy - 14} C72,${hy + 40} 40,${hy + 62} 0,${hy + 62} C-40,${hy + 62} -72,${hy + 40} -72,${hy - 14} Z" fill="url(#skin)" ${ol(3.5)}/>`;
  o += `<ellipse cx="-44" cy="${hy + 18}" rx="22" ry="14" fill="#ff7a6a" opacity=".42"/><ellipse cx="44" cy="${hy + 18}" rx="22" ry="14" fill="#ff7a6a" opacity=".42"/>`;
  // eyes (wide, excited)
  for (const sx of [-1, 1]) {
    o += `<g transform="translate(${sx * 31} ${hy - 12})"><ellipse rx="19" ry="17" fill="#fffaf0" ${ol(3)}/><circle cx="5" cy="1" r="10.5" fill="#6a3a14"/><circle cx="5" cy="1" r="6" fill="#1a0a04"/><circle cx="9" cy="-4" r="4" fill="#fff"/><circle cx="3" cy="5" r="1.8" fill="#fff" opacity=".8"/></g>`;
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
  o += `<g transform="translate(0 ${hy - 104})"><circle r="62" fill="url(#lampGlow)"/><circle r="26" fill="url(#steelD)" ${ol(3.6)}/><circle r="19" fill="url(#gold)" ${ol(3)}/><circle r="13" fill="#fffbe6"/>${spark(0, 0, 30, .8)}</g>`;
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
  o += `<g transform="translate(0 94)"><path d="M-70,-24 L70,-24 L78,0 L70,24 L-70,24 L-78,0 Z" fill="url(#steelD)" ${ol(3.4)}/><path d="M-58,-16 L58,-16 L64,0 L58,16 L-58,16 L-64,0 Z" fill="#2a1630" ${ol(2)}/><text x="0" y="9" text-anchor="middle" font-family="RN" font-size="25" fill="url(#gold)" stroke="${OUT}" stroke-width="1" letter-spacing="2">RR</text></g>`;
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

// ================= look3: new hero, open cavern vista, tileable mid/near =================
grad('lgFill', [[0, '#fffbe6'], [.28, '#ffe08a'], [.6, '#f0a22c'], [1, '#a8581a']]);
grad('beam', [[0, '#fff0b0', .34], [1, '#fff0b0', 0]], 0, 0, 1, 0);
grad('floor2', [[0, '#4a3022'], [1, '#0e0a18']]);
grad('sky3', [[0, '#080620'], [.45, '#10204a'], [.75, '#14405e'], [1, '#0a2a44']]);
rad('coolBloom', [[0, '#4aa8ff', .3], [1, '#4aa8ff', 0]]);
grad('lake', [[0, '#35d8d0'], [.18, '#168aa8'], [.6, '#0b4466'], [1, '#06223c']]);
grad('haze', [[0, '#5aa8d8', 0], [.5, '#5aa8d8', .28], [1, '#5aa8d8', 0]]);
grad('tealJ', [[0, '#3cc4b4'], [.45, '#18868a'], [1, '#0b4552']]);
grad('tealD', [[0, '#1f8a8a'], [1, '#0a3844']]);
grad('hat', [[0, '#ffe05a'], [.4, '#ffb21e'], [.8, '#e0780e'], [1, '#9a420a']]);
grad('copper', [[0, '#ffa650'], [.45, '#d4601e'], [1, '#7a2a10']]);
grad('skin3', [[0, '#f8bc92'], [.55, '#e0905e'], [1, '#b0603c']]);
grad('glove', [[0, '#c68844'], [.6, '#8a5224'], [1, '#4a2a12']]);
grad('scarf', [[0, '#ffa03a'], [1, '#d2501a']]);
grad('glass', [[0, '#c8fff6'], [.5, '#4ac8d8'], [1, '#1a6a9a']]);
const RAIL = 718;

// ---------- the hero: young rugged dwarf miner, 3/4 view facing right ----------
const dw3 = () => {
  const ol = (w = 3.4) => `stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  let o = '';
  // scarf tail streaming back
  o += `<path d="M-10,-196 C-50,-200 -90,-176 -128,-190 C-112,-170 -96,-160 -70,-156 C-96,-146 -110,-130 -124,-120 C-80,-120 -40,-140 -4,-168 Z" fill="url(#scarf)" ${ol()}/><path d="M-60,-186 C-84,-182 -100,-176 -118,-184" stroke="#ffd080" stroke-width="3" fill="none" opacity=".7"/>`;
  // far arm (darker)
  const limb = (d, w, col) => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${w + 7}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += limb('M74,-196 L158,-128', 50, '#0f5a66') + limb('M160,-126 L196,-62', 40, '#b8683e');
  o += `<path d="M146,-142 L172,-114" stroke="#0a3844" stroke-width="12" stroke-linecap="round"/>`;
  // torso: teal work jacket, leaning
  o += `<path d="M-74,-44 C-98,-110 -88,-176 -44,-210 C-8,-234 44,-238 76,-218 C106,-198 118,-156 104,-104 L92,-44 Z" fill="url(#tealJ)" ${ol(3.8)}/>`;
  o += `<path d="M-66,-120 C-72,-160 -52,-196 -22,-212 C0,-222 30,-226 52,-222" fill="none" stroke="#9cf0e0" stroke-width="5" opacity=".55" stroke-linecap="round"/>`;
  o += `<path d="M-30,-160 C-36,-130 -34,-90 -28,-52 M20,-110 C26,-90 26,-70 24,-50" fill="none" stroke="#06303c" stroke-width="3" opacity=".5"/>`;
  // collar (up)
  o += `<path d="M40,-232 C70,-246 104,-236 112,-212 L100,-196 C80,-214 62,-216 44,-206 Z" fill="url(#tealD)" ${ol(3.4)}/>`;
  // leather chest strap + brass buckles
  o += `<path d="M30,-232 L-8,-52 L16,-52 L58,-226 Z" fill="url(#leather)" ${ol(3)}/><path d="M42,-222 L6,-60" stroke="#c89060" stroke-width="2" stroke-dasharray="5 4" opacity=".7"/>`;
  o += `<rect x="12" y="-166" width="30" height="24" rx="4" fill="url(#gold)" ${ol(2.6)} transform="rotate(10 27 -154)"/><rect x="20" y="-160" width="14" height="12" rx="2" fill="#5a2e0c" transform="rotate(10 27 -154)"/>`;
  // chest pocket
  o += `<path d="M62,-168 L102,-166 L100,-132 L80,-124 L62,-132 Z" fill="#1a7a80" ${ol(3)}/><circle cx="81" cy="-146" r="5" fill="url(#gold)" ${ol(1.8)}/><path d="M64,-160 H100" stroke="#06303c" stroke-width="2.4" opacity=".5"/>`;
  // belt
  o += `<path d="M-76,-70 L96,-70 L94,-44 L-74,-44 Z" fill="url(#leather)" ${ol(3.2)}/><rect x="24" y="-76" width="34" height="38" rx="5" fill="url(#gold)" ${ol(3)}/><rect x="32" y="-68" width="18" height="22" rx="2" fill="#5a2e0c" ${ol(1.6)}/>`;
  // scarf wrap at neck
  o += `<path d="M10,-214 C40,-190 90,-186 118,-210 L124,-188 C92,-166 40,-168 6,-190 Z" fill="url(#scarf)" ${ol(3.4)}/><path d="M26,-196 C56,-182 90,-182 112,-196" stroke="#ffd080" stroke-width="3" fill="none" opacity=".7"/><path d="M80,-180 C84,-160 78,-146 86,-132 L102,-134 C96,-150 102,-166 100,-184 Z" fill="url(#scarf)" ${ol(3)}/>`;
  // ---------- head (3/4 right) ----------
  o += `<g transform="translate(100 -275)">`;
  // ear + neck
  o += `<path d="M-30,30 L44,40 L54,96 L-40,96 Z" fill="#c8764c" ${ol(3.2)}/>`;
  o += `<ellipse cx="-40" cy="2" rx="11" ry="16" fill="url(#skin3)" ${ol(3)}/><path d="M-42,-6 C-36,0 -38,8 -42,12" stroke="#a8583a" stroke-width="2.4" fill="none"/>`;
  // hair tuft at back
  o += `<path d="M-60,-34 C-72,-6 -62,26 -44,40 C-46,10 -44,-14 -40,-34 Z" fill="url(#copper)" ${ol(3)}/>`;
  // face
  o += `<path d="M-46,-40 C-20,-58 30,-56 52,-34 L56,-16 C68,-6 78,6 74,16 C72,24 62,27 56,27 L54,42 C56,54 50,64 40,68 L-10,66 C-36,62 -52,32 -50,0 Z" fill="url(#skin3)" ${ol(3.6)}/>`;
  o += `<ellipse cx="8" cy="26" rx="30" ry="16" fill="#a8583a" opacity=".28"/><ellipse cx="30" cy="2" rx="16" ry="6" fill="#ffe0c0" opacity=".55" transform="rotate(-14 30 2)"/>`;
  // soot smudge + scar
  o += `<ellipse cx="2" cy="20" rx="14" ry="6.5" fill="#2a1a14" opacity=".5" transform="rotate(-24 2 20)"/><path d="M34,2 L46,12" stroke="#d4607a" stroke-width="3" stroke-linecap="round"/><path d="M36,8 l4,-4 M42,12 l4,-4" stroke="#7a2a30" stroke-width="1.8"/>`;
  // beard (copper, short + thick) with braids
  o += `<path d="M-50,-4 C-64,34 -44,78 4,90 C38,98 68,80 66,54 C64,42 56,36 48,36 C40,44 24,40 14,34 C-6,26 -32,12 -50,-4 Z" fill="url(#copper)" ${ol(3.6)}/>`;
  o += `<g fill="none" stroke="#7a2a10" stroke-width="2.6" stroke-linecap="round" opacity=".75"><path d="M-36,20 C-34,44 -22,66 -4,80"/><path d="M-14,28 C-12,50 -2,70 14,84"/><path d="M12,40 C14,58 22,74 34,86"/><path d="M40,46 C44,60 50,72 56,76"/></g><path d="M-44,14 C-40,40 -26,62 -6,74" stroke="#ffcf90" stroke-width="3.4" fill="none" opacity=".55" stroke-linecap="round"/>`;
  for (const [bx, by] of [[10, 88], [40, 88]]) {
    for (let k = 0; k < 4; k++) o += `<path d="M${bx},${by + k * 17} c-11,6 -11,14 0,19 c11,-5 11,-13 0,-19 Z" fill="url(#copper)" ${ol(2.6)}/><path d="M${bx - 4},${by + k * 17 + 4} c4,3 4,8 0,12" stroke="#ffcf90" stroke-width="2" fill="none" opacity=".7"/>`;
    o += `<ellipse cx="${bx}" cy="${by + 5}" rx="11.5" ry="5.6" fill="url(#gold)" ${ol(2.4)}/>`;
    o += `<path d="M${bx},${by + 68} l-6,14 l6,-5 l6,5 Z" fill="#c4561c" ${ol(2.2)}/>`;
  }
  // mouth: crooked grin
  o += `<path d="M22,32 C32,46 52,48 62,30 C54,34 36,34 22,32 Z" fill="#3a0a10" ${ol(2.6)}/><path d="M26,33 C38,37 52,36 60,32 L58,39 C48,44 36,42 28,38 Z" fill="#fffdf2"/><path d="M36,36 v6 M46,37 v6" stroke="#c8b8a0" stroke-width="1.6"/><path d="M62,30 l5,-6" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>`;
  // moustache
  o += `<path d="M58,22 C40,18 18,22 0,36 C12,44 26,42 36,35 C44,31 52,32 62,30 Z" fill="url(#copper)" ${ol(3.2)}/><path d="M50,24 C36,22 20,28 8,36" stroke="#ffcf90" stroke-width="2.4" fill="none" opacity=".6"/>`;
  // nose
  o += `<path d="M54,-20 C66,-8 78,4 76,16 C74,26 62,28 52,26 C46,24 44,18 48,8 Z" fill="#e48c5c" ${ol(3.2)}/><ellipse cx="62" cy="0" rx="6" ry="9" fill="#ffd0a8" opacity=".6" transform="rotate(-20 62 0)"/><path d="M58,22 q5,3 11,0" stroke="#7a3018" stroke-width="2.4" fill="none"/>`;
  // eyes
  o += `<g><ellipse cx="22" cy="-14" rx="14.5" ry="11" fill="#fffaf0" ${ol(2.8)}/><circle cx="27" cy="-13" r="7.8" fill="#9a5a1e"/><circle cx="28" cy="-13" r="4.2" fill="#1a0a04"/><circle cx="30" cy="-17" r="2.6" fill="#fff"/><path d="M7,-18 C14,-28 32,-27 37,-17" stroke="${OUT}" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M8,-6 C16,0 30,0 36,-8" stroke="#a8583a" stroke-width="2" fill="none" opacity=".7"/></g>`;
  o += `<g><ellipse cx="57" cy="-16" rx="7.5" ry="9" fill="#fffaf0" ${ol(2.6)}/><circle cx="60" cy="-15" r="5" fill="#9a5a1e"/><circle cx="60.6" cy="-15" r="2.8" fill="#1a0a04"/><circle cx="62" cy="-18" r="1.6" fill="#fff"/><path d="M49,-22 C54,-28 63,-26 66,-18" stroke="${OUT}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  // bushy dark brows (determined)
  o += `<path d="M-6,-26 C6,-44 32,-44 44,-28 L42,-20 C30,-32 12,-30 -4,-18 Z" fill="#3a1a0e" ${ol(2.8)}/><path d="M2,-30 C12,-38 28,-38 38,-28" stroke="#7a4a30" stroke-width="2" fill="none" opacity=".8"/><path d="M46,-30 C54,-40 68,-36 72,-24 L68,-18 C62,-28 54,-28 46,-22 Z" fill="#3a1a0e" ${ol(2.6)}/>`;
  // hard hat
  o += `<ellipse cx="38" cy="-62" rx="110" ry="60" fill="url(#lampGlow)" opacity=".4"/>`;
  o += `<path d="M-64,-34 C-68,-94 -26,-118 22,-112 C66,-104 80,-64 74,-34 Z" fill="url(#hat)" ${ol(3.8)}/>`;
  o += `<path d="M-6,-116 C22,-114 38,-96 42,-36 L16,-36 C14,-78 4,-100 -16,-110 Z" fill="#ffd84a" ${ol(2.8)}/><path d="M-4,-110 C12,-108 24,-96 28,-70" stroke="#fff6b8" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>`;
  o += `<path d="M-56,-60 C-54,-86 -36,-102 -12,-108" stroke="#fff3a8" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/><path d="M-40,-52 l12,-10 M-30,-44 l8,-6 M52,-84 l10,6" stroke="#7a3208" stroke-width="2.6" stroke-linecap="round" opacity=".7"/><path d="M44,-100 C52,-92 56,-82 56,-72" stroke="#7a3208" stroke-width="3" fill="none" opacity=".55"/>`;
  o += `<path d="M-70,-36 C-24,-28 40,-24 104,-30 C108,-38 104,-46 96,-46 C40,-40 -24,-46 -70,-48 Z" fill="#e0780e" ${ol(3.6)}/><path d="M-60,-40 C-20,-34 40,-32 96,-38" stroke="#ffc060" stroke-width="2.6" fill="none" opacity=".7"/>`;
  // goggles pushed up
  o += `<path d="M-66,-62 C-30,-48 30,-44 76,-56 L74,-68 C30,-58 -30,-62 -66,-76 Z" fill="url(#leather)" ${ol(2.8)}/>`;
  for (const [gx, gy, gr] of [[-8, -66, 16], [26, -63, 15]]) o += `<circle cx="${gx}" cy="${gy}" r="${gr + 3}" fill="url(#gold)" ${ol(3)}/><circle cx="${gx}" cy="${gy}" r="${gr - 3}" fill="url(#glass)" ${ol(2)}/><path d="M${gx - gr * .6},${gy - gr * .2} A${gr * .7},${gr * .7} 0 0 1 ${gx},${gy - gr * .7}" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".9"/>`;
  o += `<path d="M7,-66 L10,-63" stroke="${OUT}" stroke-width="4"/>`;
  // headlamp
  o += `<g transform="translate(76 -58)"><circle r="46" fill="url(#lampGlow)"/><rect x="-12" y="-14" width="24" height="28" rx="7" fill="url(#gold)" ${ol(3)}/><circle cx="6" cy="0" r="10" fill="#fffbe6" ${ol(2.4)}/><circle cx="6" cy="0" r="5" fill="#fff"/></g>`;
  o += `</g>`;
  // near arm (front): sleeve, rolled cuff, thick forearm
  o += limb('M14,-196 L92,-126', 56, '#1d9a96');
  o += `<path d="M30,-214 L92,-150" stroke="#8ae8d8" stroke-width="5" opacity=".5" stroke-linecap="round"/>`;
  o += `<path d="M82,-144 L110,-104 L96,-92 L68,-130 Z" fill="#c8f0e8" ${ol(3)} opacity=".95"/><path d="M80,-134 L102,-102" stroke="#6ab8a8" stroke-width="2.6"/>`;
  o += limb('M102,-110 L132,-52', 44, 'url(#skin3)');
  o += `<path d="M96,-104 l14,8 M104,-90 l12,6 M112,-76 l10,5" stroke="#8a4a30" stroke-width="2.2" opacity=".55"/><path d="M118,-96 L134,-64" stroke="#ffe0c0" stroke-width="4" opacity=".5" stroke-linecap="round"/>`;
  return o;
};
const glove3 = (x, y, dark) => `<g transform="translate(${x} ${y})"><path d="M-26,-18 L22,-24 L26,2 L-22,10 Z" fill="${dark ? '#5a3418' : 'url(#glove)'}" ${`stroke="${OUT}" stroke-width="3.4" stroke-linejoin="round"`}/><rect x="-28" y="-30" width="22" height="16" rx="4" fill="url(#gold)" stroke="${OUT}" stroke-width="2.4" transform="rotate(-8 -17 -22)"/><path d="M-24,2 C-24,26 -14,32 -4,26 C2,36 14,36 18,26 C28,30 36,20 30,6 L26,-4 Z" fill="${dark ? '#5a3418' : 'url(#glove)'}" stroke="${OUT}" stroke-width="3.4" stroke-linejoin="round"/><path d="M-6,8 V26 M10,10 V30 M22,6 V22" stroke="${OUT}" stroke-width="2.4"/><path d="M-16,-8 L14,-14" stroke="#e8b878" stroke-width="3" opacity=".6" stroke-linecap="round"/><path d="M-14,10 q8,6 16,0" stroke="#e8b878" stroke-width="2" fill="none" opacity=".6"/></g>`;

// ---------- FAR: open cavern vista ----------
let far = `<rect width="1600" height="900" fill="url(#sky3)"/>`;
{
  const S2 = 100, rc = (x, y, j) => {
    const warm = Math.max(0, 1 - Math.hypot((x - 1180) * .8, (y - 440) * 1.3) / 700), cool = Math.max(0, 1 - Math.hypot(x - 300, y - 360) / 560);
    return `rgb(${(18 + 14 * j + warm * 90 + cool * 6) | 0},${(24 + 18 * j + warm * 44 + cool * 36) | 0},${(54 + 28 * j + cool * 56 + warm * 8) | 0})`;
  };
  for (let gy = -1; gy < 8; gy++) for (let gx = -1; gx < 18; gx++) {
    const pt = (i, j) => [(gx + i) * S2 + (((gx + i) * 73 + (gy + j) * 31) % 17 - 8) * 3.4, (gy + j) * S2 + (((gx + i) * 41 + (gy + j) * 57) % 13 - 6) * 3.4];
    const a = pt(0, 0), b = pt(1, 0), c = pt(1, 1), d = pt(0, 1), tr = rnd() < .5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
    for (const t of tr) { const col = rc((t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, rnd() * rnd()); far += `<polygon points="${t.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${col}" stroke="${col}" stroke-width=".8"/>`; }
  }
}
far += `<rect y="0" width="1600" height="640" fill="url(#sky3)" opacity=".38"/><ellipse cx="1180" cy="440" rx="720" ry="340" fill="url(#warmWash)" opacity=".7"/><ellipse cx="330" cy="400" rx="520" ry="330" fill="url(#coolBloom)"/>`;
// far cliff silhouettes with arched tunnel mouths + hanging bridges
const cliff = (pts, col) => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${col}"/>`;
far += cliff([[0, 560], [90, 500], [170, 520], [250, 440], [330, 470], [420, 540], [520, 520], [620, 580], [700, 600], [0, 640]], '#18306a');
far += cliff([[560, 610], [660, 540], [760, 560], [840, 500], [940, 548], [1040, 520], [1130, 560], [1230, 530], [1330, 590], [1440, 560], [1600, 600], [1600, 660], [560, 660]], '#1a3a74');
for (const [x, y, w, h] of [[250, 520, 54, 70], [840, 560, 60, 80], [1120, 590, 44, 56], [430, 560, 40, 50]]) far += `<path d="M${x - w / 2},${y + h} V${y + h * .4} A${w / 2},${w / 2} 0 0 1 ${x + w / 2},${y + h * .4} V${y + h} Z" fill="#ffbc58" opacity=".85"/><path d="M${x - w / 2},${y + h} V${y + h * .4} A${w / 2},${w / 2} 0 0 1 ${x + w / 2},${y + h * .4} V${y + h}" fill="none" stroke="#0e1a3a" stroke-width="4"/><ellipse cx="${x}" cy="${y + h * .6}" rx="${w * 1.2}" ry="${h * .8}" fill="url(#lampGlow)" opacity=".5"/>`;
// hanging rope bridges between pillars
const bridge = (x1, y1, x2, y2, sag) => { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag; let o = `<path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}" fill="none" stroke="#0a1230" stroke-width="5"/><path d="M${x1},${y1 - 22} Q${mx},${my - 22} ${x2},${y2 - 22}" fill="none" stroke="#0a1230" stroke-width="2.4"/>`; for (let i = 0; i <= 12; i++) { const t = i / 12, x = lerp(x1, x2, t), y = (1 - t) * (1 - t) * y1 + 2 * t * (1 - t) * my + t * t * y2; o += `<path d="M${f(x)},${f(y)} v-22" stroke="#0a1230" stroke-width="2"/>`; if (i % 4 === 2) o += `<circle cx="${f(x)}" cy="${f(y - 26)}" r="7" fill="#ffd070"/><circle cx="${f(x)}" cy="${f(y - 26)}" r="22" fill="url(#lampGlow)" opacity=".5"/>`; } return o; };
far += bridge(330, 472, 600, 560, 40) + bridge(940, 548, 1290, 534, 44);
// giant crystals (behind haze)
far += `<g opacity=".55">${cluster(190, 650, 2.0, 'blue')}${cluster(520, 660, .9, 'cyan', false)}${cluster(1010, 640, 1.1, 'blue', false)}${cluster(1330, 660, 1.7, 'cyan')}</g>`;
far += `<rect y="470" width="1600" height="200" fill="url(#haze)"/>`;
// glowing crystal lake
far += `<rect y="640" width="1600" height="260" fill="url(#lake)"/>`;
for (let i = 0; i < 40; i++) { const x = R(0, 1600), y = R(650, 800), w = R(40, 160); far += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(R(1.5, 3.4))}" fill="${rnd() < .6 ? '#9afff0' : '#4ac8ff'}" opacity="${f(R(.15, .45))}"/>`; }
for (const [x, w] of [[190, 90], [1330, 80], [840, 60], [520, 40]]) far += `<ellipse cx="${x}" cy="690" rx="${w}" ry="40" fill="#7afff0" opacity=".16"/><rect x="${x - 4}" y="650" width="8" height="120" fill="#bafff6" opacity=".12"/>`;
// island pillars in the lake
for (const [x, w, h] of [[640, 70, 90], [1050, 54, 70], [60, 70, 80]]) far += `<polygon points="${x - w},690 ${x - w * .7},${690 - h} ${x - w * .1},${690 - h - 16} ${x + w * .6},${690 - h + 6} ${x + w},690" fill="#10224c"/><polygon points="${x - w * .1},${690 - h - 16} ${x + w * .6},${690 - h + 6} ${x + w},690 ${x + w * .2},690" fill="#1a3466"/><path d="M${x - w * .7},${690 - h} L${x - w * .1},${690 - h - 16}" stroke="#5a88d8" stroke-width="3" opacity=".7"/>`;
// the golden door of daylight at the end of the track
far += `<ellipse cx="1528" cy="610" rx="170" ry="190" fill="url(#doorGlow)" opacity=".8"/>`;
for (let i = 0; i < 7; i++) { const a = -Math.PI * (.15 + i * .12), l = 220; far += `<polygon points="1528,620 ${f(1528 + Math.cos(a - .05) * l)},${f(620 + Math.sin(a - .05) * l)} ${f(1528 + Math.cos(a + .05) * l)},${f(620 + Math.sin(a + .05) * l)}" fill="#ffe28a" opacity=".09"/>`; }
far += `<path d="M1470,690 V620 A58,58 0 0 1 1586,620 V690 Z" fill="#3a2418" stroke="${OUT}" stroke-width="4"/><path d="M1482,690 V622 A46,46 0 0 1 1574,622 V690 Z" fill="#fffbe0"/><path d="M1482,690 V622 A46,46 0 0 1 1574,622 V690" fill="none" stroke="#ffe28a" stroke-width="4"/><path d="M1482,672 Q1510,650 1528,666 Q1548,650 1574,670 V690 H1482 Z" fill="#f3b24a" opacity=".85"/>`;
// roof: stalactites (dark, open, not a beam)
const stal = (x, w, h) => `<path d="M${x - w},-6 C${x - w * .5},${h * .4} ${x - w * .15},${h * .8} ${x},${h} C${x + w * .15},${h * .8} ${x + w * .5},${h * .4} ${x + w},-6 Z" fill="#0b0a22" stroke="#2a3a7a" stroke-width="3"/>`;
for (const [x, w, h] of [[120, 90, 130], [260, 50, 80], [470, 110, 170], [640, 44, 70], [880, 100, 150], [1010, 48, 84], [1210, 120, 190], [1420, 60, 100], [1540, 80, 130]]) far += stal(x, w, h);
for (let i = 0; i < 16; i++) far += `<circle cx="${f(R(0, 1600))}" cy="${f(R(60, 620))}" r="${f(R(10, 30))}" fill="url(#lampGlow)" opacity="${f(R(.08, .2))}"/>`;

// ---------- MID: track on a trestle, sparse props, lanterns (tileable 1600) ----------
mid = '';
for (const bx of [200, 600, 1000, 1400]) {
  mid += `<rect x="${bx - 52}" y="${RAIL + 40}" width="22" height="180" fill="url(#woodD)" stroke="${OUT}" stroke-width="3.4"/><rect x="${bx + 30}" y="${RAIL + 40}" width="22" height="180" fill="url(#woodD)" stroke="${OUT}" stroke-width="3.4"/>`;
  mid += `<path d="M${bx - 30},${RAIL + 48} L${bx + 30},${RAIL + 150} M${bx + 30},${RAIL + 48} L${bx - 30},${RAIL + 150}" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/><path d="M${bx - 30},${RAIL + 48} L${bx + 30},${RAIL + 150} M${bx + 30},${RAIL + 48} L${bx - 30},${RAIL + 150}" stroke="#9a5a28" stroke-width="6" stroke-linecap="round"/>`;
  mid += `<rect x="${bx - 62}" y="${RAIL + 36}" width="124" height="20" rx="4" fill="url(#wood)" stroke="${OUT}" stroke-width="3.4"/>`;
}
mid += `<rect x="-6" y="${RAIL + 24}" width="1612" height="18" fill="url(#woodD)" stroke="${OUT}" stroke-width="3.4"/><rect x="-6" y="${RAIL + 26}" width="1612" height="4" fill="#d09050" opacity=".4"/>`;
for (let k = -1; k <= 20; k++) { const x = k * 80 + 14; mid += `<rect x="${x}" y="${RAIL + 6}" width="44" height="22" rx="3" fill="url(#wood)" stroke="${OUT}" stroke-width="3"/><rect x="${x + 4}" y="${RAIL + 9}" width="36" height="5" fill="#e0a560" opacity=".45"/>`; }
mid += `<rect x="-6" y="${RAIL - 14}" width="1612" height="7" fill="#3a4258" stroke="${OUT}" stroke-width="2"/><rect x="-6" y="${RAIL - 3}" width="1612" height="14" fill="url(#steel)" stroke="${OUT}" stroke-width="3"/><path d="M-6,${RAIL} H1606" stroke="#fff" stroke-width="2.4" opacity=".7"/>`;
for (let k = 0; k < 10; k++) mid += `<rect x="${k * 160 + 30}" y="${RAIL - 8}" width="14" height="26" fill="#2a3244" stroke="${OUT}" stroke-width="2"/>`;
// sparse timber props with a short header (not a ceiling beam)
for (const px of [850, 1170]) {
  mid += `<rect x="${px - 18}" y="-6" width="36" height="${RAIL + 6}" fill="url(#woodD)" stroke="${OUT}" stroke-width="3.6"/><rect x="${px - 10}" y="-6" width="9" height="${RAIL}" fill="#c98a4a" opacity=".4"/>`;
  mid += `<rect x="${px - 98}" y="110" width="196" height="30" rx="5" fill="url(#wood)" stroke="${OUT}" stroke-width="3.6"/><rect x="${px - 98}" y="113" width="196" height="7" fill="#e0a560" opacity=".45"/>`;
  for (const sx of [-1, 1]) mid += `<polygon points="${px + sx * 18},150 ${px + sx * 18},196 ${px + sx * 76},140 ${px + sx * 62},140" fill="url(#woodD)" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>`;
  mid += `<rect x="${px - 24}" y="${RAIL - 40}" width="48" height="22" rx="4" fill="url(#steelD)" stroke="${OUT}" stroke-width="3"/><circle cx="${px - 12}" cy="${RAIL - 29}" r="3.4" fill="url(#steel)"/><circle cx="${px + 12}" cy="${RAIL - 29}" r="3.4" fill="url(#steel)"/>`;
}
for (const [lx, ly, ls] of [[930, 140, 1.15], [1090, 140, 1.15], [600, 30, 1.2]]) mid += `<path d="M${lx},${ly - 4} V${ly + 70 - 40 * ls}" stroke="${OUT}" stroke-width="6"/><path d="M${lx},${ly - 4} V${ly + 70 - 40 * ls}" stroke="#8a94a8" stroke-width="2.8" stroke-dasharray="6 3"/>` + lantern(lx, ly + 70, ls, 150);
mid += `<ellipse cx="1500" cy="${RAIL}" rx="240" ry="22" fill="url(#doorGlow)" opacity=".4"/>`;

// ---------- NEAR: foreground rocks, crystals, dust (tileable 1600) ----------
near = '';
const wrapRow = (y0, amp, col, edge, off) => {
  const n = 20, ys = []; for (let i = 0; i < n; i++) ys.push(y0 - R(0, amp)); ys.push(ys[0]);
  let d = `M-20,910 L-20,${f(ys[0])}`; ys.forEach((y, i) => d += ` L${i * 80},${f(y)}`); d += ` L1620,${f(ys[0])} L1620,910 Z`;
  return `<path d="${d}" fill="${col}" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/>`;
};
near += wrapRow(858, 36, '#0b0714', '#3a3a88') + wrapRow(880, 22, '#07040e', '#2a2a68');
near += `<g>${cluster(140, 890, .55, 'blue')}${cluster(270, 896, .3, 'violet', false)}${cluster(1420, 892, .6, 'cyan')}${cluster(1290, 898, .28, 'blue', false)}</g>`;
for (const [x, w, h] of [[560, 90, 40], [960, 70, 30]]) near += `<path d="M${x - w},900 L${x - w * .8},${900 - h * .5} L${x - w * .2},${900 - h} L${x + w * .5},${900 - h * .7} L${x + w},900 Z" fill="#100a1c" stroke="#4a4a98" stroke-width="3" stroke-linejoin="round"/>`;
for (let i = 0; i < 40; i++) near += `<circle cx="${f(R(20, 1580))}" cy="${f(R(160, 800))}" r="${f(R(1, 2.6))}" fill="${rnd() < .5 ? '#ffe8a0' : '#9ae0ff'}" opacity="${f(R(.25, .7))}"/>`;
for (const [x, y, r] of [[700, 260, 11], [1380, 420, 9], [560, 380, 8], [1000, 300, 9]]) near += spark(x, y, r, .8);

// ---------- SPRITES ----------
spr = '';
const CX3 = 385, CY3 = 537, K3 = .74;
spr += `<polygon points="473,291 1540,270 1540,620" fill="url(#beam)"/>`;
spr += `<ellipse cx="${CX3}" cy="${RAIL + 12}" rx="215" ry="13" fill="#000" opacity=".45"/>`;
const gl = []; 
spr += `<g transform="translate(${CX3} ${CY3}) scale(${K3})">` + cart() + heap(-215, -4, 240, 110, 56, 25) + heap(262, -4, 150, 60, 24, 22) + `<g transform="translate(-58 0)">${dw3()}</g>` + cartRim() + heap(-60, -2, 210, 40, 22, 22) + `<g transform="translate(-58 0)">${glove3(138, -26, false)}${glove3(198, -34, true)}</g>` + spark(-230, -110, 18) + spark(300, -80, 14) + `</g>`;
// pickups: uneven heights + bob offsets
const rails = (x, s) => `<ellipse cx="${x}" cy="${RAIL - 4}" rx="${f(44 * s)}" ry="7" fill="#000" opacity=".4"/><ellipse cx="${x}" cy="${RAIL - 6}" rx="${f(36 * s)}" ry="5" fill="#ffd060" opacity=".25"/>`;
const put = (k, x, y, s, ty, bob) => { globalThis.TY = ty; spr += rails(x, s) + `<g transform="translate(${x} ${y + bob}) scale(${s})">${items[k]()}</g>`; };
put('nugget', 752, 650, 1.1, -84, 0);
put('green', 937, 498, 1.15, 76, 6);
put('tnt', 1100, 636, 1.0, -112, 0);
put('hat', 1325, 560, 1.0, 72, -8);
// lever fork sign on the rail side
spr += `${rails(1480, .9)}<g transform="translate(1480 640)"><rect x="-6" y="-20" width="12" height="76" rx="3" fill="url(#wood)" stroke="${OUT}" stroke-width="3"/><path d="M0,-20 L-26,-52 M0,-20 L26,-52" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/><path d="M0,-20 L-26,-52 M0,-20 L26,-52" stroke="url(#gold)" stroke-width="6" stroke-linecap="round"/><path d="M-26,-52 l-10,2 l6,-10 z M26,-52 l10,2 l-6,-10 z" fill="#ffd25a" stroke="${OUT}" stroke-width="2"/><g transform="translate(0 30) rotate(-30)"><rect x="-3.4" y="-34" width="7" height="34" fill="url(#steel)" stroke="${OUT}" stroke-width="2.4"/><circle cy="-36" r="8" fill="#e0283a" stroke="${OUT}" stroke-width="2.6"/></g><g transform="translate(0 -88)">${tag('FORK', '#ffd25a', 1.1)}</g></g>`;

// ---------- mark + HUD ----------
const mark = `<g opacity=".6"><text x="40" y="66" font-family="RR" font-weight="900" font-size="34" letter-spacing="4" fill="#1a0408" transform="translate(2 3)" opacity=".7">RATTLEROCK RUN</text><text x="40" y="66" font-family="RR" font-weight="900" font-size="34" letter-spacing="4" fill="url(#lgFill)" stroke="#3a1008" stroke-width="5" paint-order="stroke" stroke-linejoin="round">RATTLEROCK RUN</text></g>`;
let hud = `<rect x="32" y="812" width="1536" height="80" rx="16" fill="#000" opacity=".4" transform="translate(0 4)"/><rect x="32" y="812" width="1536" height="80" rx="16" fill="#150c22" stroke="url(#gold)" stroke-width="5"/><rect x="40" y="820" width="1520" height="64" rx="11" fill="none" stroke="#6a3c1c" stroke-width="2"/>`;
[['DEPTH', '120 m'], ['DISTANCE', '36 m'], ['MULTIPLIER', 'x1'], ['LOAD', '12.50']].forEach((c, i) => {
  const cx = 32 + 1536 / 4 * (i + .5);
  hud += `<text x="${f(cx)}" y="843" text-anchor="middle" font-family="RR" font-weight="900" font-size="16" letter-spacing="5" fill="#ffd9a0">${c[0]}</text><text x="${f(cx)}" y="875" text-anchor="middle" font-family="RN" font-size="36" fill="url(#lgFill)" stroke="${OUT}" stroke-width="5" paint-order="stroke" stroke-linejoin="round">${c[1]}</text>`;
  if (i) hud += `<path d="M${32 + 1536 / 4 * i},826 V878" stroke="#6a3c1c" stroke-width="3"/><path d="M${33 + 1536 / 4 * i},826 V878" stroke="#ffd25a" stroke-width="1.2" opacity=".5"/>`;
});
const page = inner => `<!doctype html><html><head><meta charset="utf-8"><title>Rattlerock Run - look test 3</title>
<style>@font-face{font-family:RN;src:url(data:font/woff2;base64,${FONT2}) format('woff2')}@font-face{font-family:RR;font-weight:900;src:url(data:font/woff2;base64,${FONT}) format('woff2')}
html,body{margin:0;background:#07040f}body{width:1600px;height:900px;overflow:hidden}svg{display:block}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs>${defs}</defs>${inner}</svg></body></html>`;
fs.writeFileSync(__dirname + '/look3.html', page(`<g id="far">${far}</g><g id="mid">${mid}</g><g id="spr">${spr}</g><g id="near">${near}</g><g id="mark">${mark}</g><g id="hud">${hud}</g>`));
console.log('ok3');
