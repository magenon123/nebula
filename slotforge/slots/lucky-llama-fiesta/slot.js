/* Lucky Llama Fiesta: the only slot-specific client logic; the shell (shell/slot-shell.js) calls these hooks.
 * Pure renderer: the server/engine returns the whole round (spin, Piñata Link respins + cracks, Poncho Parade free spins); nothing here computes an outcome.
 * Round format: plans/lucky-llama-fiesta-round-format.md. Art geometry: slots/lucky-llama-fiesta/ART-NOTES.md. Notes: CLIENT-NOTES.md.
 * Codes: MAR MAC CHI GUI TAC SKU SOM MAS TRU LUC WLD SCA MON = symbol ids s0..s12 (jackpot piñatas s12_mini/minor/major/grand, blur bitmaps sb*). */
SlotShell.boot(SLOT_CFG, S => {
const { $, sfx, wait, T, say, shake, flash, embers, fmt } = S;
const FX = S.fx, INFO = S.cfg.engineData.info, LINES = INFO.lines, CODES = INFO.symbols, JPV = INFO.link.jackpots;
const ID = {}; CODES.forEach((c, i) => { ID[c] = i; });
const NAMES = ['MARIGOLD', 'MARACAS', 'CHILI', 'GUITAR', 'TACO', 'SKULL', 'SOMBRERO', 'MASK', 'TRUMPET', 'LUCHO', 'WILD', 'DRUM', 'PIÑATA'];
const LITE = document.body.classList.contains('lite');
const GRID = $('grid'), FRAME = $('frame'), FXL = $('fxl'), COL = ['#ff5a5a', '#ffb02e', '#ffe14a', '#7be04a', '#2fd6c4', '#3aa0ff', '#8a6bff', '#ff6bd0', '#ff8a3a', '#b8ff4a'];
const r2 = n => Math.round(n * 100) / 100, r4 = n => Math.round(n * 1e4) / 1e4;
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 'S');
const money = a => fmt(a).replace(/([.,])00(?=\D*$)/, '');
const valText = (v, st) => money(v * st);
const lenCls = s => s.length <= 3 ? 'a' : s.length <= 4 ? 'b' : s.length <= 5 ? 'c' : s.length <= 6 ? 'd' : 'e';
const skin = (code, mon, blur) => (blur ? 'sb' : 's') + (code === 'MON' ? '12' + (mon && mon.jackpot ? '_' + mon.jackpot.toLowerCase() : '') : ID[code]);

/* ---------------------------------------------------------------- sound */
const MAJ = [0, 2, 4, 5, 7, 9, 11];
function musicDefs() {
  const ROOT = [48, 48, 53, 53, 55, 53, 48, 55], CH = [[60, 64, 67], [60, 64, 67], [65, 69, 72], [65, 69, 72], [67, 71, 74], [65, 69, 72], [60, 64, 67], [67, 71, 74]];
  const MOT = [[[0, 4, 1], [4, 2, 1], [6, 4, 1]], [[0, 2, 2], [4, 0, 1], [6, 1, 1]], [[0, 5, 1], [2, 4, 1], [4, 2, 2]], [[0, 4, 2], [3, 2, 1], [5, 1, 1], [6, 0, 1]]];
  const base = {
    tempo: 98, barBeats: 4, spb: 8, swing: .1, bars: 8, key: 60, scale: MAJ, seed: 23, gain: .78, phrase: 4,
    layers: { bass: { gain: 1, wet: .08 }, gui: { gain: 1, wet: .2 }, guiro: { gain: 1, wet: .1 }, perc: { enter: 1, gain: 1, wet: .1 }, acc: { enter: 2, gain: 1, wet: .35 }, trp: { int: .35, gain: 1, wet: .3 } },
    bar(M) {
      const k = M.i & 7, rt = ROOT[k], ch = CH[k], mot = MOT[(k >> 1) & 3];
      [[0, 0], [3, 7], [4, 0], [6, 4]].forEach(([s, iv]) => M.upright('bass', M.st(s), rt + iv, { g: s === 0 ? .17 : .12, d: .3 }));
      [1, 3, 5, 7].forEach(s => M.strum('gui', M.st(s), ch, { kind: 'uke', g: s % 4 === 3 ? .05 : .035, d: .22, sp: .014 }));
      for (let s = 0; s < 8; s++) M.hat('guiro', M.st(s), s % 2 ? .55 : 1, { f: 5600, d: s % 4 === 0 ? .09 : .05, g: .034 });
      [0, 4].forEach(s => M.kick('perc', M.st(s), .8, { f0: 130, f1: 52, d: .22, g: .2 })); [2, 5, 6].forEach(s => M.tok('perc', M.st(s), .7, { f: 1150 }));
      if (k % 2 === 0) mot.forEach(([s, d, len]) => M.reed('acc', M.st(s), len * .25, M.note(d, 1), { g: .042, a: .05, r: .1, cut: 2400 }));
      if (M.int > .35 && k % 4 === 0) M.horn('trp', M.st(0), 1.2, ch.map(n => n + 12), { g: .05 });
    }
  };
  const bonus = {
    tempo: 120, barBeats: 4, spb: 8, swing: .06, bars: 8, key: 62, scale: MAJ, seed: 77, gain: .85, phrase: 4,
    layers: { bass: { gain: 1, wet: .08 }, gui: { gain: 1, wet: .2 }, guiro: { gain: 1, wet: .1 }, perc: { gain: 1, wet: .1 }, acc: { gain: 1, wet: .3 }, trp: { gain: 1, wet: .3 }, hi: { int: .5, gain: 1, wet: .4 } },
    bar(M) {
      const k = M.i & 7, rt = ROOT[k] + 2, ch = CH[k].map(n => n + 2), mot = MOT[(k + 1) & 3], I = M.int;
      [[0, 0], [2, 7], [3, 0], [4, 0], [6, 7], [7, 4]].forEach(([s, iv]) => M.upright('bass', M.st(s), rt + iv, { g: s === 0 ? .18 : .12, d: .26 }));
      [1, 3, 5, 7].forEach(s => M.strum('gui', M.st(s), ch, { kind: 'banjo', g: .036, d: .2, sp: .012 }));
      for (let s = 0; s < 8; s++) M.hat('guiro', M.st(s), s % 2 ? .6 : 1, { f: 5800, d: s % 4 === 0 ? .08 : .045, g: .036 });
      [0, 3, 4, 7].forEach(s => M.kick('perc', M.st(s), .85, { f0: 140, f1: 54, d: .2, g: .22 })); [2, 5, 6].forEach(s => M.tok('perc', M.st(s), .8, { f: 1250 }));
      mot.forEach(([s, d, len]) => M.reed('acc', M.st(s), len * .22, M.note(d, 1), { g: .045, a: .04, r: .08, cut: 3000 }));
      if (k % 2 === 0) M.horn('trp', M.st(0), 1.0, ch.map(n => n + 12), { g: .06 });
      if (I > .5) [0, 4].forEach(s => M.horn('trp', M.st(s) + .01, .3, ch.map(n => n + 24), { g: .03 }));
      if (I > .5) [1, 3, 5, 7].forEach(s => M.metal('hi', M.st(s), M.mtof(M.note(mot[0][1] + 7, 2)), .5, .012, [1, 2.003]));
    }
  };
  const stingers = {
    win(K) { const { V, dest, t } = K; [0, 2, 4, 7].forEach((d, i) => V.horn(dest, t + i * .09, .5, [K.note(d, 1), K.note(d + 2, 1)], { g: .07 })); V.kick(dest, t, .9, {}); },
    bonus(K) { const { V, dest, t } = K; V.sub(dest, t, 1.2, 36, { g: .3 }); [0, 2, 4, 7, 9].forEach((d, i) => V.horn(dest, t + .1 + i * .12, .6, [K.note(d, 1), K.note(d + 2, 1), K.note(d + 4, 1)], { g: .08 })); V.pad(dest, t, 2.4, [60, 64, 67, 72], { wave: 'triangle', cut: 2600, a: .5, r: 1.6, g: .1, det: 10 }); },
    outro(K) { const { V, dest, t } = K; [7, 4, 2, 0].forEach((d, i) => V.horn(dest, t + i * .2, .6, [K.note(d, 1), K.note(d + 2, 1)], { g: .06 })); },
    cheer(K) { const { V, dest, t } = K; V.slide(dest, t, .5, K.note(0, 1), K.note(4, 1), {}); [4, 5, 7].forEach((d, i) => V.horn(dest, t + .3 + i * .1, .5, [K.note(d, 1), K.note(d + 2, 1)], { g: .07 })); },
    jackpot(K) { const { V, dest, t } = K; V.sub(dest, t, 1.4, 36, { g: .34 }); [0, 2, 4, 5, 7, 9, 11].forEach((d, i) => V.horn(dest, t + .08 + i * .09, .5, [K.note(d, 1), K.note(d + 2, 1), K.note(d + 4, 1)], { g: .08 })); V.pad(dest, t, 3, [60, 64, 67, 72], { wave: 'triangle', cut: 3000, a: .4, r: 2, g: .12, det: 10 }); }
  };
  return { base, bonus, stingers };
}

/* ---------------------------------------------------------------- state */
let curR = null, inBonus = false, bType = null, baseSnap = null, lastSnap = null, stakeNow = S.bet();
let linkReady = false, pdReady = false, lastStep = 0, lastMult = 1, gen = 0;
const timers = new Set();
const after = (ms, fn) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms * T()); timers.add(id); return id; };
const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };
const cells = [];                                   // idx = reel * 3 + row
const mkCellEl = () => { const d = document.createElement('div'); d.className = 'cell'; d.innerHTML = '<svg class="g" viewBox="0 0 128 128"><use href="#s0"/></svg><b class="m"></b>'; return d; };
function setEl(el, code, mon, blank, blur) {
  el._code = code; el._mon = mon || null; el._blank = !!blank;
  const u = el.querySelector('svg.g use'), href = '#' + skin(code, mon, blur); if (u.getAttribute('href') !== href) u.setAttribute('href', href);
  const m = el.querySelector('.m'), txt = !blur && code === 'MON' && mon && !mon.jackpot ? valText(mon.value, stakeNow) : '';
  if (m.textContent !== txt) { m.textContent = txt; m.className = 'm ' + lenCls(txt); }
  el.classList.toggle('blank', !!blank);
}
const cellOf = (c, r) => cells[c * 3 + r];
const monMap = sp => { const o = {}; (sp.money || []).forEach(m => { o[m.reel * 3 + m.row] = m; }); return o; };
function paint(grid, money, blankFn) {
  const mm = {}; (money || []).forEach(m => { mm[m.reel * 3 + m.row] = m; });
  for (let c = 0; c < 5; c++) for (let r = 0; r < 3; r++) setEl(cells[c * 3 + r], grid[c][r], mm[c * 3 + r], blankFn && blankFn(c, r));
}
const snapBoard = () => ({ grid: [0, 1, 2, 3, 4].map(c => [0, 1, 2].map(r => cellOf(c, r)._code)), money: cells.filter(e => e._code === 'MON' && e._mon).map((e, i) => ({ reel: Math.floor(cells.indexOf(e) / 3), row: cells.indexOf(e) % 3, value: e._mon.value, jackpot: e._mon.jackpot })) });
const ctr = e => { const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };
const localC = (c, r) => [c * 150 + 75, r * 150 + 75];

