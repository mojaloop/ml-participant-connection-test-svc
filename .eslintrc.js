module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    // project: 'tsconfig.json',
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': 'error',
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single', { allowTemplateLiterals: false }],
    indent: ['error', 2, { SwitchCase: 1 }],
    semi: ['off'], // coz there are lot of missing semicolons in code
  },
  env: {
    node: true,
    jest: true,
  },
  overrides: [
    {
      files: ['test/**/*.ts'],
      env: {
        jest: true,
      },
      rules: {
        // add here any rules specific to test files
      },
    },
    {
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
      files: ['./**/*.js'],
    },
  ],
};
