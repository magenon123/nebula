/* Rattlerock Run. Client for the mine-cart ride; the shared shell (shell/slot-shell.js) calls these hooks.
 * Pure renderer: the engine returns the whole round (round.runs[] for the base ride / Twin Carts, round.bonus.spins[] = one level attempt per entry);
 * nothing here decides an outcome. Format: plans/rattlerock-run-round-format.md, art: slots/rattlerock-run/ART-NOTES.md.
 * Motion: ONE requestAnimationFrame loop advances a "distance" per lane; the parallax layers and every pickup are placed from that distance
 * with translate3d only (the stops timeline and the scenery can never drift apart). Pickup nodes come from a pool of 16. */
SlotShell.boot(SLOT_CFG, S => {
const { $, sfx, wait, T, say, shake, flash, embers, fmt } = S;
const NS = 'http://www.w3.org/2000/svg';
const SPX = 470, COLLECT = 150, SPAWN_X = 1780, V0 = 560, POOL = 16;
const ABORT = { abort: 1 };
let EP = 0, curR = null, lastCart = 0, inBonus = false, twinOn = false, idleOn = true;
const timers = new Set();
const after = (ms, fn) => { const ep = EP, id = setTimeout(() => { timers.delete(id); if (ep === EP) fn(); }, ms * T()); timers.add(id); return id; };
const guardW = ep => async ms => { await wait(ms); if (ep !== EP) throw ABORT; };
const stageP = el => { const f = $('frame').getBoundingClientRect(), b = el.getBoundingClientRect(), k = f.width / 1600 || 1; return [(b.left + b.width / 2 - f.left) / k, (b.top + b.height / 2 - f.top) / k]; };
const scr = (x, y) => { const f = $('frame').getBoundingClientRect(), k = f.width / 1600 || 1; return [f.left + x * k, f.top + y * k]; };
const anim = (el, kf, o) => { try { return el.animate(kf, o); } catch { return { finished: Promise.resolve(), cancel() {} }; } };

/* ---------- aliases so the shell's `#s<id>` buy-sign / card icons can show the rr* art ---------- */
(function () {
  const IT = [-80, -110, 160, 200, '-75 -95 150 150'];
  const A = { Gem10: ['rrGem10', ...IT], Gem5: ['rrGem5', ...IT], Hat: ['rrHat', ...IT], Lantern: ['rrLantern', ...IT], Door: ['rrDoor', -230, -330, 460, 350, '-230 -340 460 460'], Cart: ['rrCartRide', -400, -530, 800, 780, '-340 -440 680 680'] };
  const sv = document.createElementNS(NS, 'svg'); sv.setAttribute('width', 0); sv.setAttribute('height', 0); sv.style.cssText = 'position:absolute;width:0;height:0';
  sv.innerHTML = Object.entries(A).map(([k, [id, x, y, w, h, vb]]) => `<symbol id="s${k}" viewBox="${vb}"><use href="#${id}" x="${x}" y="${y}" width="${w}" height="${h}"/></symbol>`).join(''); document.body.appendChild(sv);
})();

/* ---------- sprites ---------- */
const SPR = {
  nugget: { id: 'rrNugget', w: 100, h: 125, hv: 0 }, pile: { id: 'rrPile', w: 210, h: 175, hv: 0 }, hat: { id: 'rrHat', w: 112, h: 140, hv: 56 }, tnt: { id: 'rrTnt', w: 120, h: 150, hv: 0 },
  lantern: { id: 'rrLantern', w: 100, h: 125, hv: 50 }, fork: { id: 'rrFork', w: 130, h: 163, hv: 0 }, door: { id: 'rrDoor', w: 345, h: 262, hv: 0 },
  g2: { id: 'rrGem2', w: 112, h: 140, hv: 60 }, g3: { id: 'rrGem3', w: 112, h: 140, hv: 60 }, g5: { id: 'rrGem5', w: 112, h: 140, hv: 60 }, g10: { id: 'rrGem10', w: 112, h: 140, hv: 60 }
};
const sprFor = (type, v) => type === 'gold' ? (v >= 0.5 ? SPR.pile : SPR.nugget) : type === 'gem' ? (SPR['g' + v] || SPR.g10) : type === 'shield' ? SPR.hat : SPR[type] || SPR.nugget;

/* ---------- pooled pickup nodes ---------- */
const pool = []; let liveN = 0;
function mkNode() { const n = document.createElementNS(NS, 'svg'); n.setAttribute('class', 'rrs rrI'); n.innerHTML = '<use href="#rrNugget"/>'; n._u = n.firstChild; n.style.display = 'none'; $('grid').appendChild(n); return n; }
function acquire() { if (liveN >= POOL) return null; let n = pool.pop(); if (!n) n = mkNode(); liveN++; n.style.display = 'block'; n.style.opacity = ''; return n; }
function release(n) { if (!n || n._rel) return; n._rel = 1; n.getAnimations().forEach(a => a.cancel()); n.style.display = 'none'; n.style.opacity = ''; liveN--; n._rel = 0; pool.push(n); }

/* ---------- lanes: A = near lane (rail 718), B = Twin Carts lane (rail 488, scale .72) ---------- */
function mkLane(id, rail, k, cx) {
  const L = { id, rail, k, cx, dist: 0, v: 0, go: false, target: 0, ease: false, res: null, items: [], live: [], ns: 0, st: { load: 0, mult: 1, shields: 0, lanterns: 0 }, ramp: 1, crashed: false, cartSt: 'Ride', cheerT: 0 };
  const w = document.createElement('div'); w.className = 'rrW'; const cw = 400 * k, ch = 390 * k;
  w.style.cssText = `width:${cw}px;height:${ch}px;left:${cx - 200 * k}px;top:${rail - 387 * k}px`;
  w.innerHTML = `<svg class="rrs rrCart bounce" style="width:${cw}px;height:${ch}px"><use href="#rrCartRide"/></svg><svg class="rrs rrCart rrDome" style="width:${cw}px;height:${ch}px;display:none"><use href="#rrShieldDome"/></svg><svg class="rrs rrCart rrSpk" style="width:${cw}px;height:${ch}px"><use href="#rrSparks"/></svg>`;
  L.w = w; L.cart = w.children[0]; L.dome = w.children[1]; L.cu = L.cart.firstChild; L.dome.style.opacity = 1; L.boom = document.createElementNS(NS, 'svg'); L.boom.setAttribute('class', 'rrs rrBoom'); L.boom.innerHTML = '<use href="#rrBoom1"/>'; L.boom.style.display = 'none';
  return L;
}
const LA = mkLane('A', 718, 1, 340), LB = mkLane('B', 488, .72, 790);
const LANES = [LA, LB];
window.__rr = { LA, LB, ep: () => EP };   // test handle
function setCart(L, st) { L.cartSt = st; L.cu.setAttribute('href', '#rrCart' + st); }
function baseCart(L) { return L.crashed ? 'Crash' : L.st.shields > 0 ? 'Shield' : 'Ride'; }
function cheer(L, ms = 650) { if (L.crashed) return; setCart(L, 'Cheer'); clearTimeout(L.cheerT); L.cheerT = after(ms, () => { if (!L.crashed && L.cartSt === 'Cheer') setCart(L, baseCart(L)); }); }
function setDome(L) { L.dome.style.display = L.st.shields > 0 && !L.crashed ? 'block' : 'none'; }

/* ---------- scenery layers: placed from the lane distance (CSS animations are switched off) ---------- */
let lay = null, curLv = 1;
function bindLayers() {
  const q = s => document.querySelector('#scene ' + s);
  lay = { fm: q('.ly-farmid.L' + curLv), mid: q('.ly-mid.L' + curLv), tr: q('.ly-track.L' + curLv), near: q('.ly-near.L' + curLv), t2: q('.ly-track2'), last: [null, null, null, null, null] };
  document.querySelectorAll('#scene .ly-farmid,#scene .ly-mid,#scene .ly-track,#scene .ly-near,#scene .ly-track2').forEach(e => { e.style.animation = 'none'; });
}
function paintLayers(dA, dB) {
  const l = lay, v = [(dA * .06) % 1600, (dA * .22) % 1600, dA % 1600, (dA * 1.5) % 1600, (dB * .72) % 1152];
  if (l.last[0] !== v[0]) { l.last[0] = v[0]; l.fm.style.transform = `translate3d(${-v[0]}px,0,0)`; }
  if (l.last[1] !== v[1]) { l.last[1] = v[1]; l.mid.style.transform = `translate3d(${-v[1]}px,0,0)`; }
  if (l.last[2] !== v[2]) { l.last[2] = v[2]; l.tr.style.transform = `translate3d(${-v[2]}px,0,0)`; }
  if (l.last[3] !== v[3]) { l.last[3] = v[3]; l.near.style.transform = `translate3d(${-v[3]}px,0,0)`; }
  if (l.last[4] !== v[4]) { l.last[4] = v[4]; l.t2.style.transform = `translate3d(${-v[4]}px,-230px,0) scale(.72)`; }
}
function setLevel(n) { curLv = n; const sc = $('scene'); sc.classList.remove('lv1', 'lv2', 'lv3'); sc.classList.add('lv' + n); bindLayers(); paintLayers(LA.dist, LB.dist); }

/* ---------- the loop ---------- */
let raf = 0, lastT = 0;
function kick() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(tick); } }
function itemPos(L, it) { return [L.cx + L.k * (it.x0 - L.dist + COLLECT) + it.dx, it.top]; }
function place(it, L) { const x = L.cx + L.k * (it.x0 - L.dist + COLLECT) + it.dx - it.ox; if (x !== it._x) { it._x = x; it.n.style.transform = `translate3d(${x}px,${it.top}px,0)`; } }
function spawn(L, it) {
  if (!it.spr) it.spr = SPR.nugget; const n = acquire(); if (!n) return false; it.n = n; n._u.setAttribute('href', '#' + it.spr.id); const k = L.k * (it.sc || 1);
  it.w = it.spr.w * k; it.h = it.spr.h * k; n.style.width = it.w + 'px'; n.style.height = it.h + 'px'; n.style.opacity = it.alpha == null ? '' : it.alpha;
  it.ox = it.w * (it.spr.id === 'rrDoor' ? .5 : it.spr.id === 'rrPile' ? .5 : .5);
  const hv = (it.spr.hv || 0) * L.k, bottom = L.rail + 24 * L.k - hv + (it.dy || 0);
  it.top = it.spr.id === 'rrDoor' ? L.rail - it.h * (330 / 350) : bottom - it.h; it._x = null; it.live = true; L.live.push(it); place(it, L);
  if (it.onSpawn) it.onSpawn(); return true;
}
function tick(now) {
  raf = 0; const dt = Math.min(.05, (now - lastT) / 1000); lastT = now; const sc = 1 / T(); let any = false;
  for (const L of LANES) {
    if (L.go) {
      any = true; let want = V0 * L.ramp * sc;
      if (L.ease) want = Math.max(90 * sc, Math.min(want, (L.target - L.dist) * 3.4 * sc));
      L.v += (want - L.v) * Math.min(1, dt * 7); L.dist += L.v * dt;
      if (L.dist >= L.target - .5) { L.dist = L.target; L.go = false; const r = L.res; L.res = null; if (r) r(); }
    }
    while (L.ns < L.items.length) { const it = L.items[L.ns]; if (L.cx + L.k * (it.x0 - L.dist + COLLECT) + it.dx < SPAWN_X) { if (spawn(L, it)) L.ns++; else break; } else break; }
    if (L.live.length) { let j = 0; for (let i = 0; i < L.live.length; i++) { const it = L.live[i]; if (!it.live) continue; if (it.n && L.cx + L.k * (it.x0 - L.dist + COLLECT) + it.dx < -420) { it.live = false; release(it.n); it.n = null; continue; } if (it.n && !it.fly) place(it, L); L.live[j++] = it; } L.live.length = j; }
  }
  paintLayers(LA.dist, LB.dist);
  for (const L of LANES) if (L._mv !== L.go) { L._mv = L.go; L.w.classList.toggle('mv', L.go); }
  if (any) raf = requestAnimationFrame(tick);
}
function travel(L, to, ease) { L.target = Math.max(to, L.dist); L.ease = !!ease; L.go = true; kick(); return new Promise(r => { L.res = r; }); }
function freeItems(L) { L.live.forEach(it => { it.live = false; if (it.n) release(it.n); it.n = null; }); L.live = []; L.items = []; L.ns = 0; }

