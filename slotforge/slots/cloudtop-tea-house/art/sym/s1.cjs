const {mk}=require('../lib.cjs');
module.exports=()=>{const s=mk(1);
 const tri='M64 14 Q71 12 77 21 L111 88 Q119 104 103 107 L25 107 Q9 104 17 88 L51 21 Q57 12 64 14Z';
 const leaf=s.shape('M6 112 Q40 100 64 104 Q92 100 122 112 Q92 124 64 123 Q36 124 6 112Z','#79a85a',{hi:'#b7d98f',sw:4})
  +s.ink('M16 112 Q64 108 112 112',2.2,'#3f6b34');
 const rice=s.shape(tri,'#fbf1dc',{hi:'#ffffff',sh:'#cdbf9f'});
 const nori=s.shape('M24 82 Q64 92 104 82 L111 98 Q113 107 103 107 L25 107 Q15 107 17 98Z','#2c3a46',{sw:3.6,sh:'#161d2c',hi:'#5d7a86'})
  +s.ink('M26 92 Q64 101 102 92',1.6,'#7f9aa8');
 const grains=s.ink('M44 46 l5 -2 M80 44 l5 2 M56 64 l5 1 M74 62 l5 -1 M38 72 l4 -2 M88 72 l4 2 M66 28 l3 3',2.6,'#b9a97f');
 const plum=s.g('plum','0%{transform:none}30%{transform:none}38%{transform:scale(1.18,.86)}60%{transform:scale(.94,1.1)}100%{transform:none}',
   s.circ(64,50,10.5,'#c8324a',{sh:'#7d1a34',hi:'#ff9aa8',sw:3.6})+s.fill('M60 40 q4 -4 8 0 q-4 3 -8 0Z','#3f6b34')+s.ink('M64 40 v3',2),{o:'50% 50%',d:0});
 // eyelid lowers over the plum = the plum blinks
 const lid=s.g('lid','0%{transform:scaleY(0)}40%{transform:scaleY(0)}48%{transform:scaleY(1)}58%{transform:scaleY(1)}68%{transform:scaleY(0)}78%{transform:scaleY(1)}86%{transform:scaleY(1)}96%{transform:scaleY(0)}100%{transform:scaleY(0)}',
   s.fill('M52.5 50 a11.5 11.5 0 0 1 23 0 Z','#fbf1dc')+s.ink('M52.5 50 Q64 55 75.5 50',2.8)+s.ink('M56 53 l-1 3 M64 55 v3 M72 53 l1 3',1.8),{o:'50% 0%',d:0});
 const lidBox='<rect x="52" y="38" width="24" height="24" fill="none"/>';
 const body=s.g('squash','0%{transform:none}8%{transform:scale(1.03,.97)}22%{transform:scale(1.2,.74)}34%{transform:scale(1.26,.7)}44%{transform:scale(.88,1.2) translateY(-8px)}56%{transform:scale(1.06,.92)}68%{transform:scale(.98,1.04)}82%{transform:scale(1.01,.99)}100%{transform:none}',
   rice+grains+nori+plum+lid,{o:'50% 100%'});
 // tanuki paws squeeze from both sides
 const paw=(sx)=>{const t=sx<0?'':'scale(-1 1) translate(-128 0)';
  return `<g transform="${t}">`+s.shape('M-6 68 Q-6 52 8 52 L22 54 Q34 56 34 70 Q34 84 20 86 L6 86 Q-6 84 -6 68Z','#6a4a36',{hi:'#9a7458',sw:3.8})
   +s.shape('M22 60 q10 -2 12 8 q-2 10 -12 8Z','#d2b08a',{sw:0,sh:false})+s.ink('M22 60 q10 -2 12 8 q-2 10 -12 8',2.4)
   +s.ink('M26 62 v3 M26 69 v3 M26 75 v2',1.6,'#6a4a36')+'</g>';};
 const pawL=s.g('pawL','0%{transform:translateX(-46px);opacity:0}6%{opacity:1}16%{transform:translateX(-14px)}34%{transform:translateX(8px)}46%{transform:translateX(-4px)}58%{transform:translateX(-50px);opacity:1}64%{opacity:0}100%{transform:translateX(-50px);opacity:0}',paw(-1),{o:'50% 50%'});
 const pawR=s.g('pawR','0%{transform:translateX(46px);opacity:0}6%{opacity:1}16%{transform:translateX(14px)}34%{transform:translateX(-8px)}46%{transform:translateX(4px)}58%{transform:translateX(50px);opacity:1}64%{opacity:0}100%{transform:translateX(50px);opacity:0}',paw(1),{o:'50% 50%'});
 return s.out(s.shadow(64,121,50,5)+leaf+body+pawL+pawR);
};
