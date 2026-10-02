#!/usr/bin/env node
/* quick symbol preview: node art/prev.cjs 15 16 [--bg #f6e3b0] [--win] -> PNG in the scratchpad (large + 128 + 64 px) */
const fs=require('fs'),path=require('path');
const { chromium } = require('/home/user/nebula/node_modules/playwright');
const ids=process.argv.slice(2).filter(a=>/^\d+$/.test(a)); const bgI=process.argv.indexOf('--bg'); const bg=bgI>0?process.argv[bgI+1]:'#f6e3b0'; const win=process.argv.includes('--win');
const OUT='/tmp/claude-0/-home-user-nebula/b90d455d-4f99-5816-a375-e82680f90bd5/scratchpad/leo/sym-'+ids.join('_')+'.png';
(async()=>{
 const defs=fs.readFileSync('/home/user/nebula/slotforge/shell/shell-defs.svg','utf8');
 let syms='';for(const id of ids){delete require.cache[require.resolve('./sym/s'+id+'.cjs')];syms+=require('./sym/s'+id+'.cjs')();}
 const row=id=>`<div style="display:flex;align-items:center;gap:18px;margin:6px"><svg width="400" height="400" style="background:${bg};border-radius:20px;--win:${win?'running':'paused'}"><use href="#s${id}"/></svg><svg width="128" height="128" style="background:${bg};border-radius:12px;--win:paused"><use href="#s${id}"/></svg><svg width="64" height="64" style="background:${bg};border-radius:8px"><use href="#s${id}"/></svg></div>`;
 const vars=Object.entries(require('./lib.cjs').registry||{}).flatMap(([k,v])=>v).join(';');
 const html=`<body style="margin:0;background:#2a2230"><style>:root{${win?vars:''}}</style><svg width="0" height="0" style="position:absolute">${defs}${syms}</svg>${ids.map(row).join('')}`;
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',headless:true});const p=await b.newPage({viewport:{width:660,height:430*ids.length}});
 await p.setContent(html);await p.waitForTimeout(300);await p.screenshot({path:OUT});await b.close();console.log(OUT);})();
