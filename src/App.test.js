//import { describe } from 'jest';
/*
 * Import { render, screen } from '@testing-library/react';
 * import App from './App';
 */

/*
 * Test('renders learn react link', () => {
 * render(<App />);
 * const linkElement = screen.getByText(/learn react/i);
 * expect(linkElement).toBeInTheDocument();
 * });
 */

const paramMap = {
  a: [
    {
      a: 1,
      b: '2',
      c: [1, 2],
      d: {
        e: 1,
      },
    },
    {
      a: 2,
      b: '3',
      c: [4, 5],
      d: {
        e: 6,
      },
    },
  ],
};
function mockFunc(key, param, callback) {
  const is_type = (a) => {
    if (Array.isArray(a)) return 'arr';
    if ('object' === typeof a) return 'map';
    return 'prim';
  };

  const arr_main = paramMap[key];
  const mode_app = [{ f: Object.keys(arr_main[0]), in: arr_main[0] }];

  while (arr_main.length > 0) {
    const { f, in:a, b = param } = mode_app[mode_app.length - 1];
    const k = f.pop();
    if (undefined === k) {
      mode_app.pop();
      if( mode_app.length === 0 ) return a;// 結果を返す
      continue;
    }

    const obj_a = a[k];
    const type = is_type(obj_a);

    // パラメータに含まれるか
    if (!b[k] || type !== is_type(b[k])) {
      arr_main.pop();
      continue;
    }

    // オブジェクトでない場合は内容確認
    const obj_b = param[k];
    if (type === 'prim'){
      // 差異があるのでこの設定は使わない
      if(obj_a !== obj_b) {
        arr_main.pop();
      }
      // 同一なので次の確認へ
      continue;
    }

    // オブジェクト型なのでさらに詳細を確認
    mode_app.push({ f: Object.keys(obj_a), a: obj_a, b: obj_b });
  }
  return false;
}

describe('renders learn react link', () => {
  it('a01', () => {
    const ret = mockFunc(
      'a',
      {
        a: 1,
        b: '2',
        c: [1, 2],
        d: {
          e: 1,
        },
      },
      null
    );
    expect(ret).to.equal(false);
  });
  it('a002', () => {
    const ret = mockFunc('a', { a: 0 }, null);
    expect(ret).to.equal(false);
  });
});
