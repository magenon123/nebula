const {mk}=require('../lib.cjs');
module.exports=()=>{const s=mk(4);
 const TW='#4a3040';
 const vase=s.shape('M40 124 Q30 104 44 94 L52 90 L76 90 L84 94 Q98 104 88 124 Q64 129 40 124Z','#fbf1dc',{hi:'#ffffff',sh:'#cdbf9f'})
  +s.shape('M33 107 Q64 113 95 107 L92 114 Q64 120 36 114Z','#3a4a8c',{sw:2.8,sh:'#27346a'})
  +s.ell(64,90,13,3.6,'#3a2530',{sw:3,sh:false})
  +s.ink('M46 100 Q50 96 56 98',2,'#7a8ad0');
 const fl=(cx,cy,r,k,rot)=>{
  let p='';
  for(let i=0;i<5;i++){const a=(rot+i*72)*Math.PI/180;p+=s.circ(cx+Math.cos(a)*r*.52,cy+Math.sin(a)*r*.52,r*.5,'#f59db8',{sw:2.6,sh:'#d9658a',hi:'#ffd6e2',lit:[2,2.4],hs:1.8});}
  p+=s.circ(cx,cy,r*.24,'#fbf1dc',{sw:2.2,sh:'#e0b848'});
  let st='';for(let i=0;i<5;i++){const a=(rot+36+i*72)*Math.PI/180;st+=`M${cx+Math.cos(a)*r*.2} ${cy+Math.sin(a)*r*.2} L${cx+Math.cos(a)*r*.46} ${cy+Math.sin(a)*r*.46} `;}
  p+=s.ink(st,1.6,'#8a2a4a');
  return s.g('f'+k,`0%{transform:none}8%{transform:scale(.2) rotate(-70deg)}${22+k*2}%{transform:scale(.2) rotate(-70deg)}${52+k*2}%{transform:scale(1.28) rotate(8deg)}${70+k}%{transform:scale(.94) rotate(-3deg)}85%{transform:scale(1.04)}100%{transform:none}`,p,{o:'50% 50%',d:k*70});
 };
 const bud=(x,y)=>s.circ(x,y,4.4,'#e87aa0',{sw:2.6,sh:'#b24470',hi:'#ffc4d6',lit:[1.5,2]});
 const stems=s.ln('M60 96 Q56 70 70 56 Q82 44 98 34','#4a3040',7)
  +s.ln('M66 66 Q52 58 36 54','#4a3040',5)+s.ln('M77 50 Q92 58 103 72','#4a3040',4.4)+s.ln('M59 84 Q48 80 38 84','#4a3040',4)+s.ln('M70 56 Q72 42 68 32','#4a3040',3.6)
  +s.ink('M96 38 l6 -4 M54 62 l-4 -3',2,'#8a5a78');
 const tree=s.g('tree','0%{transform:none}22%{transform:rotate(-4deg)}40%{transform:rotate(3.4deg)}58%{transform:rotate(-2.4deg)}76%{transform:rotate(1.4deg)}100%{transform:none}',
  stems+bud(68,30)+bud(88,66)+fl(98,32,15,0,-10)+fl(35,53,14,1,20)+fl(104,74,12,2,40)+fl(70,52,12.5,3,5)+fl(38,84,11,4,30)+fl(60,34,9,5,50),{o:'50% 100%'});
 return s.out(s.shadow(64,125,40,3.4)+tree+vase);
};
