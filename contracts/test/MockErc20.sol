// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockErc20 is ERC20{
    constructor (string memory name_, string memory symbol_, uint8 decimals_) public ERC20(name_, symbol_) {
        _setupDecimals(decimals_);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}