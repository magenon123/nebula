/* QA: layout + tap targets at 5 viewports. node qa-layout.cjs ; screenshots in /tmp/qa */
const { sleep, open, vis } = require('./qa-lib.cjs');
const VPS = [['p390x844', 390, 844, 1], ['l844x390', 844, 390, 1], ['t768x1024', 768, 1024, 1], ['d1600x900', 1600, 900, 0], ['u2560x1080', 2560, 1080, 0]];
const IDS = ['m', 'p', 'spin', 'buyOpen', 'menuBtn', 'bAuto', 'betV', 'bal', 'bet', 'win', 'msg'];
(async () => {
  for (const [name, w, h, mob] of VPS) {
    const { browser, page, errors } = await open([w, h], { mobile: !!mob, query: '?fps=1', dpr: mob ? 2 : 1 });
    console.log('== ' + name + (mob ? ' (touch)' : ''));
    await page.screenshot({ path: `/tmp/qa/L-${name}-idle.png` });
    const r = await page.evaluate(ids => { const o = { vw: innerWidth, vh: innerHeight, scale: window.SLOT_API && SLOT_API.scale ? SLOT_API.scale() : null, scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight };
      o.el = {}; ids.forEach(id => { const e = document.getElementById(id); if (!e) { o.el[id] = null; return; } const b = e.getBoundingClientRect(); o.el[id] = [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height), parseFloat(getComputedStyle(e).fontSize)]; });
      o.clipped = ids.filter(id => { const e = document.getElementById(id); if (!e) return false; const b = e.getBoundingClientRect(); return b.left < -1 || b.top < -1 || b.right > innerWidth + 1 || b.bottom > innerHeight + 1; });
      o.lite = document.body.classList.contains('lite'); return o; }, IDS);
    console.log(JSON.stringify(r));
    // overlay checks: does the topmost element at each button centre belong to it?
    const hit = await page.evaluate(ids => ids.slice(0, 7).map(id => { const e = document.getElementById(id); const b = e.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return [id, !!t && (t === e || e.contains(t) || t.contains(e))]; }), IDS);
    console.log('hit-test (button centre reaches button):', JSON.stringify(hit.filter(x => !x[1])) || 'all');
    await page.click('#betV', { force: true }); await sleep(400); await page.screenshot({ path: `/tmp/qa/L-${name}-betpicker.png` });
    const opt = await page.$$eval('#betGrid .opt', o => { const b = o[0].getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height), o.length, o.every(x => { const r = x.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.top >= -1; })]; });
    console.log('bet picker opt [w,h,n,allOnScreen]:', JSON.stringify(opt));
    await page.keyboard.press('Escape'); await sleep(300); if (await vis(page, '#betM')) await page.click('#betM', { force: true, position: { x: 3, y: 3 } }).catch(() => {});
    await page.click('#buyOpen', { force: true }); await sleep(500); await page.screenshot({ path: `/tmp/qa/L-${name}-buy.png` });
    const bb = await page.evaluate(() => { const q = s => [...document.querySelectorAll(s)].map(e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; });
      const cards = q('.bbRow .bbc'); const btns = ['buy1', 'buy2', 'buy3', 'ante', 'bbM', 'bbP'].map(id => { const e = document.getElementById(id); if (!e) return [id, null]; const b = e.getBoundingClientRect(); return [id, Math.round(b.width), Math.round(b.height), b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1 && b.left >= -1 && b.top >= -1]; });
      const m = document.getElementById('buyM'); return { cards, btns, scrolls: m.scrollHeight > m.clientHeight + 2 }; });
    console.log('buy screen:', JSON.stringify(bb));
    await page.keyboard.press('Escape'); await sleep(300);
    await page.click('#menuBtn', { force: true }); await sleep(400); await page.screenshot({ path: `/tmp/qa/L-${name}-menu.png` });
    await page.click('#bAuto', { force: true }).catch(() => {}); await sleep(400); await page.screenshot({ path: `/tmp/qa/L-${name}-auto.png` });
    const ao = await page.$$eval('#autoOpts .opt, #autoGo', o => o.map(x => { const b = x.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; }));
    console.log('autoplay dialog targets:', JSON.stringify(ao));
    console.log('errors:', errors.length ? errors : 'none');
    await browser.close();
  }
})();
