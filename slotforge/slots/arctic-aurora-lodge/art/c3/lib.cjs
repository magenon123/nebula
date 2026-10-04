// c3 lib: cel-paint helpers. Every shape gets: dark variable-weight outline, flat base, gradient overlay,
// 2-tone offset-crescent shadows (light from upper-left = aurora), highlight crescent, cyan rim light, warm bounce on the right.
let N = 0; const uid = p => p + (++N);
const f = v => (+v.toFixed(2));
const P = p => f(p[0]) + ' ' + f(p[1]);
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const setSeed = s => { seed = s || 7; };
const OL = '#0c0a16';
const RIM = '#8ff3ff', WARM = '#ffa24a';

// shaded shape: d = path; o = {fill, sh1, sh2, hi, ow, k (shade scale), grad, under, over, rim(0..1), warm(0..1), noOutline, ol}
function S(d, o = {}) {
  const id = uid('p'), cl = uid('c'), m = uid('m');
  const k = o.k || 1, ow = o.ow == null ? 2.2 : o.ow, ol = o.ol || OL;
  const sh = (dx, dy) => `<use href="#${id}" fill="#000" transform="translate(${f(dx * k)} ${f(dy * k)})"/>`;
  const band = (name, dx, dy, col, op) => `<mask id="${m}${name}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="700" height="600"><use href="#${id}" fill="#fff"/>${sh(dx, dy)}</mask><rect x="-50" y="-50" width="700" height="600" mask="url(#${m}${name})" fill="${col}" fill-opacity="${op}"/>`;
  let out = `<defs><path id="${id}" d="${d}"/><clipPath id="${cl}"><use href="#${id}"/></clipPath></defs>`;
  if (!o.noOutline) out += `<use href="#${id}" fill="${ol}" stroke="${ol}" stroke-width="${f(ow * 2)}" stroke-linejoin="round"/><use href="#${id}" fill="${ol}" stroke="${ol}" stroke-width="${f(ow * 2)}" stroke-linejoin="round" transform="translate(${f(ow * .45)} ${f(ow * .6)})"/>`;
  out += `<use href="#${id}" fill="${o.fill || '#888'}"/><g clip-path="url(#${cl})">`;
  if (o.under) out += o.under;
  if (o.grad !== 0) out += `<rect x="-50" y="-50" width="700" height="600" fill="url(#gShade)" opacity="${o.grad || .28}"/>`;
  if (o.sh1) out += band('a', -11, -13, o.sh1, .85);
  if (o.sh2) out += band('b', -5.5, -6.5, o.sh2, .9);
  if (o.hi) out += band('c', 6.5, 7.5, o.hi, o.hiOp || .75);
  if (o.warm !== 0) out += band('d', -2.2, -1.2, WARM, o.warm == null ? .5 : o.warm);
  if (o.over) out += o.over;
  if (o.rim !== 0) out += band('e', 1.8, 1.9, RIM, o.rim == null ? .85 : o.rim);
  out += `</g>`;
  return out;
}
// rounded limb capsule a->b with widths w0,w1 (curved by bulge)
function limb(a, b, w0, w1, bulge = 0) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, r0 = w0 / 2, r1 = w1 / 2;
  const mx = (a[0] + b[0]) / 2 + nx * bulge, my = (a[1] + b[1]) / 2 + ny * bulge;
  const a1 = [a[0] + nx * r0, a[1] + ny * r0], a2 = [a[0] - nx * r0, a[1] - ny * r0], b1 = [b[0] + nx * r1, b[1] + ny * r1], b2 = [b[0] - nx * r1, b[1] - ny * r1];
  const rm = (r0 + r1) / 2, m1 = [mx + nx * rm, my + ny * rm], m2 = [mx - nx * rm, my - ny * rm];
  return `M${P(a1)}Q${P(m1)} ${P(b1)}A${f(r1)} ${f(r1)} 0 0 0 ${P(b2)}Q${P(m2)} ${P(a2)}A${f(r0)} ${f(r0)} 0 0 0 ${P(a1)}Z`;
}
// fur tufts along polyline (continues an open path already at pts[0]); side=+1 left of travel
function fur(pts, o = {}) {
  const len = o.len || 7, step = o.step || 7, side = o.side || 1, sk = o.skew == null ? .35 : o.skew;
  let out = '', carry = 0, cur = pts[0];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); if (L < .01) continue;
    const tx = dx / L, ty = dy / L, nx = -ty * side, ny = tx * side; let pos = 0;
    while (pos < L) {
      const st = Math.min(L - pos, step * (.7 + rnd() * 1.0)); if (st < 2 && pos + st >= L) break;
      const p0 = cur, p1 = [a[0] + tx * (pos + st), a[1] + ty * (pos + st)], ln = len * (.45 + rnd() * .95);
      const tip = [(p0[0] + p1[0]) / 2 + nx * ln + tx * ln * sk * (rnd() * 2 - .8), (p0[1] + p1[1]) / 2 + ny * ln + ty * ln * sk * (rnd() * 2 - .8)];
      const c1 = [p0[0] + nx * ln * .1 + tx * st * .1, p0[1] + ny * ln * .1 + ty * st * .1];
      const c2 = [p1[0] + nx * ln * .3 - tx * st * .1, p1[1] + ny * ln * .3 - ty * st * .1];
      out += `Q${P(c1)} ${P(tip)}Q${P(c2)} ${P(p1)}`; cur = p1; pos += st;
    }
  }
  return out;
}
// hair lock: teardrop from root a (width w) to tip b, curved by bend
function lock(a, b, w, bend = 0) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, mx = (a[0] + b[0]) / 2 + nx * bend, my = (a[1] + b[1]) / 2 + ny * bend;
  return `M${P([a[0] - nx * w / 2, a[1] - ny * w / 2])}Q${P([mx - nx * w * .62, my - ny * w * .62])} ${P(b)}Q${P([mx + nx * w * .62, my + ny * w * .62])} ${P([a[0] + nx * w / 2, a[1] + ny * w / 2])}Z`;
}
const mirror = s => `<g transform="translate(480 0) scale(-1 1)">${s}</g>`;
const stroke = (d, c, w, op = 1, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const shadeDefs = `<defs><linearGradient id="gShade" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05061a" stop-opacity=".9"/></linearGradient></defs>`;
// wrap one part: {svg, bbox:[x,y,w,h], scale}
const part = (inner0, bbox, scale = 2, q, xf) => { const inner = xf ? `<g transform="${xf}">${inner0}</g>` : inner0; return { bbox, scale, q, inner, svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${bbox.join(' ')}" width="${Math.round(bbox[2] * scale)}" height="${Math.round(bbox[3] * scale)}" stroke-linejoin="round" stroke-linecap="round">${shadeDefs}${inner}</svg>` }; };
module.exports = { S, limb, fur, lock, mirror, stroke, part, rnd, setSeed, f, P, uid, OL, RIM, WARM, shadeDefs };
