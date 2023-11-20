import * as cip from '@aws-sdk/client-cognito-identity-provider';
import * as cdbobj from "@aws-sdk/client-dynamodb";
import * as ldbobj from "@aws-sdk/lib-dynamodb";
import * as ssm from "@aws-sdk/client-ssm";
import * as lambda from "@aws-sdk/client-lambda";
import * as s3 from "@aws-sdk/client-s3";
import * as s3sig from "@aws-sdk/s3-request-presigner";
import * as sqs from "@aws-sdk/client-sqs";

// https://repost.aws/questions/QUE0VhKI07RWyNtTVZiFdzcw/cannot-find-package-aws-sdk-client-scheduler-error?sc_ichannel=ha&sc_ilang=en&sc_isite=repost&sc_iplace=hp&sc_icontent=QUE0VhKI07RWyNtTVZiFdzcw&sc_ipos=12
// Lambda の node18 の場合、最新の SDK バージョンは 3.188.0 です。
// クライアントスケジューラは 3.208 で導入されたようです。
// なので、Layerとして自前で今は入れておく
import * as sc from "@aws-sdk/client-scheduler";

import {
  formatResponse,
  DynamoDBInit,
  SSMInit,
  LmbdaInit,
  GetRetry,
  S3Init,
  ScInit,
  SQSInit,
  Sleep,
} from "./aws-sdk-v3-api.mjs";

const REGION = process.env.AWS_REGION;// リージョンの取得
const KEY = "DEMO_EVENT_";
let ACCOUNTID = '';

////////////////////////////////////////////////////////////////////////////////
// SQS Client
const {
  SQSCreateQueue,
  SQSSendMessage,
} = SQSInit( sqs );
async function testSQS(event, context, callback){
  const QKEY = KEY + 'QUEUE';
  const DATE_NOW = getJST().toLocaleString();
  const ret_r = await SQSCreateQueue({
    QueueName: QKEY,
    Attributes: {
      DelaySeconds: "60", // Number of seconds delay.
      MessageRetentionPeriod: "86400", // Number of seconds delay.
    }
  });
  const url = ret_r.QueueUrl;
  // あらかじめ、Lmabda のトリガーに SQS を設定
  const ret_s = await SQSSendMessage({
    MessageBody: 'test1_' + DATE_NOW,
    QueueUrl: url,
  });
  return {Create: ret_r, Send: ret_s};
}

