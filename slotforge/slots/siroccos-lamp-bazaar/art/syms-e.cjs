// REDRAW (weak-spot pass): s0 date bowl, s1 dallah, s6 rolled carpet. Overrides the older versions in syms-a/c (build.cjs loads this last).
const { Sym, OL, f, star4, shadow, cab, rnd, seed } = require('./lib.cjs');
const R = {};
const pt = (x, y) => f(x) + ',' + f(y);

// ---------- DATE (shared helper) ----------
const date = (x, y, r, s = 1, amber = false) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><ellipse rx="9.4" ry="6.2" fill="url(#${amber ? '§dg' : '§dd'})" stroke="#1c0a06" stroke-width="1.1"/><path d="M-6,-2 Q0,-5.4 6,-2.2" fill="none" stroke="${amber ? '#fff0b8' : '#e8b886'}" stroke-width="1.3" opacity=".7" stroke-linecap="round"/><path d="M-5,1.4 q2,-1.6 4,0 M0,2.4 q2.4,-1.6 5,-.2" fill="none" stroke="#1c0a06" stroke-width=".7" opacity=".5"/><ellipse cx="-8.6" cy=".2" rx="1.6" ry="2.4" fill="#2a1408"/><ellipse cx="3" cy="-2.6" rx="2.6" ry="1" fill="#fff" opacity=".35"/></g>`;

// ---------- s0 DATE BOWL ----------
R.s0 = () => {
  const S = new Sym('s0');
  S.defs = `<linearGradient id="§cb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a1c58"/><stop offset=".45" stop-color="#2058c0"/><stop offset=".8" stop-color="#6fa8ff"/><stop offset="1" stop-color="#2c68d8"/></linearGradient>
<linearGradient id="§in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0a14"/><stop offset="1" stop-color="#4a2418"/></linearGradient>
<radialGradient id="§dd" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#d49a60"/><stop offset=".3" stop-color="#7a3c1a"/><stop offset="1" stop-color="#220c06"/></radialGradient>
<radialGradient id="§dg" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#ffd890"/><stop offset=".35" stop-color="#c47a28"/><stop offset="1" stop-color="#4a2208"/></radialGradient>
<clipPath id="§bc"><path d="M16,66 A48,11 0 0 0 112,66 C112,90 92,102 64,102 C36,102 16,90 16,66Z"/></clipPath>`;
  let pet = '', dots = '';
  for (let i = -4; i <= 4; i++) { const x = 64 + i * 11.6, w = Math.cos(i * .24); pet += `<path d="M${f(x)},104 C${f(x - 7 * w)},96 ${f(x - 6 * w)},88 ${f(x)},82 C${f(x + 6 * w)},88 ${f(x + 7 * w)},96 ${f(x)},104Z" fill="url(#mGoldV)" stroke="#0a1a4a" stroke-width=".8"/><path d="M${f(x)},99 C${f(x - 3 * w)},94 ${f(x - 2.4 * w)},90 ${f(x)},87 C${f(x + 2.4 * w)},90 ${f(x + 3 * w)},94 ${f(x)},99Z" fill="#2058c0"/>`; }
  for (let i = -6; i <= 6; i++) { const th = i * .24; dots += `<circle cx="${f(64 + 47 * Math.sin(th))}" cy="${f(71.8 + 5.4 * Math.cos(th) * .9)}" r="1.6" fill="${i % 2 ? '#3ad8c8' : '#fff0a8'}"/>`; }
  let vine = 'M10,79';
  for (let i = 0; i < 8; i++) vine += ` q7,${i % 2 ? 7 : -7} 14,0`;
  S.body = `<g transform="translate(0 -4)">
