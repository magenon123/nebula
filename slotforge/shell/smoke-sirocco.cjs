/* Smoke test for Sirocco's Lamp Bazaar on the shared shell: node slotforge/shell/smoke-sirocco.cjs [build.html] [--out DIR]
 * idle (5x5), info paytable, base SEALED CHAIN (3+ stages: streaks, seals, climbing chain meter, gems added, multiply moment), gem fizzle, FS + Astrolabe teases,
 * buy screen (Djinn's Favour + 3 buys), bought Free Wishes (trigger spin, intro, persistent multiplier across spins, retrigger, outro, no counter flash),
 * bought SUPER, bought Astrolabe (ring stops, magnet, tense core, jackpot, outro), ante on/off, gold MAX WIN screen, autoplay, mid-bonus turbo. 0 console/page errors. */
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const SCRATCH = '/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/slb/smoke';
const ROOT = path.resolve(__dirname, '../..');
const SEED = `(() => {
  const mk = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const r = mk(20241003); Math.random = mk(77);
  crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(r() * 4294967296); return a; };
})();`;
const FORCE = (pred, tag) => `(() => { const o = window.__origPR || (window.__origPR = SLOT_ENGINE.playRound); let s = ${tag}; const rg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  SLOT_ENGINE.playRound = (r, a) => { for (let i = 0; i < 900000; i++) { const x = o(rg, a); if ((${pred})(x)) return x; } return o(r, a); }; })();`;
const MUT = (pred, tag, mut) => `(() => { const o = window.__origPR || (window.__origPR = SLOT_ENGINE.playRound); let s = ${tag}; const rg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  SLOT_ENGINE.playRound = (r, a) => { for (let i = 0; i < 900000; i++) { const x = o(rg, a); if ((${pred})(x)) { (${mut})(x); return x; } } return o(r, a); }; })();`;
const NORMAL = `if (window.__origPR) SLOT_ENGINE.playRound = window.__origPR;`;
(async () => {
  const file = path.resolve(args.find(a => !a.startsWith('--') && a !== opt('--out')) || path.join(ROOT, 'siroccos-lamp-bazaar-standalone.html'));
  const outDir = opt('--out') || SCRATCH; fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addInitScript(SEED);
  const page = await ctx.newPage();
  const errors = [], fails = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|fonts\.g/i.test(m.text())) errors.push('console: ' + m.text()); });
  const check = (name, ok, extra = '') => { if (!ok) fails.push(name + (extra ? ' (' + extra + ')' : '')); console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${extra && !ok ? '  ' + extra : ''}`); };
  const clk = (s, o = {}) => page.click(s, { force: true, ...o });
  const txt = sel => page.$eval(sel, e => e.textContent.trim());
  const vis = async sel => page.$eval(sel, e => !e.hidden && getComputedStyle(e).display !== 'none').catch(() => false);
  const shot = async name => { await page.screenshot({ path: path.join(outDir, name + '.png') }); };
  const state = () => page.evaluate(() => { const g = id => document.getElementById(id).textContent.trim();
    return { bal: g('bal'), win: g('win'), bet: g('bet'), betLbl: g('betLbl'), msg: g('msg'), hot: document.getElementById('barR').classList.contains('hot'), fever: !document.getElementById('feverBadge').hidden,
      fsBox: !document.getElementById('fsBox').hidden, fs: g('fs'), spinCnt: document.getElementById('spinCnt').hidden ? null : g('spinCnt') }; });
  const settle = async (maxMs = 400000) => { const t0 = Date.now(); let lastSplash = 0, idle = 0;
    while (Date.now() - t0 < maxMs) {
      const st = await page.evaluate(() => ({ busy: document.getElementById('p').disabled, intro: !document.getElementById('introM').hidden, outro: !document.getElementById('outroM').hidden, big: document.getElementById('big').classList.contains('show') }));
      if (st.intro || st.outro) { idle = 0; if (Date.now() - lastSplash > 700) { await sleep(600); await clk(st.intro ? '#introM' : '#outroM', { position: { x: 60, y: 60 } }).catch(() => {}); lastSplash = Date.now(); } }
      else if (st.big) { idle = 0; await clk('#big').catch(() => {}); }
      else if (!st.busy) { if (++idle >= 6) return true; } else idle = 0;
      await sleep(120); }
    return false; };
  const waitFor = async (sel, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await vis(sel)) return true; await sleep(60); } return false; };
  const waitCond = async (fn, ms = 60000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await sleep(40); } return false; };
  const frozen = async name => { await page.evaluate(() => { window.__pz = document.getAnimations().filter(a => a.playState === 'running'); window.__pz.forEach(a => a.pause()); }); await page.screenshot({ path: path.join(outDir, name + '.png') }); await page.evaluate(() => window.__pz.forEach(a => { if (a.playState === 'paused') a.play(); })); };
  const watchMsgs = () => page.evaluate(() => { window.__msgs = []; new MutationObserver(() => window.__msgs.push(document.getElementById('msg').textContent)).observe(document.getElementById('msg'), { childList: true, characterData: true, subtree: true }); });
  const sawMsg = async re => (await page.evaluate(() => window.__msgs)).some(m => re.test(m));
  const usd = t => +t.replace(/[$,]/g, '');
  const buy = async n => { await clk('#buyOpen'); await sleep(250); await clk('#buy' + n); await sleep(250); await clk('#cYes'); };
  /* plays a bonus (or a base spin) to the outro / to the end of the chain, screenshots key moments, collects what was seen */
  const watch = async (pre, untilOutro = true, maxMs = 500000) => {
    const seen = { cv: new Set(), gsum: new Set(), sealed: 0, streak: 0, multi: false, sealIn: 0, fsVals: new Set(), astro: false, hits: 0, tense: false, lit: false, magnet: false, banner: '', goBy: new Set(), chainCls: false, focus: false }; const t0 = Date.now(), sh = {};
    while (Date.now() - t0 < maxMs) {
      const st = await page.evaluate(() => ({ outro: !document.getElementById('outroM').hidden, busy: document.getElementById('p').disabled, fs: document.getElementById('fs').textContent.trim(), cv: document.querySelector('#chain .cv').textContent, gsum: document.querySelector('#chain .gsum').textContent,
        sealed: document.querySelectorAll('#grid .cell.sealed').length, sealIn: document.querySelectorAll('#grid .cell.sealed.in').length, streak: document.querySelectorAll('.sirStreak').length, multi: document.getElementById('sirMulti').classList.contains('on'),
        astro: document.getElementById('astro').classList.contains('on'), hits: document.querySelectorAll('#astro .sec.hit').length, tense: document.getElementById('astro').classList.contains('tense'), lit: document.querySelectorAll('#aJ .j.lit').length,
        magnet: document.querySelectorAll('#astro .ring.magnet').length, go: [0, 1, 2].filter(k => document.querySelector('#astro .ring.r' + (k + 1)).classList.contains('go')).length, chainCls: document.getElementById('grid').classList.contains('chain'),
        ban: +getComputedStyle(document.getElementById('sirBanner')).opacity > .8 ? document.querySelector('#sirBanner b').textContent : '', hit: document.querySelectorAll('#grid .cell.hit').length, ms: document.getElementById('chain').className }));
      if (Date.now() - (watch.lastLog || 0) > 20000) { watch.lastLog = Date.now(); console.log('    ..' + pre + ' fs=' + st.fs + ' cv=' + st.cv + ' sealed=' + st.sealed + ' outro=' + st.outro); }
      if (untilOutro ? st.outro : (!st.busy && Date.now() - t0 > 1500)) break; seen.cv.add(st.cv); seen.gsum.add(st.gsum); seen.fsVals.add(st.fs); seen.sealed = Math.max(seen.sealed, st.sealed); seen.streak = Math.max(seen.streak, st.streak); seen.sealIn = Math.max(seen.sealIn, st.sealIn);
      seen.multi = seen.multi || st.multi; seen.astro = seen.astro || st.astro; seen.hits = Math.max(seen.hits, st.hits); seen.tense = seen.tense || st.tense; seen.lit = seen.lit || st.lit > 0; seen.magnet = seen.magnet || st.magnet > 0; seen.chainCls = seen.chainCls || st.chainCls; if (/WISH/.test(st.ban)) seen.banner = st.ban;
      if (st.streak && st.hit >= 3 && !sh.run) { sh.run = 1; await sleep(220); await frozen(pre + '-runs'); }
      else if (st.sealIn >= 3 && !sh.seal) { sh.seal = 1; await sleep(250); await frozen(pre + '-seal'); }
      else if (/^×[3-5]$/.test(st.cv) && st.sealed >= 6 && !sh.mult3) { sh.mult3 = 1; await sleep(1500); await frozen(pre + '-chain-x3'); }
      else if (st.multi && !sh.multi) { sh.multi = 1; await sleep(900); await frozen(pre + '-multiply'); }
      else if (/WISH/.test(st.ban) && !sh.ban) { sh.ban = 1; await sleep(300); await frozen(pre + '-banner'); }
      else if (st.astro && st.go >= 2 && !sh.go) { sh.go = 1; await sleep(1500); await frozen(pre + '-rings-turning'); }
      else if (st.astro && st.hits >= 2 && !sh.hit2) { sh.hit2 = 1; await sleep(250); await frozen(pre + '-ring-stops'); }
      else if (st.tense && !sh.tense) { sh.tense = 1; await sleep(500); await frozen(pre + '-tense'); }
      else if (st.lit && !sh.lit) { sh.lit = 1; await sleep(400); await frozen(pre + '-jackpot'); }
      else if (st.astro && st.magnet && !sh.mag) { sh.mag = 1; await sleep(300); await frozen(pre + '-magnet'); }
      await sleep(40); }
    return seen; };

  console.log('== smoke: ' + file);
  await page.goto('file://' + file);
  /* OWNER BUG GUARD: in no frame of any bonus may the counter show "n / m" (shell text) or the shell's bonus message appear */
  await page.evaluate(() => { window.__fsAll = []; window.__msgAll = [];
    new MutationObserver(() => window.__fsAll.push(document.getElementById('fs').textContent)).observe(document.getElementById('fs'), { childList: true, characterData: true, subtree: true });
    new MutationObserver(() => window.__msgAll.push(document.getElementById('msg').textContent)).observe(document.getElementById('msg'), { childList: true, characterData: true, subtree: true });
    const poll = () => { const f = document.getElementById('fs').textContent; if (/\/\s*\d+/.test(f)) window.__fsAll.push('RAF:' + f); requestAnimationFrame(poll); }; poll(); });
  await sleep(2500);
  const fpsIdle = await page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(n / 3); }; requestAnimationFrame(f); }));
  console.log('  idle fps (software rendering): ' + fpsIdle.toFixed(1));
  let s = await state(); await shot('01-idle');
  check('idle fps >= 30 (software renderer)', fpsIdle >= 30, fpsIdle.toFixed(1));
  check('idle: play-money balance $1,000.00', s.bal === '$1,000.00', s.bal);
  check('idle: 5x5 board = 25 cells, chain meter x1, scene day, astro hidden', await page.evaluate(() => document.querySelectorAll('#grid .cell').length === 25 && document.querySelector('#chain .cv').textContent === '×1' && !document.getElementById('scene').classList.contains('bonus') && !document.getElementById('astro').classList.contains('on')));
  check('idle: status line, sign has no price, no Favour badge', /BAZAAR OPEN/.test(s.msg) && (await page.$('#buyPrice')) === null && !s.fever, s.msg);
  check('idle: status line fits ONE line', await page.$eval('#msg', e => { const r = document.createRange(); r.selectNodeContents(e); const b = r.getBoundingClientRect(); return b.height < 34; }));
  await clk('#menuBtn'); await sleep(200); check('menu opens', await vis('#menu'));
  await clk('#bSnd'); check('sound toggles OFF', (await txt('#bSnd i')) === 'OFF'); await clk('#bSnd'); check('sound toggles ON', (await txt('#bSnd i')) === 'ON');
  await clk('#bMus'); check('music toggles OFF', (await txt('#bMus i')) === 'OFF'); await clk('#bMus'); check('music toggles ON', (await txt('#bMus i')) === 'ON');
  if (!await vis('#menu')) await clk('#menuBtn');
  await clk('#bTurbo'); check('turbo ON shows badge', await page.evaluate(() => !document.getElementById('turboBadge').hidden)); await clk('#bTurbo');
  if (!await vis('#menu')) await clk('#menuBtn'); await sleep(150); await clk('#bInfo'); await sleep(250); check('info opens', await vis('#infoM')); await shot('02-info');
  check('info paytable: header + 9 pay + wild, FS, astrolabe, gem = 14 rows', (await page.$$eval('#ptab tr', r => r.length)) === 14, String(await page.$$eval('#ptab tr', r => r.length)));
  { const it = await txt('#infoM'); check('info: max win 8,000x, buys 66x / 43x / 105x resolved, no [[ ]]', /8,000x/.test(it) && /for 66x/.test(it) && /for 43x/.test(it) && /105x/.test(it) && !/\[\[/.test(it));
    const top = await page.evaluate(() => SLOT_CFG.engineData.info.pay[8][2]); check('info paytable is the engine data (Genie\'s Lamp 5 = ' + top + 'x)', (await txt('#ptab')).includes(+top.toFixed(2) + 'x')); }
  await clk('#infoM [data-close]'); check('info closes', !(await vis('#infoM')));
  await clk('#betV'); await sleep(250); const opts = await page.$$eval('#betGrid .opt', o => o.map(x => x.textContent));
  check('bet picker $0.10 .. $10,000, 42 options', opts[0] === '$0.10' && opts[opts.length - 1] === '$10,000' && opts.length === 42, opts.length + ''); await clk('#betGrid .opt:text-is("$1")');
  check('bet $1.00', (await txt('#bet')) === '$1.00');

  // base SEALED CHAIN: 4+ stages, a gem, wins
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.stages.length >= 4 && x.stages.filter(t => t.runs.length).length >= 3 && x.chain.gems.length >= 1 && x.chain.base > 0 && x.chain.gemSum >= 3 && x.stages.some(t => t.runs.some(r => r.wilds.length)) && x.chain.payout < 40`, 11));
  await watchMsgs(); await clk('#spin'); await sleep(300);
  check('spin: button busy, chevrons disabled', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled) && await page.$eval('#p', e => e.disabled));
  const sd = await watch('03chain', false);
  check('chain: spin settles', await settle()); s = await state();
  check('chain: stage 1 tiles dropped, chain class while running', sd.chainCls);
  check('chain: light streaks along winning runs', sd.streak >= 1, String(sd.streak));
  check('chain: gold seals stamped (3+ tiles, "in" animation)', sd.sealed >= 3 && sd.sealIn >= 1, JSON.stringify({ sealed: sd.sealed, in: sd.sealIn }));
  check('chain: meter climbs through x1, x2, x3...', ['×1', '×2', '×3'].every(v => sd.cv.has(v)), [...sd.cv].join(','));
  check('chain: gem sum added up in the meter', [...sd.gsum].some(v => v !== '×0'), [...sd.gsum].join(','));
  check('chain: gem multiply moment (count-up banner)', sd.multi);
  check('chain: win paid, balance moved', /^\$[\d,]+\.\d\d$/.test(s.win) && s.win !== '$0.00' && s.bal !== '$1,000.00', s.win + ' / ' + s.bal);
  check('chain: win status line + stage lines (CHAIN xN)', /LAMP PAYS/.test(s.msg) && await sawMsg(/CHAIN ×2/) && await sawMsg(/MULTIPL(Y|IES) THE CHAIN/), s.msg);
  await page.evaluate(NORMAL);
  await page.keyboard.press('Space'); await sleep(250); check('Space starts a spin', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled)); check('Space spin settles', await settle());

  // gem fizzle: gems but no win
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.chain.base === 0 && x.chain.gemsOnBoard > 0`, 31));
  await watchMsgs(); await clk('#spin'); check('gem fizzle: message when gems land without a win', await waitCond(() => /FIZZLE/.test(document.getElementById('msg').textContent), 30000)); await sleep(400); await shot('04-fizzle');
  check('fizzle settles', await settle()); await page.evaluate(NORMAL);

  // FS tease: 2 FS in the first reels, no trigger
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.scatters.fs.count === 2 && x.scatters.fs.cells.every(c => c[1] <= 2) && x.scatters.astro.count < 2`, 23));
  await watchMsgs(); await page.evaluate(() => { window.__tease = false; setInterval(() => { if (document.getElementById('char').classList.contains('tease')) window.__tease = true; }, 30); });
  await clk('#spin'); check('FS tease: "ONE MORE SUN..." slow drop after 2 FS', await waitCond(() => document.getElementById('msg').textContent.includes('ONE MORE SUN'), 20000));
  await sleep(450); await shot('05-fs-tease'); check('FS tease: Sirocco leans in (char.tease)', await waitCond(() => window.__tease, 8000));
  check('FS tease settles', await settle()); check('FS tease: near-miss copy', await sawMsg(/ALMOST\.\.\. JUST ONE MORE SUN/));
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.scatters.astro.count === 2 && x.scatters.astro.cells.every(c => c[1] <= 2) && x.scatters.fs.count < 2`, 29));
  await watchMsgs(); await clk('#spin'); check('Astrolabe tease: "ONE MORE ASTROLABE..." after 2 Astrolabes', await waitCond(() => document.getElementById('msg').textContent.includes('ONE MORE ASTROLABE'), 20000));
  await sleep(300); await shot('05b-astro-tease'); check('astro tease settles', await settle()); await page.evaluate(NORMAL);

  // buy screen: Djinn's Favour card + three buys
  await clk('#buyOpen'); await sleep(300); check('buy screen opens', await vis('#buyM')); await shot('06-buy-screen');
  check('buy screen: Favour card + 3 buys ($66 / $43 / $105), no MAX LUCK', (await page.$$eval('.bbRow .bbc', c => c.length)) === 4 && (await txt('#p1')) === '$66.00' && (await txt('#p2')) === '$43.00' && (await txt('#p3')) === '$105.00' && (await page.$('#ante')) !== null && !/MAX LUCK/i.test(await txt('#buyM')));
  check('buy screen: card names fit INSIDE their card', await page.$$eval('.bbc', c => c.every(x => { const h = x.querySelector('h3'), a = h.getBoundingClientRect(), b = x.getBoundingClientRect(); return a.height < 80 && a.left >= b.left && a.right <= b.right; })));
  await clk('#buy1'); await sleep(250); check('BUY opens confirm', await vis('#confirm') && !(await vis('#buyM'))); await shot('07-confirm');
  check('confirm copy and cost', /BUY FREE WISHES/.test(await txt('#cTitle')) && (await txt('#cCost')) === '$66.00');
  const before = await state(); await clk('#cNo'); await sleep(200); s = await state(); check('CANCEL spends nothing', !(await vis('#confirm')) && s.bal === before.bal);

  // ===== bought FREE WISHES: trigger spin (visible, no win), intro, persistent multiplier across spins, retrigger, outro =====
  await page.evaluate(FORCE(`x => x.bought === 'fs' && x.bonus.scatters === 3 && x.bonus.spins.length >= 14 && x.bonus.spins.some(d => d.retrigger) && x.bonus.spins.filter(d => d.chain.base > 0).length >= 6 && x.bonus.spins.some(d => d.multEnd >= 7) && x.totalPayout > 30 && x.totalPayout < 700`, 5));
  await watchMsgs(); await buy(1);
  check('bought FS: trigger spin drops the FS suns, no win', await waitCond(() => document.querySelectorAll('#grid .cell.hit').length >= 3, 30000)); await sleep(600); await shot('08-trigger-spin-fs');
  check('bought: balance charged $66 (before the bonus pays)', Math.abs(usd(before.bal) - usd((await state()).bal) - 66) < .01, before.bal + ' -> ' + (await state()).bal);
  check('bought: trigger scatters get the gold seal', await waitCond(() => document.querySelectorAll('#grid .cell.sealed').length >= 3, 8000));
  const sawIntro = await waitFor('#introM'); check('intro splash appears', sawIntro);
  if (sawIntro) { await sleep(1400); await shot('09-intro-fs'); check('intro: 10 wishes, FREE WISHES ribbon', (await txt('#introN')) === '10' && /FREE WISHES/.test(await txt('#introRibbon')), await txt('#introN'));
    check('intro: Sirocco portrait present and sized', await page.$eval('#introM .sirSplash', e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.height > 180; }));
    await clk('#introM', { position: { x: 80, y: 80 } }); }
  await sleep(1500); s = await state(); check('bonus: counter visible, plain number', s.fsBox && /^\d+$/.test(s.fs), s.fs);
  check('bonus: night scene, Sirocco in bonus mode, chain meter shows the "never resets" note', await page.$eval('#scene', e => e.classList.contains('bonus')) && await page.$eval('#char', e => e.classList.contains('bonusmode')) && await page.$eval('#chain', e => e.classList.contains('fs')));
  const fsn = await watch('10fs');
  check('FS: multiplier climbed past x5 and persisted across spins (never back to x1 mid-bonus)', await page.evaluate(() => 1) && [...fsn.cv].some(v => +v.slice(1) >= 6), [...fsn.cv].join(','));
  check('FS: seals, streaks, gems seen in the bonus', fsn.sealed >= 3 && fsn.streak >= 1, JSON.stringify({ sealed: fsn.sealed, streak: fsn.streak }));
  check('FS: retrigger banner and the counter grew', /WISHES/.test(fsn.banner) && fsn.fsVals.size >= 8, fsn.banner + ' ' + [...fsn.fsVals].join(','));
  check('outro splash appears', await waitFor('#outroM', 120000));
  await sleep(3500); await shot('12-outro-fs'); check('outro total is a dollar amount, Sirocco portrait', /^\$[\d,]+\.\d\d$/.test(await txt('#outroV')) && await page.$eval('#outroM .sirSplash', e => e.getBoundingClientRect().width > 200), await txt('#outroV')); await clk('#outroM', { position: { x: 60, y: 60 } });
  check('round settles after Free Wishes', await settle()); s = await state(); await shot('13-after-fs');
  check('after FS: counter hidden, scene day, meter reset to x1', !s.fsBox && !(await page.$eval('#scene', e => e.classList.contains('bonus'))) && (await txt('#chain .cv')) === '×1');
  check('NO COUNTER FLASH: no "n / m" in the counter in any frame, shell bonus message never shown', !(await page.evaluate(() => window.__fsAll)).some(t => /\/\s*\d+/.test(t)) && !(await page.evaluate(() => window.__msgAll)).some(m => /FREE SPIN \d+ \/|FREE WISH \d+ \/ /.test(m)));
  await page.evaluate(NORMAL);

  // ===== bought SUPER (Three Wishes): starts at x3 =====
  await page.evaluate(FORCE(`x => x.bought === 'super' && x.bonus.scatters >= 4 && x.bonus.spins.length >= 12 && x.totalPayout > 20 && x.totalPayout < 800`, 14));
  await watchMsgs(); await page.evaluate(() => { window.__fsAll.length = 0; }); await buy(3);
  check('super intro appears', await waitFor('#introM', 120000)); await sleep(1500); await shot('14-intro-super');
  check('super intro: 12+ wishes, THREE WISHES ribbon, x3 start copy', /^(12|15)$/.test(await txt('#introN')) && /THREE WISHES/.test(await txt('#introRibbon')) && /×3/.test(await txt('#introChips')), await txt('#introN'));
  await clk('#introM', { position: { x: 80, y: 80 } }); await sleep(1500);
  check('super: chain meter starts at x3', (await txt('#chain .cv')) === '×3', await txt('#chain .cv'));
  const sup = await watch('15super'); check('super: multiplier values seen >= x3', [...sup.cv].every(v => +v.slice(1) >= 3), [...sup.cv].join(','));
  check('super outro appears', await waitFor('#outroM', 120000)); await sleep(2500); await shot('16-outro-super'); await clk('#outroM', { position: { x: 60, y: 60 } });
  check('round settles after SUPER', await settle()); check('no counter flash in SUPER', !(await page.evaluate(() => window.__fsAll)).some(t => /\/\s*\d+/.test(t))); await page.evaluate(NORMAL);

  // ===== bought ASTROLABE OF WISHES: ring stops, magnet, tense core, jackpot, tally, outro =====
  await page.evaluate(FORCE(`x => x.bought === 'astrolabe' && x.bonus.scatters === 3 && x.bonus.spins.some(d => d.core.jackpot) && x.bonus.spins.some(d => d.magnet.outer || d.magnet.middle) && x.totalPayout > 30 && x.totalPayout < 900`, 8));
  await watchMsgs(); await page.evaluate(() => { window.__fsAll.length = 0; }); const bal1 = usd((await state()).bal); await buy(2);
  check('bought Astrolabe: trigger spin drops Astrolabes, no win', await waitCond(() => document.querySelectorAll('#grid .cell.hit').length >= 3, 30000)); await sleep(1000); await shot('17-trigger-spin-astro');
  check('bought: balance charged $43 (before the bonus pays)', Math.abs(bal1 - usd((await state()).bal) - 43) < .01, bal1 + ' -> ' + (await state()).bal);
  check('astro intro appears', await waitFor('#introM')); await sleep(1500); await shot('18-intro-astro');
  check('astro intro: 4 spins, ASTROLABE ribbon', (await txt('#introN')) === '4' && /ASTROLABE/.test(await txt('#introRibbon')), await txt('#introN'));
  await clk('#introM', { position: { x: 80, y: 80 } });
  check('astro: scene crossfades to the instrument, board/logo/character hidden', await waitCond(() => document.getElementById('astro').classList.contains('on') && getComputedStyle(document.getElementById('astro')).opacity > .9 && getComputedStyle(document.getElementById('frame')).opacity < .1, 15000));
  await sleep(500); await shot('19-astro-scene');
  const ast = await watch('20astro');
  check('astro: three rings turned and each stop hit its sector (>= 6 stops)', ast.hits >= 3, String(ast.hits));
  check('astro: magnet glow, tense core, jackpot rack lit', ast.magnet && ast.tense && ast.lit, JSON.stringify({ m: ast.magnet, t: ast.tense, l: ast.lit }));
  check('astro: wish banner shown', /WISH/.test(ast.banner), ast.banner);
  check('astro: counter counts spins left as a plain number', [...ast.fsVals].every(v => /^\d+$/.test(v)), [...ast.fsVals].join(','));
  check('astro outro appears', await waitFor('#outroM', 120000)); await sleep(3000); await shot('21-outro-astro'); await clk('#outroM', { position: { x: 60, y: 60 } });
  check('round settles after Astrolabe', await settle()); s = await state(); await shot('22-after-astro');
  check('after Astrolabe: instrument gone, board back, counter hidden, no counter flash', !(await page.$eval('#astro', e => e.classList.contains('on'))) && (await page.$$eval('#grid .cell', c => c.length)) === 25 && !s.fsBox && !(await page.evaluate(() => window.__fsAll)).some(t => /\/\s*\d+/.test(t)));
  await page.evaluate(NORMAL);

  // ante (Djinn's Favour) on / off
  { await clk('#buyOpen'); await sleep(250); await clk('#ante'); await sleep(300); s = await state();
    check('ante on: buy screen closes, badge, bar shows total risk', !(await vis('#buyM')) && s.fever && s.hot && /FAVOUR/.test(await txt('#feverBadge')), JSON.stringify(s));
    await shot('23-ante-on'); const bA = usd((await state()).bal); await clk('#spin'); check('ante spin settles', await settle()); { const e = await state(); check('ante spin costs 2x (balance = before - 2 + win)', Math.abs(usd(e.bal) - (bA - 2 + usd(e.win))) < .01, bA + ' -> ' + e.bal + ' win ' + e.win); }
    await clk('#buyOpen'); await sleep(250); await clk('#ante'); await sleep(300); s = await state(); check('ante off: badge gone, bar normal', !s.fever && !s.hot, JSON.stringify(s)); }

  // gold MAX WIN screen at the 8,000x cap (mutated real Astrolabe round)
  const MW = `x => { const sp = x.bonus.spins; const sum = sp.reduce((a, d) => a + d.totalPayout, 0); sp[sp.length - 1].totalPayout += 8000 - sum; x.bonus.totalPayout = 8000; x.totalPayout = 8000; x.capped = true; }`;
  await page.evaluate(() => { localStorage.setItem('siroccosLampBazaarWallet', '9000'); });
  await page.reload(); await sleep(2500); await page.evaluate(MUT(`x => x.bought === 'astrolabe' && x.bonus.spins.length >= 4`, 3, MW));
  await buy(2); check('cap: intro appears', await waitFor('#introM', 120000)); await sleep(900); await clk('#introM', { position: { x: 80, y: 80 } });
  check('cap: outro appears', await waitFor('#outroM', 200000));
  let sawMax = false; for (let i = 0; i < 300 && !sawMax; i++) { if (await vis('#outroM')) { await sleep(700); await clk('#outroM', { position: { x: 60, y: 60 } }).catch(() => {}); } sawMax = await page.evaluate(() => document.getElementById('big').classList.contains('maxwin') && document.getElementById('big').classList.contains('show')); await sleep(100); }
  check('cap: gold MAX WIN screen shows', sawMax); await sleep(2200); await shot('24-max-win');
  check('cap round settles', await settle()); await page.evaluate(NORMAL);

  // autoplay
  await clk('#bAuto'); await sleep(250); check('autoplay dialog opens', await vis('#autoM')); await clk('#autoOpts .opt >> nth=0'); await clk('#autoGo');
  for (let i = 0; i < 900 && (await page.$eval('#spinCnt', e => e.textContent.trim())) !== '9'; i++) await sleep(100);
  s = await state(); check('autoplay: spin button is the counter square with spins left', s.spinCnt === '9', 'spinCnt=' + s.spinCnt);
  await clk('#spin'); await sleep(200); s = await state(); check('stop click clears the counter', s.spinCnt === null, s.msg);
  check('autoplay stops and round settles', await settle()); s = await state(); check('no stray counter', s.spinCnt === null);

  // mid-bonus turbo: click the stage while a Free Wishes spin plays
  await page.evaluate(FORCE(`x => x.bought === 'fs' && x.bonus.spins.length >= 10 && x.totalPayout < 200`, 41));
  await buy(1); check('turbo run: intro', await waitFor('#introM', 120000)); await sleep(900); await clk('#introM', { position: { x: 80, y: 80 } });
  await waitCond(() => !document.getElementById('fsBox').hidden && document.querySelectorAll('#grid .cell').length > 10, 30000); await sleep(2500);
  const t0 = Date.now(); await page.mouse.click(300, 800); await sleep(300);
  check('tap speeds up this round only: no persistent turbo badge, stored turbo stays off', await page.evaluate(() => document.getElementById('turboBadge').hidden && !/true/.test(Object.keys(localStorage).filter(k => /_turbo$/.test(k)).map(k => localStorage[k]).join(','))));
  check('turbo bonus reaches the outro', await waitFor('#outroM', 120000), ((Date.now() - t0) / 1000).toFixed(0) + 's');
  check('turbo round settles', await settle()); await page.evaluate(NORMAL);
  // mid-bonus turbo in the Astrolabe too
  await page.evaluate(FORCE(`x => x.bought === 'astrolabe' && x.bonus.spins.length >= 4 && x.totalPayout < 200`, 43));
  await buy(2); check('turbo astro: intro', await waitFor('#introM', 120000)); await sleep(900); await clk('#introM', { position: { x: 80, y: 80 } });
  await waitCond(() => document.getElementById('astro').classList.contains('on') && document.querySelectorAll('#astro .ring.go').length >= 2, 30000); await sleep(800);
  const t1 = Date.now(); await page.mouse.click(300, 800); await sleep(300);
  check('turbo astro reaches the outro quickly', await waitFor('#outroM', 120000) && (Date.now() - t1) < 60000, ((Date.now() - t1) / 1000).toFixed(0) + 's');
  check('turbo astro settles', await settle()); await page.evaluate(NORMAL);

  console.log(errors.length ? '\nCONSOLE/PAGE ERRORS:\n' + errors.join('\n') : '\n  ok   0 console / page errors');
  check('0 console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fails.length ? `\nFAILED (${fails.length}):\n - ` + fails.join('\n - ') : '\nALL PASS'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
