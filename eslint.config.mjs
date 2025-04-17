import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  // Global Ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      'playwright-report/',
      '*.config.js',
      '*.config.cjs',
      '*.config.mjs',
      '*.d.ts',
    ],
  },

  // Base JS/TS config
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      eqeqeq: ['error', 'always'], // Enforce strict equality
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // Allow console in dev
    },
  },

  // TypeScript specific configuration
  ...tseslint.config({
    files: ['**/*.ts'], // Apply only to TypeScript files
    extends: [tseslint.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Override or add specific TS rules
      '@typescript-eslint/no-unused-vars': [
        // Enable TS version
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn', // Warn about using 'any'
      // Add any other TS-specific overrides here
    },
  }),

  // Jest specific configuration (Tests Unit/Integration)
  {
    files: ['**/*.test.ts', '**/*.spec.ts'], // test TS
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    // Optional: Integrate eslint-plugin-jest
    // plugins: {
    //   jest: jestPlugin,
    // },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },

  // Frontend JavaScript specific configuration
  {
    files: ['src/public/**/*.js'], // Only in JS public
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // Prettier Configuration
  pluginPrettierRecommended,
];
