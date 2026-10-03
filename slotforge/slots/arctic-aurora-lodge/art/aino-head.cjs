// Aino head parts (face+hair, brows, 3 mouths, fur hood ring). Baked bitmaps; eyes stay vector (see char.cjs).
const { G, strands, pip, dpath, ellPts, cr, dense, rng, f } = require('./charlib.cjs');
const CX = 165;
const facePts = [[165, 37], [175, 40], [180.5, 50], [181.6, 62], [179, 72], [173, 80], [165, 83.4], [157, 80], [151, 72], [148.4, 62], [149.5, 50], [155, 40]];
const faceD = cr(facePts), faceP = dense(facePts, 8);
exports.faceD = faceD;
exports.EYES = [[157.2, 59.2, -1], [172.8, 59.2, 1]]; // cx, cy, side (-1 = viewer's left eye, outer corner at left)

exports.face = () => {
  const g = new G('af'); const clip = g.clip(faceD); const b1 = g.blur(1), b2 = g.blur(2), b3 = g.blur(3.2), bh = g.blur(.6);
  const skin = g.ell(163, 58, 24, 30, [[0, '#f8d6b6'], [.55, '#e9b690'], [1, '#bf8866']]);
  const neckG = g.lin(0, 76, 0, 104, [[0, '#a8705a'], [.5, '#8c5a48'], [1, '#6a4236']]);
  const hairG = g.lin(0, 30, 0, 80, [[0, '#6b4630'], [.5, '#3a2216'], [1, '#1c0f09']]);
  const sh = (cx, cy, rx, ry, c, op, bl = b1, rot = 0) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" opacity="${op}" filter="${bl}" transform="rotate(${rot} ${cx} ${cy})"/>`;
  // hair cap + strands
  const cap = cr([[139, 70], [136, 50], [143, 34], [165, 28], [187, 34], [194, 50], [191, 70], [184, 76], [182, 64], [180, 53], [175, 46], [170, 42.6], [165, 43.6], [160, 42.6], [155, 46], [150, 53], [148, 64], [146, 76]]);
  const capP = dense([[139, 70], [136, 50], [143, 34], [165, 28], [187, 34], [194, 50], [191, 70], [184, 76], [182, 64], [180, 53], [175, 46], [170, 42.6], [165, 43.6], [160, 42.6], [155, 46], [150, 53], [148, 64], [146, 76]], 8);
  const hflow = (x, y) => { const dx = x - CX; return Math.atan2(1, dx * (y < 52 ? .16 : .05) + (dx < 0 ? -.12 : .12)); };
  const hairStr = ['#12080a', '#2a160d', '#4a2a1a', '#6b4630', '#8a6244'].map((c, i) => strands({ n: [1100, 900, 700, 420, 160][i], seed: 11 + i, box: [134, 28, 196, 80], inside: (x, y) => pip(x, y, capP), flow: hflow, len: [6, 15], w: [.18, .34], cols: [[c, 1]], op: [.55, .95], curl: .5, jit: .2 })).join('');
  const hairHi = strands({ n: 160, seed: 41, box: [134, 28, 196, 70], inside: (x, y) => pip(x, y, capP) && y < 52, flow: hflow, len: [6, 12], w: [.15, .28], cols: [['#d9a878', 1], ['#a8b8a0', .5]], op: [.35, .7], curl: .5, jit: .15 });
  const hairRim = strands({ n: 140, seed: 42, box: [170, 28, 196, 70], inside: (x, y) => pip(x, y, capP) && x > 176, flow: hflow, len: [5, 10], w: [.15, .3], cols: [['#aef5dc', 1]], op: [.25, .6], curl: .5, jit: .15 });
  const lining = g.lin(0, 30, 0, 92, [[0, '#141c2c'], [1, '#080c14']]), capClip = g.clip(cap);
  const skinTex = g.filt(`<feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .45  0 0 0 0 .25  0 0 0 0 .2  0 0 0 .5 -.12"/>`);
  const svg = `<defs>@@D:${g.p}@@</defs>
 <ellipse cx="165" cy="61" rx="23" ry="31" fill="${lining}"/>
 <path d="M157 76L154 106H176L173 76Z" fill="${neckG}"/>
 ${sh(165, 90, 9, 7, '#2a1410', .55, b2)}
 <path d="${faceD}" fill="${skin}"/>
 <g clip-path="${clip}">
  ${sh(149, 64, 4.4, 15, '#7a3f2e', .38, b2)}${sh(180.6, 70, 3, 11, '#7a3f2e', .2, b2, 8)}
  ${sh(157.2, 58.4, 7.2, 4.4, '#7a4034', .42, b1)}${sh(172.8, 58.4, 7.2, 4.4, '#7a4034', .34, b1)}
  ${sh(165, 79, 14, 5, '#6a3428', .35, b2)}${sh(165, 83.5, 10, 3, '#4a2218', .5, b1)}
  ${sh(165, 71.2, 5.2, 1.5, '#4a1e18', .62, b1)}${sh(165, 79.6, 5, 1.2, '#7a3a30', .38, b1)}
  <path d="M162.4 55L161.2 67.4" stroke="#7a3f30" stroke-width="2.2" opacity=".5" filter="${b1}" fill="none"/>
  <path d="M168.8 56L169.8 67" stroke="#8a5040" stroke-width="1.2" opacity=".24" filter="${b1}" fill="none"/>
  <path d="M160.6 69.2Q161.6 66.6 163.4 67.6M169.4 69.2Q168.4 66.6 166.6 67.6" stroke="#7a3f30" stroke-width=".55" opacity=".55" fill="none"/>
  ${sh(165, 73.6, 1.6, 2.6, '#7a3f30', .22, bh)}${sh(165, 81, 4.4, 1.2, '#7a3f30', .3, bh)}${sh(165, 77.4, 12, 3.4, '#8a4e40', .12, b2)}
  <path d="M168.6 55.6L169.2 67.8" stroke="#8a5040" stroke-width="1.1" opacity=".16" filter="${b1}" fill="none"/>
  ${sh(153.2, 67.4, 4.6, 3.3, '#e8806a', .3, b2)}${sh(176.8, 67.4, 4.6, 3.3, '#e8806a', .24, b2)}
  ${sh(167, 45, 9, 3.5, '#fff0dc', .4, b2)}${sh(176.8, 63.4, 3.4, 4, '#fff0dc', .34, b2)}${sh(165, 80.4, 3.6, 1.4, '#ffe6d0', .35, b1)}
  <path d="M166.4 57L166.9 66" stroke="#ffe9d4" stroke-width=".9" opacity=".5" filter="${bh}" fill="none"/>
  ${sh(165.6, 68.2, 2.4, 1.9, '#fff0e0', .8, bh)}${sh(161.6, 69.2, 1.9, 1.2, '#8a5040', .35, bh)}${sh(168.6, 69.2, 1.9, 1.2, '#8a5040', .25, bh)}
  <ellipse cx="163.5" cy="70.2" rx="1.05" ry=".6" fill="#3a140f" opacity=".85"/><ellipse cx="166.7" cy="70.2" rx="1.05" ry=".6" fill="#3a140f" opacity=".8"/>
  <path d="M152.2 56.4Q157 53.4 162 55.6" stroke="#8a5448" stroke-width=".4" fill="none" opacity=".55"/><path d="M168 55.6Q173 53.4 178 56.4" stroke="#8a5448" stroke-width=".4" fill="none" opacity=".4"/>
  <path d="M183 52Q184.4 64 180.4 72L174 80" stroke="#b6ffe4" stroke-width="2.4" fill="none" opacity=".4" filter="${b1}"/>
  <path d="M147 66Q150 76 158 80.6" stroke="#ffb060" stroke-width="2" fill="none" opacity=".22" filter="${b1}"/>
  <rect x="130" y="30" width="70" height="60" filter="${skinTex}" opacity=".22"/>
 </g>
 <path d="${faceD}" fill="none" stroke="#6a3a2c" stroke-width=".35" opacity=".4"/>
 <g>
  <path d="${cap}" fill="${hairG}"/>
  <g clip-path="${capClip}">${hairStr}${hairHi}${hairRim}</g>
  <path d="M165 43.6Q165.2 37 164 32" stroke="#0a0506" stroke-width=".9" opacity=".7" fill="none"/>
 </g>`;
  return { x: 130, y: 24, w: 70, h: 86, s: 5, svg, q: .92 };
};

