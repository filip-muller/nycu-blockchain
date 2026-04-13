import { network } from "hardhat";

const { ethers } = await network.connect({
    network: "sepolia",
});

const proxyAddress = "0x707b5f83deBf48b518Bf6aD10C1c239ddCf4860a";
const stakeAddress = "0xa73caE55DF45E8902c5A9df832D1705d6232f61E";

const Token2 = await ethers.getContractFactory("Token2");
const token = await Token2.attach(proxyAddress);

const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const implAddress = await ethers.provider.getStorage(proxyAddress, implSlot);
console.log("Current implementation:", "0x" + implAddress.slice(26));

const [owner] = await ethers.getSigners();

console.log("Owner balance:", await token.balanceOf(owner));
console.log("Stake contract balance:", await token.balanceOf(stakeAddress));

const tx = await token.russianRoulette([owner, stakeAddress]);
await tx.wait();

console.log("Roulette hash:", tx.hash);

console.log("Owner balance:", await token.balanceOf(owner));
console.log("Stake contract balance:", await token.balanceOf(stakeAddress));
