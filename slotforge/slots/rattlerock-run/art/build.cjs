// node build.cjs : assembles scene.html logo.html frame.html side.html character.html info.html slot.css (+ outro symbol) from bake/*.webp
// Run order: node world.cjs && node bake.cjs && node sprites.cjs && node build.cjs && node card.cjs
const B = require('./base.cjs');
const fs = require('fs'), path = require('path');
const D = path.join(__dirname, '..'), BK = path.join(__dirname, 'bake');
const b64 = n => fs.readFileSync(path.join(BK, n)).toString('base64');
const uri = n => `data:image/webp;base64,${b64(n)}`;
const FONT_TITLE = fs.readFileSync(path.join(__dirname, '../../siroccos-lamp-bazaar/art/fonts/cinzel-decorative-latin-900-normal.woff2')).toString('base64');
const FONT_NUM = B.FONT2;
const OUT = '#1c0f08';

// ---------------- scene.html ----------------
let css = '';
let scene = `<!-- Rattlerock Run world (leo). 1600x900 stage. 5 baked WebP parallax layers x 3 depth palettes (#scene.lv1 / .lv2 / .lv3), plus the daylight exit burst. Only transforms/opacity ever change. See ART-NOTES.md. -->\n<div id="scene" class="lv1">`;
for (const lv of [1, 2, 3]) scene += `<img class="ly ly-far L${lv}" alt="" width="2000" height="900" src="${uri(`far-lv${lv}.webp`)}">`;
for (const l of ['farmid', 'mid', 'track', 'near']) for (const lv of [1, 2, 3]) {
  scene += `<div class="ly ly-${l} L${lv}"></div>`;
  css += `.ly-${l}.L${lv}{background-image:url(${uri(`${l}-lv${lv}.webp`)})}\n`;
}
scene += `<div class="ly ly-track2"></div><div class="ly ly-exit"></div></div>\n<style id="rrWorldCss">${css}</style>\n`;
// track2 reuses the active track bitmap through CSS vars is not possible for url(); use one rule per level
let t2 = ''; for (const lv of [1, 2, 3]) t2 += `#scene.lv${lv} .ly-track2{background-image:var(--tr${lv})}\n`;
// (the track bitmaps are already in CSS above; copy them by selector grouping instead of repeating the data)
scene = scene.replace('</style>', `</style>`);
fs.writeFileSync(path.join(D, 'scene.html'), scene);
const exitData = uri('exit.webp');
// the exit overlay and the track2 lane need the bitmap too: add tiny rules that reference the existing selectors via CSS @import-free trick -> use <img> clones instead
let scene2 = fs.readFileSync(path.join(D, 'scene.html'), 'utf8');
scene2 = scene2.replace('<div class="ly ly-track2"></div><div class="ly ly-exit"></div>', `<div class="ly ly-track2"><div class="t2 L1"></div><div class="t2 L2"></div><div class="t2 L3"></div></div><div class="ly ly-exit"></div>`);
// track2 children share the track images: selector groups in the same rules
scene2 = scene2.replace(/\.ly-track\.L(\d)\{/g, (m, n) => `.ly-track.L${n},.ly-track2 .t2.L${n}{`);
scene2 = scene2.replace('</style>', `.ly-exit{background-image:url(${exitData})}\n</style>`);
fs.writeFileSync(path.join(D, 'scene.html'), scene2);

// ---------------- frame.html ----------------
fs.writeFileSync(path.join(D, 'frame.html'), `<!-- Rattlerock Run track window (leo). No board art. #frame = clipping + positioning window 1600x820 at stage (0,0) (the shell bottom bar starts at y 782). #grid = the lane where kai puts the cart and the pickups (position:absolute children, stage coordinates), #fxl = overlay for sparks, bursts, win pops (z6). -->\n<div id="frame"><div id="grid"></div><div id="fxl"></div></div>\n`);
fs.writeFileSync(path.join(D, 'character.html'), `<!-- Rattlerock Run: NO side character. The dwarf is part of the ride (symbols rrCart*). Empty on purpose so the shell finds #char. -->\n<div id="char"></div>\n`);

// ---------------- logo.html ----------------
{
  const cl = (x, y, s, h) => B.cluster(x, y, s, h, false);
  let L = `<defs>
<linearGradient id="rlF" x1="0" y1="20" x2="0" y2="118" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffbe6"/><stop offset=".3" stop-color="#ffe08a"/><stop offset=".62" stop-color="#f0a22c"/><stop offset="1" stop-color="#a8581a"/></linearGradient>
<linearGradient id="rlRib" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0b4552"/><stop offset=".5" stop-color="#1a8a8a"/><stop offset="1" stop-color="#0b4552"/></linearGradient>
<linearGradient id="rlGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a3d14"/><stop offset=".3" stop-color="#e79a2c"/><stop offset=".6" stop-color="#fff0a0"/><stop offset=".85" stop-color="#f1a72f"/><stop offset="1" stop-color="#ffe9a0"/></linearGradient>
<linearGradient id="rlSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3ccd8"/><stop offset=".5" stop-color="#7b8798"/><stop offset="1" stop-color="#2f3848"/></linearGradient>
<linearGradient id="rlWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b4743a"/><stop offset="1" stop-color="#4e2810"/></linearGradient>
<radialGradient id="rlGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2b8" stop-opacity=".7"/><stop offset="1" stop-color="#ff9a20" stop-opacity="0"/></radialGradient>
${B.defs.match(/<linearGradient id="gold"[\s\S]*?<\/linearGradient>/)[0].replace('id="gold"', 'id="rlG2"')}
</defs>`;
  const pick = (rot) => `<g transform="translate(340 66) rotate(${rot})"><rect x="-6" y="-70" width="12" height="150" rx="5" fill="url(#rlWood)" stroke="${OUT}" stroke-width="3.4"/><path d="M-96,-52 C-60,-92 60,-92 96,-52 C60,-76 24,-72 8,-60 L-8,-60 C-24,-72 -60,-76 -96,-52 Z" fill="url(#rlSteel)" stroke="${OUT}" stroke-width="3.6" stroke-linejoin="round"/><path d="M-84,-56 C-50,-80 -20,-78 -10,-70" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/></g>`;
  L += `<ellipse cx="340" cy="86" rx="330" ry="80" fill="url(#rlGlow)"/>`;
  L += pick(-18) + pick(18);
  L += cl(52, 150, .3, 'blue') + cl(628, 150, .3, 'amber') + cl(100, 156, .17, 'cyan') + cl(580, 156, .17, 'violet');
  const T = 'RATTLEROCK';
  for (const [dx, dy, c] of [[0, 8, '#3a1008'], [0, 5, '#7a3410']]) L += `<text x="340" y="${108 + dy}" text-anchor="middle" font-family="RRTitle" font-weight="900" font-size="104" textLength="620" lengthAdjust="spacingAndGlyphs" fill="${c}" stroke="${c}" stroke-width="10" stroke-linejoin="round">${T}</text>`;
  L += `<text x="340" y="108" text-anchor="middle" font-family="RRTitle" font-weight="900" font-size="104" textLength="620" lengthAdjust="spacingAndGlyphs" fill="url(#rlF)" stroke="#3a1008" stroke-width="6" paint-order="stroke" stroke-linejoin="round">${T}</text>`;
  L += `<text x="340" y="108" text-anchor="middle" font-family="RRTitle" font-weight="900" font-size="104" textLength="620" lengthAdjust="spacingAndGlyphs" fill="none" stroke="#fff6c8" stroke-width="1.6" opacity=".55" transform="translate(0 -2)">${T}</text>`;
  // rails + ribbon with RUN
  L += `<g stroke="${OUT}" stroke-linecap="round"><path d="M20,164 H660" stroke-width="12"/><path d="M20,164 H660" stroke="url(#rlSteel)" stroke-width="6"/>` + Array.from({ length: 15 }, (_, i) => `<rect x="${30 + i * 44}" y="170" width="26" height="8" rx="2" fill="url(#rlWood)" stroke-width="2.4"/>`).join('') + `</g>`;
  L += `<path d="M150,124 H530 L552,148 L530,172 H150 L128,148 Z" fill="url(#rlRib)" stroke="${OUT}" stroke-width="4.4" stroke-linejoin="round"/><path d="M158,130 H522 M158,166 H522" stroke="url(#rlGold)" stroke-width="3" fill="none"/>`;
  L += `<text x="340" y="162" text-anchor="middle" font-family="RRTitle" font-weight="900" font-size="46" letter-spacing="22" fill="url(#rlGold)" stroke="${OUT}" stroke-width="3.4" paint-order="stroke">RUN</text>`;
  L += `<g transform="translate(160 148)"><path d="M0,-12 L12,0 L0,12 L-12,0 Z" fill="#e0283a" stroke="${OUT}" stroke-width="2.6"/></g><g transform="translate(520 148)"><path d="M0,-12 L12,0 L0,12 L-12,0 Z" fill="#2fcf5a" stroke="${OUT}" stroke-width="2.6"/></g>`;
  fs.writeFileSync(path.join(D, 'logo.html'), `<!-- Rattlerock Run logo (leo). 680x190 viewBox. Small top-left in play: #logo{left:20px;top:16px;width:380px;height:106px}; the loading screen clones it big. Fonts RRTitle (Cinzel Decorative 900) embedded in slot.css. Static (no animation). -->\n<svg id="logo" viewBox="0 0 680 190" overflow="visible">${L.replace(/url\(#rlG2\)/g, 'url(#rlG2)')}</svg>\n`);
}

// ---------------- side.html (HUD strip) ----------------
const spr = (id, w, h, cls = '') => `<svg class="rrs ${cls}" style="width:${w}px;height:${h}px"><use href="#${id}"/></svg>`;
fs.writeFileSync(path.join(D, 'side.html'), `<!-- Rattlerock Run HUD strip (leo). #hud at stage (410,12) 1170x84 (TOP, because the shell bottom bar owns y 782-874). Drive: text of #hDepthV #hDistV #hMultV #hLoadV; class "pop" for 0.45 s on the cell that changed (remove after); #hMult style --p (0..1) moves the gem on the multiplier bar; lanterns: add "on" to #hl1..#hl3; shield: "on" on #hShield and text in #hShieldN. #hud.twin = two-cart mode (shows L / R load pair if you use #hLoadV2). -->
<div id="hud">
 <div class="hc" id="hDepth"><i>DEPTH</i><b id="hDepthV">0 m</b></div>
 <div class="hc" id="hDist"><i>DISTANCE</i><b id="hDistV">0 m</b></div>
 <div class="hc" id="hMult" style="--p:0"><i>MULTIPLIER</i><b id="hMultV">x1</b><div class="mBar"><span class="mFill"></span><span class="mGem">${spr('rrGaugeGem', 34, 38)}</span></div></div>
 <div class="hc" id="hLoad"><i>LOAD</i><b id="hLoadV">0.00</b></div>
 <div class="hc" id="hGear"><div class="hLans"><span id="hl1" class="hl">${spr('rrLantern', 40, 50)}</span><span id="hl2" class="hl">${spr('rrLantern', 40, 50)}</span><span id="hl3" class="hl">${spr('rrLantern', 40, 50)}</span></div><span id="hShield" class="hsh">${spr('rrHatIcon', 56, 40)}<em id="hShieldN">0</em></span></div>
</div>\n`);

// ---------------- info.html ----------------
const row = (id, nm, val) => `<tr><td><div class="nm">${spr(id, 38, 38)}<span>${nm}</span></div></td><td>${val}</td></tr>`;
fs.writeFileSync(path.join(D, 'info.html'), `  <p>One spin is one ride. Your cart rolls down the mine track past a row of stops; the result is already decided, you watch the dwarf collect it. Pay = <b>LOAD x MULTIPLIER</b> when the cart bursts through the golden door. Max win [[maxWin]]x your bet.</p>
  <table class="pt"><tr><th>PICKUP</th><th>WHAT IT DOES</th></tr>
  ${row('rrNugget', 'Gold nugget', 'Adds its value (in bets) to the LOAD.')}
  ${row('rrPile', 'Gold pile', 'A big handful: adds a larger value to the LOAD.')}
  ${row('rrGem2', 'Green gem x2', 'Adds 2 to the MULTIPLIER (it starts at x1).')}
  ${row('rrGem3', 'Blue gem x3', 'Adds 3 to the MULTIPLIER.')}
  ${row('rrGem5', 'Red gem x5', 'Adds 5 to the MULTIPLIER.')}
  ${row('rrGem10', 'Gold gem x10', 'Rare: adds 10 to the MULTIPLIER.')}
  ${row('rrHat', 'Hard hat', 'A SHIELD. It absorbs the next TNT. Shields are kept until used.')}
  ${row('rrTnt', 'TNT crate', 'Blows the cart up. The run ends and pays only the LOAD, no multiplier. A shield cancels it.')}
  ${row('rrLantern', 'Lantern', 'Collect 3 on one run to trigger the DEEP SHAFT bonus.')}
  ${row('rrFork', 'Lever fork', 'The track splits. The lever flips and the cart takes the left or the right track: one side is richer, the other safer.')}
  ${row('rrDoor', 'Golden door', 'The end of the run. The cart bursts into daylight and pays LOAD x MULTIPLIER. A rare door adds a fixed jackpot step.')}
  </table>
  <div class="rules">
    <div><b>THE RIDE</b><span>The cart carries a LOAD (gold, in multiples of your bet) and a MULTIPLIER gauge that starts at x1. Gold raises the load, gems raise the multiplier. The HUD on top shows DEPTH, DISTANCE, MULTIPLIER and LOAD live.</span></div>
    <div><b>SHIELD AND TNT</b><span>TNT ends the run and pays only the gold in the load. A hard hat pickup is a shield that cancels one TNT, the cart then rolls on. Unused shields do not pay.</span></div>
    <div><b>LEVER FORKS</b><span>At a fork the lever flips by itself. You see what waits on each side before it flips: the rich side holds bigger gold and gems but more TNT, the safe side small gold, hats or nothing.</span></div>
    <div><b>LANTERNS</b><span>Three lanterns collected on one run (they still count if the run ends later) start the DEEP SHAFT bonus after the run has paid.</span></div>
    <div><b>DEEP SHAFT (BONUS)</b><span>You get 3 carts and ride down 3 levels: the blue crystal cavern, the forge depths and the vault of gold. Each level is a short track with richer gems and gold. The multiplier and your shields carry down from cart to cart and from level to level, the load does not. A TNT without shield costs one cart, not the bonus. Reaching the bottom door ends the bonus with a jackpot step. When all carts are gone the bonus ends.</span></div>
    <div><b>TWIN CARTS (BET UP)</b><span>Pays [[anteCost]]x your bet per spin. Two carts run side by side on two tracks and both pay. Hard hats appear more often. Lantern chance is the same per cart.</span></div>
    <div><b>BONUS BUY</b><span>DEEP SHAFT for [[buy:deep]]x your bet, MOTHERLODE RUN for [[buy:motherlode]]x your bet (starts on the second level with extra shields). The round never pays more than [[maxWin]]x.</span></div>
    <div><b>TIP</b><span>Tap during a run to speed it up. Turbo is in the menu.</span></div>
  </div>\n`);

// ---------------- slot.css ----------------
const css2 = `/* ---------- ART-GEN fonts ---------- */
@font-face{font-family:RRTitle;font-weight:900;src:url(data:font/woff2;base64,${FONT_TITLE}) format('woff2')}
@font-face{font-family:RRNum;src:url(data:font/woff2;base64,${FONT_NUM}) format('woff2')}
/* ART-GEN fonts end */
/* ---------- world (see ART-NOTES.md) ---------- */
#scene{width:1600px;height:900px;overflow:hidden;background:#07040f}
#scene .ly{position:absolute;left:0;top:0;pointer-events:none;will-change:transform}
#scene .L1,#scene .L2,#scene .L3,#scene .t2.L1,#scene .t2.L2,#scene .t2.L3{opacity:0;visibility:hidden;transition:opacity .9s ease,visibility 0s .9s}
#scene.lv1 .L1,#scene.lv2 .L2,#scene.lv3 .L3{opacity:1;visibility:visible;transition:opacity .9s ease,visibility 0s}
#scene .ly-far{width:2000px;height:900px;animation:rrDrift 140s ease-in-out infinite alternate}
#scene .ly-farmid,#scene .ly-mid,#scene .ly-near{width:3200px;height:900px;background-repeat:repeat-x;background-size:1600px 900px;background-position:0 0}
#scene .ly-track,#scene .ly-track2 .t2{top:670px;width:3200px;height:230px;background-repeat:repeat-x;background-size:1600px 230px}
#scene .ly-track2{top:0;width:3200px;height:900px;display:none;transform-origin:0 718px}
#scene.twin .ly-track2{display:block}
#scene .ly-track2 .t2{position:absolute;left:0}
#scene .ly-farmid{animation:rrScroll 44.4s linear infinite;animation-play-state:paused}
#scene .ly-mid{animation:rrScroll 12.1s linear infinite;animation-play-state:paused}
#scene .ly-track{animation:rrScroll 2.67s linear infinite;animation-play-state:paused}
#scene .ly-track2{animation:rrScroll2 3.7s linear infinite;animation-play-state:paused}
#scene .ly-near{animation:rrScroll 1.78s linear infinite;animation-play-state:paused}
#scene.go .ly-farmid,#scene.go .ly-mid,#scene.go .ly-track,#scene.go .ly-track2,#scene.go .ly-near{animation-play-state:running}
#scene .ly-track2{transform:translate3d(0,-230px,0) scale(.72)}
#scene .ly-exit{width:1600px;height:900px;opacity:0;transition:opacity .7s ease;background-size:1600px 900px;background-repeat:no-repeat;mix-blend-mode:normal}
#scene.exit .ly-exit{opacity:1}
@keyframes rrDrift{from{transform:translate3d(0,0,0)}to{transform:translate3d(-400px,0,0)}}
@keyframes rrScroll{from{transform:translate3d(0,0,0)}to{transform:translate3d(-1600px,0,0)}}
@keyframes rrScroll2{from{transform:translate3d(0,-230px,0) scale(.72)}to{transform:translate3d(-1152px,-230px,0) scale(.72)}}
/* ---------- track window ---------- */
#frame{left:0;top:0;width:1600px;height:820px;overflow:hidden}
#grid{position:absolute;left:0;top:0;width:1600px;height:820px}
#fxl{position:absolute;left:0;top:0;width:1600px;height:820px;z-index:6;pointer-events:none}
.rrs{display:block;overflow:visible}
/* ---------- logo ---------- */
#logo{left:20px;top:16px;width:380px;height:106px;overflow:visible;pointer-events:none;filter:drop-shadow(0 3px 0 rgba(0,0,0,.45))}
.lmLogo #logo,.lmLogo svg{filter:none}
/* ---------- HUD strip ---------- */
#hud{left:410px;top:12px;width:1170px;height:84px;display:flex;align-items:stretch;border-radius:16px;background:linear-gradient(#1c1030,#120a20);border:4px solid #e8a830;box-shadow:0 5px 0 rgba(0,0,0,.45),inset 0 0 0 2px #6a3c1c,0 0 24px rgba(0,0,0,.5);color:#fff;pointer-events:none;overflow:hidden}
#hud .hc{position:relative;flex:1 1 0;display:flex;flex-direction:column;align-items:center;justify-content:center;border-left:2px solid #6a3c1c;min-width:0}
#hud .hc:first-child{border-left:0}
#hud .hc i{font-style:normal;font-family:RRTitle,serif;font-weight:900;font-size:14px;letter-spacing:4px;color:#ffd9a0}
#hud .hc b{font-family:var(--toon,RRNum),RRNum,sans-serif;font-weight:400;font-size:34px;line-height:1.05;color:#ffe08a;text-shadow:2px 3px 0 #1c0f08,-1px -1px 0 #1c0f08,1px -1px 0 #1c0f08}
#hud .hc.pop b{animation:rrPop .45s ease-out}
@keyframes rrPop{0%{transform:scale(1)}35%{transform:scale(1.35);color:#fff}100%{transform:scale(1)}}
#hMult{flex:1.45 1 0}
#hMult .mBar{position:relative;width:78%;height:8px;border-radius:5px;background:#2a1630;border:2px solid #6a3c1c;margin-top:1px;overflow:visible}
#hMult .mFill{position:absolute;left:0;top:0;bottom:0;width:calc(var(--p,0)*100%);border-radius:4px;background:linear-gradient(90deg,#2fcf5a,#2f8cf0,#e0283a,#ffd860)}
#hMult .mGem{position:absolute;top:-16px;left:calc(var(--p,0)*100% - 17px);width:34px;height:38px;transition:left .35s ease-out}
#hGear{flex:1.15 1 0;flex-direction:row!important;gap:10px}
#hGear .hLans{display:flex;gap:2px}
#hGear .hl{filter:grayscale(1) brightness(.45);opacity:.7;transition:filter .3s,opacity .3s}
#hGear .hl.on{filter:none;opacity:1}
#hGear .hsh{position:relative;filter:grayscale(1) brightness(.45);opacity:.7;margin-left:8px}
#hGear .hsh.on{filter:none;opacity:1}
#hGear .hsh em{position:absolute;right:-8px;bottom:-2px;font-style:normal;font-family:RRNum,sans-serif;font-size:18px;background:#160c24;border:2px solid #ffd25a;border-radius:99px;padding:0 7px;color:#fff6d0}
/* ---------- intro / outro art (use <svg class="rrSplash" viewBox="0 0 600 520"><use href="#rrSplashDeep"/></svg>) ---------- */
.rrSplash{width:400px;height:347px;display:block;margin:0 auto;overflow:visible}
#introM .rrSplash,#outroM .rrSplash{width:300px;height:260px;margin:0 auto -34px;position:relative;z-index:1;filter:drop-shadow(0 8px 0 rgba(0,0,0,.4))}
/* ---------- sprite state helpers ---------- */
.rrCart{position:absolute;width:400px;height:390px;overflow:visible}
.rrCart.bounce{animation:rrBounce .42s ease-in-out infinite alternate}
@keyframes rrBounce{from{transform:translateY(0) rotate(0)}to{transform:translateY(-3px) rotate(-.4deg)}}
.rrPick{position:absolute;overflow:visible}
.rrPick.bob{animation:rrBob 1.3s ease-in-out infinite alternate}
@keyframes rrBob{from{transform:translateY(0)}to{transform:translateY(-8px)}}
.rrPick.pop{animation:rrCollect .35s ease-in forwards}
@keyframes rrCollect{to{transform:translateY(-60px) scale(1.4);opacity:0}}
.rrDome{animation:rrPulse 1.1s ease-in-out infinite alternate}
@keyframes rrPulse{from{opacity:.7;transform:scale(.99)}to{opacity:1;transform:scale(1.02)}}
@keyframes rrFlick{from{opacity:.55}to{opacity:1}}
/* KAI */
`;
fs.writeFileSync(path.join(D, 'slot.css'), css2);
console.log('built', fs.statSync(path.join(D, 'scene.html')).size / 1024 | 0, 'KB scene.html');
