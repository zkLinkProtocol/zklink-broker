// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

interface zkLink {
    function accept(address accepter, address receiver, uint16 tokenId, uint128 amount, uint16 withdrawFee, uint32 nonce) external payable;
    function getPendingBalance(address _address, address _token) external view returns (uint128);
}
