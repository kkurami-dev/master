/** -*- coding: utf-8-unix -*-
 * 
 */
import { getLambdaDB } from "./lib_aws";

const config = require('../configs/config');
const table_name = config.db_name;
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

export function getBalanceOf( web3, name, cb ) {
  let param = params[name];
  let address;
  let func_abi;
  let func_name = "balanceOf";

  for( let i = 0; i < param.abi.length; i++ )
    if(param.abi[i].name === func_name)
      func_abi = param.abi[i];
  console.log("func_abi", func_abi);

  // ブロックチェーンへの問い合わせ結果処理
  let getBalance = (addr, vale) => {
    console.log("Balance", addr, Number(vale));
  };

  // DynamoDB からアドレスと取得後にブロックチェーンへの問い合わせ処理
  let getDbData = (item) => {
    let to = item[param.addr_key];

    params.user.forEach( function( account ){
      let data = web3.eth.abi.encodeFunctionCall(func_abi, [account]);
      web3.eth.call({to, data}).then( (val) => getBalance(account, val) );
    });
  };
  
  getLambdaDB(table_name, tableKey, getDbData);
}
