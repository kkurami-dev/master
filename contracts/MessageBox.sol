pragma solidity >=0.4.22 <0.7.0;
//pragma solidity 0.4.19;

// This is test contract invoked by TxProxy
// It can only record message and last sender
contract MessageBox {

    string public message;
    string public msg_nonce;
    address public sender;

    //function MessageBox(string initialMessage) public {
    constructor( string initialMessage ) public {
        message = initialMessage;
        msg_nonce = "0";
    }

    function setMessage(string newMessage) public {
        message = newMessage;
        sender = msg.sender;
    }
    
    function setMessage2(string newMessage, string newNonce) public {
        message = newMessage;
        msg_nonce = newNonce;
        sender = msg.sender;
    }

}
