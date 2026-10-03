// mid symbols: s3 jambiya, s4 signet ring, s5 hourglass
const { Sym, OL, f, star4, shadow, cab, rnd, seed } = require('./lib.cjs');
const R = {};

// ---------- s3 JAMBIYA DAGGER ----------
R.s3 = () => {
  const S = new Sym('s3');
  const blade = 'M55,74 C52,52 60,30 80,6 C76,32 76,54 73,74Z';
  S.defs = `<clipPath id="§bl"><path d="${blade}"/></clipPath>
<linearGradient id="§wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a0e08"/><stop offset=".5" stop-color="#7a3a1c"/><stop offset=".85" stop-color="#d89a62"/><stop offset="1" stop-color="#8a4a28"/></linearGradient>
<linearGradient id="§gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  let wire = '';
  for (let y = 80; y < 104; y += 4.2) wire += `<path d="M56.5,${y} q7.5,3 15,0" fill="none" stroke="#ffd668" stroke-width="1.7"/><path d="M56.5,${y + 1.6} q7.5,3 15,0" fill="none" stroke="#5a2a0c" stroke-width=".8" opacity=".7"/>`;
  S.body = `${shadow(66, 119, 36, 4)}
<g transform="translate(1 0) rotate(38 64 64) translate(-4 -3) scale(1.04)"><g class="a-dag">
<!-- blade -->
<path d="${blade}" fill="${OL}" stroke="${OL}" stroke-width="3.4" stroke-linejoin="round"/>
<path d="${blade}" fill="url(#mSteel)"/>
<g clip-path="url(#§bl)">
 <path d="M64,76 C63,54 66,32 80,6 L90,6 L90,80Z" fill="#ffffff" opacity=".6"/>
 <path d="M50,76 L50,0 L66,0 C58,28 60,52 64,76Z" fill="#1a2a44" opacity=".5"/>
 <path d="M63,74 C62,54 66,34 79,8" fill="none" stroke="#33445c" stroke-width="1.6"/>
 <path d="M66.2,72 C65,54 68,36 79,12" fill="none" stroke="#fff" stroke-width="1.2" opacity=".9"/>
 <path d="M58,70 C57,54 62,40 70,26" fill="none" stroke="#c8a040" stroke-width="1.1" opacity=".85" stroke-dasharray="1.6 2.2"/>
 <path d="M71.5,70 C72,52 73.5,40 76,24" fill="none" stroke="#fff" stroke-width="1.5" opacity=".9"/>
 <g class="a-glint"><rect x="30" y="40" width="18" height="90" fill="url(#§gl)" transform="rotate(22 40 80)"/></g>
</g>
<path d="M55,74 C52,52 60,30 80,6" fill="none" stroke="#9fb4cc" stroke-width=".8" opacity=".5"/>
<!-- collar + ruby -->
<path d="M49,74 C49,70 79,70 79,74 L77,82 C70,85 58,85 51,82Z" fill="${OL}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M50.4,74.4 C52,71.8 76,71.8 77.6,74.4 L76,81 C70,83.6 58,83.6 52,81Z" fill="url(#mGold)"/><path d="M50.4,74.4 C52,71.8 76,71.8 77.6,74.4 L76,81 C70,83.6 58,83.6 52,81Z" fill="url(#mShadeV)"/>
<path d="M52,74 q12,-3 24,0" fill="none" stroke="#fff6c0" stroke-width="1.2" opacity=".8"/>
${cab(64, 78.4, 4.6, 3.6, 'mRuby', OL, 1)}
<!-- grip with gold wire -->
<path d="M57,83 C55,92 56,100 58,106 H70 C72,100 73,92 71,83Z" fill="${OL}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M57.4,83 C56,92 57,100 58.6,105.6 H69.4 C71,100 72,92 70.6,83Z" fill="url(#§wood)"/>
${wire}
<path d="M69,84 C70,92 69.4,100 68,105" fill="none" stroke="#ffe0b0" stroke-width="1.2" opacity=".6"/>
<!-- crescent pommel -->
<path d="M40,108 C40,100 88,100 88,108 C88,116 76,120 64,120 C52,120 40,116 40,108Z" fill="${OL}" stroke="${OL}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M42,108 C42,102 86,102 86,108 C86,114.6 75,118 64,118 C53,118 42,114.6 42,108Z" fill="url(#mGold)"/><path d="M42,108 C42,102 86,102 86,108 C86,114.6 75,118 64,118 C53,118 42,114.6 42,108Z" fill="url(#mShadeV)"/>
<path d="M45,106.4 C60,102.6 74,102.6 84,106" fill="none" stroke="#fff6c0" stroke-width="1.6" opacity=".85"/>
${cab(64, 111, 6.4, 4.4, 'mTurq', OL, 1.1)}${cab(49, 109.4, 2.8, 2.2, 'mRuby', OL, .7)}${cab(79, 109.4, 2.8, 2.2, 'mRuby', OL, .7)}
</g></g>
<g class="a-spk">${star4(98, 22, 7)}${star4(30, 98, 4.5, '#fff', .9)}</g>`;
  S.anim('dag', '50% 55%', 1.2, 'cubic-bezier(.4,.1,.3,1)', '0%{transform:none}16%{transform:rotate(-10deg) scale(.95)}60%{transform:rotate(375deg) scale(1.1)}78%{transform:rotate(358deg)}100%{transform:rotate(360deg)}');
  S.anim('glint', '0 0', 1.2, 'linear', '0%,56%{transform:translateX(0);opacity:0}60%{opacity:1}92%{transform:translateX(52px);opacity:1}94%,100%{transform:translateX(52px);opacity:0}');
  S.anim('spk', '50% 50%', 1.2, null, '0%,56%{opacity:0;transform:scale(.2)}72%{opacity:1;transform:scale(1.5) rotate(20deg)}92%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  return S;
};

// ---------- s4 SIGNET RING ----------
R.s4 = () => {
  const S = new Sym('s4');
  S.defs = `<linearGradient id="§bd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a1c08"/><stop offset=".22" stop-color="#b8661a"/><stop offset=".48" stop-color="#ffd668"/><stop offset=".66" stop-color="#f1a72f"/><stop offset=".86" stop-color="#fff4b0"/><stop offset="1" stop-color="#ffc858"/></linearGradient>
<radialGradient id="§tq" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#d8fff8"/><stop offset=".28" stop-color="#47e0d0"/><stop offset=".7" stop-color="#14a0aa"/><stop offset="1" stop-color="#04505e"/></radialGradient>
<linearGradient id="§sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="§gc"><ellipse cx="64" cy="40" rx="21" ry="16.5"/></clipPath>
<mask id="§hole"><rect width="128" height="128" fill="#fff"/><ellipse cx="64" cy="82" rx="19" ry="23" fill="#000"/></mask>`;
  S.body = `${shadow(64, 120, 36, 5)}
<g class="a-ring"><g transform="translate(0 -2)">
<!-- inner back of the band (seen through the hole) -->
<ellipse cx="64" cy="82" rx="19.5" ry="23.5" fill="#1a0a06"/>
<path d="M45,84 A19,23 0 0 0 83,84 Q64,96 45,84Z" fill="url(#mGoldV)" opacity=".9"/>
<path d="M47,88 A17,21 0 0 0 81,88" fill="none" stroke="#ffe08a" stroke-width="1.5" opacity=".85"/>
<!-- band -->
<g mask="url(#§hole)">
 <ellipse cx="64" cy="82" rx="33" ry="37" fill="${OL}"/>
 <ellipse cx="64" cy="82" rx="31.2" ry="35.2" fill="url(#§bd)"/>
 <ellipse cx="64" cy="82" rx="31.2" ry="35.2" fill="url(#mShadeV)"/>
 <path d="M40,60 C32,78 34,98 52,112" fill="none" stroke="#2a0e04" stroke-width="7" opacity=".3"/>
 <path d="M90,62 C97,80 94,98 78,111" fill="none" stroke="#fff8c8" stroke-width="3.4" opacity=".85" stroke-linecap="round"/>
 <path d="M84,64 C90,80 88,96 76,106" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6"/>
</g>
<ellipse cx="64" cy="82" rx="19.2" ry="23.2" fill="none" stroke="${OL}" stroke-width="2"/>
<path d="M52,112 Q64,118 76,112" fill="none" stroke="#5a2a0c" stroke-width="1" opacity=".5"/>
${[0, 1, 2, 3, 4].map(i => `<path d="M${33.4 + i * .6},${72 + i * 7.6} q3,-2 5.6,1" fill="none" stroke="#5a2a0c" stroke-width="1.1" opacity=".6"/><path d="M${94.6 - i * .6},${72 + i * 7.6} q-3,-2 -5.6,1" fill="none" stroke="#5a2a0c" stroke-width="1.1" opacity=".5"/>`).join('')}
<!-- bezel shoulders -->
<path d="M30,62 C34,50 44,48 48,56 L50,70 C42,70 34,68 30,62Z" fill="url(#§bd)" stroke="${OL}" stroke-width="1.8"/>
<path d="M98,62 C94,50 84,48 80,56 L78,70 C86,70 94,68 98,62Z" fill="url(#§bd)" stroke="${OL}" stroke-width="1.8"/>
<!-- bezel -->
<ellipse cx="64" cy="41" rx="29" ry="23.5" fill="${OL}"/>
<ellipse cx="64" cy="41" rx="27" ry="21.6" fill="url(#§bd)"/><ellipse cx="64" cy="41" rx="27" ry="21.6" fill="url(#mShadeV)"/>
<ellipse cx="64" cy="41" rx="24" ry="18.8" fill="none" stroke="#5a2a0c" stroke-width="1" opacity=".7"/>
${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4 + .39; const x = 64 + 27 * Math.cos(a), y = 41 + 21.6 * Math.sin(a); return `<circle cx="${f(x)}" cy="${f(y)}" r="2.7" fill="url(#mGold)" stroke="${OL}" stroke-width="1"/><circle cx="${f(x - .7)}" cy="${f(y - .8)}" r=".9" fill="#fff8c8"/>`; }).join('')}
<ellipse cx="64" cy="40" rx="21.4" ry="17" fill="${OL}"/>
<ellipse cx="64" cy="40" rx="20.4" ry="16" fill="url(#§tq)"/>
<g clip-path="url(#§gc)">
 <path d="M44,34 C52,30 56,38 62,36 C68,34 70,26 78,28 M46,46 C54,44 60,50 68,46 C74,43 78,46 85,42 M58,25 C58,32 54,36 56,42 M72,48 C70,52 72,54 70,58" fill="none" stroke="#0a5a64" stroke-width="1.5" opacity=".6"/>
 <ellipse cx="73" cy="46" rx="16" ry="11" fill="#9affee" opacity=".22"/>
 <ellipse cx="64" cy="58" rx="26" ry="10" fill="#023c4a" opacity=".5"/>
 <g class="a-shine"><rect x="30" y="20" width="12" height="42" fill="url(#§sh)" transform="rotate(24 36 40)"/></g>
