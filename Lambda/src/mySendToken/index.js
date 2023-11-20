/* global BigInt */
var AWS = require('aws-sdk');
// aws-kms-provider を使用する場合のエラー対応としては不足
// AWS.config.update({
//   maxRetries: 4,
//   httpOptions: {
//     timeout: 30000,
//     connectTimeout: 7000
//   }
// });
var Web3 = require('web3'),
    kap = require('aws-kms-provider');
    //ssAbi = require('./SimpleStorageAbi.json');

// レシート解析
// in-app-purchase

// http or https
const https = require('https');
const agent = new https.Agent({
  keepAlive: true
});

var kms = new AWS.KMS({ apiVersion: '2014-11-01',
//                        httpOptions: {agent}
                      }),
    docClient = new AWS.DynamoDB.DocumentClient({
//      httpOptions: { agent}
    });

const endpoint = 'https://matic-mumbai.chainstacklabs.com',
      region = "ap-northeast-1",
      ssAddress = '0xD5E3b6A8Ebe3c55c05318B264b865b990EBb242C';

/**
 *
 *
 *
 *
 *
 * AWS Lambda context オブジェクト
 *   https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/python-context.html
 * 再試行とタイムアウトの問題
 *   https://aws.amazon.com/jp/premiumsupport/knowledge-center/lambda-function-retry-timeout-sdk/
 * Node.js の AWS Lambda 関数ハンドラー
 *   https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/nodejs-handler.html
 *
 * スレッド：繰り返しの呼び出しでのsetInterval（）の奇妙な動作
 *   https://forums.aws.amazon.com/thread.jspa?threadID=175444
 * ES2017 async/await で sleep 処理を書く
 *   https://qiita.com/asa-taka/items/888bc5a1d7f30ee7eda2
 *
 * 【詳解】JavascriptでDynamoDBを操作する
 *   https://qiita.com/Fujimon_fn/items/66be7b807a8329496899
 *
 * MySQLクエリのリクエストが多すぎると、ラムダ関数「エラー：ETIMEDOUTに接続」
 *   https://stackoverflow.com/questions/55405486/lambda-function-error-connect-etimedout-when-receive-too-many-requests-for-my
 *
 * TCP 接続を再利用するように JavaScript for SDK を設定する最も簡単な方法は、
 * AWS_NODEJS_CONNECTION_REUSE_ENABLED環境変数を1。この機能は 2.463.0 リリースで追加されました
 *
 *
 * 特定の文字列を全て置換する[Javascript]
 *   https://qiita.com/DecoratedKnight/items/103ab57431b6c448e535
 *
 * aws-kms-provider/examples/sign.ts
 *   https://github.com/odanado/aws-kms-provider/blob/master/examples/sign.ts
 *
 * バージョン一覧を表示
 *   $ npm info (パッケージ名) versions
 *   $ npm info react versions
 * バージョンを絞り込む
 *   $ npm info react-vr@0.1 version
 * 最新のバージョンを表示する
 *   $ npm info react-vr version
 * インストール済みのバージョンを表示する
 *   $ npm list --depth=0
 *   $ npm list --depth=0 -g
 * 
 * Ethereum ブロック構造
 *   https://blog.y-yuki.net/?page=1534172400
 *
 * Polygon / Matic 公式ページ
 *  https://docs.polygon.technology/docs/develop/network-details/network
 *
 */

const cliaddr1 = '0x196730A9c9331B2DF8057656802430cd6fBF65b8';
const cliaddr  = '0x4A7C625A628981919f37E321A4f9E7C4a90AF15c';
var web3;

async function scanDynamo(TableName, FilterExpression, ExpressionAttributeValues) {
}

async function InAppPurchase(){
}

