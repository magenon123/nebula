// Aino (guide) + Tuuli (husky), realistic bake version. Writes ../character.html + splash-sym.txt.
// Parts are painted offline (aino-head / aino-body / tuuli .cjs, charlib.cjs), baked to WebP and stored once in <defs>; layers <use> them.
// viewBox 480x410 at stage (1120,340).   Run: node char.cjs
const fs = require('fs'), path = require('path');
const { Sym, f } = require('./lib.cjs');
const { bake } = require('./charlib.cjs');
const H = require('./aino-head.cjs'), B = require('./aino-body.cjs'), T = require('./tuuli.cjs');
(async () => {
  const S = new Sym('ch');
  const ms = H.mouths();
  const parts = [
    { name: 'cpBody', ...B.body() }, { name: 'cpUpL', ...B.upper(-1) }, { name: 'cpUpR', ...B.upper(1) }, { name: 'cpFoL', ...B.fore(-1) }, { name: 'cpFoR', ...B.fore(1) },
    { name: 'cpBraid', ...B.braid() }, { name: 'cpLant', ...B.lantern() }, { name: 'cpFace', ...H.face() }, { name: 'cpBrows', ...H.brows() }, { name: 'cpRing', ...H.ring() },
    { ...ms[0], name: 'cpM0' }, { ...ms[1], name: 'cpM1' }, { ...ms[2], name: 'cpM2' },
    { name: 'cpDBody', ...T.body() }, { name: 'cpDTail', ...T.tail() }, { name: 'cpDHead', ...T.head() }, { name: 'cpDEarL', ...T.ear(-1) }, { name: 'cpDEarR', ...T.ear(1) }, { name: 'cpDJaw', ...T.jaw() },
  ];
  const R = await bake(parts, path.join(__dirname, 'bake/char'));
  const imgs = Object.entries(R).map(([k, v]) => `<image id="${k}" x="${v.x}" y="${v.y}" width="${v.w}" height="${v.h}" href="${v.uri}"/>`).join('');
  const u = k => `<use href="#${k}"/>`;
  const corona = S.rad(240, 190, 260, [[0, '#ffffff', .55], [.25, '#7dffc4', .35], [.6, '#8a5cff', .18], [1, '#8a5cff', 0]]);
  const rayG = S.rad(240, 190, 260, [[0, '#fff', .6], [1, '#9dffe0', 0]]);
  const snowG = S.lin(0, 330, 0, 410, [[0, '#9fc4e0'], [.35, '#4a7aa8'], [.8, '#12284a', .6], [1, '#12284a', 0]]);
  const frontG = S.lin(0, 352, 0, 410, [[0, '#7aa8cc'], [.4, '#2c5688'], [.75, '#0c1c3c', .7], [1, '#0c1c3c', 0]]);
  const flameG = S.ell(123, 296, 4, 8, [[0, '#ffffff'], [.35, '#ffe08a'], [.8, '#ff9a30'], [1, '#ff6a10', 0]]);
  const ai = H.eyes(S), de = T.eyes(S), dl = T.lids(S);
  const rays = Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180, px = Math.cos(a + 1.5708), py = Math.sin(a + 1.5708); return `<path d="M${f(240 + 270 * Math.cos(a))} ${f(190 + 270 * Math.sin(a))}L${f(240 + 8 * px)} ${f(190 + 8 * py)}L${f(240 - 8 * px)} ${f(190 - 8 * py)}Z"/>`; }).join('');
  const flame = `<g id="cFlame"><path d="M123 303.4C118.4 301 118.6 294.6 123 287.6C127.4 294.6 127.6 301 123 303.4Z" fill="${flameG}"/><path d="M123 302C120.8 300 121.4 296 123 293C124.6 296 125.2 300 123 302Z" fill="#fff" opacity=".9"/></g>`;
  const DOGHEAD = `<g transform="translate(385 252) scale(1.05) translate(-385 -252)"><g id="cDEarL">${u('cpDEarL')}</g><g id="cDEarR">${u('cpDEarR')}</g>${u('cpDHead')}<g id="cDEyes">${de}</g><g id="cDLids" opacity="0">${dl}</g><g id="cDJaw"><g class="jc"></g><g class="jo">${u('cpDJaw')}</g></g></g>`;
  const AINO = `<g id="cBody">${u('cpBody')}</g>
 <g id="cArmL">${u('cpUpL')}<g id="cForeL"><g id="cLant">${u('cpLant')}${flame}</g>${u('cpFoL')}</g></g>
 <g id="cArmR">${u('cpUpR')}<g id="cForeR">${u('cpFoR')}</g></g>
 <g id="cBraid">${u('cpBraid')}</g>
 <g id="cHead">${u('cpFace')}${ai.eyes}<g id="cLids" opacity="0">${ai.lids}</g><g id="cBrows">${u('cpBrows')}</g>
  <g id="cMouth"><g class="m0">${u('cpM0')}</g><g class="m1">${u('cpM1')}</g><g class="m2">${u('cpM2')}</g></g>${u('cpRing')}</g>`;
  const VB = 'viewBox="0 0 480 410" stroke-linejoin="round" stroke-linecap="round" overflow="visible"';
  const html = `<!-- Aino the guide + Tuuli the husky (baked realistic parts, see art/char.cjs). viewBox 480x410 at stage (1120,340). Ids: cCorona(cRays) cAll cAino(cBody cArmL(cForeL cLant cFlame) cArmR(cForeR) cBraid cHead(cLids cBrows cMouth .m0 .m1 .m2, .cEyeL/.cEyeR .cPup)) cDog(cDTail cDBody cDHead(cDEarL cDEarR cDEyes cDLids cDJaw .jc/.jo)) cFog cBang. Baked bitmaps live once in #cBackS <defs> (ids cp*). -->
<div id="char">
<svg class="cl" id="cBackS" ${VB}>
 <defs>${S.defs.join('')}${imgs}</defs>
 <g id="cCorona" opacity="0"><ellipse cx="240" cy="190" rx="260" ry="190" fill="${corona}"/><g id="cRays" fill="${rayG}">${rays}</g></g>
 <mask id="chFade"><rect width="480" height="410" fill="url(#chFadeG)"/></mask><linearGradient id="chFadeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff"/><stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <g mask="url(#chFade)"><path d="M0 410V352Q40 322 120 336Q240 316 340 334Q430 322 480 346V410Z" fill="${snowG}"/><path d="M0 352Q40 322 120 336Q240 316 340 334Q430 322 480 346" fill="none" stroke="#9ffbd8" stroke-opacity=".5" stroke-width="2"/></g>
</svg>
<svg class="cl" id="cAinoS" ${VB}><g id="cAll"><g id="cAino">${AINO}</g></g></svg>
<i class="cLG"></i>
<svg class="cl" id="cDogS" ${VB}><g transform="translate(-30 0)"><g id="cDog"><g id="cDTail">${u('cpDTail')}</g><g id="cDBody">${u('cpDBody')}</g><g id="cDHead">${DOGHEAD}</g></g></g></svg>
<svg class="cl" id="cFogS" ${VB}><g id="cFog"><circle class="fg1" cx="355" cy="238" r="6" fill="${S.rad(355, 238, 7, [[0, '#fff', .6], [1, '#cfe8ff', 0]])}"/><circle class="fg2" cx="355" cy="238" r="7" fill="${S.rad(355, 238, 8, [[0, '#fff', .5], [1, '#cfe8ff', 0]])}"/></g></svg>
<svg class="cl" id="cFrontS" ${VB}><g mask="url(#chFade)"><path d="M0 410V370Q60 350 120 358Q170 349 215 358Q260 352 330 358Q400 346 440 360Q465 356 480 364V410Z" fill="${frontG}"/><path d="M0 370Q60 350 120 358Q170 349 215 358Q260 352 330 358Q400 346 440 360Q465 356 480 364" fill="none" stroke="#9ffbd8" stroke-opacity=".45" stroke-width="2"/></g>
 <g id="cBang" opacity="0"><path d="M240 14l-6 30h12z" fill="#ffe08a" stroke="#4a2c08" stroke-width="1.6"/><circle cx="240" cy="54" r="5.4" fill="#ffe08a" stroke="#4a2c08" stroke-width="1.6"/></g></svg>
</div>
`;
  fs.writeFileSync(path.join(__dirname, '../character.html'), html);
  // splash symbols: static, reuse the baked images (character fragment must be in the page)
  const strip = x => x.replace(/ id="[^"]*"/g, '');
  const dogS = `<g transform="translate(-145 -71) scale(1.45)"><g transform="translate(-30 0)">${u('cpDTail')}${u('cpDBody')}<g transform="translate(385 252) scale(1.05) translate(-385 -252)">${u('cpDEarL')}${u('cpDEarR')}${u('cpDHead')}${de}</g></g></g>`;
  const ainoS = `<g transform="translate(-123 -20) scale(1.9)">${u('cpBody')}${u('cpUpL')}${u('cpLant')}${flame}${u('cpFoL')}${u('cpUpR')}${u('cpFoR')}${u('cpBraid')}${u('cpFace')}${ai.eyes}${u('cpBrows')}${u('cpM0')}${u('cpRing')}</g>`;
  const sp = sup => `<symbol id="ainoSplash${sup ? 'Super' : ''}" viewBox="40 6 420 360"><style>.asp .asb{animation:aspB 3s ease-in-out infinite;transform-origin:50% 100%}@keyframes aspB{50%{transform:scale(1.01,1.025)}}.asp .asr{transform-origin:240px 190px;animation:aspR 24s linear infinite}@keyframes aspR{to{transform:rotate(360deg)}}</style><defs><linearGradient id="aspF${sup ? 'S' : ''}" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="362"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="aspM${sup ? 'S' : ''}" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="380"><rect x="0" y="0" width="520" height="250" fill="#fff"/><rect x="0" y="250" width="520" height="112" fill="url(#aspF${sup ? 'S' : ''})"/></mask></defs><g class="asp">${sup ? `<ellipse cx="240" cy="190" rx="260" ry="190" fill="${corona}"/><g class="asr" fill="${rayG}">${rays}</g>` : ''}<g class="asb" mask="url(#aspM${sup ? 'S' : ''})">${ainoS}${dogS}</g></g></symbol>`;
  fs.writeFileSync(path.join(__dirname, 'splash-sym.txt'), sp(false) + '\n' + sp(true) + '\n');
  console.log('character.html', (html.length / 1024) | 0, 'KB');
})();
