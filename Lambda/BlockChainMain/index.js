//import Matic from '@maticnetwork/maticjs';
// const Matic = require('@maticnetwork/maticjs');
//const MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient;
//const Matic = require('./matic.js'); // window がない（つまりブラウザでの実行が前提のようだ）
//const MaticPOSClient = require('./matic.js').MaticPOSClient;

var AWS = require('aws-sdk'),
    Web3 = require('web3'),
    util = require("ethereumjs-util"),
    asn1js = require("asn1js"),
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

var kms = new AWS.KMS(),
    docClient = new AWS.DynamoDB(),
    txrObj = require("./TxRelay.json"),
    tokenObj = require("./MyToken.json");

const TableName = process.env.DB_NAME;
const tableKey  = {BuildID: {S: 'b0001'}, now_time:{N: '0'}};
const getKey    = "";

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
  let str = ' ';
  if(th.now)
    str = 't:' + (Date.now() - th.now);
  else
    th.now = Date.now();
  if(th.diff){
    let diff = Date.now();
    str = str + '/' + (diff - th.diff);
    th.diff = diff;
  } else {
    th.diff = Date.now();
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
    GEO:{root: { abi:"GEO_Eth_Abi.json",
                 addr: "0xfa8b929171077C18ec0702c78D5E6002236001AE"
               },
         chil: { abi:"GEO_Mat_Abi.json",
                 addr:"0x1a3200b9b30c81286fC01614F3Af7A1Ce84eb532",
              }
        },
    DAI:{root: { abi:"DAI_Eth_Abi.json",
                 addr: "0x2686eca13186766760a0347ee8eeb5a88710e11b"
               },
         chil: { abi:"DAI_Mat_Abi.json",
                 addr:"0x27a44456bEDb94DbD59D0f0A14fE977c777fC5C3",
              }
        },
    CHM:{ root: { abi:"CHM_Eth_Abi.json",
                  addr:"0xB4F8414382A3286F962572b401dE0dD45F9116e0"
                },
          chil: { abi:"CHM_Mat_Abi.json",
                  //addr:"0xEd12B500491c2c291075f564cc6C496ad5268A93"//cont
                  addr:"0xEd12B500491c2c291075f564cc6C496ad5268A93"// Read Proxy
                }
    }
  };

  const Kms_conf = {
    region: "ap-northeast-1",
    keyIds: [ process.env.KMS_KEY ]
  };
  const mainProvider = new kap.KmsProvider(conf.Eth_EndPoint, Kms_conf);
  const maticProvider = new kap.KmsProvider(conf.Mti_EndPoint, Kms_conf);

  const cont = conf["CHM"];
  const rootTokenABI = require('./'+ cont.root.abi);
  const rootTokenAddress = cont.root.addr;
  const rootToken = rootTokenAddress;
  const childTokenABI = require('./'+ cont.chil.abi);
  const childTokenAddress = cont.chil.addr;
  const userAddress = process.env.ACCOUNT;

  // https://github.com/maticnetwork/matic.js/
  // https://github.com/maticnetwork/matic.js/blob/master/src/root/POSRootChainManager.ts
  // https://github.com/maticnetwork/static/tree/master/network/testnet/mumbai
  const rootChainManagerABI = require('./RootChainManager.json');
  //const rootChainManagerAddress = '0x8829EC24A1BcaCdcF4a3CBDE3A4498172e9FCDcE';//x
  const rootChainManagerAddress = '0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74';
  const erc20Predicate = '0x07f76e8EfaEAe05cb093AC79740e3546dC03FA93';

  const mainWeb3 = new Web3(mainProvider);// Ethereum
  const web3Client = new Web3(maticProvider);// Matic

  /* examples/POS-client/ERC20/deposit.js
  const config = require('../config')
  const utils = require('../utils')
  const maticPOSClient = utils.getMaticPOSClient()

  const execute = async () => {
    const tx = await maticPOSClient.depositERC20ForUser(config.root.DERC20,
                                                        config.user.address,
                                                        config.user.amount)
  }
  */

  // --- copy matic.js( matic.js-master/examples/POS-client/utils.js )
  // // const MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient
  // const MaticPOSClient = require('../../lib/index').MaticPOSClient
  // const config = require('./config')
  // const HDWalletProvider = require('@truffle/hdwallet-provider')
  const maticPOSClient = new MaticPOSClient({
    network: 'testnet', // optional, default is testnet
    version: 'mumbai', // optional, default is mumbai
    parentProvider: mainWeb3,
    maticProvider: web3Client,
    posRootChainManager: config.root.POSRootChainManager,
    posERC20Predicate: config.root.posERC20Predicate, // optional, required only if working with ERC20 tokens
    posERC721Predicate: config.root.posERC721Predicate, // optional, required only if working with ERC721 tokens
    posERC1155Predicate: config.root.posERC1155Predicate, // optional, required only if working with ERC71155 tokens
    parentDefaultOptions: { from: config.user.address }, // optional, can also be sent as last param while sending tx
    maticDefaultOptions: { from: config.user.address }, // optional, can also be sent as last param while sending tx
  });

  // --- copy matic.js ( matic.js-master/src/root/POSRootChainManager.ts: constructor )
  const posRootChainManager = new web3Client.parentWeb3.eth.Contract(
    options.network.abi('RootChainManager', 'pos'),
    options.posRootChainManager || options.network.Main.POSContracts.RootChainManagerProxy
  );

  // --- copy matic.js ( matic.js-master/src/root/POSRootChainManager.ts: depositERC20ForUser )
  async function depositERC20ForUser(rootToken, amount, user, options=null) {
    const depositData = abiCoder.encodeParameter('uint256', this.formatUint256(amount))
    return this.depositFor(user, rootToken, depositData, options)
  }

  // --- copy matic.js ( matic.js-master/src/root/POSRootChainManager.ts: depositFor )
  async function depositFor(user, rootToken, depositData, options=null) {
    if (!posRootChainManager.options.address) {
      throw new Error('posRootChainManager address not found. Set it while constructing MaticPOSClient.')
    }
    const txObject = posRootChainManager.methods.depositFor(user, rootToken, depositData)
    const web3Options = await web3Client.fillOptions(txObject, true /* onRootChain */, options)
    if (web3Options.encodeAbi) {
      return Object.assign(web3Options, { data: txObject.encodeABI(),
                                          to: posRootChainManager.options.address })
    }
    //web3Client.send(txObject, web3Options, options);
    const result = web3Client.call(txObject, web3Options, options);

    maticProvider.engine.stop();// @truffle/hdwallet-provider examples
    return result;
  }

  // ----------------------------------------
  // const maticPOSClient = new MaticPOSClient({
  //   network:'testnet',
  //   version:'mumbai',
  //   maticProvider:maticProvider,
  //   parentProvider:mainProvider,
  //   posRootChainManager:rootChainManagerAddress,
  //   posERC20Predicate: '0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34'
  // });

  // ----------------------------------------
  // await maticPOSClient.approveERC20ForDeposit(
  // rootToken, // RootToken address,
  // amount, // Amount for approval (in wei)
  // options // transaction fields, can be skipped if default options are set
  // );

  // ----------------------------------------
  // const mainWeb3 = new Web3(mainProvider);// Ethereum
  // const maticWeb3 = new Web3(maticProvider);// Matic
  // const rootTokenContract = new mainWeb3.eth.Contract(rootTokenABI, rootTokenAddress);
  // const rootChainManagerContract = new mainWeb3.eth.Contract(rootChainManagerABI,
  //                                                             rootChainManagerAddress); // deposit
  // const childTokenContract = new maticWeb3(childTokenABI, childTokenAddress);// Burn

  // await rootTokenContract.methods
  //   .approve(erc20Predicate, amount)
  //   .call({ from: userAddress });

  // const depositData = mainWeb3.eth.abi.encodeParameter('uint256', amount)
  // await rootChainManagerContract.methods
  //   .depositFor(userAddress, rootToken, depositData)
  //   .call({ from: userAddress });
  
}

