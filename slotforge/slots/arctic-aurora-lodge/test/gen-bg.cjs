// Generates background.svg (1280x720) + background-clean.svg (no reel marker). node gen-bg.cjs
const fs=require('fs');
let s=12345;const R=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const f=n=>+n.toFixed(1);
const HZ=480;
// stars
let stars='';for(let i=0;i<320;i++){const x=R()*1280,y=Math.pow(R(),1.5)*HZ*0.95;const r=R()<.06?1.6:R()<.3?1:.6;const o=(.35+R()*.65)*(1-y/HZ*.6);const c=R()<.15?'#cfe4ff':R()<.2?'#ffe9c8':'#ffffff';stars+=`<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${c}" opacity="${o.toFixed(2)}"/>`;if(r>1.5)stars+=`<circle cx="${f(x)}" cy="${f(y)}" r="5" fill="url(#gStar)" opacity=".5"/>`;}
// aurora curtain: rays along a curve
function curtain(yc,amp,ph,len,hue,op,seed){let o='';for(let x=-20;x<1300;x+=3){const t=x/1280;const y=yc+Math.sin(t*5+ph)*amp+Math.sin(t*13+ph*2)*amp*.25;const l=len*(.55+.45*Math.sin(t*7+ph*3))*(0.6+R()*.5);const a=op*(.35+.65*Math.abs(Math.sin(t*9+ph)))*(.55+R()*.45);o+=`<rect x="${x}" y="${f(y-l)}" width="3.2" height="${f(l+ (hue?30:50))}" fill="url(#${hue?'rayV':'rayG'})" opacity="${a.toFixed(2)}"/>`;}return o;}
const cur1=curtain(250,50,0.4,230,0,.55),cur2=curtain(190,40,2.1,170,1,.40),cur3=curtain(310,30,4,120,0,.35);
// mountains
function ridge(base,amp,rough,n,seedx){const pts=[];const N=n+1;const h=new Array(N).fill(0);let step=N-1,a=amp;h[0]=R()*a;h[N-1]=R()*a;while(step>1){for(let i=step/2;i<N;i+=step){h[i]=(h[i-step/2]+h[Math.min(N-1,i+step/2)])/2+(R()-.5)*a;}step/=2;a*=rough;}
 for(let i=0;i<N;i++)pts.push([i*1280/(N-1),base-Math.abs(h[i])]);return pts;}
function mount(pts,id,lit,body,facetDepth,baseY){let d=`M0 ${baseY} `+pts.map(p=>`L${f(p[0])} ${f(p[1])}`).join(' ')+` L1280 ${baseY}Z`;let facets='';
 for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const sl=(b[1]-a[1])/(b[0]-a[0]);const dep=facetDepth*(.8+R()*1.2);const lit_=sl<0;facets+=`<polygon points="${f(a[0])},${f(a[1])} ${f(b[0])},${f(b[1])} ${f(b[0]+(lit_?-6:6))},${f(b[1]+dep)} ${f(a[0]+(lit_?-6:6))},${f(a[1]+dep)}" fill="${lit_?lit:'#020712'}" opacity="${lit_?Math.min(.4,Math.abs(sl)*.5):Math.min(.5,Math.abs(sl)*.6+.1).toFixed(2)}"/>`;}
 const ridgeLine=`M`+pts.map(p=>`${f(p[0])} ${f(p[1])}`).join(' L');
 return `<g id="${id}"><path d="${d}" fill="${body}"/><g filter="url(#b1)">${facets}</g><path d="${ridgeLine}" fill="none" stroke="#bff7e4" stroke-opacity=".4" stroke-width="1.4" filter="url(#b1)"/></g>`;}
const m1=mount(ridge(HZ-20,330,.52,64),'mFar','#6fd9c0','url(#mBody1)',110,HZ+4);
const m2=mount(ridge(HZ-4,170,.5,64),'mMid','#7ee8c8','url(#mBody2)',80,HZ+4);
// trees
function tree(x,base,h,w){const tiers=6+Math.floor(R()*3);let L=[],Rr=[];for(let i=0;i<tiers;i++){const t=i/tiers;const y=base-h+h*t*.98;const ww=w*(0.15+t*.85)*(.9+R()*.2);L.push([x-ww,y+h/tiers*1.1]);L.push([x-ww*.45,y+h/tiers*.35]);Rr.push([x+ww*.45,y+h/tiers*.35]);Rr.push([x+ww,y+h/tiers*1.1]);}
 const pts=[[x,base-h]];for(let i=0;i<L.length;i+=2){pts.push(L[i+1]);pts.push(L[i]);}pts.push([x-w*.1,base+4]);pts.push([x+w*.1,base+4]);for(let i=Rr.length-2;i>=0;i-=2){pts.push(Rr[i+1]);pts.push(Rr[i]);}
 return pts;}
