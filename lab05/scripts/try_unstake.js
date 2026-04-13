import { network } from "hardhat";

const {ethers} = await network.connect({
    network: "sepolia",
})


const stakeAddress = "0xa73caE55DF45E8902c5A9df832D1705d6232f61E";

const StakeForNFT = await ethers.getContractFactory("StakeForNFT");
const stakeForNFT = await StakeForNFT.attach(stakeAddress);

const tx = await stakeForNFT.unstake();

await tx.wait();

console.log("Unstake attempt hash:", tx.hash);
