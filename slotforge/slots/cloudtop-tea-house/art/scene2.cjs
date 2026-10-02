const fs=require('fs');
const {P,N,E,SH,INK,cloud}=require('./scene.cjs');
let o=fs.readFileSync('scene_a.txt','utf8');
// ---------- kites on anchored strings ----------
function tail(x,y,len,cols,dir=1){let d=`M${x} ${y}`;const n=4;let bows='';for(let i=1;i<=n;i++){const yy=y+len*i/n,xx=x+Math.sin(i*1.7)*10*dir;d+=` T${xx} ${yy}`;bows+=P(`M${xx} ${yy} l-7 -4 v8Z M${xx} ${yy} l7 -4 v8Z`,cols[i%cols.length],2)}
 return N(d,INK,2.6)+bows;}
function kite(cx,cy,s,type,c,ax,ay,cls,tl=60){
  let body='';
  if(type==='d'){const w=s*.78,h=s*1.05;const d=`M${cx} ${cy-h} L${cx+w} ${cy} L${cx} ${cy+h} L${cx-w} ${cy}Z`;
   body=P(d,c[0],3.4)+P(`M${cx} ${cy-h} L${cx+w} ${cy} L${cx} ${cy}Z`,c[1],0)+P(`M${cx} ${cy} L${cx} ${cy+h} L${cx-w} ${cy}Z`,c[1],0)+`<path d="${d}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>`+N(`M${cx} ${cy-h} V${cy+h} M${cx-w} ${cy} H${cx+w}`,INK,2.2,.7)+E(cx,cy,s*.16,s*.16,c[2],2.2);}
  else {const w=s*.8,h=s;const d=`M${cx} ${cy-h} L${cx+w} ${cy-h*.45} L${cx+w} ${cy+h*.45} L${cx} ${cy+h} L${cx-w} ${cy+h*.45} L${cx-w} ${cy-h*.45}Z`;
   body=P(d,c[0],3.4)+P(`M${cx-w} ${cy-h*.1} H${cx+w} V${cy+h*.45} L${cx} ${cy+h} L${cx-w} ${cy+h*.45}Z`,c[1],0)+`<path d="${d}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>`+N(`M${cx} ${cy-h} V${cy+h} M${cx-w} ${cy-h*.45} L${cx+w} ${cy+h*.45} M${cx+w} ${cy-h*.45} L${cx-w} ${cy+h*.45}`,INK,2,.6)+E(cx,cy,s*.2,s*.2,c[2],2.2);}
  const by=cy+(type==='d'?s*1.05:s);
  const str=N(`M${ax} ${ay} Q${(ax+cx)/2+10} ${(ay+by)/2+24} ${cx} ${by}`,INK,2.2);
  return `<g class="kite ${cls}" style="transform-origin:${ax}px ${ay}px">${str}${tail(cx,by,tl,[c[2],c[0],c[1]],cx<800?1:-1)}${body}</g>`;
}
o+=`<g id="sKites" filter="url(#roughC)">`
 +kite(292,236,34,'d',['#d9432e','#fbf1dc','#e9b43c'],332,418,'k1',56)
 +kite(258,120,30,'h',['#3a4a8c','#9fd3ee','#fbf1dc'],332,418,'k2',50)
 +kite(1306,116,34,'d',['#f59db8','#fbf1dc','#d9432e'],1584,300,'k3',58)
 +kite(1416,64,30,'h',['#79a85a','#fbf1dc','#e9b43c'],1584,300,'k4',50)
 +kite(1500,196,28,'d',['#e9b43c','#d9432e','#fbf1dc'],1584,300,'k5',48)
 +`</g>`;
