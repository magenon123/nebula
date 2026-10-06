// node bake-blur.cjs -> blur.json {id: dataURI}: vertical motion-smeared WebP per symbol (spin-blur variants sbN)
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const sy = require('./syms.cjs'); const fonts = require('./fonts.cjs');
(async () => {
  const r = sy.build(); const ids = r.list.map(x => x.id); const PX = 160;
  const html = `<style>${fonts()} body{margin:0;background:transparent}svg.g{display:block;width:${PX}px;height:${PX}px}</style><svg width="0" height="0" style="position:absolute"><defs>${r.defs.join('')}${r.svg}</defs></svg>` + ids.map(id => `<svg class="g" id="v_${id}" viewBox="0 0 128 128" style="position:absolute;left:0;top:${ids.indexOf(id) * PX}px"><use href="#${id}"/></svg>`).join('');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: PX, height: ids.length * PX } });
  await pg.setContent(html); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
  const full = await pg.screenshot({ omitBackground: true });
  const q = await b.newPage(); await q.setContent('<canvas id=c></canvas>');
  const out = {};
  const res = await q.evaluate(async ([d, n, PX]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode();
    const res = {};
    for (let i = 0; i < n; i++) {
      const src = document.createElement('canvas'); src.width = PX; src.height = PX; src.getContext('2d').drawImage(img, 0, i * PX, PX, PX, 0, 0, PX, PX);
      const c = document.createElement('canvas'); c.width = PX; c.height = PX; const x = c.getContext('2d');
      const N = 15, span = 46; x.globalAlpha = 1 / N * 1.9;
      for (let k = 0; k < N; k++) { const dy = (k / (N - 1) - .5) * span; x.drawImage(src, 0, dy); }
      x.globalAlpha = .38; x.drawImage(src, 0, 0); // keep a hint of the sharp symbol
      res[i] = c.toDataURL('image/webp', .72);
    }
    return res;
  }, [full.toString('base64'), ids.length, PX]);
  ids.forEach((id, i) => out[id] = res[i]);
  fs.writeFileSync(path.join(__dirname, 'blur.json'), JSON.stringify(out));
  fs.writeFileSync(path.join(__dirname, 'blur-sheet.html'), '<body style="margin:0;background:#222">' + ids.map(id => `<img src="${out[id]}" width=160 height=160 style="margin:4px">`).join(''));
  console.log(ids.map(id => id + ':' + (out[id].length / 1365 | 0) + 'KB').join(' '));
  await b.close();
})();