${shadow(64, 124, 50, 6)}
<g class="a-bowl">
<!-- palm frond behind -->
<g class="a-frond"><path d="M80,64 C92,50 104,36 116,22" fill="none" stroke="#0c3a22" stroke-width="3.6" stroke-linecap="round"/><path d="M80,64 C92,50 104,36 116,22" fill="none" stroke="#3ab070" stroke-width="1.8" stroke-linecap="round"/>
${[0, 1, 2, 3, 4, 5].map(i => { const t = .1 + i * .15, x = 80 + 36 * t, y = 64 - 42 * t; return `<path d="M${f(x)},${f(y)} q${f(-4 - i)},${f(-8)} ${f(-2)},${f(-14 + i)} q${f(5)},${f(5)} ${f(2)},${f(14 - i)}z" fill="#2fa86a" stroke="#0c3a22" stroke-width=".7"/><path d="M${f(x)},${f(y)} q${f(8 + i)},${f(-4)} ${f(15)},${f(2 + i)} q${f(-8)},${f(-1)} ${f(-15)},${f(-2 - i)}z" fill="#58d08a" stroke="#0c3a22" stroke-width=".7"/>`; }).join('')}</g>
<ellipse cx="64" cy="66" rx="48" ry="11" fill="url(#§in)" stroke="${OL}" stroke-width="1.6"/>
<g class="a-d1">${date(34, 62, -16)}${date(52, 63, 6, 1, true)}${date(70, 64, -10)}${date(88, 62, 18, 1, true)}${date(102, 65, 8)}</g>
<g class="a-d2">${date(42, 54, 12)}${date(60, 55, -14, 1, true)}${date(78, 55, 10)}${date(94, 56, -18)}</g>
<g class="a-d3">${date(50, 46, -22, .96)}${date(67, 47, 8, .96, true)}${date(83, 48, 24, .96)}${date(60, 38, 6, .9)}${date(74, 39, -16, .9, true)}</g>
<g class="a-fig"><path d="M64,15 C52,16 50,32 56,38 Q64,44 72,38 C78,32 76,16 64,15Z" fill="url(#mFig)" stroke="#1c0a1c" stroke-width="1.2"/><path d="M64,15 C62,10 66,6 69,5" fill="none" stroke="#3a5a1c" stroke-width="2.2" stroke-linecap="round"/><path d="M58,22 C57,28 59,33 62,36" fill="none" stroke="#f0b8ec" stroke-width="1.6" opacity=".7" stroke-linecap="round"/><ellipse cx="68.4" cy="25" rx="2" ry="3.4" fill="#fff" opacity=".35"/><path d="M64,44 l0,-4" stroke="#e08ac8" stroke-width="1.6"/></g>
<!-- bowl: lapis glaze, white arabesque band, gold lotus, gold pedestal -->
<path d="M52,100 h24 l4,12 h-32z" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/><path d="M53,100 h22 l3.4,11 h-28.8z" fill="url(#mGold)"/><path d="M54,103 h20" stroke="#3a1408" stroke-width="1.2" opacity=".6"/>
<path d="M32,114 Q64,106 96,114 Q64,126 32,114Z" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/><path d="M32,114 Q64,106 96,114 Q64,126 32,114Z" fill="url(#mGoldV)"/><path d="M36,115 Q64,109 92,115" fill="none" stroke="#fff4b8" stroke-width="1.2" opacity=".8"/><path d="M36,117 Q64,123 92,117" fill="none" stroke="#6a3410" stroke-width="1" opacity=".6"/>
${cab(64, 117, 3.6, 2, 'mTurq', OL, .7)}
<path d="M16,66 A48,11 0 0 0 112,66 C112,90 92,102 64,102 C36,102 16,90 16,66Z" fill="${OL}" stroke="${OL}" stroke-width="3.4" stroke-linejoin="round"/>
<path d="M16,66 A48,11 0 0 0 112,66 C112,90 92,102 64,102 C36,102 16,90 16,66Z" fill="url(#§cb)"/>
<g clip-path="url(#§bc)">
 <path d="M6,72 Q64,92 122,72 L122,92 Q64,112 6,92Z" fill="url(#mCeramic)"/>
 <path d="${vine}" transform="translate(-2 4.5)" fill="none" stroke="#1c4aa8" stroke-width="1.8" stroke-linecap="round"/>
 ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<ellipse cx="${12 + i * 14 + 7}" cy="${i % 2 ? 90 : 76}" rx="3.2" ry="1.6" fill="#e0a02c" transform="rotate(${i % 2 ? 40 : -40} ${12 + i * 14 + 7} ${i % 2 ? 90 : 76})"/>`).join('')}
 <path d="M6,72 Q64,92 122,72" fill="none" stroke="url(#mGold)" stroke-width="2"/><path d="M6,92 Q64,112 122,92" fill="none" stroke="url(#mGold)" stroke-width="2"/>
 ${pet}
 <rect x="8" y="58" width="40" height="64" fill="url(#mShadeL)"/>
 <path d="M98,76 C110,88 102,100 82,104" fill="none" stroke="#fff" stroke-width="3.2" opacity=".7" stroke-linecap="round"/>
 <ellipse cx="64" cy="108" rx="60" ry="14" fill="#ffb25e" opacity=".2"/>
</g>
<path d="M16,66 A48,11 0 0 0 112,66" fill="none" stroke="${OL}" stroke-width="5.4"/><path d="M16,66 A48,11 0 0 0 112,66" fill="none" stroke="url(#mGoldV)" stroke-width="3.6"/><path d="M18,65.4 A46,10.6 0 0 0 110,65.4" fill="none" stroke="#fff4b8" stroke-width="1" opacity=".8"/>
${dots}
</g>
<!-- loose dates on the ground -->
${date(14, 112, -20, .8)}${date(114, 112, 14, .8, true)}
<g class="a-spk">${star4(100, 30, 7)}${star4(34, 52, 4.5, '#fff', .9)}</g>
</g>`;
  S.anim('bowl', '50% 90%', 1.1, null, '0%{transform:none}14%{transform:rotate(-6deg) scale(.97,1.03)}30%{transform:rotate(7deg) scale(1.04,.97)}48%{transform:rotate(-4deg)}66%{transform:rotate(2deg)}100%{transform:none}');
  S.anim('d1', '50% 50%', 1.1, null, '0%{transform:none}18%{transform:translateY(-9px)}34%{transform:translateY(0)}50%{transform:translateY(-4px)}64%,100%{transform:none}');
  S.anim('d2', '50% 50%', 1.1, null, '0%,6%{transform:none}24%{transform:translateY(-12px) rotate(-4deg)}42%{transform:translateY(0)}58%{transform:translateY(-5px)}72%,100%{transform:none}');
  S.anim('d3', '50% 50%', 1.1, null, '0%,12%{transform:none}30%{transform:translateY(-15px) rotate(5deg)}50%{transform:translateY(0)}64%{transform:translateY(-5px)}78%,100%{transform:none}');
  S.anim('fig', '50% 100%', 1.1, null, '0%,12%{transform:none}30%{transform:translateY(-17px) scale(1.08)}52%{transform:translateY(0) scale(.96,1.05)}68%{transform:translateY(-4px)}84%,100%{transform:none}');
  S.anim('spk', '50% 50%', 1.1, null, '0%,30%{opacity:0;transform:scale(.2)}50%{opacity:1;transform:scale(1.5) rotate(20deg)}80%{opacity:0;transform:scale(.6) rotate(40deg)}100%{opacity:0}');
  return S;
};

