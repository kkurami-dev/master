/**
 * オセロのメイン部
 */
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { LEN, ID } from './othello';
import { Row } from './row';
import { initSS, PlayerSelect } from './player';

// console.log('-------- load --------');

/*
// データベースを開く
const request = window.indexedDB.open("MyTestDatabase", 3);
// エラーの対応
request.onerror = (event) => {
  console.error("なぜ私の ウェブアプリで IndexedDB を使わせてくれないのですか?!",);
};
// このイベントは最新のブラウザーにのみ実装されています
request.onupgradeneeded = (event) => {
  // IDBDatabase インターフェイスに保存します
  const db = event.target.result;
  // このデータベース用の objectStore を作成します
  const obj = db.createObjectStore("name", { keyPath: "myKey" });
};
*/
/**
 * オセロのX軸のindex
 */
const rowArr = [];
for (let i = 0; i < LEN; i += 1) {
  rowArr.push(i);
}

/**
 * 1000ms待つ処理
 */
function wait(t = 30) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

let GameSet = true;
function Board() {
  /*
   * オセロボードの状態をstateで管理する
   * 対戦相手が石を置くまで操作できないようにする
   */
  const [isDisabled, setIsDisabled] = useState(false);
  const [playState, setPlayState] = useState('対戦中');
  const [putPos, setPutPos] = useState([]);
  const [ctx, setCtx] = useState(null);

  /**
   * 次の操作が可能か
   */
  function isNext({ v, obj }) {
    // 両プレイヤーで置ける位置があるか
    const is = {
      x: obj.isPutPosition('x'),
      o: obj.isPutPosition('o'),
      get flip() {
        const xlen = obj.isPutPosition('x');
        const olen = obj.isPutPosition('o');
        return xlen + olen > 0;
      },
      get n() {
        // return this[v];
        return v
      },
    };

    if (!is.flip) {
      GameSet = true;
      const { x, o } = obj.getOX();
      if (x > o) {
        setPlayState('黒の勝ち');
      } else if (x < o) {
        setPlayState('白の勝ち');
      } else {
        setPlayState('引き分け');
      }
      return ID.NOT_PUT;
    }

    // 相手の置く場所がない
    if (is.n.length === 0) {
      return ID.NO_PUT_LOCATION;
    }
    setPutPos(is.n);
    return ID.FLIP_OK;
  }

  // 操作タイミングでの処理
  const clickSquare = async (event) => {
    if (GameSet) {
      return;
    }

    if (!isDisabled) {
      // マスの操作抑止を解除
      setIsDisabled(true);
    }

    // 今回の操作
    if(!ctx.ss) return;
    const isPut = ctx.ss.isPut(event);
    if (isPut === ID.ALREADY_STORE || isPut === ID.NOT_PUT) {
      return;
    }
    await wait(); // 1秒待つ

    // 次の操作判定
    const nObj = ctx.ss.next;
    const next = isNext(nObj);
    switch (next) {
      case ID.FLIP_OK: {
        const { next: AfterFunc } = ctx.ss.now;
        if (AfterFunc) {
          AfterFunc();
        }
        break;
      }
      case ID.NO_PUT_LOCATION:
        return;
      default:
        break;
    }

    if (ctx.ss.isPlayer) {
      // マスの操作抑止を解除
      setIsDisabled(false);
    }
  }

  /**
   * リセット
   */
  const ReSet = useCallback(() => {
    if(!ctx || !ctx.init) return;
    GameSet = false;

    const { obj, loop } = ctx.init();
    setPutPos(obj.isPutPosition('x'));
    setPlayState('開始');
    if (loop) {
      loop();
    } else {
      setIsDisabled(false);
    }
  }, [ctx]);

  /**
   * 初期化
   */
  useEffect(() => {
    if (!GameSet) {
      return;
    }
    ReSet();
    if (ctx === null) setCtx(initSS(clickSquare));
  }, [ReSet]);

  // const { board, oxcount, count } = ctx?.ss?.obj;
  let obj = {};
  if(ctx && ctx.ss && ctx.ss.obj){
    obj = ctx.ss.obj;
  }
  return (
    <div className="container">
      <Stack spacing={2} direction="row">
        <Button variant="contained" onClick={ReSet}>
          リセット
        </Button>
        <PlayerSelect idx="x" msg="黒(先攻)" ctx={ctx} />
        <PlayerSelect idx="o" msg="白(後攻)" ctx={ctx} />
        <div>{playState}</div>
      </Stack>
      <div className="board">
        <div className="row">
          <div>+</div>
          {rowArr.map((i) => (
            <div className="title_row" key={i}>
              {i}
            </div>
          ))}
        </div>
        {rowArr.map((index) => (
          <Row
            key={index}
            col={index}
            array={rowArr}
            board={obj?.board}
            isputstone={putPos}
            onClick={clickSquare}
            disabled={isDisabled}
          />
        ))}
      </div>
      {obj?.oxcount}
      {obj?.count}個置いてある
    </div>
  );
}

export default Board;
