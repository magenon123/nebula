const INK = '#1c2340';
function hex2(c){c=c.replace('#','');return [0,2,4].map(i=>parseInt(c.substr(i,2),16))}
function mix(a,b,t){const x=hex2(a),y=hex2(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function mk(id){
  const o={id,n:0,css:[],names:{}};
  const u=p=>p+id+'_'+(o.n++);
  const f1=v=>Math.round(v*100)/100;
  // shape with flat shade (lower right), optional rim light (upper left), ink outline
  o.shape=(d,f,opt={})=>{
    const sw=opt.sw??4, sh=opt.sh||mix(f,'#2a1f4a',.34), [sx,sy]=opt.lit||[4,5];
    const c=u('c'), m=u('m'); let s='';
    if(opt.noInk!==true && opt.sh!==false) s+=`<path d="${d}" fill="${sh}"/>`; else s+=`<path d="${d}" fill="${f}"/>`;
    if(opt.sh!==false){
      s+=`<clipPath id="${c}"><path d="${d}"/></clipPath><g clip-path="url(#${c})"><path d="${d}" fill="${f}" transform="translate(${-sx} ${-sy})"/></g>`;
    }
    if(opt.hi){
      s+=`<mask id="${m}"><path d="${d}" fill="#fff"/><path d="${d}" fill="#000" transform="translate(${opt.hs||3.4} ${opt.hs||3.6})"/></mask><path d="${d}" fill="${opt.hi}" mask="url(#${m})"/>`;
    }
    if(opt.extra) s+=opt.extra;
    if(sw>0) s+=`<path d="${d}" fill="none" stroke="${opt.ink||INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${opt.dash?` stroke-dasharray="${opt.dash}"`:''}/>`;
    return s;
  };
  o.circ=(cx,cy,r,f,opt)=>o.shape(`M${f1(cx-r)} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z`,f,opt);
  o.ell=(cx,cy,rx,ry,f,opt)=>o.shape(`M${f1(cx-rx)} ${cy}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`,f,opt);
  // coloured stroke with ink edge
  o.ln=(d,col,w,opt={})=>`<path d="${d}" fill="none" stroke="${opt.ink||INK}" stroke-width="${w+(opt.ow??3)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${opt.dash?` stroke-dasharray="${opt.dash}"`:''}/>`;
  o.ink=(d,w=2.4,col=INK,extra='')=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  o.fill=(d,f,extra='')=>`<path d="${d}" fill="${f}" ${extra}/>`;
  // animated group. kf: keyframe body. opt: o=transform-origin, dur, d(delay ms), ease
  o.g=(name,kf,inner,opt={})=>{
    const dur=opt.dur||1.1, dl=opt.d||0, ease=opt.ease||'cubic-bezier(.3,.7,.3,1)', org=opt.o||'50% 50%';
    const an=`sy${id}_${name}`;
    o.css.push(`.sy${id} .a-${name}{animation:${an} calc(${dur}s*var(--spd,1)) ${ease} calc(var(--delay,0ms) + ${dl}ms) both;animation-play-state:var(--win,paused)}@keyframes ${an}{${kf}}`);
    return `<g class="a-${name}" style="transform-box:fill-box;transform-origin:${org}"${opt.attr?' '+opt.attr:''}>${inner}</g>`;
  };
  o.shadow=(cx=64,cy=119,rx=40,ry=5)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#2a1f4a" opacity=".28"/>`;
  o.out=(body)=>`<symbol id="s${id}" viewBox="0 0 128 128"><style>${o.css.join('')}</style><g class="sy${id}"><g filter="url(#roughS)">${body}</g></g></symbol>`;
  return o;
}
module.exports={mk,mix,INK};
