#!/usr/bin/env node
/* wobble.cjs (leo): bakes the hand-inked wobble INTO the geometry so the art needs no SVG filters at runtime.
 *
 * Every shell filter (roughS/C/L/U = feTurbulence + feDisplacementMap) is re-run by the browser whenever anything near it repaints; with ~12 filtered scene groups,
 * 20 filtered symbols, Koji, logo and frame that made software rendering crawl (3 fps). This tool replaces each filtered shape (path, circle, ellipse, rect, line, polyline,
 * polygon) with a plain <path> whose outline is resampled, pushed by the same kind of Perlin noise the filter used, and simplified (Douglas-Peucker).
 * The displacement is a pure function of the point, so identical shapes (clip/mask copies of a shape) stay identical. Text is left untouched (crisp).
 *
 *   node art/wobble.cjs            (processes all files; raw sources are kept in art/raw/, the final files overwrite the ones in the slot folder)
 * Workflow: run a generator (build.cjs, scene2.cjs, frame.cjs, char.cjs: they write the raw filtered file), then `node art/wobble.cjs`.
 */
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const SLOT = path.resolve(__dirname, '..'), RAW = path.join(__dirname, 'raw');
const FILES = ['symbols.svg', 'scene.html', 'character.html', 'logo.html', 'frame.html', 'side.html'];
fs.mkdirSync(RAW, { recursive: true });

