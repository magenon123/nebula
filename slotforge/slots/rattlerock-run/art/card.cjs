// node card.cjs -> /home/user/nebula/cards/rattlerock-run.webp (720x944, shared game-card look: hero art big, title big, no footer)
const { chromium } = require('/home/user/nebula/node_modules/playwright'); const fs = require('fs'), path = require('path');
const B = require('./base.cjs');
const D = path.join(__dirname, '..');
const sym = fs.readFileSync(path.join(D, 'symbols.svg'), 'utf8');
const logo = fs.readFileSync(path.join(D, 'logo.html'), 'utf8').replace(/<!--[\s\S]*?-->/, '').replace('<svg id="logo"', '<svg id="cardLogo"');
const css = fs.readFileSync(path.join(D, 'slot.css'), 'utf8').match(/@font-face[^\n]*\n@font-face[^\n]*/)[0];
const use = (id, x, y, w, h, extra = '') => `<svg style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:visible;${extra}"><use href="#${id}"/></svg>`;
const rays = Array.from({ length: 18 }, (_, i) => { const a = i * Math.PI / 9; return `<polygon points="360,470 ${360 + Math.cos(a - .06) * 900},${470 + Math.sin(a - .06) * 900} ${360 + Math.cos(a + .06) * 900},${470 + Math.sin(a + .06) * 900}" fill="#fff0b0" opacity="${i % 2 ? .1 : .05}"/>`; }).join('');
const html = `<!doctype html><meta charset=utf-8><style>${css}body{margin:0;width:720px;height:944px;overflow:hidden;position:relative;background:#0a0828}</style>
<svg width=0 height=0 style="position:absolute">${sym}</svg>
<img src="file://${path.join(__dirname, 'bake', 'far-lv1.png')}" style="position:absolute;left:-1010px;top:-20px;height:1000px;width:2222px;filter:saturate(1.15)">
<svg width="720" height="944" style="position:absolute;left:0;top:0">${rays}<defs><radialGradient id="cg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd878" stop-opacity=".85"/><stop offset=".5" stop-color="#ff9a30" stop-opacity=".3"/><stop offset="1" stop-color="#ff9a30" stop-opacity="0"/></radialGradient><radialGradient id="vg" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#05020c" stop-opacity="0"/><stop offset="1" stop-color="#05020c" stop-opacity=".78"/></radialGradient><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05020c" stop-opacity="0"/><stop offset="1" stop-color="#05020c" stop-opacity=".9"/></linearGradient></defs><ellipse cx="360" cy="470" rx="420" ry="360" fill="url(#cg)"/><rect width="720" height="944" fill="url(#vg)"/><rect y="640" width="720" height="304" fill="url(#bg2)"/></svg>
${use('rrCartCheer', -14, 64, 748, 730)}
${use('rrGem10', 4, 30, 170, 213, 'transform:rotate(-12deg)')}${use('rrGem5', 548, 20, 160, 200, 'transform:rotate(10deg)')}${use('rrGem3', 590, 330, 124, 155, 'transform:rotate(-8deg)')}${use('rrGem2', 6, 340, 124, 155, 'transform:rotate(12deg)')}
<div style="position:absolute;left:20px;top:748px;width:680px">${logo.replace('<svg', '<svg style="width:680px;height:190px;overflow:visible;filter:drop-shadow(0 4px 0 rgba(0,0,0,.5))"')}</div>`;
fs.writeFileSync(path.join(__dirname, 'bake', 'card.html'), html);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 720, height: 944 } }); await p.goto('file://' + path.join(__dirname, 'bake', 'card.html')); await p.waitForTimeout(600);
  const png = await p.screenshot(); fs.writeFileSync(path.join(__dirname, 'bake', 'card.png'), png);
  let q = .86, wp;
  for (; q > .3; q -= .06) { const u = await p.evaluate(async ([d, q]) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.createElement('canvas'); c.width = 720; c.height = 944; c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/webp', q); }, [png.toString('base64'), q]); wp = Buffer.from(u.split(',')[1], 'base64'); if (wp.length < 112 * 1024) break; }
  fs.writeFileSync('/home/user/nebula/cards/rattlerock-run.webp', wp); console.log('card', (wp.length / 1024) | 0, 'KB q', q.toFixed(2));
  await b.close();
})();
