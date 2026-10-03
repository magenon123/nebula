// node char-bake.cjs [names] : bake char-parts.cjs parts to bake/c_<name>.webp (+png)
const fs = require('fs'), path = require('path'); const { withBrowser, toWebp } = require('./lib.cjs'); const { P } = require('./char-parts.cjs'); const B = path.join(__dirname, 'bake');
const only = process.argv[2] ? process.argv[2].split(',') : Object.keys(P);
(async () => { await withBrowser(async b => { let tot = 0; for (const n of only) { const p = P[n]; const w = Math.round(p.bbox[2] * p.scale), h = Math.round(p.bbox[3] * p.scale);
  const pg = await b.newPage({ viewport: { width: w, height: h } }); await pg.setContent(`<body style="margin:0;background:transparent"><div style="width:${w}px;height:${h}px">${p.svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${w}" height="${h}"`)}</div>`); await pg.waitForTimeout(150);
  const png = await pg.screenshot({ omitBackground: true }); await pg.close(); fs.writeFileSync(path.join(B, 'c_' + n + '.png'), png);
  const wp = await toWebp(b, png, w, h, p.q || .9); fs.writeFileSync(path.join(B, 'c_' + n + '.webp'), wp); tot += wp.length; console.log(n, w + 'x' + h, (wp.length / 1024) | 0, 'KB'); } console.log('total', (tot / 1024) | 0, 'KB'); }); })();
