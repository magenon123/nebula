// node splash2.cjs -> splash2.css : the bazaar's own splash dressing (lapis+gold medallion, embroidered banner, arabesque rays). slot.css gets it spliced between /* SPLASH2 */ markers (by hand, NOT css.cjs).
const fs = require('fs'), path = require('path');
const f = n => (Math.round(n * 10) / 10).toString();
const enc = s => 'url("data:image/svg+xml,' + encodeURIComponent(s.replace(/\s+/g, ' ').trim()) + '")';
const GOLD = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b8"/><stop offset=".35" stop-color="#f6c24a"/><stop offset=".7" stop-color="#c97a1c"/><stop offset="1" stop-color="#ffe08a"/></linearGradient>`;
// ---- medallion frame (382x382, transparent centre) ----
const ring = sup => {
  const C = 191; let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 382 382"><defs>${GOLD}<radialGradient id="r" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffc0b8"/><stop offset=".4" stop-color="#e0243e"/><stop offset="1" stop-color="#4a0618"/></radialGradient><radialGradient id="t" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#d8fff8"/><stop offset=".4" stop-color="#2ad0c0"/><stop offset="1" stop-color="#065a5e"/></radialGradient></defs>`;
  const N = sup ? 24 : 16;
  // outer petals (pointed lotus arches)
  for (let i = 0; i < N; i++) { const a = i * 2 * Math.PI / N, b = a + Math.PI / N, R0 = 168, R1 = sup ? 191 : 190, w = Math.PI / N * .9; const p = (r, t) => f(C + r * Math.sin(t)) + ',' + f(C - r * Math.cos(t)); s += `<path d="M${p(R0, a - w * .5)} Q${p(R1 - 4, a - w * .45)} ${p(R1, a)} Q${p(R1 - 4, a + w * .45)} ${p(R0, a + w * .5)}Z" fill="url(#g)" stroke="#3a1408" stroke-width="2.2" stroke-linejoin="round"/><path d="M${p(R0 + 4, a)} L${p(R1 - 6, a)}" stroke="#7a3d14" stroke-width="1.6" opacity=".7"/>`; }
  s += `<circle cx="${C}" cy="${C}" r="170" fill="none" stroke="#3a1408" stroke-width="12"/><circle cx="${C}" cy="${C}" r="170" fill="none" stroke="url(#g)" stroke-width="8"/><circle cx="${C}" cy="${C}" r="173.6" fill="none" stroke="#fff6c8" stroke-width="1.2" opacity=".8"/>`;
  s += `<circle cx="${C}" cy="${C}" r="158" fill="none" stroke="#3a1408" stroke-width="6"/><circle cx="${C}" cy="${C}" r="158" fill="none" stroke="url(#g)" stroke-width="3"/>`;
  for (let i = 0; i < 48; i++) { const t = i * Math.PI / 24; s += `<circle cx="${f(C + 164 * Math.sin(t))}" cy="${f(C - 164 * Math.cos(t))}" r="1.5" fill="#3a1408"/>`; }
  // jewels on the rim
  const J = sup ? 12 : 8;
  for (let i = 0; i < J; i++) { const t = i * 2 * Math.PI / J + Math.PI / J * (sup ? 1 : 0) , x = C + 170 * Math.sin(t), y = C - 170 * Math.cos(t), m = i % 2 ? 't' : 'r'; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${sup ? 10 : 11.5}" fill="#3a1408"/><circle cx="${f(x)}" cy="${f(y)}" r="${sup ? 8 : 9.4}" fill="url(#g)"/><circle cx="${f(x)}" cy="${f(y)}" r="${sup ? 5.6 : 6.6}" fill="url(#${m})" stroke="#3a1408" stroke-width="1"/><circle cx="${f(x - 1.8)}" cy="${f(y - 2)}" r="1.8" fill="#fff" opacity=".85"/>`; }
  if (sup) for (let i = 0; i < 24; i++) { const t = i * Math.PI / 12 + Math.PI / 24; s += `<circle cx="${f(C + 181 * Math.sin(t))}" cy="${f(C - 181 * Math.cos(t))}" r="2.6" fill="#fff6c8" stroke="#7a3d14" stroke-width=".8"/>`; }
  return s + '</svg>';
};
// ---- arabesque tile (96x96): eight-pointed star lattice ----
const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><g fill="none" stroke="#ffd27a" stroke-width="1.1" opacity=".26"><path d="M48,6 L57,28 L80,18 L70,40 L90,48 L70,56 L80,78 L57,68 L48,90 L39,68 L16,78 L26,56 L6,48 L26,40 L16,18 L39,28Z"/><circle cx="48" cy="48" r="9"/><path d="M0,0 L12,12 M96,0 L84,12 M0,96 L12,84 M96,96 L84,84"/><circle cx="0" cy="0" r="5"/><circle cx="96" cy="0" r="5"/><circle cx="0" cy="96" r="5"/><circle cx="96" cy="96" r="5"/></g></svg>`;
// ---- big mandala behind the medallion (900x900) ----
const mandala = sup => { const C = 450; let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900"><g fill="none" stroke="${sup ? '#ffe08a' : '#ffc860'}" stroke-width="2">`;
  s += `<circle cx="${C}" cy="${C}" r="440"/><circle cx="${C}" cy="${C}" r="410" stroke-dasharray="3 9"/><circle cx="${C}" cy="${C}" r="300"/>`;
  for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12, b = a + Math.PI / 12, p = (r, t) => f(C + r * Math.sin(t)) + ',' + f(C - r * Math.cos(t)); s += `<path d="M${p(300, a)} Q${p(380, a + Math.PI / 24)} ${p(300, b)}"/><path d="M${p(410, a)} Q${p(350, a + Math.PI / 24)} ${p(410, b)}" opacity=".7"/>`; }
  return s + '</g></svg>'; };
