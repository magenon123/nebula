#!/usr/bin/env python3
"""Embeds kai.css into slot.js (leo's art build rewrites slot.css, so kai styles live in slot.js). Run after editing kai.css."""
import re
d=__import__('os').path.dirname(__import__('os').path.abspath(__file__))
css=open(d+'/kai.css').read().replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
s=open(d+'/slot.js').read()
blk="/*KAI-CSS*/\nconst KAI_CSS = `"+css+"`;\n(function () { const st = document.createElement('style'); st.id = 'kaiCss'; st.textContent = KAI_CSS; document.head.appendChild(st); })();\n/*END-KAI-CSS*/\n"
if '/*KAI-CSS*/' in s: s=re.sub(r'/\*KAI-CSS\*/.*?/\*END-KAI-CSS\*/\n',lambda m:blk,s,flags=re.S)
else: s=s.replace("SlotShell.boot(SLOT_CFG, S => {\n",blk+"SlotShell.boot(SLOT_CFG, S => {\n",1)
open(d+'/slot.js','w').write(s)
