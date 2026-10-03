/* Arctic Aurora Lodge: Trapper's Night. The only slot-specific client logic; the shell (shell/slot-shell.js) calls these hooks.
 * Pure renderer: the engine/server returns the whole round (grid, giant blocks, wins with cells, Aurora Muse spins, Aurora Sweep bands); nothing here computes an outcome.
 * Round payload: plans/arctic-aurora-lodge-round-format.md. Art geometry: slots/arctic-aurora-lodge/ART-NOTES.md.
 * Engine ids: 0-7 pay, 8 Aurora Gem (art symbol s11), 9 wild orb, 10 FS scatter. Blocks are drawn as ONE symbol (b2_N / b3_N); the cells under them are not rendered. */
SlotShell.boot(SLOT_CFG, S => {
const { $, sfx, wait, T, say, shake, flash, embers, char, pop, fmt } = S;
const ROWS = 5, COLS = 6, WILD = 9, GEM = 8, FSC = 10, CW = 104, MAXW = S.cfg.maxWin, INFO = S.cfg.engineData.info;
const FX = S.fx, GRID = $('grid');
const NAMES = ['Antler Knife', 'Iron Kettle', 'Wool Mittens', 'Snow Goggles', 'Brass Compass', 'Hurricane Lantern', 'Silver Fox', 'Snowy Owl'];
const art = s => (s === GEM ? 11 : s);                   // engine id -> art symbol id
const ICE = ['#f2fdff', '#bfe8ff', '#7fc4f0', '#5b84d6'], GLOW = ['#7dffc4', '#4dffb0', '#b6ffe6', '#8a5cff'];
let lastGrid = null, lastBlocks = [], inBonus = false, bType = null, bonusR = null, bonusOpened = false, bonusSuper = false, fsTotal = 10;
const el = {};                                          // cell key r*COLS+c -> element covering it
const after = (ms, fn) => setTimeout(fn, ms * T());
const ctr = e => [(e._c + e._s / 2) * CW, (e._r + e._s / 2) * CW];          // centre in #fxl coordinates
const scrC = e => { const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };
const fxl = () => $('fxl');
const uniq = list => { const s = new Set(); list.forEach(([r, c]) => { const e = el[r * COLS + c]; if (e) s.add(e); }); return [...s]; };
const allEls = () => [...new Set(Object.values(el))];
const cntTxt = n => String(n);

/* ---------- MUSIC: "polar night" (base, 64 bpm, D Dorian), "aurora muse" (free spins, 84 bpm), "the sweep" (72 bpm, builds with each band) ---------- */
function musicDefs() {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ROOT = [38, 43, 41, 36], CH = [[50, 57, 62, 65], [55, 59, 62, 69], [53, 57, 60, 64], [48, 55, 60, 64]];   // Dm  G  F  C (Dorian colours)
  const AR = [[0, 2, 4, 2], [1, 3, 5, 3], [2, 4, 6, 4], [0, 4, 2, 4]];
  const polar = {
    tempo: 64, barBeats: 4, spb: 8, swing: 0, bars: 16, key: 62, scale: [0, 2, 3, 5, 7, 9, 10], seed: 17, gain: .9, phrase: 8,
    layers: { drone: { gain: 1, wet: .3 }, pad: { enter: 1, gain: 1, wet: .5 }, arp: { enter: 2, gain: 1, wet: .6 }, bell: { enter: 4, gain: 1, wet: .6 }, wind: { gain: 1, wet: .4 }, hi: { int: .35, gain: 1, wet: .6 }, sub: { int: .5, gain: 1, wet: .1 } },
    bar(M) {
      const k = M.i & 7, ph = k >> 1, a = AR[ph & 3], wk = clamp(M.walk, -1, 1);
      if (k % 2 === 0) { M.pad('drone', M.t0, M.bd * 2, [ROOT[ph], ROOT[ph] + 7], { wave: 'sawtooth', cut: 210, q: .5, a: 2, r: 2.2, g: .05, det: 5 }); M.pad('pad', M.t0, M.bd * 2, CH[ph], { wave: 'triangle', cut: 1500, q: .3, a: 2.2, r: 2.4, g: .07, det: 11 }); }
      if (k % 2 === 0) M.riser('wind', M.t0, M.bd * 2, { g: .022 + (M.int * .02), f1: 220, f2: 1100 + M.int * 900 });
      for (let s = 0; s < 8; s++) { if (s % 2 === 1 && M.rnd() < .5) continue; const deg = a[(s >> 1) % 4] + (s >= 4 ? wk : 0); M.metal('arp', M.st(s), M.mtof(M.note(deg, 1)), 2.2, s % 4 === 0 ? .034 : .02, [1, 2.003]); }
      if (k % 4 === 1) M.metal('bell', M.st(5), M.mtof(M.note(a[2] + 7, 2)), 2.6, .03, [1, 2.4, 4.1]);
      if (k % 4 === 3) { M.metal('bell', M.st(2), M.mtof(M.note(a[0] + 9, 2)), 2.2, .026, [1, 2.4, 4.1]); M.shaker('bell', M.st(6), .5); }
      if (M.int > .35) [0, 2, 4, 6].forEach(s => M.metal('hi', M.st(s) + .012, M.mtof(M.note(a[s >> 1] + 7, 2)), 1.4, .016, [1, 2.003]));
      if (M.int > .5) [0, 4].forEach(s => M.sub('sub', M.st(s), M.bd * .45, ROOT[ph] - 12 + 12, { g: .1 }));
    }
  };
  /* Aurora Muse: 84 bpm, pulsing sub, kalimba plucks, wind swells; layers open with the game intensity */
  const muse = {
    tempo: 84, barBeats: 4, spb: 8, swing: 0, bars: 16, key: 62, scale: [0, 2, 3, 5, 7, 9, 10], seed: 41, gain: .85, phrase: 4,
    layers: { drone: { gain: 1, wet: .25 }, pad: { gain: 1, wet: .5 }, sub: { gain: 1, wet: .08 }, kal: { gain: 1, wet: .5 }, arp: { int: .15, gain: 1, wet: .6 }, wind: { gain: 1, wet: .4 }, hi: { int: .5, gain: 1, wet: .5 }, hit: { int: .72, gain: 1, wet: .2 } },
    bar(M) {
      const k = M.i & 7, ph = k >> 1, a = AR[(M.i >> 1) & 3], wk = clamp(M.walk, -1, 1), I = M.int;
      if (k % 2 === 0) { M.pad('drone', M.t0, M.bd * 2, [ROOT[ph], ROOT[ph] + 7], { wave: 'sawtooth', cut: 260 + I * 220, q: .5, a: 1.2, r: 1.5, g: .055, det: 6 }); M.pad('pad', M.t0, M.bd * 2, CH[ph], { wave: 'triangle', cut: 1700 + I * 800, q: .3, a: 1.4, r: 1.8, g: .065, det: 10 }); M.riser('wind', M.t0, M.bd * 2, { g: .03, f1: 260, f2: 1800 }); }
      [0, 3, 4, 7].forEach(s => M.sub('sub', M.st(s), M.bd * .12, ROOT[ph], { g: .12 }));
      for (let s = 0; s < 8; s++) M.koto('kal', M.st(s), M.note(a[s % 4] + (s > 3 ? wk : 0) + (s % 8 > 5 ? 2 : 0), 1), { g: s % 4 === 0 ? .06 : .036, d: .4 });
      if (I > .15) for (let s = 0; s < 8; s++) M.metal('arp', M.st(s) + .02, M.mtof(M.note(a[(s + 1) % 4] + 2, 2)), 1.6, .018, [1, 2.003]);
      if (I > .5) [0, 2, 4, 6].forEach(s => M.metal('hi', M.st(s), M.mtof(M.note(a[s >> 1] + 7, 2)), 1.3, .018, [1, 2.4]));
      if (I > .72 && k % 4 === 3) [4, 5, 6, 7].forEach((s, j) => M.taiko('hit', M.st(s), .5 + j * .12, { f0: 120 + j * 10, f1: 55, d: .3, g: .26 }));
    }
  };
  /* Aurora Sweep: 72 bpm, slow glassy build; every band opens another layer (intensity is set from the band index) */
  const sweep = {
    tempo: 72, barBeats: 4, spb: 8, swing: 0, bars: 16, key: 62, scale: [0, 2, 3, 5, 7, 9, 10], seed: 63, gain: .85, phrase: 4,
    layers: { drone: { gain: 1, wet: .3 }, pad: { gain: 1, wet: .55 }, arp: { gain: 1, wet: .6 }, tick: { int: .2, gain: 1, wet: .3 }, wind: { int: .1, gain: 1, wet: .4 }, hi: { int: .4, gain: 1, wet: .6 }, sub: { int: .55, gain: 1, wet: .1 }, hit: { int: .8, gain: 1, wet: .2 } },
    bar(M) {
      const k = M.i & 7, ph = k >> 1, a = AR[(M.i >> 1) & 3], I = M.int, wk = clamp(M.walk, -1, 1);
      if (k % 2 === 0) { M.pad('drone', M.t0, M.bd * 2, [ROOT[ph], ROOT[ph] + 7], { wave: 'sawtooth', cut: 220 + I * 260, q: .5, a: 1.8, r: 2, g: .05, det: 5 }); M.pad('pad', M.t0, M.bd * 2, CH[ph], { wave: 'triangle', cut: 1500 + I * 1000, q: .3, a: 1.8, r: 2.2, g: .07, det: 12 }); M.riser('wind', M.t0, M.bd * 2, { g: .02 + I * .03, f1: 200, f2: 1200 + I * 2400 }); }
      for (let s = 0; s < 8; s++) M.metal('arp', M.st(s), M.mtof(M.note(a[s % 4] + (s > 3 ? 2 : 0) + wk + Math.round(I * 2), 1 + (s > 5 ? 1 : 0))), 2, s % 4 === 0 ? .034 : .02, [1, 2.003]);
      if (I > .2) [1, 3, 5, 7].forEach(s => M.metal('tick', M.st(s), 2600, .35, .012, [1, 1.51]));
      if (I > .4) [0, 2, 4, 6].forEach(s => M.metal('hi', M.st(s) + .01, M.mtof(M.note(a[s >> 1] + 7, 2)), 1.4, .02, [1, 2.4]));
      if (I > .55) [0, 3, 4, 7].forEach(s => M.sub('sub', M.st(s), M.bd * .12, ROOT[ph], { g: .12 }));
      if (I > .8 && k % 2 === 1) [4, 5, 6, 7].forEach((s, j) => M.taiko('hit', M.st(s), .5 + j * .12, { f0: 110 + j * 12, f1: 52, d: .3, g: .28 }));
    }
  };
  const stingers = {
    win(K) { const { V, dest, t } = K; [0, 2, 4, 6].forEach((d, i) => V.metal(dest, t + i * .09, K.mtof(K.note(d, 2)), 1.6, .05, [1, 2.003])); },
    bonus(K) { const { V, dest, t } = K; V.sub(dest, t, 1.4, 38, { g: .3 }); [0, 1, 2, 3, 4, 5, 6, 7, 9].forEach((d, i) => V.metal(dest, t + .15 + i * .09, K.mtof(K.note(d, 1)), 2, .05, [1, 2.003])); V.pad(dest, t, 2.6, [50, 57, 62, 69], { wave: 'triangle', cut: 2200, a: .8, r: 1.6, g: .1, det: 10 }); },
    outro(K) { const { V, dest, t } = K; [6, 4, 2, 0].forEach((d, i) => V.metal(dest, t + i * .26, K.mtof(K.note(d, 1)), 2.6, .05, [1, 2.003])); },
    lit(K) { const { V, dest, t } = K; V.riser(dest, t, 1.1, { g: .06, f1: 300, f2: 3600 }); [0, 2, 4, 7].forEach((d, i) => V.metal(dest, t + .7 + i * .08, K.mtof(K.note(d, 2)), 2, .045, [1, 2.003])); },
    retrig(K) { const { V, dest, t } = K; V.sub(dest, t, .8, 38, { g: .3 }); [0, 2, 3, 4, 5, 7, 9].forEach((d, i) => V.metal(dest, t + .1 + i * .06, K.mtof(K.note(d, 1)), 1.6, .05, [1, 2.003])); },
    conv(K) { const { V, dest, t } = K; V.sub(dest, t, .7, 38, { g: .32 }); [0, 4, 7, 9].forEach((d, i) => V.metal(dest, t + i * .06, K.mtof(K.note(d, 1)), 2.2, .06, [1, 2.4, 4.1])); }
  };
  return { base: polar, muse, sweep, get bonus() { return bType === 'sweep' ? sweep : muse; }, stingers };
}

/* ---------- the board: 6 reels x 5 rows with giant 2x2 / 3x3 ice blocks drawn as ONE symbol ---------- */
function mkCell(sym, r, c, size) {
  const d = document.createElement('div'); d.className = 'cell' + (size > 1 ? ' b' + size : '');
  d.style.gridColumn = `${c + 1} / span ${size}`; d.style.gridRow = `${r + 1} / span ${size}`;
  d.innerHTML = `<svg class="g"><use href="#${size > 1 ? `b${size}_${sym}` : 's' + art(sym)}"/></svg>`;
  d._r = r; d._c = c; d._s = size; d._sym = sym; return d;
}
function paint(grid, blocks) {
  lastGrid = grid; lastBlocks = blocks || []; GRID.replaceChildren(); Object.keys(el).forEach(k => delete el[k]); GRID.classList.remove('focus');
  const cov = new Set(), frag = document.createDocumentFragment();
  lastBlocks.forEach(b => { const d = mkCell(b.sym, b.r, b.c, b.size); frag.append(d); d._id = b.id; for (let i = 0; i < b.size; i++) for (let j = 0; j < b.size; j++) { cov.add((b.r + i) * COLS + b.c + j); el[(b.r + i) * COLS + b.c + j] = d; } });
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { if (cov.has(r * COLS + c)) continue; const d = mkCell(grid[r][c], r, c, 1); frag.append(d); el[r * COLS + c] = d; }
  GRID.append(frag); clearOverlays();
}
function clearOverlays() { fxl().querySelectorAll('.arSweepL,.arOrb').forEach(e => e.remove()); }
const dropOpt = (e, base) => ({ delay: base + Math.random() * 14 + (ROWS - 1 - (e._r + e._s - 1)) * 34, dist: (e._r + e._s) * CW + 60, tilt: e._s > 1 ? 0 : (Math.random() - .5) * 5, dur: e._s === 3 ? 760 : e._s === 2 ? 680 : 560 });
/* reel by reel; once two FS (one short of Free Spins) or three Aurora Gems (one short of the Sweep) have landed, the remaining reels hang a beat with a heartbeat before each lands */
function dropReels(grid) {
  const els = allEls(), byCol = Array.from({ length: COLS }, () => []); els.forEach(e => byCol[e._c].push(e));
  let base = 0, end = 0, tease = false, seenF = 0, seenG = 0, said = false; const times = new Map();
  for (let c = 0; c < COLS; c++) {
    if ((seenF === 2 || seenG === 3) && c < COLS) { tease = true; base += 560; const b0 = base + c * 92; after(b0 - 500, () => { sfx.beat(); if (!said) { said = true; say(seenG === 3 ? 'ONE MORE GEM...' : 'ONE MORE EMBER...', true); } shake(.3); }); }
    byCol[c].forEach(e => { const o = dropOpt(e, base + c * 92); FX.drop(e, o); const t = o.delay + o.dur * .58; times.set(e, t); end = Math.max(end, t);
      if (e._s > 1) after(t, () => { sfx.thud(e._s); shake(e._s === 3 ? 1 : .45); const [x, y] = scrC(e); S.shards(x, y + e.offsetHeight * .35, e._s === 3 ? 14 : 8, ICE, { power: e._s === 3 ? .8 : .5, edge: 'rgba(10,30,70,.5)' }); }); });
    const lc = base + c * 92 + 380; after(lc, () => sfx.land(c));
    for (let r = 0; r < ROWS; r++) { if (grid[r][c] === FSC) seenF++; else if (grid[r][c] === GEM) seenG++; }
  }
  return { end, tease, times };
}
async function dropOut() {
  GRID.classList.remove('focus'); let end = 0;
  allEls().forEach(e => { const o = { delay: e._c * 46 + (ROWS - 1 - e._r) * 24, dist: (ROWS - e._r) * CW + 90, rot: (e._c % 2 ? 1 : -1) * (2 + e._c % 3), dur: 420 }; FX.out(e, o); end = Math.max(end, o.delay + o.dur); });
  await wait(end * .86);
}
function ring(e, ms = 650) { e.classList.remove('pulse'); void e.offsetWidth; e.classList.add('pulse'); setTimeout(() => e.classList.remove('pulse'), ms * T()); }
function dust(e, n = 8, power = .6, cols = ICE) { const [x, y] = scrC(e); S.shards(x, y, n, cols, { power, edge: 'rgba(10,30,70,.5)' }); }
function restAll() { allEls().forEach(e => { FX.rest(e); e.querySelectorAll('.rg').forEach(x => x.remove()); }); }
function setFs(n, bump) { const e = $('fs'); e.textContent = n; if (bump) e.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.8) rotate(-6deg)', offset: .3 }, { transform: 'scale(.92)', offset: .65 }, { transform: 'scale(1)' }], { duration: 620 * T(), easing: 'ease-out' }); }
function banner(title, sub, ms = 1500, big) {
  const b = $('arBanner'); b.querySelector('b').textContent = title; b.querySelector('small').textContent = sub || ''; b.classList.toggle('big', !!big);
  b.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.4)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.1)', offset: .16 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .26 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.02)', offset: .84 }, { opacity: 0, transform: 'translate(-50%,-62%) scale(.96)' }], { duration: ms * T(), easing: 'ease-out' });
}
async function fly(from, to, text, delay) {
  const e = document.createElement('div'); e.className = 'arFly'; e.textContent = text; e.style.left = from[0] + 'px'; e.style.top = from[1] + 'px'; fxl().append(e);
  const a = e.animate([{ transform: 'translate(-50%,-50%) scale(1.2)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 1, offset: .15 }, { transform: `translate(calc(-50% + ${to[0] - from[0]}px),calc(-50% + ${to[1] - from[1]}px)) scale(.5)`, opacity: .9 }], { duration: 400 * T(), delay: delay * T(), easing: 'cubic-bezier(.5,0,.8,.5)', fill: 'both' });
  await a.finished.catch(() => {}); e.remove();
}
const toLocal = (x, y) => { const b = fxl().getBoundingClientRect(), k = b.width / 624; return [(x - b.left) / k, (y - b.top) / k]; };

/* ---------- aurora meter (#aura): gem sockets (base) / the lit symbol (Aurora Muse) ---------- */
function auraReset() { const a = $('aura'); a.classList.remove('fs'); a.querySelectorAll('.g').forEach(g => g.classList.remove('on')); a.querySelector('.litSym').innerHTML = ''; }
function auraGem(k) { const g = $('aura').querySelector('.g' + (k + 1)); if (g) g.classList.add('on'); }
function setLit(sym) {
  const a = $('aura'), bx = a.querySelector('.litBox'); a.classList.add('fs'); a.querySelector('.litSym').innerHTML = `<use href="#s${sym}"/>`;
  bx.classList.remove('lp'); void bx.offsetWidth; bx.classList.add('lp');
}
function markLit(sym) {
  allEls().forEach(e => { if (e._sym !== sym || e._sym === WILD) return; e.classList.add('lit'); e.insertAdjacentHTML('beforeend', '<i class="lt"></i>' + (e._s > 1 ? '<span class="ax">x2</span>' : '')); });
}

/* ---------- win presentation: no lines. Glow rings + a sweep of aurora light, wilds fly to their symbol, each winner plays its own motion ---------- */
function lightSweep(delay = 0) {
  const l = document.createElement('div'); l.className = 'arSweepL'; fxl().append(l);
  l.animate([{ transform: 'translateX(-60%) skewX(-18deg)', opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .8 }, { transform: 'translateX(780px) skewX(-18deg)', opacity: 0 }], { duration: 950 * T(), delay: delay * T(), easing: 'ease-in-out', fill: 'both' }).finished.then(() => l.remove(), () => l.remove());
}
async function flyOrb(we, target, delay) {
  const a = ctr(we), b = ctr(target), o = document.createElement('div'); o.className = 'arOrb'; o.innerHTML = '<svg viewBox="0 0 128 128"><use href="#s9"/></svg>'; o.style.left = (a[0] - 52) + 'px'; o.style.top = (a[1] - 52) + 'px'; fxl().append(o);
  we.querySelector('svg.g').style.opacity = .25;
  after(delay, () => sfx.wildFly());
  const an = o.animate([{ transform: 'translate(0,0) scale(1) rotate(0)', opacity: 0 }, { transform: 'scale(1.35) rotate(40deg)', opacity: 1, offset: .15 }, { transform: `translate(${(b[0] - a[0]) * .55}px,${(b[1] - a[1]) * .55 - 28}px) scale(1.1) rotate(200deg)`, opacity: 1, offset: .6 }, { transform: `translate(${b[0] - a[0]}px,${b[1] - a[1]}px) scale(.55) rotate(340deg)`, opacity: .8, offset: 1 }], { duration: 480 * T(), delay: delay * T(), easing: 'cubic-bezier(.4,0,.5,1)', fill: 'both' });
  await an.finished.catch(() => {}); o.remove(); we.querySelector('svg.g').style.opacity = ''; dust(target, 6, .5, GLOW);
}
async function evalWins(wins, ctx, run, ceil) {
  const stake = ctx.stake, n = wins.length, per = n > 3 ? 700 : 1150, cap = MAXW * stake; GRID.classList.add('focus'); char('win', 1500 * T());
  for (let i = 0; i < n; i++) {
    const w = wins[i], E = uniq(w.cells), money = w.payout * stake, big = E.reduce((a, e) => !a || e._s > a._s ? e : a, null);
    const target = E.filter(e => e._sym !== WILD).sort((a, b) => b._s - a._s)[0] || E[0], wl = uniq(w.wilds || []);
    if (i > 0) { restAll(); }
    lightSweep(); sfx.win(Math.min(7, w.tier + 1 + (i ? 1 : 0)));
    E.forEach((e, j) => { if (wl.includes(e) && e !== target) return; e.insertAdjacentHTML('beforeend', '<i class="rg"></i>'); FX.act(e, 60 + j * 38, e._c); if (e._s > 1) { after(160, () => { sfx.crack(); dust(e, e._s === 3 ? 12 : 7, .7); }); } });
    const flights = wl.filter(e => e !== target).map((we, j) => flyOrb(we, target, 40 + j * 110).then(() => { we.insertAdjacentHTML('beforeend', '<i class="rg"></i>'); FX.act(we, 0, we._c); }));
    await Promise.all(flights);
    await wait(per * .22);
    const [x, y] = scrC(big || E[0]); pop(x, y - 20, '+' + fmt(money)); say(`${w.lit ? 'LIT ' : ''}${NAMES[w.sym] || ''} +${fmt(money)}`.toUpperCase(), true);
    const to = Math.min(run + money, ceil == null ? cap : Math.min(cap, ceil)); await S.countUp($('win'), to, 520 * T() + 120, run); ctx.onWin(run, to); run = to;
    await wait(per * .5);
  }
  await wait(280); GRID.classList.remove('focus'); restAll(); return run;
}

/* ---------- base spin ---------- */
const cellsOf = (grid, id) => { const o = []; grid.forEach((row, r) => row.forEach((s, c) => { if (s === id) o.push([r, c]); })); return o; };
function landMarks(grid, dt) {
  const f = (cells, fn) => cells.map(([r, c]) => [dt.times.get(el[r * COLS + c]), r, c]).sort((a, b) => a[0] - b[0]).forEach(([t, r, c], i) => after(t, () => fn(i, r, c)));
  f(cellsOf(grid, FSC), (i, r, c) => { sfx.fsLand(i); ring(el[r * COLS + c]); });
  f(cellsOf(grid, GEM), (i, r, c) => { sfx.gemLand(i); ring(el[r * COLS + c]); auraGem(i); });
}
async function dropBoard(grid, blocks) {
  paint(grid, blocks); sfx.drop(); const dt = dropReels(grid); landMarks(grid, dt);
  if (dt.tease) after(Math.max(300, dt.end - 1500), () => { const ch = $('char'); ch.classList.remove(...S.cfg.char.states); void ch.offsetWidth; ch.classList.add('tease'); });
  await wait(dt.end + 260);
  if (dt.tease) {
    const nF = cellsOf(grid, FSC).length, nG = cellsOf(grid, GEM).length, ch = $('char'), hit = nF >= 3 || nG >= 4; ch.classList.add(hit ? 'exhale' : 'slump'); setTimeout(() => ch.classList.remove('tease', 'exhale', 'slump'), 750 * T());
    if (!hit && nG === 3) { say('ALMOST... JUST ONE MORE GEM', true); await wait(650); } else if (!hit && nF === 2) { say('ALMOST... JUST ONE MORE EMBER', true); await wait(650); }
  }
}
async function baseSpin(sp, run, ctx) {
  char('spin', 950 * T()); await dropBoard(sp.grid, sp.blocks);
  const st = sp.step;
  if (st && st.wins.length) run = await evalWins(st.wins, ctx, run, run + st.payout * ctx.stake);
  return run;
}
async function showTrigger(R) {
  bonusR = R; bType = R.bonusType; const bo = R.bonus; bonusSuper = bType === 'fs' ? bo.scatters >= 4 : bo.gems >= 6; setupSplash();
  const tr = R.trigger ? R.trigger.cells : bType === 'fs' ? R.scatters.fs.cells : R.scatters.gems.cells, list = tr.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  restAll(); GRID.classList.add('focus');
  list.forEach(([r, c], i) => { const e = el[r * COLS + c]; if (!e) return; FX.act(e, i * 130, c); after(i * 130, () => { bType === 'fs' ? sfx.fsLand(i) : sfx.gemLand(i); ring(e, 500); dust(e, 8, .7, bType === 'fs' ? ['#ffd9a0', '#ff8a3c', '#fff1c8'] : GLOW); }); if (bType === 'sweep') auraGem(i); });
  say(bType === 'fs' ? `${list.length} FS! AURORA MUSE` : `${list.length} AURORA GEMS! THE ICE FREEZES`, true); char('special', 1100 * T());
  if (bType === 'sweep') after(list.length * 130 + 150, () => { const f = document.createElement('div'); f.className = 'arFrost'; fxl().append(f); f.animate([{ opacity: 0 }, { opacity: .8 }], { duration: 700 * T(), fill: 'forwards' }); sfx.freeze(); });
  await wait(list.length * 130 + (bType === 'sweep' ? 1100 : 1000)); fxl().querySelectorAll('.arFrost').forEach(f => f.remove());
}

/* ---------- Free Spins: Aurora Muse ---------- */
async function fsSpin(sp, run0, ctx) {
  const stake = ctx.stake, dec = sp.spinsLeft - (sp.retrigger || 0), cap = MAXW * stake; let run = run0;
  setFs(dec, true); char('spin', 950 * T());
  /* announce the lit symbol BEFORE the grid drops */
  setLit(sp.lit); sfx.lit(); S.music.stinger('lit'); say(`THE AURORA LIGHTS THE ${NAMES[sp.lit].toUpperCase()}`, true); $('scene').classList.add('litFlare');
  banner('LIT: ' + NAMES[sp.lit].toUpperCase(), 'WINS FROM 5 TILES  -  BLOCKS COUNT DOUBLE', 1500);
  await wait(1250); $('scene').classList.remove('litFlare');
  paint(sp.grid, sp.blocks); markLit(sp.lit); sfx.drop(); const dt = dropReels(sp.grid); landMarks(sp.grid, dt);
  if (dt.tease) after(Math.max(300, dt.end - 1500), () => { const ch = $('char'); ch.classList.remove(...S.cfg.char.states); void ch.offsetWidth; ch.classList.add('tease'); });
  await wait(dt.end + 260);
  if (dt.tease) { const ch = $('char'); ch.classList.add(sp.scatters.count >= 3 ? 'exhale' : 'slump'); setTimeout(() => ch.classList.remove('tease', 'exhale', 'slump'), 750 * T()); }
  if (sp.wins.length) run = await evalWins(sp.wins, ctx, Math.min(run, cap), run0 + sp.totalPayout * stake); else await wait(300);
  if (run > cap) run = cap;
  S.music.intensity(clamp01(.12 + (sp.spinIndex / fsTotal) * .35 + Math.min(.4, (sp.totalPayout || 0) / 8)));
  if (sp.retrigger) {
    const cells = sp.scatters.cells; S.music.stinger('retrig'); sfx.retrig(); char('special', 1400 * T()); shake(1.6); flash(1.6); GRID.classList.add('focus');
    uniq(cells).forEach((e, i) => { FX.act(e, i * 90, e._c); ring(e, 600); dust(e, 8, .8, ['#ffd9a0', '#ff8a3c', '#fff1c8']); });
    banner(`+${sp.retrigger} SPINS!`, 'THE EMBERS BURN AGAIN', 1900, true); say(`MORE EMBERS! +${sp.retrigger} SPINS`, true); await wait(700);
    const fb = $('fsBox').getBoundingClientRect(), to = toLocal(fb.left + fb.width / 2, fb.top + fb.height / 2), from = ctr(uniq(cells)[0]);
    await fly(from, to, '+' + sp.retrigger, 0); fsTotal += sp.retrigger; setFs(sp.spinsLeft, true); sfx.reset(); await wait(450); restAll(); GRID.classList.remove('focus');
  }
  if (sp.spinsLeft === 0) { say('THE AURORA FADES', true); await wait(420); }
  return run;
}
const clamp01 = x => Math.max(0, Math.min(1, x));

/* ---------- Aurora Sweep: 5x5 ice sheet, bands melt the ice, crossing chips ---------- */
const P = 98.4, CS = 94.4;
const sc = (r, c) => document.querySelector(`#sweep .sc[data-r="${r}"][data-c="${c}"]`);
function sheetReset() { document.querySelectorAll('#sweep .sc').forEach(d => { d.className = 'sc'; d.querySelector('.val').textContent = ''; d.querySelector('.xn').textContent = ''; }); $('sweepBands').replaceChildren(); sweepState = null; }
let sweepState = null;   // { sheet, melted:Set, total }
const vtxt = v => (v >= 10000 ? Math.round(v / 1000) + 'k' : String(Math.round(v * 100) / 100)) + 'x';
function showCell(r, c, value, mult, prism) {
  const d = sc(r, c), v = d.querySelector('.val'), n = value * mult; v.textContent = vtxt(n); v.style.fontSize = vtxt(n).length >= 5 ? '21px' : vtxt(n).length === 4 ? '25px' : '';
  if (prism) d.classList.add('prism');
  const xn = d.querySelector('.xn'); if (mult >= 2) { xn.textContent = 'x' + mult; d.classList.add('xm'); xn.style.animation = 'none'; void xn.offsetWidth; xn.style.animation = ''; }
}
function meltCell(r, c, info, miss) {
  const d = sc(r, c); d.classList.add('melt'); if (miss) d.classList.add('miss');
  if (info.kind === 'empty') d.classList.add('empty'); else showCell(r, c, info.value, info.prism ? 1 : 1, info.prism);
  const b = d.getBoundingClientRect(); S.shards(b.left + b.width / 2, b.top + b.height / 2, miss ? 3 : 7, ICE, { power: .5, edge: 'rgba(10,30,70,.5)' });
}
function bandEl(cells) {
  const a = cells[0], b = cells[cells.length - 1], pa = [a[1] * P + CS / 2, a[0] * P + CS / 2], pb = [b[1] * P + CS / 2, b[0] * P + CS / 2], len = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) + CS + 40, ang = Math.atan2(pb[1] - pa[1], pb[0] - pa[0]) * 180 / Math.PI;
  const w = document.createElement('div'); w.className = 'arBand'; const m = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
  w.style.cssText = `left:${m[0] - len / 2}px;top:${m[1] - 58}px;width:${len}px;height:116px;transform:rotate(${ang}deg)`; w.innerHTML = '<i></i>'; $('sweepBands').append(w);
  w.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .86 }, { opacity: 0 }], { duration: 1150 * T(), fill: 'forwards' }).finished.then(() => w.remove(), () => w.remove());
  w.firstChild.animate([{ transform: 'translateX(-110%)' }, { transform: 'translateX(260%)' }], { duration: 1100 * T(), easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
}
async function sweepStep(sp, run0, ctx) {
  const stake = ctx.stake, cap = MAXW * stake, B = bonusR.bonus, b = sp.band; let run = run0; const sh = sweepState || (sweepState = { sheet: B.sheet, melted: new Set() });
  setFs(sp.spinsLeft, true); char('spin', 950 * T());
  if (sp.spinIndex === 1) { say('THE ICE HOLDS ITS SECRETS', true); await wait(500); }
  say(`BAND ${sp.spinIndex} OF ${B.startSpins}`, true); sfx.band(); S.music.intensity(clamp01(.1 + (sp.spinIndex / B.startSpins) * .55));
  bandEl(b.cells);
  const order = b.cells.map(([r, c]) => [r, c]), mt = new Set(sp.newlyMelted.map(([r, c]) => r * 5 + c));
  const t0 = 380, dt = 640 / Math.max(1, order.length - 1);
  order.forEach(([r, c], i) => {
    after(t0 + i * dt, () => { if (mt.has(r * 5 + c)) { meltCell(r, c, sh.sheet[r][c]); sfx.melt(i); sh.melted.add(r * 5 + c); } else sfx.tickIce(i); });
  });
  await wait(t0 + 640 + 160);
  /* crossings: re-price the cells this band touched; two or more bands = the converge moment */
  let conv = 0;
  sp.crossed.forEach((x, i) => { after(i * 60, () => { showCell(x.r, x.c, x.value, x.multiplier, x.prism); const d = sc(x.r, x.c); d.classList.remove('flip'); void d.offsetWidth; d.classList.add('flip'); if (x.crossings >= 2) { conv = Math.max(conv, x.multiplier); sfx.chipX(x.multiplier); } }); });
  await wait(sp.crossed.length * 60 + 200);
  if (conv >= 2) { S.music.stinger('conv'); sfx.converge(conv); flash(.8 + conv * .2); shake(.6 + conv * .2); say(`BANDS CONVERGE! x${conv}`, true); }
  const money = sp.totalPayout * stake, to = Math.min(run + money, cap);
  if (money > 0) { const bb = $('sweep').getBoundingClientRect(); pop(bb.left + bb.width / 2, bb.top + bb.height / 2, '+' + fmt(money)); await S.countUp($('win'), to, 520 * T() + 120, run); ctx.onWin(run, to); run = to; } else await wait(260);
  await wait(conv >= 2 ? 650 : 380);
  if (sp.spinsLeft === 0) {   // the full reveal: what the ice still hid
    say('THE LAST BAND PASSES. WHAT THE ICE STILL HID...', true); sfx.reveal();
    let k = 0; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { if (sh.melted.has(r * 5 + c)) continue; const i = k++; after(i * 38, () => meltCell(r, c, sh.sheet[r][c], true)); }
    await wait(k * 38 + 900);
  }
  return run;
}

/* ---------- splashes: Aino's portraits, per-bonus copy ---------- */
const splashSvg = sup => `<svg class="ainoSplash${sup ? ' super' : ''}" viewBox="40 6 420 360"><use href="#ainoSplash${sup ? 'Super' : ''}"/></svg>`;
function setupSplash() {
  const fs = bType === 'fs', sup = bonusSuper, B = bonusR.bonus, I = S.cfg.intro, O = S.cfg.outro;
  ['introM', 'outroM'].forEach(id => $(id).classList.toggle('sup', sup));
  $('introLbl').textContent = fs ? 'FREE SPINS' : 'BANDS';
  $('introRibbon').textContent = fs ? (sup ? 'SUPER AURORA MUSE' : 'AURORA MUSE') : 'AURORA SWEEP';
  $('introChips').innerHTML = (fs ? [`${B.scatters} FS: ${B.startSpins} FREE SPINS`, 'THE AURORA LIGHTS ONE SYMBOL EVERY SPIN', 'LIT: WINS FROM 5 TILES, BLOCKS COUNT x2'] : [`${B.gems} GEMS: ${B.startSpins} BANDS OF LIGHT`, 'EACH BAND MELTS A ROW, COLUMN OR DIAGONAL', 'CELLS CROSSED TWICE PAY x2, x3, x4...']).map(c => `<span>${c}</span>`).join('');
  const q = (id, t) => { const e = $(id).querySelector('.quote'); if (e) e.textContent = t; };
  q('introM', fs ? (sup ? '"Four embers. She has never been this bright."' : I.quote) : '"The ice remembers every light that crossed it."');
  document.querySelector('#introM .tapHint').textContent = fs ? I.tap : 'TAP ANYWHERE TO BEGIN THE SWEEP';
  $('outroRibbon').textContent = fs ? 'THE SKY GOES QUIET' : 'THE ICE HAS SPOKEN';
  document.querySelector('#outroM .mtop').textContent = fs ? 'AURORA MUSE WINNINGS' : 'AURORA SWEEP WINNINGS';
  ['introArt', 'outroArt'].forEach(id => { const e = $(id); if (e) e.innerHTML = splashSvg(sup); });
  fsTotal = B.startSpins;
}

/* ---------- Game Info paytable (engine info() embedded by the build, never retyped) ---------- */
function buildPaytable() {
  const f = v => `<td>${+(+v).toFixed(2)}x</td>`, row = (id, name, tds) => `<tr><td><div class="nm"><svg viewBox="0 0 128 128"><use href="#s${id}"/></svg>${name}</div></td>${tds}</tr>`;
  $('ptab').innerHTML = '<tr><th>SYMBOL</th>' + INFO.tiers.map(t => `<th>${t}</th>`).join('') + `<th>LIT ${INFO.litTier}</th></tr>` +
    INFO.pay.map((p, i) => row(i, NAMES[i], p.map(f).join('') + f(p[0] * INFO.litLow))).reverse().join('') +
    row(WILD, 'Aurora Orb (Wild)', '<td colspan="6">Stands in for any pay symbol, singles only</td>') + row(FSC, 'FS (Scatter)', `<td colspan="6">3 FS: ${INFO.fs.spins[0]} spins, 4 FS: ${INFO.fs.spins[1]}, 5 FS: ${INFO.fs.spins[2]}. In the bonus 3+ FS: +${INFO.fs.retrigSpins}</td>`) +
    row(11, 'Aurora Gem', `<td colspan="6">${INFO.sweep.minGems}+ anywhere: AURORA SWEEP (${INFO.sweep.minGems} to ${INFO.sweep.maxBands} bands)</td>`);
}

/* ---------- sound: ice chimes, block thuds, melt, aurora swell (all synthesised) ---------- */
return {
  music: musicDefs,
  sfx(kit) {
    const { ctx, bus, env, osc, noise, metal, st, T0 } = kit;
    const DOR = [0, 2, 3, 5, 7, 9, 10], D5 = 587.33, N = k => D5 * st(DOR[((k % 7) + 7) % 7] + 12 * Math.floor(k / 7)) / 2;   // D Dorian from D5
    const glass = (f, t, v = .1, d = 1.6) => { metal(f, t, d, v, [1, 2.003, 3.97]); noise(t, .03, v * .35, 'highpass', 6500, 0, .7, .001); };
    const crackN = (t, v = .2) => { noise(t, .09, v, 'highpass', 4200, 9000, .8, .001); noise(t + .02, .05, v * .7, 'bandpass', 7000, 3000, 2, .001); osc('sine', 2400, t, .04, v * .2, .001, 900); };
    const swell = (t, d, v, f0, f1) => { [0, 7, 12, 16].forEach((s, i) => { const o = ctx.createOscillator(), g = env(t, d * .85, v / (1 + i * .5), d * .3); o.type = 'sine'; o.frequency.setValueAtTime(f0 * st(s) * .99, t); o.frequency.exponentialRampToValueAtTime(f1 * st(s), t + d); o.detune.value = (i % 2 ? 6 : -6); o.connect(g).connect(bus); o.start(t); o.stop(t + d * 1.3 + .1); }); noise(t, d * 1.1, v * .9, 'bandpass', f0 * 1.2, f1 * 3, 1.4, d * .8); };
    const R = {
      ui: () => { const t = T0(); glass(N(9), t, .05, .5); },
      tap: () => { const t = T0(); glass(N(10), t, .05, .4); },
      hit: () => { const t = T0(); noise(t, .07, .12, 'highpass', 3500, 7000, .7); glass(N(11), t, .06, .5); },
      spin: () => { const t = T0(); noise(t, .35, .11, 'bandpass', 300, 1800, .9, .1); osc('sine', 110, t, .3, .1, .05, 70); },
      drop: () => { const t = T0(); noise(t, .5, .08, 'bandpass', 1600, 350, .7, .05); },
      land: c => { const t = T0(); osc('sine', 120 - c * 3, t, .12, .2, .002, 60); noise(t, .05, .12, 'lowpass', 700, 0); if (c % 2) glass(N(7 + c), t + .01, .02, .6); },
      thud: size => { const t = T0(), v = size === 3 ? 1.3 : .9; osc('sine', 78, t, .5, .5 * v, .003, 34); osc('sine', 155, t, .22, .2 * v, .003, 60); noise(t, .24, .22 * v, 'lowpass', 900, 160, .8, .002); crackN(t + .01, .16 * v); if (size === 3) { osc('sine', 40, t + .02, .9, .3, .02, 28); glass(N(2), t + .05, .06, 2.4); } },
      win: n => { const t = T0(), b = Math.min(n, 7); [0, 2, 4, 5].forEach((d, i) => glass(N(b + d), t + i * .09, .075, 1.8)); },
      crack: () => { const t = T0(); crackN(t, .2); glass(N(9), t + .03, .05, 1.4); },
      fsLand: k => { const t = T0(); osc('sine', 150, t, .22, .3, .003, 70); noise(t, .12, .12, 'bandpass', 2400, 900, 1.1, .002); for (let i = 0; i < 4; i++) osc('sine', 900 + Math.random() * 1400, t + .02 + i * .03, .05, .02, .002); glass(N(7 + k * 2), t + .03, .08, 1.2); },
      gemLand: k => { const t = T0(); glass(N(8 + k * 2), t, .11, 2.2); glass(N(8 + k * 2) * 1.5, t + .05, .05, 1.8); noise(t, .06, .08, 'highpass', 8000, 0, .6, .001); },
      beat: () => { const t = T0(); osc('sine', 62, t, .2, .32, .006, 38); osc('sine', 62, t + .22, .2, .22, .006, 38); noise(t, .5, .05, 'bandpass', 500, 2600, 1.2, .2); },
      wildFly: () => { const t = T0(); noise(t, .45, .09, 'bandpass', 800, 3600, 1.3, .08); swell(t, .45, .03, 400, 900); glass(N(14), t + .4, .06, 1.2); },
      /* SIGNATURE 1: the aurora lights a symbol: a huge slow ascending shimmer, stacked detuned sines gliding up + a noise swell, one glass chime on top */
      lit: () => { const t = T0(); swell(t, 1.1, .05, 200, 520); glass(N(14), t + 1, .1, 3); glass(N(16), t + 1.1, .06, 3); },
      band: () => { const t = T0(); swell(t, .9, .035, 300, 900); noise(t, 1, .08, 'bandpass', 500, 4200, 1.2, .5); },
      melt: i => { const t = T0(); noise(t, .22, .09, 'highpass', 5200, 1800, .8, .002); osc('sine', 1900 + i * 160, t + .02, .1, .04, .002, 600); glass(N(8 + i), t + .05, .05, .9); },
      tickIce: i => { const t = T0(); glass(N(7 + i), t, .03, .5); },
      freeze: () => { const t = T0(); noise(t, .9, .13, 'highpass', 3000, 8000, .8, .1); for (let i = 0; i < 9; i++) crackN(t + i * .07, .08); glass(N(4), t + .6, .08, 3); },
      chipX: m => { const t = T0(); glass(N(8 + Math.min(8, m * 2)), t, .12, 1.6); glass(N(11 + Math.min(8, m * 2)), t + .07, .08, 1.4); },
      /* SIGNATURE 2: bands converge, a loud chime stack + sub boom */
      converge: m => { const t = T0(); osc('sine', 82, t, .8, .4, .004, 38); [0, 2, 4, 5, 7].slice(0, 3 + Math.min(2, m - 1)).forEach((d, i) => glass(N(7 + d * 2), t + i * .06, .12, 2.6)); swell(t, .5, .04, 300, 800); },
      reveal: () => { const t = T0(); for (let i = 0; i < 10; i++) glass(N(14 - i), t + i * .08, .03, 1.2); swell(t, .9, .025, 200, 400); },
      reset: () => { const t = T0(); [0, 2, 4, 6].forEach((n, i) => glass(N(7 + n), t + i * .06, .07, 1.2)); osc('sine', 130, t, .3, .16, .01, 60); },
      retrig: () => { const t = T0(); for (let i = 0; i < 5; i++) osc('sine', 130 + i * 14, t + i * .09, .25, .2, .004, 60); [0, 2, 3, 4, 5, 7].forEach((n, i) => glass(N(8 + n), t + .3 + i * .06, .08, 1.6)); },
      bonus: () => { const t = T0(); osc('sine', 75, t, 1.2, .4, .01, 37); swell(t, 1.2, .05, 200, 700); [0, 2, 4, 5, 7, 9].forEach((n, i) => glass(N(7 + n), t + .5 + i * .09, .09, 2.4)); },
      outro: () => { const t = T0(); [7, 5, 3, 0].forEach((n, i) => glass(N(7 + n), t + i * .2, .08, 2.4)); swell(t + .2, 1, .02, 400, 260); },
      big: lv => { const t = T0(); swell(t, 1 + lv * .25, .06, 200, 800); for (let i = 0; i < lv + 3; i++) glass(N(7 + i * 2), t + .4 + i * .16, .09, 2.4); for (let i = 0; i < 2 + lv; i++) osc('sine', 80, t + i * .3, .5, .3, .005, 36); },
      tick: k => { const t = T0(); osc('triangle', 650 + k * 900, t, .05, .08, .001); glass(1500 + k * 1200, t, .025, .3); },
      feverOn: () => { const t = T0(); swell(t, .5, .03, 300, 800); glass(N(11), t + .3, .08, 1.5); }
    };
    return R;
  },
  /* a faint arctic wind and, now and then, a far ice chime */
  ambience(kit) {
    const { ctx, metal } = kit; const bed = kit.bed({ lowpass: 520, gain: .32, level: .022, loopSec: 5, crack: { gain: [.001, .003], f: [4500, 3000], q: 3, every: [3500, 6000], len: [.03, .07] } });
    let tm = 0, run = false;
    const chime = () => { if (!run) return; if (!S.isTurbo()) { const t = ctx.currentTime + .02, f = [1174, 1319, 1568, 1760, 2093][Math.floor(Math.random() * 5)]; metal(f, t, 3, .014, [1, 2.003]); if (Math.random() < .5) metal(f * 1.5, t + .35, 2.6, .01, [1, 2.003]); }
      tm = setTimeout(chime, 8000 + Math.random() * 14000); };
    return { start() { run = true; bed.start(); clearTimeout(tm); tm = setTimeout(chime, 4000); }, stop() { run = false; clearTimeout(tm); bed.stop(); } };
  },
  particleColor: (p, a) => p.c ? `rgba(130,255,205,${a})` : `rgba(${205 + (p.l % 30)},${235 + (p.l % 20)},255,${a})`,
  init() {
    $('fxl').insertAdjacentHTML('beforeend', '<div id="arBanner"><b></b><small></small></div>');
    buildPaytable();
  },
  paintIdle() {
    /* the idle board: a 3x3 compass block and a 2x2 owl block */
    paint([[2, 5, 0, 4, 4, 4], [7, 7, 6, 4, 4, 4], [7, 7, 1, 4, 4, 4], [0, 3, 3, 2, 6, 0], [1, 6, 5, 7, 2, 1]], [{ id: 0, sym: 4, r: 0, c: 3, size: 3 }, { id: 1, sym: 7, r: 1, c: 0, size: 2 }]);
    allEls().forEach(e => FX.drop(e, dropOpt(e, e._c * 92)));
  },
  splashArt: () => splashSvg(false),
  roundStart() { auraReset(); sheetReset(); bType = null; clearOverlays(); $('sweep').classList.remove('on'); },
  clearBoard: async () => { if (inBonus && bType === 'sweep') { if (!bonusOpened) { bonusOpened = true; await dropOut(); sheetReset(); $('sweep').classList.add('on'); sfx.freeze(); await wait(500); } else await wait(40); return; } await dropOut(); },
  restoreBoard() { if (lastGrid) paint(lastGrid, lastBlocks); },
  baseSpin: R => ({ grid: R.initialGrid, blocks: R.initialBlocks || [], step: R.cascadeSteps[0] || null }),
  playSpin: (sp, run, ctx) => sp.band ? sweepStep(sp, run, ctx) : sp.lit != null ? fsSpin(sp, run, ctx) : baseSpin(sp, run, ctx),
  showTrigger,
  bonusMode(on) {
    inBonus = on; bonusOpened = false; const sw = bType === 'sweep';
    $('scene').classList.toggle('bonus', on); $('frame').classList.toggle('muse', on && !sw);
    if (on) {
      char('bonus', 1400 * T()); const B = bonusR.bonus; document.querySelector('#fsBox small').textContent = sw ? 'BANDS LEFT' : 'SPINS LEFT'; setFs(B.startSpins); fsTotal = B.startSpins;
      S.music.intensity(sw ? .1 : .15); if (!sw) { auraReset(); $('aura').classList.add('fs'); } else sheetReset();
    } else {
      S.music.intensity(0); $('sweep').classList.remove('on'); auraReset(); $('scene').classList.remove('litFlare');
      if (lastGrid) { paint(lastGrid, lastBlocks); allEls().forEach(e => FX.drop(e, dropOpt(e, e._c * 70))); }   // the trigger board comes back behind the outro
    }
  }
};
});
