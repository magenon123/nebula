// Sirocco parts (design space 500x760, light from the right). Each part: {svg, bbox:[x,y,w,h], scale}. Port of the APPROVED look-test character (slot5-look-test/gen-char.cjs), split into rig layers.
const OL = '#140a28';
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const n1 = v => v.toFixed(1);
const seg = (a, b, t0, t1) => { const p = lerp(a, b, t0), q = lerp(a, b, t1); return `M${n1(p[0])},${n1(p[1])} L${n1(q[0])},${n1(q[1])}`; };

const DEFS = `<defs>
<linearGradient id="skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16406f"/><stop offset=".3" stop-color="#1b78a0"/><stop offset=".62" stop-color="#2fb0c6"/><stop offset=".85" stop-color="#6fe2dc"/><stop offset="1" stop-color="#b0fff0"/></linearGradient>
<linearGradient id="skinV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8ffff" stop-opacity=".2"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2a1560" stop-opacity=".5"/></linearGradient>
<linearGradient id="skinH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a5a8a"/><stop offset=".5" stop-color="#2aa0bc"/><stop offset="1" stop-color="#7aeee0"/></linearGradient>
<linearGradient id="goldA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b2a12"/><stop offset=".25" stop-color="#c8741e"/><stop offset=".55" stop-color="#ffd668"/><stop offset=".8" stop-color="#f5b23a"/><stop offset="1" stop-color="#fff0a8"/></linearGradient>
<linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b8" stop-opacity=".4"/><stop offset=".4" stop-color="#fff2b8" stop-opacity="0"/><stop offset="1" stop-color="#3a1408" stop-opacity=".45"/></linearGradient>
<radialGradient id="lapisC" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#9fecff"/><stop offset=".4" stop-color="#1fa5b8"/><stop offset="1" stop-color="#0a2f66"/></radialGradient>
<radialGradient id="rubyC" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffb0a8"/><stop offset=".3" stop-color="#e0354f"/><stop offset="1" stop-color="#4a0618"/></radialGradient>
<linearGradient id="silk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a0a24"/><stop offset=".3" stop-color="#8e1535"/><stop offset=".65" stop-color="#d03a52"/><stop offset=".9" stop-color="#ff8a74"/><stop offset="1" stop-color="#ffb08a"/></linearGradient>
<linearGradient id="plum" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c0f4e"/><stop offset=".4" stop-color="#6a2a8e"/><stop offset=".8" stop-color="#b058b0"/><stop offset="1" stop-color="#ff9aa8"/></linearGradient>
<linearGradient id="smk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7ff0e6"/><stop offset=".5" stop-color="#2c9bd0"/><stop offset="1" stop-color="#5a3fc8"/></linearGradient>
<linearGradient id="beard" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#06060f"/><stop offset=".6" stop-color="#1a1a30"/><stop offset="1" stop-color="#3c4a6a"/></linearGradient>
<filter id="b2"><feGaussianBlur stdDeviation="2"/></filter><filter id="b6"><feGaussianBlur stdDeviation="6"/></filter><filter id="b12"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 .05  0 0 0 0 .02  0 0 0 0 .15  0 0 0 .55 -.2"/></filter>
<clipPath id="rightHalf"><rect x="262" y="0" width="240" height="760"/></clipPath>
</defs>`;
const torso = 'M146,250 C172,226 214,216 250,224 C286,216 328,226 354,250 C376,278 362,350 344,412 C336,440 332,462 324,480 L176,480 C168,462 164,440 156,412 C138,350 124,278 146,250Z';
const head = 'M210,122 C210,100 290,100 290,122 L294,152 C294,180 278,202 250,212 C222,202 206,180 206,152Z';
const wrap = (bbox, inner, extraDefs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bbox.join(' ')}" width="${bbox[2]}" height="${bbox[3]}">${DEFS}<defs><clipPath id="torsoC"><path d="${torso}"/></clipPath><clipPath id="headC"><path d="${head}"/></clipPath>${extraDefs}</defs>${inner}</svg>`;
const P = {};

