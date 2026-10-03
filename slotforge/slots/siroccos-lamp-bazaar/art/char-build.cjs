// node char-build.cjs -> ../character.html, char.css, splash-sym.txt. Needs bake/c_*.webp (node char-bake.cjs).
const fs = require('fs'), path = require('path'); const { P, LFL, LFR, OL } = require('./char-parts.cjs'); const { f, star4 } = require('./lib.cjs');
const B = path.join(__dirname, 'bake');
const img = n => 'data:image/webp;base64,' + fs.readFileSync(path.join(B, 'c_' + n + '.webp')).toString('base64');
const n2 = v => (Math.round(v * 100) / 100).toString();
const deg = r => r * 180 / Math.PI, rad = d => d * Math.PI / 180;

// ---------- rig ----------
const ARM = {
  L: { S: [154, 262], E0: [140, 392], H0: [318, 338], lf: LFL, left: true },
  R: { S: [346, 262], E0: [360, 394], H0: [184, 342], lf: LFR, left: false },
};
for (const k of 'LR') { const A = ARM[k]; A.lu = Math.hypot(A.E0[0] - A.S[0], A.E0[1] - A.S[1]); A.defU = Math.atan2(A.E0[1] - A.S[1], A.E0[0] - A.S[0]); A.defF = Math.atan2(A.H0[1] - A.E0[1], A.H0[0] - A.E0[0]); }
// solve a pose for one arm: wrist target H -> {u: upper arm deg, dx,dy: elbow shift, r: forearm deg (relative to default), E, H}
function ik(k, H, hint) {
  const A = ARM[k]; const [sx, sy] = A.S; let dx = H[0] - sx, dy = H[1] - sy; let d = Math.hypot(dx, dy); const lu = A.lu, lf = A.lf;
  d = Math.min(Math.max(d, Math.abs(lu - lf) + 2), lu + lf - 2); const a = Math.atan2(dy, dx); const al = Math.acos((lu * lu + d * d - lf * lf) / (2 * lu * d));
  const c = [a + al, a - al].map(t => [sx + lu * Math.cos(t), sy + lu * Math.sin(t)]);
  const sg = A.left ? -1 : 1; const hh = hint ? [sx + sg * hint[0], sy + hint[1]] : [sx + sg * 50, sy + 110]; const E = Math.hypot(c[0][0] - hh[0], c[0][1] - hh[1]) < Math.hypot(c[1][0] - hh[0], c[1][1] - hh[1]) ? c[0] : c[1];
  const Hr = [sx + (H[0] - sx) * d / Math.hypot(H[0] - sx, H[1] - sy), sy + (H[1] - sy) * d / Math.hypot(H[0] - sx, H[1] - sy)];
  const uA = Math.atan2(E[1] - sy, E[0] - sx) - A.defU; const fAbs = Math.atan2(Hr[1] - E[1], Hr[0] - E[0]);
  let r = deg(fAbs - A.defF); while (r > 180) r -= 360; while (r < -180) r += 360;
  let u = deg(uA); while (u > 180) u -= 360; while (u < -180) u += 360;
  return { u, dx: E[0] - A.E0[0], dy: E[1] - A.E0[1], r, E, H: Hr };
}
const tfU = p => `rotate(${n2(p.u)}deg)`;
const tfF = p => `translate(${n2(p.dx)}px,${n2(p.dy)}px) rotate(${n2(p.r)}deg)`;
const tfFattr = (k, p) => `translate(${n2(p.dx)} ${n2(p.dy)}) rotate(${n2(p.r)} ${ARM[k].E0[0]} ${ARM[k].E0[1]})`;

