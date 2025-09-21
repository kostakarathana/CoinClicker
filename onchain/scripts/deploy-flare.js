require('dotenv').config();
const hre = require('hardhat');

async function main() {
  const { FLARE_RPC_URL, PRIVATE_KEY, VRF_COORDINATOR, VRF_KEYHASH, VRF_SUBSCRIPTION } = process.env;
  if (!FLARE_RPC_URL || !PRIVATE_KEY || !VRF_COORDINATOR || !VRF_KEYHASH || !VRF_SUBSCRIPTION) {
    console.error('Missing env. Set FLARE_RPC_URL, PRIVATE_KEY, VRF_COORDINATOR, VRF_KEYHASH, VRF_SUBSCRIPTION');
    process.exit(1);
  }

  // Use the configured network in hardhat config (assumes flareTestnet exists) or use provider override
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying from', await deployer.getAddress());

  const LastClickPoolVRF = await hre.ethers.getContractFactory('LastClickPoolVRF');
  const coordinator = VRF_COORDINATOR;
  const keyHash = VRF_KEYHASH;
  const subId = Number(VRF_SUBSCRIPTION);

  const pool = await LastClickPoolVRF.deploy(coordinator, keyHash, subId);
  await pool.waitForDeployment();
  console.log('LastClickPoolVRF deployed to:', await pool.getAddress());
}

main().catch((err) => { console.error(err); process.exit(1); });
