// Painter helpers for the baked character parts (leo). Offline only: parts are drawn with heavy SVG filters,
// rendered by Chromium at 2-6x and stored as WebP (alpha). The game only moves the bitmaps.
const fs = require('fs'), path = require('path');
const { rng, f } = require('./lib.cjs');
exports.f = f; exports.rng = rng;
const pip = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
exports.pip = pip;
const dpath = (P, close = true) => 'M' + P.map(p => f(p[0]) + ' ' + f(p[1])).join('L') + (close ? 'Z' : '');
exports.dpath = dpath;
const ellPts = (cx, cy, rx, ry, n = 48, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
exports.ellPts = ellPts;
// Catmull-Rom through points (closed or open) -> bezier path string
exports.cr = (pts, closed = true) => {
  const n = pts.length; let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const g = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) { const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`; }
  return d + (closed ? 'Z' : '');
};
// dense polygon from Catmull-Rom points (for point-in-polygon)
exports.dense = (pts, per = 10) => { const n = pts.length, out = [];
  for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    for (let k = 0; k < per; k++) { const t = k / per, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(j => .5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
  return out; };
// gradient registry for a part
class G {
  constructor(p) { this.p = p; this.n = 0; this.defs = []; G.all[p] = this; }
  id() { return this.p + (this.n++); }
  lin(x1, y1, x2, y2, st) { const i = this.id(); this.defs.push(`<linearGradient id="${i}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`); return `url(#${i})`; }
  rad(cx, cy, r, st, fx, fy) { const i = this.id(); this.defs.push(`<radialGradient id="${i}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}"${fx != null ? ` fx="${fx}" fy="${fy}"` : ''}>${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</radialGradient>`); return `url(#${i})`; }
  ell(cx, cy, rx, ry, st, rot = 0) { const i = this.id(); this.defs.push(`<radialGradient id="${i}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${cx} ${cy}) rotate(${rot}) scale(${rx} ${ry})">${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</radialGradient>`); return `url(#${i})`; }
  clip(d) { const i = this.id(); this.defs.push(`<clipPath id="${i}"><path d="${d}"/></clipPath>`); return `url(#${i})`; }
  mask(inner) { const i = this.id(); this.defs.push(`<mask id="${i}" maskUnits="userSpaceOnUse" x="-1000" y="-1000" width="3000" height="3000">${inner}</mask>`); return `url(#${i})`; }
  filt(inner, extra = '') { const i = this.id(); this.defs.push(`<filter id="${i}" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="1200" color-interpolation-filters="sRGB" ${extra}>${inner}</filter>`); return `url(#${i})`; }
  blur(s) { return this.filt(`<feGaussianBlur stdDeviation="${s}"/>`); }
  // woven cloth: lit bump from noise, multiplied into the source colour
  cloth(freq = .9, amt = 1.1, seed = 3) { return this.filt(`<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${amt} ${amt} 0 0 ${1 - amt * .9}" result="m"/><feColorMatrix in="n" type="matrix" values="${amt * .6} 0 0 0 ${1 - amt * .5}  0 ${amt * .6} 0 0 ${1 - amt * .5}  0 0 ${amt * .6} 0 ${1 - amt * .5}  0 0 0 0 1" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="gc"/><feBlend in="gc" in2="SourceGraphic" mode="multiply"/>`); }
  rough(freq = .35, scale = 2.2, seed = 5) { return this.filt(`<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>`); }
}
G.all = {};
exports.G = G;
// hair-like strands. o: {n, seed, box:[x0,y0,x1,y1], inside:(x,y)=>bool, flow:(x,y)=>angle(rad), len:[a,b], w:[a,b], cols:[[color,weight]], op:[a,b], curl, jit}
exports.strands = (o) => {
  const R = rng(o.seed || 9), groups = {}; const tw = o.cols.reduce((s, c) => s + c[1], 0);
  let made = 0, tries = 0;
  while (made < o.n && tries < o.n * 12) { tries++;
    const x = o.box[0] + R() * (o.box[2] - o.box[0]), y = o.box[1] + R() * (o.box[3] - o.box[1]);
    if (o.inside && !o.inside(x, y)) continue; made++;
    let a = o.flow(x, y) + (R() - .5) * (o.jit == null ? .35 : o.jit), L = o.len[0] + R() * (o.len[1] - o.len[0]);
    const cv = (o.curl == null ? .25 : o.curl) * (R() - .35);
    const mx = x + Math.cos(a + cv) * L * .5, my = y + Math.sin(a + cv) * L * .5, ex = x + Math.cos(a + cv * 2) * L, ey = y + Math.sin(a + cv * 2) * L;
    let r = R() * tw, c = o.cols[0][0]; for (const cc of o.cols) { r -= cc[1]; if (r <= 0) { c = cc[0]; break; } }
    const w = o.w[0] + R() * (o.w[1] - o.w[0]), op = o.op[0] + R() * (o.op[1] - o.op[0]);
    const k = c + '|' + w.toFixed(1) + '|' + op.toFixed(2);
    (groups[k] = groups[k] || []).push(`M${f(x)} ${f(y)}Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}`);
  }
  return Object.entries(groups).map(([k, v]) => { const [c, w, op] = k.split('|'); return `<path d="${v.join('')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round"/>`; }).join('');
};
// render parts -> WebP data URIs. part: {name, x, y, w, h, s, svg(inner incl <defs>), q}
exports.bake = async (parts, outDir) => {
  const { chromium } = require('/home/user/nebula/node_modules/playwright');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true }); const res = {};
  for (const p of parts) {
    p.svg = p.svg.replace(/@@D:([^@]+)@@/g, (m, k) => (G.all[k] ? G.all[k].defs.join('') : ''));
    const page = await b.newPage({ viewport: { width: Math.ceil(p.w * p.s), height: Math.ceil(p.h * p.s) } });
    await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block}</style><svg xmlns="http://www.w3.org/2000/svg" width="${p.w * p.s}" height="${p.h * p.s}" viewBox="${p.x} ${p.y} ${p.w} ${p.h}" stroke-linejoin="round" stroke-linecap="round">${p.svg}</svg>`);
    await page.waitForTimeout(150);
    const png = await page.screenshot({ omitBackground: true }); await page.close();
    const q = await b.newPage(); await q.setContent('<canvas id=c></canvas>');
    const url = await q.evaluate(async ([d, q]) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.getElementById('c'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/webp', q); }, [png.toString('base64'), p.q || .9]);
    await q.close();
    fs.mkdirSync(outDir, { recursive: true }); fs.writeFileSync(path.join(outDir, p.name + '.png'), png); fs.writeFileSync(path.join(outDir, p.name + '.webp'), Buffer.from(url.split(',')[1], 'base64'));
    res[p.name] = { x: p.x, y: p.y, w: p.w, h: p.h, uri: url }; console.log(p.name, (url.length * .75 / 1024) | 0, 'KB');
  }
  await b.close(); return res;
};
