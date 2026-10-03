// low symbols: s0 date bowl, s1 dallah, s2 glass lantern. 128x128, light from the right.
const { Sym, OL, f, star4, shadow, cab } = require('./lib.cjs');
const R = {};

// ---------- s0 DATE BOWL ----------
R.s0 = () => {
  const S = new Sym('s0');
  S.defs = `<linearGradient id="§cb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0c2160"/><stop offset=".5" stop-color="#2760c8"/><stop offset=".85" stop-color="#6fa8ff"/><stop offset="1" stop-color="#3a78e0"/></linearGradient>
<linearGradient id="§in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0a14"/><stop offset="1" stop-color="#4a2418"/></linearGradient>
<clipPath id="§bc"><path d="M18,70 A46,11 0 0 0 110,70 C110,100 90,114 64,114 C38,114 18,100 18,70Z"/></clipPath>`;
  const dates = (arr, cls) => `<g class="${cls}">` + arr.map(([x, y, r, s]) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s || 1})"><ellipse rx="8.6" ry="5.8" fill="url(#mDate)" stroke="#1c0a06" stroke-width="1"/><path d="M-5,-1.5 Q0,-4.2 5,-1.8" fill="none" stroke="#e8b886" stroke-width="1" opacity=".5"/><ellipse cx="2.6" cy="-2" rx="3" ry="1.3" fill="#fff" opacity=".7" transform="rotate(-18)"/><path d="M-8.4,0 q1.4,1 .8,2.2" fill="none" stroke="#1c0a06" stroke-width=".8"/></g>`).join('') + `</g>`;
  let lozenges = '';
  for (let i = -3; i <= 3; i++) {
    const th = i * .44, x = 64 + 47 * Math.sin(th), w = Math.cos(th);
    lozenges += `<path d="M${f(x)},82 l${f(5.8 * w)},9 l${f(-5.8 * w)},9 l${f(-5.8 * w)},-9z" fill="url(#§cb)" stroke="#0a1a4a" stroke-width=".8"/><path d="M${f(x)},86.5 l${f(2.4 * w)},4.5 l${f(-2.4 * w)},4.5 l${f(-2.4 * w)},-4.5z" fill="#fff" opacity=".9"/>`;
  }
  S.body = `<g transform="translate(0 -5)">
${shadow(64, 121, 46, 6)}
<g class="a-bowl">
<ellipse cx="64" cy="70" rx="46" ry="11" fill="url(#§in)" stroke="${OL}" stroke-width="1.6"/>
${dates([[44, 62, -20], [64, 60, 8], [84, 62, 24]], 'a-d1')}
${dates([[36, 56, -8], [54, 53, 18], [74, 52, -14], [92, 57, 12]], 'a-d2')}
${dates([[48, 45, -24, .95], [66, 41, 10, .95], [82, 46, 28, .95]], 'a-d3')}
<g class="a-fig"><ellipse cx="62" cy="32" rx="10.5" ry="9.5" fill="url(#mFig)" stroke="#1c0a1c" stroke-width="1.1"/><path d="M62,22.8 q.8,-4 3.6,-5.4" fill="none" stroke="#3a5a1c" stroke-width="2" stroke-linecap="round"/><path d="M55,30 Q60,26 66,28" fill="none" stroke="#e8b0e0" stroke-width="1.2" opacity=".6"/><ellipse cx="66" cy="28.5" rx="2.8" ry="1.5" fill="#fff" opacity=".7" transform="rotate(-25 66 28.5)"/><path d="M62,41 q0,1.6 1,2.4" stroke="#4a2a1c" stroke-width="1" fill="none"/></g>
<path d="M82,38 q10,-10 20,-6 q-8,10 -20,6z" fill="#2fa86a" stroke="#0c3a22" stroke-width="1"/><path d="M84,37 q8,-6 16,-5" fill="none" stroke="#b8ffc8" stroke-width="1" opacity=".8"/>
<path d="M18,70 A46,11 0 0 0 110,70 C110,100 90,114 64,114 C38,114 18,100 18,70Z" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/>
<path d="M18,70 A46,11 0 0 0 110,70 C110,100 90,114 64,114 C38,114 18,100 18,70Z" fill="url(#mCeramic)"/>
<g clip-path="url(#§bc)">
 <path d="M10,72 Q64,92 118,72 L118,80 Q64,100 10,80Z" fill="url(#§cb)"/>
 <path d="M10,72 Q64,92 118,72" fill="none" stroke="#e8b83a" stroke-width="1.6"/><path d="M10,80.5 Q64,100.5 118,80.5" fill="none" stroke="#e8b83a" stroke-width="1.3"/>
 ${lozenges}
 <path d="M10,102 Q64,121 118,102 L118,126 L10,126Z" fill="url(#§cb)"/>
 <rect x="10" y="60" width="38" height="70" fill="url(#mShadeL)"/>
 <path d="M96,76 C108,90 100,106 80,112" fill="none" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/>
 <ellipse cx="64" cy="118" rx="60" ry="16" fill="#ffb25e" opacity=".22"/>
</g>
<path d="M18,70 A46,11 0 0 0 110,70" fill="none" stroke="url(#mGoldV)" stroke-width="3.4"/><path d="M19,69.5 A45.5,10.5 0 0 0 109,69.5" fill="none" stroke="#fff4b8" stroke-width="1" opacity=".75"/>
<path d="M18,70 A46,11 0 0 1 110,70" fill="none" stroke="url(#mGoldV)" stroke-width="3.4" opacity=".0"/>
<path d="M44,112 h40 l-3,7 h-34z" fill="url(#mGold)" stroke="${OL}" stroke-width="1.6" stroke-linejoin="round"/>
</g>
<g class="a-spk">${star4(86, 30, 7)}${star4(40, 62, 4.5, '#fff', .9)}</g>
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
  S.defs = `<clipPath id="§bd"><path d="M48,114 C47,98 54,80 60,64 L62,54 L84,54 L86,64 C92,80 100,98 98,114 Q73,122 48,114Z"/></clipPath>
<linearGradient id="§st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c0"/><stop offset=".5" stop-color="#ffd668"/><stop offset="1" stop-color="#e79a2c"/></linearGradient>`;
  let eng = '';
  for (let i = 0; i < 9; i++) { const x = 52 + i * 5.4; eng += `<path d="M${x},89 l2.7,-5 l2.7,5 l-2.7,5z" fill="none" stroke="#3a1408" stroke-width="1" opacity=".7"/>`; }
  let eng2 = '';
  for (let i = 0; i < 6; i++) { const x = 59 + i * 5; eng2 += `<circle cx="${x + 2}" cy="69.4" r="1.4" fill="#3a1408" opacity=".65"/>`; }
  S.body = `<g transform="translate(-2 -2)">${shadow(70, 119, 42, 5)}
<g class="a-pot">
<!-- handle -->
<path d="M84,60 C112,56 118,82 104,100 C100,104 96,106 92,106" fill="none" stroke="${OL}" stroke-width="9" stroke-linecap="round"/><path d="M84,60 C112,56 118,82 104,100 C100,104 96,106 92,106" fill="none" stroke="url(#mBrass)" stroke-width="5.6" stroke-linecap="round"/><path d="M86,60.5 C110,58 115,80 102,97" fill="none" stroke="#fff6c0" stroke-width="1.6" opacity=".8" stroke-linecap="round"/>
<!-- spout (beak) -->
<path d="M56,96 C40,94 30,82 28,64 C27,54 20,50 14,44 L11,50 C15,54 16,58 16,64 C17,86 32,106 58,110Z" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/>
<path d="M56,96 C40,94 30,82 28,64 C27,54 20,50 14,44 L11,50 C15,54 16,58 16,64 C17,86 32,106 58,110Z" fill="url(#mCopper)"/>
<path d="M28,64 C27,54 20,50 14,44" fill="none" stroke="#ffe0b0" stroke-width="1.6" opacity=".75" stroke-linecap="round"/>
<path d="M19,62 C21,82 32,98 54,106" fill="none" stroke="#3a1408" stroke-width="2" opacity=".45"/>
<path d="M12.6,46.6 l5.4,3.4" stroke="url(#mBrass)" stroke-width="4" stroke-linecap="round"/><ellipse cx="12.6" cy="46.2" rx="3.4" ry="1.7" fill="#1c0a14" transform="rotate(36 12.6 46.2)"/>
<path d="M17,74 q6,5 12,0" fill="none" stroke="url(#mBrass)" stroke-width="3.4"/>
<!-- body -->
<path d="M48,114 C47,98 54,80 60,64 L62,54 L84,54 L86,64 C92,80 100,98 98,114 Q73,122 48,114Z" fill="${OL}" stroke="${OL}" stroke-width="3.4" stroke-linejoin="round"/>
<path d="M48,114 C47,98 54,80 60,64 L62,54 L84,54 L86,64 C92,80 100,98 98,114 Q73,122 48,114Z" fill="url(#mCopper)"/>
<g clip-path="url(#§bd)">
 <rect x="44" y="50" width="22" height="76" fill="#2a0e04" opacity=".32"/>
 <path d="M90,70 C96,86 98,100 96,114" fill="none" stroke="#fff3d6" stroke-width="5" opacity=".75" stroke-linecap="round"/><path d="M80,66 C86,86 90,100 90,114" fill="none" stroke="#ffe8c8" stroke-width="2.2" opacity=".5"/>
 <path d="M44,100 Q73,110 102,100 L102,108 Q73,118 44,108Z" fill="url(#mBrass)" stroke="${OL}" stroke-width="1.3"/>
 <path d="M44,100.8 Q73,110.8 102,100.8" fill="none" stroke="#fff8c8" stroke-width="1" opacity=".8"/>
 <path d="M50,80 Q73,88 96,80 L96,86 Q73,94 50,86Z" fill="url(#mBrass)" stroke="${OL}" stroke-width="1.2"/>
 ${eng}
 <path d="M58,64 Q73,70 88,64 L88,70 Q73,76 58,70Z" fill="url(#mBrass)" stroke="${OL}" stroke-width="1.1"/>
 <path d="M44,112 Q73,124 102,112 L102,130 L44,130Z" fill="#2a0e04" opacity=".35"/>
 <ellipse cx="73" cy="124" rx="40" ry="10" fill="#ffb25e" opacity=".25"/>
</g>
<path d="M62,54 Q73,59 84,54" fill="none" stroke="${OL}" stroke-width="2"/>
<!-- neck and lid -->
<path d="M60,56 L86,56 L84,44 L62,44Z" fill="${OL}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/><path d="M61.5,54.5 L84.5,54.5 L83,45.5 L63,45.5Z" fill="url(#mBrass)"/>
<path d="M56,46 C56,30 90,30 90,46 Q73,52 56,46Z" fill="${OL}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/><path d="M58,45 C58,32 88,32 88,45 Q73,50.5 58,45Z" fill="url(#mCopper)"/><path d="M58,45 C58,32 88,32 88,45" fill="none" stroke="#2a0e04" stroke-width="1" opacity=".0"/>
<path d="M63,40 C66,34 76,32 84,36" fill="none" stroke="#fff3d6" stroke-width="2" opacity=".8" stroke-linecap="round"/>
<path d="M58,45.4 Q73,51 88,45.4" fill="none" stroke="url(#mBrass)" stroke-width="2.4"/>
<rect x="70" y="26" width="6" height="8" rx="2" fill="url(#mBrass)" stroke="${OL}" stroke-width="1.2"/><circle cx="73" cy="23" r="4.6" fill="url(#mBrass)" stroke="${OL}" stroke-width="1.3"/><circle cx="71.6" cy="21.6" r="1.5" fill="#fff" opacity=".9"/>
${eng2.replace(/cy="69.4"/g, 'cy="67.4"').replace(/opacity="\.65"/g, 'opacity="0"')}
<!-- inlay jewels -->
${cab(73, 94, 3.4, 3, 'mRuby', OL, .8)}
</g>
<!-- pour: a ribbon of liquid gold from the beak and coins -->
<g class="a-pour"><path d="M11,50 C8,66 14,82 10,100 C9,108 11,114 10,120" fill="none" stroke="#fff0a0" stroke-width="3.4" stroke-linecap="round"/><path d="M11,50 C8,66 14,82 10,100 C9,108 11,114 10,120" fill="none" stroke="#f5b23a" stroke-width="6" stroke-linecap="round" opacity=".55"/><circle cx="10" cy="106" r="2.6" fill="#ffe08a"/><circle cx="14" cy="92" r="2" fill="#fff6c8"/></g>
<g class="a-steam"><path d="M70,18 C64,10 78,6 72,-2" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".6"/><path d="M80,20 C76,12 86,8 82,2" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".5"/></g>
<g class="a-spk">${star4(100, 46, 7)}${star4(26, 108, 4.5, '#fff', .9)}</g>
</g>`;
  S.anim('pot', '60% 92%', 1.3, null, '0%{transform:none}18%{transform:rotate(-13deg)}62%{transform:rotate(-13deg)}80%{transform:rotate(3deg)}90%{transform:rotate(-1deg)}100%{transform:none}');
  S.anim('pour', '50% 0%', 1.3, 'ease-out', '0%,16%{opacity:0;transform:scaleY(0)}30%{opacity:1;transform:scaleY(1)}62%{opacity:1;transform:scaleY(1)}78%,100%{opacity:0;transform:scaleY(1) translateY(24px)}');
  S.anim('steam', '50% 100%', 1.3, 'ease-out', '0%{opacity:0;transform:translateY(8px) scale(.6)}30%{opacity:1}100%{opacity:0;transform:translateY(-16px) scale(1.3)}');
  S.anim('spk', '50% 50%', 1.3, null, '0%,35%{opacity:0;transform:scale(.2)}55%{opacity:1;transform:scale(1.5) rotate(20deg)}85%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  return S;
};

// ---------- s2 GLASS LANTERN ----------
R.s2 = () => {
  const S = new Sym('s2');
  S.defs = `<linearGradient id="§p1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset=".4" stop-color="#f29a1c"/><stop offset="1" stop-color="#8a3a04"/></linearGradient>
<linearGradient id="§p2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb0c8"/><stop offset=".4" stop-color="#e0245a"/><stop offset="1" stop-color="#5a0a2c"/></linearGradient>
<linearGradient id="§p3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8fff6"/><stop offset=".4" stop-color="#18b8c8"/><stop offset="1" stop-color="#064866"/></linearGradient>
<linearGradient id="§ir" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0c0614"/><stop offset=".6" stop-color="#2a1a34"/><stop offset="1" stop-color="#7a5a6a"/></linearGradient>
<radialGradient id="§gw" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3b8" stop-opacity=".95"/><stop offset=".5" stop-color="#ffb23a" stop-opacity=".5"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>`;
  const IR = '#1a0c26';
  S.body = `${shadow(64, 119, 30, 4)}
<g class="a-glow"><circle cx="64" cy="66" r="52" fill="url(#§gw)"/></g>
<g class="a-swing">
<!-- hanging ring and chain -->
<circle cx="64" cy="9" r="6.4" fill="none" stroke="${IR}" stroke-width="4.2"/><circle cx="64" cy="9" r="6.4" fill="none" stroke="url(#mBrass)" stroke-width="2.2"/>
<path d="M64,15.4 v6" stroke="${IR}" stroke-width="3.4"/>
<!-- cap -->
<path d="M26,46 C28,34 48,26 64,16 C80,26 100,34 102,46Z" fill="${IR}" stroke="${IR}" stroke-width="3" stroke-linejoin="round"/>
<path d="M28,45 C30,35 48,28 64,18.5 C80,28 98,35 100,45Z" fill="url(#mBrass)"/>
<path d="M28,45 C30,35 48,28 64,18.5 C80,28 98,35 100,45Z" fill="url(#mShadeV)"/>
<path d="M64,18.5 C80,28 98,35 100,45 L90,45 C88,36 78,30 64,22Z" fill="#fff4b8" opacity=".5"/>
<path d="M28,45 C30,35 48,28 64,18.5" fill="none" stroke="#5a3a10" stroke-width="1.2" opacity=".6"/>
${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${40 + i * 8}" cy="${41 - Math.abs(i - 3) * 1.2}" r="1.7" fill="#ffe8a0"/>`).join('')}
<path d="M24,44 h80 v6 h-80z" fill="${IR}"/><path d="M26,45.4 h76 v3.2 h-76z" fill="url(#mBrass)"/>
<!-- glass panes -->
<g>
 <path d="M30,92 V60 Q30,52 38,50 L50,54 V93Z" fill="url(#§p1)"/>
 <path d="M50,94 V56 Q50,46 64,40 Q78,46 78,56 V94Z" fill="url(#§p2)"/>
 <path d="M78,93 V54 L90,50 Q98,52 98,60 V92Z" fill="url(#§p3)"/>
 <path d="M68,42 Q78,47 78,56 V94 L72,94 L72,58 Q71,48 66,42Z" fill="#fff" opacity=".34"/>
 <path d="M84,52 L92,50 Q96,52 96,58 V70 Z" fill="#fff" opacity=".45"/><path d="M43,56 L49,58 V76 Z" fill="#fff" opacity=".35"/>
 <g class="a-g1"><path d="M30,92 V60 Q30,52 38,50 L50,54 V93Z" fill="#fff"/></g><g class="a-g2"><path d="M50,94 V56 Q50,46 64,40 Q78,46 78,56 V94Z" fill="#fff"/></g><g class="a-g3"><path d="M78,93 V54 L90,50 Q98,52 98,60 V92Z" fill="#fff"/></g>
 <path d="M30,60 H98 M30,76 H98" stroke="${IR}" stroke-width="0" />
</g>
<!-- iron frame -->
<g fill="none" stroke="${IR}" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.6">
 <path d="M30,94 V60 Q30,52 38,50 L50,54 V94"/><path d="M50,94 V56 Q50,46 64,40 Q78,46 78,56 V94"/><path d="M78,94 V54 L90,50 Q98,52 98,60 V94"/>
 <path d="M30,94 H98"/><path d="M30,56 Q40,52 50,56 Q64,50 78,56 Q88,52 98,56" stroke-width="2.4"/>
</g>
<path d="M78,58 V93 M98,62 V92" stroke="#b08a9a" stroke-width="1.2" opacity=".8"/>
<path d="M49,57 V93 M29,62 V92" stroke="#000" stroke-width="1" opacity=".25"/>
<!-- base -->
<path d="M26,94 H102 L94,108 Q64,118 34,108Z" fill="${IR}" stroke="${IR}" stroke-width="3" stroke-linejoin="round"/>
<path d="M30,95.6 H98 L91,106 Q64,115 37,106Z" fill="url(#mBrass)"/><path d="M30,95.6 H98 L91,106 Q64,115 37,106Z" fill="url(#mShadeV)"/>
<path d="M92,98 L88,106" stroke="#fff6c8" stroke-width="1.6" opacity=".8"/>
${[0, 1, 2, 3, 4].map(i => `<circle cx="${42 + i * 11}" cy="${102 + (i % 2 ? 1.5 : 0) + Math.abs(i - 2) * -.4}" r="1.7" fill="#3a2008"/>`).join('')}
<path d="M64,112 v6" stroke="${IR}" stroke-width="3.4"/><circle cx="64" cy="120" r="3.8" fill="url(#mBrass)" stroke="${IR}" stroke-width="1.4"/>
<circle cx="64" cy="64" r="0" />
</g>
<g class="a-spk">${star4(100, 40, 7)}${star4(26, 86, 4.5, '#fff', .9)}</g>`;
  S.anim('swing', '50% 0%', 1.2, 'ease-in-out', '0%{transform:none}16%{transform:rotate(11deg)}36%{transform:rotate(-10deg)}56%{transform:rotate(7deg)}76%{transform:rotate(-3.5deg)}100%{transform:none}');
  S.anim('glow', '50% 50%', 1.2, 'ease-out', '0%{opacity:0;transform:scale(.6)}30%{opacity:1;transform:scale(1)}70%{opacity:.8}100%{opacity:0;transform:scale(1.15)}');
  S.anim('g1', '50% 50%', 1.2, 'linear', '0%,10%{opacity:0}22%{opacity:.7}44%,100%{opacity:0}');
  S.anim('g2', '50% 50%', 1.2, 'linear', '0%,22%{opacity:0}36%{opacity:.7}58%,100%{opacity:0}');
  S.anim('g3', '50% 50%', 1.2, 'linear', '0%,34%{opacity:0}48%{opacity:.7}70%,100%{opacity:0}');
  S.anim('spk', '50% 50%', 1.2, null, '0%,30%{opacity:0;transform:scale(.2)}50%{opacity:1;transform:scale(1.5) rotate(20deg)}80%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  return S;
};
module.exports = R;
