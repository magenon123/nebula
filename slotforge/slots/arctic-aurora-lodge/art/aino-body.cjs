// Aino body parts: parka+boots, two arms (upper / forearm+mitten), braid, lantern. Baked bitmaps.
const { G, strands, pip, dpath, ellPts, cr, dense, rng, f } = require('./charlib.cjs');
const BLUE = { hi: '#6f9fe6', lit: '#4a7fd0', mid: '#2c5cae', sh: '#16397c', deep: '#0a1f4c' };
// limb outline from a centre line S->E (with optional mid control) and widths
function limb(S, E, w0, w1, bend = 0, n = 10) {
  const L = [], R = []; const dx = E[0] - S[0], dy = E[1] - S[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  for (let i = 0; i <= n; i++) { const t = i / n, c = Math.sin(t * Math.PI) * bend; const cx = S[0] + dx * t + nx * c, cy = S[1] + dy * t + ny * c; const w = (w0 + (w1 - w0) * t) / 2 * (1 + .07 * Math.sin(t * Math.PI)); L.push([cx + nx * w, cy + ny * w]); R.push([cx - nx * w, cy - ny * w]); }
  return { L, R, pts: L.concat(R.slice().reverse()) };
}
const clothFill = (g, c0, c1, x0, y0, x1, y1) => g.lin(x0, y0, x1, y1, [[0, c0], [1, c1]]);

// ---------------- parka + legs + boots
exports.body = () => {
  const g = new G('ap'); const b1 = g.blur(1), b2 = g.blur(2.2), b4 = g.blur(4), b6 = g.blur(7);
  const side = [[133, 104], [132, 125], [137, 150], [139, 172], [131, 205], [121, 240], [111, 272], [101, 306]];
  const rside = [[197, 104], [198, 125], [193, 150], [191, 172], [199, 205], [209, 240], [219, 272], [229, 306]];
  const parkaD = `M${side.map(p => p.join(' ')).join('L')}Q165 318 229 306L${rside.slice().reverse().map(p => p.join(' ')).join('L')}Q165 94 133 104Z`;
  const cloth = g.cloth(.8, .55, 3);
  const body = g.lin(106, 100, 224, 300, [[0, '#3a68b8'], [.3, '#264f9c'], [.7, '#183b7c'], [1, '#0d2559']]);
  const clipP = g.clip(parkaD);
  const fold = (d, w, c, op, bl = b1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${op}" filter="${bl}"/>`;
  const folds = [
    ['M141 178Q132 230 120 296', 6], ['M152 184Q148 240 142 304', 5], ['M178 184Q184 240 192 304', 5], ['M190 178Q200 230 214 296', 6], ['M164 190Q164 250 165 306', 4],
  ].map(([d, w]) => fold(d, w, '#06163a', .5, b2)).join('') + [
    ['M146 182Q139 236 130 298', 3], ['M158 188Q156 246 153 304', 2.4], ['M171 188Q174 246 178 304', 2.6], ['M184 182Q192 234 203 298', 3],
  ].map(([d, w]) => fold(d, w, '#8fb8f4', .34, b1)).join('');
  // belt wrinkles + bust shading
  const wr = `<path d="M137 176Q165 184 193 176" stroke="#06163a" stroke-width="5" fill="none" opacity=".55" filter="${b2}"/><path d="M134 188Q150 192 160 190M170 190Q182 192 196 188M138 196Q150 199 162 197M172 197Q184 199 198 195" stroke="#06163a" stroke-width="1.6" fill="none" opacity=".5" filter="${b1}"/>
   <path d="M140 186Q152 190 160 188M171 188Q184 191 194 186" stroke="#9cc4ff" stroke-width="1" fill="none" opacity=".32" filter="${b1}"/>`;
  const bust = `<ellipse cx="150" cy="140" rx="14" ry="13" fill="#9cc4ff" opacity=".16" filter="${b4}"/><ellipse cx="181" cy="140" rx="14" ry="13" fill="#9cc4ff" opacity=".26" filter="${b4}"/><ellipse cx="165" cy="154" rx="5" ry="10" fill="#06163a" opacity=".3" filter="${b4}"/>`;
  const lightL = g.lin(106, 0, 224, 0, [[0, '#04102e', .72], [.35, '#04102e', .22], [.66, '#9cc4ff', 0], [1, '#9cc4ff', .4]]);
  const down = g.lin(0, 120, 0, 312, [[0, '#000', 0], [.55, '#020a1e', .12], [1, '#020a1e', .5]]);
  const warm = g.rad(120, 300, 90, [[0, '#ffb454', .42], [1, '#ffb454', 0]]);
  // front placket + stitching
  const plk = g.lin(158, 0, 172, 0, [[0, '#f0504a'], [.5, '#cf2230'], [1, '#7a0f20']]);
  const diamonds = Array.from({ length: 20 }, (_, i) => { const y = 112 + i * 9.6; return `<path d="M165 ${f(y - 3)}l2.6 3-2.6 3-2.6-3z" fill="#ffe08a" opacity=".92"/>`; }).join('');
  const placket = `<path d="M159 100V312H171V100Z" fill="${plk}"/><path d="M159 100V312M171 100V312" stroke="#4a0812" stroke-width=".8" opacity=".8"/>${diamonds}<path d="M156.4 100V312M173.6 100V312" stroke="#cfe0ff" stroke-width=".6" stroke-dasharray="2.2 1.8" opacity=".65"/>`;
  // hem trim
  const trim = `<g><path d="M103 287H227V296H103Z" fill="${g.lin(0, 287, 0, 296, [[0, '#f0504a'], [1, '#a81826']])}"/><path d="M102 296H228V301.5H102Z" fill="#ffd25a"/><path d="M102 301.5H228V306.4H102Z" fill="#f4efe4"/><path d="M102 306.4H228V310H102Z" fill="#2a64c8"/></g>
   <g fill="#fff">${Array.from({ length: 22 }, (_, i) => `<path d="M${108 + i * 5.55} 291.5l2.4-2.4 2.4 2.4-2.4 2.4z" opacity=".9"/>`).join('')}</g>
   <g fill="#c8222e">${Array.from({ length: 22 }, (_, i) => `<path d="M${110.8 + i * 5.55} 303.8l1.6-1.8 1.6 1.8-1.6 1.8z"/>`).join('')}</g>`;
  const yoke = `<path d="M133 104Q165 118 197 104L197 120Q165 134 133 120Z" fill="${g.lin(0, 104, 0, 124, [[0, '#f0504a'], [1, '#a81826']])}" opacity=".0"/>`;
  // belt (sash, leather) with brass buckle
  const belt = `<path d="M134 168Q165 177 196 168L196 181Q165 190 134 181Z" fill="${g.lin(0, 168, 0, 188, [[0, '#8a5a34'], [.45, '#5a3a20'], [1, '#2a170a']])}" stroke="#1a0e06" stroke-width=".8"/>
   <path d="M134 169.4Q165 178.4 196 169.4" stroke="#d9a070" stroke-width=".8" fill="none" opacity=".6"/><path d="M134 180Q165 189 196 180" stroke="#12080a" stroke-width="1" fill="none" opacity=".6"/>
   <path d="M136 175Q165 184 194 175" stroke="#2a170a" stroke-width=".6" stroke-dasharray="2 1.6" fill="none" opacity=".7"/>
   <rect x="153.4" y="171" width="15" height="12" rx="2" fill="${g.lin(153, 171, 169, 183, [[0, '#fff0b0'], [.45, '#e0b24e'], [1, '#7a4a12']])}" stroke="#4a2c08" stroke-width=".7" transform="rotate(2 161 177)"/><rect x="156.6" y="174" width="8.6" height="6" rx="1" fill="#3a2208" opacity=".7" transform="rotate(2 161 177)"/><path d="M154.6 172H167" stroke="#fff" stroke-width=".7" opacity=".7"/>`;
  // legs + boots
  const boot = (cx, dir) => { const toe = cx + dir * 17; const bd = `M${cx - 10.5} 316L${cx - 11} 344Q${cx - 12} 354 ${cx - 10} 360L${toe} 360.6Q${toe + dir * 3.5} 358 ${toe + dir * 1} 353Q${cx + 11} 347 ${cx + 10.6} 344L${cx + 10.5} 316Z`;
    return `<path d="${bd}" fill="${g.lin(cx - 11, 316, cx + 11, 360, [[0, '#c29a70'], [.5, '#8a603c'], [1, '#3e2614']])}" stroke="#1e1008" stroke-width=".8"/>
    <path d="M${cx - 10.9} 340H${cx + 10.9}V343.4H${cx - 10.9}Z" fill="#c8222e"/><path d="M${cx - 10.9} 343.4H${cx + 10.9}V345.2H${cx - 10.9}Z" fill="#f4efe4"/>
    <path d="M${cx - 9.6} 349l2.2-1.8 2.2 1.8 2.2-1.8 2.2 1.8 2.2-1.8 2.2 1.8 2.2-1.8" stroke="#f4efe4" stroke-width=".8" fill="none"/>
    <path d="M${toe + dir * 2} 360.6L${cx - 10} 360.2Q${cx} 363.4 ${toe + dir * 3} 362Z" fill="#12080a"/>
    <path d="M${cx - 6} 352L${cx - 4} 359M${cx + dir * 8} 354Q${cx + dir * 12} 356 ${cx + dir * 14} 358" stroke="#3e2614" stroke-width=".7" opacity=".6" fill="none"/>
    <ellipse cx="${cx - dir * 4}" cy="344" rx="3" ry="14" fill="#fff0d0" opacity=".14" filter="${b1}"/>`; };
  const legs = `<path d="M139 296L140 322H160L161 296Z" fill="#1c2840"/><path d="M169 296L170 322H190L191 296Z" fill="#1c2840"/>
   <path d="M143 312Q150 314 158 312M172 312Q180 314 188 312" stroke="#06101c" stroke-width="3" fill="none" opacity=".55" filter="${b1}"/>
   ${boot(149, -1)}${boot(181, 1)}`;
  const furBand = (cx, y) => { const d = ellPts(cx, y, 14, 6, 28); return `<path d="${dpath(d)}" fill="#8a7a64"/>` + strands({ n: 380, seed: Math.round(cx), box: [cx - 17, y - 10, cx + 17, y + 9], inside: (x, yy) => ((x - cx) / 15) ** 2 + ((yy - y) / 7.4) ** 2 < 1, flow: (x, yy) => Math.PI / 2 + (x - cx) * .05, len: [3, 7], w: [.22, .4], cols: [['#fff', 1], ['#e6dcc6', 1], ['#a8977c', .7], ['#5b4c3c', .4]], op: [.6, .95], curl: .5 }); };
  const fx = `<g>${furBand(149, 317)}${furBand(181, 317)}</g>`;
  // cast shadows
  const shadow = `<ellipse cx="165" cy="362" rx="62" ry="7" fill="#010510" opacity=".6" filter="${b2}"/><ellipse cx="148" cy="362" rx="30" ry="4" fill="#010510" opacity=".5" filter="${b1}"/>`;
  const warmBounce = `<path d="${parkaD}" fill="${warm}" style="mix-blend-mode:screen"/>`;
  const rimR = `<path d="M197 106Q201 130 195 152L193 172M213 280L225 300" stroke="#b8ffe6" stroke-width="2" fill="none" opacity=".4" filter="${b1}"/>`;
  const svg = `<defs>@@D:${g.p}@@</defs>${shadow}${legs}${fx}
  <g filter="${cloth}"><path d="${parkaD}" fill="${body}"/></g>
  <g clip-path="${clipP}">
   <path d="${parkaD}" fill="${lightL}"/><path d="${parkaD}" fill="${down}"/>${folds}${wr}${bust}${warmBounce}
   <ellipse cx="165" cy="295" rx="64" ry="16" fill="#06163a" opacity=".28" filter="${b4}"/>
   ${placket}${trim}${rimR}
   ${strands({ n: 700, seed: 5, box: [100, 100, 230, 300], inside: (x, y) => pip(x, y, dense(side.concat([[165, 312]]).concat(rside.slice().reverse()), 3)), flow: () => Math.PI / 2, len: [3, 7], w: [.22, .4], cols: [['#9cc4ff', 1], ['#06163a', 1.4]], op: [.05, .12], jit: .3 })}
  </g>
  <path d="${parkaD}" fill="none" stroke="#08153a" stroke-width=".8" opacity=".7"/>
  ${belt}`;
  return { x: 92, y: 90, w: 146, h: 280, s: 3, svg, q: .88 };
};

// ---------------- arms. Upper arm: shoulder -> elbow. Forearm: elbow -> wrist + cuff + mitten.
function sleeveSvg(g, outline, dir, Sx, Sy, Ex, Ey, fold, extra = '') {
  const b1 = g.blur(.9), b2 = g.blur(2);
  const d = dpath(outline), clip = g.clip(d), cloth = g.cloth(.9, .5, 5 + (dir > 0 ? 1 : 0));
  const fill = g.lin(Sx - 11, Sy, Sx + 11, Sy, dir > 0 ? [[0, '#0e2a64'], [.55, '#23499a'], [1, '#4474c8']] : [[0, '#4474c8'], [.45, '#23499a'], [1, '#0e2a64']]);
  const outerX = dir < 0 ? Math.min : Math.max; const cxm = (Sx + Ex) / 2; const seamPts = outline.filter((p, i) => i % 3 === 0 && Math.abs(p[0] - cxm) > 5 && (dir < 0 ? p[0] < cxm : p[0] > cxm) && p[1] > Sy + 6 && p[1] < Ey - 2).sort((a, b) => a[1] - b[1]).map(p => [p[0] + (cxm - p[0]) * .3, p[1]]);
  const seam = seamPts.length > 3 ? `<path d="${cr(seamPts, false)}" stroke="#cfe0ff" stroke-width=".5" stroke-dasharray="1.8 1.4" fill="none" opacity=".55"/><path d="${cr(seamPts.map(p => [p[0] + dir * .8, p[1] + .6]), false)}" stroke="#06163a" stroke-width=".5" fill="none" opacity=".5"/>` : '';
  return `<path d="${d}" transform="translate(${-dir * 2.5} 2)" fill="#010510" opacity=".45" filter="${b2}"/><g filter="${cloth}"><path d="${d}" fill="${fill}"/></g><g clip-path="${clip}">${fold}${seam}
   ${strands({ n: 260, seed: 12, box: [Math.min(Sx, Ex) - 14, Sy - 4, Math.max(Sx, Ex) + 14, Ey + 4], inside: (x, y) => pip(x, y, outline), flow: () => Math.atan2(Ey - Sy, Ex - Sx), len: [3, 6], w: [.2, .38], cols: [['#9cc4ff', 1], ['#06163a', 1.2]], op: [.1, .22], jit: .3 })}
   ${extra}</g><path d="${d}" fill="none" stroke="#08153a" stroke-width=".7" opacity=".7"/>`;
}
exports.upper = (side) => { // side: -1 = viewer's left (lantern arm), +1 = viewer's right
  const g = new G('au' + (side < 0 ? 'L' : 'R')); const b1 = g.blur(1), b2 = g.blur(2);
  const S = side < 0 ? [127, 108] : [203, 108], E = side < 0 ? [118, 170] : [212, 170];
  const lm = limb(S, E, 23, 17.5, side * -2, 12);
  const nrm = (A, B2) => { const dx = B2[0] - A[0], dy = B2[1] - A[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  const u = nrm(S, E); const outl = [[S[0] - u[0] * 8 + u[1] * 0, S[1] - 9], ...lm.L, [E[0] + u[0] * 6, E[1] + 6], ...lm.R.slice().reverse()];
  const outline2 = dense(outl, 4);
  const fold = `<path d="M${S[0] + side * 3} ${S[1] + 50}Q${S[0] + side * 1} ${S[1] + 58} ${E[0]} ${E[1] - 3}" stroke="#06163a" stroke-width="3" fill="none" opacity=".5" filter="${b1}"/>
   <path d="M${E[0] - 8} ${E[1] - 12}Q${E[0]} ${E[1] - 8} ${E[0] + 9} ${E[1] - 13}M${E[0] - 8} ${E[1] - 20}Q${E[0]} ${E[1] - 16} ${E[0] + 8} ${E[1] - 21}" stroke="#06163a" stroke-width="1.4" fill="none" opacity=".5" filter="${b1}"/>
   <path d="M${S[0] - 8} ${S[1] + 4}Q${S[0]} ${S[1] - 4} ${S[0] + 9} ${S[1] + 4}" stroke="#9cc4ff" stroke-width="2" fill="none" opacity=".34" filter="${b1}"/>
   <path d="M${S[0] + side * 11} ${S[1] + 8}Q${E[0] + side * 11} ${E[1] - 40} ${E[0] + side * 9} ${E[1]}" stroke="#b8ffe6" stroke-width="2.4" fill="none" opacity="${side > 0 ? .5 : .12}" filter="${b1}"/>
   <ellipse cx="${E[0]}" cy="${E[1] - 3}" rx="10" ry="7" fill="#06163a" opacity=".25" filter="${b2}"/>
   ${side < 0 ? `<path d="M${S[0] - 12} ${S[1] + 40}Q${E[0] - 6} ${E[1] - 20} ${E[0] - 6} ${E[1]}" stroke="#ffb454" stroke-width="3" fill="none" opacity=".25" filter="${b2}"/>` : ''}`;
  const _in = sleeveSvg(g, outline2, side, S[0], S[1], E[0], E[1], fold); const svg = `<defs>@@D:${g.p}@@</defs>` + _in;
  return { x: side < 0 ? 94 : 190, y: 94, w: 56, h: 90, s: 3, svg, q: .88 };
};

const mitten = (g, cx, cy, side, grip) => { // hand hanging down at (cx,cy)=wrist centre
  const b1 = g.blur(.8), b2 = g.blur(1.6);
  const body = cr([[cx - 8.5, cy + 1], [cx - 9.6, cy + 12], [cx - 8, cy + 22], [cx - 3, cy + 26], [cx + 3.5, cy + 26], [cx + 8.4, cy + 21], [cx + 9.6, cy + 12], [cx + 8.5, cy + 1]]);
  const thumb = cr([[cx + side * 7, cy + 5], [cx + side * 13, cy + 9], [cx + side * 14, cy + 15], [cx + side * 9, cy + 16], [cx + side * 6.6, cy + 11]]);
  const bd = dense([[cx - 8.5, cy + 1], [cx - 9.6, cy + 12], [cx - 8, cy + 22], [cx - 3, cy + 26], [cx + 3.5, cy + 26], [cx + 8.4, cy + 21], [cx + 9.6, cy + 12], [cx + 8.5, cy + 1]], 6);
  const red = g.lin(cx - 10, cy, cx + 10, cy + 26, [[0, '#f0645a'], [.45, '#c8222e'], [1, '#7a0f20']]);
  const knit = g.filt(`<feTurbulence type="fractalNoise" baseFrequency=".9 .5" numOctaves="2" seed="8" result="n"/><feDiffuseLighting in="n" lighting-color="#fff" surfaceScale="1.6" diffuseConstant="1.15" result="l"><feDistantLight azimuth="300" elevation="55"/></feDiffuseLighting><feComposite in="l" in2="SourceGraphic" operator="in" result="lc"/><feBlend in="lc" in2="SourceGraphic" mode="multiply"/>`);
  const cB = g.clip(body);
  let vs = ''; for (let y = cy + 1; y < cy + 26; y += 2.4) for (let x = cx - 10; x < cx + 10; x += 2.6) vs += `M${f(x)} ${f(y)}l1.3 1.6 1.3-1.6`;
  return `<g filter="${knit}"><path d="${thumb}" fill="${red}"/><path d="${body}" fill="${red}"/></g>
  <path d="${thumb}" fill="none" stroke="#3a0610" stroke-width=".7" opacity=".7"/>
  <g clip-path="${cB}"><path d="${vs}" stroke="#4a0812" stroke-width=".35" fill="none" opacity=".5"/><path d="${vs}" transform="translate(.5 -.4)" stroke="#ff9a90" stroke-width=".25" fill="none" opacity=".4"/>
   <path d="M${cx - 10} ${cy + 17}H${cx + 10}" stroke="#f4efe4" stroke-width="2.2"/><path d="M${cx - 10} ${cy + 14.4}H${cx + 10}M${cx - 10} ${cy + 19.6}H${cx + 10}" stroke="#2a64c8" stroke-width="1"/>
   <g fill="#f4efe4">${[-6, -2, 2, 6].map(dx => `<path d="M${cx + dx} ${cy + 7}l1.6 1.8-1.6 1.8-1.6-1.8z"/>`).join('')}</g>
   <ellipse cx="${cx + side * 5}" cy="${cy + 13}" rx="6" ry="12" fill="#06163a" opacity=".3" filter="${b2}"/><ellipse cx="${cx - side * 4}" cy="${cy + 8}" rx="2.4" ry="9" fill="#ffd0c8" opacity=".3" filter="${b1}"/>
   <path d="M${cx - 8} ${cy + 23}Q${cx} ${cy + 27} ${cx + 8} ${cy + 22}" stroke="#ffb454" stroke-width="2" fill="none" opacity="${side > 0 ? .0 : .35}" filter="${b1}"/></g>
  <path d="${body}" fill="none" stroke="#3a0610" stroke-width=".8" opacity=".8"/>`;
};
const cuff = (g, cx, cy) => { // red band + fur cuff at the wrist
  const fc = ellPts(cx, cy, 10.8, 4.4, 24);
  return `<path d="M${cx - 8.4} ${cy - 5}H${cx + 8.4}L${cx + 9.2} ${cy + 1}H${cx - 9.2}Z" fill="${g.lin(0, cy - 5, 0, cy + 1, [[0, '#d4202e'], [1, '#7a0f20']])}"/>
   <path d="${dpath(fc)}" fill="#8a7a64"/>${strands({ n: 190, seed: Math.round(cx * 3), box: [cx - 13, cy - 8, cx + 13, cy + 8], inside: (x, y) => ((x - cx) / 12) ** 2 + ((y - cy) / 5.8) ** 2 < 1, flow: (x, y) => Math.PI / 2 + (x - cx) * .06, len: [3, 6], w: [.2, .38], cols: [['#fff', 1], ['#e6dcc6', 1], ['#a8977c', .7], ['#4a3c2e', .4]], op: [.6, .95], curl: .5 })}`;
};
exports.fore = (side) => {
  const g = new G('af' + (side < 0 ? 'L' : 'R')); const b1 = g.blur(.9), b2 = g.blur(2);
  const E = side < 0 ? [118, 170] : [212, 170], W = side < 0 ? [124, 232] : [206, 232];
  const lm = limb(E, W, 18, 13.5, side * 1.4, 10);
  const poly = dense([[E[0], E[1] - 9.5], ...lm.L.slice(0, 11), [W[0], W[1] + 3], ...lm.R.slice(0, 11).reverse()], 3);
  const fold = `<path d="M${E[0] - side * 2} ${E[1] + 4}Q${W[0] - side * 2} ${W[1] - 30} ${W[0]} ${W[1] - 4}" stroke="#06163a" stroke-width="3" fill="none" opacity=".42" filter="${b1}"/>
   <path d="M${E[0] - 8} ${E[1] + 6}Q${E[0]} ${E[1] + 11} ${E[0] + 8} ${E[1] + 5}M${E[0] - 8} ${E[1] + 15}Q${E[0]} ${E[1] + 19} ${E[0] + 8} ${E[1] + 14}" stroke="#06163a" stroke-width="1.2" fill="none" opacity=".45" filter="${b1}"/>
   <path d="M${E[0] + side * 8} ${E[1]}Q${W[0] + side * 7} ${W[1] - 40} ${W[0] + side * 6} ${W[1]}" stroke="#b8ffe6" stroke-width="2.2" fill="none" opacity="${side > 0 ? .5 : .1}" filter="${b1}"/>
   <path d="M${W[0] - 10} ${W[1] - 12}Q${W[0]} ${W[1] - 8} ${W[0] + 10} ${W[1] - 12}" stroke="#06163a" stroke-width="2" fill="none" opacity=".4" filter="${b1}"/>`;
  const _in = sleeveSvg(g, poly, side, E[0], E[1], W[0], W[1], fold) + cuff(g, W[0], W[1] + 1) + mitten(g, W[0], W[1] + 3, side * -1, 0); const svg = `<defs>@@D:${g.p}@@</defs>` + _in;
  return { x: side < 0 ? 90 : 180, y: 158, w: 62, h: 110, s: 3.2, svg, q: .88 };
};

// ---------------- braid (hangs over the viewer's right shoulder, in front of the parka)
exports.braid = () => {
  const g = new G('abr'); const b1 = g.blur(.8), b2 = g.blur(1.8);
  const cl = [[190, 94], [196, 120], [194, 150], [197, 180], [195, 206]];
  const at = (t) => { const n = cl.length - 1, k = Math.min(n - 1, Math.floor(t * n)), u = t * n - k; const p = cl[k], q = cl[k + 1]; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; };
  const hair = g.lin(188, 0, 204, 0, [[0, '#6b4630'], [.5, '#3a2216'], [1, '#150a06']]);
  let segs = '', hl = '';
  const N = 15;
  for (let i = 0; i < N; i++) { const t = i / (N - 1), [x, y] = at(t), w = 6.4 - t * 1.6, dir = i % 2 ? 1 : -1, h = 8.6 - t * 1.2;
    segs += `<ellipse cx="${f(x + dir * 1.1)}" cy="${f(y)}" rx="${f(w)}" ry="${f(h * .62)}" transform="rotate(${dir * 24} ${f(x)} ${f(y)})" fill="${hair}" stroke="#0c0504" stroke-width=".5"/>`;
    hl += `<path d="M${f(x - dir * w * .6)} ${f(y - h * .45)}Q${f(x)} ${f(y - h * .1)} ${f(x + dir * w * .7)} ${f(y + h * .3)}" stroke="#b88a60" stroke-width=".5" fill="none" opacity=".5"/><path d="M${f(x - dir * w * .5)} ${f(y - h * .3)}Q${f(x)} ${f(y)} ${f(x + dir * w * .5)} ${f(y + h * .4)}" stroke="#0a0504" stroke-width=".7" fill="none" opacity=".55"/>`; }
  const sk = strands({ n: 420, seed: 3, box: [186, 92, 206, 212], inside: (x, y) => { const t = (y - 94) / 112; if (t < 0 || t > 1) return false; const c = at(t); return Math.abs(x - c[0]) < 6.6 - t * 1.6; }, flow: (x, y) => Math.PI / 2 + (x - 196) * .03, len: [3, 8], w: [.16, .3], cols: [['#c8a078', 1], ['#7a5236', 1], ['#1a0c07', 1]], op: [.25, .6], curl: .4 });
  const [tx, ty] = at(1);
  const tie = `<path d="M${tx - 5} ${ty - 2}H${tx + 5}L${tx + 4.4} ${ty + 4}H${tx - 4.4}Z" fill="${g.lin(0, ty - 2, 0, ty + 4, [[0, '#f0504a'], [1, '#8a1020']])}"/><path d="M${tx - 3} ${ty + 4}l-3 12M${tx} ${ty + 4}v14M${tx + 3} ${ty + 4}l3 12" stroke="#c8222e" stroke-width="1.8" fill="none"/><path d="M${tx - 3} ${ty + 14}l-1.4 6M${tx} ${ty + 16}v6M${tx + 3} ${ty + 14}l1.4 6" stroke="#2a0a10" stroke-width=".9" fill="none"/>`;
  const svg = `<defs>@@D:${g.p}@@</defs><path d="M191 96Q198 130 195 206" stroke="#010510" stroke-width="10" opacity=".4" fill="none" filter="${b2}" transform="translate(2 2)"/>${segs}<g>${hl}</g>${sk}${tie}
  <path d="M185 96Q192 130 189 206" stroke="#b8ffe6" stroke-width="1.6" fill="none" opacity="0" />`;
  return { x: 176, y: 88, w: 40, h: 150, s: 4, svg, q: .9 };
};

// ---------------- hurricane lantern (glass + metal; flame and glow stay vector)
exports.lantern = () => {
  const g = new G('al'); const b1 = g.blur(.6), b2 = g.blur(1.4);
  const cx = 123, top = 268;
  const metal = g.lin(cx - 11, 0, cx + 11, 0, [[0, '#3a3228'], [.3, '#8a7a5a'], [.55, '#d8c48a'], [.8, '#6a5a3a'], [1, '#2a2218']]);
  const glassC = g.rad(cx, top + 26, 16, [[0, '#ffe7a8', .55], [.5, '#ffcf70', .26], [1, '#a8c8e0', .22]]);
  const globe = `M${cx - 8} ${top + 14}C${cx - 13} ${top + 20} ${cx - 13} ${top + 34} ${cx - 8} ${top + 40}L${cx + 8} ${top + 40}C${cx + 13} ${top + 34} ${cx + 13} ${top + 20} ${cx + 8} ${top + 14}Z`;
  const svg = `<defs>@@D:${g.p}@@</defs>
   <path d="M${cx - 5} ${top + 3}Q${cx - 5} ${top - 4} ${cx} ${top - 4}Q${cx + 5} ${top - 4} ${cx + 5} ${top + 3}" stroke="${metal}" stroke-width="1.4" fill="none"/>
   <path d="M${cx - 8} ${top + 14}L${cx - 6} ${top + 5}H${cx + 6}L${cx + 8} ${top + 14}Z" fill="${metal}" stroke="#1a1208" stroke-width=".7"/><path d="M${cx - 3} ${top + 5}Q${cx} ${top + 1} ${cx + 3} ${top + 5}" fill="none" stroke="#1a1208" stroke-width="1"/>
   <path d="M${cx - 6.4} ${top + 14}V${top + 40}M${cx + 6.4} ${top + 14}V${top + 40}" stroke="#3a3020" stroke-width="1" opacity=".0"/>
   <path d="${globe}" fill="${glassC}" stroke="#d6e8f2" stroke-width=".7" stroke-opacity=".7"/>
   <path d="M${cx - 10} ${top + 20}C${cx - 11.4} ${top + 26} ${cx - 11.4} ${top + 32} ${cx - 9} ${top + 37}" stroke="#fff" stroke-width="1.4" fill="none" opacity=".8" filter="${b1}"/>
   <path d="M${cx + 8.6} ${top + 18}C${cx + 10.4} ${top + 25} ${cx + 10.4} ${top + 31} ${cx + 8.6} ${top + 36}" stroke="#ffe0a0" stroke-width="1" fill="none" opacity=".6"/>
   <path d="M${cx - 9} ${top + 40}L${cx - 8} ${top + 46}H${cx + 8}L${cx + 9} ${top + 40}Z" fill="${metal}" stroke="#1a1208" stroke-width=".7"/><path d="M${cx - 6} ${top + 40}V${top + 44}M${cx} ${top + 40}V${top + 44}M${cx + 6} ${top + 40}V${top + 44}" stroke="#1a1208" stroke-width=".6"/>
   <path d="M${cx - 8} ${top + 15}L${cx - 6.4} ${top + 8}M${cx + 8} ${top + 15}L${cx + 6.4} ${top + 8}" stroke="#d8c48a" stroke-width=".8"/>
   <ellipse cx="${cx - 2}" cy="${top + 4}" rx="2.4" ry=".7" fill="#fff" opacity=".7" filter="${b1}"/>`;
  return { x: 100, y: 258, w: 46, h: 64, s: 4, svg, q: .9 };
};
