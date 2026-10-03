const { chromium } = require('/home/user/nebula/node_modules/playwright');
const [,, file, out, w, h] = process.argv;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',headless:true});
const p=await b.newPage({viewport:{width:+w,height:+h}});
await p.goto('file://'+require('path').resolve(file));await p.waitForTimeout(300);await p.screenshot({path:out});await b.close();})();
