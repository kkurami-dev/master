/* eslint-disable no-magic-numbers */
/* eslint-disable array-element-newline */

// Board の角の座標
const angle = [
  [0, 0],
  [0, 7],
  [7, 0],
  [7, 7],
];

// Board の角に隣接する位置の座標
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

// 盤面による重み付
const Wait1 = [
  [120, -20, 20, 5, 5, 20, -20, 120],
  [-20, -40, -5, -5, -5, -5, -40, -20],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [5, -5, 3, 3, 3, 3, -5, 5],

  [5, -5, 3, 3, 3, 3, -5, 5],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [-20, -40, -5, -5, -5, -5, -40, -20],
  [120, -20, 20, 5, 5, 20, -20, 120],
];
const Wait2 = [
  [30, -12, 0, -1, -1, 0, -12, 30],
  [-12, -15, -3, -3, -3, -3, -15, -12],
  [0, -3, 0, -1, -1, 0, -3, 0],
  [-1, -3, -1, -1, -1, -1, -3, -1],

  [-1, -3, -1, -1, -1, -1, -3, -1],
  [0, -3, 0, -1, -1, 0, -3, 0],
  [-12, -15, -3, -3, -3, -3, -15, -12],
  [30, -12, 0, -1, -1, 0, -12, 30],
];

export {
  angle,
  angleAdjacent,
  Wait1,
  Wait2
};

/* eslint-enable no-magic-numbers */
/* eslint-enable array-element-newline */
