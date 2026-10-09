/* QA: money invariants. node qa-inv.cjs <base|tin|fs|super> <N>. displayed win == totalPayout*stake; balance == before - cost*stake + win */
const { sleep, open, settle } = require('./qa-lib.cjs');
const mode = process.argv[2] || 'base', N = +process.argv[3] || 20; const card = { tin: 1, fs: 2, super: 3 }[mode];
const money = s => Math.round(parseFloat(s.replace(/[$,]/g, '')) * 100) / 100;
(async () => {
  const { browser, page, errors } = await open([1280, 720], { query: '' });
  await page.evaluate(() => { localStorage.setItem('cloudtopTeaHouseWallet', '1000000'); }); await page.reload(); await sleep(2500);
  await page.evaluate(() => { document.getElementById('menuBtn').click(); }); await sleep(200); await page.click('#bTurbo', { force: true }); await page.click('#menuBtn', { force: true }).catch(() => {}); await sleep(200);
  await page.evaluate(() => { const o = SLOT_ENGINE.playRound; window.__log = []; SLOT_ENGINE.playRound = (r, a) => { const x = o(r, a); window.__log.push({ cost: x.cost, tp: x.totalPayout, bonus: !!x.bonusTriggered, bought: x.bought || null, capped: !!x.capped }); return x; }; });
  let bad = 0, bonuses = 0, win = 0, cost = 0; const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const b0 = money(await page.$eval('#bal', e => e.textContent)); const n0 = await page.evaluate(() => window.__log.length);
    if (card) { await page.click('#buyOpen', { force: true }); await sleep(250); await page.click('#buy' + card, { force: true }); await sleep(250); await page.click('#cYes', { force: true }); } else await page.click('#spin', { force: true });
    const ok = await settle(page, 400000); await sleep(300);
    const L = await page.evaluate(() => window.__log), r = L[L.length - 1]; if (!ok || L.length !== n0 + 1) { bad++; console.log('FAIL not settled / log', i, ok, L.length, n0); break; }
    const stake = money(await page.$eval('#bet', e => e.textContent)); const dispWin = money(await page.$eval('#win', e => e.textContent)), b1 = money(await page.$eval('#bal', e => e.textContent));
    const expWin = Math.round(r.tp * stake * 100) / 100, expBal = Math.round((b0 - r.cost * stake + expWin) * 100) / 100; if (r.bonus) bonuses++; win += expWin; cost += r.cost * stake;
    if (Math.abs(dispWin - expWin) > .005 || Math.abs(b1 - expBal) > .005) { bad++; console.log(`MISMATCH round ${i}: tp=${r.tp} cost=${r.cost} stake=${stake} dispWin=${dispWin} exp=${expWin} bal ${b0}->${b1} exp ${expBal}`); }
    if (i % 10 === 9) console.log(`  ${mode} ${i + 1}/${N} bad=${bad} bonuses=${bonuses} ${(Date.now() - t0) / 1000 | 0}s`);
  }
  console.log(`RESULT ${mode}: ${N} rounds, mismatches=${bad}, bonus rounds=${bonuses}, total cost=${cost.toFixed(2)} win=${win.toFixed(2)}, console errors=${errors.length}`, errors.slice(0, 3)); await browser.close();
})();
