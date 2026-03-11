import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "zircuit",
  chainType: "op",
});

const [owner, alice, bob] = await ethers.getSigners();

// lend bob a little gas money
const fundTx = await owner.sendTransaction({
  to: bob.address,
  value: ethers.parseEther("0.001")
});
await fundTx.wait();
console.log("bob has got gas and is ready to rock");

const Token2 = await ethers.getContractFactory("Token2");
// attach to the deployment address of token2
const token2 = Token2.attach("0x19a4D00167C6918a2f16D3e4E8cf7CfCcE2fB03B");

const Market = await ethers.getContractFactory("Market");
// address of market
const market = Market.attach("0x029b7aAce1AF916e544393EE7FE0Cb11cA005f37");

// approve market to use alice's token1
const approveTx = await token2.connect(bob).approve(
  "0x029b7aAce1AF916e544393EE7FE0Cb11cA005f37",
  ethers.parseEther("20000")
);
await approveTx.wait();

console.log("bob approved market to use token2");

const tradeTx = await market.connect(bob).settleTrade(0);
await tradeTx.wait();

console.log("Bob settles trade hash:", tradeTx.hash);