/* ---------- HUD ---------- */
const H = { depth: $('hDepthV'), dist: $('hDistV'), mult: $('hMultV'), load: $('hLoadV'), shN: $('hShieldN'), sh: $('hShield'), mc: $('hMult'), dl: $('hDepth').querySelector('i') };
const bump = id => { const e = $(id); e.classList.remove('rrBump'); void e.offsetWidth; e.classList.add('rrBump'); setTimeout(() => e.classList.remove('rrBump'), 480 * T()); };
const tw = new WeakMap();
function cnt(el, from, to, ms, f) {
  const id = (tw.get(el) || 0) + 1; tw.set(el, id); if (from === to || ms <= 0) { el.textContent = f(to); return Promise.resolve(); }
  return new Promise(res => { const t0 = performance.now(); (function s(t) { if (tw.get(el) !== id) return res(); const k = Math.min(1, (t - t0) / (ms * T())); el.textContent = f(from + (to - from) * (1 - Math.pow(1 - k, 3))); k < 1 ? requestAnimationFrame(s) : res(); })(t0); });
}
let stakeNow = 1; const hudShown = { load: 0, mult: 1 };
const mon = x => fmt(stakeNow * x), xs = x => 'x' + Math.round(x);
const laneSum = (key) => LANES.reduce((a, L) => a + (L.active ? L.st[key] : 0), 0);
function hudAll(snapNow) {   // writes the HUD from the lane states (twin: sums / pair)
  const act = LANES.filter(L => L.active); if (!act.length) act.push(LA);
  const load = act.reduce((a, L) => a + L.st.load, 0), mult = Math.max(...act.map(L => L.st.mult)), sh = act.reduce((a, L) => a + L.st.shields, 0), lan = Math.max(...act.map(L => L.st.lanterns));
  if (load !== hudShown.load) { cnt(H.load, hudShown.load, load, snapNow ? 0 : 420, mon); hudShown.load = load; bump('hLoad'); }
  if (act.length > 1) { H.mult.textContent = act.map(L => xs(L.st.mult)).join(' | '); hudShown.mult = mult; H.mult.classList.add('two'); }
  else { H.mult.classList.remove('two'); if (mult !== hudShown.mult) { cnt(H.mult, hudShown.mult, mult, snapNow ? 0 : 520, xs); hudShown.mult = mult; bump('hMult'); } }
  H.mc.style.setProperty('--p', Math.min(1, (mult - 1) / 60)); H.shN.textContent = sh; H.sh.classList.toggle('on', sh > 0);
  for (let i = 1; i <= 3; i++) $('hl' + i).classList.toggle('on', i <= lan);
}
function hudPos(depth, dist) { H.depth.textContent = depth + ' m'; H.dist.textContent = dist + ' m'; }
function hudReset(start) {
  const o = start || {}; LA.st = { load: 0, mult: o.mult || 1, shields: o.shields || 0, lanterns: 0 }; LB.st = { load: 0, mult: 1, shields: 0, lanterns: 0 }; LA.active = true; LB.active = false;
  hudShown.load = -1; hudShown.mult = -1; hudAll(true); hudPos(inBonus ? 100 * (o.level || 1) : 30, 0);
}
function setCarts(cur, lost) { document.querySelectorAll('#rrCarts .rrCI').forEach((e, i) => { e.classList.toggle('lost', i + 1 < cur || (lost && i + 1 === cur)); e.classList.toggle('cur', i + 1 === cur && !lost); }); }

