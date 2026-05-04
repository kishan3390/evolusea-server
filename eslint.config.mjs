// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

import importPlugin from 'eslint-plugin-import';
import { fixupPluginRules } from '@eslint/compat';
import checkFile from 'eslint-plugin-check-file';
import unicorn from 'eslint-plugin-unicorn';


export default tseslint.config(
  {
    ignores: [
      '**/dist/**/*',
      'aws/**/*',
      '.eslint.config.mts',
      'src/metadata.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['{src,apps,libs,test}/**/*.ts'],
    plugins: {
      'check-file': checkFile,
      'unicorn': unicorn,
    },
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          'case': 'kebabCase',
        }
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          '**/*': 'KEBAB_CASE'
        },
      ],
    },
  },
  {
    plugins: {
      'unused-imports': unusedImports,
      import: fixupPluginRules(importPlugin),
    },
    files: ['{src,apps,libs,test}/**/*.ts'],
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
        },
      ],
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*-spec.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['migrations/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
);
