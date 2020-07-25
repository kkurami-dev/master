const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require("fs");

var pattern = /^[A-Z0-9]+$/;
var logger = {
  log: function(message) {
    if (pattern.test(message)){
    } else {
      //console.log(message);
    }
  }
};
const provider = ganache.provider({
  "debug": true,
  "allowUnlimitedContractSize": true,
  "logger": logger
//  "gasLimit": 80000000,
//  "gas": 90000000
});
const web3 = new Web3(provider);
const config = require('../config.json');

const delay = time => new Promise(res => setTimeout(() => res(), time))

const MetaTransactionClient = require('../screens/metatx/metaTransactionClient');
const MetaTransactionServer = require('../screens/metatx/metaTransactionServer');

const compiledTxRelay = require('../build/contracts/TxRelay');
const compiledMyToken = require('../build/contracts/MyToken');

var accounts;
var txRelay;
var txToServer;
var myToken;
var message;

before( async () => {
  console.log("before START");
  accounts = await web3.eth.getAccounts();

  console.log("compiledTxRelay deploy");
  txRelay = await new web3.eth.Contract(compiledTxRelay.abi)
    .deploy({
      data: compiledTxRelay.bytecode,
      arguments: []
    })
    .send({
      from: accounts[0],
      gas: '2000000'
    });
  txRelay.setProvider(provider);

  console.log("compiledMyToken deploy");
  myToken = await new web3.eth.Contract(compiledMyToken.abi)
    .deploy({
      data: compiledMyToken.bytecode,
      arguments: [ 50000e18, txRelay.options.address ]
    })
    .send({
      from: accounts[0],
      gas: '2000000'
    });
  myToken.setProvider(provider);

  console.log("gasLimit:", web3.eth.getBlock("pending").gasLimit);
  
});

