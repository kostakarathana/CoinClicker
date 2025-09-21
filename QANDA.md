# CoinClicker — Q&A

This file will store questions and your answers so I can design and implement the app to match your intent. I reviewed `Flare x XRPL Commons x EasyA Harvard Hackathon.html` in the repo root (did not modify it). Noted: you're building on the Financial track with Flare and XRPL Commons involved; please confirm any chain preferences below.

---

## Project summary (from your brief)
- Game name: CoinClicker
- Platform: React web (Vite + React) targeting web only
- Core mechanic: Each user click costs $0.02 (2¢) USDC and goes into a shared pool. A 2-minute timer runs; at a uniformly random time inside that window the timer "goes off" and the entire pool is awarded to the last person who clicked.

---

## Quick constraints & concerns (notes for later)
- This behaviour resembles gambling (stakes, pooled entries, random winner). App Store / Google Play and legal/regulatory compliance must be considered. Decision needed: live real-money vs testnet/fake tokens vs in-app credit.
- Micro-payments (2¢ per click) are expensive on many chains due to gas. We'll need a batching/off-chain strategy or custodial payments.
- Randomness must be provably fair (on-chain VRF/oracle or auditable commit-reveal). Also consider MEV/last-click manipulation attacks.
- Which token & chain for USDC? XRPL / Flare / EVM / Wrapped USDC? Clarify.

---

## Questions — please answer each; I'll copy your answers below when you reply.

### A. High-level goals
1. What is your priority: a working demo for the hackathon (fast, may use test tokens/off-chain payments) OR a production-ready legal-compliant app (slower, needs KYC/merchant setup)?
   - Answer:
    - Answer: Fast demo — definitely a working demo for the hackathon, but it must also be built so it can be switched to real (on-chain) later. Follow hackathon rules (Flare + XRPL only).

2. Do you plan to use real USDC and real money for the game during or after the hackathon, or should we implement with testnet tokens / simulated balance for the demo?
   - Answer:
    - Answer: Use simulated (play) money for the hackathon demo, but make the system ready to go real later.
3. Which chain/network do you prefer for USDC and payouts? (options: XRPL, Flare, Ethereum L2 (e.g., Arbitrum), Solana, or "off-chain custodial USDC"). If unsure, say so and I can recommend one.
   - Answer:
    - Answer: Must use Flare and XRPL only (per hackathon rules). Nothing else.

### B. Payments & wallet model
4. How do you want to accept the 2¢ per click? Options:
   - (a) On-device wallet prompt per-click (impractical due to UX/gas)
   - (b) Custodial account: users deposit USDC to an app-managed pool and we track off-chain; settle on-chain later
   - (c) In-app credit (users top up with a single transaction, spend credits on clicks)
   Which do you prefer?
   - Answer:
    - Answer: In-app credit (users top up once, spend credits on clicks).
5. Who pays network fees (gas)? App / user / pooled on top of the click price?
   - Answer:
    - Answer: Pooled on top of the click price; take a 5% cut of each click.
6. Do you already have or want integrations with custodial providers (Stripe, Coinbase Commerce, Ramp, Transak) or do you prefer on-chain-only flows?
   - Answer:
    - Answer: Not sure yet.
7. Do users need to authenticate/connect wallets using XRPL / Flare smart accounts (or a standard Web3 wallet like MetaMask / WalletConnect)?
   - Answer:
    - Answer: Not sure — whichever works with Flare. We'll pick an approach that is compatible with Flare smart contracts and XRPL payouts.

### C. Randomness, fairness & anti-abuse
8. How important is provable on-chain randomness vs a simpler server-side RNG for the hackathon demo? (Tradeoffs: on-chain is more auditable but slower/complex; server RNG is fast but needs trust.)
   - Answer:
    - Answer: Important — users should know it's a pool. We should aim for provable/randomness where reasonable, but keep the demo workable.
9. Are you concerned about last-click frontrunning/MEV where someone tries to game being the last click? (If yes, we will design anti-MEV measures.)
   - Answer:
    - Answer: Yes — ideally no one should have an unfair advantage. If you click more you risk losing more.
10. Do you want a public audit log of clicks and winners (e.g., store click events on-chain or on a public server)?
    - Answer:
    - Answer: Yes — store it on-chain (Flare) or use Flare-compatible storage so there's an immutable record; payouts should be instant on XRPL.

