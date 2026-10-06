const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const ui = require('./ui.cjs'), sy = require('./syms.cjs'); const fonts = require('./fonts.cjs');
(async () => {
  const u = ui.build(); const a = sy.build();
  const items = [['llJpMini', 220, 84, 1], ['llJpMinor', 220, 84, 0], ['llJpMajor', 220, 84, 1], ['llJpGrand', 220, 84, 0], ['llRespins', 320, 92], ['llTotal', 520, 110], ['llLock', 128, 128], ['llCrack1', 220, 220], ['llCrack2', 220, 220], ['llCrack3', 220, 220], ['llGrand', 700, 300], ['llCallSpins', 330, 92], ['llCallMult', 440, 92], ['llSpinsLeft', 300, 80], ['llPlateLine', 520, 60], ['llPlateWin', 360, 96], ['llTitleLink', 640, 150], ['llTitleParade', 640, 150], ['llCollector', 300, 300], ['llSplashLink', 600, 520], ['llSplashParade', 600, 520], ['llSplashOutro', 600, 520], ['llHero', 800, 640], ['llBigWin', 500, 420]];
  const html = `<style>${fonts()}body{margin:0;background:#4a3a52;display:flex;flex-wrap:wrap;gap:12px;padding:12px;width:2000px;align-items:flex-start}</style><svg width="0" height="0" style="position:absolute"><defs>${a.defs.join('')}${u.defs.join('')}${u.svg}</defs></svg>` + items.map(([id, w, h, lit]) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="--lit:${lit || 0}"><use href="#${id}"/></svg>`).join('');
  fs.writeFileSync(path.join(__dirname, 'ui-sheet.html'), html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: 2024, height: 900 } });
  await pg.goto('file://' + path.join(__dirname, 'ui-sheet.html')); await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(__dirname, 'ui-sheet.png'), fullPage: true }); await b.close();
})();
