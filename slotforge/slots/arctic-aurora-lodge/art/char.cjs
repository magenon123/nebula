// Aino (guide) + Tuuli (husky). Writes ../character.html. viewBox 480x410 at stage (1120,340).
const fs = require('fs'), path = require('path');
const { Sym, rng, fur, smooth, strokes, f } = require('./lib.cjs');
const S = new Sym('ch'); const R = rng(404);
const poly = (pts) => 'M' + pts.map(p => p.map(f).join(' ')).join('L') + 'Z';
const ell = (cx, cy, rx, ry, n = 28, jit = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
// ---------------- gradients
const wool = S.lin(80, 160, 260, 340, [[0, '#3b64b8'], [.4, '#244890'], [1, '#0e2152']]);
const woolHi = S.lin(100, 150, 160, 300, [[0, '#9fc0ff', .45], [1, '#9fc0ff', 0]]);
const skin = S.rad(156, 92, 52, [[0, '#ffe0c4'], [.6, '#efbf98'], [1, '#c98c68']]);
const furC = S.lin(0, 40, 0, 170, [[0, '#fbf5e8'], [.5, '#e4d6bc'], [1, '#a08a68']]);
const hair = S.lin(0, 60, 0, 140, [[0, '#6a4630'], [.5, '#3e2619'], [1, '#1e120b']]);
const red = S.lin(0, 0, 1, 1, [[0, '#ff6a5c'], [.5, '#d4202e'], [1, '#7a0c1a']]);
const redV = (x1, y1, x2, y2) => S.lin(x1, y1, x2, y2, [[0, '#f0504a'], [.55, '#c8222e'], [1, '#6e0c1a']]);
const gold = S.lin(0, 0, 1, 1, [[0, '#fff0b0'], [.5, '#e0b24e'], [1, '#8a5a18']]);
const snowG = S.lin(0, 330, 0, 410, [[0, '#9fc4e0'], [.35, '#4a7aa8'], [.8, '#12284a', .6], [1, '#12284a', 0]]);
const dogG = S.lin(0, 200, 0, 340, [[0, '#7a8aa0'], [.5, '#4a5668'], [1, '#262e3c']]);
const dogW = S.lin(0, 200, 0, 340, [[0, '#ffffff'], [.6, '#e4ecf6'], [1, '#aab8cc']]);
const glowW = S.rad(0, 0, 1, [[0, '#ffd890', .9], [.4, '#ffa840', .4], [1, '#ff9a30', 0]]);
const corona = S.rad(240, 170, 260, [[0, '#ffffff', .55], [.25, '#7dffc4', .35], [.6, '#8a5cff', .18], [1, '#8a5cff', 0]]);
// ---------------- pieces
const hoodOuter = ell(165, 94, 57, 64, 30), hoodInner = ell(165, 104, 36, 41, 30);
const hoodFur = fur(hoodOuter, { seed: 3, len: 9, step: 7, sweep: .55 });
const ringPath = hoodFur + ' ' + poly(hoodInner).replace(/^M/, 'M');
const collarPts = ell(165, 166, 66, 17, 26);
const collar = fur(collarPts, { seed: 5, len: 7, step: 7, sweep: .3 });
const dogHead = smooth([[346, 198], [352, 172], [372, 160], [388, 160], [408, 172], [414, 198], [404, 222], [388, 236], [372, 236], [356, 222]], 5);
const dogBody = smooth([[340, 338], [328, 284], [342, 244], [380, 226], [420, 244], [436, 288], [430, 338]], 5);
const dogChest = smooth([[360, 252], [380, 238], [400, 252], [405, 300], [380, 336], [355, 300]], 5);
const tail = [[432, 318], [452, 296], [470, 262], [472, 232], [462, 218], [452, 240], [446, 268], [432, 288]];
const eyeL = [151, 103], eyeR = [179, 103];
const eye = ([x, y], k) => `<g class="cEye${k}"><ellipse cx="${x}" cy="${y}" rx="9.6" ry="6.6" fill="#f4f0ea" stroke="#7a4a3a" stroke-opacity=".6" stroke-width=".6"/>
 <g class="cPup"><circle cx="${x}" cy="${y}" r="5.6" fill="${S.rad(x, y - 1, 6, [[0, '#8a5a38'], [.6, '#3e2412'], [1, '#150a05']])}"/><circle cx="${x}" cy="${y}" r="2.6" fill="#05030a"/><circle cx="${x - 2}" cy="${y - 2.2}" r="1.7" fill="#fff"/><circle cx="${x + 2.2}" cy="${y + 1.4}" r=".6" fill="#fff" opacity=".7"/></g>
 <path d="M${x - 10.4} ${y + .5}Q${x} ${y - 11} ${x + 10.4} ${y + .5}" fill="none" stroke="#2a160c" stroke-width="2.4" stroke-linecap="round"/><path d="M${x + (k ? 8 : -8)} ${y}l${k ? 3 : -3} -2" stroke="#2a160c" stroke-width="1.2" stroke-linecap="round"/></g>`;
const lid = ([x, y]) => `<ellipse cx="${x}" cy="${y - 1}" rx="11" ry="8" fill="${skin}" stroke="#2a160c" stroke-width="1" stroke-opacity=".6"/>`;
const mitten = (x, y, rot, col = 'red', sx = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sx} 1)">
  <path d="M-11 -4Q-14 -22 0 -26Q13 -24 12 -6Q12 4 10 14L-9 14Q-11 6 -11 -4Z" fill="${redV(-12, -26, 12, 14)}" stroke="#3a0610" stroke-width="1.2"/>
  <path d="M10 -4Q20 -6 20 4Q18 10 10 10Z" fill="${redV(8, -6, 20, 10)}" stroke="#3a0610" stroke-width="1.2"/>
  <path d="M-11 1H11" stroke="#fff" stroke-width="3" opacity=".9"/><path d="M-11 1l3 -3 3 3 3 -3 3 3 3 -3 3 3 3 -3 3 3" fill="none" stroke="#fff" stroke-width="1.4" transform="translate(0 -1)"/>
  <path d="M-8 -16Q-4 -22 4 -22" fill="none" stroke="#ffb0a0" stroke-opacity=".7" stroke-width="1.8" stroke-linecap="round"/></g>`;
const furCuff = (x, y, rx = 17) => `<path d="${fur(ell(x, y, rx, 8, 14), { seed: Math.round(x), len: 4, step: 5, sweep: .3 })}" fill="${furC}" stroke="#7a6446" stroke-width=".6" stroke-opacity=".6"/>`;
// ---------------- Aino
const parka = 'M120 166Q100 178 98 208Q96 236 100 252Q86 300 64 358L268 358Q244 300 232 252Q236 236 232 208Q230 178 210 166Q165 152 120 166Z';
const limb = (d, w1, c1, c2, hi, rim) => `<path d="${d}" fill="none" stroke="#08153a" stroke-width="${w1 + 3.4}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c1}" stroke-width="${w1}" stroke-linecap="round"/><path d="${d}" transform="translate(${hi[0]} ${hi[1]})" fill="none" stroke="${c2}" stroke-opacity=".4" stroke-width="${w1 * .22}" stroke-linecap="round"/>${rim ? `<path d="${d}" transform="translate(${rim[0]} ${rim[1]})" fill="none" stroke="#7dffc4" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>` : ''}`;
const aino = `
 <g id="cBody">
  <ellipse cx="165" cy="362" rx="112" ry="14" fill="#02060e" opacity=".5"/>
  <clipPath id="chPk"><path d="${parka}"/></clipPath>
  <path d="${parka}" fill="${wool}" stroke="#08153a" stroke-width="1.6"/>
  <g clip-path="url(#chPk)">
   <path d="${parka}" fill="${woolHi}"/>
   <path d="M100 252Q165 268 232 252L240 270Q165 286 92 270Z" fill="#000" opacity=".18"/>
   <path d="M118 270Q104 310 90 352M146 280Q138 320 130 356M188 280Q196 320 206 356M214 270Q228 310 244 352" fill="none" stroke="#02081e" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>
   <path d="M126 280Q112 316 100 350M150 288Q142 322 136 354" fill="none" stroke="#9fc0ff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>
   ${strokes({ n: 240, seed: 21, box: [64, 150, 270, 358], dir: () => Math.PI / 2, len: [5, 9], w: 1, color: '#9fc0ff', op: .12, jit: .15 })}
   ${strokes({ n: 200, seed: 22, box: [64, 150, 270, 358], dir: () => Math.PI / 2, len: [5, 9], w: 1, color: '#02081e', op: .22, jit: .15 })}
   <path d="M159 168V358H172V168Z" fill="${redV(159, 0, 172, 0)}" stroke="#3a0610" stroke-width="1"/><path d="M165.5 170V356" stroke="#f0b020" stroke-width="2" stroke-dasharray="3 4"/>
   <path d="M60 322H274V331H60Z" fill="${redV(0, 322, 0, 331)}"/><path d="M60 331H274V337H60Z" fill="#f0b020"/><path d="M60 337H274V342H60Z" fill="#f6f2e6"/><path d="M60 342H274V347H60Z" fill="#2a64c8"/>
   <g fill="#fff" opacity=".85">${Array.from({ length: 17 }, (_, i) => `<path d="M${68 + i * 12.6} 326.5l2.4 2.4-2.4 2.4-2.4-2.4z"/>`).join('')}</g>
   <path d="M234 214Q242 270 266 340" fill="none" stroke="#7dffc4" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
   <ellipse cx="96" cy="330" rx="70" ry="60" fill="${S.ell(96, 330, 70, 60, [[0, '#ffb454', .38], [1, '#ffb454', 0]])}" style="mix-blend-mode:screen"/>
  </g>
  <path d="M97 242Q165 258 235 242L236 258Q165 274 96 258Z" fill="${S.lin(0, 242, 0, 262, [[0, '#8a5a34'], [.5, '#5a3a20'], [1, '#2a170a']])}" stroke="#1a0e06" stroke-width="1.2"/>
  <rect x="152" y="246" width="26" height="19" rx="3.5" fill="${gold}" stroke="#4a2c08" stroke-width="1.2"/><rect x="158" y="251" width="14" height="9" rx="2" fill="#4a2c08" opacity=".75"/><path d="M154 248H176" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/>
  <g id="cBraid"><path d="M205 138Q222 172 216 216" fill="none" stroke="#1e120b" stroke-width="17" stroke-linecap="round"/>
   ${[0, 1, 2, 3, 4, 5].map(i => { const t = i / 5, x = 206 + 10 * t + 5 * Math.sin(t * 3), y = 144 + 70 * t; return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="8.5" ry="7.6" fill="${hair}" stroke="#1a0d06" stroke-width="1"/><path d="M${f(x - 6)} ${f(y - 2)}Q${f(x)} ${f(y - 7)} ${f(x + 6)} ${f(y - 2)}" fill="none" stroke="#b88a68" stroke-opacity=".6" stroke-width="1.2"/>`; }).join('')}
   <path d="M208 216h16l-2 8h-12z" fill="${redV(0, 216, 0, 224)}" stroke="#3a0610" stroke-width="1"/><path d="M211 224l-3 14M216 224v16M221 224l3 14" stroke="#c8222e" stroke-width="2.4" stroke-linecap="round"/></g>
  <path d="${collar}" fill="${furC}" stroke="#7a6446" stroke-width=".6" stroke-opacity=".5"/>
  ${strokes({ n: 90, seed: 8, box: [100, 152, 230, 182], dir: (x, y) => Math.PI / 2 + (x - 165) * .01, len: [4, 8], w: 1, color: '#7a6446', op: .4 })}
  ${strokes({ n: 70, seed: 9, box: [100, 152, 230, 182], dir: (x, y) => Math.PI / 2, len: [4, 8], w: .9, color: '#fff', op: .8 })}
 </g>
 <!-- arm L (viewer's left): holds the lantern -->
 <g id="cArmL">${limb('M114 182Q96 200 90 236', 25, S.lin(90, 180, 120, 240, [[0, '#4a74c8'], [1, '#1c3c88']]), '#bcd4ff', [-6, 0], null)}
  <g id="cForeL">${limb('M90 236Q86 266 94 294', 21, S.lin(80, 236, 110, 296, [[0, '#3f68bc'], [1, '#14307a']]), '#bcd4ff', [-5, 0], null)}
   <path d="M80 286Q94 296 108 288L108 296Q94 304 80 296Z" fill="${redV(0, 286, 0, 300)}" stroke="#3a0610" stroke-width="1"/>
   ${furCuff(94, 290, 17)}${mitten(94, 300, 4)}
   <g id="cLant"><use href="#s5" x="58" y="296" width="72" height="72"/></g>
  </g></g>
 <!-- arm R (viewer's right) -->
 <g id="cArmR">${limb('M216 182Q238 200 244 236', 25, S.lin(210, 180, 250, 240, [[0, '#3a64b8'], [1, '#0e2860']]), '#9fc0ff', [-5, 0], [7, 0])}
  <g id="cForeR">${limb('M244 236Q248 266 240 294', 21, S.lin(230, 236, 262, 296, [[0, '#2f56a8'], [1, '#0c2258']]), '#9fc0ff', [-4, 0], [6, 0])}
   <path d="M224 286Q238 296 254 288L254 296Q238 304 224 296Z" fill="${redV(0, 286, 0, 300)}" stroke="#3a0610" stroke-width="1"/>
   ${furCuff(240, 290, 17)}${mitten(240, 300, -4, 'red', -1)}</g></g>
 <!-- head -->
 <g id="cHead">
  <path d="${poly(ell(165, 96, 54, 60, 30))}" fill="${S.lin(110, 40, 220, 150, [[0, '#2f56a8'], [1, '#0c2258']])}" stroke="#08153a" stroke-width="1.4"/>
  <path d="M134 100Q124 134 140 154L154 150Q142 128 148 104Z" fill="${hair}"/><path d="M196 100Q206 134 190 154L176 150Q188 128 182 104Z" fill="${hair}"/>
  <ellipse cx="165" cy="164" rx="16" ry="9" fill="#a8684a"/>
  <path id="cFace" d="M134 104Q134 76 165 72Q196 76 196 104Q197 128 183 141Q174 150 165 150Q156 150 147 141Q133 128 134 104Z" fill="${skin}" stroke="#a8684a" stroke-width="1" stroke-opacity=".6"/>
  <path d="M184 90Q197 104 195 120Q192 136 176 146Q188 130 186 110Z" fill="#b4724e" opacity=".32"/>
  <path d="M136 112Q134 126 146 140Q140 126 142 112Z" fill="#fff" opacity=".12"/>
  <ellipse cx="165" cy="150" rx="12" ry="4" fill="#8a4c34" opacity=".25"/>
  <ellipse cx="147" cy="122" rx="10" ry="6.4" fill="${S.rad(147, 122, 10, [[0, '#ff7a86', .5], [1, '#ff7a86', 0]])}"/><ellipse cx="183" cy="122" rx="10" ry="6.4" fill="${S.rad(183, 122, 10, [[0, '#ff7a86', .5], [1, '#ff7a86', 0]])}"/>
  <ellipse cx="152" cy="99" rx="14" ry="6" fill="#7a4a58" opacity=".18"/><ellipse cx="178" cy="99" rx="14" ry="6" fill="#7a4a58" opacity=".18"/>
  ${eye(eyeL, 'L')}${eye(eyeR, 'R')}
  <g id="cLids" opacity="0">${lid(eyeL)}${lid(eyeR)}</g>
  <g id="cBrows" stroke="#3a2214" stroke-width="2.8" stroke-linecap="round" fill="none"><path d="M141 91Q151 84 162 89"/><path d="M168 89Q179 84 189 91"/></g>
  <path d="M165 106Q161 118 158 123Q165 127 172 123Q169 118 165 106" fill="#c88a68" opacity=".5"/><ellipse cx="164" cy="121" rx="3.4" ry="1.8" fill="#fff" opacity=".4"/><path d="M159 124.5Q165 127.5 171 124.5" fill="none" stroke="#9a5a44" stroke-width="1.2" stroke-linecap="round"/>
  <g id="cMouth"><g class="m0"><path d="M154 135Q165 143 176 135Q165 138 154 135Z" fill="#d86a70" stroke="#a04a50" stroke-width="1.3" stroke-linejoin="round"/><path d="M159 137.5Q165 140.5 171 137.5" fill="none" stroke="#ffb0b4" stroke-width="1.2" stroke-linecap="round" opacity=".8"/></g>
   <g class="m1"><path d="M150 132Q165 152 180 132Q165 138 150 132Z" fill="#fff" stroke="#a04a50" stroke-width="1.6" stroke-linejoin="round"/><path d="M155 140Q165 147 175 140" fill="#e8707a" opacity=".7"/></g>
   <ellipse class="m2" cx="165" cy="137" rx="5.4" ry="6.6" fill="#6a1c24" stroke="#a04a50" stroke-width="1.4"/></g>
  <path d="M132 104Q130 70 165 62Q200 70 198 104Q197 86 182 76Q168 84 158 84Q146 88 140 110Z" fill="${S.lin(0, 62, 0, 104, [[0, '#7a4e34'], [1, '#2a170d']])}"/>
  <path d="M138 90Q150 66 178 68" fill="none" stroke="#b88a5c" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>
  <path d="${ringPath}" fill="${furC}" fill-rule="evenodd" stroke="#7a6446" stroke-width=".7" stroke-opacity=".6"/>
  ${strokes({ n: 150, seed: 31, box: [108, 34, 222, 156], dir: (x, y) => Math.atan2(y - 100, x - 165), len: [5, 10], w: 1, color: '#8a7050', op: .45, inside: (x, y) => { const dx = (x - 165) / 36, dy = (y - 104) / 41; return dx * dx + dy * dy > 1.15 && ((x - 165) / 57) ** 2 + ((y - 94) / 64) ** 2 < 1; } })}
  ${strokes({ n: 120, seed: 32, box: [108, 34, 222, 156], dir: (x, y) => Math.atan2(y - 100, x - 165), len: [5, 10], w: .9, color: '#fff', op: .8, inside: (x, y) => { const dx = (x - 165) / 36, dy = (y - 104) / 41; return dx * dx + dy * dy > 1.15 && ((x - 165) / 57) ** 2 + ((y - 94) / 64) ** 2 < 1; } })}
  <path d="M112 70Q112 50 135 40" fill="none" stroke="#7dffc4" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>
 </g>`;
// ---------------- Tuuli
const tuuli = `<g id="cDog" transform="translate(-34 4)">
  <ellipse cx="392" cy="352" rx="76" ry="11" fill="#02060e" opacity=".5"/>
  <g id="cDTail"><path d="${fur(tail, { seed: 61, len: 5, step: 6, sweep: .6 })}" fill="${S.lin(430, 220, 472, 320, [[0, '#8a98ac'], [.5, '#4a5668'], [1, '#2a3240']])}" stroke="#1a202c" stroke-width="1" stroke-opacity=".6"/>
   <path d="M446 232Q438 270 432 300" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="7" stroke-linecap="round"/>
   ${strokes({ n: 50, seed: 62, box: [430, 218, 474, 320], dir: () => -Math.PI / 2.4, len: [6, 12], w: 1, color: '#e8f0fa', op: .4 })}</g>
  <g id="cDBody"><path d="${fur(dogBody, { seed: 63, len: 5, step: 6, sweep: .5 })}" fill="${dogG}" stroke="#1a202c" stroke-width="1.2"/>
   ${strokes({ n: 120, seed: 64, box: [326, 226, 438, 340], dir: () => Math.PI / 2, len: [6, 12], w: 1, color: '#c8d4e4', op: .3, jit: .3 })}
   <path d="${fur(dogChest, { seed: 65, len: 4, step: 6, sweep: .4 })}" fill="${dogW}" stroke="#7a889e" stroke-width=".8" stroke-opacity=".6"/>
   ${strokes({ n: 60, seed: 66, box: [356, 240, 406, 336], dir: () => Math.PI / 2, len: [5, 10], w: 1, color: '#9aa8bc', op: .45, jit: .3 })}
   <path d="M358 296Q356 334 354 350Q358 358 376 357Q382 354 380 346Q380 322 378 296Z" fill="${dogW}" stroke="#7a889e" stroke-width="1"/><path d="M384 296Q384 322 384 346Q384 355 392 357Q408 358 410 350Q406 334 404 296Z" fill="${dogW}" stroke="#7a889e" stroke-width="1"/>
   <path d="M364 352l1 5M370 353v5M376 352l-1 5M390 353l1 5M397 353v5M404 352l-1 5" stroke="#7a889e" stroke-width="1" fill="none" stroke-linecap="round"/>
   <path d="M330 270Q326 300 336 330" fill="none" stroke="#7dffc4" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>
   <path d="M351 238Q380 256 410 238L412 252Q380 272 349 252Z" fill="${redV(0, 238, 0, 270)}" stroke="#3a0610" stroke-width="1.2"/><circle cx="384" cy="262" r="5" fill="${gold}" stroke="#4a2c08" stroke-width="1"/></g>
  <g id="cDHead">
   <g id="cDEarL"><path d="${poly([[352, 182], [348, 134], [374, 158]])}" fill="${S.lin(0, 134, 0, 182, [[0, '#3a4456'], [1, '#202836']])}" stroke="#1a202c" stroke-width="1.2"/><path d="${poly([[355, 176], [352, 146], [368, 160]])}" fill="#d8b8b0"/><path d="M350 140L352 176" stroke="#9aa8bc" stroke-opacity=".6" stroke-width="1.4"/></g>
   <g id="cDEarR"><path d="${poly([[408, 182], [412, 134], [386, 158]])}" fill="${S.lin(0, 134, 0, 182, [[0, '#3a4456'], [1, '#202836']])}" stroke="#1a202c" stroke-width="1.2"/><path d="${poly([[405, 176], [408, 146], [392, 160]])}" fill="#d8b8b0"/><path d="M411 140L408 176" stroke="#7dffc4" stroke-opacity=".6" stroke-width="1.4"/></g>
   <path d="${fur(dogHead, { seed: 67, len: 4, step: 5.5, sweep: .6 })}" fill="${S.rad(372, 184, 56, [[0, '#8a98ac'], [.55, '#566276'], [1, '#2c3444']])}" stroke="#1a202c" stroke-width="1.2"/>
   <clipPath id="chDH"><path d="${poly(dogHead)}"/></clipPath>
   <g clip-path="url(#chDH)">
    <path d="M380 160L370 178L362 214L372 236L388 236L398 214L392 178Z" fill="${dogW}"/>
    <path d="M346 205Q356 196 366 206L372 236L350 226Z" fill="${dogW}"/><path d="M414 205Q404 196 394 206L388 236L410 226Z" fill="${dogW}"/>
    <path d="M360 176Q364 170 370 174Q368 182 362 184Z M400 176Q396 170 390 174Q392 182 398 184Z" fill="#f4f8fc"/>
    ${strokes({ n: 120, seed: 68, box: [344, 158, 416, 238], dir: (x, y) => Math.atan2(y - 170, x - 380), len: [4, 8], w: 1, color: '#10151f', op: .3, inside: (x, y) => Math.abs(x - 380) > 14 && y < 210 })}
    ${strokes({ n: 80, seed: 69, box: [344, 158, 416, 238], dir: (x, y) => Math.PI / 2, len: [4, 8], w: .9, color: '#fff', op: .6, inside: (x, y) => Math.abs(x - 380) < 16 })}
   </g>
   <!-- eyes: husky ice blue -->
   <g id="cDEyes">${[[364, 194], [396, 194]].map(([x, y]) => `<path d="M${x - 8} ${y + 1}Q${x} ${y - 8} ${x + 8} ${y + 1}Q${x} ${y + 6} ${x - 8} ${y + 1}Z" fill="#0a0e16"/><ellipse cx="${x}" cy="${y}" rx="5.4" ry="4.6" fill="${S.rad(x - 1, y - 1, 6, [[0, '#e8fbff'], [.5, '#7fd0f0'], [1, '#2a78b8']])}"/><circle cx="${x}" cy="${y}" r="2.2" fill="#05080e"/><circle cx="${x - 1.6}" cy="${y - 1.8}" r="1.3" fill="#fff"/>`).join('')}</g>
   <g id="cDLids" opacity="0">${[[364, 194], [396, 194]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="8.6" ry="5.6" fill="#4a5668"/>`).join('')}</g>
   <path d="M356 186Q364 180 372 184M388 184Q396 180 404 186" stroke="#10151f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
   <!-- muzzle + jaw -->
   <g id="cDJaw"><path d="M366 222Q380 236 394 222L392 232Q380 246 368 232Z" fill="${dogW}" stroke="#7a889e" stroke-width="1" class="jc"/><path class="jo" d="M366 224Q380 232 394 224L396 240Q380 254 364 240Z" fill="#5a1a22" stroke="#2a0a10" stroke-width="1.2"/><path class="jo" d="M372 238Q380 252 388 238Q380 244 372 238Z" fill="#ff8a98"/></g>
   <path d="M370 212Q380 226 390 212Q388 206 380 206Q372 206 370 212Z" fill="${S.lin(0, 206, 0, 226, [[0, '#2a3040'], [1, '#05070c']])}"/><path d="M374 209Q380 207 386 209" stroke="#fff" stroke-opacity=".8" stroke-width="1.2" stroke-linecap="round" fill="none"/>
   <path d="M380 222V226" stroke="#10151f" stroke-width="1.4"/>
   <path d="M350 172Q352 160 366 158" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round"/>
  </g>
</g>`;
const VB = 'viewBox="0 0 480 410" stroke-linejoin="round" stroke-linecap="round" overflow="visible"';
const svg = `<div id="char">
<svg class="cl" id="cBackS" ${VB}>
 <defs>${S.defs.join('')}</defs>
 <g id="cCorona" opacity="0"><ellipse cx="240" cy="170" rx="260" ry="190" fill="${corona}"/><g id="cRays" fill="${S.rad(240, 170, 260, [[0, '#fff', .6], [1, '#9dffe0', 0]])}">${Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180, px = Math.cos(a + 1.5708), py = Math.sin(a + 1.5708); return `<path d="M${f(240 + 270 * Math.cos(a))} ${f(170 + 270 * Math.sin(a))}L${f(240 + 8 * px)} ${f(170 + 8 * py)}L${f(240 - 8 * px)} ${f(170 - 8 * py)}Z"/>`; }).join('')}</g></g>
 <mask id="chFade"><rect width="480" height="410" fill="url(#chFadeG)"/></mask><linearGradient id="chFadeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff"/><stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <g mask="url(#chFade)"><path d="M0 410V352Q40 322 120 336Q240 316 340 334Q430 322 480 346V410Z" fill="${snowG}"/><path d="M0 352Q40 322 120 336Q240 316 340 334Q430 322 480 346" fill="none" stroke="#9ffbd8" stroke-opacity=".55" stroke-width="2.4"/></g>
