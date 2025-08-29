import path from 'path';
import { fileURLToPath } from 'url';

import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Ignores
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      '.vercel/**',
      'supabase/**'
    ]
  },

  // Base JS rules
  js.configs.recommended,

  // Next.js rules (core web vitals) + a11y
  {
    plugins: {
      '@next/next': nextPlugin,
      'jsx-a11y': jsxA11y
    },
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...jsxA11y.configs.recommended.rules,
      // Relax a few a11y rules that are too strict for this app
      'jsx-a11y/no-autofocus': 'warn'
    }
  },

  // Global plugin setup and common rules
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      'unused-imports': unusedImports,
      unicorn,
      sonarjs,
      security
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        Request: 'readonly',
        Response: 'readonly'
      }
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        },
        node: true,
        alias: {
          map: [['@', './src']],
          extensions: ['.ts', '.tsx', '.js', '.jsx']
        }
      }
    },
    rules: {
      // General safety & clarity
      'no-alert': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],

      // import hygiene
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/no-duplicates': 'error',
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        pathGroups: [
          { pattern: '@/**', group: 'internal', position: 'before' }
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true }
      }],

      // unused imports/vars (prefer plugin for auto-fix)
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],

      // unicorn: pragmatic defaults for web apps
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': ['error', {
        cases: { kebabCase: true, pascalCase: true, camelCase: true },
        ignore: ['^next\\.config\\.ts$', '^postcss\\.config\\.mjs$', '^eslint\\.config\\.js$']
      }],
      'unicorn/no-null': 'off',
      // This can be noisy in React hooks/components
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-array-reduce': 'off',

      // sonarjs for code quality
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 20],

      // security
      // Turn off noisy rule that often flags safe keyed access in TS
      'security/detect-object-injection': 'off'
    }
  },

  // TypeScript-specific rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      // In TS files, rely on TS for undefined checking
      'no-undef': 'off',

      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports'
      }],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-floating-promises': ['warn', { ignoreVoid: true, ignoreIIFE: true }],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },

  // Node scripts: permit console and relax async checks
  {
    files: ['scripts/**/*.ts', 'scripts/**/*.js'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-floating-promises': 'off'
    }
  },

  // JavaScript-only files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    rules: {
      'no-var': 'error'
    }
  }
];