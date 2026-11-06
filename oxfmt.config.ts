import config from './src/oxfmt.js';

export default {
  ...config,
  // Mantém o formato gerado pelo Release Please.
  ignorePatterns: [...config.ignorePatterns, 'CHANGELOG.md']
};
