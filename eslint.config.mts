import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // Base JS
  js.configs.recommended,

  // TypeScript
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js}'],

    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },

    plugins: {
      import: importPlugin
    },

    rules: {
      // 🔥 Estilo Airbnb-like (adaptado)
      'no-console': 'warn',
      'no-debugger': 'warn',

      // Imports organizados
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal'],
          'newlines-between': 'always'
        }
      ],

      // TypeScript
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Boas práticas
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all']
    }
  },

  // 🔥 Prettier SEM conflito com ESLint
  prettier
]);
