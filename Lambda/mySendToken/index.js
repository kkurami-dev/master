var AWS = require('aws-sdk');

// aws-kms-provider を使用する場合のエラー対応としては不足
// AWS.config.update({
//   maxRetries: 4,
//   httpOptions: {
//     timeout: 30000,
//     connectTimeout: 7000
//   }
// });

var kms = new AWS.KMS({apiVersion: '2014-11-01'}),
    Web3 = require('web3'),
    kap = require('aws-kms-provider');

const keyId = "01f9ef3a-7f13-4fb8-b70c-f60d76f924ab";
const endpoint = 'https://rpc-mumbai.matic.today';
const region = "ap-northeast-1";

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
 *
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
 *
 */

const cliaddr = '0x196730A9c9331B2DF8057656802430cd6fBF65b8';
var web3;

async function setup() {
  let stime = Date.now();
  console.log("setup start AWS Ver:",AWS.VERSION,  );
  //console.log("KMS", kms);

  if (web3){
    web3.currentProvider.engine.start();
  } else {
    const provider = new kap.KmsProvider(
      endpoint,
      { region, keyIds: [keyId] },
      //"ropsten",
    );
    console.log("kap.KmsProvider OK");

    web3 = new Web3( provider );
    console.log("new Web3 OK;");
  }

  let account = "0x5041Da2c2432ABD99AEBE874C18a326D95451ABC";
  try {
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
  } catch(e){
    console.log("web3.eth.getAccounts", e);
  }
  //console.log("web3", web3);
  //console.log("currentProvider", web3.currentProvider);

  console.log("setup ether time:", Date.now() - stime, "ms");
  return{ web3, account };
}

async function check(prop) {
  let stime = Date.now();

  let web3 = prop.web3;
  let account = prop.account;

  let amo1 = await web3.eth.getBalance(account) / Math.pow(10, 18);
  let amo2 = await web3.eth.getBalance(cliaddr) / Math.pow(10, 18);
  let GasPrice = await web3.eth.getGasPrice();
  console.log("Eth kms:",amo1, "cli:",amo2, "GasPrice:",GasPrice);

  console.log("check time:", Date.now() - stime, "ms");
}

async function transfer(prop) {
  let stime = Date.now();
  
  let web3 = prop.web3;
  let account = prop.account;

  //送金の実行。実行結果としてトランザクションIDが返される。
  let result;
  web3.eth.sendTransaction(
    {from: account, to: cliaddr, value: web3.utils.toWei('1', "gwei")}
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
      let err = JSON.stringify(error)
      console.error("transfer on error", err, receipt);
    })
    
  console.log("transfer ether time:", Date.now() - stime, "ms");
  return result;
}
async function transfer_ret(prop) {
  let stime = Date.now();
  
  let web3 = prop.web3;
  let account = prop.account;

  //送金の実行。実行結果としてトランザクションIDが返される。
  let result = await web3.eth.sendTransaction(
    {from: account, to: cliaddr, value: web3.utils.toWei('1', "gwei")}
  );
    
  console.log("transfer result", result);
  console.log("transfer ether time:", Date.now() - stime, "ms");
  return result.logs[0].topics
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
    
  console.log("transfer ether time:", Date.now() - stime, "ms");
  return result;
}

exports.handler = async (event, context, callback) => {
  console.log("handler start");
  //context.callbackWaitsForEmptyEventLoop = false;//ESOCKETTIMEDOUT になる

  let result;
  try {
    // web3 ライブラリの設定
    let prop = await setup();
    // 現在の Eth 量の確認
    await check( prop );

    switch(event.type) {
    case 0: break;
    case 1:
      result = await transfer_sync(prop); break;
    case 2:
      result = await transfer_ret(prop);  break;
    case 3:
      result = await transfer(prop);      break;// time over
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
    
    await check(prop);
  } catch(e){
    let msg = JSON.stringify(e);
    console.error(msg);
  }

  const response = {
    statusCode: 200,
    //    time: etime,
    body: result,
  };
  //return response;// 関数が終わらなくなる
  //throw response;// Status: Failed
  callback(null, response); // engine.stop が必須
};
