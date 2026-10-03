// node frame.cjs -> bake/frame.svg ; node bake.cjs frame ; node frame-html.cjs. 600x600 frame art, board hole 520x520 at (40,40).
const fs = require('fs'), path = require('path'); const { f, OL } = require('./lib.cjs');
const rosette = (x, y, r) => { let p = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; p += `<ellipse cx="${f(x + r * .56 * Math.cos(a))}" cy="${f(y + r * .56 * Math.sin(a))}" rx="${f(r * .42)}" ry="${f(r * .22)}" transform="rotate(${i * 45} ${f(x + r * .56 * Math.cos(a))} ${f(y + r * .56 * Math.sin(a))})" fill="url(#gold)" stroke="${OL}" stroke-width="1.4"/>`; } return `<circle cx="${x}" cy="${y}" r="${r}" fill="${OL}"/><circle cx="${x}" cy="${y}" r="${r - 2}" fill="url(#goldV)"/>${p}<circle cx="${x}" cy="${y}" r="${r * .34}" fill="url(#ruby)" stroke="${OL}" stroke-width="1.4"/><ellipse cx="${x - 2}" cy="${y - 2.4}" rx="2.6" ry="1.8" fill="#fff" opacity=".85"/>`; };
const stud = (x, y, mat = 'turq') => `<circle cx="${x}" cy="${y}" r="7.6" fill="${OL}"/><circle cx="${x}" cy="${y}" r="6.2" fill="url(#gold)"/><circle cx="${x}" cy="${y}" r="4.2" fill="url(#${mat})" stroke="${OL}" stroke-width=".9"/><circle cx="${x - 1.2}" cy="${y - 1.4}" r="1.3" fill="#fff" opacity=".9"/>`;
let arab = ''; // carved arabesque rhythm along the four sides (rendered in the pattern band)
for (let i = 0; i < 12; i++) { const t = 66 + i * 40.6; arab += `<path d="M${t},19 q5,5 0,10 q-5,-5 0,-10z M${t},581 q5,-5 0,-10 q-5,5 0,10z M19,${t} q5,5 10,0 q-5,-5 -10,0z M581,${t} q-5,5 -10,0 q5,-5 10,0z" fill="url(#gold)" stroke="${OL}" stroke-width=".8" opacity=".9"/>`; }
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="1200" height="1200">
<defs>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b2a12"/><stop offset=".18" stop-color="#a8581a"/><stop offset=".38" stop-color="#e79a2c"/><stop offset=".58" stop-color="#ffd668"/><stop offset=".74" stop-color="#f5b23a"/><stop offset=".9" stop-color="#fff0a8"/><stop offset="1" stop-color="#ffcb5a"/></linearGradient>
<linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b8"/><stop offset=".3" stop-color="#f6c24a"/><stop offset=".62" stop-color="#c97a1c"/><stop offset="1" stop-color="#6a3410"/></linearGradient>
<linearGradient id="goldD" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="600"><stop offset="0" stop-color="#7a3d14"/><stop offset=".3" stop-color="#d98a22"/><stop offset=".5" stop-color="#fff0a8"/><stop offset=".72" stop-color="#e79a2c"/><stop offset="1" stop-color="#ffe08a"/></linearGradient>
<linearGradient id="stone" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="0"><stop offset="0" stop-color="#1e0e30"/><stop offset=".5" stop-color="#4a2a52"/><stop offset="1" stop-color="#8a5262"/></linearGradient>
<linearGradient id="lap" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="0"><stop offset="0" stop-color="#081850"/><stop offset=".6" stop-color="#143a96"/><stop offset="1" stop-color="#2a6ad0"/></linearGradient>
<radialGradient id="ruby" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffb0a8"/><stop offset=".3" stop-color="#e0354f"/><stop offset="1" stop-color="#4a0618"/></radialGradient>
<radialGradient id="turq" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#c8fff6"/><stop offset=".3" stop-color="#3ad8c8"/><stop offset="1" stop-color="#08585e"/></radialGradient>
<radialGradient id="lapis" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#7fe4ff"/><stop offset=".35" stop-color="#1fa5b8"/><stop offset="1" stop-color="#0a2f66"/></radialGradient>
<radialGradient id="boardG" cx=".6" cy=".6" r=".8"><stop offset="0" stop-color="#3a1c58" stop-opacity=".62"/><stop offset="1" stop-color="#12062a" stop-opacity=".82"/></radialGradient>
<linearGradient id="shadeL" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="0"><stop offset="0" stop-color="#0a0418" stop-opacity=".45"/><stop offset=".45" stop-color="#0a0418" stop-opacity="0"/><stop offset="1" stop-color="#ffc77a" stop-opacity=".16"/></linearGradient>
<pattern id="zel" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M15 2 L19.5 10.5 L28 15 L19.5 19.5 L15 28 L10.5 19.5 L2 15 L10.5 10.5Z" fill="none" stroke="#f0b858" stroke-width=".9" opacity=".6"/><circle cx="15" cy="15" r="2.2" fill="#1fa5b8" opacity=".7"/><path d="M0 0 L5 5 M30 0 L25 5 M0 30 L5 25 M30 30 L25 25" stroke="#f0b858" stroke-width=".7" opacity=".4"/></pattern>
<filter id="tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05 .07" numOctaves="4" seed="6" result="n"/><feDiffuseLighting in="n" surfaceScale="2.2" lighting-color="#ffb070" diffuseConstant="1.05"><feDistantLight azimuth="20" elevation="26"/></feDiffuseLighting><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .05  0 0 0 0 .02  0 0 0 0 .1  0 0 0 .5 -.2"/></filter>
<filter id="sh" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5"/></filter>
<clipPath id="ring"><path d="M0,0 H600 V600 H0Z M40,40 V560 H560 V40Z" clip-rule="evenodd"/></clipPath>
<mask id="holeM"><rect width="600" height="600" fill="#fff"/><rect x="40" y="40" width="520" height="520" fill="#000"/></mask>
</defs>
<!-- soft drop shadow outside -->
<rect x="6" y="14" width="590" height="588" rx="30" fill="#000" opacity=".45" filter="url(#sh)" mask="url(#holeM)"/>
<g clip-path="url(#ring)">
 <rect width="600" height="600" rx="26" fill="url(#stone)"/>
 <rect width="600" height="600" fill="#7a4a5a" filter="url(#tex)" opacity=".42" style="mix-blend-mode:overlay"/>
 <rect x="10" y="10" width="580" height="580" rx="20" fill="url(#zel)" opacity=".55"/>
 <rect x="12" y="12" width="576" height="576" rx="19" fill="none" stroke="#12081f" stroke-width="2.4" opacity=".7"/>
 <rect x="34" y="34" width="532" height="532" rx="4" fill="none" stroke="#12081f" stroke-width="2.4" opacity=".7"/>
 <rect width="600" height="600" fill="url(#shadeL)"/>
 <rect width="600" height="600" filter="url(#grain)" opacity=".5"/>
