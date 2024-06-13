import {
  LambdaClient,
  ListFunctionsCommand,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';
import { MultipleRequest } from './MultipleRequest.mjs';

const client = new LambdaClient();

/**
 * Lambda 関数一覧の取得
 */
async function Search(opt, Marker){
  const response = await client.send(new ListFunctionsCommand({ Marker }));
  return {
    arr: response?.Functions || [],
    next: response?.NextMarker
  };
}

/**
 * Lambda 関数のレイヤーが更新対象か判定
 */
function Decision(opt, data){
  const {layer, ver} = opt;
  const {FunctionName,  Layers} = data;
  let updatei = 0;// 更新対象か判定結果

  data.Layers = Layers ? Layers.map((inlayer) => {
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

  return updatei;
};

/**
 * Lambda 関数のレイヤーを更新する
 */
async function Execution(opt, data, cb){
  const {FunctionName,  Layers} = data;
  return client.send(
    new UpdateFunctionConfigurationCommand({
      FunctionName,
      Layers,
    }),
    (err, data)=> {
      console.log("update", FunctionName, "err:", !!err, `${Layers} ${err}`)
      cb();
    }
  );
}

async function updateLayers(opt) {
  await MultipleRequest( opt, {
    Search,
    Decision,
    Execution,
  });
}

export {
  updateLayers,
};
