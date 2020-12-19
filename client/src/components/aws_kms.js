import React, { Component } from 'react';

var AWS = require('aws-sdk');

var token;
var kmsEncyptedToken = "CiC**********************************************************************************************I=";

class Hello extends  Component {

  runKms = async () => {
    const { accounts, contract } = this.state;

    let response;
    const kmsClient = new AWS.KMS({ region: 'ap-northeast-1',
                                    apiVersion: '2014-11-01' });
    // Encrypt a data key
    const KeyId = 'arn:aws:kms:ap-northeast-1:176264229023:key/01f9ef3a-7f13-4fb8-b70c-f60d76f924ab';
    let base64txt = new Buffer(kmsEncyptedToken).toString();
    kmsClient.encrypt({ KeyId, Plaintext: base64txt }, (err, data) => {
      if (err) {
        console.log(err, err.stack); // an error occurred
      } else {
        console.log(data)
        const { CiphertextBlob } = data;
      }
    });

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  render() {
    return (
      <div>Hello {this.props.location.query.name || 'World'}</div>
    );
  }
}

export default Hello;
