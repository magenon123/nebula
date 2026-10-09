/* QA perf: RELATIVE frame-rate indicator only (headless Chromium, software rendering, shared CPU). node qa-perf.cjs */
const { sleep, open, settle, FORCE } = require('./qa-lib.cjs');
const fps = (page, ms = 2500) => page.evaluate(ms => new Promise(res => { let n = 0, worst = 0, last = performance.now(); const t0 = last; const f = t => { n++; worst = Math.max(worst, t - last); last = t; if (t - t0 < ms) requestAnimationFrame(f); else res({ fps: +(n / ((t - t0) / 1000)).toFixed(1), worstFrameMs: Math.round(worst) }); }; requestAnimationFrame(f); }), ms);
(async () => {
  for (const [name, vp, mob] of [['desktop 1600x900', [1600, 900], false], ['phone 390x844 (lite)', [390, 844], true]]) {
    console.log('== ' + name); const { browser, page, errors } = await open(vp, { mobile: mob, dpr: 1 });
    console.log('idle', JSON.stringify(await fps(page)));
    await page.evaluate(FORCE(`x => !x.bonusTriggered && x.cascadeSteps.length >= 3 && x.totalPayout > 3`, 5)); await page.click('#spin', { force: true }); await sleep(1500); console.log('base spin/cascade', JSON.stringify(await fps(page))); await settle(page);
    await page.evaluate(FORCE(`x => x.bought === 'tin' && x.bonus.spins.length >= 12 && x.totalPayout > 30 && x.totalPayout < 300`, 9));
    await page.click('#buyOpen', { force: true }); await sleep(250); await page.click('#buy1', { force: true }); await sleep(250); await page.click('#cYes', { force: true });
    const t0 = Date.now(); while (Date.now() - t0 < 60000 && !(await page.$eval('#introM', e => !e.hidden))) await sleep(200); await sleep(1500); console.log('tin intro splash', JSON.stringify(await fps(page, 2000))); await page.click('#introM', { force: true, position: { x: 40, y: 40 } });
    let best = null, many = null; while (Date.now() - t0 < 300000) { const st = await page.evaluate(() => ({ outro: !document.getElementById('outroM').hidden, chips: document.querySelectorAll('#grid .cell .m').length })); if (st.outro) break; if (st.chips >= 12 && !many) { many = await fps(page, 2000); many.chips = st.chips; console.log('tin rush, >=12 tins on board', JSON.stringify(many)); } await sleep(300); }
    await sleep(3500); console.log('tin outro', JSON.stringify(await fps(page, 2000))); await page.click('#outroM', { force: true, position: { x: 40, y: 40 } }); await settle(page);
    await page.evaluate(FORCE(`x => !x.bonusTriggered && x.totalPayout >= 40 && x.totalPayout < 90`, 11)); await page.click('#spin', { force: true });
    const t1 = Date.now(); let got = false; while (Date.now() - t1 < 60000) { if (await page.$eval('#big', e => e.classList.contains('show'))) { got = true; break; } await sleep(150); } await sleep(1200); console.log('big win screen' + (got ? '' : ' (NOT SEEN)'), JSON.stringify(await fps(page, 2000))); await settle(page);
    await page.evaluate(FORCE(`x => x.bought === 'super' && x.bonus.spins.length >= 12 && x.totalPayout < 400`, 13)); await page.click('#buyOpen', { force: true }); await sleep(250); await page.click('#buy3', { force: true }); await sleep(250); await page.click('#cYes', { force: true });
    const t2 = Date.now(); while (Date.now() - t2 < 60000 && !(await page.$eval('#introM', e => !e.hidden))) await sleep(200); await page.click('#introM', { force: true, position: { x: 40, y: 40 } }); await sleep(4000); console.log('super free spins running', JSON.stringify(await fps(page, 3000)));
    console.log('errors', errors.length ? errors : 'none'); await browser.close(); }
})();
