/* s15 GRAND DRAGON KITE (redrawn): an indigo diamond kite carrying a noble Japanese dragon (ryu) in PROFILE (a long snout with whiskers, antler horns, a flame mane,
   a coiling scaled body). Profile + long muzzle + whiskers + horns is what stops it reading as a pig (the old version was a front view with a round snout). */
const {mk}=require('../lib.cjs'); const tag=require('../tag.cjs');
module.exports=()=>{const s=mk(15);
 const GOLD='#e9b43c', GOLDD='#b7801f', RED='#d9432e', REDD='#8a2218', TEAL='#2fa595', TEALL='#7fe0cf', CREAM='#fbf1dc', INDIGO='#27336f';
 // ---- the kite cloth (diamond, slightly bellied) ----
 const K='M64 3 Q94 16 112 44 Q90 66 64 90 Q38 66 16 44 Q34 16 64 3Z';
 const cloth=s.shape(K,INDIGO,{sw:4.6,hi:'#5a6cc0',sh:'#161f4a'})
  +`<clipPath id="kc15"><path d="${K}"/></clipPath><g clip-path="url(#kc15)">`
  +s.ink('M64 3 V90 M16 44 H112',2,'#8fa0e8','opacity=".5"')
  +s.ink('M22 62 q8 -7 16 0 q8 -7 16 0 M76 78 q8 -7 16 0 M84 24 q8 -7 16 0',2.2,'#8fa0e8','opacity=".55"')   // wave/cloud motifs on the cloth
  +`</g>`+s.ink('M64 9 Q90 20 105 44 Q86 62 64 82 Q42 62 23 44 Q38 20 64 9Z',2.4,GOLD)+s.ink(K,4.6);
 // ---- the dragon: body first (behind the head) ----
 const bodyPath='M84 50 Q108 54 98 68 Q86 80 70 72 Q56 66 54 76 Q56 86 74 88';
 const body=s.ln(bodyPath,RED,15,{ow:4})+s.ln(bodyPath,GOLD,5.4,{ow:0,ink:RED})
  +`<path d="${bodyPath}" fill="none" stroke="${REDD}" stroke-width="15" stroke-dasharray="0 9" stroke-linecap="round" opacity=".0"/>`
  // scale crescents along the back
  +s.ink('M90 46 q4 4 0 8 M98 52 q4 3 1 8 M100 62 q-1 5 -6 6 M92 72 q-3 4 -9 3 M80 72 q-5 1 -7 -4 M62 68 q-4 0 -6 4',2,REDD,'opacity=".9"')
  // spine fin spikes
  +s.shape('M96 44 L100 36 L103 46Z M104 52 L111 48 L109 58Z M106 64 L113 66 L106 72Z',TEAL,{sw:2.4,sh:'#1c6a60'});
 // ---- tail (leaves the kite at the bottom, trails off to the right) ----
 const tail=s.g('tail','0%{transform:none}18%{transform:skewX(9deg) rotate(7deg)}38%{transform:skewX(-13deg) rotate(-11deg)}58%{transform:skewX(11deg) rotate(8deg)}78%{transform:skewX(-4deg)}100%{transform:none}',
   s.ln('M74 88 Q92 92 92 104 Q92 114 108 116 Q118 117 120 108','#d9432e',9,{ow:3.4})+s.ln('M74 88 Q92 92 92 104 Q92 114 108 116','#e9b43c',3,{ow:0,ink:RED})
   +s.shape('M118 102 L126 94 L124 106 L128 110 L120 112Z',TEAL,{sw:2.6,sh:'#1c6a60'}),{o:'30% 0%'});
 // ---- mane (flame tufts behind the head, flutters) ----
 const mane=s.g('mane','0%{transform:none}20%{transform:rotate(5deg) scale(1.04)}42%{transform:rotate(-6deg) scale(.97)}64%{transform:rotate(4deg) scale(1.03)}84%{transform:rotate(-2deg)}100%{transform:none}',
   s.shape('M76 30 Q88 14 104 18 Q96 24 102 30 Q94 32 100 40 Q92 40 94 50 Q86 46 82 52 Q76 44 70 44Z',TEAL,{sw:3.2,hi:TEALL,sh:'#1c6a60'})
   +s.ink('M84 28 Q92 22 98 22 M88 36 Q94 32 98 34',1.8,TEALL)
   +s.shape('M40 52 Q38 66 48 72 Q50 64 56 68 Q58 58 64 58 Q60 52 56 50Z',TEAL,{sw:3,hi:TEALL,sh:'#1c6a60'}),{o:'70% 40%'});
 // ---- horns (antler style, cream) ----
 const horns=s.shape('M54 30 Q60 10 84 2 Q98 -2 106 4 Q92 6 88 12 Q98 12 104 20 Q90 16 82 22 Q76 28 74 32Z',CREAM,{sw:3.4,hi:'#fff',sh:'#d8c49a'})
  +s.shape('M46 30 Q48 18 62 10 Q54 18 58 24 Q58 28 56 32Z','#e8d4a8',{sw:2.8,sh:'#b9a070'})
  +s.ink('M62 24 Q72 12 88 8',1.8,'#b9a070');
 // ---- whiskers: two long ribbons from the muzzle ----
 const whisk=s.g('whisk','0%{transform:none}22%{transform:rotate(6deg)}46%{transform:rotate(-7deg)}70%{transform:rotate(4deg)}100%{transform:none}',
   s.ln('M30 42 Q8 42 -6 30 Q-12 22 -6 14 Q-2 10 4 14',CREAM,3.8,{ow:3.4})
   +s.ln('M30 49 Q10 58 -4 74 Q-8 84 0 88 Q8 90 10 84',CREAM,3.8,{ow:3.4}),{o:'80% 50%'});
 // ---- head (profile facing left) ----
 const jaw=s.g('jaw','0%{transform:none}14%{transform:rotate(-3deg)}30%{transform:rotate(11deg)}46%{transform:rotate(2deg)}62%{transform:rotate(9deg)}100%{transform:none}',
   s.shape('M26 52 Q44 54 62 52 Q74 52 78 56 Q74 66 60 66 Q40 66 30 60 Q22 56 26 52Z',RED,{sw:3.4,hi:'#ff8a6a',sh:REDD})
   +s.fill('M34 54 Q44 52 52 54 Q46 59 38 58Z','#ff7a90')          // tongue
   +s.shape('M32 53 L35 47 L38 53Z M46 54 L49 49 L52 54Z',CREAM,{sw:2,sh:false}),{o:'85% 30%'});
 const head=jaw
  +s.shape('M18 40 Q18 33 26 32 Q34 32 40 27 Q52 18 66 22 Q82 26 86 40 Q86 50 76 52 Q64 50 52 49 Q38 50 24 49 Q16 48 18 40Z',RED,{sw:3.8,hi:'#ff9070',sh:REDD})
  // nostril + muzzle line, cheek scales
  +s.circ(24,38,2,REDD,{sw:0,sh:false})+s.ink('M30 44 Q44 47 60 47',2,REDD)
  +s.ink('M70 38 q4 3 1 7 M76 34 q4 3 1 7 M64 40 q3 3 0 6',1.8,REDD,'opacity=".85"')
  // upper fangs
  +s.shape('M28 48 L31 55 L34 48Z M42 49 L45 55 L48 49Z',CREAM,{sw:2,sh:false})
  // eye: almond, gold, slit pupil, thick angry-noble brow
  +s.shape('M46 33 Q55 26 66 33 Q56 40 46 33Z','#ffd84a',{sw:2.6,sh:'#e0a820',hi:'#fff6b0'})+s.ell(56,33,1.9,4.6,'#1c2340',{sw:0,sh:false})+s.circ(58,31.4,1.1,'#fff',{sw:0,sh:false})
  +s.shape('M42 30 Q56 18 70 27 Q60 24 50 30 Q46 34 42 30Z','#7a1c12',{sw:2.6,sh:false})
  +s.circ(18,30,3,GOLD,{sw:2.4,sh:GOLDD});   // the dragon pearl at the tip of the muzzle
 // the pearl floats above the nose
 const pearl=s.circ(20,22,4.6,'#fff6c8',{sw:2.6,sh:'#e9c868',hi:'#fff'});
 const dragon=`<g transform="translate(64 50) scale(.76) translate(-56 -42)">`+body+mane+horns+head+whisk+`</g>`;
 const kite=s.g('kite','0%{transform:none}10%{transform:translateY(5px) scale(1.04,.93)}26%{transform:translate(6px,-16px) rotate(8deg) scale(1.1)}46%{transform:translate(0,-26px) rotate(-7deg) scale(1.16)}66%{transform:translate(-4px,-14px) rotate(5deg) scale(1.08)}86%{transform:rotate(-2deg)}100%{transform:none}',tail+cloth+dragon,{o:'50% 55%'});
 return s.out(s.shadow(70,124,40,3)+`<g transform="translate(2 0) scale(.96)">`+kite+`</g>`+tag('GRAND',34,98,60,{inner:'#7a3ca6',fs:15}));
};