// ---------- poses: wrist targets (design space), open-hand flags, head/face ----------
const POSE = {
  idle: { L: ARM.L.H0, R: ARM.R.H0, oL: 0, oR: 0 },
  spin: { L: [58, 468], R: [442, 468], oL: 1, oR: 1, h: [40, 100] },
  win: { L: [40, 250], R: [460, 250], oL: 1, oR: 1 },
  big: { L: [92, 106], R: [408, 106], oL: 1, oR: 1, h: [105, 0] },
  special: { L: ARM.L.H0, R: [104, 318], oL: 0, oR: 1 },
  tease: { L: ARM.L.H0, R: [364, 212], oL: 0, oR: 1, h: [80, 90] },
  exhale: { L: ARM.L.H0, R: ARM.R.H0, oL: 0, oR: 0 },
  slump: { L: [190, 446], R: [310, 446], oL: 1, oR: 1, h: [96, 70] },
  bonus: { L: ARM.L.H0, R: [392, 186], oL: 0, oR: 1, h: [75, 90] },
  bonusmode: { L: ARM.L.H0, R: ARM.R.H0, oL: 0, oR: 0 },
  maxwin: { L: [30, 168], R: [470, 168], oL: 1, oR: 1, h: [100, -10] },
};
const SW = { A: [442, 468], B: [270, 478], C: [112, 452] }; // spin: right wrist sweeps across the belly
const FACE = { // head tilt deg, translate, eyes variant, mouth variant, brow raise right (px), pupils
  idle: { rot: 0, e: 0, m: 0, br: 0 }, spin: { rot: 2, e: 0, m: 0, br: 4 }, win: { rot: -2, e: 2, m: 1, br: 0 }, big: { rot: -5, e: 1, m: 1, br: 4 },
  special: { rot: 3, e: 1, m: 0, br: 6 }, tease: { rot: 7, ty: 3, e: 1, m: 0, br: 8 }, exhale: { rot: -3, e: 2, m: 0, br: 0 }, slump: { rot: 5, e: 0, m: 3, br: 3, up: 1 },
  bonus: { rot: -3, e: 1, m: 1, br: 4 }, bonusmode: { rot: 0, e: 0, m: 0, br: 2 }, maxwin: { rot: -5, e: 2, m: 1, br: 0 },
};
const BODY = { // whole-figure offsets
  win: 'translate(0,-8px)', big: 'translate(0,-26px)', maxwin: 'translate(0,-34px)', tease: 'rotate(-3deg) translate(-8px,0)', slump: 'translate(0,8px) scale(1,.985)', special: 'rotate(-1.5deg)', bonus: 'translate(0,-6px)', spin: 'translate(0,-2px)',
};

