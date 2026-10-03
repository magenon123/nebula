// Sirocco, the djinn merchant (side character), 500x760, light from the right. node gen-char.cjs -> character.svg
const fs=require('fs');
const OL='#140a28';
const torso=`M146,250 C172,226 214,216 250,224 C286,216 328,226 354,250 C376,278 362,350 344,412 C336,440 332,462 324,480 L176,480 C168,462 164,440 156,412 C138,350 124,278 146,250Z`;
const head=`M210,122 C210,100 290,100 290,122 L294,152 C294,180 278,202 250,212 C222,202 206,180 206,152Z`;
const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const seg=(a,b,t0,t1)=>{const p=lerp(a,b,t0),q=lerp(a,b,t1);return `M${p[0].toFixed(1)},${p[1].toFixed(1)} L${q[0].toFixed(1)},${q[1].toFixed(1)}`};
const L0=[140,392],L1=[318,338],R0=[360,394],R1=[184,342];
function forearm(a,b,wA,wB,tone){ // tapered via 3 stacked segments
  let s='';for(let i=0;i<6;i++){const t0=i/6,t1=(i+1)/6+.01,w=wA+(wB-wA)*(i+.5)/6;s+=`<path d="${seg(a,b,t0,t1)}" stroke="${OL}" stroke-width="${w+4}" stroke-linecap="round"/>`;}
  for(let i=0;i<6;i++){const t0=i/6,t1=(i+1)/6+.01,w=wA+(wB-wA)*(i+.5)/6;s+=`<path d="${seg(a,b,t0,t1)}" stroke="${tone[0]}" stroke-width="${w}" stroke-linecap="round"/><path d="${seg(a,b,t0,t1)}" stroke="${tone[1]}" stroke-width="${w*.58}" stroke-linecap="round" transform="translate(0,-${(w*.2).toFixed(1)})"/><path d="${seg(a,b,t0,t1)}" stroke="${tone[2]}" stroke-width="${(w*.16).toFixed(1)}" stroke-linecap="round" transform="translate(0,-${(w*.34).toFixed(1)})"/>`;}
  return s;}
function bracer(a,b,t0,t1,wA,wB){const w0=wA+(wB-wA)*t0,w1=wA+(wB-wA)*t1;const p=lerp(a,b,t0),q=lerp(a,b,t1);const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy),nx=-dy/n,ny=dx/n;
  const pts=[[p[0]+nx*(w0/2+3),p[1]+ny*(w0/2+3)],[q[0]+nx*(w1/2+3),q[1]+ny*(w1/2+3)],[q[0]-nx*(w1/2+3),q[1]-ny*(w1/2+3)],[p[0]-nx*(w0/2+3),p[1]-ny*(w0/2+3)]];
  const d='M'+pts.map(x=>x[0].toFixed(1)+','+x[1].toFixed(1)).join(' L')+'Z';
  const m=lerp(a,b,(t0+t1)/2);
  return `<path d="${d}" fill="url(#goldA)" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/><path d="${d}" fill="url(#goldV)"/><path d="M${pts[1][0].toFixed(1)},${pts[1][1].toFixed(1)} L${pts[2][0].toFixed(1)},${pts[2][1].toFixed(1)}" stroke="#fff0b0" stroke-width="2" opacity=".8"/><path d="M${((pts[0][0]+pts[1][0])/2).toFixed(1)},${((pts[0][1]+pts[1][1])/2).toFixed(1)} L${((pts[3][0]+pts[2][0])/2).toFixed(1)},${((pts[3][1]+pts[2][1])/2).toFixed(1)}" stroke="#5a2a0c" stroke-width="1.6" opacity=".55" stroke-dasharray="3 3"/><circle cx="${m[0].toFixed(1)}" cy="${m[1].toFixed(1)}" r="6" fill="url(#lapisC)" stroke="${OL}" stroke-width="1.6"/><circle cx="${(m[0]-1.5).toFixed(1)}" cy="${(m[1]-2).toFixed(1)}" r="1.6" fill="#fff" opacity=".9"/>`;}
