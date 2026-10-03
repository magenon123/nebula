const fs = require('fs'), path = require('path'); const { rng } = require('./lib.cjs'); const R = rng(5); const f = n => +(+n).toFixed(1);
let ic = ''; for (let x = 70; x < 600; x += 9 + R() * 16) { const l = 6 + R() * 16; ic += `<path d="M${f(x)} 112L${f(x + 4.5)} 112L${f(x + 2)} ${f(112 + l)}Z" fill="url(#lgIce)" opacity=".9"/>`; }
let st = ''; for (let i = 0; i < 16; i++) st += `<circle cx="${f(40 + R() * 580)}" cy="${f(8 + R() * 130)}" r="${(.5 + R() * 1.1).toFixed(1)}" fill="#fff" opacity="${(.3 + R() * .5).toFixed(2)}"/>`;
const T = 'font-family="Cinzel,Georgia,serif" font-weight="900" text-anchor="middle"';
const svg = `<svg id="logo" viewBox="0 0 660 150" overflow="visible">
 <defs>
  <linearGradient id="lgFill" x1="0" y1="26" x2="0" y2="108" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#d4f1ff"/><stop offset=".62" stop-color="#7fd0f0"/><stop offset="1" stop-color="#3a78d0"/></linearGradient>
  <linearGradient id="lgAur" x1="0" y1="0" x2="660" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4dffb0"/><stop offset=".5" stop-color="#7dd8ff"/><stop offset="1" stop-color="#a77bff"/></linearGradient>
  <linearGradient id="lgIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2fdff"/><stop offset="1" stop-color="#8fd0f0" stop-opacity=".25"/></linearGradient>
  <linearGradient id="lgSheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="lgPlank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b07a48"/><stop offset=".5" stop-color="#6e4424"/><stop offset="1" stop-color="#2a170a"/></linearGradient>
  <radialGradient id="lgGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7dffc4" stop-opacity=".55"/><stop offset="1" stop-color="#7dffc4" stop-opacity="0"/></radialGradient>
  <clipPath id="lgClip"><text x="330" y="102" ${T} font-size="84" letter-spacing="3">AURORA</text></clipPath>
 </defs>
 <ellipse cx="330" cy="74" rx="330" ry="64" fill="url(#lgGlow)"/>
 ${st}
 <!-- sign plank behind LODGE -->
 <g transform="translate(0 0)">
 <path d="M150 112L168 100H492L510 112L498 140Q330 150 162 140Z" fill="url(#lgPlank)" stroke="#120a05" stroke-width="2"/>
 <path d="M160 108H500" stroke="#ffe0b0" stroke-opacity=".35" stroke-width="1.6"/>
 <path d="M178 124H484M190 132H470" stroke="#25140a" stroke-opacity=".35" stroke-width="1"/>
 <circle cx="170" cy="118" r="3.6" fill="#9fb0c4" stroke="#05080c"/><circle cx="490" cy="118" r="3.6" fill="#9fb0c4" stroke="#05080c"/>
 <text x="330" y="136" ${T} font-size="31" letter-spacing="14" fill="#05080c" opacity=".6" transform="translate(1.5 2)">LODGE</text>
 <text x="330" y="136" ${T} font-size="31" letter-spacing="14" fill="url(#lgFill)" stroke="#0a1840" stroke-width="2" paint-order="stroke" stroke-linejoin="round">LODGE</text>
 </g>
 <!-- ARCTIC small + AURORA big -->
 <text x="330" y="26" ${T} font-size="17" letter-spacing="16" fill="url(#lgAur)" stroke="#05102a" stroke-width="3" paint-order="stroke" stroke-linejoin="round">ARCTIC</text>
 <text x="330" y="106" ${T} font-size="84" letter-spacing="3" fill="#02061a" opacity=".55" transform="translate(2 5)">AURORA</text>
 <text x="330" y="102" ${T} font-size="84" letter-spacing="3" fill="url(#lgFill)" stroke="#0a1840" stroke-width="5" paint-order="stroke" stroke-linejoin="round">AURORA</text>
 <text x="330" y="102" ${T} font-size="84" letter-spacing="3" fill="none" stroke="url(#lgAur)" stroke-width="1.4" stroke-linejoin="round" opacity=".9">AURORA</text>
 <g clip-path="url(#lgClip)"><rect class="lgShine" x="-120" y="20" width="70" height="100" fill="url(#lgSheen)" transform="skewX(-20)" opacity=".8"/></g>
 <g class="lgIc">${ic}</g>
 <g fill="#fff"><path d="M30 60l2.5-10 2.5 10 10 2.5-10 2.5-2.5 10-2.5-10-10-2.5z" opacity=".8"/><path d="M624 40l2-8 2 8 8 2-8 2-2 8-2-8-8-2z" opacity=".7"/></g>
</svg>`;
fs.writeFileSync(path.join(__dirname, '../logo.html'), `<!-- Arctic Aurora Lodge logo (leo). 660x150 at stage (450,6). Cinzel 900 (embedded in slot.css). Only the sheen sweeps (CSS). -->\n` + svg + '\n');
