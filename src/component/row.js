import { Square } from './square';

export const Row = ({ array, board, row, isPutStone, onClick, disabled }) => {
  return (
    <div className="row">
      {array.map((index) => {
        let isPut = false;

        // 石が置けるかをチェックする
        if (isPutStone) {
          for (const el of isPutStone) {
            isPut = el[0] === row && el[1] === index;
            if (isPut) break;
          }
        }

        return (
          <Square
            key={index}
            value={board[row][index]}
            isPutStone={isPut}
            putposition={[row, index]}
            onClick={() => onClick(row, index)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};
