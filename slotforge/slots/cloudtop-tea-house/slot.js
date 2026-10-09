/* Koji's Cloudtop Tea House. The only slot-specific client logic; the shell (shell/slot-shell.js) calls these hooks.
 * Pure renderer: the engine/server returns the whole round (grid, bundle flip, wins with cells, Tin Rush steps); nothing here computes an outcome.
 * Round payload: plans/cloudtop-tea-house/01-round-format.md. Art geometry: slots/cloudtop-tea-house/ART-NOTES.md. */
SlotShell.boot(SLOT_CFG, S => {
const { $, sfx, wait, T, say, shake, flash, embers, coins, char, pop, fmt, sleep } = S;
const ROWS = 4, COLS = 5, WILD = 8, BUNDLE = 9, TIN = 10, COLL = 11, GRAND = 15, FSS = 16;
const KIND_SYM = { value: 10, collector: 11, mini: 12, minor: 13, major: 14 };
const FX = S.fx, GRID = $('grid'), CW = 128, CH = 128, MAXW = S.cfg.maxWin, INFO = S.cfg.engineData.info;
let lastGrid = null, inBonus = false, bonusOpened = false, rushLeft = 3, resets = 0, tinsNow = 0;
let bType = null, bonusR = null, fsBoost = [0], fsMax = 3, fsLv = null;   // bType: 'tin' | 'fs' | 'super' (set by showTrigger, so the music/splash getters can follow it)
const FSI = INFO.fsBonus;
const board = new Map();   // bonus board: cell index -> {kind, value}
const cells = [];
const at = (r, c) => cells[r * COLS + c];
const after = (ms, fn) => setTimeout(fn, ms * T());
const ctrG = (r, c) => [(c + .5) * CW, (r + .5) * CH];
const scr = (r, c) => { const b = at(r, c).getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };
const ALL = [].concat(...Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => [r, c])));
const cnt = n => `${n} ${n === 1 ? 'POUR' : 'POURS'} LEFT`;
/* ---------- kai: presentation helpers (everything here is look only; no outcome is computed) ---------- */
const LITE = document.body.classList.contains('lite'), lt = n => LITE ? Math.max(1, Math.ceil(n * .5)) : n;
const BCLS = { tin: 'ctTin', fs: 'ctFs', super: 'ctSup' }; let curStake = 1;
const envEl = () => document.getElementById('bonusEnv');
function setEnv(type) { const e = envEl(); if (!e) return; if (type) e.dataset.bonus = type; else { delete e.dataset.bonus; e.style.removeProperty('--envPulse'); } }
function envPulse(v) { const e = envEl(); if (e) e.style.setProperty('--envPulse', v); }
const plaqueHit = () => $('fsBox').animate([{ transform: 'none' }, { transform: 'scale(1.2) rotate(-2deg)', offset: .18 }, { transform: 'scale(.96)', offset: .4 }, { transform: 'none' }], { duration: 900 * T(), easing: 'ease-out' });
const holdOff = () => document.body.classList.remove('ctHold', 'ctAnt');

/* ---------- MUSIC: "morning on the cliff" (base, 92 bpm) and "kite weather" (Tin Rush, 128 bpm); D Hirajoshi (D E F A Bb) ---------- */
function musicDefs() {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const KP = [[0, 2, 3, 2], [1, 3, 2, 0], [2, 3, 4, 3], [2, 1, 0, -2], [0, 2, 3, 5], [4, 3, 2, 1], [3, 2, 1, 0], [0, -2, 0, -1]];
  const SH = [[4, 3, 2], [3, 2, 0], [5, 4, 3], [2, 1, 0]];   // shakuhachi phrase heads (scale degrees, octave +1)
  const zen = {
    tempo: 92, barBeats: 4, spb: 8, swing: .22, bars: 16, key: 62, scale: [0, 2, 3, 7, 8], seed: 31, gain: .85, phrase: 8,
    layers: { drone: { gain: 1, wet: .3 }, koto: { gain: 1, wet: .3 }, tok: { enter: 1, gain: 1, wet: .1 }, snap: { enter: 2, gain: 1, wet: .08 }, shaku: { enter: 4, gain: 1, wet: .45 }, taiko: { gain: 1, wet: .25 }, hi: { int: .35, gain: 1, wet: .35 } },
    bar(M) {
      const k = M.i & 7, ph = M.i >> 3, wk = clamp(M.walk, -1, 1), p = KP[k];
      if (k % 2 === 0) M.pad('drone', M.t0, M.bd * 2, k % 4 === 2 ? [38, 50, 45] : [38, 50], { wave: 'sawtooth', cut: 230, q: .4, a: 1.4, r: 1.6, g: .05, det: 6 });
      [0, 3, 4, 6].forEach((s, j) => { if (j === 2 && M.rnd() < .25) return; M.koto('koto', M.st(s), M.note(p[j] + (ph && j === 3 ? wk : 0), 0), { g: .07, d: 1.3 }); });
      if (k % 2 === 0) M.koto('koto', M.st(0), M.note(p[0], -1), { g: .08, d: 1.6 });
      M.tok('tok', M.st(3), .5, { f: 1000 }); M.tok('tok', M.st(7), .35, { f: 1250 }); if (k % 4 === 3) M.tok('tok', M.st(5), .25, { f: 900 });
      M.shaker('snap', M.st(2), .5); M.shaker('snap', M.st(6), .4); if (k % 2) M.shaker('snap', M.st(5), .2);
      if (k % 4 === 0) { const h = SH[(M.i >> 2) & 3]; M.shaku('shaku', M.st(0), 2.6 * 60 / 92 + 1.4 * 60 / 92 * 0, M.note(h[0] + wk, 1), { g: .045 }); M.shaku('shaku', M.st(6), 1.6, M.note(h[1], 1), { g: .035, a: .3 }); }
      if (k % 4 === 1) M.shaku('shaku', M.st(0), 2.2, M.note(SH[(M.i >> 2) & 3][2], 1), { g: .035, a: .2 });
      if (k === 0 && M.pass === 0) M.taiko('taiko', M.st(0), .35, { g: .3, f0: 146.8, f1: 73.4 });
      if (M.int > .35) [0, 2, 4, 6].forEach(s => M.koto('hi', M.st(s) + .01, M.note(p[(s >> 1)] + 2, 1), { g: .035, d: .9 }));
    }
  };
  const ARP = [[0, 2, 3, 4], [2, 3, 4, 3], [0, 3, 2, 4], [4, 3, 2, 0]];
  const rush = {
    tempo: 128, barBeats: 4, spb: 16, swing: 0, bars: 16, key: 62, scale: [0, 2, 3, 7, 8], seed: 53, gain: .8, phrase: 4,
    layers: { drone: { gain: 1, wet: .2 }, taiko: { gain: 1, wet: .22 }, arp: { gain: 1, wet: .25 }, tok: { gain: 1, wet: .1 }, shaku: { int: .4, gain: 1, wet: .4 }, hi: { int: .6, gain: 1, wet: .3 }, fill: { int: .78, gain: 1, wet: .2 } },
    bar(M) {
      const k = M.i & 3, ph = (M.i >> 2) & 3, a = ARP[ph], wk = clamp(M.walk, -1, 1);
      M.pad('drone', M.t0, M.bd, [38, 45, 50], { wave: 'sawtooth', cut: 280, q: .4, a: .5, r: .6, g: .05, det: 5 });
      const TK = { f0: 146.8, f1: 73.4 }; M.taiko('taiko', M.st(0), 1, { g: .42, ...TK }); M.taiko('taiko', M.st(8), .85, { g: .42, ...TK }); M.taiko('taiko', M.st(6), .22, TK); M.taiko('taiko', M.st(14), .25, TK); if (M.rnd() < .5) M.taiko('taiko', M.st(11), .15, TK);
      for (let s = 0; s < 16; s++) { const deg = a[s % 4] + (s >= 8 ? 1 : 0) + (k === 3 && s >= 12 ? 1 : 0); M.koto('arp', M.st(s), M.note(deg + wk * (s > 7 ? 1 : 0), s % 8 < 4 ? 0 : 1), { g: s % 4 === 0 ? .06 : .04, d: .42 }); }
      [2, 6, 10, 14].forEach(s => M.tok('tok', M.st(s), .5, { f: s % 8 === 2 ? 1100 : 1350 }));
      if (k % 2 === 0) M.shaku('shaku', M.st(0), 1.7, M.note(SH[ph][k >> 1] + 1, 1), { g: .04, a: .12 });
      if (M.int > .6) [0, 4, 8, 12].forEach(s => M.koto('hi', M.st(s) + .008, M.note(a[(s >> 2)] + 2, 2), { g: .035, d: .5 }));
      if (k === 3) [12, 13, 14, 15].forEach((s, j) => M.taiko('fill', M.st(s), .55 + j * .12, { f0: 146.8 * (1 + j * .1), f1: 73.4, d: .3 }));
      if (rushLeft <= 1) M.riser('riser', M.t0, M.bd, { g: .05, f1: 250, f2: 4200 });
    }
  };
  const stingers = {
    win(K) { const { V, dest, t } = K; [0, 2, 3].forEach((d, i) => V.koto(dest, t + i * .11, K.note(d, 1), { g: .08, d: 1 })); V.tok(dest, t + .36, .6); },
    bonus(K) { const { V, dest, t } = K; V.taiko(dest, t, 1, { g: .4 }); [0, 1, 2, 3, 4, 5, 6, 7].forEach((d, i) => V.koto(dest, t + .15 + i * .07, K.note(d, 1), { g: .06, d: 1.1 })); V.shaku(dest, t + .5, 1.8, K.note(4, 1), { g: .06 }); },
    outro(K) { const { V, dest, t } = K; [3, 2, 0, -2].forEach((d, i) => V.koto(dest, t + i * .22, K.note(d, 1), { g: .07, d: 1.5 })); V.metal(dest, t + .7, K.mtof(74), 2.2, .08); },
    grand(K) { const { V, dest, t } = K; V.metal(dest, t, K.mtof(50), 3, .16, [1, 2.4, 4.1, 6.7]); for (let i = 0; i < 12; i++) V.taiko(dest, t + .4 + i * (.3 - i * .014), .5 + i * .05, { g: .3 }); for (let i = 0; i < 14; i++) V.koto(dest, t + .5 + i * .06, K.note(i, 1), { g: .06, d: 1.2 }); V.shaku(dest, t + 1, 2.2, K.note(4, 2), { g: .06 }); }
  };
  /* FREE SPINS "steeping" (112 bpm) and SUPER "golden dusk" (142 bpm): same Hirajoshi, layers come in with the drawer levels (game intensity) */
  const AR2 = [[0, 2, 3, 4], [2, 3, 4, 2], [0, 3, 4, 3], [4, 3, 2, 0]];
  const TKs = { f0: 146.8, f1: 73.4 };
  const steep = {
    tempo: 112, barBeats: 4, spb: 8, swing: .12, bars: 16, key: 62, scale: [0, 2, 3, 7, 8], seed: 71, gain: .8, phrase: 4,
    layers: { drone: { gain: 1, wet: .25 }, koto: { gain: 1, wet: .28 }, tok: { gain: 1, wet: .1 }, taiko: { int: .08, gain: 1, wet: .22 }, shaku: { int: .3, gain: 1, wet: .4 }, hi: { int: .5, gain: 1, wet: .3 }, fill: { int: .75, gain: 1, wet: .2 } },
    bar(M) {
      const k = M.i & 3, a = AR2[(M.i >> 2) & 3], wk = clamp(M.walk, -1, 1), I = M.int;
      M.pad('drone', M.t0, M.bd, k % 2 ? [38, 45] : [38, 50, 45], { wave: 'sawtooth', cut: 240 + I * 160, q: .4, a: .8, r: 1, g: .05, det: 5 });
      for (let s = 0; s < 8; s++) M.koto('koto', M.st(s), M.note(a[s % 4] + (s >= 4 ? wk : 0), s % 4 === 0 ? 0 : 1), { g: s % 4 === 0 ? .065 : .04, d: .5 });
      M.tok('tok', M.st(2), .5, { f: 1050 }); M.tok('tok', M.st(6), .4, { f: 1300 });
      M.taiko('taiko', M.st(0), .7 + I * .3, { g: .3 + I * .15, ...TKs }); if (I > .4) M.taiko('taiko', M.st(4), .55, { g: .3, ...TKs });
      if (k === 0 || k === 2) M.shaku('shaku', M.st(0), 2.2, M.note(SH[(M.i >> 1) & 3][k >> 1] + 1, 1), { g: .04, a: .2 });
      if (I > .5) [0, 2, 4, 6].forEach(s => M.koto('hi', M.st(s) + .01, M.note(a[s >> 1] + 2, 2), { g: .032, d: .6 }));
      if (k === 3) [4, 5, 6, 7].forEach((s, j) => M.taiko('fill', M.st(s), .45 + j * .12, { f0: 146.8 * (1 + j * .1), f1: 73.4, d: .3 }));
    }
  };
  const sup = {
    tempo: 142, barBeats: 4, spb: 16, swing: 0, bars: 16, key: 59, scale: [0, 2, 3, 7, 8], seed: 97, gain: .62, phrase: 4,
    layers: { drone: { gain: 1, wet: .2 }, taiko: { gain: 1, wet: .22 }, arp: { gain: 1, wet: .25 }, tok: { gain: 1, wet: .1 }, bell: { int: .2, gain: 1, wet: .4 }, shaku: { int: .35, gain: 1, wet: .4 }, hi: { int: .55, gain: 1, wet: .3 }, fill: { int: .8, gain: 1, wet: .2 } },
    bar(M) {
      const k = M.i & 3, ph = (M.i >> 2) & 3, a = ARP[ph], wk = clamp(M.walk, -1, 1), I = M.int;
      M.pad('drone', M.t0, M.bd, [35, 42, 47, 54], { wave: 'sawtooth', cut: 300 + I * 260, q: .5, a: .4, r: .6, g: .06, det: 7 });
      const T2 = { f0: 138.6, f1: 69.3 }; [0, 6, 8, 14].forEach((s, j) => M.taiko('taiko', M.st(s), j % 2 ? .6 : 1, { g: .46, ...T2 })); if (I > .3) [3, 11].forEach(s => M.taiko('taiko', M.st(s), .35, T2));
      for (let s = 0; s < 16; s++) { const deg = a[s % 4] + (s >= 8 ? 1 : 0); M.koto('arp', M.st(s), M.note(deg + wk * (s > 7 ? 1 : 0), s % 8 < 4 ? 0 : 1), { g: s % 4 === 0 ? .065 : .042, d: .38 }); }
      [2, 6, 10, 14].forEach(s => M.tok('tok', M.st(s), .55, { f: s % 8 === 2 ? 1150 : 1400 }));
      if (k % 2 === 0) M.metal('bell', M.st(0), M.mtof(M.note(a[0] + 5, 2)), 1.8, .06);
      if (k % 2 === 0) M.shaku('shaku', M.st(0), 1.8, M.note(SH[ph][k >> 1] + 2, 1), { g: .042, a: .1 });
      if (I > .55) [0, 4, 8, 12].forEach(s => M.koto('hi', M.st(s) + .008, M.note(a[s >> 2] + 3, 2), { g: .035, d: .5 }));
      if (k === 3) [10, 11, 12, 13, 14, 15].forEach((s, j) => M.taiko('fill', M.st(s), .5 + j * .1, { f0: 138.6 * (1 + j * .08), f1: 69.3, d: .26 }));
    }
  };
  stingers.steep = K => { const { V, dest, t } = K; [0, 2, 4].forEach((d, i) => V.koto(dest, t + i * .09, K.note(d + 2, 1), { g: .07, d: .9 })); V.tok(dest, t + .3, .6); };
  stingers.retrig = K => { const { V, dest, t } = K; V.taiko(dest, t, 1, { g: .4 }); [0, 2, 3, 4, 5, 7].forEach((d, i) => V.koto(dest, t + .1 + i * .06, K.note(d, 1), { g: .06, d: 1 })); V.shaku(dest, t + .4, 1.4, K.note(4, 1), { g: .05 }); };
  /* kai: one trigger and one bonus stinger per bonus, plus big tin / kite launch / top level / end card */
  stingers.trig = K => { const { V, dest, t } = K; V.taiko(dest, t, 1, { g: .45 }); if (bType === 'tin') { [0, 2, 4, 6].forEach((d, i) => V.koto(dest, t + .08 + i * .06, K.note(d + 2, 1), { g: .07, d: 1 })); }
    else if (bType === 'fs') { [0, 1, 2].forEach(i => V.taiko(dest, t + .1 + i * .1, .8, { g: .4 })); V.shaku(dest, t + .2, 1.4, K.note(4, 1), { g: .06 }); }
    else { V.metal(dest, t, K.mtof(47), 3, .14, [1, 2.4, 4.1, 6.7]); [0, 2, 3, 4, 6, 7, 9].forEach((d, i) => V.koto(dest, t + .1 + i * .06, K.note(d + 3, 1), { g: .07, d: 1.6 })); V.shaku(dest, t + .3, 2.2, K.note(7, 1), { g: .07 }); } };
  stingers.end = K => { const { V, dest, t } = K; [4, 2, 0].forEach((d, i) => V.koto(dest, t + i * .18, K.note(d, 1), { g: .07, d: 1.4 })); V.metal(dest, t + .5, K.mtof(bType === 'super' ? 78 : 74), 2, .07); };
  stingers.bigtin = K => { const { V, dest, t } = K; V.metal(dest, t, K.mtof(62), 1.8, .12, [1, 2.76]); [2, 3, 4, 6].forEach((d, i) => V.koto(dest, t + .05 + i * .06, K.note(d + 2, 1), { g: .07, d: 1 })); V.taiko(dest, t, .8, { g: .3 }); };
  stingers.launch = K => { const { V, dest, t } = K; V.shaku(dest, t, 1.4, K.note(4, 1), { g: .07, a: .2 }); [0, 1, 2, 3, 4, 5].forEach((d, i) => V.koto(dest, t + .3 + i * .07, K.note(d + 2, 1), { g: .06, d: .9 })); V.taiko(dest, t + .4, 1, { g: .38 }); };
  stingers.top = K => { const { V, dest, t } = K; V.metal(dest, t, K.mtof(bType === 'super' ? 74 : 69), 2, .1, [1, 2.4, 4.1]); [0, 2, 3, 5, 7].forEach((d, i) => V.koto(dest, t + i * .07, K.note(d + 3, 1), { g: .07, d: 1.1 })); };
  return { base: zen, steep, sup, get bonus() { return bType === 'super' ? sup : bType === 'fs' ? steep : rush; }, stingers };
}

