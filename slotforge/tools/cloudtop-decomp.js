#!/usr/bin/env node
/* Cloudtop Tea House decomposition sim (per-bonus stats the generic sim.js does not report).
 *   node tools/cloudtop-decomp.js <base|buy:tin|buy:fs|buy:super> <rounds/seed> [seeds=1,2,3,4] [--cfg '{"payScale":0.8}']
 * One worker per seed. Prints RTP +- 95% CI, trigger rates, per-bonus E / median / tails / retrigger share / spins / level mix. */
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import * as T from '../engines/cloudtop-tea-house.js';
/* same sfc32 as tools/sim.js (copied: importing sim.js inside a worker would run its own worker branch) */
function sfc32(seed) {
  let s = seed >>> 0; const sm = () => { s = s + 0x9E3779B9 | 0; let t = s ^ s >>> 16; t = Math.imul(t, 0x21f0aaad); t ^= t >>> 15; t = Math.imul(t, 0x735a2d97); return (t ^ t >>> 15) >>> 0; };
  let a = sm(), b = sm(), c = sm(), d = sm();
  return () => { a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; let t = (a + b | 0) + d | 0; d = d + 1 | 0; a = b ^ b >>> 9; b = c + (c << 3) | 0; c = (c << 21 | c >>> 11); c = c + t | 0; return (t >>> 0) / 4294967296; };
}

