/**
* 横一列の制御
*/
import { Square } from './square';

function RowDraw(param) {
  const { board, col, row, isputstone } = param;
  if(!board) return "";

  // 石が置けるかをチェックする
  let isPut = 0;
  if (isputstone) {
    for (const el of isputstone) {
      isPut = el.row === row && el.col === col ? 1 : 0;
      if (isPut) break;
    }
  }

  return <Square value={board[col][row]} isput={isPut} {...param} />;
}

export const Row = (param) => {
  const { array, col } = param;
  return (
    <div className="row" key={col}>
      {col}
      {array.map((index) => (
        <RowDraw key={index} {...param} row={index} />
      ))}
    </div>
  );
};
