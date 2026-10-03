// Sirocco's Lamp Bazaar scene (leo). Ported from the APPROVED look test (slot5-look-test/gen-bg.cjs), 1280x720 design space scaled x1.25 to the 1600x900 stage.
// node scene.cjs -> bake/day.svg, bake/night.svg (static world), bake/rays-day.svg, bake/rays-night.svg (light shafts), bake/lamp.svg, bake/lamp-lit.svg (hanging lamp sprites)
const fs = require('fs'), path = require('path');
const B = path.join(__dirname, 'bake'); fs.mkdirSync(B, { recursive: true });
const W = 1280, H = 720, SX = 1010, SY = 318;
const f = n => n.toFixed(1);
let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
function ridge(y0, amp, freqs, x0 = -20, x1 = W + 20, step = 10, ph = 0) { const pts = []; for (let x = x0; x <= x1; x += step) { let y = y0; freqs.forEach(([a, fr, p]) => { y += amp * a * Math.sin(x * fr + p + ph); }); pts.push([x, y]); } return pts; }
const poly = (pts, bot) => `M${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' L')} L${pts[pts.length - 1][0]},${bot} L${pts[0][0]},${bot}Z`;
const lineP = pts => `M${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' L')}`;

function make(N) { // N = night
  seed = 11;
  const K = N ? {
    sky: ['#070620', '#130f48', '#2a1766', '#4a2078', '#6e2a7e', '#8a3a84'],
    glowA: '#cfe0ff', glowB: '#7a9cff', glowC: '#3a3a9a', rim: '#a8c0ff', rim2: '#8aa4f0', dune: [['#3a2c7a', '#1c1652'], ['#2e2468', '#161048'], ['#241c58', '#100a38']],
    sky_clouds: '#120a34', cloudLit: '#6a80e0', haze: '#4a4ac8', hazeOp: .1, roofA: '#3a2a6a', roofB: '#241a52', roofC: '#140e38', lit: '#8aa0ff', stone: ['#0c0620', '#1a0f38', '#2e1c52'], revealL: '#6a80e0', revealD: ['#0e0828', '#1c1244'],
    floorG: ['#4a3a80', '#2a1c5a', '#120a30'], floorLight: '#7a8cff', skyl: ['#2a1c5e', '#241852', '#1c1244', '#180f3c'], rail: ['#12082a', '#302058', '#6a70c8'], vig: '#05021a'
  } : {
    sky: ['#1b1450', '#3a1b6a', '#7a2c75', '#d4506a', '#ff8f3e', '#ffc66a'],
    glowA: '#fff4c8', glowB: '#ff9a3a', glowC: '#d9406a', rim: '#ffd08a', rim2: '#ffc27a', dune: [['#c8607a', '#7a3a72'], ['#b04a6c', '#5e2c66'], ['#8e3b62', '#40204e']],
    sky_clouds: '#3a1d56', cloudLit: '#ffb25e', haze: '#ff9a4a', hazeOp: .1, roofA: '#5a2a62', roofB: '#3e1d52', roofC: '#2a1240', lit: '#ffb25e', stone: ['#150a26', '#2a1440', '#4a2552'], revealL: '#ffb25e', revealD: ['#1a0c2a', '#2c1642'],
    floorG: ['#b3623c', '#6a3358', '#2c1440'], floorLight: '#ffb860', skyl: ['#7a3068', '#6e2c6c', '#4e2160', '#4a1f5c'], rail: ['#2a1236', '#5b2d5a', '#c8764a'], vig: '#0c0418'
  };
  function dune(y0, amp, fr, ph, i, ripples) {
    const [fa, fb] = K.dune[i - 1]; const id = 'd' + i;
    const pts = ridge(y0, amp, [[1, fr, 0], [.45, fr * 2.3, 1.3], [.2, fr * 5.1, .4]], -20, W + 20, 4, ph);
    let lit = '';
    for (let j = 1; j < pts.length; j++) { const dy = pts[j][1] - pts[j - 1][1]; if (dy > 0.3) { lit += `M${pts[j - 1][0]},${f(pts[j - 1][1])} L${pts[j][0]},${f(pts[j][1])} L${pts[j][0]},${f(pts[j][1] + 12 + dy * 12)} L${pts[j - 1][0]},${f(pts[j - 1][1] + 12 + dy * 12)}Z `; } }
    let rip = ''; if (ripples) { for (let k = 0; k < ripples; k++) { const yy = y0 + amp * 1.2 + rnd() * (H - y0 - amp * 1.2) * .6; const xs = rnd() * W; let d = `M${f(xs)},${f(yy)}`; for (let j = 1; j < 7; j++) d += ` q8,${f((rnd() - .5) * 3)} 16,${f((rnd() - .5) * 1.2)}`; rip += `<path d="${d}" fill="none" stroke="${K.rim}" stroke-width="1.1" opacity=".22"/>`; } }
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fa}"/><stop offset="1" stop-color="${fb}"/></linearGradient><linearGradient id="${id}L" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.rim}" stop-opacity=".95"/><stop offset="1" stop-color="${K.rim}" stop-opacity="0"/></linearGradient></defs>
  <path d="${poly(pts, H)}" fill="url(#${id})"/><path d="${lit}" fill="url(#${id}L)" opacity=".7" filter="url(#b3)"/>${rip}<path d="${lineP(pts)}" fill="none" stroke="${K.rim}" stroke-width="1.5" opacity=".55"/>
  <rect x="0" y="${y0 - amp * 1.6}" width="${W}" height="${H}" fill="${K.haze}" opacity="${N ? .08 : .12}"/>`;
  }
  function skyline(x0, x1, base, off, col, rimCol, scale, wins) {
    let s = '', rim = '', wn = ''; let x = x0; seed += off;
    while (x < x1) {
      const t = rnd(); const w = (26 + rnd() * 40) * scale; const h = (28 + rnd() * 52) * scale;
      if (t < .3) { const r = w * .5; s += `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h + 30)}" fill="${col}"/><path d="M${f(x - 3)},${f(base - h)} a${f(r + 3)},${f(r * 1.05)} 0 0 1 ${f(w + 6)},0Z" fill="${col}"/><rect x="${f(x + w * .5 - 1)}" y="${f(base - h - r * 1.05 - 9)}" width="2" height="9" fill="${col}"/>`;
        rim += `<path d="M${f(x + w * .5 + r * .55)},${f(base - h - r * .72)} A${f(r + 3)},${f(r * 1.05)} 0 0 1 ${f(x + w + 3)},${f(base - h)} L${f(x + w)},${f(base + 10)}" fill="none" stroke="${rimCol}" stroke-width="1.6" opacity=".8"/>`; if (wins) wn += `<rect x="${f(x + w * .3)}" y="${f(base - h * .6)}" width="3" height="5" fill="#ffd27a" opacity=".85"/>`; }
      else if (t < .55) { const mw = 7 * scale + rnd() * 3, mh = (70 + rnd() * 60) * scale; s += `<rect x="${f(x)}" y="${f(base - mh)}" width="${f(mw)}" height="${f(mh + 30)}" fill="${col}"/><rect x="${f(x - 3)}" y="${f(base - mh * .72)}" width="${f(mw + 6)}" height="4" fill="${col}"/><path d="M${f(x - 1)},${f(base - mh)} L${f(x + mw / 2)},${f(base - mh - 24 * scale)} L${f(x + mw + 1)},${f(base - mh)}Z" fill="${col}"/><rect x="${f(x - 2)}" y="${f(base - mh - 2)}" width="${f(mw + 4)}" height="3" fill="${col}"/>`;
        rim += `<path d="M${f(x + mw)},${f(base - mh)} L${f(x + mw)},${f(base + 10)}" stroke="${rimCol}" stroke-width="1.4" opacity=".85"/><path d="M${f(x + mw / 2)},${f(base - mh - 24 * scale)} L${f(x + mw + 1)},${f(base - mh)}" stroke="${rimCol}" stroke-width="1.3" opacity=".85"/>`; if (wins) wn += `<rect x="${f(x + mw / 2 - 1)}" y="${f(base - mh * .72 - 12)}" width="2.4" height="4" fill="#ffd27a" opacity=".9"/>`; }
      else { s += `<rect x="${f(x)}" y="${f(base - h * .7)}" width="${f(w)}" height="${f(h * .7 + 30)}" fill="${col}"/>`; rim += `<path d="M${f(x + w)},${f(base - h * .7)} L${f(x + w)},${f(base + 10)}" stroke="${rimCol}" stroke-width="1.4" opacity=".7"/>`; if (wins) wn += `<rect x="${f(x + w * .3)}" y="${f(base - h * .5)}" width="3" height="4.5" fill="#ffd27a" opacity=".85"/><rect x="${f(x + w * .62)}" y="${f(base - h * .4)}" width="3" height="4.5" fill="#ffd27a" opacity=".7"/>`; }
      x += w * (.75 + rnd() * .3);
    }
    return s + rim + wn;
  }
  let stars = ''; { const keep = seed; seed = 777; for (let i = 0; i < (N ? 260 : 110); i++) { const x = rnd() * W, y = Math.pow(rnd(), 1.8) * (N ? 300 : 230); stars += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(.5 + rnd() * (N ? 1.1 : .9))}" fill="#fff" opacity="${f(.2 + rnd() * .6)}"/>`; } seed = keep; for (let i = 0; i < 440; i++) rnd(); }
  let clouds = ''; for (let i = 0; i < 14; i++) { const x = rnd() * W, y = 120 + rnd() * 190, w = 140 + rnd() * 300, h = 5 + rnd() * 9; const near = Math.max(0, 1 - Math.hypot(x - SX, (y - SY) * .8) / 700); clouds += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(h)}" fill="${K.sky_clouds}" opacity=".55"/><ellipse cx="${f(x + w * .12)}" cy="${f(y + h * .55)}" rx="${f(w * .8)}" ry="${f(h * .45)}" fill="${K.cloudLit}" opacity="${f(.25 + near * .6)}"/>`; }
  function rooftops() {
    let s = '', lit = ''; let x = -20; const cols = N ? ['#5a1a38', '#126a7a', '#8a6a1c', '#4a1c5a'] : ['#b3203f', '#1fa5b8', '#f2b53a', '#7a2c6e'];
    const flags = [];
    while (x < W + 20) {
      const w = 60 + rnd() * 70, h = 26 + rnd() * 34, y = 528 - h;
      s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h + 130)}" fill="url(#roofShade)"/>`;
      lit += `<rect x="${f(x + w - 5)}" y="${f(y)}" width="5" height="${f(h + 30)}" fill="${K.lit}" opacity=".5"/><rect x="${f(x)}" y="${f(y - 3)}" width="${f(w)}" height="4" fill="${K.rim2}" opacity=".6"/>`;
      // relief: parapet crenels and a pointed-arch niche
      for (let cxx = x + 4; cxx < x + w - 6; cxx += 9) lit += `<rect x="${f(cxx)}" y="${f(y - 7)}" width="5" height="5" fill="${K.roofA}"/><rect x="${f(cxx + 3.4)}" y="${f(y - 7)}" width="1.6" height="5" fill="${K.lit}" opacity=".5"/>`;
      for (let k = 0; k < 2; k++) { const wx = x + 10 + k * (w / 2.1); if (wx + 16 < x + w - 6) { s += `<path d="M${f(wx)},${f(y + h * .75)} v-18 a8,8 0 0 1 16,0 v18Z" fill="${N ? '#ffcf6a' : '#241038'}" opacity="${N ? (rnd() < .65 ? .95 : .25) : 1}"/>`; lit += `<path d="M${f(wx + 16)},${f(y + h * .75)} v-18" stroke="${K.lit}" stroke-width="1.2" opacity=".35"/>`; } }
      const c = cols[Math.floor(rnd() * 4)];
      s += `<path d="M${f(x + 4)},${f(y + h * .38)} h${f(w - 8)} l4,12 h-${f(w)}Z" fill="${c}" opacity=".85"/>`;
      for (let k = 0; k < w - 8; k += 10) s += `<path d="M${f(x + 4 + k)},${f(y + h * .38)} h5 l1,12 h-4Z" fill="#14081f" opacity=".28"/>`;
      lit += `<path d="M${f(x + w - 4)},${f(y + h * .38)} h4 l4,12 h-4Z" fill="${K.rim2}" opacity=".5"/>`;
      flags.push([x + w * .5, y - 8]); x += w + (rnd() * 6);
    }
    // bunting strung between rooftops (life in the middle layer)
    let bun = ''; for (let i = 0; i + 2 < flags.length; i += 2) { const a = flags[i], b = flags[i + 2]; if (!a || !b) break; const sag = 12; bun += `<path d="M${f(a[0])},${f(a[1])} Q${f((a[0] + b[0]) / 2)},${f((a[1] + b[1]) / 2 + sag)} ${f(b[0])},${f(b[1])}" fill="none" stroke="#1a0c26" stroke-width="1"/>`; for (let t = .1; t < .95; t += .1) { const px = a[0] + (b[0] - a[0]) * t, py = (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * ((a[1] + b[1]) / 2 + sag) + t * t * b[1]; bun += `<path d="M${f(px - 2.6)},${f(py)} l5.2,0 l-2.6,6.4Z" fill="${cols[Math.floor(t * 40) % 4]}" opacity=".9"/>`; } }
    return s + lit + bun;
  }
  function floor() { let s = ''; const y0 = 592; for (let r = 0; r < 9; r++) { const t = r / 9, y = y0 + Math.pow(t, 1.5) * (H - y0); s += `<line x1="0" y1="${f(y)}" x2="${W}" y2="${f(y)}" stroke="#1a0a2a" stroke-width="${f(.8 + t * 1.6)}" opacity=".5"/>`; } for (let c = -14; c <= 14; c++) { const x1 = W / 2 + c * 30, x2 = W / 2 + c * 118; s += `<line x1="${f(x1)}" y1="${y0}" x2="${f(x2)}" y2="${H}" stroke="#1a0a2a" stroke-width="1.2" opacity=".42"/>`; } return s; }
  function balusters() { let s = ''; for (let x = -10; x < W; x += 46) { s += `<g><path d="M${x + 6},548 q-5,12 0,20 q-6,10 0,30 L${x + 26},598 q6,-20 0,-30 q5,-8 0,-20Z" fill="url(#balu)"/><path d="M${x + 26},548 q5,12 0,20 q6,10 0,30" fill="none" stroke="${K.rim2}" stroke-width="1.6" opacity=".55"/></g>`; } return s; }
  const OP = `M86,${H + 10} L86,360 C86,170 380,10 640,-70 C900,10 1194,170 1194,360 L1194,${H + 10}Z`;
  const OP2 = `M134,${H + 10} L134,366 C134,200 400,60 640,-24 C880,60 1146,200 1146,366 L1146,${H + 10}Z`;
  // moonlit/sunlit rays (separate layer file)
  // arch relief: inlay band that follows the moulding, muqarnas corbels at the springing, fluted columns
  const inlay = (xs, dir) => { let s = ''; for (let k = 0; k < 40; k++) { const t = k / 39; const x = 86 + (640 - 86) * t, y0 = 360 - (360 + 70) * (1 - Math.pow(1 - t, 2.2) * 0 ) * 0; } return s; };
  const arc = []; for (let t = 0; t <= 1.0001; t += 1 / 60) { // left half of OP centerline sampled via cubic bezier segment 2
    const p0 = [86, 360], p1 = [86, 170], p2 = [380, 10], p3 = [640, -70]; const u = 1 - t; arc.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); }
  let studs = ''; arc.forEach((p, i) => { if (i % 4 === 2 && p[1] > -20) { const q = [W - p[0], p[1]]; studs += `<circle cx="${f(p[0] - 9)}" cy="${f(p[1] + 4)}" r="2.6" fill="#e8a64a" stroke="#12081f" stroke-width=".8"/><circle cx="${f(q[0] + 9)}" cy="${f(q[1] + 4)}" r="2.6" fill="#e8a64a" stroke="#12081f" stroke-width=".8" opacity=".8"/>`; if (i % 8 === 2) { studs += `<circle cx="${f(p[0] - 9)}" cy="${f(p[1] + 4)}" r="1.2" fill="#1fa5b8"/><circle cx="${f(q[0] + 9)}" cy="${f(q[1] + 4)}" r="1.2" fill="#1fa5b8"/>`; } } });
  let flutes = ''; [44, 1236].forEach((x0, i) => { for (let k = -2; k <= 2; k++) { const x = x0 + k * 7; flutes += `<path d="M${x},150 V${H}" stroke="${k > 0 ? K.revealL : '#000'}" stroke-width="2.2" opacity="${k > 0 ? (i ? .12 : .32) : .35}"/>`; } });
  let corbel = ''; [[86, 360, 1], [1194, 360, -1]].forEach(([x, y, d]) => { for (let k = 0; k < 3; k++) { corbel += `<path d="M${x - d * 16 + d * k * 5},${y + 10 + k * 8} q${d * 14},-6 ${d * 28 - d * k * 10},0 l0,8 q${-d * 14},-4 ${-d * 28 + d * k * 10},0Z" fill="${d > 0 ? '#3a1c48' : '#1a0c2a'}" stroke="#12081f" stroke-width="1.2"/><path d="M${x - d * 16 + d * k * 5},${y + 10 + k * 8} q${d * 14},-6 ${d * 28 - d * k * 10},0" fill="none" stroke="${K.rim2}" stroke-width="1" opacity="${d > 0 ? .7 : .25}"/>`; } });
  const noRays = '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="1600" height="900">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.sky[0]}"/><stop offset=".22" stop-color="${K.sky[1]}"/><stop offset=".38" stop-color="${K.sky[2]}"/><stop offset=".49" stop-color="${K.sky[3]}"/><stop offset=".55" stop-color="${K.sky[4]}"/><stop offset=".62" stop-color="${K.sky[5]}"/></linearGradient>
