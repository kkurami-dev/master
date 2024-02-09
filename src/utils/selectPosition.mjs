/**
 * 鶴亀
 * 現在の盤面から多く置ける位置を返す
 */
import {
  Wait1,
  Wait2
} from './utilsData.mjs';

function getGP(arr, pos) {
  return arr[pos.col][pos.row];
}

function getAP(arr, poss) {
  let total = -100;
  for (let i = 0; i < poss.length; i++) {
    total += getGP(arr, poss[i]);
  }
  return total;
}

function GP(now, pos, {arr:wWait1}) {
  // 石を置いた時に返せる石の数が多い箇所をopponentPutItemに代入する
  if (wWait1.length > now.point) {
    now.point = wWait1.length;
    now.pos = pos;
  }
}

function W1(now, pos, {map}) {
  // マップを使った判定
  const w1 = getGP(map, pos);
  if (now.point < w1) {
    now.point = w1;
    now.pos = pos;
  }
}

function PP(now, pos, {arr, board, pp}) {
  // 石を置いた時に返せる石の数が多い箇所をopponentPutItemに代入する
  if (board.count > pp) {
    return GP(now, pos, {arr});
  }
  if (arr.length < now.point || now.point === -100) {
    now.point = arr.length;
    now.pos = pos;
  }
  return null;
}

function WP(now, pos, {map, arr}) {
  // 石を置いた時に返せる石の数が多い箇所をopponentPutItemに代入する
  const w1 = getAP(map, arr);
  const w2 = W1(now, pos, {map});
  const w = w1 + w2;
  if (now.point < w) {
    now.point = w;
    now.pos = pos;
  }
}

/* eslint-disable key-spacing */
/* eslint-disable array-element-newline */
const LevelLogic = [
  {},
  {lv:1, func: GP, data:{}},
  {lv:2, func: W1, data:{map: Wait1}},
  {lv:3, func: W1, data:{map: Wait2}},
  {lv:4, func: PP, data:{pp:30}},
  {lv:5, func: WP, data:{map: Wait1}},
  {lv:6, func: WP, data:{map: Wait2}},
];
/* eslint-enable key-spacing */
/* eslint-enable array-element-newline */

export const selectPosition = (arrPosition, opponent, obj, lv = 1) => {
  const opponentPutItem = {point : -100, pos : null}; // 一番評価が高い置く位置
  const {checkStone, board} = obj;
  const {func, data} = LevelLogic[lv]; // レベルに応じたロジック取得
  data.board = obj;

  // 石を置ける箇所の数だけチェックする
  for (let i = 0; i < arrPosition.length; i++) {
    const pos = arrPosition[i];

    // 石を置ける位置を確認
    data.arr = checkStone(pos, opponent, board);

    // レベルに応じて置く位置を修正
    func(opponentPutItem, pos, data);
  }

  return opponentPutItem.pos;
};
