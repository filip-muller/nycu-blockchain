# Lab 5 — Proxy Patterns & Upgradeable Contracts

## Setup

Project is based on hardhat v3, just install npm dependencies.
```sh
npm install
```

## Questions

### What happened when you called unstake? Did you get your tokens back?

The transaction succeeded and there was no revert. However, nothing seemed to have happened. I did not get my tokens back.

### How did you retrieve your tokens?

I upgraded the token into one with a unique gambling feature: Anybody holding the token can invoke a russian roulette. They do this by selecting any number of participants, each of which needs to have a strictly lower token balance then them. From these participants a random one is selected. His entire balance of the token is burned.

The rule enforcing the initiator has more balance than every other participant minimizes the incentive to invoke the russian roulette. Nonetheless, it is a fun feature for degenerate gamblers. The contract has multiple security features to ensure integrity and provide a fair destructive gambling experience. Validators are kindly asked to refrain from participating.

- Step 1: Upgrade the token to `Token2` with the russian roulette feature and update the proxy.
- Step 2: Call `russianRoulette()` with my address and the address of the stakeForNFT contract as participants. May the fate decide.
- Step 3: Get lucky and survive the roulette. stakeForNFT now has it's entire balance burned (ez).
- Step 4: Call `mint()` as the balance of stakeForNFT is now 0.

### What does this teach you about interacting with unverified contracts?

You can never trust them. Neither can you trust upgradable proxy contracts. They can pull you straight into a nasty gambling scheme.
