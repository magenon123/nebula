// node prev.cjs out.png id1,id2,... [scale] [win]  -> renders a contact sheet of symbols on plates from ../symbols.svg
const { chromium } = require('/home/user/nebula/node_modules/playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [out, ids, scale = '3', win = ''] = process.argv.slice(2); const sc = +scale;
  const svg = fs.readFileSync(path.join(__dirname, '../symbols.svg'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'plates.css'), 'utf8') + fs.readFileSync(path.join(__dirname, 'winvars.css'), 'utf8');
  const cells = ids.split(',').map(id => { const m = /^b(\d)_/.exec(id); const z = m ? 104 * m[1] : 104; return `<div class="cell ${win ? 'hit' : ''}" style="width:${z}px;height:${z}px;${m ? 'background:none;border:0;box-shadow:none' : ''}"><svg class="g" ${m ? 'style="left:0;top:0;width:100%;height:100%"' : ''}><use href="#${id}"/></svg></div>`; }).join('');
  const html = `<!doctype html><meta charset=utf8><style>body{margin:0;background:#06101f;padding:12px}#grid{display:flex;gap:10px;flex-wrap:wrap;zoom:${sc};}${css}.cell{width:104px;height:104px}</style><svg width=0 height=0 style="position:absolute"><defs>${svg}</defs></svg><div id=grid>${cells}</div>`;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const p = await b.newPage({ viewport: { width: 1800, height: Math.round(+(process.argv[6] || 1) * 104 * sc + 40) } });
  await p.setContent(html); await p.waitForTimeout(300);
  if (win) { await p.waitForTimeout(+win); }
  await p.screenshot({ path: out }); await b.close();
})();
