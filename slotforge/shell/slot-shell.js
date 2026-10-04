'use strict';
/* SlotForge shell: shared logic for every Nebula slot. See shell/README.md for the hook API.
 *
 *   SlotShell.boot(SLOT_CFG, S => ({ ...hooks }))
 *
 * `SLOT_CFG` is slots/<slug>/slot.json (injected by build-standalone.py). The factory receives the shell API `S` and returns the
 * slot's hooks. Pure renderer: the server returns the whole round; nothing here computes an outcome.
 * In the standalone build a global `SLOT_ENGINE` ({playRound, CFG}) exists and the shell plays against it locally (play money).
 */
const SlotShell = (() => {
const $ = id => document.getElementById(id);
const store = { get: (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const fmt = n => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const betLbl = n => '$' + (Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(2));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const tpl = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => o[k]);

const shellApi = { boot, $, store, fmt, betLbl, sleep, hooks: null, S: null };
function boot(cfg, factory) {
const LOCAL = typeof SLOT_ENGINE !== 'undefined' ? SLOT_ENGINE : null;   // standalone build: engine embedded, play money
const BETS = cfg.bets, ANTE_COST = cfg.anteCost || 0, LUCK_COST = cfg.luckCost || 0, BUYS = cfg.buys || [], P = cfg.storage || cfg.id;
let hooks = {};
let bi = BETS.indexOf(cfg.defaultBet || 1), ante = false, luck = false, busy = false, balance = 0, STAGE_S = 1;
let soundOn = store.get(P + '_snd', true), turbo = store.get(P + '_turbo', false), musicOn = store.get(P + '_mus', true), sndVol = store.get(P + '_sndv', .85), musVol = store.get(P + '_musv', .7);
const MUS_GAIN = .9;   // slider 100% = this much of the music bus; calibrated so the soundtrack sits well below the effects
let auto = { left: 0, stopFeat: true, stopBig: false, pickN: 25 }, skipBig = false;
let boost = false;   // one-round speed-up (tap during a spin/bonus); the persistent turbo toggle stays in the menu
const T = () => (turbo || boost) ? .45 : 1;
/* wait() re-reads T() every frame, so switching to turbo in the middle of a wait shortens the rest of it */
const wait = ms => new Promise(res => { let prog = 0, last = performance.now(); const tick = now => { prog += (now - last) / Math.max(1, ms * T()); last = now; if (prog >= 1) res(); else requestAnimationFrame(tick); }; if (ms <= 0) res(); else requestAnimationFrame(tick); });

/* the 1600x900 stage is scaled to fit the window */
function fit() { STAGE_S = Math.min(innerWidth / 1600, innerHeight / 900); $('stage').style.setProperty('--s', STAGE_S); }
addEventListener('resize', fit); fit();

/* ---------- audio: everything is synthesised, nothing is sampled. The shell owns the primitives; the slot owns the recipes ---------- */
function makeKit(ctx, out) {
  const sr = ctx.sampleRate, rvc = (cfg.audio && cfg.audio.reverb) || { sec: 1.7, pow: 2.8, wet: .28 };
  const nb = ctx.createBuffer(1, sr * 2, sr), nd = nb.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  // room reverb: decaying noise impulse
  const rv = ctx.createConvolver(), ib = ctx.createBuffer(2, Math.floor(sr * rvc.sec), sr);
  for (let c = 0; c < 2; c++) { const d = ib.getChannelData(c); let lp = 0; for (let i = 0; i < d.length; i++) { d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, rvc.pow); if (rvc.lp) { lp += (d[i] - lp) * rvc.lp; d[i] = lp; } } }   // rvc.lp (0..1) = one-pole lowpass on the impulse: darker room
  rv.buffer = ib; const wet = ctx.createGain(); wet.gain.value = rvc.wet; rv.connect(wet).connect(out);
  const bus = ctx.createGain(); bus.connect(out); bus.connect(rv);
  const env = (t, a, peak, d) => { const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); return g; };
  const osc = (type, f, t, d, peak, a = .004, to, dest = bus) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d); o.connect(env(t, a, peak, d)).connect(dest); o.start(t); o.stop(t + a + d + .05); };
  const noise = (t, d, peak, type, f1, f2, q = 1, a = .002) => { const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f1, t); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + d); f.Q.value = q; s.connect(f).connect(env(t, a, peak, d)).connect(bus); s.start(t, Math.random()); s.stop(t + a + d + .05); };
  const metal = (f, t, d, peak, R = [1, 2.756, 5.404, 8.933]) => R.forEach((r, i) => osc('sine', f * r, t, d / (1 + i * .7), peak / (1 + i * 1.1), .002));
  const st = n => Math.pow(2, n / 12);
  const T0 = () => ctx.currentTime + .005;
  /* ambience bed: looping filtered noise + random crackles. o = {lowpass, gain, level, loopSec, crack:{gain:[min,range], f:[min,range], q, every:[min,range], len:[min,range]}} */
  const bed = (o = {}) => {
    const c = ctx, k = Object.assign({ lowpass: 170, gain: .5, level: .02, loopSec: 3 }, o), ck = Object.assign({ gain: [.025, .05], f: [2500, 4500], q: 3, every: [120, 900], len: [.03, .05] }, o.crack);
    let nodes = null, timer = 0;
    return {
      start() { if (timer) return; const s = c.createBufferSource(), b = c.createBuffer(1, c.sampleRate * k.loopSec, c.sampleRate), d = b.getChannelData(0); let l = 0;
        for (let i = 0; i < d.length; i++) { l = (l + (Math.random() * 2 - 1) * k.level) / 1.02; d[i] = l * 3; }
        s.buffer = b; s.loop = true; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = k.lowpass; const g = c.createGain(); g.gain.value = k.gain; s.connect(f).connect(g).connect(out); s.start(); nodes = { s, g };
        const crack = () => { if (!nodes) return; const t = c.currentTime, n = c.createBufferSource(); n.buffer = b; const q = c.createBiquadFilter(); q.type = 'bandpass'; q.frequency.value = ck.f[0] + Math.random() * ck.f[1]; q.Q.value = ck.q;
          const e = c.createGain(); e.gain.setValueAtTime(.0001, t); e.gain.exponentialRampToValueAtTime(ck.gain[0] + Math.random() * ck.gain[1], t + .004); e.gain.exponentialRampToValueAtTime(.0001, t + ck.len[0] + Math.random() * ck.len[1]); n.connect(q).connect(e).connect(out); n.start(t, Math.random() * 2); n.stop(t + .12); timer = setTimeout(crack, ck.every[0] + Math.random() * ck.every[1]); };
        crack(); },
      stop() { clearTimeout(timer); timer = 0; if (nodes) { try { nodes.s.stop(); } catch {} nodes = null; } }
    };
  };
  /* feedback delay send (sonar ping, echoes): kit.ping({time, fb, lp, wet}) -> a GainNode to connect sources to (created once) */
  let pingN = null;
  const ping = (o = {}) => { if (pingN) return pingN; const k = Object.assign({ time: .32, fb: .45, lp: 2500, wet: .5 }, o);
    const inp = ctx.createGain(), dl = ctx.createDelay(2), fb = ctx.createGain(), f = ctx.createBiquadFilter(), w = ctx.createGain();
    dl.delayTime.value = k.time; fb.gain.value = k.fb; f.type = 'lowpass'; f.frequency.value = k.lp; w.gain.value = k.wet;
    inp.connect(out); inp.connect(dl); dl.connect(f); f.connect(fb); fb.connect(dl); f.connect(w); w.connect(out); pingN = inp; return inp; };
  return { ctx, out, bus, env, osc, noise, metal, st, T0, bed, ping };
}
let ac, master, sfxG, recipes, ambCtl = null, mus = null, curTheme = 'base';
function audio() {
  if (!recipes) { ac = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; master = ac.createGain(); master.gain.value = .9; master.connect(comp).connect(ac.destination);
    sfxG = ac.createGain(); sfxG.gain.value = sndVol; sfxG.connect(master);
    const kit = makeKit(ac, sfxG); recipes = hooks.sfx(kit); if (hooks.ambience) ambCtl = hooks.ambience(kit);
    if (hooks.music && typeof SlotMusic !== 'undefined') mus = SlotMusic.make(ac, master, hooks.music(), { volume: musVol * MUS_GAIN }); }
  if (ac.state === 'suspended') ac.resume(); return recipes;
}
const sfx = new Proxy({}, { get: (_, k) => (...a) => { if (!soundOn) return; try { audio()[k](...a); } catch {} } });
const amb = {
  start() { if (!soundOn) return; try { audio(); if (ambCtl) ambCtl.start(); } catch {} },
  stop() { if (ambCtl) ambCtl.stop(); }
};
/* music: starts after the first user gesture (browser autoplay rule), separate on/off + volume; themes: 'base' / 'bonus' */
const music = {
  start() { if (!musicOn) return; try { audio(); if (mus) mus.start(curTheme); } catch {} },
  stop() { if (mus) mus.stop(.35); },
  theme(n, xf = 2.2) { curTheme = n; try { if (mus && musicOn) mus.theme(n, xf); } catch {} },
  intensity(x) { try { if (mus) mus.intensity(x); } catch {} },
  duck(d, h, r) { try { if (mus && musicOn) mus.duck(d, h, r); } catch {} },
  stinger(n) { try { if (mus && musicOn) mus.stinger(n); } catch {} }
};
addEventListener('pointerdown', () => { amb.start(); music.start(); }, { once: true });

