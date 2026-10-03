const fs = require('fs'), path = require('path'); const b64 = fs.readFileSync(path.join(__dirname, 'bake/frame.webp')).toString('base64');
const html = `<!-- Board frame (leo). Frame art = baked WebP (timber beams, iron gussets, ice bevel, corner lanterns), 700x596 at stage (430,148). BOARD AREA (6 cols x 5 rows of 104 px cells) = 624x520 at stage (468,184) -> right edge x=1092, bottom y=704. -->
<img id="frameArt" alt="" src="data:image/webp;base64,${b64}">
<div id="frame"><div id="grid"></div><div id="fxl"></div>
 <svg id="frameFx" viewBox="0 0 624 520" stroke-linecap="round"></svg></div>
`;
fs.writeFileSync(path.join(__dirname, '../frame.html'), html);
