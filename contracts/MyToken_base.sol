pragma solidity >=0.4.22 <0.7.0;
/* -*- mode: emacs-lisp; coding: utf-8-unix -*- */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {

    address txrel;

    // This is for debug purpose
    event Log(address from, string message);

    constructor (string memory symbol, string memory token, uint8 amount) public ERC20(symbol, token) {
        _mint( msg.sender,
               amount * (10 ** uint256(decimals()))
               );
    }

    function setTxRelay(address _to) public returns (bool) {
        require(txrel == address(0), "MyToken: txrel not null.");
        txrel = _to;
        return true;
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

        require(msg.sender == txrel, "MyToken: sender not txrel addition");

        _transfer(_from, _to, _value);
        return true;
    }
}