</g>
<ellipse cx="55" cy="32.4" rx="8.2" ry="4.4" fill="#fff" opacity=".82" transform="rotate(-24 55 32.4)"/><circle cx="73" cy="47" r="1.8" fill="#fff" opacity=".7"/>
</g></g>
<g class="a-spk">${star4(91, 24, 8)}${star4(36, 32, 5, '#fff', .95)}${star4(76, 52, 4, '#fff', .9)}</g>`;
  S.anim('ring', '50% 60%', 1.3, 'ease-in-out', '0%{transform:none}14%{transform:scale(.96,1.04)}38%{transform:scaleX(.08)}52%{transform:scaleX(-1)}70%{transform:scaleX(.08)}84%{transform:scaleX(1.06)}100%{transform:none}');
  S.anim('shine', '0 0', 1.3, 'linear', '0%,60%{transform:translateX(0);opacity:0}64%{opacity:1}92%{transform:translateX(44px);opacity:1}96%,100%{transform:translateX(44px);opacity:0}');
  S.anim('spk', '50% 50%', 1.3, null, '0%,66%{opacity:0;transform:scale(.2)}80%{opacity:1;transform:scale(1.5) rotate(20deg)}96%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  return S;
};

// ---------- s5 HOURGLASS ----------
R.s5 = () => {
  const S = new Sym('s5');
  const glass = 'M34,25 H94 C94,43 80,54 70,60 C66,62.4 66,63.6 66,64 C66,64.4 66,65.6 70,68 C80,74 94,85 94,103 H34 C34,85 48,74 58,68 C62,65.6 62,64.4 62,64 C62,63.6 62,62.4 58,60 C48,54 34,43 34,25Z';
  S.defs = `<clipPath id="§gc"><path d="${glass}"/></clipPath>
