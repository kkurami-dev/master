pragma solidity >=0.4.22 <0.7.0;
/* -*- mode: emacs-lisp; coding: utf-8-unix -*- */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract MyToken is ERC20, ERC20Detailed {

    address txrel;

    // This is for debug purpose
    event Log(address from, string message);

    constructor () public ERC20Detailed("ExampleToken", "EGT", 18) {
        _mint( msg.sender,
               10000 * (10 ** uint256(decimals()))
               );
    }

    /**
     * @dev Transfer token for a specified address
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     */
    function transferTxRelay(address _from, address _to, uint256 _value) public returns (bool) {
        emit Log( msg.sender, "msg.sender" );
        emit Log( txrel, "txrel" );
        emit Log( _to, "to" );

        _transfer(_from, _to, _value);
        return true;
    }
}