// ---------- rock ledge across the whole stage ----------
o+=`<g id="sLedge" filter="url(#roughC)">
 ${P('M-10 804 L1610 804 L1610 900 L-10 900Z','#8d7f98',3.6)}
 <path d="M-10 804 L1610 804 L1610 822 Q1000 834 700 826 Q300 836 -10 824Z" fill="#a89aa8"/>
 <path d="M-10 850 Q300 842 700 852 Q1100 860 1610 846 L1610 900 L-10 900Z" fill="#6e6482" opacity=".55"/>
 ${N('M60 822 L74 850 L58 880 M200 812 L214 846 L196 884 M420 818 L432 856 M640 816 L652 852 L636 890 M930 816 L944 850 M1210 818 L1224 856 L1208 892 M1470 814 L1484 850',INK,3,.5)}
 ${N('M0 836 Q150 828 330 840 M520 842 Q700 832 900 846 M1060 840 Q1300 830 1600 842',INK,2.4,.35)}
 ${P('M-10 738 L1610 738 L1610 804 L-10 804Z','#d9ccb0',3.6)}
 <path d="M-10 738 L1610 738 L1610 748 L-10 748Z" fill="#efe4cc"/>
 ${N('M30 752 Q70 746 120 752 M150 778 Q200 772 250 780 M20 790 Q60 786 100 792 M1300 752 Q1360 746 1420 754 M1470 780 Q1520 774 1580 782 M1330 794 Q1380 790 1420 796',INK,2.4,.4)}
 ${N('M180 740 l-6 24 M262 742 l8 28 M1290 742 l-8 24 M1510 744 l6 28',INK,2.2,.35)}
 <path d="M-10 804 L1610 804" stroke="#6e5e72" stroke-width="7" opacity=".45"/>
 ${[40,120,210,300,1280,1390,1500,1580].map((x,i)=>`<path d="M${x-14} 804 q4 -12 10 -4 q4 -14 10 -2 q6 -8 8 6Z" fill="#79a85a" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`).join('')}
</g>
<g filter="url(#roughL)" class="cl s3">${cloud(60,884,260,40,'#fff1e2','#f2c0ae')}${cloud(520,896,300,38,'#fff1e2','#f2c0ae')}${cloud(1000,890,300,40,'#fff1e2','#f2c0ae')}${cloud(1500,884,300,44,'#fff1e2','#f2c0ae')}</g>`;
// ---------- shop ----------
const tile=(x0,x1,y,rows)=>'';
let shop=`<g id="sShop" filter="url(#roughC)">`;
// wall + plinth
shop+=P('M376 190 H1224 V722 H376Z','#f4e6c8',3.6)+P('M376 700 H1224 V724 H376Z','#a89a98',3)+`<path d="M1060 190 H1224 V722 H1060Z" fill="#c9a98a" opacity=".28"/>`
 +`<rect x="376" y="190" width="848" height="38" fill="url(#ctEaveSh)"/>`;
// pillars
const pillar=(x)=>P(`M${x} 150 H${x+26} V726 H${x}Z`,'#7a4a2e',4)+P(`M${x+16} 150 H${x+26} V726 H${x+16}Z`,'#54301c',0)+N(`M${x+5} 170 V700`,'#c18a55',2.4,.7)+P(`M${x-6} 722 H${x+32} V738 H${x-6}Z`,'#b6a8a0',3);
shop+=pillar(350)+pillar(1224);
// shoji panels (left and right of the tansu wall)
const shoji=(x,y,w,h)=>{let g=P(`M${x} ${y} h${w} v${h} h${-w}Z`,'#fff0c8',4)+`<rect x="${x+4}" y="${y+4}" width="${w-8}" height="${h-8}" fill="#fff6dc" opacity=".6"/>`;
  const cols=3,rows=7; for(let i=1;i<cols;i++)g+=N(`M${x+w*i/cols} ${y} v${h}`,'#7a4a2e',3);for(let j=1;j<rows;j++)g+=N(`M${x} ${y+h*j/rows} h${w}`,'#7a4a2e',2.6);
  g+=P(`M${x} ${y} h${w} v${h} h${-w}Z`,'none',5)+`<path d="M${x+w-10} ${y} h10 v${h} h-10Z" fill="#c9a060" opacity=".25"/>`;return g;};
shop+=shoji(384,236,62,440)+shoji(1154,236,62,440);
// beam under the eave + rafter ends + gutter
shop+=P('M340 148 H1260 V190 H340Z','#54301c',4)+N('M346 160 H1254',"#8a5532",3,.9)
 +[...Array(24)].map((_,i)=>P(`M${356+i*38} 180 h14 v10 h-14Z`,'#c18a55',2.2)).join('');
// roof (tiles)
const roof=`M296 156 Q330 150 360 140 L416 56 Q420 46 432 46 H1168 Q1180 46 1184 56 L1240 140 Q1270 150 1304 156 Q1290 166 1264 168 H336 Q310 166 296 156Z`;
shop+=P(roof,'#7f9a8a',4.4);
shop+=`<clipPath id="ctRoofC"><path d="${roof}"/></clipPath><g clip-path="url(#ctRoofC)">`
 +`<path d="M1000 40 H1320 V170 H1000Z" fill="#46606a" opacity=".42"/>`
 +[0,1,2,3,4,5,6].map(r=>{const y=62+r*15;let d='';for(let x=270;x<1340;x+=26){d+=`M${x+((r%2)*13)} ${y} q13 14 26 0 `;}return N(d,INK,2.2,.4)}).join('')
 +`<path d="M420 50 L330 160" stroke="${INK}" stroke-width="3" opacity=".4"/><path d="M1180 50 L1270 160" stroke="${INK}" stroke-width="3" opacity=".4"/>`
 +`<path d="M300 60 H1000" stroke="#b4cdb8" stroke-width="3" opacity=".0"/></g>`;
