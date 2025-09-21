PROOF.md — deployment & proof

This file collects steps, evidence, and reproduction instructions used for the hackathon submission.

=== Quick summary ===
- Demo: CoinClicker frontend & popup extension. The demo mode deterministically triggers a jackpot overlay on the 50th click and shows a visual coin-payout animation.
- Local contract (demo): 0x5FbDB2315678afecb367f032d93F642f64180aa3
- Local RPC: http://127.0.0.1:8545

=== Artifacts to include in submission ===
- PROOF.md (this file) — contains exact reproducible steps and the local contract address.
- proof-jackpot.gif or proof-jackpot.mp4 — a 15–30s clip showing the demo hitting the 50th-click jackpot (place in repo root).
- Short README snippet (1 paragraph) describing the demo and VRF readiness.

=== How to reproduce locally (exact commands) ===
1) Install dependencies (from repo root):

```bash
cd onchain
npm install
```

2) Start a Hardhat node (terminal A):

```bash
npx hardhat node
```

3) Deploy the demo contract locally (terminal B):

```bash
npm run deploy-local
```

You should see output similar to:
- "LastClickPool deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3"
- Seeded with 1 ETH (local demo funding)


=== VRF readiness (what's complete & what remains) ===
- Completed: VRF-compatible contract `onchain/contracts/LastClickPoolVRF.sol` is present and compiles locally. Deploy script `onchain/scripts/deploy-flare.js` and helper `onchain/scripts/create-vrf-sub.js` are included.
- Remaining (requires network resources / secrets):
  1. A Flare RPC endpoint (FLARE_RPC_URL)
  2. A funded deployer private key with test FLR (PRIVATE_KEY)
  3. Chainlink VRF coordinator address and keyHash for the chosen Flare network
  4. A funded Chainlink VRF subscription id (create with `npm run create-vrf-sub` and fund with test LINK)

When those are available, set `onchain/.env` and run:

```bash
# from onchain/
npm run deploy-flare
```

The deploy script will print the deployed contract address and transaction hash; paste those under "Onchain Flare deploy tx" below.

=== XRPL proof (optional) ===
If you want to provide an XRPL on-chain proof linking the Flare contract address, use the included helper:

```bash
# from repo root
# install xrpl in backend if needed:
cd backend
npm install xrpl
# run proof script (replace seed and address)
node scripts/xrpl_proof.js --address 0xYourContractAddress --seed sYOUR_XRPL_TESTNET_SEED
```

The script will print an XRPL transaction hash. Paste it under "XRPL proof tx" below.

Quick XRPL run steps (copy/paste)
```bash
# from repo root
cd backend
cp .env.example .env    # edit .env and set XRPL_SEED and FLARE_CONTRACT_ADDR
npm install xrpl
node scripts/xrpl_proof.js
```

Paste the returned XRPL tx hash here after running the script:

XRPL proof tx hash: <paste XRPL tx hash here>

=== Submission text (copy/paste) ===
CoinClicker — deterministic demo where the 50th click triggers a jackpot overlay (frontend & popup extension). Local contract and reproduction steps included. VRF integration is implemented and ready for Flare testnet; will deploy to Flare when RPC/private key and a funded Chainlink VRF subscription are available.

Reproduce locally:
1) cd onchain && npm install
2) npx hardhat node
3) npm run deploy-local
4) Load extension popup from `extension/` and trigger clicks until the 50th click.

=== Checklist before submitting ===
- [ ] Add `proof-jackpot.gif` or `proof-jackpot.mp4` to repo root (short clip of the 50th click).
- [ ] Confirm `PROOF.md` is saved and included in submission.
- [ ] (Optional) Run XRPL proof and paste TX hash below.

=== Placeholders for onchain txs (fill after live deploy) ===
- Onchain Flare deploy address: <paste address here>
- Onchain Flare deploy tx hash: <paste tx hash here>
- XRPL proof tx hash: <paste XRPL tx hash here>

=== Notes for judges ===
- The submission includes a full local demo that reproduces the UX exactly (50th-click jackpot). The codebase includes VRF-ready contracts and deployment helpers; final testnet deployment requires a Flare RPC, a funded deployer key, and a funded Chainlink VRF subscription — these are operational steps and can be completed after the hackathon deadline if needed.

---

(End of PROOF.md)
