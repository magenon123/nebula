#!/usr/bin/env node
/* SlotForge seeded multi-seed simulator.
 *   node tools/sim.js <slot> [mode=base] [rounds=500000] [seeds=1,2,3,4] [--cfg '{"payScale":1.06}'] [--json]
 * mode: base | ante | buy (first buy) | buy:<key> | <buy key> | all (every mode the engine has) | comma list.
 * rounds = rounds PER SEED. One worker thread per (mode, seed) job. Same seed -> same numbers. */
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { getEngine, listEngines, listModes, modeOpts, modeCost } from '../engines/index.js';

export function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* Pure function: run `rounds` rounds of one mode with one seed. Used by workers, tests and the CLI. */
export function runSeed(engine, mode, rounds, seed) {
  const opts = modeOpts(engine, mode), costPer = modeCost(engine, mode), rng = mulberry(seed);
  const bought = !!opts.buy;
  let ret = 0, sq = 0, baseRet = 0, hits = 0, trig = 0, bonusSum = 0, bonusN = 0, max = 0, capped = 0;
  for (let i = 0; i < rounds; i++) {
    const r = engine.playRound(rng, opts);
    ret += r.totalPayout; sq += r.totalPayout * r.totalPayout;
    if (r.totalPayout > max) max = r.totalPayout;
    if (r.capped || r.totalPayout >= engine.CFG.maxWin - 1e-9) capped++;
    if (!bought) { const bp = r.basePayout || 0; baseRet += bp; if (bp > 0) hits++; }
    if (r.bonusTriggered) { bonusN++; bonusSum += r.bonus ? r.bonus.totalPayout : 0; if (!bought) trig++; }
  }
  return { mode, seed, rounds, cost: rounds * costPer, costPer, ret, sq, baseRet, hits, trig, bonusSum, bonusN, max, capped };
}

if (!isMainThread) {
  const { slot, mode, rounds, seed, cfg } = workerData;
  const eng = getEngine(slot); if (cfg) Object.assign(eng.CFG, cfg);
  parentPort.postMessage(runSeed(eng, mode, rounds, seed));
} else if (process.argv[1] === fileURLToPath(import.meta.url)) main();

function runPool(jobs, maxThreads) {
  return new Promise((resolve, reject) => {
    const out = []; let next = 0, active = 0, done = 0;
    const pump = () => {
      while (active < maxThreads && next < jobs.length) {
        const w = new Worker(fileURLToPath(import.meta.url), { workerData: jobs[next++] }); active++;
        w.once('message', m => out.push(m)); w.once('error', reject);
        w.once('exit', () => { active--; done++; if (done === jobs.length) resolve(out); else pump(); });
      }
    };
    pump();
  });
}

export function summarize(rows, band = [96.0, 96.5]) {
  const k = rows.length, N = rows.reduce((a, r) => a + r.rounds, 0), cost = rows.reduce((a, r) => a + r.cost, 0);
  const ret = rows.reduce((a, r) => a + r.ret, 0), sq = rows.reduce((a, r) => a + r.sq, 0);
  const mean = ret / N, varr = Math.max(0, sq / N - mean * mean), costPer = rows[0].costPer;
  const rtps = rows.map(r => r.ret / r.cost * 100), m = rtps.reduce((a, b) => a + b, 0) / k;
  const sdSeeds = k > 1 ? Math.sqrt(rtps.reduce((a, b) => a + (b - m) ** 2, 0) / (k - 1)) : NaN;
  const rtp = ret / cost * 100;
  const seCLT = Math.sqrt(varr / N) / costPer * 100;      // standard error of pooled RTP in points (round-level sd / sqrt N)
  const ci = 1.96 * seCLT;
  // heavy tail: the CLT estimate understates noise when a few capped rounds dominate; also report the seed-to-seed estimate
  const seSeeds = k > 1 ? sdSeeds / Math.sqrt(k) : NaN;
  const se = Math.max(seCLT, k >= 3 && !isNaN(seSeeds) ? seSeeds : 0), half = 1.96 * se;
  let verdict;
  if (rtp - half > band[1] || rtp + half < band[0]) verdict = 'FAIL';
  else if (rtp >= band[0] && rtp <= band[1] && rtp + half < 97.0) verdict = 'PASS';   // point estimate in band AND 95% CI upper < 97.0 (acceptance A3)
  else verdict = 'INCONCLUSIVE';
  const trig = rows.reduce((a, r) => a + r.trig, 0), bonusN = rows.reduce((a, r) => a + r.bonusN, 0), bonusSum = rows.reduce((a, r) => a + r.bonusSum, 0);
  const baseRet = rows.reduce((a, r) => a + r.baseRet, 0), hits = rows.reduce((a, r) => a + r.hits, 0);
  return { rtps, rtp, sdSeeds, seCLT, seSeeds, se, half, verdict, trigOneIn: trig ? N / trig : null, avgBonusX: bonusN ? bonusSum / bonusN : null,
    hitPct: costPer && !rows[0].mode.startsWith('buy') ? hits / N * 100 : null, baseRtp: baseRet / cost * 100, bonusShare: ret ? (ret - baseRet) / ret * 100 : 0,
    max: Math.max(...rows.map(r => r.max)), capped: rows.reduce((a, r) => a + r.capped, 0), rounds: N, costPer };
}

