pragma solidity >=0.4.22 <0.7.0;
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
        bytes data,
        address sender
    ) public {

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

        // (methodId, to_adr, amount) = abi.decode(data, (bytes4, address, uint256));
        // emit Log( to_adr, "TxRelay() to_adr" );
        // emit Log( destination, "destination" );

        //Console.log("destination", destination);
        //emit Log( msg.sender, "msg.sender" );
        //emit Log( sender, "sender" );
        //emit Log( destination, "destination" );

        // invoke method on behalf of sender
        require(destination.call(data), "call");
    }
}

