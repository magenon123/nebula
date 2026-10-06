const { chromium } = require('/home/user/nebula/node_modules/playwright');
(async () => {
  const [,, html, png, clipArg, scale] = process.argv;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: +(scale||1) });
  await pg.goto('file://' + require('path').resolve(html));
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(200);
  const o = { path: png };
  if (clipArg) { const [x,y,width,height] = clipArg.split(',').map(Number); o.clip = {x,y,width,height}; }
  await pg.screenshot(o);
  await b.close();
})();
