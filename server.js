import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT      = process.env.PORT || 3000;
const SECRET    = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_USER= (process.env.ADMIN_USER || 'magenon').toLowerCase();
const START_BAL = Number(process.env.START_BALANCE ?? 0);

if (!process.env.JWT_SECRET) {
  console.warn('! JWT_SECRET not set - sessions will drop on restart. Set it in production.');
}

/* ---------------- database ---------------- */
const db = new Database(path.join(__dirname, 'nebula.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email    TEXT UNIQUE NOT NULL,
    pw_hash  TEXT NOT NULL,
    balance  REAL NOT NULL DEFAULT 0,
    wagered  REAL NOT NULL DEFAULT 0,
    rake     REAL NOT NULL DEFAULT 0,
    claimed  REAL NOT NULL DEFAULT 0,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created  INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS requests (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    kind    TEXT NOT NULL DEFAULT 'deposit',
    amount  REAL NOT NULL,
    status  TEXT NOT NULL DEFAULT 'pending',
    created INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS bets (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game    TEXT NOT NULL,
    stake   REAL NOT NULL,
    mult    REAL NOT NULL,
    payout  REAL NOT NULL,
    created INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const q = {
  byName:   db.prepare('SELECT * FROM users WHERE lower(username)=?'),
  byEmail:  db.prepare('SELECT * FROM users WHERE lower(email)=?'),
  byId:     db.prepare('SELECT * FROM users WHERE id=?'),
  create:   db.prepare(`INSERT INTO users (username,email,pw_hash,balance,is_admin,created)
                        VALUES (?,?,?,?,?,?)`),
  setBal:   db.prepare('UPDATE users SET balance=? WHERE id=?'),
  addBal:   db.prepare('UPDATE users SET balance=balance+? WHERE id=?'),
  addWager: db.prepare('UPDATE users SET wagered=wagered+?, rake=rake+? WHERE id=?'),
  claim:    db.prepare('UPDATE users SET rake=rake-?, claimed=claimed+?, balance=balance+? WHERE id=?'),
  newReq:   db.prepare('INSERT INTO requests (user_id,kind,amount,created) VALUES (?,?,?,?)'),
  allUsers: db.prepare(`SELECT id,username,email,balance,wagered,rake,claimed,is_admin,created
                        FROM users ORDER BY id`),
  userTotals: db.prepare(`SELECT user_id,
                           SUM(CASE WHEN kind='deposit'  AND status='approved' THEN amount ELSE 0 END) deposited,
                           SUM(CASE WHEN kind='withdraw' AND status='approved' THEN amount ELSE 0 END) withdrawn
                           FROM requests GROUP BY user_id`),
  setAdmin: db.prepare('UPDATE users SET is_admin=? WHERE id=?'),
  pending:  db.prepare(`SELECT r.id,r.kind,r.amount,r.created,u.username,u.email,u.balance
                        FROM requests r JOIN users u ON u.id=r.user_id
                        WHERE r.status='pending' ORDER BY r.created DESC`),
  reqById:  db.prepare("SELECT * FROM requests WHERE id=? AND status='pending'"),
  setReq:   db.prepare('UPDATE requests SET status=? WHERE id=?'),
  myReqs:   db.prepare('SELECT kind,amount,status,created FROM requests WHERE user_id=? ORDER BY created DESC LIMIT 20'),
  logBet:   db.prepare('INSERT INTO bets (user_id,game,stake,mult,payout,created) VALUES (?,?,?,?,?,?)'),
  recent:   db.prepare(`SELECT b.game,b.stake,b.mult,b.payout,b.created,u.username
                        FROM bets b JOIN users u ON u.id=b.user_id
                        ORDER BY b.id DESC LIMIT 25`)
};

/* ---------------- house edge, used for rakeback ---------------- */
const EDGE = {
  dice:.01, limbo:.01, crash:.01, mines:.01, plinko:.01, keno:.01, wheel:.01,
  flip:.01, hilo:.01, tower:.01, chicken:.01, blackjack:.005, pump:.02, rps:.02,
  cases:.01, snakes:.02, moles:.02, carrier:.03,
  slot:.04, retro:.04, cascade:.035, thunder:.035, starfall:.04
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
// serve the game from ./public, or from this folder, under whatever name it has
import fs from 'fs';
const pubDir = fs.existsSync(path.join(__dirname,'public')) ? path.join(__dirname,'public') : __dirname;
app.use(express.static(pubDir));
const gameFile = (() => {
  for (const d of [path.join(__dirname,'public'), __dirname]) {
    if (!fs.existsSync(d)) continue;
    const files = fs.readdirSync(d).filter(f => f.toLowerCase().endsWith('.html'));
    if (files.length) return path.join(d, files.includes('index.html') ? 'index.html' : files[0]);
  }
  return null;
})();
app.get('/', (req, res) => {
  if (!gameFile) return res.status(404).send('Put nebula-casino.html next to server.js and restart.');
  res.sendFile(gameFile);
});

const money = n => Math.round(Number(n) * 100) / 100;

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  try {
    const { id } = jwt.verify(token, SECRET);
    const user = q.byId.get(id);
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
  wagered: money(u.wagered), rake: Math.floor(u.rake * 100) / 100,
  claimed: money(u.claimed), admin: !!u.is_admin, tier: tierFor(u.wagered).n,
  rate: tierFor(u.wagered).rate
});

/* ---------------- auth ---------------- */
app.post('/api/register', (req, res) => {
  const username = String(req.body.username || '').trim();
  const email    = String(req.body.email || '').trim();
  const password = String(req.body.password || '');

  if (!/^[a-z0-9_]{3,16}$/i.test(username)) return res.status(400).json({ error: 'Username: 3-16 letters, numbers or underscore' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (q.byName.get(username.toLowerCase())) return res.status(400).json({ error: 'That username is taken' });
  if (q.byEmail.get(email.toLowerCase()))   return res.status(400).json({ error: 'That email is already registered' });

  // admin is decided by config, never by "who signed up first"
  const isAdmin = username.toLowerCase() === ADMIN_USER ? 1 : 0;
  const info = q.create.run(username, email, bcrypt.hashSync(password, 12), START_BAL, isAdmin, Date.now());
  const user = q.byId.get(info.lastInsertRowid);
  res.json({ token: jwt.sign({ id: user.id }, SECRET, { expiresIn: '30d' }), user: shape(user) });
});

app.post('/api/login', (req, res) => {
  const id = String(req.body.id || '').trim().toLowerCase();
  const user = q.byName.get(id) || q.byEmail.get(id);
  if (!user || !bcrypt.compareSync(String(req.body.password || ''), user.pw_hash))
    return res.status(400).json({ error: 'Wrong username or password' });
  res.json({ token: jwt.sign({ id: user.id }, SECRET, { expiresIn: '30d' }), user: shape(user) });
});

app.get('/api/me', auth, (req, res) => res.json({ user: shape(req.user) }));

/* ---------------- play ----------------
   The server is the authority on balance. The client reports the
   outcome of a round; the server verifies funds and settles it.     */
app.post('/api/bet', auth, (req, res) => {
  const game  = String(req.body.game || '');
  const stake = money(req.body.stake);
  const mult  = Number(req.body.mult);

  if (!(stake > 0) || !isFinite(mult) || mult < 0) return res.status(400).json({ error: 'Bad bet' });
  if (stake > req.user.balance + 1e-9) return res.status(400).json({ error: 'Not enough balance' });

  const payout = money(stake * mult);
  const edge   = EDGE[game] ?? 0.01;
  const rake   = stake * edge * tierFor(req.user.wagered).rate;

  db.transaction(() => {
    q.addBal.run(payout - stake, req.user.id);
    q.addWager.run(stake, rake, req.user.id);
    q.logBet.run(req.user.id, game, stake, mult, payout, Date.now());
  })();

  res.json({ user: shape(q.byId.get(req.user.id)) });
});

app.post('/api/rakeback/claim', auth, (req, res) => {
  const amount = Math.floor(req.user.rake * 100) / 100;
  if (amount < 0.10) return res.status(400).json({ error: 'Minimum claim is $0.10' });
  q.claim.run(amount, amount, amount, req.user.id);
  res.json({ claimed: amount, user: shape(q.byId.get(req.user.id)) });
});

/* ---------------- deposits need approval ---------------- */
app.post('/api/deposit', auth, (req, res) => {
  const amount = money(req.body.amount);
  if (!(amount > 0)) return res.status(400).json({ error: 'Enter an amount' });
  // an admin tops up instantly; everyone else waits for approval
  if (req.user.is_admin) {
    q.addBal.run(amount, req.user.id);
    return res.json({ approved: true, user: shape(q.byId.get(req.user.id)) });
  }
  q.newReq.run(req.user.id, 'deposit', amount, Date.now());
  res.json({ approved: false, message: 'Deposit request sent for approval' });
});

app.post('/api/withdraw', auth, (req, res) => {
  const amount = money(req.body.amount);
  if (!(amount > 0)) return res.status(400).json({ error: 'Enter an amount' });
  if (amount > req.user.balance + 1e-9) return res.status(400).json({ error: 'Not enough balance' });
  if (req.user.is_admin) {                       // admin adjusts their own balance directly
    q.addBal.run(-amount, req.user.id);
    return res.json({ approved: true, user: shape(q.byId.get(req.user.id)) });
  }
  // hold the funds while the request is pending so it cannot be spent twice
  db.transaction(() => {
    q.addBal.run(-amount, req.user.id);
    q.newReq.run(req.user.id, 'withdraw', amount, Date.now());
  })();
  res.json({ approved: false, message: 'Withdrawal request sent for approval',
             user: shape(q.byId.get(req.user.id)) });
});

app.get('/api/requests/mine', auth, (req, res) => res.json({ requests: q.myReqs.all(req.user.id) }));

app.get('/api/admin/requests', auth, adminOnly, (req, res) => res.json({ requests: q.pending.all() }));

app.post('/api/admin/requests/:id', auth, adminOnly, (req, res) => {
  const reqRow = q.reqById.get(req.params.id);
  if (!reqRow) return res.status(404).json({ error: 'No such pending request' });
  const approve = req.body.approve === true;
  db.transaction(() => {
    q.setReq.run(approve ? 'approved' : 'denied', reqRow.id);
    if (reqRow.kind === 'deposit') {
      if (approve) q.addBal.run(reqRow.amount, reqRow.user_id);      // credit on approval
    } else {
      if (!approve) q.addBal.run(reqRow.amount, reqRow.user_id);     // refund the hold on denial
    }
  })();
  res.json({ ok: true, requests: q.pending.all() });
});

app.get('/api/admin/users', auth, adminOnly, (req, res) => {
  const totalsMap = {};
  q.userTotals.all().forEach(r => { totalsMap[r.user_id] = r; });
  const users = q.allUsers.all().map(u => {
    const t = totalsMap[u.id] || { deposited: 0, withdrawn: 0 };
    // bet P&L = total payouts received - total staked (negative = house won)
    const betPnl = money(u.wagered > 0 ? (u.balance + u.wagered - t.deposited + t.withdrawn) : 0);
    return {
      id: u.id, username: u.username, email: u.email,
      balance: money(u.balance), wagered: money(u.wagered),
      deposited: money(t.deposited), withdrawn: money(t.withdrawn),
      rake: Math.floor(u.rake * 100) / 100, claimed: money(u.claimed),
      admin: !!u.is_admin, tier: tierFor(u.wagered).n,
      created: u.created,
      net: betPnl
    };
  });
  res.json({ users });
});

app.post('/api/admin/adjust', auth, adminOnly, (req, res) => {
  const target = q.byId.get(req.body.id);
  const amount = money(req.body.amount);
  if (!target) return res.status(404).json({ error: 'No such account' });
  if (!isFinite(amount) || amount === 0) return res.status(400).json({ error: 'Enter an amount' });
  if (target.balance + amount < 0) return res.status(400).json({ error: 'That would go below zero' });
  q.addBal.run(amount, target.id);
  res.json({ ok: true, users: q.allUsers.all().length });
});

app.get('/api/feed', (req, res) => res.json({ bets: q.recent.all() }));

app.get('/api/health', (req, res) => res.json({ ok: true, users: db.prepare('SELECT COUNT(*) c FROM users').get().c }));

import os from 'os';
app.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  const lan = Object.values(nets).flat()
    .filter(n => n && n.family === 'IPv4' && !n.internal).map(n => n.address);
  console.log('');
  console.log('  Nebula is running.');
  console.log(`  On this computer      : http://localhost:${PORT}`);
  lan.forEach(a => console.log(`  On your wifi          : http://${a}:${PORT}   <- send this to a friend on the same wifi`));
  console.log(`  Admin username        : "${ADMIN_USER}"   (register with exactly this name)`);
  console.log(`  New accounts start at : $${START_BAL}`);
  console.log(`  Game file             : ${gameFile ? path.basename(gameFile) : 'NOT FOUND - put the .html next to server.js'}`);
  console.log('');
});
