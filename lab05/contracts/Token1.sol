// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract Token1 is ERC20Upgradeable, UUPSUpgradeable, OwnableUpgradeable {

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
}