/* ---------- little visual helpers ---------- */
function tag(x, y, text, cls = '', ms = 1100) {
  const e = document.createElement('div'); e.className = 'rrTag ' + cls; e.textContent = text; e.style.left = x + 'px'; e.style.top = y + 'px'; $('fxl').appendChild(e);
  const a = anim(e, [{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-90%) scale(1.1)', opacity: 1, offset: .2 }, { transform: 'translate(-50%,-190%) scale(1)', opacity: 0 }], { duration: ms * T(), easing: 'ease-out' });
  a.finished.then(() => e.remove(), () => e.remove());
}
function banner(title, sub, ms = 1500, big) {
  const b = $('rrBanner'); b.querySelector('b').textContent = title; b.querySelector('small').textContent = sub || ''; b.classList.toggle('big', !!big);
  anim(b, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.5)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.08)', offset: .16 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .26 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.02)', offset: .84 }, { opacity: 0, transform: 'translate(-50%,-64%) scale(.96)' }], { duration: ms * T(), easing: 'ease-out' });
}
/* flies a pickup node to a stage point and recycles it */
function flyTo(it, tx, ty, ms, endScale = .4, cb) {
  const n = it.n; if (!n) { cb && cb(); return; } it.fly = true; const x = it._x, y = it.top;
  const a = anim(n, [{ transform: `translate3d(${x}px,${y}px,0) scale(1)`, opacity: 1 }, { transform: `translate3d(${tx - it.ox}px,${ty - it.h / 2}px,0) scale(${endScale})`, opacity: 1, offset: .82 }, { transform: `translate3d(${tx - it.ox}px,${ty - it.h / 2}px,0) scale(${endScale * .8})`, opacity: 0 }], { duration: ms * T(), easing: 'cubic-bezier(.4,0,.7,.5)', fill: 'forwards' });
  a.finished.then(() => { it.live = false; it.n = null; release(n); cb && cb(); }, () => {});
}
function boom(L, x, y, size = 300) {
  const b = L.boom; if (!b.parentNode) $('fxl').appendChild(b); const u = b.firstChild, s = size * (L.k > .9 ? 1 : .8);
  b.style.cssText = `display:block;width:${s}px;height:${s}px;transform:translate3d(${x - s / 2}px,${y - s / 2}px,0);opacity:1`; u.setAttribute('href', '#rrBoom1');
  after(80, () => u.setAttribute('href', '#rrBoom2')); after(260, () => { u.setAttribute('href', '#rrBoom3'); anim(b, [{ opacity: 1 }, { opacity: 0 }], { duration: 380 * T(), fill: 'forwards' }); }); after(700, () => { b.style.display = 'none'; });
  const [sx, sy] = scr(x, y); embers(14, sx, sy, false);
}
const goldTier = v => v >= 1.5 ? 4 : v >= .5 ? 3 : v >= .15 ? 2 : v >= .06 ? 1 : 0;

