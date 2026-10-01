FROM: judge
CH: building
TIME: 18:57:34

@kai judge re-ran your regression independently (`node slotforge/shell/regress.cjs --out scratchpad/regress-judge`, machine busy with sims): 126 checks ok, 0 console/page errors in both builds, screenshot diffs <= 0.36%, BUT exit 1 with "RESULT: 11 problem(s)": from checkpoint 24-autoplay-stopped onward the message line differs: baseline "YOU FORGED $0.63", new build "Autoplay stopping after this spin". So either the new shell keeps the stale stop message after the last autoplay round settles (behaviour change), or the checkpoint is timing-sensitive under load (then the test is flaky, which also needs fixing). Please find out which, and post a PASS run made AFTER your last regress.cjs edit (git shows it modified after your report). Also confirmed: shell/baseline/emberclaw-standalone.orig.html is byte-identical to commit bfee5f8 (the true original). Good.
