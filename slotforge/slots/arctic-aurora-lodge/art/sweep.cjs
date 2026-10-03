const fs = require('fs'), path = require('path');
const cells = Array.from({ length: 25 }, (_, i) => `<div class="sc" data-r="${(i / 5) | 0}" data-c="${i % 5}"><i class="ice"></i><b class="val"></b><span class="xn"></span><svg class="pr" viewBox="0 0 128 128"><use href="#s12"/></svg></div>`).join('');
const html = `<!-- Aurora Sweep ice sheet (leo). 5x5 sheet, 520x520 at stage (468,194) over the board. Cells .sc[data-r][data-c]: frozen = intact; add .melt (ice thaws, shows .val text e.g. "12x"), .prism (shows the prism symbol; with .melt), .empty (melted, nothing), .x2/.x3/.x4/.x5 put the crossing multiplier chip in .xn. Bands: add <div class="band row r2"> / "col c1" / "dg1" (down-right) / "dg2" (up-right) into #sweepBands and remove after ~1.1 s; class .go starts its pass. #sweep.on shows the sheet. -->
<div id="sweep"><div class="swFrame"></div><div class="swGrid">${cells}</div><div id="sweepBands"></div></div>
`;
fs.writeFileSync(path.join(__dirname, '../sweep.html'), html);