/* ---------- particles (restrained: small ambient sparks + event bursts) ---------- */
const cv = $('fx'), cx = cv.getContext('2d'); let parts = [];
function size() { cv.width = innerWidth; cv.height = innerHeight; } size(); addEventListener('resize', size);
function embers(n, x = innerWidth / 2, y = innerHeight / 2, gold) {
  for (let i = 0; i < n; i++) parts.push({ x, y, vx: (Math.random() - .5) * 9, vy: -Math.random() * 8 - 1, l: 60 + Math.random() * 60, s: 2 + Math.random() * 3.5, g: .14, c: gold ? 1 : 0 });
}
function coins(n) { for (let i = 0; i < n; i++) parts.push({ x: Math.random() * innerWidth, y: -20, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 4, l: 200, s: 6 + Math.random() * 6, g: .05, c: 1 }); }
function ambient() {
  if (parts.length > 120) return;
  if (Math.random() < .12 + (hooks.ambientBoost ? hooks.ambientBoost() : 0)) parts.push({ x: Math.random() * innerWidth, y: innerHeight + 6, vx: (Math.random() - .5) * .6, vy: -(.5 + Math.random() * 1.1), l: 260 + Math.random() * 160, s: 1.2 + Math.random() * 2, g: -.001, w: Math.random() * 6, c: 0 });
}
const defColor = (p, a) => `rgba(255,255,255,${a})`;
(function loop() {
  cx.clearRect(0, 0, cv.width, cv.height); ambient();
  parts = parts.filter(p => p.l-- > 0 && p.y > -30 && p.y < innerHeight + 30);
  const col = hooks.particleColor || defColor;
  for (const p of parts) {
    p.x += p.vx + (p.w ? Math.sin((p.l + p.w * 40) / 25) * .4 : 0); p.y += p.vy; p.vy += p.g;
    if (p.sh) {   // a tumbling chip/shard (polygon), coloured by p.col
      p.rot += p.vr; p.vx *= .985; const a = Math.min(1, p.l / 22); cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalAlpha = a; cx.fillStyle = p.col; cx.beginPath();
      p.sh.forEach(([px, py], i) => i ? cx.lineTo(px * p.s, py * p.s) : cx.moveTo(px * p.s, py * p.s)); cx.closePath(); cx.fill();
      if (p.edge) { cx.strokeStyle = p.edge; cx.lineWidth = 1.2; cx.stroke(); } cx.restore(); continue;
    }
    const a = Math.min(1, p.l / 70); cx.fillStyle = col(p, a);
    cx.fillRect(p.x, p.y, p.s, p.s);
  }
  requestAnimationFrame(loop);
})();
/* shake(level): true/false (legacy) or 0..4; amplitude and length grow with the level, decaying hand-keyed jolts (no CSS keyframes) */
let shakeA = null;
const shake = lv => {
  const L = lv === true ? 2.5 : lv === false || lv == null ? 1 : Math.max(.2, lv), a = $('shaker'), amp = 2.5 + L * 3.4, n = 6 + Math.round(L * 2), kf = [{ transform: 'none' }];
  for (let i = 1; i <= n; i++) { const d = Math.pow(1 - i / (n + 1), 1.6); kf.push({ transform: `translate(${((i % 2 ? 1 : -1) * amp * d * (.7 + Math.random() * .6)).toFixed(1)}px,${((Math.random() - .5) * amp * 1.2 * d).toFixed(1)}px) rotate(${((i % 2 ? .1 : -.1) * L * d).toFixed(2)}deg)` }); }
  kf.push({ transform: 'none' }); if (shakeA) shakeA.cancel(); shakeA = a.animate(kf, { duration: (260 + L * 190) * T(), easing: 'linear' });
};
let flashA = null;
const flash = lv => { const f = $('flash'); if (flashA) flashA.cancel(); const L = lv == null ? 2 : lv; f.classList.remove('go'); flashA = f.animate([{ opacity: Math.min(.95, .25 + L * .17) }, { opacity: 0 }], { duration: (240 + L * 110) * T(), easing: 'cubic-bezier(.2,.7,.3,1)' }); };
/* FX: hand-timed board choreography (Web Animations: transform/opacity only). Slots pass cells/elements in; nothing here knows a slot. */
const SVGNS = 'http://www.w3.org/2000/svg';
const FX = {
  ease: { gravity: 'cubic-bezier(.55,0,.9,.6)', out: 'cubic-bezier(.2,.75,.3,1)', io: 'cubic-bezier(.65,0,.35,1)', in: 'cubic-bezier(.5,0,.9,.45)', back: 'cubic-bezier(.3,1.6,.5,1)' },
  el(tag, attrs = {}, parent) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; },
  reset(cell) { cell.getAnimations().forEach(a => a.cancel()); cell.style.cssText = ''; },
  /* anticipation (a small hop up and a squash), then the cell falls out, faster and faster, tilting a little */
  out(cell, o = {}) {
    const k = T(), up = o.up == null ? 11 : o.up, dist = o.dist || 400, rot = o.rot || 0; cell.style.transformOrigin = '50% 80%';
    return cell.animate([
      { transform: 'translateY(0) scale(1,1)', opacity: 1, offset: 0, easing: 'cubic-bezier(.3,0,.5,1)' },
      { transform: 'translateY(3px) scale(1.04,.95)', opacity: 1, offset: .13, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: `translateY(${-up}px) scale(.96,1.06)`, opacity: 1, offset: .3, easing: FX.ease.in },
      { transform: `translateY(${dist * .55}px) rotate(${rot * .5}deg) scale(.97,1.08)`, opacity: 1, offset: .82, easing: 'linear' },
      { transform: `translateY(${dist}px) rotate(${rot}deg) scale(.98,1.1)`, opacity: 0, offset: 1 }
    ], { duration: (o.dur || 520) * k, delay: (o.delay || 0) * k, fill: 'forwards' });
  },
  /* falls from above with gravity, stretches into the landing, squashes, bounces a hair, settles. Contact is at 58% of the duration. */
  drop(cell, o = {}) {
    const k = T(), h = o.dist || 300, tilt = o.tilt || 0, e = FX.ease; cell.style.transformOrigin = '50% 100%';
    return cell.animate([
      { transform: `translateY(${-h}px) rotate(${tilt}deg) scale(1,1)`, opacity: 0, offset: 0, easing: e.gravity },
      { transform: `translateY(${-h * .5}px) rotate(${tilt * .5}deg) scale(.98,1.04)`, opacity: 1, offset: .2, easing: e.gravity },
      { transform: 'translateY(0) rotate(0deg) scale(.94,1.1)', opacity: 1, offset: .58, easing: e.out },
      { transform: 'translateY(0) scale(1.13,.83)', opacity: 1, offset: .67, easing: e.out },
      { transform: 'translateY(-10px) scale(.97,1.05)', opacity: 1, offset: .79, easing: 'cubic-bezier(.4,0,.8,.6)' },
      { transform: 'translateY(0) scale(1.04,.96)', opacity: 1, offset: .9, easing: e.out },
      { transform: 'none', opacity: 1, offset: 1 }
    ], { duration: (o.dur || 600) * k, delay: (o.delay || 0) * k, fill: 'both' });
  },
  /* ms from now (turbo-scaled) at which a drop() with these options touches down */
  impact: o => ((o.delay || 0) + (o.dur || 600) * .58) * T(),
  /* a symbol with no authored win animation still acts: an anticipation squash, a hop, a landing and a little wobble (timing varies with its place in the link) */
  hop(el, delay = 0, wi = 0) {
    const s = wi % 2 ? 1 : -1, k = T(), v = 1 + (wi % 3) * .06; el.style.transformOrigin = '50% 90%';
    return el.animate([
      { transform: 'none', offset: 0, easing: 'cubic-bezier(.3,0,.4,1)' },
      { transform: 'translateY(3px) scale(1.09,.88)', offset: .16, easing: 'cubic-bezier(.1,.7,.3,1)' },
      { transform: `translateY(${-17 * v}px) rotate(${-4 * s}deg) scale(.93,1.12)`, offset: .38, easing: 'cubic-bezier(.4,0,.7,.5)' },
      { transform: `translateY(0) rotate(${2 * s}deg) scale(1.1,.86)`, offset: .62, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: `translateY(-4px) rotate(${-2 * s}deg) scale(.98,1.03)`, offset: .78, easing: 'cubic-bezier(.4,0,.6,1)' },
      { transform: 'none', offset: 1 }
    ], { duration: 820 * k, delay: delay * k });
  },
  /* does the symbol carry authored win parts (class a-*)? */
  _parts: {},
  hasParts(id) { if (!(id in FX._parts)) FX._parts[id] = !!document.querySelector(`#${id} [class*="a-"]`); return FX._parts[id]; },
  /* put a cell into its win pose: the symbol's own animation is released through custom properties (--win, --delay, --wi inherit into <use>) */
  act(cell, delay = 0, wi = 0) {
    cell.classList.add('hit'); const st = cell.style; st.setProperty('--win', 'running'); st.setProperty('--delay', delay * T() + 'ms'); st.setProperty('--wi', wi); st.zIndex = 'auto';
    const g = cell.querySelector('svg.g'); if (!g) return null;
    const n = g.cloneNode(true); n.style.zIndex = 8; g.replaceWith(n);   // a fresh <use> tree restarts the symbol's CSS animation
    const m = cell.querySelector('.m'); if (m) m.style.zIndex = 9;
    const u = n.querySelector('use'), id = u ? (u.getAttribute('href') || '').slice(1) : ''; if (!FX.hasParts(id)) FX.hop(n, delay, wi);
    return n;
  },
  /* back to rest after a win pose (the winners stay on the board) */
  rest(cell) { if (!cell.classList.contains('hit')) return; cell.classList.remove('hit', 'scat'); ['--win', '--delay', '--wi'].forEach(p => cell.style.removeProperty(p)); cell.style.zIndex = ''; const g = cell.querySelector('svg.g'); if (g) g.style.zIndex = ''; const m = cell.querySelector('.m'); if (m) m.style.zIndex = ''; },
  /* the symbol bursts: a quick swell, then it is gone in pieces. colors = chip colours; pieces fly from the cell centre (screen px) */
  burst(cell, colors, o = {}) {
    const g = cell.querySelector('svg.g'), k = T(), r = cell.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (g) { g.style.transformOrigin = '50% 55%'; g.animate([{ transform: 'scale(1)', opacity: 1, offset: 0, easing: 'cubic-bezier(.3,0,.5,1)' }, { transform: `scale(${o.swell || 1.18},${(o.swell || 1.18) * .92}) rotate(${(o.rot || -4)}deg)`, opacity: 1, offset: .35, easing: 'cubic-bezier(.5,0,1,.6)' }, { transform: 'scale(.15) rotate(' + (o.rot > 0 ? 40 : -40) + 'deg)', opacity: 0, offset: 1 }], { duration: (o.dur || 300) * k, fill: 'forwards' }); }
    FX.shards(x, y, o.n || 9, colors, o);
  },
  shards(x, y, n, colors, o = {}) {
    const pw = o.power || 1, sc = STAGE_S;
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = (2 + Math.random() * 6) * pw * sc, tri = Math.random() < .6;
      parts.push({ x: x + Math.cos(a) * 6 * sc, y: y + Math.sin(a) * 6 * sc, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (2.5 + Math.random() * 3) * pw * sc, g: .34 * sc, l: 34 + Math.random() * 30, s: (4 + Math.random() * 6) * sc,
        rot: Math.random() * 6.28, vr: (Math.random() - .5) * .5, col: colors[Math.floor(Math.random() * colors.length)], edge: o.edge || 'rgba(20,10,6,.55)',
        sh: tri ? [[-1, .8], [1, .5], [.1, -1]] : [[-1, -.6], [.9, -.9], [1, .7], [-.7, 1]], c: 0 }); }
  },
  /* flexible tween with an easing fn (counters, meters) */
  tween(ms, fn, ease = t => 1 - Math.pow(1 - t, 3)) { return new Promise(res => { const t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / ms); fn(ease(k), k); k < 1 ? requestAnimationFrame(f) : res(); })(t0); }); },
  /* smooth curve through points as cubic Beziers (Catmull-Rom); sag pushes the controls down (a slack line) */
  curve(pts, sag = 0) {
    if (pts.length < 2) return ''; let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6 + sag).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6 + sag).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`; }
    return d;
  },
  /* an SVG layer in the board's frame; z below (7) / above (10) the lifted winning symbols (8) */
  layer(id, z) { let l = document.getElementById(id); if (l) return l; const fr = $('fxl').parentNode, g = $('grid'); l = FX.el('svg', { id, width: g.offsetWidth, height: g.offsetHeight, viewBox: `0 0 ${g.offsetWidth} ${g.offsetHeight}` });
    l.style.cssText = `position:absolute;left:${g.offsetLeft}px;top:${g.offsetTop}px;pointer-events:none;overflow:visible;z-index:${z}`; fr.append(l); return l; }
};
const say = (t, hl) => { $('msg').textContent = t; $('msg').classList.toggle('hl', !!hl); };

/* ---------- character controller: one CSS class per state on #char (states are animated in slot.css) ---------- */
let charT;
const cc = cfg.char || { el: 'char', states: ['swing', 'win', 'big', 'boom'], bonusClass: 'bonusmode' };
function char(name, ms) {
  const c = $(cc.el); c.classList.remove(...cc.states); void c.getBoundingClientRect(); c.classList.add(name);
  clearTimeout(charT); charT = setTimeout(() => c.classList.remove(name), ms);
}

/* count a number up (click to skip) */
function countUp(el, to, ms, from = 0, onTick) {
  return new Promise(res => { const t0 = performance.now(); skipBig = false; let lt = 0;
    (function f(t) { if (onTick && t - lt > 75) { lt = t; onTick(Math.min(1, (t - t0) / ms)); }
      const k = skipBig ? 1 : Math.min(1, (t - t0) / ms); el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      k < 1 ? requestAnimationFrame(f) : res(); })(t0); });
}
/* floating "+$x.xx" pop at a screen point, inside #fxl (the board's fx layer) */
function pop(sx, sy, text, layer = $('fxl')) {
  const g = layer.getBoundingClientRect(), e = document.createElement('div'); e.className = 'pop'; e.textContent = text;
  e.style.left = ((sx - g.left) / STAGE_S) + 'px'; e.style.top = ((sy - g.top) / STAGE_S) + 'px'; layer.append(e); setTimeout(() => e.remove(), 1200);
}

/* ---------- API client: server round, or the embedded engine with play money (standalone) ---------- */
const API = location.origin.startsWith('http') ? '' : 'http://localhost:3000';
const TOKEN = LOCAL ? null : localStorage.getItem('stakeToken');
const _r2 = n => Math.round(n * 100) / 100;
let wallet = 0;
if (LOCAL) { try { wallet = Number(localStorage.getItem(cfg.walletKey) || cfg.startBalance || 1000); } catch { wallet = cfg.startBalance || 1000; } if (!(wallet >= 0.1)) wallet = cfg.startBalance || 1000; }
const webRng = () => { const a = new Uint32Array(2); crypto.getRandomValues(a); return (a[0] * 2 ** 21 + (a[1] >>> 11)) / 2 ** 53; };
async function api(body) {
  if (LOCAL) {
    const stake = _r2(body.stake), buy = body.buy || null;
    const round = LOCAL.playRound(webRng, { ante: !!body.ante, buy, luck: !!body.luck });
    const cost = _r2(stake * round.cost), payout = _r2(stake * round.totalPayout);
    if (cost > wallet + 1e-9) throw new Error('Not enough balance (clear site data to reset play money)');
    wallet = _r2(wallet - cost + payout); try { localStorage.setItem(cfg.walletKey, wallet); } catch {}
    return { round, stake, cost, payout, user: { balance: wallet } };
  }
  const r = await fetch(API + cfg.api, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + TOKEN }, body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Spin failed'); return j;
}
function syncParent(u) { try { const a = parent !== window && parent._slotAPI; if (a) { a.bal = u.balance; a.paintBal(0); } } catch {} }

/* ---------- modals ---------- */
const openM = id => { $(id).hidden = false; }, closeM = id => { $(id).hidden = true; };
document.querySelectorAll('.modal [data-close]').forEach(b => b.onclick = () => closeM(b.closest('.modal').id));
document.querySelectorAll('.modal').forEach(m => m.addEventListener('mousedown', e => { if (e.target === m && m.id !== 'introM' && m.id !== 'outroM') { m.id === 'confirm' ? closeBuy(false) : closeM(m.id); } }));
/* tap anywhere (or Space/Enter) to continue; ignores taps for the first 450ms so a stray click can't skip it */
function tapWait(id, autoMs, minMs = 450) { return new Promise(res => { const m = $(id); openM(id); const t0 = performance.now(); let done = false;
  const fin = () => { if (done) return; done = true; closeM(id); m.removeEventListener('click', onc); removeEventListener('keydown', onk); res(); };
  const onc = () => { if (performance.now() - t0 > minMs) { sfx.hit(); fin(); } };
  const onk = e => { if ((e.code === 'Space' || e.code === 'Enter') && performance.now() - t0 > minMs) { e.preventDefault(); sfx.hit(); fin(); } };
  m.addEventListener('click', onc); addEventListener('keydown', onk); if (autoMs) setTimeout(fin, autoMs); }); }

/* ---------- big win overlay ---------- */
const tierOf = x => cfg.tiers.find(t => x >= t.min) || null;
async function bigWin(x, amt) {
  const t = tierOf(x); if (!t) return null;
  const lv = t.lv, bigMark = {}, isMax = x >= cfg.maxWin - 1e-9;   // the cap itself gets its own gold presentation
  $('big').classList.toggle('maxwin', isMax);
  $('bigT').textContent = isMax ? 'MAX WIN' : t.name + ' WIN'; $('bigA').textContent = fmt(0); $('bigX').textContent = x.toFixed(1) + 'x BET'; if ($('bigTag')) $('bigTag').textContent = isMax ? 'THE MAXIMUM. YOU HIT THE CEILING!' : t.tag || '';
  $('big').classList.add('show'); char('big', 3300); shake(lv + .6); flash(lv); embers(30 * lv * lv, innerWidth / 2, innerHeight / 2, true); if (lv > 2) coins(60 * lv);
  if (isMax) { coins(160); embers(260, innerWidth / 2, innerHeight / 2, true); setTimeout(() => { if ($('big').classList.contains('show')) { coins(120); flash(3); } }, 2200 * T()); }
  sfx.big(lv); music.duck([0, .5, .38, .28, .2][lv] || .3, 1.2 + lv * .8, 1.6); music.stinger('win');
  await Promise.race([countUp($('bigA'), amt, (isMax ? 5200 : 1400 + lv * 700) * T() + 300, 0, k => { sfx.tick(k); if (lv >= 2 && !(bigMark.a) && k > .35) { bigMark.a = 1; shake(lv * .45); } if (lv >= 3 && !bigMark.b && k > .7) { bigMark.b = 1; shake(lv * .6); flash(lv - 1); embers(40 * lv, innerWidth / 2, innerHeight / 2, true); } }), sleep(20000)]);
  await sleep(auto.left > 0 ? 700 : isMax ? 3500 : 1500 + lv * 300);
  $('big').classList.remove('show'); return t.name;
}
$('big').onclick = () => { skipBig = true; };

/* ---------- switch to turbo in the middle of a spin or bonus ---------- */
function speedUp() {
  if (turbo || boost || !busy) return; boost = true;
  try { document.getAnimations().forEach(a => { const e = a.effect, t = e && e.target; if (!t || !t.closest || e.getComputedTiming().iterations === Infinity) return; if (t.closest('#grid, #lnkB, #lnkT, #fxl, #fsBox, #msg, #sweep')) a.updatePlaybackRate(a.playbackRate / .45); }); } catch {}
  say('SPEEDING UP', false);
}
document.addEventListener('pointerdown', e => {
  if (!busy || turbo || boost || e.target.closest('button, .modal, #big, input')) return;
  if (document.querySelector('.modal:not([hidden])') || $('big').classList.contains('show')) return;
  if (e.target.closest('#stage')) speedUp();
});

/* ---------- the round ---------- */
function setBusy(b) {
  busy = b; ['m', 'p', 'buyOpen', 'menuBtn'].forEach(id => $(id).disabled = b); $('spin').disabled = false;
  $('bAuto').disabled = b && auto.left <= 0; $('spin').classList.toggle('busy', b && auto.left <= 0);
}
async function go(buy) {
  if (busy) return; setBusy(true); sfx.spin(); closeMenu(); if (cfg.text.spin) say(cfg.text.spin);
  $('win').textContent = fmt(0); $('fsBox').hidden = true;
  const stake = BETS[bi]; let out = { payout: 0, bonus: false, tier: null };
  try {
    hooks.roundStart();
    let j;
    try { [j] = await Promise.all([api({ stake, ante: buy ? false : ante, luck: buy ? false : luck, buy }), hooks.clearBoard()]); }
    catch (e) { hooks.restoreBoard(); throw e; }
    const R = j.round; let run = 0;
    balance = j.user.balance - j.payout;  // show the stake leaving now, the win as it lands
    $('bal').textContent = fmt(balance);
    const ctx = { stake, onWin: (a, b) => { $('win').textContent = fmt(b); } };
    run = await hooks.playSpin(hooks.baseSpin ? hooks.baseSpin(R) : R, 0, ctx);
    if (R.bonusTriggered) {
      out.bonus = true;
      await hooks.showTrigger(R); sfx.bonus(); music.duck(.12, 2.6, 1.6); char('big', 2500); shake(true); flash(); embers(160); await sleep(500);
      $('introN').textContent = R.bonus.startSpins; music.theme('bonus', 2.6); music.stinger('bonus'); await tapWait('introM', auto.left > 0 ? 1800 : 0);
      $('fsBox').hidden = false; $(cc.el).classList.add(cc.bonusClass); if (hooks.bonusMode) hooks.bonusMode(true); if (ambCtl && ambCtl.bonus) ambCtl.bonus(true);
      let total = R.bonus.spins.length;
      for (const sp of R.bonus.spins) {
        if (cfg.fsCounter === 'running' && sp.spinsLeft != null) total = sp.spinIndex + sp.spinsLeft;   // optional: N grows with retriggers (default: final total, as EmberClaw)
        if (!cfg.ownCounter) $('fs').textContent = `${sp.spinIndex} / ${total}` + (sp.retrigger ? '  +' + sp.retrigger : ''); if (!cfg.ownCounter) say(tpl(cfg.text.freeSpin, { n: sp.spinIndex, total }) + (sp.retrigger ? tpl(cfg.text.freeSpinRetrigger, { r: sp.retrigger }) : ''), !!sp.retrigger);
        await hooks.clearBoard();
        run = await hooks.playSpin(sp, run, ctx); await wait(300);
      }
      $('fsBox').hidden = true; music.theme('base', 2.4); music.intensity(0); $(cc.el).classList.remove(cc.bonusClass); if (hooks.bonusMode) hooks.bonusMode(false); if (ambCtl && ambCtl.bonus) ambCtl.bonus(false); $('outroV').textContent = fmt(0);
      openM('outroM'); const skip = () => { skipBig = true; }; $('outroM').addEventListener('click', skip); sfx.outro(); embers(80, innerWidth / 2, innerHeight / 2, true);
      await countUp($('outroV'), j.payout, 1800 * T() + 400, 0, k => sfx.tick(k)); $('outroM').removeEventListener('click', skip);
      await tapWait('outroM', auto.left > 0 ? 1500 : 0);
    }
    $('win').textContent = fmt(j.payout); balance = j.user.balance; $('bal').textContent = fmt(balance); syncParent(j.user);
    out.payout = j.payout; say(j.payout > 0 ? tpl(cfg.text.win, { amt: fmt(j.payout) }) : cfg.text.lose, j.payout > 0);
    out.tier = await bigWin(R.totalPayout, j.payout);
  } catch (e) { say(e.message); out.err = true; }
  boost = false; setBusy(false); refreshUi(); return out;
}

/* ---------- autoplay ---------- */
async function runAuto() {
  while (auto.left > 0) {
    refreshUi(); const o = await go(null);
    if (o.err) break;
    auto.left--;
    if ((o.bonus && auto.stopFeat) || (o.tier && auto.stopBig && cfg.tiers.find(t => t.name === o.tier).lv >= cfg.autoBigLv)) break;
    if (BETS[bi] * mult() > balance + 1e-9) { say('Not enough balance — autoplay stopped.'); break; }
    await wait(450);
  }
  auto.left = 0; refreshUi();
}
const AUTO_N = [10, 25, 50, 100];
$('autoOpts').innerHTML = AUTO_N.map(n => `<button class="opt${n === 25 ? ' sel' : ''}" data-n="${n}">${n}</button>`).join('');
$('autoOpts').onclick = e => { const b = e.target.closest('.opt'); if (!b) return; auto.pickN = +b.dataset.n; [...$('autoOpts').children].forEach(x => x.classList.toggle('sel', x === b)); };
$('swFeat').onclick = () => { auto.stopFeat = !auto.stopFeat; $('swFeat').classList.toggle('on', auto.stopFeat); };
$('swBig').onclick = () => { auto.stopBig = !auto.stopBig; $('swBig').classList.toggle('on', auto.stopBig); };
$('bAuto').onclick = () => { if (auto.left > 0) { auto.left = 0; refreshUi(); return; } if (!busy) openM('autoM'); };
$('autoGo').onclick = () => { closeM('autoM'); auto.left = auto.pickN; runAuto(); };

/* ---------- bonus buy screen + confirmation ---------- */
let pendingBuy = null;
function askBuy(kind) {
  if (busy) return; const b = BUYS.find(x => x.key === kind), cost = BETS[bi] * b.mult; pendingBuy = kind;
  $('cTitle').textContent = b.confirmTitle; $('cDesc').textContent = b.confirmText; $('cCost').textContent = fmt(cost); $('cCost').style.fontSize = fmt(cost).length > 10 ? '38px' : '';
  const short = cost > balance + 1e-9; $('cWarn').textContent = short ? 'Not enough balance.' : ''; $('cYes').disabled = short;
  openM('confirm');
}
function closeBuy(ok) { if (ok) { sfx.hit(); ante = false; luck = false; refreshUi(); } const k = pendingBuy; pendingBuy = null; closeM('confirm'); if (ok && k) go(k); }
$('cYes').onclick = () => closeBuy(true);
$('cNo').onclick = () => closeBuy(false);
$('buyOpen').onclick = () => {
  if (busy) return;
  if (ante || luck) { const m = luck ? cfg.luck : cfg.fever; ante = false; luck = false; sfx.ui(); refreshUi(); say(m.offMsg); return; }   // tap the glowing sign again: mode off
  sfx.ui(); refreshUi(); openM('buyM');
};
$('bbM').onclick = () => { sfx.ui(); bi = Math.max(0, bi - 1); refreshUi(); };
$('bbP').onclick = () => { sfx.ui(); bi = Math.min(BETS.length - 1, bi + 1); refreshUi(); };

const mult = () => luck ? LUCK_COST : ante ? ANTE_COST : 1;
function refreshUi() {
  $('buyOpen').classList.toggle('lit', ante || luck); $('buyOpen').title = (ante || luck) ? 'Tap to switch the active mode off' : 'Bonus buy';
  const s = BETS[bi], risk = s * mult(); $('betV').style.fontSize = risk >= 10000 ? '22px' : risk >= 1000 ? '26px' : risk >= 100 ? '29px' : '';
  $('barR').classList.toggle('hot', ante || luck); $('betLbl').textContent = ante || luck ? 'TOTAL BET' : 'BET'; $('feverBadge').hidden = !(ante || luck); $('feverBadge').textContent = luck ? cfg.luck.badge : cfg.fever ? cfg.fever.badge : '';
  if (LUCK_COST) { $('luck').textContent = luck ? 'DEACTIVATE' : 'ACTIVATE'; $('luck').classList.toggle('or', !luck); $('luck').classList.toggle('off', luck); }
  const fitTxt = (el, txt, big, small) => { el.textContent = txt; el.style.fontSize = txt.length > 10 ? small : ''; }; $('bet').textContent = fmt(risk); $('bbBet').textContent = fmt(s);
  $('betBar').style.width = (bi / (BETS.length - 1) * 100) + '%';
  BUYS.forEach((b, i) => fitTxt($('p' + (i + 1)), fmt(s * b.mult), 34, '23px'));
  if (cfg.fever) { $('ante').textContent = ante ? 'DEACTIVATE' : 'ACTIVATE'; $('ante').classList.toggle('or', !ante); $('ante').classList.toggle('off', ante); }
  $('bAuto').classList.toggle('on', auto.left > 0);
  $('spinCnt').hidden = !(auto.left > 0); $('spinCnt').textContent = auto.left; $('spin').querySelector('svg').style.visibility = auto.left > 0 ? 'hidden' : '';
  $('bTurbo').classList.toggle('on', turbo); $('bTurbo').querySelector('i').textContent = turbo ? 'ON' : 'OFF'; $('turboBadge').hidden = !turbo;
  $('bSnd').classList.toggle('on', soundOn); $('bSnd').querySelector('i').textContent = soundOn ? 'ON' : 'OFF';
  $('bMus').classList.toggle('on', musicOn); $('bMus').querySelector('i').textContent = musicOn ? 'ON' : 'OFF'; $('vMus').value = Math.round(musVol * 100); $('vSnd').value = Math.round(sndVol * 100);
  document.body.style.setProperty('--spd', T());
}
function openBets() {
  if (busy) return; sfx.ui();
  $('betGrid').innerHTML = BETS.map((v, i) => `<button class="opt${i === bi ? ' sel' : ''}" data-i="${i}">${betLbl(v)}</button>`).join('');
  openM('betM');
}
$('betGrid').onclick = e => { const o = e.target.closest('.opt'); if (!o) return; sfx.ui(); bi = +o.dataset.i; refreshUi(); closeM('betM'); };
$('betV').onclick = openBets;
$('m').onclick = () => { sfx.ui(); bi = Math.max(0, bi - 1); refreshUi(); };
$('p').onclick = () => { sfx.ui(); bi = Math.min(BETS.length - 1, bi + 1); refreshUi(); };
$('spin').onclick = () => { if (busy && auto.left <= 0) { speedUp(); return; } if (auto.left > 0) { auto.left = 0; sfx.ui(); refreshUi(); say('Autoplay stopping after this spin'); return; } go(null); };
/* hamburger menu */
const closeMenu = () => { $('menu').hidden = true; };
$('menuBtn').onclick = e => { e.stopPropagation(); sfx.ui(); $('menu').hidden = !$('menu').hidden; };
document.addEventListener('click', e => { if (!e.target.closest('#menu') && !e.target.closest('#menuBtn')) closeMenu(); });
$('bTurbo').onclick = () => { sfx.ui(); turbo = !turbo; store.set(P + '_turbo', turbo); refreshUi(); };
$('bSnd').onclick = () => { soundOn = !soundOn; store.set(P + '_snd', soundOn); soundOn ? (amb.start(), sfx.ui()) : amb.stop(); refreshUi(); };
$('bMus').onclick = () => { musicOn = !musicOn; store.set(P + '_mus', musicOn); musicOn ? music.start() : music.stop(); sfx.ui(); refreshUi(); };
$('vMus').oninput = e => { musVol = e.target.value / 100; if (mus) mus.volume(musVol * MUS_GAIN); };
$('vMus').onchange = () => { store.set(P + '_musv', musVol); if (musicOn) music.start(); };
$('vSnd').oninput = e => { sndVol = e.target.value / 100; if (sfxG) sfxG.gain.value = sndVol; };
$('vSnd').onchange = () => { store.set(P + '_sndv', sndVol); sfx.ui(); };
if (LOCAL) { $('bFill').hidden = false; $('bFill').onclick = () => { sfx.hit(); wallet = _r2(wallet + 100000); try { localStorage.setItem(cfg.walletKey, wallet); } catch {} balance = wallet; $('bal').textContent = fmt(balance); closeMenu(); say('+$100,000 PLAY MONEY ADDED', true); }; }
$('bInfo').onclick = () => { closeMenu(); openM('infoM'); };
$('bFs').onclick = () => { closeMenu(); try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch {} };
addEventListener('keydown', e => {
  if (e.code === 'Escape') { for (const m of ['confirm', 'buyM', 'autoM', 'infoM']) if (!$(m).hidden) { m === 'confirm' ? closeBuy(false) : closeM(m); return; } closeMenu(); }
  if (document.getElementById('loadM')) return;
  if (document.querySelector('.modal:not([hidden])')) return;
  if (e.code === 'Space') { e.preventDefault(); if (!busy) go(null); else speedUp(); }
});

/* ---------- the API handed to the slot ---------- */
const S = {
  cfg, $, store, fmt, music, fx: FX, shards: FX.shards, betLbl, sleep, wait, T, tpl, sfx, say, shake, flash, embers, coins, char, countUp, pop, openM, closeM, tapWait, refreshUi, bigWin,
  scale: () => STAGE_S, bet: () => BETS[bi], isTurbo: () => turbo, isBusy: () => busy, local: !!LOCAL,
  skipCount: () => { skipBig = true; }
};
hooks = factory(S) || {}; shellApi.hooks = hooks; shellApi.S = S;
for (const k of ['sfx', 'init', 'paintIdle', 'roundStart', 'clearBoard', 'restoreBoard', 'playSpin', 'showTrigger'])
  if (typeof hooks[k] !== 'function') throw new Error('slot is missing hook: ' + k);
/* ---------- static UI generated from slot.json ---------- */
const sym = id => `<svg viewBox="0 0 64 64"><use href="#s${id}"/></svg>`;
document.title = cfg.title + (LOCAL ? ' (offline demo)' : '');
$('authName').textContent = cfg.logoText;
$('buyOpen').querySelector('svg').innerHTML = `<use href="#s${cfg.scatterSym}"/>`;
$('feverBadge').textContent = cfg.fever ? cfg.fever.badge : '';
const bigTier = cfg.tiers.find(t => t.lv === cfg.autoBigLv); $('swBigTxt').textContent = `Stop on a big win (${bigTier.min}x+)`;
$('bbRow').innerHTML =
  (cfg.fever ? `<div class="bbc"><div class="med">${sym(cfg.fever.sym)}</div><h3>${cfg.fever.name}</h3><p>${cfg.fever.text}</p><div class="vol" data-n="${cfg.fever.vol}"><span>VOLATILITY</span></div><div class="price" id="pa">${ANTE_COST}x BET</div><button class="go or" id="ante">ACTIVATE</button></div>` : '') +
  (LUCK_COST ? `<div class="bbc"><div class="med">${sym(cfg.luck.sym)}</div><h3>${cfg.luck.name}</h3><p>${cfg.luck.text}</p><div class="vol" data-n="${cfg.luck.vol}"><span>VOLATILITY</span></div><div class="price" id="pl">${LUCK_COST}x BET</div><button class="go or" id="luck">ACTIVATE</button></div>` : '') +
  BUYS.map((b, i) => `<div class="bbc"><div class="med">${sym(b.sym)}</div><h3>${b.name}</h3><p>${b.text}</p><div class="vol" data-n="${b.vol}"><span>VOLATILITY</span></div><div class="price" id="p${i + 1}">$${b.mult}.00</div><button class="go gd" id="buy${i + 1}">BUY</button></div>`).join('');
document.querySelectorAll('.vol').forEach(v => { for (let i = 1; i <= 5; i++) v.insertAdjacentHTML('beforeend', `<i class="${i <= +v.dataset.n ? 'on' : ''}"></i>`); });
BUYS.forEach((b, i) => { $('buy' + (i + 1)).onclick = () => { closeM('buyM'); askBuy(b.key); }; });
if (LUCK_COST) $('luck').onclick = () => { sfx.ui(); luck = !luck; if (luck) ante = false; refreshUi(); closeM('buyM'); if (luck) { say(cfg.luck.onMsg, true); sfx.feverOn(); } else say(cfg.luck.offMsg); };
if (cfg.fever) $('ante').onclick = () => { sfx.ui(); ante = !ante; if (ante) luck = false; refreshUi(); closeM('buyM'); if (ante) { say(cfg.fever.onMsg, true); sfx.feverOn(); } else say(cfg.fever.offMsg); };
$('introGems').innerHTML = [1, 2, 3].map(() => `<div class="g">${sym(cfg.scatterSym)}</div>`).join('');
$('introLbl').textContent = cfg.intro.unit; $('introRibbon').textContent = cfg.intro.ribbon;
$('introChips').innerHTML = cfg.intro.chips.map(c => `<span>${c}</span>`).join('');
$('outroRibbon').textContent = cfg.outro.ribbon;
/* optional extra copy (absent in EmberClaw): fs counter label, splash quote lines, tap hints, outro label, big-win taglines, splash art */
if (cfg.fsLabel || cfg.intro.unit) document.querySelector('#fsBox small').textContent = cfg.fsLabel || cfg.intro.unit;
const addQuote = (id, q) => { if (q) $(id).querySelector('.ribbon').insertAdjacentHTML('afterend', `<div class="quote">${q}</div>`); };
addQuote('introM', cfg.intro.quote); addQuote('outroM', cfg.outro.quote);
if (cfg.intro.tap) document.querySelector('#introM .tapHint').textContent = cfg.intro.tap;
if (cfg.outro.tap) document.querySelector('#outroM .tapHint').textContent = cfg.outro.tap;
if (cfg.outro.label) document.querySelector('#outroM .mtop').textContent = cfg.outro.label;
if (true) $('bigX').insertAdjacentHTML('afterend', '<div id="bigTag"></div>');
if (hooks.splashArt) for (const k of ['intro', 'outro']) $(k + 'M').querySelector('.sp').insertAdjacentHTML('afterbegin', `<div class="splashArt" id="${k}Art">${hooks.splashArt(k)}</div>`);

hooks.init(S);
hooks.paintIdle();
/* loading screen, then the 'what is in this game' screen (click to continue); data from slot.json 'loading' */
(function loadingScreen() {
  const el = $('loadM'), L = cfg.loading || {}; if (!el) return;
  if (navigator.webdriver && !/[?&]load=1/.test(location.search)) { el.remove(); return; }   // automated tests skip the screen (add ?load=1 to see it)
  const logo = document.getElementById('logo'); if (logo) { const c = logo.cloneNode(true); c.removeAttribute('id'); c.removeAttribute('filter'); c.style.cssText = ''; $('lmLogo').appendChild(c); } else $('lmLogo').innerHTML = `<div class="lmBig">${cfg.logoText || ''}</div>`;
  const cards = (L.features || []).map(f => ({ title: f.title, text: f.text, ico: f.sym != null ? sym(f.sym) : (f.svg || ''), big: f.big }));
  cards.push({ title: 'MAX WIN', text: L.maxText || `Win up to ${cfg.maxWin.toLocaleString('en-US')} times your bet.`, big: cfg.maxWin.toLocaleString('en-US') + 'x' });
  $('lmCards').innerHTML = cards.map(c => `<div class="lmCard"><div class="lmIco">${c.big ? `<div class="lmBig">${c.big}</div>` : c.ico}</div><h3>${c.title}</h3><p>${c.text}</p></div>`).join('');
  if (L.volatility) $('lmVol').innerHTML = 'VOLATILITY <b>' + [1, 2, 3, 4, 5].map(i => `<i class="${i <= L.volatility ? 'on' : ''}"></i>`).join('') + '</b>';
  else $('lmVol').remove();
  const t0 = performance.now(), MIN = 1900; let fill = 0;
  const tick = () => { fill = Math.min(95, (performance.now() - t0) / MIN * 100); $('lmFill').style.width = fill + '%'; if (!el.classList.contains('ready')) requestAnimationFrame(tick); };
  tick();
  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  Promise.all([fontsReady, new Promise(r => setTimeout(r, MIN))]).then(() => {
    $('lmFill').style.width = '100%'; $('lmTxt').textContent = 'READY';
    setTimeout(() => { el.classList.add('ready'); const go = e => { if (e.type === 'keydown' && !['Space', 'Enter'].includes(e.code)) return; e.preventDefault(); removeEventListener('keydown', go); el.classList.add('out'); setTimeout(() => el.remove(), 700); };
      el.addEventListener('pointerdown', go, { once: true }); addEventListener('keydown', go); }, 350);
  });
})();
refreshUi();
say(cfg.text.idle + (LOCAL ? ' (Play-money demo)' : ''));
if (LOCAL) { balance = wallet; $('bal').textContent = fmt(balance); }
else if (!TOKEN) $('auth').hidden = false;
else fetch(API + '/api/me', { headers: { authorization: 'Bearer ' + TOKEN } }).then(r => r.json())
  .then(j => { if (j.user) { balance = j.user.balance; $('bal').textContent = fmt(balance); } else $('auth').hidden = false; });
}
return shellApi;
})();
