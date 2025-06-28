const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying Bitcoin Savings Circle Smart Contract...");

    // Get the contract factory
    const BitcoinSavingsCircle = await hre.ethers.getContractFactory("BitcoinSavingsCircle");
    
    // Deploy the contract
    const bitcoinSavingsCircle = await BitcoinSavingsCircle.deploy();
    
    // Wait for deployment to finish
    await bitcoinSavingsCircle.deployed();

    console.log("✅ Bitcoin Savings Circle deployed to:", bitcoinSavingsCircle.address);
    console.log("📋 Contract Details:");
    console.log("   - Network:", hre.network.name);
    console.log("   - Address:", bitcoinSavingsCircle.address);
    console.log("   - Block Number:", await hre.ethers.provider.getBlockNumber());

    // Verify the contract on Etherscan (if not on local network)
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("🔍 Verifying contract on Etherscan...");
        
        try {
            await hre.run("verify:verify", {
                address: bitcoinSavingsCircle.address,
                constructorArguments: [],
            });
            console.log("✅ Contract verified on Etherscan");
        } catch (error) {
            console.log("⚠️  Contract verification failed:", error.message);
        }
    }

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: bitcoinSavingsCircle.address,
        deployer: (await hre.ethers.getSigners())[0].address,
        deploymentTime: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber(),
    };

    console.log("📄 Deployment Information:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    return bitcoinSavingsCircle;
}

// Handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 