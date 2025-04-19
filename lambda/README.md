Jest でsetTimeout使う関数のテストを実行するには、以下の方法があります。
1.doneコールバックを使う
  Jest は非同期テストをサポートしており、doneコールバックを使うことで非同期処理が完了するのを待つことができます。
  function delayedFunction(callback) {
    setTimeout(() => {
      callback("Hello, Jest!");
    }, 1000);
  }

  test("setTimeout を使った関数のテスト (done)", (done) => {
    delayedFunction((message) => {
      expect(message).toBe("Hello, Jest!");
      done(); // テストの終了を知らせる
    });
  });

2.Promise返す
  関数がPromise戻る場合は、returnするだけで Jest は非同期処理が終わるのを待ちます。
  function delayedPromise() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Hello, Jest!");
      }, 1000);
    });
  }
  test("setTimeout を使った関数のテスト (Promise)", () => {
    return delayedPromise().then((message) => {
      expect(message).toBe("Hello, Jest!");
    });
  });

3.async/awaitを使う
  Jestasync/awaitもサポートしているので、より直感的に書きます。
  test("setTimeout を使った関数のテスト (async/await)", async () => {
    const message = await delayedPromise();
    expect(message).toBe("Hello, Jest!");
  });

4.jest.useFakeTimersを使う (タイマーをモック化)
  テスト実行時間を短縮したい場合は、Jest の通信をモック化できます。
    jest.useFakeTimers();
    test("setTimeout を使った関数のテスト (jest.useFakeTimers)", () => {
      const mockCallback = jest.fn();
      delayedFunction(mockCallback);
      // タイマーを手動で進める
      jest.runAllTimers();
    
      expect(mockCallback).toHaveBeenCalledWith("Hello, Jest!");
    });
  またはjest.advanceTimersByTime(ms)を使って特定の時間だけ進むことも可能です。
    test("setTimeout を使った関数のテスト (jest.advanceTimersByTime)", () => {
      const mockCallback = jest.fn();
      delayedFunction(mockCallback);
    
      // 1000ms 進める
      jest.advanceTimersByTime(1000);
      expect(mockCallback).toHaveBeenCalledWith("Hello, Jest!");
    });

方法	説明
doneコールバック	簡単な方法ですが、お願いdone()忘れに注意してください
Promise	returnでJestに処理の完了を伝える
async/await	awaitを使って考えて書く
jest.useFakeTimers	setTimeoutの時間をスキップできる
テストの実行時間を短縮したい場合は、フェイクコンピューター ( jest.useFakeTimers())を使うのがおすすめです。
