const fs=require('fs');
const INK='#1c2340';
const P=(d,f,sw=3.4,ex='')=>`<path d="${d}" fill="${f}" ${sw?`stroke="${INK}" stroke-width="${sw}"`:'stroke="none"'} ${ex}/>`;
const N=(d,c=INK,w=2.4,o=1,ex='')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" ${o<1?`opacity="${o}"`:''} stroke-linecap="round" ${ex}/>`;
const E=(cx,cy,rx,ry,f,sw=3.4,ex='')=>P(`M${cx-rx} ${cy}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`,f,sw,ex);
const SH=(cx,cy,rx,ry,o=.3)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#3a2a5a" opacity="${o}"/>`;
let o='';
const grp=(attrs,inner)=>`<g ${attrs}>${inner}</g>`;
// ---------- defs ----------
o+=`<svg id="scene" width="1600" height="900" viewBox="0 0 1600 900">
 <defs>
  <linearGradient id="ctSky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="620"><stop offset="0" stop-color="#6fbbea"/><stop offset=".38" stop-color="#a9d8f0"/><stop offset=".72" stop-color="#fbdcc2"/><stop offset="1" stop-color="#ffc9a2"/></linearGradient>
  <radialGradient id="ctGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(282 400) scale(760 620)"><stop offset="0" stop-color="#fff7d2" stop-opacity=".95"/><stop offset=".25" stop-color="#ffe6b8" stop-opacity=".6"/><stop offset=".6" stop-color="#ffd2a8" stop-opacity=".2"/><stop offset="1" stop-color="#ffd2a8" stop-opacity="0"/></radialGradient>
  <linearGradient id="ctHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeedd" stop-opacity="0"/><stop offset="1" stop-color="#fff0e0" stop-opacity=".85"/></linearGradient>
  <linearGradient id="ctShaft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c0" stop-opacity=".55"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></linearGradient>
  <linearGradient id="ctDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a8a" stop-opacity=".62"/><stop offset=".55" stop-color="#ff8a4a" stop-opacity=".5"/><stop offset="1" stop-color="#ff6a3a" stop-opacity=".45"/></linearGradient>
  <radialGradient id="ctLampG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd978" stop-opacity=".9"/><stop offset=".4" stop-color="#ffb040" stop-opacity=".4"/><stop offset="1" stop-color="#ffb040" stop-opacity="0"/></radialGradient>
  <linearGradient id="ctEaveSh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a40" stop-opacity=".45"/><stop offset="1" stop-color="#2a1a40" stop-opacity="0"/></linearGradient>
  <linearGradient id="ctRockL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9ab98"/><stop offset="1" stop-color="#8a7d8e"/></linearGradient>
 </defs>
 <rect width="1600" height="900" fill="url(#ctSky)"/>
 <rect width="1600" height="900" fill="url(#ctGlow)"/>
`;
// ---------- sun ----------
o+=`<g id="sSun"><circle cx="282" cy="392" r="68" fill="#fff0b0" opacity=".55"/><circle cx="282" cy="392" r="58" fill="#fff4c8" stroke="${INK}" stroke-width="3.6"/><circle cx="282" cy="392" r="40" fill="#ffe28a" opacity=".7"/>
 ${N('M222 360 Q282 330 342 360',INK,2.2,.25)}</g>`;
// ---------- banded clouds ----------
function cloud(cx,cy,w,h,lit='#fffaf0',under='#f7cdb6',sw=3){
  const x0=cx-w/2,x1=cx+w/2, n=Math.max(3,Math.round(w/60)); let d=`M${x0} ${cy}`;
  const pts=[]; for(let i=0;i<n;i++){const a=x0+(x1-x0)*i/n,b=x0+(x1-x0)*(i+1)/n,hh=h*(0.55+0.45*Math.abs(Math.sin(i*2.1+cx*.013)));d+=` Q${a} ${cy-hh} ${(a+b)/2} ${cy-hh*.92} T${b} ${cy}`;}
  d+=` Q${x1-w*.05} ${cy+h*.28} ${cx} ${cy+h*.3} Q${x0+w*.05} ${cy+h*.28} ${x0} ${cy}Z`;
  const bd=`M${x0+w*.04} ${cy+h*.02} Q${cx} ${cy+h*.34} ${x1-w*.04} ${cy+h*.02} L${x1-w*.1} ${cy+h*.26} Q${cx} ${cy+h*.4} ${x0+w*.1} ${cy+h*.26}Z`;
  return P(d,lit,sw)+`<path d="${bd}" fill="${under}" opacity=".85"/>`+N(`M${x0+w*.12} ${cy-h*.2} Q${x0+w*.2} ${cy-h*.5} ${x0+w*.3} ${cy-h*.5}`,'#ffffff',2.4,.8);
}
o+=`<g id="sClouds" filter="url(#roughL)">
 <g class="cl c1">${cloud(330,118,250,46)}${cloud(150,60,160,30)}</g>
 <g class="cl c2">${cloud(1180,150,230,42)}${cloud(1450,86,200,36)}</g>
 <g class="cl c3">${cloud(1560,300,170,30,'#fff6e8')}${cloud(260,282,170,28,'#fff6e8')}</g>
</g>`;
// ---------- mountains ----------
const ridge=(pts,f,sh,base=620)=>{let d=`M-10 ${base}`;pts.forEach(p=>d+=` L${p[0]} ${p[1]}`);d+=` L1610 ${base}Z`;return P(d,f,2.6)};
let mt=`<g filter="url(#roughL)">`
 +ridge([[-10,470],[90,420],[160,452],[250,392],[360,462],[470,430],[600,486],[760,440],[900,480],[1050,430],[1200,470],[1330,414],[1450,458],[1610,420]],'#c5c5e8')
 +ridge([[-10,520],[120,480],[230,516],[340,470],[470,520],[620,500],[820,530],[1000,496],[1180,528],[1320,486],[1460,520],[1610,490]],'#a9acdb')
 +`</g>`;
