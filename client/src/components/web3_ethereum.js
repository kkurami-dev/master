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
//import getWeb3 from "../lib/getWeb3";
import Web3 from "web3";
import { getBalanceOf,
       } from "../lib/lib_web3";
import { callLambda,
         getLambdaDB,
         //putLambdaDB,
         //updateLambdaDB
       } from "../lib/lib_aws";
import history from '../history';

import "../App.css";

const config = require("../configs/config.json");
const table_name = config.db_name;

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
    return {out_param:in_param, out_hash:null, receipt };
  
  let {obj, tx_param, act} = in_param.shift();
  let hash;
  if( act === 0 )
    hash = await DeployContract(web3, account, obj, tx_param );
  return {out_param:in_param, out_hash: hash, receipt };
}

const objTxRelay = require("../contracts/TxRelay.json");
//////////////////////////////////////////////////////////////////////////////////
export default class Web3Ethereum extends  Component {
  constructor(props) {
    console.log("constructor(props)");
    super(props);
    this.state = {
      storageValue: 0,
      web3: null,
      accounts: null,
      contract: null,

      loop: true,
      first: true
    };
  }

  componentDidMount = async () => {
    console.log("componentDidMount");
    try {

      // Chorome の MetaMask 拡張機能でローカルの truffle に接続するので、このままで
      //const web3 = await getWeb3();
      //const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
      const provider = new Web3.providers.HttpProvider('https://rpc-mumbai.matic.today');
      const web3 = new Web3(provider);
      console.log(web3);

      const accounts = await web3.eth.getAccounts();
      this.setState({ web3, account: accounts[0], objTxRelay});
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
      let {out_param, out_hash, receipt} = await Contract(web3, account, in_param, ret_hash);
      console.log("callDeploy()", receipt);
      ret_hash = out_hash;
      in_param = out_param;
    } while(ret_hash || in_param.length);
    console.log("callDeploy() end" );
  }

  componentWillUnmount(event, v2, v3) {
    console.log("componentWillUnmount", event, v2, v3);
    this.setState({ loop: false });
  }
  async sendLoop( event ){
    let in_param = [{tx_param:[], act:2}];
    let now_time = Date.now();
    await this.callLambdaDeploy_sub( in_param );
    console.log("callLambdaDeploy()", Date.now() - now_time);
  }

  async callLambdaDeploy( event ){
    // 登録
    // let in_param = [{tx_param:[], act:0},
    //                 {tx_param:["MyToken", "EGT", 8], act:1}];
    // 
    let in_param = [{tx_param:[], act:2}];
    let now_time = Date.now();
    await this.callLambdaDeploy_sub( in_param );
    console.log("callLambdaDeploy()", Date.now() - now_time);
  }

  async callLambdaDeploy_sub( in_param ){
    let now_time = Date.now();
    this.setState({ first: false, loop: true });
    console.log("callLambdaDeploy_sub()", Date.now() - now_time);
    let hash, i = 0;
    do {
      if (!this.state.loop) break;
      let loop_time = Date.now();
      let result = await callLambda("BlockChainMain", {in_param, hash});
      ++i;
      if(result.errorType || result.errorMessage) {
        console.error("callDeploy() loop", Date.now() - loop_time, i, result );
        return;
      }

      let {out_param, out_hash, receipt} = result.target;
      console.log("callDeploy()", Date.now() - loop_time, result);
      if(!in_param.length) break;
      hash = out_hash;
      in_param = out_param;

    } while(hash || in_param.length);
    console.log("callLambdaDeploy_sub()", Date.now() - now_time);
    //console.log("callDeploy() end", (Date.now() - now_time)/1000 );
  }

  callLambdaDeploy_batch = async ( ) => {
    console.log("callLambdaDeploy_batch start");
    const web3 = this.state.web3;
    if (!web3) {
      return;
    }
    let now_time = Date.now();

    let callback1 = (error, result) =>{
      console.log("callback1", Date.now() - now_time, error, result);
    }
    let callback2 = (error, result) =>{
      console.log("callback2", Date.now() - now_time, error, result);
    }
    let callback3 = (error, result) =>{
      console.log("callback3", Date.now() - now_time, error, result);
    }

    const abi = require("../contracts/MyToken").abi,
          account = this.state.account,
          func_name = "balanceOf",
          from = config.user1_addr,
          to = config.tokAddr,
          cli = config.user2_addr;
    let func_abi;

    console.log("callLambdaDeploy_batch abi", abi);

    let contract = new web3.eth.Contract(abi, to);
    
    let batch = new web3.BatchRequest();
    batch.add(web3.eth.getBalance.request(from, 'latest', callback1));
    batch.add(web3.eth.getBalance.request(to, 'latest', callback2));
    batch.add(contract.methods.transfer(to, "3").call.request({ from }, callback3));
    let result = batch.execute();

    console.log("callLambdaDeploy_batch end");
  }

  checkLambdaDB = (event) =>{
    //let data = '0x00' + Date.now();
    let Key = {BuildID: {S: 'b0001'}, now_time: {N: '0'}};
    //getLambdaDB(table_name, {BuildID: {S: 'b0001'}, now_time: {N: '0'}}, console.log);
    //updateLambdaDB(table_name, Key, {txaddr:{Value:{S: data}, Action:"PUT"}},console.log);
    getLambdaDB(table_name, Key, console.log);
    getBalanceOf(this.state.web3, "token", (item) => {
      console.log("checkLambdaDB", item);
    });
  }

  toLogWatch = (event) =>{
    console.log("toLogWatch", event);
    history.push('/aws_cwl');
    this.setState({ first: false, loop: false });
  }

  render() {
    if (!this.state.web3) {
      // web3 のインスタンスが入るまではここに入る
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    if(this.state.first)  this.checkLambdaDB(this);
    //if(this.state.first)  this.callLambdaDeploy(this);
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
        <p>
          <button onClick={this.callDeploy.bind(this)}>デプロイ</button><br/>
          <button onClick={this.callLambdaDeploy.bind(this)}>デプロイ(Lambda)</button><br/>
          <button onClick={(e) => this.sendLoop(e)}>送信の繰り返し</button><br/>
          <button onClick={(e) => this.callLambdaDeploy_batch(e)}>batch request の確認</button><br/>
        </p>
        <button onClick={(e) => this.toLogWatch(e)}>ログ監視</button><br/>
        <button onClick={(e) => this.checkLambdaDB(e)}>DB確認</button><br/>
      </div>
    );
  }
}
