var AWS = require('aws-sdk'),
    Web3 = require('web3'),
    kap = require('aws-kms-provider');

var kms = new AWS.KMS({apiVersion: '2014-11-01'}),
    docClient = new AWS.DynamoDB.DocumentClient();

const endpoint = 'https://rpc-mumbai.matic.today',
      region = "ap-northeast-1",
      ssAddress = '0xD5E3b6A8Ebe3c55c05318B264b865b990EBb242C';
const txrObj = require("./TxRelay.json");
const tokenObj = require("./MyToken.json");

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
      contract.deploy({
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

async function Contract(web3, account, in_param, ret_hash){
  console.log("Contract() B in_param", in_param.length);
  if(in_param.length === 0)
    return {out_param:[], hash:null, receipt:null };

  let {obj, tx_param, act, now_time} = in_param.shift();
  console.log("Contract() D in_param", tx_param, act);

  // アクションに従った操作の選択
  let out_hash;
  switch(act){
  case 0:
  case 1:
    out_hash = await DeployContract(web3, account, obj, tx_param, now_time );
    break;
  }

  console.log("Contract() C", out_hash);
  return {out_param:in_param, out_hash, receipt:null };
}

async function BlockChainMain( event ){
  const now_time = Date.now()

  let {in_param, hash} = event;

  // アクションに従ったオブジェクト変更
  for(let i = 0; i < in_param.length; i++){
    // バイナリ設定処理（ 本当は S3 から取得とか）
    switch(in_param[i].act){
    case 0:
      in_param[i].obj = txrObj;
      break;
    case 1:
      in_param[i].obj = tokenObj;
      break;
    }
    
    if(i == 0) in_param[0].now_time = now_time;
    //console.log("in_param[i]", in_param[i]);
  }
  console.log("BlockChainMain() event", in_param.length, hash);

  // 処理中と判断し、状況確認を実施
  if (hash){
    const provider = new Web3.providers.HttpProvider( endpoint );
    const web3h = new Web3( provider );

    console.log("getTransactionReceipt()");
    let receipt;
    await web3h.eth.getTransactionReceipt(hash).then((result) => receipt = result);

    console.log("BlockChainMain() A", receipt );
    if(receipt)
      return { out_param: in_param, out_hash: null, receipt };
    else
      return { out_param: in_param, out_hash: hash, receipt:"" };
  }

  // 書き込みは KMS で処理が必用
  const provider = new kap.KmsProvider(endpoint, { region, keyIds: [ process.env.KMS_KEY ], timeout: 1000});
  const web3k = new Web3( provider, {timeout: 1000} );
  const accounts = await web3k.eth.getAccounts();
  console.log("kap.KmsProvider OK", accounts[0], Date.now() - now_time);

  // 書き込み処理の実施
  let result = await Contract(web3k, accounts[0], in_param, hash );
  web3k.currentProvider.engine.stop();
  console.log("BlockChainMain() result", result, Date.now() - now_time);
  return result;
}

exports.handler = async (event, context, callback) => {
  let target = await BlockChainMain( event );
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
    target
  };
  
  //callback( null, response);// 何かの終了を待つ為、アプリに応答が戻らない
  return response;
};
