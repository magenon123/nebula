// specials: s9 wild, s10 FS scatter, s11 astrolabe scatter, s12 wish gem (+ s12_2/3/5/10/25 value skins)
const { Sym, OL, f, star4, shadow, cab } = require('./lib.cjs');
const R = {};
const mix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

// ---------- s9 WILD: Djinn Seal ----------
R.s9 = () => {
  const S = new Sym('s9');
  S.defs = `<radialGradient id="§ds" cx=".4" cy=".32" r=".85"><stop offset="0" stop-color="#4fc8ff"/><stop offset=".3" stop-color="#1668c8"/><stop offset=".7" stop-color="#0a2c80"/><stop offset="1" stop-color="#050f40"/></radialGradient>
<linearGradient id="§rb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a2c14"/><stop offset=".25" stop-color="#e79a2c"/><stop offset=".5" stop-color="#fff0a0"/><stop offset=".75" stop-color="#f1a72f"/><stop offset="1" stop-color="#ffe9a0"/></linearGradient>
<radialGradient id="§tg" cx=".5" cy=".5" r=".5"><stop offset=".72" stop-color="#5ff8ee" stop-opacity="0"/><stop offset=".86" stop-color="#5ff8ee" stop-opacity=".85"/><stop offset="1" stop-color="#1fa5e8" stop-opacity="0"/></radialGradient>
<clipPath id="§dc"><circle cx="64" cy="54" r="33"/></clipPath>`;
  let tick = '';
  for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; tick += `<path d="M${f(64 + 38.4 * Math.cos(a))},${f(54 + 38.4 * Math.sin(a))} L${f(64 + 41.4 * Math.cos(a))},${f(54 + 41.4 * Math.sin(a))}" stroke="#4a2008" stroke-width="1.5" stroke-linecap="round"/>`; }
  let fl = '';
  for (let i = 0; i < 38; i++) { const a = i * 2.4, r = 6 + (i * 7.3) % 27; fl += `<circle cx="${f(64 + r * Math.cos(a))}" cy="${f(54 + r * Math.sin(a))}" r="${(.5 + (i % 3) * .3).toFixed(1)}" fill="#ffe08a" opacity=".6"/>`; }
  let ste = '';
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 - Math.PI / 2, r = i % 2 ? 6 : 15; ste += (i ? 'L' : 'M') + f(70 + r * Math.cos(a)) + ',' + f(54 + r * Math.sin(a)) + ' '; }
  S.body = `${shadow(64, 107, 36, 4)}
<g class="a-glow"><circle cx="64" cy="54" r="58" fill="url(#mGlowT)"/></g>
<circle cx="64" cy="54" r="52" fill="url(#§tg)"/>
<g class="a-disc">
<circle cx="64" cy="54" r="44" fill="${OL}"/>
<circle cx="64" cy="54" r="42.4" fill="url(#§rb)"/><circle cx="64" cy="54" r="42.4" fill="url(#mShadeV)"/>
<circle cx="64" cy="54" r="37.2" fill="${OL}"/>
<g class="a-orn"><circle cx="64" cy="54" r="40" fill="none" stroke="#fff6c0" stroke-width=".8" opacity=".6"/>${tick}${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4; return `<circle cx="${f(64 + 40 * Math.cos(a))}" cy="${f(54 + 40 * Math.sin(a))}" r="2.1" fill="url(#${i % 2 ? 'mRuby' : 'mTurq'})" stroke="${OL}" stroke-width=".8"/>`; }).join('')}</g>
<circle cx="64" cy="54" r="34.6" fill="url(#§ds)"/>
<g clip-path="url(#§dc)">${fl}<ellipse cx="78" cy="68" rx="24" ry="14" fill="#7affee" opacity=".18"/><path d="M34,38 C44,26 62,22 80,26" fill="none" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/><rect x="24" y="20" width="22" height="70" fill="url(#mShadeL)"/></g>
<circle cx="64" cy="54" r="34.6" fill="none" stroke="${OL}" stroke-width="1.6"/>
<!-- crescent (opens to the right) and star -->
<path d="M62,28 C42,28 32,44 34,58 C36,74 52,82 66,78 C52,76 44,66 44,54 C44,42 52,32 62,28Z" fill="${OL}" stroke="${OL}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M62,28 C42,28 32,44 34,58 C36,74 52,82 66,78 C52,76 44,66 44,54 C44,42 52,32 62,28Z" fill="url(#mGold)"/><path d="M62,28 C42,28 32,44 34,58 C36,74 52,82 66,78 C52,76 44,66 44,54 C44,42 52,32 62,28Z" fill="url(#mShadeV)"/>
<path d="M60,30 C46,31 38,42 37.6,52" fill="none" stroke="#fff6c0" stroke-width="1.4" opacity=".8" stroke-linecap="round"/>
<g class="a-star"><path d="${ste}Z" fill="${OL}" stroke="${OL}" stroke-width="2.6" stroke-linejoin="round" transform="translate(0 0)"/><path d="${ste}Z" fill="url(#mGold)"/><path d="${ste}Z" fill="url(#mShadeV)"/>${cab(70, 54, 3.2, 3.2, 'mRuby', OL, .7)}</g>
</g>
<!-- WILD banner -->
<g class="a-ban">
<path d="M12,86 L26,88 L26,106 L12,104 L18,95Z" fill="#5a1a30" stroke="${OL}" stroke-width="1.6" stroke-linejoin="round"/><path d="M116,86 L102,88 L102,106 L116,104 L110,95Z" fill="#8a2a48" stroke="${OL}" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M22,84 Q64,92 106,84 L106,104 Q64,112 22,104Z" fill="${OL}" stroke="${OL}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M23.5,85.8 Q64,93.6 104.5,85.8 L104.5,102.6 Q64,110.4 23.5,102.6Z" fill="url(#mGold)"/><path d="M23.5,85.8 Q64,93.6 104.5,85.8 L104.5,102.6 Q64,110.4 23.5,102.6Z" fill="url(#mShadeV)"/>
<path d="M25,87.4 Q64,95 103,87.4" fill="none" stroke="#fff6c0" stroke-width="1" opacity=".85"/>
<text x="64" y="102" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-weight="900" font-size="19" letter-spacing="2.4" fill="#2a0a10" stroke="#2a0a10" stroke-width="3" stroke-linejoin="round" paint-order="stroke" transform="translate(.6 1) rotate(0)">WILD</text>
<text x="64" y="102" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-weight="900" font-size="19" letter-spacing="2.4" fill="#fff8e0" stroke="#7a1a30" stroke-width=".7" paint-order="stroke">WILD</text>
</g>
<g class="a-spk">${star4(106, 20, 8, '#e8ffff')}${star4(20, 66, 5, '#fff', .95)}</g>`;
  S.anim('disc', '50% 50%', 1.2, 'cubic-bezier(.3,.7,.3,1)', '0%{transform:none}18%{transform:scale(1.08)}40%{transform:scale(.98)}60%{transform:scale(1.05)}100%{transform:none}');
  S.anim('orn', '50% 50%', 1.2, 'ease-in-out', '0%{transform:none}100%{transform:rotate(120deg)}');
  S.anim('star', '50% 50%', 1.2, 'ease-in-out', '0%{transform:none}30%{transform:scale(1.32) rotate(22deg)}60%{transform:scale(.92) rotate(45deg)}100%{transform:rotate(45deg)}');
  S.anim('glow', '50% 50%', 1.2, 'ease-in-out', '0%{opacity:.0;transform:scale(.8)}30%{opacity:1;transform:scale(1.05)}70%{opacity:.9;transform:scale(1.12)}100%{opacity:0;transform:scale(1.2)}');
  S.anim('ban', '50% 50%', 1.2, 'ease-in-out', '0%{transform:none}25%{transform:scale(1.1)}45%{transform:scale(.97)}65%{transform:scale(1.05)}100%{transform:none}');
  S.anim('spk', '50% 50%', 1.2, null, '0%,30%{opacity:0;transform:scale(.2)}50%{opacity:1;transform:scale(1.5) rotate(20deg)}80%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  S.css += '.sy9 .a-star{transform:none}';
  return S;
};