/* ---------- one stop ---------- */
function mkItem(L, s, base) {
  const type = s.type, v = s.value; const spr = type === 'door' ? SPR.door : type === 'fork' ? SPR.fork : sprFor(type, v);
  return { s, type, v, spr, x0: base + s.at / 100 * SPX, dx: type === 'door' ? 330 * L.k : 0, dy: 0, live: false, n: null, i: s.i };
}
function applyState(L, s) { L.st.load = s.load; L.st.mult = s.mult; L.st.shields = s.shields; L.st.lanterns = s.lanterns; }
async function doTaken(L, it, t, s, o, W) {      // t = {type, value, shielded, crash}: a plain stop's content, or the side a fork took
  const [px, py] = [L.cx + L.k * COLLECT, L.rail - 150 * L.k], st = o.stake, type = t.type;
  if (type === 'none') { if (it.n) { it.fly = true; const n = it.n; anim(n, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 * T(), fill: 'forwards' }).finished.then(() => { it.live = false; it.n = null; release(n); }, () => {}); } return; }
  if (type === 'gold') {
    sfx.pick(goldTier(t.value)); flyTo(it, px, py, 300); applyState(L, s); hudAll(); cheer(L); tag(px + 20, py - 40, '+' + fmt(st * t.value), 'gold'); return;
  }
  if (type === 'gem') {
    const g = stageP($('hMult').querySelector('.mGem')); sfx.gemPick(t.value, s.mult); const n0 = L.st.mult; flyTo(it, g[0], g[1], 520, .5); applyState(L, s); after(380, () => { sfx.gemAdd(s.mult); hudAll(); });
    cheer(L, 900); tag(px, py - 70, '+' + t.value, 'gem'); S.music.intensity(Math.min(1, (o.bonus ? .3 : .1) + s.mult / 40)); return;
  }
  if (type === 'shield') { sfx.hatOn(); flyTo(it, px, py - 60, 380, .5, () => {}); applyState(L, s); setDome(L); setCart(L, 'Shield'); anim(L.dome, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 300 * T() }); hudAll(); tag(px, py - 80, 'SHIELD', 'gold'); return; }
  if (type === 'lantern') { const g = stageP($('hl' + Math.min(3, s.lanterns))); sfx.lantern(s.lanterns); flyTo(it, g[0], g[1], 520, .45); applyState(L, s); after(400, () => hudAll()); if (s.lanterns === 3) { say('THREE LANTERNS! THE SHAFT OPENS', true); tag(px, py - 60, 'DEEP SHAFT!', 'gem'); } return; }
  if (type === 'tnt') {
    if (t.shielded) {   // the hat takes the blast
      sfx.tntBlock(); const x = px + 30, y = py + 40; boom(L, x, y, 240); shake(.5); flyTo(it, x, y, 10); applyState(L, s);
      { const a = anim(L.dome, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1.25)', offset: .4 }, { opacity: 0, transform: 'scale(1.5)' }], { duration: 420 * T(), fill: 'forwards' }); a.finished.then(() => { a.cancel(); setDome(L); }, () => {}); }
      after(420, () => { if (!L.crashed) setCart(L, baseCart(L)); }); hudAll(); tag(px, py - 70, 'SHIELD POPS', 'gold'); return;
    }
    return 'crash';
  }
}
/* plays one track (a base ride, or one level attempt of the bonus) on lane L. Returns {pay (in bets), crashed} */
async function playTrack(L, tr, o) {
  const ep = EP, W = guardW(ep), stops = tr.stops, L0 = L.dist, base = L0 + 400;
  freeItems(L); L.crashed = false; L.active = true; L.ramp = 1; setCart(L, baseCart(L)); setDome(L); L.w.classList.remove('gone');
  stops.forEach(s => L.items.push(mkItem(L, s, base)));
  const last = L.items[L.items.length - 1]; if (last && last.type === 'door') last.onSpawn = () => $('scene').classList.add('exit');
  setCart(L, baseCart(L)); const sfxLoop = true; let crashed = false, doorHit = null;
  for (let n = 0; n < stops.length; n++) {
    const s = stops[n], it = L.items[n]; L.ramp = 1 + Math.min(.45, (L.st.mult - 1) * .012);
    if (s.type === 'fork') {
      await travel(L, it.x0 - 270, true); await W(0);
      await doFork(L, it, s, o, W);
      const t = s.taken, crash = t.type === 'tnt' && !t.shielded;
      await travel(L, it.x0 - (crash ? 50 : 0), crash); await W(0); hudPos(o.depth(s.i), Math.round(s.at / 100 * 38));
      const r = await doTaken(L, it, t, s, o, W); if (r === 'crash') { crashed = true; await doCrash(L, it, s, o, W); break; }
      if (t.type !== 'none') await W(t.type === 'tnt' ? 380 : 0); else applyState(L, s), hudAll();
      continue;
    }
    if (s.type === 'door') {
      await travel(L, it.x0, true); await W(0); hudPos(o.depth(s.i), Math.round(s.at / 100 * 38)); doorHit = s; applyState(L, s); break;
    }
    const crash = s.type === 'tnt' && !s.shielded;
    await travel(L, it.x0 - (crash ? 50 : 0), crash); await W(0); hudPos(o.depth(s.i), Math.round(s.at / 100 * 38));
    const r = await doTaken(L, it, s, s, o, W);
    if (r === 'crash') { crashed = true; await doCrash(L, it, s, o, W); break; }
    if (s.type === 'tnt') await W(380);
  }
  const pay$ = o.stake * tr.pay;
  if (crashed) { await payOut(L, tr, o, W, 'crash'); }
  else if (doorHit) { await doDoor(L, doorHit, tr, o, W); }
  else { L.v = 0; L.w.classList.remove('mv'); }    // trigger run of a bought round: no door
  return { pay: pay$, crashed };
}
async function doFork(L, it, s, o, W) {
  const sg = sfx; say('A FORK. WHICH WAY?', false); const px = L.cx + L.k * COLLECT, ground = L.rail - 8 * L.k;
  const mk = (p, dx) => { const spr = p.type === 'none' ? SPR.pile : sprFor(p.type, p.value); const b = { s: it.s, type: p.type, spr, sc: p.type === 'none' ? .3 : .8, alpha: p.type === 'none' ? .4 : 1, x0: it.x0, dx: it.dx + dx * L.k, dy: -(SPR.fork.h + 4) * L.k * 1.02, live: false, n: null, pv: p }; b.fromBub = 1; spawn(L, b); return b; };
  const bl = mk(s.left, -85), br = mk(s.right, 85);
  sg.fork(); await W(750); sfx.lever(); if (it.n) it.n._u.setAttribute('href', s.side === 'left' ? '#rrForkL' : '#rrForkR');
  await W(420); const lose = s.side === 'left' ? br : bl, win = s.side === 'left' ? bl : br;
  if (lose.n) anim(lose.n, [{ opacity: lose.alpha }, { opacity: .12 }], { duration: 300 * T(), fill: 'forwards' });
  if (win.n) anim(win.n, [{ transform: win.n.style.transform + ' scale(1)' }, { transform: win.n.style.transform + ' scale(1.25)' }], { duration: 300 * T(), fill: 'forwards' });
  say(s.side === 'left' ? 'THE LEVER SNAPS LEFT' : 'THE LEVER SNAPS RIGHT', true);
  const dy = s.side === 'left' ? -26 : 14; anim(L.w, [{ transform: 'translateY(0)' }, { transform: `translateY(${dy}px)`, offset: .25 }, { transform: `translateY(${dy}px)`, offset: .75 }, { transform: 'translateY(0)' }], { duration: 1500 * T(), easing: 'ease-in-out' });
  await W(620);
  for (const b of [bl, br]) { b.live = false; if (b.n) { const n = b.n; b.n = null; release(n); } }
  L.live = L.live.filter(b => !b.fromBub);
  const t = s.taken, nspr = t.type === 'none' ? null : sprFor(t.type, t.value);
  if (it.n && nspr) { it.spr = nspr; it.type = t.type; it.n._u.setAttribute('href', '#' + nspr.id); const k = L.k; it.w = nspr.w * k; it.h = nspr.h * k; it.n.style.width = it.w + 'px'; it.n.style.height = it.h + 'px'; it.ox = it.w * .5; const hv = (nspr.hv || 0) * k; it.top = L.rail + 24 * k - hv - it.h; it._x = null; place(it, L); }
}
async function doCrash(L, it, s, o, W) {
  L.crashed = true; L.go = false; L.v = 0; const x = L.cx + L.k * (COLLECT + 40), y = L.rail - 70 * L.k; sfx.crash(); S.music.duck && S.music.duck(.25, 1, 1.2);
  if (it.n) { const n = it.n; it.live = false; it.n = null; release(n); } boom(L, x, y, 340); shake(true); flash(); setCart(L, 'Crash'); setDome(L); L.w.classList.remove('mv'); applyState(L, s); hudAll();
  say('BOOM! THE CART CRASHES', true); await W(1100);
}
async function payOut(L, tr, o, W, why) {
  const pay$ = o.stake * tr.pay; const x = L.cx, y = L.rail - 250 * L.k;
  tag(x, y, why === 'crash' ? 'LOAD ' + fmt(pay$) : '+' + fmt(pay$), why === 'crash' ? 'crash' : 'big', 1500);
  if (pay$ > 0) await o.land(pay$, W); else await W(300);
}
async function doDoor(L, d, tr, o, W) {
  setCart(L, 'Win'); L.dome.style.display = 'none'; L.w.classList.remove('mv'); L.v = 0; sfx.door(); flash(.7); const [sx, sy] = scr(L.cx + 300, L.rail - 150 * L.k); embers(40, sx, sy, true); S.music.stinger('win');
  const pay$ = o.stake * tr.pay, x = L.cx + 120 * L.k, y = L.rail - 300 * L.k;
  banner(o.bonus && tr.exit === 'bottom' ? 'BOTTOM DOOR!' : o.bonus ? 'LEVEL CLEARED' : 'DAYLIGHT!', `LOAD ${fmt(o.stake * d.load)} x ${d.mult}` + (d.jackpot ? `  +  JACKPOT x${d.jackpot}` : ''), 1700, !!d.jackpot);
  say(d.jackpot ? 'JACKPOT DOOR! x' + d.jackpot : o.bonus ? 'LEVEL CLEARED' : 'DAYLIGHT! THE DOOR OPENS', true);
  if (d.jackpot) { sfx.jackpot(); shake(true); }
  H.mc.classList.add('rrWin'); setTimeout(() => H.mc.classList.remove('rrWin'), 1200 * T());
  await W(700); const ld = LANES.filter(l => l.active).length > 1 ? 0 : 1; if (ld) { cnt(H.load, hudShown.load, d.load * d.mult + d.jackpot, 800, mon); hudShown.load = d.load * d.mult + d.jackpot; }
  tag(x, y, '+' + fmt(pay$), 'big', 1700); await o.land(pay$, W);
  await W(500); $('scene').classList.remove('exit');
}

