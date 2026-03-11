import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "zircuit",
  chainType: "op",
});

const [owner] = await ethers.getSigners();

const Market = await ethers.getContractFactory("Market");
// address of market
const market = Market.attach("0x029b7aAce1AF916e544393EE7FE0Cb11cA005f37");

const tradeTx = await market.connect(owner).withdrawFee();
await tradeTx.wait();

console.log("Owner withdraws fee hash:", tradeTx.hash);
