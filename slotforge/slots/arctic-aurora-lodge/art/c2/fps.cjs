const { chromium } = require('/home/user/nebula/node_modules/playwright'); const fs = require('fs'), path = require('path'); const A = path.join(__dirname, '../..');
(async () => {
  const sym = fs.readFileSync(A + '/symbols.svg', 'utf8'), ch = fs.readFileSync(A + '/character.html', 'utf8'), css = fs.readFileSync(A + '/slot.css', 'utf8'), sc = fs.readFileSync(A + '/scene.html', 'utf8');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true }); const pg = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await pg.setContent(`<body style="margin:0;background:#10244a;overflow:hidden"><svg width="0" height="0" style="position:absolute">${sym}</svg><style>${css}</style><div id="stage" style="position:relative;width:1600px;height:900px">${sc}${ch}</div></body>`);
  await pg.waitForTimeout(1500);
  const r = await pg.evaluate(() => new Promise(res => { let n = 0, t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 > 4000) res(n / 4); else requestAnimationFrame(f); }; requestAnimationFrame(f); }));
  console.log('fps with scene', r.toFixed(1));
  await pg.evaluate(() => { document.getElementById('scene')?.remove(); }); await pg.waitForTimeout(500);
  console.log('fps char only', (await pg.evaluate(() => new Promise(res => { let n = 0, t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 > 4000) res(n / 4); else requestAnimationFrame(f); }; requestAnimationFrame(f); }))).toFixed(1));
  await b.close();
})();