////////////////////////////////////////////////////////////////////////////////
// Amazon EventBridge Schedule
const {
  ScCreateSchedule,
  ScDeleteSchedule,
  ScCreateScheduleGroup,
  ScListGroupSchedule,
} = ScInit( sc );
function ScCreate(date){
  const local = date.toISOString().slice(0, 16);
  const Name = KEY + local.replace(/:/g, '');
  /*
   *****************************************
   *  スケジュールを作成するための権限
   *****************************************
   * IAMロールの許可に下記を追加
   *  {
   *    "Version": "2012-10-17",
   *    "Statement": [
   *    {
   *      "Effect": "Allow",
   *      "Action": "lambda:InvokeFunction",
   *      "Resource": "arn:aws:lambda:ap-northeast-1:${ACCOUNTID}:function:*"
   *     }]}
   * IAMロールの信頼関係に下記を追加
   *   {
   *     "Sid": "Statement1",
   *     "Effect": "Allow",
   *     "Principal": { "Service": "scheduler.amazonaws.com" },
   *     "Action": "sts:AssumeRole"
   *   }
   */
  const params = {
    Name,
    ScheduleExpression: `at(${local})`,
    Description: "テスト用のスケジュール設定、２度目で消す",
    GroupName: KEY,
    FlexibleTimeWindow:{
      Mode:'OFF'
    },
    Target:{
      // 実行する Lambda の ARN
      //Arn: `arn:aws:lambda:${REGION}:${ACCOUNTID}:function:test0004`,
      Arn: `arn:aws:lambda:${REGION}:${ACCOUNTID}:function:test0003`,
      // スケジュールを作成するための権限
      // RoleArn:`arn:aws:iam::${ACCOUNTID}:role/service-role/Amazon_EventBridge_Scheduler_LAMBDA_1571eb1f29`,
      RoleArn: `arn:aws:iam::${ACCOUNTID}:role/service-role/Amazon_EventBridge_Scheduler_LAMBDA_fd401bcaf4`,
      // 実行時のパラメータ
      Input: JSON.stringify({"AAA":"BBB", ScTime:local, ScName:Name}),
    },
    ScheduleExpressionTimezone: 'Asia/Tokyo',
    //State: "DISABLED",
  };
  return ScCreateSchedule( params );
}
function ScDelete(Name){
  const params = {
    GroupName: KEY,
    Name,
  };
  return ScDeleteSchedule( params );
}
function ScListGroup(){
  const params = {
    NamePrefix: KEY,
  };
  return ScListGroupSchedule( params );
}
function ScCreateGroup(){
  const params = {
    Name: KEY,
  };
  return ScCreateScheduleGroup( params );
}
async function testSC(event, context, callback){
  if( event.ScName ){
    const d_ret = await ScDelete(event.ScName);
    const l_ret = await ScListGroup();
    return {DelRet:d_ret, ListGroup: l_ret};
  } else if( event.ScTime ){
    return event;
  } else {
    const date = getJST();
    date.setMinutes( date.getMinutes() + 1 );// ３分進める
    const g_ret = await ScCreateGroup();
    const c_ret = await ScCreate(date);
    const l_ret = await ScListGroup();
    return {GroupRet:g_ret, CreateRet:c_ret, ListGroup: l_ret};
  }
  return {};
}
////////////////////////////////////////////////////////////////////////////////
// S3 関連の確認
const {dummy} = S3Init(s3);
const {S3GetObject, S3PutObject, S3GetSignedUrl, S3PutSignedUrl}
      = S3Init(s3, s3sig);
async function testS3(event, context, callback){
  const DATE_NOW = getJST();
  // スエーデンフォマットを加工
  const date = DATE_NOW.toLocaleString('sv').replace(/\D/g, '');
  console.log('now date', date);

  // S3 パラメータ
  let Body = "";
  const S3Param = {
    Bucket: 'kkk-wss-test',//'保存したいバケット名',
    Key: 'images/3107_830200000005h.jpg',//'キーを設定。取り出す際はこのキーで参照する',
    Body, //'保存したいオブジェクト本体'
    CASH: true,// Lambda が実行される EC2 の /tmp 領域にファイルをキャッシュする場合
  };

  const GetURL = await S3GetSignedUrl( S3Param );
  const PutURL = await S3PutSignedUrl( S3Param );

  //const data = await S3GetObject( S3Param );
  //console.log('S3GetObject', date);

  // + DATE_NOW.valueOf()
  const response = {
    RetryCount: GetRetry(),
    statusCode: 200,
    body: {
      DATE_NOW,
      GetURL,
      PutURL,
      //Image: convBase64(data),
    },
    logStreamName: context.logStreamName,
  };
  console.log('TEST OK');
  return response;
}

////////////////////////////////////////////////////////////////////////////////
// 強制終了の確認
async function test2(event, context, callback){
  //context.callbackWaitsForEmptyEventLoop = false;

  if( event.ret === "exit" ){
    const response = {
      RetryCount: GetRetry(),
      statusCode: 200,
      body: JSON.stringify('test OK'),
      logStreamName: context.logStreamName,
    };
    console.log('TEST OK');
    return response;
  }
  let ret8 =  await callLambda_nowait('test0004', {a:1, b:2, ret:"exit", context});
  process.exit(0);
  return ret8;

  // setTimeout(() => {
  //   process.exit();
  // }, 1000);
}

////////////////////////////////////////////////////////////////////////////////
// DynamoDB, CallLambda, SSM の確認
const {getDynamoDB, queryDynamoDB, scanDynamoDB} = DynamoDBInit(cdbobj, ldbobj);
const {callLambda, callLambda_nowait} = LmbdaInit(lambda);
const {getSSM} = SSMInit(ssm);

