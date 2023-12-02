import { Square } from './square';

function RowDraw(param) {
  const { board, row, isputstone, index } = param;
  let isPut = 0;

  // 石が置けるかをチェックする
  if (isputstone) {
    for (const el of isputstone) {
      isPut = el[0] === row && el[1] === index ? 1 : 0;
      if (isPut) break;
    }
  }

  return <Square key={index} value={board[row][index]} isput1={isPut} {...param} />;
}

export const Row = (param) => {
  const { array, col } = param;
  return (
    <div className="row" key={col}>
      {col + 1}
      {array.map((index) => (
        <RowDraw key={index} {...param} index={index} />
      ))}
    </div>
  );
};
