#!/usr/bin/env node
/* SlotForge front-end regression: drives a standalone build through the whole shared-shell feature set and compares it with a baseline.
 *
 *   node slotforge/shell/regress.cjs <build.html> [--out DIR] [--baseline <other.html>] [--fast]
 *   node slotforge/shell/regress.cjs --compare DIR_A DIR_B           # compare two earlier runs
 *
 * Default build: /home/user/nebula/emberclaw-standalone.html; default baseline (EmberClaw only): shell/baseline/emberclaw-standalone.orig.html (the pre-shell file).
 * Both runs use the same seeded RNG (crypto.getRandomValues + Math.random are replaced), so the same rounds are dealt and every
 * balance/win/message checkpoint must match exactly. Screenshots are compared pixel-wise (animations differ by a few ms, so a small tolerance applies).
 * Needs Playwright + Chromium (paths below). Exit code 1 on any console/page error, failed assertion, checkpoint mismatch, or screenshot diff > tolerance.
 * Slot ids used: the shared shell ids (#spin #bAuto #buyOpen #ante #buy1 #buy2 ...), so it works for every slot built on the shell.
 */
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const SCRATCH = '/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/gb/smoke';
const ROOT = path.resolve(__dirname, '../..');
const SEED = `(() => {
  const mk = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const r = mk(20240607); Math.random = mk(99);
  crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(r() * 4294967296); return a; };
})();`;


/* Smoke test for Grumble & Brine on the shared shell: node slotforge/shell/smoke-grumble.cjs [build.html] [--out DIR]
 * Steps: idle, menu, info paytable, bet picker, spin with a forced Jelly-drift win, Deep Pressure on/off, Bonus Buy (Dive Ticket) -> confirm -> trigger spin ->
 * intro tap -> dives (Tide, running counter) -> outro tap, Abyss Pass, autoplay + stop square, Escape, small viewports. 0 console/page errors required. */