// ---------- s1 DALLAH COFFEE POT ----------
R.s1 = () => {
  const S = new Sym('s1');
  const body = 'M44,112 C36,100 36,84 48,72 C56,64 58,58 58,50 L80,50 C80,58 82,64 90,72 C102,84 102,100 94,112 Q69,122 44,112Z';
  S.defs = `<clipPath id="§bd"><path d="${body}"/></clipPath>
<clipPath id="§sp"><path d="M54,104 C26,106 12,86 16,62 C17,52 12,46 6,40 L12,32 C22,38 30,48 30,62 C30,76 40,84 56,86Z"/></clipPath>`;
  let eng = '';
  for (let i = 0; i < 9; i++) { const x = 44 + i * 6.2; eng += `<path d="M${f(x)},92 l3.1,-5.4 l3.1,5.4 l-3.1,5.4z" fill="none" stroke="#3a1408" stroke-width="1" opacity=".75"/><circle cx="${f(x + 3.1)}" cy="92" r=".9" fill="#ffe08a"/>`; }
  let scr = '';
  for (let i = 0; i < 6; i++) scr += `<path d="M${54 + i * 5},58 q2.4,-3 5,0" fill="none" stroke="#3a1408" stroke-width=".9" opacity=".6"/>`;
  S.body = `<g transform="translate(0 -1)">${shadow(68, 119, 46, 5)}
<g class="a-pot">
<!-- handle -->
<path d="M82,54 C118,46 124,84 104,104 C100,108 96,110 92,110" fill="none" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><path d="M82,54 C118,46 124,84 104,104 C100,108 96,110 92,110" fill="none" stroke="url(#mBrass)" stroke-width="6.4" stroke-linecap="round"/><path d="M85,53.4 C114,48 119,80 102,100" fill="none" stroke="#fff6c0" stroke-width="1.6" opacity=".8" stroke-linecap="round"/>
${cab(113, 70, 2.8, 2.6, 'mTurq', OL, .7)}${cab(110, 88, 2.4, 2.2, 'mRuby', OL, .7)}
<path d="M80,52 c10,-8 22,-8 22,-1" fill="none" stroke="${OL}" stroke-width="4.6" stroke-linecap="round"/><path d="M80,52 c10,-8 22,-8 22,-1" fill="none" stroke="url(#mBrass)" stroke-width="2.6" stroke-linecap="round"/>
<!-- long spout with a bird-head tip -->
<path d="M54,104 C26,106 12,86 16,62 C17,52 12,46 6,40 L12,32 C22,38 30,48 30,62 C30,76 40,84 56,86Z" fill="${OL}" stroke="${OL}" stroke-width="3.2" stroke-linejoin="round"/>
<path d="M54,104 C26,106 12,86 16,62 C17,52 12,46 6,40 L12,32 C22,38 30,48 30,62 C30,76 40,84 56,86Z" fill="url(#mCopper)"/>
<g clip-path="url(#§sp)"><path d="M32,60 C32,76 40,84 58,84" fill="none" stroke="#fff3d6" stroke-width="3" opacity=".7" stroke-linecap="round"/><rect x="0" y="30" width="16" height="80" fill="#2a0e04" opacity=".3"/>
 <path d="M18,92 Q34,98 52,90 L52,98 Q34,106 18,98Z" fill="url(#mBrass)" stroke="${OL}" stroke-width="1"/>
 <path d="M13,72 Q24,78 34,70 L34,76 Q24,84 13,78Z" fill="url(#mBrass)" stroke="${OL}" stroke-width="1"/>
 <path d="M14,58 Q22,62 30,56 L30,60 Q22,66 14,62Z" fill="url(#mBrass)" stroke="${OL}" stroke-width="1"/></g>
<path d="M2,36 C4,30 10,26 14,28 L16,36 L9,43Z" fill="${OL}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/><path d="M3.4,36 C5,31 10,28 13,30 L14.4,36 L9,41Z" fill="url(#mBrass)"/><circle cx="9.6" cy="33.6" r="1.8" fill="#1c0a14"/><path d="M4,37 C3,40 4,43 7,44" fill="none" stroke="${OL}" stroke-width="1.6"/>
<path d="M44,112 L50,106" stroke="none"/>
<!-- body -->
<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="3.6" stroke-linejoin="round"/>
<path d="${body}" fill="url(#mCopper)"/>
<g clip-path="url(#§bd)">
 <rect x="34" y="46" width="22" height="80" fill="#2a0e04" opacity=".34"/>
 <path d="M92,74 C100,88 100,100 96,112" fill="none" stroke="#fff3d6" stroke-width="5.4" opacity=".75" stroke-linecap="round"/><path d="M82,66 C88,84 92,98 92,112" fill="none" stroke="#ffe8c8" stroke-width="2" opacity=".5"/>
 <path d="M32,100 Q69,112 106,100 L106,110 Q69,122 32,110Z" fill="url(#mBrass)" stroke="${OL}" stroke-width="1.3"/><path d="M32,100.8 Q69,112.8 106,100.8" fill="none" stroke="#fff8c8" stroke-width="1" opacity=".8"/>
 <path d="M32,82 Q69,92 106,82 L106,100 Q69,110 32,100Z" fill="#7a2a0c" opacity=".35"/>
 <path d="M32,82 Q69,92 106,82 L106,86 Q69,96 32,86Z" fill="url(#mBrass)" stroke="${OL}" stroke-width="1.2"/>
 ${eng}
 <path d="M54,56 Q69,62 84,56 L84,63 Q69,69 54,63Z" fill="url(#mBrass)" stroke="${OL}" stroke-width="1.1"/>
 ${scr}
 <path d="M52,70 Q69,77 86,70" fill="none" stroke="#3a1408" stroke-width="1" opacity=".5"/>
 <ellipse cx="69" cy="122" rx="44" ry="10" fill="#ffb25e" opacity=".25"/>
</g>
<path d="M58,50 Q69,55 80,50" fill="none" stroke="${OL}" stroke-width="2"/>
${cab(69, 94, 3.8, 3.4, 'mRuby', OL, .8)}${cab(53, 92.6, 2.4, 2.2, 'mTurq', OL, .7)}${cab(85, 92.6, 2.4, 2.2, 'mTurq', OL, .7)}
<!-- neck, collar and conical lid -->
<path d="M56,52 L82,52 L80,40 L58,40Z" fill="${OL}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/><path d="M57.6,50.6 L80.4,50.6 L79,41.4 L59,41.4Z" fill="url(#mBrass)"/>
<path d="M52,42 C52,30 62,28 69,14 C76,28 86,30 86,42 Q69,48 52,42Z" fill="${OL}" stroke="${OL}" stroke-width="2.6" stroke-linejoin="round"/><path d="M54,41 C54,31 63,29 69,17 C75,29 84,31 84,41 Q69,46.4 54,41Z" fill="url(#mCopper)"/>
<path d="M62,38 C64,32 68,28 70,22" fill="none" stroke="#fff3d6" stroke-width="2" opacity=".8" stroke-linecap="round"/><path d="M54,41.4 Q69,47 84,41.4" fill="none" stroke="url(#mBrass)" stroke-width="2.6"/>
<path d="M57,36 Q69,41 81,36" fill="none" stroke="url(#mBrass)" stroke-width="1.6"/>
<path d="M69,14 l0,-4" stroke="${OL}" stroke-width="4" stroke-linecap="round"/><circle cx="69" cy="8" r="4.4" fill="url(#mBrass)" stroke="${OL}" stroke-width="1.3"/><circle cx="67.6" cy="6.6" r="1.4" fill="#fff" opacity=".9"/>
</g>
<g class="a-pour"><path d="M8,40 C4,58 12,76 6,96 C5,106 8,114 6,122" fill="none" stroke="#fff0a0" stroke-width="3.4" stroke-linecap="round"/><path d="M8,40 C4,58 12,76 6,96 C5,106 8,114 6,122" fill="none" stroke="#f5b23a" stroke-width="6" stroke-linecap="round" opacity=".55"/><circle cx="6" cy="108" r="2.6" fill="#ffe08a"/><circle cx="10" cy="118" r="2" fill="#fff4b8"/></g>
<g class="a-steam"><path d="M64,6 C58,-2 72,-6 66,-14" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".6"/><path d="M76,8 C72,0 82,-4 78,-10" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".5"/></g>
<g class="a-spk">${star4(104, 40, 7)}${star4(22, 108, 4.5, '#fff', .9)}</g>
</g>`;
  S.anim('pot', '60% 92%', 1.3, null, '0%{transform:none}18%{transform:rotate(-13deg)}62%{transform:rotate(-13deg)}80%{transform:rotate(3deg)}90%{transform:rotate(-1deg)}100%{transform:none}');
  S.anim('pour', '50% 0%', 1.3, 'ease-out', '0%,16%{opacity:0;transform:scaleY(0)}30%{opacity:1;transform:scaleY(1)}62%{opacity:1;transform:scaleY(1)}78%,100%{opacity:0;transform:scaleY(1) translateY(24px)}');
  S.anim('steam', '50% 100%', 1.3, 'ease-out', '0%{opacity:0;transform:translateY(8px) scale(.6)}30%{opacity:1}100%{opacity:0;transform:translateY(-16px) scale(1.3)}');
  S.anim('spk', '50% 50%', 1.3, null, '0%,35%{opacity:0;transform:scale(.2)}55%{opacity:1;transform:scale(1.5) rotate(20deg)}85%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  return S;
};

// ---------- s6 ROLLED PRAYER CARPET ----------
R.s6 = () => {
  const S = new Sym('s6');
  const ROLL = 'M22,36 Q60,27 98,33 L98,83 Q60,91 22,83 Q12,59 22,36Z';
  S.defs = `<linearGradient id="§rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a8a"/><stop offset=".25" stop-color="#cc2a4c"/><stop offset=".65" stop-color="#7a1238"/><stop offset="1" stop-color="#2a0a30"/></linearGradient>
<linearGradient id="§iv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a78ff"/><stop offset=".3" stop-color="#3a2aa8"/><stop offset="1" stop-color="#120a4a"/></linearGradient>
<linearGradient id="§cy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".2" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
<pattern id="§wv" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="3" height="1.1" fill="#000" opacity=".26"/><rect x="0" y="1.6" width="1.5" height="1.3" fill="#fff" opacity=".09"/></pattern>
<clipPath id="§bc"><path d="${ROLL}"/></clipPath>`;
  const gul = (x, y, s, o = 1) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><path d="M0,-17 L8,-11 L11,0 L8,11 L0,17 L-8,11 L-11,0 L-8,-11Z" fill="url(#§iv)" stroke="#ffd668" stroke-width="1.5"/><path d="M0,-11 L6,0 L0,11 L-6,0Z" fill="url(#§rv)" stroke="#ffe9a0" stroke-width="1"/><path d="M0,-5 L3,0 L0,5 L-3,0Z" fill="#ffd668"/><circle cx="0" cy="0" r="1.2" fill="#7a1238"/><circle cx="0" cy="-14" r="1.3" fill="#ffd668"/><circle cx="0" cy="14" r="1.3" fill="#ffd668"/></g>`;
  const fringe = (x0, y0, dx, dy, n, len, ax, ay) => { let o = ''; for (let i = 0; i < n; i++) { const t = i / (n - 1) - .5, x = x0 + dx * t, y = y0 + dy * t, ex = x + ax + t * 7 * (ax ? Math.sign(ax) : 0), ey = y + ay + t * 7 * (ay ? Math.sign(ay) : 0), w = (i % 3 - 1) * 1.1; o += `<path d="M${pt(x, y)} Q${pt((x + ex) / 2 + w, (y + ey) / 2 + w)} ${pt(ex + w * 1.4, ey)}" fill="none" stroke="#5a2a14" stroke-width="2.5" stroke-linecap="round"/><path d="M${pt(x, y)} Q${pt((x + ex) / 2 + w, (y + ey) / 2 + w)} ${pt(ex + w * 1.4, ey)}" fill="none" stroke="#fff0c0" stroke-width="1.3" stroke-linecap="round"/>`; } return o; };
  // flap polygon (carpet unrolled toward the viewer)
  const FL = [[30, 80], [96, 80], [118, 112], [12, 112]];
  const cx = FL.reduce((a, p) => a + p[0], 0) / 4, cy = FL.reduce((a, p) => a + p[1], 0) / 4;
  const ins = k => FL.map(p => pt(cx + (p[0] - cx) * k, cy + (p[1] - cy) * k)).join(' L');
  let wl = ''; // weave rows on the flap
  S.body = `${shadow(66, 122, 50, 4)}
<g class="a-carp">
<!-- unrolled tongue lying on the floor, fringed -->
<g class="a-flap">
<g>${fringe(65, 112, 106, 0, 17, 9, 0, 8)}</g>
<path d="M${ins(1)}Z" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round" transform="translate(0 0)"/>
<path d="M${ins(1)}Z" fill="url(#§iv)"/>
<path d="M${ins(.93)}Z" fill="none" stroke="#ffd668" stroke-width="1.4"/>
<path d="M${ins(.82)}Z" fill="url(#§rv)"/>
<path d="M${ins(.82)}Z" fill="none" stroke="#ffd668" stroke-width="1.1"/>
<path d="M${ins(.74)}Z" fill="none" stroke="#ffe9a0" stroke-width=".7" stroke-dasharray="2 2"/>
${gul(65, 98, .9)}
<path d="M30,80 L96,80 L118,112 L12,112Z" fill="url(#§wv)"/>
<path d="M96,80 L118,112 L100,112Z" fill="#fff" opacity=".2"/>
<path d="M30,80 L12,112 L40,112Z" fill="#12001a" opacity=".28"/>
<path d="M12,112 L118,112" stroke="#ffd668" stroke-width="1.6"/>
</g>
<g transform="rotate(-5 60 58)">
<!-- fringe poking out of both ends of the roll -->
${fringe(18, 59, 0, 40, 15, 9, -9, 0)}
${fringe(100, 58, 0, 48, 17, 10, 11, 0)}
<!-- roll body -->
<path d="${ROLL}" fill="${OL}" stroke="${OL}" stroke-width="3.4" stroke-linejoin="round"/>
<path d="${ROLL}" fill="url(#§rv)"/>
<g clip-path="url(#§bc)">
 <path d="M10,34 Q60,25 106,31 L106,41 Q60,35 10,44Z" fill="url(#§iv)"/><path d="M10,44 Q60,35 106,41" fill="none" stroke="#ffd668" stroke-width="1.5"/><path d="M10,40 Q60,31 106,37" fill="none" stroke="#ffe9a0" stroke-width=".7" stroke-dasharray="2.2 1.8"/>
 <path d="M10,74 Q60,83 106,75 L106,92 Q60,100 10,92Z" fill="url(#§iv)"/><path d="M10,74 Q60,83 106,75" fill="none" stroke="#ffd668" stroke-width="1.5"/><path d="M10,78 Q60,87 106,79" fill="none" stroke="#ffe9a0" stroke-width=".7" stroke-dasharray="2.2 1.8"/>
 ${gul(57, 59, .98)}${gul(40, 59, .5)}${gul(75, 59, .5)}
 <path d="M12,59 H104" stroke="#ffd668" stroke-width="0"/>
 <rect x="10" y="22" width="110" height="80" fill="url(#§wv)"/>
 <rect x="10" y="22" width="110" height="80" fill="url(#§cy)"/>
 <rect x="10" y="22" width="30" height="80" fill="url(#mShadeL)"/>
 <path d="M24,38 Q60,30 98,36" fill="none" stroke="#fff" stroke-width="2.6" opacity=".5" stroke-linecap="round"/>
</g>
<!-- ties: two gold cords around the roll, a knot with a tassel -->
<path d="M31,31 C38,45 38,72 31,87" fill="none" stroke="${OL}" stroke-width="6.8" stroke-linecap="round"/><path d="M31,31 C38,45 38,72 31,87" fill="none" stroke="url(#mGold)" stroke-width="4.4" stroke-linecap="round"/><path d="M31,31 C38,45 38,72 31,87" fill="none" stroke="#6a3410" stroke-width="4.4" stroke-dasharray="1.2 2.4" opacity=".5"/>
<path d="M82,32 C89,45 89,73 82,89" fill="none" stroke="${OL}" stroke-width="6.8" stroke-linecap="round"/><path d="M82,32 C89,45 89,73 82,89" fill="none" stroke="url(#mGold)" stroke-width="4.4" stroke-linecap="round"/><path d="M82,32 C89,45 89,73 82,89" fill="none" stroke="#6a3410" stroke-width="4.4" stroke-dasharray="1.2 2.4" opacity=".5"/>
<!-- end face: layers of the roll -->
<ellipse cx="98" cy="58" rx="11.4" ry="26" fill="${OL}"/><ellipse cx="98" cy="58" rx="10.4" ry="25" fill="#e0c48e"/>
<path d="${(() => { let d = ''; for (let t = 0; t <= 9.4 * Math.PI; t += .22) { const r = 1 - t / (10.2 * Math.PI); d += (t ? 'L' : 'M') + pt(98 + 9.6 * r * Math.cos(t), 58 + 24 * r * Math.sin(t)); } return d; })()}" fill="none" stroke="#9a1c44" stroke-width="2.6" stroke-linejoin="round"/>
<path d="${(() => { let d = ''; for (let t = 1.6; t <= 9.4 * Math.PI; t += .22) { const r = 1 - t / (10.2 * Math.PI); d += (t > 1.7 ? 'L' : 'M') + pt(98 + 9.6 * r * Math.cos(t), 58 + 24 * r * Math.sin(t)); } return d; })()}" fill="none" stroke="#3a2aa8" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M105,36 C110,50 110,66 105,80" fill="none" stroke="#fff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
<g class="a-tass"><path d="M90,60 C96,64 98,72 96,80" fill="none" stroke="${OL}" stroke-width="3.6" stroke-linecap="round"/><path d="M90,60 C96,64 98,72 96,80" fill="none" stroke="url(#mGold)" stroke-width="2" stroke-linecap="round"/><circle cx="87.4" cy="60" r="4.6" fill="url(#mGold)" stroke="${OL}" stroke-width="1.3"/><circle cx="86" cy="58.6" r="1.4" fill="#fff" opacity=".9"/><path d="M92,95 h10 l-1.4,-9 h-7z" fill="url(#mGold)" stroke="${OL}" stroke-width="1.2" transform="translate(-1 -1)"/><path d="M90,92 l-1,14 M93,93 l0,15 M96,93 l0,15 M99,93 l1,14" stroke="#fff0b0" stroke-width="1.5" stroke-linecap="round" transform="translate(0 -1)"/><path d="M96,80 l-.4,6" stroke="url(#mGold)" stroke-width="2"/></g>
</g>
<g class="a-spk">${star4(108, 26, 7)}${star4(22, 100, 5, '#fff', .9)}</g>
</g>`;
  S.anim('carp', '50% 70%', 1.2, 'ease-in-out', '0%{transform:none}22%{transform:translateY(-7px) rotate(-3deg)}44%{transform:translateY(-3px) rotate(2.5deg)}66%{transform:translateY(-6px) rotate(-1.5deg)}100%{transform:none}');
  S.anim('flap', '50% 0%', 1.2, 'ease-in-out', '0%{transform:none}25%{transform:scale(1.1,.9) skewX(-5deg)}55%{transform:scale(1.06,1.0) skewX(4deg)}80%{transform:scale(1.02,.98)}100%{transform:none}');
  S.anim('tass', '50% 0%', 1.2, 'ease-in-out', '0%{transform:none}20%{transform:rotate(14deg)}45%{transform:rotate(-12deg)}70%{transform:rotate(6deg)}100%{transform:none}');
  S.anim('spk', '50% 50%', 1.2, null, '0%,30%{opacity:0;transform:scale(.2)}50%{opacity:1;transform:scale(1.5) rotate(20deg)}80%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  return S;
};
module.exports = R;
