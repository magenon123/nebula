// node c2/assemble.cjs : bakes nothing; reads out/*.webp -> ../character.html, ../char.css (from c2/char3.css), ../splash-sym.txt
const fs = require('fs'), path = require('path'); const O = path.join(__dirname, 'out'), A = path.join(__dirname, '..'), AS = path.join(__dirname, '../..');
const aino = require('./aino.cjs'), tuuli = require('./tuuli.cjs'); const POSE = aino.POSE;
const f = n => +(+n).toFixed(2);
const b64 = n => fs.readFileSync(path.join(O, n + '.webp')).toString('base64');
const SCALE = 1.18, GX = 166, GY = 356;
// image element (inline data) or <use> reference to the same element id (splash)
const img = (name, P, ref) => ref ? `<use href="#ci_${name}"/>` : `<image id="ci_${name}" href="data:image/webp;base64,${b64(name)}" x="${f(P.bbox[0])}" y="${f(P.bbox[1])}" width="${f(P.bbox[2])}" height="${f(P.bbox[3])}"/>`;
const grad = (id, x1, y1, x2, y2, st) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`;
const rgrad = (id, cx, cy, r, st) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}">${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</radialGradient>`;
const DEFS = [
  rgrad('chCor', 240, 170, 260, [[0, '#ffffff', .55], [.25, '#7dffc4', .35], [.6, '#8a5cff', .18], [1, '#8a5cff', 0]]),
  rgrad('chRay', 240, 170, 260, [[0, '#ffffff', .6], [1, '#9dffe0', 0]]),
  grad('chSnow', 0, 330, 0, 410, [[0, '#9fc4e0'], [.35, '#4a7aa8'], [.8, '#12284a', .6], [1, '#12284a', 0]]),
  grad('chSnowF', 0, 352, 0, 410, [[0, '#7aa8cc'], [.4, '#2c5688'], [.75, '#0c1c3c', .7], [1, '#0c1c3c', 0]]),
  grad('chFadeG', 0, 0, 480, 0, [[0, '#fff', 0], [.12, '#fff', 1], [.88, '#fff', 1], [1, '#fff', 0]]),
  rgrad('chIris', 0, 0, 3.6, [[0, '#b8f0dc'], [.5, '#3f9a86'], [1, '#17403c']]),
  rgrad('chIrisD', 0, 0, 4, [[0, '#f4ffff'], [.45, '#9fe4ff'], [1, '#2a78b8']]),
  grad('chScl', 0, -4, 0, 4, [[0, '#cdb8b0'], [.4, '#f8f2ea'], [1, '#e8e0d8']]),
  '<radialGradient id="chFog"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#cfe8ff" stop-opacity="0"/></radialGradient>',
  rgrad('chBlush', 0, 0, 1, [[0, '#ff7a86', .35], [1, '#ff7a86', 0]]),
].join('');
// ---------- Aino face vector (design space)
const eyeA = (x, y, outerDir, w = 1) => {
  const sx = outerDir * w, sc = `translate(${x} ${y}) scale(${sx} ${w})`;
  const shape = 'M-5.4 .5Q-3 -3.6 .6 -3.9Q4 -3.6 5.8 -.9Q3 3.2 -.6 3.4Q-3.8 3.2 -5.4 .5Z';
  return { eye: `<g transform="${sc}"><clipPath id="ce${x}"><path d="${shape}"/></clipPath><path d="${shape}" fill="url(#chScl)"/><g clip-path="url(#ce${x})"><g class="cPup"><circle cx=".5" cy="-.1" r="3.3" fill="url(#chIris)"/><circle cx=".5" cy="-.1" r="3.3" fill="none" stroke="#10302c" stroke-width=".7"/><circle cx=".6" cy="0" r="1.5" fill="#05070c"/><circle cx="-.6" cy="-1.4" r="1.05" fill="#fff"/><circle cx="1.6" cy="1.3" r=".5" fill="#fff" opacity=".7"/></g><path d="M-6 -4.6H7V-1.6Q.5 -3.2 -6 -1Z" fill="#7a3a3a" opacity=".42"/></g><path d="M-5.8 .4Q-3 -4.4 .6 -4.6Q4.6 -4.3 6.6 -1.6" fill="none" stroke="#1c0c08" stroke-width="1.5"/><path d="M6.4 -1.5l1.8 -1.3" stroke="#1c0c08" stroke-width="1.1"/><path d="M-4.4 1.8Q-1 3.8 4 2.2" fill="none" stroke="#a05a4e" stroke-width=".6" opacity=".6"/></g>`,
    lid: `<g transform="${sc}"><path d="M-6.4 .6Q-3 -5 .6 -5.2Q5 -4.8 7 -1.4Q3.6 4.2 -.6 4.2Q-4.6 4 -6.4 .6Z" fill="#e9b08a" stroke="#a05a4e" stroke-width=".5" stroke-opacity=".6"/><path d="M-5.6 .6Q-1 3.4 5.6 -.4" fill="none" stroke="#1c0c08" stroke-width="1.2"/></g>` };
};
const eL = eyeA(160, 83, -1, 1.04), eR = eyeA(178, 83, 1, .92);
const brow = (flip) => `<path d="M148 73Q155 69.4 163 70.8Q167.8 71.8 170.4 76.4Q166 73.2 162 73.2Q154 73.2 148 75.2Z" fill="#3a2014" stroke="#1c0c08" stroke-width=".4"/><path d="M151 72Q157 70 163 71.4" fill="none" stroke="#a87850" stroke-width=".6" opacity=".6"/>`;
const mouth = `<g id="cMouth">
 <g class="m0"><path d="M163.5 99.4Q166.6 97.2 170 98.2Q173.4 97.2 176.6 98.6Q171 99.8 163.5 99.4Z" fill="#b8424e" stroke="#7a2430" stroke-width=".5"/><path d="M164.4 99.8Q170 104.4 176 99.2Q170 101.2 164.4 99.8Z" fill="#e07a84" stroke="#a03a46" stroke-width=".5"/><path d="M167 101.6Q170 102.6 173 101.6" fill="none" stroke="#fff" stroke-width=".8" opacity=".7"/><path d="M176.6 98.6l1.4 -1.1M163.3 99.4l-1.2 -.8" stroke="#a03a46" stroke-width=".7" fill="none"/></g>
 <g class="m1"><path d="M162.8 98Q170 99.8 177.6 97.4Q176.8 106 170 106.8Q163.4 106 162.8 98Z" fill="#4a0c14" stroke="#a03a46" stroke-width=".8"/><path d="M164 98.6Q170 100.2 176.4 98.2L175.8 100.6Q170 102.2 164.6 100.8Z" fill="#fff"/><ellipse cx="170" cy="104.4" rx="3.6" ry="1.8" fill="#e8707a"/></g>
 <g class="m2"><ellipse cx="170" cy="101" rx="3.2" ry="3.9" fill="#4a0c14" stroke="#b8424e" stroke-width="1.2"/></g></g>`;
