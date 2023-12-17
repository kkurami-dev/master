/**
* オセロのメイン部
*/
import React, { useState, useEffect } from 'react';
import { Row } from './row';
import { OthelloBoard, LEN, ID } from './othello';
import { opponentSelect } from '../utils/opponentSelect';
import { selectPosition } from '../utils/selectPosition';
import { DefaultModal } from '../utils/modal';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

// オセロのX軸のindex
const rowArr = [];
for(let i = 0; i < LEN; i++){
  rowArr.push(i);
}

// 1000ms待つ処理
function wait(t = 300) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve();
    }, t);
  });
}

export const Board = () => {
  // オセロボードの状態をstateで管理する
  const [othelloObj] = useState(new OthelloBoard());
  // 対戦相手が石を置くまで操作できないようにする
  const [isDisabled, setIsDisabled] = useState(false); 
  const [playState, setPlayState] = useState('対戦中');
  const [ss] = useState([
    // {func: pc,  next: null, c: 0},
    // {func: npc, next: null, c: 0},
    {func: npc, next: null, c: 0},
    {func: npc, next: () => clickSquare(), c: 0},
  ]);
  let GameStete = true;

  //プレイヤーが石を置ける箇所を取得
  const [putPos, setPutPos] = useState([]);
  const [ModalParam, // setModalParam
        ] = useState({title:""});
  useEffect(() => {
    if(GameStete){
      ReSet();
      clickSquare(null);
    }
  }, []);

  // NPCの動作
  function npc(act) {
    // 対戦相手の石を置ける箇所を取得
    const opponentPutArr = othelloObj.isPutPosition(act);
    // 石を置く箇所の優先順位を決める
    const putPosition = opponentSelect(act, opponentPutArr);
    // より多く返せる箇所を選択
    const select = selectPosition(putPosition, act, othelloObj.checkStone, othelloObj.board);

    // NPCがおける場所がなくなったので終了
    if (!select)
      return ID.NO_PUT_LOCATION;

    othelloObj.putStone(select, act);
    setIsDisabled(false); // マスの操作抑止を解除
    return ID.FLIP_OK;
  }

  // プレイヤーの動作
  function pc(act, event) {
    if(!event) return ID.ERROR;
    setIsDisabled(true); // 相手が石を置くまでマスの操作抑止を設定

    // イベントから置いた位置を特定
    const { col, row } = event.target.attributes;
    const item = othelloObj.board[Number(col.value)][Number(row.value)];
    const isPut = othelloObj.putStone(item, act);
    if (isPut) {
      setIsDisabled(false); // マスの操作抑止を解除
      return isPut;
    }
    return ID.FLIP_OK;
  }

  // 次の操作が可能か
  function isNext(act){
    const n = act === 'o' ? 'x' : 'o';
    const flipPoss = othelloObj.isPutPosition(n);
    if (flipPoss.length === 0) {
      // 相手の置く場所がない
      return ID.NO_PUT_LOCATION;
    }
    setPutPos(flipPoss);
    return ID.FLIP_OK;
  }

  // 操作タイミングでの処理
  async function clickSquare(event) {
    const arr = ['x', 'o'];
    for(let i = 0; i < 2; i++){
      const isPut = ss[i].func(arr[i], event);
      // ユーザ操作で置けなかったら終了
      if(isPut === ID.ALREADY_STORE || isPut === ID.NOT_PUT){
        break;
      }

      const next = isNext( arr[i] );
      if (isPut && next){
        GameStete = true;
        return;
      }
      await wait(); // 1秒待つ
      if(ss[i].next) ss[i].next();
    }
  }

  function ReSet() {
    GameStete = false;
    othelloObj.setdefault();
    isNext( "o" );
    setPlayState('開始');
  }

  return (
    <div className="container">
      <Stack spacing={2} direction="row">
        <Button variant="contained" onClick={ReSet}>リセット</Button>
        <div>{playState}</div>
      </Stack>
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
            key={index}
            col={index}
            array={rowArr}
            board={othelloObj?.board}
            isputstone={putPos}
            onClick={clickSquare}
            disabled={isDisabled}
          ></Row>
        ))}
      </div>
      {othelloObj.ox_count}／
      {othelloObj.count}個置いてある
      <DefaultModal {...ModalParam} />
    </div>
  );
};
