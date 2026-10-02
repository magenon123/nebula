/* Grumble & Brine: Deep Salvage. The only slot-specific client logic. The shell (shell/slot-shell.js) calls these hooks.
 * Pure renderer: the engine/server returns the whole round (steps, drifts, wins, jelly values); nothing here computes an outcome.
 * Round payload: see plans/grumble-and-brine/01-features-math.md section 11 (initialGrid, cascadeSteps[]/steps[] of {kind, grid, jellies, moves, wins, exits}). */
SlotShell.boot(SLOT_CFG, S => {
const { $, sfx, wait, T, say, shake, flash, embers, char, pop, fmt, sleep } = S;
const ROWS = 3, COLS = 5, JELLY = 9, BUOY = 10;
const NAMES = ['Old Boot', 'Tin Can', 'Message Bottle', 'Rusty Key', 'Brass Compass', 'Barnacle Anchor', 'Coin Purse', 'Rusty Harpoon', 'Pearl Clam'];
const ED = S.cfg.engineData;
let lastGrid = null, lastJ = [], tideNow = 0;

/* ---------- MUSIC: "salvage shanty" (base, 6/8, D dorian) and "deep dive" (bonus, slow swell). All synthesised by shell/slot-music.js ---------- */
const MIN = [0, 3, 7], MAJ = [0, 4, 7];
const dm = [0, MIN], gM = [5, MAJ], am = [7, MIN], cM = [10, MAJ];
const baseOf = c => 50 + (c[0] > 6 ? c[0] - 12 : c[0]);                       // D3 = 50; Am -> A2, C -> C3
/* melody per bar of an 8-bar phrase: [step (eighths), length, scale degree from D4]; step 0 notes are fixed, others follow the seeded walk */
const SH_A = [[[0, 3, 4], [3, 1, 5], [4, 1, 4], [5, 1, 3]], [[0, 3, 2], [3, 3, 4]], [[0, 3, 5], [3, 1, 4], [4, 1, 3], [5, 1, 5]], [[0, 3, 4], [3, 3, 3]],
  [[0, 3, 2], [3, 1, 3], [4, 1, 4], [5, 1, 2]], [[0, 3, 3], [3, 3, 1]], [[0, 3, 4], [3, 1, 6], [4, 1, 5], [5, 1, 4]], [[0, 4, 0], [4, 2, 2]]];
const SH_B = [[[0, 3, 7], [3, 1, 6], [4, 1, 4], [5, 1, 6]], [[0, 3, 5], [3, 3, 3]], [[0, 3, 6], [3, 3, 3]], [[0, 2, 5], [2, 1, 4], [3, 3, 3]],
  [[0, 3, 4], [3, 1, 5], [4, 1, 4], [5, 1, 2]], [[0, 3, 4], [3, 3, 6]], [[0, 3, 6], [3, 1, 4], [4, 1, 3], [5, 1, 1]], [[0, 6, 4]]];
function musicDefs() {
  const PH_A = [dm, dm, gM, gM, dm, cM, am, dm], PH_B = [dm, gM, cM, gM, dm, am, cM, am];
  const shanty = {
    tempo: 100, barBeats: 2, spb: 6, swing: 0, bars: 32, key: 62, scale: [0, 2, 3, 5, 7, 9, 10], seed: 41, gain: 1, phrase: 8,
    layers: { bass: { gain: 1, wet: .12 }, stomp: { enter: 2, gain: 1, wet: .05 }, strum: { enter: 2, gain: 1, wet: .15 }, reed: { enter: 4, gain: 1, wet: .22 }, reedpad: { enter: 8, int: .3, gain: 1, wet: .3 },
      banjo: { int: .35, enter: 8, gain: 1, wet: .15 }, perc: { enter: 6, gain: 1, wet: .08 }, hi: { int: .65, gain: 1, wet: .25 }, fx: { gain: 1, wet: .5 } },
    bar(M) {
      const ph = M.i >> 3, k = M.i & 7, C = (ph % 2 ? PH_B : PH_A)[k], b = baseOf(C), q = C[1], third = q[1], mel = (ph % 2 ? SH_B : SH_A)[k], wk = Math.max(-1, Math.min(1, M.walk));
      M.upright('bass', M.st(0), b - 12, { g: .2 }); M.upright('bass', M.st(3), b - 12 + 7, { g: .16 });
      if (M.rnd() < .3 && k !== 7) M.upright('bass', M.st(5), b - 12 + 7 + (third === 4 ? -2 : -2), { g: .09, d: .25 });
      M.stomp('stomp', M.st(0), .6); M.stomp('stomp', M.st(3), .45);
      const ch = [b + 12, b + 12 + third, b + 12 + 7, b + 24];
      [1, 2, 4, 5].forEach(s => { const soft = (s === 2 || s === 5) ? 1 : .75; if (s === 5 && M.rnd() < .15) return; M.strum('strum', M.st(s), ch.slice(0, 3), { kind: s % 2 ? 'banjo' : 'uke', g: .026 * soft, d: .13, sp: .01 }); });
      mel.forEach(([s, len, d]) => { const m = M.note(d + (s ? wk : 0)); M.reed('reed', M.st(s), len * M.sd * .96, m, { g: .045, a: .06, r: .14, cut: 2600 });
        if (M.int > .35 && len >= 1) M.pluck('banjo', M.st(s), m + 12, { kind: 'banjo', g: .028, d: .24 }); });
      if (M.int > .3) M.reed('reedpad', M.t0, M.bd * .98, ch[1], { g: .022, a: .35, r: .4, cut: 1500, vd: 5 }), M.reed('reedpad', M.t0, M.bd * .98, ch[2], { g: .018, a: .35, r: .4, cut: 1500, vd: 5 });
      if (M.int > .65 && k % 2 === 0) mel.forEach(([s, len, d]) => { if (len >= 3) M.reed('hi', M.st(s), len * M.sd * .9, M.note(d, 1), { g: .02, a: .12, cut: 2400 }); });
      for (let s = 0; s < 6; s++) M.shaker('perc', M.st(s) , s % 3 === 0 ? .8 : .45);
      if (M.int > .35) M.stomp('perc', M.st(1), .15);
      if (k === 3 && ph % 2 === 0) M.sonar('fx', M.st(0), M.note(4, 1), .8);
      if (k === 5 && ph % 2 === 1) M.sonar('fx', M.st(0), M.note(7, 1), .6);
      if (M.rnd() < .35) { const n = 2 + Math.floor(M.rnd() * 3), s0 = Math.floor(M.rnd() * 3); for (let j = 0; j < n; j++) M.bubble('fx', M.st(s0) + j * .09, M.note(4 + Math.floor(M.rnd() * 5), 1), .7 + M.rnd() * .6); }
      if (k === 7 && ph >= 1) M.slide('fx', M.st(3), 2.2 * M.sd, 57, 50, { g: .05 });
    }
  };
  const PHD = [[dm, dm, cM, cM, am, am, gM, gM], [dm, dm, gM, gM, cM, cM, am, am], [dm, cM, am, gM, dm, am, gM, dm]];
  const dive = {
    tempo: 72, barBeats: 2, spb: 6, swing: 0, bars: 24, key: 62, scale: [0, 2, 3, 5, 7, 9, 10], seed: 77, gain: 1, phrase: 4,
    layers: { pad: { gain: 1, wet: .4 }, drone: { gain: 1, wet: .1 }, heart: { gain: 1, wet: .1 }, whale: { gain: 1, wet: .7 }, reed: { int: .3, gain: 1, wet: .5 }, ping: { int: .6, gain: 1, wet: .3 },
      uke: { int: .6, gain: 1, wet: .3 }, hi: { int: .95, gain: 1, wet: .5 }, perc: { int: .95, gain: 1, wet: .1 } },
    bar(M) {
      const C = PHD[M.i >> 3][M.i & 7], k = M.i & 7, b = baseOf(C), third = C[1][1], wk = Math.max(-1, Math.min(1, M.walk));
      M.pad('pad', M.t0, M.bd * .98, [b, b + 7, b + 12, b + 12 + third], { wave: 'triangle', det: 6, cut: 650, cut2: 950, q: .5, a: .9, r: 1.2, g: .075 });
      M.sub('drone', M.t0, M.bd * .97, b - 12, { g: .24, a: .15, r: .4 });
      M.heartbeat('heart', M.st(0) + .02, .55); if (M.int > .3) M.heartbeat('heart', M.st(3), .3);
      if (M.i % 4 === 1) M.whale('whale', M.st(1), 4.2, 57, M.i % 8 === 1 ? 64 : 62, M.i % 8 === 1 ? 60 : 57, { g: .055 });
      if (k % 2 === 0) [[0, 5, 4], [3, 4, 3]].forEach(([s, len, d]) => M.reed('reed', M.st(s), len * M.sd * .92, M.note(d + (s ? wk : 0), 0), { g: .034, a: .45, r: .5, cut: 1500, vd: 6 }));
      if (k % 2 === 1) M.reed('reed', M.st(0), 5 * M.sd, M.note(k === 7 ? 0 : 2 + wk), { g: .03, a: .5, r: .6, cut: 1400, vd: 6 });
      if (M.i % 2 === 0) M.sonar('ping', M.st(0), b + 24 + 7, .55, 1.8);
      if (M.rnd() < .5) for (let j = 0, n = 2 + Math.floor(M.rnd() * 3); j < n; j++) M.bubble('ping', M.st(Math.floor(M.rnd() * 5)) + j * .08, M.note(4 + Math.floor(M.rnd() * 5), 1), .7);
      [0, 1, 2, 3, 2, 1].forEach((n, j) => M.pluck('uke', M.st(j), [b + 12, b + 12 + third, b + 19, b + 24][n], { kind: 'uke', g: .026, d: .38 }));
      M.pad('hi', M.t0, M.bd * .98, [b + 24, b + 24 + third, b + 31], { wave: 'sine', det: 4, cut: 2000, a: 1, r: 1.2, g: .05 });
      M.stomp('perc', M.st(0), .45); M.stomp('perc', M.st(3), .3); for (let s = 0; s < 6; s += 1) M.shaker('perc', M.st(s), .35);
    }
  };
  const stingers = {
    win(K) { const { V, dest, t } = K; V.metal(dest, t, K.mtof(K.note(4, 0)), 1.1, .07, [1, 2.756, 5.404]); [0, 2, 4].forEach((d, i) => V.pluck(dest, t + i * .09, K.note(d * 1 + 4, 0) + (i ? 12 : 0), { kind: 'uke', g: .06, d: .5 })); V.bubble(dest, t + .3, K.note(8, 0), 1); },
    bonus(K) { const { V, dest, t } = K; [4, 6, 7].forEach((d, i) => V.sonar(dest, t + i * .34, K.note(d, 1), 1, 1.8)); V.slide(dest, t + .7, 1.4, 62, 38, { g: .07 }); V.heartbeat(dest, t + 1.9, .8); }
  };
  return { base: shanty, bonus: dive, stingers };
}

/* ---------- the board: 5 reels x 3 rows ---------- */
const FX = S.fx, GRID = $('grid'), CWD = 136, CHT = 136;
const cells = [];
const at = (r, c) => cells[r * COLS + c];
const after = (ms, fn) => setTimeout(fn, ms * T());
const ctr = list => { let x = 0, y = 0; list.forEach(([r, c]) => { const b = at(r, c).getBoundingClientRect(); x += b.left + b.width / 2; y += b.top + b.height / 2; }); return [x / list.length, y / list.length]; };
const ctrG = (r, c) => [(c + .5) * CWD, (r + .5) * CHT];
function paint(grid, jellies = []) {
  lastGrid = grid; lastJ = jellies;
  const jm = {}; jellies.forEach(j => jm[j.r * COLS + j.c] = j.v);
  grid.forEach((row, r) => row.forEach((s, c) => {
    const d = at(r, c); FX.reset(d); d.className = 'cell' + (s === JELLY ? ' wild' : s === BUOY ? ' scatter' : '');
    d.innerHTML = `<svg class="g"><use href="#s${s}"/></svg>` + (s === JELLY && jm[r * COLS + c] != null ? `<span class="m">x${jm[r * COLS + c]}</span>` : '');
  }));
  GRID.classList.remove('focus'); clearLinks();
}
/* ---------- drops and exits (see shell FX): reel by reel, anticipation, squash and stretch, overshoot, settle ---------- */
const dropOpt = (r, c, base = 0, fast = false) => fast
  ? { delay: base + c * 26 + (2 - r) * 30 + Math.random() * 14, dist: (r + 1) * CHT * .8 + 50, tilt: (Math.random() - .5) * 4, dur: 400 }
  : { delay: base + c * 92 + (2 - r) * 40 + Math.random() * 16, dist: (r + 1) * CHT + 60, tilt: (Math.random() - .5) * 5, dur: 560 };
/* drop the listed [r,c]; one landing sound per reel at its touchdown; returns ms (unscaled) to the last touchdown */
function dropCells(list, base = 0, fast = false) {
  let end = 0; const col = {};
  list.forEach(([r, c]) => { const o = dropOpt(r, c, base, fast); FX.drop(at(r, c), o); const t = o.delay + o.dur * .58; end = Math.max(end, t); col[c] = Math.min(col[c] == null ? 1e9 : col[c], t); });
  Object.keys(col).forEach(c => after(col[c], () => sfx.land(+c === COLS - 1 ? 2 : 1)));
  return end;
}
const ALL = [].concat(...Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => [r, c])));
const dropAll = () => dropCells(ALL);
async function dropOut() {
  setStrip([], 0); clearLinks(); GRID.classList.remove('focus'); let end = 0;
  ALL.forEach(([r, c]) => { const o = { delay: c * 52 + (2 - r) * 30, dist: (3 - r) * CHT + 90, rot: (c % 2 ? 1 : -1) * (2 + c % 3), dur: 420 }; FX.out(at(r, c), o); end = Math.max(end, o.delay + o.dur); });
  await wait(end * .86);
}

