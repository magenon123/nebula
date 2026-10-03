// node side.cjs -> ../side.html + side.css : CHAIN xN meter, 106x510 at stage (366,190)
const fs = require('fs'), path = require('path'); const { f, OL } = require('./lib.cjs');
let links = '';
for (let i = 0; i < 4; i++) { const y = 152 + i * 56 + 28; for (let k = 0; k < 2; k++) { const yy = y - 8 + k * 11; links += `<ellipse cx="53" cy="${yy}" rx="${k ? 2.2 : 3.6}" ry="${k ? 4.6 : 3}" fill="none" stroke="${OL}" stroke-width="3.6"/><ellipse cx="53" cy="${yy}" rx="${k ? 2.2 : 3.6}" ry="${k ? 4.6 : 3}" fill="none" stroke="url(#chG)" stroke-width="1.8"/>`; } }
const back = `<svg class="chBack" viewBox="0 0 106 510" stroke-linejoin="round" stroke-linecap="round">
<defs>
<linearGradient id="chG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a3d14"/><stop offset=".3" stop-color="#e79a2c"/><stop offset=".6" stop-color="#fff0a0"/><stop offset=".85" stop-color="#f1a72f"/><stop offset="1" stop-color="#ffe9a0"/></linearGradient>
<linearGradient id="chGd" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="106" y2="510"><stop offset="0" stop-color="#7a3d14"/><stop offset=".3" stop-color="#d98a22"/><stop offset=".5" stop-color="#fff0a8"/><stop offset=".72" stop-color="#e79a2c"/><stop offset="1" stop-color="#ffe08a"/></linearGradient>
<linearGradient id="chW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1c72"/><stop offset=".5" stop-color="#1c0e48"/><stop offset="1" stop-color="#0c0624"/></linearGradient>
<linearGradient id="chL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a2060"/><stop offset=".6" stop-color="#1b4ec0"/><stop offset="1" stop-color="#2a82e8"/></linearGradient>
<pattern id="chZ" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M13 2 L17 9 L24 13 L17 17 L13 24 L9 17 L2 13 L9 9Z" fill="none" stroke="#f0b858" stroke-width=".8" opacity=".35"/></pattern>
<radialGradient id="chR" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffb0a8"/><stop offset=".3" stop-color="#e0354f"/><stop offset="1" stop-color="#4a0618"/></radialGradient>
</defs>
<rect x="3" y="14" width="100" height="492" rx="16" fill="#000" opacity=".5" transform="translate(0 6)"/>
<rect x="2" y="8" width="102" height="494" rx="16" fill="${OL}"/>
<rect x="4" y="10" width="98" height="490" rx="14" fill="url(#chG)"/>
<rect x="9" y="15" width="88" height="480" rx="10" fill="url(#chL)"/>
<rect x="9" y="15" width="88" height="480" rx="10" fill="url(#chZ)"/>
<rect x="9" y="15" width="88" height="480" rx="10" fill="none" stroke="${OL}" stroke-width="2"/>
<rect x="14" y="20" width="78" height="470" rx="7" fill="url(#chW)"/>
<rect x="14" y="20" width="78" height="470" rx="7" fill="none" stroke="url(#chG)" stroke-width="1.6"/>
<path d="M16,22 H90" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>
<path d="M10,16 C10,12 14,10 18,10" stroke="#fff6c0" stroke-opacity=".9" stroke-width="1.2" fill="none"/>
${links}
<path d="M22,366 H84" stroke="url(#chG)" stroke-width="1.6" opacity=".8"/>
<path d="M22,128 H84" stroke="url(#chG)" stroke-width="1.6" opacity=".8"/>
${[[10, 14], [96, 14], [10, 496], [96, 496]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.4" fill="${OL}"/><circle cx="${x}" cy="${y}" r="4.2" fill="url(#chG)"/><circle cx="${x}" cy="${y}" r="2.4" fill="url(#chR)"/><circle cx="${x - .8}" cy="${y - 1}" r=".8" fill="#fff"/>`).join('')}
</svg>`;
const steps = [5, 4, 3, 2, 1].map(n => `<i class="st s${n}"><b>×${n}</b></i>`).join('');
const html = `<!-- Chain meter (leo). #chain sits left of the board at stage (366,190) 106x510. Top: CHAIN tag with the big multiplier text (.cv, e.g. x3; in Free Wishes it can read x8, x12 ...). Ladder x1..x5: set ONE class m1..m5 on #chain (steps up to it light up, the current one pulses); add "fs" in Free Wishes (cap note shown), add "pop" for 0.5 s on every increase (remove it after). GEMS: put the gem sum in .gsum (e.g. ×7) and add class "on" to #chain.hasGems to show it. -->
<div id="chain" class="m1">
 ${back}
 <div class="chTag"><b class="chLbl">CHAIN</b><i class="cv">×1</i></div>
 <div class="chSteps">${steps}</div>
 <div class="chGem"><svg viewBox="0 0 128 128"><use href="#s12"/></svg><b class="gsum">×0</b><span>GEMS</span></div>
 <b class="chNote">FREE WISHES<br>NEVER RESETS</b>
