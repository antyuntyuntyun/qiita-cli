module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    es6: true,
    node: true,
  },
  rules: {},
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018, // Node.js 12の場合は2019、他のバージョンのNode.jsを利用している場合は場合は適宜変更する
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    // 'prettier/@typescript-eslint',
    'prettier',
  ],
};
