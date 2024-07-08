import fs from 'fs';
import path from 'path';

// AWS SDK V3 JavaScript のリファレンス
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/
//   左のサービス一覧から対象サービスを選択、フィルタに操作を入れて検索
import { fromIni } from '@aws-sdk/credential-providers';
//import { ListTablesCommand, DescribeTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { LambdaClient, ListFunctionsCommand, DeleteFunctionCommand } from '@aws-sdk/client-lambda';
import {
  CloudFormationClient,
  ListStackCommand,
  DeleteStackCommand,
} from '@aws-sdk/client-cloudformation';

//
// 引数の1つ目は使用するプロファイル名を指定する事
//
// process.argv = ['node', '$0', 'default', 'delconf'];
const credentials = fromIni(process.argv[2]);

const afuncs = {};

function gitFunction(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((item) => {
    const dirp = path.join(dir, item);
    const fis = fs.statSync(dirp).isDirectory();
    if (!fis) return;

    afuncs[item] = `${item}/${item}.json`;
  });
}

async function listFunctions() {
  const bufferData = fs.readFileSync('DelLambdaA.json');
  const DelLambdaA = JSON.parse(bufferData.toString());

  const client = new LambdaClient({ credentials });
  const command = new ListFunctionsCommand({ credentials });

  const fMap = await client.send(command);
  // console.log("fMap", fMap);
  fMap.Functions.map((item) => {
    const { FunctionName } = item;
    if (DelLambdaA[FunctionName]) return;
    afuncs.push(FunctionName);
  });

  fs.writeFileSync('DelLambdaD.json', JSON.stringify(afuncs, ' ', 2));
}

async function deleteFunction() {
  const bufferData = fs.readFileSync('DelLambdaD.json');
  const DelLambdaD = JSON.parse(bufferData.toString());

  // funcName
  const Exec = [];
  const client = new LambdaClient({ credentials });
  DelLambdaD.forEach((funcName) => {
    const command = new DeleteFunctionCommand({ FunctionName: funcName });
    Exec.push(client.send(command));
  });

  await Promise.all(Exec);
}

async function listStack() {
  const bufferData = fs.readFileSync('DelLambdaA.json');
  const DelLambdaA = JSON.parse(bufferData.toString());

  const client = new CloudFormationClient({ credentials });
  const command = new ListStackCommand({ credentials });

  const fMap = await client.send(command);
  // console.log("fMap", fMap);
  fMap.Functions.map((item) => {
    const { StackName } = item;
    if (DelLambdaA[StackName]) return;
    afuncs.push(StackName);
  });

  fs.writeFileSync('DelLambdaD.json', JSON.stringify(afuncs, ' ', 2));
}

async function deleteStack() {
  const bufferData = fs.readFileSync('DelLambdaD.json');
  const DelLambdaD = JSON.parse(bufferData.toString());

  // funcName
  const Exec = [];
  const client = new CloudFormationClient({ credentials });
  DelLambdaD.forEach((funcName) => {
    const command = new DeleteStackCommand({ StackName: funcName });
    Exec.push(client.send(command));
  });

  await Promise.all(Exec);
}

gitFunction('g:/osero/lambda/src');
console.log('afuncs:', afuncs);

const FUNCS = {
  nopconf: gitFunction,
  del_la_aconf: listFunctions,
  exec_la: deleteFunction,
  del_st_aconf: listStack,
  exec_st: deleteStack,
};
for (let i = 3; i < process.argv.length; i++) {
  const fn = process.argv[i];
  switch (fn) {
    case 'nopconf':
      fs.writeFileSync('DelLambdaA.json', JSON.stringify(afuncs, ' ', 2));
      break;
    default:
      FUNCS[fn]();
      break;
  }
}