// ---------- s10 SCATTER: FS (text only) ----------
R.s10 = () => {
  const S = new Sym('s10');
  S.defs = `<radialGradient id="§sn" cx=".4" cy=".32" r=".85"><stop offset="0" stop-color="#fffbe0"/><stop offset=".28" stop-color="#ffd86a"/><stop offset=".62" stop-color="#e79220"/><stop offset="1" stop-color="#8a3a08"/></radialGradient>
<radialGradient id="§bl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2b8" stop-opacity=".95"/><stop offset=".4" stop-color="#ffa030" stop-opacity=".6"/><stop offset="1" stop-color="#ff5a10" stop-opacity="0"/></radialGradient>
<linearGradient id="§tx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#ffe9a0"/><stop offset="1" stop-color="#e8a030"/></linearGradient>`;
  let rays = '', rays2 = '';
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, l = i % 2 ? 54 : 62, w = i % 2 ? .13 : .17; rays += `<path d="M${f(64 + 40 * Math.cos(a - w))},${f(60 + 40 * Math.sin(a - w))} L${f(64 + l * Math.cos(a))},${f(60 + l * Math.sin(a))} L${f(64 + 40 * Math.cos(a + w))},${f(60 + 40 * Math.sin(a + w))}Z" fill="url(#mGold)" stroke="${OL}" stroke-width="1.4" stroke-linejoin="round"/>`; }
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 + Math.PI / 16; rays2 += `<path d="M${f(64 + 40 * Math.cos(a - .09))},${f(60 + 40 * Math.sin(a - .09))} L${f(64 + 50 * Math.cos(a))},${f(60 + 50 * Math.sin(a))} L${f(64 + 40 * Math.cos(a + .09))},${f(60 + 40 * Math.sin(a + .09))}Z" fill="#ff8a24" stroke="${OL}" stroke-width="1" stroke-linejoin="round" opacity=".95"/>`; }
  S.body = `${shadow(64, 118, 40, 4)}
<g class="a-glow"><circle cx="64" cy="60" r="62" fill="url(#§bl)"/></g>
<circle cx="64" cy="60" r="54" fill="url(#§bl)" opacity=".5"/>
<g class="a-rays"><g>${rays2}${rays}</g></g>
<g class="a-disc">
<circle cx="64" cy="60" r="41" fill="${OL}"/>
<circle cx="64" cy="60" r="39.4" fill="url(#mGold)"/><circle cx="64" cy="60" r="39.4" fill="url(#mShadeV)"/>
<circle cx="64" cy="60" r="34" fill="${OL}"/><circle cx="64" cy="60" r="32.6" fill="url(#§sn)"/>
<circle cx="64" cy="60" r="32.6" fill="none" stroke="#5a2a0c" stroke-width="1" opacity=".6"/><circle cx="64" cy="60" r="28" fill="none" stroke="#fff0b0" stroke-width="1" opacity=".5"/>
${Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12; return `<circle cx="${f(64 + 36.8 * Math.cos(a))}" cy="${f(60 + 36.8 * Math.sin(a))}" r="1.1" fill="#3a1408" opacity=".7"/>`; }).join('')}
<path d="M38,50 C42,38 52,32 66,31" fill="none" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>
<g class="a-txt"><text x="65" y="74" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-weight="900" font-size="40" letter-spacing="1" fill="#5a2208" stroke="#5a2208" stroke-width="5.5" stroke-linejoin="round" paint-order="stroke" opacity=".55" transform="translate(1.6 2.4)">FS</text>
<text x="65" y="74" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-weight="900" font-size="40" letter-spacing="1" fill="url(#§tx)" stroke="#6a2a06" stroke-width="3.4" stroke-linejoin="round" paint-order="stroke">FS</text>
<text x="65" y="74" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-weight="900" font-size="40" letter-spacing="1" fill="none" stroke="#fff" stroke-width=".6" opacity=".55">FS</text></g>
</g>
<g class="a-spk">${star4(104, 22, 8)}${star4(22, 104, 5, '#fff', .95)}</g>`;
  S.anim('rays', '50% 50%', 1.4, 'ease-in-out', '0%{transform:none}100%{transform:rotate(45deg)}');
  S.anim('disc', '50% 50%', 1.4, 'cubic-bezier(.3,.7,.3,1)', '0%{transform:none}18%{transform:scale(.94)}38%{transform:scale(1.1)}58%{transform:scale(.98)}78%{transform:scale(1.05)}100%{transform:none}');
  S.anim('txt', '50% 50%', 1.4, 'ease-in-out', '0%{transform:none}30%{transform:scale(1.2)}50%{transform:scale(1)}70%{transform:scale(1.14)}100%{transform:none}');
  S.anim('glow', '50% 50%', 1.4, 'ease-out', '0%{opacity:0;transform:scale(.8)}30%{opacity:1;transform:scale(1.05)}100%{opacity:0;transform:scale(1.25)}');
  S.anim('spk', '50% 50%', 1.4, null, '0%,30%{opacity:0;transform:scale(.2)}50%{opacity:1;transform:scale(1.5) rotate(20deg)}80%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  return S;
};