// ---- smoke tail + glow (below the waist) ----
P.tail = { bbox: [70, 480, 330, 270], scale: 1, svg: wrap([70, 480, 330, 270], `<g filter="url(#b2)">
 <ellipse cx="250" cy="588" rx="86" ry="26" fill="url(#smk)"/>
 <path d="M168,500 C140,566 214,588 268,616 C336,650 296,708 206,694 C170,688 150,694 128,706 L108,690 C140,670 176,664 206,662 C262,656 262,640 232,628 C170,602 86,560 120,500Z" fill="url(#smk)" opacity=".92"/>
 <path d="M178,512 C166,560 226,580 276,608" fill="none" stroke="#c8fffa" stroke-width="10" stroke-linecap="round" opacity=".55" filter="url(#b6)"/>
 <path d="M300,624 C322,650 300,690 240,690" fill="none" stroke="#e8fffc" stroke-width="5" stroke-linecap="round" opacity=".65" filter="url(#b2)"/>
 <path d="M130,560 C100,600 160,640 214,650" fill="none" stroke="#3b2aa0" stroke-width="12" stroke-linecap="round" opacity=".5" filter="url(#b6)"/>
 <circle cx="332" cy="672" r="26" fill="#7ff0e6" opacity=".35" filter="url(#b6)"/><circle cx="352" cy="640" r="14" fill="#7ff0e6" opacity=".3" filter="url(#b6)"/><circle cx="96" cy="620" r="18" fill="#6a5be0" opacity=".3" filter="url(#b6)"/>
</g>`) };

// ---- the lamp the tail returns to ----
P.lamp = { bbox: [50, 636, 150, 100], scale: 1.4, svg: wrap([50, 636, 150, 100], `<g transform="translate(112,700)"><ellipse cx="6" cy="18" rx="46" ry="7" fill="#0a0418" opacity=".5" filter="url(#b2)"/>
 <path d="M-40,-14 C-52,-26 -50,-42 -44,-54" fill="none" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><path d="M-40,-14 C-52,-26 -50,-42 -44,-54" fill="none" stroke="url(#goldA)" stroke-width="8" stroke-linecap="round"/>
 <path d="M-34,0 C-34,-22 -8,-26 14,-26 C40,-26 56,-16 56,2 C56,18 34,22 12,22 C-12,22 -34,16 -34,0Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.4"/><path d="M-34,0 C-34,-22 -8,-26 14,-26 C40,-26 56,-16 56,2 C56,18 34,22 12,22 C-12,22 -34,16 -34,0Z" fill="url(#goldV)"/>
 <path d="M-22,-8 C-4,-14 30,-14 50,-6" fill="none" stroke="#fff0b0" stroke-width="2" opacity=".8"/><circle cx="-6" cy="4" r="4" fill="url(#lapisC)"/><circle cx="14" cy="5" r="4" fill="url(#rubyC)"/><circle cx="34" cy="3" r="4" fill="url(#lapisC)"/>
 <path d="M-6,-24 C-6,-36 24,-36 24,-24Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2"/><circle cx="9" cy="-40" r="5" fill="url(#rubyC)" stroke="${OL}" stroke-width="1.5"/>
 <path d="M52,-8 C72,-12 74,10 56,12" fill="none" stroke="${OL}" stroke-width="8" stroke-linecap="round"/><path d="M52,-8 C72,-12 74,10 56,12" fill="none" stroke="url(#goldA)" stroke-width="4.5" stroke-linecap="round"/></g>`) };

