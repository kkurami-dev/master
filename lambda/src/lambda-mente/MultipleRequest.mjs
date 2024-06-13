import { setTimeout } from 'timers/promises';

/**
 * パラメータ
 *   opt
 *   funcs: 3つの処理関数を登録
 *     Search: 処理対象の一覧を取得処理
 *       opt  : MultipleRequest の opt
 *       next : Search の前回の実行結果の next
 *     Decision: 一覧の要素１つが実行対象か判定処理
 *       opt  : MultipleRequest の opt
 *       data : Search の実行結果の arr の1要素
 *     Execution: 判定結果が 0 以外の場合に実行を行う処理
 *       opt  : MultipleRequest の opt
 *       data : Search の実行結果の arr の1要素
 *       cb   : 終了時の MultipleRequest への通知
 * ロジック
 */
async function MultipleRequest(opt = {}, funcs) {
  const {Search, Decision, Execution} = funcs;
  const functions = [];
  let AllItems = 0;
  const timeArr = [];

  // 各関数のレイヤーを更新
  const ExeFunc = (data) => {
    const execFlag = Decision(opt, data);

    //console.log("f:", FunctionName, updatei, `${existingLayers}`);
    if(!execFlag) {
      AllItems--;
      return;
    }

    // 単位時間当たりの実行数計算用
    const tobj = {t:new Date().getTime(), s:1};
    timeArr.push( tobj );

    // 更新
    functions.push( Execution(
      opt,
      data,
      (err, data)=> {
        AllItems--;
        tobj.s = 2;
      }
    ));
  }

  // 一定間隔で Update を実行する関数
  // 無条件だとソケット数50 を超過してしまい、更新失敗してしまう
  const timeFunc = (param) => {
    const { thred, items, intervalID } = param;

    // 実行数制限
    if( timeArr.length > 45 ){
      const nowTime = new Date().getTime();
      const diff = nowTime - timeArr[0].t;

      // 単位時間の実行数制限
      if(diff < 1100 ){
        console.log("timeFunc Rate exceeded", thred, AllItems, diff );
        return;
      }

      // 同時実行数制限
      if( timeArr[0].s === 2 )
        timeArr.shift();
      return;
    }

    // 終了判定
    if( param.count >= items.length ){
      console.log("timeFunc:", thred, "end");
      clearInterval(intervalID);
      return;
    }

    ExeFunc( items[ param.count ] );
    param.count += 1;
  };

  let next = undefined;
  let thred = 0;
  do {
    // 既存のレイヤーを取得
    const obj = {
      thred: ++thred,
      count: 0,
      wait: true,
      items: [],
      t: new Date().getTime(),
      s: 1
    };
    timeArr.push( obj );

    const response = await Search(opt, next);
    Object.assign(obj, {
      items: response.arr,
      s: 2,
      intervalID: setInterval(timeFunc, 44, obj),
    });
    AllItems += response.arr.length;

    next = response.next;
  } while(next);

  while(AllItems > 0){
    await setTimeout(100);
  }
  await Promise.all( functions );
}

export {
  MultipleRequest,
};
