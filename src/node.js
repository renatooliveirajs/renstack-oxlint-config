import { defineConfig } from 'oxlint';

import base from './base.js';

export default defineConfig({
  ...base,
  plugins: [...(base.plugins ?? []), 'node'],
  env: { ...base.env, node: true, browser: false },
  rules: {
    ...base.rules,
    'node/no-new-require': 'error',
    'node/no-exports-assign': 'error'
  }
});
