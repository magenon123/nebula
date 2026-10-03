// Silver Fox symbol parts (symbol s6, viewBox 128). Baked: head+ruff, 2 ears, tail. Vector: eyes (slit pupils), lids, nose.
const { G, strands, pip, dpath, ellPts, cr, dense, rng, f } = require('./charlib.cjs');
const OR = ['#7a300c', '#a8481a', '#cf6e26', '#ee9640', '#ffc47a'], WH = ['#ffffff', '#f3f5f9', '#dbe2ea', '#b4c0d0'], BK = ['#0a0a0e', '#1e1e26', '#33333d'], SV = ['#eef2f7', '#cdd6e0', '#a8b4c4'];
const mir = pts => pts.map(([x, y]) => [128 - x, y]);
const rad = (cx, cy) => (x, y) => Math.atan2(y - cy, x - cx);

const headL = [[64, 34], [50, 36], [38, 44], [30, 56], [20, 66], [22, 74], [14, 82], [26, 84], [32, 94], [44, 104], [56, 112], [64, 116]];
const headPts = [...headL, ...mir(headL).reverse().slice(1)].filter((p, i, a) => i === 0 || (p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]));
const headP = dense(headPts, 6);
const muzL = [[64, 62], [58, 66], [54, 78], [52, 92], [56, 104], [64, 110]];
const muzP = dense([...muzL, ...mir(muzL).reverse().slice(1)], 6);
const cheekL = [[22, 82], [34, 80], [44, 86], [51, 98], [56, 108], [44, 107], [32, 100], [20, 92]];
const cheekP = dense(cheekL, 6), cheekRP = dense(mir(cheekL), 6);
const ruffPts = [[18, 92], [14, 108], [26, 122], [48, 126], [64, 127], [80, 126], [102, 122], [114, 108], [110, 92], [92, 100], [64, 108], [36, 100]];
const ruffP = dense(ruffPts, 6);
const flowH = (x, y) => y < 78 ? Math.atan2(y - 62, x - 64) : Math.atan2(y - 70, x - 64) * .6 + Math.PI / 2 * .4;

