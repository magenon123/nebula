// high symbols: s6 rolled carpet, s7 crown-turban, s8 genie's lamp (top pay)
const { Sym, OL, f, star4, shadow, cab, rnd, seed } = require('./lib.cjs');
const R = {};

// ---------- s6 ROLLED MAGIC CARPET ----------
R.s6 = () => {
  const S = new Sym('s6');
  S.defs = `<linearGradient id="§rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a8a"/><stop offset=".22" stop-color="#c8284a"/><stop offset=".62" stop-color="#7a1238"/><stop offset="1" stop-color="#2a0a30"/></linearGradient>
<linearGradient id="§iv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a78ff"/><stop offset=".3" stop-color="#3a2aa8"/><stop offset="1" stop-color="#120a4a"/></linearGradient>
<linearGradient id="§fl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a1a3a"/><stop offset=".5" stop-color="#d03a5a"/><stop offset="1" stop-color="#ff8a8a"/></linearGradient>
<clipPath id="§bc"><path d="M26,36 Q62,28 98,34 L98,82 Q62,90 26,82 Q18,59 26,36Z"/></clipPath>
<clipPath id="§fc"><path d="M34,83 C36,98 48,110 70,113 L118,106 C106,102 98,94 96,84Z"/></clipPath>`;
  let med = '';
  for (let i = 0; i < 3; i++) { const x = 42 + i * 22; med += `<path d="M${x},40 L${x + 10},59 L${x},78 L${x - 10},59Z" fill="url(#§iv)" stroke="#ffd668" stroke-width="1.4"/><path d="M${x},47 L${x + 5},59 L${x},71 L${x - 5},59Z" fill="url(#§rv)" stroke="#ffe9a0" stroke-width=".8"/><circle cx="${x}" cy="59" r="2" fill="#ffd668"/><path d="M${x + 11},59 l3,-3 3,3 -3,3z" fill="#3ad8c8" stroke="#0a3a40" stroke-width=".6"/>`; }
  let sp = ''; // end face spiral
  for (let k = 0; k < 5; k++) { const rx = 9.6 - k * 1.8, ry = 25 - k * 4.6; sp += `<ellipse cx="98" cy="58" rx="${f(rx)}" ry="${f(ry)}" fill="none" stroke="${k % 2 ? '#e8c050' : (k % 4 ? '#c8284a' : '#3a2aa8')}" stroke-width="2.4"/>`; }
  let tas = '';
  for (let i = 0; i < 8; i++) { const x = 70 + i * 6.4; tas += `<path d="M${x},112 q${1.2 + (i % 2)},5 ${1 + i * .1},9" stroke="#fff0b0" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M${x + 1},112 q${1.2 + (i % 2)},5 ${1 + i * .1},9" stroke="#b8741c" stroke-width=".8" fill="none" opacity=".7"/>`; }
  S.body = `${shadow(66, 122, 46, 4)}
<g class="a-carp">
<!-- unrolled tongue -->
<g class="a-flap">
<path d="M34,83 C36,98 48,110 70,113 L118,106 C106,102 98,94 96,84Z" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/>
<path d="M34,83 C36,98 48,110 70,113 L118,106 C106,102 98,94 96,84Z" fill="url(#§fl)"/>
<g clip-path="url(#§fc)">
 <path d="M30,86 C34,100 48,112 70,116 L124,108 L124,112 L70,121 C40,116 26,100 26,86Z" fill="url(#§iv)"/>
 <path d="M34,83 C36,98 48,110 70,113 L118,106" fill="none" stroke="#ffd668" stroke-width="1.6"/>
 <path d="M40,86 C42,96 52,106 70,108 L106,103" fill="none" stroke="#ffd668" stroke-width=".9" opacity=".9"/>
 <path d="M66,88 L76,98 L66,108 L56,98Z" fill="url(#§iv)" stroke="#ffd668" stroke-width="1.1"/><path d="M66,93 L70,98 L66,103 L62,98Z" fill="#ffd668"/>
 <path d="M86,92 l4,6 -4,6 -4,-6z" fill="#3ad8c8" opacity=".9" stroke="#0a3a40" stroke-width=".6"/><path d="M100,96 l3.4,5 -3.4,5 -3.4,-5z" fill="#ffd668" opacity=".9"/>
 <path d="M96,84 C100,96 106,102 118,106 L124,108 L124,80Z" fill="#fff" opacity=".18"/>
 <path d="M26,80 H60 L60,120 H26Z" fill="url(#mShadeL)" />
</g>
${tas}
</g>
<!-- roll body -->
<path d="M26,36 Q62,28 98,34 L98,82 Q62,90 26,82 Q18,59 26,36Z" fill="${OL}" stroke="${OL}" stroke-width="3.4" stroke-linejoin="round"/>
<path d="M26,36 Q62,28 98,34 L98,82 Q62,90 26,82 Q18,59 26,36Z" fill="url(#§rv)"/>
<g clip-path="url(#§bc)">
 <path d="M20,40 Q62,32 104,38 L104,44 Q62,38 20,46Z" fill="url(#§iv)"/><path d="M20,72 Q62,80 104,76 L104,82 Q62,86 20,82Z" fill="url(#§iv)"/>
 <path d="M20,46 Q62,38 104,44" fill="none" stroke="#ffd668" stroke-width="1.4"/><path d="M20,72 Q62,80 104,76" fill="none" stroke="#ffd668" stroke-width="1.4"/>
 ${med}
 <path d="M20,59 H104" stroke="#ffd668" stroke-width=".0"/>
 <rect x="18" y="26" width="30" height="70" fill="url(#mShadeL)"/>
 <path d="M26,38 Q62,30 98,36" fill="none" stroke="#fff" stroke-width="2.6" opacity=".55" stroke-linecap="round"/>
 <path d="M26,82 Q62,90 98,82 L98,92 L26,92Z" fill="#12001a" opacity=".35"/>
</g>
<!-- end face -->
<ellipse cx="98" cy="58" rx="10.8" ry="26" fill="${OL}"/><ellipse cx="98" cy="58" rx="9.8" ry="25" fill="#e8d0a0"/>${sp}
<ellipse cx="98" cy="58" rx="2" ry="3.6" fill="#1a0a2a"/>
<path d="M104,38 C109,50 109,66 104,78" fill="none" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>
<g class="a-tass"><path d="M84,86 v10" stroke="${OL}" stroke-width="4.6" stroke-linecap="round"/><path d="M84,86 v8" stroke="url(#mGold)" stroke-width="2.6" stroke-linecap="round"/><path d="M80,95 h8 l2,12 h-12z" fill="url(#mGold)" stroke="${OL}" stroke-width="1.2"/><path d="M82,96 v10 M84,96 v11 M86,96 v10" stroke="#8a4a10" stroke-width=".7"/></g>
</g>
<g class="a-spk">${star4(106, 28, 7)}${star4(24, 100, 5, '#fff', .9)}</g>`;
  S.anim('carp', '50% 70%', 1.2, 'ease-in-out', '0%{transform:none}22%{transform:translateY(-7px) rotate(-3deg)}44%{transform:translateY(-3px) rotate(2.5deg)}66%{transform:translateY(-6px) rotate(-1.5deg)}100%{transform:none}');
  S.anim('flap', '0% 0%', 1.2, 'ease-in-out', '0%{transform:none}25%{transform:scale(1.2,.88) skewX(-6deg)}55%{transform:scale(1.12,1.0) skewX(5deg)}80%{transform:scale(1.04,.98)}100%{transform:none}');
  S.anim('tass', '50% 0%', 1.2, 'ease-in-out', '0%{transform:none}20%{transform:rotate(14deg)}45%{transform:rotate(-12deg)}70%{transform:rotate(6deg)}100%{transform:none}');
  S.anim('spk', '50% 50%', 1.2, null, '0%,30%{opacity:0;transform:scale(.2)}50%{opacity:1;transform:scale(1.5) rotate(20deg)}80%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  return S;
};

// ---------- s7 SULTAN'S CROWN-TURBAN ----------
R.s7 = () => {
  const S = new Sym('s7');
  const body = 'M18,98 C12,70 26,38 54,30 C76,24 102,40 110,70 C114,84 112,92 110,98 Q64,112 18,98Z';
  S.defs = `<clipPath id="§tc"><path d="${body}"/></clipPath>
<linearGradient id="§pl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1e0a3a"/><stop offset=".3" stop-color="#4a1a78"/><stop offset=".62" stop-color="#8a3aa8"/><stop offset=".86" stop-color="#e070b8"/><stop offset="1" stop-color="#ffb0c0"/></linearGradient>
<linearGradient id="§pd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#12062a"/><stop offset="1" stop-color="#5a2090"/></linearGradient>
<linearGradient id="§fe" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0a4a70"/><stop offset=".5" stop-color="#1fb8c8"/><stop offset="1" stop-color="#e8fffc"/></linearGradient>`;
  // fold bands (lens shapes) rising to the right
  const folds = [[16, 88, 112, 70, 12], [14, 74, 110, 52, 12], [18, 60, 100, 38, 11], [28, 48, 86, 30, 9]];
  const fb = folds.map(([x0, y0, x1, y1, t], i) => `<path d="M${x0},${y0} Q${(x0 + x1) / 2},${(y0 + y1) / 2 - 18} ${x1},${y1} L${x1},${y1 + t} Q${(x0 + x1) / 2},${(y0 + y1) / 2 - 18 + t * 1.5} ${x0},${y0 + t * 1.2}Z" fill="url(#§pl)" stroke="#12062a" stroke-width="1.5" opacity="1"/><path d="M${x0 + 4},${y0 + 1} Q${(x0 + x1) / 2},${(y0 + y1) / 2 - 18} ${x1 - 4},${y1 + 1}" fill="none" stroke="#ffd0e8" stroke-width="1.5" opacity=".6"/><path d="M${x0},${y0 + t * 1.2} Q${(x0 + x1) / 2},${(y0 + y1) / 2 - 18 + t * 1.5} ${x1},${y1 + t}" fill="none" stroke="#12062a" stroke-width="2.4" opacity=".55"/>`).join('');
  let fl = '';
  for (let i = 0; i < 6; i++) fl += `<path d="M${30 + i * 13},96 l5,-12 l5,12z" fill="url(#mGold)" stroke="${OL}" stroke-width="1.1" stroke-linejoin="round"/>`;
  S.body = `${shadow(64, 121, 46, 5)}
<g class="a-turb">
<!-- plume -->
<g class="a-fea"><path d="M66,62 C52,34 70,6 102,0 C98,20 94,38 86,56Z" fill="${OL}" stroke="${OL}" stroke-width="2.6" stroke-linejoin="round"/><path d="M66,62 C52,34 70,6 102,0 C98,20 94,38 86,56Z" fill="url(#§fe)"/>
<path d="M68,58 C62,36 78,16 104,6" fill="none" stroke="#fff" stroke-width="1.6" opacity=".9"/><path d="M72,54 C70,40 80,26 96,16 M78,52 C78,42 86,32 96,26 M70,46 C66,38 70,28 80,20" fill="none" stroke="#0a4a70" stroke-width="1" opacity=".6"/><path d="M92,38 C96,28 100,18 104,10" fill="none" stroke="#e8fffc" stroke-width="1.2" opacity=".8"/>
<path d="M104,6 q8,-2 10,5" fill="none" stroke="#f0c060" stroke-width="2" stroke-linecap="round"/></g>
<!-- turban body -->
<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="3.6" stroke-linejoin="round"/>
<path d="${body}" fill="url(#§pd)"/>
<g clip-path="url(#§tc)">
 ${fb}
 <rect x="10" y="20" width="36" height="100" fill="url(#mShadeL)"/>
 <path d="M104,52 C110,66 110,84 106,94" fill="none" stroke="#fff0f8" stroke-width="3.4" opacity=".7" stroke-linecap="round"/>
 <path d="M60,30 C80,26 100,40 108,62" fill="none" stroke="#ffd0e8" stroke-width="2" opacity=".5" stroke-linecap="round"/>
</g>
<!-- gold crown band with fleurons -->
<path d="M16,88 Q64,102 112,88 L112,100 Q64,114 16,100Z" fill="${OL}" stroke="${OL}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M17.4,89.4 Q64,103 110.6,89.4 L110.6,98.8 Q64,112.4 17.4,98.8Z" fill="url(#mGold)"/><path d="M17.4,89.4 Q64,103 110.6,89.4 L110.6,98.8 Q64,112.4 17.4,98.8Z" fill="url(#mShadeV)"/>
<path d="M18,90 Q64,104 110,90" fill="none" stroke="#fff6c0" stroke-width="1.2" opacity=".85"/>
${[24, 40, 88, 104].map((x, i) => `<ellipse cx="${x}" cy="${98 + (x > 64 ? -1 : 0) - Math.abs(x - 64) * .0 + (Math.abs(x - 64) < 30 ? 0 : -1.5)}" rx="3.2" ry="2.6" fill="url(#${i % 2 ? 'mRuby' : 'mTurq'})" stroke="${OL}" stroke-width=".9"/>`).join('')}
<!-- brooch -->
<path d="M64,56 C76,56 80,68 77,78 C75,88 69,94 64,98 C59,94 53,88 51,78 C48,68 52,56 64,56Z" fill="${OL}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M64,58.4 C74,58.4 77.6,69 75,78 C73,86 68,92 64,95.4 C60,92 55,86 53,78 C50.4,69 54,58.4 64,58.4Z" fill="url(#mGold)"/><path d="M64,58.4 C74,58.4 77.6,69 75,78 C73,86 68,92 64,95.4 C60,92 55,86 53,78 C50.4,69 54,58.4 64,58.4Z" fill="url(#mShadeV)"/>
<ellipse cx="64" cy="76" rx="8.6" ry="11.6" fill="${OL}"/><ellipse cx="64" cy="76" rx="7.6" ry="10.6" fill="url(#mRubyD)"/>
<ellipse cx="60.6" cy="71" rx="2.8" ry="4" fill="#fff" opacity=".85" transform="rotate(-18 60.6 71)"/><path d="M68,82 q2,-4 .4,-9" fill="none" stroke="#ffd0d0" stroke-width="1" opacity=".6"/>
${[[64, 60], [72, 63], [56, 63], [74, 90], [54, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#fff" stroke="#8a8aa8" stroke-width=".8"/><circle cx="${x - .6}" cy="${y - .6}" r=".7" fill="#fff"/>`).join('')}
<g class="a-ruby"><ellipse cx="64" cy="76" rx="15" ry="19" fill="url(#mGlowW)"/></g>
</g>
<g class="a-spk">${star4(102, 74, 8)}${star4(26, 54, 5, '#fff', .95)}</g>`;
  S.anim('turb', '50% 100%', 1.2, 'cubic-bezier(.3,.7,.3,1)', '0%{transform:none}14%{transform:scale(1.06,.9)}34%{transform:translateY(-11px) scale(.96,1.06)}54%{transform:scale(1.04,.95)}72%{transform:translateY(-3px)}100%{transform:none}');
  S.anim('fea', '50% 100%', 1.2, 'ease-in-out', '0%{transform:none}25%{transform:rotate(9deg)}50%{transform:rotate(-6deg)}75%{transform:rotate(3deg)}100%{transform:none}');
  S.anim('ruby', '50% 50%', 1.2, 'ease-out', '0%,20%{opacity:0;transform:scale(.4)}45%{opacity:1;transform:scale(1.1)}100%{opacity:0;transform:scale(1.5)}');
  S.anim('spk', '50% 50%', 1.2, null, '0%,30%{opacity:0;transform:scale(.2)}50%{opacity:1;transform:scale(1.5) rotate(20deg)}80%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  return S;
};

// ---------- s8 GENIE'S LAMP (top pay) : the approved look-test lamp, ported to the 128 box, no filters ----------
function motifs(cx, cy, Rr, ry, thMin, thMax, n, sc) {
  let dark = '', lite = '';
  for (let i = 0; i < n; i++) {
    const th = thMin + (thMax - thMin) * i / (n - 1); const s = Math.sin(th), c = Math.cos(th); const x = cx + Rr * s, w = Math.max(.15, c) * sc;
    const p = `M${x},${cy + ry * .9} C${x - 9 * w},${cy + ry * .4} ${x - 10 * w},${cy - ry * .5} ${x},${cy - ry * .9} C${x + 10 * w},${cy - ry * .5} ${x + 9 * w},${cy + ry * .4} ${x},${cy + ry * .9} Z`;
    const v = `M${x},${cy + ry * .7} L${x},${cy - ry * .55} M${x - 6 * w},${cy + ry * .1} Q${x - 2 * w},${cy - ry * .1} ${x},${cy - ry * .2} M${x + 6 * w},${cy + ry * .1} Q${x + 2 * w},${cy - ry * .1} ${x},${cy - ry * .2}`;
    dark += `<path d="${p}" fill="none" stroke="#5a2a0c" stroke-width="${(2.2 * Math.max(.4, c)).toFixed(2)}" opacity=".75"/><path d="${v}" fill="none" stroke="#5a2a0c" stroke-width="1.6" opacity=".7"/>`;
    lite += `<path d="${p}" fill="none" stroke="#ffe7a0" stroke-width="1.2" opacity=".55" transform="translate(1.1,1.1)"/>`;
  }
  return dark + lite;
}
R.s8 = () => {
  const S = new Sym('s8');
  const body = 'M88,246 C88,204 136,190 200,190 C264,190 312,204 312,246 C312,292 266,314 200,314 C134,314 88,292 88,246 Z';
  S.defs = `<clipPath id="§bc"><path d="${body}"/></clipPath>
