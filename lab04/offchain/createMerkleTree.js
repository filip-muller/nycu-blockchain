import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

import addressData from "../members.json" with { type: "json" };

export const defaultAddresses = addressData.addresses

export function getMerkleTree(addresses=defaultAddresses) {
  // need to wrap each address str in an array
  const values = addresses.map(x => [x]);
  const leafEncoding = ["address"]
  // console.log(`Creating a tree from ${values.length} addresses`);

  const tree = StandardMerkleTree.of(values, leafEncoding);
  return tree;
}

export function getAddressProof(address, tree) {
  for (let [ind, [addr]] of tree.entries()) {
    if (addr === address) {
      return tree.getProof(ind);
    }
  }
}

// console.log("Merkle tree root:", getMerkleTree().root);
// console.log(getAddressProof("0x47B10C40DbDb62c64FC9b085F7fb3147993C43aD"));
