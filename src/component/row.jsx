/**
 * 横一列の制御
 */
import Square from './square';

function RowDraw(param) {
  const { board, col, row, isputstone, onClick } = param;
  if (!board) {
    return '';
  }

  // 石が置けるかをチェックする
  let isPut = false;
  if (isputstone) {
    isPut = isputstone.some((el) => el.row === row && el.col === col ? 1 : 0);
    // for (const el of isputstone) {
    //   isPut = el.row === row && el.col === col ? 1 : 0;
    //   if (isPut) {
    //     break;
    //   }
    // }
  }

  return <Square value={board[col][row]} isput={isPut} col={col} row={row} onClick={onClick} />;
}

export default function Row(param) {
  const { array, col, row, board, isputstone, onClick } = param;
  return (
    <div className="row" key={col}>
      <div className="col-num">{col}</div>
      {array.map((index) => (
        <RowDraw key={index}
                 board={board}
                 col={col}
                 row={row}
                 isputstone={isputstone}
                 onClick={onClick}
                 />
      ))}
    </div>
  );
}