<linearGradient id="§lid" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6a3212"/><stop offset=".3" stop-color="#e79a2c"/><stop offset=".62" stop-color="#ffe08a"/><stop offset=".85" stop-color="#f1a72f"/><stop offset="1" stop-color="#fff0a8"/></linearGradient>
<radialGradient id="§bn" cx=".5" cy="1" r=".6"><stop offset="0" stop-color="#ff7a2a" stop-opacity=".6"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>
<linearGradient id="§sk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a8cff" stop-opacity=".55"/><stop offset=".5" stop-color="#9a8cff" stop-opacity="0"/></linearGradient>`;
  const jew = [-1.05, -.6, -.2, .2, .6, 1.05].map((t, i) => { const x = 200 + 112 * Math.sin(t), w = Math.cos(t); return `<ellipse cx="${x.toFixed(1)}" cy="${(268 + (1 - w) * 6).toFixed(1)}" rx="${(9 * w + 2).toFixed(1)}" ry="9.5" fill="url(#${i % 2 ? 'mRuby' : 'mLapis'})" stroke="#2a1006" stroke-width="2.4"/><ellipse cx="${(x - 2 * w).toFixed(1)}" cy="${(264 + (1 - w) * 6).toFixed(1)}" rx="${(2.6 * w + .4).toFixed(1)}" ry="2.4" fill="#fff" opacity=".85"/>`; }).join('');
  const T = 'translate(64 76) scale(.335) translate(-199 -226)';
  S.body = `${shadow(66, 116, 48, 5)}
