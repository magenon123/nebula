#!/usr/bin/env python3
"""SlotForge builder: assembles shell + a slot module (+ its engine) into one HTML file.

  python3 build-standalone.py                  # EmberClaw: emberclaw-standalone.html (offline, embedded engine) AND emberclaw.html (server-served)
  python3 build-standalone.py <slug>           # <slug>-standalone.html (offline demo with the embedded engine, play money)
  python3 build-standalone.py <slug> --server  # also writes <slug>.html (talks to the server API; needs the Nebula login token)
  python3 build-standalone.py <slug> --server-only

Sources: slotforge/shell/{template.html,slot-shell.css,slot-shell.js,shell-defs.svg} + slotforge/slots/<slug>/{slot.json,slot.css,slot.js,
symbols.svg,scene.html,logo.html,frame.html,character.html,side.html,info.html}. The engine source is `engineSource` in slot.json
(default engines/<slug>.js). The build asserts slot.json (bets, anteCost, buys, maxWin) equals the engine CFG.
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SF = os.path.join(ROOT, 'slotforge')
read = lambda *p: open(os.path.join(*p), encoding='utf-8').read()


def bundle_engine(path):
    """Turn an ES-module engine into a closure expression `(() => {...; return {exports}})()` (no name clashes with the page)."""
    src = read(ROOT, path)
    for m in re.finditer(r"^\s*import\s.*?from\s+['\"]([^'\"]+)['\"];?\s*$", src, flags=re.M):
        if m.group(1) not in ('crypto', 'node:crypto'):
            sys.exit(f'engine {path}: only `import ... from "crypto"` is allowed in a single-file engine, found {m.group(0).strip()}')
    src = re.sub(r"^\s*import\s.*?from\s+['\"](?:node:)?crypto['\"];?\s*$", '', src, flags=re.M)
    names = re.findall(r"^export\s+(?:async\s+)?(?:const|let|var|function\*?|class)\s+([A-Za-z_$][\w$]*)", src, flags=re.M)
    for grp in re.findall(r"^export\s*\{([^}]*)\}\s*;?", src, flags=re.M):
        names += [x.split(' as ')[-1].strip() for x in grp.split(',') if x.strip()]
    src = re.sub(r"^export\s*\{[^}]*\}\s*;?\s*$", '', src, flags=re.M)
    src = re.sub(r"^export\s+", '', src, flags=re.M)
    for need in ('playRound', 'CFG'):
        if need not in names:
            sys.exit(f'engine {path} does not export {need}')
    # the production RNG uses node crypto; the shell supplies its own WebCrypto RNG, so make any leftover reference harmless
    return '(() => {\n' + src + '\nreturn { ' + ', '.join(sorted(set(names))) + ' };\n})()'


def check_against_engine(cfg, path):
    """slot.json is the client's copy of a few engine numbers; fail the build if they drift."""
    js = ("import(process.argv[1]).then(m=>{const C=m.CFG;console.log(JSON.stringify({bets:C.bets,maxWin:C.maxWin,anteCost:C.anteCost||0,"
          "buy:Object.fromEntries(Object.entries(C.buy||{}).map(([k,v])=>[k,v.cost])),paytable:m.PAYTABLE||null,payScale:C.payScale||1,scatterPay:m.SCATTER_PAY||C.scatterPay||null}))})")
    r = subprocess.run(['node', '-e', js, 'file://' + os.path.join(ROOT, path)], capture_output=True, text=True)
    if r.returncode:
        sys.exit('cannot load engine for the CFG check:\n' + r.stderr)
    e = json.loads(r.stdout)
    bad = []
    if e['bets'] != cfg['bets']: bad.append('bets differ (slot.json vs engine CFG.bets)')
    if e['maxWin'] != cfg['maxWin']: bad.append(f"maxWin {cfg['maxWin']} != engine {e['maxWin']}")
    if e['anteCost'] != cfg.get('anteCost', 0): bad.append(f"anteCost {cfg.get('anteCost')} != engine {e['anteCost']}")
    mine = {b['key']: b['mult'] for b in cfg.get('buys', [])}
    if mine != e['buy']: bad.append(f'buys {mine} != engine CFG.buy costs {e["buy"]}')
    if bad:
        sys.exit('slot.json / engine mismatch:\n  ' + '\n  '.join(bad))
    return {'paytable': e['paytable'], 'payScale': e['payScale'], 'scatterPay': e.get('scatterPay')}


def assemble(slug, standalone):
    sd = os.path.join(SF, 'slots', slug)
    if not os.path.isdir(sd): sys.exit(f'no such slot: {sd}')
    cfg = json.loads(read(sd, 'slot.json'))
    engine_path = cfg.get('engineSource') or f'slotforge/engines/{slug}.js'
    cfg['engineData'] = check_against_engine(cfg, engine_path)   # engine PAYTABLE x payScale reach the info screen: one source of truth
    info = read(sd, 'info.html')
    vals = {'maxWin': f"{cfg['maxWin']:,}", 'anteCost': str(cfg.get('anteCost', 0))}
    vals.update({'buy:' + b['key']: str(b['mult']) for b in cfg.get('buys', [])})
    info = re.sub(r'\[\[([\w:]+)\]\]', lambda m: vals[m.group(1)], info)
    scripts = "'use strict';\n/* ---- slot config (slots/%s/slot.json) ---- */\nconst SLOT_CFG = %s;\n" % (slug, json.dumps(cfg, ensure_ascii=False))
    if standalone:
        scripts += ("/* ---- STANDALONE MODE: the server engine is embedded and runs locally with play money. ---- */\nconst SLOT_ENGINE = "
                    + bundle_engine(engine_path) + ";\n")
    scripts += '/* ---- shell ---- */\n' + re.sub(r"^'use strict';\n", '', read(SF, 'shell', 'slot-shell.js'), count=1)
    scripts += '\n/* ---- slot: %s ---- */\n' % slug + read(sd, 'slot.js')
    title = cfg['title'] + (' (offline demo)' if standalone else '')
    parts = {
        'TITLE': title, 'INFO_TITLE': cfg['infoTitle'],
        'SHELL_CSS': read(SF, 'shell', 'slot-shell.css'), 'SLOT_CSS': read(sd, 'slot.css'),
        'SHELL_DEFS': read(SF, 'shell', 'shell-defs.svg'), 'SYMBOLS': read(sd, 'symbols.svg'),
        'SCENE': read(sd, 'scene.html'), 'LOGO': read(sd, 'logo.html'), 'FRAME': read(sd, 'frame.html'),
        'CHARACTER': read(sd, 'character.html'), 'SIDE': read(sd, 'side.html'), 'INFO': info,
        'SCRIPTS': scripts.replace('</script', '<\\/script'),
    }
    html = re.sub(r'\{\{([A-Z_]+)\}\}', lambda m: parts[m.group(1)], read(SF, 'shell', 'template.html'))
    return html


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = {a for a in sys.argv[1:] if a.startswith('--')}
    legacy = not args
    slug = args[0] if args else 'emberclaw'
    outs = []
    if '--server-only' not in flags: outs.append((f'{slug}-standalone.html', True))
    if legacy or '--server' in flags or '--server-only' in flags: outs.append((f'{slug}.html', False))
    for name, standalone in outs:
        html = assemble(slug, standalone)
        open(os.path.join(ROOT, name), 'w', encoding='utf-8').write(html)
        print('built', name, len(html), 'bytes')


if __name__ == '__main__':
    main()
