// shared helpers for the Sirocco's Lamp Bazaar art generators (leo)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let _s = 1;
const rnd = () => { _s = (_s * 16807) % 2147483647; return _s / 2147483647; };
const seed = n => { _s = n; };
const f = n => (Math.round(n * 10) / 10).toString();
const OL = '#2a1006', OLP = '#140a28';

// ---- shared material library (objectBoundingBox gradients, light from the RIGHT) ----
const lin = (id, stops, x1 = 0, y1 = 0, x2 = 1, y2 = 0) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`;
const rad = (id, stops, cx = .38, cy = .3, r = .8) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</radialGradient>`;
const MATS = [
  lin('mGold', [[0, '#5b2a12'], [.18, '#a8581a'], [.38, '#e79a2c'], [.58, '#ffd668'], [.74, '#f5b23a'], [.9, '#fff0a8'], [1, '#ffcb5a']]),
  lin('mGoldV', [[0, '#fff2b8'], [.22, '#f6c24a'], [.55, '#c97a1c'], [1, '#6a3410']], 0, 0, 0, 1),
  lin('mGoldS', [[0, '#7a3d14'], [.4, '#e79a2c'], [.7, '#ffe08a'], [1, '#d98a22']]),
  lin('mShadeV', [[0, '#fff2b8', .5], [.3, '#fff2b8', 0], [.7, '#3a1408', 0], [1, '#3a1408', .55]], 0, 0, 0, 1),
  lin('mShadeL', [[0, '#1a0830', .55], [.5, '#1a0830', .12], [1, '#1a0830', 0]]),
  lin('mCopper', [[0, '#3a1408'], [.2, '#8a3a14'], [.42, '#c8662a'], [.62, '#f4a062'], [.78, '#d97a3c'], [.92, '#ffd0a0'], [1, '#e08848']]),
  lin('mBrass', [[0, '#4a3010'], [.25, '#a67c2a'], [.5, '#e6c15a'], [.65, '#fff2b0'], [.85, '#c9a03c'], [1, '#fff0b0']]),
  lin('mSteel', [[0, '#2a3444'], [.25, '#6f86a0'], [.5, '#dfeaf5'], [.72, '#8fa4bb'], [.9, '#f8fcff'], [1, '#a8bbd0']]),
  lin('mSteelV', [[0, '#f8fcff'], [.3, '#b6c8dc'], [.6, '#6a809c'], [1, '#2a3444']], 0, 0, 0, 1),
  lin('mEbony', [[0, '#0e0710'], [.4, '#2e1c26'], [.75, '#5e3c42'], [1, '#b07a5e']]),
  lin('mPlum', [[0, '#2c0f4e'], [.4, '#6a2a8e'], [.8, '#b058b0'], [1, '#ff9aa8']]),
  lin('mSilk', [[0, '#3a0a24'], [.3, '#8e1535'], [.65, '#d03a52'], [.9, '#ff8a74'], [1, '#ffb08a']]),
  lin('mCeramic', [[0, '#7b8fc0'], [.3, '#dde8ff'], [.62, '#ffffff'], [.85, '#c4d4f0'], [1, '#ffffff']]),
  lin('mSand', [[0, '#8a4a1a'], [.5, '#f0a030'], [1, '#ffe08a']]),
  lin('mSkyGlass', [[0, '#ffffff', .75], [.35, '#ffffff', .1], [1, '#ffffff', 0]], 1, 0, 0, 1),
  rad('mLapis', [[0, '#7fe4ff'], [.35, '#1fa5b8'], [1, '#0a2f66']]),
  rad('mTurq', [[0, '#c8fff6'], [.3, '#3ad8c8'], [1, '#08585e']]),
  rad('mRuby', [[0, '#ffb0a8'], [.3, '#e0354f'], [1, '#4a0618']]),
  rad('mRubyD', [[0, '#ff9a9a'], [.16, '#e8244c'], [.6, '#9a0a30'], [1, '#34030f']], .36, .28, .72),
  rad('mEmerald', [[0, '#c8ffd0'], [.3, '#2ac870'], [1, '#064a2a']]),
  rad('mAmber', [[0, '#fff0b0'], [.3, '#f2a020'], [1, '#6a3004']]),
  rad('mAmeth', [[0, '#f0d0ff'], [.3, '#a05ae0'], [1, '#2a0a5a']]),
  rad('mShadow', [[0, '#05020c', .65], [.6, '#05020c', .3], [1, '#05020c', 0]], .5, .5, .5),
  rad('mGlowW', [[0, '#fff4c8', .95], [.4, '#ffd27a', .45], [1, '#ff9a3a', 0]], .5, .5, .5),
  rad('mGlowT', [[0, '#c8fffa', .9], [.4, '#3ad8e8', .45], [1, '#1f7ae8', 0]], .5, .5, .5),
  rad('mDate', [[0, '#c88a58'], [.35, '#6a3418'], [1, '#1c0a06']], .35, .3, .75),
  rad('mFig', [[0, '#d8a0d8'], [.35, '#7a2c6e'], [1, '#2a0a2a']], .35, .3, .75),
  lin('mSmoke', [[0, '#c8fffa'], [.5, '#4ab8e8'], [1, '#5a3fc8']], 0, 0, 1, 1),
  lin('mTeal', [[0, '#16406f'], [.3, '#1b78a0'], [.62, '#2fb0c6'], [.85, '#6fe2dc'], [1, '#b0fff0']]),
].join('');
const SHARED_DEFS = `<defs>${MATS}</defs>`;

