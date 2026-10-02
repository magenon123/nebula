const {mk}=require('../lib.cjs');
module.exports=()=>{const s=mk(3);
 const hook=s.shape('M128 4 L52 4 Q44 4 44 11 L128 11Z','#7a4a2e',{sw:3.6,hi:'#c18a55',sh:'#54301c'})+s.shape('M118 11 L128 11 L128 30 L112 11Z','#7a4a2e',{sw:3,sh:'#54301c'});
 const crest=(cx,cy)=>s.circ(cx,cy,15,'#fbf1dc',{sw:3,sh:'#e5d3ac'})
  +s.fill(`M${cx-2} ${cy+9} Q${cx-12} ${cy+2} ${cx-8} ${cy-8} Q${cx+1} ${cy-5} ${cx-2} ${cy+9}Z`,'#4f7d3a')
  +s.fill(`M${cx+2} ${cy+9} Q${cx+12} ${cy+2} ${cx+8} ${cy-8} Q${cx-1} ${cy-5} ${cx+2} ${cy+9}Z`,'#79a85a')
  +s.ink(`M${cx} ${cy+11} V${cy-4}`,2);
 const bodyPath='M30 40 Q22 64 30 90 Q64 100 98 90 Q106 64 98 40 Q64 34 30 40Z';
 const lant=
  s.ln('M64 26 Q64 20 64 14','#1c2340',2.4,{ow:2})
  +s.shape(bodyPath,'#d9432e',{hi:'#ff8a6a',sh:'#9c2a1e'})
  +s.g('flame','0%{opacity:0}25%{opacity:0}40%{opacity:.95}60%{opacity:.55}72%{opacity:.95}88%{opacity:.8}100%{opacity:0}',
     `<clipPath id="lc3"><path d="${bodyPath}"/></clipPath><g clip-path="url(#lc3)"><ellipse cx="64" cy="64" rx="34" ry="30" fill="#ffd45a"/><ellipse cx="64" cy="68" rx="20" ry="20" fill="#fff3b0"/></g>`
     +s.shape('M64 50 Q72 62 68 72 Q64 78 60 72 Q56 62 64 50Z','#ff9a2e',{sw:2.4,sh:'#d9432e'}),{o:'50% 50%'})
  // ribs bulge with the body (they flex)
  +s.g('ribs','0%{transform:none}30%{transform:scaleY(1.06)}46%{transform:scaleY(.96)}62%{transform:scaleY(1.04)}80%{transform:scaleY(.99)}100%{transform:none}',
     s.ink('M28 52 Q64 60 100 52 M25 64 Q64 73 103 64 M27 77 Q64 86 101 77',2.4,'#7a1e18'),{o:'50% 50%'})
  +crest(64,64)
  // black rims
  +s.shape('M32 32 Q64 28 96 32 L98 42 Q64 38 30 42Z','#1c2340',{sw:3.2,sh:'#10142a',hi:'#4a5688'})
  +s.shape('M32 89 Q64 96 98 89 L96 100 Q64 106 34 100Z','#1c2340',{sw:3.2,sh:'#10142a',hi:'#4a5688'})
  +s.g('tassel','0%{transform:none}30%{transform:rotate(-14deg)}50%{transform:rotate(12deg)}70%{transform:rotate(-6deg)}100%{transform:none}',
     s.ln('M64 102 V110','#e9b43c',3,{ow:2})+s.shape('M56 108 L72 108 L76 124 L52 124Z','#e9b43c',{sw:3,sh:'#b7801f',hi:'#fff0a0'})+s.ink('M58 114 L56 123 M64 114 V123 M70 114 L72 123',1.6,'#8a5a14'),{o:'50% 0%'});
 const swing=s.g('swing','0%{transform:rotate(0)}12%{transform:rotate(-15deg)}30%{transform:rotate(13deg)}46%{transform:rotate(-9deg)}60%{transform:rotate(6deg)}74%{transform:rotate(-3deg)}88%{transform:rotate(1.2deg)}100%{transform:none}',
   '<rect x="30" y="14" width="68" height="2" fill="none"/>'+lant,{o:'50% 0%'});
 return s.out(hook+swing);
};
