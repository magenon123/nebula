// node fox-bake.cjs : bakes the Silver Fox bitmaps to bake/fox/*.webp (read by syms-b.cjs s6)
const path = require('path'); const { bake } = require('./charlib.cjs'); const X = require('./fox.cjs');
(async () => { await bake([{ name: 'head', ...X.head() }, { name: 'earL', ...X.ear(-1) }, { name: 'earR', ...X.ear(1) }, { name: 'tail', ...X.tail() }], path.join(__dirname, 'bake/fox')); })();
