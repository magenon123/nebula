/* QA: hold-to-repeat, autoplay 10, turbo/tap speed-up, error recovery. node qa-func.cjs */
const { sleep, open, vis, settle } = require('./qa-lib.cjs');
const money = s => Math.round(parseFloat(s.replace(/[$,]/g, '')) * 100) / 100;
const res = []; const ck = (n, ok, x = '') => { res.push([n, ok, x]); console.log((ok ? 'ok   ' : 'FAIL ') + n + (x ? '  ' + x : '')); };
(async () => {
  for (const mob of (process.env.ONLY ? [process.env.ONLY === 'touch'] : [false, true])) {
    console.log('--- ' + (mob ? 'touch 390x844' : 'mouse 1600x900'));
    const { browser, page, errors } = await open(mob ? [390, 844] : [1600, 900], { mobile: mob });
    const bet = async () => money(await page.$eval('#bet', e => e.textContent));
    const pc = async id => { const b = await (await page.$('#' + id)).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
    // (3) hold to repeat
    let b0 = await bet(); const [px, py] = await pc('p');
    if (!mob) { await page.mouse.click(px, py); await sleep(150); const b1 = await bet(); ck('one click = one step up', b1 > b0 && (await page.$$eval('#betGrid .opt', o => o.map(x => money(x.textContent)))).indexOf(b1) === (await page.$$eval('#betGrid .opt', o => o.map(x => money(x.textContent)))).indexOf(b0) + 1, `${b0}->${b1}`);
      const bs = await bet(); await page.mouse.move(px, py); await page.mouse.down(); await sleep(1500); await page.mouse.up(); const bh = await bet(); const opts = await page.$$eval('#betGrid .opt', o => o.map(x => money(x.textContent)));
      ck('hold #p 1.5s climbs several steps', opts.indexOf(bh) - opts.indexOf(bs) >= 4, `${bs}->${bh} (+${opts.indexOf(bh) - opts.indexOf(bs)} steps)`);
      await sleep(600); ck('release stops stepping', (await bet()) === bh);
      const [mx, my] = await pc('m'); await page.mouse.move(mx, my); await page.mouse.down(); await sleep(1500); await page.mouse.up(); const bl = await bet(); ck('hold #m steps back down', opts.indexOf(bl) <= opts.indexOf(bh) - 4, `${bh}->${bl}`);
    } else { // touch via CDP-less: dispatch touch through page.touchscreen can't hold; use pointer events
      const r = await page.evaluate(async () => { const p = document.getElementById('p'), bet = () => document.getElementById('bet').textContent; const ev = t => p.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerType: 'touch', isPrimary: true })); const a = bet(); ev('pointerdown'); await new Promise(r => setTimeout(r, 1500)); ev('pointerup'); return [a, bet()]; });
      ck('touch-hold #p climbs (synthetic pointer events)', r[0] !== r[1], r.join('->')); }
    // set bet back to $1
    await page.click('#betV', { force: true }); await sleep(300); await page.click('#betGrid .opt:text-is("$1")', { force: true }); await sleep(200);
    // (4) autoplay 10
    await page.evaluate(() => { const o = SLOT_ENGINE.playRound; window.__log = []; SLOT_ENGINE.playRound = (r, a) => { const x = o(r, a); window.__log.push({ cost: x.cost, tp: x.totalPayout, bonus: !!x.bonusTriggered }); return x; }; });
    const wallet0 = money(await page.$eval('#bal', e => e.textContent)); await page.click('#bAuto', { force: true }); await sleep(300);
    const labels = await page.$$eval('#autoOpts .opt', o => o.map(x => x.textContent.trim())); console.log('  autoplay options:', labels.join(','));
    const i10 = labels.findIndex(l => /^10\b/.test(l)); await page.click('#autoOpts .opt >> nth=' + Math.max(i10, 0), { force: true }); await page.click('#autoGo', { force: true });
    const t0 = Date.now(); let max = 0, seenCnt = new Set(); while (Date.now() - t0 < 600000) { const c = await page.$eval('#spinCnt', e => e.hidden ? null : e.textContent.trim()); if (c) seenCnt.add(c); const L = await page.evaluate(() => window.__log.length); max = L; if (L >= 10 && !c) break; if ((Date.now() - t0) % 20000 < 200) console.log('  .. autoplay state', await page.evaluate(() => JSON.stringify({ c: document.getElementById('spinCnt').textContent, rounds: window.__log.length, intro: !document.getElementById('introM').hidden, outro: !document.getElementById('outroM').hidden, big: document.getElementById('big').className, msg: document.getElementById('msg').textContent, bet: document.getElementById('bet').textContent }))); await sleep(150); }
    ck('autoplay: counter shown', seenCnt.size > 0, [...seenCnt].join(','));
    const ok = await settle(page, 300000); ck('autoplay ends and settles', ok); const L = await page.evaluate(() => window.__log); ck('autoplay ran exactly the chosen 10 base rounds (+0 extra)', L.length === 10, 'rounds=' + L.length);
    const st = await page.evaluate(() => ({ cnt: document.getElementById('spinCnt').hidden, spinBusy: document.getElementById('spin').classList.contains('busy'), pDis: document.getElementById('p').disabled, buyDis: document.getElementById('buyOpen').disabled }));
    ck('no stuck state after autoplay (counter hidden, controls enabled)', st.cnt && !st.spinBusy && !st.pDis && !st.buyDis, JSON.stringify(st));
    const wallet1 = money(await page.$eval('#bal', e => e.textContent)); const stk = await bet(); const r2 = n => Math.round(n * 100) / 100; const exp = r2(wallet0 + L.reduce((a, x) => r2(a - r2(stk * x.cost) + r2(stk * x.tp)), 0));
    ck('autoplay: balance change == sum(totalPayout x stake) - cost', Math.abs(wallet1 - exp) < .011, `${wallet0}->${wallet1} expected ${exp}; bonuses=${L.filter(x => x.bonus).length}`);
    // turbo / tap speed-up: time one spin normal vs turbo vs tapped
    const timeSpin = async tap => { const t = Date.now(); await page.click('#spin', { force: true }); if (tap) { await sleep(700); await page.mouse.click(mob ? 195 : 800, mob ? 300 : 300); } await settle(page); return Date.now() - t; };
    const tn = await timeSpin(false); const tt = await timeSpin(true); await page.click('#menuBtn', { force: true }); await sleep(200); await page.click('#bTurbo', { force: true }); await page.click('#menuBtn', { force: true }).catch(() => {}); await sleep(200); const tb = await timeSpin(false);
    console.log(`  spin time normal=${tn}ms tapped=${tt}ms turbo=${tb}ms (single samples, differ by outcome)`);
    // (5) error handling
    await page.evaluate(() => { window.__o2 = SLOT_ENGINE.playRound; SLOT_ENGINE.playRound = () => { SLOT_ENGINE.playRound = window.__o2; throw new Error('QA forced engine failure'); }; });
    const bal = await page.$eval('#bal', e => e.textContent); await page.click('#spin', { force: true }); await sleep(1200);
    const em = await page.evaluate(() => ({ msg: document.getElementById('msg').textContent, errBar: !!document.getElementById('errBar'), spinDis: document.getElementById('spin').disabled, busy: document.getElementById('spin').classList.contains('busy'), pDis: document.getElementById('p').disabled, bal: document.getElementById('bal').textContent }));
    console.log('  after throw:', JSON.stringify(em)); ck('error: message shown, spin usable, controls unlocked, balance unchanged', /QA forced/.test(em.msg) && !em.spinDis && !em.busy && !em.pDis && em.bal === bal);
    await page.screenshot({ path: `/tmp/qa/E-error-${mob ? 'phone' : 'desk'}.png` });
    await page.click('#spin', { force: true }); ck('error: next spin works after recovery', await settle(page)); 
    // malformed round (garbage) -> hooks throw mid-flight
    await page.evaluate(() => { window.__o3 = SLOT_ENGINE.playRound; SLOT_ENGINE.playRound = () => { SLOT_ENGINE.playRound = window.__o3; return { cost: 1, totalPayout: 0, cascadeSteps: null, initialGrid: null, tins: null }; }; });
    await page.click('#spin', { force: true }); await sleep(3000); const rec = await settle(page, 60000).catch(() => false);
    const em2 = await page.evaluate(() => ({ msg: document.getElementById('msg').textContent, pDis: document.getElementById('p').disabled, spinBusy: document.getElementById('spin').classList.contains('busy') }));
    ck('malformed engine round: game recovers (not stuck)', rec && !em2.pDis && !em2.spinBusy, JSON.stringify(em2)); await page.screenshot({ path: `/tmp/qa/E-malformed-${mob ? 'phone' : 'desk'}.png` });
    await page.evaluate(() => { SLOT_ENGINE.playRound = window.__o3 || SLOT_ENGINE.playRound; }); await page.click('#spin', { force: true }); ck('spin after malformed round works', await settle(page));
    ck('(6) no console/page errors in this scenario' , errors.length === 0, errors.slice(0, 4).join(' | ')); await browser.close();
  }
  console.log(res.filter(r => !r[1]).length + ' failed'); 
})();
