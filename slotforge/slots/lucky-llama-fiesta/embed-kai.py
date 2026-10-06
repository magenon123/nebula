#!/usr/bin/env python3
"""Splice kai.css (client CSS) into slot.css after the /* KAI */ marker (leo's art build keeps the part after the marker)."""
import os
d = os.path.dirname(os.path.abspath(__file__)); f = os.path.join(d, 'slot.css'); s = open(f).read()
i = s.index('/* KAI */') + len('/* KAI */'); open(f, 'w').write(s[:i] + '\n' + open(os.path.join(d, 'kai.css')).read())
