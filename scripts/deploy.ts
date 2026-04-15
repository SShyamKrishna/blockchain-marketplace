import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const marketplace = await ethers.deployContract("Marketplace");
  await marketplace.waitForDeployment();

  console.log("Marketplace deployed to:", await marketplace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});