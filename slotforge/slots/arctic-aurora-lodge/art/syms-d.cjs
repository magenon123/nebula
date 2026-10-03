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
   <!-- bevel frost bits -->
   <path d="M30 ${bw * .5}l3 -.1 1.6 .9M64 ${bw * .45}l5 0M10 40l.2 4M92 62l0 6" stroke="#fff" stroke-opacity=".6" stroke-width=".6" stroke-linecap="round"/>
  </g>
  <rect x="${i0}" y="${i0}" width="${i1 - i0}" height="${i1 - i0}" rx="3" fill="${inG}"/>
  <g clip-path="${win}">
   <rect x="${i0}" y="${i0}" width="${i1 - i0}" height="${i1 - i0}" fill="${glow}"/>
   ${bub}
   <use href="#s${n}" x="${i0 + 1}" y="${i0 + 1}" width="${i1 - i0 - 2}" height="${i1 - i0 - 2}"/>
   <rect x="${i0}" y="${i0}" width="${i1 - i0}" height="${i1 - i0}" fill="${S.lin(0, i0, 0, i1, [[0, '#cfeaff', .16], [.5, '#9fd0ff', .05], [1, '#6aa8ff', .2]])}"/>
   ${veins}
   <rect x="${i0}" y="${i0}" width="${i1 - i0}" height="${i1 - i0}" fill="${sh}"/>
   <path d="M${i0} ${i0}H${i1}V${i0 + 3}H${i0}Z" fill="${inSh}"/>
   <path d="M${i0} ${i0}V${i1}H${i0 + 3}V${i0}Z" fill="${inSh}"/>
   <path d="M${i1} ${i1}H${i0}V${i1 - 3}H${i1}Z" fill="${inShB}"/>
   <rect class="a-shine" x="-40" y="${i0}" width="22" height="${i1 - i0}" fill="#fff" opacity="0" transform="skewX(-20)" style="mix-blend-mode:screen"/>
  </g>
  <rect x="${i0}" y="${i0}" width="${i1 - i0}" height="${i1 - i0}" rx="3" fill="none" stroke="#02061a" stroke-opacity=".7" stroke-width=".8"/>
  <rect x=".4" y=".4" width="99.2" height="99.2" rx="6.6" fill="none" stroke="#02061a" stroke-opacity=".55" stroke-width=".8"/></g>`);
  S.anim('blk', { 0: 'transform:none', 14: 'transform:scale(1.025)', 30: 'transform:scale(.99)', 46: 'transform:scale(1.015)', 70: 'transform:none', 100: 'transform:none' }, { origin: '50% 50%' });
  S.anim('shine', { 0: 'opacity:0;transform:translateX(0) skewX(-20deg)', 22: 'opacity:0', 30: 'opacity:.85', 82: 'opacity:.85;transform:translateX(170px) skewX(-20deg)', 83: 'opacity:0', 100: 'opacity:0;transform:translateX(170px) skewX(-20deg)' }, { origin: '0 0' });
  S.vars = function () { return this.anims.map(a => `--k${this.id.replace(/\D/g, '')}_${a.cls}:${this.id}_${a.cls}`); };
  return S;
}
for (let n = 0; n <= 8; n++) { exports[`b2_${n}`] = () => block(n, 2); exports[`b3_${n}`] = () => block(n, 3); }