</g>
<rect x="2.6" y="2.6" width="594.8" height="594.8" rx="24" fill="none" stroke="${OL}" stroke-width="5.4"/>
<rect x="2.6" y="2.6" width="594.8" height="594.8" rx="24" fill="none" stroke="url(#goldD)" stroke-width="3.4"/>
<rect x="4.4" y="4.4" width="591.2" height="591.2" rx="22.4" fill="none" stroke="#fff6c0" stroke-width=".8" opacity=".7"/>
<rect x="21" y="21" width="558" height="558" rx="9" fill="none" stroke="${OL}" stroke-width="5"/>
<rect x="21" y="21" width="558" height="558" rx="9" fill="none" stroke="url(#goldD)" stroke-width="2.8"/>
<rect x="34" y="34" width="532" height="532" rx="4" fill="none" stroke="url(#goldD)" stroke-width="1.6"/>
<path d="M21,21 H579 V579 H21Z M34,34 V566 H566 V34Z" fill="url(#lap)" fill-rule="evenodd"/>
<path d="M21,21 H579 V579 H21Z M34,34 V566 H566 V34Z" fill="url(#zel)" fill-rule="evenodd" opacity=".75"/>
<path d="M21,21 H579 V579 H21Z M34,34 V566 H566 V34Z" fill="url(#shadeL)" fill-rule="evenodd"/>
<!-- inner lip (gold bevel) around the board -->
<rect x="37" y="37" width="526" height="526" rx="4" fill="none" stroke="${OL}" stroke-width="7"/>
<rect x="37" y="37" width="526" height="526" rx="4" fill="none" stroke="url(#goldD)" stroke-width="4.6"/>
<rect x="38.6" y="38.6" width="522.8" height="522.8" rx="3" fill="none" stroke="#fff6c0" stroke-width="1" opacity=".75"/>
<rect x="34.4" y="34.4" width="531.2" height="531.2" rx="5" fill="none" stroke="#5a2a0c" stroke-width="1" opacity=".7"/>
<!-- board backing (translucent night glass) -->
<rect x="40" y="40" width="520" height="520" fill="url(#boardG)"/>
<rect x="40" y="40" width="520" height="520" fill="none" stroke="#000" stroke-width="10" opacity=".35" filter="url(#sh)"/>
<rect x="40" y="40" width="520" height="520" fill="none" stroke="#ffc77a" stroke-width="1" opacity=".25"/>
<!-- corner rosettes and side studs -->
${rosette(22, 22, 20)}${rosette(578, 22, 20)}${rosette(22, 578, 20)}${rosette(578, 578, 20)}
${[170, 300, 430].map(t => stud(20, t, 'turq') + stud(580, t, 'turq') + stud(t, 20, 'lapis') + stud(t, 580, 'lapis')).join('')}
<!-- keystone crest (top) with crescent and ruby, plaque (bottom) -->
<g><path d="M262,34 Q300,4 338,34 L330,44 Q300,32 270,44Z" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/><path d="M265,35 Q300,8 335,35 L328,42 Q300,31 272,42Z" fill="url(#goldV)"/><path d="M270,34 Q300,12 328,33" fill="none" stroke="#fff6c0" stroke-width="1.4" opacity=".85"/>
<circle cx="300" cy="24" r="9" fill="${OL}"/><circle cx="300" cy="24" r="7.4" fill="url(#ruby)"/><ellipse cx="297" cy="21" rx="2.6" ry="1.8" fill="#fff" opacity=".85"/></g>
<g><path d="M252,566 H348 L340,584 H260Z" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/><path d="M255,568 H345 L338,581 H262Z" fill="url(#goldV)"/><path d="M258,569.6 H342" stroke="#fff6c0" stroke-width="1.2" opacity=".85"/>
<path d="M300,571 l2.2,4.6 5,.7 -3.6,3.4 .9,5 -4.5,-2.4 -4.5,2.4 .9,-5 -3.6,-3.4 5,-.7z" fill="#5a2a0c" opacity=".7" transform="scale(.9) translate(33 56)"/></g>
</svg>`;
fs.writeFileSync(path.join(__dirname, 'bake/frame.svg'), svg);
