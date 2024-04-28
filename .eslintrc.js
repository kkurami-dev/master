module.exports = {
  env: {
    browser: true,
    es2021: true,
    "es6": true,
    "jasmine": true
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: 6,
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
      mjs: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'import'
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "no-param-reassign": ["error", { "props": false }],
    "react/jsx-filename-extension": [1, { "extensions": [
      //".js", ".jsx", ".ts", ".tsx", ".mjs", ".json",
      "js", "jsx", "ts", "tsx",
      //"mjs",
      "json"
    ]}],
  },
  settings: {
    "import/extensions": [
      //".js", ".jsx", ".ts", ".tsx", ".mjs", ".json",
      // "js", "jsx", "ts", "tsx",
      // "mjs", "json"
    ],
    "import/resolver": {
      node: { "extensions": [
        ".js", ".jsx", ".ts", ".tsx",
        //".mjs",
        ".json",
        //"js", "jsx", "ts", "tsx", "mjs", "json"
      ]},
      // "babel-module": {"extensions": [
      //   "js", "jsx", "ts", "tsx", "mjs", "json"
      // ]},
    }
  },
};
