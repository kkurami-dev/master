// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html
// https://github.com/aws/aws-sdk-js-v3/blob/main/UPGRADING.md
// タイムアウト設定用
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
//import { FetchHttpHandler } from "@aws-sdk/fetch-http-handler";

// Node.js 16.x くらいから、使える便利なタイムアウト
import { setTimeout } from 'timers/promises';

// AWS Lambda で Node.js 18.x ランタイムが AWS Lambda で利用可能に
// https://aws.amazon.com/jp/blogs/compute/node-js-18-x-runtime-now-available-in-aws-lambda/
// Node.js 18.x であれば、aws-sdk V2 は使えず、V3 使用が必須
// Lmbda のレイヤーとして、aws-sdk v2 を追加すると良いかもしれない

const DEBUG = process.env.LIB_DEBUG_MODE || false;
const REGION = process.env.AWS_REGION;// リージョンの取得
const ROOP_MAX = 1;
const API_VERSION = '2016-04-18';
console.log("region", REGION, "debug:", DEBUG, );
console.log(process.env);

// https://github.com/aws/aws-sdk-js-v3/blob/main/UPGRADING.md
// Lambda でのタイムアウト設定
// API Gateway の29 秒タイムアウトに合わせた設定とすること
const requestHandler = new NodeHttpHandler({
  // connectionTimeout: 100,
  // socketTimeout: 300,
  connectionTimeout: 30,
  socketTimeout: 50,
});
const requestHandler_low = new NodeHttpHandler({
  connectionTimeout: 50,
  socketTimeout: 200,
}); //

// ブラウザで行う場合のタイムアウト設定
// const { FetchHttpHandler } = require("@aws-sdk/fetch-http-handler");
// const requestHandler = new FetchHttpHandler({
//   /*number in milliseconds*/
//   requestTimeout: 100,
// };
const aws_config = {
  //logger: console,
  // retryMode:
  // Interface RetryInputConfig
  // retryStrategy:  
  maxAttempts: 20,
  // ↑ になったかも、maxRetries: 10,// TODO: これでは、リトライ回数が反映されていない
  region: REGION,
  requestHandler,
};
const aws_config_low = {
  //logger: console,
  // retryMode:
  // Interface RetryInputConfig
  // retryStrategy:
  maxAttempts: 20,
  // ↑ になったかも、maxRetries: 10,// TODO: これでは、リトライ回数が反映されていない
  region: REGION,
  requestHandler: requestHandler_low,
};

let RetryCount = 0;


export function Sleep( time ) {
  return setTimeout(time);
}
function Wait( max ) {
  const time = Math.floor(Math.random() * max);
  if(DEBUG) console.log("Wait:"+ time + "s");
  return setTimeout(time);
}

export function GetRetry(){
  let now_count = RetryCount;
  RetryCount = 0;
  return now_count;
}

export function formatResponse(body){
  var response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "isBase64Encoded": false,
    "multiValueHeaders": { 
      "X-Custom-Header": ["My value", "My other value"],
    },
    "body": body
  };
  return response
};

async function ErrorCheck(func, err){
  /* https://aws.amazon.com/jp/blogs/news/service-error-handling-modular-aws-sdk-js/
   * AWS SDK for JavaScript (v3) モジュールでのエラー処理
   *  if (e instanceof ResourceNotFoundException) などと見ることができる
   */
  /* https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/responsemetadata.html
   * ResponseMetadata( $metadata )
   *   totalRetryDelay: 再試行間の待機に費やされた合計時間 (ミリ秒単位)。
   *   attempts: この操作が試行された回数。
   */
  console.error(func, "handling", err, "retryable", err.$retryable, JSON.stringify( err ));
  if(err.name === "TimeoutError"){
    await Wait(300);
    RetryCount++;
  } else {
    throw new Error(err);
  }
}

/**
 * IDトークンを取得
 */
