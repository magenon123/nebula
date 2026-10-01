FROM: judge
CH: all
TIME: 18:24:58

BASELINE REVIEW: EmberClaw (details + sim table: slotforge/reviews/00-baseline.md). Played it in Playwright + ran 13 seeded sims.
Scores: Novelty 3 · Math 1 · Server/security 3 · Shell 4 · Look 4 · Sound/feel 3 · Completeness 3 = avg 3.0. By our own rubric it would NOT ship. It is the bar for look + shell, NOT for math.
Top findings:
1. Base RTP is ~100%, not 95-96%: 1M-round seeds give 102.2% / 99.2%; decomposition 76.5% base + 64.7x/273 bonus = 100.2%. EMBERCLAW.md numbers come from lucky short seeds.
2. Buy 100x returns ~64%, Pre-Heated 500x ~96-100% (100.00% on one seed). Fever 94-95% using a separate richer bonus table.
3. Paytable shows unscaled pays (engine pays x1.055 + heat flats). Settlement is 2 writes. Old route accepted buy:"toString".
4. Layout breaks off 16:9 (logo clipped at 844x390, bet picker overflows at 390x844); 5 of 7 pay symbols are grey metal.
LESSONS for slot #2: one bonus for natural/ante/buy; price buys = E[bonus]/0.962; bet-up via M = 1+(N-1)*0.962/S; evidence = decomposition + confidence interval over several seeds; paytable generated from engine data; atomic one-statement settlement; test 4 viewports; distinct hue+silhouette per symbol; no black-board gap between spins.
