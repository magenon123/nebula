/* SlotForge music engine: fully synthesised looping soundtracks (Web Audio only, no files).
 *
 *   const m = SlotMusic.make(ctx, out, defs, {volume})   // ctx: AudioContext or OfflineAudioContext, out: destination node
 *   m.start('base'); m.theme('bonus', 2); m.intensity(0..1); m.duck(.3, .6, 1.4); m.stinger('win'); m.volume(.7); m.stop();
 *   m.renderTo(seconds)       // offline: schedule everything up to `seconds` (used by tests with OfflineAudioContext)
 *
 * defs = { base: THEME, bonus: THEME, stingers: { name(K) } }
 * THEME = { tempo (bpm of the beat), barBeats, spb (steps per bar), swing (0..1 of a step, odd steps), bars (loop length), key (midi of tonic),
 *           scale [semitones], seed, gain, phrase (walk reset every N bars), layers {name:{int, enter, gain, wet}}, bar(M) }
 * bar(M) is called once per bar (lookahead scheduler on ctx.currentTime) and calls voices: M.pad('layer', t, dur, midiNotes, opts) ... see V below.
 * The loop is seamless: bar index wraps modulo `bars`; all variation is a seeded function of the bar index, notes ring across the wrap.
 * Layers fade in on the first pass (layer.enter = bar index) and with game intensity (layer.int = threshold 0..1). */
