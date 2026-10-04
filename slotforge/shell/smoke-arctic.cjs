/* Smoke test for Arctic Aurora Lodge on the shared shell: node slotforge/shell/smoke-arctic.cjs [build.html] [--out DIR]
 * idle (6x5, blocks as ONE symbol), info paytable, base win with giant blocks (+ wild flight), FS tease, gem tease, buy screen (Northern Lights + 2 buys),
 * bought Aurora Muse (trigger spin, intro, lit symbol announced before the drop, retrigger, outro, no counter flash), bought Aurora Sweep (sheet, bands, melt, crossing chips,
 * full reveal, outro), ante on/off, gold MAX WIN screen, autoplay, mid-bonus turbo. 0 console/page errors required. */
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const SCRATCH = '/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/aal/smoke';
const ROOT = path.resolve(__dirname, '../..');
const SEED = `(() => {
  const mk = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const r = mk(20241003); Math.random = mk(77);
  crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(r() * 4294967296); return a; };
})();`;
const FORCE = (pred, tag) => `(() => { const o = window.__origPR || (window.__origPR = SLOT_ENGINE.playRound); let s = ${tag}; const rg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  SLOT_ENGINE.playRound = (r, a) => { for (let i = 0; i < 600000; i++) { const x = o(rg, a); if ((${pred})(x)) return x; } return o(r, a); }; })();`;
const MUT = (pred, tag, mut) => `(() => { const o = window.__origPR || (window.__origPR = SLOT_ENGINE.playRound); let s = ${tag}; const rg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  SLOT_ENGINE.playRound = (r, a) => { for (let i = 0; i < 600000; i++) { const x = o(rg, a); if ((${pred})(x)) { (${mut})(x); return x; } } return o(r, a); }; })();`;
const NORMAL = `if (window.__origPR) SLOT_ENGINE.playRound = window.__origPR;`;
(async () => {
  const file = path.resolve(args.find(a => !a.startsWith('--') && a !== opt('--out')) || path.join(ROOT, 'arctic-aurora-lodge-standalone.html'));
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
  /* plays an intro-tapped bonus to the outro; screenshots at key moments; collects what was seen */
  const runBonus = async pre => {
    const seen = { lit: new Set(), litCls: 0, rg: 0, bands: 0, melt: 0, xm: 0, miss: 0, orb: 0, retr: false, fsVals: new Set(), sweepOn: false, auraFs: false, blockMax: 0 }; const t0 = Date.now(), sh = {};
    while (Date.now() - t0 < 500000) {
      const st = await page.evaluate(() => ({ outro: !document.getElementById('outroM').hidden, fs: document.getElementById('fs').textContent.trim(), lit: (document.querySelector('#aura .litSym use') || {}).getAttribute ? document.querySelector('#aura .litSym use').getAttribute('href') : '',
        auraFs: document.getElementById('aura').classList.contains('fs'), litCls: document.querySelectorAll('#grid .cell.lit').length, rg: document.querySelectorAll('#grid .rg').length, bands: document.querySelectorAll('.arBand').length,
        melt: document.querySelectorAll('#sweep .sc.melt').length, xm: document.querySelectorAll('#sweep .sc.xm').length, miss: document.querySelectorAll('#sweep .sc.miss').length, orb: document.querySelectorAll('.arOrb').length,
        sweepOn: document.getElementById('sweep').classList.contains('on'), ban: +getComputedStyle(document.getElementById('arBanner')).opacity > .8 ? document.querySelector('#arBanner b').textContent : '', blocks: document.querySelectorAll('#grid .cell.b2,#grid .cell.b3').length,
        hit: document.querySelectorAll('#grid .cell.hit').length }));
      if (st.outro) break; seen.fsVals.add(st.fs); if (st.lit) seen.lit.add(st.lit); seen.litCls = Math.max(seen.litCls, st.litCls); seen.rg = Math.max(seen.rg, st.rg); seen.bands += st.bands ? 0 : 0; seen.melt = Math.max(seen.melt, st.melt); seen.xm = Math.max(seen.xm, st.xm); seen.miss = Math.max(seen.miss, st.miss); seen.orb = Math.max(seen.orb, st.orb);
      seen.sweepOn = seen.sweepOn || st.sweepOn; seen.auraFs = seen.auraFs || st.auraFs; seen.blockMax = Math.max(seen.blockMax, st.blocks); if (/SPINS!/.test(st.ban)) seen.retr = true;
      if (/^LIT:/.test(st.ban) && !sh.lit) { sh.lit = 1; await sleep(250); await frozen(pre + '-lit-announce'); }
      else if (st.litCls && st.hit >= 3 && st.rg && !sh.litwin) { sh.litwin = 1; await sleep(350); await frozen(pre + '-lit-win'); }
      else if (/SPINS!/.test(st.ban) && !sh.ret) { sh.ret = 1; await sleep(300); await frozen(pre + '-retrigger'); }
      else if (st.bands && !sh.band) { sh.band = 1; await sleep(500); await frozen(pre + '-band'); }
      else if (st.xm && !sh.xm) { sh.xm = 1; await sleep(400); await frozen(pre + '-converge'); }
      else if (st.miss >= 6 && !sh.miss) { sh.miss = 1; await sleep(700); await frozen(pre + '-reveal'); }
      else if (st.melt >= 8 && !sh.melt) { sh.melt = 1; await frozen(pre + '-melt'); }
      await sleep(40); }
    return seen; };

  console.log('== smoke: ' + file);
  await page.goto('file://' + file);
  /* OWNER BUG GUARD: in no frame of any bonus may the counter show "n / m" (shell text) or the shell's bonus message appear */
  await page.evaluate(() => { window.__fsAll = []; window.__msgAll = [];
    new MutationObserver(() => window.__fsAll.push(document.getElementById('fs').textContent)).observe(document.getElementById('fs'), { childList: true, characterData: true, subtree: true });
    new MutationObserver(() => window.__msgAll.push(document.getElementById('msg').textContent)).observe(document.getElementById('msg'), { childList: true, characterData: true, subtree: true });
    const poll = () => { const f = document.getElementById('fs').textContent; if (/\/\s*\d+/.test(f)) window.__fsAll.push('RAF:' + f); requestAnimationFrame(poll); }; poll();
    window.__seq = []; new MutationObserver(() => window.__seq.push('lit')).observe(document.querySelector('#aura .litSym'), { childList: true });
    new MutationObserver(ms => { if (ms.some(m => m.addedNodes.length > 3)) window.__seq.push('grid'); }).observe(document.getElementById('grid'), { childList: true });
    window.__orbs = 0; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.className && /arOrb/.test(n.className)) window.__orbs++; }))).observe(document.getElementById('fxl'), { childList: true });
    window.__bands = 0; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.className && /arBand/.test(n.className)) window.__bands++; }))).observe(document.getElementById('sweepBands'), { childList: true }); });
  await sleep(2500);
  const fpsIdle = await page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(n / 3); }; requestAnimationFrame(f); }));
  console.log('  idle fps (software rendering): ' + fpsIdle.toFixed(1));
  let s = await state(); await shot('01-idle');
  check('idle fps >= 30 (software renderer)', fpsIdle >= 30, fpsIdle.toFixed(1));
  check('idle: play-money balance $1,000.00', s.bal === '$1,000.00', s.bal);
  { const g = await page.evaluate(() => { const els = [...document.querySelectorAll('#grid .cell')]; return { n: els.length, area: els.reduce((a, e) => a + (e.classList.contains('b3') ? 9 : e.classList.contains('b2') ? 4 : 1), 0), b2: document.querySelectorAll('#grid .cell.b2').length, b3: document.querySelectorAll('#grid .cell.b3').length }; });
    check('idle: 6x5 board = 30 cells of area, giant blocks are ONE element each (cells under them not rendered)', g.area === 30 && g.n === 30 - 8 - 3 && g.b2 === 1 && g.b3 === 1, JSON.stringify(g));
    const bs = await page.$eval('#grid .cell.b3', e => { const r = e.getBoundingClientRect(); return r.width; }); check('idle: 3x3 block is 3 cells wide (art viewBox fills it)', bs > 290 * (await page.evaluate(() => document.getElementById('stage').getBoundingClientRect().width / 1600)) - 5, String(bs)); }
  check('idle: status line, sign has no price, no Northern Lights badge', /SKY IS QUIET/.test(s.msg) && (await page.$('#buyPrice')) === null && !s.fever, s.msg);
  check('idle: status line fits ONE line', await page.$eval('#msg', e => { const r = document.createRange(); r.selectNodeContents(e); const b = r.getBoundingClientRect(); return b.height < 34; }));
  await clk('#menuBtn'); await sleep(200); check('menu opens', await vis('#menu'));
  await clk('#bSnd'); check('sound toggles OFF', (await txt('#bSnd i')) === 'OFF'); await clk('#bSnd'); check('sound toggles ON', (await txt('#bSnd i')) === 'ON');
  await clk('#bMus'); check('music toggles OFF', (await txt('#bMus i')) === 'OFF'); await clk('#bMus'); check('music toggles ON', (await txt('#bMus i')) === 'ON');
  if (!await vis('#menu')) await clk('#menuBtn');
  await clk('#bTurbo'); check('turbo ON shows badge', await page.evaluate(() => !document.getElementById('turboBadge').hidden)); await clk('#bTurbo');
  if (!await vis('#menu')) await clk('#menuBtn'); await sleep(150); await clk('#bInfo'); await sleep(250); check('info opens', await vis('#infoM')); await shot('02-info');
  check('info paytable: header + 8 pay symbols + wild, FS, gem = 12 rows', (await page.$$eval('#ptab tr', r => r.length)) === 12);
  { const it = await txt('#infoM'); check('info: max win 7,500x, buys 86x / 57x resolved, no [[ ]], no "three times"', /7,500x/.test(it) && /for 86x/.test(it) && /for 57x/.test(it) && !/\[\[/.test(it) && !/three times/.test(it));
    const top = await page.evaluate(() => SLOT_CFG.engineData.info.pay[7][4]); check('info paytable is the engine data (Snowy Owl 20+ = ' + top + 'x)', (await txt('#ptab')).includes(+top.toFixed(2) + 'x')); }
  await clk('#infoM [data-close]'); check('info closes', !(await vis('#infoM')));
  await clk('#betV'); await sleep(250); const opts = await page.$$eval('#betGrid .opt', o => o.map(x => x.textContent));
  check('bet picker $0.10 .. $10,000, 42 options', opts[0] === '$0.10' && opts[opts.length - 1] === '$10,000' && opts.length === 42, opts.length + ''); await clk('#betGrid .opt:text-is("$1")');
  check('bet $1.00', (await txt('#bet')) === '$1.00');

  // base spin: a win built from giant blocks, with a wild that flies to its symbol
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.initialBlocks.length >= 2 && x.cascadeSteps[0].wins.length >= 1 && x.cascadeSteps[0].wins.some(w => w.blocks.length >= 1 && w.wilds.length >= 1) && x.cascadeSteps[0].payout > 0.8`, 11));
  await watchMsgs(); await clk('#spin'); await sleep(300);
  check('spin: button busy, chevrons disabled', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled) && await page.$eval('#p', e => e.disabled));
  check('base: giant blocks drop in as one piece, board area still 30', await waitCond(() => { const e = [...document.querySelectorAll('#grid .cell')]; return e.length > 20 && document.querySelectorAll('#grid .cell.b2,#grid .cell.b3').length >= 1 && e.reduce((a, x) => a + (x.classList.contains('b3') ? 9 : x.classList.contains('b2') ? 4 : 1), 0) === 30; }, 8000));
  await sleep(700); await frozen('03-drop');
  check('win: winners lit with glow rings and their own motion (.hit + .rg)', await waitCond(() => document.querySelectorAll('#grid .cell.hit').length >= 2 && document.querySelectorAll('#grid .rg').length >= 2, 30000));
  await sleep(500); await frozen('04-win-blocks');
  check('win: a wild flew to its symbol (arOrb)', (await page.evaluate(() => window.__orbs)) >= 1);
  check('spin settles', await settle()); s = await state();
  check('spin: win paid, balance moved', /^\$[\d,]+\.\d\d$/.test(s.win) && s.win !== '$0.00' && s.bal !== '$1,000.00', s.win + ' / ' + s.bal);
  check('spin: win status line', /AURORA PAYS/.test(s.msg), s.msg); check('win shown in the line while counting (symbol name + amount)', await sawMsg(/\+\$/));
  await page.evaluate(NORMAL);
  await page.keyboard.press('Space'); await sleep(250); check('Space starts a spin', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled)); check('Space spin settles', await settle());

  // FS tease: 2 FS in the first reels, no trigger
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.scatters.fs.count === 2 && x.scatters.fs.cells.every(c => c[1] <= 2) && x.scatters.gems.count < 3`, 23));
  await watchMsgs(); await page.evaluate(() => { window.__tease = false; setInterval(() => { if (document.getElementById('char').classList.contains('tease')) window.__tease = true; }, 30); });
  await clk('#spin'); check('FS tease: "ONE MORE EMBER..." slow drop after 2 FS', await waitCond(() => document.getElementById('msg').textContent.includes('ONE MORE EMBER'), 20000));
  await sleep(450); await shot('05-fs-tease'); check('FS tease: Aino holds her breath (char.tease)', await waitCond(() => window.__tease, 8000));
  check('FS tease settles', await settle()); check('FS tease: near-miss copy', await sawMsg(/ALMOST\.\.\. JUST ONE MORE EMBER/));
  // gem tease: 3 gems early
  await page.evaluate(FORCE(`x => !x.bonusTriggered && x.scatters.gems.count === 3 && x.scatters.gems.cells.every(c => c[1] <= 3)`, 29));
  await watchMsgs(); await clk('#spin'); check('gem tease: "ONE MORE GEM..." after 3 gems', await waitCond(() => document.getElementById('msg').textContent.includes('ONE MORE GEM'), 20000));
  await sleep(300); await shot('05b-gem-tease'); check('gem sockets 1-3 lit on the aura meter', (await page.$$eval('#aura .g.on', g => g.length)) >= 2);
  check('gem tease settles', await settle()); await page.evaluate(NORMAL);

  // buy screen: Northern Lights card + two buys
  await clk('#buyOpen'); await sleep(300); check('buy screen opens', await vis('#buyM')); await shot('06-buy-screen');
  check('buy screen: Northern Lights card + 2 buys (Aurora Muse $86, Aurora Sweep $57), no MAX LUCK', (await page.$$eval('.bbRow .bbc', c => c.length)) === 3 && (await txt('#p1')) === '$86.00' && (await txt('#p2')) === '$57.00' && (await page.$('#ante')) !== null && !/MAX LUCK/i.test(await txt('#buyM')));
  check('buy screen: card names fit on one line INSIDE their card', await page.$$eval('.bbc', c => c.every(x => { const h = x.querySelector('h3'), a = h.getBoundingClientRect(), b = x.getBoundingClientRect(); return a.height < 40 && a.left >= b.left && a.right <= b.right; })));
  await clk('#buy1'); await sleep(250); check('BUY opens confirm', await vis('#confirm') && !(await vis('#buyM'))); await shot('07-confirm');
  check('confirm copy and cost', /BUY AURORA MUSE/.test(await txt('#cTitle')) && (await txt('#cCost')) === '$86.00');
  const before = await state(); await clk('#cNo'); await sleep(200); s = await state(); check('CANCEL spends nothing', !(await vis('#confirm')) && s.bal === before.bal);

  // ===== bought AURORA MUSE: trigger spin (visible, no win), intro, lit symbols, retrigger, outro =====
  await page.evaluate(FORCE(`x => x.bought === 'fs' && x.bonus.scatters === 3 && x.bonus.spins.length >= 14 && x.bonus.spins.some(d => d.retrigger) && x.bonus.spins.filter(d => d.wins.length).length >= 5 && x.totalPayout > 40 && x.totalPayout < 600`, 5));
  await page.evaluate(() => { window.__seq.length = 0; }); await watchMsgs(); const bal0 = (await state()).bal;
  await buy(1);
  check('bought Muse: trigger spin drops 3 FS embers, no win', await waitCond(() => document.querySelectorAll('#grid .cell.hit').length >= 3, 30000)); await sleep(500); await shot('08-trigger-spin-fs');
  check('bought: balance charged $86 (before the bonus pays)', Math.abs(usd(before.bal) - usd((await state()).bal) - 86) < .01, before.bal + ' -> ' + (await state()).bal);
  const sawIntro = await waitFor('#introM'); check('intro splash appears', sawIntro);
  if (sawIntro) { await sleep(1400); await shot('09-intro-fs'); check('intro: 10 spins, AURORA MUSE ribbon', (await txt('#introN')) === '10' && /AURORA MUSE/.test(await txt('#introRibbon')), await txt('#introN'));
    check('intro: Aino portrait present and sized', await page.$eval('#introM .ainoSplash', e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.height > 180; }));
    await clk('#introM', { position: { x: 80, y: 80 } }); }
  await sleep(1500); s = await state(); check('bonus: spins counter visible, plain number', s.fsBox && /^\d+$/.test(s.fs), s.fs);
  check('bonus: scene in bonus (violet), Aino in bonus mode', await page.$eval('#scene', e => e.classList.contains('bonus')) && await page.$eval('#char', e => e.classList.contains('bonusmode')));
  const seen = await runBonus('10fs');
  check('Muse: lit symbol announced on the meter and on the board', seen.auraFs && seen.lit.size >= 2 && seen.litCls >= 1, JSON.stringify({ lit: [...seen.lit], litCls: seen.litCls }));
  { const seq = await page.evaluate(() => window.__seq), i = seq.indexOf('lit'), j = seq.indexOf('grid', i + 1); let ok = seq.length >= 4; for (let k = 0; k + 1 < seq.length; k++) if (seq[k] === 'grid' && seq[k + 1] === 'grid') ok = false;
    check('Muse: the lit symbol is set BEFORE every grid drops (lit, grid, lit, grid ...)', ok && i >= 0 && j > i, seq.join(',').slice(0, 80)); }
  check('Muse: winners ringed, giant blocks seen', seen.rg >= 1 && seen.blockMax >= 1, JSON.stringify({ rg: seen.rg, b: seen.blockMax }));
  check('Muse: retrigger banner +5 SPINS and the counter grew', seen.retr && seen.fsVals.size >= 6, [...seen.fsVals].join(','));
  check('Muse: messages (lights the, spins)', await sawMsg(/THE AURORA LIGHTS THE/));
  check('outro splash appears', await waitFor('#outroM', 120000));
  await sleep(3500); await shot('12-outro-fs'); check('outro total is a dollar amount, Aino portrait', /^\$[\d,]+\.\d\d$/.test(await txt('#outroV')) && await page.$eval('#outroM .ainoSplash', e => e.getBoundingClientRect().width > 200), await txt('#outroV')); await clk('#outroM', { position: { x: 60, y: 60 } });
  check('round settles after Muse', await settle()); s = await state(); await shot('13-after-fs');
  check('after Muse: counter hidden, scene normal, aura cleared', !s.fsBox && !(await page.$eval('#scene', e => e.classList.contains('bonus'))) && (await page.$$eval('#aura.fs', e => e.length)) === 0);
  check('NO COUNTER FLASH: no "n / m" in the counter in any frame, shell bonus message never shown', !(await page.evaluate(() => window.__fsAll)).some(t => /\/\s*\d+/.test(t)) && !(await page.evaluate(() => window.__msgAll)).some(m => /FREE SPIN \d+ \/|AURORA MUSE \d+ \/ /.test(m)));
  await page.evaluate(NORMAL);

  // ===== bought AURORA SWEEP =====
  await page.evaluate(FORCE(`x => x.bought === 'sweep' && x.bonus.gems >= 5 && x.bonus.spins.some(d => d.crossed.some(c => c.crossings >= 2)) && x.totalPayout > 20 && x.totalPayout < 800`, 8));
  await watchMsgs(); await page.evaluate(() => { window.__fsAll.length = 0; }); const bal1 = usd((await state()).bal); await buy(2);
  check('bought Sweep: trigger spin drops the gems, sockets fill', await waitCond(() => document.querySelectorAll('#aura .g.on').length >= 4, 30000)); await sleep(1000); await shot('14-trigger-spin-gems');
  check('bought: balance charged $57 (before the bonus pays)', Math.abs(bal1 - usd((await state()).bal) - 57) < .01, bal1 + ' -> ' + (await state()).bal);
  check('sweep intro appears', await waitFor('#introM')); await sleep(1400); await shot('15-intro-sweep');
  { const n = +(await txt('#introN')); check('intro: bands = min(8, gems), AURORA SWEEP ribbon, BANDS label', n >= 5 && n <= 8 && /AURORA SWEEP/.test(await txt('#introRibbon')) && /BANDS/.test(await txt('#introLbl')), String(n)); }
  await clk('#introM', { position: { x: 80, y: 80 } });
  check('sweep: ice sheet fades in over the board', await waitCond(() => document.getElementById('sweep').classList.contains('on') && getComputedStyle(document.getElementById('sweep')).opacity > .9, 15000)); await sleep(400); await shot('16-sheet');
  const sw = await runBonus('17sw');
  check('Sweep: bands swept (>= 5), ice melted', (await page.evaluate(() => window.__bands)) >= 5 && sw.melt >= 8, JSON.stringify({ melt: sw.melt }));
  check('Sweep: crossing chips (xN) seen when bands converge', sw.xm >= 1, String(sw.xm));
  check('Sweep: full reveal of the cells the bands missed', sw.miss >= 1 || sw.melt === 25, JSON.stringify({ miss: sw.miss, melt: sw.melt }));
  check('Sweep: counter counts bands down as a plain number', [...sw.fsVals].every(v => /^\d+$/.test(v)));
  check('Sweep: messages (band n of N, converge)', await sawMsg(/BAND 1 OF/) && await sawMsg(/CONVERGE/));
  check('sweep outro appears', await waitFor('#outroM', 120000)); await sleep(3500); await shot('18-outro-sweep'); await clk('#outroM', { position: { x: 60, y: 60 } });
  check('round settles after Sweep', await settle()); s = await state(); await shot('19-after-sweep');
  check('after Sweep: sheet gone, board back, counter hidden, no counter flash', !(await page.$eval('#sweep', e => e.classList.contains('on'))) && (await page.$$eval('#grid .cell', c => c.length)) > 10 && !s.fsBox && !(await page.evaluate(() => window.__fsAll)).some(t => /\/\s*\d+/.test(t)));
  await page.evaluate(NORMAL);

  // ante (Northern Lights) on / off
  { const b0 = (await state()).bal; await clk('#buyOpen'); await sleep(250); await clk('#ante'); await sleep(300); s = await state();
    check('ante on: buy screen closes, badge, bar shows total risk', !(await vis('#buyM')) && s.fever && s.hot && /LIGHTS/.test(await txt('#feverBadge')), JSON.stringify(s));
    await shot('20-ante-on'); const bA = usd((await state()).bal); await clk('#spin'); check('ante spin settles', await settle()); { const e = await state(); check('ante spin costs 2x (balance = before - 2 + win)', Math.abs(usd(e.bal) - (bA - 2 + usd(e.win))) < .01, bA + ' -> ' + e.bal + ' win ' + e.win); }
    await clk('#buyOpen'); await sleep(250); await clk('#ante'); await sleep(300); s = await state(); check('ante off: badge gone, bar normal', !s.fever && !s.hot, JSON.stringify(s)); }

  // gold MAX WIN screen at the 7,500x cap (mutated real sweep round)
  await page.evaluate(MUT(`x => x.bought === 'sweep' && x.bonus.spins.length >= 4`, 3, `x => { const sp = x.bonus.spins; const sum = sp.reduce((a, d) => a + d.totalPayout, 0); sp[sp.length - 1].totalPayout += 7500 - sum; x.bonus.totalPayout = 7500; x.totalPayout = 7500; x.capped = true; }`));
  await page.evaluate(() => { localStorage.setItem('arcticAuroraLodgeWallet', '9000'); });
  await page.reload(); await sleep(2500); await page.evaluate(MUT(`x => x.bought === 'sweep' && x.bonus.spins.length >= 4`, 3, `x => { const sp = x.bonus.spins; const sum = sp.reduce((a, d) => a + d.totalPayout, 0); sp[sp.length - 1].totalPayout += 7500 - sum; x.bonus.totalPayout = 7500; x.totalPayout = 7500; x.capped = true; }`));
  await buy(2); check('cap: intro appears', await waitFor('#introM', 120000)); await sleep(900); await clk('#introM', { position: { x: 80, y: 80 } });
  check('cap: outro appears', await waitFor('#outroM', 200000));
  let sawMax = false; for (let i = 0; i < 300 && !sawMax; i++) { if (await vis('#outroM')) { await sleep(700); await clk('#outroM', { position: { x: 60, y: 60 } }).catch(() => {}); } sawMax = await page.evaluate(() => document.getElementById('big').classList.contains('maxwin') && document.getElementById('big').classList.contains('show')); await sleep(100); }
  check('cap: gold MAX WIN screen shows', sawMax); await sleep(2200); await shot('21-max-win');
  check('cap round settles', await settle()); await page.evaluate(NORMAL);

  // autoplay
  await clk('#bAuto'); await sleep(250); check('autoplay dialog opens', await vis('#autoM')); await clk('#autoOpts .opt >> nth=0'); await clk('#autoGo');
  for (let i = 0; i < 900 && (await page.$eval('#spinCnt', e => e.textContent.trim())) !== '9'; i++) await sleep(100);
  s = await state(); check('autoplay: spin button is the counter square with spins left', s.spinCnt === '9', 'spinCnt=' + s.spinCnt);
  await clk('#spin'); await sleep(200); s = await state(); check('stop click clears the counter', s.spinCnt === null, s.msg);
  check('autoplay stops and round settles', await settle()); s = await state(); check('no stray counter', s.spinCnt === null);

  // mid-bonus turbo: click the stage while an Aurora Muse spin plays
  await page.evaluate(FORCE(`x => x.bought === 'fs' && x.bonus.spins.length >= 10 && x.totalPayout < 200`, 41));
  await buy(1); check('turbo run: intro', await waitFor('#introM', 120000)); await sleep(900); await clk('#introM', { position: { x: 80, y: 80 } });
  await waitCond(() => !document.getElementById('fsBox').hidden && document.querySelectorAll('#grid .cell').length > 10, 30000); await sleep(2500);
  const t0 = Date.now(); await page.mouse.click(300, 800); await sleep(300);
  check('tap speeds up this round only: no persistent turbo badge, stored turbo stays off', await page.evaluate(() => document.getElementById('turboBadge').hidden && !/true/.test(Object.keys(localStorage).filter(k => /_turbo$/.test(k)).map(k => localStorage[k]).join(','))));
  check('turbo bonus reaches the outro', await waitFor('#outroM', 120000), ((Date.now() - t0) / 1000).toFixed(0) + 's');
  check('turbo round settles', await settle()); await page.evaluate(NORMAL);

  console.log(errors.length ? '\nCONSOLE/PAGE ERRORS:\n' + errors.join('\n') : '\n  ok   0 console / page errors');
  check('0 console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
  console.log(fails.length ? `\nFAILED (${fails.length}):\n - ` + fails.join('\n - ') : '\nALL PASS'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
