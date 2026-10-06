// RATTLEROCK RUN sprite sheet generator (leo): symbols.svg (<symbol id="rr...">), all ids prefixed "rr"
// node sprites.cjs
const B = require('./base.cjs');
const { fs, R, rnd, f, OUT, nugget, coin, heap, heap2, spark, tag, gem, items, dw3, glove3, glovePoint, cart, cartRim, lantern, fistG, setSeed } = B;
const path = require('path');
const ol = (w = 3.4) => `stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

let LOCAL = '';
const lg = (id, st, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => LOCAL += `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`;
const rg = (id, st, cx = .5, cy = .5, r = .5) => LOCAL += `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</radialGradient>`;
rg('dome', [[0, '#9af0ff', 0], [.7, '#8ae8ff', .08], [.9, '#ffe27a', .32], [1, '#fff6c0', .6]]);
lg('sunDoor', [[0, '#bfe8ff'], [.45, '#f4fbff'], [.8, '#fff6c0'], [1, '#ffe27a']]);
lg('hill', [[0, '#8ad060'], [1, '#3a8a40']]);
rg('smokeG', [[0, '#8a7a8a'], [1, '#2c2430']], .4, .35, .75);
rg('fireG', [[0, '#fffbe0'], [.3, '#ffe060'], [.62, '#ff8a20'], [1, '#c8280e']], .5, .5, .5);
rg('boomHalo', [[0, '#fff2a0', .8], [.5, '#ff9a30', .35], [1, '#ff6a20', 0]]);
lg('brass', [[0, '#fff0b0'], [.4, '#e8b040'], [1, '#7a4a10']], 0, 0, 1, 0);
lg('stone', [[0, '#8a96b0'], [.5, '#566080'], [1, '#2e3650']]);
lg('stoneL', [[0, '#c8d0e4'], [1, '#6a7898']]);

let syms = '';
const sym = (id, vb, body, extra = '') => { syms += `<symbol id="${id}" viewBox="${vb}" overflow="visible"${extra}>${body}</symbol>\n`; };

// ===================== CART + DWARF, 5 states (viewBox -400 -470 800 720; origin = cart centre, rail at y=244) =====================
const CVB = '-400 -530 800 780';
function cartBody(st, o = {}) {
  setSeed(11);
  let s = cart();
  s += heap2(-205, -4, 250, 120 + (o.pile || 0), 70, 25) + heap2(255, -4, 170, 70 + (o.pile || 0) * .5, 30, 22);
  s += `<g transform="translate(-58 0)">${dw3(Object.assign({ hs: 1.3 }, st))}</g>`;
  s += cartRim() + heap2(-60, -2, 220, 46 + (o.pile || 0) * .4, 26, 22);
  s += `<g transform="translate(-58 0)">${o.front || ''}</g>`;
  s += `<path d="M-300,-10 L300,-10" stroke="#ffe8a0" stroke-width="3" opacity=".55"/>`;
  return s;
}
// 1 riding: pointing ahead, grin
sym('rrCartRide', CVB, cartBody({ face: 'ride', arms: 'point' }, { front: glove3(198, -34, true) + glovePoint(186, -156) }) + spark(-240, -130, 20) + spark(290, -90, 16));
// 2 cheering after a gem: arms up, eyes squeezed shut, huge laugh, nuggets and sparkles pop
sym('rrCartCheer', CVB, cartBody({ face: 'cheer', arms: 'up' }, { pile: 22, front: glove3(198, -34, true) }) + spark(-250, -250, 24) + spark(300, -250, 18) + spark(-40, -440, 16) + spark(210, -420, 22) + spark(330, -170, 14));
// 3 shielded: hard hat glows, determined smirk, grips the rim
const hatBadge = `<g transform="translate(0 -4)"><path d="M-30,6 C-30,-26 -14,-32 0,-32 C14,-32 30,-26 30,6 Z" fill="url(#hat)" ${ol(2.6)}/><path d="M-42,6 Q0,0 42,6 Q44,16 36,16 L-36,16 Q-44,16 -42,6 Z" fill="#e08a14" ${ol(2.6)}/></g>`;
sym('rrCartShield', CVB, cartBody({ face: 'shield', arms: 'grip', hatGlow: true }, { front: glove3(198, -34, true) + glove3(66, -60 + 26, false) }));
// 4 crashed after TNT: tilted, scorched, dizzy, arms thrown out, smoke
function crashBody() {
  setSeed(12);
  const smoke = (x, y, r, o2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#smokeG)" ${ol(3.2)} opacity="${o2}"/>`;
  let s = `<ellipse cx="0" cy="246" rx="380" ry="24" fill="#000" opacity=".5"/>`;
  s += `<g transform="rotate(-9 -190 244) translate(0 -10)">` + cartBody({ face: 'crash', arms: 'out' }, { front: glove3(198, -34, true) }) + `</g>`;
  // soot blotches over the cart and the dwarf
  s += `<ellipse cx="60" cy="86" rx="90" ry="46" fill="#120808" opacity=".55" transform="rotate(-9 -190 244)"/><ellipse cx="-110" cy="-110" rx="60" ry="46" fill="#120808" opacity=".35"/><ellipse cx="80" cy="-290" rx="50" ry="30" fill="#120808" opacity=".35"/>`;
  // flames licking at the front, plus smoke column
  s += `<path d="M180,176 C170,130 200,120 196,80 C228,110 236,150 226,176 Z" fill="url(#fireG)" ${ol(3)}/><path d="M250,184 C246,150 270,142 266,112 C288,136 292,166 284,184 Z" fill="url(#fireG)" ${ol(3)}/>`;
  s += smoke(-210, -300, 34, .85) + smoke(-250, -370, 44, .8) + smoke(-200, -440, 38, .7) + smoke(-300, -320, 28, .7) + smoke(250, 60, 36, .85) + smoke(280, 0, 46, .75) + smoke(260, -70, 40, .55);
  // flying loose gold and planks
  for (const [x, y, sz, r] of [[-250, -190, 26, -20], [-330, -90, 20, 30], [330, -210, 24, 10], [250, -300, 18, 50], [-180, -330, 20, -40]]) s += nugget(x, y, sz, r);
  s += `<g transform="translate(-300 -230) rotate(-28)"><rect x="-44" y="-9" width="88" height="18" fill="url(#wood)" ${ol(3)}/><path d="M-44,-9 L-30,-14 L-18,-4 L-10,-12 L0,-9" fill="#4e2810" ${ol(2.2)}/></g><g transform="translate(320 -110) rotate(24)"><rect x="-38" y="-8" width="76" height="16" fill="url(#wood)" ${ol(3)}/></g>`;
  s += `<path d="M-340,-330 l10,-26 l8,26 l26,10 l-26,8 l-8,26 l-10,-26 l-26,-8 Z" fill="#fff6c0" ${ol(2)} opacity=".95"/>`;
  return s;
}
sym('rrCartCrash', CVB, crashBody());
// 5 victorious at the door: standing proud, arms up, laughing, gold nugget held high, confetti glints
sym('rrCartWin', CVB, cartBody({ face: 'win', arms: 'up', hold: '' }, { pile: 40, front: glove3(198, -34, true) }) + `<g transform="translate(-100 -440) rotate(-14)">${nugget(0, 0, 38, 0)}</g>` + spark(-250, -250, 26) + spark(310, -270, 22) + spark(40, -470, 20) + spark(-170, -450, 16) + spark(250, -430, 18) + spark(340, -130, 14)
  + [[-300, -300, '#ff6a8a'], [330, -350, '#6ad0ff'], [-60, -470, '#ffe27a'], [150, -460, '#8aff9a'], [-340, -180, '#ffe27a'], [370, -230, '#ff6a8a']].map(([x, y, c], i) => `<rect x="${x}" y="${y}" width="14" height="7" rx="2" fill="${c}" ${ol(1.6)} transform="rotate(${i * 37} ${x} ${y})"/>`).join(''));
