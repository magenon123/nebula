const { sleep, open } = require('./qa-lib.cjs');
(async () => {
  for (const [n, vp, mob, q] of [['p-lite0', [390, 844], 1, '?lite=0'], ['p-desktop-nonmobile', [390, 844], 0, '']]) {
    const { browser, page } = await open(vp, { mobile: mob, query: q, dpr: 2 });
    await page.screenshot({ path: `/tmp/qa/P-${n}.png` });
    // effective hit area: largest square around the centre where elementFromPoint still resolves to the control
    const r = await page.evaluate(() => ['m', 'p', 'menuBtn', 'bAuto', 'spin', 'buyOpen', 'betV'].map(id => { const e = document.getElementById(id), b = e.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2; let best = 0;
      const ok = (x, y) => { const t = document.elementFromPoint(x, y); return t && (t === e || e.contains(t)); };
      for (let d = 2; d < 60; d += 2) { if (ok(cx - d, cy) && ok(cx + d, cy)) best = Math.max(best, d); else break; } let bh = 0;
      for (let d = 2; d < 60; d += 2) { if (ok(cx, cy - d) && ok(cx, cy + d)) bh = d; else break; }
      return [id, 'w~' + best * 2, 'h~' + bh * 2]; }));
    console.log(n, JSON.stringify(r)); await browser.close();
  }
})();
