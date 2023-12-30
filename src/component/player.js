import { opponentSelect } from '../utils/opponentSelect';
import { selectPosition } from '../utils/selectPosition';
import { OthelloBoard, ID } from './othello';

// NPCの動作
function npc(act, {lv, ss}) {
  // 石を置く箇所の優先順位を決める
  const opponentPutArr = ss.obj.isPutPosition(act);
  const putPosition = opponentSelect(act, opponentPutArr);
  const select = selectPosition(putPosition, act, ss.obj, lv);
  if (!select)
    return ID.NO_PUT_LOCATION;
  return ss.obj.putStone(select, act);
}

// イベントから置いた位置を特定
function pc(act, {event, ss}) {
  if(!event) return ID.ERROR;
  const { col, row } = event.target.attributes;
  const item = ss.obj.board[Number(col.value)][Number(row.value)];
  return ss.obj.putStone(item, act);
}

function initSS( click ){
  const sOB = new OthelloBoard();
  const ss_type = [
    {type: 1, func: pc,  next: null, data:{}},
    {type: 2, func: npc, next: null, data:{lv:6}},
    {type: 2, func: npc, next: click, data:{lv:1}},
  ];
  const ss = {
    obj: sOB,
    "0": ss_type[1],
    "1": ss_type[2],
    v: "x",
    p: ss_type[1],
    isPut: function ss(ev){
      return this.p.func(this.v, {ev, ...this.p.data, ss:this})
    },
    set type({idx, id}){
      this[ idx ] = ss_type[ id ];
    },
    get now(){
      return { ...this.p, v: this.v };
    },
    get isPlayer(){
      return this.p.type === 1;
    },
    get next(){
      if( this.v === "x" ) {
        this.v = "o";
        this.p = this[ "1" ]
      } else {
        this.v = "x";
        this.p = this[ "0" ]
      }
      return { ...this.p, v: this.v, obj: sOB };
    }
  };
  function init(){
    sOB.setdefault();
    return {ss, loop: ss["1"].next};
  };
  const context = {ss, ss_type, init, ...ss.p};

  return context;
}

export{ initSS };