/* ---------------------------------------------------------------- callouts and plates */
const co = $('coLine'), coT = $('coLineT');
function callout(text, ms) {
  coT.textContent = text; coT.style.fontSize = Math.min(24, Math.max(13, 480 / (text.length * .56))) + 'px';
  co.classList.remove('bump'); void co.offsetWidth; co.classList.add('on', 'bump'); document.body.classList.add('co');
  clearTimeout(co._t); if (ms) co._t = setTimeout(hideCallout, ms * T());
}
function hideCallout() { clearTimeout(co._t); co.classList.remove('on', 'bump'); document.body.classList.remove('co'); }
const plate = (id, on) => $(id).classList.toggle('on', !!on);
function bump(el, ms) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
function flashPlate(id, num, text, ms) { const e = $(id); $(num).textContent = text; plate(id, true); bump(e); clearTimeout(e._t); e._t = setTimeout(() => plate(id, false), ms * T()); }
const jpEl = k => $({ GRAND: 'jpGrand', MAJOR: 'jpMajor', MINOR: 'jpMinor', MINI: 'jpMini' }[k]);
function refreshJackpots() { Object.keys(JPV).forEach(k => { const v = jpEl(k).querySelector('.jv'), t = money(JPV[k] * stakeNow); if (v.textContent !== t) { v.textContent = t; v.style.fontSize = t.length > 6 ? '16px' : t.length > 5 ? '19px' : ''; } }); }
function litJackpot(k) { const e = jpEl(k); e.classList.add('lit'); e.classList.remove('hit'); void e.offsetWidth; e.classList.add('hit'); }
function setLadder(step, withBump) { const l = $('ladder'); l.setAttribute('class', 'm' + step); if (withBump) bump(l); }
function setRespins(n, reset) { $('lkRespinsN').textContent = n; bump($('lkRespins')); $('lkRespins').classList.toggle('reset', !!reset); }

/* ---------------------------------------------------------------- reels (strip scroll with spin-blur bitmaps)
 * Each reel = a 15-cell strip: [pad][3 final][8 blur][3 old]. Window top s = 150 + d, d = distance to rest. While spinning the blur region loops (period 5 cells);
 * stop times are solved so that the landing (quadratic ease-out, 430 ms) ends exactly at the planned instant. Time runs on a simulated clock (speed = 1/T()),
 * so turbo and the tap speed-up shorten everything, including a spin that is already running. Transforms only. */
