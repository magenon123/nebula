// Genie's Lamp hero symbol on a gold-tier plate. node gen-symbol.cjs -> symbol.svg, symbol.html
const fs=require('fs');
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
// engraved band motifs on a cylinder-ish body
function motifs(cx,cy,R,ry,thMin,thMax,n,sc){
  let dark='',lite='';
  for(let i=0;i<n;i++){
    const th=thMin+(thMax-thMin)*i/(n-1);const s=Math.sin(th),c=Math.cos(th);
    const x=cx+R*s, w=Math.max(.15,c)*sc;
    // palmette: leaf pair with stem
    const p=`M${x},${cy+ry*.9} C${x-9*w},${cy+ry*.4} ${x-10*w},${cy-ry*.5} ${x},${cy-ry*.9} C${x+10*w},${cy-ry*.5} ${x+9*w},${cy+ry*.4} ${x},${cy+ry*.9} Z`;
    const v=`M${x},${cy+ry*.7} L${x},${cy-ry*.55} M${x-6*w},${cy+ry*.1} Q${x-2*w},${cy-ry*.1} ${x},${cy-ry*.2} M${x+6*w},${cy+ry*.1} Q${x+2*w},${cy-ry*.1} ${x},${cy-ry*.2}`;
    dark+=`<path d="${p}" fill="none" stroke="#5a2a0c" stroke-width="${(1.6*Math.max(.4,c)).toFixed(2)}" opacity=".75"/><path d="${v}" fill="none" stroke="#5a2a0c" stroke-width="1.2" opacity=".7"/>`;
    lite+=`<path d="${p}" fill="none" stroke="#ffe7a0" stroke-width="1" opacity=".55" transform="translate(1.1,1.1)"/>`;
  }
  return dark+lite;
}
const body=`M88,246 C88,204 136,190 200,190 C264,190 312,204 312,246 C312,292 266,314 200,314 C134,314 88,292 88,246 Z`;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 400 400" width="400" height="400">
<defs>
<linearGradient id="plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a1f66"/><stop offset=".5" stop-color="#2c1650"/><stop offset="1" stop-color="#170c33"/></linearGradient>
<radialGradient id="plateGlow" cx=".58" cy=".62" r=".62"><stop offset="0" stop-color="#ffb347" stop-opacity=".72"/><stop offset=".45" stop-color="#e0502f" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c0"/><stop offset=".3" stop-color="#f6b93a"/><stop offset=".62" stop-color="#9a5a12"/><stop offset=".85" stop-color="#e8a52c"/><stop offset="1" stop-color="#ffe18a"/></linearGradient>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b2a12"/><stop offset=".18" stop-color="#a8581a"/><stop offset=".38" stop-color="#e79a2c"/><stop offset=".58" stop-color="#ffd668"/><stop offset=".74" stop-color="#f5b23a"/><stop offset=".9" stop-color="#fff0a8"/><stop offset="1" stop-color="#ffcb5a"/></linearGradient>
<linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b8" stop-opacity=".55"/><stop offset=".3" stop-color="#fff2b8" stop-opacity="0"/><stop offset=".72" stop-color="#3a1408" stop-opacity="0"/><stop offset="1" stop-color="#3a1408" stop-opacity=".55"/></linearGradient>
<linearGradient id="goldS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a3d14"/><stop offset=".4" stop-color="#e79a2c"/><stop offset=".7" stop-color="#ffe08a"/><stop offset="1" stop-color="#d98a22"/></linearGradient>
<radialGradient id="bounce" cx=".5" cy="1" r=".6"><stop offset="0" stop-color="#ff7a2a" stop-opacity=".6"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>
<linearGradient id="skyfill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a8cff" stop-opacity=".5"/><stop offset=".5" stop-color="#9a8cff" stop-opacity="0"/></linearGradient>
<radialGradient id="lapis" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#7fe4ff"/><stop offset=".35" stop-color="#1fa5b8"/><stop offset="1" stop-color="#0a2f66"/></radialGradient>
<radialGradient id="ruby" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffb0a8"/><stop offset=".3" stop-color="#e0354f"/><stop offset="1" stop-color="#4a0618"/></radialGradient>
<radialGradient id="smoke" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7ff0e6" stop-opacity=".85"/><stop offset=".6" stop-color="#3aa6d8" stop-opacity=".4"/><stop offset="1" stop-color="#6d4bd8" stop-opacity="0"/></radialGradient>
<filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter><filter id="blur5"><feGaussianBlur stdDeviation="5"/></filter><filter id="blur9"><feGaussianBlur stdDeviation="9"/></filter><filter id="blur14"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .02  0 0 0 .55 -.18"/></filter>
<filter id="frost" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .75  0 0 0 0 .45  0 0 0 .5 -.16"/></filter>
<pattern id="star" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M22 4 L26 14 L36 10 L30 20 L40 22 L30 26 L36 36 L26 30 L22 40 L18 30 L8 36 L14 26 L4 22 L14 20 L8 10 L18 14 Z" fill="none" stroke="#ffcf7a" stroke-width=".9" opacity=".16"/></pattern>
<clipPath id="plateClip"><rect x="14" y="14" width="372" height="372" rx="46"/></clipPath>
<clipPath id="bodyClip"><path d="${body}"/></clipPath>
<linearGradient id="lidG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6a3212"/><stop offset=".3" stop-color="#e79a2c"/><stop offset=".62" stop-color="#ffe08a"/><stop offset=".85" stop-color="#f1a72f"/><stop offset="1" stop-color="#fff0a8"/></linearGradient>
</defs>
<!-- PLATE -->
<g clip-path="url(#plateClip)">
 <rect width="400" height="400" fill="url(#plate)"/>
 <rect width="400" height="400" fill="url(#star)"/>
 <rect width="400" height="400" fill="url(#plateGlow)"/>
 <rect width="400" height="400" filter="url(#frost)" opacity=".5"/>
 <ellipse cx="200" cy="395" rx="230" ry="80" fill="#ff8a30" opacity=".18" filter="url(#blur14)"/>
