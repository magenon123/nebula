const {mk}=require('../lib.cjs');
module.exports=()=>{const s=mk(5);
 const G='#79a85a';
 const trivet=s.shape('M44 100 L106 100 L110 114 L40 114Z','#c18a55',{sw:3.6,sh:'#7a4a2e',hi:'#e8b982'})+s.ink('M60 100 L58 114 M90 100 L92 114',2,'#7a4a2e');
 const crest=(cx,cy)=>s.circ(cx,cy,10,'#fbf1dc',{sw:2.6,sh:'#e5d3ac'})+s.fill(`M${cx-1.5} ${cy+6} Q${cx-8} ${cy+1} ${cx-5} ${cy-6} Q${cx+1} ${cy-3} ${cx-1.5} ${cy+6}Z`,'#4f7d3a')+s.fill(`M${cx+1.5} ${cy+6} Q${cx+8} ${cy+1} ${cx+5} ${cy-6} Q${cx-1} ${cy-3} ${cx+1.5} ${cy+6}Z`,'#79a85a');
 const spout=s.g('spout','0%{transform:none}30%{transform:rotate(-6deg)}44%{transform:rotate(5deg)}58%{transform:rotate(-4deg)}72%{transform:rotate(3deg)}86%{transform:rotate(-1deg)}100%{transform:none}',
   s.shape('M48 78 Q34 76 30 62 L24 52 Q22 46 28 46 L32 48 Q40 62 54 62Z',G,{hi:'#b7d98f',sh:'#4f7d3a',sw:3.8})+s.ink('M26 48 l5 1',2),{o:'100% 100%'});
 const body=s.shape('M44 70 Q42 46 72 44 Q104 46 102 70 Q104 98 72 101 Q44 98 44 70Z',G,{hi:'#c3e39c',sh:'#4f7d3a'})
  +s.ink('M47 62 Q72 70 99 62 M46 80 Q72 90 100 80',2.8,'#2f5a28')+crest(73,72);
 const lid=s.g('lid','0%{transform:none}6%{transform:translateY(-4px) rotate(-7deg)}12%{transform:translateY(0) rotate(6deg)}18%{transform:translateY(-5px) rotate(-8deg)}24%{transform:translateY(0) rotate(7deg)}30%{transform:translateY(-4px) rotate(-5deg)}36%{transform:translateY(0) rotate(4deg)}42%{transform:translateY(-2px) rotate(-2deg)}50%{transform:none}100%{transform:none}',
   s.shape('M52 48 Q54 34 72 33 Q90 34 92 48 Q72 54 52 48Z','#5f9246',{hi:'#b7d98f',sh:'#3f6b34'})+s.circ(72,31,4.4,'#c18a55',{sw:3.2,sh:'#7a4a2e'})+s.ink('M60 41 Q72 45 84 41',2,'#2f5a28'),{o:'50% 100%'});
 const lug=s.circ(47,52,3.6,'#2c3a46',{sw:2.6,sh:false})+s.circ(98,52,3.6,'#2c3a46',{sw:2.6,sh:false});
 const handle=s.ln('M47 52 C40 -2 106 -2 98 52','#d6b574',6,{ow:3}) + s.ink('M44 30 l6 1 M96 30 l6 -1 M63 13 l1 6 M82 13 l-1 6',1.6,'#7a4a2e');
 const steam=s.g('steam','0%{opacity:0;transform:translateY(8px) scale(.6)}18%{opacity:0;transform:translateY(8px) scale(.6)}34%{opacity:1;transform:translateY(-2px) scale(1)}58%{opacity:1;transform:translateY(-12px) scale(1.15)}78%{opacity:0;transform:translateY(-22px) scale(1.3)}100%{opacity:0}',
   s.shape('M62 24 Q54 18 62 12 Q70 8 66 2 Q76 6 74 14 Q80 18 72 24 Q68 28 62 24Z','#fbf1dc',{sw:2.8,sh:'#cfd9e8',hi:'#ffffff'})+s.shape('M82 20 Q78 14 84 10 Q90 8 88 3 Q96 8 93 14 Q96 20 88 22Z','#fbf1dc',{sw:2.4,sh:'#cfd9e8'}),{o:'50% 100%'});
 const pot=s.g('pot','0%{transform:none}14%{transform:rotate(3deg)}28%{transform:rotate(-9deg)}70%{transform:rotate(-9deg)}86%{transform:rotate(1.4deg)}100%{transform:none}',
   handle+lug+spout+body+lid,{o:'88% 100%'});
 const stream=s.g('stream','0%{opacity:0;transform:scaleY(0)}30%{opacity:0;transform:scaleY(0)}36%{opacity:1;transform:scaleY(.05)}48%{opacity:1;transform:scaleY(1)}68%{opacity:1;transform:scaleY(1)}76%{opacity:1;transform:scaleY(1) translateY(10px) scaleY(.4)}82%{opacity:0}100%{opacity:0}',
   s.ln('M12 64 Q11 78 12 96','#a8d37a',3.4,{ow:2}),{o:'50% 0%'});
 const cup=s.shape('M2 88 L30 88 L27 112 Q16 117 5 112Z','#fbf1dc',{hi:'#ffffff',sh:'#cdbf9f'})+s.shape('M3 94 L29 94 L28 100 L4 100Z','#3a4a8c',{sw:2.2,sh:'#27346a'})
  +s.g('tea','0%{transform:none}50%{transform:none}52%{transform:none}',s.ell(16,88,14,4,'#bfd98a',{sw:3,sh:'#79a85a'}),{o:'50% 50%'});
 const cupFull=s.g('fill','0%{transform:none}62%{transform:none}76%{transform:scale(1.06,1.5) translateY(-1px)}100%{transform:none}',s.ell(16,88,11,2.6,'#6f9a3e',{sw:0,sh:false}),{o:'50% 50%'});
 return s.out(s.shadow(64,118,56,4.4)+trivet+pot+steam+cup+stream+cupFull);
};