exports.head = () => {
  const g = new G('xh'); const b1 = g.blur(.8), b2 = g.blur(2), b3 = g.blur(4); const rough = g.rough(.5, 2.6, 21);
  const orG = g.ell(64, 52, 46, 40, [[0, '#f0a050'], [.55, '#d0702a'], [1, '#8a3a12']]);
  const whG = g.lin(0, 64, 0, 126, [[0, '#ffffff'], [.6, '#eef2f7'], [1, '#aab8cc']]);
  const S = (poly, cols, n, seed, o = {}) => strands({ n, seed, box: [Math.min(...poly.map(p => p[0])), Math.min(...poly.map(p => p[1])), Math.max(...poly.map(p => p[0])), Math.max(...poly.map(p => p[1]))], inside: (x, y) => pip(x, y, poly) && (!o.not || !o.not(x, y)) && (!o.only || o.only(x, y)), flow: o.flow || flowH, len: o.len || [4, 9], w: o.w || [.28, .5], cols, op: o.op || [.5, .95], curl: .5, jit: .4 });
  const inMuz = (x, y) => pip(x, y, muzP), inCheek = (x, y) => pip(x, y, cheekP) || pip(x, y, cheekRP);
  const edge = (poly, cen, n, seed, cols, k = .9, len = [4, 9]) => strands({ n, seed, box: [Math.min(...poly.map(p => p[0])) - 3, Math.min(...poly.map(p => p[1])) - 3, Math.max(...poly.map(p => p[0])) + 3, Math.max(...poly.map(p => p[1])) + 3], inside: (x, y) => pip(x, y, poly) && !pip(x, y, poly.map(p => [cen[0] + (p[0] - cen[0]) * k, cen[1] + (p[1] - cen[1]) * k])), flow: rad(cen[0], cen[1]), len, w: [.28, .5], cols, op: [.6, .95], curl: .5, jit: .4 });
  const svg = `<defs>@@D:${g.p}@@</defs>
  <ellipse cx="64" cy="124" rx="40" ry="4" fill="#010510" opacity=".5" filter="${b2}"/>
  <g filter="${rough}"><path d="${dpath(ruffP)}" fill="${whG}"/></g>
  ${S(ruffP, [[WH[0], 1.4], [WH[1], 1], [WH[2], .8], [WH[3], .4], [SV[2], .3]], 1700, 1, { flow: (x, y) => Math.PI / 2 + (x - 64) * .02, len: [5, 11] })}
  <path d="M30 100Q64 118 98 100L98 112Q64 124 30 112Z" fill="#6a7a90" opacity=".25" filter="${b3}"/>
  <g filter="${rough}"><path d="${dpath(headP)}" fill="${orG}"/></g>
  <path d="${dpath(headP)}" fill="none"/>
  ${S(headP, [[OR[0], 1], [OR[1], 1.6], [OR[2], 2], [OR[3], 1.4], [OR[4], .6]], 3400, 2, { not: (x, y) => inMuz(x, y) || inCheek(x, y) && y > 84 })}
  ${S(headP, [[SV[0], 1.3], [SV[1], 1], [SV[2], .5]], 1100, 3, { not: (x, y) => inMuz(x, y) || y > 84, op: [.3, .75], len: [3, 6] })}
  <g filter="${rough}"><path d="${dpath(cheekP)}" fill="${whG}"/><path d="${dpath(cheekRP)}" fill="${whG}"/><path d="${dpath(muzP)}" fill="${whG}"/></g>
  ${S(cheekP, [[WH[0], 1.4], [WH[1], 1], [WH[2], .8], [WH[3], .4]], 1100, 4, { len: [4, 9] })}${S(cheekRP, [[WH[0], 1.4], [WH[1], 1], [WH[2], .8], [WH[3], .4]], 1100, 5, { len: [4, 9] })}
  ${S(muzP, [[WH[0], 1.4], [WH[1], 1], [WH[2], .7]], 700, 6, { flow: () => Math.PI / 2, len: [3, 6] })}
  <path d="M46 74Q48 84 52 94M82 74Q80 84 76 94" stroke="#16141a" stroke-width="1.4" fill="none" opacity=".7" filter="${b1}"/>
  <ellipse cx="64" cy="52" rx="14" ry="8" fill="#ffdca0" opacity=".25" filter="${b2}"/>
  <ellipse cx="46" cy="66" rx="9" ry="4.6" fill="#0a0a0e" opacity=".6" filter="${b1}" transform="rotate(-16 46 66)"/><ellipse cx="82" cy="66" rx="9" ry="4.6" fill="#0a0a0e" opacity=".6" filter="${b1}" transform="rotate(16 82 66)"/>
  <path d="M36 62Q30 58 26 60M92 62Q98 58 102 60" stroke="#0a0a0e" stroke-width="1.8" fill="none" opacity=".8"/>
  <ellipse cx="38" cy="52" rx="6" ry="3" fill="#fff" opacity=".28" filter="${b1}" transform="rotate(-18 38 52)"/><ellipse cx="90" cy="52" rx="6" ry="3" fill="#fff" opacity=".28" filter="${b1}" transform="rotate(18 90 52)"/>
  ${edge(headP, [64, 76], 600, 7, [[OR[2], 1], [OR[3], 1], [WH[1], 1.2], [SV[0], .8]], .9, [4, 9])}
  <path d="M96 48Q108 60 108 76L100 94" stroke="#b9ffe6" stroke-width="2.2" fill="none" opacity=".35" filter="${b1}"/>
  <path d="M56 96Q64 90 72 96Q72 104 64 108Q56 104 56 96Z" fill="#0a0a0e" opacity="0"/>
  <path d="M64 108V112Q58 116 52 112M64 112Q70 116 76 112" stroke="#17151a" stroke-width="1.4" fill="none" opacity=".85"/>
  <path d="M30 80Q16 76 8 80M30 85Q16 86 8 92M98 80Q112 76 120 80M98 85Q112 86 120 92" stroke="#fff" stroke-width=".7" fill="none" opacity=".85"/>`;
  return { x: 0, y: 0, w: 128, h: 130, s: 4, svg, q: .8 };
};

