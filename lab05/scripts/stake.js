import { network } from "hardhat";

const {ethers} = await network.connect({
    network: "sepolia",
})


const proxyAddress = "0x707b5f83deBf48b518Bf6aD10C1c239ddCf4860a";
const stakeAddress = "0xa73caE55DF45E8902c5A9df832D1705d6232f61E"; // "0x210a58e12c627220bF13368fFfAA86632d0cD379"; // "0xa6FF20737004fb2f632B6b9388C7731B871a201D"; // "0x210a58e12c627220bF13368fFfAA86632d0cD379";
// my deployment
// const stakeAddress = "0xF1BBaE485De7E440Ad35258B9B1d4f45B137C18D";


const [deployer] = await ethers.getSigners();

const Token = await ethers.getContractFactory("Token1");
const token = await Token.attach(proxyAddress);

console.log("Total supply:", await token.totalSupply());
console.log("Your balance:", await token.balanceOf(deployer.address));
console.log("Their balance:", await token.balanceOf(stakeAddress));


const apprTx = await token.connect(deployer).approve(stakeAddress, ethers.parseEther("100"));

await apprTx.wait();


console.log("Allowance:", await token.allowance(deployer.address, stakeAddress));
console.log("Balance:", await token.balanceOf(deployer.address));

console.log("Approved");

const Stake = await ethers.getContractFactory("StakeForNFT");
const stake = await Stake.attach(stakeAddress);

try {
  await stake.connect(deployer).stake.staticCall(
    proxyAddress,
    ethers.parseEther("100"),
    "314551818"
  );
} catch (e) {
  console.log("Revert reason:", e.message);
  console.log("Error data:", e.data);
}

const stakedAmount = await stake.stakedAmount(deployer.address);
const stakedToken = await stake.stakedToken(deployer.address);
const hasMinted = await stake.hasMinted(deployer.address);

console.log("Staked amount:", stakedAmount);
console.log("Staked token:", stakedToken);
console.log("Has minted:", hasMinted);

const tx = await stake.connect(deployer).stake(proxyAddress, ethers.parseEther("100"), "314551818");
await tx.wait()

console.log("Done, stake hash:", tx.hash);
