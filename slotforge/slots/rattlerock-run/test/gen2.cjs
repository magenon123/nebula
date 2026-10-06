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
  const w = Math.max(44, 13 * String(txt).length + 28) * s, h = 24 * s;
  return `<g><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h / 2)}" fill="#160c24" stroke="${col}" stroke-width="${f(2.2 * s)}"/><text x="0" y="${f(h * .3)}" text-anchor="middle" font-family="RN" font-size="${f(h * .8)}" fill="#fff6d0">${txt}</text></g>`;
};
const gem = (col, lite, dark, txt, glow) => `
  <circle r="62" fill="${glow}" opacity=".28"/><circle r="38" fill="${glow}" opacity=".3"/>
  <polygon points="-34,-8 -18,-30 18,-30 34,-8 0,36" fill="${col}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
  <polygon points="-34,-8 -18,-30 -6,-8" fill="${lite}"/><polygon points="-18,-30 18,-30 6,-8 -6,-8" fill="#fff" opacity=".7"/><polygon points="18,-30 34,-8 6,-8" fill="${lite}" opacity=".8"/>
  <polygon points="-34,-8 -6,-8 0,36" fill="${lite}" opacity=".55"/><polygon points="34,-8 6,-8 0,36" fill="${dark}" opacity=".7"/><polygon points="-6,-8 6,-8 0,36" fill="${col}"/>
  <path d="M-34,-8 L34,-8" stroke="${OUT}" stroke-width="2" opacity=".55"/><path d="M-26,-20 L-14,-26" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  <g transform="translate(0 74)">${tag(txt, lite, 1.6)}</g>`;
