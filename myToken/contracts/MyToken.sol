pragma solidity >=0.4.22 <0.7.0;
/* -*- mode: emacs-lisp; coding: utf-8-unix -*- */
//pragma solidity ^0.4.18;


import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract MyToken is StandardToken {

    string public name = "MyToken";
    string public symbol = "MTKN";
    uint public decimals = 18;

    address txrel;

    // This is for debug purpose
    event Log(address from, string message);

    constructor(uint initialSupply, address _txrel) public {
        totalSupply_ = initialSupply;
        balances[msg.sender] = initialSupply;
        txrel = _txrel;
    }

    // meta transaction を実行
    //
    // transferFrom( from, to, val ) msg.sendr
    //  allowed[sendr][from.msg]-- ; 送り元から徴収
    //   
    // approve( sender, val ) msg.sendr
    //  allowed[from.msg][sendr] = val; リレーした人へ報酬
    //

    /**
     * @dev Transfer token for a specified address
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     */
    function transferTxRelay(address _from, address _to, uint256 _value) public returns (bool) {
        emit Log( msg.sender, "msg.sender" );
        emit Log( txrel, "txrel" );
        emit Log( _to, "to" );
      
        require(msg.sender == txrel);
        require(_to != address(0));
        require(_value <= balances[_from]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    function set_balance(address _to, uint256 _value) public returns (bool) {
        balances[_to] = _value;
        return true;
    }
}
