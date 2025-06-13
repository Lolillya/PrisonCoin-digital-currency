import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://10.255.255.254:7545", // ✅ This is your Ganache host
      chainId: 5777, // or 5777, depending on your Ganache settings
    }
  }
};

export default config;
