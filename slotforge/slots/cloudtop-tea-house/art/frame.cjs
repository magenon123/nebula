const fs=require('fs');const {P,N,E,SH,INK}=require('./scene.cjs');
const D='/home/user/nebula/slotforge/slots/cloudtop-tea-house/';
// ---------------- FRAME ----------------
const brassCorner=(x,y,sx,sy)=>`<g transform="translate(${x} ${y}) scale(${sx} ${sy})">`+P('M0 0 H62 V12 H14 V62 H0Z','#d4ae52',4)+`<path d="M3 3 H60 M3 3 V60" stroke="#f3dc8c" stroke-width="3" fill="none"/>`+E(32,6,0.01,0.01,'none',0)+`<circle cx="40" cy="6" r="3.4" fill="#f3dc8c" stroke="${INK}" stroke-width="2"/><circle cx="6" cy="40" r="3.4" fill="#f3dc8c" stroke="${INK}" stroke-width="2"/><circle cx="6" cy="6" r="5" fill="#b7801f" stroke="${INK}" stroke-width="2.4"/></g>`;
let f=`<!-- frame: tansu (drawer chest). SVG origin = stage (450,160), 700x560. Board window (30,28)-(670,540) = stage (480,188) 640x512; 5 cols x 4 rows of 128px cells. -->
<svg id="frameArt" viewBox="0 0 700 560" filter="url(#roughC)" stroke-linejoin="round" stroke-linecap="round">
 <ellipse cx="360" cy="556" rx="330" ry="9" fill="#2a1a40" opacity=".3"/>
 ${P('M-2 10 H702 V548 H-2Z','#5a3520',6)}
 <path d="M4 14 H696 M4 14 V544" stroke="#9a6238" stroke-width="5" fill="none"/>
 <path d="M698 18 V544 H6" stroke="#3a2216" stroke-width="6" fill="none"/>
 ${P('M-8 0 H708 V16 H-8Z','#c18a55',5)}<path d="M-4 4 H704" stroke="#e8b982" stroke-width="3" fill="none"/>
 ${P('M-4 540 H704 V556 H-4Z','#7a4a2e',5)}<path d="M0 544 H700" stroke="#a86a3c" stroke-width="3" fill="none"/>
 ${P('M20 556 H64 V566 H20Z M636 556 H680 V566 H636Z','#54301c',4)}
 <g fill="none" stroke="#3a2216" stroke-width="2.4" opacity=".5"><path d="M10 80 Q14 200 9 330 M18 360 Q14 440 20 520 M690 60 Q686 190 691 300 M682 340 Q688 430 683 520 M120 20 Q300 25 470 20 M250 536 Q420 532 600 537"/></g>
 <g fill="none" stroke="#c18a55" stroke-width="2.4" opacity=".55"><path d="M8 100 Q11 200 8 300 M692 96 Q689 200 692 290"/></g>
 <!-- brass straps and corner caps -->
 ${P('M0 120 H30 V150 H0Z M0 410 H30 V440 H0Z M670 120 H700 V150 H670Z M670 410 H700 V440 H670Z','#d4ae52',4)}
 ${P('M0 128 H30 M0 142 H30','none',0)}
 <g fill="#f3dc8c" stroke="${INK}" stroke-width="2"><circle cx="9" cy="135" r="3.4"/><circle cx="21" cy="135" r="3.4"/><circle cx="9" cy="425" r="3.4"/><circle cx="21" cy="425" r="3.4"/><circle cx="679" cy="135" r="3.4"/><circle cx="691" cy="135" r="3.4"/><circle cx="679" cy="425" r="3.4"/><circle cx="691" cy="425" r="3.4"/></g>
 ${brassCorner(0,10,1,1)}${brassCorner(700,10,-1,1)}${brassCorner(0,550,1,-1)}${brassCorner(700,550,-1,-1)}
 <!-- top rail: brass studs and a small cloud crest -->
 <g fill="#d4ae52" stroke="${INK}" stroke-width="2.2">${[100,160,220,280,420,480,540,600].map(x=>`<circle cx="${x}" cy="20" r="3.6"/>`).join('')}</g>
 ${P('M330 6 Q340 -6 352 2 Q364 -8 376 2 Q388 -6 396 6 Q364 18 330 6Z','#fbf1dc',3.2)}
 <!-- the window: dark lacquer cavity, inner shadow upper left (light comes from the left) -->
 ${P('M28 26 H672 V542 H28Z','#d4ae52',5)}
 <rect x="32" y="30" width="636" height="508" fill="#2a1c28" stroke="${INK}" stroke-width="4"/>
 <path d="M34 32 H666 V50 H34Z M34 32 H52 V536 H34Z" fill="#000" opacity=".28"/>
</svg>
<div id="frame"><div id="grid"></div><div id="fxl"></div>
 <svg id="frameFx" viewBox="0 0 640 512" filter="url(#roughS)" stroke-linecap="round">
  <g id="drawers">${[128,256,384,512].map(x=>`<path d="M${x} 0 V512" stroke="${INK}" stroke-width="11"/><path d="M${x} 0 V512" stroke="#7a4a2e" stroke-width="6"/><path d="M${x-2} 0 V512" stroke="#c18a55" stroke-width="1.8"/>`).join('')}
  ${[128,256,384].map(y=>`<path d="M0 ${y} H640" stroke="${INK}" stroke-width="11"/><path d="M0 ${y} H640" stroke="#7a4a2e" stroke-width="6"/><path d="M0 ${y-2} H640" stroke="#c18a55" stroke-width="1.8"/>`).join('')}
  ${[128,256,384,512].flatMap(x=>[128,256,384].map(y=>`<circle cx="${x}" cy="${y}" r="6" fill="#d4ae52" stroke="${INK}" stroke-width="2.6"/><circle cx="${x-1.5}" cy="${y-1.5}" r="1.8" fill="#f3dc8c"/>`)).join('')}</g>
 </svg></div>`;
