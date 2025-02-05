import { jest, describe, it, expect, test } from '@jest/globals';

const fixed = new Date('2022-1-1T00:00:00');
jest.useFakeTimers().setSystemTime(fixed.getTime());

/*
  まとめ
  方法                |  説明
  doneコールバック      | 簡単な方法ですが、お願いdone()忘れに注意してください
  Promise             |  returnでJestに処理の完了を伝える
  async/await         |  awaitを使って考えて書く
  jest.useFakeTimers  |  setTimeoutの時間をスキップできる
  テストの実行時間を短縮したい場合は、フェイクコンピューター
  ( jest.useFakeTimers())を使うのがおすすめです。
 */

function delayedFunction(callback) {
  setTimeout(() => {
    callback('Hello, Jest!');
  }, 1000);
}

it('setTimeout を使った関数のテスト (done)', (done) => {
  delayedFunction((message) => {
    expect(message).toBe('Hello, Jest!');
    done(); // テストの終了を知らせる
  });
});

function delayedPromise() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Hello, Jest!');
    }, 1000);
  });
}

test('setTimeout を使った関数のテスト (Promise)', () => {
  return delayedPromise().then((message) => {
    expect(message).toBe('Hello, Jest!');
  });
});

test('setTimeout を使った関数のテスト (async/await)', async () => {
  const message = await delayedPromise();
  expect(message).toBe('Hello, Jest!');
});

//jest.useFakeTimers();

test('setTimeout を使った関数のテスト (jest.useFakeTimers)', () => {
  // OK
  const mockCallback = jest.fn();
  delayedFunction(mockCallback);

  // タイマーを手動で進める
  jest.runAllTimers();
  expect(mockCallback).toHaveBeenCalledWith('Hello, Jest!');
});

test('setTimeout を使った関数のテスト (jest.advanceTimersByTime)', () => {
  // OK
  const mockCallback = jest.fn();
  delayedFunction(mockCallback);

  // 1000ms 進める
  jest.advanceTimersByTime(1000);
  expect(mockCallback).toHaveBeenCalledWith('Hello, Jest!');
});
