/** -*- coding: utf-8-unix -*-
 * 
 */
import axios from 'axios';
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

export function getKmsClient() {
  let KeyId = config.kms_key;
  let url   = config.api_base_url;
  return {kmsClient, KeyId, url};
}
export function getLambdaClient() {
  return { lambdaClient };
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
