/* global BigInt */
/**
 * https://gigazine.net/news/20200528-aws-one-line-explanation/
 */
var AWS = require('aws-sdk'),
    Web3 = require('web3'),
    MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient,
    util = require("ethereumjs-util"),
    ethereumjs_tx = require("ethereumjs-tx"),
    Common = require('ethereumjs-common').default,
    kap = require('aws-kms-provider');// 0.2.1 // ブラウザからは実行できない(ローカルファイルの参照がある)
/*
    "aws-kms-provider": {
      "version": "0.2.1",
      "resolved": "https://registry.npmjs.org/aws-kms-provider/-/aws-kms-provider-0.2.1.tgz",
      "integrity": "sha512-fMdf0Q3PY0GKOVuCgXwTFvNMyUTqKjS+4pg9nTy2a2pPrD7zugFoUcs7F+xaHrvXwI7pj4Ggs4ltw/bsFFugNA==",
      "requires": {
        "asn1js": "^2.0.26",
        "bn.js": "^5.1.1",
        "ethereumjs-common": "^1.5.0",
        "ethereumjs-tx": "^2.1.2",
        "ethereumjs-util": "^7.0.3",
        "jayson": "^3.3.3",
        "keccak": "^3.0.0",
        "secp256k1": "4.0",
        "web3": "^1.2.6",
        "web3-provider-engine": "^15.0.6"
      },
*/
////////////////////////////////////////////////////////////////////////////////
/*
 * 環境変数：AWS_NODEJS_CONNECTION_REUSE_ENABLED = 1
 * 
 */
var kms = new AWS.KMS(),
    docClient = new AWS.DynamoDB(),
    txrObj = require("./TxRelay.json"),
    tokenObj = require("./MyToken.json");

const TableName = process.env.DB_NAME;
const table_Key  = {BuildID: {S: 'b0001'}, now_time:{N: '0'}};

// https://docs.matic.network/docs/develop/network-details/network
// https://infura.io/docs/gettingStarted/chooseaNetwork
const config_org = {
  matic_token:     process.env.MYTOKEN_MATIC,
  eth_token:       process.env.MYTOKEN_ETH,
  account:         process.env.ACCOUNT,
  region:          'ap-northeast-1',
  endpoint:        'https://rpc-mumbai.matic.today',
  endpoint_ws:     'wss://ws-mumbai.matic.today',
  endpoint_eth:    'https://goerli.infura.io/v3/'+ process.env.ETH_PROJECT_ID,
  endpoint_eth_ws: 'wss://goerli.infura.io/ws/v3/'+ process.env.ETH_PROJECT_ID,
  user1: process.env.ADDR_USER1,
  user2: process.env.ADDR_USER2,
  abi:{
    proxy: require("./UChaildERC20ProxyABI.json"),
  },
  keyIds: [ process.env.KMS_KEY ]
};
////////////////////////////////////////////////////////////////////////////////
async function checkProxy( ) {
  var web3child = new Web3(config.endpoint_ws);
  const proxy = new web3child.eth.Contract(config.abi.proxy, config.matic_token);
  const from = config.account;
  let own = await proxy.methods.proxyOwner().call({from}, console.log);
  let mutabli = await proxy.methods.stateMutability(from);
  console.log("own:",own, 'mutabli:',mutabli);
}

////////////////////////////////////////////////////////////////////////////////
async function getDynamoDB( TableName, Key ) {
  // DynamoDBへのアクセスロジック
  let params = { Key, TableName };
  let call = new Promise((resolve, reject) => {
    try {
      docClient.getItem(params, function(err, data) {
        if (err) {
          console.error("DynamoDB getItem", JSON.stringify(params), err, err.stack);
          reject( err );
        } else {
          resolve( data );
        }
      });
    } catch (error){
      console.error("DynamoDB getItem try/catch", JSON.stringify(params), error );
      reject( error );
    }
  });

  // 実行と結果取り出し
  let ret_data;
  await call.then( (data) => ret_data = data.Item );
  console.log("getDynamoDB()", ret_data);

  // 内容を修正
  let ret_val = {};
  for( let key in ret_data ){
    let v = ret_data[key];
    if( v.S ) ret_val[key] = v.S;
    if( v.N ) ret_val[key] = parseInt(v.N, 10);
  }
  return ret_val;
}

