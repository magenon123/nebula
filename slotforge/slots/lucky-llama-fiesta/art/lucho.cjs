const L = require('./lib.cjs');
const { O, grad, rgrad, clip, p, np, ln, el, ci, rc, fluff, flower } = L;

function eye(cx, cy, flip) {
  const s = flip ? -1 : 1;
  const iris = rgrad([[0, '#f2b04a'], [.55, '#b8601c'], [1, '#5e2a0e']], .45, .4, .6);
  return `<g transform="translate(${cx} ${cy}) scale(${s} 1)">
    <ellipse cx="0" cy="2" rx="31" ry="33" fill="#b98657" opacity=".30"/>
    ${p('M-21,-3 C-21,-21 -9,-27 0,-27 C11,-27 21,-20 21,-3 C21,17 11,27 0,27 C-11,27 -21,17 -21,-3Z', '#1a0a06', 3)}
    <ellipse cx="0" cy="2" rx="16" ry="21" fill="${iris}"/>
    <ellipse cx="0" cy="3" rx="8.5" ry="12.5" fill="#0a0403"/>
    <circle cx="-6.5" cy="-8" r="6.2" fill="#fff"/><circle cx="6" cy="10" r="3" fill="#fff" opacity=".95"/>
    <path d="M-20,-4 C-17,-22 17,-24 21,-4" fill="none" stroke="${O}" stroke-width="6" stroke-linecap="round"/>
    <path d="M-20,-8 C-26,-10 -28,-14 -30,-20 M-17,-16 C-22,-20 -23,-25 -24,-31 M-9,-23 C-12,-29 -12,-33 -12,-38" fill="none" stroke="${O}" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M-17,14 C-9,24 9,24 16,13" fill="none" stroke="#ffe3b0" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
  </g>`;
}