<g class="a-lamp"><g transform="${T}">
<!-- handle -->
<g fill="none" stroke-linecap="round"><path d="M306,226 C360,196 384,262 322,292" stroke="#2a1006" stroke-width="26"/><path d="M306,226 C360,196 384,262 322,292" stroke="url(#mGoldS)" stroke-width="19"/><path d="M308,224 C358,198 378,252 320,288" stroke="#fff2b0" stroke-width="5" opacity=".75"/><path d="M306,231 C352,208 372,258 322,285" stroke="#5a2a0c" stroke-width="4" opacity=".45"/></g>
<!-- spout -->
<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M104,258 C54,262 40,224 40,170" stroke="#2a1006" stroke-width="40"/><path d="M104,258 C54,262 40,224 40,170" stroke="url(#mGoldS)" stroke-width="33"/><path d="M104,258 C54,262 40,224 40,170" stroke="#4a2008" stroke-width="33" opacity=".28" transform="translate(-5,0)"/><path d="M50,246 C48,214 48,190 48,172" stroke="#fff0b0" stroke-width="4" opacity=".6"/><path d="M96,246 C60,250 48,222 50,176" stroke="#ffe8a0" stroke-width="4.4" opacity=".75" transform="translate(8,2)"/></g>
<ellipse cx="40" cy="160" rx="25" ry="11" fill="#2a1006"/><ellipse cx="40" cy="160" rx="22" ry="8.6" fill="url(#mGoldS)"/><ellipse cx="40" cy="157.5" rx="14" ry="5" fill="#1c0a14"/>
<path d="M22,222 q18,10 36,0" fill="none" stroke="#2a1006" stroke-width="9"/><path d="M22,222 q18,10 36,0" fill="none" stroke="#ffd668" stroke-width="5.4"/>
<!-- foot -->
<path d="M150,328 L162,298 L246,298 L258,328 Z" fill="#2a1006"/><path d="M153,326 L164,300 L244,300 L255,326 Z" fill="url(#mGold)"/><path d="M153,326 L164,300 L244,300 L255,326 Z" fill="url(#mShadeV)"/>
<ellipse cx="205" cy="328" rx="62" ry="12" fill="#2a1006"/><ellipse cx="205" cy="326" rx="59" ry="10" fill="url(#mGold)"/><ellipse cx="205" cy="324" rx="52" ry="6" fill="#fff0b0" opacity=".3"/>
<!-- body -->
<path d="${body}" fill="#2a1006" stroke="#2a1006" stroke-width="6" stroke-linejoin="round"/><path d="${body}" fill="url(#mGold)"/>
<g clip-path="url(#§bc)">
 <rect x="80" y="186" width="240" height="132" fill="url(#mShadeV)"/><rect x="80" y="250" width="240" height="70" fill="#2a0e04" opacity=".38"/><rect x="80" y="186" width="70" height="132" fill="#2a0e04" opacity=".25"/>
 <ellipse cx="200" cy="330" rx="140" ry="40" fill="url(#§bn)"/><rect x="80" y="186" width="240" height="132" fill="url(#§sk)"/>
 <path d="M104,214 C140,203 190,202 236,205 L236,214 C190,212 144,214 108,226Z" fill="#fff6d0" opacity=".38"/>
 <path d="M292,214 C300,230 302,250 296,272 L282,272 C288,250 286,230 280,214Z" fill="#fffbe0" opacity=".8"/><path d="M268,222 C276,238 277,254 272,270 L266,270 C270,254 270,238 262,222Z" fill="#fff6c0" opacity=".45"/>
 <path d="M88,246 C88,204 120,192 150,190 C120,210 112,250 134,306 C100,296 88,276 88,246Z" fill="#3a1608" opacity=".5"/>
 <path d="M90,222 Q200,238 310,222" fill="none" stroke="#2a1006" stroke-width="8"/><path d="M90,222 Q200,238 310,222" fill="none" stroke="#ffd668" stroke-width="4.4"/>
 <path d="M92,290 Q200,314 308,290" fill="none" stroke="#2a1006" stroke-width="8"/><path d="M92,290 Q200,314 308,290" fill="none" stroke="#ffd668" stroke-width="4.4"/>
 <g transform="translate(0,6)">${motifs(200, 258, 104, 16, -1.3, 1.3, 13, 1.7)}</g>
 <g>${jew}</g>
