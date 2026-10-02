/* EmberClaw slot module: the only EmberClaw-specific client logic. The shell (shell/slot-shell.js) calls these hooks.
 * Pure renderer: the server returns every cascade; nothing here computes an outcome.
 * Round payload (slot-defined part): initialGrid, openingGrid?, openingEvents?, cascadeSteps[{clusters,clearedCells,payout,newCells,coreHeat,reforgeEvents,wilds,grid}];
 * bonus.spins[] have the same shape plus spinIndex / retrigger. */
SlotShell.boot(SLOT_CFG, S => {
const { $, sfx, wait, T, say, shake, flash, embers, char, pop, fmt } = S;
const TIER = ['low','low','low','mid','mid','high','high','wild','scatter','high'], COIN = 9;
const NAMES = ['Iron Shard','Copper Ingot','Silver Chain','Molten Hammer','Rune-Etched Tongs','Dragonbone Blade','Crown of Cinders'];
/* paytable shown in Game Info: the engine's PAYTABLE x CFG.payScale, injected by the build (never typed by hand), so the screen shows what is actually paid */
const ED = S.cfg.engineData, round2 = v => +v.toFixed(2);
const PT = ED.paytable.map(r => r.map(v => round2(v * ED.payScale)));
let lastGrid = null, lastWilds = [];

/* ---------- MUSIC: "dark forge" (base, 80 bpm) and "furnace drive" (bonus, 112 bpm). D phrygian: D Eb F G A Bb C. All synthesised by shell/slot-music.js ---------- */
const MIN = [0, 3, 7], MAJ = [0, 4, 7], P5 = [0, 7];
/* chord per bar: [semitones above D, quality]. Only chords built from D phrygian notes (C5 = C+G power chord, no E) */
const dm = [0, MIN], eb = [1, MAJ], c5 = [10, P5], gm = [5, MIN], bb = [8, MAJ];
const rootOf = c => 50 + (c[0] > 6 ? c[0] - 12 : c[0]);                      // D3 = 50
const voicing = c => { const r = rootOf(c), q = c[1]; return [r, r + 7, r + 12, r + 12 + (q[1] === 7 ? 7 : q[1])]; };
/* motifs: [step, length in steps, scale degree from D4]; strong notes (step 0) never move, others follow the seeded walk (+-1) */
const EM_A = [[[0, 6, 4], [8, 4, 5], [12, 4, 4]], [[0, 8, 3], [8, 4, 2], [12, 4, 3]]];
const EM_B = [[[0, 6, 4], [8, 4, 6], [12, 4, 5]], [[0, 12, 4], [12, 4, 1]]];
const EM_END = [[[0, 6, 4], [8, 4, 5], [12, 4, 4]], [[0, 12, 1], [12, 4, 0]]];
function musicDefs() {
  const forgeBase = {
    tempo: 80, barBeats: 4, spb: 16, swing: .08, bars: 16, key: 62, scale: [0, 1, 3, 5, 7, 8, 10], seed: 17, gain: .24, phrase: 4,
    layers: { pad: { gain: 1 }, sub: { gain: 1 }, taiko: { enter: 2, gain: 1 }, crack: { enter: 4, gain: 1, wet: .1 }, anvil: { enter: 4, int: .15, gain: 1 },
      lead: { enter: 8, gain: 1, wet: .3 }, choirhi: { int: .5, enter: 12, gain: 1, wet: .35 }, roll: { int: .8, gain: 1 } },
    bar(M) {
      const C = [dm, dm, eb, dm, dm, gm, eb, c5, bb, bb, c5, dm, gm, eb, c5, eb][M.i], r = rootOf(C), v = voicing(C), last4 = M.i % 4 === 3;
      M.pad('pad', M.t0, M.bd * .98, v, { cut: 600, cut2: 880, g: .06, a: 1, r: 1.5, det: 9 });
      M.sub('sub', M.t0, M.bd * .85, r - 12, { g: .24 });
      M.taiko('taiko', M.st(0), 1); M.taiko('taiko', M.st(8), .7);
      if (M.i % 2) M.taiko('taiko', M.st(11), .32);
      if (last4) [12, 13, 14, 15].forEach((s, k) => M.taiko('taiko', M.st(s), .35 + k * .16 + (M.i === 15 ? .15 : 0)));
      if (M.i % 2 === 0) M.metal('anvil', M.st(12), M.mtof(r + 12), 1.4, .06);
      if (M.i === 7 || M.i === 15) M.metal('anvil', M.st(0), M.mtof(r), 2.4, .08);
      for (let s = 0; s < 16; s++) { if (M.rnd() < .2) M.crackle('crack', M.st(s) + M.rnd() * .05, .5 + M.rnd()); if (s % 4 === 2 && M.rnd() < .7) M.hat('crack', M.st(s), 1, { g: .035, f: 7500 }); }
      if (M.int > .8) for (let s = 0; s < 16; s += 2) if (s % 8) M.taiko('roll', M.st(s), .22 + (s % 4 ? 0 : .1));
      const mot = (M.i < 15 ? (M.i % 4 < 2 ? EM_A : (M.i < 12 ? EM_B : EM_END)) : EM_END)[M.i % 2], wk = Math.max(-1, Math.min(1, M.walk));
      mot.forEach(([s, len, d]) => { const m = M.note(d + (s ? wk : 0)); M.pad('lead', M.st(s), len * M.sd * .92, [m], { det: 6, cut: 1250, cut2: 850, q: .8, a: .14, r: .4, g: .075 }); });
      if (M.i % 2 === 0) M.choir('choirhi', M.t0, M.bd * 1.9, [r + 24, r + 31, r + 36], { vow: 'o', vow2: 'a', g: .05, a: 1.2, r: 1.6 });
    }
  };
  const forgeBonus = {
    tempo: 112, barBeats: 4, spb: 16, swing: 0, bars: 24, key: 62, scale: [0, 1, 3, 5, 7, 8, 10], seed: 29, gain: .3, phrase: 4,
    layers: { choir: { gain: 1, wet: .4 }, pad: { gain: 1 }, bass: { gain: 1 }, kick: { enter: 1, gain: 1 }, anvil: { enter: 2, gain: 1 }, hat: { enter: 3, gain: 1, wet: .08 },
      lead: { enter: 4, gain: 1, wet: .28 }, lead2: { int: .45, enter: 8, gain: 1, wet: .3 }, riser: { gain: 1 }, roll: { int: .7, gain: 1 } },
    bar(M) {
      const G = [dm, dm, bb, c5, dm, dm, eb, c5, gm, gm, eb, dm, gm, bb, c5, eb, dm, dm, bb, c5, gm, eb, c5, eb], C = G[M.i], r = rootOf(C), v = voicing(C), g8 = M.i % 8, rise = g8 / 7;
      M.choir('choir', M.t0, M.bd * .98, [r + 12, r + 19, r + 24, r + 12 + (C[1][1] === 7 ? 7 : C[1][1])], { vow: M.i % 2 ? 'o' : 'a', vow2: M.i % 2 ? 'a' : 'o', g: .06, a: .6, r: .9 });
      M.pad('pad', M.t0, M.bd * .98, v, { cut: 520 + rise * 380, cut2: 760 + rise * 620, g: .05, a: .5, r: .8 });
      for (let s = 0; s < 16; s += 2) { const hit = s % 8 === 0 ? 1 : s % 4 === 0 ? .7 : .45, oct = (s === 6 || s === 14) ? 12 : 0; M.sub('bass', M.st(s), M.sd * 1.5, r - 12 + oct, { g: .15 * hit + .05, a: .01, r: .06 }); }
      [0, 4, 8, 12].forEach((s, k) => M.taiko('kick', M.st(s), k % 2 ? .55 : .85, { d: .5 }));
      [4, 12].forEach(s => M.metal('anvil', M.st(s), M.mtof(r + 12), .8, .05));
      for (let s = 0; s < 16; s++) if (s % 2) M.hat('hat', M.st(s), 1, { g: .03, f: 8000 }); else if (M.rnd() < .25) M.crackle('hat', M.st(s), .6);
      if (M.i % 4 === 3) [10, 11, 12, 13, 14, 15].forEach((s, k) => M.taiko('roll', M.st(s), .3 + k * .11));
      if (g8 >= 6) M.riser('riser', M.t0, M.bd, { g: .05 + (g8 - 6) * .02, f1: 300 + (g8 - 6) * 500, f2: 2600 + (g8 - 6) * 1200 });
      if (g8 === 0 && M.i > 0) M.metal('anvil', M.t0, M.mtof(r), 2.2, .07);
      /* driving fanfare: eighth-note figure on the chord (root, 5th, b2/3rd), the walk nudges the answer bar */
      const fig = g8 % 2 ? [[0, 2, 4], [2, 2, 5], [4, 2, 4], [6, 2, 3], [8, 4, 4], [12, 2, 3], [14, 2, 1]] : [[0, 2, 4], [2, 2, 4], [4, 2, 6], [6, 2, 5], [8, 4, 4], [12, 4, 4]], wk = Math.max(-1, Math.min(1, M.walk));
      fig.forEach(([s, len, d]) => { const m = M.note(d + (s ? wk : 0)); M.pad('lead', M.st(s), len * M.sd * .9, [m], { det: 6, cut: 1500, cut2: 1000, q: .8, a: .06, r: .22, g: .07 }); if (M.int > .45) M.pad('lead2', M.st(s), len * M.sd * .85, [m + 12], { det: 5, cut: 1800, cut2: 1300, a: .05, r: .18, g: .035 }); });
    }
  };
  const stingers = {
    win(K) { const { V, dest, t } = K; V.taiko(dest, t, .9); V.metal(dest, t + .02, K.mtof(62), 1.4, .09); V.pad(dest, t, .3, [K.note(0, -1), K.note(4, -1), K.note(0), K.note(4)], { cut: 900, cut2: 1400, a: .03, r: .7, g: .08 }); },
    bonus(K) { const { V, dest, t } = K; V.horn(dest, t, 1.6, [K.note(0, -2), K.note(4, -2), K.note(0, -1), K.note(4, -1)], { g: .09 }); [0, .4, .8].forEach((d, i) => V.taiko(dest, t + d, .9 - i * .1)); V.riser(dest, t, 1.4, { g: .05 }); V.metal(dest, t + 1.5, K.mtof(50), 2.2, .09); }
  };
  return { base: forgeBase, bonus: forgeBonus, stingers };
}

/* ---------- the board ---------- */
const FX = S.fx, GRID = $('grid'), CH = 110, CWD = 110;
const cells = [];
for (let i = 0; i < 30; i++) { const d = document.createElement('div'); d.className = 'cell'; $('grid').append(d); cells.push(d); }
const at = (r, c) => cells[r * 6 + c];
const after = (ms, fn) => setTimeout(fn, ms * T());
function paint(grid, wilds = []) {
  lastGrid = grid; lastWilds = wilds;
  const wm = {}; wilds.forEach(w => wm[w.r * 6 + w.c] = w.mult);
  grid.forEach((row, r) => row.forEach((s, c) => {
    const d = at(r, c); FX.reset(d); d.className = 'cell t-' + TIER[s] + (s === 7 ? ' wild' : s === 8 ? ' scatter' : s === COIN ? ' maxs' : '');
    d.innerHTML = `<svg class="g"><use href="#s${s}"/></svg>` + (s === 7 && wm[r * 6 + c] > 1 ? `<span class="m">x${wm[r * 6 + c]}</span>` : '');
  }));
  GRID.classList.remove('focus'); clearLinks();
}
/* ---------- drops and exits: staggered, with anticipation, squash and stretch, overshoot (see shell FX) ---------- */
const dropOpt = (r, c, base = 0) => ({ delay: base + (4 - r) * 78 + c * 15 + Math.random() * 24, dist: (r + 1) * CH + 70, tilt: (Math.random() - .5) * 5, dur: 580 });
/* drop the listed [r,c] cells; plays landing sounds per row; returns the ms (unscaled) until the last touchdown */
function dropCells(list, base = 0) {
  let end = 0; const rows = {};
  list.forEach(([r, c]) => { const o = dropOpt(r, c, base); FX.drop(at(r, c), o); const t = o.delay + o.dur * .58; end = Math.max(end, t); rows[r] = Math.min(rows[r] == null ? 1e9 : rows[r], t); });
  Object.keys(rows).forEach(r => after(rows[r], () => sfx.land(+r)));
  return end;
}
const ALL = [].concat(...Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, c) => [r, c])));
const dropAll = () => dropCells(ALL);
/* Row-by-row drop with the near-miss slowdown: once two Gems (or two MAX coins) have landed, the remaining rows hang a beat with a heartbeat. */
function dropTease(grid) {
  let base = 0, end = 0, tease = false; const seen = {}; [8, COIN].forEach(k => seen[k] = 0);
  for (let r = 4; r >= 0; r--) {
    if ([8, COIN].some(k => seen[k] >= 2)) { tease = true; base += 600; after(base - 540, () => { sfx.maxBeat(2); say('ONE MORE...', true); shake(.3); }); }
    end = Math.max(end, dropCells(Array.from({ length: 6 }, (_, c) => [r, c]), base));
    [8, COIN].forEach(k => { seen[k] += grid[r].filter(v => v === k).length; });
  }
  return { end, tease };
}
async function dropOut() {
  clearLinks(); GRID.classList.remove('focus'); let end = 0;
  ALL.forEach(([r, c]) => { const o = { delay: (4 - r) * 40 + c * 9, dist: (5 - r) * CH + 90, rot: (c % 2 ? 1 : -1) * (2 + (c * 7 % 4)), dur: 440 }; FX.out(at(r, c), o); end = Math.max(end, o.delay + o.dur); });
  await wait(end * .86);
}

