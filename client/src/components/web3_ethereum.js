/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';
import moment from "moment";
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
import Web3 from "web3";
import getWeb3 from "../lib/getWeb3";
//import Web3 from "web3";
import { getBalanceOf,
       } from "../lib/lib_web3";
import { callLambda,
         getDynamoDB,
         queryDynamoDB,
         scanDynamoDB,
         putDynamoDB,
         //updateDynamoDB,
         delDynamoDB
       } from "../lib/lib_aws";
import history from '../history';
import { MaticPOSClient } from '@maticnetwork/maticjs';
import { ComposedChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Area, Bar, Line } from 'recharts';

import "../App.css";
//////////////////////////////////////////////////////////////////////////////////
const config = require("../configs/config.json");
const proxyAbi = require("../contracts/UChildERC20Proxy.json").abi;
const table_name = config.db_name;
const objTxRelay = require("../contracts/TxRelay.json");
const Network = require("@maticnetwork/meta/network");
const axiosBase = require('axios');
require('date-utils'); // https://qiita.com/n0bisuke/items/dd28122d006c95c58f9c

////////////////////////////////////////////////////////////////////////////////
const gasPriceNum = 1000;

////////////////////////////////////////////////////////////////////////////////
function UrlCheck(ethereum, matic){

  return {http:{ethereum:'', matic:''}, }
}

export default class Web3Ethereum extends  Component {
  constructor(props) {
    console.log("constructor(props)");
    super(props);

    let dataGraph = [];
    for(let i = 0; i < gasPriceNum; i++){
      dataGraph.push({month: i, '平均': 0, 'infura': 0, 'Etherscan':0});
    }
    
    this.state = {
      storageValue: 0,
      web3: null,
      accounts: null,
      contract: null,

      loop: true,
      first: true,

      network: null,

      // グラフを表示する
      //   https://qiita.com/gcyagyu/items/5eb7c5e3e05e6a2241ed
      //   npm i --save recharts
      //表示させたいデータ群
      GraphNo: 0,
      dataGraph,
      avg: 0,
      radio:'A',
      update: 'on'
    };
  }

  componentDidMount = async () => {
    console.log("componentDidMount");
    try {

      // Chorome の MetaMask 拡張機能でローカルの truffle に接続するので、このままで
      const web3 = await getWeb3();
      //const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
      //const provider = new Web3.providers.HttpProvider('https://rpc-mumbai.matic.today');
      //const web3 = new Web3(provider);
      console.log(web3);

      const accounts = await web3.eth.getAccounts();
      this.setState({ web3, account: accounts[0], objTxRelay});

      this.updateData(() => { return this.state.update === 'on'; });

      //this.checkProxy();
    } catch (error) {
      alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.error(error);
    }

    getBalanceOf(this.state.web3, "token", (item) => {
      console.log("checkDynamoDB", item);
    });
  };

  componentWillUnmount = () => {
    this.setState({ loop:false });
  }

  Contract = async (web3, account, in_param, ret_hash) => {
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
    
    //let {obj, tx_param, act} = in_param.shift();
    let hash;
    // if( act === 0 )
    //   hash = await this.DeployContract(web3, account, obj, tx_param );
    return {out_param:in_param, out_hash: hash, receipt };
  }