async function updateLambdaDB(TableName, Key, AttributeUpdates) {
  let params = { AttributeUpdates, Key, TableName, ReturnValues: 'ALL_NEW' };
  //console.log("DynamoDB updateItem inparam", JSON.stringify(params));
  //if(1) return;
  let call = new Promise((resolve, reject) => {
    try {
      docClient.updateItem(params, function(err, data) {
        if (err) {
          console.error("DynamoDB updateItem", JSON.stringify(params), err, err.stack);
          reject( err );
        } else {
          //console.log("DynamoDB updateItem", data);
          resolve( data );
        }
      });
    } catch (error){
      console.error("DynamoDB updateItem try/catch", JSON.stringify(params), error );
      reject( error );
    }
  });
  await call.then( (data) => console.log );
}

async function DeployContract(web3, account, obj, param, now_time ) {
  if( !obj ){
    console.error("DeployContract obj is null");
    return null;
  }

  try {
    let bytecode = obj.bytecode;
    let abi = obj.abi;
    let ret_hash;
    //console.log("abi", abi);

    // デプロイに必要なGasを問い合わせる
    let nowEth = await web3.eth.getBalance(account);
    console.log("getBalance");
    web3.eth.getGasPrice().then(console.log);
    console.log("getGasPrice", bytecode.length );
    // let gasEstimate = await web3.eth.estimateGas({data: bytecode});
    // console.log("nowEth", nowEth, "gasEstimate", gasEstimate,);
    // if(nowEth < gasEstimate ){
    //   console.error("gas It is insufficient:", Date.now() - now_time);
    //   return null;
    // }

    console.log("Promise: ", Date.now() - now_time, param);
    const call = new Promise((resolve, reject) => {
      console.log("new Copntract: ", Date.now() - now_time, param);
      const contract = new web3.eth.Contract( abi );
      
      console.log("deploy send ", Date.now() - now_time, param);
      contract
        .deploy({
          data: bytecode,
          arguments: param
        })
        .send({
          from: account,
          gas: '2000000'
        }, (error, hash) => {
          if(error) {
            console.error("sendTransaction callback: ", error.message, error, Date.now() - now_time);
            reject( error );
          } else {
            console.log("sendTransaction callback: ", Date.now() - now_time);
            resolve( hash );
          }
        });

    });
    await call.then((value) => ret_hash = value );

    console.log("DeployContract ok", ret_hash);
    return ret_hash;
  }
  catch(e){
    console.error("DeployContract ex", e.message, e);
    return null;
  }
}

function TimeLog( th ){
  if(!th) return Date.now();
  let str = ' ';
  const now = Date.now();

  if(th.now) str = 't:' + (now - th.now);
  else       th.now = now;

  if(th.diff){
    str += '/' + (now - th.diff);
    th.diff = now;
  } else {
    th.diff = now;
  }
  return str;
}

async function DynamoSign( Plaintext ){
  // Encrypt a data key
  //
  // 以下のサンプルキー ARN を有効なキー ID に置き換える
  const KeyId = process.env.KMS_KEY;
  kms.encrypt({ KeyId, Plaintext }, (err, data) => {
    if (err) console.error(err, err.stack);
    else {
      console.log(data);
      const { CiphertextBlob } = data;
    }
  });
}