/* ---------- links: molten seams between connected cells, hammered iron frame, iron chain links ---------- */
const lnkB = () => FX.layer('lnkB', 7), lnkT = () => FX.layer('lnkT', 10);
function clearLinks() { ['lnkB', 'lnkT'].forEach(id => { const l = document.getElementById(id); if (l) l.replaceChildren(); }); }
const ctrOf = (r, c) => [(c + .5) * CWD, (r + .5) * CH];
function seam(a, b, delay, dur) {
  /* the joint between two connected cells is welded: a jagged molten seam across the shared border, an iron link seated over it */
  const T2 = lnkT(), g = FX.el('g', {}, T2), len = Math.hypot(b[0] - a[0], b[1] - a[1]), dx = (b[0] - a[0]) / len, dy = (b[1] - a[1]) / len, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, half = CWD * .36, n = 6, pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n * 2 - 1, j = (i === 0 || i === n) ? 0 : (Math.random() - .5) * 8; pts.push([mx - dy * half * t + dx * j, my + dx * half * t + dy * j]); }
  const d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'), mk = (w, col) => FX.el('path', { d, pathLength: 1, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': 1 }, g);
  const crust = mk(11, '#24100a'), mid = mk(6.5, '#f0561a'), core = mk(2.6, '#ffe39a'), k = T();
  [crust, mid, core].forEach((p, i) => p.animate([{ strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: .98, opacity: 1, offset: .04 }, { strokeDashoffset: 0, opacity: 1 }], { duration: dur * k, delay: (delay + i * 14) * k, easing: 'cubic-bezier(.25,.7,.35,1)', fill: 'both' }));
  core.animate([{ stroke: '#ffe39a' }, { stroke: '#f58a30' }], { duration: 900 * k, delay: (delay + dur + 120) * k, fill: 'forwards' });
  mid.animate([{ stroke: '#f0561a' }, { stroke: '#9c2e12' }], { duration: 900 * k, delay: (delay + dur + 120) * k, fill: 'forwards' });
  /* an iron link seated across the seam */
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI + (Math.random() - .5) * 14;
  const lk = FX.el('g', { transform: `translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(${ang.toFixed(1)})` }, g), inner = FX.el('g', {}, lk);
  FX.el('rect', { x: -11, y: -6, width: 22, height: 12, rx: 6, fill: 'none', stroke: '#15100e', 'stroke-width': 7.5 }, inner); FX.el('rect', { x: -11, y: -6, width: 22, height: 12, rx: 6, fill: 'none', stroke: '#9aa3ad', 'stroke-width': 3.6 }, inner);
  FX.el('rect', { x: -9, y: -4.6, width: 18, height: 4, rx: 2, fill: 'none', stroke: '#e5eaee', 'stroke-width': 1.2, opacity: .8 }, inner);
  inner.animate([{ transform: 'scale(1.9,.5)', opacity: 0 }, { transform: 'scale(.82,1.2)', opacity: 1, offset: .45 }, { transform: 'scale(1.08,.94)', offset: .72 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300 * k, delay: (delay + dur * .6) * k, easing: 'cubic-bezier(.3,0,.3,1)', fill: 'both' });
  return g;
}
/* hammered iron frame round the whole cluster (boundary edges only), drawn from the centre outward */
function frameOf(cs, delay) {
  const L = lnkB(), set = new Set(cs.map(c => c.r * 6 + c.c)), g = FX.el('g', {}, L), segs = [], i4 = 5;
  cs.forEach(({ r, c }) => { const x = c * CWD, y = r * CH;
    if (!set.has((r - 1) * 6 + c) || r === 0) segs.push([x + i4, y + i4, x + CWD - i4, y + i4]);
    if (!set.has((r + 1) * 6 + c) || r === 4) segs.push([x + i4, y + CH - i4, x + CWD - i4, y + CH - i4]);
    if (!set.has(r * 6 + c - 1) || c === 0) segs.push([x + i4, y + i4, x + i4, y + CH - i4]);
    if (!set.has(r * 6 + c + 1) || c === 5) segs.push([x + CWD - i4, y + i4, x + CWD - i4, y + CH - i4]); });
  const d = segs.map(s => `M${s[0]} ${s[1]} L${s[2]} ${s[3]}`).join(' '), mk = (w, col) => FX.el('path', { d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }, g);
  mk(9, '#1a0e0a'); const m = mk(5, '#7b8590'), h = mk(2, '#ff9a3a'), k = T();
  g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260 * k, delay: delay * k, fill: 'both', easing: 'ease-out' });
  h.animate([{ stroke: '#ffd27a' }, { stroke: '#a8421a' }], { duration: 1000 * k, delay: delay * k, fill: 'forwards' }); void m; return g;
}
const key = c => c.r * 6 + c.c;
function planOf(k) {
  const cs = k.cells, mx = cs.reduce((a, c) => a + c.c, 0) / cs.length, my = cs.reduce((a, c) => a + c.r, 0) / cs.length;
  const root = cs.reduce((b, c) => Math.hypot(c.c - mx, c.r - my) < Math.hypot(b.c - mx, b.r - my) ? c : b, cs[0]);
  const depth = new Map([[key(root), 0]]), parent = new Map(), q = [root];
  while (q.length) { const a = q.shift(); cs.forEach(b => { if (!depth.has(key(b)) && Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1) { depth.set(key(b), depth.get(key(a)) + 1); parent.set(key(b), a); q.push(b); } }); }
  cs.forEach(c => { if (!depth.has(key(c))) depth.set(key(c), 1); });
  return { root, depth, parent, maxD: Math.max(...depth.values()) };
}
const STEP = 82, BURST_AT = 800;
const SHARD = [['#5a8f9c', '#2f4f5a', '#c9a24a'], ['#e0914f', '#a8582a', '#6aa58a'], ['#d4dbe1', '#8f9aa5', '#f1f5f8'], ['#9aa4af', '#ff8a2a', '#4a525a'], ['#6a7078', '#2f3338', '#c9ced4'],
  ['#efe3c6', '#bfae8c', '#8a7a5a'], ['#ffcf4a', '#e09a1a', '#d83a4a'], ['#ff7a1a', '#ffd27a', '#b83a10'], ['#ff5a9a', '#c02a6a', '#ffd0e4']];

