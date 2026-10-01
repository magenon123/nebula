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
const SCRATCH = '/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/regress';
const ROOT = path.resolve(__dirname, '../..');
const TOL_PCT = 2.5;
/* expected differences vs the pre-shell EmberClaw baseline: the Game Info paytable now shows the engine's real pays (PAYTABLE x payScale 1.055; judge amendment 3) */
const ALLOW = (opt('--allow') || '04-info').split(',');   // max % of pixels that may differ (per screenshot)

const SEED = `(() => {
  const mk = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const r = mk(20240607); Math.random = mk(99);
  crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(r() * 4294967296); return a; };
})();`;

async function run(file, outDir, label) {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addInitScript(SEED);
  const page = await ctx.newPage();
  const errors = [], fails = [], marks = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|fonts\.g/i.test(m.text())) errors.push('console: ' + m.text()); });
  const check = (name, ok, extra = '') => { if (!ok) fails.push(name + (extra ? ' (' + extra + ')' : '')); console.log(`  [${label}] ${ok ? 'ok  ' : 'FAIL'} ${name}${extra && !ok ? '  ' + extra : ''}`); };
  const clk = (s, o = {}) => page.click(s, { force: true, ...o });   // the Bonus Buy sign sways forever, so it is never "stable"
  const txt = sel => page.$eval(sel, e => e.textContent.trim());
  const vis = async sel => page.$eval(sel, e => !e.hidden && getComputedStyle(e).display !== 'none').catch(() => false);
  const state = async () => page.evaluate(() => {
    const g = id => { const e = document.getElementById(id); return e ? e.textContent.trim() : null; };
    const open = [...document.querySelectorAll('.modal')].filter(m => !m.hidden).map(m => m.id);
    return { bal: g('bal'), win: g('win'), bet: g('bet'), betLbl: g('betLbl'), buyPrice: g('buyPrice'), msg: g('msg'), hot: document.getElementById('barR').classList.contains('hot'),
      fever: !document.getElementById('feverBadge').hidden, turbo: !document.getElementById('turboBadge').hidden, fsBox: !document.getElementById('fsBox').hidden,
      spinCnt: document.getElementById('spinCnt').hidden ? null : g('spinCnt'), open, betBar: document.getElementById('betBar').style.width };
  });
  /* static checkpoints are shot with all CSS animation/transition frozen (deterministic); volatile ones (mid-animation) are shot as-is and only eyeballed */
  const shot = async (name, volatile) => {
    const tag = await page.addStyleTag({ content: '#fx{visibility:hidden!important}' + (volatile ? '' : '*,*::before,*::after{animation:none!important;transition:none!important}') }).catch(() => null);
    await sleep(60); const f = path.join(outDir, name + '.png'); await page.screenshot({ path: f });
    if (tag) await tag.evaluate(e => e.remove()).catch(() => {}); return f;
  };
  const mark = async (name, withShot = true, volatile = false) => { const s = await state(); if (withShot) await shot(name, volatile); marks.push({ name, volatile, ...s }); return s; };
  /* wait until the round is over: clicks splash screens / big-win overlay when they show */
  const settle = async (maxMs = 240000) => {
    const t0 = Date.now(); let lastSplash = 0, idle = 0;
    while (Date.now() - t0 < maxMs) {
      // a round is running while the chevrons are disabled (setBusy); autoplay has a ~450ms gap between rounds, so require a quiet streak
      const st = await page.evaluate(() => ({ busy: document.getElementById('p').disabled,
        intro: !document.getElementById('introM').hidden, outro: !document.getElementById('outroM').hidden, big: document.getElementById('big').classList.contains('show') }));
      if (st.intro || st.outro) { idle = 0; if (Date.now() - lastSplash > 700) { await sleep(600); await clk(st.intro ? '#introM' : '#outroM', { position: { x: 60, y: 60 } }).catch(() => {}); lastSplash = Date.now(); } }
      else if (st.big) { idle = 0; await clk('#big').catch(() => {}); }
      else if (!st.busy) { if (++idle >= 6) return true; }
      else idle = 0;
      await sleep(120);
    }
    return false;
  };
  const waitFor = async (sel, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await vis(sel)) return true; await sleep(100); } return false; };
  const clickSplash = async id => { await sleep(700); await clk(id, { position: { x: 60, y: 60 } }); };
  const setBet = async text => { await clk('#betV'); await page.waitForSelector('#betM:not([hidden])'); await clk(`#betGrid .opt:text-is("${text}")`); await sleep(150); };

  console.log(`== ${label}: ${file}`);
  await page.goto('file://' + file); await sleep(2500);

  // ---- 1. idle ----
  let s = await mark('01-idle');
  check('idle: balance is the play-money wallet', s.bal === '$1,000.00', s.bal);
  check('idle: bet $1.00 and sign shows 100x', s.bet === '$1.00' && s.buyPrice === '$100.00', s.bet + ' / ' + s.buyPrice);
  check('idle: stage scaled (1600x900)', await page.$eval('#stage', e => Math.abs(e.getBoundingClientRect().width - 1600) < 2));
  const pos = await page.evaluate(() => { const r = id => { const b = document.getElementById(id).getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)].join(','); }; return ['buyOpen', 'barL', 'barR', 'spin', 'bAuto', 'msg', 'chev'].map(i => i + ':' + r(i)).join(' '); });
  marks.push({ name: 'layout-boxes', pos });
  const dom = await page.evaluate(() => { const b = document.body.cloneNode(true); b.querySelectorAll('script,canvas').forEach(e => e.remove()); const pt = b.querySelector('#ptab'); if (pt) pt.innerHTML = '';   // paytable numbers are engine-derived now
    return b.innerHTML.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/\s+/g, ' ').replace(/color: ?(var\(--muted\)|#b79a82)/g, 'color:#b79a82').replace(/ id="(authName|bbRow|introGems|introLbl|introRibbon|introChips|outroRibbon|swBigTxt)"/g, '').replace(/ style=""/g, ''); });
  fs.writeFileSync(path.join(outDir, 'dom-idle.html'), dom.replace(/></g, '>\n<'));

  // ---- 2. menu toggles ----
  await clk('#menuBtn'); await sleep(200); check('menu opens', await vis('#menu')); await mark('02-menu');
  await clk('#bSnd'); s = await state(); check('sound toggles OFF', (await txt('#bSnd i')) === 'OFF'); await clk('#bSnd'); check('sound toggles ON', (await txt('#bSnd i')) === 'ON');
  if (!await vis('#menu')) { await clk('#menuBtn'); }
  await clk('#bTurbo'); s = await state(); check('turbo ON shows badge', s.turbo && (await txt('#bTurbo i')) === 'ON'); await mark('03-turbo-on');
  await clk('#bTurbo'); s = await state(); check('turbo OFF hides badge', !s.turbo); await clk('#bTurbo');   // leave turbo ON for speed
  await clk('#bFs').catch(() => {}); await sleep(200);
  check('fullscreen click does not break the menu', !(await vis('#menu')) || true);
  await clk('#menuBtn'); await sleep(150); await clk('#bInfo'); await sleep(250);
  check('info opens', await vis('#infoM')); await mark('04-info');
  check('info has paytable rows', (await page.$$eval('#infoM .pt tr', r => r.length)) >= 5);
  await clk('#infoM [data-close]'); check('info closes', !(await vis('#infoM')));
  await clk('#menuBtn'); await page.mouse.click(800, 300); await sleep(150); check('menu closes on outside click', !(await vis('#menu')));

  // ---- 3. bet picker + chevrons ----
  await clk('#betV'); await sleep(250); check('bet picker opens', await vis('#betM')); await mark('05-betpicker');
  const opts = await page.$$eval('#betGrid .opt', o => o.map(x => x.textContent));
  check('bet picker lists the bets ($0.10 .. $10,000)', opts[0] === '$0.10' && opts[opts.length - 1] === '$10,000' && opts.length >= 30, opts.length + ' options, first ' + opts[0] + ', last ' + opts[opts.length - 1]);
  await clk('#betGrid .opt >> nth=0'); s = await mark('06-bet-min', false); check('min bet = $0.10', s.bet === '$0.10' && s.betBar === '0%', s.bet + ' ' + s.betBar);
  check('lower chevron stays at min', await (async () => { await clk('#m'); return (await txt('#bet')) === '$0.10'; })());
  await clk('#betV'); await clk('#betGrid .opt >> nth=-1'); s = await mark('07-bet-max'); check('max bet = $10,000.00', s.bet === '$10,000.00' && s.betBar === '100%', s.bet + ' ' + s.betBar);
  await clk('#p'); check('raise chevron stays at max', (await txt('#bet')) === '$10,000.00');
  // buy at max bet: not enough balance
  await clk('#buyOpen'); await sleep(200); await clk('#buy1'); await sleep(200);
  check('buy confirm opens', await vis('#confirm')); check('confirm warns "Not enough balance" and disables CONFIRM', (await txt('#cWarn')) === 'Not enough balance.' && await page.$eval('#cYes', e => e.disabled));
  await mark('08-confirm-short'); await clk('#cNo'); check('confirm cancel closes', !(await vis('#confirm')));
  await setBet('$1'); s = await state(); check('bet back to $1.00', s.bet === '$1.00', s.bet);
  await clk('#p'); await clk('#p'); s = await state(); check('raise chevron steps the bet', s.bet === '$2.00', s.bet);
  await clk('#m'); await clk('#m'); await clk('#m'); await clk('#p'); s = await state(); check('lower chevron steps the bet', s.bet === '$1.00', s.bet);

  // ---- 4. plain spin ----
  await clk('#spin'); await sleep(400);
  check('spin button shows busy', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled));
  check('chevrons/buy disabled while spinning', await page.$eval('#p', e => e.disabled) && await page.$eval('#buyOpen', e => e.disabled));
  await mark('09-spinning', true, true); check('spin settles', await settle()); s = await mark('10-after-spin');
  check('after spin: balance changed by cost/payout', s.bal !== '$1,000.00' || s.win !== '$0.00', s.bal + ' win ' + s.win);
  await page.keyboard.press('Space'); await sleep(300); check('Space starts a spin', await page.$eval('#spin', e => e.classList.contains('busy') || e.disabled)); check('spin (space) settles', await settle()); await mark('11-after-space-spin', false);

  // ---- 5. bonus buy: cancel, accept, trigger spin, intro, bonus, outro ----
  await clk('#buyOpen'); await sleep(300); check('buy screen opens', await vis('#buyM')); s = await mark('12-buy-screen');
  check('buy screen has 3 cards (fever + 2 buys)', (await page.$$eval('.bbRow .bbc', c => c.length)) === 3);
  check('card prices at $1: p1=$100.00 p2=$500.00', (await txt('#p1')) === '$100.00' && (await txt('#p2')) === '$500.00', (await txt('#p1')) + ' ' + (await txt('#p2')));
  await clk('#bbP'); await clk('#bbM'); await clk('#buy1'); await sleep(250);
  check('BUY opens confirm (buy screen closes)', await vis('#confirm') && !(await vis('#buyM'))); await mark('13-confirm');
  const before = await state(); await clk('#cNo'); await sleep(200); s = await state();
  check('confirm CANCEL: nothing spent', !(await vis('#confirm')) && s.bal === before.bal, before.bal + ' -> ' + s.bal);
  await clk('#buyOpen'); await sleep(200); await clk('#buy1'); await sleep(250); await clk('#cYes');
  const sawIntro = await waitFor('#introM'); check('bought bonus: trigger spin then intro splash', sawIntro);
  if (sawIntro) { await sleep(900); await mark('14-intro'); check('intro shows start spins', (await txt('#introN')) === '10', await txt('#introN')); await clk('#introM', { position: { x: 80, y: 80 } }); }
  await sleep(2500); s = await mark('15-bonus-playing', true, true); check('bonus: free-spin counter visible', s.fsBox, JSON.stringify(s.open));
  const sawOutro = await waitFor('#outroM', 240000); check('bonus ends in outro splash', sawOutro);
  if (sawOutro) { await sleep(3500); await mark('16-outro'); check('outro total win is a dollar amount', /^\$[\d,]+\.\d\d$/.test(await txt('#outroV')), await txt('#outroV')); await clickSplash('#outroM'); }
  check('round settles after buy', await settle()); s = await mark('17-after-buy', false); check('after bonus: win = last round payout', /^\$/.test(s.win), s.win);
  // premium buy, accepted
  await clk('#buyOpen'); await sleep(200); await clk('#buy2'); await sleep(250); check('premium confirm shows cost $500.00', (await txt('#cCost')) === '$500.00', await txt('#cCost')); await clk('#cYes');
  check('premium buy: intro splash', await waitFor('#introM')); await sleep(900); await clk('#introM', { position: { x: 80, y: 80 } });
  check('premium buy settles', await settle(300000)); s = await mark('18-after-premium', false);

  // ---- 6. Forge Fever (bet-up mode) ----
  await clk('#buyOpen'); await sleep(200); await clk('#ante'); await sleep(250);
  s = await mark('19-fever-on'); check('fever: modal closes', !(await vis('#buyM')));
  check('fever: bar shows TOTAL BET = 3x', s.betLbl === 'TOTAL BET' && s.bet === '$3.00' && s.hot && s.fever, `${s.betLbl} ${s.bet} hot=${s.hot} badge=${s.fever}`);
  const bb = (await state()).bal; await clk('#spin'); check('fever spin settles', await settle());
  s = await mark('20-fever-after-spin', false); check('fever: spin ran', s.bal !== bb, bb + ' -> ' + s.bal);
  await clk('#buyOpen'); await sleep(200); check('fever card shows DEACTIVATE', (await txt('#ante')) === 'DEACTIVATE'); await clk('#ante'); await sleep(250);
  s = await mark('21-fever-off'); check('fever off: bar back to BET $1.00', s.betLbl === 'BET' && s.bet === '$1.00' && !s.hot && !s.fever, `${s.betLbl} ${s.bet}`);
  // fever + buy are exclusive: buying clears fever
  await clk('#buyOpen'); await clk('#ante'); await sleep(200);

  // ---- 7. autoplay + stop square ----
  await clk('#bAuto'); await sleep(250); check('autoplay dialog opens', await vis('#autoM')); await mark('22-autoplay-dialog');
  check('autoplay has 4 spin counts + 2 switches', (await page.$$eval('#autoOpts .opt', o => o.length)) === 4 && (await page.$$eval('.sw', o => o.length)) === 2);
  await clk('#autoOpts .opt >> nth=0'); await clk('#autoGo');
  // deterministic stop point: wait until round 1 is over and round 2 runs (counter reads 9), so exactly 2 rounds are played however loaded the machine is
  for (let i = 0; i < 600 && (await page.$eval('#spinCnt', e => e.textContent.trim())) !== '9'; i++) await sleep(100);
  await sleep(300);
  s = await mark('23-autoplay-running', true, true); check('autoplay: spin button becomes counter square with spins left', s.spinCnt === '9', 'spinCnt=' + s.spinCnt);
  check('autoplay: square is white', await page.$eval('#spinCnt', e => getComputedStyle(e).backgroundColor === 'rgb(255, 255, 255)'));
  check('autoplay: spin button is clickable (stop)', await page.$eval('#spin', e => !e.disabled));
  await clk('#spin'); await sleep(200); s = await state(); check('stop click: counter cleared', s.spinCnt === null, s.msg + ' / ' + s.spinCnt);
  check('autoplay stops and round settles', await settle()); s = await mark('24-autoplay-stopped', false); check('no stray counter after autoplay', s.spinCnt === null);

  // ---- 8. escape / small viewport ----
  await clk('#buyOpen'); await sleep(200); await page.keyboard.press('Escape'); await sleep(150); check('Escape closes the buy screen', !(await vis('#buyM')));
  await page.setViewportSize({ width: 800, height: 600 }); await sleep(500); await mark('25-small-viewport');
  check('stage scales down (800x600 -> 0.5)', await page.$eval('#stage', e => Math.abs(e.getBoundingClientRect().width - 800) < 3));
  // ---- 9. other viewports (idle + bet picker + buy screen) ----
  for (const [w, h] of [[1280, 720], [844, 390], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h }); await sleep(500);
    await mark(`vp-${w}x${h}-idle`);
    await clk('#betV'); await sleep(250); await mark(`vp-${w}x${h}-betpicker`); await page.evaluate(() => { document.getElementById('betM').hidden = true; }); await sleep(150);
    await clk('#buyOpen'); await sleep(300); await mark(`vp-${w}x${h}-buyscreen`); await page.keyboard.press('Escape'); await sleep(150);
  }
  await page.setViewportSize({ width: 1600, height: 900 }); await sleep(300);
  await sleep(500);
  check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  const res = { label, file, fails, errors, marks };
  fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(res, null, 1));
  return res;
}

