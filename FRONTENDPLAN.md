# CoinClicker — Frontend Plan & Questions

This file will capture detailed frontend decisions before implementation. Please answer the questions below; I will update this file with your responses and use it to scaffold the React web app UI.

## Goals & constraints (summary from previous decisions)
- Platform: React web (Vite + React)
- Keep the UI simple and mobile-responsive (we will primarily target web browsers but ensure good mobile layout).
- Payments & storage: in-app credits (simulated for hackathon) with click events recorded on Flare where feasible; payouts via XRPL (later).
- Must follow hackathon rules: use Flare + XRPL only for blockchain interactions.

---

## Pages & flows
Answer or update each item below.

1. Landing / Home page
   - What must appear on the home page? (e.g., big clickable coin, current pool amount, timer, last clicker name/handle, sign-in button, instructions)
   - Answer:
    - Answer: Big clickable coin in the center, prominently animated and tappable/clickable. Show current money pot (pool) above or beside it, a visual timer, the last-clicker handle, and a clear sign-in / connect wallet button. Include short rules/instructions and viral UI elements (confetti/celebration on wins, animated coin, a live activity feed of recent clicks, and a share button for winners).

2. Authentication / identity
   - How should users identify themselves? Options: simple username, OAuth (Google/GitHub), or wallet connect (Flare-compatible). For demo we can use username-only.
   - Answer:
    - Answer: Primary authentication: Flare-compatible wallet connect (wallet authentication). Additionally provide a temporary "dev mode" toggle for the demo that uses a username and FAKE money to explain the flow and let non-wallet users play.
3. Top navigation / components
   - Items: Home, Leaderboard, My Wallet/Credits, History (on-chain events), About / How it works, Settings
   - Confirm which to include in MVP.
   - Answer:
    - Answer: MVP nav should include Home, Wallet/Credits (show deposited credits), Leaderboard, and History (on-chain events). Add About/How it works as a simple static page. Settings can be minimal or deferred.
4. Click UX details
   - Animations for click, click sound? Haptic (mobile)? Show immediate feedback and optimistic pool update? How many clicks per second per user allowed?
   - Answer:
    - Answer: No bells and whistles for now. Keep a simple visual click animation (coin scales/brief glow) and optimistic pool update. No sounds or haptics initially. We'll limit abuse server-side; for the frontend, throttle rapid-fire clicks visually (e.g., disable briefly while request pending).
5. Timer / round UI
   - Show remaining time (or show "?" if time is randomized)? Show a visual countdown that stutters when randomness triggers? How to represent "random moment" to users while remaining fair?
   - Answer:
    - Answer: Show a "maximum time left" countdown (counts down from 2:00). Communicate clearly that the actual trigger is a random moment within that window (e.g., small note: "Random moment within window"). Keep UI simple and transparent.
6. Pool & economics display
   - Show pool amount in USD + play-credits. Show breakdown: total in pool, house cut (5%), pending gas. Show user balance.
   - Answer:
    - Answer: Keep it simple: show total pool and user's balance/credits. Advanced breakdown (house cut, pending gas) can be added later if needed.
7. Post-win flow
   - When a user wins, show celebratory animation, a "claim" or "payout" button (for demo, instant credit addition), and update history/leaderboard.
   - Answer:
    - Answer: idk yet. Proposal: in dev/demo mode, auto-credit the winner (instant). In wallet/real mode, show a prominent "Claim payout" button that starts the XRPL payout flow; for the hackathon demo we'll enable auto-credit so we can demonstrate the flow quickly.
8. Leaderboard & profile
   - Leaderboard by most wins / most clicks / biggest single win. Profile pages show recent wins and total spent.
   - Answer:

9. Social & sharing
   - Include a share link or a tweet button for winners? Keep this simple for MVP.
   - Answer:

10. Accessibility
    - Color contrast, keyboard navigation, readable fonts, support for screen readers. Any must-have accessibility requirements?
    - Answer:

---

## Technical & architecture questions (frontend-specific)

11. State management
    - Choices: React Context, Zustand, Redux. For an MVP I'll recommend lightweight Zustand or Context + local state.
    - Answer:

12. Real-time updates
    - Clicks and pool size must update in near real-time. Options: WebSocket, Server-Sent Events, or polling. Which do you prefer? (WebSocket recommended)
    - Answer:

13. Time synchronization
    - To avoid timestamp abuse, we'll standardize times from the server and rely on server ordering. Should the client display server-provided timestamps or local approximations?
    - Answer:

14. Randomness UI & proof
    - If we implement provable randomness on Flare (recommended by hackathon), we'll display a link to the randomness proof or tx. Are you OK with linking to raw proofs/tx hashes in the UI?
    - Answer:

15. Offline & intermittent connectivity
    - How should the app behave if user loses connection? Buffer clicks offline or block clicking until reconnected?
    - Answer:

16. Testing & QA
    - Should I add unit tests (Jest + React Testing Library) and a couple of integration tests for the click flow? Or keep manual testing only for the hackathon?
    - Answer:

17. Styling & design system
    - Tailwind CSS, plain CSS modules, or a component library (Mantine, Chakra, Material)? For fast iteration I suggest Tailwind + a small component set.
    - Answer:

18. Build / deploy
    - Preferred hosting: Vercel, Netlify, or manual? Vercel is simplest for a React + Vite app. Are credentials available or should I prepare deploy steps for you to run?
    - Answer:

19. Analytics & error tracking
    - Do you want simple analytics (page views) and Sentry for error tracking? We can add optional lightweight telemetry only.
    - Answer:

20. Localization
    - English only for the hackathon or multi-lingual support?
    - Answer:

---

## UX contract (mini-spec)
Before implementation, confirm this short contract so I can code to it:
- Inputs: user clicks (1 click = 2¢ play credit), user actions (join/top-up/profile), server events (new click, round won, randomness proof).
- Outputs: real-time UI updates: pool amount, timer state, last-clicker, user balance, win notification.
- Error modes: network disconnect, insufficient balance, server-side validation failure.
- Success criteria: clicking updates pool optimistically; when a round ends, UI shows clear winner and history is persisted.

---

Answer the questions above and I'll update this file. After you confirm this file I will draft a minimal page/component map and then scaffold the React app.
