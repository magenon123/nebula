// node bake.cjs : renders scene-static.svg + curtains with Chromium and converts them to WebP (canvas.toDataURL) -> bake/*.webp
const { chromium } = require('/home/user/nebula/node_modules/playwright'); const fs = require('fs'), path = require('path');
const B = path.join(__dirname, 'bake');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  async function conv(name, svg, w, h, omit, q) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); await p.goto('file://' + path.join(B, svg)); await p.waitForTimeout(500);
    const png = await p.screenshot({ omitBackground: omit }); await p.close();
    const q2 = await b.newPage(); await q2.setContent('<canvas id=c></canvas>');
    const url = await q2.evaluate(async ([d, w, h, q]) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.getElementById('c'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/webp', q); }, [png.toString('base64'), w, h, q]);
    await q2.close(); fs.writeFileSync(path.join(B, name + '.webp'), Buffer.from(url.split(',')[1], 'base64')); console.log(name, (fs.statSync(path.join(B, name + '.webp')).size / 1024) | 0, 'KB');
  }
  await conv('scene', 'scene-static.svg', 1600, 900, false, .86);
  await conv('trees', 'trees-near.svg', 1600, 900, true, .86);
  await conv('frame', 'frame-bake.svg', 1400, 1192, true, .9);
  for (const c of ['cur1', 'cur2', 'cur3']) await conv(c, c + '.svg', 1700, 440, true, .8);
  await b.close();
})();
