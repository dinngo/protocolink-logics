module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  rules: {
    'max-len': ['error', { code: 120, ignoreUrls: true }],
  },
};
