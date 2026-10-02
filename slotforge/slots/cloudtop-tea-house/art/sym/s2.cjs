const {mk}=require('../lib.cjs');
module.exports=()=>{const s=mk(2);
 const P=[64,112], R=78, pt=(a,r=R)=>[(P[0]+r*Math.cos(a*Math.PI/180)).toFixed(1),(P[1]+r*Math.sin(a*Math.PI/180)).toFixed(1)];
 const A1=-153,A2=-27,N=9;
 // sheet with scalloped top edge
 let d=`M${P[0]} ${P[1]}`; let p=pt(A1,R); d+=` L${p[0]} ${p[1]}`;
 for(let i=0;i<N;i++){const a=A1+(A2-A1)*(i+1)/N, am=A1+(A2-A1)*(i+.5)/N; const q=pt(am,R+9), e=pt(a,R); d+=` Q${q[0]} ${q[1]} ${e[0]} ${e[1]}`;}
 d+='Z';
 // pleat sectors alternate a darker indigo
 let pleats='';
 for(let i=0;i<N;i+=2){const a=A1+(A2-A1)*i/N,b=A1+(A2-A1)*(i+1)/N;const p1=pt(a,R),p2=pt(b,R),q=pt((a+b)/2,R+9);
   pleats+=`<path d="M${P[0]} ${P[1]} L${p1[0]} ${p1[1]} Q${q[0]} ${q[1]} ${p2[0]} ${p2[1]}Z" fill="#27346a" opacity=".55"/>`;}
 let ribs='';
 for(let i=0;i<=N;i++){const a=A1+(A2-A1)*i/N;const e=pt(a,R-2);ribs+=`M${P[0]} ${P[1]} L${e[0]} ${e[1]} `;}
 const clipId='fanclip2';
 const sheet=s.shape(d,'#3a4a8c',{hi:'#7a8ad0',sh:'#27346a',sw:4.2})
  +`<clipPath id="${clipId}"><path d="${d}"/></clipPath><g clip-path="url(#${clipId})">${pleats}`
  // rising sun, off-centre to the upper left
  +s.circ(30,70,9,'#d9432e',{sh:'#9c2a1e',hi:'#ff8a6a',sw:3})
  +s.ink(ribs,1.8,'#1c2340','opacity=".7"')+'</g>';
 // crane (white), body leaning right, wings up
 const crane=s.shape('M44 76 Q56 66 74 70 Q88 74 94 86 Q78 90 62 88 Q48 86 44 76Z','#fbf1dc',{hi:'#ffffff',sh:'#cdbf9f',sw:3.2})
  +s.ln('M80 74 Q94 64 86 52 Q81 45 88 41','#fbf1dc',6.5,{ow:3.4})
  +s.circ(89,40,5.4,'#fbf1dc',{sw:3,sh:'#cdbf9f'})+s.fill('M85 36 q4 -3 8 0 q-4 1 -8 0Z','#d9432e')+s.ink('M94 40 L107 44',3.2)+s.circ(90,39,1.2,'#1c2340',{sw:0,sh:false})
  +s.shape('M60 72 Q40 54 32 36 Q48 42 60 52 Q56 40 58 28 Q74 42 76 70Z','#fbf1dc',{hi:'#ffffff',sh:'#cdbf9f',sw:3.2})
  +s.shape('M32 36 L38 38 L36 44 L32 42Z M58 28 L62 32 L58 36Z','#1c2340',{sw:1.6,sh:false})
  +s.shape('M46 80 L30 84 L36 90 L48 86Z','#1c2340',{sw:2,sh:false})
  +s.ink('M62 88 Q54 98 40 100 M70 88 Q64 100 52 106',2.8);
 // petals resting on the fan
 const petal=(x,y,r,k)=>s.g('pt'+k,`0%{transform:none;opacity:1}10%{transform:translate(0,0) rotate(0)}45%{transform:translate(${-6+k*7}px,${22+k*4}px) rotate(${60*k+40}deg);opacity:1}62%{transform:translate(${-12+k*10}px,${46+k*6}px) rotate(${120*k+80}deg);opacity:0}64%{transform:translate(0,-12px) scale(.6);opacity:0}100%{transform:none;opacity:1}`,
   s.shape(`M${x} ${y} q5 -8 11 -3 q2 8 -5 11 q-7 1 -6 -8Z`,'#f59db8',{sw:2.6,hi:'#ffd6e2',sh:'#d9658a'}),{o:'50% 50%',d:k*60});
 const petals=petal(36,86,0,0)+petal(94,80,0,1)+petal(78,96,0,2);
 const fan=s.g('sheet','0%{transform:none}9%{transform:scaleX(.13)}16%{transform:scaleX(.13)}30%{transform:scaleX(1.13) rotate(-3deg)}42%{transform:scaleX(.96) rotate(2deg)}56%{transform:scaleX(1.05) rotate(-4deg)}70%{transform:scaleX(.99) rotate(3deg)}84%{transform:scaleX(1) rotate(-1deg)}100%{transform:none}',
  sheet+crane+petals+`<rect x="0" y="0" width="128" height="112" fill="none"/>`,{o:'50% 100%'});
 // guard ribs (bamboo), rivet, tassel
 const guard=(a)=>{const e=pt(a,R+2);const e2=pt(a,12);return s.ln(`M${e2[0]} ${e2[1]} L${e[0]} ${e[1]}`,'#d6b574',6.5,{ow:3.2});};
 const tail=s.g('tassel','0%{transform:none}30%{transform:rotate(14deg)}48%{transform:rotate(-12deg)}64%{transform:rotate(8deg)}80%{transform:rotate(-3deg)}100%{transform:none}',
   s.ln('M64 112 Q60 120 64 124','#d9432e',2.4,{ow:2})+s.shape('M59 123 L69 123 L72 134 L56 134Z','#d9432e',{sw:2.6,sh:'#9c2a1e'}),{o:'50% 0%'});
 const frame=fan+guard(A1)+guard(A2)+s.circ(64,112,6.5,'#e9b43c',{sw:3.4,sh:'#b7801f',hi:'#fff0a0'})+s.circ(64,112,2,'#7a4a2e',{sw:0,sh:false});
 return s.out(s.shadow(64,121,46,4)+`<g transform="translate(0 -6)">${frame}${tail}</g>`);
};
