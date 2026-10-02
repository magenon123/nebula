const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'sym');
const files=fs.readdirSync(dir).filter(f=>/^s\d+\.cjs$/.test(f)).sort((a,b)=>parseInt(a.slice(1))-parseInt(b.slice(1)));
let out=' <!-- Koji\'s Cloudtop Tea House symbols (leo). Indigo ink outline, flat fills, flat shade lower right, no textures. Each symbol animates itself in .a-* groups gated by --win/--delay/--spd. -->\n';
for(const f of files){ out+='   '+require(path.join(dir,f))()+'\n'; }
const dst=process.argv[2]||'/home/user/nebula/slotforge/slots/cloudtop-tea-house/symbols.svg';
fs.writeFileSync(dst,out);console.log('wrote',dst,files.length,'symbols',out.length,'bytes');