  DeployContract = async (web3, obj, arg, call_flg=false)  => {
    console.log("DeployContract s");
    const account = config.account,
          bytecode = obj.bytecode,
          abi = obj.abi;
    console.log("abi", abi, "account", account);

    try{
      // デプロイに必要なGasを問い合わせる
      let nowEth = web3.eth.getBalance(account);
      web3.eth.getGasPrice().then(console.log);
      let gasEstimate = web3.eth.estimateGas({data: bytecode});
      if(nowEth < gasEstimate ){
        console.log(nowEth, "<", gasEstimate, "gas が不足している");
        return null;
      }

      //const nonce = await web3.eth.getTransactionCount( account );
      //const nonceHex = web3.utils.toHex(nonce)
      const gasPriceHex = web3.utils.toHex(3 * 1e9);
      // const estimatedGas = await testCoinContractDeploy.estimateGas();

      var contract = new web3.eth.Contract(abi);
      if(call_flg){
        const hexdata = await contract.deploy({
          data: '0x',
          arguments:arg,
        }).encodeABI();
        console.log('receipt', hexdata);
        return hexdata;
      }
      let result;
      const call = new Promise((resolve, reject) => {
        contract
          .deploy({
            data: bytecode,
            arguments: arg,
          }, function(error, transactionHash){console.log(error, transactionHash)})
          .send({
            from: '0x4A7C625A628981919f37E321A4f9E7C4a90AF15c',
            gasPrice: gasPriceHex,
            gasLimit: web3.utils.toHex(6100500),
          })
          .on('transactionHash', console.log)
          .on('receipt', function(receipt){
            console.log('receipt', receipt);
            resolve(receipt);
          });
      });
      await call.then((ret) => result = ret);
      return result;
    } catch(e){
      console.error("catch", e);
      return null;
    }
  }

  updateGasPriceDB(){
  }

  // 1秒間隔でデータの更新を行う
  updateData(cb){
    // https://api.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=YourApiKeyToken
    //
    console.log('updateData start');
    const rato = 1000000000;
    //const interval = 30000;
    const interval =  100000;
    const baseURL = 'https://api.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=' + config.eth_apikey;
    let scanParam = {ExpressionAttributeValues:{":key": "gasPrice"},
                     KeyConditionExpression: "BuildID = :key",
                     ProjectionExpression: "i, e, now_time",
                     
                      };

    let {dataGraph} = this.state;
    if(dataGraph[0].infura === 0){
      console.log("DynamoDB scan");
      queryDynamoDB(table_name, {...scanParam, Limit: gasPriceNum}, ( db_arr ) => {

        let newDataGraph = dataGraph;
        let avg = 0, idx = 0, infura = 0, etherscan = 0;
        if(db_arr.length > gasPriceNum){
          idx = db_arr.length - gasPriceNum;
        }

        console.log("DataGraph update", db_arr.length, dataGraph.length, idx);
        for(; idx < db_arr.length; idx++){
          const {now_time, e, i} = db_arr[idx];
          newDataGraph[idx]["infura"] = i;
          newDataGraph[idx]["Etherscan"] = e;
          avg += (i + e);
          newDataGraph[idx]["平均"] = parseInt( (avg/(idx * 2)), 10);
          infura = i;
          etherscan = e;
        }
        console.log("DynamoDB scan res", newDataGraph[0]);
        this.setState({ dataGraph:newDataGraph, GraphNo:idx * 2, avg, infura, etherscan });
      });
    }

    // グラフ更新コールバック
    const getdata_callback = () => {
      const BuildID = 'gasPrice';
      let up_time = parseInt( Date.now() / interval );
      let {dataGraph, GraphNo, avg, etherscan, infura} = this.state;
      let newDataGraph = [];
      // 6,000,000,000
      let write = true;

      GraphNo = avg = 0;
      //console.log('GasPrice', data, GraphNo, dataGraph[0], dataGraph[6]);
      for(let i = 0; i < dataGraph.length; i++){
        newDataGraph[i] = dataGraph[i];
        if(write && (newDataGraph[i]["infura"] === 0 || i === (dataGraph.length - 1))){
          newDataGraph[i]["infura"] = infura;
          newDataGraph[i]["Etherscan"] = etherscan;
          write = false;
        } else if(i === (dataGraph.length - 1) || dataGraph[i+1]["infura"] === 0){
          newDataGraph[i]["infura"] = dataGraph[i]["infura"];
          newDataGraph[i]["Etherscan"] = dataGraph[i]["Etherscan"];
        } else {
          newDataGraph[i]["infura"] = dataGraph[i + 1]["infura"];
          newDataGraph[i]["Etherscan"] = dataGraph[i + 1]["Etherscan"];
        }

        if(newDataGraph[i]["infura"] !== 0){
          GraphNo++;
          avg += newDataGraph[i]["infura"];
          newDataGraph[i]["平均"] = parseInt( (avg/GraphNo), 10);
        }
        if(newDataGraph[i]["Etherscan"] !== 0){
          GraphNo++;
          avg += newDataGraph[i]["Etherscan"];
          newDataGraph[i]["平均"] = parseInt( (avg/GraphNo), 10);
        }
      }
      this.setState({ dataGraph:newDataGraph, GraphNo, avg });

      queryDynamoDB(table_name, scanParam, ( db_arr ) => {
        if(db_arr.length > gasPriceNum){
          let max = db_arr.length - gasPriceNum + 1;
          for( let i = 0; i < max; i++ ){
            let {now_time} = db_arr[i];
            delDynamoDB(table_name, {BuildID, now_time});
          }
        }
      });
      if(etherscan && infura)
        putDynamoDB(table_name, {BuildID, now_time:up_time, e:etherscan, i:infura});
    };

    // Etherscan を使っての gasPrice 取得
    const http_callback = (res) =>{
      let val = 0;
      if(res && res.data && res.data.result ){
        val = parseInt( res.data.result / rato, 10);
        this.setState({ etherscan: val });
      }
    };
    // Infura を使っての gasPrice 取得
    const infura_callback = (data) => {
      let val = 0;
      if(data ){
        val = parseInt( data / rato, 10);
        this.setState({ infura: val });
      }
    }

    let io = setInterval(async () => {
      if(cb() !== true) clearInterval(io);

      let web3;// = new Web3('https://mainnet.infura.io/v3/' + config.infura_pjkey);
      if (!this.state.web3) {
        console.log('not web3');
        return;
      } else if(!web3){
        web3 = this.state.web3;
      }

      try {
        axiosBase.get(baseURL).then( http_callback ).catch( console.log );
        web3.eth.getGasPrice().then( infura_callback );
        getdata_callback();
      } catch(err){
        console.error('GasPrice catch', err);
        clearInterval(io);
      }

    }, interval);
  };
  
