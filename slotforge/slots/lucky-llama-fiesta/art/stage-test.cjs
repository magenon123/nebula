// node stage-test.cjs [mode] -> art/stage-<mode>.png  (mode: base | link | parade | dusk)
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const O = path.join(__dirname, '..'); const rd = f => fs.readFileSync(path.join(O, f), 'utf8');
const mode = process.argv[2] || 'base';
const board = [['s5', 's5', 's10', 's8', 's2'], ['s4', 's12', 's9', 's1', 's7'], ['s3', 's6', 's11', 's12_minor', 's0']];
const cells = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { let id = board[r][c]; const hit = mode === 'base' && r === 0 && c < 3; cells.push(`<div class="cell${hit ? ' hit' : ''}"><svg class="g" viewBox="0 0 128 128"><use href="#${mode === 'blur' && c > 2 ? 'sb' + id.slice(1) : id}"/></svg></div>`); }
const html = `<style>html,body{margin:0;background:#111}#stage{position:relative;width:1600px;height:900px;overflow:hidden}#stage>*{position:absolute}${rd('slot.css')}
#bar{left:150px;top:782px;width:1110px;height:92px;background:#5a2810;border:5px solid #2a1209;box-sizing:border-box;color:#fff;font:26px LlLuck;padding:24px}#sp{left:1198px;top:752px;width:140px;height:140px;border-radius:50%;background:#1cb8bd;border:7px solid #fff}#msg{left:540px;top:728px;width:520px;height:42px;color:#fff;font:25px LlLuck;text-align:center}</style>
<svg width="0" height="0" style="position:absolute"><defs>${rd('symbols.svg')}</defs></svg>
<div id="stage">${rd('scene.html')}${rd('logo.html')}${rd('frame.html')}${rd('character.html')}${rd('side.html')}<div id="msg">LINE 1 - 3x SKULL - $2.50</div><div id="bar">BALANCE $1,000.00 &nbsp; WIN $2.50 &nbsp; BET $1.00</div><div id="sp"></div></div>
<script>document.getElementById('grid').innerHTML=${JSON.stringify(cells.join(''))};
const $=i=>document.getElementById(i);$('ladder').classList.add('m3');
if('${mode}'==='base'){$('coLine').classList.add('on');$('coLineT').textContent='LINE 1 - 3x SKULL - $2.50';}
if('${mode}'==='link'){document.getElementById('logo').style.display='none';for(const k of ['jpMini','jpMinor','jpMajor','jpGrand'])$(k).classList.add('on');$('jpGrand').classList.add('lit');$('jpMinor').classList.add('lit');document.querySelectorAll('.jv').forEach((e,i)=>e.textContent=['2000x','250x','50x','20x'][i]);$('lkRespins').classList.add('on');$('lkRespinsN').textContent='3';$('lkTotal').classList.add('on');$('lkTotalV').textContent='$128.50';}
if('${mode}'==='parade'){$('pdSpins').classList.add('on');$('pdSpinsN').textContent='7';$('pdCallMult').classList.add('on');$('pdCallMultN').textContent='x3';$('pdCollector').classList.add('on');document.querySelectorAll('.cell')[2].classList.add('sticky');document.getElementById('scene').classList.add('bonus');}
if('${mode}'==='dusk'){document.getElementById('scene').classList.add('bonus');}
</script>`;
(async () => {
  fs.writeFileSync(path.join(__dirname, 'stage.html'), html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await pg.goto('file://' + path.join(__dirname, 'stage.html')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(2000);
  await pg.screenshot({ path: path.join(__dirname, 'stage-' + mode + '.png') }); await b.close();
})();
