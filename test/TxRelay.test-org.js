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
});
const web3 = new Web3(provider);
const config = require('../config.json');

const MessageBox = artifacts.require('MessageBox.sol')
const delay = time => new Promise(res => setTimeout(() => res(), time))

const MetaTransactionClient = require('../screens/metatx/metaTransactionClient');
const MetaTransactionServer = require('../screens/metatx/metaTransactionServer');
const Transaction = require('../screens/metatx/Transaction');

const compiledTxRelay = require('../build/contracts/TxRelay');
const compiledMessageBox = require('../build/contracts/MessageBox');
const L = require('./LogDecoder.js');

let accounts;
let txRelay;
let messageBox;
let txToServer;
let newMessage = 'Updated message for Message Box!!';

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

  console.log("compiledMessageBox deploy");
  messageBox = await new web3.eth.Contract(compiledMessageBox.abi)
    .deploy({
      data: compiledMessageBox.bytecode,
      arguments: ["Hello from message box"]
    })
    .send({
      from: accounts[0],
      gas: '2000000'
    });
  messageBox.setProvider(provider);
  console.log("before END");
  console.log("gasLimit:", web3.eth.getBlock("pending").gasLimit);
});

describe('txrelay-org', () => {

  it('deploys contracts', () => {
    assert.ok(txRelay.options.address);
    assert.ok(messageBox.options.address);
    
  });

  it('#01:can sign tranxsaction at client', async () => {
    console.log("TxRelay address is " + txRelay.options.address);
    console.log("MessageBox address is " + messageBox.options.address);

    //var event = await txRelay.Log(config.server_account.address, "log");
    //const event = messageBox.Deposit({}, {fromBlock: 0, toBlock: 'latest'})
    msg_nonce = await messageBox.methods.msg_nonce().call();
    assert.equal("0", msg_nonce);

    console.log("describe:web3.eth.sendTransaction()");
    await web3.eth.sendTransaction({
      to: config.server_account.address,
      from: accounts[1],
      value: web3.utils.toWei('1', "ether"),
      gas: '1000000'
    });

    ////////////////////////////////////////////////////////////////////////////////
    // fetch nonce of sender address tracked at TxRelay
    console.log("describe:txRelay.methods.nonce() 1");
    let nonce = await txRelay.methods.nonce(config.client_account.address).call();
    fs.writeFileSync( "abi/MessageBoxAbi.json" , JSON.stringify(compiledMessageBox.abi, " ", 2) )
    let rawTx = await MetaTransactionClient.createTx(
      compiledMessageBox.abi,
      'setMessageFrom',
      [config.client_account.address, newMessage, "0"],
      { to: messageBox.options.address,
        value: 0,
        nonce: parseInt(nonce), // nonce must match the one at TxRelay contract
        gas:      2000000,
        gasPrice: 2000000,
        gasLimit: 2000000
      });
    ////////////////////////////////////////
    txToServer = await MetaTransactionClient.createRawTxToRelay(
      rawTx,
      config.client_account.address,
      config.client_account.privateKey,
      txRelay.options.address
    );
    console.log("data", txToServer.data);
    assert.equal(config.client_account.address, txToServer.from);
  });

  it('#02:can sign tranxsaction at server', async () => {
    var nonce = await web3.eth.getTransactionCount(config.server_account.address);
    const abi = compiledTxRelay.abi;
    let signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
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
    const result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);
    L.decodeLog(result);

    var message = await messageBox.methods.message().call();
    assert.equal(newMessage, message);
    var msg_nonce = await messageBox.methods.msg_nonce().call();
    assert.equal("0", msg_nonce);
    var sender = await messageBox.methods.sender().call();
    assert.equal(config.client_account.address, sender.toLowerCase());
  });

  it('#03:increases nonce and can send transaction again', async () => {
    // fetch nonce of sender address tracked at TxRelay
    console.log("describe:txRelay.methods.nonce() 2");
    var clientAddressNonce = await txRelay.methods.nonce(config.client_account.address).call();

    // fetch nonce of sender address
    console.log("describe:web3.eth.getTransactionCount()");
    var serverAddressNonce = await web3.eth.getTransactionCount(config.server_account.address);

    var updateMessage = 'Here it updates message again';
    var messageBoxAbi = compiledMessageBox.abi;

    const rawTx = await MetaTransactionClient.createTx(
      messageBoxAbi,
      'setMessageFrom',
      [config.client_account.address, updateMessage, "3"],
      { to: messageBox.options.address,
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
    result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);
    L.decodeLog(result);

    message = await messageBox.methods.message().call();
    assert.equal(updateMessage, message);
  });

  it('#04:does not accept transaction if sender and signer is different', async () => {
    // fetch nonce of sender address tracked at TxRelay
    var clientAddressNonce = await txRelay.methods.nonce(config.client_account.address).call();

    // fetch nonce of sender address
    var serverAddressNonce = await web3.eth.getTransactionCount(config.server_account.address);

    var updateMessage = 'If this message is written to blockchain, test failed';
    var messageBoxAbi = compiledMessageBox.abi;
    var rawTx = await MetaTransactionClient.createTx(messageBoxAbi, 'setMessageFrom', [config.client_account.address, updateMessage, "4"], {
      to: messageBox.options.address,
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
        "to": txRelay.options.address,
        "nonce": parseInt(serverAddressNonce), // nonce of address which signs tx ad server
        "from": config.server_account.address
      },
      config.server_account.privateKey
    );

    try {
      const result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);
      L.decodeLog(result);
      assert(false);
    }
    catch (err) {
      assert(true);
    }

    var message = await messageBox.methods.message().call();
    assert.notEqual(updateMessage, message);
    var msg_nonce = await messageBox.methods.msg_nonce().call();
    assert.notEqual("4", msg_nonce);
  });

  it('#05:increases nonce and can send transaction again', async () => {
    /* 最も簡単な署名付きトランザクション送信 */
    var nonce = await web3.eth.getTransactionCount(config.server_account.address);
    var updateMessage = 'Here it updates message again 2';

    const sendTx = Transaction.createTx(
      /* abi  */ compiledMessageBox.abi,
      /* func */ "setMessage",
      /* arg  */ [ updateMessage ],
      /* tx   */ { to: messageBox.options.address,
                   nonce: parseInt(nonce), // nonce must match the one at TxRelay contract
                   gas: 2000000,
                   gasPrice: 2000000,
                   gasLimit: 2000000
                 },
      /* pkey */ config.server_account.privateKey);
    var result = await web3.eth.sendSignedTransaction('0x' + sendTx);
    L.decodeLog(result);

    var message = await messageBox.methods.message().call();
    assert.equal(updateMessage, message);
    var sender = await messageBox.methods.sender().call();
    assert.equal(config.server_account.address, sender.toLowerCase());
  });
});