  async callDeploy(e){
    this.setState({ msg: "callDeploy" });
    const call = true;
    const web3 = this.state.web3;
    let obj, arg;
    // Ethereum ネットワークに root コントラクトをデプロイ
    obj = require("../contracts/MyToken.json");
    arg = ["GET","MyToken3", "100000000"];
    await this.DeployContract(web3, obj, arg, call);

    // Matic ネットワークに Child コントラクトをデプロイ
    obj = require("../contracts/UChildERC20.json");
    arg = [];
    await this.DeployContract(web3, obj, arg, call);

    // Matic ネットワークに Proxy コントラクトをデプロイ
    obj = require("../contracts/UChildERC20Proxy.json");
    arg = ["0x80511563D5A1B4313e463D93dC4b5F0Edd42Ab4B"];
    await this.DeployContract(web3, obj, arg, call);
    this.setState({ msg: "" });
  }

  async checkProxy(e){
    const web3 = this.state.web3;
    const proxy = new web3.eth.Contract(proxyAbi, config.matic_token);
    const from = config.account;
    let result;
    result = await proxy.methods.proxyOwner().call({from}, console.log);
    // let mutabli = await proxy.methods.stateMutability(from);
    console.log("proxy", proxy.methods);
    console.log("proxy abi", proxyAbi);
    console.log("proxy own:", result);
    console.log("proxy implementation:", await proxy.methods.implementation());
    console.log("proxyType:", await proxy.methods.proxyType());

    // const to_addr = config.matic_local;
    // result = await proxy.methods.updateImplementation(to_addr).call({from}, console.log);
    // console.log("updateImplementation:", result);
  }

