// Old Kalle Havu, ice-fisher and lodge keeper. All coordinates in the 480x410 character design space.
const { S, limb, fur, lock, mirror, stroke, part, rnd, setSeed, f, P, OL } = require('./lib.cjs');
const PAL = {
  parka: { fill: '#a4532b', sh1: '#7c3a25', sh2: '#4c2222', hi: '#dc8c4a' },
  skin: { fill: '#dc9c76', sh1: '#b8714f', sh2: '#86443a', hi: '#f8c8a0' },
  beard: { fill: '#ece6dc', sh1: '#bdc3d8', sh2: '#8089b0', hi: '#ffffff' },
  fur: { fill: '#7c6858', sh1: '#54444a', sh2: '#30262e', hi: '#bea58a' },
  ruff: { fill: '#cba876', sh1: '#9c7852', sh2: '#684838', hi: '#f2d8a4' },
  leather: { fill: '#6c4428', sh1: '#4a2c20', sh2: '#2e1a1a', hi: '#a8723e' },
  mitt: { fill: '#c8965e', sh1: '#9c6c46', sh2: '#6a4430', hi: '#ecc088' },
  blue: { fill: '#2d5aa8', sh1: '#1f3e82', sh2: '#142860', hi: '#62a0e8' },
  trou: { fill: '#3e4870', sh1: '#2c3454', sh2: '#1a1e3a', hi: '#6676a0' },
  brass: { fill: '#dcaa3c', sh1: '#a47824', sh2: '#6a4a18', hi: '#fff4a8' },
  wood: { fill: '#7e5836', sh1: '#5a3c28', sh2: '#3a241a', hi: '#b88050' },
  red: { fill: '#c8323c', sh1: '#982838', sh2: '#601a2c', hi: '#f06a68' },
  cream: { fill: '#efe2c4', sh1: '#c8b698', sh2: '#8e7a68', hi: '#fffaea' },
};
const O = (p, extra = {}) => Object.assign({}, p, extra);
// fur strand texture inside a region
function strands(x0, y0, x1, y1, n, cols, len = 9, ang = 80) {
  let s = ''; for (let i = 0; i < n; i++) { const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0), a = (ang + (rnd() - .5) * 50) * Math.PI / 180, l = len * (.6 + rnd() * .8), c = cols[(rnd() * cols.length) | 0];
    s += stroke(`M${f(x)} ${f(y)}q${f(Math.cos(a) * l * .5 + 2)} ${f(Math.sin(a) * l * .5)} ${f(Math.cos(a) * l)} ${f(Math.sin(a) * l)}`, c[0], c[1] || 1.1, c[2] || .7); } return s;
}
const P_ = {};
const HS = .76, HC = [240, 118], HXF = `translate(0 ${-12}) translate(${HC[0]} ${HC[1]}) scale(${HS}) translate(${-HC[0]} ${-HC[1]})`;
const UP = -12;
const ub = b => [b[0], b[1] + UP, b[2], b[3]], UX = `translate(0 ${UP})`;
const hb = (b, dy = 0) => { const X = x => HC[0] + (x - HC[0]) * HS, Y = y => HC[1] + (y + dy - HC[1]) * HS + UP; return [+X(b[0]).toFixed(1), +Y(b[1]).toFixed(1), +(b[2] * HS).toFixed(1), +(b[3] * HS).toFixed(1)]; };

// ---------------- PROP: ice spud pole with lantern hook (lantern itself is live) ----------------
P_.prop = () => { setSeed(11);
  let s = S('M80 392L82 128Q86 120 92 128L96 392Z', O(PAL.wood, { ow: 2, over: [150, 190, 232, 270, 312].map(y => stroke(`M81 ${y}L96 ${y + 3}`, '#2a180f', 1.3, .7)).join('') + stroke('M84 140L86 380', '#d8a870', 1, .35) }));
  s += S('M78 126Q84 112 94 126L94 134L78 134Z', O({ fill: '#5a6482', sh1: '#3c4666', sh2: '#262c48', hi: '#b8c8e8' }, { ow: 1.8 }));
  s += stroke('M86 118Q60 112 44 124Q40 130 46 134', OL, 6.4) + stroke('M86 118Q60 112 44 124Q40 130 46 134', '#8794b6', 3.4) + stroke('M84 117Q62 112 46 123', '#e6f2ff', 1, .8);
  return part(s, [30, 100, 80, 296], 2);
};

