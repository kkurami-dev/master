import fs from 'fs';
import path from 'path';

import { ListTablesCommand, DescribeTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  LambdaClient,
  ListFunctionsCommand,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';

const FUNCS = {
  nopconf: gitFunction,
  delconf: listFunctions,
  exec: deleteFunction,
};

const afuncs = {
};
const dfuncs = {
};

process.argv[0];

function gitFunction(dir){
  const files = fs.readdirSync(dir);
  files.forEach((item) => {
    const dirp = path.join(dir, item);
    const fis = fs.statSync(dirp).isDirectory();
    if(!fis) return;

    afuncs[ item ] = `${item}/${item}.json`;
  });
}

async function listFunctions(){
  const DelLambdaA = import("./DelLambdaA.json");

  const client = new LambdaClient({});
  const command = new ListFunctionsCommand({});

  const fMap = await client.send(command);
  // console.log("fMap", fMap);
  let i = 0;
  fMap.Functions.map((item) => {
    console.log("fMap", item);
    i += 1;
    dfuncs[ item.FunctionName ] = i;
  });
};

async function deleteFunction(infile){
  const DelLambdaD = import("./DelLambdaD.json");
  
  // funcName
  const client = new LambdaClient({});
  const command = new DeleteFunctionCommand({ FunctionName: funcName });
  return client.send(command);
};

gitFunction("g:/osero/lambda/src");
console.log("afuncs:", afuncs);

for(let i = 0;i < process.argv.length; i++){
  console.log("argv[" + i + "] = " + process.argv[i]);
  await FUNCS[ process.argv[i] ]();
}
