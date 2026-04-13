// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/*
For some reason couldnt get etherjs to load the proxy to deploy, so this contract is just to deploy
the proxy and implementation
*/

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./Token1.sol";


contract Deploy {
    address public proxy;
    address public implementation;
    uint8 public decimals;

    constructor() {
        // Deploy implementation
        Token1 impl = new Token1();

        // Deploy proxy with initialization
        bytes memory data = abi.encodeCall(
            Token1.initialize,
            (1000000, msg.sender)
        );
        ERC1967Proxy proxy_ = new ERC1967Proxy(address(impl), data);

        proxy = address(proxy_);
        implementation = address(impl);

        // Interact via proxy address
        Token1 token = Token1(address(proxy));
        decimals = token.decimals();
    }
}
