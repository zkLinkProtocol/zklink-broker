// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;
struct RegisteredToken {
    bool registered; // whether token registered to ZkLink or not, default is false
    bool paused; // whether token can deposit to ZkLink or not, default is false
    address tokenAddress; // the token address, zero represents eth, can be updated
}
contract zkLink {
    mapping(uint16 => RegisteredToken) public tokens;
    function acceptERC20(address accepter,
        uint32 accountId,
        address receiver,
        uint16 tokenId,
        uint128 amount,
        uint16 withdrawFeeRate,
        uint32 nonce,
        uint128 amountTransfer) external {}
    function acceptETH(address accepter,
        uint32 accountId,
        address payable receiver,
        uint128 amount,
        uint16 withdrawFeeRate,
        uint32 nonce) external payable {}
    function getPendingBalance(address _address, address _token)
        public
        view
        returns (uint128)
    {
        return 0;
    }

    function brokerAllowance(
        uint16 tokenId,
        address owner,
        address spender
    ) public view returns (uint128) {
        return 0;
    }

    function brokerApprove(
        uint16 tokenId,
        address spender,
        uint128 amount
    ) external returns (bool) {
        return true;
    }

    function acceptQuickSwap(
        address accepter,
        address receiver,
        uint16 toTokenId,
        uint128 amountOut,
        uint16 acceptTokenId,
        uint128 acceptAmountOutMin,
        uint32 nonce
    ) external payable {}
}
