pragma solidity >=0.4.22 <0.7.0;
//pragma solidity 0.4.19;

// This is test contract invoked by TxProxy
// It can only record message and last sender
contract MessageBox {

    string public message;
    address public sender;

    //function MessageBox(string initialMessage) public {
    constructor( string initialMessage ) public {
        message = initialMessage;
    }

    function setMessage(string newMessage) public {
        message = newMessage;
        sender = msg.sender;
    }

}