/* ---------- the board: 5 reels x 4 rows ---------- */
function setCell(d, sym, chip, cls = '') {
  FX.reset(d); d.className = 'cell' + (sym === WILD ? ' wild' : '') + cls;
  d.innerHTML = sym == null ? '' : `<svg class="g"><use href="#s${sym}"/></svg>` + (chip != null ? `<span class="m">x${chip}</span>` : '');
}
function paint(grid) { lastGrid = grid; grid.forEach((row, r) => row.forEach((s, c) => setCell(at(r, c), s, null))); GRID.classList.remove('focus'); clearLinks(); }
const dropOpt = (r, c, base = 0) => ({ delay: base + c * 92 + (ROWS - 1 - r) * 34 + Math.random() * 14, dist: (r + 1) * CH + 60, tilt: (Math.random() - .5) * 5, dur: 560 });
function dropCells(list, base = 0) {
  let end = 0; const col = {}, times = {};
  list.forEach(([r, c]) => { const o = dropOpt(r, c, base); FX.drop(at(r, c), o); const t = o.delay + o.dur * .58; times[r * COLS + c] = t; end = Math.max(end, t); col[c] = Math.min(col[c] == null ? 1e9 : col[c], t); });
  Object.keys(col).forEach(c => after(col[c], () => sfx.land(+c)));
  return { end, times };
}
/* reel by reel; once five Tea Tins (one short of Tin Rush) or two FS drums have landed the remaining reels hang a beat with a heartbeat before each lands (near-miss slow drop) */
function dropReels(grid) {
  let base = 0, end = 0, tease = false, seen = 0, seenF = 0, said = false; const times = {};
  for (let c = 0; c < COLS; c++) {
    if (seen >= 5 || seenF >= 2) { if (!tease) after(Math.max(0, base + 60), () => { document.body.classList.add('ctHold'); sfx.hold(); }); tease = true; base += 560; const b0 = base; after(b0 - 500 + c * 92, () => { sfx.beat(); if (!said) { said = true; say('ONE MORE...', true); } shake(.3); }); }
    const r = dropCells(Array.from({ length: ROWS }, (_, i) => [i, c]), base); end = Math.max(end, r.end); Object.assign(times, r.times);
    for (let i = 0; i < ROWS; i++) { if (grid[i][c] === TIN) seen++; else if (grid[i][c] === FSS) seenF++; }
  }
  return { end, tease, times };
}
async function dropOut() {
  clearLinks(); GRID.classList.remove('focus'); let end = 0;
  ALL.forEach(([r, c]) => { const o = { delay: c * 48 + (ROWS - 1 - r) * 26, dist: (ROWS - r) * CH + 90, rot: (c % 2 ? 1 : -1) * (2 + c % 3), dur: 420 }; FX.out(at(r, c), o); end = Math.max(end, o.delay + o.dur); });
  await wait(end * .86);
}
const dropAll = () => dropCells(ALL);