</svg>
<svg class="cl" id="cAinoS" ${VB}><g id="cAll"><g id="cAino">${aino}</g></g></svg>
<i class="cLG"></i>
<svg class="cl" id="cDogS" ${VB}>${tuuli}</svg>
<svg class="cl" id="cFogS" ${VB}><g id="cFog"><circle class="fg1" cx="358" cy="230" r="7" fill="${S.rad(358, 230, 8, [[0, '#fff', .7], [1, '#cfe8ff', 0]])}"/><circle class="fg2" cx="358" cy="230" r="8" fill="${S.rad(358, 230, 9, [[0, '#fff', .6], [1, '#cfe8ff', 0]])}"/></g></svg>
<svg class="cl" id="cFrontS" ${VB}><g mask="url(#chFade)"><path d="M0 410V372Q60 352 150 366Q260 350 360 364Q440 352 480 368V410Z" fill="${S.lin(0, 352, 0, 410, [[0, '#7aa8cc'], [.4, '#2c5688'], [.75, '#0c1c3c', .7], [1, '#0c1c3c', 0]])}"/><path d="M0 372Q60 352 150 366Q260 350 360 364Q440 352 480 368" fill="none" stroke="#9ffbd8" stroke-opacity=".5" stroke-width="2.4"/></g>
 <g id="cBang" opacity="0"><path d="M240 14l-6 30h12z" fill="#ffe08a" stroke="#4a2c08" stroke-width="1.6"/><circle cx="240" cy="54" r="5.4" fill="#ffe08a" stroke="#4a2c08" stroke-width="1.6"/></g></svg>
