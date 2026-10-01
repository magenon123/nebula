#!/usr/bin/env bash
# SlotForge group chat. File based: one file per message in ./chat, so agents never overwrite each other.
#   ./chat.sh who                              roster + channels
#   ./chat.sh post <you> <channel> <message>   say something (use "-" as message to read it from stdin)
#   ./chat.sh inbox <you>                      NEW messages for you since you last asked (marks them read)
#   ./chat.sh read <you> [channel] [N]         last N messages (default 25) without marking anything read
#   ./chat.sh export                           write transcript.md + transcript.html
# Channels: all | planning | building | handoff | dm-<name>
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; CH="$DIR/chat"; mkdir -p "$CH"
ROSTER="maya leo kai rin judge lead"
members() { case "$1" in
  all) echo "$ROSTER";;
  planning) echo "maya leo judge lead";;
  building) echo "kai rin judge lead";;
  handoff) echo "maya leo kai rin judge lead";;
  dm-*) echo "${1#dm-} lead";;
  *) return 1;; esac; }
in_list() { for x in $2; do [ "$x" = "$1" ] && return 0; done; return 1; }
can_see() { # who channel sender
  local me="$1" ch="$2" from="$3"
  [ "$me" = "lead" ] && return 0
  [ "$me" = "$from" ] && return 0
  in_list "$me" "$(members "$ch" 2>/dev/null || true)"; }
fmt() { # file
  local f="$1" from ch t; from=$(sed -n 's/^FROM: //p' "$f"); ch=$(sed -n 's/^CH: //p' "$f"); t=$(sed -n 's/^TIME: //p' "$f")
  printf '[%s] #%s  %s\n' "$t" "$ch" "$from"; sed '1,/^$/d' "$f" | sed 's/^/    /'; echo; }
meta() { sed -n "s/^$2: //p" "$1" | head -1; }
cmd="${1:-}"; shift || true
case "$cmd" in
  who) echo "Roster: $ROSTER"; for c in all planning building handoff; do echo "  #$c: $(members $c)"; done; echo "  dm-<name>: that person + lead";;
  post)
    from="${1:?from}"; ch="${2:?channel}"; shift 2; msg="$*"; [ "$msg" = "-" ] && msg="$(cat)"
    in_list "$from" "$ROSTER" || { echo "unknown sender '$from' (roster: $ROSTER)" >&2; exit 1; }
    members "$ch" >/dev/null 2>&1 || { echo "unknown channel '$ch' (all|planning|building|handoff|dm-<name>)" >&2; exit 1; }
    case "$ch" in dm-*) in_list "${ch#dm-}" "$ROSTER" || { echo "unknown dm target" >&2; exit 1; };; *) in_list "$from" "$(members $ch)" || { echo "$from is not in #$ch" >&2; exit 1; };; esac
    f="$CH/$(date +%s%N)-$from.msg"
    { echo "FROM: $from"; echo "CH: $ch"; echo "TIME: $(date '+%H:%M:%S')"; echo; echo "$msg"; } > "$f"
    echo "posted to #$ch";;
  inbox)
    me="${1:?you}"; cur="$CH/.cursor-$me"; last=0; [ -f "$cur" ] && last=$(cat "$cur"); n=0; newest=$last
    for f in $(ls "$CH"/*.msg 2>/dev/null | sort); do
      ts=$(basename "$f" | cut -d- -f1); [ "$ts" -gt "$last" ] || continue
      from=$(meta "$f" FROM); ch=$(meta "$f" CH); newest=$ts
      [ "$from" = "$me" ] && continue
      can_see "$me" "$ch" "$from" || continue
      fmt "$f"; n=$((n+1))
    done
    echo "$newest" > "$cur"; [ "$n" -gt 0 ] || echo "(no new messages)";;
  read)
    me="${1:?you}"; ch="${2:-}"; N="${3:-25}"; out=""
    for f in $(ls "$CH"/*.msg 2>/dev/null | sort); do
      from=$(meta "$f" FROM); c=$(meta "$f" CH)
      [ -z "$ch" ] || [ "$ch" = "$c" ] || continue
      can_see "$me" "$c" "$from" || continue
      out="$out$f
"
    done
    [ -n "$out" ] || { echo "(empty)"; exit 0; }
    printf '%s' "$out" | tail -n "$N" | while read -r f; do fmt "$f"; done;;
  export)
    python3 - "$CH" "$DIR" <<'PY'
import sys, os, html, glob
ch, d = sys.argv[1], sys.argv[2]
msgs = []
for f in sorted(glob.glob(os.path.join(ch, '*.msg'))):
    raw = open(f, encoding='utf-8').read(); head, _, body = raw.partition('\n\n')
    m = dict(l.split(': ', 1) for l in head.splitlines() if ': ' in l); m['body'] = body.strip(); msgs.append(m)
open(os.path.join(d, 'transcript.md'), 'w').write('\n\n'.join(f"**{m['FROM']}** in #{m['CH']} ({m['TIME']})\n\n{m['body']}" for m in msgs) or '(no messages)')
colors = {'maya': '#e8590c', 'leo': '#7048e8', 'kai': '#1c7ed6', 'rin': '#0b7285', 'judge': '#c92a2a', 'lead': '#495057'}
chans = sorted({m['CH'] for m in msgs})
rows = ''.join(f"<div class='m' data-ch='{html.escape(m['CH'])}'><div class='h'><b style='color:{colors.get(m['FROM'],'#333')}'>{html.escape(m['FROM'])}</b> <span class='c'>#{html.escape(m['CH'])}</span> <span class='t'>{html.escape(m['TIME'])}</span></div><pre>{html.escape(m['body'])}</pre></div>" for m in msgs)
btns = ''.join(f"<button onclick=\"f('{c}')\">#{c}</button>" for c in chans)
open(os.path.join(d, 'transcript.html'), 'w', encoding='utf-8').write(f"""<!doctype html><meta charset=utf-8><title>SlotForge chat</title><style>
body{{font:15px system-ui,sans-serif;background:#14100f;color:#eee;max-width:860px;margin:24px auto;padding:0 16px}}
h1{{font-size:20px}}button{{background:#2b1f1b;color:#eee;border:1px solid #5a4338;border-radius:8px;padding:6px 12px;margin:0 6px 6px 0;cursor:pointer}}
.m{{background:#1f1714;border:1px solid #3a2b25;border-radius:12px;padding:10px 14px;margin:10px 0}}.h{{font-size:13px;margin-bottom:4px}}.c{{color:#f59f00}}.t{{color:#888}}
pre{{white-space:pre-wrap;margin:0;font:14px/1.5 system-ui,sans-serif}}</style><h1>SlotForge team chat</h1>
<div><button onclick="f('')">all channels</button>{btns}</div>{rows or '<p>(no messages yet)</p>'}
<script>function f(c){{document.querySelectorAll('.m').forEach(e=>e.style.display=(!c||e.dataset.ch===c)?'':'none')}}</script>""")
print('wrote transcript.md and transcript.html (%d messages)' % len(msgs))
PY
    ;;
  *) sed -n '2,10p' "$0"; exit 1;;
esac
