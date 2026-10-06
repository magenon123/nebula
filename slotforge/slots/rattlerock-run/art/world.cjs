// RATTLEROCK RUN world generator (leo): 5 parallax layers x 3 depth palettes -> bake/<layer>-lvN.svg
// node world.cjs  (then node bake.cjs)
const B = require('./base.cjs');
const { fs, R, rnd, f, lerp, OUT, lantern, crystal, cluster, mush, RAIL, setSeed, spark } = B;
const path = require('path');
fs.mkdirSync(path.join(__dirname, 'bake'), { recursive: true });

const PAL = {
  1: {
    sky: [[0, '#0a0828'], [.3, '#16256a'], [.55, '#2c5a9a'], [.78, '#5a92b8'], [1, '#1a4a6a']],
    rockA: [24, 38, 96], rockB: [50, 74, 132], rockJ: [10, 12, 18], rockW: [64, 36, 4], warmC: [1250, 440],
    cliff: '#1a2b64', cliffHi: '#34509a', tone: '#2a4482', tone2: '#243c78', edge: '#7aa4e0', arch: '#33509a', archHi: '#6a92d8', win: '#ffd27a', door: '#ffb450', rune: '#5a7ac0',
    haze: '#9ad0f0', hazeA: .62, roof: ['#d8f4ff', '#ffffff', '#9ad8ff'], roofA: .8,
    lake: [[0, '#7affea'], [.12, '#2aa8b8'], [.5, '#0e4a70'], [1, '#06223c']], lakeLine: ['#b0fff4', '#6ad4ff'], lakeGlow: '#9afff0',
    hues: ['blue', 'cyan', 'violet', 'blue', 'cyan', 'amber'], hueMid: ['blue', 'cyan', 'violet'],
    fall: [[0, '#fff2a0'], [.3, '#ffc040'], [.7, '#ff8a20'], [1, '#d03a10']], fallGlow: '#ff9a30', fallX: [140],
    pillar: [[0, '#2a3a8a'], [.5, '#161e58'], [1, '#0a0e36']], pillarEdge: '#2a3a8a', vein: '#4a62c0', rimW: '#ffb868', rimC: '#8ae0ff',
    wood: [['#b4743a', '#8a4f24', '#4e2810'], ['#7a4420', '#2e170a']],
    void: '#05081e', under: '#4affc0', mush: ['#5affc8', '#7ab8ff', '#c08aff'], crysGlow: ['#7ee4ff', '#3a9aff', '#2060ff'],
    stalEdge: '#4a62c0', nearRock: '#0a0612', nearEdge: '#6a4a98', nearRock2: '#06030c', nearEdge2: '#3a2868', nearHues: ['night', 'violet', 'night', 'amber', 'night'],
    stal: ['#ffd070', '#8ae0ff', '#c08aff', '#8ae0ff'], motes: ['#ffe8a0', '#9ae0ff'], fauna: 'bats', sparkle: '#ffd070', warm: '#ffb040',
  },
  2: {
    sky: [[0, '#14040a'], [.3, '#2e0c10'], [.55, '#5a1c12'], [.78, '#8a3a14'], [1, '#4a1a0c']],
    rockA: [30, 10, 12], rockB: [66, 28, 18], rockJ: [14, 8, 6], rockW: [120, 56, 0], warmC: [900, 600],
    cliff: '#2a0e0c', cliffHi: '#6a2a18', tone: '#4a2018', tone2: '#40180f', edge: '#e0803a', arch: '#6a2c18', archHi: '#c8703a', win: '#ff9a38', door: '#ff8a20', rune: '#a8501e',
    haze: '#d0602a', hazeA: .32, roof: ['#ff7a30', '#ffd070', '#ff5a20'], roofA: .55,
    lake: [[0, '#fff0a0'], [.1, '#ff9a20'], [.45, '#b02a0a'], [1, '#3a0806']], lakeLine: ['#fff0a0', '#ff7a20'], lakeGlow: '#ff9a30',
    hues: ['amber', 'red', 'amber', 'gold', 'red', 'amber'], hueMid: ['amber', 'red', 'gold'],
    fall: [[0, '#fffbd0'], [.3, '#ffd050'], [.65, '#ff7a18'], [1, '#c02808']], fallGlow: '#ff7a20', fallX: [1330],
    pillar: [[0, '#5a2414'], [.5, '#2e1008'], [1, '#160604']], pillarEdge: '#8a3a1c', vein: '#ff8a30', rimW: '#ffc070', rimC: '#ff8a50',
    wood: [['#8a5a3a', '#5a3420', '#2a1408'], ['#5a3018', '#241008']],
    void: '#140404', under: '#ff7a20', mush: ['#ff9a30', '#ffd070', '#ff6a20'], crysGlow: ['#ffb060', '#ff6a20', '#c02008'],
    stalEdge: '#c0602a', nearRock: '#120404', nearEdge: '#a8481e', nearRock2: '#0a0202', nearEdge2: '#6a2a10', nearHues: ['red', 'amber', 'red', 'gold', 'red'],
    stal: ['#ff9a40', '#ffd070', '#ff7a30', '#ffc060'], motes: ['#ffb060', '#ff7a30'], fauna: 'embers', sparkle: '#ffb050', warm: '#ff8a30',
  },
  3: {
    sky: [[0, '#0a0420'], [.3, '#1e0e4e'], [.55, '#42207a'], [.78, '#7a4aa8'], [1, '#2c1458']],
    rockA: [28, 14, 58], rockB: [66, 36, 108], rockJ: [12, 8, 22], rockW: [100, 80, 14], warmC: [1100, 450],
    cliff: '#1c0e40', cliffHi: '#4a2a8a', tone: '#38206a', tone2: '#301a5e', edge: '#f0c860', arch: '#5a3a9a', archHi: '#e0b850', win: '#ffe08a', door: '#ffd060', rune: '#c8a040',
    haze: '#c0a0ff', hazeA: .5, roof: ['#fff0b0', '#ffffff', '#ffd060'], roofA: .6,
    lake: [[0, '#fff6b0'], [.1, '#ffd050'], [.5, '#b0701c'], [1, '#3a2008']], lakeLine: ['#fff6b0', '#ffc840'], lakeGlow: '#ffd860',
    hues: ['violet', 'gold', 'plum', 'violet', 'gold', 'plum'], hueMid: ['violet', 'gold', 'plum'],
    fall: [[0, '#fffbe0'], [.3, '#ffe27a'], [.7, '#f0b030'], [1, '#b8741a']], fallGlow: '#ffd060', fallX: [140],
    pillar: [[0, '#4a2a8a'], [.5, '#24124e'], [1, '#100626']], pillarEdge: '#e0b850', vein: '#f0c860', rimW: '#ffe08a', rimC: '#c0a0ff',
    wood: [['#9a6a46', '#6a4030', '#2e1830'], ['#5a3028', '#241028']],
    void: '#08031a', under: '#ffd060', mush: ['#ffd860', '#c08aff', '#fff0b0'], crysGlow: ['#d0b0ff', '#8a50e0', '#5020c0'],
    stalEdge: '#e0b850', nearRock: '#0a0418', nearEdge: '#b88a30', nearRock2: '#06020e', nearEdge2: '#6a4a98', nearHues: ['plum', 'gold', 'violet', 'gold', 'plum'],
    stal: ['#ffe08a', '#c0a0ff', '#ffd060', '#c0a0ff'], motes: ['#ffe08a', '#d0b0ff'], fauna: 'gold', sparkle: '#ffe08a', warm: '#ffd060',
  },
};

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const stops = (s, extra) => s.map(x => `<stop offset="${x[0]}" stop-color="${x[1]}"${x[2] != null ? ` stop-opacity="${x[2]}"` : ''}/>`).join('');

