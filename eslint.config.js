// Flat ESLint config. `eslint-config-expo` brings the React, React Native,
// hooks and import rules that suit an Expo app; we add Prettier on top so
// formatting is a lint error rather than an argument.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'ios/**',
      'android/**',
      // Generated from the database schema; not ours to format or lint.
      'src/lib/database.types.ts',
    ],
  },
  {
    // Scoped to TypeScript files: the @typescript-eslint plugin is only
    // registered for those, so setting its rules app-wide fails to resolve.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Unused variables are a mistake, except for the `_`-prefixed ones we
      // deliberately ignore when destructuring.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    rules: {
      // import/order keeps the import block readable without us thinking.
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
]);
