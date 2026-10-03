// Board frame: timber beams + ice bevel window. Writes bake/frame-bake.svg (2x, transparent) and ../frame.html (via frame-html.cjs after bake).
const fs = require('fs'), path = require('path'); const { rng } = require('./lib.cjs'); const R = rng(77); const f = n => +(+n).toFixed(1);
const logG = (id, horiz) => `<linearGradient id="${id}" x1="0" y1="0" x2="${horiz ? 0 : 1}" y2="${horiz ? 1 : 0}"><stop offset="0" stop-color="#9a6a3e"/><stop offset=".22" stop-color="#b07a48"/><stop offset=".5" stop-color="#6e4424"/><stop offset=".8" stop-color="#3a2212"/><stop offset="1" stop-color="#1c0f08"/></linearGradient>`;
function grain(x, y, w, h, n, horiz) { let d = ''; for (let i = 0; i < n; i++) { if (horiz) { const yy = y + 3 + R() * (h - 6), xx = x + R() * w * .9; d += `M${f(xx)} ${f(yy)}h${f(14 + R() * 60)}`; } else { const xx = x + 3 + R() * (w - 6), yy = y + R() * h * .9; d += `M${f(xx)} ${f(yy)}v${f(14 + R() * 60)}`; } } return `<path d="${d}" stroke="#25140a" stroke-opacity=".4" stroke-width=".9" fill="none"/>`; }
const bolt = (x, y) => `<circle cx="${x}" cy="${y}" r="4.4" fill="url(#iron)" stroke="#05080c" stroke-width="1"/><circle cx="${x - 1.2}" cy="${y - 1.4}" r="1.4" fill="#cfe4f4" opacity=".8"/>`;
let ic = ''; for (let x = 40; x < 640; x += 16 + R() * 26) { const l = 7 + R() * 14; ic += `<path d="M${f(x)} 27L${f(x + 5)} 27L${f(x + 2.5)} ${f(27 + l)}Z" fill="url(#gIce)" opacity=".9"/>`; }
let snowTop = `M-8 6C-4 -8 14 -12 30 -9C50 -16 90 -12 110 -9C150 -17 190 -10 230 -12C270 -17 320 -9 360 -12C400 -17 450 -9 490 -12C540 -17 590 -9 630 -11C650 -14 668 -10 680 -8C690 -6 692 2 690 8C660 4 640 12 600 8C560 14 520 6 480 10C440 14 400 6 360 10C320 14 280 6 240 10C200 14 160 6 120 10C80 14 50 6 20 10C6 12 -4 12 -8 6Z`;
const E = require('./frame-enrich.cjs');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1192" viewBox="-10 -8 700 596">
<defs>
 ${E.defs}
 ${logG('lgH', true)}${logG('lgV', false)}
 <linearGradient id="iron" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb0c4"/><stop offset=".5" stop-color="#3a4656"/><stop offset="1" stop-color="#10151c"/></linearGradient>
 <linearGradient id="gIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2fdff"/><stop offset="1" stop-color="#8fd0f0" stop-opacity=".3"/></linearGradient>
 <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#cfe4f4"/><stop offset="1" stop-color="#7fa4cc"/></linearGradient>
 <linearGradient id="bevT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05102a"/><stop offset="1" stop-color="#9fd8ff"/></linearGradient>
 <linearGradient id="bevB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8ecff"/><stop offset="1" stop-color="#2a4a96"/></linearGradient>
 <linearGradient id="aurRim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4dffb0"/><stop offset=".5" stop-color="#7dd8ff"/><stop offset="1" stop-color="#9a6cff"/></linearGradient>
 <linearGradient id="well" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1f44"/><stop offset=".6" stop-color="#06122c"/><stop offset="1" stop-color="#030a1a"/></linearGradient>
 <radialGradient id="lampG"><stop offset="0" stop-color="#ffd890" stop-opacity=".95"/><stop offset=".4" stop-color="#ffa840" stop-opacity=".4"/><stop offset="1" stop-color="#ff9a30" stop-opacity="0"/></radialGradient>
 <filter id="wood" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".01 .45" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .02  0 0 0 1.5 -.45"/></filter>
 <filter id="woodV" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".45 .01" numOctaves="3" seed="5"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .02  0 0 0 1.5 -.45"/></filter>
 <filter id="b3"><feGaussianBlur stdDeviation="3"/></filter><filter id="b10" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter><filter id="b1"><feGaussianBlur stdDeviation="1"/></filter>
