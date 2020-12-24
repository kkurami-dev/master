var AWS = require('aws-sdk'),
    Web3 = require('web3'),
    kap = require('aws-kms-provider');

var kms = new AWS.KMS({apiVersion: '2014-11-01'}),
    docClient = new AWS.DynamoDB.DocumentClient();

const endpoint = 'https://rpc-mumbai.matic.today',
      region = "ap-northeast-1",
      ssAddress = '0xD5E3b6A8Ebe3c55c05318B264b865b990EBb242C';

var web3;

async function DeployContract(web3, account, obj, param ) {
  console.log("DeployContract s");

  try{
    let bytecode = obj.bytecode;
    let abi = obj.abi;
    let ret_hash;
    console.log("abi", abi);

    // デプロイに必要なGasを問い合わせる
    let nowEth = web3.eth.getBalance(account);
    web3.eth.getGasPrice().then(console.log);
    let gasEstimate = web3.eth.estimateGas({data: bytecode});
    if(nowEth < gasEstimate ){
      console.log(nowEth, "<", gasEstimate, "gas が不足している");
      return null;
    }

    let call = new Promise((resolve, reject) => {
      web3.eth.sendTransaction({
        from: account,
        data: bytecode, // deploying a contracrt
        arguments: param
      }, (error, hash) => resolve( hash ));
    });
    await call.then((value) => ret_hash = value );

    console.log("DeployContract e", ret_hash);
    return ret_hash;
  }
  catch(e){
    console.log(e.message);
    return null;
  }
}

async function Contract(web3, account, in_param, ret_hash){
  var receipt;

  
  if(ret_hash){
    console.log("getTransactionReceipt()");
    await web3.eth.getTransactionReceipt(ret_hash).then((result) => receipt = result);
    //console.log("Contract() A", receipt );
    if(!receipt)
      return { out_param: in_param, hash: ret_hash, receipt };
  }

  console.log("Contract() B", in_param, in_param.length);
  if(in_param.length === 0)
    return {out_param:in_param, hash:null, receipt };
  
  let {obj, tx_param, act} = in_param.shift();
  let hash = await DeployContract(web3, account, obj, tx_param );
  return {out_param:in_param, hash, receipt };
}

async function BlockChainMain( event ){
  if (web3){
    web3.currentProvider.engine.start();
  } else {
    const provider = new kap.KmsProvider(
      endpoint,
      { region, keyIds: [ process.env.KMS_KEY ]},
      //"ropsten",
    );
    web3 = new Web3( provider );
  }
  
  const accounts = await web3.eth.getAccounts();
  console.log("kap.KmsProvider OK", accounts[0]);

  const {in_param, hash} = event;
  const obj = require("../contracts/TxRelay.json");
  for(let i = 0; i < in_param.lenght; i++){
    in_param[i].obj = obj;
  }
  
  web3.currentProvider.engine.stop();
}

exports.handler = async (event, context, callback) => {
  await BlockChainMain( event );
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
