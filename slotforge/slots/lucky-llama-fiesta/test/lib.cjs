// shared helpers for the Lucky Llama Fiesta look test (SVG strings, no filters)
const O = '#2a1209';
const defs = [];
let gid = 0;
function grad(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
  const id = 'g' + gid++;
  defs.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`);
  return `url(#${id})`;
}
function rgrad(stops, cx = .5, cy = .5, r = .5, fx, fy) {
  const id = 'g' + gid++;
  defs.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx !== undefined ? ` fx="${fx}" fy="${fy}"` : ''}>${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`);
  return `url(#${id})`;
}
let cid = 0;
function clip(inner) { const id = 'c' + cid++; defs.push(`<clipPath id="${id}">${inner}</clipPath>`); return `url(#${id})`; }
const p = (d, fill, sw = 3.5, extra = '') => `<path d="${d}" fill="${fill}" stroke="${O}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const np = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const ln = (d, stroke, sw = 2, extra = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const el = (cx, cy, rx, ry, fill, sw = 3, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${sw ? `stroke="${O}" stroke-width="${sw}"` : ''} ${extra}/>`;
const ci = (cx, cy, r, fill, sw = 3, extra = '') => el(cx, cy, r, r, fill, sw, extra);
const rc = (x, y, w, h, r, fill, sw = 3, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${sw ? `stroke="${O}" stroke-width="${sw}"` : ''} stroke-linejoin="round" ${extra}/>`;
function txt(s, x, y, size, fill, o = {}) {
  const f = o.font || 'Luck';
  const st = o.stroke ? `stroke="${o.stroke}" stroke-width="${o.sw || 4}" paint-order="stroke" stroke-linejoin="round"` : '';
  return `<text x="${x}" y="${y}" font-family="${f}" font-size="${size}" fill="${fill}" text-anchor="${o.anchor || 'middle'}" ${st} ${o.extra || ''}>${s}</text>`;
}
// fluffy blob: circles with ink outline trick
function fluff(cs, fill, ow = 2.6) {
  return cs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + ow}" fill="${O}"/>`).join('') + cs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`).join('');
}
function flower(cx, cy, r, n, petal, centre, rot = 0, sw = 2.4, inner) {
  let s = `<g transform="translate(${cx} ${cy}) rotate(${rot})">`;
  for (let i = 0; i < n; i++) s += `<ellipse cx="0" cy="${-r * .56}" rx="${r * .4}" ry="${r * .5}" fill="${petal}" stroke="${O}" stroke-width="${sw}" transform="rotate(${i * 360 / n})"/>`;
  if (inner) for (let i = 0; i < n; i++) s += `<ellipse cx="0" cy="${-r * .36}" rx="${r * .2}" ry="${r * .3}" fill="${inner}" transform="rotate(${(i + .5) * 360 / n})"/>`;
  s += `<circle r="${r * .26}" fill="${centre}" stroke="${O}" stroke-width="${sw * .8}"/><circle cx="${-r * .08}" cy="${-r * .08}" r="${r * .08}" fill="#fff" opacity=".7"/></g>`;
  return s;
}
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
module.exports = { O, defs, grad, rgrad, clip, p, np, ln, el, ci, rc, txt, fluff, flower, rng };
