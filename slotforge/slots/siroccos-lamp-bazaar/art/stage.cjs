// dev tool: node stage.cjs <out.png> [classes for #char] [classes for #scene] [wait ms] [--grid] [--fps]  : renders the assembled art at 1600x900
const fs = require('fs'), path = require('path'); const R = n => fs.readFileSync(path.join(__dirname, '..', n), 'utf8');
const { withBrowser } = require('./lib.cjs');
const out = process.argv[2] || '/tmp/stage.png', chcls = process.argv[3] || '', sccls = process.argv[4] || '', wait = +(process.argv[5] || 600);
const grid = process.argv.includes('--grid'), fpsT = process.argv.includes('--fps'), chainCls = (process.argv.find(a => a.startsWith('--chain=')) || '').slice(8);
const extra = (process.argv.find(a => a.startsWith('--add=')) || '').slice(6);
const cells = [[0, 1, 3, 6, 8], [9, 4, 5, 2, 0], [10, 7, 11, 12, 3], ['12_2', 1, 8, 6, '12_10'], ['12_25', 5, 7, 2, '12_5']];
const sealed = [[0, 2], [1, 2], [2, 2], [2, 0], [2, 1], [3, 3]];
const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000}#stage{position:relative;width:1600px;height:900px;overflow:hidden}#stage>*{position:absolute}${R('slot.css')}</style>
<svg width="0" height="0" style="position:absolute"><defs>${R('symbols.svg')}</defs></svg>
<div id="stage">${R('scene.html').replace('id="scene"', `id="scene" class="${sccls}"`)}${R('logo.html')}${R('frame.html')}${R('side.html').replace('id="chain" class="m1"', `id="chain" class="m1 ${chainCls}"`)}${R('character.html').replace('id="char"', `id="char" class="${chcls}"`)}${extra ? R(extra).replace('id="astro"', 'id="astro" class="on idle"') : ''}</div>
<script>${grid ? "var cells=" + JSON.stringify(cells) + ",sealed=" + JSON.stringify(sealed) + ";var g=document.getElementById('grid');cells.forEach(function(row,r){row.forEach(function(s,c){var d=document.createElement('div');d.className='cell'+(sealed.some(function(x){return x[0]==r&&x[1]==c})?' sealed':'');d.innerHTML='<svg class=\"g\" viewBox=\"0 0 128 128\"><use href=\"#s'+s+'\"/></svg>';g.appendChild(d);});});" : ''}</script>`;
fs.writeFileSync('/tmp/stage-test.html', html);
(async () => { await withBrowser(async b => { const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///tmp/stage-test.html'); await p.waitForTimeout(wait);
  if (fpsT) { const fps = await p.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); function f() { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else res(n / ((performance.now() - t0) / 1000)); } requestAnimationFrame(f); })); console.log('fps', fps.toFixed(1)); }
  await p.screenshot({ path: out }); if (errs.length) console.log('ERR', errs.slice(0, 5)); }); })();
