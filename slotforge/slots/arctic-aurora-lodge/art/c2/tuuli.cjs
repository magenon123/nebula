// Tuuli the husky, v3 illustration. Design space same as aino (480x410). Body in profile facing viewer-left, head 3/4 front.
const H = require('./h.cjs'); const { sp, paint, furF, part, defs, samp, mir, mix, ramp, R, f } = H;
const SC = 2.0; const P = {};
const GR = [[0, '#1c2432'], [.25, '#3a4659'], [.5, '#667690'], [.78, '#a3b3ca'], [1, '#dbe5f2']];
const WH = [[0, '#6c7899'], [.3, '#a4aec8'], [.6, '#e0e6f2'], [.85, '#fbfcff'], [1, '#ffffff']];
const lit = (x, y, cx, cy, rx, ry, base = .55, k = .5) => { const dx = (x - cx) / rx, dy = (y - cy) / ry; return Math.max(0, Math.min(1, base - (dx * .75 + dy * .65) * k)); };
const fcol = (pal, cx, cy, rx, ry, base = .6, k = .5) => (x, y, r) => ramp(pal, lit(x, y, cx, cy, rx, ry, base, k) + (r - .5) * .16);
// hair strokes: thin tapered lines following a flow field
function hair(o) {
  const r = R(o.seed || 3); let s = ''; const [x0, y0, x1, y1] = o.box; let n = 0, t = 0;
  while (n < o.n && t++ < o.n * 30) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); if (o.inside && !o.inside(x, y)) continue; n++;
    const a = o.flow(x, y) + (r() - .5) * .35, L = o.L[0] + r() * (o.L[1] - o.L[0]), dx = Math.cos(a) * L, dy = Math.sin(a) * L, b = (r() - .5) * L * .4;
    s += `<path d="M${f(x)} ${f(y)}Q${f(x + dx * .5 - dy * .15 + b)} ${f(y + dy * .5 + dx * .15)} ${f(x + dx)} ${f(y + dy)}" fill="none" stroke="${o.col(x, y, r())}" stroke-width="${o.w || .8}" stroke-opacity="${o.op || .5}"/>`;
  }
  return s;
}
const sil = (x, y) => 1;

