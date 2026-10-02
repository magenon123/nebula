const {mk}=require('../lib.cjs');
module.exports=()=>{const s=mk(7);
 const bowl=s.shape('M10 66 Q8 108 64 118 Q120 108 118 66Z','#fbf1dc',{hi:'#ffffff',sh:'#cdbf9f'})
  +s.shape('M12 76 Q64 90 116 76 L115 86 Q64 100 13 86Z','#3a4a8c',{sw:2.8,sh:'#27346a'})
  +s.ink('M40 104 Q64 112 88 104',2.6,'#3a4a8c')
  +s.shape('M40 114 Q64 124 88 114 L86 123 Q64 128 42 123Z','#7a4a2e',{sw:3.2,sh:'#54301c'});
 const rim=s.ell(64,64,54,23,'#fbf1dc',{sw:4.2,sh:'#cdbf9f'});
 const water=s.ell(64,64,46,18,'#6ec1e8',{sw:3.4,sh:'#3a8fc2'})+s.ink('M30 68 Q44 72 58 68 M74 58 Q86 54 96 58',1.8,'#e6f6ff');
 // koi seen from above, swimming right
 const koi=s.shape('M104 62 Q103 54 92 51 Q72 48 52 55 Q42 59 34 62 L18 52 Q22 62 24 64 Q22 70 18 78 L34 68 Q44 71 54 73 Q76 76 94 70 Q104 68 104 62Z','#f0a032',{hi:'#ffd27a',sh:'#c46e18',sw:3.6})
  +s.shape('M70 51 Q84 52 92 58 Q86 68 70 70 Q60 62 70 51Z','#fbf1dc',{sw:0,sh:false})
  +s.shape('M46 56 Q58 54 66 58 Q60 66 50 66 Q42 62 46 56Z','#e8503a',{sw:0,sh:false})
  +s.ink('M104 62 Q103 54 92 51 Q72 48 52 55 Q42 59 34 62 L18 52 Q22 62 24 64 Q22 70 18 78 L34 68 Q44 71 54 73 Q76 76 94 70 Q104 68 104 62Z',3.4)
  +s.shape('M74 52 Q80 42 90 44 Q88 52 82 54Z','#ffe6b0',{sw:2.6,sh:'#f0b86a'})+s.shape('M72 71 Q78 82 88 80 Q86 73 82 70Z','#ffe6b0',{sw:2.6,sh:'#f0b86a'})
  +s.circ(95,57,2.4,'#1c2340',{sw:0,sh:false})+s.circ(95,67,2.4,'#1c2340',{sw:0,sh:false})
  +s.ink('M104 60 q6 -2 8 -6 M104 65 q6 2 8 6',1.8)
  +s.ink('M80 60 q3 2 6 0 M64 62 q3 2 6 0 M50 63 q3 2 6 0',1.6,'#c46e18');
 const kg=s.g('koi','0%{transform:none}8%{transform:translate(-2px,5px) scale(.92,.92)}28%{transform:translate(14px,-40px) rotate(-30deg) scale(1.22)}46%{transform:translate(34px,-58px) rotate(-130deg) scale(1.3)}62%{transform:translate(16px,-46px) rotate(-250deg) scale(1.24)}78%{transform:translate(2px,-14px) rotate(-340deg) scale(1.08)}88%{transform:translate(0,4px) rotate(-360deg) scale(.94)}100%{transform:none}',koi,{o:'50% 50%'});
 const drop=(x,y,k,c)=>s.g('dr'+k,`0%{opacity:0;transform:translate(0,0)}${c}%{opacity:0}${c+4}%{opacity:1;transform:translate(0,0)}${c+16}%{opacity:1;transform:translate(${(k%2?1:-1)*8}px,-22px)}${c+28}%{opacity:0;transform:translate(${(k%2?1:-1)*14}px,6px)}100%{opacity:0}`,
   s.shape(`M${x} ${y} Q${x+5} ${y-7} ${x} ${y-12} Q${x-5} ${y-7} ${x} ${y}Z`,'#bfe6ff',{sw:2.4,sh:'#6ec1e8'}),{o:'50% 100%'});
 const drops=drop(24,62,0,18)+drop(34,56,1,20)+drop(98,58,2,70)+drop(106,64,3,72);
 const ring=s.g('ring','0%{opacity:0;transform:scale(.4)}60%{opacity:0;transform:scale(.4)}74%{opacity:.9;transform:scale(.9)}100%{opacity:0;transform:scale(1.25)}',s.ink('M24 64 Q64 46 104 64 Q64 82 24 64Z',2.4,'#e6f6ff'),{o:'50% 50%'});
 const bowlG=s.g('bowl','0%{transform:none}30%{transform:rotate(-3deg)}46%{transform:rotate(3.4deg)}62%{transform:rotate(-2.4deg)}80%{transform:rotate(1.4deg)}100%{transform:none}',bowl+rim+water+ring+kg+drops,{o:'50% 100%'});
 return s.out(s.shadow(64,125,52,3.6)+bowlG);
};
