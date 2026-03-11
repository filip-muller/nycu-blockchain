import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "zircuit",
  chainType: "op",
});

const [owner] = await ethers.getSigners();

const Token2 = await ethers.getContractFactory("Token2");
// attach to the deployment address of token2
const token2 = Token2.attach("0x19a4D00167C6918a2f16D3e4E8cf7CfCcE2fB03B");

// send tokens to bob
const tx = await token2.transfer("0xe2C98427500B958Cf5E358E9e8845e3A0772f7eB", ethers.parseEther("1000000"));
await tx.wait();
