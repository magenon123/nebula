const {mk}=require('../lib.cjs'); const tag=require('../tag.cjs');
module.exports=()=>{const s=mk(11);
 const B=['#e0a93a','#9a6a14','#fff0a0'];
 const body=s.shape('M26 70 Q24 40 62 38 Q104 40 102 70 Q104 96 64 98 Q24 96 26 70Z',B[0],{hi:B[2],sh:B[1]})
  +s.ink('M28 62 Q64 72 100 62 M28 82 Q64 92 100 82',2.8,'#8a5a14')
  +s.circ(64,72,10,'#fbf1dc',{sw:2.8,sh:'#e5d3ac'})+s.fill('M63 78 Q56 74 59 67 Q64 69 63 78Z','#4f7d3a')+s.fill('M65 78 Q72 74 69 67 Q64 69 65 78Z','#2f5a28');
 const spout=s.g('spout','0%{transform:none}30%{transform:rotate(-5deg)}46%{transform:rotate(4deg)}62%{transform:rotate(-3deg)}100%{transform:none}',
   s.shape('M30 78 Q16 74 12 58 L8 50 Q6 44 12 44 L16 46 Q24 62 36 62Z',B[0],{hi:B[2],sh:B[1],sw:3.8}),{o:'100% 100%'});
 const handle=s.ln('M30 50 C26 2 98 2 96 50','#7a4a2e',6,{ow:3});
 const lid=s.g('lid','0%{transform:none}8%{transform:translateY(-6px) rotate(-6deg)}16%{transform:translateY(1px) rotate(4deg)}26%{transform:translateY(-9px) rotate(-8deg)}36%{transform:translateY(1px) rotate(5deg)}50%{transform:translateY(-12px) rotate(-10deg)}62%{transform:translateY(2px) rotate(3deg) scale(1.02,.96)}78%{transform:translateY(-2px)}100%{transform:none}',
   s.shape('M40 46 Q42 32 63 31 Q86 32 88 46 Q64 52 40 46Z',B[0],{hi:B[2],sh:B[1]})+s.circ(64,29,4.6,'#7a4a2e',{sw:3,sh:'#54301c'}),{o:'50% 100%'});
 const steam=(x,k)=>s.g('st'+k,`0%{opacity:0;transform:translate(0,8px) scale(.5)}${14+k*8}%{opacity:0}${34+k*8}%{opacity:1;transform:translate(0,-4px) scale(1)}${60+k*6}%{opacity:1;transform:translate(${(k-1)*-10}px,-16px) scale(1.2)}${84}%{opacity:0;transform:translate(${(k-1)*-18}px,-24px) scale(.6)}100%{opacity:0}`,
   s.shape(`M${x-8} 24 Q${x-14} 16 ${x-6} 10 Q${x} 4 ${x+6} 10 Q${x+14} 16 ${x+8} 24 Q${x} 28 ${x-8} 24Z`,'#fbf1dc',{sw:2.6,sh:'#cfd9e8'}),{o:'50% 100%'});
 const kettle=s.g('k','0%{transform:none}10%{transform:scale(1.03,.96)}22%{transform:translateX(-2px) rotate(-2deg)}34%{transform:translateX(2px) rotate(2deg)}46%{transform:translateX(-2px) rotate(-2deg) scale(1.04,1.04)}58%{transform:translateX(2px) rotate(2deg)}70%{transform:scale(1.05,.95)}86%{transform:scale(.99,1.01)}100%{transform:none}',
   handle+spout+body+lid,{o:'50% 100%'});
 const trivet=s.shape('M34 98 L96 98 L100 108 L30 108Z','#7a4a2e',{sw:3.4,sh:'#54301c',hi:'#c18a55'});
 return s.out(s.shadow(64,119,48,4.4)+trivet+kettle+steam(48,0)+steam(76,1)+steam(62,2)+tag('COLLECT',64-39,96,78,{inner:'#2f8a7a',fs:14}));
};
