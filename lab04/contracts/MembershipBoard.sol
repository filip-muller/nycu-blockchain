// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MembershipBoard is Ownable {

  mapping(address => bool) public members;
  bytes32 public merkleRoot;

  event MemberAdded(address indexed member);
  event MerkleRootSet(bytes32 indexed root);

  constructor() Ownable(msg.sender) {}

  function addMember(address _member) external onlyOwner {
    require(!members[_member], "Already a member");
    members[_member] = true;
    emit MemberAdded(_member);
  }

  function batchAddMembers(address[] calldata _members) external onlyOwner {
    uint256 len = _members.length;
    for (uint256 i = 0; i < len; i++) {
      require(!members[_members[i]], "A member in members is already a member of the members array representing members");
      members[_members[i]] = true;
      emit MemberAdded(_members[i]);
    }
  }

  function setMerkleRoot(bytes32 _root) external onlyOwner {
    merkleRoot = _root;
    emit MerkleRootSet(_root);
  }


  function verifyMemberByMapping(address _member) external view returns (bool) {
    return members[_member];
  }

  function verifyMemberByProof(address _member, bytes32[] calldata _proof) external view returns (bool) {
    bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(_member))));
    return MerkleProof.verify(_proof, merkleRoot, leaf);
  }

}
