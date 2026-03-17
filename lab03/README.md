# Lab 03 - Signature-Based Token Approval

Implements an ERC20 token with the `permit` function that allows a token owner to sign a transaction
off-chain and a spender to submit the signature on-chain and gain allowance from the owner.

## Setup instructionsx

Project is based on hardhat, just install npm dependencies.
```sh
npm install
```

## Test instructions

```sh
npx hardhat test
```

## Deployment

The scripts dir has all the files used for deploying and using the contract on a testnet.
`deployment_addresses.txt` contains the addresses on Zircuit where it was deployed and transaction
hashes.


## Writeup

Writeup is in [`writeup.md`](./writeup.md).
