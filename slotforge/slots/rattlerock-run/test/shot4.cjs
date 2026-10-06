const { chromium } = require('/home/user/nebula/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/look4.html');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: __dirname + '/look4.png' });
  if (process.argv[2] === 'layers') {
    const ids = ['far', 'farmid', 'mid', 'track', 'spr', 'near', 'mark', 'hud'];
    for (const l of ['far', 'farmid', 'mid', 'track', 'near']) {
      await p.evaluate(([l2, ids2]) => { document.body.style.background = 'transparent'; document.documentElement.style.background = 'transparent'; for (const id of ids2) document.getElementById(id).style.display = id === l2 ? '' : 'none'; }, [l, ids]);
      await p.screenshot({ path: __dirname + '/look4-' + l + '.png', omitBackground: true });
    }
    // tile seam check: two copies side by side
    for (const l of ['mid', 'track', 'near']) {
      const q = await b.newPage({ viewport: { width: 1600, height: 900 } });
      await q.setContent(`<body style="margin:0;background:#445"><div style="display:flex;width:3200px;transform:scale(.5);transform-origin:0 0"><img src="file://${__dirname}/look4-${l}.png"><img src="file://${__dirname}/look4-${l}.png"></div></body>`);
      await q.waitForTimeout(300);
      await q.screenshot({ path: '/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/tile-' + l + '.png' });
      await q.close();
    }
  }
  await b.close();
})();