async function getDynamo(BuildID){
  const params = {
    TableName: "TestDB",
    Key:{
      BuildID,
      now_time: 0
    },
    CASH_KEY:"TestDB-getPrice",
  };
  const ret = await getDynamoDB(params);
  console.log('getDynamo', ret);
  return ret;
}
async function queryDynamo(){
  const params = {
    TableName: "TestDB",
    ExpressionAttributeValues: {
      ":bid": "gasPrice",
    },
    ProjectionExpression: "e",
    KeyConditionExpression: "BuildID = :bid",
    CASH_KEY:"TestDB-queryPrice",
  };
  const ret = await queryDynamoDB(params);
  console.log('queryDynamo', ret);
  return ret;
}
async function scanDynamo(){
  const params = {
    TableName: "TestDB",
    CASH_KEY:"TestDB-scanPrice",
  };
  const ret = await scanDynamoDB(params);
  console.log('scanDynamo', ret);
  return ret;
}

async function testDynamoDB1(event, context, callback){
  getDynamo('b0001');// await がないので、OK の後に実行が終わったりする
  console.log('TEST 1 OK getDynamo ');
  await scanDynamo();
  await scanDynamo();
  console.log('TEST 2 OK scanDynamo');
  await getDynamo('b0002');
  await getDynamo('b0002');
  console.log('TEST 3 OK getDynamo');
  await queryDynamo();
  await queryDynamo();
  console.log('TEST 4 OK queryDynamo');
  await getSSM( 'b0001-TEST');
  await getSSM( 'b0001-TEST');
  let ret5 = await getSSM( 'b0001-TEST');

  const response = {
    RetryCount: GetRetry(),
    statusCode: 200,
    body: JSON.stringify('test OK'),
    logStreamName: context.logStreamName,
  };
  console.log('TEST OK');
  return response;
}
async function testLambda(event, context, callback){
  console.log('TEST 5 OK getSSM', ret5);
  let ret6 =  await callLambda('test0004', {a:1, b:2});
  console.log('TEST 6 OK callLambda', ret6?.statusCode, ret6);
  let ret7 =  await callLambda('test0004', {a:1, b:2, ret:"exit"}, false);
  console.log('TEST 7 OK callLambda', ret7?.StatusCode, ret7);
  let ret8 =  await callLambda('test0005', {a:1, b:2, ret:"exit"});
  console.log('TEST 8 OK callLambda', ret8?.StatusCode, ret8);

  const response = {
    RetryCount: GetRetry(),
    statusCode: 200,
    body: JSON.stringify('test OK'),
    logStreamName: context.logStreamName,
  };
  console.log('TEST OK');
  return response;
}

////////////////////////////////////////////////////////////////////////////////
// AWS SDK 以外の便利関数群
function getJST(){
  // JavaScript で実行環境に左右されず常に JST 日本時間を取得する
  // https://neos21.net/blog/2020/12/09-01.html
  const now = Date.now();
  const offset = (new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000;
  const jst = new Date(now + offset);
  console.log('getJST', jst.toLocaleString());
  return jst;
}

function convBase64(arrayBuffer){
  // JavaScript での バイナリ → base64 変換
  // https://zenn.dev/takaodaze/articles/74ac1684a7d1d2
  //const arrayBuffer = // なんらかのバイナリ（画像・テキストなどなど）

  // バイナリをバイナリ文字列化する
  let binaryString = "";
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }

  // https://yosuke-furukawa.hatenablog.com/entry/2021/12/13/174732
  // base64 にエンコード
  return Buffer.from(binaryString, "utf-8").toString("base64");
  //return btoa(binaryString);
}

// 外部から呼ばれるハンドラー
export const handler = async(event, context, callback) => {
  ACCOUNTID = context.invokedFunctionArn.split(':')[4];
  console.log("event %j", event);

  let res = null;
  switch(event.func){
    case 'sqs':
      res = await testSQS(event, context, callback);
      break;
    case 'sc':
      res = await testSC(event, context, callback);
      break;
    case 's3':
      res = await testS3(event, context, callback);
      break;
    case 'dynamo1':
      res = await testDynamoDB1(event, context, callback);
      break;
    case 'lambda':
      res = await testLambda(event, context, callback);
      break;
    default:
      throw new Error();
      break;
  }
  callback(null, res );
};
