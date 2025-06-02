import { expect } from "chai";
import { ethers } from "hardhat";
import { PrisonCoin } from "../typechain-types/PrisonCoin";

describe("PrisonCoin", function () {
  let prisonCoin: PrisonCoin;
  let operator: any;
  let inmate: any;
  let other: any;

  beforeEach(async function () {
    [operator, inmate, other] = await ethers.getSigners();
    const PrisonCoinFactory = await ethers.getContractFactory("PrisonCoin");
    prisonCoin = (await PrisonCoinFactory.deploy()) as PrisonCoin;
    await prisonCoin.waitForDeployment();
  });

  it("should set the deployer as operator", async function () {
    expect(await prisonCoin.operator()).to.equal(operator.address);
  });

  describe("Inmate Registration", function () {
    it("should allow operator to register an inmate", async function () {
      await expect(prisonCoin.registerInmate(inmate.address))
        .to.emit(prisonCoin, "InmateRegistered")
        .withArgs(inmate.address);
      expect(await prisonCoin.isInmate(inmate.address)).to.be.true;
    });

    it("should not allow non-operator to register an inmate", async function () {
      await expect(
        prisonCoin.connect(inmate).registerInmate(other.address)
      ).to.be.revertedWith("Only operator can perform this action");
    });

    it("should not allow duplicate inmate registration", async function () {
      await prisonCoin.registerInmate(inmate.address);
      await expect(
        prisonCoin.registerInmate(inmate.address)
      ).to.be.revertedWith("Already registered");
    });
  });

  describe("Token Deposit", function () {
    beforeEach(async function () {
      await prisonCoin.registerInmate(inmate.address);
    });

    it("should allow operator to deposit tokens for an inmate", async function () {
      await expect(prisonCoin.depositTokens(inmate.address, 100))
        .to.emit(prisonCoin, "TokensDeposited")
        .withArgs(inmate.address, 100);
      expect(await prisonCoin.balances(inmate.address)).to.equal(100);
    });

    it("should not allow deposit for unregistered inmate", async function () {
      await expect(
        prisonCoin.depositTokens(other.address, 100)
      ).to.be.revertedWith("Inmate not registered");
    });

    it("should not allow non-operator to deposit tokens", async function () {
      await expect(
        prisonCoin.connect(inmate).depositTokens(inmate.address, 100)
      ).to.be.revertedWith("Only operator can perform this action");
    });
  });

  describe("Item Purchase", function () {
    beforeEach(async function () {
      await prisonCoin.registerInmate(inmate.address);
      await prisonCoin.depositTokens(inmate.address, 200);
    });

    it("should allow operator to make a purchase for an inmate", async function () {
      await expect(
        prisonCoin.purchaseItem(inmate.address, "Soap", 50)
      )
        .to.emit(prisonCoin, "ItemPurchased")
        .withArgs(inmate.address, "Soap", 50);
      expect(await prisonCoin.balances(inmate.address)).to.equal(150);
    });

    it("should not allow purchase for unregistered inmate", async function () {
      await expect(
        prisonCoin.purchaseItem(other.address, "Soap", 10)
      ).to.be.revertedWith("Inmate not registered");
    });

    it("should not allow purchase if balance is insufficient", async function () {
      await expect(
        prisonCoin.purchaseItem(inmate.address, "TV", 500)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("should not allow non-operator to make a purchase", async function () {
      await expect(
        prisonCoin.connect(inmate).purchaseItem(inmate.address, "Soap", 10)
      ).to.be.revertedWith("Only operator can perform this action");
    });
  });

  describe("Balance View", function () {
    it("should return the correct balance for an inmate", async function () {
      await prisonCoin.registerInmate(inmate.address);
      await prisonCoin.depositTokens(inmate.address, 123);
      expect(await prisonCoin.getBalance(inmate.address)).to.equal(123);
    });
  });
}); 