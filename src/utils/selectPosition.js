export const selectPosition = (arrPosition, opponent, checkStone, board) => {
  let _returnLength = 0; // 返す石の数
  let opponentPutItem;

  // 石を置ける箇所の数だけチェックする
  for (let i = 0; i < arrPosition.length; i++) {
    const checkPosition = checkStone(arrPosition[i], opponent, board);

    // 石を置いた時に返せる石の数が多い箇所をopponentPutItemに代入する
    if (checkPosition.length > _returnLength) {
      _returnLength = checkPosition.length;
      opponentPutItem = arrPosition[i];
    }
  }

  // 石を多く返せる位置を返す
  return opponentPutItem;
};
