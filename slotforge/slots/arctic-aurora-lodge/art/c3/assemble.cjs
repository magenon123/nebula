// node c3/assemble.cjs : out/*.webp + face.cjs -> ../../character.html, ../char3.css, ../../ainoSplash symbols (spliced into symbols.svg), splash-sym.txt
const fs = require('fs'), path = require('path'); const { P_ } = require('./parts.cjs'); const F = require('./face.cjs');
const O = path.join(__dirname, 'out'), A = path.join(__dirname, '..'), AS = path.join(A, '..');
const f = n => +(+n).toFixed(2); const b64 = n => fs.readFileSync(path.join(O, n + '.webp')).toString('base64');
const BB = {}; for (const [n, fn] of Object.entries(P_)) BB[n] = fn().bbox;
const img = (n, ref) => ref ? `<use href="#ci_${n}"/>` : `<image id="ci_${n}" href="data:image/webp;base64,${b64(n)}" x="${f(BB[n][0])}" y="${f(BB[n][1])}" width="${f(BB[n][2])}" height="${f(BB[n][3])}"/>`;
const HS = .76, hp = (x, y) => [f(240 + (x - 240) * HS), f(118 + (y - 118) * HS - 12)];
const HXF = 'translate(0 -12) translate(240 118) scale(.76) translate(-240 -118)';
const rg = (id, cx, cy, r, st) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}">${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}" stop-opacity="${s[2] == null ? 1 : s[2]}"/>`).join('')}</radialGradient>`;
const lg = (id, x1, y1, x2, y2, st) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}" stop-opacity="${s[2] == null ? 1 : s[2]}"/>`).join('')}</linearGradient>`;
const CX = 240, CY = 140;
const DEFS = rg('chCor', CX, CY, 270, [[0, '#ffffff', .55], [.25, '#7dffc4', .35], [.6, '#8a5cff', .18], [1, '#8a5cff', 0]]) + rg('chRay', CX, CY, 270, [[0, '#ffffff', .6], [1, '#9dffe0', 0]]) +
  lg('chSnow', 0, 360, 0, 410, [[0, '#a4c8e4'], [.4, '#4c7aa8'], [.85, '#12284a', .5], [1, '#12284a', 0]]) + lg('chSnowF', 0, 380, 0, 410, [[0, '#7aa8cc'], [.45, '#2c5688'], [.8, '#0c1c3c', .7], [1, '#0c1c3c', 0]]) +
  lg('chFadeG', 0, 0, 480, 0, [[0, '#fff', 0], [.1, '#fff', 1], [.9, '#fff', 1], [1, '#fff', 0]]) + rg('chFishG', 347, 290, 44, [[0, '#8dffe0', .75], [.5, '#8a6cff', .3], [1, '#8a6cff', 0]]) +
  rg('chEmber', 0, 0, 1, [[0, '#fff2a0', 1], [.4, '#ff9a30', .8], [1, '#ff6a20', 0]]) + rg('chFog', 0, 0, 1, [[0, '#ffffff', .6], [1, '#cfe8ff', 0]]);
let rays = ''; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, w = .05; rays += `<path d="M${CX + Math.cos(a - w) * 18} ${CY + Math.sin(a - w) * 18}L${f(CX + Math.cos(a) * 330)} ${f(CY + Math.sin(a) * 330)}L${f(CX + Math.cos(a + w) * 18)} ${f(CY + Math.sin(a + w) * 18)}Z"/>`; }
const eyeC = [hp(224, 78), hp(256, 78)];
const ember = hp(196, 92), pivH = [240, 104], pivHat = hp(240, 60), pivFea = hp(182, 32);
const SL = [170, 126], EL = [134, 178], SR = [310, 126], ER = [340, 186], HND = [337, 254];

