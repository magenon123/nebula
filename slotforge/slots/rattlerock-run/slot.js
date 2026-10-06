/* Rattlerock Run. Client for the mine-cart ride; the shared shell (shell/slot-shell.js) calls these hooks.
 * Pure renderer: the engine returns the whole round (round.runs[] for the base ride / Twin Carts, round.bonus.spins[] = one level attempt per entry);
 * nothing here decides an outcome. Format: plans/rattlerock-run-round-format.md, art: slots/rattlerock-run/ART-NOTES.md.
 * Motion: ONE requestAnimationFrame loop advances a "distance" per lane; the parallax layers and every pickup are placed from that distance
 * with translate3d only (the stops timeline and the scenery can never drift apart). Pickup nodes come from a pool of 16. */
/*KAI-CSS*/
const KAI_CSS = `

/* ===== KAI: client styles (only transform/opacity animation; no filters on moving parts) ===== */
#fsBox{display:none!important}
#grid .rrW{position:absolute;left:0;top:0;will-change:transform}
.rrW .rrCart{left:0;top:0}
.rrW .rrSpk{display:none;animation:rrFlick .1s steps(2) infinite alternate}
.rrW.mv .rrSpk{display:block}
body.lite .rrW .rrSpk{display:none!important}
.rrW .rrCart.bounce{animation:none}
.rrW.mv .rrCart.bounce{animation:rrBounce .34s ease-in-out infinite alternate}
body.lite .rrW.mv .rrCart.bounce{animation-duration:.5s}
#grid .rrI{position:absolute;left:0;top:0;will-change:transform}
.rrBoom{position:absolute;left:0;top:0;overflow:visible;will-change:transform}
#hud .hc.rrBump b{animation:rrPop .45s ease-out}
#hud .hc b.two{font-size:25px}
#hMult.rrWin b{color:#fff6c0}
.rrTag{position:absolute;transform:translate(-50%,-50%);font-family:var(--toon,RRNum),RRNum,sans-serif;font-size:34px;line-height:1;color:#ffe08a;white-space:nowrap;pointer-events:none;text-shadow:2px 3px 0 #1c0f08,-2px -2px 0 #1c0f08,2px -2px 0 #1c0f08,-2px 2px 0 #1c0f08;will-change:transform,opacity}
.rrTag.gem{color:#9fe8ff}.rrTag.crash{color:#ff8a6a;font-size:42px}.rrTag.big{font-size:56px;color:#fff1a8}
#rrBanner{position:absolute;left:800px;top:330px;transform:translate(-50%,-50%);opacity:0;text-align:center;pointer-events:none;font-family:var(--toon,RRNum),RRNum,sans-serif;z-index:7}
#rrBanner b{display:block;font-weight:400;font-size:84px;line-height:1;letter-spacing:3px;color:#ffe08a;text-shadow:4px 5px 0 #1c0f08,-3px -3px 0 #1c0f08,3px -3px 0 #1c0f08,-3px 3px 0 #1c0f08}
#rrBanner.big b{font-size:112px;color:#fff1a8}
#rrBanner small{display:block;margin-top:6px;font-size:34px;letter-spacing:2px;color:#fff;text-shadow:3px 3px 0 #1c0f08,-2px -2px 0 #1c0f08,2px -2px 0 #1c0f08,-2px 2px 0 #1c0f08}
#rrCarts{display:none;align-items:center;gap:2px;margin-left:6px}
#hud.bonus #rrCarts{display:flex}
#hud.bonus .hLans{display:none}
#hud.bonus #hGear{flex-direction:row;gap:6px}
#hud.bonus #hShield{margin-left:4px}
.rrCI{transition:opacity .3s,transform .3s;opacity:.95}
.rrCI.cur{transform:scale(1.14)}
.rrCI.lost{opacity:.2;transform:scale(.8)}

/* ---- clarity: callout plates, stop dots, next-stop ring ---- */
.rrCall{position:absolute;transform:translate(-50%,-50%);padding:6px 22px 8px;border-radius:99px;border:4px solid #1c0f08;background:linear-gradient(#ffe48a,#f0a92a);color:#2a1406;font-family:var(--toon,RRNum),RRNum,sans-serif;font-size:36px;line-height:1;white-space:nowrap;pointer-events:none;box-shadow:0 5px 0 rgba(0,0,0,.45);will-change:transform,opacity;z-index:8}
.rrCall.gem{background:linear-gradient(#bff4ff,#45b4f0)}.rrCall.bad{background:linear-gradient(#ffb09a,#e0402a);color:#fff}.rrCall.good{background:linear-gradient(#c8ffb0,#4fc83a)}
#rrDots{display:flex;gap:4px;margin-top:4px}
#rrDots i{width:11px;height:11px;border-radius:50%;background:#3a2438;border:2px solid #6a3c1c}
#rrDots i.on{background:#ffcf5a;border-color:#ffcf5a}#rrDots i.cur{background:#fff;border-color:#ffd24a;transform:scale(1.35)}
#hud .hc b{white-space:nowrap}
#rrRing{display:none;position:absolute;left:0;top:0;width:180px;height:180px;border-radius:50%;border:6px solid rgba(255,230,120,.85);box-shadow:inset 0 0 0 3px rgba(255,255,255,.25);animation:rrRingP .7s ease-in-out infinite alternate;pointer-events:none;will-change:transform}
@keyframes rrRingP{from{opacity:.35}to{opacity:1}}
body.lite #rrRing{animation:none;opacity:.8}

.rrCall{position:absolute;transform:translate(-50%,-50%);padding:6px 22px 8px;border-radius:99px;border:4px solid #1c0f08;background:linear-gradient(#ffe48a,#f0a92a);color:#2a1406;font-family:var(--toon,RRNum),RRNum,sans-serif;font-size:36px;line-height:1;white-space:nowrap;pointer-events:none;box-shadow:0 5px 0 rgba(0,0,0,.45);will-change:transform,opacity;z-index:8}
.rrCall.gem{background:linear-gradient(#bff4ff,#45b4f0)}.rrCall.bad{background:linear-gradient(#ffb09a,#e0402a);color:#fff}.rrCall.good{background:linear-gradient(#c8ffb0,#4fc83a)}
#rrDots{display:flex;gap:4px;margin-top:4px}
#rrDots i{width:11px;height:11px;border-radius:50%;background:#3a2438;border:2px solid #6a3c1c}
#rrDots i.on{background:#ffcf5a;border-color:#ffcf5a}#rrDots i.cur{background:#fff;border-color:#ffd24a;transform:scale(1.35)}
#hud .hc b{white-space:nowrap}
#rrRing{display:none;position:absolute;left:0;top:0;width:180px;height:180px;border-radius:50%;border:6px solid rgba(255,230,120,.85);box-shadow:inset 0 0 0 3px rgba(255,255,255,.25);animation:rrRingP .7s ease-in-out infinite alternate;pointer-events:none;will-change:transform}
@keyframes rrRingP{from{opacity:.35}to{opacity:1}}
body.lite #rrRing{animation:none;opacity:.8}

/* ---- vertical ride: procedural rails, tunnel mouths ---- */
#scene.rrT .ly-track{display:none}
#rrTrack{position:absolute;left:0;top:0;overflow:visible;will-change:transform;pointer-events:none}
#rrTrack path{fill:none;stroke-linejoin:round}
#rrTrack .rrRail{stroke:#e2e8f4;stroke-width:9}#rrTrack .rrAlt{stroke:#e2e8f4;stroke-width:9}
#rrTrack .rrBar{stroke:#454b60;stroke-width:8}
#rrTrack .rrSlp{stroke:#6e4a2a;stroke-width:20;stroke-dasharray:14 30}
#rrTrack .rrLegs{stroke:#2e2018;stroke-width:9}
.rrW .rrR{position:absolute;left:0;top:0;will-change:transform}
.rrW .rrCart.bounce{transform-origin:50% 98%}
.rrTun{position:absolute;left:0;top:0;border-radius:125px 125px 0 0;background:radial-gradient(ellipse at 50% 70%,#000 35%,#150a10 62%,#3a2a20 100%);box-shadow:inset 0 0 0 8px #4a3524;will-change:transform}

/* ---- articulated cart rig (leo's parts; opacity cross-fades, transforms by JS) ---- */
.rrR .rrSq{position:absolute;left:0;top:0;transform-origin:50% 98%}
.rrR .rrRig{position:absolute;left:0;top:0;transform-origin:0 0}
.rrRig .rg{transition:opacity .16s ease}
.rrRig .rg-scarf,.rrRig .rg-scarf2,.rrRig .rg-scarf3{opacity:0}
.rrRig.f0 .rg-scarf,.rrRig.f1 .rg-scarf2,.rrRig.f2 .rg-scarf3{opacity:1}
.rrRig .rg-headSmile,.rrRig .rg-headCheer,.rrRig .rg-headWorry,.rrRig .rg-headDizzy,.rrRig .rg-headDetermined{opacity:0}
.rrRig.hSmile .rg-headSmile,.rrRig.hCheer .rg-headCheer,.rrRig.hWorry .rg-headWorry,.rrRig.hDizzy .rg-headDizzy,.rrRig.hDetermined .rg-headDetermined{opacity:1}
.rrRig .rg-armFarUp,.rrRig .rg-armUpL{opacity:0}
.rrRig.up .rg-armFarUp,.rrRig.up .rg-armUpL{opacity:1}.rrRig.up .rg-armFar,.rrRig.up .rg-armPoint{opacity:0}
.rrRig .rg-hatGlow{opacity:0}.rrRig.glow .rg-hatGlow{opacity:.9}
.rrRig .rg-beam{opacity:.5}.rrRig .rg-sparkStreak{opacity:0}
.rrW.mv .rrRig .rg-sparkStreak{opacity:1;animation:rrFlick .1s steps(2) infinite alternate}
body.lite .rrW.mv .rrRig .rg-sparkStreak,body.lite .rrRig .rg-beam{display:none}

/* ---- wide windows and phones ---- */
#frame{overflow:visible}
#rrTrackB{position:absolute;left:0;top:0;overflow:visible;display:none;pointer-events:none}
#scene.twin ~ * #rrTrackB,#stage:has(#scene.twin) #rrTrackB{display:block}
#scene .ly-track2{display:none!important}
#rrTrackB .rrSlp{stroke-dasharray:10 21;stroke-width:14}
body.portrait #ga{zoom:1!important;left:0!important;top:calc((var(--H,1950px) - 1950px)/2)!important}
body.portrait #frame,body.portrait #grid,body.portrait #fxl{width:900px;height:1950px}
body.portrait #logo{left:260px;top:215px;width:380px}
body.portrait #hud{left:8px;top:74px;width:884px;height:132px}
body.portrait #hud .hc i{font-size:17px;letter-spacing:2px}
body.portrait #hud .hc b{font-size:44px}
body.portrait #hud .hc b.two{font-size:34px}
body.portrait .rrCall{font-size:46px}
body.portrait .rrTag{font-size:44px}
body.portrait #rrBanner{left:450px;top:520px}
body.portrait #rrBanner b{font-size:84px}
`;
(function () { const st = document.createElement('style'); st.id = 'kaiCss'; st.textContent = KAI_CSS; document.head.appendChild(st); })();
/*END-KAI-CSS*/
SlotShell.boot(SLOT_CFG, S => {
const { $, sfx, wait, T, shake, flash, embers, fmt } = S;
let hintUntil = 0;
const say = (t, h) => { if (performance.now() < hintUntil) return; S.say(t, h); };
const NS = 'http://www.w3.org/2000/svg';
let SPAWN_X = 1780;
const SPX = 360, COLLECT = 150, V0 = 330, POOL = 16;
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
function release(n) { if (!n || n._rel) return; n._rel = 1; n.getAnimations().forEach(a => a.cancel()); n.style.display = 'none'; n.style.opacity = ''; n._rel = 0; if (n._div) dpool.push(n); else { liveN--; pool.push(n); } }
const dpool = []; let dN = 0;
function acqDiv() { if (dN >= 4 && !dpool.length) return null; let n = dpool.pop(); if (!n) { n = document.createElement('div'); n._div = 1; n.className = 'rrTun'; $('grid').insertBefore(n, LA.w); dN++; } n.style.display = 'block'; n.style.opacity = ''; return n; }

/* ---------- lanes: A = near lane (rail 718), B = Twin Carts lane (rail 488, scale .72) ---------- */
function mkLane(id, rail, k, cx) {
  const L = { id, rail, k, cx, dist: 0, v: 0, go: false, target: 0, ease: false, res: null, items: [], live: [], ns: 0, st: { load: 0, mult: 1, shields: 0, lanterns: 0 }, ramp: 1, crashed: false, cartSt: 'Ride', cheerT: 0 };
  const w = document.createElement('div'); w.className = 'rrW'; const cw = 400 * k, ch = 390 * k;
  w.style.cssText = `width:${cw}px;height:${ch}px;left:${cx - 200 * k}px;top:${rail - 387 * k}px`;
  w.innerHTML = `<div class="rrR" style="width:${cw}px;height:${ch}px;transform-origin:${200 * k}px ${384 * k}px"><div class="rrSq" style="width:${cw}px;height:${ch}px">${rigHTML()}</div><svg class="rrs rrCart rrDome" style="width:${cw}px;height:${ch}px;display:none"><use href="#rrShieldDome"/></svg></div>`;
  L.w = w; L.r = w.firstChild; L.cy = rail; L.cam = 0; L.rot = 0; L.cart = L.r.children[0]; L.dome = L.r.children[1]; L.rg = rigRefs(L.cart.firstChild, k); L.dome.style.opacity = 1; L.boom = document.createElementNS(NS, 'svg'); L.boom.setAttribute('class', 'rrs rrBoom'); L.boom.innerHTML = '<use href="#rrBoom1"/>'; L.boom.style.display = 'none';
  return L;
}
let RAIL0 = 600, PORT = false;
const LA = mkLane('A', RAIL0, 1, 340), LB = mkLane('B', 488, .72, 790);
const LANES = [LA, LB];
function geom() {
  PORT = document.body.classList.contains('portrait'); RAIL0 = PORT ? 1210 : 600;
  LA.rail = RAIL0; LA.cx = PORT ? 250 : 340; LB.rail = PORT ? RAIL0 - 230 : 488; LB.cx = PORT ? 600 : 790; LB.cy = LB.rail;
  for (const L of LANES) { L.w.style.left = (L.cx - 200 * L.k) + 'px'; L.w.style.top = (L.rail - 387 * L.k) + 'px'; }
  const vw = PORT ? 900 : Math.max(1600, innerWidth / (S.scale() || 1)); SPAWN_X = Math.round(vw + (PORT ? 120 : (vw - 1600) / 2 + 180)); trk.ox = null; if (lay) bindLayers(); if (trkB.svg) trkB.svg.style.top = (LB.rail + 2) + 'px';
}
window.__rr = { LA, LB, ep: () => EP };   // test handle
function RGS(c, id) { return `<svg class="rg rg-${c}"><use href="#rrRig${id}"/></svg>`; }
function rigHTML() {
  return '<div class="rrRig hSmile f0">' + RGS('shadow', 'Shadow') + RGS('wheelB', 'WheelB') + RGS('wheelF', 'WheelF') + RGS('body', 'Body') + RGS('load', 'Load') + '<div class="rg-upper">' + RGS('beam', 'Beam') + RGS('scarf', 'Scarf') + RGS('scarf2', 'Scarf2') + RGS('scarf3', 'Scarf3') + RGS('armFar', 'ArmFar') + RGS('armFarUp', 'ArmFarUp') + RGS('torso', 'Torso') +
    ['Smile', 'Cheer', 'Worry', 'Dizzy', 'Determined'].map(h => RGS('head' + h, 'Head' + h)).join('') + RGS('armPoint', 'ArmPoint') + RGS('armUpL', 'ArmUpL') + RGS('hatGlow', 'HatGlow') + '</div>' + RGS('rim', 'Rim') + RGS('loadFront', 'LoadFront') + RGS('gloveRim', 'GloveRim') + RGS('sparkStreak', 'SparkStreak') + '</div>';
}
function rigRefs(root, k) { const q = c => root.querySelector('.rg-' + c); root.style.transform = `scale(${k})`; return { root, k, wB: q('wheelB'), wF: q('wheelF'), up: q('upper'), shadow: q('shadow'), load: q('load'), ph: 0, wa: -99, lean: 0, fr: 0, bob: 0 }; }
const HEADS = ['hSmile', 'hCheer', 'hWorry', 'hDizzy', 'hDetermined'], POSE = { Ride: ['hSmile', 0], Shield: ['hDetermined', 0], Cheer: ['hCheer', 1], Win: ['hCheer', 1], Crash: ['hDizzy', 1], Worry: ['hWorry', 0] };
function setCart(L, st) { L.cartSt = st; const p = POSE[st] || POSE.Ride, c = L.rg.root.classList; HEADS.forEach(h => c.toggle(h, h === p[0])); c.toggle('up', !!p[1]); c.toggle('glow', L.st.shields > 0 && st !== 'Crash'); }
/* continuous cart motion, per frame: wheels turn with the scroll, suspension bob and pitch tied to speed, torso counter-bob, scarf frames, lean on acceleration */
function rigMotion(L, dt) {
  const g = L.rg, mv = L.go || (L.v > 20 && !L.crashed), sp = Math.min(1.4, L.v / 330);
  const wa = Math.round((L.dist * 360 / 207) % 360 / 3) * 3; if (wa !== g.wa) { g.wa = wa; const t = `rotate(${wa}deg)`; g.wB.style.transform = t; g.wF.style.transform = t; }
  if (!L.crashed && mv) { g.ph += dt * (7 + 9 * sp); const y = Math.sin(g.ph) * (1 + 2.6 * sp), tl = sp * 2.2 + Math.sin(g.ph * .5) * .5;
    g.lean += ((L.go && !L.ease ? 1 : 0) * 3.5 * sp - g.lean) * Math.min(1, dt * 4);
    g.root.style.transform = `translate3d(0,${y.toFixed(2)}px,0) scale(${g.k})`; g.up.style.transform = `translate3d(0,${(-y * .45).toFixed(2)}px,0) rotate(${(g.lean + tl * .3).toFixed(2)}deg)`; g.load.style.transform = `translateY(${(y * .3).toFixed(2)}px)`;
    const f = Math.floor(g.ph / 1.7) % 3; if (f !== g.fr) { g.fr = f; const c = g.root.classList; c.toggle('f0', f === 0); c.toggle('f1', f === 1); c.toggle('f2', f === 2); } }
}
function _unusedSetCart(L, st) { }
function baseCart(L) { return L.crashed ? 'Crash' : L.st.shields > 0 ? 'Shield' : 'Ride'; }
function cheer(L, ms = 650) { if (L.crashed) return; setCart(L, 'Cheer'); clearTimeout(L.cheerT); L.cheerT = after(ms, () => { if (!L.crashed && L.cartSt === 'Cheer') setCart(L, baseCart(L)); }); }
function setDome(L) { L.dome.style.display = L.st.shields > 0 && !L.crashed ? 'block' : 'none'; }


/* ---------- terrain: the track is a procedural path y = RAIL0 - TH(u); everything is a deterministic function of the round's stops ---------- */
const TER = { feat: [], gaps: [], forks: [], p1: .7, p2: 2.1 };
const sstep = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const hBase = u => 34 * Math.sin(u / 330 + TER.p1) + 22 * Math.sin(u / 151 + TER.p2);
const prof = (f, u) => { const t = (u - f.x) / 1000; return t <= 0 || t >= 1 ? 0 : Math.pow(Math.sin(Math.PI * t), .9); };
function TH(u) {
  let h = hBase(u);
  for (const f of TER.feat) {
    if (f.t === 'bump') { const d = (u - f.x) / f.w; if (d > -3 && d < 3) h += f.a * Math.exp(-d * d); }
    else if (f.t === 'ramp') { if (u <= f.x) h += f.a * sstep((u - (f.x - 260)) / 260); }
    else if (f.t === 'fork') h += f.sg * 140 * prof(f, u);
    else if (f.t === 'door') h -= 120 * sstep((u - (f.x - 1100)) / 1000);
    else if (f.t === 'ease') h += f.a * (u <= f.x ? 1 : 1 - sstep((u - f.x) / 600));
  }
  return h;
}
function Hc(u) {   // the cart's height: the track, or the ballistic arc inside a ramp gap
  for (const g of TER.gaps) if (u > g.a && u < g.b) { const t = (u - g.a) / (g.b - g.a); return (1 - t) * TH(g.a) + t * TH(g.b) + g.A * 4 * t * (1 - t); }
  return TH(u);
}
const inGap = u => { for (const g of TER.gaps) if (u > g.a && u < g.b) return true; return false; };
function buildTerrain(L, stops, base) {
  const uc = L.dist - COLLECT, hPrev = Hc(uc), xs = []; let extra = 0;
  TER.feat = []; TER.gaps = []; TER.forks = [];
  stops.forEach(s => {
    const x = base + s.at / 100 * SPX + extra; xs.push(x);
    if (s.type === 'gem') { const A = 110 + 15 * s.value; TER.feat.push({ t: 'ramp', x: x - 180, a: 64 }); TER.gaps.push({ a: x - 180, b: x + 180, A }); extra += 140; }
    else if (s.type === 'gold') TER.feat.push({ t: 'bump', x, w: 120, a: 26 + 9 * goldTier(s.value) });
    else if (s.type === 'tnt') TER.feat.push({ t: 'bump', x, w: 170, a: -78 });
    else if (s.type === 'fork') { const f = { t: 'fork', x, sg: s.side === 'left' ? 1 : -1 }; TER.feat.push(f); TER.forks.push(f); extra += 300; }
    else if (s.type === 'door') TER.feat.push({ t: 'door', x });
  });
  TER.feat.push({ t: 'ease', x: uc, a: hPrev - TH(uc) }); trk.ox = null;
  return xs;
}
/* the rails: 6 path elements in one svg, rebuilt when the cart leaves the current 3400 px window */
const trk = { ox: null, svg: null, p: {} };
function mkTrack() {
  const sv = document.createElementNS(NS, 'svg'); sv.setAttribute('id', 'rrTrack'); sv.setAttribute('width', 10); sv.setAttribute('height', 10);
  const mk = (cls, extra) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('class', cls); if (extra) p.setAttribute('transform', extra); sv.appendChild(p); return p; };
  trk.svg = sv; trk.p = { legs: mk('rrLegs'), alt: mk('rrAlt'), altS: mk('rrSlp', 'translate(0,8)'), slp: mk('rrSlp', 'translate(0,8)'), bar: mk('rrBar', 'translate(0,13)'), rail: mk('rrRail') };
  trk.p.altS.setAttribute('class', 'rrSlp'); trk.p.altS.style.opacity = .85; $('grid').insertBefore(sv, $('grid').firstChild);
}
const trkB = { svg: null, p: null };
function mkTrackB() {
  const sv = document.createElementNS(NS, 'svg'); sv.setAttribute('id', 'rrTrackB'); sv.setAttribute('width', 10); sv.setAttribute('height', 10);
  sv.innerHTML = '<path class="rrSlp" d="M-1400 7H3400" transform="translate(0,6) scale(1,.72)"/><path class="rrBar" d="M-1400 9H3400" stroke-width="6"/><path class="rrRail" d="M-1400 0H3400" stroke-width="7"/><path class="rrLegs" d="" />';
  trkB.svg = sv; trkB.p = sv.firstChild; $('grid').insertBefore(sv, LA.w);
}
function paintTrackB() { if (!twinOn || !trkB.svg) return; const o = -(LB.dist * .72 % 31); if (trkB.o !== o) { trkB.o = o; trkB.p.style.strokeDashoffset = o; } }
function drawTrack(ox) {
  trk.ox = ox; const TW = 3400, st = 30; let d = '', legs = '', prev = false;
  for (let u = ox; u <= ox + TW; u += st) {
    if (inGap(u)) { prev = false; continue; }
    const x = (u - ox).toFixed(0), y = (RAIL0 - TH(u)).toFixed(1); d += (prev ? 'L' : 'M') + x + ' ' + y; prev = true;
    if (((u - ox) / st) % 4 === 0) legs += `M${x} ${(+y + 10).toFixed(0)}V${(+y + 650).toFixed(0)}`;
  }
  let alt = '';
  for (const f of TER.forks) if (f.x + 1000 > ox && f.x < ox + TW) { let first = true; for (let u = f.x; u <= f.x + 1000; u += st) { const h = TH(u) - 2 * f.sg * 140 * prof(f, u); alt += (first ? 'M' : 'L') + (u - ox).toFixed(0) + ' ' + (RAIL0 - h).toFixed(1); first = false; } }
  trk.p.rail.setAttribute('d', d); trk.p.bar.setAttribute('d', d); trk.p.slp.setAttribute('d', d); trk.p.legs.setAttribute('d', legs); trk.p.alt.setAttribute('d', alt); trk.p.altS.setAttribute('d', alt);
}

/* ---------- scenery layers: placed from the lane distance (CSS animations are switched off) ---------- */
let lay = null, curLv = 1;
function bindLayers() {
  const q = s => document.querySelector('#scene ' + s);
  const x = PORT ? '-p' : ''; lay = { far: q('.ly-far' + x + '.L' + curLv), fm: q('.ly-farmid' + x + '.L' + curLv), mid: q('.ly-mid' + x + '.L' + curLv), tr: q('.ly-track' + x + '.L' + curLv), near: q('.ly-near' + x + '.L' + curLv), t2: q('.ly-track2'), last: [null, null, null, null, null] };
  document.querySelectorAll('#scene .ly-far,#scene .ly-farmid,#scene .ly-mid,#scene .ly-track,#scene .ly-near,#scene .ly-track2,#scene .ly-far-p,#scene .ly-farmid-p,#scene .ly-mid-p,#scene .ly-track-p,#scene .ly-near-p').forEach(e => { e.style.animation = 'none'; });
}
function paintLayers(dA, dB) {
  const l = lay, c = LA.cam || 0, v = [(dA * .06) % 1600, (dA * .22) % 1600, dA % 1600, (dA * 1.5) % 1600, (dB * .72) % 1152], cy = Math.round(c * 10) / 10;
  if (l.last[0] !== v[0] || l.cy !== cy) { l.fm.style.transform = `translate3d(${-v[0]}px,${(cy * .18).toFixed(1)}px,0)`; l.far.style.transform = `translate3d(0,${(cy * .08).toFixed(1)}px,0)`; l.mid.style.transform = `translate3d(${-v[1]}px,${(cy * .4).toFixed(1)}px,0)`; l.near.style.transform = `translate3d(${-v[3]}px,${cy}px,0)`; l.tr.style.transform = `translate3d(${-v[2]}px,${cy}px,0)`; l.last[0] = v[0]; l.cy = cy; }
  if (l.last[4] !== v[4]) { l.last[4] = v[4]; l.t2.style.transform = `translate3d(${-v[4]}px,-230px,0) scale(.72)`; }
}
function setLevel(n) { if (lay) lay.cy = null; curLv = n; const sc = $('scene'); sc.classList.remove('lv1', 'lv2', 'lv3'); sc.classList.add('lv' + n); bindLayers(); paintLayers(LA.dist, LB.dist); }

/* ---------- the loop ---------- */
let raf = 0, lastT = 0, ring = null;
function kick() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(tick); } }
function place(it, L) { const x = L.cx + L.k * (it.x0 - L.dist + COLLECT) + it.dx - it.ox, y = it.top + L.cam; if (x !== it._x || y !== it._y) { it._x = x; it._y = y; it.y = y; it.n.style.transform = `translate3d(${x}px,${y}px,0)`; } }
function layout(L, it) {      // static vertical placement from the terrain (screen y = top + camera)
  const hv = (it.spr.hv || 0) * L.k + (it.air || 0);
  it.h0 = it.h0fix != null ? it.h0fix : (L === LA ? Hc(it.x0) : 0);
  it.top = it.spr.id === 'rrDoor' ? L.rail - it.h * (330 / 350) - it.h0 : L.rail + 24 * L.k - hv - it.h - it.h0 + (it.dy || 0);
  if (it.kind === 'div') it.top = L.rail + 14 - it.h - it.h0;
}
function spawn(L, it) {
  if (!it.spr) it.spr = SPR.nugget; const dv = it.kind === 'div', n = dv ? acqDiv() : acquire(); if (!n) return false; it.n = n; const k = L.k * (it.sc || 1);
  if (!dv) n._u.setAttribute('href', '#' + it.spr.id);
  it.w = it.spr.w * k; it.h = it.spr.h * k; n.style.width = it.w + 'px'; n.style.height = it.h + 'px'; n.style.opacity = it.alpha == null ? '' : it.alpha; it.ox = it.w * .5;
  layout(L, it); it._x = null; it._y = null; it.live = true; L.live.push(it); place(it, L);
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
    if (L.dq) while (L.dns < L.dq.length) { const it = L.dq[L.dns]; if (L.cx + L.k * (it.x0 - L.dist + COLLECT) + it.dx < SPAWN_X) { if (spawn(L, it)) L.dns++; else break; } else break; }
    while (L.ns < L.items.length) { const it = L.items[L.ns]; if (L.cx + L.k * (it.x0 - L.dist + COLLECT) + it.dx < SPAWN_X) { if (spawn(L, it)) L.ns++; else break; } else break; }
    if (L.live.length) { let j = 0; for (let i = 0; i < L.live.length; i++) { const it = L.live[i]; if (!it.live) continue; if (it.n && L.cx + L.k * (it.x0 - L.dist + COLLECT) + it.dx < -420) { it.live = false; release(it.n); it.n = null; continue; } if (it.n && !it.fly) place(it, L); L.live[j++] = it; } L.live.length = j; }
  }
  const sett = rideCam(dt); paintTrackB(); rigMotion(LA, dt); if (LB.active) rigMotion(LB, dt);
  paintLayers(LA.dist, LB.dist);
  if (ring) { const it = LA.next != null && LA.active ? LA.items[LA.next] : null; if (it && it.live && it.n && !it.fly && it.type !== 'door') { const x = LA.cx + (it.x0 - LA.dist + COLLECT) + it.dx, y = it.y + it.h * .5; ring.style.display = 'block'; ring.style.transform = `translate3d(${x - 90}px,${y - 90}px,0)`; } else if (ring.style.display !== 'none') ring.style.display = 'none'; }
  for (const L of LANES) if (L._mv !== L.go) { L._mv = L.go; L.w.classList.toggle('mv', L.go); }
  if (any || sett) raf = requestAnimationFrame(tick);
}
/* camera + cart pose + rails, once per frame (lane A only; the twin lane stays flat) */
function rideCam(dt) {
  const L = LA, uc = L.dist - COLLECT, hc = Hc(uc), ht = TH(uc + 140);
  if (trk.ox === null || uc - trk.ox > 1300 || uc < trk.ox + 500) { drawTrack(Math.floor((uc - 900) / 600) * 600); }
  const tgt = Math.max(-80, Math.min(150, .62 * ht)), k = Math.min(1, dt * 3.2); L.cam += (tgt - L.cam) * k; if (Math.abs(L.cam) < .01) L.cam = 0;
  const sl = (Hc(uc + 34) - Hc(uc - 34)) / 68, rt = -Math.atan(sl) * 57.3 * .9, ky = Math.min(1, dt * 11); L.rot += (rt - L.rot) * ky;
  const yOff = L.cam - hc; L.cy = RAIL0 + yOff;
  if (L._y !== yOff || L._r !== L.rot) { L._y = yOff; L._r = L.rot; L.r.style.transform = `translate3d(0,${yOff.toFixed(1)}px,0) rotate(${L.rot.toFixed(2)}deg)`; }
  const tx = (L.cx + trk.ox - uc).toFixed(1), ty = L.cam.toFixed(1); if (trk.tx !== tx || trk.ty !== ty) { trk.tx = tx; trk.ty = ty; trk.svg.style.transform = `translate3d(${tx}px,${ty}px,0)`; }
  return Math.abs(tgt - L.cam) > .4 || Math.abs(rt - L.rot) > .15;
}
function travel(L, to, ease) { L.target = Math.max(to, L.dist); L.ease = !!ease; L.go = true; kick(); return new Promise(r => { L.res = r; }); }
function freeItems(L) { L.live.forEach(it => { it.live = false; if (it.n) release(it.n); it.n = null; }); L.live = []; L.items = []; L.ns = 0; L.dq = []; L.dns = 0; }

