// UI symbols: Link plates, crack frames, lock, parade callouts, splash/hero/bigwin art. All <symbol>s (viewBox noted), text slots empty.
const L = require('./lib.cjs');
const { O, grad, rgrad, clip, p, np, ln, el, ci, rc, txt, fluff, flower, rng } = L;
const { pin, PIN, PL, star } = require('./syms.cjs');
const { lucho } = require('./lucho.cjs');
const gold = () => grad([[0, '#fff2a8'], [.35, '#f2c04a'], [.7, '#b87a1c'], [1, '#6a3c0c']], 0, 0, 0, 1);
const wood = (a = '#d98a4a', b = '#7a3a18') => grad([[0, a], [1, b]], 0, 0, 0, 1);
const paper = () => grad([[0, '#fffaec'], [1, '#f3dca4']], 0, 0, 0, 1);
const goldTxt = () => grad([[0, '#fff6a8'], [.5, '#ffd23f'], [1, '#e8941a']], 0, 0, 0, 1);
const stud = (x, y, r = 4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${gold()}" stroke="${O}" stroke-width="1.4"/><circle cx="${x - r * .3}" cy="${y - r * .3}" r="${r * .3}" fill="#fff" opacity=".85"/>`;
const slot = (x, y, w, h, r = 10) => rc(x, y, w, h, r, '#2a100a', 3) + `<path d="M${x + 6},${y + 5} h${w - 12}" stroke="rgba(255,255,255,.14)" stroke-width="3"/>`;
const sym = (id, vb, body) => `<symbol id="${id}" viewBox="${vb}">${body}</symbol>\n`;
const grain = (w, h, n, seed) => { const R = rng(seed); let s = ''; for (let i = 0; i < n; i++) s += `<path d="M${(R() * w * .7).toFixed(0)},${(8 + R() * (h - 16)).toFixed(0)} h${(w * .15 + R() * w * .25).toFixed(0)}" stroke="rgba(40,14,6,${.14 + R() * .12})" stroke-width="${1 + R() * 1.4}"/>`; return s; };
const plank = (w, h, fill, r = 12) => rc(2, 2, w - 4, h - 4, r, fill || wood(), 4) + grain(w, h, 6, w) + `<path d="M${r},7 H${w - r}" stroke="rgba(255,225,170,.7)" stroke-width="2.4"/>`;
const pcuts = (x, y, w, n, i0 = 0) => { let s = ''; const cc = ['#ee3d8f', '#1cb8bd', '#ffd23f', '#f58a2e', '#7a3fd0']; const sw = w / n; for (let i = 0; i < n; i++) s += `<path d="M${x + i * sw},${y} q${sw / 2},${sw * .55} ${sw},0z" fill="${cc[(i + i0) % 5]}" stroke="${O}" stroke-width="1.5"/>`; return s; };

function wedges(cols, k = 1) {
  const cx = 0, cy = 0, R = 54 * k, r = 31 * k, pts = [], out = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r : R; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  for (let i = 0; i < 5; i++) { const t = pts[i * 2], a = pts[(i * 2 + 9) % 10], b = pts[(i * 2 + 1) % 10]; out.push({ d: `M0,0 L${a[0].toFixed(1)},${a[1].toFixed(1)} L${t[0].toFixed(1)},${t[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}Z`, c: cols[i], ang: -90 + i * 72 }); }
  return out;
}
function confetti(n, seed, w, h, cx = 0, cy = 0) {
  const R = rng(seed), cc = ['#ee3d8f', '#1cb8bd', '#ffd23f', '#f58a2e', '#7a3fd0', '#39c46a', '#e8312a']; let s = '';
  for (let i = 0; i < n; i++) {
    const x = cx + (R() - .5) * w, y = cy + (R() - .5) * h, c = cc[i % 7], r = R() * 360, t = R();
    if (t < .45) s += `<rect x="${x - 4}" y="${y - 2}" width="8" height="${4 + R() * 4}" fill="${c}" stroke="${O}" stroke-width="1.2" transform="rotate(${r} ${x} ${y})"/>`;
    else if (t < .75) s += `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="7" ry="4.4" fill="${c}" stroke="${O}" stroke-width="1.4"/><path d="M-7,0 l-5,-4 v8z M7,0 l5,-4 v8z" fill="${c}" stroke="${O}" stroke-width="1.2"/><path d="M-3,-2 q3,-2 6,0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".8"/></g>`;
    else if (t < .9) s += `<circle cx="${x}" cy="${y}" r="5.5" fill="${gold()}" stroke="${O}" stroke-width="1.4"/><circle cx="${x - 1.4}" cy="${y - 1.4}" r="1.6" fill="#fff"/>`;
    else s += `<path d="M${x},${y} q8,-10 16,0 t16,0" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
  }
  return s;
}
const burstShape = (r1, r2, n, fill, sw = 3) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r2 : r1; d += (i ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(1) + ',' + (Math.sin(a) * rr).toFixed(1); } return p(d + 'Z', fill, sw); };

function banner(text, w, h, c1, c2, fs) {
  return `<path d="M20,${h * .22} L${w - 20},${h * .22} L${w},${h * .5} L${w - 20},${h * .78} L20,${h * .78} L0,${h * .5}Z" fill="${grad([[0, c1], [1, c2]], 0, 0, 0, 1)}" stroke="${O}" stroke-width="4.4" stroke-linejoin="round"/>` + ln(`M26,${h * .3} H${w - 26} M26,${h * .7} H${w - 26}`, '#ffd23f', 2.2) + (text ? txt(text, w / 2, h * .5 + fs * .36, fs, goldTxt(), { stroke: O, sw: fs * .2 }) : '');
}

function build() {
  L.setPrefix('lU');
  let s = sym('llLucho', '0 0 400 480', lucho(0, {}));
  const LU = (x, y, k) => `<use href="#llLucho" x="${x}" y="${y}" width="${400 * k}" height="${480 * k}"/>`;
  // ---- Link jackpot plaques 220x84: name left, value slot right; lit state via --lit (0/1) on the container
  const JP = { mini: ['MINI', '#2fd0e0', '#0a6a86', '#1fb5c8'], minor: ['MINOR', '#9a50ff', '#4a1a96', '#9a50ff'], major: ['MAJOR', '#ff7a2a', '#a82a0a', '#ff7a2a'], grand: ['GRAND', '#e8312a', '#6a0a1a', '#ffd23f'] };
  for (const [k, [name, c1, c2, glow]] of Object.entries(JP)) {
    let b = plank(220, 84, wood('#c4723a', '#5a2810'), 14);
    b += rc(10, 10, 200, 64, 9, grad([[0, c1], [1, c2]], 0, 0, 0, 1), 3.2) + `<g style="opacity:var(--lit,0)"><rect x="3" y="3" width="214" height="78" rx="13" fill="none" stroke="${glow}" stroke-width="6" opacity=".9"/><rect x="10" y="10" width="200" height="64" rx="9" fill="rgba(255,250,200,.35)"/></g>`;
    b += `<rect x="10" y="10" width="200" height="64" rx="9" fill="rgba(20,8,16,.55)" style="opacity:calc(1 - var(--lit,0))"/>`;
    b += txt(name, 70, 56, name === 'MINOR' || name === 'GRAND' || name === 'MAJOR' ? 25 : 30, goldTxt(), { stroke: O, sw: 5 });
    b += slot(124, 20, 80, 44, 8);
    b += stud(8, 8, 3.4) + stud(212, 8, 3.4) + stud(8, 76, 3.4) + stud(212, 76, 3.4);
    s += sym('llJp' + k[0].toUpperCase() + k.slice(1), '0 0 220 84', b);
  }
  // ---- RESPINS plate 320x92, number slot centre (262,46)
  s += sym('llRespins', '0 0 320 92', plank(320, 92, wood('#d98a4a', '#6e3216'), 16) + rc(14, 14, 190, 64, 10, paper(), 3) + pcuts(18, 78, 182, 9) + txt('RESPINS', 109, 57, 36, '#d92b78', { stroke: O, sw: 6 }) + `<circle cx="262" cy="46" r="34" fill="${gold()}" stroke="${O}" stroke-width="4"/><circle cx="262" cy="46" r="27" fill="#2a100a" stroke="${O}" stroke-width="2.4"/>` + stud(10, 10) + stud(310, 10) + stud(10, 82) + stud(310, 82));
  // ---- TOTAL banner 520x110, slot x 214..496 y 24..86
  s += sym('llTotal', '0 0 520 110', `<path d="M8,16 H512 L498,56 L512,96 H8 L22,56Z" fill="${grad([[0, '#a02a8a'], [1, '#4a1450']], 0, 0, 0, 1)}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>` + ln('M30,24 H490 M30,88 H490', '#ffd23f', 2.4) + txt('TOTAL', 112, 74, 50, goldTxt(), { stroke: O, sw: 8 }) + rc(210, 22, 288, 68, 12, '#2a100a', 3.6) + `<rect x="210" y="22" width="288" height="68" rx="12" fill="none" stroke="${gold()}" stroke-width="4"/>` + stud(30, 56, 5) + stud(490, 56, 5) + pcuts(24, 96, 470, 18, 1));
  // ---- LOCK ring 128x128
  const lockR = rc(5, 5, 118, 118, 16, 'none', 9) + `<rect x="5" y="5" width="118" height="118" rx="16" fill="none" stroke="${gold()}" stroke-width="6" />` + [[10, 10], [118, 10], [10, 118], [118, 118]].map(([x, y]) => stud(x, y, 5)).join('') +
    `<g transform="translate(100 104)"><path d="M-8,-4 v-6 a8,8 0 0 1 16,0 v6" fill="none" stroke="${O}" stroke-width="7"/><path d="M-8,-4 v-6 a8,8 0 0 1 16,0 v6" fill="none" stroke="#e8e0d0" stroke-width="3.4"/><rect x="-12" y="-5" width="24" height="18" rx="4" fill="${gold()}" stroke="${O}" stroke-width="3"/><circle cx="0" cy="4" r="2.6" fill="${O}"/></g>`;
  s += sym('llLock', '0 0 128 128', `<g class="a-ring">${lockR}</g><style>.a-ring{animation:llLockP 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}@keyframes llLockP{0%,100%{opacity:.85}50%{opacity:1}}</style>`);
  // ---- CRACK frames 220x220 (centre 110,110)
  const pc = PIN.mon;
  s += sym('llCrack1', '0 0 220 220', `<g transform="translate(110 112) scale(1.6) translate(-64 -64)">${pin(pc)}</g>` + p('M96,40 L108,70 L96,86 L112,106 L100,128 L114,160', 'none', 0).replace('fill="none"', 'fill="none"') + ln('M100,52 L112,76 L98,92 L116,112 L104,134 L118,170', O, 6) + ln('M100,52 L112,76 L98,92 L116,112 L104,134 L118,170', '#fff6b0', 2.6) + [[150, 60, 6], [60, 70, 5], [160, 150, 5], [52, 150, 6]].map(([x, y, r]) => `<path d="M${x},${y} l${r},${-r} l${r},${r} l${-r},${r}z" fill="#ffd23f" stroke="${O}" stroke-width="1.6"/>`).join(''));
  const W5 = wedges(pc, 1.5);
  s += sym('llCrack2', '0 0 220 220', `<g transform="translate(110 110)">${burstShape(106, 52, 12, 'rgba(255,240,150,.95)', 0)}${burstShape(78, 40, 9, '#fff8c8', 0)}${W5.map(w => { const a = w.ang * Math.PI / 180, dx = Math.cos(a) * 34, dy = Math.sin(a) * 34; return `<g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${(w.ang + 90) * .12})">${p(w.d, w.c, 3.4)}</g>`; }).join('')}</g>` + confetti(12, 3, 190, 190, 110, 110));
  s += sym('llCrack3', '0 0 220 220', `<g transform="translate(110 110)" opacity=".5">${W5.map(w => { const a = w.ang * Math.PI / 180, dx = Math.cos(a) * 80, dy = Math.sin(a) * 80 + 20; return `<g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${w.ang * 2})">${p(w.d, w.c, 3)}</g>`; }).join('')}</g>` + confetti(46, 9, 210, 210, 110, 108));
  // ---- GRAND celebration plate 700x300 (value slot x 200..500, y 196..270)
  const gp = `<g transform="translate(350 120)">${burstShape(250, 120, 14, 'rgba(255,225,120,.55)', 0)}</g>` + p('M40,40 H660 L690,110 L660,180 H40 L10,110Z', grad([[0, '#ff5a3a'], [1, '#7a0f1a']], 0, 0, 0, 1), 6) + ln('M54,52 H646 M54,168 H646', '#ffd23f', 3) + `<path d="M280,22 l30,-22 l40,26 l40,-26 l30,22 l-12,32 h-116z" fill="${gold()}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>` + [310, 350, 390].map(x => ci(x, 34, 6, '#e8312a', 2)).join('') +
    txt('GRAND', 350, 138, 96, goldTxt(), { stroke: O, sw: 16 }) + `<g transform="translate(86 112) scale(.9)">${pin(PIN.grand)}</g><g transform="translate(528 112) scale(.9)">${pin(PIN.grand)}</g>` + rc(190, 190, 320, 80, 14, '#2a100a', 4) + `<rect x="190" y="190" width="320" height="80" rx="14" fill="none" stroke="${gold()}" stroke-width="5"/>` + txt('FULL BOARD', 350, 184, 24, '#fff0cf', { font: 'Lil', stroke: O, sw: 5 }) + confetti(26, 5, 660, 280, 350, 150);
  s += sym('llGrand', '0 0 700 300', gp);
  // ---- Parade callouts
  const call = (id, w, h, label, c1, c2, slotW) => sym(id, `0 0 ${w} ${h}`, plank(w, h, wood('#d98a4a', '#6e3216'), 16) + rc(10, 10, w - 20, h - 20, 9, grad([[0, c1], [1, c2]], 0, 0, 0, 1), 3) + slot(18, 16, slotW, h - 32, 9) + txt(label, slotW + 18 + (w - slotW - 28) / 2, h / 2 + 11, 30, goldTxt(), { stroke: O, sw: 6 }) + stud(8, 8, 3.4) + stud(w - 8, 8, 3.4) + stud(8, h - 8, 3.4) + stud(w - 8, h - 8, 3.4));
  s += call('llCallSpins', 330, 92, 'SPINS', '#1cb8bd', '#0a6a78', 130);
  s += call('llCallMult', 440, 92, 'MULTIPLIER', '#d92b78', '#7a1050', 120);
  s += call('llSpinsLeft', 300, 80, 'SPINS LEFT', '#7a3fd0', '#3a1a8a', 90);
  // ---- Line / win callout plates
  s += sym('llPlateLine', '0 0 520 60', plank(520, 60, wood('#d98a4a', '#7a3a18'), 12) + rc(14, 9, 492, 42, 8, paper(), 3) + pcuts(18, 51, 480, 20) + stud(7, 30, 3.6) + stud(513, 30, 3.6));
  s += sym('llPlateWin', '0 0 360 96', plank(360, 96, wood('#d98a4a', '#6e3216'), 16) + rc(12, 12, 336, 72, 10, paper(), 3) + txt('WIN', 70, 62, 38, '#d92b78', { stroke: O, sw: 6 }) + slot(120, 20, 218, 56, 9) + pcuts(16, 84, 328, 14, 2) + stud(8, 8) + stud(352, 8) + stud(8, 88) + stud(352, 88));
  // ---- Splash titles (papel picado letters) 640x150
  const word = (t, size, y, off, ls) => { const cl = ['#ee3d8f', '#1cb8bd', '#ffd23f', '#f58a2e', '#7a3fd0']; const tsp = t.split('').map((ch, i) => `<tspan fill="${cl[(i + off) % 5]}">${ch}</tspan>`).join(''); const b = `x="320" y="${y}" font-family="LlLuck" font-size="${size}" text-anchor="middle" letter-spacing="${ls}"`; return `<text ${b} fill="none" stroke="${O}" stroke-width="${size * .3}" stroke-linejoin="round">${t}</text><text ${b} fill="none" stroke="#ffd23f" stroke-width="${size * .18}" stroke-linejoin="round">${t}</text><text ${b} stroke="${O}" stroke-width="${size * .035}" paint-order="stroke">${tsp}</text><text ${b} fill="${grad([[0, 'rgba(255,255,255,.6)'], [.5, 'rgba(255,255,255,0)'], [1, 'rgba(60,10,40,.35)']])}">${t}</text><text ${b} fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="2 5" stroke-linecap="round" opacity=".8">${t}</text>`; };
  s += sym('llTitleLink', '0 0 640 150', word('PINATA LINK', 92, 112, 0, 2));
  s += sym('llTitleParade', '0 0 640 150', word('PONCHO PARADE', 74, 108, 1, 1));
  // ---- Collector Don Lucho swing (300x300): head + shoulders, bat swinging with motion arc
  const bat = `<g transform="translate(228 92) rotate(36)"><rect x="-8" y="-100" width="16" height="132" rx="8" fill="${grad([[0, '#fff0cf'], [1, '#c8741a']], 0, 0, 1, 0)}" stroke="${O}" stroke-width="4"/>${[-84, -58, -32, -6].map((y, i) => `<rect x="-8" y="${y}" width="16" height="12" fill="${['#ee3d8f', '#1cb8bd'][i % 2]}"/>`).join('')}<rect x="-8" y="-100" width="16" height="132" rx="8" fill="none" stroke="${O}" stroke-width="4"/><path d="M-6,-96 v120" stroke="rgba(255,255,255,.6)" stroke-width="3"/></g>`;
  s += sym('llCollector', '0 0 300 300', `<path d="M60,40 C130,-10 250,30 276,120" fill="none" stroke="rgba(255,240,150,.8)" stroke-width="16" stroke-linecap="round"/><path d="M70,52 C140,12 236,44 262,120" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>` + LU(150 - 116, 292 - 480 * .58, .58) + bat + `<g transform="translate(244 128)"><circle r="16" fill="#f0c78a" stroke="${O}" stroke-width="3.6"/><path d="M-10,-4 q10,-8 20,0" stroke="${O}" stroke-width="2.4" fill="none"/></g>`);
  // ---- Splash art 600x520: Link / Parade / Outro; Hero (loading) and Big win share the building blocks
  const bust = (x, y, k) => LU(x, y, k);
  const rays = (cx, cy, r1, r2, n, c) => `<g transform="translate(${cx} ${cy})">${burstShape(r2, r1, n, c, 0)}</g>`;
  s += sym('llSplashLink', '0 0 600 520', rays(300, 270, 120, 280, 14, 'rgba(255,225,120,.35)') + [[110, 150, .9, -10], [490, 160, .9, 12], [60, 330, .62, 8], [540, 340, .62, -8]].map(([x, y, k, r]) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${k}) translate(-64 -64)">${pin([PIN.mon, PIN.major, PIN.minor, PIN.mini][Math.round(x) % 4])}</g>`).join('') + bust(100, 40, 1.0) + confetti(30, 12, 560, 480, 300, 260));
  s += sym('llSplashParade', '0 0 600 520', rays(300, 270, 120, 280, 14, 'rgba(255,225,120,.35)') + `<path d="M20,70 Q300,20 580,70" fill="none" stroke="${O}" stroke-width="3"/>` + Array.from({ length: 10 }, (_, i) => { const t = (i + .5) / 10, x = 20 + t * 560, y = 70 - Math.sin(t * Math.PI) * 38 + 0; return `<path d="M${x - 14},${y} h28 v36 q-4.6,7 -9.3,0 q-4.7,7 -9.4,0 q-4.7,7 -9.3,0z" fill="${['#ee3d8f', '#1cb8bd', '#ffd23f', '#f58a2e', '#7a3fd0'][i % 5]}" stroke="${O}" stroke-width="2"/>`; }).join('') + bust(100, 50, 1.0) + confetti(24, 21, 560, 480, 300, 280));
  s += sym('llSplashOutro', '0 0 600 520', rays(300, 260, 120, 280, 16, 'rgba(255,225,120,.4)') + bust(100, 36, 1.0) + [[60, 400], [150, 450], [450, 450], [540, 400]].map(([x, y], i) => `<g transform="translate(${x} ${y})">${ci(0, 0, 26, gold(), 4)}${ci(0, 0, 18, 'none', 2.4)}${txt('$', 0, 11, 30, '#7a3a0c', { stroke: '#ffe9a0', sw: 2 })}</g>`).join('') + confetti(40, 33, 580, 500, 300, 260));
  s += sym('llHero', '0 0 800 640', rays(400, 330, 140, 380, 16, 'rgba(255,225,120,.3)') + [[110, 200, 1.1, -12, 'mon'], [690, 210, 1.1, 12, 'major'], [90, 440, .8, 10, 'minor'], [712, 450, .8, -10, 'mini']].map(([x, y, k, r, c]) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${k}) translate(-64 -64)">${pin(PIN[c])}</g>`).join('') + bust(190, 40, 1.15) + confetti(40, 41, 780, 620, 400, 320));
  s += sym('llBigWin', '0 0 500 420', rays(250, 210, 90, 230, 14, 'rgba(255,225,120,.4)') + LU(250 - 164, 392 - 480 * .82, .82) + confetti(40, 55, 480, 400, 250, 200));
  // sticky wild glow frame 128x128 (overlay on a cell, pulses)
  s += sym('llSticky', '0 0 128 128', `<style>.llSt{animation:llStP 1.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}@keyframes llStP{0%,100%{opacity:.7;transform:scale(.99)}50%{opacity:1;transform:scale(1.02)}}</style><g class="llSt"><rect x="2" y="2" width="124" height="124" rx="17" fill="none" stroke="rgba(255,90,190,.55)" stroke-width="9"/><rect x="4" y="4" width="120" height="120" rx="15" fill="none" stroke="#ffd23f" stroke-width="4"/><rect x="4" y="4" width="120" height="120" rx="15" fill="none" stroke="#fff6b0" stroke-width="1.4" stroke-dasharray="5 7"/>${star(10, 10, 8, 'x')}${star(118, 10, 7, 'x')}${star(10, 118, 7, 'x')}${star(118, 118, 8, 'x')}</g>`);
  return { svg: s, defs: L.defs.slice() };
}
module.exports = { build };
