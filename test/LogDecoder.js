// -*- mode: emacs-lisp; coding: utf-8-unix -*- Time-stamp: "2020-08-02 15:26:25 kuramitu"

// (初心者向け) Node.js コンソール (console) の使い方
//   <https://qiita.com/tadnakam/items/dda690bb184fdc74851f>
//

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require("fs");

//const EthereumjsTx = require('ethereumjs-tx').Transaction;
//const Transaction = require('../screens/metatx/transaction.js');

var pattern = /^[A-Z0-9]+$/;
var logger = {
  log: function(message) {
    if (pattern.test(message)){
    } else {
      //console.log(message);
    }
  }
};
const provider = ganache.provider({
  "debug": true,
  "allowUnlimitedContractSize": true,
  "logger": logger
//  "gasLimit": 80000000,
//  "gas": 90000000
});
const web3 = new Web3(provider);
//const config = require('../config.json');

//const delay = time => new Promise(res => setTimeout(() => res(), time))

// 色を付ける
const black   = '\u001b[30m';
const red     = '\u001b[31m';
const green   = '\u001b[32m';
const yellow  = '\u001b[33m';
const blue    = '\u001b[34m';
const magenta = '\u001b[35m';
const cyan    = '\u001b[36m';
const white   = '\u001b[37m';

const reset   = '\u001b[0m';

class L{
  static decodeLog(abi, result ){
    var topic;
    
    function matchesFunctionName(json) {
      return (json.signature === topic);
    }

    function getTypes(json) {
      return json.type;
    }

    if( typeof result == "undefined"){
      console.log(red + "result undefined" + reset);
      return;
    }
    //console.dir(result, {depth:3}); /* オブジェクト内容表示 */
    //return;

    if( result.status ){
      console.group("成功");
    } else {
      console.group(red + "失敗" + reset);
    }

    console.log("blockNumber:%d, transactionIndex:%d, gasUsed:%d", result.blockNumber, result.transactionIndex, result.gasUsed);
    console.log("transactionHash:", result.transactionHash);
    console.log("      blockHash:", result.blockHash);
    if( result.logs == 0){
      console.groupEnd();
      return;
    }

    //console.dir(result, {depth:3}); /* オブジェクト内容表示 */
    result.logs.forEach((value, index, ar) => {
      var log = value;
      const topics = log.topics;
      topic = log.topics[0];

      const funcJson = abi.filter(matchesFunctionName)[0];
      const args = (funcJson.inputs).map(getTypes);
      //const args = abi.filter(matchesFunctionName)[0];
      if ( topics.length == 1 ){
        const logret = web3.eth.abi.decodeParameters(args, log.data);
        console.log(funcJson.name, logret[0], logret[1]);
      } else {
        console.group("--- %s ---", funcJson.name);
        console.log("args", args);
        console.log("topics", topics);
        console.log("data", log.data);
        console.groupEnd();
      }
      //console.log(web3.eth.abi.decodeLog(args, log.data, log.topics));
      //return;
      //eventabi = VendingContract.abi.filter(element => element.signature == txReceipt.logs[0].topics);

      //const eventabi = abi.filter(element => element.signature == topic);
      //return;
    });
    console.groupEnd();
  }
}

module.exports = L;