// ---------------- BODY: trousers, boots, parka, belt, gear, ruff ----------------
P_.body = () => { setSeed(21); let s = '';
  s += '<g transform="translate(-19 0)">';
  // trousers
  s += S('M208 256L254 256L252 346L204 346Z', O(PAL.trou, { ow: 2, over: stroke('M230 290Q226 316 224 340', '#0e1226', 1.4, .5) }));
  s += S('M262 256L310 256L316 346L264 346Z', O(PAL.trou, { ow: 2, over: stroke('M290 290Q292 316 296 340', '#0e1226', 1.4, .5) }));
  // boots
  const bootOver = (x0, x1) => `<rect x="${x0}" y="384" width="${x1 - x0}" height="12" fill="#1a0f12"/>` + stroke(`M${x0 + 4} 384L${x1 - 4} 384`, '#7a5a40', 1, .6);
  s += S('M202 344L254 344L256 374Q258 390 240 392L174 393Q158 392 162 380Q168 372 188 370Q204 366 202 354Z', O(PAL.leather, { ow: 2.2, over: bootOver(150, 262) + stroke('M176 380Q186 376 198 378', '#0e0808', 1.2, .6) + stroke('M210 356Q232 360 250 356', '#a8723e', 1.2, .6) }));
  s += S('M264 344L316 344L318 358Q322 368 338 372Q356 376 358 384Q356 392 342 393L274 392Q260 390 262 374Z', O(PAL.leather, { ow: 2.2, over: bootOver(256, 364) + stroke('M326 380Q338 376 350 380', '#0e0808', 1.2, .6) + stroke('M270 356Q292 360 312 356', '#a8723e', 1.2, .6) }));
  // fur cuffs
  const cuff = (x0, x1, y0, y1) => { const top = [[x0, y0 + 2], [x0 + (x1 - x0) * .35, y0], [x1, y0 + 2]], bot = [[x1, y1], [x0, y1]];
    return `M${x0} ${y1}L${x0} ${y0 + 2}` + fur(top, { len: 7, step: 6, side: -1 }) + `L${x1} ${y1}` + fur(bot, { len: 5, step: 7, side: -1 }) + 'Z'; };
  s += S(cuff(196, 258, 334, 352), O(PAL.ruff, { ow: 2, over: strands(196, 330, 258, 356, 22, [[PAL.ruff.sh2, 1, .6], [PAL.ruff.hi, 1, .8]], 8, 90) }));
  s += S(cuff(260, 322, 334, 352), O(PAL.ruff, { ow: 2, over: strands(260, 330, 322, 356, 22, [[PAL.ruff.sh2, 1, .6], [PAL.ruff.hi, 1, .8]], 8, 90) }));
  s += '</g>';
  s += `<g transform="${UX}">`;
  // parka
  const torso = 'M202 106Q182 112 172 124Q164 136 165 170Q168 196 184 210Q172 240 164 264Q200 276 240 276Q282 276 316 264Q308 240 296 210Q312 196 315 170Q316 136 308 124Q298 112 278 106Z';
  let diam = ''; for (let x = 160; x < 322; x += 14) { const y = 258 + Math.sin((x - 240) / 70) * 1.5; diam += `<path d="M${x} ${y - 6}L${x + 6} ${y}L${x} ${y + 6}L${x - 6} ${y}Z" fill="#e8b830" stroke="#14265a" stroke-width=".8"/><path d="M${x} ${y - 2.6}L${x + 2.6} ${y}L${x} ${y + 2.6}L${x - 2.6} ${y}Z" fill="#c8323c"/>`; }
  const folds = stroke('M186 150Q178 200 172 256', PAL.parka.sh2, 1.8, .55) + stroke('M294 150Q302 200 308 256', PAL.parka.sh2, 1.8, .55) + stroke('M204 224Q200 246 196 262', PAL.parka.sh2, 1.6, .5) + stroke('M276 224Q280 246 284 262', PAL.parka.sh2, 1.6, .5) + stroke('M178 152Q172 200 168 246', '#e8a05e', 1.2, .45) + stroke('M262 230Q268 252 272 268', PAL.parka.hi, 1.2, .35);
  const yoke = `<path d="M168 134Q240 170 312 134L314 148Q240 186 166 150Z" fill="${PAL.blue.fill}" stroke="${OL}" stroke-width="1.2"/><path d="M167 143Q240 180 313 143" fill="none" stroke="#e8b830" stroke-width="2"/><path d="M166 149Q240 186 314 149" fill="none" stroke="#c8323c" stroke-width="1.6"/>`;
  let laces = stroke('M240 108L240 204', '#26100e', 3.2, .9); for (let y = 118; y < 200; y += 10) laces += stroke(`M233 ${y}L247 ${y + 6}M247 ${y}L233 ${y + 6}`, '#c89058', 1.3, .95);
  s += S(torso, O(PAL.parka, { ow: 2.6, over: folds + yoke + laces + `<path d="M150 244Q240 258 330 244L330 292L150 292Z" fill="${PAL.blue.fill}" stroke="${OL}" stroke-width="1.4"/>` + diam + stroke('M150 245Q240 259 330 245', '#e8b830', 1.8) }));
  // belt
  s += S('M180 198Q240 209 300 198L302 213Q240 224 178 213Z', O(PAL.leather, { ow: 1.8, k: .5, over: [190, 206, 272, 288].map(x => `<circle cx="${x}" cy="${207 + (x - 240) * .02 + 2}" r="1.6" fill="#d9b070"/>`).join('') }));
  s += S('M222 200L246 203L246 218L222 215Z', O(PAL.brass, { ow: 1.8, k: .5, over: `<path d="M228 205L241 207L241 213L228 211Z" fill="#3a2410"/>` }));
  // knife on right hip
  s += '<g transform="translate(-22 -6)">';
  s += S('M298 218L310 220L314 256Q312 264 306 264L302 262Z', O(PAL.leather, { ow: 1.8, k: .6, over: stroke('M304 232L308 258', '#a8723e', 1, .6) + `<path d="M299 232L313 235L313 240L299 237Z" fill="#c9a050"/>` }));
  s += S('M298 202L311 205L310 221L297 218Z', O(PAL.cream, { ow: 1.6, k: .5, over: stroke('M299 200L299 214M304 201L304 215', '#a89070', 1, .6) }));
  s += S('M295 216L314 220L313 226L294 222Z', O(PAL.brass, { ow: 1.4, k: .4 }));
  s += '</g>';
  // mittens hanging on a cord
  s += stroke('M254 204Q260 208 258 212M270 205Q268 209 270 213', '#2a1a10', 1.6);
  const mitt = (x, y, c, rot) => `<g transform="rotate(${rot} ${x} ${y})">` + S(`M${x} ${y}Q${x - 10} ${y + 2} ${x - 10} ${y + 16}Q${x - 9} ${y + 30} ${x} ${y + 31}Q${x + 10} ${y + 30} ${x + 10} ${y + 16}Q${x + 10} ${y + 2} ${x} ${y}ZM${x + 8} ${y + 14}Q${x + 17} ${y + 12} ${x + 15} ${y + 22}Q${x + 11} ${y + 24} ${x + 8} ${y + 22}Z`, O(c, { ow: 1.6, k: .5, over: `<rect x="${x - 11}" y="${y + 1}" width="22" height="7" fill="#f4eee0"/><path d="M${x - 9} ${y + 12}l4 -3 4 3 4 -3 4 3 4 -3" fill="none" stroke="#f4eee0" stroke-width="1.5"/>` })) + '</g>';
  s += mitt(258, 210, PAL.red, 5) + mitt(272, 211, PAL.blue, -4);
  // fur ruff collar
  const rp = [[186, 124], [180, 110], [190, 98], [208, 92], [240, 88], [272, 92], [290, 98], [300, 110], [294, 124]];
  s += S('M186 126' + fur(rp, { len: 8, step: 8, side: -1, skew: .2 }) + fur([[294, 124], [270, 140], [240, 144], [210, 140], [186, 126]], { len: 7, step: 8, side: -1 }) + 'Z', O(PAL.ruff, { ow: 2.2, over: strands(180, 88, 300, 146, 70, [[PAL.ruff.sh2, 1.1, .6], [PAL.ruff.hi, 1.1, .85], ['#fff6dc', .9, .6]], 10, 90) }));
  s += '</g>';
  return part(s, [112, 70, 262, 324], 1.8);
};

