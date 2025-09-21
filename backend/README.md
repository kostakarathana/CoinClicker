Backend POC

Quick steps:

1. cd backend
2. Set environment variables in .env: RPC_URL, PRIVATE_KEY, POOL_ADDRESS
3. npm install
4. npm start

Available endpoints:
- GET /status -> fetch round info
- POST /click -> send a click tx (requires PRIVATE_KEY)
- POST /claim -> call claimWinner (requires PRIVATE_KEY)

XRPL proof helper

You can create an XRPL Testnet proof transaction that references the deployed Flare contract by using the included script `scripts/xrpl_proof.js`.

Set environment variables and run:

```bash
# install xrpl client
npm install xrpl

FLARE_CONTRACT_ADDR=0x... XRPL_SEED="s████" node scripts/xrpl_proof.js
```

The script will submit a tiny self-payment transaction with a Memo containing the Flare contract address and print the XRPL tx hash.
