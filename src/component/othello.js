/**
 * オセロのメインクラス
 */
import { crossCheck } from './crossCheck';

export const LEN = 8;

// 操作結果
export const ID = {
  FLIP_OK: 0,       // 裏返せた
  NO_PUT_LOCATION: 1,       // 置く場所がない
  ALREADY_STORE: 2, // すでに石が置いてある
  NOT_PUT: 3,       // 置けない
  ERROR: 99,
}

// チェックする方向
const directions = [
  [0, 1],   // 右
  [0, -1],  // 左
  [-1, 0],  // 上
  [1, 0],   // 下
  [-1, -1], // 左上
  [1, 1],   // 左下
  [-1, 1],  // 右上
  [1, -1],  // 右下
];

function newCel(col, row) {
  return {
    ////////////////////////////////////////
    Val: null,
    c: null,
    col,
    row,
    ////////////////////////////////////////
    get yIndex() {
      return this.col;
    },
    get xIndex() {
      return this.row;
    },
    set v(str) {
      this.Val = str;
    },
    get v() {
      if (this.Val === null) return null;
      return this.Val.toLowerCase();
    },
    isAct: function (ox) {
      if (this.v === ox || this.v === null) return true;
      return false;
    },
    isNow: function (ox) {
      return this.v !== ox;
    },
  };
}

export class OthelloBoard {
  constructor() {
    console.log("OthelloBoard constructor()");

    this.uuid = crypto.randomUUID();
    this.count = -1;
    this.number_of_moves = 3;
    this.len = LEN;
    this.max = LEN * LEN;
    this.board = [];
    for (let col = 0; col < LEN; col++) {
      const row_arr = [];
      this.board.push(row_arr);
      for (let row = 0; row < LEN; row++) {
        row_arr.push(newCel(col, row));
      }
    }
    this.setdefault(this.board);
  }

  setdefault(){
    if(this.count === 0) return;
    console.log("setdefault", this.count);
    this.count = 0;

    for (let col = 0; col < LEN; col++) {
      const row_arr = this.board[col];
      for (let row = 0; row < LEN; row++) {
        row_arr[ row ].c = null;
        row_arr[ row ].v = null;
      }
    }
    this.board[3][3].v = 'o';
    this.board[3][4].v = 'x';
    this.board[4][3].v = 'x';
    this.board[4][4].v = 'o';
    this.count += 4;
  }

  get isMatchEnd(){
    return this.number_of_moves === this.max;
  }
  get nowCount(){
    return this.count;
  }
  getOX = () => {
    const x_count = document.getElementsByName("act_x");
    const o_count = document.getElementsByName("act_o");
    return {x:x_count.length, o: o_count.length}
  }
  get win(){
    const ox = this.getOX();
    return ox.x.length > ox.o.length;
  }
  get ox_count(){
    const ox = this.getOX();
    return `黒: ${ox.x}、白: ${ox.o}、`;
  }

  checkStone(item, player, board = this.board) {
    const change = [];
    for (let i = 0; i < directions.length; i++) {
      const el = directions[i];
      // 選択した箇所で相手の石を返せそうならその位置を配列に入れる
      const result = crossCheck(board, item, el[1], el[0], player);
      change.push(...result);
    }
    return change;
  }

  isPutPosition(ox) {
    const putList = [];
    for (let i = 0; i < this.board.length; i++) {
      const rowItem = this.board[i];
      for (let j = 0; j < rowItem.length; j++) {
        const el = rowItem[j];
        const flipItems = this.checkStone(el, ox);

        // 1つ以上石を返せれば配列に次に指せる位置を保存
        if (flipItems.length > 0) {
          putList.push(el);
        }
      }
    }
    return putList;
  }

  putStone(item, ox) {
    // 既に石が置いてあれば処理を終了
    if (item.v) {
      console.log('すでに石が置いてあります');
      return ID.ALREADY_STORE;
    }

    //判定
    const willBeReturned = this.checkStone(item, ox);

    // 1つも石を返せなければ処理を終了
    if (willBeReturned.length === 0) {
      console.log('石を置けません');
      return ID.NOT_PUT;
    }

    // 問題なければ石を置く
    this.count++;
    item.v = ox.toUpperCase();
    item.c = this.count;
    this.number_of_moves++;

    // 置いた石との間にある石を返す
    for (let i = 0, l = willBeReturned.length; i < l; i++) {
      willBeReturned[i].v = ox;
    }
    return ID.FLIP_OK;
  }
}
