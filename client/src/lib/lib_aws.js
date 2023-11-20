/** -*- coding: utf-8-unix -*-
 * 
 */
import axios from 'axios';

import AWS from 'aws-sdk';
import config from '../configs/config';

//const sleep = require('sleep-async')();
//const config = require('../configs/config');
const API_BASE_URL = config.api_base_url;
//var AWS = require('aws-sdk');
AWS.config.update( config );
//  aws config 
// or
//  環境変数
// or
//  "accessKeyId": "",
//  "secretAccessKey": "",

const kmsClient = new AWS.KMS({ region: 'ap-northeast-1', apiVersion: '2014-11-01' });
const lambdaClient = new AWS.Lambda({apiVersion: '2015-03-31'});
const cloudwatchlogs = new AWS.CloudWatchLogs({apiVersion: '2014-03-28'});
const docClient = new AWS.DynamoDB.DocumentClient();

export function getKmsClient() {
  let KeyId = config.kms_key;
  let url   = config.api_base_url;
  return {kmsClient, KeyId, url};
}

export function getLambdaClient() {
  return { lambdaClient };
}

function KeyToVal( data ) {
  //console.log("DynamoDB res", data);
  return data;
  // let ret_val = {};
  // for( let key in data ){
  //   let v = data[key];
  //   if( v.S ) ret_val[key] = v.S;
  //   else if( v.N ) ret_val[key] = parseInt(v.N, 10);
  // }
  // return ret_val;
}

export function getDynamoDB( TableName, Key, cb) {
  let params ={ TableName, Key  };
  try {
    docClient.get(params, function(err, data) {
      if (err) {
        console.trace();
        console.error("DynamoDB getItem", params, err);
      } else {
        let Item = KeyToVal( data.Item );
        cb( Item );
      }
    });
      //.then(console.log)
      //.catch(console.error);
  } catch (error){
    console.error("DynamoDB getItem try/catch", error );
    cb( error );
  }
}
export function delDynamoDB( TableName, Key, cb) {
  let params ={ TableName, Key  };
  try {
    docClient.delete(params, function(err, data) {
      if (err) {
        console.error("DynamoDB deleteItem", params, err, err.stack);
      } else {
        let Item = KeyToVal( data.Item );
        if(cb) cb( Item );
      }
    });
  } catch (error){
    console.error("DynamoDB deleteItem try/catch", error );
    if(cb) cb( error );
  }
}
export function queryDynamoDB( TableName, Key, cb) {
  let params ={ TableName, ...Key  };
  let Items = [];
  try {
    docClient.query(params, function(err, data) {
      if (err) {
        console.error("DynamoDB query", params, err, err.stack);
      } else {
        //console.log("DynamoDB scan", data);
        for(let i = 0; i < data.Count; i++ ){
          let item = data.Items[i];
          Items.push( KeyToVal( item ))
        }
        if(cb) cb( Items );
      }
    });
  } catch (error){
    console.error("DynamoDB scan try/catch", error );
    if(cb) cb( error );
  }
  return Items;
}
export function scanDynamoDB( TableName, Key, cb) {
  let params ={ TableName, ...Key  };
  let Items = [];
  try {
    docClient.scan(params, function(err, data) {
      if (err) {
        console.error("DynamoDB scan", params, err, err.stack);
      } else {
        //console.log("DynamoDB scan", data);
        for(let i = 0; i < data.Count; i++ ){
          let item = data.Items[i];
          Items.push( KeyToVal( item ))
        }
        if(cb) cb( Items );
      }
    });
  } catch (error){
    console.error("DynamoDB scan try/catch", error );
    if(cb) cb( error );
  }
  return Items;
}
export function putDynamoDB(TableName, Item, cb) {
  let params = {
    Item,
    TableName
  };

  try {
    docClient.put(params, function(err, data) {
      if (err) {
        console.error("DynamoDB putItem", err);
      } else {
        //console.log("DynamoDB putItem", data);
        if(cb) cb( data.Item );
      }
    });
  } catch (error){
    console.error("DynamoDB putItem try/catch", error );
    if(cb) cb( error );
  }
}
export function updateDynamoDB(TableName, Key, AttributeUpdates, cb) {
  let params ={
    AttributeUpdates,
    Key,
    TableName,
    ReturnValues: 'ALL_NEW'
  };

  try {
    docClient.updateItem(params, function(err, data) {
      if (err) {
        console.error("DynamoDB updateItem", err, err.stack);
      } else {
        console.log("DynamoDB updateItem", data);
        let Item = KeyToVal( data.Attributes );
        if(cb) cb( Item );
      }
    });
  } catch (error){
    console.error("DynamoDB updateItem try/catch", error );
    if(cb) cb( error );
  }
}

/**
 * CloudWatch LogsのログをJavaScriptで取得する
 *   https://wp-kyoto.net/get-cloudwatchlogs-data-by-javascript/
 */
