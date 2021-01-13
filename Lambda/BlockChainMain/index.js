const AWS = require('aws-sdk'),
      Web3 = require('web3'),
      kap = require('aws-kms-provider');

const kms = new AWS.KMS({apiVersion: '2014-11-01'}),
      docClient = new AWS.DynamoDB();

const txrObj = require("./TxRelay.json");
const tokenObj = require("./MyToken.json");

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

async function SendTransfer(web3, from, abi, func_name, param){
  console.log("callLambdaDeploy_batch start");
  let th = {}, result;
  TimeLog( th );

  let keyIds = await getDynamoDB(TableName, tableKey);
  let addr = keyIds.tokAddr;

  const to =  process.env.ADDR_USER1,
        cli = process.env.ADDR_USER2;
  const contract = new web3.eth.Contract(abi, addr);
  console.log("SendTransfer", TimeLog( th ), addr, to, cli, keyIds);

  // トークン不足でエラーになるので、チェックに使える
  const checkcall = (err, data) => {
    if(err) {
      console.log("transfer callback", TimeLog( th ), err);
      throw err;
    }
  };
  
  // 自分のトランザクションを確認する場合
  //contract.methods.transfer(to, "10000000000").call({ from }, checkcall);

  // 取得したトランザクションの実行確認をする場合
  let data = contract.methods.transfer(to, "10000000000").encodeABI();
  result = web3.eth.call({to:addr, from, data}, checkcall);
  console.log("call", TimeLog( th ), result, data);

  let call = new Promise((resolve, reject) => {
    let callback1 = (error, result) => {
      console.log("callback1", TimeLog( th ), error, result);
    }
    let callback2 = (error, result) => {
      console.log("callback2", TimeLog( th ), error, result);
    }
    let callback3 = (error, result) => {
      console.log("callback3", TimeLog( th ), error, result);
      resolve(result);
    }

    let batch = new web3.BatchRequest();
    batch.add(contract.methods.transfer(cli, "100").send.request({ from }, callback1));
    batch.add(contract.methods.transfer(to,  "100").send.request({ from }, callback2));
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

async function Contract(web3, account, in_param, ret_hash){
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
      out_hash = await DeployContract(web3, account, obj, tx_param, now_time );
      break;
    case 2:
      out_hash = await SendTransfer(web3, account, obj.abi, tx_param, now_time );
      break;
    case 10:
      out_hash = await SendContract(web3, account, obj.abi, "", tx_param, now_time );
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

  let {in_param, hash} = event;
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
      return;
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
      in_param.shift();
      return { out_param: in_param, out_hash: null, receipt };
    } else {
      return { out_param: in_param, out_hash: hash, receipt:"" };
    }
  }

  // 書き込みは KMS で処理が必用
  const provider = new kap.KmsProvider(endpoint, { region, keyIds, timeout});
  const web3k = new Web3( provider, {timeout} );
  const accounts = await web3k.eth.getAccounts();
  console.log("kap.KmsProvider OK", accounts[0], Date.now() - now_time);

  // 書き込み処理の実施
  let result = await Contract(web3k, accounts[0], in_param[0], hash );
  web3k.currentProvider.engine.stop();
  console.log("BlockChainMain() result", result, Date.now() - now_time);
  return result;
}

exports.handler = async (event, context, callback) => {
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