</defs>
<rect x="-2" y="6" width="684" height="578" rx="22" fill="#000" opacity=".55" filter="url(#b10)"/>
<!-- posts -->
<rect x="0" y="14" width="30" height="544" fill="url(#lgV)" stroke="#120a05" stroke-width="1.4"/><rect x="0" y="14" width="30" height="544" filter="url(#woodV)" opacity=".5" style="mix-blend-mode:multiply"/>${grain(0, 14, 30, 544, 40, false)}
<rect x="650" y="14" width="30" height="544" fill="url(#lgV)" stroke="#120a05" stroke-width="1.4"/><rect x="650" y="14" width="30" height="544" filter="url(#woodV)" opacity=".5" style="mix-blend-mode:multiply"/>${grain(650, 14, 30, 544, 40, false)}
<path d="M4 20V552M674 20V552" stroke="#ffe0b0" stroke-opacity=".28" stroke-width="2"/>
<!-- ice well + bevel -->
<rect x="28" y="28" width="624" height="520" fill="url(#well)"/>
<path d="M28 28H652L640 40H40Z" fill="url(#bevT)"/><path d="M28 28V548L40 536V40Z" fill="#0c2a60"/><path d="M652 28V548L640 536V40Z" fill="#3a6ad0" opacity=".9"/><path d="M28 548H652L640 536H40Z" fill="url(#bevB)"/>
<rect x="28" y="28" width="624" height="520" fill="none" stroke="url(#aurRim)" stroke-width="2.2"/>
<path d="M30 546H650" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/>
<g stroke="#4a78d0" stroke-opacity=".18" stroke-width="1">${[1, 2, 3, 4, 5].map(i => `<path d="M${28 + i * 104} 40V536"/>`).join('')}${[1, 2, 3, 4].map(i => `<path d="M40 ${28 + i * 104}H640"/>`).join('')}</g>
<!-- beams -->
<rect x="-8" y="-6" width="696" height="34" rx="17" fill="url(#lgH)" stroke="#120a05" stroke-width="1.6"/><rect x="-8" y="-6" width="696" height="34" rx="17" filter="url(#wood)" opacity=".5" style="mix-blend-mode:multiply"/>${grain(0, -6, 680, 34, 40, true)}
<ellipse cx="-8" cy="11" rx="8" ry="17" fill="url(#logEnd)" stroke="#120a05" stroke-width="1.4"/><ellipse cx="688" cy="11" rx="8" ry="17" fill="url(#logEnd)" stroke="#120a05" stroke-width="1.4"/>
<defs><radialGradient id="logEnd"><stop offset="0" stop-color="#d09a62"/><stop offset=".6" stop-color="#8a5630"/><stop offset="1" stop-color="#3a2010"/></radialGradient></defs>
<ellipse cx="-8" cy="11" rx="4" ry="9" fill="none" stroke="#3a2010" stroke-opacity=".6" stroke-width="1"/><ellipse cx="688" cy="11" rx="4" ry="9" fill="none" stroke="#3a2010" stroke-opacity=".6" stroke-width="1"/>
<path d="M10 -2H670" stroke="#ffe8c0" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>
<rect x="-8" y="544" width="696" height="30" rx="15" fill="url(#lgH)" stroke="#120a05" stroke-width="1.6"/><rect x="-8" y="544" width="696" height="30" rx="15" filter="url(#wood)" opacity=".5" style="mix-blend-mode:multiply"/>${grain(0, 544, 680, 30, 36, true)}
<ellipse cx="-8" cy="559" rx="7" ry="15" fill="url(#logEnd)" stroke="#120a05" stroke-width="1.4"/><ellipse cx="688" cy="559" rx="7" ry="15" fill="url(#logEnd)" stroke="#120a05" stroke-width="1.4"/>
<path d="M10 548H670" stroke="#ffe8c0" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>
<path d="M-6 574C100 582 580 582 686 574" stroke="#000" stroke-opacity=".35" stroke-width="6" fill="none" filter="url(#b3)"/>
<!-- carved panels, wood life, iron straps, forged brackets -->
${E.carv}${E.wood}${E.iron}${E.brackets}
<!-- snow on the top beam + frost -->
<path d="${E.snow}" fill="url(#snow)"/><path d="M-9 6C-4 -6 6 -10 16 -8C40 -12 90 -8 108 -8" stroke="#fff" stroke-width="0" fill="none"/><path d="M-4 -6C30 -14 90 -11 120 -9C200 -15 300 -10 360 -12C440 -16 560 -10 640 -11C664 -12 680 -8 688 -4" fill="none" stroke="#7dffc4" stroke-opacity=".55" stroke-width="1.4" filter="url(#b1)"/>
<path d="M-8 560C0 552 18 552 30 558C60 552 90 556 110 558" fill="#f0f8ff" opacity=".0"/>
${E.ic}<g>${E.frost}</g><g fill="#e8c890" opacity=".55">${E.beads}</g>
<!-- lanterns on the top corners -->
${[[26, -10], [654, -10]].map(([x, y]) => `<ellipse cx="${x}" cy="${y + 4}" rx="34" ry="30" fill="url(#lampG)" style="mix-blend-mode:screen"/><rect x="${x - 7}" y="${y - 10}" width="14" height="18" rx="3" fill="#1c1208" stroke="#05080c" stroke-width="1"/><rect x="${x - 4.6}" y="${y - 7}" width="9.2" height="12" fill="#ffd493"/><path d="M${x - 8} ${y - 10}L${x} ${y - 17}L${x + 8} ${y - 10}Z" fill="#2a1608" stroke="#05080c" stroke-width="1"/><path d="M${x - 3} ${y - 6}V${y + 3}" stroke="#fff" stroke-opacity=".8" stroke-width="1.4"/>`).join('')}
</svg>`;
fs.writeFileSync(path.join(__dirname, 'bake/frame-bake.svg'), svg); console.log('frame svg ok');
