// Sirocco's Lamp Bazaar background 1280x720. ONE light: low sun right/behind (SUN_X,SUN_Y). node gen-bg.cjs -> background-clean.svg, background.svg (reel marker)
const fs=require('fs');
let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const W=1280,H=720,SX=1010,SY=318;
const f=n=>n.toFixed(1);
// ridge path via summed sines, returns polygon points string
function ridge(y0,amp,freqs,x0=-20,x1=W+20,step=10,ph=0){let pts=[];for(let x=x0;x<=x1;x+=step){let y=y0;freqs.forEach(([a,fr,p],i)=>{y+=amp*a*Math.sin(x*fr+p+ph)});pts.push([x,y]);}return pts;}
const poly=(pts,bot)=>`M${pts.map(p=>f(p[0])+','+f(p[1])).join(' L')} L${pts[pts.length-1][0]},${bot} L${pts[0][0]},${bot}Z`;
const lineP=pts=>`M${pts.map(p=>f(p[0])+','+f(p[1])).join(' L')}`;
// ---- dunes: lit side faces the sun (right side of a crest slopes lit when slope faces +x) ----
function dune(y0,amp,fr,ph,fillA,fillB,litA,hazeOp,id,ripples){
  const pts=ridge(y0,amp,[[1,fr,0],[.45,fr*2.3,1.3],[.2,fr*5.1,.4]],-20,W+20,8,ph);
  // lit slopes: segments where dy/dx<0 (rising to the right => facing... ) we light segments descending to the right (face sun at right)
  let lit='';
  for(let i=1;i<pts.length;i++){const dy=pts[i][1]-pts[i-1][1]; if(dy>0.6){ // descending to the right = faces +x
     lit+=`M${pts[i-1][0]},${f(pts[i-1][1])} L${pts[i][0]},${f(pts[i][1])} L${pts[i][0]},${f(pts[i][1]+14+dy*8)} L${pts[i-1][0]},${f(pts[i-1][1]+14+dy*8)}Z `;}}
  let rip='';if(ripples){for(let k=0;k<ripples;k++){const yy=y0+amp*1.2+rnd()*(H-y0-amp*1.2)*.6;const xs=rnd()*W;let d=`M${xs},${yy}`;for(let j=1;j<7;j++)d+=` q8,${(rnd()-.5)*3} 16,${(rnd()-.5)*1.2}`;rip+=`<path d="${d}" fill="none" stroke="${litA}" stroke-width="1.1" opacity=".22"/>`;}}
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fillA}"/><stop offset="1" stop-color="${fillB}"/></linearGradient><linearGradient id="${id}L" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${litA}" stop-opacity=".95"/><stop offset="1" stop-color="${litA}" stop-opacity="0"/></linearGradient></defs>
  <path d="${poly(pts,H)}" fill="url(#${id})"/><path d="${lit}" fill="url(#${id}L)" opacity=".7" filter="url(#b3)"/>${rip}<path d="${lineP(pts)}" fill="none" stroke="${litA}" stroke-width="1.6" opacity=".55"/>
  <rect x="0" y="${y0-amp*1.6}" width="${W}" height="${H}" fill="#ff9a4a" opacity="${hazeOp}"/>`;
}
// ---- skyline silhouette ----
function skyline(x0,x1,base,seedOff,col,rimCol,scale){
  let s='',rim='';let x=x0;seed+=seedOff;
  while(x<x1){
    const t=rnd();const w=(26+rnd()*40)*scale;const h=(28+rnd()*52)*scale;
    if(t<.3){ // dome building
      const r=w*.5;s+=`<rect x="${f(x)}" y="${f(base-h)}" width="${f(w)}" height="${f(h+30)}" fill="${col}"/><path d="M${f(x-3)},${f(base-h)} a${f(r+3)},${f(r*1.05)} 0 0 1 ${f(w+6)},0Z" fill="${col}"/><rect x="${f(x+w*.5-1)}" y="${f(base-h-r*1.05-9)}" width="2" height="9" fill="${col}"/>`;
      rim+=`<path d="M${f(x+w*.5+r*.55)},${f(base-h-r*.72)} A${f(r+3)},${f(r*1.05)} 0 0 1 ${f(x+w+3)},${f(base-h)} L${f(x+w)},${f(base+10)}" fill="none" stroke="${rimCol}" stroke-width="1.6" opacity=".8"/>`;
    } else if(t<.55){ // minaret
      const mw=7*scale+rnd()*3,mh=(70+rnd()*60)*scale;s+=`<rect x="${f(x)}" y="${f(base-mh)}" width="${f(mw)}" height="${f(mh+30)}" fill="${col}"/><rect x="${f(x-3)}" y="${f(base-mh*.72)}" width="${f(mw+6)}" height="4" fill="${col}"/><path d="M${f(x-1)},${f(base-mh)} L${f(x+mw/2)},${f(base-mh-24*scale)} L${f(x+mw+1)},${f(base-mh)}Z" fill="${col}"/><rect x="${f(x-2)}" y="${f(base-mh-2)}" width="${f(mw+4)}" height="3" fill="${col}"/>`;
      rim+=`<path d="M${f(x+mw)},${f(base-mh)} L${f(x+mw)},${f(base+10)}" stroke="${rimCol}" stroke-width="1.4" opacity=".85"/><path d="M${f(x+mw/2)},${f(base-mh-24*scale)} L${f(x+mw+1)},${f(base-mh)}" stroke="${rimCol}" stroke-width="1.3" opacity=".85"/>`;
    } else { // flat house w/ arches
      s+=`<rect x="${f(x)}" y="${f(base-h*.7)}" width="${f(w)}" height="${f(h*.7+30)}" fill="${col}"/>`;
      rim+=`<path d="M${f(x+w)},${f(base-h*.7)} L${f(x+w)},${f(base+10)}" stroke="${rimCol}" stroke-width="1.4" opacity=".7"/>`;
    }
    x+=w*(.75+rnd()*.3);
  }
  return s+rim;
}
// ---- sky ----
let stars='';for(let i=0;i<110;i++){const x=rnd()*W,y=Math.pow(rnd(),1.8)*230;stars+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(.5+rnd()*.9)}" fill="#fff" opacity="${f(.2+rnd()*.5)}"/>`;}
let clouds='';for(let i=0;i<14;i++){const x=rnd()*W,y=120+rnd()*190,w=140+rnd()*300,h=5+rnd()*9;
  const near=Math.max(0,1-Math.hypot(x-SX,(y-SY)*.8)/700);
  clouds+=`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(h)}" fill="#3a1d56" opacity=".55"/><ellipse cx="${f(x+w*.12)}" cy="${f(y+h*.55)}" rx="${f(w*.8)}" ry="${f(h*.45)}" fill="#ffb25e" opacity="${f(.25+near*.6)}"/>`;}
