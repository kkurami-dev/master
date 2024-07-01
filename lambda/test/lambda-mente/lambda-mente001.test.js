import { jest, describe, it, expect } from '@jest/globals';
import { ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

import { handler as Mente } from '../../src/lambda-mente/index.mjs';
import { mockSet } from '../test-common';

function setData() {
  // jest.useFakeTimers();
  const TableNames = [];
  for(let i = 0; i < 100; i += 1){
    TableNames.push( "testTable" + i );
  }
  const def = [
    {
      com: ListTablesCommand,
      in: {},
      out: { TableNames },
    },
  ];
  for(let i = 0; i < TableNames.length; i += 1){
    def.push({
      com: ListTablesCommand,
        in: { TableNames: TableNames[i]},
      out: {  },
    });
  }
  mockSet({ def });
}

describe('get user data', () => {
  it('should get user names', async () => {
    // jest.useFakeTimers();
    // jest.spyOn(global, 'setTimeout');
    // jest.spyOn(global, 'setInterval');
    // すべてのタイマーが実行されるまで早送りします
    // jest.advanceTimersByTime(1000);
    setData();
    let result = null;
    const cb = (ret) => {
      result = ret;
    };
    await Mente({ func: 'deleteDynamodb' }, {}, cb);
    // jest.runAllTimers();

    expect(result).toBe(null);
    //expect(result.Item).toStrictEqual(expectValue.Item)
  });
});
