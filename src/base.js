import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['typescript', 'unicorn', 'oxc'],
  categories: { correctness: 'error' },
  env: { builtin: true },
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/*.min.js',
    '**/*.generated.*'
  ],
  rules: {
    'eslint/eqeqeq': ['error', 'always', { null: 'ignore' }],
    'eslint/no-debugger': 'error',
    'eslint/no-var': 'error',
    'eslint/prefer-const': 'error',
    'eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }
    ],
    'typescript/consistent-type-imports': 'error',
    'typescript/no-explicit-any': 'warn'
  }
});
