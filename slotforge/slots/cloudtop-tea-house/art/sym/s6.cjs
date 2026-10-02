const {mk}=require('../lib.cjs');
module.exports=()=>{const s=mk(6);
 const W='#fbf1dc',Wd='#cdbf9f';
 const cushion=s.shape('M14 108 Q64 98 114 108 L118 120 Q64 130 10 120Z','#d9432e',{sw:3.8,hi:'#ff8a6a',sh:'#9c2a1e'})
  +s.shape('M8 122 L14 120 L12 128Z M120 122 L114 120 L116 128Z','#e9b43c',{sw:2,sh:false})+s.ink('M30 112 Q64 105 98 112',2.2,'#e9b43c');
 const body=s.shape('M36 112 Q26 86 38 66 Q64 56 90 66 Q102 86 92 112 Q64 120 36 112Z',W,{hi:'#ffffff',sh:Wd})
  +s.shape('M80 76 Q96 84 92 104 Q86 100 80 96Z','#f0a032',{sw:2.4,sh:'#c27820'}) // orange patch on the flank
  +s.ink('M58 98 Q64 104 70 98',2);
 const coin=s.g('coin','0%{transform:none}28%{transform:none}44%{transform:rotate(-8deg) translateY(-3px)}60%{transform:rotate(5deg)}100%{transform:none}',
   s.shape('M80 86 Q96 80 106 88 Q108 102 96 108 Q82 106 80 86Z','#e9b43c',{hi:'#fff0a0',sh:'#b7801f'})+s.ink('M88 90 Q94 88 98 94 M86 98 Q94 100 100 98',2,'#8a5a14'),{o:'50% 50%'})
  +s.shape('M74 94 Q86 90 90 100 Q88 112 76 110 Q68 104 74 94Z',W,{sw:3.4,hi:'#ffffff',sh:Wd}); // lower paw holding it
 const ears=s.shape('M32 36 L36 12 Q40 10 50 22Z',W,{hi:'#fff',sh:Wd})+s.shape('M96 36 L92 12 Q88 10 78 22Z',W,{hi:'#fff',sh:Wd})
  +s.fill('M38 30 L40 18 L46 25Z','#f59db8')+s.fill('M90 30 L88 18 L82 25Z','#f59db8')
  +s.fill('M32 36 L36 12 Q40 10 44 16 L40 32Z','#2c2230','opacity=".95"');
 const head=s.shape('M30 44 Q28 20 64 20 Q100 20 98 44 Q100 66 64 68 Q28 66 30 44Z',W,{hi:'#ffffff',sh:Wd})
  +s.shape('M31 38 Q31 28 40 22 Q47 26 45 35 Q39 40 31 38Z','#2c2230',{sw:0,sh:false})
  +s.ink('M30 44 Q28 20 64 20 Q100 20 98 44 Q100 66 64 68 Q28 66 30 44Z',4);
 const eyeL=s.g('eyeL','0%{opacity:1}38%{opacity:1}42%{opacity:0}74%{opacity:0}78%{opacity:1}100%{opacity:1}',s.circ(50,46,4.6,'#1c2340',{sw:0,sh:false})+s.circ(48.6,44.4,1.5,'#fff',{sw:0,sh:false}),{});
 const eyeW=s.g('wink','0%{opacity:0}38%{opacity:0}42%{opacity:1}74%{opacity:1}78%{opacity:0}100%{opacity:0}',s.ink('M44 47 Q50 40 56 47',3.2),{});
 const face=eyeL+eyeW+s.circ(78,46,4.6,'#1c2340',{sw:0,sh:false})+s.circ(76.6,44.4,1.5,'#fff',{sw:0,sh:false})
  +s.fill('M60 54 L68 54 L64 59Z','#e87aa0')+s.ink('M64 59 V62 M64 62 Q58 66 54 61 M64 62 Q70 66 74 61',2.4)
  +s.ell(42,56,6,3.4,'#f59db8',{sw:0,sh:false}).replace('fill="#f59db8"','fill="#f59db8" opacity=".7"')+s.ell(86,56,6,3.4,'#f59db8',{sw:0,sh:false}).replace('fill="#f59db8"','fill="#f59db8" opacity=".7"')
  +s.ink('M30 54 L14 51 M31 59 L15 60 M98 54 L114 51 M97 59 L113 60',2);
 const collar=s.shape('M36 66 Q64 76 92 66 L94 76 Q64 86 34 76Z','#d9432e',{sw:3.4,hi:'#ff8a6a',sh:'#9c2a1e'});
 const bell=s.g('bell','0%{transform:none}14%{transform:rotate(-26deg)}28%{transform:rotate(24deg)}42%{transform:rotate(-18deg)}56%{transform:rotate(13deg)}70%{transform:rotate(-8deg)}84%{transform:rotate(4deg)}100%{transform:none}',
   s.circ(64,86,8.2,'#e9b43c',{sw:3.4,hi:'#fff0a0',sh:'#b7801f'})+s.ink('M56 86 H72',2,'#8a5a14')+s.circ(64,90,1.8,'#8a5a14',{sw:0,sh:false}),{o:'50% 0%'});
 // raised paw (viewer-left), waving around the shoulder
 const paw=s.g('paw','0%{transform:none}8%{transform:rotate(11deg)}20%{transform:rotate(-24deg)}34%{transform:rotate(15deg)}48%{transform:rotate(-17deg)}62%{transform:rotate(9deg)}76%{transform:rotate(-5deg)}90%{transform:rotate(2deg)}100%{transform:none}',
   s.shape('M44 80 Q24 76 18 52 Q14 38 24 36 Q36 36 38 52 Q42 62 52 68Z',W,{sw:4,hi:'#ffffff',sh:Wd})
   +s.fill('M22 42 Q26 38 32 42 Q30 48 24 48Z','#f59db8')+s.ink('M20 46 q4 2 8 0',1.8,'#c9627f'),{o:'90% 100%'});
 const pose=s.g('bob','0%{transform:none}14%{transform:translateY(2px) scale(1.02,.97)}34%{transform:translateY(-3px)}100%{transform:none}',cushion.replace(/./,'')?'':'',{});
 return s.out(s.shadow(64,125,52,3.6)+cushion+s.g('bob','0%{transform:none}10%{transform:translateY(2px) scale(1.03,.96)}26%{transform:translateY(-3px) scale(.98,1.03)}44%{transform:none}100%{transform:none}',body+coin+collar+bell+ears+head+face+paw,{o:'50% 100%'}));
};
