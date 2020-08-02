const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require("fs");

const EthereumjsTx = require('ethereumjs-tx').Transaction;
const Transaction = require('../screens/metatx/transaction.js');

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
const L = require('./LogDecoder.js');

var accounts;
var txRelay;
var txRelayAbi;
var txToServer;
var myToken;
var myTokenAbi;
var message;

async function setToken(op, func, args, ac ){
  var clientAddressNonce = await txRelay.methods.nonce(ac.address).call();
  var serverAddressNonce = await web3.eth.getTransactionCount(config.server_account.address);
  var rawTx = await MetaTransactionClient.createTx(
    op.jsonInterface,
    func,
    args,
    { to: op.address,
      value: 0,
      nonce: parseInt(clientAddressNonce),
      gas: 2000000,
      gasPrice: 2000000,
      gasLimit: 2000000
    });
  txToServer = await MetaTransactionClient.createRawTxToRelay(
    rawTx,
    ac.address,
    ac.privateKey,
    txRelay.options.address
  );
  var signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
    txRelayAbi,
    txToServer.sig,
    txToServer.to,
    txToServer.from,
    txToServer.data,
    { "gas": 2000000,
      "gasPrice": 2000000,
      "gasLimit": 2000000,
      "value": 0,
      "to": txRelay.options.address,
      "nonce": parseInt(serverAddressNonce), // nonce of address which signs tx ad server
      "from": config.server_account.address
    },
    config.server_account.privateKey
  );
  const result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);
  L.decodeLog(result);
}

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
      arguments: [ 50000 + '000000000000000000', txRelay.options.address ]
      //arguments: [ 50000e18, txRelay.options.address ]
    })
    .send({
      from: accounts[0],
      gas: '2000000'
    });
  myToken.setProvider(provider);

  txRelayAbi = txRelay.options.jsonInterface;
  myTokenAbi = myToken.options.jsonInterface;

  console.log("gasLimit:", web3.eth.getBlock("pending").gasLimit);
});

describe('txrelay', () => {
  it('deploys contracts', async () => {
    assert.ok(txRelay.options.address);
    assert.ok(myToken.options.address);
    
    console.log("TxRelay address is " + txRelay.options.address);
    console.log("MyToken address is " + myToken.options.address);

    var abi_json = JSON.stringify(myTokenAbi, " ", 2);
    fs.writeFileSync( "abi/MyTokenAbi.json" , JSON.stringify(myTokenAbi, " ", 2) )
    fs.writeFileSync( "abi/TxRelayAbiAbi.json" , JSON.stringify(txRelayAbi, " ", 2) )

    const result = await web3.eth.sendTransaction({
      to: config.server_account.address,
      from: accounts[0],
      value: web3.utils.toWei('1', "ether"),
      gas: '1000000'
    });
    L.decodeLog(result);

    await setToken( myToken.options,
              "set_balance",
              [ config.server_account.address, '1000000000000000000' ],
              config.server_account );

    console.log("address s", config.server_account.address);
    console.log("address c", config.client_account.address);

    web3.eth.getBalance(config.server_account.address).then(console.log);
    web3.eth.getBalance(config.client_account.address).then(console.log);

    console.log("balanceOf s", await myToken.methods.balanceOf(
      config.server_account.address
    ).call());
    console.log("balanceOf c", await myToken.methods.balanceOf(
      config.client_account.address
    ).call());

    //setToken(config.server_account.address, 100);
  });

  it('#01:can sign tranxsaction at client', async () => {
    var nonce = await txRelay.methods.nonce(config.server_account.address).call();
    var rawTx = await MetaTransactionClient.createTx(
      myTokenAbi,
      'transferTxRelay',
      [ config.server_account.address,
        config.client_account.address,
        "1000000" ],
      { to: myToken.options.address,
        value: 0,
        nonce: parseInt(nonce), // nonce must match the one at TxRelay contract
        gas: 2000000,
        gasPrice: 2000000,
        gasLimit: 2000000
      }
    );
    txToServer = await MetaTransactionClient.createRawTxToRelay(
      rawTx,
      config.server_account.address,
      config.server_account.privateKey,
      txRelay.options.address
    );
    console.log("data", txToServer.data);
    assert.equal(config.server_account.address, txToServer.from);
  });

  it('#02:can sign tranxsaction at server', async () => {
    const t01_old = await myToken.methods.balanceOf(config.server_account.address).call();
    var nonce = await web3.eth.getTransactionCount(config.server_account.address);
    var signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
      txRelayAbi,
      txToServer.sig,
      txToServer.to,
      txToServer.from,
      txToServer.data,
      { "gas": 2000000,
        "gasPrice": 2000000,
        "gasLimit": 2000000,
        "value": 0,
        "to": txRelay.options.address,
        "nonce": parseInt(nonce), // nonce of address which signs tx ad server
        "from": config.server_account.address
      },
      config.server_account.privateKey
    );
    const result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);
    L.decodeLog(myTokenAbi, result);
    const t01_new = await myToken.methods.balanceOf(config.server_account.address).call();
    assert.notEqual(t01_old, t01_new);

    // const msg_nonce = await myToken.methods.msg_nonce().call();
    // assert.equal("0", msg_nonce);
    
    // const sender = await myToken.methods.sender().call();
    // assert.equal(txRelay.options.address, sender);
  });
  return;

  it('#03:increases nonce and can send transaction again', async () => {
    // fetch nonce of sender address tracked at TxRelay
    console.log("describe:txRelay.methods.nonce() 2");
    var clientAddressNonce = await txRelay.methods.nonce(config.client_account.address).call();

    // fetch nonce of sender address
    console.log("describe:web3.eth.getTransactionCount()");
    var serverAddressNonce = await web3.eth.getTransactionCount(config.server_account.address);

    var updateMessage = 'Here it updates message again';
    var rawTx = await MetaTransactionClient.createTx(
      myTokenAbi,
      'transferTxRelay',
      [accounts[0], accounts[1], "3"],
      {to: myToken.options.address,
       nonce: parseInt(clientAddressNonce),
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
      txRelayAbi,
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

  it('#04:does not accept transaction if sender and signer is different', async () => {
    // fetch nonce of sender address tracked at TxRelay
    var clientAddressNonce = await txRelay.methods.nonce(config.client_account.address).call();

    // fetch nonce of sender address
    var serverAddressNonce = await web3.eth.getTransactionCount(config.server_account.address);

    var updateMessage = 'If this message is written to blockchain, test failed';
    var rawTx = await MetaTransactionClient.createTx(
      myTokenAbi,
      'transferTxRelay',
      [accounts[0], accounts[1], "3"],
      {to: myToken.options.address,
       nonce: parseInt(clientAddressNonce), 
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
      txRelayAbi,
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
      L.decodeLog(myTokenAbi, result);
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