let cip_client;
export async function login({CognitoIdentityProviderClient,
                             InitiateAuthCommand,
                             AuthFlowType,
                            },
                            username, password, clientId, cb){
  if(!cip_client){
    cip_client = new CognitoIdentityProviderClient({
      apiVersion: API_VERSION,
      region: REGION,
    });
  }

  console.log('login 2');
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/initiateauthcommand.html
  const command = new InitiateAuthCommand({
    region: REGION,
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
    ClientId: clientId,
  });
  const ret = await cip_client.send(command);
  console.log('login 2 end', ret.AuthenticationResult);
  if(cb) cb(ret.AuthenticationResult);
  return ret.AuthenticationResult;
}

function getConfig(in_config=undefined){
  let config = {};
  if( in_config ){
    config = in_config;
  } else {
    config = aws_config;
  }
  return config;
}
function getConfig_low(in_config=undefined){
  let config = {};
  if( in_config ){
    config = in_config;
  } else {
    config = aws_config_low;
  }
  return config;
}

export function SQSInit(
  {
    SQSClient,
    CreateQueueCommand,
    GetQueueUrlCommand,
    SendMessageCommand,
    ConflictException,
  },
  in_config=undefined
){
  const config = getConfig( in_config );
  const sqsClient = new SQSClient(config);

  const CreateQueue = async (params) => {
    const command1 = new CreateQueueCommand(params);
    const command2 = new GetQueueUrlCommand(params);
    try {
      await sqsClient.send(command1);
    } catch(e){
      if (e instanceof ConflictException ){
        return e;
      } else {
        throw e;
      }
    } finally {
      return sqsClient.send(command2);
    }
  }
  const SendMessage = (params) => {
    const command = new SendMessageCommand(params);
    return sqsClient.send(command);
  }

  return {
    SQSCreateQueue: (params) => CreateQueue(params),
    SQSSendMessage: (params) => SendMessage(params),
  };
}

export function ScInit(
  {
    // 初期化関連
    SchedulerClient,
    
    // メインの関数
    CreateScheduleCommand,
    DeleteScheduleCommand,
    CreateScheduleGroupCommand,
    ListScheduleGroupsCommand,

    // エラーハンドリング関連
    ConflictException,
    ValidationException,
    ResourceNotFoundException,
  },
  in_config=null
){
  // スケジュール書き込みは、だいたい 200ms くらいの時間がかかってしまう
  const config = getConfig_low( in_config );
  const scClient = new SchedulerClient(config);
  
  const CreateScheduleMain = async (params) => {
    console.log('CreateSchedule param', params);
    const com = new CreateScheduleCommand(params);
    try {
      const data = await scClient.send(com);
      console.log("Success, scheduled rule created; Rule ARN:", data);
      return data;
    } catch(e){
      if (e instanceof ConflictException ){
        // リトライで書き込み済みを再度書き込もうとしたとき
        return e;
      } else if (e instanceof ValidationException ){
        // 引数の内容に問題がある場合（権限が足りていないなど）
        throw e;
      } else if (e instanceof ResourceNotFoundException ){
        // 削除済みのスケジュールを削除しようとしたとき
        throw e;
      } else {
        throw e;
      }
    }
  };
  const DeleteScheduleMain = (params) => {
    console.log('DeleteSchedule param', params);
    const com = new DeleteScheduleCommand(params);
    return scClient.send(com);
  };
  const CreateScheduleGroupMain = async (params) => {
    console.log('CreateScheduleGroup param', params);
    const com = new CreateScheduleGroupCommand(params);
    try {
      const ret = await scClient.send(com);
      console.log("Success, scheduled gruop created:", ret);
      return ret;
    } catch(e){
      if (e instanceof ConflictException ){
        // すでに作成されていた場合
        return e;
      } else {
        throw e;
      }
    }
  };
  const ListGroupScheduleMain = (params) => {
    console.log('ListGroupSchedule param', params);
    const com = new ListScheduleGroupsCommand(params);
    return scClient.send(com);
  };

  return {
    ScCreateSchedule: (params) => CreateScheduleMain(params),
    ScDeleteSchedule: (params) => DeleteScheduleMain(params),
    ScCreateScheduleGroup: (params) => CreateScheduleGroupMain(params),
    ScListGroupSchedule: (params) => ListGroupScheduleMain(params),
  };
}

