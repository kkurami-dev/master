export const Square = (param) => {
  const { value, isput1 } = param;
  const cls = isput1 ? 'put-square' : 'square';

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

  let nop = false;
  if (color !== null || param.disabled) nop = true;

  return (
    <button className={cls} type="button" {...param} disabled={nop}>
      <div className={color}>{now}</div>
    </button>
  );
};
