pragma solidity >=0.4.22 <0.7.0;
// -*- mode: emacs-lisp; coding: utf-8-unix -*-
//pragma solidity 0.4.19;

// https://github.com/trufflesuite/truffle-logger-example
// consol --network --show-log-statements
//import "truffle/Console.sol";

// This contract is heavily inspired by uPort from https://github.com/uport-project/uport-identity/blob/develop/contracts/TxRelay.sol
contract TxRelay {

    // Note: This is a local nonce.
    // Different from the nonce defined w/in protocol.
    mapping(address => uint) public nonce;

    // This is for debug purpose
    event Log(address from, string message);
    event Log1(bytes32 b, string message);

    /*
     * @dev Relays meta transactions
     * @param sigV, sigR, sigS ECDSA signature on some data to be forwarded
     * @param destination Location the meta-tx should be forwarded to
     * @param data The bytes necessary to call the function in the destination contract.
     * @param sender address of sender who originally signed data
     */
    function relayMetaTx(
        uint8 sigV,
        bytes32 sigR,
        bytes32 sigS,
        address destination,
        bytes memory data,
        address sender
    ) public {

        // EIP-1344 ( Replay Problem )
        // https://www.youtube.com/watch?v=91X5wzgYlEg

        // EIP-1884Re-Entrancy 
        
        // use EIP 191
        // 0x19 :: version :: relay :: sender :: nonce :: destination :: data
        //bytes32 h = sha3(byte(0x19), byte(0), this, sender, nonce[sender], destination, data);
        //bytes32 h = sha3(abi.encodePacked(byte(0x19), byte(0), this, sender, nonce[sender], destination, data));
        bytes32 h = keccak256(abi.encodePacked(byte(0x19), byte(0), this, sender, nonce[sender], destination, data));

        address addressFromSig = ecrecover(h, sigV, sigR, sigS);

        // address recovered from signature must match with claimed sender
        require(sender == addressFromSig, "diff sender");

        //if we are going to do tx, update nonce
        nonce[sender]++;

        // 
        bytes32 data_h = b20h( data );
        bytes32 send_h = keccak256( abi.encodePacked( sender ) );
        require(send_h == data_h, "TxRelay() diff _from");
        /* address data_h = b20a( data ); */
        /* require(sender == data_h, "TxRelay() diff _from"); */

        /* emit Log(address(data_h), "data_h"); */
        /* emit Log(address(send_h), "send_h"); */

        //Console.log("destination", destination);
        //emit Log( msg.sender, "TxRelay() msg.sender" );
        //emit Log( sender, "sender" );
        //emit Log( destination, "TxRelay() destination" );

        // 12345678
        // invoke method on behalf of sender
        require(destination.call(data), "TxRelay() call error");
    }

    function b20h(bytes memory data) public pure returns( bytes32 ) {
        bytes memory frombyte = new bytes(20);
        for (uint j = 0; j < 20; j++) {
            frombyte[j] = data[ 16 + j];
        }
        bytes32 data_h = keccak256( frombyte );
    }
    /* function b20a(bytes memory data) public pure returns( address ) { */
    /*     if( data.length < 32 ) return 0; */
    /*     uint len = data.length - 32; */
    /*     (bytes memory fid, address data_h, bytes memory dummy ) = */
    /*         abi.decode( data, (bytes[2], address, bytes )); */
    /*     return data_h; */
    /* } */
}