async function GetSignTx( web3, input, nonce_offset=0 ){
  const { addr, abi, fanc, from, to, param } = input;
  
  let inputs;
  for( let i = 0; i < abi.length; i++ )
    if(abi[i].name === fanc)
      inputs = abi[i].inputs;
  const in_param = {
    name: fanc,
    type: 'function',
    inputs
  };
  console.log("GetSignTx in_param", in_param, param);
  const data = web3.eth.abi.encodeFunctionCall(in_param, param );
  
  const nonce = await web3.eth.getTransactionCount( from ) + nonce_offset;
  const hashInput = '0x1900'
        + '000000000000000000000000' + util.stripHexPrefix(addr)
        + '000000000000000000000000' + util.stripHexPrefix(from)
        + nonce.toString(16)
        + util.stripHexPrefix(to)
        + util.stripHexPrefix(data);
  console.log("GetSignTx hashInput", hashInput);
  //const hash = web3.utils.sha3(hashInput);
  // "Error: Invalid bytes characters 265"
  const hash = web3.utils.soliditySha3(hashInput);
  console.log("GetSignTx hash", hash);
  // 0x19007B0ba31777fd4eC2AB3c90b8B07a20Ad72Bb33985041Da2c2432ABD99AEBE874C18a326D95451ABC2f84A7C625A628981919f37E321A4f9E7C4a90AF15ca9059cbb0000000000000000000000004a7c625a628981919f37e321a4f9e7c4a90af15c0000000000000000000000000000000000000000000000000000000000000064
  // const kms_key_tmp = await kms.getPublicKey({KeyId: 'alias/test_bc01'}).promise();
  // const { result } = asn1js.fromBER(kms_key_tmp.PublicKey);
  // const values = result.valueBlock.value;
  // const value = values[1];
  // const sig = util.ecsign(Buffer.from(util.stripHexPrefix(hash), 'hex'),
  //                         value );

  return new Promise((resolve, reject) => {
    // https://docs.aws.amazon.com/ja_jp/kms/latest/APIReference/API_Sign.html
    kms.sign({
      KeyId: 'alias/test_bc01',
      Message: hash,
      MessageType: 'RAW',
      SigningAlgorithm: 'ECDSA_SHA_256'
    }, (err, sign_data) => {
      if (err) {
        console.error('encrypt', err, err.stack);
        reject( err );
      } else {
        console.log('encrypt', sign_data);
        const sig_tmp = sign_data.Signature;

        // https://www.javadrive.jp/javascript/array/index14.html
        const r = sig_tmp.slice(0, 31);
        const s = sig_tmp.slice(32, 63);

        const v_tmp = sig_tmp.slice(64, 70).toString('hex', 0, 6)
        let v = parseInt(v_tmp, 16)
        if (v < 27) v += 27
        v = "0x" + v.toString(16)
        
        const out_param = { sig:{r, s, v}, from, to, data, v_tmp };
        console.log("sign in hash", sign_data, nonce, hashInput, out_param);
        resolve(out_param);
      }
    });
  });  
}

async function SendDeposit(Contract, amount){
  const conf = {
    Eth_EndPoint: 'https://rpc.goerli.mudit.blog/',
    Mti_EndPoint: 'https://rpc-mumbai.matic.today',
    addr: "0x2686eca13186766760a0347ee8eeb5a88710e11b"
  };

  const Kms_conf = {
    region: "ap-northeast-1",
    keyIds: [ process.env.KMS_KEY ]
  };
  const rootToken = conf.addr;
  const from = process.env.ACCOUNT;

  // https://github.com/maticnetwork/matic.js/
  // https://github.com/maticnetwork/matic.js/blob/master/src/root/POSRootChainManager.ts
  // https://github.com/maticnetwork/static/tree/master/network/testnet/mumbai
  const rootChainManagerAddress = '0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74';
  const erc20Predicate = '0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34';
  const mainProvider = new kap.KmsProvider(conf.Eth_EndPoint, Kms_conf);
  const maticProvider = new kap.KmsProvider(conf.Mti_EndPoint, Kms_conf);
  const mainWeb3 = new Web3(mainProvider);// Ethereum
  const web3Client = new Web3(maticProvider);// Matic

  // --- 参考 matic.js( matic.js-master/examples/POS-client/utils.js )
  const maticPOSClient = new MaticPOSClient({
    network: 'testnet', // optional, default is testnet
    version: 'mumbai', // optional, default is mumbai
    parentProvider: mainWeb3,
    maticProvider: web3Client,
    posRootChainManager: rootChainManagerAddress, // config.root.POSRootChainManager
    posERC20Predicate: erc20Predicate, // config.root.posERC20Predicate
    parentDefaultOptions: { from },
    maticDefaultOptions: { from },
  });
  // child.DERC20

  try {
    let receipt = [];
    // --- 参考 ( matic.js-master/examples/POS-client/ERC20/approve.js )
    receipt.push( await maticPOSClient.approveERC20ForDeposit(rootToken, amount) );
    // --- 参考 ( matic.js-master/examples/POS-client/ERC20/deposit.js )
    receipt.push( await maticPOSClient.depositERC20ForUser(
      rootToken, // RootToken address ( Ethereum, Matic の両方にコントラクトがある )
      from,      // 宛先
      amount     // Amount for approval (in wei)
    ));
    for(let i = 0; i < receipt.length; i++){
      let ret;
      do{
        await web3Client.eth.getTransactionReceipt(receipt[i]).then((result) => ret = result);
        console.log('getTransactionReceipt');
      } while(!ret);
      console.log('getTransactionReceipt', ret);
    }
  } catch(err){
    console.error("SendDeposit:", err);
  }

  // @truffle/hdwallet-provider のサンプルに記載されている
  // At termination, `provider.engine.stop()' should be called to finish the process elegantly.
  mainProvider.engine.stop();
  maticProvider.engine.stop();
}

