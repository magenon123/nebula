// node c2/test.cjs out.png zoom state1,state2,... [refs]  : screenshots #char in states (space-separated sheet), optional refs beside
const { chromium } = require('/home/user/nebula/node_modules/playwright'); const fs = require('fs'), path = require('path');
const A = path.join(__dirname, '..'), R = '/home/user/nebula/slotforge/refs/characters/';
(async () => {
  const [out, zoom = '1', states = 'idle', refs] = process.argv.slice(2); const z = +zoom;
  const sym = fs.readFileSync(path.join(A, '../symbols.svg'), 'utf8'), ch = fs.readFileSync(path.join(A, '../character.html'), 'utf8'), css = fs.readFileSync(path.join(A, 'char.css'), 'utf8') + fs.readFileSync(path.join(A, 'winvars.css'), 'utf8');
  const st = states.split(',');
  const mk = (s, i) => `<div style="position:absolute;left:${i * 480 * z - 0}px;top:0;width:${480 * z}px;height:${430 * z}px;overflow:hidden;background:linear-gradient(#10244a,#2a4a7c 60%,#1a2c4c)"><div style="transform:scale(${z});transform-origin:0 0;width:480px;height:430px;position:relative;left:0;top:0">${ch.replace('<div id="char">', `<div id="char" class="${s === 'idle' ? '' : s}" style="left:0;top:0">`).replace(/id="/g, (m) => m)}</div></div>`;
  // only one #char per page (ids): so render one state per page
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const shots = [];
  for (const s of st) {
    const pg = await b.newPage({ viewport: { width: 480 * z, height: 500 * z } });
    await pg.setContent(`<html><body style="margin:0;background:#1a2c52"><svg width="0" height="0" style="position:absolute">${sym}</svg><style>${css}</style><div style="transform:scale(${z});transform-origin:0 0;position:relative;width:480px;height:500px;background:linear-gradient(#10244a,#2a4a7c 65%,#1a2c4c)">${ch.replace('<div id="char">', `<div id="char" class="${s === 'idle' ? '' : s.replace(/\+/g, ' ')}" style="left:0;top:70px">`)}</div></body></html>`);
    await pg.waitForTimeout(s.includes('big') || s.includes('win') ? 900 : 700);
    shots.push(await pg.screenshot(process.env.CLIP ? { clip: (([x, y, w, h]) => ({ x: x * z, y: y * z, width: w * z, height: h * z }))(process.env.CLIP.split(',').map(Number)) } : {})); await pg.close();
  }
  const pg = await b.newPage({ viewport: { width: (process.env.CLIP ? +process.env.CLIP.split(',')[2] * z : 480 * z) * st.length + (refs ? 520 : 0), height: process.env.CLIP ? +process.env.CLIP.split(',')[3] * z : Math.max(500 * z, refs ? 520 : 0) } });
  await pg.setContent(`<body style="margin:0;background:#000;display:flex;align-items:flex-start">${shots.map(s => `<img src="data:image/png;base64,${s.toString('base64')}">`).join('')}${refs ? ['zeus', 'raccoon', 'dwarf'].map(n => `<img style="height:${430 * z * 0.9}px" src="data:image/png;base64,${fs.readFileSync(R + n + '.png').toString('base64')}">`).join('') : ''}</body>`);
  await pg.waitForTimeout(300); await pg.screenshot({ path: out, fullPage: true }); await b.close();
})();
