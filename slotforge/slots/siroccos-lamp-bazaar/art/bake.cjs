// node bake.cjs [names] : renders bake/*.svg with Chromium -> bake/*.webp
const fs = require('fs'), path = require('path'); const { withBrowser, toWebp } = require('./lib.cjs'); const B = path.join(__dirname, 'bake');
const jobs = { day: [1600, 900, false, .8], night: [1600, 900, false, .8], 'rays-day': [1600, 900, true, .75], 'rays-night': [1600, 900, true, .75], frame: [1200, 1200, true, .88], lamp: [88, 413, true, .92], 'lamp-lit': [88, 413, true, .92] };
const only = process.argv[2] ? process.argv[2].split(',') : Object.keys(jobs);
(async () => { await withBrowser(async b => { for (const n of only) { const [w, h, omit, q] = jobs[n]; if (!fs.existsSync(path.join(B, n + '.svg'))) continue;
  const p = await b.newPage({ viewport: { width: w, height: h } }); await p.goto('file://' + path.join(B, n + '.svg')); await p.waitForTimeout(600);
  const png = await p.screenshot({ omitBackground: omit }); await p.close(); fs.writeFileSync(path.join(B, n + '.png'), png);
  const wp = await toWebp(b, png, w, h, q); fs.writeFileSync(path.join(B, n + '.webp'), wp); console.log(n, (wp.length / 1024) | 0, 'KB'); } }); })();