exports.brows = () => {
  const g = new G('ab'); const R = rng(77); let d = '', d2 = '';
  const brow = (x0, y0, x1, y1, x2, y2, th, side) => { for (let i = 0; i < 46; i++) { const t = R(), px = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * x1 + t * t * x2, py = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y2; const tk = th * (t < .4 ? .55 + t * 1.1 : 1 - (t - .4) * 1.4), oy = (R() - .5) * tk * 1.6; const a = -side * (.7 + (R() - .5) * .3) - t * side * .35 * (-1); const L = 1.5 + R() * 1.4; const sx = px, sy = py + oy; (R() < .3 ? (d2 += `M${f(sx)} ${f(sy)}l${f(side * Math.cos(.5) * L * .9)} ${f(-Math.sin(.5) * L * .55)}`) : (d += `M${f(sx)} ${f(sy)}l${f(side * Math.cos(.5) * L)} ${f(-Math.sin(.5) * L * .4 + (t > .5 ? .5 : -.2))}`)); } };
  brow(162.2, 54.2, 157.4, 51.6, 151.8, 54.0, 1.4, -1); brow(167.8, 54.2, 172.6, 51.6, 178.2, 54.0, 1.4, 1);
  const svg = `<defs>@@D:${g.p}@@</defs><path d="${d}" stroke="#3a2214" stroke-width=".3" fill="none" opacity=".85"/><path d="${d2}" stroke="#6a4630" stroke-width=".25" fill="none" opacity=".7"/>`;
  return { x: 146, y: 46, w: 38, h: 14, s: 10, svg, q: .92 };
};