// ===================== BODY =====================
(function () {
  const D = defs(); let s = ''; const bbox = [270, 184, 206, 186];
  const gG = D.lg(310, 222, 450, 300, [[0, '#8696b0'], [.3, '#566478'], [.7, '#303c4e'], [1, '#161c28']]);
  const wG = D.lg(310, 250, 440, 330, [[0, '#ffffff'], [.5, '#dfe6f1'], [1, '#8e9ab6']]);
  s += `<ellipse cx="386" cy="356" rx="80" ry="7" fill="#02060f" opacity=".6" filter="url(#b4)"/>`;
  // far legs (darker, behind)
  const farF = sp([[338, 262], [356, 262], [356, 300], [354, 334], [358, 350, 1], [346, 356, 1], [330, 356, 1], [334, 346], [338, 330], [336, 296]]);
  const farH = sp([[400, 262], [420, 270], [420, 300], [412, 328], [412, 346, 1], [416, 352, 1], [396, 355, 1], [398, 342], [402, 326], [392, 300]]);
  s += paint(farF, D.lg(330, 262, 360, 356, [[0, '#a4aec8'], [1, '#4a5470']]), [{ d: 'M350 262H358V356H348Z', fill: '#0a1020', op: .4, blur: 'b2' }], { stroke: '#10141f', sw: .8 });
  s += paint(farH, D.lg(396, 262, 424, 356, [[0, '#8a96b2'], [1, '#3e4660']]), [{ d: 'M412 262H424V356H410Z', fill: '#0a1020', op: .45, blur: 'b2' }], { stroke: '#10141f', sw: .8 });
  // torso
  const torso = sp([[322, 240], [338, 224], [370, 222], [404, 228], [438, 236], [454, 252], [454, 280], [440, 298], [418, 298], [394, 298], [366, 304], [340, 300], [318, 280], [312, 256]]);
  const lay = [
    // white underside
    { el: `<path d="M306 262Q340 268 372 284Q408 292 460 270L460 320L300 320Z" fill="${wG}"/>` },
    { el: `<path d="M306 262Q340 268 372 284Q408 292 460 270" fill="none" stroke="#e8eef8" stroke-width="3" opacity=".6" filter="url(#b2)"/>` },
    // saddle shading: darker back, light on top
    { d: 'M330 224Q380 214 440 232L440 246Q380 232 330 240Z', fill: '#c8d6ea', op: .5, blur: 'b2' },
    { d: 'M420 240Q462 250 458 290L430 296Q440 270 420 240Z', fill: '#050810', op: .5, blur: 'b4' },
    { d: 'M340 296Q380 310 440 296L440 320L340 320Z', fill: '#2a3454', op: .4, blur: 'b4' },
    { el: `<ellipse cx="320" cy="270" rx="18" ry="30" fill="${D.rg(320, 270, 1, [[0, '#ffb454', .6], [1, '#ffb454', 0]], 22, 34)}" style="mix-blend-mode:screen"/>` },
    { el: `<path d="M360 226Q410 222 452 242" fill="none" stroke="#7dffc4" stroke-width="2.4" opacity=".6" filter="url(#b1)" style="mix-blend-mode:screen"/>` },
    { el: hair({ box: [316, 222, 458, 300], n: 260, seed: 4, flow: (x, y) => .18 + (y - 230) * .01, L: [10, 18], col: (x, y, r) => r > .5 ? '#c4d2e6' : '#0c1220', op: .34, w: .8, inside: (x, y) => y < 280 + (x - 320) * .02 }) }
  ];
  // hair() takes col(x,y,r) with r a function; simplify
  s += paint(torso, gG, lay.map(l => l), { stroke: '#10141f', sw: .9 });
  // near hind leg (haunch + hock)
  const hind = sp([[408, 246], [444, 244], [460, 272], [452, 304], [446, 326], [449, 346, 1], [452, 354, 1], [430, 356, 1], [426, 348], [430, 330], [426, 312], [408, 296], [398, 270]]);
  s += paint(hind, D.lg(400, 244, 462, 340, [[0, '#7b8aa6'], [.35, '#4a586e'], [.75, '#2a3446'], [1, '#161c28']]), [
    { el: `<path d="M428 300Q436 340 428 356L460 356L452 296Z" fill="${wG}"/>` },
    { el: `<path d="M424 296Q436 300 450 296" fill="none" stroke="#e8eef8" stroke-width="4" opacity=".5" filter="url(#b2)"/>` },
    { d: 'M410 250Q404 276 412 296Q424 270 424 250Z', fill: '#cbd8ec', op: .38, blur: 'b2' },
    { d: 'M446 250Q462 280 452 310L462 310L462 250Z', fill: '#050810', op: .55, blur: 'b2' },
    { el: `<path d="M448 252Q458 280 450 308" fill="none" stroke="#7dffc4" stroke-width="2.2" opacity=".6" filter="url(#b1)" style="mix-blend-mode:screen"/>` },
    { el: hair({ box: [396, 244, 462, 356], n: 120, seed: 8, flow: (x, y) => Math.PI / 2 + .25, L: [8, 14], col: () => '#d6e2f2', op: .3, w: .8, inside: (x, y) => y > 290 }) }
  ], { stroke: '#10141f', sw: .9 });
  s += furF({ box: [400, 330, 458, 356], n: 40, seed: 9, inside: (x, y) => x > 424 && x < 456, flow: () => Math.PI / 2, L: [6, 10], w: [3.4, 5], bend: 3, col: fcol(WH, 440, 340, 20, 16), sw: .4 });
  s += furF({ box: [320, 222, 460, 300], n: 330, seed: 61, inside: (x, y) => ((x - 392) / 68) ** 2 + ((y - 262) / 38) ** 2 < 1 && y < 290 && x > 340, flow: (x, y) => .55 + (y - 240) * .004, L: [10, 15], w: [4.4, 6.6], bend: 3, col: fcol(GR, 380, 236, 70, 44, .52, .62), sw: .4, order: (x, y) => x + y * .2, dark: '#0c1018' });
  s += furF({ box: [398, 244, 462, 312], n: 150, seed: 62, inside: (x, y) => ((x - 432) / 27) ** 2 + ((y - 274) / 33) ** 2 < 1, flow: (x, y) => Math.PI / 2 + .55, L: [9, 14], w: [4.4, 6.4], bend: 3, col: fcol(GR, 424, 252, 34, 40, .5, .62), sw: .4, dark: '#0c1018' });
  // paw toes lines
  s += `<path d="M436 349l1 5M442 350l0 5M448 349l-1 5" stroke="#50607c" stroke-width=".9" fill="none"/>`;
  // near front leg
  const fr = sp([[318, 262], [348, 258], [352, 296], [350, 330], [354, 349, 1], [344, 356, 1], [316, 357, 1], [314, 346], [322, 332], [322, 300]]);
  s += paint(fr, D.lg(314, 258, 356, 356, [[0, '#ffffff'], [.5, '#dfe6f1'], [1, '#8e9ab6']]), [
    { d: 'M340 262H352V356H338Z', fill: '#2a3454', op: .5, blur: 'b2' },
    { d: 'M318 272Q316 310 322 340', fill: 'none', stroke: '#fff', sw: 2.4, op: .7, blur: 'b1' },
    { el: `<ellipse cx="316" cy="318" rx="10" ry="36" fill="${D.rg(316, 318, 1, [[0, '#ffb454', .5], [1, '#ffb454', 0]], 10, 36)}" style="mix-blend-mode:screen"/>` },
    { el: `<path d="M350 270Q354 310 350 340" fill="none" stroke="#7dffc4" stroke-width="2" opacity=".6" filter="url(#b1)" style="mix-blend-mode:screen"/>` },
    { el: hair({ box: [312, 262, 356, 356], n: 70, seed: 10, flow: () => Math.PI / 2, L: [8, 14], col: () => '#8ea0c0', op: .42, w: .8 }) }], { stroke: '#10141f', sw: .9 });
  s += `<path d="M326 347l1 6M332 348l0 6M339 347l-1 6" stroke="#50607c" stroke-width="1" fill="none"/>`;
  s += furF({ box: [314, 270, 354, 292], n: 44, seed: 12, flow: () => Math.PI / 2 + .1, L: [8, 13], w: [3.6, 5.4], bend: 3, col: fcol(WH, 330, 280, 24, 16), sw: .4 });
  // harness (red leather, gold hardware)
  const redG = D.lg(0, 230, 0, 300, [[0, '#f0504a'], [.5, '#c62a30'], [1, '#6e0c1a']]);
  s += `<path d="${sp([[332, 226], [340, 250], [346, 282], [350, 300]], false)}" fill="none" stroke="#3a0610" stroke-width="8.4"/><path d="${sp([[332, 226], [340, 250], [346, 282], [350, 300]], false)}" fill="none" stroke="${redG}" stroke-width="6.4"/>`;
  s += `<path d="${sp([[334, 226], [342, 250], [348, 282], [352, 300]], false)}" fill="none" stroke="#ff9a8a" stroke-width="1" opacity=".6"/>`;
  s += `<path d="${sp([[322, 270], [340, 280], [366, 286], [394, 284], [420, 276]], false)}" fill="none" stroke="#3a0610" stroke-width="8.4"/><path d="${sp([[322, 270], [340, 280], [366, 286], [394, 284], [420, 276]], false)}" fill="none" stroke="${redG}" stroke-width="6.4"/>`;
  s += `<path d="${sp([[326, 271], [342, 281], [366, 287], [394, 285], [420, 277]], false)}" fill="none" stroke="#ff9a8a" stroke-width="1" opacity=".5"/>`;
  s += `<path d="${sp([[370, 223], [376, 250], [380, 286]], false)}" fill="none" stroke="#3a0610" stroke-width="7.4"/><path d="${sp([[370, 223], [376, 250], [380, 286]], false)}" fill="none" stroke="${redG}" stroke-width="5.4"/>`;
  s += stitchedLine([[334, 232], [341, 252], [346, 280]]);
  const ring = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#3a2408" stroke-width="3.6"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${D.lg(x - r, y - r, x + r, y + r, [[0, '#fff2b0'], [.5, '#e0a83e'], [1, '#6a4410']])}" stroke-width="2.4"/>`;
  s += ring(332, 226, 5.4) + ring(350, 302, 4.4) + ring(380, 286, 4.2) + ring(371, 223, 4.6);
  // little aurora gem tag on the chest ring
  s += `<path d="M350 306l-4 7l4 8l4 -8z" fill="${D.lg(346, 306, 354, 322, [[0, '#d8fff0'], [.5, '#7dffc4'], [1, '#6a3cc8']])}" stroke="#2a1a6a" stroke-width=".8"/><path d="M348 311l2 -3" stroke="#fff" stroke-width="1" opacity=".9"/>`;
  // chest ruff (white tufts) + belly fringe + haunch feathering
  const wc = fcol(WH, 330, 270, 40, 40, .6, .5);
  s += furF({ box: [300, 236, 346, 312], n: 230, seed: 21, inside: (x, y) => ((x - 326) / 26) ** 2 + ((y - 272) / 38) ** 2 < 1, flow: (x, y) => Math.atan2((y - 262) * .9, (x - 340) * 1.6) + .12, L: [12, 19], w: [4, 6], bend: 4, col: wc, sw: .5, order: (x, y) => -x * .2 + y * .1 });
  s += furF({ box: [350, 292, 430, 312], n: 90, seed: 22, inside: (x, y) => y > 290 + Math.sin(x * .1) * 2, flow: () => Math.PI / 2 + .35, L: [8, 13], w: [3.6, 5.4], bend: 3, col: fcol(WH, 390, 300, 50, 20), sw: .4 });
  s += furF({ box: [420, 262, 462, 306], n: 70, seed: 23, inside: (x, y) => ((x - 446) / 16) ** 2 + ((y - 290) / 18) ** 2 < 1 && x > 430, flow: () => Math.PI / 2 + .5, L: [8, 14], w: [3.6, 5.4], bend: 3, col: fcol(WH, 440, 290, 20, 18), sw: .4 });
  // neck mane (behind head, in front of body)
  const mane = (x, y) => ((x - 330) / 36) ** 2 + ((y - 238) / 24) ** 2 < 1;
  s += furF({ box: [292, 212, 372, 264], n: 180, seed: 24, inside: mane, flow: (x, y) => Math.atan2((y - 214) * 1.1, (x - 330) * 1.4), L: [12, 18], w: [4, 6], bend: 4, col: fcol(WH, 326, 232, 40, 28, .62, .55), sw: .5, order: (x, y) => y });
  P.dBody = { bbox, scale: SC, q: .84, svg: part(bbox, SC, s, D.get()) };
  function stitchedLine(pts) { return `<path d="${sp(pts, false)}" fill="none" stroke="#ffd7a0" stroke-opacity=".6" stroke-width=".7" stroke-dasharray="2 2"/>`; }
})();

