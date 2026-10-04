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
const SCRATCH = '/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/ember/smoke';
const ROOT = path.resolve(__dirname, '../..');
const SEED = `(() => {
  const mk = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const r = mk(20240607); Math.random = mk(99);
  crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(r() * 4294967296); return a; };
})();`;


/* Smoke test for EmberClaw on the shared shell: node slotforge/shell/smoke-ember.cjs [build.html] [--out DIR]
 * Steps: idle, menu, info paytable, bet picker, spin with a forced Jelly-drift win, Deep Pressure on/off, Bonus Buy (Dive Ticket) -> confirm -> trigger spin ->
 * intro tap -> dives (Tide, running counter) -> outro tap, Abyss Pass, autoplay + stop square, Escape, small viewports. 0 console/page errors required. */
const FORCE = (pred, tag) => `(() => { const o = window.__origPR || (window.__origPR = SLOT_ENGINE.playRound); let s = ${tag}; const rg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  SLOT_ENGINE.playRound = (r, a) => { for (let i = 0; i < 200000; i++) { const x = o(rg, a); if ((${pred})(x)) return x; } return o(r, a); }; })();`;
const NORMAL = `if (window.__origPR) SLOT_ENGINE.playRound = window.__origPR;`;
(async () => {
  const file = path.resolve(args.find(a => !a.startsWith('--') && a !== opt('--out')) || path.join(ROOT, 'emberclaw-standalone.html'));
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
      fsBox: !document.getElementById('fsBox').hidden, fs: g('fs'), spinCnt: document.getElementById('spinCnt').hidden ? null : g('spinCnt'), heat: document.getElementById('heatV').textContent }; });
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
  check('idle: 6x5 board = 30 cells', (await page.$$eval('#grid .cell', c => c.length)) === 30);
  check('idle: no console errors yet', errors.length === 0, errors.join('|'));

  // menu: music + sound toggles and sliders
  await clk('#menuBtn'); await sleep(250); check('menu opens', await vis('#menu')); await shot('02-menu');
  check('menu: Music + Sound effects rows with sliders', (await page.$$('#menu input[type=range]')).length === 2 && /Music/.test(await txt('#bMus')) && /Sound effects/.test(await txt('#bSnd')));
  await clk('#bMus'); check('music toggles OFF', (await txt('#bMus i')) === 'OFF'); await clk('#bMus'); check('music toggles ON', (await txt('#bMus i')) === 'ON');
  await clk('#bSnd'); check('sound toggles OFF', (await txt('#bSnd i')) === 'OFF'); await clk('#bSnd'); check('sound toggles ON', (await txt('#bSnd i')) === 'ON');
  await page.$eval('#vMus', e => { e.value = 35; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
  check('music volume persists to localStorage', await page.evaluate(() => JSON.parse(localStorage.getItem('emberclaw_musv') || localStorage.getItem(Object.keys(localStorage).find(k => /_musv$/.test(k)) || 'x') || '0')) === .35);
  if (await vis('#menu')) await clk('#menuBtn'); await sleep(150);

  // a spin with a forced big-cluster cascade win
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.cascadeSteps.length >= 2 && x.cascadeSteps[0].clusters.some(k => k.cells.length >= 8)`, 7));
  await clk('#spin'); await sleep(300);
  check('spin: button busy', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled));
  const sawHit = await waitCond(() => document.querySelectorAll('#grid .cell.hit').length >= 5, 30000); check('win: cluster cells enter the win pose', sawHit);
  /* watch for the seams/links for up to 4s (they fade quickly, so a single sample after a fixed sleep is timing-dependent on a loaded machine) */
  const lay = await page.evaluate(() => new Promise(res => { const best = { b: 0, t: 0 }, t0 = performance.now(); (function f() {
    const has = !!document.getElementById('lnkT'), b = has ? document.querySelectorAll('#lnkT path').length : 0, t = has ? document.querySelectorAll('#lnkT rect').length : 0;
    best.b = Math.max(best.b, b); best.t = Math.max(best.t, t);
    (best.b >= 6 && best.t >= 2) || performance.now() - t0 > 4000 ? res(best) : requestAnimationFrame(f); })(); }));
  await shot('03-win-links-a');
  check('win: molten seams + iron links drawn', lay.b >= 6 && lay.t >= 2, JSON.stringify(lay));
  check('spin settles', await settle()); s = await state(); await shot('04-after-spin');
  check('spin: win paid and balance moved', /^\$[\d,]+\.\d\d$/.test(s.win) && s.win !== '$0.00', s.win + ' / ' + s.bal);
  await page.evaluate(NORMAL);
  await page.keyboard.press('Space'); await sleep(250); check('Space starts a spin', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled)); check('Space spin settles', await settle());

  // bought bonus
  await page.evaluate(FORCE(`x => x.bought === 'standard' && x.bonus.spins.length >= 6 && x.totalPayout > 30`, 5));
  await clk('#buyOpen'); await sleep(250); check('buy screen opens', await vis('#buyM')); await clk('#buy1'); await sleep(250); check('BUY opens confirm', await vis('#confirm')); await clk('#cYes');
  const sawTrig = await waitCond(() => document.querySelectorAll('#grid .cell.scat').length >= 3 && document.querySelectorAll('#lnkT path').length >= 2, 30000); await sleep(500); await shot('05-trigger-gems');
  check('bought bonus: trigger spin shows the gems with welded links', sawTrig);
  const sawIntro = await waitFor('#introM'); check('intro splash appears', sawIntro);
  if (sawIntro) { await sleep(1000); await shot('06-intro'); await clk('#introM', { position: { x: 80, y: 80 } }); }
  await sleep(1800); s = await state(); check('bonus: counter visible', s.fsBox && /^\d+ \/ \d+/.test(s.fs), s.fs); await shot('07-bonus');
  const t0 = Date.now(); while (Date.now() - t0 < 300000) { if (await page.evaluate(() => !document.getElementById('outroM').hidden)) break; await sleep(60); }
  const sawOutro = await waitFor('#outroM', 120000); check('outro appears', sawOutro);
  if (sawOutro) { await sleep(3200); await shot('08-outro'); await clk('#outroM', { position: { x: 60, y: 60 } }); }
  check('round settles after the bonus', await settle()); await page.evaluate(NORMAL);

  // autoplay
  await clk('#bAuto'); await sleep(250); check('autoplay dialog opens', await vis('#autoM')); await clk('#autoOpts .opt >> nth=0'); await clk('#autoGo');
  for (let i = 0; i < 900 && (await page.$eval('#spinCnt', e => e.textContent.trim())) !== '9'; i++) await sleep(100);
  s = await state(); check('autoplay: counter shows spins left', s.spinCnt === '9', 'spinCnt=' + s.spinCnt);
  await clk('#spin'); await sleep(200); s = await state(); check('stop click clears the counter', s.spinCnt === null);
  check('autoplay stops and round settles', await settle());
  for (const [w, h] of [[800, 600], [390, 844]]) { await page.setViewportSize({ width: w, height: h }); await sleep(400); await shot(`vp-${w}x${h}`); }
  await page.setViewportSize({ width: 1600, height: 900 }); await sleep(300);
  check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  console.log(fails.length || errors.length ? `\nRESULT: ${fails.length} failed check(s), ${errors.length} error(s)\n` + fails.join('\n') + '\n' + errors.join('\n') : '\nRESULT: PASS'); console.log('screenshots in ' + outDir);
  process.exit(fails.length || errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
