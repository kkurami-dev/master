module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    //'airbnb',
    //'airbnb-typescript',
    "prettier",
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    //project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    "react-hooks",
    '@typescript-eslint',
  ],
  rules: {
    "react-hooks/exhaustive-deps": "error",
    "react/jsx-no-bind": "error",
    "react/react-in-jsx-scope": "off",
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx", '.ts', '.tsx'] }],
  },
  settings: {
    "import/extensions": [".js", ".jsx", ".ts", ".tsx", "mjs"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx", "mjs"]
    },
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx", "mjs"]
      }
    }
  },
};