// ===================== TAIL =====================
(function () {
  const D = defs(); const bbox = [412, 150, 62, 110]; let s = '';
  const c = [[446, 252], [462, 232], [468, 206], [458, 182], [440, 170], [428, 172]];
  const sm = samp(c, 24); const wd = (i) => 6 + 9 * Math.sin(Math.min(1, i / 24) * 2.6 + .2) * (1 - i / 40);
  const L = sm.map(([x, y, a], i) => [x - Math.sin(a) * wd(i), y + Math.cos(a) * wd(i)]), Rr = sm.map(([x, y, a], i) => [x + Math.sin(a) * wd(i), y - Math.cos(a) * wd(i)]).reverse();
  const tip = [c[5][0] - 8, c[5][1] - 2];
  const d = sp(L.concat([tip]).concat(Rr), true, 1 / 6);
  s += paint(d, D.lg(430, 170, 470, 250, [[0, '#9fb0c8'], [.4, '#5d6c82'], [1, '#222a3a']]), [
    { el: `<path d="${sp(c, false)}" fill="none" stroke="#f6fbff" stroke-width="7" opacity=".85" filter="url(#b2)" transform="translate(-4 3)"/>` },
    { el: `<path d="${sp(c, false)}" fill="none" stroke="#050810" stroke-width="9" opacity=".5" filter="url(#b2)" transform="translate(7 -3)"/>` },
    { el: `<path d="${sp(c, false)}" fill="none" stroke="#7dffc4" stroke-width="2" opacity=".6" filter="url(#b1)" transform="translate(9 -3)" style="mix-blend-mode:screen"/>` }], { stroke: '#10141f', sw: .9 });
  s += furF({ box: bbox.slice(0, 2).concat([474, 258]), n: 280, seed: 31, inside: (x, y) => { let m = 1e9; for (const p of sm) m = Math.min(m, Math.hypot(p[0] - x, p[1] - y)); return m < 12; }, flow: (x, y) => { let b = sm[0], m = 1e9; for (const p of sm) { const q = Math.hypot(p[0] - x, p[1] - y); if (q < m) { m = q; b = p; } } return b[2] + Math.sign(Math.sin(b[2] - Math.atan2(y - b[1], x - b[0]))) * .5; }, L: [8, 13], w: [3.6, 5.4], bend: 3, col: (x, y, r) => ramp(GR, lit(x, y, 446, 200, 24, 40, .55, .5) + (r - .5) * .25 + (x < 450 && y < 220 ? .18 : 0)), sw: .45 });
  P.dTail = { bbox, scale: SC, q: .84, svg: part(bbox, SC, s, D.get()) };
})();

