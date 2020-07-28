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

var accounts;
var txRelay;
var txRelayAbi;
var txToServer;
var myToken;
var myTokenAbi;
var message;

async function sendSignedTx(address, abi, functionName, args, keyp ){
  const nonce = await web3.eth.getTransactionCount(keyp.address);
  const params = {
    to: address,
    nonce: nonce,
    gas: 2000000,
    gasPrice: 2000000,
    gasLimit: 2000000
  };
  const wrapperTx = new EthereumjsTx(params);
  const rowTx = Transaction.createTx(abi,
                                     functionName,
                                     args,
                                     wrapperTx,
                                     keyp.privateKey);
  web3.eth.sendSignedTransaction('0x' + rowTx)
    .on('receipt', console.log);

  /*  
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
  var Tx = require('ethereumjs-tx');
  var privateKey = 
  var rawTx = {
    nonce: '0x00',
    gasPrice: '0x09184e72a000',
    gasLimit: '0x2710',
    to: '0x0000000000000000000000000000000000000000',
    value: '0x00',
    data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
  }

  var tx = new Tx(rawTx);
  tx.sign(privateKey);

  var serializedTx = tx.serialize();
*/
  // console.log(serializedTx.toString('hex'));
  // 0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f
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
    fs.writeFileSync( "my_token.json" , abi_json )

    await web3.eth.sendTransaction({
      to: config.server_account.address,
      from: accounts[0],
      value: web3.utils.toWei('1', "ether"),
      gas: '1000000'
    });

    // const a0 = await sendSignedTx(myToken.options.address,
    //                         myTokenAbi,
    //                         "balanceOf",
    //                         [accounts[0]],
    //                         config.server_account );
/*                           
    var contract = new web3.eth.Contract(myTokenAbi, myToken.options.address);
    var batch = new web3.BatchRequest();
    //var batch = web3.createBatch();
    batch.add(contract.methods.balanceOf(accounts[0]).call.request({from: accounts[0]}, function(error, result){ 
      if(!error){
        a0 = result;
      } else{
        console.log(error);//transaction failed
      }
    }));
    batch.add(contract.methods.balanceOf(accounts[0]).call.request({from: accounts[1]}, function(error, result){ 
      if(!error){
        a1 = result;
      } else{
        console.log(error);//transaction failed
      }
    }));
    //batch.execute();
    
    // var a0 = myToken.methods.balanceOf(accounts[0]).call();
    // var a1 = myToken.methods.balanceOf(accounts[1]).call();
    console.log("balanceOf", a0, a1);
*/

    console.log("balanceOf 0", await myToken.methods.balanceOf(accounts[0]).call());
    console.log("balanceOf 1", await myToken.methods.balanceOf(accounts[1]).call());
  });

  it('#01:can sign tranxsaction at client', async () => {
    //var event = await txRelay.Log(config.server_account.address, "log");
    //const event = myToken.Deposit({}, {fromBlock: 0, toBlock: 'latest'})

    ////////////////////////////////////////////////////////////////////////////////
    // fetch nonce of sender address tracked at TxRelay
    console.log("describe:txRelay.methods.nonce() 1");
    var nonce = await txRelay.methods.nonce(config.client_account.address).call();
    //console.log("myTokenAbi", abi_json);
    var rawTx = await MetaTransactionClient.createTx(
      myTokenAbi,
      'transferTxRelay',
      [ accounts[0],
        accounts[1],
        "1000000" ],
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

  it('#02:can sign tranxsaction at server', async () => {
    const t01_old = await myToken.methods.balanceOf(accounts[0]).call();
    
    ////////////////////////////////////////
    // fetch nonce of sender address
    console.log("describe:web3.eth.getTransactionCount()");
    var nonce = await web3.eth.getTransactionCount(config.server_account.address);

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

    const t01_new = await myToken.methods.balanceOf(accounts[0]).call();
    assert.notEqual(t01_old, t01_new);

    const msg_nonce = await myToken.methods.msg_nonce().call();
    assert.equal("0", msg_nonce);
    
    const sender = await myToken.methods.sender().call();
    assert.equal(txRelay.options.address, sender);
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
