const fs = require('fs'), path = require('path'); const w = fs.readFileSync(path.join(__dirname, 'bake/frame.webp')).toString('base64');
fs.writeFileSync(path.join(__dirname, '../frame.html'), `<!-- Board frame (leo). Frame art = baked WebP (carved sandstone, lapis zellige band, gold bevel, jewels), 600x600 at stage (480,144). BOARD AREA (5 cols x 5 rows of 104 px cells) = 520x520 at stage (520,184) -> right edge x=1040, bottom y=704. The art draws a translucent night-glass backing in the board area; the cells (plates) sit on top. -->
<img id="frameArt" alt="" src="data:image/webp;base64,${w}">
<div id="frame"><div id="grid"></div><div id="fxl"></div>
 <svg id="frameFx" viewBox="0 0 520 520" stroke-linecap="round"></svg></div>
`);
console.log('frame.html', fs.statSync(path.join(__dirname, '../frame.html')).size >> 10, 'KB');
