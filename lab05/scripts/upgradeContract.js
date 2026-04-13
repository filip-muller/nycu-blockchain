import { network } from "hardhat";

const { ethers } = await network.connect({
    network: "sepolia",
});


const proxyAddress = "0x707b5f83deBf48b518Bf6aD10C1c239ddCf4860a";

// deploy new implementation
const Token2 = await ethers.getContractFactory("Token2");
const token2 = await Token2.deploy();
await token2.waitForDeployment();
console.log("New implementation:", await token2.getAddress());

// point proxy to new implementation
const proxy = await Token2.attach(proxyAddress);
const tx = await proxy.upgradeToAndCall(await token2.getAddress(), "0x");
await tx.wait();

console.log("Contract upgraded, upgrade tx hash:", tx.hash);


const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const implAddress = await ethers.provider.getStorage(proxyAddress, implSlot);
console.log("Implementation after upgrade:", "0x" + implAddress.slice(26));
