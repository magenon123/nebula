const fs = require('fs'), path = require('path'); const { rng } = require('./lib.cjs'); const R = rng(9); const f = n => +(+n).toFixed(1);
let grain = ''; for (let i = 0; i < 40; i++) { const x = 4 + R() * 106, y = 8 + R() * 480; grain += `M${f(x)} ${f(y)}v${f(10 + R() * 40)}`; }
const bolt = (x, y) => `<circle cx="${x}" cy="${y}" r="3.6" fill="url(#auIron)" stroke="#05080c" stroke-width=".9"/><circle cx="${x - 1}" cy="${y - 1.1}" r="1.1" fill="#cfe4f4" opacity=".8"/>`;
const gem = (i) => `<i class="g g${i + 1}"><b>${i + 1}</b><svg viewBox="0 0 128 128"><use href="#s11"/></svg></i>`;
const html = `<!-- Aurora meter (leo). #aura sits left of the board at stage (306,190) 114x510. Top: the LIT medallion (Aurora Muse: the symbol the aurora lights in free spins; add class "fs" to #aura and put <svg viewBox="0 0 128 128"><use href="#sN"/></svg> into .litSym). Below: 8 gem sockets, add class "on" to .g1..g8 as Aurora Gems land (4 = Sweep starts, more gems = more sweeps; socket 4 is marked). -->
<div id="aura">
 <svg class="auBack" viewBox="0 0 114 510" stroke-linejoin="round" stroke-linecap="round">
  <defs>
   <linearGradient id="auWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b07a48"/><stop offset=".25" stop-color="#8a5a32"/><stop offset=".6" stop-color="#5a3a1e"/><stop offset="1" stop-color="#2a170a"/></linearGradient>
   <linearGradient id="auWell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2a58"/><stop offset=".5" stop-color="#071a3c"/><stop offset="1" stop-color="#040e24"/></linearGradient>
   <linearGradient id="auRim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4dffb0"/><stop offset=".6" stop-color="#7dd8ff"/><stop offset="1" stop-color="#a77bff"/></linearGradient>
   <linearGradient id="auSnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#cfe4f4"/><stop offset="1" stop-color="#7fa4cc"/></linearGradient>
   <linearGradient id="auIron" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb0c4"/><stop offset=".5" stop-color="#3a4656"/><stop offset="1" stop-color="#10151c"/></linearGradient>
   <linearGradient id="auIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2fdff"/><stop offset="1" stop-color="#8fd0f0" stop-opacity=".3"/></linearGradient>
  </defs>
  <rect x="3" y="14" width="108" height="492" rx="14" fill="#000" opacity=".5" transform="translate(0 6)"/>
  <rect x="3" y="10" width="108" height="492" rx="14" fill="url(#auWood)" stroke="#120a05" stroke-width="1.6"/>
  <path d="${grain}" stroke="#25140a" stroke-opacity=".38" stroke-width=".9" fill="none"/>
  <path d="M8 24V490" stroke="#ffe0b0" stroke-opacity=".3" stroke-width="2"/>
  <rect x="12" y="18" width="90" height="476" rx="9" fill="url(#auWell)" stroke="url(#auRim)" stroke-width="2"/>
  <path d="M14 20H100" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>
  <path d="M12 8C20 -6 40 -4 52 -2C70 -8 96 -4 102 6C110 8 112 20 104 20C80 18 60 24 40 20C28 24 14 22 12 8Z" fill="url(#auSnow)"/>
  <path d="M26 16L30 16L28 28ZM44 16L48 16L46 34ZM66 16L69 16L67.5 26ZM84 16L88 16L86 32Z" fill="url(#auIce)" opacity=".9"/>
  ${bolt(18, 30)}${bolt(96, 30)}${bolt(18, 484)}${bolt(96, 484)}
  <path d="M20 168H94" stroke="url(#auRim)" stroke-width="1.4" opacity=".7"/>
 </svg>
 <div class="litBox"><svg class="litSym" viewBox="0 0 128 128"></svg><b class="litLbl">LIT</b></div>
 <div class="gs">${Array.from({ length: 8 }, (_, i) => gem(i)).join('')}</div>
</div>
`;
fs.writeFileSync(path.join(__dirname, '../side.html'), html);
