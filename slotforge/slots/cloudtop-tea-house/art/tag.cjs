// text tag like the FS tag on the other slots. x,y = top-left, w
module.exports=(txt,x,y,w,opt={})=>{
 const outer=opt.outer||'#1c2340', inner=opt.inner||'#d9432e', fs=opt.fs||19;
 return `<g class="fs-tag"><rect x="${x}" y="${y}" width="${w}" height="26" rx="8" fill="${outer}"/><rect x="${x+3}" y="${y+3}" width="${w-6}" height="20" rx="6" fill="${inner}" stroke="#fff3c4" stroke-width="1.4"/><text x="${x+w/2}" y="${y+19.5}" text-anchor="middle" font-family="'Lilita One','Luckiest Guy','Impact','Arial Black',sans-serif" font-size="${fs}" letter-spacing="1.5" fill="${opt.txt||'#fff6d0'}" stroke="${outer}" stroke-width="3.2" paint-order="stroke" stroke-linejoin="round">${txt}</text></g>`;
};
