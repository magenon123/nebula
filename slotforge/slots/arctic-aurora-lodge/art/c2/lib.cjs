// Painter helpers for the v3 "game-art illustration" characters (leo). Everything renders offline in Chromium (filters allowed), then is baked to WebP.
const R = (seed) => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
const f = (n) => +(+n).toFixed(2);
const hx = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = (c) => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
// ramp: stops [[t,hex],...] -> colour at t
const ramp = (stops, t) => { t = Math.max(0, Math.min(1, t)); for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) { const a = stops[i - 1], b = stops[i]; return mix(a[1], b[1], (t - a[0]) / (b[0] - a[0] || 1)); } return stops[stops.length - 1][1]; };
// smooth Catmull-Rom path through points. a point may carry a 3rd value 1 = corner (no smoothing there)
function sp(pts, closed = true, k = 1 / 6) {
  const n = pts.length; const P = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`; const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const t1 = p1[2] ? [0, 0] : [(p2[0] - p0[0]) * k, (p2[1] - p0[1]) * k], t2 = p2[2] ? [0, 0] : [(p3[0] - p1[0]) * k, (p3[1] - p1[1]) * k];
    d += `C${f(p1[0] + t1[0])} ${f(p1[1] + t1[1])} ${f(p2[0] - t2[0])} ${f(p2[1] - t2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}
// leaf-shaped fur clump from base (x,y), direction a, length L, width w, bend (sideways tip offset)
function clump(x, y, a, L, w, bend = 0) {
  const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
  const tx = x + dx * L + nx * bend, ty = y + dy * L + ny * bend;
  const bl = [x - nx * w / 2, y - ny * w / 2], br = [x + nx * w / 2, y + ny * w / 2];
  const c1 = [x + dx * L * .55 - nx * w * .6 + nx * bend * .6, y + dy * L * .55 - ny * w * .6 + ny * bend * .6];
  const c2 = [x + dx * L * .55 + nx * w * .6 + nx * bend * .6, y + dy * L * .55 + ny * w * .6 + ny * bend * .6];
  return `M${f(bl[0])} ${f(bl[1])}Q${f(c1[0])} ${f(c1[1])} ${f(tx)} ${f(ty)}Q${f(c2[0])} ${f(c2[1])} ${f(br[0])} ${f(br[1])}Z`;
}
// Defs shared by every baked part
const DEFS = `<filter id="b1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1"/></filter>
<filter id="b2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="b4" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="b8" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .9 -.35"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="cloth" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".55 .08" numOctaves="2" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 -.5"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
let uid = 0; const nid = (p) => p + (uid++);
// Painted object helper: shape d with clip, shading shapes (blurred), then pass-through. returns svg string.
// layers: array of {d|el, fill, op, blur} drawn clipped to shape d
function paint(d, base, layers = [], o = {}) {
  const cid = nid('pc');
  let s = `<clipPath id="${cid}"><path d="${d}"/></clipPath><path d="${d}" fill="${base}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 1}" stroke-linejoin="round"` : ''}/>`;
  s += `<g clip-path="url(#${cid})">`;
  for (const L of layers) {
    const el = L.el ? L.el : `<path d="${L.d}" fill="${L.fill}"${L.stroke ? ` stroke="${L.stroke}" stroke-width="${L.sw || 1}" stroke-linecap="round"` : ''}/>`;
    s += `<g${L.op != null ? ` opacity="${L.op}"` : ''}${L.blur ? ` filter="url(#${L.blur})"` : ''}${L.mode ? ` style="mix-blend-mode:${L.mode}"` : ''}>${el}</g>`;
  }
  return s + '</g>';
}
// rim light: silhouette markup `sil` (fills only), shift (dx,dy) -> thin band on the side opposite the shift
function rim(sil, dx, dy, color, op = .8, blur = 'b1') {
  const id = nid('rm'), sid = nid('rs');
  return `<defs><g id="${sid}">${sil}</g><mask id="${id}"><g fill="#fff"><use href="#${sid}"/></g><g fill="#000" transform="translate(${dx} ${dy})"><use href="#${sid}"/></g></mask></defs><g mask="url(#${id})" opacity="${op}" filter="url(#${blur})"><g fill="${color}"><use href="#${sid}"/></g></g>`;
}
// outline: silhouette markup -> dark halo behind (morphology dilate)
function outline(sil, r = 1.3, color = '#0a1024', op = .92) {
  const id = nid('ol');
  return `<defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="${r}"/><feFlood flood-color="${color}" flood-opacity="${op}" result="c"/><feComposite in="c" in2="SourceAlpha" operator="in"/></filter></defs><g filter="url(#${id})">${sil}</g>`;
}
// fur field: scatters clumps in a region. o: {n, seed, inside(x,y)->bool, flow(x,y)->angle, L:[a,b], w:[a,b], bend, col(x,y)->hex, hi(x,y)->hex|null, line, order(x,y)->number (draw order asc)}
function fur(o) {
  const r = R(o.seed || 5), items = [];
  const [x0, y0, x1, y1] = o.box; let tries = 0;
  while (items.length < o.n && tries++ < o.n * 40) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
    if (o.inside && !o.inside(x, y)) continue;
    const a = o.flow(x, y) + (r() - .5) * (o.jit == null ? .5 : o.jit), L = o.L[0] + r() * (o.L[1] - o.L[0]), w = o.w[0] + r() * (o.w[1] - o.w[0]);
    items.push({ x, y, a, L, w, b: (r() - .5) * (o.bend == null ? w * .5 : o.bend), k: o.order ? o.order(x, y) : y, rr: r() });
  }
  items.sort((p, q) => p.k - q.k);
  let s = '';
  for (const it of items) {
    const c = o.col(it.x, it.y, it.rr), line = o.line ? o.line(it.x, it.y, c) : mix(c, '#1a1020', .45);
    s += `<path d="${clump(it.x, it.y, it.a, it.L, it.w, it.b)}" fill="${c}" stroke="${line}" stroke-width="${o.sw || .5}" stroke-opacity="${o.lo == null ? .55 : o.lo}" stroke-linejoin="round"/>`;
    if (o.hi) { const h = o.hi(it.x, it.y, it.rr); if (h) s += `<path d="${clump(it.x + Math.cos(it.a) * it.L * .28, it.y + Math.sin(it.a) * it.L * .28, it.a, it.L * .72, it.w * .55, it.b * .8)}" fill="${h}" opacity="${o.ho == null ? .8 : o.ho}"/>`; }
  }
  return s;
}
// wrap into an svg document for a part
function doc(bbox, scale, inner, bg) {
  const [x, y, w, h] = bbox;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${x} ${y} ${w} ${h}" width="${w * scale}" height="${h * scale}" stroke-linejoin="round" stroke-linecap="round"><defs>${DEFS}</defs>${bg ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/>` : ''}${inner}</svg>`;
}
module.exports = { R, f, mix, ramp, sp, clump, paint, rim, outline, fur, doc, hx, toHex, DEFS, nid };
