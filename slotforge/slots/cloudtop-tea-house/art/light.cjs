#!/usr/bin/env node
/* light.cjs (leo, 2.1): injects the base-game LIGHTING / DEPTH layer into the baked scene.html, frame.html and side.html (idempotent, marker blocks).
   RUN AFTER wobble.cjs (wobble rewrites those files from art/raw/*): node art/light.cjs
   Only static SVG gradients + a handful of CSS transform/opacity animations (slot.css "ART-LIGHT" block); body.lite turns the animated extras off. No filters, no blend modes. */
const fs=require('fs'),path=require('path');const D=path.resolve(__dirname,'..');
function inject(file,name,html,where){
  let s=fs.readFileSync(path.join(D,file),'utf8');
  const A=`<!--LIGHT:${name}:begin-->`,B=`<!--LIGHT:${name}:end-->`;
  const re=new RegExp(A+'[\\s\\S]*?'+B);
  s=s.replace(re,'');
  const blk=A+html+B;
  s=where(s,blk);fs.writeFileSync(path.join(D,file),s);console.log('light',file,name,html.length);
}
const f=v=>Math.round(v*10)/10;

/* ---------- SCENE ---------- */
// 1) extra far ridge (soft, no ink, lilac) behind the inked mountains + an atmospheric haze band over them
const ridge='<path d="M-10 470 L90 400 L170 440 L260 372 L330 430 L420 385 L520 440 L610 410 L700 452 L800 430 L900 455 L1000 405 L1080 430 L1180 380 L1290 425 L1380 360 L1470 410 L1560 372 L1610 400 L1610 640 L-10 640Z" fill="#dcd2f0" opacity=".85"/>'
 +'<path d="M-10 520 L120 470 L240 500 L380 462 L520 505 L700 480 L900 510 L1100 478 L1260 506 L1420 468 L1610 495 L1610 640 L-10 640Z" fill="#e9dcf0" opacity=".8"/>';
const haze='<rect x="-2400" y="420" width="6400" height="215" fill="url(#ctLtHaze)"/>';   // spans the side extensions too (no step at the stage edge)
inject('scene.html','far',`<defs><linearGradient id="ctLtHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe8d2" stop-opacity="0"/><stop offset=".7" stop-color="#ffe0c4" stop-opacity=".5"/><stop offset="1" stop-color="#ffd4b0" stop-opacity=".75"/></linearGradient></defs>`+ridge,
  (s,b)=>s.replace('<g id="sFar">',b+'<g id="sFar">'));
inject('scene.html','haze',haze,(s,b)=>s.replace(/(<g id="sKites")/,b+'$1'));
// 2) lighting on top of the whole backdrop: warm pool around the board, deck light, depth shadows of the tansu, vignette
const light=`<defs>
<radialGradient id="ctLtPool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd58a" stop-opacity=".5"/><stop offset=".45" stop-color="#ffc070" stop-opacity=".22"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>
<radialGradient id="ctLtVig" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(800 423) scale(1500 700)"><stop offset=".5" stop-color="#2a1f4a" stop-opacity="0"/><stop offset=".85" stop-color="#2a1f4a" stop-opacity=".22"/><stop offset="1" stop-color="#1c1438" stop-opacity=".5"/></radialGradient>
<radialGradient id="ctLtSh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2a1a40" stop-opacity=".5"/><stop offset=".6" stop-color="#2a1a40" stop-opacity=".2"/><stop offset="1" stop-color="#2a1a40" stop-opacity="0"/></radialGradient>
<linearGradient id="ctLtSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a1a40" stop-opacity="0"/><stop offset="1" stop-color="#2a1a40" stop-opacity=".38"/></linearGradient>
<linearGradient id="ctLtDeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a40" stop-opacity=".4"/><stop offset="1" stop-color="#2a1a40" stop-opacity="0"/></linearGradient>
</defs>
<g id="sLight" pointer-events="none">
<ellipse cx="800" cy="470" rx="700" ry="470" fill="url(#ctLtPool)"/>
<ellipse cx="800" cy="716" rx="470" ry="46" fill="url(#ctLtSh)"/>
<rect x="340" y="722" width="940" height="40" fill="url(#ctLtDeck)"/>
<rect x="-2400" y="-1300" width="6400" height="2200" fill="url(#ctLtVig)"/>
</g>`;
inject('scene.html','light',light,(s,b)=>s.replace(/(<rect id="sDusk")/,b+'$1'));

