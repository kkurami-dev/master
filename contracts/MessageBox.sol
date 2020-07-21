pragma solidity >=0.4.22 <0.7.0;
//pragma solidity 0.4.19;

import '@nomiclabs/buidler/console.sol';

// This is test contract invoked by TxProxy
// It can only record message and last sender
contract MessageBox {

    string public message;
    string public msg_nonce;
    address public sender;

    // This is for debug purpose
    event Log(address from, string message);

    //function MessageBox(string initialMessage) public {
    constructor( string initialMessage ) public {
        emit Log(msg.sender, "constructor()");
        message = initialMessage;
        msg_nonce = "0";
    }

    function setMessage(string newMessage) public {
        emit Log(msg.sender, "setMessage() 1");
        message = newMessage;
        sender = msg.sender;
    }
    
    function setMessage2(string newMessage, string newNonce) public {
        emit Log(msg.sender, "setMessage() 2");
        message = newMessage;
        msg_nonce = newNonce;
        sender = msg.sender;
    }

    function setMessage3(string newMessage, string newNonce) public {
        emit Log(msg.sender, "setMessage() 3");
        message = newMessage;
        msg_nonce = newNonce;
        message = newMessage;
        msg_nonce = newNonce;
        sender = msg.sender;
    }

}
