import {useState} from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import {opponentSelect} from '../utils/opponentSelect';
import {selectPosition} from '../utils/selectPosition';
import {OthelloBoard, ID} from './othello';

// NPCの動作
function npc(act, {lv, ss}) {
  // 石を置く箇所の優先順位を決める
  const opponentPutArr = ss.obj.isPutPosition(act);
  const putPosition = opponentSelect(act, opponentPutArr);
  const select = selectPosition(putPosition, act, ss.obj, lv);
  if (!select) {
    return ID.NO_PUT_LOCATION;
  }
  return ss.obj.putStone(select, act);
};

// イベントから置いた位置を特定
function pc(act, {ev, ss}) {
  if (!ev) {
    return ID.ERROR;
  }
  const {col, row} = ev.target.attributes;
  const item = ss.obj.board[Number(col.value)][Number(row.value)];
  return ss.obj.putStone(item, act);
}

function initSS(click) {
  const sOB = new OthelloBoard();

  /* eslint-disable key-spacing */
  /* eslint-disable array-element-newline */
  const ss_type = [
    {type: 1, func: pc, next: null, data:{}},
    {type: 2, func: npc, next: null, data:{lv:6}},
    {type: 2, func: npc, next: click, data:{lv:1}},
  ];
  /* eslint-enable key-spacing */
  /* eslint-enable array-element-newline */

  const ss = {
    obj   : sOB,
    x     : ss_type[1],
    o     : ss_type[2],
    v     : 'x',
    p     : ss_type[1],
    isPut : function ss(ev) {
      return this.p.func(this.v, {ev, ...this.p.data, ss : this});
    },
    set type({idx, id, lv}) {
      ss_type[id].data.lv = lv;
      this[idx] = ss_type[id];
      if (this.v === idx) {
        this.p = ss_type[id];
      }
      if (this.x.type !== 1) {
        this.o.next = click;
      } else {
        this.o.next = null;
      }
    },
    get now() {
      return {...this.p, v : this.v};
    },
    get isPlayer() {
      return this.p.type === 1;
    },
    get next() {
      if (this.v === 'x') {
        this.v = 'o';
      } else {
        this.v = 'x';
      }
      this.p = this[this.v];
      return {...this.p, v : this.v, obj : sOB};
    }
  };
  function init() {
    sOB.setdefault();
    return {loop : ss.o.next, obj : sOB};
  }

  return {ss, ss_type, init, ...ss.p};
}

function PlayerSelect({idx, msg, ctx}) {
  const [age, setAge] = useState('');

  const handleChange = event => {
    const lv = event.target.value;
    if (lv === 0) {
      ctx.ss.type = {idx, id : 0, lv : 0};// [id] = ss_type[0];
    } else if (idx === 1 && ctx.ss.x.type !== 1) {
      ctx.ss.type = {idx, id : 2, lv};
    } else {
      ctx.ss.type = {idx, id : 1, lv};
    }
    setAge(lv);
  };

  return (
    <Box sx={{minWidth : 120}}>
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
          {[1, 2, 3, 4, 5, 6].map((lv, idx) => <MenuItem value={lv} p="npc" key={idx}>NPC レベル{lv}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  );
}

export {initSS, PlayerSelect};
