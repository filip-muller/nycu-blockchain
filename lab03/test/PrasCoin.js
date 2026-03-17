import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect()

describe("PrasCoin", function () {
    it("Should work", async function () {
        const prasCoin = await ethers.deployContract("PrasCoin");
        const [owner, alice, bob] = await ethers.getSigners();

        await prasCoin.transfer(alice.address, 1_000_000);

        // get signature to approve transfer by alice
        const message = ethers.solidityPackedKeccak256(
            ["address", "address", "uint256", "uint256", "uint256", "address"],
            [alice.address, bob.address, 100_000, 0, 10000000000000, await prasCoin.getAddress()]
        );
        const signature = await alice.signMessage(ethers.getBytes(message));

        const beforeAlice = await prasCoin.balanceOf(alice.address);
        const beforeBob = await prasCoin.balanceOf(bob.address);

        // bob permits using alice's signature and transfers to himself
        await prasCoin.permit(alice.address, bob.address, 100_000, 0, 10000000000000, signature);
        await prasCoin.connect(bob).transferFrom(alice.address, bob.address, 100_000);

        const afterAlice = await prasCoin.balanceOf(alice.address);
        const afterBob = await prasCoin.balanceOf(bob.address);

        expect(afterBob - beforeBob).to.equal(100_000);
        expect(afterAlice - beforeAlice).to.equal(-100_000);
    })

    it("Should not accept same signature (nonce) twice", async function () {
        const prasCoin = await ethers.deployContract("PrasCoin");
        const [owner, alice, bob] = await ethers.getSigners();

        await prasCoin.transfer(alice.address, 1_000_000);

        // get signature to approve transfer by alice
        const message = ethers.solidityPackedKeccak256(
            ["address", "address", "uint256", "uint256", "uint256", "address"],
            [alice.address, bob.address, 100_000, 0, 10000000000000, await prasCoin.getAddress()]
        );
        const signature = await alice.signMessage(ethers.getBytes(message));

        // bob permits using alice's signature and transfers to himself
        await prasCoin.permit(alice.address, bob.address, 100_000, 0, 10000000000000, signature);
        await prasCoin.connect(bob).transferFrom(alice.address, bob.address, 100_000);

        // thinking he found a free money glitch he tries it again
        await expect(prasCoin.permit(alice.address, bob.address, 100_000, 0, 10000000000000, signature)).to.revert();
        await expect(prasCoin.connect(bob).transferFrom(alice.address, bob.address, 100_000)).to.revert();
    })

    it("Should not accept signatures past deadline", async function () {
        const prasCoin = await ethers.deployContract("PrasCoin");
        const [owner, alice, bob] = await ethers.getSigners();

        await prasCoin.transfer(alice.address, 1_000_000);

        const block = await ethers.provider.getBlock("latest");
        const currTimestamp = block.timestamp;

        // get signature to approve transfer by alice
        const message = ethers.solidityPackedKeccak256(
            ["address", "address", "uint256", "uint256", "uint256", "address"],
            [alice.address, bob.address, 100_000, 0, currTimestamp - 10, await prasCoin.getAddress()]
        );
        const signature = await alice.signMessage(ethers.getBytes(message));

        // trying to use an expired signature should fail
        await expect(prasCoin.permit(alice.address, bob.address, 100_000, 0, currTimestamp - 10, signature)).to.revert();
        await expect(prasCoin.connect(bob).transferFrom(alice.address, bob.address, 100_000)).to.revert();
    })

    it("Should only work with the data it was signed with", async function () {
        const prasCoin = await ethers.deployContract("PrasCoin");
        const [owner, alice, bob, cyril] = await ethers.getSigners();

        await prasCoin.transfer(alice.address, 1_000_000);

        const block = await ethers.provider.getBlock("latest");
        const currTimestamp = block.timestamp;

        // get signature to approve transfer by alice
        const message = ethers.solidityPackedKeccak256(
            ["address", "address", "uint256", "uint256", "uint256", "address"],
            [alice.address, bob.address, 100_000, 0, 10000000000000, await prasCoin.getAddress()]
        );
        const signature = await alice.signMessage(ethers.getBytes(message));

        // wrong amount
        await expect(prasCoin.permit(alice.address, bob.address, 500_000, 0, 10000000000000, signature)).to.revert();
        // wrong deadline
        await expect(prasCoin.permit(alice.address, bob.address, 100_000, 0, 20000000000000, signature)).to.revert();
        // wrong nonce
        await expect(prasCoin.permit(alice.address, bob.address, 100_000, 1, 10000000000000, signature)).to.revert();
        // wrong spender address
        await expect(prasCoin.permit(alice.address, cyril.address, 500_000, 0, 10000000000000, signature)).to.revert();
        await expect(prasCoin.connect(bob).transferFrom(alice.address, bob.address, 100_000)).to.revert();
    })

    it("Should not accept signature other than owner's", async function () {
        const prasCoin = await ethers.deployContract("PrasCoin");
        const [owner, alice, bob, cyril] = await ethers.getSigners();

        await prasCoin.transfer(alice.address, 1_000_000);

        const block = await ethers.provider.getBlock("latest");
        const currTimestamp = block.timestamp;

        // sign by BOB
        const message = ethers.solidityPackedKeccak256(
            ["address", "address", "uint256", "uint256", "uint256", "address"],
            [alice.address, bob.address, 100_000, 0, 10000000000000, await prasCoin.getAddress()]
        );
        // bob signs message
        const signature = await bob.signMessage(ethers.getBytes(message));

        // signiture from bob shouldnt work
        await expect(prasCoin.permit(alice.address, bob.address, 500_000, 0, 10000000000000, signature)).to.revert();
        await expect(prasCoin.connect(bob).transferFrom(alice.address, bob.address, 100_000)).to.revert();
    })
})
