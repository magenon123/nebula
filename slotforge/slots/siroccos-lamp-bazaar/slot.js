/* Sirocco's Lamp Bazaar. The only slot-specific client logic; the shell (shell/slot-shell.js) calls these hooks.
 * Pure renderer: the engine/server returns the whole round (stages of the SEALED CHAIN, Free Wishes spins, Astrolabe spins); nothing here computes an outcome.
 * Round payload: plans/siroccos-lamp-bazaar-round-format.md. Art geometry: slots/siroccos-lamp-bazaar/ART-NOTES.md.
 * Engine ids: 0-8 pay, 9 Djinn Seal (wild), 10 FS scatter, 11 Astrolabe scatter, 12 Wish Gem (value from stage.gems, art skin s12_<value>). */
SlotShell.boot(SLOT_CFG, S => {
const { $, sfx, wait, T, say, shake, flash, embers, char, pop, fmt } = S;
const ROWS = 5, COLS = 5, WILD = 9, FSC = 10, ASTRO = 11, GEM = 12, CW = 104, MAXW = S.cfg.maxWin, INFO = S.cfg.engineData.info;
const FX = S.fx, GRID = $('grid');
const NAMES = (INFO.symbols || []).map(s => typeof s === 'string' ? s : s.name);
const GOLD = ['#fff3c0', '#ffd27a', '#f2b53a', '#e0701c'], TEAL = ['#c8fff6', '#3ad8c8', '#fff3c0'];
let el = [], snap = null, baseSnap = null, inBonus = false, bType = null, bonusR = null, bonusOpened = false, fsTotal = 10, curMult = 1, gemSum = 0, ringAng = [0, 0, 0];
const after = (ms, fn) => setTimeout(fn, ms * T());
const clamp01 = x => Math.max(0, Math.min(1, x));
const cellC = (r, c) => [c * CW + CW / 2, r * CW + CW / 2];                 // centre in #fxl (board-local) coordinates
const scrC = e => { const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };
const fxl = () => $('fxl');
const toLocal = (x, y) => { const b = fxl().getBoundingClientRect(), k = b.width / 520; return [(x - b.left) / k, (y - b.top) / k]; };
const E = (r, c) => el[r * COLS + c];
const allEls = () => el.filter(Boolean);
const cellsOf = (grid, id) => { const o = []; grid.forEach((row, r) => row.forEach((s, c) => { if (s === id) o.push([r, c]); })); return o; };
const NM = s => (NAMES[s] || '').replace(/ \(Wild\)/i, '').toUpperCase();

/* ---------- MUSIC: "bazaar at golden hour" (base, 88 bpm, D Phrygian dominant), "the lamp is lit" (bonus, 116 bpm) ---------- */
function musicDefs() {
  const PD = [0, 1, 4, 5, 7, 8, 10];                                   // D E-flat F-sharp G A B-flat C
  const ROOT = [38, 38, 39, 38, 38, 43, 39, 38], CH = [[50, 54, 57], [50, 54, 57], [51, 55, 58], [50, 54, 57], [50, 54, 57], [50, 55, 58], [51, 55, 58], [50, 54, 57]];
  const MOT = [[0, 2, 4, 2, 1, 0, 1, 2], [2, 4, 5, 4, 2, 1, 0, 1], [0, 4, 2, 1, 0, -1, 0, 1], [4, 5, 6, 5, 4, 2, 1, 0]];
  const ARP = [[0, 2, 4, 6], [1, 2, 4, 5], [0, 2, 4, 5], [-1, 1, 2, 4]];
  const MEL = [[4, 2], [5, 4], [6, 5], [4, 1], [2, 4], [5, 6], [4, 2], [1, 0]];
  const dum = (M, layer, s, v) => M.kick(layer, M.st(s), v, { f0: 150, f1: 62, d: .26, g: .2 });
  const tek = (M, layer, s, v) => M.hat(layer, M.st(s), v, { f: 3600, d: .05, g: .06 });
  const bazaar = {
    tempo: 88, barBeats: 4, spb: 8, swing: .12, bars: 8, key: 62, scale: PD, seed: 51, gain: .9, phrase: 4,
    layers: { drone: { gain: 1, wet: .3 }, oud: { gain: 1, wet: .3 }, darbuka: { enter: 1, gain: 1, wet: .12 }, zil: { enter: 2, gain: 1, wet: .4 }, ney: { enter: 2, gain: 1, wet: .55 }, frame: { int: .3, gain: 1, wet: .15 }, hi: { int: .5, gain: 1, wet: .5 } },
    bar(M) {
      const k = M.i & 7, mot = MOT[(k >> 1) & 3], wk = Math.max(-1, Math.min(1, M.walk));
      if (k % 2 === 0) M.pad('drone', M.t0, M.bd * 2, [ROOT[k], ROOT[k] + 7], { wave: 'sawtooth', cut: 240, q: .5, a: 1.6, r: 1.8, g: .05, det: 6 });
      for (let s = 0; s < 8; s++) { if (s % 2 === 1 && M.rnd() < .45) continue; M.koto('oud', M.st(s), M.note(mot[s] + (s > 4 ? wk : 0), 0), { g: s % 4 === 0 ? .075 : .045, d: .38 }); }
      [0, 4].forEach(s => dum(M, 'darbuka', s, .9)); [1, 3, 6].forEach(s => tek(M, 'darbuka', s, .9)); if (k % 4 === 3) tek(M, 'darbuka', 7, .7);
      [1, 3, 5, 7].forEach(s => M.metal('zil', M.st(s), 4300, .45, .012, [1, 2.4]));
      if (k % 2 === 0) { const m = MEL[k]; M.shaku('ney', M.st(0), 2.2, M.note(m[0], 1), { g: .045, a: .18 }); M.shaku('ney', M.st(5), 1.6, M.note(m[1], 1), { g: .036, a: .14 }); }
      if (M.int > .3) [0, 4].forEach(s => M.taiko('frame', M.st(s), .45, { f0: 108, f1: 58, d: .5, g: .22 }));
      if (M.int > .5) [0, 2, 4, 6].forEach(s => M.metal('hi', M.st(s) + .01, M.mtof(M.note(mot[s] + 7, 2)), 1.2, .016, [1, 2.003]));
    }
  };
  const lit = {
    tempo: 116, barBeats: 4, spb: 16, swing: .06, bars: 8, key: 62, scale: PD, seed: 77, gain: .88, phrase: 4,
    layers: { drone: { gain: 1, wet: .25 }, pad: { gain: 1, wet: .5 }, oud: { gain: 1, wet: .25 }, darbuka: { gain: 1, wet: .12 }, zil: { gain: 1, wet: .35 }, ney: { int: .1, gain: 1, wet: .5 }, riser: { gain: 1, wet: .4 }, hit: { int: .6, gain: 1, wet: .2 } },
    bar(M) {
      const k = M.i & 7, a = ARP[(k >> 1) & 3], I = M.int, wk = Math.max(-1, Math.min(1, M.walk));
      if (k % 2 === 0) { M.pad('drone', M.t0, M.bd * 2, [ROOT[k], ROOT[k] + 7], { wave: 'sawtooth', cut: 260 + I * 240, q: .5, a: 1, r: 1.4, g: .055, det: 6 }); M.pad('pad', M.t0, M.bd * 2, CH[k].map(n => n + 12), { wave: 'triangle', cut: 2200 + I * 900, q: .3, a: 1.2, r: 1.6, g: .05, det: 12 }); }
      for (let s = 0; s < 16; s++) M.koto('oud', M.st(s), M.note(a[s % 4] + (s > 11 ? wk : 0) + (s % 8 > 5 ? 2 : 0), s % 8 > 3 ? 1 : 0), { g: s % 4 === 0 ? .06 : .036, d: .26 });
      [0, 6, 8, 11].forEach(s => dum(M, 'darbuka', s, .95)); [2, 3, 5, 7, 10, 13, 14].forEach(s => tek(M, 'darbuka', s, .85)); if (k % 4 === 3) [12, 13, 14, 15].forEach((s, j) => tek(M, 'darbuka', s, .6 + j * .12));
      [2, 6, 10, 14].forEach(s => M.metal('zil', M.st(s), 4500, .4, .013, [1, 2.4]));
      if (k % 4 === 0) M.shaku('ney', M.st(0), 3, M.note(MEL[k][0] + (I > .5 ? 2 : 0), 1), { g: .045, a: .15 });
      if (k % 4 === 3) M.riser('riser', M.t0, M.bd, { g: .03 + I * .03, f1: 400, f2: 3600 + I * 1800 });
      if (I > .6) [0, 4, 8, 12].forEach((s, j) => M.taiko('hit', M.st(s), .5 + j * .05, { f0: 112, f1: 56, d: .35, g: .26 }));
    }
  };
  const stingers = {
    win(K) { const { V, dest, t } = K; [0, 2, 4, 6].forEach((d, i) => V.metal(dest, t + i * .09, K.mtof(K.note(d, 2)), 1.6, .05, [1, 2.003])); },
    bonus(K) { const { V, dest, t } = K; V.sub(dest, t, 1.4, 38, { g: .3 }); [0, 1, 2, 3, 4, 5, 6, 7, 9].forEach((d, i) => V.metal(dest, t + .15 + i * .09, K.mtof(K.note(d, 1)), 2, .05, [1, 2.003])); V.pad(dest, t, 2.6, [50, 54, 57, 62], { wave: 'triangle', cut: 2200, a: .8, r: 1.6, g: .1, det: 10 }); },
    outro(K) { const { V, dest, t } = K; [6, 4, 2, 0].forEach((d, i) => V.metal(dest, t + i * .26, K.mtof(K.note(d, 1)), 2.6, .05, [1, 2.003])); },
    mult(K) { const { V, dest, t } = K; V.sub(dest, t, .9, 38, { g: .34 }); [0, 2, 4, 6, 7].forEach((d, i) => V.metal(dest, t + i * .06, K.mtof(K.note(d, 1)), 2.4, .06, [1, 2.4, 4.1])); },
    retrig(K) { const { V, dest, t } = K; V.sub(dest, t, .8, 38, { g: .3 }); [0, 2, 3, 4, 5, 7, 9].forEach((d, i) => V.metal(dest, t + .1 + i * .06, K.mtof(K.note(d, 1)), 1.6, .05, [1, 2.003])); },
    jackpot(K) { const { V, dest, t } = K; V.sub(dest, t, 1.6, 36, { g: .36 }); [0, 2, 4, 6, 7, 9, 11].forEach((d, i) => V.metal(dest, t + .1 + i * .08, K.mtof(K.note(d, 1)), 2.8, .06, [1, 2.4, 4.1])); V.pad(dest, t, 3, [50, 54, 57, 62], { wave: 'triangle', cut: 2800, a: .5, r: 2, g: .12, det: 10 }); }
  };
  return { base: bazaar, lit, get bonus() { return lit; }, stingers };
}

/* ---------- the board ---------- */
const skin = (sym, gv) => sym === GEM ? 's12_' + (gv || 2) : 's' + sym;
function mkCell(sym, r, c, gv) {
  const d = document.createElement('div'); d.className = 'cell'; d.style.gridColumn = c + 1; d.style.gridRow = r + 1;
  d.innerHTML = `<svg class="g" viewBox="0 0 128 128"><use href="#${skin(sym, gv)}"/></svg>`; d._r = r; d._c = c; d._sym = sym; d._gv = gv || 0; return d;
}
const gemMap = gems => { const m = {}; (gems || []).forEach(g => { m[g.r * COLS + g.c] = g.value; }); return m; };
function paint(grid, gems, sealed) {
  GRID.replaceChildren(); el = []; GRID.classList.remove('focus'); const gm = gemMap(gems), fr = document.createDocumentFragment();
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const d = mkCell(grid[r][c], r, c, gm[r * COLS + c]); if (sealed && sealed[r][c]) d.classList.add('sealed'); fr.append(d); el[r * COLS + c] = d; }
  GRID.append(fr); clearOverlays();
}
function takeSnap(grid, gems) { snap = { grid: grid.map(r => r.slice()), gems: (gems || []).slice(), sealed: Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => E(r, c) && E(r, c).classList.contains('sealed') ? 1 : 0)) }; }
function clearOverlays() { fxl().querySelectorAll('.sirStreak,.sirFly').forEach(e => e.remove()); }
const dropOpt = (e, base) => ({ delay: base + Math.random() * 14 + (ROWS - 1 - e._r) * 34, dist: (e._r + 1) * CW + 60, tilt: (Math.random() - .5) * 5, dur: 560 });
function ring(e, ms = 650) { e.classList.remove('pulse'); void e.offsetWidth; e.classList.add('pulse'); setTimeout(() => e.classList.remove('pulse'), ms * T()); }
function dust(e, n = 8, power = .6, cols = GOLD) { const [x, y] = scrC(e); S.shards(x, y, n, cols, { power, edge: 'rgba(60,24,6,.5)' }); }
function restAll() { allEls().forEach(e => FX.rest(e)); }
function setFs(n, bump) { const e = $('fs'); e.textContent = n; if (bump) e.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.8) rotate(-6deg)', offset: .3 }, { transform: 'scale(.92)', offset: .65 }, { transform: 'scale(1)' }], { duration: 620 * T(), easing: 'ease-out' }); }
function banner(title, sub, ms = 1500, big) {
  const b = $('sirBanner'); b.querySelector('b').textContent = title; b.querySelector('small').textContent = sub || ''; b.classList.toggle('big', !!big);
  b.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.4)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.1)', offset: .16 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .26 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.02)', offset: .84 }, { opacity: 0, transform: 'translate(-50%,-62%) scale(.96)' }], { duration: ms * T(), easing: 'ease-out' });
}
async function fly(from, to, text, delay, cls = '') {
  const e = document.createElement('div'); e.className = 'sirFly ' + cls; e.textContent = text; e.style.left = from[0] + 'px'; e.style.top = from[1] + 'px'; fxl().append(e);
  const a = e.animate([{ transform: 'translate(-50%,-50%) scale(1.2)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 1, offset: .15 }, { transform: `translate(calc(-50% + ${to[0] - from[0]}px),calc(-50% + ${to[1] - from[1]}px)) scale(.5)`, opacity: .9 }], { duration: 480 * T(), delay: delay * T(), easing: 'cubic-bezier(.5,0,.8,.5)', fill: 'both' });
  await a.finished.catch(() => {}); e.remove();
}
async function dropOut() {
  GRID.classList.remove('focus'); let end = 0;
  allEls().forEach(e => { const o = { delay: e._c * 46 + (ROWS - 1 - e._r) * 24, dist: (ROWS - e._r) * CW + 90, rot: (e._c % 2 ? 1 : -1) * (2 + e._c % 3), dur: 420 }; FX.out(e, o); end = Math.max(end, o.delay + o.dur); });
  await wait(end * .86);
}

/* ---------- chain meter (#chain): CHAIN x N, ladder, gem sum ---------- */
function setMult(m, bump) {
  const c = $('chain'); curMult = m; c.classList.remove('m1', 'm2', 'm3', 'm4', 'm5'); c.classList.add('m' + Math.min(5, m)); c.querySelector('.cv').textContent = '×' + m;
  if (bump) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); setTimeout(() => c.classList.remove('bump'), 520 * T()); }
}
function setGems(n, bump) {
  const c = $('chain'); gemSum = n; c.querySelector('.gsum').textContent = '×' + n; c.classList.toggle('hasGems', n > 0);
  if (bump) { const g = c.querySelector('.chGem'); g.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)', offset: .3 }, { transform: 'scale(1)' }], { duration: 420 * T(), easing: 'ease-out' }); }
}
const meterPoint = sel => { const b = $('chain').querySelector(sel).getBoundingClientRect(); return toLocal(b.left + b.width / 2, b.top + b.height / 2); };

/* ---------- landing: reel by reel; once two FS or two Astrolabes have landed (one short of a trigger) the remaining reels hang a beat with a heartbeat ---------- */
function dropReels(els, grid, teaseOn) {
  const byCol = Array.from({ length: COLS }, () => []); els.forEach(e => byCol[e._c].push(e));
  let base = 0, end = 0, tease = false, seenF = 0, seenA = 0, said = false; const times = new Map();
  for (let c = 0; c < COLS; c++) {
    if (teaseOn && (seenF === 2 || seenA === 2)) { tease = true; base += 560; const b0 = base + c * 92, isA = seenA === 2; after(b0 - 500, () => { sfx.beat(); if (!said) { said = true; say(isA ? 'ONE MORE ASTROLABE...' : 'ONE MORE SUN...', true); } shake(.3); }); }
    byCol[c].forEach(e => { const o = dropOpt(e, base + c * 92); FX.drop(e, o); const t = o.delay + o.dur * .58; times.set(e, t); end = Math.max(end, t); });
    after(base + c * 92 + 380, () => sfx.land(c));
    if (teaseOn) for (let r = 0; r < ROWS; r++) { if (grid[r][c] === FSC) seenF++; else if (grid[r][c] === ASTRO) seenA++; }
  }
  return { end, tease, times };
}
function landMarks(els, dt) {
  let nf = 0, na = 0, ng = 0, nw = 0;
  els.map(e => [dt.times.get(e), e]).sort((a, b) => a[0] - b[0]).forEach(([t, e]) => {
    if (e._sym === FSC) { const i = nf++; after(t, () => { sfx.fsLand(i); ring(e); }); }
    else if (e._sym === ASTRO) { const i = na++; after(t, () => { sfx.astroLand(i); ring(e); }); }
    else if (e._sym === GEM) { const i = ng++; after(t, () => { sfx.gemLand(i); ring(e); }); }
    else if (e._sym === WILD) { const i = nw++; after(t, () => { sfx.whoosh(); ring(e); }); }
  });
}
async function teaseOutcome(dt, grid) {
  const nF = cellsOf(grid, FSC).length, nA = cellsOf(grid, ASTRO).length, ch = $('char'), hit = nF >= 3 || nA >= 3;
  ch.classList.add(hit ? 'exhale' : 'slump'); setTimeout(() => ch.classList.remove('tease', 'exhale', 'slump'), 750 * T());
  if (!hit) { say(nA === 2 ? 'ALMOST... JUST ONE MORE ASTROLABE' : 'ALMOST... JUST ONE MORE SUN', true); await wait(650); }
}
async function dropFirst(st) {                                  // stage 1: the whole board falls, reel by reel
  paint(st.grid, st.gems, null); sfx.drop(); const els = allEls(), dt = dropReels(els, st.grid, true); landMarks(els, dt);
  if (dt.tease) after(Math.max(300, dt.end - 1500), () => { const ch = $('char'); ch.classList.remove(...S.cfg.char.states); void ch.offsetWidth; ch.classList.add('tease'); });
  await wait(dt.end + 260);
  if (dt.tease) await teaseOutcome(dt, st.grid);
}
async function respin(st) {                                     // later stages: sealed tiles stay, every free tile falls out and a new one falls in
  const olds = [], news = []; let end = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!st.sealed[r][c]) olds.push(E(r, c));
  olds.forEach(e => { const o = { delay: e._c * 30 + (ROWS - 1 - e._r) * 14, dist: (ROWS - e._r) * CW + 90, rot: (e._c % 2 ? 1 : -1) * 2, dur: 360 }; FX.out(e, o); end = Math.max(end, o.delay + o.dur); });
  sfx.respin(); await wait(end * .8);
  const gm = gemMap(st.gems);
  olds.forEach(e => { const r = e._r, c = e._c, d = mkCell(st.grid[r][c], r, c, gm[r * COLS + c]); e.replaceWith(d); el[r * COLS + c] = d; news.push(d); });
  const dt = dropReels(news, st.grid, false); landMarks(news, dt); await wait(dt.end + 200);
}

