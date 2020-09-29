import Web3 from "web3";

var AWS = require('aws-sdk');
// aws-kms-provider

const kms = new AWS.KMS({apiVersion: '2014-11-01'});
const id = "01f9ef3a-7f13-4fb8-b70c-f60d76f924ab";

exports.handler = async (event) => {
  // TODO implement
  // https://github.com/odanado/aws-kms-provider/blob/master/examples/sign.ts
  // aws-kms-provider aws-sdk
  // sendTransaction
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
