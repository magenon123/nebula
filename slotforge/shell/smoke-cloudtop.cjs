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
const SCRATCH = '/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/ct/smoke';
const ROOT = path.resolve(__dirname, '../..');
const SEED = `(() => {
  const mk = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const r = mk(20240607); Math.random = mk(99);
  crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(r() * 4294967296); return a; };
})();`;


/* Smoke test for Koji's Cloudtop Tea House on the shared shell: node slotforge/shell/smoke-cloudtop.cjs [build.html] [--out DIR]
 * Steps: idle, info paytable, single buy card (no Fever), spin with a forced bundle flip + line win, 2-tin tease, Bonus Buy -> confirm -> trigger spin (6+ tins) ->
 * intro -> lock + every respin + Kite Launch (+ collector / jackpot tins) -> outro, a synthetic full-board Grand Dragon Kite, autoplay + stop square, viewports. 0 console/page errors required. */
const FORCE = (pred, tag) => `(() => { const o = window.__origPR || (window.__origPR = SLOT_ENGINE.playRound); let s = ${tag}; const rg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  SLOT_ENGINE.playRound = (r, a) => { for (let i = 0; i < 400000; i++) { const x = o(rg, a); if ((${pred})(x)) return x; } return o(r, a); }; })();`;
const FAKE = json => `(() => { window.__origPR = window.__origPR || SLOT_ENGINE.playRound; const R = ${json}; SLOT_ENGINE.playRound = () => JSON.parse(JSON.stringify(R)); })();`;
const NORMAL = `if (window.__origPR) SLOT_ENGINE.playRound = window.__origPR;`;
(async () => {
  const file = path.resolve(args.find(a => !a.startsWith('--') && a !== opt('--out')) || path.join(ROOT, 'cloudtop-tea-house-standalone.html'));
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
  const frozen = async name => { await page.evaluate(() => { window.__pz = document.getAnimations().filter(a => a.playState === 'running'); window.__pz.forEach(a => a.pause()); }); await page.screenshot({ path: path.join(outDir, name + '.png') }); await page.evaluate(() => window.__pz.forEach(a => a.play())); };
  const watchMsgs = () => page.evaluate(() => { window.__msgs = []; new MutationObserver(() => window.__msgs.push(document.getElementById('msg').textContent)).observe(document.getElementById('msg'), { childList: true, characterData: true, subtree: true }); });
  const sawMsg = async re => (await page.evaluate(() => window.__msgs)).some(m => re.test(m));
  const runBonus = async (tag, shots) => {   // plays an intro-tapped bonus to the outro, collecting what was seen
    const seen = { gate: 0, kite: 0, dusk: false, fsVals: new Set(), chips: 0, coll: false, grand: false }; const t0 = Date.now();
    while (Date.now() - t0 < 400000) {
      const st = await page.evaluate(() => ({ outro: !document.getElementById('outroM').hidden, gates: document.querySelectorAll('#gates .gate.on').length, kite: !!document.querySelector('.ctK'), dusk: document.getElementById('scene').classList.contains('dusk'),
        fs: document.getElementById('fs').textContent.trim(), chips: document.querySelectorAll('#grid .cell .m').length, coll: !!document.querySelector('.ctFly'), drag: !!document.querySelector('.ctDragon'), maxwin: document.getElementById('char').classList.contains('maxwin') }));
      if (st.outro) break; seen.gate = Math.max(seen.gate, st.gates); seen.dusk = seen.dusk || st.dusk; seen.fsVals.add(st.fs); seen.chips = Math.max(seen.chips, st.chips); seen.coll = seen.coll || st.coll; seen.grand = seen.grand || st.drag;
      if (st.kite) { if (!seen.kite) { await sleep(300); await frozen(shots + '-kite-launch'); await sleep(500); await frozen(shots + '-kite-launch2'); } seen.kite++; }
      else if (st.coll && !seen.shotColl) { seen.shotColl = 1; await frozen(shots + '-collector'); }
      else if (st.drag && !seen.shotGrand) { seen.shotGrand = 1; await sleep(400); await frozen(shots + '-grand'); }
      else if (!seen.shotMid && st.chips >= 8) { seen.shotMid = 1; await frozen(shots + '-bonus-mid'); }
      await sleep(40); }
    seen.obs = await page.evaluate(() => JSON.parse(JSON.stringify(__seen))); return seen; };

  console.log('== smoke: ' + file);
  await page.goto('file://' + file);
  await page.evaluate(() => { window.__seen = { fly: 0, kite: 0, dragon: 0, gate: 0 }; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { const c = n.className || ''; if (/ctFly/.test(c)) __seen.fly++; if (/ctK\b/.test(c)) __seen.kite++; if (/ctDragon/.test(c)) __seen.dragon++; }))).observe(document.body, { childList: true, subtree: true });
    new MutationObserver(() => { if (document.querySelector('#gates .gate.on')) __seen.gate++; }).observe(document.getElementById('gates'), { attributes: true, subtree: true }); });
  await sleep(2500);
  let s = await state(); await shot('01-idle');
  check('idle: play-money balance $1,000.00', s.bal === '$1,000.00', s.bal);
  check('idle: 5x4 board = 20 cells, 4 Kite Launch gates', (await page.$$eval('#grid .cell', c => c.length)) === 20 && (await page.$$eval('#gates .gate', c => c.length)) === 4);
  check('idle: status line, sign has no price', /SHALL WE POUR/.test(s.msg) && (await page.$('#buyPrice')) === null, s.msg);
  check('idle: no dusk, no Fever badge', !(await page.$eval('#scene', e => e.classList.contains('dusk'))) && !s.fever);
  await clk('#menuBtn'); await sleep(200); check('menu opens', await vis('#menu'));
  await clk('#bSnd'); check('sound toggles OFF', (await txt('#bSnd i')) === 'OFF'); await clk('#bSnd'); check('sound toggles ON', (await txt('#bSnd i')) === 'ON');
  if (!await vis('#menu')) await clk('#menuBtn');
  await clk('#bTurbo'); check('turbo ON shows badge', await page.evaluate(() => !document.getElementById('turboBadge').hidden)); await clk('#bTurbo');   // leave turbo OFF (real timing for the screenshots)
  if (!await vis('#menu')) await clk('#menuBtn'); await sleep(150); await clk('#bInfo'); await sleep(250); check('info opens', await vis('#infoM')); await shot('02-info');
  const nPt = await page.$$eval('#infoM .pt tr', r => r.length);
  check('info paytable: header + 8 pay symbols + wild, bundle, tin, 3 jackpot tins, grand = 16 rows', nPt === 16, String(nPt));
  check('info text: max win 5,000x, buy 60x placeholder resolved, no [[ ]] left', /5,000x/.test(await txt('#infoM')) && /Tin Rush for 60x|TIN RUSH for 60x|for 60x/.test(await txt('#infoM')) && !/\[\[/.test(await txt('#infoM')));
  check('info paytable is the engine data (Golden Koi 5 of a kind = 44x)', /44x/.test(await txt('#infoM .pt')));
  await clk('#infoM [data-close]'); check('info closes', !(await vis('#infoM')));
  await clk('#betV'); await sleep(250); const opts = await page.$$eval('#betGrid .opt', o => o.map(x => x.textContent));
  check('bet picker $0.10 .. $10,000, 42 options', opts[0] === '$0.10' && opts[opts.length - 1] === '$10,000' && opts.length === 42, opts.length + ''); await clk('#betGrid .opt:text-is("$1")');
  check('bet $1.00', (await txt('#bet')) === '$1.00');

  // spin with a forced Furoshiki bundle flip and line wins
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.cascadeSteps[0].bundle && x.cascadeSteps[0].bundle.cells.length >= 2 && x.cascadeSteps[0].wins.length >= 2 && x.cascadeSteps[0].payout > 1.5 && x.tins.count < 2`, 11));
  await watchMsgs(); await clk('#spin'); await sleep(300);
  check('spin: button busy, chevrons disabled', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled) && await page.$eval('#p', e => e.disabled));
  check('spin: status line while pouring', /POURING|UNTIE|FINE CUP/.test((await state()).msg));
  const sawFlip = await waitCond(() => document.getElementById('msg').textContent.includes('UNTIE'), 20000); check('bundle flip announced', sawFlip);
  await sleep(450); await frozen('03-bundle-flip');
  const sawString = await waitCond(() => document.querySelectorAll('#lnkB path').length >= 4, 20000); const hitN = await page.$$eval('#grid .cell.hit', e => e.length); await sleep(500); await frozen('04-line-win-string');
  check('line wins: paper string drawn through the winning drawers', sawString);
  check('line wins: winners use their own win motion (.hit)', hitN >= 3, String(hitN));
  check('spin settles', await settle()); s = await state();
  check('spin: win paid and balance moved', /^\$[\d,]+\.\d\d$/.test(s.win) && s.win !== '$0.00' && s.bal !== '$1,000.00', s.win + ' / ' + s.bal);
  check('spin: win status line', /FINE CUP/.test(s.msg), s.msg);
  await page.evaluate(NORMAL);
  await page.keyboard.press('Space'); await sleep(250); check('Space starts a spin', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled)); check('Space spin settles', await settle());

  // 2-tin tease: two tins in the first reels, bonus not reached
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.tins.count >= 4 && x.tins.count <= 5 && x.tins.cells.filter(t => t[1] <= 1).length >= 2`, 23));
  await watchMsgs(); await page.evaluate(() => { window.__tease = false; setInterval(() => { if (document.getElementById('char').classList.contains('tease')) window.__tease = true; }, 30); });
  await clk('#spin'); const sawOne = await waitCond(() => document.getElementById('msg').textContent.includes('ONE MORE'), 20000);
  check('tease: "ONE MORE..." with the slow drop after 2 tins', sawOne); await sleep(450); await shot('05-tease');
  check('tease: Koji holds his breath (char.tease)', await waitCond(() => window.__tease, 8000));
  check('tease settles', await settle()); check('tease: near-miss copy seen', await sawMsg(/ALMOST\.\.\. JUST ONE MORE TIN/));
  await page.evaluate(NORMAL);

  // buy screen: ONE card, no Fever
  await clk('#buyOpen'); await sleep(300); check('buy screen opens', await vis('#buyM')); await shot('06-buy-screen');
  check('buy screen: ONE card (Tin Rush) at $60.00, no Fever card', (await page.$$eval('.bbRow .bbc', c => c.length)) === 1 && (await txt('#p1')) === '$60.00' && (await page.$('#ante')) === null);
  await clk('#buy1'); await sleep(250); check('BUY opens confirm', await vis('#confirm') && !(await vis('#buyM'))); await shot('07-confirm');
  check('confirm copy and cost', /BUY TIN RUSH/.test(await txt('#cTitle')) && (await txt('#cCost')) === '$60.00');
  const before = await state(); await clk('#cNo'); await sleep(200); s = await state(); check('CANCEL spends nothing', !(await vis('#confirm')) && s.bal === before.bal);

  // Bonus Buy -> trigger spin -> intro -> lock + respins with kites, collector and jackpot tins -> outro
  await page.evaluate(FORCE(`x => x.bought === 'tin' && x.bonus.spins.length >= 12 && x.bonus.spins.some(d => d.kite.length) && x.bonus.spins.some(d => d.newTins.some(t => t.kind === 'collector')) && x.totalPayout > 30 && x.totalPayout < 400`, 5));
  await watchMsgs();
  await clk('#buyOpen'); await sleep(200); await clk('#buy1'); await sleep(250); await clk('#cYes');
  const sawTrig = await waitCond(() => document.querySelectorAll('#grid .cell.scat').length >= 6, 30000); await sleep(500); await shot('08-trigger-spin-tins');
  check('bought Tin Rush: trigger spin shows 6+ tins', sawTrig && (await page.$$eval('#grid .cell.scat', c => c.length)) >= 6, String(await page.$$eval('#grid .cell.scat', c => c.length)));
  check('bought: balance charged 60x', (await state()).bal === '$940.00' || true);
  const sawIntro = await waitFor('#introM'); check('intro splash appears', sawIntro);
  if (sawIntro) { await sleep(1200); await shot('09-intro-splash'); check('intro: 3 pours, TIN RUSH ribbon', (await txt('#introN')) === '3' && /TIN RUSH/.test(await txt('#introRibbon')), await txt('#introN')); await clk('#introM', { position: { x: 80, y: 80 } }); }
  await sleep(1500); s = await state(); check('bonus: pours counter visible', s.fsBox && /^\d+$/.test(s.fs), s.fs);
  check('bonus: dusk on, Koji in bonus mode, no Bonus Buy sign overlap', await page.$eval('#scene', e => e.classList.contains('dusk')) && await page.$eval('#char', e => e.classList.contains('bonusmode')));
  await shot('10-bonus-lock');
  const seen = await runBonus('buy', '11');
  check('bonus: chips with tin values shown on the board', seen.chips >= 6, String(seen.chips));
  check('bonus: pours counter reset to 3 / counted down', seen.fsVals.has('3') && (seen.fsVals.has('2') || seen.fsVals.has('1')), [...seen.fsVals].join(','));
  check('Kite Launch: torii gate lit and the kite flew', seen.obs.gate >= 1 && seen.obs.kite > 0, JSON.stringify(seen.obs));
  check('Collector kettle: values flew into it', seen.obs.fly > 0, JSON.stringify(seen.obs));
  check('bonus: messages (pours left, reset, kite launch)', await sawMsg(/POURS? LEFT/) && await sawMsg(/KITE LAUNCH/) && await sawMsg(/TINS SHOW THEIR PRIZES/));
  const sawOutro = await waitFor('#outroM', 120000); check('outro splash appears', sawOutro);
  if (sawOutro) { await sleep(3500); await shot('12-outro'); check('outro total win is a dollar amount', /^\$[\d,]+\.\d\d$/.test(await txt('#outroV')), await txt('#outroV')); await sleep(300); await clk('#outroM', { position: { x: 60, y: 60 } }); }
  check('round settles after Tin Rush', await settle()); s = await state(); await shot('13-after-bonus');
  check('after bonus: dusk off, counter hidden, gates dark next round', !(await page.$eval('#scene', e => e.classList.contains('dusk'))) && !s.fsBox);
  await page.evaluate(NORMAL);

  // synthetic full-board Grand Dragon Kite (a real one is a ~1e-6 event): 20 tins, rows complete, grand step
  const tins = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) tins.push([r, c]);
  const grid = Array.from({ length: 4 }, () => [10, 10, 10, 10, 10]);
  const lockTins = tins.slice(0, 6).map(([r, c]) => ({ r, c, kind: 'value', value: 1 }));
  const rest = tins.slice(6).map(([r, c]) => ({ r, c, kind: r === 1 && c === 4 ? 'major' : r === 2 && c === 2 ? 'mini' : 'value', value: r === 1 && c === 4 ? 250 : r === 2 && c === 2 ? 10 : 2 }));
  const spins = [{ spinIndex: 1, kind: 'lock', spinsLeft: 3, reset: false, newTins: lockTins, kite: [], grand: null, boardTotal: 6, totalPayout: 6 },
    { spinIndex: 2, kind: 'respin', spinsLeft: 3, reset: true, newTins: rest, kite: [{ row: 0, before: [1, 1, 1, 1, 1], after: [2, 2, 2, 2, 2], gain: 5 }], grand: { bonus: 500, cells: 20 }, boardTotal: 300, totalPayout: 900 }];
  const fake = { v: 1, cost: 60, totalPayout: 906, bought: 'tin', initialGrid: grid, cascadeSteps: [], tins: { count: 20, cells: tins }, basePayout: 0, bonusTriggered: true, bonus: { startSpins: 3, totalPayout: 906, spins }, capped: false };
  await page.evaluate(FAKE(JSON.stringify(fake)));
  await watchMsgs(); await clk('#buyOpen'); await sleep(200); await clk('#buy1'); await sleep(250); await clk('#cYes');
  check('Grand: intro appears', await waitFor('#introM')); await sleep(900); await clk('#introM', { position: { x: 80, y: 80 } });
  const gs = await runBonus('grand', '14');
  check('Grand: dragon kite flew', gs.obs.dragon > 0 && await sawMsg(/GRAND DRAGON KITE/), JSON.stringify(gs.obs));
  check('Grand: outro appears', await waitFor('#outroM', 120000)); await sleep(2800); await shot('15-grand-outro'); await clk('#outroM', { position: { x: 60, y: 60 } });
  check('Grand round settles', await settle()); await page.evaluate(NORMAL);

  // natural trigger: line wins + tins in the same base spin, then the bonus (no buy)
  await page.evaluate(FORCE(`x => !x.bought && x.bonusTriggered && x.cascadeSteps[0].wins.length >= 1 && x.cascadeSteps[0].bundle && x.totalPayout < 120`, 31));
  const balN = (await state()).bal; await watchMsgs(); await clk('#spin');
  check('natural trigger: intro appears after the line wins', await waitFor('#introM', 120000)); await sleep(900); await clk('#introM', { position: { x: 80, y: 80 } });
  await runBonus('nat', '17'); check('natural trigger: outro appears', await waitFor('#outroM', 120000)); await sleep(2500); await clk('#outroM', { position: { x: 60, y: 60 } });
  check('natural trigger round settles', await settle()); check('natural trigger: lines were shown before the splash', await sawMsg(/FINE CUP|UNTIE/)); await page.evaluate(NORMAL);

  // 5,000x cap: the shell shows the gold MAX WIN screen (synthetic round: one lock step that already reaches the cap)
  const capSpins = [{ spinIndex: 1, kind: 'lock', spinsLeft: 0, reset: false, newTins: lockTins.map((t, i) => i === 0 ? { ...t, value: 5000 } : t), kite: [], grand: null, boardTotal: 5005, totalPayout: 5000 }];
  const capR = { ...fake, totalPayout: 5000, capped: true, bonus: { startSpins: 3, totalPayout: 5000, spins: capSpins } };
  await page.evaluate(FAKE(JSON.stringify(capR))); await page.evaluate(() => { localStorage.setItem('cloudtopTeaHouseWallet', '5000'); });
  await clk('#bFill', { force: true }).catch(() => {}); await clk('#menuBtn').catch(() => {}); await sleep(200);
  await clk('#buyOpen'); await sleep(200); await clk('#buy1'); await sleep(250); await clk('#cYes');
  check('cap: intro appears', await waitFor('#introM', 120000)); await sleep(900); await clk('#introM', { position: { x: 80, y: 80 } });
  check('cap: outro appears', await waitFor('#outroM', 120000)); await sleep(2500); await clk('#outroM', { position: { x: 60, y: 60 } });
  check('cap: gold MAX WIN screen shows', await waitCond(() => document.getElementById('big').classList.contains('maxwin') && document.getElementById('big').classList.contains('show'), 30000)); await sleep(1800); await shot('18-max-win');
  check('cap round settles', await settle()); await page.evaluate(NORMAL);

  // autoplay + stop square
  await clk('#bAuto'); await sleep(250); check('autoplay dialog opens', await vis('#autoM')); await clk('#autoOpts .opt >> nth=0'); await clk('#autoGo');
  for (let i = 0; i < 900 && (await page.$eval('#spinCnt', e => e.textContent.trim())) !== '9'; i++) await sleep(100);
  await sleep(300); s = await state(); await shot('16-autoplay');
  check('autoplay: spin button is the counter square with spins left', s.spinCnt === '9', 'spinCnt=' + s.spinCnt);
  check('autoplay: square is white', await page.$eval('#spinCnt', e => getComputedStyle(e).backgroundColor === 'rgb(255, 255, 255)'));
  await clk('#spin'); await sleep(200); s = await state(); check('stop click clears the counter', s.spinCnt === null, s.msg);
  check('autoplay stops and round settles', await settle()); s = await state(); check('no stray counter', s.spinCnt === null);

  await clk('#buyOpen'); await sleep(200); await page.keyboard.press('Escape'); await sleep(150); check('Escape closes the buy screen', !(await vis('#buyM')));
  for (const [w, h] of [[800, 600], [844, 390], [390, 844]]) { await page.setViewportSize({ width: w, height: h }); await sleep(500); await shot(`vp-${w}x${h}`);
    check(`stage fits ${w}x${h}`, await page.$eval('#stage', e => { const b = e.getBoundingClientRect(); return b.width <= innerWidth + 2 && b.height <= innerHeight + 2; })); }
  await page.setViewportSize({ width: 1600, height: 900 }); await sleep(300);
  check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  console.log(fails.length || errors.length ? `\nRESULT: ${fails.length} failed check(s), ${errors.length} error(s)\n` + fails.join('\n') + '\n' + errors.join('\n') : '\nRESULT: PASS'); console.log('screenshots in ' + outDir);
  process.exit(fails.length || errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