exports.ear = (side) => { // side -1 left, +1 right
  const g = new G('xe' + (side < 0 ? 'L' : 'R')); const b1 = g.blur(.8); const rough = g.rough(.5, 1.4, 31);
  const L = [[30, 66], [26, 36], [22, 6], [40, 20], [56, 44], [58, 62]];
  const Ii = [[34, 60], [31, 38], [29, 18], [40, 28], [50, 46], [52, 58]];
  const o = side < 0 ? L : mir(L), inn = side < 0 ? Ii : mir(Ii);
  const op = dense(o, 6), ip = dense(inn, 6);
  const back = g.lin(0, 6, 0, 66, [[0, '#08080c'], [.6, '#16161c'], [1, '#2a2a30']]);
  const svg = `<defs>@@D:${g.p}@@</defs><g filter="${rough}"><path d="${dpath(op)}" fill="${back}"/></g>
   ${strands({ n: 600, seed: 41 + side, box: [10, 4, 118, 68], inside: (x, y) => pip(x, y, op) && !pip(x, y, ip), flow: (x, y) => -Math.PI / 2 + (x - (side < 0 ? 38 : 90)) * .02, len: [3, 7], w: [.25, .45], cols: [[BK[0], 1], [BK[1], 1.5], [BK[2], 1], ['#4a4a55', .4]], op: [.6, .95], curl: .4 })}
   <path d="${dpath(ip)}" fill="${g.lin(0, 18, 0, 60, [[0, '#f4ecdc'], [1, '#b8a68a']])}"/>
   ${strands({ n: 700, seed: 43 + side, box: [10, 14, 118, 62], inside: (x, y) => pip(x, y, ip), flow: (x, y) => -Math.PI / 2 + (x - (side < 0 ? 40 : 88)) * .05, len: [4, 9], w: [.25, .42], cols: [['#ffffff', 1.4], ['#f5efe3', 1], ['#d8cdb8', .7]], op: [.5, .95], curl: .5 })}
   <path d="${dpath(ip)}" fill="none" stroke="#2a1a10" stroke-width="1.2" opacity=".35" filter="${b1}"/>
   <path d="${side < 0 ? 'M24 14Q28 36 32 58' : 'M104 14Q100 36 96 58'}" stroke="${side > 0 ? '#b9ffe6' : '#9aa6bc'}" stroke-width="1.4" fill="none" opacity=".5" filter="${b1}"/>`;
  return { x: 0, y: 0, w: 128, h: 70, s: 4, svg, q: .82 };
};