function trees(list,fill,hl,hlo){let o='';for(const[x,b,h,w]of list){const p=tree(x,b,h,w);o+=`<polygon points="${p.map(q=>f(q[0])+','+f(q[1])).join(' ')}" fill="${fill}"/>`;if(hl){const lp=p.slice(0,Math.floor(p.length/2));o+=`<polyline points="${lp.map(q=>f(q[0])+','+f(q[1])).join(' ')}" fill="none" stroke="${hl}" stroke-opacity="${hlo}" stroke-width="1.2" stroke-linejoin="round"/>`;}}return o;}
let farT=[];for(let x=-10;x<1290;x+=9+R()*10){const h=26+R()*30;farT.push([x,HZ+3,h,h*.22]);}
let farT2=[];for(let x=-10;x<1290;x+=14+R()*18){const h=55+R()*55;farT2.push([x,HZ+8,h*.8,h*.24]);}
let nearL=[[50,640,430,125],[150,600,330,100],[-20,690,500,140],[235,560,240,70]];
let nearR=[[1245,600,420,110],[1268,640,330,80],[880,520,150,44],[905,530,110,34]];
// lodge
let logs='';for(let y=442;y<540;y+=12){logs+=`<rect x="968" y="${y}" width="248" height="12.5" rx="6" fill="url(#log)"/>`;}
let corner='';for(let y=442;y<540;y+=12){corner+=`<ellipse cx="968" cy="${y+6}" rx="7" ry="6.2" fill="url(#logEnd)"/><ellipse cx="1216" cy="${y+6}" rx="7" ry="6.2" fill="url(#logEnd)"/>`;}
let icicles='';for(let x=952;x<1236;x+=9+R()*10){const l=6+R()*18;icicles+=`<polygon points="${f(x)},446 ${f(x+4)},446 ${f(x+2)},${f(446+l)}" fill="#cfeff8" opacity=".75"/>`;}
const snowRoof=`M946 450 C955 438 972 410 986 394 L1196 394 C1212 410 1228 438 1240 450 C1228 458 1218 452 1205 458 C1190 450 1176 458 1160 453 C1140 460 1120 452 1100 458 C1080 450 1060 460 1040 453 C1020 459 1005 451 990 458 C975 451 960 458 946 450Z`;
const lodge=`<g id="lodge">
 <rect x="1130" y="352" width="30" height="50" fill="#16222b"/><rect x="1126" y="348" width="38" height="10" fill="#cfe9f2"/>
 <rect x="968" y="442" width="248" height="100" fill="#1a0f0a"/>
 ${logs}${corner}
 <rect x="968" y="442" width="248" height="100" filter="url(#wood)" opacity=".55" style="mix-blend-mode:multiply"/>
 <rect x="968" y="442" width="248" height="100" fill="url(#wallLight)" style="mix-blend-mode:screen"/>
 <!-- windows -->
 ${[[995,462],[1120,462]].map(([x,y])=>`<rect x="${x-5}" y="${y-5}" width="64" height="52" fill="#2a1a10"/><rect x="${x}" y="${y}" width="54" height="42" fill="url(#win)"/><rect x="${x+25.5}" y="${y}" width="3" height="42" fill="#2a1a10"/><rect x="${x}" y="${y+19}" width="54" height="3" fill="#2a1a10"/><rect x="${x}" y="${y}" width="54" height="42" fill="url(#winGlass)"/><rect x="${x-7}" y="${y+45}" width="68" height="6" fill="#d7ecf5"/>`).join('')}
 <!-- door -->
 <rect x="1068" y="470" width="42" height="72" fill="#25150d"/><rect x="1072" y="474" width="34" height="68" fill="#4a2a17"/><rect x="1072" y="474" width="34" height="68" fill="url(#winGlass)" opacity=".5"/><circle cx="1100" cy="510" r="2" fill="#e8b36a"/>
 <!-- porch lantern -->
 <circle cx="1089" cy="458" r="26" fill="url(#gWarm)" style="mix-blend-mode:screen"/><rect x="1085" y="452" width="8" height="12" rx="2" fill="#ffd493"/>
 <!-- roof -->
 <path d="M946 450 L986 394 L1196 394 L1240 450Z" fill="#0d1318"/>
 <path d="M946 450 L986 394 L1196 394 L1240 450Z" fill="url(#roofShade)"/>
 <path d="${snowRoof}" fill="url(#snowRoof)"/>
 <path d="M986 394 L1196 394" stroke="#cffff0" stroke-opacity=".8" stroke-width="2" filter="url(#b1)"/>
 <path d="M946 450 C955 438 972 410 986 394" stroke="#9ff0d4" stroke-opacity=".6" stroke-width="2" fill="none" filter="url(#b1)"/>
 ${icicles}
</g>`;
const WIN=[[1022,483],[1147,483]];
const grid=[0,1,2,3,4,5,6].map(i=>`<line x1="${340+i*100}" y1="110" x2="${340+i*100}" y2="650"/>`).join('')+[0,1,2,3,4,5].map(i=>`<line x1="340" y1="${110+i*108}" x2="940" y2="${110+i*108}"/>`).join('');
const marker=`<g id="reelMarker"><rect x="340" y="110" width="600" height="540" rx="14" fill="#000" fill-opacity=".18" stroke="#ffb454" stroke-width="2.5" stroke-dasharray="14 8"/><g stroke="#ffb454" stroke-opacity=".35" stroke-width="1" stroke-dasharray="4 6">${grid}</g><text x="640" y="390" text-anchor="middle" font-family="sans-serif" font-size="22" letter-spacing="3" fill="#ffb454" opacity=".9">REEL WINDOW  6 x 5  (600 x 540)</text></g>`;
const horizonFog=`<rect x="0" y="${HZ-90}" width="1280" height="130" fill="url(#fog)"/>`;
const scene=`
<defs>
 <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#01030a"/><stop offset=".45" stop-color="#050e22"/><stop offset=".8" stop-color="#0b2a3c"/><stop offset="1" stop-color="#1a4a52"/></linearGradient>
 <radialGradient id="gStar"><stop offset="0" stop-color="#cfe6ff" stop-opacity=".8"/><stop offset="1" stop-color="#cfe6ff" stop-opacity="0"/></radialGradient>
 <linearGradient id="rayG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4cff" stop-opacity="0"/><stop offset=".35" stop-color="#3fffa8" stop-opacity=".5"/><stop offset=".85" stop-color="#9dffd0" stop-opacity=".95"/><stop offset="1" stop-color="#4dffb0" stop-opacity="0"/></linearGradient>
 <linearGradient id="rayV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4fa0" stop-opacity="0"/><stop offset=".3" stop-color="#8a5cff" stop-opacity=".6"/><stop offset=".85" stop-color="#6ae0ff" stop-opacity=".8"/><stop offset="1" stop-color="#4dffb0" stop-opacity="0"/></linearGradient>
 <linearGradient id="mBody1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d5a6a"/><stop offset=".6" stop-color="#17384b"/><stop offset="1" stop-color="#2c6a70"/></linearGradient>
 <linearGradient id="mBody2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a3a4a"/><stop offset=".6" stop-color="#0c2232"/><stop offset="1" stop-color="#1f5058"/></linearGradient>
 <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fe0c8" stop-opacity="0"/><stop offset=".7" stop-color="#5fe0c8" stop-opacity=".30"/><stop offset="1" stop-color="#5fe0c8" stop-opacity="0"/></linearGradient>
 <linearGradient id="ice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b4a58"/><stop offset=".25" stop-color="#0d2c3f"/><stop offset="1" stop-color="#040c18"/></linearGradient>
 <linearGradient id="log" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a34"/><stop offset=".3" stop-color="#6b4224"/><stop offset=".75" stop-color="#3a2212"/><stop offset="1" stop-color="#1c0f08"/></linearGradient>
 <radialGradient id="logEnd"><stop offset="0" stop-color="#b88050"/><stop offset=".6" stop-color="#7a4a28"/><stop offset="1" stop-color="#3a2010"/></radialGradient>
 <radialGradient id="win" cx=".5" cy=".6" r=".8"><stop offset="0" stop-color="#fff0c0"/><stop offset=".4" stop-color="#ffc060"/><stop offset="1" stop-color="#e0701c"/></radialGradient>
 <linearGradient id="winGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <radialGradient id="gWarm"><stop offset="0" stop-color="#ffc870" stop-opacity=".85"/><stop offset=".3" stop-color="#ff9a3c" stop-opacity=".35"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
 <radialGradient id="wallLight" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".0"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
 <linearGradient id="roofShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a4a50" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
 <linearGradient id="snowRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6fff6"/><stop offset=".5" stop-color="#a9d3e2"/><stop offset="1" stop-color="#4f7aa0"/></linearGradient>
 <linearGradient id="snowG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7aa9c0"/><stop offset=".3" stop-color="#2d5878"/><stop offset="1" stop-color="#0c1c36"/></linearGradient>
 <radialGradient id="spill" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb454" stop-opacity=".75"/><stop offset=".5" stop-color="#ff8c30" stop-opacity=".25"/><stop offset="1" stop-color="#ff8c30" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>
 <linearGradient id="streak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#bff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <filter id="b1"><feGaussianBlur stdDeviation="1"/></filter><filter id="b2"><feGaussianBlur stdDeviation="2"/></filter>
 <filter id="b4"><feGaussianBlur stdDeviation="4"/></filter><filter id="b12" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="12"/></filter><filter id="b30" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="30"/></filter>
 <filter id="wood" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .35" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .02  0 0 0 1.6 -.5"/></filter>
 <filter id="snowTex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".02 .06" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 .75  0 0 0 0 .9  0 0 0 0 1  0 0 0 1.4 -.55"/></filter>
 <clipPath id="lakeClip"><rect x="0" y="${HZ}" width="1280" height="240"/></clipPath>
 <clipPath id="bankClip"><rect x="900" y="548" width="380" height="172"/></clipPath>
 <mask id="auFade"><rect width="1280" height="${HZ+10}" fill="url(#mfade)"/></mask>
 <linearGradient id="mfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".3" stop-color="#fff"/><stop offset=".85" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>
</defs>
<rect width="1280" height="720" fill="url(#sky)"/>
<g id="starsG">${stars}</g>
<g id="auroraG" style="mix-blend-mode:screen">
 <g filter="url(#b30)" opacity=".75"><ellipse cx="520" cy="230" rx="520" ry="110" fill="#2fe0a0" opacity=".35"/><ellipse cx="800" cy="150" rx="380" ry="70" fill="#7a4cff" opacity=".35"/></g>
 <g filter="url(#b2)" mask="url(#auFade)">${cur3}${cur1}${cur2}</g>
</g>
<g id="mountains">${m1}${horizonFog.replace('url(#fog)','url(#fog)')}${m2}</g>
<rect x="0" y="${HZ-60}" width="1280" height="70" fill="url(#fog)" opacity=".8"/>
<g id="farTrees" filter="url(#b1)" opacity=".95">${trees(farT2,'#06141c',null)}</g>
<g id="farTrees2" filter="url(#b1)">${trees(farT,'#0a1d26',null)}</g>
<rect x="0" y="${HZ-8}" width="1280" height="26" fill="url(#fog)" opacity=".9"/>
<!-- LAKE -->
<rect x="0" y="${HZ}" width="1280" height="240" fill="url(#ice)"/>
<g clip-path="url(#lakeClip)">
 <g transform="translate(0,${HZ*2}) scale(1,-1)" filter="url(#b4)" opacity=".42"><use href="#auroraG"/><use href="#starsG"/><use href="#mountains"/><use href="#farTrees"/></g>
 <g opacity=".5">${Array.from({length:46},(_, i)=>{const y=HZ+6+Math.pow(i/46,1.6)*230;return `<rect x="${f(R()*1000-100)}" y="${f(y)}" width="${f(150+R()*500)}" height="${f(.8+i*.08)}" fill="url(#streak)" opacity="${(.15+R()*.4).toFixed(2)}"/>`}).join('')}</g>
 <!-- cracks -->
 <g fill="none" stroke-linecap="round">
 ${[[120,700,300,590,520,560,640,520],[760,720,700,640,560,610,470,540],[40,610,200,570,260,540,330,515],[480,720,520,660,610,640,690,590]].map(c=>`<path d="M${c[0]} ${c[1]} L${c[2]} ${c[3]} L${c[4]} ${c[5]} L${c[6]} ${c[7]}" stroke="#02060e" stroke-opacity=".7" stroke-width="2"/><path d="M${c[0]+1.5} ${c[1]+1.5} L${c[2]+1.5} ${c[3]+1.5} L${c[4]+1.5} ${c[5]+1.5} L${c[6]+1.5} ${c[7]+1.5}" stroke="#8ff0e0" stroke-opacity=".28" stroke-width="1"/>`).join('')}
 </g>
 <!-- lodge reflection + warm glow on ice -->
 <g transform="translate(0,1084) scale(1,-1)" filter="url(#b4)" opacity=".28" clip-path="url(#bankClip)"><use href="#lodge"/></g>
 <ellipse cx="1085" cy="590" rx="190" ry="26" fill="url(#spill)" style="mix-blend-mode:screen" opacity=".7"/>
 <ellipse cx="1085" cy="640" rx="90" ry="70" fill="url(#spill)" style="mix-blend-mode:screen" opacity=".35"/>
 <!-- snow drifts on the ice -->
 <path d="M0 720 L0 668 C60 650 110 664 170 668 C260 650 330 690 420 704 L430 720Z" fill="url(#snowG)"/>
 <path d="M0 668 C60 650 110 664 170 668 C260 650 330 690 420 704" fill="none" stroke="#9ffbd8" stroke-opacity=".5" stroke-width="2" filter="url(#b1)"/>
 <path d="M820 720 C860 696 940 690 1020 700 C1100 690 1200 700 1280 690 L1280 720Z" fill="url(#snowG)"/>
 <path d="M820 720 C860 696 940 690 1020 700" fill="none" stroke="#9ffbd8" stroke-opacity=".4" stroke-width="2" filter="url(#b1)"/>
</g>
<!-- bank with lodge -->
<path d="M880 548 C930 528 1000 534 1080 538 C1170 532 1230 528 1280 520 L1280 560 C1200 568 1100 572 1000 566 C940 566 900 560 880 548Z" fill="url(#snowG)"/>
<path d="M880 548 C930 528 1000 534 1080 538 C1170 532 1230 528 1280 520" fill="none" stroke="#9ffbd8" stroke-opacity=".55" stroke-width="2" filter="url(#b1)"/>
<ellipse cx="1085" cy="552" rx="170" ry="16" fill="url(#spill)" style="mix-blend-mode:screen"/>
${lodge}
<g id="warmGlow" style="mix-blend-mode:screen">${WIN.map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="64" ry="48" fill="url(#gWarm)" opacity=".85"/>`).join('')}</g>
<!-- smoke -->
<g filter="url(#b12)" opacity=".5" fill="#9fc0d0"><ellipse cx="1146" cy="330" rx="14" ry="16"/><ellipse cx="1130" cy="300" rx="22" ry="20" opacity=".7"/><ellipse cx="1104" cy="268" rx="34" ry="24" opacity=".5"/></g>
<!-- near trees -->
<g id="nearTrees">${trees(nearL,'#020a0e','#7ff0c8',.3)}${trees(nearR,'#020a0e','#7ff0c8',.3)}</g>
<!-- low fog + light snow -->
<ellipse cx="640" cy="${HZ+14}" rx="720" ry="26" fill="#5fe0c8" opacity=".18" filter="url(#b12)"/>
<g fill="#fff" filter="url(#b1)">${Array.from({length:40},()=>`<circle cx="${f(R()*1280)}" cy="${f(R()*720)}" r="${(R()*1.6+.5).toFixed(1)}" opacity="${(.15+R()*.35).toFixed(2)}"/>`).join('')}</g>
<rect width="1280" height="720" fill="url(#vig)"/>`;
for(const [name,mk] of [['background.svg',marker],['background-clean.svg','']])
 fs.writeFileSync(name,`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">${scene}${mk}</svg>`);
