import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "zircuit",
  chainType: "op",
});

const [deployer] = await ethers.getSigners();
console.log("Deploying with address:", deployer.address);

const Token1 = await ethers.getContractFactory("Token1");
const token1 = await Token1.deploy();
await token1.waitForDeployment();
console.log("Token1 deployed to:", await token1.getAddress());

const Token2 = await ethers.getContractFactory("Token2");
const token2 = await Token2.deploy();
await token2.waitForDeployment();
console.log("Token2 deployed to:", await token2.getAddress());

const Market = await ethers.getContractFactory("Market");
const market = await Market.deploy(
  await token1.getAddress(),
  await token2.getAddress()
);
await market.waitForDeployment();
console.log("market deployed to:", await market.getAddress());
