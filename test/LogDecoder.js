const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require("fs");

const EthereumjsTx = require('ethereumjs-tx').Transaction;
const Transaction = require('../screens/metatx/transaction.js');

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
const config = require('../config.json');

const delay = time => new Promise(res => setTimeout(() => res(), time))

class L{
  static decodeLog(result ){
    var topic;
    
    function matchesFunctionName(json) {
      return (json.signature === topic);
    }

    function getTypes(json) {
      return json.type;
    }

    // console.log("result", result);
    // return;
    result.logs.forEach((value, index, ar) => {
      var log = value;
      const topics = log.topics;
      topic = log.topics[0];

      //const funcJson = myTokenAbi.filter(matchesFunctionName)[0];
      //const args = (funcJson.inputs).map(getTypes);
      const args = myTokenAbi.filter(matchesFunctionName)[0];
      console.log(args);
      //console.log(log.topics.slice(1));
      //console.log(web3.eth.abi.decodeParameters(args, log.data));
      console.log(web3.eth.abi.decodeLog(args, log.data, log.topics));
      return;
      //eventabi = VendingContract.abi.filter(element => element.signature == txReceipt.logs[0].topics);

      const eventabi = myTokenAbi.filter(element => element.signature == topic);
      return;
    });
  }
}

module.exports = L;
