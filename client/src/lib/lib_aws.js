/** -*- coding: utf-8-unix -*-
 * 
 */
import axios from 'axios';
const sleep = require('sleep-async')();
const config = require('../configs/config');
const API_BASE_URL = config.api_base_url;
var AWS = require('aws-sdk');
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

export function getKmsClient() {
  let KeyId = config.kms_key;
  let url   = config.api_base_url;
  return {kmsClient, KeyId, url};
}
export function getLambdaClient() {
  return { lambdaClient };
}

/**
 * CloudWatch LogsのログをJavaScriptで取得する
 *   https://wp-kyoto.net/get-cloudwatchlogs-data-by-javascript/
 */
const black   = '\u001b[30m';
const red     = '\u001b[31m';
const green   = '\u001b[32m';
const yellow  = '\u001b[33m';
const blue    = '\u001b[34m';
const magenta = '\u001b[35m';
const cyan    = '\u001b[36m';
const white   = '\u001b[37m';
const reset   = '\u001b[0m';
export function getLambdaLog(func, cb) {
  console.log("getLambdaLog() call");
  let last_data;
  let nextloop = true
  let nextToken1;
  let nextToken2;
  let io;
  let new_line = 0;
  let old_line = 1;
  let params1 = { logGroupName: '/aws/lambda/'+func,
                  descending: true,
                  orderBy: "LastEventTime" };
  let params2 = { logGroupName: '/aws/lambda/'+func };

  console.log("getLambdaLog() start");
  io = setInterval(() => {
    if(!cb(null) && io){
      console.log("getLambdaLog() A:stop ", nextloop, nextToken2, io);
      clearInterval(io);
      return;
    }
    if(nextloop)
      // ログの一覧の取得
      cloudwatchlogs.describeLogStreams(params1, function(err, data1) {
        const {logStreamName} = data1.logStreams[0];
        params2.logStreamName = logStreamName;

        // 最新のログの取得
        cloudwatchlogs.getLogEvents(params2, (err, data) => {
          if (err) {
            console.log(err);

          } else if(data.events.length > 0){
            if(data.nextToken2) params2.nextToken = data.nextToken;
            old_line = new_line;
            new_line = data.events[ data.events.length - 1].timestamp;
            console.log("time", old_line, new_line, logStreamName);

            if(new_line !== old_line){
              for(let i = 0; i < data.events.length; i++){
                let now_data = data.events[i];
                
                if(!last_data || last_data.timestamp <= now_data.timestamp){
                  let str = now_data.message;

                  // 正規表現
                  //   https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Regular_Expressions
                  let arr = str.match(/\{[\s\S]*\}/);
                  if(arr) console.log(arr);
                  else console.log(str);
                  //console.log(now_data.message);
                }
              }
              last_data = data.events[data.events.length - 1];
            }
            if(0 === old_line) old_line = new_line;

          } else {
            console.log("getLambdaLog() wait", logStreamName, nextloop, data);
          }
          nextloop = cb({io, data});

          if (!nextloop && io) {
            console.log("getLambdaLog() B:stop ", nextloop, nextToken2, io);
            clearInterval(io);
          }
        });
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
