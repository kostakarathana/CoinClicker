# Steps

## Step 1

FLARE_RPC_URL — the Flare testnet RPC endpoint (HTTP).
PRIVATE_KEY — your deployer private key (0x... format) with testnet FLR funds.
VRF_COORDINATOR — Chainlink VRF Coordinator contract address on Flare testnet.
VRF_KEYHASH — the gas lane / keyHash for that coordinator (Chainlink doc value).
VRF_SUBSCRIPTION — a Chainlink VRF v2 subscription ID you created and funded with LINK (or the testnet LINK equivalent).

Where to get VRF values
------------------

Chainlink has per-chain docs listing the VRF coordinator address and keyHash for each network (look up "Chainlink VRF v2 Flare testnet"). Also create a VRF subscription in the Chainlink UI (or via the coordinator contract). Fund it with testnet LINK tokens. If you’re unfamiliar with this part I can paste exact commands to create/fund a subscription using ethers once you confirm you’ll run them locally.