// shield dome overlay (pulses) + wheel sparks overlay
sym('rrShieldDome', CVB, `<ellipse cx="-20" cy="-110" rx="470" ry="400" fill="url(#dome)"/><ellipse cx="-20" cy="-110" rx="470" ry="400" fill="none" stroke="#fff0b0" stroke-width="7" opacity=".85"/><ellipse cx="-20" cy="-110" rx="456" ry="386" fill="none" stroke="#7ee4ff" stroke-width="3" opacity=".7"/><path d="M-330,-300 C-300,-370 -180,-420 -60,-436" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".7"/>${hatBadge.replace('translate(0 -4)', 'translate(-20 -330) scale(1.5)')}` + [[-250, -60], [210, -250], [260, 40], [-300, -230]].map(([x, y]) => `<path d="M${x},${y - 30} l14,16 l-14,16 l-14,-16 Z M${x - 30},${y} l16,-10" fill="none" stroke="#fff6c0" stroke-width="3" opacity=".6"/>`).join(''));
setSeed(21);
{
  let s = '';
  for (const wx of [-190, 190]) for (let i = 0; i < 9; i++) { const x = wx - 54 - i * R(6, 12), y = 244 - R(0, 26) - i * 1.2; s += `<path d="M${f(x)},${f(y)} l${f(-R(8, 18))},${f(R(-8, 4))}" stroke="${i % 2 ? '#ffe070' : '#ff9a30'}" stroke-width="${f(R(2, 4))}" stroke-linecap="round" opacity="${f(1 - i * .09)}"/>`; }
  for (const wx of [-190, 190]) s += `<circle cx="${wx - 52}" cy="240" r="16" fill="#fff4b0" opacity=".85"/>` + spark(wx - 52, 238, 22, .95);
  sym('rrSparks', CVB, s);
}

