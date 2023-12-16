import React, { useState, useEffect } from 'react';
import { Row } from './row';
import { OthelloBoard, LEN, ID } from './othello';
import { opponentSelect } from '../utils/opponentSelect';
import { selectPosition } from '../utils/selectPosition';
import { DefaultModal } from '../utils/modal';

const player = 'x'; // プレイヤー
//const opponent = 'o'; // 対戦相手
const playerS = ['x', 'o'];

// オセロのX軸のindex
const rowArr = [];
for(let i = 0; i < LEN; i++){
  rowArr.push(i);
}

// 1000ms待つ処理
function wait(t = 1000) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve();
    }, t);
  });
}

const othello = new OthelloBoard(); //OthelloBoardクラスのインスタンスを生成
export const Board = () => {
  let count = 5;
  // オセロボードの状態をstateで管理する
  const [othelloBoard, setOthelloBoard] = useState(othello.board); 
  // 対戦相手が石を置くまで操作できないようにする
  const [isDisabled, setIsDisabled] = useState(false); 
  const [playState, setPlayState] = useState('対戦中');
  const [ss, setSS] = useState([
    //{func: pc,  next: null},
    {func: npc, next: null},
    {func: npc, next: () => clickSquare()},
  ]);
  //プレイヤーが石を置ける箇所を取得
  const [putPos, setPutPos] = useState([]);
  //
  const [ModalParam, // setModalParam
        ] = useState({title:""});
  useEffect(() => {
    //
    console.log("useEffect []");
    setPutPos(othello.isPutPosition(player));
  }, []);

  // NPCの動作
  function npc(act) {
    // 対戦相手の石を置ける箇所を取得
    const opponentPutArr = othello.isPutPosition(act);
    // 石を置く箇所の優先順位を決める
    const putPosition = opponentSelect(act, opponentPutArr);
    // より多く返せる箇所を選択
    const select = selectPosition(putPosition, act, othello.checkStone, othello.board);

    // NPCがおける場所がなくなったので終了
    if (!select)
      return ID.NO_PUT_LOCATION;

    othello.putStone(select, act, count++);
    setIsDisabled(false); // マスの操作抑止を解除
    return ID.FLIP_OK;
  }

  // プレイヤーの動作
  function pc(act, event) {
    setIsDisabled(true); // 相手が石を置くまでマスの操作抑止を設定

    // イベントから置いた位置を特定
    const { col, row, name } = event.target.attributes;
    const item = othello.board[Number(col.value)][Number(row.value)];
    // 
    const isPut = othello.putStone(item, act, count);
    if (isPut) {
      setIsDisabled(false); // マスの操作抑止を解除
      return isPut;
    }

    count++;
    setPlayState('NPCの番');
    return ID.FLIP_OK;
  }

  // 次の操作が可能か
  function isNext(act){
    const n = act === 'o' ? 'x' : 'o';
    const newArray = [...othelloBoard];
    setOthelloBoard(newArray);

    const flipPoss = othello.isPutPosition(n);
    if (flipPoss.length === 0) {
      // 相手の置く場所がない
      return ID.NO_PUT_LOCATION;
    }

    setPutPos(flipPoss);
    setPlayState('プレイヤーの番');
    return ID.FLIP_OK;
  }

  // 操作タイミングでの処理
  async function clickSquare(event) {
    const arr = ['x', 'o'];
    for(let i = 0; i < 2; i++){
      const isPut = ss[i].func(arr[i], event);
      // ユーザ操作で置けなかったら終了
      if(isPut === ID.ALREADY_STORE || isPut === ID.NOT_PUT)
        break;

      const next = isNext( arr[i] );
      if ((!isPut && !next) || othello.isMatchEnd ) {
        return;
      }
      await wait(); // 1秒待つ
      if(ss[i].next) ss[i].next();
    }
  }

  return (
    <div className="container">
      <div>{playState}</div>
      <div className="board">
        <div className="row">
          <div>+</div>
          {rowArr.map((i, idx) => (
            <div className="title_row" key={idx}>
              {i}
            </div>
          ))}
        </div>
        {rowArr.map((index) => (
          <Row
            col={index}
            key={index}
            array={rowArr}
            board={othelloBoard}
            row={rowArr[index]}
            isputstone={putPos}
            onClick={clickSquare}
            disabled={isDisabled}
          ></Row>
        ))}
      </div>
      {count - 1}個置いてある
      <DefaultModal {...ModalParam} />
    </div>
  );
};
