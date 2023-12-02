import { crossCheck } from './crossCheck';

//チェックする方向
const directions = [
  [0, 1], // 右
  [0, -1], // 左
  [-1, 0], // 上
  [1, 0], // 下
  [-1, -1], // 左上
  [1, 1], // 左下
  [-1, 1], // 右上
  [1, -1], // 右下
];

function newCel(col, row) {
  return {
    Val: null,
    c: null,
    col,
    row,
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
    this.board = [];
    for (let col = 0; col < 8; col++) {
      const row_arr = [];
      this.board.push(row_arr);
      for (let row = 0; row < 8; row++) {
        row_arr.push(newCel(col, row));
      }
    }

    this.board[3][3].v = 'o';
    this.board[3][4].v = 'x';
    this.board[4][3].v = 'x';
    this.board[4][4].v = 'o';
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
      const colItem = this.board[i];
      for (let j = 0; j < colItem.length; j++) {
        const el = colItem[j];
        const checkPosition = this.checkStone(el, ox);

        // 1つ以上石を返せれば配列にその位置のY軸とX軸を入れる
        if (checkPosition.length) {
          putList.push(el);
        }
      }
    }
    return putList;
  }

  putStone(item, ox, count) {
    // 既に石が置いてあれば処理を終了
    if (item.v) {
      console.log('すでに石が置いてあります');
      return false;
    }

    //判定
    const willBeReturned = this.checkStone(item, ox);

    // 1つも石を返せなければ処理を終了
    if (willBeReturned.length === 0) {
      console.log('石を置けません');
      return false;
    }

    // 問題なければ石を置く
    item.v = ox.toUpperCase();
    item.c = count;

    // 置いた石との間にある石を返す
    for (let i = 0, l = willBeReturned.length; i < l; i++) {
      willBeReturned[i].v = ox;
    }
    return true;
  }
}
