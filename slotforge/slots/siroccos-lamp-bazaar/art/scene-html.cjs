// node scene-html.cjs -> ../scene.html (baked bitmaps as data URIs + cheap animated layers) and scene.css
const fs = require('fs'), path = require('path'); const { rnd, seed, f } = require('./lib.cjs'); const B = path.join(__dirname, 'bake');
const u = n => 'data:image/webp;base64,' + fs.readFileSync(path.join(B, n + '.webp')).toString('base64');
seed(23);
let motes = '';
for (let i = 0; i < 18; i++) { const x = 560 + rnd() * 900, y = 180 + rnd() * 520, s = 1.6 + rnd() * 2.4, d = 14 + rnd() * 16, dl = -rnd() * d; motes += `<i style="left:${f(x)}px;top:${f(y)}px;width:${f(s)}px;height:${f(s)}px;animation-duration:${f(d)}s;animation-delay:${f(dl)}s"></i>`; }
const html = `<!-- Siroccos Lamp Bazaar scene (leo). 1600x900. Static world = two pre-baked WebP bitmaps (golden hour .day, night .night for the bonus), light shafts, one hanging lamp. Only cheap layers animate (opacity / transform): ray shimmer, lamp sway, 18 dust motes. Bonus look: add class "bonus" to #scene (1.6 s crossfade to the night bazaar, the lamp ignites). -->
<div id="scene"><img class="bg day" alt="" src="${u('day')}"><img class="bg night" alt="" src="${u('night')}">
<img class="rays rd" alt="" src="${u('rays-day')}"><img class="rays rn" alt="" src="${u('rays-night')}">
<div class="lampW"><img class="lamp" alt="" src="${u('lamp')}"><img class="lamp lit" alt="" src="${u('lamp-lit')}"></div><i class="halo"></i>
<div class="motes">${motes}</div></div>
`;
fs.writeFileSync(path.join(__dirname, '../scene.html'), html);
const css = `/* ---------- scene: 2 baked bitmaps + 2 ray layers + a swaying lamp + 18 motes ---------- */
#scene{left:0;top:0;width:1600px;height:900px;overflow:hidden;background:#12082a}
#scene .bg{position:absolute;left:0;top:0;width:1600px;height:900px;display:block}
#scene .night,#scene .rn,#scene .lamp.lit{opacity:0;transition:opacity 1.6s ease}
#scene.bonus .night,#scene.bonus .rn,#scene.bonus .lamp.lit{opacity:1}
#scene.bonus .rd{opacity:0}
#scene .rays{position:absolute;left:0;top:0;width:1600px;height:900px;display:block;pointer-events:none;will-change:opacity}
#scene .rd{transition:opacity 1.6s;animation:rayA 9s ease-in-out infinite alternate}
#scene .rn{animation:rayB 11s ease-in-out infinite alternate}
@keyframes rayA{from{opacity:.3}to{opacity:.62}}
@keyframes rayB{from{opacity:.25}to{opacity:.55}}

#scene .lampW{position:absolute;left:225px;top:-2px;width:88px;height:413px;transform-origin:50% 0;will-change:transform;animation:lampSw 7s ease-in-out infinite alternate}
#scene .lamp{position:absolute;left:0;top:0;width:88px;height:413px;display:block}
@keyframes lampSw{from{transform:rotate(-1.4deg)}to{transform:rotate(1.6deg)}}
#scene .halo{position:absolute;left:176px;top:278px;width:186px;height:186px;border-radius:50%;background:radial-gradient(circle,rgba(255,226,150,.85),rgba(255,170,60,.32) 42%,rgba(255,150,40,0) 70%);opacity:0;transition:opacity 1.6s;will-change:opacity;pointer-events:none}
#scene.bonus .halo{opacity:1;animation:haloF 3.1s ease-in-out infinite alternate}
@keyframes haloF{from{opacity:.75}to{opacity:1}}
#scene .motes{position:absolute;inset:0;pointer-events:none}
#scene .motes i{position:absolute;border-radius:50%;background:#ffe3a0;opacity:0;animation:moteF linear infinite;will-change:transform,opacity}
#scene.bonus .motes i{background:#cfe0ff}
@keyframes moteF{0%{opacity:0;transform:translate(0,0)}15%{opacity:.7}85%{opacity:.5}100%{opacity:0;transform:translate(-46px,-70px)}}
`;
fs.writeFileSync(path.join(__dirname, 'scene.css'), css);
console.log('scene.html', (html.length / 1024) | 0, 'KB');
