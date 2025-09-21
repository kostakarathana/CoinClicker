TECHNICALS.md

This document explains, concisely and precisely, how CoinClicker works: architecture, key components, onchain integration with Flare + Chainlink VRF, XRPL proof mechanics, reproduction commands, and security notes.

1) High-level architecture
- Frontend (web / popup): Website: React site that displays the coin to be clicked. Extension: HTML/CSS/JS UI that records clicks, shows counts/credits, and triggers the jackpot overlay on the 50th click for demo mode. The extension is deterministic for demo purposes and can call backend endpoints for production flows.
- Backend (optional): Express-based API (backend/index.js) that can record click events, call onchain contract methods (e.g., claimWinner), and run a "keeper" loop to monitor rounds and finalize payouts.
- Onchain (Flare): Solidity contracts in `onchain/contracts/`:
  - `LastClickPool.sol` — local-demo contract used for local testing and easy deploy. Tracks the last click and round, allows claimWinner, and can accept/hold funds.
  - `LastClickPoolVRF.sol` — VRF-enabled contract (Chainlink VRF v2). Requests a random offset from Chainlink VRF Coordinator, waits for fulfillRandomWords, then chooses a winner based on returned randomness.
- Oracle (Chainlink VRF): For production randomness on Flare, the contract requests randomness via Chainlink VRF v2. The project includes `onchain/scripts/create-vrf-sub.js` and `onchain/scripts/deploy-flare.js` to create subscriptions and deploy VRF-enabled contracts.
- External proof (XRPL): After a Flare deploy, the repository includes `backend/scripts/xrpl_proof.js` which submits a small XRPL testnet payment whose Memo contains the Flare contract address; this acts as off-chain proof tying an XRPL tx to the Flare address for hackathon verification.

2) Data & control flows
- Local demo flow (no VRF):
  1. Start local Hardhat node.
  2. Deploy `LastClickPool` with `npm run deploy-local` (script uses Hardhat and seeds the contract with 1 ETH).
  3. Frontend triggers clicks; the frontend demo logic detects the 50th click and shows the jackpot overlay locally (no onchain randomness involved).

- Production flow (intended):
  1. Deployer configures `onchain/.env` with FLARE_RPC_URL, PRIVATE_KEY, VRF_COORDINATOR, VRF_KEYHASH, and VRF_SUBSCRIPTION.
  2. Use `onchain/scripts/create-vrf-sub.js` to create a Chainlink VRF subscription (or create via Chainlink UI) and fund it with LINK tokens for this network.
  3. Run `npm run deploy-flare` to deploy `LastClickPoolVRF.sol` on Flare; the constructor records the coordinator/keyhash/subscription.
  4. When a round ends or the contract's logic requires a random offset, the contract calls `requestRandomWords()` on the Chainlink VRFCoordinatorV2. The coordinator will later call `fulfillRandomWords()` with random words.
  5. `fulfillRandomWords()` sets the randomness-derived offset and allows `claimWinner()` to be executed to transfer the payout.

3) XRPL proof mechanics
- Purpose: create an immutable external ledger entry that references the Flare contract address.
- How it works: `backend/scripts/xrpl_proof.js` connects to the XRPL Testnet, signs a self-payment for a small amount (0.001 XRP) using your XRPL testnet seed, and puts the Flare contract address into the transaction Memo.
- Why it's useful: the XRPL Tx hash is an independent timestamped proof that links an XRPL account and memo to the Flare contract address. Judges can verify the memo and timestamp by querying the XRPL testnet.

4) Files of interest
- `extension/` — popup HTML/CSS/JS demo and Chrome extension assets.
- `onchain/contracts/LastClickPool.sol` — local demo contract.
- `onchain/contracts/LastClickPoolVRF.sol` — Chainlink VRF-enabled contract.
- `onchain/scripts/deploy.js` — local deploy script (deploy-local).
- `onchain/scripts/deploy-flare.js` — deploy VRF-enabled contract to Flare (requires `.env`).
- `onchain/scripts/create-vrf-sub.js` — create Chainlink VRF subscription helper.
- `backend/index.js` — minimal Express backend (status endpoints + keeper loop).
- `backend/scripts/xrpl_proof.js` — XRPL proof helper (requires XRPL seed).
- `PROOF.md` — human-readable reproduction steps and proof artifacts (updated).

5) Reproduction commands (copy/paste)
Local demo:
```bash
# from repo root
cd onchain
npm install
npx hardhat node            # terminal A
npm run deploy-local        # terminal B
# open extension popup or open extension/popup.html in browser and trigger 50 clicks
```
XRPL proof (after setting backend/.env with XRPL_SEED and FLARE_CONTRACT_ADDR):
```bash
cd backend
npm install xrpl
node scripts/xrpl_proof.js
# paste returned tx hash into PROOF.md
```
Flare VRF deploy (when ready):
```bash
cd onchain
# populate onchain/.env with FLARE_RPC_URL, PRIVATE_KEY, VRF_COORDINATOR, VRF_KEYHASH, VRF_SUBSCRIPTION
npm install
npm run create-vrf-sub   # if you need to create a subscription (prints id)
npm run deploy-flare
```

6) Security notes & validation
- Private keys and XRPL seeds must never be committed. Use `.env` files locally and add them to `.gitignore`.
- For production randomness, Chainlink VRF is the recommended option — it provides cryptographic proof that the randomness was not manipulated by the contract owner.
- Signed RNG (server-signed randomness) can be used as a temporary fallback: server signs randomness and contract verifies signature with ecrecover. This reduces but does not eliminate trust.
- Always check the VRF coordinator and keyHash against Chainlink docs for the target network before deploying.

7) Minimal test checklist
- [ ] Local demo reproduces 50th-click jackpot and visual overlay.
- [ ] `npm run deploy-local` prints deployed address as shown in `PROOF.md`.
- [ ] (Optional) Run XRPL proof script and paste tx hash into `PROOF.md`.
- [ ] (Optional) When testnet resources are available, create VRF sub and run `npm run deploy-flare`.

8) Contact points in code
- Frontend: `extension/popup.js` — demo click logic, particle engine, overlay display.
- Onchain: `onchain/contracts/LastClickPoolVRF.sol` — VRF request/fulfill flow and winner selection logic.
- Backend: `backend/scripts/xrpl_proof.js` — the XRPL proof implementation.
