import {
  dynamoDBdocMock,
  GetCommand,
  MockReset
} from '../aws-mock-lib.js';

/*
  <https://aws.amazon.com/jp/blogs/developer/mocking-modular-aws-sdk-for-javascript-v3-in-unit-tests/>
  単体テストでモジュラー AWS SDK for JavaScript (v3) をモックする

  <https://note.com/morihirok/n/n987e4d2241b3>
  AWS LambdaのテストでJestの恩恵を享受しまくろう

  <https://qiita.com/baku2san/items/0d80f80c4d3a8c892df5>
  AWS JavaScript SDK v3 で jest を使う。aws-sdk-client-mock(-jest) の利用記録

  <https://dev.classmethod.jp/articles/mock-sdk-with-aws-sdk-client-mock/>
  aws-sdk-client-mockを使ってAWS SDK for JavaScript v3をモックする

  <https://qiita.com/Kodak_tmo/items/724421fc2c9ca1091428>
  こんなのがあったのか!? AWS SDK v3 Client mock

  
*/

// テスト対象の Lambda
import { handler } from '../../src/test0003/index.mjs';


describe('sum module', () => {
  beforeEach(() => {
    MockReset();
  });

  test('GetCommandをモックする', async () => {
    // モックの応答
    documentMockClient.on(GetCommand).resolves({
      Item: {
        deviceId: 'test-deviceId',
        createdAt: 1643679540259,
        updatedAt: 1643679540259,
      },
    });

    // テスト対象の処理を実行する
    await myHandler();

    // 使われたGetCommandインスタンスの配列を取り出す
    const callsOfGet = documentMockClient.commandCalls(GetCommand);
    expect(callsOfGet.length).toBe(1);
    // 1回目の呼び出しの1個目の引数を取り出す
    expect(callsOfGet[0].args[0].input).toEqual({
      TableName: 'TEST_TABLE',
      Item: {
        deviceId: 'test-deviceId',
        updatedAt: expect.any(Number),
        createdAt: expect.any(Number),
      },
    });
  });
});