/* ---------- FRAME (tansu art): lantern halos on the eave + warm rim light on the top rail ---------- */
const lamps=[[-108,36],[-59,36],[-14,36],[715,38],[758,40],[805,37]];
const halo=lamps.map(([x,y],i)=>`<circle class="ltLamp l${i%2}" cx="${x}" cy="${y}" r="46" fill="url(#ctLtLamp)"/>`).join('');
inject('frame.html','halo',`<defs><radialGradient id="ctLtLamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".85"/><stop offset=".35" stop-color="#ffc063" stop-opacity=".4"/><stop offset="1" stop-color="#ffb040" stop-opacity="0"/></radialGradient></defs><g pointer-events="none">${halo}</g>`,
  (s,b)=>{const i=s.indexOf('</svg>');return s.slice(0,i)+b+s.slice(i);});
// board: tansu inner shadow (drawers sit IN the chest), warm lantern light from the top, soft bottom bounce. lives in #frame at z5 (under the fx overlay)
const board=`<svg id="boardLit" viewBox="0 0 640 512" preserveAspectRatio="none" aria-hidden="true"><defs>
<linearGradient id="ctBlT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1030" stop-opacity=".5"/><stop offset="1" stop-color="#1c1030" stop-opacity="0"/></linearGradient>
<linearGradient id="ctBlL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1c1030" stop-opacity=".4"/><stop offset="1" stop-color="#1c1030" stop-opacity="0"/></linearGradient>
<linearGradient id="ctBlR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#1c1030" stop-opacity=".3"/><stop offset="1" stop-color="#1c1030" stop-opacity="0"/></linearGradient>
<linearGradient id="ctBlB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1c1030" stop-opacity=".28"/><stop offset="1" stop-color="#1c1030" stop-opacity="0"/></linearGradient>
<radialGradient id="ctBlW" cx=".5" cy="0" r=".75"><stop offset="0" stop-color="#ffd48a" stop-opacity=".34"/><stop offset=".55" stop-color="#ffc070" stop-opacity=".1"/><stop offset="1" stop-color="#ffc070" stop-opacity="0"/></radialGradient>
</defs>
<rect width="640" height="512" fill="url(#ctBlW)"/><rect width="640" height="38" fill="url(#ctBlT)"/><rect width="26" height="512" fill="url(#ctBlL)"/><rect x="618" width="22" height="512" fill="url(#ctBlR)"/><rect y="486" width="640" height="26" fill="url(#ctBlB)"/></svg>`;
inject('frame.html','board',board,(s,b)=>s.replace('<svg id="frameFx"',b+'<svg id="frameFx"'));

/* ---------- SIDE: drifting petals (front of everything, margins only) ---------- */
const petals=[[130,-30,900,34,0],[250,-60,700,26,9],[1380,-40,800,30,3],[1500,-20,600,28,13],[60,-50,500,36,17],[1300,-80,620,24,6],[330,-30,520,40,21],[1560,-60,740,32,11],[190,-40,880,38,25],[1440,-20,880,36,19]];
const petalPath='M0 0C3 -5 9 -5 11 0C9 5 3 6 0 0Z';
const ph=petals.map(([x,y,h,dur,dl],i)=>`<g transform="translate(${x} ${y})"><g class="ltPet pp${i%3}" style="--h:${h}px;--dx:${(i%2?-1:1)*(90+i*17)}px;animation-duration:${dur}s;animation-delay:-${dl}s"><path d="${petalPath}" fill="${i%3?'#f8a9c1':'#ffd1de'}" stroke="#d9658a" stroke-width=".8"/></g></g>`).join('');
inject('side.html','petals',`<svg id="petals" viewBox="0 0 1600 900" aria-hidden="true">${ph}</svg>`,(s,b)=>b+s);
