// node vp.cjs <built.html> [outdir] : screenshots of the real game at several window sizes
const path = require('path'), fs = require('fs');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const file = path.resolve(process.argv[2]); const out = process.argv[3] || path.join(__dirname, 'vp'); fs.mkdirSync(out, { recursive: true });
const sizes = [[1912, 948], [2560, 1080], [1280, 720], [390, 844, 1], [430, 932, 1], [1000, 1000]];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [w, h, m] of sizes) {
    const ctx = await b.newContext(m ? { viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: w, height: h } });
    const pg = await ctx.newPage(); await pg.goto('file://' + file); await pg.waitForTimeout(2500);
    await pg.click('#loadM', { force: true }).catch(() => {}); await pg.waitForTimeout(2500);
    await pg.screenshot({ path: path.join(out, `${w}x${h}.png`) }); await ctx.close();
  }
  await b.close();
})();