### D. Gameplay details and UX
11. Should the 2-minute timer be global for all players (single shared timer), or a rolling timer per-pool/round that restarts after someone wins? Clarify the round lifecycle (start, win, reset).
    - Answer:
    - Answer: Timer starts and runs up to 2 minutes; it can go off at any time and awards the last clicker. Make it secure enough for the demo.
12. What happens if multiple players click at the exact same millisecond? Is the winner the last event received by server, or do we need tie-break rules?
    - Answer:
    - Answer: Tie-break rules apply; use the most precise timestamps possible and server ordering as the tie-breaker.
13. After a win, does the pool reset to $0 and a new 2-minute round start immediately, or is there a cooldown/claim period?
    - Answer:
    - Answer: There should be a cooldown — after a win, reset the pool to 1/20th of the original pool so the pool naturally grows over time.
14. Do you want leaderboards, spectating, or social sharing after wins?
    - Answer:
    - Answer: Maybe — undecided.

### E. Backend, scaling & data
15. Do you already have a preferred backend stack (Node/Express, Firebase, Supabase, Python, serverless) or should I recommend a simple one for the hackathon?
    - Answer:
    - Answer: No preference yet, keep it simple. Important: smart contracts for Flare and XRPL compatibility is a huge priority.
16. Expected concurrency for demo (approx. how many simultaneous players / clicks per second do you expect)? This affects how we handle rate limiting and batching.
    - Answer:
    - Answer: Unknown — could be a lot. Design for reasonable scaling.
17. Do you want click events stored immutably (for auditing) and for how long?
    - Answer:
    - Answer: Ideally immutably on the Flare blockchain as a record.

### F. Security, compliance & legal
18. Are you okay with me flagging the product as a "game-of-chance" that may be considered gambling in some jurisdictions? If you want to proceed with real-money, we should consult legal/KYC — do you have legal resources or want to avoid real-money entirely for the hackathon?
    - Answer:
    - Answer: For the hackathon, avoid real-money — use play money, but still implement smart contracts to meet the hackathon requirements.
19. Are age restrictions required? (Gambling often requires 18+/21+.)
    - Answer:
    - Answer: Yes — require 18+.
20. Will payouts be fiat-offramp (to bank) or crypto-only? Any tax/AML considerations you want to plan for?
    - Answer:
    - Answer: USDC payouts via XRPL as required by the hackathon.

### G. Hackathon deliverables, priorities & timeline
21. What's the minimum demo you want to ship for the hackathon closing submission? (e.g., clickable prototype with simulated USDC, or a full payment flow + live random winner + on-chain settlement)
    - Answer:
    - Answer: As far as we can get in the time — follow hackathon requirements. Aim for the most complete demo possible within time.
22. Any features you view as "nice to have" vs "must have"? Please list top 3 must-haves for the hackathon demo.
    - Answer:
    - Answer: Must-have: meet hackathon requirements (Flare + XRPL), test/demo-ready, and on-chain smart contracts that demonstrate the payment/payout logic for eligibility.
23. Who's on your team and what are their roles? (Developer, designer, backend, devops, legal, pitch person)
    - Answer:
    - Answer: You have one other non-tech teammate (marketing/research). You're the technical lead; I'll assume you want me to coordinate implementation but ask high-level approvals first.

### H. Testing & credentials
24. Do you have test USDC accounts, API keys, or wallets already available for integration testing? If not, do you want me to use recommended testnets and create example keys locally?
    - Answer:
    - Answer: Not yet — I'll ask you before creating or using any keys.
25. Preferred contact/collaboration channel (Slack/Discord/Email/GitHub issues) and the best time zone for quick sync during hackathon?
    - Answer:
    - Answer: Not specified — we'll coordinate here. Also: DO NOT DO ANYTHING without asking about the high-level first.

---

Notes / assumptions I'll make unless you tell me otherwise:
- For the hackathon demo I'll recommend using testnet tokens or a simulated custodial wallet to avoid App Store and legal friction.
-- We'll aim for a simple backend (Node + Express + a small managed DB like Supabase or Firebase) and a React web app (Vite + React) to hit the contest deadline.

---

When you answer these questions in this chat, I'll update this file with your responses and proceed to design a minimal spec and scaffold.