function lucho(dy = 0, opt = {}) {
  const parts = [];
  const FUR = grad([[0, '#fffbf1'], [.45, '#f9e5c0'], [1, '#e4b684']], 0, 0, 1, 1);
  const FURH = grad([[0, '#fffbf1'], [.5, '#f6dcb2'], [1, '#d9a56e']], 0, 0, 1, 0);
  const MUZ = grad([[0, '#fdeed8'], [1, '#e2b48a']], .2, 0, .8, 1);
  const SHADE = grad([[0, 'rgba(110,55,20,0)'], [.5, 'rgba(110,55,20,0)'], [1, 'rgba(110,55,20,.42)']], 0, 0, 1, 0);
  const HEAD = 'M200,96 C150,96 120,132 120,176 C120,208 138,232 156,248 L158,262 C160,284 178,300 200,300 C222,300 240,284 242,262 L244,248 C262,232 280,208 280,176 C280,132 250,96 200,96Z';
  const lp=[[146,230],[132,252],[144,256],[126,284],[140,288],[118,318],[132,322],[104,350],[118,354],[94,376]];
  const rp=lp.map(([x,y])=>[400-x,y]).reverse();
  const NECK='M'+lp.map(q=>q.join(',')).join(' L')+' L306,376 L'+rp.map(q=>q.join(',')).join(' L')+'Z';
  const POP = 'M62,376 C98,346 160,338 200,342 C240,338 302,346 338,376 L380,456 L20,456Z';
  const pc = clip(`<path d="${POP}"/>`);
  let s = '';
  // neck
  s += p(NECK, FURH, 3.5);
  s += np(NECK, SHADE);
  { const rr=L.rng(5); const nc=clip(`<path d="${NECK}"/>`); let u='';
    for(let i=0;i<70;i++){const x=110+rr()*180,y=240+rr()*130,l=8+rr()*12,lean=(x-200)*.1; const col=x<190?'rgba(255,255,255,.7)':'rgba(140,85,45,.5)'; u+=`<path d="M${x.toFixed(1)},${y.toFixed(1)} q${(lean+3).toFixed(1)},${(l*.5).toFixed(1)} ${(lean*1.6).toFixed(1)},${l.toFixed(1)}" stroke="${col}" stroke-width="2" fill="none" stroke-linecap="round"/>`;}
    s += `<g clip-path="${nc}">${u}</g>`; }
  s += ln('M150,262 C140,290 130,320 112,350 M160,270 q-6,16 -8,30 M170,320 q-8,14 -14,24 M240,290 q4,14 2,28 M252,300 q6,14 4,26', '#c79760', 2.2);
  s += `<ellipse cx="200" cy="304" rx="64" ry="30" fill="${rgrad([[0,'rgba(100,50,20,.5)'],[1,'rgba(100,50,20,0)']])}"/>`;
  parts.push(s); s = '';
  // ears (behind head)
  const ear = `${p('M146,134 C114,106 102,58 124,14 C142,48 164,86 184,124Z', FUR, 3.8)}
    ${np('M152,124 C130,98 120,62 126,38 C142,62 158,92 172,118Z', '#e8998a')}
    ${np('M146,122 C130,96 122,66 127,44 C132,70 142,98 156,120Z', '#c8665c', 'opacity=".55"')}
    ${ln('M138,116 C122,92 116,60 124,32', '#fff7d2', 3, 'opacity=".9"')}
    ${ln('M150,128 L146,112 M158,126 L156,108 M130,60 L134,72', '#bf8a58', 2)}`;
  s += ear;
  s += `<g transform="translate(400 0) scale(-1 1)">${ear.replace(/#fff7d2/g, '#f0d29c')}</g>`;
  s += `<g transform="translate(400 0) scale(-1 1)">${np('M146,134 C114,106 102,58 124,14 C142,48 164,86 184,124Z', 'rgba(110,55,20,.28)')}</g>`;

  parts.push(s); s = '';
  // poncho
  s += p(POP, '#d92b78', 4);
  s += `<g clip-path="${pc}">`;
  const cols = ['#f4b82a', '#d92b78', '#0f9ba0', '#f58a2e', '#fff0cf', '#d92b78', '#0f9ba0', '#f4b82a'];
  for (let k = cols.length - 1; k >= 0; k--) {
    const y = 350 + k * 17;
    s += `<path d="M10,${y - 18} L200,${y + 56} L390,${y - 18}" fill="none" stroke="${cols[k]}" stroke-width="19"/>`;
  }
  // chevron stitch lines and diamonds
  for (let k = 0; k < 7; k++) { const y = 358 + k * 17; s += `<path d="M10,${y - 18} L200,${y + 56} L390,${y - 18}" fill="none" stroke="rgba(42,18,9,.55)" stroke-width="1.6" stroke-dasharray="6 5"/>`; }
  for (let i = 0; i < 9; i++) { const x = 52 + i * 37; const y = 412 + (i % 2) * 0; s += `<path d="M${x},${y - 7} l6,7 l-6,7 l-6,-7z" fill="#fff0cf" stroke="${O}" stroke-width="1.6" opacity="0"/>`; }
  s += `<rect x="0" y="330" width="400" height="140" fill="${grad([[0, 'rgba(255,230,160,.0)'], [.5, 'rgba(60,10,40,0)'], [1, 'rgba(60,10,40,.34)']], 0, 0, 1, 0)}"/>`;
  s += `<path d="M62,376 C90,352 120,344 150,342" fill="none" stroke="#fff3b8" stroke-width="6" opacity=".8"/>`;
  s += `</g>`;
  s += ln(POP, O, 4.5);
  // fringe
  const fcol = ['#d92b78', '#f4b82a', '#0f9ba0', '#f58a2e'];
  for (let i = 0; i < 22; i++) {
    const x = 24 + i * 16.1, y0 = 455 - (Math.abs(x - 200) < 0 ? 0 : 0);
    s += p(`M${x},${y0} l13,0 l-2,20 q-4.5,3 -9,0z`, fcol[i % 4], 2.2);
  }
  // V-neck
  s += p('M156,342 Q200,432 244,342 Q200,330 156,342Z', '#fbe7c3', 3.5);
  s += np('M170,346 Q200,402 230,346 Q200,338 170,346Z', 'rgba(110,55,20,.35)');
  s += ln('M150,342 Q200,444 250,342', '#f4b82a', 6) + ln('M150,342 Q200,444 250,342', O, 1.4, 'stroke-dasharray="5 4"');
  { const pts=[]; const N=9; for(let i=0;i<=N;i++){const t=i/N; const x=148+104*t; const y=340+4*45*t*(1-t)+ (i%2?14:3); pts.push([x,y]);}
    s += p('M146,338 L'+pts.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' L')+' L254,338Z', '#f6dcb2', 3);
    s += ln('M160,352 q6,8 10,16 M186,368 q4,8 6,14 M214,366 q2,8 0,14 M240,352 q-4,8 -8,16', '#c79760', 2); }

  parts.push(s); s = '';
  // head
  const ck=(pts)=>p('M'+pts.map(q=>q.join(',')).join(' L')+'Z', FUR, 3.4);
  s += ck([[130,190],[110,206],[124,210],[108,228],[128,228],[120,248],[146,238],[156,200]]);
  s += p('M'+[[270,190],[290,206],[276,210],[292,228],[272,228],[280,248],[254,238],[244,200]].map(q=>q.join(',')).join(' L')+'Z', '#e4b684', 3.4);
  s += p(HEAD, FUR, 4.2);
  s += np(HEAD, SHADE);
  { const rr=L.rng(11); const hc=clip(`<path d="${HEAD}"/>`); let t='';
    for(let i=0;i<50;i++){const x=128+rr()*144,y=130+rr()*130,l=6+rr()*9,lean=(x-200)*.08; const col=x<190?'rgba(255,255,255,.75)':'rgba(150,95,50,.45)'; t+=`<path d="M${x.toFixed(1)},${y.toFixed(1)} q${(lean+2).toFixed(1)},${(l*.6).toFixed(1)} ${(lean*2).toFixed(1)},${l.toFixed(1)}" stroke="${col}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;}
    s += `<g clip-path="${hc}">${t}</g>`; }
  // cheek wool tufts
  // muzzle
  const MZ = 'M162,230 C162,212 182,206 200,206 C218,206 238,212 238,230 L243,262 C243,286 224,303 200,303 C176,303 157,286 157,262Z';
  s += p(MZ, MUZ, 3);
  s += np(MZ, grad([[0, 'rgba(110,55,20,0)'], [.55, 'rgba(110,55,20,0)'], [1, 'rgba(110,55,20,.3)']], 0, 0, 1, 0));
  // nose pad
  s += p('M200,257 C190,246 174,249 177,260 C179,268 193,268 200,262 C207,268 221,268 223,260 C226,249 210,246 200,257Z', '#5b2e22', 3);
  s += `<ellipse cx="189" cy="253.5" rx="6" ry="2.4" fill="#fff" opacity=".4" transform="rotate(-10 189 253)"/>`;
  s += ln('M200,264 L200,279', O, 2.6);
  // nostrils
  s += np('M184,258 q-4,-2 -6,2 q4,3 6,-2z M216,258 q4,-2 6,2 q-4,3 -6,-2z', '#1a0a06');
  // smile + open mouth
  s += p('M171,281 C186,300 214,300 229,281 C228,308 216,320 200,320 C184,320 172,308 171,281Z', '#701a24', 3.4);
  s += `<clipPath id="mouthc"><path d="M171,281 C186,300 214,300 229,281 C228,308 216,320 200,320 C184,320 172,308 171,281Z"/></clipPath>`;
  s += `<g clip-path="url(#mouthc)"><ellipse cx="200" cy="318" rx="20" ry="11" fill="#e8607a"/><path d="M188,316 Q200,309 212,316" stroke="#b83a55" stroke-width="2" fill="none"/></g>`;
  s += p('M186,285 L186,297 Q186,300 190,300 L199,300 L199,287Z', '#fff9ee', 2.4);
  s += p('M201,287 L201,300 L210,300 Q214,300 214,297 L214,285Z', '#f6c322', 2.4);
  s += `<path d="M204,289 L204,296" stroke="#fff8c8" stroke-width="2.6" stroke-linecap="round"/><path d="M226,276 l2.5,6 l6,2.5 l-6,2.5 l-2.5,6 l-2.5,-6 l-6,-2.5 l6,-2.5z" fill="#fff6b0" stroke="${O}" stroke-width="1.2"/>`;
  s += ln('M168,283 C160,282 156,276 156,270 M232,283 C240,282 244,276 244,270', O, 3);
  // eyes
  s += eye(155, 178, false) + eye(245, 178, true);
  // brows (fur tufts)
  s += ln('M128,154 C138,142 164,138 180,148', '#6a3a1c', 4.5) + ln('M272,154 C262,142 236,138 220,148', '#6a3a1c', 4.5);
  s += ln('M122,160 l8,-6 M116,168 l10,-6', '#6a3a1c', 3) + ln('M278,160 l-8,-6 M284,168 l-10,-6', '#6a3a1c', 3);
  // blush
  s += `<ellipse cx="134" cy="232" rx="15" ry="9" fill="#f0766f" opacity=".42"/><ellipse cx="266" cy="232" rx="15" ry="9" fill="#f0766f" opacity=".42"/>`;
  // freckle whisker dots + fur strokes
  s += `<g fill="#9b6540" opacity=".7"><circle cx="177" cy="276" r="1.5"/><circle cx="184" cy="280" r="1.5"/><circle cx="223" cy="276" r="1.5"/><circle cx="216" cy="280" r="1.5"/></g>`;
  s += ln('M130,196 C128,204 130,210 134,214 M270,196 C272,204 270,210 266,214 M168,214 q4,-5 8,0 M224,214 q4,-5 8,0', '#b88556', 2);
  // topknot
  const tk = [[152, 126, 17], [172, 114, 20], [198, 108, 22], [226, 114, 20], [248, 126, 17], [186, 130, 17], [214, 130, 17], [200, 140, 15]];
  s += fluff(tk, FUR);
  s += ln('M168,116 C172,126 178,132 184,136 M214,112 C218,122 222,130 228,134 M196,118 C198,128 200,136 202,142', '#c79760', 2);
  s += `<path d="M138,134 C142,118 152,108 164,102" stroke="#fffbe0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>`;
  // flower crown
  s += ln('M126,124 C148,84 252,84 274,124', O, 14) + ln('M126,124 C148,84 252,84 274,124', '#3b9a44', 9) + ln('M130,120 C150,86 250,86 270,120', '#7fd45a', 2.4, 'opacity=".9"');
  const leaf = (x, y, r) => p(`M0,0 C8,-12 22,-12 30,0 C22,10 8,10 0,0Z`, '#2f9a48', 2.4, `transform="translate(${x} ${y}) rotate(${r}) scale(.8)"`);
  s += leaf(148, 104, -150) + leaf(168, 90, -100) + leaf(232, 90, -80) + leaf(252, 104, -30) + leaf(136, 118, 160) + leaf(264, 118, 20);
  s += flower(136, 118, 13, 6, '#27c4c8', '#fff3b0', 10, 2, '#1c9a9e');
  s += flower(264, 118, 13, 6, '#27c4c8', '#fff3b0', -10, 2, '#1c9a9e');
  s += flower(156, 99, 17, 8, '#ee3d8f', '#ffd23f', 0, 2.2, '#ff7ab3');
  s += flower(244, 99, 17, 8, '#ee3d8f', '#ffd23f', 20, 2.2, '#ff7ab3');
  s += flower(180, 90, 13, 7, '#ffd23f', '#e8761a', 5, 2, '#ffe98a');
  s += flower(220, 90, 13, 7, '#ffd23f', '#e8761a', -5, 2, '#ffe98a');
  s += flower(200, 86, 21, 12, '#f58a22', '#c24a10', 0, 2.4, '#ffb347');
  s += `<circle cx="193" cy="79" r="3.2" fill="#fff" opacity=".6"/>`;
  // rim light on left edges
  s += ln('M123,166 C120,186 124,204 132,220', '#fff6c8', 3.6, 'opacity=".9"');
  // blink lids + sparkles (win motion hooks)
  const star = (x, y, r, c) => `<path class="${c}" d="M${x},${y - r} l${r * .3},${r * .7} l${r * .7},${r * .3} l${-r * .7},${r * .3} l${-r * .3},${r * .7} l${-r * .3},${-r * .7} l${-r * .7},${-r * .3} l${r * .7},${-r * .3}z" fill="#fff6b0" stroke="${O}" stroke-width="2.2"/>`;
  if (opt.anim) {
    const lid = (cx) => `<g transform="translate(${cx} 178)"><ellipse cx="0" cy="2" rx="25" ry="29" fill="#f7e2bc"/><path d="M-20,2 Q0,18 20,2" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/><path d="M-19,6 l-8,4 M-12,12 l-5,7 M19,6 l8,4 M12,12 l5,7" stroke="${O}" stroke-width="3" stroke-linecap="round"/></g>`;
    s += `<g class="a-lid">${lid(155)}${lid(245)}</g>`;
    s += star(262, 112, 13, 'a-spk') + star(136, 108, 11, 'a-spk2') + star(222, 276, 9, 'a-spk3');
  }
  parts.push(s);
  const T = `translate(0 ${dy})`;
  const wrapP = opt.anim ? `<g class="a-pon">${parts[2]}</g>` : parts[2];
  const head = `${parts[1]}${parts[3]}`;
  return `<g>${parts[0]}${wrapP}<g transform="${T}"><g class="a-head">${head}</g></g></g>`;
}
module.exports = { lucho, eye };
