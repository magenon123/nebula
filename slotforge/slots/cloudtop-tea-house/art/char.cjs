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
// hat: a woven conical straw KASA (round cone, visible radial + ring weave, bound brim, chin cord). Sits ON the head; the ears poke through slits.
const AX=244, AY=-26, BY=94, BRX=152, BRY=22;
const coneD=`M${AX-BRX} ${BY} Q180 56 ${AX} ${AY} Q308 56 ${AX+BRX} ${BY} A${BRX} ${BRY} 0 0 1 ${AX-BRX} ${BY}Z`;
function hat(c1,c2,hi,id,lineC,ringC){
  let w=''; const rings=[.2,.34,.48,.62,.76,.9,1];
  // alternate lighter / darker woven bands (wide soft strokes under the thin weave lines)
  rings.forEach((t,i)=>{const rx=BRX*t,ry=BRY*t,yc=AY+(BY-AY)*t; if(i%2===0) w+=`<path d="M${AX-rx} ${yc} A${rx} ${ry} 0 0 0 ${AX+rx} ${yc}" fill="none" stroke="${ringC}" stroke-width="9" opacity=".35"/>`;});
  // radial strands (apex to the front rim)
  let sp=''; for(let k=0;k<=26;k++){const al=Math.PI*k/26; sp+=`M${AX} ${AY} L${(AX+BRX*Math.cos(al)).toFixed(1)} ${(BY+BRY*Math.sin(al)).toFixed(1)} `;}
  w+=`<path d="${sp}" fill="none" stroke="${lineC}" stroke-width="1.7" opacity=".85"/>`;
  // rings + stitch dashes between them = visible basket weave
  rings.forEach(t=>{const rx=BRX*t,ry=BRY*t,yc=AY+(BY-AY)*t; w+=`<path d="M${AX-rx} ${yc} A${rx} ${ry} 0 0 0 ${AX+rx} ${yc}" fill="none" stroke="${lineC}" stroke-width="2.3"/>`;});
  [.27,.41,.55,.69,.83,.95].forEach((t,i)=>{const rx=BRX*t,ry=BRY*t,yc=AY+(BY-AY)*t; w+=`<path d="M${AX-rx} ${yc} A${rx} ${ry} 0 0 0 ${AX+rx} ${yc}" fill="none" stroke="${lineC}" stroke-width="3.4" stroke-dasharray="2.4 ${5+i*.7}" opacity=".8"/>`;});
  const lip=`M${AX-BRX} ${BY} A${BRX} ${BRY} 0 0 0 ${AX+BRX} ${BY} L${AX+BRX} ${BY+9} A${BRX} ${BRY} 0 0 1 ${AX-BRX} ${BY+9}Z`;
  return `<g id="${id}">`
   +sh(lip,mix(c2,'#2a1f4a',.18),{sh:mix(c2,'#2a1f4a',.45),sw:5,lit:[2,3]})
   +s.ink(`M${AX-BRX+4} ${BY+5} A${BRX-4} ${BRY} 0 0 0 ${AX+BRX-4} ${BY+5}`,3,lineC,'stroke-dasharray="3 5"')            // bound rim stitches
   +sh(coneD,c1,{hi:hi,sh:c2,lit:[8,6],sw:0})
   +`<clipPath id="${id}C"><path d="${coneD}"/></clipPath><g clip-path="url(#${id}C)">${w}</g>`
   +s.ink(coneD,5)
   +s.circ(AX,AY+1,6,mix(c2,'#2a1f4a',.2),{sw:3.4,sh:false})                                                                   // finial knot
   +`</g>`;}
let hatSvg=`<g id="cHat">`+hat('#e6c068','#b8862c','#fff0a8','hatStraw','#8f5d18','#c99a3c')+`</g>`;
let goldHat=`<g id="cGoldHat" opacity="0">`+hat('#ffd23a','#b8860b','#fffbd0','hatGold','#9a6a08','#e0a820')+s.circ(AX,AY-7,8,'#d9432e',{sw:3,sh:'#8a2218'})+`</g>`;
// chin cord (himo): from the brim, down the cheeks, under the chin; sways a little
const strings=`<g id="cHatStr">`+s.ln('M104 104 Q100 218 156 248 Q200 270 244 270 Q288 270 332 248 Q388 218 384 104','#9a2a1c',4.2,{ow:3.2})
  +s.circ(104,104,5,'#e9b43c',{sw:2.4,sh:false})+s.circ(384,104,5,'#e9b43c',{sw:2.4,sh:false})
  +s.circ(244,271,7,'#e9b43c',{sw:2.8,sh:'#b7801f'})+s.ln('M244 276 Q240 288 236 298 M244 276 Q248 288 252 298','#9a2a1c',3.4,{ow:2.6})+`</g>`;
