/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';
/**
   web3.version : 1.2.6
   API: https://web3js.readthedocs.io/en/v1.2.6/web3-eth.html

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
      truffle(develop)> web3.eth.sendTransaction({from: own, to: cli, value:'1000000000000000000'})
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
import getWeb3 from "../lib/getWeb3";
import {callLambda} from "../lib/lib_aws";
import "../App.css";

async function DeployContract(web3, account, obj, param ) {
  console.log("DeployContract s");

  try{
    let bytecode = obj.bytecode;
    let abi = obj.abi;
    let ret_hash;
    console.log("abi", abi);

    // デプロイに必要なGasを問い合わせる
    let nowEth = web3.eth.getBalance(account);
    web3.eth.getGasPrice().then(console.log);
    let gasEstimate = web3.eth.estimateGas({data: bytecode});
    if(nowEth < gasEstimate ){
      console.log(nowEth, "<", gasEstimate, "gas が不足している");
      return null;
    }

    let call = new Promise((resolve, reject) => {
      web3.eth.sendTransaction({
        from: account,
        data: bytecode, // deploying a contracrt
        arguments: param
      }, (error, hash) => resolve( hash ));
    });
    await call.then((value) => ret_hash = value );

    console.log("DeployContract e", ret_hash);
    return ret_hash;
  }
  catch(e){
    console.log(e.message);
    return null;
  }
}

async function Contract(web3, account, in_param, ret_hash){
  var receipt;

  
  if(ret_hash){
    console.log("getTransactionReceipt()");
    await web3.eth.getTransactionReceipt(ret_hash).then((result) => receipt = result);
    //console.log("Contract() A", receipt );
    if(!receipt)
      return { out_param: in_param, hash: ret_hash, receipt };
  }

  console.log("Contract() B", in_param, in_param.length);
  if(in_param.length === 0)
    return {out_param:in_param, hash:null, receipt };
  
  let {obj, tx_param, act} = in_param.shift();
  let hash = await DeployContract(web3, account, obj, tx_param );
  return {out_param:in_param, hash, receipt };
}

//////////////////////////////////////////////////////////////////////////////////
export default class Web3Ethereum extends  Component {
  state = { storageValue: 0,
            web3: null,
            accounts: null,
            contract: null,
            
            first: true
          };

  componentDidMount = async () => {
    console.log("componentDidMount");
    try {

      // Chorome の MetaMask 拡張機能でローカルの truffle に接続するので、このままで
      const web3 = await getWeb3();

      const accounts = await web3.eth.getAccounts();
      const obj = require("../contracts/TxRelay.json");
      this.setState({ web3, account: accounts[0], obj});
    } catch (error) {
      alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.error(error);
    }
  };

  async callDeploy(e){
    let {web3, account, obj, ret_hash} = this.state;
    let in_param = [{obj, tx_param:[], act:0}, {obj, tx_param:[], act:0}, {obj, tx_param:[], act:0}];
    let i = 0;
    do {
      console.log("callDeploy() loop", ++i );
      let {out_param, hash, receipt} = await Contract(web3, account, in_param, ret_hash);
      console.log("callDeploy()", receipt);
      ret_hash = hash;
      in_param = out_param;
    } while(ret_hash || in_param.length);
    console.log("callDeploy() end" );
  }

  async callLambdaDeploy(e){
    let now_time = Date.now();
    this.setState({ first: false });
    let obj = "";
    let in_param = [{tx_param:[], act:0},
                    {tx_param:[], act:0},
                    {tx_param:[], act:0},
                    {tx_param:[], act:0},
                    {tx_param:[], act:0},
                    {tx_param:[], act:0},
                    {tx_param:[], act:0},
                    {tx_param:[], act:0},
                    {tx_param:[], act:0},
                    {tx_param:[], act:0}];
    let hash, i = 0;
    do {
      let result = await callLambda("BlockChainMain", {in_param, hash});
      ++i;
      if(result.errorType || result.errorMessage) {
        console.error("callDeploy() loop", Date.now() - now_time, i, result );
        return;
      }

      let {out_param, out_hash, receipt} = result.target;
      console.log("callDeploy()", Date.now() - now_time, out_param, out_hash, receipt);
      hash = out_hash;
      in_param = out_param;
    } while(hash || in_param.length);
    console.log("callDeploy() end", Date.now() - now_time );
  }

  render() {
    if (!this.state.web3) {
      // web3 のインスタンスが入るまではここに入る
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    if(this.state.first)  this.callLambdaDeploy(this);
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
        <button onClick={this.callLambdaDeploy.bind(this)}>デプロイ(Lambda)</button><br/>
      </div>
    );
  }
}
