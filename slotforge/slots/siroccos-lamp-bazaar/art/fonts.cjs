// node fonts.cjs -> fonts.css (embedded woff2: Cinzel 700/900 latin subset, Cinzel Decorative 700/900 latin)
const fs = require('fs'), path = require('path'); const F = n => fs.readFileSync(path.join(__dirname, 'fonts', n)).toString('base64');
const ff = (fam, w, file) => `@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${F(file)}) format('woff2')}`;
fs.writeFileSync(path.join(__dirname, 'fonts.css'), [ff('Cinzel', 700, 'Cinzel700.sub.woff2'), ff('Cinzel', 900, 'Cinzel900.sub.woff2'), ff('Cinzel Decorative', 700, 'cinzel-decorative-latin-700-normal.woff2'), ff('Cinzel Decorative', 900, 'cinzel-decorative-latin-900-normal.woff2')].join('\n'));
console.log('fonts.css', fs.statSync(path.join(__dirname, 'fonts.css')).size >> 10, 'KB');
