const fs=require('fs');const {mk,mix,INK}=require('./lib.cjs');
const s=mk(90);
const FUR='#a07c58',FURD='#6a4a34',PATCH='#3a2a28',CREAM='#f2e2c0';
const sh=(d,f,o={})=>s.shape(d,f,Object.assign({lit:[7,8],sw:5},o));
const tailD='M326 368 Q404 380 434 306 Q464 232 420 176 Q392 140 352 156 Q330 170 348 192 Q374 196 382 228 Q390 276 342 304 Q320 316 300 336Z';
let tail=`<clipPath id="tailC"><path d="${tailD}"/></clipPath>`+sh(tailD,FUR,{hi:'#d2b088'})
 +`<g clip-path="url(#tailC)" stroke="${PATCH}" stroke-width="15" fill="none" stroke-linecap="butt"><path d="M396 320 L388 384"/><path d="M402 296 L462 326"/><path d="M412 252 L476 248"/><path d="M396 214 L446 176"/><path d="M360 188 L344 138" stroke-width="22"/></g>`
 +s.ink(tailD,5);
// body
const bodyD='M122 410 Q104 300 148 252 Q240 214 332 252 Q376 300 358 410Z';
let body=sh(bodyD,FUR,{hi:'#d2b088'})
 +sh('M168 400 Q150 330 188 292 Q240 276 292 292 Q330 330 312 400Z',CREAM,{sh:'#d6bf94',sw:0,hi:'#ffffff'}).replace(/stroke-width="0"/g,'')
 // apron (dark blue) with crest
 +sh('M176 276 Q240 292 304 276 L322 410 H158Z','#2f3f86',{sh:'#1f2c66',hi:'#6a7ac8',sw:5})
 +s.ink('M164 392 H318',3,'#fbf1dc')+s.ink('M162 402 H320',2,'#7a8ad0')
 +s.circ(240,340,22,'#fbf1dc',{sw:3.6,sh:'#e0d0aa',lit:[3,3]})
 +s.fill('M238 358 Q220 348 226 330 Q238 334 238 358Z','#4f7d3a')+s.fill('M242 358 Q260 348 254 330 Q242 334 242 358Z','#79a85a')+s.ink('M240 360 V334',2.4)
 // neck strap
 +s.ink('M178 272 Q240 300 302 272',5,'#1c2340')+s.ink('M178 272 Q240 300 302 272',2.6,'#5a6ec0');
// hat (straw kasa) pushed back, behind the head
const hatD='M130 138 Q160 36 244 22 Q328 36 358 138 Q244 112 130 138Z';
function hat(c1,c2,hi,id){const line=c2==='#b88a2a'?'#8a5a14':'#8a6a24';return `<g id="${id}">`
 +sh('M96 134 Q244 98 392 134 Q380 160 244 168 Q108 160 96 134Z',c2,{sh:mix(c2,'#2a1f4a',.3),sw:5,lit:[2,3]})
 +sh(hatD,c1,{hi:hi,sh:c2,lit:[7,7]})
 +s.ink('M150 112 Q244 84 338 112 M170 88 Q244 62 318 88 M196 60 Q244 44 292 60',2.6,line)
 +s.ink('M244 26 V108 M200 36 L170 118 M288 36 L318 118 M222 30 L200 112 M266 30 L288 112',2.2,line)
 +s.ink('M104 140 Q244 112 384 140',2.4,line)
 +`</g>`;}
let hatSvg=`<g id="cHat" transform="rotate(-9 244 150)">`+hat('#e8c46a','#b88a2a','#fff0a0','hatStraw')+`</g>`;
let goldHat=`<g id="cGoldHat" opacity="0" transform="rotate(-9 244 150)">`+hat('#ffd23a','#b8860b','#fffbd0','hatGold')+s.circ(244,56,8,'#d9432e',{sw:3,sh:'#8a2218'})+`</g>`;
// hat strings (flutter)
const strings=`<g id="cHatStr">`+s.ln('M160 140 Q148 190 190 252','#8a2218',3.2,{ow:2.6})+s.ln('M326 140 Q338 190 292 252','#8a2218',3.2,{ow:2.6})+`</g>`;
// head
const headD='M146 176 Q144 100 244 98 Q344 100 342 176 Q346 250 244 254 Q142 250 146 176Z';
let ears=`<g id="cEarL">`+sh('M162 132 Q150 78 192 70 Q222 78 216 116Z',FURD,{hi:'#9a7458'})+s.fill('M172 118 Q168 88 192 84 Q206 92 202 112Z','#d79a8a')+`</g>`
 +`<g id="cEarR">`+sh('M326 132 Q338 78 296 70 Q266 78 272 116Z',FURD,{hi:'#9a7458'})+s.fill('M316 118 Q320 88 296 84 Q282 92 286 112Z','#d79a8a')+`</g>`;
