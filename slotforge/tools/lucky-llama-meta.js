#!/usr/bin/env node
/* Regenerates engines/lucky-llama-fiesta.meta.json from the engine (CFG + info()).  node tools/lucky-llama-meta.js */
import fs from 'node:fs';
import * as A from '../engines/lucky-llama-fiesta.js';
const C = A.CFG, i = A.info();
const meta = {
  slug: A.id, name: A.name, kind: 'reels', reels: 5, rows: 3, lines: C.lines.map((l, k) => ({ line: k + 1, rows: l })), bets: C.bets, maxWin: C.maxWin, anteCost: C.anteCost,
  modes: {
    base: { label: 'Normal', request: {}, cost: 1 },
    ante: { label: 'Fiesta Luck', request: { ante: true }, cost: C.anteCost },
    'buy:parade': { label: C.buy.parade.name, request: { buy: 'parade' }, cost: C.buy.parade.cost },
    'buy:link': { label: C.buy.link.name, request: { buy: 'link' }, cost: C.buy.link.cost },
    'buy:party': { label: C.buy.party.name, request: { buy: 'party' }, cost: C.buy.party.cost }
  },
  buy: C.buy, symbols: i.symbols, paytable: C.paytable, lineScale: C.lineScale, payscale: C.payscale,
  scale: { lineScale: C.lineScale, anteScale: C.anteScale, linkScale: C.linkScale, paradeScale: C.paradeScale, grabScale: C.parade.grabScale },
  reels: C.reels, layout: C.layout, link: C.link, parade: C.parade, strips: i.strips
};
fs.writeFileSync(new URL('../engines/lucky-llama-fiesta.meta.json', import.meta.url), JSON.stringify(meta, null, 1) + '\n');
console.log('wrote engines/lucky-llama-fiesta.meta.json');
