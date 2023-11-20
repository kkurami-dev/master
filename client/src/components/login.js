/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';
import axios from 'axios';

//const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
import AmazonCognitoIdentity from 'amazon-cognito-identity-js';

const REGION = 'ap-northeast-1';
const USERPOOLID = 'ap-northeast-1_yXFT8HNNa';
const CLIENTID = '4qopfm69rvhcfmvt5ou6bg3gp2';
const url_top = 'https://api1.kkurami2.link';

function callCognito() {
  document.getElementById('result').value = "";
  $('#message').empty();

  // 画面からID/PWを取得
  const username = document.getElementById('idTxt').value;
  const password = document.getElementById('pwTxt').value;

  const authenticationData = {
    Username : username,
    Password : password,
  };
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  const poolData = {
    UserPoolId : USERPOOLID,
    ClientId : CLIENTID
  };
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {
    Username : username,
    Pool : userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    // 認証成功時の処理
    onSuccess: function (result) {
      let accessToken = result.getAccessToken().getJwtToken();
      console.log(JSON.stringify(result));
      let idToken = result.idToken.jwtToken;
      console.log(idToken);
      $('#result').val(idToken);
    },

    // エラー発生時の処理
    onFailure: function(err) {
      console.log(JSON.stringify(err));
      $('#message').append(JSON.stringify(err));
    },

    // パスワード変更が必要なユーザーの、パスワードを強制変更
    newPasswordRequired: function(userAttributes, requiredAttributes) {
      cognitoUser.completeNewPasswordChallenge("test9999", {}, this)
      $('#message').append("パスワード変更が必要なユーザーのため、パスワードを「test9999」に変更しました\n");
    }
  });
}

function axios_test1() {
  const server = url_top + '/test';
  axios.get(server)
    .then((res) => { console.log(res); })
    .catch(console.error);
}

class Welcome extends  Component {
  render() {
    return (
      <div>
        <div>トークン取得</div>
        <div>
          <label >ID : </label>
          <input type="text" id="IdText" value=''/>
        </div>
        <div>
          <label >PW : </label>
          <input type="text" id="pwTxt" value=''/>
        </div>
        <button type="button" id="loginBtn" onClick={callCognito}>Get id token</button>
        <textarea disabled id="result" rows="5" placeholder="idトークン"></textarea>
        <p id="message"></p>
      </div>
    );
  }
}

export default Welcome;
