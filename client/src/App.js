import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

import "./App.css";

var AWS = require('aws-sdk');

var token;
var kmsEncyptedToken = "CiC**********************************************************************************************I=";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runKms);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

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
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 40</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValue}</div>
        <button>
          AWS  KMS で暗号化
        </button>
        <br/>
      </div>
    );
  }
  /*
Ethereum
Lamda sign

ropsten module=logs&action=getLogs の代用
https://y-nakajo.hatenablog.com/entry/2017/12/06/144220
  - ずっと監視したい時はfilter#watch
  - 過去に発生した少量のEventを取得したい時はfilter#get()
  - 過去に発生した大量のEventを取得したい時はfilter#get(callback)

  web3.eth.filter.get
    fromBlockからtoBlockまでの間に発生したEventをすべて返します。
    toBlockが'latest'やundefinedの時は、getをcallした時点までの
    Eventを返します。


  */
}

export default App;
