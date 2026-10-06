const { chromium } = require('/home/user/nebula/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/look2.html');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: __dirname + '/look2.png' });
  if (process.argv[2] === 'layers') for (const l of ['far', 'mid', 'near']) {
    await p.evaluate(l2 => { document.body.style.background = 'transparent'; document.documentElement.style.background = 'transparent'; for (const id of ['far', 'mid', 'spr', 'near', 'mark', 'hud']) document.getElementById(id).style.display = id === l2 ? '' : 'none'; }, l);
    await p.screenshot({ path: __dirname + '/look2-' + l + '.png', omitBackground: true });
  }
  await b.close();
})();
