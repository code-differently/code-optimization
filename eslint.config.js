// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup compatibility layer for older configs
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Define ignore patterns
const ignorePatterns = [
  // Build artifacts and dependencies
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/build/**',
  '**/out/**',

  // Type declaration files
  '**/next-env.d.ts',
  '**/*.d.ts',
  '**/*.js.map',
  '**/*.tsbuildinfo',

  // Generated files
  '**/version.json',
  'packages/*/version.ts',
  'packages/web-fe/lib/version.ts',
  'packages/api/src/version.ts',
  'packages/db/generated/**',
  'packages/db/prisma/client/**',

  // Asset directories
  '**/public/**',

  // Editor and system files
  '**/.vscode/**',
  '**/.idea/**',
  '**/.DS_Store',

  // Config files
  '**/.eslintrc.cjs',
  '**/.eslintrc.js',
  '**/.eslintrc.js.bak',
  '**/.eslintrc.cjs.bak',
  '**/eslint.config.js.bak',
  '**/eslint.config.package.json',
];

export default [
  // Base ESLint recommended rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // We're not including Google style config due to compatibility issues with ESLint v9

  // Apply to all JavaScript and TypeScript files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'warn',
      'react/no-unknown-property': ['error', { ignore: ['cmdk-input-wrapper'] }],

      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // General rules
      'no-unused-vars': 'off', // Using TypeScript version instead
      'no-invalid-this': 'off',
      camelcase: 'warn',
      'max-len': [
        'error',
        {
          code: 100,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      'new-cap': [
        'error',
        {
          capIsNew: false,
          newIsCap: true,
          newIsCapExceptions: ['jsPDF'],
        },
      ],

      // React hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Web frontend specific configuration
  {
    files: ['packages/web-fe/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      '@next/next/no-html-link-for-pages': ['warn', 'packages/web-fe/app'],
      'react/no-unescaped-entities': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      next: {
        rootDir: 'packages/web-fe/',
      },
    },
  },

  // API specific configuration
  {
    files: ['packages/api/**/*.ts'],
    rules: {
      // Temporarily allow any types in API for backward compatibility
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Ignore patterns
  {
    ignores: ignorePatterns,
  },
];