// head
const headD='M146 176 Q144 100 244 98 Q344 100 342 176 Q346 250 244 254 Q142 250 146 176Z';
const slit=(x,y)=>s.ell(x,y,28,8,'#3a2216',{sw:3,sh:false});
let ears=slit(190,86)+slit(298,86)
 +`<g id="cEarL"><g transform="translate(0 -26)">`+sh('M166 116 Q148 64 190 52 Q224 60 216 112Z',FURD,{hi:'#9a7458'})+s.fill('M176 106 Q170 76 192 68 Q208 76 204 104Z','#d79a8a')+`</g></g>`
 +`<g id="cEarR"><g transform="translate(0 -26)">`+sh('M322 116 Q340 64 298 52 Q264 60 272 112Z',FURD,{hi:'#9a7458'})+s.fill('M312 106 Q318 76 296 68 Q280 76 284 104Z','#d79a8a')+`</g></g>`;
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
const armR=`<g id="cArmR">`+s.ln('M312 270 Q342 276 356 300','#a07c58',34,{ow:5})+`<g id="cForeR">`+ladle+s.ln('M356 300 Q360 318 352 336','#a07c58',34,{ow:5})+s.ink('M326 276 Q346 284 352 304',3,'#d2b088',' opacity=".6"')+paw(354,340)+`</g></g>`;
const cup=`<g id="cCup">`+sh('M120 322 H160 L156 358 Q140 366 124 358Z','#fbf1dc',{hi:'#ffffff',sh:'#cdbf9f',sw:4,lit:[4,4]})+sh('M121 332 H159 L158 342 H122Z','#3a4a8c',{sw:2.6,sh:'#27346a'})+s.ell(140,322,20,5,'#bfd98a',{sw:3.4,sh:'#79a85a'})+`</g>`;
const steam=`<g id="cSteam"><path d="M132 312 Q122 296 134 282 Q146 268 134 252" fill="none" stroke="#fffaf0" stroke-width="8" stroke-linecap="round" opacity=".92"/><path d="M148 310 Q158 294 148 280" fill="none" stroke="#fffaf0" stroke-width="6" stroke-linecap="round" opacity=".7"/></g>`;
const stream=`<g id="cStream" opacity="0"><path d="M106 242 Q100 310 104 388" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M106 242 Q100 310 104 388" fill="none" stroke="#9bc46a" stroke-width="4.4" stroke-linecap="round"/></g>`;
const armL=`<g id="cArmL">`+s.ln('M168 270 Q140 276 126 300','#a07c58',34,{ow:5})+s.ink('M152 278 Q134 286 128 300',3,'#d2b088',' opacity=".6"')+`<g id="cForeL">`+s.ln('M126 300 Q122 318 134 330','#a07c58',34,{ow:5})+cup+paw(140,340)+steam+`</g></g>`;
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
const dragon=`<g id="cKite" opacity="0"><use href="#s15" x="60" y="-130" width="360" height="360"/></g>`;
const bang=`<g id="cBang" opacity="0"><g transform="translate(96 84) rotate(-14)"><path d="M-11 -4 Q0 -10 11 -4 L7 40 Q0 44 -7 40Z" fill="#d9432e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="0" cy="58" r="8" fill="#d9432e" stroke="${INK}" stroke-width="4.4"/></g></g>`;
const sparks=`<g id="cSpark" opacity="0">${[[120,100],[360,80],[400,260],[90,250],[250,40]].map(([x,y],i)=>`<path d="M${x} ${y-14} L${x+4} ${y-4} L${x+14} ${y} L${x+4} ${y+4} L${x} ${y+14} L${x-4} ${y+4} L${x-14} ${y} L${x-4} ${y-4}Z" fill="#ffe28a" stroke="${INK}" stroke-width="2.6"/>`).join('')}</g>`;
const svg=`<div id="char"><svg viewBox="0 0 480 500" filter="url(#roughU)" stroke-linejoin="round" stroke-linecap="round">
 ${dragon}
 <g id="cAll">
  <g id="cTail">${tail}</g>
  <g id="cBody">${body}</g>
  <g id="cHead">${head}<g id="cHatWrap">${hatSvg}${goldHat}</g>${ears}${strings}</g>
  ${armL}${stream}${armR}
 </g>
 ${counter}${tins}${bell}
 ${bang}${sparks}
</svg></div>`;
module.exports={s,sh,hat,head,ears,body,tail,strings,paw,cup,steam,FUR,FURD,PATCH,CREAM,hatSvg,goldHat,coneD,INK};
fs.writeFileSync('/home/user/nebula/slotforge/slots/cloudtop-tea-house/character.html','<!-- Koji the tanuki. viewBox 480x500 at stage (1130,300). Ids: cAll cTail cBody cHatWrap(cHat,cGoldHat) cHatStr cHead(cEarL,cEarR,cEyes,cPupils,cLids,cBrows,cMouth,cMouthOpen,cCheeks,cBand) cArmL(cCup,cSteam) cStream cArmR(cLadle) cCounter cTins cBell(cBellTop,cDing) cKite(maxwin) cBang cSpark -->\n'+svg);
console.log('char ok');
