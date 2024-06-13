import { MultipleRequest } from './MultipleRequest.mjs';
import {
  ListTablesCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient();

/**
 * Lambda 関数一覧の取得
 */
async function Search(opt, ExclusiveStartTableName){
  const response = await client.send(new ListTablesCommand({ ExclusiveStartTableName }));
  console.log("ListTablesCommand", response);
  return {
    arr: ["delTest2"] || response?.TableNames || [],
    next: response?.LastEvaluatedTableName
  };
}

/**
 * Lambda 関数のレイヤーが更新対象か判定
 */
function Decision(opt, tablename){
  const {reg} = opt;
  const ret = tablename.indexOf( reg );
  if( ret < 0 ) return 0;
  //return ret;
  return 1;
};

/**
 * Lambda 関数のレイヤーを更新する
 */
function Execution(opt, TableName, cb){
  return client.send( new DescribeTableCommand({
    TableName,
  }), (err, data)=> {
    console.log("DescribeTable", data);
    console.log("update", TableName, "err:", !!err, err);
    cb();
  });
}

async function deleteDynamodb(opt) {
  await MultipleRequest( opt, {
    Search,
    Decision,
    Execution,
  });
}

export {
  deleteDynamodb,
};
