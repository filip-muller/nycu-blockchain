import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Market", function () {
  let token1, token2, market;
  let owner, alice, bob;
  let token1Address, token2Address, marketAddress;
  let currTimestamp;
  const FEE_BPS = 10;
  beforeEach(async function () {
    token1 = await ethers.deployContract("Token1");
    token2 = await ethers.deployContract("Token2");
    market = await ethers.deployContract("Market", [await token1.getAddress(), await token2.getAddress()]);
    [owner, alice, bob] = await ethers.getSigners();
    token1Address = await token1.getAddress();
    token2Address = await token2.getAddress();
    marketAddress = await market.getAddress();
    let block = await ethers.provider.getBlock("latest");
    currTimestamp = block.timestamp;

    // give alice tokens and give allowance to market
    await token1.transfer(alice.address, 1_000_000);
    await token1.connect(alice).approve(marketAddress, 1_000_000);
  })
  it("Should set up trade and emit event", async function () {
    await expect(market.connect(alice).setupTrade(token1Address, 10, 20, currTimestamp + 60)).to.emit(market, "TradeSetup");
  })

  it("Should require sufficient tokens to set up trade", async function () {
    await expect(market.connect(alice).setupTrade(token1Address, 10000000000, 20, currTimestamp + 60)).to.revert();
  })

  it("Should allow cancelling own trade and return funds", async function () {
    const tx = await market.connect(alice).setupTrade(token1Address, 10, 20, currTimestamp + 60)
    const receipt = await tx.wait();
    // apparently there is no way to get the return value of the call so we need to find the event?
    const event = receipt.logs.find(log => log.fragment?.name == "TradeSetup");
    const orderId = event.args.orderId;

    const beforeAlice = await token1.balanceOf(alice.address);
    const beforeMarket = await token1.balanceOf(marketAddress);
    await market.connect(alice).cancelTrade(orderId);
    const afterAlice = await token1.balanceOf(alice.address);
    const afterMarket = await token1.balanceOf(marketAddress);
    // check the contract returns funds to Alice
    expect(afterAlice - beforeAlice).to.equal(10);
    expect(afterMarket - beforeMarket).to.equal(-10);
  })

  it("Should settle trades while taking a fee", async function () {
    const tx = await market.connect(alice).setupTrade(token1Address, 100_000, 200_000, currTimestamp + 60)
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name == "TradeSetup");
    const orderId = event.args.orderId;

    // give bob token2
    await token2.transfer(bob.address, 1_000_000);
    await token2.connect(bob).approve(marketAddress, 1_000_000);

    const beforeAlice = await token2.balanceOf(alice.address);
    const beforeBob = await token1.balanceOf(bob.address);
    const beforeMarket = await token1.balanceOf(marketAddress);
    await market.connect(bob).settleTrade(orderId);

    const afterAlice = await token2.balanceOf(alice.address);
    const afterBob = await token1.balanceOf(bob.address);
    const afterMarket = await token1.balanceOf(marketAddress);
    // check Alice gets token2
    expect(afterAlice - beforeAlice).to.equal(200_000);

    // market should be left with the fee in token1
    const expectedFee = 100_000 * FEE_BPS / 10_000;
    // send tokens to bob (-100k), but keep the fee (+ fee)
    const expectedChange = -100_000 + expectedFee;
    expect(afterMarket - beforeMarket).to.equal(expectedChange);
    await expect(await token1.balanceOf(market)).to.equal(expectedFee);
    expect(afterBob - beforeBob).to.equal(-expectedChange);
  })

  it("Should not allow same trade to be settled twice", async function() {
    const tx = await market.connect(alice).setupTrade(token1Address, 100_000, 200_000, currTimestamp + 60)
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name == "TradeSetup");
    const orderId = event.args.orderId;

    // give bob token2
    await token2.transfer(bob.address, 1_000_000);
    await token2.connect(bob).approve(marketAddress, 1_000_000);

    await market.connect(bob).settleTrade(orderId);

    await expect(market.connect(bob).settleTrade(orderId)).to.revert();
  })

  it("Should not allow expired trade to be settled", async function() {
    // expired trade order
    const tx = await market.connect(alice).setupTrade(token1Address, 100_000, 200_000, currTimestamp - 60)
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name == "TradeSetup");
    const orderId = event.args.orderId;

    // give bob token2
    await token2.transfer(bob.address, 1_000_000);
    await token2.connect(bob).approve(marketAddress, 1_000_000);

    await expect(market.connect(bob).settleTrade(orderId)).to.revert();
  })

  it("Should allow expired trade to be cancelled", async function() {
    // expired trade order
    const tx = await market.connect(alice).setupTrade(token1Address, 10, 20, currTimestamp - 60)
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name == "TradeSetup");
    const orderId = event.args.orderId;

    const beforeAlice = await token1.balanceOf(alice.address);
    const beforeMarket = await token1.balanceOf(marketAddress);
    await market.connect(alice).cancelTrade(orderId);
    const afterAlice = await token1.balanceOf(alice.address);
    const afterMarket = await token1.balanceOf(marketAddress);
    // check the contract returns funds to Alice
    expect(afterAlice - beforeAlice).to.equal(10);
    expect(afterMarket - beforeMarket).to.equal(-10);
  })

  it("Should only allow trade creator to cancel their trade", async function() {
    const tx = await market.connect(alice).setupTrade(token1Address, 10, 20, currTimestamp + 60)
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name == "TradeSetup");
    const orderId = event.args.orderId;

    await expect(market.connect(bob).cancelTrade(orderId)).to.revert();
  })

  it("Should work also when maker sells token2", async function() {

    // give alice token2
    await token2.transfer(alice.address, 1_000_000);
    await token2.connect(alice).approve(marketAddress, 1_000_000);

    const tx = await market.connect(alice).setupTrade(token2Address, 100_000, 200_000, currTimestamp + 60)
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name == "TradeSetup");
    const orderId = event.args.orderId;

    // give bob token1
    await token1.transfer(bob.address, 1_000_000);
    await token1.connect(bob).approve(marketAddress, 1_000_000);

    const beforeAlice = await token1.balanceOf(alice.address);
    const beforeBob = await token2.balanceOf(bob.address);
    const beforeMarket = await token2.balanceOf(marketAddress);
    await market.connect(bob).settleTrade(orderId);

    const afterAlice = await token1.balanceOf(alice.address);
    const afterBob = await token2.balanceOf(bob.address);
    const afterMarket = await token2.balanceOf(marketAddress);
    // check Alice gets token1
    expect(afterAlice - beforeAlice).to.equal(200_000);

    // market should be left with the fee in token2
    const expectedFee = 100_000 * FEE_BPS / 10_000;
    // send tokens to bob (-100k), but keep the fee (+ fee)
    const expectedChange = -100_000 + expectedFee;
    expect(afterMarket - beforeMarket).to.equal(expectedChange);
    expect(await token2.balanceOf(market)).to.equal(expectedFee);
    expect(afterBob - beforeBob).to.equal(-expectedChange);
  })

  it("Should allow owner to withdraw fee", async function () {
    const tx = await market.connect(alice).setupTrade(token1Address, 100_000, 200_000, currTimestamp + 60)
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name == "TradeSetup");
    const orderId = event.args.orderId;

    // give bob token2
    await token2.transfer(bob.address, 1_000_000);
    await token2.connect(bob).approve(marketAddress, 1_000_000);

    const beforeAlice = await token2.balanceOf(alice.address);
    const beforeBob = await token1.balanceOf(bob.address);
    const beforeMarket = await token1.balanceOf(marketAddress);
    await market.connect(bob).settleTrade(orderId);

    const afterAlice = await token2.balanceOf(alice.address);
    const afterBob = await token1.balanceOf(bob.address);
    const afterMarket = await token1.balanceOf(marketAddress);
    // check Alice gets token2
    expect(afterAlice - beforeAlice).to.equal(200_000);

    // market should be left with the fee in token1
    const expectedFee = 100_000 * FEE_BPS / 10_000;
    // send tokens to bob (-100k), but keep the fee (+ fee)
    const expectedChange = -100_000 + expectedFee;
    expect(afterMarket - beforeMarket).to.equal(expectedChange);
    expect(await token1.balanceOf(market)).to.equal(expectedFee);
    expect(afterBob - beforeBob).to.equal(-expectedChange);

    // withdraw fee
    const beforeOwner = await token1.balanceOf(owner.address);
    await market.connect(owner).withdrawFee();
    const afterOwner = await token1.balanceOf(owner.address);
    expect(afterOwner - beforeOwner).to.equal(expectedFee);
  })

  it("Should not allow others to withdraw fee", async function () {
    await expect(market.connect(alice).withdrawFee()).to.revert();
  })

});
