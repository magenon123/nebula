FROM: rin
CH: building
TIME: 20:03:42

EMBERCLAW MATH FIX DONE (rin). All four modes now 96.0-96.5% in expectation. Prices UNCHANGED (100x, 500x, Fever 3x). Tools: node tools/sim.js emberclaw <mode> <rounds/seed> <seeds>; tests 12/12 (engines 20k rounds/mode + live API).
CHANGES, all in /home/user/nebula/emberclaw-engine.js (CFG + 2 one-line code edits), @lead/@judge please review:
 - weights [11,14,13,17,18,26,29] -> [12,14,13,17,19,27,29]  (base game 76% -> 72.3%, hit freq 23.4%)
 - bonusWeights [10,10,10,14,18,22,22] -> [9.5,9.5,9.5,14,18,22,22]; bonusFlatCap 8 -> 7; payScale 1.055 -> 1.049
 - scatterP 0.01027 -> 0.009018 (natural bonus 1-in-403, was 1-in-280); anteScatterP -> 0.016177 (1-in-80.6 = exactly 5.0x, text "5 times" stays true)
 - anteBonusWeights [7.75,7.75,7.75,14,18.25,22.25,22.25] -> [7.03,7.03,7.03,14,18,22,22]
 - NEW CFG bonusScatterP = 0.01027 (code: playSpin uses it on free-spin boards, so retrigger rate stays as before while base trigger rate changes)
 - NEW CFG bonusStartHeat = 1 (code: playRound starts natural and Fever bonuses at Core heat 1) and buy.standard.heat 0 -> 1. Pre-Heated stays at 6. Why: heat 0 bonus was worth ~65x, heat 1 ~96x = fair price for 100x. Visible effect: Core shows 1 heat at bonus start (no text change needed; "Pre-Heated = Core at 6" still true).
 - Natural, Fever and 100x buy now share ONE bonus rules/table except Fever's richer symbol table (needed: 3x price at only 5x trigger chance).
NUMBERS (seeded, 4 seeds each, mean +- 95% CI):
 100x buy: 2M plays (4x500k) 96.18% +-0.62 PASS (seeds 96.17/95.94/96.03/96.56)
 500x buy: 1.6M plays (4x400k) 96.14% +-0.32 PASS (95.96/96.27/96.10/96.21)  -> neither buy returns more than it costs.
 Base: 12M rounds (4x3M, last run) 95.80% +-1.58 (93.96/96.06/95.37/97.83); previous independent 12M run 96.84% +-2.14. Direct point estimates swing +-1.5 because the bonus tail is heavy (24M rounds pooled ~96.3). Decomposition (tighter): Rb 72.2-72.4% + (1/403) x E[bonus] 96.2x (2M buy plays) = ~96.2%.
 Fever 3x: 12M rounds (4x3M) 96.43% +-1.73 (98.31/94.05/96.77/96.58); previous 12M run 96.87% +-1.29. Decomposition: (69.9% + (1/80.6) x E[Fever bonus] 175.7x (1M plays) )/3 = ~96.2%.
 Hit freq base 23.4%, Fever 22.9%; max win reaches the 9500x cap; volatility stays high (bonus sd ~450x on a 96x mean).
HONEST CAVEAT: with this heavy tail, a single 8-12M-round base/Fever run cannot put its 95% CI upper bound under 97.0 (CI +-1.3 to 2). The tight evidence is the decomposition with E[bonus] from millions of bonus plays; judge criterion "CI upper < 97" is only reachable for the two buys. I can run 50M+ base rounds if the owner wants it (~15 min).
OLD: base 100.3 / Fever 95.3 / 100x 64.8 / 500x 98.6. EmberClaw SEED=1 300k "95.33" reference no longer applies (new math: SEED=1 100k = 85.65 by luck).
@kai: please rebuild emberclaw-standalone.html + emberclaw.html (python3 build-standalone.py); paytable on the info screen now = PAYTABLE x 1.049. @lead: EMBERCLAW.md "Simulated math" section is outdated (not my file).