// ---------- s11 ASTROLABE (bonus scatter, no text) ----------
R.s11 = () => {
  const S = new Sym('s11');
  S.defs = `<radialGradient id="§bg" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#2a56b0"/><stop offset=".6" stop-color="#10286a"/><stop offset="1" stop-color="#060f34"/></radialGradient>
<linearGradient id="§br" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a4410"/><stop offset=".3" stop-color="#d8a838"/><stop offset=".55" stop-color="#fff2b0"/><stop offset=".8" stop-color="#c8962c"/><stop offset="1" stop-color="#ffe9a0"/></linearGradient>`;
  const C = [64, 66];
  const ring = (r0, r1) => `<path d="M${C[0] - r1},${C[1]} a${r1},${r1} 0 1 0 ${2 * r1},0 a${r1},${r1} 0 1 0 ${-2 * r1},0Z M${C[0] - r0},${C[1]} a${r0},${r0} 0 1 1 ${2 * r0},0 a${r0},${r0} 0 1 1 ${-2 * r0},0Z" fill-rule="evenodd"`;
  let t1 = '', t2 = '', spokes = '';
  for (let i = 0; i < 48; i++) { const a = i * Math.PI / 24, L = i % 4 ? 2.4 : 4.4; t1 += `<path d="M${f(C[0] + (46 - L) * Math.cos(a))},${f(C[1] + (46 - L) * Math.sin(a))} L${f(C[0] + 46 * Math.cos(a))},${f(C[1] + 46 * Math.sin(a))}" stroke="#3a1c06" stroke-width="${i % 4 ? .8 : 1.3}"/>`; }
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + .26; t2 += `<circle cx="${f(C[0] + 33 * Math.cos(a))}" cy="${f(C[1] + 33 * Math.sin(a))}" r="2.2" fill="${i % 3 === 0 ? '#e0354f' : '#1b2a60'}" stroke="#3a1c06" stroke-width=".8"/>`; }
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; spokes += `<path d="M${f(C[0] + 7 * Math.cos(a))},${f(C[1] + 7 * Math.sin(a))} L${f(C[0] + 21 * Math.cos(a))},${f(C[1] + 21 * Math.sin(a))}" stroke="#3a1c06" stroke-width="3.6" stroke-linecap="round"/><path d="M${f(C[0] + 7 * Math.cos(a))},${f(C[1] + 7 * Math.sin(a))} L${f(C[0] + 21 * Math.cos(a))},${f(C[1] + 21 * Math.sin(a))}" stroke="url(#mBrass)" stroke-width="1.8" stroke-linecap="round"/>`; }
  S.body = `${shadow(64, 119, 38, 4)}
<g class="a-glow"><circle cx="64" cy="66" r="60" fill="url(#mGlowW)"/></g>
<!-- shackle + throne -->
<path d="M52,24 C52,10 76,10 76,24" fill="none" stroke="${OL}" stroke-width="7.4" stroke-linecap="round"/><path d="M52,24 C52,10 76,10 76,24" fill="none" stroke="url(#mBrass)" stroke-width="4.4" stroke-linecap="round"/>
<path d="M48,26 h32 l-4,10 h-24z" fill="url(#mBrass)" stroke="${OL}" stroke-width="1.8" stroke-linejoin="round"/>${cab(64, 28.6, 3.4, 2.6, 'mRuby', OL, .8)}
<g class="a-all">
<!-- back disc (night sky between the rings) -->
<circle cx="${C[0]}" cy="${C[1]}" r="47" fill="${OL}"/><circle cx="${C[0]}" cy="${C[1]}" r="45" fill="url(#§bg)"/>
${Array.from({ length: 16 }, (_, i) => `<circle cx="${f(C[0] + (10 + (i * 37) % 30) * Math.cos(i * 2.3))}" cy="${f(C[1] + (10 + (i * 37) % 30) * Math.sin(i * 2.3))}" r=".7" fill="#fff" opacity=".7"/>`).join('')}
<!-- ring 1 outer -->
<g class="a-r1"><path d="M${C[0] - 47},${C[1]} a47,47 0 1 0 94,0 a47,47 0 1 0 -94,0Z M${C[0] - 38},${C[1]} a38,38 0 1 1 76,0 a38,38 0 1 1 -76,0Z" fill-rule="evenodd" fill="${OL}"/>
<path d="M${C[0] - 45.6},${C[1]} a45.6,45.6 0 1 0 91.2,0 a45.6,45.6 0 1 0 -91.2,0Z M${C[0] - 39.4},${C[1]} a39.4,39.4 0 1 1 78.8,0 a39.4,39.4 0 1 1 -78.8,0Z" fill-rule="evenodd" fill="url(#§br)"/>
${t1}<circle cx="${C[0]}" cy="${C[1] - 42.6}" r="2.4" fill="url(#mRuby)" stroke="${OL}" stroke-width=".8"/></g>
<!-- ring 2 -->
<g class="a-r2"><path d="M${C[0] - 36},${C[1]} a36,36 0 1 0 72,0 a36,36 0 1 0 -72,0Z M${C[0] - 29},${C[1]} a29,29 0 1 1 58,0 a29,29 0 1 1 -58,0Z" fill-rule="evenodd" fill="${OL}"/>
<path d="M${C[0] - 34.8},${C[1]} a34.8,34.8 0 1 0 69.6,0 a34.8,34.8 0 1 0 -69.6,0Z M${C[0] - 30.2},${C[1]} a30.2,30.2 0 1 1 60.4,0 a30.2,30.2 0 1 1 -60.4,0Z" fill-rule="evenodd" fill="url(#§br)"/>
<path d="M${C[0] - 34.8},${C[1]} a34.8,34.8 0 1 0 69.6,0 a34.8,34.8 0 1 0 -69.6,0Z" fill="none" stroke="#fff6c0" stroke-width=".6" opacity=".7"/>${t2}</g>
<!-- ring 3 with spokes -->
<g class="a-r3"><circle cx="${C[0]}" cy="${C[1]}" r="23" fill="${OL}"/><circle cx="${C[0]}" cy="${C[1]}" r="21.4" fill="url(#§bg)"/>${spokes}
<path d="M${C[0] - 23},${C[1]} a23,23 0 1 0 46,0 a23,23 0 1 0 -46,0Z M${C[0] - 20},${C[1]} a20,20 0 1 1 40,0 a20,20 0 1 1 -40,0Z" fill-rule="evenodd" fill="url(#§br)" stroke="${OL}" stroke-width="1.2"/></g>
<!-- alidade rule + hub -->
<g class="a-rule"><path d="M${C[0] - 44},${C[1] + 5} L${C[0] + 44},${C[1] - 5} L${C[0] + 44},${C[1] - 1} L${C[0] - 44},${C[1] + 9}Z" fill="${OL}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/><path d="M${C[0] - 43},${C[1] + 5.4} L${C[0] + 43},${C[1] - 4.6} L${C[0] + 43},${C[1] - 1.6} L${C[0] - 43},${C[1] + 8.4}Z" fill="url(#mBrass)"/><path d="M${C[0] - 40},${C[1] + 6} L${C[0] + 40},${C[1] - 4.2}" stroke="#fff8d0" stroke-width=".9" opacity=".9"/>
<path d="M${C[0] + 43},${C[1] - 5} l7,3.4 -7,3.4z" fill="url(#mBrass)" stroke="${OL}" stroke-width="1.2" stroke-linejoin="round"/></g>
<circle cx="${C[0]}" cy="${C[1]}" r="8" fill="${OL}"/><circle cx="${C[0]}" cy="${C[1]}" r="6.8" fill="url(#mBrass)"/>${cab(C[0], C[1], 4.2, 4.2, 'mLapis', OL, .9)}
</g>
<g class="a-spk">${star4(104, 26, 8)}${star4(22, 98, 5, '#fff', .95)}</g>`;
  S.anim('all', '50% 55%', 1.4, 'cubic-bezier(.3,.7,.3,1)', '0%{transform:none}20%{transform:scale(.95)}45%{transform:scale(1.08)}70%{transform:scale(1.0)}100%{transform:none}');
  S.anim('r1', '50% 50%', 1.4, 'cubic-bezier(.4,0,.2,1)', '0%{transform:none}100%{transform:rotate(60deg)}');
  S.anim('r2', '50% 50%', 1.4, 'cubic-bezier(.4,0,.2,1)', '0%{transform:none}100%{transform:rotate(-120deg)}');
  S.anim('r3', '50% 50%', 1.4, 'cubic-bezier(.4,0,.2,1)', '0%{transform:none}100%{transform:rotate(225deg)}');
  S.anim('rule', '50% 50%', 1.4, 'cubic-bezier(.4,0,.2,1)', '0%{transform:none}100%{transform:rotate(-40deg)}');
  S.anim('glow', '50% 50%', 1.4, 'ease-out', '0%{opacity:0;transform:scale(.8)}35%{opacity:1;transform:scale(1.05)}100%{opacity:0;transform:scale(1.2)}');
  S.anim('spk', '50% 50%', 1.4, null, '0%,35%{opacity:0;transform:scale(.2)}55%{opacity:1;transform:scale(1.5) rotate(20deg)}85%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  return S;
};