shop+=P('M420 40 H1180 Q1188 40 1188 48 V58 H412 V48 Q412 40 420 40Z','#54301c',4)+N('M424 46 H1176','#c18a55',2.6,.8)
 +E(414,48,13,13,'#a8a0a0',3.6)+E(1186,48,13,13,'#a8a0a0',3.6)+N('M408 44 q6 -4 12 0 M1180 44 q6 -4 12 0',INK,2)
 +P('M318 150 Q290 152 292 168 Q330 172 342 160Z','#54301c',3)+P('M1282 150 Q1310 152 1308 168 Q1270 172 1258 160Z','#54301c',3);
// deck + fascia
shop+=P('M318 722 H1282 L1304 774 H296Z','#d7a874',4)
 +N('M310 742 H1290 M304 758 H1296',INK,2,.3)+[...Array(20)].map((_,i)=>N(`M${330+i*48} 722 L${312+i*50} 774`,INK,1.8,.22)).join('')
 +P('M296 774 H1304 V792 H296Z','#7a4a2e',4)+`<path d="M296 774 H1304 V780 H296Z" fill="#c18a55" opacity=".6"/>`
 +[...Array(9)].map((_,i)=>P(`M${330+i*105} 792 h22 v14 h-22Z`,'#5a3520',3)).join('');
shop+=`</g>`;
o+=shop;
// ---------- props (each has a contact shadow to the right: the sun is upper left) ----------
let pr=`<g id="sProps" filter="url(#roughC)">`;
// kite post, left (back row, base y 744)
const post=(x,top,base,side)=>
  SH(x+16,base+2,22,5,.28)+P(`M${x-6} ${base} V${top} H${x+6} V${base}Z`,'#8a5532',3.6)+P(`M${x+2} ${base} V${top} H${x+6} V${base}Z`,'#54301c',0)+N(`M${x-3} ${top+8} V${base-10}`,'#c18a55',2,.7)
  +P(`M${x-10} ${top-2} H${x+10} L${x+6} ${top-10} H${x-6}Z`,'#54301c',3)+E(x,top+4,5,5,'none',3)
  +P(`M${x-14} ${top+60} H${x+14} V${top+68} H${x-14}Z`,'#c18a55',3)
  +E(x+side*18,base-6,13,5,'#d6b574',3)+N(`M${x+side*8} ${base-8} q10 5 20 0 M${x+side*10} ${base-4} q8 4 16 0`,INK,1.8,.7)+N(`M${x} ${base-12} Q${x+side*8} ${base-8} ${x+side*14} ${base-8}`,'#d6b574',3.2);
pr+=post(332,418,744,-1)+post(1584,300,790,-1);
// crates (back row)
const crate=(x,y,w,h)=>P(`M${x} ${y} h${w} v${h} h${-w}Z`,'#c18a55',3.4)+`<path d="M${x+w*.62} ${y} h${w*.38} v${h} h${-w*.38}Z" fill="#7a4a2e" opacity=".35"/>`+N(`M${x+2} ${y+h*.34} h${w-4} M${x+2} ${y+h*.68} h${w-4}`,INK,2,.55)+E(x+w*.4,y+h*.5,5.5,5.5,'#fbf1dc',2)+N(`M${x+w*.4-2} ${y+h*.5+3} q-2 -5 2 -6 q4 1 3 6`,'#4f7d3a',1.8)+P(`M${x} ${y} l5 0 v${h} h-5Z`,'#e8c08a',0);
pr+=SH(50,746,48,6,.28)+crate(6,718,38,28)+crate(46,718,38,28)+crate(22,690,40,28);
// drying rack (back row)
pr+=SH(260,746,52,5,.25)+N('M214 744 V664 M308 744 V664',INK,9)+N('M214 744 V664 M308 744 V664','#d6b574',5)
 +[694,722].map(y=>N(`M212 ${y} H310`,INK,8)+N(`M212 ${y} H310`,'#d6b574',4)+P(`M218 ${y-8} H306 V${y-1} H218Z`,'#b08a5a',2.6)
   +P(`M222 ${y-8} Q230 ${y-18} 240 ${y-8} Q252 ${y-22} 262 ${y-8} Q274 ${y-18} 284 ${y-8} Q294 ${y-16} 302 ${y-8}Z`,'#79a85a',2.4)).join('')
 +N('M214 668 H308',INK,6)+N('M214 668 H308','#d6b574',3)+N('M232 668 v14 M262 668 v10 M292 668 v14',"#4f7d3a",3);