// ===================== PICKUPS (viewBox -80 -110 160 200, origin = the item centre; the chip sits at y+74) =====================
const PVB = '-80 -110 160 200';
const fontFix = s => s.replace(/font-family="RN"/g, 'font-family="RRNum"');
globalThis.TY = 74;
const gemSym = (id, col, lite, dark, txt, glow, extra = '') => sym(id, PVB, fontFix(gem(col, lite, dark, txt, glow)) + extra);
gemSym('rrGem2', '#2fcf5a', '#9bffb0', '#0c6a30', 'x2', '#5dff8a', spark(34, -34, 12));
gemSym('rrGem3', '#2f8cf0', '#a8dcff', '#123c9a', 'x3', '#6ac8ff', spark(34, -34, 13));
gemSym('rrGem5', '#e0283a', '#ff9aa0', '#7a0c1c', 'x5', '#ff6070', spark(34, -34, 14));
gemSym('rrGem10', '#f0b020', '#fff0a0', '#8a4a08', 'x10', '#ffd860', `<path d="M-44,-40 L0,-60 L44,-40" fill="none" stroke="#ffe27a" stroke-width="3" opacity=".7"/>` + spark(36, -38, 16) + spark(-38, -30, 11) + spark(0, -58, 10));
setSeed(31);
sym('rrNugget', PVB, `<ellipse cx="0" cy="26" rx="46" ry="9" fill="#000" opacity=".28"/><circle r="52" fill="#ffc83a" opacity=".22"/>${nugget(0, 0, 36, -10)}${nugget(-22, 14, 20, 20)}${nugget(22, 16, 22, -30)}${spark(30, -30, 12)}`);
setSeed(32);
sym('rrPile', '-120 -110 240 200', `<ellipse cx="0" cy="22" rx="100" ry="14" fill="#000" opacity=".3"/><ellipse cx="0" cy="-10" rx="100" ry="70" fill="#ffc83a" opacity=".22"/>${heap2(0, 22, 190, 84, 46, 22)}${nugget(-30, -40, 26, 10)}${nugget(34, -36, 24, -20)}${spark(60, -60, 15)}${spark(-64, -44, 11)}`);
sym('rrHat', PVB, fontFix(items.hat()));
sym('rrHatIcon', '-70 -60 140 100', items.hat().replace(/<g transform="translate\(0 \$\{globalThis.TY \|\| 74\}\)">[\s\S]*$/, ''));
sym('rrTnt', PVB, items.tnt().replace(/font-family="RN"/g, 'font-family="RRNum"') + `<g id="rrFuse"><circle cx="16" cy="-64" r="22" fill="#ffd060" opacity=".35"/></g>`);
// lantern pickup
{
  let s = `<ellipse cx="0" cy="40" rx="40" ry="8" fill="#000" opacity=".28"/><circle cx="0" cy="-6" r="70" fill="url(#lampGlow)" opacity=".9"/>`;
  s += lantern(0, -26, 1.5, 0).replace(/<circle[^>]*url\(#lampGlow\)[^>]*\/>/, '').replace(/<path d="M0,[-\d.]+ L0,-26"[^>]*\/>/, '');
  s += `<path d="M-16,-52 C-16,-76 16,-76 16,-52" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M-16,-52 C-16,-76 16,-76 16,-52" fill="none" stroke="url(#steel)" stroke-width="3" stroke-linecap="round"/>`;
  s += spark(38, -48, 13) + spark(-40, -30, 9);
  sym('rrLantern', PVB, s);
}
// lever fork: switch stand + Y rails board, lever pushed left / right / neutral
function forkBody(dir) {
  const L = dir === 'L', Rr = dir === 'R';
  let s = `<ellipse cx="0" cy="62" rx="62" ry="10" fill="#000" opacity=".3"/>`;
  s += `<rect x="-6" y="-26" width="12" height="86" rx="3" fill="url(#wood)" ${ol(2.8)}/>`;
  // signboard with the Y rails
  s += `<rect x="-52" y="-96" width="104" height="72" rx="10" fill="#1c1030" ${ol(3.4)}/><rect x="-46" y="-90" width="92" height="60" rx="7" fill="#2a1840" stroke="#ffd25a" stroke-width="2.4"/>`;
  const rail = (d, on) => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${on ? '#fff0a0' : '#8a6a3a'}" stroke-width="6" stroke-linecap="round"/>`;
  s += rail('M0,-34 L0,-52', true) + rail('M0,-52 L-24,-80', L) + rail('M0,-52 L24,-80', Rr);
  if (L) s += `<circle cx="-24" cy="-80" r="12" fill="#fff0a0" opacity=".35"/>`; if (Rr) s += `<circle cx="24" cy="-80" r="12" fill="#fff0a0" opacity=".35"/>`;
  s += `<path d="M-14,-34 h28" stroke="#ffd25a" stroke-width="3"/>`;
  // base plate and lever
  s += `<rect x="-30" y="48" width="60" height="14" rx="5" fill="url(#steelD)" ${ol(3)}/>`;
  const ang = L ? -38 : Rr ? 38 : 0;
  s += `<g transform="translate(0 50) rotate(${ang})"><rect x="-4" y="-48" width="8" height="48" rx="3" fill="url(#steel)" ${ol(2.4)}/><circle cy="-52" r="10" fill="#e0283a" ${ol(2.6)}/><circle cx="-3" cy="-55" r="3.5" fill="#ffb0b0"/></g><circle cx="0" cy="50" r="7" fill="url(#gold)" ${ol(2.2)}/>`;
  return s;
}
sym('rrFork', PVB, forkBody(''));
sym('rrForkL', PVB, forkBody('L'));
sym('rrForkR', PVB, forkBody('R'));

// golden door of daylight (viewBox -170 -300 340 320; origin = door foot on the rail)
{
  let s = `<ellipse cx="0" cy="-130" rx="230" ry="210" fill="url(#doorGlowW)" opacity=".95"/>`;
  s += `<ellipse cx="0" cy="6" rx="150" ry="14" fill="#000" opacity=".35"/>`;
  const aw = 100, ah = 200;
  // stone surround: stepped voussoirs
  s += `<path d="M${-aw - 34},6 V${-ah * .5} A${aw + 34},${ah * .55} 0 0 1 ${aw + 34},${-ah * .5} V6 Z" fill="url(#stone)" ${ol(4)}/>`;
  for (let i = 0; i <= 10; i++) { const a = Math.PI + i * Math.PI / 10, rx = aw + 34, ry = ah * .55, cx = 0, cy = -ah * .5; const x1 = cx + Math.cos(a) * (aw), y1 = cy + Math.sin(a) * (ah * .5), x2 = cx + Math.cos(a) * rx, y2 = cy + Math.sin(a) * ry; s += `<path d="M${f(x1)},${f(y1)} L${f(x2)},${f(y2)}" stroke="${OUT}" stroke-width="3" opacity=".8"/>`; }
  s += `<path d="M${-aw - 34},6 V${-ah * .5} A${aw + 34},${ah * .55} 0 0 1 ${aw + 34},${-ah * .5}" fill="none" stroke="url(#stoneL)" stroke-width="5" opacity=".6"/>`;
  s += `<path d="M${-aw - 12},6 V${-ah * .5} A${aw + 12},${ah * .52} 0 0 1 ${aw + 12},${-ah * .5} V6 Z" fill="url(#gold)" ${ol(3.4)}/>`;
  // the daylight inside
  s += `<path d="M${-aw},6 V${-ah * .5} A${aw},${ah * .5} 0 0 1 ${aw},${-ah * .5} V6 Z" fill="url(#sunDoor)" ${ol(2.4)}/>`;
  s += `<g clip-path="url(#doorClip)"><circle cx="0" cy="-64" r="120" fill="#fffbe0" opacity=".8"/>` + Array.from({ length: 11 }, (_, i) => { const a = -Math.PI + i * Math.PI / 10; return `<polygon points="0,-64 ${f(Math.cos(a - .05) * 300)},${f(-64 + Math.sin(a - .05) * 300)} ${f(Math.cos(a + .05) * 300)},${f(-64 + Math.sin(a + .05) * 300)}" fill="#fff" opacity=".5"/>`; }).join('') + `<path d="M${-aw},-8 C-60,-44 -20,-30 20,-50 C60,-64 80,-40 ${aw},-30 V6 H${-aw} Z" fill="url(#hill)"/><path d="M${-aw},-2 C-40,-26 40,-14 ${aw},-16 V6 H${-aw} Z" fill="#2a7a38"/></g>`;
  LOCAL += `<clipPath id="doorClip"><path d="M${-aw},6 V${-ah * .5} A${aw},${ah * .5} 0 0 1 ${aw},${-ah * .5} V6 Z"/></clipPath>`;
  // keystone, steps, lanterns
  s += `<path d="M-22,${-ah * 1.04} L22,${-ah * 1.04} L16,${-ah * .86} L-16,${-ah * .86} Z" fill="url(#gold)" ${ol(3)}/><circle cx="0" cy="${-ah * .95}" r="7" fill="#fffbe0" ${ol(2)}/>`;
  for (let i = 0; i < 3; i++) s += `<rect x="${-aw - 40 - i * 14}" y="${-i * 8 - 2}" width="${(aw + 40 + i * 14) * 2}" height="10" fill="url(#stone)" ${ol(2.6)}/>`;
  for (const sx of [-1, 1]) s += `<g transform="translate(${sx * (aw + 62)} -150)">${lantern(0, 0, .9, 70).replace(/<path d="M0,[-\d.]+ L0,0"[^>]*\/>/, '')}</g>`;
  sym('rrDoor', '-230 -330 460 350', s);
}
// multiplier gauge parts
sym('rrGaugeNeedle', '-24 -170 48 190', `<path d="M0,-164 L9,-8 L-9,-8 Z" fill="url(#brass)" ${ol(3)}/><path d="M0,-150 L0,-20" stroke="#fffbe0" stroke-width="2.4" opacity=".6"/><circle cx="0" cy="0" r="17" fill="url(#gold)" ${ol(3.4)}/><circle cx="0" cy="0" r="7" fill="#2a1630" ${ol(2)}/><circle cx="-3" cy="-3" r="2.6" fill="#fff"/>`);
sym('rrGaugeGem', '-36 -40 72 80', `<circle r="34" fill="#ffd860" opacity=".3"/><polygon points="-22,-6 -12,-22 12,-22 22,-6 0,24" fill="#e0283a" ${ol(3)}/><polygon points="-22,-6 -12,-22 -4,-6" fill="#ff9aa0"/><polygon points="-12,-22 12,-22 4,-6 -4,-6" fill="#fff" opacity=".7"/><polygon points="-22,-6 -4,-6 0,24" fill="#ff9aa0" opacity=".55"/><polygon points="22,-6 4,-6 0,24" fill="#7a0c1c" opacity=".7"/>`);

// TNT explosion, 3 frames (viewBox -260 -260 520 520, origin = blast centre)
const star = (cx, cy, r1, r2, n, rot, seed) => { setSeed(seed); let p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = (i % 2 ? r1 : r2) * (i % 2 ? 1 : R(.8, 1.1)); p.push(f(cx + Math.cos(a) * r) + ',' + f(cy + Math.sin(a) * r)); } return `<polygon points="${p.join(' ')}" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"`; };
const BVB = '-260 -260 520 520';
sym('rrBoom1', BVB, `<circle r="200" fill="url(#boomHalo)"/>${star(0, 0, 90, 190, 9, .2, 41)} fill="#ff9a20"/>${star(0, 0, 60, 126, 9, .55, 42)} fill="#ffe060"/><circle r="64" fill="#fffbe0" ${ol(3)}/>${spark(0, 0, 150, .9)}` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${f(Math.cos(i * .785) * 150)},${f(Math.sin(i * .785) * 150)} L${f(Math.cos(i * .785) * 230)},${f(Math.sin(i * .785) * 230)}" stroke="#ffe27a" stroke-width="7" stroke-linecap="round"/>`).join(''));
setSeed(43);
sym('rrBoom2', BVB, `<circle r="250" fill="url(#boomHalo)"/>` + [[-110, 40, 100], [100, 50, 104], [0, -60, 130], [-60, -110, 86], [80, -100, 90], [0, 60, 110], [-150, -20, 70], [150, -10, 74]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#fireG)" ${ol(4)}/>`).join('') + `<circle cx="0" cy="-10" r="86" fill="#fffbe0" opacity=".9"/>` + [[-190, -140, 30, -30], [200, -150, 26, 40], [-60, -220, 22, 10], [150, 150, 24, -60], [-180, 130, 20, 30]].map(([x, y, s, r]) => nugget(x, y, s, r)).join('') + `<g transform="translate(-200 60) rotate(-35)"><rect x="-34" y="-8" width="68" height="16" fill="url(#wood)" ${ol(3)}/></g><g transform="translate(210 40) rotate(30)"><rect x="-30" y="-8" width="60" height="16" fill="url(#wood)" ${ol(3)}/></g>` + spark(-120, -170, 26) + spark(130, -190, 20));
setSeed(44);
sym('rrBoom3', BVB, [[-120, 60, 90], [110, 70, 96], [0, -20, 120], [-70, -100, 90], [80, -110, 84], [0, -170, 70], [-150, -30, 66], [150, -20, 64]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#smokeG)" ${ol(4)} opacity=".92"/>`).join('') + `<circle cx="0" cy="40" r="70" fill="#ff8a20" opacity=".55"/><circle cx="0" cy="40" r="40" fill="#ffe060" opacity=".7"/>` + Array.from({ length: 22 }, () => `<circle cx="${f(R(-230, 230))}" cy="${f(R(-230, 200))}" r="${f(R(2, 6))}" fill="${rnd() < .5 ? '#ffd060' : '#ff7a20'}" opacity="${f(R(.5, 1))}"/>`).join('') + `<g transform="translate(-190 150) rotate(-60)"><rect x="-30" y="-7" width="60" height="14" fill="url(#wood)" ${ol(3)}/></g>`);
// soft ground plate under pickups (optional)
sym('rrPlate', '-60 -16 120 32', `<ellipse cx="0" cy="0" rx="52" ry="8" fill="#000" opacity=".4"/><ellipse cx="0" cy="-2" rx="40" ry="5" fill="#ffd060" opacity=".25"/>`);

// ---------- Deep Shaft splash + intro art (viewBox 0 0 600 520): three carts descending past crystal ledges ----------
{
  setSeed(51);
  let s = `<ellipse cx="300" cy="260" rx="300" ry="250" fill="url(#boomHalo)" opacity=".5"/>`;
  // shaft rings going down
  for (let i = 0; i < 7; i++) { const r = 250 - i * 30, y = 120 + i * 40; s += `<ellipse cx="300" cy="${y}" rx="${r}" ry="${r * .22}" fill="none" stroke="${i % 2 ? '#6a4a98' : '#ffd25a'}" stroke-width="${6 - i * .5}" opacity="${f(.85 - i * .08)}"/>`; }
  s += `<ellipse cx="300" cy="400" rx="60" ry="14" fill="#fff6c0" opacity=".9"/>`;
  // three carts with tiny dwarves (cart symbol scaled)
  [[300, 340, .36, 0], [130, 250, .27, 1], [470, 250, .27, 2]].forEach(([x, y, k, i]) => { s += `<g transform="translate(${x} ${y}) scale(${k})"><use href="#rrCart${i === 0 ? 'Cheer' : 'Ride'}" x="-400" y="-530" width="800" height="780"/></g>`; });
  [[60, 120, 1], [540, 130, .8], [90, 370, .7], [520, 360, 1]].forEach(([x, y, k], i) => { s += `<g transform="translate(${x} ${y}) scale(${k * .8})"><use href="#rrGem${[2, 3, 5, 10][i]}" x="-80" y="-110" width="160" height="200"/></g>`; });
  sym('rrSplashDeep', '0 0 600 520', s);
}


{
  setSeed(52);
  let s = `<ellipse cx="300" cy="230" rx="300" ry="250" fill="url(#doorGlowW)"/>`;
  for (let i = 0; i < 14; i++) { const a = -Math.PI + i * Math.PI / 13; s += `<polygon points="300,250 ${f(300 + Math.cos(a - .045) * 380)},${f(250 + Math.sin(a - .045) * 380)} ${f(300 + Math.cos(a + .045) * 380)},${f(250 + Math.sin(a + .045) * 380)}" fill="#fff6c0" opacity=".28"/>`; }
  s += `<g transform="translate(300 310) scale(.62)"><use href="#rrCartWin" x="-400" y="-530" width="800" height="780"/></g>`;
  [[70, 130, 1.0, 5], [530, 140, .9, 10], [80, 330, .8, 3], [520, 340, 1, 2]].forEach(([x, y, k, v]) => { s += `<g transform="translate(${x} ${y}) scale(${k})"><use href="#rrGem${v}" x="-80" y="-110" width="160" height="200"/></g>`; });
  sym('rrSplashOutro', '0 0 600 520', s);
}

// ---------- assemble symbols.svg with unique ids ----------
let defs = B.defs + LOCAL;
const ids = [...defs.matchAll(/id="([^"]+)"/g)].map(m => m[1]).filter(x => !x.startsWith('rr'));
let all = `<defs>${defs}</defs>\n${syms}`;
for (const id of ids.sort((a, b) => b.length - a.length)) {
  const nid = 'rg' + id[0].toUpperCase() + id.slice(1);
  all = all.split(`url(#${id})`).join(`url(#${nid})`).split(`id="${id}"`).join(`id="${nid}"`).split(`href="#${id}"`).join(`href="#${nid}"`).split(`clip-path="url(#${id})"`).join(`clip-path="url(#${nid})"`);
}
all = all.replace(/font-family="RN"/g, 'font-family="RRNum"');
const out = `<!-- Rattlerock Run sprites (leo). Own ids: all gradients rr*, all symbols rr*. Fonts RRNum (Lilita One) in slot.css. See ART-NOTES.md. -->\n` + all;
fs.writeFileSync(path.join(__dirname, '..', 'symbols.svg'), out);
fs.writeFileSync(path.join(__dirname, 'symbol-ids.json'), JSON.stringify([...syms.matchAll(/<symbol id="([^"]+)" viewBox="([^"]+)"/g)].map(m => [m[1], m[2]])));
console.log('symbols.svg', (out.length / 1024) | 0, 'KB', [...syms.matchAll(/<symbol id="([^"]+)"/g)].length, 'symbols');
