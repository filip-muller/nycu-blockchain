import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("EthVault", function () {
  const sendAmount = ethers.parseEther("1.0");

  it("Should accept deposit and emit Deposit event with correct values", async function () {
    const vault = await ethers.deployContract("EthVault");
    const [sender] = await ethers.getSigners();

    await expect(sender.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit").withArgs(sender.address, sendAmount);
  });

  it("Should increase balance accordingly on deposit", async function () {
    const vault = await ethers.deployContract("EthVault");
    const [sender] = await ethers.getSigners();

    const balanceBefore = await ethers.provider.getBalance(vault);

    await expect(sender.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit");

    const balanceAfter = await ethers.provider.getBalance(vault);

    expect(balanceAfter - balanceBefore).to.equal(sendAmount);
  });

  it("Should accept multiple deposits from different or same senders", async function () {
    const vault = await ethers.deployContract("EthVault");
    const [sender1, sender2] = await ethers.getSigners();

    let balanceBefore = await ethers.provider.getBalance(vault);
    let balanceAfter;

    await expect(sender1.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit");
    balanceAfter = await ethers.provider.getBalance(vault);
    expect(balanceAfter - balanceBefore).to.equal(sendAmount);
    balanceBefore = balanceAfter;

    await expect(sender2.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit");
    balanceAfter = await ethers.provider.getBalance(vault);
    expect(balanceAfter - balanceBefore).to.equal(sendAmount);
    balanceBefore = balanceAfter;

    await expect(sender1.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit");
    balanceAfter = await ethers.provider.getBalance(vault);
    expect(balanceAfter - balanceBefore).to.equal(sendAmount);
    balanceBefore = balanceAfter;

    await expect(sender1.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit");
    balanceAfter = await ethers.provider.getBalance(vault);
    expect(balanceAfter - balanceBefore).to.equal(sendAmount);
    balanceBefore = balanceAfter;

    await expect(sender2.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit");

    balanceAfter = await ethers.provider.getBalance(vault);
    expect(balanceAfter - balanceBefore).to.equal(sendAmount);
  });

  it("Should allow owner to withdraw full", async function () {
    const [owner, sender] = await ethers.getSigners();
    const vault = await ethers.deployContract("EthVault", {signer: owner});

    await expect(sender.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit");

    await expect(vault.connect(owner).withdraw(sendAmount)).to.changeEtherBalances(ethers, [vault, owner], [-sendAmount, sendAmount]);
  });

  it("Should allow owner to withdraw partial", async function () {
    const partialAmount = sendAmount / 2n;
    const [owner, sender] = await ethers.getSigners();
    const vault = await ethers.deployContract("EthVault", {signer: owner});

    await expect(sender.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit");

    // withdraw by halves
    await expect(vault.connect(owner).withdraw(partialAmount)).to.changeEtherBalances(ethers, [vault, owner], [-partialAmount, partialAmount]);
    await expect(vault.connect(owner).withdraw(partialAmount)).to.changeEtherBalances(ethers, [vault, owner], [-partialAmount, partialAmount]);
  });

  it("Should not allow non-owner to withdraw, emit event and NOT revert", async function () {
    const [owner, sender] = await ethers.getSigners();
    const vault = await ethers.deployContract("EthVault", {signer: owner});

    await expect(sender.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit");

    // Claude recommended to store the transaction like this for multiple expects, but I dont know if its a good practice
    const tx = vault.connect(sender).withdraw(sendAmount);

    await expect(tx).to.emit(vault, "UnauthorizedWithdrawAttempt")
    // no transfer of eth
    await expect(tx).to.changeEtherBalances(ethers, [vault, sender], [0, 0]);
    // does not revert
    await expect(tx).to.not.revert(ethers);
  });

  it("Should revert revert when owner tries to withdraw more than balance", async function () {
    const [owner, sender] = await ethers.getSigners();
    const vault = await ethers.deployContract("EthVault", {signer: owner});

    await expect(sender.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit");

    await expect(vault.connect(owner).withdraw(2n * sendAmount)).to.revert(ethers);
  });

  it("Should be able to withdraw zero", async function () {
    const [owner, sender] = await ethers.getSigners();
    const vault = await ethers.deployContract("EthVault", {signer: owner});

    await expect(sender.sendTransaction({to: await vault.getAddress(), value: sendAmount})).to.emit(vault, "Deposit");

    const tx = vault.connect(owner).withdraw(0);

    await expect(tx).to.not.revert(ethers);
    await expect(tx).to.changeEtherBalances(ethers, [vault, owner], [0, 0]);
  });

  it("Should handle multiple deposits before withdrawing", async function() {
    const [owner, sender] = await ethers.getSigners();
    const vault = await ethers.deployContract("EthVault", {signer: owner});

    await expect(sender.sendTransaction({to: (await vault).getAddress(), value: sendAmount})).to.emit(vault, "Deposit");
    await expect(sender.sendTransaction({to: (await vault).getAddress(), value: sendAmount})).to.emit(vault, "Deposit");
    await expect(sender.sendTransaction({to: (await vault).getAddress(), value: sendAmount})).to.emit(vault, "Deposit");

    // withdraw 2/3 of the deposits
    const withdrawAmount = sendAmount * 2n;
    await expect(vault.connect(owner).withdraw(withdrawAmount)).to.changeEtherBalances(ethers, [vault, owner], [-withdrawAmount, withdrawAmount]);
  });

})

// describe("EthVault", function () {
//   it("Should ")
// })

// describe("Counter", function () {
//   it("Should emit the Increment event when calling the inc() function", async function () {
//     const counter = await ethers.deployContract("Counter");

//     await expect(counter.inc()).to.emit(counter, "Increment").withArgs(1n);
//   });

//   it("The sum of the Increment events should match the current value", async function () {
//     const counter = await ethers.deployContract("Counter");
//     const deploymentBlockNumber = await ethers.provider.getBlockNumber();

//     // run a series of increments
//     for (let i = 1; i <= 10; i++) {
//       await counter.incBy(i);
//     }

//     const events = await counter.queryFilter(
//       counter.filters.Increment(),
//       deploymentBlockNumber,
//       "latest",
//     );

//     // check that the aggregated events match the current value
//     let total = 0n;
//     for (const event of events) {
//       total += event.args.by;
//     }

//     expect(await counter.x()).to.equal(total);
//   });
// });
