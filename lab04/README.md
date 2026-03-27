# Lab 4 — Membership Board: Storage vs. Merkle Trees

## Setup

Project is based on hardhat v3, just install npm dependencies.
```sh
npm install
```

## Tests

Run with `--gas-stats` for gas profiling

```sh
npx hardhat test --gas-stats
```


## Gas stats

Output of (batchAddMembers was called with 100 members):

```sh
npx hardhat test --gas-stats
```

```
╔════════════════════════════════════════════════════════════════════════════════╗
║ contracts/MembershipBoard.sol:MembershipBoard                                  ║
╟───────────────────────┬─────────────────┬─────────┬─────────┬─────────┬────────╢
║ Function name         │ Min             │ Average │ Median  │ Max     │ #calls ║
╟───────────────────────┼─────────────────┼─────────┼─────────┼─────────┼────────╢
║ addMember             │ 47843           │ 47843   │ 47843   │ 47843   │ 2      ║
║ batchAddMembers (100) │ 2534671         │ 2534671 │ 2534671 │ 2534671 │ 1      ║
║ setMerkleRoot         │ 47561           │ 47561   │ 47561   │ 47561   │ 2      ║
║ verifyMemberByMapping │ 24300           │ 24323   │ 24324   │ 24324   │ 1104   ║
║ verifyMemberByProof   │ 35520           │ 35535   │ 35535   │ 35550   │ 2      ║
╟───────────────────────┼─────────────────┼─────────┴─────────┴─────────┴────────╢
║ Deployment Cost       │ Deployment Size │                                      ║
╟───────────────────────┼─────────────────┤                                      ║
║ 827370                │ 3894            │                                      ║
╚═══════════════════════╧═════════════════╧══════════════════════════════════════╝
```
Calculated gas costs for 1k members:
```
╔═══════════════════════════════════════════════════════════════╗
║ Function name         │ One call cost   │ Cost for 1k members ║
╟───────────────────────┼─────────────────┼─────────────────────╢
║ addMember             │ 47,843          │ 47,843,000          ║
║ batchAddMembers (100) │ 2,534,671       │ 25,346,710          ║
║ setMerkleRoot         │ 47,561          │ 47,561              ║
║ verifyMemberByMapping │ 24,300          │ 24,323,000          ║
║ verifyMemberByProof   │ 35,520          │ 35,535,000          ║
╚═══════════════════════╧═════════════════╧═════════════════════╝
```

### Measured gas costs for batching based on batch size (`script/measureBatchingGas.js`):

| Batch Size | Gas per Transaction | Total Gas for 1000 members |
|------------|---------------------|----------------------------|
| 500 | 12,576,203 | 25,152,382 |
| 250 | 6,300,277 | 25,200,796 |
| 200 | 5,045,051 | 25,225,015 |
| 100 | 2,534,671 | 25,346,110 |
| 50 | 1,279,433 | 25,588,300 |
| 10 | 275,269 | 27,525,820 |
| 2 | 74,429 | 37,213,420 |
| 1 (no batching) | 47,843 | 47,841,920 |



### Sumbission table:
| Action | Gas Used |
|--------|----------|
| `addMember` (single call) | 47,843 |
| `addMember` x1000 (total estimated) | 47,843,000 |
| `batchAddMembers` (all 1,000, batchSize=500) | 25,152,382 |
| `setMerkleRoot` | 47,561 |
| `verifyMemberByMapping` | 24,300 |
| `verifyMemberByProof` | 35,520 |


## Questions

### 1. Storage cost comparison: What is the total gas cost of registering all 1,000 members for each of the three approaches (addMember x1000, batchAddMembers, setMerkleRoot)? Which is cheapest and why?

addMember called 1000 times cost over 48 million gas, batchAddMembers cost 25 million gas (using a batch size of 500, i.e. 2 batches for the 1000 members). setMerkleRoot cost 47 **thousand** gas. setMerkle root is the clear winner as it only neads one transaction and barely uses any write operations for on-chain storage. batchAddmembers decreased the cost to almost a half of addMembers, showing that close to 50% of the gas payed by calling addMembers repeatedly was simply due to the base transaction fee. batchAddMemebers is still more than 500 times more expensive than setMerkleRoot as it still writes into a lot of on-chain storage.

### 2. Verification cost comparison: What is the gas cost of verifying a single member using the mapping vs. the Merkle proof? Which is cheaper and why?

Using the mapping uses 24 thousand gas, while the merkle proof verification needs 36 thousand gas. Both are cheap as they are very simple operations. Using mapping is cheaper simply because it does less operations. In this case, there are no write operations in the mapping approach, so there are no big costs incurred by that.


### 3. Trade-off analysis: The Merkle tree approach is very cheap to store on-chain but requires the verifier to provide a proof. In what scenarios would you prefer the mapping approach over the Merkle tree approach, and vice versa? Consider factors such as:

- Who pays for the verification gas?
- How often does the membership list change?
- Is the full member list public or private?

Who pays for verification gas probably depends on the use case. I can picture a scenario where a member calls a function and the function internally checks membership, thus the member pays the fee. The Merkle approach would then put more cost onto the members.

Considering how often the list changes, if members are naturally added 1 by 1 and the changes are not too frequent (and thus cannot be batched together), the Merkle approach will have essentially the same setting cost as the mapping, as writing the Merkle root is just as expensive as setting a value in the address mapping. In this case, Merkle is worse due to the higher verification costs.

For the member list, Markle proof keeps it completely private. From my understading, so does setting the memeber list variable as `private`. In that case, the membership of a certain address can still be checked, but reversing the whole member list should be computationally impossible due to the amount of all possible addresses. But than if the list is on-chain, the nodes need access to it so how exactly does `private` work then? I guess it cannot be really private, just harder to access. Either way, Merkle provides more privacy. That should mainly be an advantage but can also get in the way of transparency and make the contract less trustworthy.

### 4. Batch size experimentation: Try different batch sizes for batchAddMembers (e.g., 50, 100, 250, 500). How does the per-member gas cost change with batch size? Is there a sweet spot?

The per-member gas cost is the lower the higher the batch size. This is consistent with expecations, as the higher the batch size, the less transaction fees have to be paid. The sweet spot is thus as high as the block gas limit allows. Results of experiments are repeated in the table below.

| Batch Size | Gas per Transaction | Total Gas for 1000 members |
|------------|---------------------|----------------------------|
| 500 | 12,576,203 | 25,152,382 |
| 250 | 6,300,277 | 25,200,796 |
| 200 | 5,045,051 | 25,225,015 |
| 100 | 2,534,671 | 25,346,110 |
| 50 | 1,279,433 | 25,588,300 |
| 10 | 275,269 | 27,525,820 |
| 2 | 74,429 | 37,213,420 |
| 1 (no batching) | 47,843 | 47,841,920 |
