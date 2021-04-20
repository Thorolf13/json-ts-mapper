module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'typescript'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'eqeqeq': ['error', 'always', { 'null': 'ignore' }],
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'semi': ['error', 'always'],
    'space-before-function-paren': ['error', 'always'],
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
};