exports.tail = () => {
  const g = new G('xt'); const b1 = g.blur(.8), b2 = g.blur(2.2); const rough = g.rough(.5, 2.4, 51);
  const cl = [[50, 122], [76, 125], [100, 114], [113, 90], [112, 58]];
  const L = [], R = [];
  for (let i = 0; i <= 26; i++) { const t = i / 26, n = cl.length - 1, k = Math.min(n - 1, Math.floor(t * n)), u = t * n - k; const a = cl[k], b = cl[k + 1], c = cl[Math.max(0, k - 1)], d = cl[Math.min(n, k + 2)]; const uu = u * u, u3 = uu * u; const pt = [0, 1].map(j => .5 * ((2 * a[j]) + (-c[j] + b[j]) * u + (2 * c[j] - 5 * a[j] + 4 * b[j] - d[j]) * uu + (-c[j] + 3 * a[j] - 3 * b[j] + d[j]) * u3)); const t2 = [0, 1].map(j => b[j] - a[j]); const l = Math.hypot(t2[0], t2[1]); const w = (6 + 15 * Math.sin(Math.min(1, t * 1.04) * Math.PI * .88) + 2) / 2; L.push([pt[0] - t2[1] / l * w, pt[1] + t2[0] / l * w]); R.push([pt[0] + t2[1] / l * w, pt[1] - t2[0] / l * w]); }
  const poly = dense([...L, ...R.reverse()], 2);
  const cen = (x, y) => { let best = 1e9, bi = 0; for (let i = 0; i < cl.length; i++) { const d = Math.hypot(cl[i][0] - x, cl[i][1] - y); if (d < best) { best = d; bi = i; } } const a = cl[Math.max(0, bi - 1)], b = cl[Math.min(cl.length - 1, bi + 1)]; return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  const tipW = (x, y) => y < 78;
  const svg = `<defs>@@D:${g.p}@@</defs><g filter="${rough}"><path d="${dpath(poly)}" fill="${g.lin(0, 50, 0, 130, [[0, '#ee9a44'], [1, '#8a3a10']])}"/></g>
   ${strands({ n: 1600, seed: 61, box: [30, 40, 128, 132], inside: (x, y) => pip(x, y, poly) && !tipW(x, y), flow: cen, len: [4, 10], w: [.3, .5], cols: [[OR[0], 1], [OR[1], 1.4], [OR[2], 2], [OR[3], 1.4], [SV[0], .7], [BK[1], .5]], op: [.5, .95], curl: .6, jit: .4 })}
   ${strands({ n: 900, seed: 62, box: [30, 40, 128, 132], inside: (x, y) => pip(x, y, poly) && tipW(x, y), flow: cen, len: [4, 10], w: [.3, .5], cols: [[WH[0], 1.5], [WH[1], 1], [WH[2], .7]], op: [.6, 1], curl: .6, jit: .4 })}
   
   <path d="M121 100Q124 80 120 60" stroke="#b9ffe6" stroke-width="2" fill="none" opacity=".4" filter="${b1}"/>`;
  return { x: 30, y: 40, w: 98, h: 92, s: 4, svg, q: .82 };
};

// vector eyes: amber with vertical slit pupil; lids for blink (win motion). Returns markup using Sym S
exports.eyes = (S) => [[46, 66, -1], [82, 66, 1]].map(([x, y, sd], i) => {
  const o = sd, ox = x + o * 9.4, ix = x - o * 9.4;
  const shape = `M${ox} ${y - 2}Q${x + o * 1} ${y - 8} ${ix} ${y + 1}Q${x - o * 1} ${y + 4.6} ${ox} ${y - 2}Z`;
  const cl = S.clip(`<path d="${shape}"/>`);
  const iris = S.rad(x, y - .6, 6.2, [[0, '#ffe58a'], [.5, '#f0a828'], [1, '#8a4a08']]);
  return `<path d="${shape}" fill="#05060a"/><g clip-path="${cl}"><circle cx="${x}" cy="${y - .8}" r="6.6" fill="${iris}"/><ellipse cx="${x}" cy="${y - .8}" rx="1.5" ry="5.4" fill="#05060a"/><circle cx="${x - 1.8}" cy="${y - 2.8}" r="1.1" fill="#fff"/><circle cx="${x + 1.8}" cy="${y + .8}" r=".5" fill="#fff" opacity=".7"/>
   <path d="M${ox} ${y - 2}Q${x} ${y - 7} ${ix} ${y - .4}L${ix} ${y - 3.5}Q${x} ${y - 8.5} ${ox} ${y - 3.6}Z" fill="#05060a" opacity=".55"/></g>
   <path d="M${ox} ${y - 1}Q${x + o * 1} ${y - 6.4} ${ix} ${y + .8}" fill="none" stroke="#05060a" stroke-width="1.3"/>
   <path class="a-lid${i}" d="M${ox + o * 1.5} ${y - 2}Q${x} ${y - 9} ${ix - o * 1.5} ${y - .5}L${ix - o * 1.5} ${y + 3}Q${x} ${y + 5} ${ox + o * 1.5} ${y + 1}Z" fill="${S.lin(0, y - 8, 0, y + 4, [[0, '#a85a22'], [1, '#c8702c']])}" opacity="0"/>`;
}).join('');
exports.nose = (S) => `<path d="M56 96Q64 90.6 72 96Q72 104 64 107.6Q56 104 56 96Z" fill="${S.rad(60, 94, 14, [[0, '#4a5262'], [.45, '#14181f'], [1, '#05060a']])}"/><ellipse cx="60.4" cy="94.4" rx="3.2" ry="1.4" fill="#fff" opacity=".7"/><ellipse cx="61" cy="103" rx="1" ry=".6" fill="#000" opacity=".8"/><ellipse cx="67" cy="103" rx="1" ry=".6" fill="#000" opacity=".8"/>`;