async function SendTransfer(web3, from, abi, func_name, param, kms_flg){
  console.log("callLambdaDeploy_batch start");
  let th = {}, result;
  TimeLog( th );

  let keyIds = await getDynamoDB(TableName, table_Key);
  let addr = keyIds.tokAddr;

  const to =  process.env.ADDR_USER1,
        cli = process.env.ADDR_USER2;
  const contract = new web3.eth.Contract(abi, addr);
  let data = contract.methods.transfer(to, "100").encodeABI();

  // トークン不足でエラーになるので、チェックに使える
  const checkcall = (err, data) => {
    if(err) {
      console.log("callback", TimeLog( th ), err);
      throw err;
    } else {
      console.log("callback", TimeLog( th ), data);
    }
  };

  console.log("SendTransfer", TimeLog( th ), addr, to, cli, keyIds);

  // 正常にトランザクションを処理できる場合
  result = await contract.methods.transfer(to, "100").call({ from });
  console.log("call 1", TimeLog( th ), result);
  result = await web3.eth.call({to:addr, from, data});
  console.log("call 2", TimeLog( th ), result);
  result = await contract.methods.transfer(to, "100").call({ from });
  console.log("call 3", TimeLog( th ), result);

  const callback1 = (error, result) => {
    console.log("PendingTransactions callback", TimeLog( th ), error, result);
  }
  web3.eth.getPendingTransactions(callback1);

  let kms_data;
  let web3_data;

  let sig_call = await GetSignTx(web3, {addr, abi, fanc:'transfer', from, to, param:[to, '100'] });
  await sig_call.then(data => web3_data = data);
  console.log("GetSignTx", TimeLog( th ), web3_data);
  kms_data = {...web3_data};
  kms_data.sig = '';
  
  const make_call = new Promise((resolve, reject) => {
    const param = {
      from,
      gasPrice: "20000000000",
      gas: "21000",
      to: addr,
      value: 0,
      data
    };
    web3.eth.signTransaction(kms_data).then( (err, data) => {
      console.log('signTransaction', err, data);
      resolve( data );
    });
  });
  await make_call.then((data)=>{
    kms_data = data.tx;
  });
  await web3.eth.call(kms_data);

  if(1) return null;

  // 自分のトランザクションを確認する場合
  //contract.methods.transfer(to, "10000000000").call({ from }, checkcall);

  // 取得したトランザクションの実行確認をする場合
  //data = contract.methods.transfer(to, "10000000000").encodeABI();
  // try{
  //   result = await web3.eth.call({to:addr, from, data});
  //   console.log("transfer", TimeLog( th ), result);
  // } catch(err){
  //   console.error("transfer", TimeLog( th ), err);
  //   throw err;
  // }

  let call = new Promise((resolve, reject) => {
    let callback1 = (error, result) => {
      console.log("sendTransaction callback1", TimeLog( th ), error, result);
    }
    let callback2 = (error, result) => {
      console.log("callback2", TimeLog( th ), error, result);
    }
    let callback3 = (error, result) => {
      console.log("callback3", TimeLog( th ), error, result);
      resolve(result);
    }

    // https://docs.blocto.app/blocto-app/web3-provider/batch-transaction
    let batch = new web3.BatchRequest();
    //batch.add(web3.eth.sendTransaction.request({from, to, data }, callback1));
    // batch.add(contract.methods.transfer(to,  "100").send.request({ from }, callback2));
    batch.add(contract.methods.transfer(cli, "100").send.request({ from }, callback2));
    batch.add(contract.methods.transfer(to,  "100").send.request({ from }, callback2));
    batch.add(contract.methods.transfer(cli, "100").send.request({ from }, callback3));
    let result = batch.execute();
  });

  let hash;
  await call.then( (data) => {
    hash = data;
    console.log("SendTransfer", TimeLog( th ), data);
  });

  let receipt;
  do{
    await web3.eth.getTransactionReceipt(hash).then((result) => receipt = result);
    console.log('getTransactionReceipt', TimeLog( th ));
  } while(!receipt);

  if(receipt.status){
    let ret_data = receipt.logs[0].data;
    result = parseInt(ret_data, 16);
    console.log("callLambdaDeploy_batch end", TimeLog( th ), ret_data, result, receipt);
  } else {
    console.error("callLambdaDeploy_batch ", TimeLog( th ), receipt);
    new Error( receipt );
  }
  return null;
}

