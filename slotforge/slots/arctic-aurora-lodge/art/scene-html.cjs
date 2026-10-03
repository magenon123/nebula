// node scene-html.cjs : assembles ../scene.html from the baked WebP files (scene bitmap + aurora curtains + cheap animated layers)
const fs = require('fs'), path = require('path'); const B = path.join(__dirname, 'bake');
const b64 = n => 'data:image/webp;base64,' + fs.readFileSync(path.join(B, n + '.webp')).toString('base64');
const R = (() => { let s = 99; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
let flakes = ''; for (let i = 0; i < 12; i++) { const x = Math.round(R() * 1600), d = (16 + R() * 14).toFixed(1), dl = (-R() * 26).toFixed(1), sz = (1.4 + R() * 1.6).toFixed(1); flakes += `<i class="fk" style="left:${x}px;width:${sz}px;height:${sz}px;animation-duration:${d}s;animation-delay:${dl}s"></i>`; }
const html = `<!-- Arctic Aurora Lodge scene (leo). 1600x900. The static world is ONE pre-baked WebP bitmap (mountains hill-shaded, lodge, lake, trees); only cheap layers animate: 3 aurora curtain bitmaps (transform/opacity), window flicker, chimney smoke, 12 snow flakes. Bonus look: add class "bonus" to #scene. -->
<div id="scene"><img class="bg" alt="" src="${b64('scene')}"><div class="aur"><img class="cu c3" alt="" src="${b64('cur3')}"><img class="cu c2" alt="" src="${b64('cur2')}"><img class="cu c1" alt="" src="${b64('cur1')}"></div>
<img class="trees" alt="" src="${b64('trees')}"><div class="bonusTint"></div>
<i class="wf w1"></i><i class="wf w2"></i><i class="wf w3"></i><i class="wf w4"></i>
<i class="sm s1"></i><i class="sm s2"></i><i class="sm s3"></i>
<div class="flakes">${flakes}</div></div>
`;
fs.writeFileSync(path.join(__dirname, '../scene.html'), html); console.log('scene.html', (html.length / 1024) | 0, 'KB');