async function setup() {
  const account = "0x5041Da2c2432ABD99AEBE874C18a326D95451ABC";
  let prop = {};
  let stime = Date.now();
  let keyId = process.env.KMS_KEY;

  console.log("setup start AWS Ver:",AWS.VERSION,  );
  //console.log("KMS", kms);

  const provider = new kap.KmsProvider(
    endpoint,
    { region, keyIds: [keyId] },
    //"ropsten",
  );
  console.log("kap.KmsProvider OK", account);

  web3 = new Web3( provider );
  prop.web3 = web3;
  prop.account = account;
  console.log("new Web3 OK;", web3.version);

  // const accounts = await web3.eth.getAccounts();
  // account = accounts[0];
  //console.log("web3", web3);
  //console.log("currentProvider", web3.currentProvider);

  console.log("setup ether time:", Date.now() - stime, "ms");
  return prop;
}

async function check(prop) {
  console.log("Start check");
  let stime = Date.now();

  let web3 = prop.web3;
  let account = prop.account;

  let account_tmp = await web3.eth.getAccounts();
  console.log("kms Accounts:", account_tmp);
  let amo1_row = await web3.eth.getBalance(account);
  let amo2_row = await web3.eth.getBalance(cliaddr);
  let amo1 = amo1_row / Math.pow(10, 18);
  let amo2 = amo2_row / Math.pow(10, 18);
  let GasPrice = await web3.eth.getGasPrice();
  const nonce = web3.eth.getTransactionCount(account);
  console.log("Eth kms:",amo1, amo1_row, "cli:",amo2, amo2_row, "GasPrice:",GasPrice, "nonce", nonce );

  console.log("check time:", Date.now() - stime, "ms");
  return { nonce,
           kms_amo:amo1, kms_row_amo:amo1_row, 
           cli_amo:amo2, cli_row_amo:amo2_row,
           GasPrice, account,  };
}

function putDynamoDB(Item) {
  let params = {
    TableName: "TestDB",
    Item
  };
  console.log("Adding a new item...");
  docClient.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data));
    }
  });  
}

async function transfer(prop) {
  let stime = Date.now();
  
  let web3 = prop.web3;
  let account = prop.account;

  //送金の実行。実行結果としてトランザクションIDが返される。
  let result;
  await web3.eth.sendTransaction(
    {from: account,
     to: cliaddr,
     value: web3.utils.toWei('1', "gwei")}
  )
    .on('transactionHash', function(hash){
      console.log("transfer on transactionHash", hash);
    })
    .on('receipt', function(receipt){
      console.log("transfer on receipt", receipt);
      result = receipt.logs[0].topics;
    })
    .on('confirmation', function(confirmationNumber, receipt){
      console.log("transfer on confirmation", confirmationNumber, receipt);
    })
  // ガス不足エラーの場合、第二引数にレシートがセットされます。
    .on('error', function(error, receipt){
      let err = JSON.stringify(error);
      console.error("transfer on error", err, receipt);
    });
  
  console.log("transfer ether time:", Date.now() - stime, "ms");
  return result;
}

async function transferReset(prop, event) {
  let stime = Date.now();
  console.log("transferReset start");
  
  let web3 = prop.web3;
  let account = prop.account;
  const gasPrice = event.gasPrice || undefined;
  const nonce = event.nonce ? parseInt( event.nonce, 10) : undefined;

  //送金の実行。実行結果としてトランザクションIDが返される。
  let result;
  await web3.eth.sendTransaction(
    { from: account,
      to: cliaddr,
      gasPrice,
      nonce,
      //gasPrice: '3000012817',
      value: 1
    })
    .on('transactionHash', function(hash){
      console.log("transfer on transactionHash", hash);
    })
    .on('receipt', function(receipt){
      console.log("transfer on receipt", receipt);
      result = receipt.logs[0].topics;
    })
  // ガス不足エラーの場合、第二引数にレシートがセットされます。
    .on('error', function(error, receipt){
      let err = JSON.stringify(error);
      console.error("transfer on error", err, receipt);
    });
  
  console.log("transfer ether time:", Date.now() - stime, "ms");
  return result;
}

async function transfer_ret(prop) {
  let stime = Date.now();
  
  let web3 = prop.web3;
  let account = prop.account;

  //送金の実行。実行結果としてトランザクションIDが返される。
  const param = {from: account,
                 to: cliaddr,
                 gasPrice: '3000000000',
                 //gasPrice: '3000012817',
                 value: web3.utils.toWei('1', "gwei")};
  console.log("transfer param", param );
  let result = await web3.eth.sendTransaction(param);

  console.log("transfer_ret result", result, " time:", Date.now() - stime, "ms");
  return {result: result.logs[0].topics};
}