/* ---------- the paper string: a cream paper cord with a vermilion stitch, threaded drawer by drawer, a red bead (mizuhiki knot) at each ---------- */
const lnkB = () => FX.layer('lnkB', 7), lnkT = () => FX.layer('lnkT', 10);
function clearLinks() { ['lnkB', 'lnkT'].forEach(id => { const l = document.getElementById(id); if (l) l.replaceChildren(); }); }
function fadeLinks(ms) { ['lnkB', 'lnkT'].forEach(id => { const l = document.getElementById(id); if (!l) return; [...l.children].forEach(g => { if (g.tagName !== 'defs') g.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(4px)' }], { duration: ms * T(), fill: 'forwards', easing: 'ease-in' }); }); }); setTimeout(clearLinks, (ms + 40) * T()); }
function restCells() { cells.forEach(d => FX.rest(d)); }
let ropeUid = 0;
const bead = (parent, x, y, at0) => {
  const g = FX.el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, parent), k = FX.el('g', {}, g);
  FX.el('circle', { r: 9, fill: '#d9432e', stroke: '#1c2340', 'stroke-width': 3.2 }, k); FX.el('circle', { cx: -3, cy: -3, r: 2.6, fill: '#ffb4a0' }, k);
  FX.el('path', { d: 'M-3 8 L-6 17 M3 8 L5 16', stroke: '#1c2340', 'stroke-width': 3.2, 'stroke-linecap': 'round', fill: 'none' }, k); FX.el('path', { d: 'M-3 8 L-6 17 M3 8 L5 16', stroke: '#d9432e', 'stroke-width': 1.4, 'stroke-linecap': 'round', fill: 'none' }, k);
  k.animate([{ transform: 'scale(.2,1.8)', opacity: 0 }, { transform: 'scale(1.4,.7)', opacity: 1, offset: .35 }, { transform: 'scale(.9,1.14)', offset: .66 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320 * T(), delay: at0 * T(), easing: 'cubic-bezier(.3,0,.3,1)', fill: 'both' });
};
/* list = [[r,c],...] left to right; t0 = ms (unscaled) from now. Returns {arrive:[ms per cell], end} */
function thread(list, t0, wi) {
  const off = wi ? (wi % 2 ? 1 : -1) * 5 : 0, P = list.map(([r, c]) => { const [x, y] = ctrG(r, c); return [x + (Math.random() - .5) * 6, y + 14 + off + (Math.random() - .5) * 6]; });
  const f = P[0], l = P[P.length - 1], pts = [[f[0] - 70, f[1] + 24], ...P, [l[0] + 70, l[1] + 28]];
  const taut = FX.curve(pts, 0), slack = FX.curve(pts, 26), cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = cum[cum.length - 1], draw = 150 + 110 * Math.max(1, list.length - 1), k = T(), B = lnkB(), T2 = lnkT(), id = 'rm' + (++ropeUid);
  const mask = FX.el('mask', { id, maskUnits: 'userSpaceOnUse', x: -300, y: -300, width: 1400, height: 1000 }, FX.el('defs', {}, B)), mp = FX.el('path', { d: taut, fill: 'none', stroke: '#fff', 'stroke-width': 80, 'stroke-linecap': 'round' }, mask);
  const Ln = mp.getTotalLength(); mp.style.strokeDasharray = Ln; mp.animate([{ strokeDashoffset: Ln }, { strokeDashoffset: 0 }], { duration: draw * k, delay: t0 * k, easing: 'linear', fill: 'both' });
  const g = FX.el('g', { mask: `url(#${id})` }, B), mk = (w, col, extra = {}) => FX.el('path', Object.assign({ d: slack, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra), g);
  const strands = [mk(14, '#1c2340'), mk(9, '#fbf1dc'), mk(2.6, '#d9432e', { 'stroke-dasharray': '9 9', 'stroke-linecap': 'butt' }), mk(2, '#fff', { 'stroke-dasharray': '16 22', transform: 'translate(0 -2.6)' })];
  const tw = t0 + draw;   // pulled taut at the end, with a little overshoot, then the string hums
  strands.forEach(p => p.animate([{ d: `path("${slack}")` }, { d: `path("${taut}")` }], { duration: 280 * k, delay: tw * k, easing: 'cubic-bezier(.2,1.7,.4,1)', fill: 'forwards' }));
  g.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)', offset: .2 }, { transform: 'translateY(2.4px)', offset: .45 }, { transform: 'translateY(-1px)', offset: .7 }, { transform: 'none' }], { duration: 420 * k, delay: (tw + 120) * k, easing: 'ease-out' });
  const arrive = [];
  P.forEach((p, i) => { const at0 = t0 + cum[i + 1] / tot * draw; arrive.push(at0); bead(T2, p[0], p[1], at0); });
  return { arrive, end: tw + 280 };
}

/* ---------- little helpers for effects ---------- */
const fxl = () => $('fxl');
function banner(title, sub, ms = 1500, big) {
  const b = $('ctBanner'); b.querySelector('b').textContent = title; b.querySelector('small').textContent = sub || ''; b.classList.toggle('big', !!big);
  b.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3) rotate(-6deg)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.14) rotate(2deg)', offset: .16 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1) rotate(0)', offset: .26 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.02)', offset: .84 }, { opacity: 0, transform: 'translate(-50%,-62%) scale(.96)' }], { duration: ms * T(), easing: 'ease-out' });
}
function chipEl(d) { return d.querySelector('.m'); }
function setChip(d, v, up) { let m = chipEl(d); if (!m) { d.insertAdjacentHTML('beforeend', `<span class="m${up ? ' up' : ''}">x${v}</span>`); m = chipEl(d); } else { m.textContent = 'x' + v; if (up) { m.classList.remove('up'); void m.offsetWidth; m.classList.add('up'); } } return m; }
function ring(d, ms = 650) { d.classList.remove('pulse'); void d.offsetWidth; d.classList.add('pulse'); setTimeout(() => d.classList.remove('pulse'), ms * T()); }
function gold(r, c, n = 10, power = 1) { const [x, y] = scr(r, c); S.shards(x, y, n, ['#f2d23a', '#e9b43c', '#fff1b8', '#d9432e'], { power, edge: 'rgba(28,35,64,.6)' }); }
function flipSym(d, sym) {
  const g = d.querySelector('svg.g'); if (!g) return;
  g.style.transformOrigin = '50% 60%'; g.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(.05) scaleY(1.1)', offset: .5 }, { transform: 'scaleX(1)' }], { duration: 300 * T(), easing: 'ease-in-out' });
  setTimeout(() => { const u = g.querySelector('use'); if (u) u.setAttribute('href', '#s' + sym); }, 150 * T());
}
function pips(n, refill) { const p = $('ctPips'); if (!p) return; [...p.children].forEach((i, k) => { const on = k < n, was = i.classList.contains('on'); i.classList.toggle('on', on);
  if (refill && on && !was) { i.style.setProperty('--d', k * 120 + 'ms'); i.classList.remove('re'); void i.offsetWidth; i.classList.add('re'); } else if (!refill) i.classList.remove('re'); }); }
function setFs(n, bump) { const e = $('fs'); e.textContent = n;
  if (bType === 'tin') { pips(n); $('fsBox').classList.toggle('low', n <= 1); envPulse(n <= 1 ? 2.2 : n === 2 ? 1.5 : 1); } if (bump) e.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.8) rotate(-6deg)', offset: .3 }, { transform: 'scale(.92)', offset: .65 }, { transform: 'scale(1)' }], { duration: 620 * T(), easing: 'ease-out' }); }


/* ---------- kai: title cards, curtain wipe, rules plaque, per-value landing effects ---------- */
const TITLES = { tin: ['TIN RUSH', 'THE TINS ARE LOCKED IN'], fs: ['FREE SPINS', 'THE DRUMS CALL THE SPIRITS'], super: ['SUPER FREE SPINS', 'A GOLDEN INFUSION'] };
async function titleCard(type, sub, ms = 1900, end) {
  const t = $('ctTitle'); if (!t) return; t.className = 't-' + type + (end ? ' end' : ''); t.querySelector('b').textContent = end || TITLES[type][0]; t.querySelector('.tcS').textContent = sub || ''; t.hidden = false;
  S.music.stinger(end ? 'end' : 'trig'); sfx.titleHit(type, !!end);
  const b = t.querySelector('.tcB'), r = t.querySelector('.tcR');
  t.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .86 }, { opacity: 0 }], { duration: ms * T(), easing: 'linear' });
  b.animate([{ transform: 'scale(.25) rotate(-5deg)', opacity: 0 }, { transform: 'scale(1.16) rotate(1.5deg)', opacity: 1, offset: .16 }, { transform: 'scale(.97)', offset: .26 }, { transform: 'scale(1)', offset: .34 }, { transform: 'scale(1.03)', offset: .86 }, { transform: 'scale(1.1)', opacity: 0 }], { duration: ms * T(), easing: 'ease-out' });
  r.animate([{ transform: 'scaleY(.05)' }, { transform: 'scaleY(1)', offset: .14 }, { transform: 'scaleY(1)', offset: .86 }, { transform: 'scaleY(.05)' }], { duration: ms * T(), easing: 'ease-out' });
  if (!end) { flash(type === 'super' ? 2.4 : 1.6); shake(type === 'super' ? 2.2 : 1.4); embers(lt(type === 'super' ? 120 : 70), innerWidth / 2, innerHeight / 2, true); if (type !== 'tin') coins(lt(type === 'super' ? 50 : 24)); }
  await wait(ms - 120); t.hidden = true;
}
const endCard = (type, title, sub) => titleCard(type, sub, 1500, title);
function wipe(type) {   // curtain of the bonus colour sweeps across as the bonus starts (transform/opacity only)
  const w = $('ctWipe'); if (!w) return; w.className = 'w-' + type; w.hidden = false;
  w.animate([{ transform: 'translateX(-105%)' }, { transform: 'translateX(0)', offset: .42 }, { transform: 'translateX(0)', offset: .56 }, { transform: 'translateX(105%)' }], { duration: 1100 * T(), easing: 'cubic-bezier(.6,0,.3,1)' }).finished.then(() => { w.hidden = true; }, () => { w.hidden = true; });
}
function setRules(type) {
  const r = $('ctRules'); if (!r) return; if (!type) { r.hidden = true; return; }
  const F = FSI[type] || {}, rt = F.retrigger || {}, k3 = Object.keys(rt)[0];
  const items = type === 'tin' ? ['TINS LOCK IN PLACE', 'NEW TIN: POURS RESET TO 3', 'FULL ROW: KITE LAUNCH x2', 'ALL 20: GRAND DRAGON KITE']
    : type === 'fs' ? ['WINNING DRAWERS STEEP DARKER', 'STEEPED DRAWERS BOOST LINES', k3 ? `${k3} DRUMS: +${rt[k3]} SPINS` : 'DRUMS: MORE SPINS']
    : ['SOME DRAWERS START STEEPED', 'GOLD DRAWERS PAY THE MOST', k3 ? `${k3} DRUMS: +${rt[k3]} SPINS` : 'DRUMS: MORE SPINS'];
  const leg = type === 'tin' ? '' : `<div class="lg"><span>DRAWER BOOST</span>${(fsBoost || []).map((b, i) => i ? `<i class="l${i}${i === fsMax && type === 'super' ? ' gd' : ''}">+${b}</i>` : '').join('')}</div>`;
  r.innerHTML = `<b>${TITLES[type][0]}</b><ul>${items.map(t => `<li>${t}</li>`).join('')}</ul>${leg}`; r.hidden = false;
  r.animate([{ opacity: 0, transform: 'translateX(-40px)' }, { opacity: 1, transform: 'none' }], { duration: 500 * T(), delay: 500 * T(), easing: 'ease-out', fill: 'backwards' });
}
const tinTier = nt => nt.kind !== 'value' ? 3 : nt.value >= 10 ? 3 : nt.value >= 5 ? 2 : nt.value >= 2 ? 1 : 0;
function landFx(nt, lock, ctx) {   // every tin landing: a ring wave + sparkle that grow with the tin's value
  const d = at(nt.r, nt.c), tier = tinTier(nt), w = document.createElement('i'); w.className = 'ctWave t' + tier; d.append(w);
  w.animate([{ transform: 'scale(.3)', opacity: .95 }, { transform: `scale(${1.25 + tier * .4})`, opacity: 0 }], { duration: (480 + tier * 140) * T(), easing: 'ease-out' }).finished.then(() => w.remove(), () => w.remove());
  gold(nt.r, nt.c, lt((lock ? 3 : 5) + tier * 5), .4 + tier * .35); sfx.tinPop(tier);
  if (tier >= 1 && !lock) { const [x, y] = scr(nt.r, nt.c); pop(x, y - 40, '+' + fmt(nt.value * ctx.stake)); }
  if (tier >= 2 && !lock) { d.animate([{ transform: 'none' }, { transform: 'scale(1.12)', offset: .3 }, { transform: 'none' }], { duration: 380 * T(), easing: 'ease-out' }); flash(.5 + tier * .4); }
  if (tier >= 3 && !lock) { shake(1.2); S.music.stinger('bigtin'); }
}

