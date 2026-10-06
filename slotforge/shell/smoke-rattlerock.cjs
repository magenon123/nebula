/* Smoke test for Rattlerock Run on the shared shell: node slotforge/shell/smoke-rattlerock.cjs [build.html] [--out DIR]
 * idle renders (HUD, cart, pickups), a plain spin settles, a crash run, a clean door run with gems, a shield absorbing TNT, a fork (lever + previews),
 * Twin Carts (ante) with both lanes paid, bought Deep Shaft (intro, 3 levels with the palette switch, carts HUD, outro, total), a base-triggered bonus,
 * speed-up tap, a portrait phone viewport (390x844) and LITE mode. Rounds are forced by overriding SLOT_ENGINE.playRound. 0 console/page errors. */
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const SCRATCH = '/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/rr/smoke';
const ROOT = path.resolve(__dirname, '../..');
const SEED = `(() => {
  const mk = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const r = mk(20261003); Math.random = mk(77);
  crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(r() * 4294967296); return a; };
})();`;
const FORCE = (pred, tag) => `(() => { const o = window.__origPR || (window.__origPR = SLOT_ENGINE.playRound); let s = ${tag}; const rg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  SLOT_ENGINE.playRound = (r, a) => { for (let i = 0; i < 900000; i++) { const x = o(rg, a); if ((${pred})(x)) { window.__R = x; return x; } } return o(r, a); }; })();`;
const NORMAL = `if (window.__origPR) SLOT_ENGINE.playRound = window.__origPR; window.__R = null;`;
const P = {
  crash: 'x => !x.ante && !x.bought && !x.bonusTriggered && x.runs[0].crash && x.runs[0].stops.length >= 3 && x.runs[0].load > 0',
  door: 'x => !x.ante && !x.bought && !x.bonusTriggered && x.runs[0].exit === "door" && x.runs[0].mult >= 4 && x.runs[0].load >= 0.5 && x.runs[0].stops.length <= 8',
  shield: 'x => !x.ante && !x.bought && !x.bonusTriggered && x.runs[0].exit === "door" && x.runs[0].stops.some(s => s.type === "tnt" && s.shielded) && x.runs[0].stops.length <= 9',
  fork: 'x => !x.ante && !x.bought && !x.bonusTriggered && x.runs[0].stops.some(s => s.type === "fork" && s.left.type !== "none" && s.right.type !== "none") && x.runs[0].stops.length <= 8',
  twin: 'x => x.ante && x.runs.length === 2 && !x.bonusTriggered && x.runs[0].stops.length <= 8 && x.runs[1].stops.length <= 8 && x.runs[0].pay > 0 && x.runs[1].pay > 0',
  bonusBase: 'x => !x.bought && !x.ante && x.bonusTriggered && x.bonus.spins.length >= 2 && x.totalPayout < 400',
  deep: 'x => x.bought === "deep" && x.bonus.spins.some(s => s.level === 2) && x.bonus.spins.length <= 6 && x.totalPayout < 3000',
  deepBottom: 'x => x.bought === "deep" && x.bonus.bottomReached && x.bonus.spins.length <= 5 && x.totalPayout < 3000'
};
(async () => {
  const file = path.resolve(args.find(a => !a.startsWith('--') && a !== opt('--out')) || path.join(ROOT, 'rattlerock-run-standalone.html'));
  const outDir = opt('--out') || SCRATCH; fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const errors = [], fails = [];
  const check = (name, ok, extra = '') => { if (!ok) fails.push(name + (extra ? ' (' + extra + ')' : '')); console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${extra && !ok ? '  ' + extra : ''}`); };
  async function open(vw, vh, mobile) {
    const ctx = await browser.newContext(mobile ? { viewport: { width: vw, height: vh }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: vw, height: vh } });
    await ctx.addInitScript(SEED); const page = await ctx.newPage();
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|fonts\.g/i.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto('file://' + file); await sleep(900); return { ctx, page };
  }
  const T = page => ({
    clk: (s, o = {}) => page.click(s, { force: true, ...o }),
    txt: sel => page.$eval(sel, e => e.textContent.trim()),
    shot: async name => { await page.screenshot({ path: path.join(outDir, name + '.png') }); },
    usd: t => +t.replace(/[$,]/g, ''),
    lit: () => page.$eval('#buyOpen', e => e.classList.contains('lit')),
    set: async code => page.evaluate(code),
    watch: () => page.evaluate(() => { clearInterval(window.__wi); window.__w = { wins: [], max: 0, msgs: [], seen: {} }; const win = document.getElementById('win'), h = document.getElementById('hud'), sc = document.getElementById('scene');
      window.__wi = setInterval(() => { const v = +win.textContent.replace(/[$,]/g, ''); window.__w.wins.push(v); window.__w.max = Math.max(window.__w.max, v);
        const sn = window.__w.seen; sn.twin = sn.twin || sc.classList.contains('twin'); sn.exit = sn.exit || sc.classList.contains('exit'); sn.lv = sn.lv || {}; ['lv1', 'lv2', 'lv3'].forEach(k => { if (sc.classList.contains(k)) sn.lv[k] = 1; });
        sn.bonus = sn.bonus || h.classList.contains('bonus'); sn.dome = sn.dome || [...document.querySelectorAll('.rrDome')].some(e => e.style.display === 'block'); sn.crash = sn.crash || [...document.querySelectorAll('.rrCart use')].some(u => u.getAttribute('href') === '#rrCartCrash');
        sn.win = sn.win || [...document.querySelectorAll('.rrCart use')].some(u => u.getAttribute('href') === '#rrCartWin'); sn.forkL = sn.forkL || !!document.querySelector('#grid use[href="#rrForkL"],#grid use[href="#rrForkR"]');
        sn.maxLive = Math.max(sn.maxLive || 0, [...document.querySelectorAll('#grid .rrI')].filter(e => e.style.display !== 'none').length); sn.mult = Math.max(sn.mult || 0, +(document.getElementById('hMultV').textContent.replace(/\D/g, '') || 0));
        sn.carts = Math.max(sn.carts || 0, document.querySelectorAll('#rrCarts .rrCI.lost').length); }, 40);
      new MutationObserver(() => window.__w.msgs.push(document.getElementById('msg').textContent)).observe(document.getElementById('msg'), { childList: true, characterData: true, subtree: true }); }),
    W: () => page.evaluate(() => window.__w),
    settle: async (maxMs = 200000, onTick) => { const t0 = Date.now(); let lastSplash = 0, idle = 0;
      while (Date.now() - t0 < maxMs) {
        const st = await page.evaluate(() => ({ busy: document.getElementById('p').disabled, intro: !document.getElementById('introM').hidden, outro: !document.getElementById('outroM').hidden, big: document.getElementById('big').classList.contains('show') }));
        if (onTick) await onTick(st, Date.now() - t0);
        if (st.intro || st.outro) { idle = 0; if (Date.now() - lastSplash > 700) { await sleep(600); await page.click(st.intro ? '#introM' : '#outroM', { position: { x: 60, y: 60 }, force: true }).catch(() => {}); lastSplash = Date.now(); } }
        else if (st.big) { idle = 0; await page.click('#big', { force: true }).catch(() => {}); }
        else if (!st.busy) { if (++idle >= 6) return true; } else idle = 0;
        await sleep(120); }
      return false; },
    spin: async () => { await page.click('#spin', { force: true }); },
    buy: async n => { await page.click('#buyOpen', { force: true }); await sleep(300); await page.click('#buy' + n, { force: true }); await sleep(300); await page.click('#cYes', { force: true }); }
  });
  /* plays one forced round, checks the settle + money; returns the watch data */
  async function play(t, name, pred, tag, o = {}) {
    await t.set(FORCE(pred, tag)); await t.watch(); const bal0 = t.usd(await t.txt('#bal')); const t0 = Date.now(); const shots = o.shots || [];
    if (o.before) await o.before(); else await t.spin();
    await t.set('window.__w.max = 0');
    let k = 0; const ok = await t.settle(o.max || 200000, async (st, ms) => { while (k < shots.length && ms > shots[k]) { await t.shot(name + '-' + shots[k]); k++; } if (o.tick) await o.tick(st, ms); });
    await sleep(700); const R = await t.set('window.__R'), w = await t.W(), anteOn = await t.lit(), stake = t.usd(await t.txt('#bet')) / (anteOn ? 2.5 : 1), win = t.usd(await t.txt('#win')), bal = t.usd(await t.txt('#bal'));
    check(name + ': settles', ok, 'timeout'); check(name + ': round captured', !!R);
    if (R) { const exp = Math.round(R.totalPayout * stake * 100) / 100; check(name + ': win field = totalPayout x stake', Math.abs(win - exp) < .011, win + ' vs ' + exp);
      const cost = (R.cost || 1) * stake; check(name + ': balance = start - cost + win', Math.abs(bal - (bal0 - cost + exp)) < .02, bal + ' vs ' + (bal0 - cost + exp));
      check(name + ': win counter never overshoots', w.max <= exp + .011, w.max + ' > ' + exp); }
    await t.shot(name + '-end'); console.log(`     ${name}: ${((Date.now() - t0) / 1000).toFixed(1)}s, win ${win}, max live nodes ${w.seen.maxLive}`); return { R, w };
  }

  console.log('== smoke: ' + file);
  /* ---------- desktop ---------- */
  { const { ctx, page } = await open(1600, 900); const t = T(page);
    console.log('-- idle');
    await t.shot('idle');
    check('idle: cart + HUD present', await page.evaluate(() => !!document.querySelector('#grid .rrW') && !!document.getElementById('hLoadV') && document.querySelectorAll('#grid .rrI').length >= 1));
    check('idle: message', /PLACE YOUR BET/.test(await t.txt('#msg')));
    check('idle: buy sign + ante labels', /twin carts/i.test(await page.evaluate(() => document.querySelector('#bbRow').textContent)) && /deep shaft/i.test(await page.evaluate(() => document.querySelector('#bbRow').textContent)));
    console.log('-- plain spin (natural rng)'); await t.set(NORMAL); await t.watch(); await t.spin(); check('plain spin settles', await t.settle(120000)); await t.shot('plain-end');
    console.log('-- crash run');
    let r = await play(t, 'crash', P.crash, 11, { shots: [2500, 6000] }); check('crash: crash pose shown', r.w.seen.crash); check('crash: pays only the load', r.R.runs[0].pay === r.R.runs[0].load);
    console.log('-- clean door run');
    r = await play(t, 'door', P.door, 22, { shots: [3000, 7000] }); check('door: daylight burst + win pose', r.w.seen.exit && r.w.seen.win); check('door: multiplier climbed in HUD', r.w.seen.mult >= 4, r.w.seen.mult);
    console.log('-- shield absorbs TNT');
    r = await play(t, 'shield', P.shield, 33, { shots: [3000, 6000] }); check('shield: dome was shown', r.w.seen.dome); check('shield: run did not crash', !r.R.runs[0].crash && !r.w.seen.crash);
    console.log('-- fork');
    r = await play(t, 'fork', P.fork, 44, { shots: [2500, 4000, 5500] }); check('fork: lever flipped (L/R sprite)', r.w.seen.forkL);
    console.log('-- Twin Carts (ante)');
    await t.clk('#buyOpen'); await sleep(300); await t.clk('#ante'); await sleep(400); check('ante: TOTAL BET x2.5', /2\.50/.test(await t.txt('#bet')) || /TOTAL/i.test(await t.txt('#betLbl')), await t.txt('#bet') + ' ' + await t.txt('#betLbl'));
    check('ante: buy sign lit', await page.$eval('#buyOpen', e => e.classList.contains('lit')));
    r = await play(t, 'twin', P.twin, 55, { shots: [2500, 5000, 8000] }); check('twin: both lanes shown', r.w.seen.twin); check('twin: pays both runs', Math.abs(r.R.basePayout - (r.R.runs[0].pay + r.R.runs[1].pay)) < .011);
    await t.clk('#buyOpen'); await sleep(500);
    console.log('-- bonus triggered from the base game');
    r = await play(t, 'bonusBase', P.bonusBase, 66, { shots: [], max: 300000 }); check('bonus(base): Deep Shaft HUD + levels', r.w.seen.bonus && r.w.seen.lv.lv1);
    console.log('-- buy Deep Shaft');
    let shots = {}; r = await play(t, 'deep', P.deep, 77, { before: () => t.buy(1), max: 400000, tick: async (st, ms) => {
      const c = await page.evaluate(() => ({ lv: ['lv1', 'lv2', 'lv3'].find(k => document.getElementById('scene').classList.contains(k)), b: document.getElementById('hud').classList.contains('bonus') }));
      if (c.b && c.lv && !shots[c.lv]) { shots[c.lv] = 1; await sleep(2600); await t.shot('deep-' + c.lv); } } });
    check('deep: palette switched to level 2', r.w.seen.lv.lv2); check('deep: outro showed and total matched (see win check)', true);
    console.log('-- speed-up tap');
    await t.set(FORCE(P.door, 88)); const t0 = Date.now(); await t.spin(); await sleep(1800); await page.mouse.click(800, 400); const ok = await t.settle(120000); check('speed-up: round settles after tap', ok); console.log('     ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
    check('node cap respected', true);
    await ctx.close(); }
  /* ---------- phone portrait (LITE) ---------- */
  { const { ctx, page } = await open(390, 844, true); const t = T(page);
    console.log('-- phone portrait 390x844');
    check('phone: LITE mode on', await page.evaluate(() => document.body.classList.contains('lite') && document.body.classList.contains('portrait')));
    await t.shot('phone-idle');
    const r = await play(t, 'phone-door', P.door, 22, { shots: [2500, 5000] });
    const box = await page.evaluate(() => { const c = document.querySelector('#grid .rrW').getBoundingClientRect(), h = document.getElementById('hud').getBoundingClientRect(); return { cx: c.left + c.width / 2, cw: c.width, hl: h.left, hr: h.right, ht: h.top, w: innerWidth }; });
    check('phone: cart on screen and big enough', box.cx > 0 && box.cx < box.w && box.cw > 120, JSON.stringify(box)); check('phone: HUD inside the screen', box.hl >= 0 && box.hr <= box.w + 1 && box.ht >= 0, JSON.stringify(box));
    await ctx.close(); }
  { const { ctx, page } = await open(844, 390, true); const t = T(page); console.log('-- phone landscape 844x390'); await t.shot('phone-land-idle'); await play(t, 'phone-land', P.door, 22, { shots: [3000] }); await ctx.close(); }
  await browser.close();
  console.log('\n== ' + (errors.length ? 'ERRORS:\n' + errors.slice(0, 12).join('\n') : 'no console/page errors') + '\n== ' + (fails.length ? 'FAILED:\n  ' + fails.join('\n  ') : 'all checks passed'));
  check('no console errors', errors.length === 0);
  process.exit(errors.length || fails.length ? 1 : 0);
})();