const SlotMusic = (() => {
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const mb32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const VOW = { a: [800, 1150, 2900], o: [450, 800, 2830], u: [325, 700, 2700], e: [400, 1600, 2700] };

function make(ctx, out, defs, opt = {}) {
  const sr = ctx.sampleRate, LOOK = opt.look || .7, TH = {}, nr = mb32(12345);
  const master = ctx.createGain(); master.gain.value = opt.volume == null ? .7 : opt.volume; master.connect(out);
  const duckG = ctx.createGain(); duckG.connect(master);
  const stingG = ctx.createGain(); stingG.connect(master);
  const nbuf = ctx.createBuffer(1, sr * 2, sr), nd = nbuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = nr() * 2 - 1;
  /* shared dark hall + a soft feedback delay for sonar pings */
  const rv = ctx.createConvolver(), rvLen = Math.floor(sr * 2.6), ib = ctx.createBuffer(2, rvLen, sr), rr = mb32(777);
  for (let c = 0; c < 2; c++) { const d = ib.getChannelData(c); let lp = 0; for (let i = 0; i < rvLen; i++) { lp += ((rr() * 2 - 1) * Math.pow(1 - i / rvLen, 2.4) - lp) * .32; d[i] = lp; } }
  rv.buffer = ib; const rvIn = ctx.createGain(), rvOut = ctx.createGain(); rvOut.gain.value = .9; rvIn.connect(rv); rv.connect(rvOut); rvOut.connect(duckG);
  const pingIn = ctx.createGain(), pdl = ctx.createDelay(2), pfb = ctx.createGain(), plp = ctx.createBiquadFilter(), pout = ctx.createGain();
  pdl.delayTime.value = .4; pfb.gain.value = .42; plp.type = 'lowpass'; plp.frequency.value = 2200; pout.gain.value = .6;
  pingIn.connect(pdl); pdl.connect(plp); plp.connect(pfb); pfb.connect(pdl); plp.connect(pout); pout.connect(duckG); pout.connect(rvIn);

  /* ---------- building blocks ---------- */
  const dec = (dest, t, pk, d, a = .004) => { const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, pk), t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); g.connect(dest); return g; };
  const sus = (dest, t, dur, a, pk, r) => { const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + a); g.gain.setValueAtTime(pk, t + Math.max(a, dur)); g.gain.linearRampToValueAtTime(0, t + Math.max(a, dur) + r); g.connect(dest); return g; };
  const osc = (type, f, t, end, det) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; if (det) o.detune.value = det; o.start(t); o.stop(end); return o; };
  const sw = (type, f, f2, t, d, end) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); o.start(t); o.stop(end); return o; };
  const nz = (dest, t, d, pk, type, f1, f2, q = 1, a = .003) => { const s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f1, t); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + d); f.Q.value = q; s.connect(f); f.connect(dec(dest, t, pk, d, a)); s.start(t, rr() * 1.5); s.stop(t + a + d + .05); };

  /* ---------- voices: V.name(dest, t, ...) ---------- */
  const V = {
    /* detuned-saw pad through a gentle lowpass (brass-like when cut is low); notes = midi[] */
    pad(dest, t, dur, notes, o = {}) {
      const k = Object.assign({ wave: 'sawtooth', det: 9, cut: 800, cut2: 0, q: .6, a: .9, r: 1.3, g: .05 }, o), end = t + Math.max(k.a, dur) + k.r + .05;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = k.q; f.frequency.setValueAtTime(k.cut, t); if (k.cut2) f.frequency.linearRampToValueAtTime(k.cut2, t + dur);
      f.connect(sus(dest, t, dur, k.a, k.g / Math.sqrt(notes.length * 2), k.r));
      notes.forEach(m => [-k.det, k.det].forEach(d => { const os = ctx.createOscillator(); os.type = k.wave; os.frequency.value = mtof(m); os.detune.value = d; os.connect(f); os.start(t); os.stop(end); }));
    },
    /* choir-like formant pad: saws through three bandpass formants, slow vibrato; vow/vow2 = vowel glide */
    choir(dest, t, dur, notes, o = {}) {
      const k = Object.assign({ vow: 'a', vow2: '', g: .07, a: .8, r: 1.1, vib: 5.2, vd: 9, det: 8 }, o), end = t + Math.max(k.a, dur) + k.r + .05, s = ctx.createGain(), mix = sus(dest, t, dur, k.a, k.g, k.r);
      const vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(k.vd, t + 1); const vl = ctx.createOscillator(); vl.frequency.value = k.vib; vl.connect(vg); vl.start(t); vl.stop(end);
      s.gain.value = 1 / Math.sqrt(notes.length * 2);
      notes.forEach(m => [-k.det, k.det].forEach(d => { const os = ctx.createOscillator(); os.type = 'sawtooth'; os.frequency.value = mtof(m); os.detune.value = d; vg.connect(os.detune); os.connect(s); os.start(t); os.stop(end); }));
      [1, .6, .3].forEach((gn, j) => { const bp = ctx.createBiquadFilter(), bg = ctx.createGain(); bp.type = 'bandpass'; bp.Q.value = 5; bp.frequency.setValueAtTime(VOW[k.vow][j], t); if (k.vow2) bp.frequency.linearRampToValueAtTime(VOW[k.vow2][j], t + dur); bg.gain.value = gn * 3.2; s.connect(bp); bp.connect(bg); bg.connect(mix); });
    },
    /* accordion-like reed: square + two slightly detuned saws, lowpass + reed formant, delayed vibrato, slow attack */
    reed(dest, t, dur, m, o = {}) {
      const k = Object.assign({ g: .05, a: .07, r: .14, vib: 5.3, vd: 7, cut: 2800 }, o), f0 = mtof(m), end = t + Math.max(k.a, dur) + k.r + .05;
      const lp = ctx.createBiquadFilter(), pk = ctx.createBiquadFilter(), mix = ctx.createGain(), vg = ctx.createGain();
      lp.type = 'lowpass'; lp.frequency.value = k.cut; lp.Q.value = .5; pk.type = 'peaking'; pk.frequency.value = Math.min(2200, Math.max(900, f0 * 3)); pk.Q.value = 1; pk.gain.value = 5;
      vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(k.vd, t + Math.min(.5, dur * .6)); const vl = ctx.createOscillator(); vl.frequency.value = k.vib; vl.connect(vg); vl.start(t); vl.stop(end);
      [['square', 0, .3], ['sawtooth', 5, .4], ['sawtooth', -5, .4]].forEach(([ty, d, gn]) => { const os = ctx.createOscillator(), g = ctx.createGain(); os.type = ty; os.frequency.value = f0; os.detune.value = d; g.gain.value = gn; vg.connect(os.detune); os.connect(g); g.connect(mix); os.start(t); os.stop(end); });
      mix.connect(lp); lp.connect(pk); pk.connect(sus(dest, t, dur, k.a, k.g, k.r));
    },
    /* plucked string: kind 'banjo' (bright saw, fast decay) | 'uke' (soft triangle + octave) | 'bell' */
    pluck(dest, t, m, o = {}) {
      const k = Object.assign({ kind: 'banjo', g: .07, d: .3 }, o), f = mtof(m), end = t + k.d + .1, lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.Q.value = .5; lp.frequency.setValueAtTime(k.kind === 'banjo' ? 3600 : 2200, t); lp.frequency.exponentialRampToValueAtTime(k.kind === 'banjo' ? 800 : 700, t + k.d * .6);
      lp.connect(dec(dest, t, k.g, k.d, .003));
      const a = osc(k.kind === 'banjo' ? 'sawtooth' : 'triangle', f, t, end); a.connect(lp);
      if (k.kind === 'uke') { const b = osc('sine', f * 2, t, end), bg = ctx.createGain(); bg.gain.value = .3; b.connect(bg); bg.connect(lp); }
      if (k.kind === 'banjo') nz(dest, t, .02, k.g * .5, 'highpass', 3500, 0, .7, .001);
    },
    strum(dest, t, notes, o = {}) { notes.forEach((m, i) => V.pluck(dest, t + i * (o.sp || .012), m, o)); },
    /* upright bass pluck */
    upright(dest, t, m, o = {}) {
      const k = Object.assign({ g: .16, d: .42 }, o), f = mtof(m), end = t + k.d + .1, lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = .6;
      lp.frequency.setValueAtTime(620, t); lp.frequency.exponentialRampToValueAtTime(240, t + k.d); lp.connect(dec(dest, t, k.g, k.d, .008));
      osc('triangle', f * 1.012, t, end).connect(lp); const b = osc('sine', f, t, end), bg = ctx.createGain(); bg.gain.value = .7; b.connect(bg); bg.connect(lp); nz(dest, t, .03, k.g * .25, 'lowpass', 900, 0, .6, .002);
    },
    sub(dest, t, dur, m, o = {}) { const k = Object.assign({ g: .2, a: .03, r: .25 }, o), e = sus(dest, t, dur, k.a, k.g, k.r), end = t + dur + k.r + .05; osc('sine', mtof(m), t, end).connect(e); const b = osc('triangle', mtof(m), t, end), bg = ctx.createGain(); bg.gain.value = .25; b.connect(bg); bg.connect(e); },
    kick(dest, t, v = 1, o = {}) { const k = Object.assign({ f0: 120, f1: 46, d: .3, g: .35 }, o); sw('sine', k.f0, k.f1, t, .12, t + k.d + .1).connect(dec(dest, t, k.g * v, k.d, .002)); nz(dest, t, .03, k.g * .25 * v, 'lowpass', 500, 0, .7, .001); },
    taiko(dest, t, v = 1, o = {}) {
      const k = Object.assign({ f0: 112, f1: 54, d: .75, g: .4 }, o);
      sw('sine', k.f0, k.f1, t, .3, t + k.d + .1).connect(dec(dest, t, k.g * v, k.d, .003)); sw('sine', k.f0 * 1.5, k.f1 * 1.5, t, .2, t + .5).connect(dec(dest, t, k.g * .35 * v, .3, .003));
      nz(dest, t, .1, k.g * .5 * v, 'bandpass', 220, 120, 1.1, .002); nz(dest, t, .03, k.g * .22 * v, 'bandpass', 1500, 0, 1, .001);
    },
    metal(dest, t, f, d = 1, pk = .1, R = [1, 2.756, 5.404, 8.933]) { R.forEach((r, i) => osc('sine', f * r, t, t + d + .1).connect(dec(dest, t, pk / (1 + i * 1.1), d / (1 + i * .7), .002))); nz(dest, t, .05, pk * .5, 'bandpass', 3000, 1800, 1.2, .001); },
    hat(dest, t, v = 1, o = {}) { nz(dest, t, o.d || .04, (o.g || .05) * v, 'highpass', o.f || 6500, 0, .6, .002); },
    shaker(dest, t, v = 1) { nz(dest, t, .06, .05 * v, 'bandpass', 5200, 0, .8, .014); },
    crackle(dest, t, v = 1) { nz(dest, t, .012 + rr() * .02, (.025 + rr() * .03) * v, 'bandpass', 3000 + rr() * 3500, 0, 3, .001); },
    stomp(dest, t, v = 1) { sw('sine', 95, 52, t, .09, t + .25).connect(dec(dest, t, .3 * v, .16, .002)); nz(dest, t, .07, .12 * v, 'lowpass', 1000, 300, .7, .001); },
    sonar(dest, t, m, v = 1, d = 1.5) { const g = dec(dest, t, .1 * v, d, .01); g.connect(pingIn); osc('sine', mtof(m), t, t + d + .1).connect(g); },
    bubble(dest, t, m, v = 1) { const f = mtof(m); sw('sine', f, f * 1.6, t, .07, t + .15).connect(dec(dest, t, .028 * v, .07, .004)); },
    heartbeat(dest, t, v = 1) { [0, .24].forEach((dt, i) => sw('sine', 62, 38, t + dt, .14, t + dt + .4).connect(dec(dest, t + dt, (i ? .16 : .24) * v, .22, .006))); },
    /* whale call: sine glide (m0 -> m1 -> m2) with slow vibrato, lowpassed */
    whale(dest, t, dur, m0, m1, m2, o = {}) {
      const k = Object.assign({ g: .05 }, o), end = t + dur + .3, lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(sus(dest, t, dur * .7, dur * .3, k.g, dur * .3));
      [[1, 1], [2, .25]].forEach(([mul, gn]) => { const os = ctx.createOscillator(), g = ctx.createGain(); os.frequency.setValueAtTime(mtof(m0) * mul, t); os.frequency.linearRampToValueAtTime(mtof(m1) * mul, t + dur * .5); os.frequency.linearRampToValueAtTime(mtof(m2) * mul, t + dur); g.gain.value = gn; os.connect(g); g.connect(lp); os.start(t); os.stop(end);
        if (mul === 1) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 3.2; lg.gain.value = mtof(m0) * .012; l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(end); } });
    },
    /* lowbrass slide with a lazy wah (grumpy tuba/trombone) */
    slide(dest, t, dur, m0, m1, o = {}) {
      const k = Object.assign({ g: .08 }, o), end = t + dur + .3, lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1; lp.frequency.setValueAtTime(300, t); lp.frequency.linearRampToValueAtTime(900, t + dur * .5); lp.frequency.linearRampToValueAtTime(380, t + dur);
      lp.connect(sus(dest, t, dur, .06, k.g, .2)); [-6, 6].forEach(d => { const os = ctx.createOscillator(); os.type = 'sawtooth'; os.detune.value = d; os.frequency.setValueAtTime(mtof(m0), t); os.frequency.setValueAtTime(mtof(m0), t + dur * .25); os.frequency.exponentialRampToValueAtTime(mtof(m1), t + dur * .9); os.connect(lp); os.start(t); os.stop(end); });
    },
    riser(dest, t, dur, o = {}) { const k = Object.assign({ g: .06, f1: 300, f2: 3800 }, o), s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), e = ctx.createGain(); s.buffer = nbuf; s.loop = true; f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(k.f1, t); f.frequency.exponentialRampToValueAtTime(k.f2, t + dur);
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(k.g, t + dur * .95); e.gain.linearRampToValueAtTime(0, t + dur); s.connect(f); f.connect(e); e.connect(dest); s.start(t, rr()); s.stop(t + dur + .05); },
    horn(dest, t, dur, notes, o = {}) { V.pad(dest, t, dur, notes, Object.assign({ cut: 380, cut2: 1100, q: 1, a: dur * .4, r: dur * .5, g: .07, det: 7 }, o)); }
  };

  /* ---------- themes ---------- */
  let intensityT = 0, cur = null, timer = 0, started = false;
  function mk(name, def) {
    const th = { name, def, bars: def.bars, barSec: def.barBeats * 60 / def.tempo, sd: def.barBeats * 60 / def.tempo / def.spb, gain: ctx.createGain(), L: {}, ls: {}, next: 0, bar: 0, pass: 0, active: false, walk: [] };
    th.gain.gain.value = 0; th.gain.connect(duckG);
    const rg = mb32(def.seed || 1); let w = 0; for (let i = 0; i < def.bars; i++) { if (i % (def.phrase || 4) === 0) w = 0; else { const r = rg(); w += r < .3 ? -1 : r > .7 ? 1 : 0; w = Math.max(-2, Math.min(2, w)); } th.walk.push(w); }
    return th;
  }
  const layerNode = (th, name) => {
    if (th.L[name]) return th.L[name];
    const L = (th.def.layers || {})[name] || {}, g = ctx.createGain(), s = ctx.createGain(); g.gain.value = (th.def.layers || {})[name] ? 0 : 1; s.gain.value = L.wet == null ? .22 : L.wet; g.connect(th.gain); g.connect(s); s.connect(rvIn); th.L[name] = g; th.ls[name] = false; return g;
  };
  function barOn(th, name, M) {
    const L = (th.def.layers || {})[name]; if (!L) return true;
    const want = (th.pass > 0 || M.i >= (L.enter || 0)) && intensityT >= (L.int || 0), g = layerNode(th, name), lv = L.gain == null ? 1 : L.gain;
    if (want && !th.ls[name]) { g.gain.cancelScheduledValues(M.t0); g.gain.setValueAtTime(0, M.t0); g.gain.linearRampToValueAtTime(lv, M.t0 + Math.min(1.2, th.barSec * .8)); th.ls[name] = true; }
    else if (!want && th.ls[name]) { g.gain.cancelScheduledValues(M.t0); g.gain.setValueAtTime(g.gain.value || lv, M.t0); g.gain.linearRampToValueAtTime(0, M.t0 + th.barSec); th.ls[name] = false; }
    return want;
  }
  function schedBar(th) {
    const d = th.def, i = th.bar, t0 = th.next, rnd = mb32((d.seed || 1) * 7919 + i * 104729 + 13);
    const M = { i, pass: th.pass, t0, bd: th.barSec, sd: th.sd, spb: d.spb, rnd, walk: th.walk[i], int: intensityT, key: d.key, scale: d.scale, mtof, bars: th.bars,
      st: s => t0 + s * th.sd + (s % 2 ? (d.swing || 0) * th.sd : 0),
      note: (deg, oct = 0) => { const n = d.scale.length; return d.key + 12 * Math.floor(deg / n) + d.scale[((deg % n) + n) % n] + 12 * oct; },
      on: name => barOn(th, name, M), pick: a => a[Math.floor(rnd() * a.length)] };
    Object.keys(V).forEach(v => { M[v] = (layer, ...a) => { if (barOn(th, layer, M)) V[v](layerNode(th, layer), ...a); }; });
    d.bar(M);
    th.next += th.barSec; if (++th.bar >= th.bars) { th.bar = 0; th.pass++; }
  }
  const tick = () => { if (!cur) return; const lim = ctx.currentTime + LOOK; let n = 0; while (cur.next < lim && n++ < 4) schedBar(cur); };

  const API = {
    V, ctx, master, get current() { return cur && cur.name; },
    start(name = 'base', fade = .4) {
      if (!defs[name]) return; if (!started) { started = true; if (!opt.offline) timer = setInterval(tick, 80); }
      if (cur && cur.name === name && cur.active) return; this.theme(name, fade, true);
    },
    stop(fade = .4) { if (cur) { cur.gain.gain.cancelScheduledValues(ctx.currentTime); cur.gain.gain.setTargetAtTime(0, ctx.currentTime, fade / 3); cur.active = false; } clearInterval(timer); timer = 0; started = false; cur = null; },
    theme(name, xf = 2, fresh) {
      if (!defs[name]) return; if (cur && cur.name === name && cur.active) return; const now = ctx.currentTime;
      if (cur) { cur.active = false; cur.gain.gain.cancelScheduledValues(now); cur.gain.gain.setTargetAtTime(0, now, xf / 3.5); const old = cur; setTimeout(() => { if (!old.active) Object.keys(old.L).forEach(k => old.L[k].gain.value = 0); }, (xf + 4) * 1000); }
      const th = TH[name] = mk(name, defs[name]); th.next = now + .08; th.active = true; th.gain.gain.setValueAtTime(0, now); th.gain.gain.setTargetAtTime(defs[name].gain == null ? 1 : defs[name].gain, now, Math.max(.05, xf / 3.5)); cur = th;
      if (!started) { started = true; if (!opt.offline) timer = setInterval(tick, 80); } tick();
    },
    intensity(x) { intensityT = Math.max(0, Math.min(1, x)); },
    volume(v) { master.gain.setTargetAtTime(v, ctx.currentTime, .05); },
    duck(depth = .3, hold = .5, rel = 1.4) { const t = ctx.currentTime; duckG.gain.cancelScheduledValues(t); duckG.gain.setTargetAtTime(depth, t, .04); duckG.gain.setTargetAtTime(1, t + hold, rel / 3); },
    stinger(name, at) {
      const f = defs.stingers && defs.stingers[name]; if (!f) return; const t = at == null ? ctx.currentTime + .02 : at, d = (cur && cur.def) || defs.base || defs[Object.keys(defs)[0]];
      f({ V, dest: stingG, t, key: d.key, scale: d.scale, mtof, note: (deg, oct = 0) => { const n = d.scale.length; return d.key + 12 * Math.floor(deg / n) + d.scale[((deg % n) + n) % n] + 12 * oct; } });
    },
    renderTo(sec) { if (!cur) return; while (cur.next < sec) schedBar(cur); }
  };
  return API;
}
return { make, mtof };
})();
