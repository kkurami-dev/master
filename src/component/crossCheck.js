export function crossCheck(board, currentPosition, yAxis, xAxis, player) {
  const change = [];

  // 石を置いた箇所からチェックを進めていく時にboardの端までチェックし終えたらチェックする処理を終了する
  if (
    currentPosition.yIndex + yAxis > 7 ||
    currentPosition.yIndex + yAxis < 0 ||
    currentPosition.xIndex + xAxis > 7 ||
    currentPosition.xIndex + xAxis < 0
  ) {
    return change;
  }

  // 石が次に進んでいく方向
  const nextPosition = board[currentPosition.yIndex + yAxis][currentPosition.xIndex + xAxis];

  // 石が次に進んでいく方向 にマスがない場合か、石が置いてある場合はチェックを終了する
  if (!nextPosition || board[currentPosition.yIndex][currentPosition.xIndex].v) {
    return change;
  }

  // 石が次に進んでいく方向を最初は1つ隣、次のチェックで2つ隣となるので何個先をチェックするのか更新していく
  let _yAxis = yAxis;
  let _xAxis = xAxis;
  const total = [];

  // チェックする方向に置いた石と違う石があれば繰り返し処理をする
  let y = currentPosition.yIndex + _yAxis;
  let x = currentPosition.yIndex + _yAxis;
  let checkPositon = board[y][x];
  while (checkPositon.isNow(player)) {
    // チェックする方向に石があるか、何も置いてない場合は石が置けないのでチェックを終了する
    if (checkPositon.isAct(player)) {
      total.splice(0);
      return total;
    }

    // // 置いた時に返る石を追加
    total.push([y, x]);

    // チェックを終えたらy軸とx軸を更新する
    _yAxis += yAxis;
    _xAxis += xAxis;

    // 石を置いた箇所からチェックを進めていく時にboardの端までチェックし終えたらチェックする処理を終了する
    if (
      board.length <= currentPosition.yIndex + _yAxis ||
      currentPosition.yIndex + _yAxis < 0 ||
      board.length <= currentPosition.xIndex + _xAxis
    ) {
      total.splice(0);
      return total;
    }
    y = currentPosition.yIndex + _yAxis;
    x = currentPosition.yIndex + _yAxis;
    checkPositon = board[y][x];
  }
  // 選択した箇所で相手の返る位置をchaneにpushする
  change.push(...total);
  return change;
}
