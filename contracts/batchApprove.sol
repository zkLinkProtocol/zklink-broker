// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
contract BrokerAccepter is Ownable, ReentrancyGuard{
  
    receive() external payable {}

    // make a multi owner proxy to target
    function proxy(address target, bytes memory data) external onlyOwner nonReentrant {
        (bool success, ) = target.call(data);
        require(success, "proxy failed");
    }

    function batchApprove(address zklinkContract, address[] memory spenders, uint16 tokenId, uint128 amount) public onlyOwner nonReentrant{
        for(uint256 i = 0; i < spenders.length; i++){
            zklinkContract.call(
                abi.encodeWithSignature("brokerApprove(uint16,address,uint128)",
                    tokenId,
                    spenders[i],
                    amount
                )
            );
        }
    }
}