/* ---------- play a round ---------- */
const mkLand = (ctx, acc) => async (pay$, W) => {   // pay lands in the WIN field in steps; the running total is shared by both lanes
  const steps = Math.min(14, 6 + Math.round(pay$ / ctx.stake)), t0 = acc.v; for (let i = 1; i <= steps; i++) { const a = acc.v; acc.v = t0 + pay$ * i / steps; ctx.onWin(a, acc.v); sfx.tick(i / steps); await W(55); }
  acc.v = t0 + pay$; ctx.onWin(acc.v, acc.v);
};
function resetLanes() {
  killTimers(); LANES.forEach(L => { freeItems(L); L.crashed = false; L.go = false; L.v = 0; L.res = null; L.w.getAnimations().forEach(a => a.cancel()); L.boom.style.display = 'none'; L.cheerT = 0; setCart(L, 'Ride'); L.dome.style.display = 'none'; L.dome.getAnimations().forEach(a => a.cancel()); L.w.classList.remove('mv'); });
  $('scene').classList.remove('exit'); $('fxl').querySelectorAll('.rrTag').forEach(e => e.remove());
}
function killTimers() { timers.forEach(clearTimeout); timers.clear(); }
async function baseSpin(sp, run, ctx) {
  const ep = EP, W = guardW(ep); stakeNow = ctx.stake; idleOn = false; const acc = { v: run }, land = mkLand(ctx, acc), runs = sp.runs, twin = runs.length > 1;
  try {
    twinOn = twin; $('scene').classList.toggle('twin', twin); $('hud').classList.toggle('twin', twin); LB.w.style.display = twin ? 'block' : 'none';
    LA.st = { load: 0, mult: 1, shields: 0, lanterns: 0 }; LB.st = { load: 0, mult: 1, shields: 0, lanterns: 0 }; LA.active = true; LB.active = twin; hudShown.load = -1; hudShown.mult = -1; hudAll(true); hudPos(30, 0);
    if (twin) say('TWO CARTS, TWO TRACKS', true); S.music.intensity(.15);
    const mkO = () => ({ stake: ctx.stake, bonus: false, land, depth: i => 30 + i * 4 });
    const res = await Promise.all(runs.map((r, i) => playTrack(LANES[i], r, mkO())));
    await W(300);
    if (sp.bonusTriggered === false || !curR || !curR.bonusTriggered) { /* nothing */ }
    return acc.v;
  } catch (e) { if (e === ABORT) return run; throw e; }
}
async function segSpin(sp, run, ctx) {
  const ep = EP, W = guardW(ep); stakeNow = ctx.stake; const acc = { v: run }, land = mkLand(ctx, acc), L = LA;
  try {
    twinOn = false; $('scene').classList.remove('twin'); LB.w.style.display = 'none'; LB.active = false; LA.active = true;
    const newLevel = sp.level !== curLv, newCart = sp.cart !== lastCart;
    if (newLevel) { sfx.descend(); setLevel(sp.level); }
    freeItems(L); $('scene').classList.remove('exit'); L.st = { load: 0, mult: sp.multIn, shields: sp.shieldsIn, lanterns: 0 }; L.crashed = false; setCart(L, baseCart(L)); setDome(L);
    H.dl.textContent = 'LEVEL ' + sp.level; hudShown.load = -1; hudShown.mult = -1; hudAll(true); hudPos(100 * sp.level, 0); setCarts(sp.cart, false);
    if (newCart) { lastCart = sp.cart; L.w.style.display = 'block'; anim(L.w, [{ transform: 'translateX(-620px)' }, { transform: 'translateX(0)' }], { duration: 750 * T(), easing: 'cubic-bezier(.2,.7,.3,1)' }); }
    banner(sp.cart > 1 && !newLevel ? `CART ${sp.cart}` : `LEVEL ${sp.level}`, sp.cart > 1 && !newLevel ? `LEVEL ${sp.level} AGAIN` : `CART ${sp.cart} OF 3`, 1400);
    S.music.intensity(Math.min(1, .35 + sp.level * .15 + sp.multIn / 60)); say(`LEVEL ${sp.level} · CART ${sp.cart}`, true); await W(newLevel ? 1200 : 700);
    const o = { stake: ctx.stake, bonus: true, land, depth: i => 100 * sp.level + i * 6 };
    const tr = { stops: sp.stops, pay: sp.pay, exit: sp.exit };
    const r = await playTrack(L, tr, o);
    if (sp.cartLost) { setCarts(sp.cart, true); const left = sp.spinsLeft; say(left > 0 ? `CART LOST. ${left} LEFT` : 'THE LAST CART IS GONE', true); await W(600); }
    else if (sp.exit === 'level') { await W(300); }
    return acc.v;
  } catch (e) { if (e === ABORT) return run; throw e; }
}

