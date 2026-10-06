const L = require('./lib.cjs');
const { O, grad, p, np, ln, ci, fluff, flower } = L;
module.exports = function () {
  L.setPrefix('lL');
  const fur = grad([[0, '#fffbf1'], [1, '#e4b684']], 0, 0, 1, 1);
  const ear = (sg) => `<g transform="translate(${360 + sg * 74} 114) rotate(${sg * 10}) scale(${sg} 1)">` +
    p('M-6,0 C-44,-14 -58,-62 -30,-100 C-26,-92 -26,-96 -22,-100 C-10,-74 4,-42 18,-6Z', fur, 5) +
    np('M-8,-8 C-36,-20 -44,-56 -28,-84 C-14,-62 -2,-36 8,-10Z', '#e8998a') + np('M-10,-10 C-30,-24 -38,-52 -28,-76 C-22,-54 -14,-34 -4,-12Z', '#c8665c', 'opacity=".5"') +
    p('M-30,-100 l-8,-10 l10,4 l0,-12 l8,12 l8,-6 l-4,12z', fur, 3) +
    ln('M-30,-8 C-46,-26 -50,-60 -34,-90', '#fff7d2', 3, 'opacity=".9"') + ln('M-4,-4 l-2,-14 M6,-6 l1,-12', '#bf8a58', 2.4) + `</g>`;
  let s = ear(-1) + ear(1);
  s += fluff([[340, 112, 17], [380, 112, 17], [360, 100, 20]], '#fbe9cc') + flower(360, 82, 20, 12, '#f58a1f', '#b8430c', 0, 2, '#ffb347') + flower(330, 96, 13, 8, '#ee3d8f', '#ffd23f', 0, 1.8) + flower(390, 96, 13, 8, '#1cb8bd', '#ffd23f', 0, 1.8) + flower(312, 112, 10, 7, '#ffd23f', '#e8761a', 0, 1.6) + flower(408, 112, 10, 7, '#ee3d8f', '#ffd23f', 0, 1.6);
  const cl = ['#ee3d8f', '#1cb8bd', '#ffd23f', '#f58a2e', '#7a3fd0'];
  const word = (t, size, y, off, ls) => {
    const tsp = t.split('').map((ch, i) => `<tspan fill="${cl[(i + off) % 5]}">${ch}</tspan>`).join('');
    const b = `x="360" y="${y}" font-family="LlLuck" font-size="${size}" text-anchor="middle" letter-spacing="${ls}"`;
    return `<text ${b} fill="none" stroke="${O}" stroke-width="${size * .3}" stroke-linejoin="round">${t}</text><text ${b} fill="none" stroke="#ffd23f" stroke-width="${size * .18}" stroke-linejoin="round">${t}</text><text ${b} stroke="${O}" stroke-width="${size * .035}" stroke-linejoin="round" paint-order="stroke">${tsp}</text><text ${b} fill="${grad([[0, 'rgba(255,255,255,.65)'], [.5, 'rgba(255,255,255,0)'], [1, 'rgba(60,10,40,.35)']])}">${t}</text><text ${b} fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="2 5" stroke-linecap="round" opacity=".8">${t}</text>`;
  };
  s += word('LUCKY LLAMA', 88, 160, 0, 3) + word('FIESTA', 66, 222, 2, 6);
  for (const sg of [-1, 1]) s += flower(360 + sg * 238, 196, 24, 12, '#f58a1f', '#b8430c', 0, 2, '#ffb347') + flower(360 + sg * 274, 208, 16, 9, '#ffd23f', '#b8430c', 10, 1.8) + flower(360 + sg * 208, 214, 13, 8, '#ee3d8f', '#ffd23f', 0, 1.6);
  return `<!-- Lucky Llama Fiesta logo (leo). viewBox 720x236; in game ~432x142 at stage (584,2); loading/intro clone it big. Static (no animation). Fonts: LlLuck (slot.css). -->\n<svg id="logo" viewBox="0 0 720 236" overflow="visible"><defs>${L.defs.join('')}</defs>${s}</svg>\n`;
};
