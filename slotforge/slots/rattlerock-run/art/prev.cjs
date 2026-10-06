const { chromium } = require('/home/user/nebula/node_modules/playwright'); const path = require('path');
const lvs = (process.argv[2] || '1,2,3').split(',');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const lv of lvs) {
    const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); const B = 'file://' + path.join(__dirname, 'bake') + '/';
    require('fs').writeFileSync(path.join(__dirname,'bake','prev.html'),`<body style="margin:0;background:#000;width:1600px;height:900px;position:relative;overflow:hidden"><img src="${B}far-lv${lv}.png" style="position:absolute;left:-200px;top:0"><img src="${B}farmid-lv${lv}.png" style="position:absolute;left:0;top:0"><img src="${B}mid-lv${lv}.png" style="position:absolute;left:0;top:0"><img src="${B}track-lv${lv}.png" style="position:absolute;left:0;top:670px"><img src="${B}near-lv${lv}.png" style="position:absolute;left:0;top:0"></body>`); await p.goto('file://'+path.join(__dirname,'bake','prev.html'));
    await p.waitForTimeout(500); await p.screenshot({ path: path.join(__dirname, 'bake', `prev-lv${lv}.png`) }); await p.close();
  }
  await b.close();
})();
