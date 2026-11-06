import { defineConfig } from 'oxlint';

import base from './base.js';

export default defineConfig({
  ...base,
  plugins: [...(base.plugins ?? []), 'react', 'jsx-a11y'],
  env: { ...base.env, browser: true },
  rules: {
    ...base.rules,
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'warn',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error'
  }
});