// ---------- face (vector, live) ----------
function face(live) {
  const eye = (cx, side) => { // side -1 left (viewer), +1 right
    return `<g class="eye e0"><path d="M${cx - 13.5},150 Q${cx - 1.5},141 ${cx + 11.5},149 Q${cx - .5},156 ${cx - 13.5},150Z" fill="#f4fff8" stroke="${OL}" stroke-width="1.6"/><g class="pup"><circle cx="${cx}" cy="149.5" r="4.6" fill="#f0a020"/><circle cx="${cx}" cy="149.5" r="2.2" fill="#140a28"/><circle cx="${cx - 1.5}" cy="148" r="1.2" fill="#fff"/></g></g>`;
  };
  const wide = (cx) => `<g class="eye e1"><path d="M${cx - 15},150 Q${cx - 1.5},136.5 ${cx + 13},149 Q${cx - .5},160 ${cx - 15},150Z" fill="#f8fffa" stroke="${OL}" stroke-width="1.6"/><g class="pup"><circle cx="${cx}" cy="149" r="5.8" fill="#f6b030"/><circle cx="${cx}" cy="149" r="2.7" fill="#140a28"/><circle cx="${cx - 1.8}" cy="147" r="1.5" fill="#fff"/></g></g>`;
  const happy = (cx) => `<path class="eye e2" d="M${cx - 14},152 Q${cx - 1},140 ${cx + 13},152" fill="none" stroke="${OL}" stroke-width="3.4" stroke-linecap="round"/>`;
  const lashes = `<g class="lash l0"><path d="M215,150 Q231,138 246,148 L244,151 Q231,145 217,153Z" fill="${OL}"/><path d="M255,148 Q270,138 286,150 L284,153 Q270,145 255,151Z" fill="${OL}"/><path d="M214,152 L205,157 M286,152 L295,157" stroke="${OL}" stroke-width="2.4" stroke-linecap="round" fill="none"/></g>
  <g class="lash l1"><path d="M213,150 Q231,133 247,148 L245,151 Q231,141 215,153Z" fill="${OL}"/><path d="M254,148 Q270,133 288,150 L286,153 Q270,141 253,151Z" fill="${OL}"/><path d="M212,152 L203,156 M288,152 L297,156" stroke="${OL}" stroke-width="2.4" stroke-linecap="round" fill="none"/></g>`;
  const lids = `<g class="lids"><path d="M216,149 Q231,146 246,149 L246,157 Q231,162 216,157Z" fill="url(#skinH2)"/><path d="M216,153 Q231,158 246,153" fill="none" stroke="${OL}" stroke-width="2.4" stroke-linecap="round"/><path d="M255,149 Q270,146 285,149 L285,157 Q270,162 255,157Z" fill="url(#skinH2)"/><path d="M255,153 Q270,158 285,153" fill="none" stroke="${OL}" stroke-width="2.4" stroke-linecap="round"/></g>`;
  const brows = `<g class="brs"><g class="brL"><path d="M216,136 Q232,124 248,134 L247,138 Q232,131 217,141Z" fill="${OL}"/></g><g class="brR"><path d="M254,131 Q272,120 288,130 L287,135 Q272,127 254,136Z" fill="${OL}"/></g></g>`;
  const must = `<path d="M224,176 C232,168 246,170 250,176 C246,184 232,184 224,176Z" fill="#06060f" stroke="${OL}" stroke-width="1.6"/><path d="M276,176 C268,168 254,170 250,176 C254,184 268,184 276,176Z" fill="#14142a" stroke="${OL}" stroke-width="1.6"/><path d="M222,177 C214,174 208,166 210,160 M278,177 C286,174 292,166 290,160" fill="none" stroke="#06060f" stroke-width="3.4" stroke-linecap="round"/>`;
  const mouth = `<g class="mo m0"><path d="M240,188 Q250,192 262,186" fill="none" stroke="#e8a090" stroke-width="2" opacity=".7"/><path d="M236,191 Q250,197 266,188" fill="none" stroke="#06060f" stroke-width="2.4" stroke-linecap="round"/></g>
  <g class="mo m1"><path d="M235,188 Q250,185 266,187 Q263,207 250,208 Q237,206 235,188Z" fill="#3a0c18" stroke="#06060f" stroke-width="1.6"/><path d="M237.5,188.6 Q250,186.4 263.4,188.4 L262.4,193.6 Q250,191.6 238.6,193.6Z" fill="#f6f2e8"/><ellipse cx="250" cy="203" rx="7.5" ry="3.4" fill="#d0486a"/><path d="M238,201 Q250,211 263,200" fill="none" stroke="#e8a090" stroke-width="2" opacity=".7"/></g>
  <g class="mo m2"><ellipse cx="250" cy="194" rx="4.6" ry="5.4" fill="#3a0c18" stroke="#06060f" stroke-width="1.6"/></g>
  <g class="mo m3"><path d="M238,195 Q250,190 264,195" fill="none" stroke="#06060f" stroke-width="2.6" stroke-linecap="round"/></g>`;
  if (!live) return `<g class="splFace"><g class="eye e1">${wide(232).replace('class="eye e1"', '')}${wide(270).replace('class="eye e1"', '')}</g>${lashes.replace(/class="lash l0"/, 'style="display:none"')}${brows}${mouth.replace(/class="mo m0"/, 'style="display:none"').replace(/class="mo m1"/, '').replace(/class="mo m2"/, 'style="display:none"').replace(/class="mo m3"/, 'style="display:none"')}${must}</g>`;
  return `<g id="sFace"><defs><linearGradient id="skinH2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a5f90"/><stop offset=".5" stop-color="#27a0bc"/><stop offset="1" stop-color="#3cc4d0"/></linearGradient></defs>
  ${eye(232, -1)}${eye(270, 1)}${wide(232)}${wide(270)}${happy(232)}${happy(270)}${lashes}${lids}${brows}${mouth}${must}</g>`;
}

// ---------- html ----------
const place = (n, b, extra = '') => `<image id="ci_${n}" href="${img(n)}" x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}"${extra}/>`;
const fbox = lf => [-40, -66, lf + 144, 132];
const foreG = (k, cls) => { const A = ARM[k]; const lf = A.lf; const defDeg = deg(A.defF); const flip = k === 'R' ? ' scale(1 -1)' : ''; const b = fbox(lf);
  return `<g class="tap${k}"><g class="f${k}"><g transform="translate(${A.E0[0]} ${A.E0[1]}) rotate(${n2(defDeg)})${flip}"><g class="ffw"><image id="ci_fore${k}" href="${img('fore' + k)}" x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}"/></g><g class="fow"><image id="ci_fore${k}_o" href="${img('fore' + k + '_o')}" x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}"/></g></g></g></g>`; };