</div>
`;
fs.writeFileSync(path.join(__dirname, '../side.html'), html);
const css = `/* ---------- chain meter ---------- */
#chain{left:366px;top:190px;width:106px;height:510px;pointer-events:none}
#chain .chBack{position:absolute;left:0;top:0;width:106px;height:510px;overflow:visible}
#chain .chTag{position:absolute;left:14px;top:20px;width:78px;height:106px;text-align:center}
#chain .chLbl{display:block;margin-top:9px;font:900 15px/1 var(--toon);letter-spacing:3px;color:#ffe08a;text-shadow:0 1px 0 #3a1408,0 0 8px rgba(255,180,60,.6)}
#chain .cv{display:block;font:900 38px/1 var(--toon);font-style:normal;margin-top:10px;color:#fff3c0;text-shadow:0 2px 0 #7a3d14,0 0 14px rgba(255,190,70,.85);letter-spacing:-1px}
#chain.fs .cv{font-size:34px}
#chain.pop .cv{animation:chPop .5s cubic-bezier(.3,1.7,.5,1)}
@keyframes chPop{0%{transform:scale(1.7);filter:brightness(2)}100%{transform:none;filter:none}}
#chain .chSteps{position:absolute;left:0;right:0;top:140px;display:flex;flex-direction:column;align-items:center;gap:8px}
#chain .st{position:relative;display:block;width:38px;height:38px;border-radius:50%;background:radial-gradient(circle at 50% 36%,#3a2a78,#0c0830 72%);box-shadow:inset 0 2px 6px #000,0 0 0 2px #7a3d14,0 0 0 4px #c98a2a,0 1px 0 4px rgba(255,240,170,.5);transition:box-shadow .25s,background .25s}
#chain .st b{position:absolute;left:0;right:0;top:11px;text-align:center;font:900 15px/1 var(--toon);color:#6a5aa8;transition:color .25s,text-shadow .25s}
#chain.m1 .st:is(.s1),#chain.m2 .st:is(.s1,.s2),#chain.m3 .st:is(.s1,.s2,.s3),#chain.m4 .st:is(.s1,.s2,.s3,.s4),#chain.m5 .st{background:radial-gradient(circle at 50% 40%,#ffd27a,#e0701c 60%,#7a2a08);box-shadow:inset 0 2px 5px rgba(255,255,255,.35),0 0 0 2px #7a3d14,0 0 0 4px #ffd668,0 0 14px rgba(255,170,50,.75)}
#chain.m1 .st:is(.s1) b,#chain.m2 .st:is(.s1,.s2) b,#chain.m3 .st:is(.s1,.s2,.s3) b,#chain.m4 .st:is(.s1,.s2,.s3,.s4) b,#chain.m5 .st b{color:#fff8dc;text-shadow:0 1px 0 #6a2a08}
#chain.m1 .st.s1,#chain.m2 .st.s2,#chain.m3 .st.s3,#chain.m4 .st.s4,#chain.m5 .st.s5{animation:chCur 1.1s ease-in-out infinite alternate;box-shadow:inset 0 2px 5px rgba(255,255,255,.45),0 0 0 2px #7a3d14,0 0 0 4px #fff0a8,0 0 20px rgba(255,200,80,.95)}
@keyframes chCur{from{filter:brightness(1)}to{filter:brightness(1.25)}}
#chain .chGem{position:absolute;left:14px;top:372px;width:78px;height:80px;text-align:center;opacity:.35;transition:opacity .3s}
#chain .chGem svg{position:absolute;left:12px;top:-4px;width:54px;height:54px;overflow:visible}
#chain .gsum{position:absolute;left:0;right:0;top:46px;font:900 20px/1 var(--toon);color:#e8d0ff;text-shadow:0 1px 0 #3a0f7a}
#chain .chGem span{position:absolute;left:0;right:0;bottom:2px;font:900 9.5px/1 var(--toon);letter-spacing:2px;color:#b89ae8}
#chain.hasGems .chGem{opacity:1}
#chain.hasGems .chGem svg{animation:chGm 1.6s ease-in-out infinite alternate}
@keyframes chGm{from{transform:scale(1)}to{transform:scale(1.1)}}
#chain .chNote{position:absolute;left:14px;width:78px;top:458px;text-align:center;font:900 8px/1.25 var(--toon);letter-spacing:.3px;color:#ffd27a;opacity:0;transition:opacity .3s}
#chain.fs .chNote{opacity:1}
`;
fs.writeFileSync(path.join(__dirname, 'side.css'), css);
console.log('side.html', html.length);
