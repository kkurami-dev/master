module.exports = {
  // テスト対象のファイルのパターン
  testMatch: ['<rootDir>/src/**/*.test.js', '<rootDir>/src/**/*.test.jsx'],

  // Jestが処理するファイルの種類を指定
  moduleFileExtensions: ['js', 'jsx', 'json', 'node', 'mjs'],

  // テストの実行に使用する環境を指定
  testEnvironment: 'jsdom',

  // モックの自動クリーンアップを有効化
  clearMocks: true,

  // モジュールのパスのマッピングを設定
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // テストファイル内で import 文を解決するための設定
  modulePaths: ['<rootDir>'],

  // カバレッジのレポートを出力するディレクトリを指定
  coverageDirectory: 'coverage',

  // カバレッジの閾値を指定
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // テスト対象のファイル内で無視するパターンを指定
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/apigateway/', '/contracts/', '/coverage/'],

  // モックの設定
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],

  // 他の設定オプション...
};
