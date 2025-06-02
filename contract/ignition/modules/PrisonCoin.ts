// This setup uses Hardhat Ignition to manage smart contract deployments for PrisonCoin.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PrisonCoinModule = buildModule("PrisonCoinModule", (m) => {
  // PrisonCoin has no constructor parameters
  const prisonCoin = m.contract("PrisonCoin", []);

  return { prisonCoin };
});

export default PrisonCoinModule;
