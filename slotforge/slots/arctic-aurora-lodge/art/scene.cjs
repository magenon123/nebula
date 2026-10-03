// Static scene (1600x900) -> bake/scene-static.svg  (+ curtains cur1..3.svg).  node scene.cjs
const fs = require('fs'), path = require('path');
const { rng } = require('./lib.cjs');
const R = rng(20261003); const f = n => +(+n).toFixed(1);
const W = 1600, H = 900, HZ = 500;
const out = path.join(__dirname, 'bake'); fs.mkdirSync(out, { recursive: true });
// ---------- stars
let stars = ''; for (let i = 0; i < 520; i++) { const x = R() * W, y = Math.pow(R(), 1.6) * HZ * .95; const big = R() < .05, r = big ? 1.7 : R() < .3 ? 1.05 : .65; const o = (.4 + R() * .6) * (1 - y / HZ * .55);
  const c = R() < .14 ? '#cfe4ff' : R() < .2 ? '#ffe9c8' : '#fff'; stars += `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${c}" opacity="${o.toFixed(2)}"/>`; if (big) stars += `<circle cx="${f(x)}" cy="${f(y)}" r="7" fill="url(#gStar)" opacity=".55"/><path d="M${f(x - 6)} ${f(y)}H${f(x + 6)}M${f(x)} ${f(y - 6)}V${f(y + 6)}" stroke="#fff" stroke-opacity=".5" stroke-width=".6"/>`; }
// ---------- trees (drooping boughs, snow on top, aurora rim)
function tree(x, base, h, w, o = {}) {
  const tiers = 7 + Math.floor(R() * 3), top = base - h; let L = [], Rr = [];
  const dx = (t) => (R() - .5) * w * .1; // asymmetry
  let d = `M${f(x)} ${f(top)}`; const left = [], right = [];
  for (let i = 0; i < tiers; i++) { const t = (i + 1) / tiers, y = top + h * (t * .97), ww = w * (.18 + .82 * Math.pow(t, .9)) * (.88 + R() * .24), sag = h / tiers * (.9 + R() * .5);
    left.push([x - ww, y + sag * .55, x - ww * .55, y - sag * .05]); right.push([x + ww, y + sag * .55, x + ww * .55, y - sag * .05]); }
  // left side down, then trunk, then right side up (scalloped boughs)
  let prevX = x, prevY = top;
  left.forEach((p, i) => { d += `Q${f(p[2])} ${f(prevY + (p[1] - prevY) * .15)} ${f(p[0])} ${f(p[1])}L${f(x - (p[0] < x ? (x - p[0]) * .42 : 0))} ${f(p[1] - h / tiers * .12)}`; prevY = p[1] - h / tiers * .12; });
  d += `L${f(x - w * .06)} ${f(base + 4)}L${f(x + w * .06)} ${f(base + 4)}`;
  const rev = right.slice().reverse(); rev.forEach((p, i) => { const nextY = i < rev.length - 1 ? rev[i + 1][1] : top; d += `L${f(x + (p[0] - x) * .42)} ${f(p[1] - h / tiers * .12)}L${f(p[0])} ${f(p[1])}Q${f(p[2])} ${f(p[1] - h / tiers * .75)} ${f(x + (p[0] - x) * .5)} ${f(nextY + h / tiers * .1)}`; });
  d += 'Z';
  let rim = '', snow = '';
  left.forEach((p, i) => { const t = (i + 1) / tiers; if (o.rim) rim += `M${f(x - (x - p[0]) * .15)} ${f(p[1] - h / tiers * .85)}Q${f(p[2])} ${f(p[1] - h / tiers * .4)} ${f(p[0])} ${f(p[1])}`; if (o.snow) snow += `<path d="M${f(x - (x - p[0]) * .1)} ${f(p[1] - h / tiers * .9)}Q${f(p[2])} ${f(p[1] - h / tiers * .55)} ${f(p[0] * .985 + x * .015)} ${f(p[1] - 1)}Q${f(p[2] + 3)} ${f(p[1] - h / tiers * .25)} ${f(x - (x - p[0]) * .2)} ${f(p[1] - h / tiers * .55)}Z" fill="#cfeaf8" opacity="${o.snow}"/>`; });
  return `<path d="${d}" fill="${o.fill}"/>${o.snow ? snow : ''}${o.rim ? `<path d="${rim}" fill="none" stroke="#7dffc4" stroke-opacity="${o.rim}" stroke-width="1" stroke-linecap="round"/>` : ''}`;
}
const trees = (list, o) => list.map(([x, b, h, w]) => tree(x, b, h, w, o)).join('');
let farT = []; for (let x = -10; x < 1620; x += 7 + R() * 9) { const h = 22 + R() * 26; farT.push([x, HZ + 2, h, h * .24]); }
let farT2 = []; for (let x = -10; x < 1620; x += 12 + R() * 16) { const h = 40 + R() * 46; farT2.push([x, HZ + 6, h, h * .26]); }
// ---------- lake details
function crack(x, y, ang, len, depth = 0) { let d = `M${f(x)} ${f(y)}`, segs = ''; let px = x, py = y, a = ang; const n = Math.floor(len / 26);
  for (let i = 0; i < n; i++) { a += (R() - .5) * .7; const l = 16 + R() * 26; px += Math.cos(a) * l; py += Math.sin(a) * l * .5; d += `L${f(px)} ${f(py)}`; if (depth < 2 && R() < .3) segs += crack(px, py, a + (R() < .5 ? 1 : -1) * (.5 + R() * .6), len * .5, depth + 1); }
  return `<path d="${d}" fill="none" stroke="#01060d" stroke-opacity="${depth ? .55 : .75}" stroke-width="${depth ? 1.1 : 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" transform="translate(1.4 1.6)" fill="none" stroke="#9ff5e0" stroke-opacity="${depth ? .2 : .32}" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>${segs}`; }
