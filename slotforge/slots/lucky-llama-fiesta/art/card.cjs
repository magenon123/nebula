// node card.cjs -> ../../../../cards/lucky-llama-fiesta.webp (720x944, < 120 KB)
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const O = path.join(__dirname, '..'); const fonts = require('./fonts.cjs');
(async () => {
  const sym = fs.readFileSync(path.join(O, 'symbols.svg'), 'utf8'), logo = fs.readFileSync(path.join(O, 'logo.html'), 'utf8').replace(/<!--.*?-->/s, '').replace('<svg id="logo"', '<svg x="40" y="700" width="640" height="210"');
  const day = fs.readFileSync(path.join(__dirname, 'bake', 'day.png')).toString('base64');
  const pin = (id, x, y, k, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${k}) translate(-64 -64)"><use href="#${id}" width="128" height="128"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="944" viewBox="0 0 720 944"><defs><clipPath id="cc"><rect width="720" height="944" rx="26"/></clipPath>
    <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(20,6,40,.0)"/><stop offset=".6" stop-color="rgba(20,6,40,0)"/><stop offset="1" stop-color="rgba(40,10,30,.75)"/></linearGradient>
    <radialGradient id="hg"><stop offset="0" stop-color="rgba(255,235,150,.95)"/><stop offset="1" stop-color="rgba(255,200,100,0)"/></radialGradient></defs>
   <g clip-path="url(#cc)"><image href="data:image/png;base64,${day}" x="-520" y="-40" width="1850" height="1040" preserveAspectRatio="xMidYMid slice"/>
   <rect width="720" height="944" fill="url(#vg)"/><circle cx="360" cy="400" r="330" fill="url(#hg)"/>
   <use href="#llLucho" x="110" y="90" width="500" height="600"/>
   ${pin('s12_major', 92, 330, 1.8, -14)}${pin('s12', 630, 300, 1.8, 14)}${pin('s5', 110, 560, 1.7, 8)}${pin('s12_minor', 624, 560, 1.5, -10)}
   ${logo}</g></svg>`;
  const html = `<style>${fonts()}body{margin:0;background:#000}</style><svg width="0" height="0" style="position:absolute"><defs>${sym}</defs></svg>${svg}`;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: 720, height: 944 } }); await pg.setContent(html); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
  const png = await pg.screenshot({ omitBackground: true }); fs.writeFileSync(path.join(__dirname, 'bake', 'card.png'), png);
  const q2 = await b.newPage(); await q2.setContent('<canvas id=c></canvas>');
  for (const q of [.85, .75, .65, .55]) {
    const url = await q2.evaluate(async ([d, qq]) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.getElementById('c'); c.width = 720; c.height = 944; c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/webp', qq); }, [png.toString('base64'), q]);
    const buf = Buffer.from(url.split(',')[1], 'base64'); console.log(q, buf.length);
    if (buf.length < 118000) { fs.writeFileSync('/home/user/nebula/cards/lucky-llama-fiesta.webp', buf); break; }
  }
  await b.close();
})();