const pauld = `<g id="sPaul"><path d="M110,262 C112,226 160,216 186,238 C176,262 150,278 122,282 C112,278 108,270 110,262Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.6"/><path d="M110,262 C112,226 160,216 186,238 C176,262 150,278 122,282Z" fill="url(#goldV)"/><path d="M118,258 C124,238 152,228 174,238" fill="none" stroke="#fff0b0" stroke-width="2.2" opacity=".75"/>
<path d="M390,262 C388,226 340,216 314,238 C324,262 350,278 378,282 C388,278 392,270 390,262Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.6"/><path d="M390,262 C388,226 340,216 314,238 C324,262 350,278 378,282Z" fill="url(#goldV)"/><path d="M380,256 C372,238 346,228 326,240" fill="none" stroke="#fff0b0" stroke-width="2.4" opacity=".85"/>
<circle cx="146" cy="258" r="7" fill="url(#rubyC)" stroke="${OL}" stroke-width="1.8"/><circle cx="354" cy="258" r="7" fill="url(#rubyC)" stroke="${OL}" stroke-width="1.8"/></g>`;
const gdefs = `<defs>
<linearGradient id="goldA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b2a12"/><stop offset=".25" stop-color="#c8741e"/><stop offset=".55" stop-color="#ffd668"/><stop offset=".8" stop-color="#f5b23a"/><stop offset="1" stop-color="#fff0a8"/></linearGradient>
<linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b8" stop-opacity=".4"/><stop offset=".4" stop-color="#fff2b8" stop-opacity="0"/><stop offset="1" stop-color="#3a1408" stop-opacity=".45"/></linearGradient>
<radialGradient id="rubyC" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffb0a8"/><stop offset=".3" stop-color="#e0354f"/><stop offset="1" stop-color="#4a0618"/></radialGradient>
<radialGradient id="lampG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3b8" stop-opacity=".95"/><stop offset=".4" stop-color="#ffb23a" stop-opacity=".5"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>
<radialGradient id="auraG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff0b8" stop-opacity=".55"/><stop offset=".45" stop-color="#ffb23a" stop-opacity=".32"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>
<linearGradient id="rayG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff0b8" stop-opacity=".6"/><stop offset="1" stop-color="#fff0b8" stop-opacity="0"/></linearGradient>
<linearGradient id="mandG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c0"/><stop offset=".5" stop-color="#f6b93a"/><stop offset="1" stop-color="#b8681a"/></linearGradient>
<radialGradient id="smokeP" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d8fffa" stop-opacity=".85"/><stop offset=".5" stop-color="#4ab8e8" stop-opacity=".4"/><stop offset="1" stop-color="#5a3fc8" stop-opacity="0"/></radialGradient>
</defs>`;
// aura mandala (vector, rotates when shown)
function mandala() {
  let p = '', r = '';
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; const x = 250 + 168 * Math.cos(a), y = 330 + 168 * Math.sin(a); p += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="22" ry="9" transform="rotate(${i * 22.5} ${f(x)} ${f(y)})" fill="url(#mandG)" stroke="${OL}" stroke-width="1.6"/>`; r += `<path d="M250,330 L${f(250 + 300 * Math.cos(a - .03))},${f(330 + 300 * Math.sin(a - .03))} L${f(250 + 300 * Math.cos(a + .03))},${f(330 + 300 * Math.sin(a + .03))}Z" fill="url(#rayG)" transform="rotate(0)"/>`; }
  return `<g id="sRays" opacity=".8">${r}</g><circle cx="250" cy="330" r="226" fill="url(#auraG)"/><g id="sMand"><circle cx="250" cy="330" r="146" fill="none" stroke="${OL}" stroke-width="9"/><circle cx="250" cy="330" r="146" fill="none" stroke="url(#mandG)" stroke-width="5.4"/><circle cx="250" cy="330" r="194" fill="none" stroke="${OL}" stroke-width="5"/><circle cx="250" cy="330" r="194" fill="none" stroke="url(#mandG)" stroke-width="2.6"/>${p}${Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8 + Math.PI / 16; return `<circle cx="${f(250 + 170 * Math.cos(a))}" cy="${f(330 + 170 * Math.sin(a))}" r="3.4" fill="url(#rubyC)" stroke="${OL}" stroke-width="1"/>`; }).join('')}</g>`;
}
const sparks = [[60, 330, .0], [440, 330, .2], [96, 200, .5], [410, 200, .35], [250, 70, .15], [330, 120, .6], [170, 100, .45], [380, 420, .7]].map(([x, y, d], i) => `<g class="sp" style="--x:${x}px;--y:${y}px;--d:${d}s">${star4(x, y, 9 + (i % 3) * 3, i % 2 ? '#fff6c8' : '#ffe08a')}</g>`).join('');
const puffs = [0, 1, 2].map(i => `<circle class="pf pf${i}" cx="${196 + i * 30}" cy="610" r="26" fill="url(#smokeP)"/>`).join('');

const E0 = ARM;
const html = `<!-- Sirocco the djinn merchant (leo). Baked WebP rig layers (body, upper arms, forearms with fist/open-hand variants, head, turban, plume, tail, lamp) + live vector face (eyes, brows, mouth, mustache). viewBox 500x760, displayed 410x623 at stage (1150,127), bottom y=750. States: spin win big special tease(exhale|slump) bonus bonusmode maxwin; idle = no class. -->
<div id="char">
<svg class="cl" id="sAuraS" viewBox="0 0 500 760" overflow="visible">${gdefs}${mandala()}</svg>
<svg class="cl" id="sTailS" viewBox="0 0 500 760" overflow="visible"><g id="sTail">${place('tail', P.tail.bbox)}</g>${puffs}${place('lamp', P.lamp.bbox)}<circle id="sLampG" cx="118" cy="690" r="64" fill="url(#lampG)" opacity="0"/></svg>
<svg class="cl" id="sFigS" viewBox="0 0 500 760" overflow="visible" stroke-linejoin="round" stroke-linecap="round"><g id="sAll">
 ${place('body', P.body.bbox)}
 <g class="uL">${place('upL', P.upL.bbox)}</g><g class="uR">${place('upR', P.upR.bbox)}</g>
 ${pauld}
 <g id="sHead">${place('head', P.head.bbox)}${face(true)}${place('turban', P.turban.bbox)}<g id="sPlume">${place('plume', P.plume.bbox)}</g></g>
 ${foreG('L')}${foreG('R')}
