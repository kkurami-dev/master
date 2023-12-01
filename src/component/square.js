export const Square = ({ value, isPutStone, onClick, disabled }) => {
  const cls = isPutStone ? 'put-square' : 'square';
  const color = value === 'x' ? 'player' : value === 'o' ? 'opponent' : '';
  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      <div className={color}></div>
    </button>
  );
};
