// node prev.cjs <out.png> [ids comma] [win] : contact sheet of symbols on plates
const fs=require('fs'),path=require('path');const {withBrowser}=require('./lib.cjs');
const out=process.argv[2]||'/tmp/sheet.png';const want=process.argv[3]?process.argv[3].split(','):null;const win=process.argv[4]||'';const sc=+(process.argv[5]||1.6);
const svg=fs.readFileSync(path.join(__dirname,'../symbols.svg'),'utf8');
const ids=[...svg.matchAll(/<symbol id="(s[0-9_]+)"/g)].map(m=>m[1]).filter(i=>!want||want.includes(i));
const css=fs.readFileSync(path.join(__dirname,'plates.css'),'utf8')+(fs.existsSync(path.join(__dirname,'seal.css'))?fs.readFileSync(path.join(__dirname,'seal.css'),'utf8'):'')+fs.readFileSync(path.join(__dirname,'winvars.css'),'utf8');
const cell=104*sc;
const html=`<style>body{margin:0;background:#2a1a30;font-family:sans-serif}${css}.grid{display:flex;flex-wrap:wrap;gap:${10}px;padding:12px}.w{width:104px;height:104px;transform:scale(${sc});transform-origin:0 0}.slot{width:${cell}px;height:${cell}px}.cell{width:104px;height:104px;margin:0}</style><svg width="0" height="0" style="position:absolute"><defs>${svg}</defs></svg>
<div class="grid">${ids.map(i=>`<div class="slot"><div class="w"><div class="cell ${win}" style="--spd:1;--delay:0ms"><svg class="g" viewBox="0 0 128 128"><use href="#${i}"/></svg></div></div></div>`).join('')}</div>`;
(async()=>{await withBrowser(async b=>{const p=await b.newPage({viewport:{width:Math.ceil((cell+10)*Math.min(ids.length,6)+30),height:Math.ceil(Math.ceil(ids.length/6)*(cell+10)+30)}});await p.setContent(html);await p.waitForTimeout(300);
 if(win){await p.waitForTimeout(+process.env.T||500);} await p.screenshot({path:out});});})();
