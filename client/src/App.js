import React, { Component, useEffect, useReducer }  from "react";
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import history from './history';
import Main from './components/main';
import Welcome from './components/welcome';
import Hello from './components/hello';
import Form from './components/form';

import DropDownMenu from './components/react_drop_down_menu'

import Web3Ethereum from './components/web3_ethereum';


const fs = require("fs");
//const solc = require('solc');

// 定数
const BUFF_SIZE = 100;    // バッファーのサイズ
const BUFF_POS  = 0;      // バッファーの保存開始位置
const READ_SIZE = 3;      // 読み取るサイズ
const READ_POS  = 0;      // 読み取り開始位置


var token;
var kmsEncyptedToken = "CiC**********************************************************************************************I=";

function handleClick(e) {
  e.preventDefault();
  let altKey                  = e.altKey               ,
      bubbles                 = e.bubbles              ,
      button                  = e.button               ,
      buttons                 = e.buttons              ,
      cancelable              = e.cancelable           ,
      clientX                 = e.clientX              ,
      clientY                 = e.clientY              ,
      ctrlKey                 = e.ctrlKey              ,
      currentTarget           = e.currentTarget        ,
      defaultPrevented        = e.defaultPrevented     ,
      detail                  = e.detail               ,
      dispatchConfig          = e.dispatchConfig       ,
      eventPhase              = e.eventPhase           ,
      getModifierState        = e.getModifierState     ,
      isDefaultPrevented      = e.isDefaultPrevented()   ,
      isPropagationStopped    = e.isPropagationStopped() ,
      isTrusted               = e.isTrusted            ,
      metaKey                 = e.metaKey              ,
      movementX               = e.movementX            ,
      movementY               = e.movementY            ,
      nativeEvent             = e.nativeEvent          ,
      pageX                   = e.pageX                ,
      pageY                   = e.pageY                ,
      relatedTarget           = e.relatedTarget        ,
      screenX                 = e.screenX              ,
      screenY                 = e.screenY              ,
      shiftKey                = e.shiftKey             ,
      target                  = e.target               ,
      timeStamp               = e.timeStamp            ,
      type                    = e.type                 ,
      view                    = e.view                 ;
  let log ={
    e,
    altKey,bubbles,button,buttons,cancelable,clientX,clientY,ctrlKey,currentTarget,defaultPrevented,detail,dispatchConfig,eventPhase,getModifierState,isDefaultPrevented,isPropagationStopped,isTrusted,metaKey,movementX,movementY,nativeEvent,pageX,pageY,relatedTarget,screenX,screenY,shiftKey,target,timeStamp,type,view
  };
  console.log(log);
  console.log('The link was clicked.');
}

async function deployContract(web3, eth) {
  console.log("deployContract", web3);

  // 入れ物準備
  const buff = Buffer.alloc(BUFF_SIZE);
  let str = "";
  
  // ファイルを同期的に開いて内容を取得
  try{
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = obj.networks[networkId];

    const obj = require("./contracts/TxRelay.json");
    console.log(obj);

    let bytecode = obj.bytecode;
    let abi = obj.abi;

    // デプロイに必要なGasを問い合わせる
    let gasEstimate = web3.eth.estimateGas({data: bytecode});
  }
  catch(e){
    console.log(e.message);
  }  
}

const APP_KEY = "ReactApp001";
const appState = localStorage.getItem( APP_KEY );
const initialState = appState ? JSON.parse(appState) : {
  events: [],
  operationLogs: []
};


class App extends Component {
  state = { storageValue: 0,
            web3: null,
            accounts: null,
            contract: null
          };

   constructor() {
     super();
     this.state = {
       data:{
         val1:"",
         val2:"",
       },
       some_code: "",
       alert_message: ""
     };
   }

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  /**
   * ブラウザ内にデータを保持する
   */
  //useEffect( () => localStorage.setItem(APP_KEY, JSON.stringify(state)), [state])

  render() {
    if (!this.state.web3) {
      // web3 のインスタンスが入るまではここに入る
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    let data = this.state.data;
    return (
      <div className="App">
        <div>
          <p>hello menu</p>
          <DropDownMenu />
        </div>
        
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

        {/* 文字出力のサンプル */}
        <div>
          The stored value is: {this.state.storageValue}
          {this.state.message}<br />
          {data.val1}<br />
          {data.val2}<br />
        </div>
        
        <button onClick={handleClick}>クリック時の動作ログ出力</button><br/>
        <button onClick={deployContract.bind(this.state.web3)}>デプロイ</button><br/>
      </div>
    );
  };
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
