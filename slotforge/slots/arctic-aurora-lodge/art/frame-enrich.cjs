// Richer frame layers (carved timber panels, forged straps/brackets, snow lumps, icicles). Used by frame.cjs. Coordinates = frame svg user space.
const { rng } = require('./lib.cjs'); const R = rng(4242); const f = n => +(+n).toFixed(1);
const defs = `<linearGradient id="carve" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1608"/><stop offset=".25" stop-color="#4a2c14"/><stop offset="1" stop-color="#6a4224"/></linearGradient>
<linearGradient id="carveV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a1608"/><stop offset=".3" stop-color="#4a2c14"/><stop offset="1" stop-color="#6a4224"/></linearGradient>
<linearGradient id="ironH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6c6d8"/><stop offset=".25" stop-color="#6a788a"/><stop offset=".6" stop-color="#2c3644"/><stop offset="1" stop-color="#0c1118"/></linearGradient>
<linearGradient id="ironV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b6c6d8"/><stop offset=".25" stop-color="#6a788a"/><stop offset=".6" stop-color="#2c3644"/><stop offset="1" stop-color="#0c1118"/></linearGradient>
<linearGradient id="icl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".5" stop-color="#bfe8ff" stop-opacity=".75"/><stop offset="1" stop-color="#6fb8e8" stop-opacity=".25"/></linearGradient>
<radialGradient id="knot"><stop offset="0" stop-color="#2a1608"/><stop offset=".5" stop-color="#5a3418"/><stop offset="1" stop-color="#8a5a34" stop-opacity="0"/></radialGradient>
<radialGradient id="boss" cx=".35" cy=".3"><stop offset="0" stop-color="#e8f2ff"/><stop offset=".4" stop-color="#7a8aa0"/><stop offset="1" stop-color="#10161e"/></radialGradient>
<filter id="hamm" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="8" result="n"/><feDiffuseLighting in="n" lighting-color="#fff" surfaceScale="1.4" result="l"><feDistantLight azimuth="300" elevation="62"/></feDiffuseLighting><feComposite in="l" in2="SourceGraphic" operator="in" result="lc"/><feBlend in="lc" in2="SourceGraphic" mode="multiply"/></filter>`;
const rivet = (x, y, r = 3) => `<circle cx="${x}" cy="${y + .8}" r="${r}" fill="#000" opacity=".4"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#boss)" stroke="#05080c" stroke-width=".8"/><circle cx="${x - r * .3}" cy="${y - r * .35}" r="${r * .3}" fill="#fff" opacity=".85"/>`;
// recessed carved panel: dark pocket with inner shadow and a lit lower lip
const pocket = (x, y, w, h, vert) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2.4}" fill="url(#${vert ? 'carveV' : 'carve'})" stroke="#1a0c04" stroke-width="1"/><rect x="${x + .6}" y="${y + .6}" width="${w - 1.2}" height="${h - 1.2}" rx="${Math.min(w, h) / 2.6}" fill="none" stroke="#e8b078" stroke-opacity=".28" stroke-width=".6" transform="translate(${vert ? .7 : 0} ${vert ? 0 : .8})"/>`;
const groove = (d, w = 1.5) => `<path d="${d}" fill="none" stroke="#e8b078" stroke-opacity=".45" stroke-width="${w}" transform="translate(.6 .9)"/><path d="${d}" fill="none" stroke="#1a0c04" stroke-width="${w}" stroke-linejoin="round"/>`;
const diamond = (cx, cy, hw, hh) => `M${cx} ${cy - hh}L${cx + hw} ${cy}L${cx} ${cy + hh}L${cx - hw} ${cy}Z`;
const roundel = (cx, cy, r) => groove(`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`, 1.3) + groove(`M${cx - r * .62} ${cy - r * .62}L${cx + r * .62} ${cy + r * .62}M${cx + r * .62} ${cy - r * .62}L${cx - r * .62} ${cy + r * .62}M${cx} ${cy - r}V${cy + r}M${cx - r} ${cy}H${cx + r}`, 1) + `<circle cx="${cx}" cy="${cy}" r="${r * .22}" fill="#0c0602"/>`;
let carv = '';
// top beam
carv += pocket(70, 4, 540, 19, false);
for (let x = 96; x < 600; x += 26) carv += groove(diamond(x, 13.5, 10, 7.4)) + groove(diamond(x, 13.5, 4.6, 3.2), 1) + `<path d="M${x + 13} 13.5h-2.4M${x - 13} 13.5h2.4" stroke="#1a0c04" stroke-width="1.2"/>`;
// bottom beam
carv += pocket(70, 549, 540, 20, false);
for (let x = 92; x < 600; x += 30) carv += roundel(x, 559, 7.4);
// posts
for (const px of [5, 656]) { carv += pocket(px, 70, 19, 456, true); for (let y = 96; y < 520; y += 29) carv += groove(diamond(px + 9.5, y, 6.6, 10)) + groove(diamond(px + 9.5, y, 2.6, 4.2), 1); }
// knots + cracks (wood life)
const knot = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx * 1.6}" ry="${ry * 1.6}" fill="url(#knot)" opacity=".7"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#3a2010" opacity=".8"/><ellipse cx="${x}" cy="${y}" rx="${rx * .6}" ry="${ry * .6}" fill="none" stroke="#9a6a3e" stroke-width=".6"/><ellipse cx="${x}" cy="${y}" rx="${rx * .25}" ry="${ry * .25}" fill="#120a05"/>`;
let wood = knot(15, 60, 3.4, 5) + knot(665, 538, 3.4, 5) + knot(664, 62, 3, 4.4) + knot(16, 536, 3, 4.4) + knot(640, 14, 5, 3) + knot(36, 560, 5, 3);
// iron straps
const strapH = (x, y, w, h, snow) => `<g><rect x="${x}" y="${y + 1.4}" width="${w}" height="${h}" fill="#000" opacity=".4"/><g filter="url(#hamm)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#ironH)" stroke="#05080c" stroke-width="1"/></g><path d="M${x + 1} ${y + 1.2}H${x + w - 1}" stroke="#eaf4ff" stroke-opacity=".7" stroke-width=".9"/>${rivet(x + 5.4, y + h / 2)}${rivet(x + w - 5.4, y + h / 2)}${snow ? `<path d="M${x} ${y + 1}Q${x + w * .25} ${y - 5} ${x + w * .5} ${y - 2}Q${x + w * .75} ${y - 5} ${x + w} ${y + 1}Z" fill="url(#snow)"/>` : ''}</g>`;
const strapV = (x, y, w, h) => `<g><rect x="${x + 1.4}" y="${y}" width="${w}" height="${h}" fill="#000" opacity=".35"/><g filter="url(#hamm)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#ironV)" stroke="#05080c" stroke-width="1"/></g><path d="M${x + 1.2} ${y + 1}V${y + h - 1}" stroke="#eaf4ff" stroke-opacity=".6" stroke-width=".9"/>${rivet(x + w / 2, y + 5.4)}${rivet(x + w / 2, y + h - 5.4)}</g>`;
let iron = '';
for (const y of [150, 400]) { iron += strapH(-3, y, 36, 15, true) + strapH(647, y, 36, 15, true); }
for (const x of [190, 340, 490]) { iron += strapV(x, -6, 16, 34) ; }
for (const x of [190, 340, 490]) { iron += strapV(x, 544, 16, 30); }
// forged corner brackets with scroll ends
const bracket = ([x, y, sx, sy]) => `<g transform="translate(${x} ${y}) scale(${sx} ${sy})"><path d="M2 2H70Q74 2 72 6L62 14Q58 18 52 18H20V52Q20 58 16 62L6 72Q2 74 2 70Z" fill="#000" opacity=".4" transform="translate(1.6 2)"/>
 <path d="M2 2H70Q74 2 72 6L62 14Q58 18 52 18H20V52Q20 58 16 62L6 72Q2 74 2 70Z" fill="url(#iron)" stroke="#05080c" stroke-width="1.4"/>
 <path d="M6 6H66" stroke="#eef6ff" stroke-opacity=".8" stroke-width="1.4"/><path d="M6 6V66" stroke="#eef6ff" stroke-opacity=".5" stroke-width="1.2"/>
 <path d="M70 6Q82 4 82 14Q82 22 74 22Q68 22 68 16" fill="none" stroke="#05080c" stroke-width="3.6" stroke-linecap="round"/><path d="M70 6Q82 4 82 14Q82 22 74 22Q68 22 68 16" fill="none" stroke="url(#iron)" stroke-width="2.2" stroke-linecap="round"/>
 <path d="M6 70Q4 82 14 82Q22 82 22 74Q22 68 16 68" fill="none" stroke="#05080c" stroke-width="3.6" stroke-linecap="round"/><path d="M6 70Q4 82 14 82Q22 82 22 74Q22 68 16 68" fill="none" stroke="url(#iron)" stroke-width="2.2" stroke-linecap="round"/>
 <path d="M12 12H44M12 12V44" stroke="#05080c" stroke-opacity=".5" stroke-width="1.2" stroke-dasharray="3 3"/>
 <circle cx="20" cy="20" r="9.4" fill="#000" opacity=".4" transform="translate(1 1.4)"/><circle cx="20" cy="20" r="9.4" fill="url(#boss)" stroke="#05080c" stroke-width="1.2"/><circle cx="20" cy="20" r="5.6" fill="none" stroke="#05080c" stroke-opacity=".6" stroke-width=".8"/><path d="M20 15.4L21.2 19L24.6 20L21.2 21L20 24.6L18.8 21L15.4 20L18.8 19Z" fill="#dff6ff" opacity=".9"/>
 ${rivet(56, 10, 2.8)}${rivet(10, 56, 2.8)}${rivet(36, 10, 2.4)}${rivet(10, 36, 2.4)}</g>`;
const brackets = [[0, 0, 1, 1], [680, 0, -1, 1], [0, 572, 1, -1], [680, 572, -1, -1]].map(bracket).join('');
// thin lumpy snow on the top beam + corner mounds + caps
let snow = `M-9 6C-4 -6 6 -10 16 -8C26 -16 40 -12 52 -9C70 -14 90 -8 108 -8C126 -14 150 -9 166 -9C190 -13 214 -8 236 -9C262 -15 288 -9 312 -9C336 -14 364 -8 388 -9C414 -15 440 -9 464 -9C492 -13 516 -8 540 -9C566 -14 592 -9 614 -9C632 -13 650 -10 662 -9C674 -13 684 -8 690 6C672 2 664 8 650 5C628 9 612 3 590 6C560 10 540 2 512 6C480 10 462 2 436 6C408 10 388 2 360 6C330 10 310 2 284 6C256 10 236 2 210 6C186 10 166 2 140 6C112 10 90 3 66 6C40 9 24 3 8 6C2 8 -6 9 -9 6Z`;
// icicles: varied, some in clusters, with specular line
let ic = ''; for (let x = 36; x < 650; x += 8 + R() * 22) { const l = 8 + R() * R() * 34, w = 2.6 + R() * 3.4; const y0 = x < 70 || x > 610 ? 40 : 28; ic += `<path d="M${f(x - w)} ${y0 - 1}L${f(x + w)} ${y0 - 1}L${f(x + w * .2)} ${f(y0 + l)}Z" fill="url(#icl)"/><path d="M${f(x - w * .4)} ${y0 + 1}L${f(x + w * .02)} ${f(y0 + l * .8)}" stroke="#fff" stroke-width=".7" opacity=".85"/>`; if (R() < .3) { ic += `<path d="M${f(x + w + 1)} ${y0 - 1}L${f(x + w * 2.6)} ${y0 - 1}L${f(x + w * 1.9)} ${f(y0 + l * .5)}Z" fill="url(#icl)" opacity=".9"/>`; } }
// frost feathers in the window corners
let frost = ''; for (const [fx, fy, dx, dy] of [[40, 40, 1, 1], [640, 40, -1, 1], [40, 536, 1, -1], [640, 536, -1, -1]]) for (let k = 0; k < 9; k++) { const a = k / 8 * Math.PI / 2, L = 14 + R() * 30; let x2 = fx + dx * Math.cos(a) * L, y2 = fy + dy * Math.sin(a) * L; frost += `<path d="M${fx} ${fy}L${f(x2)} ${f(y2)}M${f(fx + (x2 - fx) * .55)} ${f(fy + (y2 - fy) * .55)}l${f(dx * 5)} ${f(dy * -3)}M${f(fx + (x2 - fx) * .55)} ${f(fy + (y2 - fy) * .55)}l${f(dx * -3)} ${f(dy * 5)}M${f(fx + (x2 - fx) * .8)} ${f(fy + (y2 - fy) * .8)}l${f(dx * 3)} ${f(dy * -2)}" stroke="#fff" stroke-opacity="${(.2 + R() * .3).toFixed(2)}" stroke-width=".6" stroke-linecap="round" fill="none"/>`; }
// carved ice-rim fillet with beads around the window
let beads = ''; for (let x = 44; x < 640; x += 12) beads += `<circle cx="${x}" cy="31" r="1.5"/>`; 
module.exports = { defs, carv, wood, iron, brackets, snow, ic, frost, beads };
