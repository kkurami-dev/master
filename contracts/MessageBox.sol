pragma solidity >=0.4.22 <0.7.0;
//pragma solidity 0.4.19;

import '@nomiclabs/buidler/console.sol';

// This is test contract invoked by TxProxy
// It can only record message and last sender
contract MessageBox {

    string public message;
    string public msg_nonce;
    address public sender;

    event Deposit(address _from, bytes32 _id, uint _value);

    //function MessageBox(string initialMessage) public {
    constructor( string initialMessage ) public {
        console.log("constructor()");
        message = initialMessage;
        msg_nonce = "0";
    }

    function setMessage(string newMessage) public {
        console.log("setMessage() 1");
        message = newMessage;
        sender = msg.sender;
    }
    
    function setMessage2(string newMessage, string newNonce) public {
        console.log("setMessage() 2");
        message = newMessage;
        msg_nonce = newNonce;
        sender = msg.sender;
    }

}