// ---------------- ARMS ----------------
const SL = [170, 138], EL = [134, 190], WL = [162, 210];
const SR = [310, 138], ER = [340, 198], WR = [334, 238];
const sleeveFold = (a, b, n) => { let s = ''; for (let i = 1; i <= n; i++) { const t = i / (n + 1); s += stroke(`M${f(a[0] + (b[0] - a[0]) * t - 7)} ${f(a[1] + (b[1] - a[1]) * t - 5)}q7 4 15 1`, PAL.parka.sh2, 1.4, .5); } return s; };
P_.armL = () => { setSeed(31);
  let s = S(limb(SL, EL, 37, 31, -3), O(PAL.parka, { ow: 2.4, over: sleeveFold(SL, EL, 3) + stroke('M156 128Q142 160 128 184', '#e8a05e', 1.3, .4) }));
  s += S('M116 192Q126 178 142 190Q140 204 126 208Z', O(PAL.leather, { ow: 1.6, k: .5, over: stroke('M120 194l14 8M122 200l12 5', '#2a1612', 1, .6) })); // elbow patch
  return part(s, ub([90, 106, 100, 112]), 2.2, 0, UX);
};
P_.foreL = () => { setSeed(32); const u = [(WL[0] - EL[0]), (WL[1] - EL[1])], L = Math.hypot(...u); u[0] /= L; u[1] /= L;
  let s = S(limb(EL, WL, 31, 27, -1), O(PAL.parka, { ow: 2.3, over: sleeveFold(EL, WL, 2) }));
  // blue trim + fur cuff
  const c1 = [WL[0] - u[0] * 8, WL[1] - u[1] * 8], c2 = [WL[0] + u[0] * 0, WL[1] + u[1] * 0], c3 = [WL[0] + u[0] * 7, WL[1] + u[1] * 7];
  s += S(limb(c1, c2, 29, 29), O(PAL.blue, { ow: 1.6, k: .5, over: stroke(`M${P(c1)}L${P(c2)}`, '#e8b830', 1.6) }));
  s += S(limb(c2, c3, 33, 33), O(PAL.ruff, { ow: 1.8, k: .6, over: strands(150, 196, 176, 226, 14, [[PAL.ruff.sh2, 1, .6], ['#fff6dc', 1, .8]], 7, 20) }));
  // mitt (fist on hip)
  s += S('M164 203Q178 197 192 202Q201 211 195 222Q181 229 168 224Q159 214 164 203Z', O(PAL.mitt, { ow: 2.2, k: .7, over: stroke('M174 204Q172 214 176 224M184 203Q183 214 186 224', PAL.mitt.sh2, 1.2, .7) + stroke('M163 214Q172 210 182 213', '#f4eee0', 1.4, .7) }));
  s += S('M166 205Q176 195 190 198Q192 206 184 209Q174 207 166 211Z', O(PAL.mitt, { ow: 1.6, k: .4 })); // thumb
  return part(s, ub([100, 176, 106, 64]), 2.4, 0, UX);
};
P_.armR = () => { setSeed(33);
  let s = S(limb(SR, ER, 37, 31, 3), O(PAL.parka, { ow: 2.4, over: sleeveFold(SR, ER, 3) + stroke('M326 128Q344 160 350 188', '#e8a05e', 1.3, .35) }));
  s += S(`M332 190Q344 184 354 194Q350 208 338 210Z`, O(PAL.leather, { ow: 1.6, k: .5, over: stroke('M336 192l12 8M337 198l11 5', '#2a1612', 1, .6) }));
  return part(s, ub([290, 112, 100, 106]), 2.2, 0, UX);
};
P_.foreR = () => { setSeed(34); const u = [(WR[0] - ER[0]), (WR[1] - ER[1])], L = Math.hypot(...u); u[0] /= L; u[1] /= L;
  let s = S(limb(ER, WR, 31, 27, 1), O(PAL.parka, { ow: 2.3, over: sleeveFold(ER, WR, 2) }));
  const c1 = [WR[0] - u[0] * 7, WR[1] - u[1] * 7], c3 = [WR[0] + u[0] * 6, WR[1] + u[1] * 6];
  s += S(limb(c1, WR, 29, 29), O(PAL.blue, { ow: 1.6, k: .5, over: stroke(`M${P(c1)}L${P(WR)}`, '#e8b830', 1.6) }));
  s += S(limb(WR, c3, 33, 33), O(PAL.ruff, { ow: 1.8, k: .6, over: strands(320, 234, 356, 250, 14, [[PAL.ruff.sh2, 1, .6], ['#fff6dc', 1, .8]], 7, 90) }));
  // mitt gripping the line: closed fist pointing down
  s += '<g transform="translate(-10 0)">';
  s += S('M334 244Q347 240 360 245Q364 257 358 268Q347 273 337 268Q330 257 334 244Z', O(PAL.mitt, { ow: 2.2, k: .7, over: stroke('M338 252Q348 255 358 252M338 259Q348 262 358 259', PAL.mitt.sh2, 1.2, .7) + stroke('M334 250Q340 248 346 250', '#f4eee0', 1.4, .7) }));
  s += S('M332 246Q327 254 332 262Q338 262 340 256Q338 250 332 246Z', O(PAL.mitt, { ow: 1.6, k: .4 }));
  s += '</g>';
  return part(s, ub([306, 190, 60, 90]), 2.4, 0, UX);
};

