import { defineConfig, globalIgnores } from 'eslint/config';
import nx from '@nx/eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import myCommonRules from '@nvsukhanov/eslint-config-common';
import typescriptEslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['node_modules', 'docs']),
  {
    plugins: {
      '@nx': nx,
      '@stylistic': stylistic,
    },
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    extends: [myCommonRules],
  },
  {
    languageOptions: {
      parser: typescriptEslint.parser,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],

          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    languageOptions: {
      parser: typescriptEslint.parser,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.base.json'],
        },

        node: {
          project: ['./tsconfig.base.json'],
        },
      },

      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/extensions': ['.ts'],
    },
    rules: {
      'import/order': [
        'error',
        {
          'groups': [['external', 'internal']],

          'pathGroups': [
            {
              pattern: '@app/**',
              group: 'external',
              position: 'after',
            },
          ],

          'newlines-between': 'always',
          'distinctGroup': false,
        },
      ],
    },
  },
]);
