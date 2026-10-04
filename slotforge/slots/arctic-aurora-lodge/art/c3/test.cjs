// node c3/test.cjs out.png zoom "idle,win@700,big@1200,special@500,tease,tease exhale,bonusmode,maxwin@900" [clipx,clipy,w,h] [refs]
const { chromium } = require('/home/user/nebula/node_modules/playwright'); const fs = require('fs');
const R = '/home/user/nebula/slotforge/refs/characters/';
(async () => {
  const [out, zoom = '1', states = 'idle', clip, refs] = process.argv.slice(2); const z = +zoom, C = (clip || '1040,290,560,470').split(',').map(Number);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true }); const shots = [];
  const pg = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: z });
  await pg.goto('file:///home/user/nebula/arctic-aurora-lodge-standalone.html'); await pg.waitForTimeout(1800);
  for (const s of states.split(',')) {
    const [cls, ms = 700] = s.split('@'); await pg.evaluate(c => { const e = document.getElementById('char'); e.className = ''; void e.offsetWidth; if (c !== 'idle') e.classList.add(...c.split(' ')); }, cls);
    await pg.waitForTimeout(+ms); shots.push(await pg.screenshot({ clip: { x: C[0], y: C[1], width: C[2], height: C[3] } }));
  }
  const rp = await b.newPage({ viewport: { width: 400, height: 400 } });
  const rimgs = refs ? ['zeus', 'raccoon', 'dwarf'].map(n => `<img style="height:${C[3] * z}px" src="data:image/png;base64,${fs.readFileSync(R + n + '.png').toString('base64')}">`).join('') : '';
  await rp.setContent(`<body style="margin:0;background:#000;display:flex;align-items:flex-start">${shots.map(s => `<img style="height:${C[3] * z}px" src="data:image/png;base64,${s.toString('base64')}">`).join('')}${rimgs}</body>`);
  await rp.setViewportSize({ width: 3000, height: C[3] * z }); await rp.waitForTimeout(400); await rp.screenshot({ path: out, fullPage: true }); await b.close();
})();
