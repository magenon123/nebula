/* QA: all three bonuses at phone portrait/landscape; screenshots /tmp/qa/B-*.png ; overlap/off-screen probe each tick */
const { sleep, open, vis, settle, FORCE, NORMAL } = require('./qa-lib.cjs');
const VPS = [['p', 390, 844], ['l', 844, 390]];
const CASES = [['tin', 1, `x => x.bought === 'tin' && x.bonus.spins.length >= 8 && x.totalPayout > 5 && x.totalPayout < 150`], ['fs', 2, `x => x.bought === 'fs' && x.bonus.spins.length >= 11 && x.totalPayout > 8 && x.totalPayout < 150`], ['super', 3, `x => x.bought === 'super' && x.fsScatter.count === 4 && x.totalPayout > 30 && x.totalPayout < 400`]];
(async () => {
  for (const [vn, w, h] of VPS) for (const [bn, card, pred] of CASES) {
    const { browser, page, errors } = await open([w, h], { mobile: true, dpr: 1, query: '?fps=0' });
    await page.evaluate(FORCE(pred, 7 + card)); const tag = `B-${vn}-${bn}`; console.log('== ' + tag);
    await page.click('#buyOpen', { force: true }); await sleep(300); await page.click('#buy' + card, { force: true }); await sleep(300); await page.screenshot({ path: `/tmp/qa/${tag}-confirm.png` }); await page.click('#cYes', { force: true });
    const worst = {}; const t0 = Date.now(); let shots = 0, lastShot = 0, introShot = 0, outroShot = 0, introTap = false;
    while (Date.now() - t0 < 240000) {
      const st = await page.evaluate(() => { const g = id => document.getElementById(id); const grid = g('grid').getBoundingClientRect(); const res = { intro: !g('introM').hidden, outro: !g('outroM').hidden, ov: [], off: [] };
        ['fsBox', 'ctRules', 'ctPips', 'ctBanner', 'ctTally', 'ctTitle', 'msg', 'ctBlT', 'ctBlW'].forEach(id => { const e = g(id); if (!e) return; const cs = getComputedStyle(e); if (e.hidden || cs.display === 'none' || +cs.opacity < .3 || cs.visibility === 'hidden') return; const b = e.getBoundingClientRect(); if (b.width < 2) return;
          const ix = Math.min(b.right, grid.right) - Math.max(b.left, grid.left), iy = Math.min(b.bottom, grid.bottom) - Math.max(b.top, grid.top); if (ix > 4 && iy > 4) res.ov.push(id + ':' + Math.round(ix) + 'x' + Math.round(iy));
          if (b.left < -2 || b.top < -2 || b.right > innerWidth + 2 || b.bottom > innerHeight + 2) res.off.push(id + `[${Math.round(b.left)},${Math.round(b.top)},${Math.round(b.right)},${Math.round(b.bottom)}]`); });
        ['introM', 'outroM'].forEach(id => { const m = g(id); if (m.hidden) return; [...m.querySelectorAll('*')].forEach(e => { const b = e.getBoundingClientRect(); if (b.width > 8 && b.height > 8 && (b.right > innerWidth + 3 || b.bottom > innerHeight + 3 || b.left < -3 || b.top < -3) && getComputedStyle(e).position !== 'fixed' && !/bg|art|ray|glow|rays|sun|fx|conf|spark/i.test(e.className + e.id)) res.off.push(id + '>' + (e.id || e.className || e.tagName) + `[${Math.round(b.left)},${Math.round(b.top)},${Math.round(b.right)},${Math.round(b.bottom)}]`); }); });
        return res; });
      st.ov.forEach(x => worst['ov ' + x.split(':')[0]] = Math.max(worst['ov ' + x.split(':')[0]] || 0, parseInt(x.split(':')[1]))); st.off.slice(0, 6).forEach(x => worst['off ' + x.split('[')[0]] = x);
      if (st.intro) { if (!introShot) { await sleep(1800); await page.screenshot({ path: `/tmp/qa/${tag}-intro.png` }); introShot = 1; } if (introShot && !introTap) { introTap = true; await page.click('#introM', { force: true, position: { x: 40, y: 40 } }).catch(() => {}); } }
      else if (st.outro) { if (!outroShot) { await sleep(3200); await page.screenshot({ path: `/tmp/qa/${tag}-outro.png` }); outroShot = 1; } await page.click('#outroM', { force: true, position: { x: 40, y: 40 } }).catch(() => {}); break; }
      else if (Date.now() - lastShot > 2500 && shots < 12) { lastShot = Date.now(); await page.screenshot({ path: `/tmp/qa/${tag}-t${String(shots++).padStart(2, '0')}.png` }); }
      await sleep(120); }
    const ok = await settle(page, 60000); console.log('  settled', ok, 'shots', shots, 'intro', introShot, 'outro', outroShot); console.log('  probe:', JSON.stringify(worst)); console.log('  errors:', errors.length ? errors : 'none'); await browser.close();
  }
})();