function fist(x,y,rot,flip){return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${flip},1)"><path d="M-20,-16 C-6,-24 14,-22 24,-12 C30,-2 28,12 18,20 C6,26 -12,24 -22,14 C-28,4 -28,-8 -20,-16Z" fill="url(#skinH)" stroke="${OL}" stroke-width="2.4"/>
 <path d="M-8,-22 v-6 M4,-22 v-8 M16,-18 v-8" stroke="none"/>
 <path d="M-14,-12 C-6,-18 4,-18 10,-12 M-16,0 C-8,-6 4,-6 12,0 M-14,12 C-6,6 6,6 14,12" fill="none" stroke="#0e3552" stroke-width="2" opacity=".7"/>
 <path d="M-14,-13 C-6,-19 4,-19 10,-13" fill="none" stroke="#9ff0ee" stroke-width="1.4" opacity=".7"/><path d="M20,-12 C26,0 24,10 18,18" fill="none" stroke="#a8fff4" stroke-width="2" opacity=".8"/>
 <circle cx="-10" cy="-3" r="2.6" fill="#1f93b0"/></g>`}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 760" width="500" height="760">
<defs>
<linearGradient id="skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16406f"/><stop offset=".3" stop-color="#1b78a0"/><stop offset=".62" stop-color="#2fb0c6"/><stop offset=".85" stop-color="#6fe2dc"/><stop offset="1" stop-color="#b0fff0"/></linearGradient>
<linearGradient id="skinV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8ffff" stop-opacity=".2"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2a1560" stop-opacity=".5"/></linearGradient>
<linearGradient id="skinH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a5a8a"/><stop offset=".5" stop-color="#2aa0bc"/><stop offset="1" stop-color="#7aeee0"/></linearGradient>
<linearGradient id="goldA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b2a12"/><stop offset=".25" stop-color="#c8741e"/><stop offset=".55" stop-color="#ffd668"/><stop offset=".8" stop-color="#f5b23a"/><stop offset="1" stop-color="#fff0a8"/></linearGradient>
<linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b8" stop-opacity=".4"/><stop offset=".4" stop-color="#fff2b8" stop-opacity="0"/><stop offset="1" stop-color="#3a1408" stop-opacity=".45"/></linearGradient>
<radialGradient id="lapisC" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#9fecff"/><stop offset=".4" stop-color="#1fa5b8"/><stop offset="1" stop-color="#0a2f66"/></radialGradient>
<radialGradient id="rubyC" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffb0a8"/><stop offset=".3" stop-color="#e0354f"/><stop offset="1" stop-color="#4a0618"/></radialGradient>
<linearGradient id="silk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a0a24"/><stop offset=".3" stop-color="#8e1535"/><stop offset=".65" stop-color="#d03a52"/><stop offset=".9" stop-color="#ff8a74"/><stop offset="1" stop-color="#ffb08a"/></linearGradient>
<linearGradient id="plum" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c0f4e"/><stop offset=".4" stop-color="#6a2a8e"/><stop offset=".8" stop-color="#b058b0"/><stop offset="1" stop-color="#ff9aa8"/></linearGradient>
<linearGradient id="smk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7ff0e6"/><stop offset=".5" stop-color="#2c9bd0"/><stop offset="1" stop-color="#5a3fc8"/></linearGradient>
<linearGradient id="beard" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#06060f"/><stop offset=".6" stop-color="#1a1a30"/><stop offset="1" stop-color="#3c4a6a"/></linearGradient>
<radialGradient id="glowR" cx="360" cy="250" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb25e" stop-opacity=".55"/><stop offset="1" stop-color="#ffb25e" stop-opacity="0"/></radialGradient>
<filter id="b2"><feGaussianBlur stdDeviation="2"/></filter><filter id="b6"><feGaussianBlur stdDeviation="6"/></filter><filter id="b12"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 .05  0 0 0 0 .02  0 0 0 0 .15  0 0 0 .55 -.2"/></filter>
<clipPath id="rightHalf"><rect x="262" y="0" width="240" height="760"/></clipPath>
<clipPath id="torsoC"><path d="${torso}"/></clipPath><clipPath id="headC"><path d="${head}"/></clipPath>
</defs>
<rect width="500" height="760" fill="url(#glowR)"/>
<!-- SMOKE TAIL -->
<g filter="url(#b2)">
 <ellipse cx="250" cy="588" rx="86" ry="26" fill="url(#smk)"/>
 <path d="M168,500 C140,566 214,588 268,616 C336,650 296,708 206,694 C170,688 150,694 128,706 L108,690 C140,670 176,664 206,662 C262,656 262,640 232,628 C170,602 86,560 120,500Z" fill="url(#smk)" opacity=".92"/>
 <path d="M178,512 C166,560 226,580 276,608" fill="none" stroke="#c8fffa" stroke-width="10" stroke-linecap="round" opacity=".55" filter="url(#b6)"/>
 <path d="M300,624 C322,650 300,690 240,690" fill="none" stroke="#e8fffc" stroke-width="5" stroke-linecap="round" opacity=".65" filter="url(#b2)"/>
 <path d="M130,560 C100,600 160,640 214,650" fill="none" stroke="#3b2aa0" stroke-width="12" stroke-linecap="round" opacity=".5" filter="url(#b6)"/>
 <circle cx="332" cy="672" r="26" fill="#7ff0e6" opacity=".35" filter="url(#b6)"/><circle cx="352" cy="640" r="14" fill="#7ff0e6" opacity=".3" filter="url(#b6)"/><circle cx="96" cy="620" r="18" fill="#6a5be0" opacity=".3" filter="url(#b6)"/>
</g>
<!-- LAMP (small, at the tail's end) -->
<g transform="translate(112,700)"><ellipse cx="6" cy="18" rx="46" ry="7" fill="#0a0418" opacity=".5" filter="url(#b2)"/>
 <path d="M-40,-14 C-52,-26 -50,-42 -44,-54" fill="none" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><path d="M-40,-14 C-52,-26 -50,-42 -44,-54" fill="none" stroke="url(#goldA)" stroke-width="8" stroke-linecap="round"/>
 <path d="M-34,0 C-34,-22 -8,-26 14,-26 C40,-26 56,-16 56,2 C56,18 34,22 12,22 C-12,22 -34,16 -34,0Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.4"/><path d="M-34,0 C-34,-22 -8,-26 14,-26 C40,-26 56,-16 56,2 C56,18 34,22 12,22 C-12,22 -34,16 -34,0Z" fill="url(#goldV)"/>
 <path d="M-22,-8 C-4,-14 30,-14 50,-6" fill="none" stroke="#fff0b0" stroke-width="2" opacity=".8"/><circle cx="-6" cy="4" r="4" fill="url(#lapisC)"/><circle cx="14" cy="5" r="4" fill="url(#rubyC)"/><circle cx="34" cy="3" r="4" fill="url(#lapisC)"/>
 <path d="M-6,-24 C-6,-36 24,-36 24,-24Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2"/><circle cx="9" cy="-40" r="5" fill="url(#rubyC)" stroke="${OL}" stroke-width="1.5"/>
 <path d="M52,-8 C72,-12 74,10 56,12" fill="none" stroke="${OL}" stroke-width="8" stroke-linecap="round"/><path d="M52,-8 C72,-12 74,10 56,12" fill="none" stroke="url(#goldA)" stroke-width="4.5" stroke-linecap="round"/></g>
<!-- TROUSERS (ruby silk) -->
<g>
 <path d="M162,470 C118,508 126,548 164,574 C200,586 300,586 336,574 C374,548 382,508 338,470Z" fill="url(#silk)" stroke="${OL}" stroke-width="2.4"/>
 <path d="M200,486 C186,520 196,552 214,580 M250,486 C250,524 252,556 254,584 M296,486 C312,520 304,552 288,580" fill="none" stroke="#3a0a24" stroke-width="2.4" opacity=".55"/>
 <path d="M214,486 C204,520 212,552 226,580 M270,486 C274,520 276,556 276,584 M318,488 C328,520 322,552 312,578" fill="none" stroke="#ff9a82" stroke-width="2" opacity=".5"/>
 <path d="M126,520 C120,548 150,572 170,576" fill="none" stroke="#2a0618" stroke-width="10" opacity=".35" filter="url(#b2)"/>
 <path d="M162,572 q88,22 176,0 l-4,-18 q-84,22 -168,0Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.4"/><path d="M164,566 q86,20 172,0" fill="none" stroke="#fff0b0" stroke-width="1.8" opacity=".7"/>
</g>
<!-- TORSO -->
<path d="${torso}" fill="url(#skin)" stroke="${OL}" stroke-width="2.6"/>
<g clip-path="url(#torsoC)">
 <rect x="100" y="200" width="300" height="300" fill="url(#skinV)"/>
 <!-- chest / abs modelling -->
 <path d="M178,330 Q214,358 250,338 Q286,358 322,330" fill="none" stroke="#0e3a66" stroke-width="3.4" opacity=".55"/>
 <path d="M180,326 Q214,350 250,332 Q286,350 320,326" fill="none" stroke="#b8fff2" stroke-width="2" opacity=".5"/>
 <path d="M250,338 L250,478" stroke="#0e3a66" stroke-width="2.6" opacity=".5"/>
 ${[404,424,444].map(y=>`<path d="M212,${y} Q232,${y+9} 250,${y+2} Q268,${y+9} 288,${y}" fill="none" stroke="#0e3a66" stroke-width="2.6" opacity=".5"/><path d="M214,${y-2} Q232,${y+6} 250,${y} Q268,${y+6} 286,${y-2}" fill="none" stroke="#b8fff2" stroke-width="1.4" opacity=".4"/>`).join('')}
 <path d="M146,250 C128,290 134,340 150,400" fill="none" stroke="#12285a" stroke-width="22" opacity=".45" filter="url(#b6)"/>
 <path d="M354,254 C370,290 362,340 346,400" fill="none" stroke="#c8fff6" stroke-width="5" opacity=".7" filter="url(#b2)"/>
 <rect x="100" y="200" width="300" height="300" filter="url(#grain)" opacity=".45"/>
</g>
<path d="${torso}" fill="none" stroke="#a8fff0" stroke-width="3.2" clip-path="url(#rightHalf)" opacity=".85"/>
<!-- BELT SASH -->
<path d="M170,466 q80,18 160,0 l4,24 q-84,18 -168,0Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.4"/><path d="M170,466 q80,18 160,0 l4,24 q-84,18 -168,0Z" fill="url(#goldV)"/>
<path d="M174,472 q76,16 152,0" fill="none" stroke="#fff0b0" stroke-width="1.8" opacity=".7"/>
<ellipse cx="250" cy="484" rx="17" ry="14" fill="url(#rubyC)" stroke="${OL}" stroke-width="2.4"/><ellipse cx="244" cy="479" rx="5" ry="3.4" fill="#fff" opacity=".85"/>
<!-- NECK -->
<path d="M222,192 L220,236 Q250,256 280,236 L278,192Z" fill="url(#skin)" stroke="${OL}" stroke-width="2.4"/><path d="M222,200 Q250,226 278,200 L278,226 Q250,248 222,228Z" fill="#12285a" opacity=".5"/>
<!-- ROYAL COLLAR -->
<path d="M168,246 Q250,320 332,246 Q250,296 168,246Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.4"/>
<path d="M168,246 Q250,320 332,246 Q250,296 168,246Z" fill="url(#goldV)"/>
${[0.12,0.26,0.4,0.6,0.74,0.88].map((t,i)=>{const x=168+164*t,y=262+Math.sin(t*Math.PI)*22-2;return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="url(#${i%2?'rubyC':'lapisC'})" stroke="${OL}" stroke-width="1.4"/>`}).join('')}
<path d="M250,300 l-15,12 15,22 15,-22z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.2"/><circle cx="250" cy="314" r="8" fill="url(#lapisC)" stroke="${OL}" stroke-width="1.6"/><circle cx="247" cy="311" r="2.2" fill="#fff"/>
<!-- LEFT UPPER ARM (viewer left, shaded) -->
<g fill="none" stroke-linecap="round">
 <path d="M154,262 C130,300 128,350 136,392" stroke="${OL}" stroke-width="72"/><path d="M154,262 C130,300 128,350 136,392" stroke="#1a5a8e" stroke-width="66"/>
 <path d="M158,268 C138,304 136,350 144,390" stroke="#2a98b4" stroke-width="34"/><path d="M162,272 C146,306 144,350 150,386" stroke="#6ee0d8" stroke-width="7"/>
