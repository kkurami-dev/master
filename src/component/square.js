export const Square = (param) => {
  const { value, isput1 } = param;
  const cls = isput1 ? 'put-square' : 'square';

  let color = null;
  if (value === 'x') color = 'player';
  else if (value === 'o') color = 'opponent';

  let nop = false;
  if (color !== null || param.disabled) nop = true;
  return (
    <button className={cls} type="button" {...param} disabled={nop}>
      <div className={color}></div>
    </button>
  );
};
