// node rig-test.cjs -> art/rig-test.html + rig-test.png (4 demo poses made only with transforms) + pixel-diff vs rrCartRide
const { chromium } = require('/home/user/nebula/node_modules/playwright'); const fs = require('fs'), path = require('path');
const B = require('./base.cjs');
const D = path.join(__dirname, '..');
const sym = fs.readFileSync(path.join(D, 'symbols.svg'), 'utf8'), rigcss = fs.readFileSync(path.join(__dirname, 'rig.css'), 'utf8'), F = B.FONT2;
const L = (cls, id, st = '') => `<svg class="rg ${cls}" style="${st}"><use href="#${id}"/></svg>`;
function rig({ head = 'Smile', arms = 'point', scarf = '', beam = false, glow = false, st = {} } = {}) {
  const S = (k, v) => st[k] ? ` style="${st[k]}"` : '';
  const sty = k => st[k] || '';
  const upper = (beam ? L('rg-beam', 'rrRigBeam', sty('beam')) : '') + L('rg-scarf' + scarf, 'rrRigScarf' + scarf, sty('scarf')) + (arms === 'up' ? L('rg-armFarUp', 'rrRigArmFarUp', sty('armFar')) : L('rg-armFar', 'rrRigArmFar', sty('armFar'))) + L('rg-torso', 'rrRigTorso', sty('torso')) + (glow ? L('rg-hatGlow', 'rrRigHatGlow', sty('glow')) : '') + L('rg-head' + head, 'rrRigHead' + head, sty('head')) + (arms === 'up' ? L('rg-armUpL', 'rrRigArmUpL', sty('arm')) : arms === 'point' ? L('rg-armPoint', 'rrRigArmPoint', sty('arm')) : '');
  return `<div class="rrRig" style="${sty('root')}">` + L('rg-shadow', 'rrRigShadow', sty('shadow')) + L('rg-wheelB', 'rrRigWheelB', sty('wheelB')) + L('rg-wheelF', 'rrRigWheelF', sty('wheelF')) + L('rg-body', 'rrRigBody', sty('body')) + L('rg-load', 'rrRigLoad', sty('load')) + `<div class="rg-upper" style="${sty('upper')}">${upper}</div>` + L('rg-rim', 'rrRigRim', sty('rim')) + L('rg-loadFront', 'rrRigLoadFront', sty('loadFront')) + (arms === 'grip' ? L('rg-armRim', 'rrRigArmRim', sty('arm')) : '') + L('rg-gloveRim', 'rrRigGloveRim', sty('glove')) + (st.extra || '') + `</div>`;
}
const poses = [
  ['1 ride bob', rig({ scarf: '2', beam: true, st: { root: 'transform:translateY(-4px)', wheelB: 'transform:rotate(30deg)', wheelF: 'transform:rotate(30deg)', load: 'transform:translateY(-2px)', upper: 'transform:rotate(1deg)' } })],
  ['2 lean forward', rig({ head: 'Determined', scarf: '3', beam: true, st: { upper: 'transform:rotate(8deg)', head: 'transform:rotate(-6deg)', arm: 'transform:rotate(-8deg)', root: 'transform:rotate(-2deg);transform-origin:50% 100%', wheelB: 'transform:rotate(80deg)', wheelF: 'transform:rotate(80deg)' } })],
  ['3 cheer', rig({ head: 'Cheer', arms: 'up', glow: false, st: { upper: 'transform:rotate(-3deg)', head: 'transform:translateY(-8px) rotate(-5deg)', arm: 'transform:rotate(-6deg)', armFar: 'transform:rotate(5deg)', load: 'transform:translateY(-6px) scale(1.03)', root: 'transform:translateY(-8px)', extra: L('', 'rrRigDust1', 'left:30px;top:340px;width:40px;height:40px;transform:scale(1.2);opacity:.8') + L('', 'rrRigDust2', 'left:60px;top:352px;width:30px;height:30px;opacity:.6') } })],
  ['4 crash tumble', rig({ head: 'Dizzy', arms: 'up', st: { root: 'transform:rotate(-24deg);transform-origin:105px 387px', wheelF: 'transform:translate(70px,-90px) rotate(220deg)', upper: 'transform:rotate(-12deg)', head: 'transform:rotate(14deg)', arm: 'transform:rotate(-30deg)', armFar: 'transform:rotate(26deg)', body: 'transform:rotate(-3deg)', load: 'transform:translate(10px,-24px) rotate(6deg)', extra: L('', 'rrRigDust1', 'left:50px;top:330px;width:60px;height:60px;') + L('', 'rrRigDust2', 'left:20px;top:300px;width:40px;height:40px;opacity:.7') + L('', 'rrRigSparkStreak', 'left:76px;top:372px;width:50px;height:40px') } })],
];
const html = `<!doctype html><meta charset=utf-8><style>@font-face{font-family:RRNum;src:url(data:font/woff2;base64,${F})}${rigcss}body{margin:0;background:#2a2438;font:14px sans-serif;color:#fff}.cell{display:inline-block;width:440px;height:430px;margin:6px;padding:10px;background:repeating-conic-gradient(#3a3350 0 25%,#2c2640 0 50%) 0 0/20px 20px;border-radius:10px;position:relative;vertical-align:top}.cell b{position:absolute;left:12px;top:8px}.cell .rrRig{margin:30px 0 0 20px}
.rrRig.live .rg-load{animation:bob .45s ease-in-out infinite alternate}.rrRig.live{animation:bob .45s ease-in-out infinite alternate}@keyframes bob{to{transform:translateY(-4px)}}
#ref,#asm{position:absolute;left:0;top:0;width:400px;height:390px}</style>
<svg width=0 height=0 style="position:absolute">${sym}</svg>
<div id="poses">${poses.map(p => `<div class="cell"><b>${p[0]}</b>${p[1]}</div>`).join('')}</div>
<div id="diffbox" style="position:relative;width:400px;height:390px;background:#000"><div id="asm">${rig({})}<svg style="position:absolute;left:0;top:0;width:400px;height:390px;overflow:visible" viewBox="-400 -530 800 780">${B.spark(-240, -130, 20)}${B.spark(290, -90, 16)}</svg></div></div>
<div id="refbox" style="position:relative;width:400px;height:390px;background:#000"><svg id="ref" style="overflow:visible"><use href="#rrCartRide"/></svg></div>`;
fs.writeFileSync(path.join(__dirname, 'rig-test.html'), html);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 520 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, 'rig-test.html')); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(__dirname, 'rig-test.png'), clip: { x: 0, y: 0, width: 1920, height: 470 } });
  const a = await p.locator('#diffbox').screenshot(), r = await p.locator('#refbox').screenshot();
  const n = await p.evaluate(async ([a, r]) => { const ld = async d => { const i = new Image(); i.src = 'data:image/png;base64,' + d; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; }; const A = await ld(a), Rr = await ld(r); let n = 0, tot = 0; for (let i = 0; i < A.length; i += 4) { const d = Math.abs(A[i] - Rr[i]) + Math.abs(A[i + 1] - Rr[i + 1]) + Math.abs(A[i + 2] - Rr[i + 2]); if (Rr[i] + Rr[i + 1] + Rr[i + 2] > 30) tot++; if (d > 40) n++; } return [n, tot]; }, [a.toString('base64'), r.toString('base64')]);
  console.log('pixel diff (differing / non-black):', n, 'errors', errs); fs.writeFileSync(path.join(__dirname, 'bake', 'diffA.png'), a); fs.writeFileSync(path.join(__dirname, 'bake', 'diffR.png'), r); await b.close();
})();
