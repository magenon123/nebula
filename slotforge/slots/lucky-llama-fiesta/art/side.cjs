const L = require('./lib.cjs');
const { O, grad, p, np, ln, rc, txt } = L;
module.exports = function () {
  L.setPrefix('lX');
  const gold = () => grad([[0, '#fff2a8'], [.35, '#f2c04a'], [.7, '#b87a1c'], [1, '#6a3c0c']], 0, 0, 0, 1);
  const cols = [['#f4b82a', '#c88a10'], ['#d92b78', '#8a1050'], ['#0f9ba0', '#0a6068'], ['#f58a2e', '#b85a10'], ['#7a3fd0', '#4a1a96'], ['#e8312a', '#8a0f1a']];
  const lab = ['x1', 'x2', 'x3', 'x5', 'x8', 'x10'], wc = ['1 WILD', '2 WILDS', '3 WILDS', '5 WILDS', '7 WILDS', '10+ WILDS'];
  const H = 71, top = 12; let st = '';
  for (let k = 0; k < 6; k++) {
    const y = top + (5 - k) * H, c = cols[k];
    st += `<g class="s${k + 1}"><rect x="10" y="${y + 2}" width="68" height="${H - 4}" rx="7" fill="${grad([[0, c[0]], [1, c[1]]], 0, 0, 0, 1)}" stroke="${O}" stroke-width="3"/>` +
      `<path d="${Array.from({ length: 6 }, (_, i) => `M${12 + i * 11.5},${y + H - 6} l5.7,-6 l5.7,6`).join(' ')}" fill="none" stroke="rgba(42,18,9,.45)" stroke-width="2"/><path d="M14,${y + 7} h60" stroke="rgba(255,255,255,.55)" stroke-width="2.6" stroke-linecap="round"/>` +
      `<text class="lb" id="ldT${k + 1}" x="44" y="${y + 38}" text-anchor="middle" font-family="LlLuck" font-size="28" fill="#fff" stroke="${O}" stroke-width="5" paint-order="stroke" stroke-linejoin="round">${lab[k]}</text>` +
      `<text class="sb" x="44" y="${y + 58}" text-anchor="middle" font-family="LlLil" font-size="12.5" fill="#fff0cf" stroke="${O}" stroke-width="3" paint-order="stroke" stroke-linejoin="round">${wc[k]}</text>` +
      `<rect class="dim" x="10" y="${y + 2}" width="68" height="${H - 4}" rx="7" fill="rgba(30,10,24,.62)"/><rect class="cur" x="6" y="${y - 1}" width="76" height="${H + 2}" rx="9" fill="none" stroke="#fff2a0" stroke-width="5"/><rect class="cur" x="6" y="${y - 1}" width="76" height="${H + 2}" rx="9" fill="none" stroke="${O}" stroke-width="1.4"/></g>`;
  }
  const ladder = `<svg id="ladder" class="m0" viewBox="0 -40 88 490" width="88" height="490">` +
    `<defs>${L.defs.join('')}</defs>` + rc(2, 0, 84, 448, 12, grad([[0, '#c4723a'], [1, '#6e3216']], 0, 0, 0, 1), 4.5) + rc(7, 6, 74, 436, 8, '#2a100a', 2.6) + st +
    [[8, 8], [80, 8], [8, 440], [80, 440]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${gold()}" stroke="${O}" stroke-width="1.2"/>`).join('') +
    rc(-4, -38, 96, 34, 9, grad([[0, '#d98a4a'], [1, '#8a4420']], 0, 0, 0, 1), 3.6) + txt('PONCHO', 44, -14, 20, '#fff0cf', { font: 'Lil', stroke: O, sw: 4 }) +
    `<path class="ptr" d="M90,0 l14,10 l-14,10z" fill="#ffd23f" stroke="${O}" stroke-width="2.4"/></svg>`;
  const use = (id, w, h, cls = '', idn = '') => `<svg ${idn ? `id="${idn}" ` : ''}class="${cls}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><use href="#${id}"/></svg>`;
  return `<!-- Lucky Llama Fiesta side pieces (leo). #ladder = Poncho ladder (left of the board, stage (262,150) 88x490, toggle ONE class m1..m6 = ladderStep; labels are live text #ldT1..#ldT6). Everything else is hidden until you add class "on". See ART-NOTES.md for positions and states. -->
<div id="side">
 <div id="ladderW">${ladder}</div>
 <div id="jps">${[['Grand', 'jpGrand'], ['Major', 'jpMajor'], ['Minor', 'jpMinor'], ['Mini', 'jpMini']].map(([n, i]) => `<div class="jp" id="${i}">${use('llJp' + n, 220, 84)}<b class="jv"></b></div>`).join('')}</div>
 <div id="lkRespins" class="plate">${use('llRespins', 320, 92)}<b id="lkRespinsN"></b></div>
 <div id="lkTotal" class="plate">${use('llTotal', 520, 110)}<b id="lkTotalV"></b></div>
 <div id="coLine" class="plate">${use('llPlateLine', 520, 60)}<span id="coLineT"></span></div>
 <div id="coWin" class="plate">${use('llPlateWin', 360, 96)}<b id="coWinV"></b></div>
 <div id="pdSpins" class="plate">${use('llSpinsLeft', 300, 80)}<b id="pdSpinsN"></b></div>
 <div id="pdCallSpins" class="plate">${use('llCallSpins', 330, 92)}<b id="pdCallSpinsN"></b></div>
 <div id="pdCallMult" class="plate">${use('llCallMult', 440, 92)}<b id="pdCallMultN"></b></div>
 <div id="pdCollector" class="plate">${use('llCollector', 300, 300)}</div>
 <div id="grandPlate" class="plate">${use('llGrand', 700, 300)}<b id="grandV"></b></div>
</div>
`;
};