// ---------- Tuuli eyes
const eyeD = (x, y, w, rot) => {
  const sc = `translate(${x} ${y}) rotate(${rot}) scale(${w})`; const shape = 'M-5.6 .6Q-3 -3.4 .4 -3.8Q4 -3.4 5.6 -1Q3 3 -.6 3.2Q-4 3 -5.6 .6Z';
  return { eye: `<g transform="${sc}"><path d="${shape}" fill="#0c1018"/><clipPath id="cd${x}"><path d="${shape}"/></clipPath><g clip-path="url(#cd${x})"><g class="cDPup"><circle cx=".2" cy="0" r="3.4" fill="url(#chIrisD)"/><circle cx=".2" cy="0" r="3.4" fill="none" stroke="#10304a" stroke-width=".6"/><ellipse cx=".3" cy=".1" rx="1.2" ry="1.8" fill="#05080e"/><circle cx="-.8" cy="-1.4" r="1" fill="#fff"/></g></g><path d="M-6 .4Q-3 -4.2 .4 -4.4Q4.4 -4 6.2 -1.2" fill="none" stroke="#05080e" stroke-width="1.5"/></g>`,
    lid: `<g transform="${sc}"><path d="M-6.4 .6Q-3 -4.6 .4 -4.8Q4.6 -4.4 6.6 -1.2Q3 3.8 -.6 3.8Q-4.6 3.6 -6.4 .6Z" fill="#3a465a" stroke="#10141f" stroke-width=".6"/></g>` };
};
const dN = eyeD(331, 185, 1.05, -8), dF = eyeD(313.5, 189, .8, -4);