// stone lantern (front row)
pr+=`<g transform="translate(38 0)">`+SH(122,792,58,8,.3)
 +P('M40 790 L102 790 L98 770 L44 770Z','#cfc0aa',3.6)+P('M56 770 L86 770 L82 728 L60 728Z','#d9cbb4',3.6)
 +P('M36 728 L106 728 L98 712 L44 712Z','#cfc0aa',3.6)
 +P('M50 712 H92 V662 H50Z','#d9cbb4',3.8)+P('M58 674 H84 V704 H58Z','#ffe6a0',3)+N('M71 674 V704 M58 689 H84',INK,2.4)
 +`<path d="M80 712 H92 V662 H80Z M84 770 L98 770 L94 790 L84 790Z M76 728 L82 728 L86 770 L80 770Z" fill="#6a5a7a" opacity=".28"/>`
 +P('M26 664 Q71 650 116 664 L100 638 Q71 618 42 638Z','#bfb09a',3.8)+`<path d="M92 646 Q106 652 116 664 L100 638Z" fill="#6a5a7a" opacity=".3"/>`
 +P('M64 620 Q71 596 78 620Z','#e8c46a',3)
 +`<path d="M44 784 q4 -10 10 -3 q4 -9 10 0 q4 -6 8 4Z M52 712 q6 -8 12 0" fill="#79a85a" stroke="${INK}" stroke-width="2.2"/>`;
pr+=`</g>`;
// bonsai on a stand (front row)
pr+=`<g transform="translate(16 0)">`+SH(200,792,50,6,.28)
 +N('M138 752 V790 M200 752 V790',INK,9)+N('M138 752 V790 M200 752 V790','#a86a3c',5)
 +P('M126 744 H212 V756 H126Z','#c18a55',3.6)+P('M164 756 H212 V762 H164Z','#7a4a2e',0)
 +P('M146 744 L150 722 H190 L194 744Z','#3a4a8c',3.6)+`<path d="M180 722 H190 L194 744 H176Z" fill="#1c2340" opacity=".25"/>`+N('M152 728 H188',"#7a8ad0",2)
 +N('M168 722 Q150 700 170 684 Q190 668 172 646','#4a3040',9)+N('M168 722 Q150 700 170 684 Q190 668 172 646','#7a5040',5)
 +[[142,690,30,15],[190,676,34,16],[160,652,36,16],[196,644,26,13]].map(([x,y,rx,ry])=>E(x,y,rx,ry,'#5f9246',3.6)+`<path d="M${x-rx*.2} ${y+ry*.5} q${rx*.6} ${ry*.6} ${rx*1.1} -${ry*.1} q0 ${ry*.5} -${rx*.9} ${ry*.7}Z" fill="#3f6b34" opacity=".5"/>`).join('')
 +N('M130 686 l5 4 M180 672 l6 3 M148 648 l5 4',"#b7d98f",2,.9);
pr+=`</g>`;
// bench with a folded blanket (front row)
pr+=`<g transform="translate(2 0) scale(.94 1)" style="transform-origin:240px 790px">`+SH(300,792,56,6,.27)
 +N('M246 762 V790 M326 762 V790',INK,9)+N('M246 762 V790 M326 762 V790','#a86a3c',5)
 +P('M236 750 H340 V764 H236Z','#c18a55',3.6)+`<path d="M300 750 H340 V764 H300Z" fill="#7a4a2e" opacity=".3"/>`
 +P('M248 726 Q292 718 330 726 V750 H248Z','#3a4a8c',3.6)+`<path d="M300 724 Q316 724 330 726 V750 H300Z" fill="#1c2340" opacity=".28"/>`
 +N('M252 734 Q292 727 328 734 M252 742 Q292 735 328 742','#fbf1dc',2.4,.9)+N('M248 738 v10 M330 738 v10',INK,2,.6)+`</g>`;
