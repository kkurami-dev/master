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
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

// オセロのX軸のindex
const rowArr = [];
for(let i = 0; i < LEN; i++){
  rowArr.push(i);
}

// 1000ms待つ処理
function wait(t = 100) {
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
  const ss_type = [
    {type: 1, func: pc,  next: null, data:{}},
    {type: 2, func: npc, next: null, data:{lv:6}},
    {type: 2, func: npc, next: clickSquare, data:{lv:1}},
  ];
  const ss = [
    ss_type[1],
    ss_type[2],
  ];
  let GameStete = true;

  //プレイヤーが石を置ける箇所を取得
  const [putPos, setPutPos] = useState([]);
  const [ModalParam, // setModalParam
        ] = useState({title:""});
  useEffect(() => {
    if(GameStete){
      ReSet();
      if(ss[1].next) ss[1].next();
    }
  }, []);

  // NPCの動作
  function npc(act, {lv}) {
    // 対戦相手の石を置ける箇所を取得
    const opponentPutArr = othelloObj.isPutPosition(act);
    // 石を置く箇所の優先順位を決める
    const putPosition = opponentSelect(act, opponentPutArr);
    // より多く返せる箇所を選択
    const select = selectPosition(putPosition, act, othelloObj, lv);

    // NPCがおける場所がなくなったので終了
    if (!select)
      return ID.NO_PUT_LOCATION;

    othelloObj.putStone(select, act);
    setIsDisabled(false); // マスの操作抑止を解除
    return ID.FLIP_OK;
  }

  // プレイヤーの動作
  function pc(act, {event}) {
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
    if(GameStete) return;

    const arr = ['x', 'o'];
    for(let i = 0; i < 2; i++){
      const isPut = ss[i].func(arr[i], {ev:event, ...ss[i].data});
      // ユーザ操作で置けていないので、やり直し
      if(isPut === ID.ALREADY_STORE || isPut === ID.NOT_PUT){
        break;
      }
      await wait(); // 1秒待つ

      // 両プレイヤーで置ける位置があるか
      const is_x = othelloObj.isPutPosition('x');
      const is_o = othelloObj.isPutPosition('o');
      if (is_x.length === 0 && is_o.length === 0){
        GameStete = true;
        const {x, o} = othelloObj.getOX();
        if(x > o) setPlayState('黒の勝ち');
        else if(x < o) setPlayState('白の勝ち');
        else setPlayState('引き分け');
        return;
      }

      isNext( arr[i] );
      if(ss[i].next) ss[i].next();
    }
  }

  function ReSet() {
    GameStete = false;
    othelloObj.setdefault();
    isNext( "o" );
    setPlayState('開始');
  }

  function PlayerSelect(id, msg){
    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
      const v = event.target.value;
      if( v === 0 ) {
        ss[id] = ss_type[0];
      } else if(id === 1 && ss[0].type === 2){
        ss[id] = ss_type[2];
        ss[id].lv = v;
      } else {
        ss[id] = ss_type[1];
        ss[id].lv = v;
      }
      setAge(v);
    };
    return (
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel variant="standard" htmlFor="uncontrolled-native">
            {msg}
          </InputLabel>
          <Select
            labelId="player-select-label"
            id="player-select"
            value={age}
            label="player"
            onChange={handleChange}
          >
            <MenuItem value={0}>Player</MenuItem>
            {[1,2,3,4,5,6].map((lv, idx) =>
              <MenuItem value={lv} key={idx}>NPC レベル{lv}</MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>
    );
  }

  function XPlayer(){
    return PlayerSelect(0, "黒(先攻)");
  }

  function OPlayer(){
    return PlayerSelect(1, "白(後攻)");
  }

  return (
    <div className="container">
      <Stack spacing={2} direction="row">
        <Button variant="contained" onClick={ReSet}>リセット</Button>
        <XPlayer/>
        <OPlayer/>
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
      {othelloObj.ox_count}
      {othelloObj.count}個置いてある
      <DefaultModal {...ModalParam} />
    </div>
  );
};