exports.mouths = () => {
  const mk = (name, inner) => { const g = new G('am' + name); const b = g.blur(.35); const b2 = g.blur(.8); const lipU = g.lin(0, 73, 0, 76.2, [[0, '#c2706a'], [1, '#98444a']]), lipL = g.lin(0, 76, 0, 79.6, [[0, '#cf7e78'], [1, '#b35a5c']]);
    return { name: 'aiM' + name, x: 155, y: 69, w: 20, h: 16, s: 12, q: .93, svg: `<defs>@@D:${g.p}@@</defs>` + inner(g, b, b2, lipU, lipL) }; };
  const m0 = mk('0', (g, b, b2, U, L) => `<path d="M159.2 75.5Q165 77.4 170.8 75.5" stroke="#6a2a30" stroke-width="1.5" fill="none" opacity=".25" filter="${b2}"/>
   <path d="M159.8 75.9C162 76.5 168 76.5 170.2 75.9C169.4 78.4 167.4 79.3 165 79.3C162.6 79.3 160.6 78.4 159.8 75.9Z" fill="${L}"/>
   <ellipse cx="165" cy="77.7" rx="2.5" ry=".6" fill="#ffd8d0" opacity=".55" filter="${b}"/><ellipse cx="165" cy="79.4" rx="3.2" ry=".5" fill="#6a2a30" opacity=".25" filter="${b}"/>
   <path d="M159 75.4C160.8 74.5 162.8 73.2 165 73.9C167.2 73.2 169.2 74.5 171 75.4C169 76.3 167 76.4 165 76.5C163 76.4 161 76.3 159 75.4Z" fill="${U}"/>
   <path d="M159 75.4C161 76.4 163 76.6 165 76.6C167 76.6 169 76.4 171 75.4" stroke="#5a1e26" stroke-width=".5" fill="none" opacity=".9"/><path d="M162 74.6Q165 73.6 168 74.6" stroke="#e9a49c" stroke-width=".35" fill="none" opacity=".5"/>
   <circle cx="158.8" cy="75.3" r=".6" fill="#8a4040" opacity=".5" filter="${b}"/><circle cx="171.2" cy="75.3" r=".6" fill="#8a4040" opacity=".5" filter="${b}"/>`);
  const m1 = mk('1', (g, b, b2, U, L) => `<path d="M159.6 75.3C161.6 76.1 168.4 76.1 170.4 75.3C170.2 77.4 168.2 78.4 165 78.4C161.8 78.4 159.8 77.4 159.6 75.3Z" fill="#3a0e16"/>
   <path d="M160.5 75.7C162.6 76.3 167.4 76.3 169.5 75.7L169.1 77.3C167.4 77.7 162.6 77.7 160.9 77.3Z" fill="#f3ede7"/><path d="M165 76.2V77.5" stroke="#cfc5bc" stroke-width=".22"/>
   <ellipse cx="165" cy="77.9" rx="2.4" ry=".6" fill="#c25b62"/>
   <path d="M159.4 75.6C160.2 78.4 162.4 79.5 165 79.5C167.6 79.5 169.8 78.4 170.6 75.6C169.4 77.9 167.2 78.7 165 78.7C162.8 78.7 160.6 77.9 159.4 75.6Z" fill="${L}"/><ellipse cx="165" cy="79" rx="1.8" ry=".3" fill="#ffd8d0" opacity=".4" filter="${b}"/>
   <path d="M158.7 75C160.6 74.4 162.8 73.2 165 73.8C167.2 73.2 169.4 74.4 171.3 75C169.2 76 167 75.8 165 75.9C163 75.8 160.8 76 158.7 75Z" fill="${U}"/>
   <path d="M158.7 75C160.8 76 163 75.9 165 75.9C167 75.9 169.2 76 171.3 75" stroke="#5a1e26" stroke-width=".4" fill="none" opacity=".7"/>`);
  const m2 = mk('2', (g, b, b2, U, L) => `<ellipse cx="165" cy="76.9" rx="3.3" ry="3.7" fill="${L}"/><ellipse cx="165" cy="76.9" rx="1.9" ry="2.4" fill="#33090f"/><ellipse cx="165" cy="78.2" rx="1.1" ry=".9" fill="#a8444e" opacity=".8"/>
   <path d="M162 74.6Q165 73.2 168 74.6" stroke="#e9a49c" stroke-width=".4" fill="none" opacity=".6"/><ellipse cx="163.8" cy="75.4" rx=".9" ry=".4" fill="#ffd8d0" opacity=".5"/>`);
  return [m0, m1, m2];
};

