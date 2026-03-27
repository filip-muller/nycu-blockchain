import { expect } from "chai";
import { network } from "hardhat";

import { getMerkleTree, getAddressProof, defaultAddresses } from "../offchain/createMerkleTree.js"; // import our offchain merkel tree logic


const { ethers } = await network.connect();

describe("MembershipBoard", function() {
    const addr = defaultAddresses[0];
    const tree = getMerkleTree();
    let owner, nonwoner;
    let board;

    beforeEach(async function() {
        [owner, nonwoner] = await ethers.getSigners();
        board = await ethers.deployContract("MembershipBoard");
    });

    it("Should allow adding a member and update mapping", async function() {
        expect(await board.verifyMemberByMapping(addr)).to.be.false;
        await board.addMember(addr);
        expect(await board.verifyMemberByMapping(addr)).to.be.true;
    });

    it("Should allowing adding members in batch", async function() {
        // only use first 100 addresses to not hit gas limit
        let hundredAddresses = defaultAddresses.slice(0, 100);
        for (let ad of hundredAddresses) {
            expect(await board.verifyMemberByMapping(ad)).to.be.false;
        }
        await board.batchAddMembers(hundredAddresses);

        for (let ad of hundredAddresses) {
            expect(await board.verifyMemberByMapping(ad)).to.be.true;
        }
        // other addresses not affected
        for (let ad of defaultAddresses.slice(100)) {
            expect(await board.verifyMemberByMapping(ad)).to.be.false;
        }
    });

    it("Should revert when attemting to add same member twice", async function() {
        const board = await ethers.deployContract("MembershipBoard");
        expect(await board.verifyMemberByMapping(addr)).to.be.false;
        await board.addMember(addr);
        expect(await board.verifyMemberByMapping(addr)).to.be.true;

        await expect(board.addMember(addr)).to.revert();
    });

    it("Should revert when attemting to batch add duplicates", async function() {
        // hide a duplicate (address 17) in the batch
        let hundredAddresses = [...defaultAddresses.slice(0, 100), defaultAddresses[17]];
        await expect(board.batchAddMembers(hundredAddresses)).to.revert();
    });

    it("Should alllow setting root and veryfing proof", async function() {
        await board.setMerkleRoot(tree.root);

        const proof = getAddressProof(addr, tree);

        expect(await board.verifyMemberByProof(addr, proof)).to.be.true;
    });

    it("Should not accept bad proof", async function() {
        await board.setMerkleRoot(tree.root);

        // proof for some other address
        const wrongProof = getAddressProof(defaultAddresses[17], tree);

        // should reject wrong proof (return false)
        expect(await board.verifyMemberByProof(addr, wrongProof)).to.be.false;
    });

    it("Should not accept non-member that passes a member's proof", async function() {
        await board.setMerkleRoot(tree.root);

        // proof for a legit member
        const proof = getAddressProof(defaultAddresses[0], tree);

        // random address that is not a member
        const nonmemberAddr = "0x" + "ab".repeat(20);

        // should not accept non-member based on a member's proof
        expect(await board.verifyMemberByProof(nonmemberAddr, proof)).to.be.false;
    });

    it("Should not allow non-owner to add member", async function () {
        await expect(board.connect(nonwoner).addMember(addr)).to.revert();
    });

    it("Should not allow non-owner to set merkle root", async function () {
        await expect(board.connect(nonwoner).setMerkleRoot(tree.root)).to.revert();
    });
})