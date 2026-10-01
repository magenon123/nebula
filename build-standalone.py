#!/usr/bin/env python3
"""Builds emberclaw-standalone.html: emberclaw.html with the server engine embedded (play-money offline demo)."""
import re
eng = open('emberclaw-engine.js').read()
eng = eng.replace("import crypto from 'crypto';\n", "")
eng = re.sub(r'^export ', '', eng, flags=re.M)
eng = re.sub(r"function cryptoRng\(\) \{.*?\n\}", "function cryptoRng() { const a = new Uint32Array(2); crypto.getRandomValues(a); return (a[0] * 2 ** 21 + (a[1] >>> 11)) / 2 ** 53; }", eng, flags=re.S)
eng = eng.replace("playSpin", "engineSpin")  # the page has its own playSpin renderer
local = '''
/* ---- STANDALONE MODE: the server engine is embedded and runs locally with play money. ---- */
const START_BALANCE = 1000;
let wallet = Number(localStorage.getItem('emberclawWallet') || START_BALANCE);
if (!(wallet >= 0.1)) wallet = START_BALANCE;
const _r2 = n => Math.round(n * 100) / 100;
async function api(body) {
  const stake = _r2(body.stake), buy = body.buy || null;
  const round = playRound(cryptoRng, { ante: !!body.ante, buy });
  const cost = _r2(stake * round.cost), payout = _r2(stake * round.totalPayout);
  if (cost > wallet + 1e-9) throw new Error('Not enough balance (clear site data to reset play money)');
  wallet = _r2(wallet - cost + payout); localStorage.setItem('emberclawWallet', wallet);
  return { round, stake, cost, payout, user: { balance: wallet } };
}
'''
h = open('emberclaw.html').read()
h = re.sub(r"async function api\(body\) \{.*?\n\}\n", "", h, count=1, flags=re.S)
h = h.replace("const API = location.origin.startsWith('http') ? '' : 'http://localhost:3000';\nconst TOKEN = localStorage.getItem('stakeToken');\n", "")
h = h.replace("'use strict';\n", "'use strict';\n" + eng + local, 1)
t = h.index("if (!TOKEN) $('auth').hidden = false;")
h = h[:t] + "balance = wallet; $('bal').textContent = fmt(balance);\n" + h[h.index("</script>"):]
h = h.replace("<title>EmberClaw: Molten Reforge</title>", "<title>EmberClaw: Molten Reforge (offline demo)</title>")
h = h.replace('<div id="msg">Strike the anvil.</div>', '<div id="msg">Strike the anvil. (Play-money demo)</div>')
open('emberclaw-standalone.html', 'w').write(h)
print('built emberclaw-standalone.html', len(h), 'bytes')
