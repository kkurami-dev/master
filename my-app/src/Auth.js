// https://hisa-web.net/archives/760
// global.fetch = require('node-fetch');
// const AmazonCognitoIdentity = require('amazon-cognito-identity-js')

// exports.Login = (body, callback) => {
//   const name = body.name;
//   const password = body.password;
//   const userPool = body.userPool;
//   const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
//     Username: name,
//     Password: password,
//   })
//   const userData = {
//     Username: name,
//     Pool: userPool,
//   }

//   const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

//   cognitoUser.authenticateUser(authenticationDetails, {
//     onSuccess: result => {
//       const accessToken = result.getAccessToken().getJwtToken();
//       callback(null, accessToken);
//     },
//     onFailure: err => {
//       callback(err)
//     },
//     mfaRequired: function (codeDeliveryDetails) {
//       var verificationCode = prompt('Please input verification code', '');
//       cognitoUser.sendMFACode(verificationCode, this);
//     }
//   })
// }

// https://github.com/tmiki/cognito-sample-js-webapp
//const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
import {
  CognitoUserPool,
  //CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

//const AWS = require('aws-sdk');
//require('amazon-cognito-js');

// https://github.com/tmiki/cognito-sample-js-webapp
// global-variables.js
// Those variables should be filled out with your AWS & Cognito User Pool configurations.
export const REGION = '** place your region name in string. **';
export const POOL_DATA = {
  UserPoolId: process.env.REACT_APP_AUTH_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
};
export const IDENTITY_POOL_ID = '';
export const LOGINS_KEY = 'cognito-idp.' + REGION + '.amazonaws.com/' + POOL_DATA.UserPoolId;

//
let gCognitoUserPool = null;
let gCognitoUser = null;
//let gAccessToken;
//let gIdToken;
//let gRefreshToken;

function gAppendMessage(message) {
  document.getElementById("message-area").innerText = document.getElementById("message-area").innerText + message;
  return;
};

function gPutMessage(message) {
  document.getElementById("message-area").innerText = message;
  return;
};

function gInitCognitoUser(main_cb) {
  gCognitoUserPool = new CognitoUserPool(POOL_DATA);
  console.log(gCognitoUserPool);

  gCognitoUser = gCognitoUserPool.getCurrentUser();
  console.log(gCognitoUser);

  if (gCognitoUser === null) {
    console.log("nobody logged in.");
    return;
  };

  gCognitoUser.getSession((err, session) => {
    // check whether your session is valid and output the result.
    if (err) {
      console.log("getSession: err: " + JSON.stringify(err));
      gPutMessage("getSession: err: " + JSON.stringify(err));
      return;
    }
    console.log('session validity: ' + session.isValid());
    gPutMessage('session validity: ' + session.isValid() + "\n");
    // gAppendMessage('session: ' + JSON.stringify(session));
    console.log(session);

    // get each tokens and store them into global variables.
    //gAccessToken = session.getAccessToken();
    //gIdToken = session.getIdToken();
    //gRefreshToken = session.getRefreshToken();

    // get and show user attributes.
    gCognitoUser.getUserAttributes((err, attributes) => {
      if (err) {
        console.log("getUserAttributes: err: " + JSON.stringify(err));
        gAppendMessage("getUserAttributes: err: " + JSON.stringify(err));
      } else {
        console.log("attributes: " + JSON.stringify(attributes));
        gAppendMessage("attributes: " + JSON.stringify(attributes));
        main_cb();
      };
    });
  });
};

function loginUser(inputData, main_cb){
  const authenticationData = {
    Username: inputData.username,
    Password: inputData.password
  };
  gCognitoUserPool = new CognitoUserPool(POOL_DATA);
  const authenticationDetails = new AuthenticationDetails(authenticationData);
  const userData = {
    Username: inputData.username,
    Pool: gCognitoUserPool
  };

  // override the global variable "gCognitoUser" object.
  gCognitoUser = new CognitoUser(userData);

  gCognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      console.log("result: ", result);
      console.log("gCognitoUser: ", gCognitoUser);
      const accessToken = result.getAccessToken().getJwtToken();
      gPutMessage("Login succeeded!\n");
      gAppendMessage("\naccessToken: " + accessToken);

     gInitCognitoUser(main_cb);
    },
    onFailure: (err) => {
      gPutMessage("\nlogin failed.\n");
      gAppendMessage("err: " + JSON.stringify(err));
    },
  });
  console.log("A function " + loginUser.name + " has finished.");
};

export const Login = (body, callback) => {
  loginUser( body, callback );
}
