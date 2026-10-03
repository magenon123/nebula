const fs = require('fs'), path = require('path');
const { Sym, shadow, snow, star, f, rng } = require('./lib.cjs');
// ---------------------------------------------------------------- s8 aurora crystal (the approved test crystal, re-fit to the 128 tile, no filters)
exports.s8 = () => {
  const S = new Sym('sy8');
  const src = fs.readFileSync(path.join(__dirname, '../test/gen-symbol.cjs'), 'utf8');
  const a = src.indexOf(' <linearGradient id="fL"'), b = src.indexOf(' <symbol id="sym"');
  let blk = src.slice(a, b).replace(/<\/g>\s*$/, '</g>');
  blk = blk.replace(/ filter="url\(#\w+\)"/g, '');
  // lift <radialGradient>/<linearGradient>/<clipPath>/<polygon id> defs into S.defs; the <g id="cry"> becomes a def group
  const ids = [...blk.matchAll(/id="(\w+)"/g)].map(m => m[1]);
  ids.forEach(i => { blk = blk.replace(new RegExp(`id="${i}"`, 'g'), `id="sy8${i}"`).replace(new RegExp(`url\\(#${i}\\)`, 'g'), `url(#sy8${i})`).replace(new RegExp(`href="#${i}"`, 'g'), `href="#sy8${i}"`); });
  S.def(blk);
  S.def(`<radialGradient id="sy8gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7dffc4" stop-opacity=".6"/><stop offset="1" stop-color="#7dffc4" stop-opacity="0"/></radialGradient>`);
  shadow(S, 66, 117, 50, 6, .6);
  S.add(`<ellipse class="a-aura" cx="64" cy="66" rx="52" ry="54" fill="url(#sy8gl)" opacity=".45" style="mix-blend-mode:screen"/>`);
  S.add(`<g transform="translate(64 62) scale(.4) translate(-203 -193)">
   <g class="a-sL"><use href="#sy8cry" transform="translate(98,340) rotate(-24) scale(.6) translate(-170,-334)" opacity=".95"/></g>
   <g class="a-sR"><use href="#sy8cry" transform="translate(318,342) rotate(21) scale(.48) translate(-240,-334)" opacity=".95"/></g>
   <g class="a-main"><use href="#sy8cry"/>
    <g clip-path="url(#sy8cryClip)"><polygon class="a-beam" points="120,40 160,40 230,340 190,340" fill="#fff" opacity="0" style="mix-blend-mode:screen"/></g></g>
  </g>`);
  S.add(`<path d="M16 117C26 108 40 106 52 110C62 106 78 106 90 110C102 106 112 108 118 117Z" fill="${S.lin(0, 104, 0, 120, [[0, '#f7fcff'], [.55, '#c4dcf2'], [1, '#6f94c6']])}"/><path d="M18 116C28 108 40 107 52 110C62 106 78 106 90 110" fill="none" stroke="#7dffc4" stroke-opacity=".55" stroke-width="1" stroke-linecap="round"/>`);
  S.add(`<g class="a-spk" style="mix-blend-mode:screen"><path d="M58 22l1.5-8 1.5 8 8 1.5-8 1.5-1.5 8-1.5-8-8-1.5z" fill="#fff"/></g>`);
  S.anim('main', { 0: 'transform:none', 14: 'transform:scale(.96,1.03)', 32: 'transform:scale(1.07)', 50: 'transform:scale(.99)', 70: 'transform:scale(1.03)', 100: 'transform:none' }, { origin: '50% 100%' });
  S.anim('sL', { 0: 'transform:none', 20: 'transform:rotate(-7deg)', 44: 'transform:rotate(4deg)', 70: 'transform:rotate(-1deg)', 100: 'transform:none' }, { origin: '50% 100%', delay: 80 });
  S.anim('sR', { 0: 'transform:none', 20: 'transform:rotate(7deg)', 44: 'transform:rotate(-4deg)', 70: 'transform:rotate(1deg)', 100: 'transform:none' }, { origin: '50% 100%', delay: 140 });
  S.anim('aura', { 0: 'opacity:.45;transform:scale(1)', 30: 'opacity:.95;transform:scale(1.14)', 100: 'opacity:.45;transform:scale(1)' });
  S.anim('beam', { 0: 'opacity:0;transform:translateX(-80px)', 22: 'opacity:0;transform:translateX(-80px)', 30: 'opacity:.7', 70: 'opacity:.7;transform:translateX(150px)', 71: 'opacity:0', 100: 'opacity:0' }, { origin: '0 0' });
  S.anim('spk', { 0: 'opacity:1;transform:scale(1)', 18: 'opacity:1;transform:scale(2.4) rotate(45deg)', 40: 'opacity:.9;transform:scale(.8) rotate(90deg)', 60: 'opacity:1;transform:scale(1.8) rotate(130deg)', 100: 'opacity:1;transform:scale(1) rotate(180deg)' }, { origin: '50% 50%' });
  return S.fit(1.08, 0, 1);
};
// ---------------------------------------------------------------- s9 WILD: aurora orb on a banner
exports.s9 = () => {
  const S = new Sym('sy9'); shadow(S, 64, 118, 44, 5, .5);
  const cx = 64, cy = 54, R = 35;
  const gold = S.lin(0, 92, 0, 124, [[0, '#fff3b8'], [.3, '#e8c15f'], [.7, '#a06e24'], [1, '#e3b950']]);
  const orbClip = S.clip(`<circle cx="${cx}" cy="${cy}" r="${R}"/>`);
  let rays = ''; for (let i = 0; i < 8; i++) { const a = i * 45 * Math.PI / 180, L = i % 2 ? 50 : 62, w = i % 2 ? 4 : 5.5, px = Math.cos(a + 1.5708), py = Math.sin(a + 1.5708);
    rays += `<path d="M${f(cx + L * Math.cos(a))} ${f(cy + L * Math.sin(a))}L${f(cx + w * px)} ${f(cy + w * py)}L${f(cx - w * px)} ${f(cy - w * py)}Z"/>`; }
  const rib = (c1, c2, d, sw) => `<path d="${d}" fill="none" stroke="${S.lin(0, 20, 0, 90, [[0, c1], [1, c2]])}" stroke-width="${sw}" stroke-linecap="round" opacity="1"/>`;
  S.add(`<g class="a-rays" fill="${S.rad(cx, cy, 62, [[0, '#fff', .9], [.5, '#bff7ff', .45], [1, '#8a5cff', 0]])}" opacity=".75" style="mix-blend-mode:screen">${rays}</g>`);
  S.add(`<g class="a-orb">
   <circle cx="${cx}" cy="${cy}" r="${R + 5}" fill="${S.rad(cx, cy, R + 8, [[.7, '#7dffc4', .5], [1, '#7dffc4', 0]])}"/>
   <circle cx="${cx}" cy="${cy}" r="${R}" fill="${S.rad(cx - 8, cy - 12, R + 6, [[0, '#2a3a86'], [.6, '#0d1a54'], [1, '#050a26']])}"/>
   <g clip-path="${orbClip}">
    <g class="a-rib" style="mix-blend-mode:screen">
     ${rib('#3dffa8', '#a050ff', `M${cx - 40} ${cy + 18}C${cx - 20} ${cy - 30} ${cx + 4} ${cy + 36} ${cx + 40} ${cy - 20}`, 12)}
     ${rib('#00e0d0', '#e060ff', `M${cx - 40} ${cy + 4}C${cx - 16} ${cy - 40} ${cx + 10} ${cy + 20} ${cx + 40} ${cy - 6}`, 8)}
     ${rib('#80ffc8', '#7a50ff', `M${cx - 40} ${cy + 30}C${cx - 18} ${cy - 6} ${cx + 12} ${cy + 46} ${cx + 40} ${cy + 12}`, 6)}
    </g>
    <circle cx="${cx}" cy="${cy}" r="16" fill="${S.rad(cx, cy, 16, [[0, '#fff', 1], [.35, '#e8fff6', .7], [1, '#7dffc4', 0]])}" class="a-core"/>
    <ellipse cx="${cx + 8}" cy="${cy + 26}" rx="24" ry="10" fill="${S.ell(cx + 8, cy + 26, 24, 10, [[0, '#9dffe0', .8], [1, '#9dffe0', 0]])}"/>
   </g>
   <g class="a-star">${star(cx, cy, 20, 1)}${star(cx, cy, 11, 1, 'transform="rotate(45 64 54)"')}</g>
   <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${S.lin(cx - R, cy - R, cx + R, cy + R, [[0, '#ffffff'], [.4, '#8fe0ff'], [1, '#3a2a9a']])}" stroke-width="2.4"/>
   <path d="M${cx - 27} ${cy - 10}A29 29 0 0 1 ${cx - 6} ${cy - 28}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="3.4" stroke-linecap="round"/>
   <circle cx="${cx - 22}" cy="${cy - 17}" r="2" fill="#fff"/>
   <path d="M${cx + 30} ${cy - 10}Q${cx + 34} ${cy + 6} ${cx + 22} ${cy + 24}" fill="none" stroke="#7dffc4" stroke-opacity=".8" stroke-width="1.8" stroke-linecap="round"/>
  </g>
  <!-- banner -->
  <g class="a-ban"><path d="M10 98L20 94H108L118 98L112 108L118 118L108 122H20L10 118L16 108Z" fill="${S.lin(0, 94, 0, 122, [[0, '#2b3a82'], [.5, '#141c52'], [1, '#080d2c']])}" stroke="${gold}" stroke-width="2.6" stroke-linejoin="round"/>
   <path d="M22 96H106" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>
   <text x="64" y="117.5" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-weight="900" font-size="23" letter-spacing="1.5" fill="${S.lin(0, 98, 0, 120, [[0, '#ffffff'], [.5, '#ffe9a0'], [1, '#d9a032']])}" stroke="#3a2406" stroke-width="1.1" paint-order="stroke">WILD</text></g>`);
  S.add(star(100, 22, 6, 0, 'class="a-spk"'));
  S.anim('rays', { 0: 'transform:none', 100: 'transform:rotate(90deg)' }, { origin: '50% 50%', ease: 'cubic-bezier(.3,.7,.4,1)' });
  S.anim('orb', { 0: 'transform:none', 14: 'transform:scale(1.07,.93)', 34: 'transform:translateY(-6px) scale(.96,1.05)', 56: 'transform:scale(1.04,.97)', 78: 'transform:none', 100: 'transform:none' }, { origin: '50% 100%' });
  S.anim('rib', { 0: 'transform:none', 100: 'transform:rotate(200deg) scale(1.1)' }, { origin: '50% 50%', ease: 'cubic-bezier(.3,.7,.4,1)' });
  S.anim('core', { 0: 'transform:none', 30: 'transform:scale(1.5)', 60: 'transform:scale(.9)', 100: 'transform:none' }, { origin: '50% 50%' });
  S.anim('star', { 0: 'transform:none;opacity:1', 26: 'transform:scale(1.5) rotate(30deg)', 60: 'transform:scale(.85) rotate(60deg)', 100: 'transform:rotate(90deg)' }, { origin: '50% 50%' });
  S.anim('ban', { 0: 'transform:none', 30: 'transform:scale(1.07)', 50: 'transform:scale(.98)', 100: 'transform:none' }, { origin: '50% 50%' });
  S.anim('spk', { 0: 'opacity:0;transform:scale(.2)', 40: 'opacity:0', 56: 'opacity:1;transform:scale(1.5) rotate(25deg)', 80: 'opacity:0;transform:scale(.6)', 100: 'opacity:0' });
  return S.fit(1.0, 0, 0);
};
// ---------------------------------------------------------------- s10 SCATTER: ember sphere with ONLY the text FS
exports.s10 = () => {
  const S = new Sym('sy10'); shadow(S, 64, 118, 44, 5, .55);
  const cx = 64, cy = 74, R = 36;
  S.add(`<ellipse cx="64" cy="64" rx="56" ry="56" fill="${S.rad(64, 66, 58, [[.5, '#ff7a1a', .55], [1, '#ff7a1a', 0]])}"/>`);
  const tongue = (x, h, w, cls, c1) => `<path class="${cls}" d="M${x} ${cy - 22}Q${x - w} ${cy - 22 - h * .5} ${x - w * .3} ${cy - 22 - h}Q${x + w * .2} ${cy - 22 - h * .55} ${x + w * .9} ${cy - 22 - h * .9}Q${x + w * 1.1} ${cy - 22 - h * .3} ${x + w} ${cy - 20}Z" fill="${S.lin(0, cy - 22 - h, 0, cy - 20, [[0, '#fff3a0'], [.4, '#ffb52a'], [1, c1]])}"/>`;
  S.add(`<g class="a-fl">${tongue(38, 30, 8, 'a-t1', '#e8421a')}${tongue(90, 32, 8, 'a-t2', '#e8421a')}${tongue(50, 44, 11, 'a-t3', '#f06a14')}${tongue(78, 46, 11, 'a-t4', '#f06a14')}${tongue(64, 54, 12, 'a-t5', '#ff8a1c')}</g>`);
  S.add(`<g class="a-ball">
   <circle cx="${cx}" cy="${cy}" r="${R + 2.5}" fill="${S.lin(cx - R, cy - R, cx + R, cy + R, [[0, '#6a6e78'], [.4, '#2a2d36'], [1, '#07080c']])}"/>
   <circle cx="${cx}" cy="${cy}" r="${R}" fill="${S.rad(cx - 6, cy - 8, R + 6, [[0, '#fff1b0'], [.28, '#ffb12a'], [.6, '#e8420e'], [1, '#6a1408']])}"/>
   <clipPath id="sy10bc"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>
   <g clip-path="url(#sy10bc)" fill="none" stroke="#2a0c06" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 56L40 64M28 86L40 84L46 94M96 62L88 70L98 78M92 96L82 90M60 108L62 100" stroke-width="2.4" stroke-opacity=".75"/>
    <path d="M30 56L40 64M28 86L40 84L46 94M96 62L88 70L98 78M92 96L82 90M60 108L62 100" stroke="#ffd36a" stroke-width=".8" stroke-opacity=".9"/>
   </g>
   <path d="M${cx - 30} ${cy - 14}A33 33 0 0 1 ${cx - 6} ${cy - 33}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>
   <path d="M${cx + 32} ${cy - 8}Q${cx + 36} ${cy + 10} ${cx + 22} ${cy + 28}" fill="none" stroke="#7dffc4" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>
   <text class="a-fs" x="${cx}" y="${cy + 14}" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-weight="900" font-size="42" letter-spacing="1" fill="${S.lin(0, cy - 20, 0, cy + 16, [[0, '#ffffff'], [.55, '#fff0b8'], [1, '#ffc65a']])}" stroke="#4a1204" stroke-width="3.2" paint-order="stroke" stroke-linejoin="round">FS</text>
  </g>
  ${[[28, 40, 0], [100, 34, 1], [88, 14, 2]].map(([x, y, i]) => `<circle class="a-em${i}" cx="${x}" cy="${y}" r="2.2" fill="#ffd36a"/>`).join('')}`);
  const fl = (a, b, c, d) => ({ 0: 'transform:none', 25: `transform:scale(${a},${b}) skewX(${c}deg)`, 55: `transform:scale(${b},${a}) skewX(${-c}deg)`, 100: 'transform:none' });
  S.anim('t1', fl(.9, 1.3, 5), { origin: '50% 100%' }); S.anim('t2', fl(.9, 1.3, -5), { origin: '50% 100%', delay: 60 });
  S.anim('t3', fl(.85, 1.4, 6), { origin: '50% 100%', delay: 30 }); S.anim('t4', fl(.85, 1.4, -6), { origin: '50% 100%', delay: 90 }); S.anim('t5', fl(.8, 1.5, 3), { origin: '50% 100%' });
  S.anim('ball', { 0: 'transform:none', 12: 'transform:scale(1.08,.9)', 32: 'transform:translateY(-8px) scale(.95,1.07)', 54: 'transform:scale(1.05,.96)', 76: 'transform:none', 100: 'transform:none' }, { origin: '50% 100%' });
  S.anim('fs', { 0: 'transform:none', 30: 'transform:scale(1.18)', 52: 'transform:scale(.96)', 100: 'transform:none' }, { origin: '50% 50%' });
  [0, 1, 2].forEach(i => S.anim('em' + i, { 0: 'opacity:0;transform:none', 20: 'opacity:1', 100: `opacity:0;transform:translate(${[-10, 8, 4][i]}px,-30px)` }, { delay: i * 120 }));
  return S.fit(1.0, 0, 1);
};
// ---------------------------------------------------------------- s11 AURORA GEM (Aurora Sweep trigger)
exports.s11 = () => {
  const S = new Sym('sy11'); shadow(S, 64, 117, 46, 6, .6);
  S.add(`<ellipse class="a-aura" cx="64" cy="70" rx="56" ry="50" fill="${S.rad(64, 70, 56, [[.2, '#7dffc4', .5], [.6, '#a77bff', .25], [1, '#a77bff', 0]])}" style="mix-blend-mode:screen"/>`);
  const P = {};
  const pts = { tl: [18, 44], tr: [110, 44], a: [38, 24], b: [90, 24], c: [52, 24], d: [76, 24], l1: [38, 44], r1: [90, 44], m1: [64, 44], b0: [64, 112], sL: [26, 44], sR: [102, 44] };
  const poly = (...ks) => 'M' + ks.map(k => pts[k].join(' ')).join('L') + 'Z';
  const fc = (id, d, c1, c2, x1 = 0, y1 = 0, x2 = 1, y2 = 1) => `<path d="${d}" fill="${S.lin(x1, y1, x2, y2, [[0, c1], [1, c2]])}" stroke="#eafff8" stroke-opacity=".85" stroke-width=".9" stroke-linejoin="round"/>`;
  S.add(`<g class="a-gem">
   ${fc('', poly('tl', 'a', 'l1'), '#7dffd0', '#2aa8c8', 10, 24, 38, 44)}
   ${fc('', poly('a', 'c', 'l1'), '#d0fff0', '#6ae8d0', 38, 24, 52, 44)}
   ${fc('', poly('c', 'd', 'm1'), '#ffffff', '#b4f4ff', 52, 24, 76, 44)}
   ${fc('', poly('c', 'm1', 'l1'), '#a8f8e4', '#3cc4e0', 40, 24, 64, 44)}
   ${fc('', poly('d', 'r1', 'm1'), '#74b8ff', '#9a6cff', 64, 24, 90, 44)}
   ${fc('', poly('d', 'b', 'r1'), '#b4a0ff', '#6a4cd8', 76, 24, 90, 44)}
   ${fc('', poly('b', 'tr', 'r1'), '#8a5cff', '#3a2a9a', 90, 24, 110, 44)}
   ${fc('', poly('tl', 'l1', 'sL'), '#3ac8b8', '#1c7a9a')}
   <path d="M18 44H110L64 112Z" fill="${S.lin(18, 44, 110, 112, [[0, '#4af0c0'], [.45, '#3a9ad8'], [1, '#7a3cd0']])}"/>
   ${fc('', poly('tl', 'sL', 'b0'), '#38e0b4', '#1a8aa8', 18, 44, 40, 100)}
   ${fc('', 'M26 44L64 44L64 112Z', '#b8fff0', '#2ac8c8', 26, 44, 64, 112)}
   ${fc('', 'M64 44L102 44L64 112Z', '#80b4ff', '#6a3cd0', 64, 44, 102, 112)}
   ${fc('', 'M102 44L110 44L64 112Z', '#7a58e8', '#2a1a78', 102, 44, 84, 100)}
   ${fc('', 'M38 44L64 44L51 78Z', '#ecfffa', '#8af0e0', 38, 44, 64, 78)}
   ${fc('', 'M64 44L90 44L77 78Z', '#b8d4ff', '#8a78f0', 64, 44, 90, 78)}
   <path d="M26 44L38 44L51 78ZM90 44L102 44L77 78Z" fill="#fff" fill-opacity=".2"/>
   <path d="M18 44H110" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M38 24H90L110 44" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>
   <path d="M52 27H74L66 40Z" fill="#fff" fill-opacity=".85"/>
   <path d="M22 47L58 104" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>
   <clipPath id="sy11gc"><path d="M18 44L38 24H90L110 44L64 112Z"/></clipPath>
   <g clip-path="url(#sy11gc)"><path class="a-sheen" d="M10 20L26 20L52 120L36 120Z" fill="#fff" opacity="0" style="mix-blend-mode:screen"/></g>
  </g>
  <g class="a-spk" style="mix-blend-mode:screen"><path d="M50 30l2-12 2 12 12 2-12 2-2 12-2-12-12-2z" fill="#fff"/><circle cx="52" cy="32" r="9" fill="${S.rad(52, 32, 9, [[0, '#fff', .8], [1, '#fff', 0]])}"/></g>
  <g class="a-sp2" style="mix-blend-mode:screen">${star(100, 20, 6, 1)}${star(22, 90, 5, 1)}</g>`);
  S.add(`<path d="M16 117C26 108 40 106 52 110C62 106 78 106 90 110C102 106 112 108 118 117Z" fill="${S.lin(0, 104, 0, 120, [[0, '#f7fcff'], [.55, '#c4dcf2'], [1, '#6f94c6']])}" opacity=".0"/>`);
  S.anim('gem', { 0: 'transform:none', 12: 'transform:translateY(2px) scale(1.07,.92)', 30: 'transform:translateY(-12px) scale(.95,1.07)', 50: 'transform:translateY(0) scale(1.06,.94)', 68: 'transform:translateY(-3px) scale(.99,1.02)', 84: 'transform:none', 100: 'transform:none' }, { origin: '50% 100%' });
  S.anim('sheen', { 0: 'opacity:0;transform:translateX(0)', 24: 'opacity:0', 34: 'opacity:.9', 76: 'opacity:.9;transform:translateX(100px)', 77: 'opacity:0', 100: 'opacity:0;transform:translateX(100px)' }, { origin: '0 0' });
  S.anim('aura', { 0: 'opacity:.6;transform:scale(1)', 36: 'opacity:1;transform:scale(1.18)', 100: 'opacity:.6;transform:scale(1)' });
  S.anim('spk', { 0: 'opacity:1;transform:scale(1)', 20: 'opacity:1;transform:scale(2.2) rotate(40deg)', 44: 'opacity:.9;transform:scale(.8) rotate(90deg)', 64: 'opacity:1;transform:scale(1.8) rotate(130deg)', 100: 'opacity:1;transform:scale(1) rotate(180deg)' });
  S.anim('sp2', { 0: 'opacity:.3;transform:scale(.6)', 40: 'opacity:1;transform:scale(1.8) rotate(45deg)', 100: 'opacity:.3;transform:scale(.6) rotate(90deg)' });
  return S.fit(1.0, 0, 0);
};
// ---------------------------------------------------------------- sPrism: the prism cell of the Aurora Sweep sheet (+1 crossing)
exports.s12 = () => {
  const S = new Sym('sy12'); shadow(S, 64, 112, 42, 5, .5);
  S.add(`<g class="a-beam"><path d="M2 76L40 70L40 80Z" fill="${S.lin(2, 0, 40, 0, [[0, '#fff', 0], [1, '#fff', .95]])}"/>
   <path d="M88 66L126 38L128 46Z" fill="#7dffc4" opacity=".8" style="mix-blend-mode:screen"/><path d="M90 72L128 62L128 70Z" fill="#6ac8ff" opacity=".8" style="mix-blend-mode:screen"/><path d="M90 78L128 88L126 96Z" fill="#a77bff" opacity=".85" style="mix-blend-mode:screen"/></g>
   <g class="a-pri"><path d="M64 14L100 100L28 100Z" fill="${S.lin(28, 14, 100, 100, [[0, 'rgba(240,255,255,.95)'], [.4, 'rgba(120,210,255,.65)'], [1, 'rgba(90,70,200,.7)']])}" stroke="#eaffff" stroke-width="1.8" stroke-linejoin="round"/>
   <path d="M64 14L64 100M64 14L28 100" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>
   <path d="M64 38L88 96L40 96Z" fill="none" stroke="#bff" stroke-opacity=".35" stroke-width="1"/>
   <path d="M60 24L36 94" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/>
   <path d="M44 100H100L98 106H46Z" fill="#7dffc4" opacity=".35"/></g>`);
  S.anim('pri', { 0: 'transform:none', 18: 'transform:rotate(-8deg) scale(1.06)', 40: 'transform:rotate(7deg) scale(1.08)', 70: 'transform:rotate(-2deg)', 100: 'transform:none' }, { origin: '50% 100%' });
  S.anim('beam', { 0: 'opacity:.9', 30: 'opacity:1;transform:scale(1.15)', 100: 'opacity:.9' }, { origin: '50% 50%' });
  return S.fit(1.0, 0, 0);
};
