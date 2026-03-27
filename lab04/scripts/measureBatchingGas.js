import { network } from "hardhat";

import { defaultAddresses } from "../offchain/createMerkleTree";

const { ethers } = await network.connect()

const batchCounts = [2, 4, 5, 10, 20, 100, 500, 1000];


for (let batchCount of batchCounts){
  // console.log(batchCount);
  const batchSize = defaultAddresses.length / batchCount;
  console.log("Batch size:", batchSize);

  const board = await ethers.deployContract("MembershipBoard");
  let totalGas = 0n;
  for (let i = 0; i < batchCount; i++) {
    let tx;
    if (batchSize == 1) {
      tx = await board.addMember(defaultAddresses[i]);
    } else {
      tx = await board.batchAddMembers(defaultAddresses.slice(i*batchSize, (i+1)*batchSize));
    }
    const receipt = await tx.wait();

    if (i === 0) {
      console.log("One transaction gas:", receipt.gasUsed.toLocaleString("en-US"));
    }
    totalGas += receipt.gasUsed;
  }
  console.log("Total gas used:", totalGas.toLocaleString("en-US"));
}