// ---------------- fur hood ring
exports.ring = () => {
  const g = new G('ar'); const HC = [165, 61], HRX = 20.2, HRY = 28.6;
  const hole = (x, y) => ((x - HC[0]) / HRX) ** 2 + ((y - HC[1]) / HRY) ** 2 < 1;
  const inE = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
  const outer = (x, y) => inE(x, y, 165, 58, 34, 39) || inE(x, y, 165, 100, 40, 12) || inE(x, y, 165, 88, 36, 14);
  const R = rng(5);
  // radial length from the hole boundary to the outer boundary
  const lenAt = (a) => { let r = 0; const dx = Math.cos(a), dy = Math.sin(a); const bx = HC[0] + dx * HRX, by = HC[1] + dy * HRY; for (let t = 0; t < 40; t += .5) { if (!outer(bx + dx * t, by + dy * t)) return t; } return 40; };
  const cols = { shade: ['#5b4c3c', '#6f5e49', '#826f58'], mid: ['#a8977c', '#bdae92', '#cfc2a8'], light: ['#e3d9c3', '#efe7d5', '#f8f2e6'], hi: ['#ffffff', '#fbf6ea', '#f1ead9'] };
  const pick = (a) => a[Math.floor(R() * a.length)];
  const clump = (a, L, w, c, op) => { // tapered blade from the hole edge outward at angle a
    const bx = HC[0] + Math.cos(a) * (HRX - 1.5), by = HC[1] + Math.sin(a) * (HRY - 1.5);
    const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx; const sw = (R() - .5) * .5 + .1 * dx; const g2 = 0.25 + .3 * (dy > 0 ? 1 : 0);
    const tx = bx + dx * L + nx * L * sw, ty = by + dy * L + ny * L * sw + L * .08 * g2;
    const mx = bx + dx * L * .55 + nx * L * sw * .35, my = by + dy * L * .55 + ny * L * sw * .35;
    return `<path d="M${f(bx + nx * w)} ${f(by + ny * w)}Q${f(mx + nx * w * .9)} ${f(my + ny * w * .9)} ${f(tx)} ${f(ty)}Q${f(mx - nx * w * .9)} ${f(my - ny * w * .9)} ${f(bx - nx * w)} ${f(by - ny * w)}Z" fill="${c}" opacity="${op}"/>`;
  };
  let layers = '';
  const ring = (n, k, wmin, wmax, cset, op, seed, lmul = 1) => { let s = ''; for (let i = 0; i < n; i++) { const a = (i + R() * .9) / n * Math.PI * 2; const L = lenAt(a) * k * (.82 + R() * .3) * lmul; s += clump(a, L, wmin + R() * (wmax - wmin), pick(cset), op); } return s; };
  const dark = ellPts(165, 60, 40, 46, 40);
  const rough = g.rough(.5, 2.4, 9);
  const baseShape = `<ellipse cx="165" cy="58" rx="33" ry="38"/><ellipse cx="165" cy="100" rx="39" ry="11"/><ellipse cx="165" cy="88" rx="35" ry="13"/>`;
  layers += `<g fill="#3e3226" mask="${g.mask('<rect x="0" y="0" width="400" height="300" fill="#fff"/><ellipse cx="'+HC[0]+'" cy="'+HC[1]+'" rx="'+(HRX+1)+'" ry="'+(HRY+1)+'" fill="#000"/>')}">${baseShape}</g>`;
  layers += `<g filter="${rough}">` + ring(70, 1.02, 2.4, 4.2, cols.shade, 1) + ring(86, .95, 2.2, 3.6, cols.mid, .98) + ring(100, .78, 1.8, 3.0, cols.light, .98) + ring(120, .52, 1.4, 2.4, cols.hi, .95) + `</g>`;
  // strands: flow = radial from the hole, with a slight droop
  const flow = (x, y) => Math.atan2((y - HC[1]) / HRY, (x - HC[0]) / HRX) + ((y > HC[1] ? -1 : 1) * 0);
  const inFur = (x, y) => !hole(x, y) && outer(x, y);
  const fl2 = (x, y) => { const a = Math.atan2((y - HC[1]) * HRX / HRY, (x - HC[0])); return a; };
  const S = (n, seed, cs, wmin, wmax, lmin, lmax, opa, opb, pred) => strands({ n, seed, box: [120, 14, 212, 118], inside: (x, y) => inFur(x, y) && (!pred || pred(x, y)), flow: fl2, len: [lmin * .8, lmax * .85], w: [wmin, wmax], cols: cs, op: [opa, opb], curl: .45, jit: .4 });
  layers += `<g filter="${rough}">` + S(1700, 1, [['#4a3c2e', 1], ['#7a6850', 1]], .22, .4, 6, 12, .5, .85) + `</g>`;
  layers += S(2400, 2, [['#c8bc9f', 1], ['#e4dac4', 1.4], ['#a29274', .6]], .2, .38, 6, 13, .5, .9, (x, y) => ((x - 165) / 33) ** 2 + ((y - 58) / 38) ** 2 > .12);
  layers += S(2200, 3, [['#ffffff', 1.5], ['#f4ecdb', 1], ['#d8cdb3', .6]], .2, .36, 5, 11, .5, .95, (x, y) => hole((x - 165) * .78 + 165, (y - 61) * .78 + 61) === false);
  layers += S(300, 4, [['#2c2118', 1], ['#463626', 1]], .25, .45, 7, 13, .55, .85, (x, y) => ((x - 165) / 33) ** 2 + ((y - 58) / 38) ** 2 > .5);  // dark guard hairs
  layers += S(260, 5, [['#d4fff0', 1], ['#c4f4ff', .6]], .22, .4, 5, 10, .25, .55, (x, y) => y < 34 && x > 150);               // aurora rim light on the top
  layers += S(170, 6, [['#ffc27a', 1], ['#ffe0a8', .6]], .22, .4, 5, 10, .2, .5, (x, y) => x < 140 && y > 70);                // lantern bounce on the left, low
  layers += S(110, 7, [['#c4f4ff', 1]], .22, .4, 5, 10, .2, .45, (x, y) => x > 192);
  // soft shading: under the hood on the body (cast shadow), inner shadow around the face opening, outer depth
  const b4 = g.blur(4), b2 = g.blur(2);
  const holeD = dpath(ellPts(HC[0], HC[1], HRX, HRY, 60));
  const inner = `<path d="${holeD}" fill="none" stroke="#1a0f08" stroke-width="5" opacity=".75" filter="${b2}"/>`;
  const castShadow = `<ellipse cx="165" cy="114" rx="44" ry="8" fill="#010510" opacity=".5" filter="${b4}"/>`;
  const bottomShade = `<ellipse cx="165" cy="104" rx="46" ry="9" fill="#1a1208" opacity=".28" filter="${b2}"/>`;
  const svg = `<defs>@@D:${g.p}@@</defs>${castShadow}${layers}${bottomShade}${inner}`;
  return { x: 112, y: 10, w: 106, h: 116, s: 4.5, svg, q: .9 };
};

