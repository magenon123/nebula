// Tuuli the husky (sitting, frontal). Baked parts: body, tail, head, 2 ears, open-mouth overlay. Eyes stay vector.
const { G, strands, pip, dpath, ellPts, cr, dense, rng, f } = require('./charlib.cjs');
const DX = 385; // dog axis
const P = { dk: ['#23282f', '#3a414b', '#59616d', '#7d8794'], wh: ['#ffffff', '#f1f5fa', '#dde5ee', '#b9c4d2'] };
const scl = (pts, k, c) => pts.map(p => [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k]);
// radial/edge fur helper: fills a shape's rim with outward strands to break the outline
function edgeFur(poly, cen, o) { const inner = scl(poly, o.k || .9, cen); const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
  return strands({ n: o.n, seed: o.seed, box: [Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3], inside: (x, y) => pip(x, y, poly) && !pip(x, y, inner), flow: (x, y) => Math.atan2(y - cen[1], x - cen[0]) + (o.bias || 0), len: o.len || [3, 7], w: o.w || [.25, .45], cols: o.cols, op: o.op || [.6, .95], curl: .5, jit: .4 }); }

exports.body = () => {
  const g = new G('tb'); const b1 = g.blur(1), b2 = g.blur(2.4), b4 = g.blur(5); const rough = g.rough(.45, 2.2, 3);
  const torso = dense([[DX - 4, 250], [DX + 22, 252], [DX + 36, 272], [DX + 40, 305], [DX + 44, 335], [DX + 30, 356], [DX - 30, 356], [DX - 44, 335], [DX - 40, 305], [DX - 36, 272], [DX - 22, 252]], 8);
  const hL = dense([[DX - 66, 322], [DX - 62, 296], [DX - 42, 284], [DX - 24, 296], [DX - 20, 326], [DX - 26, 352], [DX - 50, 358], [DX - 68, 350]], 8);
  const hR = dense([[DX + 66, 322], [DX + 62, 296], [DX + 42, 284], [DX + 24, 296], [DX + 20, 326], [DX + 26, 352], [DX + 50, 358], [DX + 68, 350]], 8);
  const chest = dense([[DX, 244], [DX + 20, 256], [DX + 24, 290], [DX + 16, 322], [DX + 6, 330], [DX - 6, 330], [DX - 16, 322], [DX - 24, 290], [DX - 20, 256]], 8);
  const legL = dense([[DX - 20, 292], [DX - 8, 292], [DX - 6, 334], [DX - 5, 350], [DX - 7, 358], [DX - 30, 358], [DX - 28, 350], [DX - 22, 334]], 6);
  const legR = dense([[DX + 20, 292], [DX + 8, 292], [DX + 6, 334], [DX + 5, 350], [DX + 7, 358], [DX + 30, 358], [DX + 28, 350], [DX + 22, 334]], 6);
  const pawL = dense([[DX - 28, 346], [DX - 8, 346], [DX - 6, 358], [DX - 10, 361], [DX - 30, 361], [DX - 32, 357]], 5), pawR = dense([[DX + 28, 346], [DX + 8, 346], [DX + 6, 358], [DX + 10, 361], [DX + 30, 361], [DX + 32, 357]], 5);
  const hpL = dense([[DX - 70, 346], [DX - 52, 344], [DX - 38, 350], [DX - 36, 360], [DX - 66, 362], [DX - 72, 356]], 5), hpR = dense([[DX + 70, 346], [DX + 52, 344], [DX + 38, 350], [DX + 36, 360], [DX + 66, 362], [DX + 72, 356]], 5);
  const darkG = g.lin(0, 250, 0, 360, [[0, '#59616d'], [.5, '#3a414b'], [1, '#1c2128']]);
  const whG = g.lin(0, 244, 0, 360, [[0, '#ffffff'], [.6, '#e6edf5'], [1, '#aab8cc']]);
  const dkS = (poly, cen, n, seed, ys = [0, 999]) => strands({ n, seed, box: [Math.min(...poly.map(p => p[0])), Math.min(...poly.map(p => p[1])), Math.max(...poly.map(p => p[0])), Math.max(...poly.map(p => p[1]))], inside: (x, y) => pip(x, y, poly), flow: (x, y) => Math.PI / 2 + (x - cen[0]) * .018 + (cen[2] || 0), len: [5, 11], w: [.25, .45], cols: [[P.dk[0], 1], [P.dk[1], 1.4], [P.dk[2], 1.2], [P.dk[3], .5], ['#c8d0da', .3]], op: [.5, .95], curl: .5, jit: .4 });
  const whS = (poly, cen, n, seed) => strands({ n, seed, box: [Math.min(...poly.map(p => p[0])), Math.min(...poly.map(p => p[1])), Math.max(...poly.map(p => p[0])), Math.max(...poly.map(p => p[1]))], inside: (x, y) => pip(x, y, poly), flow: (x, y) => Math.PI / 2 + (x - cen[0]) * .02, len: [5, 10], w: [.25, .42], cols: [[P.wh[0], 1.4], [P.wh[1], 1], [P.wh[2], .8], [P.wh[3], .4], ['#8a97ab', .25]], op: [.5, .95], curl: .5, jit: .4 });
  const hipFlow = (c) => (x, y) => Math.atan2(y - c[1], x - c[0]) + 1.2;
  const hip = (poly, c, n, seed) => strands({ n, seed, box: [c[0] - 40, c[1] - 40, c[0] + 40, c[1] + 40], inside: (x, y) => pip(x, y, poly), flow: (x, y) => Math.PI / 2 + (x - c[0]) * .03, len: [5, 11], w: [.25, .45], cols: [[P.dk[0], 1], [P.dk[1], 1.4], [P.dk[2], 1.3], [P.dk[3], .6], ['#e4eaf2', .5]], op: [.5, .95], curl: .5, jit: .4 });
  const shape = (poly, fill) => `<path d="${dpath(poly)}" fill="${fill}"/>`;
  const rimC = '#b9ffe6';
  const svg = `<defs>@@D:${g.p}@@</defs>
  <ellipse cx="${DX}" cy="360" rx="84" ry="8" fill="#010510" opacity=".6" filter="${b2}"/><ellipse cx="${DX}" cy="360" rx="40" ry="4" fill="#010510" opacity=".5" filter="${b1}"/>
  <g filter="${rough}">${shape(hL, darkG)}${shape(hR, darkG)}${shape(torso, darkG)}${shape(hpL, whG)}${shape(hpR, whG)}</g>
  ${hip(hL, [DX - 44, 322], 1300, 3)}${hip(hR, [DX + 44, 322], 1300, 4)}${dkS(torso, [DX, 300], 900, 5)}
  <path d="M${DX - 46} 296Q${DX - 30} 300 ${DX - 24} 330" stroke="#010510" stroke-width="5" fill="none" opacity=".55" filter="${b2}"/><path d="M${DX + 46} 296Q${DX + 30} 300 ${DX + 24} 330" stroke="#010510" stroke-width="5" fill="none" opacity=".55" filter="${b2}"/>
  <g filter="${rough}">${shape(legL, whG)}${shape(legR, whG)}${shape(pawL, whG)}${shape(pawR, whG)}${shape(chest, whG)}</g>
  <ellipse cx="${DX}" cy="338" rx="26" ry="22" fill="#010510" opacity=".0"/>
  ${whS(chest, [DX, 280], 1500, 6)}${whS(legL, [DX - 18, 320], 700, 7)}${whS(legR, [DX + 18, 320], 700, 8)}${whS(pawL, [DX - 18, 350], 200, 9)}${whS(pawR, [DX + 18, 350], 200, 10)}${whS(hpL, [DX - 54, 352], 260, 11)}${whS(hpR, [DX + 54, 352], 260, 12)}
  ${edgeFur(hL, [DX - 44, 322], { n: 600, seed: 21, cols: [[P.dk[1], 1], [P.dk[2], 1], [P.dk[3], .6]], k: .86 })}${edgeFur(hR, [DX + 44, 322], { n: 600, seed: 22, cols: [[P.dk[1], 1], [P.dk[2], 1], [P.dk[3], .6]], k: .86 })}${edgeFur(chest, [DX, 290], { n: 500, seed: 23, cols: [[P.wh[0], 1], [P.wh[1], 1], [P.wh[2], .6]], k: .88 })}
  <path d="M${DX - 6} 296V352M${DX + 6} 296V352" stroke="#8a97ab" stroke-width="2.4" opacity="0" />
  <path d="M${DX - 19} 318Q${DX - 8} 322 ${DX - 7} 346M${DX + 19} 318Q${DX + 8} 322 ${DX + 7} 346" stroke="#6a7a90" stroke-width="2" fill="none" opacity=".5" filter="${b1}"/>
  <path d="M${DX - 29} 352l4 8M${DX - 23} 352v9M${DX - 17} 352l-2 9M${DX + 29} 352l-4 8M${DX + 23} 352v9M${DX + 17} 352l2 9M${DX - 66} 350l4 10M${DX - 58} 350l1 11M${DX - 50} 350l-2 11M${DX + 66} 350l-4 10M${DX + 58} 350l-1 11M${DX + 50} 350l2 11" stroke="#7a889e" stroke-width=".7" opacity=".7" fill="none"/>
  <ellipse cx="${DX - 10}" cy="240" rx="40" ry="10" fill="#010510" opacity=".35" filter="${b4}"/>
  <!-- collar -->
  <path d="M${DX - 30} 252Q${DX} 270 ${DX + 30} 252L${DX + 30} 262Q${DX} 280 ${DX - 30} 262Z" fill="${g.lin(0, 252, 0, 280, [[0, '#e04a48'], [.5, '#b01c2c'], [1, '#600c18']])}" stroke="#2a0610" stroke-width=".8"/>
  <path d="M${DX - 29} 254Q${DX} 272 ${DX + 29} 254" stroke="#ffb0a8" stroke-width=".8" fill="none" opacity=".6"/>
  <circle cx="${DX}" cy="276" r="5.4" fill="${g.lin(DX - 5, 270, DX + 5, 282, [[0, '#fff0b0'], [.5, '#e0b24e'], [1, '#7a4a12']])}" stroke="#4a2c08" stroke-width=".8"/><path d="M${DX - 3} 274Q${DX} 272 ${DX + 3} 274" stroke="#fff" stroke-width=".8" fill="none" opacity=".8"/>`;
  return { x: DX - 80, y: 232, w: 164, h: 138, s: 3, svg, q: .86 };
};