// cheek fur tufts
const tufts=s.fill('M146 176 L128 190 L148 196 L132 214 L156 214Z','#a07c58')+s.fill('M342 176 L360 190 L340 196 L356 214 L332 214Z','#a07c58')
 +s.ink('M146 176 L128 190 L148 196 L132 214 L156 214 M342 176 L360 190 L340 196 L356 214 L332 214',4);
let head=sh(headD,FUR,{hi:'#d2b088'})+tufts
 // eye patches
 +sh('M168 150 Q176 128 206 136 Q230 148 226 178 Q214 196 190 190 Q166 178 168 150Z',PATCH,{sw:0,sh:'#2a1e20',lit:[3,3]}).replace(/stroke-width="0"/g,'')
 +sh('M320 150 Q312 128 282 136 Q258 148 262 178 Q274 196 298 190 Q322 178 320 150Z',PATCH,{sw:0,sh:'#2a1e20',lit:[3,3]}).replace(/stroke-width="0"/g,'')
 // muzzle
 +sh('M196 192 Q244 170 292 192 Q304 232 244 244 Q184 232 196 192Z',CREAM,{sh:'#d6bf94',hi:'#ffffff',sw:4,lit:[4,4]})
 // eyes
 +`<g id="cEyes">`+s.ell(204,158,12,14,'#fffaf0',{sw:3,sh:false})+s.ell(284,158,12,14,'#fffaf0',{sw:3,sh:false})
 +`<g id="cPupils"><circle cx="206" cy="162" r="7" fill="#1c2340"/><circle cx="282" cy="162" r="7" fill="#1c2340"/><circle cx="208.5" cy="159" r="2.4" fill="#fff"/><circle cx="284.5" cy="159" r="2.4" fill="#fff"/></g>`
 +`<g id="cLids"><path d="M190 158 a14 15 0 0 1 28 0 Z" fill="${FURD}" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round" transform="translate(0 -1)"/><path d="M270 158 a14 15 0 0 1 28 0 Z" fill="${FURD}" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round" transform="translate(0 -1)"/></g></g>`
 +`<g id="cBrows">`+s.ink('M190 128 Q204 120 218 128 M270 128 Q284 120 298 128',4,'#f2e2c0')+`</g>`
 // nose + mouth
 +s.shape('M232 196 Q244 190 256 196 Q256 208 244 210 Q232 208 232 196Z','#2a1e20',{sw:3.4,sh:false})+s.fill('M238 197 Q242 195 246 197','#6a5a66')
 +`<g id="cMouth">`+s.ink('M244 210 V218 M244 218 Q232 228 222 220 M244 218 Q256 228 266 220',3.2)
 +`<g id="cMouthOpen" opacity="0">`+s.shape('M222 218 Q244 214 266 218 Q264 244 244 246 Q224 244 222 218Z','#4a1c28',{sw:3.4,sh:false})+s.fill('M232 238 Q244 228 256 238 Q244 246 232 238Z','#f08a9a')+`</g></g>`
 // cheeks (blush, puffed in tease)
 +`<g id="cCheeks">`+s.ell(176,208,15,9,'#f59db8',{sw:0,sh:false}).replace('fill="#f59db8"','fill="#f59db8" opacity=".75"')+s.ell(312,208,15,9,'#f59db8',{sw:0,sh:false}).replace('fill="#f59db8"','fill="#f59db8" opacity=".75"')+`</g>`
 // whiskers
 +s.ink('M196 214 L160 208 M198 222 L164 228 M292 214 L328 208 M290 222 L324 228',2.2,'#6a4a34')
 // headband (bonus)
 +`<g id="cBand" opacity="0">`+s.shape('M150 130 Q244 108 338 130 L338 148 Q244 126 150 148Z','#fbf1dc',{sw:4,sh:'#d9c9a0',hi:'#ffffff'})+s.circ(244,128,13,'#d9432e',{sw:3.2,sh:'#8a2218'})
 +s.ln('M338 138 Q372 140 380 170','#fbf1dc',9,{ow:3.6})+s.ln('M336 142 Q366 158 366 188','#fbf1dc',8,{ow:3.6})+`</g>`;
