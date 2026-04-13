import { network } from "hardhat";

const { ethers } = await network.connect({
    network: "sepolia",
});

const stakeAddress = "0xa73caE55DF45E8902c5A9df832D1705d6232f61E";

const [deployer] = await ethers.getSigners();

const Stake = await ethers.getContractFactory("StakeForNFT");
const stake = await Stake.attach(stakeAddress);

let stakedAmount = await stake.stakedAmount(deployer.address);
let stakedToken = await stake.stakedToken(deployer.address);
let hasMinted = await stake.hasMinted(deployer.address);

console.log("Staked amount:", stakedAmount);
console.log("Staked token:", stakedToken);
console.log("Has minted:", hasMinted);

const tx = await stake.mint();
await tx.wait();

console.log("Mint hash:", tx.hash);

stakedAmount = await stake.stakedAmount(deployer.address);
stakedToken = await stake.stakedToken(deployer.address);
hasMinted = await stake.hasMinted(deployer.address);

console.log("Staked amount:", stakedAmount);
console.log("Staked token:", stakedToken);
console.log("Has minted:", hasMinted);
