// node build.cjs : builds ALL fragments in ../ (symbols.svg, scene.html, logo.html, frame.html, character.html, side.html, info.html, slot.css [keeps text after /* KAI */])
const fs = require('fs'), path = require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const OUT = path.join(__dirname, '..'), B = path.join(__dirname, 'bake'); fs.mkdirSync(B, { recursive: true });
const sy = require('./syms.cjs'), ui = require('./ui.cjs'), sc = require('./scene.cjs'), fr = require('./frame.cjs'), logo = require('./logo.cjs'), fonts = require('./fonts.cjs');
const b64 = buf => buf.toString('base64');
async function bake(b, name, svg, defs, w, h, scale, omit, q, vb) {
  const html = `<style>${fonts()}html,body{margin:0;background:transparent}</style><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb || `0 0 ${w} ${h}`}"><defs>${defs.join('')}</defs>${svg}</svg>`;
  const pg = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await pg.setContent(html); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
  const png = await pg.screenshot({ omitBackground: omit }); await pg.close();
  const q2 = await b.newPage(); await q2.setContent('<canvas id=c></canvas>');
  const url = await q2.evaluate(async ([d, qq]) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.getElementById('c'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/webp', qq); }, [b64(png), q]);
  await q2.close(); fs.writeFileSync(path.join(B, name + '.png'), png);
  const buf = Buffer.from(url.split(',')[1], 'base64'); fs.writeFileSync(path.join(B, name + '.webp'), buf); console.log(name, (buf.length / 1024) | 0, 'KB'); return url;
}
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  // ---- symbols.svg
  const A = sy.build(), U = ui.build();
  let blur = ''; if (fs.existsSync(path.join(__dirname, 'blur.json'))) { const j = JSON.parse(fs.readFileSync(path.join(__dirname, 'blur.json'))); for (const id of Object.keys(j)) blur += `<symbol id="sb${id.slice(1)}" viewBox="0 0 128 128"><image width="128" height="128" href="${j[id]}"/></symbol>\n`; }
  fs.writeFileSync(path.join(OUT, 'symbols.svg'), `<!-- Lucky Llama Fiesta symbols (leo). s0..s13 5x3 reel symbols (tile inside, viewBox 128), sbN spin-blur bitmaps, ll* UI/splash art. See ART-NOTES.md. -->\n${A.defs.join('')}${U.defs.join('')}\n${A.svg}${blur}${U.svg}`);
  // ---- scene
  const day = sc.bg(false), dusk = sc.bg(true), str = sc.strands(), cd = sc.counter(false), cn = sc.counter(true);
  const VB = '-900 -300 3400 1500';
  const uDay = await bake(b, 'day', day.svg, day.defs, 3400, 1500, 1, false, .74, VB);
  const uDusk = await bake(b, 'dusk', dusk.svg, dusk.defs, 3400, 1500, 1, false, .72, VB);
  const uStr = await bake(b, 'banners', str.svg, str.defs, 3400, 460, 1, true, .85, '-900 0 3400 460');
  const uCd = await bake(b, 'counter', cd.svg, cd.defs, 3400, 484, 1, true, .8, '-900 716 3400 484');
  const uCn = await bake(b, 'counter-dusk', cn.svg, cn.defs, 3400, 484, 1, true, .78, '-900 716 3400 484');
  const uBdp = await bake(b, 'bdp', day.svg, day.defs, 3400, 1500, .056, false, .6, VB);
  fs.writeFileSync(path.join(OUT, 'scene.html'), `<!-- Lucky Llama Fiesta scene (leo). WIDE world 3400x1500 baked at stage offset (-900,-300): the 1600x900 stage sits in the centre; houses, church towers, trees, fountain, lamp posts and cobbles continue left, right, above and below. .day / .dusk (fades in with #scene.bonus), .banners (3400x460 papel picado, ONE swaying layer), .ctr / .ctrn = wooden counter 3400x484 at (-900,716) that the shell HUD bars sit on (portrait: hidden). img.bdp = small backdrop copy. -->\n<div id="scene"><img class="bdp" alt="" src="${uBdp}"><img class="bg day" alt="" src="${uDay}"><img class="bg dusk" alt="" src="${uDusk}"><img class="banners" alt="" src="${uStr}"><img class="ctr" alt="" src="${uCd}"><img class="ctr ctrn" alt="" src="${uCn}"></div>\n`);
  // ---- frame
  const F = fr(); const uF = await bake(b, 'frame', F.svg, F.defs, 870, 528, 1.5, true, .88);
  fs.writeFileSync(path.join(OUT, 'frame.html'), `<!-- Lucky Llama Fiesta board frame (leo). Frame art = baked WebP 870x528 at stage (365,152). BOARD AREA = #frame at stage (425,190) 750x450: 5 cols x 3 rows of 150 px cells (cell margin 2 => 146 px tile + 4 gap), right edge x=1175, bottom y=640. -->\n<img id="frameArt" alt="" src="${uF}">\n<div id="frame"><div id="grid"></div><div id="fxl"></div></div>\n`);
  await b.close();
  fs.writeFileSync(path.join(OUT, 'logo.html'), logo());
  fs.writeFileSync(path.join(OUT, 'character.html'), '<!-- No side character in Lucky Llama Fiesta (owner decision). Empty element so the shell finds #char. -->\n<div id="char"></div>\n');
  fs.writeFileSync(path.join(OUT, 'side.html'), require('./side.cjs')());
  fs.writeFileSync(path.join(OUT, 'info.html'), require('./info.cjs')());
  // ---- slot.css (keep KAI part)
  const css = require('./css.cjs')(A.winvars);
  const f = path.join(OUT, 'slot.css'); let kai = ''; if (fs.existsSync(f)) { const o = fs.readFileSync(f, 'utf8'); const i = o.indexOf('/* KAI */'); if (i >= 0) kai = o.slice(i + 9); }
  fs.writeFileSync(f, css + kai);
  console.log('done');
})();
