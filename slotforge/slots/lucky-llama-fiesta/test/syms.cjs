const L = require('./lib.cjs');
const { O, grad, rgrad, clip, p, np, ln, el, ci, rc, txt, fluff, flower } = L;
const hl = (d, w = 3, o = .8) => ln(d, '#fff', w, `opacity="${o}"`);

function marigold() {
  let s = '';
  s += p('M64,70 C40,70 18,86 14,112 C38,112 58,98 64,70Z', '#2f9a48', 3) + p('M64,70 C88,70 110,86 114,112 C90,112 70,98 64,70Z', '#1f7d3a', 3);
  s += ln('M60,80 C44,86 30,98 24,108 M68,80 C84,86 98,98 104,108', '#9be06a', 2);
  s += flower(64, 58, 56, 14, '#e5640f', '#a8350a', 0, 2.6);
  s += flower(64, 58, 44, 12, '#f58a1f', '#a8350a', 10, 2.4);
  s += flower(64, 58, 31, 10, '#ffb52e', '#a8350a', 4, 2.2);
  s += flower(64, 58, 19, 8, '#ffd84a', '#d9650c', 14, 2);
  s += `<circle cx="64" cy="58" r="7" fill="#c24a10" stroke="${O}" stroke-width="2"/><circle cx="61" cy="55" r="2.4" fill="#fff" opacity=".7"/>`;
  s += ln('M30,34 C36,26 46,22 56,22', '#fff3b0', 3, 'opacity=".8"');
  return s;
}
function maracas() {
  const one = (red) => {
    const base = red ? ['#ff4a3a', '#a8141c'] : ['#2fc46a', '#12763a'];
    let s = p('M-6,22 L-4,60 Q0,64 4,60 L6,22Z', grad([[0, '#e8a860'], [1, '#9a5524']], 0, 0, 1, 0), 3);
    s += p('M-9,60 Q0,72 9,60 L7,66 Q0,74 -7,66Z', '#f4b82a', 2.4);
    s += ci(0, 0, 28, rgrad([[0, base[0]], [1, base[1]]], .35, .3, .8), 3.4);
    // painted pattern
    if (red) { s += ln('M-22,-6 Q-8,-14 0,-6 T22,-6 M-24,6 Q-10,-2 0,6 T24,6', '#ffe08a', 3); s += `<g fill="#fff3b0"><circle cx="-10" cy="-18" r="2.4"/><circle cx="10" cy="-18" r="2.4"/><circle cx="0" cy="18" r="2.4"/><circle cx="-14" cy="16" r="2"/><circle cx="14" cy="16" r="2"/></g>`; }
    else { s += `<g fill="#fff"><path d="M-6,-22 l6,10 l6,-10z M-18,-6 l6,10 l6,-10z M6,-6 l6,10 l6,-10z M-6,10 l6,10 l6,-10z" stroke="${O}" stroke-width="1.6"/></g>`; s += ln('M-26,0 Q0,12 26,0', '#ffe08a', 3); }
    s += `<path d="M-18,-16 C-14,-22 -8,-25 -2,-26" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>`;
    return s;
  };
  return `<g transform="translate(38 42) rotate(-22) scale(1.12)">${one(true)}</g><g transform="translate(90 48) rotate(24) scale(1.12)">${one(false)}</g>`;
}
function chili() {
  let s = '';
  const body = 'M34,40 C68,16 112,34 114,80 C115,100 106,112 92,120 C98,102 94,82 82,70 C68,56 46,60 26,56 C22,48 26,42 34,40Z';
  s += p(body, grad([[0, '#ff5a44'], [.55, '#d41f26'], [1, '#8c0f1c']], .1, 0, .9, 1), 4);
  s += np('M40,44 C70,26 104,38 108,74 C100,50 70,40 40,52Z', '#ff8a70', 'opacity=".7"');
  s += hl('M46,40 C70,28 98,34 108,60', 4, .85);
  s += ln('M88,64 C98,76 100,96 94,110', '#6a0a14', 3, 'opacity=".55"');
  // calyx
  s += p('M22,54 C14,46 14,34 24,30 C30,38 38,40 46,42 C44,50 36,56 22,54Z', '#2f9a48', 3.2);
  s += p('M24,32 C20,20 24,10 34,6 C32,16 34,24 40,32Z', '#1f7d3a', 2.8);
  s += ln('M24,34 C28,40 34,44 42,46', '#a7e07a', 2, 'opacity=".9"');
  // small second chili behind-right for readability
  return s;
}
function guitar() {
  let s = '';
  const wood = grad([[0, '#f09a3e'], [.5, '#c3611f'], [1, '#7f3512']], 0, 0, 1, 1);
  s += p('M-6,-34 L6,-34 L5,-84 L-5,-84Z', grad([[0, '#6b3a1c'], [1, '#3b1c0c']], 0, 0, 1, 0), 3);
  s += p('M-9,-84 L9,-84 L9,-100 Q0,-106 -9,-100Z', '#4a2410', 3);
  s += `<g fill="#f6d27a"><circle cx="-5" cy="-92" r="2.4"/><circle cx="5" cy="-92" r="2.4"/><circle cx="-5" cy="-99" r="2.4"/><circle cx="5" cy="-99" r="2.4"/></g>`;
  s += `<ellipse cx="0" cy="-12" rx="26" ry="23" fill="${O}"/><ellipse cx="0" cy="18" rx="33" ry="30" fill="${O}"/>`;
  s += `<ellipse cx="0" cy="-12" rx="22.6" ry="19.6" fill="${wood}"/><ellipse cx="0" cy="18" rx="29.6" ry="26.6" fill="${wood}"/><rect x="-20" y="-6" width="40" height="30" fill="${wood}"/>`;
  s += ln('M-20,-8 C-12,-14 -6,-10 -4,-2', '#fff', 3, 'opacity=".4"');
  s += `<circle cx="0" cy="12" r="12" fill="#2a1007" stroke="#f6d27a" stroke-width="3"/><circle cx="0" cy="12" r="16.5" fill="none" stroke="#7a3a14" stroke-width="2"/>`;
  s += rc(-16, 36, 32, 6, 2, '#2a1007', 0);
  s += ln('M-3,-84 L-3,38 M0,-84 L0,38 M3,-84 L3,38', '#f4eedc', 1.1);
  s += ln('M-16,-22 C-22,-6 -26,10 -22,24', '#ffe4a8', 3.4, 'opacity=".75"');
  s += `<circle cx="-12" cy="-12" r="2.6" fill="#f6d27a"/><circle cx="12" cy="-12" r="2.6" fill="#f6d27a"/>`;
  return `<g transform="translate(60 70) rotate(34) scale(.86) translate(0 -8)">${s}</g>`;
}
function taco() {
  let s = '<g transform="translate(7 8) scale(.9) rotate(-8 64 64)">';
  s += p('M12,70 C16,40 40,28 64,28 C88,28 112,40 116,70Z', grad([[0, '#c9781f'], [1, '#8f4a10']], 0, 0, 0, 1), 3.6);
  // filling heap
  s += fluff([[22, 58, 11], [34, 46, 12], [48, 38, 12], [64, 34, 12], [80, 38, 12], [94, 46, 12], [106, 58, 11]], '#3fb54a', 2.4);
  s += ln('M24,56 q4,-5 9,0 M40,40 q4,-5 9,0 M66,32 q4,-5 9,0 M88,42 q4,-5 9,0', '#b5f07a', 2.4);
  s += `<g stroke="${O}" stroke-width="2"><rect x="40" y="48" width="13" height="12" rx="2.5" fill="#e8312a" transform="rotate(-12 46 54)"/><rect x="68" y="44" width="13" height="12" rx="2.5" fill="#e8312a" transform="rotate(14 74 50)"/><rect x="84" y="58" width="11" height="10" rx="2.5" fill="#f04a30" transform="rotate(-8 90 63)"/></g>`;
  s += `<g fill="#ffcf3a" stroke="${O}" stroke-width="1.6"><path d="M52,62 l10,-3 l2,7 l-10,3z"/><path d="M26,66 l9,-3 l2,6 l-9,3z"/></g>`;
  // front shell: boat shape with pointed ends
  s += p('M4,66 C30,76 98,76 124,66 C120,102 94,118 64,118 C34,118 8,102 4,66Z', grad([[0, '#ffe07a'], [.5, '#f4a62a'], [1, '#c8741a']], 0, 0, 1, 1), 3.8);
  s += ln('M8,70 C34,80 94,80 120,70', '#9a5410', 3, 'opacity=".7"');
  s += `<g fill="#b8641a" opacity=".65"><circle cx="30" cy="94" r="2.4"/><circle cx="50" cy="104" r="2.6"/><circle cx="78" cy="102" r="2.4"/><circle cx="98" cy="90" r="2.6"/><circle cx="64" cy="92" r="2.2"/><circle cx="20" cy="82" r="2"/></g>`;
  s += hl('M14,84 C20,98 34,108 50,112', 4, .85);
  s += '</g>';
  for (const x of [48, 78]) { const d = `M${x},22 C${x - 8},15 ${x + 8},9 ${x},0`; s += ln(d, O, 7, 'opacity=".9"') + ln(d, '#fffdf3', 3.6); }
  return s;
}
function skull() {
  let s = '';
  const D = 'M64,10 C32,10 17,34 19,62 C20,76 27,84 33,90 L33,104 C33,111 39,116 46,116 L82,116 C89,116 95,111 95,104 L95,90 C101,84 108,76 109,62 C111,34 96,10 64,10Z';
  s += p(D, grad([[0, '#ffffff'], [.6, '#f6ecd8'], [1, '#d6c3dc']], 0, 0, 1, 1), 3.8);
  s += np('M96,90 C102,84 109,76 109,62 C111,34 96,10 64,10 C100,18 100,60 90,84Z', 'rgba(130,90,170,.25)');
  // forehead marigold + dot arc
  s += flower(64, 24, 15, 8, '#ff9a22', '#c24a10', 0, 1.8, '#ffc84a');
  s += `<g fill="#1cb8bd" stroke="${O}" stroke-width="1.2"><circle cx="40" cy="30" r="3.2"/><circle cx="30" cy="42" r="3.2"/><circle cx="88" cy="30" r="3.2"/><circle cx="98" cy="42" r="3.2"/></g>`;
  // eyes
  for (const x of [43, 85]) {
    s += ci(x, 58, 17, '#1cb8bd', 2.6);
    s += flower(x, 58, 17, 10, '#ee3d8f', '#12080a', 0, 1.6, '#ff8cbc');
    s += ci(x, 58, 6.2, '#12080a', 1.6) + `<circle cx="${x - 2}" cy="${x < 64 ? 56 : 56}" r="1.8" fill="#fff"/>`;
  }
  // nose
  s += p('M64,74 C58,80 54,88 58,92 C62,94 64,90 64,88 C64,90 66,94 70,92 C74,88 70,80 64,74Z', '#2a1209', 2);
  // cheeks
  s += `<circle cx="34" cy="80" r="6" fill="#ff7ab3" opacity=".75"/><circle cx="94" cy="80" r="6" fill="#ff7ab3" opacity=".75"/>`;
  // mouth + stitched teeth
  s += p('M32,98 Q64,110 96,98 L96,104 Q64,116 32,104Z', '#fff', 2.2);
  s += ln('M32,101 Q64,113 96,101', O, 2.6);
  for (let i = 0; i < 7; i++) { const x = 38 + i * 8.7; s += ln(`M${x},${99 + Math.sin((x - 32) / 64 * Math.PI) * 0},${x},${111}`, O, 2).replace(/M(\d+\.?\d*),\d+\.?\d*,/, 'M$1,100 L'); }
  s += `<g fill="#1cb8bd" stroke="${O}" stroke-width="1"><circle cx="40" cy="92" r="2.4"/><circle cx="88" cy="92" r="2.4"/></g>`;
  s += hl('M26,30 C30,22 38,16 48,13', 4, .95);
  return s;
}
function sombrero() {
  let s = '';
  // brim
  s += p('M4,86 C4,70 30,62 64,62 C98,62 124,70 124,86 C124,102 96,112 64,112 C32,112 4,102 4,86Z', grad([[0, '#12a8ad'], [1, '#0a6a78']], 0, 0, 0, 1), 3.8);
  s += `<ellipse cx="64" cy="84" rx="50" ry="17" fill="${grad([[0, '#0a5f6c'], [1, '#0d8a92']], 0, 0, 0, 1)}" stroke="#f6c22a" stroke-width="3.4"/>`;
  s += `<ellipse cx="64" cy="84" rx="42" ry="13" fill="none" stroke="#f6c22a" stroke-width="1.6" stroke-dasharray="3 3"/>`;
  // crown
  s += p('M36,86 C32,54 40,28 64,26 C88,28 96,54 92,86 C80,94 48,94 36,86Z', grad([[0, '#14b4b8'], [.6, '#0c8a94'], [1, '#07566a']], 0, 0, 1, 0), 3.8);
  // hatband
  s += p('M35,78 C48,86 80,86 93,78 L92,88 C80,95 48,95 36,88Z', '#d92b78', 3);
  s += `<g fill="#f6c22a" stroke="${O}" stroke-width="1.3"><path d="M46,86 l4,-5 l4,5 l-4,5z"/><path d="M62,89 l4,-5 l4,5 l-4,5z"/><path d="M78,86 l4,-5 l4,5 l-4,5z" transform="translate(-8 1)"/></g>`;
  // crown embroidery
  s += ln('M50,70 C54,52 60,46 64,36 C68,46 74,52 78,70', '#f6c22a', 3);
  s += ln('M44,64 C50,56 56,60 58,50 M84,64 C78,56 72,60 70,50', '#f6c22a', 2.2);
  s += `<circle cx="64" cy="30" r="6" fill="#f6c22a" stroke="${O}" stroke-width="2.4"/><circle cx="62" cy="28" r="2" fill="#fff" opacity=".8"/>`;
  s += hl('M42,70 C40,56 44,40 54,32', 4, .6);
  // brim front pompoms
  for (let i = 0; i < 11; i++) { const t = i / 10; const x = 12 + t * 104; const y = 86 + Math.sin(t * Math.PI) * 22 - 2 + (t < .08 || t > .92 ? -8 : 0); s += ci(x, Math.min(y, 106), 3.2, i % 2 ? '#d92b78' : '#f6c22a', 1.4); }
  return s;
}
function mask() {
  let s = '';
  const M = 'M64,8 C38,8 22,28 24,56 C25,72 30,84 37,96 C44,108 54,118 64,118 C74,118 84,108 91,96 C98,84 103,72 104,56 C106,28 90,8 64,8Z';
  s += p(M, grad([[0, '#ff4a3a'], [.6, '#d4202a'], [1, '#8c0f1c']], 0, 0, 1, 1), 4);
  const sil = grad([[0, '#ffffff'], [.5, '#c8d4e2'], [1, '#7f90a8']], 0, 0, 1, 1);
  // silver flame forehead
  s += p('M64,10 C54,24 50,34 58,44 C52,42 46,36 44,28 C36,36 36,46 44,54 L64,40 L84,54 C92,46 92,36 84,28 C82,36 76,42 70,44 C78,34 74,24 64,10Z', sil, 2.6);
  // eye holes with silver border
  for (const sgn of [-1, 1]) {
    const x = 64 + sgn * 22;
    s += `<g transform="translate(${x} 60) scale(${sgn} 1)">${p('M-18,6 C-16,-8 2,-14 18,-12 C14,4 2,14 -18,6Z', sil, 3)}${p('M-13,5 C-11,-4 2,-8 12,-7 C9,3 0,9 -13,5Z', '#150808', 1.6)}<path d="M-7,-2 q6,-3 10,-3" stroke="#fff" stroke-width="2" opacity=".6" fill="none" stroke-linecap="round"/></g>`;
  }
  // mouth
  s += p('M46,92 C52,86 76,86 82,92 C80,104 72,110 64,110 C56,110 48,104 46,92Z', sil, 3);
  s += p('M51,94 C56,91 72,91 77,94 C75,102 70,105 64,105 C58,105 53,102 51,94Z', '#150808', 1.6);
  // nose bridge stripe
  s += np('M60,44 L64,78 L68,44Z', '#8c0f1c', 'opacity=".5"');
  // stitches around the edge
  s += ln('M32,60 C34,76 40,88 48,100 M96,60 C94,76 88,88 80,100', '#fff', 2, 'stroke-dasharray="4 4" opacity=".8"');
  s += hl('M30,34 C34,22 44,14 56,11', 4, .75);
  // lacing at chin
  s += `<g stroke="${O}" stroke-width="1.6" fill="#f6c22a"><circle cx="56" cy="114" r="2.6"/><circle cx="72" cy="114" r="2.6"/></g>`;
  return s;
}
function trumpet() {
  let s = '';
  const brass = grad([[0, '#ffe680'], [.35, '#f2b52a'], [.7, '#c47c12'], [1, '#8a4c0a']], 0, 0, 0, 1);
  const tube = (d, w) => ln(d, O, w + 5) + ln(d, brass, w) + ln(d, '#fff6c0', 2.2, 'opacity=".75" transform="translate(0 -2.5)"');
  s += tube('M-52,2 L-52,-14 C-52,-24 -40,-24 -40,-14 L-40,2', 0.1).replace(/.*/, '');
  s += tube('M-34,-8 L22,-8', 7);
  s += tube('M-34,10 L22,10', 7);
  s += tube('M-34,-8 C-52,-8 -52,10 -34,10', 7);
  s += tube('M-26,24 L10,24 M-26,24 C-34,24 -34,16 -26,16', 0.1).replace(/.*/, '');
  // tuning slide loop
  s += tube('M-22,22 L8,22', 6);
  s += tube('M-22,22 C-30,22 -30,10 -22,10', 5).replace(/.*/, '');
  // bell
  s += p('M20,-14 C34,-16 46,-30 58,-40 C68,-18 68,22 58,44 C46,34 34,18 20,16Z', brass, 3.6);
  s += np('M52,-34 C62,-14 62,20 54,38 C58,16 58,-14 52,-34Z', 'rgba(255,255,255,.55)');
  s += `<ellipse cx="60" cy="2" rx="9" ry="42" fill="${grad([[0, '#8a4c0a'], [1, '#3a1c06']], 0, 0, 1, 0)}" stroke="${O}" stroke-width="3.4"/>`;
  s += `<ellipse cx="57" cy="2" rx="4" ry="30" fill="#f2b52a" opacity=".35"/>`;
  // valves
  for (const x of [-14, 0, 14]) {
    s += p(`M${x - 5},-12 L${x - 5},18 Q${x},22 ${x + 5},18 L${x + 5},-12Z`, brass, 2.8);
    s += p(`M${x - 2.4},-12 L${x - 2.4},-26 M${x + 2.4},-12 L${x + 2.4},-26`, 'none', 0.1);
    s += ln(`M${x},-12 L${x},-24`, O, 5) + ln(`M${x},-12 L${x},-24`, '#d9d2c0', 2.4);
    s += ci(x, -26, 5.2, rgrad([[0, '#ffffff'], [1, '#b8d6e0']], .35, .3, .8), 2.4);
  }
  // mouthpiece
  s += p('M-50,-4 L-58,-4 L-58,6 L-50,6Z', '#e8d9a0', 2.6);
  return `<g transform="translate(54 66) rotate(-24) scale(1.0)">${s}</g>`;
}
function wild() {
  let s = '';
  const P = 'M34,22 Q64,10 94,22 C108,36 118,60 124,86 L112,98 L16,98 L4,86 C10,60 20,36 34,22Z';
  s += p(P, '#d92b78', 4);
  const pc = clip(`<path d="${P}"/>`);
  s += `<g clip-path="${pc}">`;
  const cols = ['#f4b82a', '#d92b78', '#0f9ba0', '#f58a2e', '#fff0cf', '#d92b78', '#0f9ba0', '#f4b82a'];
  for (let k = cols.length - 1; k >= 0; k--) { const y = 16 + k * 12; s += `<path d="M-6,${y - 14} L64,${y + 34} L134,${y - 14}" fill="none" stroke="${cols[k]}" stroke-width="13"/>`; }
  s += `<rect x="0" y="0" width="128" height="128" fill="${grad([[0, 'rgba(255,240,170,.35)'], [.45, 'rgba(0,0,0,0)'], [1, 'rgba(60,10,40,.4)']], 0, 0, 1, 1)}"/>`;
  s += `</g>` + ln(P, O, 4);
  // neck hole
  s += `<path d="M42,21 Q64,10 86,21 L64,50Z" fill="#fbe7c3" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><path d="M50,22 Q64,15 78,22 L64,42Z" fill="#7a3a2a"/><path d="M42,21 L64,50 L86,21" fill="none" stroke="#ffd23f" stroke-width="2.4"/>`;
  // fringe
  const fc = ['#d92b78', '#f4b82a', '#0f9ba0', '#f58a2e'];
  for (let i = 0; i < 9; i++) s += p(`M${9 + i * 12.5},97 l11,0 l-1.6,13 q-3.9,2 -7.8,0z`, fc[i % 4], 1.8);
  // WILD ribbon
  s += p('M-2,52 L130,52 L130,84 L-2,84Z', 'none', 0);
  s += p('M10,50 L118,50 L124,64 L118,78 L10,78 L4,64Z', grad([[0, '#6a1fa0'], [1, '#2e0f58']], 0, 0, 0, 1), 3.6);
  s += ln('M14,54 L114,54 M14,74 L114,74', '#ffd23f', 2);
  s += txt('WILD', 64, 74, 28, grad([[0, '#fff6a8'], [.5, '#ffd23f'], [1, '#e8941a']]), { stroke: O, sw: 6, extra: 'letter-spacing="0.5"' });
  s += `<path d="M112,16 l3,8 l8,3 l-8,3 l-3,8 l-3,-8 l-8,-3 l8,-3z" fill="#fff6b0" stroke="${O}" stroke-width="1.6"/><path d="M14,30 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 l5,-2z" fill="#fff6b0" stroke="${O}" stroke-width="1.4"/>`;
  return s;
}
function drum() {
  let s = '';
  const body = grad([[0, '#35d6d0'], [.5, '#119aa0'], [1, '#0a5a68']], 0, 0, 1, 0);
  // sticks
  s += `<g transform="translate(64 30) rotate(-32)">${rc(-3, -34, 6, 44, 3, '#f0c78a', 2.6)}${ci(0, -36, 6, '#e8312a', 2.4)}</g>`;
  s += `<g transform="translate(64 30) rotate(32)">${rc(-3, -34, 6, 44, 3, '#f0c78a', 2.6)}${ci(0, -36, 6, '#e8312a', 2.4)}</g>`;
  // body
  s += p('M20,40 L20,92 C20,108 44,116 64,116 C84,116 108,108 108,92 L108,40Z', body, 4);
  // painted band zigzag
  const bc = clip('<path d="M20,40 L20,92 C20,108 44,116 64,116 C84,116 108,108 108,92 L108,40Z"/>');
  s += `<g clip-path="${bc}">`;
  s += `<rect x="20" y="58" width="88" height="22" fill="#fff0cf"/>`;
  let zz = '';
  for (let i = 0; i < 8; i++) zz += `<path d="M${20 + i * 11},80 l5.5,-20 l5.5,20z" fill="${i % 2 ? '#d92b78' : '#f58a2e'}" stroke="${O}" stroke-width="1.8"/>`;
  s += zz + `<rect x="0" y="40" width="128" height="80" fill="${grad([[0, 'rgba(255,255,255,.25)'], [.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.4)']], 0, 0, 1, 0)}"/></g>`;
  s += ln('M20,58 L108,58 M20,80 L108,80', O, 2.4);
  // rope lacing
  for (let i = 0; i < 7; i++) { const x = 26 + i * 12; s += ln(`M${x},44 L${x + 6},56 M${x + 6},44 L${x},56`, '#f0d9a0', 2.6, ''); }
  // hoops
  s += `<path d="M20,92 C20,108 44,116 64,116 C84,116 108,108 108,92" fill="none" stroke="${O}" stroke-width="9"/><path d="M20,92 C20,108 44,116 64,116 C84,116 108,108 108,92" fill="none" stroke="#e8312a" stroke-width="5"/>`;
  // top skin
  s += `<ellipse cx="64" cy="40" rx="44" ry="15" fill="#fff4dc" stroke="${O}" stroke-width="4"/><ellipse cx="64" cy="40" rx="44" ry="15" fill="none" stroke="#e8312a" stroke-width="3" transform="translate(0 0)" opacity="0"/>`;
  s += `<ellipse cx="64" cy="41" rx="34" ry="10" fill="none" stroke="#f58a2e" stroke-width="2" stroke-dasharray="3 3"/>`;
  // gold FS plaque
  s += p('M44,62 L84,62 L88,72 L84,84 L44,84 L40,72Z', grad([[0, '#fff0a0'], [.5, '#f6b72a'], [1, '#c47c12']], 0, 0, 0, 1), 3);
  s += txt('FS', 64, 80, 20, '#7a1a2a', { stroke: '#ffe9a0', sw: 1.5 });
  s += `<path d="M24,48 C22,64 22,84 26,98" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".5"/>`;
  return s;
}
function pinata(kind, label) {
  let s = '';
  const cx = 64, cy = 64, R = 54, r = 31;
  const cols = kind === 'minor' ? ['#7a3fd0', '#1cb8bd', '#ffd23f', '#ee3d8f', '#39c46a'] : ['#ee3d8f', '#1cb8bd', '#ffd23f', '#f58a2e', '#39c46a'];
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r : R; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  // rope + tassel
  s += ln('M64,10 C60,4 68,0 64,-6', '#8a5a2a', 3);
  for (let i = 0; i < 5; i++) {
    const t = pts[i * 2], a = pts[(i * 2 + 9) % 10], b = pts[(i * 2 + 1) % 10];
    s += p(`M${cx},${cy} L${a[0].toFixed(1)},${a[1].toFixed(1)} L${t[0].toFixed(1)},${t[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}Z`, cols[i], 3.4);
    // fringe chevrons toward the tip
    const dx = t[0] - cx, dy = t[1] - cy;
    for (let k = 1; k <= 3; k++) {
      const f = .42 + k * .15, bx = cx + dx * f, by = cy + dy * f, w = (1 - f) * 0 + 12 - k * 2.4;
      const nx = -dy / R, ny = dx / R;
      s += ln(`M${(bx + nx * w).toFixed(1)},${(by + ny * w).toFixed(1)} L${(bx + dx / R * 5).toFixed(1)},${(by + dy / R * 5).toFixed(1)} L${(bx - nx * w).toFixed(1)},${(by - ny * w).toFixed(1)}`, 'rgba(255,255,255,.55)', 2.2);
    }
  }
  s += `<path d="M40,26 C46,18 54,14 62,12" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;
  // belly disc
  s += ci(cx, cy + 2, 25, grad([[0, '#fffbe8'], [1, '#f2d890']], 0, 0, 1, 1), 3.4);
  s += `<circle cx="${cx}" cy="${cy + 2}" r="21" fill="none" stroke="#f6b72a" stroke-width="2.4"/>`;
  if (kind === 'cash') {
    s += txt(label, cx, cy + 14, 32, '#1d7a38', { stroke: '#fffbe8', sw: 2.4 }) ;
  } else {
    s += `<path d="M48,60 l6,-10 l5,7 l5,-9 l5,9 l5,-7 l6,10z" fill="#ffd23f" stroke="${O}" stroke-width="2"/><rect x="48" y="60" width="32" height="6" rx="2" fill="#f6b72a" stroke="${O}" stroke-width="2"/>`;
    s += p('M14,88 L114,88 L108,100 L114,112 L14,112 L20,100Z', grad([[0, '#9a50ff'], [1, '#4a1a96']], 0, 0, 0, 1), 3.4);
    s += ln('M22,91 L106,91 M22,109 L106,109', '#ffd23f', 1.8);
    s += txt('MINOR', 64, 108, 21, grad([[0, '#fff6a8'], [1, '#ffbd2a']]), { stroke: O, sw: 4, font: 'Lil' });
  }
  return s;
}
const SYM = {
  marigold, maracas, chili, guitar, taco, skull, sombrero, mask, trumpet, wild, drum,
  pin5: () => pinata('cash', '$5'), pinMinor: () => pinata('minor')
};
module.exports = { SYM };