</g></svg>
<svg class="cl" id="sFxS" viewBox="0 0 500 760" overflow="visible">${sparks}<g id="sBang" opacity="0"><path d="M420,60 l-8,40 h16z" fill="#ffe08a" stroke="#4a2c08" stroke-width="2"/><circle cx="420" cy="116" r="7" fill="#ffe08a" stroke="#4a2c08" stroke-width="2"/></g></svg>
</div>
`;
fs.writeFileSync(path.join(__dirname, '../character.html'), html);

// ---------- css ----------
const sel = (st, rest) => `#char.${st}${rest}`;
let css = `/* ---------- Sirocco (rig of baked layers + live vector face). 500x760 design space shown at 410x623 ---------- */
#char{left:1150px;top:127px;width:410px;height:623px;pointer-events:none;overflow:visible;--spd:1}
#char .cl{position:absolute;left:0;top:0;width:410px;height:623px;overflow:visible;display:block}
#char .eye.e1,#char .eye.e2,#char .lash.l1,#char .lids,#char .mo.m1,#char .mo.m2,#char .mo.m3,#char .fow,#char #sAuraS,#char .sp{opacity:0}
#char #sAuraS{transition:opacity .6s}
#char #sFigS,#char #sTailS{will-change:transform}
#char #sAll{transform-origin:250px 600px;transition:transform .5s cubic-bezier(.3,1.4,.5,1)}
#char .uL{transform-origin:154px 262px}#char .uR{transform-origin:346px 262px}
#char .fL{transform-origin:140px 392px}#char .fR{transform-origin:360px 394px}
#char .tapL{transform-origin:140px 392px}#char .tapR{transform-origin:360px 394px}
#char .uL,#char .uR,#char .fL,#char .fR{transition:transform .55s cubic-bezier(.3,1.35,.5,1)}
#char .ffw,#char .fow{transition:opacity .2s}
#char #sHead{transform-origin:250px 224px;transition:transform .5s cubic-bezier(.3,1.4,.5,1)}
#char #sPlume{transform-origin:254px 94px}
#char .brR,#char .brL{transition:transform .35s cubic-bezier(.3,1.5,.5,1)}
#char .brR{transform-origin:270px 132px}#char .brL{transform-origin:232px 137px}
#char .pup{transition:transform .3s}
#char .mo.m1{transform-origin:250px 190px}
/* ---------- IDLE: breathing, tail sway, blink, plume + lamp glow, finger tap ---------- */
#char #sFigS{transform-origin:250px 600px;animation:sBr 4.2s ease-in-out infinite}
@keyframes sBr{0%,100%{transform:scale(1,1)}50%{transform:scale(1.004,1.011)}}
#char #sTailS{transform-origin:250px 500px;animation:sTl 6s ease-in-out infinite alternate}
@keyframes sTl{from{transform:rotate(-1.6deg) translateX(-2px)}to{transform:rotate(1.8deg) translateX(3px)}}
#char .lids{animation:sBl 5.6s steps(1,end) infinite}
@keyframes sBl{0%,93%{opacity:0}94%,97%{opacity:1}98%,100%{opacity:0}}
#char.win .lids,#char.big .lids,#char.maxwin .lids,#char.exhale .lids,#char.bonus .lids,#char.special .lids,#char.tease .lids{animation:none}
#char #sPlume{animation:sPl 4.6s ease-in-out infinite alternate}
@keyframes sPl{from{transform:rotate(-2.6deg)}to{transform:rotate(3.2deg)}}
#char #sLampG{animation:sLg 2.8s ease-in-out infinite alternate;opacity:.28}
@keyframes sLg{from{opacity:.14}to{opacity:.4}}
#char .pf{opacity:0;transform-box:fill-box;transform-origin:center;animation:sPf 5.4s ease-out infinite}
#char .pf1{animation-delay:-1.8s}#char .pf2{animation-delay:-3.6s}
@keyframes sPf{0%{opacity:0;transform:translate(0,0) scale(.5)}20%{opacity:.7}100%{opacity:0;transform:translate(-30px,-60px) scale(1.7)}}
#char .tapR{animation:sTp 7s ease-in-out infinite}
@keyframes sTp{0%,70%,100%{transform:none}73%{transform:rotate(-1.6deg)}76%{transform:none}79%{transform:rotate(-1.6deg)}82%{transform:none}}
#char .brR{transform:translateY(-0px)}
`;
const POSES = {};
for (const [name, pz] of Object.entries(POSE)) {
  const L = ik('L', pz.L, pz.h), R = ik('R', pz.R, pz.h); POSES[name] = { L, R };
  if (name === 'idle') continue;
  css += `#char.${name} .uL{transform:${tfU(L)}}#char.${name} .fL{transform:${tfF(L)}}#char.${name} .uR{transform:${tfU(R)}}#char.${name} .fR{transform:${tfF(R)}}\n`;
  if (pz.oL) css += `#char.${name} .fL .ffw{opacity:0}#char.${name} .fL .fow{opacity:1}\n`;
  if (pz.oR) css += `#char.${name} .fR .ffw{opacity:0}#char.${name} .fR .fow{opacity:1}\n`;
}
for (const [name, fz] of Object.entries(FACE)) {
  if (name === 'idle') continue; const c = `#char.${name}`;
  css += `${c} #sHead{transform:translate(0,${fz.ty || 0}px) rotate(${fz.rot}deg)}\n`;
  css += `${c} .eye.e0{opacity:${fz.e === 0 ? 1 : 0}}${c} .eye.e1{opacity:${fz.e === 1 ? 1 : 0}}${c} .eye.e2{opacity:${fz.e === 2 ? 1 : 0}}${c} .lash.l0{opacity:${fz.e === 0 ? 1 : 0}}${c} .lash.l1{opacity:${fz.e === 1 ? 1 : 0}}\n`;
  css += `${c} .mo.m0{opacity:${fz.m === 0 ? 1 : 0}}${c} .mo.m1{opacity:${fz.m === 1 ? 1 : 0}}${c} .mo.m2{opacity:${fz.m === 2 ? 1 : 0}}${c} .mo.m3{opacity:${fz.m === 3 ? 1 : 0}}\n`;
  css += `${c} .brR{transform:translateY(${-fz.br}px) rotate(${-fz.br * .8}deg)}${c} .brL{transform:translateY(${-fz.br * .35}px)}\n`;
  if (fz.up) css += `${c} .pup{transform:translateY(-2.6px)}\n`;
  if (BODY[name]) css += `${c} #sAll{transform:${BODY[name]}}\n`;
}
// hide the plain-lash when e1/e2 are used is handled above (l0 off for e1 and e2)
css += `
/* default lash l0 visible, others hidden handled by the class rules above */
#char .lash.l0{opacity:1}
/* ---------- state animations ---------- */
#char.spin #sFigS{animation:sSpin calc(.95s*var(--spd)) ease-out}
@keyframes sSpin{0%{transform:scale(1)}30%{transform:scale(1.012)}100%{transform:scale(1)}}
`;
// spin sweep: right hand conjures across the belly
{ const a = ik('R', SW.A, [40, 100]), b = ik('R', SW.B, [40, 100]), c = ik('R', SW.C, [40, 100]);
  css += `#char.spin .uR{animation:sSwU calc(.95s*var(--spd)) ease-in-out both}#char.spin .fR{animation:sSwF calc(.95s*var(--spd)) ease-in-out both}
@keyframes sSwU{0%{transform:${tfU(a)}}50%{transform:${tfU(b)}}100%{transform:${tfU(c)}}}
@keyframes sSwF{0%{transform:${tfF(a)}}50%{transform:${tfF(b)}}100%{transform:${tfF(c)}}}
`; }
css += `
#char.win #sAll{animation:sWin calc(1.5s*var(--spd)) ease-in-out}
@keyframes sWin{0%{transform:translateY(0)}20%{transform:translateY(-14px)}40%{transform:translateY(0)}60%{transform:translateY(-10px)}80%{transform:translateY(0)}100%{transform:translateY(-8px)}}
#char.win .mo.m1,#char.big .mo.m1,#char.maxwin .mo.m1{animation:sLaugh .34s ease-in-out infinite alternate}
@keyframes sLaugh{from{transform:scaleY(.62)}to{transform:scaleY(1.05)}}
#char.win .sp,#char.big .sp,#char.maxwin .sp,#char.bonus .sp{animation:sSp calc(1.4s*var(--spd)) ease-out both;animation-delay:var(--d)}
#char.maxwin .sp,#char.bonusmode .sp{animation-iteration-count:infinite}
@keyframes sSp{0%{opacity:0;transform:translate(0,0) scale(.3) rotate(0)}25%{opacity:1}100%{opacity:0;transform:translate(0,-60px) scale(1.3) rotate(80deg)}}
#char .sp{transform-box:fill-box;transform-origin:center}
#char.big #sAuraS,#char.maxwin #sAuraS,#char.bonusmode #sAuraS{opacity:1}
#char #sMand{transform-origin:250px 330px}#char #sRays{transform-origin:250px 330px}
#char.big #sMand,#char.maxwin #sMand,#char.bonusmode #sMand{animation:sSpin2 18s linear infinite}
#char.big #sRays,#char.maxwin #sRays{animation:sSpin2 30s linear infinite reverse}
#char.bonusmode #sRays{opacity:0}
@keyframes sSpin2{to{transform:rotate(360deg)}}
#char.big #sAll{animation:sBig calc(3.2s*var(--spd)) ease-in-out}
@keyframes sBig{0%{transform:translateY(0)}18%{transform:translateY(-34px)}40%{transform:translateY(-22px)}60%{transform:translateY(-34px)}85%{transform:translateY(-24px)}100%{transform:translateY(-26px)}}
#char.maxwin #sAll{animation:sMax 2.4s ease-in-out infinite alternate}
@keyframes sMax{from{transform:translateY(-30px)}to{transform:translateY(-42px)}}
#char.special #sBang,#char.bonus #sBang{opacity:1;animation:sBg calc(.9s*var(--spd)) cubic-bezier(.3,1.7,.5,1) both}
@keyframes sBg{0%{transform:scale(0) translateY(20px)}100%{transform:none}}
#char #sBang{transform-box:fill-box;transform-origin:50% 100%}
#char.tease #sAll,#char.tease #sFigS{}
#char.tease .pup{transform:translate(-1.8px,.4px)}
#char.exhale #sAll{animation:sEx 1.1s ease-in-out both}
@keyframes sEx{0%{transform:rotate(-3deg) translate(-8px,0)}40%{transform:translateY(-10px) scale(1.02)}100%{transform:none}}
#char.slump #sAll{animation:sSl 1.2s ease-out both}
@keyframes sSl{0%{transform:translateY(-6px)}100%{transform:translateY(8px) scale(1,.985)}}
#char.bonus #sLampG,#char.bonusmode #sLampG,#char.maxwin #sLampG{animation:sLgb .5s ease-in-out infinite alternate;opacity:.9}
@keyframes sLgb{from{opacity:.55;transform:scale(1)}to{opacity:1;transform:scale(1.14)}}
#char #sLampG{transform-box:fill-box;transform-origin:center}
#char.bonus #sAll{animation:sBon calc(1.4s*var(--spd)) ease-out}
@keyframes sBon{0%{transform:none}30%{transform:translateY(-12px)}60%{transform:translateY(0)}100%{transform:translateY(-6px)}}
#char.bonus .tapR,#char.bonusmode .tapR{animation:none}
#char.bonusmode #sHead{animation:sNod .7s ease-in-out infinite alternate}
@keyframes sNod{from{transform:rotate(-1.5deg)}to{transform:rotate(2.5deg) translateY(2px)}}
#char.bonusmode .eye.e0 .pup circle:first-child{fill:#ffc040}
`;
fs.writeFileSync(path.join(__dirname, 'char.css'), css);

