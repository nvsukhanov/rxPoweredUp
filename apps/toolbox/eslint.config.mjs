/* eslint-disable */
import { defineConfig } from 'eslint/config';
import baseConfig from '../../eslint.config.mjs';
import nx from '@nx/eslint-plugin';

export default defineConfig([
  ...baseConfig,
  {
    rules: {
      '@nx/dependency-checks': 'error',
    },
  },
  nx.configs['flat/react-typescript'],
]);