const P = 750, D0 = 1650, V0 = 2.6, ACC = 260, LAND = 430;
let simT = 0, lastF = 0, rafId = 0;
const reels = [];
const wrapD = d => d >= 450 ? d : d + P * Math.ceil((450 - d) / P);
const analytic = (r, t) => { const k = Math.min(1, (t - r.t0) / ACC), e = k < 1 ? ACC * (k * k * k - k * k * k * k / 2) : t - r.t0 - ACC / 2; return D0 - V0 * e; };
function mkReels() {
  const host = document.createElement('div'); host.id = 'reels'; FRAME.appendChild(host);
  const order = [4, 2, 6, 12, 0, 8, 3, 10, 5, 1, 9, 7, 11];
  for (let c = 0; c < 5; c++) {
    const el = document.createElement('div'), strip = document.createElement('div'), cs = []; el.className = 'reel'; el.style.left = c * 150 + 'px'; strip.className = 'strip'; el.appendChild(strip);
    for (let i = 0; i < 15; i++) { const ce = mkCellEl(); strip.appendChild(ce); cs.push(ce); }
    for (let i = 0; i < 15; i++) if (i === 0 || (i >= 4 && i <= 11)) { const b = order[(c * 3 + ((i === 0 ? 11 : i - 4) % 5) * 5) % 13]; cs[i]._b = b; cs[i].querySelector('use').setAttribute('href', '#sb' + b); }
    host.appendChild(el); reels.push({ c, el, strip, cs, mode: 'idle', fn: null, t0: 0, Ts: 0, tease: null, link: false });
  }
}
function setBlurMode(link) { reels.forEach(r => { r.link = link; r.el.classList.toggle('lk', link); r.cs.forEach((ce, i) => { if (ce._b != null) ce.querySelector('use').setAttribute('href', '#sb' + (link ? 12 : ce._b)); }); }); }
const setD = (r, d) => { r.strip.style.transform = `translate3d(0,${-(150 + d)}px,0)`; };
function startReels(mask) {
  for (let c = 0; c < 5; c++) {
    if (!mask[c]) continue; const r = reels[c]; r.mode = 'spin'; r.fn = null; r.t0 = simT; r.tease = null; r.el.classList.add('on'); r.el.classList.remove('tease');
    for (let row = 0; row < 3; row++) { const e = cellOf(c, row); setEl(r.cs[12 + row], e._code, e._mon, e._blank); if (!e.classList.contains('top')) e.classList.add('sp'); }
    setD(r, D0);
  }
  ensureLoop();
}
const spinning = () => reels.some(r => r.mode === 'spin');
function abortReels() { reels.forEach(r => { r.mode = 'idle'; r.fn = null; r.el.classList.remove('on', 'tease'); }); cells.forEach(e => e.classList.remove('sp')); }
function ensureLoop() { if (!rafId) { lastF = performance.now(); rafId = requestAnimationFrame(frame); } }
function frame(now) {
  rafId = 0; const dt = Math.max(0, Math.min(50, now - lastF)); lastF = now; simT += dt / T(); let live = false;
  for (const r of reels) {
    if (r.mode === 'idle') continue; live = true;
    if (!r.fn) { const tt = simT - r.t0; setD(r, wrapD(analytic(r, simT)) + (tt < 120 ? 12 * Math.sin(Math.PI * tt / 120) : 0)); continue; }
    if (r.tease && simT >= r.tease.beat && simT < r.Ts - 200) { r.tease.beat += 520; sfx.beat(); }
    if (simT >= r.Ts) touch(r); else setD(r, r.fn(simT));
  }
  if (live) rafId = requestAnimationFrame(frame);
}
function planNormal(r, Ts) {
  const tA = simT, dA = analytic(r, tA), tl = Ts - LAND, tau = Math.max(60, tl - tA), h = tau + LAND / 2;
  let k = Math.round((V0 * h - dA) / P), v = (dA + k * P) / h; if (v < 2.15) { k++; v = (dA + k * P) / h; } if (v > 3.5) { k--; v = (dA + k * P) / h; }
  const sl = v * LAND / 2; r.Ts = tl + LAND;
  r.fn = t => t < tl ? wrapD(dA - v * (t - tA)) : sl * Math.pow(Math.max(0, 1 - (t - tl) / LAND), 2);
}
function planTease(r, Tp) {
  const RAMP = 260, vs = 1.6, sl = 450, dp = analytic(r, Tp), d1 = dp - RAMP * (V0 + vs) / 2, t1 = Tp + RAMP, Dl = 2 * sl / vs;
  let x = (wrapD(d1) - sl) % P; if (x < 0) x += P; let tl = t1 + x / vs; while (tl < t1 + 200) tl += P / vs;
  r.Ts = tl + Dl; r.tease = { Tp, beat: Tp };
  r.fn = t => t < Tp ? wrapD(analytic(r, t)) : t < t1 ? wrapD(dp - (V0 * (t - Tp) - (V0 - vs) * (t - Tp) * (t - Tp) / (2 * RAMP))) : t < tl ? wrapD(d1 - vs * (t - t1)) : sl * Math.pow(Math.max(0, 1 - (t - tl) / Dl), 2);
}
let touchHook = null;
function touch(r) {
  r.mode = 'idle'; r.fn = null; r.el.classList.remove('on', 'tease');
  for (let row = 0; row < 3; row++) { const e = cellOf(r.c, row); if (!e.classList.contains('sp')) continue; e.classList.remove('sp'); e.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(11px)', offset: .45 }, { transform: 'translateY(0)' }], { duration: 200 * T(), easing: 'ease-out' }); }
  sfx.reelStop(r.c); if (touchHook) touchHook(r.c);
  const nx = reels[r.c + 1]; if (nx && nx.tease && nx.mode === 'spin') { nx.el.classList.add('tease'); sfx.tease(); }
}
/* o: {mask, first (ms after the first reel started), gap, final(c,row) -> {code,mon,blank}, onTouch(c)} */
function spinReels(sp, o) {
  return new Promise(res => {
    const idx = [0, 1, 2, 3, 4].filter(c => o.mask[c]); if (!idx.length) return res();
    if (!idx.every(c => reels[c].mode === 'spin')) startReels(o.mask);
    let pending = idx.length; const t0 = Math.min(...idx.map(c => reels[c].t0)); let prev = -1;
    touchHook = c => { if (o.onTouch) o.onTouch(c); if (--pending === 0) { touchHook = null; res(); } };
    const base = Math.max(t0 + o.first, simT + 520);
    idx.forEach((c, k) => {
      const r = reels[c];
      for (let row = 0; row < 3; row++) { const f = o.final(c, row), e = cellOf(c, row); setEl(r.cs[1 + row], f.code, f.mon, f.blank); setEl(e, f.code, f.mon, f.blank); }
      if (sp.tease && sp.tease[c] && prev > 0 && sp.teaseKind) planTease(r, prev); else planNormal(r, Math.max(base + k * o.gap, prev + 120));
      prev = r.Ts;
    });
  });
}

/* ---------------------------------------------------------------- landing effects, counts, tease texts */
function popCell(e, big) {
  const g = e.querySelector('svg.g'), m = e.querySelector('.m'), k = big || 1.28;
  g.animate([{ transform: 'scale(.82)' }, { transform: `scale(${k})`, offset: .45 }, { transform: 'scale(1)' }], { duration: 380 * T(), easing: 'cubic-bezier(.3,1.4,.5,1)' });
  if (m.textContent) m.animate([{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.35)', opacity: 1, offset: .5 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }], { duration: 420 * T(), easing: 'ease-out' });
}
function landFx(sp, c, ctxInfo) {
  let nMon = 0, nSca = 0;
  for (let row = 0; row < 3; row++) {
    const e = cellOf(c, row);
    if (e._code === 'MON') { if (!e.classList.contains('top')) { popCell(e); sfx.pinata(Math.min(5, ctxInfo.mon++)); } }
    else if (e._code === 'SCA') { popCell(e, 1.22); sfx.drum(Math.min(4, ctxInfo.sca++)); }
    else if (e._code === 'WLD') { if (!e.classList.contains('top')) popCell(e, 1.18); }
  }
  let sca = 0, mon = 0; for (let cc = 0; cc <= c; cc++) for (let row = 0; row < 3; row++) { const x = cellOf(cc, row)._code; if (x === 'SCA') sca++; if (x === 'MON') mon++; }
  if (sca >= 2 || (!ctxInfo.parade && !ctxInfo.link && mon >= 4)) for (let cc = 0; cc <= c; cc++) for (let row = 0; row < 3; row++) { const e = cellOf(cc, row); if ((sca >= 2 && e._code === 'SCA') || (mon >= 4 && !ctxInfo.parade && e._code === 'MON')) e.classList.add('scat'); }
  if (sca >= 2) callout(sca >= 3 ? `${sca} FIESTA DRUMS! PONCHO PARADE!` : '2 FIESTA DRUMS... ONE MORE?');
  else if (!ctxInfo.parade && !ctxInfo.link && mon >= 4) callout(mon >= 6 ? `${mon} PIÑATAS! PIÑATA LINK!` : `${mon} PIÑATAS... ${mon === 5 ? 'ONE' : 'TWO'} MORE?`);
}

/* ---------------------------------------------------------------- line wins */
let lineLayer = null; const linePool = [];
function lineEl(i) {
  if (!lineLayer) lineLayer = FX.layer('lines', 9);
  while (linePool.length <= i) { const g = FX.el('g', { style: 'opacity:0' }, lineLayer), a = FX.el('path', { fill: 'none', stroke: '#2a1209', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g), b = FX.el('path', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); linePool.push({ g, a, b }); }
  return linePool[i];
}
function drawLine(i, win, thin) {
  const L = lineEl(i), pts = win.cells.map(c => localC(c.reel, c.row)); pts.unshift([pts[0][0] - 75, pts[0][1]]); pts.push([pts[pts.length - 1][0] + 75, pts[pts.length - 1][1]]);
  const d = pts.map((p, k) => (k ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' '), w = thin ? 6 : 12;
  L.a.setAttribute('d', d); L.b.setAttribute('d', d); L.a.setAttribute('stroke-width', w + 7); L.b.setAttribute('stroke-width', w); L.b.setAttribute('stroke', COL[(win.line - 1) % COL.length]);
  L.g.style.opacity = 1; L.g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 * T() });
}
function clearLines() { linePool.forEach(L => { L.g.style.opacity = 0; }); }
function setWinCells(set) {
  cells.forEach((e, i) => {
    const on = set.has(i), was = e.classList.contains('hit');
    e.classList.toggle('win', on);
    if (on && !was) FX.act(e, 0, i % 5); else if (!on && was) FX.rest(e);
    e.classList.toggle('wl', on && e._code === 'WLD');
  });
}
async function countTo(ctx, from, to, ms) { if (to === from) return; await FX.tween(ms * T(), k => ctx.onWin(from, k >= 1 ? to : from + (to - from) * Math.max(0, k))); }
async function showWins(sp, run, ctx, mult) {
  const wins = sp.wins; if (!wins || !wins.length) return run;
  const stake = ctx.stake, steps = [], byPay = [...wins].sort((a, b) => b.pay - a.pay);
  if (wins.length <= 3) wins.forEach(w => steps.push([w])); else { byPay.slice(0, 2).forEach(w => steps.push([w])); steps.push(byPay.slice(2)); }
  GRID.classList.add('focus'); let cum = 0, cur = run, n = 0;
  for (const st of steps) {
    const amt = r4(st.reduce((a, w) => a + w.pay, 0) * mult); cum = r4(cum + amt); const target = r2(run + stake * cum), set = new Set(), group = st.length > 1;
    st.forEach(w => w.cells.forEach(c => set.add(c.reel * 3 + c.row)));
    clearLines(); st.forEach((w, i) => drawLine(i, w, group)); setWinCells(set); sfx.line(n++);
    if (group) callout(`+${plural(st.length, 'MORE LINE')} - ${money(stake * amt)}`);
    else { const w = st[0], wild = w.cells.some(c => cellOf(c.reel, c.row)._code === 'WLD' && w.symbol !== 'LUC' || (w.symbol === 'LUC' && cellOf(c.reel, c.row)._code === 'WLD')); callout(`LINE ${w.line} - ${w.count}x ${NAMES[ID[w.symbol]]}${wild ? ' (WILD)' : ''} - ${money(stake * amt)}${mult > 1 ? ` (x${mult})` : ''}`); }
    const hold = group ? 1250 : 900;
    await Promise.all([countTo(ctx, cur, target, Math.min(520, hold * .6)), wait(hold)]); cur = target;
  }
  clearLines(); GRID.classList.remove('focus'); setWinCells(new Set()); cells.forEach(e => e.classList.remove('wl')); hideCallout(); return cur;
}

/* ---------------------------------------------------------------- base spin (also the trigger spin of a buy)*/
const finalFrom = (sp, locked) => { const mm = monMap(sp); return (c, row) => ({ code: sp.grid[c][row], mon: mm[c * 3 + row] || null, blank: false }); };
async function baseSpinPlay(sp, run, ctx) {
  stakeNow = ctx.stake; const info = { mon: 0, sca: 0 };
  if (!spinning()) { startReels([1, 1, 1, 1, 1]); await wait(260); }
  await spinReels(sp, { mask: [1, 1, 1, 1, 1], first: 900, gap: 220, final: finalFrom(sp), onTouch: c => landFx(sp, c, info) });
  cells.forEach(e => e.classList.remove('scat')); baseSnap = snapBoard();
  const mult = 1; if (sp.wins.length) run = await showWins(sp, run, ctx, mult);
  else if (!curR.bonusTriggered) hideCallout();
  return run;
}

/* ---------------------------------------------------------------- PIÑATA LINK */
const pinCells = () => cells.filter(e => e.classList.contains('locked'));
function lockCell(e, silent) { e.classList.add('locked', 'top'); if (!e.querySelector('.lkr')) e.insertAdjacentHTML('beforeend', '<svg class="lkr" viewBox="0 0 128 128"><use href="#llLock"/></svg>'); if (!silent) sfx.lock(); }
async function linkIntro(B, ctx) {
  linkReady = true; setBlurMode(true); GRID.classList.add('link'); plate('lkRespins', true); setRespins(B.startSpins); $('lkRespins').classList.remove('reset');
  callout('PIÑATAS LOCK IN PLACE!', 1400);
  const mm = {}; B.start.forEach(m => { mm[m.reel * 3 + m.row] = m; });
  cells.forEach((e, i) => { if (mm[i]) { setEl(e, 'MON', mm[i]); lockCell(e, true); } else setEl(e, e._code, null, true); });
  sfx.lock(); B.start.forEach(m => { if (m.jackpot) litJackpot(m.jackpot); });
  await wait(900);
}
async function linkRespin(sp, run, ctx) {
  const B = curR.bonus; stakeNow = ctx.stake;
  if (!linkReady) await linkIntro(B, ctx);
  const total = B.spins.length, last = sp.spinsLeft === 0;
  setRespins(sp.respinsBefore); callout(sp.respinsBefore === 1 ? 'LAST RESPIN!' : `RESPIN - ${sp.respinsBefore} LEFT`, 900);
  const landed = {}; sp.landed.forEach(m => { landed[m.reel * 3 + m.row] = m; });
  const mask = [0, 1, 2, 3, 4].map(c => [0, 1, 2].some(r => !cellOf(c, r).classList.contains('locked')) ? 1 : 0);
  startReels(mask); await wait(240); let order = 0;
  await spinReels(sp, {
    mask, first: 640, gap: 150,
    final: (c, row) => { const e = cellOf(c, row), i = c * 3 + row; if (e.classList.contains('locked')) return { code: 'MON', mon: e._mon, blank: false }; return landed[i] ? { code: 'MON', mon: landed[i], blank: false } : { code: e._code, mon: null, blank: true }; },
    onTouch: c => { for (let row = 0; row < 3; row++) { const e = cellOf(c, row), m = landed[c * 3 + row]; if (m && !e.classList.contains('locked')) { lockCell(e); popCell(e, 1.35); sfx.pinata(Math.min(5, order++)); if (m.jackpot) { litJackpot(m.jackpot); sfx.jackpot(m.jackpot.toLowerCase()); callout(`${m.jackpot} JACKPOT! ${money(m.value * stakeNow)}`, 1200); shake(1.2); } } } }
  });
  if (sp.landed.length) { setRespins(3, true); sfx.reset(); if (!sp.landed.some(m => m.jackpot)) callout(`${sp.landed.length === 1 ? 'NEW PIÑATA' : sp.landed.length + ' NEW PIÑATAS'}! RESPINS RESET TO 3`, 1100); await wait(850); }
  else { setRespins(sp.spinsLeft); callout(sp.spinsLeft ? `NO NEW PIÑATA - ${plural(sp.spinsLeft, 'RESPIN')} LEFT` : 'NO NEW PIÑATA - THE LINK ENDS', 900); await wait(sp.spinsLeft ? 650 : 900); }
  if (!last && sp.filled < 15) return run;
  return r2(await linkCracks(B, sp, run, ctx));
}
const crackPool = []; let crackI = 0;
function crackFx(c, r) {
  if (!crackPool.length) for (let i = 0; i < 3; i++) { const d = document.createElement('div'); d.className = 'crackFx'; d.innerHTML = '<svg viewBox="0 0 220 220"><use href="#llCrack1"/></svg><svg viewBox="0 0 220 220"><use href="#llCrack2"/></svg><svg viewBox="0 0 220 220"><use href="#llCrack3"/></svg>'; FXL.appendChild(d); crackPool.push(d); }
  const e = crackPool[crackI++ % 3], [x, y] = localC(c, r); e.style.left = x - 115 + 'px'; e.style.top = y - 115 + 'px'; e.style.display = 'block'; const k = T();
  [[0, 130, 0], [120, 170, 1], [270, 420, 2]].forEach(([dl, du, i]) => { const s = e.children[i]; s.getAnimations().forEach(a => a.cancel()); s.style.opacity = 0; s.animate([{ opacity: 1, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1.05)', offset: .5 }, { opacity: i === 2 ? 0 : 0, transform: 'scale(' + (i === 2 ? 1.2 : 1.1) + ')' }], { duration: du * k, delay: dl * k, fill: 'both', easing: 'ease-out' }); });
  setTimeout(() => { e.style.display = 'none'; }, 760 * k);
}
async function linkCracks(B, sp, run, ctx) {
  const stake = ctx.stake, order = B.cracks, fast = order.length > 9 ? .72 : 1, t0 = run; let shown = 0;
  hideCallout(); plate('lkTotal', true); $('lkTotalV').textContent = money(0); bump($('lkTotal')); callout('CRACK THEM OPEN!', 900); sfx.cheer(); S.music.stinger('cheer'); await wait(700);
  for (const cr of order) {
    const e = cellOf(cr.reel, cr.row), [sx, sy] = ctr(e), g = e.querySelector('svg.g'), m = e.querySelector('.m');
    sfx.crack(Math.min(8, shown)); crackFx(cr.reel, cr.row);
    g.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.18)', opacity: 1, offset: .4 }, { transform: 'scale(.4)', opacity: 0 }], { duration: 300 * T(), fill: 'forwards', easing: 'ease-in' }); if (m) m.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 * T(), fill: 'forwards' });
    e.classList.add('cracked'); FX.shards(sx, sy, cr.jackpot ? 22 : 11, ['#ff5ac0', '#ffd23f', '#2fd6c4', '#fff3c0', '#ff8a3a'], { power: cr.jackpot ? 1.3 : .9 });
    const from = shown ? r2(t0 + stake * order[shown - 1].running) : t0, to = r2(t0 + stake * cr.running); shown++;
    S.pop(sx, sy - 30, '+' + money(stake * cr.value));
    $('lkTotalV').textContent = money(stake * cr.running); bump($('lkTotal'));
    if (cr.jackpot) { litJackpot(cr.jackpot); sfx.jackpot(cr.jackpot.toLowerCase()); if (cr.jackpot !== 'MINI') S.music.stinger('jackpot'); callout(`${cr.jackpot} JACKPOT! ${money(cr.value * stake)}`, 1300); shake(2); flash(1); }
    await Promise.all([countTo(ctx, from, to, 260 * fast), wait((cr.jackpot ? 1000 : 360) * fast)]);
  }
  let cur = r2(t0 + stake * (order.length ? order[order.length - 1].running : 0));
  if (B.fullBoard) {
    sfx.jackpot('grand'); sfx.cheer(); S.music.stinger('jackpot'); shake(3); flash(3); embers(120, innerWidth / 2, innerHeight / 2, true); $('grandV').textContent = money(JPV.GRAND * stake); plate('grandPlate', true); bump($('grandPlate')); litJackpot('GRAND');
    callout('FULL BOARD! GRAND JACKPOT!'); const nxt = r2(cur + stake * JPV.GRAND); $('lkTotalV').textContent = money(stake * B.total); await Promise.all([countTo(ctx, cur, nxt, 900), wait(2200)]); cur = nxt; plate('grandPlate', false);
  }
  const fin = r2(t0 + stake * sp.totalPayout); if (fin !== cur) { ctx.onWin(cur, fin); cur = fin; }
  $('lkTotalV').textContent = money(stake * B.total); callout(`PIÑATA LINK TOTAL - ${money(stake * sp.totalPayout)}`); sfx.cheer(); await wait(1100); hideCallout();
  return cur;
}

/* ---------------------------------------------------------------- PONCHO PARADE */
async function paradeIntro(B, ctx) {
  pdReady = true; plate('pdSpins', true); $('pdSpinsN').textContent = B.startSpins;
  if (B.startSticky && B.startSticky.length) {
    callout('3 STICKY PONCHOS TO START!', 1400); B.startSticky.forEach((s, i) => { const e = cellOf(s.reel, s.row); setEl(e, 'WLD', null); e.classList.add('sticky', 'top'); e.classList.remove('sp'); popCell(e, 1.35); });
    sfx.ladder(3); lastStep = 3; lastMult = 3; setLadder(3, true); await wait(1000);
  }
}
async function paradeSpin(sp, run, ctx) {
  const B = curR.bonus, stake = ctx.stake, run0 = run; stakeNow = stake;
  if (!pdReady) await paradeIntro(B, ctx);
  $('pdSpinsN').textContent = sp.spinsLeft; bump($('pdSpins'));
  hideCallout();
  if (!spinning()) { startReels([1, 1, 1, 1, 1]); await wait(260); }
  const mm = monMap(sp), info = { mon: 0, sca: 0, parade: true }, newW = {}; sp.wilds.forEach(w => { if (w.new) newW[w.reel * 3 + w.row] = 1; });
  let nNew = 0;
  await spinReels(sp, {
    mask: [1, 1, 1, 1, 1], first: 720, gap: 170,
    final: (c, row) => { const e = cellOf(c, row); if (e.classList.contains('sticky')) return { code: 'WLD', mon: null, blank: false }; return { code: sp.grid[c][row], mon: mm[c * 3 + row] || null, blank: false }; },
    onTouch: c => { landFx(sp, c, info); for (let row = 0; row < 3; row++) if (newW[c * 3 + row]) { const e = cellOf(c, row); e.classList.add('sticky', 'top'); popCell(e, 1.4); sfx.poncho(nNew++); } }
  });
  hideCallout(); cells.forEach(e => e.classList.remove('scat'));
  if (sp.ladderStep !== lastStep) { const up = sp.multiplier > lastMult; lastStep = sp.ladderStep; setLadder(sp.ladderStep, true); sfx.ladder(sp.ladderStep); if (up) { flashPlate('pdCallMult', 'pdCallMultN', 'x' + sp.multiplier, 1500); lastMult = sp.multiplier; } }
  if (sp.retrigger) { callout(`3 FIESTA DRUMS! +${sp.retrigger} FREE SPINS`, 1500); flashPlate('pdCallSpins', 'pdCallSpinsN', '+' + sp.retrigger, 1700); sfx.spinsAdd(); cells.forEach(e => { if (e._code === 'SCA') FX.act(e, 0, 1); }); $('pdSpinsN').textContent = sp.spinsLeft; bump($('pdSpins')); await wait(1000); cells.forEach(e => { if (e._code === 'SCA') FX.rest(e); }); }
  if (sp.wins.length) run = await showWins(sp, run, ctx, sp.multiplier);
  if (sp.grab && sp.grab.values.length) run = await paradeGrab(sp, run, ctx);
  const fin = r2(run0 + stake * sp.totalPayout); if (fin > run) { ctx.onWin(run, fin); run = fin; }
  return run;
}
async function paradeGrab(sp, run, ctx) {
  const stake = ctx.stake, vals = [...sp.grab.values].sort((a, b) => a.reel - b.reel || a.row - b.row); let cur = run, tot = 0;
  for (const v of vals) {
    const e = cellOf(v.reel, v.row), [sx, sy] = ctr(e); tot = r4(tot + v.value); const to = r2(run + stake * tot);
    sfx.grab(); callout(`COLLECTOR GRABS +${money(v.value * stake)} (no multiplier)`);
    e.classList.add('grabbed'); e.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.2)', opacity: 1, offset: .4 }, { transform: 'scale(.5)', opacity: 0 }], { duration: 520 * T(), delay: 260 * T(), fill: 'forwards', easing: 'ease-in' });
    setTimeout(() => { FX.shards(sx, sy, v.jackpot ? 24 : 12, ['#ffd23f', '#fff3c0', '#ff8a3a'], { power: 1 }); S.pop(sx, sy - 24, '+' + money(v.value * stake)); e.classList.add('cracked'); }, 300 * T());
    if (v.jackpot) { sfx.jackpot(v.jackpot.toLowerCase()); callout(`${v.jackpot} GRAB! +${money(v.value * stake)} (no multiplier)`); shake(1.8); }
    await Promise.all([countTo(ctx, cur, to, 320), wait(v.jackpot ? 1000 : 560)]); cur = to;
  }
  cells.forEach(e => e.classList.remove('grabbed')); hideCallout(); return cur;
}

/* ---------------------------------------------------------------- bonus entry/exit, splash copy */
const splash = id => `<svg class="llSplash" viewBox="0 0 600 520"><use href="#${id}"/></svg>`;
const chips = a => { $('introChips').innerHTML = a.map(c => `<span>${c}</span>`).join(''); };
function prepIntro(R) {
  const B = R.bonus, link = B.type === 'link', Q = document.querySelector('#introM .quote'), tap = document.querySelector('#introM .tapHint');
  if (link) {
    $('introGems').innerHTML = [1, 2, 3].map(() => '<div class="g"><svg viewBox="0 0 64 64"><use href="#s12"/></svg></div>').join(''); $('introLbl').textContent = 'RESPINS'; $('introRibbon').textContent = 'PIÑATA LINK';
    chips([`${plural(B.start.length, 'PIÑATA')} LOCK IN PLACE`, 'EVERY NEW PIÑATA RESETS THE RESPINS TO 3', 'CRACK THEM ALL FOR CASH AND JACKPOTS']);
    if (Q) Q.textContent = '"Hang on to your sombrero. The piñatas are swinging."'; if (tap) tap.textContent = 'TAP ANYWHERE TO START THE LINK'; $('introArt').innerHTML = splash('llSplashLink');
  } else {
    const party = R.bought === 'party'; $('introGems').innerHTML = [1, 2, 3].map(() => '<div class="g"><svg viewBox="0 0 64 64"><use href="#s11"/></svg></div>').join(''); $('introLbl').textContent = 'FREE SPINS'; $('introRibbon').textContent = party ? 'PARTY PACK' : 'PONCHO PARADE';
    chips([party ? '3 STICKY PONCHOS TO START, x3 FROM SPIN 1' : `${B.drums} FIESTA DRUMS = ${B.startSpins} FREE SPINS`, 'EVERY WILD PONCHO STICKS', 'MORE PONCHOS: x1 x2 x3 x5 x8 x10']);
    if (Q) Q.textContent = '"Every poncho sticks. Every stripe pays more."'; if (tap) tap.textContent = 'TAP ANYWHERE TO START THE PARADE'; $('introArt').innerHTML = splash('llSplashParade');
  }
}
function resetCells() { cells.forEach(e => { e.classList.remove('top', 'sticky', 'locked', 'blank', 'cracked', 'sp', 'win', 'wl', 'hit', 'scat'); const l = e.querySelector('.lkr'); if (l) l.remove(); e.getAnimations().forEach(a => a.cancel()); e.querySelectorAll('svg.g,.m').forEach(x => x.getAnimations().forEach(a => a.cancel())); e.style.cssText = `grid-column:${e._c + 1};grid-row:${e._r + 1}`; }); }
function overlaysOff() {
  hideCallout(); clearLines(); GRID.classList.remove('focus', 'link'); ['lkRespins', 'lkTotal', 'pdSpins', 'pdCallSpins', 'pdCallMult', 'grandPlate'].forEach(id => plate(id, false));
  Object.keys(JPV).forEach(k => jpEl(k).classList.remove('lit', 'hit'));
}

/* ---------------------------------------------------------------- hooks */
return {
  music: musicDefs,
  sfx(kit) {
    const { ctx, bus, env, osc, noise, metal, st, T0 } = kit;
    const N = k => 261.63 * st(MAJ[((k % 7) + 7) % 7] + 12 * Math.floor(k / 7));
    const pl = (f, t, v = .08, d = .5) => { osc('triangle', f, t, d, v, .003); osc('sine', f * 2, t, d * .5, v * .35, .003); noise(t, .02, v * .4, 'highpass', 4000, 0, .7, .001); };
    const bell = (f, t, v = .07, d = 1.1) => metal(f, t, d, v, [1, 2.4, 4.1]);
    const tr = (f, t, v = .05, d = .32) => { osc('sawtooth', f, t, d, v, .02); osc('sawtooth', f * 1.006, t, d, v * .7, .02); osc('square', f * 2, t, d * .6, v * .12, .02); };
    const thud = (t, v = 1, f = 140) => { osc('sine', f, t, .16, .3 * v, .002, 56); noise(t, .05, .14 * v, 'lowpass', 900, 200, .8, .002); };
    const R = {
      ui: () => { const t = T0(); pl(N(9), t, .05, .3); },
      tap: () => { const t = T0(); pl(N(10), t, .05, .3); },
      hit: () => { const t = T0(); noise(t, .06, .1, 'highpass', 3500, 7000, .7); pl(N(11), t, .06, .4); },
      spin: () => { const t = T0(); noise(t, .45, .09, 'bandpass', 500, 2400, 1, .15); for (let i = 0; i < 6; i++) noise(t + i * .07, .05, .035, 'highpass', 5200, 0, .8, .002); osc('sine', 110, t, .3, .1, .05, 70); },
      reelStop: c => { const t = T0(); thud(t, 1, 150 - c * 6); osc('triangle', 880 + c * 90, t, .07, .05, .001, 520); },
      drum: k => { const t = T0(); osc('sine', 210, t, .28, .36, .002, 70); noise(t, .12, .16, 'bandpass', 1800, 600, 1, .002); bell(N(7 + k * 2), t + .02, .07, 1.2); },
      pinata: k => { const t = T0(); noise(t, .09, .13, 'bandpass', 2600, 900, 1.2, .001); osc('sine', 500 + k * 60, t, .12, .12, .002, 1300); bell(N(9 + k), t + .04, .06, .8); },
      lock: () => { const t = T0(); osc('sine', 120, t, .25, .35, .002, 50); noise(t, .1, .2, 'lowpass', 1200, 200, .8, .002); metal(980, t + .01, .6, .07, [1, 2.4, 3.9]); },
      crack: k => { const t = T0(); noise(t, .06, .22, 'highpass', 1500, 0, .8, .001); osc('square', 240, t, .07, .08, .001, 90); osc('sine', 320 + k * 40, t, .15, .1, .004, 700); for (let i = 0; i < 6; i++) bell(1500 + ((i * 937 + k * 331) % 2600), t + .05 + i * .035, .03, .5); },
      beat: () => { const t = T0(); thud(t, 1.1, 66); thud(t + .2, .8, 62); noise(t, .45, .035, 'bandpass', 500, 2400, 1.2, .2); },
      tease: () => { const t = T0(); noise(t, .9, .05, 'bandpass', 400, 2600, 1.2, .5); },
      line: i => { const t = T0(); pl(N(7 + Math.min(i, 4) * 2), t, .09, .5); bell(N(14 + Math.min(i, 4)), t + .04, .05, 1); },
      poncho: k => { const t = T0(); noise(t, .35, .08, 'bandpass', 700, 2600, 1, .1); [0, 2, 4].forEach((d, i) => bell(N(9 + d + k), t + .08 + i * .06, .06, 1)); thud(t + .05, .6, 120); },
      ladder: s => { const t = T0(); for (let i = 0; i < 2 + Math.min(4, s); i++) { pl(N(7 + i), t + i * .07, .08, .6); bell(N(14 + i), t + i * .07, .04, 1.2); } thud(t, .8, 90); },
      spinsAdd: () => { const t = T0(); [0, 2, 4, 7].forEach((d, i) => { pl(N(9 + d), t + i * .08, .09, .7); }); },
      swing: () => { const t = T0(); noise(t, .35, .12, 'bandpass', 500, 2200, 1, .1); thud(t + .22, 1, 100); },
      grab: () => { const t = T0(); noise(t, .2, .08, 'highpass', 4000, 8000, .8, .01); [0, 1, 2].forEach(i => bell(1800 + i * 500, t + i * .04, .04, .5)); },
      reset: () => { const t = T0(); [0, 2, 4, 7].forEach((d, i) => pl(N(9 + d), t + i * .06, .08, .6)); },
      jackpot: kind => { const t = T0(), n = { mini: 4, minor: 5, major: 7, grand: 10 }[kind] || 4; osc('sine', 70, t, 1.4, .45, .004, 30); for (let i = 0; i < n; i++) { tr(N(7 + i * 1.3 | 0) * 2, t + .1 + i * .09, .04, .35); bell(N(14 + i), t + .12 + i * .09, .06, 2); } for (let i = 0; i < 6; i++) thud(t + i * .09, .6, 110); },
      cheer: () => { const t = T0(); osc('sawtooth', 300, t, .5, .05, .04, 620); osc('sawtooth', 450, t + .2, .45, .05, .04, 880); [4, 5, 7, 9].forEach((d, i) => tr(N(d) * 2, t + .3 + i * .1, .04, .4)); },
      bonus: () => { const t = T0(); osc('sine', 75, t, 1.2, .4, .01, 37); [0, 2, 4, 5, 7, 9].forEach((d, i) => { tr(N(7 + d), t + i * .1, .045, .5); bell(N(14 + d), t + .1 + i * .1, .06, 2); }); },
      outro: () => { const t = T0(); [7, 5, 3, 0].forEach((d, i) => { pl(N(7 + d), t + i * .2, .08, 1.2); }); },
      big: lv => { const t = T0(); for (let i = 0; i < lv + 3; i++) { tr(N(7 + i * 2) * 2, t + .3 + i * .15, .04, .45); bell(N(14 + i), t + .3 + i * .15, .07, 2.2); } for (let i = 0; i < 2 + lv; i++) thud(t + i * .3, .9, 100); },
      tick: k => { const t = T0(); osc('triangle', 650 + k * 900, t, .05, .08, .001); bell(1500 + k * 1200, t, .025, .3); },
      feverOn: () => { const t = T0(); noise(t, .6, .1, 'bandpass', 500, 1900, 1.4, .25); [0, 2, 4, 7].forEach((d, i) => tr(N(9 + d), t + .3 + i * .08, .04, .4)); }
    };
    window.__llR = R; return R;
  },
  particleColor: (p, a) => p.c ? `rgba(255,${200 + (p.l % 40)},90,${a})` : `rgba(255,${150 + (p.l % 60)},${150 + (p.l % 80)},${a})`,
  splashArt: kind => splash(kind === 'outro' ? 'llSplashOutro' : 'llSplashParade'),
  init() {
    for (let c = 0; c < 5; c++) for (let r = 0; r < 3; r++) { const e = mkCellEl(); e._c = c; e._r = r; e.style.cssText = `grid-column:${c + 1};grid-row:${r + 1}`; GRID.appendChild(e); cells.push(e); }
    mkReels();
    /* phones that are shorter than ~19:9 (360x640, tablets): the logo/ladder/jackpot stack above the board needs room, so the board is zoomed a little smaller (the shell reads cfg.portrait on every fit) */
    const tunePortrait = () => {
      if (!(innerHeight > innerWidth * 1.02)) return false; const pt = S.cfg.portrait || (S.cfg.portrait = {}), W = 900, H = Math.max(1500, Math.round(W * innerHeight / innerWidth));
      const g = Math.min(W / 840, (H - 652) / 1020), pad = Math.max(40, Math.round((W / g - 750) / 2)); if (pt.left === pad && pt.right === pad) return false; pt.left = pt.right = pad; return true;
    };
    addEventListener('resize', () => { if (tunePortrait()) dispatchEvent(new Event('resize')); }); if (tunePortrait()) setTimeout(() => dispatchEvent(new Event('resize')), 0);
    buildPaytable();
    new MutationObserver(() => { if (!S.isBusy()) { stakeNow = S.bet(); refreshJackpots(); cells.forEach(e => { if (e._code === 'MON' && e._mon) setEl(e, 'MON', e._mon); }); } }).observe($('bet'), { childList: true, characterData: true, subtree: true });
    window.__ll = { cells, reels, get simT() { return simT; }, callout, snapBoard };
  },
  paintIdle() {
    stakeNow = S.bet();
    paint([['SKU', 'TAC', 'GUI'], ['SKU', 'MON', 'SOM'], ['WLD', 'LUC', 'SCA'], ['TRU', 'MAC', 'MON'], ['CHI', 'MAS', 'MAR']], [{ reel: 1, row: 1, value: 5, jackpot: null }, { reel: 3, row: 2, value: 50, jackpot: 'MINOR' }]);
    Object.keys(JPV).forEach(k => jpEl(k).classList.add('on')); refreshJackpots(); setLadder(0); lastSnap = snapBoard();
  },
  roundStart() { document.body.classList.remove('llb'); gen++; clearTimers(); stakeNow = S.bet(); overlaysOff(); abortReels(); resetCells(); setBlurMode(false); inBonus = false; bType = null; linkReady = false; pdReady = false; lastStep = 0; lastMult = 1; setLadder(0); Object.keys(JPV).forEach(k => jpEl(k).classList.add('on')); refreshJackpots(); lastSnap = snapBoard(); },
  async clearBoard() { if (bType === 'link') return; startReels([1, 1, 1, 1, 1]); await wait(260); },
  restoreBoard() { clearTimers(); abortReels(); overlaysOff(); resetCells(); setBlurMode(false); if (lastSnap) paint(lastSnap.grid, lastSnap.money); },
  baseSpin: R => { curR = R; return Object.assign({}, R.spin, { __base: true }); },
  playSpin: (sp, run, ctx) => sp.__base ? baseSpinPlay(sp, run, ctx) : sp.respinsBefore != null ? linkRespin(sp, run, ctx) : paradeSpin(sp, run, ctx),
  async showTrigger(R) {
    prepIntro(R); const link = R.bonus.type === 'link', cs = cells.filter(e => e._code === (link ? 'MON' : 'SCA')); stakeNow = S.bet();
    GRID.classList.add('focus'); cells.forEach(e => { if (cs.includes(e)) e.classList.add('win'); });
    cs.forEach((e, i) => FX.act(e, i * 60, i)); callout(link ? 'PIÑATA LINK!' : `${cs.length} FIESTA DRUMS! PONCHO PARADE!`); sfx.cheer(); await wait(1300);
    cs.forEach(e => FX.rest(e)); cells.forEach(e => e.classList.remove('win')); GRID.classList.remove('focus'); hideCallout(); baseSnap = baseSnap || snapBoard();
  },
  bonusMode(on) {
    const sc = $('scene'), lg = $('logo'), R = curR; if (!R || !R.bonus) return;
    if (on) {
      inBonus = true; bType = R.bonus.type; document.body.classList.add('llb'); sc.classList.add('bonus'); lg.classList.add('off'); S.music.intensity(.35); linkReady = false; pdReady = false; hideCallout();
      if (bType === 'parade') { Object.keys(JPV).forEach(k => jpEl(k).classList.remove('on')); plate('pdSpins', true); $('pdSpinsN').textContent = R.bonus.startSpins; }
    } else {
      inBonus = false; document.body.classList.remove('llb'); sc.classList.remove('bonus'); lg.classList.remove('off'); S.music.intensity(0); overlaysOff(); abortReels(); resetCells(); setBlurMode(false); setLadder(0);
      Object.keys(JPV).forEach(k => jpEl(k).classList.add('on')); refreshJackpots();
      if (baseSnap) paint(baseSnap.grid, baseSnap.money); bType = null;
      const link = R.bonus.type === 'link'; $('outroRibbon').textContent = link ? 'THE LINK IS COMPLETE' : R.bought === 'party' ? 'THE PARTY IS OVER' : 'THE PARADE IS OVER';
      document.querySelector('#outroM .mtop').textContent = link ? 'PIÑATA LINK TOTAL' : 'PARADE TOTAL'; $('outroArt').innerHTML = splash('llSplashOutro');
    }
  }
};

/* ---------- Game Info paytable (engine info() embedded by the build) ---------- */
function buildPaytable() {
  const f = v => `<td>${+(+v).toFixed(2)}x</td>`, row = (id, name, tds) => `<tr><td><div class="nm"><svg viewBox="0 0 128 128"><use href="#s${id}"/></svg>${name}</div></td>${tds}</tr>`;
  const order = ['LUC', 'TRU', 'MAS', 'SOM', 'SKU', 'TAC', 'GUI', 'CHI', 'MAC', 'MAR'], T2 = INFO.parade.paytable, T1 = INFO.paytable, nm = c => NAMES[ID[c]].charAt(0) + NAMES[ID[c]].slice(1).toLowerCase();
  const tab = tb => order.map(c => row(ID[c], nm(c) === 'Lucho' ? 'Don Lucho' : nm(c), tb[c].map(f).join(''))).join('');
  $('ptab').innerHTML = '<tr><th>SYMBOL</th><th>3 IN A LINE</th><th>4</th><th>5</th></tr>' + tab(T1) +
    row(10, 'Poncho (Wild)', '<td colspan="3">Replaces every pay symbol (not the drum or the piñata). Lands on reels 2 to 5. Five wilds pay like Don Lucho.</td>') +
    row(11, 'Fiesta Drum (Scatter)', `<td colspan="3">3, 4 or 5 drums: ${INFO.parade.spins[3]}, ${INFO.parade.spins[4]} or ${INFO.parade.spins[5]} Poncho Parade free spins.</td>`) +
    row(12, 'Money Piñata', `<td colspan="3">Cash x1 to x25 your bet, or MINI ${JPV.MINI}x, MINOR ${JPV.MINOR}x, MAJOR ${JPV.MAJOR}x, GRAND ${JPV.GRAND.toLocaleString('en-US')}x. 6 or more start Piñata Link.</td>`);
  $('ptab').insertAdjacentHTML('afterend', '<h4 class="ptsub">PONCHO PARADE PAYTABLE (the ladder multiplies these wins)</h4><table class="pt" id="ptab2"><tr><th>SYMBOL</th><th>3 IN A LINE</th><th>4</th><th>5</th></tr>' + tab(T2) + '</table>' +
    `<p class="ptnote">Ladder (all line wins of a free spin): ${INFO.parade.ladder.map(l => l[0] + (l[0] === 10 ? '+' : '') + ' poncho' + (l[0] > 1 ? 's' : '') + ' x' + l[1]).join(', ')}. Piñatas paid by Don Lucho are not multiplied.</p>`);
}
});
