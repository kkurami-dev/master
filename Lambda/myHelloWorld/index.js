var AWS = require('aws-sdk');
const kms = new AWS.KMS({apiVersion: '2014-11-01'});
const id = "01f9ef3a-7f13-4fb8-b70c-f60d76f924ab";

exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('開発'),
    };
    return response;
};
