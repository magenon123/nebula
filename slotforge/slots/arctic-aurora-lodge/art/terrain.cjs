// Hill-shaded mountain layers as RGBA PNG (no deps). node terrain.cjs -> bake/mtn-far.png, bake/mtn-near.png
const fs = require('fs'), zlib = require('zlib'), path = require('path');
function crc32(buf) { let c, crc = ~0; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return ~crc >>> 0; }
function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const chunk = (t, d) => { const b = Buffer.alloc(8 + d.length + 4); b.writeUInt32BE(d.length, 0); b.write(t, 4); d.copy(b, 8); b.writeUInt32BE(crc32(b.slice(4, 8 + d.length)), 8 + d.length); return b; };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
// value noise
function mk(seed) {
  const P = new Float32Array(256 * 256); let s = seed >>> 0; for (let i = 0; i < P.length; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; P[i] = s / 4294967296; }
  const at = (x, y) => P[((y & 255) << 8) | (x & 255)];
  return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return (at(xi, yi) * (1 - u) + at(xi + 1, yi) * u) * (1 - v) + (at(xi, yi + 1) * (1 - u) + at(xi + 1, yi + 1) * u) * v; };
}
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function layer(o) {
  const W = o.W, H = o.H, n1 = mk(o.seed), n2 = mk(o.seed + 7), n3 = mk(o.seed + 19);
  const ridged = (n, x, y) => 1 - Math.abs(n(x, y) * 2 - 1);
  // silhouette: sum of ridged peaks
  const sil = new Float32Array(W);
  for (let x = 0; x < W; x++) {
    let h = 0, a = 1, fq = o.fx, tot = 0;
    for (let k = 0; k < 6; k++) { h += a * Math.pow(ridged(n1, x * fq + 10 * k, k * 3.3), o.sharp); tot += a; a *= .5; fq *= 2.1; }
    h /= tot; const env = o.env(x / W); sil[x] = o.base - o.amp * (h * .9 + .1) * env;
  }
  const rr = (n, x, y) => Math.pow(ridged(n, x, y), 1.6);
  const z = (x, y) => { const yy = y - o.top, w = (n1(x / 110, yy / 100) - .5) * 90, xw = x + w; return .62 * rr(n2, xw / 170 + yy / 120, yy / 160) + .27 * rr(n3, xw / 66 + yy / 80, yy / 75) + .09 * rr(n1, xw / 24 + yy / 36, yy / 30) + yy * o.slope; };
  const buf = Buffer.alloc(W * H * 4), L = (() => { const v = [-.62, -.5, .6], m = Math.hypot(...v); return v.map(c => c / m); })();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const Y = y + o.top, r = sil[x], d = Y - r; // d>0 inside mountain
    const edge = sm(-1.2, 1.2, d); if (edge <= 0) continue;
    const zx = (z(x + 1, Y) - z(x - 1, Y)) * .5 * o.relief, zy = (z(x, Y + 1) - z(x, Y - 1)) * .5 * o.relief;
    let nx = -zx, ny = -zy, nz = 1; const m = Math.hypot(nx, ny, nz); nx /= m; ny /= m; nz /= m;
    const lam = Math.pow(Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]), 1.5), steep = Math.min(1, Math.hypot(zx, zy) * .9);
    const elev = 1 - Math.min(1, d / o.snowDepth);
    const snowN = n2(x / 30 + 50, Y / 14) * .5 + n3(x / 9, Y / 5) * .5;
    const snow = sm(.0, .5, elev * 1.2 + (1 - steep) * .65 - .5 + snowN * .4 - .12);
    const rock = [[6, 14, 26], [32, 62, 86]], snowC = [[18, 40, 76], [188, 232, 244]];
    let c0 = mixc(rock[0], rock[1], lam), c1 = mixc(snowC[0], snowC[1], Math.pow(lam, .85));
    let c = mixc(c0, c1, snow);
    // aurora tint on lit faces, violet in shadow
    c = mixc(c, [110, 255, 205], lam * lam * .16 * o.tint); c = mixc(c, [60, 40, 120], (1 - lam) * .12);
    // gully darkening
    const ao = rr(n2, x / 170 + (Y - o.top) / 120, (Y - o.top) / 160); c = c.map(v => v * (.78 + .32 * ao));
    // ridge rim light
    c = mixc(c, [160, 255, 220], Math.max(0, 1 - d / 3.5) * .6 * o.tint);
    // atmosphere
    const fogT = o.haze * (.45 + .55 * sm(0, o.base - o.top, Y - o.top + 0)); c = mixc(c, o.fog, Math.min(1, fogT));
    const i = (y * W + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = Math.round(255 * edge * (1 - sm(o.base - 14, o.base + 4, Y)));
  }
  return png(W, H, buf);
}
const out = path.join(__dirname, 'bake'); fs.mkdirSync(out, { recursive: true });
const far = layer({ W: 1600, H: 340, top: 140, seed: 5, base: 488, amp: 300, fx: 1 / 330, sharp: 1.5, snowDepth: 150, slope: .0016, relief: 17, haze: .42, tint: .7, fog: [22, 70, 86],
  env: t => .6 + .4 * Math.sin(t * 3.1 + .6) * Math.sin(t * 1.3 + 2) + .25 * Math.exp(-Math.pow((t - .22) / .12, 2)) });
fs.writeFileSync(path.join(out, 'mtn-far.png'), far);
const near = layer({ W: 1600, H: 260, top: 250, seed: 41, base: 500, amp: 190, fx: 1 / 240, sharp: 1.2, snowDepth: 110, slope: .0022, relief: 17, haze: .16, tint: 1, fog: [16, 50, 64],
  env: t => .5 + .5 * Math.sin(t * 4.4 + 2.2) * Math.sin(t * 2 + .4) * .9 + (t > .78 ? .08 : .12) });
fs.writeFileSync(path.join(out, 'mtn-near.png'), near);
console.log('mountains ok', far.length, near.length);
