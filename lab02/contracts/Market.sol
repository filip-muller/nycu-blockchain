// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Market is Ownable {

    struct TradeOrder {
        address placingTrader;
        uint256 token1Amount;
        uint256 token2Amount;
        bool buyingToken1;
        uint256 expiry;
        bool active;
    }

    event TradeSetup(uint256 orderId, address inputTokenForSale, uint256 inputTokenAmount, uint256 outputTokenAsk, uint256 expiry);
    event TradeFulfilled(uint256 id);

    TradeOrder[] public tradeOrders;

    address public token1;
    address public token2;

    uint256 public constant FEE_BPS = 10;

    uint256 internal collectedFeeToken1;
    uint256 internal collectedFeeToken2;

    constructor(address _token1, address _token2) Ownable(msg.sender) {
        token1 = _token1;
        token2 = _token2;
    }

    function setupTrade(address inputTokenForSale, uint256 inputTokenAmount, uint256 outputTokenAsk, uint256 expiry) external returns (uint256) {
        require(inputTokenForSale == token1 || inputTokenForSale == token2, "Invalid input token address");
        bool buyingToken1 = true;
        uint256 token1Amount = outputTokenAsk;
        uint256 token2Amount = inputTokenAmount;
        if (inputTokenForSale == token1) {
            buyingToken1 = false;
            token1Amount = inputTokenAmount;
            token2Amount = outputTokenAsk;
        }
        // take the tokens from the trader (reverts on failure)
        IERC20(inputTokenForSale).transferFrom(msg.sender, address(this), inputTokenAmount);
        // then set up the trade
        tradeOrders.push(TradeOrder(msg.sender, token1Amount, token2Amount, buyingToken1, expiry, true));
        // id is the index in tradeOrders for simplicity
        uint256 orderId = tradeOrders.length - 1;
        emit TradeSetup(orderId, inputTokenForSale, inputTokenAmount, outputTokenAsk, expiry);
        return orderId;
    }

    /// @notice Settling a trade charges a 0.1% fee, deducted from the tokens you get
    function settleTrade(uint256 id) external {
        require(id < tradeOrders.length, "Invalid trade id");
        TradeOrder storage order = tradeOrders[id];
        require(order.active, "Trade is not active anymore");
        require(order.expiry > block.timestamp, "Trade is expired");
        // change order status to inactive first
        order.active = false;
        if (order.buyingToken1) {
            // first send token 1 from the taker
            IERC20(token1).transferFrom(msg.sender, order.placingTrader, order.token1Amount);
            // deduct fee on taker side
            uint256 fee = _calculateFee(order.token2Amount);
            uint256 amountAfterFee = order.token2Amount - fee;
            // then give him token 2, reduced by the fee
            IERC20(token2).transfer(msg.sender, amountAfterFee);
            // if transactions were successful, fee got accumulated
            collectedFeeToken2 += fee;
        } else {
            IERC20(token2).transferFrom(msg.sender, order.placingTrader, order.token2Amount);
            uint256 fee = _calculateFee(order.token1Amount);
            uint256 amountAfterFee = order.token1Amount - fee;
            IERC20(token1).transfer(msg.sender, amountAfterFee);
            collectedFeeToken1 += fee;
        }
        emit TradeFulfilled(id);
    }

    /// @notice Can be used for reclaiming tokens from expired orders
    function cancelTrade(uint256 id) external {
        require(id < tradeOrders.length, "Invalid trade id");
        TradeOrder storage order = tradeOrders[id];
        require(order.placingTrader == msg.sender, "You can only cancel your trade orders");
        require(order.active, "Trade is not active anymore");
        order.active = false;
        if (order.buyingToken1) {
            IERC20(token2).transfer(order.placingTrader, order.token2Amount);
        } else {
            IERC20(token1).transfer(order.placingTrader, order.token1Amount);
        }
    }

    function _calculateFee(uint256 orderAmount) internal pure returns (uint256) {
        return orderAmount * FEE_BPS / 10_000;
    }

    function withdrawFee() external onlyOwner {
        // could the owner use this to drain the contract by reentrancy if the tokens are not malicious?
        // Like is there any way to call back into the function with ERC20 transfers?
        IERC20(token1).transfer(owner(), collectedFeeToken1);
        IERC20(token2).transfer(owner(), collectedFeeToken2);
        collectedFeeToken1 = 0;
        collectedFeeToken2 = 0;
    }
}