export function S3Init(
  {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
  },
  {
    getSignedUrl
  } = {},
  in_config=null)
{
  // 初期化
  const config = getConfig( in_config );
  const s3Client = new S3Client(config);

  // オブジェクト取得
  const s3GetObjectMain = async (bucketParams) => {
    try {
      // Create a helper function to convert a ReadableStream to a string.
      const streamToString = (stream) =>
            new Promise((resolve, reject) => {
              const chunks = [];
              stream.on("data", (chunk) => chunks.push(chunk));
              stream.on("error", reject);
              stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
            });

      // Get the object} from the Amazon S3 bucket. It is returned as a ReadableStream.
      const com = new GetObjectCommand(bucketParams);
      const data = await s3Client.send(com);
      if(DEBUG) console.log("S3GetObject Result:", data);

      // Convert the ReadableStream to a string.
      const bodyContents = await streamToString(data.Body);
      if(DEBUG) console.log("S3GetObject Result:", bodyContents);
      return bodyContents;

    } catch (err) {
      console.log("Error", err);
      throw new Error( err.message );
    }
  };
  const s3PutObjectMain = (bucketParams) => {
    const command = new PutObjectCommand(bucketParams);
    return s3Client.send( command );
  };
  const s3GetSignedUrlMain = (bucketParams) => {
    if(!getSignedUrl){
      console.warn("getSignedUrl not found.");
      return {};
    }
    const command = new GetObjectCommand(bucketParams);
    return getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
  };
  const s3PutSignedUrlMain = (bucketParams) => {
    if(!getSignedUrl){
      console.warn("getSignedUrl not found.");
      return {};
    }
    const command = new PutObjectCommand(bucketParams);
    return getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
  };

  return {
    dummy: (params) => s3GetSignedUrlMain(params),
    S3GetObject: (params) => s3GetObjectMain(params),
    S3PutObject: (params) => s3PutObjectMain(params),
    S3GetSignedUrl: (params) => s3GetSignedUrlMain(params),
    S3PutSignedUrl: (params) => s3PutSignedUrlMain(params),
  };
}

