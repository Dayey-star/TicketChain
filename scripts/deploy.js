const path = require("path");
const { ethers, network, artifacts } = require("hardhat");

async function main() {
  // Warn if deploying to the Hardhat Network
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which " +
      "gets automatically created and destroyed every time. Use the Hardhat " +
      "option '--network localhost' if you intended to use the Hardhat Network."
    );
  }

  // Get the deployer's account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the TicketChain contract
  const TicketChain = await ethers.getContractFactory("TicketChain");
  const ticketChain = await TicketChain.deploy();
  await ticketChain.deployed();

  console.log("TicketChain contract deployed to:", ticketChain.address);

  // Save the contract's artifacts and address in the frontend directory
  await saveFrontendFiles(ticketChain);
}

async function saveFrontendFiles(ticketChain) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "src", "contracts");

  // Create the contracts directory if it doesn't exist
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Save the contract address to a JSON file
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ TicketChain: ticketChain.address }, undefined, 2)
  );

  // Read the contract artifact and save it to a JSON file
  const TicketChainArtifact = await artifacts.readArtifact("TicketChain");
  fs.writeFileSync(
    path.join(contractsDir, "TicketChain.json"),
    JSON.stringify(TicketChainArtifact, null, 2)
  );
}

// Execute the main function and handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });
