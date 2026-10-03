// Aino (guide), v3 illustration. Design space: 480x410 frame, centre x=166, feet y~354. Parts are baked to WebP by bake.cjs.
const H = require('./h.cjs'); const { furLit, sp, paint, furF, part, defs, samp, mir, mix, ramp, R, f } = H;
const SC = 1.7;
const FUR = [[0, '#3f4268'], [.25, '#7e84a8'], [.5, '#cfcbd0'], [.78, '#f7efe2'], [1, '#ffffff']];
const lit = (x, y, cx, cy, rx, ry, base = .55, k = .42) => { const dx = (x - cx) / rx, dy = (y - cy) / ry; return Math.max(0, Math.min(1, base - (dx * .75 + dy * .65) * k)); };
const furCol = (cx, cy, rx, ry, pal = FUR, base = .6, k = .5) => (x, y, r) => ramp(pal, lit(x, y, cx, cy, rx, ry, base, k) + (r - .5) * .2);
const stitched = (d, c = '#fff', o = .6) => `<path d="${d}" fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width=".8" stroke-dasharray="2.2 2.2"/>`;
const diamonds = (pts, n, w, fill, stroke) => samp(pts, n).map(([x, y, a]) => `<path transform="translate(${f(x)} ${f(y)}) rotate(${f(a * 180 / Math.PI)})" d="M0 ${-w}L${w * .8} 0L0 ${w}L${-w * .8} 0Z" fill="${fill}" ${stroke ? `stroke="${stroke}" stroke-width=".5"` : ''}/>`).join('');
const band = (top, bot, n = 30) => { const a = samp(top, n), b = samp(bot, n).reverse(); return 'M' + a.concat(b).map(p => f(p[0]) + ' ' + f(p[1])).join('L') + 'Z'; };
const off = (pts, dx, dy) => pts.map(p => [p[0] + dx, p[1] + dy, p[2]]);
const P = {};
const dirOf = (deg) => [-Math.sin(deg * Math.PI / 180), Math.cos(deg * Math.PI / 180)];
// pose (design space)
const POSE = (() => {
  const L = { S: [124, 133] }, Rr = { S: [208, 133] };
  L.tu = 32; L.U = 58; { const d = dirOf(L.tu); L.E = [L.S[0] + d[0] * L.U, L.S[1] + d[1] * L.U]; } L.tf = 12; L.F = 42; { const d = dirOf(L.tf); L.W = [L.E[0] + d[0] * L.F, L.E[1] + d[1] * L.F]; }
  Rr.tu = -38; Rr.U = 58; { const d = dirOf(Rr.tu); Rr.E = [Rr.S[0] + d[0] * Rr.U, Rr.S[1] + d[1] * Rr.U]; } Rr.tf = 64; Rr.F = 36; { const d = dirOf(Rr.tf); Rr.W = [Rr.E[0] + d[0] * Rr.F, Rr.E[1] + d[1] * Rr.F]; }
  return { L, R: Rr };
})();
Object.defineProperty(P, "POSE", { value: POSE, enumerable: false });

