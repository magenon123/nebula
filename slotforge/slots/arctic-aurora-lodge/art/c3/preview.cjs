// compose all parts statically (rest pose) for review
const fs = require('fs'); const { P_ } = require('./parts.cjs'); const { chromium } = require('/home/user/nebula/node_modules/playwright');
const order = ['prop', 'body', 'armL', 'foreL', 'armR', 'foreR', 'fish', 'face', 'beard', 'must', 'pipe', 'hat', 'feather'];
(async () => {
  const F = require('./face.cjs'); const HXF = 'translate(0 -12) translate(240 118) scale(.76) translate(-240 -118)';
  let inner = ''; for (const n of order) { const p = P_[n](); inner += `<g id="pv_${n}">${p.inner}</g>`; if (n === 'face') inner += `<g transform="${HXF}"><g id="cBrowsP">${F.brows}</g>${F.eyes}</g>`; if (n === 'beard') inner += `<g transform="${HXF} translate(0 4)">${F.mouths.replace(/<g class="m2">/, '<g class="m2" style="display:none">')}</g>`; }
  const sc = +(process.argv[2] || 2), crop = process.argv[3] ? process.argv[3].split(',').map(Number) : [0, 0, 480, 410];
  const bg = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2a4a"/><stop offset="1" stop-color="#1a3a58"/></linearGradient><linearGradient id="gShade" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05061a" stop-opacity=".9"/></linearGradient></defs>`;
  const html = `<body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="${crop.join(' ')}" width="${crop[2] * sc}" height="${crop[3] * sc}" stroke-linejoin="round" stroke-linecap="round">${bg}<rect x="${crop[0]}" y="${crop[1]}" width="${crop[2]}" height="${crop[3]}" fill="url(#bg)"/>${inner}</svg></body>`;
  fs.writeFileSync('/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/prev.html', html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true }); const pg = await b.newPage({ viewport: { width: crop[2] * sc, height: crop[3] * sc } });
  await pg.goto('file:///tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/prev.html'); await pg.waitForTimeout(300);
  await pg.screenshot({ path: process.argv[4] || '/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/prev.png' }); await b.close();
})();