// shade right faces of the far peaks (light from the left)
mt+=`<g opacity=".28" fill="#6a6ab0" stroke="none"><path d="M250 392 L360 462 L300 462Z M90 420 L160 452 L120 452Z M1330 414 L1450 458 L1380 458Z M1050 430 L1200 470 L1120 470Z"/></g>`;
// rope bridge between two peaks (left)
mt+=`<g stroke="${INK}" stroke-linecap="round" fill="none"><path d="M96 424 Q170 452 254 396" stroke-width="3"/><path d="M98 430 Q172 458 256 402" stroke-width="2.4"/>`
 +[0,1,2,3,4,5,6,7].map(i=>{const t=(i+1)/9,x=96+(254-96)*t,y=424+(396-424)*t+Math.sin(Math.PI*t)*24;return `<path d="M${x} ${y} v7" stroke-width="2.4"/>`}).join('')+`</g>`;
// pagoda on the right ridge
const pag=(x,y,s)=>{let g=`<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="${3/s}" stroke-linejoin="round">`;
 g+=P('M-30 0 H30 V-6 H-30Z','#8a6a5a',0);
 const tiers=[[0,34,26],[-32,28,22],[-62,22,18]];
 tiers.forEach(([yy,w,h],i)=>{g+=P(`M${-w*.7} ${yy-4} H${w*.7} V${yy-h} H${-w*.7}Z`,'#f4e3c4',3/s)+P(`M${-w-8} ${yy-h+2} Q${-w*.5} ${yy-h-4} 0 ${yy-h-14} Q${w*.5} ${yy-h-4} ${w+8} ${yy-h+2}Z`,'#79a85a',3/s)+P(`M${-w*.25} ${yy-4} V${yy-h*.7} H${w*.25} V${yy-4}Z`,'#d9432e',2/s)});
 g+=N('M0 -100 V-124',INK,3/s)+P('M-4 -112 H4 M-6 -118 H6',INK,0)+`</g>`;return g;};

// village on the low left ridge
const house=(x,y,w,h)=>P(`M${x} ${y} h${w} v${-h} h${-w}Z`,'#f4e3c4',2.6)+P(`M${x-4} ${y-h} L${x+w/2} ${y-h-12} L${x+w+4} ${y-h}Z`,'#8a5a4a',2.6)+P(`M${x+w*.35} ${y} v${-h*.5} h${w*.3} v${h*.5}`,'#7a4a2e',1.8);
mt+=`<g filter="url(#roughC)"><path d="M-10 560 Q60 520 150 536 Q260 512 360 548 L360 600 L-10 600Z" fill="#8d93c9" stroke="${INK}" stroke-width="2.8"/>`
 +house(40,540,24,16)+house(76,534,28,18)+house(118,540,22,14)+house(160,530,30,20)+house(206,538,24,16)+house(246,534,26,16)
 +N('M172 506 Q166 490 174 478',INK,2.4,.4)+`</g>`;
o+=`<g id="sFar">${mt}</g>`;
o+=`<rect x="0" y="470" width="1600" height="160" fill="url(#ctHaze)"/>`;
// ---------- sea of clouds ----------
o+=`<g id="sSea" filter="url(#roughL)">
 <g class="cl s1">${cloud(120,606,300,44,'#fff1e2','#f2c0ae')}${cloud(520,620,260,38,'#fff1e2','#f2c0ae')}${cloud(1380,612,300,44,'#fff1e2','#f2c0ae')}${cloud(960,624,240,34,'#fff1e2','#f2c0ae')}</g>
 <g class="cl s2">${cloud(300,676,340,52,'#fff8ee','#f7cbb8')}${cloud(1160,686,360,54,'#fff8ee','#f7cbb8')}${cloud(1540,666,220,40,'#fff8ee','#f7cbb8')}${cloud(740,700,300,46,'#fff8ee','#f7cbb8')}</g>
</g>`;
fs.writeFileSync('scene_a.txt',o);
module.exports={P,N,E,SH,INK,cloud,grp};