<linearGradient id="§sd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a4e14"/><stop offset=".45" stop-color="#f4a838"/><stop offset=".8" stop-color="#ffe49a"/><stop offset="1" stop-color="#ffc060"/></linearGradient>
<linearGradient id="§gw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ad0ff" stop-opacity=".35"/><stop offset=".5" stop-color="#d8f0ff" stop-opacity=".1"/><stop offset="1" stop-color="#ffffff" stop-opacity=".4"/></linearGradient>`;
  seed(5); let grain = '';
  for (let i = 0; i < 46; i++) { const x = 36 + rnd() * 56, y = 40 + rnd() * 62; grain += `<circle cx="${f(x)}" cy="${f(y)}" r=".6" fill="${rnd() < .5 ? '#7a3a0c' : '#fff0b0'}" opacity=".55"/>`; }
  const post = x => `<g><rect x="${x - 3.4}" y="22" width="6.8" height="84" fill="${OL}"/><path d="M${x - 2.4},22 h4.8 v84 h-4.8z" fill="url(#mEbony)"/>
 ${[34, 64, 94].map(y => `<ellipse cx="${x}" cy="${y}" rx="5.4" ry="3.4" fill="${OL}"/><ellipse cx="${x}" cy="${y}" rx="4.4" ry="2.5" fill="url(#mGold)"/><path d="M${x - 3},${y - 1} h6" stroke="#fff6c0" stroke-width=".8" opacity=".8"/>`).join('')}
 <path d="M${x + 1.4},26 v76" stroke="#d09a7a" stroke-width="1" opacity=".55"/></g>`;
  S.body = `${shadow(64, 121, 40, 4)}
