// node contact.cjs [t_ms] -> art/contact.png : every symbol on a sheet (static, or win motion frozen at t ms)
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const sy = require('./syms.cjs'); const fonts = require('./fonts.cjs');
const t = process.argv[2];
(async () => {
  const r = sy.build();
  const ids = r.list.map(x => x.id);
  const cells = ids.map(id => `<div class="cell${t ? ' hit' : ''}"><svg class="g" viewBox="0 0 128 128" width="256" height="256"><use href="#${id}"/></svg><i>${id}</i></div>`).join('');
  const html = `<style>${fonts()} body{margin:0;background:#3a2a22;display:flex;flex-wrap:wrap;gap:10px;padding:10px;width:1620px}.cell{position:relative;width:256px;height:256px}i{position:absolute;left:4px;bottom:2px;color:#fff;font:12px sans-serif}.cell.hit{--delay:0ms}${r.winvars}</style><svg width="0" height="0" style="position:absolute"><defs>${r.defs.join('')}${r.svg}</defs></svg>${cells}`;
  fs.writeFileSync(path.join(__dirname, 'contact.html'), html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: 1640, height: 1100 } });
  await pg.goto('file://' + path.join(__dirname, 'contact.html')); await pg.evaluate(() => document.fonts.ready);
  if (t) { await pg.evaluate(ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; }), +t); }
  await pg.screenshot({ path: path.join(__dirname, t ? 'contact-hit.png' : 'contact.png'), fullPage: true });
  await b.close();
})();