exports.tail = () => {
  const g = new G('tt'); const b1 = g.blur(1), b2 = g.blur(2.4); const rough = g.rough(.45, 2.2, 7);
  const cl = [[438, 340], [458, 336], [472, 312], [474, 282], [466, 256], [452, 244]];
  const wid = t => 9 + 8 * Math.sin(Math.min(1, t * 1.1) * Math.PI * .9) + 2;
  const L = [], R = []; for (let i = 0; i <= 24; i++) { const t = i / 24, n = cl.length - 1, k = Math.min(n - 1, Math.floor(t * n)), u = t * n - k; const a = cl[k], b = cl[k + 1], c = cl[Math.max(0, k - 1)], d = cl[Math.min(n, k + 2)]; const uu = u * u, u3 = uu * u; const pt = [0, 1].map(j => .5 * ((2 * a[j]) + (-c[j] + b[j]) * u + (2 * c[j] - 5 * a[j] + 4 * b[j] - d[j]) * uu + (-c[j] + 3 * a[j] - 3 * b[j] + d[j]) * u3)); const t2 = [0, 1].map(j => b[j] - a[j]); const l = Math.hypot(t2[0], t2[1]); const w = wid(t) / 2; L.push([pt[0] - t2[1] / l * w, pt[1] + t2[0] / l * w]); R.push([pt[0] + t2[1] / l * w, pt[1] - t2[0] / l * w]); }
  const poly = dense([...L, ...R.reverse()], 2);
  const cen = (x, y) => { let best = 1e9, bi = 0; for (let i = 0; i < cl.length; i++) { const d = Math.hypot(cl[i][0] - x, cl[i][1] - y); if (d < best) { best = d; bi = i; } } const a = cl[Math.max(0, bi - 1)], b = cl[Math.min(cl.length - 1, bi + 1)]; return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  const base = g.lin(440, 250, 476, 340, [[0, '#8a95a4'], [.5, '#4a525e'], [1, '#2a3038']]);
  const tipW = (x, y) => y < 276 || (x < 462 && y < 262);
  const svg = `<defs>@@D:${g.p}@@</defs><g filter="${rough}"><path d="${dpath(poly)}" fill="${base}"/></g>
   ${strands({ n: 1500, seed: 31, box: [430, 240, 482, 350], inside: (x, y) => pip(x, y, poly), flow: cen, len: [6, 13], w: [.25, .45], cols: [[P.dk[0], 1], [P.dk[1], 1.4], [P.dk[2], 1.3], [P.dk[3], .8]], op: [.5, .95], curl: .6, jit: .5 })}
   ${strands({ n: 700, seed: 32, box: [430, 240, 482, 350], inside: (x, y) => pip(x, y, poly) && (x < 462 && y > 262 || y > 300) && x < 470 && x > 440 && Math.hypot(x - 452, y - 300) < 28 && x < 465, flow: cen, len: [6, 12], w: [.25, .42], cols: [[P.wh[0], 1.4], [P.wh[2], 1], [P.wh[1], 1]], op: [.4, .9], curl: .5 })}
   ${strands({ n: 500, seed: 33, box: [430, 240, 482, 350], inside: (x, y) => pip(x, y, poly) && y < 266, flow: cen, len: [6, 12], w: [.25, .42], cols: [[P.wh[0], 1.4], [P.wh[1], 1]], op: [.5, .95], curl: .5 })}
   ${edgeFur(poly, [458, 296], { n: 700, seed: 34, cols: [[P.dk[2], 1], [P.dk[3], 1], [P.wh[1], .5]], k: .85, len: [4, 9] })}`;
  return { x: 428, y: 234, w: 60, h: 120, s: 3, svg, q: .86 };
};

const headPts = [[DX, 192], [DX + 12, 194], [DX + 22, 202], [DX + 28, 214], [DX + 33, 224], [DX + 27, 236], [DX + 17, 246], [DX + 7, 252], [DX, 254], [DX - 7, 252], [DX - 17, 246], [DX - 27, 236], [DX - 33, 224], [DX - 28, 214], [DX - 22, 202], [DX - 12, 194]];
const headP = dense(headPts, 8);
const muzzlePts = [[DX, 211], [DX + 6, 213], [DX + 12, 222], [DX + 15, 236], [DX + 9, 246], [DX, 250], [DX - 9, 246], [DX - 15, 236], [DX - 12, 222], [DX - 6, 213]];
const muzzleP = dense(muzzlePts, 8);
exports.EYE = [[DX - 12, 219], [DX + 12, 219]];
exports.head = () => {
  const g = new G('th'); const b1 = g.blur(1), b2 = g.blur(2), b3 = g.blur(3.5), bh = g.blur(.6); const rough = g.rough(.4, 3.2, 11);
  const cap = dense([[DX, 190], [DX + 16, 194], [DX + 28, 208], [DX + 31, 224], [DX + 22, 226], [DX + 15, 218], [DX + 7, 206], [DX + 3, 200], [DX, 198], [DX - 3, 200], [DX - 7, 206], [DX - 15, 218], [DX - 22, 226], [DX - 31, 224], [DX - 28, 208], [DX - 16, 194]], 8);
  const blaze = dense([[DX, 196], [DX + 3.4, 202], [DX + 5, 212], [DX + 8, 220], [DX, 224], [DX - 8, 220], [DX - 5, 212], [DX - 3.4, 202]], 8);
  const mask = dense([[DX - 30, 218], [DX - 20, 207], [DX - 8, 212], [DX - 5, 226], [DX - 14, 230], [DX - 28, 230]], 6), maskR = dense([[DX + 30, 218], [DX + 20, 207], [DX + 8, 212], [DX + 5, 226], [DX + 14, 230], [DX + 28, 230]], 6);
  const cheekW = dense([[DX - 33, 224], [DX - 20, 232], [DX - 8, 232], [DX - 14, 246], [DX - 24, 246], [DX - 31, 238]], 6), cheekR = dense([[DX + 33, 224], [DX + 20, 232], [DX + 8, 232], [DX + 14, 246], [DX + 24, 246], [DX + 31, 238]], 6);
  const darkBase = g.ell(DX, 206, 36, 30, [[0, '#59616d'], [.6, '#3a414b'], [1, '#232830']]);
  const whBase = g.ell(DX, 236, 30, 26, [[0, '#ffffff'], [.7, '#e6edf5'], [1, '#aab8cc']]);
  const clipH = g.clip(dpath(headP));
  const rad = (cx, cy) => (x, y) => Math.atan2(y - cy, x - cx);
  const flowH = (x, y) => y < 228 ? Math.atan2(y - 222, x - DX) : Math.atan2(y - 232, x - DX) + (x < DX ? .2 : -.2);
  const dkFur = strands({ n: 2600, seed: 41, box: [DX - 36, 188, DX + 36, 256], inside: (x, y) => pip(x, y, headP) && !pip(x, y, muzzleP) && (pip(x, y, cap) || pip(x, y, mask) || pip(x, y, maskR)), flow: flowH, len: [4, 8], w: [.22, .4], cols: [[P.dk[0], 1], [P.dk[1], 1.4], [P.dk[2], 1.3], [P.dk[3], .6]], op: [.5, .95], curl: .5, jit: .4 });
  const whFur = strands({ n: 3000, seed: 42, box: [DX - 36, 188, DX + 36, 256], inside: (x, y) => pip(x, y, headP) && !(pip(x, y, cap) || pip(x, y, mask) || pip(x, y, maskR)) || pip(x, y, blaze) || pip(x, y, muzzleP), flow: flowH, len: [4, 8], w: [.22, .4], cols: [[P.wh[0], 1.4], [P.wh[1], 1.1], [P.wh[2], .9], [P.wh[3], .4]], op: [.5, .95], curl: .5, jit: .4 });
  const ruff = dense([[DX - 33, 226], [DX - 40, 244], [DX - 32, 262], [DX - 16, 274], [DX, 278], [DX + 16, 274], [DX + 32, 262], [DX + 40, 244], [DX + 33, 226], [DX + 18, 236], [DX - 18, 236]], 6);
  const ruffFur = strands({ n: 1100, seed: 43, box: [DX - 42, 228, DX + 42, 280], inside: (x, y) => pip(x, y, ruff), flow: (x, y) => Math.PI / 2 + (x - DX) * .04, len: [5, 11], w: [.25, .45], cols: [[P.wh[0], 1.4], [P.wh[1], 1], [P.wh[2], .8], [P.wh[3], .4], [P.dk[2], .35]], op: [.5, .95], curl: .5 });
  const edgeD = edgeFur(headP.filter(p => p[1] < 224), [DX, 226], { n: 420, seed: 45, cols: [[P.dk[1], 1], [P.dk[2], 1], [P.dk[3], .7]], k: .9, len: [4, 8] });
  const edgeW = edgeFur(headP.filter(p => p[1] >= 220), [DX, 226], { n: 520, seed: 46, cols: [[P.wh[0], 1], [P.wh[1], 1], [P.wh[2], .7]], k: .9, len: [4, 9], bias: .25 });
  const rimS = strands({ n: 260, seed: 47, box: [DX + 14, 190, DX + 36, 250], inside: (x, y) => pip(x, y, headP) && !pip(x, y, scl(headP, .88, [DX, 226])), flow: (x, y) => Math.atan2(y - 226, x - DX), len: [3, 7], w: [.22, .4], cols: [['#c8fff0', 1], ['#aef0ff', .6]], op: [.4, .85], curl: .4 });
  const svg = `<defs>@@D:${g.p}@@</defs>
  <g filter="${rough}"><path d="${dpath(ruff)}" fill="#dde5ee"/></g>${ruffFur}
  <ellipse cx="${DX}" cy="248" rx="22" ry="8" fill="#010510" opacity=".4" filter="${b2}"/>
  <g filter="${rough}"><path d="${dpath(headP)}" fill="${darkBase}"/></g>
  <g clip-path="${clipH}">
   <g filter="${rough}"><path d="${dpath(muzzleP)}" fill="${whBase}"/><path d="${dpath(cheekW)}" fill="${whBase}"/><path d="${dpath(cheekR)}" fill="${whBase}"/><path d="${dpath(blaze)}" fill="${whBase}"/></g>
   ${dkFur}${whFur}
   <ellipse cx="${DX - 12}" cy="203" rx="5.4" ry="3" fill="#f4f8fc" opacity=".92" filter="${bh}"/><ellipse cx="${DX + 12}" cy="203" rx="5.4" ry="3" fill="#f4f8fc" opacity=".92" filter="${bh}"/>
   ${strands({ n: 160, seed: 44, box: [DX - 18, 198, DX + 18, 208], inside: (x, y) => ((x - DX + 12) / 6) ** 2 + ((y - 203) / 3.2) ** 2 < 1 || ((x - DX - 12) / 6) ** 2 + ((y - 203) / 3.2) ** 2 < 1, flow: () => -1.2, len: [2, 4], w: [.2, .35], cols: [['#fff', 1]], op: [.6, 1] })}
   <ellipse cx="${DX - 12}" cy="219" rx="7.6" ry="4.6" fill="#0a0d12" opacity=".78" filter="${b1}"/><ellipse cx="${DX + 12}" cy="219" rx="7.6" ry="4.6" fill="#0a0d12" opacity=".78" filter="${b1}"/>
   <path d="M${DX - 17} 220Q${DX - 21} 218 ${DX - 25} 214M${DX + 17} 220Q${DX + 21} 218 ${DX + 25} 214" stroke="#0a0d12" stroke-width="1.6" fill="none" opacity=".7" filter="${bh}"/>
   <ellipse cx="${DX - 22}" cy="238" rx="12" ry="8" fill="#6a7a90" opacity=".26" filter="${b2}"/><ellipse cx="${DX + 22}" cy="238" rx="12" ry="8" fill="#6a7a90" opacity=".18" filter="${b2}"/>
   <path d="M${DX - 8} 240Q${DX} 250 ${DX + 8} 240" stroke="#10151c" stroke-width="1.1" fill="none" opacity=".85"/><path d="M${DX} 236V243" stroke="#10151c" stroke-width="1" opacity=".85"/>
   <path d="M${DX - 3} 244Q${DX} 246 ${DX + 3} 244" stroke="#10151c" stroke-width=".6" fill="none" opacity=".6"/>
  </g>
  ${edgeD}${edgeW}${rimS}
  <!-- nose -->
  <path d="M${DX - 7} 232Q${DX - 8} 227 ${DX} 226Q${DX + 8} 227 ${DX + 7} 232Q${DX + 5} 238 ${DX} 239Q${DX - 5} 238 ${DX - 7} 232Z" fill="${g.lin(0, 226, 0, 240, [[0, '#2a2f38'], [.5, '#10141a'], [1, '#05070a']])}"/>
  <ellipse cx="${DX - 1.4}" cy="228.4" rx="3.6" ry="1.5" fill="#fff" opacity=".55" filter="${bh}"/><ellipse cx="${DX - 3.2}" cy="234.4" rx="1.4" ry="1" fill="#000" opacity=".8"/><ellipse cx="${DX + 3.2}" cy="234.4" rx="1.4" ry="1" fill="#000" opacity=".8"/>
  <path d="M${DX - 8} 231Q${DX - 9} 227 ${DX - 3} 226" stroke="#b9ffe6" stroke-width=".5" fill="none" opacity=".3"/>`;
  return { x: DX - 48, y: 182, w: 96, h: 104, s: 4, svg, q: .88 };
};

exports.ear = (side) => {
  const g = new G('te' + (side < 0 ? 'L' : 'R')); const b1 = g.blur(1), b2 = g.blur(2); const rough = g.rough(.5, 1.6, 13);
  const bx = DX + side * 22;
  const out = dense([[bx - side * 11, 204], [bx - side * 13, 188], [bx - side * 9 + side * 0, 176], [bx + side * 0, 162], [bx + side * 8, 174], [bx + side * 13, 188], [bx + side * 12, 204]], 6);
  const inn = dense([[bx - side * 5, 202], [bx - side * 6, 188], [bx - side * 3, 174], [bx + side * 2, 169], [bx + side * 6, 178], [bx + side * 8, 190], [bx + side * 6, 202]], 6);
  const dk = g.lin(bx - 12, 156, bx + 12, 204, [[0, '#59616d'], [.5, '#343a44'], [1, '#1c2128']]);
  const svg = `<defs>@@D:${g.p}@@</defs><g filter="${rough}"><path d="${dpath(out)}" fill="${dk}"/></g>
   ${strands({ n: 420, seed: 51 + side, box: [bx - 16, 154, bx + 16, 206], inside: (x, y) => pip(x, y, out) && !pip(x, y, inn), flow: (x, y) => -Math.PI / 2 + (x - bx) * .03, len: [4, 8], w: [.22, .4], cols: [[P.dk[0], 1], [P.dk[1], 1.4], [P.dk[2], 1.1], [P.dk[3], .5]], op: [.5, .95], curl: .4 })}
   <path d="${dpath(inn)}" fill="${g.lin(bx, 164, bx, 204, [[0, '#cbb8b0'], [.5, '#e8dcd4'], [1, '#8a7068']])}" opacity=".95"/>
   ${strands({ n: 380, seed: 53 + side, box: [bx - 12, 160, bx + 12, 206], inside: (x, y) => pip(x, y, inn), flow: (x, y) => -Math.PI / 2 + (x - bx) * .06, len: [4, 8], w: [.2, .38], cols: [['#ffffff', 1.4], ['#f1e8e0', 1], ['#d8cdc6', .7]], op: [.5, .95], curl: .5 })}
   <path d="${dpath(inn)}" fill="none" stroke="#1c2128" stroke-width="1" opacity=".5" filter="${b1}"/>
   <path d="M${bx + side * 10} 188Q${bx + side * 8} 172 ${bx + side * 1} 158" stroke="#b9ffe6" stroke-width="1.6" fill="none" opacity="${side > 0 ? .5 : .25}" filter="${b1}"/>`;
  return { x: bx - 20, y: 150, w: 40, h: 60, s: 4, svg, q: .88 };
};

exports.jaw = () => { // open mouth overlay (muzzle bottom). Tongue + lower jaw
  const g = new G('tj'); const b1 = g.blur(.7); const rough = g.rough(.5, 1.2, 17);
  const jaw = dense([[DX - 10, 242], [DX - 6, 252], [DX, 258], [DX + 6, 252], [DX + 10, 242]], 6);
  const svg = `<defs>@@D:${g.p}@@</defs>
   <path d="M${DX - 10} 240Q${DX} 246 ${DX + 10} 240L${DX + 8} 252Q${DX} 262 ${DX - 8} 252Z" fill="#3a0a12"/>
   <path d="M${DX - 7} 249Q${DX} 258 ${DX + 7} 249Q${DX + 5} 258 ${DX} 262Q${DX - 5} 258 ${DX - 7} 249Z" fill="${g.lin(0, 248, 0, 262, [[0, '#ff7a86'], [1, '#c8404e']])}"/><path d="M${DX} 250V258" stroke="#a02c3a" stroke-width=".6" opacity=".7"/>
   <path d="M${DX - 8} 241.4l1 3 1.2-3M${DX + 8} 241.4l-1 3-1.2-3" fill="#fff" stroke="#e8e0d8" stroke-width=".3"/>
   <path d="M${DX - 10} 240Q${DX} 246 ${DX + 10} 240" stroke="#10151c" stroke-width="1.1" fill="none"/>
   <path d="M${DX - 9} 252Q${DX} 262 ${DX + 9} 252" stroke="#e4ecf6" stroke-width="3" fill="none" opacity=".95"/>
   <ellipse cx="${DX}" cy="256" rx="5" ry="1.6" fill="#fff" opacity=".35" filter="${b1}"/>`;
  return { x: DX - 18, y: 232, w: 36, h: 36, s: 6, svg, q: .9 };
};

// vector eyes: icy blue with dark liner and catchlights. S: lib.Sym
exports.eyes = (S) => exports.EYE.map(([x, y], k) => {
  const sd = k ? 1 : -1; const iris = S.rad(x, y, 3.4, [[0, '#0b1018'], [.3, '#1a3c5c'], [.55, '#4a9acc'], [.85, '#9fdcf5'], [1, '#2a6a98']]);
  const sh = `M${x - 5.6} ${y + .8}Q${x - 2.6} ${y - 3} ${x + 1} ${y - 3.2}Q${x + 4.6} ${y - 3} ${x + 5.8} ${y + .2}Q${x + 3} ${y + 3.3} ${x - .4} ${y + 3.3}Q${x - 3.6} ${y + 3.2} ${x - 5.6} ${y + .8}Z`;
  const cl = S.clip(`<path d="${sh}" transform="${k ? `translate(${2 * x} 0) scale(-1 1)` : ''}"/>`);
  return `<g class="dEye" transform="${k ? `translate(${2 * x} 0) scale(-1 1)` : ''}"><path d="${sh}" fill="#0a0d12"/><g clip-path="${S.clip(`<path d="${sh}"/>`)}"><circle cx="${x + .3}" cy="${y}" r="3.1" fill="${iris}"/><circle cx="${x + .3}" cy="${y}" r="1.35" fill="#020406"/><ellipse cx="${x - .6}" cy="${y - 1.2}" rx=".95" ry=".8" fill="#fff"/><circle cx="${x + 1.6}" cy="${y + 1.1}" r=".42" fill="#fff" opacity=".8"/>
   <path d="M${x - 6} ${y - 2.4}Q${x} ${y - 4.6} ${x + 6} ${y - 2.4}V${y - 1}Q${x} ${y - 2.4} ${x - 6} ${y - 1}Z" fill="#05070a" opacity=".55"/></g>
   <path d="M${x - 5.6} ${y + .8}Q${x - 2.6} ${y - 3} ${x + 1} ${y - 3.2}Q${x + 4.6} ${y - 3} ${x + 5.8} ${y + .2}" fill="none" stroke="#05070a" stroke-width="1"/></g>`;
}).join('');
exports.lids = (S) => exports.EYE.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6.6" ry="3.8" fill="${S.rad(x, y, 7, [[0, '#2e353f'], [1, '#14181f']])}"/><path d="M${x - 5.6} ${y + 1}Q${x} ${y + 2.8} ${x + 5.6} ${y + 1}" stroke="#05070a" stroke-width=".8" fill="none"/>`).join('');