// ===================== BODY =====================
(function () {
  const D = defs(); let s = '';
  const bbox = [70, 98, 190, 276];
  const clothG = D.lg(100, 120, 240, 270, [[0, '#6a96e6'], [.22, '#3f68c0'], [.55, '#26458f'], [1, '#101f4e']]);
  s += `<ellipse cx="166" cy="356" rx="84" ry="8" fill="#02060f" opacity=".6" filter="url(#b4)"/>`;
  // legs
  const tro = D.lg(120, 250, 190, 330, [[0, '#3b5e78'], [.5, '#223c52'], [1, '#12202f']]);
  const legL = sp([[126, 246], [160, 246], [159, 290], [157, 318], [127, 318], [128, 290]]), legR = sp([[176, 246], [208, 246], [206, 288], [204, 316], [178, 316], [179, 290]]);
  s += paint(legL, tro, [{ d: 'M148 246L160 246L158 318L144 318Z', fill: '#05101c', op: .5, blur: 'b2' }, { d: 'M130 262Q128 290 131 316', fill: 'none', stroke: '#8fb8d0', sw: 2, op: .35, blur: 'b1' }], { stroke: '#0a1624', sw: .8 });
  s += paint(legR, tro, [{ d: 'M194 246L208 246L206 316L190 316Z', fill: '#05101c', op: .55, blur: 'b2' }, { d: 'M205 262Q206 290 203 314', fill: 'none', stroke: '#7be8c8', sw: 1.6, op: .5, blur: 'b1' }], { stroke: '#0a1624', sw: .8 });
  // boots: leather, toe out; right foot stepped back
  const leath = D.lg(100, 308, 160, 356, [[0, '#b88050'], [.35, '#7a4a2c'], [1, '#2a170c']]);
  const bootA = [[127, 310], [158, 310], [160, 336], [165, 352, 1], [140, 355], [104, 354], [89, 346, 1], [96, 338], [112, 333], [126, 329]];
  const bootB = [[176, 308], [206, 308], [206, 330], [209, 346, 1], [214, 351, 1], [232, 350, 1], [244, 343, 1], [236, 335], [220, 331], [204, 330]].map(p => p);
  const boot = (pts, cx, cuffY, lite) => {
    let g = paint(sp(pts), leath, [
      { el: `<ellipse cx="${lite}" cy="${pts[6][1] - 4}" rx="16" ry="4" fill="#ffd7a0" opacity=".55" filter="url(#b1)"/>` },
      { el: `<rect x="${cx + 6}" y="${cuffY}" width="20" height="50" fill="#12080a" opacity=".5" filter="url(#b2)"/>` }], { stroke: '#1a0c06', sw: .9 });
    const e = pts[pts.length - 1], yb = Math.max(...pts.map(p => p[1]));
    { const bp = pts.filter(p => p[1] > yb - 12 && p[1] > 340); g += `<path d="${sp(bp, false)}" fill="none" stroke="#2a170c" stroke-width="5"/><path d="${sp(bp, false)}" fill="none" stroke="#d9bb8c" stroke-width="3" transform="translate(0 -.8)"/>`; }
    g += `<path d="M${cx - 15} ${cuffY + 9}Q${cx} ${cuffY + 13} ${cx + 16} ${cuffY + 9}L${cx + 16} ${cuffY + 16}Q${cx} ${cuffY + 20} ${cx - 15} ${cuffY + 16}Z" fill="#c8302e" stroke="#4a0a12" stroke-width=".7"/><g fill="#fff3d0">${[0, 1, 2, 3, 4].map(i => `<path d="M${cx - 11 + i * 5.6} ${cuffY + 14.5}l1.8 -2l1.8 2l-1.8 2z"/>`).join('')}</g>`;
    g += `<path d="M${cx - 15} ${cuffY + 19}L${cx + 14} ${cuffY + 27}M${cx + 14} ${cuffY + 19}L${cx - 15} ${cuffY + 27}" stroke="#e8c070" stroke-width="1.5" fill="none"/>`;
    const fc = furCol(cx, cuffY + 2, 24, 10, FUR, .6, .5);
    g += furF({ box: [cx - 24, cuffY - 8, cx + 24, cuffY + 12], n: 90, seed: cx, inside: (x, y) => ((x - cx) / 21) ** 2 + ((y - cuffY - 1) / 8) ** 2 < 1, flow: (x, y) => Math.PI / 2 + (x - cx) * .035, L: [8, 12], w: [4.4, 6.4], bend: 3, col: fc, sw: .5 });
    return g;
  };
  s += boot(bootB, 191, 300, 222) + boot(bootA, 142, 303, 108);
  // parka (asymmetric, wind-swept right hem)
  const pk = [[146, 116], [122, 122], [110, 142], [112, 168], [122, 186], [114, 212], [100, 250, 1], [120, 258], [144, 262], [168, 258], [194, 256], [220, 250], [240, 242, 1], [230, 216], [220, 190], [226, 166], [224, 144], [212, 124], [188, 116], [166, 112]];
  const pkd = sp(pk), hem = [[100, 250], [120, 258], [144, 262], [168, 258], [194, 256], [220, 250], [240, 242]];
  const hemTop = off(hem, 0, -17);
  const lay = [
    { d: 'M104 140Q100 190 110 200Q106 232 92 262L120 272Q126 232 122 200Q126 160 130 130Z', fill: '#b8d4ff', op: .28, blur: 'b4' },
    { d: 'M222 150Q234 190 226 206Q236 236 250 254L206 272Q212 240 206 206Q212 180 206 140Z', fill: '#050c26', op: .55, blur: 'b4' },
    // fold wedges (hard shadows) + light edges
    { d: 'M128 198Q120 232 108 268L124 272Q132 236 136 200Z', fill: '#050c26', op: .38, blur: 'b1' },
    { d: 'M150 204Q150 240 142 276L156 276Q160 240 158 206Z', fill: '#050c26', op: .3, blur: 'b1' },
    { d: 'M178 206Q182 240 190 272L204 270Q198 238 190 204Z', fill: '#050c26', op: .38, blur: 'b1' },
    { d: 'M206 200Q214 232 232 258L246 252Q228 226 224 198Z', fill: '#050c26', op: .42, blur: 'b1' },
    { d: 'M118 200Q112 232 100 262', fill: 'none', stroke: '#bcd6ff', sw: 2.4, op: .34, blur: 'b1' },
    { d: 'M142 206Q140 238 134 272M176 208Q180 238 186 268', fill: 'none', stroke: '#bcd6ff', sw: 1.8, op: .24, blur: 'b1' },
    { el: `<ellipse cx="82" cy="250" rx="52" ry="46" fill="${D.rg(82, 250, 1, [[0, '#ffb454', .6], [1, '#ffb454', 0]], 52, 46)}"/>`, mode: 'screen' },
    { el: `<ellipse cx="236" cy="190" rx="14" ry="84" fill="${D.rg(236, 190, 1, [[0, '#7dffc4', .6], [1, '#7dffc4', 0]], 14, 84)}"/>`, mode: 'screen' },
    { el: `<rect x="80" y="100" width="180" height="190" filter="url(#cloth)" fill="#8fb4ff" opacity=".14"/>` },
    { d: 'M104 180Q166 200 240 180L240 204Q166 222 104 204Z', fill: '#050c26', op: .3, blur: 'b4' }
  ];
  s += paint(pkd, clothG, lay, { stroke: '#050c26', sw: 1 });
  s += `<clipPath id="pkc"><path d="${pkd}"/></clipPath><g clip-path="url(#pkc)">`;
  s += `<path d="${band(hemTop, hem)}" fill="${D.lg(0, 248, 0, 282, [[0, '#f0504a'], [.5, '#c62a30'], [1, '#6e0c1a']])}" stroke="#3a0610" stroke-width=".8"/>`;
  s += `<path d="${band(off(hem, 0, -17.8), off(hem, 0, -16.6))}" fill="#f2c25a"/><path d="${band(off(hem, 0, -3.3), off(hem, 0, -2.2))}" fill="#f2c25a"/>`;
  s += diamonds(off(hem, 0, -9.8), 22, 4.4, '#fff4d8', '#6a4a20') + diamonds(off(hem, 0, -9.8), 22, 1.8, '#2a64c8');
  s += `<path d="${band(off(hem, 0, -22), off(hem, 0, -19.6))}" fill="#f6efe0" opacity=".85"/>`;
  const yk = [[112, 148], [140, 154], [166, 158], [194, 154], [222, 148]];
  s += `<path d="${band(off(yk, 0, -8), off(yk, 0, 8))}" fill="${D.lg(0, 140, 0, 175, [[0, '#e04a44'], [.6, '#b6222c'], [1, '#6a0c1a']])}" stroke="#3a0610" stroke-width=".8"/>`;
  s += `<path d="${band(off(yk, 0, -8), off(yk, 0, -6.4))}" fill="#f2c25a"/><path d="${band(off(yk, 0, 6.4), off(yk, 0, 8))}" fill="#f2c25a"/>`;
  s += samp(yk, 26).map(([x, y, a]) => `<path transform="translate(${f(x)} ${f(y)}) rotate(${f(a * 180 / Math.PI)})" d="M-3.6 3.4L0 -3.6L3.6 3.4" fill="none" stroke="#fff4d8" stroke-width="1.5"/>`).join('');
  s += `<path d="M159 118L173 118L173 270L159 270Z" fill="${D.lg(159, 0, 173, 0, [[0, '#b6222c'], [.4, '#e04a44'], [1, '#6a0c1a']])}" stroke="#3a0610" stroke-width=".8"/><path d="M160.6 118V270M171.4 118V270" stroke="#f2c25a" stroke-width="1"/>`;
  s += diamonds([[166, 122], [166, 266]], 22, 4, '#fff4d8', '#6a4a20') + diamonds([[166, 122], [166, 266]], 22, 1.5, '#c8302e');
  s += `</g>`;
  // belt (waist y~190)
  const bt = [[114, 176], [140, 184], [166, 187], [192, 184], [218, 176]];
  s += paint(band(bt, off(bt, 0, 11)), D.lg(0, 186, 0, 212, [[0, '#a8744a'], [.5, '#5a3a22'], [1, '#2a170c']]), [{ d: 'M100 186L240 186L240 191L100 191Z', fill: '#ffd9a0', op: .35, blur: 'b1' }], { stroke: '#1a0c06', sw: .9 });
  s += stitched('M106 190Q136 199 166 202Q198 199 228 190', '#f2d6a0', .7);
  s += `<g transform="translate(0 -10)">`;
  // knife sheath (right hip, behind arm)
  s += `<path d="M228 192L240 196L244 238Q236 246 228 238Z" fill="${D.lg(226, 190, 246, 246, [[0, '#6a4128'], [1, '#22120a']])}" stroke="#12080a" stroke-width=".9"/><path d="M230 198L233 236" stroke="#d6a870" stroke-opacity=".5" stroke-width="1.4"/><path d="M229 222h14" stroke="#e0b060" stroke-width="2"/>`;
  s += `<path d="M228 194Q224 182 230 174Q232 182 234 188Q239 178 245 176Q241 186 240 195Z" fill="${D.lg(226, 174, 246, 196, [[0, '#fff0d4'], [1, '#b89868']])}" stroke="#5a4428" stroke-width=".8"/>`;
  // pouch (left hip)
  const pouch = 'M116 198Q113 220 119 231Q131 236 143 231Q147 219 143 199Z';
  s += paint(pouch, D.lg(114, 198, 148, 234, [[0, '#9a6a40'], [.5, '#6a4128'], [1, '#2e190c']]), [{ d: 'M116 198Q130 211 144 199L144 207Q130 219 116 207Z', fill: '#000', op: .28, blur: 'b1' }, { d: 'M117 212Q119 228 125 232', fill: 'none', stroke: '#ffd9a0', sw: 1.4, op: .5, blur: 'b1' }], { stroke: '#1a0c06', sw: .9 });
  s += stitched('M120 206Q130 221 141 206', '#f2d6a0', .6) + `<circle cx="130" cy="217" r="3" fill="${D.rg(129, 216, 3.4, [[0, '#fff2b0'], [.6, '#e0a83e'], [1, '#6a4410']])}" stroke="#3a2408" stroke-width=".6"/>`;
  s += `<rect x="156" y="187" width="20" height="14" rx="3" fill="${D.lg(156, 187, 176, 201, [[0, '#fff2b0'], [.45, '#e0a83e'], [1, '#6a4410']])}" stroke="#3a2408" stroke-width=".9"/><rect x="160" y="191" width="12" height="6.4" rx="1.6" fill="#3a2408" opacity=".8"/><path d="M158 189H174" stroke="#fff" stroke-opacity=".8" stroke-width="1"/>`;
  s += `<path d="M148 198Q146 211 150 221" fill="none" stroke="#c8302e" stroke-width="2.4"/><path d="M150 221l-3 9M150 221v10M150 221l3 9" stroke="#e04a44" stroke-width="1.6"/>`;
  s += `</g>`;
  // fur mantle
  const mc = furCol(166, 116, 50, 20, FUR, .62, .5);
  const mIn = (x, y) => { const dx = (x - 166) / 54, dy = (y - 124) / 17; return dx * dx + dy * dy < 1; };
  s += furF({ box: [112, 104, 222, 142], n: 150, seed: 11, inside: mIn, flow: (x, y) => Math.atan2((y - 100) * 1.2, (x - 166) * 1.5), L: [14, 21], w: [4.6, 6.6], bend: 5, col: (x, y, r) => mix(mc(x, y, r), '#4a4d70', .3), sw: .6 });
  s += furF({ box: [112, 104, 222, 142], n: 170, seed: 12, inside: mIn, flow: (x, y) => Math.atan2((y - 100) * 1.2, (x - 166) * 1.5), L: [10, 16], w: [4, 6], bend: 4, col: mc, sw: .5 });
  P.body = { bbox, scale: SC, q: .86, svg: part(bbox, SC, s, D.get()) };
})();