</g>
<!-- shoulder cap highlight -->
<ellipse cx="150" cy="262" rx="30" ry="22" fill="#2a98b4" stroke="${OL}" stroke-width="2.4" opacity=".0"/>
<!-- RIGHT UPPER ARM (viewer right, lit) -->
<g fill="none" stroke-linecap="round">
 <path d="M346,262 C372,300 374,350 364,394" stroke="${OL}" stroke-width="72"/><path d="M346,262 C372,300 374,350 364,394" stroke="#2a98b4" stroke-width="66"/>
 <path d="M350,264 C376,302 378,350 370,392" stroke="#6ee0d8" stroke-width="30"/><path d="M356,268 C380,304 382,350 374,390" stroke="#d8fffb" stroke-width="7"/>
 <path d="M334,270 C354,300 356,350 350,392" stroke="#1a5a8e" stroke-width="16" opacity=".6"/>
</g>
<!-- SHOULDER GOLD PAULDRONS -->
<path d="M110,262 C112,226 160,216 186,238 C176,262 150,278 122,282 C112,278 108,270 110,262Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.6"/><path d="M110,262 C112,226 160,216 186,238 C176,262 150,278 122,282Z" fill="url(#goldV)"/><path d="M118,258 C124,238 152,228 174,238" fill="none" stroke="#fff0b0" stroke-width="2.2" opacity=".75"/>
<path d="M390,262 C388,226 340,216 314,238 C324,262 350,278 378,282 C388,278 392,270 390,262Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.6"/><path d="M390,262 C388,226 340,216 314,238 C324,262 350,278 378,282Z" fill="url(#goldV)"/><path d="M380,256 C372,238 346,228 326,240" fill="none" stroke="#fff0b0" stroke-width="2.4" opacity=".85"/>
<circle cx="146" cy="258" r="7" fill="url(#rubyC)" stroke="${OL}" stroke-width="1.8"/><circle cx="354" cy="258" r="7" fill="url(#rubyC)" stroke="${OL}" stroke-width="1.8"/>
<!-- CROSSED FOREARMS: left under, right over -->
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
 ${forearm(L0,L1,54,42,['#1a5a8e','#2a98b4','#6ee0d8'])}
 ${bracer(L0,L1,.28,.66,54,42)}