function head(ref) {
  const I = n => img(n, ref);
  return `<g id="cHead"><g id="cHeadI">${I('face')}
   <g transform="${HXF}"><g id="cFaceV"><g id="cBrows">${F.brows}</g>${F.eyes}<g id="cLids" opacity="0">${F.lids}</g></g></g>
   <g id="cBeard">${I('beard')}<g transform="${HXF} translate(0 4)">${F.mouths}</g></g>${I('must')}${I('pipe')}
   <g id="cEmber"><circle cx="${ember[0]}" cy="${ember[1]}" r="3.4" fill="url(#chEmber)"/></g>
   <g id="cSmoke"><circle class="sm1" cx="${ember[0] - 1}" cy="${ember[1] - 4}" r="2.6" fill="url(#chFog)"/><circle class="sm2" cx="${ember[0] - 1}" cy="${ember[1] - 4}" r="2.6" fill="url(#chFog)"/><circle class="sm3" cx="${ember[0] - 1}" cy="${ember[1] - 4}" r="2.6" fill="url(#chFog)"/></g>
   <g id="cHatG">${I('hat')}</g><g id="cFeather">${I('feather')}</g></g></g>`;
}
function bodyParts(ref, noFish) {
  const I = n => img(n, ref);
  return { body: `<g id="cBody">${I('body')}</g>`,
    armL: `<g id="cArmL">${I('armL')}<g id="cForeL">${I('foreL')}</g></g>`,
    armR: `<g id="cArmR">${I('armR')}<g id="cForeR">${I('foreR')}${noFish ? '' : `<g id="cFish"><circle id="cFishGlow" cx="337" cy="296" r="44" fill="url(#chFishG)"/>${I('fish')}</g>`}</g></g>` };
}
const B = bodyParts(false);
const SVGA = 'class="cl" viewBox="0 0 480 410" stroke-linejoin="round" stroke-linecap="round" overflow="visible"';
const html = `<!-- Old Kalle Havu, ice-fisher and lodge keeper (v4, leo). Baked WebP cel-paint layers (c3 pipeline) + live vector face. viewBox 480x410 at stage (1120,340). Ids: cCorona(cRays) cProp(cLant) cAll cKalle cBody cArmL(cForeL) cArmR(cForeR(cFish)) cHead(cHeadI(cFaceV(cBrows .cEyeL .cEyeR cLids) cBeard(cMouth .m0 .m1 .m2) cEmber cSmoke cHatG cFeather)) cBang -->
<div id="char">
<svg ${SVGA} id="cBackS"><defs>${DEFS}</defs>
 <g id="cCorona" opacity="0"><ellipse cx="${CX}" cy="${CY}" rx="270" ry="200" fill="url(#chCor)"/><g id="cRays" fill="url(#chRay)">${rays}</g></g>
 <g mask="url(#chFade)"><ellipse cx="240" cy="396" rx="236" ry="26" fill="url(#chSnow)"/><ellipse cx="236" cy="392" rx="118" ry="9" fill="#050a1c" opacity=".5"/></g>
 <mask id="chFade"><rect width="480" height="410" fill="url(#chFadeG)"/></mask></svg>
<svg ${SVGA} id="cPropS"><g id="cProp">${img('prop')}<g id="cLant"><use href="#s5" x="18" y="130" width="52" height="52"/></g></g></svg>
<i class="cLG"></i>
<div class="cl" id="cAll"><div class="cl" id="cKalle">
<svg ${SVGA} id="cBodyS">${B.body}</svg>
<svg ${SVGA} id="cArmLS">${B.armL}</svg>
<svg ${SVGA} id="cArmRS">${B.armR}</svg>
<svg ${SVGA} id="cHeadS">${head(false)}</svg>
</div></div>
<svg ${SVGA} id="cFrontS"><g mask="url(#chFade)"><path d="M0 410V386Q60 374 150 384Q260 372 360 383Q440 374 480 384V410Z" fill="url(#chSnowF)"/><path d="M0 386Q60 374 150 384Q260 372 360 383Q440 374 480 384" fill="none" stroke="#9ffbd8" stroke-opacity=".5" stroke-width="2.4"/></g>
 <g id="cBang" opacity="0"><path d="M296 -2l-6 28h12z" fill="#ffe08a" stroke="#4a2c08" stroke-width="1.8"/><circle cx="296" cy="34" r="5" fill="#ffe08a" stroke="#4a2c08" stroke-width="1.8"/></g></svg>
</div>`;
fs.writeFileSync(path.join(AS, 'character.html'), html);

// ---- splash symbols (reuse the image elements of the live character via <use>)
function splash(sup) {
  const b = bodyParts(true, true), hd = head(true).replace(/ id="[^"]*"/g, '');
  const strip = s => s.replace(/ id="[^"]*"/g, '');
  const armL = sup ? `<g transform="rotate(125 ${SL[0]} ${SL[1]})"><use href="#ci_armL"/><g transform="rotate(70 ${EL[0]} ${EL[1]})"><use href="#ci_foreL"/></g></g>` : strip(b.armL);
  const arR = strip(b.armR);
  const mouth = sup ? '' : '';
  return `<symbol id="ainoSplash${sup ? 'Super' : ''}" viewBox="40 6 420 360"><style>.asp .m1,.asp .m2,.asp .jo{opacity:${sup ? 1 : 0}}.asp .m2{opacity:0}.asp .asb{animation:aspB 3s ease-in-out infinite;transform-origin:50% 100%}@keyframes aspB{50%{transform:scale(1.01,1.025)}}.asp .asr{transform-origin:${CX}px ${CY}px;animation:aspR 24s linear infinite}@keyframes aspR{to{transform:rotate(360deg)}}</style><g class="asp">${sup ? `<g class="asr"><ellipse cx="${CX}" cy="${CY}" rx="270" ry="200" fill="url(#chCor)"/><g fill="url(#chRay)">${rays}</g></g>` : ''}<g class="asb"><g transform="translate(250 22) scale(1.52) translate(-240 -4)">${strip(b.body)}${arR}${armL}${hd.replace('<g id="cHead">', '<g>')}</g></g></g></symbol>`;
}
const sp = splash(0) + '\n' + splash(1) + '\n';
fs.writeFileSync(path.join(A, 'splash-sym.txt'), sp);
let sym = fs.readFileSync(path.join(AS, 'symbols.svg'), 'utf8');
sym = sym.replace(/<symbol id="ainoSplash"[\s\S]*?<\/symbol>\s*/, '').replace(/<symbol id="ainoSplashSuper"[\s\S]*?<\/symbol>\s*/, '');
sym = sym.replace(/\s*$/, '\n') + sp;
fs.writeFileSync(path.join(AS, 'symbols.svg'), sym);
console.log('character.html', (html.length / 1024) | 0, 'KB; symbols.svg', (sym.length / 1024) | 0, 'KB');