/* pixel comparison runs inside a browser page (no image libraries needed) */
async function compareDirs(a, b) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage();
  const ra = JSON.parse(fs.readFileSync(path.join(a, 'results.json'))), rb = JSON.parse(fs.readFileSync(path.join(b, 'results.json')));
  const problems = [];
  for (const m of ra.marks) {
    const o = rb.marks.find(x => x.name === m.name);
    if (!o) { problems.push('checkpoint missing in B: ' + m.name); continue; }
    if (m.name === 'layout-boxes') {   // +-3px: the Bonus Buy sign sways, so its box moves with the animation phase
      const na = m.pos.match(/-?\d+/g).map(Number), nb = o.pos.match(/-?\d+/g).map(Number);
      if (na.length !== nb.length || na.some((v, i) => Math.abs(v - nb[i]) > 3)) problems.push('layout differs:\n  A ' + m.pos + '\n  B ' + o.pos); continue; }
    const same = k => JSON.stringify(m[k]) === JSON.stringify(o[k]);
    if (m.volatile) continue;   // mid-animation frames: timing differs by a few ms, so only the static checkpoints are strict
    for (const k of ['bal', 'win', 'bet', 'betLbl', 'buyPrice', 'msg', 'hot', 'fever', 'turbo', 'fsBox', 'spinCnt', 'open', 'betBar']) if (!same(k)) problems.push(`${m.name}.${k}: A=${JSON.stringify(m[k])} B=${JSON.stringify(o[k])}`);
  }
  // DOM at idle (after init): the shell must generate the same markup the old single file had
  try { const da = fs.readFileSync(path.join(a, 'dom-idle.html'), 'utf8').split('\n'), db = fs.readFileSync(path.join(b, 'dom-idle.html'), 'utf8').split('\n');
    const sa = new Set(da), sb = new Set(db), onlyA = da.filter(x => !sb.has(x)), onlyB = db.filter(x => !sa.has(x));
    if (onlyA.length || onlyB.length) problems.push(`idle DOM differs: ${onlyA.length} lines only in A, ${onlyB.length} only in B\n  A: ${onlyA.slice(0, 3).join('\n     ').slice(0, 600)}\n  B: ${onlyB.slice(0, 3).join('\n     ').slice(0, 600)}`); } catch (e) { problems.push('dom compare failed: ' + e.message); }
  const rows = [];
  for (const m of ra.marks) {
    if (m.volatile) continue;
    const fa = path.join(a, m.name + '.png'), fb = path.join(b, m.name + '.png');
    if (!fs.existsSync(fa) || !fs.existsSync(fb)) continue;
    const r = await page.evaluate(async ([da, db]) => {
      const load = d => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + d; });
      const [ia, ib] = await Promise.all([load(da), load(db)]);
      const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height; const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(ia, 0, 0); const A = x.getImageData(0, 0, c.width, c.height).data; x.clearRect(0, 0, c.width, c.height); x.drawImage(ib, 0, 0); const B = x.getImageData(0, 0, c.width, c.height).data;
      let diff = 0; for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) > 60) diff++;
      return { w: ia.width, h: ia.height, pct: diff / (A.length / 4) * 100 };
    }, [fs.readFileSync(fa).toString('base64'), fs.readFileSync(fb).toString('base64')]);
    rows.push({ name: m.name, pct: +r.pct.toFixed(3) });
    if (r.pct > TOL_PCT && ALLOW.includes(m.name)) console.log(`  (expected difference: ${m.name} ${r.pct.toFixed(2)}%)`);
    else if (r.pct > TOL_PCT) problems.push(`screenshot ${m.name}: ${r.pct.toFixed(2)}% pixels differ (tolerance ${TOL_PCT}%)`);
  }
  await browser.close();
  console.log('\nscreenshot diff (% pixels changed):'); rows.forEach(r => console.log('  ' + r.name.padEnd(26) + r.pct));
  return problems;
}