/* ---------- sound ---------- */
function musicDefs() {
  const SC = [0, 2, 3, 5, 7, 8, 10];   // E natural minor
  const ROOT = [40, 40, 36, 43, 40, 40, 38, 43];
  const mine = {
    tempo: 84, barBeats: 4, spb: 8, swing: .1, bars: 8, key: 52, scale: SC, seed: 31, gain: .9, phrase: 4,
    layers: { drone: { gain: 1, wet: .4 }, pick: { gain: 1, wet: .2 }, bell: { enter: 1, gain: 1, wet: .5 }, thump: { int: .25, gain: 1, wet: .15 }, hi: { int: .5, gain: 1, wet: .5 } },
    bar(M) {
      const k = M.i & 7, wk = Math.max(-1, Math.min(1, M.walk));
      if (k % 2 === 0) M.pad('drone', M.t0, M.bd * 2, [ROOT[k], ROOT[k] + 7, ROOT[k] + 12], { wave: 'sawtooth', cut: 260, q: .5, a: 1.4, r: 1.8, g: .05, det: 7 });
      [0, 3, 4, 7].forEach((s, j) => M.tok('pick', M.st(s), j % 2 ? .6 : .9));
      [0, 2, 4, 6].forEach((s, j) => { if (M.rnd() < .65) M.koto('bell', M.st(s), M.note([0, 2, 4, 2, 1, 0, -1, 1][(s + k) % 8] + (s > 3 ? wk : 0), 1), { g: s === 0 ? .06 : .04, d: .4 }); });
      if (M.int > .25) [0, 4].forEach(s => M.taiko('thump', M.st(s), .5, { f0: 100, f1: 52, d: .45, g: .22 }));
      if (M.int > .5) [1, 3, 5, 7].forEach(s => M.metal('hi', M.st(s) + .01, M.mtof(M.note(4 + (s % 3), 2)), 1, .014, [1, 2.4]));
    }
  };
  const deep = {
    tempo: 118, barBeats: 4, spb: 16, swing: .05, bars: 8, key: 52, scale: SC, seed: 77, gain: .88, phrase: 4,
    layers: { drone: { gain: 1, wet: .3 }, arp: { gain: 1, wet: .3 }, drum: { gain: 1, wet: .12 }, anvil: { int: .1, gain: 1, wet: .35 }, riser: { gain: 1, wet: .4 }, hit: { int: .6, gain: 1, wet: .2 } },
    bar(M) {
      const k = M.i & 7, I = M.int, A = [[0, 2, 4, 7], [0, 3, 4, 6], [-1, 2, 4, 5], [0, 2, 5, 7]][(k >> 1) & 3];
      if (k % 2 === 0) M.pad('drone', M.t0, M.bd * 2, [ROOT[k], ROOT[k] + 7], { wave: 'sawtooth', cut: 280 + I * 260, q: .5, a: 1, r: 1.4, g: .055, det: 7 });
      for (let s = 0; s < 16; s++) M.koto('arp', M.st(s), M.note(A[s % 4] + (s % 8 > 5 ? 2 : 0), s % 8 > 3 ? 1 : 0), { g: s % 4 === 0 ? .06 : .036, d: .24 });
      [0, 6, 8, 11].forEach(s => M.kick('drum', M.st(s), .95, { f0: 140, f1: 56, d: .26, g: .22 })); [2, 5, 10, 13, 14].forEach(s => M.tok('drum', M.st(s), .8));
      [2, 6, 10, 14].forEach(s => M.metal('anvil', M.st(s), 3300, .5, .014, [1, 2.4]));
      if (k % 4 === 3) M.riser('riser', M.t0, M.bd, { g: .03 + I * .03, f1: 400, f2: 3400 + I * 1800 });
      if (I > .6) [0, 4, 8, 12].forEach((s, j) => M.taiko('hit', M.st(s), .5 + j * .05, { f0: 110, f1: 54, d: .35, g: .26 }));
    }
  };
  const stingers = {
    win(K) { const { V, dest, t } = K; [0, 2, 4, 7].forEach((d, i) => V.metal(dest, t + i * .08, K.mtof(K.note(d, 2)), 1.4, .05, [1, 2.003])); },
    bonus(K) { const { V, dest, t } = K; V.sub(dest, t, 1.4, 36, { g: .3 }); [0, 2, 4, 5, 7, 9].forEach((d, i) => V.metal(dest, t + .15 + i * .09, K.mtof(K.note(d, 1)), 2, .05, [1, 2.003])); },
    outro(K) { const { V, dest, t } = K; [7, 4, 2, 0].forEach((d, i) => V.metal(dest, t + i * .26, K.mtof(K.note(d, 1)), 2.6, .05, [1, 2.003])); }
  };
  return { base: mine, deep, get bonus() { return deep; }, stingers };
}