async function transfer_sync(prop) {
  let stime = Date.now();
  
  let web3 = prop.web3;
  let account = prop.account;

  //送金の実行。実行結果としてトランザクションIDが返される。
  let result;
  await web3.eth.sendTransaction(
    {from: account, to: cliaddr, value: web3.utils.toWei('1', "gwei")}
  ).then(function(receipt){
    console.log("transfer then", receipt);
    result = receipt.logs[0].topics;
  });
  
  console.log("transfer_sync", result, " time:", Date.now() - stime, "ms");
  return result;
}

async function deploy_contract(prop) {
  let web3 = prop.web3;
  let result;
  let bytecode;

  console.log("this:", this, Function.name);

  await web3.eth.getCode(ssAddress)
    .then(res => bytecode = res);
  //console.log("code:", bytecode);

  console.log("web3.eth", web3.eth);
  let gasPrice = await web3.eth.getGasPrice();
  console.log("gasPrice:", gasPrice);

  // デプロイに必要なGasを問い合わせる
  let gasEstimate = await web3.eth.estimateGas({ from:prop.account, data: bytecode})
      .then((error, data) => {
        console.log("err", error, "data",data);
      });
  console.log("gasEstimate:", gasEstimate);

  // let TestContract = web3.eth.contract(ssAbi);
  // TestContract.new({from: prop.account, data:bytecode });
  // console.log("gasEstimate:", TestContract);

  let newssAddress;

  putDynamoDB({
    BuildID: "data1",
    now_time: Date.now(),
    ssAddress: newssAddress
  });
  
  return {gasEstimate, newssAddress, };
}

function transfer_nosync(prop) {
  let stime = Date.now();
  
  let web3 = prop.web3;
  let account = prop.account;

  //送金の実行。実行結果としてトランザクションIDが返される。
  let result;
  web3.eth.sendTransaction(
    {from: account, to: cliaddr, value: web3.utils.toWei('1', "gwei")}
  ).then(function(receipt){
    console.log("transfer_nosync then:", Date.now() - stime, "ms", receipt);
    result = receipt.logs[0].topics;
  });
  
  console.log("transfer_nosync time:", Date.now() - stime, "ms");
  return result;
}

async function transfer_prom(prop) {
  let stime = Date.now();
  
  let web3 = prop.web3;
  let account = prop.account;

  //送金の実行。実行結果としてトランザクションIDが返される。
  let result;
  web3.eth.sendTransaction({
    from: account, to: cliaddr, value: web3.utils.toWei('1', "gwei")
  }, function(error, hash){
    // トランザクションハッシュが使用可能
    if( error ) throw error;
    console.log("transfer_prom callback", Date.now() - stime, "ms", hash);
    web3.eth.getTransactionReceipt(hash, function(error, receipt){
      // トランザクションレシートが利用可能
      console.log("transfer_prom getTransactionReceipt", Date.now() - stime, "ms", receipt);
      result = receipt;
    });
  });

  // 自前での結果取得待ち
  const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
  while(!result){
    await sleep(300);
  }
  clearTimeout(sleep);
  
  console.log("transfer prom time:", Date.now() - stime, "ms");
  return result;
}

async function transfer_show(prop) {
  let stime = Date.now();
  
  let web3 = prop.web3;
  let account = prop.account;

  //送金の実行。実行結果としてトランザクションIDが返される。
  let result;
  web3.eth.sendTransaction({
    from: account, to: cliaddr, value: web3.utils.toWei('1', "gwei")
  },function(error, hash){
    if( error ) throw error;
    console.log("transfer_show callback", "time:", Date.now() - stime, "ms", hash);
  });
  
  console.log("transfer_show time:", Date.now() - stime, "ms", result);
  return result;
}

