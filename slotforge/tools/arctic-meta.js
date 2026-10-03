#!/usr/bin/env node
/* Regenerates engines/arctic-aurora-lodge.meta.json from the engine (CFG + info()).  node tools/arctic-meta.js */
import fs from 'node:fs';
import * as A from '../engines/arctic-aurora-lodge.js';
const i = A.info(), C = A.CFG;
const meta = {
  slug: A.id, name: A.name, grid: { rows: C.rows, reels: C.reels, minArea: 8 }, bets: C.bets, maxWin: C.maxWin, anteCost: C.anteCost,
  modes: {
    base: { label: 'Normal', request: {}, cost: 1 },
    ante: { label: 'Northern Lights', request: { ante: true }, cost: C.anteCost },
    'buy:fs': { label: 'Aurora Muse (Free Spins)', request: { buy: 'fs' }, cost: C.buy.fs.cost },
    'buy:sweep': { label: 'Aurora Sweep', request: { buy: 'sweep' }, cost: C.buy.sweep.cost }
  },
  buy: C.buy, symbols: i.symbols, wild: 9, gem: 8, scatter: 10, tiers: i.tiers, litTier: i.litTier, paytable: i.pay, litLow: i.litLow, blockAreas: i.blockAreas, litBlockAreas: i.litBlockAreas,
  fs: i.fs, sweep: i.sweep, bands: A.BANDS
};
fs.writeFileSync(new URL('../engines/arctic-aurora-lodge.meta.json', import.meta.url), JSON.stringify(meta, null, 1) + '\n');
console.log('wrote engines/arctic-aurora-lodge.meta.json');