// ===================== HEAD (3/4 view, facing viewer-left) =====================
const EYE = { near: [330, 185], far: [313, 189] };
(function () {
  const D = defs(); const bbox = [262, 134, 126, 118]; let s = '';
  const wcol = fcol(WH, 326, 200, 36, 30, .62, .5);
  // cheek / jaw ruff behind + below the skull
  s += furF({ box: [300, 186, 386, 252], n: 150, seed: 41, inside: (x, y) => ((x - 344) / 34) ** 2 + ((y - 214) / 24) ** 2 < 1, flow: (x, y) => Math.atan2((y - 200) * 1.0, (x - 336) * 1.2) + .1, L: [10, 16], w: [3.8, 5.8], bend: 4, col: wcol, sw: .45, order: (x, y) => -x * .3 + y * .2 });
  const sk = sp([[334, 159], [348, 162], [358, 174], [361, 190], [356, 206], [346, 218], [332, 226], [318, 229], [302, 226], [292, 219], [288, 209, 1], [292, 200], [302, 196], [312, 190], [318, 176], [326, 164]]);
  const gray = D.lg(300, 160, 362, 228, [[0, '#8696b0'], [.4, '#505f76'], [1, '#222a3a']]);
  const lay = [
    { el: `<path d="M286 212Q300 208 314 204Q324 207 334 214Q346 216 354 222L352 240L284 240Z" fill="${D.lg(0, 204, 0, 238, [[0, '#ffffff'], [1, '#b8c4dc']])}"/>` },
    { el: `<path d="M331 158L338 160L326 178L312 192L299 199L294 197L308 188L320 174Z" fill="#f4f8ff"/>` },
    { el: `<ellipse cx="327" cy="175" rx="4.6" ry="2.8" fill="#f4f8ff" transform="rotate(-25 327 175)"/><ellipse cx="310" cy="181" rx="3.4" ry="2.2" fill="#f4f8ff" transform="rotate(-25 310 181)"/>` },
    { el: `<path d="M319 186Q324 177 336 178Q348 182 352 192Q346 198 336 196Q324 196 319 186Z" fill="#141a26" opacity=".92" filter="url(#b1)"/><path d="M304 190Q308 184 316 186Q320 192 314 196Q306 196 304 190Z" fill="#141a26" opacity=".85" filter="url(#b1)"/>` },
    { d: 'M346 160Q366 180 358 212Q350 226 336 228Q350 196 346 160Z', fill: '#2a2e5a', op: .5, blur: 'b4' },
    { d: 'M286 206Q298 204 312 200L312 214Q298 218 286 214Z', fill: '#ffd7a0', op: .4, blur: 'b2' },
    { el: `<path d="M356 172Q364 192 354 212" fill="none" stroke="#7dffc4" stroke-width="2.4" opacity=".65" filter="url(#b1)" style="mix-blend-mode:screen"/>` },
    { el: `<path d="M322 164Q336 156 352 164" fill="none" stroke="#dce8ff" stroke-width="2" opacity=".5" filter="url(#b1)"/>` },
    { el: hair({ box: [286, 156, 364, 230], n: 200, seed: 42, flow: (x, y) => Math.atan2(y - 170, x - 330) * .6 + .5, L: [5, 10], col: () => '#0a0e18', op: .3, w: .7, inside: (x, y) => y < 202 && x > 312 }) },
    { el: hair({ box: [286, 156, 364, 230], n: 90, seed: 43, flow: () => .2, L: [5, 9], col: () => '#aab8d0', op: .45, w: .7, inside: (x, y) => y > 198 || x < 318 }) }
  ];
  s += paint(sk, gray, lay, { stroke: '#10141f', sw: .9 });
  // lips / mouth line
  s += `<path d="M291 214Q304 219 318 215Q324 214 327 217" fill="none" stroke="#1a2030" stroke-width="1.4"/><path d="M296 205Q306 202 316 199" fill="none" stroke="#fff" stroke-width="1.3" opacity=".5"/>`;
  // nose
  s += `<path d="M288 204Q290 198 297 199Q300 205 296 211Q290 213 288 204Z" fill="${D.lg(288, 198, 298, 212, [[0, '#5a6274'], [.4, '#10141c'], [1, '#05070c']])}" stroke="#05070c" stroke-width=".8"/><ellipse cx="292" cy="201.5" rx="2.4" ry="1.2" fill="#fff" opacity=".8" transform="rotate(-20 292 201.5)"/><ellipse cx="294.4" cy="207" rx="1.1" ry="1.7" fill="#000"/>`;
  // whisker dots
  s += `<g fill="#3a4258">${[[298, 211], [302, 209], [300, 214], [306, 212]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".7"/>`).join('')}</g>`;
  P.dHead = { bbox, scale: SC * 1.1, q: .86, svg: part(bbox, SC * 1.1, s, D.get(), { r: .8, c: '#0a0e18', o: .9 }) };
})();

// ===================== EARS =====================
function ear(name, near) {
  const D = defs(); const bbox = near ? [334, 128, 38, 52] : [312, 130, 34, 50]; let s = '';
  const pts = near ? [[341, 176], [341, 150], [350, 134, 0], [358, 142], [361, 164], [356, 178]] : [[326, 172], [320, 150], [322, 136, 0], [332, 144], [338, 160], [338, 174]];
  const d = sp(pts);
  s += paint(d, D.lg(310, 130, 362, 178, [[0, '#6a7a94'], [.5, '#36425a'], [1, '#1a2030']]), [
    { el: `<path d="${near ? 'M345 174Q345 152 351 142Q356 152 356 174Z' : 'M329 170Q325 152 327 144Q334 154 334 170Z'}" fill="${D.lg(0, 140, 0, 176, [[0, '#f2c8c4'], [1, '#a46a74']])}"/>` },
    { el: furF({ box: near ? [343, 150, 357, 178] : [327, 150, 336, 174], n: 12, seed: near ? 51 : 52, flow: () => -Math.PI / 2, L: [6, 9], w: [2.8, 4], bend: 2, col: () => '#f2f6ff', sw: .3 }) },
    { el: near ? `<path d="M358 148Q362 164 356 176" stroke="#7dffc4" stroke-width="2" opacity=".8" fill="none" filter="url(#b1)" style="mix-blend-mode:screen"/>` : `<path d="M322 144L326 172" stroke="#b8c8e0" stroke-width="1.4" opacity=".5" fill="none" filter="url(#b1)"/>` }], { stroke: '#10141f', sw: .9 });
  P[name] = { bbox, scale: SC * 1.1, q: .86, svg: part(bbox, SC * 1.1, s, D.get(), { r: .8, c: '#0a0e18', o: .9 }) };
}
ear('dEarL', false); ear('dEarR', true);

// ===================== OPEN-MOUTH PATCH =====================
(function () {
  const D = defs(); const bbox = [278, 196, 62, 52]; let s = '';
  // dark mouth interior, tongue, fangs, dropped lower jaw (white)
  s += `<path d="${sp([[290, 213], [304, 217], [320, 214], [326, 218], [320, 230], [304, 236], [292, 228]])}" fill="${D.lg(0, 213, 0, 236, [[0, '#5a1a24'], [1, '#240a10']])}" stroke="#10141f" stroke-width=".8"/>`;
  s += `<path d="${sp([[296, 228], [308, 224], [320, 224], [318, 232], [306, 236], [298, 233]])}" fill="${D.lg(0, 224, 0, 236, [[0, '#ff9aa8'], [1, '#d04a62']])}"/>`;
  s += `<path d="M294 214l2.4 6.4l2.4 -6M312 215l2 5l2 -5.4" fill="#fff" stroke="#9aa8c0" stroke-width=".4"/>`;
  s += `<path d="${sp([[290, 228], [300, 236], [316, 238], [334, 232], [346, 230], [350, 242], [330, 248], [304, 248], [288, 240]])}" fill="${D.lg(0, 228, 0, 248, [[0, '#f6f9ff'], [1, '#b8c4dc']])}" stroke="#10141f" stroke-width=".9"/>`;
  s += `<path d="M290 228l2 -5l2.6 5.6" fill="#fff" stroke="#9aa8c0" stroke-width=".4"/>`;
  P.dJaw = { bbox, scale: SC * 1.1, q: .86, svg: part(bbox, SC * 1.1, s, D.get(), { r: .8, c: '#0a0e18', o: .9 }) };
})();
module.exports = P;