export function DynamoDBInit(
  { DynamoDBClient },
  { DynamoDBDocumentClient,
    GetCommand,
    QueryCommand,
    ScanCommand,
    PutCommand,
    DeleteCommand,
    UpdateCommand,
    BatchWriteCommand,
    BatchGetCommand,
  },
  in_config=null )
{
  // DynamoDB ドキュメントクライアントの使用
  // https://docs.aws.amazon.com/ja_jp/sdk-for-javascript/v3/developer-guide/dynamodb-example-dynamodb-utilities.html

  const config = getConfig(  );
  const ddbClient = new DynamoDBClient(config);
  if(DEBUG) console.log("DynamoDBInit config:", config);

  // ブラウザで行う場合は同時実行の制御が必要
  // 同時に要求された場合、キャシュを作成するための、SSM 取得が全て実行されてしまう
  let CASH = {};

  const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: true, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
  };
  const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
  };
  const translateConfig = { marshallOptions, unmarshallOptions, region: REGION };
  // Create the DynamoDB Document client.
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);
  const comSend = async (command, cb=undefined, retry=false) => {
    if(DEBUG) console.log("DynamoDBDocumentClient com: %j", command);
    const cash_key = command.input.CASH_KEY;
    if(cash_key && CASH[ cash_key ]){
      if(DEBUG) console.log("DynamoDB cash Hit");
      return CASH[ cash_key ];
    }

    let loop_count = 0;
    let error;
    do{
      if(DEBUG) console.log("DynamodB call", loop_count);
      //const data = await ddbDocClient.send(command);
      //if(DEBUG) console.log("DynamoDB OK:", data);
      // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/dynamodbserviceexception.html
      // エラー対応は Class DynamoDBServiceException
      let data = {}, err = null;
      await ddbDocClient
        .send(command)
        .then((ret) => {
          //if(DEBUG) console.log("DynamoDB then:", ret);
          data = ret;
          if( cb ) cb( data );
        })
        .catch((error) => {
          err = error;
        })
        .finally(() => {
          if(DEBUG) console.log("DynamoDB Result:", data);
        });
      if( err ) await ErrorCheck("DynamoDB", err);

      // TODO : 下記に未対応
      // Limit
      // LastEvaluatedKey

      if(DEBUG) console.log(
        "検証用 Result:",
        "attempts:" + data.$metadata?.attempts,
        "totalRetryDelay:" + data.$metadata?.totalRetryDelay,
        "LastEvaluatedKey:" + data.LastEvaluatedKey,
      );
      const Key = command.outputKeyNodes[ 0 ].key;
      if( cash_key ){
        switch(Key){
        case 'Item':
          if(DEBUG) console.log("DynamoDB cash:", data?.Item?.length);
          break;
        case 'Items':
          if(DEBUG) console.log("DynamoDB cash:", data?.Items?.length);
          break;
        }
      }
      if(data && data[ Key ])
        CASH[ cash_key ] = data;
      if(DEBUG) console.log("DynamoDB send end.");
      return data;
    } while( ++loop_count < ROOP_MAX);
    return error;
  };

  // この戻りは data ではなく、Promise が戻っているため、呼び側で await が必須
  const getDynamoDBMain = (params, cb) => {
    if(DEBUG) console.log("getDynamoDB prams:", params);
    const com = new GetCommand(params);
    return comSend(com, cb);
  };
  const putDynamoDBMain = (params, cb) => {
    if(DEBUG) console.log("putDynamoDB prams:", params);
    const com = new PutCommand(params);
    return comSend(com, cb);
  };
  const deleteDynamoDBMain = (params, cb) => {
    if(DEBUG) console.log("deleteDynamoDB prams:", params);
    const com = new DeleteCommand(params);
    return comSend(com, cb);
  };
  const queryDynamoDBMain = (params, cb) => {
    if(DEBUG) console.log("queryDynamoDB prams:", params);
    const com = new QueryCommand(params);
    return comSend(com, cb);
  };
  const scanDynamoDBMain = (params, cb) => {
    if(DEBUG) console.log("scanDynamoDB prams:", params);
    const com = new ScanCommand(params);
    return comSend(com, cb);
  };
  const batchWriteDynamoDBMain = (params, cb) => {
    if(DEBUG) console.log("batchWriteDynamoDB prams:", params);
    const com = new BatchWriteCommand(params);
    return comSend(com, cb);
  };
  const batchGetDynamoDBMain = (params, cb) => {
    if(DEBUG) console.log("batchGetDynamoDB prams:", params);
    const com = new BatchGetCommand(params);
    return comSend(com, cb);
  };

  // DynamoDB を使った、共通関数を作る場合の例
  // データをキャッシュする場合
  let BrandConfg = {};
  const getBrandConfig = async (BuildID, key, cb) => {
    if (BrandConfg[ key ]) return BrandConfg[ key ];
    const params = {
      TableName: "TestDB",
      Key: {
        BuildID,
        now_time: key,
      },
      ProjectionExpression: "Endpoint",
    };
    if(DEBUG) console.log("getBrandConfig prams:", params);
    const com = new GetCommand( params );
    let ret = await comSend(com, cb);
    if(DEBUG) console.log("getBrandConfig Result:", ret);
    BrandConfg[ key ] = ret.Endpoint;
    return BrandConfg[ key ];
  };

  // DynamoDB を使った、共通関数を作る場合の例
  // 特定のデータを排他更新し、ユニークな値を取得する場合
  const getSEQ = async (BuildID, key, cb) => {
    if (BrandConfg[ key ]) return BrandConfg[ key ];
    const params = {
      TableName: "TestDB",
      Key: {
        BuildID,
        now_time: key,
      },
      ExpressionAttributeValues: {
        ":val": 1,
      },
      UpdateExpression: "ADD count, :val",
    };
    if(DEBUG) console.log("getSEQ params:", params);
    const com = new UpdateCommand( params );
    let ret = await comSend(com, cb);
    if(DEBUG) console.log("getSEQ Result:", ret);
    return ret;
  };

  return {
    // この戻りは data ではなく、Promise が戻っているため、呼び側で await が必須
    getDynamoDB: (params, cb) => getDynamoDBMain( params, cb ),
    putDynamoDB: (params, cb) => putDynamoDBMain( params, cb ),
    deleteDynamoDB: (params, cb) => deleteDynamoDBMain( params, cb ),
    queryDynamoDB: (params, cb) => queryDynamoDBMain( params, cb ),
    scanDynamoDB: (params, cb) => scanDynamoDBMain( params, cb ),
    batchWriteDynamoDB: (params, cb) => batchWriteDynamoDBMain( params, cb ),
    batchGetDynamoDB: (params, cb) => batchGetDynamoDBMain( params, cb ),

    getBrandConfig: (bid, key, cb) => getBrandConfig(bid, key, cb ),
    getSEQ: (bid, key, cb) => getSEQ(bid, key, cb ),
  };
}