// ===================== ARMS: drawn hanging from the joint, rotated to the idle pose =====================
function arm(side) {
  const A = POSE[side], L = side === 'L'; const k = L ? 'L' : 'R';
  const [sx, sy] = A.S, [ex, ey] = A.E, [wx, wy] = A.W;
  // ---- upper arm
  { const D = defs();
    const g = L ? D.lg(-16, 0, 16, 60, [[0, '#6f9ae6'], [.4, '#3a62b8'], [1, '#14275c']]) : D.lg(-16, 0, 16, 60, [[0, '#5580d4'], [.45, '#27479a'], [1, '#0e1c4a']]);
    const sl = sp([[-14, -4], [-16.5, 10], [-16, 30], [-13, 50], [-12, 58, 1], [12, 58, 1], [13, 50], [16, 30], [16.5, 10], [14, -4], [0, -10]]);
    let t = paint(sl, g, [
      { d: 'M-12 0Q-14 30 -10 56L-5 56Q-9 30 -7 0Z', fill: '#c8dcff', op: .42, blur: 'b2' },
      { d: 'M7 0Q12 30 11 58L18 58L18 0Z', fill: '#050c26', op: .5, blur: 'b2' },
      { d: 'M-14 46Q0 55 14 46L14 60L-14 60Z', fill: '#050c26', op: .3, blur: 'b2' },
      { d: 'M-11 48Q0 54 11 48M-10 53Q0 58 10 53', fill: 'none', stroke: '#050c26', sw: 1.2, op: .5, blur: 'b1' },
      { d: 'M-12 -2Q0 4 12 -2', fill: 'none', stroke: '#050c26', sw: 1.4, op: .35, blur: 'b1' },
      ...(L ? [] : [{ el: `<rect x="8" y="-6" width="5" height="66" fill="#7dffc4" opacity=".6" filter="url(#b2)"/>`, mode: 'screen' }]),
      { el: `<rect x="-20" y="0" width="40" height="64" filter="url(#cloth)" fill="#8fb4ff" opacity=".14"/>` }], { stroke: '#050c26', sw: .9 });
    t += `<g transform="translate(0 25)"><rect x="-16.5" y="-4.5" width="33" height="9" fill="#c62a30" stroke="#3a0610" stroke-width=".6"/><rect x="-16.5" y="-4.5" width="33" height="1.4" fill="#f2c25a"/><rect x="-16.5" y="3.1" width="33" height="1.4" fill="#f2c25a"/>${[-10, -3.5, 3, 9.5].map(x => `<path d="M${x - 2.4} 0l2.4 -2.4l2.4 2.4l-2.4 2.4z" fill="#fff4d8"/>`).join('')}</g>`;
    const bb = [Math.min(sx, ex) - 26, sy - 22, Math.abs(ex - sx) + 52, Math.abs(ey - sy) + 46];
    P['arm' + k] = { bbox: bb, scale: SC, q: .86, svg: part(bb, SC, `<g transform="translate(${sx} ${sy}) rotate(${-A.tu * -1})">${t}</g>`.replace(`rotate(${A.tu})`, `rotate(${A.tu})`), D.get()) };
  }
  // ---- forearm + mitten
  { const D = defs(); let t = '';
    const g = L ? D.lg(-12, 0, 12, 44, [[0, '#6890e0'], [.45, '#3560b4'], [1, '#12245a']]) : D.lg(-12, 0, 12, 44, [[0, '#4d78cc'], [.5, '#24449a'], [1, '#0c1a46']]);
    t += `<ellipse cx="0" cy="0" rx="12.4" ry="12.4" fill="${g}" stroke="#050c26" stroke-width=".9"/>`;
    const fo = sp([[-12.4, -2], [-12.8, 12], [-11, 28], [-9.6, 40, 1], [9.6, 40, 1], [11, 28], [12.8, 12], [12.4, -2]]);
    t += paint(fo, g, [
      { d: 'M-10 0Q-11 22 -8 38L-4 38Q-7 22 -6 0Z', fill: '#c8dcff', op: .4, blur: 'b2' },
      { d: 'M5 0Q10 22 9 40L16 40L16 0Z', fill: '#050c26', op: .5, blur: 'b2' },
      { d: 'M-11 4Q0 11 11 4', fill: 'none', stroke: '#050c26', sw: 1.4, op: .5, blur: 'b1' },
      ...(L ? [] : [{ el: `<rect x="6" y="0" width="4.5" height="42" fill="#7dffc4" opacity=".6" filter="url(#b2)"/>`, mode: 'screen' }])], { stroke: '#050c26', sw: .9 });
    t += `<g transform="translate(0 33)"><rect x="-11" y="-3.6" width="22" height="7.6" rx="1.6" fill="#c62a30" stroke="#3a0610" stroke-width=".6"/><rect x="-11" y="-3.6" width="22" height="1.2" fill="#f2c25a"/>${[-6, 0, 6].map(x => `<path d="M${x - 2} .6l2 -2l2 2l-2 2z" fill="#fff4d8"/>`).join('')}</g>`;
    const cc = furCol(0, 42, 14, 8, FUR, .6, .5);
    t += furF({ box: [-16, 34, 16, 50], n: 64, seed: L ? 31 : 32, inside: (x, y) => (x / 16) ** 2 + ((y - 41) / 7) ** 2 < 1, flow: (x, y) => Math.PI / 2 + x * .05, L: [7, 11], w: [3.6, 5.2], bend: 3, col: cc, sw: .5 });
    // mitten
    const m = sp([[-11, 38], [-13.5, 52], [-9, 66], [2, 70], [11, 62], [13.5, 48], [10, 38]]);
    t += paint(m, D.lg(-14, 40, 14, 70, [[0, '#b27c4e'], [.5, '#6a4128'], [1, '#2a170c']]), [
      { d: 'M-10 44Q-12 58 -6 66', fill: 'none', stroke: '#ffd9a0', sw: 2.4, op: .5, blur: 'b1' },
      { d: 'M5 40Q16 56 6 72L16 72L16 40Z', fill: '#12080a', op: .45, blur: 'b2' }], { stroke: '#1a0c06', sw: .9 });
    t += stitched('M-6 44Q-9 56 -3 65', '#f2d6a0', .6);
    t += `<path d="${sp([[8, 46], [17, 50], [19, 57], [12, 58]])}" fill="#8a5a38" stroke="#1a0c06" stroke-width=".9"/>`;
    t += `<path d="M-12 50Q0 54 13 50" fill="none" stroke="#c62a30" stroke-width="2.4"/>`;
    const pts = [[ex, ey], [wx, wy]]; const dd = dirOf(A.tf); const tip = [ex + dd[0] * 74, ey + dd[1] * 74];
    const bb = [Math.min(ex, tip[0]) - 30, Math.min(ey, tip[1]) - 18, Math.abs(tip[0] - ex) + 60, Math.abs(tip[1] - ey) + 40];
    P['fore' + k] = { bbox: bb, scale: SC, q: .86, svg: part(bb, SC, `<g transform="translate(${ex} ${ey}) rotate(${A.tf})">${t}</g>`, D.get()) };
  }
}
arm('L'); arm('R');

