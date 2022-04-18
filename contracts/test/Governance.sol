// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;
struct RegisteredToken {
    bool registered; // whether token registered to ZkLink or not, default is false
    bool paused; // whether token can deposit to ZkLink or not, default is false
    address tokenAddress; // the token address, zero represents eth, can be updated
}
contract Governance {
    mapping(uint16 => RegisteredToken) public tokens;
    /*function getToken(uint16 _tokenId) external view returns (RegisteredToken memory) {
        return RegisteredToken({registered:false,paused:false,tokenAddress:address(0)});
    }*/
}
