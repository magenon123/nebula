import express from 'express';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { playRound, cryptoRng, CFG as EC } from './emberclaw-engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT       = process.env.PORT || 3000;
const SECRET     = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_USER = (process.env.ADMIN_USER || 'magenon').toLowerCase();
const START_BAL  = Number(process.env.START_BALANCE ?? 0);
const TURSO_URL  = process.env.TURSO_URL  || 'libsql://nebula-magenon123.aws-us-east-2.turso.io';
const TURSO_TOKEN= process.env.TURSO_TOKEN;

if (!process.env.JWT_SECRET) {
  console.warn('! JWT_SECRET not set - sessions will drop on restart. Set it in production.');
}

/* ---------------- database ---------------- */
if (TURSO_URL && TURSO_TOKEN) {
  console.log('DB: connecting to Turso →', TURSO_URL);
} else {
  console.warn('DB: TURSO_URL or TURSO_TOKEN missing — using LOCAL file:nebula.db (data will be lost on restart!)');
}
const db = createClient(
  TURSO_URL && TURSO_TOKEN
    ? { url: TURSO_URL, authToken: TURSO_TOKEN }
    : { url: 'file:nebula.db' }
);

await db.execute(`CREATE TABLE IF NOT EXISTS users (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email    TEXT UNIQUE NOT NULL,
  pw_hash  TEXT NOT NULL,
  balance  REAL NOT NULL DEFAULT 0,
  vault    REAL DEFAULT 0,
  wagered  REAL NOT NULL DEFAULT 0,
  rake     REAL NOT NULL DEFAULT 0,
  claimed  REAL NOT NULL DEFAULT 0,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created  INTEGER NOT NULL
)`);
await db.execute(`ALTER TABLE users ADD COLUMN vault REAL DEFAULT 0`).catch(()=>{});
await db.execute(`CREATE TABLE IF NOT EXISTS requests (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  kind    TEXT NOT NULL DEFAULT 'deposit',
  amount  REAL NOT NULL,
  status  TEXT NOT NULL DEFAULT 'pending',
  created INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);
await db.execute(`CREATE TABLE IF NOT EXISTS bets (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  game    TEXT NOT NULL,
  stake   REAL NOT NULL,
  mult    REAL NOT NULL,
  payout  REAL NOT NULL,
  created INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);
// Enforce: only the designated admin username has is_admin=1
await db.batch([
  { sql: `UPDATE users SET is_admin=0 WHERE lower(username)!=?`, args: [ADMIN_USER] },
  { sql: `UPDATE users SET is_admin=1 WHERE lower(username)=?`,  args: [ADMIN_USER] }
], 'write').catch(()=>{});
console.log('DB: tables ready');

/* helpers */
const one  = r => r.rows[0] || null;
const all  = r => r.rows;
const money = n => Math.round(Number(n) * 100) / 100;

async function byName(u)  { return one(await db.execute({ sql:'SELECT * FROM users WHERE lower(username)=?', args:[u] })); }
async function byEmail(e) { return one(await db.execute({ sql:'SELECT * FROM users WHERE lower(email)=?',    args:[e] })); }
async function byId(id)   { return one(await db.execute({ sql:'SELECT * FROM users WHERE id=?',             args:[id] })); }

/* ---------------- house edge / rakeback tiers ---------------- */
const EDGE = {
  dice:.01, limbo:.01, crash:.01, mines:.01, plinko:.01, keno:.01, wheel:.01,
  flip:.01, hilo:.01, tower:.01, chicken:.01, blackjack:.005, pump:.02, rps:.02,
  cases:.01, snakes:.02, moles:.02, carrier:.03,
  emberclaw:.04, slot:.04, retro:.04, cascade:.035, thunder:.035, starfall:.04
};
const TIERS = [
  { n:'Bronze', min:0, rate:.05 }, { n:'Silver', min:5000, rate:.08 },
  { n:'Gold', min:25000, rate:.12 }, { n:'Platinum', min:100000, rate:.16 },
  { n:'Diamond', min:500000, rate:.20 }
];
const tierFor = w => TIERS.reduce((t, x) => (w >= x.min ? x : t), TIERS[0]);

/* ---------------- app ---------------- */
const app = express();
app.use(cors());
app.use(express.json());

const pubDir = fs.existsSync(path.join(__dirname,'public')) ? path.join(__dirname,'public') : __dirname;
app.use(express.static(pubDir));
const gameFile = (() => {
  const PREFER = ['nebula-casino.html', 'index.html'];
  for (const d of [path.join(__dirname,'public'), __dirname]) {
    if (!fs.existsSync(d)) continue;
    const files = fs.readdirSync(d).filter(f => f.toLowerCase().endsWith('.html'));
    if (!files.length) continue;
    const pick = PREFER.find(p => files.includes(p)) || files[0];
    return path.join(d, pick);
  }
  return null;
})();
app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/', (req, res) => {
  if (!gameFile) return res.status(404).send('Put nebula-casino.html next to server.js and restart.');
  res.sendFile(gameFile);
});

