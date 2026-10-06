// builds symbols.svg content: 5x3 reel symbols (tile inside, win motion hooks a-*), money piñata variants, collector
const L = require('./lib.cjs');
const { O, grad, rgrad, clip, p, np, ln, el, ci, rc, txt, fluff, flower } = L;
const { SYM, tacoSteam } = require('./syms0.cjs');
const { lucho } = require('./lucho.cjs');
const hl = (d, w = 3, o = .8) => ln(d, '#fff', w, `opacity="${o}"`);
const star = (x, y, r, c, fill = '#fff6b0') => `<path class="${c}" d="M${x},${y - r} l${r * .3},${r * .7} l${r * .7},${r * .3} l${-r * .7},${r * .3} l${-r * .3},${r * .7} l${-r * .3},${-r * .7} l${-r * .7},${-r * .3} l${r * .7},${-r * .3}z" fill="${fill}" stroke="${O}" stroke-width="1.6"/>`;
const note = (x, y, c, col = '#fff') => `<g class="${c}"><ellipse cx="${x}" cy="${y}" rx="5" ry="3.6" fill="${col}" stroke="${O}" stroke-width="1.8" transform="rotate(-20 ${x} ${y})"/><path d="M${x + 4},${y - 1} V${y - 17} q6,2 7,8" fill="none" stroke="${O}" stroke-width="3.4" stroke-linecap="round"/><path d="M${x + 4},${y - 1} V${y - 17} q6,2 7,8" fill="none" stroke="${col}" stroke-width="1.6" stroke-linecap="round"/></g>`;

function tile(rim, fill) {
  const f = fill || grad([[0, '#fffaec'], [.6, '#f9e6bd'], [1, '#e8c98a']], 0, 0, .3, 1);
  return rc(3, 3, 122, 122, 16, f, 0) + rc(3, 3, 122, 122, 16, 'none', 5.5) + rc(6.5, 6.5, 115, 115, 13, 'none', 5, `style="stroke:${rim}"`) + rc(10.5, 10.5, 107, 107, 10, 'none', 1.6, 'style="stroke:rgba(60,20,10,.4)"') +
    `<path d="M11,24 Q11,11 24,11 L62,11" stroke="rgba(255,255,255,.8)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M12,117 h104" stroke="rgba(120,60,20,.25)" stroke-width="4.5"/>`;
}
const rimGlow = () => rc(5, 5, 118, 118, 14, 'none', 6, 'class="a-rim" style="stroke:#fff3a0;opacity:0"');

