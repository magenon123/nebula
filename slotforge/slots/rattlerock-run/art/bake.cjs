// node bake.cjs [names]: renders bake/*.svg with Chromium -> bake/*.png (preview) + bake/*.webp
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const B = path.join(__dirname, 'bake');
const cfg = n => n.startsWith('farmid-') ? { w: 1600, h: 900, omit: true, q: .5 } : n.startsWith('far-') ? { w: 2000, h: 900, omit: false, q: .62 } : n.startsWith('track-') ? { w: 1600, h: 900, omit: true, q: .86, clip: { x: 0, y: 670, width: 1600, height: 230 } } : n === 'exit' ? { w: 1600, h: 900, omit: true, q: .6, s: .5 } : { w: 1600, h: 900, omit: true, q: .66 };
async function toWebp(b, png, w, h, q) {
  const p = await b.newPage(); await p.setContent('<canvas id=c></canvas>');
  const url = await p.evaluate(async ([d, w, h, q]) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.getElementById('c'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); return c.toDataURL('image/webp', q); }, [png.toString('base64'), w, h, q]);
  await p.close(); return Buffer.from(url.split(',')[1], 'base64');
}
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const only = process.argv[2] ? process.argv[2].split(',') : fs.readdirSync(B).filter(x => /^(far|farmid|mid|track|near)-lv\d\.svg$|^exit\.svg$/.test(x)).map(x => x.replace('.svg', ''));
  for (const n of only) {
    const c = cfg(n), p = await b.newPage({ viewport: { width: c.w, height: c.h } });
    await p.goto('file://' + path.join(B, n + '.svg')); await p.waitForTimeout(250);
    const png = await p.screenshot({ omitBackground: c.omit, clip: c.clip }); await p.close();
    fs.writeFileSync(path.join(B, n + '.png'), png);
    const wp = await toWebp(b, png, (c.clip ? c.clip.width : c.w) * (c.s || 1), (c.clip ? c.clip.height : c.h) * (c.s || 1), c.q); fs.writeFileSync(path.join(B, n + '.webp'), wp);
    console.log(n, (wp.length / 1024) | 0, 'KB');
  }
  await b.close();
})();
