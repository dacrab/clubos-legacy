module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'next/typescript'],
  plugins: ['unused-imports'],
  ignorePatterns: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '*.config.{js,ts}',
    'drizzle/**',
  ],
  rules: {
    // Custom rules for better code quality
    'no-console': 'warn',
    'no-empty-pattern': 'off', // Disable empty pattern rule
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-duplicate-imports': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};
