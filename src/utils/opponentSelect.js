/**
 * オセロのメインクラス
 */
// board の角の座標
const angle = [
  [0, 0],
  [0, 7],
  [7, 0],
  [7, 7],
];

// board の角に隣接する位置の座標
const angleAdjacent = [
  [0, 1],
  [1, 0],
  [1, 1],
  [0, 6],
  [1, 6],
  [1, 7],
  [6, 0],
  [6, 1],
  [7, 1],
  [6, 6],
  [6, 7],
  [7, 7],
];

// 一致した時
function someElement(arr, opponentPutArr) {
  return core(arr, opponentPutArr, true);
}

// 一致していない時
function differentElement(arr, opponentPutArr) {
  return core(arr, opponentPutArr, false);
}

// 石が置ける場所をチェックする
function core(positionArr, opponentPutArr, match) {
  let _result = [];

  // 一致したもの配列に入れる
  const matchArr = [];
  opponentPutArr.forEach((el) => {
    positionArr.forEach((item) => {
      const isMatch = el.row === item[0] && el.col === item[1];

      if (isMatch) {
        matchArr.push(el);
      }
    });

    if (match) {
      _result = matchArr;
    } else {
      const isInclude = matchArr.includes(el);
      if (!isInclude) {
        _result.push(el);
      }
    }
  });

  return _result;
}

// 引数にはopponent(相手の石)とopponentPutArr(全ての石を置ける箇所)を受け取ります。
export const opponentSelect = (opponent, opponentPutArr) => {
  // 角に石を置けるかのチェック
  const anglePutArr = someElement(angle, opponentPutArr);

  // 角に石を置ける場合は処理を終了する
  if (anglePutArr.length !== 0) {
    return anglePutArr;
  }

  // 角に隣接しない箇所があるかをチェック
  const notAngleAdjacent = differentElement(angleAdjacent, opponentPutArr);

  // 角に隣接しない箇所ある場合は処理を終了する
  if (notAngleAdjacent.length !== 0) {
    return notAngleAdjacent;
  }

  // 角に隣接している部分も含めて返す
  return opponentPutArr;
};