<radialGradient id="sunGlow" cx="${SX}" cy="${SY}" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${K.glowA}" stop-opacity="1"/><stop offset=".08" stop-color="${K.glowA}" stop-opacity=".92"/><stop offset=".25" stop-color="${K.glowB}" stop-opacity="${N ? .4 : .55}"/><stop offset=".6" stop-color="${K.glowC}" stop-opacity="${N ? .14 : .18}"/><stop offset="1" stop-color="${K.glowC}" stop-opacity="0"/></radialGradient>
<radialGradient id="sunDisc" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".8" stop-color="${N ? '#e8f0ff' : '#fff0b8'}"/><stop offset="1" stop-color="${N ? '#b8c8f0' : '#ffd98a'}"/></radialGradient>
<linearGradient id="roofShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.roofA}"/><stop offset=".5" stop-color="${K.roofB}"/><stop offset="1" stop-color="${K.roofC}"/></linearGradient>
<linearGradient id="balu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${K.rail[0]}"/><stop offset=".6" stop-color="${K.rail[1]}"/><stop offset="1" stop-color="${K.rail[2]}"/></linearGradient>
<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.floorG[0]}"/><stop offset=".5" stop-color="${K.floorG[1]}"/><stop offset="1" stop-color="${K.floorG[2]}"/></linearGradient>
<radialGradient id="floorLight" cx="${SX}" cy="600" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${K.floorLight}" stop-opacity="${N ? .4 : .7}"/><stop offset="1" stop-color="${K.floorLight}" stop-opacity="0"/></radialGradient>
<linearGradient id="stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${K.stone[0]}"/><stop offset=".6" stop-color="${K.stone[1]}"/><stop offset="1" stop-color="${K.stone[2]}"/></linearGradient>
<linearGradient id="reveal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.revealL}" stop-opacity=".95"/><stop offset="1" stop-color="${K.revealL}" stop-opacity=".55"/></linearGradient>
<linearGradient id="revealDark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${K.revealD[0]}"/><stop offset="1" stop-color="${K.revealD[1]}"/></linearGradient>
<filter id="b1"><feGaussianBlur stdDeviation="1.2"/></filter><filter id="b3"><feGaussianBlur stdDeviation="3"/></filter><filter id="b8"><feGaussianBlur stdDeviation="8"/></filter><filter id="b20"><feGaussianBlur stdDeviation="20"/></filter>
<filter id="stoneTex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035 .05" numOctaves="4" seed="3" result="n"/><feDiffuseLighting in="n" surfaceScale="2.6" lighting-color="${N ? '#8a9cff' : '#ffb070'}" diffuseConstant="1.1"><feDistantLight azimuth="20" elevation="24"/></feDiffuseLighting><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="8"/><feColorMatrix values="0 0 0 0 .06  0 0 0 0 .02  0 0 0 0 .12  0 0 0 .6 -.22"/></filter>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="${K.vig}" stop-opacity="0"/><stop offset="1" stop-color="${K.vig}" stop-opacity=".7"/></radialGradient>
<mask id="outsideM"><rect width="${W}" height="${H}" fill="#fff"/><path d="${OP}" fill="#000"/></mask>
<pattern id="zellige" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M19 2 L25 13 L36 19 L25 25 L19 36 L13 25 L2 19 L13 13Z" fill="none" stroke="#e8a64a" stroke-width="1" opacity=".5"/><circle cx="19" cy="19" r="3" fill="#1fa5b8" opacity=".5"/><path d="M0 0 L8 8 M38 0 L30 8 M0 38 L8 30 M38 38 L30 30" stroke="#e8a64a" stroke-width=".8" opacity=".35"/></pattern>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<g>${stars}</g>
<rect width="${W}" height="${H}" fill="url(#sunGlow)"/>
<g>${clouds}</g>
<circle cx="${SX}" cy="${SY}" r="${N ? 70 : 80}" fill="${N ? '#dce8ff' : '#fff2c0'}" opacity="${N ? .38 : .5}" filter="url(#b8)"/>
<circle cx="${SX}" cy="${SY}" r="${N ? 36 : 44}" fill="url(#sunDisc)"/>
${N ? `<g opacity=".5"><circle cx="${SX - 10}" cy="${SY - 6}" r="5" fill="#9aaede"/><circle cx="${SX + 12}" cy="${SY + 10}" r="7" fill="#9aaede" opacity=".7"/><circle cx="${SX - 4}" cy="${SY + 16}" r="3.4" fill="#9aaede"/></g>` : ''}
${dune(398, 16, .011, 0.4, 1, 0)}
<g filter="url(#b1)" opacity=".92">${skyline(760, 1180, 408, 3, K.skyl[0], K.rim, 1, N)}${skyline(140, 420, 414, 9, K.skyl[1], K.rim2, .8, N)}</g>
${dune(430, 22, .0085, 1.8, 2, 4)}
<g filter="url(#b1)">${skyline(560, 760, 452, 17, K.skyl[2], K.lit, 1.15, N)}${skyline(-10, 160, 452, 21, K.skyl[3], K.lit, 1.2, N)}</g>
${dune(470, 26, .0072, 3.3, 3, 8)}
<g>${rooftops()}</g>
<rect x="0" y="470" width="${W}" height="140" fill="${N ? '#ffb05a' : '#ff8a3e'}" opacity="${N ? .09 : .12}" filter="url(#b8)"/>
<rect x="0" y="592" width="${W}" height="${H - 592}" fill="url(#floorG)"/>
<rect x="0" y="592" width="${W}" height="${H - 592}" fill="url(#floorLight)"/>
<g>${floor()}</g>
<g opacity=".38" fill="#1a0a2a">${[...Array(28)].map((_, i) => { const x = i * 46 + 16; return `<path d="M${x},600 L${x - 120},716 L${x - 98},716 L${x + 10},600Z"/>`; }).join('')}</g>
<rect x="-10" y="540" width="${W + 20}" height="12" fill="url(#balu)"/><rect x="-10" y="540" width="${W + 20}" height="3" fill="${K.rim2}" opacity=".65"/>
${balusters()}
<rect x="-10" y="596" width="${W + 20}" height="14" fill="url(#balu)"/><rect x="-10" y="596" width="${W + 20}" height="3" fill="${K.rim2}" opacity=".5"/>
<ellipse cx="${SX}" cy="612" rx="360" ry="22" fill="${K.floorLight}" opacity=".28" filter="url(#b8)"/>
<rect x="0" y="420" width="${W}" height="190" fill="${K.haze}" opacity="${N ? .07 : .10}" filter="url(#b20)"/>
${N ? `<g filter="url(#b8)" opacity=".55"><ellipse cx="300" cy="640" rx="90" ry="14" fill="#ffb05a"/><ellipse cx="900" cy="650" rx="110" ry="16" fill="#ffb05a"/></g>` : ''}
<g>
 <path d="M0,0 H${W} V${H} H0Z ${OP}" fill="url(#stone)" fill-rule="evenodd"/>
 <g mask="url(#outsideM)"><rect width="${W}" height="${H}" fill="#7a4a5a" filter="url(#stoneTex)" opacity=".34" style="mix-blend-mode:overlay"/><rect width="${W}" height="${H}" fill="url(#zellige)" opacity=".5"/></g>
 <path d="${OP}" fill="none" stroke="#12081f" stroke-width="10"/>
 <path d="M86,${H} L86,360 C86,170 380,10 640,-70" fill="none" stroke="url(#reveal)" stroke-width="5"/>
 <path d="M1194,${H} L1194,360 C1194,170 900,10 640,-70" fill="none" stroke="${N ? '#2a1c58' : '#4a2860'}" stroke-width="5" opacity=".9"/>
 <path d="M86,${H} L86,360 C86,170 380,10 640,-70 L640,-24 C400,60 134,200 134,366 L134,${H}Z" fill="url(#reveal)" opacity=".55"/>
 <path d="M1194,${H} L1194,360 C1194,170 900,10 640,-70 L640,-24 C880,60 1146,200 1146,366 L1146,${H}Z" fill="url(#revealDark)" opacity=".85"/>
 <path d="${OP2}" fill="none" stroke="#12081f" stroke-width="3" opacity=".8"/>
 <path d="M134,${H} L134,366 C134,200 400,60 640,-24" fill="none" stroke="${K.rim2}" stroke-width="1.6" opacity=".7"/>
 ${studs}${corbel}${flutes}
 <path d="M30,${H} V120 M${W - 30},${H} V120" stroke="#12081f" stroke-width="3" opacity=".6"/>