// god rays
let rays='';for(let i=0;i<22;i++){const a=(-95+rnd()*190)*Math.PI/180+Math.PI*0,len=900;const a0=Math.PI+ (rnd()-.5)*2.6;const a1=a0+.03+rnd()*.05;rays+=`<path d="M${SX},${SY} L${f(SX+len*Math.cos(a0))},${f(SY+len*Math.sin(a0)*0.9)} L${f(SX+len*Math.cos(a1))},${f(SY+len*Math.sin(a1)*0.9)}Z" fill="url(#ray)" opacity="${f(.35+rnd()*.5)}"/>`;}
// rooftops layer (mid) with awnings
function rooftops(){let s='',lit='';let x=-20;
  const cols=['#b3203f','#1fa5b8','#f2b53a','#7a2c6e'];
  while(x<W+20){const w=60+rnd()*70,h=26+rnd()*34,y=528-h;
    s+=`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h+130)}" fill="url(#roofShade)"/>`;
    lit+=`<rect x="${f(x+w-5)}" y="${f(y)}" width="5" height="${f(h+30)}" fill="#ffb25e" opacity=".5"/><rect x="${f(x)}" y="${f(y-3)}" width="${f(w)}" height="4" fill="#ffc77a" opacity=".6"/>`;
    // arched window (dark) + awning
    for(let k=0;k<2;k++){const wx=x+10+k*(w/2.1);if(wx+16<x+w-6){s+=`<path d="M${f(wx)},${f(y+h*.75)} v-18 a8,8 0 0 1 16,0 v18Z" fill="#241038"/>`;lit+=`<path d="M${f(wx+16)},${f(y+h*.75)} v-18" stroke="#ffb25e" stroke-width="1.2" opacity=".35"/>`;}}
    const c=cols[Math.floor(rnd()*4)];
    s+=`<path d="M${f(x+4)},${f(y+h*.38)} h${f(w-8)} l4,12 h-${f(w)}Z" fill="${c}" opacity=".85"/>`;
    for(let k=0;k<w-8;k+=10)s+=`<path d="M${f(x+4+k)},${f(y+h*.38)} h5 l1,12 h-4Z" fill="#14081f" opacity=".28"/>`;
    lit+=`<path d="M${f(x+w-4)},${f(y+h*.38)} h4 l4,12 h-4Z" fill="#ffc77a" opacity=".5"/>`;
    // parapet crenel dots
    x+=w+ (rnd()*6);}
  return s+lit;}
