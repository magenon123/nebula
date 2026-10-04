#!/usr/bin/env node
/* Regenerates engines/siroccos-lamp-bazaar.meta.json from the engine (CFG + info()).  node tools/sirocco-meta.js */
import fs from 'node:fs';
import * as A from '../engines/siroccos-lamp-bazaar.js';
const i = A.info(), C = A.CFG;
const meta = {
  slug: A.id, name: A.name, grid: { rows: C.rows, reels: C.reels, minRun: 3 }, bets: C.bets, maxWin: C.maxWin, anteCost: C.anteCost,
  modes: {
    base: { label: 'Normal', request: {}, cost: 1 },
    ante: { label: 'Djinn\'s Favour', request: { ante: true }, cost: C.anteCost },
    'buy:fs': { label: 'Free Wishes', request: { buy: 'fs' }, cost: C.buy.fs.cost },
    'buy:astrolabe': { label: 'Astrolabe of Wishes', request: { buy: 'astrolabe' }, cost: C.buy.astrolabe.cost },
    'buy:super': { label: 'SUPER Three Wishes', request: { buy: 'super' }, cost: C.buy.super.cost }
  },
  buy: C.buy, symbols: i.symbols, wild: 9, scatterFs: 10, scatterAstrolabe: 11, dirs: i.dirs, wildReels: i.wildReels, paytable: i.pay, payNote: 'x bet for a run of 3 / 4 / 5 before the multiplier; 0 = that length does not pay',
  stageMultCap: i.stageMultCap, gem: { id: 12, values: i.gem.values, maxGems: i.gem.maxGems }, fs: i.fs, astro: i.astro
};
fs.writeFileSync(new URL('../engines/siroccos-lamp-bazaar.meta.json', import.meta.url), JSON.stringify(meta, null, 1) + '\n');
console.log('wrote engines/siroccos-lamp-bazaar.meta.json');