  componentWillUnmount(event, v2, v3) {
    console.log("componentWillUnmount", event, v2, v3);
    this.setState({ loop: false });
  }
  async sendLoop( event ){
    let now_time = Date.now();
    this.setState({ msg: "callLambdaDeploy()\n" + moment().format("YYYY-MM-DD HH:mm:ssZ") });
    let in_param = [{tx_param:[], act:2}];
    await this.callLambdaDeploy_sub( in_param );
    this.setState({ msg: "callLambdaDeploy()" + Date.now() - now_time });
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
        console.error("callLambdaDeploy_su() loop", Date.now() - loop_time, i, result );
        return;
      }

      let {out_param, out_hash, receipt} = result.target;
      console.log("callLambdaDeploy_su()", Date.now() - loop_time, result, receipt);
      if(!in_param.length) break;
      hash = out_hash;
      in_param = out_param;

    } while(hash || in_param.length);
    console.log("callLambdaDeploy_sub()", Date.now() - now_time);
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
          //account = this.state.account,
          //func_name = "balanceOf",
          from = config.user1_addr,
          to = config.tokAddr;
          //cli = config.user2_addr;
    //let func_abi;

    console.log("callLambdaDeploy_batch abi", abi);

    let contract = new web3.eth.Contract(abi, to);
    
    let batch = new web3.BatchRequest();
    batch.add(web3.eth.getBalance.request(from, 'latest', callback1));
    batch.add(web3.eth.getBalance.request(to, 'latest', callback2));
    batch.add(contract.methods.transfer(to, "3").call.request({ from }, callback3));
    //let result = batch.execute();

    console.log("callLambdaDeploy_batch end");
  }

  checkDynamoDB = (event) =>{
    //let data = '0x00' + Date.now();
    let Key = {BuildID: 'b0001', now_time:0};
    //getDynamoDB(table_name, {BuildID: {S: 'b0001'}, now_time: {N: li'0'}}, console.log);
    //updateDynamoDB(table_name, Key, {txaddr:{Value:{S: data}, Action:"PUT"}},console.log);
    const callback = (data) => {};
    getDynamoDB(table_name, Key, callback);
  }

  toLogWatch = (event) =>{
    console.log("toLogWatch", event);
    history.push('/aws_cwl');
    this.setState({ first: false, loop: false });
  }

  SendDeposit = async (amount) => {
    const rootToken = config.goerli_contract;
    const from = config.account;

    // https://github.com/maticnetwork/matic.js/
    // https://github.com/maticnetwork/matic.js/blob/master/src/root/POSRootChainManager.ts
    // https://github.com/maticnetwork/static/tree/master/network/testnet/mumbai

    // --- 参考 matic.js( matic.js-master/examples/POS-client/utils.js )
    const provider = window.ethereum;
    const maticPoSClient = new MaticPOSClient({
      network: 'testnet', // optional, default is testnet
      version: 'mumbai', // optional, default is mumbai
      parentProvider: provider,
      maticProvider: provider,
    });
    console.log("maticPoSClient:", maticPoSClient);
    // child.DERC20

    let result;
    try {
      result = await maticPoSClient.approveERC20ForDeposit(rootToken, amount, {from});
      console.log("approveERC20ForDeposit:", result);
      result = await maticPoSClient.depositERC20ForUser(rootToken, from, amount, {from});
      console.log("depositERC20ForUser:", result);
    } catch(err){
      console.error("SendDeposit:", err);
    }
  }

  handleChange = (event) => {
    console.log('handleChange', event.target, event);
    let val = event.target.value;
    switch(val){
    case 'A':
    case 'B':
      // ラジオボタンのサンプル
      //   http://koyamatch.com/react/basic2/basic_9.html
      this.setState({radio: val});
      break;

    case 'update_on':
      this.setState({update: 'on'});
      this.updateData(() => true);
      break;
    case 'update_off':
      this.setState({update: 'off'});
      break;
    }

  }

  render() {
    if (!this.state.web3 || this.state.GraphNo === 0) {
      // web3 のインスタンスが入るまではここに入る
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    if(this.state.first)  this.checkDynamoDB(this);
    let {dataGraph, GraphNo, avg, etherscan, infura, msg} = this.state;
    //if(this.state.first)  this.callLambdaDeploy(this);
    return (
      <div>
        <label className="attention">{msg}</label><h1>Good to Go!</h1>
        <table>
          <thead className="data">
            <tr>
              <th>WEB Design Tools</th><th>開発元</th><th>カテゴリ</th><th>評価</th>
            </tr>
          </thead>
          <tbody className="data">
            <tr className="even">
              <th>DreamWeaver</th><td>adobe</td><td>エディタ</td><td>★★★☆☆</td>
            </tr>
            <tr className="odd">
              <th>Fireworks</th><td>adobe</td><td>WEBグラフィック作成</td><td>★★★☆☆</td>
            </tr>
          </tbody>
        </table>
        <p>
          Your Truffle Box is installed and ready.
          Web3:v{this.state.web3.version}
        </p>
        <h2>Smart Contract Example</h2>
        <p>
          <input type="radio" value="A" checked={this.state.radio==="A"} onChange={this.handleChange}/>
          A 、
          <input type="radio" value="B" checked={this.state.radio==="B"} onChange={this.handleChange}/>
          B
        </p>
        <p>
          <button onClick={(e) => this.callDeploy(e)}>デプロイ</button>
          <button onClick={(e) => this.callLambdaDeploy.bind(e)}>デプロイ(Lambda)</button><br/>
        </p>
        <p>
          <button onClick={(e) => this.sendLoop(e)}>送信の繰り返し</button>
          <button onClick={(e) => this.callLambdaDeploy_batch(e)}>batch request の確認</button><br/>
        </p>
        <p>
          <button onClick={(e) => this.SendDeposit('1000')}>デポジット の確認</button><br/>
        </p>
        <button onClick={(e) => this.toLogWatch(e)}>ログ監視</button>
        <button onClick={(e) => this.checkDynamoDB(e)}>DB確認</button><br/>
        <div>
          {/* Reactでオシャレなグラフ・図を簡単に描く(Rechart.js)
            *   https://qiita.com/gcyagyu/items/5eb7c5e3e05e6a2241ed
            */}
          gasPrice( Etherscan：{etherscan} Infura：{infura} 平均：{parseInt(avg/GraphNo, 10)})
          <input type="radio" value='update_on' checked={this.state.update==='on'} onChange={this.handleChange}/>
          (取得 
          <input type="radio" value='update_off' checked={this.state.update==='off'} onChange={this.handleChange}/>
          停止)
          <ComposedChart
      // グラフ全体のサイズや位置、データを指定。場合によってmarginで上下左右の位置を指定する必要あり。
            width={600}  //グラフ全体の幅を指定
            height={280}  //グラフ全体の高さを指定
            data={dataGraph} //ここにArray型のデータを指定
            margin={{ top: 20, right: 60, bottom: 0, left: 0 }}  //marginを指定
          >
            <XAxis
              dataKey="month"  //Array型のデータの、X軸に表示したい値のキーを指定
            />
            <YAxis />
            <Tooltip /> //hoverした時に各パラメーターの詳細を見れるように設定
            <Legend />  // 凡例を表示(図の【売上】【infura】)
            <CartesianGrid
      // グラフのグリッドを指定
              stroke="#f5f5f5" //グリッド線の色を指定
            />
            <Line dataKey="Etherscan" stroke="#ff7300" dot={false} />
            <Line dataKey="infura" stroke="#2250A2" dot={false} />
            <Area
      // 面積を表すグラフ
              type="monotone"  //グラフが曲線を描くように指定。default値は折れ線グラフ
              dataKey="平均" //Array型のデータの、Y軸に表示したい値のキーを指定
              stroke="#00aced" ////グラフの線の色を指定
              fillOpacity={1}  ////グラフの中身の薄さを指定
              fill="rgba(0, 172, 237, 0.2)"  //グラフの色を指定
            />
          </ComposedChart>

        </div>
      </div>
    );
  }
}