// floor tiles in perspective
function floor(){let s='';const y0=592;
  for(let r=0;r<9;r++){const t=r/9,y=y0+Math.pow(t,1.5)*(H-y0);s+=`<line x1="0" y1="${f(y)}" x2="${W}" y2="${f(y)}" stroke="#1a0a2a" stroke-width="${f(.8+t*1.6)}" opacity=".5"/>`;}
  for(let c=-14;c<=14;c++){const x1=W/2+c*30,x2=W/2+c*118;s+=`<line x1="${f(x1)}" y1="${y0}" x2="${f(x2)}" y2="${H}" stroke="#1a0a2a" stroke-width="1.2" opacity=".42"/>`;}
  return s;}
// balusters
function balusters(){let s='';for(let x=-10;x<W;x+=46){s+=`<g><path d="M${x+6},548 q-5,12 0,20 q-6,10 0,30 L${x+26},598 q6,-20 0,-30 q5,-8 0,-20Z" fill="url(#balu)"/><path d="M${x+26},548 q5,12 0,20 q6,10 0,30" fill="none" stroke="#ffc77a" stroke-width="1.6" opacity=".55"/></g>`;}return s;}
// foreground arch (pointed horseshoe); opening x 168..1112
const OP=`M86,${H+10} L86,360 C86,170 380,10 640,-70 C900,10 1194,170 1194,360 L1194,${H+10}Z`;
const OP2=`M134,${H+10} L134,366 C134,200 400,60 640,-24 C880,60 1146,200 1146,366 L1146,${H+10}Z`; // inner moulding
function lamp(x,y,s){return `<g transform="translate(${x},${y}) scale(${s})"><line x1="0" y1="-300" x2="0" y2="0" stroke="#1c0b22" stroke-width="2.4"/><line x1="1.6" y1="-300" x2="1.6" y2="0" stroke="#ffb25e" stroke-width="1" opacity=".6"/>
 <path d="M-8,0 h16 l8,10 h-32z" fill="#3b1c10"/><path d="M-26,10 C-34,34 -26,56 -12,66 L12,66 C26,56 34,34 26,10Z" fill="url(#lampBr)"/><path d="M22,16 C27,36 22,54 12,64" stroke="#ffe08a" stroke-width="2" fill="none" opacity=".8"/><path d="M-26,10 h52" stroke="#1c0b22" stroke-width="2.4"/><circle cx="0" cy="70" r="5" fill="url(#lampBr)"/><path d="M-12,66 q12,10 24,0" fill="#2a1006"/>
 <path d="M-14,26 q14,8 28,0 M-17,40 q17,9 34,0" stroke="#2a0e04" stroke-width="1.8" fill="none" opacity=".6"/></g>`;}