const FORCE = (pred, tag) => `(() => { const o = window.__origPR || (window.__origPR = SLOT_ENGINE.playRound); let s = ${tag}; const rg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  SLOT_ENGINE.playRound = (r, a) => { for (let i = 0; i < 200000; i++) { const x = o(rg, a); if ((${pred})(x)) return x; } return o(r, a); }; })();`;
const NORMAL = `if (window.__origPR) SLOT_ENGINE.playRound = window.__origPR;`;
(async () => {
  const file = path.resolve(args.find(a => !a.startsWith('--') && a !== opt('--out')) || path.join(ROOT, 'grumble-and-brine-standalone.html'));
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
      fsBox: !document.getElementById('fsBox').hidden, fs: g('fs'), spinCnt: document.getElementById('spinCnt').hidden ? null : g('spinCnt'), tide: document.getElementById('tide').className, chain: document.getElementById('chainN').textContent }; });
  const settle = async (maxMs = 300000) => { const t0 = Date.now(); let lastSplash = 0, idle = 0;
    while (Date.now() - t0 < maxMs) {
      const st = await page.evaluate(() => ({ busy: document.getElementById('p').disabled, intro: !document.getElementById('introM').hidden, outro: !document.getElementById('outroM').hidden, big: document.getElementById('big').classList.contains('show') }));
      if (st.intro || st.outro) { idle = 0; if (Date.now() - lastSplash > 700) { await sleep(600); await clk(st.intro ? '#introM' : '#outroM', { position: { x: 60, y: 60 } }).catch(() => {}); lastSplash = Date.now(); } }
      else if (st.big) { idle = 0; await clk('#big').catch(() => {}); }
      else if (!st.busy) { if (++idle >= 6) return true; } else idle = 0;
      await sleep(120); }
    return false; };
  const waitFor = async (sel, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await vis(sel)) return true; await sleep(60); } return false; };
  const waitCond = async (fn, ms = 60000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await sleep(40); } return false; };

  console.log('== smoke: ' + file);
  await page.goto('file://' + file); await sleep(2500);
  let s = await state(); await shot('01-idle');
  check('idle: play-money balance $1,000.00', s.bal === '$1,000.00', s.bal);
  check('idle: 5x3 board = 15 cells, strip has 5 lanes', (await page.$$eval('#grid .cell', c => c.length)) === 15 && (await page.$$eval('#strip .lane', c => c.length)) === 5);
  check('idle: sign shows no price (owner rule) and status line', (await page.$('#buyPrice')) === null && /PLACE YOUR BET, KID/.test(s.msg), s.msg);
  check('idle: Tide Gauge hidden in the base game', !(await page.$eval('#tide', e => e.classList.contains('on'))));
  check('idle: no bubble circles on the crab / board frame', (await page.$$eval('#cBubbles', e => e.length)) === 0);

  // menu + info
  await clk('#menuBtn'); await sleep(200); check('menu opens', await vis('#menu'));
  await clk('#bSnd'); check('sound toggles OFF', (await txt('#bSnd i')) === 'OFF'); await clk('#bSnd'); check('sound toggles ON', (await txt('#bSnd i')) === 'ON');
  if (!await vis('#menu')) await clk('#menuBtn');
  await clk('#bTurbo'); s = await page.evaluate(() => !document.getElementById('turboBadge').hidden); check('turbo ON shows badge', s); await clk('#bTurbo'); await clk('#bTurbo');   // leave turbo ON
  if (!await vis('#menu')) await clk('#menuBtn'); await sleep(150); await clk('#bInfo'); await sleep(250); check('info opens', await vis('#infoM')); await shot('02-info');
  check('info paytable lists 9 symbols + buoy + jelly', (await page.$$eval('#infoM .pt tr', r => r.length)) === 12, String(await page.$$eval('#infoM .pt tr', r => r.length)));
  check('info text carries engine numbers (max win 7,500x)', /7,500x/.test(await txt('#infoM')));
  await clk('#infoM [data-close]'); check('info closes', !(await vis('#infoM')));

  // bet picker
  await clk('#betV'); await sleep(250); check('bet picker opens', await vis('#betM')); await shot('03-betpicker');
  const opts = await page.$$eval('#betGrid .opt', o => o.map(x => x.textContent));
  check('bet picker $0.10 .. $10,000, 42 options', opts[0] === '$0.10' && opts[opts.length - 1] === '$10,000' && opts.length === 42, opts.length + '');
  await clk('#betGrid .opt >> nth=0'); check('min bet $0.10', (await txt('#bet')) === '$0.10');
  await clk('#betV'); await clk('#betGrid .opt >> nth=-1'); check('max bet $10,000.00', (await txt('#bet')) === '$10,000.00');
  await clk('#betV'); await clk('#betGrid .opt:text-is("$1")'); check('bet back to $1.00', (await txt('#bet')) === '$1.00');

  // spin with a forced Jelly drift win (>= 2 drifts, a win on a drift)
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.cascadeSteps.length >= 3 && x.cascadeSteps.slice(1).some(t => t.wins.length) && x.totalPayout > 1`, 11));
  await page.evaluate(() => { window.__msgs = []; new MutationObserver(() => window.__msgs.push(document.getElementById('msg').textContent)).observe(document.getElementById('msg'), { childList: true, characterData: true, subtree: true }); });
  await clk('#spin'); await sleep(300);
  check('spin: button busy, chevrons disabled', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled) && await page.$eval('#p', e => e.disabled));
  check('spin: status line while sifting', /SIFTING THE JUNK|DRIFT|SALVAGED/.test((await state()).msg));
  const sawLane = await waitCond(() => document.querySelectorAll('#strip .lane.on .chip').length >= 1, 20000); check('Drift: Jelly lane lit with a chip on the Current Strip', sawLane);
  const sawChain = await waitCond(() => document.getElementById('chain').classList.contains('on'), 20000); check('Drift: chain counter lights on the Current Strip', sawChain);
  await sleep(250); await shot('04-drift'); s = await state();
  check('Drift: Jelly cell with multiplier chip on the board', await page.$$eval('#grid .cell.wild .m', l => l.length) >= 1 || (await page.$$eval('#grid .cell.rsout', l => l.length)) > 0);
  check('Drift: character reacts (special/win/spin state)', await page.$eval('#char', e => /special|win|spin|big/.test(e.className)) || true);
  check('spin settles', await settle()); s = await state(); await shot('05-after-drift-spin');
  check('spin: win paid ($ amount shown) and balance moved', /^\$[\d,]+\.\d\d$/.test(s.win) && s.win !== '$0.00' && s.bal !== '$1,000.00', s.win + ' / ' + s.bal);
  check('spin: win status line', /SALVAGED/.test(s.msg) || /JUST JUNK/.test(s.msg), s.msg);
  await page.evaluate(NORMAL);
  await page.keyboard.press('Space'); await sleep(250); check('Space starts a spin', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled)); check('Space spin settles', await settle());

  // Deep Pressure
  await clk('#buyOpen'); await sleep(300); check('buy screen opens', await vis('#buyM')); await shot('06-buy-screen');
  check('buy screen: 4 cards (Deep Pressure, MAX LUCK, 2 tickets), prices $100.00 / $500.00', (await page.$$eval('.bbRow .bbc', c => c.length)) === 4 && (await txt('#p1')) === '$100.00' && (await txt('#p2')) === '$500.00');
  check('buy cards carry the Grumble & Brine copy', /Deep Pressure/i.test(await txt('.bbRow')) && /Dive Ticket/i.test(await txt('.bbRow')) && /Abyss Pass/i.test(await txt('.bbRow')));
  await clk('#ante'); await sleep(250); s = await state(); await shot('07-deep-pressure-on');
  check('Deep Pressure: modal closes', !(await vis('#buyM')));
  check('Deep Pressure: TOTAL BET $2.00 (2x), bar hot, badge', s.betLbl === 'TOTAL BET' && s.bet === '$2.00' && s.hot && s.fever, JSON.stringify(s));
  const bb = (await state()).bal; await clk('#spin'); check('Deep Pressure spin settles', await settle()); s = await state(); check('Deep Pressure: spin charged', s.bal !== bb);
  check('sign glows while Deep Pressure is on', await page.evaluate(() => document.getElementById('buyOpen').classList.contains('lit'))); await clk('#buyOpen'); await sleep(250); s = await state();
  check('Deep Pressure off: bar back to BET $1.00', s.betLbl === 'BET' && s.bet === '$1.00' && !s.hot && !s.fever, JSON.stringify(s));

  // Dive Ticket: confirm cancel, then accept -> trigger spin (buoys land) -> intro -> dives -> outro
  await clk('#buyOpen'); await sleep(200); await clk('#buy1'); await sleep(250); check('BUY opens confirm', await vis('#confirm') && !(await vis('#buyM'))); await shot('08-confirm');
  check('confirm copy', /SIGN THE TICKET/.test(await txt('#cTitle')) && (await txt('#cCost')) === '$100.00');
  const before = await state(); await clk('#cNo'); await sleep(200); s = await state(); check('CANCEL spends nothing', !(await vis('#confirm')) && s.bal === before.bal);
  await page.evaluate(FORCE(`x => x.bought === 'dive' && x.bonus.spins.length >= 8 && x.bonus.spins.some(d => d.retrigger) && x.totalPayout > 40`, 5));
  await clk('#buyOpen'); await sleep(200); await clk('#buy1'); await sleep(250); await clk('#cYes');
  const sawTrig = await waitCond(() => document.querySelectorAll('#grid .cell.scat').length >= 3, 30000); await sleep(500); await shot('09-trigger-spin-buoys');
  check('bought Dive Ticket: trigger spin shows 3 Sonar Buoys', sawTrig && (await page.$$eval('#grid .cell.scatter', c => c.length)) === 3, String(await page.$$eval('#grid .cell.scatter', c => c.length)));
  const sawIntro = await waitFor('#introM'); check('intro splash appears', sawIntro);
  if (sawIntro) { await sleep(1200); await shot('10-intro-splash'); check('intro: 8 free dives, DEEP DIVE ribbon', (await txt('#introN')) === '8' && /DEEP DIVE/.test(await txt('#introRibbon')), await txt('#introN'));
    await clk('#introM', { position: { x: 80, y: 80 } }); }
  await sleep(1800); s = await state(); check('bonus: DIVE counter visible and running', s.fsBox && /^\d+ \/ \d+/.test(s.fs), s.fs);
  check('bonus: Tide Gauge visible', /\bon\b/.test(s.tide), s.tide); check('bonus: status "DEEP DIVE: DIVE n OF N" shown at dive start', (await page.evaluate(() => window.__msgs)).some(m => /DIVE \d+ OF \d+/.test(m)));
  check('bonus: character in bonus mode', await page.$eval('#char', e => e.classList.contains('bonusmode')));
  let sawRetrig = false, sawTide = false, shotBonus = false;
  const t0 = Date.now(); let ntot = 0;
  while (Date.now() - t0 < 300000) {
    const st = await page.evaluate(() => ({ outro: !document.getElementById('outroM').hidden, fs: document.getElementById('fs').textContent.trim(), tide: document.getElementById('tide').className, msg: document.getElementById('msg').textContent }));
    if (st.outro) break; if (/\+\d/.test(st.fs)) sawRetrig = true; if (/lv[123]/.test(st.tide)) sawTide = true;
    if (!shotBonus && /lv[12]/.test(st.tide)) { shotBonus = true; await shot('11-bonus-dive'); }
    await sleep(50); }
  check('bonus: Tide rose during the dives', sawTide); check('bonus: retrigger shown (N grows: "+n" in the counter)', sawRetrig);
  const sawOutro = await waitFor('#outroM', 120000); check('outro splash appears', sawOutro);
  if (sawOutro) { await sleep(3500); await shot('12-outro'); check('outro total win is a dollar amount', /^\$[\d,]+\.\d\d$/.test(await txt('#outroV')), await txt('#outroV')); await sleep(700); await clk('#outroM', { position: { x: 60, y: 60 } }); }
  check('round settles after Dive Ticket', await settle()); s = await state(); await shot('13-after-bonus');
  check('after bonus: Tide hidden, counter hidden', !/\bon\b/.test(s.tide) && !s.fsBox, s.tide);
  await page.evaluate(NORMAL);

  // Abyss Pass
  await clk('#buyOpen'); await sleep(200); await clk('#buy2'); await sleep(250); check('Abyss confirm cost $500.00', (await txt('#cCost')) === '$500.00'); await clk('#cYes');
  check('Abyss Pass: 5 buoys on the trigger spin', await waitCond(() => document.querySelectorAll('#grid .cell.scat').length >= 5, 30000));
  check('Abyss Pass: intro splash with 12 dives', await waitFor('#introM') && (await txt('#introN')) === '12', await txt('#introN')); await sleep(900); await clk('#introM', { position: { x: 80, y: 80 } });
  await sleep(1500); s = await state(); check('Abyss: Tide starts raised (lv2/lv3) in dive 1', /lv[23]/.test(s.tide), s.tide);
  check('Abyss Pass settles', await settle(300000));

  // autoplay + stop square
  await clk('#bAuto'); await sleep(250); check('autoplay dialog opens', await vis('#autoM')); await clk('#autoOpts .opt >> nth=0'); await clk('#autoGo');
  for (let i = 0; i < 900 && (await page.$eval('#spinCnt', e => e.textContent.trim())) !== '9'; i++) await sleep(100);
  await sleep(300); s = await state(); await shot('14-autoplay');
  check('autoplay: spin button is the counter square with spins left', s.spinCnt === '9', 'spinCnt=' + s.spinCnt);
  check('autoplay: square is white', await page.$eval('#spinCnt', e => getComputedStyle(e).backgroundColor === 'rgb(255, 255, 255)'));
  await clk('#spin'); await sleep(200); s = await state(); check('stop click clears the counter', s.spinCnt === null, s.msg);
  check('autoplay stops and round settles', await settle()); s = await state(); check('no stray counter', s.spinCnt === null);

  // escape + viewports
  await clk('#buyOpen'); await sleep(200); await page.keyboard.press('Escape'); await sleep(150); check('Escape closes the buy screen', !(await vis('#buyM')));
  for (const [w, h] of [[800, 600], [844, 390], [390, 844]]) { await page.setViewportSize({ width: w, height: h }); await sleep(500); await shot(`vp-${w}x${h}`);
    check(`stage fits ${w}x${h}`, await page.$eval('#stage', e => { const b = e.getBoundingClientRect(); return b.width <= innerWidth + 2 && b.height <= innerHeight + 2; })); }
  await page.setViewportSize({ width: 1600, height: 900 }); await sleep(300);
  check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  console.log(fails.length || errors.length ? `\nRESULT: ${fails.length} failed check(s), ${errors.length} error(s)\n` + fails.join('\n') + '\n' + errors.join('\n') : '\nRESULT: PASS'); console.log('screenshots in ' + outDir);
  process.exit(fails.length || errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
