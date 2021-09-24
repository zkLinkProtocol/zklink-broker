// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TransferHelper.sol";

contract BrokerAccepter is Ownable{

    function batchApprove(address zklinkContract, address[] memory spenders, uint16 tokenId, uint128 amount) public onlyOwner{
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

    function dynamicCall(address contractAddress, bytes memory data) external onlyOwner {
        contractAddress.call(data);
    }

    function bacthTransfer(address[] memory spenders, uint256 amount, uint256 filter) payable public onlyOwner {
        for(uint256 i = 0; i < spenders.length; i++){
            if( spenders[i].balance < filter) {
                payable(spenders[i]).send(amount);
            }
        }
        if(address(this).balance > 0){
            msg.sender.send(address(this).balance);
        }  
    }

     ///the owner can withdraw any erc20 token from himself
    function withdraw(address token, address to, uint256 amount) external onlyOwner {
        TransferHelper.safeTransfer(token, to, amount);
    }

    ///withdraw eth from this contract
    // return HT
    function withdrawETH(address to, uint256 amount) external onlyOwner {
        TransferHelper.safeTransferETH(to, amount);
    }

}