</div>
`;
fs.writeFileSync(path.join(__dirname, '../character.html'), `<!-- Aino the guide + Tuuli the husky. viewBox 480x410 at stage (1120,340). Ids: cCorona(cRays) cAll cAino(cBody cBraid cArmL(cForeL cLant cLGlow) cArmR(cForeR) cHead(cLids cBrows cMouth .m0 .m1 .m2, .cPup)) cDog(cDTail cDBody cDHead(cDEarL cDEarR cDEyes cDLids cDJaw .jc/.jo) cFog) cBang -->\n` + svg);
const strip = x => x.replace(/ id="[^"]*"/g, '');
const sp = (sup) => `<symbol id="ainoSplash${sup ? 'Super' : ''}" viewBox="40 6 420 360"><style>.asp .asb{animation:aspB 3s ease-in-out infinite;transform-origin:50% 100%}@keyframes aspB{50%{transform:scale(1.01,1.025)}}.asp .asr{transform-origin:240px 170px;animation:aspR 24s linear infinite}@keyframes aspR{to{transform:rotate(360deg)}}</style><g class="asp">${sup ? `<ellipse cx="240" cy="170" rx="260" ry="190" fill="${corona}"/><g class="asr" fill="${S.rad(240, 170, 260, [[0, '#fff', .7], [1, '#9dffe0', 0]])}">${Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180, px = Math.cos(a + 1.5708), py = Math.sin(a + 1.5708); return `<path d="M${f(240 + 270 * Math.cos(a))} ${f(170 + 270 * Math.sin(a))}L${f(240 + 8 * px)} ${f(170 + 8 * py)}L${f(240 - 8 * px)} ${f(170 - 8 * py)}Z"/>`; }).join('')}</g>` : ''}<g class="asb">${strip(aino)}${strip(tuuli)}</g></g></symbol>`;
fs.writeFileSync(path.join(__dirname, 'splash-sym.txt'), sp(false) + '\n' + sp(true) + '\n');
console.log('character.html', (svg.length / 1024) | 0, 'KB');