/* ---------- the shell hooks ---------- */
function paintIdle() { idleOn = true; resetLanes(); LA.active = true; LB.active = false; LA.st = { load: 0, mult: 1, shields: 0, lanterns: 0 }; hudShown.load = -1; hudShown.mult = -1; stakeNow = S.bet(); hudAll(true); hudPos(30, 0); idleScene(); }
function idleScene() {
  [[LA, 1, 'nugget', 1100], [LA, 2, 'g3', 1420], [LA, 3, 'hat', 1760], [LA, 4, 'tnt', 2080]].forEach(([L, i, spr, x0]) => {
    const it = { type: spr, spr: SPR[spr], x0: x0 - L.cx - COLLECT + L.dist, dx: 0, dy: 0, live: false, n: null, i }; L.items.push(it); });
  LA.ns = 0; kick(); paintLayers(LA.dist, LB.dist);
  // spawn them statically (one frame of the loop is enough)
  const L = LA; while (L.ns < L.items.length) { if (spawn(L, L.items[L.ns])) L.ns++; else break; }
}
return {
  music: musicDefs,
  sfx(kit) {
    const { ctx, bus, env, osc, noise, metal, st, T0 } = kit;
    const E4 = 329.63, PM = [0, 2, 3, 5, 7, 8, 10], N = k => E4 * st(PM[((k % 7) + 7) % 7] + 12 * Math.floor(k / 7)) / 2;
    const ting = (f, t, v = .1, d = 1.4) => { metal(f, t, d, v, [1, 2.003, 3.97]); noise(t, .03, v * .3, 'highpass', 6500, 0, .7, .001); };
    const clank = (t, v = 1) => { metal(420, t, .5, .12 * v, [1, 2.76, 5.4]); noise(t, .05, .2 * v, 'bandpass', 2400, 1200, 1.4, .001); osc('sine', 140, t, .12, .2 * v, .002, 70); };
    const boomF = (t, v = 1, big) => { osc('sine', 110, t, big ? 1.1 : .6, .5 * v, .003, 30); noise(t, big ? .8 : .45, .3 * v, 'lowpass', 1800, 150, .8, .002); };
    return {
      ui: () => { const t = T0(); ting(N(9), t, .05, .5); }, tap: () => { const t = T0(); ting(N(10), t, .05, .4); },
      hit: () => { const t = T0(); noise(t, .07, .12, 'highpass', 3500, 7000, .7); ting(N(11), t, .06, .5); },
      spin: () => { const t = T0(); noise(t, .5, .1, 'lowpass', 500, 200, .9, .1); osc('sine', 80, t, .4, .14, .05, 50); clank(t + .15, .4); },
      pick: k => { const t = T0(); ting(N(10 + k), t, .09, 1.2); if (k > 1) ting(N(14 + k), t + .06, .06, 1); noise(t, .06, .08, 'highpass', 5000, 0, .6, .001); },
      gemPick: (v, m) => { const t = T0(), b = 9 + Math.min(8, Math.floor(m / 4)); ting(N(b), t, .11, 1.6); ting(N(b + 2), t + .07, .08, 1.6); ting(N(b + 4), t + .14, .07, 1.6); },
      gemAdd: m => { const t = T0(), b = 10 + Math.min(9, Math.floor(m / 3)); ting(N(b), t, .1, 1.8); ting(N(b + 3), t + .06, .06, 1.4); osc('sine', 300 + Math.min(600, m * 14), t, .12, .08, .004, 700); },
      hatOn: () => { const t = T0(); clank(t, .7); ting(N(9), t + .05, .06, 1.2); ting(N(12), t + .1, .06, 1.2); },
      tntBlock: () => { const t = T0(); boomF(t, .7); clank(t + .02, 1.2); },
      crash: () => { const t = T0(); boomF(t, 1.2, true); noise(t + .1, .7, .15, 'bandpass', 900, 300, 1, .01); for (let i = 0; i < 5; i++) clank(t + .25 + i * .11, .35 - i * .05); osc('sine', 180, t + .5, .8, .12, .01, 60); },
      lantern: n => { const t = T0(); ting(N(12 + n * 2), t, .09, 2); ting(N(12 + n * 2) * 1.5, t + .05, .05, 1.6); },
      fork: () => { const t = T0(); noise(t, .6, .05, 'bandpass', 600, 1800, 1.2, .2); ting(N(8), t + .1, .05, .8); ting(N(11), t + .3, .05, .8); },
      lever: () => { const t = T0(); clank(t, .9); osc('square', 90, t + .05, .08, .12, .002, 60); noise(t + .08, .05, .12, 'highpass', 3000, 0, .8, .001); },
      door: () => { const t = T0(); osc('sine', 80, t, 1, .3, .01, 40); [0, 2, 4, 5, 7, 9].forEach((n, i) => ting(N(9 + n), t + .15 + i * .09, .09, 2.2)); noise(t, .8, .08, 'bandpass', 800, 3200, 1, .3); },
      jackpot: () => { const t = T0(); osc('sine', 70, t, 1.4, .45, .004, 30); for (let i = 0; i < 9; i++) ting(N(8 + i * 1.3 | 0), t + .2 + i * .08, .1, 2.6); },
      descend: () => { const t = T0(); noise(t, 1.2, .12, 'bandpass', 2400, 200, 1.1, .3); osc('sine', 120, t, 1.2, .3, .1, 38); for (let i = 0; i < 4; i++) clank(t + .2 + i * .22, .25); },
      bonus: () => { const t = T0(); osc('sine', 70, t, 1.2, .4, .01, 34); noise(t, 1.1, .1, 'bandpass', 2000, 180, 1.2, .3); [0, 2, 4, 5, 7, 9].forEach((n, i) => ting(N(8 + n), t + .5 + i * .09, .09, 2.4)); },
      outro: () => { const t = T0(); [7, 5, 3, 0].forEach((n, i) => ting(N(8 + n), t + i * .2, .08, 2.4)); },
      big: lv => { const t = T0(); for (let i = 0; i < lv + 3; i++) ting(N(8 + i * 2), t + .3 + i * .15, .09, 2.4); for (let i = 0; i < 2 + lv; i++) { boomF(t + i * .3, .6); } },
      tick: k => { const t = T0(); osc('triangle', 650 + k * 900, t, .05, .08, .001); ting(1500 + k * 1200, t, .025, .3); },
      feverOn: () => { const t = T0(); clank(t, .8); clank(t + .15, .8); ting(N(11), t + .2, .07, 1.4); ting(N(14), t + .3, .07, 1.4); }
    };
  },
  ambience(kit) {
    const { ctx, metal } = kit; const bed = kit.bed({ lowpass: 420, gain: .32, level: .02, loopSec: 5 });
    let tm = 0, run = false;
    const drip = () => { if (!run) return; if (!S.isTurbo()) { const t = ctx.currentTime + .02, f = [1568, 1760, 2093, 2349][Math.floor(Math.random() * 4)]; metal(f, t, 1.4, .012, [1, 2.003]); } tm = setTimeout(drip, 5000 + Math.random() * 9000); };
    return { start() { run = true; bed.start(); clearTimeout(tm); tm = setTimeout(drip, 3000); }, stop() { run = false; clearTimeout(tm); bed.stop(); } };
  },
  particleColor: (p, a) => p.c ? `rgba(255,${226 + (p.l % 20)},150,${a})` : `rgba(255,${150 + (p.l % 50)},${50 + (p.l % 30)},${a})`,
  splashArt: kind => `<svg class="rrs rrSplash" viewBox="0 0 600 520"><use href="#${kind === 'intro' ? 'rrSplashDeep' : 'rrSplashOutro'}"/></svg>`,
  init() {
    const g = $('grid'); g.appendChild(LA.w); g.appendChild(LB.w); LB.w.style.display = 'none';
    $('fxl').insertAdjacentHTML('beforeend', '<div id="rrBanner"><b></b><small></small></div>');
    $('hGear').insertAdjacentHTML('beforeend', '<div id="rrCarts">' + [1, 2, 3].map(() => '<svg class="rrs rrCI" style="width:50px;height:49px"><use href="#rrCartRide"/></svg>').join('') + '</div>');
    bindLayers(); paintLayers(0, 0);
  },
  paintIdle,
  roundStart() { EP++; killTimers(); inBonus = false; lastCart = 0; stakeNow = S.bet(); $('hud').classList.remove('bonus', 'twin'); H.dl.textContent = 'DEPTH'; curR = null; },
  async clearBoard() {
    if (inBonus) return;
    LANES.forEach(L => L.live.forEach(it => { if (it.n && !it.fly) { const n = it.n; it.fly = true; anim(n, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 * T(), fill: 'forwards' }); } }));
    await wait(240); if (inBonus) return; resetLanes(); idleOn = false; $('scene').classList.remove('twin'); LB.w.style.display = 'none';
  },
  restoreBoard() { EP++; killTimers(); LANES.forEach(L => { L.go = false; L.res = null; }); inBonus = false; $('scene').classList.remove('twin'); paintIdle(); },
  baseSpin: R => { curR = R; return { runs: R.runs, base: true }; },
  playSpin: (sp, run, ctx) => sp.runs ? baseSpin(sp, run, ctx) : segSpin(sp, run, ctx),
  async showTrigger(R) {
    curR = R; const ep = EP; const L = LA; setCart(L, 'Cheer'); sfx.bonus(); [1, 2, 3].forEach(i => $('hl' + i).classList.add('on'));
    say('3 LANTERNS! DEEP SHAFT', true); banner('DEEP SHAFT', '3 CARTS · 3 LEVELS', 1500, true); embers(60, innerWidth / 2, innerHeight / 2, true); await wait(1500); if (ep !== EP) return;
  },
  bonusMode(on) {
    inBonus = on; const hud = $('hud'); hud.classList.toggle('bonus', on); hud.classList.remove('twin');
    if (on) {
      const B = curR && curR.bonus || {}; resetLanes(); twinOn = false; $('scene').classList.remove('twin'); LB.w.style.display = 'none'; LB.active = false; lastCart = 0; curLv = 0;
      setLevel(B.startLevel || 1); LA.st = { load: 0, mult: B.startMult || 1, shields: B.startShields || 0, lanterns: 0 }; LA.active = true; setCart(LA, baseCart(LA)); setDome(LA); H.dl.textContent = 'LEVEL ' + (B.startLevel || 1);
      hudShown.load = -1; hudShown.mult = -1; hudAll(true); hudPos(100 * (B.startLevel || 1), 0); setCarts(1, false); S.music.intensity(.35);
    } else {
      resetLanes(); setLevel(1); H.dl.textContent = 'DEPTH'; LA.st = { load: 0, mult: 1, shields: 0, lanterns: 0 }; hudShown.load = -1; hudShown.mult = -1; hudAll(true); hudPos(30, 0); idleOn = true; idleScene(); S.music.intensity(0);
    }
  }
};
});