export function LmbdaInit({LambdaClient, InvokeCommand}, conf){
  const config = getConfig();
  const client = new LambdaClient(config);

  const callLambdaMain = async (FunctionName, param, wait) => {
    const Payload = JSON.stringify( param );
    const prams = {
      InvocationType: wait ? "RequestResponse" : "Event",
      FunctionName,
      Payload,
    };

    const com = new InvokeCommand(prams);
    let tmp = {}, loop_count = 0;
    do{
      if(DEBUG) console.log("callLambda prams:", prams, loop_count);
      try{
        tmp = await client.send( com );
        break;
      } catch(error){
        await ErrorCheck("callLambda", error);
      }
    } while(++loop_count < ROOP_MAX);
    if( !tmp.Payload ) return { StatusCode: 0 };

    // Payload は Uint8Array になって戻ってくる
    const str = new TextDecoder().decode( tmp.Payload );
    if(DEBUG) console.log('callLambdaMain Result:', tmp, str);
    if( str ){
      return JSON.parse(str);// 文字列を Map に変換
    } else {
      // 非同期の場合に正常は StatusCode = 202, Payload は空
      return tmp;
    }
  };

  // Promise を返す
  return {
    callLambda: (func, param, wait=true) => callLambdaMain(func, param, wait),
    callLambda_nowait: (func, param) => callLambdaMain(func, param, false),
  };
}

export function SSMInit({SSMClient, GetParameterCommand}, conf=null){
  const config = getConfig();
  const client = new SSMClient(config);

  // ブラウザで行う場合は同時実行の制御が必要
  // 同時に要求された場合、キャシュを作成するための、SSM 取得が全て実行されてしまう
  let CASH = {};

  const getSSMMain = async(Name) =>{
    if(CASH[ Name ]) return CASH[ Name ];

    let ret = "", loop_count = 0;
    const com = new GetParameterCommand( { Name } );
    do{
      try {
        ret = await client.send(com);
        break;
      } catch(err){
        await ErrorCheck("SSM", err);
      }
    } while(++loop_count < ROOP_MAX);

    if(DEBUG) console.log('getSSMMain Result:', ret);
    CASH[ Name ] = ret.Parameter.Value;
    return CASH[ Name ];
  };

  // Promise を返す
  return {
    getSSM: (Name) => getSSMMain(Name),
  };
}

//export default () => {};

/*
・node_modules を参照する場所を確認する
  $ node
  $ > global.module.paths

・組み込みモジュールを一覧する
  $ node -pe "require('module').builtinModules"

*/
