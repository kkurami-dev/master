import { useState } from 'react';
import { Box, InputLabel, MenuItem, FormControl, Select } from '@mui/material';
import { PropTypes } from 'prop-types';

import opponentSelect from '../utils/opponentSelect.mjs';
import selectPosition from '../utils/selectPosition.mjs';
import { OthelloBoard, ID } from '../utils/othello.mjs';

// NPCの動作
function npc(act, { lv, ss }) {
  // 石を置く箇所の優先順位を決める
  const opponentPutArr = ss.obj.isPutPosition(act);
  const putPosition = opponentSelect(act, opponentPutArr);
  const select = selectPosition(putPosition, act, ss.obj, lv);
  if (!select) {
    return ID.NO_PUT_LOCATION;
  }
  return ss.obj.putStone(select, act);
}

// イベントから置いた位置を特定
function pc(act, { ev, ss }) {
  if (!ev) {
    return ID.ERROR;
  }
  const { col, row } = ev.target.attributes;
  const item = ss.obj.board[Number(col.value)][Number(row.value)];
  return ss.obj.putStone(item, act);
}

function initSS(click) {
  const sOB = new OthelloBoard();

  /* eslint-disable key-spacing */
  /* eslint-disable array-element-newline */
  const SsType = [
    { type: 1, func: pc, next: null, data: {} },
    { type: 2, func: npc, next: null, data: { lv: 6 } },
    { type: 2, func: npc, next: click, data: { lv: 1 } },
  ];
  /* eslint-enable key-spacing */
  /* eslint-enable array-element-newline */

  const ss = {
    obj: sOB,
    x: SsType[1],
    o: SsType[2],
    v: 'x',
    p: SsType[1],
    isPut: function ss(ev) {
      return this.p.func(this.v, { ev, ...this.p.data, ss: this });
    },
    set type({ idx, id, lv }) {
      SsType[id].data.lv = lv;
      this[idx] = SsType[id];
      if (this.v === idx) {
        this.p = SsType[id];
      }
      if (this.x.type !== 1) {
        this.o.next = click;
      } else {
        this.o.next = null;
      }
    },
    get now() {
      return { ...this.p, v: this.v };
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
      return { ...this.p, v: this.v, obj: sOB };
    },
  };
  function init() {
    sOB.setdefault();
    return { loop: ss.o.next, obj: sOB };
  }

  return { ss, SsType, init, ...ss.p };
}

function PlayerSelect({ pidx, msg, ctx }) {
  const [age, setAge] = useState('');

  const handleChange = (event) => {
    const lv = event.target.value;
    if (lv === 0) {
      ctx.ss.type = { pidx, id: 0, lv: 0 }; // [id] = SsType[0];
    } else if (pidx === 1 && ctx.ss.x.type !== 1) {
      ctx.ss.type = { pidx, id: 2, lv };
    } else {
      ctx.ss.type = { pidx, id: 1, lv };
    }
    setAge(lv);
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
          {[1, 2, 3, 4, 5, 6].map((lv) => (
            <MenuItem value={lv} p="npc">
              NPC レベル{lv}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

PlayerSelect.defaultProps = {
  pidx: 0,
  msg: "",
  ctx: {},
};
PlayerSelect.propTypes = {
  pidx: PropTypes.string,
  msg: PropTypes.string,
  ctx: PropTypes.instanceOf,
};

export { initSS, PlayerSelect };
