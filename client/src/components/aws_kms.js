/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';
import { getKmsClient } from '../lib/lib_aws';

var token;
var kmsEncyptedToken = "CiC**********************************************************************************************I=";

class Hello extends  Component {

  runKms = async () => {
    const { accounts, contract } = this.state;
    const {KeyId, kmsClient} = getKmsClient();

    let response;
    // Encrypt a data key
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
      <div>Kms</div>
    );
  }
}

export default Hello;
