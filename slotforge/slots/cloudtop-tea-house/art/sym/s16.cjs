/* s16 FS SCATTER: a festival taiko drum (red barrel, gold studs, laced rope) with the bold text FS on the drum skin. Not a tin, not a lantern, not a kite. */
const {mk}=require('../lib.cjs');
module.exports=()=>{const s=mk(16);
 const GOLD='#e9b43c',GOLDD='#b7801f',RED='#c8382a',REDD='#7d1f16',CREAM='#fbf1dc';
 // stand + barrel
 const stand=s.shape('M30 110 L40 92 L48 92 L42 112Z M98 110 L88 92 L80 92 L86 112Z','#7a4a2e',{sw:3.4,sh:'#54301c'});
 const barrel=s.shape('M16 52 Q10 78 24 102 Q64 114 104 102 Q118 78 112 52Z',RED,{sw:4.4,hi:'#ff8a6a',sh:REDD})
  +s.ink('M22 62 L34 98 L46 62 L58 100 L70 62 L82 100 L94 62 L104 96',2.6,'#f2d890')            // rope lacing zig-zag
  +s.shape('M17 94 Q64 110 111 94 L108 104 Q64 118 20 104Z',GOLD,{sw:3,sh:GOLDD,hi:'#fff0a0'});
 // the drum skin (front face)
 const rim=s.circ(64,48,42,GOLD,{sw:4.4,sh:GOLDD,hi:'#fff0a0'});
 const studs=[...Array(14)].map((_,i)=>{const a=i/14*Math.PI*2;return s.circ(64+Math.cos(a)*36.5,48+Math.sin(a)*36.5,2.6,'#fff6c8',{sw:1.8,sh:false});}).join('');
 const skin=s.circ(64,48,31,CREAM,{sw:3.6,hi:'#fff',sh:'#e2cfa6'})+s.circ(64,48,26,'none',{sw:2,sh:false}).replace('fill="none"','fill="none" opacity=".5"')
  +s.ink('M64 22 A26 26 0 0 1 90 48',2.4,'#e9b43c','opacity=".7"');
 const face=s.g('face','0%{transform:none}10%{transform:scale(.9,.9)}22%{transform:scale(1.1)}34%{transform:scale(.94)}46%{transform:scale(1.07)}60%{transform:scale(.97)}78%{transform:scale(1.02)}100%{transform:none}',rim+studs+skin,{o:'50% 50%'});
 // FS text (outlined)
 const txt=`<text x="64" y="60" text-anchor="middle" font-family="'Lilita One','Luckiest Guy','Impact','Arial Black',sans-serif" font-size="35" letter-spacing="1" fill="${RED}" stroke="#1c2340" stroke-width="6.5" paint-order="stroke" stroke-linejoin="round">FS</text>`;
 const label=s.g('label','0%{transform:none}10%{transform:scale(.92)}22%{transform:scale(1.14) rotate(-3deg)}34%{transform:scale(.96)}46%{transform:scale(1.1) rotate(2deg)}60%{transform:scale(.98)}100%{transform:none}',txt,{o:'50% 55%'});
 // sticks
 const stick=(x1,y1,x2,y2)=>s.ln(`M${x1} ${y1} L${x2} ${y2}`,'#d6b574',5.4,{ow:3.2})+s.circ(x2,y2,4,'#fbf1dc',{sw:2.6,sh:false});
 const sL=s.g('stickL','0%{transform:rotate(0)}10%{transform:rotate(-26deg)}20%{transform:rotate(14deg)}30%{transform:rotate(-4deg)}40%{transform:none}52%{transform:rotate(-26deg)}62%{transform:rotate(14deg)}72%{transform:none}100%{transform:none}',stick(8,8,34,30),{o:'6% 8%'});
 const sR=s.g('stickR','0%{transform:none}22%{transform:none}32%{transform:rotate(26deg)}42%{transform:rotate(-14deg)}52%{transform:rotate(4deg)}62%{transform:none}74%{transform:rotate(26deg)}84%{transform:rotate(-14deg)}100%{transform:none}',stick(120,8,94,30),{o:'94% 8%'});
 const waves=s.g('wave','0%{opacity:0;transform:scale(.8)}12%{opacity:1;transform:scale(1)}40%{opacity:0;transform:scale(1.3)}52%{opacity:1;transform:scale(1)}80%{opacity:0;transform:scale(1.3)}100%{opacity:0}',
   s.ink('M4 34 Q-2 52 4 70 M124 34 Q130 52 124 70 M10 28 Q2 52 10 76 M118 28 Q126 52 118 76',3.2,GOLD),{o:'50% 50%'});
 return s.out(s.shadow(64,119,48,4.4)+stand+barrel+waves+face+label+sL+sR);
};
