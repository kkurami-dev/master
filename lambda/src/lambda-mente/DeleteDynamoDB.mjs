import { MultipleRequest } from './MultipleRequest.mjs';
import { ListTablesCommand, DescribeTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
const client = new DynamoDBClient();

/**
 * Lambda 関数一覧の取得
 */
async function Search(opt, ExclusiveStartTableName) {
  const response = await client.send(new ListTablesCommand({ ExclusiveStartTableName }));
  console.log('ListTablesCommand', response);
  return {
    arr: response?.TableNames || [],
    next: response?.LastEvaluatedTableName,
  };
}

/**
 * Lambda 関数のレイヤーが更新対象か判定
 */
function Decision(opt, tablename) {
  const { reg } = opt;
  if (!reg) return 1;

  const ret = tablename.indexOf(reg);
  if (ret < 0) return 0;
  //return ret;
  return 1;
}

/**
 * Lambda 関数のレイヤーを更新する
 */
async function Execution(opt, TableName, cb) {
  const com = new DescribeTableCommand({
      TableName,
  });
  const ret = await client.send(com);
  console.log('DescribeTable', ret);

  cb();
}

async function deleteDynamodb(opt) {
  await MultipleRequest(
    {
      Search,
      Decision,
      Execution,
    },
    opt
  );
}

export { deleteDynamodb };