function pin(cols, o = {}) {
  let s = '';
  const cx = 64, cy = 64, R = 54, r = 31, pts = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r : R; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  s += ln('M64,10 C60,4 68,0 64,-6', '#8a5a2a', 3);
  for (let i = 0; i < 5; i++) {
    const t = pts[i * 2], a = pts[(i * 2 + 9) % 10], b = pts[(i * 2 + 1) % 10];
    s += p(`M${cx},${cy} L${a[0].toFixed(1)},${a[1].toFixed(1)} L${t[0].toFixed(1)},${t[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}Z`, cols[i], 3.4);
    const dx = t[0] - cx, dy = t[1] - cy;
    for (let k = 1; k <= 3; k++) { const f = .42 + k * .15, bx = cx + dx * f, by = cy + dy * f, w = 12 - k * 2.4, nx = -dy / R, ny = dx / R;
      s += ln(`M${(bx + nx * w).toFixed(1)},${(by + ny * w).toFixed(1)} L${(bx + dx / R * 5).toFixed(1)},${(by + dy / R * 5).toFixed(1)} L${(bx - nx * w).toFixed(1)},${(by - ny * w).toFixed(1)}`, 'rgba(255,255,255,.55)', 2.2); }
  }
  s += `<path d="M40,26 C46,18 54,14 62,12" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;
  s += ci(cx, cy + 2, 25, grad([[0, '#fffbe8'], [1, o.belly || '#f2d890']], 0, 0, 1, 1), 3.4);
  s += `<circle cx="${cx}" cy="${cy + 2}" r="21" fill="none" stroke="${o.ring || '#f6b72a'}" stroke-width="2.4"/>`;
  if (o.crown) s += `<path d="M46,62 l6,-12 l6,8 l6,-12 l6,12 l6,-8 l6,12z" fill="#ffd23f" stroke="${O}" stroke-width="2"/><rect x="46" y="62" width="36" height="7" rx="2" fill="#f6b72a" stroke="${O}" stroke-width="2"/>${ci(64, 55, 3, '#e8312a', 1)}`;
  if (o.llama) s += `<g transform="translate(64 66) scale(.3) translate(-200 -200)"></g>`;
  if (o.plaque) {
    const pl = o.plaque;
    s += p('M10,88 L118,88 L112,100 L118,114 L10,114 L16,100Z', grad([[0, pl.c1], [1, pl.c2]], 0, 0, 0, 1), 3.4);
    s += ln('M18,91 L110,91 M18,111 L110,111', pl.line || '#ffd23f', 1.8);
    s += txt(pl.t, 64, 110, pl.fs || 21, grad([[0, '#fff6a8'], [1, '#ffbd2a']]), { stroke: O, sw: 4, font: 'Lil' });
  }
  return s;
}
const PIN = {
  mon: ['#ee3d8f', '#1cb8bd', '#ffd23f', '#f58a2e', '#39c46a'],
  mini: ['#1cb8bd', '#2f7de0', '#e8f8ff', '#39c4d8', '#2a9ad0'],
  minor: ['#7a3fd0', '#1cb8bd', '#ffd23f', '#ee3d8f', '#39c46a'],
  major: ['#ff7a2a', '#e8312a', '#ffd23f', '#c4201a', '#ff9a4a'],
  grand: ['#ffd23f', '#e8312a', '#f6b72a', '#ffe98a', '#c4201a'],
  gold: ['#ffe27a', '#f4b82a', '#fff0a0', '#e8a21a', '#ffd23f']
};
const PL = { mini: { t: 'MINI', c1: '#2fd0e0', c2: '#0a6a86' }, minor: { t: 'MINOR', c1: '#9a50ff', c2: '#4a1a96' }, major: { t: 'MAJOR', c1: '#ff7a2a', c2: '#a82a0a' }, grand: { t: 'GRAND', c1: '#e8312a', c2: '#6a0a1a', fs: 21 } };

function build() {
  L.setPrefix('lS');
  const TIER = { low: '#14a8a0', mid: '#d6347f', high: '#f6b72a', wild: '#e83aa0', scat: '#e03a2c', pin: '#52c43a' };
  const defsx = [];
  const S = []; // {id, name, body, ani}
  const spkA = (n, o = '50% 50%') => [n, o, 1.2, 'ease-out', '0%,25%{opacity:0;transform:scale(.2)}50%{opacity:1;transform:scale(1.4) rotate(20deg)}85%,100%{opacity:0;transform:scale(.5) rotate(40deg)}'];
  const spkB = (n) => [n, '50% 50%', 1.2, 'ease-out', '0%,10%{opacity:0;transform:scale(.2)}35%{opacity:1;transform:scale(1.3) rotate(-15deg)}70%,100%{opacity:0;transform:scale(.4) rotate(-40deg)}'];
  const spkC = (n) => [n, '50% 50%', 1.2, 'ease-out', '0%,40%{opacity:0;transform:scale(.2)}65%{opacity:1;transform:scale(1.3) rotate(25deg)}100%{opacity:0;transform:scale(.5) rotate(50deg)}'];
  const rimA = ['rim', '50% 50%', 1.2, 'ease-in-out', '0%{opacity:0}25%{opacity:1}60%{opacity:.8}100%{opacity:0}'];
  const noteA = (n, dx) => [n, '50% 50%', 1.2, 'ease-out', `0%,10%{opacity:0;transform:translate(0,6px) scale(.6)}30%{opacity:1}100%{opacity:0;transform:translate(${dx}px,-26px) scale(1.1) rotate(${dx}deg)}`];
  const add = (id, name, tier, fill, body, ani, ns) => S.push({ id, name, tier, fill, body: ns ? body : `<g transform="translate(64 65) scale(.86) translate(-64 -64)">${body}</g>`, ani: [rimA, ...ani] });
  const main = (body) => `<g class="a-main">${body}</g>`;
  const W = (k) => k;
  add('s0', 'Marigold', 'low', null, main(SYM.marigold()) + star(18, 22, 8, 'a-spk') + star(110, 100, 8, 'a-spk2'),
    [['main', '50% 50%', 1.2, 'ease-in-out', '0%{transform:none}25%{transform:scale(1.14) rotate(8deg)}50%{transform:scale(.97) rotate(-5deg)}75%{transform:scale(1.07) rotate(3deg)}100%{transform:none}'], spkA('spk'), spkB('spk2')]);
  add('s1', 'Maracas', 'low', null, SYM.maracas() + star(20, 104, 7, 'a-spk') + star(108, 22, 7, 'a-spk2'),
    [['mL', '50% 100%', 1.2, 'linear', '0%{transform:none}12%{transform:rotate(-22deg)}28%{transform:rotate(14deg)}44%{transform:rotate(-16deg)}60%{transform:rotate(10deg)}78%{transform:rotate(-5deg)}100%{transform:none}'],
     ['mR', '50% 100%', 1.2, 'linear', '0%{transform:none}12%{transform:rotate(20deg)}28%{transform:rotate(-14deg)}44%{transform:rotate(16deg)}60%{transform:rotate(-10deg)}78%{transform:rotate(5deg)}100%{transform:none}'], spkA('spk'), spkC('spk2')]);
  add('s2', 'Chili', 'low', null, main(SYM.chili()) + star(104, 104, 8, 'a-spk') + star(22, 100, 7, 'a-spk2'),
    [['main', '25% 30%', 1.2, 'ease-in-out', '0%{transform:none}20%{transform:rotate(-12deg) scale(1.05)}40%{transform:rotate(10deg) scale(1.08)}60%{transform:rotate(-7deg) scale(1.05)}80%{transform:rotate(4deg)}100%{transform:none}'], spkA('spk'), spkB('spk2')]);
  add('s3', 'Guitar', 'low', null, main(SYM.guitar()) + note(26, 40, 'a-n1') + note(102, 30, 'a-n2', '#ffe08a') + star(104, 100, 7, 'a-spk'),
    [['main', '50% 60%', 1.2, 'ease-in-out', '0%{transform:none}15%{transform:rotate(-7deg) scale(1.06)}30%{transform:rotate(5deg)}45%{transform:rotate(-5deg) scale(1.06)}60%{transform:rotate(4deg)}100%{transform:none}'], noteA('n1', -10), noteA('n2', 12), spkA('spk')]);
  add('s4', 'Taco', 'low', null, main(SYM.taco()) + `<g class="a-steam">${tacoSteam()}</g>` + star(112, 40, 7, 'a-spk') + star(14, 70, 7, 'a-spk2'),
    [['main', '50% 100%', 1.2, 'ease-out', '0%{transform:none}14%{transform:scale(1.1,.9)}34%{transform:translateY(-14px) scale(.96,1.06)}54%{transform:none}68%{transform:translateY(-6px)}82%{transform:none}100%{transform:none}'], ['steam', '50% 100%', 1.2, 'ease-out', '0%{opacity:.5;transform:none}50%{opacity:1;transform:translateY(-5px) scaleY(1.2)}100%{opacity:.5;transform:none}'], spkA('spk'), spkB('spk2')]);
  add('s5', 'Sugar Skull', 'mid', null, main(SYM.skull()) + star(112, 24, 7, 'a-spk') + star(14, 100, 7, 'a-spk2'),
    [['main', '50% 100%', 1.2, 'ease-in-out', '0%{transform:none}20%{transform:rotate(-6deg) scale(1.05)}45%{transform:rotate(6deg) scale(1.07)}70%{transform:rotate(-3deg) scale(1.04)}100%{transform:none}'],
     ['jaw', '50% 0%', 1.2, 'ease-in-out', '0%{transform:none}15%{transform:translateY(5px)}30%{transform:none}45%{transform:translateY(5px)}60%{transform:none}75%{transform:translateY(4px)}100%{transform:none}'],
     ['glow', '50% 50%', 1.2, 'ease-in-out', '0%{opacity:0;transform:scale(.7)}30%{opacity:1;transform:scale(1.1)}70%{opacity:.9}100%{opacity:0;transform:scale(1.2)}'], spkA('spk'), spkB('spk2')]);
  add('s6', 'Sombrero', 'mid', null, main(SYM.sombrero()) + star(16, 36, 7, 'a-spk') + star(112, 40, 8, 'a-spk2'),
    [['main', '50% 80%', 1.2, 'ease-out', '0%{transform:none}25%{transform:translateY(-14px) rotate(14deg)}50%{transform:translateY(-4px) rotate(-10deg)}75%{transform:translateY(-8px) rotate(6deg)}100%{transform:none}'], spkA('spk'), spkC('spk2')]);
  add('s7', 'Luchador Mask', 'mid', null, main(SYM.mask()) + star(14, 24, 7, 'a-spk') + star(112, 100, 7, 'a-spk2'),
    [['main', '50% 60%', 1.2, 'ease-in-out', '0%{transform:none}12%{transform:scale(.94)}30%{transform:scale(1.16) rotate(-4deg)}42%{transform:scale(1.12) rotate(4deg)}56%{transform:scale(1.14) rotate(-3deg)}100%{transform:none}'], spkA('spk'), spkB('spk2')]);
  add('s8', 'Trumpet', 'mid', null, main(SYM.trumpet()) + `<g class="a-rays">${ln('M96,20 q10,6 8,16 M104,12 q14,8 12,22', '#fff6b0', 3.4)}</g>` + note(22, 30, 'a-n1') + note(100, 112, 'a-n2', '#ffe08a'),
    [['main', '30% 70%', 1.2, 'ease-in-out', '0%{transform:none}15%{transform:translate(-3px,3px) rotate(-6deg)}30%{transform:translate(4px,-3px) rotate(5deg) scale(1.06)}50%{transform:translate(-3px,3px) rotate(-5deg)}70%{transform:translate(3px,-2px) rotate(3deg) scale(1.04)}100%{transform:none}'],
     ['rays', '0% 100%', 1.2, 'ease-out', '0%,10%{opacity:0;transform:scale(.6)}30%{opacity:1}55%{opacity:.2;transform:scale(1.2)}70%{opacity:1}100%{opacity:0;transform:scale(1.3)}'], noteA('n1', -8), noteA('n2', 10)]);
  // Lucho high symbol: head and shoulders fill the tile
  const lc = clip('<rect x="-30" y="-60" width="190" height="186" rx="16"/>');
  const luchoBody = `<g clip-path="${lc}"><g transform="translate(64 3) scale(.37) translate(-200 -64)">${lucho(50, { anim: true })}</g></g>`;
  add('s9', 'Don Lucho', 'high', grad([[0, '#fff8d0'], [.55, '#ffe28a'], [1, '#f2b73a']], 0, 0, 0, 1), luchoBody,
    [['head', '50% 85%', 1.3, 'ease-in-out', '0%{transform:none}15%{transform:rotate(-7deg) translateY(-4px)}35%{transform:rotate(6deg) translateY(-2px)}55%{transform:rotate(-5deg) translateY(-4px)}75%{transform:rotate(4deg)}100%{transform:none}'],
     ['pon', '50% 0%', 1.3, 'ease-in-out', '0%{transform:none}25%{transform:scale(1.03,.97)}50%{transform:scale(.98,1.03)}75%{transform:scale(1.02,.98)}100%{transform:none}'],
     ['lid', '50% 50%', 1.3, 'step-end', '0%,18%{opacity:0}22%,30%{opacity:1}34%,60%{opacity:0}64%,70%{opacity:1}74%,100%{opacity:0}'], spkA('spk'), spkB('spk2'), spkC('spk3')], true);
  add('s10', 'WILD Poncho', 'wild', grad([[0, '#fff0f8'], [1, '#f6b0d8']], 0, 0, 0, 1), main(SYM.wild()) + star(14, 104, 7, 'a-spk') + star(112, 108, 7, 'a-spk2'),
    [['main', '50% 20%', 1.2, 'ease-in-out', '0%{transform:none}20%{transform:skewX(-6deg) scale(1.06)}45%{transform:skewX(6deg) scale(1.08)}70%{transform:skewX(-3deg) scale(1.04)}100%{transform:none}'], spkA('spk'), spkB('spk2')]);
  add('s11', 'Fiesta Drum', 'scat', grad([[0, '#fff3ee'], [1, '#f4b8a8']], 0, 0, 0, 1), `<g class="a-main">${SYM.drum()}</g><g class="a-ring">${ln('M10,66 C14,48 30,38 64,36 C98,38 114,48 118,66', '#fff3a0', 3.4, 'stroke-dasharray="5 4"')}</g>` + star(112, 22, 7, 'a-spk'),
    [['main', '50% 80%', 1.2, 'ease-in-out', '0%{transform:none}10%{transform:scale(1.1,.92)}22%{transform:scale(.95,1.06)}34%{transform:scale(1.1,.92)}46%{transform:scale(.97,1.04)}58%{transform:scale(1.08,.94)}100%{transform:none}'],
     ['stL', '50% 100%', 1.2, 'linear', '0%{transform:none}10%{transform:rotate(26deg)}22%{transform:none}34%{transform:rotate(26deg)}46%{transform:none}58%{transform:rotate(26deg)}70%,100%{transform:none}'],
     ['stR', '50% 100%', 1.2, 'linear', '0%{transform:none}16%{transform:rotate(-26deg)}28%{transform:none}40%{transform:rotate(-26deg)}52%{transform:none}64%{transform:rotate(-26deg)}76%,100%{transform:none}'],
     ['ring', '50% 50%', 1.2, 'ease-out', '0%,8%{opacity:0;transform:scale(.8)}20%{opacity:1}60%,100%{opacity:0;transform:scale(1.18)}'], spkA('spk')]);
  const monAni = [['main', '50% 0%', 1.2, 'ease-in-out', '0%{transform:none}18%{transform:rotate(-14deg)}38%{transform:rotate(12deg)}58%{transform:rotate(-8deg)}78%{transform:rotate(4deg)}100%{transform:none}'], spkA('spk'), spkB('spk2'), spkC('spk3')];
  const spk3 = star(112, 30, 8, 'a-spk') + star(14, 40, 7, 'a-spk2') + star(100, 112, 7, 'a-spk3');
  const monTile = grad([[0, '#f6fff0'], [1, '#bfe8a0']], 0, 0, 0, 1);
  add('s12', 'Money Pinata (empty belly plate, belly centre (64,66) r 21)', 'pin', monTile, `<g transform="translate(0 2)">${main(pin(PIN.mon))}</g>` + spk3, monAni);
  for (const k of ['mini', 'minor', 'major', 'grand']) {
    const rimc = { mini: '#1fb5c8', minor: '#9a50ff', major: '#ff7a2a', grand: '#e8312a' }[k];
    const fill = { mini: grad([[0, '#effcff'], [1, '#9adbe8']], 0, 0, 0, 1), minor: grad([[0, '#f6f0ff'], [1, '#c8b0f0']], 0, 0, 0, 1), major: grad([[0, '#fff3e6'], [1, '#ffc08a']], 0, 0, 0, 1), grand: grad([[0, '#fff8d0'], [1, '#ffd05a']], 0, 0, 0, 1) }[k];
    add('s12_' + k, 'Jackpot Pinata ' + k.toUpperCase(), 'pin', fill, `<g transform="translate(0 1)">${main(pin(PIN[k], { crown: true, plaque: PL[k], ring: rimc }))}</g>` + spk3, monAni);
    S[S.length - 1].rim = rimc;
  }
  add('s13', 'Collector Pinata (golden, bonus only)', 'pin', grad([[0, '#fff8d0'], [1, '#ffd05a']], 0, 0, 0, 1),
    `<g class="a-aura">${ci(64, 62, 56, rgrad([[0, 'rgba(255,240,150,.9)'], [1, 'rgba(255,220,100,0)']]), 0)}</g><g transform="translate(0 2)">${main(pin(PIN.gold, { ring: '#c47c12', belly: '#ffe27a' }) + `<path d="M64,50 l4.5,10 l11,1 l-8.5,7 l3,11 l-10,-6 l-10,6 l3,-11 l-8.5,-7 l11,-1z" fill="#e8312a" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>`)}</g>` + spk3,
    [...monAni, ['aura', '50% 50%', 1.2, 'ease-in-out', '0%{opacity:.2;transform:scale(.85)}40%{opacity:1;transform:scale(1.08)}100%{opacity:.2;transform:scale(.9)}']]);
  S[S.length - 1].rim = '#f6b72a';

  let css = '', winv = [], out = '';
  for (const s of S) {
    const n = s.id.replace('s', 'sy');
    const k = s.id; // var prefix
    let c = '';
    for (const [an, org, dur, ease, kf] of s.ani) {
      c += `.${n} .a-${an}{opacity:var(--o_${an},1);transform-box:fill-box;transform-origin:${org};animation:var(--k${k}_${an},none) calc(${dur}s*var(--spd,1)) ${ease} var(--delay,0ms) both}@keyframes ${n}_${an}{${kf}}`;
      winv.push(`--k${k}_${an}:${n}_${an}`);
    }
    c = c.replace(/opacity:var\(--o_[a-z0-9]+,1\);/g, '');
    // particles / glow / rim / lid / steam / rays / ring / aura start hidden
    for (const hidden of ['spk', 'spk2', 'spk3', 'rim', 'lid', 'glow', 'ring', 'aura', 'n1', 'n2', 'rays']) c = c.replace(new RegExp(`\\.${n} \\.a-${hidden}\\{`), `.${n} .a-${hidden}{opacity:0;`);
    css += c;
    const rim = s.rim || TIER[s.tier];
    out += `<symbol id="${s.id}" viewBox="0 0 128 128"><style>${c}</style><g class="${n}">${tile(rim, s.fill)}${s.body}${rimGlow()}</g></symbol>\n`;
  }
  const winvars = `.cell.hit,.winAnim{${winv.join(';')}}`;
  return { svg: out, defs: L.defs.slice(), winvars, list: S.map(s => ({ id: s.id, name: s.name, tier: s.tier })) };
}
module.exports = { build, pin, PIN, PL, tile, star, note };
