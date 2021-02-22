const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

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

exports.handler = async (event, context, callback) => {
  let params ={ TableName:'TestDB' };
  docClient.scan(params, function(err, data) {
  });
  docClient.scan(params, function(err, data) {
  });
  docClient.scan(params, function(err, data) {
  });

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
