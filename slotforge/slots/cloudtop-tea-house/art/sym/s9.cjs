const {mk}=require('../lib.cjs');
module.exports=()=>{const s=mk(9);
 const C='#8b4fa6', body='M64 40 Q30 40 20 70 Q14 100 34 112 Q64 122 94 112 Q114 100 108 70 Q98 40 64 40Z';
 const motif=(cx,cy,r)=>s.shape(`M${cx} ${cy-r} L${cx+r} ${cy} L${cx} ${cy+r} L${cx-r} ${cy}Z`,'#fbf1dc',{sw:2.4,sh:'#d9c9b0'})+s.circ(cx,cy,r*.32,'#e9b43c',{sw:2,sh:'#b7801f'});
 const cloth=(clipId)=>s.shape(body,C,{hi:'#c79be0',sh:'#5e3278'})
  +`<clipPath id="${clipId}"><path d="${body}"/></clipPath><g clip-path="url(#${clipId})">`
  +motif(34,84,8)+motif(96,86,8)+motif(48,106,6)+motif(82,108,6)+motif(64,52,6)
  +s.ink('M24 58 Q42 70 64 66 Q86 70 104 58',3,'#e9b43c')+s.ink('M16 96 Q64 120 112 96',2.6,'#5e3278')
  +'</g>'+s.ink(body,4.2);
 const q=s.ln('M50 70 Q50 56 64 56 Q78 56 78 68 Q78 76 66 80 Q62 83 62 88','#fbf1dc',8,{ow:4.2})+s.circ(62,100,5.2,'#fbf1dc',{sw:3.2,sh:'#d9c9b0'});
 const leftHalf=s.g('cl','0%{transform:none}38%{transform:none}52%{transform:translateX(-4px) rotate(-6deg)}66%{transform:translateX(-18px) rotate(-26deg)}84%{transform:translateX(-6px) rotate(-6deg)}94%{transform:translateX(1px) rotate(1deg)}100%{transform:none}',
   '<clipPath id="hl9"><rect x="0" y="0" width="64.4" height="128"/></clipPath><g clip-path="url(#hl9)">'+cloth('bl9')+'</g>',{o:'100% 100%'});
 const rightHalf=s.g('cr','0%{transform:none}38%{transform:none}52%{transform:translateX(4px) rotate(6deg)}66%{transform:translateX(18px) rotate(26deg)}84%{transform:translateX(6px) rotate(6deg)}94%{transform:translateX(-1px) rotate(-1deg)}100%{transform:none}',
   '<clipPath id="hr9"><rect x="63.6" y="0" width="70" height="128"/></clipPath><g clip-path="url(#hr9)">'+cloth('br9')+'</g>',{o:'0% 100%'});
 // what is inside: a bright star burst
 const burst=s.g('burst','0%{opacity:0;transform:scale(.2)}44%{opacity:0;transform:scale(.2)}60%{opacity:1;transform:scale(1.2)}76%{opacity:1;transform:scale(1)}88%{opacity:0;transform:scale(1.5)}100%{opacity:0;transform:scale(.2)}',
   s.shape('M64 52 L70 72 L90 76 L72 86 L76 106 L64 92 L52 106 L56 86 L38 76 L58 72Z','#ffe36a',{sw:3,sh:'#f0a032',hi:'#fffbd0'}),{o:'50% 50%'});
 const bodyG=s.g('puff','0%{transform:none}14%{transform:scale(1.04,.95)}30%{transform:scale(.97,1.05)}48%{transform:scale(1.02,.98)}60%{transform:scale(1.1,1.12) translateY(-4px)}78%{transform:scale(.96,.95)}90%{transform:scale(1.02,1.02)}100%{transform:none}',
   burst+leftHalf+rightHalf+q,{o:'50% 100%'});
 // knot with two ears sticking up
 const ear=(sg,k)=>s.g('ear'+k,`0%{transform:none}10%{transform:rotate(${-8*sg}deg)}22%{transform:rotate(${10*sg}deg)}34%{transform:rotate(${-6*sg}deg)}46%{transform:rotate(${32*sg}deg) scale(1.1)}60%{transform:rotate(${58*sg}deg) scale(1.05)}82%{transform:rotate(${14*sg}deg)}100%{transform:none}`,
   s.shape(`M${64+sg*4} 46 Q${64+sg*14} 24 ${64+sg*26} 14 Q${64+sg*34} 18 ${64+sg*30} 28 Q${64+sg*22} 38 ${64+sg*10} 50Z`,C,{sw:3.8,hi:'#c79be0',sh:'#5e3278'})
   +s.ink(`M${64+sg*8} 44 Q${64+sg*18} 32 ${64+sg*26} 22`,1.8,'#e9b43c'),{o:sg<0?'100% 100%':'0% 100%'});
 const knot=s.g('knot','0%{transform:none}10%{transform:rotate(-7deg) scale(1.04)}22%{transform:rotate(8deg) scale(1.06)}34%{transform:rotate(-5deg)}46%{transform:scale(.7) rotate(0)}58%{transform:scale(.6)}82%{transform:scale(1.08)}100%{transform:none}',
   s.shape('M52 52 Q50 38 64 36 Q78 38 76 52 Q70 58 64 56 Q58 58 52 52Z',C,{sw:4,hi:'#c79be0',sh:'#5e3278'})+s.ink('M56 44 Q64 50 72 44',2,'#e9b43c'),{o:'50% 100%'});
 return s.out(s.shadow(64,121,48,4.4)+ear(-1,0)+ear(1,1)+bodyG+knot);
};