const body=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1450"/><stop offset=".22" stop-color="#3a1b6a"/><stop offset=".38" stop-color="#7a2c75"/><stop offset=".49" stop-color="#d4506a"/><stop offset=".55" stop-color="#ff8f3e"/><stop offset=".62" stop-color="#ffc66a"/></linearGradient>
<radialGradient id="sunGlow" cx="${SX}" cy="${SY}" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff4c8" stop-opacity="1"/><stop offset=".08" stop-color="#ffd27a" stop-opacity=".95"/><stop offset=".25" stop-color="#ff9a3a" stop-opacity=".55"/><stop offset=".6" stop-color="#d9406a" stop-opacity=".18"/><stop offset="1" stop-color="#d9406a" stop-opacity="0"/></radialGradient>
<radialGradient id="sunDisc" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".8" stop-color="#fff0b8"/><stop offset="1" stop-color="#ffd98a"/></radialGradient>
<linearGradient id="ray" gradientUnits="userSpaceOnUse" x1="${SX}" y1="${SY}" x2="${SX-700}" y2="${SY}"><stop offset="0" stop-color="#ffe3a0" stop-opacity=".3"/><stop offset="1" stop-color="#ffe3a0" stop-opacity="0"/></linearGradient>
<linearGradient id="roofShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a2a62"/><stop offset=".5" stop-color="#3e1d52"/><stop offset="1" stop-color="#2a1240"/></linearGradient>
<linearGradient id="balu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a1236"/><stop offset=".6" stop-color="#5b2d5a"/><stop offset="1" stop-color="#c8764a"/></linearGradient>
<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3623c"/><stop offset=".5" stop-color="#6a3358"/><stop offset="1" stop-color="#2c1440"/></linearGradient>
<radialGradient id="floorLight" cx="${SX}" cy="600" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb860" stop-opacity=".7"/><stop offset="1" stop-color="#ffb860" stop-opacity="0"/></radialGradient>
<linearGradient id="stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#150a26"/><stop offset=".6" stop-color="#2a1440"/><stop offset="1" stop-color="#4a2552"/></linearGradient>
<linearGradient id="reveal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb25e" stop-opacity=".95"/><stop offset="1" stop-color="#ff8a3e" stop-opacity=".55"/></linearGradient>
<linearGradient id="revealDark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a0c2a"/><stop offset="1" stop-color="#2c1642"/></linearGradient>
<radialGradient id="lampBr" cx=".7" cy=".3" r=".9"><stop offset="0" stop-color="#fff0a8"/><stop offset=".35" stop-color="#e5972a"/><stop offset="1" stop-color="#4a2008"/></radialGradient>
<filter id="b1"><feGaussianBlur stdDeviation="1.2"/></filter><filter id="b3"><feGaussianBlur stdDeviation="3"/></filter><filter id="b8"><feGaussianBlur stdDeviation="8"/></filter><filter id="b20"><feGaussianBlur stdDeviation="20"/></filter>
<filter id="stoneTex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035 .05" numOctaves="4" seed="3" result="n"/><feDiffuseLighting in="n" surfaceScale="2.4" lighting-color="#ffb070" diffuseConstant="1.1"><feDistantLight azimuth="20" elevation="24"/></feDiffuseLighting><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="8"/><feColorMatrix values="0 0 0 0 .06  0 0 0 0 .02  0 0 0 0 .12  0 0 0 .6 -.22"/></filter>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#0c0418" stop-opacity="0"/><stop offset="1" stop-color="#0c0418" stop-opacity=".7"/></radialGradient>
<clipPath id="openC"><path d="${OP}"/></clipPath>
<mask id="outsideM"><rect width="${W}" height="${H}" fill="#fff"/><path d="${OP}" fill="#000"/></mask>
<pattern id="zellige" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M19 2 L25 13 L36 19 L25 25 L19 36 L13 25 L2 19 L13 13Z" fill="none" stroke="#e8a64a" stroke-width="1" opacity=".5"/><circle cx="19" cy="19" r="3" fill="#1fa5b8" opacity=".5"/></pattern>
</defs>
<!-- SKY -->
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<g>${stars}</g>
<rect width="${W}" height="${H}" fill="url(#sunGlow)"/>
<g>${clouds}</g>
<g style="mix-blend-mode:screen">${rays}</g>
<!-- sun -->
<circle cx="${SX}" cy="${SY}" r="80" fill="#fff2c0" opacity=".5" filter="url(#b8)"/>
<circle cx="${SX}" cy="${SY}" r="44" fill="url(#sunDisc)"/>
<!-- far dunes + skyline -->
${dune(398,16,.011,0.4,'#c8607a','#7a3a72','#ffd08a',.12,'d1',0)}
<g filter="url(#b1)" opacity=".92">${skyline(760,1180,408,3,'#7a3068','#ffd08a',1)}${skyline(140,420,414,9,'#6e2c6c','#ffc27a',.8)}</g>
${dune(430,22,.0085,1.8,'#b04a6c','#5e2c66','#ffc27a',.12,'d2',4)}
<g filter="url(#b1)">${skyline(560,760,452,17,'#4e2160','#ffb25e',1.15)}${skyline(-10,160,452,21,'#4a1f5c','#ffb25e',1.2)}</g>
${dune(470,26,.0072,3.3,'#8e3b62','#40204e','#ffb25e',.1,'d3',8)}
<!-- bazaar rooftops -->
<g>${rooftops()}</g>
<rect x="0" y="470" width="${W}" height="140" fill="#ff8a3e" opacity=".12" filter="url(#b8)"/>
<!-- terrace floor -->
<rect x="0" y="592" width="${W}" height="${H-592}" fill="url(#floorG)"/>
<rect x="0" y="592" width="${W}" height="${H-592}" fill="url(#floorLight)"/>
<g>${floor()}</g>
<!-- long shadows falling left/toward viewer from balusters -->
<g opacity=".38" fill="#1a0a2a">${[...Array(28)].map((_,i)=>{const x=i*46+16;return `<path d="M${x},600 L${x-120},716 L${x-98},716 L${x+10},600Z"/>`}).join('')}</g>
<!-- rail -->
<rect x="-10" y="540" width="${W+20}" height="12" fill="url(#balu)"/><rect x="-10" y="540" width="${W+20}" height="3" fill="#ffc77a" opacity=".65"/>
${balusters()}
<rect x="-10" y="596" width="${W+20}" height="14" fill="url(#balu)"/><rect x="-10" y="596" width="${W+20}" height="3" fill="#ffc77a" opacity=".5"/>
<ellipse cx="${SX}" cy="612" rx="360" ry="22" fill="#ffb860" opacity=".28" filter="url(#b8)"/>
<!-- dust haze in the valley and sun shaft motes -->
<rect x="0" y="420" width="${W}" height="190" fill="#ff9a4a" opacity=".10" filter="url(#b20)"/>
<g>${[...Array(26)].map(()=>{const x=380+rnd()*760,y=140+rnd()*470;const near=Math.max(0,1-Math.hypot(x-SX,y-SY)/520);return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(.8+rnd()*1.8)}" fill="#ffe3a0" opacity="${f(.15+near*.55)}"/>`}).join('')}</g>
<!-- FOREGROUND ARCH (in front, backlit => faces in shade, reveals catch sun) -->
<g>
 <path d="M0,0 H${W} V${H} H0Z ${OP}" fill="url(#stone)" fill-rule="evenodd"/>
 <g mask="url(#outsideM)"><rect width="${W}" height="${H}" fill="#7a4a5a" filter="url(#stoneTex)" opacity=".28" style="mix-blend-mode:overlay"/><rect width="${W}" height="${H}" fill="url(#zellige)" opacity=".5"/></g>
 <!-- moulding rings -->
 <path d="${OP}" fill="none" stroke="#12081f" stroke-width="10"/>
 <path d="M86,${H} L86,360 C86,170 380,10 640,-70" fill="none" stroke="url(#reveal)" stroke-width="5"/>
 <path d="M1194,${H} L1194,360 C1194,170 900,10 640,-70" fill="none" stroke="#4a2860" stroke-width="5" opacity=".9"/>
 <!-- reveal band: left inner face lit by sun, right inner face shaded -->
 <path d="M86,${H} L86,360 C86,170 380,10 640,-70 L640,-24 C400,60 134,200 134,366 L134,${H}Z" fill="url(#reveal)" opacity=".55"/>
 <path d="M1194,${H} L1194,360 C1194,170 900,10 640,-70 L640,-24 C880,60 1146,200 1146,366 L1146,${H}Z" fill="url(#revealDark)" opacity=".85"/>
 <path d="${OP2}" fill="none" stroke="#12081f" stroke-width="3" opacity=".8"/>
 <path d="M134,${H} L134,366 C134,200 400,60 640,-24" fill="none" stroke="#ffc77a" stroke-width="1.6" opacity=".7"/>
 <!-- carved column bands -->
 ${[0,1].map(i=>{const x=i?1236:44;return `<rect x="${x-14}" y="140" width="28" height="580" fill="#000" opacity=".16"/><path d="M${x},60 v680" stroke="#ffb25e" stroke-width="1.4" opacity="${i?0.12:0.4}"/>`}).join('')}
 <path d="M30,${H} V120 M${W-30},${H} V120" stroke="#12081f" stroke-width="3" opacity=".6"/>
</g>
<!-- hanging lamps (unlit) with rim light from the sun -->
<g filter="url(#b1)">${lamp(240,330,.95)}</g>
<g filter="url(#b1)">${lamp(1050,324,.95)}</g>
<!-- backlit cloth swags in the top corners, glowing at the edge facing the sun -->
<path d="M0,0 H190 C170,60 120,100 60,150 C30,176 10,230 0,300Z" fill="#8c1e44"/>
<path d="M0,0 H190 C170,60 120,100 60,150" fill="none" stroke="#ff8a5e" stroke-width="4" opacity=".7"/>
<path d="M20,0 C60,80 80,150 10,290" fill="none" stroke="#5a0f2c" stroke-width="3" opacity=".6"/><path d="M60,0 C110,80 120,120 50,200" fill="none" stroke="#5a0f2c" stroke-width="3" opacity=".5"/>
<path d="M${W},0 H${W-190} C${W-170},60 ${W-120},100 ${W-60},150 C${W-30},176 ${W-10},230 ${W},300Z" fill="#12507a"/>
<path d="M${W},0 H${W-190} C${W-170},60 ${W-120},100 ${W-60},150" fill="none" stroke="#6fdcff" stroke-width="3" opacity=".45"/>
<path d="M${W-20},0 C${W-60},80 ${W-80},150 ${W-10},290" fill="none" stroke="#0a2c48" stroke-width="3" opacity=".6"/>
<!-- sun bloom over everything + vignette + grain -->
<rect width="${W}" height="${H}" fill="url(#sunGlow)" opacity=".28" style="mix-blend-mode:screen"/>
<rect width="${W}" height="${H}" fill="url(#vig)"/>
<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".5"/>
`;
fs.writeFileSync(__dirname+'/background-clean.svg',body+'</svg>');
const RX=370,RY=96,RS=540;
fs.writeFileSync(__dirname+'/background.svg',body+`<g><rect x="${RX}" y="${RY}" width="${RS}" height="${RS}" fill="#000" opacity=".35"/><rect x="${RX}" y="${RY}" width="${RS}" height="${RS}" fill="none" stroke="#00ff9a" stroke-width="3" stroke-dasharray="14 8"/><text x="${RX+RS/2}" y="${RY+RS/2}" fill="#00ff9a" font-family="sans-serif" font-size="22" text-anchor="middle">REEL WINDOW 5x5 (540x540)</text></g></svg>`);