/* present one cascade step's clusters. Returns {burstAt: Map(cellKey -> ms), last: ms of the last burst} */
function presentStep(st, stake, n) {
  const burst = new Map(); let last = 0;
  st.clusters.forEach((k, ki) => {
    const pl = planOf(k), base = ki * 150;
    k.cells.forEach(c => { const d = pl.depth.get(key(c)); FX.act(at(c.r, c.c), base + d * STEP, d); burst.set(key(c), base + d * STEP + BURST_AT); last = Math.max(last, base + d * STEP + BURST_AT); after(base + d * STEP, () => sfx.link(Math.min(d + n, 7))); });
    k.cells.forEach(c => { const p = pl.parent.get(key(c)); if (p) seam(ctrOf(p.r, p.c), ctrOf(c.r, c.c), base + (pl.depth.get(key(p))) * STEP + 25, STEP * .9); });
    frameOf(k.cells, base + pl.maxD * STEP + 120);
    after(base + 330 + pl.maxD * STEP * .4, () => popAt(k, k.payout * stake));
  });
  return { burst, last };
}


/* ---------- Forge Core (side mechanic) ---------- */
const tube = $('tube');
for (let i = 1; i <= 9; i++) { const e = document.createElement('i'); e.dataset.n = i; tube.append(e); }
let heatNow = 0;
function setHeat(h) {
  const prev = heatNow; if (h > prev) sfx.heat(Math.min(h, 9)); heatNow = h; try { S.music.intensity(Math.min(h, 9) / 9); } catch {} const lit = Math.min(h, 9), was = Math.min(prev, 9), k = T();
  /* segments ignite one after the other, each with a hand-keyed flare (swell, over-bright, settle) */
  [...tube.children].forEach(e => { const n = +e.dataset.n, on = n <= lit;
    if (on && n > was) { const dl = (n - was - 1) * 85; after(dl, () => e.classList.add('on'));
      e.animate([{ transform: 'scale(1)', filter: 'brightness(1)' }, { transform: 'scale(1.3,1.5)', filter: 'brightness(2.8)', offset: .28, easing: 'cubic-bezier(.2,.8,.3,1)' }, { transform: 'scale(.94,.92)', filter: 'brightness(1.4)', offset: .6 }, { transform: 'scale(1)', filter: 'brightness(1)' }], { duration: 560 * k, delay: dl * k, easing: 'ease-out' }); }
    else e.classList.toggle('on', on); });
  const hv = $('heatV'); document.body.style.setProperty('--heat', Math.min(h, 12));
  if (h > prev) { FX.tween(380 * k, e => { hv.textContent = Math.round(prev + (h - prev) * e); }); hv.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5,1.35)', offset: .3 }, { transform: 'scale(.94)', offset: .65 }, { transform: 'scale(1)' }], { duration: 500 * k, easing: 'ease-out' }); } else hv.textContent = h;
  [['pk3', 3], ['pk6', 6], ['pk9', 9]].forEach(([id, n]) => { const el = $(id), on = h >= n; if (on && !el.classList.contains('on')) after(Math.max(0, (n - was - 1)) * 85, () => el.classList.add('on')); else if (!on) el.classList.remove('on'); });
}

