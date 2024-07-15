import fs from 'fs';
import path from 'path';

// AWS SDK V3 JavaScript のリファレンス
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/
//   左のサービス一覧から対象サービスを選択、フィルタに操作を入れて検索

// MFA認証
import {
  STSClient,
  AssumeRoleCommand,
} from "@aws-sdk/client-sts";
import { createInterface } from "readline";
import * as  ini from 'ini'; // https://www.npmjs.com/package/ini

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/#fromini
// import { fromIni } from "@aws-sdk/credential-provider-ini";

// 各種AWS操作
//import { ListTablesCommand, DescribeTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { LambdaClient, ListFunctionsCommand, DeleteFunctionCommand } from '@aws-sdk/client-lambda';
import {
  CloudFormationClient,
  ListStacksCommand,
  DeleteStackCommand,
} from '@aws-sdk/client-cloudformation';

//
// 引数の1つ目は使用するプロファイル名を指定する事
//
// process.argv = ['node', '$0', 'default', 'delconf'];
const ARGV = ['node', '$0', 'jvl', 'prof'];
//const credentials = fromIni(process.argv[2]);
let credentials = null;

const afuncs = {};

////////////////////////////////////////////////////////////////////////////////
// Nodejs でMFA認証の参考サイト
// https://dev.classmethod.jp/articles/aws-sdk-for-javascript-v3-assume-role-and-create-ec2-instance/

// Read Input : 標準入力からの文字列入力
async function readInput( questionText ){
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    readline.question(questionText, (answerText) => {
      if (answerText) {
        resolve(answerText);
      } else {
        reject("Failed read standard input.");
      }
      readline.close();
    });
  });
};

// Get IAM Role profile
async function getRoleProfile( profile = "jvl" ){
  const path = `${process.env["HOME"]}/.aws`;
  const cdl = ini.parse(fs.readFileSync(`${path}/credentials`, 'utf-8'));
  const cfg = ini.parse(fs.readFileSync(`${path}/config`, 'utf-8'));

  // プロファイルのソース
  const srcName = cfg[ profile ].credential_source;
  const keys = cdl[ srcName ];
  keys.RoleArn = cfg[ profile ].role_arn;
  return keys;

  // 使えそうで使えない
  // const inProf = fromIni({ profile })
  // console.log("inProf", inProf);
}

// Assume Role
async function assumeRole(roleProfile ){
  // Input MFA Token
  const mfaToken = await readInput(`MFA token for ${roleProfile.mfaSerial} > `);

  const stsClient = new STSClient({ region: 'ap-northeast-1' });
  const command = new AssumeRoleCommand({
    // The Amazon Resource Name (ARN) of the role to assume.
    RoleArn: roleProfile.RoleArn, // "ROLE_ARN",
    SerialNumber: roleProfile.mfaSerial,
    TokenCode: mfaToken,

    // sdk 用
    RoleSessionName: "session1",
    DurationSeconds: 3600, // 1H
  });
  const response = await stsClient.send(command);
  console.log(response);
}

// Get Credentials
async function getCredentials(profileName){
  const roleProfile = await getRoleProfile(profileName);
  if (!roleProfile) throw new Error("getRoleProfile");

  const cdl = await assumeRole(roleProfile);
  if (!cdl) throw new Error("assumeRole");

  credentials = new STSClient({
    accessKeyId: cdl.AccessKeyId,
    secretAccessKey: cdl.SecretAccessKey,
    sessionToken: cdl.SessionToken,
  });
  return credentials;
};

////////////////////////////////////////////////////////////////////////////////
// 
// const { defaultProvider } = require('@aws-sdk/credential-provider-node');
// (async () => {
//     const credential = await (defaultProvider())();
//     console.log(credential);
// })();

////////////////////////////////////////////////////////////////////////////////
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
  const command = new ListStacksCommand({ credentials });

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
  prof: getRoleProfile,
};
for (let i = 3; i < ARGV.length; i++) {
  const fn = ARGV[i];
  switch (fn) {
    case 'nopconf':
      fs.writeFileSync('DelLambdaA.json', JSON.stringify(afuncs, ' ', 2));
      break;
    default:
      FUNCS[fn]();
      break;
  }
}
