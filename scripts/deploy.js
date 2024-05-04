/* eslint-disable no-undef */
const fs = require('fs');
const { ethers } = require('hardhat');
async function main() {
  const [deployer, user1] = await ethers.getSigners();
  // We get the contract factory to deploy
  const DecentralizedSocialAppFactory = await ethers.getContractFactory("DecentralizedSocialApp");
  // Deploy contract
  const decentralizedSocialApp = await DecentralizedSocialAppFactory.deploy();
  // Save contract address file in project
  const contractsDir = __dirname + "/../src/contractsData";
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/decentralizedSocialApp-address.json`,
    JSON.stringify({ address: decentralizedSocialApp.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync("DecentralizedSocialApp");

  fs.writeFileSync(
    contractsDir + `/decentralizedSocialApp.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
  console.log("DecentralizedSocialApp deployed to:", decentralizedSocialApp.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