// vector eyes (kept live: pupil look + blink). S = lib.Sym-like with .lin/.rad/.ell/.def
exports.eyes = (S) => EYES_SVG(S);
function EYES_SVG(S) {
  const one = ([x, y, sd], k) => {
    const o = sd, ox = x + o * 3.7, ix = x - o * 3.7; // outer / inner corner x
    const upper = `M${f(ix)} ${f(y + .55)}C${f(x - o * 2.2)} ${f(y - 1.9)} ${f(x + o * 1.6)} ${f(y - 2.5)} ${f(ox)} ${f(y - .5)}`;
    const lower = `C${f(x + o * 2.4)} ${f(y + 1.5)} ${f(x - o * 1.8)} ${f(y + 1.9)} ${f(ix)} ${f(y + .55)}Z`;
    const shape = upper + lower;
    const cl = S.clip(`<path d="${shape}"/>`);
    const scl = S.lin(0, y - 2.5, 0, y + 1.9, [[0, '#a89a92'], [.4, '#dccfc6'], [1, '#e2d4cb']]);
    const iris = S.rad(x, y, 2.5, [[0, '#0b1a22'], [.34, '#274a5a'], [.62, '#58889a'], [.86, '#6a9aa8'], [1, '#1f3844']]);
    return `<g class="cEye${k ? 'R' : 'L'}"><path d="${shape}" fill="${scl}"/><g clip-path="${cl}">
  <g class="cPup"><circle cx="${f(x)}" cy="${f(y - .15)}" r="2.05" fill="${iris}"/><circle cx="${f(x)}" cy="${f(y - .15)}" r=".85" fill="#03080c"/>
   <path d="M${f(x - 1.7)} ${f(y - .6)}l1 .3M${f(x + 1.6)} ${f(y - .7)}l-1 .3M${f(x - .2)} ${f(y + 1.5)}v-.9" stroke="#b8e4f0" stroke-width=".18" opacity=".6"/>
   <ellipse cx="${f(x - .85)}" cy="${f(y - 1)}" rx=".5" ry=".4" fill="#fff" opacity=".95"/><circle cx="${f(x + .9)}" cy="${f(y + .7)}" r=".26" fill="#fff" opacity=".7"/></g>
  <path d="M${f(ix - 1)} ${f(y - 2.3)}Q${f(x)} ${f(y - 3.6)} ${f(ox + 1)} ${f(y - 2.3)}L${f(ox + 1)} ${f(y - .8)}Q${f(x)} ${f(y - 1.6)} ${f(ix - 1)} ${f(y - .8)}Z" fill="#2a1410" opacity=".5"/>
  <ellipse cx="${f(ix + o * .5)}" cy="${f(y + .4)}" rx=".7" ry=".5" fill="#c9786c" opacity=".7"/></g>
  <path d="${upper}" fill="none" stroke="#1c0d09" stroke-width=".75"/><path d="M${f(ox - o * .3)} ${f(y - .6)}q${f(o * .9)} ${f(-.1)} ${f(o * 1.1)} ${f(-.8)}" stroke="#1c0d09" stroke-width=".45" fill="none"/>
  <path d="M${f(ix + o * .6)} ${f(y + .9)}C${f(x - o * 1.4)} ${f(y + 1.8)} ${f(x + o * 1.5)} ${f(y + 1.8)} ${f(ox - o * .3)} ${f(y + .5)}" fill="none" stroke="#8a4c40" stroke-width=".3" opacity=".7"/></g>`;
  };
  const lid = ([x, y, sd]) => { const o = sd, ox = x + o * 4.4, ix = x - o * 4.4; return `<path d="M${f(ix)} ${f(y + .5)}C${f(x - o * 2.2)} ${f(y - 2.3)} ${f(x + o * 1.6)} ${f(y - 2.9)} ${f(ox)} ${f(y - .5)}C${f(x + o * 2.4)} ${f(y + 1.3)} ${f(x - o * 1.8)} ${f(y + 1.7)} ${f(ix)} ${f(y + .5)}Z" fill="${S.lin(0, y - 3, 0, y + 2, [[0, '#d8a07e'], [1, '#e8b08c']])}"/><path d="M${f(ix)} ${f(y + .5)}Q${f(x)} ${f(y + 2)} ${f(ox)} ${f(y - .4)}" fill="none" stroke="#1c0d09" stroke-width=".8"/>`; };
  return { eyes: exports.EYES.map(one).join(''), lids: exports.EYES.map(lid).join('') };
}