</g>
<rect x="8" y="8" width="384" height="384" rx="52" fill="none" stroke="url(#rim)" stroke-width="12"/>
<rect x="14.5" y="14.5" width="371" height="371" rx="46" fill="none" stroke="#2a1006" stroke-width="2" opacity=".85"/>
<rect x="2.5" y="2.5" width="395" height="395" rx="57" fill="none" stroke="#2a1006" stroke-width="2.5" opacity=".9"/>
<rect x="19" y="19" width="362" height="362" rx="42" fill="none" stroke="#ffe9a8" stroke-width="1.4" opacity=".4"/>
<!-- corner gems -->
<g><circle cx="38" cy="38" r="7" fill="url(#lapis)" stroke="#2a1006" stroke-width="1.5"/><circle cx="362" cy="38" r="7" fill="url(#lapis)" stroke="#2a1006" stroke-width="1.5"/><circle cx="38" cy="362" r="7" fill="url(#ruby)" stroke="#2a1006" stroke-width="1.5"/><circle cx="362" cy="362" r="7" fill="url(#ruby)" stroke="#2a1006" stroke-width="1.5"/></g>

<!-- SMOKE from the spout -->
<g id="smokeG" filter="url(#blur2)" transform="translate(18,44)">
 <path d="M44,138 C30,112 70,98 62,70 C54,46 100,40 108,22" fill="none" stroke="#2c9bd0" stroke-width="26" stroke-linecap="round" opacity=".6" filter="url(#blur5)"/>
 <path d="M44,138 C30,112 70,98 62,70 C54,46 100,40 108,22" fill="none" stroke="#8ff6e8" stroke-width="12" stroke-linecap="round" opacity=".8"/>
 <path d="M48,134 C36,114 74,100 66,74 C60,54 96,50 104,32" fill="none" stroke="#e8fffb" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>
 <circle cx="70" cy="64" r="20" fill="url(#smoke)"/><circle cx="96" cy="34" r="22" fill="url(#smoke)"/><circle cx="50" cy="104" r="15" fill="url(#smoke)"/>
</g>
<g fill="#fff6c8"><path d="M118 52 l2.6 7 7 2.6 -7 2.6 -2.6 7 -2.6 -7 -7 -2.6 7 -2.6z" opacity=".95"/><path d="M82 96 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" opacity=".8"/><path d="M130 24 l1.4 3.4 3.4 1.4 -3.4 1.4 -1.4 3.4 -1.4 -3.4 -3.4 -1.4 3.4 -1.4z" opacity=".8"/></g>

<!-- contact shadow + reflected light on plate -->
<ellipse cx="208" cy="318" rx="84" ry="11" fill="#0a0418" opacity=".7" filter="url(#blur5)"/>
<ellipse cx="196" cy="316" rx="62" ry="6" fill="#ff9a40" opacity=".28" filter="url(#blur5)"/>

