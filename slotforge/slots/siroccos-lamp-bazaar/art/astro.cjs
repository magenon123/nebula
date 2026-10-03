// node astro.cjs -> ../astro.html + astro.css : Astrolabe of Wishes bonus scene (three concentric rings, stop hooks, core jackpot display)
const fs = require('fs'), path = require('path'); const { f, OL, star4 } = require('./lib.cjs');
const C = 350;
const pt = (r, a) => [C + r * Math.sin(a * Math.PI / 180), C - r * Math.cos(a * Math.PI / 180)]; // a = deg clockwise from 12 o'clock
const sector = (r0, r1, a0, a1) => { const p = [pt(r1, a0), pt(r1, a1), pt(r0, a1), pt(r0, a0)]; const big = a1 - a0 > 180 ? 1 : 0; return `M${f(p[0][0])},${f(p[0][1])} A${r1},${r1} 0 ${big} 1 ${f(p[1][0])},${f(p[1][1])} L${f(p[2][0])},${f(p[2][1])} A${r0},${r0} 0 ${big} 0 ${f(p[3][0])},${f(p[3][1])}Z`; };
const GOLD = `<linearGradient id="aG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b2a12"/><stop offset=".2" stop-color="#b8681a"/><stop offset=".42" stop-color="#ffd668"/><stop offset=".6" stop-color="#fff2b0"/><stop offset=".8" stop-color="#e79a2c"/><stop offset="1" stop-color="#ffe9a0"/></linearGradient>
<linearGradient id="aGv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b8"/><stop offset=".3" stop-color="#f6c24a"/><stop offset=".6" stop-color="#c97a1c"/><stop offset="1" stop-color="#6a3410"/></linearGradient>
<radialGradient id="aRuby" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffb0a8"/><stop offset=".3" stop-color="#e0354f"/><stop offset="1" stop-color="#4a0618"/></radialGradient>
<radialGradient id="aTurq" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#c8fff6"/><stop offset=".3" stop-color="#3ad8c8"/><stop offset="1" stop-color="#08585e"/></radialGradient>
<radialGradient id="aEm" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#c8ffd0"/><stop offset=".3" stop-color="#2ac870"/><stop offset="1" stop-color="#064a2a"/></radialGradient>`;
const txt = (x, y, s, size, fill, stroke, rot = 0, cls = '', id = '') => `<text ${id ? `id="${id}" ` : ''}class="${cls}" x="${f(x)}" y="${f(y)}" text-anchor="middle" dominant-baseline="central" font-family="Cinzel,Georgia,serif" font-weight="900" font-size="${size}" fill="${fill}" stroke="${stroke}" stroke-width="${size > 20 ? 3 : 2.4}" paint-order="stroke" stroke-linejoin="round" transform="rotate(${f(rot)} ${f(x)} ${f(y)})">${s}</text>`;
function ringSvg(id, r0, r1, n, vals, cols, size, ids, fmt) {
  let s = ''; const step = 360 / n;
  for (let i = 0; i < n; i++) {
    const a0 = i * step - step / 2, a1 = i * step + step / 2; const c = cols[i % cols.length];
    s += `<g class="sec" data-i="${i}"><path d="${sector(r0, r1, a0, a1)}" fill="url(#${id}${c})" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/><path d="${sector(r0 + 2, r1 - 2, a0 + 1, a1 - 1)}" fill="none" stroke="#ffe9a0" stroke-width=".9" opacity=".55"/>`;
    const m = pt((r0 + r1) / 2, i * step); s += txt(m[0], m[1], fmt(vals[i]), size, '#fff6d8', '#1a0830', i * step, 'v', `${ids}${i}`) + `</g>`;
  }
  // gold studs at the sector boundaries on the outer rim
  for (let i = 0; i < n; i++) { const p = pt(r1 - 5, i * step + step / 2); s += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="3.4" fill="url(#aG)" stroke="${OL}" stroke-width="1"/>`; }
  return s;
}
const secGrads = id => `<linearGradient id="${id}L" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a78e8"/><stop offset=".5" stop-color="#1b4ec0"/><stop offset="1" stop-color="#0a2060"/></linearGradient><linearGradient id="${id}R" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0405a"/><stop offset=".5" stop-color="#a81c3c"/><stop offset="1" stop-color="#4a0a22"/></linearGradient><linearGradient id="${id}T" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ae0d0"/><stop offset=".5" stop-color="#14a0a8"/><stop offset="1" stop-color="#065058"/></linearGradient><linearGradient id="${id}V" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b070f0"/><stop offset=".5" stop-color="#6a30b8"/><stop offset="1" stop-color="#2a0e5a"/></linearGradient><linearGradient id="${id}D" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2060"/><stop offset="1" stop-color="#0c0830"/></linearGradient>`;
const OUT = [1, 2, 3, 5, 8, 10, 15, 20, 40, 5, 3, 2], MID = [1, 2, 3, 1, 5, 2, 3, 1, 10, 25];
// ring 1 (outer, cash)
const r1 = `<svg viewBox="0 0 700 700" overflow="visible"><defs>${secGrads('o')}</defs>
<circle cx="350" cy="350" r="324" fill="${OL}"/><circle cx="350" cy="350" r="321" fill="url(#aG)"/>
${ringSvg('o', 250, 316, 12, OUT, ['L', 'R'], 30, 'ro', v => v + '×')}
<circle cx="350" cy="350" r="250" fill="none" stroke="${OL}" stroke-width="4"/></svg>`;
const r2 = `<svg viewBox="0 0 700 700" overflow="visible"><defs>${secGrads('m')}</defs>
<circle cx="350" cy="350" r="246" fill="${OL}"/><circle cx="350" cy="350" r="243" fill="url(#aG)"/>
${ringSvg('m', 172, 238, 10, MID, ['T', 'V'], 32, 'rm', v => '×' + v)}
<circle cx="350" cy="350" r="172" fill="none" stroke="${OL}" stroke-width="4"/></svg>`;
// core: 8 sectors, mostly empty; prizes: GRAND (0), MAJOR (2), MINOR (4), MINI (6) -> id rcj0..7; data-j tells the tier, kai can change data-j/label
const J = ['GRAND', '', 'MAJOR', '', 'MINOR', '', 'MINI', ''];
let core = ''; { const n = 8, step = 45, rA = 96, rB = 164;
  for (let i = 0; i < n; i++) { const a0 = i * step - step / 2, a1 = i * step + step / 2; const pr = J[i]; const mat = pr === 'GRAND' ? 'aRuby' : pr === 'MAJOR' ? 'aEm' : pr === 'MINOR' ? 'aTurq' : '';
    core += `<g class="sec ${pr ? 'prize' : 'empty'}" data-i="${i}" data-j="${pr}"><path d="${sector(rA, rB, a0, a1)}" fill="url(#cD)" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/><path d="${sector(rA + 2, rB - 2, a0 + 1, a1 - 1)}" fill="none" stroke="#ffe9a0" stroke-width=".9" opacity=".45"/>`;
    const m = pt((rA + rB) / 2, i * step);
    if (pr) core += `<circle cx="${f(m[0])}" cy="${f(m[1] - 9)}" r="13" fill="${OL}"/><circle cx="${f(m[0])}" cy="${f(m[1] - 9)}" r="11" fill="url(#${pr === 'MINI' ? 'aG' : mat})"/><ellipse cx="${f(m[0] - 3.4)}" cy="${f(m[1] - 13)}" rx="3.6" ry="2.4" fill="#fff" opacity=".85" transform="rotate(-24 ${f(m[0] - 3.4)} ${f(m[1] - 13)})"/>` + txt(m[0], m[1] + 14, pr, 10.5, '#fff6d8', '#1a0830', i * step, 'jl');
    else core += star4(m[0], m[1], 7, '#7a6ab8', .55);
    core += `</g>`; } }
const r3 = `<svg viewBox="0 0 700 700" overflow="visible"><defs>${secGrads('c')}</defs>
<circle cx="350" cy="350" r="170" fill="${OL}"/><circle cx="350" cy="350" r="167" fill="url(#aG)"/>
${core}<circle cx="350" cy="350" r="96" fill="none" stroke="${OL}" stroke-width="4"/></svg>`;
// back plate: night-sky mater, degree ring, shackle
let ticks = ''; for (let i = 0; i < 120; i++) { const a = i * 3, L = i % 5 ? 5 : 11; const p0 = pt(341, a), p1 = pt(341 - L, a); ticks += `<path d="M${f(p0[0])},${f(p0[1])} L${f(p1[0])},${f(p1[1])}" stroke="#3a1c06" stroke-width="${i % 5 ? 1 : 1.8}"/>`; }
const back = `<svg class="aBack" viewBox="0 0 700 700" overflow="visible"><defs>${GOLD}<radialGradient id="aSky" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#2a56b0"/><stop offset=".6" stop-color="#10286a"/><stop offset="1" stop-color="#060f34"/></radialGradient></defs>
<g><circle cx="350" cy="350" r="346" fill="#000" opacity=".4" transform="translate(6 14)"/>
<circle cx="350" cy="350" r="346" fill="${OL}"/><circle cx="350" cy="350" r="342" fill="url(#aG)"/><circle cx="350" cy="350" r="330" fill="url(#aSky)"/>${ticks}
<path d="M350,6 C316,6 314,-20 350,-20 C386,-20 384,6 350,6Z" fill="none" stroke="${OL}" stroke-width="13" transform="translate(0 6)"/><path d="M350,12 C320,12 318,-12 350,-12 C382,-12 380,12 350,12Z" fill="none" stroke="url(#aG)" stroke-width="8"/>
<path d="M318,22 h64 l-8,16 h-48z" fill="url(#aG)" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="350" cy="30" r="7" fill="url(#aRuby)" stroke="${OL}" stroke-width="1.4"/>
${Array.from({ length: 90 }, (_, i) => { const a = (i * 137.5) % 360, r = 60 + ((i * 53) % 270); const p = pt(r, a); return `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${(.6 + (i % 3) * .5).toFixed(1)}" fill="#fff" opacity=".6"/>`; }).join('')}</g></svg>`;
// front: light overlay, hub with live text, pointer (fixed marker), bezel gem studs
let spokes = ''; for (let i = 0; i < 8; i++) { const a = i * 45, p0 = pt(40, a), p1 = pt(84, a); spokes += `<path d="M${f(p0[0])},${f(p0[1])} L${f(p1[0])},${f(p1[1])}" stroke="${OL}" stroke-width="5" stroke-linecap="round"/><path d="M${f(p0[0])},${f(p0[1])} L${f(p1[0])},${f(p1[1])}" stroke="url(#aG)" stroke-width="2.6" stroke-linecap="round"/>`; }
const front = `<svg class="aFront" viewBox="0 0 700 700" overflow="visible"><defs>${GOLD}<linearGradient id="aShade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="700" y2="0"><stop offset="0" stop-color="#0a0418" stop-opacity=".5"/><stop offset=".5" stop-color="#0a0418" stop-opacity="0"/><stop offset="1" stop-color="#ffd890" stop-opacity=".2"/></linearGradient>
<radialGradient id="aHub" cx=".4" cy=".32" r=".85"><stop offset="0" stop-color="#2a56b0"/><stop offset=".6" stop-color="#10286a"/><stop offset="1" stop-color="#060f34"/></radialGradient>
<mask id="aM"><rect width="700" height="700" fill="#fff"/><circle cx="350" cy="350" r="90" fill="#000"/></mask></defs>
<circle cx="350" cy="350" r="322" fill="url(#aShade)" mask="url(#aM)"/>
<path d="M60,200 A300,300 0 0 1 200,60" fill="none" stroke="#fff" stroke-width="5" opacity=".28" stroke-linecap="round"/><path d="M640,500 A300,300 0 0 1 500,640" fill="none" stroke="#fff" stroke-width="3" opacity=".18" stroke-linecap="round"/>
<!-- hub -->
<g class="aHub"><circle cx="350" cy="350" r="94" fill="${OL}"/><circle cx="350" cy="350" r="91" fill="url(#aG)"/><circle cx="350" cy="350" r="82" fill="${OL}"/><circle cx="350" cy="350" r="79" fill="url(#aHub)"/>
${spokes}<circle cx="350" cy="350" r="38" fill="${OL}"/><circle cx="350" cy="350" r="35" fill="url(#aHub)"/><circle cx="350" cy="350" r="35" fill="none" stroke="url(#aG)" stroke-width="2"/>
<g class="aHubT">${txt(350, 346, 'WISH', 21, '#fff3c0', '#3a1060', 0, 'hubt', 'aHubT')}${txt(350, 366, '', 13, '#ffd27a', '#1a0830', 0, 'hubs', 'aHubS')}</g>
<ellipse cx="332" cy="326" rx="18" ry="9" fill="#fff" opacity=".22" transform="rotate(-30 332 326)"/></g>
<!-- fixed pointer at 12 o'clock -->
<g class="aPtr"><path d="M350,32 L336,-6 L350,-18 L364,-6Z" fill="${OL}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/><path d="M350,28 L339,-4 L350,-14 L361,-4Z" fill="url(#aG)"/><path d="M350,28 L350,-14" stroke="#fff6c0" stroke-width="1.4" opacity=".7"/><circle cx="350" cy="-1" r="6.6" fill="url(#aRuby)" stroke="${OL}" stroke-width="1.4"/><ellipse cx="348" cy="-3.6" rx="2.2" ry="1.5" fill="#fff" opacity=".85"/></g>
<path class="aPtrL" d="M350,38 L350,330" stroke="#fff4c0" stroke-width="1.6" opacity="0"/>
</svg>`;
const pedestal = `<svg class="aStand" viewBox="0 0 900 150" overflow="visible"><defs>${GOLD}</defs><ellipse cx="450" cy="120" rx="330" ry="22" fill="#000" opacity=".5"/>
<path d="M300,140 L330,44 H570 L600,140Z" fill="${OL}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/><path d="M304,136 L333,48 H567 L596,136Z" fill="url(#aG)"/><path d="M304,136 L333,48 H567 L596,136Z" fill="url(#aGv)" opacity=".35"/>
<path d="M340,60 H560" stroke="#fff6c0" stroke-width="2" opacity=".8"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="${350 + i * 50}" cy="96" r="9" fill="${OL}"/><circle cx="${350 + i * 50}" cy="96" r="7" fill="url(#${['aTurq', 'aRuby', 'aEm', 'aRuby', 'aTurq'][i]})"/>`).join('')}
<path d="M270,140 H630" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><path d="M270,140 H630" stroke="url(#aG)" stroke-width="6" stroke-linecap="round"/></svg>`;
const jackpots = [['grand', 'GRAND', '2,500×', 'aRuby'], ['major', 'MAJOR', '500×', 'aEm'], ['minor', 'MINOR', '100×', 'aTurq'], ['mini', 'MINI', '25×', 'aG']].map(([k, n, v, m]) => `<div class="j ${k}"><svg viewBox="0 0 40 40"><defs>${GOLD}</defs><circle cx="20" cy="20" r="15" fill="${OL}"/><circle cx="20" cy="20" r="13" fill="url(#${m})"/><ellipse cx="15.5" cy="14.5" rx="4.4" ry="2.8" fill="#fff" opacity=".85" transform="rotate(-24 15.5 14.5)"/></svg><i>${n}</i><b>${v}</b></div>`).join('');
const html = `<!-- Astrolabe of Wishes bonus scene (leo). Full-stage overlay #astro (1600x900), hidden until class "on". The instrument is 700x700 at stage (450,100) (.aWrap). Layers: .aBack, three ROTATING rings (.ring.r1 outer cash x12, .r2 middle multiplier x10, .r3 core x8), .aFront (hub, fixed pointer at 12 o'clock). Labels are live text: #ro0..#ro11 (outer), #rm0..#rm9 (middle), core prize sectors carry data-j; hub text #aHubT / #aHubS. Rotation: set style --a (degrees) on the ring and class "go"; see ART-NOTES. -->
<div id="astro">
 <div class="aVig"></div>
 <div class="aTitle"><svg viewBox="0 0 560 70" overflow="visible"><defs><linearGradient id="atF" x1="0" y1="8" x2="0" y2="50" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffbe6"/><stop offset=".35" stop-color="#ffe08a"/><stop offset=".7" stop-color="#f0a22c"/><stop offset="1" stop-color="#a8581a"/></linearGradient></defs>
  <text x="280" y="44" text-anchor="middle" font-family="'Cinzel Decorative',Cinzel,serif" font-weight="900" font-size="36" letter-spacing="2" fill="#1a0828" opacity=".6" transform="translate(2 4)">ASTROLABE OF WISHES</text>
  <text x="280" y="44" text-anchor="middle" font-family="'Cinzel Decorative',Cinzel,serif" font-weight="900" font-size="36" letter-spacing="2" fill="url(#atF)" stroke="#3a1060" stroke-width="5" paint-order="stroke" stroke-linejoin="round">ASTROLABE OF WISHES</text></svg></div>
 <div class="aWrap" id="aWrap">
  ${back}
  <div class="ring r1" data-n="12">${r1}</div>
  <div class="ring r2" data-n="10">${r2}</div>
  <div class="ring r3" data-n="8">${r3}</div>
  ${front}
  <i class="aHold"></i>
 </div>
 ${pedestal}
 <div class="aJ" id="aJ"><b class="aJT">WISH PRIZES</b>${jackpots}</div>
 <div class="aTally" id="aTally"><div class="t1"><span>CASH</span><b id="aCash">0×</b></div><div class="tx">×</div><div class="t2"><span>MULTIPLIER</span><b id="aMult">×1</b></div><div class="t3"><span>WISH</span><b id="aWish">-</b></div><div class="tt"><span>SPIN PRIZE</span><b id="aTotal">0</b></div></div>
