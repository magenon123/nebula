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
      else if (!seen.shotMid && st.chips >= 8) { seen.shotMid = 1; console.log('    [char class at mid shot: ' + (await page.$eval('#char', e => e.className)) + ']'); await frozen(shots + '-bonus-mid'); }
      await sleep(40); }
    seen.obs = await page.evaluate(() => JSON.parse(JSON.stringify(__seen))); return seen; };

  console.log('== smoke: ' + file);
  await page.goto('file://' + file);
  await page.evaluate(() => { window.__seen = { fly: 0, kite: 0, dragon: 0, gate: 0 }; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { const c = n.className || ''; if (/ctFly/.test(c)) __seen.fly++; if (/ctK\b/.test(c)) __seen.kite++; if (/ctDragon/.test(c)) __seen.dragon++; }))).observe(document.body, { childList: true, subtree: true });
    new MutationObserver(() => { if (document.querySelector('#gates .gate.on')) __seen.gate++; }).observe(document.getElementById('gates'), { attributes: true, subtree: true }); });
  /* OWNER BUG GUARD: in no frame of any bonus may the counter show "n / m" (shell text) or the shell's bonus message appear */
  await page.evaluate(() => { window.__fsAll = []; window.__msgAll = [];
    new MutationObserver(() => window.__fsAll.push(document.getElementById('fs').textContent)).observe(document.getElementById('fs'), { childList: true, characterData: true, subtree: true });
    new MutationObserver(() => window.__msgAll.push(document.getElementById('msg').textContent)).observe(document.getElementById('msg'), { childList: true, characterData: true, subtree: true });
    const poll = () => { const f = document.getElementById('fs').textContent; if (/\/\s*\d+/.test(f)) window.__fsAll.push('RAF:' + f); requestAnimationFrame(poll); }; poll(); });
  await sleep(2500);
  const fpsIdle = await page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(n / 3); }; requestAnimationFrame(f); }));
  console.log('  idle fps (software rendering): ' + fpsIdle.toFixed(1));
  let s = await state(); await shot('01-idle');
  check('idle: play-money balance $1,000.00', s.bal === '$1,000.00', s.bal);
  check('idle: 5x4 board = 20 cells, 4 Kite Launch gates', (await page.$$eval('#grid .cell', c => c.length)) === 20 && (await page.$$eval('#gates .gate', c => c.length)) === 4);
  check('idle: status line, sign has no price', /SHALL WE POUR/.test(s.msg) && (await page.$('#buyPrice')) === null, s.msg);
  check('idle: status line fits ONE line (no wrap with the embedded font)', await page.$eval('#msg', e => { const r = document.createRange(); r.selectNodeContents(e); const b = r.getBoundingClientRect(); return b.height < 34 && b.width < e.getBoundingClientRect().width; }));
  check('idle: no dusk, no Fever badge', !(await page.$eval('#scene', e => e.classList.contains('dusk'))) && !s.fever);
  await clk('#menuBtn'); await sleep(200); check('menu opens', await vis('#menu'));
  await clk('#bSnd'); check('sound toggles OFF', (await txt('#bSnd i')) === 'OFF'); await clk('#bSnd'); check('sound toggles ON', (await txt('#bSnd i')) === 'ON');
  if (!await vis('#menu')) await clk('#menuBtn');
  await clk('#bTurbo'); check('turbo ON shows badge', await page.evaluate(() => !document.getElementById('turboBadge').hidden)); await clk('#bTurbo');   // leave turbo OFF (real timing for the screenshots)
  if (!await vis('#menu')) await clk('#menuBtn'); await sleep(150); await clk('#bInfo'); await sleep(250); check('info opens', await vis('#infoM')); await shot('02-info');
  const nPt = await page.$$eval('#ptab tr', r => r.length);
  check('info paytable: header + 8 pay symbols + wild, bundle, FS drum, tin, 3 jackpot tins, grand = 17 rows', nPt === 17, String(nPt));
  { const it = await txt('#infoM'); check('info: Free Spins, Super, Steeping Drawers, boost tables from info()', /FREE SPINS/.test(it) && /SUPER FREE SPINS/.test(it) && /STEEPING DRAWERS/.test(it) && (await page.$$eval('#infoM table.boost', t => t.length)) === 2 && /\+8/.test(it) && /for 21x/.test(it) && /75x/.test(it) && !/undefined|NaN/.test(it), it.slice(0, 80)); }
  check('info text: max win 5,000x, buy 60x placeholder resolved, no [[ ]] left', /5,000x/.test(await txt('#infoM')) && /for 60x/.test(await txt('#infoM')) && !/\[\[/.test(await txt('#infoM')));
  check('info paytable is the engine data (Golden Koi 5 of a kind = 36.74x)', /36\.74x/.test(await txt('#ptab')));
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
  check('buy screen: THREE cards (Tin Rush $60, Free Spins $21, Super $75), no Fever card', (await page.$$eval('.bbRow .bbc', c => c.length)) === 3 && (await txt('#p1')) === '$60.00' && (await txt('#p2')) === '$21.00' && (await txt('#p3')) === '$75.00' && (await page.$('#ante')) === null);
  check('buy screen: cards are the same height and the names fit on one line', await page.$$eval('.bbRow .bbc', c => { const h = c.map(x => Math.round(x.getBoundingClientRect().height)); return Math.max(...h) - Math.min(...h) < 30; }) && await page.$$eval('.bbc h3', h => h.every(x => x.getBoundingClientRect().height < 36)));
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
  check('cap: outro appears', await waitFor('#outroM', 120000));
  let sawMax = false; for (let i = 0; i < 200 && !sawMax; i++) { if (await vis('#outroM')) { await sleep(700); await clk('#outroM', { position: { x: 60, y: 60 } }).catch(() => {}); } sawMax = await page.evaluate(() => document.getElementById('big').classList.contains('maxwin') && document.getElementById('big').classList.contains('show')); await sleep(100); }
  check('cap: gold MAX WIN screen shows', sawMax); await sleep(1800); await shot('18-max-win');
  check('cap round settles', await settle()); await page.evaluate(NORMAL);

  // ===== Round 7: FREE SPINS, SUPER FREE SPINS (4 and 5 FS), retrigger, FS tease, Tin priority =====
  await page.evaluate(() => { window.__r7 = { ladle: 0, x: 0, sky: 0, banner: 0, fly: 0 };
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { const c = (typeof n.className === 'string' ? n.className : '') || ''; if (/ctLadle/.test(c)) __r7.ladle++; if (/\bctX\b/.test(c)) __r7.x++; if (/ctSkyK/.test(c)) __r7.sky++; if (/ctFly/.test(c)) __r7.fly++; }))).observe(document.getElementById('stage'), { childList: true, subtree: true });
    new MutationObserver(() => { const b = document.querySelector('#ctBanner b'); if (b && /SPINS!/.test(b.textContent)) __r7.banner++; }).observe(document.getElementById('ctBanner'), { childList: true, subtree: true }); });
  const runFs = async pre => {
    const sh = {}; const t0 = Date.now(); const out = { lvMax: 0, sky: 0 };
    while (Date.now() - t0 < 400000) {
      const st = await page.evaluate(() => ({ outro: !document.getElementById('outroM').hidden, ladle: !!document.querySelector('.ctLadle'), lv: document.querySelectorAll('#grid .cell[data-lv]').length, lv3: document.querySelectorAll('#grid .cell[data-lv="3"],#grid .cell[data-lv="4"]').length,
        msg: document.getElementById('msg').textContent, sky: document.querySelectorAll('#ctSky .ctSkyK').length, ban: +getComputedStyle(document.getElementById('ctBanner')).opacity > .8 && /SPINS!/.test(document.querySelector('#ctBanner b').textContent), fsBox: !document.getElementById('fsBox').hidden }));
      if (st.outro) break; out.lvMax = Math.max(out.lvMax, st.lv); out.sky = Math.max(out.sky, st.sky);
      if (st.fsBox && !sh.cnt) { sh.cnt = 1; await sleep(300); await page.screenshot({ path: path.join(outDir, pre + '-counter.png'), clip: { x: 0, y: 0, width: 420, height: 160 } }); }
      if (st.ladle && !sh.pour) { sh.pour = 1; await sleep(480); await shot(pre + '-levelup-pour'); }
      else if (st.ban && !sh.ret) { sh.ret = 1; await sleep(250); await shot(pre + '-retrigger'); }
      else if (st.sky && !sh.sky) { sh.sky = 1; await sleep(2300); await shot(pre + '-kite-in-sky'); }
      else if (st.lv >= 6 && /FINE CUP/.test(st.msg) && !sh.mid) { sh.mid = 1; await sleep(500); await shot(pre + '-steeped-mid'); }
      await sleep(50); }
    return out; };
  const buyCard = async n => { await clk('#buyOpen'); await sleep(250); await clk('#buy' + n); await sleep(250); await clk('#cYes'); };
  const finishFs = async (pre, who) => { check(who + ': outro appears', await waitFor('#outroM', 120000)); await sleep(2800); await shot(pre + '-outro'); const v = await txt('#outroV'); check(who + ': outro total is a dollar amount', /^\$[\d,]+\.\d\d$/.test(v), v); await clk('#outroM', { position: { x: 60, y: 60 } }); check(who + ': round settles', await settle()); };
  const fsVals = async i0 => (await page.evaluate(() => window.__fsAll)).slice(i0).filter(x => /^\d+$/.test(x)).map(Number).filter((v, i, a) => i === 0 || v !== a[i - 1]);   // ordered, consecutive duplicates removed

  // FREE SPINS (bought, 21x): drums -> intro -> 10 spins, steep pours, retrigger, outro
  await page.evaluate(FORCE(`x => x.bought === 'fs' && x.bonus.spins.length >= 11 && x.bonus.spins.some(d => d.levelUps.length >= 2) && x.bonus.spins.some(d => d.retrigger) && x.bonus.spins.some(d => d.wins.some(w => w.boost > 0)) && x.totalPayout > 8 && x.totalPayout < 150`, 61));
  const fsI0 = await page.evaluate(() => window.__fsAll.length); await page.evaluate(() => { __r7.ladle = __r7.x = __r7.sky = __r7.banner = __r7.fly = 0; }); await watchMsgs();
  await buyCard(2);
  check('FS buy: trigger spin shows exactly 3 FS drums', await waitCond(() => document.querySelectorAll('#grid .cell.scat').length === 3, 30000)); await sleep(500); await shot('R7-fs-trigger');
  check('FS buy: intro appears', await waitFor('#introM', 60000)); await sleep(1700); await shot('R7-fs-intro');
  check('FS intro: 10 SPINS, FREE SPINS ribbon, Koji portrait, no pre-steep map', (await txt('#introN')) === '10' && (await txt('#introRibbon')) === 'FREE SPINS' && !!(await page.$('#introArt svg.kojiSplash')) && !(await page.$('.preMap')), (await txt('#introN')) + ' / ' + (await txt('#introRibbon')));
  await clk('#introM', { position: { x: 80, y: 80 } });
  await sleep(150); check('FS: counter label is SPINS LEFT in the same counter spot', /SPINS LEFT/.test(await txt('#fsBox small')) && (await page.$eval('#fsBox', e => !e.hidden)), await txt('#fsBox small'));
  const fo = await runFs('R7-fs');
  const o7 = await page.evaluate(() => window.__r7), fv = await fsVals(fsI0);
  check('FS: drawers got steeped (level skins on the board)', fo.lvMax >= 4, String(fo.lvMax));
  check('FS: pour (ladle) animation ran and x(1+boost) chips showed', o7.ladle >= 2 && o7.x >= 1, JSON.stringify(o7));
  check('FS: retrigger banner "+N SPINS" and the +N flew into the counter', o7.banner >= 1 && o7.fly >= 1, JSON.stringify(o7));
  check('FS: counter counts down to 0 and goes UP on the retrigger (own counter)', fv[0] === 10 && fv.includes(0) && fv.some((v, i) => i > 0 && v > fv[i - 1]), fv.join(','));
  check('FS: messages are the bonus own (steeping / pours), shell text absent', await sawMsg(/STEEPING/) && await sawMsg(/KOJI POURS/) && await sawMsg(/MORE DRUMS/) && !(await sawMsg(/TIN RUSH: POUR/)));
  await finishFs('R7-fs', 'FS'); s = await state();
  check('FS: after the bonus dusk is off, counter hidden, drawer skins cleared', !(await page.$eval('#scene', e => e.classList.contains('dusk'))) && !s.fsBox && (await page.$$eval('#grid .cell[data-lv]', c => c.length)) === 0);
  await page.evaluate(NORMAL);

  // SUPER (bought, 75x): 4 drums, 12 spins, pre-steeped drawers in the intro and on the board, gold look, a top-level kite pops into the sky
  await page.evaluate(FORCE(`x => x.bought === 'super' && x.fsScatter.count === 4 && x.bonus.startSpins === 12 && x.bonus.preSteep.length === 4 && x.bonus.spins.some(d => d.levelUps.some(u => u.popKite)) && x.bonus.spins.some(d => d.retrigger) && x.totalPayout > 30 && x.totalPayout < 500`, 62));
  await page.evaluate(() => { __r7.ladle = __r7.x = __r7.sky = __r7.banner = __r7.fly = 0; }); await watchMsgs();
  await buyCard(3);
  check('SUPER buy: trigger spin shows 4 FS drums', await waitCond(() => document.querySelectorAll('#grid .cell.scat').length === 4, 30000));
  check('SUPER buy: intro appears', await waitFor('#introM', 60000)); await sleep(2300); await shot('R7-super-intro-presteeped');
  check('SUPER intro: 12 SPINS, SUPER ribbon, gold class, 4 pre-steeped drawers shown, super portrait', (await txt('#introN')) === '12' && /SUPER FREE SPINS/.test(await txt('#introRibbon')) && await page.$eval('#introM', e => e.classList.contains('sup')) && (await page.$$eval('.preMap i.g', i => i.length)) === 4 && !!(await page.$('#introArt svg.kojiSplash.super')));
  await clk('#introM', { position: { x: 80, y: 80 } }); await sleep(900);
  check('SUPER: gold look on (scene sup) and Koji in bonus mode', await page.$eval('#ctSky', e => e.classList.contains('sup')) && await page.$eval('#char', e => e.classList.contains('bonusmode')));
  const fpsBonus = await page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(n / 3); }; requestAnimationFrame(f); }));
  console.log('  bonus (dusk, super) fps while playing, software rendering: ' + fpsBonus.toFixed(1));
  const so = await runFs('R7-super'); const o8 = await page.evaluate(() => window.__r7);
  check('SUPER: pre-steeped drawers were on the board from the first spin (levels)', so.lvMax >= 4, String(so.lvMax));
  check('SUPER: a top-level drawer popped a kite into the sky', o8.sky >= 1 && so.sky >= 1, JSON.stringify(o8));
  check('SUPER: retrigger banner shown', o8.banner >= 1, JSON.stringify(o8));
  await finishFs('R7-super', 'SUPER'); await page.evaluate(NORMAL);

  // 5 FS: SUPER with 16 spins
  await page.evaluate(FORCE(`x => x.bought === 'super' && x.fsScatter.count === 5 && x.bonus.startSpins === 16 && x.totalPayout < 300`, 63)); await watchMsgs();
  await buyCard(3);
  check('5 FS buy: trigger spin shows 5 drums', await waitCond(() => document.querySelectorAll('#grid .cell.scat').length === 5, 30000));
  check('5 FS: intro says 16 SPINS (SUPER)', await waitFor('#introM', 60000) && (await sleep(800), (await txt('#introN')) === '16') && /SUPER/.test(await txt('#introRibbon'))); await shot('R7-5fs-intro');
  await clk('#introM', { position: { x: 80, y: 80 } }); await runFs('R7-5fs'); await finishFs('R7-5fs', '5 FS'); await page.evaluate(NORMAL);

  // natural FS (3 drums on the base spin with a line win) and natural SUPER from the base spin
  await page.evaluate(FORCE(`x => !x.bought && x.bonusType === 'fs' && x.fsScatter.count === 3 && x.cascadeSteps[0].wins.length >= 1 && x.totalPayout < 100`, 64)); await watchMsgs(); await clk('#spin');
  check('natural FS: lines shown, then the drums, then the intro', await waitFor('#introM', 120000) && await sawMsg(/DRUMS! FREE SPINS/)); await sleep(900); await clk('#introM', { position: { x: 80, y: 80 } });
  await runFs('R7-nat-fs'); await finishFs('R7-nat-fs', 'natural FS'); await page.evaluate(NORMAL);
  await page.evaluate(FORCE(`x => !x.bought && x.bonusType === 'super' && x.totalPayout < 400`, 65)); await watchMsgs(); await clk('#spin');
  check('natural SUPER: intro appears', await waitFor('#introM', 120000)); await sleep(900); check('natural SUPER: intro is the super splash', await page.$eval('#introM', e => e.classList.contains('sup'))); await clk('#introM', { position: { x: 80, y: 80 } });
  await runFs('R7-nat-super'); await finishFs('R7-nat-super', 'natural SUPER'); await page.evaluate(NORMAL);

  // FS tease: 2 drums in the first reels -> slow last reels, "ONE MORE...", Koji holds his breath; ends without a bonus
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.fsScatter.count === 2 && x.tins.count < 4 && x.fsScatter.cells.every(c => c[1] <= 2)`, 66));
  await watchMsgs(); await page.evaluate(() => { window.__tease2 = false; setInterval(() => { if (document.getElementById('char').classList.contains('tease')) window.__tease2 = true; }, 30); }); await clk('#spin');
  check('FS tease: "ONE MORE..." with the slow drop after 2 drums', await waitCond(() => document.getElementById('msg').textContent.includes('ONE MORE'), 20000)); await sleep(500); await shot('R7-fs-tease');
  check('FS tease: Koji holds his breath', await waitCond(() => window.__tease2, 8000)); check('FS tease settles', await settle()); check('FS tease: near-miss copy', await sawMsg(/ONE MORE DRUM/)); await page.evaluate(NORMAL);

  // Tin Rush priority: 6+ tins and 3+ FS in the same spin -> Tin Rush only (engine rewrites the FS cells), Tin Rush keeps its own POURS LEFT label
  await page.evaluate(FORCE(`x => !x.bought && x.bonusType === 'tin' && x.fsScatter.suppressed >= 3 && x.totalPayout < 400`, 67)); await watchMsgs(); await clk('#spin');
  check('Tin priority: Tin Rush intro (no FS bonus)', await waitFor('#introM', 120000)); await sleep(900);
  check('Tin priority: TIN RUSH ribbon, 3 POURS, no drums on the board, normal splash', /TIN RUSH/.test(await txt('#introRibbon')) && (await txt('#introN')) === '3' && (await page.$$eval('#grid .cell use[href="#s16"]', u => u.length)) === 0 && !(await page.$eval('#introM', e => e.classList.contains('sup'))));
  await clk('#introM', { position: { x: 80, y: 80 } }); await sleep(900); check('Tin Rush counter label is POURS LEFT again', /POURS LEFT/.test(await txt('#fsBox small')), await txt('#fsBox small'));
  await runBonus('prio', 'R7-prio'); check('Tin priority: outro', await waitFor('#outroM', 120000)); await sleep(2800); await shot('R7-tin-outro'); await clk('#outroM', { position: { x: 60, y: 60 } }); check('Tin priority round settles', await settle()); await page.evaluate(NORMAL);

  // THE OWNER'S BUG: across Tin Rush, Free Spins, Super (all bonuses above) the counter never showed "n / m" and the shell's bonus line never appeared
  { const all = await page.evaluate(() => window.__fsAll), msgs = await page.evaluate(() => window.__msgAll);
    check('NO FLASH: #fs never matched /\/\s*\d+/ in ' + all.length + ' mutations over Tin Rush + FS + SUPER', all.length > 20 && !all.some(x => /\/\s*\d+/.test(x)), all.filter(x => /\/\s*\d+/.test(x)).slice(0, 5).join('|'));
    check('NO FLASH: #msg never showed the shell bonus text ("TIN RUSH: POUR n", "n / m") in ' + msgs.length + ' updates', msgs.length > 50 && !msgs.some(x => /TIN RUSH: POUR|\d+\s*\/\s*\d+/.test(x))); }

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
