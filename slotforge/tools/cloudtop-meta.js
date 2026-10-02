#!/usr/bin/env node
/* Regenerates engines/cloudtop-tea-house.meta.json from the engine (CFG + info()), so slot-facing data is never retyped.  node tools/cloudtop-meta.js */
import fs from 'node:fs';
import * as T from '../engines/cloudtop-tea-house.js';
const i = T.info(), C = T.CFG;
const meta = {
  slug: T.id, name: T.name, grid: { rows: C.rows, reels: C.reels, lines: C.lines }, bets: C.bets, maxWin: C.maxWin,
  modes: {
    base: { label: 'Normal', request: {}, cost: 1 },
    'buy:tin': { label: 'Tin Rush', request: { buy: 'tin' }, cost: C.buy.tin.cost },
    'buy:fs': { label: 'Free Spins', request: { buy: 'fs' }, cost: C.buy.fs.cost },
    'buy:super': { label: 'Super Free Spins', request: { buy: 'super' }, cost: C.buy.super.cost }
  },
  buy: C.buy, buyNames: i.buyNames, paytable: i.paytable, symbols: i.symbols, wild: i.wild, bundle: i.bundle, tin: i.tin, fsScatter: i.fsScatter, lines: i.lines,
  triggerTins: i.triggerTins, startRespins: i.startRespins, jackpots: i.jackpots, grandBonus: i.grandBonus,
  fsBonus: i.fsBonus, fsRates: i.fsRates
};
fs.writeFileSync(new URL('../engines/cloudtop-tea-house.meta.json', import.meta.url), JSON.stringify(meta, null, 1) + '\n');
console.log('wrote engines/cloudtop-tea-house.meta.json');
