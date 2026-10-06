const { chromium } = require('/home/user/nebula/node_modules/playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.goto('file://' + path.join(__dirname, 'bake', 'stage.html')); await p.waitForTimeout(500);
  for (const cy of [350, -350]) { await p.evaluate(c => document.querySelectorAll('#scene .ly-far,#scene .ly-farmid,#scene .ly-mid,#scene .ly-near,#scene .ly-track').forEach(e => { e.style.setProperty('--cy', c + 'px'); e.style.animation = 'none'; e.style.transform = `translate3d(0,${c}px,0)`; }), cy); await p.screenshot({ path: path.join(__dirname, 'bake', `cam${cy}.png`) }); }
  await b.close(); })();
