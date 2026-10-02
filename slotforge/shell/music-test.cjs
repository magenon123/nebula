#!/usr/bin/env node
/* Offline render + analysis of a slot's music themes: node slotforge/shell/music-test.cjs <standalone.html> [secs=60] [--wav DIR]
 * Renders each theme (base / bonus) with an OfflineAudioContext at intensity 1 (all layers) and 0, then reports peak, RMS, loop-point
 * continuity (level + sample jump at the wrap vs. normal), dominant pitches (averaged FFT) and the share of spectral energy that stays in the key. */
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const file = path.resolve(process.argv[2] || '/home/user/nebula/emberclaw-standalone.html'), secs = +(process.argv[3] || 60);
const wavDir = process.argv.includes('--wav') ? process.argv[process.argv.indexOf('--wav') + 1] : null;
const ANALYSE = `async ({ theme, secs, inten }) => {
  const sr = 44100, defs = SlotShell.hooks.music(), d = defs[theme], loop = d.bars * d.barBeats * 60 / d.tempo;
  const oc = new OfflineAudioContext(2, Math.ceil(sr * secs), sr), m = SlotMusic.make(oc, oc.destination, defs, { offline: true, volume: 1 });
  m.intensity(inten); m.start(theme); m.renderTo(secs); const buf = await oc.startRendering();
  const L = buf.getChannelData(0), R = buf.getChannelData(1), N = L.length, x = new Float32Array(N); for (let i = 0; i < N; i++) x[i] = (L[i] + R[i]) / 2;
  let pk = 0, ss = 0, pkAt = 0; for (let i = 0; i < N; i++) { const a = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (a > pk) { pk = a; pkAt = i; } ss += x[i] * x[i]; }
  const rms = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); };
  const w = Math.floor(sr * .1), Ls = Math.floor(loop * sr), out = { theme, inten, peakAtSec: +(pkAt / sr).toFixed(3), loopSec: +loop.toFixed(2), peak: pk, peakDb: 20 * Math.log10(pk), rms: Math.sqrt(ss / N), rmsDb: 20 * Math.log10(Math.sqrt(ss / N)) };
  out.rmsFirst100 = rms(Math.floor(sr * .3), Math.floor(sr * .3) + w); out.rmsLast100 = rms(Ls - w, Ls); out.rmsAfterWrap100 = rms(Ls, Ls + w);
  /* largest sample-to-sample jump within +-30 ms of the wrap vs the largest elsewhere (a click would be much larger) */
  const jump = (a, b) => { let j = 0; for (let i = a + 1; i < b; i++) j = Math.max(j, Math.abs(x[i] - x[i - 1])); return j; };
  out.jumpAtWrap = jump(Ls - Math.floor(sr * .03), Ls + Math.floor(sr * .03)); out.jumpTypical = jump(Math.floor(sr * 5), Math.floor(sr * 5) + Math.floor(sr * .06)); out.jumpMax = jump(Math.floor(sr * 3), N);
  /* FFT */
  const NF = 32768, hann = new Float32Array(NF); for (let i = 0; i < NF; i++) hann[i] = .5 - .5 * Math.cos(2 * Math.PI * i / (NF - 1));
  const fft = (re, im) => { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } };
  const P = new Float64Array(NF / 2); let nw = 0;
  for (let s = Math.floor(sr * 2); s + NF < N; s += NF) { const re = new Float64Array(NF), im = new Float64Array(NF); for (let i = 0; i < NF; i++) re[i] = x[s + i] * hann[i]; fft(re, im); for (let k = 0; k < NF / 2; k++) P[k] += re[k] * re[k] + im[k] * im[k]; nw++; }
  const bin = sr / NF, midiOf = f => 69 + 12 * Math.log2(f / 440), NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const inKey = new Set(d.scale.map(s => (d.key + s) % 12));
  let eIn = 0, eAll = 0; const pcE = new Array(12).fill(0);
  for (let k = Math.floor(60 / bin); k < Math.floor(1600 / bin); k++) { const mi = midiOf(k * bin), pc = ((Math.round(mi) % 12) + 12) % 12; eAll += P[k]; pcE[pc] += P[k]; if (inKey.has(pc)) eIn += P[k]; }
  out.inKeyEnergyPct = +(100 * eIn / eAll).toFixed(1); out.pcShare = pcE.map((e, i) => NAMES[i] + ':' + (100 * e / eAll).toFixed(1)).join(' ');
  const peaks = []; for (let k = Math.floor(55 / bin) + 2; k < Math.floor(2000 / bin) - 2; k++) if (P[k] > P[k - 1] && P[k] >= P[k + 1] && P[k] > P[k - 2] && P[k] > P[k + 2]) peaks.push([P[k], k * bin]);
  peaks.sort((a, b) => b[0] - a[0]); const top = []; for (const [p, f] of peaks) { if (top.every(t => Math.abs(t.f - f) > 12)) { const mi = midiOf(f), r = Math.round(mi); top.push({ f: +f.toFixed(1), note: NAMES[((r % 12) + 12) % 12] + Math.floor(r / 12 - 1), cents: Math.round((mi - r) * 100), key: inKey.has(((r % 12) + 12) % 12), rel: +(10 * Math.log10(p / peaks[0][0])).toFixed(1) }); } if (top.length >= 10) break; }
  out.topPitches = top.map(t => t.note + (t.key ? '' : '(OUT)') + ' ' + t.f + 'Hz ' + (t.cents >= 0 ? '+' : '') + t.cents + 'c ' + t.rel + 'dB');
  /* high-frequency harshness: share of energy above 4 kHz */
  let hi = 0, tot = 0; for (let k = 1; k < NF / 2; k++) { tot += P[k]; if (k * bin > 4000) hi += P[k]; } out.above4kPct = +(100 * hi / tot).toFixed(2);
  out.wav = Array.from(x.subarray(0, 0)); return out; }`;
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1600, height: 900 } })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load|ERR_/.test(m.text())) errs.push(m.text()); });
  await page.goto('file://' + file); await page.waitForFunction('SlotShell.hooks', null, { timeout: 60000 });
  for (const theme of ['base', 'bonus']) for (const inten of (process.argv.includes('--int0') ? [1, 0] : [1])) {
    const t0 = Date.now(), res = await page.evaluate('(' + ANALYSE + ')(' + JSON.stringify({ theme, secs, inten }) + ')').catch(e => ({ error: String(e) }));
    delete res.wav; console.log(`\n=== ${path.basename(file)} ${theme} intensity ${inten}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`); console.log(JSON.stringify(res, null, 1));
  }
  console.log('errors:', errs.length ? errs : 'none'); await browser.close();
})();
