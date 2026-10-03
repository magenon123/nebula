const { Sym, shadow, snow, star, f, rng } = require('./lib.cjs');
const K = 'cubic-bezier(.3,.7,.3,1)';
// ---------------------------------------------------------------- s0 antler knife
exports.s0 = () => {
  const S = new Sym('sy0'); shadow(S, 66, 108, 50, 7, .6);
  const steel = S.lin(0, 52, 0, 76, [[0, '#f4fbff'], [.12, '#cfe0ee'], [.3, '#6f8aa6'], [.5, '#e9f3fb'], [.72, '#8da6bd'], [.9, '#d7e6f3'], [1, '#f8fdff']]);
  const edge = S.lin(0, 68, 0, 76, [[0, '#fff', .9], [1, '#9fb8cf', .2]]);
  const ant = S.lin(0, 52, 0, 78, [[0, '#fff6df'], [.35, '#e7d3a8'], [.75, '#b99a64'], [1, '#6d5430']]);
  const antD = S.lin(0, 52, 0, 78, [[0, '#f3e3bd'], [.5, '#c8aa72'], [1, '#7a5e36']]);
  const brass = S.lin(0, 52, 0, 78, [[0, '#fff0b0'], [.3, '#e0b24e'], [.65, '#9c6a1e'], [1, '#e8c15f']]);
  const leather = S.lin(0, 56, 0, 74, [[0, '#8a5a34'], [.4, '#5e3a20'], [1, '#2e1b0f']]);
  const clip = S.clip('<path d="M58 55H104Q118 55 127 63Q111 75 92 75H58Z"/>');
  S.add(`<g transform="rotate(-36 64 64) translate(0 4)"><g class="a-knife">
   <!-- tines -->
   <path d="M26 58Q22 44 27 34Q30 33 33 36Q31 46 36 57Z" fill="${ant}" stroke="#5c4526" stroke-width=".8"/>
   <path d="M27 36Q29 44 28 54" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1"/>
   <path d="M20 72Q14 82 17 90Q22 91 24 87Q23 82 28 74Z" fill="${antD}" stroke="#5c4526" stroke-width=".8"/>
   <!-- antler grip -->
   <path d="M12 62Q10 68 14 74Q22 79 38 76L57 74L57 55Q38 53 24 56Q14 57 12 62Z" fill="${ant}" stroke="#5c4526" stroke-width="1"/>
   <path d="M18 60Q34 57 55 58" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/>
   <path d="M17 70Q36 73 55 70M22 64Q38 63 52 64M20 67Q40 68 54 66" fill="none" stroke="#7a5e36" stroke-opacity=".5" stroke-width=".9" stroke-linecap="round"/>
   <path d="M28 59l5 3M40 71l4-2M47 61l5 2" stroke="#5c4526" stroke-opacity=".5" stroke-width="1.4" stroke-linecap="round"/>
   <ellipse cx="12.5" cy="67.5" rx="3.2" ry="6.2" fill="#6d5430"/><ellipse cx="12.2" cy="67.5" rx="1.5" ry="4" fill="#2a1d0e"/>
   <!-- leather wrap -->
   <path d="M43 54.5L43 75L48 75L48 54.5Z" fill="${leather}"/><path d="M43 54.5L43 75" stroke="#c9915a" stroke-opacity=".6" stroke-width=".8"/>
   <path d="M49 54.5L49 75L51.4 75L51.4 54.5Z" fill="${leather}"/>
   <!-- brass guard -->
   <path d="M55 51Q57.5 49.5 60 51L60 79Q57.5 80.5 55 79Z" fill="${brass}" stroke="#5a3a0e" stroke-width=".9"/>
   <path d="M56.4 52L56.4 78" stroke="#fff" stroke-opacity=".7" stroke-width="1"/><circle cx="57.6" cy="60" r="1.2" fill="#5a3a0e"/><circle cx="57.6" cy="70" r="1.2" fill="#5a3a0e"/>
   <!-- blade -->
   <path d="M60 55H104Q118 55 127 63Q111 75 92 75H60Z" fill="${steel}" stroke="#34465a" stroke-width="1"/>
   <path d="M60 55H104Q118 55 127 63" fill="none" stroke="#fff" stroke-width="1.4"/>
   <path d="M60 59H108Q116 60 120 63" fill="none" stroke="#34465a" stroke-opacity=".5" stroke-width="1.2"/><path d="M60 60.6H108Q115 61.5 118.6 63.4" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width=".8"/>
   <path d="M60 69Q90 72 118 65L127 63Q111 75 92 75H60Z" fill="${edge}"/>
   <path d="M93 75Q111 75 127 63" fill="none" stroke="#fff" stroke-width="1.2"/>
   <path d="M62 56.5H100" stroke="#7dffc4" stroke-opacity=".5" stroke-width="1"/>
   <g clip-path="${clip}"><path class="a-glint" d="M58 50L72 50L62 80L48 80Z" fill="#fff" opacity="0" style="mix-blend-mode:screen"/></g>
  </g></g>`);
  S.add(star(110, 52, 7, .0, 'class="a-spk"'));
  S.anim('knife', { 0: 'transform:none', 14: 'transform:rotate(-11deg) scale(.95)', 30: 'transform:rotate(14deg) scale(1.1)', 46: 'transform:rotate(-6deg) scale(1.03)', 62: 'transform:rotate(3deg)', 80: 'transform:rotate(-1deg)', 100: 'transform:none' }, { origin: '30% 60%' });
  S.anim('glint', { 0: 'opacity:0;transform:translateX(0)', 28: 'opacity:0;transform:translateX(0)', 36: 'opacity:.9', 70: 'opacity:.9;transform:translateX(78px)', 71: 'opacity:0;transform:translateX(78px)', 100: 'opacity:0;transform:translateX(78px)' }, { origin: '0 0' });
  S.anim('spk', { 0: 'opacity:0;transform:scale(.2)', 40: 'opacity:0;transform:scale(.2)', 55: 'opacity:1;transform:scale(1.4) rotate(20deg)', 80: 'opacity:0;transform:scale(.6) rotate(40deg)', 100: 'opacity:0' }, { origin: '50% 50%' });
  return S.fit(1.14, 4, -2);
};
// ---------------------------------------------------------------- s1 iron kettle
exports.s1 = () => {
  const S = new Sym('sy1'); shadow(S, 62, 110, 44, 7, .65);
  // warm glow from the stove under it
  S.add(`<ellipse cx="62" cy="106" rx="42" ry="9" fill="${S.ell(62, 106, 42, 9, [[0, '#ff9a3a', .75], [1, '#ff6a1a', 0]])}"/>`);
  const iron = S.rad(48, 52, 56, [[0, '#6c7a8d'], [.35, '#3b4655'], [.75, '#1a212b'], [1, '#0a0e14']], 44, 44);
  const rimL = S.lin(0, 36, 0, 100, [[0, 'rgba(160,220,255,0)'], [1, 'rgba(255,150,60,.55)']]);
  const lid = S.rad(52, 34, 32, [[0, '#7d8ba0'], [.5, '#3f4a5a'], [1, '#161c25']], 46, 30);
  const wood = S.lin(0, 0, 0, 1, [[0, '#a8754a'], [1, '#4a2c16']]);
  S.add(`<g class="a-pot">
   <!-- spout -->
   <path d="M96 78Q112 74 116 52Q118 46 122 44Q122 52 118 66Q112 86 94 92Z" fill="${S.lin(94, 50, 122, 90, [[0, '#59677a'], [.5, '#2a3340'], [1, '#0f141b']])}" stroke="#05080c" stroke-width="1"/>
   <path d="M98 78Q112 73 117 52" fill="none" stroke="#c4dcf2" stroke-opacity=".6" stroke-width="1.2"/>
   <ellipse cx="121" cy="44.5" rx="2.6" ry="1.6" fill="#050709"/>
   <!-- body -->
   <path d="M20 64Q18 96 40 104Q62 110 84 104Q106 96 104 64Q100 48 62 46Q24 48 20 64Z" fill="${iron}" stroke="#05080c" stroke-width="1.2"/>
   <path d="M20 64Q18 96 40 104Q62 110 84 104Q106 96 104 64" fill="none" stroke="${rimL}" stroke-width="3.5" opacity=".9"/>
   <path d="M26 62Q24 52 36 50" fill="none" stroke="#bfe4ff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>
   <path d="M28 70Q30 88 40 98" fill="none" stroke="#9ec6ea" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/>
   <path d="M98 66Q100 88 88 100" fill="none" stroke="#7dffc4" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"/>
   <!-- hoop rivets and seam -->
   <path d="M21 70Q62 78 103 70" fill="none" stroke="#0b0f15" stroke-width="2.2"/><path d="M21 71.8Q62 80 103 71.8" fill="none" stroke="#8aa1b8" stroke-opacity=".35" stroke-width="1"/>
   <g fill="#8ea4ba">${[30, 42, 55, 69, 82, 94].map((x, i) => `<circle cx="${x}" cy="${f(73.5 + Math.sin((x - 20) / 83 * 3.14) * 4)}" r="1.3"/>`).join('')}</g>
   <!-- lid + knob -->
   <path d="M30 50Q62 38 94 50L96 54Q62 46 28 54Z" fill="#12171f" stroke="#05080c" stroke-width="1"/>
   <g class="a-lid"><path d="M34 50Q36 38 62 34Q88 38 90 50Q62 44 34 50Z" fill="${lid}" stroke="#05080c" stroke-width="1"/>
    <path d="M38 46Q50 38 66 37" fill="none" stroke="#dff1ff" stroke-opacity=".75" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="62" cy="33" rx="6" ry="4" fill="#20272f" stroke="#05080c" stroke-width="1"/><ellipse cx="60.6" cy="31.6" rx="3" ry="1.6" fill="#a8b8c8" opacity=".8"/></g>
   <!-- bail handle: wire arc with a wood grip -->
   <path d="M24 60Q20 20 62 14Q104 20 100 60" fill="none" stroke="#0b0f15" stroke-width="3.6" stroke-linecap="round"/>
   <path d="M25 58Q22 24 62 16" fill="none" stroke="#7f95ab" stroke-opacity=".7" stroke-width="1" stroke-linecap="round"/>
   <rect x="46" y="9" width="32" height="10" rx="5" fill="${S.lin(0, 9, 0, 19, [[0, '#c18a58'], [.5, '#7a4a28'], [1, '#331d0e']])}" stroke="#1d1008" stroke-width="1"/>
   <path d="M50 11.5H74" stroke="#fff" stroke-opacity=".5" stroke-width="1" stroke-linecap="round"/><path d="M52 14.5Q58 16 64 14.5T76 14.5" fill="none" stroke="#2a170a" stroke-opacity=".6" stroke-width=".8"/>
   <circle cx="23" cy="61" r="3" fill="#5c6a7c" stroke="#05080c" stroke-width="1"/><circle cx="101" cy="61" r="3" fill="#5c6a7c" stroke="#05080c" stroke-width="1"/>
  </g>
  <!-- steam: soft discs that rise -->
  ${[[0, 112, 40], [1, 106, 30], [2, 118, 30]].map(([i, x, y]) => `<ellipse class="a-st${i}" cx="${x}" cy="${y}" rx="${7 - i}" ry="${6 - i}" fill="${S.rad(x, y, 8, [[0, '#fff', .85], [.6, '#dbeeff', .4], [1, '#dbeeff', 0]])}" opacity="0"/>`).join('')}`);
  const rise = (dx) => ({ 0: 'opacity:0;transform:translate(0,6px) scale(.5)', 25: 'opacity:.9', 100: `opacity:0;transform:translate(${dx}px,-34px) scale(1.9)` });
  S.anim('st0', rise(6), { delay: 120, dur: 1.1 }); S.anim('st1', rise(-4), { delay: 330, dur: 1.1 }); S.anim('st2', rise(8), { delay: 520, dur: 1.1 });
  S.anim('pot', { 0: 'transform:none', 12: 'transform:translateY(2px) scale(1.05,.94)', 30: 'transform:translateY(-6px) rotate(-9deg) scale(.97,1.04)', 52: 'transform:translateY(0) rotate(5deg) scale(1.03,.97)', 72: 'transform:rotate(-2deg)', 100: 'transform:none' }, { origin: '50% 100%' });
  S.anim('lid', { 0: 'transform:none', 16: 'transform:translateY(-9px) rotate(-5deg)', 26: 'transform:translateY(0)', 38: 'transform:translateY(-6px) rotate(4deg)', 48: 'transform:translateY(0)', 60: 'transform:translateY(-3px)', 70: 'transform:none', 100: 'transform:none' }, { origin: '50% 100%' });
  return S.fit(1.1, 0, -4);
};
// ---------------------------------------------------------------- s2 wool mittens
exports.s2 = () => {
  const S = new Sym('sy2'); shadow(S, 64, 110, 46, 7, .6);
  // knit: tiny V stitches pattern, used as texture over a colour base
  const pat = 'sy2knit';
  S.def(`<pattern id="${pat}" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0.4 .6L2.5 3.4L4.6 .6" fill="none" stroke="#000" stroke-opacity=".28" stroke-width=".9"/><path d="M0.4 -.4L2.5 2.4L4.6 -.4" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width=".7"/></pattern>`);
  const red = S.lin(0, 20, 0, 100, [[0, '#e0504c'], [.5, '#b02a36'], [1, '#6a1426']]);
  const cream = S.lin(0, 0, 0, 1, [[0, '#fff8ea'], [1, '#d9c9aa']]);
  const shade = (id, x1, y1, x2, y2) => S.lin(x1, y1, x2, y2, [[0, '#fff', .28], [.45, '#fff', 0], [1, '#000', .5]]);
  const mit = (cls, tx, rot, col, flip) => {
    const d = 'M-18 -4Q-22 -40 -4 -48Q16 -52 20 -34Q22 -26 22 -14Q30 -20 36 -16Q40 -10 32 2L24 14Q20 28 20 38L-14 38Q-14 20 -18 -4Z'; // fist + thumb
    const sh = shade(0, -20, -50, 30, 40);
    return `<g transform="translate(${tx} 64) rotate(${rot}) ${flip ? 'scale(-1 1)' : ''}"><g class="a-${cls}">
     <path d="${d}" fill="${col}" stroke="#2a0c14" stroke-width="1.2"/>
     <path d="${d}" fill="url(#${pat})"/>
     <path d="${d}" fill="${sh}"/>
     <!-- nordic band -->
     <clipPath id="sy2c${cls}"><path d="${d}"/></clipPath>
     <g clip-path="url(#sy2c${cls})"><rect x="-26" y="-12" width="60" height="9" fill="${cream}"/><rect x="-26" y="-12" width="60" height="9" fill="url(#${pat})"/>
      <g fill="#b02a36">${[-20, -10, 0, 10, 20, 30].map(x => `<path d="M${x} -7.5l3 -3 3 3 -3 3z"/>`).join('')}</g>
      <path d="M-26 -12H34M-26 -3H34" stroke="#2a0c14" stroke-opacity=".35" stroke-width=".8"/>
      <path d="M-26 20H34" stroke="none"/></g>
     <!-- cuff -->
     <path d="M-15 38L-15 54Q3 58 21 54L21 38Z" fill="${cream}" stroke="#2a0c14" stroke-width="1.2"/>
     <path d="M-12 39V54M-7 40V55M-2 40V56M3 40V56M8 40V55M13 39V55M18 39V54" stroke="#a89878" stroke-opacity=".8" stroke-width="1.5" stroke-linecap="round"/>
     <path d="M-15 38Q3 42 21 38" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="2"/>
     <!-- fuzz rim light -->
     <path d="M-18 -4Q-22 -40 -4 -48Q16 -52 20 -34" fill="none" stroke="#ffd3d0" stroke-opacity=".75" stroke-width="1.6" stroke-linecap="round"/>
     <path d="M32 2L24 14Q20 28 20 38" fill="none" stroke="#7dffc4" stroke-opacity=".55" stroke-width="1.3" stroke-linecap="round"/>
    </g></g>`;
  };
  S.add(mit('mL', 36, -14, red, false)); S.add(mit('mR', 92, 12, S.lin(0, 20, 0, 100, [[0, '#4a6fc6'], [.5, '#2a469a'], [1, '#14214e']]), true));
  // snow dust on the cuff line
  S.add(`<g class="a-puff" opacity="0" fill="${S.rad(64, 60, 10, [[0, '#fff', .9], [1, '#dff', 0]])}"><circle cx="64" cy="58" r="9"/><circle cx="56" cy="64" r="6"/><circle cx="72" cy="66" r="6"/></g>`);
  S.anim('mL', { 0: 'transform:none', 16: 'transform:translateX(-5px) rotate(-8deg)', 30: 'transform:translateX(10px) rotate(7deg) scale(1.05)', 36: 'transform:translateX(6px) rotate(4deg) scale(.97,1.03)', 52: 'transform:translateX(-4px) rotate(-5deg)', 66: 'transform:translateX(8px) rotate(5deg) scale(1.03)', 80: 'transform:translateX(0)', 100: 'transform:none' }, { origin: '50% 100%' });
  S.anim('mR', { 0: 'transform:none', 16: 'transform:translateX(5px) rotate(8deg)', 30: 'transform:translateX(-10px) rotate(-7deg) scale(1.05)', 36: 'transform:translateX(-6px) rotate(-4deg) scale(.97,1.03)', 52: 'transform:translateX(4px) rotate(5deg)', 66: 'transform:translateX(-8px) rotate(-5deg) scale(1.03)', 80: 'transform:translateX(0)', 100: 'transform:none' }, { origin: '50% 100%' });
  S.anim('puff', { 0: 'opacity:0;transform:scale(.4)', 32: 'opacity:.95;transform:scale(1)', 56: 'opacity:0;transform:scale(2)', 62: 'opacity:.9;transform:scale(1)', 90: 'opacity:0;transform:scale(2.2)', 100: 'opacity:0' }, { origin: '50% 50%' });
  return S.fit(1.1, 0, -2);
};
// ---------------------------------------------------------------- s3 snow goggles
exports.s3 = () => {
  const S = new Sym('sy3'); shadow(S, 64, 104, 54, 8, .6);
  const brass = (y0, y1) => S.lin(0, y0, 0, y1, [[0, '#fff3b8'], [.25, '#e7bd58'], [.6, '#9b6a22'], [1, '#e9c466']]);
  const strap = S.lin(0, 40, 0, 86, [[0, '#6b4a30'], [.5, '#3b2616'], [1, '#1c1209']]);
  const mirror = (cx, cy) => S.rad(cx - 10, cy - 12, 36, [[0, '#d8fff1'], [.25, '#5ee0c4'], [.55, '#2b73c8'], [.85, '#4a2bb4'], [1, '#150d52']]);
  const lens = (cx, cy, n) => `
    <ellipse cx="${cx}" cy="${cy + 3}" rx="29" ry="27" fill="#04070e" opacity=".5"/>
    <circle cx="${cx}" cy="${cy}" r="29" fill="${brass(cy - 29, cy + 29)}" stroke="#4a2c08" stroke-width="1.2"/>
    <circle cx="${cx}" cy="${cy}" r="25.5" fill="${S.lin(0, cy - 26, 0, cy + 26, [[0, '#6b4414'], [.5, '#e6bd5a'], [1, '#fff0b0']])}"/>
    <circle cx="${cx}" cy="${cy}" r="22.5" fill="${mirror(cx, cy)}" stroke="#0a0a20" stroke-width="1.4"/>
    <g clip-path="${S.clip(`<circle cx="${cx}" cy="${cy}" r="22.5"/>`)}">
      <path d="M${cx - 24} ${cy + 6}Q${cx - 6} ${cy - 10} ${cx + 24} ${cy - 2}L${cx + 24} ${cy - 24}L${cx - 24} ${cy - 24}Z" fill="#fff" opacity=".16"/>
      <path d="M${cx - 22} ${cy + 14}Q${cx} ${cy + 4} ${cx + 22} ${cy + 12}" fill="none" stroke="#7dffc4" stroke-opacity=".6" stroke-width="2.4"/>
      <path d="M${cx - 22} ${cy + 18}Q${cx + 4} ${cy + 8} ${cx + 22} ${cy + 17}" fill="none" stroke="#b58aff" stroke-opacity=".5" stroke-width="2"/>
      <path class="a-gl${n}" d="M${cx - 30} ${cy - 30}L${cx - 18} ${cy - 30}L${cx - 4} ${cy + 30}L${cx - 16} ${cy + 30}Z" fill="#fff" opacity=".0" style="mix-blend-mode:screen"/></g>
    <path d="M${cx - 17} ${cy - 13}Q${cx - 9} ${cy - 21} ${cx + 3} ${cy - 20}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/>
    <circle cx="${cx - 21}" cy="${cy - 20}" r="1.5" fill="#fff" opacity=".7"/>
    ${[0, 60, 120, 180, 240, 300].map(a => `<circle cx="${f(cx + 27.4 * Math.cos(a * Math.PI / 180))}" cy="${f(cy + 27.4 * Math.sin(a * Math.PI / 180))}" r="1.3" fill="#5a3a0e"/>`).join('')}
    <path d="M${cx - 27} ${cy - 10}A28 28 0 0 1 ${cx + 6} ${cy - 27.5}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.2"/>`;
  S.add(`<g class="a-gog">
    <!-- strap going around the head, seen from the front: two ends flaring out -->
    <path d="M6 54Q-4 56 -2 70Q6 86 20 84L24 74Q12 74 10 66Q10 58 16 56Z" fill="${strap}" stroke="#0e0804" stroke-width="1"/>
    <path d="M122 54Q132 56 130 70Q122 86 108 84L104 74Q116 74 118 66Q118 58 112 56Z" fill="${strap}" stroke="#0e0804" stroke-width="1"/>
    <path d="M6 56Q0 60 2 70" fill="none" stroke="#c99466" stroke-opacity=".7" stroke-width="1.2"/>
    <!-- nose bridge -->
    <path d="M52 56Q64 46 76 56L76 66Q64 58 52 66Z" fill="${brass(46, 66)}" stroke="#4a2c08" stroke-width="1.1"/>
    <path d="M55 56Q64 49 73 56" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.2"/>
    <g class="a-lensL">${lens(34, 62, 'L')}</g><g class="a-lensR">${lens(94, 62, 'R')}</g>
    <!-- buckles -->
    <rect x="2" y="60" width="10" height="9" rx="2" fill="${brass(60, 69)}" stroke="#4a2c08" stroke-width="1"/><rect x="116" y="60" width="10" height="9" rx="2" fill="${brass(60, 69)}" stroke="#4a2c08" stroke-width="1"/>
    <path d="M5 63.5H9M119 63.5H123" stroke="#4a2c08" stroke-width="1.4"/>
  </g>`);
  S.add(star(24, 40, 7, 0, 'class="a-spk"'));
  const gl = (d) => ({ 0: 'opacity:0;transform:translateX(0)', 24: 'opacity:0;transform:translateX(0)', 30: 'opacity:.95', 56: 'opacity:.95;transform:translateX(52px)', 57: 'opacity:0;transform:translateX(52px)', 100: 'opacity:0' });
  S.anim('glL', gl(), { origin: '0 0', delay: 0 }); S.anim('glR', gl(), { origin: '0 0', delay: 140 });
  S.anim('gog', { 0: 'transform:none', 12: 'transform:translateY(3px) scale(1.04,.94)', 28: 'transform:translateY(-9px) rotate(-5deg) scale(.97,1.04)', 46: 'transform:translateY(0) rotate(3deg) scale(1.03,.97)', 64: 'transform:rotate(-1.5deg)', 82: 'transform:none', 100: 'transform:none' }, { origin: '50% 100%' });
  S.anim('lensL', { 0: 'transform:none', 40: 'transform:none', 52: 'transform:scale(1.08)', 70: 'transform:scale(1)', 100: 'transform:none' }, { origin: '50% 50%' });
  S.anim('lensR', { 0: 'transform:none', 44: 'transform:none', 56: 'transform:scale(1.08)', 74: 'transform:scale(1)', 100: 'transform:none' }, { origin: '50% 50%' });
  S.anim('spk', { 0: 'opacity:0;transform:scale(.2)', 30: 'opacity:0;transform:scale(.2)', 46: 'opacity:1;transform:scale(1.5) rotate(25deg)', 74: 'opacity:0;transform:scale(.6) rotate(50deg)', 100: 'opacity:0' }, { origin: '50% 50%' });
  return S.fit(.88, 0, 2);
};