async function SendContract(web3, account, abi, func_name, param, now_time){
  let func_abi, ret_hash, to;
  for( let i = 0; i < abi.length; i++ )
    if(abi[i].name === func_name)
      func_abi = param.abi[i];

  let keyIds = await getDynamoDB(TableName, table_Key);
  if (func_name.indexOF("Relay") === -1)
    to = keyIds.tokAddr;
  else
    to = keyIds.txrAddr;

  console.log("Promise: ", Date.now() - now_time, param);
  const call = new Promise((resolve, reject) => {
    try {
      console.log("new Copntract: ", Date.now() - now_time, param);
      let data = web3.eth.abi.encodeFunctionCall(func_abi, param);
      web3.eth.sendTransaction({ to, data }, function(err, data) {
        if (err){
          console.error("DynamoDB sendTransaction", JSON.stringify(param), err, err.stack);
          reject( err );
        } else {
          resolve( data );
        }
      });
    } catch(error){
      console.error("DynamoDB updateItem try/catch", JSON.stringify(param), error );
      reject( error );
    }
  });

  await call.then((value) => ret_hash = value );
  return ret_hash;
}

async function SendKmsSingTransaction(web3, abi, func_name, param, th){
  let func_abi, to, KeyId = 'alias/test_bc01';
  const from = process.env.ACCOUNT;
  const chainId = 80001;
  // nonce の取得
  let nonce = 0, count = 0;
  do {
    try {
      nonce = await web3.eth.getTransactionCount( from );
    } catch(err) {}
    console.log(TimeLog(th), "get nonce: ", nonce);
  } while (nonce === 0 && count++ < 10);

  // 送信先のコントラクトアドレス
  console.log(TimeLog(th), "get to address: ", func_name, param);
  const conf = await getDynamoDB(TableName, table_Key);
  to = conf.tokAddr;
  console.log(TimeLog(th), "get to address: ", to);

  // 送信データ作成
  for( let i = 0; i < abi.length; i++ )
    if(abi[i].name === func_name)
      func_abi = abi[i];
  const data = web3.eth.abi.encodeFunctionCall(func_abi, param);

  // トランザクションの作成
  //  EthereumのsendTransaction時のvalidationエラー一覧:
  //    https://y-nakajo.hatenablog.com/entry/2018/01/26/173543
  //  '100001275200000000'
  const gas = BigInt( '100001275200000000' );
  const gasPrice =  web3.utils.toWei('1', 'gwei');
  const gasLimit = 420000;
  const cost = BigInt(gasPrice * gasLimit);
  console.log(TimeLog(th), "gas: ", cost < gas, gasPrice, cost, gas);
  const txData = {
		nonce: '0x' + nonce.toString(16),
		gasPrice: web3.utils.toHex(gasPrice),
		gasLimit: web3.utils.toHex(gasLimit),
    from,
    to,
    chainId, // def:web3.eth.net.getId(),
    //chain: // def:'mainnet',
    value: '0x00',
    data
  };
  const customCommon = Common.forCustomChain(
    'mainnet',
    {
      name: 'mainnet',
      NetworkName: "Mumbai Testnet",
      networkId: chainId,
      chainId,
    },
    'petersburg',
  );
  console.log(TimeLog(th), "customCommon:", customCommon);
  const tx = await new ethereumjs_tx(txData, {common: customCommon});
  console.log(TimeLog(th), "make tx:", txData, "tx.getChainId():",tx.getChainId(), "hash:",tx.hash(false));
  /*
2021-02-02T15:13:10.309Z	0d9b8c0e-7bcd-432a-ac92-22fb0bc5b3d1	INFO	getTransactionOptions {
  common: Common {
    _chainParams: {
      name: 'mainnet',
      chainId: 80001,
      networkId: 80001,
      comment: 'The Ethereum main chain',
      url: 'https://ethstats.net/',
      genesis: [Object],
      hardforks: [Array],
      bootstrapNodes: [Array]
    },
    _hardfork: 'petersburg',
    _supportedHardforks: []
  }
}
  */
  // const kmsRawTx_tmp = await kmsProvider.eth.signTransaction( txData );
  // const kmsRawTx = kmsRawTx_tmp.raw;
  // console.log(TimeLog(th), "kms signTransaction: ", kmsRawTx);

  // node_modules/aws-kms-provider/dist/provider.js
  const KmsSigner = new kap.KmsSigner( "ap-northeast-1", process.env.KMS_KEY );
  const signature = await KmsSigner.sign( tx.hash(false) );
  console.log(TimeLog(th), "signature: ", signature.v, signature.r, signature.s);
  
  const vStr = (signature.v + chainId * 2 + 8).toString(16);
  const length = vStr.length + (vStr.length % 2);
  const v = Buffer.from(vStr.padStart(length, "0"), "hex");
  tx.r = signature.r;
  tx.s = signature.s;
  tx.v = v;
  const rawTx = `0x${tx.serialize().toString("hex")}`;
  console.log(TimeLog(th), "serialize tx: ", vStr, length, v, rawTx);
  if(0) return null;

  // トランザクションの投入
  const call_tx = new Promise((resolve, reject) => {
    //web3.eth.sendSignedTransaction(kmsRawTx, function(err, data) {
    web3.eth.sendSignedTransaction(rawTx, function(err, data) {
      if (err){
        console.error("sendTransaction", TimeLog(th), JSON.stringify(param), err, err.stack);
        reject( err );
      } else {
        console.log(TimeLog(th), "Promise:", data);
        resolve( data );
      }
    });
  });
  let ret_hash;
  await call_tx.then((value) => ret_hash = value );
  console.log(TimeLog(th), "SendKmsSingTransaction end: ", ret_hash);
  return ret_hash;
}

