import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "zircuit",
  chainType: "op",
});

const [owner] = await ethers.getSigners();

const Token1 = await ethers.getContractFactory("Token1");
// attach to the deployment address of token1
const token1 = Token1.attach("0x09097dA71F46A50638a248d095fE4A86B2F73150");

// send tokens to alice
const tx = await token1.transfer("0xAC6283C1361F13700f94f32C8f4282515B008506", ethers.parseEther("1000000"));
await tx.wait();
