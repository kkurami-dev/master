/**
 * 一つのマスの制御
 */
export const Square = param => {
  const {value, isput} = param;
  const cls = isput ? 'put-square' : 'square';

  let now = '';
  let color = null;
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
    color = null;
    break;
  }
  // Console.log("Square set", color, param.value);


  let nop = false;
  if (color !== null || param.disabled) {
    nop = true;
  }

  const {col, row, onClick} = param;
  const input = {col, row, onClick};
  return (
    <button className={cls}
            type="button"
            {...input}
            disabled={nop}
            name={`act_${value.v}`}
    >
      <div className={color}>{now.c}</div>
    </button>
  );
};
