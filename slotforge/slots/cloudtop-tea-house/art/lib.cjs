const INK = '#1c2340';
function hex2(c){c=c.replace('#','');return [0,2,4].map(i=>parseInt(c.substr(i,2),16))}
function mix(a,b,t){const x=hex2(a),y=hex2(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')}
let FIT=null;function fitAttr(id){if(FIT===null){try{FIT=JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'fit.json'),'utf8'))}catch(e){FIT={}}}const f=FIT[id];return f?` transform="translate(${f[1]} ${f[2]}) scale(${f[0]})"`:''}
function mk(id){
  const o={id,n:0,css:[],names:{}};
  const u=p=>p+id+'_'+(o.n++);
  const f1=v=>Math.round(v*100)/100;
  // shape with flat shade (lower right), optional rim light (upper left), ink outline
  o.shape=(d,f,opt={})=>{
    const sw=opt.sw??4, sh=opt.sh||mix(f,'#2a1f4a',.44), [sx,sy]=opt.lit||[4,5];
    const c=u('c'), m=u('m'); let s='';
    // FINISH v2 (leo): 3-step cel shading (core shadow, half shade, light) + reflected light on the shadow side + rim light, so forms read as lit volumes
    const big=!opt.flat && sw>=2.6 && opt.sh!==false;
    if(opt.noInk!==true && opt.sh!==false) s+=`<path d="${d}" fill="${big?mix(sh,'#1c2340',.28):sh}"/>`; else s+=`<path d="${d}" fill="${f}"/>`;
    if(opt.sh!==false){
      s+=`<clipPath id="${c}"><path d="${d}"/></clipPath><g clip-path="url(#${c})">`;
      if(big) s+=`<path d="${d}" fill="${sh}" transform="translate(${f1(-sx*.45)} ${f1(-sy*.45)})"/><path d="${d}" fill="${mix(f,sh,.35)}" transform="translate(${f1(-sx*.8)} ${f1(-sy*.8)})"/>`;
      if(big) s+=`<path d="${d}" fill="none" stroke="${mix(sh,'#ffd9a8',.42)}" stroke-width="5" opacity=".55"/>`;
      s+=`<path d="${d}" fill="${f}" transform="translate(${-sx*(big?1.15:1)} ${-sy*(big?1.15:1)})"/>`;
      s+=`</g>`;
    }
    if(opt.hi===undefined && big && f.length===7 && sw>=3) opt={...opt,hi:mix(f,'#ffffff',.62),hs:3.2};
    if(opt.hi){
      s+=`<mask id="${m}"><path d="${d}" fill="#fff"/><path d="${d}" fill="#000" transform="translate(${opt.hs||3.4} ${opt.hs||3.6})"/></mask><path d="${d}" fill="${opt.hi}" mask="url(#${m})"/>`;
    }
    if(opt.extra) s+=opt.extra;
    if(sw>0) s+=`<path d="${d}" fill="none" stroke="${opt.ink||INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${opt.dash?` stroke-dasharray="${opt.dash}"`:''}/>`;
    return s;
  };
  o.circ=(cx,cy,r,f,opt)=>o.shape(`M${f1(cx-r)} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z`,f,opt)+(r>=9&&!(opt&&(opt.noSpec||opt.sh===false))?`<ellipse cx="${f1(cx-r*.38)}" cy="${f1(cy-r*.42)}" rx="${f1(r*.2)}" ry="${f1(r*.12)}" fill="#fff" opacity=".7" transform="rotate(-35 ${f1(cx-r*.38)} ${f1(cy-r*.42)})"/>`:'');
  o.ell=(cx,cy,rx,ry,f,opt)=>o.shape(`M${f1(cx-rx)} ${cy}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`,f,opt);
  // coloured stroke with ink edge
  o.ln=(d,col,w,opt={})=>`<path d="${d}" fill="none" stroke="${opt.ink||INK}" stroke-width="${w+(opt.ow??3)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${opt.dash?` stroke-dasharray="${opt.dash}"`:''}/>`;
  o.ink=(d,w=2.4,col=INK,extra='')=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  o.fill=(d,f,extra='')=>`<path d="${d}" fill="${f}" ${extra}/>`;
  // animated group. kf: keyframe body. opt: o=transform-origin, dur, d(delay ms), ease
  o.g=(name,kf,inner,opt={})=>{
    const dur=opt.dur||1.1, dl=opt.d||0, ease=opt.ease||'cubic-bezier(.3,.7,.3,1)', org=opt.o||'50% 50%';
    const an=`sy${id}_${name}`; (o.names[name]=an);
    {let z=null;for(const m of kf.matchAll(/(?:^|\})\s*([^{}]*)\{([^{}]*)\}/g)){if(m[1].split(',').map(x=>x.trim()).some(x=>x==='0%'||x==='from')){z=m[2];break;}}
     if(z)o.css.push(`.sy${id} .a-${name}{${z}}`);}   // rest pose = the 0% frame (no animation exists while idle)
    o.css.push(`.sy${id} .a-${name}{animation:var(--k${id}_${name},none) calc(${dur}s*var(--spd,1)) ${ease} calc(var(--delay,0ms) + ${dl}ms) both;animation-play-state:var(--win,paused)}@keyframes ${an}{${kf}}`);
    return `<g class="a-${name}" style="transform-box:fill-box;transform-origin:${org}"${opt.attr?' '+opt.attr:''}>${inner}</g>`;
  };
  o.shadow=(cx=64,cy=119,rx=40,ry=5)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#2a1f4a" opacity=".28"/>`;
  o.out=(body)=>{(module.exports.registry=module.exports.registry||{})[id]=Object.entries(o.names).map(([n,a])=>`--k${id}_${n}:${a}`);return `<symbol id="s${id}" viewBox="0 0 128 128"><style>${o.css.join('')}</style><g class="sy${id}"><g filter="url(#roughS)"${fitAttr(id)}>${body}</g></g></symbol>`};
  return o;
}
module.exports={mk,mix,INK};
