// node c3/bake.cjs [names] : render each part of parts.cjs to out/<name>.webp
const { chromium } = require('/home/user/nebula/node_modules/playwright'); const fs = require('fs'), path = require('path'); const { P_ } = require('./parts.cjs');
const O = path.join(__dirname, 'out'); const only = process.argv[2] ? process.argv[2].split(',') : null;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true }); let tot = 0;
  for (const [name, fn] of Object.entries(P_)) {
    if (only && !only.includes(name)) continue; const P = fn();
    const w = Math.round(P.bbox[2] * P.scale), h = Math.round(P.bbox[3] * P.scale);
    const pg = await b.newPage({ viewport: { width: w, height: h } });
    await pg.setContent(`<html><body style="margin:0;background:transparent">${P.svg}</body></html>`); await pg.waitForTimeout(120);
    const png = await pg.screenshot({ omitBackground: true }); await pg.close(); fs.writeFileSync(path.join(O, name + '.png'), png);
    const q = await b.newPage(); await q.setContent('<canvas id=c></canvas>');
    const url = await q.evaluate(async ([d, w, h, qq]) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.getElementById('c'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/webp', qq); }, [png.toString('base64'), w, h, P.q || .86]);
    await q.close(); fs.writeFileSync(path.join(O, name + '.webp'), Buffer.from(url.split(',')[1], 'base64')); const kb = fs.statSync(path.join(O, name + '.webp')).size / 1024; tot += kb;
    console.log(name, w + 'x' + h, kb.toFixed(0) + 'KB');
  }
  console.log('total', tot.toFixed(0), 'KB'); await b.close();
})();
