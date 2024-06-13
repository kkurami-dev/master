import { jest, beforeEach } from '@jest/globals';

import { mockClient } from "aws-sdk-client-mock"
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb"

const ddbMock = mockClient(DynamoDBDocumentClient)

jest.spyOn(console, "log").mockImplementation();
jest.spyOn(console, "warn").mockImplementation();
jest.spyOn(console, "error").mockImplementation();

beforeEach(() => {
  ddbMock.reset()
})

function mockSet(def){
  for(let i = 0; i < def.length; i++){
    const tmp = Object.assign({}, def[i]);
    ddbMock.on(tmp.com, tmp.in).resolves(tmp.out);
  }
}

export {
  mockSet,
};
