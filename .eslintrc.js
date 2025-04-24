/** @type {import('eslint').Linter.Config} */
export default {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsdoc/recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react', 'jsx-a11y', '@typescript-eslint', 'jsdoc'],
  rules: {
    // Semicolon rules
    semi: ['error', 'never'],
    'semi-spacing': ['error', { before: false, after: false }],

    // Corrected unused vars rule (changed from 'no-used-vars' to 'no-unused-vars')
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        argsIgnorePattern: '/^[A-Z_]/u',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }
    ],

    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    // TypeScript rules
    '@typescript-eslint/no-floating-promises': 'error',

    // JSDoc rules
    'jsdoc/require-param-type': 'off',
    'jsdoc/require-returns-type': 'off',

    // Accessibility rules
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton']
      }
    ]
  },
  settings: {
    react: {
      version: 'detect'
    },
    jsdoc: {
      mode: 'typescript'
    }
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off'
      }
    }
  ],
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/tests/**']
}
