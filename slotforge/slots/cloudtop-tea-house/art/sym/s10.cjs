const {mk}=require('../lib.cjs'); const tag=require('../tag.cjs');
module.exports=(o={})=>{const id=o.id??10; const s=mk(id);
 const R=o.red||['#b4402c','#7a2418','#e87a5a'], gold=o.gold||['#e9b43c','#b7801f','#fff0a0'];
 const crestC=o.crest||'#fbf1dc';
 const bodyD='M30 52 Q16 56 18 74 L20 98 Q64 112 108 98 L110 74 Q112 56 98 52Z';
 const body=s.shape(bodyD,R[0],{hi:R[2],sh:R[1]})
  +s.shape('M19 90 Q64 104 109 90 L108 99 Q64 112 20 99Z',gold[0],{sw:3,sh:gold[1],hi:gold[2]})
  +s.shape('M34 62 Q64 68 94 62 L95 86 Q64 94 33 86Z','#fbf1dc',{sw:3.2,sh:'#e0d0aa',hi:'#ffffff'})
  +s.circ(64,74,9.5,crestC==='#fbf1dc'?gold[0]:crestC,{sw:2.8,sh:gold[1],hi:gold[2]})
  +s.fill('M63 80 Q56 76 59 69 Q64 71 63 80Z','#4f7d3a')+s.fill('M65 80 Q72 76 69 69 Q64 71 65 80Z','#2f5a28');
 const lid=s.g('lid','0%{transform:none}8%{transform:translateY(3px) scale(1.04,.94)}24%{transform:translateY(-22px) rotate(-12deg)}40%{transform:translateY(-12px) rotate(7deg)}54%{transform:translateY(2px) rotate(-3deg) scale(1.03,.96)}68%{transform:translateY(-3px) rotate(1deg)}82%{transform:none}100%{transform:none}',
   s.shape('M28 46 L28 58 Q28 68 64 70 Q100 68 100 58 L100 46Z',R[0],{hi:R[2],sh:R[1]})
   +s.ink('M29 58 Q64 70 99 58',3,gold[0])
   +s.ell(64,45,36,10,R[1],{sw:4,sh:false})+s.ell(64,44,30,7.4,R[0],{sw:2.6,sh:false})
   +s.ink('M40 43 Q64 36 88 43',1.8,R[2])
   +s.circ(64,40,6,gold[0],{sw:3,sh:gold[1],hi:gold[2]}),{o:'50% 100%'});
 const clink=s.g('clink','0%{opacity:0}18%{opacity:0}26%{opacity:1;transform:scale(1)}42%{opacity:0;transform:scale(1.3)}100%{opacity:0}',
   s.ink('M10 24 L2 18 M16 14 L12 4 M112 24 L120 18 M106 14 L110 4',3.2,'#e9b43c'),{o:'50% 50%'});
 const card=s.g('card','0%{opacity:0;transform:translateY(24px) scale(.7)}18%{opacity:0;transform:translateY(24px) scale(.7)}34%{opacity:1;transform:translateY(-22px) scale(1.14) rotate(-5deg)}52%{opacity:1;transform:translateY(-18px) scale(1.08) rotate(3deg)}74%{opacity:1;transform:translateY(-14px) scale(1.1) rotate(-2deg)}88%{opacity:1;transform:translateY(10px) scale(.8)}100%{opacity:0;transform:translateY(24px) scale(.7)}',
   s.shape('M40 20 L88 20 L88 62 L40 62Z','#fbf1dc',{sw:3.6,hi:'#fff',sh:'#d9c9b0'})+s.circ(64,41,12,gold[0],{sw:3,sh:gold[1],hi:gold[2]})+s.ink('M58 41 H70 M64 35 V47',2.4,gold[1])
   +s.fill('M40 20 L88 20 L88 27 L40 27Z','#d9432e'),{o:'50% 100%'});
 const T=o.tag||'TIN';
 return s.out(s.shadow(64,119,44,4.4)+card+body+lid+clink+tag(T,64-(T.length>3?39:30),94,T.length>3?78:60,{inner:o.tagC||'#d9432e',fs:T.length>3?17:19,txt:o.tagT}));
};
