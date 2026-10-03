// Layered snow-laden spruce for the baked near-tree layer. spruce(x, base, h, w, {seed, dark}) -> svg string (needs <defs> from spruceDefs)
const { rng, f } = require('./lib.cjs');
exports.defs = `<defs><linearGradient id="spTrunk" x1="0" x2="1"><stop offset="0" stop-color="#1c1410"/><stop offset=".6" stop-color="#3a2a1c"/><stop offset="1" stop-color="#0c0806"/></linearGradient>
<filter id="spB" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>`;
exports.spruce = (x, base, h, w, o = {}) => {
  const R = rng((o.seed || 1) * 7919 + Math.round(x)); const dark = o.dark == null ? .5 : o.dark; const top = base - h;
  const tiers = Math.max(10, Math.round(h / (o.step || 15)));
  let back = '', mid = '', front = '', snow = '', rim = '';
  const col = (lit) => { // lit 0..1 -> needle colour
    const a = [[5, 22, 26], [10, 46, 44], [22, 84, 70], [60, 140, 110]]; const k = Math.min(2.999, Math.max(0, (lit * .8 + (1 - dark) * .2) * 3)); const i = Math.floor(k), t = k - i;
    return `rgb(${a[i].map((v, j) => Math.round(v + (a[i + 1][j] - v) * t)).join(',')})`; };
  for (let i = 0; i < tiers; i++) {
    const t = (i + .5) / tiers, y = top + h * (.02 + t * .96), reach = w * (.1 + .9 * Math.pow(t, .85));
    for (const side of [-1, 1]) {
      const nl = t < .12 ? 1 : 2 + (R() < .5 ? 1 : 0);
      for (let k = 0; k < nl; k++) {
        const len = reach * (.62 + R() * .5) * (k === 0 ? 1 : .72), yy = y + (R() - .5) * h / tiers * .9;
        const droop = len * (.16 + R() * .18), sx = x, sy = yy;
        const ex = x + side * len, ey = yy + droop + len * .12;
        const cx = x + side * len * .5, cy = yy - len * .03;
        const bez = (u) => [(1 - u) * (1 - u) * sx + 2 * u * (1 - u) * cx + u * u * ex, (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * cy + u * u * ey];
        const layer = k === 0 ? (R() < .5 ? 'm' : 'f') : (R() < .6 ? 'b' : 'm');
        const lit = (1 - t * .55) * (side > 0 ? 1 : .7) * (layer === 'f' ? 1 : layer === 'm' ? .75 : .5);
        let d = '', d2 = '';
        const N = Math.max(8, Math.round(len / 2.6));
        for (let n = 0; n < N; n++) {
          const u = (n + R()) / N, [px, py] = bez(u); const L = 5 + R() * 9 * (1 - u * .25) + (u < .2 ? -2 : 0);
          const a = Math.PI / 2 + side * (-.55 + R() * .9) - side * u * .25; // mostly down, fanning outward
          d += `M${f(px)} ${f(py)}l${f(Math.cos(a) * L)} ${f(Math.sin(a) * L)}`;
          if (R() < .55) { const a2 = Math.PI / 2 + side * (.25 + R() * .8); d += `M${f(px)} ${f(py)}l${f(Math.cos(a2) * L * .8)} ${f(Math.sin(a2) * L * .8)}`; }
          if (R() < .35) { const a3 = -Math.PI / 2 + side * (.9 + R() * .6); d2 += `M${f(px)} ${f(py)}l${f(Math.cos(a3) * L * .5)} ${f(Math.sin(a3) * L * .5)}`; }
        }
        const sp = `<path d="M${f(sx)} ${f(sy)}Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}" stroke="#1a110a" stroke-width="${f(1.6 + len / 60)}" fill="none"/>`;
        const needles = `<path d="${d}" stroke="${col(lit)}" stroke-width="1.15" fill="none" stroke-linecap="round"/><path d="${d2}" stroke="${col(lit * 1.15)}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
        const g = sp + needles;
        if (layer === 'b') back += g; else if (layer === 'm') mid += g; else front += g;
        // snow lying on the limb + rim light from the aurora
        if (R() < .92) {
          const s0 = .08 + R() * .15, s1 = .55 + R() * .42; let sd = '', rd = '';
          for (let u = s0; u < s1; u += .035) { const [px, py] = bez(u); const wv = (1.6 + (1 - u) * 3.6) * (.6 + R() * .9); sd += `M${f(px - side * 2)} ${f(py - .6)}l${f(side * 4.4)} ${f(1.8)}`; rd += `${u === s0 ? 'M' : 'L'}${f(px)} ${f(py - wv * .7)}`; }
          snow += `<path d="${sd}" stroke="${side > 0 ? '#dff2ff' : '#a9c8e6'}" stroke-width="${f(2.6 + (1 - t) * 1.2)}" stroke-linecap="round" fill="none" opacity="${layer === 'b' ? .55 : .92}"/>`;
          if (side > 0 || t < .4) rim += `<path d="${rd}" stroke="#9affe0" stroke-width=".9" fill="none" opacity="${(.5 - t * .25).toFixed(2)}" stroke-linecap="round"/>`;
        }
      }
    }
  }
  const trunk = `<path d="M${f(x - w * .035)} ${f(base + 6)}L${f(x - w * .012)} ${f(top + h * .08)}L${f(x + w * .012)} ${f(top + h * .08)}L${f(x + w * .035)} ${f(base + 6)}Z" fill="url(#spTrunk)"/>`;
  const leader = `<path d="M${f(x)} ${f(top - h * .03)}L${f(x - 3)} ${f(top + h * .1)}L${f(x + 3)} ${f(top + h * .1)}Z" fill="${col(.8)}"/><path d="M${f(x)} ${f(top - h * .03)}l-2 14M${f(x)} ${f(top - h * .03)}l2 14" stroke="#dff2ff" stroke-width="2" opacity=".85"/>`;
  return trunk + `<g>${back}</g><g>${mid}</g>` + leader + `<g>${front}</g><g>${snow}</g><g>${rim}</g>`;
};
