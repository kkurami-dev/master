/** -*- coding: utf-8-unix -*-
 * 
 */
import { getLambdaDB } from "./lib_aws";

const config = require('../configs/config');
const TableName = config.db_name;
const tableKey = {BuildID: {S: 'b0001'}, now_time: {N: '0'}};
const params = {
  user:  [config.kms_addr, config.user1_addr, config.user2_addr],
  token: { abi: require("../contracts/MyToken").abi,
           addr_key: "tokAddr"
  },
  txl  : { abi: require("../contracts/TxRelay.json").abi,
           addr_key: "txrAddr"
  }
};

async function checkTransaction(web3, hash){
  console.log("checkTransaction()");
  let receipt;
  await web3.eth.getTransactionReceipt(hash).then((result) => receipt = result);
  return receipt;
}

async function getDynamoDB(table_name, table_key){
  let ret_val;
  let call = new Promise((resolve, reject) => {
    try {
      getLambdaDB(TableName, tableKey, (item) =>{
        resolve(item);
      });
    } catch (err){
      resolve( err );
    }
  });
  await call.then( item => ret_val = item );
  return ret_val;
}

export function getBalanceOf( web3, name, cb ) {
  let param = params[name];
  let address;
  let func_abi;
  let func_name = "balanceOf";

  for( let i = 0; i < param.abi.length; i++ )
    if(param.abi[i].name === func_name)
      func_abi = param.abi[i];
  console.log("func_abi", func_abi, param.abi);

  // ブロックチェーンへの問い合わせ結果処理
  let getBalance = (addr, vale) => {
    console.log("BalanceOf,", addr, Number(vale));
  };

  // DynamoDB からアドレスと取得後にブロックチェーンへの問い合わせ処理
  let getDbData = (item) => {
    let to = item[param.addr_key];

    params.user.forEach( function( account ){
      let data = web3.eth.abi.encodeFunctionCall(func_abi, [account]);
      web3.eth.call({to, data}).then( (val) => getBalance(account + ", EGT,", val) );
      web3.eth.getBalance(account).then( (val) => getBalance(account + ", ETH,", val) );
    });
  };

  // 設定した処理を実行する
  getLambdaDB(TableName, tableKey, getDbData);
}

export async function SendContract(web3, account, abi, func_name, param, now_time){
  // 関数に対応したABIの選択
  let func_abi, ret_hash, to;
  for( let i = 0; i < abi.length; i++ )
    if(abi[i].name === func_name)
      func_abi = param.abi[i];
  if(!func_abi){
    console.error("not ABI ", func_name, param);
  }

  let keyIds = await getDynamoDB(TableName, tableKey);
  if (func_name.indeOF("Relay") === -1)
    to = keyIds.tokAddr;
  else
    to = keyIds.txrAddr;

  console.log("Promise: ", Date.now() - now_time, param);
  const call = new Promise((resolve, reject) => {
    try {
      console.log("new Copntract: ", Date.now() - now_time, param);
      let data = web3.eth.abi.encodeFunctionCall(func_abi, param);
      web3.eth.sendTransaction({ to, data }, function(err, data) {
        if (err){
          console.error("DynamoDB sendTransaction", JSON.stringify(param), err, err.stack);
          reject( err );
        } else {
          resolve( data );
        }
      });
    } catch(error){
      console.error("DynamoDB updateItem try/catch", JSON.stringify(param), error );
      reject( error );
    }
  });

  await call.then((value) => ret_hash = value );
  return ret_hash;
}
