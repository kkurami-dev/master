import React, { useState } from 'react';
import { Row } from './row';
import { OthelloBoard } from './othello';
import { opponentSelect } from '../utils/opponentSelect';
import { selectPosition } from '../utils/selectPosition';

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

  const player = 'x'; // プレイヤー
  const opponent = 'o'; // 対戦相手

  const putPositionArr = othello.isPutPosition(player); //プレイヤーが石を置ける箇所を取得

  // 操作タイミングでの処理
  async function clickSquare(row, index) {
    const isPut = othello.putStone(row, index, player);
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

    const opponentPutArr = othello.isPutPosition(opponent); // 対戦相手の石を置ける箇所を取得
    const putPosition = opponentSelect(opponent, opponentPutArr); // 石を置く箇所の優先順位を決める
    const select = selectPosition(putPosition, opponent, othello.checkStone, othello.board); // より多く返せる箇所を選択

    // NPCがおける場所がなくなったので終了
    if (!select) {
      setPlayState('終了');
      return;
    }
    othello.putStone(select[0], select[1], opponent); // 対戦相手の石を置く
    setIsDisabled(false); // マスをdisabledを解除
    const _newArray = [...othelloBoard];
    setOthelloBoard(_newArray);
    setPlayState('プレイヤーの番');
  }

  return (
    <div className="container">
      <div>{playState}</div>
      <div className="board">
        {rowArr.map((index) => {
          return (
            <Row
              key={index}
              array={rowArr}
              board={othelloBoard}
              row={rowArr[index]}
              isPutStone={putPositionArr}
              onClick={clickSquare}
              disabled={isDisabled}
            ></Row>
          );
        })}
      </div>
    </div>
  );
};
