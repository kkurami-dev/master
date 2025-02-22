import globals from "globals"; // グローバル変数設定
import pluginJs from "@eslint/js"; // JavaScript推奨設定
import tseslint from "typescript-eslint"; // TypeScript用の設定
import pluginReact from "eslint-plugin-react"; // React用の設定
import prettier from "eslint-config-prettier"; // Prettier設定を無効化

import stylistic from '@stylistic/eslint-plugin';

const dirname = import.meta.dirname ?? path.dirname(filename);

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,jsx}"], // 対象ファイルを指定
    languageOptions: {
      parser: tseslint.parser, // TypeScript用パーサー
      globals: globals.browser, // ブラウザ環境のグローバル変数
    },
    plugins: {
      typescript: tseslint, // TypeScriptプラグイン

      '@stylistic': stylistic,
    },
    rules: {
      // 各種推奨ルールを適用
      ...pluginJs.configs.recommended.rules, // JavaScript推奨ルール
      ...tseslint.configs.recommended.rules, // TypeScript推奨ルール
      ...pluginReact.configs.flat.recommended.rules, // React推奨ルール
      "no-console": "warn", // consoleの使用を警告
    },
  },
  {
    // Prettierによる競合するフォーマットルールを無効化
    rules: {
      ...prettier.rules,
    },
  },
];