// ---------------- AURORA CHAR on a line (origin: hand grip 347,268) ----------------
P_.fish = () => { setSeed(41);
  const cx = 337, y0 = 296; // mouth top
  const body = `M${cx} ${y0}Q${cx + 11} ${y0 + 8} ${cx + 13} ${y0 + 32}Q${cx + 13} ${y0 + 56} ${cx + 6} ${y0 + 72}L${cx + 16} ${y0 + 90}Q${cx + 6} ${y0 + 82} ${cx} ${y0 + 84}Q${cx - 6} ${y0 + 82} ${cx - 16} ${y0 + 90}L${cx - 6} ${y0 + 72}Q${cx - 13} ${y0 + 56} ${cx - 13} ${y0 + 32}Q${cx - 11} ${y0 + 8} ${cx} ${y0}Z`;
  let s = stroke(`M337 266L337 ${y0 + 2}`, '#d8e8ff', 1.4, .9) + stroke(`M338 266L338 ${y0 + 2}`, OL, .8, .7);
  // fins
  s += S(`M${cx + 12} ${y0 + 30}Q${cx + 28} ${y0 + 34} ${cx + 26} ${y0 + 50}Q${cx + 16} ${y0 + 44} ${cx + 11} ${y0 + 44}Z`, { fill: '#c46cf0', sh1: '#8a40c0', sh2: '#5a2a90', hi: '#f0b0ff', ow: 1.4, k: .4 });
  s += S(`M${cx - 12} ${y0 + 30}Q${cx - 28} ${y0 + 34} ${cx - 26} ${y0 + 50}Q${cx - 16} ${y0 + 44} ${cx - 11} ${y0 + 44}Z`, { fill: '#c46cf0', sh1: '#8a40c0', sh2: '#5a2a90', hi: '#f0b0ff', ow: 1.4, k: .4 });
  let spots = ''; for (let i = 0; i < 9; i++) spots += `<circle cx="${cx + (rnd() - .5) * 18}" cy="${y0 + 14 + rnd() * 48}" r="${1.2 + rnd() * 1.4}" fill="#ff8cc0" opacity=".9"/>`;
  s += S(body, { fill: '#25a592', sh1: '#167a78', sh2: '#0e4a5c', hi: '#7af0d0', ow: 2, k: .6, over: `<path d="M${cx - 14} ${y0 + 36}Q${cx} ${y0 + 56} ${cx + 14} ${y0 + 36}L${cx + 14} ${y0 + 72}L${cx - 14} ${y0 + 72}Z" fill="#e4c8ff" opacity=".55"/>` + stroke(`M${cx - 10} ${y0 + 18}Q${cx} ${y0 + 12} ${cx + 10} ${y0 + 18}`, '#0e3a48', 1.3, .7) + spots + stroke(`M${cx - 5} ${y0 + 6}Q${cx - 8} ${y0 + 30} ${cx - 5} ${y0 + 56}`, '#d8fff0', 1.4, .5) });
  s += `<circle cx="${cx + 5}" cy="${y0 + 9}" r="2.6" fill="#fff6c0" stroke="${OL}" stroke-width=".9"/><circle cx="${cx + 5.4}" cy="${y0 + 9}" r="1.1" fill="${OL}"/>`;
  return part(s, ub([298, 262, 80, 132]), 2.4, 0, UX);
};