// ===================== HEAD =====================
const HB = [106, 16, 124, 122];
const EC = [168, 88], ERX = 25, ERY = 31;                       // hood opening ellipse
const ang = (x, y) => Math.atan2((y - EC[1]) / ERY, (x - EC[0]) / ERX);
const nb = (x, y) => { const t = ang(x, y); return t > .85 && t < 2.3; };   // bottom arc without ruff
const rad = (x, y) => Math.hypot((x - EC[0]) / ERX, (y - EC[1]) / ERY);
(function () {
  const D = defs(); let s = '';
  const cl = D.lg(110, 20, 230, 130, [[0, '#6a96e6'], [.3, '#3f68c0'], [.65, '#26458f'], [1, '#101f4e']]);
  const hood = sp([[168, 20], [196, 28], [214, 54], [219, 90], [213, 108], [198, 118], [168, 122], [140, 118], [125, 112], [117, 90], [122, 54], [140, 28]]);
  s += paint(hood, cl, [
    { d: 'M196 30Q222 60 214 120L180 134Z', fill: '#050c26', op: .5, blur: 'b4' },
    { d: 'M130 40Q116 80 126 116L140 118Q130 80 144 44Z', fill: '#c8dcff', op: .3, blur: 'b2' },
    { d: 'M168 22Q156 44 150 70', fill: 'none', stroke: '#050c26', sw: 2.4, op: .5, blur: 'b1' },
    { d: 'M170 22Q159 44 153 70', fill: 'none', stroke: '#bcd6ff', sw: 1.2, op: .4, blur: 'b1' },
    { el: `<path d="M214 56Q222 90 212 120" fill="none" stroke="#7dffc4" stroke-width="3.4" opacity=".7" filter="url(#b1)"/>`, mode: 'screen' },
    { el: `<rect x="106" y="16" width="124" height="122" filter="url(#cloth)" fill="#8fb4ff" opacity=".14"/>` }], { stroke: '#050c26', sw: 1 });
  // trim band along the front edge (under the ruff)
  s += `<ellipse cx="${EC[0]}" cy="${EC[1]}" rx="${ERX + 4.5}" ry="${ERY + 4.5}" fill="none" stroke="#c62a30" stroke-width="5"/><ellipse cx="${EC[0]}" cy="${EC[1]}" rx="${ERX + 4.5}" ry="${ERY + 4.5}" fill="none" stroke="#f2c25a" stroke-width="1" stroke-dasharray="4 3.2"/>`;
  // lining
  s += `<ellipse cx="${EC[0]}" cy="${EC[1]}" rx="${ERX + 1}" ry="${ERY + 1}" fill="${D.rg(160, 100, 1, [[0, '#4a2a46'], [.6, '#241430'], [1, '#0a0614']], 40, 48)}"/>`;
  // hair behind the face
  s += paint(sp([[168, 56], [188, 62], [194, 86], [190, 112], [168, 118], [146, 112], [142, 86], [148, 62]]), D.lg(0, 56, 0, 118, [[0, '#6a4228'], [.5, '#3a2014'], [1, '#150a06']]), [], {});
  P.hoodBack = { bbox: HB, scale: SC, q: .86, svg: part(HB, SC, s, D.get()) };
})();

