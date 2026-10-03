// node seal.cjs -> seal.css (data-URI gold seal overlay for sealed tiles) + seal-sym.txt (<symbol id="seal"> for fx use)
const fs = require('fs'); const { f, OL } = require('./lib.cjs');
const defs = `<defs><linearGradient id="slg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c0"/><stop offset=".28" stop-color="#f6c24a"/><stop offset=".6" stop-color="#b8681a"/><stop offset=".82" stop-color="#f1a72f"/><stop offset="1" stop-color="#fff0a8"/></linearGradient>
<radialGradient id="slm" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#fff6c0"/><stop offset=".35" stop-color="#f6b93a"/><stop offset=".8" stop-color="#a8581a"/><stop offset="1" stop-color="#6a3410"/></radialGradient>
<linearGradient id="slr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0354f"/><stop offset="1" stop-color="#6a0a24"/></linearGradient>
<linearGradient id="sls" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff4c8" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
let scal = '';
for (let i = 0; i < 14; i++) { const a = i * Math.PI * 2 / 14; scal += `<circle cx="${f(82 + 13.4 * Math.cos(a))}" cy="${f(82 + 13.4 * Math.sin(a))}" r="3.6"/>`; }
const body = `${defs}
<path d="M70,90 L66,104 L74,98 L80,106 L82,92Z" fill="url(#slr)" stroke="${OL}" stroke-width="1.2" stroke-linejoin="round"/><path d="M90,88 L98,100 L88,98 L84,106 L82,92Z" fill="#a01a3a" stroke="${OL}" stroke-width="1.2" stroke-linejoin="round"/>
<rect x="2.4" y="2.4" width="95.2" height="95.2" rx="15" fill="none" stroke="${OL}" stroke-width="6.4"/>
<rect x="2.4" y="2.4" width="95.2" height="95.2" rx="15" fill="none" stroke="url(#slg)" stroke-width="4.2"/>
<rect x="4.2" y="4.2" width="91.6" height="91.6" rx="13.4" fill="none" stroke="#fff6c0" stroke-width=".9" opacity=".8"/>
<rect x="6.4" y="6.4" width="87.2" height="87.2" rx="12" fill="none" stroke="#f6b93a" stroke-width="1.2" opacity=".55"/>
<path d="M14,3 L50,3 L3,50 L3,14Z" fill="url(#sls)"/>
<g fill="url(#slg)" stroke="${OL}" stroke-width="1">${[[10, 10], [90, 10], [10, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2"/>`).join('')}</g>
<g fill="#fff6c0" opacity=".9"><circle cx="8.8" cy="8.6" r="1.3"/><circle cx="88.8" cy="8.6" r="1.3"/><circle cx="8.8" cy="88.6" r="1.3"/></g>
<g transform="translate(9.8 9.8) scale(.88)"><g fill="url(#slm)" stroke="${OL}" stroke-width="1.1">${scal}<circle cx="82" cy="82" r="14.4"/></g>
<circle cx="82" cy="82" r="11.6" fill="none" stroke="#6a3410" stroke-width="1.4"/><circle cx="82" cy="82" r="10" fill="url(#slm)" stroke="#fff0a0" stroke-width=".7" opacity=".95"/>
<path d="M82,74.6 C76,75 73,80 74.6,85 C76.4,89.6 82,90.6 86,88 C81,88.4 78.4,84.4 79.4,80.6 C80,78 81,76 82,74.6Z" fill="#fff6c0" stroke="#6a3410" stroke-width=".7"/>
<path d="M87.6,76.4 l1.1,3 3.1,.4 -2.4,2 .8,3 -2.6,-1.7 -2.7,1.6 .9,-3 -2.4,-2 3.1,-.3z" fill="#fff6c0" stroke="#6a3410" stroke-width=".6"/>
<path d="M72,76 C74,72 78,70.4 82,70.4" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7" stroke-linecap="round"/></g>`;
const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'>${body}</svg>`;
const uri = 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27');
const css = `/* ---------- SEALED tiles: add class "sealed" to .cell (gold frame + wax seal medallion + gold glaze); add "in" for the stamp-in animation (0.6 s); "pulse" re-flashes it when the chain grows ---------- */
.cell.sealed{box-shadow:inset 0 0 0 1px rgba(40,14,4,.85),inset 0 0 16px rgba(255,190,70,.55),0 0 0 1.5px rgba(30,10,4,.85),0 0 11px rgba(255,190,70,.6),0 3px 6px rgba(0,0,0,.5)}
.cell.sealed::before{inset:0;height:auto;border-radius:inherit;background:linear-gradient(135deg,rgba(255,226,130,.30),rgba(255,170,50,.07) 55%,rgba(255,210,100,.2))}
.cell.sealed::after{content:"";position:absolute;inset:-4px;background:url("${uri}") 0 0/100% 100% no-repeat;z-index:3;pointer-events:none}
.cell.sealed.in::after{animation:slIn .62s cubic-bezier(.2,1.5,.4,1) both}
.cell.sealed.in{animation:slFl .9s ease-out both}
.cell.sealed.pulse{animation:slFl .7s ease-out both}
@keyframes slIn{0%{transform:scale(2.1) rotate(-10deg);opacity:0}40%{opacity:1}72%{transform:scale(.93) rotate(1deg)}100%{transform:none;opacity:1}}
@keyframes slFl{0%{filter:brightness(2.1) saturate(1.5)}100%{filter:none}}
`;
fs.writeFileSync(__dirname + '/seal.css', css);
fs.writeFileSync(__dirname + '/seal-sym.txt', `<symbol id="seal" viewBox="0 0 100 100">${body.replace(/id="sl/g, 'id="slx').replace(/url\(#sl/g, 'url(#slx')}</symbol>\n`);
console.log('seal.css', css.length, 'bytes');
