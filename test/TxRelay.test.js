const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider({
  "debug": true
});
const web3 = new Web3(provider);

const appli = "../client/";
const config = require(appli + 'src/configs/config.json');
const MetaTransactionClient = require(appli + 'src/metatx/metaTransactionClient');
const MetaTransactionServer = require(appli + 'src/metatx/metaTransactionServer');

const compiledTxRelay = require(appli + 'src/contracts/TxRelay');
const compiledMessageBox = require(appli + 'src/contracts/MessageBox');

let accounts;
let txRelay;
let messageBox;
let txToServer;
let newMessage = 'Updated message for Message Box!!';

async function getlog(no){
  // eth_getLogs eth_getUncleByBlockNumberAndIndex
  //await web3.eth.getUncleByBlock(no, 0)
  let arr = [];
  //for ( x in no ){
  for ( let x = 0; x <= no; x++ ){
    await web3.eth.getBlock(x)
      .then(function(res){
        // console.group("getBlock( %d ) web3.version:", x, web3.version);
        // console.log("gasUsed:", res.gasUsed);
        // console.log("timestamp:", res.timestamp);
        // console.groupEnd();
        arr.push(res);

        // transactionHash
        //console.log("timestamp:", res.transactions );
        for( let x in res.transactions ){
          let tx = res.transactions[x]
          web3.eth.getTransaction(tx, function(e, transaction){
            web3.eth.getTransactionReceipt(tx, function(e, receipt){
              //console.log("receipt", receipt);
            })
          });
        }
      });
  }
  return arr;
}

before( async () => {
  accounts = await web3.eth.getAccounts();

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

});

describe('txrelay', () => {

  it('#00:deploys contracts', () => {
    assert.ok(txRelay.options.address);
    assert.ok(messageBox.options.address);

    console.log("TxRelay address is " + txRelay.options.address);
    console.log("MessageBox address is " + messageBox.options.address);
  });

  it('#01:can sign tranxsaction at client', async () => {
    await web3.eth.sendTransaction({
      to: config.server_account.address,
      from: accounts[1],
      value: web3.utils.toWei('1', "ether"),
      gas: '1000000'
    });

    // fetch nonce of sender address tracked at TxRelay
    let nonce = await txRelay.methods.nonce(config.client_account.address).call();
    let data = await messageBox.methods.setMessageTxRelay(
      config.client_account.address,
      newMessage
    ).encodeABI();
    let rawTx = await MetaTransactionClient.createTxA(
      data,
      {
        to: messageBox.options.address,
        value: 0,
        nonce: parseInt(nonce), // nonce must match the one at TxRelay contract
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

    assert.equal(config.client_account.address, txToServer.from);
  });

  it('#02:can sign tranxsaction at server', async () => {
    // fetch nonce of sender address
    let nonce = await web3.eth.getTransactionCount(config.server_account.address);
    let signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
      compiledTxRelay.abi,
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
    let result;
    result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);

    // show Log event at TxRelay contract
    result.logs.forEach((value, index, ar) => {
      let log = value;
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

    let data_h = await txRelay.methods.g_data_h().call();
    let send_h = await txRelay.methods.g_send_h().call();
    //assert.equal(data_h, send_h);
    console.log("diff check", data_h, send_h);

    let message = await messageBox.methods.message().call();
    assert.equal(newMessage, message);

    let sender = await messageBox.methods.sender().call();
    assert.equal(config.client_account.address.toUpperCase(), sender.toUpperCase());
  });

  let blockNumber = 0;
  it('#03:increases nonce and can send transaction again', async () => {

    // fetch nonce of sender address tracked at TxRelay
    let clientAddressNonce = await txRelay.methods.nonce(config.client_account.address).call();

    // fetch nonce of sender address
    let serverAddressNonce = await web3.eth.getTransactionCount(config.server_account.address);

    let updateMessage = 'Here it updates message again';
    let data = await messageBox.methods.setMessageTxRelay(
      config.client_account.address,
      newMessage
    ).encodeABI();
    let rawTx = await MetaTransactionClient.createTxA(
      data,
      {
        to: messageBox.options.address,
        value: 0,
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

    let signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
      compiledTxRelay.abi,
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
        "nonce": parseInt(serverAddressNonce), // nonce of address which signs tx ad server
        "from": config.server_account.address
      },
      config.server_account.privateKey
    );

    const result = await web3.eth.sendSignedTransaction('0x' + signedTxToRelay);
    console.log(result);
    blockNumber = result.blockNumber;

    let message = await messageBox.methods.message().call();
    assert.equal(updateMessage, message);
  });

  it('#03.5:getlogs', async () => {
    let arr = await getlog(blockNumber);
    //console.log(arr);

    // web3.eth.getPastEvents('Event', {
    //   fromBlock: 0,
    //   toBlock: 'latest',
    //   filter: {
    //     p4: 29,
    //   },
    // });
  });
  return;

  it('#04:does not accept transaction if sender and signer is different', async () => {
    // fetch nonce of sender address tracked at TxRelay
    let clientAddressNonce = await txRelay.methods.nonce(config.client_account.address).call();

    // fetch nonce of sender address
    let serverAddressNonce = await web3.eth.getTransactionCount(config.server_account.address);

    let updateMessage = 'If this message is written to blockchain, test failed';
    let data = await messageBox.methods.setMessageTxRelay(
      config.client_account.address,
      newMessage
    ).encodeABI();
    let rawTx = await MetaTransactionClient.createTxA(
      data,
      {
        to: messageBox.options.address,
        value: 0,
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

    let signedTxToRelay = await MetaTransactionServer.createRawTxToRelay(
      compiledTxRelay.abi,
      txToServer.sig,
      txToServer.to,
      config.server_account.address, // Since this is different from signer, this transaction should fail
      txToServer.data,
      {
        "gas": 2000000,
        "gasPrice": 2000000,
        "gasLimit": 2000000,
        "value": 0,
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

    let message = await messageBox.methods.message().call();
    assert.notEqual(updateMessage, message);
  });

});