/* ---------- HUD ---------- */
const H = { depth: $('hDepthV'), dist: $('hDistV'), mult: $('hMultV'), load: $('hLoadV'), shN: $('hShieldN'), sh: $('hShield'), mc: $('hMult'), dl: $('hDepth').querySelector('i') };
const bump = id => { const e = $(id); e.classList.remove('rrBump'); void e.offsetWidth; e.classList.add('rrBump'); setTimeout(() => e.classList.remove('rrBump'), 480 * T()); };
const tw = new WeakMap();
function cnt(el, from, to, ms, f) {
  const id = (tw.get(el) || 0) + 1; tw.set(el, id); if (from === to || ms <= 0) { el.textContent = f(to); return Promise.resolve(); }
  return new Promise(res => { const t0 = performance.now(); (function s(t) { if (tw.get(el) !== id) return res(); const k = Math.min(1, (t - t0) / (ms * T())); el.textContent = f(from + (to - from) * (1 - Math.pow(1 - k, 3))); k < 1 ? requestAnimationFrame(s) : res(); })(t0); });
}
let stakeNow = 1; const hudShown = { load: 0, mult: 1, eq: 0 };
const mon = x => fmt(stakeNow * x), xs = x => 'x' + Math.round(x);
const laneSum = (key) => LANES.reduce((a, L) => a + (L.active ? L.st[key] : 0), 0);
function hudAll(snapNow) {   // writes the HUD from the lane states (twin: sums / pair)
  const act = LANES.filter(L => L.active); if (!act.length) act.push(LA);
  const load = act.reduce((a, L) => a + L.st.load, 0), mult = Math.max(...act.map(L => L.st.mult)), sh = act.reduce((a, L) => a + L.st.shields, 0), lan = Math.max(...act.map(L => L.st.lanterns));
  if (load !== hudShown.load) { cnt(H.load, hudShown.load, load, snapNow ? 0 : 420, mon); hudShown.load = load; bump('hLoad'); }
  if (act.length > 1) { H.mult.textContent = act.map(L => xs(L.st.mult)).join(' | '); hudShown.mult = mult; H.mult.classList.add('two'); }
  else { H.mult.classList.remove('two'); if (mult !== hudShown.mult) { cnt(H.mult, hudShown.mult, mult, snapNow ? 0 : 520, xs); hudShown.mult = mult; bump('hMult'); } }
  const eq = act.reduce((a, L) => a + L.st.load * L.st.mult, 0); if (eq !== hudShown.eq) { cnt(H.dist, Math.max(0, hudShown.eq), eq, snapNow ? 0 : 520, mon); hudShown.eq = eq; bump('hDist'); }
  H.mc.style.setProperty('--p', Math.min(1, (mult - 1) / 60)); H.shN.textContent = sh; H.sh.classList.toggle('on', sh > 0);
  for (let i = 1; i <= 3; i++) $('hl' + i).classList.toggle('on', i <= lan);
}
function hudDots(n) { const d = $('rrDots'); d.innerHTML = '<i></i>'.repeat(n); d._n = n; d._c = 0; }
function hudStop(i, n) { H.depth.textContent = i + '/' + n; const d = $('rrDots'); if (d._n !== n) hudDots(n); const k = d.children; for (let j = 0; j < k.length; j++) k[j].className = j < i - 1 ? 'on' : j === i - 1 ? 'cur' : ''; }
function hudPos() {}
function hudReset(start) {
  const o = start || {}; LA.st = { load: 0, mult: o.mult || 1, shields: o.shields || 0, lanterns: 0 }; LB.st = { load: 0, mult: 1, shields: 0, lanterns: 0 }; LA.active = true; LB.active = false;
  hudShown.load = -1; hudShown.mult = -1; hudShown.eq = -1; hudShown.eq = -1; hudAll(true); hudStop(0, 0);
}
function setCarts(cur, lost) { document.querySelectorAll('#rrCarts .rrCI').forEach((e, i) => { e.classList.toggle('lost', i + 1 < cur || (lost && i + 1 === cur)); e.classList.toggle('cur', i + 1 === cur && !lost); }); }

