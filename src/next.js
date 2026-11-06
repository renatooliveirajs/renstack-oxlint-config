import { defineConfig } from 'oxlint';

import react from './react.js';

export default defineConfig({
  ...react,
  plugins: [...(react.plugins ?? []), 'nextjs'],
  env: { ...react.env, node: true },
  ignorePatterns: [
    ...(react.ignorePatterns ?? []),
    '**/.next/**',
    '**/out/**',
    '**/next-env.d.ts'
  ],
  rules: {
    ...react.rules,
    'nextjs/no-html-link-for-pages': 'error',
    'nextjs/no-img-element': 'warn',
    'nextjs/no-sync-scripts': 'error',
    'nextjs/no-head-element': 'error',
    'nextjs/no-head-import-in-document': 'error',
    'nextjs/no-document-import-in-page': 'error',
    'nextjs/no-duplicate-head': 'error',
    'nextjs/no-title-in-document-head': 'error',
    'nextjs/inline-script-id': 'error'
  }
});