<g class="a-hg">
${post(30)}${post(98)}
<!-- glass -->
<path d="${glass}" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round" opacity=".55"/>
<path d="${glass}" fill="#14102a" opacity=".55"/>
<g clip-path="url(#§gc)">
 <path d="M28,40 Q64,50 100,40 V68 H28Z" fill="url(#§sd)"/>
 <path d="M28,40 Q64,50 100,40" fill="none" stroke="#fff2b8" stroke-width="1.2" opacity=".9"/>
 <path d="M28,104 H100 C86,98 76,90 64,86 C52,90 42,98 28,104Z" fill="url(#§sd)"/>
 <path d="M52,92 C58,88 64,86 64,86 C70,87 78,92 84,96" fill="none" stroke="#fff2b8" stroke-width="1" opacity=".7"/>
 ${grain}
 <g class="a-sand"><path d="M64,61 L64,86" stroke="#ffd070" stroke-width="2.2"/><path d="M64,61 L64,86" stroke="#fff6c8" stroke-width=".8"/></g>
 <rect x="28" y="20" width="76" height="90" fill="url(#§gw)"/>
 <path d="M89,30 C90,42 82,50 72,56" fill="none" stroke="#fff" stroke-width="2.6" opacity=".8" stroke-linecap="round"/>
 <path d="M91,86 C92,92 91,98 89,101" fill="none" stroke="#fff" stroke-width="2.2" opacity=".7" stroke-linecap="round"/>
 <path d="M40,32 C40,42 46,48 52,52" fill="none" stroke="#fff" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>
</g>
<path d="${glass}" fill="none" stroke="#e8f6ff" stroke-width="1.8" opacity=".85" stroke-linejoin="round"/>
<path d="${glass}" fill="none" stroke="${OL}" stroke-width=".8" opacity=".6" stroke-linejoin="round" transform="translate(.8 .8)"/>
<!-- plates -->
<rect x="20" y="104" width="88" height="11" rx="3" fill="${OL}"/><rect x="21.6" y="105.4" width="84.8" height="8.2" rx="2.2" fill="url(#mEbony)"/><rect x="21.6" y="105.4" width="84.8" height="2.4" rx="1.2" fill="#fff" opacity=".18"/>
<rect x="16" y="112" width="96" height="6" rx="2.6" fill="${OL}"/><rect x="17.4" y="113" width="93.2" height="3.4" rx="1.6" fill="url(#mGold)"/>
<rect x="20" y="11" width="88" height="11" rx="3" fill="${OL}"/><rect x="21.6" y="12.6" width="84.8" height="8.2" rx="2.2" fill="url(#mEbony)"/><rect x="21.6" y="12.6" width="84.8" height="2.4" rx="1.2" fill="#fff" opacity=".18"/>
<rect x="16" y="6" width="96" height="6" rx="2.6" fill="${OL}"/><rect x="17.4" y="7.2" width="93.2" height="3.4" rx="1.6" fill="url(#mGold)"/>
${cab(64, 108.6, 3.6, 2.2, 'mRuby', OL, .7)}${cab(64, 16.6, 3.6, 2.2, 'mTurq', OL, .7)}
</g>
<g class="a-spk">${star4(104, 44, 7)}${star4(24, 80, 5, '#fff', .9)}</g>`;
  S.anim('hg', '50% 50%', 1.3, 'cubic-bezier(.5,0,.3,1)', '0%{transform:none}12%{transform:scale(.95)}50%{transform:rotate(190deg) scale(1.06)}64%{transform:rotate(176deg)}78%{transform:rotate(364deg)}100%{transform:rotate(360deg)}');
  S.anim('sand', '50% 0%', 1.3, 'linear', '0%{transform:scaleY(1)}30%,70%{transform:scaleY(1.2)}100%{transform:scaleY(1)}');
  S.anim('spk', '50% 50%', 1.3, null, '0%,60%{opacity:0;transform:scale(.2)}76%{opacity:1;transform:scale(1.5) rotate(20deg)}96%,100%{opacity:0;transform:scale(.6) rotate(40deg)}');
  return S;
};
module.exports = R;
