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
      a: 1,
      b: '3',
      c: [4, 5],
      d: {
        e: 6,
      },
    },
  ],
};
function mockFunc(key, param, callback) {
  const arr_main = paramMap[key];
  let mode_arr = null;

  const is_type = (a) => {
    if (Array.isArray(a)) return 'arr';
    if ('object' === typeof a) return 'map';
    return 'prim';
  };
  const re_set = () => {
    const obj = arr_main.shift();
    mode_arr = [{ f: Object.keys(obj), in: obj }];
  };

  re_set();
  while (arr_main.length || mode_arr.length) {
    const { f, in: a, b = param } = mode_arr[mode_arr.length - 1];
    const k = f.pop();
    if (undefined === k) {
      mode_arr.pop();
      if (mode_arr.length === 0) return a; // 結果を返す
      continue;
    }

    const obj_a = a[k];
    const type = is_type(obj_a);

    // パラメータに含まれるか
    if (!b[k] || type !== is_type(b[k])) {
      re_set();
      continue;
    }

    // オブジェクトでない場合は内容確認
    const obj_b = b[k];
    if (type === 'prim') {
      // 差異があるのでこの設定は使わない
      if (obj_a !== obj_b) {
        re_set();
      }
      // 同一なので次の確認へ
      continue;
    }

    // オブジェクト型なのでさらに詳細を確認
    mode_arr.push({ f: Object.keys(obj_a), in: obj_a, b: obj_b });
  }
  return false;
}

describe('renders learn react link', () => {
  it('a01', () => {
    const ret = mockFunc(
      'a',
      {
        a: 1,
        b: '3',
        c: [4, 5],
        d: {
          e: 6,
        },
      },
      null
    );
    expect(ret).to.equal(false);
  });
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
