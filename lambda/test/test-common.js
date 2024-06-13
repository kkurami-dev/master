import { jest, beforeEach } from '@jest/globals';

import { mockClient } from "aws-sdk-client-mock"
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb"
import {
  ListTablesCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';

const ddbdMock = mockClient(DynamoDBDocumentClient);
const ddbMock = mockClient(DynamoDBClient);

// コマンドとモックの紐づけ
const mockMap = {
  ListTablesCommand: ddbMock,
  DescribeTableCommand: ddbMock,
  GetCommand: ddbdMock,
};

// ログは必要ない
jest.spyOn(console, "log").mockImplementation();
jest.spyOn(console, "warn").mockImplementation();
jest.spyOn(console, "error").mockImplementation();

// モックの初期化
beforeEach(() => {
  ddbMock.reset();
  ddbdMock.reset();
})

// 時刻を固定化
const fixed = new Date('2024-1-1T00:00:00');
jest.useFakeTimers().setSystemTime(fixed.getTime());

// 設定にしたがってモックの登録を行う
function mockSet({def}){
  for(let i = 0; i < def.length; i++){
    if(!def[i]) continue;
    if(!def[i].com) continue;

    const tmp = Object.assign({}, def[i]);
    def[i].no = i;
    const mock = mockMap[ tmp.com.name ];
    mock.on(tmp.com, tmp.in).resolves(tmp.out);
  }
}

export {
  mockSet,
};
