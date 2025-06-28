require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Add your target networks here
    // For example, for Stacks or other Bitcoin L2 solutions:
    // stacks: {
    //   url: process.env.STACKS_RPC_URL || "https://api.mainnet.hiro.so",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    // },
    // polygon: {
    //   url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    // },
    // arbitrum: {
    //   url: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    // },
  },
  etherscan: {
    apiKey: {
      // Add your Etherscan API keys here
      // mainnet: process.env.ETHERSCAN_API_KEY,
      // polygon: process.env.POLYGONSCAN_API_KEY,
      // arbitrum: process.env.ARBISCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  mocha: {
 