/* ---------- little visual helpers ---------- */
function tag(x, y, text, cls = '', ms = 1100) {
  const e = document.createElement('div'); e.className = 'rrTag ' + cls; e.textContent = text; e.style.left = x + 'px'; e.style.top = y + 'px'; $('fxl').appendChild(e);
  const a = anim(e, [{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-90%) scale(1.1)', opacity: 1, offset: .2 }, { transform: 'translate(-50%,-190%) scale(1)', opacity: 0 }], { duration: ms * T(), easing: 'ease-out' });
  a.finished.then(() => e.remove(), () => e.remove());
}
function callout(L, text, cls = '', ms = 1400) {
  const e = document.createElement('div'); e.className = 'rrCall ' + cls; e.textContent = text; L._cn = ((L._cn || 0) + 1) % 2;
  e.style.left = (L.cx + 30 * L.k) + 'px'; e.style.top = (L.cy - (430 + L._cn * 62) * L.k) + 'px'; $('fxl').appendChild(e);
  const a = anim(e, [{ transform: 'translate(-50%,-30%) scale(.5)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.1)', opacity: 1, offset: .14 }, { transform: 'translate(-50%,-55%) scale(1)', opacity: 1, offset: .7 }, { transform: 'translate(-50%,-110%) scale(1)', opacity: 0 }], { duration: ms * T(), easing: 'ease-out' });
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
function mkItem(L, s, x0) {
  const type = s.type, v = s.value; let spr = type === 'door' ? SPR.door : type === 'fork' ? SPR.fork : sprFor(type, v), sc = 1;
  if (type === 'gold') { const t = goldTier(v); sc = [.8, 1, .75, .95, 1.2][t]; }
  const it = { s, type, v, spr, sc, x0, dx: type === 'door' ? 330 * L.k : 0, dy: 0, live: false, n: null, i: s.i, air: type === 'lantern' ? 230 : 0 };
  if (type === 'gold') { it.deco = []; const t = goldTier(v); [-70, 70].forEach(d => { if (t >= 1 || d < 0) { const x = { type: 'deco', spr: SPR.nugget, sc: .5, x0: x0 + d, dx: 0, dy: 0, live: false, n: null }; it.deco.push(x); L.dq.push(x); } }); }
  if (type === 'tnt') L.dq.push({ type: 'deco', kind: 'div', spr: { id: 'tun', w: 250, h: 270, hv: 0 }, sc: 1, x0: x0 + 40, dx: 0, dy: 0, live: false, n: null });
  return it;
}
function applyState(L, s) { L.st.load = s.load; L.st.mult = s.mult; L.st.shields = s.shields; L.st.lanterns = s.lanterns; }
async function doTaken(L, it, t, s, o, W) {      // t = {type, value, shielded, crash}: a plain stop's content, or the side a fork took
  const [px, py] = [L.cx + L.k * COLLECT, L.cy - 150 * L.k], st = o.stake, type = t.type;
  if (type === 'none') { if (it.n) { it.fly = true; const n = it.n; anim(n, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 * T(), fill: 'forwards' }).finished.then(() => { it.live = false; it.n = null; release(n); }, () => {}); } return; }
  if (type === 'gold') {
    sfx.pick(goldTier(t.value)); flyTo(it, px, py, 300); (it.deco || []).forEach(d => { if (d.n) flyTo(d, px, py, 340); }); applyState(L, s); hudAll(); cheer(L); callout(L, '+GOLD ' + fmt(st * t.value), 'gold'); return;
  }
  if (type === 'gem') {
    const g = stageP($('hMult').querySelector('.mGem')); sfx.gemPick(t.value, s.mult); const n0 = L.st.mult; flyTo(it, g[0], g[1], 520, .5); applyState(L, s); after(380, () => { sfx.gemAdd(s.mult); hudAll(); });
    cheer(L, 900); callout(L, 'x' + t.value + ' MULTIPLIER', 'gem'); S.music.intensity(Math.min(1, (o.bonus ? .3 : .1) + s.mult / 40)); return;
  }
  if (type === 'shield') { sfx.hatOn(); flyTo(it, px, py - 60, 380, .5, () => {}); applyState(L, s); setDome(L); setCart(L, 'Shield'); anim(L.dome, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 300 * T() }); hudAll(); callout(L, 'SHIELD!', 'gold'); return; }
  if (type === 'lantern') { const g = stageP($('hl' + Math.min(3, s.lanterns))); sfx.lantern(s.lanterns); flyTo(it, g[0], g[1], 520, .45); applyState(L, s); after(400, () => hudAll()); callout(L, 'LANTERN ' + s.lanterns + '/3', 'gem'); anim(L.w, [{ transform: 'translateY(0)' }, { transform: 'translateY(-34px)', offset: .4 }, { transform: 'translateY(0)' }], { duration: 420 * T(), easing: 'ease-out' }); if (s.lanterns === 3) say('THREE LANTERNS! THE SHAFT OPENS', true); return; }
  if (type === 'tnt') {
    if (t.shielded) {   // the hat takes the blast
      sfx.tntBlock(); const x = px + 30, y = py + 40; boom(L, x, y, 240); shake(.5); flyTo(it, x, y, 10); applyState(L, s);
      { const a = anim(L.dome, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1.25)', offset: .4 }, { opacity: 0, transform: 'scale(1.5)' }], { duration: 420 * T(), fill: 'forwards' }); a.finished.then(() => { a.cancel(); setDome(L); }, () => {}); }
      after(420, () => { if (!L.crashed) setCart(L, baseCart(L)); }); hudAll(); callout(L, 'BOOM!', 'bad'); after(650, () => callout(L, 'SAVED!', 'good')); return;
    }
    return 'crash';
  }
}
function L_init() { LANES.forEach(L => { L.dq = []; L.dns = 0; }); }
function takeoff(L) { sfx.launch(); L.w.classList.remove('mv'); anim(L.cart, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.08,.88)', offset: .25 }, { transform: 'scale(.94,1.1)', offset: .6 }, { transform: 'scale(1,1)' }], { duration: 420 * T(), easing: 'ease-out' }); }
function landing(L) { sfx.land(); shake(.55); anim(L.cart, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.14,.84)', offset: .3 }, { transform: 'scale(.96,1.06)', offset: .65 }, { transform: 'scale(1,1)' }], { duration: 480 * T(), easing: 'ease-out' }); const [x, y] = scr(L.cx, L.cy); embers(10, x, y, false); }
const beat = type => ({ gold: 260, gem: 700, shield: 600, lantern: 500, tnt: 900, none: 150 })[type] || 200;
/* plays one track (a base ride, or one level attempt of the bonus) on lane L. Returns {pay (in bets), crashed} */
async function playTrack(L, tr, o) {
  const ep = EP, W = guardW(ep), stops = tr.stops, L0 = L.dist, base = L0 + 400;
  freeItems(L); L.crashed = false; L.active = true; L.ramp = 1; setCart(L, baseCart(L)); setDome(L); L.w.classList.remove('gone');
  const xs = buildTerrain(L, stops, base); L.dq = []; L.dns = 0; stops.forEach((s, i) => L.items.push(mkItem(L, s, xs[i]))); L.dq.sort((p, q) => p.x0 - q.x0);
  const last = L.items[L.items.length - 1]; if (last && last.type === 'door') last.onSpawn = () => $('scene').classList.add('exit');
  setCart(L, baseCart(L)); const sfxLoop = true; let crashed = false, doorHit = null;
  const N = tr.length || stops.length; if (L === LA) hudDots(N);
  for (let n = 0; n < stops.length; n++) {
    const s = stops[n], it = L.items[n]; L.ramp = 1 + Math.min(.45, (L.st.mult - 1) * .012); L.next = n; const hz = s.type === 'tnt' || s.type === 'fork';
    if (hz) { L.ramp *= .6; if (!L.crashed) setCart(L, 'Worry'); }     // slow-motion approach: the next hazard glows
    if (s.type === 'fork') {
      await travel(L, it.x0 - 270, true); await W(0); if (L === LA) hudStop(s.i, N);
      await doFork(L, it, s, o, W);
      const t = s.taken, crash = t.type === 'tnt' && !t.shielded;
      await travel(L, it.x0 - (crash ? 50 : 0), crash || t.type === 'tnt'); await W(0);
      const r = await doTaken(L, it, t, s, o, W); if (r === 'crash') { crashed = true; await doCrash(L, it, s, o, W); break; }
      if (t.type !== 'none') await W(beat(t.type)); else applyState(L, s), hudAll();
      continue;
    }
    if (s.type === 'door') {
      await travel(L, it.x0, true); await W(0); if (L === LA) hudStop(s.i, N); doorHit = s; applyState(L, s); break;
    }
    if (s.type === 'gem' && L === LA) {
      const x0 = it.x0; await travel(L, x0 - 180 + COLLECT, false); await W(0); hudStop(s.i, N); takeoff(L);
      await travel(L, x0 + COLLECT - 40, false); await W(0); await doTaken(L, it, s, s, o, W);
      await travel(L, x0 + 180 + COLLECT, false); await W(0); landing(L); await W(beat('gem')); continue;
    }
    const crash = s.type === 'tnt' && !s.shielded;
    await travel(L, it.x0 - (crash ? 50 : 0), hz); await W(0); if (L === LA) hudStop(s.i, N);
    const r = await doTaken(L, it, s, s, o, W);
    if (r === 'crash') { crashed = true; await doCrash(L, it, s, o, W); break; }
    await W(beat(s.type));
  }
  L.next = null;
  const pay$ = o.stake * tr.pay;
  if (crashed) { await payOut(L, tr, o, W, 'crash'); }
  else if (doorHit) { await doDoor(L, doorHit, tr, o, W); }
  else { L.v = 0; L.w.classList.remove('mv'); }    // trigger run of a bought round: no door
  return { pay: pay$, crashed };
}
async function doFork(L, it, s, o, W) {
  const sg = sfx; say('A FORK. WHICH WAY?', false); const px = L.cx + L.k * COLLECT, ground = L.rail - 8 * L.k;
  const F = TER.forks.find(f => f.x === it.x0), xb = it.x0 + 300;
  const mk = (p, sgn) => { const spr = p.type === 'none' ? SPR.pile : sprFor(p.type, p.value); const b = { s: it.s, type: p.type, spr, sc: p.type === 'none' ? .3 : .8, alpha: p.type === 'none' ? .4 : 1, x0: xb, dx: 0, dy: -30, h0fix: TH(xb) + (sgn - F.sg) * 140 * prof(F, xb), live: false, n: null, pv: p }; b.fromBub = 1; spawn(L, b); return b; };
  const bl = mk(s.left, 1), br = mk(s.right, -1);
  sg.fork(); await W(1000); sfx.lever(); if (it.n) it.n._u.setAttribute('href', s.side === 'left' ? '#rrForkL' : '#rrForkR');
  await W(520); const lose = s.side === 'left' ? br : bl, win = s.side === 'left' ? bl : br;
  if (lose.n) anim(lose.n, [{ opacity: lose.alpha }, { opacity: .12 }], { duration: 300 * T(), fill: 'forwards' });
  if (win.n) anim(win.n, [{ transform: win.n.style.transform + ' scale(1)' }, { transform: win.n.style.transform + ' scale(1.25)' }], { duration: 300 * T(), fill: 'forwards' });
  say(s.side === 'left' ? 'THE LEVER SNAPS LEFT' : 'THE LEVER SNAPS RIGHT', true);
  const dy = s.side === 'left' ? -26 : 14; anim(L.w, [{ transform: 'translateY(0)' }, { transform: `translateY(${dy}px)`, offset: .25 }, { transform: `translateY(${dy}px)`, offset: .75 }, { transform: 'translateY(0)' }], { duration: 1500 * T(), easing: 'ease-in-out' });
  await W(800);
  for (const b of [bl, br]) { b.live = false; if (b.n) { const n = b.n; b.n = null; release(n); } }
  L.live = L.live.filter(b => !b.fromBub);
  const t = s.taken, nspr = t.type === 'none' ? null : sprFor(t.type, t.value);
  if (it.n && nspr) { it.spr = nspr; it.type = t.type; it.n._u.setAttribute('href', '#' + nspr.id); const k = L.k; it.w = nspr.w * k; it.h = nspr.h * k; it.n.style.width = it.w + 'px'; it.n.style.height = it.h + 'px'; it.ox = it.w * .5; it.x0 = xb; it.sc = 1; layout(L, it); it._x = null; place(it, L); } else if (!nspr) it.x0 = xb;
}
async function doCrash(L, it, s, o, W) {
  say('OH NO... TNT!', true); callout(L, 'TNT!', 'bad', 900); await W(700);
  L.crashed = true; L.go = false; L.v = 0; const x = L.cx + L.k * (COLLECT + 40), y = L.cy - 70 * L.k; sfx.crash(); S.music.duck && S.music.duck(.25, 1, 1.2);
  if (it.n) { const n = it.n; it.live = false; it.n = null; release(n); } boom(L, x, y, 340); shake(true); flash(); setCart(L, 'Crash'); setDome(L); L.w.classList.remove('mv'); anim(L.w, [{ transform: 'translate(0,0) rotate(0)' }, { transform: 'translate(30px,-120px) rotate(-22deg)', offset: .35, easing: 'ease-in' }, { transform: 'translate(60px,6px) rotate(8deg)', offset: .7 }, { transform: 'translate(60px,0) rotate(0)' }], { duration: 900 * T(), easing: 'ease-out', fill: 'forwards' }); applyState(L, s); hudAll();
  callout(L, 'BOOM!', 'bad', 1500); banner('CRASH!', 'YOU KEEP THE LOAD ONLY', 1900); say('CRASH! YOU KEEP THE LOAD ONLY', true); await W(1400);
}
async function payOut(L, tr, o, W, why) {
  const pay$ = o.stake * tr.pay; const x = L.cx, y = L.cy - 250 * L.k;
  tag(x, y, why === 'crash' ? 'LOAD ' + fmt(pay$) : '+' + fmt(pay$), why === 'crash' ? 'crash' : 'big', 1500);
  if (pay$ > 0) await o.land(pay$, W); else await W(300);
}
async function doDoor(L, d, tr, o, W) {
  setCart(L, 'Win'); L.dome.style.display = 'none'; L.w.classList.remove('mv'); L.v = 0; sfx.door(); flash(.7); const [sx, sy] = scr(L.cx + 300, L.cy - 150 * L.k); embers(40, sx, sy, true); S.music.stinger('win');
  const pay$ = o.stake * tr.pay, x = L.cx + 120 * L.k, y = L.cy - 300 * L.k;
  banner(o.bonus && tr.exit === 'bottom' ? 'BOTTOM DOOR!' : o.bonus ? 'LEVEL CLEARED' : 'DAYLIGHT!', `${fmt(o.stake * d.load)} x ${d.mult} = ${fmt(o.stake * (d.load * d.mult))}` + (d.jackpot ? `  +  JACKPOT x${d.jackpot}` : ''), 1700, !!d.jackpot);
  say(d.jackpot ? 'JACKPOT DOOR! x' + d.jackpot : o.bonus ? 'LEVEL CLEARED' : 'DAYLIGHT! THE DOOR OPENS', true);
  if (d.jackpot) { sfx.jackpot(); shake(true); }
  H.mc.classList.add('rrWin'); setTimeout(() => H.mc.classList.remove('rrWin'), 1200 * T());
  await W(1100); const ld = LANES.filter(l => l.active).length > 1 ? 0 : 1; if (ld) { cnt(H.load, hudShown.load, d.load * d.mult + d.jackpot, 800, mon); hudShown.load = d.load * d.mult + d.jackpot; }
  tag(x, y, '+' + fmt(pay$), 'big', 1900); await o.land(pay$, W);
  await W(900); $('scene').classList.remove('exit');
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
    LA.st = { load: 0, mult: 1, shields: 0, lanterns: 0 }; LB.st = { load: 0, mult: 1, shields: 0, lanterns: 0 }; LA.active = true; LB.active = twin; hudShown.load = -1; hudShown.mult = -1; hudShown.eq = -1; hudAll(true); hudStop(0, 0);
    try { const k = +(localStorage.getItem('rrr_hint') || 0); if (k < 3) { localStorage.setItem('rrr_hint', k + 1); S.say('COLLECT GOLD. GEMS MULTIPLY. AVOID TNT. HATS ARE SHIELDS.', true); hintUntil = performance.now() + 5200; } } catch {}
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
    H.dl.textContent = 'LVL ' + sp.level + ' STOP'; hudShown.load = -1; hudShown.mult = -1; hudShown.eq = -1; hudAll(true); hudPos(100 * sp.level, 0); setCarts(sp.cart, false);
    if (newCart) { lastCart = sp.cart; L.w.style.display = 'block'; anim(L.w, [{ transform: 'translateX(-620px)' }, { transform: 'translateX(0)' }], { duration: 750 * T(), easing: 'cubic-bezier(.2,.7,.3,1)' }); }
    banner(sp.cart > 1 && !newLevel ? `CART ${sp.cart}` : `LEVEL ${sp.level}`, sp.cart > 1 && !newLevel ? `LEVEL ${sp.level} AGAIN` : `CART ${sp.cart} OF 3`, 1400);
    S.music.intensity(Math.min(1, .35 + sp.level * .15 + sp.multIn / 60)); say(`LEVEL ${sp.level} · CART ${sp.cart}`, true); await W(newLevel ? 1200 : 700);
    const o = { stake: ctx.stake, bonus: true, land, depth: i => 100 * sp.level + i * 6 };
    const tr = { stops: sp.stops, pay: sp.pay, exit: sp.exit, length: sp.length };
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
function paintIdle() { idleOn = true; resetLanes(); LA.active = true; LB.active = false; LA.st = { load: 0, mult: 1, shields: 0, lanterns: 0 }; hudShown.load = -1; hudShown.mult = -1; hudShown.eq = -1; stakeNow = S.bet(); hudAll(true); hudPos(30, 0); idleScene(); }
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
      launch: () => { const t = T0(); noise(t, .45, .1, 'bandpass', 500, 2600, 1.2, .1); osc('sine', 160, t, .25, .18, .01, 420); },
      land: () => { const t = T0(); osc('sine', 120, t, .3, .35, .002, 45); noise(t, .12, .2, 'lowpass', 900, 200, .8, .002); clank(t + .03, .5); },
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
    H.dl.textContent = 'STOP'; $('hDepth').insertAdjacentHTML('beforeend', '<div id="rrDots"></div>'); $('hDist').querySelector('i').textContent = 'LOAD x MULTI ='; H.depth.textContent = '0/0';
    $('grid').insertAdjacentHTML('beforeend', '<div id="rrRing"></div>'); ring = $('rrRing');
    $('scene').classList.add('rrT'); mkTrack(); mkTrackB(); L_init(); geom(); addEventListener('resize', () => { if (document.body.classList.contains('portrait') !== PORT || true) { geom(); } }); bindLayers(); paintLayers(0, 0);
  },
  paintIdle,
  roundStart() { EP++; killTimers(); inBonus = false; lastCart = 0; stakeNow = S.bet(); $('hud').classList.remove('bonus', 'twin'); H.dl.textContent = 'STOP'; curR = null; },
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
      setLevel(B.startLevel || 1); LA.st = { load: 0, mult: B.startMult || 1, shields: B.startShields || 0, lanterns: 0 }; LA.active = true; setCart(LA, baseCart(LA)); setDome(LA); H.dl.textContent = 'LVL ' + (B.startLevel || 1) + ' STOP';
      hudShown.load = -1; hudShown.mult = -1; hudShown.eq = -1; hudAll(true); hudPos(100 * (B.startLevel || 1), 0); setCarts(1, false); S.music.intensity(.35);
    } else {
      resetLanes(); setLevel(1); H.dl.textContent = 'STOP'; LA.st = { load: 0, mult: 1, shields: 0, lanterns: 0 }; hudShown.load = -1; hudShown.mult = -1; hudShown.eq = -1; hudAll(true); hudPos(30, 0); idleOn = true; idleScene(); S.music.intensity(0);
    }
  }
};
});
