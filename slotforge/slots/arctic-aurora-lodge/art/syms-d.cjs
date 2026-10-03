// Giant blocks: one carved ice block per pay symbol, in 2x2 (b2_N, viewBox 100) and 3x3 (b3_N). The symbol is frozen inside.
const { Sym, f, rng } = require('./lib.cjs');
const TIERS = [
  { A: '#244a86', B: '#08193a', G: 'rgba(90,160,255,.55)', e: ['#f4fcff', '#bfe4ff', '#6f9ee0', '#2c4a9a'] },   // low
  { A: '#14586a', B: '#06222f', G: 'rgba(70,230,190,.5)', e: ['#f2fffb', '#b4fff0', '#4cc0b8', '#1a6a78'] },     // mid
  { A: '#3a2c86', B: '#10104a', G: 'rgba(170,120,255,.55)', e: ['#faf4ff', '#dccaff', '#9a78f0', '#4a2fa8'] },    // high
  { A: '#1d4f94', B: '#0a2252', G: 'rgba(100,255,210,.55)', e: ['#ffffff', '#cdf6ff', '#7a9cf0', '#4a38b8'] },    // top
];
const tierOf = n => n <= 2 ? 0 : n <= 5 ? 1 : n <= 7 ? 2 : 3;
function block(n, size) {
  const S = new Sym('b' + size + 'x' + n); S.sid = `b${size}_${n}`;
  const t = TIERS[tierOf(n)], bw = size === 3 ? 7 : 9, R = rng(100 + n * 7 + size);
  const i0 = bw, i1 = 100 - bw;
  const topG = S.lin(0, 0, 0, bw, [[0, t.e[0]], [1, t.e[1]]]), leftG = S.lin(0, 0, bw, 0, [[0, t.e[1]], [1, t.e[2]]]);
  const rightG = S.lin(100 - bw, 0, 100, 0, [[0, t.e[2]], [1, t.e[3]]]), botG = S.lin(0, 100 - bw, 0, 100, [[0, t.e[3]], [1, '#0b1640']]);
  const inG = S.lin(0, i0, 0, i1, [[0, t.A], [1, t.B]]);
  const glow = S.ell(50, 96, 52, 40, [[0, t.G], [1, 'rgba(0,0,0,0)']]);
  const inSh = S.lin(i0, i0, i0 + 14, i0 + 14, [[0, '#000', .6], [1, '#000', 0]]);
  const inShB = S.lin(i1, i1, i1 - 10, i1 - 10, [[0, '#9fd8ff', .35], [1, '#9fd8ff', 0]]);
  const sh = S.lin(0, 0, 100, 100, [[0, '#fff', .0], [.42, '#fff', 0], [.5, '#fff', .22], [.58, '#fff', 0], [1, '#fff', 0]]);
  // frost veins inside the ice
  let veins = ''; for (let k = 0; k < (size === 3 ? 9 : 6); k++) { let x = R() * 100, y = R() * 100; let d = `M${f(x)} ${f(y)}`; for (let j = 0; j < 4; j++) { x += (R() - .5) * 34; y += (R() - .3) * 26; d += `L${f(x)} ${f(y)}`; } veins += `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${(.1 + R() * .12).toFixed(2)}" stroke-width="${(.35 + R() * .4).toFixed(2)}"/>`; }
  let bub = ''; for (let k = 0; k < 14; k++) bub += `<circle cx="${f(i0 + R() * (i1 - i0))}" cy="${f(i0 + R() * (i1 - i0))}" r="${(.3 + R() * .7).toFixed(2)}" fill="#fff" opacity="${(.25 + R() * .35).toFixed(2)}"/>`;
  const win = S.clip(`<rect x="${i0}" y="${i0}" width="${i1 - i0}" height="${i1 - i0}" rx="3"/>`);
  const out = S.clip('<rect x="0" y="0" width="100" height="100" rx="7"/>');
  const W = i1 - i0, cx = (i0 + i1) / 2, ux = i0 + 1, uw = W - 2;
  // refracted ghost: bigger, shifted, dimmer copy = the symbol seen through thick ice
  const gx = 2.4, gy = 3.2, gs = 1.045;
  const tintG = S.lin(0, i0, 0, i1, [[0, '#7ab4ff', .5], [.55, '#4a7ae0', .5], [1, '#2a4ac0', .62]]);
  // caustic network (bottom light pool) + diagonal glass planes
  let caus = ''; for (let k = 0; k < 5; k++) { let d = `M${f(i0 + 2)} ${f(i1 - 6 - k * 6)}`; for (let j = 1; j <= 7; j++) d += `Q${f(i0 + 2 + (j - .5) * W / 7)} ${f(i1 - 6 - k * 6 + (R() - .5) * 7)} ${f(i0 + 2 + j * W / 7)} ${f(i1 - 6 - k * 6 + (R() - .5) * 3)}`; caus += `<path d="${d}" fill="none" stroke="#d8fbff" stroke-opacity="${(.12 + R() * .16).toFixed(2)}" stroke-width="${(.5 + R() * .6).toFixed(2)}"/>`; }
  const planes = `<path d="M${i0 + W * .18} ${i0}L${i0 + W * .42} ${i0}L${i0 + W * .1} ${i1}L${i0} ${i1}L${i0} ${i1 - W * .2}Z" fill="${S.lin(i0, 0, i0 + W * .4, 0, [[0, '#fff', 0], [.5, '#fff', .12], [1, '#fff', 0]])}"/><path d="M${i0 + W * .66} ${i0}L${i0 + W * .76} ${i0}L${i0 + W * .4} ${i1}L${i0 + W * .3} ${i1}Z" fill="#fff" opacity=".06"/>`;
  // bubbles with rims, frost at the corners
  let bubs = ''; for (let k = 0; k < (size === 3 ? 12 : 9); k++) { const r = .7 + R() * R() * 2.4, bx = i0 + 4 + R() * (W - 8), by = i0 + 4 + R() * (W - 8); bubs += `<g opacity="${(.55 + R() * .4).toFixed(2)}"><circle cx="${f(bx)}" cy="${f(by)}" r="${f(r)}" fill="#cfeaff" fill-opacity=".14" stroke="#fff" stroke-opacity=".75" stroke-width=".35"/><circle cx="${f(bx - r * .35)}" cy="${f(by - r * .38)}" r="${f(Math.max(.22, r * .28))}" fill="#fff"/></g>`; }
  let trail = ''; for (let k = 0; k < 2; k++) { const bx = i0 + 8 + R() * (W - 16); for (let j = 0; j < 6; j++) trail += `<circle cx="${f(bx + (R() - .5) * 2)}" cy="${f(i1 - 6 - j * (3 + R() * 4))}" r="${(.3 + R() * .5).toFixed(2)}" fill="#fff" fill-opacity=".6"/>`; }
  let frost = ''; for (const [fx, fy, dx, dy] of [[i0, i0, 1, 1], [i1, i0, -1, 1], [i0, i1, 1, -1], [i1, i1, -1, -1]]) { for (let k = 0; k < 6; k++) { let x = fx, y = fy, d = `M${f(x)} ${f(y)}`; const a = (k / 5) * Math.PI / 2; let L = 5 + R() * 9; x += dx * Math.cos(a) * L; y += dy * Math.sin(a) * L; d += `L${f(x)} ${f(y)}`; frost += `<path d="${d}M${f(x)} ${f(y)}l${f(dx * 2.2)} ${f(dy * -1.2)}M${f(x - dx * Math.cos(a) * L * .5)} ${f(y - dy * Math.sin(a) * L * .5)}l${f(dx * -1.4)} ${f(dy * 2)}" stroke="#fff" stroke-opacity="${(.28 + R() * .3).toFixed(2)}" stroke-width=".45" fill="none" stroke-linecap="round"/>`; } }
  // cracks that light up on a win
  let crk = ''; for (let k = 0; k < 4; k++) { let x = cx + (R() - .5) * W * .5, y = cx + (R() - .5) * W * .5; let d = `M${f(x)} ${f(y)}`; const ang = R() * 6.28; for (let j = 0; j < 5; j++) { x += Math.cos(ang + (R() - .5) * 1.2) * (6 + R() * 9); y += Math.sin(ang + (R() - .5) * 1.2) * (6 + R() * 9); d += `L${f(Math.max(i0 + 1, Math.min(i1 - 1, x)))} ${f(Math.max(i0 + 1, Math.min(i1 - 1, y)))}`; } crk += `<path d="${d}" fill="none" stroke="#bff6ff" stroke-width="1.6" stroke-opacity=".35"/><path d="${d}" fill="none" stroke="#fff" stroke-width=".55" pathLength="100" stroke-dasharray="100" class="a-crk"/>`; }
  const glintPts = [[i0 + W * .22, i0 + W * .24], [i0 + W * .78, i0 + W * .3], [i0 + W * .66, i0 + W * .78], [i0 + W * .3, i0 + W * .7]];
  const glints = glintPts.map(([x, y], k) => `<g class="a-gl${k}" opacity="0"><path d="M${f(x)} ${f(y - 7)}L${f(x + 1.3)} ${f(y - 1.3)}L${f(x + 7)} ${f(y)}L${f(x + 1.3)} ${f(y + 1.3)}L${f(x)} ${f(y + 7)}L${f(x - 1.3)} ${f(y + 1.3)}L${f(x - 7)} ${f(y)}L${f(x - 1.3)} ${f(y - 1.3)}Z" fill="#fff"/><circle cx="${f(x)}" cy="${f(y)}" r="3.4" fill="#cfffff" opacity=".4"/></g>`).join('');
  S.add(`<g class="a-blk"><g clip-path="${out}">
   <rect width="100" height="100" fill="${botG}"/>
   <path d="M0 0H100L${i1} ${i0}H${i0}Z" fill="${topG}"/>
   <path d="M0 0L${i0} ${i0}V${i1}L0 100Z" fill="${leftG}"/>
   <path d="M100 0L100 100L${i1} ${i1}V${i0}Z" fill="${rightG}"/>
   <path d="M0 100L${i0} ${i1}H${i1}L100 100Z" fill="${botG}"/>
   <path d="M0 0L${i0} ${i0}M100 0L${i1} ${i0}M100 100L${i1} ${i1}M0 100L${i0} ${i1}" stroke="#fff" stroke-opacity=".5" stroke-width=".5"/>
   <path d="M4 1.8H96" stroke="#fff" stroke-opacity=".9" stroke-width="1.1" stroke-linecap="round"/>
   <path d="M1.6 8V92" stroke="#fff" stroke-opacity=".5" stroke-width=".9" stroke-linecap="round"/>
   <path d="M98.4 12V90" stroke="#7dffc4" stroke-opacity=".7" stroke-width="1.1" stroke-linecap="round"/>
   <path d="M${i0 + 6} 99H${i1 - 6}" stroke="#7a9cff" stroke-opacity=".5" stroke-width=".8"/>
   <path d="M30 ${bw * .5}l3 -.1 1.6 .9M64 ${bw * .45}l5 0M10 40l.2 4M92 62l0 6" stroke="#fff" stroke-opacity=".6" stroke-width=".6" stroke-linecap="round"/>
   <path d="M${i0 + 4} 5.2H${i1 - 4}" stroke="#aee4ff" stroke-opacity=".5" stroke-width=".6"/><path d="M5.2 ${i0 + 6}V${i1 - 6}" stroke="#fff" stroke-opacity=".35" stroke-width=".5"/>
  </g>
  <rect x="${i0}" y="${i0}" width="${i1 - i0}" height="${i1 - i0}" rx="3" fill="${inG}"/>
  <g clip-path="${win}">
   <rect x="${i0}" y="${i0}" width="${i1 - i0}" height="${i1 - i0}" fill="${glow}"/>
   ${trail}${bub}
   <g class="a-ghost" style="transform-box:fill-box"><g opacity=".42" transform="translate(${gx - (gs - 1) * cx} ${gy - (gs - 1) * cx}) scale(${gs})"><use href="#s${n}" x="${ux}" y="${ux}" width="${uw}" height="${uw}"/></g></g>
   <rect x="${i0}" y="${i0}" width="${W}" height="${W}" fill="#0a2a6a" opacity=".18"/>
   <g opacity=".93"><use href="#s${n}" x="${ux}" y="${ux}" width="${uw}" height="${uw}"/></g>
   <rect class="a-tint" x="${i0}" y="${i0}" width="${W}" height="${W}" fill="${tintG}" style="mix-blend-mode:color" opacity=".5"/>
   <rect x="${i0}" y="${i0}" width="${W}" height="${W}" fill="${S.lin(0, i0, 0, i1, [[0, '#cfeaff', .2], [.5, '#9fd0ff', .06], [1, '#6aa8ff', .22]])}"/>
   ${planes}${caus}${veins}${bubs}${frost}
   <path d="M${i0 + 1.6} ${i0 + 1.6}H${i1 - 1.6}V${i1 - 1.6}H${i0 + 1.6}Z" fill="none" stroke="${S.lin(i0, i0, i1, i1, [[0, '#ffffff', .55], [.5, t.e[2], .25], [1, t.e[1], .6]])}" stroke-width="3.2"/>
   <rect x="${i0}" y="${i0}" width="${i1 - i0}" height="${i1 - i0}" fill="${sh}"/>
   <path d="M${i0} ${i0}H${i1}V${i0 + 3}H${i0}Z" fill="${inSh}"/>
   <path d="M${i0} ${i0}V${i1}H${i0 + 3}V${i0}Z" fill="${inSh}"/>
   <path d="M${i1} ${i1}H${i0}V${i1 - 3}H${i1}Z" fill="${inShB}"/>
   <g class="a-crack" opacity="0">${crk}</g>${glints}
   <rect class="a-shine" x="-40" y="${i0}" width="22" height="${i1 - i0}" fill="#fff" opacity="0" transform="skewX(-20)" style="mix-blend-mode:screen"/>
  </g>
  <rect x="${i0}" y="${i0}" width="${i1 - i0}" height="${i1 - i0}" rx="3" fill="none" stroke="#02061a" stroke-opacity=".7" stroke-width=".8"/>
  <rect class="a-rim" x="1" y="1" width="98" height="98" rx="6.4" fill="none" stroke="${t.e[1]}" stroke-width="3.4" opacity="0"/>
  <rect x=".4" y=".4" width="99.2" height="99.2" rx="6.6" fill="none" stroke="#02061a" stroke-opacity=".55" stroke-width=".8"/></g>`);
  S.anim('blk', { 0: 'transform:none', 8: 'transform:scale(1.03) rotate(-.7deg)', 18: 'transform:scale(.99) rotate(.8deg)', 30: 'transform:scale(1.035) rotate(-.4deg)', 46: 'transform:scale(.995)', 62: 'transform:scale(1.02)', 80: 'transform:none', 100: 'transform:none' }, { origin: '50% 50%' });
  S.anim('shine', { 0: 'opacity:0;transform:translateX(0) skewX(-20deg)', 22: 'opacity:0', 30: 'opacity:.85', 82: 'opacity:.85;transform:translateX(170px) skewX(-20deg)', 83: 'opacity:0', 100: 'opacity:0;transform:translateX(170px) skewX(-20deg)' }, { origin: '0 0' });
  S.anim('ghost', { 0: 'transform:translate(0,0);opacity:1', 22: 'transform:translate(-2.4px,-3px);opacity:.25', 74: 'transform:translate(-2.4px,-3px);opacity:.25', 100: 'transform:translate(0,0);opacity:1' }, { origin: '50% 50%' });
  S.anim('tint', { 0: 'opacity:.5', 20: 'opacity:.04', 76: 'opacity:.04', 100: 'opacity:.5' }, {});
  S.anim('crack', { 0: 'opacity:0', 6: 'opacity:1', 58: 'opacity:.95', 100: 'opacity:0' }, {});
  S.anim('crk', { 0: 'stroke-dashoffset:100', 24: 'stroke-dashoffset:0', 100: 'stroke-dashoffset:0' }, {});
  S.anim('rim', { 0: 'opacity:0', 16: 'opacity:.95', 50: 'opacity:.45', 100: 'opacity:0' }, {});
  [[10, 36], [22, 52], [34, 66], [46, 78]].forEach(([a, b], k) => S.anim('gl' + k, { 0: 'opacity:0;transform:scale(.2) rotate(0deg)', [a]: 'opacity:0;transform:scale(.2) rotate(0deg)', [Math.round((a + b) / 2)]: 'opacity:1;transform:scale(1.3) rotate(30deg)', [b]: 'opacity:0;transform:scale(.5) rotate(60deg)', 100: 'opacity:0' }, { origin: '50% 50%' }));
  S.vars = function () { return this.anims.map(a => `--k${this.id.replace(/\D/g, '')}_${a.cls}:${this.id}_${a.cls}`); };
  return S;
}
for (let n = 0; n <= 8; n++) { exports[`b2_${n}`] = () => block(n, 2); exports[`b3_${n}`] = () => block(n, 3); }
