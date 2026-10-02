const {mk}=require('../lib.cjs'); const tag=require('../tag.cjs');
module.exports=()=>{const s=mk(15);
 const K='M64 2 Q92 16 108 42 Q88 62 64 84 Q40 62 20 42 Q36 16 64 2Z';
 const kite=s.shape(K,'#d9432e',{hi:'#ff8a6a',sh:'#8a2218',sw:4.6})
  +s.ink('M64 8 Q92 20 102 42 Q86 58 64 78 Q42 58 26 42 Q36 20 64 8Z',2.4,'#e9b43c')
  // dragon face
  +s.shape('M40 26 L30 8 L50 20Z M88 26 L98 8 L78 20Z','#e9b43c',{sw:3,sh:'#b7801f'})
  +s.shape('M42 40 Q42 22 64 22 Q86 22 86 40 Q86 56 64 60 Q42 56 42 40Z','#f0b83c',{sw:3.6,hi:'#fff0a0',sh:'#b7801f'})
  +s.ell(53,38,4.6,5.4,'#fbf1dc',{sw:2.4,sh:false})+s.circ(54,39,2.4,'#1c2340',{sw:0,sh:false})+s.ell(75,38,4.6,5.4,'#fbf1dc',{sw:2.4,sh:false})+s.circ(74,39,2.4,'#1c2340',{sw:0,sh:false})
  +s.ink('M46 31 Q53 28 58 33 M82 31 Q75 28 70 33',2.6)
  +s.shape('M54 46 Q64 42 74 46 Q76 54 64 56 Q52 54 54 46Z','#fbf1dc',{sw:2.6,sh:'#e0d0aa'})+s.circ(60,48,1.4,'#1c2340',{sw:0,sh:false})+s.circ(68,48,1.4,'#1c2340',{sw:0,sh:false})
  +s.ink('M54 52 Q64 58 74 52',2)+s.ink('M42 46 Q30 46 24 54 M86 46 Q98 46 104 54',2.6,'#fbf1dc')
  +s.shape('M60 56 L64 64 L68 56Z','#fbf1dc',{sw:2,sh:false});
 const seg=(x,y,c,r)=>s.circ(x,y,r,c,{sw:3,sh:'#8a2218',hi:'#ff8a6a'});
 const tail=s.g('tail','0%{transform:none}20%{transform:skewX(10deg) rotate(8deg)}40%{transform:skewX(-14deg) rotate(-12deg)}60%{transform:skewX(12deg) rotate(9deg)}80%{transform:skewX(-5deg)}100%{transform:none}',
   s.ln('M64 84 Q44 92 50 104 Q58 114 40 120','#e9b43c',5,{ow:3.4})+seg(48,98,'#d9432e',5)+seg(53,110,'#d9432e',4.4)+seg(42,119,'#d9432e',4),{o:'50% 0%'});
 const k=s.g('kite','0%{transform:none}10%{transform:translateY(5px) scale(1.04,.93)}26%{transform:translate(6px,-16px) rotate(14deg) scale(1.1)}46%{transform:translate(0,-26px) rotate(-12deg) scale(1.16)}66%{transform:translate(-4px,-14px) rotate(8deg) scale(1.08)}86%{transform:rotate(-2deg)}100%{transform:none}',kite,{o:'50% 60%'});
 return s.out(s.shadow(94,124,26,3)+`<g transform="translate(2 0) scale(.95)">`+tail+k+`</g>`+tag('GRAND',66,98,58,{inner:'#7a3ca6',fs:15}));
};