</g>
<path d="M0,0 H190 C170,60 120,100 60,150 C30,176 10,230 0,300Z" fill="${N ? '#4a1030' : '#8c1e44'}"/>
<path d="M0,0 H190 C170,60 120,100 60,150" fill="none" stroke="${N ? '#c85a8a' : '#ff8a5e'}" stroke-width="4" opacity=".7"/>
<path d="M20,0 C60,80 80,150 10,290" fill="none" stroke="#5a0f2c" stroke-width="3" opacity=".6"/><path d="M60,0 C110,80 120,120 50,200" fill="none" stroke="#5a0f2c" stroke-width="3" opacity=".5"/>
<path d="M${W},0 H${W - 190} C${W - 170},60 ${W - 120},100 ${W - 60},150 C${W - 30},176 ${W - 10},230 ${W},300Z" fill="${N ? '#0a2a4a' : '#12507a'}"/>
<path d="M${W},0 H${W - 190} C${W - 170},60 ${W - 120},100 ${W - 60},150" fill="none" stroke="#6fdcff" stroke-width="3" opacity=".45"/>
<path d="M${W - 20},0 C${W - 60},80 ${W - 80},150 ${W - 10},290" fill="none" stroke="#0a2c48" stroke-width="3" opacity=".6"/>
<rect width="${W}" height="${H}" fill="url(#sunGlow)" opacity="${N ? .18 : .28}" style="mix-blend-mode:screen"/>
<rect width="${W}" height="${H}" fill="url(#vig)"/>
<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".5"/>
</svg>`;
}
function rays(N) {
  seed = 41; let r = '';
  for (let i = 0; i < 22; i++) { const len = 900; const a0 = Math.PI + (rnd() - .5) * 2.6; const a1 = a0 + .03 + rnd() * .05; r += `<path d="M${SX},${SY} L${f(SX + len * Math.cos(a0))},${f(SY + len * Math.sin(a0) * .9)} L${f(SX + len * Math.cos(a1))},${f(SY + len * Math.sin(a1) * .9)}Z" fill="url(#ray)" opacity="${f(.35 + rnd() * .5)}"/>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="1600" height="900"><defs><linearGradient id="ray" gradientUnits="userSpaceOnUse" x1="${SX}" y1="${SY}" x2="${SX - 700}" y2="${SY}"><stop offset="0" stop-color="${N ? '#cfe0ff' : '#ffe3a0'}" stop-opacity="${N ? .22 : .34}"/><stop offset="1" stop-color="${N ? '#cfe0ff' : '#ffe3a0'}" stop-opacity="0"/></linearGradient></defs>${r}</svg>`;
}
// hanging lamp sprite (rope from the top edge to the lamp), 70x330 in design units; unlit and lit versions
function lampSvg(lit) {
  const L = `<g transform="translate(35,254)"><line x1="0" y1="-254" x2="0" y2="0" stroke="#1c0b22" stroke-width="2.4"/><line x1="1.6" y1="-254" x2="1.6" y2="0" stroke="#ffb25e" stroke-width="1" opacity=".6"/>
 <path d="M-8,0 h16 l8,10 h-32z" fill="#3b1c10"/><path d="M-26,10 C-34,34 -26,56 -12,66 L12,66 C26,56 34,34 26,10Z" fill="url(#lampBr)"/><path d="M22,16 C27,36 22,54 12,64" stroke="#ffe08a" stroke-width="2" fill="none" opacity=".8"/><path d="M-26,10 h52" stroke="#1c0b22" stroke-width="2.4"/><circle cx="0" cy="70" r="5" fill="url(#lampBr)"/><path d="M-12,66 q12,10 24,0" fill="#2a1006"/>
 <path d="M-14,26 q14,8 28,0 M-17,40 q17,9 34,0" stroke="#2a0e04" stroke-width="1.8" fill="none" opacity=".6"/>
 ${lit ? `<path d="M-20,16 C-25,34 -19,50 -9,60 L9,60 C19,50 25,34 20,16Z" fill="#fff0b0" opacity=".9"/>` : ''}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 330" width="87.5" height="412.5"><defs><radialGradient id="lampBr" cx=".7" cy=".3" r=".9"><stop offset="0" stop-color="#fff0a8"/><stop offset=".35" stop-color="#e5972a"/><stop offset="1" stop-color="#4a2008"/></radialGradient><radialGradient id="lg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffb23a" stop-opacity=".4"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient></defs>${L}</svg>`;
}
// the lamp glow halo only (for the bonus ignite): bigger canvas
fs.writeFileSync(path.join(B, 'day.svg'), make(false));
fs.writeFileSync(path.join(B, 'night.svg'), make(true));
fs.writeFileSync(path.join(B, 'rays-day.svg'), rays(false));
fs.writeFileSync(path.join(B, 'rays-night.svg'), rays(true));
fs.writeFileSync(path.join(B, 'lamp.svg'), lampSvg(false));
fs.writeFileSync(path.join(B, 'lamp-lit.svg'), lampSvg(true));
console.log('scene svgs written');