// ladle (right hand, viewer right) and cup (left hand)
const ladle=`<g id="cLadle">`+s.ln('M356 332 L402 224','#c18a55',9,{ow:3.6})+sh('M388 208 Q418 190 430 214 Q432 240 408 246 Q384 238 388 208Z','#c18a55',{hi:'#e8b982',sh:'#7a4a2e',sw:4.4})+s.ell(410,222,12,10,'#3f6b34',{sw:2.6,sh:false}).replace('fill="#3f6b34"','fill="#8fc060"')+`</g>`;
const paw=(x,y,r=17)=>sh(`M${x-r} ${y} Q${x-r} ${y-r} ${x} ${y-r} Q${x+r} ${y-r} ${x+r} ${y} Q${x+r} ${y+r} ${x} ${y+r} Q${x-r} ${y+r} ${x-r} ${y}Z`,FURD,{hi:'#9a7458',sw:4.4,lit:[4,4]})+s.ink(`M${x-5} ${y+r-2} V${y+r-8} M${x+3} ${y+r-1} V${y+r-8}`,2,'#3a2a28');
const armR=`<g id="cArmR">`+ladle+s.ln('M312 270 Q356 292 352 336','#a07c58',34,{ow:5})+s.ink('M326 276 Q350 292 348 318',3,'#d2b088',' opacity=".6"')+paw(354,340)+`</g>`;
const cup=`<g id="cCup">`+sh('M120 322 H160 L156 358 Q140 366 124 358Z','#fbf1dc',{hi:'#ffffff',sh:'#cdbf9f',sw:4,lit:[4,4]})+sh('M121 332 H159 L158 342 H122Z','#3a4a8c',{sw:2.6,sh:'#27346a'})+s.ell(140,322,20,5,'#bfd98a',{sw:3.4,sh:'#79a85a'})+`</g>`;
const steam=`<g id="cSteam"><path d="M132 312 Q122 296 134 282 Q146 268 134 252" fill="none" stroke="#fffaf0" stroke-width="8" stroke-linecap="round" opacity=".92"/><path d="M148 310 Q158 294 148 280" fill="none" stroke="#fffaf0" stroke-width="6" stroke-linecap="round" opacity=".7"/></g>`;
const stream=`<g id="cStream" opacity="0"><path d="M106 242 Q100 310 104 388" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M106 242 Q100 310 104 388" fill="none" stroke="#9bc46a" stroke-width="4.4" stroke-linecap="round"/></g>`;
const armL=`<g id="cArmL">`+s.ln('M168 270 Q118 292 134 330','#a07c58',34,{ow:5})+s.ink('M150 280 Q126 296 136 312',3,'#d2b088',' opacity=".6"')+cup+paw(140,340)+steam+`</g>`;
// counter, bell, tins
const counter=`<g id="cCounter">`+s.ell(240,494,210,10,'#2a1a40',{sw:0,sh:false}).replace('fill="#2a1a40"','fill="#2a1a40" opacity=".3"')
 +sh('M54 410 H426 V490 H54Z','#8a5532',{hi:'#c18a55',sh:'#5a3520',sw:5.4,lit:[6,6]})
 +sh('M40 388 H440 L428 412 H52Z','#c18a55',{hi:'#e8b982',sh:'#7a4a2e',sw:5.4,lit:[5,5]})
 +s.ink('M64 428 V482 M146 424 V486 M240 424 V486 M334 424 V486 M416 428 V482',2.4,'#5a3520','opacity=".6"')
 +sh('M200 428 H280 V470 H200Z','#2f3f86',{sh:'#1f2c66',sw:3.6,hi:'#6a7ac8'})+s.ink('M240 428 V470',2.4,'#1c2340')+s.circ(220,448,8,'#fbf1dc',{sw:2.4,sh:false})
 +s.shape('M54 410 H100 V490 H54Z','#000',{sw:0,sh:false}).replace('fill="#000"','fill="#3a2216" opacity=".0"')
 +`</g>`;
