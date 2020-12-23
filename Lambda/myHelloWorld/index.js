// Time-stamp: "2020-11-07 10:12:53 kuramitu"
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: "ap-northeast-1"
});

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

exports.handler = async (event, context, callback) => {
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