/* ---------- runs, seals, gems ---------- */
function streak(run, delay) {
  const a = cellC(...run.cells[0]), b = cellC(...run.cells[run.cells.length - 1]), len = Math.hypot(b[0] - a[0], b[1] - a[1]) + 96, ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const w = document.createElement('div'); w.className = 'sirStreak'; w.style.cssText = `left:${m[0] - len / 2}px;top:${m[1] - 20}px;width:${len}px;transform:rotate(${ang}deg)`; w.innerHTML = '<i></i>'; fxl().append(w);
  const o = { duration: 1000 * T(), delay: delay * T(), fill: 'both' };
  w.animate([{ opacity: 0 }, { opacity: 1, offset: .14 }, { opacity: 1, offset: .74 }, { opacity: 0 }], o).finished.then(() => w.remove(), () => w.remove());
  w.firstChild.animate([{ transform: 'translateX(-105%)' }, { transform: 'translateX(105%)' }], Object.assign({}, o, { easing: 'cubic-bezier(.4,0,.5,1)' }));
}
async function showRuns(st, stake) {
  const runs = st.runs, n = runs.length, gap = n > 4 ? 150 : 260, hit = new Set(); GRID.classList.add('focus');
  runs.forEach((run, i) => after(i * gap, () => {
    streak(run, 0); sfx.run(i, st.mult);
    run.cells.forEach(([r, c], j) => { const e = E(r, c); if (!hit.has(e)) { hit.add(e); FX.act(e, j * 45, c); } });
  }));
  await wait((n - 1) * gap + 760); return runs;
}
function sealCells(list, stampMs = 70) {
  if (!list.length) return Promise.resolve();
  list.forEach(([r, c], i) => after(i * stampMs, () => { const e = E(r, c); if (!e) return; FX.rest(e); e.classList.remove('pulse'); e.classList.add('sealed', 'in'); sfx.seal(i); dust(e, 5, .5, GOLD); }));
  return wait(list.length * stampMs + 420);
}
function pulseSealed() { GRID.querySelectorAll('.cell.sealed').forEach(e => ring(e, 700)); }
async function addGems(st) {                                    // every Wish Gem that landed this stage: its value flies into the gem-sum slot and adds up
  const fresh = (st.gems || []).filter(g => g.isNew); if (!fresh.length) return;
  const to = meterPoint('.chGem svg'); let k = 0;
  for (const g of fresh) { const e = E(g.r, g.c), from = cellC(g.r, g.c), i = k++; FX.act(e, 0, i); fly(from, to, '×' + g.value, 0, 'gem'); await wait(300); gemSum += g.value; setGems(gemSum, true); sfx.gemAdd(i, gemSum); }
  await wait(260); restAll();
}
async function finishChain(chain, ctx, run, top, stake) {
  const gems = [...GRID.querySelectorAll('.cell')].filter(e => e._sym === GEM);
  if (chain.base > 0 && chain.gemSum > 0) {
    const to = Math.min(top, run + (chain.payout - chain.base) * stake), b0 = chain.base * stake;
    GRID.classList.add('focus'); char('win', 1500 * T()); S.music.stinger('mult');
    { const vs = chain.gems.map(g => g.value); say(vs.length > 1 ? `GEMS ×${vs.join(' + ×')} = ×${chain.gemSum} MULTIPLY THE CHAIN WIN` : `WISH GEM ×${vs[0]} MULTIPLIES THE CHAIN WIN`, true); }
    gems.forEach((e, i) => { FX.act(e, i * 160, i); after(i * 160, () => { sfx.gemAdd(i, chain.gemSum); ring(e, 600); }); });
    await wait(gems.length * 160 + 500);
    const bn = $('sirMulti'); bn.querySelector('small').textContent = `CHAIN ${fmt(b0)}  ×  GEMS ×${chain.gemSum}`; const num = bn.querySelector('b'); num.textContent = fmt(b0); bn.classList.add('on');
    bn.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.18)', offset: .2 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .32 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 400 * T(), fill: 'forwards', easing: 'ease-out' });
    sfx.multBoom(); shake(1.4); flash(1.2); embers(60, innerWidth / 2, innerHeight / 2, true); await wait(520);
    const ms = Math.min(2300, 1100 + Math.log10(Math.max(1, chain.gemSum)) * 700) * T();
    sfx.countRise(ms / 1000);
    await Promise.all([S.countUp($('win'), to, ms, run, k => sfx.tick(k)), S.countUp(num, to - run + b0, ms, b0)]); ctx.onWin(run, to); run = to;
    bn.animate([{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%,-62%) scale(1.05)' }], { duration: 420 * T(), fill: 'forwards' }); await wait(520); bn.classList.remove('on');
    restAll(); GRID.classList.remove('focus');
  } else if (chain.gemsOnBoard > 0 && chain.base === 0) {      // no win in the chain: the gems fizzle
    sfx.fizzle(); say('NO WIN, THE GEMS FIZZLE OUT', true); gems.forEach(e => e.animate([{ opacity: 1, filter: 'none' }, { opacity: .35, filter: 'grayscale(1) brightness(.7)' }], { duration: 700 * T(), fill: 'forwards' })); await wait(900);
  }
  return run;
}

/* ---------- one chain: stages of landing, runs, seals, climbing multiplier ---------- */
async function playChain(stages, chain, ctx, run0, final, o = {}) {
  const stake = ctx.stake, top = Math.min(MAXW * stake, run0 + final * stake); let run = run0, shown = 0;
  GRID.classList.add('chain'); setGems(0); setMult(o.bonus ? o.sp.multStart : 1);
  for (let i = 0; i < stages.length; i++) {
    const st = stages[i];
    if (st.mult !== curMult) { setMult(st.mult, true); sfx.climb(st.mult); S.music.stinger('win'); shown = 1; }
    S.music.intensity(clamp01((o.bonus ? .35 : .1) + Math.min(i, 4) * .1 + (o.bonus ? st.mult / 40 : 0)));
    if (i === 0) await dropFirst(st); else { if (shown) await wait(250); pulseSealed(); await respin(st); }
    await addGems(st);
    if (st.runs.length) {
      char('win', 1500 * T()); await showRuns(st, stake);
      const inc = st.payout * stake, to = Math.min(top, run + inc), c0 = E(...st.runs[0].cells[Math.floor(st.runs[0].cells.length / 2)]);
      const [x, y] = scrC(c0); pop(x, y - 24, '+' + fmt(inc));
      say(st.runs.length === 1 ? `${NM(st.runs[0].sym)} ×${st.runs[0].len}  ·  CHAIN ×${st.mult}  ·  +${fmt(inc)}` : `${st.runs.length} LINES  ·  CHAIN ×${st.mult}  ·  +${fmt(inc)}`, true);
      await Promise.all([sealCells(st.newlySealed), S.countUp($('win'), to, 460 * T() + 100, run, k => sfx.tick(k)).then(() => { ctx.onWin(run, to); run = to; })]);
      restAll(); GRID.classList.remove('focus'); await wait(220);
    } else {
      if (st.newlySealed.length) { await sealCells(st.newlySealed); await wait(180); }
      if (i === stages.length - 1) { say(run > run0 ? 'THE CHAIN ENDS' : 'NO LINK THIS TIME', run > run0); await wait(260); }
    }
    shown = 0;
  }
  run = await finishChain(chain, ctx, run, top, stake);
  GRID.classList.remove('chain'); const last = stages[stages.length - 1]; takeSnap(last.grid, last.gems); S.music.intensity(o.bonus ? .35 : 0);
  return run;
}

/* ---------- base spin ---------- */
async function baseSpin(sp, run, ctx) {
  char('spin', 950 * T());
  if (!sp.stages.length) {                                      // bought round: the visible trigger spin, no wins
    const grid = sp.grid; paint(grid, [], null); sfx.drop(); const els = allEls(), dt = dropReels(els, grid, true); landMarks(els, dt);
    if (dt.tease) after(Math.max(300, dt.end - 1500), () => { const ch = $('char'); ch.classList.remove(...S.cfg.char.states); void ch.offsetWidth; ch.classList.add('tease'); });
    await wait(dt.end + 260); if (dt.tease) await teaseOutcome(dt, grid); takeSnap(grid, []); return run;
  }
  return playChain(sp.stages, sp.chain, ctx, run, sp.final);
}
async function showTrigger(R) {
  bType = R.bonusType; bonusR = R; baseSnap = snap; setupSplash();
  const astro = bType === 'astrolabe', cells = (R.trigger ? R.trigger.cells : astro ? R.scatters.astro.cells : R.scatters.fs.cells).slice().sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  restAll(); GRID.classList.add('focus');
  cells.forEach(([r, c], i) => { const e = E(r, c); if (!e) return; FX.act(e, i * 130, c); after(i * 130, () => { astro ? sfx.astroLand(i) : sfx.fsLand(i); ring(e, 500); dust(e, 8, .7, GOLD); }); });
  after(cells.length * 130 + 100, () => { sfx.whoosh(); sealCells(cells, 90); });
  say(astro ? `${cells.length} ASTROLABES! THE RINGS AWAKEN` : `${cells.length} FS! ${R.bonus.super ? 'THREE WISHES' : 'FREE WISHES'}`, true); char('special', 1100 * T());
  await wait(cells.length * 130 + 1300); restAll(); GRID.classList.remove('focus');
}

/* ---------- Free Wishes: one chain per spin, the multiplier never resets ---------- */
async function fsSpin(sp, run0, ctx) {
  const dec = sp.spinsLeft - (sp.retrigger || 0); setFs(dec, true); char('spin', 950 * T());
  say(`FREE WISH · CHAIN ×${sp.multStart}`, true);
  let run = await playChain(sp.stages, sp.chain, ctx, run0, sp.totalPayout, { bonus: true, sp });
  if (sp.multEnd !== curMult) { setMult(sp.multEnd, true); sfx.climb(sp.multEnd); }
  S.music.intensity(clamp01(.3 + sp.multEnd / 30 + (sp.spinIndex / fsTotal) * .2));
  if (sp.retrigger) {
    const cells = sp.scatters.cells; S.music.stinger('retrig'); sfx.retrig(); char('special', 1400 * T()); shake(1.6); flash(1.6); GRID.classList.add('focus');
    cells.forEach(([r, c], i) => { const e = E(r, c); if (e) { FX.act(e, i * 90, c); ring(e, 600); dust(e, 8, .8, GOLD); } });
    banner(`+${sp.retrigger} WISHES!`, 'THE SUN BLAZES AGAIN', 1900, true); say(`MORE SUNS! +${sp.retrigger} WISHES`, true); await wait(700);
    const fb = $('fsBox').getBoundingClientRect(), to = toLocal(fb.left + fb.width / 2, fb.top + fb.height / 2), from = cellC(...cells[0]);
    await fly(from, to, '+' + sp.retrigger, 0); fsTotal += sp.retrigger; setFs(sp.spinsLeft, true); sfx.reset(); await wait(450); restAll(); GRID.classList.remove('focus');
  }
  if (sp.spinsLeft === 0) { say('THE LAST WISH IS SPENT', true); await wait(420); }
  return run;
}

/* ---------- Astrolabe of Wishes: three rings stop one after another ---------- */
const ringEl = k => document.querySelector('#astro .ring.r' + (k + 1));
const secEl = (k, i) => ringEl(k).querySelector(`.sec[data-i="${i}"]`);
const CORE_ART = { grand: 0, major: 2, minor: 4, mini: 6 };      // art sector of each prize on the core ring (empty sectors: 1, 3, 5, 7)
function initAstro(B) {
  const o = B.rings.outer, m = B.rings.middle;
  o.forEach((v, i) => { const t = $('ro' + i); if (t) t.textContent = v + '×'; }); m.forEach((v, i) => { const t = $('rm' + i); if (t) t.textContent = '×' + v; });
  const J = INFO.astro.jackpot; ['grand', 'major', 'minor', 'mini'].forEach(k => { const b = document.querySelector(`#aJ .j.${k} b`); if (b) b.textContent = J[k].toLocaleString('en-US') + '×'; });
  [0, 1, 2].forEach(k => { const r = ringEl(k); r.classList.remove('go', 'magnet'); r.style.setProperty('--a', 0); ringAng[k] = 0; magnetFx(k, false); });
  $('astro').classList.remove('tense'); resetTally(); $('aHubT').textContent = 'WISH'; $('aHubS').textContent = '';
}
function resetTally() { $('aCash').textContent = '–'; $('aMult').textContent = '–'; $('aWish').textContent = '–'; $('aTotal').textContent = fmt(0); document.querySelectorAll('#aJ .j').forEach(j => j.classList.remove('lit')); }
const tallyPop = () => { const t = $('aTally'); t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump'); setTimeout(() => t.classList.remove('bump'), 520 * T()); };
function turnRing(k, sector, n, secs, extra) {                   // spin ring k so that `sector` ends under the pointer (12 o'clock), always turning the same way
  const r = ringEl(k), base = -(sector * 360 / n), m = Math.ceil((ringAng[k] - base) / 360), target = base - 360 * (Math.max(0, m) + extra);
  ringAng[k] = target; r.classList.add('go'); r.style.setProperty('--t', (secs * T()).toFixed(2) + 's'); r.style.setProperty('--a', target);
  return new Promise(res => { void r.offsetWidth; const an = r.getAnimations().filter(a => a.transitionProperty === 'transform'); let rate = 1; const iv = setInterval(() => { if (S.isTurbo() && rate === 1) { rate = 4; an.forEach(a => a.updatePlaybackRate(4)); } }, 90);
    Promise.all(an.map(a => a.finished.catch(() => {}))).then(() => { clearInterval(iv); res(); }); if (!an.length) { clearInterval(iv); setTimeout(res, secs * 1000 * T()); } });
}
const MAGR = [283, 205];                                           // mid radius of the outer / middle ring (700 box)
const topThird = vals => vals.map((v, i) => i).sort((a, b) => vals[b] - vals[a] || a - b).slice(0, Math.round(vals.length / 3));
function magnetFx(k, on, vals) {                                   // best-third sectors glow, golden comets are pulled from them to the pointer (12 o'clock)
  const g = $('aMag' + k); if (!g) return; g.innerHTML = ''; ringEl(k).querySelectorAll('.sec.mag').forEach(x => x.classList.remove('mag'));
  if (!on || !vals) return;
  const n = vals.length, step = 360 / n, P = (r, a) => [350 + r * Math.sin(a * Math.PI / 180), 350 - r * Math.cos(a * Math.PI / 180)], p0 = P(MAGR[k], 0); let h = '';
  topThird(vals).forEach((i, j) => { const sc = secEl(k, i); if (sc) sc.classList.add('mag'); const th = (((ringAng[k] + i * step) % 360) + 360) % 360; if (th < 8 || th > 352) return;
    const p = P(MAGR[k], th), R = MAGR[k], d = `M${p[0].toFixed(1)},${p[1].toFixed(1)} A${R},${R} 0 0 ${th < 180 ? 0 : 1} ${p0[0].toFixed(1)},${p0[1].toFixed(1)}`, dl = `animation-delay:${(j * .14).toFixed(2)}s`;
    h += `<path class="mg1" pathLength="1" d="${d}" style="${dl}"/><path class="mg2" pathLength="1" d="${d}" style="${dl}"/><circle class="mgh" r="9" style="offset-path:path('${d}');${dl}"/>`; });
  h += `<circle class="mgp" cx="${p0[0].toFixed(1)}" cy="${p0[1].toFixed(1)}" r="26"/>`; g.innerHTML = h;
}
function ringHit(k, sector) {
  const s = secEl(k, sector); if (s) { s.classList.add('hit'); } const p = document.querySelector('#astro .aPtr'); p.classList.remove('pulse'); void p.getBoundingClientRect(); p.classList.add('pulse'); setTimeout(() => p.classList.remove('pulse'), 520 * T());
  sfx.ringStop(k); shake(.3 + k * .15);
}
async function astroSpin(sp, run0, ctx) {
  const stake = ctx.stake, B = bonusR.bonus, top = Math.min(MAXW * stake, run0 + sp.totalPayout * stake), A = $('astro'); let run = run0;
  setFs(sp.spinsLeft, true); resetTally(); $('aHubT').textContent = '...'; $('aHubS').textContent = ''; A.classList.remove('tense');
  document.querySelectorAll('#astro .sec.hit').forEach(s => s.classList.remove('hit'));
  const mg = sp.magnet || {}; ringEl(0).classList.toggle('magnet', !!mg.outer); ringEl(1).classList.toggle('magnet', !!mg.middle); magnetFx(0, !!mg.outer, B.rings.outer); magnetFx(1, !!mg.middle, B.rings.middle);
  say(mg.outer || mg.middle ? `SPIN ${sp.spinIndex} OF ${B.startSpins} · THE MAGNET PULLS` : `SPIN ${sp.spinIndex} OF ${B.startSpins}`, true); if (mg.outer || mg.middle) sfx.magnet();
  sfx.ringSpin(); S.music.intensity(clamp01(.25 + sp.spinIndex / B.startSpins * .5));
  const coreSector = sp.core.kind ? CORE_ART[sp.core.kind] : 1 + 2 * (sp.core.idx >> 1);
  const pO = turnRing(0, sp.outer.idx, B.rings.outer.length, 2.6, 4), pM = turnRing(1, sp.middle.idx, B.rings.middle.length, 3.5, 4), pC = turnRing(2, coreSector, 8, 5.4, 5);
  await pO; ringHit(0, sp.outer.idx); $('aCash').textContent = sp.outer.value + '×'; tallyPop(); $('aHubT').textContent = sp.outer.value + '×'; ringEl(0).classList.remove('magnet'); magnetFx(0, false); await wait(350);
  await pM; ringHit(1, sp.middle.idx); $('aMult').textContent = '×' + sp.middle.value; tallyPop(); $('aHubT').textContent = '×' + sp.middle.value; ringEl(1).classList.remove('magnet'); magnetFx(1, false);
  const cashV = sp.outer.value * sp.middle.value; $('aTotal').textContent = fmt(cashV * stake); A.classList.add('tense'); sfx.tense(); say('THE CORE TURNS... HOLD YOUR BREATH', true);
  await pC; A.classList.remove('tense'); ringHit(2, coreSector);
  if (sp.core.jackpot) {
    const kind = sp.core.kind, nm = kind.toUpperCase(); $('aHubT').textContent = nm; $('aHubS').textContent = sp.core.jackpot.toLocaleString('en-US') + '×'; $('aWish').textContent = nm + ' ' + sp.core.jackpot.toLocaleString('en-US') + '×'; tallyPop();
    const j = document.querySelector(`#aJ .j.${kind}`); if (j) j.classList.add('lit'); sfx.jackpot(kind); S.music.stinger('jackpot'); shake(1.2 + (kind === 'grand' ? 2 : kind === 'major' ? 1 : 0)); flash(1.4); embers(kind === 'grand' ? 160 : 80, innerWidth / 2, innerHeight / 2, true);
    banner(nm + ' WISH!', `+${sp.core.jackpot.toLocaleString('en-US')}× YOUR BET`, 2000, true); await wait(1200);
  } else { $('aHubT').textContent = 'NO WISH'; $('aWish').textContent = 'none'; await wait(350); }
  const total = sp.totalPayout * stake; await Promise.all([S.countUp($('aTotal'), total, 900 * T() + 200, cashV * stake * 0, k => sfx.tick(k)), S.countUp($('win'), top, 900 * T() + 200, run)]); ctx.onWin(run, top); run = top; tallyPop();
  say(`SPIN PRIZE ${fmt(total)}${sp.core.jackpot ? ' · ' + sp.core.kind.toUpperCase() + ' WISH' : ''}`, true); await wait(sp.core.jackpot ? 1200 : 700);
  if (sp.spinsLeft === 0) { say('THE ASTROLABE FALLS STILL', true); await wait(500); }
  return run;
}

/* ---------- splashes: Sirocco's portraits, per-bonus copy ---------- */
const splashSvg = sup => `<svg class="sirSplash${sup ? ' super' : ''}" viewBox="-50 20 600 520"><use href="#sirSplash${sup ? 'Super' : ''}"/></svg>`;
function setupSplash() {
  const B = bonusR.bonus, astro = bType === 'astrolabe', sup = !!B.super, I = S.cfg.intro, q = (id, t) => { const e = $(id).querySelector('.quote'); if (e) e.textContent = t; };
  ['introM', 'outroM'].forEach(id => $(id).classList.toggle('sup', sup));
  $('introLbl').textContent = astro ? 'SPINS' : 'WISHES'; $('introGems').querySelectorAll('use').forEach(u => u.setAttribute('href', astro ? '#s11' : '#s10'));
  $('introRibbon').textContent = astro ? 'ASTROLABE OF WISHES' : sup ? 'THREE WISHES' : 'FREE WISHES';
  const sc = INFO.fs;
  $('introChips').innerHTML = (astro ? [`${B.scatters} ASTROLABES: ${B.startSpins} SPINS`, 'OUTER RING: CASH. MIDDLE RING: MULTIPLIER', 'THE CORE MAY LIGHT A WISH: MINI, MINOR, MAJOR, GRAND'] :
    [`${B.scatters} FS: ${B.startSpins} FREE WISHES${sup ? ' (SUPER)' : ''}`, sup ? `CHAIN MULTIPLIER STARTS AT ×${B.startMult}, CAP ×${B.multCap}` : `CHAIN MULTIPLIER NEVER RESETS, CAP ×${B.multCap}`, 'EVERY WINNING LINK RAISES IT BY ONE']).map(c => `<span>${c}</span>`).join('');
  q('introM', astro ? '"Three rings, one pointer, and a sky full of wishes."' : sup ? '"Four suns. Even the lamp is nervous."' : I.quote);
  document.querySelector('#introM .tapHint').textContent = astro ? 'TAP ANYWHERE TO TURN THE RINGS' : I.tap;
  $('outroRibbon').textContent = astro ? 'THE ASTROLABE FALLS STILL' : S.cfg.outro.ribbon;
  document.querySelector('#outroM .mtop').textContent = astro ? 'ASTROLABE WINNINGS' : sup ? 'THREE WISHES WINNINGS' : 'FREE WISHES WINNINGS';
  ['introArt', 'outroArt'].forEach(id => { const e = $(id); if (e) e.innerHTML = splashSvg(sup); });
  fsTotal = B.startSpins;
}

/* ---------- Game Info paytable (engine info() embedded by the build, never retyped) ---------- */
function buildPaytable() {
  const f = v => `<td>${v ? +(+v).toFixed(2) + 'x' : '-'}</td>`, row = (id, name, tds) => `<tr><td><div class="nm"><svg viewBox="0 0 128 128"><use href="#s${id}"/></svg>${name}</div></td>${tds}</tr>`;
  const cs = id => id === 12 ? 's12' : id;
  $('ptab').innerHTML = '<tr><th>SYMBOL</th><th>3 IN A LINE</th><th>4</th><th>5</th></tr>' +
    INFO.pay.map((p, i) => row(i, NAMES[i], p.map(f).join(''))).reverse().join('') +
    row(WILD, 'Djinn Seal (Wild)', `<td colspan="3">Replaces any pay symbol. Lands on reels 2, 3 and 4 only.</td>`) +
    row(FSC, 'FS (Scatter)', `<td colspan="3">3 FS: ${INFO.fs.spins[3]} wishes, 4 FS: ${INFO.fs.spins[4]} (SUPER), 5 FS: ${INFO.fs.spins[5]}. In the bonus, 3+ FS add ${INFO.fs.retrig[3]} spins (4+ add ${INFO.fs.retrig[4]}).</td>`) +
    row(ASTRO, 'Astrolabe (Scatter)', `<td colspan="3">3, 4 or 5 Astrolabes: ${INFO.astro.spins[3]}, ${INFO.astro.spins[4]} or ${INFO.astro.spins[5]} spins of the three rings.</td>`) +
    row(GEM, 'Wish Gem', `<td colspan="3">Values ${INFO.gem.values.map(v => '×' + v).join(', ')}. Max ${INFO.gem.maxGems} per chain. Added together, they multiply the chain win.</td>`);
  const rk = document.getElementById('ptab'); if (rk && INFO.astro) rk.insertAdjacentHTML('afterend', `<p class="ptnote">Astrolabe rings: cash ${INFO.astro.outer.map(v => v + '×').join(' ')} · multiplier ${INFO.astro.middle.map(v => '×' + v).join(' ')} · wishes ${Object.entries(INFO.astro.jackpot).map(([k, v]) => k.toUpperCase() + ' ' + v.toLocaleString('en-US') + '×').join(', ')}. Free Wishes multiplier: start ×${INFO.fs.start} (SUPER ×${INFO.fs.superStart}), cap ×${INFO.fs.cap} (SUPER ×${INFO.fs.superCap}). Pays are multiples of your bet before the chain multiplier.</p>`);
}

/* ---------- sound: Djinn whoosh, lamp rub, seal stamp, chain chimes, gem add, multiply boom, ring stops (all synthesised) ---------- */
return {
  music: musicDefs,
  sfx(kit) {
    const { ctx, bus, env, osc, noise, metal, st, T0 } = kit;
    const PD = [0, 1, 4, 5, 7, 8, 10], D5 = 587.33, N = k => D5 * st(PD[((k % 7) + 7) % 7] + 12 * Math.floor(k / 7)) / 2;   // D Phrygian dominant from D5
    const ting = (f, t, v = .1, d = 1.6) => { metal(f, t, d, v, [1, 2.003, 3.97]); metal(f * 1.004, t + .004, d * .8, v * .5, [1, 2.76]); noise(t, .03, v * .3, 'highpass', 6500, 0, .7, .001); };   // lamp rub: two detuned glass sines + zil shimmer
    const darb = (t, v = .5) => { osc('sine', 150, t, .2, .3 * v, .003, 66); noise(t, .05, .1 * v, 'lowpass', 900, 200, .8, .002); };
    const tek = (t, v = .5) => noise(t, .05, .14 * v, 'highpass', 3600, 0, .8, .001);
    const swell = (t, d, v, f0, f1) => { [0, 7, 12, 16].forEach((s, i) => { const o = ctx.createOscillator(), g = env(t, d * .85, v / (1 + i * .5), d * .3); o.type = 'sine'; o.frequency.setValueAtTime(f0 * st(s) * .99, t); o.frequency.exponentialRampToValueAtTime(f1 * st(s), t + d); o.detune.value = (i % 2 ? 6 : -6); o.connect(g).connect(bus); o.start(t); o.stop(t + d * 1.3 + .1); }); noise(t, d * 1.1, v * .9, 'bandpass', f0 * 1.2, f1 * 3, 1.4, d * .8); };
    /* Djinn whoosh: bandpassed noise sweeping up an octave and a rising five-note Phrygian bell arpeggio */
    const whoosh = (t, v = 1) => { noise(t, .6, .1 * v, 'bandpass', 500, 1900, 1.4, .25); swell(t, .55, .03 * v, 300, 620); [0, 1, 2, 4, 6].forEach((d, i) => ting(N(8 + d), t + .3 + i * .07, .05 * v, 1.4)); };
    const R = {
      ui: () => { const t = T0(); ting(N(9), t, .05, .5); },
      tap: () => { const t = T0(); ting(N(10), t, .05, .4); },
      hit: () => { const t = T0(); noise(t, .07, .12, 'highpass', 3500, 7000, .7); ting(N(11), t, .06, .5); },
      spin: () => { const t = T0(); noise(t, .35, .1, 'bandpass', 300, 1500, .9, .1); osc('sine', 110, t, .3, .1, .05, 70); },
      drop: () => { const t = T0(); noise(t, .5, .08, 'bandpass', 1500, 380, .7, .05); },
      respin: () => { const t = T0(); noise(t, .35, .07, 'bandpass', 900, 300, .8, .04); darb(t + .02, .35); },
      land: c => { const t = T0(); osc('sine', 130 - c * 4, t, .12, .2, .002, 62); noise(t, .05, .12, 'lowpass', 700, 0); if (c % 2) ting(N(7 + c), t + .01, .02, .6); },
      run: (i, m) => { const t = T0(); noise(t, .32, .08, 'bandpass', 700 + i * 160, 3200 + i * 300, 1.2, .1); [0, 2, 4].forEach((d, j) => ting(N(7 + d + Math.min(4, m - 1) + Math.min(i, 3)), t + .1 + j * .07, .07, 1.5)); },
      seal: i => { const t = T0(); osc('sine', 120, t, .3, .45, .002, 50); noise(t, .12, .22, 'lowpass', 1200, 200, .8, .002); metal(980 + i * 40, t + .01, .7, .07, [1, 2.4, 3.9]); noise(t + .01, .05, .1, 'bandpass', 3400, 2000, 1.4, .001); },
      climb: m => { const t = T0(); [0, 2, 4, 6, 7].slice(0, 2 + Math.min(3, m - 1)).forEach((d, i) => ting(N(7 + d + (m - 1)), t + i * .075, .09, 1.8)); osc('sine', 70 + m * 8, t, .5, .22, .01, 46); },
      gemLand: k => { const t = T0(); ting(N(8 + k * 2), t, .1, 2.2); ting(N(8 + k * 2) * 1.5, t + .05, .05, 1.8); noise(t, .06, .08, 'highpass', 8000, 0, .6, .001); },
      gemAdd: (i, sum) => { const t = T0(); ting(N(10 + i * 2 + Math.min(4, Math.floor(sum / 6))), t, .11, 1.6); ting(N(14 + i * 2), t + .06, .06, 1.2); osc('sine', 360 + i * 70, t, .1, .08, .004, 700); },
      multBoom: () => { const t = T0(); osc('sine', 78, t, 1, .5, .004, 34); osc('sine', 40, t + .02, 1.1, .35, .02, 26); noise(t, .5, .2, 'lowpass', 1400, 120, .8, .003); [0, 2, 4, 6, 7].forEach((d, i) => ting(N(7 + d), t + i * .06, .11, 2.6)); swell(t, .6, .05, 260, 900); },
      countRise: d => { const t = T0(); swell(t, d, .035, 220, 880); for (let i = 0; i < 6; i++) tek(t + i * d / 6, .4); },
      fizzle: () => { const t = T0(); osc('sine', 520, t, .7, .1, .01, 90); noise(t, .6, .08, 'bandpass', 3000, 400, 1, .02); },
      fsLand: k => { const t = T0(); osc('sine', 150, t, .22, .3, .003, 70); noise(t, .12, .12, 'bandpass', 2400, 900, 1.1, .002); for (let i = 0; i < 4; i++) osc('sine', 900 + Math.random() * 1400, t + .02 + i * .03, .05, .02, .002); ting(N(7 + k * 2), t + .03, .09, 1.4); },
      astroLand: k => { const t = T0(); osc('sine', 110, t, .3, .26, .003, 60); metal(520 + k * 120, t, 1.6, .09, [1, 2.756, 5.404]); ting(N(9 + k * 2), t + .04, .07, 1.8); },
      beat: () => { const t = T0(); osc('sine', 62, t, .2, .32, .006, 38); osc('sine', 62, t + .22, .2, .22, .006, 38); noise(t, .5, .05, 'bandpass', 500, 2600, 1.2, .2); darb(t + .12, .3); },
      whoosh: () => whoosh(T0()),
      retrig: () => { const t = T0(); whoosh(t, .8); for (let i = 0; i < 5; i++) osc('sine', 130 + i * 14, t + i * .09, .25, .2, .004, 60); [0, 2, 3, 4, 5, 7].forEach((n, i) => ting(N(8 + n), t + .3 + i * .06, .08, 1.6)); },
      reset: () => { const t = T0(); [0, 2, 4, 6].forEach((n, i) => ting(N(7 + n), t + i * .06, .07, 1.2)); osc('sine', 130, t, .3, .16, .01, 60); },
      ringSpin: () => { const t = T0(); noise(t, 1.4, .07, 'bandpass', 400, 2400, 1.1, .5); for (let i = 0; i < 14; i++) tek(t + i * .11, .3 + i / 30); osc('sine', 90, t, 1.2, .1, .3, 160); },
      magnet: () => { const t = T0(); swell(t, .8, .04, 200, 700); noise(t, .8, .05, 'bandpass', 800, 3200, 1.5, .4); },
      ringStop: k => { const t = T0(), f = [1, .8, .62][k]; osc('sine', 150 * f, t, .3, .35, .002, 60); noise(t, .06, .18, 'bandpass', 2400, 1200, 1.4, .001); metal(660 * f, t, 1.6, .1, [1, 2.4, 4.1]); ting(N(7 + k * 2), t + .03, .08, 1.8); },
      tense: () => { const t = T0(); swell(t, 1.6, .04, 160, 500); for (let i = 0; i < 6; i++) osc('sine', 62, t + i * .28, .2, .12 + i * .03, .006, 40); },
      jackpot: kind => { const t = T0(), n = { mini: 4, minor: 5, major: 7, grand: 10 }[kind] || 4; osc('sine', 70, t, 1.4, .5, .004, 30); whoosh(t, 1); for (let i = 0; i < n; i++) ting(N(7 + i * 1.4 | 0), t + .3 + i * .09, .1, 2.8); darb(t + .1, .8); darb(t + .4, .8); },
      reveal: () => { const t = T0(); for (let i = 0; i < 8; i++) ting(N(14 - i), t + i * .08, .05, 1.2); swell(t, .9, .025, 200, 400); },
      bonus: () => { const t = T0(); osc('sine', 75, t, 1.2, .4, .01, 37); whoosh(t, 1.2); [0, 2, 4, 5, 7, 9].forEach((n, i) => ting(N(7 + n), t + .6 + i * .09, .09, 2.4)); },
      outro: () => { const t = T0(); [7, 5, 3, 0].forEach((n, i) => ting(N(7 + n), t + i * .2, .08, 2.4)); swell(t + .2, 1, .02, 400, 260); },
      big: lv => { const t = T0(); swell(t, 1 + lv * .25, .06, 200, 800); for (let i = 0; i < lv + 3; i++) ting(N(7 + i * 2), t + .4 + i * .16, .09, 2.4); for (let i = 0; i < 2 + lv; i++) { darb(t + i * .3, .9); osc('sine', 80, t + i * .3, .5, .3, .005, 36); } },
      tick: k => { const t = T0(); osc('triangle', 650 + k * 900, t, .05, .08, .001); ting(1500 + k * 1200, t, .025, .3); },
      feverOn: () => whoosh(T0(), .7)
    };
    return R;
  },
  /* a faint desert wind and, now and then, a far zil or an oud pluck */
  ambience(kit) {
    const { ctx, metal } = kit; const bed = kit.bed({ lowpass: 600, gain: .3, level: .02, loopSec: 5 });
    let tm = 0, run = false;
    const chime = () => { if (!run) return; if (!S.isTurbo()) { const t = ctx.currentTime + .02, f = [1174, 1319, 1480, 1760, 2093][Math.floor(Math.random() * 5)]; metal(f, t, 3, .012, [1, 2.003]); if (Math.random() < .5) metal(f * 1.5, t + .35, 2.6, .008, [1, 2.003]); }
      tm = setTimeout(chime, 8000 + Math.random() * 14000); };
    return { start() { run = true; bed.start(); clearTimeout(tm); tm = setTimeout(chime, 4000); }, stop() { run = false; clearTimeout(tm); bed.stop(); } };
  },
  particleColor: (p, a) => p.c ? `rgba(255,${226 + (p.l % 20)},150,${a})` : `rgba(255,${176 + (p.l % 40)},${70 + (p.l % 30)},${a})`,
  init() {
    $('fxl').insertAdjacentHTML('beforeend', '<div id="sirBanner"><b></b><small></small></div><div id="sirMulti"><small></small><b></b></div>');
    buildPaytable();
  },
  paintIdle() {
    const g = [[2, 5, 0, 4, 1], [7, 3, 6, 9, 2], [0, 8, 3, 5, 6], [4, 1, 7, 12, 0], [5, 2, 8, 3, 1]];
    paint(g, [{ r: 3, c: 3, value: 5 }], null); allEls().forEach(e => FX.drop(e, dropOpt(e, e._c * 92))); takeSnap(g, [{ r: 3, c: 3, value: 5 }]);
  },
  splashArt: () => splashSvg(false),
  roundStart() { GRID.classList.remove('chain', 'focus'); clearOverlays(); inBonus = false; bType = null; setMult(1); setGems(0); $('chain').classList.remove('fs'); $('astro').classList.remove('on', 'tense'); $('stage').classList.remove('astroOn'); $('sirMulti').classList.remove('on'); },
  clearBoard: async () => {
    if (inBonus && bType === 'astrolabe') { if (!bonusOpened) { bonusOpened = true; await dropOut(); initAstro(bonusR.bonus); $('stage').classList.add('astroOn'); $('astro').classList.add('on'); sfx.whoosh(); await wait(1100); } return; }
    await dropOut();
  },
  restoreBoard() { if (snap) paint(snap.grid, snap.gems, snap.sealed); },
  baseSpin: R => ({ base: true, grid: R.initialGrid, stages: R.stages || [], chain: R.chain, final: R.basePayout }),
  playSpin: (sp, run, ctx) => sp.outer ? astroSpin(sp, run, ctx) : sp.base ? baseSpin(sp, run, ctx) : fsSpin(sp, run, ctx),
  showTrigger,
  bonusMode(on) {
    inBonus = on; bonusOpened = false; const astro = bType === 'astrolabe';
    $('scene').classList.toggle('bonus', on);
    if (on) {
      char('bonus', 1400 * T()); const B = bonusR.bonus; document.querySelector('#fsBox small').textContent = astro ? 'SPINS LEFT' : 'WISHES LEFT'; setFs(B.startSpins); fsTotal = B.startSpins;
      S.music.intensity(.3); if (!astro) { $('chain').classList.add('fs'); setMult(B.startMult || 1, true); setGems(0); }
    } else {
      S.music.intensity(0); $('astro').classList.remove('on', 'tense'); $('stage').classList.remove('astroOn'); $('chain').classList.remove('fs'); setMult(1); setGems(0);
      if (baseSnap) { paint(baseSnap.grid, baseSnap.gems, baseSnap.sealed); allEls().forEach(e => FX.drop(e, dropOpt(e, e._c * 70))); }   // the trigger board comes back behind the outro
    }
  }
};
});
