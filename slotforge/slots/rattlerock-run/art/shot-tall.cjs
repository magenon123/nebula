const { chromium } = require('/home/user/nebula/node_modules/playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1600, height: 1950 } });
  await p.goto('file://' + path.join(__dirname, 'bake', 'tall.html')); await p.waitForTimeout(600); await p.screenshot({ path: path.join(__dirname, 'bake', 'tall.png') });
  await p.setViewportSize({ width: 800, height: 975 }); await p.evaluate(() => document.body.style.zoom = .5); await p.screenshot({ path: path.join(__dirname, 'bake', 'tall-half.png') }); await b.close(); })();
