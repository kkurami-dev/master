import { jest, beforeEach, afterEach } from '@jest/globals';

import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb"
import {
  ListTablesCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from "aws-sdk-client-mock"

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

// 時刻を固定化
//jest.useFakeTimers();
//const fixed = new Date('2024-1-1T00:00:00');
//Date.now = jest.fn(() => fixed.getTime());
//jest.spyOn(global, "Date").mockImplementation(() => fixed)

//jest.useFakeTimers().setSystemTime(fixed.getTime());
// jest.spyOn(global, 'setTimeout');
// jest.spyOn(global, 'setInterval');
//const timeMock = {};

// モックの初期化
beforeEach(() => {
  const fixed = new Date('2024-1-1T00:00:00');
  jest.spyOn(global, "Date").mockImplementation(() => {
    fixed.setMilliseconds(300);
    return fixed;
  })

  ddbMock.reset();
  ddbdMock.reset();
  //jest.useFakeTimers();
  // timeMock.to = jest.spyOn(global, 'setTimeout');
  // timeMock.ti =  jest.spyOn(global, 'setInterval');
  // for(const key in timeMock){ timeMock[ key ].mockClear();}
});
// afterEach(()=>{
//   jest.useRealTimers();
// });

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