/* ---------- links: a taut braided rope pulled reel to reel through the winners, knotted at each, spurs to extra winners in a reel ---------- */
const lnkB = () => FX.layer('lnkB', 7), lnkT = () => FX.layer('lnkT', 10);
function clearLinks() { ['lnkB', 'lnkT'].forEach(id => { const l = document.getElementById(id); if (l) l.replaceChildren(); }); }
function fadeLinks(ms) { ['lnkB', 'lnkT'].forEach(id => { const l = document.getElementById(id); if (!l) return; [...l.children].forEach(g => { if (g.tagName !== 'defs') g.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(4px)' }], { duration: ms * T(), fill: 'forwards', easing: 'ease-in' }); }); }); setTimeout(clearLinks, (ms + 40) * T()); }
function restCells() { cells.forEach(d => FX.rest(d)); }
let ropeUid = 0;
const knot = (parent, x, y, ang, at0) => {
  const g = FX.el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})` }, parent), k = FX.el('g', {}, g);
  FX.el('rect', { x: -6.5, y: -11.5, width: 13, height: 23, rx: 4.5, fill: '#b8864a', stroke: '#1b1008', 'stroke-width': 3 }, k);
  FX.el('path', { d: 'M-6 -7.5 L6 -3 M-6 -1 L6 3.5 M-6 5.5 L6 9.5', stroke: '#5a3a18', 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none' }, k);
  FX.el('path', { d: 'M-2 -11 L-5 -18 M3 -11 L6 -17 M-3 11 L-6 18 M2 11 L5 17', stroke: '#1b1008', 'stroke-width': 3.2, 'stroke-linecap': 'round', fill: 'none' }, k);
  FX.el('path', { d: 'M-2 -11 L-5 -18 M3 -11 L6 -17 M-3 11 L-6 18 M2 11 L5 17', stroke: '#d9b377', 'stroke-width': 1.4, 'stroke-linecap': 'round', fill: 'none' }, k);
  k.animate([{ transform: 'scale(.2,1.8)', opacity: 0 }, { transform: 'scale(1.4,.7)', opacity: 1, offset: .35 }, { transform: 'scale(.9,1.14)', offset: .66 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320 * T(), delay: at0 * T(), easing: 'cubic-bezier(.3,0,.3,1)', fill: 'both' });
  return g;
};
/* list = [[r,c],...] winners; t0 = ms (unscaled) from now; wi = index of this win (rope offset). Returns {arrive:{col: ms}, end: ms} */
function rope(list, t0, wi) {
  const byCol = {}; list.forEach(([r, c]) => (byCol[c] = byCol[c] || []).push(r));
  const cols = Object.keys(byCol).map(Number).sort((a, b) => a - b); let prev = 1;
  const anchors = cols.map(c => { const rows = byCol[c], r = rows.reduce((b, x) => Math.abs(x - prev) < Math.abs(b - prev) ? x : b, rows[0]); prev = r; return { c, r, rows }; });
  const off = wi ? (wi % 2 ? 1 : -1) * 6 : 0, P = anchors.map(a => { const [x, y] = ctrG(a.r, a.c); return [x + (Math.random() - .5) * 6, y + 16 + off + (Math.random() - .5) * 6]; });
  const f = P[0], l = P[P.length - 1], pts = [[f[0] - 74, f[1] + 24], ...P, [l[0] + 74, l[1] + 30]];
  const taut = FX.curve(pts, 0), slack = FX.curve(pts, 30), cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = cum[cum.length - 1], draw = 130 + 120 * Math.max(1, anchors.length - 1), k = T(), B = lnkB(), T2 = lnkT(), id = 'rm' + (++ropeUid);
  const mask = FX.el('mask', { id, maskUnits: 'userSpaceOnUse', x: -300, y: -300, width: 1400, height: 1000 }, FX.el('defs', {}, B)), mp = FX.el('path', { d: taut, fill: 'none', stroke: '#fff', 'stroke-width': 80, 'stroke-linecap': 'round' }, mask);
  const Ln = mp.getTotalLength(); mp.style.strokeDasharray = Ln; mp.animate([{ strokeDashoffset: Ln }, { strokeDashoffset: 0 }], { duration: draw * k, delay: t0 * k, easing: 'linear', fill: 'both' });
  const g = FX.el('g', { mask: `url(#${id})` }, B), mk = (w, col, extra = {}) => FX.el('path', Object.assign({ d: slack, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra), g);
  const strands = [mk(15.5, '#1b1008'), mk(10, '#c9a066'), mk(10, '#7a5226', { 'stroke-dasharray': '3.2 7.6', 'stroke-linecap': 'butt' }), mk(2.4, '#f3dca8', { 'stroke-dasharray': '17 19', transform: 'translate(0 -2.7)' })];
  const tw = t0 + draw;   // pulled taut: the slack goes out of the rope with a little overshoot, then the line hums
  strands.forEach(p => p.animate([{ d: `path("${slack}")` }, { d: `path("${taut}")` }], { duration: 300 * k, delay: tw * k, easing: 'cubic-bezier(.2,1.7,.4,1)', fill: 'forwards' }));
  g.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)', offset: .2 }, { transform: 'translateY(2.4px)', offset: .45 }, { transform: 'translateY(-1px)', offset: .7 }, { transform: 'none' }], { duration: 420 * k, delay: (tw + 120) * k, easing: 'ease-out' });
  const arrive = {};
  anchors.forEach((a, i) => { const ci = i + 1, at0 = t0 + cum[ci] / tot * draw, p = P[i], q0 = pts[ci - 1], q1 = pts[ci + 1], ang = Math.atan2(q1[1] - q0[1], q1[0] - q0[0]) * 180 / Math.PI;
    arrive[a.c] = at0; knot(T2, p[0], p[1], ang, at0);
    a.rows.forEach(r => { if (r === a.r) return; const e = ctrG(r, a.c), sy = e[1] + 14, d = FX.curve([[p[0], p[1]], [p[0] + (Math.random() - .5) * 10, (p[1] + sy) / 2], [e[0], sy]], 0), sp = FX.el('g', {}, B);
      FX.el('path', { d, fill: 'none', stroke: '#1b1008', 'stroke-width': 12.5, 'stroke-linecap': 'round' }, sp); const sb = FX.el('path', { d, fill: 'none', stroke: '#c9a066', 'stroke-width': 7.5, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }, sp);
      sp.firstChild.setAttribute('pathLength', 1); sp.firstChild.setAttribute('stroke-dasharray', 1);
      [sp.firstChild, sb].forEach(p2 => p2.animate([{ strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: .97, opacity: 1, offset: .05 }, { strokeDashoffset: 0, opacity: 1 }], { duration: 160 * k, delay: (at0 + 70) * k, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'both' }));
      knot(T2, e[0], sy, 90, at0 + 200); arrive[a.c + ':' + r] = at0 + 200; }); });
  return { arrive, end: tw + 300 };
}
const SHARD = [['#7a5232', '#4a2f1c', '#b08a5a'], ['#aeb6bd', '#6e7880', '#d8dde0'], ['#7fd1a0', '#3e8a63', '#e8f6ee'], ['#f2c14a', '#b8871e', '#fff1b8'], ['#d9a441', '#8a5a1e', '#8fe0e6'], ['#6c7882', '#3a444c', '#a9b6bf'],
  ['#b88a52', '#6e4a22', '#f2c14a'], ['#a5502a', '#5a3a2a', '#c9ced4'], ['#f1e4d4', '#c79aa0', '#fff6ea'], ['#7ff4e8', '#3fb7c9', '#d6fffa'], ['#e8503a', '#f2c14a', '#ffffff']];
/* put the winners into their win pose, each when the rope reaches its reel. Returns {end}: when the last pose is over (ms) */
function presentList(list, R, extra = 0) {
  let last = 0; list.forEach(([r, c], i) => { const dl = (R.arrive[c + ':' + r] != null ? R.arrive[c + ':' + r] : R.arrive[c]) + 24 + r * 26 + extra; FX.act(at(r, c), dl, c); last = Math.max(last, dl); });
  return last;
}

/* ---------- Current Strip + Drift chain ---------- */
const lanes = [...document.querySelectorAll('#strip .lane')];
let lastChain = 0;
function setStrip(jellies, chain) {
  lanes.forEach((ln, c) => {
    const js = jellies.filter(j => j.c === c), had = ln.querySelector('.chip'), sum = js.reduce((a, j) => a + j.v, 0);
    ln.classList.toggle('on', js.length > 0);
    if (!js.length) { if (had) had.remove(); return; }
    const txt = 'x' + sum;
    if (!had) ln.insertAdjacentHTML('beforeend', `<span class="chip">${txt}</span>`);
    else if (had.textContent !== txt) { had.textContent = txt; had.style.animation = 'none'; void had.offsetWidth; had.style.animation = ''; }
  });
  const ch = $('chain'); if (chain === 0) lastChain = 0; ch.classList.toggle('on', chain > 0);
  if (chain > 0 && chain !== lastChain) { lastChain = chain; $('chainN').textContent = 'x' + chain; ch.classList.remove('bump'); void ch.offsetWidth; ch.classList.add('bump'); }
}

/* ---------- Tide Gauge (Deep Dive only) ---------- */
function setTide(n, anim) {
  const t = $('tide'), up = n > tideNow, tv = $('tideV'); tideNow = n;
  t.classList.remove('lv0', 'lv1', 'lv2', 'lv3'); t.classList.add('lv' + n); tv.textContent = '+' + n;
  if (anim && up) { t.classList.remove('pulse', 'shake'); void t.offsetWidth; t.classList.add('pulse', 'shake'); sfx.tide(n); setTimeout(() => t.classList.remove('pulse', 'shake'), 950 * T()); shake(.4 + n * .35);
    tv.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.7,1.4)', offset: .25 }, { transform: 'scale(.92)', offset: .55 }, { transform: 'scale(1)' }], { duration: 620 * T(), easing: 'ease-out' }); if (n >= 3) flash(2.5); }
}

/* ---------- effects ---------- */
function popWin(w, stake) { const [x, y] = ctr(w.cells); pop(x, y, '+' + fmt(w.payout * stake)); }
const buoyCells = grid => { const o = []; grid.forEach((row, r) => row.forEach((s, c) => { if (s === BUOY) o.push([r, c]); })); return o; };
const maxV = js => js.reduce((a, j) => Math.max(a, j.v), 1);

/* one board evaluation: a rope is pulled through every winning way, reel by reel; each winner acts when the rope reaches it; pays pop; WIN updates */
async function evalStep(st, n, ctx, run) {
  if (st.wins.length) {
    GRID.classList.add('focus'); let endAll = 0;
    const cellT = new Map();
    st.wins.forEach((w, i) => {
      const t0 = i * 110, R = rope(w.cells, t0, i), lastC = Math.max(...w.cells.map(x => x[1]));
      w.cells.forEach(([r, c]) => { const dl = (R.arrive[c + ':' + r] != null ? R.arrive[c + ':' + r] : R.arrive[c]) + 24 + r * 26, key = r * COLS + c; if (!cellT.has(key) || dl < cellT.get(key).dl) cellT.set(key, { dl, r, c }); });
      Object.keys(R.arrive).filter(k => !String(k).includes(':')).forEach(c => after(R.arrive[c], () => sfx.link(+c)));
      after(R.arrive[lastC] + 90, () => popWin(w, ctx.stake)); endAll = Math.max(endAll, R.arrive[lastC]);
    });
    cellT.forEach(o => FX.act(at(o.r, o.c), o.dl, o.c));
    sfx.win(Math.min(7, n + st.wins.length - 1));
    if (n === 0 || st.kind === 'open') char('win', 1500 * T());
    const before = run; run += st.payout * ctx.stake; after(endAll, () => ctx.onWin(before, run));
    say(st.kind === 'drift' ? `DRIFT! x${maxV(st.jellies)}  +${fmt(st.payout * ctx.stake)}` : `SALVAGED +${fmt(st.payout * ctx.stake)}`, true);
    await wait(endAll + 760);
  } else if (st.kind === 'open') await wait(120);
  return run;
}

/* a Jelly that leaves the board floats up and away, wobbling */
function jellyLeave(r) {
  const d = at(r, 0), g = d.querySelector('svg.g'), x = d.getBoundingClientRect(); if (!g) return; const k = T();
  g.animate([{ transform: 'none', opacity: 1, offset: 0, easing: 'cubic-bezier(.3,0,.5,1)' }, { transform: 'translateY(4px) scale(1.08,.9)', opacity: 1, offset: .18, easing: 'cubic-bezier(.3,.6,.4,1)' }, { transform: 'translateY(-34px) rotate(-6deg) scale(.92,1.1)', opacity: 1, offset: .55, easing: 'ease-in' }, { transform: 'translateY(-110px) rotate(5deg) scale(.7,.8)', opacity: 0, offset: 1 }], { duration: 560 * k, fill: 'forwards' });
  FX.shards(x.left + x.width / 2, x.top + x.height / 2, 7, SHARD[9], { power: .6 });
}
/* a Jelly glides one reel left: wind-up, stretch through the middle, overshoot, settle; ghosts trail behind it */
function glide(m) {
  const d = at(m.r, m.to), k = T(), w = CWD, e = FX.ease; d.style.zIndex = 3; d.style.transformOrigin = '50% 70%';
  d.animate([
    { transform: `translateX(${w}px) scale(1,1)`, offset: 0, easing: 'cubic-bezier(.3,0,.4,1)' },
    { transform: `translateX(${w + 9}px) scale(.9,1.1)`, offset: .16, easing: 'cubic-bezier(.5,0,.5,1)' },
    { transform: `translateX(${w * .45}px) scale(1.18,.86)`, offset: .52, easing: 'cubic-bezier(.4,0,.5,1)' },
    { transform: 'translateX(-11px) scale(.95,1.07)', offset: .8, easing: e.out },
    { transform: 'translateX(3px) scale(1.03,.97)', offset: .92, easing: e.out },
    { transform: 'none', offset: 1 }], { duration: 470 * k, fill: 'both' });
  const L = lnkB(); for (let j = 0; j < 3; j++) {
    const [cx, cy] = ctrG(m.r, m.to + 1), gh = FX.el('g', {}, L); FX.el('use', { href: `#s${JELLY}`, x: cx - CWD * .45, y: cy - CHT * .45, width: CWD * .9, height: CHT * .9, opacity: .5 - j * .14 }, gh);
    gh.animate([{ transform: 'translateX(0) scale(1)', opacity: 0 }, { transform: `translateX(${-CWD * .35}px) scale(${.92 - j * .06},${1.04})`, opacity: 1, offset: .3 }, { transform: `translateX(${-CWD}px) scale(${.8 - j * .08})`, opacity: 0 }], { duration: (430 + j * 40) * k, delay: (60 + j * 55) * k, easing: 'cubic-bezier(.4,0,.5,1)', fill: 'both' });
  }
}

/* Drift: the old herd stays, everything else leaves (winners burst, the rest sinks), then the new board drops in while each Jelly glides one reel left (+1) */
async function driftStep(st, prev) {
  fadeLinks(200); setStrip(st.jellies, st.chain);
  say(`DRIFT! x${maxV(st.jellies)}`, true); char('special', 900 * T()); sfx.special(maxV(st.jellies));
  const keep = new Set(prev.jellies.filter(j => j.c > 0).map(j => j.r * COLS + j.c)), win = new Set(); prev.wins.forEach(w => w.cells.forEach(([r, c]) => win.add(r * COLS + c)));
  if (prev.exits.length) say('THE JELLY LEAVES THE BOARD', true);
  GRID.classList.remove('focus');
  cells.forEach((d, i) => {
    const r = Math.floor(i / COLS), c = i % COLS; if (keep.has(i)) { FX.rest(d); return; } if (c === 0 && prev.exits.some(e => e.r === r)) return;
    if (win.has(i)) FX.burst(d, SHARD[lastGrid[r][c]] || SHARD[0], { n: 7, power: .85, rot: (c % 2 ? 1 : -1) * 5, dur: 240 });
    else FX.out(d, { delay: c * 18, dist: 150, up: 5, dur: 260, rot: (c % 2 ? 1 : -1) * 3 });
  });
  await wait(250);
  paint(st.grid, st.jellies);
  const jm = new Set(st.jellies.map(j => j.r * COLS + j.c)), list = ALL.filter(([r, c]) => !jm.has(r * COLS + c));
  const end = dropCells(list, 0, true); sfx.drop(); st.moves.forEach(glide);
  await wait(Math.max(end, 380) + 60);
}

/* buoys on the board: sonar pings as each lands (reel c touches down at ~ c*92 + 380 ms) */
function pingBuoys(list) { list.forEach(([, c], i) => after(c * 92 + 400, () => sfx.scatter(i))); }

async function playSpin(sp, run, ctx) {
  const stake = ctx.stake, steps = sp.steps || [], open = steps[0], jel = open ? open.jellies : [];
  char('spin', 950 * T());
  if (sp.tideBefore != null) setTide(sp.tideBefore, true);
  paint(sp.initialGrid, jel); setStrip(jel, 0); sfx.drop(); const e0 = dropAll();
  const buoys = buoyCells(sp.initialGrid);
  if (buoys.length) pingBuoys(buoys);
  if (jel.length) after(520, () => sfx.jelly());
  await wait(e0 + 200);
  if (buoys.length && sp.tideBefore != null && buoys.length >= 2) { char('special', 900 * T()); }
  if (sp.retrigger) { say(`+${sp.retrigger} DIVES!`, true); const R = rope(buoys, 0, 0); presentList(buoys, R); buoys.forEach(([r, c]) => at(r, c).classList.add('scat')); sfx.retrigger(); await wait(R.end + 600); fadeLinks(200); restCells(); }
  else if (sp.scatter && sp.scatter.count === 2 && !sp.bought) { say('ONE MORE BUOY...', true); char('wince', 1100 * T()); await wait(500); }
  let n = 0;
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i], last = i === steps.length - 1;
    if (i > 0) await driftStep(st, steps[i - 1]);
    run = await evalStep(st, n, ctx, run);
    if (st.wins.length) n++;
    if (st.exits && st.exits.length) { st.exits.forEach(e => jellyLeave(e.r)); setStrip(st.jellies.filter(j => j.c > 0), st.chain); sfx.leave(); await wait(last ? 300 : 120); }
    if (last) { GRID.classList.remove('focus'); if (st.wins.length) { fadeLinks(240); restCells(); } }
  }
  if (sp.tideAfter != null) { setTide(sp.tideAfter, true); if (sp.tideAfter > (sp.tideBefore || 0)) await wait(350); }
  if (sp.scatter && sp.scatter.payout > 0) {
    const bc = sp.scatter.cells; GRID.classList.add('focus'); const R = rope(bc, 0, 0); presentList(bc, R); bc.forEach(([r, c]) => at(r, c).classList.add('scat'));
    after(R.end - 100, () => { const [x, y] = ctr(bc); pop(x, y, '+' + fmt(sp.scatter.payout * stake)); const before = run; run += sp.scatter.payout * stake; ctx.onWin(before, run); sfx.win(4); });
    await wait(R.end + 700); fadeLinks(240); GRID.classList.remove('focus'); restCells();
  }
  if (!steps.length && !buoys.length) await wait(100);
  return run;
}

/* the Sonar Buoys that triggered the Deep Dive ping on the board before the splash: a rope is pulled through them */
async function showTrigger(R0) {
  const list = (R0.scatter && R0.scatter.cells) || buoyCells(lastGrid);
  cells.forEach(d => FX.rest(d)); GRID.classList.add('focus'); clearLinks();
  const R = rope(list, 0, 0); presentList(list, R); list.forEach(([r, c]) => at(r, c).classList.add('scat'));
  say(list.length >= 3 ? 'PING! PING! PING!' : 'SONAR PING! DEEP DIVE', true); char('special', 1100 * T());
  list.slice().sort((a, b) => a[1] - b[1]).forEach(([, c], i) => after(R.arrive[c], () => sfx.scatter(i)));
  await wait(R.end + 900);
  say('SONAR PING! DEEP DIVE', true); await wait(500);
}

/* ---------- Game Info paytable (engine data x payScale, never retyped) ---------- */
{
  const sc = ED.scatterPay || {};
  const f = v => v == null || v === 0 ? '<td class="no">-</td>' : `<td>${+v.toFixed(2)}x</td>`;
  $('ptab').innerHTML = '<tr><th>SYMBOL</th><th>3</th><th>4</th><th>5</th></tr>' +
    ED.paytable.slice().reverse().map(p => `<tr><td><div class="nm"><svg viewBox="0 0 64 64"><use href="#s${p.id}"/></svg>${p.name}</div></td>${f(p.pays[3])}${f(p.pays[4])}${f(p.pays[5])}</tr>`).join('') +
    `<tr><td><div class="nm"><svg viewBox="0 0 64 64"><use href="#s${BUOY}"/></svg>Sonar Buoy (Scatter)</div></td>${f(sc[3])}${f(sc[4])}${f(sc[5])}</tr>` +
    `<tr><td><div class="nm"><svg viewBox="0 0 64 64"><use href="#s${JELLY}"/></svg>Lantern Jelly (Wild)</div></td><td colspan="3">Counts as its x-value in symbols</td></tr>`;
}

/* ---------- sound: sonar pings, brass bells, bubbles and rubbery thunks (all synthesised) ---------- */
let ambBonus = null;
return {
  music: musicDefs,
  sfx(kit) {
    const { ctx, bus, env, osc, noise, metal, st, T0 } = kit;
    const pg = kit.ping({ time: .32, fb: .45, lp: 2500, wet: .5 });
    const blup = (t, f = 300, to = 900, peak = .09, d = .07) => osc('sine', f, t, d, peak, .004, to);
    const horn = (t, d, peak, base = 55) => [1, 1.5, 2, 3].forEach((m, i) => [-7, 7].forEach(c => {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = env(t, d * .45, peak / (1 + i * .5), d * .55);
      o.type = 'sawtooth'; o.frequency.value = base * m; o.detune.value = c; f.type = 'lowpass'; f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(1000, t + d * .5); f.Q.value = 1.2;
      o.connect(f).connect(g).connect(bus); o.start(t); o.stop(t + d + .1); }));
    const flurry = (t, n, span) => { for (let i = 0; i < n; i++) blup(t + Math.random() * span, 250 + Math.random() * 300, 700 + Math.random() * 600, .05 + Math.random() * .03, .06); };
    const bell = (f, t, p = 1, d = 1.2) => { metal(f, t, d, .13 * p, [1, 2.756, 5.404, 8.933]); noise(t, .04, .1 * p, 'bandpass', 2600, 1200, 1.4); };
    const SC = [0, 2, 5, 7, 9, 12, 14, 17];
    const R = {
      ui: () => { const t = T0(); osc('triangle', 330, t, .07, .16, .002, 220); blup(t + .01, 600, 900, .06, .04); },
      tap: () => { const t = T0(); osc('triangle', 330, t, .07, .16, .002, 220); blup(t + .01, 800, 1300, .08, .05); },
      hit: () => { const t = T0(); noise(t, .08, .17, 'highpass', 3000, 6000, .7); osc('sine', 700, t, .07, .1, .004, 1500); },
      spin: () => { const t = T0(); noise(t, .2, .16, 'bandpass', 220, 1400, .8, .04); osc('sine', 140, t, .2, .14, .02, 80); blup(t + .1, 300, 900, .09); },
      drop: () => { const t = T0(); noise(t, .45, .11, 'bandpass', 1800, 300, .7, .03); },
      land: r => { const t = T0(); osc('sine', 130, t, .13, .24, .002, 62); noise(t, .06, .15, 'lowpass', 500, 0); if (r === 2) metal(300, t, .3, .04); },
      win: n => { const t = T0(), f = 392 * st(SC[Math.min(n, 7)]); metal(f, t, 1.0, .13, [1, 2.756, 5.404]); osc('triangle', f / 2, t, .5, .08); noise(t, .08, .03, 'highpass', 5000, 0); },
      jelly: () => { const t = T0(); osc('sine', 520, t, .45, .1, .02, 1040); osc('sine', 780, t + .06, .45, .06, .02, 1560); },
      special: m => { const t = T0(), k = st(Math.min(12, 2 * Math.max(0, (m || 1) - 1)));
        osc('sine', 400 * k, t, .35, .12, .01, 1200 * k); osc('sine', 400 * k, t, .35, .1, .01, 1200 * k, pg);
        const o = ctx.createOscillator(), l = ctx.createOscillator(), lg = ctx.createGain(), g = env(t, .05, .1, .4);
        o.frequency.value = 220 * k; l.frequency.value = 5; lg.gain.value = 30; l.connect(lg).connect(o.frequency); o.connect(g).connect(bus); o.start(t); l.start(t); o.stop(t + .5); l.stop(t + .5);
        metal(520 * st((m || 1) * 2), t + .28, .5, .12, [1, 2.756, 5.404]); },
      leave: () => { const t = T0(); osc('sine', 600, t, .35, .08, .01, 200); blup(t + .1, 400, 1000, .05); },
      scatter: n => { const t = T0(); osc('sine', 1318, t, 1.4, .14, .01, undefined, pg); if (n === 1) osc('sine', 1976, t + .02, 1.2, .1, .01, undefined, pg); if (n >= 2) osc('sine', 1568, t + .02, 1.2, .1, .01, undefined, pg); },
      retrigger: () => { const t = T0(); [0, 7, 12].forEach((s, i) => osc('sine', 1046 * st(s), t + i * .12, 1.2, .1, .01, undefined, pg)); },
      tide: n => { const t = T0(); osc('sine', 110, t, .8, .3, .01, 62); noise(t, .6, .14, 'lowpass', 900, 150); metal(180 * st(n * 2), t + .05, 1.2, .1); },
      bonus: () => { const t = T0(); [1046, 1318, 1568].forEach((f, i) => osc('sine', f, t + i * .36, 1.4, .14, .01, undefined, pg)); horn(t + .6, 2.4, .07);
        bell(220, t + 1, 1.2, 2.0); osc('sine', 50, t + 1, 1.6, .35, .01, 36);
        const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = env(t + 1.2, .3, .09, 1.5); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t + 1.2); o.frequency.exponentialRampToValueAtTime(40, t + 2.8);
        f.type = 'lowpass'; f.frequency.value = 400; o.connect(f).connect(g).connect(bus); o.start(t + 1.2); o.stop(t + 3); flurry(t + 1.3, 10, 1.2);
        [0, 4, 7, 12].forEach((n, i) => metal(330 * st(n), t + 1.8 + i * .12, 1.6, .06)); },
      outro: () => { const t = T0(); [0, 4, 7, 12, 16].forEach((n, i) => metal(392 * st(n), t + i * .13, 1.3, .1)); horn(t, 1.6, .045, 82.5); [1500, 2100, 1800].forEach((f, i) => osc('sine', f, t + 1 + i * .15, .12, .05, .001)); },
      big: lv => { const t = T0(); for (let i = 0; i < lv; i++) bell(300 * (1 + i * .06), t + i * .28, .9);
        if (lv >= 3) { const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = env(t + .2, .2, .14, 1.4); o.type = 'sawtooth'; o.frequency.setValueAtTime(45, t + .2); o.frequency.exponentialRampToValueAtTime(32, t + 1.7); f.type = 'lowpass'; f.frequency.value = 300; o.connect(f).connect(g).connect(bus); o.start(t + .2); o.stop(t + 1.9); noise(t + .2, 1.5, .28, 'lowpass', 900, 120); }
        [0, 4, 7, 12, 16, 19, 24].slice(0, 3 + lv).forEach((n, i) => metal(440 * st(n), t + .3 + i * .1, 1.2, .08)); flurry(t, 20, 1.5); osc('sine', 110, t, 1.4, .5, .01, 24); },
      tick: k => { const t = T0(); osc('triangle', 650 + k * 900, t, .05, .12, .001); noise(t, .02, .08, 'highpass', 6000, 0); },
      /* the rope reaches a reel: a taut twang and a knot thunk, rising along the reels */
      link: c => { const t = T0(), f = 220 * st(SC[Math.min(c * 2, 7)]); osc('triangle', f, t, .22, .09, .004, f * .97); osc('sine', 120, t, .08, .12, .002, 80); noise(t, .05, .09, 'bandpass', 900, 500, 1.2, .002); blup(t + .03, 500 + c * 90, 900, .04, .05); },
      feverOn: () => { const t = T0(); noise(t, .5, .12, 'highpass', 3000, 800, .8); osc('sine', 90, t, .5, .14, .02, 140); metal(260, t + .1, .8, .1); }
    };
    return R;
  },
  /* deep water hum, bubble bursts, a far whale, rare ship-bell clank; in the dive a sonar heartbeat */
  ambience(kit) {
    const { ctx, out, osc, metal } = kit; let src = null, g = null, tm = [], hb = 0, run = false, inBonus = false;
    const later = (fn, lo, hi) => { const id = setTimeout(() => { tm = tm.filter(x => x !== id); if (run) { if (!S.isTurbo()) fn(); later(fn, lo, hi); } }, lo + Math.random() * (hi - lo)); tm.push(id); };
    return {
      start() { if (run) return; run = true;
        const b = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) { l = (l + (Math.random() * 2 - 1) * .02) / 1.02; d[i] = l * 3; }
        src = ctx.createBufferSource(); src.buffer = b; src.loop = true; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
        const lf = ctx.createOscillator(), lg = ctx.createGain(); lf.frequency.value = .07; lg.gain.value = 120; lf.connect(lg).connect(f.frequency); lf.start();
        g = ctx.createGain(); g.gain.value = .05 * 6; src.connect(f).connect(g).connect(out); src.start(); this.lf = lf;
        later(() => { const n = 3 + Math.floor(Math.random() * 4), t = ctx.currentTime + .02; for (let i = 0; i < n; i++) osc('sine', 250 + Math.random() * 100, t + i * .08, .06, .03, .004, 800); }, 4000, 9000);
        later(() => { const t = ctx.currentTime + .02, o = ctx.createOscillator(), f2 = ctx.createBiquadFilter(), e = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(140, t + 1.5); o.frequency.linearRampToValueAtTime(100, t + 3);
          f2.type = 'lowpass'; f2.frequency.value = 400; e.gain.setValueAtTime(.0001, t); e.gain.linearRampToValueAtTime(.025, t + 1); e.gain.linearRampToValueAtTime(.0001, t + 3); o.connect(f2).connect(e).connect(kit.bus); o.start(t); o.stop(t + 3.1); }, 14000, 25000);
        later(() => metal(180, ctx.currentTime + .02, 2, .02), 30000, 50000);
        if (inBonus) this.bonus(true); },
      stop() { run = false; tm.forEach(clearTimeout); tm = []; clearInterval(hb); hb = 0; try { src && src.stop(); this.lf && this.lf.stop(); } catch {} src = null; },
      bonus(on) { inBonus = on; if (g) g.gain.value = on ? .08 * 6 : .05 * 6; clearInterval(hb); hb = 0;
        if (on && run) hb = setInterval(() => { if (!S.isTurbo()) osc('sine', 220, ctx.currentTime + .01, .5, .03, .01); }, 1600); }
    };
  },
  /* only event bursts are drawn; the shell's ambient rising specks (p.w) stay invisible: no floating dots/bubbles (owner preference) */
  particleColor: (p, a) => p.w ? 'rgba(0,0,0,0)' : p.c ? `rgba(255,${190 + (p.l % 50)},70,${a})` : `rgba(${170 + (p.l % 60)},250,255,${a})`,
  init() { for (let i = 0; i < ROWS * COLS; i++) { const d = document.createElement('div'); d.className = 'cell'; $('grid').append(d); cells.push(d); } },
  paintIdle() { paint([[0, 2, 4, 6, 8], [3, 5, 1, 7, 2], [4, 0, 6, 3, 5]]); dropAll(); },
  roundStart() { setStrip([], 0); },
  clearBoard: dropOut,
  restoreBoard() { if (lastGrid) paint(lastGrid, lastJ); },
  baseSpin: R => ({ initialGrid: R.initialGrid, steps: R.cascadeSteps, scatter: R.scatter, bought: R.bought }),
  playSpin,
  showTrigger,
  bonusMode(on) { $('tide').classList.toggle('on', on); setTide(0, false); }
};
});
