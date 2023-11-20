import AWS from 'aws-sdk';
import crypto from 'crypto';

const jwt = require('jsonwebtoken');


// https://qiita.com/jp_ibis/items/916e2901d53f34757222

function AWSAuth(){
  const accessKeyId = 'XXXXXXXXXXXXX'; // IAMから取得
  const secretAccessKey = 'XXXXXXXXXXXXXXXXXXXXXXXXX'; // IAMから取得
  const userPoolId = 'ap-northeast-1_XXXXXXXXXX'; // Cognito ユーザープールの全般設定で表示されるプールID
  const clientId = 'XXXXXXXXXXXXXXXXXXXXX'; // Cognito アプリクライアントで表示されるアプリクライアント ID
  const clientSecret = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Cognito アプリクライアントで表示されるアプリクライアントのシークレット
  const cognito = new AWS.CognitoIdentityServiceProvider({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: 'ap-northeast-1'
  });
  // SECRET_HASHは、ユーザー名とクライアントIDを結合し、ハッシュ化したものを設定
  const params = {
    UserPoolId: userPoolId, // required
    ClientId: clientId, // required
    AuthFlow: 'ADMIN_USER_PASSWORD_AUTH', //USER_SRP_AUTH | REFRESH_TOKEN_AUTH | REFRESH_TOKEN | CUSTOM_AUTH | ADMIN_NO_SRP_AUTH | USER_PASSWORD_AUTH | ADMIN_USER_PASSWORD_AUTH
    AuthParameters: {
      USERNAME: 'symfoware',
      PASSWORD: 'P@ssw0rd',
      SECRET_HASH: crypto.createHmac('sha256', clientSecret).update('symfoware' + clientId).digest('base64')
    }
  };
  cognito.adminInitiateAuth(params).promise()
    .then((data) => {
      console.log(data);
    }).catch((err) => {
      console.log(err);
    });
}