// ---- body: trousers, torso, sash, neck, collar (no arms, no paldrons, no head) ----
P.body = { bbox: [100, 188, 300, 420], scale: 1.1, svg: wrap([100, 188, 300, 420], `
<g>
 <path d="M162,470 C118,508 126,548 164,574 C200,586 300,586 336,574 C374,548 382,508 338,470Z" fill="url(#silk)" stroke="${OL}" stroke-width="2.4"/>
 <path d="M200,486 C186,520 196,552 214,580 M250,486 C250,524 252,556 254,584 M296,486 C312,520 304,552 288,580" fill="none" stroke="#3a0a24" stroke-width="2.4" opacity=".55"/>
 <path d="M214,486 C204,520 212,552 226,580 M270,486 C274,520 276,556 276,584 M318,488 C328,520 322,552 312,578" fill="none" stroke="#ff9a82" stroke-width="2" opacity=".5"/>
 <path d="M126,520 C120,548 150,572 170,576" fill="none" stroke="#2a0618" stroke-width="10" opacity=".35" filter="url(#b2)"/>
 <path d="M162,572 q88,22 176,0 l-4,-18 q-84,22 -168,0Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.4"/><path d="M164,566 q86,20 172,0" fill="none" stroke="#fff0b0" stroke-width="1.8" opacity=".7"/>
</g>
<path d="${torso}" fill="url(#skin)" stroke="${OL}" stroke-width="2.6"/>
<g clip-path="url(#torsoC)">
 <rect x="100" y="200" width="300" height="300" fill="url(#skinV)"/>
 <path d="M178,330 Q214,358 250,338 Q286,358 322,330" fill="none" stroke="#0e3a66" stroke-width="3.4" opacity=".55"/>
 <path d="M180,326 Q214,350 250,332 Q286,350 320,326" fill="none" stroke="#b8fff2" stroke-width="2" opacity=".5"/>
 <path d="M250,338 L250,478" stroke="#0e3a66" stroke-width="2.6" opacity=".5"/>
 ${[404, 424, 444].map(y => `<path d="M212,${y} Q232,${y + 9} 250,${y + 2} Q268,${y + 9} 288,${y}" fill="none" stroke="#0e3a66" stroke-width="2.6" opacity=".5"/><path d="M214,${y - 2} Q232,${y + 6} 250,${y} Q268,${y + 6} 286,${y - 2}" fill="none" stroke="#b8fff2" stroke-width="1.4" opacity=".4"/>`).join('')}
 <path d="M146,250 C128,290 134,340 150,400" fill="none" stroke="#12285a" stroke-width="22" opacity=".45" filter="url(#b6)"/>
 <path d="M354,254 C370,290 362,340 346,400" fill="none" stroke="#c8fff6" stroke-width="5" opacity=".7" filter="url(#b2)"/>
 <rect x="100" y="200" width="300" height="300" filter="url(#grain)" opacity=".45"/>
</g>
<path d="${torso}" fill="none" stroke="#a8fff0" stroke-width="3.2" clip-path="url(#rightHalf)" opacity=".85"/>
<path d="M170,466 q80,18 160,0 l4,24 q-84,18 -168,0Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.4"/><path d="M170,466 q80,18 160,0 l4,24 q-84,18 -168,0Z" fill="url(#goldV)"/>
<path d="M174,472 q76,16 152,0" fill="none" stroke="#fff0b0" stroke-width="1.8" opacity=".7"/>
<ellipse cx="250" cy="484" rx="17" ry="14" fill="url(#rubyC)" stroke="${OL}" stroke-width="2.4"/><ellipse cx="244" cy="479" rx="5" ry="3.4" fill="#fff" opacity=".85"/>
<path d="M222,192 L220,236 Q250,256 280,236 L278,192Z" fill="url(#skin)" stroke="${OL}" stroke-width="2.4"/><path d="M222,200 Q250,226 278,200 L278,226 Q250,248 222,228Z" fill="#12285a" opacity=".5"/>
<path d="M168,246 Q250,320 332,246 Q250,296 168,246Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.4"/><path d="M168,246 Q250,320 332,246 Q250,296 168,246Z" fill="url(#goldV)"/>
${[0.12, 0.26, 0.4, 0.6, 0.74, 0.88].map((t, i) => { const x = 168 + 164 * t, y = 262 + Math.sin(t * Math.PI) * 22 - 2; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="url(#${i % 2 ? 'rubyC' : 'lapisC'})" stroke="${OL}" stroke-width="1.4"/>`; }).join('')}
<path d="M250,300 l-15,12 15,22 15,-22z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.2"/><circle cx="250" cy="314" r="8" fill="url(#lapisC)" stroke="${OL}" stroke-width="1.6"/><circle cx="247" cy="311" r="2.2" fill="#fff"/>`) };

// ---- upper arms (rotate about the shoulder) ----
P.upL = { bbox: [88, 222, 106, 214], scale: 1.1, svg: wrap([88, 222, 106, 214], `<g fill="none" stroke-linecap="round">
 <path d="M154,262 C130,300 128,350 136,392" stroke="${OL}" stroke-width="72"/><path d="M154,262 C130,300 128,350 136,392" stroke="#1a5a8e" stroke-width="66"/>
 <path d="M158,268 C138,304 136,350 144,390" stroke="#2a98b4" stroke-width="34"/><path d="M162,272 C146,306 144,350 150,386" stroke="#6ee0d8" stroke-width="7"/></g>`) };
P.upR = { bbox: [306, 222, 110, 214], scale: 1.1, svg: wrap([306, 222, 110, 214], `<g fill="none" stroke-linecap="round">
 <path d="M346,262 C372,300 374,350 364,394" stroke="${OL}" stroke-width="72"/><path d="M346,262 C372,300 374,350 364,394" stroke="#2a98b4" stroke-width="66"/>
 <path d="M350,264 C376,302 378,350 370,392" stroke="#6ee0d8" stroke-width="30"/><path d="M356,268 C380,304 382,350 374,390" stroke="#d8fffb" stroke-width="7"/>
 <path d="M334,270 C354,300 356,350 350,392" stroke="#1a5a8e" stroke-width="16" opacity=".6"/></g>`) };

// ---- forearms (local frame: elbow at 0,0, hand along +x) ----
function limb(x1, y1, x2, y2, w, tone) { // tapered-looking stroke pair with a core highlight
  const d = `M${n1(x1)},${n1(y1)} L${n1(x2)},${n1(y2)}`;
  return [`<path d="${d}" stroke="${OL}" stroke-width="${n1(w + 4)}" stroke-linecap="round"/>`, `<path d="${d}" stroke="${tone[0]}" stroke-width="${n1(w)}" stroke-linecap="round"/><path d="${d}" stroke="${tone[1]}" stroke-width="${n1(w * .58)}" stroke-linecap="round" transform="translate(0,${n1(-w * .2)})"/><path d="${d}" stroke="${tone[2]}" stroke-width="${n1(w * .16)}" stroke-linecap="round" transform="translate(0,${n1(-w * .34)})"/>`];
}
function forearmLocal(lf, wA, wB, tone) {
  let o = '', t = '';
  for (let i = 0; i < 6; i++) { const w = wA + (wB - wA) * (i + .5) / 6; const s = limb(lf * i / 6, 0, lf * (i + 1) / 6 + 1, 0, w, tone); o += s[0]; t += s[1]; }
  return `<g fill="none" stroke-linecap="round">${o}${t}</g>`;
}
function bracerLocal(lf, wA, wB, t0, t1) {
  const w0 = wA + (wB - wA) * t0, w1 = wA + (wB - wA) * t1; const x0 = lf * t0, x1 = lf * t1;
  const d = `M${n1(x0)},${n1(-w0 / 2 - 3)} L${n1(x1)},${n1(-w1 / 2 - 3)} L${n1(x1)},${n1(w1 / 2 + 3)} L${n1(x0)},${n1(w0 / 2 + 3)}Z`;
  const m = (x0 + x1) / 2;
  return `<path d="${d}" fill="url(#goldA)" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/><path d="${d}" fill="url(#goldV)"/><path d="M${n1(x1)},${n1(-w1 / 2 - 3)} L${n1(x1)},${n1(w1 / 2 + 3)}" stroke="#fff0b0" stroke-width="2" opacity=".8"/><path d="M${n1(m)},${n1(-w0 / 2 - 3)} L${n1(m)},${n1(w0 / 2 + 3)}" stroke="#5a2a0c" stroke-width="1.6" opacity=".55" stroke-dasharray="3 3"/><circle cx="${n1(m + 6)}" cy="0" r="6" fill="url(#lapisC)" stroke="${OL}" stroke-width="1.6"/><circle cx="${n1(m + 4.5)}" cy="-2" r="1.6" fill="#fff" opacity=".9"/>`;
}
function fistLocal(x, tone) {
  return `<g transform="translate(${n1(x)},0)"><path d="M-20,-16 C-6,-24 14,-22 24,-12 C30,-2 28,12 18,20 C6,26 -12,24 -22,14 C-28,4 -28,-8 -20,-16Z" fill="${tone}" stroke="${OL}" stroke-width="2.4"/>
 <path d="M-14,-12 C-6,-18 4,-18 10,-12 M-16,0 C-8,-6 4,-6 12,0 M-14,12 C-6,6 6,6 14,12" fill="none" stroke="#0e3552" stroke-width="2" opacity=".7"/>
 <path d="M-14,-13 C-6,-19 4,-19 10,-13" fill="none" stroke="#9ff0ee" stroke-width="1.4" opacity=".7"/><path d="M20,-12 C26,0 24,10 18,18" fill="none" stroke="#a8fff4" stroke-width="2" opacity=".8"/>
 <circle cx="-10" cy="-3" r="2.6" fill="#1f93b0"/></g>`;
}
function handLocal(x, tone, lit, flip) { // open hand, fingers along +x, thumb on the -y side (flip mirrors y)
  const fing = [[-12, -19, 25, 10.4], [-4, -6, 30, 10.8], [4, 6, 28, 10.4], [12, 20, 22, 9.4]]; // base y, angle deg, len, width
  let s = '';
  const dk = tone[0], md = tone[1], hi = tone[2];
  fing.forEach(([by, ang, len, w]) => { const a = ang * Math.PI / 180; const x0 = 32, x1 = x0 + len * Math.cos(a), y1 = by + len * Math.sin(a); s += `<path d="M${x0},${by} L${n1(x1)},${n1(y1)}" stroke="${OL}" stroke-width="${w + 3.6}" stroke-linecap="round"/>`; });
  const th = `M8,-13 L${n1(8 + 25 * Math.cos(-62 * Math.PI / 180))},${n1(-13 + 25 * Math.sin(-62 * Math.PI / 180))}`;
  s += `<path d="${th}" stroke="${OL}" stroke-width="15" stroke-linecap="round"/>`;
  s += `<path d="M2,-18 C12,-22 28,-20 36,-15 L38,16 C28,21 12,21 2,18Z" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/>`;
  fing.forEach(([by, ang, len, w]) => { const a = ang * Math.PI / 180; const x0 = 32, x1 = x0 + len * Math.cos(a), y1 = by + len * Math.sin(a); const d = `M${x0},${by} L${n1(x1)},${n1(y1)}`; s += `<path d="${d}" stroke="${md}" stroke-width="${w}" stroke-linecap="round"/><path d="${d}" stroke="${hi}" stroke-width="${n1(w * .26)}" stroke-linecap="round" transform="translate(0,${n1(-w * .26)})"/><path d="M${n1(x0 + len * .5 * Math.cos(a))},${n1(by + len * .5 * Math.sin(a) - w * .5)} l0,${n1(w)}" stroke="#0e3552" stroke-width="1.2" opacity=".5"/>`; });
  s += `<path d="${th}" stroke="${md}" stroke-width="11" stroke-linecap="round"/><path d="${th}" stroke="${hi}" stroke-width="3" stroke-linecap="round" transform="translate(-1.5,0)"/>`;
  s += `<path d="M2,-18 C12,-22 28,-20 36,-15 L38,16 C28,21 12,21 2,18Z" fill="${md}"/><path d="M2,-18 C12,-22 28,-20 36,-15 L38,16 C28,21 12,21 2,18Z" fill="url(#skinV)"/>`;
  s += `<path d="M10,-6 C18,-2 24,-2 32,-6 M12,6 C20,10 26,10 32,6" fill="none" stroke="#0e3552" stroke-width="1.6" opacity=".45"/><path d="M4,-15 C14,-19 28,-17 35,-13" fill="none" stroke="${hi}" stroke-width="2" opacity=".8"/><circle cx="14" cy="0" r="3" fill="${dk}" opacity=".5"/>`;
  return `<g transform="translate(${n1(x - 4)},0) scale(1.42,${n1(1.42 * flip)})">${s}</g>`;
}
function handCupLocal(x, tone, flip) { // CUPPED hand (behind the ear): fingers together, bent toward -y (toward the head), thumb tucked
  const dk = tone[0], md = tone[1], hi = tone[2]; let s = '';
  const fing = [[-10.5, -8, 21, 15, 9.8], [-3.5, -12, 25, 17, 10.4], [3.5, -14, 24, 16, 10.2], [10.5, -16, 19, 13, 9.2]]; // base y, tilt, len1, len2, width
  const pts = ([by, tl, l1, l2]) => { const a1 = tl * Math.PI / 180, a2 = a1 - 64 * Math.PI / 180, x0 = 32, p1 = [x0 + l1 * Math.cos(a1), by + l1 * Math.sin(a1)], p2 = [p1[0] + l2 * Math.cos(a2), p1[1] + l2 * Math.sin(a2)]; return `M${x0},${by} L${n1(p1[0])},${n1(p1[1])} L${n1(p2[0])},${n1(p2[1])}`; };
  const th = 'M8,-13 L22,-26 L30,-24';
  s += `<path d="${th}" stroke="${OL}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  fing.forEach(f => { s += `<path d="${pts(f)}" fill="none" stroke="${OL}" stroke-width="${f[4] + 3.6}" stroke-linecap="round" stroke-linejoin="round"/>`; });
  s += `<path d="M2,-18 C12,-22 28,-20 36,-15 L38,16 C28,21 12,21 2,18Z" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/>`;
  fing.forEach(f => { const d = pts(f); s += `<path d="${d}" fill="none" stroke="${md}" stroke-width="${f[4]}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${hi}" stroke-width="${n1(f[4] * .26)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,${n1(f[4] * .28)})" opacity=".85"/>`; });
  s += `<path d="${th}" fill="none" stroke="${md}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="${th}" fill="none" stroke="${hi}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(1,1.5)"/>`;
  s += `<path d="M2,-18 C12,-22 28,-20 36,-15 L38,16 C28,21 12,21 2,18Z" fill="${md}"/><path d="M2,-18 C12,-22 28,-20 36,-15 L38,16 C28,21 12,21 2,18Z" fill="url(#skinV)"/>`;
  s += `<path d="M10,-6 C18,-2 24,-2 32,-6 M12,6 C20,10 26,10 32,6" fill="none" stroke="#0e3552" stroke-width="1.6" opacity=".45"/><path d="M4,-15 C14,-19 28,-17 35,-13" fill="none" stroke="${hi}" stroke-width="2" opacity=".8"/><circle cx="14" cy="0" r="3" fill="${dk}" opacity=".5"/>`;
  return `<g transform="translate(${n1(x - 4)},0) scale(1.42,${n1(1.42 * flip)})">${s}</g>`;
}
const toneL = ['#1a5a8e', '#2a98b4', '#6ee0d8'], toneR = ['#2a98b4', '#6ee0d8', '#e0fffa'];
const LFL = Math.hypot(178, 54), LFR = Math.hypot(176, 52);
const fbox = lf => [-40, -66, lf + 144, 132];
const arm = (lf, wA, wB, tone, fistTone, open, flip) => wrapFore(lf, forearmLocal(lf, wA, wB, tone) + bracerLocal(lf, wA, wB, .28, .66) + (open ? handLocal(lf, tone, true, flip) : fistLocal(lf + 12, fistTone)));
function wrapFore(lf, inner) { return { bbox: fbox(lf), scale: 1.4, svg: wrap(fbox(lf), inner) }; }
P.foreL = arm(LFL, 54, 42, toneL, 'url(#skinH)', false, 1);
P.foreR = arm(LFR, 56, 42, toneR, 'url(#skinH)', false, 1);
P.foreL_o = arm(LFL, 54, 42, toneL, '', true, 1);
P.foreR_o = arm(LFR, 56, 42, toneR, "", true, 1);
P.foreR_c = wrapFore(LFR, forearmLocal(LFR, 56, 42, toneR) + bracerLocal(LFR, 56, 42, .28, .66) + handCupLocal(LFR, toneR, 1));

