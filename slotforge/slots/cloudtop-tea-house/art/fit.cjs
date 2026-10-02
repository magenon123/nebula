#!/usr/bin/env node
/* measures the painted bbox of every symbol (alpha > 0.8, so the soft ground shadow is ignored) and writes fit.json = [scale,tx,ty] so every symbol fills its tile alike.
   Run order: node build.cjs (fit.json removed or stale is fine) -> node fit.cjs -> node build.cjs -> node wobble.cjs */
const fs=require('fs'),path=require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
(async()=>{
 try{fs.unlinkSync(path.join(__dirname,'fit.json'))}catch(e){}
 const files=fs.readdirSync(path.join(__dirname,'sym')).filter(f=>/^s\d+\.cjs$/.test(f));
 const ids=files.map(f=>+f.slice(1,-4)).sort((a,b)=>a-b);
 const syms={};for(const id of ids){delete require.cache[require.resolve('./sym/s'+id+'.cjs')];syms[id]=require('./sym/s'+id+'.cjs')();}
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',headless:true});const p=await b.newPage();
 const R=await p.evaluate(async([syms])=>{const out={};
  for(const id in syms){const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="-64 -64 256 256">${syms[id].replace('<symbol id="s'+id+'" viewBox="0 0 128 128">','<g>').replace('</symbol>','</g>').replace(/filter="url\(#rough[A-Z]\)"/,'')}</svg>`;
   const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();
   const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,512,512).data;
   let x0=1e9,y0=1e9,x1=-1,y1=-1;for(let y=0;y<512;y++)for(let xx=0;xx<512;xx++){if(d[(y*512+xx)*4+3]>200){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(y<y0)y0=y;if(y>y1)y1=y;}}
   out[id]=[x0/2-64,y0/2-64,(x1+1)/2-64,(y1+1)/2-64];}
  return out;},[syms]);
 const fit={};
 for(const id of ids){const [x0,y0,x1,y1]=R[id];const w=x1-x0,h=y1-y0;let s=Math.min(114/w,110/h);s=Math.max(.7,Math.min(1.3,s));
  const cx=(x0+x1)/2,cy=(y0+y1)/2;fit[id]=[+s.toFixed(3),+(64-cx*s).toFixed(2),+(63-cy*s).toFixed(2)];
  console.log('s'+id,'bbox',R[id].map(v=>v.toFixed(0)).join(','),'w',w.toFixed(0),'h',h.toFixed(0),'->',fit[id].join(' '));}
 fs.writeFileSync(path.join(__dirname,'fit.json'),JSON.stringify(fit));await b.close();})();
