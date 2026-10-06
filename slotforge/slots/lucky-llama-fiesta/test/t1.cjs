const L=require('./lib.cjs');const {lucho}=require('./lucho.cjs');
const body=lucho();
require('fs').writeFileSync('t1.html',`<html><body style="margin:0;background:#8a5a30"><svg width="1600" height="900" viewBox="0 0 1600 900"><defs>${L.defs.join('')}</defs><g transform="translate(100 20) scale(1.8)">${body}</g></svg></body></html>`);
