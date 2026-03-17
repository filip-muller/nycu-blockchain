import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "zircuit",
  chainType: "op",
});

const [owner, alice] = await ethers.getSigners();

// lend alice a little gas money
const fundTx = await owner.sendTransaction({
  to: alice.address,
  value: ethers.parseEther("0.001")
});
await fundTx.wait();
console.log("alice has got gas and is ready to rock");

const Token1 = await ethers.getContractFactory("Token1");
// attach to the deployment address of token1
const token1 = Token1.attach("0x09097dA71F46A50638a248d095fE4A86B2F73150");

const Market = await ethers.getContractFactory("Market");
// address of market
const market = Market.attach("0x029b7aAce1AF916e544393EE7FE0Cb11cA005f37");

// approve market to use alice's token1
const approveTx = await token1.connect(alice).approve(
  "0x029b7aAce1AF916e544393EE7FE0Cb11cA005f37",
  ethers.parseEther("10000")
);
await approveTx.wait();

console.log("alice approved market to use token1");

const tradeTx = await market.connect(alice).setupTrade(
  "0x09097dA71F46A50638a248d095fE4A86B2F73150", // token1 address
  ethers.parseEther("10000"),  // sell 10k token1
  ethers.parseEther("20000"),  // ask 20k token2
  Math.floor(Date.now() / 1000) + 3600  // valid for 1 hour
);
await tradeTx.wait();

console.log("Alice sets up trade hash:", tradeTx.hash);