const bell=`<g id="cBell">`+s.ell(330,390,28,6,'#b7801f',{sw:3.4,sh:false})+`<g id="cBellTop">`+sh('M306 388 Q306 358 330 356 Q354 358 354 388Z','#e9b43c',{hi:'#fff0a0',sh:'#b7801f',sw:4.4,lit:[5,5]})+s.circ(330,350,6,'#e9b43c',{sw:3.4,sh:'#b7801f'})+`</g>`
 +`<g id="cDing" opacity="0">`+s.ink('M296 352 L282 344 M300 336 L290 322 M364 352 L378 344 M360 336 L370 322',4,'#e9b43c')+`</g></g>`;
const tins=`<g id="cTins">`+sh('M64 392 L66 352 Q92 346 118 352 L120 392Z','#b4402c',{hi:'#e87a5a',sh:'#7a2418',sw:4.2,lit:[5,5]})+s.ell(92,352,28,7,'#7a2418',{sw:3.4,sh:false})+s.ell(92,351,23,5,'#b4402c',{sw:2,sh:false})+s.circ(92,368,8,'#fbf1dc',{sw:2.6,sh:false})
 +sh('M118 392 L120 364 Q140 360 158 364 L160 392Z','#8f3a28',{hi:'#c4604a',sh:'#5e2218',sw:4,lit:[4,4]})+s.ell(139,364,21,5.4,'#5e2218',{sw:3,sh:false})+`</g>`;
// maxwin: dragon kite behind him
const dragon=`<g id="cKite" opacity="0">`+sh('M240 -60 Q330 -20 380 60 Q320 110 240 160 Q160 110 100 60 Q150 -20 240 -60Z','#d9432e',{hi:'#ff8a6a',sh:'#8a2218',sw:5.4})
 +s.ink('M240 -6 Q320 30 362 100 Q310 140 240 184 Q170 140 118 100 Q160 30 240 -6Z',3,'#e9b43c')+sh('M214 80 Q214 40 244 40 Q274 40 274 80 Q274 120 244 124 Q214 120 214 80Z','#f0b83c',{sw:4,sh:'#b7801f'})
 +s.ell(230,70,6,7,'#fbf1dc',{sw:2.6,sh:false})+s.ell(258,70,6,7,'#fbf1dc',{sw:2.6,sh:false})+s.circ(231,71,3,INK,{sw:0,sh:false})+s.circ(257,71,3,INK,{sw:0,sh:false})+s.ink('M228 98 Q244 110 260 98',3)+s.ink('M214 90 Q190 92 180 108 M274 90 Q298 92 308 108',3,'#fbf1dc')+`</g>`;
const bang=`<g id="cBang" opacity="0"><g transform="translate(96 84) rotate(-14)"><path d="M-11 -4 Q0 -10 11 -4 L7 40 Q0 44 -7 40Z" fill="#d9432e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="0" cy="58" r="8" fill="#d9432e" stroke="${INK}" stroke-width="4.4"/></g></g>`;
const sparks=`<g id="cSpark" opacity="0">${[[120,100],[360,80],[400,260],[90,250],[250,40]].map(([x,y],i)=>`<path d="M${x} ${y-14} L${x+4} ${y-4} L${x+14} ${y} L${x+4} ${y+4} L${x} ${y+14} L${x-4} ${y+4} L${x-14} ${y} L${x-4} ${y-4}Z" fill="#ffe28a" stroke="${INK}" stroke-width="2.6"/>`).join('')}</g>`;
const svg=`<div id="char"><svg viewBox="0 0 480 500" filter="url(#roughU)" stroke-linejoin="round" stroke-linecap="round">
 ${dragon}
 <g id="cAll">
  <g id="cTail">${tail}</g>
  <g id="cBody">${body}</g>
  <g id="cHatWrap">${hatSvg}${goldHat}</g>
  ${strings}
  <g id="cHead">${ears}${head}</g>
  ${armL}${stream}${armR}
 </g>
 ${counter}${tins}${bell}
 ${bang}${sparks}
</svg></div>`;
fs.writeFileSync('/home/user/nebula/slotforge/slots/cloudtop-tea-house/character.html','<!-- Koji the tanuki. viewBox 480x500 at stage (1130,300). Ids: cAll cTail cBody cHatWrap(cHat,cGoldHat) cHatStr cHead(cEarL,cEarR,cEyes,cPupils,cLids,cBrows,cMouth,cMouthOpen,cCheeks,cBand) cArmL(cCup,cSteam) cStream cArmR(cLadle) cCounter cTins cBell(cBellTop,cDing) cKite(maxwin) cBang cSpark -->\n'+svg);
console.log('char ok');
