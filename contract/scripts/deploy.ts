import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PrisonCoin contract...");

  // Get the contract factory
  const PrisonCoin = await ethers.getContractFactory("PrisonCoin");

  // Deploy the contract
  const prisonCoin = await PrisonCoin.deploy();

  // Wait for deployment to finish
  await prisonCoin.waitForDeployment();

  // Get the contract address
  const address = await prisonCoin.getAddress();
  
  console.log(`PrisonCoin deployed to: ${address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 