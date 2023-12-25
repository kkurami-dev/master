import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from '../../src/component/board';

// setTimeoutをモック化
jest.useFakeTimers();

describe('Board Component', () => {
  it('renders without crashing', () => {
    render(<Board />);
  });

  it('handles square click', async () => {
    const { getByText } = render(<Board />);
    
    // ここにクリックのテストを記述

    // テスト中に発生する非同期のsetTimeoutを実行
    act(() => {
      jest.runAllTimers();
    });

    // テストが成功するまで待機
    await waitFor(() => {
      // 期待される結果を検証
    });
  });

  it('handles reset click', async () => {
    const { getByText } = render(<Board />);
    
    // ここにリセットのテストを記述

    // テスト中に発生する非同期のsetTimeoutを実行
    act(() => {
      jest.runAllTimers();
    });

    // テストが成功するまで待機
    await waitFor(() => {
      // 期待される結果を検証
    });
  });

  // 他のテストケースも同様に追加
});
