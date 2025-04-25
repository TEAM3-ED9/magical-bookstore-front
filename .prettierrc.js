/** @type {import('prettier').Options} */
export default {
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  jsxSingleQuote: true,
  bracketSameLine: false,
  singleAttributePerLine: true,
  endOfLine: 'auto',
  overrides: [
    {
      files: '*.{js,jsx,ts,tsx}',
      options: {
        parser: 'babel-ts'
      }
    }
  ]
}
