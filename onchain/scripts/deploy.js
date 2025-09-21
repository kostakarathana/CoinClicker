const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with", deployer.address);

  const LastClickPool = await ethers.getContractFactory("LastClickPool");
  // ethers here follows the Hardhat runtime (v6): use ethers.parseEther
  // Deploy and wait for the transaction to be mined
  const pool = await LastClickPool.deploy({ value: ethers.parseEther("1.0") });
  // For ethers v6 the returned contract may not have .deployed(); ensure transaction mined
  await pool.waitForDeployment();
  console.log("LastClickPool deployed to:", await pool.getAddress());
  console.log("Seeded with 1 ETH from deployer");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
