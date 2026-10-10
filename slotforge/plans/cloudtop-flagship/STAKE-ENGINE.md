# Cloudtop Tea House -> Stake Engine submission (R3) - status

## BLOCKER (found 2026-10-10, not resolved)
The cloud environment's network policy denies `stakeengine.org` (curl: `CONNECT tunnel failed, response 403`; WebFetch: ENOTFOUND). Without the official docs
(https://stakeengine.org/docs: Math SDK + Web SDK) nothing about file formats, SDK interfaces or the submission process may be implemented: the brief forbids guessing.
FIX (owner/authorized adult): edit the environment's Network access and add `stakeengine.org` (and the SDK source hosts the docs point to, e.g. github.com/StakeEngine/*, its npm/pypi packages) under Allowed domains, keep "Allow package managers" ticked
(steps: https://code.claude.com/docs/en/cloud-environments#network-access). Then start a new session and say: "continue R3 in slotforge/plans/cloudtop-flagship/STAKE-ENGINE.md".

## PLAN once docs are readable (2 agents max; lead + 1)
1. Read docs; write a gap analysis here (required math artifacts, book/lookup-table formats, RGS/Web SDK interface, project layout, test tools, submission steps, eligibility/account blockers).
2. Math: port `slotforge/engines/cloudtop-tea-house.js` (deterministic, seedable; modes: base, FS LUCK (3x), buys tin 60x / fs 21x / super 75x) to the SDK's required artifacts; verify RTP per mode with the SDK tools; keep Tin Rush buy-only, max win 5000x.
3. Frontend: keep art/animation/audio; replace the standalone play-money engine call (`SLOT_ENGINE.playRound`) and balance/bet handling with the Web SDK adapter; keep standalone build as fallback (do not overwrite).
4. Test: SDK tests/build, load, spins, every bonus, max win, min/max bet, refresh, mobile.
5. Report verified vs assumed items + submission steps + external requirements (account, legal, payout eligibility).
## Do not claim acceptance. Do not touch the other five games.
