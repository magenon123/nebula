const { Sym, shadow, snow, star, f, rng, fur, smooth, strokes } = require('./lib.cjs');
// ---------------------------------------------------------------- s4 brass compass
exports.s4 = () => {
  const S = new Sym('sy4'); shadow(S, 64, 112, 46, 7, .6);
  const brass = S.lin(20, 24, 108, 112, [[0, '#fff3b8'], [.2, '#ecc65c'], [.5, '#a06e24'], [.8, '#e3b950'], [1, '#6a4410']]);
  const brassIn = S.lin(20, 112, 108, 24, [[0, '#fff0aa'], [.4, '#c8922e'], [1, '#6a4410']]);
  const dial = S.rad(54, 58, 44, [[0, '#ffffff'], [.6, '#e4eef6'], [1, '#b6c8da']]);
  const cx = 64, cy = 70;
  let ticks = ''; for (let a = 0; a < 360; a += 5) { const r1 = a % 90 === 0 ? 27 : a % 30 === 0 ? 29.5 : 31.5, r2 = 34, rad = (a - 90) * Math.PI / 180; ticks += `M${f(cx + r1 * Math.cos(rad))} ${f(cy + r1 * Math.sin(rad))}L${f(cx + r2 * Math.cos(rad))} ${f(cy + r2 * Math.sin(rad))}`; }
  let rose = ''; for (let a = 0; a < 360; a += 45) { const L = a % 90 === 0 ? 25 : 16, w = a % 90 === 0 ? 4.4 : 3, rad = (a - 90) * Math.PI / 180, pr = rad + Math.PI / 2;
    rose += `<path d="M${f(cx + L * Math.cos(rad))} ${f(cy + L * Math.sin(rad))}L${f(cx + w * Math.cos(pr))} ${f(cy + w * Math.sin(pr))}L${cx} ${cy}Z" fill="${a % 90 === 0 ? '#2a3f66' : '#6a82a8'}" fill-opacity=".85"/><path d="M${f(cx + L * Math.cos(rad))} ${f(cy + L * Math.sin(rad))}L${f(cx - w * Math.cos(pr))} ${f(cy - w * Math.sin(pr))}L${cx} ${cy}Z" fill="#c9d8ea"/>`; }
  S.add(`<g class="a-comp">
   <!-- hanging ring + crown -->
   <circle cx="64" cy="13" r="8.5" fill="none" stroke="${brass}" stroke-width="4"/><circle cx="64" cy="13" r="8.5" fill="none" stroke="#3a2406" stroke-opacity=".5" stroke-width=".8"/>
   <rect x="58" y="19" width="12" height="9" rx="2" fill="${brassIn}" stroke="#3a2406" stroke-width="1"/><rect x="60" y="21" width="3" height="6" fill="#fff" opacity=".6"/>
   <!-- case -->
   <circle cx="${cx}" cy="${cy}" r="47" fill="#3a2406"/>
   <circle cx="${cx}" cy="${cy}" r="46" fill="${brass}" stroke="#2a1804" stroke-width="1"/>
   <circle cx="${cx}" cy="${cy}" r="42.5" fill="none" stroke="#fff6c8" stroke-opacity=".5" stroke-width="1"/>
   ${[...Array(24)].map((_, i) => { const a = i * 15 * Math.PI / 180; return `<path d="M${f(cx + 43.2 * Math.cos(a))} ${f(cy + 43.2 * Math.sin(a))}L${f(cx + 45.5 * Math.cos(a))} ${f(cy + 45.5 * Math.sin(a))}" stroke="#4a2c08" stroke-opacity=".55" stroke-width="1.1"/>`; }).join('')}
   <circle cx="${cx}" cy="${cy}" r="39" fill="${brassIn}" stroke="#2a1804" stroke-width="1"/>
   <circle cx="${cx}" cy="${cy}" r="36.5" fill="${dial}" stroke="#18304f" stroke-width="1.4"/>
   <circle cx="${cx}" cy="${cy}" r="36.5" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3" transform="translate(.8 1)"/>
   <path d="${ticks}" stroke="#18304f" stroke-width=".9"/>
   <circle cx="${cx}" cy="${cy}" r="24" fill="none" stroke="#6a82a8" stroke-opacity=".5" stroke-width=".8"/>
   ${rose}
   <g font-family="Cinzel,Georgia,serif" font-weight="900" text-anchor="middle" fill="#18304f">
    <text x="64" y="${cy - 25.5}" font-size="8.5" fill="#b3202c" stroke="#fff" stroke-width=".5" paint-order="stroke">N</text><text x="${cx + 26}" y="${cy + 3}" font-size="7">E</text><text x="64" y="${cy + 32}" font-size="7">S</text><text x="${cx - 26}" y="${cy + 3}" font-size="7">W</text></g>
   <g transform="rotate(16 ${cx} ${cy})"><g class="a-needle">
     <path d="M${cx} ${cy - 33}L${cx + 5} ${cy}L${cx - 5} ${cy}Z" fill="${S.lin(cx - 5, 0, cx + 5, 0, [[0, '#ff6a5c'], [.5, '#d4202e'], [1, '#7a0c1a']])}" stroke="#3a0610" stroke-width=".8"/>
     <path d="M${cx} ${cy + 33}L${cx + 5} ${cy}L${cx - 5} ${cy}Z" fill="${S.lin(cx - 5, 0, cx + 5, 0, [[0, '#ffffff'], [.5, '#c4d0de'], [1, '#6a7a8e']])}" stroke="#2a3446" stroke-width=".8"/>
     <path d="M${cx} ${cy - 30}L${cx - 1.8} ${cy - 4}" stroke="#fff" stroke-opacity=".7" stroke-width=".9"/>
     <circle cx="${cx}" cy="${cy}" r="3.6" fill="${brassIn}" stroke="#2a1804" stroke-width=".9"/><circle cx="${cx - 1}" cy="${cy - 1}" r="1.2" fill="#fff"/></g></g>
   <!-- glass -->
   <circle cx="${cx}" cy="${cy}" r="36.5" fill="${S.rad(cx - 12, cy - 18, 46, [[0, '#fff', .22], [.5, '#cfe8ff', .06], [1, '#0a1a3a', .22]])}"/>
   <path d="M33 62Q40 38 66 36Q50 44 46 66Q40 70 33 62Z" fill="#fff" opacity=".5"/>
   <path d="M${cx - 33} ${cy + 16}Q${cx} ${cy + 40} ${cx + 33} ${cy + 16}" fill="none" stroke="#bfe8ff" stroke-opacity=".4" stroke-width="2"/>
   <path d="M${cx + 30} ${cy - 14}Q${cx + 36} ${cy} ${cx + 30} ${cy + 14}" fill="none" stroke="#7dffc4" stroke-opacity=".6" stroke-width="1.6"/>
   <clipPath id="sy4gc"><circle cx="${cx}" cy="${cy}" r="36.5"/></clipPath>
   <g clip-path="url(#sy4gc)"><path class="a-gl" d="M20 30L34 30L58 112L44 112Z" fill="#fff" opacity="0" style="mix-blend-mode:screen"/></g>
  </g>`);
  S.add(star(98, 38, 7, 0, 'class="a-spk"'));
  S.anim('comp', { 0: 'transform:none', 12: 'transform:translateY(3px) scale(1.04,.95)', 28: 'transform:translateY(-8px) rotate(-6deg) scale(.97,1.04)', 46: 'transform:translateY(0) rotate(3deg) scale(1.03,.97)', 64: 'transform:rotate(-1.5deg)', 100: 'transform:none' }, { origin: '50% 100%' });
  S.anim('needle', { 0: 'transform:none', 22: 'transform:rotate(330deg)', 52: 'transform:rotate(760deg)', 66: 'transform:rotate(700deg)', 80: 'transform:rotate(728deg)', 100: 'transform:rotate(720deg)' }, { origin: '50% 50%', dur: 1.1, ease: 'cubic-bezier(.2,.6,.3,1)' });
  S.anim('gl', { 0: 'opacity:0;transform:translateX(-10px)', 50: 'opacity:0;transform:translateX(-10px)', 58: 'opacity:.9', 84: 'opacity:.9;transform:translateX(62px)', 85: 'opacity:0;transform:translateX(62px)', 100: 'opacity:0' }, { origin: '0 0' });
  S.anim('spk', { 0: 'opacity:0;transform:scale(.2)', 60: 'opacity:0;transform:scale(.2)', 72: 'opacity:1;transform:scale(1.5) rotate(25deg)', 92: 'opacity:0;transform:scale(.6) rotate(50deg)', 100: 'opacity:0' });
  return S.fit(1.04, 0, 1);
};
// ---------------------------------------------------------------- s5 hurricane lantern
exports.s5 = () => {
  const S = new Sym('sy5'); shadow(S, 64, 113, 36, 6, .6);
  S.add(`<ellipse cx="64" cy="106" rx="40" ry="8" fill="${S.ell(64, 106, 40, 8, [[0, '#ffb85a', .7], [1, '#ff8a20', 0]])}"/>`);
  const brass = (x0, x1) => S.lin(x0, 0, x1, 0, [[0, '#6a4410'], [.18, '#e8c15f'], [.4, '#fff3b8'], [.62, '#c28a2c'], [1, '#5a3a0e']]);
  const iron = S.lin(0, 0, 128, 0, [[0, '#0e1218'], [.3, '#3d4a5a'], [.5, '#8091a6'], [.7, '#2c3643'], [1, '#080b10']]);
  S.add(`<g class="a-swing">
   <!-- ring handle -->
   <path d="M46 34Q44 6 64 5Q84 6 82 34" fill="none" stroke="#0a0d12" stroke-width="5" stroke-linecap="round"/>
   <path d="M47 32Q46 10 64 7" fill="none" stroke="#9fb4ca" stroke-opacity=".7" stroke-width="1.2" stroke-linecap="round"/>
   <!-- top cap -->
   <path d="M38 40Q40 24 64 22Q88 24 90 40Z" fill="${iron}" stroke="#05080c" stroke-width="1.1"/>
   <path d="M44 36Q50 28 62 26" fill="none" stroke="#dff1ff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/>
   <rect x="32" y="39" width="64" height="8" rx="3" fill="${brass(32, 96)}" stroke="#3a2406" stroke-width="1"/>
   <!-- frame wires behind glass -->
   <path d="M38 47L33 98M90 47L95 98" stroke="#0a0d12" stroke-width="3.2" stroke-linecap="round"/>
   <!-- glass globe -->
   <path d="M40 47Q26 72 36 90Q40 98 46 98L82 98Q88 98 92 90Q102 72 88 47Z" fill="${S.lin(30, 0, 98, 0, [[0, 'rgba(150,200,255,.55)'], [.2, 'rgba(210,235,255,.18)'], [.5, 'rgba(255,230,180,.28)'], [.8, 'rgba(200,230,255,.2)'], [1, 'rgba(120,255,200,.5)']])}" stroke="#d4ecff" stroke-opacity=".7" stroke-width="1.2"/>
   <!-- glow in the glass -->
   <ellipse cx="64" cy="76" rx="26" ry="28" fill="${S.ell(64, 76, 26, 28, [[0, '#fff2b0', .95], [.35, '#ffb040', .6], [1, '#ff7a10', 0]])}" class="a-glow"/>
   <!-- wick holder + flame -->
   <rect x="54" y="88" width="20" height="9" rx="2" fill="${brass(54, 74)}" stroke="#3a2406" stroke-width="1"/>
   <rect x="60" y="82" width="8" height="7" fill="#1a1208"/><rect x="62" y="80" width="4" height="4" fill="#ffd9a0"/>
   <g class="a-flame"><path d="M64 48Q76 66 72 78Q70 84 64 84Q58 84 56 78Q52 66 64 48Z" fill="${S.lin(0, 48, 0, 84, [[0, '#ffe08a'], [.45, '#ffa628'], [1, '#e8421a']])}"/>
    <path d="M64 62Q70 72 68 78Q66 82 64 82Q61 82 60 78Q59 72 64 62Z" fill="#fffbe0"/><path d="M64 70Q66.5 75 65.5 79Q64.5 81 64 81Q63 81 62.5 79Q62 75 64 70Z" fill="#6aa8ff" opacity=".7"/></g>
   <!-- glass highlights -->
   <path d="M44 56Q36 72 40 88" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="2.6" stroke-linecap="round"/>
   <path d="M85 54Q94 70 90 86" fill="none" stroke="#7dffc4" stroke-opacity=".7" stroke-width="1.6" stroke-linecap="round"/>
   <circle cx="48" cy="52" r="1.6" fill="#fff"/>
   <!-- base -->
   <path d="M34 97H94L98 106Q64 112 30 106Z" fill="${iron}" stroke="#05080c" stroke-width="1.1"/>
   <rect x="32" y="97" width="64" height="6" rx="2.5" fill="${brass(32, 96)}" stroke="#3a2406" stroke-width="1"/>
   <path d="M38 106Q64 110 90 106" fill="none" stroke="#ffb040" stroke-opacity=".6" stroke-width="1.2"/>
   <!-- ember sparks -->
  </g>`);
  S.anim('swing', { 0: 'transform:none', 16: 'transform:rotate(-9deg)', 34: 'transform:rotate(10deg)', 52: 'transform:rotate(-6deg)', 70: 'transform:rotate(3deg)', 100: 'transform:none' }, { origin: '50% 0%' });
  S.anim('flame', { 0: 'transform:none', 20: 'transform:scale(1.35,1.5)', 40: 'transform:scale(.9,.9) skewX(5deg)', 60: 'transform:scale(1.25,1.35) skewX(-4deg)', 100: 'transform:none' }, { origin: '50% 100%' });
  S.anim('glow', { 0: 'transform:none;opacity:1', 20: 'transform:scale(1.25);opacity:1', 60: 'transform:scale(1.15)', 100: 'transform:none;opacity:1' }, { origin: '50% 50%' });
  return S.fit(1.0, 0, 0);
};
// ---------------------------------------------------------------- s6 silver fox
exports.s6 = () => {
  const S = new Sym('sy6'); shadow(S, 64, 118, 40, 5, .55);
  const mirror = (pts) => pts.map(([x, y]) => [128 - x, y]);
  const ruff = [[16, 94], [22, 110], [40, 122], [64, 125], [88, 122], [106, 110], [112, 94], [100, 84], [28, 84]];
  const head = smooth([[22, 62], [28, 46], [46, 38], [64, 36], [82, 38], [100, 46], [106, 62], [102, 80], [88, 96], [76, 106], [64, 110], [52, 106], [40, 96], [26, 80]], 6);
  const earL = [[28, 64], [16, 8], [36, 6], [62, 42]], earR = mirror(earL);
  const earInL = [[33, 54], [25, 18], [34, 17], [52, 42]], earInR = mirror(earInL);
  const cheekL = smooth([[24, 68], [38, 62], [50, 80], [58, 98], [46, 100], [32, 88]], 6), cheekR = mirror(cheekL);
  const dk = S.lin(0, 30, 0, 125, [[0, '#566074'], [.5, '#8d99ab'], [1, '#3b4456']]);
  const gr = S.rad(52, 50, 70, [[0, '#d9e2ec'], [.45, '#98a6b8'], [1, '#4c566a']]);
  const poly = (pts) => 'M' + pts.map(p => p.map(f).join(' ')).join('L') + 'Z';
  const earG = S.lin(0, 14, 0, 62, [[0, '#2a2a34'], [1, '#0f1016']]);
  const hClip = S.clip(`<path d="${poly(head)}"/>`);
  const radial = (x, y) => Math.atan2(y - 52, x - 64);
  S.add(`
   <path d="${fur(ruff, { seed: 11, len: 7, step: 5.5, sweep: .6 })}" fill="${S.lin(0, 84, 0, 125, [[0, '#a7b4c4'], [.5, '#dfe7ef'], [1, '#7f8da2']])}" stroke="#2a3446" stroke-width=".9"/>
   ${strokes({ n: 90, seed: 5, box: [18, 86, 110, 122], dir: (x, y) => Math.PI / 2 + (x - 64) * .012, len: [6, 12], w: 1.1, color: '#4c566a', op: .4 })}
   ${strokes({ n: 80, seed: 6, box: [18, 86, 110, 122], dir: (x, y) => Math.PI / 2 + (x - 64) * .012, len: [6, 11], w: 1, color: '#fff', op: .6 })}
   <g class="a-earL"><path d="${fur(earL, { seed: 2, len: 2, step: 5 })}" fill="${earG}" stroke="#05060a" stroke-width=".9"/><path d="${fur(earInL, { seed: 3, len: 3, step: 4 })}" fill="${S.lin(0, 24, 0, 52, [[0, '#f4ead8'], [1, '#c9b79a']])}"/>
     <path d="M27 58Q22 30 30 17" fill="none" stroke="#aab6cc" stroke-opacity=".6" stroke-width="1.2"/></g>
   <g class="a-earR"><path d="${fur(earR, { seed: 4, len: 2, step: 5 })}" fill="${earG}" stroke="#05060a" stroke-width=".9"/><path d="${fur(earInR, { seed: 5, len: 3, step: 4 })}" fill="${S.lin(0, 24, 0, 52, [[0, '#f4ead8'], [1, '#c9b79a']])}"/>
     <path d="M101 58Q106 30 98 17" fill="none" stroke="#7dffc4" stroke-opacity=".6" stroke-width="1.2"/></g>
   <g class="a-head">
   <path d="${fur(head, { seed: 21, len: 4, step: 5, sweep: .7 })}" fill="${gr}" stroke="#262e3e" stroke-opacity=".5" stroke-width=".6"/>
   <g clip-path="${hClip}">
    <path d="M47 36L64 34L81 36L74 62L64 70L54 62Z" fill="#454f63" opacity=".8"/>
    <path d="${fur(cheekL, { seed: 8, len: 4, step: 4 })}" fill="${S.lin(0, 62, 0, 100, [[0, '#f4f8fc'], [1, '#c8d3df']])}"/><path d="${fur(cheekR, { seed: 9, len: 4, step: 4 })}" fill="${S.lin(0, 62, 0, 100, [[0, '#f4f8fc'], [1, '#c8d3df']])}"/>
    ${strokes({ n: 110, seed: 12, box: [20, 36, 108, 110], dir: radial, len: [5, 11], w: 1, color: '#2d3648', op: .3, inside: (x, y) => y < 80 })}
    ${strokes({ n: 170, seed: 13, box: [20, 36, 108, 110], dir: radial, len: [5, 11], w: 1, color: '#eef4fa', op: .5 })}
    <!-- muzzle -->
    <path d="M52 80Q64 74 76 80Q82 96 64 110Q46 96 52 80Z" fill="${S.lin(0, 76, 0, 110, [[0, '#d8dee6'], [.6, '#f2f5f9'], [1, '#b8c4d2']])}"/>
    <path d="M52 82Q50 96 62 108M76 82Q78 96 66 108" fill="none" stroke="#2a3040" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
    ${strokes({ n: 70, seed: 15, box: [48, 78, 80, 108], dir: () => Math.PI / 2, len: [3, 6], w: .9, color: '#fff', op: .8, jit: 1 })}
    <!-- tear marks -->
    <path d="M55 70Q53 82 57 92M73 70Q75 82 71 92" fill="none" stroke="#1d2432" stroke-opacity=".7" stroke-width="2.2" stroke-linecap="round"/>
   </g>
   <!-- eyes -->
   ${[[0, 36, 62, 56, 68], [1, 92, 62, 72, 68]].map(([i, ox, oy, ix, iy]) => { const m = i ? 1 : 0, cx = (ox + ix) / 2, cy = (oy + iy) / 2 - 1; return `
    <path d="M${ox} ${oy}Q${cx} ${cy - 8} ${ix} ${iy}Q${cx} ${cy + 5} ${ox} ${oy}Z" fill="#05060a"/>
    <path d="M${ox + (i ? -1 : 1)} ${oy + .5}Q${cx} ${cy - 6.5} ${ix + (i ? 1 : -1)} ${iy - .3}Q${cx} ${cy + 3.4} ${ox + (i ? -1 : 1)} ${oy + .5}Z" fill="${S.rad(cx, cy - 1, 9, [[0, '#ffe27a'], [.5, '#f0a020'], [1, '#8a4a0a']])}"/>
    <ellipse cx="${cx}" cy="${cy - .4}" rx="1.6" ry="4" fill="#05060a" transform="rotate(${i ? 8 : -8} ${cx} ${cy})"/>
    <circle cx="${cx - 2.2}" cy="${cy - 2.6}" r="1.3" fill="#fff"/>
    <path class="a-lid${i}" d="M${ox - 2} ${oy - 1}Q${cx} ${cy - 11} ${ix + 2} ${iy - 1}L${ix + 2} ${iy + 3}Q${cx} ${cy + 4} ${ox - 2} ${oy + 2}Z" fill="${S.lin(0, 52, 0, 72, [[0, '#7e8aa0'], [1, '#aab6c6']])}" opacity="0"/>
    <path d="M${ox - (i ? -4 : 4)} ${oy - 3}Q${cx} ${cy - 11} ${ix + (i ? 4 : -4)} ${iy - 4}" fill="none" stroke="#eef4fa" stroke-opacity=".9" stroke-width="2.4" stroke-linecap="round"/>`; }).join('')}
   <!-- nose -->
   <g class="a-nose"><path d="M56 96Q64 91 72 96Q72 102 64 105Q56 102 56 96Z" fill="${S.rad(60, 94, 14, [[0, '#4a5262'], [.5, '#14181f'], [1, '#05060a']])}"/><ellipse cx="60.5" cy="95" rx="3" ry="1.5" fill="#fff" opacity=".8"/></g>
   <path d="M64 105V109M64 109Q58 112 54 109M64 109Q70 112 74 109" fill="none" stroke="#1d2432" stroke-width="1.3" stroke-linecap="round"/>
   <path d="M20 66Q10 62 6 64M20 72Q8 72 4 76M108 66Q118 62 122 64M108 72Q120 72 124 76" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width=".9" stroke-linecap="round"/>
   <path d="M100 48Q106 62 102 80" fill="none" stroke="#7dffc4" stroke-opacity=".7" stroke-width="1.6" stroke-linecap="round"/>
   <path d="M30 48Q40 38 56 38" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"/>
   </g>`);
  S.add(star(96, 46, 6, 0, 'class="a-spk"'));
  S.anim('head', { 0: 'transform:none', 14: 'transform:rotate(-9deg) translateY(3px)', 32: 'transform:rotate(8deg) translateY(-3px) scale(1.04)', 50: 'transform:rotate(-4deg)', 68: 'transform:rotate(2deg)', 100: 'transform:none' }, { origin: '50% 90%' });
  S.anim('earL', { 0: 'transform:none', 18: 'transform:rotate(-14deg)', 30: 'transform:rotate(6deg)', 44: 'transform:rotate(-10deg)', 60: 'transform:none' }, { origin: '70% 90%' });
  S.anim('earR', { 0: 'transform:none', 22: 'transform:rotate(14deg)', 36: 'transform:rotate(-6deg)', 50: 'transform:rotate(10deg)', 66: 'transform:none' }, { origin: '30% 90%' });
  const bl = { 0: 'opacity:0', 40: 'opacity:0', 42: 'opacity:1', 50: 'opacity:1', 52: 'opacity:0', 100: 'opacity:0' };
  S.anim('lid0', bl, {}); S.anim('lid1', bl, {});
  S.anim('nose', { 0: 'transform:none', 20: 'transform:translateY(1px) scale(1.15,1.2)', 30: 'transform:scale(.95)', 40: 'transform:scale(1.12)', 60: 'transform:none' }, { origin: '50% 50%' });
  S.anim('spk', { 0: 'opacity:0;transform:scale(.2)', 50: 'opacity:0;transform:scale(.2)', 64: 'opacity:1;transform:scale(1.5) rotate(25deg)', 86: 'opacity:0;transform:scale(.6)', 100: 'opacity:0' });
  return S.fit(1.0, 0, -2);
};
// ---------------------------------------------------------------- s7 snowy owl
exports.s7 = () => {
  const S = new Sym('sy7'); shadow(S, 64, 119, 54, 5, .55);
  const body = smooth([[64, 14], [82, 20], [95, 36], [100, 58], [101, 82], [92, 104], [64, 113], [36, 104], [27, 82], [28, 58], [33, 36], [46, 20]], 6);
  const wingL = smooth([[34, 60], [24, 80], [28, 102], [44, 108], [48, 82], [44, 62]], 6), wingR = wingL.map(([x, y]) => [128 - x, y]);
  const whiteG = S.rad(52, 44, 80, [[0, '#ffffff'], [.5, '#e8eef6'], [1, '#98a8be']]);
  const barG = S.lin(0, 40, 0, 110, [[0, '#f2f6fb'], [1, '#aebccf']]);
  const bark = S.lin(0, 108, 0, 124, [[0, '#8a6544'], [.5, '#5a3e26'], [1, '#2a1a0e']]);
  const poly = (pts) => 'M' + pts.map(p => p.map(f).join(' ')).join('L') + 'Z';
  const bClip = S.clip(`<path d="${poly(body)}"/>`);
  const R = rng(31); let flecks = '';
  for (let i = 0; i < 70; i++) { const x = 26 + R() * 76, y = 54 + R() * 56; const dx = (x - 64) / 38, edge = Math.abs(dx); if (y < 58 + edge * 6 && Math.abs(x - 64) < 34) continue; const w = 1.6 + R() * 2.2; flecks += `M${f(x - w)} ${f(y)}Q${f(x)} ${f(y + 2.4 + R() * 1.6)} ${f(x + w)} ${f(y)}`; }
  S.add(`
   <!-- branch -->
   <path d="M2 116Q30 106 64 111Q100 106 126 114L126 121Q100 116 64 120Q30 116 2 122Z" fill="${bark}" stroke="#1a0e06" stroke-width="1"/>
   <path d="M6 114Q34 108 64 112Q100 108 122 113" fill="none" stroke="#d6b88c" stroke-opacity=".5" stroke-width="1"/>
   <path d="M4 112Q30 102 64 108Q100 102 124 111Q112 108 100 108Q64 104 28 108Q14 108 4 112Z" fill="${S.lin(0, 102, 0, 112, [[0, '#fbfdff'], [1, '#b9d0e8']])}"/>
   <path d="M26 108Q64 104 100 108" fill="none" stroke="#7dffc4" stroke-opacity=".5" stroke-width="1"/>
   <g class="a-owl">
   <path d="${fur(body, { seed: 41, len: 5, step: 4.8, sweep: .5 })}" fill="${whiteG}" stroke="#7b8ca4" stroke-width=".9"/>
   <g clip-path="${bClip}">
    <path d="${flecks}" fill="none" stroke="#4a3f3a" stroke-opacity=".5" stroke-width="1.1" stroke-linecap="round"/>
    ${strokes({ n: 90, seed: 9, box: [24, 14, 104, 112], dir: (x, y) => Math.PI / 2 + (x - 64) * .018, len: [5, 10], w: 1, color: '#fff', op: .7 })}
    ${strokes({ n: 30, seed: 10, box: [24, 14, 104, 112], dir: (x, y) => Math.PI / 2 + (x - 64) * .018, len: [5, 10], w: 1, color: '#8a9bb5', op: .35 })}
    <path d="M30 40Q36 24 52 20" fill="none" stroke="#fff" stroke-width="2" stroke-opacity=".8" stroke-linecap="round"/>
   </g>
   <!-- wings folded: barred -->
   <g class="a-wingL"><path d="${fur(wingL, { seed: 51, len: 4, step: 4.4, sweep: .8 })}" fill="${S.lin(24, 60, 48, 108, [[0, '#dfe6ef'], [1, '#a9b5c6']])}" stroke="#6e7e96" stroke-width=".8"/>
    <path d="M30 72L44 78M28 84L45 90M30 96L45 101" fill="none" stroke="#4a3f3a" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/></g>
   <g class="a-wingR"><path d="${fur(wingR, { seed: 52, len: 4, step: 4.4, sweep: .8 })}" fill="${S.lin(104, 60, 80, 108, [[0, '#dfe6ef'], [1, '#98a6bc']])}" stroke="#6e7e96" stroke-width=".8"/>
    <path d="M98 72L84 78M100 84L83 90M98 96L83 101" fill="none" stroke="#4a3f3a" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/></g>
   <!-- facial disc -->
   <ellipse cx="50" cy="46" rx="17" ry="16" fill="${S.rad(50, 44, 18, [[0, '#ffffff'], [1, '#dfe7f1']])}" stroke="#aab7ca" stroke-width="1"/><ellipse cx="78" cy="46" rx="17" ry="16" fill="${S.rad(78, 44, 18, [[0, '#ffffff'], [1, '#d6e0ec']])}" stroke="#aab7ca" stroke-width="1"/>
   <g class="a-head">
   ${[[50, 0], [78, 1]].map(([cx, i]) => `
    <circle cx="${cx}" cy="47" r="11.5" fill="#1a1612"/>
    <circle cx="${cx}" cy="47" r="10" fill="${S.rad(cx - 2, 44, 11, [[0, '#fff49a'], [.45, '#ffd21e'], [1, '#c98a08']])}"/>
    <circle cx="${cx}" cy="47" r="5.2" fill="#05050a"/>
    <circle cx="${cx - 3}" cy="43.6" r="2.2" fill="#fff"/><circle cx="${cx + 2.6}" cy="49.6" r="1" fill="#fff" opacity=".7"/>
    <path class="a-lid${i}" d="M${cx - 12} 46Q${cx} 33 ${cx + 12} 46L${cx + 12} 49Q${cx} 59 ${cx - 12} 49Z" fill="#e6edf5" stroke="#9aa9be" stroke-width=".8" opacity="0"/>
    <path d="M${cx - 12} ${i ? 37 : 34}Q${cx} ${i ? 31 : 33} ${cx + 12} ${i ? 34 : 37}" fill="none" stroke="#3a322e" stroke-opacity=".7" stroke-width="2.2" stroke-linecap="round"/>`).join('')}
   <path d="M64 50L58 61Q64 68 70 61Z" fill="${S.lin(58, 50, 70, 68, [[0, '#4a4a54'], [.5, '#15151b'], [1, '#05050a']])}"/><path d="M62 54L61 59" stroke="#fff" stroke-opacity=".7" stroke-width="1" stroke-linecap="round"/>
   <path d="M58 61Q64 64 70 61" stroke="#000" stroke-opacity=".3" fill="none"/>
   </g>
   <!-- toes -->
   <path d="M50 106Q48 111 52 113M58 108Q57 113 60 114M70 108Q71 113 68 114M78 106Q80 111 76 113" fill="none" stroke="#e6edf5" stroke-width="4.2" stroke-linecap="round"/>
   <path d="M52 112L51 116M60 113L60 117M68 113L68 117M76 112L77 116" stroke="#14141a" stroke-width="1.6" stroke-linecap="round"/>
   <path d="M95 40Q101 60 99 84" fill="none" stroke="#7dffc4" stroke-opacity=".7" stroke-width="1.6" stroke-linecap="round"/>
   </g>`);
  S.add(star(100, 28, 6, 0, 'class="a-spk"'));
  S.anim('head', { 0: 'transform:none', 14: 'transform:rotate(-12deg) translateY(2px)', 30: 'transform:rotate(16deg) translateY(-3px) scale(1.04)', 48: 'transform:rotate(-6deg)', 66: 'transform:rotate(3deg)', 100: 'transform:none' }, { origin: '50% 70%' });
  S.anim('owl', { 0: 'transform:none', 12: 'transform:translateY(3px) scale(1.04,.95)', 28: 'transform:translateY(-7px) scale(.97,1.04)', 44: 'transform:translateY(0) scale(1.03,.97)', 62: 'transform:none' }, { origin: '50% 100%' });
  S.anim('wingL', { 0: 'transform:none', 22: 'transform:rotate(14deg) translateX(-5px) scale(1.06)', 40: 'transform:rotate(-30deg) translateX(-12px) scale(1.2,1.1)', 56: 'transform:rotate(-30deg) translateX(-12px) scale(1.2,1.1)', 76: 'transform:rotate(4deg)', 100: 'transform:none' }, { origin: '85% 10%' });
  S.anim('wingR', { 0: 'transform:none', 22: 'transform:rotate(-14deg) translateX(5px) scale(1.06)', 40: 'transform:rotate(30deg) translateX(12px) scale(1.2,1.1)', 56: 'transform:rotate(30deg) translateX(12px) scale(1.2,1.1)', 76: 'transform:rotate(-4deg)', 100: 'transform:none' }, { origin: '15% 10%' });
  const bl = { 0: 'opacity:0', 66: 'opacity:0', 68: 'opacity:1', 76: 'opacity:1', 78: 'opacity:0', 100: 'opacity:0' };
  S.anim('lid0', bl, {}); S.anim('lid1', bl, {});
  S.anim('spk', { 0: 'opacity:0;transform:scale(.2)', 50: 'opacity:0;transform:scale(.2)', 64: 'opacity:1;transform:scale(1.5) rotate(25deg)', 86: 'opacity:0;transform:scale(.6)', 100: 'opacity:0' });
  return S.fit(1.0, 0, -1);
};
