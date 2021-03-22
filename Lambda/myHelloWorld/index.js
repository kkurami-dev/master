// Time-stamp: "2021-03-19 21:02:36 kuramitu"
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: "ap-northeast-1"
});
var lambdaClient = new AWS.Lambda();

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

async function callLambda(FunctionName, payload) {
  let th = {};
  TimeLog( th );
  console.log("callLambda start", TimeLog( th ));
  let call = new Promise( async (resolve, reject) => {
    let Payload = JSON.stringify( payload );
    var params = {
      FunctionName,
      Payload,
    };
    await lambdaClient.invoke(params, async (err, data) => {
      console.log("callLambda callback", TimeLog( th ));
      if(err) {
        console.error(err);
        await reject( err );
      } else {
        if(!data)
          await resolve( data );
        if(data.Payload){
          let out = JSON.parse( data.Payload );
          await resolve( out );
        }
      }
    });
  });
  let ret_val;
  await call.then((value) => ret_val = value );
  console.log("callLambda await ok", TimeLog( th ));
  return ret_val;
}

async function intervalCheckDB( RequestId, now_time ){
  const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
  const offset = Math.round(Math.random() * 100 / 2);
  console.log("test offset", offset );

  while(1){
    // キューの内容取得
    const params2 = { TableName: 'TestDB',
                      ExpressionAttributeNames:{'#y': 'now_time', '#id': 'BuildID'},
                      ExpressionAttributeValues:{':val': now_time, ':id': "b0001"},
                      //検索対象が満たすべき条件を指定
                      KeyConditionExpression: '#id = :id and #y <= :val'};
    let queue_data;
    await docClient.query(params2, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     queue_data = data;
    }).promise();

    // キューの中身確認
    if ( queue_data.Items[0].RequestId == RequestId ){
      console.log("最初のデータだったので処理開始", Date.now());
      await sleep(offset * 1000);// テスト用：処理を抜けて後続の処理を実施
      console.log("処理終了", Date.now());
      break;
    } else {
      console.log("待ち中", Date.now());
      await sleep(5000);
      console.log("チェック再開", Date.now());
    }
  }

  // タイマーオブジェクトを削除（削除がないと handler の終了できなくなる）
  clearTimeout(sleep);
}

exports.queryTest = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const now_time = Date.now();
  const RequestId = '0x' + context.awsRequestId.replace(/-/g, '');
  console.log("パラメータ", event, context);

  // 自分のレコードを登録
  const params1 = { TableName: 'TestDB',
                    Item: { BuildID: "b0001", RequestId, now_time }};
  await docClient.put(params1, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
  }).promise();

  // 同時実行防止
  await intervalCheckDB(RequestId, now_time);
  // ここら辺に実処理を記載

  // 実行後に自分のデータを削除
  const params3 = { TableName: 'TestDB',
                    Key: { BuildID: "b0001", now_time }};
  await docClient.delete(params3, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
  }).promise();

  callback(null, 0);
};

exports.handler = async (event, context, callback) => {
  let put_ret, del_ret;
  console.log("event, context, callback", event, context, callback);
  put_ret = await callLambda( 'defFunc', {func: 'put'});
  console.log("return put val", put_ret);
  if(put_ret && put_ret.Item){
    put_ret.func = 'del';
    del_ret = await callLambda( 'defFunc', {func:'del', ...put_ret.Item});
  }
  console.log("return del val", del_ret);
  let param = {msg:'ok', put_ret, del_ret};
  return param;
  //callback(null, param);

  if(1) return param;
  let th = {}, result;
  TimeLog( th );
  const payload = { in_param: [ { tx_param: [], act: 2 }, { tx_param: [], act: 2 } ] }
  result = await callLambda('BlockChainMain', payload);
  console.log("callLambda 1", TimeLog( th ), result);
  result = await callLambda('BlockChainMain', payload);
  console.log("callLambda 2", TimeLog( th ), result);
  result = await callLambda('BlockChainMain', payload);
  console.log("callLambda 3", TimeLog( th ), result);
}