async function Contract(web3, account, in_param, ret_hash, kms_flg, th){
  console.log(TimeLog(th), "Contract() B in_param", in_param.act);
  if( !in_param )
    return {out_param: [], hash: null, receipt: null };

  let {obj, tx_param, act, now_time, func_name} = in_param;
  console.log(TimeLog(th), "Contract() D in_param", tx_param, func_name);

  // アクションに従った操作の選択
  let out_hash = null;
  try{
    switch(act){
    case 0:
    case 1:
      out_hash = await DeployContract(web3, account, obj, tx_param, now_time, kms_flg );
      break;
    case 2:
      out_hash = await SendTransfer(web3, account, obj.abi, tx_param, now_time, kms_flg );
      break;
    case 3:
      out_hash = await SendKmsSingTransaction(web3, obj.abi, func_name, tx_param, th);
      break;
    case 4:
      out_hash = await SendDeposit("", 10);
      break;
    case 10:
      out_hash = await SendContract(web3, account, obj.abi, "", tx_param, now_time, kms_flg );
      break;
    }
  } catch(err){
    console.error(TimeLog(th), "Contract() D", err);
    throw err;
  }

  console.log(TimeLog(th), "Contract() C", out_hash);
  return {out_param: in_param, out_hash, receipt: null };
}