const items = {
  nugget: () => `<circle r="56" fill="#ffc83a" opacity=".22"/>${nugget(0, 0, 36, -10)}${nugget(-22, 14, 20, 20)}${nugget(22, 16, 22, -30)}<g transform="translate(0 74)">${tag('+LOAD', '#ffd25a', 1.7)}</g>${spark(30, -30, 12)}`,
  green: () => gem('#2fcf5a', '#9bffb0', '#0c6a30', 'x2', '#5dff8a'),
  blue: () => gem('#2f8cf0', '#a8dcff', '#123c9a', 'x3', '#6ac8ff'),
  red: () => gem('#e0283a', '#ff9aa0', '#7a0c1c', 'x5', '#ff6070'),
  hat: () => `<ellipse cx="0" cy="-4" rx="62" ry="50" fill="#ffc83a" opacity=".16"/>
    <path d="M-44,10 C-44,-34 -22,-44 0,-44 C22,-44 44,-34 44,10 Z" fill="#ffc22e" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M-44,10 C-44,-34 -22,-44 0,-44 C-14,-30 -20,-10 -18,10 Z" fill="#fff0a0" opacity=".6"/>
    <path d="M-8,-44 L8,-44 L10,10 L-10,10 Z" fill="#e89a10" stroke="${OUT}" stroke-width="2.5"/>
    <path d="M-60,10 Q0,2 60,10 Q62,24 50,24 L-50,24 Q-62,24 -60,10 Z" fill="#e08a14" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="0" cy="-18" r="9" fill="#fff6c0" stroke="${OUT}" stroke-width="2.5"/><circle cx="0" cy="-18" r="4" fill="#fff"/>
    <g transform="translate(0 74)">${tag('SHIELD', '#7ee4ff', 1.9)}</g>`,
  tnt: () => `<ellipse cx="0" cy="0" rx="66" ry="52" fill="#ff5030" opacity=".18"/>
    <rect x="-40" y="-26" width="80" height="58" rx="4" fill="#c42a1c" stroke="${OUT}" stroke-width="3.5"/>
    <rect x="-40" y="-26" width="80" height="14" fill="#e85a40" opacity=".7"/>
    <g stroke="#6a1008" stroke-width="2.5"><path d="M-14,-26 V32 M14,-26 V32"/></g>
    <rect x="-40" y="-6" width="80" height="22" fill="#f6e2b0" stroke="${OUT}" stroke-width="3"/>
    <text x="0" y="12" text-anchor="middle" font-family="RN" font-size="21" fill="#2a0a06">TNT</text>
    <path d="M0,-26 C-4,-44 14,-46 16,-60" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M0,-26 C-4,-44 14,-46 16,-60" fill="none" stroke="#d9c08a" stroke-width="2" stroke-linecap="round"/>
    <circle cx="16" cy="-64" r="16" fill="#ff9a20" opacity=".7"/><path d="M16,-82 L20,-68 L33,-64 L20,-60 L16,-46 L12,-60 L-1,-64 L12,-68 Z" fill="#fff2a0" stroke="#ff7a10" stroke-width="2"/>
    <g transform="translate(0 76)">${tag('TNT', '#ff6a50', 1.7)}</g>`,
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

// ================= look2: side-on chase camera, 3 parallax layers =================
grad('lgFill', [[0, '#fffbe6'], [.28, '#ffe08a'], [.6, '#f0a22c'], [1, '#a8581a']]);
grad('beam', [[0, '#ffe6a0', .30], [1, '#ffe6a0', 0]], 0, 0, 1, 0);
grad('floor2', [[0, '#4a3022'], [.25, '#2a1c2c'], [1, '#0e0a18']]);
grad('farSky', [[0, '#0a0820'], [.6, '#16123a'], [1, '#2a1c3a']]);
rad('coolBloom', [[0, '#4aa8ff', .28], [1, '#4aa8ff', 0]]);
grad('rockD', [[0, '#1c1630'], [1, '#07040e']]);
const RAIL = 718; // rail top y (cart wheels sit here)

// ---------- FAR layer: cave depth, soft warm glow, distant crystals ----------
let far = `<rect width="1600" height="900" fill="url(#farSky)"/>`;
const DX2 = 1250, DY2 = 470;
const rc2 = (x, y, j) => {
  const d = Math.hypot((x - DX2) * .8, (y - DY2) * 1.2), warm = Math.max(0, 1 - d / 760);
  const cool = Math.max(0, 1 - Math.hypot(x - 260, y - 430) / 520) * .6;
  let r = 18 + 16 * j + warm * (92 + 30 * j), g = 18 + 16 * j + warm * (46 + 14 * j) + cool * 22, b = 44 + 26 * j + warm * 10 + cool * 54;
  return `rgb(${Math.min(255, r | 0)},${Math.min(255, g | 0)},${Math.min(255, b | 0)})`;
};
{
  const S2 = 96;
  for (let gy = -1; gy < 11; gy++) for (let gx = -1; gx < 18; gx++) {
    const pt = (i, j) => [(gx + i) * S2 + (((gx + i) * 73 + (gy + j) * 31) % 17 - 8) * 3.2, (gy + j) * S2 + (((gx + i) * 41 + (gy + j) * 57) % 13 - 6) * 3.2];
    const a = pt(0, 0), b = pt(1, 0), c = pt(1, 1), d = pt(0, 1);
    const tr = rnd() < .5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
    for (const t of tr) {
      const col = rc2((t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, rnd() * rnd());
      far += `<polygon points="${t.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${col}" stroke="${col}" stroke-width=".8"/>`;
    }
  }
}
far += `<ellipse cx="${DX2}" cy="${DY2}" rx="760" ry="360" fill="url(#warmWash)" opacity=".8"/><ellipse cx="260" cy="440" rx="480" ry="300" fill="url(#coolBloom)"/>`;
// far gallery: a distant tunnel mouth glowing at the right
far += `<ellipse cx="${DX2}" cy="${DY2 + 30}" rx="150" ry="170" fill="url(#doorGlow)" opacity=".55"/>`;
// distant timber silhouettes
for (const x of [330, 760, 1120, 1480]) far += `<g opacity=".28"><rect x="${x - 14}" y="120" width="28" height="640" fill="#1a0f1c"/><rect x="${x - 120}" y="120" width="240" height="22" fill="#1a0f1c"/></g>`;
// distant crystals
for (const [x, y, s, h] of [[60, 700, .4, 'blue'], [1095, 706, .3, 'cyan'], [1585, 704, .3, 'violet'], [610, 710, .26, 'blue']]) far += `<g opacity=".78">${cluster(x, y, s, h)}</g>`;
for (let i = 0; i < 18; i++) far += `<circle cx="${f(R(0, 1600))}" cy="${f(R(120, 640))}" r="${f(R(14, 38))}" fill="url(#lampGlow)" opacity="${f(R(.12, .3))}"/>`;
far += `<path d="M0,760 Q200,720 420,750 T860,740 T1300,752 T1600,730 L1600,900 L0,900 Z" fill="#0d0916"/>`;

// ---------- MID layer: gallery timbers, lanterns, track, ground ----------
mid = '';
// ground
mid += `<path d="M0,752 L60,746 L160,754 L300,748 L460,756 L640,748 L820,755 L1010,747 L1190,756 L1380,749 L1600,754 L1600,900 L0,900 Z" fill="url(#floor2)" stroke="${OUT}" stroke-width="3"/><path d="M0,754 L60,748 L160,756 L300,750 L460,758 L640,750 L820,757 L1010,749 L1190,758 L1380,751 L1600,756" fill="none" stroke="#c98a5a" stroke-width="2.4" opacity=".5"/>`;
for (let i = 0; i < 150; i++) { const x = R(0, 1600), y = R(762, 900), w = R(3, 13); mid += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(w * .5)}" fill="${rnd() < .4 ? '#6a4a34' : '#241a30'}" opacity=".8"/>`; }
// ceiling gallery beam
mid += `<rect x="-10" y="60" width="1620" height="50" fill="url(#wood)" stroke="${OUT}" stroke-width="4"/><rect x="-10" y="64" width="1620" height="10" fill="#e0a560" opacity=".45"/>`;
for (let x = 40; x < 1600; x += 140) mid += `<path d="M${x},60 V110" stroke="#2e170a" stroke-width="2.5" opacity=".6"/>`;
for (const x of [110, 872, 1335]) {
  const pw = 54;
  mid += `<rect x="${x - pw / 2}" y="104" width="${pw}" height="${RAIL - 104 + 18}" fill="url(#woodD)" stroke="${OUT}" stroke-width="4"/><rect x="${x - pw / 2 + 8}" y="108" width="12" height="${RAIL - 104}" fill="#c98a4a" opacity=".4"/>`;
  for (const sx of [-1, 1]) mid += `<polygon points="${x + sx * pw / 2},104 ${x + sx * (pw / 2 + 120)},110 ${x + sx * (pw / 2 + 120)},138 ${x + sx * pw / 2},${204}" fill="url(#woodD)" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>`;
  mid += `<rect x="${x - pw / 2 - 10}" y="190" width="${pw + 20}" height="26" rx="5" fill="url(#steelD)" stroke="${OUT}" stroke-width="3"/><rect x="${x - pw / 2 - 10}" y="${RAIL - 34}" width="${pw + 20}" height="26" rx="5" fill="url(#steelD)" stroke="${OUT}" stroke-width="3"/>`;
  for (const yy of [203, RAIL - 21]) for (const dx of [-18, 18]) mid += `<circle cx="${x + dx}" cy="${yy}" r="4" fill="url(#steel)" stroke="${OUT}" stroke-width="1.6"/>`;
}
// hanging lanterns
for (const [x, dy, s] of [[610, 100, 1.2], [975, 110, 1.3], [1520, 130, 1.2]]) {
  mid += `<path d="M${x},110 V${dy + 100 - 40 * s}" stroke="${OUT}" stroke-width="6"/><path d="M${x},110 V${dy + 100 - 40 * s}" stroke="#8a94a8" stroke-width="2.8" stroke-dasharray="6 3"/>` + lantern(x, dy + 100, s, 170);
}
// track: far rail, sleepers, near rail
mid += `<rect x="-10" y="${RAIL - 14}" width="1620" height="8" fill="#3a4258" stroke="${OUT}" stroke-width="2"/>`;
for (let x = -30; x < 1650; x += 72) mid += `<rect x="${x}" y="${RAIL + 16}" width="44" height="28" rx="3" fill="url(#wood)" stroke="${OUT}" stroke-width="3"/><rect x="${x + 4}" y="${RAIL + 19}" width="36" height="6" fill="#e0a560" opacity=".45"/><path d="M${x + 8},${RAIL + 34} h28" stroke="#2e170a" stroke-width="2" opacity=".6"/>`;
for (let x = -30; x < 1650; x += 72) mid += `<rect x="${x + 6}" y="${RAIL + 6}" width="32" height="12" fill="#6a3c1c" stroke="${OUT}" stroke-width="2.2"/>`;
mid += `<rect x="-10" y="${RAIL - 2}" width="1620" height="14" fill="url(#steel)" stroke="${OUT}" stroke-width="3"/><rect x="-10" y="${RAIL - 6}" width="1620" height="8" rx="3" fill="url(#steel)" stroke="${OUT}" stroke-width="3"/><path d="M-10,${RAIL - 3} H1610" stroke="#fff" stroke-width="2.4" opacity=".7"/>`;
for (let x = 20; x < 1600; x += 144) mid += `<rect x="${x}" y="${RAIL - 8}" width="16" height="26" fill="#2a3244" stroke="${OUT}" stroke-width="2"/>`;
// warm light pooling on the rail ahead
mid += `<ellipse cx="1250" cy="${RAIL}" rx="320" ry="26" fill="url(#doorGlow)" opacity=".35"/>`;

// ---------- NEAR layer: foreground rocks, crystals, stalactites, dust ----------
let near = '';
const rockRow = (y0, amp, col, edge) => {
  let d = `M-20,900 L-20,${y0}`;
  for (let x = 0; x <= 1640; x += 60) d += ` L${x},${f(y0 - R(0, amp))}`;
  d += ` L1640,900 Z`;
  return `<path d="${d}" fill="${col}" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/>`;
};
near += rockRow(850, 46, '#0b0714', '#3a3070');
near += rockRow(876, 26, '#07040e', '#2a2458');
near += `<g>${cluster(120, 880, .55, 'blue')}${cluster(250, 890, .32, 'violet', false)}${cluster(1420, 884, .62, 'blue')}${cluster(1300, 892, .3, 'cyan', false)}</g>`;
// foreground boulders
for (const [x, y, w] of [[470, 880, 120], [880, 886, 90], [1120, 884, 110]]) near += `<path d="M${x - w},${y + 30} L${x - w * .8},${y - 30} L${x - w * .2},${y - 52} L${x + w * .5},${y - 36} L${x + w},${y + 30} Z" fill="#100a1c" stroke="#4a3e88" stroke-width="3" stroke-linejoin="round"/><path d="M${x - w * .6},${y - 24} L${x - w * .2},${y - 48} L${x + w * .3},${y - 36}" fill="none" stroke="#8a78d8" stroke-width="2.4" opacity=".6"/>`;
// stalactites (top, clear of the logo mark)
for (const [x, w, h] of [[560, 70, 62], [640, 46, 40], [1060, 80, 70], [1130, 44, 44], [1560, 70, 58]]) near += `<path d="M${x - w},-6 L${x},${h} L${x + w},-6 Z" fill="#0b0714" stroke="#3a3070" stroke-width="3" stroke-linejoin="round"/>`;
for (let i = 0; i < 44; i++) near += `<circle cx="${f(R(0, 1600))}" cy="${f(R(120, 780))}" r="${f(R(1, 2.8))}" fill="${rnd() < .5 ? '#ffe8a0' : '#9ae0ff'}" opacity="${f(R(.25, .75))}"/>`;
for (const [x, y, r] of [[900, 300, 12], [1380, 380, 10], [610, 470, 9], [1110, 250, 8]]) near += spark(x, y, r, .8);

// ---------- SPRITES: cart + dwarf, pickups ----------
let spr = '';
const CX2 = 400, CY2 = 590, K = .6;
spr += `<polygon points="400,360 1500,280 1500,600" fill="url(#beam)"/>`;
let ld = '';
ld += heap(-210, -4, 240, 92, 54, 25) + heap(215, -4, 240, 104, 62, 26);
const lf = `<g transform="translate(${CX2} ${CY2}) scale(${K})">`;
const smallGem2 = (x, y, col, lite, s) => `<g transform="translate(${x} ${y}) scale(${s})"><polygon points="-34,-8 -18,-30 18,-30 34,-8 0,36" fill="${col}" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><polygon points="-18,-30 18,-30 6,-8 -6,-8" fill="#fff" opacity=".6"/><polygon points="-34,-8 -6,-8 0,36" fill="${lite}" opacity=".5"/></g>`;
spr += `<ellipse cx="${CX2}" cy="${RAIL + 12}" rx="215" ry="14" fill="#000" opacity=".45"/>`;
spr += lf + cart() + ld + dwarf() + dwarfHead() + cartRim() + heap(0, -2, 190, 40, 22, 22) + smallGem2(-250, -64, '#e0283a', '#ff9aa0', .5) + smallGem2(130, -86, '#2fcf5a', '#9bffb0', .5) + spark(-200, -80, 16) + spark(250, -110, 20) + globalThis.__fist(-252, -22, -6) + globalThis.__fist(252, -22, 6) + `</g>`;
const picks2 = [['nugget', 735, 585, 1.15], ['green', 975, 575, 1.15], ['tnt', 1215, 600, 1.0], ['hat', 1440, 585, 1.05]];
for (const [k, x, y, s] of picks2) {
  spr += `<ellipse cx="${x}" cy="${RAIL - 4}" rx="${f(46 * s)}" ry="8" fill="#000" opacity=".4"/><ellipse cx="${x}" cy="${RAIL - 6}" rx="${f(38 * s)}" ry="6" fill="#ffd060" opacity=".28"/>`;
  spr += `<g transform="translate(${x} ${y}) scale(${s})">${items[k]()}</g>`;
}

// ---------- faint logo mark + HUD ----------
const mark = `<g opacity=".62"><text x="40" y="66" font-family="RR" font-weight="900" font-size="34" letter-spacing="4" fill="#1a0408" transform="translate(2 3)" opacity=".7">RATTLEROCK RUN</text><text x="40" y="66" font-family="RR" font-weight="900" font-size="34" letter-spacing="4" fill="url(#lgFill)" stroke="#3a1008" stroke-width="5" paint-order="stroke" stroke-linejoin="round">RATTLEROCK RUN</text></g>`;
let hud = `<g>`;
hud += `<rect x="32" y="808" width="1536" height="84" rx="16" fill="#000" opacity=".4" transform="translate(0 4)"/><rect x="32" y="808" width="1536" height="84" rx="16" fill="#150c22" stroke="url(#gold)" stroke-width="5"/><rect x="40" y="816" width="1520" height="68" rx="11" fill="none" stroke="#6a3c1c" stroke-width="2"/>`;
const cells = [['DEPTH', '120 m'], ['DISTANCE', '36 m'], ['MULTIPLIER', 'x1'], ['LOAD', '12.50']];
cells.forEach((c, i) => {
  const cx = 32 + 1536 / 4 * (i + .5);
  hud += `<text x="${f(cx)}" y="840" text-anchor="middle" font-family="RR" font-weight="900" font-size="17" letter-spacing="5" fill="#ffd9a0">${c[0]}</text>`;
  hud += `<text x="${f(cx)}" y="874" text-anchor="middle" font-family="RN" font-size="38" fill="url(#lgFill)" stroke="${OUT}" stroke-width="5" paint-order="stroke" stroke-linejoin="round">${c[1]}</text>`;
  if (i) hud += `<path d="M${32 + 1536 / 4 * i},822 V878" stroke="#6a3c1c" stroke-width="3"/><path d="M${33 + 1536 / 4 * i},822 V878" stroke="#ffd25a" stroke-width="1.2" opacity=".5"/>`;
});
hud += `</g>`;

const page = (inner, only) => `<!doctype html><html><head><meta charset="utf-8"><title>Rattlerock Run - look test 2</title>
<style>@font-face{font-family:RN;src:url(data:font/woff2;base64,${FONT2}) format('woff2')}@font-face{font-family:RR;font-weight:900;src:url(data:font/woff2;base64,${FONT}) format('woff2')}
html,body{margin:0;background:#07040f}body{width:1600px;height:900px;overflow:hidden}svg{display:block}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs>${defs}</defs>${inner}</svg></body></html>`;
fs.writeFileSync(__dirname + '/look2.html', page(`<g id="far">${far}</g><g id="mid">${mid}</g><g id="spr">${spr}</g><g id="near">${near}</g><g id="mark">${mark}</g><g id="hud">${hud}</g>`));
console.log('ok2');
