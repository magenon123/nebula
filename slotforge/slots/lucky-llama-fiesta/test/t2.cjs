const L=require('./lib.cjs');const {SYM}=require('./syms.cjs');
const names=Object.keys(SYM);let b='';
names.forEach((n,i)=>{const x=(i%5)*310+10,y=Math.floor(i/5)*310+10;
b+=`<g transform="translate(${x} ${y})"><rect width="300" height="300" rx="20" fill="#f6e3b8"/><g transform="translate(20 20) scale(2)">${SYM[n]()}</g></g>`;});
require('fs').writeFileSync('t2.html',`<html><style>@font-face{font-family:Luck;src:url(LuckiestGuy.ttf)}</style><body style="margin:0;background:#5a3a22"><svg width="1600" height="950" viewBox="0 0 1600 950"><defs>${L.defs.join('')}</defs>${b}</svg></body></html>`);
