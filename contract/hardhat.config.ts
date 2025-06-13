import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545", // Using localhost
      chainId: 1337, // Matching your Ganache network ID
    }
  }
};

export default config;
