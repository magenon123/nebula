// Monte Carlo RTP check for Olympian Storm, using the engine embedded in nebula-casino.html.
// usage: node tools/olympus-rtp.js [base|ante|buy|super] [rounds]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const html=fs.readFileSync(path.join(__dirname,'..','nebula-casino.html'),'utf8');
const start=html.indexOf('const OLY=(function(){'), end=html.indexOf('})();',start)+5;
const OLY=new Function(html.slice(start,end)+';return OLY')();
const mode=process.argv[2]||'base', N=+process.argv[3]||200000;
const cost={base:1,ante:1.5,buy:100,super:500}[mode];
const opt={ante:mode==='ante',buy:mode==='buy'?'fs':mode==='super'?'super':null};
let tot=0,hits=0,trig=0,max=0;
for(let i=0;i<N;i++){
  const r=OLY.play(Math.random,opt);
  tot+=r.total; if(r.total>0)hits++; if(r.fs&&!opt.buy)trig++; if(r.total>max)max=r.total;
}
console.log(`${mode}: RTP ${(tot/N/cost*100).toFixed(2)}%  hit ${(hits/N*100).toFixed(1)}%`+
  (opt.buy?'':`  free spins 1 in ${trig?Math.round(N/trig):'-'}`)+`  best ${max.toFixed(1)}x  (${N} rounds)`);
