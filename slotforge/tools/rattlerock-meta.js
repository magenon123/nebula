#!/usr/bin/env node
/* Regenerates engines/rattlerock-run.meta.json from the engine (CFG + info()).  node tools/rattlerock-meta.js */
import fs from 'node:fs';
import * as A from '../engines/rattlerock-run.js';
const C = A.CFG, i = A.info();
const meta = {
  slug: A.id, name: A.name, kind: 'ride', bets: C.bets, maxWin: C.maxWin, anteCost: C.anteCost, maxStops: 12, spacing: C.spacing, carts: C.carts, levels: C.levels,
  modes: {
    base: { label: 'Normal', request: {}, cost: 1 },
    ante: { label: 'Twin Carts', request: { ante: true }, cost: C.anteCost },
    'buy:deep': { label: C.buy.deep.name, request: { buy: 'deep' }, cost: C.buy.deep.cost },
    'buy:motherlode': { label: C.buy.motherlode.name, request: { buy: 'motherlode' }, cost: C.buy.motherlode.cost }
  },
  buy: C.buy, stopTypes: i.symbols, payscale: C.payscale, gemValues: i.gem, lanternsToTrigger: C.lanternsToTrigger,
  baseWeights: C.base.w, bonusLevels: C.bonus.levels.map(l => ({ len: l.len, weights: l.w, goldScale: l.goldScale, gem: l.gemV.map(g => g[0]), jackpotP: l.jackpotP })),
  ante: C.ante
};
fs.writeFileSync(new URL('../engines/rattlerock-run.meta.json', import.meta.url), JSON.stringify(meta, null, 1) + '\n');
console.log('wrote engines/rattlerock-run.meta.json');