async function main() {
  const args = process.argv.slice(2).filter(a => a !== '--json'), asJson = process.argv.includes('--json');
  let cfg = process.env.CFG ? JSON.parse(process.env.CFG) : null; const ci = args.indexOf('--cfg');
  if (ci >= 0) { cfg = { ...cfg, ...JSON.parse(args[ci + 1]) }; args.splice(ci, 2); }
  const [slot, modeArg = 'base', roundsArg = '500000', seedsArg = '1,2,3,4'] = args;
  const eng = slot && getEngine(slot);
  if (!eng) { console.error(`usage: node tools/sim.js <slot> [mode] [rounds/seed] [seeds]\nslots: ${listEngines().join(', ')}`); process.exit(2); }
  if (cfg) Object.assign(eng.CFG, cfg);
  const modes = modeArg === 'all' ? listModes(eng) : modeArg.split(',');
  const rounds = Number(roundsArg), seeds = seedsArg.split(',').map(Number);
  const jobs = []; for (const mode of modes) for (const seed of seeds) jobs.push({ slot, mode, rounds, seed, cfg });
  const t0 = Date.now(), res = await runPool(jobs, Math.max(1, os.cpus().length));
  const report = {};
  for (const mode of modes) {
    const rows = res.filter(r => r.mode === mode).sort((a, b) => a.seed - b.seed), s = summarize(rows);
    report[mode] = { ...s, perSeed: rows.map((r, i) => ({ seed: r.seed, rtp: s.rtps[i] })) };
    if (asJson) continue;
    const f = (x, d = 2) => (x == null || isNaN(x) ? '-' : x.toFixed(d));
    console.log(`\n== ${slot} / ${mode}  (cost ${s.costPer}x, ${rounds.toLocaleString()} rounds x ${seeds.length} seeds = ${s.rounds.toLocaleString()}) ==`);
    console.log('seed      RTP%    max win   capped');
    rows.forEach((r, i) => console.log(`${String(r.seed).padEnd(8)}${f(s.rtps[i]).padStart(7)}${f(r.max, 1).padStart(11)}${String(r.capped).padStart(9)}`));
    console.log(`RTP mean ${f(s.rtp)}% +- ${f(s.half)} (95% CI; round-level SE ${f(s.seCLT)}, seed-to-seed SE ${f(s.seSeeds)}, sd of seeds ${f(s.sdSeeds)})`);
    console.log(`hit freq ${f(s.hitPct)}% | bonus trigger ${s.trigOneIn ? '1-in-' + s.trigOneIn.toFixed(0) : '-'} | avg bonus ${f(s.avgBonusX, 1)}x | base-game RTP ${f(s.baseRtp)}% | bonus share ${f(s.bonusShare, 1)}% | max win ${f(s.max, 1)}x | capped ${s.capped}`);
    console.log(`TARGET 96.0-96.5%: ${s.verdict}${s.verdict === 'INCONCLUSIVE' ? ' (mean ' + (s.rtp >= 96 && s.rtp <= 96.5 ? 'in band but CI upper >= 97.0' : 'outside band but CI overlaps it') + '; need more rounds)' : ''}`);
  }
  // decomposition: RTP = Rb + P(trigger) * E[bonus]; E[bonus] measured separately from the buy-mode rows of the same run
  const bs = report.base;
  if (bs && bs.trigOneIn) for (const m of modes.filter(m => m.startsWith('buy:'))) {
    const eb = report[m].avgBonusX, dec = bs.baseRtp + 100 * eb / bs.trigOneIn;
    report[m].decomposedBaseRtp = dec;
    if (!asJson) console.log(`\nDECOMPOSITION base RTP = Rb ${bs.baseRtp.toFixed(2)}% + (1/${bs.trigOneIn.toFixed(0)}) x E[bonus] ${eb.toFixed(1)}x (from ${m}) = ${dec.toFixed(2)}%   (direct base-mode measurement: ${bs.rtp.toFixed(2)}%)`);
  }
  if (asJson) console.log(JSON.stringify(report, null, 1));
  else console.log(`\n(${((Date.now() - t0) / 1000).toFixed(1)}s on ${os.cpus().length} cpus)`);
}
