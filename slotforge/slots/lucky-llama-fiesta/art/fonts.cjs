const fs = require('fs'), path = require('path');
const b = f => fs.readFileSync(path.join(__dirname, 'fonts', f)).toString('base64');
module.exports = () => `@font-face{font-family:LlLuck;src:url(data:font/ttf;base64,${b('LuckiestGuy.ttf')}) format('truetype')}@font-face{font-family:LlLil;src:url(data:font/ttf;base64,${b('LilitaOne.ttf')}) format('truetype')}`;