function palDefs(P) {
  let d = '';
  const lg = (id, st, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => d += `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(st)}</linearGradient>`;
  const rg = (id, st, cx = .5, cy = .5, r = .5) => d += `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(st)}</radialGradient>`;
  lg('sky4', P.sky);
  lg('hazeUp', [[0, P.haze, 0], [.6, P.haze, .3], [1, P.haze, .38]]);
  lg('lakeFar', P.lake);
  lg('fall', P.fall, 0, 0, 1, 0);
  lg('fallV', P.fall, 0, 0, 0, 1);
  lg('pillar', P.pillar, 0, 0, 1, 0);
  lg('void', [[0, P.void, 0], [.4, P.void, .85], [1, P.void, .95]]);
  lg('wood', [[0, P.wood[0][0]], [.5, P.wood[0][1]], [1, P.wood[0][2]]]);
  lg('woodD', [[0, P.wood[1][0]], [1, P.wood[1][1]]]);
  { const dk = P === PAL[3] ? '#3a2008' : '#3a0c04'; lg('lava', [[0, dk], [.2, P.fall[3][1]], [.42, P.fall[2][1]], [.5, P.fall[0][1]], [.58, P.fall[2][1]], [.8, P.fall[3][1]], [1, dk]], 0, 0, 1, 0); }
  rg('warmWash', [[0, P.warm, .38], [1, P.warm, 0]]);
  rg('fallGlow', [[0, P.fallGlow, .9], [.3, P.fallGlow, .5], [.65, P.fallGlow, .16], [1, P.fallGlow, 0]]);
  rg('crysGlow', [[0, P.crysGlow[0], .6], [.5, P.crysGlow[1], .22], [1, P.crysGlow[2], 0]]);
  rg('lampGlow', [[0, '#fff2b8', .95], [.3, '#ffc850', .5], [1, '#ff9a20', 0]]);
  rg('doorGlowW', [[0, '#fff4c0', .95], [.35, P.door, .5], [1, P.door, 0]]);
  rg('lakeSheen', [[0, P.lakeGlow, .5], [1, P.lakeGlow, 0]]);
  return d;
}
const svgPage = (P, inner, w = 1600, h = 900) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${palDefs(P)}${B.defs}</defs>${inner}</svg>`;
// draw fn at x and at x +- 1600 if near an edge (seamless horizontal tile)
const W = (x, fn, m = 360) => fn(x) + (x < m ? fn(x + 1600) : '') + (x > 1600 - m ? fn(x - 1600) : '');

// ------------------------------------------------------------------ carved dwarf halls
const runes = (x, y, w, col) => { let o = ''; for (let rx = x + 6; rx < x + w - 6; rx += 12) o += `<path d="M${f(rx)},${y} l4,-4 l4,4 l-4,4 Z" fill="${col}" opacity=".55"/>`; return o; };
const facade = (P, x0, yb, w, floors, k = 1, hz = 0) => {
  let o = '';
  const th = 40 * k, H = floors * th, cx = x0 + w / 2;
  // the cliff the hall is carved into: broad faceted mound with strata
  const pts = [[x0 - 50 * k, yb]]; const n = 9;
  for (let i = 0; i <= n; i++) { const t = i / n, hh = (H + 56 * k) * (1 - Math.pow(Math.abs(t - .5) * 2, 2.2) * .85) + R(-10, 10) * k; pts.push([x0 - 40 * k + (w + 80 * k) * t, yb - hh]); }
  pts.push([x0 + w + 50 * k, yb]);
  o += `<polygon points="${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${P.cliff}"/>`;
  for (let i = 1; i < pts.length - 2; i++) o += `<polygon points="${f(pts[i][0])},${f(pts[i][1])} ${f(pts[i + 1][0])},${f(pts[i + 1][1])} ${f(cx)},${f(yb - H * .4)}" fill="${P.cliffHi}" opacity="${f(.12 + (i % 3) * .06)}"/>`;
  o += `<polyline points="${pts.slice(1, -1).map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="none" stroke="${P.cliffHi}" stroke-width="3" stroke-linejoin="round" opacity=".8"/>`;
  // battered (sloping) stepped tiers, carved flush into the rock
  let y = yb - 6 * k, tw = w;
  for (let fl = 0; fl < floors; fl++) {
    const inset = th * .09, ty = y - th, topw = tw - inset * 2, bx = cx - tw / 2, tx = cx - topw / 2;
    o += `<polygon points="${f(bx)},${f(y)} ${f(tx)},${f(ty)} ${f(tx + topw)},${f(ty)} ${f(bx + tw)},${f(y)}" fill="${fl % 2 ? P.tone2 : P.tone}"/>`;
    o += `<polygon points="${f(bx)},${f(y)} ${f(tx)},${f(ty)} ${f(tx + topw)},${f(ty)} ${f(bx + tw)},${f(y)}" fill="none" stroke="${P.edge}" stroke-width="1.6" stroke-opacity=".45" stroke-linejoin="round"/>`;
    o += `<rect x="${f(tx - 4 * k)}" y="${f(ty - 4 * k)}" width="${f(topw + 8 * k)}" height="${f(5 * k)}" fill="${P.tone}" stroke="${P.edge}" stroke-width="1.4" stroke-opacity=".6"/>`;
    // masonry courses + rune band
    o += `<path d="M${f(bx + 4)},${f(y - th * .3)} H${f(bx + tw - 4)}" stroke="${P.cliff}" stroke-width="1.4" opacity=".6"/>`;
    o += runes(tx + 4, ty + 9 * k, topw - 8, P.rune);
    // lit slit windows and small round-top niches
    const cols = Math.max(2, Math.round(tw / (34 * k)));
    for (let i = 0; i < cols; i++) {
      const wx = bx + tw * (i + .5) / cols, wy = ty + 16 * k; if (fl === 0 && Math.abs(wx - cx) < 34 * k) continue;
      if ((i + fl) % 2) o += `<path d="M${f(wx - 5 * k)},${f(y - 8 * k)} V${f(wy + 5 * k)} A${f(5 * k)},${f(5 * k)} 0 0 1 ${f(wx + 5 * k)},${f(wy + 5 * k)} V${f(y - 8 * k)} Z" fill="${P.win}" opacity="${f(R(.5, .85) - hz * .15)}"/>`;
      else o += `<rect x="${f(wx - 3 * k)}" y="${f(wy)}" width="${f(6 * k)}" height="${f(14 * k)}" fill="${P.win}" opacity="${f(R(.5, .9) - hz * .15)}"/><rect x="${f(wx - 5 * k)}" y="${f(wy - 3 * k)}" width="${f(10 * k)}" height="${f(3 * k)}" fill="${P.edge}" opacity=".55"/>`;
    }
    y = ty; tw = topw - 6 * k;
  }
  // battlements
  const topX = cx - tw / 2 - 2 * k;
  for (let bxx = topX; bxx < topX + tw + 4 * k - 8 * k; bxx += 14 * k) o += `<rect x="${f(bxx)}" y="${f(y - 12 * k)}" width="${f(8 * k)}" height="${f(12 * k)}" fill="${P.tone}" stroke="${P.edge}" stroke-width="1.2" stroke-opacity=".5"/>`;
  // forge stack + smoke tuft, hammer plaque
  const sxp = cx + w * .22; o += `<rect x="${f(sxp - 7 * k)}" y="${f(y - 46 * k)}" width="${f(14 * k)}" height="${f(40 * k)}" fill="${P.tone2}" stroke="${P.edge}" stroke-width="1.2" stroke-opacity=".5"/><rect x="${f(sxp - 10 * k)}" y="${f(y - 52 * k)}" width="${f(20 * k)}" height="${f(7 * k)}" fill="${P.tone}" stroke="${P.edge}" stroke-width="1.2" stroke-opacity=".5"/>`;
  // grand gate at the foot: three nested carved frames, warm hall inside, two fat statue columns
  const gw = Math.min(w * .3, 46 * k), gh = Math.min(th * 1.55, 62 * k), gy = yb - 6 * k;
  for (let s = 3; s >= 0; s--) { const gww = gw + s * 7 * k, ghh = gh + s * 6 * k; o += `<path d="M${f(cx - gww / 2)},${f(gy)} V${f(gy - ghh * .62)} A${f(gww / 2)},${f(ghh * .38)} 0 0 1 ${f(cx + gww / 2)},${f(gy - ghh * .62)} V${f(gy)} Z" fill="${s === 0 ? P.door : P.tone2}" stroke="${P.edge}" stroke-width="${f(1.6)}" stroke-opacity="${s === 0 ? 0 : .55}" opacity="${s === 0 ? f(.95 - hz * .25) : 1}"/>`; }
  o += `<path d="M${f(cx - gw * .3)},${f(gy)} V${f(gy - gh * .55)} A${f(gw * .3)},${f(gh * .3)} 0 0 1 ${f(cx + gw * .3)},${f(gy - gh * .55)} V${f(gy)} Z" fill="#fff4c8" opacity=".8"/>`;
  o += `<ellipse cx="${f(cx)}" cy="${f(gy - gh * .4)}" rx="${f(gw * 1.6)}" ry="${f(gh * .8)}" fill="url(#lampGlow)" opacity=".4"/>`;
  for (const sx of [-1, 1]) { const px = cx + sx * (gw / 2 + 17 * k); o += `<rect x="${f(px - 8 * k)}" y="${f(gy - gh * .95)}" width="${f(16 * k)}" height="${f(gh * .95)}" fill="${P.tone}" stroke="${P.edge}" stroke-width="1.4" stroke-opacity=".6"/><rect x="${f(px - 11 * k)}" y="${f(gy - gh)}" width="${f(22 * k)}" height="${f(7 * k)}" fill="${P.tone2}" stroke="${P.edge}" stroke-width="1.4" stroke-opacity=".6"/><rect x="${f(px - 10 * k)}" y="${f(gy - 6 * k)}" width="${f(20 * k)}" height="${f(6 * k)}" fill="${P.tone2}"/>` + [.3, .55, .78].map(q => `<path d="M${f(px - 8 * k)},${f(gy - gh * q)} h${f(16 * k)}" stroke="${P.edge}" stroke-width="1.6" opacity=".55"/>`).join(''); }
  o += `<rect x="${f(cx - gw / 2 - 30 * k)}" y="${f(gy - gh - 12 * k)}" width="${f(gw + 60 * k)}" height="${f(7 * k)}" fill="${P.tone}" stroke="${P.edge}" stroke-width="1.4" stroke-opacity=".6"/>` + runes(cx - gw / 2 - 26 * k, gy - gh - 6 * k, gw + 52 * k, P.rune);
  // steps
  for (let s = 0; s < 3; s++) o += `<rect x="${f(cx - gw / 2 - (14 + s * 10) * k)}" y="${f(gy - (3 - s) * 2.4 * k + 2 * k)}" width="${f(gw + (28 + s * 20) * k)}" height="${f(2.6 * k)}" fill="${P.edge}" opacity="${f(.5 - s * .1)}"/>`;
  // banner
  const bx = x0 + w * (.18 + rnd() * .2);
  o += `<path d="M${f(bx - 5)},${f(yb - H * .8)} h10 v${f(32 * k)} l-5,-7 l-5,7 Z" fill="${P.edge}" opacity=".5"/>`;
  return o;
};
const garch = (P, cx, yb, w, h, sw) => `<path d="M${cx - w / 2},${yb} V${yb - h * .55} A${w / 2},${h * .45} 0 0 1 ${cx + w / 2},${yb - h * .55} V${yb}" fill="none" stroke="${P.arch}" stroke-width="${sw}"/><path d="M${cx - w / 2 + sw / 2},${yb} V${yb - h * .55} A${w / 2 - sw / 2},${h * .45 - sw / 2} 0 0 1 ${cx + w / 2 - sw / 2},${yb - h * .55}" fill="none" stroke="${P.archHi}" stroke-width="3" opacity=".5"/>`;

