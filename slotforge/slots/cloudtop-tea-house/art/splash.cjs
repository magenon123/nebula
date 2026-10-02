/* Koji portrait for the bonus intro/outro splashes (shell hook splashArt). Two <symbol>s appended to symbols.svg by build.cjs:
   kojiSplash (cheerful) and kojiSplashSuper (excited, gold glow, headband, gold hat, fists up). viewBox 30 -50 420 390. Always animated (not gated). */
const C=require('./char.cjs'); const {mk,INK}=require('./lib.cjs');
module.exports=()=>{
 const s=mk(91); const {sh,FUR,FURD}=C;
 const rename=h=>h.replace(/ id="c([A-Z])/g,' id="sp$1');
 const mood=(h,sup)=>{ h=rename(h).replace(/<g id="spLids">.*?<\/g>/s,'').replace(/id="spMouthOpen" opacity="0"/,'id="spMouthOpen" opacity="1"');
   if(sup) h=h.replace(/id="spBand" opacity="0"/,'id="spBand" opacity="1"').replace('M190 128 Q204 120 218 128 M270 128 Q284 120 298 128','M190 122 Q204 108 220 122 M268 122 Q284 108 298 122');
   return h; };
 const sparkle=(x,y,r,c='#fff6c8')=>`<path class="ksp" d="M${x} ${y-r} L${x+r*.28} ${y-r*.28} L${x+r} ${y} L${x+r*.28} ${y+r*.28} L${x} ${y+r} L${x-r*.28} ${y+r*.28} L${x-r} ${y} L${x-r*.28} ${y-r*.28}Z" fill="${c}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
 const armUp=(x1,y1,x2,y2)=>s.ln(`M${x1} ${y1} L${x2} ${y2}`,FUR,34,{ow:5});
 const fist=(x,y)=>sh(`M${x-19} ${y} Q${x-19} ${y-19} ${x} ${y-19} Q${x+19} ${y-19} ${x+19} ${y} Q${x+19} ${y+19} ${x} ${y+19} Q${x-19} ${y+19} ${x-19} ${y}Z`,FURD,{hi:'#9a7458',sw:4.4,lit:[4,4]})+s.ink(`M${x-8} ${y-6} V${y+6} M${x} ${y-8} V${y+8} M${x+8} ${y-6} V${y+6}`,2,'#3a2a28');
 const torso=C.body.replace(/<clipPath id="tailC">.*?<\/clipPath>/s,'');
 const css=`.kbob{animation:kBob 2.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}@keyframes kBob{from{transform:translateY(0) scale(1,1)}to{transform:translateY(-6px) scale(1.012,.99)}}
 .kear{animation:kEar 3.2s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 90%}.kear.r{animation-delay:-1.4s}@keyframes kEar{0%,70%,100%{transform:none}78%{transform:rotate(-9deg)}86%{transform:rotate(6deg)}94%{transform:rotate(-3deg)}}
 .kwave{animation:kWave .55s ease-in-out infinite alternate;transform-box:view-box;transform-origin:312px 270px}@keyframes kWave{from{transform:rotate(-7deg)}to{transform:rotate(9deg)}}
 .kfist{animation:kPump .42s ease-in-out infinite alternate}.kfist.r{animation-delay:-.21s}@keyframes kPump{from{transform:translateY(8px)}to{transform:translateY(-12px)}}
 .ksp{animation:kTw 1.1s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 50%}.ksp:nth-of-type(2n){animation-delay:-.5s}.ksp:nth-of-type(3n){animation-delay:-.8s}@keyframes kTw{from{transform:scale(.55) rotate(0);opacity:.6}to{transform:scale(1.15) rotate(25deg);opacity:1}}
 .krays{animation:kSpin 14s linear infinite;transform-box:view-box;transform-origin:244px 130px}@keyframes kSpin{to{transform:rotate(360deg)}}
 .ksteam{animation:kSteam 2.2s ease-out infinite}@keyframes kSteam{0%{opacity:0;transform:translateY(8px)}30%{opacity:1}100%{opacity:0;transform:translateY(-18px)}}`;
 // --- cheerful ---
 const cup=`<g class="ksteam"><path d="M128 258 Q118 242 130 228 Q142 214 130 198" fill="none" stroke="#fffaf0" stroke-width="8" stroke-linecap="round" opacity=".9"/></g>`
  +sh('M110 268 H160 L155 312 Q135 322 115 312Z','#fbf1dc',{hi:'#fff',sh:'#cdbf9f',sw:4,lit:[4,4]})+sh('M111 280 H159 L158 292 H112Z','#3a4a8c',{sw:2.6,sh:'#27346a'})+s.ell(135,268,25,6,'#bfd98a',{sw:3.4,sh:'#79a85a'});
 const normal=`<symbol id="kojiSplash" viewBox="30 -50 420 390"><style>${css}</style><g filter="url(#roughU)"><g class="kbob">`
  +torso+`<g class="kwave">`+s.ln('M312 270 Q350 262 372 224','#a07c58',34,{ow:5})+C.paw(376,214,19)+`</g>`
  +s.ln('M168 270 Q132 292 130 316','#a07c58',34,{ow:5})+cup+C.paw(134,312,18)
  +`<g>`+mood(C.head,false)+mood(C.hatSvg,false)+`</g>`
  +mood(C.ears,false).replace(/<g id="spEarL">/,'<g id="spEarL" class="kear">').replace(/<g id="spEarR">/,'<g id="spEarR" class="kear r">')+mood(C.strings,false)
  +sparkle(98,60,16)+sparkle(402,100,12)+sparkle(88,170,10)
  +`</g></g></symbol>`;
 // --- super ---
 const glow=`<defs><radialGradient id="kgl"><stop offset="0" stop-color="#fff6c8" stop-opacity=".95"/><stop offset=".45" stop-color="#ffc83a" stop-opacity=".55"/><stop offset="1" stop-color="#ff9a1a" stop-opacity="0"/></radialGradient></defs>`;
 const rays=[...Array(12)].map((_,i)=>{const a=i*Math.PI/6;return `<path d="M244 130 L${(244+Math.cos(a-.09)*260).toFixed(0)} ${(130+Math.sin(a-.09)*260).toFixed(0)} L${(244+Math.cos(a+.09)*260).toFixed(0)} ${(130+Math.sin(a+.09)*260).toFixed(0)}Z" fill="#ffd45a" opacity=".38"/>`;}).join('');
 const sup=`<symbol id="kojiSplashSuper" viewBox="30 -50 420 390"><style>${css}</style>${glow}<g filter="url(#roughU)"><circle cx="244" cy="130" r="230" fill="url(#kgl)"/><g class="krays">${rays}</g><g class="kbob">`
  +`<g class="kfist">`+armUp(168,272,74,84)+fist(70,66)+`</g><g class="kfist r">`+armUp(312,272,414,84)+fist(418,66)+`</g>`
  +torso
  +mood(C.head,true)+mood(C.goldHat.replace('opacity="0"','opacity="1"'),true)
  +mood(C.ears,true).replace(/<g id="spEarL">/,'<g id="spEarL" class="kear">').replace(/<g id="spEarR">/,'<g id="spEarR" class="kear r">')+mood(C.strings,true)
  // star-eyes: big sparkly highlights on both pupils
  +sparkle(210,156,7,'#fff')+sparkle(288,156,7,'#fff')
  +sparkle(48,-10,18)+sparkle(440,-6,16)+sparkle(40,170,14)+sparkle(448,180,12)+sparkle(244,-30,14)
  +`</g></g></symbol>`;
 return normal+sup;
};
