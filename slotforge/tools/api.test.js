/* Integration test: starts /home/user/nebula/server.js on a spare port with a throwaway sqlite DB and exercises POST /api/slot/:id/spin.
 *   node --test tools/api.test.js        (env API_ROUNDS = number of live spins to contract-check, default 300) */
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEngine, listEngines, listModes, modeOpts } from '../engines/index.js';
import { checkRound } from './check-round.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 3200 + Math.floor(Math.random() * 500), B = `http://localhost:${PORT}`;
let srv, dir, token;
const cents = x => Math.round(x * 100);
const call = async (p, body, t = token, method = 'POST') => {
  const r = await fetch(B + p, { method, headers: { 'content-type': 'application/json', ...(t ? { authorization: 'Bearer ' + t } : {}) }, body: method === 'GET' ? undefined : JSON.stringify(body) });
  return { s: r.status, j: await r.json() };
};
const spin = (slot, b, t) => call(`/api/slot/${slot}/spin`, b, t);

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sfapi-'));
  srv = spawn('node', [path.join(ROOT, 'server.js')], { cwd: dir, env: { ...process.env, PORT: String(PORT), JWT_SECRET: 'test', TURSO_URL: '', TURSO_TOKEN: '' }, stdio: 'ignore' });
  for (let i = 0; i < 100; i++) { try { if ((await fetch(B + '/health')).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
  const r = await call('/api/register', { username: 'apitest', email: 'a@t.io', password: 'password123' }, null);
  token = r.j.token; assert.ok(token, 'registered');
  await call('/api/deposit', { amount: 100000 });
});
after(() => { srv?.kill(); try { fs.rmSync(dir, { recursive: true, force: true }); } catch {} });

test('auth, unknown slot, bad input', async () => {
  assert.equal((await spin('emberclaw', { stake: 1 }, null)).s, 401);
  assert.equal((await spin('nope', { stake: 1 })).s, 404);
  assert.equal((await spin('constructor', { stake: 1 })).s, 404);
  assert.equal((await spin('__proto__', { stake: 1 })).s, 404);
  for (const stake of [0.15, 0, -1, 'abc', '1', null, undefined, NaN, 1e9, [1], { a: 1 }]) assert.equal((await spin('emberclaw', { stake })).s, 400, 'stake ' + JSON.stringify(stake));
  for (const buy of ['toString', 'constructor', '__proto__', 'nope', 5, {}]) assert.equal((await spin('emberclaw', { stake: 1, buy })).s, 400, 'buy ' + JSON.stringify(buy));
  for (const ante of ['false', 'true', 1, 0, 'yes']) assert.equal((await spin('emberclaw', { stake: 1, ante })).s, 400, 'ante ' + JSON.stringify(ante));
  const both = await spin('emberclaw', { stake: 1, ante: true, buy: 'standard' }); assert.equal(both.s, 400);
  const bal0 = (await call('/api/me', null, token, 'GET')).j.user.balance;
  assert.equal(bal0, 100000, 'rejected requests must not touch the balance');
});

test('insufficient balance leaves everything untouched', async () => {
  const poor = (await call('/api/register', { username: 'poorguy', email: 'p@t.io', password: 'password123' }, null)).j.token;
  await call('/api/deposit', { amount: 50 }, poor);
  const r = await spin('emberclaw', { stake: 1, buy: 'standard' }, poor);
  assert.equal(r.s, 400); assert.match(r.j.error, /balance/i);
  assert.equal((await call('/api/me', null, poor, 'GET')).j.user.balance, 50);
});

test('info endpoint is public and derived from the engine', async () => {
  const r = await call('/api/slot/emberclaw/info', null, null, 'GET');
  assert.equal(r.s, 200); const C = getEngine('emberclaw').CFG;
  assert.deepEqual(r.j.bets, C.bets); assert.equal(r.j.maxWin, C.maxWin); assert.equal(r.j.anteCost, C.anteCost);
  assert.equal((await call('/api/slot/nope/info', null, null, 'GET')).s, 404);
});

for (const id of listEngines()) {
  test(`${id}: live responses obey CONTRACT v1 and the balance matches to the cent (both routes)`, async () => {
    const eng = getEngine(id), modes = listModes(eng), N = Number(process.env.API_ROUNDS || 300);
    let bal = cents((await call('/api/me', null, token, 'GET')).j.user.balance);
    for (let i = 0; i < N; i++) {
      const mode = modes[i % modes.length], o = modeOpts(eng, mode), stake = [0.1, 0.5, 1, 2.5][i % 4];
      const r = await call(i % 2 ? `/api/slot/${id}/spin` : `/api/${id}/spin`, { stake, ...(o.ante ? { ante: true } : {}), ...(o.buy ? { buy: o.buy } : {}) });
      assert.equal(r.s, 200, JSON.stringify(r.j));
      const errs = checkRound(r.j.round, eng.CFG, { ante: !!o.ante, buy: o.buy || null }); assert.deepEqual(errs, [], errs.join('; '));
      const cost = cents(stake * r.j.round.cost), pay = cents(stake * r.j.round.totalPayout);
      assert.equal(cents(r.j.cost), cost); assert.equal(cents(r.j.payout), pay);
      bal += pay - cost; assert.equal(cents(r.j.user.balance), bal, `balance after spin ${i}`);
    }
  });
}

test('concurrent spins: settlement is atomic, balance never negative, books balance', async () => {
  const t = (await call('/api/register', { username: 'racer', email: 'r@t.io', password: 'password123' }, null)).j.token;
  await call('/api/deposit', { amount: 100 }, t);
  const rs = await Promise.all(Array.from({ length: 12 }, () => spin('emberclaw', { stake: 10, ante: true }, t)));   // each costs $30
  let bal = 10000, ok = 0;
  for (const r of rs) { assert.ok(r.s === 200 || r.s === 400, 'status ' + r.s); if (r.s === 200) { ok++; bal += cents(r.j.payout) - cents(r.j.cost); } }
  const me = (await call('/api/me', null, t, 'GET')).j.user;
  assert.equal(cents(me.balance), bal, 'final balance == deposit + sum(payout - cost) of successful spins');
  assert.ok(me.balance >= 0); assert.ok(ok >= 1);
});
