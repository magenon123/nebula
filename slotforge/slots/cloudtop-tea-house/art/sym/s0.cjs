const {mk}=require('../lib.cjs');
module.exports=()=>{const s=mk(0);
 // bamboo cup (grounded)
 const cup=s.shape('M30 104 L35 123 Q64 130 93 123 L98 104Z','#c9b45a',{hi:'#efe3a0'})
  +s.ink('M33 114 Q64 121 95 114',3)
  +s.shape('M31 108 Q64 116 97 108 L96 112 Q64 120 32 112Z','#d9432e',{sw:2.6,sh:'#9c2a1e'})
  +s.ell(64,104,34,7.5,'#6d4a2a',{sw:3.8,sh:'#4a2f1c'});
 // skewer builder
 function skewer(X,tilt,cols,tag,bite){
  const ys=[82,57,32];
  let b=s.ln(`M${X} 2 L${X} 106`,'#e6c987',4.4,{ow:2.6});
  // balls bottom to top
  const mkBall=(y,c,k)=>{
   const r=18; const light=c[0],dark=c[1],hi=c[2];
   return s.g('b'+k,
     `0%{transform:none}10%{transform:translateY(2px) scale(1.06,.9)}30%{transform:translateY(-13px) scale(.93,1.08)}48%{transform:translateY(0) scale(1.07,.92)}62%{transform:translateY(-4px) scale(.98,1.03)}80%{transform:none}100%{transform:none}`,
     s.circ(X,y,r,light,{sh:dark,hi:hi,sw:4})
     +s.ink(`M${X-10} ${y-9} Q${X-5} ${y-14} ${X+1} ${y-13}`,2.2,'#ffffff',''),
     {o:'50% 100%',d:k*150});
  };
  const cl=cols;
  b+=mkBall(ys[0],cl[2],1)+mkBall(ys[1],cl[1],2);
  if(bite){
    b+=s.g('whole','0%{opacity:1}55%{opacity:1}56%{opacity:0}100%{opacity:0}',s.circ(X,ys[2],18,cl[0][0],{sh:cl[0][1],hi:cl[0][2]})+s.ink(`M${X-10} ${ys[2]-9} Q${X-5} ${ys[2]-14} ${X+1} ${ys[2]-13}`,2.2,'#ffffff'),{o:'50% 100%'});
    // bitten ball: scalloped bite out of the upper right, rice-white inside
    const bd=`M${X-19} ${ys[2]} A19 19 0 0 1 ${X-4} ${ys[2]-18.5} Q${X+2} ${ys[2]-13} ${X+8} ${ys[2]-15} Q${X+9} ${ys[2]-8} ${X+15} ${ys[2]-9} Q${X+13} ${ys[2]-3} ${X+19} ${ys[2]} A19 19 0 0 1 ${X-19} ${ys[2]}Z`;
    b+=s.g('bitten','0%{opacity:0;transform:none}55%{opacity:0}56%{opacity:1;transform:scale(1.1,.9)}66%{transform:scale(.97,1.04)}78%{transform:none}100%{opacity:1;transform:none}',
      s.shape(bd,cl[0][0],{sh:cl[0][1],hi:cl[0][2]})
      +s.fill(`M${X-4} ${ys[2]-18.5} Q${X+2} ${ys[2]-13} ${X+8} ${ys[2]-15} Q${X+9} ${ys[2]-8} ${X+15} ${ys[2]-9} L${X+17} ${ys[2]-12} Q${X+10} ${ys[2]-19} ${X-4} ${ys[2]-18.5}Z`,'#fffaf0')
      +s.ink(`M${X-4} ${ys[2]-18.5} Q${X+2} ${ys[2]-13} ${X+8} ${ys[2]-15} Q${X+9} ${ys[2]-8} ${X+15} ${ys[2]-9}`,2.6),{o:'50% 100%',d:0});
  } else {
    b+=mkBall(ys[2],cl[0],3);
  }
  // twine bow below top ball? small red string tie at the stick bottom
  b+=s.ln(`M${X-4} 100 Q${X} 104 ${X+4} 100`,'#d9432e',2.6,{ow:2});
  return s.g('sk'+tag,`0%{transform:none}14%{transform:rotate(-7deg)}30%{transform:rotate(8deg)}46%{transform:rotate(-5deg)}62%{transform:rotate(3.5deg)}80%{transform:rotate(-1deg)}100%{transform:none}`,
    `<g transform="rotate(${tilt} ${X} 106)">${b}</g>`,{o:'50% 100%',d:tag*70});
 }
 const pinkC=['#f59db8','#c9627f','#ffd6e2'], whC=['#fbf1dc','#c9b99a','#ffffff'], grC=['#8cc063','#4f8a3a','#cfeea0'];
 // left: pink top, white, green bottom ; right: reversed order of tones for variety? keep same (hanami)
 const left=skewer(44,-7,[pinkC,whC,grC],1,true);
 const right=skewer(84,7,[pinkC,whC,grC],2,false);
 return s.out(s.shadow(64,121,46,5)+left+right+cup);
};
