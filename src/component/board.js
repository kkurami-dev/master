import React, { useState } from 'react';
import { Row } from './row';
import { OthelloBoard } from './othello';
import { opponentSelect } from '../utils/opponentSelect';
import { selectPosition } from '../utils/selectPosition';

const player = 'x'; // プレイヤー
const opponent = 'o'; // 対戦相手
let count = 5;

// 1000ms待つ処理
function wait() {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve();
    }, 1000);
  });
}

const othello = new OthelloBoard(); //OthelloBoardクラスのインスタンスを生成
export const Board = () => {
  const [othelloBoard, setOthelloBoard] = useState(othello.board); // オセロボードの状態をstateで管理する
  const [isDisabled, setIsDisabled] = useState(false); // 対戦相手が石を置くまで操作できないようにする
  const [playState, setPlayState] = useState('対戦中');
  const rowArr = [0, 1, 2, 3, 4, 5, 6, 7]; // オセロのX軸のindex

  const putPositionArr = othello.isPutPosition(player); //プレイヤーが石を置ける箇所を取得

  // 操作タイミングでの処理
  async function clickSquare(e) {
    const { row, index } = e.target.attributes;
    const isPut = othello.putStone(Number(row.value), Number(index.value), player, count++);
    const newArray = [...othelloBoard];
    setOthelloBoard(newArray);

    // 石を置ける箇所がなければ処理を終了する
    if (!isPut) {
      setPlayState('終了');
      return;
    }
    setIsDisabled(true); // 相手が石を置くまでマスをクリックできないようにする
    setPlayState('NPCの番');
    await wait(); // 1秒待つ

    // 対戦相手の石を置ける箇所を取得
    const opponentPutArr = othello.isPutPosition(opponent);
    // 石を置く箇所の優先順位を決める
    const putPosition = opponentSelect(opponent, opponentPutArr);
    // より多く返せる箇所を選択
    const select = selectPosition(putPosition, opponent, othello.checkStone, othello.board);

    // NPCがおける場所がなくなったので終了
    if (!select) {
      setPlayState('終了');
      return;
    }
    othello.putStone(select[0], select[1], opponent, count++); // 対戦相手の石を置く
    setIsDisabled(false); // マスをdisabledを解除
    const _newArray = [...othelloBoard];
    setOthelloBoard(_newArray);
    setPlayState('プレイヤーの番');
  }

  return (
    <div className="container">
      <div>{playState}</div>
      <div className="board">
        {rowArr.map((index) => (
          <Row
            col={index}
            key={index}
            array={rowArr}
            board={othelloBoard}
            row={rowArr[index]}
            isputstone={putPositionArr}
            onClick={clickSquare}
            disabled={isDisabled}
          ></Row>
        ))}
      </div>
    </div>
  );
};