<g transform="translate(34,40) scale(.84)">
<!-- HANDLE (right) -->
<g fill="none" stroke-linecap="round">
 <path d="M306,226 C360,196 384,262 322,292" stroke="#2a1006" stroke-width="21"/>
 <path d="M306,226 C360,196 384,262 322,292" stroke="url(#goldS)" stroke-width="16"/>
 <path d="M308,224 C358,198 378,252 320,288" stroke="#fff2b0" stroke-width="3.5" opacity=".75"/>
 <path d="M306,231 C352,208 372,258 322,285" stroke="#5a2a0c" stroke-width="3" opacity=".45"/>
</g>
<!-- SPOUT (left) -->
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
 <path d="M104,258 C54,262 40,224 40,170" stroke="#2a1006" stroke-width="32"/>
 <path d="M104,258 C54,262 40,224 40,170" stroke="url(#goldS)" stroke-width="27"/>
 <path d="M104,258 C54,262 40,224 40,170" stroke="#4a2008" stroke-width="27" opacity=".28" transform="translate(-4,0)"/>
 <path d="M50,246 C48,214 48,190 48,172" stroke="#fff0b0" stroke-width="3" opacity=".6"/>
 <path d="M96,246 C60,250 48,222 50,176" stroke="#ffe8a0" stroke-width="3.4" opacity=".75" transform="translate(7,2)"/>
</g>
<ellipse cx="40" cy="160" rx="21" ry="9" fill="#2a1006"/><ellipse cx="40" cy="160" rx="18.5" ry="7" fill="url(#goldS)"/><ellipse cx="40" cy="157.5" rx="12" ry="4" fill="#1c0a14"/><path d="M26 160 a14 5 0 0 0 28 0" fill="none" stroke="#fff0b0" stroke-width="1.4" opacity=".7"/>
<!-- spout band -->
<path d="M26,222 q14,8 28,0" fill="none" stroke="#2a1006" stroke-width="7"/><path d="M26,222 q14,8 28,0" fill="none" stroke="#ffd668" stroke-width="4"/>

<!-- FOOT -->
<path d="M150,328 L162,298 L246,298 L258,328 Z" fill="#2a1006"/>
<path d="M153,326 L164,300 L244,300 L255,326 Z" fill="url(#gold)"/><path d="M153,326 L164,300 L244,300 L255,326 Z" fill="url(#goldV)"/>
<ellipse cx="205" cy="328" rx="62" ry="12" fill="#2a1006"/><ellipse cx="205" cy="326" rx="59" ry="10" fill="url(#gold)"/><ellipse cx="205" cy="324" rx="52" ry="6" fill="#fff0b0" opacity=".3"/>
<path d="M146,327 q59,22 118,0" fill="none" stroke="#2a1006" stroke-width="2"/>
<!-- BODY -->
<path d="${body}" fill="#2a1006" stroke="#2a1006" stroke-width="5" stroke-linejoin="round"/>
<path d="${body}" fill="url(#gold)"/>
<g clip-path="url(#bodyClip)">
 <rect x="80" y="186" width="240" height="132" fill="url(#goldV)"/><rect x="80" y="250" width="240" height="70" fill="#2a0e04" opacity=".38"/><rect x="80" y="186" width="70" height="132" fill="#2a0e04" opacity=".25"/>
 <ellipse cx="200" cy="330" rx="140" ry="40" fill="url(#bounce)"/>
 <rect x="80" y="186" width="240" height="132" fill="url(#skyfill)"/>
 <!-- environment reflection stripes (window/sky) -->
 <path d="M104,214 C140,203 190,202 236,205 L236,214 C190,212 144,214 108,226Z" fill="#fff6d0" opacity=".38"/>
 <path d="M292,214 C300,230 302,250 296,272 L282,272 C288,250 286,230 280,214Z" fill="#fffbe0" opacity=".8"/>
 <path d="M268,222 C276,238 277,254 272,270 L266,270 C270,254 270,238 262,222Z" fill="#fff6c0" opacity=".45"/>
 <!-- shaded left -->
 <path d="M88,246 C88,204 120,192 150,190 C120,210 112,250 134,306 C100,296 88,276 88,246Z" fill="#3a1608" opacity=".5"/>
 <!-- bands -->
 <path d="M90,222 Q200,238 310,222" fill="none" stroke="#2a1006" stroke-width="6"/><path d="M90,222 Q200,238 310,222" fill="none" stroke="#ffd668" stroke-width="3.2"/><path d="M90,224.5 Q200,240.5 310,224.5" fill="none" stroke="#5a2a0c" stroke-width="1.4" opacity=".7"/>
 <path d="M92,290 Q200,314 308,290" fill="none" stroke="#2a1006" stroke-width="6"/><path d="M92,290 Q200,314 308,290" fill="none" stroke="#ffd668" stroke-width="3.2"/>
 <!-- engraving -->
 <g transform="translate(0,6)">${motifs(200,258,104,16,-1.3,1.3,15,1.55)}</g>
 <!-- inlay row -->
 <g id="inlay">${[-1.05,-.6,-.2,.2,.6,1.05].map((t,i)=>{const x=200+112*Math.sin(t),w=Math.cos(t),y=266+10*(1-w*w)*0+ (1-w)*10; return `<ellipse cx="${x.toFixed(1)}" cy="${(268+ (1-w)*6).toFixed(1)}" rx="${(8*w+2).toFixed(1)}" ry="8.5" fill="url(#${i%2?'ruby':'lapis'})" stroke="#2a1006" stroke-width="1.8"/><ellipse cx="${(x-2*w).toFixed(1)}" cy="${(265+(1-w)*6).toFixed(1)}" rx="${(2.4*w+.4).toFixed(1)}" ry="2.2" fill="#fff" opacity=".85"/>`}).join('')}</g>
 <rect x="80" y="186" width="240" height="132" filter="url(#grain)" opacity=".5"/>