let cracks = ''; [[160, 880, -1.0, 560], [700, 890, -2.2, 520], [60, 700, -.2, 420], [980, 880, -1.9, 460], [1180, 760, -2.6, 340], [380, 620, .1, 300]].forEach(c => cracks += crack(...c));
let ridges = ''; [[0, 640, 520, 20], [380, 760, 700, 28], [820, 600, 600, 14], [1000, 840, 560, 22]].forEach(([x, y, l, k]) => { const d = `M${x} ${y}C${x + l * .3} ${y - k} ${x + l * .6} ${y + k * .6} ${x + l} ${y - k * .3}`;
  ridges += `<path d="${d}" fill="none" stroke="#02101c" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/><path d="${d}" transform="translate(0 -3)" fill="none" stroke="#9fe8e0" stroke-opacity=".28" stroke-width="2.4" stroke-linecap="round"/>`; });
let bubbles = ''; for (let i = 0; i < 90; i++) { const x = R() * W, y = HZ + 40 + Math.pow(R(), .7) * 360; bubbles += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(1 + R() * 3)}" ry="${f(.5 + R() * 1.2)}" fill="#bfeeff" opacity="${(.08 + R() * .16).toFixed(2)}"/>`; }
let glints = ''; for (let i = 0; i < 70; i++) { const y = HZ + 6 + Math.pow(i / 70, 1.5) * 390; glints += `<rect x="${f(R() * 1500 - 80)}" y="${f(y)}" width="${f(120 + R() * 520)}" height="${f(.8 + i * .045)}" fill="url(#streak)" opacity="${(.12 + R() * .32).toFixed(2)}"/>`; }
let frost = ''; for (let i = 0; i < 9; i++) frost += `<ellipse cx="${f(R() * W)}" cy="${f(HZ + 80 + R() * 300)}" rx="${f(90 + R() * 160)}" ry="${f(20 + R() * 34)}" fill="url(#gFrost)"/>`;
// vertical aurora glints on the ice (green), under the main curtains
let streaks = ''; for (let i = 0; i < 46; i++) { const x = 80 + R() * 900, y = HZ + 8 + R() * 120; streaks += `<rect x="${f(x)}" y="${f(y)}" width="${f(2 + R() * 4)}" height="${f(30 + R() * 110)}" fill="url(#gGlint)" opacity="${(.15 + R() * .4).toFixed(2)}"/>`; }
// ---------- lodge (1190..1610, wall y 362..470, ridge y 262)
const LX = 1180, LR = 1620, WY0 = 364, WY1 = 472;
let logs = '', ends = ''; for (let y = WY0; y < WY1; y += 13.5) { logs += `<rect x="${LX + 6}" y="${y}" width="${LR - LX - 6}" height="13.8" rx="6.5" fill="url(#log)"/>`; ends += `<ellipse cx="${LX + 6}" cy="${f(y + 6.9)}" rx="8" ry="7" fill="url(#logEnd)"/><ellipse cx="${LX + 6}" cy="${f(y + 6.9)}" rx="3.6" ry="3.2" fill="none" stroke="#2a1608" stroke-opacity=".5" stroke-width=".7"/>`; }
let grain = ''; for (let i = 0; i < 160; i++) { const y = WY0 + R() * (WY1 - WY0), x = LX + 12 + R() * (LR - LX - 24); grain += `M${f(x)} ${f(y)}h${f(10 + R() * 40)}`; }
let knots = ''; for (let i = 0; i < 7; i++) { const x = LX + 40 + R() * 360, y = WY0 + 6 + Math.floor(R() * 8) * 13.5; knots += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="4" ry="2.4" fill="#2a1608" opacity=".55"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="2" ry="1.1" fill="#9a6a3c" opacity=".5"/>`; }
let shingles = ''; for (let y = 276; y < 366; y += 9) { for (let x = 1160 + ((y / 9) % 2) * 7; x < 1640; x += 14) shingles += `<rect x="${x}" y="${y}" width="13" height="9.4" rx="1.5" fill="#1a1612" opacity="${(.5 + R() * .4).toFixed(2)}"/>`; }
const roof = 'M1150 372L1226 262H1580L1660 372Z';
const snowRoof = 'M1138 376C1160 358 1196 300 1226 262H1580C1610 300 1640 350 1664 378C1646 388 1636 374 1618 382C1604 372 1590 384 1572 378C1552 388 1536 376 1514 382C1494 374 1476 386 1456 380C1436 388 1420 376 1400 382C1380 374 1362 386 1342 380C1322 388 1306 376 1288 382C1270 374 1252 386 1234 380C1216 388 1200 376 1184 382C1166 376 1150 388 1138 376Z';
let icicles = ''; for (let x = 1146; x < 1660; x += 7 + R() * 12) { const l = 8 + R() * 30; icicles += `<path d="M${f(x)} 380L${f(x + 4.5)} 380L${f(x + 2 + (R() - .5) * 2)} ${f(380 + l)}Z" fill="url(#gIce)" opacity=".85"/>`; }
const win = (x, y, w, h, id) => `<g id="${id}"><rect x="${x - 7}" y="${y - 7}" width="${w + 14}" height="${h + 14}" rx="2" fill="#2a180c"/><rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" fill="#6a4426"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#winG)"/>
 <path d="M${x + 8} ${y + h}V${y + h - 22}Q${x + 14} ${y + h - 34} ${x + 22} ${y + h - 22}V${y + h}Z" fill="#3a1e0a" opacity=".55"/><rect x="${x + w * .62}" y="${y + h - 30}" width="18" height="30" fill="#3a1e0a" opacity=".4"/>
 <rect x="${x + w / 2 - 2}" y="${y}" width="4" height="${h}" fill="#2a180c"/><rect x="${x}" y="${y + h / 2 - 2}" width="${w}" height="4" fill="#2a180c"/>
 <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/><rect x="${x - 9}" y="${y + h + 4}" width="${w + 18}" height="7" rx="2" fill="#2a180c"/><path d="M${x - 9} ${y + h + 4}H${x + w + 9}" stroke="#eaf8ff" stroke-width="5" stroke-opacity=".9" stroke-linecap="round" transform="translate(0 -2)"/></g>`;
// woodpile
let pile = ''; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const x = 1200 + c * 17 + (r % 2) * 8, y = 470 - r * 15; pile += `<ellipse cx="${x}" cy="${y}" rx="8.4" ry="8" fill="url(#logEnd)" stroke="#1c0f06" stroke-width="1"/><ellipse cx="${x}" cy="${y}" rx="4" ry="3.6" fill="none" stroke="#3a2010" stroke-opacity=".6" stroke-width=".8"/>`; }
const lodge = `<g id="lodge">
 <path d="M1100 470Q1160 456 1240 462Q1400 452 1560 458Q1600 458 1640 462L1640 520L1100 520Z" fill="url(#snowB)"/>
 <rect x="${LX}" y="${WY0}" width="${LR - LX}" height="${WY1 - WY0}" fill="#160c06"/>
 ${logs}${ends}
 <path d="${grain}" stroke="#2a1608" stroke-opacity=".28" stroke-width=".9" fill="none"/>${knots}
 <rect x="${LX}" y="${WY0}" width="${LR - LX}" height="${WY1 - WY0}" filter="url(#wood)" opacity=".45" style="mix-blend-mode:multiply"/>
 <rect x="${LX}" y="${WY0}" width="${LR - LX}" height="${WY1 - WY0}" fill="url(#wallShade)"/>
 <!-- stone footing -->
 ${Array.from({ length: 26 }, (_, i) => `<rect x="${LX + i * 17 - 4}" y="${WY1 - 4}" width="${15 + R() * 4}" height="${11 + R() * 3}" rx="3" fill="#${['2e3a44', '3a4854', '24303a'][i % 3]}"/>`).join('')}
 ${win(1262, 392, 72, 56, 'winA')}${win(1396, 392, 72, 56, 'winB')}${win(1560, 392, 56, 56, 'winC')}
 <!-- door + porch -->
 <rect x="1494" y="402" width="52" height="72" fill="#1c0e06"/><rect x="1499" y="407" width="42" height="67" fill="#4a2a14"/>
 <path d="M1504 412V470M1512 412V470M1520 412V470M1528 412V470M1536 412V470" stroke="#2a1608" stroke-opacity=".6" stroke-width="1"/><rect x="1499" y="407" width="42" height="67" fill="url(#winG)" opacity=".28"/>
 <circle cx="1533" cy="442" r="2.4" fill="#e8b36a"/><path d="M1488 402H1552L1556 410H1484Z" fill="#2a1608"/>
 <path d="M1500 474H1540L1546 482H1494Z" fill="#6a4426"/>
 <g id="lantern"><path d="M1484 380V392" stroke="#111" stroke-width="2"/><rect x="1478" y="392" width="12" height="17" rx="2" fill="#2a1608"/><rect x="1480.5" y="394.5" width="7" height="12" fill="#ffd493"/></g>
 <!-- roof -->
 <path d="${roof}" fill="#0c0f12"/><path d="${roof}" fill="url(#roofShade)"/>
 <g clip-path="url(#roofClip)">${shingles}</g>
 <path d="${snowRoof}" fill="url(#snowRoof)"/>
 <path d="M1226 262H1580" stroke="#dffff4" stroke-opacity=".9" stroke-width="3" filter="url(#b1)"/>
 <path d="M1138 376C1160 358 1196 300 1226 262" stroke="#9ff0d4" stroke-opacity=".7" stroke-width="3" fill="none" filter="url(#b1)"/>
 <path d="M1190 372C1230 350 1280 330 1330 322C1400 312 1500 314 1620 330" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2" filter="url(#b1)"/>
 ${icicles}
 <!-- chimney -->
 <rect x="1470" y="206" width="48" height="76" fill="#2a3640"/>${Array.from({ length: 7 }, (_, i) => `<rect x="${1470 + (i % 2) * 8}" y="${210 + i * 10}" width="${22 + R() * 6}" height="8.5" rx="2" fill="#${['3a4854', '46566a', '2c3844'][i % 3]}"/><rect x="${1496 + (i % 2) * 6}" y="${210 + i * 10}" width="${20 + R() * 6}" height="8.5" rx="2" fill="#${['46566a', '34424e', '3a4854'][i % 3]}"/>`).join('')}
 <path d="M1462 208H1526L1520 198H1468Z" fill="#cfe9f4"/><rect x="1470" y="206" width="48" height="76" fill="url(#chimShade)"/>
 ${pile}
 <path d="M1196 408Q1224 392 1262 400L1262 412Q1224 404 1196 420Z" fill="url(#snowRoof)"/>
</g>`;
// drifts + foreground
const bank = (d, hl) => `<path d="${d}" fill="url(#snowG)"/><path d="${hl}" fill="none" stroke="#9ffbd8" stroke-opacity=".5" stroke-width="2.4" filter="url(#b1)"/>`;
const nearL = [[70, 780, 640, 170], [200, 740, 520, 150], [-30, 830, 700, 190], [320, 700, 360, 100], [420, 680, 230, 66]];
const nearR = [[1580, 620, 380, 90], [1105, 520, 150, 44], [1125, 528, 100, 30]];
const defs = `<defs>
 <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#01030a"/><stop offset=".45" stop-color="#050e22"/><stop offset=".8" stop-color="#0b2a3c"/><stop offset="1" stop-color="#1a4a52"/></linearGradient>
 <radialGradient id="gStar"><stop offset="0" stop-color="#cfe6ff" stop-opacity=".8"/><stop offset="1" stop-color="#cfe6ff" stop-opacity="0"/></radialGradient>
 <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fe0c8" stop-opacity="0"/><stop offset=".7" stop-color="#5fe0c8" stop-opacity=".30"/><stop offset="1" stop-color="#5fe0c8" stop-opacity="0"/></linearGradient>
 <linearGradient id="mDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020816" stop-opacity=".62"/><stop offset=".7" stop-color="#020816" stop-opacity=".3"/><stop offset="1" stop-color="#0b2a3c" stop-opacity=".2"/></linearGradient>
 <linearGradient id="ice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#235a66"/><stop offset=".18" stop-color="#103244"/><stop offset=".6" stop-color="#071a2c"/><stop offset="1" stop-color="#030a16"/></linearGradient>
 <linearGradient id="streak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#bff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="gGlint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dffc4" stop-opacity="0"/><stop offset=".3" stop-color="#7dffc4" stop-opacity=".7"/><stop offset="1" stop-color="#7dffc4" stop-opacity="0"/></linearGradient>
 <radialGradient id="gFrost"><stop offset="0" stop-color="#d8f6ff" stop-opacity=".16"/><stop offset="1" stop-color="#d8f6ff" stop-opacity="0"/></radialGradient>
 <linearGradient id="log" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a3e"/><stop offset=".3" stop-color="#734826"/><stop offset=".75" stop-color="#3e2413"/><stop offset="1" stop-color="#1c0f08"/></linearGradient>
 <radialGradient id="logEnd"><stop offset="0" stop-color="#c08a56"/><stop offset=".6" stop-color="#7a4a28"/><stop offset="1" stop-color="#3a2010"/></radialGradient>
 <radialGradient id="winG" cx=".5" cy=".65" r=".85"><stop offset="0" stop-color="#fff2c8"/><stop offset=".4" stop-color="#ffc460"/><stop offset="1" stop-color="#e0701c"/></radialGradient>
 <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#7dffc4" stop-opacity=".12"/></linearGradient>
 <radialGradient id="gWarm"><stop offset="0" stop-color="#ffc870" stop-opacity=".9"/><stop offset=".3" stop-color="#ff9a3c" stop-opacity=".38"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
 <linearGradient id="wallShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".05"/><stop offset=".6" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
 <linearGradient id="roofShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a4a50" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
 <linearGradient id="chimShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9fffe0" stop-opacity=".18"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
 <linearGradient id="snowRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eafff8"/><stop offset=".45" stop-color="#b4d8e8"/><stop offset="1" stop-color="#5a84aa"/></linearGradient>
 <linearGradient id="gIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8fcff"/><stop offset="1" stop-color="#7fc8e8" stop-opacity=".4"/></linearGradient>
 <linearGradient id="snowB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc0d8"/><stop offset=".4" stop-color="#4d789c"/><stop offset="1" stop-color="#16304c"/></linearGradient>
 <linearGradient id="snowG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86b4cc"/><stop offset=".3" stop-color="#32608a"/><stop offset="1" stop-color="#0a1a34"/></linearGradient>
 <radialGradient id="spill" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb454" stop-opacity=".8"/><stop offset=".5" stop-color="#ff8c30" stop-opacity=".28"/><stop offset="1" stop-color="#ff8c30" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx=".5" cy=".5" r=".78"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
 <radialGradient id="aWash" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3dffb0" stop-opacity=".5"/><stop offset="1" stop-color="#3dffb0" stop-opacity="0"/></radialGradient>
 <radialGradient id="aWashV" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8a5cff" stop-opacity=".5"/><stop offset="1" stop-color="#8a5cff" stop-opacity="0"/></radialGradient>
 <filter id="b1"><feGaussianBlur stdDeviation="1"/></filter><filter id="b2"><feGaussianBlur stdDeviation="2"/></filter><filter id="b4"><feGaussianBlur stdDeviation="4"/></filter>
 <filter id="b12" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="12"/></filter><filter id="b30" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="30"/></filter>
 <filter id="wood" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".01 .3" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .02  0 0 0 1.6 -.5"/></filter>
 <filter id="mDim"><feComponentTransfer><feFuncR type="linear" slope=".92"/><feFuncG type="linear" slope="1.05"/><feFuncB type="linear" slope="1.12"/></feComponentTransfer></filter>
 <clipPath id="lakeClip"><rect x="0" y="${HZ}" width="${W}" height="${H - HZ}"/></clipPath>
 <clipPath id="roofClip"><path d="${roof}"/></clipPath>
 <clipPath id="bankClip"><rect x="1080" y="440" width="560" height="200"/></clipPath>
</defs>`;
const WINS = [[1298, 420], [1432, 420], [1588, 420]];
const body = `
<rect width="${W}" height="${H}" fill="#030914"/>
<g id="skyG"><rect width="${W}" height="${HZ + 4}" fill="url(#sky)"/>
 <g style="mix-blend-mode:screen" opacity=".55"><ellipse cx="560" cy="250" rx="700" ry="130" fill="url(#aWash)"/><ellipse cx="1000" cy="170" rx="560" ry="90" fill="url(#aWashV)"/></g>
 <g id="starsG">${stars}</g>
 <g id="mountains"><g filter="url(#mDim)"><image href="mtn-far.png" x="0" y="140" width="1600" height="340"/></g>
 <rect x="0" y="${HZ - 70}" width="${W}" height="80" fill="url(#fog)" opacity=".7"/>
 <g filter="url(#mDim)"><image href="mtn-near.png" x="0" y="250" width="1600" height="260"/></g></g>
 <g id="farTrees" filter="url(#b1)" opacity=".95">${trees(farT2, { fill: '#06141c' })}</g>
 <g id="farTrees2" filter="url(#b1)">${trees(farT, { fill: '#0a1d26' })}</g>
 <rect x="0" y="${HZ - 14}" width="${W}" height="34" fill="url(#fog)" opacity=".9"/></g>
<!-- LAKE -->
<rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#ice)"/>
<g clip-path="url(#lakeClip)">
 <g transform="translate(0,${HZ * 2}) scale(1,-1)" filter="url(#b4)" opacity=".4"><use href="#skyG"/></g>
 <rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#ice)" opacity=".28"/>
 ${frost}<g opacity=".7">${glints}</g>${streaks}${ridges}${bubbles}${cracks}
 <g transform="translate(0,${470 + 470}) scale(1,-1)" filter="url(#b4)" opacity=".26" clip-path="url(#bankClip)"><use href="#lodge"/></g>
 ${WINS.map(([x, y]) => `<ellipse cx="${x}" cy="${HZ + 60}" rx="130" ry="22" fill="url(#spill)" style="mix-blend-mode:screen" opacity=".55"/>`).join('')}
 <ellipse cx="1400" cy="${HZ + 30}" rx="300" ry="26" fill="url(#spill)" style="mix-blend-mode:screen" opacity=".55"/>
 <path d="M0 900L0 800C90 770 170 790 250 800C360 770 470 830 600 860L640 900Z" fill="url(#snowG)"/>
 <path d="M0 800C90 770 170 790 250 800C360 770 470 830 600 860" fill="none" stroke="#9ffbd8" stroke-opacity=".5" stroke-width="2.4" filter="url(#b1)"/>
 <path d="M1000 900C1060 862 1180 852 1280 866C1400 850 1520 862 1600 846L1600 900Z" fill="url(#snowG)"/>
 <path d="M1000 900C1060 862 1180 852 1280 866C1400 850 1520 862 1600 846" fill="none" stroke="#9ffbd8" stroke-opacity=".45" stroke-width="2.4" filter="url(#b1)"/>
</g>
<!-- shore bluff + lodge -->
<path d="M1060 520C1110 480 1180 470 1260 474C1400 462 1520 462 1600 456L1600 540C1500 552 1380 556 1260 552C1160 552 1090 546 1060 520Z" fill="url(#snowB)"/>
<path d="M1060 520C1110 480 1180 470 1260 474C1400 462 1520 462 1600 456" fill="none" stroke="#9ffbd8" stroke-opacity=".5" stroke-width="2.4" filter="url(#b1)"/>
<ellipse cx="1400" cy="506" rx="260" ry="20" fill="url(#spill)" style="mix-blend-mode:screen" opacity=".8"/>
${lodge}
<g style="mix-blend-mode:screen">${WINS.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="96" ry="72" fill="url(#gWarm)" opacity=".8"/>`).join('')}<ellipse cx="1484" cy="400" rx="44" ry="40" fill="url(#gWarm)" opacity=".8"/></g>
<ellipse cx="800" cy="${HZ + 20}" rx="900" ry="30" fill="#5fe0c8" opacity=".16" filter="url(#b12)"/>
<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
const TG = `<defs><linearGradient id="treeG" gradientUnits="userSpaceOnUse" x1="0" y1="180" x2="0" y2="900"><stop offset="0" stop-color="#0c3438"/><stop offset=".35" stop-color="#05161b"/><stop offset="1" stop-color="#010608"/></linearGradient></defs>`;
fs.writeFileSync(path.join(out, 'trees-near.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${TG}${trees([[1110, 520, 190, 50], [1136, 530, 130, 36]], { fill: 'url(#treeG)' })}${trees(nearR.slice(0, 1), { fill: 'url(#treeG)' })}${trees(nearL, { fill: 'url(#treeG)' })}<rect width="${W}" height="${H}" fill="url(#vig2)"/><defs><radialGradient id="vig2" cx=".5" cy=".5" r=".78"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient></defs></svg>`);
fs.writeFileSync(path.join(out, 'scene-static.svg'), `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${body}</svg>`);
// ---------- aurora curtains (transparent layers for the animated overlay)
function curtain(w, hgt, yc, amp, ph, len, hue, op, seed) {
  const Rc = rng(seed); let o = '';
  for (let x = -20; x < w + 20; x += 3) { const t = x / w, y = yc + Math.sin(t * 5 + ph) * amp + Math.sin(t * 13 + ph * 2) * amp * .25; const l = len * (.55 + .45 * Math.sin(t * 7 + ph * 3)) * (.6 + Rc() * .5), a = op * (.35 + .65 * Math.abs(Math.sin(t * 9 + ph))) * (.55 + Rc() * .45);
    o += `<rect x="${x}" y="${f(y - l)}" width="3.4" height="${f(l + (hue ? 36 : 56))}" fill="url(#${hue ? 'rayV' : 'rayG'})" opacity="${a.toFixed(2)}"/>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${hgt}" viewBox="0 0 ${w} ${hgt}"><defs>
 <linearGradient id="rayG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4cff" stop-opacity="0"/><stop offset=".35" stop-color="#3fffa8" stop-opacity=".5"/><stop offset=".85" stop-color="#9dffd0" stop-opacity=".95"/><stop offset="1" stop-color="#4dffb0" stop-opacity="0"/></linearGradient>
 <linearGradient id="rayV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4fa0" stop-opacity="0"/><stop offset=".3" stop-color="#8a5cff" stop-opacity=".6"/><stop offset=".85" stop-color="#6ae0ff" stop-opacity=".8"/><stop offset="1" stop-color="#4dffb0" stop-opacity="0"/></linearGradient>
 <filter id="bl" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.2"/></filter>
 <filter id="gl" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="26"/></filter></defs>
 <g filter="url(#gl)" opacity=".55">${o}</g><g filter="url(#bl)">${o}</g></svg>`;
}
fs.writeFileSync(path.join(out, 'cur1.svg'), curtain(1700, 440, 250, 56, 0.4, 250, 0, .6, 11));
fs.writeFileSync(path.join(out, 'cur2.svg'), curtain(1700, 440, 175, 44, 2.1, 190, 1, .46, 12));
fs.writeFileSync(path.join(out, 'cur3.svg'), curtain(1700, 440, 320, 34, 4.0, 140, 0, .4, 13));
console.log('scene svg ok');