function transfer_newprom(prop) {
  let stime = Date.now();
  
  let web3 = prop.web3;
  let account = prop.account;

  //送金の実行。実行結果としてトランザクションIDが返される。
  let result;
  return new Promise((resolve) => {
    web3.eth.sendTransaction({
      from: account, to: cliaddr, value: web3.utils.toWei('1', "gwei")
    },function(error, hash){
      if( error ) throw error;
      console.log("transfer_newprom callback", "time:", Date.now() - stime, "ms", hash);
      resolve( hash );
    });
  });
}

async function transfer_batch(prop) {
  let stime = Date.now();
  
  let web3 = prop.web3;
  let account = prop.account;

  let result;
  let result_arr = [];
  var batch = new web3.BatchRequest();
  console.log("new web3.BatchRequest()", batch.requestManager);
  //送金の実行。実行結果としてトランザクションIDが返される。
  batch.add(web3.eth.sendTransaction({
    from: account, to: cliaddr, value: web3.utils.toWei('1', "gwei")
  }, function(error, hash){
    //result = receipt.logs[0].topics;
    result_arr.push( hash );
    console.log("transfer callback 1", error, hash, result_arr.length);
    if (result_arr.length == 2){
      //console.log("batch.requestManager.engine", batch.requestManager.engine);
      console.log("requestManager.provider", batch.requestManager.provider);
    }
  }));
  batch.add(web3.eth.sendTransaction({
    from: account, to: cliaddr, value: web3.utils.toWei('1', "gwei")
  }, function(error, hash){
    //result = receipt.logs[0].topics;
    result_arr.push( hash );
    console.log("transfer callback 2", error, hash, result_arr.length);
    if (result_arr.length == 2){
      console.log("batch.requestManager", batch.requestManager);
    }
  }));
  batch.execute();

  console.log("web3.currentProvider.engine.stop();", batch.requestManager);
  //web3.currentProvider.engine.stop();
  batch.provider.engine.stop();
  
  console.log("transfer batch time:", Date.now() - stime, "ms");
  return result;
}

exports.handler = async (event, context, callback) => {
  console.log("handler start", event);
  let sstime = Date.now();

  //context.callbackWaitsForEmptyEventLoop = false;//ESOCKETTIMEDOUT になる

  let result;
  try {
    // web3 ライブラリの設定
    let prop = await setup();
    console.log("account:", prop.account, "cliaddr:", cliaddr);

    switch(event.type) {
    case 0: result = await check( prop );break;
    //case 1: result = await transfer_sync(prop); break;
    case 1: result = await deploy_contract(prop); break;
    case 2: result = await transfer_ret(prop);  break;
    case 3: {
      let stime = Date.now();
      result = await transfer_ret(prop);
      result = await transfer_ret(prop);
      console.log("transfer_ret x2 time:", Date.now() - stime, "ms");
      break;
    }
    case  4: result = await transfer_batch(prop); break;
    case  5: result = await transfer(prop); break;// time over
    case  6: result = transfer_nosync(prop); break;
    case  7: result = await transfer_prom(prop); break;
    case  8: result = await transfer_newprom(prop); break;
    case  9: result = await transfer_show(prop); break;
    case 10: result = await transferReset(prop, event); break;

    }
    if(event.log && event.log === 1){
      console.log("web3", prop.web3,
                  "currentProvider", prop.web3.currentProvider,
                  "engine", prop.web3.currentProvider.engine);
    }

    // TIMEDOUT 対応として、handler 外ではブロックチェーンの監視はしない
    // handler 外の処理は次の Lambda 実行時に実行される為、20秒後のみ動作
    // する様な場合は、タイムアウトとなってしまう。
    //console.log("engine 1", prop.web3.currentProvider.engine);
    prop.web3.currentProvider.engine.stop();
    //console.log("engine 2", prop.web3.currentProvider.engine);
    
    //await check(prop);
  } catch(e) {
    let msg = JSON.stringify(e);
    console.error(msg);
    result = msg;
  }

  const response = {
    statusCode: 200,
    time: Date.now() - sstime,
    body: result,
  };
  //return response;// 関数が終わらなくなる
  //throw response;// Status: Failed
  callback(null, response); // engine.stop が必須
};
