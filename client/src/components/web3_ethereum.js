/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';
/**
   web3.version : 1.2.6
   truffle develop で確認
    前準備： デプロイを実行できるようにトークンを渡しておく
      $ turffle develop

      chorme の metamask で truffle に接続
       http://localhost:8545
       他の項目は自動で入るか、適当

      truffle(develop)> own = accounts[0]
      truffle(develop)> cli = "0xFFFFFFFFFFFFF"
      truffle(develop)> web3.eth.getBalance(own)
      truffle(develop)> web3.eth.getBalance(cli)
      truffle(develop)> web3.eth.sendTransaction({from: own, to: cli, value: '1000000000000000000'})
      ※ 1ETH 渡している

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
import SimpleStorageContract from "../contracts/SimpleStorage.json";
import getWeb3 from "../lib/getWeb3";

import "../App.css";

async function DeployContract(web3, account, obj, cb) {
  console.log("DeployContract", web3, account, obj, cb);

  try{
    let bytecode = obj.bytecode;
    let abi = obj.abi;
    console.log("abi", abi);

    // デプロイに必要なGasを問い合わせる
    let gasprice = 0;
    let nowEth = await web3.eth.getBalance(account);
    web3.eth.getGasPrice().then(console.log);
    let gasEstimate = await web3.eth.estimateGas({data: bytecode});
    if(nowEth < gasEstimate ){
      console.log(nowEth, "<", gasEstimate);
      cb( "gas が不足している", null );
      return;
    }

    let ret;
    ret = await web3.eth.sendTransaction({
      from: account,
      data: bytecode // deploying a contracrt
    }, function(error, hash){
      if(error) console.error(error);
      else console.log(hash);
    });
    cb( null, ret );
  }
  catch(e){
    console.log(e.message);
    cb( e, null );
  }
}

export default class Web3Ethereum extends  Component {
  state = { storageValue: 0,
            web3: null,
            accounts: null,
            contract: null
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

  componentDidMount = async () => {
    console.log("componentDidMount");

    try {
      // Chorome の MetaMask 拡張機能でローカルの truffle に接続するので、このままで
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      console.log("ok web3.version:", web3.version, web3);

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      console.log("accounts", accounts);

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      console.log("networkId", networkId);
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      console.log("deployedNetwork", deployedNetwork);
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      console.log("instance", instance);
      
      let getNodeInfo = web3.eth.getNodeInfo();
      let log = {
        web3, window,
        accounts, networkId, deployedNetwork, instance,
        getNodeInfo
      };
      console.log("Web3 OK ", log);

      const obj = require("../contracts/TxRelay.json");
      
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance , obj});
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  callDeploy(e){
    console.log("callDeploy()", e );
    
    let {web3, accounts, obj} = this.state;
    DeployContract(web3, accounts[0], obj, (error, result) => {
      console.log("DeployContract", result);
    });
  }

  render() {
    if (!this.state.web3) {
      // web3 のインスタンスが入るまではここに入る
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div>
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
          Web3:v{this.state.web3.version}
        </p>
        <p>
          Try changing the value stored on <strong>line 40</strong> of App.js.
        </p>

        <button onClick={this.callDeploy.bind(this)}>デプロイ</button><br/>
      </div>
    );
  }
}
