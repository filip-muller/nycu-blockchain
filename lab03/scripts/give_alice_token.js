import { network } from "hardhat";

const { ethers } = await network.connect({
    network: "zircuit",
    chainType: "op",
});

const [owner, alice] = await ethers.getSigners();

const PrasCoin = await ethers.getContractFactory("PrasCoin");

const prasCoin = await PrasCoin.attach("0x964A899f66eeaC471166141BB658718F8391B472");

const tx = await prasCoin.transfer(alice.address, ethers.parseEther("1000000"));
await tx.wait();

console.log("Alice receives token:", tx.hash);
