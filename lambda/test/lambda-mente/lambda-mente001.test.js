import { describe, it, expect } from '@jest/globals';
import { handler as Mente } from '../../src/lambda-mente/index.mjs';
import { ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { mockSet } from '../test-common';

function setData() {
  const def = [
    {
      com: ListTablesCommand,
      in: {},
      out: { TableNames: ['test'] },
    },
    {
      com: DescribeTableCommand,
      in: {},
      out: { TableNames: ['test'] },
    },
  ];
  mockSet({def});
}

describe('get user data', () => {
  it('should get user names', async () => {
    setData();
    const result = await Mente({ func: 'deleteDynamodb' });
    expect(result).toBe(null);
    //expect(result.Item).toStrictEqual(expectValue.Item)
  });
});
