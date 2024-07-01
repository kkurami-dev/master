import { setTimeout } from 'timers/promises';

/**
 * パラメータ
 * funcs: 3つの処理関数を登録
 *   Search: 処理対象の一覧を取得処理
 *    多くの一覧を取得する場合は、細かく分けたリストを後続の関数で実施するように対応する
 *    IN:
 *     opt  : MultipleRequest の opt
 *     next : Search の前回の実行結果の next
 *    OUT:
 *
 *   Decision: 一覧の要素１つが実行対象か判定処理
 *    ここでは時間がかからない処理を実施(
 *    IN:
 *     opt  : MultipleRequest の opt
 *     data : Search の実行結果の arr の1要素
 *    OUT: 0:Executionを実行しない/ 1:Executionを実行
 *
 *   Execution: 判定結果が 0 以外の場合に実行を行う処理
 *    時間がかかる処理を実施
 *    IN:
 *     opt  : MultipleRequest の opt
 *     data : Search の実行結果の arr の1要素
 *     cb   : 終了時の MultipleRequest への通知
 *    OUT:
 * opt
 * ロジック
 */
async function MultipleRequest(funcs, opt = {}) {
  const { Search, Decision, Execution, dupNum = 45, dupTime = 1100 } = funcs;
  const functions = [];
  const timeArr = [];
  let AllItems = 0;

  // 各関数のレイヤーを更新
  const ExeFunc = (data) => {
    const execFlag = Decision(opt, data);

    // console.log("f:", FunctionName, updatei, `${existingLayers}`);
    if (!execFlag) {
      AllItems -= 1;
      return;
    }

    // 単位時間当たりの実行数計算用
    const tobj = { t: new Date().getTime(), s: 1 };
    timeArr.push(tobj);

    // 更新
    functions.push(
      Execution(opt, data, () => {
        AllItems -= 1;
        tobj.s = 2;
      })
    );
  };

  // 一定間隔で Update を実行する関数
  // 無条件だとソケット数50 を超過してしまい、更新失敗してしまう
  const timeFunc = (param) => {
    const { thred, items, intervalID } = param;

    // 実行数制限
    if (timeArr.length > dupNum) {
      const nowTime = new Date().getTime();
      const diff = nowTime - timeArr[0].t;

      // 単位時間の実行数制限
      if (diff < dupTime) {
        console.log('timeFunc Rate exceeded', thred, AllItems, diff);
        return;
      }

      // 同時実行数制限
      if (timeArr[0].s === 2) timeArr.shift();
      return;
    }

    // 終了判定
    if (param.count >= items.length) {
      console.log('timeFunc:', thred, 'end');
      clearInterval(intervalID);
      return;
    }

    ExeFunc(items[param.count]);
    param.count += 1;
  };

  let next = null;
  let thred = 0;
  do {
    // 既存のレイヤーを取得
    const obj = {
      thred: (thred += 1),
      count: 0,
      wait: true,
      items: [],
      t: new Date().getTime(),
      s: 1,
    };
    timeArr.push(obj);

    const response = await Search(opt, next);
    Object.assign(obj, {
      items: response.arr,
      s: 2,
      intervalID: null,
    });
    obj.intervalID = setInterval(timeFunc, 30, obj);
    AllItems += response.arr.length;

    next = response.next;
  } while (next);

  const count = 0;
  const checkLoop = (cb, resolve, i) => {
    if (AllItems > 0) {
      const n = i + 1;
      setTimeout(cb, 100, cb, resolve, n);
      return;
    }
    resolve(i);
  };
  functions.push(
    new Promise((resolve) => {
      setTimeout(checkLoop, 100, checkLoop, resolve, count);
    })
  );

  await Promise.all(functions);
  return;
}

export { MultipleRequest };
