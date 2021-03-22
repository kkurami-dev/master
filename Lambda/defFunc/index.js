var AWS = require('aws-sdk'),
    docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: "ap-northeast-1"
});

function gacha (config, rval) {
  let accum = 0;
  for (const entry of config) {
    for (const charID of entry.ids) {
      accum += entry.prob / entry.ids.length;
      if (rval < accum) return { id: charID , rval:rval};
    }
  }
  throw new Error('should not reach here');
}

async function getConfig() {
  return [
    {
      rarity: 5, // ★★★★★
      prob: 0.01,
      ids: [5001, 5002, 5003],
    },
    {
      rarity: 4, // ★★★★
      prob: 0.3,
      ids: [4001, 4002, 4003],
    },
    {
      rarity: 3, // ★★★
      prob: 0.69,
      ids: [3000, 3001, 3002],
    },
  ];
}

async function main() {
  const max = 300;
  let items = [];
  const config = await getConfig();
  for(let i = 0; i < max; i++) items.push( i );
    
  let val = Math.random();
  for(let i = 0; i < max; i++) items.push( i );
  
  let ret = gacha(config, val);
  for(let i = 0; i < max; i++) items.push( i );
  
  console.log( ret );
  return ret;
  // console.log(gacha(config, 0.001)); // 大当たり, キャラID 5001
  // console.log(gacha(config, 0.004)); // 大当たり, キャラID 5002
  // console.log(gacha(config, 0.04)); // あたり, キャラID 4001
  // console.log(gacha(config, 0.7)); // はずれ
}

async function putDynamoDB( Item ){
  let TableName = 'delTest2';
  let param = {
    TableName, Item,
    ReturnConsumedCapacity: 'TOTAL',
    ReturnItemCollectionMetrics : 'SIZE',
    ReturnValues: 'ALL_OLD'
  };
  console.log("putDynamoDB", param);

  const call = new Promise((resolve, reject) => {
    let ret_cunt = 0;
    docClient.put(param, (err, data) => {
      if(err) {
        console.error("putDynamoDB err:", err);
        reject( err );
      } else if(data.Attributes){
        ret_cunt++;
        resolve( true );
      } else if(data.ConsumedCapacity){
        ret_cunt++;
        resolve( true );
      }
      console.log("putDynamoDB:", data);
      if( ret_cunt === 2 ){
        console.log('putDynamoDB ok');
        resolve( true );
      }
    });
  });

  let ret_val;
  await call.then((value) => ret_val = value );
  console.log('putDynamoDB end');
  return param;
}
async function delDynamoDB( Key ){
  let TableName = 'delTest2';
  let param = {
    TableName, Key,
    ReturnConsumedCapacity:'TOTAL',
    ReturnItemCollectionMetrics : 'SIZE',
    ReturnValues:'ALL_OLD'
  };
  console.log("delDynamoDB", param);

  //return param;
  const call = new Promise((resolve, reject) => {
    let ret_cunt = 0;
    docClient.delete(param, (err, data) => {
      if(err) {
        console.error("delDynamoDB err:", err);
        reject( err );
      } else if(data.Attributes){
        ret_cunt++;
        resolve( true );
      } else if(data.ConsumedCapacity){
        ret_cunt++;
        resolve( true );
      }
      console.log("delDynamoDB:", data);
      if( ret_cunt === 2 ){
        console.log('delDynamoDB ok');
        resolve( true );
      }
    });
  });

  let ret_val;
  try {
    await call.then((value) => ret_val = value );
  } catch( err ){
    console.log('del NG', err);
  }
  console.log('del end');
  return ret_val;
}

exports.handler = async (event, context, callback) => {
  console.log("event", event);
  if(0) return {msg:"ok"};
  context.callbackWaitsForEmptyEventLoop = true;

  try {
    let params = { TableName:'TestDB' };
    // let ret = await docClient.scan(params, function(err, data) {
    //   if (err) console.err("scan", err, err.stack); // an error occurred
    //   else     console.log("scan ok");           // successful response
    // }).promise();
    let ret = await docClient.scan(params).promise();
    console.log("scan ok");
  } catch(err){
  }

  let result;
  try {
    switch(event.func ){
    case 'put':{
      let Skey_test_da = Date.now() + ":" + context.awsRequestId;
      let test_params = {
        Pkey_test_da : "gacha-b0001-11",
        Skey_test_da,
        RequestId : context.awsRequestId,
        logGroupName : context.logGroupName,
        logStreamName : context.logStreamName
      };
      result = await putDynamoDB( test_params );
      break;
    }
    case 'del':{
      const {Pkey_test_da, Skey_test_da} = event;
      result = await delDynamoDB( { Pkey_test_da, Skey_test_da } );
      break;
    }}
  } catch(err){
    console.error("main err:", err);
    result = err;
  }
  callback( null, result );
  if(1) return {msg: 'ok'};

  const max = 300;
  let items = [];
  const config = await getConfig();
  for(let i = 0; i < max; i++) items.push( i );

  let res = await main();
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
    res,
  };
  callback( null, response );
  //return response;
};
