const {mk}=require('../lib.cjs'); const tag=require('../tag.cjs');
module.exports=()=>{const s=mk(8);
 const K='M64 3 Q86 18 100 40 Q84 58 64 80 Q44 58 28 40 Q42 18 64 3Z';
 const clip='<clipPath id="kc8"><path d="'+K+'"/></clipPath>';
 const paper=s.shape(K,'#c8d93c',{hi:'#efffa0',sh:'#8aa81f',sw:4.4})
  +clip+'<g clip-path="url(#kc8)">'
  +s.fill('M64 3 L100 40 L64 40Z','#f2d23a','opacity=".9"')+s.fill('M64 40 L100 40 L64 80Z','#79c250','opacity=".85"')
  +s.fill('M28 40 L64 40 L64 80Z','#e8f06a','opacity=".9"')
  +'</g>'
  +s.ink('M64 5 V78 M30 40 H98',3.2,'#1c2340','opacity=".55"')
  +s.ink(K,4.4);
 const face=s.circ(46,46,5.4,'#f59db8',{sw:0,sh:false}).replace('fill="#f59db8"','fill="#f59db8" opacity=".75"')
  +s.circ(82,46,5.4,'#f59db8',{sw:0,sh:false}).replace('fill="#f59db8"','fill="#f59db8" opacity=".75"')
  +s.ell(52,36,4.2,5.4,'#1c2340',{sw:0,sh:false})+s.ell(76,36,4.2,5.4,'#1c2340',{sw:0,sh:false})
  +s.circ(50.8,34,1.5,'#fff',{sw:0,sh:false})+s.circ(74.8,34,1.5,'#fff',{sw:0,sh:false})
  +s.ink('M46 28 Q52 24 57 27 M71 27 Q76 24 82 28',2.4)
  +s.shape('M50 47 Q64 62 78 47 Q64 52 50 47Z','#d9432e',{sw:3,sh:'#8a2218'})
  +s.fill('M57 52 Q64 61 71 52 Q64 55 57 52Z','#ff8aa0');
 // bridle strings and the string going to the player's hand
 const bridle=s.ink('M64 3 Q50 50 64 84 M28 40 Q60 62 64 84 M100 40 Q70 62 64 84',1.8,'#1c2340')
  +s.circ(64,86,3.6,'#e9b43c',{sw:2.6,sh:'#b7801f'});
 const bow=(x,y,rot,c)=>`<g transform="rotate(${rot} ${x} ${y})">`+s.shape(`M${x} ${y} L${x-10} ${y-6} L${x-10} ${y+6}Z M${x} ${y} L${x+10} ${y-6} L${x+10} ${y+6}Z`,c,{sw:2.8,sh:false})+s.circ(x,y,2.6,'#1c2340',{sw:0,sh:false})+'</g>';
 const tail=s.g('tail','0%{transform:none}14%{transform:skewX(8deg) rotate(6deg)}32%{transform:skewX(-14deg) rotate(-12deg) scaleY(1.1)}50%{transform:skewX(12deg) rotate(10deg) scaleY(.82)}68%{transform:skewX(-8deg) rotate(-6deg) scaleY(1.05)}84%{transform:skewX(3deg)}100%{transform:none}',
   s.ln('M64 90 Q40 94 40 106 Q40 116 22 118','#f59db8',4.4,{ow:3})
   +bow(46,97,-30,'#d9432e')+bow(41,109,10,'#3a4a8c')+bow(27,118,-10,'#fbf1dc'),{o:'50% 0%'});
 const kite=s.g('kite','0%{transform:none}10%{transform:translateY(5px) scale(1.04,.93) rotate(-4deg)}26%{transform:translate(8px,-18px) rotate(22deg) scale(1.08)}42%{transform:translate(0,-34px) rotate(160deg) scale(1.12)}58%{transform:translate(-8px,-22px) rotate(300deg) scale(1.08)}74%{transform:translate(0,-6px) rotate(372deg)}86%{transform:rotate(354deg) scale(1.02)}94%{transform:rotate(364deg)}100%{transform:rotate(360deg)}',
   paper+face+bridle,{o:'50% 60%'});
 return s.out(s.shadow(94,124,26,3)+`<g transform="translate(4 0) scale(.96)">`+tail+kite+`</g>`+tag('WILD',66,98,58,{inner:'#79a85a',fs:17}));
};