</g>
<path d="M88,246 C88,204 136,190 200,190 C264,190 312,204 312,246" fill="none" stroke="#fff4c0" stroke-width="2.6" opacity=".6"/>
<path d="M308,230 C312,262 296,296 252,309" fill="none" stroke="#fff8d2" stroke-width="4" opacity=".7" stroke-linecap="round"/>
<!-- neck + lid -->
<path d="M160,196 Q200,206 240,196 L236,172 L164,172Z" fill="#2a1006"/><path d="M163,194 Q200,203 237,194 L234,174 L166,174Z" fill="url(#§lid)"/>
<g class="a-lid">
<path d="M156,176 C156,138 244,138 244,176 Q200,184 156,176Z" fill="#2a1006"/><path d="M159,174 C159,142 241,142 241,174 Q200,181 159,174Z" fill="url(#§lid)"/><path d="M159,174 C159,142 241,142 241,174 Q200,181 159,174Z" fill="url(#mShadeV)"/>
<path d="M170,160 C176,150 196,146 214,148" fill="none" stroke="#fff8d2" stroke-width="4" stroke-linecap="round" opacity=".8"/><path d="M170,166 Q200,171 230,166" fill="none" stroke="#5a2a0c" stroke-width="1.8" opacity=".6"/>
<rect x="191" y="128" width="18" height="22" rx="5" fill="#2a1006"/><rect x="193.4" y="130" width="13" height="19" rx="4" fill="url(#mGold)"/>
<circle cx="200" cy="120" r="18" fill="#2a1006"/><circle cx="200" cy="120" r="15" fill="url(#mRuby)"/><path d="M190 113 q5 -7 13 -5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/><circle cx="207" cy="127" r="2.4" fill="#ffb0a8" opacity=".8"/>
</g>
<path d="M240,176 C264,176 276,186 288,206" fill="none" stroke="#2a1006" stroke-width="11" stroke-linecap="round"/><path d="M240,176 C264,176 276,186 288,206" fill="none" stroke="#ffd668" stroke-width="7" stroke-linecap="round"/>
</g></g>
<!-- smoke thread from the spout -->
<g class="a-smoke"><path d="M11,53 C2,38 22,32 15,17 C11,9 22,7 20,-1" fill="none" stroke="#2c9bd0" stroke-width="9" stroke-linecap="round" opacity=".45"/><path d="M11,53 C2,38 22,32 15,17 C11,9 22,7 20,-1" fill="none" stroke="#8ff6e8" stroke-width="4.4" stroke-linecap="round" opacity=".85"/><path d="M11.6,51 C3.4,38 21,33 15.6,19" fill="none" stroke="#fff" stroke-width=".9" opacity=".9"/><circle cx="17" cy="26" r="6" fill="url(#mGlowT)"/><circle cx="19" cy="8" r="7" fill="url(#mGlowT)"/></g>
<g class="a-spk">${star4(98, 52, 8)}${star4(30, 98, 5, '#fff', .9)}${star4(46, 22, 4.5, '#fff6c8', .9)}</g>`;
  S.anim('lamp', '50% 90%', 1.2, 'cubic-bezier(.3,.7,.3,1)', '0%{transform:none}14%{transform:rotate(-7deg) scale(.97,1.03)}30%{transform:rotate(8deg) scale(1.05,.97)}48%{transform:rotate(-5deg)}66%{transform:rotate(2.5deg)}100%{transform:none}');
  S.anim('lid', '50% 100%', 1.2, 'ease-out', '0%,10%{transform:none}26%{transform:translateY(-14px) rotate(-8deg)}44%{transform:translateY(-5px) rotate(3deg)}60%,100%{transform:none}');
  S.anim('smoke', '50% 100%', 1.2, 'ease-out', '0%{opacity:.0;transform:scale(.6)}20%{opacity:1;transform:scale(1.15,1.35)}60%{opacity:1;transform:scale(1.35,1.6) translateX(3px)}100%{opacity:0;transform:scale(1.6,1.9) translateY(-6px)}');
  S.anim('spk', '50% 50%', 1.2, null, '0%,30%{opacity:0;transform:scale(.2)}50%{opacity:1;transform:scale(1.5) rotate(20deg)}80%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  S.css += `.sy8 .a-smoke{opacity:.9}`; // the smoke thread is part of the idle picture
  return S;
};
module.exports = R;
