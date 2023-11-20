/* eslint-disable no-undef */
/* eslint-disable no-global-assign */
window = {};
importScripts('https://sdk.amazonaws.com/js/aws-sdk-2.1.27.min.js');
/* eslint-enable no-undef */
/* eslint-enable no-global-assign */

let intervalObj = null;
let loop_stop = false;
let docClient = null
let lambda = null;

function Sleep(wait, cb){
  return new Promise((resolve)=>{
    const timerObj = setTimeout(() => {
      clearTimeout(timerObj);
      if(cb) cb();
      resolve();
    }, wait, 'funky');
  });
}
function MapMarshall(obj){
  for(const el in obj){
    const d = obj[el];
    const tstr = typeof(d);
    const nstr = String(d);
    const conv = {
      "string":{"S": d},
      "number":{"N": nstr},
      "boolean":{"BOOL": nstr},
    };
    if( conv[ tstr ] ) obj[ el ] = conv[ tstr ];
    else{
      if( d === null ) obj[ el ] = {'NULL':true};
      else throw new Error(`not suport param:${tstr} ${el} ${d}`);
    }
  }
}
function MapUnMarshall(obj){
  if( !obj ) return;
  for(const el in obj){
    const d = obj[el];
    if( d.S ){
      obj[el] = d.S;
    } else if( d.N ){
      obj[el] = Number( d.N );
    } else {
      obj[el] = d;
    }
  }
}
function AWS_update(data){
  console.log("AWS_update", data);
  const {"ac":ac, "sc":sc} = data;

  window.AWS.config.update({
    credentials: new window.AWS.Credentials(ac, sc),
    'region': "ap-northeast-1",
    'maxRetries': 15,
    'httpOptions':{
      'timeout': 600,
      'connectTimeout': 300,
    },
  });
  lambda = new window.AWS.Lambda({
    'region': 'ap-northeast-1',
  });
  docClient = new window.AWS.DynamoDB({
    'region': 'ap-northeast-1',
  });
  self.postMessage({s:1});
}
function getDynamo(params_org){
  const params = structuredClone(params_org);
  MapMarshall( params.Key );
  return new Promise((resolve, reject)=>{
    docClient.getItem(params, function(err,data){
      if (err) {
        console.log(err, err.stack);
        reject( err );
      } else {
        MapUnMarshall(data.Item);
        resolve( data.Item );
      }
    });
  });
}
function putDynamo(params_org){
  const params = structuredClone(params_org);
  MapMarshall( params.Item );
  return new Promise((resolve, reject)=>{
    docClient.putItem(params, (err, ret)=>{
      if(err) reject( err );
      else resolve(ret);
    })
  });
}
function updateDynamo(params_org){
  const params = structuredClone(params_org);
  MapMarshall( params.Key );
  MapMarshall( params.ExpressionAttributeValues );
  return new Promise((resolve, reject)=>{
    docClient.updateItem(params, (err, ret)=>{
      if(err) reject( err );
      else resolve(ret);
    })
  });
}
function callLambda(func, body){
  const params = {
    'InvocationType': "RequestResponse",
    'FunctionName':func,
    'Payload': JSON.stringify(body),
  };
  return new Promise((resolve, reject)=>{
    lambda.invoke(params, (err, res)=>{
      //console.log("callLambda res", res?.Payload, "err", err);
      let out = {};
      if( err ){
        reject( err );
        return;
      }
      if( res.Payload ){
        out = JSON.parse( res.Payload );
      }
      resolve( out );
    });
  });
}

async function subFunc({num}) {
  console.log(`-> arg was => ${num}`);
  //await Sleep( 1000 );

  let res = {};
  const TableName = 'TestDB';
  const params2 = {
    TableName,
    Key: {'BuildID':'B0002', 'now_time':0},
    ExpressionAttributeValues:{":c":1},
    UpdateExpression: "ADD TestCount :c",
    ReturnValues: 'UPDATED_NEW',
  };
  res = await updateDynamo(params2);
  MapUnMarshall(res.Attributes);
  const map_no = res.Attributes.TestCount;
  console.log("updateDynamo", res, map_no);

  const params1 = {
    TableName,
    Item: {
      BuildID:'gasPrice',
      now_time: map_no,
      e: Date.now(),
      i: num,
    },
  };
  res = await putDynamo(params1);
  console.log("putDynamo", res);

  // res = await callLambda('test0004', {'key': res.TestCount });
  // console.log("callLambda res", res);
  self.postMessage({"ret":num, s:3})
}

function WebWoek(event){
  //console.log("WebWoek", event.data, moment());
  const {max, state=0, mail} = event.data;
  let count = 0;
  switch(state){
  case 1:{
    AWS_update(event.data);
    loop_stop = false;
    break;
  }
  case 2:{
    // https://nodejs.org/ja/docs/guides/timers-in-node
    intervalObj = setInterval(async() => {
      await subFunc({"num":count, mail});
      count++;
      if(max < count || loop_stop){
        self.postMessage({s:9});
        clearInterval(intervalObj);
        loop_stop = false;
      }
      //loop_stop = true;
    }, 900);
    break;
  }
  case 3:{
    loop_stop = true;
    break;
  }
  case 4:{
    AWS_update(event.data);
    subFunc('test');
    break;
  }
  case 9:{
    loop_stop = true;
    break;
  }
  default:{
    break;
  }}
}

self.onmessage = WebWoek;
