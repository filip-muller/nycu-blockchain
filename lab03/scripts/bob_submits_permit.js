import { network } from "hardhat";

const { ethers } = await network.connect({
    network: "zircuit",
    chainType: "op",
});

const [owner, alice, bob] = await ethers.getSigners();

const PrasCoin = await ethers.getContractFactory("PrasCoin");
const prasCoin = await PrasCoin.attach("0x964A899f66eeaC471166141BB658718F8391B472");

const block = await ethers.provider.getBlock("latest");
const currTs = block.timestamp;

const message = ethers.solidityPackedKeccak256(
    ["address", "address", "uint256", "uint256", "uint256", "address"],
    [alice.address, bob.address, 100_000, 0, currTs + 120, await prasCoin.getAddress()]
);
// alice signs message
const signature = await alice.signMessage(ethers.getBytes(message));

// bob uses signatue to permit
const tx = await prasCoin.connect(bob).permit(alice.address, bob.address, 100_000, 0, currTs + 120, signature);
await tx.wait();
console.log("Bob permits:", tx.hash);

// bob transfers permitted tokens
const txTransfer = await prasCoin.connect(bob).transferFrom(alice.address, bob.address, 100_000);
await txTransfer.wait();
console.log("Bob transfers permitted tokens:", txTransfer.hash);