fs.writeFileSync(D+'frame.html',f);
// ---------------- SIDE: four kite gates, one per row ----------------
const gate=(i,y)=>`<div class="gate g${i}" style="top:${y}px"><svg viewBox="0 0 80 80" filter="url(#roughS)" stroke-linejoin="round" stroke-linecap="round">
  <rect x="3" y="3" width="74" height="74" rx="10" fill="#fff1d0" stroke="${INK}" stroke-width="4"/><path d="M8 8 H72" stroke="#fff" stroke-width="3" opacity=".8"/>
  <ellipse cx="42" cy="73" rx="26" ry="3" fill="#2a1a40" opacity=".25"/>
  <g class="gOff"><path d="M12 72 V24 M68 72 V24" stroke="${INK}" stroke-width="13"/><path d="M12 72 V24 M68 72 V24" stroke="#a8998a" stroke-width="7"/><path d="M2 24 Q40 16 78 24 L74 12 Q40 4 6 12Z" fill="#8c7e72" stroke="${INK}" stroke-width="4"/><path d="M12 38 H68" stroke="${INK}" stroke-width="9"/><path d="M12 38 H68" stroke="#a8998a" stroke-width="5"/></g>
  <g class="gOn"><circle cx="40" cy="38" r="44" fill="url(#ctLampG)" opacity=".8"/><path d="M12 72 V24 M68 72 V24" stroke="${INK}" stroke-width="13"/><path d="M12 72 V24 M68 72 V24" stroke="#d9432e" stroke-width="7"/><path d="M2 24 Q40 16 78 24 L74 12 Q40 4 6 12Z" fill="#1c2340" stroke="${INK}" stroke-width="4"/><path d="M5 20 Q40 12 75 20" stroke="#d9432e" stroke-width="5" fill="none"/><path d="M12 38 H68" stroke="${INK}" stroke-width="9"/><path d="M12 38 H68" stroke="#d9432e" stroke-width="5"/><path d="M33 24 H47 V36 H33Z" fill="#e9b43c" stroke="${INK}" stroke-width="2.6"/></g>
  <g class="gKite"><path d="M40 60 L47 52 L40 44 L33 52Z" fill="#f2d23a" stroke="${INK}" stroke-width="2.6"/><path d="M40 44 V60 M33 52 H47" stroke="${INK}" stroke-width="1.4"/><path d="M40 60 Q36 66 40 70" stroke="${INK}" stroke-width="2" fill="none"/></g>
 </svg></div>`;
const side=`<!-- Kite Launch gates: one torii per board row, left of the tansu, aligned with the rows (row centers y=252,380,508,636). kai toggles .on on #gates > .gN; .launch plays the little kite -->
<div id="gates">${[0,1,2,3].map(i=>gate(i,252+128*i-40)).join('')}</div>
`;
fs.writeFileSync(D+'side.html',side);
// ---------------- LOGO ----------------
const FF="font-family=\"Luckiest Guy,Impact,Arial Black,sans-serif\"";
const L1=(dx,dy,mode)=>{ // mode: shadow | ink | face
  const rot1='rotate="-4 3 -2"', rot2='rotate="2 -3 3 -2 3"';
  const common=`${FF} font-size="82"`;
  const fill=mode==='shadow'?'#d9432e':mode==='ink'?INK:'#fbf1dc';
  const sw=mode==='face'?3:22;
  const st=mode==='face'?'#fbf1dc':(mode==='shadow'?INK:INK);
  return `<g transform="translate(${dx} ${dy})" fill="${fill}" stroke="${st}" stroke-width="${sw}" stroke-linejoin="round">
   <text x="40" y="84" ${common} textLength="104" lengthAdjust="spacingAndGlyphs" ${rot1} dy="0 -3">CL</text>
   <text x="218" y="84" ${common} textLength="344" lengthAdjust="spacingAndGlyphs" ${rot2} dy="-2 3 -3 2 -1">UDTOP</text></g>`;
};
const sun=(dx,dy,mode)=>{const cx=186+dx,cy=56+dy;
  if(mode==='shadow') return `<circle cx="${cx}" cy="${cy}" r="37" fill="#d9432e" stroke="${INK}" stroke-width="22"/>`;
  if(mode==='ink') return `<circle cx="${cx}" cy="${cy}" r="37" fill="${INK}" stroke="${INK}" stroke-width="22"/>`;
  return `<circle cx="${cx}" cy="${cy}" r="37" fill="#ffe28a" stroke="#fbf1dc" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="25" fill="#ffc83a"/><path d="M${cx-16} ${cy-6} Q${cx} ${cy-20} ${cx+16} ${cy-6}" stroke="#fff6c8" stroke-width="5" fill="none" stroke-linecap="round"/>`;};
