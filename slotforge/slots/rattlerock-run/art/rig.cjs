// RATTLEROCK RUN articulated rig (leo). node rig.cjs -> rig-symbols.txt (symbols, unprefixed gradient ids), rig.json, rig.css
// Every part keeps its ORIGINAL cart coordinates (cart centre = 0,0, rail at y 244) and gets a tight viewBox, so parts stacked at their
// documented boxes rebuild rrCartRide exactly. Container reference: 400x390 css px = cart box (-400,-530,800,780) at scale 0.5.
const B = require('./base.cjs');
const { fs, f, OUT, setSeed, heap2, dw3, glove3, glovePoint, cart, cartRim, spark, nugget } = B;
const path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const split = s => { const a = s.split(/<!--MK:(\w+)-->/); const o = { first: a[0] }; for (let i = 1; i < a.length; i += 2) o[a[i]] = a[i + 1]; return o; };
const T = s => `<g transform="translate(-58 0)">${s}</g>`;
const ol = (w = 3) => `stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

setSeed(11);
const cs = split(cart());
const heapBack = heap2(-205, -4, 250, 120, 70, 25) + heap2(255, -4, 170, 70, 30, 22);
const base = { hs: 1.3 };
const dR = split(dw3(Object.assign({ face: 'ride', arms: 'point' }, base)));
const rim = cartRim();
const heapFront = heap2(-60, -2, 220, 46, 26, 22);
const face = k => split(dw3(Object.assign({ face: k, arms: 'point' }, base))).head;
const dUp = split(dw3(Object.assign({ face: 'cheer', arms: 'up' }, base)));
const dGrip = split(dw3(Object.assign({ face: 'ride', arms: 'grip' }, base)));

// scarf wave frames: shift the y of the tail points progressively towards the tip
const waveScarf = (s, dy) => s.replace(/ d="([^"]+)"/g, (m, d) => ' d="' + d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (mm, x, y) => { const t = Math.max(0, Math.min(1, (-Number(x) - 40) / 170)); return x + ',' + f(Number(y) + dy * Math.pow(t, 1.3)); }) + '"');
const scarf = dR.first;

const parts = [
  ['Shadow', cs.first, [0, 238], 'soft ground shadow under the cart (scale X when the cart bounces)'],
  ['WheelB', cs.wheelB, [-190, 188], 'rear wheel: rotate about its centre'],
  ['WheelF', cs.wheelF, [190, 188], 'front wheel: rotate about its centre'],
  ['Body', cs.body, [0, 176], 'wooden cart box + iron bands + RR plate + base rail + coupling (pivot = bottom centre; tilt/bob)'],
  ['Load', heapBack, [0, -4], 'gold heaps behind the dwarf (back left + back right)'],
  ['LoadFront', heapFront, [-60, -2], 'gold heap in front of the dwarf, above the rim line'],
  ['Scarf', T(scarf), [-64, -206], 'scarf tail, wave frame 1 (neutral). Pivot = neck knot'],
  ['Scarf2', T(waveScarf(scarf, 16)), [-64, -206], 'scarf tail, wave frame 2 (tip down)'],
  ['Scarf3', T(waveScarf(scarf, -16)), [-64, -206], 'scarf tail, wave frame 3 (tip up)'],
  ['ArmFar', T(dR.farArm), [16, -196], 'far (back) arm reaching to the rim; pivot = shoulder; drawn BEHIND the torso'],
  ['ArmFarUp', T(dUp.farArm), [16, -196], 'far arm raised (cheer, right side); pivot = shoulder; behind the torso'],
  ['Torso', T(dR.torso + dR.rim), [-49, -50], 'jacket, strap, belt, pocket, neck scarf wrap, rim lights (no head, no arms). Pivot = hips'],
  ['HeadSmile', T(face('ride')), [48, -192], 'head: grin (default). Pivot = neck'],
  ['HeadCheer', T(face('cheer')), [48, -192], 'head: eyes shut, laughing'],
  ['HeadWorry', T(face('worry')), [48, -192], 'head: worried (brows up, small mouth)'],
  ['HeadDizzy', T(face('crash')), [48, -192], 'head: dizzy spiral eyes (after TNT)'],
  ['HeadDetermined', T(face('shield')), [48, -192], 'head: smirk (shield on)'],
  ['ArmPoint', T(dR.nearArm + glovePoint(186, -156)), [-44, -196], 'near arm pointing ahead + glove (front of the torso, below the rim). Pivot = shoulder'],
  ['ArmUpL', T(dUp.nearArm), [-44, -196], 'near arm raised (cheer, left side) + fist. Pivot = shoulder'],
  ['Rim', rim, [0, -10], 'steel rim of the cart (above the dwarf and the front heap line)'],
  ['GloveRim', T(glove3(198, -34, true)), [140, -34], 'dark glove of the far arm resting on the rim (above the rim)'],
  ['ArmRim', T(dGrip.nearArm + glove3(66, -34, false)), [-44, -196], 'near arm gripping the rim, glove on the rim (topmost layer). Pivot = shoulder'],
  ['Beam', `<polygon points="141,-345 780,-500 780,-120" fill="url(#rigBeam)"/>`, [141, -345], 'headlamp cone (soft gradient, no filter). Pivot = the lamp'],
  ['HatGlow', `<ellipse cx="68" cy="-366" rx="169" ry="125" fill="#fff0a0" opacity=".5"/>` + spark(0, -420, 22, .95) + spark(120, -440, 16, .9) + spark(170, -380, 14, .85), [68, -366], 'warm glow behind the helmet (shield on). Pulse its opacity'],
  ['Dust1', `<g ${ol(3)}><circle cx="0" cy="0" r="26" fill="#c8b49a"/><circle cx="-24" cy="10" r="18" fill="#b8a48a"/><circle cx="22" cy="12" r="20" fill="#d4c2a8"/><circle cx="2" cy="-18" r="16" fill="#d8c8b0"/></g>`, [0, 0], 'dust puff A (scale up + fade, 0.5 s)'],
  ['Dust2', `<g ${ol(3)}><circle cx="0" cy="0" r="20" fill="#d4c2a8"/><circle cx="20" cy="-8" r="14" fill="#c8b49a"/><circle cx="-16" cy="6" r="12" fill="#b8a48a"/></g>`, [0, 0], 'dust puff B'],
  ['SparkStreak', `<path d="M0,0 l-26,6" stroke="#ff9a30" stroke-width="5" stroke-linecap="round"/><path d="M-10,-8 l-22,-6" stroke="#ffe070" stroke-width="4" stroke-linecap="round"/><path d="M-6,10 l-20,12" stroke="#ffe070" stroke-width="3.4" stroke-linecap="round"/>${spark(2, 0, 12, .95)}`, [0, 0], 'rail spark burst at a wheel contact point (place at wheel bottom: (-190,244) / (190,244))'],
];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setContent(`<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000"><defs>${B.defs}<linearGradient id="rigBeam"><stop offset="0" stop-color="#fff0b0" stop-opacity=".5"/><stop offset="1" stop-color="#fff0b0" stop-opacity="0"/></linearGradient></defs>${parts.map((q, i) => `<g id="p${i}">${q[1]}</g>`).join('')}</svg>`);
  const boxes = await p.evaluate(n => Array.from({ length: n }, (_, i) => { const r = document.getElementById('p' + i).getBBox(); return [r.x, r.y, r.width, r.height]; }), parts.length);
  await b.close();
  const PAD = 10, json = {}; let syms = '', css = '';
  parts.forEach((q, i) => {
    const [name, svg, piv, note] = q, [x, y, w, h] = boxes[i];
    const vb = [Math.floor(x - PAD), Math.floor(y - PAD), Math.ceil(w + PAD * 2), Math.ceil(h + PAD * 2)];
    syms += `<symbol id="rrRig${name}" viewBox="${vb.join(' ')}" overflow="visible">${svg}</symbol>\n`;
    const cl = name[0].toLowerCase() + name.slice(1);
    const c = { left: (vb[0] + 400) / 2, top: (vb[1] + 530) / 2, width: vb[2] / 2, height: vb[3] / 2, ox: (piv[0] - vb[0]) / 2, oy: (piv[1] - vb[1]) / 2 };
    json['rrRig' + name] = { class: 'rg-' + cl, viewBox: vb, pivotCartUnits: piv, css: c, note };
    css += `.rrRig .rg-${cl}{left:${c.left}px;top:${c.top}px;width:${c.width}px;height:${c.height}px;transform-origin:${c.ox}px ${c.oy}px}\n`;
  });
  fs.writeFileSync(path.join(__dirname, 'rig-symbols.txt'), syms);
  fs.writeFileSync(path.join(__dirname, 'rig.json'), JSON.stringify(json, null, 1));
  fs.writeFileSync(path.join(__dirname, 'rig.css'), `.rrRig{position:relative;width:400px;height:390px;overflow:visible}\n.rrRig .rg,.rrRig .rg-upper{position:absolute;display:block;overflow:visible}\n.rrRig .rg-upper{left:0;top:0;width:400px;height:390px;transform-origin:175.5px 240px}\n` + css);
  fs.writeFileSync(path.join(__dirname, 'rig-parts-order.json'), JSON.stringify(parts.map(q => q[0])));
  console.log('rig parts', parts.length);
})();
