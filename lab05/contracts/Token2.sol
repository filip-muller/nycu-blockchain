// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract Token2 is ERC20Upgradeable, UUPSUpgradeable, OwnableUpgradeable {

    // apparently this prevents somebody foreign from calling initialize
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 initialSupply, address owner) public initializer {
        __ERC20_init("Token", "TKN");
        __Ownable_init(owner);
        _mint(owner, initialSupply * 10 ** 18);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner{}


    // new stuff compared to Token1
    // --------------------------------------------------------------------------------------
    function randInt(uint256 max) internal view returns (uint256) {
        // prevrandao is pretty random, why not use it for a random number
        return block.prevrandao % max;
    }

    /// @notice completely wipes the balance of a random address in participants
    /// @dev Sender must be included in participants and must have the highest balance of them
    function russianRoulette(address[] calldata participants) public {
        bool senderIncluded = false;
        uint256 maxBalance = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            // check for duplicate addresses
            for (uint256 j = 0; j < i; j++) {
                require(participants[i] != participants[j], "Duplicate addresses are not allowed, no cheating!");
            }
            require(balanceOf(participants[i]) > 0, "All participants must have some balance");
            // chech that sender included themselves
            if (participants[i] == msg.sender) {
                senderIncluded = true;
            } else {
                // keep count of highest non-sender balance
                uint256 balance = balanceOf(participants[i]);
                if (balance > maxBalance) {
                    maxBalance = balance;
                }
            }
        }
        require(senderIncluded, "Sender must participate in the roulette");
        require(balanceOf(msg.sender) > maxBalance, "Sender's balance must be the biggest of all participants");

        uint256 loserInd = randInt(participants.length);
        address loser = participants[loserInd];

        _burn(loser, balanceOf(loser));
    }
}