// ---------------- HEAD parts ----------------
P_.face = () => { setSeed(51);
  let s = '';
  s += S('M204 78Q197 80 197 90Q199 100 206 98Z', O(PAL.skin, { ow: 1.6, k: .4 })); // left ear
  s += S('M204 74Q200 90 206 104Q220 122 240 122Q262 122 274 104Q280 90 276 74L278 46Q240 38 202 46Z', O(PAL.skin, { ow: 2.2, k: .8, grad: .2, over:
    `<ellipse cx="222" cy="90" rx="9" ry="6" fill="#e8666a" opacity=".38"/><ellipse cx="260" cy="90" rx="9" ry="6" fill="#e8666a" opacity=".3"/>` +
    stroke('M205 80Q211 84 214 82M206 86Q212 89 216 88', PAL.skin.sh2, 1, .8) + stroke('M276 80Q270 84 266 82M275 86Q269 89 265 88', PAL.skin.sh2, 1, .8) +
    stroke('M214 84Q224 90 234 86', PAL.skin.sh2, 1.1, .55) + stroke('M246 86Q256 90 266 84', PAL.skin.sh2, 1.1, .55) + // eye bags
    stroke('M216 94Q220 100 224 103M264 94Q260 100 256 103', PAL.skin.sh2, 1.1, .5) +
    `<rect x="196" y="56" width="90" height="20" fill="url(#gBrim)" opacity=".9"/>` +
    `<ellipse cx="240" cy="108" rx="19" ry="5.5" fill="#3a1218"/><path d="M226 106Q240 103 254 106" fill="none" stroke="#7a3038" stroke-width="2"/>` }));
  // nose
  s += S('M240 72Q230 77 230 86Q230 93 240 94Q250 93 250 86Q250 77 240 72Z', O({ fill: '#e49272', sh1: '#bc5e4c', sh2: '#8c3a3a', hi: '#ffd0b0' }, { ow: 1.8, k: .5, over: `<ellipse cx="236.4" cy="91" rx="2" ry="1.2" fill="#5a2028" opacity=".7"/><ellipse cx="243.6" cy="91" rx="2" ry="1.2" fill="#5a2028" opacity=".7"/><ellipse cx="238" cy="84" rx="2.4" ry="3.6" fill="#fff" opacity=".35"/>` }));
  const bd = `<defs><linearGradient id="gBrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0a14" stop-opacity=".95"/><stop offset="1" stop-color="#1a0a14" stop-opacity="0"/></linearGradient></defs>`;
  return part(bd + s, hb([190, 36, 100, 92]), 3.4, 0, HXF);
};
// beard: base mass + clumped locks + braid
P_.beard = () => { setSeed(61); let s = '';
  const B = O(PAL.beard, { ow: 1.9, k: .75, grad: .22 });
  s += S('M204 86Q194 106 197 128Q199 152 218 170Q232 184 240 188Q250 182 264 170Q284 152 284 128Q286 106 276 86Q262 108 240 114Q218 108 204 86Z', O(B, { over: stroke('M214 130Q222 150 228 168M266 130Q258 150 252 168M240 122L240 176', PAL.beard.sh1, 1.3, .6) }));
  const lobe = (x, t, bt, w, bd) => `M${x - w / 2} ${t}C${x - w / 2 + bd} ${bt - w * .7} ${x - w * .26} ${bt} ${x} ${bt}C${x + w * .26} ${bt} ${x + w / 2 + bd} ${bt - w * .7} ${x + w / 2} ${t}Z`;
  const lb = [[205, 104, 150, 22, -5], [275, 104, 152, 22, 5], [222, 112, 178, 40, -4], [258, 112, 174, 40, 4], [240, 118, 192, 34, 0]];
  for (const [x, t, bt, w, bd] of lb) s += S(lobe(x, t, bt, w, bd), O(B, { ow: 1.6, k: .6, over: stroke(`M${x + 3} ${t + 14}Q${x + 5 + bd} ${(t + bt) / 2} ${x + 1} ${bt - 14}`, PAL.beard.sh1, 1.2, .7) + stroke(`M${x - 5} ${t + 12}Q${x - 6 + bd} ${(t + bt) / 2} ${x - 3} ${bt - 18}`, '#fff', 1, .75) }));
  // braid on the right with a brass ring
  const bx = [[283, 140], [287, 151], [286, 162], [290, 173], [288, 184]];
  for (let i = 0; i < bx.length - 1; i++) s += S(`M${bx[i][0] - 7} ${bx[i][1]}Q${bx[i][0]} ${bx[i][1] - 3} ${bx[i][0] + 7} ${bx[i][1]}L${bx[i + 1][0] + 7} ${bx[i + 1][1]}Q${bx[i + 1][0]} ${bx[i + 1][1] + 5} ${bx[i + 1][0] - 7} ${bx[i + 1][1]}Z`, O(PAL.beard, { ow: 1.4, k: .4, over: stroke(`M${bx[i][0] - 5} ${bx[i][1] + 2}L${bx[i][0] + 5} ${bx[i][1] + 8}`, PAL.beard.sh1, 1, .8) }));
  s += S('M281 160L295 162L295 167L281 165Z', O(PAL.brass, { ow: 1.2, k: .3 }));
  s += S('M283 184Q290 200 294 186L298 200Q290 194 286 200Z', O(PAL.leather, { ow: 1, k: .3 }));
  return part(s, hb([188, 82, 120, 140], 4), 3, 0, HXF + ' translate(0 4)');
};
P_.must = () => { setSeed(71);
  const L = 'M240 90C228 86 212 89 202 98C192 106 186 120 189 130C193 139 206 137 208 129C209 123 204 119 199 122C203 115 210 113 217 112C226 108 234 110 240 107Z';
  const base = O(PAL.beard, { ow: 1.9, k: .7, grad: .2 });
  const lobe = S(L, O(base, { over: stroke('M238 94Q216 92 204 104M236 100Q214 100 202 112M234 105Q216 106 206 116', PAL.beard.sh1, 1.3, .75) + stroke('M232 93Q214 92 206 100', '#fff', 1.1, .8) }));
  return part(lobe + mirror(lobe.replace(/id="(p|c|m)(\d+)/g, 'id="$1$2x').replace(/#(p|c|m)(\d+)/g, '#$1$2x')), hb([184, 84, 112, 56], 4), 3.4, 0, HXF + ' translate(0 4)');
};
P_.pipe = () => { setSeed(81);
  let s = stroke('M224 108Q206 112 196 108', OL, 7.4) + stroke('M224 108Q206 112 196 108', '#4a2c1a', 4.4) + stroke('M222 107Q206 110 197 106.5', '#a8723e', 1.3, .9);
  s += S('M184 92Q184 88 196 88Q208 88 208 92L206 112Q205 120 196 120Q187 120 186 112Z', O(PAL.wood, { ow: 1.9, k: .45, over: stroke('M188 100Q196 104 205 100', '#2a180f', 1, .5) }));
  s += S('M183 88Q185 83 196 83Q207 83 209 88Q196 92 183 88Z', O({ fill: '#2a1e1a', sh1: '#1a1210', sh2: '#0e0a0a', hi: '#6a5a50' }, { ow: 1.4, k: .3, rim: .6 }));
  s += S('M182 106L210 108L210 111L182 109Z', O(PAL.brass, { ow: 1, k: .2 }));
  return part(s, hb([176, 74, 60, 54], 4), 3.4, 0, HXF + ' translate(0 4)');
};
const SQ = s => `<g transform="translate(242 0) scale(.84 1) translate(-242 0)">${s}</g>`;
P_.hat = () => { setSeed(91); let s = '';
  const fs = (x0, y0, x1, y1, n, cc) => strands(x0, y0, x1, y1, n, cc || [[PAL.fur.sh2, 1.2, .55], [PAL.fur.hi, 1.2, .8], ['#e6d4b8', .9, .6]], 11, 80);
  // right flap, hanging down
    s += S('M266 60L306 58' + fur([[306, 58], [311, 82], [308, 98], [292, 110]], { len: 6, step: 6, side: -1 }) + fur([[292, 110], [278, 104], [270, 88], [266, 70]], { len: 6, step: 6, side: -1 }) + 'Z', O(PAL.fur, { ow: 2.2, over: fs(262, 58, 314, 112, 30) }));
  // ties with beads
  s += stroke('M284 108Q282 120 281 130M296 104Q301 116 301 128', OL, 4.4) + stroke('M284 108Q282 120 281 130M296 104Q301 116 301 128', '#a8723e', 2.2);
  s += `<circle cx="281" cy="132" r="3.6" fill="#dcaa3c" stroke="${OL}" stroke-width="1.2"/><circle cx="301" cy="130" r="3.6" fill="#c8323c" stroke="${OL}" stroke-width="1.2"/>`;
  // dome
  const dome = [[176, 72], [171, 56], [177, 38], [195, 22], [221, 12], [250, 9], [278, 14], [298, 27], [310, 44], [314, 62], [308, 76]];
  s += S('M176 72' + fur(dome, { len: 9, step: 9, side: -1, skew: .3 }) + 'L300 58Q240 56 180 58Z', O(PAL.fur, { ow: 2.6, k: 1.2, over: fs(170, 2, 318, 70, 90) + stroke('M190 24Q236 4 292 26', PAL.fur.hi, 1.6, .5) + stroke('M184 44Q176 60 182 70', PAL.fur.hi, 1.4, .45) }));
  // left flap tied up (lump)
  s += S('M186 58' + fur([[186, 58], [168, 48], [152, 58], [150, 74], [160, 88], [178, 90]], { len: 7, step: 7, side: -1 }) + 'L198 80Z', O(PAL.fur, { ow: 2.2, over: fs(148, 46, 198, 92, 30) }));
  s += stroke('M172 54Q192 24 218 12', OL, 5.4) + stroke('M172 54Q192 24 218 12', '#a8723e', 3) + `<circle cx="174" cy="56" r="3.6" fill="#dcaa3c" stroke="${OL}" stroke-width="1.2"/>`;
  // brim roll (front, curved down at the temples)
  const brimBot = [[316, 80], [300, 72], [272, 65], [240, 62], [208, 65], [180, 72], [166, 80]];
  s += S('M166 66Q170 52 192 49Q240 40 292 49Q314 54 318 70L316 80' + fur(brimBot, { len: 5, step: 7, side: -1, skew: .2 }) + 'Z', O(PAL.fur, { ow: 2.4, k: 1, rim: .7, over: fs(166, 44, 320, 80, 40) + stroke('M176 62Q240 48 310 62', PAL.fur.sh2, 2, .4) }));
  // brass aurora badge
  s += S('M240 30L251 43L240 56L229 43Z', O(PAL.brass, { ow: 1.8, k: .4, over: `<path d="M240 36L246 43L240 50L234 43Z" fill="#37e0d0" stroke="#0c4a58" stroke-width="1"/><path d="M238 38L240 41" stroke="#fff" stroke-width="1.4"/>` }));
  s = SQ(s);
  return part(s, hb([130, -12, 210, 140], -8), 2.8, 0, HXF + ' translate(0 -8)');
};
P_.feather = () => { setSeed(95);
  let s = S('M182 52Q164 34 154 -4Q178 10 190 42Z', O(PAL.cream, { ow: 1.8, k: .5, over: [0, 1, 2, 3].map(i => stroke(`M${190 - i * 6} ${42 - i * 11}L${178 - i * 6} ${38 - i * 11}`, '#6a4a3a', 2.2, .8)).join('') + stroke('M184 48Q168 28 156 -2', '#8a7862', 1.2, .9) }));
  s = SQ(s);
  return part(s, hb([140, -24, 60, 80], -8), 3, 0, HXF + ' translate(0 -8)');
};
module.exports = { P_, PAL };
