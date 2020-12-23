

async function DeployContract(web3, account, obj, param ) {
  console.log("DeployContract", web3, account, obj );

  try{
    let bytecode = obj.bytecode;
    let abi = obj.abi;
    let hash1, hash2, hash3;
    console.log("abi", abi);

    // デプロイに必要なGasを問い合わせる
    let nowEth = await web3.eth.getBalance(account);
    web3.eth.getGasPrice().then(console.log);
    let gasEstimate = await web3.eth.estimateGas({data: bytecode});
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
    await call.then((value) => hash2 = value );

    return hash2;
  }
  catch(e){
    console.log(e.message);
    return null;
  }
}

exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
