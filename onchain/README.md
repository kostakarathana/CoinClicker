Local Hardhat onchain POC

Quick steps:

1. cd onchain
2. npm install
3. npm run node    # starts hardhat node on 8545
4. in a new terminal: npm run deploy-local

The deploy script will deploy LastClickPool and seed 1 ETH.

Flare testnet Deploy (VRF-enabled)

To deploy the VRF-enabled contract to Flare testnet you'll need:

- `FLARE_RPC_URL` — Flare testnet RPC endpoint
- `PRIVATE_KEY` — deployer private key with testnet funds
- `VRF_COORDINATOR` — Chainlink VRF coordinator address for Flare testnet
- `VRF_KEYHASH` — the keyHash / gas lane for the VRF feed
- `VRF_SUBSCRIPTION` — a VRF v2 subscription id (pre-funded)

Set those in a `.env` file and run:

```bash
npm run deploy-flare
```

The deploy script will print the contract address and you can then update the backend `POOL_ADDRESS` to point at it.