const logo=`<svg id="logo" viewBox="0 0 660 150" filter="url(#roughC)" overflow="visible">
 <defs><clipPath id="ctLogoLow"><rect x="0" y="62" width="660" height="40"/></clipPath></defs>
 <g stroke-linejoin="round" stroke-linecap="round">
  ${L1(5,7,'shadow')}${sun(5,7,'shadow')}
  ${L1(0,0,'ink')}${sun(0,0,'ink')}
  ${L1(0,0,'face')}${sun(0,0,'face')}
  <g clip-path="url(#ctLogoLow)" fill="#e8b982" opacity=".55" stroke="none"><text x="218" y="84" ${FF} font-size="82" textLength="344" lengthAdjust="spacingAndGlyphs" rotate="2 -3 3 -2 3" dy="-2 3 -3 2 -1">UDTOP</text><text x="40" y="84" ${FF} font-size="82" textLength="104" lengthAdjust="spacingAndGlyphs" rotate="-4 3 -2" dy="0 -3">CL</text></g>
  <!-- tiny kite hanging off the P -->
  <g class="lgKite"><path d="M566 62 Q584 84 590 98" stroke="${INK}" stroke-width="2.6" fill="none"/>
   <g transform="translate(594 112) rotate(14)"><path d="M0 -16 L11 0 L0 16 L-11 0Z" fill="#f59db8" stroke="${INK}" stroke-width="3.2"/><path d="M0 -16 V16 M-11 0 H11" stroke="${INK}" stroke-width="1.6"/><path d="M0 16 Q-6 24 0 30 Q6 36 0 42" stroke="${INK}" stroke-width="2.6" fill="none"/><path d="M-5 28 l5 3 l-5 3Z M5 38 l-5 3 l5 3Z" fill="#d9432e" stroke="${INK}" stroke-width="1.6"/></g></g>
  <!-- noren cloth -->
  <g class="nor">
   <path d="M168 88 H492" stroke="${INK}" stroke-width="12"/><path d="M168 88 H492" stroke="#c18a55" stroke-width="6"/>
   <circle cx="166" cy="88" r="8" fill="#7a4a2e" stroke="${INK}" stroke-width="3.4"/><circle cx="494" cy="88" r="8" fill="#7a4a2e" stroke="${INK}" stroke-width="3.4"/>
   ${[0,1,2].map(k=>{const x0=[176,276,382][k],x1=[272,378,484][k],fr=[0,1,2][k];
     return `<g class="np np${k}" style="transform-origin:${(x0+x1)/2}px 92px"><path d="M${x0} 92 H${x1} L${x1-2} 118 L${x1} 146 L${x1-10} 140 L${x1-18} 148 L${x1-30} 140 L${x1-40} 148 L${x1-52} 141 L${x1-62} 148 L${x1-74} 140 L${x0+8} 147 L${x0+2} 140 L${x0} 146Z" fill="#2f3f86" stroke="${INK}" stroke-width="4.4"/><path d="M${x0+5} 96 H${x1-5}" stroke="#5a6ec0" stroke-width="3.4"/><path d="M${x1-14} 100 V138" stroke="#1c2a64" stroke-width="5" opacity=".5"/></g>`}).join('')}
   <g ${FF} font-size="36" fill="#fbf1dc" stroke="${INK}" stroke-width="5" paint-order="stroke" stroke-linejoin="round" text-anchor="middle"><text x="330" y="124" textLength="270" lengthAdjust="spacingAndGlyphs">TEA HOUSE</text></g>
   <g transform="translate(330 134)"><path d="M-26 0 q26 -8 52 0" stroke="#e9b43c" stroke-width="3" fill="none" opacity="0"/></g>
  </g>
 </g>
</svg>`;
fs.writeFileSync(D+'logo.html',logo);
console.log('frame/side/logo ok');