// ---------- splash portraits: bust, hands open, offering (+ super with corona) ----------
{ const L = ik('L', [52, 250]), R = ik('R', [448, 250]); const sx = tfFattr; // static transforms
  const arms = `<g transform="rotate(${n2(L.u)} 154 262)"><use href="#ci_upL"/></g><g transform="rotate(${n2(R.u)} 346 262)"><use href="#ci_upR"/></g>
<use href="#sPaul"/>
<g transform="${tfFattr('L', L)}"><g transform="translate(140 392) rotate(${n2(deg(ARM.L.defF))})"><use href="#ci_foreL_o"/></g></g>
<g transform="${tfFattr('R', R)}"><g transform="translate(360 394) rotate(${n2(deg(ARM.R.defF))}) scale(1 -1)"><use href="#ci_foreR_o"/></g></g>`;
  const fig = `<use href="#ci_body"/>${arms}<g transform="rotate(-3 250 224)"><use href="#ci_head"/>${face(false)}<use href="#ci_turban"/><use href="#ci_plume"/></g>`;
  const spl = (id, extra) => `<symbol id="${id}" viewBox="-50 20 600 520">${extra}${fig}</symbol>\n`;
  const corona = `<circle cx="250" cy="300" r="250" fill="url(#auraG)"/>` + Array.from({ length: 18 }, (_, i) => { const a = i * Math.PI / 9; return `<path d="M250,300 L${f(250 + 330 * Math.cos(a - .06))},${f(300 + 330 * Math.sin(a - .06))} L${f(250 + 330 * Math.cos(a + .06))},${f(300 + 330 * Math.sin(a + .06))}Z" fill="url(#rayG)"/>`; }).join('') + `<circle cx="250" cy="300" r="190" fill="none" stroke="url(#mandG)" stroke-width="5"/><circle cx="250" cy="300" r="146" fill="none" stroke="url(#mandG)" stroke-width="3" stroke-dasharray="6 8"/>`;
  fs.writeFileSync(path.join(__dirname, 'splash-sym.txt'), spl('sirSplash', `<circle cx="250" cy="300" r="190" fill="url(#auraG)"/>`) + spl('sirSplashSuper', corona));
}
console.log('character.html', (html.length / 1024) | 0, 'KB; css', (css.length / 1024) | 0, 'KB');
for (const [k, v] of Object.entries(POSES)) console.log(k.padEnd(10), 'L u=' + n2(v.L.u), 'r=' + n2(v.L.r), ' R u=' + n2(v.R.u), 'r=' + n2(v.R.r));
