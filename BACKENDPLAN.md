# Backend Plan for CoinClicker

## Purpose
This document describes a recommended backend architecture, API surface, data models, real-time design, blockchain integration options, persistence choices, security and anti-cheat recommendations, deployment suggestions, and a list of clarifying questions that need answers before implementation.

## High-level goals
- Make payouts authoritative and persistent (configurable: demo-only client-side mode vs production server-side).
- Provide a real-time live feed to all connected clients announcing payouts and leaderboard updates.
- Support wallet-based authentication (XRPL/Flare wallets) as primary identity for on-chain interactions.
- Integrate with Flare/XRPL for optional on-chain payouts; keep off-chain settlement option for MVP.
- Keep the backend minimal for initial MVP: record clicks/events, validate winners, persist payout events, broadcast live events.

## Suggested stack
- Runtime: Node.js 18+
- Framework: Fastify (small, fast) or Express if team prefers familiarity.
- Real-time: WebSocket using ws or Socket.IO (ws for lightweight, Socket.IO if you need built-in reconnection/rooms/ack semantics).
- DB: PostgreSQL for production; SQLite for local dev or test. Use Prisma as ORM for developer ergonomics and migrations.
- Auth: Wallet-based auth (SIWE-like flow) using XRPL/Flare message signing; fallback: session tokens for demo-users.
- Optional blockchain tooling: use ethers.js + @flarenetwork/flare-periphery-contract-artifacts (already in repo) for Flare contract ABIs and address resolution.
- Containerization: Dockerfile + docker-compose for local dev (Postgres, backend). Optional: Use Render/Vercel for hosting (Vercel for front-end, Render for WebSocket+backend), or Heroku/AWS Elastic Beanstalk.

## API surface (MVP)
- POST /api/v1/click
  - Body: { walletAddress?: string, sessionId?: string, clientNonce?: string }
  - Behavior: Record click attempt; if walletAddress present, associate with that account. Rate-limit and dedupe per IP/session. Return: { ok: true, clicks: number }
- GET /api/v1/balance/:account
  - Returns user balance and recent payouts (paginated).
- GET /api/v1/leaderboard?limit=50
  - Returns top players, recent winners.
- POST /api/v1/admin/payout
  - Admin-only endpoint to register a payout (amount, recipient, metadata). Used for manual testing.
- POST /api/v1/auth/wallet-challenge
  - Start wallet-auth challenge -> returns message to sign.
- POST /api/v1/auth/verify
  - Verify signed message; exchange for a short-lived JWT cookie or token.

WebSocket channel (path /ws)
- Client connects and subscribes to channels: `feed` (global live feed), `account:{address}` (personal). Messages:
  - feed: { type: 'payout', payload: { amount, account, txHash?, demo: bool, id, timestamp } }
  - feed: { type: 'tick', payload: { metric, value } }
  - account: { type: 'balance', payload: { balance } }

Event design
- Clicks are recorded as append-only events in DB. A server-side process computes deterministic winners (if required) or accepts triggers from an oracle/cron job.
- PayoutEvent record stores: id, account, amount, currency, source (demo|server|onchain), txHash (nullable), metadata JSON, createdAt.

## Data models (sketch)
- User
  - id (uuid)
  - walletAddress (nullable)
  - displayName
  - createdAt
- Session
  - id (uuid)
  - userId (nullable)
  - demoClicks (int)
  - lastClickAt
- ClickEvent
  - id (uuid)
  - sessionId
  - userId (nullable)
  - ipHash
  - userAgent
  - createdAt
- PayoutEvent
  - id (uuid)
  - sessionId
  - userId (nullable)
  - walletAddress
  - amount (decimal)
  - currency (string)
  - txHash (nullable)
  - source (enum demo|server|onchain)
  - metadata JSON
  - createdAt

## Blockchain integration options
- Option A (MVP, recommended): Off-chain authoritative backend + optional on-chain settlement
  - Record payouts on backend; if user wants, provide a server-initiated on-chain transaction using server's hot wallet or guide users to claim on-chain via signed messages.
  - Pros: Simpler, cheaper, easier to develop.
  - Cons: Centralized trust.
- Option B (On-chain payouts): Integrate with Flare/XRPL for server-initiated or contract-based payouts
  - Use @flarenetwork/flare-periphery-contract-artifacts to resolve addresses/ABIs, and ethers.js to interact with Flare.
  - Consider gas/fee model and require a funded server-account or use a multisig admin process.
  - Use Flare-hardhat-starter for local contract dev and testing (repo contains references).

## Security & anti-cheat
- Do not trust client-side counters. Server must validate clicks, rate-limit per IP, per session, per wallet.
- Use captcha or device-fingerprint for suspicious patterns.
- Implement bot-detection heuristics and temporary bans.
- Log suspicious events to a separate audit table and alert via Slack/Email.
- For on-chain payouts, use multisig or manual approval for large amounts.

## Real-time scaling
- For <1k concurrent users: a single Node.js process with ws is fine.
- For >1k: use a pub/sub (Redis) and scale horizontally. Socket.IO + Redis adapter or ws + Redis pub/sub for broadcasting.
- Add sticky sessions or use centralized message bus (Redis Streams, NATS) for event distribution.

## Observability & testing
- Add logging (pino/winston) + structured JSON logs.
- Add metrics (Prometheus) and health endpoints.
- Create unit tests for core logic (click validation, payout computation) and integration tests for WebSocket feed.

## Dev flow
1. Answer clarifying questions below.
2. Scaffold project with Fastify + ws + Prisma + Postgres.
3. Create migrations: users, sessions, click_events, payout_events, audit_logs.
4. Implement wallet-based auth challenge and click API + rate-limits.
5. Implement WebSocket feed broadcasting.
6. Add admin endpoints and simple UI for manual payouts.
7. Add tests and basic Docker/dev-compose.

## Clarifying questions (must answer before coding)
1. Payout semantics: Should payouts be authoritative server-side and shared across users, or stay client-only/demo for now?
2. Real payouts vs simulated balances: Do you want real monetary/token transfers integrated for the hackathon, or mocked/simulated balances for MVP?
3. Authentication: Will users sign-in with wallets (XRPL/Flare) or is anonymous/session-based play acceptable for MVP?
4. On-chain chain preference: Are we targeting Flare, XRPL, or both for eventual on-chain payouts/settlement?
5. Scale expectations: What's the expected concurrent user count for launch? This affects WebSocket scaling and DB sizing.
6. Compliance/privacy: Are there requirements for storing wallet addresses, emails, or PII? Retention policies?
7. Admin controls: Do you want a UI for manual payout approvals, or will a CLI/admin-only API suffice?
8. MVP deadline: What is the deadline and the minimal feature set required by then?
9. Third-party integrations: Any monitoring (Datadog), SSO, or payment processors required?
10. Risk tolerance for centralization: Is it acceptable if the backend mints/authorizes payouts centrally and later migrates to on-chain settlement?

## Next steps once questions answered
- I'll scaffold the backend repo, add Prisma models and migrations, implement auth & click endpoints, and wire a WebSocket feed. I'll include a README with run steps and sample smoke tests.


---

Requirements coverage:
- Read repo root HTML resources: Done (Notion export, npm, GitHub README saved locally).
- Produce BACKENDPLAN.md with architecture and clarifying questions: Done (this file).