/* ---------- base spin ---------- */
const tinCells = grid => { const o = []; grid.forEach((row, r) => row.forEach((s, c) => { if (s === TIN) o.push([r, c]); })); return o; };
async function flipBundles(b, grid) {
  say('THE BUNDLES UNTIE!', true); char('special', 900 * T()); sfx.untie(b.flipTo);
  b.cells.forEach(([r, c], i) => { FX.act(at(r, c), i * 80, c); after(i * 80 + 660, () => { const u = at(r, c).querySelector('svg.g use'); if (u) u.setAttribute('href', '#s' + b.flipTo); }); });
  const endMs = b.cells.length * 80 + 660 + 520;
  after(endMs - 100, () => { b.cells.forEach(([r, c]) => { ring(at(r, c)); gold(r, c, 6, .6); }); flash(1.2); });
  await wait(endMs + 360); b.cells.forEach(([r, c]) => FX.rest(at(r, c)));
  lastGrid = grid; grid.forEach((row, r) => row.forEach((s, c) => { if (s !== TIN) { const u = at(r, c).querySelector('svg.g use'); if (u && u.getAttribute('href') !== '#s' + s) u.setAttribute('href', '#s' + s); } }));
}
async function evalWins(st, ctx, run) {
  GRID.classList.add('focus'); const cellT = new Map(); let endAll = 0; const n = st.wins.length, gap = n > 8 ? 55 : n > 4 ? 85 : 120;
  st.wins.forEach((w, i) => {
    const t0 = i * gap, R = thread(w.cells, t0, i), lastC = w.cells.length - 1;
    w.cells.forEach(([r, c], j) => { const dl = R.arrive[j] + 24 + r * 20, key = r * COLS + c; if (!cellT.has(key) || dl < cellT.get(key).dl) cellT.set(key, { dl, r, c }); });
    after(R.arrive[0], () => sfx.link(0)); after(R.arrive[lastC], () => sfx.link(Math.min(4, w.cells.length)));
    if (w.boost > 0) {   // Steeping Drawers: each steeped drawer flashes its tag as the string reaches it, the sum becomes a chip x(1+boost) at the end of the string
      w.cells.forEach(([r, c], j) => after(R.arrive[j] + 30, () => { const tg = at(r, c).querySelector('.tg'); if (tg) { tg.classList.remove('fl'); void tg.offsetWidth; tg.classList.add('fl'); } }));
      xChip(w, R.arrive[lastC] + 120, i);
    }
    if (n <= 8 && st.payout < 5) after(R.arrive[lastC] + 90, () => { const [x, y] = scr(...w.cells[Math.min(2, lastC)]); pop(x, y - 30, '+' + fmt(w.payout * ctx.stake)); });
    endAll = Math.max(endAll, R.arrive[lastC]);
  });
  cellT.forEach(o => FX.act(at(o.r, o.c), o.dl, o.c));
  sfx.win(Math.min(7, n + (st.payout > 5 ? 2 : 0)));
  const sz = st.payout >= 25 ? 4 : st.payout >= 10 ? 3 : st.payout >= 5 ? 2 : st.payout >= 2 ? 1 : 0;   // win size class: 0 small tag, 1 sparkle, 2 bigger sparkle + tag, 3 Koji + particles, 4 big
  char(sz >= 3 ? 'big' : 'win', (sz >= 3 ? 3200 : 1500) * T()); const before = run; run += st.payout * ctx.stake; after(endAll, () => ctx.onWin(before, run));
  if (sz >= 1) after(endAll + 30, () => { cellT.forEach(o => gold(o.r, o.c, lt(3 + sz * 3), .35 + sz * .3)); if (sz >= 2) flash(.5 + sz * .35); if (sz >= 3) { shake(sz - 1.2); coins(lt(14 + sz * 10)); embers(lt(40 + sz * 20), innerWidth / 2, innerHeight / 2, true); } });
  if (sz >= 2) after(endAll + 140, () => { const t = document.createElement('div'); t.className = 'ctWinTag s' + sz; t.textContent = '+' + fmt(st.payout * ctx.stake); fxl().append(t);
    t.animate([{ opacity: 0, transform: 'translate(-50%,-30%) scale(.3)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.2)', offset: .2 }, { opacity: 1, transform: 'translate(-50%,-56%) scale(1)', offset: .7 }, { opacity: 0, transform: 'translate(-50%,-110%) scale(1)' }], { duration: 1500 * T(), easing: 'ease-out' }).finished.then(() => t.remove(), () => t.remove()); });
  if (n > 8) after(endAll + 100, () => { const [x, y] = scr(1, 2); pop(x, y, '+' + fmt(st.payout * ctx.stake)); });
  say(`A FINE CUP! +${fmt(st.payout * ctx.stake)}`, true);
  await wait(endAll + 800); fadeLinks(240); GRID.classList.remove('focus'); restCells(); return run;
}
async function baseSpin(sp, run, ctx) {
  char('spin', 950 * T()); paint(sp.initialGrid); sfx.drop();
  const dt = dropReels(sp.initialGrid), tins = tinCells(sp.initialGrid); tinsNow = tins.length;
  tins.slice().sort((a, b) => dt.times[a[0] * COLS + a[1]] - dt.times[b[0] * COLS + b[1]]).forEach(([r, c], i) => { const t = dt.times[r * COLS + c]; after(t, () => { sfx.tin(i); ring(at(r, c)); }); });
  fsCellsOf(sp.initialGrid).sort((a, b) => dt.times[a[0] * COLS + a[1]] - dt.times[b[0] * COLS + b[1]]).forEach(([r, c], i) => { const t = dt.times[r * COLS + c]; after(t, () => { sfx.drum(i); ring(at(r, c)); }); });
  if (dt.tease) after(Math.max(300, dt.end - 1500), () => { const ch = $('char'); ch.classList.remove(...S.cfg.char.states); void ch.offsetWidth; ch.classList.add('tease'); });
  await wait(dt.end + 260); holdOff();
  if (dt.tease) {
    const nF = fsCellsOf(sp.initialGrid).length, ch = $('char'), hit = tins.length >= 6 || nF >= 3; ch.classList.add(hit ? 'exhale' : 'slump'); setTimeout(() => ch.classList.remove('tease', 'exhale', 'slump'), 750 * T());
    if (!hit && tins.length >= 4) { say('ALMOST... JUST ONE MORE TIN', true); await wait(650); }
    else if (!hit && nF === 2) { say('ALMOST... JUST ONE MORE DRUM', true); await wait(650); }
  }
  const st = sp.step;
  if (st) {
    if (st.bundle) await flipBundles(st.bundle, st.grid);
    if (st.wins.length) run = await evalWins(st, ctx, run);
  }
  return run;
}
async function showTrigger(R) {
  bonusR = R; bType = R.bonusType || 'tin'; setupSplash(bType, R); holdOff();
  const ch = $('char'), koji = st => { ch.classList.remove(...S.cfg.char.states); void ch.offsetWidth; ch.classList.add(st); };
  document.body.classList.add('ctAnt');   // the room dims, only the triggering pieces keep their light
  let list, nm, sound, step;
  if (bType !== 'tin') {   // FS drums: the three (four) drums beat one after another, faster and louder each time
    list = R.fsScatter.cells.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0]); nm = list.length; step = 150; sound = i => sfx.drum(i);
  } else { list = R.tins ? R.tins.cells.slice() : tinCells(lastGrid); list.sort((a, b) => a[1] - b[1] || a[0] - b[0]); nm = list.length; step = Math.max(70, 150 - nm * 4); sound = i => sfx.tin(i); }
  restCells(); GRID.classList.add('focus'); clearLinks(); koji('tease'); sfx.antRise(bType);
  say(bType === 'super' ? `${nm} DRUMS... SUPER FREE SPINS!` : bType === 'fs' ? `${nm} DRUMS... FREE SPINS!` : `${nm} TEA TINS... TIN RUSH!`, true);
  list.forEach(([r, c], i) => { FX.act(at(r, c), i * step, c); at(r, c).classList.add('scat'); after(i * step, () => { sound(i); ring(at(r, c), 500); gold(r, c, lt(6), .6 + i * .05); }); });
  await wait(list.length * step + 450);
  /* all together: a flash, the pieces burst, then the title card */
  list.forEach(([r, c]) => { ring(at(r, c), 700); gold(r, c, lt(10), 1.1); });
  koji('special'); setTimeout(() => ch.classList.remove('special'), 1000 * T());
  await titleCard(bType, `${nm} ${bType === 'tin' ? 'TEA TINS' : 'DRUMS'}`, bType === 'super' ? 2300 : 1900);
  holdOff();
}

