const { chromium } = require('/home/user/nebula/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',headless:true});
const p=await b.newPage({viewport:{width:760,height:520}});
await p.goto('file://'+__dirname+'/symbol.html');await p.screenshot({path:__dirname+'/symbol.png'});
const q=await b.newPage({viewport:{width:1280,height:720}});
const fs=require('fs');
if(fs.existsSync(__dirname+'/background.svg')){await q.goto('file://'+__dirname+'/background.svg');await q.screenshot({path:__dirname+'/background.png'});}
await b.close();})();