async function SendTransfer(web3, from, abi, func_name, param, kms_flg){
  console.log("callLambdaDeploy_batch start");
  let th = {}, result;
  TimeLog( th );

  let keyIds = await getDynamoDB(TableName, tableKey);
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

  let keyIds = await getDynamoDB(TableName, tableKey);
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

async function Contract(web3, account, in_param, ret_hash, kms_flg){
  console.log("Contract() B in_param", in_param.act);
  if( !in_param )
    return {out_param: [], hash: null, receipt: null };

  let {obj, tx_param, act, now_time} = in_param;
  console.log("Contract() D in_param", tx_param, act);

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
    case 10:
      out_hash = await SendContract(web3, account, obj.abi, "", tx_param, now_time, kms_flg );
      break;
    }
  } catch(err){
    console.error("Contract() D", err);
    throw err;
  }

  console.log("Contract() C", out_hash);
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
    await updateLambdaDB(TableName, tableKey, db_data);
  }
}

function MakeData( ){
}

async function BlockChainMain( event, config ){
  const now_time = Date.now()
  const timeout = 1000;

  let {in_param, hash, kms_flg} = event;
  let out_param = [...in_param];
  const {endpoint, region, keyIds } = config;

  // アクションに従ったオブジェクト変更
  for(let i = 0; i < in_param.length; i++){
    // バイナリ設定処理（ 本当は S3 から取得とか）
    switch(in_param[i].act){
    case 0:
      in_param[i].obj = txrObj;
      break;
    case 1:
    case 2:
      in_param[i].obj = tokenObj;
      break;
    case 3:
      MakeData();
      return {};
    case 4:
      MakeData();
      return {};
    }
    
    if(i == 0) in_param[0].now_time = now_time;
    //console.log("in_param[i]", in_param[i]);
  }
  console.log("BlockChainMain() event", in_param.length, hash);

  // 処理中と判断し、状況確認を実施
  if (hash){
    console.log("hash check", hash);
    const provider = new Web3.providers.HttpProvider( endpoint );
    const web3h = new Web3( provider );

    console.log("getTransactionReceipt()");
    let receipt;
    await web3h.eth.getTransactionReceipt(hash).then((result) => receipt = result);

    console.log("BlockChainMain() A", receipt );
    if(receipt) {
      await PostProcessing(in_param[0], receipt);
      out_param.shift();
      return { out_param, out_hash: null, receipt };
    } else {
      return { out_param, out_hash: hash, receipt:"" };
    }
  }

  // 書き込みは KMS で処理が必用
  let provider;
  if(kms_flg === false)
    provider = new Web3.providers.HttpProvider(endpoint);
  else {
    provider = new kap.KmsProvider(endpoint, { region, keyIds, timeout});
  }
  const web3k = new Web3( provider, {timeout} );
  let account = process.env.ACCOUNT;
  let call = new Promise((resolve, reject) => {
    web3k.eth.getAccounts((error, accounts) => {
      if ( error ) throw error;
      console.log("Provider OK", accounts, Date.now() - now_time);
      resolve( accounts );
    });
  });
  await call.then((data) => account = data[0]);

  // 書き込み処理の実施
  let result = await Contract(web3k, account, in_param[0], hash, kms_flg );
  web3k.currentProvider.engine.stop();
  console.log("BlockChainMain() result", result, Date.now() - now_time);
  return result;
}

exports.handler = async (event, context, callback) => {
  console.log("event", event);
  if(1){
    return await SendDeposit("", 10);
  }
  
  const config = {
    region: "ap-northeast-1",
    endpoint: 'https://rpc-mumbai.matic.today',
    keyIds: [ process.env.KMS_KEY ]
  };
  let target = await BlockChainMain( event, config );
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
    target
  };
  
  //callback( null, response);// 何かの終了を待つ為、アプリに応答が戻らない
  return response;
};
