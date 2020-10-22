var AWS = require('aws-sdk');
AWS.config.update({
  maxRetries: 4,
  httpOptions: {
    timeout: 30000,
    connectTimeout: 7000
  }
});

var kms = new AWS.KMS({apiVersion: '2014-11-01'}),
    Web3 = require('web3'),
    kap = require('aws-kms-provider');

const keyId = "01f9ef3a-7f13-4fb8-b70c-f60d76f924ab";
const endpoint = 'https://rpc-mumbai.matic.today';
const region = "ap-northeast-1";


/**
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
var prop;

async function setup() {
  console.log("setup start");
  //console.log("KMS", kms);

  const provider = new kap.KmsProvider(
    endpoint,
    { region, keyIds: [keyId] },
    //"ropsten",
  );
  console.log("kap.KmsProvider OK");

  const web3 = new Web3( provider );
  console.log("new Web3 OK;");

  let account = "0x5041Da2c2432ABD99AEBE874C18a326D95451ABC";
  try {
    //const accounts = await web3.eth.getAccounts();
    //account = accounts[0];
  } catch(e){
    console.log("web3.eth.getAccounts", e);
  }
  console.log("account", account, "cliaddr",cliaddr);

  return{ web3, account };
}

async function check() {
  let web3 = prop.web3;
  let account = prop.account;

  let amo1 = await web3.eth.getBalance(account) / Math.pow(10, 18);
  let amo2 = await web3.eth.getBalance(cliaddr) / Math.pow(10, 18);
  let GasPrice = await web3.eth.getGasPrice();
  console.log("getBalance kms:",amo1, "cli:",amo2, "GasPrice:",GasPrice);
}

async function transfer() {
  let web3 = prop.web3;
  let account = prop.account;

  //送金の実行。実行結果としてトランザクションIDが返される。
  let result = await web3.eth.sendTransaction(
    {from: account, to: cliaddr, value: web3.utils.toWei('1', "gwei")}
  );
  //console.log("transfer ether", result);
  //console.log("transfer ether", result.logs[0].topics);
}

exports.handler = async (event, context, callback) => {
  //context.callbackWaitsForEmptyEventLoop = false;//ESOCKETTIMEDOUT になる
  console.log("handler start");
  prop = await setup();
  await check();
  let stime = Date.now();
  await transfer();
  let etime = Date.now() - stime;
  console.log("transfer ether time:", etime);
  await check();

  console.log("prop", prop.account);

  // TODO implement
  const response = {
    statusCode: 200,
    //    time: etime,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
  //throw response;// Status: Failed
  //callback(null, response);//ESOCKETTIMEDOUT になる
};
