import {
  LambdaClient,
  ListFunctionsCommand,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';
import { setTimeout } from 'timers/promises';
const client = new LambdaClient();

async function updateLayers({layer, ver, reg}) {
  const functions = [];
  let AllItems = 0;
  const timeArr = [];

  // 各関数のレイヤーを更新
  const UpdateFunc = ({FunctionName,  Layers}) => {
    let updatei = 0;
    const existingLayers = Layers ? Layers.map((inlayer) => {
      const str = inlayer.Arn;
      const words = str.split(':');
      if( layer === words[6] ){
        //console.log("f:", FunctionName, words[6], "v:", words[7], ver);
        if(Number( words[7] ) !== Number(ver) ) {
          words[7] = ver;
          updatei = 1;
          return words.join(":");
        }
      }
      return str;
    }) : [];

    //console.log("f:", FunctionName, updatei, `${existingLayers}`);
    if(!updatei) {
      AllItems--;
      return;
    }

    // 単位時間当たりの実行数計算用
    const tobj = {t:new Date().getTime(), s:1};
    timeArr.push( tobj );

    // 更新
    functions.push( client.send(
      new UpdateFunctionConfigurationCommand({
        FunctionName,
        Layers: existingLayers,
      }),
      (err, data)=> {
        console.log("update", FunctionName, "err:", !!err, `${existingLayers} ${err}`)
        AllItems--;
        tobj.s = 2;
      }
    ));
  }

  // 一定間隔で Update を実行する関数
  // 無条件だとソケット数50 を超過してしまい、更新失敗してしまう
  const timeFunc = (param) => {
    const { thred, items, intervalID } = param;

    // 実行数制限
    if( timeArr.length > 45 ){
      const nowTime = new Date().getTime();
      const diff = nowTime - timeArr[0].t;

      // 単位時間の実行数制限
      if(diff < 1000 ){
        console.log("timeFunc Rate exceeded", thred, AllItems, diff );
        return;
      }

      // 同時実行数制限
      if( timeArr[0].s === 2 )
        timeArr.shift();
      return;
    }

    // 終了判定
    if( param.count >= items.length ){
      console.log("timeFunc:", thred, "end");
      clearInterval(intervalID);
      return;
    }

    UpdateFunc( items[ param.count ] );
    param.count += 1;
  };

  let nextMarker = undefined;
  let thred = 0;
  do {
    // 既存のレイヤーを取得
    const response = await client.send(new ListFunctionsCommand({ Marker: nextMarker }));
    const obj = {
      thred: ++thred,
      count: 0,
      wait: true,
      items: response?.Functions || [],
    };
    AllItems += obj.items.length;
    obj.intervalID = setInterval(timeFunc, 44, obj);

    nextMarker = response.NextMarker;
  } while(nextMarker);

  while(AllItems > 0){
    await setTimeout(100);
  }
  await Promise.all( functions );
}

export {
  updateLayers,
};