// ---- head (skin, ears, earring, beard; NO eyes/brows/mouth/mustache: those are live vector) ----
P.head = { bbox: [186, 94, 128, 156], scale: 1.8, svg: wrap([186, 94, 128, 156], `
<path d="M206,152 q-12,2 -10,18 q4,10 12,6" fill="url(#skinH)" stroke="${OL}" stroke-width="2.2"/><path d="M294,152 q12,2 10,18 q-4,10 -12,6" fill="url(#skinH)" stroke="${OL}" stroke-width="2.2"/>
<path d="M199,178 a6.5,6.5 0 1 0 0.1,0" fill="none" stroke="url(#goldA)" stroke-width="3.4"/>
<path d="${head}" fill="url(#skin)" stroke="${OL}" stroke-width="2.6"/>
<g clip-path="url(#headC)">
 <path d="M206,120 C206,170 214,196 232,208 L206,208Z" fill="#12285a" opacity=".5"/>
 <path d="M290,120 C292,160 288,184 276,200" fill="none" stroke="#c8fff6" stroke-width="6" opacity=".7" filter="url(#b2)"/>
 <path d="M212,126 Q250,138 288,126 L288,138 Q250,150 212,138Z" fill="#12285a" opacity=".55"/>
 <path d="M236,150 Q232,166 238,174 Q250,180 262,174" fill="none" stroke="#12285a" stroke-width="2.6" opacity=".6"/>
 <path d="M258,152 Q264,168 262,174" fill="none" stroke="#c8fff6" stroke-width="2" opacity=".7"/>
 <rect x="200" y="96" width="100" height="120" filter="url(#grain)" opacity=".4"/>
</g>
<path d="M206,150 C200,188 222,222 250,242 C278,222 300,188 294,150 C290,168 280,176 270,180 C260,186 240,186 230,180 C220,176 210,168 206,150Z" fill="url(#beard)" stroke="${OL}" stroke-width="2.2"/>
<path d="M214,176 C222,186 234,186 244,180 M290,176 C282,186 266,186 256,180" fill="none" stroke="#6a7aa8" stroke-width="1.6" opacity=".7"/>
<path d="M230,214 C240,226 246,230 250,238 M270,214 C262,226 256,230 250,238" fill="none" stroke="#5a6a98" stroke-width="1.6" opacity=".6"/>
<path d="M232,206 C240,214 248,216 250,222 M268,206 C260,214 252,216 250,222 M222,194 C230,204 238,208 244,208" fill="none" stroke="#7a8ab8" stroke-width="1.1" opacity=".5"/>
<rect x="244" y="232" width="12" height="7" rx="3" fill="url(#goldA)" stroke="${OL}" stroke-width="1.8"/>
<path d="M250,150 Q246,168 242,174 Q250,180 258,174" fill="none" stroke="#0e3a66" stroke-width="2.2" opacity=".7"/>`) };

