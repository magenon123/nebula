// node logo.cjs -> ../logo.html (+ logo.css). 660x150 at stage (450,-10)
const fs = require('fs'), path = require('path'); const { rnd, seed, f, star4 } = require('./lib.cjs'); seed(5);
let dust = ''; for (let i = 0; i < 26; i++) dust += `<circle cx="${f(30 + rnd() * 600)}" cy="${f(14 + rnd() * 110)}" r="${f(.5 + rnd() * 1.2)}" fill="#ffe9a8" opacity="${f(.25 + rnd() * .5)}"/>`;
const T1 = `<text x="330" y="78" font-family="'Cinzel Decorative',Cinzel,Georgia,serif" font-weight="900" text-anchor="middle" font-size="68" letter-spacing="2"`;
const svg = `<!-- Sirocco's Lamp Bazaar logo (leo). 660x150 at stage (450,-10). Cinzel Decorative 900 (embedded in slot.css). Only the sheen sweeps (CSS). -->
<svg id="logo" viewBox="0 0 660 150" overflow="visible">
 <defs>
  <linearGradient id="lgFill" x1="0" y1="26" x2="0" y2="84" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffbe6"/><stop offset=".3" stop-color="#ffe08a"/><stop offset=".62" stop-color="#f0a22c"/><stop offset="1" stop-color="#a8581a"/></linearGradient>
  <linearGradient id="lgRib" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a2a78"/><stop offset=".5" stop-color="#1b5ac8"/><stop offset="1" stop-color="#2a8ae8"/></linearGradient>
  <linearGradient id="lgGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a3d14"/><stop offset=".3" stop-color="#e79a2c"/><stop offset=".6" stop-color="#fff0a0"/><stop offset=".85" stop-color="#f1a72f"/><stop offset="1" stop-color="#ffe9a0"/></linearGradient>
  <linearGradient id="lgSheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="lgGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb23a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb23a" stop-opacity="0"/></radialGradient>
  <clipPath id="lgClip"><text x="330" y="78" font-family="'Cinzel Decorative',Cinzel,Georgia,serif" font-weight="900" text-anchor="middle" font-size="68" letter-spacing="2">SIROCCO'S</text></clipPath>
 </defs>
 <ellipse cx="330" cy="70" rx="330" ry="66" fill="url(#lgGlow)"/>
 ${dust}
 <!-- ribbon behind LAMP BAZAAR -->
 <g>
  <path d="M96,100 L128,98 L128,128 L96,130 L108,115Z" fill="#0a2060" stroke="#140a28" stroke-width="2" stroke-linejoin="round"/><path d="M564,100 L532,98 L532,128 L564,130 L552,115Z" fill="#0a2060" stroke="#140a28" stroke-width="2" stroke-linejoin="round"/>
  <path d="M118,92 Q330,106 542,92 L542,126 Q330,140 118,126Z" fill="#140a28" stroke="#140a28" stroke-width="5" stroke-linejoin="round"/>
  <path d="M118,92 Q330,106 542,92 L542,126 Q330,140 118,126Z" fill="url(#lgRib)"/>
  <path d="M118,92 Q330,106 542,92" fill="none" stroke="url(#lgGold)" stroke-width="3"/><path d="M118,126 Q330,140 542,126" fill="none" stroke="url(#lgGold)" stroke-width="3"/>
  <path d="M122,95 Q330,109 538,95" fill="none" stroke="#fff6c0" stroke-width=".9" opacity=".8"/>
  <g fill="#ffe08a" opacity=".85">${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${150 + i * 7}" cy="${111 + (i % 2) * 0}" r="1.3"/><circle cx="${510 - i * 7}" cy="${111}" r="1.3"/>`).join('')}</g>
  <text x="330" y="122" font-family="Cinzel,Georgia,serif" font-weight="900" text-anchor="middle" font-size="25" letter-spacing="9" fill="#05102a" opacity=".6" transform="translate(1.4 2)">LAMP BAZAAR</text>
  <text x="330" y="122" font-family="Cinzel,Georgia,serif" font-weight="900" text-anchor="middle" font-size="25" letter-spacing="9" fill="url(#lgFill)" stroke="#0a1a50" stroke-width="3" paint-order="stroke" stroke-linejoin="round">LAMP BAZAAR</text>
 </g>
 <!-- SIROCCO'S -->
 ${T1} fill="#1a0828" opacity=".6" transform="translate(2 5)">SIROCCO'S</text>
 ${T1} fill="url(#lgFill)" stroke="#3a1060" stroke-width="7" paint-order="stroke" stroke-linejoin="round">SIROCCO'S</text>
 ${T1} fill="none" stroke="#fff3b0" stroke-width="1.1" opacity=".75" stroke-linejoin="round" transform="translate(0 -.6)">SIROCCO'S</text>
 ${T1} fill="none" stroke="#7a3d14" stroke-width=".8" opacity=".5" transform="translate(.8 .9)">SIROCCO'S</text>
 <g clip-path="url(#lgClip)"><rect class="lgShine" x="-120" y="10" width="70" height="90" fill="url(#lgSheen)" transform="skewX(-20)" opacity=".8"/></g>
 <!-- small lamp motifs left/right of the ribbon -->
 <g transform="translate(70 92) scale(.36)"><use href="#s8" width="128" height="128" x="-64" y="-64"/></g>
 <g transform="translate(590 92) scale(-.36 .36)"><use href="#s8" width="128" height="128" x="-64" y="-64"/></g>
 <g>${star4(40, 40, 9, '#fff6c8', .85)}${star4(626, 34, 7, '#fff6c8', .8)}${star4(600, 66, 4, '#fff', .8)}</g>
</svg>
`;
fs.writeFileSync(path.join(__dirname, '../logo.html'), svg);
fs.writeFileSync(path.join(__dirname, 'logo.css'), `/* ---------- logo ---------- */
#logo{left:450px;top:-10px;width:660px;height:150px;overflow:visible;pointer-events:none}
#logo .lgShine{animation:lgSh 7s ease-in-out infinite}
@keyframes lgSh{0%,55%{transform:translateX(0) skewX(-20deg)}100%{transform:translateX(900px) skewX(-20deg)}}
`);
console.log('logo.html', svg.length);
