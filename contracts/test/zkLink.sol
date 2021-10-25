// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

contract zkLink {
    

    function accept(
        address accepter,
        address receiver,
        uint16 tokenId,
        uint128 amount,
        uint16 withdrawFee,
        uint32 nonce
    ) external payable {}

    function getPendingBalance(address _address, address _token)
        public
        view
        returns (uint128)
    {
        return 0;
    }

    function acceptQuickSwap(
        address accepter, 
        address receiver, 
        uint16 toTokenId, 
        uint128 amountOut, 
        uint16 acceptTokenId, 
        uint128 acceptAmountOutMin, 
        uint32 nonce) external payable returns (bytes32) {}
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
}