// ---- turban + plume ----
P.turban = { bbox: [186, 30, 128, 108], scale: 1.8, svg: wrap([186, 30, 128, 108], `
<path d="M200,128 C192,76 308,76 300,128 Q250,108 200,128Z" fill="url(#plum)" stroke="${OL}" stroke-width="2.6"/>
<path d="M214,66 C214,36 288,36 288,66 C300,76 304,100 298,124 C282,108 218,108 202,124 C196,100 200,76 214,66Z" fill="url(#plum)" stroke="${OL}" stroke-width="2.6"/>
<g fill="none" stroke-linecap="round">
 <path d="M204,118 C230,98 270,100 298,116" stroke="#1a0a3a" stroke-width="2.6"/><path d="M204,106 C232,86 272,88 300,104" stroke="#1a0a3a" stroke-width="2.4" opacity=".8"/>
 <path d="M208,92 C234,72 270,74 296,90" stroke="#1a0a3a" stroke-width="2.4" opacity=".7"/><path d="M218,70 C240,56 266,58 286,70" stroke="#1a0a3a" stroke-width="2.2" opacity=".7"/>
 <path d="M206,114 C232,95 272,97 297,112" stroke="#ffc0d0" stroke-width="2" opacity=".6"/><path d="M210,88 C236,69 272,71 296,87" stroke="#ffc0d0" stroke-width="1.8" opacity=".55"/>
 <path d="M226,40 C250,34 276,40 284,56" stroke="#ffd0e0" stroke-width="3" opacity=".6"/>
 <path d="M200,126 C250,104 250,104 300,124" stroke="url(#goldA)" stroke-width="5"/>
</g>
<path d="M232,100 C240,92 262,92 270,100 C268,114 236,114 232,100Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.2"/><ellipse cx="251" cy="103" rx="8" ry="6.5" fill="url(#rubyC)" stroke="${OL}" stroke-width="1.6"/><ellipse cx="248" cy="100.5" rx="2.6" ry="1.8" fill="#fff" opacity=".85"/>`) };
P.plume = { bbox: [244, 4, 86, 98], scale: 2, svg: wrap([244, 4, 86, 98], `<path d="M252,96 C250,60 276,22 322,10 C300,34 292,54 288,74 C272,84 258,92 252,96Z" fill="#1fa5b8" stroke="${OL}" stroke-width="2"/><path d="M254,92 C256,60 280,30 316,14" fill="none" stroke="#e8fffc" stroke-width="2.2" opacity=".85"/><path d="M262,88 C270,66 288,44 308,28 M270,82 C280,66 292,56 304,44" fill="none" stroke="#0a4a70" stroke-width="1.4" opacity=".6"/><path d="M300,34 q12,-4 18,4" fill="none" stroke="#f0c060" stroke-width="3"/>`) };
module.exports = { P, LFL, LFR, OL };