const IN_PAGE = (LV) => {
  // ---- Perlin noise (seeded) ----
  const mkNoise = seed => { let s = seed >>> 0; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const g = []; for (let i = 0; i < 256; i++) { const a = rnd() * 6.2832; g.push([Math.cos(a), Math.sin(a)]); }
    const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    const P = i => p[i & 255]; const f = t => t * t * t * (t * (t * 6 - 15) + 10);
    return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const d = (ix, iy, dx, dy) => { const v = g[P(P(ix) + iy)]; return v[0] * dx + v[1] * dy; };
      const u = f(xf), v = f(yf);
      const a = d(xi, yi, xf, yf), b = d(xi + 1, yi, xf - 1, yf), c = d(xi, yi + 1, xf, yf - 1), e = d(xi + 1, yi + 1, xf - 1, yf - 1);
      return (a + (b - a) * u) + ((c + (e - c) * u) - (a + (b - a) * u)) * v; }; };
  const nz = {}; for (const k in LV) { nz[k] = [mkNoise(LV[k].seed), mkNoise(LV[k].seed + 77)]; }
  const fbm = (fn, x, y) => fn(x, y) + .5 * fn(x * 2.03 + 11.1, y * 2.03 + 5.3);
  const SHAPES = new Set(['path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon']);
  const levelOf = el => { for (let n = el; n && n.nodeType === 1; n = n.parentNode) { const f = n.getAttribute && (n.getAttribute('filter') || ''); const m = /url\(#(rough[A-Z])\)/.exec(f || ''); if (m) return m[1]; } return null; };
  const cache = new Map(); let nShape = 0, nPts = 0;
  const rdp = (pts, eps) => { const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1; const st = [[0, pts.length - 1]];
    while (st.length) { const [a, b] = st.pop(); let md = 0, mi = -1; const [ax, ay] = pts[a], [bx, by] = pts[b]; const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
      for (let i = a + 1; i < b; i++) { const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / L; if (d > md) { md = d; mi = i; } }
      if (md > eps && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
    return pts.filter((_, i) => keep[i]); };
  const rdpC = (pts, eps) => { const a = pts[0], b = pts[pts.length - 1]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 1e-6) return rdp(pts, eps);
    let m = 0, md = -1; pts.forEach((q, i) => { const d = Math.hypot(q[0] - a[0], q[1] - a[1]); if (d > md) { md = d; m = i; } });
    if (m === 0 || m === pts.length - 1) return pts; return rdp(pts.slice(0, m + 1), eps).concat(rdp(pts.slice(m), eps).slice(1)); };
  const fmt = v => { const r = Math.round(v * 10) / 10; return String(r); };
  const doEl = (el, lv) => {
    const L = LV[lv]; const tag = el.localName;
    const geomAttrs = ['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'points'];
    const key = lv + '|' + tag + '|' + geomAttrs.map(a => el.getAttribute(a)).join('~');
    let nd = cache.get(key);
    if (!nd) {
      // split a path into subpaths so getPointAtLength does not jump
      let chunks = [];
      let probe = el;
      if (tag === 'path') { const d = el.getAttribute('d'); chunks = d.split(/(?=[Mm])/).map(s => s.trim()).filter(Boolean); }
      const out = [];
      const sample = (tmp) => { const tl = tmp.getTotalLength(); if (!(tl > 0)) return null; const n = Math.max(2, Math.ceil(tl / L.step)); const pts = [];
        for (let i = 0; i <= n; i++) { const q = tmp.getPointAtLength(tl * i / n); const x = q.x, y = q.y;
          pts.push([x + L.sc * fbm(nz[lv][0], x * L.fq, y * L.fq), y + L.sc * fbm(nz[lv][1], x * L.fq + 31.7, y * L.fq + 17.9)]); }
        return pts; };
      const mkTmp = (dstr) => { const t = document.createElementNS('http://www.w3.org/2000/svg', 'path'); t.setAttribute('d', dstr); document.getElementById('__w').appendChild(t); return t; };
      let cur = [0, 0];
      const jobs = [];
      if (tag === 'path') {
        for (let ci = 0; ci < chunks.length; ci++) { let ch = chunks[ci];
          if (ci > 0 && ch[0] === 'm') { const m = /^m\s*([-\d.e]+)[ ,]+([-\d.e]+)(.*)$/s.exec(ch); ch = `M${cur[0] + +m[1]} ${cur[1] + +m[2]}` + (m[3].trim() ? ' l' + m[3] : ''); }
          const t = mkTmp(ch); const closed = /[zZ]\s*$/.test(ch); const pts = sample(t);
          // current point for a following relative 'm': end of this chunk (closed: its start)
          if (t.getTotalLength() > 0) { const e = t.getPointAtLength(closed ? 0 : t.getTotalLength()); cur = [e.x, e.y]; }
          t.remove(); if (pts) jobs.push([pts, closed]); }
      } else {
        const t = el.cloneNode(false); document.getElementById('__w').appendChild(t); const closed = tag !== 'line' && tag !== 'polyline'; const tl = t.getTotalLength();
        if (tl > 0) { const n = Math.max(2, Math.ceil(tl / L.step)); const pts = [];
          for (let i = 0; i <= n; i++) { const q = t.getPointAtLength(tl * i / n); pts.push([q.x + L.sc * fbm(nz[lv][0], q.x * L.fq, q.y * L.fq), q.y + L.sc * fbm(nz[lv][1], q.x * L.fq + 31.7, q.y * L.fq + 17.9)]); }
          jobs.push([pts, closed]); }
        t.remove();
      }
      nd = '';
      for (const [pts, closed] of jobs) { const s = rdpC(pts, L.eps); nPts += s.length; nd += 'M' + s.map(p => fmt(p[0]) + ' ' + fmt(p[1])).join('L') + (closed ? 'Z' : ''); }
      cache.set(key, nd);
    }
    const np = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    for (const a of [...el.attributes]) if (!geomAttrs.includes(a.name)) np.setAttribute(a.name, a.value);
    np.setAttribute('d', nd); el.replaceWith(np); nShape++;
  };
  // measure host (a tiny svg in the document)
  const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); host.id = '__w'; host.setAttribute('width', 1); host.setAttribute('height', 1); host.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden'; document.body.appendChild(host);
  const els = [...document.querySelectorAll('*')].filter(e => SHAPES.has(e.localName) && !e.closest('#__w') && !e.closest('pattern,linearGradient,radialGradient,filter'));
  for (const e of els) { const lv = levelOf(e); if (lv) doEl(e, lv); }
  // drop the filters
  for (const n of document.querySelectorAll('[filter*="rough"]')) n.removeAttribute('filter');
  host.remove();
  return { nShape, nPts };
};

(async () => {
  const LV = { roughS: { fq: .09, sc: 2.6 * .62, step: .8, eps: .2, seed: 4 }, roughC: { fq: .034, sc: 5 * .62, step: 1.4, eps: .22, seed: 9 },
    roughL: { fq: .014, sc: 9 * .62, step: 3, eps: .4, seed: 2 }, roughU: { fq: .03, sc: 3 * .62, step: 1.3, eps: .2, seed: 6 } };
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const only = process.argv.slice(2);
  for (const f of FILES) {
    if (only.length && !only.includes(f)) continue;
    const dst = path.join(SLOT, f), raw = path.join(RAW, f);
    let src = fs.readFileSync(dst, 'utf8');
    if (/filter="url\(#rough/.test(src)) fs.writeFileSync(raw, src);          // freshly generated raw file
    else if (fs.existsSync(raw)) src = fs.readFileSync(raw, 'utf8');            // already baked: start from the raw one
    else { console.log('skip (no filters, no raw):', f); continue; }
    const page = await browser.newPage();
    const svgFile = f.endsWith('.svg');
    await page.setContent('<!doctype html><body>' + (svgFile ? '<svg id="__root" width="0" height="0" style="position:absolute">' + src + '</svg>' : src));
    const t0 = Date.now();
    const r = await page.evaluate(IN_PAGE, LV);
    let out = await page.evaluate(svgFile => { const h = svgFile ? document.getElementById('__root').innerHTML : document.body.innerHTML; return h; }, svgFile);
    fs.writeFileSync(dst, out);
    console.log(f, 'shapes', r.nShape, 'points', r.nPts, 'bytes', src.length, '->', out.length, (Date.now() - t0) + 'ms');
    await page.close();
  }
  await browser.close();
})();