// ---- ribbon embroidery strip (repeat-x, 40x10): gold diamonds and vine ----
const emb = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="10" viewBox="0 0 40 10"><path d="M0,5 Q10,-1 20,5 T40,5" fill="none" stroke="#f6c24a" stroke-width="1.4"/><path d="M20,1.4 L23.6,5 L20,8.6 L16.4,5Z" fill="#ffe08a" stroke="#7a3d14" stroke-width=".6"/><circle cx="0" cy="5" r="1.4" fill="#f6c24a"/><circle cx="40" cy="5" r="1.4" fill="#f6c24a"/><circle cx="10" cy="2.2" r="1" fill="#3ad8c8"/><circle cx="30" cy="7.8" r="1" fill="#3ad8c8"/></svg>`;
const star = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs>${GOLD}</defs><path d="M30,3 L36,22 L56,18 L42,32 L56,46 L36,40 L30,57 L24,40 L4,46 L18,32 L4,18 L24,22Z" fill="url(#g)" stroke="#3a1408" stroke-width="2.4" stroke-linejoin="round"/><circle cx="30" cy="30" r="8" fill="#2058c0" stroke="#3a1408" stroke-width="2"/><circle cx="27.6" cy="27.4" r="2.4" fill="#fff" opacity=".8"/></svg>`;