/* ---------- Tin Rush (hold and win) ---------- */
async function bonusOpen() {
  /* the empty drawers slide shut around the tins that stay */
  const stay = new Set(); ALL.forEach(([r, c]) => { if (lastGrid[r][c] === TIN) stay.add(r * COLS + c); });
  sfx.drawers(); GRID.classList.remove('focus'); restCells(); clearLinks();
  ALL.forEach(([r, c], i) => { const d = at(r, c), k = r * COLS + c;
    if (stay.has(k)) { d.classList.add('locked'); d.classList.remove('scat'); return; }
    FX.out(d, { delay: c * 24 + r * 12, dist: 120, up: 4, dur: 260, rot: (c % 2 ? 1 : -1) * 2 });
    after(c * 24 + r * 12 + 280, () => { setCell(d, null, null, ' closed'); d.animate([{ opacity: 0, transform: 'scale(.86)' }, { opacity: 1, transform: 'none' }], { duration: 240 * T(), easing: 'ease-out' }); });
  });
  await wait(760);
}
async function fly(from, to, text, delay) {
  const e = document.createElement('div'); e.className = 'ctFly'; e.textContent = text; e.style.left = from[0] + 'px'; e.style.top = from[1] + 'px'; fxl().append(e);
  const a = e.animate([{ transform: 'translate(-50%,-50%) scale(1.2)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 1, offset: .15 }, { transform: `translate(calc(-50% + ${to[0] - from[0]}px),calc(-50% + ${to[1] - from[1]}px)) scale(.5)`, opacity: .9 }], { duration: 380 * T(), delay: delay * T(), easing: 'cubic-bezier(.5,0,.8,.5)', fill: 'both' });
  await a.finished.catch(() => {}); e.remove();
}
async function collectorSuck(nt, d) {
  const srcs = [...board.entries()], kc = ctrG(nt.r, nt.c); let acc = 2; sfx.kettle(); say('THE KETTLE COLLECTS!', true);
  const m = setChip(d, 2, true), g = d.querySelector('svg.g'), gap = srcs.length > 10 ? 40 : 70;
  const jobs = srcs.map(([k, v], i) => { const r = Math.floor(k / COLS), c = k % COLS; const p = ctrG(r, c);
    return fly([p[0], p[1] + 30], [kc[0], kc[1] + 30], 'x' + v.value, i * gap).then(() => { acc += v.value; m.textContent = 'x' + acc; sfx.collect(i); g.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12,.9)', offset: .4 }, { transform: 'scale(.97,1.05)', offset: .7 }, { transform: 'none' }], { duration: 200 * T() }); }); });
  await Promise.all(jobs); m.textContent = 'x' + nt.value; m.classList.remove('up'); void m.offsetWidth; m.classList.add('up'); flash(1); gold(nt.r, nt.c, 12, 1);
  d.animate([{ transform: 'none' }, { transform: 'scale(1.1)', offset: .3 }, { transform: 'none' }], { duration: 400 * T() }); await wait(260);
}
async function placeTin(nt, k, lock, ctx) {
  const d = at(nt.r, nt.c), sym = KIND_SYM[nt.kind];
  if (lock) { d.classList.add('locked'); if (sym !== TIN) flipSym(d, sym); }
  else { setCell(d, sym, null, ' locked land'); }
  sfx.tin(k); ring(d); landFx(nt, lock, ctx); if (nt.kind !== 'value') gold(nt.r, nt.c, lt(8), .7);
  if (nt.kind === 'collector') { await wait(lock ? 220 : 260); await collectorSuck(nt, d); }
  else { if (nt.kind === 'mini' || nt.kind === 'minor' || nt.kind === 'major') { sfx.jackpot(nt.kind); say(nt.kind.toUpperCase() + ' TIN! x' + nt.value, true); char('special', 900 * T()); if (nt.kind === 'major') { shake(3); flash(2.5); embers(lt(120), ...scr(nt.r, nt.c), true); S.music.stinger('bigtin'); } else flash(1); }
    await wait(lock ? 160 : 120); setChip(d, nt.value, true); await wait(lock ? 150 : 200); }
  board.set(nt.r * COLS + nt.c, { kind: nt.kind, value: nt.value });
}
const KITE_SVG = `<svg viewBox="0 0 120 250" width="120" height="250" style="overflow:visible"><path d="M60 122 Q38 150 66 176 Q92 200 56 238" fill="none" stroke="#1c2340" stroke-width="10" stroke-linecap="round"/><path d="M60 122 Q38 150 66 176 Q92 200 56 238" fill="none" stroke="#fbf1dc" stroke-width="5" stroke-linecap="round" stroke-dasharray="9 7"/>
<path d="M58 150 l-13 -9 v18z M58 150 l13 -9 v18z M72 190 l-12 -8 v16z M72 190 l12 -8 v16z" fill="#d9432e" stroke="#1c2340" stroke-width="3" stroke-linejoin="round"/>
<path d="M60 4 L108 62 L60 122 L12 62Z" fill="#f2d23a" stroke="#1c2340" stroke-width="5.5" stroke-linejoin="round"/><path d="M60 4 L108 62 L60 62Z M12 62 L60 122 L60 62Z" fill="#d9432e"/><path d="M60 4 V122 M12 62 H108" stroke="#1c2340" stroke-width="3.4"/><path d="M60 4 L108 62 L60 122 L12 62Z" fill="none" stroke="#1c2340" stroke-width="5.5" stroke-linejoin="round"/><circle cx="60" cy="62" r="9" fill="#fbf1dc" stroke="#1c2340" stroke-width="3.4"/></svg>`;
async function kiteLaunch(k, bump, ctx) {
  const row = k.row, gate = $('gates').children[row], rowCells = [0, 1, 2, 3, 4].map(c => at(row, c)), band = document.createElement('div');
  band.className = 'ctBand'; band.style.top = row * CH + 'px'; fxl().append(band);
  GRID.classList.add('focus'); gate.classList.remove('launch');
  rowCells.forEach(d => d.classList.add('charge')); gate.classList.add('charge'); sfx.charge(); say('A FULL ROW...', true); S.music.duck(.3, 1.8, 1.2);
  await wait(760); rowCells.forEach(d => d.classList.remove('charge')); gate.classList.remove('charge');
  gate.classList.add('on'); sfx.gate();
  band.animate([{ opacity: 0, transform: 'scaleX(.3)' }, { opacity: 1, transform: 'scaleX(1)', offset: .25 }, { opacity: 1, offset: .8 }, { opacity: 0 }], { duration: 2100 * T(), easing: 'ease-out' });
  rowCells.forEach((d, c) => { d.classList.add('hit'); d.style.zIndex = 'auto'; });
  say('KITE LAUNCH! ROW x2', true); banner('KITE LAUNCH!', 'THIS ROW DOUBLES', 1900, true); char('special', 900 * T()); S.music.stinger('launch');
  await wait(520);
  gate.classList.add('launch'); sfx.kite(); shake(2.6); flash(2.2); embers(70, ...scr(row, 0), true);
  const kt = document.createElement('div'); kt.className = 'ctK'; kt.innerHTML = KITE_SVG; fxl().append(kt);
  const y0 = (row + .5) * CH - 62, travel = 4 * CW + 220;
  kt.animate([
    { transform: `translate(-110px,${y0 + 30}px) rotate(62deg)`, opacity: 0, offset: 0 },
    { transform: `translate(-40px,${y0 - 6}px) rotate(70deg)`, opacity: 1, offset: .08 },
    { transform: `translate(${travel * .5}px,${y0 - 36}px) rotate(78deg)`, opacity: 1, offset: .5 },
    { transform: `translate(${travel}px,${y0 - 70}px) rotate(82deg)`, opacity: 1, offset: .8 },
    { transform: `translate(${travel + 160}px,${y0 - 330}px) rotate(95deg)`, opacity: 0, offset: 1 }], { duration: 1500 * T(), easing: 'cubic-bezier(.35,0,.5,1)', fill: 'both' });
  const stake = ctx.stake;
  for (let c = 0; c < COLS; c++) {
    const t = 260 + c * 175, d = rowCells[c], b = k.before[c], a = k.after[c];
    FX.act(d, t - 60, c);
    after(t, () => { sfx.clink(c); const m = chipEl(d); if (m) { FX.tween(380 * T(), e => { m.textContent = 'x' + Math.round(b + (a - b) * e); });
      m.animate([{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.7) rotate(-5deg)', offset: .3 }, { transform: 'translateX(-50%) scale(.95)', offset: .7 }, { transform: 'translateX(-50%)' }], { duration: 560 * T(), easing: 'ease-out' }); }
      gold(row, c, 12, 1.1); const e = board.get(row * COLS + c); if (e) e.value = a;
      const [x, y] = scr(row, c); pop(x, y - 36, 'x2'); });
  }
  after(260 + 4 * 175 + 200, () => { bump(k.gain * stake); const [x, y] = scr(row, 2); pop(x, y + 16, '+' + fmt(k.gain * stake)); });
  await wait(260 + 4 * 175 + 900);
  rowCells.forEach(d => FX.rest(d)); GRID.classList.remove('focus'); band.remove(); kt.remove(); await wait(260);
  say('THE KITE FLIES!', true);
}
async function grandKite(g, bump, ctx) {
  GRID.classList.add('focus'); const ch = $('char'); document.body.classList.add('ctAnt'); say('EVERY DRAWER IS FULL...', true); sfx.charge(); sfx.beat(); S.music.duck(.12, 2.6, 1.4);
  cells.forEach(d => d.classList.add('charge')); await wait(1100); sfx.charge(); sfx.beat(); shake(1.6); await wait(650); cells.forEach(d => d.classList.remove('charge')); holdOff();
  ALL.forEach(([r, c]) => FX.act(at(r, c), (r + c) * 55, c)); ch.classList.remove(...S.cfg.char.states); void ch.offsetWidth; ch.classList.add('maxwin');
  say('GRAND DRAGON KITE!', true); sfx.grand(); S.music.duck(.15, 3.5, 1.6); S.music.stinger('grand'); banner('GRAND DRAGON KITE', '+' + g.bonus + 'x BONUS', 3000, true);
  const dr = document.createElement('div'); dr.className = 'ctDragon'; dr.innerHTML = `<svg viewBox="0 0 128 128" width="330" height="330" style="overflow:visible"><use href="#s${GRAND}"/></svg>`; fxl().append(dr);
  dr.animate([{ transform: 'translate(155px,640px) scale(.5) rotate(-8deg)', opacity: 0 }, { transform: 'translate(155px,330px) scale(1) rotate(3deg)', opacity: 1, offset: .35 }, { transform: 'translate(155px,120px) scale(1.05) rotate(-3deg)', opacity: 1, offset: .75 }, { transform: 'translate(155px,-120px) scale(1.2) rotate(5deg)', opacity: 0 }], { duration: 3000 * T(), easing: 'ease-in-out', fill: 'both' });
  shake(4); flash(3); coins(120); embers(220, innerWidth / 2, innerHeight / 2, true);
  after(900, () => { shake(3); flash(2.5); coins(80); const [x, y] = scr(1, 2); pop(x, y, '+' + fmt(g.bonus * ctx.stake)); bump(g.bonus * ctx.stake); });
  await wait(3200); dr.remove(); GRID.classList.remove('focus'); restCells(); setTimeout(() => ch.classList.remove('maxwin'), 800 * T());
}
async function bonusStep(sp, run0, ctx) {
  curStake = ctx.stake; const stake = ctx.stake, cap = MAXW * stake, lock = sp.kind === 'lock'; let run = run0;
  const bump = d => setRun(run + d), setRun = v => { v = Math.min(cap, v); if (v !== run) { ctx.onWin(run, v); run = v; } };
  if (lock) { rushLeft = 3; resets = 0; board.clear(); setFs(3); say('THE TINS SHOW THEIR PRIZES', true); await wait(250); }
  else {
    setFs(rushLeft); say(cnt(rushLeft), true); char('spin', 950 * T()); sfx.pour();
    cells.forEach((d, i) => { if (d.classList.contains('closed')) d.animate([{ transform: 'none' }, { transform: `translateY(${i % 2 ? 3 : -3}px) rotate(${i % 2 ? .6 : -.6}deg)`, offset: .25 }, { transform: `translateY(${i % 2 ? -2 : 2}px)`, offset: .55 }, { transform: 'none' }], { duration: 440 * T(), delay: (i % 5) * 28 * T() }); });
    await wait(480);
  }
  let k = 0;
  for (const nt of sp.newTins) { await placeTin(nt, k++, lock, ctx); bump(nt.value * stake); }
  tinsNow = board.size; S.music.intensity(Math.min(1, board.size / 17 + resets * .06));
  if (!sp.newTins.length) { sfx.empty(); say('NO NEW TIN. ' + cnt(sp.spinsLeft), true); await wait(380); }
  /* counter first, so a Kite Launch plays on the right number */
  if (!lock && sp.reset) { resets++; rushLeft = 3; sfx.reset(); say('A NEW TIN! POURS RESET TO 3', true); const nt = sp.newTins[sp.newTins.length - 1], fb = $('fsBox').getBoundingClientRect();
    if (nt) fly(ctrG(nt.r, nt.c), toLocal(fb.left + fb.width / 2, fb.top + fb.height / 2), 'RESET', 0); await wait(380); setFs(3, true); pips(3, true); plaqueHit(); flash(.8); await wait(520); }
  else if (!lock) { rushLeft = sp.spinsLeft; setFs(rushLeft, true); }
  else { rushLeft = sp.spinsLeft; }
  for (const kl of sp.kite) { await kiteLaunch(kl, bump, ctx); S.music.intensity(Math.min(1, board.size / 17 + resets * .06 + .2)); }
  if (sp.grand) await grandKite(sp.grand, bump, ctx);
  setRun(run0 + sp.totalPayout * stake);
  if (sp.spinsLeft === 0) { say('THE LAST POUR... ' + board.size + ' TINS IN THE DRAWERS', true); await wait(500); await endCard('tin', 'RUSH COMPLETE', board.size + ' TINS IN THE DRAWERS'); }
  else if (!sp.kite.length && sp.newTins.length && !lock) say(cnt(rushLeft), true);
  return run;
}
async function playSpin(sp, run, ctx) { if (sp.landed) return fsSpin(sp, run, ctx); return sp.kind === 'lock' || sp.kind === 'respin' ? bonusStep(sp, run, ctx) : baseSpin(sp, run, ctx); }

/* ---------- FREE SPINS / SUPER FREE SPINS: Steeping Drawers ---------- */
const fsCellsOf = grid => { const o = []; grid.forEach((row, r) => row.forEach((x, c) => { if (x === FSS) o.push([r, c]); })); return o; };
const toLocal = (x, y) => { const b = fxl().getBoundingClientRect(), k = b.width / 640; return [(x - b.left) / k, (y - b.top) / k]; };
const toStage = (x, y) => { const b = $('stage').getBoundingClientRect(), k = b.width / 1600; return [(x - b.left) / k, (y - b.top) / k]; };
const splashSvg = sup => `<svg class="kojiSplash${sup ? ' super' : ''}" viewBox="30 -50 420 390"><use href="#kojiSplash${sup ? 'Super' : ''}"/></svg>`;
/* per-bonus splash copy, portraits and the pre-steeped map (the shell builds the splash once; we re-dress it before every bonus) */
function setupSplash(type, R) {
  const sup = type === 'super', tin = type === 'tin', I = S.cfg.intro, O = S.cfg.outro, B = R.bonus || {}, F = FSI[type] || {};
  ['introM', 'outroM'].forEach(id => $(id).classList.toggle('sup', sup));
  $('introLbl').textContent = tin ? I.unit : 'SPINS';
  $('introRibbon').textContent = tin ? I.ribbon : sup ? 'SUPER FREE SPINS' : 'FREE SPINS';
  const chips = tin ? I.chips : sup ? [`${B.preSteep ? B.preSteep.length : FSI.super.preSteep} DRAWERS ALREADY STEEPED`, 'FIVE LEVELS, GOLD AT THE TOP', `UP TO x${F.maxLineMult} ON ONE LINE`] : ['WINNING DRAWERS STEEP DARKER', 'STEEPED DRAWERS PAY x(1 + BOOST)', `UP TO x${F.maxLineMult} ON ONE LINE`];
  $('introChips').innerHTML = chips.map(c => `<span>${c}</span>`).join('');
  const q = (id, t) => { const e = $(id).querySelector('.quote'); if (e) e.textContent = t; };
  q('introM', tin ? I.quote : sup ? '"Tonight the whole mountain gets the good leaves!"' : '"Every cup steeps a little stronger. Shall we?"');
  document.querySelector('#introM .tapHint').textContent = tin ? I.tap : sup ? 'TAP ANYWHERE TO START THE SUPER STEEP' : 'TAP ANYWHERE TO START STEEPING';
  $('outroRibbon').textContent = tin ? O.ribbon : sup ? 'A GOLDEN INFUSION' : 'A FINE STEEPING';
  document.querySelector('#outroM .mtop').textContent = tin ? O.label : 'YOUR STEEPING';
  ['introArt', 'outroArt'].forEach(id => { const e = $(id); if (e) e.innerHTML = splashSvg(sup); });
  const old = document.querySelector('#introM .preMap'); if (old) old.remove();
  if (sup) {
    const pre = new Set((B.preSteep || []).map(p => p.r * COLS + p.c));
    $('introChips').insertAdjacentHTML('afterend', `<div class="preMap"><small>KOJI POURS ON FOUR DRAWERS</small><div>${Array.from({ length: ROWS * COLS }, (_, i) => `<i class="${pre.has(i) ? 'g' : ''}" style="--d:${300 + [...pre].indexOf(i) * 260}ms"></i>`).join('')}</div></div>`);
  }
}
function setupOutro() {   // a clean tally under the total (the shell counts the total up; the rows fade in one by one above it)
  const old = $('ctTally'); if (old) old.remove();
  const sp = (bonusR && bonusR.bonus && bonusR.bonus.spins) || []; if (!sp.length) return; const k = curStake, rows = [];
  if (bType === 'tin') {
    const total = sp.reduce((a, x) => a + (x.totalPayout || 0), 0), kites = sp.reduce((a, x) => a + (x.kite || []).reduce((b, y) => b + (y.gain || 0), 0), 0), grand = sp.reduce((a, x) => a + (x.grand ? x.grand.bonus : 0), 0), nK = sp.reduce((a, x) => a + (x.kite || []).length, 0);
    rows.push([`${board.size} TINS IN THE DRAWERS`, fmt(Math.max(0, total - kites - grand) * k)]);
    if (nK) rows.push([`${nK} KITE ${nK === 1 ? 'LAUNCH' : 'LAUNCHES'}`, '+' + fmt(kites * k)]);
    if (grand) rows.push(['GRAND DRAGON KITE', '+' + fmt(grand * k)]);
  } else {
    const rt = sp.filter(x => x.retrigger).length, best = Math.max(0, ...sp.map(x => x.totalPayout || 0)), top = sp.reduce((a, x) => a + (x.levelUps || []).filter(u => u.popKite).length, 0);
    rows.push([`${sp.length} SPINS POURED`, '']); if (rt) rows.push([`${rt} ${rt === 1 ? 'RETRIGGER' : 'RETRIGGERS'}`, '']); if (top) rows.push([`${top} DRAWERS FULLY STEEPED`, '']); rows.push(['BEST SPIN', fmt(best * k)]);
  }
  $('outroM').querySelector('.medalWrap').insertAdjacentHTML('afterend', `<div id="ctTally">${rows.map((r, i) => `<div style="--d:${400 + i * 330}ms"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>`);
}
function setLv(d, lv) {
  if (lv) d.dataset.lv = lv; else delete d.dataset.lv;
  let tg = d.querySelector('.tg');
  if (lv > 0) { if (!tg) { tg = document.createElement('span'); tg.className = 'tg'; d.append(tg); } tg.textContent = '+' + (fsBoost[lv] || 0); } else if (tg) tg.remove();
}
function applyLevels(levels) { cells.forEach((d, i) => setLv(d, levels ? levels[(i / COLS) | 0][i % COLS] : 0)); }
function xChip(w, delay, i) {
  after(delay, () => {
    const [x, y] = ctrG(...w.cells[w.cells.length - 1]), e = document.createElement('div'); e.className = 'ctX' + (w.boost >= 8 ? ' big' : ''); e.textContent = 'x' + (1 + w.boost);
    e.style.left = Math.min(CW * 4.45, Math.max(CW * .55, x)) + 'px'; e.style.top = (y - 56 - (i % 3) * 16) + 'px'; fxl().append(e); sfx.xchip(w.boost);
    e.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.2) rotate(-14deg)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.45) rotate(4deg)', offset: .25 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .42 }, { opacity: 1, transform: 'translate(-50%,-50%)', offset: .9 }, { opacity: 0, transform: 'translate(-50%,-80%)' }], { duration: 1900 * T(), easing: 'ease-out' }).finished.then(() => e.remove(), () => e.remove());
  });
}
const LADLE = `<svg viewBox="0 0 120 90" width="120" height="90" style="overflow:visible"><path d="M112 6 L52 42" stroke="#1c2340" stroke-width="14" stroke-linecap="round"/><path d="M112 6 L52 42" stroke="#b07a4a" stroke-width="7" stroke-linecap="round"/><path d="M12 40 Q12 78 40 78 Q68 78 68 40Z" fill="#d4ae52" stroke="#1c2340" stroke-width="5.5" stroke-linejoin="round"/><ellipse cx="40" cy="40" rx="28" ry="8" fill="#8a4a14" stroke="#1c2340" stroke-width="4.5"/><path d="M22 52 Q26 66 36 68" fill="none" stroke="#fff3c4" stroke-width="3.4" stroke-linecap="round"/></svg>`;
const KITE_COL = [['#f2d23a', '#d9432e'], ['#f59db8', '#7a3ca6'], ['#79a85a', '#f2d23a'], ['#6aa6d8', '#fbf1dc'], ['#ffd23a', '#fff0a0']];
const SKY = [[70, 200], [1210, 60], [170, 290], [1555, 85], [50, 360], [1560, 330], [150, 135], [1150, 150], [1500, 20]];
let skyN = 0;
function skyKite(r, c, gold) {   // a paper kite pops out of the top-level drawer, flies up and joins the kites in the sky (stays for the rest of the bonus)
  const sky = $('ctKites'), [sx, sy] = scr(r, c), [x0, y0] = toStage(sx, sy), sp = SKY[skyN++ % SKY.length], col = gold ? KITE_COL[4] : KITE_COL[(skyN + 1) % 4];
  const k = document.createElement('div'); k.className = 'ctSkyK'; k.innerHTML = KITE_SVG.replace('#f2d23a', col[0]).replace('<path d="M60 4 L108 62 L60 62Z M12 62 L60 122 L60 62Z" fill="#d9432e"/>', `<path d="M60 4 L108 62 L60 62Z M12 62 L60 122 L60 62Z" fill="${col[1]}"/>`);
  k.style.left = x0 + 'px'; k.style.top = y0 + 'px'; sky.append(k);
  const mx = (x0 + sp[0]) / 2 + (sp[0] < 800 ? -60 : 60);
  k.animate([{ transform: 'translate(-60px,-70px) scale(.05) rotate(0)', opacity: 0 }, { transform: 'translate(-60px,-120px) scale(.4) rotate(-12deg)', opacity: 1, offset: .15 }, { transform: `translate(${mx - x0 - 60}px,${(y0 + sp[1]) / 2 - y0 - 130}px) scale(.6) rotate(14deg)`, offset: .55 }, { transform: `translate(${sp[0] - x0 - 60}px,${sp[1] - y0 - 70}px) scale(.38) rotate(0)`, opacity: 1 }], { duration: 1700 * T(), easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
  after(1700, () => { k.classList.add('rest'); k.style.transform = `translate(${sp[0] - x0 - 60}px,${sp[1] - y0 - 70}px) scale(.5)`; k.getAnimations().forEach(a => a.cancel()); });
}
function steepCell(u, gold) {
  const d = at(u.r, u.c), [x, y] = ctrG(u.r, u.c), lad = document.createElement('div'); lad.className = 'ctLadle'; lad.innerHTML = LADLE; lad.style.left = (x + 18) + 'px'; lad.style.top = (y - 92) + 'px'; fxl().append(lad);
  lad.animate([{ opacity: 0, transform: 'translate(70px,-60px) rotate(20deg) scale(.8)' }, { opacity: 1, transform: 'translate(10px,0) rotate(0) scale(1)', offset: .25 }, { opacity: 1, transform: 'translate(-6px,6px) rotate(-30deg) scale(1.02)', offset: .5 }, { opacity: 1, transform: 'translate(-6px,6px) rotate(-34deg)', offset: .78 }, { opacity: 0, transform: 'translate(60px,-50px) rotate(10deg)' }], { duration: 1000 * T(), easing: 'ease-in-out' }).finished.then(() => lad.remove(), () => lad.remove());
  const st = document.createElement('div'); st.className = 'ctStream'; st.style.left = (x - 14) + 'px'; st.style.top = (y - 36) + 'px'; fxl().append(st);
  st.animate([{ transform: 'scaleY(0)', opacity: 1 }, { transform: 'scaleY(1)', opacity: 1, offset: .35 }, { transform: 'scaleY(1)', opacity: 1, offset: .7 }, { transform: 'scaleY(1) translateY(30px)', opacity: 0 }], { duration: 760 * T(), delay: 260 * T(), fill: 'both', easing: 'ease-in' }).finished.then(() => st.remove(), () => st.remove());
  after(300, () => sfx.steep(u.to));
  after(560, () => {
    setLv(d, u.to); const tg = d.querySelector('.tg'); if (tg) tg.animate([{ transform: 'scale(.2) rotate(-30deg)' }, { transform: 'scale(1.5) rotate(10deg)', offset: .4 }, { transform: 'scale(1) rotate(0)' }], { duration: 520 * T(), easing: 'cubic-bezier(.3,1.6,.5,1)' });
    const w = document.createElement('div'); w.className = 'ctWash' + (gold ? ' g' : ''); d.append(w); w.animate([{ opacity: .95, transform: 'scale(.2)' }, { opacity: .8, transform: 'scale(1.05)', offset: .45 }, { opacity: 0, transform: 'scale(1.1)' }], { duration: 900 * T(), easing: 'ease-out' }).finished.then(() => w.remove(), () => w.remove());
    d.animate([{ transform: 'none' }, { transform: 'scale(1.08,.94)', offset: .3 }, { transform: 'scale(.97,1.04)', offset: .62 }, { transform: 'none' }], { duration: 520 * T(), easing: 'ease-out' });
    const [sx, sy] = scr(u.r, u.c); S.shards(sx, sy, lt(7 + u.to * 2), ['#fff6e2', '#f0d8a8', '#c98b4a', gold ? '#ffd23a' : '#e9c995'], { power: .45 + u.to * .08, edge: 'rgba(28,35,64,.5)' });
    const wv = document.createElement('i'); wv.className = 'ctWave t' + Math.min(3, u.to) + (gold ? ' g' : ''); d.append(wv); wv.animate([{ transform: 'scale(.3)', opacity: .95 }, { transform: 'scale(1.7)', opacity: 0 }], { duration: 700 * T(), easing: 'ease-out' }).finished.then(() => wv.remove(), () => wv.remove());
    const up = document.createElement('div'); up.className = 'ctUp' + (gold ? ' g' : ''); up.textContent = 'LEVEL ' + u.to + (fsBoost[u.to] ? '  +' + fsBoost[u.to] : ''); up.style.left = ctrG(u.r, u.c)[0] + 'px'; up.style.top = ctrG(u.r, u.c)[1] - 30 + 'px'; fxl().append(up);
    up.animate([{ opacity: 0, transform: 'translate(-50%,0) scale(.4)' }, { opacity: 1, transform: 'translate(-50%,-14px) scale(1.15)', offset: .25 }, { opacity: 1, transform: 'translate(-50%,-30px) scale(1)', offset: .75 }, { opacity: 0, transform: 'translate(-50%,-52px) scale(1)' }], { duration: 1300 * T(), easing: 'ease-out' }).finished.then(() => up.remove(), () => up.remove());
    if (u.popKite) { sfx.kitePop(); S.music.stinger('top'); flash(1.4); skyKite(u.r, u.c, gold); S.shards(sx, sy, 12, ['#f2d23a', '#d9432e', '#fbf1dc'], { power: .8, edge: 'rgba(28,35,64,.6)' }); }
  });
}
async function pourUps(sp) {
  const ups = sp.levelUps; if (!ups.length) return; const gold = bType === 'super';
  say(ups.some(u => u.popKite) ? 'A DRAWER IS FULLY STEEPED! THE KITE FLIES' : `KOJI POURS... ${ups.length} ${ups.length === 1 ? 'DRAWER STEEPS' : 'DRAWERS STEEP'} DARKER`, true); char('special', 900 * T()); sfx.pour();
  ups.forEach((u, i) => after(i * 190, () => steepCell(u, gold && u.to >= fsMax - 1)));
  await wait(ups.length * 190 + 1250);
}
const sumLv = lv => lv.reduce((a, r) => a + r.reduce((x, y) => x + y, 0), 0);
async function fsSpin(sp, run0, ctx) {
  curStake = ctx.stake; const stake = ctx.stake, sup = bType === 'super', dec = sp.spinsLeft - (sp.retrigger || 0); let run = run0;
  setFs(dec, true); char('spin', 950 * T()); say(sup ? 'SUPER STEEP...' : 'STEEPING...');
  paint(sp.landed); applyLevels(sp.levels); sfx.drop();
  const dt = dropReels(sp.landed); fsCellsOf(sp.landed).sort((a, b) => dt.times[a[0] * COLS + a[1]] - dt.times[b[0] * COLS + b[1]]).forEach(([r, c], i) => { const t = dt.times[r * COLS + c]; after(t, () => { sfx.drum(i); ring(at(r, c)); }); });
  if (dt.tease) after(Math.max(300, dt.end - 1500), () => { const ch = $('char'); ch.classList.remove(...S.cfg.char.states); void ch.offsetWidth; ch.classList.add('tease'); });
  await wait(dt.end + 260); holdOff();
  if (dt.tease) { const ch = $('char'); ch.classList.add(sp.fsCount >= 3 ? 'exhale' : 'slump'); setTimeout(() => ch.classList.remove('tease', 'exhale', 'slump'), 750 * T()); }
  if (sp.bundle) await flipBundles(sp.bundle, sp.grid);
  if (sp.wins.length) run = await evalWins({ wins: sp.wins, payout: sp.totalPayout }, ctx, Math.min(run, MAXW * stake));
  else await wait(260);
  if (run > MAXW * stake) run = MAXW * stake;
  await pourUps(sp);
  const lv = sumLv(sp.levels) + sp.levelUps.length; S.music.intensity(Math.min(1, lv / (ROWS * COLS * fsMax) * 2.4 + (sp.spinIndex % 3) * .02));
  if (sp.retrigger) {
    const cellsF = sp.fsCells; S.music.stinger('retrig'); sfx.retrig(); char('special', 1400 * T()); shake(1.6); flash(1.6);
    cellsF.forEach(([r, c], i) => { FX.act(at(r, c), i * 90, c); at(r, c).classList.add('scat'); ring(at(r, c), 600); gold(r, c, 8, .8); });
    banner(`+${sp.retrigger} SPINS!`, 'THE DRUMS BEAT AGAIN', 1900, true); say(`MORE DRUMS! +${sp.retrigger} SPINS`, true);
    await wait(700);
    const fb = $('fsBox').getBoundingClientRect(), to = toLocal(fb.left + fb.width / 2, fb.top + fb.height / 2), from = ctrG(...cellsF[0]);
    await fly(from, to, '+' + sp.retrigger, 0); setFs(sp.spinsLeft, true); sfx.reset(); plaqueHit(); await wait(500); restCells();
  }
  if (sp.spinsLeft === 0) { say('THE LAST CUP IS POURED', true); await wait(420); await endCard(bType, sup ? 'SUPER STEEP COMPLETE' : 'STEEPING COMPLETE', `${sp.spinIndex} SPINS POURED`); }
  return run;
}

/* ---------- Game Info paytable (engine info() embedded by the build, never retyped) ---------- */
function buildPaytable() {
  const f = v => v == null || v === 0 ? '<td class="no">-</td>' : `<td>${+(+v).toFixed(2)}x</td>`, row = (id, name, tds) => `<tr><td><div class="nm"><svg viewBox="0 0 128 128"><use href="#s${id}"/></svg>${name}</div></td>${tds}</tr>`;
  const J = INFO.jackpots;
  $('ptab').innerHTML = '<tr><th>SYMBOL</th><th>3</th><th>4</th><th>5</th></tr>' +
    INFO.paytable.slice().reverse().map(p => row(p.id, p.name, f(p.pays[3]) + f(p.pays[4]) + f(p.pays[5]))).join('') +
    row(WILD, 'Smiling Kite (Wild)', '<td colspan="3">Stands in on reels 2-4</td>') + row(BUNDLE, 'Furoshiki Bundle', '<td colspan="3">All bundles flip to one symbol</td>') +
    row(FSS, 'FS Drum (Bonus)', `<td colspan="3">${FSI.triggers.fs} FS: FREE SPINS, ${FSI.triggers.super}+ FS: SUPER</td>`) +
    row(TIN, 'Tea Tin (Bonus)', `<td colspan="3">${INFO.triggerTins}+ anywhere: TIN RUSH</td>`) +
    row(12, 'Mini Tin', `<td colspan="3">${J.mini}x</td>`) + row(13, 'Minor Tin', `<td colspan="3">${J.minor}x</td>`) + row(14, 'Major Tin', `<td colspan="3">${J.major}x</td>`) + row(GRAND, 'Grand Dragon Kite', `<td colspan="3">+${INFO.grandBonus}x, full board</td>`);
  /* Steeping Drawers: numbers come from engine info().fsBonus, never retyped */
  const rt = o => Object.keys(o).map(k => `${k} FS: +${o[k]}`).join(', ');
  const val = { 'fs.startSpins': FSI.fs.startSpins, 'super.startSpins': FSI.super.startSpins, 'super.startSpins5': FSI.super.startSpins5, 'super.preSteep': FSI.super.preSteep, 'super.preLevel': FSI.super.preLevel,
    'fs.retrigger': rt(FSI.fs.retrigger), 'super.retrigger': rt(FSI.super.retrigger), 'fs.maxSpins': FSI.fs.maxSpins, 'super.maxSpins': FSI.super.maxSpins };
  document.querySelectorAll('#infoM [data-i]').forEach(e => { e.textContent = val[e.dataset.i]; });
  const tab = (t, k) => `<table class="pt boost"><tr><th colspan="${FSI[k].boost.length + 1}">${t}</th></tr><tr><td>Drawer level</td>${FSI[k].boost.map((b, i) => `<td>${i}${i === FSI[k].maxLevel ? (k === 'super' ? ' (gold)' : ' (kite)') : ''}</td>`).join('')}</tr><tr><td>Boost added to the line</td>${FSI[k].boost.map(b => `<td>+${b}</td>`).join('')}</tr></table>`;
  $('boostTabs').innerHTML = '<b>DRAWER BOOST TABLES</b><span>A line pays its normal win x (1 + the sum of the boosts of its drawers).</span>' + tab('FREE SPINS', 'fs') + tab('SUPER FREE SPINS', 'super');
}

/* ---------- sound: koto, shakuhachi, wood block, taiko and brass bells (all synthesised) ---------- */
return {
  music: musicDefs,
  sfx(kit) {
    const { ctx, bus, env, osc, noise, metal, st, T0 } = kit;
    const HIR = [0, 2, 3, 7, 8, 12, 14, 15, 19, 20, 24, 26, 27, 31, 32, 36], D5 = 587.33;
    const koto = (f, t, v = .09, d = .9) => { const lp = ctx.createBiquadFilter(), o = ctx.createOscillator(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(800, t + d * .5); o.type = 'triangle'; o.frequency.setValueAtTime(f * 1.03, t); o.frequency.exponentialRampToValueAtTime(f, t + .05);
      o.connect(lp).connect(env(t, .002, v, d)).connect(bus); o.start(t); o.stop(t + d + .1); noise(t, .02, v * .4, 'bandpass', 3200, 0, 2, .001); };
    const tok = (t, f = 1000, v = .12) => { osc('sine', f * 1.25, t, .08, v, .001, f); osc('square', f * 2, t, .03, v * .15, .001); };
    const taiko = (t, v = 1, f0 = 120) => { osc('sine', f0, t, .55, .42 * v, .003, f0 * .42); osc('sine', f0 * 1.5, t, .25, .14 * v, .003, f0 * .6); noise(t, .12, .18 * v, 'bandpass', 260, 130, 1.1, .002); noise(t, .03, .07 * v, 'bandpass', 1800, 0, 1, .001); };
    const shaku = (f, t, d, v = .08) => { const o = ctx.createOscillator(), l = ctx.createOscillator(), lg = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; l.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * .012, t + d * .6); l.connect(lg).connect(o.frequency);
      o.connect(env(t, d * .25, v, d * .75)).connect(bus); o.start(t); l.start(t); o.stop(t + d + .1); l.stop(t + d + .1); noise(t, d, v * .5, 'bandpass', f * 2.6, 0, 1.4, d * .25); };
    const bell = (f, t, p = 1, d = 1.4) => { metal(f, t, d, .13 * p, [1, 2.4, 4.1, 6.7]); noise(t, .04, .08 * p, 'bandpass', 2400, 1200, 1.4); };
    const N = k => D5 * st(HIR[Math.min(k, HIR.length - 1)]);
    const R = {
      ui: () => { const t = T0(); tok(t, 900, .1); koto(N(5), t + .02, .05, .3); },
      tap: () => { const t = T0(); tok(t, 1100, .12); },
      hit: () => { const t = T0(); noise(t, .07, .15, 'highpass', 3000, 6000, .7); tok(t, 1300, .1); },
      spin: () => { const t = T0(); noise(t, .22, .13, 'bandpass', 300, 1500, .8, .05); tok(t, 700, .13); osc('sine', 160, t, .18, .12, .02, 90); },
      drop: () => { const t = T0(); noise(t, .45, .09, 'bandpass', 1900, 350, .7, .04); },
      land: c => { const t = T0(); osc('sine', 150, t, .12, .22, .002, 68); noise(t, .06, .14, 'lowpass', 600, 0); if (c === 4) tok(t, 800, .06); },
      win: n => { const t = T0(), b = Math.min(n, 6); [0, 1, 2].forEach((d, i) => koto(N(b + d * 2), t + i * .1, .09, 1)); tok(t + .34, 1250, .1); },
      link: c => { const t = T0(); koto(N(1 + c * 2) / 2, t, .07, .5); noise(t, .05, .08, 'bandpass', 1100, 600, 1.2, .002); },
      /* SIGNATURE 1: tin lock. A wooden clack and a small bell whose pitch climbs one pentatonic step per tin: a full board plays a rising scale */
      tin: k => { const t = T0(); osc('sine', 190, t, .1, .26, .002, 80); noise(t, .05, .17, 'bandpass', 1500, 700, 1.3, .001); osc('square', 700, t, .03, .05, .001); const f = N(k + 3); metal(f, t + .03, .7, .12, [1, 2.76]); osc('sine', f * 2, t + .03, .3, .04, .002); },
      lock: k => R.tin(k),
      /* SIGNATURE 3: the bundle unties. Cloth rustle, a soft pop, then a koto glissando that lands on the new symbol's note */
      untie: sym => { const t = T0(); for (let i = 0; i < 7; i++) noise(t + i * .035 + Math.random() * .02, .06, .05 + Math.random() * .04, 'bandpass', 2500 + Math.random() * 3000, 0, 1.3, .004);
        osc('sine', 300, t + .3, .1, .16, .003, 900); noise(t + .3, .05, .1, 'bandpass', 1800, 900, 1);
        const land = Math.min(sym, 7) + 2; for (let i = 0; i < 5; i++) koto(N(Math.max(0, land - 4 + i)), t + .36 + i * .055, .06 + i * .008, i === 4 ? 1.3 : .5); },
      beat: () => { const t = T0(); taiko(t, .5, 90); taiko(t + .2, .35, 90); noise(t, .5, .05, 'bandpass', 400, 2400, 1.2, .2); },
      drawers: () => { const t = T0(); for (let i = 0; i < 5; i++) { osc('sine', 120 + i * 10, t + i * .05, .1, .15, .002, 70); noise(t + i * .05, .08, .1, 'lowpass', 700, 200); } },
      pour: () => { const t = T0(); noise(t, .45, .12, 'bandpass', 700, 2200, 2.2, .06); for (let i = 0; i < 6; i++) osc('sine', 500 + Math.random() * 400, t + .05 + i * .07, .07, .035, .004, 1100); tok(t, 800, .08); },
      empty: () => { const t = T0(); osc('triangle', 260, t, .35, .1, .01, 150); noise(t, .3, .05, 'lowpass', 500, 150, .8, .03); },
      reset: () => { const t = T0(); [0, 4, 7, 10].forEach((n, i) => koto(N(n), t + i * .07, .07, .8)); osc('sine', 140, t, .3, .2, .01, 60); },
      kettle: () => { const t = T0(); noise(t, .9, .09, 'bandpass', 3500, 5200, 4, .15); osc('sine', 1200, t, .8, .045, .15, 1700); osc('sine', 1210, t, .8, .04, .15, 1710); },
      collect: i => { const t = T0(); osc('sine', 700 + (i % 8) * 90, t, .09, .07, .003, 1400); },
      jackpot: kind => { const t = T0(), b = kind === 'major' ? 9 : kind === 'minor' ? 6 : 4; bell(N(b) / 2, t, 1.1, 2); koto(N(b), t + .05, .1, 1.2); koto(N(b + 2), t + .14, .1, 1.2); if (kind === 'major') { taiko(t, 1); shaku(N(b + 3), t + .1, 1.4, .08); } },
      gate: () => { const t = T0(); tok(t, 700, .16); bell(N(2), t + .04, .8, 1.2); osc('sine', 100, t, .25, .2, .004, 60); },
      clink: c => { const t = T0(), f = N(5 + c) * 1.5; metal(f, t, .35, .1, [1, 2.76]); noise(t, .02, .08, 'highpass', 6000, 0); },
      /* SIGNATURE 2: KITE LAUNCH. A windy sweep rising with a shakuhachi note, a string twang, a taiko hit as the kite leaves; the row's tins clink after */
      kite: () => { const t = T0(); noise(t, 1.2, .24, 'bandpass', 250, 3800, 1.5, .5); noise(t + .1, 1, .1, 'highpass', 2000, 6000, .8, .5);
        shaku(N(7), t + .02, 1.1, .11); osc('triangle', 330, t + .5, .5, .13, .002, 300); koto(N(3), t + .5, .12, .8); osc('sawtooth', 110, t + .5, .2, .03, .002, 140);
        taiko(t + .58, 1.3, 105); noise(t + .58, .5, .12, 'lowpass', 700, 150); [0, 1, 2, 3, 4].forEach(i => osc('sine', 1500 + i * 180, t + .8 + i * .175, .08, .03, .002)); },
      grand: () => { const t = T0(); bell(147, t, 1.5, 3.2); for (let i = 0; i < 10; i++) taiko(t + .35 + i * (.28 - i * .012), .6 + i * .05, 110); for (let i = 0; i < 14; i++) koto(N(i % 11) * (i > 10 ? 2 : 1), t + .5 + i * .06, .07, 1.4); shaku(N(7), t + 1, 2.2, .1); noise(t + 1.8, 1.4, .12, 'bandpass', 500, 4000, 1, .6); },
      bonus: () => { const t = T0(); if (bType === 'fs') { for (let i = 0; i < 5; i++) taiko(t + i * .1, .8 + i * .1, 100 + i * 14); [0, 2, 4, 6, 8].forEach((n, i) => koto(N(n + 3), t + .4 + i * .08, .08, 1.2)); shaku(N(4), t + .6, 1.6, .08); return; } if (bType === 'super') { bell(147, t, 1.5, 3.4); for (let i = 0; i < 8; i++) taiko(t + i * .08, .7 + i * .06, 96 + i * 10); for (let i = 0; i < 14; i++) koto(N(i + 2), t + .5 + i * .06, .07, 1.5); shaku(N(7), t + .8, 2.2, .1); return; } bell(220, t, 1.2, 2.4); taiko(t + .1, 1.2, 100); taiko(t + .5, 1, 100); for (let i = 0; i < 8; i++) koto(N(i), t + .7 + i * .08, .08, 1.2); shaku(N(7), t + 1.2, 1.8, .08); },
      outro: () => { const t = T0(); if (bType === 'super') { [9, 7, 5, 3, 0].forEach((n, i) => koto(N(n), t + i * .18, .09, 1.8)); bell(N(0) / 2, t + .6, 1.2, 3.2); metal(N(4), t + .9, 2.4, .08, [1, 2.4]); return; } [7, 5, 3, 0].forEach((n, i) => koto(N(n), t + i * .2, .08, 1.4)); bell(N(0) / 2, t + .7, 1, 2.4); noise(t + .9, .8, .05, 'bandpass', 800, 300, 1, .3); },
      big: lv => { const t = T0(); for (let i = 0; i < lv + 1; i++) bell(N(2 + i * 2) / 2, t + i * .26, .9, 1.6);
        for (let i = 0; i < 4 + lv * 3; i++) taiko(t + .1 + i * Math.max(.07, .22 - i * .01), .5 + i * .04, 120); shaku(N(7), t + .2, 1.5, .1);
        [0, 2, 4, 6, 8, 10].slice(0, 3 + lv).forEach((n, i) => koto(N(n), t + .3 + i * .1, .07, 1.2)); },
      /* FS drum scatter lands: a taiko hit that climbs a step per drum, a skin slap and a small gong */
      drum: k => { const t = T0(); taiko(t, .95, 88 + k * 12); noise(t, .04, .12, 'bandpass', 2200, 900, 1.2, .001); bell(N(3 + k * 2) / 2, t + .03, .5, 1.1); },
      /* steeping pour: a ladle glug (bubbly sine blips) + a warm koto note that goes higher with each darker level */
      steep: lv => { const t = T0(); noise(t, .5, .1, 'bandpass', 600, 1700, 2, .05); for (let i = 0; i < 7; i++) osc('sine', 260 + Math.random() * 120 + i * 40, t + .04 + i * .06, .06, .05, .004, 520 + i * 60);
        koto(N(2 + (lv || 1) * 2), t + .3, .08, 1); noise(t + .34, .35, .05, 'bandpass', 3800, 2500, 3, .1); },
      /* a drawer reaches its top level: paper flutter, a rising whoosh, a bright bell, the kite catches the wind */
      kitePop: () => { const t = T0(); for (let i = 0; i < 6; i++) noise(t + i * .03, .05, .07, 'bandpass', 3000 + i * 500, 0, 1.4, .003); noise(t + .1, .8, .18, 'bandpass', 300, 3600, 1.4, .3); shaku(N(8), t + .05, .9, .09); bell(N(9), t + .35, .9, 1.4); koto(N(11), t + .4, .09, 1); },
      /* x(1+boost) chip pops at the end of the string */
      xchip: b => { const t = T0(); metal(N(4 + Math.min(8, b)) , t, .6, .12, [1, 2.76]); tok(t, 1500, .08); },
      retrig: () => { const t = T0(); for (let i = 0; i < 6; i++) taiko(t + i * .09, .45 + i * .08, 100 + i * 10); [0, 2, 4, 5, 7, 9, 11].forEach((n, i) => koto(N(n + 2), t + .3 + i * .06, .08, 1.1)); bell(N(5), t + .35, 1, 2); },
      /* kai: bonus trigger build-up (a rising wind + a bell that climbs; the drums version beats faster, the super version adds a gold shimmer) */
      antRise: type => { const t = T0(), n = type === 'super' ? 9 : 7; noise(t, 1.7, .15, 'bandpass', 260, 4600, 1.6, .9);
        for (let i = 0; i < n; i++) bell(N(i * (type === 'tin' ? 2 : 1) + 1) / 2, t + .15 + i * (type === 'super' ? .17 : .2), .5 + i * .06, .9);
        if (type !== 'tin') for (let i = 0; i < 6; i++) taiko(t + i * (.32 - i * .03), .35 + i * .1, 92 + i * 6); else for (let i = 0; i < 4; i++) taiko(t + .2 + i * .36, .5 + i * .12, 100);
        if (type === 'super') for (let i = 0; i < 12; i++) osc('sine', 1800 + i * 170, t + .3 + i * .1, .12, .025, .003); },
      hold: () => { const t = T0(); noise(t, 1.4, .1, 'bandpass', 300, 2600, 1.4, .7); taiko(t + .1, .45, 84); taiko(t + .48, .38, 84); taiko(t + .9, .5, 84); },
      titleHit: (type, end) => { const t = T0();
        if (end) { [3, 2, 0].forEach((d, i) => koto(N(d + 2), t + i * .16, .08, 1.3)); bell(N(0) / 2, t + .3, .8, 2); return; }
        taiko(t, 1.4, 96); bell(N(2) / 2, t, 1.3, 2.6);
        if (type === 'tin') { for (let i = 0; i < 7; i++) koto(N(i), t + .1 + i * .06, .08, 1); noise(t, .6, .1, 'bandpass', 800, 3600, 1.2, .1); }
        else if (type === 'fs') { for (let i = 0; i < 4; i++) taiko(t + .12 + i * .1, .9 + i * .1, 110 + i * 16); [0, 2, 4].forEach((d, i) => koto(N(d + 4), t + .25 + i * .08, .08, 1.2)); shaku(N(4), t + .2, 1.2, .07); }
        else { for (let i = 0; i < 6; i++) taiko(t + .08 + i * .08, .7 + i * .1, 100 + i * 14); [0, 2, 3, 4, 6, 8, 9, 11].forEach((d, i) => koto(N(d + 3), t + .2 + i * .06, .08, 1.6)); bell(N(4), t + .15, 1.2, 3); bell(N(7) / 2, t + .3, 1, 3); shaku(N(7), t + .3, 2, .09);
          for (let i = 0; i < 10; i++) osc('sine', 2000 + i * 240, t + .4 + i * .07, .1, .03, .003); } },
      tinPop: tier => { const t = T0(); if (tier === 0) { osc('sine', 900, t, .07, .05, .002, 1500); return; }
        metal(N(5 + tier * 2), t, .5 + tier * .2, .08 + tier * .03, [1, 2.76]); osc('sine', 700 + tier * 300, t, .1, .06 + tier * .02, .002, 1700);
        if (tier >= 2) { for (let i = 0; i < 4; i++) koto(N(4 + i * 2 + tier), t + .05 + i * .05, .05 + tier * .01, .8); } if (tier >= 3) { taiko(t, .9, 100); bell(N(3) / 2, t, 1, 1.8); } },
      charge: () => { const t = T0(); noise(t, .85, .13, 'bandpass', 400, 5200, 2, .5); osc('sawtooth', 110, t, .8, .04, .4, 330); for (let i = 0; i < 6; i++) osc('sine', 700 + i * 210, t + i * .12, .1, .035, .003); taiko(t + .35, .5, 90); taiko(t + .7, .6, 90); },
      tick: k => { const t = T0(); osc('triangle', 650 + k * 900, t, .05, .1, .001); tok(t, 1200 + k * 600, .06); },
      feverOn: () => { const t = T0(); koto(N(4), t, .08, .6); }
    };
    return R;
  },
  /* a faint high wind over the cliff and, now and then, a far wind chime (furin) */
  ambience(kit) {
    const { ctx, osc, metal } = kit; const bed = kit.bed({ lowpass: 420, gain: .3, level: .02, loopSec: 4, crack: { gain: [.002, .004], f: [3000, 1500], q: 2, every: [2500, 5000], len: [.05, .1] } });
    let tm = 0, run = false;
    const chime = () => { if (!run) return; if (!S.isTurbo()) { const t = ctx.currentTime + .02, f = [1568, 1760, 2093, 2349][Math.floor(Math.random() * 4)]; for (let i = 0; i < 1 + Math.floor(Math.random() * 3); i++) metal(f * (i ? 1.19 : 1), t + i * .3, 1.6, .018, [1, 2.4]); }
      tm = setTimeout(chime, 9000 + Math.random() * 14000); };
    return { start() { run = true; bed.start(); clearTimeout(tm); tm = setTimeout(chime, 4000); }, stop() { run = false; clearTimeout(tm); bed.stop(); } };
  },
  particleColor: (p, a) => p.w ? 'rgba(0,0,0,0)' : p.c ? `rgba(255,${190 + (p.l % 50)},70,${a})` : `rgba(255,${200 + (p.l % 40)},${215 + (p.l % 30)},${a})`,
  init() {
    for (let i = 0; i < ROWS * COLS; i++) { const d = document.createElement('div'); d.className = 'cell'; $('grid').append(d); cells.push(d); }
    $('fxl').insertAdjacentHTML('beforeend', '<div id="ctBanner"><b></b><small></small></div>');
    { const sky = document.createElement('div'); sky.id = 'ctKites'; let top = $('scene'); while (top.parentElement && top.parentElement.id !== 'stage') top = top.parentElement; top.after(sky); }   // between the scene and the frame/Koji
    { const host = $('fsBox').parentElement; host.insertAdjacentHTML('beforeend', '<div id="ctRules" hidden></div><div id="ctTitle" hidden><i class="tcR"></i><div class="tcB"><b></b><small class="tcS"></small></div></div><div id="ctWipe" hidden></div>');
      $('fsBox').insertAdjacentHTML('beforeend', '<span id="ctPips"><i></i><i></i><i></i></span>');
      const v = document.createElement('div'); v.id = 'ctVeil'; $('ctKites').after(v); }
    buildPaytable();
  },
  paintIdle() { paint([[1, 0, 3, 6, 2], [4, 7, 0, 5, 1], [2, 6, 8, 0, 3], [5, 1, 4, 7, 0]]); dropAll(); },
  splashArt: () => splashSvg(false),
  roundStart() { document.querySelectorAll('#gates .gate').forEach(g => g.classList.remove('on', 'launch', 'charge')); holdOff(); board.clear(); bType = null; $('ctKites').replaceChildren(); skyN = 0; },
  clearBoard: async () => { if (inBonus && bType === 'tin') { if (!bonusOpened) { bonusOpened = true; await bonusOpen(); } else await wait(40); return; } await dropOut(); },
  restoreBoard() { if (lastGrid) paint(lastGrid); },
  baseSpin: R => ({ initialGrid: R.initialGrid, step: R.cascadeSteps[0] || null, tins: R.tins, bought: R.bought }),
  playSpin,
  showTrigger,
  bonusMode(on) {
    inBonus = on; bonusOpened = false; $('scene').classList.toggle('dusk', on); $('scene').classList.toggle('sup', on && bType === 'super'); $('ctKites').classList.toggle('sup', on && bType === 'super'); $('grid').classList.toggle('steepG', on && bType !== 'tin'); $('grid').classList.toggle('supG', on && bType === 'super'); $('grid').classList.toggle('tinG', on && bType === 'tin');
    document.body.classList.remove('ctTin', 'ctFs', 'ctSup'); holdOff();
    if (on) {
      document.body.classList.add(BCLS[bType] || 'ctTin'); setEnv(bType); wipe(bType); curStake = curStake || 1;
      char('bonus', 1400 * T()); document.querySelector('#fsBox small').textContent = bType === 'tin' ? S.cfg.fsLabel : 'SPINS LEFT';
      if (bType === 'tin') { S.music.intensity(.12); setFs(3); pips(3, true); }
      else { const B = bonusR.bonus; fsBoost = B.boost; fsMax = B.maxLevel; fsLv = null; setFs(B.startSpins); S.music.intensity(bType === 'super' ? .3 : .08); cells.forEach(d => { d.classList.remove('scat'); }); }
      setRules(bType);
    } else {
      setEnv(null); setRules(null); $('fsBox').classList.remove('low'); S.music.intensity(0); applyLevels(null); setupOutro();
      const sk = $('ctKites'); if (sk.children.length) sk.animate([{ opacity: 1 }, { opacity: 1, offset: .6 }, { opacity: 0 }], { duration: 3200 * T(), fill: 'forwards' }).finished.then(() => { sk.replaceChildren(); sk.getAnimations().forEach(a => a.cancel()); }, () => {});
    }
  }
};
});