async function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  try {
    const { id } = jwt.verify(token, SECRET);
    const user = await byId(id);
    if (!user) return res.status(401).json({ error: 'Account not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired' });
  }
}
const adminOnly = (req, res, next) =>
  req.user.is_admin ? next() : res.status(403).json({ error: 'Admins only' });

const shape = u => ({
  username: u.username, email: u.email, balance: money(u.balance),
  vault: money(u.vault || 0),
  wagered: money(u.wagered), rake: Math.floor(u.rake * 100) / 100,
  claimed: money(u.claimed), admin: !!u.is_admin, tier: tierFor(u.wagered).n,
  rate: tierFor(u.wagered).rate
});

/* ---------------- auth routes ---------------- */
app.post('/api/register', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const email    = String(req.body.email || '').trim();
    const password = String(req.body.password || '');

    if (!/^[a-z0-9_]{3,16}$/i.test(username)) return res.status(400).json({ error: 'Username: 3-16 letters, numbers or underscore' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (await byName(username.toLowerCase())) return res.status(400).json({ error: 'That username is taken' });
    if (await byEmail(email.toLowerCase()))   return res.status(400).json({ error: 'That email is already registered' });

    const isAdmin = username.toLowerCase() === ADMIN_USER ? 1 : 0;
    const r = await db.execute({
      sql: 'INSERT INTO users (username,email,pw_hash,balance,is_admin,created) VALUES (?,?,?,?,?,?)',
      args: [username, email, bcrypt.hashSync(password, 12), START_BAL, isAdmin, Date.now()]
    });
    const user = await byId(Number(r.lastInsertRowid));
    res.json({ token: jwt.sign({ id: user.id }, SECRET, { expiresIn: '30d' }), user: shape(user) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const id = String(req.body.id || '').trim().toLowerCase();
    const user = (await byName(id)) || (await byEmail(id));
    if (!user || !bcrypt.compareSync(String(req.body.password || ''), user.pw_hash))
      return res.status(400).json({ error: 'Wrong username or password' });
    res.json({ token: jwt.sign({ id: user.id }, SECRET, { expiresIn: '30d' }), user: shape(user) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/me', auth, (req, res) => res.json({ user: shape(req.user) }));

/* ---------------- play ---------------- */
app.post('/api/bet', auth, async (req, res) => {
  try {
    const game  = String(req.body.game || '');
    const stake = money(req.body.stake);
    const mult  = Number(req.body.mult);

    if (!(stake > 0) || !isFinite(mult) || mult < 0) return res.status(400).json({ error: 'Bad bet' });
    if (stake > req.user.balance + 1e-9) return res.status(400).json({ error: 'Not enough balance' });

    const payout = money(stake * mult);
    const edge   = EDGE[game] ?? 0.01;
    const rake   = stake * edge * tierFor(req.user.wagered).rate;

    await db.batch([
      { sql: 'UPDATE users SET balance=balance+? WHERE id=?',           args: [payout - stake, req.user.id] },
      { sql: 'UPDATE users SET wagered=wagered+?, rake=rake+? WHERE id=?', args: [stake, rake, req.user.id] },
      { sql: 'INSERT INTO bets (user_id,game,stake,mult,payout,created) VALUES (?,?,?,?,?,?)', args: [req.user.id, game, stake, mult, payout, Date.now()] }
    ], 'write');

    res.json({ user: shape(await byId(req.user.id)) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});


/* ===== SLOTFORGE SLOT ROUTES START ===== (owner: rin; engines live in slotforge/engines/, see ENGINE-API.md) */
import { getEngine } from './slotforge/engines/index.js';

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o || {}, k);

/* One generic, server-authoritative spin for every registered slot engine. */
async function slotSpin(slotId, req, res) {
  try {
    const eng = getEngine(slotId);
    if (!eng) return res.status(404).json({ error: 'Unknown slot' });
    const C = eng.CFG;
    const stake = money(req.body.stake);
    const ante  = !!req.body.ante;
    const buy   = req.body.buy ? String(req.body.buy) : null;
    if (!C.bets.includes(stake)) return res.status(400).json({ error: 'Invalid bet size' });
    if (buy && !hasOwn(C.buy, buy)) return res.status(400).json({ error: 'Unknown bonus buy' });
    if (ante && !C.anteCost) return res.status(400).json({ error: 'This slot has no ante mode' });
    if (buy && ante) return res.status(400).json({ error: 'Ante cannot be combined with Buy Bonus' });

    const round = eng.playRound(eng.cryptoRng, { ante, buy });
    const cost = money(stake * round.cost);
    const payout = money(stake * round.totalPayout);

    // atomic debit: only succeeds if the balance still covers the cost
    const d = await db.execute({ sql: 'UPDATE users SET balance=balance-? WHERE id=? AND balance>=?', args: [cost, req.user.id, cost - 1e-9] });
    if (!d.rowsAffected) return res.status(400).json({ error: 'Not enough balance' });
    const rake = cost * (C.rakeEdge ?? EDGE[slotId] ?? 0.04) * tierFor(req.user.wagered).rate;
    await db.batch([
      { sql: 'UPDATE users SET balance=balance+? WHERE id=?', args: [payout, req.user.id] },
      { sql: 'UPDATE users SET wagered=wagered+?, rake=rake+? WHERE id=?', args: [cost, rake, req.user.id] },
      { sql: 'INSERT INTO bets (user_id,game,stake,mult,payout,created) VALUES (?,?,?,?,?,?)', args: [req.user.id, slotId, cost, payout / cost, payout, Date.now()] }
    ], 'write');

    res.json({ round, stake, cost, payout, user: shape(await byId(req.user.id)) });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
app.post('/api/slot/:id/spin', auth, (req, res) => slotSpin(req.params.id, req, res));
app.post('/api/emberclaw/spin', auth, (req, res) => slotSpin('emberclaw', req, res));   // legacy path, same handler
/* ===== SLOTFORGE SLOT ROUTES END ===== */

app.post('/api/rakeback/claim', auth, async (req, res) => {
  try {
    const amount = Math.floor(req.user.rake * 100) / 100;
    if (amount < 0.10) return res.status(400).json({ error: 'Minimum claim is $0.10' });
    await db.execute({ sql: 'UPDATE users SET rake=rake-?, claimed=claimed+?, balance=balance+? WHERE id=?', args: [amount, amount, amount, req.user.id] });
    res.json({ claimed: amount, user: shape(await byId(req.user.id)) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

/* ---------------- deposits / withdrawals ---------------- */
app.post('/api/deposit', auth, async (req, res) => {
  try {
    const amount = money(req.body.amount);
    if (!(amount > 0)) return res.status(400).json({ error: 'Enter an amount' });
    if (req.user.is_admin) {
      await db.batch([
        { sql: 'UPDATE users SET balance=balance+? WHERE id=?', args: [amount, req.user.id] },
        { sql: 'INSERT INTO requests (user_id,kind,amount,status,created) VALUES (?,?,?,?,?)', args: [req.user.id, 'deposit', amount, 'approved', Date.now()] }
      ], 'write');
      return res.json({ approved: true, user: shape(await byId(req.user.id)) });
    }
    await db.batch([
      { sql: 'UPDATE users SET balance=balance+? WHERE id=?', args: [amount, req.user.id] },
      { sql: 'INSERT INTO requests (user_id,kind,amount,status,created) VALUES (?,?,?,?,?)', args: [req.user.id, 'deposit', amount, 'approved', Date.now()] }
    ], 'write');
    res.json({ approved: true, user: shape(await byId(req.user.id)) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/withdraw', auth, async (req, res) => {
  try {
    const amount = money(req.body.amount);
    if (!(amount > 0)) return res.status(400).json({ error: 'Enter an amount' });
    if (amount > req.user.balance + 1e-9) return res.status(400).json({ error: 'Not enough balance' });
    if (req.user.is_admin) {
      await db.batch([
        { sql: 'UPDATE users SET balance=balance+? WHERE id=?', args: [-amount, req.user.id] },
        { sql: 'INSERT INTO requests (user_id,kind,amount,status,created) VALUES (?,?,?,?,?)', args: [req.user.id, 'withdraw', amount, 'approved', Date.now()] }
      ], 'write');
      return res.json({ approved: true, user: shape(await byId(req.user.id)) });
    }
    await db.batch([
      { sql: 'UPDATE users SET balance=balance+? WHERE id=?', args: [-amount, req.user.id] },
      { sql: 'INSERT INTO requests (user_id,kind,amount,status,created) VALUES (?,?,?,?,?)', args: [req.user.id, 'withdraw', amount, 'approved', Date.now()] }
    ], 'write');
    res.json({ approved: true, user: shape(await byId(req.user.id)) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/requests/mine', auth, async (req, res) => {
  try {
    const r = await db.execute({ sql: 'SELECT kind,amount,status,created FROM requests WHERE user_id=? ORDER BY created DESC LIMIT 20', args: [req.user.id] });
    res.json({ requests: all(r) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

/* --- vault: move funds between play balance and vault --- */
app.post('/api/vault/deposit', auth, async (req, res) => {
  try {
    const amount = money(req.body.amount);
    if (!(amount > 0)) return res.status(400).json({ error: 'Enter an amount' });
    if (amount > req.user.balance + 1e-9) return res.status(400).json({ error: 'Not enough balance' });
    await db.batch([
      { sql: 'UPDATE users SET balance=balance-?, vault=vault+? WHERE id=?', args: [amount, amount, req.user.id] },
      { sql: 'INSERT INTO requests (user_id,kind,amount,status,created) VALUES (?,?,?,?,?)', args: [req.user.id, 'vault_in', amount, 'approved', Date.now()] }
    ], 'write');
    res.json({ user: shape(await byId(req.user.id)) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/vault/withdraw', auth, async (req, res) => {
  try {
    const amount = money(req.body.amount);
    if (!(amount > 0)) return res.status(400).json({ error: 'Enter an amount' });
    const u = await byId(req.user.id);
    if (amount > (u.vault || 0) + 1e-9) return res.status(400).json({ error: 'Not enough in vault' });
    await db.batch([
      { sql: 'UPDATE users SET vault=vault-?, balance=balance+? WHERE id=?', args: [amount, amount, req.user.id] },
      { sql: 'INSERT INTO requests (user_id,kind,amount,status,created) VALUES (?,?,?,?,?)', args: [req.user.id, 'vault_out', amount, 'approved', Date.now()] }
    ], 'write');
    res.json({ user: shape(await byId(req.user.id)) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/requests', auth, adminOnly, async (req, res) => {
  try {
    const r = await db.execute(`SELECT r.id,r.kind,r.amount,r.created,u.username,u.email,u.balance
      FROM requests r JOIN users u ON u.id=r.user_id WHERE r.status='pending' ORDER BY r.created DESC`);
    res.json({ requests: all(r) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/requests/:id', auth, adminOnly, async (req, res) => {
  try {
    const reqRow = one(await db.execute({ sql: "SELECT * FROM requests WHERE id=? AND status='pending'", args: [req.params.id] }));
    if (!reqRow) return res.status(404).json({ error: 'No such pending request' });
    const approve = req.body.approve === true;
    const ops = [{ sql: 'UPDATE requests SET status=? WHERE id=?', args: [approve ? 'approved' : 'denied', reqRow.id] }];
    if (reqRow.kind === 'deposit' && approve)  ops.push({ sql: 'UPDATE users SET balance=balance+? WHERE id=?', args: [reqRow.amount, reqRow.user_id] });
    if (reqRow.kind === 'withdraw' && !approve) ops.push({ sql: 'UPDATE users SET balance=balance+? WHERE id=?', args: [reqRow.amount, reqRow.user_id] });
    await db.batch(ops, 'write');
    const pending = await db.execute(`SELECT r.id,r.kind,r.amount,r.created,u.username,u.email,u.balance
      FROM requests r JOIN users u ON u.id=r.user_id WHERE r.status='pending' ORDER BY r.created DESC`);
    res.json({ ok: true, requests: all(pending) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/transactions', auth, adminOnly, async (req, res) => {
  try {
    const r = await db.execute(`SELECT r.id,r.kind,r.amount,r.status,r.created,u.username
      FROM requests r JOIN users u ON u.id=r.user_id
      ORDER BY r.created DESC LIMIT 200`);
    res.json({ transactions: all(r) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
  try {
    const usersRes  = await db.execute('SELECT id,username,email,balance,wagered,rake,claimed,is_admin,created FROM users ORDER BY id');
    const totalsRes = await db.execute(`SELECT user_id,
      SUM(CASE WHEN kind='deposit'  AND status='approved' THEN amount ELSE 0 END) deposited,
      SUM(CASE WHEN kind='withdraw' AND status='approved' THEN amount ELSE 0 END) withdrawn
      FROM requests GROUP BY user_id`);
    const totalsMap = {};
    all(totalsRes).forEach(r => { totalsMap[r.user_id] = r; });
    const users = all(usersRes).map(u => {
      const t = totalsMap[u.id] || { deposited: 0, withdrawn: 0 };
      const betPnl = money(u.balance + Number(t.withdrawn) - Number(t.deposited));
      return {
        id: u.id, username: u.username, email: u.email,
        balance: money(u.balance), wagered: money(u.wagered),
        deposited: money(t.deposited), withdrawn: money(t.withdrawn),
        rake: Math.floor(u.rake * 100) / 100, claimed: money(u.claimed),
        admin: !!u.is_admin, tier: tierFor(u.wagered).n,
        created: u.created, net: betPnl
      };
    });
    res.json({ users });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/adjust', auth, adminOnly, async (req, res) => {
  try {
    const target = await byId(req.body.id);
    const amount = money(req.body.amount);
    if (!target) return res.status(404).json({ error: 'No such account' });
    if (!isFinite(amount) || amount === 0) return res.status(400).json({ error: 'Enter an amount' });
    if (target.balance + amount < 0) return res.status(400).json({ error: 'That would go below zero' });
    await db.batch([
      { sql: 'UPDATE users SET balance=balance+? WHERE id=?', args: [amount, target.id] },
      { sql: 'INSERT INTO requests (user_id,kind,amount,status,created) VALUES (?,?,?,?,?)', args: [target.id, amount >= 0 ? 'deposit' : 'withdraw', Math.abs(amount), 'approved', Date.now()] }
    ], 'write');
    const cnt = one(await db.execute('SELECT COUNT(*) c FROM users'));
    res.json({ ok: true, users: cnt.c });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/feed', async (req, res) => {
  try {
    const r = await db.execute(`SELECT b.game,b.stake,b.mult,b.payout,b.created,u.username
      FROM bets b JOIN users u ON u.id=b.user_id ORDER BY b.id DESC LIMIT 25`);
    res.json({ bets: all(r) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/health', async (req, res) => {
  try {
    const r = one(await db.execute('SELECT COUNT(*) c FROM users'));
    res.json({ ok: true, users: r.c });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  const lan = Object.values(nets).flat()
    .filter(n => n && n.family === 'IPv4' && !n.internal).map(n => n.address);
  console.log('');
  console.log('  Nebula is running.');
  console.log(`  On this computer      : http://localhost:${PORT}`);
  lan.forEach(a => console.log(`  On your wifi          : http://${a}:${PORT}`));
  console.log(`  Database              : ${TURSO_URL ? 'Turso (persistent)' : 'local SQLite'}`);
  console.log(`  Admin username        : "${ADMIN_USER}"`);
  console.log(`  New accounts start at : $${START_BAL}`);
  console.log('');
});

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
