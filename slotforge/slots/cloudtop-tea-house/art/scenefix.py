# one-off (already applied to art/raw/scene.html): fewer animated nodes in the scene (kites 5->2, clouds c1+c3 merged, lantern sway removed in css)
import re
p='/home/user/nebula/slotforge/slots/cloudtop-tea-house/art/raw/scene.html'
s=open(p).read()
if 'kite kL' in s: raise SystemExit('already applied')
def close_of(s,i):
    d=0
    for m in re.finditer(r'<(/?)g\b[^>]*?(/?)>',s[i:]):
        if m.group(2): continue
        d+= -1 if m.group(1) else 1
        if d==0: return i+m.end()
# merge c3 into c1
i3=s.index('<g class="cl c3">'); e3=close_of(s,i3); c3=s[i3:e3]; inner3=c3[len('<g class="cl c3">'):-4]
s=s[:i3]+s[e3:]
i1=s.index('<g class="cl c1">'); e1=close_of(s,i1); s=s[:e1-4]+inner3+s[e1-4:]
# kites
for k in range(1,6): s=s.replace(f'<g class="kite k{k}"',f'<g class="kt k{k}"')
a=s.index('<g class="kt k1"'); b=s.index('<g class="kt k3"'); c=s.index('<g id="sLedge"'); c=s.rindex('</g>',0,c)
s=s[:c]+'</g>'+s[c:]
s=s[:b]+'</g><g class="kite kR" style="transform-origin:1584px 300px">'+s[b:]
s=s[:a]+'<g class="kite kL" style="transform-origin:332px 418px">'+s[a:]
open(p,'w').write(s); print('ok')