const star4 = (x, y, s, fill = '#fff6c8', op = 1) => `<path d="M${f(x)} ${f(y - s)}l${f(s * .28)} ${f(s * .72)} ${f(s * .72)} ${f(s * .28)} ${f(-s * .72)} ${f(s * .28)} ${f(-s * .28)} ${f(s * .72)} ${f(-s * .28)} ${f(-s * .72)} ${f(-s * .72)} ${f(-s * .28)} ${f(s * .72)} ${f(-s * .28)}z" fill="${fill}" opacity="${op}"/>`;
const shadow = (cx = 64, cy = 114, rx = 40, ry = 6) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#mShadow)"/>`;
// cabochon gem with highlight
const cab = (x, y, rx, ry, mat, ol = OL, sw = 1) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#${mat})" stroke="${ol}" stroke-width="${sw}"/><ellipse cx="${f(x - rx * .32)}" cy="${f(y - ry * .38)}" rx="${f(rx * .32)}" ry="${f(ry * .24)}" fill="#fff" opacity=".85"/>`;

// win-motion bookkeeping: each symbol N registers animations a-NAME => keyframes syN_NAME, gated by --kN_NAME
class Sym {
  constructor(id, vb = '0 0 128 128') { this.id = id; this.n = id.replace(/^s/, ''); this.vb = vb; this.css = ''; this.vars = []; this.defs = ''; this.body = ''; }
  P(s) { return s.replace(/§/g, this.id); }
  // origin: fill-box origin e.g. '50% 100%'
  anim(name, origin, dur, ease, frames, delayExtra = 0) {
    const N = this.n; const v = `--k${N}_${name}`;
    const hid = /^(spk|steam|pour|glow|g\d|fx.*|hid.*)$/.test(name) ? 'opacity:0;' : '';
    this.css += `.sy${N} .a-${name}{${hid}transform-box:fill-box;transform-origin:${origin};animation:var(${v},none) calc(${dur}s*var(--spd,1)) ${ease || 'cubic-bezier(.3,.7,.3,1)'} calc(var(--delay,0ms) + ${delayExtra}ms) both}@keyframes sy${N}_${name}{${frames}}`;
    this.vars.push(`${v}:sy${N}_${name}`);
  }
  out() { return `<symbol id="${this.id}" viewBox="${this.vb}"><style>${this.css}</style><defs>${this.P(this.defs)}</defs><g class="sy${this.n}">${this.P(this.body)}</g></symbol>`; }
}

// ---- Playwright helpers ----
async function withBrowser(fn) {
  const { chromium } = require('/home/user/nebula/node_modules/playwright');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  try { return await fn(b); } finally { await b.close(); }
}
// render svg/html string to PNG buffer (transparent optional)
async function shot(b, html, w, h, omit = true, wait = 200) {
  const pg = await b.newPage({ viewport: { width: w, height: h } });
  await pg.setContent(html); await pg.waitForTimeout(wait);
  const png = await pg.screenshot({ omitBackground: omit }); await pg.close(); return png;
}
async function toWebp(b, png, w, h, q = .88) {
  const q2 = await b.newPage(); await q2.setContent('<canvas id=c></canvas>');
  const url = await q2.evaluate(async ([d, w, h, q]) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.getElementById('c'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/webp', q); }, [png.toString('base64'), w, h, q]);
  await q2.close(); return Buffer.from(url.split(',')[1], 'base64');
}
const b64 = buf => buf.toString('base64');
module.exports = { fs, path, ROOT, rnd, seed, f, OL, OLP, MATS, SHARED_DEFS, lin, rad, star4, shadow, cab, Sym, withBrowser, shot, toWebp, b64 };
