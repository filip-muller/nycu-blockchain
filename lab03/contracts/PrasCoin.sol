// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract PrasCoin is ERC20 {
    mapping(address => uint256) public nonces;

    constructor() ERC20("PrasCoin", "PRS") {
        _mint(msg.sender, 100_000_000 * 10 ** 18);
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 nonce,
        uint256 deadline,
        bytes memory signature
    ) public {
        require(block.timestamp <= deadline, "too late");
        require(nonce == nonces[owner], "old nonce sorry");

        bytes32 hash_ = keccak256(
            abi.encodePacked(
                owner,
                spender,
                value,
                nonce,
                deadline,
                address(this)
            )
        );
        // apparently there is some prefix that gets added by the most common off-chain function and we want to match that
        hash_ = MessageHashUtils.toEthSignedMessageHash(hash_);

        // get signer and check if it is the owner
        address signer = ECDSA.recover(hash_, signature);
        require(signer == owner, "Not signed by owner");

        // increment nonce to prevent reuse
        nonces[owner] += 1;
        // give allowance
        _approve(owner, spender, value);
    }
}