// ------------------------------------------------------------------ FAR (opaque, 2000x900, slow ping-pong slide)
function farLayer(P, lv) {
  setSeed(100 + lv); const FW = 2000;
  let o = `<rect width="${FW}" height="900" fill="url(#sky4)"/>`;
  const S2 = 120;
  const rc = (x, y, j) => { const warm = Math.max(0, 1 - Math.hypot((x - P.warmC[0] - 200) * .8, (y - P.warmC[1]) * 1.2) / 760), base = Math.min(1, y / 700); const c = mix(P.rockA, P.rockB, base).map((v, i) => v + P.rockJ[i] * j + P.rockW[i] * warm); return `rgb(${c.map(v => Math.max(0, Math.min(255, v | 0))).join(',')})`; };
  for (let gy = -1; gy < 7; gy++) for (let gx = -1; gx < 18; gx++) {
    const pt = (i, j) => [(gx + i) * S2 + (((gx + i) * 73 + (gy + j) * 31) % 17 - 8) * 4, (gy + j) * S2 + (((gx + i) * 41 + (gy + j) * 57) % 13 - 6) * 4];
    const a = pt(0, 0), b = pt(1, 0), c = pt(1, 1), d = pt(0, 1), tr = rnd() < .5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
    for (const t of tr) { const col = rc((t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, rnd() * rnd()); o += `<polygon points="${t.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${col}" stroke="${col}" stroke-width=".8"/>`; }
  }
  // roof opening
  o += `<ellipse cx="1080" cy="-10" rx="260" ry="130" fill="${P.roof[0]}" opacity="${P.roofA}"/><ellipse cx="1080" cy="-10" rx="170" ry="80" fill="${P.roof[1]}" opacity="${P.roofA + .1}"/><ellipse cx="1080" cy="30" rx="420" ry="220" fill="${P.roof[2]}" opacity=".16"/>`;
  // far row (small, hazy) then main row of carved halls
  const hz = P.hazeA;
  o += `<g opacity=".8">` + facade(P, 20, 640, 120, 3, .62, 1) + facade(P, 210, 640, 96, 3, .6, 1) + facade(P, 640, 640, 130, 4, .6, 1) + facade(P, 1000, 640, 120, 3, .6, 1) + facade(P, 1420, 640, 130, 4, .62, 1) + facade(P, 1790, 640, 120, 3, .6, 1) + `</g>`;
  o += `<rect y="380" width="${FW}" height="320" fill="url(#hazeUp)" opacity=".5"/>`;
  o += garch(P, 380, 700, 540, 540, 34) + garch(P, 1150, 700, 380, 440, 28) + garch(P, 1780, 700, 440, 480, 30);
  o += facade(P, 120, 700, 200, 5, 1) + facade(P, 360, 700, 160, 4, 1) + facade(P, 590, 700, 240, 6, 1) + facade(P, 890, 700, 130, 3, 1) + facade(P, 1250, 700, 190, 4, 1) + facade(P, 1520, 700, 210, 5, 1);
  // stairs linking halls (diagonal carved flights)
  for (const [x1, y1, x2, y2] of [[330, 640, 392, 600], [840, 560, 892, 520], [1450, 640, 1500, 590]]) { let s = ''; for (let i = 0; i <= 8; i++) { const t = i / 8; s += `<rect x="${f(lerp(x1, x2, t))}" y="${f(lerp(y1, y2, t))}" width="12" height="4" fill="${P.edge}" opacity=".5"/>`; } o += s; }
  // lantern strings
  for (const [x1, x2, y] of [[130, 620, 560], [830, 1230, 520], [1500, 1960, 540]]) for (let x = x1; x < x2; x += 24) o += `<circle cx="${x}" cy="${f(y + Math.sin((x - x1) / (x2 - x1) * Math.PI) * 24)}" r="2.2" fill="${P.sparkle}" opacity=".8"/>`;
  // fauna
  if (P.fauna === 'bats') for (const [x, y, s] of [[640, 150, 1], [700, 190, .8], [1210, 250, .9], [380, 220, .7], [1650, 160, 1], [1700, 210, .7], [820, 330, .6]]) o += `<path transform="translate(${x} ${y}) scale(${s})" d="M0,0 q-8,-10 -22,-6 q6,2 8,8 q4,-6 10,-2 q4,-4 8,2 q2,-6 8,-2 q2,-6 8,-2 q-6,0 -8,6 q-8,-8 -22,-4 Z" fill="#0a0a30" opacity=".6"/>`;
  else for (let i = 0; i < 44; i++) o += `<circle cx="${f(R(0, FW))}" cy="${f(R(60, 640))}" r="${f(R(1.2, 3))}" fill="${P.sparkle}" opacity="${f(R(.25, .7))}"/>`;
  if (lv === 2) for (const sx of [300, 880, 1500]) o += `<ellipse cx="${sx}" cy="150" rx="150" ry="70" fill="#1a0806" opacity=".4"/><ellipse cx="${sx + 40}" cy="90" rx="110" ry="50" fill="#1a0806" opacity=".4"/>`;
  if (lv === 3) for (let i = 0; i < 14; i++) o += `<path d="M${f(R(40, FW - 40))},${f(R(40, 560))} l5,-12 l5,12 l-5,12 Z" fill="#fff0b0" opacity="${f(R(.3, .7))}"/>`;
  o += `<rect y="250" width="${FW}" height="470" fill="url(#hazeUp)" opacity="${P.hazeA}"/>`;
  // glowing pool / river at the bottom
  o += `<rect y="715" width="${FW}" height="185" fill="url(#lakeFar)"/><rect y="709" width="${FW}" height="10" fill="${P.lakeLine[0]}" opacity=".35"/>`;
  for (let i = 0; i < 60; i++) o += `<ellipse cx="${f(R(0, FW))}" cy="${f(R(722, 840))}" rx="${f(R(30, 150))}" ry="${f(R(1.2, 3))}" fill="${rnd() < .6 ? P.lakeLine[0] : P.lakeLine[1]}" opacity="${f(R(.12, .4))}"/>`;
  for (const x of [320, 1200, 1620]) o += `<ellipse cx="${x}" cy="760" rx="150" ry="34" fill="${P.lakeGlow}" opacity=".16"/>`;
  return svgPage(P, o, FW, 900);
}

// ------------------------------------------------------------------ the lavafall (real shape + glow)
function lavafall(P, cx, lv, gold) {
  let o = '';
  const top = 96, bot = 716, wTop = 62, wBot = 200;
  o += `<ellipse cx="${cx}" cy="420" rx="460" ry="560" fill="url(#fallGlow)"/><ellipse cx="${cx}" cy="330" rx="200" ry="300" fill="url(#fallGlow)" opacity=".6"/><ellipse cx="${cx}" cy="700" rx="330" ry="140" fill="url(#fallGlow)"/><ellipse cx="${cx}" cy="120" rx="220" ry="90" fill="url(#fallGlow)" opacity=".8"/>`;
  // light spill cones on the air
  o += `<polygon points="${cx - 30},${top + 40} ${cx + 30},${top + 40} ${cx + 260},${bot} ${cx - 260},${bot}" fill="${P.fallGlow}" opacity=".07"/>`;
  // rock mouth: jagged ledge with a chute
  const ledge = [[-210, 70], [-150, 40], [-96, 58], [-60, 36], [-34, top - 8], [34, top - 8], [64, 38], [110, 60], [170, 34], [220, 66], [236, 130], [150, 150], [74, 132], [40, top + 24], [-40, top + 24], [-78, 136], [-150, 156], [-224, 136]];
  o += `<path d="M${ledge.map(p => f(cx + p[0]) + ',' + f(p[1])).join(' L')} Z" fill="${P.void}" stroke="${P.fall[1][1]}" stroke-width="3.4" stroke-linejoin="round" stroke-opacity=".9"/>`;
  for (let i = 0; i < 8; i++) { const a = ledge[1 + i * 2] || ledge[2]; o += `<polygon points="${f(cx + a[0])},${f(a[1])} ${f(cx + a[0] + R(30, 60))},${f(a[1] + R(10, 40))} ${f(cx + a[0] - R(10, 40))},${f(a[1] + R(30, 60))}" fill="${P.cliffHi}" opacity=".3"/>`; }
  o += `<path d="M${f(cx - 40)},${top + 22} L${f(cx - 78)},${136} L${f(cx - 150)},${156} M${f(cx + 40)},${top + 22} L${f(cx + 74)},${132} L${f(cx + 150)},${150}" fill="none" stroke="${P.fall[1][1]}" stroke-width="3" opacity=".75"/>`;
  o += `<ellipse cx="${cx}" cy="${top + 12}" rx="46" ry="14" fill="${P.fall[0][1]}"/><ellipse cx="${cx}" cy="${top + 18}" rx="80" ry="26" fill="${P.fall[1][1]}" opacity=".5"/>`;
  // the stream: flaring ribbon with wavy edges
  const N = 64, L = [], Rr = [];
  for (let i = 0; i <= N; i++) { const t = i / N, y = lerp(top + 14, bot, t), w = lerp(wTop, wBot, Math.pow(t, 2.1)) * (1 + .025 * Math.sin(t * 19 + lv)), sw = Math.sin(t * 5 + lv) * 3 * t; L.push([cx + sw - w / 2 + Math.sin(t * 31 + 1) * 1.6, y]); Rr.push([cx + sw + w / 2 + Math.sin(t * 27 + 2) * 1.6, y]); }
  const ribbon = (k, extra = '') => { const pL = L.map(p => [cx + (p[0] - cx) * k, p[1]]), pR = Rr.map(p => [cx + (p[0] - cx) * k, p[1]]); return `M${pL.map(p => f(p[0]) + ',' + f(p[1])).join(' L')} L${pR.reverse().map(p => f(p[0]) + ',' + f(p[1])).join(' L')} Z`; };
  o += `<path d="${ribbon(1.2)}" fill="#3a0c04" opacity=".55"/>`;
  o += `<path d="${ribbon(1)}" fill="url(#lava)" stroke="${OUT}" stroke-width="3.4" stroke-linejoin="round"/>`;
  o += `<path d="${ribbon(.46)}" fill="${P.fall[0][1]}" opacity=".85"/>`;
  for (let i = 0; i < 7; i++) { const t = (i + .5) / 7 + R(-.03, .03), y = lerp(top + 14, bot, t), wv = lerp(wTop, wBot, Math.pow(t, 2.1)); o += `<path d="M${f(cx - wv * .46)},${f(y)} q${f(wv * .46)},${f(-10 - 8 * t)} ${f(wv * .92)},0" fill="none" stroke="${P.fall[0][1]}" stroke-width="${f(2 + 2 * t)}" stroke-linecap="round" opacity=".6"/>`; }
  // flow streaks and crust plates
  for (let i = 0; i < 26; i++) { const t0 = R(0, .55), t1 = t0 + R(.18, .4), u = R(-.4, .4); let d = ''; for (let s = 0; s <= 10; s++) { const t = lerp(t0, t1, s / 10), y = lerp(top + 14, bot, Math.min(1, t)), wv = lerp(wTop, wBot, Math.pow(Math.min(1, t), 2.1)); d += (s ? 'L' : 'M') + f(cx + u * wv + Math.sin(t * 24 + i) * 3) + ',' + f(y); } o += `<path d="${d}" fill="none" stroke="${i % 3 ? P.fall[0][1] : '#c8300c'}" stroke-width="${f(R(1.4, 3.2))}" stroke-linecap="round" opacity="${f(R(.35, .75))}"/>`; }
  for (let i = 0; i < 9; i++) { const t = R(.12, .9), y = lerp(top + 14, bot, t), wv = lerp(wTop, wBot, Math.pow(t, 2.1)), x = cx + R(-.36, .36) * wv; o += `<path d="M${f(x)},${f(y)} l${f(R(6, 11))},${f(R(2, 6))} l${f(R(-3, 3))},${f(R(8, 14))} l${f(R(-10, -5))},${f(-R(1, 4))} Z" fill="#2a0c06" stroke="${P.fall[1][1]}" stroke-width="1.6" opacity=".9"/>`; }
  // splash plume and mist at the base
  o += `<ellipse cx="${cx}" cy="${bot - 2}" rx="150" ry="30" fill="${P.fall[1][1]}" opacity=".5"/><ellipse cx="${cx}" cy="${bot - 6}" rx="108" ry="20" fill="${P.fall[0][1]}" opacity=".8"/>`;
  for (let i = 0; i < 22; i++) { const a = R(-1, 1), r = R(20, 120); o += `<circle cx="${f(cx + a * r * 1.2)}" cy="${f(bot - 10 - R(0, 1) * r * .9)}" r="${f(R(2, 7))}" fill="${i % 2 ? P.fall[0][1] : P.fall[1][1]}" opacity="${f(R(.4, .9))}"/>`; }
  for (let i = 0; i < 6; i++) o += `<ellipse cx="${f(cx + R(-100, 100))}" cy="${f(bot - R(20, 90))}" rx="${f(R(30, 70))}" ry="${f(R(12, 26))}" fill="${P.fall[0][1]}" opacity=".12"/>`;
  // embers drifting
  for (let i = 0; i < 18; i++) o += `<circle cx="${f(cx + R(-170, 170))}" cy="${f(R(120, 640))}" r="${f(R(1.2, 3))}" fill="${P.fall[0][1]}" opacity="${f(R(.35, .85))}"/>`;
  if (gold) for (let i = 0; i < 16; i++) o += `<ellipse cx="${f(cx + R(-wBot * .5, wBot * .5))}" cy="${f(R(180, 690))}" rx="6" ry="3.4" fill="#fff0a0" stroke="#7a4a10" stroke-width="1.4" transform="rotate(${f(R(-40, 40))} ${cx} 400)"/>`;
  return o;
}

// ------------------------------------------------------------------ FARMID (transparent, tile 1600)
function bridge(x1, y1, x2, y2, sag, P) { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag; let o = `<path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}" fill="none" stroke="#0a0a1c" stroke-width="3.4" opacity=".8"/><path d="M${x1},${y1 - 14} Q${mx},${my - 14} ${x2},${y2 - 14}" fill="none" stroke="#0a0a1c" stroke-width="1.8" opacity=".8"/>`; for (let i = 0; i <= 14; i++) { const t = i / 14, x = lerp(x1, x2, t), y = (1 - t) * (1 - t) * y1 + 2 * t * (1 - t) * my + t * t * y2; o += `<path d="M${f(x)},${f(y)} v-14" stroke="#0a0a1c" stroke-width="1.4" opacity=".8"/>`; if (i % 3 === 1) o += `<circle cx="${f(x)}" cy="${f(y - 18)}" r="3" fill="${P.sparkle}"/><circle cx="${f(x)}" cy="${f(y - 18)}" r="12" fill="url(#lampGlow)" opacity=".5"/>`; } return o; }
function farmidLayer(P, lv, inner) {
  setSeed(200 + lv);
  let o = '';
  const H = P.hues;
  // dust-lit god rays from the roof
  o += `<polygon points="740,-10 900,-10 1130,700 560,700" fill="#fff4c0" opacity=".045"/>`;
  // colossal spires (low contrast, hazy)
  const spires = [[40, 2.2, 0], [600, 1.3, 1], [1010, 1.6, 3], [1400, 1.4, 4]];
  o += `<g opacity=".36">` + spires.map(([x, s, i]) => W(x, xx => cluster(xx, 716, s, H[i], false), 420)).join('') + `</g>`;
  o += `<rect y="220" width="1600" height="500" fill="url(#hazeUp)" opacity=".5"/>`;
  // tiny bridges
  o += W(560, x => bridge(x, 400, x + 400, 380, 46, P), 700) + W(1180, x => bridge(x, 360, x + 380, 392, 40, P), 700);
  for (const [x, y] of [[760, 394], [820, 400], [1340, 392]]) o += `<rect x="${x - 2}" y="${y - 12}" width="4" height="11" fill="#0a0a1c" opacity=".8"/><circle cx="${x}" cy="${y - 15}" r="2.6" fill="#0a0a1c" opacity=".8"/><circle cx="${x + 3}" cy="${y - 8}" r="1.6" fill="${P.sparkle}"/>`;
  for (const fx of P.fallX) o += W(fx, x => lavafall(P, x, lv, lv === 3), 330);
  return inner ? o : svgPage(P, o);
}

// ------------------------------------------------------------------ MID (transparent, tile 1600)
function midLayer(P, lv, inner) {
  setSeed(300 + lv);
  let o = '';
  const pillar = (cx, w, top) => {
    let p = `<path d="M${cx - w / 2},900 L${cx - w / 2 + 6},${top + 20} L${cx - w * .2},${top} L${cx + w * .3},${top + 14} L${cx + w / 2},${top + 8} L${cx + w / 2 - 8},900 Z" fill="url(#pillar)" stroke="${P.pillarEdge}" stroke-width="3"/>`;
    for (let i = 0; i < 14; i++) { const y = R(top + 40, 700), x = cx + R(-w * .4, w * .3); p += `<path d="M${f(x)},${f(y)} l${f(R(10, 36))},${f(R(-14, 22))}" stroke="${P.vein}" stroke-width="${lv === 1 ? 2.4 : 3}" opacity="${lv === 1 ? .4 : .7}"/>`; }
    p += `<path d="M${cx + w / 2 - 8},900 L${cx + w / 2},${top + 8} L${cx + w / 2 - 14},${top + 12} L${cx + w / 2 - 22},900 Z" fill="${P.rimW}" opacity=".5"/><path d="M${cx - w / 2},900 L${cx - w / 2 + 6},${top + 20} L${cx - w / 2 + 14},${top + 20} L${cx - w / 2 + 10},900 Z" fill="${P.rimC}" opacity=".42"/>`;
    if (lv === 3) for (const y of [260, 420, 580]) p += `<rect x="${cx - w / 2 - 4}" y="${y}" width="${w + 8}" height="12" rx="3" fill="#e8b84a" stroke="${OUT}" stroke-width="2.4" opacity=".92"/><rect x="${cx - w / 2}" y="${y + 2}" width="${w}" height="3" fill="#fff0a0" opacity=".6"/>`;
    if (lv === 2) for (const y of [330, 520]) p += `<path d="M${cx - w / 2},${y} q${w / 2},-22 ${w},0" fill="none" stroke="#ff8a30" stroke-width="5" opacity=".7"/><path d="M${cx - w / 2},${y} q${w / 2},-22 ${w},0" fill="none" stroke="#fff0a0" stroke-width="2" opacity=".7"/>`;
    return p;
  };
  o += W(300, x => pillar(x, 110, 30), 200) + W(1030, x => pillar(x, 70, 150), 200);
  const tframe = (x, w) => { let t = `<rect x="${x - 7}" y="-6" width="14" height="${RAIL + 6}" fill="url(#woodD)" stroke="${OUT}" stroke-width="2.6"/><rect x="${x + w - 7}" y="-6" width="14" height="${RAIL + 6}" fill="url(#woodD)" stroke="${OUT}" stroke-width="2.6"/>`; for (const y of [150, 420]) t += `<rect x="${x - 12}" y="${y}" width="${w + 24}" height="14" fill="url(#wood)" stroke="${OUT}" stroke-width="2.6"/>`; if (lv === 3) for (const y of [150, 420]) t += `<rect x="${x - 12}" y="${y}" width="${w + 24}" height="4" fill="#ffe08a" opacity=".7"/>`; return t; };
  o += tframe(470, 120);
  for (const [lx, ly, ls] of [[690, 210, .8], [1120, 250, .85], [1330, 160, .75], [230, 150, .75], [900, 110, .6], [1500, 120, .7]]) o += `<path d="M${lx},-10 V${ly}" stroke="${OUT}" stroke-width="4.4"/><path d="M${lx},-10 V${ly}" stroke="#8a94a8" stroke-width="1.8" stroke-dasharray="5 3"/>` + lantern(lx, ly + 40 * ls, ls, 120 * ls);
  const Hm = P.hueMid;
  o += `<g opacity=".62">` + W(1480, x => cluster(x, 712, .62, Hm[0], false) + cluster(x - 120, 712, .34, Hm[1], false), 360) + W(120, x => cluster(x, 712, .66, Hm[0], false) + cluster(x + 130, 712, .3, Hm[2], false), 360) + W(1180, x => cluster(x, 712, .4, Hm[2], false), 300) + `</g>`;
  if (lv === 3) o += W(800, x => { let t = `<ellipse cx="${x}" cy="840" rx="220" ry="40" fill="#ffd060" opacity=".14"/>`; t += B.heap2(x, 840, 300, 90, 60, 20); return t; }, 300);
  return inner ? o : svgPage(P, o);
}

// ------------------------------------------------------------------ TRACK (transparent, tile 1600, baked 1600x230 at y 670)
function trackLayer(P, lv, inner) {
  setSeed(400 + lv);
  let o = '';
  for (const bx of [200, 600, 1000, 1400]) {
    o += `<rect x="${bx - 46}" y="${RAIL + 36}" width="16" height="170" fill="url(#woodD)" stroke="${OUT}" stroke-width="3"/><rect x="${bx + 30}" y="${RAIL + 36}" width="16" height="170" fill="url(#woodD)" stroke="${OUT}" stroke-width="3"/>`;
    o += `<path d="M${bx - 30},${RAIL + 44} L${bx + 30},${RAIL + 130} M${bx + 30},${RAIL + 44} L${bx - 30},${RAIL + 130}" stroke="${OUT}" stroke-width="10" stroke-linecap="round"/><path d="M${bx - 30},${RAIL + 44} L${bx + 30},${RAIL + 130} M${bx + 30},${RAIL + 44} L${bx - 30},${RAIL + 130}" stroke="#9a5a28" stroke-width="5" stroke-linecap="round" opacity="${lv === 1 ? 1 : .8}"/>`;
  }
  o += `<rect x="-6" y="${RAIL + 24}" width="1612" height="16" fill="url(#woodD)" stroke="${OUT}" stroke-width="3"/><rect x="-6" y="${RAIL + 26}" width="1612" height="4" fill="#d09050" opacity=".4"/>`;
  for (let k = -1; k <= 20; k++) { const x = k * 80 + 14; o += `<rect x="${x}" y="${RAIL + 6}" width="44" height="20" rx="3" fill="url(#wood)" stroke="${OUT}" stroke-width="3"/><rect x="${x + 4}" y="${RAIL + 9}" width="36" height="4" fill="#e0a560" opacity=".45"/>`; }
  o += `<rect x="-6" y="${RAIL - 14}" width="1612" height="6" fill="#3a4258" stroke="${OUT}" stroke-width="2"/><rect x="-6" y="${RAIL - 3}" width="1612" height="14" fill="url(#steel)" stroke="${OUT}" stroke-width="3"/><path d="M-6,${RAIL} H1606" stroke="#fff" stroke-width="2.4" opacity=".7"/>`;
  for (let k = 0; k < 10; k++) o += `<rect x="${k * 160 + 30}" y="${RAIL - 8}" width="12" height="24" fill="#2a3244" stroke="${OUT}" stroke-width="2"/>`;
  // under-glow, per depth
  if (lv === 1) for (const [x, y, s, c] of [[120, RAIL + 26, 1.1, 0], [150, RAIL + 28, .7, 0], [440, RAIL + 26, .9, 1], [770, RAIL + 26, 1, 0], [1210, RAIL + 26, 1.1, 2], [1240, RAIL + 28, .7, 1], [1530, RAIL + 26, .9, 0]]) o += mush(x, y, s, P.mush[c]);
  if (lv === 2) { for (const x of [100, 520, 940, 1340]) o += `<ellipse cx="${x}" cy="${RAIL + 40}" rx="130" ry="22" fill="#ff7a20" opacity=".35"/><path d="M${x - 60},${RAIL + 40} q20,-10 40,0 t40,0 t40,0" fill="none" stroke="#fff0a0" stroke-width="3" opacity=".8"/>`; for (let i = 0; i < 20; i++) o += `<circle cx="${f(R(0, 1600))}" cy="${f(RAIL + R(30, 100))}" r="${f(R(1.2, 3))}" fill="#ffd070" opacity="${f(R(.4, .9))}"/>`; }
  if (lv === 3) { for (const [x, w] of [[180, 160], [640, 190], [1120, 170], [1470, 140]]) o += B.heap2(x, RAIL + 42, w, 30, 26, 11); for (let i = 0; i < 10; i++) o += spark(R(20, 1580), RAIL + R(24, 80), R(5, 10), .85); }
  for (let i = 0; i < 26; i++) { const x = R(0, 1600); o += `<ellipse cx="${f(x)}" cy="${RAIL + 40}" rx="${f(R(6, 18))}" ry="3.4" fill="${P.under}" opacity="${f(R(.35, .75))}"/>`; }
  return inner ? o : svgPage(P, o);
}

// ------------------------------------------------------------------ NEAR (transparent, tile 1600)
function nearLayer(P, lv, inner) {
  setSeed(500 + lv);
  let o = '';
  const wrapRow = (y0, amp, col, edge) => { const n = 20, ys = []; for (let i = 0; i < n; i++) ys.push(y0 - R(0, amp)); ys.push(ys[0]); let d = `M-20,910 L-20,${f(ys[0])}`; ys.forEach((y, i) => d += ` L${i * 80},${f(y)}`); d += ` L1620,${f(ys[0])} L1620,910 Z`; return `<path d="${d}" fill="${col}" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/>`; };
  o += wrapRow(850, 40, P.nearRock, P.nearEdge) + wrapRow(878, 22, P.nearRock2, P.nearEdge2);
  const nh = P.nearHues;
  o += W(80, x => cluster(x, 910, .66, nh[0], false), 300) + cluster(220, 914, .36, nh[1], false) + W(1520, x => cluster(x, 912, .6, nh[2], false), 300) + cluster(1390, 916, .34, nh[3], false) + cluster(780, 918, .3, nh[4], false);
  o += `<ellipse cx="130" cy="850" rx="200" ry="70" fill="url(#crysGlow)" opacity=".5"/><ellipse cx="1390" cy="850" rx="200" ry="70" fill="url(#crysGlow)" opacity=".5"/>`;
  const stal = (x, w, h, hue) => `<path d="M${x - w},-8 L${x - w * .4},${h * .6} L${x},${h} L${x + w * .5},${h * .5} L${x + w},-8 Z" fill="#070a24" stroke="${P.stalEdge}" stroke-width="3" stroke-linejoin="round"/><path d="M${x - w * .4},${h * .6} L${x},${h} L${x + w * .5},${h * .5}" fill="none" stroke="${hue}" stroke-width="3" opacity=".7"/>`;
  [[560, 60, 90], [800, 80, 130], [1180, 60, 100], [1540, 70, 110]].forEach(([x, w, h], i) => o += W(x, xx => stal(xx, w, h, P.stal[i]), 120));
  for (const [x, w, h] of [[520, 110, 60], [1010, 90, 46], [1250, 70, 36]]) o += `<path d="M${x - w},910 L${x - w * .8},${900 - h * .5} L${x - w * .2},${900 - h} L${x + w * .5},${900 - h * .7} L${x + w},910 Z" fill="${P.nearRock}" stroke="${P.nearEdge}" stroke-width="3" stroke-linejoin="round"/>`;
  for (let i = 0; i < 40; i++) { const x = R(24, 1576), y = R(60, 800), r = R(1.4, 3.4), c = P.motes[i % 2]; o += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 4)}" fill="${c}" opacity=".12"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" opacity="${f(R(.4, .9))}"/>`; }
  return inner ? o : svgPage(P, o);
}

// ------------------------------------------------------------------ exit burst overlay (daylight)
function exitLayer() {
  const P = PAL[1]; let o = '';
  const cx = 1538, cy = 650;
  o += `<defs><radialGradient id="eb" cx="${cx}" cy="${cy}" r="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff" stop-opacity="1"/><stop offset=".12" stop-color="#fff6c8" stop-opacity=".95"/><stop offset=".35" stop-color="#ffe08a" stop-opacity=".55"/><stop offset=".7" stop-color="#ffb040" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a20" stop-opacity="0"/></radialGradient></defs>`;
  o += `<rect width="1600" height="900" fill="url(#eb)"/>`;
  for (let i = 0; i < 18; i++) { const a = Math.PI + (i / 17) * Math.PI * .95 - .1 + R(-.05, .05), w = R(.03, .07), L = 1600; const x1 = cx + Math.cos(a - w) * L, y1 = cy + Math.sin(a - w) * L, x2 = cx + Math.cos(a + w) * L, y2 = cy + Math.sin(a + w) * L; o += `<polygon points="${cx},${cy} ${f(x1)},${f(y1)} ${f(x2)},${f(y2)}" fill="#fff8d0" opacity="${f(R(.12, .3))}"/>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">${o}</svg>`;
}


// ======================= TALL layers: 1600 wide (tileable) x 1950 tall, rail at y 1210 (= landscape y 718 + 492) =======================
const DY = 492, HT = 1950;
const hsh = (a, b, c = 0) => { const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return v - Math.floor(v); };
function farTall(P, lv) {
  setSeed(100 + lv); const FW = 1600, N = 16, S2 = FW / N;
  let o = `<rect width="${FW}" height="${HT}" fill="url(#sky4)"/>`;
  const rc = (x, y, j) => { const dx = Math.min(Math.abs(x - P.warmC[0]), Math.abs(x - P.warmC[0] + FW), Math.abs(x - P.warmC[0] - FW)); const warm = Math.max(0, 1 - Math.hypot(dx * .8, (y - P.warmC[1] - DY) * 1.2) / 760), base = Math.max(0, Math.min(1, (y - DY * .4) / 700)); const c = mix(P.rockA, P.rockB, base).map((v, i) => v + P.rockJ[i] * j + P.rockW[i] * warm); return `rgb(${c.map(v => Math.max(0, Math.min(255, v | 0))).join(',')})`; };
  const gs = Math.ceil(HT / S2) + 1;
  for (let gy = -1; gy < gs; gy++) for (let gx = 0; gx < N; gx++) {
    const pt = (i, j) => { const m = ((gx + i) % N + N) % N; return [(gx + i) * S2 + (hsh(m, gy + j, 1) - .5) * 32, (gy + j) * S2 + (hsh(m, gy + j, 2) - .5) * 32]; };
    const a = pt(0, 0), b = pt(1, 0), c = pt(1, 1), d = pt(0, 1), tr = hsh(gx, gy, 3) < .5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
    tr.forEach((t, k) => { const col = rc((t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, hsh(gx, gy, 4 + k) * hsh(gx, gy, 6 + k)); o += `<polygon points="${t.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${col}" stroke="${col}" stroke-width=".8"/>`; });
  }
  // the skylight shaft: opening (kept at landscape position) + a bright chimney going up to the top
  o += `<polygon points="910,${DY - 10} 1250,${DY - 10} 1330,0 830,0" fill="${P.roof[0]}" opacity="${P.roofA * .55}"/><polygon points="960,${DY - 10} 1200,${DY - 10} 1260,0 900,0" fill="${P.roof[1]}" opacity="${P.roofA * .6}"/>`;
  o += `<ellipse cx="1080" cy="${DY - 10}" rx="260" ry="130" fill="${P.roof[0]}" opacity="${P.roofA}"/><ellipse cx="1080" cy="${DY - 10}" rx="170" ry="80" fill="${P.roof[1]}" opacity="${P.roofA + .1}"/><ellipse cx="1080" cy="${DY + 30}" rx="420" ry="220" fill="${P.roof[2]}" opacity=".16"/>`;
  // big soft stalactites hanging from the ceiling (far, low contrast)
  [[120, 120, 380], [340, 90, 260], [560, 130, 420], [760, 70, 220], [1400, 120, 360], [1560, 80, 280], [1230, 60, 200]].forEach(([x, w, h]) => { o += W(x, xx => `<path d="M${xx - w},-10 L${xx - w * .3},${h * .6} L${xx},${h} L${xx + w * .35},${h * .55} L${xx + w},-10 Z" fill="${P.cliff}" stroke="${P.cliffHi}" stroke-width="3" stroke-linejoin="round" opacity=".7"/>`, 200); });
  o += `<rect y="0" width="${FW}" height="${DY + 100}" fill="url(#hazeUp)" opacity="${P.hazeA * .35}"/>`;
  // band content (unchanged from the landscape art), shifted into place
  let g = '';
  const hz = P.hazeA;
  g += `<g opacity=".8">` + [[20, 120, 3], [210, 96, 3], [640, 130, 4], [1000, 120, 3], [1420, 130, 4]].map(([x, w, fl]) => W(x, xx => facade(P, xx, 640, w, fl, .62, 1), 260)).join('') + `</g>`;
  g += `<rect y="380" width="${FW}" height="320" fill="url(#hazeUp)" opacity=".5"/>`;
  g += W(380, x => garch(P, x, 700, 540, 540, 34), 340) + W(1090, x => garch(P, x, 700, 380, 440, 28), 340) + W(1560, x => garch(P, x, 700, 440, 480, 30), 340);
  g += [[120, 200, 5], [360, 160, 4], [590, 240, 6], [890, 130, 3], [1250, 190, 4], [1520, 210, 5]].map(([x, w, fl]) => W(x, xx => facade(P, xx, 700, w, fl, 1), 300)).join('');
  for (const [x1, y1, x2, y2] of [[330, 640, 392, 600], [840, 560, 892, 520], [1450, 640, 1500, 590]]) { for (let i = 0; i <= 8; i++) { const t = i / 8; g += `<rect x="${f(lerp(x1, x2, t))}" y="${f(lerp(y1, y2, t))}" width="12" height="4" fill="${P.edge}" opacity=".5"/>`; } }
  for (const [x1, x2, y] of [[130, 620, 560], [830, 1230, 520], [1300, 1580, 540]]) for (let x = x1; x < x2; x += 24) g += `<circle cx="${x}" cy="${f(y + Math.sin((x - x1) / (x2 - x1) * Math.PI) * 24)}" r="2.2" fill="${P.sparkle}" opacity=".8"/>`;
  if (P.fauna === 'bats') for (const [x, y, s] of [[640, 150, 1], [700, 190, .8], [1210, 250, .9], [380, 220, .7], [1450, 160, 1], [1500, 210, .7], [820, 330, .6]]) g += `<path transform="translate(${x} ${y}) scale(${s})" d="M0,0 q-8,-10 -22,-6 q6,2 8,8 q4,-6 10,-2 q4,-4 8,2 q2,-6 8,-2 q2,-6 8,-2 q-6,0 -8,6 q-8,-8 -22,-4 Z" fill="#0a0a30" opacity=".6"/>`;
  else for (let i = 0; i < 40; i++) g += `<circle cx="${f(R(0, FW))}" cy="${f(R(60, 640))}" r="${f(R(1.2, 3))}" fill="${P.sparkle}" opacity="${f(R(.25, .7))}"/>`;
  if (lv === 3) for (let i = 0; i < 12; i++) g += `<path d="M${f(R(40, FW - 40))},${f(R(40, 560))} l5,-12 l5,12 l-5,12 Z" fill="#fff0b0" opacity="${f(R(.3, .7))}"/>`;
  g += `<rect y="250" width="${FW}" height="470" fill="url(#hazeUp)" opacity="${P.hazeA}"/>`;
  o += `<g transform="translate(0 ${DY})">${g}</g>`;
  // ceiling haze + deep lake / chasm below the rail
  const ly = DY + 715;
  o += `<rect y="${ly}" width="${FW}" height="${HT - ly}" fill="url(#lakeFar)"/><rect y="${ly - 6}" width="${FW}" height="10" fill="${P.lakeLine[0]}" opacity=".35"/>`;
  for (let i = 0; i < 70; i++) { const y = R(ly + 8, ly + 130); o += `<ellipse cx="${f(R(0, FW))}" cy="${f(y)}" rx="${f(R(30, 150))}" ry="${f(R(1.2, 3))}" fill="${rnd() < .6 ? P.lakeLine[0] : P.lakeLine[1]}" opacity="${f(R(.12, .4))}"/>`; }
  for (const x of [320, 1200]) o += `<ellipse cx="${x}" cy="${ly + 45}" rx="150" ry="34" fill="${P.lakeGlow}" opacity=".16"/>`;
  // depth: dark spires rising from the abyss with a glowing rim, soft glow patches, drifting glints
  for (let i = 0; i < 9; i++) { const x = R(0, FW), w = R(40, 120), h = R(160, 420), y0 = HT + 10; o += W(x, xx => `<path d="M${f(xx - w)},${y0} L${f(xx - w * .3)},${f(y0 - h * .7)} L${f(xx)},${f(y0 - h)} L${f(xx + w * .4)},${f(y0 - h * .6)} L${f(xx + w)},${y0} Z" fill="${P.void}" opacity=".78" stroke="${P.lakeGlow}" stroke-width="2.4" stroke-opacity=".28"/>`, 150); }
  for (let i = 0; i < 6; i++) o += `<ellipse cx="${f(R(100, 1500))}" cy="${f(R(ly + 160, HT - 80))}" rx="${f(R(120, 260))}" ry="${f(R(26, 60))}" fill="${P.lakeGlow}" opacity="${f(R(.05, .12))}"/>`;
  for (let i = 0; i < 40; i++) o += `<circle cx="${f(R(0, FW))}" cy="${f(R(ly + 40, HT - 20))}" r="${f(R(1.2, 3.2))}" fill="${P.lakeLine[0]}" opacity="${f(R(.2, .6))}"/>`;
  o += `<rect y="${ly + 120}" width="${FW}" height="${HT - ly - 120}" fill="${P.void}" opacity=".35"/>`;
  return svgPage(P, o, FW, HT);
}
function farmidTall(P, lv) {
  const inner = farmidLayer(P, lv, true); setSeed(250 + lv);
  let o = '';
  o += `<polygon points="860,0 1300,0 1130,${DY} 740,${DY}" fill="#fff4c0" opacity=".05"/>`;
  // hanging crystals from the ceiling (hazy)
  [[200, 1.3, 0], [640, .9, 1], [980, 1.5, 2], [1330, 1.1, 3], [1520, .8, 4]].forEach(([x, s, i]) => { o += `<g opacity=".4">` + W(x, xx => `<g transform="translate(${xx} 0) scale(1 -1)">${cluster(0, -20, s, P.hues[i % P.hues.length], false)}</g>`, 300) + `</g>`; });
  // the rock the lavafall pours out of: a cliff mass from the ceiling down to the ledge
  for (const fx of P.fallX) o += W(fx, x => `<path d="M${x - 330},-10 L${x + 330},-10 L${x + 260},200 L${x + 236},${DY + 40} L${x - 224},${DY + 36} L${x - 250},230 Z" fill="${P.void}" stroke="${P.fall[1][1]}" stroke-width="3" stroke-opacity=".55" stroke-linejoin="round"/><path d="M${x - 250},230 L${x - 150},120 L${x - 60},260 L${x + 20},140 L${x + 120},280 L${x + 260},200" fill="none" stroke="${P.cliffHi}" stroke-width="3" opacity=".45"/><ellipse cx="${x}" cy="${DY - 20}" rx="150" ry="90" fill="url(#fallGlow)" opacity=".5"/>`, 360);
  o += `<g transform="translate(0 ${DY})">${inner}</g>`;
  // depth below: hazy crystal spires climbing out of the abyss
  [[100, 2.4, 0], [520, 1.8, 1], [900, 2.6, 2], [1280, 1.9, 3], [1500, 2.2, 4]].forEach(([x, s, i]) => { o += `<g opacity=".3">` + W(x, xx => cluster(xx, HT + 10, s, P.hues[i % P.hues.length], false), 420) + `</g>`; });
  o += `<rect y="${DY + 740}" width="1600" height="${HT - DY - 740}" fill="url(#hazeUp)" opacity=".25"/>`;
  return svgPage(P, o, 1600, HT);
}
function midTall(P, lv) {
  const inner = midLayer(P, lv, true); setSeed(350 + lv);
  let o = '';
  // continuation of pillars and frame posts up to the ceiling
  const col = (cx, w) => `<rect x="${cx - w / 2 + 3}" y="-10" width="${w - 8}" height="${DY + 60}" fill="url(#pillar)"/><path d="M${cx - w / 2 + 3},-10 V${DY + 60} M${cx + w / 2 - 5},-10 V${DY + 60}" stroke="${P.pillarEdge}" stroke-width="3"/><path d="M${cx + w / 2 - 14},-10 V${DY + 60} " stroke="${P.rimW}" stroke-width="6" opacity=".4"/>` + Array.from({ length: 9 }, () => { const y = R(20, DY), x = cx + R(-w * .4, w * .3); return `<path d="M${f(x)},${f(y)} l${f(R(10, 36))},${f(R(-14, 22))}" stroke="${P.vein}" stroke-width="2.6" opacity=".5"/>`; }).join('');
  o += W(300, x => col(x, 110), 200) + W(1030, x => col(x, 70), 200);
  o += `<rect x="463" y="-10" width="14" height="${DY + 30}" fill="url(#woodD)" stroke="${OUT}" stroke-width="2.6"/><rect x="583" y="-10" width="14" height="${DY + 30}" fill="url(#woodD)" stroke="${OUT}" stroke-width="2.6"/>`;
  for (const y of [110, 300]) o += `<rect x="458" y="${y}" width="144" height="14" fill="url(#wood)" stroke="${OUT}" stroke-width="2.6"/>`;
  // chains: the old ones go up to the top; plus new ceiling lanterns at different heights
  for (const lx of [690, 1120, 1330, 230, 900, 1500]) o += `<path d="M${lx},-10 V${DY}" stroke="${OUT}" stroke-width="4.4"/><path d="M${lx},-10 V${DY}" stroke="#8a94a8" stroke-width="1.8" stroke-dasharray="5 3"/>`;
  for (const [lx, ly, ls] of [[160, 150, .7], [560, 80, .6], [800, 250, .75], [1250, 120, .65], [1430, 320, .7], [400, 330, .6]]) o += `<path d="M${lx},-10 V${ly}" stroke="${OUT}" stroke-width="4.4"/><path d="M${lx},-10 V${ly}" stroke="#8a94a8" stroke-width="1.8" stroke-dasharray="5 3"/>` + lantern(lx, ly + 40 * ls, ls, 120 * ls);
  o += `<g transform="translate(0 ${DY})">${inner}</g>`;
  // below: the pillars keep falling into the dark
  const colb = (cx, w) => `<rect x="${cx - w / 2 + 3}" y="${DY + 880}" width="${w - 8}" height="${HT - DY - 870}" fill="url(#pillar)"/><path d="M${cx - w / 2 + 3},${DY + 880} V${HT} M${cx + w / 2 - 5},${DY + 880} V${HT}" stroke="${P.pillarEdge}" stroke-width="3"/>`;
  o += W(300, x => colb(x, 110), 200) + W(1030, x => colb(x, 70), 200);
  o += `<defs><linearGradient id="fadeDn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.void}" stop-opacity="0"/><stop offset="1" stop-color="${P.void}" stop-opacity=".9"/></linearGradient></defs><rect y="${DY + 900}" width="1600" height="${HT - DY - 900}" fill="url(#fadeDn)"/>`;
  return svgPage(P, o, 1600, HT);
}
function nearTall(P, lv) {
  const inner = nearLayer(P, lv, true); setSeed(550 + lv);
  let o = '';
  // ceiling rows hanging above the old band
  const row = (base, amp, fill, edge) => { const n = 20, ys = []; for (let i = 0; i < n; i++) ys.push(base + R(0, amp)); ys.push(ys[0]); let d = `M-20,-10 L-20,${f(ys[0])}`; ys.forEach((y, i) => d += ` L${i * 80},${f(y)}`); d += ` L1620,${f(ys[0])} L1620,-10 Z`; return `<path d="${d}" fill="${fill}" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/>`; };
  o += row(20, 50, P.nearRock2, P.nearEdge2) + row(0, 34, P.nearRock, P.nearEdge);
  [[560, 60, 0], [800, 80, 1], [1180, 60, 2], [1540, 70, 3]].forEach(([x, w, i]) => o += W(x, xx => `<path d="M${xx - w * .4},-10 L${xx - w * .9},${DY + 2} L${xx + w * .9},${DY + 2} L${xx + w * .4},-10 Z" fill="#070a24" stroke="${P.stalEdge}" stroke-width="3" stroke-linejoin="round"/><path d="M${xx + w * .5},0 L${xx + w * .6},${DY}" stroke="${P.stal[i]}" stroke-width="3" opacity=".5"/>`, 120));
  [[250, 40, 150], [680, 50, 190], [1000, 36, 120], [1400, 44, 170]].forEach(([x, w, h]) => o += W(x, xx => `<path d="M${xx - w},30 L${xx - w * .3},${30 + h * .6} L${xx},${30 + h} L${xx + w * .4},${30 + h * .55} L${xx + w},30 Z" fill="#070a24" stroke="${P.stalEdge}" stroke-width="3" stroke-linejoin="round"/>`, 120));
  o += `<g transform="translate(0 ${DY})">${inner}</g>`;
  // below the old floor rows: the foreground rock mass keeps going, with crystals
  const nh = P.nearHues;
  [[140, .9, 0], [560, .6, 2], [900, .8, 1], [1300, 1, 3], [1530, .6, 4]].forEach(([x, s, i]) => o += W(x, xx => cluster(xx, HT + 20, s, nh[i], false), 300));
  for (let i = 0; i < 40; i++) { const x = R(24, 1576), y = R(60, HT - 60), r = R(1.4, 3.4), c = P.motes[i % 2]; o += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 4)}" fill="${c}" opacity=".1"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" opacity="${f(R(.4, .9))}"/>`; }
  return svgPage(P, o, 1600, HT);
}
const T_ = { 'far-t': farTall, 'farmid-t': farmidTall, 'mid-t': midTall, 'near-t': nearTall };
for (const lv of [1, 2, 3]) for (const [n, fn] of Object.entries(T_)) fs.writeFileSync(path.join(__dirname, 'bake', `${n}-lv${lv}.svg`), fn(PAL[lv], lv));

const W_ = { far: farLayer, farmid: farmidLayer, mid: midLayer, track: trackLayer, near: nearLayer };
for (const lv of [1, 2, 3]) for (const [n, fn] of Object.entries(W_)) fs.writeFileSync(path.join(__dirname, 'bake', `${n}-lv${lv}.svg`), fn(PAL[lv], lv));
fs.writeFileSync(path.join(__dirname, 'bake', 'exit.svg'), exitLayer());
module.exports = { PAL };
console.log('world svgs written');
