import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "zircuit",
  chainType: "op",
});

const [deployer] = await ethers.getSigners();
console.log("Deploying with address:", deployer.address);

const PrasCoin = await ethers.getContractFactory("PrasCoin");
const prasCoin = await PrasCoin.deploy();
await prasCoin.waitForDeployment();
console.log("PrasCoin deployed to:", await prasCoin.getAddress());
