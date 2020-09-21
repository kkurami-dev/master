pragma solidity >=0.4.22 <0.7.0;
/* -*- mode: emacs-lisp; coding: utf-8-unix -*- */
//pragma solidity ^0.5.0;

//pragma solidity ^0.6.0;
//pragma solidity ^0.4.18;

//import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
//import "@zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// ParsedContract.sol:15:1: ParserError: Expected pragma, import directive or contract/interface/library definition.
// ParsedContract.sol  ParserError

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract MyToken is ERC20, ERC20Detailed {
//contract MyToken is ERC721 {

    address txrel;

    // This is for debug purpose
    event Log(address from, string message);

    constructor () public ERC20Detailed("ExampleToken", "EGT", 18) {
        _mint( msg.sender,
               10000 * (10 ** uint256(decimals()))
               );
    }

    //ERC721("MyCollectible", "MCO")
    /* constructor(uint initialSupply, address _txrel) */
    /*     public { */
    /*     totalSupply_ = initialSupply; */
    /*     balances[msg.sender] = initialSupply; */
    /*     txrel = _txrel; */
    /* } */

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

        _transfer(_from, _to, _value);
        return true;
    }
}
