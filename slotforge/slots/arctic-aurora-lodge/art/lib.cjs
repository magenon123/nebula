// Shared helpers for the Arctic Aurora Lodge art generators (leo).
const fs = require('fs');
exports.rng = (seed) => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
const f = (n) => +(+n).toFixed(2);
exports.f = f;
// Symbol builder: unique gradient ids, animations gated by --win/--delay/--spd (Tea House contract).
class Sym {
  constructor(id, vb = '0 0 128 128') { this.id = id; this.vb = vb; this.defs = []; this.body = []; this.anims = []; this.n = 0; }
  _id(p) { return `${this.id}${p}${this.n++}`; }
  lin(x1, y1, x2, y2, stops) {
    const id = this._id('L');
    this.defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`);
    return `url(#${id})`;
  }
  rad(cx, cy, r, stops, fx, fy) {
    const id = this._id('R');
    this.defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}"${fx != null ? ` fx="${fx}" fy="${fy}"` : ''}>${stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</radialGradient>`);
    return `url(#${id})`;
  }
  // radial gradient in an ellipse (scaled): rx, ry
  ell(cx, cy, rx, ry, stops, fx, fy) {
    const id = this._id('E');
    this.defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${cx} ${cy}) scale(${rx} ${ry})">${stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</radialGradient>`);
    return `url(#${id})`;
  }
  clip(d) { const id = this._id('C'); this.defs.push(`<clipPath id="${id}">${d}</clipPath>`); return `url(#${id})`; }
  def(s) { this.defs.push(s); }
  add(s) { this.body.push(s); return this; }
  // keyframes: {0:'transform:none', 20:'transform:rotate(-8deg)'}; opts: origin '50% 50%', dur s, delay ms, ease, iter
  anim(cls, kf, o = {}) { this.anims.push({ cls, kf, o }); }
  css() {
    const id = this.id, N = id.replace(/\D/g, '');
    let css = '';
    this.anims.forEach(a => {
      const o = a.o, kfs = Object.keys(a.kf).map(Number).sort((x, y) => x - y).map(k => `${k}%{${a.kf[k]}}`).join('');
      css += `.${id} .a-${a.cls}{transform-box:fill-box;transform-origin:${o.origin || '50% 50%'};animation:var(--k${N}_${a.cls},none) calc(${o.dur || 1.1}s*var(--spd,1)) ${o.ease || 'cubic-bezier(.3,.7,.3,1)'} calc(var(--delay,0ms) + ${o.delay || 0}ms) both}@keyframes ${id}_${a.cls}{${kfs}}`;
    });
    return css;
  }
  fit(sc, tx = 0, ty = 0) { this.tf = `translate(${64 + tx} ${64 + ty}) scale(${sc}) translate(-64 -64)`; return this; }
  vars() { const N = this.id.replace(/\D/g, ''); return this.anims.map(a => `--k${N}_${a.cls}:${this.id}_${a.cls}`); }
  out() {
    return `<symbol id="${this.sid || this.id.replace("sy","s")}" viewBox="${this.vb}"><style>${this.css()}</style><defs>${this.defs.join('')}</defs><g class="${this.id}"${this.tf ? ` transform="${this.tf}"` : ''}>${this.body.join('')}</g></symbol>`;
  }
}
exports.Sym = Sym;
// shared bits ---------------------------------------------------------------
exports.shadow = (S, cx, cy, rx, ry, op = .6) => S.add(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${S.ell(cx, cy, rx, ry, [[0, '#010510', op], [.6, '#010510', op * .55], [1, '#010510', 0]])}"/>`);
exports.snow = (S, cx, cy, w, h = 9) => {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  S.add(`<path d="M${x0} ${cy + h} C${x0 + w * .06} ${cy + h * .2} ${x0 + w * .22} ${cy - h * .05} ${cx - w * .08} ${cy + h * .05} C${cx + w * .1} ${cy - h * .12} ${x1 - w * .18} ${cy - h * .02} ${x1 - w * .04} ${cy + h * .35} L${x1} ${cy + h}Z" fill="${S.lin(0, cy - h, 0, cy + h, [[0, '#f7fcff'], [.55, '#c4dcf2'], [1, '#6f94c6']])}"/>`);
  S.add(`<path d="M${x0 + 2} ${cy + h * .8} C${x0 + w * .08} ${cy + h * .2} ${x0 + w * .22} ${cy - h * .02} ${cx - w * .08} ${cy + h * .05} C${cx + w * .1} ${cy - h * .12} ${x1 - w * .18} ${cy - h * .02} ${x1 - w * .06} ${cy + h * .3}" fill="none" stroke="#7dffc4" stroke-opacity=".55" stroke-width="1.1" stroke-linecap="round"/>`);
};
exports.star = (cx, cy, r, op = 1, extra = '') => `<path d="M${cx} ${cy - r}L${f(cx + r * .16)} ${f(cy - r * .16)}L${cx + r} ${cy}L${f(cx + r * .16)} ${f(cy + r * .16)}L${cx} ${cy + r}L${f(cx - r * .16)} ${f(cy + r * .16)}L${cx - r} ${cy}L${f(cx - r * .16)} ${f(cy - r * .16)}Z" fill="#fff" opacity="${op}" ${extra}/>`;
// ---- fur helpers -------------------------------------------------------------
function resample(pts, step) { // closed polygon -> evenly spaced points
  const out = []; let carry = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let t = carry; while (t < d) { out.push([a[0] + (b[0] - a[0]) * t / d, a[1] + (b[1] - a[1]) * t / d]); t += step; } carry = t - d;
  }
  return out;
}
exports.resample = resample;
// smooth closed polygon via Catmull-Rom -> dense points
exports.smooth = (pts, per = 8) => {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    for (let k = 0; k < per; k++) { const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(j => .5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
  }
  return out;
};
// tufted outline: outward spikes swept along the contour. opts {step,len,sweep,seed,mix}
exports.fur = (poly, o = {}) => {
  const R = exports.rng(o.seed || 7), step = o.step || 5, len = o.len || 5, sweep = o.sweep == null ? .5 : o.sweep;
  const P = resample(poly, step), n = P.length; let area = 0;
  for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  const sg = area > 0 ? 1 : -1; let d = '';
  const base = P.map((p, i) => { const a = P[(i - 1 + n) % n], b = P[(i + 1) % n]; const tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1; return { p, t: [tx / tl, ty / tl], n: [ty / tl * sg, -tx / tl * sg] }; });
  base.forEach((b, i) => {
    const nx = base[(i + 1) % n], L = len * (.55 + R() * .9), tip = [b.p[0] + b.n[0] * L + b.t[0] * L * sweep, b.p[1] + b.n[1] * L + b.t[1] * L * sweep];
    if (i === 0) d += `M${f(b.p[0])} ${f(b.p[1])}`;
    d += `Q${f(b.p[0] + b.n[0] * L * .3 + b.t[0] * L * .5)} ${f(b.p[1] + b.n[1] * L * .3 + b.t[1] * L * .5)} ${f(tip[0])} ${f(tip[1])}Q${f(nx.p[0] + nx.n[0] * L * .15)} ${f(nx.p[1] + nx.n[1] * L * .15)} ${f(nx.p[0])} ${f(nx.p[1])}`;
  });
  return d + 'Z';
};
// short curved strokes. o: {n, seed, box:[x0,y0,x1,y1], dir:(x,y)=>rad, len:[a,b], w, color, op}
exports.strokes = (o) => {
  const R = exports.rng(o.seed || 3); let d = '';
  for (let i = 0; i < o.n; i++) {
    const x = o.box[0] + R() * (o.box[2] - o.box[0]), y = o.box[1] + R() * (o.box[3] - o.box[1]);
    if (o.inside && !o.inside(x, y)) { continue; }
    const a = o.dir(x, y) + (R() - .5) * (o.jit || .5), L = o.len[0] + R() * (o.len[1] - o.len[0]);
    const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L, cx = x + Math.cos(a + .25) * L * .55, cy = y + Math.sin(a + .25) * L * .55;
    d += `M${f(x)} ${f(y)}Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}`;
  }
  return `<path d="${d}" fill="none" stroke="${o.color}" stroke-opacity="${o.op == null ? .5 : o.op}" stroke-width="${o.w || 1}" stroke-linecap="round"/>`;
};