function aSvg(ref) {
  const I = (n) => img(n, aino[n], ref);
  const POSEL = POSE.L, POSER = POSE.R; const dl = (a) => [-Math.sin(a * Math.PI / 180), Math.cos(a * Math.PI / 180)];
  const lantY = 56;
  return `<g transform="translate(${GX} ${GY}) scale(${SCALE}) translate(${-GX} ${-GY})">
 <g id="cBody">${I('body')}</g>
 <g id="cBraid">${I('braid')}</g>
 <g id="cArmL">${I('armL')}<g id="cForeL">${I('foreL')}<g transform="translate(${f(POSEL.E[0])} ${f(POSEL.E[1])}) rotate(${POSEL.tf})"><g id="cLant"><use href="#s5" x="-27" y="${lantY}" width="54" height="54"/></g></g></g></g>
 <g id="cArmR">${I('armR')}<g id="cForeR">${I('foreR')}</g></g>
 <g id="cHead"><g transform="translate(168 120) scale(1.1) translate(-168 -120)">${I('hoodBack')}${I('face')}
  <g id="cFaceV"><g class="cEyeL">${eL.eye}</g><g class="cEyeR">${eR.eye}</g><g id="cLids" opacity="0">${eL.lid}${eR.lid}</g>
  <ellipse cx="155" cy="97" rx="7" ry="4.4" fill="url(#chBlush)" transform="translate(0 0)"/><g id="cBrows"><g>${brow()}</g><g transform="translate(338 0) scale(-1 1)">${brow()}</g></g>
  ${mouth}</g>${I('hoodFront')}</g></g>
</g>`;
}
function dSvg(ref) {
  const I = (n) => img(n, tuuli[n], ref);
  return `<g id="cDog">
 <g id="cDTail">${I('dTail')}</g>
 <g id="cDBody">${I('dBody')}</g>
 <g id="cDHead"><g transform="translate(352 228) scale(1.12) translate(-352 -228)"><g id="cDEarL">${I('dEarL')}</g><g id="cDEarR">${I('dEarR')}</g>${I('dHead')}
  <g id="cDEyes">${dN.eye}${dF.eye}</g><g id="cDLids" opacity="0">${dN.lid}${dF.lid}</g>
  <g id="cDJaw"><g class="jc"></g><g class="jo">${I('dJaw')}</g></g></g></g>
</g>`;
}
const VB = 'viewBox="0 0 480 410" stroke-linejoin="round" stroke-linecap="round" overflow="visible"';
const rays = Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180, px = Math.cos(a + 1.5708), py = Math.sin(a + 1.5708); return `<path d="M${f(240 + 270 * Math.cos(a))} ${f(170 + 270 * Math.sin(a))}L${f(240 + 8 * px)} ${f(170 + 8 * py)}L${f(240 - 8 * px)} ${f(170 - 8 * py)}Z"/>`; }).join('');
const svg = `<div id="char">
<svg class="cl" id="cBackS" ${VB}>
 <defs>${DEFS}</defs>
 <g id="cCorona" opacity="0"><ellipse cx="240" cy="170" rx="260" ry="190" fill="url(#chCor)"/><g id="cRays" fill="url(#chRay)">${rays}</g></g>
 <mask id="chFade"><rect width="480" height="410" fill="url(#chFadeG)"/></mask>
 <g mask="url(#chFade)"><path d="M0 410V352Q40 322 120 336Q240 316 340 334Q430 322 480 346V410Z" fill="url(#chSnow)"/><path d="M0 352Q40 322 120 336Q240 316 340 334Q430 322 480 346" fill="none" stroke="#9ffbd8" stroke-opacity=".55" stroke-width="2.4"/></g>
</svg>
<svg class="cl" id="cAinoS" ${VB}><g id="cAll"><g id="cAino">${aSvg(false)}</g></g></svg>
<i class="cLG"></i>
<svg class="cl" id="cDogS" ${VB}>${dSvg(false)}</svg>
<svg class="cl" id="cFogS" ${VB}><g id="cFog"><circle class="fg1" cx="284" cy="206" r="9" fill="url(#chFog)" style="--r:9"/><circle class="fg2" cx="284" cy="206" r="10" fill="url(#chFog)"/></g></svg>
<svg class="cl" id="cFrontS" ${VB}><g mask="url(#chFade)"><path d="M0 410V372Q60 352 150 366Q260 350 360 364Q440 352 480 368V410Z" fill="url(#chSnowF)"/><path d="M0 372Q60 352 150 366Q260 350 360 364Q440 352 480 368" fill="none" stroke="#9ffbd8" stroke-opacity=".5" stroke-width="2.4"/></g>
 <g id="cBang" opacity="0"><path d="M240 14l-6 30h12z" fill="#ffe08a" stroke="#4a2c08" stroke-width="1.6"/><circle cx="240" cy="54" r="5.4" fill="#ffe08a" stroke="#4a2c08" stroke-width="1.6"/></g></svg>
</div>
`;
fs.writeFileSync(path.join(AS, 'character.html'), `<!-- Aino the guide + Tuuli the husky (v3 illustration: baked WebP paint layers + vector face). viewBox 480x410 at stage (1120,340). Ids: cCorona(cRays) cAll cAino(cBody cBraid cArmL(cForeL cLant) cArmR(cForeR) cHead(cLids cBrows cMouth .m0 .m1 .m2, .cPup, .cEyeL .cEyeR)) cDog(cDTail cDBody cDHead(cDEarL cDEarR cDEyes cDLids cDJaw .jc/.jo) cFog) cBang -->\n` + svg);
// splash symbols (images referenced from the in-page character fragment)
const strip = x => x.replace(/ id="c[A-Z][^"]*"/g, '');
const sp = (sup) => `<symbol id="ainoSplash${sup ? 'Super' : ''}" viewBox="40 6 420 360"><style>.asp .m1,.asp .m2,.asp .jo{opacity:0}.asp .asb{animation:aspB 3s ease-in-out infinite;transform-origin:50% 100%}@keyframes aspB{50%{transform:scale(1.01,1.025)}}.asp .asr{transform-origin:240px 170px;animation:aspR 24s linear infinite}@keyframes aspR{to{transform:rotate(360deg)}}</style><g class="asp">${sup ? `<ellipse cx="240" cy="170" rx="260" ry="190" fill="url(#chCor)"/><g class="asr" fill="url(#chRay)">${rays}</g>` : ''}<g class="asb"><g transform="translate(258 364) scale(.84) translate(-250 -364)">${strip(aSvg(true))}${strip(dSvg(true))}</g></g></g></symbol>`;
fs.writeFileSync(path.join(A, 'splash-sym.txt'), sp(false) + '\n' + sp(true) + '\n');
const css = fs.readFileSync(path.join(__dirname, 'char3.css'), 'utf8');
fs.writeFileSync(path.join(A, 'char.css'), css);
console.log('character.html', (fs.statSync(path.join(AS, 'character.html')).size / 1024) | 0, 'KB; splash-sym', (fs.statSync(path.join(A, 'splash-sym.txt')).size / 1024) | 0, 'KB');