pr+=`</g>`;
// brazier + kettle on the deck (steam is CSS)
pr+=`<g id="sBrazier" filter="url(#roughC)">`+SH(432,776,34,5,.3)
 +N('M392 760 L384 776 M430 760 L438 776 M411 764 V778',INK,8)+N('M392 760 L384 776 M430 760 L438 776 M411 764 V778','#54301c',4)
 +P('M384 744 Q386 764 411 766 Q436 764 438 744Z','#46506a',3.6)+`<path d="M420 746 Q436 748 438 744 Q436 764 411 766 Q422 760 420 746Z" fill="#1c2340" opacity=".3"/>`
 +E(411,744,27,6,'#ff7a3a',3.2)+E(411,744,18,3.6,'#ffd45a',0)
 +P('M392 742 Q390 720 412 716 Q434 720 432 742Q412 748 392 742Z','#3a4260',3.6)+`<path d="M424 720 Q434 724 432 742 Q424 745 420 744Z" fill="#1c2340" opacity=".3"/>`
 +P('M393 734 Q380 730 376 716 L382 714 Q388 724 396 726Z','#3a4260',3.2)+N('M396 722 Q411 702 428 722',INK,6)+N('M396 722 Q411 702 428 722','#c18a55',3)
 +P('M402 718 Q411 710 420 718Z','#2f3652',3)+E(411,708,3.4,3.4,'#c18a55',2.4)
 +`<g class="steam"><path d="M378 708 Q372 696 380 686 Q388 676 382 664" fill="none" stroke="#fffaf0" stroke-width="7" stroke-linecap="round" opacity=".9"/><path d="M384 704 Q394 692 386 680" fill="none" stroke="#fffaf0" stroke-width="5" stroke-linecap="round" opacity=".6"/></g>`
 +`</g>`;
// pine on the right of the shop (base y 790)
pr+=`<g id="sPine" filter="url(#roughC)">`+SH(1340,794,60,7,.28)
 +P('M1306 792 Q1304 760 1312 730 Q1318 690 1304 660 Q1292 626 1318 596 L1334 604 Q1318 630 1332 662 Q1342 700 1334 732 Q1332 762 1340 792Z','#6a4a3a',4)+`<path d="M1326 604 Q1342 640 1336 700 Q1340 750 1340 792 L1328 792 Q1326 740 1326 700Z" fill="#3a2a30" opacity=".35"/>`
 +N('M1316 730 l10 -8 M1312 690 l12 6 M1318 640 l8 -4',INK,2,.5)
 +[[1296,580,52,22],[1352,548,48,20],[1316,520,46,19],[1286,636,34,14],[1352,616,32,13]].map(([x,y,rx,ry])=>P(`M${x-rx} ${y+4} Q${x-rx*.7} ${y-ry} ${x} ${y-ry*1.2} Q${x+rx*.7} ${y-ry} ${x+rx} ${y+4} Q${x+rx*.5} ${y+ry*.8} ${x} ${y+ry*.6} Q${x-rx*.5} ${y+ry*.8} ${x-rx} ${y+4}Z`,'#4f7d3a',3.8)+`<path d="M${x} ${y+ry*.6} Q${x+rx*.5} ${y+ry*.8} ${x+rx} ${y+4} Q${x+rx*.7} ${y-2} ${x+rx*.2} ${y}Z" fill="#2f5a28" opacity=".55"/>`+N(`M${x-rx*.7} ${y-ry*.3} q${rx*.3} -${ry*.5} ${rx*.6} -${ry*.3}`,"#b7d98f",2.4,.9)).join('')
 +`</g>`;
o+=pr;
// ---------- eave lanterns (unlit by day; glow at dusk) ----------
let lan='<g id="sLanterns" filter="url(#roughC)">';
[342,392,436,1164,1208,1258].forEach((x,i)=>{lan+=`<g class="el e${i}">`+N(`M${x} 168 V176`,INK,2.4)+`<ellipse class="glow" cx="${x}" cy="196" rx="34" ry="34" fill="url(#ctLampG)" opacity="0"/>`
 +P(`M${x-11} 178 Q${x-15} 196 ${x-9} 212 H${x+9} Q${x+15} 196 ${x+11} 178Z`,'#f4e6c8',3)+`<path class="lit" d="M${x-9} 180 Q${x-12} 196 ${x-7} 210 H${x+7} Q${x+12} 196 ${x+9} 180Z" fill="#ffc050" opacity="0"/>`+N(`M${x-13} 188 Q${x} 192 ${x+13} 188 M${x-12} 200 Q${x} 204 ${x+12} 200`,'#d9432e',2.2)
 +P(`M${x-10} 176 H${x+10} V181 H${x-10}Z M${x-9} 211 H${x+9} V216 H${x-9}Z`,'#1c2340',0)+'</g>';});
lan+='</g>';
o+=lan;
o+=`<rect id="sDusk" width="1600" height="900" fill="url(#ctDusk)" opacity="0" style="mix-blend-mode:multiply"/>`;
o+=`</svg>`;
fs.writeFileSync('/home/user/nebula/slotforge/slots/cloudtop-tea-house/scene.html',o);console.log('scene',o.length);
