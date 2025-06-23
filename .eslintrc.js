module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint"
  ],
  env: {
    jest: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parserOptions: {
    ecmaVersion: 10,
    project: "./tsconfig.eslint.json"
  },
  rules: {
    "@typescript-eslint/comma-dangle": [
      "error",
      "always-multiline"
    ],
    "@typescript-eslint/no-use-before-define": [
      "error",
      {
        functions: false
      }
    ],
    "max-len": "off",
    "@typescript-eslint/quotes": [
      "error",
      "double",
      {
        avoidEscape: true,
        allowTemplateLiterals: false
      }
    ],
    "@typescript-eslint/no-var-requires": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "import/prefer-default-export": "off"
  }
}