const css = `/* SPLASH2: the bazaar's own splash dressing (generated by art/splash2.cjs; spliced by hand, not by css.cjs) */
:root{--sEmb:${enc(emb)};--sStar:${enc(star)};--sTile:${enc(tile)};--sMan:${enc(mandala(false))};--sManS:${enc(mandala(true))};--sRing:${enc(ring(false))};--sRingS:${enc(ring(true))}}
.modal.splash{background:var(--sTile) 0 0/96px 96px,radial-gradient(circle at 50% 44%,rgba(74,30,120,.985),rgba(8,3,26,.995))}
.modal.splash::before{content:"";position:absolute;left:50%;top:44%;width:900px;height:900px;margin:-450px 0 0 -450px;background:var(--sMan) center/100% 100% no-repeat;opacity:.5;pointer-events:none;animation:slRot 120s linear infinite}
#introM.sup::before,#outroM.sup::before{background-image:var(--sManS);opacity:.85}
@keyframes slRot{to{transform:rotate(360deg)}}@keyframes slRotR{to{transform:rotate(-360deg)}}
#introM .rays,#outroM .rays{background:repeating-conic-gradient(rgba(255,206,110,.24) 0 5deg,rgba(255,206,110,0) 5deg 10deg,rgba(150,110,255,.16) 10deg 15deg,rgba(150,110,255,0) 15deg 30deg)}
#introM .rays::before,#outroM .rays::before{content:"";position:absolute;inset:0;background:repeating-conic-gradient(rgba(255,236,170,.2) 0 1.4deg,transparent 1.4deg 15deg);animation:slRotR 70s linear infinite}
#introM.sup .rays,#outroM.sup .rays{background:repeating-conic-gradient(rgba(255,214,110,.42) 0 5.5deg,rgba(255,214,110,0) 5.5deg 10deg,rgba(255,170,60,.26) 10deg 15deg,rgba(255,170,60,0) 15deg 30deg)}
#introM.sup .rays::before,#outroM.sup .rays::before{background:repeating-conic-gradient(rgba(255,224,130,.4) 0 1.6deg,transparent 1.6deg 7.5deg)}
/* medallion: lapis disc, gold lotus-petal rim with jewels */
.medal:not(.wide){border:0;box-shadow:0 14px 26px rgba(0,0,0,.55);filter:none;background:radial-gradient(circle at 50% 28%,#4a86f0 0,#1f4fc4 36%,#0e2a86 64%,#08124a 100%);overflow:visible}
.medal:not(.wide)::before{content:"";position:absolute;inset:-34px;background:var(--sRing) center/100% 100% no-repeat;pointer-events:none;z-index:2;filter:drop-shadow(0 6px 5px rgba(0,0,0,.5))}
.medal:not(.wide)::after{content:"";position:absolute;inset:14px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(255,214,110,.9),inset 0 0 0 5px rgba(8,18,74,.9),inset 0 0 0 6.5px rgba(255,214,110,.5),inset 0 0 38px rgba(120,190,255,.35);background:radial-gradient(circle at 50% 18%,rgba(255,255,255,.22),transparent 44%);pointer-events:none}
.sup .medal:not(.wide){background:radial-gradient(circle at 50% 28%,#7a5ae8 0,#4224b4 36%,#220e74 64%,#0c0638 100%)}
.sup .medal:not(.wide)::before{background-image:var(--sRingS);inset:-34px;filter:drop-shadow(0 0 16px rgba(255,200,80,.85)) drop-shadow(0 6px 5px rgba(0,0,0,.5))}
.medal.wide .mnum{font-size:clamp(70px,9vw,104px)}
.medal .mnum{-webkit-text-stroke:0;color:#fff3c0;text-shadow:0 3px 0 #7a3d14,0 0 26px rgba(255,200,90,.75),0 8px 14px rgba(0,0,40,.6);position:relative;z-index:1}
.medal .mlbl{-webkit-text-stroke:0;color:#ffd668;letter-spacing:5px;font-size:36px;text-shadow:0 2px 0 #3a1408,0 0 14px rgba(255,190,70,.6);position:relative;z-index:1}
.medal .mtop{color:#ffe08a;letter-spacing:6px;text-shadow:0 2px 0 #08124a;position:relative;z-index:1}
.medal.wide{border:10px solid transparent;border-radius:84px;filter:none;background:radial-gradient(ellipse at 50% 20%,#4a86f0,#1f4fc4 42%,#0a1c70 100%) padding-box,linear-gradient(135deg,#fff2b8,#f6c24a 30%,#a8581a 55%,#ffe08a 80%,#c97a1c) border-box;box-shadow:inset 0 0 0 3px #3a1408,inset 0 0 0 5px rgba(255,214,110,.85),inset 0 0 40px rgba(120,190,255,.3),0 14px 26px rgba(0,0,0,.55)}
.medal.wide::before{content:"";position:absolute;inset:6px;border-radius:70px;border:1.5px dashed rgba(255,226,140,.65);pointer-events:none}
.medal.wide::after{content:"";position:absolute;inset:0;background:var(--sStar) left 16px center/40px 40px no-repeat,var(--sStar) right 16px center/40px 40px no-repeat;pointer-events:none}
/* banner: plum silk, gold-embroidered borders, folded tails */
.ribbon{filter:none;border:0;border-radius:4px;padding:20px 70px 14px;font-size:clamp(34px,4.6vw,56px);letter-spacing:3px;color:#ffe9a8;text-shadow:0 3px 0 #2a0630,0 0 16px rgba(255,190,70,.55);background:var(--sEmb) 10px 7px/40px 10px repeat-x,var(--sEmb) 10px calc(100% - 7px)/40px 10px repeat-x,linear-gradient(#8a2a86,#5a1a70 55%,#3a0e52);box-shadow:inset 0 0 0 2px #f6c24a,inset 0 0 0 5px #3a0e52,inset 0 0 0 7px rgba(255,214,110,.7),0 10px 18px rgba(0,0,0,.55)}
.ribbon::before,.ribbon::after{border:0;top:18px;background:var(--sEmb) 0 7px/40px 10px repeat-x,var(--sEmb) 0 calc(100% - 7px)/40px 10px repeat-x,linear-gradient(#4a1462,#240838);filter:drop-shadow(0 0 0 #f6c24a)}
#introM .ribbon::before,#introM .ribbon::after,#outroM .ribbon::before,#outroM .ribbon::after{background:var(--sEmb) 0 7px/40px 10px repeat-x,var(--sEmb) 0 calc(100% - 7px)/40px 10px repeat-x,linear-gradient(#4a1462,#240838)}
.sup .ribbon{background:var(--sEmb) 10px 7px/40px 10px repeat-x,var(--sEmb) 10px calc(100% - 7px)/40px 10px repeat-x,linear-gradient(#b0362a,#7a1a4a 55%,#4a0e48);box-shadow:inset 0 0 0 2px #ffe08a,inset 0 0 0 5px #4a0e48,inset 0 0 0 7px rgba(255,236,150,.85),0 0 24px rgba(255,200,80,.6),0 10px 18px rgba(0,0,0,.55)}
/* /SPLASH2 */`;
fs.writeFileSync(path.join(__dirname, 'splash2.css'), css);
console.log('splash2.css', css.length);
