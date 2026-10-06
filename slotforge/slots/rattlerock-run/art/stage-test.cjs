// node stage-test.cjs [lv] [extra classes] -> bake/stage-lvN.png : the real fragments assembled like the shell does
const { chromium } = require('/home/user/nebula/node_modules/playwright'); const fs = require('fs'), path = require('path');
const D = path.join(__dirname, '..'); const rd = n => fs.readFileSync(path.join(D, n), 'utf8');
const lv = process.argv[2] || '1', cls = process.argv[3] || '';
const pk = (id, x, y, w, h) => `<svg class="rrs rrPick" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><use href="#${id}"/></svg>`;
const html = `<!doctype html><meta charset=utf-8><style>${rd('slot.css')}html,body{margin:0;background:#000}:root{--toon:RRNum}#stage{position:relative;width:1600px;height:900px;overflow:hidden}#stage>*{position:absolute}</style>
<svg width=0 height=0 style="position:absolute">${rd('symbols.svg')}</svg>
<div id="stage">${rd('scene.html').replace('id="scene" class="lv1"', `id="scene" class="lv${lv} ${cls}"`)}${rd('logo.html')}${rd('frame.html')}${rd('side.html')}${rd('character.html')}</div>
<script>
const g=document.getElementById('grid');
g.innerHTML=\`<svg class="rrs rrCart" style="left:150px;top:370px;width:400px;height:390px"><use href="#rr${lv=='2'?'CartShield':lv=='3'?'CartCheer':'CartRide'}"/></svg>\`+\`${pk('rrNugget', 610, 540, 100, 125)}${pk('rrGem2', 770, 450, 112, 140)}${pk('rrTnt', 940, 570, 120, 150)}${pk('rrHat', 1090, 500, 120, 150)}${pk('rrGem3', 1230, 440, 112, 140)}${pk('rrForkL', 1340, 570, 112, 140)}${pk('rrDoor', 1400, 330, 230, 380)}\`;
document.getElementById('hMult').style.setProperty('--p',.3);document.getElementById('hMultV').textContent='x7';document.getElementById('hLoadV').textContent='12.50';document.getElementById('hDepthV').textContent='120 m';document.getElementById('hDistV').textContent='36 m';document.getElementById('hl1').classList.add('on');document.getElementById('hl2').classList.add('on');document.getElementById('hShield').classList.add('on');document.getElementById('hShieldN').textContent='1';
</script>`;
fs.writeFileSync(path.join(__dirname, 'bake', 'stage.html'), html);
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + path.join(__dirname, 'bake', 'stage.html')); await p.waitForTimeout(1500); await p.screenshot({ path: path.join(__dirname, 'bake', `stage-lv${lv}${cls ? '-' + cls.replace(/ /g, '') : ''}.png`) }); console.log('errors', errs); await b.close(); })();