(function () {
  const D = defs(); let s = ''; const FB = [140, 54, 58, 80];
  const skin = D.rg(160, 74, 1, [[0, '#ffe3cc'], [.45, '#f2bd96'], [1, '#c98462']], 46, 52);
  // neck
  const neck = sp([[159, 100], [178, 100], [180, 124], [157, 124]]);
  s += paint(neck, D.lg(0, 100, 0, 130, [[0, '#c98462'], [1, '#8a4a40']]), [{ d: 'M150 100Q168 120 188 100L188 116Q168 128 150 116Z', fill: '#3a1a28', op: .6, blur: 'b2' }], {});
  const face = sp([[168, 61], [181, 65], [187, 77], [186, 91], [181, 101], [174, 108], [168, 110.5], [161, 108], [155, 101], [150, 91], [149, 77], [155, 65]]);
  const eyes = [[160, 83], [178, 83]];
  const L = [
    { d: 'M178 60L192 60L192 112L172 112Q184 96 184 78Z', fill: '#4a3070', op: .42, blur: 'b4' },
    { el: `<path d="M186 74Q188 92 176 106" fill="none" stroke="#7dffc4" stroke-width="2.6" opacity=".7" filter="url(#b1)"/>`, mode: 'screen' },
    { d: 'M146 56L192 56L192 70Q168 74 146 70Z', fill: '#4a1a30', op: .5, blur: 'b4' },
    { el: `<ellipse cx="${EC[0]}" cy="${EC[1]}" rx="${ERX - 1.5}" ry="${ERY - 1.5}" fill="none" stroke="#3a1230" stroke-width="7" opacity=".55" filter="url(#b4)"/>` },
    ...eyes.map(([x, y]) => ({ el: `<ellipse cx="${x}" cy="${y}" rx="8.6" ry="5.6" fill="#a05a58" opacity=".28" filter="url(#b2)"/>` })),
    { el: `<ellipse cx="156" cy="97" rx="6.4" ry="4" fill="#ff7a86" opacity=".28" filter="url(#b2)"/><ellipse cx="180" cy="97" rx="6.4" ry="4" fill="#ff7a86" opacity=".26" filter="url(#b2)"/>` },
    { d: 'M166 78Q167 88 170 94', fill: 'none', stroke: '#b4664e', sw: 2.2, op: .45, blur: 'b1' },
    { el: `<ellipse cx="169.4" cy="92.4" rx="2.6" ry="2" fill="#fff" opacity=".7" filter="url(#b1)"/><ellipse cx="170.6" cy="85" rx="1.1" ry="5" fill="#fff" opacity=".28" filter="url(#b1)"/>` },
    { el: `<ellipse cx="166.6" cy="95.6" rx="1.2" ry=".7" fill="#6a2a2e" opacity=".4"/><ellipse cx="173" cy="95.6" rx="1.2" ry=".7" fill="#6a2a2e" opacity=".4"/><ellipse cx="170" cy="97.4" rx="5" ry="1.6" fill="#a85a48" opacity=".32" filter="url(#b1)"/>` },
    { el: `<ellipse cx="169" cy="105.4" rx="5" ry="2" fill="#b4664e" opacity=".3" filter="url(#b1)"/><ellipse cx="166" cy="108" rx="3" ry="1.4" fill="#fff" opacity=".35" filter="url(#b1)"/>` },
    { el: [[163, 90], [168, 89], [172, 90], [158, 92], [182, 92], [175, 92], [160, 95], [178, 94]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".7" fill="#a85a40" opacity=".5"/>`).join('') }
  ];
  s += paint(face, skin, L, { stroke: '#7a3a3a', sw: .6 });
  // lid creases + lash shadow
  s += eyes.map(([x, y], i) => `<path d="M${x - 8.4} ${y - 3}Q${x} ${y - 9.6} ${x + 8.6} ${y - 3}" fill="none" stroke="#a05a4e" stroke-width=".9" stroke-opacity=".7"/>`).join('');
  // bangs + side locks
  const hairG = D.lg(0, 56, 0, 100, [[0, '#8a5a38'], [.4, '#4b2a1c'], [1, '#1c0e08']]);
  s += paint(sp([[147, 84], [146, 68], [152, 58], [166, 54], [182, 57], [190, 66], [190, 78], [184, 70], [176, 66], [166, 66], [158, 72], [152, 82]]), hairG, [
    { d: 'M158 58Q170 54 184 62M154 64Q168 58 186 68', fill: 'none', stroke: '#e0b27a', sw: 1.1, op: .6, blur: 'b1' }, { d: 'M168 56Q158 66 152 80', fill: 'none', stroke: '#150a06', sw: 1.2, op: .6 }], { stroke: '#150a06', sw: .6 });
  s += paint(sp([[149, 72], [152, 84], [152, 100], [149, 110], [146, 96], [146, 80]]), hairG, [{ d: 'M150 78Q151 96 148 108', fill: 'none', stroke: '#e0b27a', sw: 1, op: .5, blur: 'b1' }], { stroke: '#150a06', sw: .5 });
  s += paint(sp([[188, 74], [190, 86], [189, 102], [186, 108], [185, 94], [186, 80]]), hairG, [], { stroke: '#150a06', sw: .5 });
  P.face = { bbox: FB, scale: SC * 1.15, q: .88, svg: part(FB, SC * 1.15, s, D.get(), { r: .8, c: '#2a0c16', o: .85 }) };
})();

(function () {
  const D = defs(); let s = '';
  const col = furCol(168, 70, 52, 56, FUR, .56, .52);
  const mk = (n, seed, r0, r1, L, w, mode, sil) => furF({ sil, box: [112, 20, 224, 140], n, seed, inside: (x, y) => { const r = rad(x, y); return r > r0 && r < r1 && !nb(x, y); },
    flow: (x, y) => { const t = Math.atan2((y - EC[1]) / ERY * 1.0, (x - EC[0]) / ERX * 1.0); const a = Math.atan2(Math.sin(t) * ERY, Math.cos(t) * ERX); return mode === 'in' ? a + Math.PI + .3 : a + .35 * Math.sign(Math.cos(t) || 1) * (Math.sin(t) < 0 ? 1 : -.4); },
    L, w, bend: 6, jit: .45, col: (x, y, r) => mode === 'in' ? col(x, y, r) : mix(col(x, y, r), '#3f4268', mode === 'back' ? .2 : .08), order: (x, y) => -rad(x, y), sw: .55, dark: '#2c2c4a' });
  const O = [[150, 21, 1.1, 1.5, [10, 15], [4.4, 6.6], 'back'], [200, 22, 1.0, 1.28, [8, 12], [4, 6], 'mid'], [120, 23, .98, 1.1, [5, 8], [3.4, 5], 'in']];
  for (const q of O) s += mk(...q);
  { const sil = O.map(q => mk(...q, true)).join('');
    s += `<mask id="hfm"><g fill="#fff">${sil}</g></mask><g mask="url(#hfm)"><ellipse cx="208" cy="112" rx="40" ry="46" fill="#1a1838" opacity=".28" filter="url(#b8)"/><ellipse cx="132" cy="38" rx="44" ry="30" fill="#fff6e8" opacity=".5" filter="url(#b8)"/><ellipse cx="150" cy="112" rx="22" ry="22" fill="#ffb454" opacity=".28" filter="url(#b8)" style="mix-blend-mode:screen"/></g>`; }
  // rim light on the aurora side, frost sparks
  s += `<path d="${sp([[198, 40], [216, 60], [222, 88], [216, 114]], false)}" fill="none" stroke="#7dffc4" stroke-width="2.6" opacity=".55" filter="url(#b1)" style="mix-blend-mode:screen"/>`;
  s += `<path d="${sp([[134, 46], [148, 30], [168, 24]], false)}" fill="none" stroke="#e8f4ff" stroke-width="2" opacity=".5" filter="url(#b1)"/>`;
  P.hoodFront = { bbox: HB, scale: SC, q: .86, svg: part(HB, SC, s, D.get(), { r: .9, c: '#161628', o: .8 }) };
})();

(function () {
  const D = defs(); const bb = [192, 90, 50, 142]; let s = '';
  const c = [[204, 104], [213, 126], [208, 152], [216, 180], [212, 206]]; const sm = samp(c, 9);
  const g = D.lg(0, 0, 1, 1, [[0, '#9a6a40'], [.5, '#4b2a1c'], [1, '#1c0e08']]);
  s += sm.map(([x, y, a], i) => { const w = 8.6 - i * .34, rot = (i % 2 ? 24 : -24) + a * 180 / Math.PI - 90; return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><ellipse cx="0" cy="0" rx="${f(w)}" ry="${f(w * 1.05)}" fill="${D.lg(-w, -w, w, w, [[0, '#b0804c'], [.45, '#5a361f'], [1, '#1c0e08']])}" stroke="#150a06" stroke-width=".7"/><path d="M${-w * .5} ${-w * .3}Q0 ${-w * .9} ${w * .5} ${-w * .3}" fill="none" stroke="#e0b27a" stroke-width="1" opacity=".7"/><path d="M${-w * .6} ${w * .3}Q0 ${w * .1} ${w * .6} ${w * .3}" fill="none" stroke="#150a06" stroke-width=".9" opacity=".5"/></g>`; }).join('');
  s += `<path d="M205 205h15l-2 8h-11z" fill="#c62a30" stroke="#3a0610" stroke-width=".7"/><circle cx="212.5" cy="212" r="2.2" fill="#f2c25a" stroke="#6a4410" stroke-width=".5"/><path d="M208 213l-3 12M212.5 214v14M217 213l3 12" stroke="#d83a3a" stroke-width="2.4"/><circle cx="205" cy="226" r="1.6" fill="#f2c25a"/><circle cx="212.5" cy="229" r="1.6" fill="#f2c25a"/><circle cx="220" cy="226" r="1.6" fill="#f2c25a"/>`;
  s += `<path d="M213 116Q216 140 211 158" fill="none" stroke="#7dffc4" stroke-width="1.6" opacity=".5" filter="url(#b1)" style="mix-blend-mode:screen"/>`;
  P.braid = { bbox: bb, scale: SC, q: .86, svg: part(bb, SC, s, D.get()) };
})();

module.exports = P;