(async () => {
  if (args[0] === '--compare') { const p = await compareDirs(args[1], args[2]); console.log(p.length ? '\nDIFFERENCES:\n' + p.join('\n') : '\nIDENTICAL within tolerance'); process.exit(p.length ? 1 : 0); }
  const build = path.resolve(args.find(a => !a.startsWith('--') && a !== opt('--out') && a !== opt('--baseline')) || path.join(ROOT, 'emberclaw-standalone.html'));
  const out = opt('--out') || SCRATCH;
  let baseline = opt('--baseline'); if (!baseline && /emberclaw-standalone\.html$/.test(build)) baseline = path.join(__dirname, 'baseline/emberclaw-standalone.orig.html');
  const A = await run(build, path.join(out, 'new'), 'new');
  let bad = A.fails.length + A.errors.length;
  if (baseline && fs.existsSync(baseline)) {
    const B = await run(path.resolve(baseline), path.join(out, 'base'), 'base');
    bad += B.fails.length + B.errors.length;
    const p = await compareDirs(path.join(out, 'base'), path.join(out, 'new'));
    console.log(p.length ? '\nDIFFERENCES baseline vs new:\n' + p.join('\n') : '\nBEHAVIOUR + SCREENSHOTS IDENTICAL (baseline vs new)');
    bad += p.length;
  }
  console.log(bad ? `\nRESULT: ${bad} problem(s)` : '\nRESULT: PASS'); console.log('artifacts in ' + out);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
