# Lab 02 - Peer to peer token trade

Two ERC20 tokens and a contract that lets people create trade orders for them, others to fulfill them
and the owner to take a fee from the transaction.

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