</g>
${fist(332,332,-14,1)}
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
 ${forearm(R0,R1,56,42,['#2a98b4','#6ee0d8','#e0fffa'])}
 ${bracer(R0,R1,.3,.68,56,42)}
</g>
${fist(170,338,196,1)}
<!-- HEAD -->
<path d="M206,152 q-12,2 -10,18 q4,10 12,6" fill="url(#skinH)" stroke="${OL}" stroke-width="2.2"/><path d="M294,152 q12,2 10,18 q-4,10 -12,6" fill="url(#skinH)" stroke="${OL}" stroke-width="2.2"/>
<path d="M199,178 a6.5,6.5 0 1 0 0.1,0" fill="none" stroke="url(#goldA)" stroke-width="3.4"/>
<path d="${head}" fill="url(#skin)" stroke="${OL}" stroke-width="2.6"/>
<g clip-path="url(#headC)">
 <path d="M206,120 C206,170 214,196 232,208 L206,208Z" fill="#12285a" opacity=".5"/>
 <path d="M290,120 C292,160 288,184 276,200" fill="none" stroke="#c8fff6" stroke-width="6" opacity=".7" filter="url(#b2)"/>
 <path d="M212,126 Q250,138 288,126 L288,138 Q250,150 212,138Z" fill="#12285a" opacity=".55"/>
 <path d="M236,150 Q232,166 238,174 Q250,180 262,174" fill="none" stroke="#12285a" stroke-width="2.6" opacity=".6"/>
 <path d="M258,152 Q264,168 262,174" fill="none" stroke="#c8fff6" stroke-width="2" opacity=".7"/>
 <rect x="200" y="96" width="100" height="120" filter="url(#grain)" opacity=".4"/>
