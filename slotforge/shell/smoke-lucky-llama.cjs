/* Smoke test for Lucky Llama Fiesta on the shared shell: node slotforge/shell/smoke-lucky-llama.cjs [build.html] [--out DIR]
 * idle (board, jackpot plaques, ladder, buy sign without a price), a line win (callout plate, thick line, hit cells, dimmed rest, counter), a no-win,
 * scatter tease (slow reel glow + text), a Piñata Link from start to end (locks, resets, jackpot plaque, cracks, TOTAL banner), a Poncho Parade
 * (sticky wilds, ladder steps, spins left, Collector grab), a buy through the menu, Fiesta Luck (bet-up), the tap speed-up, the 4 phone/desktop viewports
 * and LITE mode. Rounds are forced by overriding SLOT_ENGINE.playRound. Totals and balances are checked after every round, 0 console/page errors. */
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ONLY = (opt('--only') || '').split(',').filter(Boolean), want = n => !ONLY.length || ONLY.includes(n);   // --only line,tease,link,parade,buy,speed,portrait,sound,tease,link,parade,buy,speed,portrait
const SCRATCH = '/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/ll/smoke';
const ROOT = path.resolve(__dirname, '../..');
const SEED = `(() => {
  const mk = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const r = mk(20261007); Math.random = mk(77);
  crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(r() * 4294967296); return a; };
})();`;
const FORCE = (pred, tag) => `(() => { const o = window.__origPR || (window.__origPR = SLOT_ENGINE.playRound); let s = ${tag}; const rg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  SLOT_ENGINE.playRound = (r, a) => { for (let i = 0; i < 900000; i++) { const x = o(rg, a); if ((${pred})(x)) { window.__R = x; return x; } } return o(r, a); }; })();`;
const P = {
  line: 'x => !x.ante && !x.bought && !x.bonusTriggered && x.spin.wins.length >= 2 && x.spin.wins.length <= 3 && x.totalPayout > 1 && x.totalPayout < 10 && x.spin.wilds.length > 0',
  many: 'x => !x.ante && !x.bought && !x.bonusTriggered && x.spin.wins.length >= 6 && x.totalPayout < 19',
  nowin: 'x => !x.ante && !x.bought && x.totalPayout === 0 && !x.bonusTriggered',
  teaseS: 'x => !x.ante && !x.bought && !x.bonusTriggered && x.spin.teaseKind === "scatter"',
  teaseM: 'x => !x.ante && !x.bought && !x.bonusTriggered && x.spin.teaseKind === "money"',
  link: 'x => !x.bought && x.bonusTriggered && x.bonus.type === "link" && x.bonus.spins.length >= 4 && x.bonus.spins.length <= 7 && x.bonus.pinatas <= 10 && !x.bonus.jackpots.length',
  linkJp: 'x => x.bought === "link" && x.bonus.jackpots.length > 0 && x.bonus.spins.length <= 7 && !x.bonus.fullBoard',
  parade: 'x => !x.bought && !x.ante && x.bonusTriggered && x.bonus.type === "parade" && x.bonus.spins.length <= 9 && x.bonus.spins.some(s => s.ladderStep >= 3) && x.bonus.spins.some(s => s.grab.values.length > 0) && x.totalPayout < 150',
  buyLink: 'x => x.bought === "link" && x.bonus.spins.length <= 7 && x.totalPayout < 200',
  buyParty: 'x => x.bought === "party" && x.bonus.spins.length <= 9 && x.totalPayout < 800',
  ante: 'x => x.ante && !x.bonusTriggered',
  any: 'x => !x.ante && !x.bought && !x.bonusTriggered'
};
(async () => {
  const file = path.resolve(args.find(a => !a.startsWith('--') && a !== opt('--out') && a !== opt('--only')) || path.join(ROOT, 'lucky-llama-fiesta-standalone.html'));
  const outDir = opt('--out') || SCRATCH; fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const errors = [], fails = [];
  const check = (name, ok, extra = '') => { if (!ok) fails.push(name + (extra ? ' (' + extra + ')' : '')); console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${extra && !ok ? '  ' + extra : ''}`); };
  async function open(vw, vh, mobile, q = '') {
    const ctx = await browser.newContext(mobile ? { viewport: { width: vw, height: vh }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: vw, height: vh } });
    await ctx.addInitScript(SEED); const page = await ctx.newPage();
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|fonts\.g/i.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto('file://' + file + q); await sleep(900); return { ctx, page };
  }
  const T = page => ({
    txt: sel => page.$eval(sel, e => e.textContent.trim()),
    usd: t => +t.replace(/[$,]/g, ''),
    shot: async name => { await page.screenshot({ path: path.join(outDir, name + '.png') }); },
    set: code => page.evaluate(code),
    /* sample the page every 40 ms into window.__w (what was seen, max values) */
    watch: () => page.evaluate(() => { clearInterval(window.__wi); window.__w = { wins: [], max: 0, co: [], lines: 0, hit: 0, focus: 0, tease: 0, locked: 0, cracked: 0, sticky: 0, ladder: {}, jp: 0, plates: {}, swing: 0, bonus: 0, logoOff: 0, respins: [], spinsLeft: [], total: 0, grand: 0, msgs: [], reels: 0, t0: performance.now(), tSpinEnd: 0 };
      const $ = id => document.getElementById(id), W = window.__w;
      window.__wi = setInterval(() => { const v = +$('win').textContent.replace(/[$,]/g, ''); W.wins.push(v); W.max = Math.max(W.max, v);
        if ($('coLine').classList.contains('on')) { W.coW = Math.max(W.coW || 0, $('coLine').getBoundingClientRect().width); const t = $('coLineT').textContent; if (W.co[W.co.length - 1] !== t) W.co.push(t); }
        W.lines = Math.max(W.lines, [...document.querySelectorAll('#lines g')].filter(g => +g.style.opacity > 0).length);
        W.hit = Math.max(W.hit, document.querySelectorAll('#grid .cell.hit').length); if ($('grid').classList.contains('focus')) W.focus++;
        if (document.querySelector('.reel.tease')) W.tease++; if (document.querySelector('.reel.on')) W.reels++;
        W.locked = Math.max(W.locked, document.querySelectorAll('#grid .cell.locked').length); W.cracked = Math.max(W.cracked, document.querySelectorAll('#grid .cell.cracked').length);
        W.sticky = Math.max(W.sticky, document.querySelectorAll('#grid .cell.sticky').length); const l = $('ladder').getAttribute('class').split(' ')[0]; W.ladder[l] = 1;
        if (document.querySelector('#jps .jp.lit')) W.jp++; ['lkRespins', 'lkTotal', 'pdSpins', 'pdCallMult', 'pdCallSpins', 'grandPlate'].forEach(id => { if ($(id).classList.contains('on')) W.plates[id] = 1; });
        { const c = $('pdCollector'); if (c && c.getClientRects().length && getComputedStyle(c).display !== 'none') W.swing++; } if ($('scene').classList.contains('bonus')) W.bonus++; if ($('logo').classList.contains('off')) W.logoOff++;
        if ($('lkRespins').classList.contains('on')) { const n = $('lkRespinsN').textContent; if (W.respins[W.respins.length - 1] !== n) W.respins.push(n); }
        if ($('pdSpins').classList.contains('on')) { const n = $('pdSpinsN').textContent; if (W.spinsLeft[W.spinsLeft.length - 1] !== n) W.spinsLeft.push(n); }
        const m = $('msg').textContent; if (W.msgs[W.msgs.length - 1] !== m) W.msgs.push(m); }, 40); }),
    W: () => page.evaluate(() => window.__w),
    settle: async (maxMs = 150000, onTick) => { const t0 = Date.now(); let lastSplash = 0, idle = 0, hb = 0;
      while (Date.now() - t0 < maxMs) {
        if (process.env.HB && Date.now() - hb > 15000) { hb = Date.now(); console.log('   ...', Math.round((Date.now() - t0) / 1000) + 's', await page.evaluate(() => JSON.stringify({ busy: document.getElementById('p').disabled, sim: Math.round(__ll.simT), co: document.getElementById('coLineT').textContent, rn: document.getElementById('lkRespinsN').textContent, intro: !document.getElementById('introM').hidden, outro: !document.getElementById('outroM').hidden }))); }
        const st = await page.evaluate(() => ({ busy: document.getElementById('p').disabled, intro: !document.getElementById('introM').hidden, outro: !document.getElementById('outroM').hidden, big: document.getElementById('big').classList.contains('show') }));
        if (onTick) await onTick(st, Date.now() - t0);
        if (st.intro || st.outro) { idle = 0; if (Date.now() - lastSplash > 700) { await sleep(600); await page.click(st.intro ? '#introM' : '#outroM', { position: { x: 60, y: 60 }, force: true }).catch(() => {}); lastSplash = Date.now(); } }
        else if (st.big) { idle = 0; await page.click('#big', { force: true }).catch(() => {}); }
        else if (!st.busy) { if (++idle >= 6) return true; } else idle = 0;
        await sleep(100); }
      return false; },
    spin: () => page.click('#spin', { force: true }),
    buy: async n => { await page.click('#buyOpen', { force: true }); await sleep(300); await page.click('#buy' + n, { force: true }); await sleep(300); await page.click('#cYes', { force: true }); },
    boardOk: () => page.evaluate(() => { const c = window.__ll.cells; return c.length === 15 && c.every(e => e._code) && c.every((e, i) => { const b = e.getBoundingClientRect(), g = document.getElementById('grid').getBoundingClientRect(); return b.width > 20 && b.left >= g.left - 2 && b.right <= g.right + 2; }); })
  });
  /* one forced round: settles, money checks; returns {R, w, win, bal, stake, ms} */
  async function play(t, name, pred, tag, o = {}) {
    await t.set(FORCE(pred, tag)); await t.watch(); const bal0 = t.usd(await t.txt('#bal')); const t0 = Date.now(); let k = 0; const shots = o.shots || [];
    if (o.before) await o.before(); else await t.spin();
    const ok = await t.settle(o.max || 150000, async (st, ms) => { while (k < shots.length && ms > shots[k]) { await t.shot(name + '-' + shots[k]); k++; } if (o.tick) await o.tick(st, ms); });
    await sleep(500); const R = await t.set('window.__R'), w = await t.W(); const ante = await t.set("document.getElementById('buyOpen').classList.contains('lit')");
    const bet = t.usd(await t.txt('#bet')), win = t.usd(await t.txt('#win')), bal = t.usd(await t.txt('#bal')); const stake = ante ? bet / 2 : (o.stake || bet);
    check(name + ': settles', ok, 'timeout'); check(name + ': round captured', !!R);
    if (R) { const cost = Math.round(stake * R.cost * 100) / 100, exp = Math.round(R.totalPayout * stake * 100) / 100;
      check(name + ': win field = totalPayout x stake', Math.abs(win - exp) < .011, win + ' vs ' + exp);
      check(name + ': balance = before - cost + win', Math.abs(bal - (bal0 - cost + exp)) < .011, bal + ' vs ' + (bal0 - cost + exp).toFixed(2));
      check(name + ': win counter never goes down', w.wins.every((v, i) => i === 0 || v >= w.wins[i - 1] - .001 || v === 0), JSON.stringify(w.wins.slice(0, 60))); }
    check(name + ': board intact after the round', await t.boardOk()); check(name + ': no reel left spinning', await t.set("window.__ll.reels.every(r => r.mode === 'idle')"));
    return { R, w, win, bal, stake, ms: Date.now() - t0, ok };
  }
  const resetPR = t => t.set("if (window.__origPR) SLOT_ENGINE.playRound = window.__origPR; window.__R = null;");

  console.log('== desktop 1280x720');
  let { ctx, page } = await open(1280, 720); let t = T(page), r;
  console.log('idle');
  check('idle: 15 cells + symbols', await t.boardOk()); await t.shot('idle');
  check('idle: jackpot plaques visible with values', await page.$$eval('#jps .jp.on .jv', e => e.length === 4 && e.every(x => /\d/.test(x.textContent))));
  check('idle: ladder dim (m0)', await page.$eval('#ladder', e => e.getAttribute('class') === 'm0'));
  check('idle: buy sign has no price', await page.$eval('#buyOpen', e => !/[$€£¥]|\d/.test(e.textContent)));
  check('idle: no animations running on the idle board', await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#grid')).length === 0));
  check('idle: logo shown, strips hidden', await page.evaluate(() => !document.getElementById('logo').classList.contains('off') && !document.querySelector('.reel.on')));

  if (want('line')) {
  console.log('line win'); r = await play(t, 'line', P.line, 1, { shots: [1200, 3000] });
  check('line: callout "LINE n - kx NAME - $x"', r.w.co.some(c => /^LINE \d+ - [345]x [A-Z ]+(\(WILD\) )?- \$[\d.,]+/.test(c)), JSON.stringify(r.w.co));
  check('line: thick line drawn', r.w.lines >= 1); check('line: winning symbols hit', r.w.hit >= 3); check('line: others dimmed', r.w.focus > 3);
  check('line: reels animate (strips on)', r.w.reels > 10); check('line: counter reached the total', Math.abs(r.w.max - r.R.totalPayout * r.stake) < .011);
  check('line: reel stops left to right ~220 ms (spin 1.5-3.2 s incl. lines)', r.ms > 1500 && r.ms < 12000, r.ms + 'ms');
  console.log('many lines (grouped)'); r = await play(t, 'many', P.many, 2);
  check('many: grouped callout "+n MORE LINES"', r.w.co.some(c => /^\+\d+ MORE LINES - /.test(c)), JSON.stringify(r.w.co));
  check('many: lines shown singly then together (max lines > 1)', r.w.lines > 1);
  console.log('no win'); r = await play(t, 'nowin', P.nowin, 3); check('nowin: nothing hit', r.w.hit === 0 && r.w.lines === 0 && r.win === 0);
  check('nowin: lose message', /NO WIN/i.test(await t.txt('#msg')));

  }
  if (want('tease')) {
  console.log('tease'); r = await play(t, 'teaseS', P.teaseS, 4, { shots: [1900] });
  check('teaseS: slow reel glows (tease class seen)', r.w.tease > 5); check('teaseS: "ONE MORE" text', r.w.co.some(c => /ONE MORE|DRUMS/.test(c)), JSON.stringify(r.w.co));
  r = await play(t, 'teaseM', P.teaseM, 5); check('teaseM: slow reel glows', r.w.tease > 5); check('teaseM: piñata counter text', r.w.co.some(c => /PIÑATAS\.\.\. (ONE|TWO) MORE\?/.test(c)), JSON.stringify(r.w.co));

  }
  if (want('link')) {
  console.log('piñata link'); r = await play(t, 'link', P.link, 6, { shots: [6000, 9000, 14000], max: 170000 });
  const B = r.R.bonus;
  check('link: lock rings on every piñata at the end', r.w.locked >= B.start.length && r.w.locked <= B.pinatas); check('link: respins plate 3 -> 0', r.w.respins[0] === '3' && r.w.respins.includes('0'), r.w.respins.join(','));
  check('link: every landed piñata locked (locks = pinatas)', r.w.locked === B.pinatas, r.w.locked + ' vs ' + B.pinatas); check('link: TOTAL banner', !!r.w.plates.lkTotal);
  check('link: every piñata cracked', r.w.cracked === B.cracks.length, r.w.cracked + ' vs ' + B.cracks.length); check('link: dusk scene + logo off', r.w.bonus > 20 && r.w.logoOff > 20);
  check('link: callouts', ['LOCK IN PLACE', 'RESPIN', 'NEW PIÑATA', 'CRACK'].every(k => r.w.co.some(c => c.includes(k))), JSON.stringify(r.w.co.slice(0, 12)));
  check('link: scene/logo restored', await page.evaluate(() => !document.getElementById('scene').classList.contains('bonus') && !document.getElementById('logo').classList.contains('off')));
  check('link: jackpot plaques back to idle', await page.evaluate(() => document.querySelectorAll('#jps .jp.lit').length === 0 && document.querySelectorAll('#jps .jp.on').length === 4));

  }
  if (want('parade')) {
  console.log('poncho parade'); r = await play(t, 'parade', P.parade, 8, { shots: [4000, 9000, 16000], max: 170000 });
  const PB = r.R.bonus; const lastSp = PB.spins[PB.spins.length - 1];
  check('parade: sticky wilds kept (count = last wildCount)', r.w.sticky === lastSp.wildCount, r.w.sticky + ' vs ' + lastSp.wildCount);
  check('parade: ladder steps lit (m0 -> a step >= 3, at least 2 steps)', Object.keys(r.w.ladder).some(k => /m[3-6]/.test(k)) && Object.keys(r.w.ladder).length >= 3, Object.keys(r.w.ladder).join(','));
  check('parade: multiplier callout', !!r.w.plates.pdCallMult); check('parade: spins left counts down to 0', r.w.spinsLeft[r.w.spinsLeft.length - 1] === '0' && r.w.spinsLeft.length >= PB.spins.length - 1, r.w.spinsLeft.join(','));
  check('parade: no collector character visible beside the board', r.w.swing === 0); check('parade: grab callout "COLLECTOR GRABS +$x (no multiplier)"', r.w.co.some(c => /^COLLECTOR GRABS \+\S+ \(no multiplier\)/.test(c)), JSON.stringify(r.w.co.filter(c => /GRAB/.test(c))));
  check('parade: wins show the multiplier "(x3)"', r.w.co.some(c => /\(x[2-9]|\(x10\)/.test(c)), JSON.stringify(r.w.co.slice(0, 8)));
  check('parade: ladder back to m0 and sticky cleared at the end', await page.evaluate(() => document.getElementById('ladder').getAttribute('class') === 'm0' && document.querySelectorAll('.cell.sticky').length === 0));

  }
  if (want('buy')) {
  console.log('buy through the menu (Piñata Link)'); await resetPR(t);
  await page.click('#buyOpen', { force: true }); await sleep(400); await t.shot('buymenu');
  check('buy menu: Fiesta Luck + 3 buys, names', await page.$$eval('#bbRow .bbc h3', e => e.map(x => x.textContent).join('|') === 'Fiesta Luck|Poncho Parade|Piñata Link|Party Pack'));
  await page.click('#bbRow .bbc:nth-child(1) .go', { force: true }); await sleep(300);   // activate Fiesta Luck then continue with the buy
  check('fiesta luck: sign lit, TOTAL BET, badge', await page.evaluate(() => document.getElementById('buyOpen').classList.contains('lit') && document.getElementById('betLbl').textContent === 'TOTAL BET' && !document.getElementById('feverBadge').hidden)); await t.shot('ante');
  r = await play(t, 'ante', P.ante, 9, { stake: 1 }); check('ante: cost 2x', r.R.cost === 2);
  await page.click('#buyOpen', { force: true }); await sleep(300); check('ante: tap on the lit sign switches it off', await page.evaluate(() => !document.getElementById('buyOpen').classList.contains('lit')));
  r = await play(t, 'buyLink', P.buyLink, 10, { before: () => t.buy(2), max: 170000 }); check('buyLink: cost 60x', r.R.cost === 60 && r.R.bought === 'link'); check('buyLink: link played (6+ locks, cracks)', r.w.locked >= 6 && r.w.cracked === r.R.bonus.cracks.length);
  r = await play(t, 'linkJp', P.linkJp, 7, { before: () => t.buy(2), max: 170000 }); check('linkJp: jackpot plaque lit', r.w.jp > 5); check('linkJp: jackpot callout', r.w.co.some(c => /JACKPOT!/.test(c)), JSON.stringify(r.w.co.filter(c => /JACK/.test(c))));
  r = await play(t, 'buyParty', P.buyParty, 11, { before: () => t.buy(3), max: 170000 }); check('buyParty: cost 284x', r.R.cost === 284); check('buyParty: 3 sticky ponchos first (callout + ladder m3)', r.w.co.some(c => /3 STICKY PONCHOS/.test(c)) && Object.keys(r.w.ladder).includes('m3'));

  }
  if (want('speed')) {
  console.log('tap speed-up'); await resetPR(t); await t.set(FORCE(P.any, 77)); let t0 = Date.now(); await t.spin(); await t.settle(60000); const normal = Date.now() - t0;
  await t.set(FORCE(P.any, 77)); t0 = Date.now(); await t.spin(); await sleep(450); await page.mouse.click(300, 60); await t.settle(60000); const fast = Date.now() - t0;
  check('speed-up: a tap during the spin shortens it', fast < normal * .8, `${fast} vs ${normal} ms`);
  check('speed-up: strips and animations stay smooth (no frames over 120 ms in a spin)', await (async () => { await t.set("window.__gaps = []; (function f(a){ requestAnimationFrame(b => { window.__gaps.push(b - a); if (window.__gaps.length < 400) f(b); }); })(performance.now())"); await t.set(FORCE(P.any, 91)); await t.spin(); await t.settle(60000); const g = await t.set('window.__gaps'); return Math.max(...g.slice(5)) < 160; })());

  }
  console.log('== phone portrait');
  if (want('portrait')) {
  for (const [w, h] of [[390, 844], [360, 740], [430, 932]]) {
    await ctx.close(); ({ ctx, page } = await open(w, h, true)); t = T(page);
    const b = await page.evaluate(() => { const g = document.getElementById('grid').getBoundingClientRect(), s = document.getElementById('stage'); return { gl: g.left, gr: g.right, gt: g.top, gb: g.bottom, sw: document.documentElement.scrollWidth, iw: innerWidth, ih: innerHeight, lg: document.getElementById('logo').getBoundingClientRect().top, bs: document.getElementById('buyOpen').getBoundingClientRect().top }; });
    check(`${w}x${h}: board fills ~90% of the width`, (b.gr - b.gl) / b.iw > .82 && (b.gr - b.gl) / b.iw < .99, ((b.gr - b.gl) / b.iw).toFixed(2));
    check(`${w}x${h}: no horizontal scroll`, b.sw <= b.iw + 1); check(`${w}x${h}: logo and board inside the screen, board above the buy sign`, b.lg >= -2 && b.gb < b.bs, `logo ${b.lg} board bottom ${b.gb} sign ${b.bs}`);
    check(`${w}x${h}: ladder bar + jackpots inside the width`, await page.evaluate(() => ['ladderW', 'jps'].every(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.width > 100; })));
    await t.shot(`portrait-${w}x${h}-idle`);
    if (w === 390) {
      r = await play(t, 'p-parade', P.parade, 12, { shots: [5000, 12000], max: 170000 });
      check('portrait parade: plates inside the screen', await page.evaluate(() => ['pdSpins', 'ladderW', 'coLine'].every(id => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return r.left >= -4 && r.right <= innerWidth + 4; })));
      await resetPR(t); r = await play(t, 'p-link', P.link, 13, { shots: [6500, 10000, 20000], max: 170000 });
      r = await play(t, 'p-line', P.line, 14, { shots: [1300, 2300] });
      check('portrait line: callout plate readable (width > 60% of the screen)', r.w.coW > 390 * .6, String(r.w.coW));
    }
  }
  }
  await ctx.close(); console.log('== LITE (phone mode) 1280x720'); ({ ctx, page } = await open(1280, 720, false, '?lite=1')); t = T(page);
  r = await play(t, 'lite-line', P.line, 15); check('lite: body has class lite', await page.evaluate(() => document.body.classList.contains('lite')));
  console.log('== landscape 1280x720 + wide 2560x1080 + 844x390');
  for (const [w, h] of [[2560, 1080], [844, 390]]) { await ctx.close(); ({ ctx, page } = await open(w, h, w < 1000)); t = T(page); await t.shot(`vp-${w}x${h}`); check(`${w}x${h}: board visible`, await t.boardOk()); check(`${w}x${h}: no scroll bars`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.documentElement.scrollHeight <= innerHeight + 1)); }
  if (want('sound')) { console.log('sound recipes (own page: audio makes headless slow)'); const so = await open(1280, 720, false); await so.page.mouse.click(640, 60); await sleep(400);
    check('sfx: every recipe runs without throwing', await so.page.evaluate(() => { const R = window.__llR; if (!R) return 'no recipes'; const bad = []; for (const k of Object.keys(R)) { try { R[k](1); R[k](0); } catch (e) { bad.push(k + ':' + e.message); } } return bad.length ? bad.join(',') : true; }) === true); await so.ctx.close(); }
  await ctx.close(); await browser.close();
  console.log('console/page errors:', errors.length); errors.slice(0, 10).forEach(e => console.log('  ', e)); check('no console/page errors', errors.length === 0);
  console.log(fails.length ? `\n${fails.length} FAILED:\n - ` + fails.join('\n - ') : '\nALL OK'); process.exit(fails.length ? 1 : 0);
})();
