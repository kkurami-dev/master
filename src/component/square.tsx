/**
 * 一つのマスの制御
 */
export type ISquare  = {
  isput: boolean;
  value: string;
  col: number;
  row: number;
  onClick: any;
  disabled?: boolean;
}

export default function Square(param: ISquare): VFC {
  const { value, isput } = param;
  const cls = isput ? 'put-square' : 'square';

  let now = '';
  let color = '';
  switch (value.Val) {
    case 'O':
      now = value;
      color = 'opponent';
      break;
    case 'o':
      color = 'opponent';
      break;
    case 'X':
      now = value;
      color = 'player';
      break;
    case 'x':
      color = 'player';
      break;
    default:
      color = '';
      break;
  }
  // Console.log("Square set", color, param.value);

  let nop = false;
  if (color !== '' ||
      param?.disabled ) {
    nop = true;
  }

  const { col, row, onClick } = param;
  return (
    <button className={cls}
            data-col={col} data-row={row}
            onClick={onClick}
            type="button"
            disabled={nop}
            name={`act_${value.v}`}>
      <div className={color}>{now.c}</div>
    </button>
  );
}
