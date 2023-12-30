/**
 * オセロのメイン部
 */
import React, { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { LEN, ID } from './othello';
import { Row } from './row';
import { initSS } from './player';
console.log("-------- load --------");

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

export function Board(){
  // オセロボードの状態をstateで管理する
  // 対戦相手が石を置くまで操作できないようにする
  const [isDisabled, setIsDisabled] = useState(false); 
  const [playState, setPlayState] = useState('対戦中');
  const [putPos, setPutPos] = useState([]);
  const [ctx] = useState( initSS( clickSquare ) );

  // 操作タイミングでの処理
  async function clickSquare(event) {
    console.log("clickSquare", event);
    if(GameSet) return;

    if(!isDisabled)// マスの操作抑止を解除
      setIsDisabled(true);

    for(let i = 0; i < 2; i++){
      // 今回の操作
      const isPut = ctx.ss.isPut(event);
      if(isPut === ID.ALREADY_STORE || isPut === ID.NOT_PUT){
        break;
      }
      await wait(); // 1秒待つ

      // 次の操作判定
      const {next:after_func} = ctx.ss.now;
      const nObj = ctx.ss.next;
      const next = isNext( nObj );
      switch(next){
      case ID.FLIP_OK:
        if(after_func) after_func();
        break;
      case ID.NO_PUT_LOCATION:
        i--;
        continue;
      default:
        return;
      }
    }
    if(isDisabled && ctx.ss.isPlayer)// マスの操作抑止を解除
      setIsDisabled(false);
  }

  // 次の操作が可能か
  function isNext({v, obj}){
    // 両プレイヤーで置ける位置があるか
    const is = {
      x: obj.isPutPosition('x'),
      o: obj.isPutPosition('o'),
      get flip(){
        return (this.x.length + this.o.length) > 0;
      },
      get n(){
        return this[ v ];
      },
    }

    console.log("isNext", v, is.flip, is);
    if (!is.flip){
      GameSet = true;
      const {x, o} = obj.getOX();
      if(x > o) setPlayState('黒の勝ち');
      else if(x < o) setPlayState('白の勝ち');
      else setPlayState('引き分け');
      return ID.NOT_PUT;
    }

    // 相手の置く場所がない
    if (is.n.length === 0) {
      return ID.NO_PUT_LOCATION;
    }
    setPutPos(is.n);
    return ID.FLIP_OK;
  }

  const ReSet = useCallback(function reset( ){
    console.log("ReSet useCallback", GameSet);
    GameSet = false;
    
    const {loop} = ctx.init();
    setPlayState('開始');
    if(loop) loop();
  }, [ ctx ]);

  useEffect(() => {
    console.log("useEffect", GameSet);
    if(!GameSet) return;
    ReSet();
  }, [ ReSet ]);

  function PlayerSelect(idx, msg){
    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
      const v = event.target.value;
      if( v === 0 ) {
        ctx.ss.type = {idx, id:v};//[id] = ss_type[0];
      } else {
        ctx.ss.type = {idx, id: 1};
        ctx.ss[idx].data.lv = v;
      }
      if(idx === 1 && ctx.ss[0].type !== 1){
        ctx.ss[idx].next = clickSquare;
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

  if( !ctx ) return "";

  const {board, ox_count, count} = ctx.ss.obj;
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
            board={board}
            isputstone={putPos}
            onClick={clickSquare}
            disabled={isDisabled}
          ></Row>
        ))}
      </div>
      {ox_count}
      {count}個置いてある
    </div>
  );
}