</div>
`;
fs.writeFileSync(path.join(__dirname, '../astro.html'), html);
const css = `/* ---------- Astrolabe of Wishes (bonus scene). Add class "on" to #astro to show it. Rings: style --a (deg) + class go = turn to that angle with a long ease-out (duration --t); class idle on #astro = slow drift ---------- */
#astro{left:0;top:0;width:1600px;height:900px;overflow:hidden;opacity:0;visibility:hidden;transition:opacity .8s,visibility 0s .8s;pointer-events:none;z-index:8}
#astro.on{opacity:1;visibility:visible;transition:opacity .8s,visibility 0s}
#astro .aVig{position:absolute;inset:0;background:radial-gradient(ellipse 60% 62% at 50% 48%,rgba(8,4,28,.1),rgba(8,4,28,.82) 85%)}
#astro .aTitle{position:absolute;left:520px;top:18px;width:560px;height:70px}
#astro .aTitle svg{width:560px;height:70px;overflow:visible}
#astro .aWrap{position:absolute;left:450px;top:96px;width:700px;height:700px;transform-origin:50% 50%;--as:1;transform:scale(var(--as))}
#astro .aWrap svg{position:absolute;left:0;top:0;width:700px;height:700px;overflow:visible;display:block}
#astro .ring{position:absolute;left:0;top:0;width:700px;height:700px;--a:0;--t:3s;transform:rotate(calc(var(--a)*1deg));will-change:transform}
#astro .ring.go{transition:transform var(--t) cubic-bezier(.08,.72,.14,1)}
#astro.idle .ring{animation:aDrift 70s linear infinite}
#astro.idle .r2{animation-duration:90s;animation-direction:reverse}#astro.idle .r3{animation-duration:55s}
@keyframes aDrift{from{rotate:0deg}to{rotate:360deg}}
#astro .aStand{position:absolute;left:350px;top:760px;width:900px;height:150px;overflow:visible}
#astro .aFront,#astro .aBack{pointer-events:none}
/* pointer pulse + sector landing flash */
#astro .aPtr{transform-box:fill-box;transform-origin:50% 100%}
#astro .aPtr.pulse{animation:aPp .5s cubic-bezier(.3,1.7,.5,1)}
@keyframes aPp{0%{transform:scale(1.5)}100%{transform:none}}
#astro .ring.landed .sec.hit path:first-child,#astro .ring .sec.hit path:first-child{filter:brightness(1.7)}
#astro .ring .sec.hit text{fill:#fff;animation:aTx .6s ease-out}
@keyframes aTx{0%{transform:scale(1.4)}}
#astro .ring.magnet svg{filter:drop-shadow(0 0 12px rgba(255,200,80,.95));animation:aMag 1s ease-in-out infinite alternate}
@keyframes aMag{from{opacity:.86}to{opacity:1}}
/* held breath before the core stops */
#astro .aHold{position:absolute;left:350px;top:350px;width:380px;height:380px;margin:-190px 0 0 -190px;border-radius:50%;box-shadow:0 0 0 0 rgba(255,220,120,0);opacity:0;pointer-events:none}
#astro.tense .aHold{opacity:1;animation:aTn .5s ease-in-out infinite alternate}
@keyframes aTn{from{box-shadow:0 0 14px 2px rgba(255,220,120,.35),inset 0 0 18px rgba(255,200,80,.2)}to{box-shadow:0 0 42px 10px rgba(255,220,120,.85),inset 0 0 40px rgba(255,200,80,.55)}}
#astro .aHub .hubt{font-size:21px}
/* prize rack and tally */
#astro .aJ{position:absolute;left:1190px;top:190px;width:300px;padding:44px 18px 16px;border-radius:18px;background:linear-gradient(180deg,rgba(40,18,90,.88),rgba(14,6,40,.9));box-shadow:0 0 0 3px #c98a2a,0 0 0 5px #3a1c06,0 8px 24px rgba(0,0,0,.6),inset 0 0 22px rgba(255,190,70,.2)}
#astro .aJT{position:absolute;left:0;right:0;top:12px;text-align:center;font:900 15px/1 var(--toon);letter-spacing:4px;color:#ffe08a;text-shadow:0 1px 0 #3a1408}
#astro .j{position:relative;display:flex;align-items:center;gap:10px;height:62px;margin-bottom:8px;padding:0 14px 0 8px;border-radius:12px;background:linear-gradient(180deg,#1c1050,#0c0630);box-shadow:inset 0 0 10px #000,0 0 0 1.5px #7a3d14;transition:box-shadow .3s,filter .3s;filter:saturate(.7) brightness(.85)}
#astro .j svg{width:44px;height:44px;flex:none}
#astro .j i{font:900 15px/1 var(--toon);font-style:normal;letter-spacing:2px;color:#e8d8ff;flex:1}
#astro .j b{font:900 20px/1 var(--toon);color:#ffe9a0;text-shadow:0 1px 0 #3a1408}
#astro .j.grand i{color:#ffb0a8}#astro .j.major i{color:#b8ffc8}#astro .j.minor i{color:#b0fff4}
#astro .j.lit{filter:none;box-shadow:inset 0 0 12px rgba(255,200,80,.5),0 0 0 2px #fff0a8,0 0 24px rgba(255,200,80,.95);animation:aJl .5s ease-in-out infinite alternate}
@keyframes aJl{from{transform:scale(1)}to{transform:scale(1.04)}}
#astro .aTally{position:absolute;left:110px;top:240px;width:290px;padding:18px 16px;border-radius:18px;background:linear-gradient(180deg,rgba(40,18,90,.88),rgba(14,6,40,.9));box-shadow:0 0 0 3px #c98a2a,0 0 0 5px #3a1c06,0 8px 24px rgba(0,0,0,.6);display:grid;grid-template-columns:1fr 24px 1fr;gap:4px 0;align-items:center;text-align:center}
#astro .aTally span{display:block;font:900 11px/1 var(--toon);letter-spacing:2px;color:#b89ae8;margin-bottom:5px}
#astro .aTally b{display:block;font:900 26px/1 var(--toon);color:#fff3c0;text-shadow:0 1px 0 #7a3d14,0 0 10px rgba(255,190,70,.6)}
#astro .aTally .tx{font:900 22px/1 var(--toon);color:#ffd27a}
#astro .aTally .t3{grid-column:1/4;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,210,120,.3)}
#astro .aTally .tt{grid-column:1/4;margin-top:8px;padding-top:10px;border-top:1px solid rgba(255,210,120,.3)}
#astro .aTally .tt b{font-size:40px;color:#ffe08a}
#astro .aTally.pop b{animation:aPop .5s cubic-bezier(.3,1.7,.5,1)}
@keyframes aPop{0%{transform:scale(1.4);filter:brightness(1.8)}100%{transform:none}}
`;
fs.writeFileSync(path.join(__dirname, 'astro.css'), css);
console.log('astro.html', (html.length / 1024) | 0, 'KB');