</g>
<path d="M88,246 C88,204 136,190 200,190 C264,190 312,204 312,246" fill="none" stroke="#fff4c0" stroke-width="2" opacity=".6" transform="translate(0,-.5)"/>
<path d="M308,230 C312,262 296,296 252,309" fill="none" stroke="#fff8d2" stroke-width="3" opacity=".7" stroke-linecap="round"/>
<!-- NECK + LID -->
<path d="M160,196 Q200,206 240,196 L236,172 L164,172Z" fill="#2a1006"/>
<path d="M163,194 Q200,203 237,194 L234,174 L166,174Z" fill="url(#lidG)"/>
<path d="M163,194 Q200,203 237,194" fill="none" stroke="#5a2a0c" stroke-width="2" opacity=".6"/>
<path d="M156,176 C156,138 244,138 244,176 Q200,184 156,176Z" fill="#2a1006"/>
<path d="M159,174 C159,142 241,142 241,174 Q200,181 159,174Z" fill="url(#lidG)"/>
<path d="M159,174 C159,142 241,142 241,174 Q200,181 159,174Z" fill="url(#goldV)"/>
<path d="M170,160 C176,150 196,146 214,148" fill="none" stroke="#fff8d2" stroke-width="3" stroke-linecap="round" opacity=".8"/>
<path d="M170,166 Q200,171 230,166" fill="none" stroke="#5a2a0c" stroke-width="1.4" opacity=".6"/>
<!-- hinge to handle -->
<path d="M240,176 C264,176 276,186 288,206" fill="none" stroke="#2a1006" stroke-width="9" stroke-linecap="round"/><path d="M240,176 C264,176 276,186 288,206" fill="none" stroke="#ffd668" stroke-width="5.5" stroke-linecap="round"/>
<!-- finial -->
<rect x="193" y="130" width="14" height="18" rx="4" fill="#2a1006"/><rect x="195" y="131" width="10" height="16" rx="3" fill="url(#gold)"/>
<circle cx="200" cy="122" r="15" fill="#2a1006"/><circle cx="200" cy="122" r="12.5" fill="url(#ruby)"/>
<path d="M192 116 q4 -6 11 -4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".9"/><circle cx="206" cy="128" r="2" fill="#ffb0a8" opacity=".8"/>
<!-- sparkles -->
<g fill="#fff"><path d="M290 190 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" opacity=".95"/><path d="M118 280 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" opacity=".7"/></g>
</g>
<!-- plate top sheen -->
<g clip-path="url(#plateClip)"><path d="M0,0 H400 V70 Q200,110 0,70Z" fill="#fff" opacity=".07"/></g>
</svg>`;
fs.writeFileSync(__dirname+'/symbol.svg',svg);
fs.writeFileSync(__dirname+'/symbol.html',`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#1a1226;display:flex;gap:30px;align-items:flex-end;padding:20px"><div style="width:520px;height:520px">${svg.replace('width="400" height="400"','width="520" height="520"')}</div><div style="width:120px;height:120px;filter:none">${svg.replace('width="400" height="400"','width="120" height="120"')}</div><div style="width:88px;height:88px">${svg.replace('width="400" height="400"','width="88" height="88"')}</div></body>`);