</g>
<!-- EYES -->
<g>
 <path d="M219,150 Q231,141 244,149 Q232,156 219,150Z" fill="#f4fff8" stroke="${OL}" stroke-width="1.6"/><circle cx="232.5" cy="149.5" r="4.6" fill="#f0a020"/><circle cx="232.5" cy="149.5" r="2.2" fill="#140a28"/><circle cx="231" cy="148" r="1.2" fill="#fff"/>
 <path d="M257,149 Q269,141 282,150 Q269,156 257,149Z" fill="#f4fff8" stroke="${OL}" stroke-width="1.6"/><circle cx="270" cy="149.5" r="4.6" fill="#f0a020"/><circle cx="270" cy="149.5" r="2.2" fill="#140a28"/><circle cx="268.5" cy="148" r="1.2" fill="#fff"/>
 <path d="M215,150 Q231,138 246,148 L244,151 Q231,145 217,153Z" fill="${OL}"/><path d="M255,148 Q270,138 286,150 L284,153 Q270,145 255,151Z" fill="${OL}"/>
 <path d="M214,152 L205,157 M286,152 L295,157" stroke="${OL}" stroke-width="2.4" stroke-linecap="round"/>
 <path d="M216,136 Q232,124 248,134 L247,138 Q232,131 217,141Z" fill="${OL}"/><path d="M254,131 Q272,120 288,130 L287,135 Q272,127 254,136Z" fill="${OL}"/>
