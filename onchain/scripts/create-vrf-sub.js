require('dotenv').config();
const hre = require('hardhat');

async function main() {
  const provider = new hre.ethers.providers.JsonRpcProvider(process.env.FLARE_RPC_URL);
  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // VRF coordinator address and LINK token address depend on network; expect env to provide COORDINATOR
  const coordinatorAddress = process.env.VRF_COORDINATOR;
  if (!coordinatorAddress) {
    console.error('Set VRF_COORDINATOR in your .env for the target chain');
    process.exit(1);
  }

  console.log('Creating VRF subscription via coordinator:', coordinatorAddress);

  // This script uses ethers to call the coordinator contract to create a subscription.
  const abi = [
    'function createSubscription() external returns (uint64)',
    'function getSubscription(uint64 subId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)'
  ];

  const coord = new hre.ethers.Contract(coordinatorAddress, abi, wallet);
  const tx = await coord.createSubscription();
  const receipt = await tx.wait();

  // parse subscriptionId from events if available (Chainlink emits SubscriptionCreated(uint64 subId, address owner))
  let subId = null;
  for (const e of receipt.events || []) {
    if (e.event === 'SubscriptionCreated' || e.event === 'SubscriptionCreated(uint64,address)') {
      subId = e.args ? e.args[0].toString() : null;
    }
  }

  console.log('tx hash:', receipt.transactionHash);
  if (subId) console.log('created subscription id:', subId);
  else console.log('Subscription created — check coordinator UI or tx logs to obtain subId');
}

main().catch((e) => { console.error(e); process.exit(1); });
