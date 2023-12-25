/**
* オセロのメイン部
*/
import React, { useState, useEffect, useCallback } from 'react';
import { Row } from './row';
import { OthelloBoard, LEN, ID } from './othello';
import { opponentSelect } from '../utils/opponentSelect';
import { selectPosition } from '../utils/selectPosition';
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
function wait(t = 30) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve();
    }, t);
  });
}

let GameSet = true;
export const Board = () => {
  // オセロボードの状態をstateで管理する
  const [othelloObj] = useState(new OthelloBoard());
  // 対戦相手が石を置くまで操作できないようにする
  const [isDisabled, setIsDisabled] = useState(false); 
  const [playState, setPlayState] = useState('対戦中');
  const [putPos, setPutPos] = useState([]);

  const ss_type = [
    {type: 1, func: pc,  next: null, data:{}},
    {type: 2, func: npc, next: null, data:{lv:6}},
    {type: 2, func: npc, next: clickSquare, data:{lv:1}},
  ];

  const ss = {
    "0": ss_type[1],
    "1": ss_type[2],
    v: null,
    p: null,
    isPut: function ss(ev){
      return this.p.func(this.v, {ev, ...this.p.data})
    },
    get now(){
      return { ...this.p, v: this.v };
    },
    get isPlayer(){
      return this.p.type === 1;
    },
    get next(){
      if( this.v === "o" ) {
        this.v = "x";
        this.p = this[ "0" ]
      } else {
        this.v = "o";
        this.p = this[ "1" ]
      }
      return { ...this.p, v: this.v };
    }
  };

  // NPCの動作
  function npc(act, {lv}) {
    // 石を置く箇所の優先順位を決める
    const opponentPutArr = othelloObj.isPutPosition(act);
    const putPosition = opponentSelect(act, opponentPutArr);
    const select = selectPosition(putPosition, act, othelloObj, lv);
    if (!select)
      return ID.NO_PUT_LOCATION;
    return othelloObj.putStone(select, act);
  }

  // イベントから置いた位置を特定
  function pc(act, {event}) {
    if(!event) return ID.ERROR;
    const { col, row } = event.target.attributes;
    const item = othelloObj.board[Number(col.value)][Number(row.value)];
    return othelloObj.putStone(item, act);
  }

  // 次の操作が可能か
  function isNext(act){
    const n = act === 'o' ? 'x' : 'o';

    // 両プレイヤーで置ける位置があるか
    const is = {
      x: othelloObj.isPutPosition('x'),
      o: othelloObj.isPutPosition('o'),
      get flip(){
        return (this.x.length + this.o.length) > 0;
      },
    }
    if (!is.flip){
      GameSet = true;
      const {x, o} = othelloObj.getOX();
      if(x > o) setPlayState('黒の勝ち');
      else if(x < o) setPlayState('白の勝ち');
      else setPlayState('引き分け');
      return ID.NOT_PUT;
    }

    if (is[ n ].length === 0) {
      // 相手の置く場所がない
      return ID.NO_PUT_LOCATION;
    }
    setPutPos(is[ n ]);
    return ID.FLIP_OK;
  }

  // 操作タイミングでの処理
  async function clickSquare(event) {
    if(GameSet) return;
    if(!isDisabled)// マスの操作抑止を解除
      setIsDisabled(true);

    const arr = ['x', 'o'];
    for(let i = 0; i < 2; i++){
      // 今回の操作
      let {p , v } = ss.now;
      const isPut = ss.isPut(event);
      if(isPut === ID.ALREADY_STORE || isPut === ID.NOT_PUT){
        break;
      }
      await wait(); // 1秒待つ

      // 次の操作判定
      const next = isNext( v );
      switch(next){
      case ID.FLIP_OK:
        let { p , v } = ss.next;
        if(p.next) p.next();
        break;
      case ID.NO_PUT_LOCATION:
        i--;
        continue;
      default:
        return;
      }
    }
    if(isDisabled && ss.isPlayer)// マスの操作抑止を解除
      setIsDisabled(false);
  }

  const ReSet = useCallback(function reset(){
    console.log("ReSet useCallback", GameSet);
    if(!GameSet) return;
    GameSet = false;
    
    othelloObj.setdefault();
    let {p, v} = ss.next;
    isNext( v );
    setPlayState('開始');
    if(p.next) p.next();
  }, [isNext, othelloObj, ss]);

  useEffect(() => {
    console.log("ReSet useEffect");
    ReSet();
  }, []);

  function PlayerSelect(id, msg){
    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
      const v = event.target.value;
      if( v === 0 ) {
        ss[id] = ss_type[0];
      } else {
        ss[id] = ss_type[1];
        ss[id].data.lv = v;
      }
      if(id === 1 && ss[0].type !== 1){
        ss[id].next = clickSquare;
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
              <MenuItem value={lv} p="npc" key={idx}>NPC レベル{lv}</MenuItem>
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
    </div>
  );
};