/*
const black   = '\u001b[30m';
const red     = '\u001b[31m';
const green   = '\u001b[32m';
const yellow  = '\u001b[33m';
const blue    = '\u001b[34m';
const magenta = '\u001b[35m';
const cyan    = '\u001b[36m';
const white   = '\u001b[37m';
const reset   = '\u001b[0m';
*/
export function getLambdaLog(func, cb) {
  console.log("getLambdaLog() call");
  let nextloop = true
  let nextToken2;
  let io;
  let last_time = 0, last_message;
  let params1 = { logGroupName: '/aws/lambda/'+func,
                  descending: true,
                  orderBy: "LastEventTime" };
  let params2 = { logGroupName: '/aws/lambda/'+func };

  // ログ取得後の制御
  const getCloudwatchLog = (err, data) => {
    // 上位コンポーネントからの終了判定
    nextloop = cb({io, data});
    if (!nextloop && io) {
      console.log("getLambdaLog() B:stop ", nextloop, nextToken2, io);
      clearInterval(io);
      return;
    }

    // ログ取得出来たか判定
    if (err) {
      console.log(err);
      return;
    } else if(data.events.length === 0){
      return;
    }

    // ログを取得
    //console.log(params2, data);
    if(data.nextToken2) params2.nextToken = data.nextToken;
    if(last_time === data.events[ 0 ].timestamp &&
       last_message === data.events[ data.events.length - 1 ].message ){
      //console.log("getLambdaLog() wait", onlogStreamName, nextloop, data);
      return;
    }
    last_time = data.events[ data.events.length - 1 ].timestamp;
    last_message = data.events[ data.events.length - 1 ].message;
    params2.startTime = last_time;
    //return;

    // 一行ずつの処理開始
    for(let i = 0; i < data.events.length; i++){
      let org = data.events[i].message;

      // 正規表現
      //   https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Regular_Expressions
      let str = org
          .replace(/  +/g, ' ')
          .replace(/\n/g, '')
          .replace(/'\{/g, '{')
          .replace(/\}'/g, '}')
          .replace(/'/g, '"')
          .replace(/" + "/g, '')
          //.replace(/([io0-9\-;:]{20})[io0-9\-:;]{30,}/g, '$1...')
          //.replace(/(0x.{20}).+/g, '$1...')
          .replace(/(Array|Object)/g, '"$1"')
          .replace(/(?!")([A-Za-z0-9_\-./.:;]+)(?!"): /g, '"$1": ')
          .replace(/": ([^"][A-Za-z0-9_\-/.:;]+[^"]),/g, '": "$1",')
          .replace(/: "(null|true|false|[0-9]+)"/g, ': $1')
          ;
      let arr = str.match(/[[{][\s\S]*[}\]]/g);
      if(arr) {
        for(let i = 0; i < arr.length; i++){
          try {
            console.log(JSON.parse(arr[i]));
          } catch( e ){
            //console.log(org);
            let out = org
                .replace(/,/g, ',\n\t')
                .replace(/([io0-9\-;:]{20})[io0-9\-:;]{30,}/g, '$1...')
                .replace(/(0x.{20}).+/g, '$1...');
            console.log(out);
          }
        }
      } else {
        console.log(str);
      }
    }
  }

  // ログストリームの取得
  console.log("getLambdaLog() start");
  io = setInterval(() => {
    if(!cb({io, data:null}) && io){
      console.log("getLambdaLog() A:stop ", nextloop, nextToken2, io);
      clearInterval(io);
      return;
    }
    if(nextloop)
      // ログの一覧の取得
      cloudwatchlogs.describeLogStreams(params1, function(err, data1) {
        if(!data1) return;
        const {logStreamName} = data1.logStreams[0];
        params2.logStreamName = logStreamName;

        // 最新のログの取得
        cloudwatchlogs.getLogEvents(params2, getCloudwatchLog);
      });
    nextloop = false;
  }, 1000);
}

export function callLambdaTest(Payload, cb) {
  var params = {
    FunctionName: "myHelloWorld",
    InvocationType: "RequestResponse",
    Payload,
    Qualifier: "1"
  };
  lambdaClient.invoke(params, cb);
}

export function callDefFunc(Payload, cb) {
  callLambda( "defFunc", Payload, cb );
}

export function callLambda(FunctionName, payload, cb=null) {
  let call = new Promise((resolve, reject) => {
    let Payload = JSON.stringify( payload );
    var params = {
      FunctionName,
      Payload,
    };
    lambdaClient.invoke(params, (err, data) => {
      if(err) {
        console.error(err);
        reject( err );
      } else {
        if(!data)
          resolve( data );
        if(data.Payload){
          let out = JSON.parse( data.Payload );
          resolve( out );
        }
      }
    });
  });
  let ret_val;
  if(cb)
    call.then((value) => {
      cb(value);
    });
  else
    return call;
    //await call.then((value) => ret_val = value );
  return ret_val;
}

export function callLambdaSendToken(payload, cb) {
  let Payload = JSON.stringify( payload );
  var params = {
    FunctionName: "mySendToken",
    InvocationType: "RequestResponse",
    Payload,
   // Qualifier: "1"
  };
  lambdaClient.invoke(params, (err, data) => {
    //console.log(err, data);
    if(err) cb( err, null );
    else {
      if(data.Payload){
        let out = JSON.parse( data.Payload );
        cb( null, out );
      }
    }
  });
}

export function getDataFromApi() {
  let params = {
    params: { address: this.state.place },
  };

  // APIをコール
  console.log(API_BASE_URL + "", params)
  axios.get(API_BASE_URL + "", params)
    .then((response) => {
      console.log(response)
      // APIから取得したデータをstateに保存
      this.setState({
        message: response.data.message
      });
    })
  axios.post(API_BASE_URL + "", params)
    .then((error, response) => {
      console.log(error, response)
      // APIから取得したデータをstateに保存
      this.setState({
        message: response.data.message
      });
    })
}  
