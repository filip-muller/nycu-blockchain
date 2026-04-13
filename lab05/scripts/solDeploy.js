import { network } from "hardhat";

const { ethers } = await network.connect({
    network: "sepolia",
});

const Deploy = await ethers.getContractFactory("Deploy");
const deploy = await Deploy.deploy();
await deploy.waitForDeployment();

const StakeForNFT = await ethers.getContractFactory("StakeForNFT");
const stake = await StakeForNFT.deploy();
await stake.waitForDeployment();
console.log("My stake address:", await stake.getAddress());

const proxyAddress = await deploy.proxy();
const implAddress = await deploy.implementation();
const decimals = await deploy.decimals();

console.log("Implementation deployed to:", implAddress);
console.log("Proxy deployed to:", proxyAddress);
console.log("Decimals:", decimals);