// ---------- s12 WISH GEM (generic + value skins) ----------
const GEMS = {
  '': { d: '#3a0f7a', m: '#a05ae0', l: '#f4e0ff', glow: '#c890ff', txt: null },
  '_2': { d: '#05505a', m: '#2ccfc0', l: '#d8fffa', glow: '#5ff0e8', txt: 'x2' },
  '_3': { d: '#064a28', m: '#2ac870', l: '#d8ffe0', glow: '#6aff9a', txt: 'x3' },
  '_5': { d: '#34087a', m: '#9a50f0', l: '#f0dcff', glow: '#c08aff', txt: 'x5' },
  '_10': { d: '#4a0618', m: '#e8284e', l: '#ffd8d8', glow: '#ff6a82', txt: 'x10' },
  '_25': { d: '#8a5a10', m: '#ffd048', l: '#ffffff', glow: '#fff0a0', txt: 'x25' },
};
Object.keys(GEMS).forEach(k => {
  R['s12' + k] = () => {
    const G = GEMS[k]; const S = new Sym('s12' + k); const cx = 64, cy = 49, Ro = 34, Rt = 17;
    const ang = i => i * Math.PI / 4 + Math.PI / 8; const P = (r, i, dy = 0) => [cx + r * Math.cos(ang(i)), cy + dy + r * Math.sin(ang(i)) * .96];
    const poly = pts => pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ');
    let facets = '';
    for (let i = 0; i < 8; i++) {
      const a = ang(i) + Math.PI / 8; const lit = (Math.cos(a - (-.5)) + 1) / 2; // light from upper right
      const col = mix(G.d, G.l, Math.pow(lit, 1.3) * .95);
      facets += `<polygon points="${poly([P(Ro, i), P(Ro, i + 1), P(Rt, i + 1), P(Rt, i)])}" fill="${col}" stroke="${mix(G.d, '#000000', .5)}" stroke-width=".7"/>`;
      // star facets on the table edge
      const m = [(P(Rt, i)[0] + P(Rt, i + 1)[0]) / 2, (P(Rt, i)[1] + P(Rt, i + 1)[1]) / 2];
      const o = [(P(Ro, i)[0] + P(Ro, i + 1)[0]) / 2, (P(Ro, i)[1] + P(Ro, i + 1)[1]) / 2];
      facets += `<polygon points="${poly([P(Ro, i), o, m, P(Rt, i)])}" fill="${mix(G.m, G.l, lit * .7)}" opacity=".55"/>`;
    }
    const tab = Array.from({ length: 8 }, (_, i) => P(Rt, i));
    S.defs = `<radialGradient id="§tb" cx=".35" cy=".28" r=".9"><stop offset="0" stop-color="${G.l}"/><stop offset=".45" stop-color="${G.m}"/><stop offset="1" stop-color="${G.d}"/></radialGradient>
<radialGradient id="§gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${G.glow}" stop-opacity=".95"/><stop offset=".45" stop-color="${G.glow}" stop-opacity=".4"/><stop offset="1" stop-color="${G.glow}" stop-opacity="0"/></radialGradient>
<clipPath id="§gc"><polygon points="${poly(Array.from({ length: 8 }, (_, i) => P(Ro, i)))}"/></clipPath>
<linearGradient id="§sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    const chip = `<g class="a-chip"><rect x="26" y="88" width="76" height="30" rx="10" fill="${OL}"/><rect x="28" y="90" width="72" height="26" rx="8.4" fill="url(#mGold)"/><rect x="28" y="90" width="72" height="26" rx="8.4" fill="url(#mShadeV)"/>
<rect x="32" y="93.4" width="64" height="19.4" rx="6" fill="#1a0a2c" stroke="#5a2a0c" stroke-width="1"/><rect x="32" y="93.4" width="64" height="8" rx="5" fill="#fff" opacity=".08"/>
${G.txt ? `<text x="64" y="109.4" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-weight="900" font-size="${G.txt.length > 2 ? 17 : 19}" fill="${G.l}" stroke="${G.d}" stroke-width="2" paint-order="stroke" stroke-linejoin="round" class="gv">${G.txt}</text>` : ''}
${cab(31, 103, 2, 2, 'mRuby', OL, .5)}${cab(97, 103, 2, 2, 'mRuby', OL, .5)}</g>`;
    S.body = `${shadow(64, 121, 34, 3.5)}
<g class="a-glow"><circle cx="64" cy="49" r="54" fill="url(#§gl)"/></g>
<circle cx="64" cy="48" r="46" fill="url(#§gl)" opacity=".5"/>
<g class="a-gem">
<!-- gold claw setting -->
${Array.from({ length: 8 }, (_, i) => { const p = P(Ro + 2, i); return `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="3.4" fill="url(#mGold)" stroke="${OL}" stroke-width="1.1"/>`; }).join('')}
<polygon points="${poly(Array.from({ length: 8 }, (_, i) => P(Ro + 1.6, i)))}" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/>
<polygon points="${poly(Array.from({ length: 8 }, (_, i) => P(Ro, i)))}" fill="${G.d}"/>
${facets}
<polygon points="${poly(tab)}" fill="url(#§tb)" stroke="${mix(G.d, '#000000', .5)}" stroke-width=".9"/>
<g clip-path="url(#§gc)"><path d="M${cx - 14},${cy - 8} L${cx - 3},${cy - 22} L${cx + 4},${cy - 20} L${cx - 8},${cy - 4}Z" fill="#fff" opacity=".6"/><ellipse cx="${cx + 8}" cy="${cy + 8}" rx="6" ry="3" fill="#fff" opacity=".22"/><g class="a-sh"><rect x="30" y="14" width="10" height="70" fill="url(#§sh)" transform="rotate(24 35 48)"/></g></g>
<polygon points="${poly(Array.from({ length: 8 }, (_, i) => P(Ro, i)))}" fill="none" stroke="${OL}" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M${P(Ro, 6)[0]},${P(Ro, 6)[1] - 0.5} L${P(Ro, 7)[0]},${P(Ro, 7)[1] - .5}" stroke="#fff" stroke-width="1.2" opacity=".6"/>
</g>
${chip}
<g class="a-spk">${star4(98, 20, 8, '#fff')}${star4(26, 36, 5, '#fff', .95)}${star4(88, 60, 4, G.l, .9)}</g>`;
    S.anim('gem', '50% 40%', 1.2, 'cubic-bezier(.3,.7,.3,1)', '0%{transform:none}18%{transform:scale(.92)}40%{transform:scale(1.2) rotate(-4deg)}62%{transform:scale(1.0) rotate(3deg)}80%{transform:scale(1.08)}100%{transform:none}');
    S.anim('glow', '50% 50%', 1.2, 'ease-out', '0%{opacity:.0;transform:scale(.8)}30%{opacity:1;transform:scale(1.1)}100%{opacity:0;transform:scale(1.3)}');
    S.anim('sh', '0 0', 1.2, 'linear', '0%,30%{transform:translateX(0);opacity:0}34%{opacity:1}72%{transform:translateX(52px);opacity:1}76%,100%{transform:translateX(52px);opacity:0}');
    S.anim('chip', '50% 50%', 1.2, 'cubic-bezier(.3,1.6,.5,1)', '0%{transform:none}30%{transform:scale(1.14)}50%{transform:scale(.96)}70%{transform:scale(1.07)}100%{transform:none}');
    S.anim('spk', '50% 50%', 1.2, null, '0%,30%{opacity:0;transform:scale(.2)}50%{opacity:1;transform:scale(1.5) rotate(20deg)}80%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
    return S;
  };
});
module.exports = R;