describe('txrelay', () => {

  it('deploys contracts', () => {
    assert.ok(txRelay.options.address);
    assert.ok(myToken.options.address);
    
    console.log("TxRelay address is " + txRelay.options.address);
    console.log("MyToken address is " + myToken.options.address);

    var abi_json = JSON.stringify(compiledMyToken.abi, "\t");
    fs.writeFileSync( "my_token.json" , abi_json )
  });

  it('can sign tranxsaction at client', async () => {
    //var event = await txRelay.Log(config.server_account.address, "log");
    //const event = myToken.Deposit({}, {fromBlock: 0, toBlock: 'latest'})
    msg_nonce = await myToken.methods.msg_nonce().call();
    assert.equal("0", msg_nonce);

    console.log("describe:web3.eth.sendTransaction()");
    await web3.eth.sendTransaction({
      to: config.server_account.address,
      from: accounts[0],
      value: web3.utils.toWei('1', "ether"),
      gas: '1000000'
    });

    var a0 = myToken.balanceOf(accounts[0]);
    var a1 = myToken.balanceOf(accounts[1]);
    console.log("balanceOf", a0, a1);

    ////////////////////////////////////////////////////////////////////////////////
    // fetch nonce of sender address tracked at TxRelay
    console.log("describe:txRelay.methods.nonce() 1");
    var nonce = await txRelay.methods.nonce(config.client_account.address).call();
    //console.log("compiledMyToken.abi", abi_json);
    var rawTx = await MetaTransactionClient.createTx(
      compiledMyToken.abi,
      'setMessage2',
      [newMessage, "0"],
      {
        to: accounts[1],
        from: accounts[0],
        value: 0,
        nonce: parseInt(nonce), // nonce must match the one at TxRelay contract
        gas:      2000000,
        gasPrice: 2000000,
        gasLimit: 2000000
      }
    );
    ////////////////////////////////////////
    txToServer = await MetaTransactionClient.createRawTxToRelay(
      rawTx,
      config.client_account.address,
      config.client_account.privateKey,
      txRelay.options.address
    );
    assert.equal(config.client_account.address, txToServer.from);
    //assert.equal('0x'+ txToServer.to, myToken.options.address);
  });

  it('can sign tranxsaction at server', async () => {
    ////////////////////////////////////////
    // fetch nonce of sender address
    console.log("describe:web3.eth.getTransactionCount()");
    var nonce = await web3.eth.getTransactionCount(config.server_account.address);

    console.log("describe:MetaTransactionServer.createRawTxToRelay()");
    const abi = compiledTxRelay.abi;
    var signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
      abi,
      txToServer.sig,
      txToServer.to,
      txToServer.from,
      txToServer.data,
      {
        "gas": 2000000,
        "gasPrice": 2000000,
        "gasLimit": 2000000,
        "value": 0,
        "to": txRelay.options.address,
        "nonce": parseInt(nonce), // nonce of address which signs tx ad server
        "from": config.server_account.address
      },
      config.server_account.privateKey
    );

    console.log("describe:web3.eth.sendSignedTransaction()");
    const result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);
    ////////////////////////////////////////////////////////////////////////////////

    // show Log event at TxRelay contract
    console.log("result", result);
    result.logs.forEach((value, index, ar) => {
      var log = value;
      console.log(web3.eth.abi.decodeLog([
        {
          type: 'address',
          name: 'from'
        },
        {
          type: 'string',
          name: 'message'
        }
      ], log.data, log.topics))
    });

    message = await myToken.methods.message().call();
    assert.equal(newMessage, message);

    msg_nonce = await myToken.methods.msg_nonce().call();
    assert.equal("0", msg_nonce);
    
    sender = await myToken.methods.sender().call();
    assert.equal(txRelay.options.address, sender);
  });
  //return;

  it('increases nonce and can send transaction again', async () => {
    // fetch nonce of sender address tracked at TxRelay
    console.log("describe:txRelay.methods.nonce() 2");
    var clientAddressNonce = await txRelay.methods.nonce(config.client_account.address).call();

    // fetch nonce of sender address
    console.log("describe:web3.eth.getTransactionCount()");
    var serverAddressNonce = await web3.eth.getTransactionCount(config.server_account.address);

    var updateMessage = 'Here it updates message again';
    var myTokenAbi = compiledMyToken.abi;
    var rawTx = await MetaTransactionClient.createTx(myTokenAbi, 'setMessage2', [updateMessage, "3"], {
      to: myToken.options.address,
//      value: 0,
      nonce: parseInt(clientAddressNonce), // nonce must match the one at TxRelay contract
      gas: 2000000,
      gasPrice: 2000000,
      gasLimit: 2000000
    });
    txToServer = await MetaTransactionClient.createRawTxToRelay(
      rawTx,
      config.client_account.address,
      config.client_account.privateKey,
      txRelay.options.address
    );

    console.log("describe:MetaTransactionServer.createRawTxToRelay()");
    var signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
      compiledTxRelay.abi,
      txToServer.sig,
      txToServer.to,
      txToServer.from,
      txToServer.data,
      {
        "gas": 2000000,
        "gasPrice": 2000000,
        "gasLimit": 2000000,
//        "value": 0,
        "to": txRelay.options.address,
        "nonce": parseInt(serverAddressNonce), // nonce of address which signs tx ad server
        "from": config.server_account.address
      },
      config.server_account.privateKey
    );

    const result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);

    const message = await myToken.methods.message().call();
    assert.equal(updateMessage, message);
    const sender = await myToken.methods.sender().call();
    assert.equal(sender, txToServer.from);
  });

  it('does not accept transaction if sender and signer is different', async () => {
    // fetch nonce of sender address tracked at TxRelay
    var clientAddressNonce = await txRelay.methods.nonce(config.client_account.address).call();

    // fetch nonce of sender address
    var serverAddressNonce = await web3.eth.getTransactionCount(config.server_account.address);

    var updateMessage = 'If this message is written to blockchain, test failed';
    var myTokenAbi = compiledMyToken.abi;
    var rawTx = await MetaTransactionClient.createTx(myTokenAbi, 'setMessage2', [updateMessage, "4"], {
      to: myToken.options.address,
//      value: 0,
      nonce: parseInt(clientAddressNonce), // nonce must match the one at TxRelay contract
      gas: 2000000,
      gasPrice: 2000000,
      gasLimit: 2000000
    });
    txToServer = await MetaTransactionClient.createRawTxToRelay(
      rawTx,
      config.client_account.address,
      config.client_account.privateKey,
      txRelay.options.address
    );

    var signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
      compiledTxRelay.abi,
      txToServer.sig,
      txToServer.to,
      config.server_account.address, // Since this is different from signer, this transaction should fail
      txToServer.data,
      {
        "gas": 2000000,
        "gasPrice": 2000000,
        "gasLimit": 2000000,
//        "value": 0,
        "to": txRelay.options.address,
        "nonce": parseInt(serverAddressNonce), // nonce of address which signs tx ad server
        "from": config.server_account.address
      },
      config.server_account.privateKey
    );

    try {
      const result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);
      assert(false);
    }
    catch (err) {
      assert(true);
    }

    message = await myToken.methods.message().call();
    assert.notEqual(updateMessage, message);
    msg_nonce = await myToken.methods.msg_nonce().call();
    assert.notEqual("4", msg_nonce);
    console.log("message:", message);
    console.log("msg_nonce:", msg_nonce);
  });
});
