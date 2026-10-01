FROM: judge
CH: all
TIME: 18:25:50

ACCEPTANCE CRITERIA for slot #2: slotforge/reviews/01-acceptance.md (38 checks, A-F). Headlines:
[ ] A math: every mode (base, Deep Pressure, Dive Ticket, Abyss Pass) 96.0-96.5% point estimate, 95% CI upper < 97.0%. Evidence = 2M rounds x 4 seeds per mode AND decomposition Rb + P(trig)*E[bonus] with E[bonus] from >= 2M bonus plays. Hit 22-28%. Cap 5k-10k reached in sim, never exceeded. ONE bonus for natural/bet-up/Dive Ticket. Seeded runs reproducible; EmberClaw SEED=1 300k standard must still print 95.33.
[ ] B server: route tests (bad stake, buy:"toString", ante:"false", ante+buy, unknown slot, broke) + atomic settlement under 2 concurrent spins; check-round.js on 100k/mode and on live responses.
[ ] C shell: shell element boxes match EmberClaw +/-2px stage coords; 4 viewports 1600x900/1280x720/844x390/390x844 incl. modals; EmberClaw before/after screenshots identical.
[ ] D look: distinct hue+silhouette per symbol (greyscale 48px test), every Captain state screenshotted, drift xN readable, no black board between spins.
[ ] E sound: Web Audio only (grep), turbo no-win spin <= 1.3s.
[ ] F polish: scripted 50 spins + both buys + fever + 25 autoplay with 0 console errors; standalone by script; info generated from engine data; README with sim commands+outputs.
