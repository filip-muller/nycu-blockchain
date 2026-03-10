// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;


contract EthVault {
    address public immutable owner;

    event Deposit(address indexed sender, uint256 amount);
    event WeethDraw(address indexed to, uint256 amount);
    event UnauthorizedWithdrawAttempt(address indexed caller, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        if (msg.sender != owner) {
            // only allow the owner to withdraw
            emit UnauthorizedWithdrawAttempt(msg.sender, amount);
            // I assume since we must not revert we just return
            return;
        }
        // can only withdraw as much as the contact has
        require(amount <= address(this).balance, "Not enough funds");

        // send the funds to caller (owner)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Something went wrong");
    }
}
