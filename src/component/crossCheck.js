export const crossCheck = (board, currentPosition, yAxis, xAxis, player) => {
  const change = [];
  let y = currentPosition.yIndex + yAxis;
  let x = currentPosition.xIndex + xAxis;

  // 石を置いた箇所からチェックを進めていく時にboardの端までチェックし終えたらチェックする処理を終了する
  if (y > 7 || y < 0 || x > 7 || x < 0) {
    return change;
  }

  // 石が次に進んでいく方向
  const nextPosition = board[y][x];

  // 石が次に進んでいく方向 にマスがない場合か、石が置いてある場合はチェックを終了する
  if (!nextPosition || board[currentPosition.yIndex][currentPosition.xIndex].v) {
    return change;
  }

  // 石が次に進んでいく方向を最初は1つ隣、次のチェックで2つ隣となるので何個先をチェックするのか更新していく
  const total = [];

  // チェックする方向に置いた石と違う石があれば繰り返し処理をする
  let checkPositon = board[y][x];
  while (checkPositon.isNow(player)) {
    // チェックする方向に石があるか、何も置いてない場合は石が置けないのでチェックを終了する
    if (checkPositon.isAct(player)) {
      total.splice(0);
      return total;
    }

    // // 置いた時に返る石を追加
    total.push(checkPositon);

    // チェックを終えたらy軸とx軸を更新する
    y += yAxis;
    x += xAxis;

    // 石を置いた箇所からチェックを進めていく時にboardの端までチェックし終えたらチェックする処理を終了する
    if (board.length <= y || y < 0 || board.length <= x) {
      total.splice(0);
      return total;
    }
    checkPositon = board[y][x];
  }
  // 選択した箇所で相手の返る位置をchaneにpushする
  change.push(...total);
  return change;
};
