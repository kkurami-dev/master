import React, { useState, useEffect } from 'react';
import { Row } from './row';
import { OthelloBoard, LEN } from './othello';
import { opponentSelect } from '../utils/opponentSelect';
import { selectPosition } from '../utils/selectPosition';
import { DefaultModal } from '../utils/modal';

const player = 'x'; // プレイヤー
const opponent = 'o'; // 対戦相手
const rowArr = []; // オセロのX軸のindex

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
  //プレイヤーが石を置ける箇所を取得
  const [putPos, setPutPos] = useState([]);
  //
  const [ModalParam, setModalParam] = useState({});
  useEffect(() => {
    setPutPos(othello.isPutPosition(player));
  }, []);

  // NPCの動作
  function npc() {
    // 対戦相手の石を置ける箇所を取得
    const opponentPutArr = othello.isPutPosition(opponent);
    // 石を置く箇所の優先順位を決める
    const putPosition = opponentSelect(opponent, opponentPutArr);
    // より多く返せる箇所を選択
    const select = selectPosition(putPosition, opponent, othello.checkStone, othello.board);

    // NPCがおける場所がなくなったので終了
    if (!select) {
      if (othello.isMatchEnd()) setPlayState('終了');
      return false;
    }
    othello.putStone(select, opponent, count++); // 対戦相手の石を置く
    setIsDisabled(false); // マスをdisabledを解除
    const _newArray = [...othelloBoard];
    setOthelloBoard(_newArray);

    const flipPoss = othello.isPutPosition(player);
    if (flipPoss.length === 0) {
      // プレイヤーの置く場所がない
      return true;// NPCはおけたので true
    }

    setPutPos(flipPoss);
    setPlayState('プレイヤーの番');
    return true;
  }

  function pc(event) {
    const { col, row } = event.target.attributes;
    const item = othello.board[Number(col.value)][Number(row.value)];
    const isPut = othello.putStone(item, player, count++);

    // おけないので終了
    if (!isPut) return false;

    const newArray = [...othelloBoard];
    setOthelloBoard(newArray);

    setIsDisabled(true); // 相手が石を置くまでマスをクリックできないようにする
    setPlayState('NPCの番');

    return true;
  }

  // 操作タイミングでの処理
  async function clickSquare(event) {
    // 石を置ける箇所がなければ処理を終了する
    const isPut  = pc(event);
    await wait(); // 1秒待つ
    const next = npc();
    if ((!isPut && !next) || othello.isMatchEnd ) {
      
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
