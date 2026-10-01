/* RTP / hit-rate simulator:  node emberclaw-sim.js [rounds=500000] [ante|standard|preheated] */
import { playRound, CFG } from './emberclaw-engine.js';

function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

if (process.env.CFG) Object.assign(CFG, JSON.parse(process.env.CFG));
const N = Number(process.argv[2] || 500000);
const mode = process.argv[3] || 'standard';
const rng = mulberry(Number(process.env.SEED || 20260930));
const opts = mode === 'ante' ? { ante: true } : mode === 'preheated' ? { buy: 'preheated' } : mode === 'buy' ? { buy: 'standard' } : {};

let cost = 0, ret = 0, baseRet = 0, hits = 0, trig = 0, max = 0, capped = 0, sq = 0;
for (let i = 0; i < N; i++) {
  const r = playRound(rng, opts);
  cost += r.cost; ret += r.totalPayout; sq += r.totalPayout ** 2;
  const bp = r.bought ? 0 : r.basePayout;
  baseRet += bp; if (bp > 0) hits++;
  if (r.bonusTriggered && !r.bought) trig++;
  if (r.capped) capped++;
  max = Math.max(max, r.totalPayout);
}
const mean = ret / N, sd = Math.sqrt(sq / N - mean * mean);
console.log(JSON.stringify({
  mode, rounds: N,
  RTP: +(ret / cost * 100).toFixed(2),
  baseGameRTP: +(baseRet / cost * 100).toFixed(2),
  bonusShareOfReturn: +(((ret - baseRet) / ret) * 100).toFixed(1),
  hitFreqPct: +(hits / N * 100).toFixed(2),
  bonusTriggerOneIn: trig ? Math.round(N / trig) : null,
  avgBonusX: trig ? +((ret - baseRet) / trig).toFixed(1) : null,
  maxWinX: +max.toFixed(1), cappedRounds: capped, stdDev: +sd.toFixed(2)
}, null, 1));