function run({ mode, rounds, seed, cfg }) {
  if (cfg) for (const [k, v] of Object.entries(cfg)) T.CFG[k] = (v && typeof v === 'object' && !Array.isArray(v)) ? { ...T.CFG[k], ...v } : v;
  const rng = sfc32(seed), buy = mode.startsWith('buy:') ? mode.slice(4) : null, cost = buy ? T.CFG.buy[buy].cost : 1;
  const S = { rounds, cost: rounds * cost, ret: 0, sq: 0, lines: 0, hits: 0, max: 0, cap: 0, ge1000: 0, suppressed: 0, tease2: 0, fs3: 0, fs4: 0, fs5: 0, tin: 0, perType: {} };
  const hist = {};
  for (let i = 0; i < rounds; i++) {
    const r = T.playRound(rng, buy ? { buy } : {});
    S.ret += r.totalPayout; S.sq += r.totalPayout ** 2; S.lines += r.basePayout || 0; if (r.basePayout > 0) S.hits++;
    if (r.totalPayout > S.max) S.max = r.totalPayout; if (r.capped) S.cap++; if (r.totalPayout >= 1000) S.ge1000++;
    const f = r.fsScatter; if (f) { S.suppressed += f.suppressed ? 1 : 0; if (f.count === 2) S.tease2++; if (f.count === 3) S.fs3++; if (f.count === 4) S.fs4++; if (f.count >= 5) S.fs5++; }
    if (!r.bonusTriggered) continue;
    const t = r.bonusType, p = S.perType[t] || (S.perType[t] = { n: 0, sum: 0, sq: 0, lt1: 0, lt5: 0, ge100: 0, ge1000: 0, cap: 0, max: 0, spins: 0, retrig: 0, extra: 0, lvl: [0, 0, 0, 0, 0], boostSum: 0, winLines: 0, vals: [] });
    const b = r.bonus.totalPayout; p.n++; p.sum += b; p.sq += b * b; if (b < 1) p.lt1++; if (b < 5) p.lt5++; if (b >= 100) p.ge100++; if (b >= 1000) p.ge1000++; if (r.capped) p.cap++; if (b > p.max) p.max = b;
    const k = Math.min(b, 999.9) < 1000 ? Math.floor(Math.min(b, 999) * 4) : 3999; hist[t] = hist[t] || {}; hist[t][k] = (hist[t][k] || 0) + 1;
    if (t !== 'tin') {
      p.spins += r.bonus.spins.length; if (r.bonus.extraSpinsTotal > 0) p.retrig++; p.extra += r.bonus.extraSpinsTotal;
      const last = r.bonus.spins[r.bonus.spins.length - 1];
      const lv = last.levels.map(x => x.slice()); for (const u of last.levelUps) lv[u.r][u.c] = u.to;
      for (const row of lv) for (const v of row) p.lvl[v]++;
      for (const s of r.bonus.spins) for (const w of s.wins) { p.boostSum += w.boost; p.winLines++; }
    }
  }
  S.hist = hist; return S;
}
if (!isMainThread) parentPort.postMessage(run(workerData));
else if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2); let cfg = null; const ci = a.indexOf('--cfg'); if (ci >= 0) { cfg = JSON.parse(a[ci + 1]); a.splice(ci, 2); }
  const mode = a[0], rounds = Number(a[1]), seeds = (a[2] || '1,2,3,4').split(',').map(Number);
  Promise.all(seeds.map(seed => new Promise((res, rej) => { const w = new Worker(fileURLToPath(import.meta.url), { workerData: { mode, rounds, seed, cfg } }); w.once('message', res); w.once('error', rej); }))).then(rows => {
    const N = rows.reduce((x, r) => x + r.rounds, 0), cost = rows.reduce((x, r) => x + r.cost, 0), cp = cost / N;
    const ret = rows.reduce((x, r) => x + r.ret, 0), sq = rows.reduce((x, r) => x + r.sq, 0), mean = ret / N;
    const rtps = rows.map(r => r.ret / r.cost * 100), m = rtps.reduce((x, y) => x + y, 0) / rtps.length;
    const seC = Math.sqrt((sq / N - mean * mean) / N) / cp * 100, sdS = Math.sqrt(rtps.reduce((x, y) => x + (y - m) ** 2, 0) / (rtps.length - 1)), seS = sdS / Math.sqrt(rtps.length);
    const half = 1.96 * Math.max(seC, seS), sm = k => rows.reduce((x, r) => x + r[k], 0), f = (x, d = 2) => x.toFixed(d);
    console.log(`== ${mode} cost ${cp}x, ${N.toLocaleString()} rounds, seeds ${seeds} ==`);
    console.log(`RTP ${f(ret / cost * 100)}% +- ${f(half)} (CI; round SE ${f(seC)}, seed SE ${f(seS)}) per seed ${rtps.map(x => f(x)).join(' / ')}`);
    console.log(`lines ${f(sm('lines') / cost * 100)}% of bet | hit ${f(sm('hits') / N * 100)}% | max ${f(Math.max(...rows.map(r => r.max)), 1)}x | cap hits ${sm('cap')} | P(total>=1000) 1 in ${f(N / Math.max(1, sm('ge1000')), 0)} (${sm('ge1000')})`);
    if (mode === 'base') console.log(`P(3FS) 1 in ${f(N / sm('fs3'), 0)} | P(4FS) 1 in ${f(N / sm('fs4'), 0)} | P(5+FS) 1 in ${f(N / Math.max(1, sm('fs5')), 0)} | 2FS tease 1 in ${f(N / sm('tease2'), 0)} | tin+FS suppressed ${sm('suppressed')} (per 100M: ${f(sm('suppressed') / N * 1e8, 0)})`);
    for (const t of ['tin', 'fs', 'super']) {
      const P = rows.map(r => r.perType[t]).filter(Boolean); if (!P.length) continue;
      const n = P.reduce((x, p) => x + p.n, 0), s = P.reduce((x, p) => x + p.sum, 0), q = P.reduce((x, p) => x + p.sq, 0), g = k => P.reduce((x, p) => x + p[k], 0);
      const h = {}; for (const r of rows) for (const [k, v] of Object.entries(r.hist[t] || {})) h[k] = (h[k] || 0) + v;
      let c = 0, med = 0; for (const k of Object.keys(h).map(Number).sort((x, y) => x - y)) { c += h[k]; if (c >= n / 2) { med = k / 4; break; } }
      let line = `[${t}] n ${n} | trigger 1 in ${f(N / n, 0)} | E ${f(s / n, 2)}x (sd ${f(Math.sqrt(q / n - (s / n) ** 2), 1)}) | share of bet RTP ${f(s / cost * 100)}% | median ~${med}x | P(<1x) ${f(g('lt1') / n * 100, 1)}% P(<5x) ${f(g('lt5') / n * 100, 1)}% P(>=100x) ${f(g('ge100') / n * 100, 2)}% P(>=1000x) ${f(g('ge1000') / n * 100, 4)}% | cap ${g('cap')} | max ${f(Math.max(...P.map(p => p.max)), 1)}x`;
      console.log(line);
      if (t !== 'tin') {
        const lv = [0, 1, 2, 3, 4].map(i => P.reduce((x, p) => x + p.lvl[i], 0)), lt = lv.reduce((x, y) => x + y, 0);
        console.log(`   avg spins played ${f(g('spins') / n)} | retriggered ${f(g('retrig') / n * 100, 1)}% (avg extra ${f(g('extra') / n)}) | final level mix ${lv.map((v, i) => 'L' + i + ' ' + f(v / lt * 100, 1) + '%').join(' ')} | avg boost per winning line ${f(g('boostSum') / g('winLines'))}`);
      }
    }
  });
}
