import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "zircuit",
  chainType: "op",
});

const Market = await ethers.getContractFactory("Market");
const market = Market.attach("0x029b7aAce1AF916e544393EE7FE0Cb11cA005f37");

const order = await market.tradeOrders(0);
console.log(order);