</g>
<!-- NOSE -->
<path d="M250,150 Q246,168 242,174 Q250,180 258,174" fill="none" stroke="#0e3a66" stroke-width="2.2" opacity=".7"/>
<!-- BEARD + MUSTACHE -->
<path d="M206,150 C200,188 222,222 250,242 C278,222 300,188 294,150 C290,168 280,176 270,180 C260,186 240,186 230,180 C220,176 210,168 206,150Z" fill="url(#beard)" stroke="${OL}" stroke-width="2.2"/>
<path d="M214,176 C222,186 234,186 244,180 M290,176 C282,186 266,186 256,180" fill="none" stroke="#6a7aa8" stroke-width="1.6" opacity=".7"/>
<path d="M230,214 C240,226 246,230 250,238 M270,214 C262,226 256,230 250,238" fill="none" stroke="#5a6a98" stroke-width="1.6" opacity=".6"/>
<path d="M224,176 C232,168 246,170 250,176 C246,184 232,184 224,176Z" fill="#06060f" stroke="${OL}" stroke-width="1.6"/><path d="M276,176 C268,168 254,170 250,176 C254,184 268,184 276,176Z" fill="#14142a" stroke="${OL}" stroke-width="1.6"/>
<path d="M222,177 C214,174 208,166 210,160 M278,177 C286,174 292,166 290,160" fill="none" stroke="#06060f" stroke-width="3.4" stroke-linecap="round"/>
<path d="M240,188 Q250,192 262,186" fill="none" stroke="#e8a090" stroke-width="2" opacity=".7"/>
<path d="M236,191 Q250,197 266,188" fill="none" stroke="#06060f" stroke-width="2.4" stroke-linecap="round"/>
<rect x="244" y="232" width="12" height="7" rx="3" fill="url(#goldA)" stroke="${OL}" stroke-width="1.8"/>
<!-- TURBAN -->
<path d="M200,128 C192,76 308,76 300,128 Q250,108 200,128Z" fill="url(#plum)" stroke="${OL}" stroke-width="2.6"/>
<path d="M214,66 C214,36 288,36 288,66 C300,76 304,100 298,124 C282,108 218,108 202,124 C196,100 200,76 214,66Z" fill="url(#plum)" stroke="${OL}" stroke-width="2.6"/>
<g fill="none" stroke-linecap="round">
 <path d="M204,118 C230,98 270,100 298,116" stroke="#1a0a3a" stroke-width="2.6"/><path d="M204,106 C232,86 272,88 300,104" stroke="#1a0a3a" stroke-width="2.4" opacity=".8"/>
 <path d="M208,92 C234,72 270,74 296,90" stroke="#1a0a3a" stroke-width="2.4" opacity=".7"/><path d="M218,70 C240,56 266,58 286,70" stroke="#1a0a3a" stroke-width="2.2" opacity=".7"/>
 <path d="M206,114 C232,95 272,97 297,112" stroke="#ffc0d0" stroke-width="2" opacity=".6"/><path d="M210,88 C236,69 272,71 296,87" stroke="#ffc0d0" stroke-width="1.8" opacity=".55"/>
 <path d="M226,40 C250,34 276,40 284,56" stroke="#ffd0e0" stroke-width="3" opacity=".6"/>
 <path d="M200,126 C250,104 250,104 300,124" stroke="url(#goldA)" stroke-width="5"/>
