/* QA helpers for Cloudtop Tea House (rin). Shared by qa-*.cjs. Play-money standalone build only. */
const path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FILE = path.resolve(__dirname, '../../../../cloudtop-tea-house-standalone.html');
const FORCE = (pred, tag) => `(() => { const o = window.__origPR || (window.__origPR = SLOT_ENGINE.playRound); let s = ${tag}; const rg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  SLOT_ENGINE.playRound = (r, a) => { for (let i = 0; i < 400000; i++) { const x = o(rg, a); if ((${pred})(x)) return x; } return o(r, a); }; })();`;
const NORMAL = `if (window.__origPR) SLOT_ENGINE.playRound = window.__origPR;`;
async function open(vp, opts = {}) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, isMobile: !!opts.mobile, hasTouch: !!opts.mobile, deviceScaleFactor: opts.dpr || 1 });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|fonts\.g/i.test(m.text())) errors.push('console: ' + m.text()); });
  await page.goto('file://' + FILE + (opts.query || '')); await sleep(opts.wait || 2500);
  return { browser, ctx, page, errors };
}
const vis = (page, sel) => page.$eval(sel, e => !e.hidden && getComputedStyle(e).display !== 'none').catch(() => false);
async function settle(page, maxMs = 300000) { const t0 = Date.now(); let idle = 0, last = 0;
  while (Date.now() - t0 < maxMs) {
    const st = await page.evaluate(() => ({ busy: document.getElementById('p').disabled, intro: !document.getElementById('introM').hidden, outro: !document.getElementById('outroM').hidden, big: document.getElementById('big').classList.contains('show') }));
    if (st.intro || st.outro) { idle = 0; if (Date.now() - last > 700) { await sleep(600); await page.click(st.intro ? '#introM' : '#outroM', { force: true, position: { x: 60, y: 60 } }).catch(() => {}); last = Date.now(); } }
    else if (st.big) { idle = 0; await page.click('#big', { force: true }).catch(() => {}); }
    else if (!st.busy) { if (++idle >= 6) return true; } else idle = 0;
    await sleep(120); }
  return false; }
module.exports = { sleep, FILE, FORCE, NORMAL, open, vis, settle, chromium };
