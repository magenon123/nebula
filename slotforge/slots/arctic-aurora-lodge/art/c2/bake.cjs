// node c2/bake.cjs aino|tuuli|all : renders each part to out/<name>.webp (+png preview). parts come from aino.cjs / tuuli.cjs: {name:{svg,bbox,scale}}
const { chromium } = require('/home/user/nebula/node_modules/playwright'); const fs = require('fs'), path = require('path');
const which = process.argv[2] || 'all'; const O = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const mods = (which === 'all' ? ['aino', 'tuuli'] : [which]).filter(m => fs.existsSync(path.join(__dirname, m + '.cjs')));
  const only = process.argv[3];
  for (const m of mods) {
    const parts = require('./' + m + '.cjs');
    for (const [name, P] of Object.entries(parts)) {
      if (only && !only.split(',').includes(name)) continue;
      const w = Math.round(P.bbox[2] * P.scale), h = Math.round(P.bbox[3] * P.scale);
      const pg = await b.newPage({ viewport: { width: w, height: h } });
      await pg.setContent(`<html><body style="margin:0;background:transparent">${P.svg}</body></html>`); await pg.waitForTimeout(150);
      const png = await pg.screenshot({ omitBackground: true }); await pg.close();
      fs.writeFileSync(path.join(O, name + '.png'), png);
      const q = await b.newPage(); await q.setContent('<canvas id=c></canvas>');
      const url = await q.evaluate(async ([d, w, h, qq]) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.getElementById('c'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/webp', qq); }, [png.toString('base64'), w, h, P.q || .88]);
      await q.close(); fs.writeFileSync(path.join(O, name + '.webp'), Buffer.from(url.split(',')[1], 'base64'));
      console.log(name, w + 'x' + h, (fs.statSync(path.join(O, name + '.webp')).size / 1024) | 0, 'KB');
    }
  }
  await b.close();
})();
