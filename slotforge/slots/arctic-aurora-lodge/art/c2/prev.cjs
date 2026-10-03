// node c2/prev.cjs name1,name2 [bg] -> out/prev.png : parts placed at their design coords (aino/tuuli), 2x
const { chromium } = require('/home/user/nebula/node_modules/playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const names = process.argv[2].split(','); const mods = { ...require('./aino.cjs'), ...(fs.existsSync(path.join(__dirname, 'tuuli.cjs')) ? require('./tuuli.cjs') : {}) };
  const vb = (process.argv[3] || '40 0 440 380').split(' ').map(Number); const sc = +(process.argv[4] || 2);
  const imgs = names.map(n => { const P = mods[n]; return `<image href="data:image/webp;base64,${fs.readFileSync(path.join(__dirname, 'out', n + '.webp')).toString('base64')}" x="${P.bbox[0]}" y="${P.bbox[1]}" width="${P.bbox[2]}" height="${P.bbox[3]}"/>`; }).join('');
  const html = `<body style="margin:0;background:#1a2a4a"><svg width="${vb[2] * sc}" height="${vb[3] * sc}" viewBox="${vb.join(' ')}"><rect x="-100" y="-100" width="900" height="900" fill="#26406a"/>${imgs}</svg></body>`;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true }); const pg = await b.newPage({ viewport: { width: vb[2] * sc, height: vb[3] * sc } });
  await pg.setContent(html); await pg.waitForTimeout(200); await pg.screenshot({ path: path.join(__dirname, 'out', 'prev.png') }); await b.close();
})();