/* ---------- the smith ---------- */
function sparks() { const r = $('hotspot').getBoundingClientRect(); embers(22, r.left, r.top, true); }
function smithStrike() { char('swing', 1000 * T()); setTimeout(() => { sparks(); sfx.anvil(.8, 1); }, 600 * T()); }
function popAt(cluster, amount) {
  let sx = 0, sy = 0;
  cluster.cells.forEach(c => { const b = at(c.r, c.c).getBoundingClientRect(); sx += b.left + b.width / 2; sy += b.top + b.height / 2; });
  const n = cluster.cells.length; pop(sx / n, sy / n, '+' + fmt(amount));
}

async function playEvents(events) {
  for (const e of events || []) {
    if (e.type === 'detonate') { say(e.forced ? 'GUARANTEED DETONATION!' : 'CORE DETONATES · WILDS x2', true); char('boom', 1000); shake(true); flash(); sfx.boom(); embers(110); }
    else if (e.type === 'reforge') { say('THE CORE REFORGES A WILD', true); sfx.reforge(); sparks(); }
    for (const c of e.cells || []) { const d = at(c.r, c.c); d.classList.add('reforged'); }
    await wait(750);
  }
}

/* repaint a single cell (a refill or a clean-up) from a grid */
function paintCell(grid, wilds, r, c) {
  const wm = {}; wilds.forEach(w => wm[w.r * 6 + w.c] = w.mult); const s = grid[r][c], d = at(r, c); FX.reset(d);
  d.className = 'cell t-' + TIER[s] + (s === 7 ? ' wild' : s === 8 ? ' scatter' : s === COIN ? ' maxs' : '');
  d.innerHTML = `<svg class="g"><use href="#s${s}"/></svg>` + (s === 7 && wm[r * 6 + c] > 1 ? `<span class="m">x${wm[r * 6 + c]}</span>` : '');
}
let lastLand = 0;
const landOnce = r => { const n = performance.now(); if (n - lastLand > 80) { lastLand = n; sfx.land(r); } };
function fadeLinks(ms) { ['lnkB', 'lnkT'].forEach(id => { const l = document.getElementById(id); if (!l) return; [...l.children].forEach(g => g.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-3px)' }], { duration: ms * T(), fill: 'forwards', easing: 'ease-in' })); }); setTimeout(clearLinks, (ms + 40) * T()); }

/* step through one spin's cascade sequence */
async function playSpin(sp, runningFrom, ctx) {
  const stake = ctx.stake, onWin = ctx.onWin;
  smithStrike();
  paint(sp.initialGrid); sfx.drop(); const e0 = dropTease(sp.initialGrid).end;
  const coins = ALL.filter(([r, c]) => sp.initialGrid[r][c] === COIN);
  coins.forEach(([r, c], i) => after(e0 - 120 + i * 40, () => { sfx.maxLand(i); const b = at(r, c).getBoundingClientRect(); FX.shards(b.left + b.width / 2, b.top + b.height / 2, 12, SHARD[5], { power: 1 }); flash(1.2); }));
  await wait(e0 + 170);
  if (coins.length) {
    if (coins.length >= 3) {
      GRID.classList.add('focus'); coins.forEach(([r, c], i) => { FX.act(at(r, c), i * 200, i); at(r, c).classList.add('scat'); if (i) seam(ctrOf(coins[i - 1][0], coins[i - 1][1]), ctrOf(r, c), i * 200 - 100, 240); });
      sfx.maxWin(); char('big', 3000 * T()); shake(true); flash(); embers(220); say('MAX WIN!!!', true);
      const mp = (sp.maxPay || 0) * stake; after(700, () => { const b = at(coins[1][0], coins[1][1]).getBoundingClientRect(); pop(b.left + b.width / 2, b.top, '+' + fmt(mp)); onWin(0, mp); });
      await wait(1900); fadeLinks(240); GRID.classList.remove('focus'); return mp;
    }
    sfx.maxMiss(); say(coins.length === 2 ? 'SO CLOSE... TWO MAX COINS' : 'ONE MAX COIN', true); await wait(coins.length === 2 ? 900 : 400);
  }
  if (sp.openingGrid && sp.openingEvents && sp.openingEvents.length) { paint(sp.openingGrid, sp.openingWilds); await playEvents(sp.openingEvents); }
  setHeat(sp.startHeat || 0);
  let run = runningFrom, n = 0;
  for (const st of sp.cascadeSteps) {
    GRID.classList.add('focus'); if (n === 0) char('win', 1500);
    const pres = presentStep(st, stake, n), first = Math.min(...pres.burst.values()), lvl = st.payout >= 20 ? 1.6 : st.payout >= 6 ? .9 : .4;
    say(`${st.clusters.length > 1 ? st.clusters.length + ' CLUSTERS' : 'CLUSTER'}  +${fmt(st.payout * stake)}`, true); sfx.win(n++);
    after(first - 40, () => { sfx.shatter(); const before = run; run += st.payout * stake; onWin(before, run); fadeLinks(240); GRID.classList.remove('focus'); });
    st.clearedCells.forEach(q => { const tb = pres.burst.get(key(q)); after(tb, () => FX.burst(at(q.r, q.c), SHARD[q.sym] || SHARD[0], { n: 8 + Math.round(lvl * 3), power: .8 + lvl * .3, rot: (q.c % 2 ? 1 : -1) * 5 })); });
    after(pres.last, () => { shake(lvl); if (lvl > 1) embers(12, innerWidth / 2, innerHeight / 2, true); });
    /* every cleared cell is refilled right behind its own burst: no dead pause, the board never waits */
    let end = 0; after(first + 160, () => setHeat(st.coreHeat));
    st.newCells.forEach(q => { const tb = pres.burst.get(key(q)) + 200, o = { delay: (4 - q.r) * 24 + Math.random() * 30, dist: (q.r + 1) * CH + 70, tilt: (Math.random() - .5) * 5, dur: 560 };
      after(tb, () => { paintCell(st.grid, st.wilds, q.r, q.c); FX.drop(at(q.r, q.c), o); if (q.r === 0 || Math.random() < .3) sfx.drop(); after(o.delay + o.dur * .58, () => landOnce(q.r)); });
      end = Math.max(end, tb + o.delay + o.dur * .96); });
    await wait(end);
    /* the wilds that took part stay on the board: back to their rest pose */
    st.clusters.forEach(k => k.cells.forEach(c => { if (!st.clearedCells.some(q => q.r === c.r && q.c === c.c)) paintCell(st.grid, st.wilds, c.r, c.c); })); lastGrid = st.grid; lastWilds = st.wilds;
    if (st.reforgeEvents && st.reforgeEvents.length) { await playEvents(st.reforgeEvents); paint(st.grid, st.wilds); }
  }
  return run;
}

/* the Forgefire Gems that triggered the bonus pulse on the board before the splash */
async function showScatters() {
  const g = []; cells.forEach((d, i) => { if (d.classList.contains('scatter')) g.push([Math.floor(i / 6), i % 6]); });
  GRID.classList.add('focus'); clearLinks();
  g.forEach(([r, c], i) => { FX.act(at(r, c), i * 240, i); at(r, c).classList.add('scat'); if (i) seam(ctrOf(g[i - 1][0], g[i - 1][1]), ctrOf(r, c), i * 240 - 100, 260); });
  say(`${g.length} GEMS LANDED · THE REFORGING!`, true);
  g.forEach((_, i) => after(i * 240, () => sfx.scatter(i))); await wait(240 * g.length + 1200); fadeLinks(200);
}

/* paytable (info screen) */
$('ptab').innerHTML = '<tr><th>SYMBOL</th><th>5-7</th><th>8-9</th><th>10-12</th><th>13+</th></tr>' +
  [6, 5, 4, 3, 2, 1, 0].map(i => `<tr><td><div class="nm"><svg viewBox="0 0 64 64"><use href="#s${i}"/></svg>${NAMES[i]}</div></td>${PT[i].map(v => `<td>${v}x</td>`).join('')}</tr>`).join('') +
  `<tr><td><div class="nm"><svg viewBox="0 0 64 64"><use href="#s7"/></svg>Ember Core Sigil (Wild)</div></td><td colspan="4">Substitutes for all symbols</td></tr><tr><td><div class="nm"><svg viewBox="0 0 64 64"><use href="#s8"/></svg>Forgefire Gem (Scatter)</div></td><td colspan="4">3+ trigger The Reforging</td></tr>`;

return {
  /* synthesised sounds: anvil, stone, glass, lava, horn. Required names: ui hit spin bonus outro big tick feverOn */
  sfx(kit) {
    const { ctx, bus, env, osc, noise, metal, st, T0 } = kit;
    const anvil = (p = 1, pitch = 1, t = T0()) => { metal(360 * pitch, t, 1.1, .2 * p); noise(t, .06, .22 * p, 'bandpass', 3200, 1800, 1.2); osc('sine', 78 * pitch, t, .16, .32 * p, .002, 46 * pitch); };
    const horn = (t, d, peak, base = 55) => [1, 1.5, 2, 3].forEach((m, i) => [-7, 7].forEach(c => {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = env(t, d * .45, peak / (1 + i * .5), d * .55);
      o.type = 'sawtooth'; o.frequency.value = base * m; o.detune.value = c; f.type = 'lowpass'; f.frequency.setValueAtTime(220, t); f.frequency.exponentialRampToValueAtTime(1100, t + d * .5); f.Q.value = 1.4;
      o.connect(f).connect(g).connect(bus); o.start(t); o.stop(t + d + .1); }));
    const R = {
      anvil: (p, pitch) => anvil(p, pitch),
      hit: () => { const t = T0(); anvil(.55, 1.05, t); },
      ui: () => { const t = T0(); osc('triangle', 330, t, .07, .16, .002, 220); noise(t, .035, .1, 'bandpass', 2400, 0, 2); },
      spin: () => { const t = T0(); noise(t, .22, .2, 'bandpass', 350, 1700, .8, .04); osc('sine', 120, t, .2, .16, .02, 70); },
      drop: () => { const t = T0(); noise(t, .5, .16, 'bandpass', 2600, 280, .7, .03); },
      land: r => { const t = T0(); osc('sine', 96, t, .14, .24, .002, 48); noise(t, .07, .18, 'lowpass', 600, 0); if (r === 4) metal(240, t, .35, .05); },
      shatter: () => { const t = T0(); noise(t, .28, .26, 'highpass', 2600, 6000, .7); noise(t, .16, .26, 'lowpass', 1000, 200); for (let i = 0; i < 6; i++) osc('sine', 1800 + Math.random() * 3600, t + i * .028 + Math.random() * .02, .14, .035, .001); },
      win: n => { const t = T0(), sc = [0, 2, 4, 7, 9, 12, 14, 16], f = 440 * st(sc[Math.min(n, 7)]); metal(f, t, 1.0, .13); osc('triangle', f / 2, t, .5, .08); noise(t, .08, .04, 'highpass', 5000, 0); },
      heat: h => { const t = T0(); metal(260 * st(h * 1.6), t, .55, .12, [1, 2.01, 3.02]); noise(t, .25, .08, 'bandpass', 3500 + h * 300, 7000, 1.5, .03); },
      reforge: () => { const t = T0(); anvil(1.05, 1.12, t); noise(t + .05, .7, .1, 'bandpass', 2200, 6500, 2.5, .05); osc('sine', 500, t + .05, .55, .06, .05, 2000); },
      boom: () => { const t = T0(); osc('sine', 120, t, 1.3, .6, .003, 26); noise(t, 1.5, .34, 'lowpass', 2200, 90, .8); noise(t, .14, .3, 'highpass', 1500, 0); anvil(1, .8, t + .02); noise(t + .1, 1.0, .08, 'bandpass', 3000, 7000, 2, .1); },
      bonus: () => { const t = T0(); horn(t, 2.2, .075); [0, .36, .72].forEach((d, i) => anvil(.9, [.9, 1, 1.19][i], t + d)); [0, 4, 7, 12].forEach((n, i) => metal(330 * st(n), t + 1 + i * .08, 1.6, .07)); osc('sine', 60, t, 1.8, .3, .01, 40); },
      outro: () => { const t = T0(); [0, 4, 7, 12, 16].forEach((n, i) => metal(392 * st(n), t + i * .13, 1.3, .1)); horn(t, 1.6, .045, 82.5); },
      big: lv => { const t = T0(); for (let i = 0; i < lv; i++) anvil(.9, 1 + i * .06, t + i * .28); horn(t, 1.6 + lv * .5, .06 + lv * .012, 55 * st(lv)); [0, 4, 7, 12, 16, 19, 24].slice(0, 3 + lv).forEach((n, i) => metal(440 * st(n), t + .3 + i * .1, 1.2, .08)); osc('sine', 60, t, 1.2, .35, .01, 36); },
      scatter: n => { const t = T0(), f = 660 * st([0, 4, 7, 12][Math.min(n, 3)]); metal(f, t, 1.3, .13); osc('triangle', f / 2, t, .5, .07); noise(t, .35, .06, 'highpass', 7000, 0); },
      tick: k => { const t = T0(); osc('triangle', 650 + k * 900, t, .05, .12, .001); noise(t, .02, .08, 'highpass', 6000, 0); },
      /* a link seats: a small hammer tink, climbing the scale with the ring of the cluster */
      link: d => { const t = T0(); metal(520 * st([0, 2, 3, 5, 7, 8, 10, 12][Math.min(d, 7)]), t, .45, .05, [1, 2.76, 5.4]); noise(t, .03, .05, 'highpass', 4500, 0); osc('sine', 150, t, .06, .08, .002, 90); }
    };
    R.maxLand = k => { const t = T0(), f = 520 * st([0, 4, 7, 12][Math.min(k, 3)]); metal(f, t, 1.3, .14); metal(f * 2, t + .05, .5, .07); noise(t, .12, .14, 'highpass', 5000, 9000, .7); anvil(.7, 1.3, t); };
    R.maxBeat = n => { const t = T0(); osc('sine', 62, t, .16, .34, .004, 42); osc('sine', 62, t + .2, .12, .24, .004, 42); if (n > 1) noise(t, .5, .05 * n, 'bandpass', 400, 2400, 1.2, .2); };
    R.maxWin = () => { const t = T0(); [0, 4, 7, 12, 16, 19, 24, 28].forEach((n, i) => metal(262 * st(n), t + i * .09, 1.8, .11)); horn(t, 2.4, .07, 82.5); [0, .3, .6, .9].forEach((d, i) => anvil(1, 1 + i * .08, t + d)); osc('sine', 100, t, 1.8, .55, .01, 26); };
    R.maxMiss = () => { const t = T0(); osc('triangle', 300, t, .5, .16, .01, 120); noise(t, .6, .08, 'lowpass', 600, 120, .8, .05); anvil(.5, .7, t); };
    R.feverOn = () => R.heat(6);
    return R;
  },
  /* low forge ambience: a quiet lava rumble with random ember crackles */
  ambience: kit => kit.bed({ lowpass: 170, gain: .5, level: .02, loopSec: 3 }),
  ambientBoost: () => heatNow * .02,
  particleColor: (p, a) => p.c ? `rgba(255,${190 + (p.l % 50)},60,${a})` : `rgba(255,${100 + Math.min(120, p.l)},20,${a})`,
  music: musicDefs,
  init() {},
  paintIdle() { paint(Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, c) => (r * 2 + c) % 7))); dropAll(); },
  roundStart: () => setHeat(0),
  clearBoard: dropOut,
  restoreBoard() { if (lastGrid) paint(lastGrid, lastWilds); },
  baseSpin: R => ({ initialGrid: R.initialGrid, openingGrid: R.openingGrid, openingEvents: R.openingEvents, openingWilds: [], cascadeSteps: R.cascadeSteps, startHeat: 0, maxPay: R.luck && R.luck.hit ? R.totalPayout : 0 }),
  playSpin,
  showTrigger: showScatters
};
});