async function PostProcessing(param, receipt){
  console.log("PostProcessing() D");
  let DB_key = '';
  let act = 0;
  switch(param.act){
  case 0:
    DB_key = "txrAddr";
    act = 1;
    break;
  case 1:
    DB_key = "tokAddr";
    act = 1;
    break;
  }

  let db_data = {};
  if( act === 1 ){
    let data = receipt.contractAddress;
    db_data[DB_key] = {Value:{S: data}, Action:"PUT"};
    await updateLambdaDB(TableName, table_Key, db_data);
  }
}

function MakeData( ){
}

async function BlockChainMain( event, config, th ){
  const now_time = Date.now()
  const timeout = 1000;

  let {in_param, hash, kms_flg, ws_flg} = event;
  let out_param = [...in_param];
  const {endpoint, endpoint_ws, region, keyIds } = config;

  // アクションに従ったオブジェクト変更
  for(let i = 0; i < in_param.length; i++){
    // バイナリ設定処理（ 本当は S3 から取得とか）
    switch(in_param[i].act){
    case 0:
      in_param[i].obj = txrObj;
      break;
    case 1:
    case 2:
    case 3:
      in_param[i].obj = tokenObj;
      break;
    case 4:
      MakeData();
      return {};
    }
    
    if(i == 0) in_param[0].now_time = now_time;
    //console.log("in_param[i]", in_param[i]);
  }
  console.log(TimeLog(th), "BlockChainMain() event", in_param.length, hash);

  let kmsProvider;
  let provider;
  if(ws_flg) {
    provider = new Web3.providers.WebsocketProvider(endpoint_ws);
    console.log(TimeLog(th), "provider Websocket", endpoint_ws, provider);
  } else if(kms_flg === false || hash) {
    provider = new Web3.providers.HttpProvider(endpoint, {timeout, keepAlive:false});
    console.log("provider Http", endpoint, provider);
  } else {
    provider = new kap.KmsProvider(endpoint, { region, keyIds });
    console.log("provider Kms", endpoint, provider);
  }

  // 処理中と判断し、状況確認を実施
  if (hash){
    console.log(TimeLog(th), "hash check", hash);
    const web3h = new Web3( provider );

    console.log("getTransactionReceipt()");
    let receipt;
    await web3h.eth.getTransactionReceipt(hash).then((result) => receipt = result);

    console.log(TimeLog(th), "BlockChainMain() A", receipt );
    if(receipt) {
      await PostProcessing(in_param[0], receipt);
      out_param.shift();
      return { out_param, out_hash: null, receipt };
    } else {
      return { out_param, out_hash: hash, receipt:"" };
    }
  }

  // 書き込みは KMS で処理が必用
  let web3k;
  //web3k = new Web3( kmsProvider );
  const web3 = new Web3( provider );
  let account = process.env.ACCOUNT;
  let call = new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, accounts) => {
      if ( error ) throw error;
      console.log(TimeLog(th), "Provider OK", accounts, Date.now() - now_time);
      resolve( accounts );
    });
  });
  await call.then((data) => account = data[0]);

  // 書き込み処理の実施
  let result = await Contract(web3, account, in_param[0], hash, kms_flg, th );
  if(provider && provider.engine) provider.engine.stop();
  console.log(TimeLog(th), "BlockChainMain() result", result, Date.now() - now_time);
  return result;
}

exports.handler = async (event, context, callback) => {
  let th = {};
  TimeLog(th);
  console.log(TimeLog(th), "event", event);
  const {test, act} = event;
  if(test === 'Proxy'){
    await checkProxy();
    return null;
  }
  if(test){
    return null;
  }

  let config = {...config_org};
  if(event.endPointPrefix){
    config.endpoint = config[ "endpoint_" + event.endPointPrefix ];
  }
  
  //let target = await BlockChainMain( event, config );
  let target = await BlockChainMain(
    { in_param:
      [
        { act:3, func_name:'transfer', tx_param:[config.user1, 100]},
      ],
      kms_flg:false, ws_flg:true }, config, th );
  console.log(TimeLog(th), "main end", target);
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
    target
  };
  
  callback( null, response);// 何かの終了を待つ為、アプリに応答が戻らない
  console.log(TimeLog(th), "end");
  return response;
};
