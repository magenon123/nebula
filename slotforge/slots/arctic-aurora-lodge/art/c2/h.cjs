// extra helpers for v3 characters
let gid = 5000; const L = require('./lib.cjs'); const { f, mix, ramp, R } = L;
const mir = (pts, cx = 166) => pts.map(p => [2 * cx - p[0], p[1], p[2]]);
// evaluate open catmull-rom (same as sp) at n+1 samples -> [[x,y,angle]]
function samp(pts, n) {
  const m = pts.length - 1, P = (i) => pts[Math.max(0, Math.min(m, i))], out = [];
  for (let s = 0; s <= n; s++) {
    const u = s / n * m, i = Math.min(m - 1, Math.floor(u)), t = u - i;
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), k = 1 / 6;
    const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k], c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    const b = (a, b1, c, d, t) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b1 + 3 * (1 - t) * t * t * c + t ** 3 * d;
    const x = b(p1[0], c1[0], c2[0], p2[0], t), y = b(p1[1], c1[1], c2[1], p2[1], t);
    const x2 = b(p1[0], c1[0], c2[0], p2[0], Math.min(1, t + .02)), y2 = b(p1[1], c1[1], c2[1], p2[1], Math.min(1, t + .02));
    out.push([x, y, Math.atan2(y2 - y, x2 - x)]);
  }
  return out;
}

// rounded layered tuft (fur mass piece)
function tuft(x, y, a, L, w, b = 0) {
  const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx, tx = x + dx * L + nx * b, ty = y + dy * L + ny * b;
  const bl = [x - nx * w * .4, y - ny * w * .4], br = [x + nx * w * .4, y + ny * w * .4];
  const c = (px, py, k, m, e) => [px + dx * L * k + nx * (m + b * e), py + dy * L * k + ny * (m + b * e)];
  const a1 = c(bl[0], bl[1], .35, -w * .5, .1), a2 = c(tx, ty, -.22, -w * .42, .2), b2 = c(tx, ty, -.1, w * .36, .4), b1 = c(br[0], br[1], .5, w * .5, .3);
  return `M${f(bl[0])} ${f(bl[1])}C${f(a1[0])} ${f(a1[1])} ${f(a2[0])} ${f(a2[1])} ${f(tx)} ${f(ty)}C${f(b2[0])} ${f(b2[1])} ${f(b1[0])} ${f(b1[1])} ${f(br[0])} ${f(br[1])}Z`;
}
// furF: layered tufts. o: box,n,seed,inside,flow,L:[a,b],w:[a,b],bend,col(x,y,r),jit,order,sw,hl(0..1 highlight chance),under(shadow colour mix)
function nid(p) { return p + (gid++); }
function furF(o) {
  const r = R(o.seed || 5), items = []; const [x0, y0, x1, y1] = o.box; let tries = 0;
  while (items.length < o.n && tries++ < o.n * 40) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); if (o.inside && !o.inside(x, y)) continue;
    const a = o.flow(x, y) + (r() - .5) * (o.jit == null ? .5 : o.jit), L = o.L[0] + r() * (o.L[1] - o.L[0]), w = o.w[0] + r() * (o.w[1] - o.w[0]);
    items.push({ x, y, a, L, w, b: (r() - .5) * (o.bend == null ? w * .6 : o.bend), k: o.order ? o.order(x, y) : y, rr: r() });
  }
  items.sort((p, q) => p.k - q.k); let s = '';
  if (o.sil) return items.map(it => `<path d="${tuft(it.x, it.y, it.a, it.L, it.w * 1.06, it.b)}"/>`).join('');
  for (const it of items) {
    const c = o.col(it.x, it.y, it.rr), dk = mix(c, o.dark || '#2c2c4a', o.rootDark == null ? .55 : o.rootDark), lc = mix(c, '#ffffff', .45);
    const gid2 = nid('tg'), ex = it.x + Math.cos(it.a) * it.L, ey = it.y + Math.sin(it.a) * it.L;
    s += `<linearGradient id="${gid2}" gradientUnits="userSpaceOnUse" x1="${f(it.x)}" y1="${f(it.y)}" x2="${f(ex)}" y2="${f(ey)}"><stop offset="0" stop-color="${dk}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${lc}"/></linearGradient>`;
    s += `<path d="${tuft(it.x, it.y, it.a, it.L, it.w, it.b)}" fill="url(#${gid2})" stroke="${mix(c, o.dark || '#14142a', .7)}" stroke-width="${o.sw || .45}" stroke-opacity="${o.so == null ? .5 : o.so}"/>`;
  }
  return s;
}

// overlay soft light/shadow on a fur mass: o = same options as furF (sil mode); box [x0,y0,x1,y1]; light dir from upper-left
function furLit(o, cx, cy, R0, extra = '') {
  const id = nid('fm'); const sil = furF(Object.assign({}, o, { sil: true }));
  return `<mask id="${id}"><g fill="#fff">${sil}</g></mask><g mask="url(#${id})">` +
    `<ellipse cx="${cx + R0 * .55}" cy="${cy + R0 * .5}" rx="${R0 * .85}" ry="${R0 * .85}" fill="#1a1838" opacity=".42" filter="url(#b8)"/>` +
    `<ellipse cx="${cx - R0 * .5}" cy="${cy - R0 * .55}" rx="${R0 * .7}" ry="${R0 * .6}" fill="#fff6e8" opacity=".38" filter="url(#b8)"/>` + extra + `</g>`;
}
const lg = (x1, y1, x2, y2, st) => { const id = 'g' + (gid++); return { id, def: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`, u: `url(#${id})` }; };
const rg = (cx, cy, r, st, sx = 1, sy = 1) => { const id = 'g' + (gid++); return { id, def: `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${cx} ${cy}) scale(${r * sx} ${r * sy})">${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</radialGradient>`, u: `url(#${id})` }; };
// collects defs; usage: const D=defs(); D.lg(...) returns url string
function defs() { const a = []; return { lg: (...x) => { const g = lg(...x); a.push(g.def); return g.u; }, rg: (...x) => { const g = rg(...x); a.push(g.def); return g.u; }, get: () => a.join('') }; }
// whole-part outline + doc. inner string, bbox, scale, defs string, outline opts
function part(bbox, scale, inner, dstr = '', ol = { r: .85, c: '#070d20', o: .95 }) {
  const body = ol ? `<g filter="url(#olA)">${inner}</g>` : inner;
  const olf = ol ? `<filter id="olA" x="-5%" y="-5%" width="110%" height="110%"><feMorphology in="SourceAlpha" operator="dilate" radius="${ol.r}" result="d"/><feFlood flood-color="${ol.c}" flood-opacity="${ol.o}"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : '';
  return L.doc(bbox, scale, `<defs>${olf}${dstr}</defs>` + body);
}
module.exports = Object.assign({}, L, { tuft, furF, furLit, mir, samp, defs, part });
