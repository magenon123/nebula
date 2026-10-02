/* EmberClaw slot module: the only EmberClaw-specific client logic. The shell (shell/slot-shell.js) calls these hooks.
 * Pure renderer: the server returns every cascade; nothing here computes an outcome.
 * Round payload (slot-defined part): initialGrid, openingGrid?, openingEvents?, cascadeSteps[{clusters,clearedCells,payout,newCells,coreHeat,reforgeEvents,wilds,grid}];
 * bonus.spins[] have the same shape plus spinIndex / retrigger. */
SlotShell.boot(SLOT_CFG, S => {
const { $, sfx, wait, T, say, shake, flash, embers, char, pop, fmt } = S;
const TIER = ['low','low','low','mid','mid','high','high','wild','scatter'];
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
    tempo: 80, barBeats: 4, spb: 16, swing: .08, bars: 16, key: 62, scale: [0, 1, 3, 5, 7, 8, 10], seed: 17, gain: .5, phrase: 4,
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
    tempo: 112, barBeats: 4, spb: 16, swing: 0, bars: 24, key: 62, scale: [0, 1, 3, 5, 7, 8, 10], seed: 29, gain: .62, phrase: 4,
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
const cells = [];
for (let i = 0; i < 30; i++) { const d = document.createElement('div'); d.className = 'cell'; $('grid').append(d); cells.push(d); }
const at = (r, c) => cells[r * 6 + c];
function paint(grid, wilds = []) {
  lastGrid = grid; lastWilds = wilds;
  const wm = {}; wilds.forEach(w => wm[w.r * 6 + w.c] = w.mult);
  grid.forEach((row, r) => row.forEach((s, c) => {
    const d = at(r, c); d.className = 'cell t-' + TIER[s] + (s === 7 ? ' wild' : s === 8 ? ' scatter' : ''); d.style.removeProperty('--dl');
    d.innerHTML = `<svg class="g"><use href="#s${s}"/></svg>` + (s === 7 && wm[r * 6 + c] > 1 ? `<span class="m">x${wm[r * 6 + c]}</span>` : '');
  }));
  $('grid').classList.remove('focus');
}
/* bottom row lands first, every row above follows */
const dropCell = (d, r) => { d.style.setProperty('--dl', (4 - r) * 95 * T() + 'ms'); d.classList.add('drop'); };
function dropAll() { for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) dropCell(at(r, c), r); }
async function dropOut() {
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { const d = at(r, c); d.classList.remove('drop'); d.style.setProperty('--dl', (4 - r) * 55 * T() + 'ms'); d.classList.add('out'); }
  await wait(4 * 55 + 430);
}

/* ---------- Forge Core (side mechanic) ---------- */
const tube = $('tube');
for (let i = 1; i <= 9; i++) { const e = document.createElement('i'); e.dataset.n = i; tube.append(e); }
let heatNow = 0;
function setHeat(h) {
  const prev = heatNow; if (h > prev) sfx.heat(Math.min(h, 9)); heatNow = h; const lit = Math.min(h, 9);
  [...tube.children].forEach(e => { const n = +e.dataset.n, on = n <= lit; if (on && n > Math.min(prev, 9)) { e.classList.remove('pulse'); void e.offsetWidth; e.classList.add('pulse'); } e.classList.toggle('on', on); });
  $('heatV').textContent = h; document.body.style.setProperty('--heat', Math.min(h, 12));
  $('pk3').classList.toggle('on', h >= 3); $('pk6').classList.toggle('on', h >= 6); $('pk9').classList.toggle('on', h >= 9);
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

/* step through one spin's cascade sequence */
async function playSpin(sp, runningFrom, ctx) {
  const stake = ctx.stake, onWin = ctx.onWin;
  smithStrike();
  paint(sp.initialGrid); dropAll(); sfx.drop(); for (let r = 4; r >= 0; r--) setTimeout(() => sfx.land(r), ((4 - r) * 95 + 330) * T()); await wait(1000);
  if (sp.openingGrid && sp.openingEvents && sp.openingEvents.length) { paint(sp.openingGrid, sp.openingWilds); await playEvents(sp.openingEvents); }
  setHeat(sp.startHeat || 0);
  let run = runningFrom, n = 0;
  for (const st of sp.cascadeSteps) {
    $('grid').classList.add('focus'); if (n === 0) char('win', 1500);
    st.clusters.forEach(k => { k.cells.forEach(c => at(c.r, c.c).classList.add('hit')); popAt(k, k.payout * stake); });
    say(`${st.clusters.length > 1 ? st.clusters.length + ' CLUSTERS' : 'CLUSTER'}  +${fmt(st.payout * stake)}`, true); sfx.win(n++); await wait(750);
    sfx.shatter(); st.clearedCells.forEach(c => at(c.r, c.c).classList.add('shatter')); await wait(340);
    const before = run; run += st.payout * stake; onWin(before, run);
    paint(st.grid, st.wilds);
    st.newCells.forEach(c => dropCell(at(c.r, c.c), c.r)); setHeat(st.coreHeat); embers(8);
    sfx.drop(); [...new Set(st.newCells.map(c => c.r))].forEach(r => setTimeout(() => sfx.land(r), ((4 - r) * 95 + 330) * T()));
    await wait(700);
    await playEvents(st.reforgeEvents);
    if (st.reforgeEvents && st.reforgeEvents.length) paint(st.grid, st.wilds);
  }
  return run;
}

/* the Forgefire Gems that triggered the bonus pulse on the board before the splash */
async function showScatters() {
  const g = [...cells].filter(d => d.classList.contains('scatter'));
  $('grid').classList.add('focus'); g.forEach(d => d.classList.add('hit', 'scat'));
  say(`${g.length} GEMS LANDED · THE REFORGING!`, true);
  g.forEach((d, i) => setTimeout(() => sfx.scatter(i), i * 260 * T())); await wait(260 * g.length + 1000);
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
      tick: k => { const t = T0(); osc('triangle', 650 + k * 900, t, .05, .12, .001); noise(t, .02, .08, 'highpass', 6000, 0); }
    };
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
  baseSpin: R => ({ initialGrid: R.initialGrid, openingGrid: R.openingGrid, openingEvents: R.openingEvents, openingWilds: [], cascadeSteps: R.cascadeSteps, startHeat: 0 }),
  playSpin,
  showTrigger: showScatters
};
});
