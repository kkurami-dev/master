import React, { Component } from 'react';
/**
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

//import metaTransactionClient from "../metatx/metaTransactionClient";
//import metaTransactionServer from "../metatx/metaTransactionServer";
//import Transaction from "../metatx/transaction";

// const metaTransactionClient = require("./metatx/metaTransactionClient");
// const metaTransactionServer = require("./metatx/metaTransactionServer");
// const Transaction = require("./metatx/transaction");

//const fs = require("fs");
//const solc = require('solc');

// 定数
//const BUFF_SIZE = 100;    // バッファーのサイズ
//const BUFF_POS  = 0;      // バッファーの保存開始位置
//const READ_SIZE = 3;      // 読み取るサイズ
//const READ_POS  = 0;      // 読み取り開始位置

async function deployContract(web3, eth) {
  console.log("deployContract", web3);

  // 入れ物準備
  //const buff = Buffer.alloc(BUFF_SIZE);
  //let str = "";
  
  // ファイルを同期的に開いて内容を取得
  try{
    const networkId = await web3.eth.net.getId();
    console.log(networkId)
    //const deployedNetwork = obj.networks[networkId];
    //console.log(deployedNetwork);

    const obj = require("../contracts/TxRelay.json");
    console.log(obj);

    let bytecode = obj.bytecode;
    let abi = obj.abi;
    console.log(obj, abi);

    // デプロイに必要なGasを問い合わせる
    let gasEstimate = web3.eth.estimateGas({data: bytecode});
    console.log(gasEstimate);
  }
  catch(e){
    console.log(e.message);
  }  
}

export default class Web3Ethereum extends  Component {
  componentDidMount = async () => {
    console.log("componentDidMount");

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
      
      let getNodeInfo = web3.eth.getNodeInfo();
      let log = {
        web3, window,
        accounts, networkId, deployedNetwork, instance,
        getNodeInfo
      };
      console.log(log);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      //this.setState({ web3, accounts, contract: instance }, this.getDataFromApi);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

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

        <button onClick={deployContract.bind(this.state.web3)}>デプロイ</button><br/>
      </div>
    );
  }
}
