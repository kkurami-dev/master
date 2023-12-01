import { crossCheck } from './crossCheck';

export class OthelloBoard {
  constructor() {
    this.board = Array.from(new Array(8), () =>
      new Array(8).fill(0).map(() => {
        return null;
      })
    );

    this.board[3][3] = 'o';
    this.board[3][4] = 'x';
    this.board[4][3] = 'x';
    this.board[4][4] = 'o';
  }

  checkStone(yIndex, xIndex, player, board = this.board) {
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

    const change = [];
    directions.forEach((el) => {
      // 選択した箇所で相手の石を返せそうならその位置を配列に入れる
      const result = crossCheck(board, { yIndex, xIndex }, el[0], el[1], player);
      change.push(...result);
    });
    return change;
  }

  isPutPosition(player) {
    const putList = [];
    this.board.forEach((colItem, colIndex) => {
      colItem.forEach((el, rowIndex) => {
        const checkPosition = this.checkStone(colIndex, rowIndex, player);

        // 石を置いた時に1つも返らなければreturn
        if (checkPosition.length === 0) {
          return [];
        }

        // 1つ以上石を返せれば配列にその位置のY軸とX軸を入れる
        putList.push([colIndex, rowIndex]);
      });
    });
    return putList;
  }

  putStone(yIndex, xIndex, player) {
    // 既に石が置いてあれば処理を終了
    if (this.board[yIndex][xIndex]) {
      console.log('すでに石が置いてあります');
      return false;
    }

    //判定
    const willBeReturned = this.checkStone(yIndex, xIndex, player);

    // 1つも石を返せなければ処理を終了
    if (willBeReturned.length === 0) {
      console.log('石を置けません');
      return false;
    }

    // 問題なければ石を置く
    this.board[yIndex][xIndex] = player;

    // 置いた石との間にある石を返す
    for (let i = 0, l = willBeReturned.length; i < l; i++) {
      this.board[willBeReturned[i][0]][willBeReturned[i][1]] = player;
    }
    return true;
  }
}
// const othello = new OthelloBoard();
// console.log(othello);