</g>
<path d="M232,100 C240,92 262,92 270,100 C268,114 236,114 232,100Z" fill="url(#goldA)" stroke="${OL}" stroke-width="2.2"/><ellipse cx="251" cy="103" rx="8" ry="6.5" fill="url(#rubyC)" stroke="${OL}" stroke-width="1.6"/><ellipse cx="248" cy="100.5" rx="2.6" ry="1.8" fill="#fff" opacity=".85"/>
<!-- plume -->
<path d="M252,96 C250,60 276,22 322,10 C300,34 292,54 288,74 C272,84 258,92 252,96Z" fill="#1fa5b8" stroke="${OL}" stroke-width="2"/><path d="M254,92 C256,60 280,30 316,14" fill="none" stroke="#e8fffc" stroke-width="2.2" opacity=".85"/><path d="M262,88 C270,66 288,44 308,28 M270,82 C280,66 292,56 304,44" fill="none" stroke="#0a4a70" stroke-width="1.4" opacity=".6"/>
<path d="M300,34 q12,-4 18,4" fill="none" stroke="#f0c060" stroke-width="3"/>
<!-- sparks -->
<g fill="#fff6c8"><path d="M96 330 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M420 410 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z" opacity=".8"/><path d="M382 596 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" opacity=".8"/></g>
</svg>`;
fs.writeFileSync(__dirname+'/character.svg',svg);
fs.writeFileSync(__dirname+'/character.html',`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#2a1640">${svg}</body>`);
