// @ts-check
const tseslint = require("typescript-eslint");
const rootConfig = require("../../eslint.config.js");

module.exports = tseslint.config(
  ...rootConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // Angular 20's generator no longer appends "Component" to the root class name (App, not AppComponent).
      // The suffix requirement is a carry-over from older style guides and is disabled here to match current Angular conventions.
      "@angular-eslint/component-class-suffix": "off",
    },
  },
  {
    files: ["**/*.html"],
    rules: {},
  }
);
